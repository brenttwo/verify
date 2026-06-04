import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './utils/supabase'

function App() {
  const [step, setStep] = useState<'ip' | 'working' | 'done' | 'failed'>('ip')
  const [ip, setIp] = useState('')

  useEffect(() => {
    if (step !== 'ip') return
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => {
        setIp(d.ip)
        setStep('working')
      })
      .catch(() => setStep('failed'))
  }, [step])

  useEffect(() => {
    if (step !== 'working') return

    const token = new URLSearchParams(location.search).get('token')
    if (!token) {
      setStep('failed')
      return
    }

    supabase
      .from('verification_tokens')
      .update({ ip, verified: true })
      .eq('token', token)
      .eq('verified', false)
      .then(({ error }) => {
        if (error) {
          setStep('failed')
        } else {
          setStep('done')
        }
      })
  }, [step, ip])

  return (
    <>
      <div className="Card">
        <div className="card-content">
          {step === 'ip' && (
            <>
              <h1>Grabbing your ip</h1>
              <p className="subtitle">You can request to delete this. We never sell your data cause</p>
            </>
          )}
          {step === 'working' && (
            <>
              <h1>Verifying you rn</h1>
              <p className="subtitle">hold on</p>
            </>
          )}
          {step === 'failed' && (
            <>
              <h1>Verification failed</h1>
              <p className="subtitle">Failed to verify, dm the server owner or open a ticket!</p>
            </>
          )}
          {step === 'done' && (
            <>
              <h1>You can now continue to the server!</h1>
              <p className="subtitle">You can close this tab!</p>
            </>
          )}
          {(step === 'ip' || step === 'working') && (
            <div className="dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          {step === 'failed' && (
            <button className="retry-btn" onClick={() => setStep('ip')}>Try again</button>
          )}
        </div>
      </div>
      {ip && <p className="footer">IP: {ip}</p>}
    </>
  )
}

export default App
