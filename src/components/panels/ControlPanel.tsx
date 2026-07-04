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

export function ControlPanel() {
  const project = useProjectStore();

  const onLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/svg+xml', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Логотип можно загрузить только в формате SVG или PNG с прозрачным фоном.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => project.setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const line2 = project.twoRows && project.textLine2.trim() ? project.textLine2 : '';
    const widthMm = Math.round((Math.max(project.textLine1.length, line2.length || 0) * project.capitalHeightCm * 0.62) * 10);
    const heightMm = Math.round(project.capitalHeightCm * (project.twoRows ? 2.2 : 1) * 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('РекламаСтрой — технический эскиз вывески', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Общая длина композиции: ${widthMm} мм`, 14, 28);
    doc.text(`Высота прописной буквы: ${project.capitalHeightCm * 10} мм`, 14, 36);
    doc.text(`Общая высота композиции: ${heightMm} мм`, 14, 44);
    doc.text(`Глубина букв: 70 мм (служебный параметр)`, 14, 52);
    doc.text(`Подсветка: ${lightingOptions.find((item) => item.value === project.lighting)?.label}`, 14, 60);

    doc.setTextColor(230, 95, 0);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text(project.textLine1 || 'РекламаСтрой', 70, 95);
    if (line2) doc.text(line2, 70, 125);

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(72);
    doc.text('RS', 230, 105, { angle: 0 });

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text('© РекламаСтрой. Визуализация создана в онлайн-конструкторе.', 14, 195);
    doc.save('reklamastroy-visualization.pdf');
  };

  return (
    <aside className="rs-panel">
      <h2>Параметры</h2>

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
        <input
          type="number"
          min="10"
          max="300"
          value={project.capitalHeightCm}
          onChange={(e) => project.setCapitalHeightCm(Number(e.target.value) || 1)}
        />
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
