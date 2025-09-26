import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchQuestions = createAsyncThunk(
  'candidates/fetchQuestions',
  async (resumeText, { rejectWithValue }) => {
    try {
     
      return new Promise((resolve) => {
        setTimeout(() => {
          const questions = [
            { question: "Can you tell me about your experience with React?", time: 30, difficulty: "easy" },
            { question: "How do you manage state in a large React application?", time: 45, difficulty: "medium" },
            { question: "Explain the virtual DOM and how it works.", time: 60, difficulty: "easy" },
            { question: "What are React hooks and when would you use them?", time: 60, difficulty: "medium" },
            { question: "Describe a challenging problem you solved with React and how you approached it.", time: 90, difficulty: "hard" },
            { question: "How do you optimize the performance of a React application?", time: 90, difficulty: "hard" },
          ];
          resolve(questions);
        }, 1000);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch questions');
    }
  }
);

const initialState = {
  list: [],
  active: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  questions: [],
  currentQuestionIndex: -1,
  interviewInProgress: false,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action) => {
      const newCandidate = {
        ...action.payload,
        id: Date.now().toString(),
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'applied',
        answers: [],
        score: null,
        summary: '',
        finished: false,
      };
      state.list.push(newCandidate);
      state.active = newCandidate;
      state.interviewInProgress = true;
    },
    
    updateAnswer: (state, action) => {
      const { qIndex, answer } = action.payload;
      if (state.active) {
        state.active.answers[qIndex] = answer;
        state.active.updatedAt = new Date().toISOString();
        
        // Update the candidate in the list
        const index = state.list.findIndex(c => c.id === state.active.id);
        if (index !== -1) {
          state.list[index] = { ...state.active };
        }
      }
    },
    
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    
    finishInterview: (state, action) => {
      if (!state.active) return;
      
      const { score, summary } = action.payload;
      state.active.score = score;
      state.active.summary = summary;
      state.active.finished = true;
      state.active.status = 'completed';
      state.active.updatedAt = new Date().toISOString();
      state.interviewInProgress = false;
      
      const index = state.list.findIndex(c => c.id === state.active.id);
      if (index !== -1) {
        state.list[index] = { ...state.active };
      }
    },
    
    setActiveCandidate: (state, action) => {
      const candidate = state.list.find(c => c.id === action.payload);
      if (candidate) {
        state.active = { ...candidate };
      }
    },
    
    resetInterview: (state) => {
      state.active = null;
      state.questions = [];
      state.currentQuestionIndex = -1;
      state.interviewInProgress = false;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.questions = action.payload;
        state.currentQuestionIndex = 0;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAllCandidates = (state) => state.candidates.list;
export const selectActiveCandidate = (state) => state.candidates.active;
export const selectInterviewInProgress = (state) => state.candidates.interviewInProgress;
export const selectCurrentQuestion = (state) => {
  const { questions, currentQuestionIndex } = state.candidates;
  return questions[currentQuestionIndex] || null;
};
export const selectInterviewProgress = (state) => {
  const { questions, currentQuestionIndex } = state.candidates;
  return {
    current: currentQuestionIndex + 1,
    total: questions.length,
    isLastQuestion: currentQuestionIndex === questions.length - 1,
  };
};

export const { 
  addCandidate, 
  updateAnswer, 
  finishInterview, 
  setActiveCandidate, 
  setCurrentQuestion,
  resetInterview,
} = candidateSlice.actions;

export default candidateSlice.reducer;