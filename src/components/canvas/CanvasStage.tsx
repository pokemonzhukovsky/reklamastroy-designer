import { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';

const rgbaFromHex = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 255;
  const g = parseInt(clean.slice(2, 4), 16) || 255;
  const b = parseInt(clean.slice(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


const makeExtrudeShadow = (sideColor: string, depth: number) => {
  const steps = Math.max(4, Math.min(14, Math.round(depth)));
  return Array.from({ length: steps }, (_, index) => `${index + 1}px ${index + 1}px 0 ${sideColor}`).join(', ');
};

type Point = { x: number; y: number };

const formatTime = (iso: string | null) => {
  if (!iso) return 'ещё не сохранён';
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export function CanvasStage() {
  const project = useProjectStore();
  const [rulerPoints, setRulerPoints] = useState<Point[]>([]);
  const points = project.calibrationPoints;

  const isFrontLight = project.lighting === 'front' || project.lighting === 'front_halo';
  const isHaloLight = project.lighting === 'halo' || project.lighting === 'front_halo';
  const frontGlowBase = project.nightMode && isFrontLight;

  const lineLengthPx = useMemo(() => points.length === 2 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0, [points]);
  const isExactMode = Boolean(project.facadeDataUrl && points.length === 2 && lineLengthPx > 0 && project.scaleCm > 0);
  const pxPerCm = isExactMode ? lineLengthPx / project.scaleCm : null;
  const mmPerPx = isExactMode ? (project.scaleCm * 10 / lineLengthPx).toFixed(1) : null;
  const estimatedAccuracy = isExactMode ? '≈ ±1–3 %' : null;
  const signAngleDeg = points.length === 2 ? Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180 / Math.PI : 0;
  const signCenter = points.length === 2
    ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
    : null;

  const capitalFontPx = pxPerCm ? Math.max(18, project.capitalHeightCm * pxPerCm) : Math.max(28, project.capitalHeightCm * 1.55);
  const secondLineFontPx = pxPerCm ? Math.max(16, project.capitalHeightCm * 0.82 * pxPerCm) : Math.max(24, project.capitalHeightCm * 1.25);
  const logoSizePx = pxPerCm ? Math.max(38, project.capitalHeightCm * 1.45 * pxPerCm) : 110;
  const visualDepthPx = Math.max(6, Math.min(18, capitalFontPx * 0.105));
  const extrudeShadow = makeExtrudeShadow(project.sideColor, visualDepthPx);
  const frontGlow = frontGlowBase
    ? `${extrudeShadow}, 0 0 10px ${rgbaFromHex(project.faceColor, 0.98)}, 0 0 22px ${rgbaFromHex(project.faceColor, 0.82)}, 0 0 44px ${rgbaFromHex(project.faceColor, 0.54)}, 0 0 70px ${rgbaFromHex(project.faceColor, 0.28)}`
    : `${extrudeShadow}, ${visualDepthPx + 4}px ${visualDepthPx + 8}px 10px rgba(0,0,0,.30)`;

  const signStyle = {
    color: project.faceColor,
    textShadow: frontGlow,
    '--rs-side-color': project.sideColor,
    '--rs-face-color': project.faceColor,
    '--rs-glow-color': rgbaFromHex(project.faceColor, project.nightMode ? 0.72 : 0.22),
    '--rs-halo-opacity': project.nightMode && isHaloLight ? 1 : 0,
    '--rs-logo-size': `${logoSizePx}px`,
    '--rs-depth': `${visualDepthPx}px`,
    fontFamily: project.fontFamily,
    ...(signCenter ? {
      position: 'absolute',
      left: `${signCenter.x}px`,
      top: `${signCenter.y}px`,
      transform: `translate(-50%, -50%) rotate(${signAngleDeg}deg)`,
    } : {}),
  } as React.CSSProperties;

  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    if (project.calibrationMode) {
      project.setCalibrationPoints(points.length >= 2 ? [point] : [...points, point]);
      return;
    }

    if (project.rulerMode) {
      setRulerPoints((current) => current.length >= 2 ? [point] : [...current, point]);
    }
  };

  return (
    <div className="rs-canvas-card">
      <div className="rs-canvas-toolbar">
        <span>Рабочая область</span>
        <div className="rs-toolbar-actions">
          <button className={!project.nightMode ? 'active' : ''} onClick={() => project.setNightMode(false)}>День</button>
          <button className={project.nightMode ? 'active' : ''} onClick={() => project.setNightMode(true)}>Ночь</button>
        </div>
      </div>

      <div className={`rs-canvas-placeholder ${project.nightMode ? 'is-night' : ''} ${project.facadeDataUrl ? 'has-facade' : ''}`} onClick={onStageClick}>
        {project.facadeDataUrl && <img className="rs-facade-image" src={project.facadeDataUrl} alt="Фото фасада" />}
        <div className="rs-watermark-pattern">RS RS RS</div>

        {(points.length > 0 || rulerPoints.length > 0) && (
          <svg className="rs-overlay-svg">
            {points.length === 2 && <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} className="rs-measure-line rs-calibration-line" />}
            {points.map((p, index) => <circle key={`cal-${index}`} cx={p.x} cy={p.y} r="7" className="rs-point rs-calibration-point" />)}
            {rulerPoints.length === 2 && <line x1={rulerPoints[0].x} y1={rulerPoints[0].y} x2={rulerPoints[1].x} y2={rulerPoints[1].y} className="rs-measure-line rs-ruler-line" />}
            {rulerPoints.map((p, index) => <circle key={`ruler-${index}`} cx={p.x} cy={p.y} r="5" className="rs-point rs-ruler-point" />)}
          </svg>
        )}

        <div className={`rs-sign-preview rs-lighting-${project.lighting}`} style={signStyle}>
          <div className="rs-halo-layer" />
          {project.logoDataUrl ? (
            <span className="rs-volumetric-logo" aria-label="Загруженный логотип">
              <img className="rs-uploaded-logo rs-logo-depth rs-logo-depth-3" src={project.logoDataUrl} alt="" aria-hidden="true" />
              <img className="rs-uploaded-logo rs-logo-depth rs-logo-depth-2" src={project.logoDataUrl} alt="" aria-hidden="true" />
              <img className="rs-uploaded-logo rs-logo-depth rs-logo-depth-1" src={project.logoDataUrl} alt="" aria-hidden="true" />
              <img className="rs-uploaded-logo rs-logo-front" src={project.logoDataUrl} alt="Загруженный логотип" />
            </span>
          ) : (
            <span className="rs-sign-logo rs-volumetric-default-logo" style={{ borderColor: project.faceColor }}>RS</span>
          )}
          <div className="rs-sign-lines">
            <span className="rs-sign-text" style={{ fontSize: `${capitalFontPx}px` }}>{project.textLine1 || 'РекламаСтрой'}</span>
            {project.twoRows && <span className="rs-sign-text rs-sign-text-second" style={{ fontSize: `${secondLineFontPx}px` }}>{project.textLine2 || 'Вторая строка'}</span>}
          </div>
        </div>

        <div className={`rs-exact-mode ${isExactMode ? 'is-exact' : 'is-preview'}`}>
          <b>{isExactMode ? '🟢 Точный режим' : '🟠 Предварительная визуализация'}</b>
          <span>{isExactMode ? `Масштаб задан: ${project.scaleCm} см = ${Math.round(lineLengthPx)} px` : 'Для точного размера задайте 2 точки и реальное расстояние.'}</span>
          {mmPerPx && <small>1 px = {mmPerPx} мм · точность {estimatedAccuracy}</small>}
          <small>Автосохранение: {formatTime(project.autosavedAt)}</small>
        </div>

        <div className="rs-status-pill">
          {project.calibrationMode && 'Кликните 2 точки на фасаде: вывеска привяжется к реальному размеру'}
          {project.rulerMode && 'Линейка: кликните 2 точки'}
          {!project.calibrationMode && !project.rulerMode && (project.facadeDataUrl ? 'Фото фасада загружено. Для точного размера нажмите «2 точки»' : 'Загрузите фото фасада слева')}
        </div>
      </div>
    </div>
  );
}
