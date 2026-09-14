import { Logo } from '@/components/logo'
import { QRStudio } from '@/components/qr-studio/qr-studio'

export default function Home() {
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-paper-raised focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 border-b border-line-strong bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <Logo size={26} className="text-ink" />
            <div className="leading-tight">
              <p className="font-mono text-sm font-semibold tracking-[0.08em] text-ink">QR STUDIO</p>
              <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute sm:block">
                Precision code composer
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 border border-line-strong px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Spec ISO/IEC 18004
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <p className="mb-10 max-w-2xl text-base leading-relaxed text-ink-soft">
          Compose a QR code, adjust its geometry and error tolerance, and proof the result before
          you export. Every change renders live on the plate to the right.
        </p>
        <QRStudio />
      </main>

      <footer className="border-t border-line-strong">
        <div className="mx-auto max-w-6xl px-6 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute md:px-10">
          QR Studio &mdash; encoded and rendered entirely in your browser
        </div>
      </footer>
    </div>
  )
}
