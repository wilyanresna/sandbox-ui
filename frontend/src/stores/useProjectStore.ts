import { create } from 'zustand';
import { type Project, type ColorPack } from '../types';

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
      // Mock fetching projects from API
      // In real implementation, this will fetch from /api/projects
      const res = await fetch('/api/projects').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        set({ projects: data, loading: false });
      } else {
        // Fallback to empty project list for skeleton
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
        set({ colorPacks: data, loading: false });
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
        set(state => ({
          projects: [newProj, ...state.projects],
          activeProject: newProj,
          loading: false
        }));
        return newProj;
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
}));
