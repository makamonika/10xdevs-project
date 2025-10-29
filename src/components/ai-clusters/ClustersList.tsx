import { ClusterCard } from "./ClusterCard";
import { Checkbox } from "@/components/ui/checkbox";
import type { AIClusterViewModel } from "@/hooks/useAIClustersSuggestions";
import type { QueryDto } from "@/types";

export interface ClustersListProps {
  clusters: AIClusterViewModel[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenEdit: (id: string) => void;
  onDiscard: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onUpdateQueries: (clusterId: string, queries: QueryDto[]) => void;
}

/**
 * Grid/list of cluster cards with select-all functionality
 */
export function ClustersList({
  clusters,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenEdit,
  onDiscard,
  onRename,
  onUpdateQueries,
}: ClustersListProps) {
  const allSelected = clusters.length > 0 && selectedIds.size === clusters.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < clusters.length;

  const handleSelectAllChange = () => {
    if (allSelected || someSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  return (
    <div>
      {/* Select All Header */}
      {clusters.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-4 rounded-lg border bg-muted/30">
          <Checkbox
            checked={allSelected || someSelected}
            onCheckedChange={handleSelectAllChange}
            aria-label="Select all clusters"
          />
          <span className="text-sm font-medium">
            {allSelected ? "Deselect all" : someSelected ? `${selectedIds.size} selected` : "Select all"}
          </span>
        </div>
      )}

      {/* Clusters Grid */}
      <div className="grid gap-6">
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            isSelected={selectedIds.has(cluster.id)}
            queries={cluster.queries}
            onToggleSelect={() => onToggleSelect(cluster.id)}
            onOpenEdit={() => onOpenEdit(cluster.id)}
            onDiscard={() => onDiscard(cluster.id)}
            onRename={(name) => onRename(cluster.id, name)}
            onRemoveQuery={(queryId) => {
              const updatedQueries = cluster.queries.filter((q) => q.id !== queryId);
              onUpdateQueries(cluster.id, updatedQueries);
            }}
          />
        ))}
      </div>
    </div>
  );
}
