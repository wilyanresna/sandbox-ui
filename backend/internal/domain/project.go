package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// Project represents a user's mockup canvas design and its selected global M3 color pack reference
type Project struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	ColorPackID uuid.UUID `gorm:"type:uuid;not null;index:idx_projects_color_pack_id" json:"color_pack_id"`
	ColorPack   ColorPack `gorm:"foreignKey:ColorPackID;constraint:OnDelete:RESTRICT" json:"color_pack,omitempty"`
	CanvasState string    `gorm:"type:jsonb;not null;default:'[]'" json:"canvas_state"`
	CreatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP;index:idx_projects_updated_at,sort:desc" json:"updated_at"`
}

// ProjectRepository defines GORM querying interfaces
type ProjectRepository interface {
	Fetch(ctx context.Context) ([]Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (Project, error)
	Create(ctx context.Context, project *Project) error
	Update(ctx context.Context, project *Project) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ProjectUsecase defines business logic validation rules
type ProjectUsecase interface {
	Fetch(ctx context.Context) ([]Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (Project, error)
	Create(ctx context.Context, name string, colorPackID uuid.UUID) (Project, error)
	Update(ctx context.Context, id uuid.UUID, name string, colorPackID uuid.UUID, canvasState string) (Project, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
