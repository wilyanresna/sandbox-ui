package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
)

type projectUsecase struct {
	projectRepo   domain.ProjectRepository
	colorPackRepo domain.ColorPackRepository
}

// NewProjectUsecase instantiates the business logic service for projects
func NewProjectUsecase(projectRepo domain.ProjectRepository, colorPackRepo domain.ColorPackRepository) domain.ProjectUsecase {
	return &projectUsecase{
		projectRepo:   projectRepo,
		colorPackRepo: colorPackRepo,
	}
}

func (u *projectUsecase) Fetch(ctx context.Context) ([]domain.Project, error) {
	return u.projectRepo.Fetch(ctx)
}

func (u *projectUsecase) GetByID(ctx context.Context, id uuid.UUID) (domain.Project, error) {
	return u.projectRepo.GetByID(ctx, id)
}

func (u *projectUsecase) Create(ctx context.Context, name string, colorPackID uuid.UUID) (domain.Project, error) {
	if name == "" {
		return domain.Project{}, errors.New("project name cannot be empty")
	}

	// Validate Color Pack selection exists
	_, err := u.colorPackRepo.GetByID(ctx, colorPackID)
	if err != nil {
		return domain.Project{}, errors.New("invalid color pack selection: pack does not exist")
	}

	newProj := &domain.Project{
		ID:          uuid.New(),
		Name:        name,
		ColorPackID: colorPackID,
		CanvasState: "[]",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err = u.projectRepo.Create(ctx, newProj)
	if err != nil {
		return domain.Project{}, err
	}
	return *newProj, nil
}

func (u *projectUsecase) Update(ctx context.Context, id uuid.UUID, name string, colorPackID uuid.UUID, canvasState string) (domain.Project, error) {
	project, err := u.projectRepo.GetByID(ctx, id)
	if err != nil {
		return domain.Project{}, err
	}

	// Validate new Color Pack reference if it is changing
	if colorPackID != uuid.Nil && colorPackID != project.ColorPackID {
		_, err = u.colorPackRepo.GetByID(ctx, colorPackID)
		if err != nil {
			return domain.Project{}, errors.New("invalid color pack selection: pack does not exist")
		}
		project.ColorPackID = colorPackID
	}

	if name != "" {
		project.Name = name
	}
	if canvasState != "" {
		project.CanvasState = canvasState
	}
	project.UpdatedAt = time.Now()

	err = u.projectRepo.Update(ctx, &project)
	if err != nil {
		return domain.Project{}, err
	}
	return project, nil
}

func (u *projectUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	return u.projectRepo.Delete(ctx, id)
}
