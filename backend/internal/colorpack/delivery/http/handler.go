package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/wilyanresna/sandbox-ui/backend/internal/domain"
)

type ColorPackHandler struct {
	usecase domain.ColorPackUsecase
}

// NewColorPackHandler registers endpoints to the router
func NewColorPackHandler(r *gin.Engine, u domain.ColorPackUsecase) {
	handler := &ColorPackHandler{usecase: u}

	r.GET("/api/color-packs", handler.Fetch)
	r.GET("/api/color-packs/:id", handler.GetByID)
	r.POST("/api/color-packs", handler.Create)
	r.PUT("/api/color-packs/:id", handler.Update)
	r.DELETE("/api/color-packs/:id", handler.Delete)
}

func (h *ColorPackHandler) Fetch(c *gin.Context) {
	packs, err := h.usecase.Fetch(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, packs)
}

func (h *ColorPackHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	pack, err := h.usecase.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "color pack not found"})
		return
	}
	c.JSON(http.StatusOK, pack)
}

func (h *ColorPackHandler) Create(c *gin.Context) {
	var pack domain.ColorPack
	if err := c.ShouldBindJSON(&pack); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newPack, err := h.usecase.Create(c.Request.Context(), &pack)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, newPack)
}

func (h *ColorPackHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	var pack domain.ColorPack
	if err := c.ShouldBindJSON(&pack); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedPack, err := h.usecase.Update(c.Request.Context(), id, &pack)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updatedPack)
}

func (h *ColorPackHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID format"})
		return
	}

	err = h.usecase.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "color pack deleted successfully"})
}
