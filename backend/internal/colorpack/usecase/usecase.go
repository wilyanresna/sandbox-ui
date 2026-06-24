package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
)

type colorPackUsecase struct {
	repo domain.ColorPackRepository
}

// NewColorPackUsecase instantiates the business logic service for color packs
func NewColorPackUsecase(repo domain.ColorPackRepository) domain.ColorPackUsecase {
	return &colorPackUsecase{repo: repo}
}

func (u *colorPackUsecase) Fetch(ctx context.Context) ([]domain.ColorPack, error) {
	return u.repo.Fetch(ctx)
}

func (u *colorPackUsecase) GetByID(ctx context.Context, id uuid.UUID) (domain.ColorPack, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *colorPackUsecase) Create(ctx context.Context, colorPack *domain.ColorPack) (domain.ColorPack, error) {
	if colorPack.Name == "" {
		return domain.ColorPack{}, errors.New("color pack name cannot be empty")
	}
	colorPack.ID = uuid.New()
	colorPack.CreatedAt = time.Now()
	colorPack.UpdatedAt = time.Now()

	for i := range colorPack.Tokens {
		colorPack.Tokens[i].ID = uuid.New()
		colorPack.Tokens[i].ColorPackID = colorPack.ID
		colorPack.Tokens[i].CreatedAt = time.Now()
		colorPack.Tokens[i].UpdatedAt = time.Now()
	}

	err := u.repo.Create(ctx, colorPack)
	if err != nil {
		return domain.ColorPack{}, err
	}
	return *colorPack, nil
}

func (u *colorPackUsecase) Update(ctx context.Context, id uuid.UUID, colorPack *domain.ColorPack) (domain.ColorPack, error) {
	existing, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return domain.ColorPack{}, err
	}

	if colorPack.Name == "" {
		return domain.ColorPack{}, errors.New("color pack name cannot be empty")
	}

	existing.Name = colorPack.Name
	existing.UpdatedAt = time.Now()

	// Update existing tokens with new values
	for _, updatedToken := range colorPack.Tokens {
		for i, existingToken := range existing.Tokens {
			if existingToken.Name == updatedToken.Name {
				existing.Tokens[i].LightHex = updatedToken.LightHex
				existing.Tokens[i].DarkHex = updatedToken.DarkHex
				existing.Tokens[i].UpdatedAt = time.Now()
			}
		}
	}

	err = u.repo.Update(ctx, &existing)
	if err != nil {
		return domain.ColorPack{}, err
	}
	return existing, nil
}

func (u *colorPackUsecase) Delete(ctx context.Context, id uuid.UUID) error {
	// Prevents deletion of default system packs (IDs 1 and 2)
	if id == uuid.MustParse("00000000-0000-0000-0000-000000000001") || id == uuid.MustParse("00000000-0000-0000-0000-000000000002") {
		return errors.New("cannot delete default system color packs")
	}

	// Business Rule: Restrict delete if pack is used by any project
	hasRefs, err := u.repo.HasReferencingProjects(ctx, id)
	if err != nil {
		return err
	}
	if hasRefs {
		return errors.New("cannot delete color pack because it is actively used by one or more projects")
	}

	return u.repo.Delete(ctx, id)
}
