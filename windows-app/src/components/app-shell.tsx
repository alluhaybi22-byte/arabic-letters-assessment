import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, BookOpen, ChevronLeft, Clock3, Home, Menu, Moon, Settings, Sun, X } from 'lucide-react';
import type { AppSettings } from '@/hooks/use-local-app';

type AppShellProps = { children: ReactNode; settings: AppSettings; onThemeToggle: () => void };

const navItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/practice', label: 'تدريب الحروف', icon: BookOpen },
  { href: '/results', label: 'آخر نتيجة', icon: BarChart3 },
  { href: '/history', label: 'سجل الجلسات', icon: Clock3 },
];

export function AppShell({ children, settings, onThemeToggle }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [location]);

  return (
    <div className="app-shell min-h-[100dvh] text-foreground">
      <aside className={`fixed inset-y-0 right-0 z-40 flex w-[272px] flex-col bg-sidebar text-sidebar-foreground shadow-[0_0_40px_rgba(20,43,66,.14)] transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-label="التنقل الرئيسي">
        <div className="flex items-center justify-between px-6 pb-7 pt-8">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="relative grid h-11 w-11 place-items-center rounded-[14px] bg-sidebar-primary text-xl font-bold text-sidebar-primary-foreground shadow-[inset_0_-3px_0_rgba(0,0,0,.12)]">ا</span>
            <span>
              <span className="block text-[15px] font-bold tracking-tight">مِداد</span>
              <span className="mt-0.5 block text-[11px] text-sidebar-foreground/60">مكتب الحروف العربية</span>
            </span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden" aria-label="إغلاق القائمة" data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="mx-5 mb-6 h-px bg-sidebar-border/70" />
        <nav className="space-y-1 px-3">
          <p className="px-4 pb-2 text-[10px] font-semibold tracking-[.18em] text-sidebar-foreground/45">مساحة التعلّم</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link key={href} href={href} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`} data-testid={`link-nav-${href === '/' ? 'home' : href.slice(1)}`}>
                <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
                <span>{label}</span>
                {active && <ChevronLeft className="mr-auto" size={15} />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-5 pb-5">
          <div className="mb-3 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sidebar-foreground/70">هدف اليوم</span>
              <span className="font-mono text-[11px] text-sidebar-primary">١ / ١</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-border"><div className="h-full w-full rounded-full bg-sidebar-primary" /></div>
            <p className="mt-2 text-[10px] leading-5 text-sidebar-foreground/55">خطوة صغيرة كل يوم تصنع فرقاً كبيراً.</p>
          </div>
          <Link href="/settings" className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] transition-colors ${location === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent'}`} data-testid="link-nav-settings"><Settings size={18} /><span>الإعدادات</span></Link>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" data-testid="button-overlay" />}
      <div className="min-h-[100dvh] lg:mr-[272px]">
        <header className="window-bar sticky top-0 z-20 flex h-[70px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-muted lg:hidden" aria-label="فتح القائمة" data-testid="button-open-menu"><Menu size={21} /></button>
            <div className="hidden text-[11px] text-muted-foreground sm:block">مساحة هادئة للتعلّم اليومي</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">مرحباً بك في مِداد</span>
            <button onClick={onThemeToggle} className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted" aria-label={settings.theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'} data-testid="button-toggle-theme">
              {settings.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary" aria-label="حسابك">م</div>
          </div>
        </header>
        <main className="soft-grid min-h-[calc(100dvh-70px)] px-4 py-7 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}