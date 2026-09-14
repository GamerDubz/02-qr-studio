'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Pure JS QR code generation using a simple matrix algorithm
// For a production app, you'd use a package like 'qrcode'
// We'll use a Canvas-based approach with the qrcode library via dynamic import

type QROptions = {
  content: string
  size: number
  fgColor: string
  bgColor: string
  errorLevel: 'L' | 'M' | 'Q' | 'H'
  margin: number
}

const PRESET_TYPES = [
  { label: 'URL', placeholder: 'https://example.com', prefix: '' },
  { label: 'Email', placeholder: 'hello@example.com', prefix: 'mailto:' },
  { label: 'Phone', placeholder: '+1 555 123 4567', prefix: 'tel:' },
  { label: 'SMS', placeholder: '+1 555 123 4567', prefix: 'sms:' },
  { label: 'WiFi', placeholder: 'SSID:password', prefix: 'WIFI:S:' },
  { label: 'Text', placeholder: 'Any text…', prefix: '' },
]

export default function QRStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [opts, setOpts] = useState<QROptions>({
    content: 'https://example.com',
    size: 300,
    fgColor: '#000000',
    bgColor: '#ffffff',
    errorLevel: 'M',
    margin: 4,
  })
  const [presetType, setPresetType] = useState(0)
  const [inputText, setInputText] = useState('https://example.com')
  const [generating, setGenerating] = useState(false)

  const generateQR = useCallback(async () => {
    if (!canvasRef.current || !opts.content.trim()) return
    setGenerating(true)
    try {
      const QRCode = (await import('qrcode')).default
      await QRCode.toCanvas(canvasRef.current, opts.content, {
        width: opts.size,
        margin: opts.margin,
        color: { dark: opts.fgColor, light: opts.bgColor },
        errorCorrectionLevel: opts.errorLevel,
      })
    } catch {
      // Fallback: draw placeholder
      const ctx = canvasRef.current.getContext('2d')!
      ctx.fillStyle = opts.bgColor
      ctx.fillRect(0, 0, opts.size, opts.size)
      ctx.fillStyle = opts.fgColor
      ctx.font = `${opts.size * 0.04}px system-ui`
      ctx.textAlign = 'center'
      ctx.fillText('Install: npm install qrcode', opts.size / 2, opts.size / 2)
    }
    setGenerating(false)
  }, [opts])

  useEffect(() => { generateQR() }, [generateQR])

  const handleInput = (text: string) => {
    setInputText(text)
    const prefix = PRESET_TYPES[presetType].prefix
    setOpts((o) => ({ ...o, content: prefix ? `${prefix}${text}` : text }))
  }

  const download = useCallback((format: 'png' | 'svg') => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL(`image/${format}`)
    const a = document.createElement('a')
    a.href = url; a.download = `qrcode.${format}`; a.click()
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-neutral-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">QR Studio</h1>
          <p className="text-sm text-neutral-500">Custom QR code generator with colors, styles, and instant download</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="space-y-5">
            {/* Content type */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Content Type</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TYPES.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => { setPresetType(i); setInputText('') }}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${presetType === i ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 border border-[#2e2e2e]'}`}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            {/* Content input */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2" htmlFor="qr-content">Content</label>
              <textarea
                id="qr-content"
                value={inputText}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={PRESET_TYPES[presetType].placeholder}
                className="w-full h-24 bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-neutral-200 resize-none outline-none focus:border-blue-500"
                aria-label="QR code content"
              />
              {PRESET_TYPES[presetType].prefix && (
                <p className="text-xs text-neutral-600 mt-1">Prefix: <code>{PRESET_TYPES[presetType].prefix}</code></p>
              )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Foreground', key: 'fgColor' as const },
                { label: 'Background', key: 'bgColor' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs text-neutral-500 mb-2">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={opts[key]} onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.value }))} className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer" aria-label={label} />
                    <input type="text" value={opts[key]} onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.value }))} className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded px-2 py-1.5 text-xs font-mono text-neutral-300 outline-none focus:border-blue-500" aria-label={`${label} hex`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Size & margin */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Size: {opts.size}px</label>
                <input type="range" min={100} max={600} step={50} value={opts.size} onChange={(e) => setOpts((o) => ({ ...o, size: Number(e.target.value) }))} className="w-full accent-blue-500" aria-label="QR size" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Margin: {opts.margin}</label>
                <input type="range" min={0} max={10} value={opts.margin} onChange={(e) => setOpts((o) => ({ ...o, margin: Number(e.target.value) }))} className="w-full accent-blue-500" aria-label="QR margin" />
              </div>
            </div>

            {/* Error correction */}
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Error Correction</label>
              <div className="flex gap-1.5">
                {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                  <button key={lvl} onClick={() => setOpts((o) => ({ ...o, errorLevel: lvl }))} className={`flex-1 py-2 rounded text-xs font-bold transition-colors ${opts.errorLevel === lvl ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 border border-[#2e2e2e]'}`}>
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-700 mt-1.5">L=7% · M=15% · Q=25% · H=30% data recovery</p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-2xl p-4 border border-[#2e2e2e]"
              style={{ background: opts.bgColor }}
              aria-label="QR code preview"
            >
              <canvas
                ref={canvasRef}
                width={opts.size}
                height={opts.size}
                className="block max-w-full"
                aria-label="Generated QR code"
              />
            </div>

            {generating && <p className="text-xs text-neutral-500 animate-pulse">Generating…</p>}

            <div className="flex gap-3">
              <button onClick={() => download('png')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
                Download PNG
              </button>
              <button
                onClick={() => {
                  if (!canvasRef.current) return
                  navigator.clipboard.writeText(opts.content).then(() => alert('Content copied!')).catch(() => {})
                }}
                className="px-5 py-2.5 bg-[#1a1a1a] border border-[#2e2e2e] hover:border-[#444] text-neutral-300 text-sm rounded-lg transition-colors"
              >
                Copy Content
              </button>
            </div>

            <p className="text-xs text-neutral-600 text-center">
              Note: QR generation requires <code className="bg-[#1a1a1a] px-1 rounded">npm install qrcode</code><br />
              in the <code>02-qr-studio</code> directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
