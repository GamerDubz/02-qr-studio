import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7f6',
        }}
      >
        <svg width="132" height="132" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="40" height="40" rx="2" stroke="#16211d" strokeWidth="6" />
          <rect x="17" y="17" width="14" height="14" fill="#0c9a83" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
