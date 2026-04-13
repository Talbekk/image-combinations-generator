import styles from './CheckboxGroup.module.css'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface CheckboxGroupProps<T extends string | number> {
  label:    string
  options:  Option<T>[]
  selected: Set<T>
  onChange: (next: Set<T>) => void
}

export function CheckboxGroup<T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: CheckboxGroupProps<T>) {
  const toggle = (value: T) => {
    const next = new Set(selected)
    if (next.has(value)) next.delete(value)
    else                 next.add(value)
    onChange(next)
  }

  const allSelected  = options.every(o => selected.has(o.value))
  const noneSelected = options.every(o => !selected.has(o.value))

  const toggleAll = () => {
    if (allSelected) onChange(new Set())
    else             onChange(new Set(options.map(o => o.value)))
  }

  return (
    <div className={styles.group}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button
          className={styles.toggleAll}
          onClick={toggleAll}
          type="button"
        >
          {allSelected ? 'Deselect all' : noneSelected ? 'Select all' : 'Select all'}
        </button>
      </div>
      <div className={styles.options}>
        {options.map(opt => (
          <label key={String(opt.value)} className={styles.option}>
            <input
              type="checkbox"
              checked={selected.has(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
