type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

/** Toggle-switch styled control — reads as a bank of physical selector switches. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`flex min-h-11 items-center gap-1.5 border px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors duration-150 ${
              active
                ? 'border-ink bg-ink text-paper-raised'
                : 'border-line-strong bg-paper-raised text-ink-soft hover:border-ink-soft hover:text-ink'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
