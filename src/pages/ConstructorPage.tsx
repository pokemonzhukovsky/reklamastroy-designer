import { useEffect } from 'react';
import { Upload, Ruler, Type, Palette, Moon, Download, Save } from 'lucide-react';
import { CanvasStage } from '../components/canvas/CanvasStage';
import { ControlPanel } from '../components/panels/ControlPanel';
import { useProjectStore } from '../store/projectStore';

const steps = [
  { icon: Upload, title: 'Фасад', text: 'JPG, PNG, WEBP, HEIC/HEIF' },
  { icon: Ruler, title: 'Масштаб', text: 'Две точки и реальный размер' },
  { icon: Type, title: 'Буквы', text: '1–2 строки, любой регистр' },
  { icon: Palette, title: 'ORACAL', text: '8500 лицевая часть, 641 торцы' },
  { icon: Moon, title: 'День/ночь', text: 'Свечение по цвету плёнки' },
  { icon: Download, title: 'PDF', text: 'Макет со стрелками и водяным знаком' },
  { icon: Save, title: 'Автосохранение', text: 'Проект сохраняется в браузере' },
];


function AutoSaveController() {
  const facadeDataUrl = useProjectStore((state) => state.facadeDataUrl);
  const textLine1 = useProjectStore((state) => state.textLine1);
  const textLine2 = useProjectStore((state) => state.textLine2);
  const twoRows = useProjectStore((state) => state.twoRows);
  const capitalHeightCm = useProjectStore((state) => state.capitalHeightCm);
  const fontFamily = useProjectStore((state) => state.fontFamily);
  const faceColor = useProjectStore((state) => state.faceColor);
  const sideColor = useProjectStore((state) => state.sideColor);
  const lighting = useProjectStore((state) => state.lighting);
  const nightMode = useProjectStore((state) => state.nightMode);
  const logoDataUrl = useProjectStore((state) => state.logoDataUrl);
  const scaleCm = useProjectStore((state) => state.scaleCm);
  const calibrationPoints = useProjectStore((state) => state.calibrationPoints);
  const setAutosavedAt = useProjectStore((state) => state.setAutosavedAt);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutosavedAt(new Date().toISOString());
    }, 600);
    return () => window.clearTimeout(timer);
  }, [
    facadeDataUrl,
    textLine1,
    textLine2,
    twoRows,
    capitalHeightCm,
    fontFamily,
    faceColor,
    sideColor,
    lighting,
    nightMode,
    logoDataUrl,
    scaleCm,
    calibrationPoints,
    setAutosavedAt,
  ]);

  return null;
}

export function ConstructorPage() {
  return (
    <main className="rs-main">
      <AutoSaveController />
      <section className="rs-hero">
        <div>
          <h1>Онлайн примерка вывески<br />с привязкой к фасаду здания</h1>
        </div>
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
