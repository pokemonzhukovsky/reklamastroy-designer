export type LightingType = 'none' | 'front' | 'halo' | 'front-halo';

export type SignTextObject = {
  id: string;
  kind: 'text';
  value: string;
  fontFamily: string;
  capitalHeightCm: number;
  faceColorCode: string;
  sideColorCode: string;
  lighting: LightingType;
};

export type LogoObject = {
  id: string;
  kind: 'logo';
  fileType: 'svg' | 'png';
  widthMm: number;
  heightMm: number;
  isCircular: boolean;
};
