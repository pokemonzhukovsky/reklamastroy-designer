import { create } from 'zustand';
import type { LightingType } from '../types/project';

type ProjectState = {
  text: string;
  capitalHeightCm: number;
  lighting: LightingType;
  setText: (text: string) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  text: 'РекламаСтрой',
  capitalHeightCm: 40,
  lighting: 'halo',
  setText: (text) => set({ text }),
}));
