import { createSlice } from "@reduxjs/toolkit";

const candidateSlice = createSlice({
  name: "candidates",
  initialState: {
    list: [], 
    active: null, 
  },
  reducers: {
    addCandidate: (state, action) => {
      state.list.push(action.payload);
      state.active = action.payload;
    },
    updateAnswer: (state, action) => {
      const { qIndex, answer } = action.payload;
      if (state.active) {
        state.active.answers[qIndex] = answer;
      }
    },
    finishInterview: (state, action) => {
      const { score, summary } = action.payload;
      state.active.score = score;
      state.active.summary = summary;
      state.active.finished = true;
      const idx = state.list.findIndex(c => c.id === state.active.id);
      if (idx > -1) state.list[idx] = state.active;
    },
    setActiveCandidate: (state, action) => {
      state.active = state.list.find(c => c.id === action.payload);
    },
  },
});

export const { addCandidate, updateAnswer, finishInterview, setActiveCandidate } = candidateSlice.actions;
export default candidateSlice.reducer;