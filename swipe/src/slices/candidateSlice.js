// slices/candidateSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { CANDIDATE_STATUS } from '../types';

const initialState = {
  candidates: [],
  currentCandidateId: null,
  searchTerm: '',
  sortBy: 'score',
  sortOrder: 'desc',
};
const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      const candidate = {
        id: action.payload.id,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone,
        resume: action.payload.resume,
        status: action.payload.status || CANDIDATE_STATUS.PENDING,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        interviewData: action.payload.interviewData || null,
      };
      state.candidates.push(candidate);
      console.log('Candidate added to Redux:', candidate);
    },

    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setCurrentCandidate: (state, action) => {
      state.currentCandidateId = action.payload;
    },

    updateCandidate: (state, action) => {
      const { id, updates } = action.payload;
      const candidate = state.candidates.find(c => c.id === id);
      if (candidate) {
        Object.assign(candidate, updates);
        candidate.updatedAt = new Date().toISOString();
      }
    },

    updateCandidateInterview: (state, action) => {
      const { candidateId, interviewData } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.interviewData = {
          ...candidate.interviewData,
          ...interviewData,
          // Ensure questions and answers are properly stored
          questions: interviewData.questions || candidate.interviewData.questions || [],
          answers: interviewData.answers || candidate.interviewData.answers || [],
        };
        candidate.status = CANDIDATE_STATUS.COMPLETED; // Update status to completed
        candidate.updatedAt = new Date().toISOString();
      }
    },
    deleteCandidate: (state, action) => {
      state.candidates = state.candidates.filter(c => c.id !== action.payload);
      if (state.currentCandidateId === action.payload) {
        state.currentCandidateId = null;
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  setCurrentCandidate,
  updateCandidateInterview,
  setSearchTerm,
  setSortOptions,
  deleteCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;
