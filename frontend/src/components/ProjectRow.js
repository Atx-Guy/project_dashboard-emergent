import { Edit2, Trash2, Archive, ArchiveRestore, ExternalLink, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const ProjectRow = ({ project, onEdit, onDelete, onToggleArchive, onBuild }) => {
  const getPriorityClass = () => {
    if (project.priority === "Low") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (project.priority === "High") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  };

  const getStatusClass = () => {
    if (project.status === "In Progress") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (project.status === "Completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (project.status === "On Hold") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getTagClass = (idx) => {
    const mod = idx % 4;
    if (mod === 1) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (mod === 2) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (mod === 3) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div 
      className={`border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors p-4 group ${
        project.archived ? "opacity-50" : ""
      }`}
      data-testid={`project-row-${project.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium tracking-tight truncate" data-testid="project-name">
              {project.name}
            </h3>
            
            {project.archived && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ring-gray-500/10 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Archived
              </span>
            )}
            
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ring-gray-500/10 ${getStatusClass()}`} data-testid="project-status">
              {project.status}
            </span>
            
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset ring-gray-500/10 ${getPriorityClass()}`} data-testid="project-priority">
              {project.priority}
            </span>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid="project-description">
              {project.description}
            </p>
          )}

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono ${tagColors[index % tagColors.length]}`}
                  data-testid={`project-tag-${index}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span data-testid="project-last-updated">
              Updated {formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true })}
            </span>
            
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-testid="project-url"
              >
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                View Repo
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBuild(project.id, project.name)}
            className="border border-dashed border-blue-500/40 text-blue-600 hover:bg-blue-50 hover:border-solid hover:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-all rounded-sm px-3 py-1 text-xs font-mono uppercase"
            data-testid="build-button"
          >
            <Hammer className="h-3 w-3 mr-1" strokeWidth={1.5} />
            Build
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(project)}
            data-testid="edit-button"
          >
            <Edit2 className="h-4 w-4" strokeWidth={1.5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleArchive(project.id, !project.archived)}
            data-testid="archive-button"
          >
            {project.archived ? (
              <ArchiveRestore className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Archive className="h-4 w-4" strokeWidth={1.5} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(project.id)}
            className="text-destructive hover:text-destructive"
            data-testid="delete-button"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectRow;
