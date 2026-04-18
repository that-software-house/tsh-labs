import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  LogOut,
  Music,
  User,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import {
  initiateSpotifyLogin,
  handleSpotifyCallback,
  saveSpotifyTokens,
  getValidAccessToken,
  deleteSpotifyConnection,
  fetchTopArtists,
  fetchTopTracks,
  fetchRecentlyPlayed,
  deriveGenreBreakdown,
  estimateListeningHours,
} from '@/lib/spotify';
import './MusicStatsApp.css';

const TIME_RANGES = [
  { value: 'short_term', label: 'Last 4 Weeks' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'Last Year' },
];

const GENRE_COLORS = [
  '#1DB954', '#1ed760', '#15803d', '#6366f1', '#8b5cf6',
  '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#64748b',
];

const INITIAL_SHOW_COUNT = 20;

function SpotifyLogo({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

const MusicStatsApp = () => {
  const { user, isAuthenticated } = useAuth();

  const [spotifyState, setSpotifyState] = useState('checking');
  const [timeRange, setTimeRange] = useState('short_term');
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recentPlayed, setRecentPlayed] = useState([]);
  const [genreData, setGenreData] = useState([]);
  const [hours, setHours] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  const callbackProcessed = useRef(false);
  const prevTimeRange = useRef(timeRange);

  const fetchData = useCallback(async (accessToken, range) => {
    setIsLoading(true);
    setError('');
    try {
      const [artists, tracks, recent] = await Promise.all([
        fetchTopArtists(accessToken, range),
        fetchTopTracks(accessToken, range),
        fetchRecentlyPlayed(accessToken),
      ]);

      setTopArtists(artists);
      setTopTracks(tracks);
      setRecentPlayed(recent);
      setGenreData(deriveGenreBreakdown(artists));
      setHours(estimateListeningHours(recent));
    } catch (err) {
      if (err.status === 401) {
        setSpotifyState('not_connected');
        setError('Your Spotify session expired. Please reconnect.');
      } else {
        setError(err.message || 'Failed to load Spotify data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Spotify callback or check existing connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSpotifyState('not_connected');
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.has('code') && !callbackProcessed.current) {
      callbackProcessed.current = true;
      (async () => {
        try {
          console.log('[musicstats] Processing Spotify callback...');
          const tokens = await handleSpotifyCallback(params);
          console.log('[musicstats] Token exchange successful, access_token present:', !!tokens.access_token);
          await saveSpotifyTokens(user.id, tokens);
          console.log('[musicstats] Tokens saved to Supabase');
          window.history.replaceState({}, '', window.location.pathname);
          setSpotifyState('connected');
          await fetchData(tokens.access_token, timeRange);
        } catch (err) {
          console.error('[musicstats] Callback error:', err);
          window.history.replaceState({}, '', window.location.pathname);
          setError(err.message || 'Failed to connect Spotify.');
          setSpotifyState('not_connected');
        }
      })();
      return;
    }

    // Check for existing connection
    (async () => {
      try {
        console.log('[musicstats] Checking existing Spotify connection...');
        const accessToken = await getValidAccessToken(user.id);
        console.log('[musicstats] getValidAccessToken result:', accessToken ? 'token found' : 'no token');
        if (accessToken) {
          setSpotifyState('connected');
          await fetchData(accessToken, timeRange);
        } else {
          setSpotifyState('not_connected');
        }
      } catch (err) {
        console.error('[musicstats] Connection check error:', err);
        setSpotifyState('not_connected');
      }
    })();
  }, [isAuthenticated, user?.id]);

  // Re-fetch only when time range actually changes (not on initial mount)
  useEffect(() => {
    if (prevTimeRange.current === timeRange) return;
    prevTimeRange.current = timeRange;

    if (spotifyState !== 'connected' || !user) return;

    (async () => {
      try {
        const accessToken = await getValidAccessToken(user.id);
        if (accessToken) {
          await fetchData(accessToken, timeRange);
        } else {
          setSpotifyState('not_connected');
          setError('Your Spotify session expired. Please reconnect.');
        }
      } catch {
        setError('Failed to refresh data.');
      }
    })();
  }, [timeRange]);

  const handleConnect = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    initiateSpotifyLogin();
  };

  const handleDisconnect = async () => {
    if (!user) return;
    try {
      await deleteSpotifyConnection(user.id);
      setSpotifyState('not_connected');
      setTopArtists([]);
      setTopTracks([]);
      setRecentPlayed([]);
      setGenreData([]);
      setHours(0);
      setError('');
    } catch (err) {
      setError('Failed to disconnect. Please try again.');
    }
  };

  const displayedArtists = showAllArtists ? topArtists : topArtists.slice(0, INITIAL_SHOW_COUNT);
  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, INITIAL_SHOW_COUNT);

  return (
    <div className="musicstats-app">
      {/* Header */}
      <header className="musicstats-header">
        <div className="musicstats-icon">
          <Music size={22} />
        </div>
        <div>
          <h2>Music Stats</h2>
          <p>Your Spotify listening insights at a glance</p>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="musicstats-notice error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Not signed in */}
      {!isAuthenticated && (
        <div className="musicstats-signin-card">
          <User size={36} strokeWidth={1.5} color="#94a3b8" />
          <h3>Sign in to get started</h3>
          <p>Create an account or sign in to connect your Spotify and view your stats.</p>
          <button className="musicstats-signin-btn" onClick={() => setShowAuthModal(true)}>
            Sign In
          </button>
        </div>
      )}

      {/* Authenticated but not connected */}
      {isAuthenticated && spotifyState === 'not_connected' && (
        <div className="musicstats-connect-card">
          <SpotifyLogo size={48} />
          <h3>Connect your Spotify</h3>
          <p>
            Link your Spotify account to see your top artists, tracks, genres, and listening time.
          </p>
          <button className="musicstats-connect-btn" onClick={handleConnect}>
            <SpotifyLogo size={20} />
            Connect with Spotify
          </button>
          <span className="musicstats-connect-privacy">
            We only read your listening history. We never post or modify anything.
          </span>
        </div>
      )}

      {/* Checking / loading initial */}
      {isAuthenticated && spotifyState === 'checking' && (
        <div className="musicstats-connect-card">
          <Loader2 size={28} className="musicstats-spinning" color="#1DB954" />
          <p>Checking Spotify connection...</p>
        </div>
      )}

      {/* Connected — Dashboard */}
      {isAuthenticated && spotifyState === 'connected' && (
        <>
          {/* Time Range Selector */}
          <div className="musicstats-time-tabs">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                className={timeRange === range.value ? 'active' : ''}
                onClick={() => setTimeRange(range.value)}
                disabled={isLoading}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <>
              <div className="musicstats-stats-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="musicstats-skeleton musicstats-skeleton-stat" />
                ))}
              </div>
              <div className="musicstats-panel">
                <div className="musicstats-skeleton-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="musicstats-skeleton musicstats-skeleton-card" />
                  ))}
                </div>
              </div>
              <div className="musicstats-panel">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="musicstats-skeleton musicstats-skeleton-row" />
                ))}
              </div>
            </>
          )}

          {/* Data Loaded */}
          {!isLoading && (
            <>
              {/* Stats Overview */}
              <div className="musicstats-stats-grid">
                <div className="musicstats-stat-card">
                  <p>Top Genre</p>
                  <h3>{genreData[0]?.name || '—'}</h3>
                </div>
                <div className="musicstats-stat-card">
                  <p>Artists</p>
                  <h3>{topArtists.length}</h3>
                </div>
                <div className="musicstats-stat-card">
                  <p>Est. Hours (recent)</p>
                  <h3>{hours}</h3>
                </div>
                <div className="musicstats-stat-card">
                  <p>Tracks</p>
                  <h3>{topTracks.length}</h3>
                </div>
              </div>

              {/* Top Artists */}
              {topArtists.length > 0 && (
                <div className="musicstats-panel">
                  <div className="musicstats-panel-header">
                    <h3>Top Artists</h3>
                    {topArtists.length > INITIAL_SHOW_COUNT && (
                      <button
                        className="musicstats-show-more-btn"
                        onClick={() => setShowAllArtists(!showAllArtists)}
                      >
                        {showAllArtists ? 'Show less' : `Show all ${topArtists.length}`}
                      </button>
                    )}
                  </div>
                  <div className="musicstats-artists-grid">
                    {displayedArtists.map((artist) => (
                      <div key={artist.id} className="musicstats-artist-card">
                        {artist.images?.[2]?.url || artist.images?.[0]?.url ? (
                          <img
                            className="musicstats-artist-img"
                            src={artist.images[2]?.url || artist.images[0]?.url}
                            alt={artist.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="musicstats-artist-img" />
                        )}
                        <div className="musicstats-artist-info">
                          <div className="musicstats-artist-name">{artist.name}</div>
                          {artist.genres?.length > 0 && (
                            <div className="musicstats-artist-genre">
                              {artist.genres.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Tracks */}
              {topTracks.length > 0 && (
                <div className="musicstats-panel">
                  <div className="musicstats-panel-header">
                    <h3>Top Tracks</h3>
                    {topTracks.length > INITIAL_SHOW_COUNT && (
                      <button
                        className="musicstats-show-more-btn"
                        onClick={() => setShowAllTracks(!showAllTracks)}
                      >
                        {showAllTracks ? 'Show less' : `Show all ${topTracks.length}`}
                      </button>
                    )}
                  </div>
                  <div className="musicstats-tracks-list">
                    {displayedTracks.map((track, i) => (
                      <div key={track.id} className="musicstats-track-item">
                        <span className="musicstats-track-rank">{i + 1}</span>
                        {track.album?.images?.[2]?.url || track.album?.images?.[0]?.url ? (
                          <img
                            className="musicstats-track-art"
                            src={track.album.images[2]?.url || track.album.images[0]?.url}
                            alt={track.album.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="musicstats-track-art" />
                        )}
                        <div className="musicstats-track-info">
                          <div className="musicstats-track-name">{track.name}</div>
                          <div className="musicstats-track-artist">
                            {track.artists?.map((a) => a.name).join(', ')}
                          </div>
                          <div className="musicstats-track-album">{track.album?.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Genre Breakdown */}
              {genreData.length > 0 && (
                <div className="musicstats-panel">
                  <div className="musicstats-panel-header">
                    <h3>Genre Breakdown</h3>
                  </div>
                  <div className="musicstats-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genreData.slice(0, 8)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {genreData.slice(0, 8).map((_, index) => (
                            <Cell
                              key={index}
                              fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Disconnect */}
              <div className="musicstats-disconnect-section">
                <p>Connected to Spotify</p>
                <button className="musicstats-disconnect-btn" onClick={handleDisconnect}>
                  <LogOut size={14} style={{ marginRight: 4 }} />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default MusicStatsApp;
