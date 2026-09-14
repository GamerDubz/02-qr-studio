export type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

export type QROptions = {
  content: string
  size: number
  fgColor: string
  bgColor: string
  errorLevel: ErrorLevel
  margin: number
}

export type ContentPreset = {
  label: string
  placeholder: string
  prefix: string
}

export const PRESET_TYPES: ContentPreset[] = [
  { label: 'URL', placeholder: 'https://example.com', prefix: '' },
  { label: 'Email', placeholder: 'hello@example.com', prefix: 'mailto:' },
  { label: 'Phone', placeholder: '+1 555 123 4567', prefix: 'tel:' },
  { label: 'SMS', placeholder: '+1 555 123 4567', prefix: 'sms:' },
  { label: 'WiFi', placeholder: 'SSID:password', prefix: 'WIFI:S:' },
  { label: 'Text', placeholder: 'Any text…', prefix: '' },
]

export const ERROR_LEVELS: { level: ErrorLevel; recovery: number; label: string }[] = [
  { level: 'L', recovery: 7, label: 'Low' },
  { level: 'M', recovery: 15, label: 'Medium' },
  { level: 'Q', recovery: 25, label: 'Quartile' },
  { level: 'H', recovery: 30, label: 'High' },
]
