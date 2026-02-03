import ProjectRow from "@/components/ProjectRow";

const ProjectList = ({ projects, loading, onEdit, onDelete, onToggleArchive, onBuild }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="loading-state">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" data-testid="empty-state">
        <img
          src="https://images.unsplash.com/photo-1768578718801-2086a673f15e?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="No projects"
          className="w-64 h-64 object-cover rounded-md mb-6 opacity-40 dark:hidden"
        />
        <img
          src="https://images.unsplash.com/photo-1760143769777-66e289e78ae9?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="No projects"
          className="w-64 h-64 object-cover rounded-md mb-6 opacity-40 hidden dark:block"
        />
        <h3 className="text-2xl font-medium mb-2">No projects found</h3>
        <p className="text-muted-foreground">Create your first project to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden" data-testid="projects-list">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleArchive={onToggleArchive}
          onBuild={onBuild}
        />
      ))}
    </div>
  );
};

export default ProjectList;
