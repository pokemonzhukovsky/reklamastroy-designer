export function CanvasStage() {
  return (
    <div className="rs-canvas-card">
      <div className="rs-canvas-toolbar">
        <span>Рабочая область</span>
        <button>День</button>
        <button>Ночь</button>
      </div>
      <div className="rs-canvas-placeholder">
        <div className="rs-watermark-pattern">RS</div>
        <div className="rs-sign-preview">
          <span className="rs-sign-logo">RS</span>
          <span className="rs-sign-text">Реклама<span>Строй</span></span>
        </div>
      </div>
    </div>
  );
}
