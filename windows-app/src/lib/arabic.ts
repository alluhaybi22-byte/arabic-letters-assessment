export type ArabicLetter = { letter: string; name: string; alternatives: string[] };

export const ARABIC_LETTERS: ArabicLetter[] = [
  { letter: 'ا', name: 'ألف', alternatives: ['ألف', 'الف', 'ا'] },
  { letter: 'ب', name: 'باء', alternatives: ['باء', 'با', 'ب'] },
  { letter: 'ت', name: 'تاء', alternatives: ['تاء', 'تا', 'ت'] },
  { letter: 'ث', name: 'ثاء', alternatives: ['ثاء', 'ثا', 'ث'] },
  { letter: 'ج', name: 'جيم', alternatives: ['جيم', 'جيم', 'ج'] },
  { letter: 'ح', name: 'حاء', alternatives: ['حاء', 'حا', 'ح'] },
  { letter: 'خ', name: 'خاء', alternatives: ['خاء', 'خا', 'خ'] },
  { letter: 'د', name: 'دال', alternatives: ['دال', 'دال', 'د'] },
  { letter: 'ذ', name: 'ذال', alternatives: ['ذال', 'ذال', 'ذ'] },
  { letter: 'ر', name: 'راء', alternatives: ['راء', 'را', 'ر'] },
  { letter: 'ز', name: 'زاي', alternatives: ['زاي', 'زاي', 'ز'] },
  { letter: 'س', name: 'سين', alternatives: ['سين', 'سين', 'س'] },
  { letter: 'ش', name: 'شين', alternatives: ['شين', 'شين', 'ش'] },
  { letter: 'ص', name: 'صاد', alternatives: ['صاد', 'صاد', 'ص'] },
  { letter: 'ض', name: 'ضاد', alternatives: ['ضاد', 'ضاد', 'ض'] },
  { letter: 'ط', name: 'طاء', alternatives: ['طاء', 'طا', 'ط'] },
  { letter: 'ظ', name: 'ظاء', alternatives: ['ظاء', 'ظا', 'ظ'] },
  { letter: 'ع', name: 'عين', alternatives: ['عين', 'عين', 'ع'] },
  { letter: 'غ', name: 'غين', alternatives: ['غين', 'غين', 'غ'] },
  { letter: 'ف', name: 'فاء', alternatives: ['فاء', 'فا', 'ف'] },
  { letter: 'ق', name: 'قاف', alternatives: ['قاف', 'قاف', 'ق'] },
  { letter: 'ك', name: 'كاف', alternatives: ['كاف', 'كاف', 'ك'] },
  { letter: 'ل', name: 'لام', alternatives: ['لام', 'لام', 'ل'] },
  { letter: 'م', name: 'ميم', alternatives: ['ميم', 'ميم', 'م'] },
  { letter: 'ن', name: 'نون', alternatives: ['نون', 'نون', 'ن'] },
  { letter: 'ه', name: 'هاء', alternatives: ['هاء', 'ها', 'ه'] },
  { letter: 'و', name: 'واو', alternatives: ['واو', 'وا', 'و'] },
  { letter: 'ي', name: 'ياء', alternatives: ['ياء', 'يا', 'ي'] },
];

const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ALEF_VARIANTS = /[إأآٱ]/g;
const TA_MARBUTA = /ة/g;
const ALIF_MAQSURA = /ى/g;

export function normalizeArabic(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('ar')
    .replace(DIACRITICS, '')
    .replace(/\u0640/g, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(TA_MARBUTA, 'ه')
    .replace(ALIF_MAQSURA, 'ي')
    .replace(/[،؛,:.!؟?'"`]/g, '')
    .replace(/\s+/g, ' ');
}

export function isArabicAnswerCorrect(input: string, letter: ArabicLetter): boolean {
  const normalized = normalizeArabic(input);
  return letter.alternatives.some((answer) => normalizeArabic(answer) === normalized);
}

export function formatDate(date: string | number): string {
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatTime(date: string | number): string {
  return new Intl.DateTimeFormat('ar', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}