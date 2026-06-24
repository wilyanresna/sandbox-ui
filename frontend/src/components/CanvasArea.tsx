import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
import { useCanvasStore } from '../stores/useCanvasStore';
import { useProjectStore } from '../stores/useProjectStore';
import Konva from 'konva';

export const CanvasArea: React.FC = () => {
  const { components, selectedId, themeMode, colorPackId, updateComponent } = useCanvasStore();
  const { colorPacks } = useProjectStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Resolution of Color Token based on active pack & theme
  const resolveColor = (tokenName: string) => {
    const pack = colorPacks.find((p) => p.id === colorPackId);
    if (!pack) return '#CCCCCC';
    const token = pack.tokens.find((t) => t.name === tokenName);
    if (!token) return '#CCCCCC';
    return themeMode === 'light' ? token.lightHex : token.darkHex;
  };

  // Find canvas background color
  const getCanvasBg = () => {
    return resolveColor('background');
  };

  // Handle click outside components to deselect
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'canvas-bg') {
      useCanvasStore.setState({ selectedId: null });
    }
  };

  // Listen to the custom PNG export event
  useEffect(() => {
    const handleExport = () => {
      if (!stageRef.current) return;

      // Temporary hide selection transformer
      const tr = transformerRef.current;
      if (tr) tr.visible(false);
      stageRef.current.batchDraw();

      // Export
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

      // Save file
      const link = document.createElement('a');
      link.download = `canvas-export-${themeMode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore transformer
      if (tr && selectedId) tr.visible(true);
      stageRef.current.batchDraw();
    };

    window.addEventListener('export-png', handleExport);
    return () => {
      window.removeEventListener('export-png', handleExport);
    };
  }, [themeMode, selectedId]);

  // Update selection frame when component selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedId) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, components]);

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <Stage
          width={600}
          height={600}
          scaleX={0.5}
          scaleY={0.5}
          ref={stageRef}
          onClick={handleStageClick}
          className="konva-stage-element"
        >
          <Layer>
            {/* Canvas Base Background */}
            <Rect
              x={0}
              y={0}
              width={1200}
              height={1200}
              fill={getCanvasBg()}
              name="canvas-bg"
              listening={true}
            />

            {/* Render Canvas Elements */}
            {components.map((c) => {
              if (c.type === 'shape') {
                const fillVal = resolveColor(c.fillColorToken);

                if (c.shapeType === 'circle') {
                  const radius = Math.min(c.width, c.height) / 2;
                  return (
                    <Circle
                      key={c.id}
                      id={c.id}
                      x={c.x + radius}
                      y={c.y + radius}
                      radius={radius}
                      fill={fillVal}
                      opacity={c.opacity}
                      rotation={c.rotation}
                      draggable
                      onDragEnd={(e) => {
                        updateComponent(c.id, {
                          x: Math.round(e.target.x() - radius),
                          y: Math.round(e.target.y() - radius),
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        // Reset scale to avoid distortion
                        node.scaleX(1);
                        node.scaleY(1);

                        const newRadius = (node.width() * scaleX) / 2;
                        updateComponent(c.id, {
                          x: Math.round(node.x() - newRadius),
                          y: Math.round(node.y() - newRadius),
                          width: Math.round(node.width() * scaleX),
                          height: Math.round(node.height() * scaleY),
                          rotation: Math.round(node.rotation()),
                        });
                      }}
                      onClick={() => useCanvasStore.setState({ selectedId: c.id })}
                    />
                  );
                } else {
                  // Rectangle with cornerRadius array [topLeft, topRight, bottomRight, bottomLeft]
                  const r = c.borderRadius;
                  const radArray = [r.topLeft, r.topRight, r.bottomRight, r.bottomLeft];

                  return (
                    <Rect
                      key={c.id}
                      id={c.id}
                      x={c.x}
                      y={c.y}
                      width={c.width}
                      height={c.height}
                      fill={fillVal}
                      opacity={c.opacity}
                      rotation={c.rotation}
                      cornerRadius={radArray}
                      draggable
                      onDragEnd={(e) => {
                        updateComponent(c.id, {
                          x: Math.round(e.target.x()),
                          y: Math.round(e.target.y()),
                        });
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);

                        updateComponent(c.id, {
                          x: Math.round(node.x()),
                          y: Math.round(node.y()),
                          width: Math.round(node.width() * scaleX),
                          height: Math.round(node.height() * scaleY),
                          rotation: Math.round(node.rotation()),
                        });
                      }}
                      onClick={() => useCanvasStore.setState({ selectedId: c.id })}
                    />
                  );
                }
              } else if (c.type === 'text') {
                const textVal = resolveColor(c.textColorToken);

                return (
                  <Text
                    key={c.id}
                    id={c.id}
                    x={c.x}
                    y={c.y}
                    text={c.textContent}
                    fontSize={c.fontSize}
                    fontStyle={
                      c.fontWeight === 'bold'
                        ? `${c.fontStyle} bold`
                        : c.fontStyle
                    }
                    fill={textVal}
                    opacity={c.opacity}
                    rotation={c.rotation}
                    letterSpacing={c.letterSpacing}
                    lineHeight={c.lineHeight}
                    draggable
                    onDragEnd={(e) => {
                      updateComponent(c.id, {
                        x: Math.round(e.target.x()),
                        y: Math.round(e.target.y()),
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();

                      node.scaleX(1);
                      node.scaleY(1);

                      updateComponent(c.id, {
                        x: Math.round(node.x()),
                        y: Math.round(node.y()),
                        width: Math.round(node.width() * scaleX),
                        height: Math.round(node.height() * scaleY),
                        rotation: Math.round(node.rotation()),
                      });
                    }}
                    onClick={() => useCanvasStore.setState({ selectedId: c.id })}
                  />
                );
              }
              return null;
            })}

            {/* Transformer Overlay for Active selection */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size constraint
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
