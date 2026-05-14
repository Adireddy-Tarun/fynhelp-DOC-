import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DEMO_PASSWORD = 'fynhelp2026' // Change this

export function DemoLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem('demo_access', 'true')
      navigate('/demo/onboarding')
    } else {
      setError('Wrong password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1412] to-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#C41E1E]/10 rounded-full flex items-center justify-center">
            <Lock size={40} className="text-[#C41E1E]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-georgia font-bold text-white text-center mb-4">
          FynHelp Demo
        </h1>
        <p className="text-white/70 text-center mb-8">
          Password-protected internal demo
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#C41E1E]"
              autoFocus
            />

            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-[#C41E1E] text-white font-bold rounded-lg hover:opacity-90"
            >
              Access Demo →
            </button>
          </div>
        </form>

        <p className="text-white/50 text-sm text-center mt-8">
          Internal use only • Confidential
        </p>
      </div>
    </div>
  )
}

export default DemoLogin
