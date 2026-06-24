package internal

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/google/uuid"
	colorpackRepo "github.com/wilyanresna/sandbox-ui/backend/internal/colorpack/repository/postgres"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
	projectRepo "github.com/wilyanresna/sandbox-ui/backend/internal/project/repository/postgres"
	"github.com/wilyanresna/sandbox-ui/backend/pkg/database"
)

func assertJSONEq(t *testing.T, expected, actual string) {
	var expObj, actObj interface{}
	if err := json.Unmarshal([]byte(expected), &expObj); err != nil {
		t.Fatalf("Failed to unmarshal expected JSON: %v", err)
	}
	if err := json.Unmarshal([]byte(actual), &actObj); err != nil {
		t.Fatalf("Failed to unmarshal actual JSON: %v", err)
	}

	expBytes, _ := json.Marshal(expObj)
	actBytes, _ := json.Marshal(actObj)

	if string(expBytes) != string(actBytes) {
		t.Errorf("Expected JSON %s, got %s", expected, actual)
	}
}

func TestDatabaseAndRepositories(t *testing.T) {
	// 1. Test Connection & Migrations
	db, err := database.InitDB()
	if err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}

	ctx := context.Background()

	// 2. Test Unique Index Constraint (uq_pack_token_name / idx_pack_token) in its own Transaction
	t.Run("Unique Index Constraint", func(t *testing.T) {
		tx := db.Begin()
		defer tx.Rollback()

		cpRepo := colorpackRepo.NewColorPackRepository(tx)
		duplicateTokenPack := &domain.ColorPack{
			ID:   uuid.New(),
			Name: "Duplicate Token Test Pack",
			Tokens: []domain.ColorToken{
				{
					ID:       uuid.New(),
					Name:     "primary",
					LightHex: "#111",
					DarkHex:  "#222",
				},
				{
					ID:       uuid.New(),
					Name:     "primary", // Duplicate name in same pack
					LightHex: "#333",
					DarkHex:  "#444",
				},
			},
		}

		err := cpRepo.Create(ctx, duplicateTokenPack)
		if err == nil {
			t.Error("Expected error when creating color pack with duplicate token names, but got nil")
		} else {
			t.Logf("Got expected error for duplicate token name: %v", err)
		}
	})

	// 3. Test main CRUD workflow
	t.Run("CRUD Workflow & Cascade/Restrict Constraints", func(t *testing.T) {
		tx := db.Begin()
		defer tx.Rollback()

		cpRepo := colorpackRepo.NewColorPackRepository(tx)
		pRepo := projectRepo.NewProjectRepository(tx)

		// Create ColorPack
		cpID := uuid.New()
		cp := &domain.ColorPack{
			ID:   cpID,
			Name: "Test Theme Palette",
			Tokens: []domain.ColorToken{
				{
					ID:          uuid.New(),
					ColorPackID: cpID,
					Name:        "primary",
					LightHex:    "#111111",
					DarkHex:     "#EEEEEE",
				},
				{
					ID:          uuid.New(),
					ColorPackID: cpID,
					Name:        "secondary",
					LightHex:    "#222222",
					DarkHex:     "#DDDDDD",
				},
			},
		}

		err = cpRepo.Create(ctx, cp)
		if err != nil {
			t.Fatalf("Failed to create color pack: %v", err)
		}

		// Test GetByID
		fetchedCP, err := cpRepo.GetByID(ctx, cpID)
		if err != nil {
			t.Fatalf("Failed to get color pack by ID: %v", err)
		}
		if fetchedCP.Name != cp.Name {
			t.Errorf("Expected name %s, got %s", cp.Name, fetchedCP.Name)
		}
		if len(fetchedCP.Tokens) != 2 {
			t.Errorf("Expected 2 tokens, got %d", len(fetchedCP.Tokens))
		}

		// Test Fetch
		allPacks, err := cpRepo.Fetch(ctx)
		if err != nil {
			t.Fatalf("Failed to fetch color packs: %v", err)
		}
		found := false
		for _, p := range allPacks {
			if p.ID == cpID {
				found = true
				break
			}
		}
		if !found {
			t.Error("Created color pack not found in Fetch list")
		}

		// Create Project
		projID := uuid.New()
		proj := &domain.Project{
			ID:          projID,
			Name:        "Test Project Design",
			ColorPackID: cpID,
			CanvasState: `[{"id": "rect-1", "type": "rect", "x": 100, "y": 150}]`,
		}

		err = pRepo.Create(ctx, proj)
		if err != nil {
			t.Fatalf("Failed to create project: %v", err)
		}

		// Test GetByID
		fetchedProj, err := pRepo.GetByID(ctx, projID)
		if err != nil {
			t.Fatalf("Failed to get project by ID: %v", err)
		}
		if fetchedProj.Name != proj.Name {
			t.Errorf("Expected name %s, got %s", proj.Name, fetchedProj.Name)
		}
		assertJSONEq(t, proj.CanvasState, fetchedProj.CanvasState)

		// Test Fetch
		allProjs, err := pRepo.Fetch(ctx)
		if err != nil {
			t.Fatalf("Failed to fetch projects: %v", err)
		}
		foundProj := false
		for _, p := range allProjs {
			if p.ID == projID {
				foundProj = true
				if p.CanvasState != "" {
					t.Error("Project canvas state should be omitted in Fetch list to optimize performance")
				}
				break
			}
		}
		if !foundProj {
			t.Error("Created project not found in Fetch list")
		}

		// Test Update Project
		proj.Name = "Updated Project Design"
		proj.CanvasState = `[{"id": "rect-1", "type": "rect", "x": 200, "y": 250}]`
		err = pRepo.Update(ctx, proj)
		if err != nil {
			t.Fatalf("Failed to update project: %v", err)
		}

		fetchedProj, err = pRepo.GetByID(ctx, projID)
		if err != nil {
			t.Fatalf("Failed to get updated project by ID: %v", err)
		}
		if fetchedProj.Name != "Updated Project Design" {
			t.Errorf("Expected name to be updated, got %s", fetchedProj.Name)
		}
		assertJSONEq(t, proj.CanvasState, fetchedProj.CanvasState)

		// Test ON DELETE RESTRICT (via Savepoint to prevent aborting transaction)
		tx.SavePoint("restrict_delete")
		err = cpRepo.Delete(ctx, cpID)
		if err == nil {
			t.Error("Expected error when deleting color pack referenced by a project, but got nil")
		} else {
			if !strings.Contains(err.Error(), "violates foreign key constraint") && !strings.Contains(err.Error(), "restrict") {
				t.Errorf("Expected foreign key constraint / restrict error, got: %v", err)
			} else {
				t.Logf("Got expected restrict delete error: %v", err)
			}
		}
		tx.RollbackTo("restrict_delete")

		// Verify the project is still referencing color pack
		hasRefs, err := cpRepo.HasReferencingProjects(ctx, cpID)
		if err != nil {
			t.Fatalf("Failed to check referencing projects: %v", err)
		}
		if !hasRefs {
			t.Error("Expected HasReferencingProjects to return true")
		}

		// Delete Project
		err = pRepo.Delete(ctx, projID)
		if err != nil {
			t.Fatalf("Failed to delete project: %v", err)
		}

		// Now we should be able to delete the ColorPack
		hasRefs, err = cpRepo.HasReferencingProjects(ctx, cpID)
		if err != nil {
			t.Fatalf("Failed to check referencing projects after delete: %v", err)
		}
		if hasRefs {
			t.Error("Expected HasReferencingProjects to return false after project deletion")
		}

		// Delete ColorPack
		err = cpRepo.Delete(ctx, cpID)
		if err != nil {
			t.Fatalf("Failed to delete color pack after project was deleted: %v", err)
		}

		// Verify cascade deletion of tokens
		var tokenCount int64
		err = tx.Model(&domain.ColorToken{}).Where("color_pack_id = ?", cpID).Count(&tokenCount).Error
		if err != nil {
			t.Fatalf("Failed to query color tokens: %v", err)
		}
		if tokenCount > 0 {
			t.Errorf("Expected color tokens to be cascaded deleted, but found %d tokens remaining", tokenCount)
		}
	})
}
