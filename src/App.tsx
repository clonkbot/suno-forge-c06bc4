import { useState, useEffect, useRef } from 'react'

type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error'

interface GeneratedSong {
  id: string
  title: string
  prompt: string
  genre: string
  duration: string
  createdAt: Date
}

const genres = [
  'Synthwave', 'Lo-Fi Hip Hop', 'Epic Orchestral', 'Indie Folk',
  'Hard Rock', 'Jazz Fusion', 'Ambient', 'Pop', 'Electronic',
  'Classical Piano', 'R&B Soul', 'Heavy Metal'
]

const moods = [
  'Energetic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful',
  'Aggressive', 'Romantic', 'Mysterious', 'Triumphant', 'Dreamy'
]

function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  const bars = 32
  return (
    <div className="flex items-end justify-center gap-[2px] h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-orange-600 to-amber-400 rounded-full transition-all duration-150"
          style={{
            height: isActive ? `${Math.random() * 100}%` : '20%',
            opacity: isActive ? 0.8 + Math.random() * 0.2 : 0.3,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

function Knob({ label, value, onChange, min = 0, max = 100 }: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  const rotation = ((value - min) / (max - min)) * 270 - 135
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 cursor-pointer group"
        onClick={() => onChange(value >= max ? min : value + 10)}
      >
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 shadow-inner" />
        <div 
          className="absolute inset-3 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center transition-transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="w-1 h-3 bg-orange-500 rounded-full absolute top-1 shadow-[0_0_10px_#f97316]" />
        </div>
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500/10" />
      </div>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-xs text-orange-400 font-bold">{value}</span>
    </div>
  )
}

function StatusLED({ active, color = 'orange' }: { active: boolean; color?: string }) {
  const colorClasses = {
    orange: active ? 'bg-orange-500 shadow-[0_0_12px_#f97316]' : 'bg-zinc-700',
    green: active ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' : 'bg-zinc-700',
    red: active ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-zinc-700',
  }
  return (
    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`} />
  )
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Synthwave')
  const [selectedMood, setSelectedMood] = useState('Energetic')
  const [tempo, setTempo] = useState(120)
  const [energy, setEnergy] = useState(70)
  const [complexity, setComplexity] = useState(50)
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [songs, setSongs] = useState<GeneratedSong[]>([])
  const [apiKey, setApiKey] = useState('')
  const [showApiInput, setShowApiInput] = useState(false)
  const waveformInterval = useRef<number | null>(null)
  const [waveformActive, setWaveformActive] = useState(false)

  useEffect(() => {
    if (status === 'generating') {
      setWaveformActive(true)
      waveformInterval.current = window.setInterval(() => {
        setWaveformActive(prev => !prev)
      }, 150)
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 3
        })
      }, 200)

      const timeout = setTimeout(() => {
        setStatus('complete')
        setProgress(100)
        const newSong: GeneratedSong = {
          id: Date.now().toString(),
          title: generateSongTitle(),
          prompt,
          genre: selectedGenre,
          duration: `${Math.floor(Math.random() * 2) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          createdAt: new Date(),
        }
        setSongs(prev => [newSong, ...prev])
        clearInterval(progressInterval)
      }, 8000)

      return () => {
        clearTimeout(timeout)
        clearInterval(progressInterval)
        if (waveformInterval.current) clearInterval(waveformInterval.current)
      }
    } else {
      setWaveformActive(false)
      if (waveformInterval.current) clearInterval(waveformInterval.current)
    }
  }, [status, prompt, selectedGenre])

  const generateSongTitle = () => {
    const adjectives = ['Neon', 'Electric', 'Midnight', 'Golden', 'Crystal', 'Shadow', 'Cosmic', 'Digital']
    const nouns = ['Dreams', 'Horizons', 'Waves', 'Echoes', 'Pulse', 'Storm', 'Journey', 'Light']
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setStatus('generating')
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      <div className="scan-line" />
      
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Main container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <StatusLED key={i} active={status === 'generating'} />
              ))}
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight animate-flicker">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-600">
                SUNO
              </span>
              <span className="text-zinc-400">FORGE</span>
            </h1>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <StatusLED key={i} active={status === 'generating'} />
              ))}
            </div>
          </div>
          <p className="text-zinc-500 font-mono text-sm tracking-wider">
            [ AI-POWERED MUSIC GENERATION CONSOLE ]
          </p>
        </header>

        {/* API Key Section */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowApiInput(!showApiInput)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-700 rounded text-xs text-zinc-400 hover:text-orange-400 hover:border-orange-500/50 transition-all"
          >
            <StatusLED active={!!apiKey} color="green" />
            {apiKey ? 'API KEY CONFIGURED' : 'CONFIGURE API KEY'}
          </button>
        </div>
        
        {showApiInput && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-zinc-900/80 border border-zinc-700 rounded-lg p-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                Suno API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/50 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="mt-2 text-[10px] text-zinc-600">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </div>
        )}

        {/* Main Console */}
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
          {/* Console Header Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">GENERATION MODULE v2.4</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusLED active={status === 'generating'} color="orange" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {status === 'idle' && 'STANDBY'}
                {status === 'generating' && 'PROCESSING'}
                {status === 'complete' && 'READY'}
                {status === 'error' && 'ERROR'}
              </span>
            </div>
          </div>

          {/* Waveform Display */}
          <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">WAVEFORM MONITOR</span>
              <span className="text-[10px] text-orange-500/70 font-mono">
                {status === 'generating' ? `${Math.floor(progress)}%` : '---'}
              </span>
            </div>
            <WaveformVisualizer isActive={waveformActive} />
            {status === 'generating' && (
              <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              SONG DESCRIPTION / LYRICS
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your song... Include lyrics, themes, instrumentation, or any specific details you want..."
              className="w-full h-32 bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-orange-500/50 transition-colors font-mono"
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Genre Selection */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                GENRE
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${
                      selectedGenre === genre
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                MOOD
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${
                      selectedMood === mood
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Knobs Row */}
          <div className="flex justify-center gap-8 md:gap-16 mb-8 py-6 border-y border-zinc-800">
            <Knob label="Tempo" value={tempo} onChange={setTempo} min={60} max={180} />
            <Knob label="Energy" value={energy} onChange={setEnergy} />
            <Knob label="Complexity" value={complexity} onChange={setComplexity} />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={status === 'generating' || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-display font-bold text-lg uppercase tracking-widest transition-all relative overflow-hidden group ${
              status === 'generating'
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-amber-500 text-black hover:from-orange-500 hover:to-amber-400'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {status === 'generating' ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  GENERATING...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  GENERATE SONG
                </>
              )}
            </span>
            {status !== 'generating' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>
        </div>

        {/* Generated Songs */}
        {songs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-zinc-300 mb-4 flex items-center gap-3">
              <StatusLED active color="green" />
              GENERATED TRACKS
            </h2>
            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors group"
                >
                  <button className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-zinc-200 truncate">{song.title}</h3>
                    <p className="text-xs text-zinc-500 truncate">{song.prompt}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500">
                    <span className="px-2 py-1 bg-zinc-800 rounded">{song.genre}</span>
                    <span>{song.duration}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-orange-400 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800/50 text-center">
          <p className="text-[11px] text-zinc-600 tracking-wide">
            Requested by <span className="text-zinc-500">@JolupCCTV</span> · Built by <span className="text-zinc-500">@clonkbot</span>
          </p>
        </footer>
      </div>
    </div>
  )
}