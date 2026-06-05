import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './utils/supabase'

function hashIP(ip: string): Promise<string> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip))
    .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''))
}

function App() {
  const [step, setStep] = useState<'ip' | 'working' | 'done' | 'failed'>('ip')
  const [ip, setIp] = useState('')
  const [failReason, setFailReason] = useState('')
  const [statusText, setStatusText] = useState('')

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
      setFailReason('No verification token found')
      setStep('failed')
      return
    }

    setStatusText('Hashing your IP...')
    hashIP(ip).then(ipHash => {
      setStatusText('Validating your token...')
      supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .single()
        .then(({ data: row, error }) => {
          if (error || !row) {
            console.error('Token not found:', error)
            setFailReason('Invalid or expired token')
            setStep('failed')
            return
          }
          if (row.verified) {
            setStatusText('')
            console.error('Already verified!')
            setFailReason('Already verified!')
            setStep('failed')
            return
          }

          setStatusText('Checking for duplicate IPs...')
          supabase
            .from('verification_tokens')
            .select('user_id')
            .eq('ip', ipHash)
            .eq('verified', true)
            .then(({ data: dupes, error: dupError }) => {
              if (dupError) {
                console.error('IP check error:', dupError)
                setFailReason('Something went wrong')
                setStep('failed')
                return
              }
              if (dupes && dupes.length > 0) {
                setStatusText('')
                console.error('Duplicate IP detected')
                setFailReason('This IP has already been used to verify')
                setStep('failed')
                return
              }

              setStatusText('Writing your verification...')
              supabase
                .from('verification_tokens')
                .update({ ip: ipHash, verified: true })
                .eq('token', token)
                .then(({ error: updateError }) => {
                  if (updateError) {
                    console.error('Supabase update error:', updateError)
                    setFailReason('Something went wrong')
                    setStep('failed')
                  } else {
                    setStep('done')
                  }
                })
            })
        })
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
              <p className="subtitle">{statusText || ' working...'}</p>
            </>
          )}
          {step === 'failed' && (
            <>
              <h1>Verification failed</h1>
              <p className="subtitle">{failReason || 'Failed to verify, dm the server owner or open a ticket!'}</p>
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
    </>
  )
}

export default App
