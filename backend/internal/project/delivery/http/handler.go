package http

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
)

type ProjectHandler struct {
	usecase domain.ProjectUsecase
}

type createProjectInput struct {
	Name        string    `json:"name" binding:"required"`
	ColorPackID uuid.UUID `json:"color_pack_id" binding:"required"`
}

type updateProjectInput struct {
	Name        string          `json:"name"`
	ColorPackID uuid.UUID       `json:"color_pack_id"`
	CanvasState json.RawMessage `json:"canvas_state"`
}

// NewProjectHandler registers endpoints to the router
func NewProjectHandler(r *gin.Engine, u domain.ProjectUsecase) {
	handler := &ProjectHandler{usecase: u}

	r.GET("/api/projects", handler.Fetch)
	r.GET("/api/projects/:id", handler.GetByID)
	r.POST("/api/projects", handler.Create)
	r.PUT("/api/projects/:id", handler.Update)
	r.DELETE("/api/projects/:id", handler.Delete)
}

func (h *ProjectHandler) Fetch(c *gin.Context) {
	projects, err := h.usecase.Fetch(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func (h *ProjectHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	project, err := h.usecase.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}
	c.JSON(http.StatusOK, project)
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var input createProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newProj, err := h.usecase.Create(c.Request.Context(), input.Name, input.ColorPackID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, newProj)
}

func (h *ProjectHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	var input updateProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var canvasStateStr string
	if input.CanvasState != nil {
		canvasStateStr = string(input.CanvasState)
	}

	updatedProj, err := h.usecase.Update(c.Request.Context(), id, input.Name, input.ColorPackID, canvasStateStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedProj)
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	err = h.usecase.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "project deleted successfully"})
}
