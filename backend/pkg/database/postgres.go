package database

import (
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitDB initializes PostgreSQL connection and runs migrations + seeders
func InitDB() (*gorm.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5433")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "web_mockup_sandbox")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		host, user, password, dbname, port, sslmode)

	log.Printf("Connecting to database: host=%s, port=%s, user=%s, dbname=%s", host, port, user, dbname)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established. Running Auto-Migrations...")

	// Run migrations
	err = db.AutoMigrate(&domain.ColorPack{}, &domain.ColorToken{}, &domain.Project{})
	if err != nil {
		return nil, fmt.Errorf("failed to run database migration: %w", err)
	}

	log.Println("Auto-Migrations completed successfully. Seeding initial data...")
	seedDefaultColorPack(db)

	return db, nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// seedDefaultColorPack seeds the default Material 3 palette if database has no color packs
func seedDefaultColorPack(db *gorm.DB) {
	var count int64
	db.Model(&domain.ColorPack{}).Count(&count)
	if count > 0 {
		log.Println("Database already has color packs. Skipping seeding.")
		return
	}

	// 1. Seed Material 3 Default
	m3DefaultID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	m3Pack := domain.ColorPack{
		ID:   m3DefaultID,
		Name: "Material 3 Default Palette",
		Tokens: []domain.ColorToken{
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "primary", LightHex: "#6750A4", DarkHex: "#D0BCFF"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onPrimary", LightHex: "#FFFFFF", DarkHex: "#381E72"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "primaryContainer", LightHex: "#EADDFF", DarkHex: "#4F378B"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onPrimaryContainer", LightHex: "#21005D", DarkHex: "#EADDFF"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "secondary", LightHex: "#625B71", DarkHex: "#CCC2DC"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onSecondary", LightHex: "#FFFFFF", DarkHex: "#332D41"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "background", LightHex: "#FEF7FF", DarkHex: "#141218"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onBackground", LightHex: "#1D1B20", DarkHex: "#E6E1E5"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "surface", LightHex: "#FEF7FF", DarkHex: "#141218"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onSurface", LightHex: "#1D1B20", DarkHex: "#E6E1E5"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "error", LightHex: "#B3261E", DarkHex: "#F2B8B5"},
			{ID: uuid.New(), ColorPackID: m3DefaultID, Name: "onError", LightHex: "#FFFFFF", DarkHex: "#601410"},
		},
	}

	if err := db.Create(&m3Pack).Error; err != nil {
		log.Printf("Warning: Failed to seed Material 3 default palette: %v", err)
	} else {
		log.Println("Seeded 'Material 3 Default Palette' successfully.")
	}

	// 2. Seed Forest Green
	forestID := uuid.MustParse("00000000-0000-0000-0000-000000000002")
	forestPack := domain.ColorPack{
		ID:   forestID,
		Name: "Forest Green Theme",
		Tokens: []domain.ColorToken{
			{ID: uuid.New(), ColorPackID: forestID, Name: "primary", LightHex: "#386B52", DarkHex: "#9CD4B3"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onPrimary", LightHex: "#FFFFFF", DarkHex: "#003924"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "primaryContainer", LightHex: "#BCF1CF", DarkHex: "#1E523A"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onPrimaryContainer", LightHex: "#002113", DarkHex: "#BCF1CF"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "secondary", LightHex: "#526356", DarkHex: "#B9CCBE"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onSecondary", LightHex: "#FFFFFF", DarkHex: "#253429"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "background", LightHex: "#F6FBF7", DarkHex: "#1A1C19"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onBackground", LightHex: "#191C19", DarkHex: "#E1E3DF"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "surface", LightHex: "#F6FBF7", DarkHex: "#1A1C19"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onSurface", LightHex: "#191C19", DarkHex: "#E1E3DF"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "error", LightHex: "#BA1A1A", DarkHex: "#FFB4AB"},
			{ID: uuid.New(), ColorPackID: forestID, Name: "onError", LightHex: "#FFFFFF", DarkHex: "#690005"},
		},
	}

	if err := db.Create(&forestPack).Error; err != nil {
		log.Printf("Warning: Failed to seed Forest Green palette: %v", err)
	} else {
		log.Println("Seeded 'Forest Green Theme' successfully.")
	}
}
