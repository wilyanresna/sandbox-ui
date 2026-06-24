package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
	"gorm.io/gorm"
)

type projectRepository struct {
	db *gorm.DB
}

// NewProjectRepository instantiates the GORM repository for projects
func NewProjectRepository(db *gorm.DB) domain.ProjectRepository {
	return &projectRepository{db: db}
}

func (r *projectRepository) Fetch(ctx context.Context) ([]domain.Project, error) {
	var projects []domain.Project
	// In list query, omit heavy CanvasState data for dashboard performance
	err := r.db.WithContext(ctx).Select("id", "name", "color_pack_id", "created_at", "updated_at").Order("updated_at desc").Find(&projects).Error
	return projects, err
}

func (r *projectRepository) GetByID(ctx context.Context, id uuid.UUID) (domain.Project, error) {
	var project domain.Project
	err := r.db.WithContext(ctx).First(&project, "id = ?", id).Error
	return project, err
}

func (r *projectRepository) Create(ctx context.Context, project *domain.Project) error {
	return r.db.WithContext(ctx).Create(project).Error
}

func (r *projectRepository) Update(ctx context.Context, project *domain.Project) error {
	return r.db.WithContext(ctx).Save(project).Error
}

func (r *projectRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Project{}, "id = ?", id).Error
}
