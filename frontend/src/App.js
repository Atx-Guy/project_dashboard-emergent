import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import ProjectList from "@/components/ProjectList";
import AddProjectModal from "@/components/AddProjectModal";
import EditProjectModal from "@/components/EditProjectModal";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async (search = "", tag = "", status = "") => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (tag) params.append("tag", tag);
      if (status) params.append("status", status);
      
      const response = await axios.get(`${API}/projects?${params.toString()}`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(searchQuery, selectedTag, selectedStatus);
  }, [searchQuery, selectedTag, selectedStatus]);

  const handleAddProject = async (projectData) => {
    try {
      await axios.post(`${API}/projects`, projectData);
      toast.success("Project added successfully");
      fetchProjects(searchQuery, selectedTag, selectedStatus);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      await axios.put(`${API}/projects/${projectId}`, projectData);
      toast.success("Project updated successfully");
      fetchProjects(searchQuery, selectedTag, selectedStatus);
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success("Project deleted successfully");
      fetchProjects(searchQuery, selectedTag, selectedStatus);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  const handleToggleArchive = async (projectId, archived) => {
    try {
      await axios.patch(`${API}/projects/${projectId}/archive`, { archived });
      toast.success(archived ? "Project archived" : "Project unarchived");
      fetchProjects(searchQuery, selectedTag, selectedStatus);
    } catch (error) {
      console.error("Error toggling archive:", error);
      toast.error("Failed to update project");
    }
  };

  const handleBuildProject = async (projectId, projectName) => {
    try {
      const response = await axios.post(`${API}/projects/${projectId}/build`);
      toast.success(`Building: ${projectName}`);
    } catch (error) {
      console.error("Error building project:", error);
      toast.error("Failed to build project");
    }
  };

  const allTags = [...new Set(projects.flatMap(p => p.tags))].sort();
  const allStatuses = ["Not Started", "In Progress", "Completed", "On Hold"];

  return (
    <ThemeProvider defaultTheme="light" storageKey="project-logger-theme">
      <div className="min-h-screen bg-background">
        <Header 
          onAddProject={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          allTags={allTags}
          allStatuses={allStatuses}
        />
        
        <main className="max-w-5xl mx-auto px-6 py-8">
          <ProjectList
            projects={projects}
            loading={loading}
            onEdit={setEditingProject}
            onDelete={handleDeleteProject}
            onToggleArchive={handleToggleArchive}
            onBuild={handleBuildProject}
          />
        </main>

        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProject}
        />

        {editingProject && (
          <EditProjectModal
            isOpen={!!editingProject}
            onClose={() => setEditingProject(null)}
            onUpdate={handleUpdateProject}
            project={editingProject}
          />
        )}

        <Toaster position="bottom-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
