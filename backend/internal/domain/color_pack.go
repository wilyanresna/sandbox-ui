package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// ColorPack represents a collection of global Material 3 color tokens
type ColorPack struct {
	ID        uuid.UUID    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string       `gorm:"type:varchar(255);not null" json:"name"`
	Tokens    []ColorToken `gorm:"foreignKey:ColorPackID;constraint:OnDelete:CASCADE" json:"tokens,omitempty"`
	CreatedAt time.Time    `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time    `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// ColorToken holds the Light & Dark Mode hex values for a specific Material 3 token name
type ColorToken struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ColorPackID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_pack_token" json:"color_pack_id"`
	Name        string    `gorm:"type:varchar(100);not null;uniqueIndex:idx_pack_token" json:"name"`
	LightHex    string    `gorm:"type:varchar(9);not null" json:"light_hex"`
	DarkHex     string    `gorm:"type:varchar(9);not null" json:"dark_hex"`
	CreatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"-"`
	UpdatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP" json:"-"`
}

// ColorPackRepository defines data manipulation contracts
type ColorPackRepository interface {
	Fetch(ctx context.Context) ([]ColorPack, error)
	GetByID(ctx context.Context, id uuid.UUID) (ColorPack, error)
	Create(ctx context.Context, colorPack *ColorPack) error
	Update(ctx context.Context, colorPack *ColorPack) error
	Delete(ctx context.Context, id uuid.UUID) error
	HasReferencingProjects(ctx context.Context, id uuid.UUID) (bool, error)
}

// ColorPackUsecase defines business rules validation for color packs
type ColorPackUsecase interface {
	Fetch(ctx context.Context) ([]ColorPack, error)
	GetByID(ctx context.Context, id uuid.UUID) (ColorPack, error)
	Create(ctx context.Context, colorPack *ColorPack) (ColorPack, error)
	Update(ctx context.Context, id uuid.UUID, colorPack *ColorPack) (ColorPack, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
