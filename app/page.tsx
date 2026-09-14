'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type QROptions = {
  content: string
  size: number
  fgColor: string
  bgColor: string
  errorLevel: 'L' | 'M' | 'Q' | 'H'
  margin: number
}

const PRESET_TYPES = [
  { id: 'url', label: 'Website URL', icon: '🌐', placeholder: 'https://yourwebsite.com' },
  { id: 'wifi', label: 'Wi-Fi Network', icon: '📶', placeholder: 'MyHomeWiFi' },
  { id: 'email', label: 'Email Message', icon: '✉️', placeholder: 'founder@example.com' },
  { id: 'phone', label: 'Phone Number', icon: '📞', placeholder: '+1 (555) 234-5678' },
  { id: 'text', label: 'Plain Text', icon: '📝', placeholder: 'Paste any text, secret code, or note here…' },
  { id: 'sms', label: 'SMS Text', icon: '💬', placeholder: '+1 (555) 234-5678' },
]

const DESIGNER_PALETTES = [
  { name: 'Obsidian', fg: '#0F172A', bg: '#FFFFFF' },
  { name: 'Emerald Mint', fg: '#064E3B', bg: '#ECFDF5' },
  { name: 'Royal Indigo', fg: '#1E1B4B', bg: '#EEF2FF' },
  { name: 'Midnight Cyber', fg: '#38BDF8', bg: '#090D16' },
  { name: 'Sunset Ruby', fg: '#9F1239', bg: '#FFF1F2' },
  { name: 'Forest Moss', fg: '#14532D', bg: '#F0FDF4' },
]

// Luminance calculation to alert user if colors lack scannable contrast
function getLuminance(hex: string): number {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)))
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1)
    const l2 = getLuminance(hex2)
    const brightest = Math.max(l1, l2)
    const darkest = Math.min(l1, l2)
    return (brightest + 0.05) / (darkest + 0.05)
  } catch {
    return 21
  }
}

export default function QRStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeType, setActiveType] = useState('url')
  
  // Type-specific field states
  const [urlInput, setUrlInput] = useState('https://github.com')
  const [textInput, setTextInput] = useState('')
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [smsPhone, setSmsPhone] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiAuth, setWifiAuth] = useState('WPA')

  const [opts, setOpts] = useState<QROptions>({
    content: 'https://github.com',
    size: 320,
    fgColor: '#0F172A',
    bgColor: '#FFFFFF',
    errorLevel: 'M',
    margin: 3,
  })

  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Compute final QR content string based on current active type
  const computeContent = useCallback(() => {
    switch (activeType) {
      case 'url':
        return urlInput.trim() || 'https://example.com'
      case 'wifi':
        return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPassword};;`
      case 'email':
        return emailSubject
          ? `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`
          : `mailto:${emailTo}`
      case 'phone':
        return `tel:${phoneInput.replace(/\s+/g, '')}`
      case 'sms':
        return `sms:${smsPhone}${smsMessage ? `?body=${encodeURIComponent(smsMessage)}` : ''}`
      case 'text':
      default:
        return textInput || 'Sample QR Text'
    }
  }, [activeType, urlInput, wifiSsid, wifiPassword, wifiAuth, emailTo, emailSubject, phoneInput, smsPhone, smsMessage, textInput])

  useEffect(() => {
    const calculated = computeContent()
    setOpts((prev) => ({ ...prev, content: calculated }))
  }, [computeContent])

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
    } catch (e) {
      console.error('QR Render error', e)
    } finally {
      setGenerating(false)
    }
  }, [opts])

  useEffect(() => {
    generateQR()
  }, [generateQR])

  const contrast = getContrastRatio(opts.fgColor, opts.bgColor)
  const isContrastGood = contrast >= 3.5

  const downloadImage = (scale = 1) => {
    if (!canvasRef.current) return
    if (scale === 1) {
      const url = canvasRef.current.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-studio-${opts.size}px.png`
      a.click()
    } else {
      // Re-render offscreen at high resolution for Retina export
      const offscreen = document.createElement('canvas')
      import('qrcode').then(({ default: QRCode }) => {
        QRCode.toCanvas(offscreen, opts.content, {
          width: opts.size * scale,
          margin: opts.margin,
          color: { dark: opts.fgColor, light: opts.bgColor },
          errorCorrectionLevel: opts.errorLevel,
        }).then(() => {
          const url = offscreen.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = url
          a.download = `qr-studio-${opts.size * scale}px-retina.png`
          a.click()
        })
      })
    }
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) return
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    } catch {
      alert('Clipboard copy is not supported in this browser.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-emerald-50/30 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-sm shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="6" height="6" x="3" y="3" rx="1" />
                <rect width="6" height="6" x="15" y="3" rx="1" />
                <rect width="6" height="6" x="3" y="15" rx="1" />
                <path d="M15 15h2v2h-2z" fill="currentColor" stroke="none" />
                <path d="M19 19h2v2h-2z" fill="currentColor" stroke="none" />
                <path d="M15 19h2v2h-2z" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                QR <span className="text-emerald-600">Studio</span>
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Vector Grade
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Precision QR code generator with scannability verification & retina export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Generator</span>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-8 flex-1 grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Content Type Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              1. Choose Content Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_TYPES.map((p) => {
                const isActive = activeType === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveType(p.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base mb-1">{p.icon}</span>
                    <span className="truncate w-full text-center text-[11px]">{p.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            {/* Dynamic Content Fields */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              {activeType === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Destination URL</label>
                  <div className="relative flex rounded-xl shadow-sm">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {['https://github.com', 'https://linkedin.com', 'https://youtube.com'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setUrlInput(sample)}
                        className="text-[11px] text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                      >
                        +{sample.replace('https://', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeType === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Network Name (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="e.g. Studio_Guest_5G"
                        className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Password</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="WPA password"
                        className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Encryption</label>
                    <div className="flex gap-2 mt-1">
                      {['WPA', 'WEP', 'nopass'].map((enc) => (
                        <button
                          key={enc}
                          onClick={() => setWifiAuth(enc)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                            wifiAuth === enc ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {enc === 'nopass' ? 'None (Open)' : enc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="support@company.com"
                      className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Default Subject (Optional)</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry from Portfolio"
                      className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeType === 'phone' && (
                <div>
                  <label className="text-xs font-medium text-slate-700">Telephone Number</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                </div>
              )}

              {activeType === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Mobile Number</label>
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Prefilled Message</label>
                    <input
                      type="text"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Hi! Let's connect."
                      className="w-full mt-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {activeType === 'text' && (
                <div>
                  <label className="text-xs font-medium text-slate-700">Text Content</label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter plain text, promo coupon, or instructions..."
                    className="w-full mt-1 rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Style & Palette Customizer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  2. Palette & Appearance
                </label>
                <span className="text-[11px] text-slate-400">Designer curated</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DESIGNER_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    onClick={() => setOpts((o) => ({ ...o, fgColor: pal.fg, bgColor: pal.bg }))}
                    className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 flex flex-col items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <div className="flex w-7 h-7 rounded-lg overflow-hidden border border-slate-300 shadow-inner">
                      <div className="w-1/2 h-full" style={{ background: pal.fg }} />
                      <div className="w-1/2 h-full" style={{ background: pal.bg }} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Pattern (Foreground)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={opts.fgColor}
                    onChange={(e) => setOpts((o) => ({ ...o, fgColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={opts.fgColor}
                    onChange={(e) => setOpts((o) => ({ ...o, fgColor: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Canvas (Background)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={opts.bgColor}
                    onChange={(e) => setOpts((o) => ({ ...o, bgColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={opts.bgColor}
                    onChange={(e) => setOpts((o) => ({ ...o, bgColor: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engine Parameters */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              3. Error Correction & Geometry
            </label>
            <div className="grid sm:grid-cols-4 gap-2">
              {[
                { lvl: 'L' as const, pct: '~7%', desc: 'Compact' },
                { lvl: 'M' as const, pct: '~15%', desc: 'Standard' },
                { lvl: 'Q' as const, pct: '~25%', desc: 'High Quality' },
                { lvl: 'H' as const, pct: '~30%', desc: 'Heavy / Logo' },
              ].map((item) => (
                <button
                  key={item.lvl}
                  onClick={() => setOpts((o) => ({ ...o, errorLevel: item.lvl }))}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    opts.errorLevel === item.lvl
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Level {item.lvl}</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100/60 px-1 rounded">{item.pct}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Render Width</span>
                  <span className="font-mono text-emerald-700 font-semibold">{opts.size}px</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={600}
                  step={20}
                  value={opts.size}
                  onChange={(e) => setOpts((o) => ({ ...o, size: Number(e.target.value) }))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Quiet Zone (Margin)</span>
                  <span className="font-mono text-emerald-700 font-semibold">{opts.margin} blocks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={1}
                  value={opts.margin}
                  onChange={(e) => setOpts((o) => ({ ...o, margin: Number(e.target.value) }))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Preview & Download Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
            {/* Scannability indicator */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Preview
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isContrastGood
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isContrastGood ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isContrastGood ? 'Optimal Contrast' : 'Low Contrast Warning'}
              </span>
            </div>

            {/* Canvas Stage */}
            <div
              className="p-5 rounded-2xl transition-all duration-200 border border-slate-100 shadow-md flex items-center justify-center max-w-full overflow-hidden"
              style={{ backgroundColor: opts.bgColor }}
            >
              <canvas
                ref={canvasRef}
                className="rounded-lg max-w-full h-auto"
                style={{ width: Math.min(opts.size, 300), height: Math.min(opts.size, 300) }}
              />
            </div>

            {/* Payload summary */}
            <div className="w-full mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Embedded Payload
              </span>
              <p className="text-xs font-mono text-slate-700 break-all line-clamp-2">
                {opts.content || 'Empty payload'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-5">
              <button
                onClick={() => downloadImage(1)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => downloadImage(2)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Export Retina (2x)</span>
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full mt-2 py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{copied ? '✓ Copied image to clipboard!' : 'Copy Image to Clipboard'}</span>
            </button>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-3">
            <span className="text-base">💡</span>
            <div>
              <p className="font-semibold text-emerald-900 mb-0.5">High Scannability Tip</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Always ensure a dark pattern on a light background for maximum camera recognition across all mobile device cameras.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
