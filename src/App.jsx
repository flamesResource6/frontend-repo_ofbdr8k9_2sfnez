import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Film, Ticket, Calendar, Clock, ChevronRight, X, Check, Rows3, Columns3 } from 'lucide-react'

function useBackend() {
  return useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
}

function Hero() {
  return (
    <section className="relative min-h-[72vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/zks9uYILDPSX-UX6/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white/80 text-xs mb-4 pointer-events-none">
          <Ticket className="w-3.5 h-3.5" /> Futuristic booking • Instant confirmation
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
          Book your next movie in style
        </h1>
        <p className="mt-4 max-w-2xl text-white/80">
          A clean, immersive experience for discovering movies, picking seats, and checking out securely.
        </p>
      </div>
    </section>
  )
}

function Header({ user, onLogin, onLogout }) {
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur bg-black/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-fuchsia-500/30 border border-white/10">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold leading-none">HoloTickets</p>
            <p className="text-xs text-white/60">Futuristic movie booking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-sm hidden sm:block">{user.name}</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">Logout</button>
            </div>
          ) : (
            <button onClick={onLogin} className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm">Login / Sign up</button>
          )}
        </div>
      </div>
    </header>
  )
}

function LoginModal({ open, onClose, onAuthed }) {
  const base = useBackend()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${base}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { name, email, password } : { email, password })
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Request failed')
      const data = await res.json()
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify({ name: data.name, email: data.email, id: data.user_id }))
      onAuthed({ name: data.name, email: data.email, id: data.user_id })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          {mode === 'register' && (
            <div>
              <label className="text-sm text-white/70">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30" required />
            </div>
          )}
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30" required />
          </div>
          <div>
            <label className="text-sm text-white/70">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/30" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button disabled={loading} className="w-full rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-4 py-2 font-medium">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-sm text-white/70">
          {mode === 'login' ? (
            <>New here? <button className="underline" onClick={()=>setMode('register')}>Create an account</button></>
          ) : (
            <>Already have an account? <button className="underline" onClick={()=>setMode('login')}>Login</button></>
          )}
        </p>
      </div>
    </div>
  )
}

function MovieCard({ movie, onSelect }) {
  return (
    <button onClick={() => onSelect(movie)} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-left transition">
      <div className="aspect-[3/4] w-full rounded-lg bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/10" style={{backgroundImage: movie.poster_url?`url(${movie.poster_url})`:undefined, backgroundSize:'cover', backgroundPosition:'center'}}/>
      <h4 className="mt-3 text-white font-semibold truncate">{movie.title}</h4>
      <p className="text-xs text-white/60 line-clamp-2 min-h-[2.25rem]">{movie.description || 'No description available.'}</p>
      <div className="mt-2 flex items-center gap-2 text-white/70 text-xs">
        <Clock className="w-3.5 h-3.5" /> {movie.duration_minutes} mins
      </div>
      <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white/80 border border-white/10">
        Details <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  )
}

function ShowPicker({ movie, onPick, onClose }) {
  const base = useBackend()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${base}/shows?movie_id=${encodeURIComponent(movie.id || movie._id || movie.movie_id || movie.movieId || movie.movie_id)}`)
        const data = await res.json()
        setShows(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [base, movie])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl rounded-t-2xl sm:rounded-xl border border-white/10 bg-neutral-900 p-6 text-white shadow-xl max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Select a showtime</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        {loading ? (
          <p className="text-white/70">Loading shows...</p>
        ) : shows.length === 0 ? (
          <p className="text-white/70">No shows found. Create some via the API.</p>
        ) : (
          <div className="space-y-3">
            {shows.map(s => (
              <button key={s.id} onClick={() => onPick(s)} className="w-full text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(s.start_time).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-white/70">Screen {s.screen} • ${(s.price_cents/100).toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SeatPicker({ show, token, onBooked, onClose }) {
  const base = useBackend()
  const [layout, setLayout] = useState(null)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch(`${base}/shows/${show.id}/seats`)
      const data = await res.json()
      setLayout(data)
      setLoading(false)
    }
    load()
  }, [base, show])

  const toggle = (id, booked) => {
    if (booked) return
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  const book = async () => {
    setError('')
    try {
      const res = await fetch(`${base}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ show_id: show.id, seats: selected })
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Booking failed')
      const data = await res.json()
      onBooked(data)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl border border-white/10 bg-neutral-900 p-6 text-white shadow-xl max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Pick your seats</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        {loading || !layout ? (
          <p className="text-white/70">Loading seat map...</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/70 inline-block"/> Available</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-white/40 inline-block"/> Booked</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500/80 inline-block"/> Selected</span>
            </div>
            <div className="flex justify-center">
              <div>
                {layout.layout.map((row) => (
                  <div key={row.row} className="flex items-center gap-2 mb-2">
                    <div className="w-6 text-right text-xs text-white/60">{row.row}</div>
                    <div className="flex gap-2">
                      {row.seats.map((s) => {
                        const isSel = selected.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            onClick={() => toggle(s.id, s.booked)}
                            className={`w-8 h-8 rounded grid place-items-center text-xs border ${s.booked ? 'bg-white/30 border-white/20 text-white/40 cursor-not-allowed' : isSel ? 'bg-indigo-500/80 border-indigo-400' : 'bg-emerald-500/70 border-emerald-400 hover:bg-emerald-500/90'}`}
                          >
                            {s.booked ? <X className="w-3 h-3"/> : isSel ? <Check className="w-3 h-3"/> : s.id.replace(/^[A-Z]/,'')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-white/80 text-sm">{selected.length} seat(s) selected</div>
              <button disabled={selected.length===0} onClick={book} className="rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 px-4 py-2">Confirm & Checkout</button>
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const base = useBackend()
  const [user, setUser] = useState(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [showPickerFor, setShowPickerFor] = useState(null)
  const [seatPicker, setSeatPicker] = useState({ open: false, show: null })
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('auth_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/movies`)
        const data = await res.json()
        setMovies(data)
      } catch {}
    }
    load()
  }, [base])

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const startBooking = (movie) => {
    setSelectedMovie(movie)
    setShowPickerFor(movie)
  }

  const handlePickShow = (s) => {
    setShowPickerFor(null)
    setSeatPicker({ open: true, show: s })
  }

  const handleBooked = (data) => {
    setSeatPicker({ open: false, show: null })
    setBooking(data)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <Header user={user} onLogin={() => setLoginOpen(true)} onLogout={logout} />
      <Hero />

      <section className="relative -mt-12 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-semibold flex items-center gap-2"><Film className="w-5 h-5"/> Now Showing</h2>
              <a href="/test" className="text-xs text-white/60 hover:text-white">System Check</a>
            </div>
            {movies.length === 0 ? (
              <div className="text-white/70 text-sm">
                No movies in the catalog yet. Use the API to add movies, then create shows. You can still explore the UI.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m} onSelect={() => startBooking(m)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {showPickerFor && (
        <ShowPicker movie={showPickerFor} onPick={handlePickShow} onClose={() => setShowPickerFor(null)} />)
      }
      {seatPicker.open && (
        user ? (
          <SeatPicker show={seatPicker.show} token={token} onBooked={handleBooked} onClose={() => setSeatPicker({ open:false, show:null })} />
        ) : (
          <LoginModal open={true} onClose={() => setSeatPicker({ open:false, show:null })} onAuthed={setUser} />
        )
      )}
      {loginOpen && <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} onAuthed={setUser} />}

      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setBooking(null)} />
          <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-neutral-900 p-6 text-white shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Booking Confirmed</h3>
            <p className="text-white/80 text-sm">Your booking ID is:</p>
            <p className="font-mono mt-1">{booking.booking_id}</p>
            <p className="mt-3 text-white/80 text-sm">Amount: ${(booking.amount_cents/100).toFixed(2)}</p>
            <button onClick={()=>setBooking(null)} className="mt-6 w-full rounded-md bg-indigo-500 hover:bg-indigo-600 px-4 py-2">Close</button>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t border-white/10 py-8 text-center text-white/50 text-sm">
        Built with love • Holographic theme • All data persists to MongoDB
      </footer>
    </div>
  )
}
