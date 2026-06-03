import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [step, setStep] = useState<'ip' | 'discord' | 'done' | 'failed'>('ip')
  const [ip, setIp] = useState('')

  useEffect(() => {
    if (step !== 'ip') return
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => {
        setIp(d.ip)
        setStep('discord')
      })
      .catch(() => setStep('discord'))
  }, [step])

  return (
    <>
      <div className="Card">
        <div className="card-content">
          {step === 'ip' && (
            <>
              <h1>Verifying</h1>
              <p className="subtitle">Checking your connection...</p>
            </>
          )}
          {step === 'discord' && (
            <>
              <h1>Verify your Discord</h1>
              <p className="subtitle">TODO: implement Discord verification</p>
            </>
          )}
          {step === 'failed' && (
            <>
              <h1>Verification failed</h1>
              <p className="subtitle">Could not verify your Discord account</p>
            </>
          )}
          {step === 'done' && (
            <>
              <h1>You can now continue to the server!</h1>
              <p className="subtitle">Welcome!</p>
            </>
          )}
          {(step === 'ip' || step === 'discord') && (
            <div className="dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
          {step === 'failed' && (
            <button className="retry-btn">Try again</button>
          )}
        </div>
      </div>
      {ip && <p className="footer">IP: {ip}</p>}
    </>
  )
}

export default App