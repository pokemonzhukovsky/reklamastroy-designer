import { Upload, Ruler, Type, Palette, Moon, Download } from 'lucide-react';
import { CanvasStage } from '../components/canvas/CanvasStage';
import { ControlPanel } from '../components/panels/ControlPanel';

const steps = [
  { icon: Upload, title: 'Фасад', text: 'JPG, PNG, WEBP, HEIC/HEIF' },
  { icon: Ruler, title: 'Масштаб', text: 'Две точки и реальный размер' },
  { icon: Type, title: 'Буквы', text: '1–2 строки, любой регистр' },
  { icon: Palette, title: 'ORACAL', text: '8500 лицо, 641 торцы и рама' },
  { icon: Moon, title: 'День/ночь', text: 'Свечение по цвету плёнки' },
  { icon: Download, title: 'PDF', text: 'Макет со стрелками и водяным знаком' },
];

export function ConstructorPage() {
  return (
    <main className="rs-main">
      <section className="rs-hero">
        <div>
          <h1>Конструктор визуализации вывески</h1>
          <p>Foundation v1.0: базовая архитектура проекта готова. Следующим этапом подключаем рабочий Canvas и реальные модули.</p>
        </div>
        <button className="rs-primary-button">Начать визуализацию</button>
      </section>

      <section className="rs-workspace">
        <ControlPanel />
        <CanvasStage />
      </section>

      <section className="rs-steps">
        {steps.map((step) => (
          <article className="rs-step" key={step.title}>
            <step.icon size={24} />
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
