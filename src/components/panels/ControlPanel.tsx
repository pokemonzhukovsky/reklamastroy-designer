import { oracal641, oracal8500 } from '../../data/oracal';

export function ControlPanel() {
  return (
    <aside className="rs-panel">
      <h2>Параметры</h2>
      <label>Текст вывески<input defaultValue="РекламаСтрой" /></label>
      <label>Высота прописной буквы, см<input type="number" defaultValue={40} /></label>
      <label>Лицевая часть ORACAL 8500<select>{oracal8500.map((c) => <option key={c.code}>{c.code} — {c.name}</option>)}</select></label>
      <label>Торцы ORACAL 641<select>{oracal641.map((c) => <option key={c.code}>{c.code} — {c.name}</option>)}</select></label>
      <label>Рама ORACAL 641<select>{oracal641.map((c) => <option key={c.code}>{c.code} — {c.name}</option>)}</select></label>
      <button className="rs-secondary-button">Скачать PDF</button>
    </aside>
  );
}
