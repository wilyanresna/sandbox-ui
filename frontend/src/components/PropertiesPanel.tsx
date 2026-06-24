import React from 'react';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useProjectStore } from '../stores/useProjectStore';
import { type ShapeComponent, type TextComponent } from '../types';

export const PropertiesPanel: React.FC = () => {
  const { components, selectedId, colorPackId, addComponent, updateComponent, deleteComponent } = useCanvasStore();
  const { colorPacks } = useProjectStore();

  const selectedComponent = components.find((c) => c.id === selectedId);

  // Find active color pack to populate token options
  const activeColorPack = colorPacks.find((p) => p.id === colorPackId);
  const colorTokens = activeColorPack ? activeColorPack.tokens : [];

  const handleAddRectangle = () => {
    const newRect: ShapeComponent = {
      id: `rect-${Date.now()}`,
      name: `Rectangle ${components.length + 1}`,
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      zIndex: components.length + 1,
      fillColorToken: 'primary',
      borderRadius: {
        topLeft: 16,
        topRight: 16,
        bottomLeft: 16,
        bottomRight: 16,
      },
    };
    addComponent(newRect);
  };

  const handleAddCircle = () => {
    const newCircle: ShapeComponent = {
      id: `circle-${Date.now()}`,
      name: `Circle ${components.length + 1}`,
      type: 'shape',
      shapeType: 'circle',
      x: 150,
      y: 150,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex: components.length + 1,
      fillColorToken: 'secondary',
      borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }, // Unused for circle
    };
    addComponent(newCircle);
  };

  const handleAddText = () => {
    const newText: TextComponent = {
      id: `text-${Date.now()}`,
      name: `Text ${components.length + 1}`,
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      zIndex: components.length + 1,
      textContent: 'Material 3 Label',
      fontSize: 24,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textColorToken: 'onBackground',
      letterSpacing: 0,
      lineHeight: 1.2,
    };
    addComponent(newText);
  };

  const handlePropChange = (key: string, value: any) => {
    if (!selectedId) return;
    updateComponent(selectedId, { [key]: value });
  };

  const handleBorderRadiusChange = (corner: string, val: number) => {
    if (!selectedId || !selectedComponent || selectedComponent.type !== 'shape') return;
    const shape = selectedComponent as ShapeComponent;
    updateComponent(selectedId, {
      borderRadius: {
        ...shape.borderRadius,
        [corner]: val,
      },
    });
  };

  return (
    <aside className="editor-sidebar right-sidebar">
      <div className="sidebar-header">
        <h3>Properties</h3>
      </div>

      <div className="sidebar-body">
        {!selectedComponent ? (
          <div className="no-selection-panel">
            <p>No element selected. Select an element to edit properties, or add new components below:</p>
            <div className="add-components-group">
              <button className="btn btn-secondary btn-full" onClick={handleAddRectangle}>
                ⬜ Add Rectangle
              </button>
              <button className="btn btn-secondary btn-full" onClick={handleAddCircle}>
                ⚪ Add Circle
              </button>
              <button className="btn btn-secondary btn-full" onClick={handleAddText}>
                🔤 Add Text Label
              </button>
            </div>
          </div>
        ) : (
          <div className="properties-form">
            <div className="form-group-title">Layout Properties</div>

            <div className="form-row-2">
              <div className="form-group">
                <label>X (Left)</label>
                <input
                  type="number"
                  value={selectedComponent.x}
                  onChange={(e) => handlePropChange('x', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Y (Top)</label>
                <input
                  type="number"
                  value={selectedComponent.y}
                  onChange={(e) => handlePropChange('y', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Width</label>
                <input
                  type="number"
                  value={selectedComponent.width}
                  onChange={(e) => handlePropChange('width', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Height</label>
                <input
                  type="number"
                  value={selectedComponent.height}
                  onChange={(e) => handlePropChange('height', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Rotation (°)</label>
                <input
                  type="number"
                  value={selectedComponent.rotation}
                  onChange={(e) => handlePropChange('rotation', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Opacity (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={selectedComponent.opacity}
                  onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            {selectedComponent.type === 'shape' && (
              <>
                <div className="form-group-title">Shape Properties</div>

                <div className="form-group">
                  <label>Fill Color Token</label>
                  <select
                    value={(selectedComponent as ShapeComponent).fillColorToken}
                    onChange={(e) => handlePropChange('fillColorToken', e.target.value)}
                  >
                    {colorTokens.map((tok) => (
                      <option key={tok.name} value={tok.name}>
                        {tok.name}
                      </option>
                    ))}
                  </select>
                </div>

                {(selectedComponent as ShapeComponent).shapeType === 'rectangle' && (
                  <div className="border-radius-section">
                    <label className="section-label">Corner Radius</label>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Top Left</label>
                        <input
                          type="number"
                          min="0"
                          value={(selectedComponent as ShapeComponent).borderRadius.topLeft}
                          onChange={(e) =>
                            handleBorderRadiusChange('topLeft', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Top Right</label>
                        <input
                          type="number"
                          min="0"
                          value={(selectedComponent as ShapeComponent).borderRadius.topRight}
                          onChange={(e) =>
                            handleBorderRadiusChange('topRight', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Bottom Left</label>
                        <input
                          type="number"
                          min="0"
                          value={(selectedComponent as ShapeComponent).borderRadius.bottomLeft}
                          onChange={(e) =>
                            handleBorderRadiusChange('bottomLeft', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Bottom Right</label>
                        <input
                          type="number"
                          min="0"
                          value={(selectedComponent as ShapeComponent).borderRadius.bottomRight}
                          onChange={(e) =>
                            handleBorderRadiusChange('bottomRight', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedComponent.type === 'text' && (
              <>
                <div className="form-group-title">Text Properties</div>

                <div className="form-group">
                  <label>Text Content</label>
                  <textarea
                    rows={3}
                    value={(selectedComponent as TextComponent).textContent}
                    onChange={(e) => handlePropChange('textContent', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Text Color Token</label>
                  <select
                    value={(selectedComponent as TextComponent).textColorToken}
                    onChange={(e) => handlePropChange('textColorToken', e.target.value)}
                  >
                    {colorTokens.map((tok) => (
                      <option key={tok.name} value={tok.name}>
                        {tok.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Font Size</label>
                    <input
                      type="number"
                      min="1"
                      value={(selectedComponent as TextComponent).fontSize}
                      onChange={(e) => handlePropChange('fontSize', parseInt(e.target.value) || 12)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Font Weight</label>
                    <select
                      value={(selectedComponent as TextComponent).fontWeight}
                      onChange={(e) => handlePropChange('fontWeight', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Font Style</label>
                    <select
                      value={(selectedComponent as TextComponent).fontStyle}
                      onChange={(e) => handlePropChange('fontStyle', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Letter Spacing</label>
                    <input
                      type="number"
                      step="0.5"
                      value={(selectedComponent as TextComponent).letterSpacing}
                      onChange={(e) =>
                        handlePropChange('letterSpacing', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Line Height</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={(selectedComponent as TextComponent).lineHeight}
                    onChange={(e) => handlePropChange('lineHeight', parseFloat(e.target.value) || 1)}
                  />
                </div>
              </>
            )}

            <div className="danger-zone-section" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-danger btn-full"
                onClick={() => {
                  if (confirm('Delete this element?')) {
                    deleteComponent(selectedComponent.id);
                  }
                }}
              >
                🗑️ Delete Element
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
