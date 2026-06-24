import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useCanvasStore } from '../stores/useCanvasStore';
import { Navbar } from './Navbar';
import { LayerPanel } from './LayerPanel';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { ColorPackManagerModal } from './ColorPackManagerModal';

export const Editor: React.FC = () => {
  const { activeProject, colorPacks } = useProjectStore();
  const { loadCanvasState, colorPackId, setColorPackId, components, isDirty, saveState } = useCanvasStore();
  const [isCpModalOpen, setIsCpModalOpen] = useState(false);

  // Load project canvas state into CanvasStore on mount / activeProject change
  useEffect(() => {
    if (activeProject) {
      loadCanvasState(activeProject.canvas_state || [], activeProject.color_pack_id);
    }
  }, [activeProject, loadCanvasState]);

  // Auto-save mechanism: debounced 5 seconds of inactivity
  useEffect(() => {
    if (!isDirty || !activeProject) return;

    const timer = setTimeout(async () => {
      await saveState(activeProject.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [components, colorPackId, isDirty, activeProject?.id, saveState]);

  // Synchronize changes to active project's selected color pack in state
  const handleColorPackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorPackId(e.target.value);
  };

  if (!activeProject) return null;

  return (
    <div className="editor-container">
      <Navbar />

      <div className="editor-subbar">
        <div className="pack-selection-bar" style={{ display: 'flex', alignItems: 'center' }}>
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
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCpModalOpen(true)}
            style={{ marginLeft: '10px', display: 'inline-flex', padding: '4px 10px', height: '28px', alignItems: 'center' }}
            title="Customize color tokens for this pack"
          >
            🎨 Customize Colors
          </button>
        </div>
      </div>

      <div className="editor-workspace">
        <LayerPanel />
        <CanvasArea />
        <PropertiesPanel />
      </div>

      <ColorPackManagerModal
        isOpen={isCpModalOpen}
        onClose={() => setIsCpModalOpen(false)}
        initialEditPackId={colorPackId}
      />
    </div>
  );
};
