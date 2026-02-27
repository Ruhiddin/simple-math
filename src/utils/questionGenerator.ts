import { evaluateExpression, type Operator } from './evaluateExpression';
import { randomFromArray, randomInt } from './rng';

export type QuestionStatus = 'ACTIVE' | 'RESOLVED';
export type TargetSelectionMode = 'random' | 'sequential';

export interface GeneratedQuestion {
  id: number;
  displayIndex: number;
  numbers: number[];
  operators: Operator[];
  answer: number;
  status: QuestionStatus;
}

export interface GameSettings {
  methods: Operator[];
  actions: number;
  questionCount: number;
  min: number;
  max: number;
  timeoutSeconds: number;
  targetSelectionMode: TargetSelectionMode;
}

const maxAttempts = 100;

const safeDivisor = (min: number, max: number): number => {
  let divisor = 0;
  let attempts = 0;

  while (divisor === 0 && attempts < maxAttempts) {
    divisor = randomInt(min, max);
    attempts += 1;
  }

  return divisor === 0 ? 1 : divisor;
};

export const generateQuestions = (settings: GameSettings): GeneratedQuestion[] => {
  const questions: GeneratedQuestion[] = [];

  for (let questionId = 1; questionId <= settings.questionCount; questionId += 1) {
    const operators: Operator[] = [];
    const numbers: number[] = [randomInt(settings.min, settings.max)];

    for (let step = 0; step < settings.actions; step += 1) {
      const operator = randomFromArray(settings.methods);
      operators.push(operator);

      if (operator === 'divide') {
        const divisor = safeDivisor(settings.min, settings.max);
        const factor = randomInt(settings.min, settings.max);
        const dividend = divisor * factor;

        numbers[numbers.length - 1] = dividend;
        numbers.push(divisor);
      } else {
        numbers.push(randomInt(settings.min, settings.max));
      }
    }

    questions.push({
      id: questionId,
      displayIndex: questionId,
      numbers,
      operators,
      answer: evaluateExpression(numbers, operators),
      status: 'ACTIVE',
    });
  }

  return questions;
};
