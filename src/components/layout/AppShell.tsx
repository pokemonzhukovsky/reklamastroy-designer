import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="rs-app">
      <header className="rs-header">
        <div className="rs-brand">
          <img src="/assets/logo-reklamastroy.png" alt="РекламаСтрой" className="rs-logo" />
          <div>
            <div className="rs-brand-title">Реклама<span>Строй</span> Designer</div>
            <div className="rs-brand-subtitle">Онлайн-конструктор объёмных букв</div>
          </div>
        </div>
        <div className="rs-security-badge"><ShieldCheck size={18} /> Водяной знак включён</div>
      </header>
      {children}
    </div>
  );
}
