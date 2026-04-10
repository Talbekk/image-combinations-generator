# Card Generator

Generates sets of card images (shape × colour × count) and downloads them as a ZIP of JPEGs.

## Stack

- **Vite** — dev server & bundler
- **React 18** + **TypeScript**
- **jszip** — packs all generated images into a single ZIP download
- No backend required — everything runs in the browser via the Canvas API

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Project structure

```
src/
  types/index.ts          — shared TypeScript types (ShapeName, ColourName, Count, etc.)
  lib/
    renderer.ts           — canvas drawing logic (shapes, card background, data URL export)
    zip.ts                — iterates all combos, builds ZIP, triggers download
  components/
    CheckboxGroup.tsx     — reusable checkbox picker (shapes / colours / counts)
    CardPreview.tsx       — live canvas preview tile
  App.tsx                 — main UI
  main.tsx                — React entry point
```

## Adding a new shape

1. Add the name to the `ShapeName` union in `src/types/index.ts`
2. Add a `case` to the `switch` in `src/lib/renderer.ts` → `drawShape()`
3. Add an entry to `SHAPE_OPTIONS` in `src/App.tsx`

## Adding a new colour

1. Add the name to the `ColourName` union in `src/types/index.ts`
2. Add the hex value to `COLOUR_MAP` in `src/lib/renderer.ts`
3. Add an entry to `COLOUR_OPTIONS` in `src/App.tsx`

## Tweaking shape sizes / spacing

All sizing is relative to the card dimensions and lives in `renderCardToDataUrl()` in `src/lib/renderer.ts`:

```ts
const shapeSize = Math.min(w, h) * 0.38  // shape bounding box
const paddingY  = h * 0.1               // top/bottom padding
```

Adjust these multipliers to taste.
