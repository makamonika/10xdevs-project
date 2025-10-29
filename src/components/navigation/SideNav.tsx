import { useState, useEffect } from "react";
import { Search, FolderOpen, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    icon: Search,
    label: "Queries",
    route: "/queries",
  },
  {
    icon: FolderOpen,
    label: "Groups",
    route: "/groups",
  },
];

export function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Set current path on mount (client-side only)
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors md:hidden"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleMobileMenu} aria-hidden="true" />
      )}

      {/* Side Navigation */}
      <nav
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          // Desktop styles
          "hidden md:flex",
          isCollapsed ? "md:w-16" : "md:w-64",
          // Mobile styles
          "fixed md:static inset-y-0 left-0 z-40 w-64",
          isMobileOpen ? "flex" : "hidden md:flex"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && <h1 className="text-lg font-semibold text-sidebar-foreground">SEO Insights</h1>}
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors",
              "hidden md:block",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath && (currentPath === item.route || currentPath.startsWith(item.route + "/"));

              return (
                <li key={item.route}>
                  <a
                    href={item.route}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0")} aria-hidden="true" />
                    {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={cn(
                          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                          isActive
                            ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                            : "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to content
        </a>
      </nav>
    </>
  );
}
