# Fonts

Licensed Pangram Pangram fonts. Do not commit to a public repo, do not load from a CDN, and do not redistribute.

## Files in this directory

| File | Weight | Use |
|---|---|---|
| `PPNeueMontreal-Book.woff2` | 400 | body, labels, navigation, all default UI |
| `PPNeueMontreal-Medium.woff2` | 500 | active / selected states, primary action labels (e.g. "add") |
| `PPNeueBit-Regular.woff2` | 400 | numerics, stats, icon glyphs |

`.woff` versions exist alongside as legacy-browser fallbacks but `app/fonts.ts` only registers `.woff2`.

## Notes

- **No Bold (700).** Per the amended design system, Medium is the heaviest weight in use. Do not introduce Bold-weight UI. If something feels like it needs more emphasis, it almost certainly doesn't.
- NeueBit ships with a single effective weight — used as-is.
