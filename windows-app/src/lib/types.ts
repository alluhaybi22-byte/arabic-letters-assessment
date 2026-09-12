export type AssessmentAnswer = {
  letter: string;
  letterName: string;
  userAnswer: string;
  isCorrect: boolean;
  confidence: number;
  matchType: 'typed' | 'speech' | 'skipped';
  answeredAt: string;
};

export type AssessmentResult = {
  id: string;
  startedAt: string;
  completedAt: string;
  score: number;
  correctCount: number;
  totalCount: number;
  answers: AssessmentAnswer[];
};