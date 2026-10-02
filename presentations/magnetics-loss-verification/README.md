# Poster digest: thermal verification of simulated magnetic-component losses

This folder holds a 9-slide PowerPoint deck explaining the poster *"Experimental verification of automated loss-simulation of magnetic components"*. The poster is by P. Skoff, M. Stoiber, J. Reynvaan and W. Konrad of Silicon Austria Labs, with Infineon Technologies AG. It was shown at the Power Electronics for Energy Transition Symposium in Vienna, 29–30 Sep 2026.

**Concept.** A Python workflow simulates the losses of magnetic components (PLECS → FFT → Ansys Maxwell 2D). The poster then verifies them **thermally**: the inductor runs in a near-adiabatic, stirred liquid calorimeter, and the loss is P_loss = C_Th · dT/dt.

| Slide | Content |
|---|---|
| 1 | Title and core idea (magnetic simulation ↔ thermal measurement) |
| 2 | Magnetic side: the automated loss-simulation workflow, why two tools, buck-converter case |
| 3 | From PLECS to FEM: what is passed between the tools (one-way chain, no recursion) |
| 4 | From PLECS waveform to FEM excitation: FFT and 10 parallel sinusoidal sources |
| 5 | Inside the FEM (fields → losses) and when an iterative loop would be needed |
| 6 | Thermal side: the calorimetric set-up and its energy balance |
| 7 | Thermal model of the calorimeter and the calibration procedure |
| 8 | Results: simulated vs. thermally measured losses (solid 7.3/7.4/7.5 W, litz 6.7/6.7/6.6 W) |
| 9 | References (the poster, the reference it cites, related work) |

Every slide has speaker notes. `REFERENCES.md` lists all references with DOIs and links.

`Automated_Magnetics_Loss_Verification.pdf` is the same deck as a PDF. Use it on phones, where PowerPoint viewers often draw native charts incompletely.

## What comes from the poster and what was added

All facts, numbers and procedure steps come from the poster. Six visuals were drawn or computed for this deck, and none is copied from the poster:

- the calorimeter schematic
- the lumped thermal network
- the spectrum of the 10 sinusoidal sources, for an ideal triangular ripple
- the FFT-to-parallel-sources drawing
- the one-way vs. iterative coupling diagrams
- the idealised calibration line

## Rebuild

```bash
npm install pptxgenjs react-icons react react-dom sharp   # point NODE_PATH at this node_modules
cd src
python3 fig_calorimeter.py && node render_svg.js ../assets/calorimeter_schematic.svg ../assets/calorimeter_schematic.png
python3 fig_thermal_network.py && node render_svg.js ../assets/thermal_network.svg ../assets/thermal_network.png
python3 fig_fft_sources.py && node render_svg.js ../assets/fft_sources.svg ../assets/fft_sources.png
node build_deck.js
```
