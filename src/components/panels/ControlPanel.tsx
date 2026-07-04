import { ChangeEvent } from 'react';
import { jsPDF } from 'jspdf';
import { oracal641, oracal8500 } from '../../data/oracal';
import { useProjectStore } from '../../store/projectStore';

const lightingOptions = [
  { value: 'none', label: 'Без подсветки' },
  { value: 'front', label: 'Лицевая' },
  { value: 'halo', label: 'Контражур' },
  { value: 'front_halo', label: 'Лицевая + контражур' },
] as const;

function readImageFile(file: File, onDone: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
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

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const line2 = project.twoRows && project.textLine2.trim() ? project.textLine2 : '';
    const widthMm = Math.round((Math.max(project.textLine1.length, line2.length || 0) * project.capitalHeightCm * 0.62) * 10);
    const heightMm = Math.round(project.capitalHeightCm * (project.twoRows ? 2.2 : 1) * 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ReklamaStroy — technical sign sketch', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total composition length: ${widthMm} mm`, 14, 30);
    doc.text(`Capital letter height: ${project.capitalHeightCm * 10} mm`, 14, 38);
    doc.text(`Total composition height: ${heightMm} mm`, 14, 46);
    doc.text('Letter depth: 70 mm', 14, 54);
    doc.text(`Lighting: ${lightingOptions.find((item) => item.value === project.lighting)?.label ?? ''}`, 14, 62);

    doc.setTextColor(230, 95, 0);
    doc.setFontSize(46);
    doc.setFont('helvetica', 'bold');
    doc.text(project.textLine1 || 'ReklamaStroy', 70, 102);
    if (line2) doc.text(line2, 70, 132);

    doc.setTextColor(210, 210, 210);
    doc.setFontSize(74);
    doc.text('RS', 230, 110);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text('© ReklamaStroy. Visualization created in the online constructor.', 14, 195);
    doc.save('reklamastroy-visualization.pdf');
  };

  return (
    <aside className="rs-panel">
      <h2>Параметры</h2>

      <label>
        Фото фасада
        <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*" onChange={onFacadeUpload} />
      </label>

      <div className="rs-tool-grid">
        <button type="button" onClick={() => project.setCalibrationMode(!project.calibrationMode)} className={project.calibrationMode ? 'is-active' : ''}>2 точки</button>
        <button type="button" onClick={() => project.setRulerMode(!project.rulerMode)} className={project.rulerMode ? 'is-active' : ''}>Линейка</button>
        <button type="button" onClick={() => project.setWallMode(!project.wallMode)} className={project.wallMode ? 'is-active' : ''}>Плоскость</button>
      </div>

      <label>
        Известный размер между точками, см
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
        Лицевая часть ORACAL 8500
        <select value={project.faceColor} onChange={(e) => project.setFaceColor(e.target.value)}>
          {oracal8500.map((c) => <option value={c.hex} key={c.code}>{c.code} — {c.name}</option>)}
        </select>
      </label>

      <label>
        Торцы ORACAL 641
        <select value={project.sideColor} onChange={(e) => project.setSideColor(e.target.value)}>
          {oracal641.map((c) => <option value={c.hex} key={c.code}>{c.code} — {c.name}</option>)}
        </select>
      </label>

      <label className="rs-checkbox-row">
        <input type="checkbox" checked={project.frameEnabled} onChange={(e) => project.setFrameEnabled(e.target.checked)} />
        <span>Показать две направляющие</span>
      </label>

      <label>
        Рама ORACAL 641
        <select value={project.frameColor} onChange={(e) => project.setFrameColor(e.target.value)}>
          {oracal641.map((c) => <option value={c.hex} key={c.code}>{c.code} — {c.name}</option>)}
        </select>
      </label>

      <label>
        Подсветка
        <select value={project.lighting} onChange={(e) => project.setLighting(e.target.value as typeof lightingOptions[number]['value'])}>
          {lightingOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
      </label>

      <label>
        Логотип SVG/PNG
        <input type="file" accept=".svg,.png,image/svg+xml,image/png" onChange={onLogoUpload} />
      </label>

      <button className="rs-secondary-button" onClick={downloadPdf}>Скачать PDF</button>
    </aside>
  );
}
