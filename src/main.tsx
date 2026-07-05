import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './styles.css';

type Point = { x: number; y: number };
type Lighting = 'front' | 'side' | 'back' | 'frontBack' | 'frontSide' | 'none';
type LogoPosition = 'left' | 'right';
type ColorItem = [string, string, string];
type FontItem = { name: string; family: string; sample: string; group: string };
type DragMode = null | { type: 'sign'; dx: number; dy: number } | { type: 'point'; index: number } | { type: 'rotate'; angleOffset: number };

const ORACAL_8500: ColorItem[] = [
  ['010', 'Белый / White', '#e7e8e5'],
  ['025', 'Серно-жёлтый / Brimstone yellow', '#d1c600'],
  ['021', 'Жёлтый / Yellow', '#ffcf00'],
  ['013', 'Цинковый жёлтый / Zinc yellow', '#f3c300'],
  ['020', 'Золотисто-жёлтый / Golden yellow', '#faad00'],
  ['207', 'Охра жёлтая / Ochre yellow', '#e1a529'],
  ['034', 'Оранжевый / Orange', '#e05400'],
  ['330', 'Лисий красный / Fox red', '#c82411'],
  ['323', 'Кораллово-красный / Coral red', '#d3273b'],
  ['032', 'Светло-красный / Light red', '#cc311c'],
  ['329', 'Гвоздично-красный / Carnation red', '#c3050e'],
  ['016', 'Кроваво-красный / Crimson', '#cf110a'],
  ['031', 'Красный / Red', '#c11c13'],
  ['017', 'Вишнёвый / Cherry red', '#a5000e'],
  ['030', 'Тёмно-красный / Dark red', '#770017'],
  ['085', 'Бледно-розовый / Pale pink', '#df8e8f'],
  ['413', 'Светло-розовый / Light pink', '#d361b1'],
  ['041', 'Розовый / Pink', '#b3006a'],
  ['008', 'Вересково-красный / Heather red', '#760630'],
  ['040', 'Фиолетовый / Violet', '#64005c'],
  ['403', 'Светло-фиолетовый / Light violet', '#5e2287'],
  ['012', 'Сиреневый / Lilac', '#450357'],
  ['527', 'Пастельно-синий / Pastel blue', '#5791ad'],
  ['053', 'Светло-синий / Light blue', '#008ed5'],
  ['052', 'Лазурный / Azure blue', '#0062b7'],
  ['051', 'Генциановый синий / Gentian blue', '#0059ac'],
  ['528', 'Серо-синий / Grey blue', '#00659d'],
  ['005', 'Средний синий / Middle blue', '#0539a2'],
  ['006', 'Интенсивный синий / Intensive blue', '#002d75'],
  ['049', 'Королевский синий / King blue', '#24047b'],
  ['542', 'Карибский синий / Caribic blue', '#142479'],
  ['065', 'Кобальтовый синий / Cobalt blue', '#210066'],
  ['007', 'Тёмно-синий / Dark blue', '#25235f'],
  ['541', 'Тёмно-бирюзовый / Dark turquoise', '#005373'],
  ['066', 'Бирюзово-синий / Turquoise blue', '#008b96'],
  ['054', 'Бирюзовый / Turquoise', '#00ac92'],
  ['062', 'Светло-зелёный / Light green', '#009935'],
  ['063', 'Липово-зелёный / Lime-tree green', '#4ab600'],
  ['009', 'Средний зелёный / Middle green', '#009d68'],
  ['614', 'Камышовый зелёный / Reed green', '#007332'],
  ['068', 'Травяной зелёный / Grass green', '#006e38'],
  ['618', 'Драконово-зелёный / Dragon green', '#003f42'],
  ['087', 'Изумрудный / Emerald', '#007832'],
  ['060', 'Тёмно-зелёный / Dark green', '#003e29'],
  ['070', 'Чёрный / Black', '#1b1d20'],
  ['074', 'Средне-серый / Middle grey', '#878f8f'],
  ['076', 'Телегрей / Telegrey', '#9ba1a7'],
  ['072', 'Светло-серый / Light grey', '#c6c9ca'],
  ['805', 'Слоновая кость / Ivory', '#e3d5b3'],
  ['011', 'Бледно-коричневый / Pale brown', '#dfbb87'],
  ['081', 'Светло-коричневый / Light brown', '#b48959'],
  ['088', 'Кофейно-коричневый / Coffee brown', '#462921'],
  ['090', 'Серебристо-серый / Silver grey', '#7d8184'],
  ['091', 'Золото / Gold', '#907f44']
];

const ORACAL_641: ColorItem[] = [
  ['000', 'Прозрачный / Transparent', '#d5d5db'],
  ['010', 'Белый / White', '#e7eaee'],
  ['020', 'Золотисто-жёлтый / Golden yellow', '#fca600'],
  ['019', 'Сигнально-жёлтый / Signal yellow', '#e8a700'],
  ['021', 'Жёлтый / Yellow', '#fec600'],
  ['022', 'Светло-жёлтый / Light yellow', '#f2cb00'],
  ['025', 'Серно-жёлтый / Brimstone yellow', '#f1e10e'],
  ['026', 'Пурпурно-красный / Purple red', '#571120'],
  ['312', 'Бургунди / Burgundy', '#740210'],
  ['030', 'Тёмно-красный / Dark red', '#910814'],
  ['031', 'Красный / Red', '#af000b'],
  ['032', 'Светло-красный / Light red', '#c70c00'],
  ['047', 'Красно-оранжевый / Orange red', '#d33000'],
  ['034', 'Оранжевый / Orange', '#dd4400'],
  ['036', 'Светло-оранжевый / Light orange', '#ec6600'],
  ['035', 'Пастельно-оранжевый / Pastel orange', '#ff6d00'],
  ['404', 'Пурпурный / Purple', '#412872'],
  ['040', 'Фиолетовый / Violet', '#5d2b68'],
  ['043', 'Лавандовый / Lavender', '#785fa2'],
  ['042', 'Сиреневый / Lilac', '#ba94bc'],
  ['041', 'Малиновый / Pink', '#c3286a'],
  ['045', 'Светло-розовый / Soft pink', '#ef87b8'],
  ['562', 'Глубокий морской синий / Deep sea blue', '#131d39'],
  ['518', 'Стальной синий / Steel blue', '#0f113a'],
  ['050', 'Тёмно-синий / Dark blue', '#1c2f5e'],
  ['065', 'Кобальтовый синий / Cobalt blue', '#0d1f6a'],
  ['049', 'Королевский синий / King blue', '#172b79'],
  ['086', 'Бриллиантово-синий / Brilliant blue', '#1b2faa'],
  ['067', 'Синий / Blue', '#003a78'],
  ['057', 'Дорожный синий / Traffic blue', '#00418e'],
  ['051', 'Генциановый синий / Gentian blue', '#004583'],
  ['098', 'Генциановый / Gentian', '#004f9f'],
  ['052', 'Лазурный / Azure blue', '#005ead'],
  ['084', 'Небесно-синий / Sky blue', '#0074bb'],
  ['053', 'Светло-синий / Light blue', '#0088c3'],
  ['056', 'Ледяной синий / Ice blue', '#43a2d3'],
  ['066', 'Бирюзово-синий / Turquoise blue', '#00838e'],
  ['054', 'Бирюзовый / Turquoise', '#009b97'],
  ['055', 'Мятный / Mint', '#5fceb7'],
  ['060', 'Тёмно-зелёный / Dark green', '#003c24'],
  ['613', 'Лесной зелёный / Forest green', '#005236'],
  ['061', 'Зелёный / Green', '#007a4d'],
  ['068', 'Травяной зелёный / Grass green', '#00783f'],
  ['062', 'Светло-зелёный / Light green', '#00893a'],
  ['064', 'Жёлто-зелёный / Yellow green', '#239b11'],
  ['063', 'Липово-зелёный / Lime-tree green', '#6aa72f'],
  ['080', 'Коричневый / Brown', '#55331c'],
  ['083', 'Орехово-коричневый / Nut brown', '#af591e'],
  ['081', 'Светло-коричневый / Light brown', '#a8875a'],
  ['082', 'Бежевый / Beige', '#cdc09e'],
  ['023', 'Кремовый / Cream', '#e7d293'],
  ['070', 'Чёрный / Black', '#060607'],
  ['073', 'Тёмно-серый / Dark grey', '#4b4c4c'],
  ['071', 'Серый / Grey', '#757d7c'],
  ['076', 'Телегрей / Telegrey', '#808588'],
  ['074', 'Средне-серый / Middle grey', '#8a8f8c'],
  ['072', 'Светло-серый / Light grey', '#c0c3c3'],
  ['090', 'Серебристо-серый / Silver grey', '#6f7274'],
  ['091', 'Золото / Gold', '#796532'],
  ['092', 'Медь / Copper', '#69401e']
];

const FONTS: FontItem[] = [
  { name: 'Arial Black', family: 'Arial Black, Arial, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Impact', family: 'Impact, Arial Black, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Arial', family: 'Arial, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Trebuchet MS', family: 'Trebuchet MS, Arial, sans-serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Georgia', family: 'Georgia, serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Times New Roman', family: 'Times New Roman, serif', sample: 'Вывеска 123', group: 'Системный' },
  { name: 'Inter', family: 'Inter, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Manrope', family: 'Manrope, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Montserrat', family: 'Montserrat, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Roboto', family: 'Roboto, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Open Sans', family: 'Open Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Rubik', family: 'Rubik, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Noto Sans', family: 'Noto Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Source Sans 3', family: 'Source Sans 3, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'PT Sans', family: 'PT Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Fira Sans', family: 'Fira Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'IBM Plex Sans', family: 'IBM Plex Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Ubuntu', family: 'Ubuntu, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Nunito Sans', family: 'Nunito Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Mulish', family: 'Mulish, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Jost', family: 'Jost, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Raleway', family: 'Raleway, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Commissioner', family: 'Commissioner, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Golos Text', family: 'Golos Text, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Golos UI', family: 'Golos UI, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Onest', family: 'Onest, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Geologica', family: 'Geologica, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Sofia Sans', family: 'Sofia Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Exo 2', family: 'Exo 2, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Arimo', family: 'Arimo, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Arsenal', family: 'Arsenal, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Alegreya Sans', family: 'Alegreya Sans, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Didact Gothic', family: 'Didact Gothic, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Scada', family: 'Scada, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Cuprum', family: 'Cuprum, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Play', family: 'Play, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Jura', family: 'Jura, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Tektur', family: 'Tektur, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Unbounded', family: 'Unbounded, Arial, sans-serif', sample: 'Вывеска 123', group: 'Google Fonts' },
  { name: 'Oswald', family: 'Oswald, Arial Narrow, sans-serif', sample: 'Вывеска 123', group: 'Узкие' },
  { name: 'Roboto Condensed', family: 'Roboto Condensed, Arial Narrow, sans-serif', sample: 'Вывеска 123', group: 'Узкие' },
  { name: 'PT Sans Caption', family: 'PT Sans Caption, Arial, sans-serif', sample: 'Вывеска 123', group: 'Узкие' },
  { name: 'Bebas Neue', family: 'Bebas Neue, Impact, sans-serif', sample: 'Вывеска 123', group: 'Узкие' },
  { name: 'Russo One', family: 'Russo One, Arial Black, sans-serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Yeseva One', family: 'Yeseva One, Georgia, serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Orelega One', family: 'Orelega One, Georgia, serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Prata', family: 'Prata, Georgia, serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Oranienbaum', family: 'Oranienbaum, Georgia, serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Forum', family: 'Forum, Georgia, serif', sample: 'Вывеска 123', group: 'Акцидентные' },
  { name: 'Comfortaa', family: 'Comfortaa, Arial, sans-serif', sample: 'Вывеска 123', group: 'Скруглённые' },
  { name: 'Marmelad', family: 'Marmelad, Arial, sans-serif', sample: 'Вывеска 123', group: 'Скруглённые' },
  { name: 'Bellota Text', family: 'Bellota Text, Arial, sans-serif', sample: 'Вывеска 123', group: 'Скруглённые' },
  { name: 'El Messiri', family: 'El Messiri, Arial, sans-serif', sample: 'Вывеска 123', group: 'Геометрические' },
  { name: 'Philosopher', family: 'Philosopher, Arial, sans-serif', sample: 'Вывеска 123', group: 'Геометрические' },
  { name: 'Poiret One', family: 'Poiret One, Arial, sans-serif', sample: 'Вывеска 123', group: 'Тонкие' },
  { name: 'Alegreya', family: 'Alegreya, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Merriweather', family: 'Merriweather, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'PT Serif', family: 'PT Serif, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Noto Serif', family: 'Noto Serif, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'IBM Plex Serif', family: 'IBM Plex Serif, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Lora', family: 'Lora, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Literata', family: 'Literata, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Old Standard TT', family: 'Old Standard TT, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Cormorant', family: 'Cormorant, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Playfair Display', family: 'Playfair Display, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'EB Garamond', family: 'EB Garamond, Georgia, serif', sample: 'Вывеска 123', group: 'Антиква' },
  { name: 'Roboto Slab', family: 'Roboto Slab, Georgia, serif', sample: 'Вывеска 123', group: 'Брусковые' },
  { name: 'Bitter', family: 'Bitter, Georgia, serif', sample: 'Вывеска 123', group: 'Брусковые' },
  { name: 'PT Mono', family: 'PT Mono, monospace', sample: 'Вывеска 123', group: 'Моноширинные' },
  { name: 'Roboto Mono', family: 'Roboto Mono, monospace', sample: 'Вывеска 123', group: 'Моноширинные' },
  { name: 'Noto Sans Mono', family: 'Noto Sans Mono, monospace', sample: 'Вывеска 123', group: 'Моноширинные' },
  { name: 'Anonymous Pro', family: 'Anonymous Pro, monospace', sample: 'Вывеска 123', group: 'Моноширинные' },
  { name: 'Cousine', family: 'Cousine, monospace', sample: 'Вывеска 123', group: 'Моноширинные' },
];

const cm = (value: number) => `${Math.round(value)} см`;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const defaultState = {
  line1: 'Вывеска',
  line2: '',
  font: 'Arial Black, Arial, sans-serif',
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
  if (lighting === 'side') return 'Торцевая подсветка';
  if (lighting === 'back') return 'Контражур';
  if (lighting === 'frontBack') return 'Лицевая + контражур';
  if (lighting === 'frontSide') return 'Лицевая + торцевая';
  return 'Без подсветки';
}

function optionLabel(c: ColorItem) { return `${c[0]} — ${c[1]}`; }
function fontDisplayName(family: string) {
  return FONTS.find(f => f.family === family)?.name || family.split(',')[0].replace(/['\"]/g, '').trim();
}

function colorName(list: ColorItem[], hex: string) {
  const found = list.find(c => c[2].toLowerCase() === hex.toLowerCase());
  if (!found) return hex;
  return `${found[0]} — ${found[1].split(' / ')[1] || found[1]}`;
}

function App() {
  const [line1, setLine1] = useState(defaultState.line1);
  const [line2, setLine2] = useState(defaultState.line2);
  const [font, setFont] = useState(defaultState.font);
  const [fontOpen, setFontOpen] = useState(false);
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

  // Точная калибровка: две точки задают количество пикселей на 1 см.
  // Важное исправление: ширина текста больше не считается по грубой формуле
  // «количество символов × 0.62». Теперь браузер измеряет выбранный шрифт
  // через Canvas API, поэтому размер вывески после калибровки заметно точнее.
  const pxPerCm = points.length === 2 ? distance(points[0], points[1]) / Math.max(1, calibrationCm) : 0;
  const exact = pxPerCm > 0;
  const fallbackPxPerCm = 4.8;
  const workingPxPerCm = exact ? pxPerCm : fallbackPxPerCm;
  const maxLetterHeightCm = Math.max(...lineHeightsCm);
  const lineFontSizesPx = lineHeightsCm.map(h => Math.max(1, h * workingPxPerCm));
  const letterHeightPx = Math.max(...lineFontSizesPx);
  const measureTextWidthPx = (text: string, fontSizePx: number) => {
    if (typeof document === 'undefined') return (text.trim().length || 1) * fontSizePx * 0.62;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return (text.trim().length || 1) * fontSizePx * 0.62;
    ctx.font = `900 ${fontSizePx}px ${font}`;
    const metrics = ctx.measureText(text || ' ');
    return Math.max(1, metrics.width);
  };
  const textLineWidthsPx = lines.map((line, i) => measureTextWidthPx(line, lineFontSizesPx[i]));
  const textWidthPx = Math.max(1, ...textLineWidthsPx);
  const logoWidthCm = logo ? logoHeightCm * logoAspect : 0;
  const logoWidthPx = logo ? logoWidthCm * workingPxPerCm : 0;
  const gapCm = logo ? Math.max(4, Math.min(maxLetterHeightCm, logoHeightCm) * 0.18) : 0;
  const gapPx = gapCm * workingPxPerCm;
  const signWidthPx = Math.max(80, logoWidthPx + gapPx + textWidthPx);
  const signWidthCm = Math.round(signWidthPx / workingPxPerCm);
  const lineGapCm = twoLines ? Math.max(3, Math.min(line1HeightCm, line2HeightCm) * 0.18) : 0;
  const textHeightCm = twoLines ? line1HeightCm + line2HeightCm + lineGapCm : line1HeightCm;
  const textHeightPx = textHeightCm * workingPxPerCm;
  const logoHeightPxRaw = logo ? logoHeightCm * workingPxPerCm : 0;
  const signHeightPx = Math.max(40, textHeightPx, logoHeightPxRaw);
  const signHeightCm = Math.round(signHeightPx / workingPxPerCm);
  const sideDepthPx = Math.max(1.2, letterHeightPx * 0.022);
  const darkFace = '#080a0d';
  const darkSide = '#050609';
  const shadowSide = '#111318';
  const lightingTextStyle = (fs: number) => {
    const strokeBase = Math.max(0.7, fs * 0.014);
    if (!night) {
      return {
        color: face,
        textShadow: `${sideDepthPx}px ${sideDepthPx}px 0 ${side}, ${sideDepthPx * 1.25}px ${sideDepthPx * 1.35}px ${sideDepthPx}px rgba(0,0,0,.28)`,
        WebkitTextStroke: `${strokeBase}px ${side}`
      } as React.CSSProperties;
    }
    const faceGlow = `0 0 ${fs * 0.18}px ${face}, 0 0 ${fs * 0.38}px ${face}`;
    const sideGlow = `0 0 ${fs * 0.16}px ${side}, 0 0 ${fs * 0.32}px ${side}`;
    const backHalo = `0 0 ${fs * 0.48}px ${face}, 0 0 ${fs * 0.78}px ${face}`;
    if (lighting === 'front') return { color: face, textShadow: faceGlow, WebkitTextStroke: `${strokeBase}px ${darkSide}` } as React.CSSProperties;
    if (lighting === 'side') return { color: darkFace, textShadow: sideGlow, WebkitTextStroke: `${Math.max(1.2, strokeBase * 1.75)}px ${side}` } as React.CSSProperties;
    if (lighting === 'back') return { color: darkFace, textShadow: backHalo, WebkitTextStroke: `${strokeBase}px ${shadowSide}` } as React.CSSProperties;
    if (lighting === 'frontBack') return { color: face, textShadow: `${faceGlow}, ${backHalo}`, WebkitTextStroke: `${strokeBase}px ${darkSide}` } as React.CSSProperties;
    if (lighting === 'frontSide') return { color: face, textShadow: `${faceGlow}, ${sideGlow}`, WebkitTextStroke: `${Math.max(1, strokeBase * 1.45)}px ${side}` } as React.CSSProperties;
    return { color: face, opacity: 0.55, textShadow: 'none', filter: 'none', WebkitTextStroke: `${strokeBase}px ${side}` } as React.CSSProperties;
  };
  const logoLightingFilter = (basePx: number, depthPx: number) => {
    if (!night) return `drop-shadow(${depthPx}px ${depthPx}px 0 ${side}) drop-shadow(${depthPx * 1.2}px ${depthPx * 1.2}px ${depthPx}px rgba(0,0,0,.26))`;
    if (lighting === 'front') return `drop-shadow(0 0 ${basePx * 0.22}px ${face}) drop-shadow(${depthPx}px ${depthPx}px 0 ${darkSide})`;
    if (lighting === 'side') return `brightness(.14) drop-shadow(0 0 ${basePx * 0.24}px ${side}) drop-shadow(${depthPx}px ${depthPx}px 0 ${side})`;
    if (lighting === 'back') return `brightness(.10) drop-shadow(0 0 ${basePx * 0.58}px ${face}) drop-shadow(0 0 ${basePx * 0.95}px ${face})`;
    if (lighting === 'frontBack') return `drop-shadow(0 0 ${basePx * 0.24}px ${face}) drop-shadow(0 0 ${basePx * 0.62}px ${face}) drop-shadow(${depthPx}px ${depthPx}px 0 ${darkSide})`;
    if (lighting === 'frontSide') return `drop-shadow(0 0 ${basePx * 0.24}px ${face}) drop-shadow(0 0 ${basePx * 0.24}px ${side}) drop-shadow(${depthPx}px ${depthPx}px 0 ${side})`;
    return 'brightness(.55)';
  };

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
    const fontSizes = lineHeightsCm.map(h => h * workingPxPerCm * scale);
    const fontSize = Math.max(...fontSizes);
    const widthPx = signWidthPx * scale;
    const heightPx = signHeightPx * scale;
    const logoHeightPx = logoHeightCm * workingPxPerCm * scale;
    const depthPx = sideDepthPx * scale;
    const logoFilter = logoLightingFilter(Math.max(logoHeightPx, fontSize), depthPx);
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
      <svg className="signDims" width={widthPx + 112} height={heightPx + 88} viewBox={`0 0 ${widthPx + 112} ${heightPx + 88}`}>
        <defs>
          <marker id={`arrow-start-${pdfMode ? 'pdf' : 'live'}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/>
          </marker>
          <marker id={`arrow-end-${pdfMode ? 'pdf' : 'live'}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/>
          </marker>
        </defs>
        {drawingMode && <>
          <line className="dimExt" x1="70" y1="26" x2="70" y2="48" />
          <line className="dimExt" x1={widthPx + 70} y1="26" x2={widthPx + 70} y2="48" />
          <line className="dimExt" x1="48" y1="48" x2="70" y2="48" />
          <line className="dimExt" x1="48" y1={heightPx + 48} x2="70" y2={heightPx + 48} />
        </>}
        <line x1="70" y1="26" x2={widthPx + 70} y2="26" markerStart={`url(#arrow-start-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-end-${pdfMode ? 'pdf' : 'live'})`} />
        <text x={widthPx / 2 + 70} y="18" textAnchor="middle">{cm(signWidthCm)}</text>
        <line x1="48" y1="48" x2="48" y2={heightPx + 48} markerStart={`url(#arrow-start-${pdfMode ? 'pdf' : 'live'})`} markerEnd={`url(#arrow-end-${pdfMode ? 'pdf' : 'live'})`} />
        <text x="25" y={heightPx / 2 + 54} textAnchor="middle" transform={`rotate(-90 25 ${heightPx / 2 + 54})`}>{cm(signHeightCm)}</text>
      </svg>
      <div className="letters" style={{ fontFamily: font, fontSize }} data-lighting={lighting}>
        {logo && logoPosition === 'left' && <img className="logo" src={logo} draggable={false} style={{ height: logoHeightPx, filter: logoFilter }}/>} 
        <div className="textBlock">{lines.map((line, i) => <span key={i} style={{ fontSize: fontSizes[i], ...lightingTextStyle(fontSizes[i]) }}>{line}</span>)}</div>
        {logo && logoPosition === 'right' && <img className="logo logoRight" src={logo} draggable={false} style={{ height: logoHeightPx, filter: logoFilter }}/>} 
      </div>
    </div>;
  };

  const CalibrationLine = () => null;

  return <>
    <header className="topbar">
      <div className="brand"><b>РЕКЛАМА<span>СТРОЙ</span></b><small>онлайн примерка вывески</small></div>
      <div className="heroTitle"><h1>Онлайн примерка вывески с привязкой к фасаду здания</h1><p>Загрузите фасад, задайте масштаб по 2 точкам и подберите вывеску в размере.</p></div>
    </header>

    <main className="app">
      <aside className="panel left">
        <div className="sectionBadge">1 · Фасад</div>
        <div className="hintBox"><b>Загрузите фото фасада</b><span>Лучше фото прямо, без сильного угла. Подходят JPG, JPEG, PNG, WEBP, HEIC/HEIF.</span></div>
        <label className="file">Загрузить фасад<input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heif,image/heic" onChange={onFacade}/></label>

        <div className="sectionBadge">2 · Масштаб</div>
        <div className="hintBox"><b>Поставьте 2 точки</b><span>Отметьте известный размер на фото: ширину окна, двери или витрины. Точки можно двигать мышкой.</span></div>
        <button className={placingPoints ? 'active' : ''} onClick={() => { if (!placingPoints) setPoints([]); setPlacingPoints(v => !v); }}>{placingPoints ? 'Кликните 2 точки на фото' : 'Калибровать по 2 точкам'}</button>
        <label>Фактический размер между точками, см<input type="number" value={calibrationCm} onChange={e => setCalibrationCm(Number(e.target.value) || 1)} /></label>

        <div className="sectionBadge">3 · Вывеска</div>
        <label>Текст первой строки<input value={line1} onChange={e => setLine1(e.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={twoLines} onChange={e => setTwoLines(e.target.checked)} /> Добавить вторую строку</label>
        {twoLines && <label>Текст второй строки<input value={line2} onChange={e => setLine2(e.target.value)} /></label>}
        <label>Шрифт</label>
        <div className="fontDropdown">
          <button className="fontCurrent" type="button" onClick={() => setFontOpen(v => !v)}>
            <span className="fontMeta"><b>{fontDisplayName(font)}</b><small>Нажмите, чтобы выбрать шрифт</small></span>
            <span className="fontPreview" style={{ fontFamily: font }}>{line1 || 'Вывеска'}</span>
          </button>
          {fontOpen && <div className="fontMenu">
            {FONTS.map(f => <button type="button" key={f.name} className={font === f.family ? 'selected' : ''} onClick={() => { setFont(f.family); setFontOpen(false); }}>
              <span><b>{f.name}</b><small>{f.group}</small></span>
              <em style={{ fontFamily: f.family }}>{f.sample}</em>
            </button>)}
          </div>}
        </div>
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
            <option value="side">Торцевая подсветка</option>
            <option value="back">Контражур</option>
            <option value="frontBack">Лицевая + контражур</option>
            <option value="frontSide">Лицевая + торцевая</option>
            <option value="none">Без подсветки</option>
          </select>
        </label>

        <div className="summaryCard leftSummary"><b>Габариты</b><span>Длина: {cm(signWidthCm)}</span><span>Высота: {cm(signHeightCm)}</span><span>1 строка: {cm(line1HeightCm)}</span>{twoLines && <span>2 строка: {cm(line2HeightCm)}</span>}{logo && <span>Высота логотипа: {cm(logoHeightCm)}</span>}<span>Подсветка: {lightingLabel(lighting)}</span></div>
        <button className="panelPdfButton" onClick={pdf}>Скачать PDF</button>
      </aside>

      <section className="workspace">
        <div className="toolbar">
          <div className="modeSwitch"><button onClick={() => setNight(false)} className={!night ? 'active' : ''}>☀ День</button><button onClick={() => setNight(true)} className={night ? 'active' : ''}>🌙 Ночь</button></div>
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
            <b>ШРИФТ:</b><span>{fontDisplayName(font)}</span>
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
