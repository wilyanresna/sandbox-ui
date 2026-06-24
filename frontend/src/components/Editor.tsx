import React, { useEffect } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useCanvasStore } from '../stores/useCanvasStore';
import { Navbar } from './Navbar';
import { LayerPanel } from './LayerPanel';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';

export const Editor: React.FC = () => {
  const { activeProject, colorPacks } = useProjectStore();
  const { loadCanvasState, colorPackId, setColorPackId } = useCanvasStore();

  // Load project canvas state into CanvasStore on mount / activeProject change
  useEffect(() => {
    if (activeProject) {
      loadCanvasState(activeProject.canvas_state || [], activeProject.color_pack_id);
    }
  }, [activeProject, loadCanvasState]);

  // Synchronize changes to active project's selected color pack in state
  const handleColorPackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorPackId(e.target.value);
  };

  if (!activeProject) return null;

  return (
    <div className="editor-container">
      <Navbar />

      <div className="editor-subbar">
        <div className="pack-selection-bar">
          <label htmlFor="editor-pack-select">Connected Color Pack: </label>
          <select
            id="editor-pack-select"
            value={colorPackId}
            onChange={handleColorPackChange}
            className="editor-pack-select"
          >
            {colorPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="editor-workspace">
        <LayerPanel />
        <CanvasArea />
        <PropertiesPanel />
      </div>
    </div>
  );
};
