import React, { useState, useMemo } from 'react'
import { CheckboxGroup }  from './components/CheckboxGroup'
import { CardPreview }    from './components/CardPreview'
import { generateAndDownloadZip } from './lib/zip'
import type { ShapeName, ColourName, Count, CardDimensions } from './types'
import { COLOUR_MAP } from './lib/renderer'
import styles from './App.module.css'

// ── option lists ──────────────────────────────────────────────────────────────

const SHAPE_OPTIONS: { value: ShapeName; label: string }[] = [
  { value: 'circle',   label: 'Circle'   },
  { value: 'diamond',  label: 'Diamond'  },
  { value: 'triangle', label: 'Triangle' },
  { value: 'star',     label: 'Star'     },
  { value: 'square',   label: 'Square'   },
  { value: 'heart',    label: 'Heart'    },
  { value: 'hexagon',  label: 'Hexagon'  },
  { value: 'pentagon', label: 'Pentagon' },
]

const COLOUR_OPTIONS: { value: ColourName; label: string }[] = [
  { value: 'red',    label: 'Red'    },
  { value: 'green',  label: 'Green'  },
  { value: 'blue',   label: 'Blue'   },
  { value: 'yellow', label: 'Yellow' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink',   label: 'Pink'   },
  { value: 'teal',   label: 'Teal'   },
  { value: 'black',  label: 'Black'  },
  { value: 'brown',  label: 'Brown'  },
]

const COUNT_OPTIONS: { value: Count; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
]

// ── defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SHAPES:   Set<ShapeName>  = new Set(['circle', 'diamond', 'triangle'])
const DEFAULT_COLOURS:  Set<ColourName> = new Set(['red', 'green', 'blue'])
const DEFAULT_COUNTS:   Set<Count>      = new Set([1, 2, 3])
const DEFAULT_DIMS: CardDimensions = { width: 200, height: 340, quality: 0.92 }

// ── component ─────────────────────────────────────────────────────────────────

type GenerateStatus = 'idle' | 'running' | 'done'

export default function App() {
  const [shapes,  setShapes]  = useState<Set<ShapeName>>(DEFAULT_SHAPES)
  const [colours, setColours] = useState<Set<ColourName>>(DEFAULT_COLOURS)
  const [counts,  setCounts]  = useState<Set<Count>>(DEFAULT_COUNTS)
  const [dims,    setDims]    = useState<CardDimensions>(DEFAULT_DIMS)

  const [status,   setStatus]   = useState<GenerateStatus>('idle')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const totalCards = useMemo(
    () => shapes.size * colours.size * counts.size,
    [shapes, colours, counts]
  )

  // Pick a handful of combos to show as preview tiles
  const previewCombos = useMemo<Array<[ShapeName, ColourName, Count]>>(() => {
    const s = [...shapes].slice(0, 2)
    const c = [...colours].slice(0, 2)
    const n = [...counts].slice(0, 1) as Count[]
    const out: Array<[ShapeName, ColourName, Count]> = []
    for (const shape of s) for (const colour of c) for (const count of n) {
      out.push([shape, colour, count])
      if (out.length >= 4) return out
    }
    return out
  }, [shapes, colours, counts])

  const handleGenerate = async () => {
    if (!shapes.size || !colours.size || !counts.size) return
    setStatus('running')
    setProgress({ done: 0, total: totalCards })
    await generateAndDownloadZip({
      shapes:  [...shapes],
      colours: [...colours],
      counts:  [...counts] as Count[],
      dims,
      onProgress: (done, total) => setProgress({ done, total }),
    })
    setStatus('done')
  }

  const updateDim = (key: keyof CardDimensions, raw: string) => {
    const val = parseFloat(raw)
    if (isNaN(val)) return
    setDims(prev => ({ ...prev, [key]: key === 'quality' ? val / 100 : val }))
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h1 className={styles.title}>Card Generator</h1>

        <CheckboxGroup
          label="Shapes"
          options={SHAPE_OPTIONS}
          selected={shapes}
          onChange={setShapes as (s: Set<ShapeName>) => void}
        />

        <CheckboxGroup
          label="Colours"
          options={COLOUR_OPTIONS}
          selected={colours}
          onChange={setColours as (s: Set<ColourName>) => void}
        />

        <CheckboxGroup
          label="Count"
          options={COUNT_OPTIONS}
          selected={counts}
          onChange={setCounts as (s: Set<Count>) => void}
        />

        <div className={styles.dimSection}>
          <span className={styles.dimLabel}>Card dimensions &amp; quality</span>
          <div className={styles.dimRow}>
            <div className={styles.dimField}>
              <label>Width (px)</label>
              <input
                type="number"
                value={dims.width}
                min={50} max={1000} step={10}
                onChange={e => updateDim('width', e.target.value)}
              />
            </div>
            <div className={styles.dimField}>
              <label>Height (px)</label>
              <input
                type="number"
                value={dims.height}
                min={50} max={2000} step={10}
                onChange={e => updateDim('height', e.target.value)}
              />
            </div>
            <div className={styles.dimField}>
              <label>Quality (1–100)</label>
              <input
                type="number"
                value={Math.round(dims.quality * 100)}
                min={1} max={100}
                onChange={e => updateDim('quality', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.generateArea}>
          <p className={styles.countLabel}>
            {totalCards} image{totalCards !== 1 ? 's' : ''} will be generated
          </p>
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={status === 'running' || totalCards === 0}
          >
            {status === 'running' ? 'Generating…' : 'Generate & download ZIP'}
          </button>

          {status === 'running' && progress && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          )}

          {status === 'done' && (
            <p className={styles.doneMsg}>
              Done! {progress?.total} images saved to cards.zip
            </p>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <h2 className={styles.previewTitle}>Preview</h2>
        {previewCombos.length === 0 ? (
          <p className={styles.emptyMsg}>Select at least one shape, colour, and count to see a preview.</p>
        ) : (
          <div className={styles.previewGrid}>
            {previewCombos.map(([shape, colour, count]) => (
              <CardPreview
                key={`${shape}-${colour}-${count}`}
                shape={shape}
                colour={colour}
                count={count}
                dims={dims}
                displayWidth={120}
              />
            ))}
          </div>
        )}

        <div className={styles.colourSwatches}>
          <h2 className={styles.previewTitle}>Colour palette</h2>
          <div className={styles.swatchGrid}>
            {COLOUR_OPTIONS.map(opt => (
              <div key={opt.value} className={styles.swatch}>
                <div
                  className={styles.swatchDot}
                  style={{ background: COLOUR_MAP[opt.value] }}
                />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
