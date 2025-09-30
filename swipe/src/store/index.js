
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import candidateSlice from '../slices/candidateSlice';
import interviewSlice from '../slices/interviewSlice';

const rootReducer = combineReducers({
  candidate: candidateSlice,
  interview: interviewSlice,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
 
  whitelist: ['candidate', 'interview'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
