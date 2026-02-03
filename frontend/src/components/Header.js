import { Plus, Search, Moon, Sun, Filter } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = ({
  onAddProject,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  selectedStatus,
  setSelectedStatus,
  allTags,
  allStatuses,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-semibold tracking-tight" data-testid="app-title">
            Project Logger
          </h1>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="theme-toggle-button"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Moon className="h-5 w-5" strokeWidth={1.5} />
              )}
            </Button>
            
            <Button
              onClick={onAddProject}
              className="gap-2"
              data-testid="add-project-button"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Add Project
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-none focus:ring-0 text-base"
              data-testid="search-input"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[160px]" data-testid="status-filter">
              <Filter className="h-4 w-4 mr-2" strokeWidth={1.5} />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {allStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[160px]" data-testid="tag-filter">
              <Filter className="h-4 w-4 mr-2" strokeWidth={1.5} />
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;
