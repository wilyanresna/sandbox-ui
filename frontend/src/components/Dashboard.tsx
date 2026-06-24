import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { type Project } from '../types';

export const Dashboard: React.FC = () => {
  const {
    projects,
    colorPacks,
    loading,
    fetchProjects,
    fetchColorPacks,
    createProject,
    deleteProject,
    selectProject,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchColorPacks();
  }, [fetchProjects, fetchColorPacks]);

  // Set default selected pack when color packs load
  useEffect(() => {
    if (colorPacks.length > 0 && !selectedPackId) {
      setSelectedPackId(colorPacks[0].id);
    }
  }, [colorPacks, selectedPackId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedPackId) return;

    const newProj = await createProject(projectName.trim(), selectedPackId);
    if (newProj) {
      selectProject(newProj);
      setIsModalOpen(false);
      setProjectName('');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon"></div>
          <h1>Canvas UI & Color Manager</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Project
        </button>
      </header>

      <main className="dashboard-main">
        <section className="projects-section">
          <h2>Your Projects</h2>
          {loading ? (
            <div className="loading-state">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects found. Create one to get started!</p>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
                New Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project: Project) => {
                const pack = colorPacks.find((p) => p.id === project.color_pack_id);
                return (
                  <div key={project.id} className="project-card" onClick={() => selectProject(project)}>
                    <div className="project-card-header">
                      <h3>{project.name}</h3>
                      <button
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProject(project.id);
                          }
                        }}
                        title="Delete Project"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="project-card-body">
                      <div className="meta-item">
                        <span className="meta-label">Color Pack:</span>
                        <span className="meta-value">{pack?.name || 'Unknown'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Updated:</span>
                        <span className="meta-value">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="proj-name">Project Name</label>
                <input
                  id="proj-name"
                  type="text"
                  placeholder="e.g., Mobile Dashboard Mockup"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="color-pack">Select Color Pack</label>
                <select
                  id="color-pack"
                  value={selectedPackId}
                  onChange={(e) => setSelectedPackId(e.target.value)}
                  required
                >
                  {colorPacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name} ({pack.tokens.length} tokens)
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
