import { configureStore } from '@reduxjs/toolkit';
import { tmdbApi } from './tmdbApi';
import bookmarksReducer from './bookmarksSlice';

export const store = configureStore({
  reducer: {
    [tmdbApi.reducerPath]: tmdbApi.reducer,
    bookmarks: bookmarksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tmdbApi.middleware),
});