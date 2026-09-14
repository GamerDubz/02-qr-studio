type LogoProps = {
  size?: number
  className?: string
}

/**
 * Original mark for QR Studio: a single QR "finder pattern" corner
 * (the nested ring + solid core found in a QR code's three corner
 * markers) simplified into a two-weight geometric glyph. Legible from
 * favicon scale (16px) up to a full wordmark lockup (512px+).
 */
export function Logo({ size = 24, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="6" />
      <rect x="17" y="17" width="14" height="14" fill="currentColor" />
    </svg>
  )
}
