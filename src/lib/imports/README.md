# Import Service Documentation

## Overview

The import service handles fetching and importing Google Search Console (GSC) data into the `queries` table. Each record represents metrics for a specific **URL + query combination** on a given date.

**Important**: GSC data has a 3-day delay. The import service automatically fetches data from 3 days prior to the current date.

## Key Points

- **Query is NOT unique**: The same search query can appear multiple times with different URLs
- **Unique key**: `(date, query_text, url)` combination is unique in the database
- **Data storage**: Query text is stored in lowercase for consistency
- **Opportunity detection**: Automatically computed based on business rules
- **Deduplication**: Handled by data provider; import service assumes clean data

## Expected Data Format

The import source must provide JSON data in the following format:

```json
[
  {
    "date": "2025-10-09",
    "query": "best seo tools",
    "url": "https://example.com/seo-tools",
    "impressions": 1500,
    "clicks": 45,
    "avg_position": 8.5
  },
  {
    "date": "2025-10-09",
    "query": "best seo tools",
    "url": "https://example.com/blog/seo-guide",
    "impressions": 800,
    "clicks": 12,
    "avg_position": 12.3
  }
]
```

**Note**: If today is 2025-10-12, the import will fetch `data_20251009.json` (3 days ago).

### Field Descriptions

- `date`: ISO date string (YYYY-MM-DD) - represents the data date (3 days ago)
- `query`: Search query text (will be stored lowercase)
- `url`: Landing page URL
- `impressions`: Number of times the page appeared in search results (integer >= 0)
- `clicks`: Number of clicks received (integer >= 0)
- `avg_position`: Average search position (float >= 1, lower is better)

**Note**: CTR is calculated automatically from `clicks / impressions` and is not provided in the source data.

## Opportunity Detection

Records are automatically flagged as opportunities based on these criteria:

```
is_opportunity = impressions > 1000 AND ctr < 0.01 AND position >= 5 AND position <= 15
```

This identifies queries with:
- High visibility (>1000 impressions)
- Low click-through rate (<1%)
- Good but not great position (5-15)

These represent "low-hanging fruit" for SEO optimization.

## Import Process

1. **URL Building**: Construct source URL for data from 3 days ago (e.g., `data_20251009.json`)
2. **Fetch**: Download JSON data from configured source URL
3. **Validate**: Check data structure and field types
4. **Transform**: Convert to database schema, calculate CTR, compute opportunity flag
5. **Batch Insert**: Insert records in batches of 1000 (data provider handles deduplication)

## Error Handling

The service is designed to be resilient:

- **Partial failures**: If <10% of records fail validation, import continues
- **Timeouts**: Strict timeout enforcement (default 30s)
- **Size limits**: Maximum 50MB response size
- **Duplicate handling**: Handled by data provider; assumes clean source data

## Configuration

Environment variables:

- `IMPORT_SOURCE_BASE_URL`: Base URL for import data (required, HTTPS only)
- `IMPORT_FETCH_TIMEOUT_MS`: Fetch timeout in milliseconds (default: 30000)
- `IMPORT_MAX_BYTES`: Maximum response size in bytes (default: 50000000)

## Example Usage

### Sample Test Data

If today is 2025-10-12, create a file `data_20251009.json` (3 days ago) with:

```json
[
  {
    "date": "2025-10-09",
    "query": "javascript tutorial",
    "url": "https://example.com/js-tutorial",
    "impressions": 2500,
    "clicks": 15,
    "avg_position": 8.2
  },
  {
    "date": "2025-10-09",
    "query": "javascript tutorial",
    "url": "https://example.com/blog/learn-js",
    "impressions": 1800,
    "clicks": 45,
    "avg_position": 5.5
  },
  {
    "date": "2025-10-09",
    "query": "react hooks explained",
    "url": "https://example.com/react-hooks",
    "impressions": 3200,
    "clicks": 25,
    "avg_position": 11.0
  }
]
```

### Expected Result

After import, the `queries` table will contain 3 records with calculated CTR:
- First record: `ctr = 0.006` (15/2500), `is_opportunity = true` (high impressions, low CTR, good position)
- Second record: `ctr = 0.025` (45/1800), `is_opportunity = false` (CTR too high at 2.5%)
- Third record: `ctr = 0.0078` (25/3200), `is_opportunity = true` (meets all criteria)

## Database Schema

Records are inserted into the `queries` table with this structure:

```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  query_text TEXT NOT NULL,  -- stored lowercase
  url TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  ctr NUMERIC NOT NULL,
  avg_position NUMERIC NOT NULL,
  is_opportunity BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, lower(query_text), url)
);
```

The unique constraint ensures no duplicate combinations of date, query, and URL.

