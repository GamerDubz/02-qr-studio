'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link2, Mail, Phone, MessageSquare, Wifi, Type, Download, Copy, Check } from 'lucide-react'
import { Section } from './section'
import { SegmentedControl } from './segmented-control'
import { ERROR_LEVELS, PRESET_TYPES, type ErrorLevel, type QROptions } from './types'

const PRESET_ICONS = [Link2, Mail, Phone, MessageSquare, Wifi, Type]

const COLOR_FIELDS = [
  { label: 'Foreground', key: 'fgColor' as const },
  { label: 'Background', key: 'bgColor' as const },
]

type ReadoutStats = {
  version: number
  moduleCount: number
  byteLength: number
}

export function QRStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [opts, setOpts] = useState<QROptions>({
    content: 'https://example.com',
    size: 300,
    fgColor: '#16211d',
    bgColor: '#ffffff',
    errorLevel: 'M',
    margin: 4,
  })
  const [presetType, setPresetType] = useState(0)
  const [inputText, setInputText] = useState('https://example.com')
  const [generating, setGenerating] = useState(false)
  const [stats, setStats] = useState<ReadoutStats | null>(null)
  const [copied, setCopied] = useState(false)

  const generateQR = useCallback(async () => {
    if (!canvasRef.current || !opts.content.trim()) {
      setStats(null)
      return
    }
    setGenerating(true)
    try {
      const QRCode = (await import('qrcode')).default
      await QRCode.toCanvas(canvasRef.current, opts.content, {
        width: opts.size,
        margin: opts.margin,
        color: { dark: opts.fgColor, light: opts.bgColor },
        errorCorrectionLevel: opts.errorLevel,
      })
      const data = QRCode.create(opts.content, { errorCorrectionLevel: opts.errorLevel })
      setStats({
        version: data.version,
        moduleCount: data.modules.size,
        byteLength: new TextEncoder().encode(opts.content).length,
      })
    } catch {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.fillStyle = opts.bgColor
        ctx.fillRect(0, 0, opts.size, opts.size)
        ctx.fillStyle = opts.fgColor
        ctx.font = `${opts.size * 0.04}px ${'monospace'}`
        ctx.textAlign = 'center'
        ctx.fillText('Unable to encode content', opts.size / 2, opts.size / 2)
      }
      setStats(null)
    }
    setGenerating(false)
  }, [opts])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      generateQR()
    })
    return () => cancelAnimationFrame(frame)
  }, [generateQR])

  const handlePresetChange = (index: number) => {
    setPresetType(index)
    setInputText('')
    setOpts((o) => ({ ...o, content: '' }))
  }

  const handleInput = (text: string) => {
    setInputText(text)
    const prefix = PRESET_TYPES[presetType].prefix
    setOpts((o) => ({ ...o, content: prefix ? `${prefix}${text}` : text }))
  }

  const download = useCallback((format: 'png') => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL(`image/${format}`)
    const a = document.createElement('a')
    a.href = url
    a.download = `qrcode.${format}`
    a.click()
  }, [])

  const copyContent = useCallback(() => {
    if (!opts.content) return
    navigator.clipboard
      .writeText(opts.content)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => {})
  }, [opts.content])

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
      {/* Control column */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <Section index="01" title="Content">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESET_TYPES.map((p, i) => {
              const Icon = PRESET_ICONS[i]
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={presetType === i}
                  onClick={() => handlePresetChange(i)}
                  className={`flex min-h-11 items-center gap-1.5 border px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors duration-150 ${
                    presetType === i
                      ? 'border-ink bg-ink text-paper-raised'
                      : 'border-line-strong bg-paper-raised text-ink-soft hover:border-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {p.label}
                </button>
              )
            })}
          </div>

          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-ink-mute" htmlFor="qr-content">
            Payload
          </label>
          <textarea
            id="qr-content"
            value={inputText}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={PRESET_TYPES[presetType].placeholder}
            className="h-24 w-full resize-none border border-line-strong bg-paper-raised px-3 py-2.5 text-base text-ink outline-none placeholder:text-ink-mute/60 focus:border-accent"
            aria-label="QR code content"
          />
          {PRESET_TYPES[presetType].prefix && (
            <p className="mt-1.5 font-mono text-xs text-ink-mute">
              prefix&nbsp;
              <span className="text-ink-soft">{PRESET_TYPES[presetType].prefix}</span>
            </p>
          )}
        </Section>

        <Section index="02" title="Appearance">
          <div className="grid grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ label, key }) => (
              <div key={key}>
                <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-ink-mute">
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={opts[key]}
                    onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.value }))}
                    className="h-11 w-11 shrink-0 border border-line-strong"
                    aria-label={`${label} colour`}
                  />
                  <input
                    type="text"
                    value={opts[key]}
                    onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.value }))}
                    className="min-w-0 flex-1 border border-line-strong bg-paper-raised px-2 py-2.5 font-mono text-xs uppercase text-ink-soft outline-none focus:border-accent"
                    aria-label={`${label} hex value`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section index="03" title="Geometry">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-wide text-ink-mute">
                <span>Size</span>
                <span className="text-ink-soft">{opts.size}px</span>
              </label>
              <input
                type="range"
                min={100}
                max={600}
                step={50}
                value={opts.size}
                onChange={(e) => setOpts((o) => ({ ...o, size: Number(e.target.value) }))}
                aria-label="QR size in pixels"
              />
            </div>
            <div>
              <label className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-wide text-ink-mute">
                <span>Margin</span>
                <span className="text-ink-soft">{opts.margin}</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={opts.margin}
                onChange={(e) => setOpts((o) => ({ ...o, margin: Number(e.target.value) }))}
                aria-label="QR quiet-zone margin"
              />
            </div>
          </div>
        </Section>

        <Section index="04" title="Error correction" hint={`${ERROR_LEVELS.find((l) => l.level === opts.errorLevel)?.recovery}% recovery`}>
          <SegmentedControl<ErrorLevel>
            ariaLabel="Error correction level"
            value={opts.errorLevel}
            onChange={(level) => setOpts((o) => ({ ...o, errorLevel: level }))}
            options={ERROR_LEVELS.map(({ level, recovery }) => ({
              value: level,
              label: `${level} · ${recovery}%`,
            }))}
          />
          <p className="mt-2 font-mono text-xs text-ink-mute">
            Higher levels tolerate more damage or a printed logo, at the cost of a denser code.
          </p>
        </Section>
      </div>

      {/* Proofing column */}
      <div className="flex flex-col items-center gap-6 pt-2">
        <div className="relative">
          {/* registration marks */}
          <span aria-hidden="true" className="absolute -left-3 -top-3 h-3 w-3 border-l-2 border-t-2 border-ink-soft" />
          <span aria-hidden="true" className="absolute -right-3 -top-3 h-3 w-3 border-r-2 border-t-2 border-ink-soft" />
          <span aria-hidden="true" className="absolute -bottom-3 -left-3 h-3 w-3 border-b-2 border-l-2 border-ink-soft" />
          <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-3 w-3 border-b-2 border-r-2 border-ink-soft" />

          <div
            className="border border-line-strong p-6 shadow-[8px_8px_0_0_rgba(22,33,29,0.06)]"
            style={{ background: opts.bgColor }}
          >
            <canvas
              ref={canvasRef}
              width={opts.size}
              height={opts.size}
              className="block max-w-full"
              role="img"
              aria-label="Generated QR code preview"
            />
          </div>

          <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute">
            Proof {generating && <span className="text-accent">{'· rendering'}</span>}
          </p>
        </div>

        {/* technical readout strip */}
        <dl className="grid w-full max-w-md grid-cols-4 divide-x divide-line border border-line-strong bg-paper-raised font-mono text-xs">
          <div className="px-3 py-2.5">
            <dt className="text-ink-mute">VER</dt>
            <dd className="mt-0.5 text-ink-soft">{stats ? stats.version : '—'}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="text-ink-mute">MODULES</dt>
            <dd className="mt-0.5 text-ink-soft">{stats ? `${stats.moduleCount}²` : '—'}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="text-ink-mute">BYTES</dt>
            <dd className="mt-0.5 text-ink-soft">{stats ? stats.byteLength : '—'}</dd>
          </div>
          <div className="px-3 py-2.5">
            <dt className="text-ink-mute">ECC</dt>
            <dd className="mt-0.5 text-ink-soft">{opts.errorLevel}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => download('png')}
            className="flex min-h-11 items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper-raised transition-colors duration-150 hover:bg-accent-strong hover:border-accent-strong"
          >
            <Download size={16} aria-hidden="true" />
            Download PNG
          </button>
          <button
            type="button"
            onClick={copyContent}
            className="flex min-h-11 items-center gap-2 border border-line-strong bg-paper-raised px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:border-ink-soft hover:text-ink"
          >
            {copied ? <Check size={16} aria-hidden="true" className="text-accent" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy content'}
          </button>
        </div>
      </div>
    </div>
  )
}
