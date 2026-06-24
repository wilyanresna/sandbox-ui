import React, { useState } from 'react';
import { useCanvasStore } from '../stores/useCanvasStore';
import { type CanvasComponent } from '../types';

export const LayerPanel: React.FC = () => {
  const { components, selectedId, updateComponent, deleteComponent, reorderComponent } = useCanvasStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Sort components by zIndex descending to display top-most layer at the top of list
  const sortedComponents = [...components].sort((a, b) => b.zIndex - a.zIndex);

  const handleStartEdit = (c: CanvasComponent) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      updateComponent(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleSelect = (id: string) => {
    useCanvasStore.setState({ selectedId: id });
  };

  return (
    <aside className="editor-sidebar left-sidebar">
      <div className="sidebar-header">
        <h3>Layers</h3>
      </div>
      <div className="sidebar-body">
        {sortedComponents.length === 0 ? (
          <div className="empty-layers">No layers. Add shapes or text.</div>
        ) : (
          <ul className="layer-list">
            {sortedComponents.map((c) => {
              const isSelected = selectedId === c.id;
              const isEditing = editingId === c.id;

              return (
                <li
                  key={c.id}
                  className={`layer-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <div className="layer-info">
                    <span className="layer-icon">{c.type === 'shape' ? '⬜' : '🔤'}</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleSaveRename(c.id)}
                        onKeyDown={(e) => handleKeyDown(e, c.id)}
                        className="layer-rename-input"
                        autoFocus
                      />
                    ) : (
                      <span className="layer-name" onDoubleClick={() => handleStartEdit(c)}>
                        {c.name}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="layer-actions">
                      <button
                        title="Bring to Front"
                        onClick={(e) => { e.stopPropagation(); reorderComponent(c.id, 'front'); }}
                      >
                        ⤊
                      </button>
                      <button
                        title="Bring Forward"
                        onClick={(e) => { e.stopPropagation(); reorderComponent(c.id, 'forward'); }}
                      >
                        ▲
                      </button>
                      <button
                        title="Send Backward"
                        onClick={(e) => { e.stopPropagation(); reorderComponent(c.id, 'backward'); }}
                      >
                        ▼
                      </button>
                      <button
                        title="Send to Back"
                        onClick={(e) => { e.stopPropagation(); reorderComponent(c.id, 'back'); }}
                      >
                        ⤋
                      </button>
                      <button
                        title="Delete Layer"
                        className="btn-layer-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete layer?')) {
                            deleteComponent(c.id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};
