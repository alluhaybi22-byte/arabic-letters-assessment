import { Check, CircleAlert, Clock3, FileText, Sparkles } from 'lucide-react';

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="mb-1 text-[11px] font-bold tracking-[.14em] text-primary">{eyebrow}</p>}
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      {description && <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{description}</p>}
    </div>
  );
}

export function ProgressBar({ value, className = '', tone = 'primary' }: { value: number; className?: string; tone?: 'primary' | 'accent' | 'warm' }) {
  return <div className={`h-2 overflow-hidden rounded-full bg-muted ${className}`}><div className={`h-full rounded-full transition-[width] duration-500 ${tone === 'accent' ? 'bg-accent' : tone === 'warm' ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-3xl px-6 py-12 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-primary/10 text-primary"><Sparkles size={26} strokeWidth={1.7} /></div>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ResultPill({ correct }: { correct: boolean }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${correct ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>{correct ? <Check size={12} /> : <CircleAlert size={12} />}{correct ? 'صحيح' : 'للمراجعة'}</span>;
}

export function MetaLine({ duration, date }: { duration: string; date: string }) {
  return <div className="flex items-center gap-3 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 size={13} />{duration}</span><span className="h-1 w-1 rounded-full bg-border" /><span>{date}</span></div>;
}

export function DownloadIcon() {
  return <FileText size={16} />;
}