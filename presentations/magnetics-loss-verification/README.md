# Poster digest: automated magnetics loss simulation vs. calorimetry

This is a 6-slide PowerPoint deck explaining the poster *"Experimental verification of automated loss-simulation of magnetic components"* by P. Skoff, M. Stoiber, J. Reynvaan and W. Konrad (Silicon Austria Labs, with Infineon Technologies AG). The poster was shown at the Power Electronics for Energy Transition Symposium 2026.

| File | Content |
|---|---|
| `Automated_Magnetics_Loss_Verification.pptx` | The deck: concept, simulation workflow, calorimeter, calibration, results, references. Each slide has speaker notes. |
| `REFERENCES.md` | The 20 references with DOIs or links and a note on why each is relevant |
| `assets/` | Original figures made for the deck (none are taken from the poster) |
| `src/` | Scripts that regenerate the figures and the deck |

## What is original vs. taken from the poster

- **From the poster:** the workflow steps, the case-study numbers, the hardware list, the calibration procedure and the six measurement results.
- **Made for this deck, and labelled as such on the slides:**
  - the skin-effect heat-map (exact Bessel solution)
  - the harmonic-truncation analysis on slide 2
  - the first-order thermal-lag model on slide 4
  - the calorimeter schematic
  - the possible causes listed on slide 5

## Rebuild

```bash
pip install numpy scipy matplotlib
npm install pptxgenjs react-icons react react-dom sharp   # in any folder; point NODE_PATH at its node_modules
cd src
python3 fig_skin_effect.py
python3 fig_calorimeter.py && node render_svg.js ../assets/calorimeter_schematic.svg ../assets/calorimeter_schematic.png
node build_deck.js
```

The heat-map script uses the Carlito font (metric-compatible with Calibri) when it is installed.
