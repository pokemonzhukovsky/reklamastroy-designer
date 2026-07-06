import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync, createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './styles.css';

type Point = { x: number; y: number };
type Lighting = 'front' | 'side' | 'back' | 'frontBack' | 'frontSide' | 'none';
type LogoPosition = 'left' | 'right' | 'top' | 'bottom';
type Line2Align = 'left' | 'center' | 'right';
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

const mm = (value: number) => `${Math.round(value)} мм`;
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const defaultState = {
  line1: 'Вывеска',
  line2: '',
  font: 'Arial Black, Arial, sans-serif',
  line2Font: 'Arial Black, Arial, sans-serif',
  face: '#ffffff',
  line2Face: '#ffffff',
  side: '#333333',
  line2Side: '#333333',
  line1HeightCm: 300,
  line2HeightCm: 240,
  lineGapCm: 50,
  calibrationCm: 1200,
  lighting: 'front' as Lighting,
  night: false,
  twoLines: false,
  line2Align: 'left' as Line2Align,
  facade: '',
  logo: '',
  logoAspect: 1.12,
  logoHeightCm: 300,
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

const rsPdfLogoSrc = `${import.meta.env.BASE_URL}assets/logo-reklamastroy.png`;

function colorItemByHex(list: ColorItem[], hex: string) {
  return list.find(c => c[2].toLowerCase() === hex.toLowerCase()) || list[0];
}

function ColorDropdown({ label, palette, list, value, onChange }: {
  label: string;
  palette: string;
  list: ColorItem[];
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 0, maxHeight: 360 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = colorItemByHex(list, value);
  const [ruName, enNameRaw] = selected[1].split(' / ');
  const enName = enNameRaw || ruName;

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const top = rect.bottom + 8;
    setMenuPos({
      left: rect.left,
      top,
      width: rect.width,
      maxHeight: Math.max(220, window.innerHeight - top - 18)
    });
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onUpdate = () => updateMenuPosition();
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [open, value, list.length]);

  const menu = open && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      className={`colorMenu colorMenuPortal ${palette === 'ORACAL 8500' ? 'colorMenuFacePortal' : 'colorMenuSidePortal'}`}
      style={{ left: `${menuPos.left}px`, top: `${menuPos.top}px`, width: `${menuPos.width}px`, maxHeight: `${menuPos.maxHeight}px` }}
    >
      {list.map(c => {
        const [ru, enRaw] = c[1].split(' / ');
        const en = enRaw || ru;
        return <button type="button" key={c[0]} className={value === c[2] ? 'selected' : ''} onClick={() => { onChange(c[2]); setOpen(false); }}>
          <i className="colorSwatchLarge" style={{ background: c[2] }} />
          <span className="colorMenuMeta">
            <b>{c[0]} — {ru}</b>
            <small>{en}</small>
          </span>
        </button>;
      })}
    </div>,
    document.body
  ) : null;

  return <div className={`colorDropdown ${palette === 'ORACAL 8500' ? 'colorDropdownFace' : 'colorDropdownSide'} ${open ? 'isOpen' : ''}`} ref={wrapRef}>
    <label className="colorDropdownLabel">
      <span>{label}</span>
      <small>{palette}</small>
    </label>
    <button ref={buttonRef} type="button" className={`colorCurrent ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)}>
      <i className="colorSwatchLarge" style={{ background: selected[2] }} />
      <span className="colorCurrentMeta">
        <b>{selected[0]} — {ruName}</b>
        <small>{enName}</small>
      </span>
      <span className="colorDropdownArrow">{open ? '▴' : '▾'}</span>
    </button>
    {menu}
  </div>;
}

function FontPicker({ label, value, onChange, open, setOpen, preview }: {
  label: string;
  value: string;
  onChange: (family: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  preview: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0, width: 0, maxHeight: 430 });

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const top = rect.bottom + 8;
    setMenuPos({
      left: rect.left,
      top,
      width: rect.width,
      maxHeight: Math.max(240, window.innerHeight - top - 18)
    });
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onUpdate = () => updateMenuPosition();
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, true);
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate, true);
    };
  }, [open, value]);

  const menu = open && typeof document !== 'undefined' ? createPortal(
    <div ref={menuRef} className="fontMenu fontMenuPortal" style={{ left: `${menuPos.left}px`, top: `${menuPos.top}px`, width: `${menuPos.width}px`, maxHeight: `${menuPos.maxHeight}px` }}>
      {FONTS.map(f => <button type="button" key={f.name} className={value === f.family ? 'selected' : ''} onClick={() => { onChange(f.family); setOpen(false); }}>
        <span><b>{f.name}</b><small>{f.group}</small></span>
        <em style={{ fontFamily: f.family }}>{f.sample}</em>
      </button>)}
    </div>,
    document.body
  ) : null;

  return <>
    <label>{label}</label>
    <div ref={wrapRef} className={`fontDropdown ${open ? 'isOpen' : ''}`}>
      <button ref={buttonRef} className="fontCurrent" type="button" onClick={() => setOpen(v => !v)}>
        <span className="fontMeta"><b>{fontDisplayName(value)}</b><small>Название + живой пример в списке</small></span>
        <span className="fontPreview" style={{ fontFamily: value }}>{preview || 'Вывеска'}</span>
      </button>
      {menu}
    </div>
  </>;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function renderPdfLogoToPng(file: File) {
  const pdfjsLib = await import('pdfjs-dist');
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 3 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не удалось подготовить PDF-логотип.');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

async function trimTransparentImage(dataUrl: string) {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const maxSide = 2048;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, aspect: (img.naturalWidth || 1) / Math.max(1, img.naturalHeight || 1) };
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;

  const samplePoints = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)]
  ];
  const bg = samplePoints.reduce((acc, [x, y]) => {
    const i = (y * w + x) * 4;
    acc.r += data[i]; acc.g += data[i + 1]; acc.b += data[i + 2]; acc.a += data[i + 3];
    return acc;
  }, { r: 0, g: 0, b: 0, a: 0 });
  bg.r /= samplePoints.length; bg.g /= samplePoints.length; bg.b /= samplePoints.length; bg.a /= samplePoints.length;

  const isContentPixel = (i: number) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a <= 8) return false;

    // Прозрачные PNG/SVG: считаем видимой частью всё, что имеет альфа-канал.
    if (bg.a < 30) return a > 8;

    // PDF часто рендерится на белом поле без прозрачности. Поэтому дополнительно
    // обрезаем однотонные поля по цвету фона, взятому с краёв изображения.
    const colorDistance = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
    const alphaDistance = Math.abs(a - bg.a);
    return colorDistance > 34 || alphaDistance > 24;
  };

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (isContentPixel(i)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Если фон не удалось отделить от самого логотипа, оставляем исходные границы.
  if (maxX < minX || maxY < minY) {
    return { dataUrl, aspect: (img.naturalWidth || 1) / Math.max(1, img.naturalHeight || 1) };
  }

  const cropW = Math.max(1, maxX - minX + 1);
  const cropH = Math.max(1, maxY - minY + 1);
  const out = document.createElement('canvas');
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext('2d');
  if (!outCtx) return { dataUrl, aspect: cropW / cropH };
  outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return { dataUrl: out.toDataURL('image/png'), aspect: cropW / cropH };
}

function App() {
  const [line1, setLine1] = useState(defaultState.line1);
  const [line2, setLine2] = useState(defaultState.line2);
  const [font, setFont] = useState(defaultState.font);
  const [fontOpen, setFontOpen] = useState(false);
  const [line2Font, setLine2Font] = useState(defaultState.line2Font);
  const [line2FontOpen, setLine2FontOpen] = useState(false);
  const [face, setFace] = useState(defaultState.face);
  const [line2Face, setLine2Face] = useState(defaultState.line2Face);
  const [side, setSide] = useState(defaultState.side);
  const [line2Side, setLine2Side] = useState(defaultState.line2Side);
  const [line1HeightCm, setLine1HeightCm] = useState(defaultState.line1HeightCm);
  const [line2HeightCm, setLine2HeightCm] = useState(defaultState.line2HeightCm);
  const [lineGapCm, setLineGapCm] = useState(defaultState.lineGapCm);
  const [calibrationCm, setCalibrationCm] = useState(defaultState.calibrationCm);
  const [line1HeightInput, setLine1HeightInput] = useState(String(defaultState.line1HeightCm));
  const [line2HeightInput, setLine2HeightInput] = useState(String(defaultState.line2HeightCm));
  const [lineGapInput, setLineGapInput] = useState(String(defaultState.lineGapCm));
  const [calibrationInput, setCalibrationInput] = useState(String(defaultState.calibrationCm));
  const [lighting, setLighting] = useState<Lighting>(defaultState.lighting);
  const [night, setNight] = useState(defaultState.night);
  const [twoLines, setTwoLines] = useState(defaultState.twoLines);
  const [line2Align, setLine2Align] = useState<Line2Align>(defaultState.line2Align);
  const [facade, setFacade] = useState(defaultState.facade);
  const [logo, setLogo] = useState(defaultState.logo);
  const [logoAspect, setLogoAspect] = useState(defaultState.logoAspect);
  const [logoHeightCm, setLogoHeightCm] = useState(defaultState.logoHeightCm);
  const [logoHeightInput, setLogoHeightInput] = useState(String(defaultState.logoHeightCm));
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(defaultState.logoPosition);
  const [points, setPoints] = useState<Point[]>(defaultState.points);
  const [placingPoints, setPlacingPoints] = useState(false);
  const [signPos, setSignPos] = useState<Point>(defaultState.signPos);
  const [rotation, setRotation] = useState(defaultState.rotation);
  const [drag, setDrag] = useState<DragMode>(null);
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 1000, height: 650 });
  const [stageShot, setStageShot] = useState('');
  const [stageShotRatio, setStageShotRatio] = useState(16 / 9);
  const [fontMeasureTick, setFontMeasureTick] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const facadeInputRef = useRef<HTMLInputElement>(null);
  const [facadeDragOver, setFacadeDragOver] = useState(false);

  // Проект больше не сохраняется в браузере: при каждом обновлении страницы конструктор открывается с чистыми настройками.
  useEffect(() => {
    try { localStorage.removeItem('rsDesignerProjectV318MM'); } catch {}
  }, []);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const update = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleSizeInput = (raw: string, setRaw: (value: string) => void, setNumeric: (value: number) => void) => {
    setRaw(raw);
    if (raw.trim() === '') return;
    const normalized = raw.replace(',', '.');
    const next = Number(normalized);
    if (Number.isFinite(next) && next > 0) setNumeric(next);
  };

  const handleNonNegativeSizeInput = (raw: string, setRaw: (value: string) => void, setNumeric: (value: number) => void) => {
    setRaw(raw);
    if (raw.trim() === '') return;
    const normalized = raw.replace(',', '.');
    const next = Number(normalized);
    if (Number.isFinite(next) && next >= 0) setNumeric(next);
  };

  useEffect(() => {
    let cancelled = false;
    const fontsApi = (document as any).fonts;
    if (!fontsApi) return;
    Promise.all([
      fontsApi.load(`900 100px ${font}`),
      fontsApi.load(`900 100px ${line2Font}`),
      fontsApi.ready
    ]).then(() => {
      if (!cancelled) setFontMeasureTick(v => v + 1);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [font, line2Font]);

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
  const lineFonts = useMemo(() => twoLines ? [font, line2Font] : [font], [twoLines, font, line2Font]);
  const lineFaces = useMemo(() => twoLines ? [face, line2Face] : [face], [twoLines, face, line2Face]);
  const lineSides = useMemo(() => twoLines ? [side, line2Side] : [side], [twoLines, side, line2Side]);

  // Точная калибровка: две точки задают количество пикселей на 1 мм.
  // Важное исправление: ширина текста больше не считается по грубой формуле
  // «количество символов × 0.62». Теперь браузер измеряет выбранный шрифт
  // через Canvas API, поэтому размер вывески после калибровки заметно точнее.
  const pxPerCm = points.length === 2 ? distance(points[0], points[1]) / Math.max(1, calibrationCm) : 0;
  const exact = pxPerCm > 0;
  const fallbackPxPerCm = 0.48;
  const workingPxPerCm = exact ? pxPerCm : fallbackPxPerCm;
  const maxLetterHeightCm = Math.max(...lineHeightsCm);

  // Точная высота букв после калибровки.
  // Важно: font-size в браузере НЕ равен визуальной высоте буквы.
  // Поэтому сначала измеряем реальные границы глифов через Canvas API,
  // а затем подбираем такой font-size, чтобы видимая высота буквы
  // соответствовала введённому размеру в миллиметрах.
  const getGlyphMetrics = (text: string, fontSizePx: number, fontFamily = font) => {
    void fontMeasureTick;
    const sample = text && text.trim() ? text : 'Вывеска';
    if (typeof document === 'undefined') {
      return { width: (sample.trim().length || 1) * fontSizePx * 0.62, height: fontSizePx * 0.72 };
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { width: (sample.trim().length || 1) * fontSizePx * 0.62, height: fontSizePx * 0.72 };
    }
    ctx.font = `900 ${fontSizePx}px ${fontFamily}`;
    const metrics = ctx.measureText(text && text.trim() ? text : 'Вывеска');
    const actualHeight = (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0);
    return {
      width: Math.max(1, metrics.width),
      height: Math.max(1, actualHeight || fontSizePx * 0.72)
    };
  };

  const resolveFontSizeForVisualHeight = (_text: string, targetHeightPx: number, fontFamily = font) => {
    // Высота вывески должна соответствовать высоте заглавной буквы,
    // как в производственных макетах. Поэтому для подбора font-size
    // используем эталонный кириллический глиф «К», а не весь текст строки.
    const testSize = 100;
    const measured = getGlyphMetrics('К', testSize, fontFamily).height;
    const ratio = measured / testSize || 0.72;
    return Math.max(1, targetHeightPx / ratio);
  };

  const lineTargetHeightsPx = lineHeightsCm.map(h => Math.max(1, h * workingPxPerCm));
  const lineFontSizesPx = lines.map((line, i) => resolveFontSizeForVisualHeight(line, lineTargetHeightsPx[i], lineFonts[i] || font));
  const letterHeightPx = Math.max(...lineTargetHeightsPx);

  const measureTextWidthPx = (text: string, fontSizePx: number, fontFamily: string) => getGlyphMetrics(text, fontSizePx, fontFamily).width;
  const textLineWidthsPx = lines.map((line, i) => measureTextWidthPx(line, lineFontSizesPx[i], lineFonts[i] || font));
  const textWidthPx = Math.max(1, ...textLineWidthsPx);
  const textLineOffsetsPx = lines.map((_, i) => {
    if (!twoLines || textLineWidthsPx.length < 2) return 0;
    const currentWidth = textLineWidthsPx[i] || 0;
    if (line2Align === 'center') return Math.max(0, (textWidthPx - currentWidth) / 2);
    if (line2Align === 'right') return Math.max(0, textWidthPx - currentWidth);
    return 0;
  });
  const logoWidthCm = logo ? logoHeightCm * logoAspect : 0;
  const logoWidthPx = logo ? logoWidthCm * workingPxPerCm : 0;
  const gapCm = logo ? Math.max(40, Math.min(maxLetterHeightCm, logoHeightCm) * 0.18) : 0;
  const gapPx = gapCm * workingPxPerCm;
  const effectiveLineGapCm = twoLines ? Math.max(0, lineGapCm) : 0;
  const textHeightCm = twoLines ? line1HeightCm + line2HeightCm + effectiveLineGapCm : line1HeightCm;
  const textHeightPx = textHeightCm * workingPxPerCm;
  const lineGapPx = effectiveLineGapCm * workingPxPerCm;
  const logoHeightPxRaw = logo ? logoHeightCm * workingPxPerCm : 0;
  const logoOnSide = !!logo && (logoPosition === 'left' || logoPosition === 'right');
  const logoOnStack = !!logo && (logoPosition === 'top' || logoPosition === 'bottom');
  const signWidthPx = Math.max(80, logo
    ? (logoOnStack ? Math.max(textWidthPx, logoWidthPx) : logoWidthPx + gapPx + textWidthPx)
    : textWidthPx
  );
  const signWidthCm = Math.round(signWidthPx / workingPxPerCm);
  const signHeightPx = Math.max(40, logo
    ? (logoOnStack ? logoHeightPxRaw + gapPx + textHeightPx : Math.max(textHeightPx, logoHeightPxRaw))
    : textHeightPx
  );
  const signHeightCm = Math.round(signHeightPx / workingPxPerCm);

  // Важное исправление: в рабочей области и в PDF высота берётся
  // из фактической компоновки. Для логотипа сверху/снизу это сумма:
  // логотип + технологический зазор + текстовый блок.
  const displayHeightMm = Math.round(signHeightPx / workingPxPerCm);

  // Размеры для чертежа в PDF: общая длина + отдельно высота
  // заглавных и строчных букв.
  const uppercaseHeightsPx = lineFontSizesPx.map((fs, i) => getGlyphMetrics('К', fs, lineFonts[i] || font).height);
  const lowercaseHeightsPx = lines.map((line, i) => /[a-zа-яё]/.test(line) ? getGlyphMetrics('к', lineFontSizesPx[i], lineFonts[i] || font).height : 0);
  const uppercaseHeightPx = Math.max(1, ...uppercaseHeightsPx);
  const lowercaseHeightPx = Math.max(0, ...lowercaseHeightsPx);
  const uppercaseHeightMm = Math.max(1, Math.round(uppercaseHeightPx / workingPxPerCm));
  const lowercaseHeightMm = lowercaseHeightPx > 0 ? Math.max(1, Math.round(lowercaseHeightPx / workingPxPerCm)) : 0;
  const hasLowercaseLetters = lowercaseHeightMm > 0;

  const sideDepthPx = Math.max(1.2, letterHeightPx * 0.022);
  const darkFace = '#080a0d';
  const darkSide = '#050609';
  const shadowSide = '#111318';
  const lightingTextStyle = (fs: number, currentFace = face, currentSide = side) => {
    const strokeBase = Math.max(0.7, fs * 0.014);
    if (!night) {
      return {
        color: currentFace,
        textShadow: `${sideDepthPx}px ${sideDepthPx}px 0 ${currentSide}, ${sideDepthPx * 1.25}px ${sideDepthPx * 1.35}px ${sideDepthPx}px rgba(0,0,0,.28)`,
        WebkitTextStroke: `${strokeBase}px ${currentSide}`
      } as React.CSSProperties;
    }
    const faceGlow = `0 0 ${fs * 0.18}px ${currentFace}, 0 0 ${fs * 0.38}px ${currentFace}`;
    const sideGlow = `0 0 ${fs * 0.16}px ${currentSide}, 0 0 ${fs * 0.32}px ${currentSide}`;
    const backHalo = `0 0 ${fs * 0.48}px ${currentFace}, 0 0 ${fs * 0.78}px ${currentFace}`;
    if (lighting === 'front') return { color: currentFace, textShadow: faceGlow, WebkitTextStroke: `${strokeBase}px ${darkSide}` } as React.CSSProperties;
    if (lighting === 'side') return { color: darkFace, textShadow: sideGlow, WebkitTextStroke: `${Math.max(1.2, strokeBase * 1.75)}px ${currentSide}` } as React.CSSProperties;
    if (lighting === 'back') return { color: darkFace, textShadow: backHalo, WebkitTextStroke: `${strokeBase}px ${shadowSide}` } as React.CSSProperties;
    if (lighting === 'frontBack') return { color: currentFace, textShadow: `${faceGlow}, ${backHalo}`, WebkitTextStroke: `${strokeBase}px ${darkSide}` } as React.CSSProperties;
    if (lighting === 'frontSide') return { color: currentFace, textShadow: `${faceGlow}, ${sideGlow}`, WebkitTextStroke: `${Math.max(1, strokeBase * 1.45)}px ${currentSide}` } as React.CSSProperties;
    return { color: currentFace, opacity: 0.55, textShadow: 'none', filter: 'none', WebkitTextStroke: `${strokeBase}px ${currentSide}` } as React.CSSProperties;
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

  const loadFacadeFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Загрузите изображение фасада: JPG, PNG, WEBP, HEIC/HEIF.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFacade(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onFacade = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFacadeFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const onStageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!facade) setFacadeDragOver(true);
  };

  const onStageDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setFacadeDragOver(false);
  };

  const onStageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFacadeDragOver(false);
    loadFacadeFile(e.dataTransfer.files?.[0]);
  };
  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isSvg = file.type === 'image/svg+xml' || name.endsWith('.svg');
    const isPng = file.type === 'image/png' || name.endsWith('.png');
    const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
    const isCdr = name.endsWith('.cdr');

    try {
      if (isCdr) {
        alert('Формат CorelDRAW CDR не отображается напрямую в браузере. Экспортируйте логотип из CorelDRAW в PDF, SVG или PNG и загрузите этот файл. PDF уже поддерживается.');
        return;
      }

      if (!isSvg && !isPng && !isPdf) {
        alert('Загрузите логотип в SVG, PNG или PDF. Для CorelDRAW используйте экспорт в PDF/SVG/PNG.');
        return;
      }

      const dataUrl = isPdf ? await renderPdfLogoToPng(file) : await readFileAsDataUrl(file);
      const trimmed = await trimTransparentImage(dataUrl);
      setLogo(trimmed.dataUrl);
      setLogoAspect(clamp(trimmed.aspect, 0.25, 6));
      setLogoHeightCm(prev => {
        const next = prev || line1HeightCm;
        setLogoHeightInput(String(next));
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить логотип. Попробуйте экспортировать файл в SVG или PNG с прозрачным фоном.');
    } finally {
      e.target.value = '';
    }
  };

  const clickStage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || drag) return;
    if (placingPoints) {
      const p = getStagePoint(e.clientX, e.clientY);
      setPoints(prev => {
        const next = prev.length >= 2 ? [p] : [...prev, p];
        if (next.length === 2) setPlacingPoints(false);
        return next;
      });
      return;
    }
    if (!facade) {
      facadeInputRef.current?.click();
    }
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
    const ratio = stageCanvas.width && stageCanvas.height ? stageCanvas.width / stageCanvas.height : 16 / 9;
    document.body.classList.remove('pdf-exporting');

    // Важно: синхронно подставляем снимок в PDF-шаблон.
    // Без flushSync React иногда не успевал обновить скрытый блок PDF до html2canvas,
    // и на первой странице оставался только фасад без итоговой визуализации вывески.
    flushSync(() => {
      setStageShotRatio(ratio);
      setStageShot(shot);
    });

    // Ждём, пока снимок реально загрузится в скрытом PDF-шаблоне.
    const snapshotImg = pdfRef.current.querySelector('.stageSnapshot') as HTMLImageElement | null;
    if (snapshotImg && !snapshotImg.complete) {
      await new Promise<void>((resolve) => {
        snapshotImg.onload = () => resolve();
        snapshotImg.onerror = () => resolve();
      });
    }
    if (snapshotImg?.decode) {
      await snapshotImg.decode().catch(() => undefined);
    }

    // 2) Ждём финальную отрисовку скрытого PDF-шаблона.
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    const pages = Array.from(pdfRef.current.querySelectorAll('.pdfSheet')) as HTMLElement[];
    const firstPage = pages[0];
    const facadeStageEl = firstPage?.querySelector('.pdfFacadeStage.snapshotStage') as HTMLElement | null;
    const pageRect = firstPage?.getBoundingClientRect();
    const stageRect = facadeStageEl?.getBoundingClientRect();
    const pdfStageMmFromDom = pageRect && stageRect ? {
      x: (stageRect.left - pageRect.left) * 297 / pageRect.width,
      y: (stageRect.top - pageRect.top) * 210 / pageRect.height,
      w: stageRect.width * 297 / pageRect.width,
      h: stageRect.height * 210 / pageRect.height
    } : null;

    // Страховка: раньше визуализация бралась из скрытого шаблона.
    // Если Chrome/html2canvas вернул нулевые размеры скрытого блока, берём координаты
    // стабильной области визуализации 845×500 px на A4 landscape.
    const pdfStageMm = pdfStageMmFromDom && pdfStageMmFromDom.w > 20 && pdfStageMmFromDom.h > 20
      ? pdfStageMmFromDom
      : { x: 36.65, y: 44.2, w: 223.6, h: 132.25 };

    const doc = new jsPDF('landscape', 'mm', 'a4');
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) doc.addPage('a4', 'landscape');
      doc.addImage(img, 'JPEG', 0, 0, 297, 210);

      // На первой странице дополнительно вставляем снимок рабочей области напрямую в PDF.
      // Это страховка от сбоя html2canvas, когда dataURL-картинка внутри скрытого шаблона
      // в Chrome иногда не попадает в итоговый PDF и остаётся пустое белое поле.
      if (i === 0 && pdfStageMm && shot) {
        const shotRatio = ratio || 16 / 9;
        const boxRatio = pdfStageMm.w / pdfStageMm.h;
        let drawW = pdfStageMm.w;
        let drawH = pdfStageMm.h;
        let drawX = pdfStageMm.x;
        let drawY = pdfStageMm.y;
        if (shotRatio >= boxRatio) {
          drawW = pdfStageMm.w;
          drawH = pdfStageMm.w / shotRatio;
          drawY = pdfStageMm.y + (pdfStageMm.h - drawH) / 2;
        } else {
          drawH = pdfStageMm.h;
          drawW = pdfStageMm.h * shotRatio;
          drawX = pdfStageMm.x + (pdfStageMm.w - drawW) / 2;
        }
        doc.addImage(shot, 'JPEG', drawX, drawY, drawW, drawH);
        doc.setTextColor(255, 205, 176);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        (doc as any).text('REKLAMASTROY.RU', drawX + drawW / 2, drawY + drawH / 2, { align: 'center', angle: -18 });
        doc.setTextColor(0, 0, 0);
      }
    }
    doc.save('reklamastroy-visualization.pdf');
  };

  const drawingScale = Math.min(1.16, 780 / Math.max(1, signWidthPx + 260), 380 / Math.max(1, signHeightPx + 170));

  const pdfFacadeBox = { width: 845, height: 500 };
  const stageShotFit = useMemo(() => {
    const safeRatio = Number.isFinite(stageShotRatio) && stageShotRatio > 0 ? stageShotRatio : 16 / 9;
    const boxRatio = pdfFacadeBox.width / pdfFacadeBox.height;
    if (safeRatio >= boxRatio) {
      return { width: pdfFacadeBox.width, height: Math.round(pdfFacadeBox.width / safeRatio) };
    }
    return { width: Math.round(pdfFacadeBox.height * safeRatio), height: pdfFacadeBox.height };
  }, [stageShotRatio]);
  const stageShotBoxStyle = useMemo(() => ({
    '--shot-box-width': `${stageShotFit.width}px`,
    '--shot-box-height': `${stageShotFit.height}px`
  }) as React.CSSProperties, [stageShotFit]);
  const pdfFacadeFallbackBoxStyle = useMemo(() => ({
    '--shot-box-width': `${pdfFacadeBox.width}px`,
    '--shot-box-height': `${pdfFacadeBox.height}px`
  }) as React.CSSProperties, []);

  const SignGraphic = ({ pdfMode = false, scale = 1, drawingMode = false }: { pdfMode?: boolean; scale?: number; drawingMode?: boolean }) => {
    // Важно: отображаем строки font-size, рассчитанным по реальной
    // высоте заглавной буквы. Иначе при 437 мм визуальная буква
    // получается меньше калибровочного расстояния.
    const fontSizes = lineFontSizesPx.map(fs => fs * scale);
    const fontSize = Math.max(...fontSizes);
    const widthPx = signWidthPx * scale;
    const heightPx = signHeightPx * scale;
    const logoHeightPx = logoHeightCm * workingPxPerCm * scale;
    const logoWidthPxScaled = logoWidthPx * scale;
    const gapPxScaled = gapPx * scale;
    const textWidthPxScaled = textWidthPx * scale;
    const lineWidthsScaled = textLineWidthsPx.map(w => w * scale);
    const lineOffsetsScaled = textLineOffsetsPx.map(offset => offset * scale);
    const lineHeightsScaled = lineTargetHeightsPx.map(h => h * scale);
    const lineGapPxScaled = lineGapPx * scale;
    const depthPx = sideDepthPx * scale;
    const logoFilter = logoLightingFilter(Math.max(logoHeightPx, fontSize), depthPx);

    const logoStacked = !!logo && (logoPosition === 'top' || logoPosition === 'bottom');
    const logoSided = !!logo && (logoPosition === 'left' || logoPosition === 'right');
    const textBlockHeightPx = textHeightPx * scale;
    const textStartX = logoStacked
      ? (widthPx - textWidthPxScaled) / 2
      : (logo && logoPosition === 'left' ? logoWidthPxScaled + gapPxScaled : 0);
    const logoX = logo ? (logoStacked
      ? (widthPx - logoWidthPxScaled) / 2
      : (logoPosition === 'left' ? 0 : textWidthPxScaled + gapPxScaled)
    ) : 0;
    const textTopY = logoStacked
      ? (logoPosition === 'top' ? logoHeightPx + gapPxScaled : 0)
      : (heightPx - textBlockHeightPx) / 2;
    const line1TopY = textTopY;
    const line2TopY = textTopY + (lineHeightsScaled[0] || 0) + (twoLines ? lineGapPxScaled : 0);
    const logoTopY = logo ? (logoStacked
      ? (logoPosition === 'top' ? 0 : textBlockHeightPx + gapPxScaled)
      : (heightPx - logoHeightPx) / 2
    ) : 0;

    const logoWidthMm = Math.round(logoWidthCm);
    const logoHeightMm = Math.round(logoHeightCm);
    const line2WidthMm = twoLines ? Math.max(1, Math.round((textLineWidthsPx[1] || 0) / workingPxPerCm)) : 0;
    const line2HeightMm = twoLines ? Math.round(line2HeightCm) : 0;

    // CorelDraw-style dimension layout for the PDF drawing page.
    const corelDims = drawingMode && pdfMode;
    const dimSignX = corelDims ? 170 : 70;
    const dimTopY = corelDims ? 108 : 48;
    const dimHorizontalY = corelDims ? 42 : 26;
    const dimSvgWidth = widthPx + (corelDims ? 560 : 140);
    const dimSvgHeight = heightPx + (corelDims ? 270 : 88);
    const drawingBoxWidth = corelDims ? dimSvgWidth : widthPx;
    const drawingBoxHeight = corelDims ? dimSvgHeight : undefined;
    const commonLettersStyle = {
      width: widthPx,
      height: heightPx,
      fontFamily: font,
      fontSize,
      gap: 0,
      flexDirection: logoStacked ? 'column' as const : 'row' as const,
      alignItems: logoStacked ? 'center' : 'center',
      justifyContent: logoStacked ? 'flex-start' : 'flex-start'
    };
    const lettersStyle = corelDims
      ? { position: 'absolute' as const, left: dimSignX, top: dimTopY, ...commonLettersStyle }
      : commonLettersStyle;

    const markerSuffix = pdfMode ? 'pdf' : 'live';
    const startMarker = `url(#arrow-start-${markerSuffix})`;
    const endMarker = `url(#arrow-end-${markerSuffix})`;

    // Точные координаты габаритов PDF-макета.
    // Стрелки идут от реального начала до реального конца объекта.
    const signAbsLeft = dimSignX;
    const signAbsRight = dimSignX + widthPx;
    const signAbsTop = dimTopY;
    const signAbsBottom = dimTopY + heightPx;

    const logoAbsLeft = dimSignX + logoX;
    const logoAbsRight = logoAbsLeft + logoWidthPxScaled;
    const logoAbsTop = dimTopY + logoTopY;
    const logoAbsBottom = logoAbsTop + logoHeightPx;

    const lineAbs = lines.map((line, i) => {
      const top = i === 0 ? line1TopY : line2TopY;
      const height = lineHeightsScaled[i] || 0;
      const lowerHeight = (lowercaseHeightsPx[i] || 0) * scale;
      return {
        left: dimSignX + textStartX + (lineOffsetsScaled[i] || 0),
        right: dimSignX + textStartX + (lineOffsetsScaled[i] || 0) + (lineWidthsScaled[i] || 0),
        top: dimTopY + top,
        bottom: dimTopY + top + height,
        width: lineWidthsScaled[i] || 0,
        height,
        lowerHeight,
        lowerMm: lowercaseHeightsPx[i] ? Math.max(1, Math.round(lowercaseHeightsPx[i] / workingPxPerCm)) : 0,
        hasLower: /[a-zа-яё]/.test(line || '') && lowerHeight > 0
      };
    });

    const drawHDim = (
      key: string,
      x1: number,
      x2: number,
      y: number,
      objectY: number,
      label: string,
      labelOffset = -9
    ) => <React.Fragment key={key}>
      <line className="dimExt" x1={x1} y1={y} x2={x1} y2={objectY} />
      <line className="dimExt" x1={x2} y1={y} x2={x2} y2={objectY} />
      <line className="dimMain" x1={x1} y1={y} x2={x2} y2={y} markerStart={startMarker} markerEnd={endMarker} />
      <text x={(x1 + x2) / 2} y={y + labelOffset} textAnchor="middle">{label}</text>
    </React.Fragment>;

    const drawVDim = (
      key: string,
      x: number,
      y1: number,
      y2: number,
      objectX: number,
      label: string,
      labelSide: 'left' | 'right' = 'left',
      options: { horizontalLabel?: boolean; labelY?: number; textOffset?: number } = {}
    ) => {
      const textOffset = options.textOffset ?? 18;
      const textX = labelSide === 'left' ? x - textOffset : x + textOffset;
      const textY = options.labelY ?? ((y1 + y2) / 2 + 4);
      return <React.Fragment key={key}>
        <line className="dimExt" x1={x} y1={y1} x2={objectX} y2={y1} />
        <line className="dimExt" x1={x} y1={y2} x2={objectX} y2={y2} />
        <line className="dimMain" x1={x} y1={y1} x2={x} y2={y2} markerStart={startMarker} markerEnd={endMarker} />
        {options.horizontalLabel
          ? <text x={textX} y={textY} textAnchor={labelSide === 'left' ? 'end' : 'start'}>{label}</text>
          : <text x={textX} y={textY} textAnchor="middle" transform={`rotate(-90 ${textX} ${textY})`}>{label}</text>}
      </React.Fragment>;
    };

    const safeTopDimY = (candidate: number) => Math.max(dimHorizontalY + 34, candidate);
    const signHeightDimX = signAbsLeft - (corelDims ? 126 : 22);
    const logoHeightDimX = logo ? (logoPosition === 'left' ? logoAbsLeft - 54 : signAbsRight + 34) : 0;
    const rightDimBase = signAbsRight + (logo && logoPosition !== 'left' ? 100 : 40);
    const rightDimGap = corelDims ? 58 : 28;
    const line1CapX = rightDimBase;
    const line1LowerX = rightDimBase + rightDimGap;
    const line2CapX = rightDimBase + rightDimGap * 2;
    const line2LowerX = rightDimBase + rightDimGap * 3;
    return <div
      className={(pdfMode ? 'sign signPdf' : 'sign') + (drawingMode ? ' drawingSign' : '')}
      style={{
        left: drawingMode ? undefined : (pdfMode ? signPos.x * scale : signPos.x),
        top: drawingMode ? undefined : (pdfMode ? signPos.y * scale : signPos.y),
        width: drawingBoxWidth,
        height: drawingMode ? drawingBoxHeight : heightPx,
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
      <svg
        className={corelDims ? 'signDims signDimsCorel' : 'signDims'}
        width={dimSvgWidth}
        height={dimSvgHeight}
        viewBox={`0 0 ${dimSvgWidth} ${dimSvgHeight}`}
        style={corelDims ? undefined : { left: -dimSignX, top: -dimTopY }}
      >
        <defs>
          <marker id={`arrow-start-${pdfMode ? 'pdf' : 'live'}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/>
          </marker>
          <marker id={`arrow-end-${pdfMode ? 'pdf' : 'live'}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#ff6a00"/>
          </marker>
        </defs>
        {drawingMode && pdfMode ? <>
          {/* Общая длина вывески */}
          {drawHDim('sign-width', signAbsLeft, signAbsRight, dimHorizontalY, signAbsTop, mm(signWidthCm), -10)}

          {/* Общая высота вывески */}
          {drawVDim('sign-height', signHeightDimX, signAbsTop, signAbsBottom, signAbsLeft, mm(displayHeightMm), 'left', { textOffset: 22 })}

          {/* Габариты логотипа */}
          {logo && <>
            {drawHDim('logo-width', logoAbsLeft, logoAbsRight, safeTopDimY(logoAbsTop - 30), logoAbsTop, mm(logoWidthMm), -9)}
            {drawVDim(
              'logo-height',
              logoHeightDimX,
              logoAbsTop,
              logoAbsBottom,
              logoPosition === 'left' ? logoAbsLeft : logoAbsRight,
              mm(logoHeightMm),
              logoPosition === 'left' ? 'left' : 'right',
              { textOffset: 20 }
            )}
          </>}

          {/* Высота заглавных и строчных букв первой строки */}
          {lineAbs[0] && drawVDim('line1-cap-height', line1CapX, lineAbs[0].top, lineAbs[0].bottom, lineAbs[0].right, mm(line1HeightCm), 'right', { horizontalLabel: true, labelY: lineAbs[0].top + 16, textOffset: 12 })}
          {lineAbs[0]?.hasLower && drawVDim('line1-lower-height', line1LowerX, lineAbs[0].bottom - lineAbs[0].lowerHeight, lineAbs[0].bottom, lineAbs[0].right, mm(lineAbs[0].lowerMm), 'right', { horizontalLabel: true, labelY: lineAbs[0].bottom - 8, textOffset: 12 })}

          {/* Габариты второй строки */}
          {twoLines && lines[1]?.trim() && lineAbs[1] && <>
            {drawHDim('line2-width', lineAbs[1].left, lineAbs[1].right, lineAbs[1].bottom + 36, lineAbs[1].bottom, mm(line2WidthMm), 31)}
            {drawVDim('line2-cap-height', line2CapX, lineAbs[1].top, lineAbs[1].bottom, lineAbs[1].right, mm(line2HeightMm), 'right', { horizontalLabel: true, labelY: lineAbs[1].top + 16, textOffset: 12 })}
            {lineAbs[1].hasLower && drawVDim('line2-lower-height', line2LowerX, lineAbs[1].bottom - lineAbs[1].lowerHeight, lineAbs[1].bottom, lineAbs[1].right, mm(lineAbs[1].lowerMm), 'right', { horizontalLabel: true, labelY: lineAbs[1].bottom - 8, textOffset: 12 })}
          </>}
        </> : <>
          {/* Рабочий экран: стрелки привязаны к тем же точным границам, что и сам макет */}
          {drawHDim('live-sign-width', signAbsLeft, signAbsRight, dimHorizontalY, signAbsTop, mm(signWidthCm), -8)}
          {drawVDim('live-sign-height', signAbsLeft - 22, signAbsTop, signAbsBottom, signAbsLeft, mm(displayHeightMm), 'left')}
        </>}
      </svg>
      <div className="letters" style={lettersStyle} data-lighting={lighting}>
        {logo && logoPosition === 'top' && <img className="logo logoTop" src={logo} draggable={false} style={{ width: logoWidthPxScaled, height: logoHeightPx, filter: logoFilter, marginBottom: gapPxScaled, marginTop: 0, marginLeft: 0, marginRight: 0, maxWidth: 'none' }}/>} 
        {logo && logoPosition === 'left' && <img className="logo" src={logo} draggable={false} style={{ width: logoWidthPxScaled, height: logoHeightPx, filter: logoFilter, marginRight: gapPxScaled, marginLeft: 0, marginTop: 0, marginBottom: 0, maxWidth: 'none' }}/>} 
        <div className="textBlock" style={{ width: textWidthPxScaled }}>{lines.map((line, i) => <span key={i} style={{ marginLeft: `${lineOffsetsScaled[i] || 0}px`, fontSize: fontSizes[i], fontFamily: lineFonts[i] || font, lineHeight: `${lineTargetHeightsPx[i] * scale}px`, minHeight: `${lineTargetHeightsPx[i] * scale}px`, ...lightingTextStyle(fontSizes[i], lineFaces[i] || face, lineSides[i] || side) }}>{line}</span>)}</div>
        {logo && logoPosition === 'right' && <img className="logo logoRight" src={logo} draggable={false} style={{ width: logoWidthPxScaled, height: logoHeightPx, filter: logoFilter, marginLeft: gapPxScaled, marginRight: 0, marginTop: 0, marginBottom: 0, maxWidth: 'none' }}/>} 
        {logo && logoPosition === 'bottom' && <img className="logo logoBottom" src={logo} draggable={false} style={{ width: logoWidthPxScaled, height: logoHeightPx, filter: logoFilter, marginTop: gapPxScaled, marginBottom: 0, marginLeft: 0, marginRight: 0, maxWidth: 'none' }}/>} 
      </div>
    </div>;
  };

  const CalibrationLine = () => null;

  return <>
    <main className="app constructorFrame">
      <aside className="panel left panelPremium">
        <div className="sectionBadge">Укажите известный размер на фото, например ширину окна или двери</div>
        <div className="hintBox"><b>Поставьте 2 точки</b><span>Отметьте известный размер на фото: ширину окна, двери или витрины. Точки можно двигать мышкой.</span></div>
        <button className={placingPoints ? 'active' : ''} onClick={() => { if (!placingPoints) setPoints([]); setPlacingPoints(v => !v); }}>{placingPoints ? 'Кликните 2 точки на фото' : 'Калибровать по 2 точкам'}</button>
        <label>Реальный размер между точками, мм<input type="number" value={calibrationInput} onChange={e => handleSizeInput(e.target.value, setCalibrationInput, setCalibrationCm)} /></label>

        <div className="sectionBadge">Введите текст и размеры</div>
        <label>Текст первой строки<input value={line1} onChange={e => setLine1(e.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={twoLines} onChange={e => { const checked = e.target.checked; setTwoLines(checked); if (checked) { setLine2Font(font); setLine2Face(face); setLine2Side(side); } }} /> Добавить вторую строку</label>
        {twoLines && <label>Выравнивание второй строки<select value={line2Align} onChange={e => setLine2Align(e.target.value as Line2Align)}><option value="left">Слева</option><option value="center">По центру</option><option value="right">Справа</option></select></label>}
        {twoLines && <label>Текст второй строки<input value={line2} onChange={e => setLine2(e.target.value)} /></label>}
        <FontPicker label={twoLines ? 'Шрифт первой строки' : 'Шрифт'} value={font} onChange={setFont} open={fontOpen} setOpen={setFontOpen} preview={line1 || 'Вывеска'} />
        {twoLines && <FontPicker label="Шрифт второй строки" value={line2Font} onChange={setLine2Font} open={line2FontOpen} setOpen={setLine2FontOpen} preview={line2 || 'Вторая строка'} />}
        <label>Высота первой строки, мм<input type="number" value={line1HeightInput} onChange={e => handleSizeInput(e.target.value, setLine1HeightInput, setLine1HeightCm)} /></label>
        {twoLines && <label>Высота второй строки, мм<input type="number" value={line2HeightInput} onChange={e => handleSizeInput(e.target.value, setLine2HeightInput, setLine2HeightCm)} /></label>}
        {twoLines && <label>Расстояние между строками, мм<input type="number" value={lineGapInput} onChange={e => handleNonNegativeSizeInput(e.target.value, setLineGapInput, setLineGapCm)} /></label>}
        <label className="file secondary">Добавить свой логотип<input key={logoInputKey} type="file" accept="image/svg+xml,image/png,application/pdf,.svg,.png,.pdf,.cdr" onChange={onLogo}/></label><small className="tip">Логотип: SVG, PNG или PDF. Файлы CorelDRAW CDR нужно экспортировать из CorelDRAW в PDF/SVG/PNG.</small>
        <label className={!logo ? 'disabledLabel' : ''}>Высота логотипа, мм<input disabled={!logo} type="number" value={logoHeightInput} onChange={e => handleSizeInput(e.target.value, setLogoHeightInput, setLogoHeightCm)} /></label>
        <label className={!logo ? 'disabledLabel' : ''}>Размещение логотипа<select disabled={!logo} value={logoPosition} onChange={e => setLogoPosition(e.target.value as LogoPosition)}><option value="left">Слева от текста</option><option value="right">Справа от текста</option><option value="top">Сверху</option><option value="bottom">Снизу</option></select></label>
        {logo && <button onClick={() => { setLogo(''); setLogoInputKey(v => v + 1); }}>Удалить логотип</button>}

        <div className="sectionBadge">Выберите цвет плёнки ORACAL</div>
        <ColorDropdown label={twoLines ? 'Цвет первой строки' : 'Лицевая часть'} palette="ORACAL 8500" list={ORACAL_8500} value={face} onChange={setFace} />
        {twoLines && <ColorDropdown label="Лицевая часть второй строки" palette="ORACAL 8500" list={ORACAL_8500} value={line2Face} onChange={setLine2Face} />}
        <ColorDropdown label={twoLines ? 'Борт первой строки' : 'Борта'} palette="ORACAL 641" list={ORACAL_641} value={side} onChange={setSide} />
        {twoLines && <ColorDropdown label="Борт второй строки" palette="ORACAL 641" list={ORACAL_641} value={line2Side} onChange={setLine2Side} />}

        <div className="sectionBadge">Настройте тип подсветки</div>
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

        <div className="summaryCard leftSummary"><b>Параметры макета</b><span>Длина: {mm(signWidthCm)}</span><span>Высота: {mm(displayHeightMm)}</span><span>1 строка: {mm(line1HeightCm)}</span>{twoLines && <span>2 строка: {mm(line2HeightCm)}</span>}{twoLines && <span>Расстояние между строками: {mm(lineGapCm)}</span>} {twoLines && <span>Выравнивание 2 строки: {line2Align === 'left' ? 'слева' : line2Align === 'center' ? 'по центру' : 'справа'}</span>}{logo && <span>Высота логотипа: {mm(logoHeightCm)}</span>}<span>Подсветка: {lightingLabel(lighting)}</span></div>
        <button className="panelPdfButton premiumPdfButton" onClick={pdf}>Скачать PDF</button>
      </aside>

      <section className="workspace">
        <div className="toolbar toolbarPremium">
          <div className="modeSwitch"><button onClick={() => setNight(false)} className={!night ? 'active' : ''}>☀ День</button><button onClick={() => setNight(true)} className={night ? 'active' : ''}>🌙 Ночь</button></div>
        </div>
        <div className={'stage ' + (night ? 'night' : '') + (facadeDragOver ? ' facadeDragOver' : '')} ref={stageRef} onClick={clickStage} onDragOver={onStageDragOver} onDragLeave={onStageDragLeave} onDrop={onStageDrop}>
          <input ref={facadeInputRef} className="hiddenFacadeInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/heif,image/heic" onChange={onFacade}/>
          {facade && <button type="button" className="stageAddPhotoButton" onClick={(e) => { e.stopPropagation(); facadeInputRef.current?.click(); }}>Добавить новое фото</button>}
          {facade ? <img src={facade} className="facade"/> : <div className="placeholder facadeUploadDrop"><b>+</b><strong>Загрузите фото фасада</strong><span>Нажмите на плюс или перетащите изображение сюда</span></div>}
          {points.map((p, i) => <div key={i} className="point" style={{ left: p.x, top: p.y }} onMouseDown={(e) => startPointDrag(e, i)} />)}
          <CalibrationLine />
          {facade && <SignGraphic />}
        </div>
      </section>

    </main>

    <div className="pdfPages" ref={pdfRef}>
      <section className="pdfSheet pdfSheetFacade">
        <header className="pdfTopHeader pdfTopHeaderFinal">
          <div className="pdfHeaderBrand">
            <img src={rsPdfLogoSrc} alt="РекламаСтрой" />
            <div className="pdfHeaderBrandText">
              <b>Реклама<span>Строй</span></b>
              <small>Изготовление наружной рекламы</small>
              <em>reklamastroy.ru</em>
            </div>
          </div>

          <div className="pdfHeaderMetric">
            <i className="pdfHeaderMetricIcon">✓</i>
            <div className="pdfHeaderMetricText">
              <b>3 года</b>
              <span>гарантии</span>
            </div>
          </div>

          <div className="pdfHeaderMetric">
            <i className="pdfHeaderMetricIcon">12</i>
            <div className="pdfHeaderMetricText">
              <b>12 лет</b>
              <span>опыта</span>
            </div>
          </div>

          <div className="pdfHeaderMetric pdfHeaderMetricWide">
            <i className="pdfHeaderMetricIcon">★</i>
            <div className="pdfHeaderMetricText">
              <b>1300+</b>
              <span>проектов</span>
            </div>
          </div>

          <div className="pdfHeaderInfoBlock pdfHeaderInfoPhones">
            <div className="pdfHeaderInfoRow">
              <i className="pdfHeaderInfoIcon">☎</i>
              <div className="pdfHeaderInfoText">
                <b>+7 495 008 37 95</b>
              </div>
            </div>
            <div className="pdfHeaderInfoRow">
              <i className="pdfHeaderInfoIcon">📱</i>
              <div className="pdfHeaderInfoText">
                <b>+7 925 888 37 95</b>
              </div>
            </div>
          </div>
        </header>
        <h2 className="pdfSheetTitle">Визуализация вывески</h2>
        <div className="pdfFacadeCenter">
          <div className="pdfFacadeStage snapshotStage">
            {stageShot
              ? <div className="stageSnapshotBox stageSnapshotBoxFixed" style={stageShotBoxStyle}>
                  <img src={stageShot} className="stageSnapshot"/>
                  <div className="pdfWatermark">REKLAMASTROY.RU</div>
                </div>
              : (facade ? <div className="stageSnapshotBox stageSnapshotBoxFixed" style={pdfFacadeFallbackBoxStyle}><img src={facade} className="facade"/><div className="pdfWatermark">REKLAMASTROY.RU</div></div> : <div className="placeholder">Фото фасада не загружено</div>)}
          </div>
        </div>
        <footer className="pdfNote">Данная визуализация вывески выполнена на основании реальных размеров, указанных заказчиком.</footer>
      </section>

      <section className="pdfSheet pdfSheetDrawing">
        <h2 className="pdfSheetTitle">Макет вывески</h2>
        <div className="pdfDrawingGrid centeredLayout">
          <div className="pdfDrawingStage">
            <SignGraphic pdfMode drawingMode scale={drawingScale}/>
            <div className="pdfWatermark drawing">REKLAMASTROY.RU</div>
          </div>
          <aside className="pdfSpec pdfSpecHorizontal">
            <div className="pdfSpecItem">
              <b>{twoLines ? 'ШРИФТЫ' : 'ШРИФТ'}</b>
              <span>{twoLines ? `1 строка: ${fontDisplayName(font)}` : fontDisplayName(font)}</span>
              {twoLines && <span className="pdfSpecSecondRow"><i className="pdfSpecGhostSwatch"></i><strong>Данные второй строки</strong><em>{fontDisplayName(line2Font)}</em></span>}
            </div>
            <div className="pdfSpecItem">
              <b>{twoLines ? 'ЦВЕТА ЛИЦЕВОЙ ЧАСТИ' : 'ЦВЕТ ЛИЦЕВОЙ ЧАСТИ'}</b>
              <span><i style={{background: face}}></i>{twoLines ? `1 строка: ${colorName(ORACAL_8500, face)}` : colorName(ORACAL_8500, face)}</span>
              {twoLines && <span className="pdfSpecSecondRow"><i style={{background: line2Face}}></i><strong>Данные второй строки</strong><em>{colorName(ORACAL_8500, line2Face)}</em></span>}
            </div>
            <div className="pdfSpecItem">
              <b>{twoLines ? 'ЦВЕТА БОРТА' : 'ЦВЕТ БОРТА'}</b>
              <span><i style={{background: side}}></i>{twoLines ? `1 строка: ${colorName(ORACAL_641, side)}` : colorName(ORACAL_641, side)}</span>
              {twoLines && <span className="pdfSpecSecondRow"><i style={{background: line2Side}}></i><strong>Данные второй строки</strong><em>{colorName(ORACAL_641, line2Side)}</em></span>}
            </div>
          </aside>
        </div>
        <footer className="pdfNote">Макет вывески подготовлен на основании размеров, указанных заказчиком. РПК РекламаСтрой не несет ответственность за допущенные ошибки.</footer>
      </section>
    </div>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
