import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';

type Point = { x: number; y: number };

export function CanvasStage() {
  const project = useProjectStore();
  const [points, setPoints] = useState<Point[]>([]);
  const [wallPoints, setWallPoints] = useState<Point[]>([]);

  const glow = project.lighting === 'none' ? 'none' : `0 0 22px ${project.faceColor}, 0 0 44px ${project.faceColor}`;
  const signStyle = {
    color: project.faceColor,
    textShadow: project.nightMode ? glow : '10px 12px 0 rgba(0,0,0,.22)',
    '--rs-side-color': project.sideColor,
  } as React.CSSProperties;

  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    if (project.calibrationMode || project.rulerMode) {
      setPoints((current) => current.length >= 2 ? [point] : [...current, point]);
      return;
    }
    if (project.wallMode) {
      setWallPoints((current) => current.length >= 4 ? [point] : [...current, point]);
    }
  };

  const lineLengthPx = points.length === 2 ? Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) : 0;
  const mmPerPx = lineLengthPx ? (project.scaleCm * 10 / lineLengthPx).toFixed(1) : null;

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

        {wallPoints.length > 0 && (
          <svg className="rs-overlay-svg">
            <polygon points={wallPoints.map((p) => `${p.x},${p.y}`).join(' ')} className="rs-wall-polygon" />
            {wallPoints.map((p, index) => <circle key={index} cx={p.x} cy={p.y} r="5" className="rs-point" />)}
          </svg>
        )}

        {points.length > 0 && (
          <svg className="rs-overlay-svg">
            {points.length === 2 && <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} className="rs-measure-line" />}
            {points.map((p, index) => <circle key={index} cx={p.x} cy={p.y} r="6" className="rs-point" />)}
          </svg>
        )}

        {project.frameEnabled && (
          <div className="rs-frame" style={{ backgroundColor: project.frameColor }}>
            <span style={{ backgroundColor: project.frameColor }} />
            <span style={{ backgroundColor: project.frameColor }} />
          </div>
        )}

        <div className="rs-sign-preview" style={signStyle}>
          {project.logoDataUrl ? (
            <img className="rs-uploaded-logo" src={project.logoDataUrl} alt="Загруженный логотип" />
          ) : (
            <span className="rs-sign-logo" style={{ borderColor: project.faceColor }}>RS</span>
          )}
          <div className="rs-sign-lines">
            <span className="rs-sign-text" style={{ fontSize: `${Math.max(28, project.capitalHeightCm * 1.55)}px` }}>{project.textLine1 || 'РекламаСтрой'}</span>
            {project.twoRows && <span className="rs-sign-text rs-sign-text-second" style={{ fontSize: `${Math.max(24, project.capitalHeightCm * 1.25)}px` }}>{project.textLine2 || 'Вторая строка'}</span>}
          </div>
        </div>

        <div className="rs-status-pill">
          {project.calibrationMode && 'Кликните 2 точки на фасаде'}
          {project.rulerMode && 'Линейка: кликните 2 точки'}
          {project.wallMode && 'Плоскость: кликните 4 угла'}
          {!project.calibrationMode && !project.rulerMode && !project.wallMode && (project.facadeDataUrl ? 'Фото фасада загружено' : 'Загрузите фото фасада слева')}
          {mmPerPx && ` · ${project.scaleCm} см = ${Math.round(lineLengthPx)} px · ${mmPerPx} мм/px`}
        </div>
      </div>
    </div>
  );
}
