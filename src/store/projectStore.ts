import { create } from 'zustand';
import type { LightingType } from '../types/project';
import { oracal641, oracal8500 } from '../data/oracal';

type ProjectState = {
  textLine1: string;
  textLine2: string;
  twoRows: boolean;
  capitalHeightCm: number;
  faceColor: string;
  sideColor: string;
  frameColor: string;
  lighting: LightingType;
  nightMode: boolean;
  frameEnabled: boolean;
  logoDataUrl: string | null;
  setTextLine1: (value: string) => void;
  setTextLine2: (value: string) => void;
  setTwoRows: (value: boolean) => void;
  setCapitalHeightCm: (value: number) => void;
  setFaceColor: (value: string) => void;
  setSideColor: (value: string) => void;
  setFrameColor: (value: string) => void;
  setLighting: (value: LightingType) => void;
  setNightMode: (value: boolean) => void;
  setFrameEnabled: (value: boolean) => void;
  setLogoDataUrl: (value: string | null) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  textLine1: 'РекламаСтрой',
  textLine2: '',
  twoRows: false,
  capitalHeightCm: 40,
  faceColor: oracal8500[0]?.hex ?? '#ffffff',
  sideColor: oracal641[1]?.hex ?? '#666666',
  frameColor: oracal641[1]?.hex ?? '#666666',
  lighting: 'halo',
  nightMode: false,
  frameEnabled: true,
  logoDataUrl: null,
  setTextLine1: (textLine1) => set({ textLine1 }),
  setTextLine2: (textLine2) => set({ textLine2 }),
  setTwoRows: (twoRows) => set({ twoRows }),
  setCapitalHeightCm: (capitalHeightCm) => set({ capitalHeightCm }),
  setFaceColor: (faceColor) => set({ faceColor }),
  setSideColor: (sideColor) => set({ sideColor }),
  setFrameColor: (frameColor) => set({ frameColor }),
  setLighting: (lighting) => set({ lighting }),
  setNightMode: (nightMode) => set({ nightMode }),
  setFrameEnabled: (frameEnabled) => set({ frameEnabled }),
  setLogoDataUrl: (logoDataUrl) => set({ logoDataUrl }),
}));
