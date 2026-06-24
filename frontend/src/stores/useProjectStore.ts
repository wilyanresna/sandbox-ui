import { create } from 'zustand';
import { type Project, type ColorPack, type ColorToken } from '../types';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  colorPacks: ColorPack[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchColorPacks: () => Promise<void>;
  createProject: (name: string, colorPackId: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  selectProject: (project: Project | null) => void;
  createColorPack: (name: string) => Promise<ColorPack | null>;
  updateColorPack: (id: string, name: string, tokens: ColorToken[]) => Promise<ColorPack | null>;
  deleteColorPack: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Default/mock Color Packs for skeleton preview
const MOCK_COLOR_PACKS: ColorPack[] = [
  {
    id: 'pack-m3-default',
    name: 'Material 3 Default Palette',
    tokens: [
      { name: 'primary', lightHex: '#6750A4', darkHex: '#D0BCFF' },
      { name: 'onPrimary', lightHex: '#FFFFFF', darkHex: '#381E72' },
      { name: 'primaryContainer', lightHex: '#EADDFF', darkHex: '#4F378B' },
      { name: 'onPrimaryContainer', lightHex: '#21005D', darkHex: '#EADDFF' },
      { name: 'secondary', lightHex: '#625B71', darkHex: '#CCC2DC' },
      { name: 'onSecondary', lightHex: '#FFFFFF', darkHex: '#332D41' },
      { name: 'background', lightHex: '#FEF7FF', darkHex: '#141218' },
      { name: 'onBackground', lightHex: '#1D1B20', darkHex: '#E6E1E5' },
      { name: 'surface', lightHex: '#FEF7FF', darkHex: '#141218' },
      { name: 'onSurface', lightHex: '#1D1B20', darkHex: '#E6E1E5' },
      { name: 'error', lightHex: '#B3261E', darkHex: '#F2B8B5' },
      { name: 'onError', lightHex: '#FFFFFF', darkHex: '#601410' },
    ]
  },
  {
    id: 'pack-forest',
    name: 'Forest Green Theme',
    tokens: [
      { name: 'primary', lightHex: '#386B52', darkHex: '#9CD4B3' },
      { name: 'onPrimary', lightHex: '#FFFFFF', darkHex: '#003924' },
      { name: 'primaryContainer', lightHex: '#BCF1CF', darkHex: '#1E523A' },
      { name: 'onPrimaryContainer', lightHex: '#002113', darkHex: '#BCF1CF' },
      { name: 'secondary', lightHex: '#526356', darkHex: '#B9CCBE' },
      { name: 'onSecondary', lightHex: '#FFFFFF', darkHex: '#253429' },
      { name: 'background', lightHex: '#F6FBF7', darkHex: '#1A1C19' },
      { name: 'onBackground', lightHex: '#191C19', darkHex: '#E1E3DF' },
      { name: 'surface', lightHex: '#F6FBF7', darkHex: '#1A1C19' },
      { name: 'onSurface', lightHex: '#191C19', darkHex: '#E1E3DF' },
      { name: 'error', lightHex: '#BA1A1A', darkHex: '#FFB4AB' },
      { name: 'onError', lightHex: '#FFFFFF', darkHex: '#690005' },
    ]
  }
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  colorPacks: MOCK_COLOR_PACKS,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/projects').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const mappedProjects = data.map((proj: any) => {
          let canvasState = proj.canvas_state;
          if (typeof canvasState === 'string') {
            try {
              canvasState = JSON.parse(canvasState);
            } catch (e) {
              canvasState = [];
            }
          }
          return {
            ...proj,
            canvas_state: canvasState || [],
            color_pack: proj.color_pack ? {
              id: proj.color_pack.id,
              name: proj.color_pack.name,
              tokens: (proj.color_pack.tokens || []).map((tok: any) => ({
                name: tok.name,
                lightHex: tok.light_hex || tok.lightHex,
                darkHex: tok.dark_hex || tok.darkHex,
              }))
            } : undefined
          };
        });
        set({ projects: mappedProjects, loading: false });
      } else {
        set({ projects: [], loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to fetch projects', loading: false });
    }
  },

  fetchColorPacks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/color-packs').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        const mappedPacks = data.map((pack: any) => ({
          id: pack.id,
          name: pack.name,
          tokens: (pack.tokens || []).map((tok: any) => ({
            name: tok.name,
            lightHex: tok.light_hex || tok.lightHex,
            darkHex: tok.dark_hex || tok.darkHex,
          }))
        }));
        set({ colorPacks: mappedPacks, loading: false });
      } else {
        set({ colorPacks: MOCK_COLOR_PACKS, loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to fetch color packs', loading: false });
    }
  },

  createProject: async (name: string, colorPackId: string) => {
    set({ loading: true, error: null });
    try {
      const payload = { name, color_pack_id: colorPackId };
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res && res.ok) {
        const newProj = await res.json();
        let canvasState = newProj.canvas_state;
        if (typeof canvasState === 'string') {
          try {
            canvasState = JSON.parse(canvasState);
          } catch (e) {
            canvasState = [];
          }
        }
        const mappedProj: Project = {
          ...newProj,
          canvas_state: canvasState || [],
          color_pack: newProj.color_pack ? {
            id: newProj.color_pack.id,
            name: newProj.color_pack.name,
            tokens: (newProj.color_pack.tokens || []).map((tok: any) => ({
              name: tok.name,
              lightHex: tok.light_hex || tok.lightHex,
              darkHex: tok.dark_hex || tok.darkHex,
            }))
          } : undefined
        };
        set(state => ({
          projects: [mappedProj, ...state.projects],
          activeProject: mappedProj,
          loading: false
        }));
        return mappedProj;
      } else {
        // Fallback for running local offline sandbox skeleton
        const mockNewProj: Project = {
          id: `proj-${Date.now()}`,
          name,
          color_pack_id: colorPackId,
          color_pack: get().colorPacks.find(p => p.id === colorPackId),
          canvas_state: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set(state => ({
          projects: [mockNewProj, ...state.projects],
          activeProject: mockNewProj,
          loading: false
        }));
        return mockNewProj;
      }
    } catch (err) {
      set({ error: 'Failed to create project', loading: false });
      return null;
    }
  },

  deleteProject: async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      }).catch(() => null);

      if (res && res.ok) {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProject: state.activeProject?.id === id ? null : state.activeProject,
        }));
        return true;
      } else {
        // Local fallback
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProject: state.activeProject?.id === id ? null : state.activeProject,
        }));
        return true;
      }
    } catch (err) {
      set({ error: 'Failed to delete project' });
      return false;
    }
  },

  selectProject: (project: Project | null) => {
    set({ activeProject: project });
  },

  createColorPack: async (name: string) => {
    set({ loading: true, error: null });
    try {
      const defaultTokens = [
        { name: 'primary', light_hex: '#6750A4', dark_hex: '#D0BCFF' },
        { name: 'onPrimary', light_hex: '#FFFFFF', dark_hex: '#381E72' },
        { name: 'primaryContainer', light_hex: '#EADDFF', dark_hex: '#4F378B' },
        { name: 'onPrimaryContainer', light_hex: '#21005D', dark_hex: '#EADDFF' },
        { name: 'secondary', light_hex: '#625B71', dark_hex: '#CCC2DC' },
        { name: 'onSecondary', light_hex: '#FFFFFF', dark_hex: '#332D41' },
        { name: 'background', light_hex: '#FEF7FF', dark_hex: '#141218' },
        { name: 'onBackground', light_hex: '#1D1B20', dark_hex: '#E6E1E5' },
        { name: 'surface', light_hex: '#FEF7FF', dark_hex: '#141218' },
        { name: 'onSurface', light_hex: '#1D1B20', dark_hex: '#E6E1E5' },
        { name: 'error', light_hex: '#B3261E', dark_hex: '#F2B8B5' },
        { name: 'onError', light_hex: '#FFFFFF', dark_hex: '#601410' },
      ];
      const payload = { name, tokens: defaultTokens };
      const res = await fetch('/api/color-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const newPack: ColorPack = {
          id: data.id,
          name: data.name,
          tokens: (data.tokens || []).map((tok: any) => ({
            name: tok.name,
            lightHex: tok.light_hex || tok.lightHex,
            darkHex: tok.dark_hex || tok.darkHex,
          })),
        };
        set(state => ({
          colorPacks: [...state.colorPacks, newPack],
          loading: false,
        }));
        return newPack;
      } else {
        const errData = res ? await res.json().catch(() => null) : null;
        set({ error: errData?.error || 'Failed to create color pack', loading: false });
        return null;
      }
    } catch (err) {
      set({ error: 'Failed to create color pack', loading: false });
      return null;
    }
  },

  updateColorPack: async (id: string, name: string, tokens: ColorToken[]) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        name,
        tokens: tokens.map(t => ({
          name: t.name,
          light_hex: t.lightHex,
          dark_hex: t.darkHex,
        })),
      };
      const res = await fetch(`/api/color-packs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const updatedPack: ColorPack = {
          id: data.id,
          name: data.name,
          tokens: (data.tokens || []).map((tok: any) => ({
            name: tok.name,
            lightHex: tok.light_hex || tok.lightHex,
            darkHex: tok.dark_hex || tok.darkHex,
          })),
        };
        set(state => {
          const colorPacks = state.colorPacks.map(p => p.id === id ? updatedPack : p);
          let activeProject = state.activeProject;
          if (activeProject && activeProject.color_pack_id === id) {
            activeProject = {
              ...activeProject,
              color_pack: updatedPack,
            };
          }
          return {
            colorPacks,
            activeProject,
            loading: false,
          };
        });
        return updatedPack;
      } else {
        const errData = res ? await res.json().catch(() => null) : null;
        set({ error: errData?.error || 'Failed to update color pack', loading: false });
        return null;
      }
    } catch (err) {
      set({ error: 'Failed to update color pack', loading: false });
      return null;
    }
  },

  deleteColorPack: async (id: string) => {
    try {
      const res = await fetch(`/api/color-packs/${id}`, {
        method: 'DELETE',
      }).catch(() => null);

      if (res && res.ok) {
        set(state => ({
          colorPacks: state.colorPacks.filter(p => p.id !== id),
        }));
        return { success: true };
      } else {
        const errData = res ? await res.json().catch(() => null) : null;
        const errMsg = errData?.error || 'Failed to delete color pack';
        if (res) {
          return { success: false, error: errMsg };
        }
        set(state => ({
          colorPacks: state.colorPacks.filter(p => p.id !== id),
        }));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete color pack' };
    }
  },
}));
