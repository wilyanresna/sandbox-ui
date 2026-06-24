package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
	"gorm.io/gorm"
)

type colorPackRepository struct {
	db *gorm.DB
}

// NewColorPackRepository instantiates the GORM repository for color packs
func NewColorPackRepository(db *gorm.DB) domain.ColorPackRepository {
	return &colorPackRepository{db: db}
}

func (r *colorPackRepository) Fetch(ctx context.Context) ([]domain.ColorPack, error) {
	var packs []domain.ColorPack
	err := r.db.WithContext(ctx).Preload("Tokens").Find(&packs).Error
	return packs, err
}

func (r *colorPackRepository) GetByID(ctx context.Context, id uuid.UUID) (domain.ColorPack, error) {
	var pack domain.ColorPack
	err := r.db.WithContext(ctx).Preload("Tokens").First(&pack, "id = ?", id).Error
	return pack, err
}

func (r *colorPackRepository) Create(ctx context.Context, colorPack *domain.ColorPack) error {
	return r.db.WithContext(ctx).Create(colorPack).Error
}

func (r *colorPackRepository) Update(ctx context.Context, colorPack *domain.ColorPack) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(colorPack).Error; err != nil {
			return err
		}
		// Save associated tokens in the transaction
		for _, token := range colorPack.Tokens {
			if err := tx.Save(&token).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *colorPackRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.ColorPack{}, "id = ?", id).Error
}

func (r *colorPackRepository) HasReferencingProjects(ctx context.Context, id uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Project{}).Where("color_pack_id = ?", id).Count(&count).Error
	return count > 0, err
}
