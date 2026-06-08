// Web Speech API wrapper — Cantonese-first
// Falls back gracefully if browser does not support SpeechRecognition

type SR = any  // SpeechRecognition instance — not in TS lib by default

export function createSpeechController(
  onResult: (text: string, isFinal: boolean) => void,
  onError:  (msg: string) => void
) {
  const w = window as any
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  const supported = !!Ctor

  let rec: SR | null = null
  let listening = false

  if (supported) {
    rec = new Ctor()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'zh-HK'
    rec.maxAlternatives = 1

    rec.onresult = (e: any) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i][0]
        if (r.isFinal) final += r.transcript
        else interim += r.transcript
      }
      const text = (final + interim).trim()
      if (text) onResult(text, final.length > 0)
    }
    rec.onerror = (e: any) => onError(e.error || 'speech error')
    rec.onend   = () => { listening = false }
  }

  return {
    get supported() { return supported },
    get listening() { return listening },
    start() {
      if (!rec) return onError('瀏覽器不支援語音識別')
      try { rec.start(); listening = true } catch (e: any) { onError(e.message) }
    },
    stop() {
      if (!rec) return
      try { rec.stop(); listening = false } catch (e: any) { onError(e.message) }
    },
  }
}
