import { ChangeEvent } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { oracal641, oracal8500 } from '../../data/oracal';
import { fontCategories, fontOptions } from '../../data/fonts';
import { useProjectStore } from '../../store/projectStore';

const lightingOptions = [
  { value: 'front', label: 'Лицевая', description: 'Светится лицевая часть букв' },
  { value: 'halo', label: 'Контражур', description: 'Световой ореол за буквами' },
  { value: 'front_halo', label: 'Лицевая + контражур', description: 'Лицевая подсветка и ореол за буквами' },
  { value: 'none', label: 'Без подсветки', description: 'Только дневной вид без свечения' },
] as const;

function readImageFile(file: File, onDone: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
}

function getColorName(list: typeof oracal8500 | typeof oracal641, hex: string) {
  const color = list.find((item) => item.hex === hex);
  return color ? `${color.code} — ${color.name}` : hex;
}


function makePdfExtrudeShadow(sideColor: string, depth = 10) {
  return Array.from({ length: depth }, (_, index) => `${index + 1}px ${index + 1}px 0 ${sideColor}`).join(', ');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function rgbaForPdf(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 255;
  const g = parseInt(clean.slice(2, 4), 16) || 255;
  const b = parseInt(clean.slice(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function makeDimensionSvg(widthLabel: string, heightLabel: string) {
  return `
    <svg class="rs-pdf-dimensions" viewBox="0 0 980 310" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff6b00" />
        </marker>
      </defs>
      <line x1="130" y1="34" x2="850" y2="34" stroke="#ff6b00" stroke-width="4" marker-start="url(#arrow)" marker-end="url(#arrow)" />
      <text x="490" y="24" font-size="30" font-family="Arial" font-weight="700" text-anchor="middle" fill="#222">${widthLabel}</text>
      <line x1="96" y1="86" x2="96" y2="245" stroke="#ff6b00" stroke-width="4" marker-start="url(#arrow)" marker-end="url(#arrow)" />
      <text x="72" y="172" font-size="28" font-family="Arial" font-weight="700" text-anchor="middle" fill="#222" transform="rotate(-90 72 172)">${heightLabel}</text>
    </svg>
  `;
}

async function htmlToCanvasImage(element: HTMLElement) {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  return canvas.toDataURL('image/jpeg', 0.96);
}

export function ControlPanel() {
  const project = useProjectStore();

  const onFacadeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const allowedByExt = /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !allowedByExt) {
      alert('Фото фасада можно загрузить в формате JPG, JPEG, PNG, WEBP, HEIC или HEIF.');
      event.target.value = '';
      return;
    }
    readImageFile(file, project.setFacadeDataUrl);
  };

  const onLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/svg+xml', 'image/png'];
    const allowedByExt = /\.(svg|png)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !allowedByExt) {
      alert('Логотип можно загрузить только в формате SVG или PNG с прозрачным фоном.');
      event.target.value = '';
      return;
    }
    readImageFile(file, project.setLogoDataUrl);
  };

  const downloadPdf = async () => {
    const line1 = project.textLine1.trim() || 'РекламаСтрой';
    const line2 = project.twoRows && project.textLine2.trim() ? project.textLine2.trim() : '';
    const textForCalc = line2 ? Math.max(line1.length, line2.length) : line1.length;
    const widthMm = Math.max(600, Math.round(textForCalc * project.capitalHeightCm * 0.62 * 10 + (project.logoDataUrl ? project.capitalHeightCm * 11 : 0)));
    const heightMm = Math.max(250, Math.round(project.capitalHeightCm * (line2 ? 2.25 : 1) * 10));
    const capitalHeightMm = Math.round(project.capitalHeightCm * 10);
    const lowerHeightMm = Math.round(project.capitalHeightCm * 0.7 * 10);
    const lightingLabel = lightingOptions.find((item) => item.value === project.lighting)?.label ?? '—';
    const faceColorName = getColorName(oracal8500, project.faceColor);
    const sideColorName = getColorName(oracal641, project.sideColor);
    const fontLabel = fontOptions.find((font) => font.family === project.fontFamily)?.label ?? project.fontFamily;
    const hasLowerCase = /[а-яa-zё]/.test(`${line1}${line2}`);
    const date = new Date().toLocaleDateString('ru-RU');
    const projectId = `RS-${Date.now().toString().slice(-8)}`;
    const pdfDepth = 10;
    const pdfExtrudeShadow = makePdfExtrudeShadow(project.sideColor, pdfDepth);
    const pdfGlow = project.nightMode && (project.lighting === 'front' || project.lighting === 'front_halo')
      ? `${pdfExtrudeShadow}, 0 0 12px ${project.faceColor}, 0 0 28px ${project.faceColor}, 0 0 54px ${rgbaForPdf(project.faceColor, 0.45)}`
      : `${pdfExtrudeShadow}, 14px 18px 13px rgba(0,0,0,.30)`;
    const logoHtml = project.logoDataUrl
      ? `<span class="rs-pdf-logo-3d">
          <img class="rs-pdf-logo-object rs-pdf-logo-depth rs-pdf-logo-depth-3" src="${project.logoDataUrl}" />
          <img class="rs-pdf-logo-object rs-pdf-logo-depth rs-pdf-logo-depth-2" src="${project.logoDataUrl}" />
          <img class="rs-pdf-logo-object rs-pdf-logo-depth rs-pdf-logo-depth-1" src="${project.logoDataUrl}" />
          <img class="rs-pdf-logo-object rs-pdf-logo-front" src="${project.logoDataUrl}" />
        </span>`
      : '<span class="rs-pdf-logo-circle">RS</span>';
    const signHtml = `
      <div class="rs-pdf-sign rs-pdf-lighting-${project.lighting}" style="color:${project.faceColor}; text-shadow:${pdfGlow}; font-family:${project.fontFamily}; --pdf-side-color:${project.sideColor}; --pdf-face-color:${project.faceColor}; --pdf-glow-color:${rgbaForPdf(project.faceColor, 0.52)};">
        ${logoHtml}
        <div class="rs-pdf-sign-lines">
          <div>${escapeHtml(line1)}</div>
          ${line2 ? `<div class="rs-pdf-sign-line-2">${escapeHtml(line2)}</div>` : ''}
        </div>
      </div>
    `;

    const pdfRoot = document.createElement('div');
    pdfRoot.className = 'rs-pdf-render-root';
    pdfRoot.innerHTML = `
      <style>
        .rs-pdf-render-root{position:fixed;left:-20000px;top:0;width:1123px;background:#fff;color:#202326;font-family:Arial, Helvetica, sans-serif;z-index:-1;}
        .rs-pdf-page{width:1123px;height:794px;background:#fff;position:relative;overflow:hidden;padding:34px 42px;}
        .rs-pdf-header{height:70px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #ff6b00;padding-bottom:16px;}
        .rs-pdf-brand{display:flex;align-items:center;gap:14px;font-weight:900;font-size:30px;}
        .rs-pdf-brand img{width:54px;height:54px;object-fit:contain;}
        .rs-pdf-meta{text-align:right;color:#666;font-size:15px;line-height:1.45;}
        .rs-pdf-title{font-size:25px;font-weight:900;margin:22px 0 12px;}
        .rs-pdf-facade{height:500px;border:2px solid #dfe5eb;border-radius:18px;overflow:hidden;position:relative;background:linear-gradient(160deg,#bdc5cc,#eef1f3);display:flex;align-items:center;justify-content:center;}
        .rs-pdf-facade img.rs-pdf-facade-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
        .rs-pdf-facade.is-night:after{content:'';position:absolute;inset:0;background:rgba(0,0,0,.42);}
        .rs-pdf-facade .rs-pdf-dimensions{position:absolute;inset:65px 50px auto 50px;width:calc(100% - 100px);height:260px;z-index:5;}
        .rs-pdf-facade-sign{position:relative;z-index:4;transform:scale(.82);}
        .rs-pdf-sign{display:flex;align-items:center;justify-content:center;gap:24px;font-weight:900;font-size:82px;line-height:.9;white-space:nowrap;filter:drop-shadow(12px 14px 8px rgba(0,0,0,.28));}
        .rs-pdf-sign-lines{display:flex;flex-direction:column;gap:10px;}
        .rs-pdf-sign-line-2{font-size:64px;}
        .rs-pdf-logo-3d{position:relative;width:118px;height:118px;display:inline-block;flex:0 0 auto;}
        .rs-pdf-logo-object{position:absolute;inset:0;width:118px;height:118px;object-fit:contain;}
        .rs-pdf-logo-depth{opacity:.95;filter:brightness(.62);}
        .rs-pdf-logo-depth-1{transform:translate(4px,4px);}
        .rs-pdf-logo-depth-2{transform:translate(8px,8px);}
        .rs-pdf-logo-depth-3{transform:translate(12px,12px);}
        .rs-pdf-logo-front{position:relative;z-index:3;filter:drop-shadow(6px 8px 7px rgba(0,0,0,.35));}
        .rs-pdf-lighting-front .rs-pdf-logo-front,.rs-pdf-lighting-front_halo .rs-pdf-logo-front{filter:drop-shadow(0 0 10px var(--pdf-face-color)) drop-shadow(0 0 24px var(--pdf-face-color)) drop-shadow(6px 8px 7px rgba(0,0,0,.35));}
        .rs-pdf-lighting-halo .rs-pdf-logo-3d::before,.rs-pdf-lighting-front_halo .rs-pdf-logo-3d::before{content:'';position:absolute;inset:-24%;border-radius:999px;background:radial-gradient(circle,var(--pdf-glow-color) 0%,rgba(255,255,255,0) 66%);filter:blur(14px);z-index:-1;}
        .rs-pdf-logo-circle{display:grid;place-items:center;width:118px;height:118px;border-radius:50%;border:10px solid ${project.faceColor};background:#fff;color:#595d60;box-shadow:1px 1px 0 ${project.sideColor},2px 2px 0 ${project.sideColor},3px 3px 0 ${project.sideColor},4px 4px 0 ${project.sideColor},5px 5px 0 ${project.sideColor},6px 6px 0 ${project.sideColor},10px 13px 10px rgba(0,0,0,.30);font-size:46px;}
        .rs-pdf-watermark{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;opacity:.055;font-size:160px;font-weight:900;color:#ff6b00;transform:rotate(-18deg);z-index:10;}
        .rs-pdf-footer{position:absolute;left:42px;right:42px;bottom:24px;border-top:1px solid #dfe5eb;padding-top:10px;display:flex;justify-content:space-between;color:#666;font-size:13px;}
        .rs-pdf-sketch-wrap{height:400px;border:2px solid #dfe5eb;border-radius:18px;position:relative;display:flex;align-items:center;justify-content:center;margin-top:18px;}
        .rs-pdf-sketch-wrap .rs-pdf-dimensions{position:absolute;inset:22px 55px auto 55px;width:calc(100% - 110px);height:300px;z-index:5;}
        .rs-pdf-sketch-wrap .rs-pdf-sign{font-size:76px;transform:scale(.88);}
        .rs-pdf-table{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px;}
        .rs-pdf-row{border:1px solid #dfe5eb;border-radius:12px;padding:11px 14px;background:#fafbfc;}
        .rs-pdf-row b{display:block;font-size:13px;color:#6b6f72;margin-bottom:4px;}
        .rs-pdf-row span{font-size:17px;font-weight:800;color:#202326;}
        .rs-pdf-note{margin-top:14px;font-size:14px;color:#666;line-height:1.45;}
      </style>
      <section class="rs-pdf-page" id="rs-pdf-page-1">
        <header class="rs-pdf-header">
          <div class="rs-pdf-brand"><img src="/assets/logo-reklamastroy.png" />РекламаСтрой</div>
          <div class="rs-pdf-meta">Визуализация вывески<br/>Дата: ${date}<br/>Проект: ${projectId}</div>
        </header>
        <div class="rs-pdf-title">Визуализация на фасаде</div>
        <div class="rs-pdf-facade ${project.nightMode ? 'is-night' : ''}">
          ${project.facadeDataUrl ? `<img class="rs-pdf-facade-img" src="${project.facadeDataUrl}" />` : ''}
          ${makeDimensionSvg(`${widthMm} мм`, `${capitalHeightMm} мм`)}
          <div class="rs-pdf-facade-sign">${signHtml}</div>
        </div>
        <div class="rs-pdf-note">Размеры на визуализации указаны ориентировочно по данным онлайн-конструктора. Итоговый рабочий чертёж уточняется после проверки фасада и замера объекта.</div>
        <div class="rs-pdf-watermark">РекламаСтрой</div>
        <footer class="rs-pdf-footer"><span>reklamastroy.ru</span><span>© РекламаСтрой. Все права защищены.</span></footer>
      </section>
      <section class="rs-pdf-page" id="rs-pdf-page-2">
        <header class="rs-pdf-header">
          <div class="rs-pdf-brand"><img src="/assets/logo-reklamastroy.png" />РекламаСтрой</div>
          <div class="rs-pdf-meta">Технический макет<br/>Дата: ${date}<br/>Проект: ${projectId}</div>
        </header>
        <div class="rs-pdf-title">Макет вывески с габаритами</div>
        <div class="rs-pdf-sketch-wrap">
          ${makeDimensionSvg(`${widthMm} мм`, `${capitalHeightMm} мм`)}
          ${signHtml}
        </div>
        <div class="rs-pdf-table">
          <div class="rs-pdf-row"><b>Общая длина композиции</b><span>${widthMm} мм</span></div>
          <div class="rs-pdf-row"><b>Общая высота композиции</b><span>${heightMm} мм</span></div>
          <div class="rs-pdf-row"><b>Высота прописной буквы</b><span>${capitalHeightMm} мм</span></div>
          ${hasLowerCase ? `<div class="rs-pdf-row"><b>Высота строчной буквы</b><span>${lowerHeightMm} мм</span></div>` : ''}
          <div class="rs-pdf-row"><b>Лицевая часть</b><span>ORACAL 8500: ${faceColorName}</span></div>
          <div class="rs-pdf-row"><b>Торцы букв</b><span>ORACAL 641: ${sideColorName}</span></div>
          <div class="rs-pdf-row"><b>Шрифт</b><span>${fontLabel}</span></div>
          <div class="rs-pdf-row"><b>Подсветка</b><span>${lightingLabel}</span></div>
        </div>
        <div class="rs-pdf-watermark">РекламаСтрой</div>
        <footer class="rs-pdf-footer"><span>reklamastroy.ru</span><span>Документ сформирован онлайн-конструктором РекламаСтрой</span></footer>
      </section>
    `;

    document.body.appendChild(pdfRoot);

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const page1 = pdfRoot.querySelector('#rs-pdf-page-1') as HTMLElement;
      const page2 = pdfRoot.querySelector('#rs-pdf-page-2') as HTMLElement;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const img1 = await htmlToCanvasImage(page1);
      doc.addImage(img1, 'JPEG', 0, 0, pageWidth, pageHeight);
      doc.addPage();
      const img2 = await htmlToCanvasImage(page2);
      doc.addImage(img2, 'JPEG', 0, 0, pageWidth, pageHeight);
      doc.setProperties({
        title: `Визуализация вывески ${projectId}`,
        subject: 'Технический макет вывески',
        author: 'РекламаСтрой',
        creator: 'РекламаСтрой Designer',
      });
      doc.save(`reklamastroy-${projectId}.pdf`);
    } finally {
      pdfRoot.remove();
    }
  };

  return (
    <aside className="rs-panel">
      <h2>Параметры</h2>

      <label>
        Фото фасада
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*" onChange={onFacadeUpload} />
      </label>

      <div className="rs-tool-grid rs-tool-grid-two">
        <button type="button" onClick={() => project.setCalibrationMode(!project.calibrationMode)} className={project.calibrationMode ? 'is-active' : ''}>2 точки</button>
        <button type="button" onClick={() => project.setRulerMode(!project.rulerMode)} className={project.rulerMode ? 'is-active' : ''}>Линейка</button>
      </div>

      <label>
        Реальный размер между двумя точками, см
        <input type="number" min="1" value={project.scaleCm} onChange={(e) => project.setScaleCm(Number(e.target.value) || 1)} />
      </label>

      <label>
        Текст строки 1
        <input value={project.textLine1} onChange={(e) => project.setTextLine1(e.target.value)} />
      </label>

      <label className="rs-checkbox-row">
        <input type="checkbox" checked={project.twoRows} onChange={(e) => project.setTwoRows(e.target.checked)} />
        <span>Разместить буквы в два ряда</span>
      </label>

      {project.twoRows && (
        <label>
          Текст строки 2
          <input value={project.textLine2} onChange={(e) => project.setTextLine2(e.target.value)} />
        </label>
      )}

      <label>
        Высота прописной буквы, см
        <input type="number" min="10" max="300" value={project.capitalHeightCm} onChange={(e) => project.setCapitalHeightCm(Number(e.target.value) || 1)} />
      </label>

      <label>
        Шрифт вывески
        <select value={project.fontFamily} onChange={(e) => project.setFontFamily(e.target.value)}>
          {fontCategories.map((category) => (
            <optgroup label={category} key={category}>
              {fontOptions.filter((font) => font.category === category).map((font) => (
                <option value={font.family} key={font.label}>{font.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label>
        Лицевая часть ORACAL 8500
        <select value={project.faceColor} onChange={(e) => project.setFaceColor(e.target.value)}>
          {oracal8500.map((c) => <option value={c.hex} key={c.code}>{c.code} — {c.name}</option>)}
        </select>
      </label>

      <label>
        Торцы ORACAL 641
        <select value={project.sideColor} onChange={(e) => project.setSideColor(e.target.value)}>
          {oracal641.map((c) => <option value={c.hex} key={c.code}>{c.code} — {c.name} ({c.finish})</option>)}
        </select>
      </label>

      <div className="rs-field-block">
        <div className="rs-field-title">Подсветка</div>
        <div className="rs-lighting-options">
          {lightingOptions.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`rs-lighting-card ${project.lighting === item.value ? 'is-selected' : ''}`}
              onClick={() => project.setLighting(item.value)}
            >
              <span className={`rs-lighting-preview rs-lighting-preview-${item.value}`} />
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
        <p className="rs-help-text">По умолчанию используется лицевая подсветка. Эффект особенно заметен в режиме «Ночь».</p>
      </div>

      <label>
        Логотип SVG/PNG
        <input type="file" accept=".svg,.png,image/svg+xml,image/png" onChange={onLogoUpload} />
      </label>

      <button className="rs-secondary-button" onClick={() => void downloadPdf()}>Скачать PDF</button>
    </aside>
  );
}
