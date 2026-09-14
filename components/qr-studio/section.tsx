type SectionProps = {
  index: string
  title: string
  hint?: string
  children: React.ReactNode
}

/** A single spec-sheet style panel in the control column, numbered like a drawing note. */
export function Section({ index, title, hint, children }: SectionProps) {
  return (
    <section className="border-b border-line pb-6 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="flex items-baseline gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-mute">
          <span className="text-accent">{index}</span>
          {title}
        </h2>
        {hint && <span className="font-mono text-[10px] text-ink-mute/80">{hint}</span>}
      </div>
      {children}
    </section>
  )
}
