import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './styles.css';

type Point = { x: number; y: number };
type Lighting = 'front' | 'back' | 'combo' | 'none';
type LogoPosition = 'left' | 'right';
type ColorItem = [string, string, string];
type DragMode = null | { type: 'sign'; dx: number; dy: number } | { type: 'point'; index: number } | { type: 'rotate'; angleOffset: number };

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
  ['070', 'Black / Чёрный', '#111111'], ['071', 'Grey / Серый', '#7a7a7a'], ['072', 'Light Grey / Светло-серый', '#b6b6b6'], ['073', 'Dark Grey / Тёмно-серый', '#4a4a4a'], ['074', 'Middle Grey / Средний серый', '#8a8a8a'],
  ['080', 'Brown / Коричневый', '#6b3f22'], ['081', 'Light Brown / Светло-коричневый', '#9a6b3f'], ['082', 'Beige / Бежевый', '#d7b98c'], ['083', 'Nut Brown / Ореховый', '#7b4b2a'], ['090', 'Silver Grey / Серебро', '#bfc3c7'], ['091', 'Gold / Золото', '#c5a14a']
];

const FONTS = [
  'Arial', 'Arial Black', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Courier New',
  'Montserrat', 'Inter', 'Roboto', 'Open Sans', 'PT Sans', 'PT Serif', 'Rubik', 'Manrope', 'Nunito Sans', 'Oswald', 'Ubuntu',
  'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Lora', 'Bebas Neue', 'Impact', 'Franklin Gothic Medium', 'Gill Sans', 'Century Gothic'
];

const cm = (value: number) => `${Math.round(value)} см`;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const defaultState = {
  line1: 'Вывеска',
  line2: '',
  font: 'Arial Black',
  face: '#ffffff',
  side: '#333333',
  line1HeightCm: 30,
  line2HeightCm: 24,
  calibrationCm: 120,
  lighting: 'front' as Lighting,
  night: false,
  twoLines: false,
  facade: '',
  logo: '',
  logoAspect: 1.12,
  logoHeightCm: 30,
  logoPosition: 'left' as LogoPosition,
  points: [] as Point[],
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

function optionLabel(c: ColorItem) { return `${c[0]} — ${c[1]}`; }
function colorName(list: ColorItem[], hex: string) {
  const found = list.find(c => c[2].toLowerCase() === hex.toLowerCase());
  if (!found) return hex;
  return `${found[0]} — ${found[1].split(' / ')[1] || found[1]}`;
}

function App() {
  const [line1, setLine1] = useState(defaultState.line1);
  const [line2, setLine2] = useState(defaultState.line2);
  const [font, setFont] = useState(defaultState.font);
  const [face, setFace] = useState(defaultState.face);
  const [side, setSide] = useState(defaultState.side);
  const [line1HeightCm, setLine1HeightCm] = useState(defaultState.line1HeightCm);
  const [line2HeightCm, setLine2HeightCm] = useState(defaultState.line2HeightCm);
  const [calibrationCm, setCalibrationCm] = useState(defaultState.calibrationCm);
  const [lighting, setLighting] = useState<Lighting>(defaultState.lighting);
  const [night, setNight] = useState(defaultState.night);
  const [twoLines, setTwoLines] = useState(defaultState.twoLines);
  const [facade, setFacade] = useState(defaultState.facade);
  const [logo, setLogo] = useState(defaultState.logo);
  const [logoAspect, setLogoAspect] = useState(defaultState.logoAspect);
  const [logoHeightCm, setLogoHeightCm] = useState(defaultState.logoHeightCm);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(defaultState.logoPosition);
  const [points, setPoints] = useState<Point[]>(defaultState.points);
  const [placingPoints, setPlacingPoints] = useState(false);
  const [signPos, setSignPos] = useState<Point>(defaultState.signPos);
  const [rotation, setRotation] = useState(defaultState.rotation);
  const [drag, setDrag] = useState<DragMode>(null);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 1000, height: 650 });
  const [stageShot, setStageShot] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('rsDesignerProjectV311');
    if (!raw) return;
    try {
      const st = JSON.parse(raw);
      const legacyText = st.text || '';
      const parts = legacyText.trim().split(/\s+/);
      setLine1(st.line1 ?? (legacyText ? (st.twoLines && parts.length > 1 ? parts[0] : legacyText) : defaultState.line1));
      setLine2(st.line2 ?? (st.twoLines && parts.length > 1 ? parts.slice(1).join(' ') : defaultState.line2));
      setFont(st.font ?? defaultState.font);
      setFace(st.face ?? defaultState.face);
      setSide(st.side ?? defaultState.side);
      setLine1HeightCm(st.line1HeightCm ?? st.line1HeightCm ?? defaultState.line1HeightCm);
      setLine2HeightCm(st.line2HeightCm ?? Math.round((st.line1HeightCm ?? defaultState.line1HeightCm) * 0.8));
      setCalibrationCm(st.calibrationCm ?? st.calibrationMm / 10 ?? defaultState.calibrationCm);
      setLighting(st.lighting ?? defaultState.lighting);
      setNight(Boolean(st.night));
      setTwoLines(Boolean(st.twoLines));
      setFacade(st.facade ?? '');
      setLogo(st.logo ?? '');
      setLogoAspect(st.logoAspect ?? defaultState.logoAspect);
      setLogoHeightCm(st.logoHeightCm ?? st.line1HeightCm ?? st.line1HeightCm ?? defaultState.logoHeightCm);
      setLogoPosition(st.logoPosition ?? defaultState.logoPosition);
      setPoints(st.points ?? []);
      setSignPos(st.signPos ?? defaultState.signPos);
      setRotation(st.rotation ?? defaultState.rotation);
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { line1, line2, font, face, side, line1HeightCm, line2HeightCm, calibrationCm, lighting, night, twoLines, facade, logo, logoAspect, logoHeightCm, logoPosition, points, signPos, rotation };
    const t = setTimeout(() => {
      localStorage.setItem('rsDesignerProjectV311', JSON.stringify(payload));
    }, 700);
    return () => clearTimeout(t);
  }, [line1, line2, font, face, side, line1HeightCm, line2HeightCm, calibrationCm, lighting, night, twoLines, facade, logo, logoAspect, logoHeightCm, logoPosition, points, signPos, rotation]);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const update = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const getStagePoint = (clientX: number, clientY: number): Point => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag || !stageRef.current) return;
      const p = getStagePoint(e.clientX, e.clientY);
      if (drag.type === 'sign') {
        setSignPos({ x: clamp(p.x - drag.dx, 0, stageSize.width - 40), y: clamp(p.y - drag.dy, 0, stageSize.height - 40) });
      }
      if (drag.type === 'point') {
        setPoints(prev => prev.map((pt, i) => i === drag.index ? { x: clamp(p.x, 0, stageSize.width), y: clamp(p.y, 0, stageSize.height) } : pt));
      }
      if (drag.type === 'rotate') {
        const cx = signPos.x + signWidthPx / 2;
        const cy = signPos.y + signHeightPx / 2;
        setRotation(Math.round(Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + drag.angleOffset));
      }
    };
    const up = () => setDrag(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag, stageSize, signPos]);

  const lines = useMemo(() => twoLines ? [line1 || ' ', line2 || ' '] : [line1 || ' '], [line1, line2, twoLines]);
  const lineHeightsCm = useMemo(() => twoLines ? [line1HeightCm, line2HeightCm] : [line1HeightCm], [twoLines, line1HeightCm, line2HeightCm]);

  const pxPerCm = points.length === 2 ? distance(points[0], points[1]) / Math.max(1, calibrationCm) : 0;
  const exact = pxPerCm > 0;
  const maxLetterHeightCm = Math.max(...lineHeightsCm);
  const letterHeightPx = exact ? maxLetterHeightCm * pxPerCm : 64;
  const logoWidthCm = logo ? logoHeightCm * logoAspect : 0;
  const textWidthCm = Math.max(1, ...lines.map((line, i) => (line.trim().length || 1) * lineHeightsCm[i] * 0.62));
  const gapCm = logo ? Math.max(4, Math.min(maxLetterHeightCm, logoHeightCm) * 0.18) : 0;
  const signWidthCm = Math.round(logoWidthCm + gapCm + textWidthCm);
  const signWidthPx = exact ? signWidthCm * pxPerCm : Math.max(300, signWidthCm * 4.8);
  const textHeightCm = twoLines ? Math.round(line1HeightCm * 0.95 + line2HeightCm * 0.95 + Math.max(3, Math.min(line1HeightCm, line2HeightCm) * 0.18)) : line1HeightCm;
  const signHeightCm = Math.round(Math.max(textHeightCm, logo ? logoHeightCm : 0));
  const signHeightPx = exact ? signHeightCm * pxPerCm : Math.max(twoLines ? 124 : 64, logo ? (logoHeightCm / Math.max(1, maxLetterHeightCm)) * 64 : 0);
  const sideDepthPx = Math.max(1.2, letterHeightPx * 0.035);
  const glow = lighting === 'none' ? 'none' : lighting === 'back' ? `0 0 ${letterHeightPx * 0.55}px ${face}` : lighting === 'combo' ? `0 0 ${letterHeightPx * 0.52}px ${face}, ${sideDepthPx}px ${sideDepthPx}px ${sideDepthPx * 1.5}px rgba(0,0,0,.45)` : `0 0 ${letterHeightPx * 0.38}px ${face}`;

  const onFacade = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setFacade(String(reader.result)); reader.readAsDataURL(file);
  };
  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const ok = file.type === 'image/svg+xml' || file.type === 'image/png';
    if (!ok) { alert('Загрузите логотип только в SVG или PNG с прозрачным фоном.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setLogo(dataUrl);
      setLogoHeightCm(prev => prev || line1HeightCm);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setLogoAspect(clamp(img.naturalWidth / img.naturalHeight, 0.25, 6));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clickStage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingPoints || !stageRef.current || drag) return;
    const p = getStagePoint(e.clientX, e.clientY);
    setPoints(prev => {
      const next = prev.length >= 2 ? [p] : [...prev, p];
      if (next.length === 2) setPlacingPoints(false);
      return next;
    });
  };
  const startSignDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !stageRef.current) return;
    e.stopPropagation();
    const p = getStagePoint(e.clientX, e.clientY);
    setDrag({ type: 'sign', dx: p.x - signPos.x, dy: p.y - signPos.y });
  };
  const startPointDrag = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setDrag({ type: 'point', index });
  };

  const pdf = async () => {
    if (!pdfRef.current || !stageRef.current) return;

    // 1) Сначала снимаем точный снимок рабочей области.
    // Это исключает смещение вывески в PDF: берём фактическое положение, масштаб и поворот из браузера.
    document.body.classList.add('pdf-exporting');
    await new Promise(requestAnimationFrame);
    const stageCanvas = await html2canvas(stageRef.current, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const shot = stageCanvas.toDataURL('image/jpeg', 0.96);
    document.body.classList.remove('pdf-exporting');
    setStageShot(shot);

    // 2) Ждём, пока снимок подставится в скрытый PDF-шаблон.
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    const pages = Array.from(pdfRef.current.querySelectorAll('.pdfSheet')) as HTMLElement[];
    const doc = new jsPDF('landscape', 'mm', 'a4');
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) doc.addPage('a4', 'landscape');
      doc.addImage(img, 'JPEG', 0, 0, 297, 210);
    }
    doc.save('reklamastroy-visualization.pdf');
  };

  const drawingScale = Math.min(1.22, 820 / Math.max(1, signWidthPx + 130), 410 / Math.max(1, signHeightPx + 90));

  const SignGraphic = ({ pdfMode = false, scale = 1, drawingMode = false }: { pdfMode?: boolean; scale?: number; drawingMode?: boolean }) => {
    const fontSizes = lineHeightsCm.map(h => (exact ? h * pxPerCm : (h / Math.max(1, maxLetterHeightCm)) * 64) * scale);
    const fontSize = Math.max(...fontSizes);
    const widthPx = signWidthPx * scale;
    const heightPx = signHeightPx * scale;
    const logoHeightPx = (exact ? logoHeightCm * pxPerCm : (logoHeightCm / Math.max(1, line1HeightCm)) * 64) * scale;
    const depthPx = sideDepthPx * scale;
    const textShadow = night
      ? glow
      : `${depthPx}px ${depthPx}px 0 ${side}, ${depthPx * 1.25}px ${depthPx * 1.35}px ${depthPx}px rgba(0,0,0,.28)`;
    return <div
      className={(pdfMode ? 'sign signPdf' : 'sign') + (drawingMode ? ' drawingSign' : '')}
      style={{
        left: drawingMode ? undefined : (pdfMode ? signPos.x * scale : signPos.x),
        top: drawingMode ? undefined : (pdfMode ? signPos.y * scale : signPos.y),
        width: widthPx,
        transform: drawingMode ? 'rotate(0deg)' : `rotate(${rotation}deg)`
      }}
      onMouseDown={pdfMode ? undefined : startSignDrag}
    >
      {!pdfMode && <button className="rotateHandle" style={{ top: heightPx + 34, left: widthPx / 2 }} title="Зажмите и поверните вывеску" onMouseDown={(e) => {
        e.stopPropagation();
        if (!stageRef.current) return;
        const p = getStagePoint(e.clientX, e.clientY);
        const cx = signPos.x + signWidthPx / 2;
        const cy = signPos.y + signHeightPx / 2;
        const currentAngle = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI;
        setDrag({ type: 'rotate', angleOffset: rotation - currentAngle });
      }}>↻</button>}
      <svg className="signDims" width={widthPx + 76} height={heightPx + 88} viewBox={`0 0 ${widthPx + 76} ${heightPx + 88}`}>
        <defs>
          <marker id={`arrow-${pdfMode ? 'pdf' : 'live'}`} markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#ff6a00"/>
          </marker>
        </defs>
        {drawingMode && <>
          <line className="dimExt" x1="10" y1="26" x2="10" y2="48" />
          <line className="dimExt" x1={widthPx + 10} y1="26" x2={widthPx + 10} y2="48" />
          <line className="dimExt" x1={widthPx + 10} y1="48" x2={widthPx + 30} y2="48" />
          <line className="dimExt" x1={widthPx + 10} y1={heightPx + 48} x2={widthPx + 30} y2={heightPx + 48} />
        </>}
        <line x1="10" y1="26" x2={widthPx + 10} y2="26" markerStart={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} />
        <text x={widthPx / 2 + 10} y="18" textAnchor="middle">{cm(signWidthCm)}</text>
        <line x1={widthPx + 30} y1="48" x2={widthPx + 30} y2={heightPx + 48} markerStart={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-${pdfMode ? 'pdf' : 'live'})`} />
        <text x={widthPx + 52} y={heightPx / 2 + 54} textAnchor="middle" transform={`rotate(90 ${widthPx + 52} ${heightPx / 2 + 54})`}>{cm(signHeightCm)}</text>
      </svg>
      <div className="letters" style={{ fontFamily: font, color: face, fontSize, textShadow }}>
        {logo && logoPosition === 'left' && <img className="logo" src={logo} draggable={false} style={{ height: logoHeightPx, filter: night ? `drop-shadow(0 0 ${Math.max(logoHeightPx, fontSize) * 0.34}px ${face}) drop-shadow(${depthPx}px ${depthPx}px 0 ${side})` : `drop-shadow(${depthPx}px ${depthPx}px 0 ${side}) drop-shadow(${depthPx * 1.2}px ${depthPx * 1.2}px ${depthPx}px rgba(0,0,0,.26))` }}/>} 
        <div className="textBlock">{lines.map((line, i) => <span key={i} style={{ fontSize: fontSizes[i], WebkitTextStroke: `${Math.max(0.7, fontSizes[i] * 0.014)}px ${side}` }}>{line}</span>)}</div>
        {logo && logoPosition === 'right' && <img className="logo logoRight" src={logo} draggable={false} style={{ height: logoHeightPx, filter: night ? `drop-shadow(0 0 ${Math.max(logoHeightPx, fontSize) * 0.34}px ${face}) drop-shadow(${depthPx}px ${depthPx}px 0 ${side})` : `drop-shadow(${depthPx}px ${depthPx}px 0 ${side}) drop-shadow(${depthPx * 1.2}px ${depthPx * 1.2}px ${depthPx}px rgba(0,0,0,.26))` }}/>} 
      </div>
    </div>;
  };

  const CalibrationLine = () => null;

  return <>
    <header className="topbar">
      <div className="brand"><b>РЕКЛАМА<span>СТРОЙ</span></b><small>онлайн примерка вывески</small></div>
      <div className="heroTitle"><h1>Онлайн примерка вывески с привязкой к фасаду здания</h1><p>Загрузите фасад, задайте масштаб по 2 точкам и подберите вывеску в размере.</p></div>
      <button className="primaryExport" onClick={pdf}>Скачать PDF</button>
    </header>

    <main className="app">
      <aside className="panel left">
        <div className="sectionBadge">1 · Фасад</div>
        <div className="hintBox"><b>Загрузите фото фасада</b><span>Лучше фото прямо, без сильного угла. Подходят JPG, JPEG, PNG, WEBP, HEIC/HEIF.</span></div>
        <label className="file">Загрузить фасад<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heif,image/heic" onChange={onFacade}/></label>

        <div className="sectionBadge">2 · Масштаб</div>
        <div className="hintBox"><b>Поставьте 2 точки</b><span>Отметьте известный размер на фото: ширину окна, двери или витрины. Точки можно двигать мышкой.</span></div>
        <button className={placingPoints ? 'active' : ''} onClick={() => setPlacingPoints(v => !v)}>{placingPoints ? 'Кликните 2 точки на фото' : 'Калибровать по 2 точкам'}</button>
        <button className={!placingPoints ? 'moveSignBtn active' : 'moveSignBtn'} onClick={() => setPlacingPoints(false)}>Перемещать вывеску</button>
        <label>Фактический размер между точками, см<input type="number" value={calibrationCm} onChange={e => setCalibrationCm(Number(e.target.value) || 1)} /></label>

        <div className="sectionBadge">3 · Вывеска</div>
        <label>Текст первой строки<input value={line1} onChange={e => setLine1(e.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={twoLines} onChange={e => setTwoLines(e.target.checked)} /> Добавить вторую строку</label>
        {twoLines && <label>Текст второй строки<input value={line2} onChange={e => setLine2(e.target.value)} /></label>}
        <label>Шрифт<select value={font} onChange={e => setFont(e.target.value)}>{FONTS.map(f => <option key={f}>{f}</option>)}</select></label>
        <label>Высота первой строки, см<input type="number" value={line1HeightCm} onChange={e => setLine1HeightCm(Number(e.target.value) || 1)} /></label>
        {twoLines && <label>Высота второй строки, см<input type="number" value={line2HeightCm} onChange={e => setLine2HeightCm(Number(e.target.value) || 1)} /></label>}
        <label className="file secondary">Добавить свой логотип<input key={logoInputKey} type="file" accept="image/svg+xml,image/png" onChange={onLogo}/></label><small className="tip">Логотип: только SVG или PNG с прозрачным фоном.</small>
        <label className={!logo ? 'disabledLabel' : ''}>Высота логотипа, см<input disabled={!logo} type="number" value={logoHeightCm} onChange={e => setLogoHeightCm(Number(e.target.value) || 1)} /></label>
        <label className={!logo ? 'disabledLabel' : ''}>Размещение логотипа<select disabled={!logo} value={logoPosition} onChange={e => setLogoPosition(e.target.value as LogoPosition)}><option value="left">Слева от текста</option><option value="right">Справа от текста</option></select></label>
        {logo && <button onClick={() => { setLogo(''); setLogoInputKey(v => v + 1); }}>Удалить логотип</button>}

        <div className="sectionBadge">4 · Цвета</div>
        <label className="colorSelect">Лицевая часть · ORACAL 8500<select value={face} onChange={e => setFace(e.target.value)}>{ORACAL_8500.map(c => <option key={c[0]} value={c[2]}>{optionLabel(c)}</option>)}</select><i style={{background: face}}/></label>
        <label className="colorSelect">Борта · ORACAL 641<select value={side} onChange={e => setSide(e.target.value)}>{ORACAL_641.map(c => <option key={c[0]} value={c[2]}>{optionLabel(c)}</option>)}</select><i style={{background: side}}/></label>

        <div className="sectionBadge">5 · Подсветка</div>
        <label>Тип подсветки
          <select value={lighting} onChange={e => setLighting(e.target.value as Lighting)}>
            <option value="front">Лицевая подсветка</option>
            <option value="back">Контражур</option>
            <option value="combo">Лицевая + контражур</option>
            <option value="none">Без подсветки</option>
          </select>
        </label>

        <div className="summaryCard leftSummary"><b>Габариты</b><span>Длина: {cm(signWidthCm)}</span><span>Высота: {cm(signHeightCm)}</span><span>1 строка: {cm(line1HeightCm)}</span>{twoLines && <span>2 строка: {cm(line2HeightCm)}</span>}{logo && <span>Высота логотипа: {cm(logoHeightCm)}</span>}<span>Подсветка: {lightingLabel(lighting)}</span></div>
      </aside>

      <section className="workspace">
        <div className="toolbar">
          <div className="modeSwitch"><button onClick={() => setNight(false)} className={!night ? 'active' : ''}>☀ День</button><button onClick={() => setNight(true)} className={night ? 'active' : ''}>🌙 Ночь</button></div>
          <button onClick={() => setPoints([])}>Сбросить точки</button>
          <button className="toolbarPdf" onClick={pdf}>Скачать PDF</button>
        </div>
        <div className={'stage ' + (night ? 'night' : '')} ref={stageRef} onClick={clickStage}>
          {facade ? <img src={facade} className="facade"/> : <div className="placeholder"><b>Загрузите фото фасада</b><span>Затем откалибруйте масштаб по двум точкам</span></div>}
          {points.map((p, i) => <div key={i} className="point" style={{ left: p.x, top: p.y }} onMouseDown={(e) => startPointDrag(e, i)} />)}
          <CalibrationLine />
          {facade && <SignGraphic />}
        </div>
      </section>

    </main>

    <div className="pdfPages" ref={pdfRef}>
      <section className="pdfSheet pdfSheetFacade">
        <header className="pdfTopHeader">
          <div className="pdfLogoBlock">
            <img src="/assets/logo-reklamastroy.png" />
            <div><b>Реклама<span>Строй</span></b><small>ИЗГОТОВЛЕНИЕ НАРУЖНОЙ РЕКЛАМЫ</small></div>
          </div>
          <div className="pdfTrust"><i>✓</i><span>ГАРАНТИЯ<br/><b>3 ГОДА</b></span></div>
          <div className="pdfTrust"><i>▣</i><span>12-ЛЕТНЯЯ<br/><b>ЭКСПЕРТИЗА</b></span></div>
          <div className="pdfTrust"><i>☆</i><span>БОЛЕЕ<br/><b>1300</b><br/>РЕАЛИЗОВАННЫХ ПРОЕКТОВ</span></div>
          <div className="pdfContact"><span>🌐 reklamastroy.ru</span><span>✉ sales@reklamastroy.ru</span></div>
          <div className="pdfContact"><span>☎ +7 495 008 37 95</span><span>▯ +7 925 888 37 95</span></div>
        </header>
        <div className="pdfFacadeCenter">
          <div className="pdfFacadeStage snapshotStage">
            {stageShot
              ? <img src={stageShot} className="stageSnapshot"/>
              : (facade ? <img src={facade} className="facade"/> : <div className="placeholder">Фото фасада не загружено</div>)}
            <div className="pdfWatermark">РекламаСтрой</div>
          </div>
        </div>
        <footer className="pdfNote">Данная визуализация выполнена в масштабе на основании размеров, указанных заказчиком.</footer>
      </section>

      <section className="pdfSheet pdfSheetDrawing">
        <h2>ЧЕРТЕЖ ВЫВЕСКИ</h2>
        <div className="pdfDrawingGrid">
          <div className="pdfDrawingStage">
            <SignGraphic pdfMode drawingMode scale={drawingScale}/>
            <div className="pdfWatermark drawing">РекламаСтрой</div>
          </div>
          <aside className="pdfSpec">
            <b>ШРИФТ:</b><span>{font}</span>
            <b>ЦВЕТ ЛИЦЕВОЙ ЧАСТИ:</b><span><i style={{background: face}}></i>{colorName(ORACAL_8500, face)}</span>
            <b>ЦВЕТ ТОРЦЕВОЙ ЧАСТИ:</b><span><i style={{background: side}}></i>{colorName(ORACAL_641, side)}</span>
          </aside>
        </div>
        <footer className="pdfNote">Данная визуализация выполнена в масштабе на основании размеров, указанных заказчиком.</footer>
      </section>
    </div>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
