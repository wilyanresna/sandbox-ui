package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	colorpackHttp "github.com/wilyanresna/sandbox-ui/backend/internal/colorpack/delivery/http"
	colorpackRepo "github.com/wilyanresna/sandbox-ui/backend/internal/colorpack/repository/postgres"
	colorpackUcase "github.com/wilyanresna/sandbox-ui/backend/internal/colorpack/usecase"
	projectHttp "github.com/wilyanresna/sandbox-ui/backend/internal/project/delivery/http"
	projectRepo "github.com/wilyanresna/sandbox-ui/backend/internal/project/repository/postgres"
	projectUcase "github.com/wilyanresna/sandbox-ui/backend/internal/project/usecase"
	"github.com/wilyanresna/sandbox-ui/backend/pkg/database"
)

func main() {
	log.Println("Starting Canvas UI & Color Manager Backend API...")

	// 1. Initialize Database
	db, err := database.InitDB()
	if err != nil {
		log.Printf("CRITICAL WARNING: Database initialization failed: %v", err)
		log.Println("Please make sure PostgreSQL is running and credentials in environment are correct.")
		log.Println("Exiting application...")
		os.Exit(1)
	}

	// 2. Setup Gin Router
	r := gin.Default()

	// 3. Apply CORS Middleware
	r.Use(CORSMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP", "database": "CONNECTED"})
	})

	// 4. Initialize Repository, Usecase, and Handler Layers (Clean Architecture Dependency Injection)
	cpRepo := colorpackRepo.NewColorPackRepository(db)
	cpUcase := colorpackUcase.NewColorPackUsecase(cpRepo)
	colorpackHttp.NewColorPackHandler(r, cpUcase)

	pRepo := projectRepo.NewProjectRepository(db)
	pUcase := projectUcase.NewProjectUsecase(pRepo, cpRepo)
	projectHttp.NewProjectHandler(r, pUcase)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("HTTP Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}

// CORSMiddleware enables cross-origin resource sharing for frontend client-side API requests
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
