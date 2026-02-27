import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const STORAGE_KEY = 'lang';
const initialLanguage = localStorage.getItem(STORAGE_KEY) === 'uz' ? 'uz' : 'en';

const resources = {
  en: {
    translation: {
      app: {
        title: 'Arithmetic Arena',
        home: 'Home',
        resetBoth: 'Reset both',
      },
      players: {
        player1: 'Player 1',
        player2: 'Player 2',
      },
      language: {
        en: 'EN',
        uz: 'UZ',
        switchTo: 'Switch language to {{language}}',
      },
      settings: {
        title: 'Game Settings',
        methods: {
          plus: 'Plus',
          subtract: 'Subtract',
          multiply: 'Multiply',
          divide: 'Divide',
        },
        operations: 'Operations',
        questionSetup: 'Question Setup',
        numberRange: 'Number Range',
        timer: 'Timer',
        steps: 'Steps',
        questions: 'Questions',
        rangeMin: 'Range Min',
        rangeMax: 'Range Max',
        timeout: 'Timeout (s)',
        targetSelection: 'Target selection',
        random: 'Random',
        sequential: 'Sequential',
        start: 'Start Game',
        reset: 'Reset Settings',
      },
      scoreboard: {
        title: '{{label}} scoreboard',
        addPoint: '{{label}} add point',
        subtractPoint: '{{label}} subtract point',
        reset: 'Reset',
      },
      timer: {
        title: 'Countdown',
        running: 'Running',
        stopped: 'Stopped',
      },
      answer: {
        title: 'Target Answer',
        waiting: 'Start a new game to begin.',
        hint1: 'Match this answer to a question. Say the question number out loud.',
        hint2: 'When time ends, we reveal the correct question.',
        correct: 'Correct: Question #{{number}}',
      },
      next: {
        gameOver: 'Game Over',
        restart: 'Restart',
        next: 'Next',
        pressSpace: 'Press Space for Next',
        waitTimer: 'Wait for timer to reach zero',
      },
      results: {
        finished: 'Game Finished',
        title: 'Results',
      },
      questions: {
        title: 'Questions',
      },
    },
  },
  uz: {
    translation: {
      app: {
        title: 'Arifmetika Arenasi',
        home: 'Bosh sahifa',
        resetBoth: 'Ikkalasini tozalash',
      },
      players: {
        player1: '1-o\'yinchi',
        player2: '2-o\'yinchi',
      },
      language: {
        en: 'EN',
        uz: 'UZ',
        switchTo: 'Tilni {{language}} ga almashtirish',
      },
      settings: {
        title: 'O\'yin sozlamalari',
        methods: {
          plus: 'Qo\'shish',
          subtract: 'Ayirish',
          multiply: 'Ko\'paytirish',
          divide: 'Bo\'lish',
        },
        operations: 'Amallar',
        questionSetup: 'Savol sozlamalari',
        numberRange: 'Sonlar oralig\'i',
        timer: 'Taymer',
        steps: 'Qadamlar',
        questions: 'Savollar soni',
        rangeMin: 'Eng kichik son',
        rangeMax: 'Eng katta son',
        timeout: 'Vaqt (soniya)',
        targetSelection: 'Maqsadni tanlash',
        random: 'Tasodifiy',
        sequential: 'Ketma-ket',
        start: 'O\'yinni boshlash',
        reset: 'Sozlamalarni tiklash',
      },
      scoreboard: {
        title: '{{label}} hisobi',
        addPoint: '{{label}}ga ochko qo\'shish',
        subtractPoint: '{{label}}dan ochko ayirish',
        reset: 'Tozalash',
      },
      timer: {
        title: 'Vaqt hisobi',
        running: 'Ketmoqda',
        stopped: 'To\'xtadi',
      },
      answer: {
        title: 'Maqsad javob',
        waiting: 'Boshlash uchun yangi o\'yin oching.',
        hint1: 'Ushbu javobga mos savolni toping. Savol raqamini ovoz chiqarib ayting.',
        hint2: 'Vaqt tugagach, to\'g\'ri savolni ko\'rsatamiz.',
        correct: 'To\'g\'ri javob: {{number}}-savol',
      },
      next: {
        gameOver: 'O\'yin tugadi',
        restart: 'Qayta boshlash',
        next: 'Keyingisi',
        pressSpace: 'Keyingisi uchun Space tugmasini bosing',
        waitTimer: 'Taymer nolga tushishini kuting',
      },
      results: {
        finished: 'O\'yin yakunlandi',
        title: 'Natijalar',
      },
      questions: {
        title: 'Savollar',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
});

export default i18n;
