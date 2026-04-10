import JSZip from 'jszip'
import type { ShapeName, ColourName, Count, CardDimensions } from '../types'
import { renderCardToDataUrl, buildFilename } from './renderer'

export interface GenerateAllOptions {
  shapes:   ShapeName[]
  colours:  ColourName[]
  counts:   Count[]
  dims:     CardDimensions
  onProgress?: (done: number, total: number) => void
}

/**
 * Generate all card combinations, pack them into a ZIP, and trigger a download.
 */
export async function generateAndDownloadZip(opts: GenerateAllOptions): Promise<void> {
  const { shapes, colours, counts, dims, onProgress } = opts

  const zip     = new JSZip()
  const canvas  = document.createElement('canvas')
  const combos: Array<[ShapeName, ColourName, Count]> = []

  for (const shape  of shapes)  {
    for (const colour of colours) {
      for (const count  of counts)  {
        combos.push([shape, colour, count])
      }
    }
  }

  for (let i = 0; i < combos.length; i++) {
    const [shape, colour, count] = combos[i]
    const dataUrl  = renderCardToDataUrl(canvas, shape, colour, count, dims)
    const base64   = dataUrl.split(',')[1]
    const filename = buildFilename(count, colour, shape)
    zip.file(filename, base64, { base64: true })

    onProgress?.(i + 1, combos.length)

    // Yield to the browser every 10 images to keep the UI responsive
    if (i % 10 === 9) {
      await new Promise<void>(resolve => setTimeout(resolve, 0))
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'cards.zip'
  a.click()
  URL.revokeObjectURL(url)
}
