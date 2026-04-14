export type ShapeName =
  | 'circle'
  | 'diamond'
  | 'triangle'
  | 'star'
  | 'square'
  | 'heart'
  | 'hexagon'
  | 'pentagon'
  | 'rectangle'
  | 'oval'

export type ColourName =
  | 'red'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'teal'
  | 'black'
  | 'brown'

export type Count = 1 | 2 | 3 | 4

export interface CardConfig {
  shape: ShapeName
  colour: ColourName
  count: Count
}

export interface CardDimensions {
  width: number
  height: number
  quality: number // 0–1 for JPEG
}

export interface GeneratorState {
  selectedShapes: Set<ShapeName>
  selectedColours: Set<ColourName>
  selectedCounts: Set<Count>
  dimensions: CardDimensions
}
