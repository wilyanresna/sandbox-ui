import React from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { useCanvasStore } from '../stores/useCanvasStore';

export const Navbar: React.FC = () => {
  const { activeProject, selectProject, colorPacks } = useProjectStore();
  const { themeMode, setThemeMode, isDirty, isSaving, saveState } = useCanvasStore();

  const handleBack = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to go back?')) {
      return;
    }
    selectProject(null);
  };

  const handleSave = async () => {
    if (!activeProject) return;
    const success = await saveState(activeProject.id);
    if (success) {
      alert('Project saved successfully!');
    } else {
      alert('Failed to save project.');
    }
  };

  const handleExportPNG = () => {
    // Custom event to trigger PNG export in CanvasArea
    window.dispatchEvent(new CustomEvent('export-png'));
  };

  const handleExportKotlin = () => {
    // Find active color pack config
    if (!activeProject) return;
    const canvasColorPackId = useCanvasStore.getState().colorPackId;
    const pack = colorPacks.find(p => p.id === canvasColorPackId);
    if (!pack) {
      alert('No active color pack found to export.');
      return;
    }

    let code = `package com.example.ui.theme\n\n`;
    code += `import androidx.compose.ui.graphics.Color\n\n`;
    
    code += `// Generated from Canvas UI & Color Manager Color Pack: ${pack.name}\n`;
    
    // Light tokens
    code += `// Light Mode Colors\n`;
    pack.tokens.forEach(tok => {
      const cleanHex = tok.lightHex.replace('#', '').toUpperCase();
      const finalHex = cleanHex.length === 6 ? `FF${cleanHex}` : cleanHex;
      code += `val md_theme_light_${tok.name} = Color(0x${finalHex})\n`;
    });
    
    code += `\n// Dark Mode Colors\n`;
    // Dark tokens
    pack.tokens.forEach(tok => {
      const cleanHex = tok.darkHex.replace('#', '').toUpperCase();
      const finalHex = cleanHex.length === 6 ? `FF${cleanHex}` : cleanHex;
      code += `val md_theme_dark_${tok.name} = Color(0x${finalHex})\n`;
    });

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Color.kt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <nav className="editor-navbar">
      <div className="navbar-left">
        <button className="btn btn-secondary btn-back" onClick={handleBack}>
          ← Dashboard
        </button>
        <span className="project-title">{activeProject?.name}</span>
        {isSaving ? (
          <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-color)' }}>Saving...</span>
        ) : isDirty ? (
          <span className="badge badge-warning">Unsaved Changes</span>
        ) : (
          <span className="badge badge-success">Saved</span>
        )}
      </div>

      <div className="navbar-right">
        <div className="theme-toggle">
          <button
            className={`btn-toggle ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => setThemeMode('light')}
          >
            ☀️ Light
          </button>
          <button
            className={`btn-toggle ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => setThemeMode('dark')}
          >
            🌙 Dark
          </button>
        </div>

        <button className="btn btn-save" onClick={handleSave}>
          💾 Save
        </button>

        <div className="dropdown">
          <button className="btn btn-primary dropdown-trigger">
            📤 Export
          </button>
          <div className="dropdown-menu">
            <button onClick={handleExportPNG}>Export PNG Preview</button>
            <button onClick={handleExportKotlin}>Export Color.kt (Compose)</button>
          </div>
        </div>
      </div>
    </nav>
  );
};
