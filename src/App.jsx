import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate,useLocation } from 'react-router-dom';
import { useGetTrendingQuery, useSearchMediaQuery, useGetMovieDetailQuery, useGetTvDetailQuery, useGetPopularMoviesQuery, useGetPopularTvQuery } from './store/tmdbApi';
import { useSelector, useDispatch } from 'react-redux';
import { addBookmark, removeBookmark } from './store/bookmarksSlice';
import './index.css';

// Movies Page
const Movies = () => {
  const { data, isLoading, error } = useGetPopularMoviesQuery();
  const navigate = useNavigate();

  if (isLoading) return <div className="text-center text-3xl mt-20 text-white">Loading Popular Movies...</div>;
  if (error) return <div className="text-center text-3xl mt-20 text-red-500">Error loading movies</div>;

  const movies = data?.results || [];

  return (
    <div className="py-8 px-4 md:px-8 bg-gray-950 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-blue-400">Popular Movies</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.slice(0, 15).map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/movie/${item.id}`)}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer relative"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path || ''}`}
              alt={item.title}
              className="w-full h-[340px] object-cover"
              onError={e => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold truncate text-white">{item.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Movie • Rating: {item.vote_average?.toFixed(1) || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// TV Series Page
const TVSeries = () => {
  const { data, isLoading, error } = useGetPopularTvQuery();
  const navigate = useNavigate();

  if (isLoading) return <div className="text-center text-3xl mt-20 text-white">Loading Popular TV Series...</div>;
  if (error) return <div className="text-center text-3xl mt-20 text-red-500">Error loading TV series</div>;

  const tv = data?.results || [];

  return (
    <div className="py-8 px-4 md:px-8 bg-gray-950 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-green-400">Popular TV Series</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tv.slice(0, 15).map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/tv/${item.id}`)}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer relative"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path || ''}`}
              alt={item.name}
              className="w-full h-[340px] object-cover"
              onError={e => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold truncate text-white">{item.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                TV • Rating: {item.vote_average?.toFixed(1) || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bookmarks Page - 
const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('https://entertainment-app-1-vpjl.onrender.com/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBookmarks(data))
      .catch(() => console.log('No bookmarks'));
  }, [navigate]);

  const removeBookmark = async (mediaId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`https://entertainment-app-1-vpjl.onrender.com/api/bookmarks/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(item => item.mediaId !== mediaId));
        alert('Bookmark removed!');
      } else {
        alert('Failed to remove bookmark');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="py-8 px-4 md:px-8 bg-gray-950 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-yellow-400">My Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p className="text-center text-xl text-gray-400">No bookmarks yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {bookmarks.map(item => (
            <div key={item.mediaId} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg relative">
              <img src={item.poster} alt={item.title} className="w-full h-[340px] object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate text-white">{item.title}</h3>
              </div>
              <button
                onClick={() => removeBookmark(item.mediaId)}
                className="absolute top-3 right-3 text-2xl text-red-500 hover:scale-110 transition-transform"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// Detail Page
const Detail = () => {
  const { type, id } = useParams();
  const isMovie = type === 'movie';

  const { data, isLoading, error } = isMovie 
    ? useGetMovieDetailQuery(id)
    : useGetTvDetailQuery(id);

  if (isLoading) return <div className="text-center text-3xl mt-20 text-white">Loading Details...</div>;
  if (error || !data) return <div className="text-center text-3xl mt-20 text-red-500">Error loading details</div>;

  const title = data.title || data.name || 'Unknown';
  const poster = `https://image.tmdb.org/t/p/w780${data.poster_path || ''}`;
  const backdrop = `https://image.tmdb.org/t/p/original${data.backdrop_path || ''}`;
  const overview = data.overview || 'No overview available.';
  const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
  const release = data.release_date || data.first_air_date || 'N/A';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="h-96 md:h-[500px] bg-cover bg-center relative" style={{ backgroundImage: `url(${backdrop})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <img src={poster} alt={title} className="w-48 md:w-72 rounded-xl shadow-2xl" />
              <div>
                <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>
                <p className="text-xl mt-2 text-gray-300">{release} • {rating}/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">Overview</h2>
        <p className="text-lg text-gray-300 max-w-4xl">{overview}</p>
      </div>
    </div>
  );
};

// Login Page
const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
     const res = await fetch('https://entertainment-app-1-vpjl.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true); 
        alert('Login successful!');
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-4 mb-4 bg-gray-700 text-white rounded-lg" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-4 mb-6 bg-gray-700 text-white rounded-lg" required />
        <button type="submit" className="w-full p-4 bg-purple-600 rounded-lg font-bold hover:bg-purple-700">Login</button>
      </form>
    </div>
  );
};
// Signup Page
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://entertainment-app-1-vpjl.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Now login.');
        navigate('/login');
      setIsLoggedIn(false); 
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSignup} className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-400">Sign Up</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-4 mb-4 bg-gray-700 text-white rounded-lg" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-4 mb-6 bg-gray-700 text-white rounded-lg" required />
        <button type="submit" className="w-full p-4 bg-purple-600 rounded-lg font-bold hover:bg-purple-700">Sign Up</button>
      </form>
    </div>
  );
};

// Home page
const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('https://entertainment-app-1-vpjl.onrender.com/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ids = new Set(data.map(item => item.mediaId));
        setBookmarkedIds(ids);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: trending, isLoading: loadingTrending } = useGetTrendingQuery();
  const { data: searchResults, isLoading: loadingSearch } = useSearchMediaQuery(debouncedTerm, {
    skip: debouncedTerm.length < 2,
  });

  const items = debouncedTerm.length >= 2 ? (searchResults?.results || []) : (trending?.results || []);

  if (loadingTrending || loadingSearch) return <div className="text-center text-3xl mt-20 text-white animate-pulse">Loading...</div>;

  const toggleBookmark = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    const isBookmarked = bookmarkedIds.has(item.id);
    const method = isBookmarked ? 'DELETE' : 'POST';
    const url = isBookmarked ? `https://entertainment-app-1-vpjl.onrender.com/api/bookmarks/${item.id}` : 'https://entertainment-app-1-vpjl.onrender.com/api/bookmarks';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isBookmarked ? null : JSON.stringify({
          mediaId: item.id,
          mediaType: item.media_type,
          title: item.title || item.name,
          poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`
        })
      });

      if (res.ok) {
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.delete(item.id);
          } else {
            newSet.add(item.id);
          }
          return newSet;
        });
        alert(isBookmarked ? 'Bookmark removed!' : 'Bookmark added!');
      } else {
        alert('Failed to update bookmark');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div className="py-8 px-4 md:px-8 bg-gray-950 min-h-screen">
      <div className="max-w-3xl mx-auto mb-12">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search movies or TV shows..."
          className="w-full px-6 py-4 bg-gray-800 border border-gray-700 text-white rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400 shadow-lg"
        />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-purple-400">
        {debouncedTerm ? `Results for "${debouncedTerm}"` : 'Trending This Week'}
      </h1>

      {items.length === 0 && debouncedTerm && (
        <p className="text-center text-xl text-gray-400">No results found for "{debouncedTerm}"</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.slice(0, 15).map(item => {
          const isBookmarked = bookmarkedIds.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/${item.media_type}/${item.id}`)}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer relative"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path || ''}`}
                alt={item.title || item.name}
                className="w-full h-[340px] object-cover"
                onError={e => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate text-white">{item.title || item.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {item.media_type?.toUpperCase() || 'N/A'} • {item.vote_average?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(item);
                }}
                className="absolute top-3 right-3 text-2xl hover:scale-110 transition-transform"
              >
                {isBookmarked ? '❤️' : '♡'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main App
const App = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gray-950 text-white overflow-x-hidden">
      <nav className="bg-gray-800 p-4 shadow-md">
  <ul className="flex flex-wrap justify-center gap-6 md:gap-10 text-lg font-medium">
  <li><Link to="/" className={`hover:text-purple-400 transition-colors ${location.pathname === '/' ? 'text-purple-400 font-bold' : 'text-white'}`}>Home</Link></li>
  <li><Link to="/movies" className={`hover:text-purple-400 transition-colors ${location.pathname === '/movies' ? 'text-purple-400 font-bold' : 'text-white'}`}>Movies</Link></li>
  <li><Link to="/tv" className={`hover:text-purple-400 transition-colors ${location.pathname === '/tv' ? 'text-purple-400 font-bold' : 'text-white'}`}>TV Series</Link></li>
  <li><Link to="/bookmarks" className={`hover:text-purple-400 transition-colors ${location.pathname === '/bookmarks' ? 'text-purple-400 font-bold' : 'text-white'}`}>Bookmarks</Link></li>

  {isLoggedIn ? (
    <li>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          alert('Logged out successfully!');
          navigate('/');
        }}
        className="hover:text-red-400 transition-colors text-white"
      >
        Logout
      </button>
    </li>
  ) : (
    <>
      <li><Link to="/login" className={`hover:text-purple-400 transition-colors ${location.pathname === '/login' ? 'text-purple-400 font-bold' : 'text-white'}`}>Login</Link></li>
      <li><Link to="/signup" className={`hover:text-purple-400 transition-colors ${location.pathname === '/signup' ? 'text-purple-400 font-bold' : 'text-white'}`}>Sign Up</Link></li>
    </>
  )}
</ul>
</nav>

      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVSeries />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:type/:id" element={<Detail />} />
          <Route path="*" element={<div className="text-center text-4xl mt-20">404 - Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
