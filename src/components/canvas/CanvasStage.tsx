import { useProjectStore } from '../../store/projectStore';

export function CanvasStage() {
  const project = useProjectStore();
  const glow = project.lighting === 'none' ? 'none' : `0 0 22px ${project.faceColor}, 0 0 44px ${project.faceColor}`;
  const signStyle = {
    color: project.faceColor,
    textShadow: project.nightMode ? glow : '10px 12px 0 rgba(0,0,0,.22)',
    '--rs-side-color': project.sideColor,
  } as React.CSSProperties;

  return (
    <div className="rs-canvas-card">
      <div className="rs-canvas-toolbar">
        <span>Рабочая область</span>
        <div className="rs-toolbar-actions">
          <button className={!project.nightMode ? 'active' : ''} onClick={() => project.setNightMode(false)}>День</button>
          <button className={project.nightMode ? 'active' : ''} onClick={() => project.setNightMode(true)}>Ночь</button>
        </div>
      </div>

      <div className={`rs-canvas-placeholder ${project.nightMode ? 'is-night' : ''}`}>
        <div className="rs-watermark-pattern">RS RS RS</div>

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
      </div>
    </div>
  );
}
