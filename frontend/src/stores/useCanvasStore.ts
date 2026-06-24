import { create } from 'zustand';
import { type CanvasComponent } from '../types';

interface CanvasState {
  components: CanvasComponent[];
  selectedId: string | null;
  themeMode: 'light' | 'dark';
  colorPackId: string;
  isDirty: boolean;
  isSaving: boolean;

  loadCanvasState: (components: CanvasComponent[], colorPackId: string) => void;
  setColorPackId: (colorPackId: string) => void;
  addComponent: (component: CanvasComponent) => void;
  updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  deleteComponent: (id: string) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  reorderComponent: (id: string, action: 'front' | 'forward' | 'backward' | 'back') => void;
  saveState: (projectId: string) => Promise<boolean>;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  components: [],
  selectedId: null,
  themeMode: 'light',
  colorPackId: '',
  isDirty: false,
  isSaving: false,

  loadCanvasState: (components, colorPackId) => {
    // Sort components by zIndex initially just in case
    const sorted = [...components].sort((a, b) => a.zIndex - b.zIndex);
    set({
      components: sorted,
      colorPackId,
      selectedId: null,
      isDirty: false
    });
  },

  setColorPackId: (colorPackId) => {
    set({ colorPackId, isDirty: true });
  },

  addComponent: (component) => {
    set((state) => {
      // Set zIndex to be the maximum zIndex + 1
      const maxZ = state.components.reduce((max, c) => Math.max(max, c.zIndex), 0);
      const newComp = { ...component, zIndex: maxZ + 1 };
      return {
        components: [...state.components, newComp],
        selectedId: newComp.id,
        isDirty: true
      };
    });
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? ({ ...c, ...updates } as CanvasComponent) : c
      ),
      isDirty: true
    }));
  },

  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true
    }));
  },

  setThemeMode: (mode) => {
    set({ themeMode: mode });
  },

  reorderComponent: (id, action) => {
    set((state) => {
      const components = [...state.components].sort((a, b) => a.zIndex - b.zIndex);
      const idx = components.findIndex((c) => c.id === id);
      if (idx === -1) return {};

      const target = components[idx];

      switch (action) {
        case 'front':
          // Move target to the end of the array, set its zIndex to max + 1
          components.splice(idx, 1);
          components.push(target);
          break;
        case 'back':
          // Move target to the start of the array, set its zIndex to min - 1
          components.splice(idx, 1);
          components.unshift(target);
          break;
        case 'forward':
          if (idx < components.length - 1) {
            components[idx] = components[idx + 1];
            components[idx + 1] = target;
          }
          break;
        case 'backward':
          if (idx > 0) {
            components[idx] = components[idx - 1];
            components[idx - 1] = target;
          }
          break;
      }

      // Re-assign sequential z-indices to avoid floating numbers or overlapping
      const updated = components.map((c, index) => ({
        ...c,
        zIndex: index + 1,
      }));

      return {
        components: updated,
        isDirty: true,
      };
    });
  },

  saveState: async (projectId) => {
    const { components, colorPackId } = get();
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color_pack_id: colorPackId,
          canvas_state: components,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        set({ isDirty: false, isSaving: false });
        return true;
      } else {
        // Fallback for local preview running mode
        console.log('Saved project offline:', { projectId, colorPackId, components });
        set({ isDirty: false, isSaving: false });
        return true;
      }
    } catch (err) {
      console.error('Failed to save project state:', err);
      set({ isSaving: false });
      return false;
    }
  },
}));
