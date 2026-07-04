import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './styles.css';

type Point = { x: number; y: number };
type Lighting = 'front' | 'back' | 'combo' | 'none';
type ColorItem = [string, string, string];

const ORACAL_8500: ColorItem[] = [
  ['010', 'White / Белый', '#ffffff'], ['020', 'Golden Yellow / Золотисто-жёлтый', '#ffc400'], ['021', 'Yellow / Жёлтый', '#ffdd00'], ['025', 'Brimstone Yellow / Серно-жёлтый', '#f4e600'],
  ['030', 'Dark Red / Тёмно-красный', '#9e1827'], ['031', 'Red / Красный', '#d71928'], ['032', 'Light Red / Светло-красный', '#ef3340'], ['034', 'Orange / Оранжевый', '#ff7f18'],
  ['036', 'Light Orange / Светло-оранжевый', '#ff9d23'], ['040', 'Violet / Фиолетовый', '#6c2a8d'], ['041', 'Pink / Розовый', '#e64b9b'], ['042', 'Lilac / Сиреневый', '#9b6bd3'],
  ['047', 'Orange Red / Оранжево-красный', '#ff4425'], ['049', 'King Blue / Королевский синий', '#00377a'], ['050', 'Dark Blue / Тёмно-синий', '#003f87'], ['051', 'Gentian Blue / Синий', '#0057b8'],
  ['052', 'Azure Blue / Лазурный', '#008fd3'], ['053', 'Light Blue / Светло-синий', '#58bce8'], ['056', 'Ice Blue / Ледяной синий', '#a8d9f3'], ['060', 'Dark Green / Тёмно-зелёный', '#007241'],
  ['061', 'Green / Зелёный', '#00a651'], ['063', 'Lime-tree Green / Лайм', '#7ac143'], ['064', 'Yellow Green / Жёлто-зелёный', '#a7c900'], ['070', 'Black / Чёрный', '#111111'],
  ['071', 'Grey / Серый', '#777777'], ['073', 'Dark Grey / Тёмно-серый', '#4d4d4d'], ['080', 'Brown / Коричневый', '#70401f'], ['082', 'Beige / Бежевый', '#d5b77e']
];

const ORACAL_641: ColorItem[] = [
  ['010', 'White / Белый', '#ffffff'], ['019', 'Signal Yellow / Сигнально-жёлтый', '#ffe600'], ['020', 'Golden Yellow / Золотисто-жёлтый', '#f7c600'], ['021', 'Yellow / Жёлтый', '#ffd900'], ['025', 'Brimstone Yellow / Серно-жёлтый', '#f3e500'],
  ['030', 'Dark Red / Тёмно-красный', '#a20f1d'], ['031', 'Red / Красный', '#d71920'], ['032', 'Light Red / Светло-красный', '#ee2e24'], ['034', 'Orange / Оранжевый', '#f58220'], ['035', 'Pastel Orange / Пастельно-оранжевый', '#ff9f1c'],
  ['040', 'Violet / Фиолетовый', '#6f2da8'], ['041', 'Pink / Розовый', '#f06292'], ['042', 'Lilac / Сиреневый', '#9c6ade'], ['043', 'Lavender / Лавандовый', '#8e7cc3'], ['045', 'Soft Pink / Мягкий розовый', '#f7a8c8'],
  ['049', 'King Blue / Королевский синий', '#002f6c'], ['050', 'Dark Blue / Тёмно-синий', '#003f87'], ['051', 'Gentian Blue / Генциановый синий', '#0057b8'], ['052', 'Azure Blue / Лазурный', '#008bd2'], ['053', 'Light Blue / Светло-синий', '#5dade2'], ['056', 'Ice Blue / Ледяной синий', '#a7d8f0'],
  ['060', 'Dark Green / Тёмно-зелёный', '#006b3f'], ['061', 'Green / Зелёный', '#009b48'], ['063', 'Lime-tree Green / Лайм', '#7ac143'], ['064', 'Yellow Green / Жёлто-зелёный', '#9acd32'],
  ['070', 'Black / Чёрный', '#111111'], ['071', 'Grey / Серый', '#7a7a7a'], ['072', 'Light Grey / Светло-серый', '#b6b6b6'], ['073', 'Dark Grey / Тёмно-серый', '#4a4a4a'], ['074', 'Middle Grey / Средне-серый', '#8a8a8a'],
  ['080', 'Brown / Коричневый', '#6b3f22'], ['081', 'Light Brown / Светло-коричневый', '#9a6b3f'], ['082', 'Beige / Бежевый', '#d7b98c'], ['083', 'Nut Brown / Ореховый', '#7b4b2a'], ['090', 'Silver Grey / Серебро', '#bfc3c7'], ['091', 'Gold / Золото', '#c5a14a']
];

const FONTS = [
  'Arial', 'Arial Black', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Courier New',
  'Montserrat', 'Inter', 'Roboto', 'Open Sans', 'PT Sans', 'PT Serif', 'Rubik', 'Manrope', 'Nunito Sans', 'Oswald', 'Ubuntu',
  'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Lora', 'Bebas Neue', 'Impact', 'Franklin Gothic Medium', 'Gill Sans', 'Century Gothic'
];

const mm = (value: number) => `${Math.round(value)} мм`;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const defaultState = {
  text: 'РЕКЛАМАСТРОЙ',
  font: 'Arial Black',
  face: '#ffffff',
  side: '#333333',
  letterHeightMm: 300,
  calibrationMm: 1200,
  lighting: 'front' as Lighting,
  night: false,
  twoLines: false,
  signPos: { x: 170, y: 250 } as Point,
  rotation: 0
};

function maxLineLength(lines: string[]) {
  return Math.max(1, ...lines.map(line => line.trim().length || 1));
}

function lightingLabel(lighting: Lighting) {
  if (lighting === 'front') return 'Лицевая подсветка';
  if (lighting === 'back') return 'Контражур';
  if (lighting === 'combo') return 'Лицевая + контражур';
  return 'Без подсветки';
}

function App() {
  const [text, setText] = useState(defaultState.text);
  const [font, setFont] = useState(defaultState.font);
  const [face, setFace] = useState(defaultState.face);
  const [side, setSide] = useState(defaultState.side);
  const [letterHeightMm, setLetterHeightMm] = useState(defaultState.letterHeightMm);
  const [calibrationMm, setCalibrationMm] = useState(defaultState.calibrationMm);
  const [lighting, setLighting] = useState<Lighting>(defaultState.lighting);
  const [night, setNight] = useState(defaultState.night);
  const [twoLines, setTwoLines] = useState(defaultState.twoLines);
  const [facade, setFacade] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [points, setPoints] = useState<Point[]>([]);
  const [placingPoints, setPlacingPoints] = useState(false);
  const [signPos, setSignPos] = useState<Point>(defaultState.signPos);
  const [rotation, setRotation] = useState(defaultState.rotation);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [savedAt, setSavedAt] = useState('');
  const [stageSize, setStageSize] = useState({ width: 1000, height: 650 });
  const stageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('rsDesignerProject');
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      setText(s.text ?? defaultState.text); setFont(s.font ?? defaultState.font); setFace(s.face ?? defaultState.face); setSide(s.side ?? defaultState.side);
      setLetterHeightMm(s.letterHeightMm ?? defaultState.letterHeightMm); setCalibrationMm(s.calibrationMm ?? defaultState.calibrationMm);
      setLighting(s.lighting ?? defaultState.lighting); setNight(Boolean(s.night)); setTwoLines(Boolean(s.twoLines)); setFacade(s.facade ?? ''); setLogo(s.logo ?? '');
      setPoints(s.points ?? []); setSignPos(s.signPos ?? defaultState.signPos); setRotation(s.rotation ?? defaultState.rotation);
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { text, font, face, side, letterHeightMm, calibrationMm, lighting, night, twoLines, facade, logo, points, signPos, rotation };
    const t = setTimeout(() => {
      localStorage.setItem('rsDesignerProject', JSON.stringify(payload));
      setSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    }, 500);
    return () => clearTimeout(t);
  }, [text, font, face, side, letterHeightMm, calibrationMm, lighting, night, twoLines, facade, logo, points, signPos, rotation]);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const update = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag || !stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      setSignPos({ x: clamp(e.clientX - r.left - drag.dx, 0, stageSize.width - 40), y: clamp(e.clientY - r.top - drag.dy, 0, stageSize.height - 40) });
    };
    const up = () => setDrag(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag, stageSize]);

  const lines = useMemo(() => {
    if (!twoLines) return [text];
    const parts = text.trim().split(/\s+/);
    return parts.length > 1 ? [parts[0], parts.slice(1).join(' ')] : [text, ''];
  }, [text, twoLines]);

  const pxPerMm = points.length === 2 ? distance(points[0], points[1]) / Math.max(1, calibrationMm) : 0;
  const exact = pxPerMm > 0;
  const letterHeightPx = exact ? letterHeightMm * pxPerMm : 64;
  const logoWidthMm = logo ? letterHeightMm * 1.12 : 0;
  const textWidthMm = maxLineLength(lines) * letterHeightMm * 0.62;
  const gapMm = logo ? letterHeightMm * 0.18 : 0;
  const signWidthMm = Math.round(logoWidthMm + gapMm + textWidthMm);
  const signWidthPx = exact ? signWidthMm * pxPerMm : Math.max(360, signWidthMm / 7);
  const signHeightMm = twoLines ? Math.round(letterHeightMm * 1.92) : letterHeightMm;
  const signHeightPx = exact ? signHeightMm * pxPerMm : (twoLines ? 124 : 64);
  const sideDepthPx = Math.max(2, letterHeightPx * 0.07);
  const glow = lighting === 'none' ? 'none' : lighting === 'back' ? `0 0 ${letterHeightPx * 0.55}px ${face}` : lighting === 'combo' ? `0 0 ${letterHeightPx * 0.52}px ${face}, ${sideDepthPx}px ${sideDepthPx}px ${sideDepthPx * 1.5}px rgba(0,0,0,.45)` : `0 0 ${letterHeightPx * 0.38}px ${face}`;

  const onFacade = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setFacade(String(reader.result)); reader.readAsDataURL(file);
  };
  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const ok = file.type === 'image/svg+xml' || file.type === 'image/png';
    if (!ok) { alert('Загрузите логотип только в SVG или PNG с прозрачным фоном.'); return; }
    const reader = new FileReader(); reader.onload = () => setLogo(String(reader.result)); reader.readAsDataURL(file);
  };
  const clickStage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingPoints || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    setPoints(prev => prev.length >= 2 ? [p] : [...prev, p]);
  };
  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (placingPoints || !stageRef.current) return;
    e.stopPropagation();
    const r = stageRef.current.getBoundingClientRect();
    setDrag({ dx: e.clientX - r.left - signPos.x, dy: e.clientY - r.top - signPos.y });
  };

  const pdf = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/jpeg', 0.95);
    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.addImage(img, 'JPEG', 0, 0, 297, 210);
    doc.save('reklamastroy-visualization.pdf');
  };

  const stageScaleForPdf = 980 / Math.max(1, stageSize.width);

  const SignGraphic = ({ pdfMode = false, scale = 1 }: { pdfMode?: boolean; scale?: number }) => {
    const fontSize = letterHeightPx * scale;
    const widthPx = signWidthPx * scale;
    const heightPx = signHeightPx * scale;
    const depthPx = sideDepthPx * scale;
    const textShadow = night
      ? glow
      : `${depthPx}px ${depthPx}px 0 ${side}, ${depthPx * 1.35}px ${depthPx * 1.5}px ${depthPx * 1.4}px rgba(0,0,0,.32)`;
    return <div className={pdfMode ? 'sign signPdf' : 'sign'} style={{ left: pdfMode ? signPos.x * scale : signPos.x, top: pdfMode ? signPos.y * scale : signPos.y, width: widthPx, transform: `rotate(${rotation}deg)` }} onMouseDown={pdfMode ? undefined : startDrag}>
      <svg className="signDims" width={widthPx + 84} height={heightPx + 72} viewBox={`0 0 ${widthPx + 84} ${heightPx + 72}`}>
        <defs><marker id={`arrow-${pdfMode ? 'pdf' : 'live'}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/></marker></defs>
        <line x1="10" y1="22" x2={widthPx + 10} y2="22" markerStart={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} />
        <text x={widthPx / 2 + 10} y="16" textAnchor="middle">{mm(signWidthMm)}</text>
        <line x1={widthPx + 42} y1="44" x2={widthPx + 42} y2={heightPx + 44} markerStart={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} />
        <text x={widthPx + 62} y={heightPx / 2 + 50} textAnchor="middle" transform={`rotate(90 ${widthPx + 62} ${heightPx / 2 + 50})`}>{mm(signHeightMm)}</text>
      </svg>
      <div className="letters" style={{ fontFamily: font, color: face, fontSize, textShadow }}>
        {logo && <img className="logo" src={logo} style={{ height: fontSize, filter: night ? `drop-shadow(0 0 ${fontSize * 0.34}px ${face}) drop-shadow(${depthPx}px ${depthPx}px 0 ${side})` : `drop-shadow(${depthPx}px ${depthPx}px 0 ${side}) drop-shadow(${depthPx * 1.25}px ${depthPx * 1.35}px ${depthPx * 1.2}px rgba(0,0,0,.32))` }}/>} 
        <div className="textBlock">{lines.map((line, i) => <span key={i} style={{ WebkitTextStroke: `${Math.max(1, fontSize * 0.018)}px ${side}` }}>{line}</span>)}</div>
      </div>
    </div>;
  };

  const CalibrationLine = ({ scale = 1, pdfMode = false }: { scale?: number; pdfMode?: boolean }) => {
    const markerId = pdfMode ? 'calArrowPdf' : 'calArrowLive';
    return points.length === 2 ? <svg className="measure"><defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/></marker></defs><line x1={points[0].x * scale} y1={points[0].y * scale} x2={points[1].x * scale} y2={points[1].y * scale} markerStart={`url(#${markerId})`} markerEnd={`url(#${markerId})`}/><text x={(points[0].x+points[1].x)/2 * scale} y={(points[0].y+points[1].y)/2 * scale-10}>{mm(calibrationMm)}</text></svg> : null;
  };

  return <>
    <header className="topbar glass">
      <div className="brand"><b>РЕКЛАМА<span>СТРОЙ</span></b><small>профессиональный онлайн-конструктор</small></div>
      <div className="heroTitle"><h1>Онлайн примерка вывески с привязкой к фасаду здания</h1><p>Фасад → масштаб → объёмные буквы → PDF-макет</p></div>
      <button className="primaryExport" onClick={pdf}>Скачать PDF</button>
    </header>

    <main className="app">
      <aside className="toolRail" aria-label="Этапы конструктора">
        <div className="railItem active"><strong>01</strong><span>Фасад</span></div>
        <div className="railItem"><strong>02</strong><span>Масштаб</span></div>
        <div className="railItem"><strong>03</strong><span>Буквы</span></div>
        <div className="railItem"><strong>04</strong><span>Цвет</span></div>
        <div className="railItem"><strong>05</strong><span>PDF</span></div>
      </aside>
      <aside className="panel left">
        <h2>Фасад и масштаб</h2>
        <div className="hintBox"><b>1. Загрузите фото фасада</b><span>Форматы: JPG, JPEG, PNG, WEBP, HEIC/HEIF. Лучше фото прямо, без сильного угла.</span></div>
        <label className="file">Загрузить фасад<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heif,image/heic" onChange={onFacade}/></label>
        <div className="hintBox"><b>2. Задайте реальный масштаб</b><span>Поставьте 2 точки по известному размеру: ширина окна, двери или витрины. Затем введите расстояние в мм.</span></div>
        <button className={placingPoints ? 'active' : ''} onClick={() => setPlacingPoints(v => !v)}>{placingPoints ? 'Кликните 2 точки на фото' : 'Калибровать по 2 точкам'}</button>
        <label>Фактический размер между точками, мм<input type="number" value={calibrationMm} onChange={e => setCalibrationMm(Number(e.target.value) || 1)} /></label>
        <div className={exact ? 'status ok' : 'status warn'}>{exact ? `Точный режим · 1 px = ${(1/pxPerMm).toFixed(1)} мм · точность ≈ ±1–3%` : 'Предварительная визуализация. Укажите известный размер на фото двумя точками.'}</div>
        <div className="savePill">✓ Автосохранение {savedAt ? `· ${savedAt}` : 'включено'}</div>

        <h2>Вывеска</h2>
        <div className="hintBox"><b>3. Настройте вывеску</b><span>Введите текст, высоту букв в мм, шрифт, ORACAL и тип подсветки. Размер на фасаде будет рассчитываться по калибровке.</span></div>
        <label>Текст<input value={text} onChange={e => setText(e.target.value)} /></label>
        <label>Шрифт<select value={font} onChange={e => setFont(e.target.value)}>{FONTS.map(f => <option key={f}>{f}</option>)}</select></label>
        <label>Высота букв, мм<input type="number" value={letterHeightMm} onChange={e => setLetterHeightMm(Number(e.target.value) || 1)} /></label>
        <label>Поворот вывески, °<input type="number" value={rotation} onChange={e => setRotation(Number(e.target.value) || 0)} /></label>
        <label className="check"><input type="checkbox" checked={twoLines} onChange={e => setTwoLines(e.target.checked)} /> Две строки</label>
        <label className="file">Добавить свой логотип<input type="file" accept="image/svg+xml,image/png" onChange={onLogo}/></label><small className="tip">Логотип: только SVG или PNG с прозрачным фоном.</small>
        {logo && <button onClick={() => setLogo('')}>Удалить логотип</button>}
      </aside>

      <section className="workspace">
        <div className="flowStrip">
          <div><b>📷 Фасад</b><span>загрузите фото прямо</span></div>
          <div><b>📏 Калибровка</b><span>2 точки + размер</span></div>
          <div><b>🔤 Вывеска</b><span>текст, логотип, высота</span></div>
          <div><b>💡 День/ночь</b><span>проверка свечения</span></div>
          <div><b>📄 PDF</b><span>макет с размерами</span></div>
        </div>
        <div className="toolbar"><div className="modeSwitch"><button onClick={() => setNight(false)} className={!night ? 'active' : ''}>☀ День</button><button onClick={() => setNight(true)} className={night ? 'active' : ''}>🌙 Ночь</button></div><button onClick={() => setPoints([])}>Сбросить точки</button><div className="miniInfo">{exact ? '🟢 Точный режим включён' : '🟠 Нужна калибровка масштаба'}</div></div>
        <div className={'stage ' + (night ? 'night' : '')} ref={stageRef} onClick={clickStage}>
          {facade ? <img src={facade} className="facade"/> : <div className="placeholder">Загрузите фото фасада</div>}
          {points.map((p, i) => <div key={i} className="point" style={{ left: p.x, top: p.y }}>{i + 1}</div>)}
          <CalibrationLine />
          <SignGraphic />
        </div>
      </section>

      <aside className="panel right">
        <div className="modernCard premium"><b>Профессиональная примерка</b><span>Цвета ORACAL, объём, свет, логотип и PDF в одном современном интерфейсе.</span><em>{exact ? 'Точный масштаб активен' : 'Сначала задайте масштаб'}</em></div>
        <h2>Лицевая часть · ORACAL 8500</h2>
        <label>Выбранный цвет<select value={face} onChange={e => setFace(e.target.value)}>{ORACAL_8500.map(c => <option key={c[0]} value={c[2]}>{c[0]} — {c[1]}</option>)}</select></label>
        <div className="swatches labeled">{ORACAL_8500.map(c => <button key={c[0]} title={`${c[0]} ${c[1]}`} className={face===c[2]?'selected':''} onClick={() => setFace(c[2])}><i style={{background:c[2]}}/><span>{c[0]}</span><small>{c[1].split('/')[0]}</small></button>)}</div>
        <h2>Борта · ORACAL 641</h2>
        <label>Выбранный цвет<select value={side} onChange={e => setSide(e.target.value)}>{ORACAL_641.map(c => <option key={c[0]} value={c[2]}>{c[0]} — {c[1]}</option>)}</select></label>
        <div className="swatches labeled">{ORACAL_641.map(c => <button key={c[0]} title={`${c[0]} ${c[1]}`} className={side===c[2]?'selected':''} onClick={() => setSide(c[2])}><i style={{background:c[2]}}/><span>{c[0]}</span><small>{c[1].split('/')[0]}</small></button>)}</div>
        <h2>Тип подсветки</h2>
        <div className="lightingCards">
          {([['front','Лицевая'],['back','Контражур'],['combo','Лицевая + контражур'],['none','Без подсветки']] as [Lighting,string][]).map(([v,t]) => <button key={v} className={lighting===v?'active':''} onClick={() => setLighting(v)}><b className={`sampleA ${v}`} style={{color:face}}>A</b><span>{t}</span></button>)}
        </div>
      </aside>
    </main>

    <div className="pdfPage" ref={pdfRef}>
      <div className="pdfHeader"><b>РЕКЛАМА<span>СТРОЙ</span></b><div>Визуализация вывески · {new Date().toLocaleDateString('ru-RU')}</div></div>
      <div className="pdfStageWrap">
        {facade ? <img src={facade} className="facade"/> : <div className="placeholder">Фото фасада не загружено</div>}
        {points.map((p, i) => <div key={i} className="point pdfPoint" style={{ left: p.x * stageScaleForPdf, top: p.y * stageScaleForPdf }}>{i + 1}</div>)}
        <CalibrationLine scale={stageScaleForPdf} pdfMode/>
        <SignGraphic pdfMode scale={stageScaleForPdf}/>
      </div>
      <div className="pdfTable"><div>Длина композиции: {mm(signWidthMm)}</div><div>Высота композиции: {mm(signHeightMm)}</div><div>Высота букв: {mm(letterHeightMm)}</div><div>Калибровка: {exact ? mm(calibrationMm) : 'не задана'}</div><div>Подсветка: {lightingLabel(lighting)}</div><div>Шрифт: {font}</div></div>
      <div className="watermark">REKLAMASTROY</div>
    </div>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
