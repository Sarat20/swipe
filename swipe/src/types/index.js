// types/index.js
export const QUESTION_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const QUESTION_TIMERS = {
  [QUESTION_DIFFICULTY.EASY]: 20, // seconds
  [QUESTION_DIFFICULTY.MEDIUM]: 60,
  [QUESTION_DIFFICULTY.HARD]: 120
};

export const INTERVIEW_STATUS = {
  NOT_STARTED: 'not_started',
  COLLECTING_INFO: 'collecting_info',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

export const CANDIDATE_STATUS = {
  PENDING: 'pending',
  INTERVIEWING: 'interviewing',
  COMPLETED: 'completed'
};
