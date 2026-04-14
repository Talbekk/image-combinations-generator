import type { ShapeName, ColourName, CardDimensions } from '../types'

export const COLOUR_MAP: Record<ColourName, string> = {
  red:    '#E8302A',
  green:  '#2EAA4A',
  blue:   '#2A6EE8',
  yellow: '#F5C800',
  orange: '#F47B20',
  purple: '#7B3FC4',
  pink:   '#E84FA0',
  teal:   '#1AA89A',
  black:  '#222222',
  brown:  '#8B5E3C',
}

/**
 * Draw a single shape centred at (cx, cy) with the given size and colour.
 * All shapes fit within a bounding box of `size × size`.
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeName,
  cx: number,
  cy: number,
  size: number,
  colour: string
): void {
  const r = size / 2
  ctx.fillStyle = colour
  ctx.beginPath()

  switch (shape) {
    case 'circle': {
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      break
    }

    case 'diamond': {
      // Slightly taller than wide to match reference cards
      const hw = r * 0.82
      const hh = r
      ctx.moveTo(cx,      cy - hh)
      ctx.lineTo(cx + hw, cy)
      ctx.lineTo(cx,      cy + hh)
      ctx.lineTo(cx - hw, cy)
      ctx.closePath()
      break
    }

    case 'triangle': {
      // Equilateral-ish, pointing up, matching reference cards
      const tw = r * 1.8
      const th = r * 1.7
      ctx.moveTo(cx,           cy - th / 2)
      ctx.lineTo(cx + tw / 2,  cy + th / 2)
      ctx.lineTo(cx - tw / 2,  cy + th / 2)
      ctx.closePath()
      break
    }

    case 'star': {
      const outerR = r
      const innerR = r * 0.42
      const points = 5
      for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI / points) * i - Math.PI / 2
        const rad   = i % 2 === 0 ? outerR : innerR
        const x     = cx + rad * Math.cos(angle)
        const y     = cy + rad * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }

    case 'square': {
      ctx.rect(cx - r, cy - r, size, size)
      break
    }

    case 'heart': {
      const s = r * 1.25
      ctx.moveTo(cx, cy + s * 0.9)
      ctx.bezierCurveTo(
        cx - s * 1.2, cy + s * 0.4,
        cx - s * 1.2, cy - s * 1.1,
        cx,           cy - s * 0.4
      )
      ctx.bezierCurveTo(
        cx + s * 1.2, cy - s * 1.1,
        cx + s * 1.2, cy + s * 0.4,
        cx,           cy + s * 0.9
      )
      ctx.closePath()
      break
    }
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }

    case 'pentagon': {
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }

  case 'rectangle': {
    const h = size * 0.6
    ctx.rect(cx - r, cy - h / 2, size, h)
    break
  }

    case 'oval': {
      ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2)
      break
    }

  }

  ctx.fill()
}

/**
 * Draw a rounded-rect card background with a thin border.
 */
function drawCardBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const radius = Math.min(w, h) * 0.07
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(w - radius, 0)
  ctx.arcTo(w, 0,  w, radius,     radius)
  ctx.lineTo(w, h - radius)
  ctx.arcTo(w, h,  w - radius, h, radius)
  ctx.lineTo(radius, h)
  ctx.arcTo(0, h,  0, h - radius, radius)
  ctx.lineTo(0, radius)
  ctx.arcTo(0, 0,  radius, 0,     radius)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#cccccc'
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Render a single card to a canvas and return the data URL as a JPEG.
 */
export function renderCardToDataUrl(
  canvas: HTMLCanvasElement,
  shape: ShapeName,
  colour: ColourName,
  count: number,
  dims: CardDimensions
): string {
  const { width: w, height: h, quality } = dims
  canvas.width  = w
  canvas.height = h

  const ctx = canvas.getContext('2d')!
  drawCardBackground(ctx, w, h)

  const hexColour = COLOUR_MAP[colour]

  // Vertical distribution: divide usable height evenly among `count` slots
  const paddingY  = h * 0.1
  const usableH   = h - paddingY * 2
  const slotH     = usableH / count
  const cx        = w / 2
  const maxFromSlot  = slotH * 0.72   // shape can use 72% of its vertical slot
  const maxFromWidth = w * 0.70        // but never wider than 70% of the card
  const shapeSize    = Math.min(maxFromSlot, maxFromWidth)

  for (let i = 0; i < count; i++) {
    const cy = paddingY + slotH * i + slotH / 2
    drawShape(ctx, shape, cx, cy, shapeSize, hexColour)
  }

  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Build a filename for a card: e.g. "2_green_triangle.jpg"
 */
function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function buildFilename(count: number, colour: ColourName, shape: ShapeName): string {
  return `${count}${titleCase(colour)}${titleCase(shape)}.jpg`
}
