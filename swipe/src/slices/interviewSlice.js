// slices/interviewSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { INTERVIEW_STATUS, QUESTION_DIFFICULTY, QUESTION_TIMERS } from '../types';

const initialState = {
  status: INTERVIEW_STATUS.NOT_STARTED,
  currentPhase: 'idle', // idle, collecting_info, asking_question, waiting_answer, completed
  currentQuestion: null,
  timeRemaining: 0,
  currentTimer: null,
  timerActive: false,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  showWelcomeBack: false,
  missingFields: [],
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state) => {
      state.status = INTERVIEW_STATUS.IN_PROGRESS;
      state.currentPhase = 'asking_question';
      state.startTime = new Date().toISOString();
    },

    setInterviewStatus: (state, action) => {
      state.status = action.payload;
    },

    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },

    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
      state.currentQuestionIndex = state.questions.findIndex(q => q.id === action.payload.id);

      // Set timer based on difficulty
      if (action.payload) {
        const difficulty = action.payload.difficulty;
        state.timeRemaining = QUESTION_TIMERS[difficulty];
      }
    },

    addQuestion: (state, action) => {
      state.questions.push(action.payload);
    },

    addAnswer: (state, action) => {
      state.answers.push(action.payload);
    },

    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },

    startTimer: (state) => {
      // Timer logic should be handled in components, not reducers
      // This reducer just sets a flag to indicate timer should start
      state.timerActive = true;
    },

    stopTimer: (state) => {
      // Timer logic should be handled in components, not reducers
      // This reducer just sets a flag to indicate timer should stop
      state.timerActive = false;
      if (state.currentTimer) {
        // Note: In a real app, we'd need to handle timer cleanup differently
        // since reducers cannot have side effects
      }
    },

    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
      if (state.currentQuestionIndex < state.questions.length) {
        const nextQ = state.questions[state.currentQuestionIndex];
        state.currentQuestion = nextQ;
        state.timeRemaining = QUESTION_TIMERS[nextQ.difficulty];
      } else {
        state.currentPhase = 'completed';
        state.status = INTERVIEW_STATUS.COMPLETED;
      }
    },

    setMissingFields: (state, action) => {
      state.missingFields = action.payload;
      if (action.payload.length > 0) {
        state.currentPhase = 'collecting_info';
        state.status = INTERVIEW_STATUS.COLLECTING_INFO;
      }
    },

    clearMissingField: (state, action) => {
      state.missingFields = state.missingFields.filter(field => field !== action.payload);
      if (state.missingFields.length === 0) {
        state.currentPhase = 'idle';
      }
    },

    resetInterview: (state) => {
      if (state.currentTimer) {
        clearInterval(state.currentTimer);
      }
      return { ...initialState };
    },

    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload;
    },

    pauseInterview: (state) => {
      state.status = INTERVIEW_STATUS.PAUSED;
      state.currentPhase = 'idle';
      if (state.currentTimer) {
        clearInterval(state.currentTimer);
        state.currentTimer = null;
      }
    },

    resumeInterview: (state) => {
      state.status = INTERVIEW_STATUS.IN_PROGRESS;
      state.currentPhase = 'asking_question';
      // Timer logic should be handled in components, not reducers
      state.timerActive = state.currentQuestion && state.timeRemaining > 0;
    },
  },
});

export const {
  startInterview,
  setInterviewStatus,
  setCurrentPhase,
  setCurrentQuestion,
  addQuestion,
  addAnswer,
  setTimeRemaining,
  startTimer,
  stopTimer,
  nextQuestion,
  setMissingFields,
  clearMissingField,
  resetInterview,
  setShowWelcomeBack,
  pauseInterview,
  resumeInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
