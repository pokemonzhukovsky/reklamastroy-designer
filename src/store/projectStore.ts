import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalibrationPoint, LightingType } from '../types/project';
import { oracal641, oracal8500 } from '../data/oracal';
import { fontOptions } from '../data/fonts';

type ProjectState = {
  facadeDataUrl: string | null;
  textLine1: string;
  textLine2: string;
  twoRows: boolean;
  capitalHeightCm: number;
  fontFamily: string;
  faceColor: string;
  sideColor: string;
  lighting: LightingType;
  nightMode: boolean;
  logoDataUrl: string | null;
  scaleCm: number;
  calibrationPoints: CalibrationPoint[];
  autosavedAt: string | null;
  calibrationMode: boolean;
  rulerMode: boolean;
  setFacadeDataUrl: (value: string | null) => void;
  setTextLine1: (value: string) => void;
  setTextLine2: (value: string) => void;
  setTwoRows: (value: boolean) => void;
  setCapitalHeightCm: (value: number) => void;
  setFontFamily: (value: string) => void;
  setFaceColor: (value: string) => void;
  setSideColor: (value: string) => void;
  setLighting: (value: LightingType) => void;
  setNightMode: (value: boolean) => void;
  setLogoDataUrl: (value: string | null) => void;
  setScaleCm: (value: number) => void;
  setCalibrationPoints: (value: CalibrationPoint[]) => void;
  clearCalibrationPoints: () => void;
  setAutosavedAt: (value: string | null) => void;
  setCalibrationMode: (value: boolean) => void;
  setRulerMode: (value: boolean) => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
  facadeDataUrl: null,
  textLine1: 'РекламаСтрой',
  textLine2: '',
  twoRows: false,
  capitalHeightCm: 40,
  fontFamily: fontOptions[0]?.family ?? 'Arial, sans-serif',
  faceColor: oracal8500[0]?.hex ?? '#ffffff',
  sideColor: oracal641[1]?.hex ?? '#666666',
  lighting: 'front',
  nightMode: false,
  logoDataUrl: null,
  scaleCm: 200,
  calibrationPoints: [],
  autosavedAt: null,
  calibrationMode: false,
  rulerMode: false,
  setFacadeDataUrl: (facadeDataUrl) => set({ facadeDataUrl }),
  setTextLine1: (textLine1) => set({ textLine1 }),
  setTextLine2: (textLine2) => set({ textLine2 }),
  setTwoRows: (twoRows) => set({ twoRows }),
  setCapitalHeightCm: (capitalHeightCm) => set({ capitalHeightCm }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFaceColor: (faceColor) => set({ faceColor }),
  setSideColor: (sideColor) => set({ sideColor }),
  setLighting: (lighting) => set({ lighting }),
  setNightMode: (nightMode) => set({ nightMode }),
  setLogoDataUrl: (logoDataUrl) => set({ logoDataUrl }),
  setScaleCm: (scaleCm) => set({ scaleCm }),
  setCalibrationPoints: (calibrationPoints) => set({ calibrationPoints }),
  clearCalibrationPoints: () => set({ calibrationPoints: [] }),
  setAutosavedAt: (autosavedAt) => set({ autosavedAt }),
  setCalibrationMode: (calibrationMode) => set({ calibrationMode, rulerMode: false }),
  setRulerMode: (rulerMode) => set({ rulerMode, calibrationMode: false }),
    }),
    {
      name: 'reklamastroy-designer-autosave-v1',
      partialize: (state) => ({
        facadeDataUrl: state.facadeDataUrl,
        textLine1: state.textLine1,
        textLine2: state.textLine2,
        twoRows: state.twoRows,
        capitalHeightCm: state.capitalHeightCm,
        fontFamily: state.fontFamily,
        faceColor: state.faceColor,
        sideColor: state.sideColor,
        lighting: state.lighting,
        nightMode: state.nightMode,
        logoDataUrl: state.logoDataUrl,
        scaleCm: state.scaleCm,
        calibrationPoints: state.calibrationPoints,
        autosavedAt: state.autosavedAt,
      }),
    },
  ),
);
