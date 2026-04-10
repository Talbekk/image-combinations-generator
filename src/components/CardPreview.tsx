import React, { useRef, useEffect } from 'react'
import type { ShapeName, ColourName, CardDimensions } from '../types'
import { renderCardToDataUrl } from '../lib/renderer'

interface CardPreviewProps {
  shape:   ShapeName
  colour:  ColourName
  count:   number
  dims:    CardDimensions
  /** Display width in px — the canvas is scaled down visually */
  displayWidth?: number
}

export function CardPreview({ shape, colour, count, dims, displayWidth = 100 }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderCardToDataUrl(canvas, shape, colour, count, dims)
  }, [shape, colour, count, dims])

  const aspectRatio = dims.height / dims.width
  const displayHeight = displayWidth * aspectRatio

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          width:  displayWidth,
          height: displayHeight,
          borderRadius: 6,
          border: '1px solid #e0e0e0',
          display: 'block',
        }}
      />
      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
        {count}× {colour} {shape}
      </p>
    </div>
  )
}
