export type ExamVariantKey = 'original' | 'mod1' | 'mod2';

export interface VariantCodeInfo {
  key: ExamVariantKey;
  label: string; // e.g., "الأساسي", "المعدل 1", "المعدل 2"
  code: string; // e.g., "EBICJ" or "AACBA" or "LIBHXEADFX"
  changeNote?: string;
}

export interface Teil1Item {
  textNumber: number; // 1..5
  germanParagraph: string;
  arabicTranslation: string;
  correctLetterByVariant: Record<string, string>; // e.g. { original: 'E', mod1: 'E' }
  headingGerman: string;
  headingArabic: string;
  motCleHeading: string;
  motCleText: string;
  explanationAr: string;
  trapWarningAr?: string;
}

export interface Teil1HeadingOption {
  letter: string; // 'A'..'J'
  german: string;
  arabic: string;
  motCle?: string;
}

export interface Teil1Topic {
  id: string;
  number: number; // 1..42
  titleDe: string;
  titleAr: string;
  frequencyBadge: string;
  memoryStoryAr: string;
  variants: VariantCodeInfo[];
  headings: Teil1HeadingOption[]; // 10 headings A-J
  items: Teil1Item[]; // 5 texts 1-5
}

export interface Teil2QuestionOption {
  letter: 'a' | 'b' | 'c';
  german: string;
  arabic: string;
}

export interface Teil2Question {
  questionNumber: number; // 6..10
  questionDe: string;
  questionAr: string;
  correctLetterByVariant: Record<string, 'a' | 'b' | 'c'>;
  optionsByVariant: Record<string, Teil2QuestionOption[]>;
  motCleDe: string;
  motCleAr: string;
  modAlertAr?: string;
  explanationAr: string;
}

export interface Teil2Paragraph {
  titleDe?: string;
  german: string;
  arabic: string;
  highlightKeywords: string[];
}

export interface Teil2Topic {
  id: string;
  number: number; // 1..27
  titleDe: string;
  titleAr: string;
  linkedWith: string;
  frequencyBadge: string;
  variants: VariantCodeInfo[];
  paragraphs: Teil2Paragraph[];
  questions: Teil2Question[]; // 6..10
}

export interface Teil3Situation {
  situationNumber: number; // 11..20
  situationDe: string;
  situationAr: string;
  correctLetterByVariant: Record<string, string>; // 'A'..'L' or 'X'
  motCleSituation: string;
  motCleAnzeige: string;
  explanationAr: string;
  trapWarningAr?: string;
}

export interface Teil3Anzeige {
  letter: string; // 'A'..'L'
  titleDe: string;
  bodyDe: string;
  arabicTranslation: string;
  motCle: string;
}

export interface Teil3Topic {
  id: string;
  number: number; // 1..28
  titleDe: string;
  titleAr: string;
  linkedWith: string;
  frequencyBadge: string;
  variants: VariantCodeInfo[];
  situations: Teil3Situation[]; // 11..20
  anzeigen: Teil3Anzeige[]; // A..L
}

export interface SprachbausteinGap {
  gapNumber: number; // 21..30 or 31..40
  contextDe: string;
  contextAr: string;
  correctAnswer: string;
  options: string[];
  ruleExplanationAr: string;
  triggerWord: string;
}

export interface SprachbausteinTopic {
  id: string;
  part: 'SB1' | 'SB2';
  titleDe: string;
  titleAr: string;
  codeSummary: string;
  introTextDe: string;
  introTextAr: string;
  gaps: SprachbausteinGap[]; // 10 gaps
}

export interface PruefungPackage {
  id: string; // 'P1'..'P26'
  number: number; // 1..26
  nameDe: string;
  nameAr: string;
  badge: string;
  teil1Id: string;
  teil1Summary: string;
  teil2Id: string;
  teil2Summary: string;
  teil3Id: string;
  teil3Summary: string;
  sb1Id: string;
  sb1Title: string;
  sb2Id: string;
  sb2Title: string;
  examNotesAr: string;
}
