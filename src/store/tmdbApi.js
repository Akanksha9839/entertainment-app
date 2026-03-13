import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.themoviedb.org/3',
    prepareHeaders: (headers) => {
      headers.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MjhlN2MwODc0Y2Y2MTZiYTQ4ODc3OWRiNDdjODE0OSIsIm5iZiI6MTc3MTg3NjIxNi41NTIsInN1YiI6IjY5OWNhZjc4ODE1OGIyZWU4YWU4ZmRlZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.pM8l1hv0v2qG8vyPRPLa7yyZR9RI1fqrzu_BXPAcQs8');
      headers.set('accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getTrending: builder.query({
      query: () => '/trending/all/week?language=en-US',
    }),
    searchMedia: builder.query({
      query: (searchTerm) => `/search/multi?query=${encodeURIComponent(searchTerm)}&language=en-US`,
    }),
    getMovieDetail: builder.query({
      query: (id) => `/movie/${id}?language=en-US&append_to_response=videos,credits`,
    }),
    getTvDetail: builder.query({
      query: (id) => `/tv/${id}?language=en-US&append_to_response=videos,credits`,
    }),
    getPopularMovies: builder.query({
      query: () => '/movie/popular?language=en-US&page=1',
    }),
    getPopularTv: builder.query({
      query: () => '/tv/popular?language=en-US&page=1',
    }),
  }),
});

export const {
  useGetTrendingQuery,
  useSearchMediaQuery,
  useGetMovieDetailQuery,
  useGetTvDetailQuery,
  useGetPopularMoviesQuery,
  useGetPopularTvQuery,
} = tmdbApi;