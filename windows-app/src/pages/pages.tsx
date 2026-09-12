import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Award, BarChart3, Check, ChevronDown, CircleHelp, Download, History as HistoryIcon, Keyboard, Mic, Pause, Play, RotateCcw, Settings as SettingsIcon, ShieldCheck, Trash2, Volume2, X } from 'lucide-react';
import { ARABIC_LETTERS, formatDate, formatTime, isArabicAnswerCorrect } from '@/lib/arabic';
import type { AssessmentAnswer, AssessmentResult } from '@/lib/types';
import type { AppSettings } from '@/hooks/use-local-app';
import { EmptyState, MetaLine, ProgressBar, ResultPill, SectionHeading } from '@/components/ui-kit';

type PageProps = { results: AssessmentResult[]; saveResult: (result: AssessmentResult) => void; settings: AppSettings; updateSettings: (patch: Partial<AppSettings>) => void; resetData: () => void };

const Button = ({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' | 'danger' }) => (
  <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${variant === 'primary' ? 'bg-primary text-primary-foreground shadow-[0_6px_15px_hsl(var(--primary)/.2)] hover:-translate-y-0.5 hover:shadow-[0_9px_18px_hsl(var(--primary)/.26)]' : variant === 'soft' ? 'bg-primary/10 text-primary hover:bg-primary/15' : variant === 'danger' ? 'bg-destructive/10 text-destructive hover:bg-destructive/15' : 'border border-border bg-card text-muted-foreground hover:bg-muted'} ${className}`} {...props}>{children}</button>
);

function durationOf(result: AssessmentResult) {
  const seconds = Math.max(1, Math.round((new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000));
  return `${Math.floor(seconds / 60) ? `${Math.floor(seconds / 60)} د ` : ''}${seconds % 60} ث`;
}

function mastery(results: AssessmentResult[]) {
  const stats = new Map<string, { correct: number; total: number }>();
  results.flatMap((result) => result.answers).forEach((answer) => {
    const current = stats.get(answer.letter) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    stats.set(answer.letter, current);
  });
  return stats;
}

export function Dashboard({ results }: Pick<PageProps, 'results'>) {
  const latest = results[0];
  const stats = mastery(results);
  const mastered = ARABIC_LETTERS.filter((letter) => (stats.get(letter.letter)?.correct ?? 0) > 0 && (stats.get(letter.letter)?.correct ?? 0) / (stats.get(letter.letter)?.total ?? 1) >= .8).length;
  const days = new Set(results.map((result) => new Date(result.completedAt).toDateString())).size;
  return (
    <div className="mx-auto max-w-[1240px] motion-safe:rise">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-semibold text-primary">الخميس، مساحة التعلّم جاهزة</p><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">أهلاً بك في <span className="text-primary">مِداد</span></h1><p className="mt-2 text-sm text-muted-foreground">لنأخذ اليوم حرفاً واحداً في كل مرة.</p></div>
        <Link href="/practice" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-[0_8px_18px_hsl(var(--primary)/.22)] transition-transform hover:-translate-y-0.5" data-testid="link-quick-start"><Play size={15} fill="currentColor" />ابدأ تدريباً سريعاً</Link>
      </div>
      <section className="mb-6 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-sidebar p-6 text-sidebar-foreground shadow-[0_14px_30px_rgba(19,47,72,.16)] sm:p-7">
          <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full border-[18px] border-sidebar-primary/10" /><div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full border-[30px] border-sidebar-primary/5" />
          <div className="relative"><div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] text-sidebar-foreground/60">تقدمك الكلي</p><p className="mt-1 text-3xl font-extrabold">{latest ? `${latest.score}%` : '—'}</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-sidebar-primary/15 text-sidebar-primary"><Award size={24} /></div></div><ProgressBar value={latest?.score ?? 0} className="bg-sidebar-border" tone="accent" /><p className="mt-3 text-[11px] text-sidebar-foreground/65">{latest ? `نتيجة آخر جلسة • ${latest.correctCount} من ${latest.totalCount} إجابات موفقة` : 'أكمل تدريبك الأول لترى تقدمك هنا'}</p></div>
        </div>
        <div className="glass-panel rounded-3xl p-6"><div className="mb-5 flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground">أيام التعلّم</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600"><BarChart3 size={17} /></span></div><p className="text-3xl font-extrabold">{days || '—'}</p><p className="mt-2 text-[11px] text-muted-foreground">أيام نشطة حتى الآن</p></div>
        <div className="glass-panel rounded-3xl p-6"><div className="mb-5 flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground">حروف متقنة</p><span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent"><Check size={17} /></span></div><p className="text-3xl font-extrabold">{mastered}<span className="text-sm font-medium text-muted-foreground"> / ٢٨</span></p><p className="mt-2 text-[11px] text-muted-foreground">تستحق مراجعة لطيفة كل فترة</p></div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div className="glass-panel rounded-3xl p-6 sm:p-7">
          <SectionHeading eyebrow="خريطة الحروف" title="كيف تسير رحلتك؟" description="كل لون يروي جزءاً من قصة التعلّم." />
          <div className="grid grid-cols-7 gap-2 sm:gap-3">{ARABIC_LETTERS.map((letter) => { const item = stats.get(letter.letter); const ratio = item ? item.correct / item.total : 0; return <div key={letter.letter} className={`group relative grid aspect-square place-items-center rounded-xl border text-base font-bold transition-transform hover:-translate-y-1 ${ratio >= .8 ? 'border-accent/20 bg-accent/10 text-accent' : ratio > 0 ? 'border-amber-400/25 bg-amber-400/10 text-amber-700 dark:text-amber-300' : 'border-border/80 bg-muted/60 text-muted-foreground'}`} title={`${letter.name}: ${ratio ? `${Math.round(ratio * 100)}%` : 'لم يبدأ بعد'}`} data-testid={`mastery-letter-${letter.letter}`}>{letter.letter}<span className="absolute -bottom-1 h-1 w-1 rounded-full bg-current opacity-50" /></div>; })}</div>
          <div className="mt-5 flex flex-wrap gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent" />متقن</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" />قيد التثبيت</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-muted-foreground/40" />لم يبدأ</span></div>
        </div>
        <div className="glass-panel rounded-3xl p-6 sm:p-7"><div className="mb-5 flex items-center justify-between"><SectionHeading eyebrow="آخر الجلسات" title="مساحتك الأخيرة" /><Link href="/history" className="text-[11px] font-bold text-primary hover:underline" data-testid="link-view-history">عرض السجل</Link></div>{results.length ? <div className="space-y-3">{results.slice(0, 3).map((result) => <Link href="/results" key={result.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-3.5 transition-colors hover:bg-muted" data-testid={`card-session-${result.id}`}><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-extrabold ${result.score >= 80 ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-600'}`}>{result.score}</span><div><p className="text-xs font-bold">تدريب الحروف</p><p className="mt-1 text-[10px] text-muted-foreground">{formatDate(result.completedAt)}</p></div></div><ArrowLeft size={14} className="text-muted-foreground" /></Link>)}</div> : <div className="flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center"><p className="text-xs font-bold">لا توجد جلسات بعد</p><p className="mt-1 text-[10px] text-muted-foreground">ابدأ أول تدريب، وسنحتفظ بالخطوات هنا.</p></div>}</div>
      </section>
    </div>
  );
}

type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type RecognitionWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function Practice({ saveResult }: Pick<PageProps, 'saveResult'>) {
  const [, setLocation] = useLocation();
  const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const weakParam = query.get('weak');
  const practiceLetters = useMemo(() => weakParam ? ARABIC_LETTERS.filter((letter) => weakParam.includes(letter.letter)) : ARABIC_LETTERS, [weakParam]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'skipped' | null>(null);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [listening, setListening] = useState(false);
  const startedAt = useRef(new Date().toISOString());
  const recognition = useRef<Recognition | null>(null);
  const current = practiceLetters[index];
  const supported = typeof window !== 'undefined' && Boolean((window as RecognitionWindow).SpeechRecognition || (window as RecognitionWindow).webkitSpeechRecognition);

  useEffect(() => () => { recognition.current?.stop(); }, []);

  function recordAnswer(answerText: string, matchType: AssessmentAnswer['matchType']) {
    if (!current || feedback) return;
    const isCorrect = matchType !== 'skipped' && isArabicAnswerCorrect(answerText, current);
    setInput(answerText);
    setFeedback(matchType === 'skipped' ? 'skipped' : isCorrect ? 'correct' : 'wrong');
    setAnswers((old) => [...old, { letter: current.letter, letterName: current.name, userAnswer: answerText, isCorrect, confidence: matchType === 'speech' ? .9 : .98, matchType, answeredAt: new Date().toISOString() }]);
  }
  function startListening() {
    if (!supported || listening) return;
    const RecognitionClass = (window as RecognitionWindow).SpeechRecognition || (window as RecognitionWindow).webkitSpeechRecognition;
    if (!RecognitionClass) return;
    const instance = new RecognitionClass();
    instance.lang = 'ar-SA'; instance.continuous = false; instance.interimResults = false;
    instance.onresult = (event) => { const transcript = event.results[0]?.[0]?.transcript ?? ''; recordAnswer(transcript, 'speech'); setListening(false); };
    instance.onend = () => setListening(false); instance.onerror = () => setListening(false);
    recognition.current = instance; setListening(true); instance.start();
  }
  function finish(nextAnswers: AssessmentAnswer[]) {
    const correctCount = nextAnswers.filter((answer) => answer.isCorrect).length;
    const result: AssessmentResult = { id: `session-${Date.now()}`, startedAt: startedAt.current, completedAt: new Date().toISOString(), score: Math.round((correctCount / practiceLetters.length) * 100), correctCount, totalCount: practiceLetters.length, answers: nextAnswers };
    saveResult(result); setLocation('/results');
  }
  function next() {
    if (!feedback) return;
    if (index === practiceLetters.length - 1) { finish(answers); return; }
    setIndex((value) => value + 1); setInput(''); setFeedback(null);
  }
  function submit(event: FormEvent) { event.preventDefault(); if (input.trim()) recordAnswer(input.trim(), 'typed'); }
  if (!current) return null;
  const progress = index / practiceLetters.length * 100;
  return (
    <div className="mx-auto max-w-[960px] motion-safe:rise">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="mb-2 text-[11px] font-bold tracking-[.14em] text-primary">تدريب موجّه {weakParam ? '• الحروف التي تحتاج مراجعة' : ''}</p><h1 className="text-2xl font-extrabold tracking-tight">صوت الحرف، بهدوء</h1><p className="mt-2 text-xs text-muted-foreground">انطق اسم الحرف أو اكتبه. لا توجد إجابة خاطئة، هناك محاولة جديدة.</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-[11px] font-bold text-muted-foreground">{index + 1} / {practiceLetters.length}</span></div>
      <div className="mb-6 flex items-center gap-3"><ProgressBar value={progress} className="flex-1" /><span className="w-10 text-left font-mono text-[11px] text-muted-foreground">{Math.round(progress)}٪</span></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-panel relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-center"><div className="absolute -left-14 -top-14 h-36 w-36 rounded-full border-[16px] border-primary/5" /><p className="relative mb-5 text-[11px] font-bold text-muted-foreground">ما اسم هذا الحرف؟</p><div className="relative grid h-44 w-44 place-items-center rounded-[42px] border border-primary/15 bg-primary/5 shadow-[inset_0_0_0_12px_hsl(var(--primary)/.025)]"><span className="letter-glyph text-[104px] leading-none text-primary">{current.letter}</span></div><p className="mt-7 text-sm font-bold">{current.name}</p><p className="mt-1 text-[11px] text-muted-foreground">الحرف رقم {index + 1} من الحروف العربية</p></div>
        <div className="glass-panel rounded-3xl p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-bold">اختر طريقتك</p><p className="mt-1 text-[11px] text-muted-foreground">الكتابة هي الخيار الأساسي دائماً.</p></div><Keyboard size={21} className="text-primary" /></div><form onSubmit={submit}><label className="mb-2 block text-[11px] font-bold text-muted-foreground" htmlFor="answer-input">اكتب اسم الحرف بالعربية</label><div className="relative"><input id="answer-input" autoFocus value={input} onChange={(event) => setInput(event.target.value)} disabled={Boolean(feedback)} placeholder="مثال: باء" className="h-14 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-answer" /><button type="submit" disabled={!input.trim() || Boolean(feedback)} className="absolute left-2 top-2 grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30" aria-label="إرسال الإجابة" data-testid="button-submit-answer"><ArrowLeft size={17} /></button></div></form><div className="my-5 flex items-center gap-3 text-[10px] text-muted-foreground"><span className="h-px flex-1 bg-border" />أو<span className="h-px flex-1 bg-border" /></div><Button variant="soft" className="w-full" onClick={startListening} disabled={!supported || listening || Boolean(feedback)} data-testid="button-speech">{listening ? <><span className="h-2 w-2 animate-pulse rounded-full bg-current" />جاري الاستماع...</> : <><Mic size={16} />{supported ? 'أجب بصوتك' : 'الإجابة الصوتية غير متاحة هنا'}</>}</Button>{!supported && <p className="mt-2 text-center text-[10px] text-muted-foreground">يمكنك الكتابة في الحقل أعلاه في جميع المتصفحات.</p>}{feedback && <div className={`mt-6 rounded-2xl border p-4 ${feedback === 'correct' ? 'border-accent/20 bg-accent/8' : feedback === 'wrong' ? 'border-destructive/20 bg-destructive/8' : 'border-amber-400/25 bg-amber-400/10'}`}><div className="flex items-start gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${feedback === 'correct' ? 'bg-accent text-white' : feedback === 'wrong' ? 'bg-destructive text-white' : 'bg-amber-500 text-white'}`}>{feedback === 'correct' ? <Check size={16} /> : feedback === 'wrong' ? <X size={16} /> : <Pause size={15} />}</span><div><p className="text-xs font-bold">{feedback === 'correct' ? 'أحسنت، هذه إجابة صحيحة.' : feedback === 'wrong' ? `قريب جداً. الإجابة هي «${current.name}».` : 'سنعود إلى هذا الحرف في مراجعة قادمة.'}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{feedback === 'correct' ? 'استمر على هذا الإيقاع الهادئ.' : 'خذ نفساً وحاول الحرف التالي عندما تكون جاهزاً.'}</p></div></div></div>}<div className="mt-6 flex items-center justify-between gap-3"><Button variant="ghost" onClick={() => recordAnswer('', 'skipped')} disabled={Boolean(feedback)} data-testid="button-skip">تخطي الآن</Button>{feedback && <Button onClick={next} data-testid="button-next">{index === practiceLetters.length - 1 ? 'عرض النتيجة' : 'الحرف التالي'}<ArrowLeft size={15} /></Button>}</div></div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground"><CircleHelp size={13} />يمكنك استخدام مفتاح Enter لإرسال الإجابة المكتوبة.</div>
    </div>
  );
}

export function Results({ results }: Pick<PageProps, 'results'>) {
  const latest = results[0];
  const [, setLocation] = useLocation();
  const weak = latest?.answers.filter((answer) => !answer.isCorrect) ?? [];
  function download() { if (!latest) return; const blob = new Blob([JSON.stringify(latest, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `medad-session-${latest.id}.json`; anchor.click(); URL.revokeObjectURL(url); }
  if (!latest) return <div className="mx-auto max-w-[760px]"><EmptyState title="نتيجتك الأولى بانتظارك" description="أكمل تدريباً قصيراً من ٢٨ حرفاً، وستظهر هنا خريطة واضحة لما أتقنته وما يستحق مراجعة." action={<Link href="/practice" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground" data-testid="link-results-start">ابدأ التدريب <ArrowLeft size={15} /></Link>} /></div>;
  const perLetter = latest.answers;
  return <div className="mx-auto max-w-[1050px] motion-safe:rise"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold tracking-[.14em] text-primary">ملخص الجلسة</p><h1 className="text-2xl font-extrabold tracking-tight">خطوة جميلة إلى الأمام</h1><p className="mt-2 text-xs text-muted-foreground">{formatDate(latest.completedAt)} • {formatTime(latest.completedAt)}</p></div><div className="flex gap-2"><Button variant="ghost" onClick={download} data-testid="button-download-report"><Download size={15} />تنزيل التقرير</Button><Button onClick={() => setLocation('/practice')} data-testid="button-retry-all"><RotateCcw size={15} />تدريب جديد</Button></div></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="glass-panel rounded-3xl p-5"><p className="text-[11px] text-muted-foreground">النتيجة الكلية</p><p className="mt-2 text-4xl font-extrabold text-primary">{latest.score}<span className="text-base">٪</span></p><ProgressBar value={latest.score} className="mt-4" /></div><div className="glass-panel rounded-3xl p-5"><p className="text-[11px] text-muted-foreground">إجابات صحيحة</p><p className="mt-2 text-4xl font-extrabold text-accent">{latest.correctCount}<span className="text-base text-muted-foreground"> / {latest.totalCount}</span></p><p className="mt-3 text-[10px] text-muted-foreground">كل محاولة تبني ثقة جديدة</p></div><div className="glass-panel rounded-3xl p-5"><p className="text-[11px] text-muted-foreground">مدة الجلسة</p><p className="mt-2 text-4xl font-extrabold">{durationOf(latest)}</p><p className="mt-3 text-[10px] text-muted-foreground">إيقاع مناسب للتعلم</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><div className="glass-panel rounded-3xl p-6"><SectionHeading title="تفصيل الحروف" description="نظرة سريعة على كل محاولة في هذه الجلسة." /><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{perLetter.map((answer, index) => <div key={`${answer.letter}-${index}`} className={`flex items-center justify-between rounded-xl border p-3 ${answer.isCorrect ? 'border-accent/15 bg-accent/5' : 'border-destructive/15 bg-destructive/5'}`} data-testid={`result-letter-${index}`}><div><p className="letter-glyph text-xl">{answer.letter}</p><p className="mt-1 text-[9px] text-muted-foreground">{answer.letterName}</p></div><ResultPill correct={answer.isCorrect} /></div>)}</div></div><div className="glass-panel h-fit rounded-3xl p-6"><SectionHeading title="حروف نعود إليها" description={weak.length ? 'هذه الحروف تستحق جولة قصيرة إضافية.' : 'رائع، لم تترك أي حرف خلفك.'} />{weak.length ? <><div className="mb-5 space-y-2">{weak.slice(0, 6).map((answer, index) => <div key={`${answer.letter}-${index}`} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5"><span className="letter-glyph text-xl">{answer.letter}</span><span className="text-[11px] text-muted-foreground">{answer.letterName}</span></div>)}</div><Button onClick={() => setLocation(`/practice?weak=${weak.map((answer) => answer.letter).join('')}`)} className="w-full" data-testid="button-retry-weak"><RotateCcw size={15} />تدريب الحروف الضعيفة</Button></> : <div className="rounded-2xl bg-accent/8 p-5 text-center"><ShieldCheck className="mx-auto text-accent" size={28} /><p className="mt-3 text-xs font-bold">توازن رائع</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">كل حروف هذه الجولة وصلت بسلام.</p></div>}</div></div>
  </div>;
}

export function History({ results }: Pick<PageProps, 'results'>) {
  const [selectedId, setSelectedId] = useState(results[0]?.id);
  const selected = results.find((result) => result.id === selectedId);
  if (!results.length) return <div className="mx-auto max-w-[760px]"><EmptyState title="سجلّك لم يبدأ بعد" description="كل جلسة تكملها تُحفظ على هذا الجهاز فقط، لتستطيع أنت أو معلمك متابعة التقدم بهدوء." action={<Link href="/practice" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground" data-testid="link-history-start">ابدأ أول جلسة <ArrowLeft size={15} /></Link>} /></div>;
  return <div className="mx-auto max-w-[1100px] motion-safe:rise"><div className="mb-7"><p className="mb-2 text-[11px] font-bold tracking-[.14em] text-primary">ذاكرة التعلّم</p><h1 className="text-2xl font-extrabold tracking-tight">سجل الجلسات</h1><p className="mt-2 text-xs text-muted-foreground">تقدمك محفوظ محلياً على هذا الجهاز.</p></div><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="space-y-3">{results.map((result, index) => <button key={result.id} onClick={() => setSelectedId(result.id)} className={`w-full rounded-2xl border p-4 text-right transition-all ${selectedId === result.id ? 'border-primary/35 bg-primary/5 shadow-sm' : 'border-border/70 bg-card hover:bg-muted'}`} data-testid={`button-history-${result.id}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-extrabold ${result.score >= 80 ? 'bg-accent/10 text-accent' : 'bg-amber-500/10 text-amber-600'}`}>{result.score}٪</span><div><p className="text-xs font-bold">جلسة {results.length - index}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatDate(result.completedAt)} • {formatTime(result.completedAt)}</p></div></div><ArrowLeft size={15} className="text-muted-foreground" /></div></button>)}</div>{selected && <div className="glass-panel rounded-3xl p-6 sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-[11px] text-muted-foreground">تفاصيل الجلسة</p><h2 className="mt-1 text-lg font-bold">{formatDate(selected.completedAt)}</h2></div><span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">{selected.score}٪</span></div><div className="mb-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted/60 p-4"><p className="text-[10px] text-muted-foreground">الإجابات الصحيحة</p><p className="mt-1 text-xl font-extrabold">{selected.correctCount} / {selected.totalCount}</p></div><div className="rounded-2xl bg-muted/60 p-4"><p className="text-[10px] text-muted-foreground">المدة</p><p className="mt-1 text-xl font-extrabold">{durationOf(selected)}</p></div></div><p className="mb-3 text-xs font-bold">الخطوات بالتفصيل</p><div className="max-h-[370px] space-y-2 overflow-auto">{selected.answers.map((answer, index) => <div key={`${answer.letter}-${index}`} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5"><div className="flex items-center gap-3"><span className="letter-glyph text-xl">{answer.letter}</span><span className="text-[11px] text-muted-foreground">{answer.letterName}</span></div><ResultPill correct={answer.isCorrect} /></div>)}</div></div>}</div></div>;
}

export function SettingsPage({ settings, updateSettings, resetData }: Pick<PageProps, 'settings' | 'updateSettings' | 'resetData'>) {
  const [confirm, setConfirm] = useState(false);
  return <div className="mx-auto max-w-[820px] motion-safe:rise"><div className="mb-7"><p className="mb-2 text-[11px] font-bold tracking-[.14em] text-primary">مساحتك الخاصة</p><h1 className="text-2xl font-extrabold tracking-tight">الإعدادات</h1><p className="mt-2 text-xs text-muted-foreground">اجعل مِداد مناسباً لطريقتك في التعلّم.</p></div><div className="space-y-5"><section className="glass-panel rounded-3xl p-6 sm:p-7"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><SettingsIcon size={19} /></span><div><h2 className="text-sm font-bold">المظهر</h2><p className="mt-1 text-[10px] text-muted-foreground">اختر الألوان المريحة لعينيك.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => updateSettings({ theme: 'light' })} className={`flex items-center justify-between rounded-2xl border p-4 text-right ${settings.theme === 'light' ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted'}`} data-testid="button-theme-light"><div><p className="text-xs font-bold">الوضع الفاتح</p><p className="mt-1 text-[10px] text-muted-foreground">ألوان النهار الهادئة</p></div><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-600"><SunIcon /></span></button><button onClick={() => updateSettings({ theme: 'dark' })} className={`flex items-center justify-between rounded-2xl border p-4 text-right ${settings.theme === 'dark' ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted'}`} data-testid="button-theme-dark"><div><p className="text-xs font-bold">الوضع الداكن</p><p className="mt-1 text-[10px] text-muted-foreground">تركيز لطيف في المساء</p></div><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-slate-200"><MoonIcon /></span></button></div></section><section className="glass-panel rounded-3xl p-6 sm:p-7"><div className="flex items-center justify-between gap-5"><div><h2 className="text-sm font-bold">تقليل الحركة</h2><p className="mt-1 text-[10px] leading-5 text-muted-foreground">يوقف الانتقالات والظهور المتدرج لمن يفضّل واجهة أكثر ثباتاً.</p></div><button role="switch" aria-checked={settings.reducedMotion} onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${settings.reducedMotion ? 'bg-primary' : 'bg-muted-foreground/25'}`} data-testid="switch-reduced-motion"><span className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-sm transition-[right] ${settings.reducedMotion ? 'right-1' : 'right-6'}`} /></button></div></section><section className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 sm:p-7"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive"><Trash2 size={18} /></span><div className="flex-1"><h2 className="text-sm font-bold">مسح بيانات التعلّم</h2><p className="mt-1 text-[10px] leading-5 text-muted-foreground">يحذف الجلسات والنتائج المحفوظة على هذا الجهاز. لا يمكن التراجع عن هذه الخطوة.</p>{confirm ? <div className="mt-4 flex flex-wrap gap-2"><Button variant="danger" onClick={() => { resetData(); setConfirm(false); }} data-testid="button-confirm-reset">نعم، امسح البيانات</Button><Button variant="ghost" onClick={() => setConfirm(false)} data-testid="button-cancel-reset">إلغاء</Button></div> : <Button variant="danger" className="mt-4" onClick={() => setConfirm(true)} data-testid="button-reset-data">مسح البيانات المحلية</Button>}</div></div></section></div></div>;
}

function SunIcon() { return <span className="block h-3.5 w-3.5 rounded-full bg-amber-500" />; }
function MoonIcon() { return <span className="block h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-l-transparent" />; }