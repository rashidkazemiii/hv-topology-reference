// Builds the 6-slide poster digest:
//   "Experimental Verification of Automated Loss Simulation of Magnetic Components"
//   (SAL / Infineon poster, Power Electronics for Energy Transition Symposium, Vienna 2026)
//
// Theme of the deck: losses of a magnetic component are predicted by an automated magnetic
// simulation and verified thermally (calorimetry: P_loss = C_Th * dT/dt).
//
// Run from this folder:  NODE_PATH=<node_modules with pptxgenjs, react-icons, react, react-dom, sharp> node build_deck.js
// Figures are generated beforehand by fig_calorimeter.py and fig_thermal_network.py (+ render_svg.js).
// No poster imagery is used; all graphics are drawn or computed for this deck.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const tb = require("react-icons/tb");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const OUT = path.join(ROOT, "Automated_Magnetics_Loss_Verification.pptx");
const NB = " ";

const THEME = {
  name: "Copper and Ferrite",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1E252B", lt1: "FFFFFF", dk2: "1F2D36", lt2: "EEF2F4",
    accent1: "0F7C86", accent2: "C46A2B", accent3: "5B6B77",
    accent4: "E3A33B", accent5: "2E8B57", accent6: "B23A3A",
    hlink: "0F7C86", folHlink: "5B6B77",
  },
};
const HEX = THEME.colors;
const GRID = "D5DCE1";
const FOOTER =
  "Poster digest · P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad (Silicon Austria Labs, Infineon) · Power Electronics for Energy Transition Symposium, Vienna 2026";

// ---------------------------------------------------------------- poster data
const RUNS = { solid: [7.3, 7.4, 7.5], litz: [6.7, 6.7, 6.6] }; // calorimetric runs, W
const SIM = { solid: 6.75, litz: 6.7 }; // 2D FEM, W
const CAL_POWERS = [2, 3, 5, 8, 10, 13]; // heater calibration levels, W
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const relToSim = (v, k) => (100 * (v - SIM[k])) / SIM[k]; // poster: "measured losses are within ~11 % of simulated"
const pct = (v) => `${v > 0.05 ? "+" : v < -0.05 ? "−" : ""}${Math.abs(v).toFixed(1)}${NB}%`;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Experimental Verification of Automated Loss Simulation of Magnetic Components – Poster Digest";
pres.subject = "Thermal (calorimetric) verification of simulated losses in magnetic components";
const C = pres.SchemeColor;

// ---------------------------------------------------------------- helpers
async function icon(name, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(tb[name], { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function aspect(file) {
  const m = await sharp(file).metadata();
  return m.height / m.width;
}
function card(slide, x, y, w, h, fill, name, transparency = 0) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.1, fill: { color: fill, transparency }, line: { type: "none" }, objectName: name,
  });
}
function disc(slide, x, y, d, fill, name) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, objectName: name });
}
function numberDisc(slide, x, y, d, fill, n, fontSize, name) {
  disc(slide, x, y, d, fill, name);
  slide.addText(String(n), {
    x, y, w: d, h: d, align: "center", valign: "middle", margin: 0, fontSize, bold: true,
    color: C.background1, isTextBox: true, objectName: name + " number",
  });
}
function iconDisc(slide, x, y, d, fill, data, name) {
  disc(slide, x, y, d, fill, name);
  const s = d * 0.58;
  slide.addImage({ data, x: x + (d - s) / 2, y: y + (d - s) / 2, w: s, h: s, altText: name, objectName: name + " icon" });
}
const text = (slide, value, opts) => slide.addText(value, { isTextBox: true, margin: 0, ...opts });
const sub = (t) => ({ text: t, options: { subscript: true } });
const r4 = (v) => Math.round(v * 1e4) / 1e4;

const chartFont = {
  catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
  dataLabelFontFace: "+mn-lt", catAxisTitleFontFace: "+mn-lt", valAxisTitleFontFace: "+mn-lt", titleFontFace: "+mn-lt",
};
const chartFrame = {
  catAxisLabelColor: HEX.accent3, valAxisLabelColor: HEX.accent3, catAxisTitleColor: HEX.accent3, valAxisTitleColor: HEX.accent3,
  catAxisLineColor: "AEB8C0", valAxisLineShow: false, valGridLine: { color: GRID, size: 0.5 }, catGridLine: { style: "none" },
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisTitleFontSize: 10, valAxisTitleFontSize: 10,
};

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.95, w: 7.3, h: 1.95, fontSize: 34, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.6, y: 3.0, w: 7.3, h: 0.8, fontSize: 16, color: C.background2, valign: "top", margin: 0, bullet: false }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.3, w: 12.13, h: 0.7, fontSize: 30, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "message", type: "body", x: 0.6, y: 1.0, w: 12.13, h: 0.42, fontSize: 15, color: C.accent1, valign: "top", margin: 0, bullet: false }, text: "" } },
    { text: { text: FOOTER, options: { x: 0.6, y: 7.02, w: 11.0, h: 0.28, fontSize: 9, color: C.accent3, margin: 0, valign: "middle" } } },
  ],
  slideNumber: { x: 12.23, y: 7.02, w: 0.5, h: 0.28, fontSize: 9, color: C.accent3, align: "right" },
});

async function build() {
  const ico = {
    magnet: await icon("TbMagnet", "FFFFFF"),
    temp: await icon("TbTemperature", "FFFFFF"),
    scale: await icon("TbScale", "FFFFFF"),
    arrow: await icon("TbArrowRight", "9AA8B2"),
    flame: await icon("TbFlame", "FFFFFF"),
    flask: await icon("TbFlask", "FFFFFF"),
    droplet: await icon("TbDroplet", "FFFFFF"),
    check: await icon("TbCircleCheck", "FFFFFF"),
    alert: await icon("TbAlertTriangle", "FFFFFF"),
    ruler: await icon("TbRulerMeasure", "FFFFFF"),
  };

  // ============================================================ 1. Title + core idea
  pres.addSection({ title: "Concept" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Concept" });
  text(s, "POSTER DIGEST  ·  THERMAL VERIFICATION OF MAGNETIC LOSSES", {
    x: 0.6, y: 0.5, w: 7.6, h: 0.3, fontSize: 12, bold: true, color: C.accent4, charSpacing: 3, objectName: "Kicker",
  });
  s.addText("Experimental Verification of Automated Loss Simulation of Magnetic Components", { placeholder: "title" });
  s.addText("Losses predicted by an automated magnetic simulation are checked by measuring the heat they produce", { placeholder: "subtitle" });
  text(s, [
    { text: "P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad", options: { bold: true, breakLine: true } },
    { text: "Silicon Austria Labs (SAL), with Infineon Technologies AG · Power Electronics for Energy Transition Symposium, Vienna, 29–30 Sep 2026" },
  ], { x: 0.6, y: 3.9, w: 7.3, h: 0.62, fontSize: 11, color: C.background2, valign: "top", objectName: "Source" });

  // hero: the thermal principle in one line
  card(s, 8.35, 0.75, 4.38, 3.75, C.background1, "Principle card", 91);
  text(s, "THE PRINCIPLE", { x: 8.65, y: 0.98, w: 3.8, h: 0.25, fontSize: 10.5, bold: true, color: C.accent4, charSpacing: 2, objectName: "Principle label" });
  text(s, [
    { text: "P", options: { italic: true } }, sub("loss"), { text: " = C" }, sub("Th"), { text: " · dT/dt" },
  ], { x: 8.65, y: 1.3, w: 3.9, h: 0.8, fontSize: 34, color: C.background1, fontFace: "+mj-lt", valign: "middle", objectName: "Principle equation" });
  text(s, [
    { text: "Every watt lost in the core and winding of a magnetic component ends up as heat. Measuring how fast a known heat capacity C" },
    sub("Th"),
    { text: " warms up gives the real loss — independent of the simulation." },
  ], { x: 8.65, y: 2.2, w: 3.85, h: 1.3, fontSize: 12.5, color: C.background2, valign: "top", objectName: "Principle text" });
  text(s, [
    { text: "C" }, sub("Th"), { text: ": total heat capacity of the stirred liquid, the enclosure and the device under test." },
  ], { x: 8.65, y: 3.55, w: 3.85, h: 0.75, fontSize: 10.5, italic: true, color: C.background2, valign: "top", objectName: "Principle footnote" });

  const concept = [
    { t: "1 · Magnetic simulation", d: "PLECS, Infineon SPICE models and 2D FEM in Ansys Maxwell predict the core and winding losses of inductors and transformers.", c: C.accent1, i: ico.magnet },
    { t: "2 · Thermal measurement", d: "The inductor runs in its converter inside a stirred, near-adiabatic liquid calorimeter; its temperature slope gives the real loss.", c: C.accent2, i: ico.temp },
    { t: "3 · Comparison", d: `Buck converter, RM14LP, 400${NB}kHz: litz within 1.5${NB}%, solid wire measured 8–11${NB}% above simulation.`, c: C.accent4, i: ico.scale },
  ];
  const cw = 3.62, gap = (12.13 - 3 * cw) / 2, cy = 4.85, ch = 1.95;
  concept.forEach((k, i) => {
    const x = 0.6 + i * (cw + gap);
    card(s, x, cy, cw, ch, C.background1, `Concept card ${i + 1}`, 91);
    iconDisc(s, x + 0.25, cy + 0.27, 0.62, k.c, k.i, `Concept icon ${i + 1}`);
    text(s, k.t, { x: x + 1.05, y: cy + 0.25, w: 2.45, h: 0.4, fontSize: 15.5, bold: true, color: C.background1, valign: "middle", objectName: `Concept title ${i + 1}` });
    text(s, k.d, { x: x + 1.05, y: cy + 0.7, w: 2.4, h: 1.15, fontSize: 12, color: C.background2, valign: "top", objectName: `Concept text ${i + 1}` });
    if (i < 2) s.addImage({ data: ico.arrow, x: x + cw + (gap - 0.34) / 2, y: cy + (ch - 0.34) / 2, w: 0.34, h: 0.34, altText: "next step", objectName: `Concept arrow ${i + 1}` });
  });
  s.addNotes(
    "CORE CONCEPT OF THE POSTER\n" +
    "The poster by P. Skoff, M. Stoiber, J. Reynvaan and W. Konrad (Silicon Austria Labs with Infineon Technologies AG, Power Electronics for Energy Transition Symposium, Vienna, 29-30 Sep 2026) combines magnetics and thermal analysis.\n\n" +
    "Magnetic side: an automated Python-based workflow developed by SAL and Infineon characterises the losses of common converter topologies. Switch losses come from the Infineon SPICE solver; the losses of inductors and transformers come from 2D modelling in Ansys Maxwell combined with PLECS.\n\n" +
    "Thermal side: the simulation is validated with a measurement set-up that determines the losses through heat. All losses of a magnetic component (core + winding) are dissipated as heat. If the component sits in a near-adiabatic, stirred liquid, the heat is stored and the liquid temperature rises: P_loss = C_Th * dT/dt, where C_Th is the total heat capacity of everything inside the enclosure.\n\n" +
    "Comparison: for a buck-converter inductor (RM14LP core, 400 kHz, about 880 W) the simulated losses of the litz-wire version agree with the thermal measurement within 1.5 %, while the solid-wire version is measured 8-11 % above the simulation. Overall the measured losses are within about 11 % of the simulated losses."
  );

  // ============================================================ 2. Magnetic side: automated loss simulation
  pres.addSection({ title: "Method" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("Magnetic side: automated loss simulation", { placeholder: "title" });
  s.addText("Python-based workflow: PLECS waveforms → FFT → Ansys Maxwell 2D losses of the magnetic component", { placeholder: "message" });

  const steps = [
    { t: "Circuit model", tool: "PLECS", d: "The converter (example: buck converter) is drawn in PLECS; the waveforms of the magnetic component are extracted." },
    { t: "Switch losses", tool: "Infineon SPICE", d: `Switch losses are simulated with Infineon device models: ≈${NB}6.8${NB}W per switch.` },
    { t: "FFT of the current", tool: "Python", d: "An FFT of the inductor current is done; the 10 most dominant frequency components are kept." },
    { t: "Magnetic FEM", tool: "Ansys Maxwell 2D", d: "They become parallel sinusoidal sources. Winding layer stack and material (litz or solid), core size & material, insulation thicknesses and air gaps are set." },
    { t: "Loss result", tool: "core + winding", d: `Total inductor loss: 6.75${NB}W with solid wire, 6.70${NB}W with litz wire — the quantity that is then measured as heat.` },
  ];
  const sy = 1.7, pitch = 1.03, dd = 0.5;
  steps.forEach((st, i) => {
    const y = sy + i * pitch;
    if (i < steps.length - 1) {
      s.addShape(pres.shapes.LINE, { x: 0.6 + dd / 2, y: y + dd, w: 0, h: pitch - dd, line: { color: C.accent1, width: 1.5, transparency: 55 }, objectName: `Workflow connector ${i + 1}` });
    }
    numberDisc(s, 0.6, y, dd, C.accent1, i + 1, 16, `Workflow step ${i + 1}`);
    text(s, [
      { text: st.t, options: { bold: true, color: C.text2, fontSize: 15 } },
      { text: "   " + st.tool, options: { bold: true, color: C.accent2, fontSize: 11.5 } },
    ], { x: 1.3, y: y - 0.02, w: 5.9, h: 0.36, valign: "middle", objectName: `Workflow title ${i + 1}` });
    text(s, st.d, { x: 1.3, y: y + 0.36, w: 5.9, h: 0.62, fontSize: 12.5, color: C.text1, valign: "top", objectName: `Workflow text ${i + 1}` });
  });

  // FFT illustration (own computation): the 10 sinusoidal sources of a triangular ripple current
  const rx = 7.55, rw = 5.18;
  card(s, rx, 1.7, rw, 3.42, C.background2, "FFT card");
  text(s, "FFT step: the 10 sinusoidal sources", { x: rx + 0.25, y: 1.8, w: rw - 0.5, h: 0.32, fontSize: 14, bold: true, color: C.text2, objectName: "FFT title" });
  const harm = Array.from({ length: 10 }, (_, k) => 2 * k + 1);
  const fsw = 0.4; // MHz
  const amp = harm.map((n) => Math.round(1000 / (n * n)) / 10); // % of fundamental, I_n ~ 1/n^2
  const tail = 1 - (8 / (Math.PI * Math.PI)) * harm.reduce((a, n) => a + 1 / (n * n), 0); // max error of the 10-term sum, rel. to peak
  s.addChart(pres.charts.BAR, [
    { name: "amplitude (% of fundamental)", labels: harm.map((n) => (n * fsw).toFixed(1)), values: amp },
  ], {
    x: rx + 0.1, y: 2.15, w: rw - 0.2, h: 2.3, objectName: "FFT spectrum chart",
    altText: "Bar chart of the ten sinusoidal source amplitudes of a triangular 400 kHz ripple current: 100 % at 0.4 MHz, 11 % at 1.2 MHz, 4 % at 2.0 MHz, falling to 0.3 % at 7.6 MHz.",
    barDir: "col", barGapWidthPct: 45, chartColors: [HEX.accent1],
    valAxisMinVal: 0, valAxisMaxVal: 120, valAxisMajorUnit: 20, valAxisLabelFormatCode: "0",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "General", dataLabelFontSize: 9, dataLabelColor: HEX.dk1,
    showCatAxisTitle: true, catAxisTitle: "source frequency (MHz)", showValAxisTitle: true, valAxisTitle: "amplitude (%)",
    showLegend: false, ...chartFont, ...chartFrame,
  });
  text(s, `Own illustration (ideal triangular ripple at 400${NB}kHz, D = 0.5): amplitudes fall with 1/n\u00b2 (100, 11, 4, 2 \u2026 0.3 %), so these 10 sources rebuild the current within ${(100 * tail).toFixed(0)}${NB}% of its peak \u2014 \u201cgood results and acceptable simulation time\u201d (poster).`, {
    x: rx + 0.25, y: 4.5, w: rw - 0.5, h: 0.52, fontSize: 9.5, color: C.accent3, valign: "top", objectName: "FFT footnote",
  });

  card(s, rx, 5.3, rw, 1.55, C.background2, "Case study card");
  text(s, "CASE STUDY", { x: rx + 0.25, y: 5.38, w: rw - 0.5, h: 0.22, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2, objectName: "Case study label" });
  text(s, `Buck converter · RM14LP core · 400${NB}kHz · ≈${NB}880${NB}W`, { x: rx + 0.25, y: 5.6, w: rw - 0.5, h: 0.3, fontSize: 13, bold: true, color: C.text2, valign: "middle", objectName: "Case study title" });
  [
    [`≈${NB}6.8${NB}W`, "loss per switch"],
    [`6.75${NB}W`, "inductor, solid wire"],
    [`6.70${NB}W`, "inductor, litz wire"],
  ].forEach(([v, l], i) => {
    const x = rx + 0.25 + i * 1.6;
    text(s, v, { x, y: 5.95, w: 1.55, h: 0.45, fontSize: 22, bold: true, color: C.accent1, fontFace: "+mj-lt", valign: "middle", objectName: `Case stat ${i + 1}` });
    text(s, l, { x, y: 6.4, w: 1.55, h: 0.4, fontSize: 10.5, color: C.accent3, valign: "top", objectName: `Case label ${i + 1}` });
  });
  s.addNotes(
    "MAGNETIC SIDE (poster panel 'Simulation results - example: buck converter')\n" +
    "1) The circuit is drawn in PLECS.\n2) Switch losses are simulated in the Infineon SPICE solver using Infineon models (about 6.8 W per switch).\n" +
    "3) The waveforms for the simulation of the magnetic component are extracted from PLECS and an FFT is done.\n" +
    "4) The 10 most dominant frequency components become parallel sinusoidal sources for the Ansys Maxwell simulation - good results at acceptable simulation time. The layer stack / winding structure and the material are assigned (litz or solid); core size and material, insulation thicknesses and air gaps are set.\n" +
    "5) Example: RM14LP core, solid wire, 400 kHz, around 880 W. Total inductor losses: 6.75 W with solid wire and 6.70 W with litz wire.\n\n" +
    "Physics behind it: a magnetic component has core losses (hysteresis and eddy currents in the ferrite, depending on frequency, flux density and waveform) and winding losses (DC resistance plus high-frequency skin and proximity effect, which litz wire reduces) [9-11]. Because the converter current is not sinusoidal, it is decomposed into sinusoids that a frequency-domain FEM solver can handle.\n\n" +
    "The chart is our own illustration of the FFT step, not taken from the poster: for an ideal triangular ripple at 400 kHz the harmonic amplitudes fall with 1/n^2, so the ten sinusoidal sources (0.4 to 7.6 MHz) rebuild the current within about 2 % of its peak."
  );

  // ============================================================ 3. Thermal side: calorimetric set-up
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("Thermal side: measuring the losses as heat", { placeholder: "title" });
  s.addText("Near-adiabatic calorimeter: the inductor’s losses heat a stirred liquid of known heat capacity", { placeholder: "message" });
  const schH = 5.25, schW = schH / (await aspect(path.join(ASSETS, "calorimeter_schematic.png")));
  s.addImage({
    path: path.join(ASSETS, "calorimeter_schematic.png"), x: 0.6, y: 1.6, w: schW, h: schH,
    altText: "Schematic of the calorimeter: Dewar jar with vacuum jacket and double lid, stirred insulating liquid, submerged inductor under test, calibration heater fed by an LV supply, stirrer motor with Arduino, PT100 probes read by a DAQ970A.",
    objectName: "Calorimeter schematic",
  });
  const ex = 5.95, ew = 6.78;
  card(s, ex, 1.6, ew, 1.5, C.background2, "Energy balance card");
  text(s, [
    { text: "P", options: { italic: true } }, sub("loss"), { text: " = C" }, sub("Th"), { text: " · dT/dt ≈ C" }, sub("Th"), { text: " · ΔT/Δt" },
  ], { x: ex + 0.25, y: 1.7, w: ew - 0.5, h: 0.6, fontSize: 26, color: C.text2, fontFace: "+mj-lt", valign: "middle", objectName: "Energy balance equation" });
  text(s, [
    { text: "C" }, sub("Th"),
    { text: ": total heat capacity inside the adiabatic enclosure; ΔT: its temperature change during the time Δt in which the power is dissipated. Valid because almost no heat leaves the Dewar." },
  ], { x: ex + 0.25, y: 2.35, w: ew - 0.5, h: 0.68, fontSize: 12, color: C.text1, valign: "top", objectName: "Energy balance text" });

  text(s, "Set-up", { x: ex, y: 3.33, w: 3.2, h: 0.35, fontSize: 14, bold: true, color: C.text2, objectName: "Setup heading" });
  [
    "Dewar jar (vacuum-insulated)",
    "Custom double lid",
    "Insulating liquid, stirred",
    "Stepper motor + Arduino (stirrer)",
    "DUT: inductor, fully submerged",
    "LV supply + wire-wound resistor",
    "PT100 (fluid, ambient) → DAQ970A",
  ].forEach((label, i) => {
    const y = 3.8 + i * 0.43;
    numberDisc(s, ex, y, 0.3, C.text2, i + 1, 11, `Setup marker ${i + 1}`);
    text(s, label, { x: ex + 0.42, y, w: 2.9, h: 0.3, fontSize: 12, color: C.text1, valign: "middle", objectName: `Setup item ${i + 1}` });
  });
  const wx = 9.45, ww = 3.28;
  text(s, "Why this design?", { x: wx, y: 3.33, w: ww, h: 0.35, fontSize: 14, bold: true, color: C.text2, objectName: "Why heading" });
  [
    { t: "Losses become heat", d: "Core and winding losses are captured together, independent of waveform and frequency [3, 6].", i: ico.flame },
    { t: "Near-adiabatic", d: "Unlike other calorimetric methods, no mass-flow measurement is necessary [4, 5].", i: ico.flask },
    { t: "Stirred liquid", d: "Good electrical insulation and high heat capacity at reasonable cost; stirring heats it uniformly.", i: ico.droplet },
  ].forEach((k, i) => {
    const y = 3.8 + i * 1.0;
    iconDisc(s, wx, y, 0.42, C.accent2, k.i, `Why icon ${i + 1}`);
    text(s, k.t, { x: wx + 0.55, y: y - 0.02, w: ww - 0.55, h: 0.3, fontSize: 12.5, bold: true, color: C.text2, valign: "middle", objectName: `Why title ${i + 1}` });
    text(s, k.d, { x: wx + 0.55, y: y + 0.28, w: ww - 0.55, h: 0.68, fontSize: 10.5, color: C.text1, valign: "top", objectName: `Why text ${i + 1}` });
  });
  s.addNotes(
    "THERMAL SIDE (poster panel 'Setup for measuring inductor losses')\n" +
    "- A calorimetric method is used because the losses are dissipated as heat.\n" +
    "- A near-adiabatic set-up is constructed because, in contrast to other calorimetric methods, no mass-flow measurement is then necessary.\n" +
    "- The power dissipation is measured as P_loss = C_Th * dT/dt (approximately C_Th * delta T / delta t); C_Th is the total heat capacity and delta T the temperature change inside the adiabatic enclosure during the time delta t in which power is dissipated.\n" +
    "- The liquid inside the enclosure gives good electrical insulation and a very high heat capacity at reasonable cost. It is stirred continuously during calibration and measurement to ensure uniform heating.\n" +
    "- Set-up: Dewar jar with custom double lid; stepper motor + Arduino; PT100 sensors for fluid and ambient temperature; DAQ970A data-acquisition system; LV supply + wire-wound resistor as heating element for calibration.\n\n" +
    "Why thermal instead of electrical: an electrical V*I measurement of a high-Q inductor is extremely sensitive to phase errors (relative error about Q times the phase error), whereas the heat measurement does not depend on waveform or frequency [3, 6]. The method was evaluated by the same group for ferrite core losses [2].\n\n" +
    "The schematic is our own drawing; numbers 1-7 match the set-up list."
  );

  // ============================================================ 4. Thermal model and calibration
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("Thermal model and calibration", { placeholder: "title" });
  s.addText("Known heater powers turn the temperature slope into watts — under the same thermal conditions as the DUT", { placeholder: "message" });

  const lw = 6.15;
  card(s, 0.6, 1.6, lw, 5.25, C.background2, "Thermal model card");
  text(s, "Lumped thermal model of the calorimeter", { x: 0.85, y: 1.68, w: lw - 0.5, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Thermal model title" });
  const netW = lw - 0.7, netH = netW * (await aspect(path.join(ASSETS, "thermal_network.png")));
  s.addImage({
    path: path.join(ASSETS, "thermal_network.png"), x: 0.6 + (lw - netW) / 2, y: 2.05, w: netW, h: netH,
    altText: "Thermal network: the DUT loss is a heat source feeding the DUT heat capacity, a thermal resistance to the liquid, the liquid and enclosure heat capacity, and a very large leakage resistance to ambient.",
    objectName: "Thermal network",
  });
  const balY = 2.05 + netH + 0.05;
  text(s, [
    { text: "C" }, sub("Th"), { text: "·dT/dt = P" }, sub("loss"), { text: " − (T − T" }, sub("amb"), { text: ")/R" }, sub("leak"),
    { text: "   →   P" }, sub("loss"), { text: " ≈ C" }, sub("Th"), { text: "·ΔT/Δt  for large R" }, sub("leak"),
  ], { x: 0.85, y: balY, w: lw - 0.5, h: 0.4, fontSize: 13.5, color: C.text2, valign: "middle", objectName: "Thermal balance" });
  const rules = [
    [[{ text: "C" }, sub("Th"), { text: " includes the DUT" }], " → it is fully submerged also during calibration"],
    [[{ text: "R" }, sub("th"), { text: " delays the response" }], " → only the most linear part of ΔT(t) is used"],
    [[{ text: "Leakage is small, not zero" }], ` → every run starts at 35${NB}°C`],
    [[{ text: "One liquid temperature" }], " → continuous stirring keeps the liquid uniform"],
  ];
  rules.forEach(([lead, rest], i) => {
    const y = balY + 0.48 + i * 0.38;
    disc(s, 0.88, y + 0.1, 0.12, C.accent1, `Rule dot ${i + 1}`);
    text(s, [...lead.map((r) => ({ text: r.text, options: { ...(r.options || {}), bold: true, color: C.text2 } })), { text: rest }],
      { x: 1.1, y, w: lw - 0.75, h: 0.32, fontSize: 12, color: C.text1, valign: "middle", objectName: `Rule ${i + 1}` });
  });

  // calibration line (idealised; poster's calibration powers)
  const bx = 7.0, bwid = 5.73;
  card(s, bx, 1.6, bwid, 3.05, C.background2, "Calibration card");
  text(s, "Calibration: slope ∝ power", { x: bx + 0.25, y: 1.68, w: bwid - 0.5, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Calibration title" });
  const litzMean = mean(RUNS.litz), solidMean = mean(RUNS.solid);
  const xB = [0, ...CAL_POWERS.slice(0, 3), litzMean, solidMean, ...CAL_POWERS.slice(3), 14];
  const rel = (p) => Math.round((p / 13) * 1e4) / 1e4;
  const pick = (cond) => xB.map((x, k) => (cond(x, k) ? rel(x) : null));
  const B = { x: bx + 0.1, y: 2.0, w: bwid - 0.2, h: 2.55, lx: 0.13, ly: 0.05, lw: 0.83, lh: 0.7, xMax: 14, yMax: 1.2 };
  s.addChart(pres.charts.SCATTER, [
    { name: "P", values: xB.map(r4) },
    { name: "Heater calibration", values: pick((x) => CAL_POWERS.includes(x)) },
    { name: "Proportional fit", values: pick((x, k) => k === 0 || k === xB.length - 1) },
    { name: "DUT", values: pick((x) => x === litzMean || x === solidMean) },
  ], {
    x: B.x, y: B.y, w: B.w, h: B.h, layout: { x: B.lx, y: B.ly, w: B.lw, h: B.lh }, objectName: "Calibration chart",
    altText: "Idealised calibration line: temperature slope proportional to heater power at 2, 3, 5, 8, 10 and 13 W; the DUT slopes read as 6.7 W (litz) and 7.4 W (solid).",
    chartColors: [HEX.accent2, HEX.accent3, HEX.accent1], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    catAxisMinVal: 0, catAxisMaxVal: B.xMax, catAxisMajorUnit: 2, valAxisMinVal: 0, valAxisMaxVal: B.yMax, valAxisMajorUnit: 0.2,
    valAxisLabelFormatCode: "General", showCatAxisTitle: true, catAxisTitle: "heater power P (W)", showValAxisTitle: true, valAxisTitle: "ΔT/Δt (rel. to 13 W)",
    showLegend: false, displayBlanksAs: "span", ...chartFont, ...chartFrame,
  });
  const bx0 = B.x + B.lx * B.w, by0 = B.y + B.ly * B.h, bw = B.lw * B.w, bh = B.lh * B.h;
  const bxp = (p) => bx0 + (p / B.xMax) * bw;
  const byp = (v) => by0 + (1 - v / B.yMax) * bh;
  text(s, [
    { text: "● ", options: { color: HEX.accent2 } }, { text: "heater: 2, 3, 5, 8, 10, 13 W", options: { breakLine: true } },
    { text: "‒ ‒ ", options: { color: HEX.accent3, bold: true } }, { text: "slope ∝ power", options: { breakLine: true } },
    { text: "◆ ", options: { color: HEX.accent1 } }, { text: "DUT slopes read off" },
  ], { x: bx0 + 0.1, y: by0 + 0.05, w: 2.3, h: 0.62, fontSize: 9.5, color: C.text1, valign: "top", objectName: "Calibration key" });
  text(s, `solid ≈ ${solidMean.toFixed(1)}${NB}W`, { x: bxp(solidMean) - 1.75, y: byp(rel(solidMean)) - 0.42, w: 1.6, h: 0.24, fontSize: 10, bold: true, color: C.accent1, align: "right", objectName: "Solid reading" });
  text(s, `litz ≈ ${litzMean.toFixed(1)}${NB}W`, { x: bxp(litzMean) + 0.12, y: byp(rel(litzMean)) + 0.16, w: 1.6, h: 0.24, fontSize: 10, bold: true, color: C.accent1, objectName: "Litz reading" });

  card(s, bx, 4.85, bwid, 2.0, C.background2, "Procedure card");
  const proc = [
    ["Calibrate", "LV supply + wire-wound resistor at known power (4-wire measurement)"],
    ["Fit", "most linear region of each ΔT(t) record → one ΔT/Δt slope per power"],
    ["Measure", "DUT operated as in normal operation → its ΔT/Δt slope"],
    ["Interpolate", "loss read between the calibrated slopes"],
  ];
  proc.forEach(([t, d], i) => {
    const y = 4.97 + i * 0.46;
    numberDisc(s, bx + 0.22, y + 0.02, 0.34, C.accent2, i + 1, 11, `Procedure step ${i + 1}`);
    text(s, [{ text: t + ": ", options: { bold: true, color: C.text2 } }, { text: d }], { x: bx + 0.7, y, w: bwid - 0.9, h: 0.38, fontSize: 11, color: C.text1, valign: "middle", objectName: `Procedure ${i + 1}` });
  });
  s.addNotes(
    "CALIBRATION (poster panel 'Calibration of setup')\n" +
    "- For accurate calibration the DUT must be fully submerged in the adiabatic enclosure, because it adds a non-negligible thermal capacity to the system.\n" +
    "- A heating element (LV supply + wire-wound resistor) with 4-wire measurement heats the liquid at known power levels (2, 3, 5, 8, 10 and 13 W in the poster's calibration plot, 0-25 s).\n" +
    "- The liquid is stirred continuously; its initial temperature is held at 35 degC for accurate data.\n" +
    "- Heating at known power for known times gives a series of points; the most linear regions are fitted and give a set of dT/dt slopes. The slope is directly proportional to the power loss, and intermediate powers are interpolated between calibrated slopes.\n\n" +
    "MEASUREMENT (poster panel 'Results'): the DUT is operated as in normal operation, its dT/dt slope is recorded and the most linear portion is compared with the calibration data.\n\n" +
    "THERMAL MODEL (our explanation of why these rules matter): the lumped network shows the DUT as a heat source with its own heat capacity, a thermal resistance to the liquid (which delays the response - the poster's calibration curves only start rising after several seconds), the heat capacity of liquid and enclosure, and a very large leakage resistance to ambient through the Dewar and double lid. With leakage negligible, P_loss = C_Th * dT/dt. Calibrating with the heater at known power determines this proportionality under identical conditions, so C_Th does not have to be calculated.\n" +
    "The calibration chart is idealised (relative slope); it shows the principle, not the poster's measured data."
  );

  // ============================================================ 5. Results
  pres.addSection({ title: "Results" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Results: simulated vs. thermally measured losses", { placeholder: "title" });
  s.addText(`Litz-wire inductor agrees within 1.5${NB}%; the solid-wire inductor is measured 8–11${NB}% above simulation`, { placeholder: "message" });

  card(s, 0.6, 1.6, 6.1, 5.25, C.background2, "Results chart card");
  text(s, `Inductor loss — RM14LP, 400${NB}kHz, ≈${NB}880${NB}W`, { x: 0.85, y: 1.68, w: 5.6, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Results chart title" });
  s.addChart(pres.charts.BAR, [
    { name: "Simulated (Ansys Maxwell 2D)", labels: ["Solid wire", "Litz wire"], values: [SIM.solid, SIM.litz] },
    { name: "Measured, calorimetric (mean of 3)", labels: ["Solid wire", "Litz wire"], values: [mean(RUNS.solid), mean(RUNS.litz)].map((v) => Math.round(v * 1000) / 1000) },
  ], {
    x: 0.7, y: 2.02, w: 5.9, h: 3.05, objectName: "Results bar chart",
    altText: "Clustered columns: solid wire simulated 6.75 W vs measured 7.40 W; litz wire simulated 6.70 W vs measured 6.67 W.",
    barDir: "col", barGrouping: "clustered", barGapWidthPct: 70, chartColors: [HEX.accent1, HEX.accent2],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 11, dataLabelColor: HEX.dk1, dataLabelFontBold: true,
    valAxisMinVal: 0, valAxisMaxVal: 8, valAxisMajorUnit: 2, valAxisLabelFormatCode: "0", showValAxisTitle: true, valAxisTitle: "loss (W)",
    catAxisLabelFontSize: 12, showLegend: true, legendPos: "b", legendFontSize: 10.5, legendColor: HEX.dk1,
    ...chartFont, ...chartFrame, catAxisLabelColor: HEX.dk1,
  });
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 10.5 } });
  const devCell = (k) => {
    const v = relToSim(mean(RUNS[k]), k);
    return { text: pct(v), options: { bold: true, color: Math.abs(v) < 2 ? C.accent5 : C.accent6 } };
  };
  const row = (k, label) => [
    { text: label, options: { bold: true, align: "left" } },
    ...RUNS[k].map((v) => v.toFixed(1)), mean(RUNS[k]).toFixed(2), SIM[k].toFixed(2), devCell(k),
  ];
  s.addTable([
    [hdr("Wire"), hdr("Run 1"), hdr("Run 2"), hdr("Run 3"), hdr("Mean"), hdr("Simulated"), hdr("Meas. vs. sim.")],
    row("solid", "Solid"), row("litz", "Litz"),
  ], {
    x: 0.85, y: 5.27, w: 5.6, colW: [0.85, 0.65, 0.65, 0.65, 0.75, 0.9, 1.15], rowH: 0.31,
    fontSize: 11, color: C.text1, fill: { color: C.background1 }, align: "center", valign: "middle", margin: [0.03, 0.08, 0.03, 0.08],
    border: { type: "solid", pt: 0.75, color: GRID }, objectName: "Measurement table",
  });
  text(s, "Six calorimetric runs from the poster, values in W. Deviation = (measured mean − simulated) / simulated.", {
    x: 0.85, y: 6.3, w: 5.6, h: 0.42, fontSize: 9, color: C.accent3, valign: "top", objectName: "Table note",
  });

  const kx = 6.95, kw = 2.74;
  const runDev = (k) => RUNS[k].map((v) => relToSim(v, k));
  const range = (k) => {
    const d = runDev(k);
    return `${pct(Math.min(...d))} … ${pct(Math.max(...d))}`;
  };
  [
    { k: "LITZ WIRE", v: pct(relToSim(mean(RUNS.litz), "litz")), c: C.accent5, r: `per run: ${range("litz")}` },
    { k: "SOLID WIRE", v: pct(relToSim(mean(RUNS.solid), "solid")), c: C.accent6, r: `per run: ${range("solid")}` },
  ].forEach((k, i) => {
    const x = kx + i * (kw + 0.3);
    card(s, x, 1.6, kw, 1.45, C.background2, `Deviation card ${i + 1}`);
    text(s, k.k, { x: x + 0.2, y: 1.7, w: kw - 0.4, h: 0.22, fontSize: 10, bold: true, color: C.text2, charSpacing: 2, objectName: `Deviation wire ${i + 1}` });
    text(s, k.v, { x: x + 0.2, y: 1.92, w: kw - 0.4, h: 0.58, fontSize: 32, bold: true, color: k.c, fontFace: "+mj-lt", valign: "middle", objectName: `Deviation value ${i + 1}` });
    text(s, [{ text: "measured vs. simulated (mean)", options: { breakLine: true } }, { text: k.r }], { x: x + 0.2, y: 2.53, w: kw - 0.4, h: 0.45, fontSize: 10.5, color: C.text1, valign: "top", objectName: `Deviation label ${i + 1}` });
  });
  const dSolidLitzMeas = mean(RUNS.solid) - mean(RUNS.litz);
  [
    { t: "Accurate loss prediction", d: "The workflow predicts the losses of the litz-wound inductor very close to the thermally measured values.", c: C.accent5, i: ico.check },
    { t: "Solid-wire effect under-represented", d: `Measured: solid is ${dSolidLitzMeas.toFixed(2)}${NB}W above litz; simulated: only 0.05${NB}W. Why this occurs is left for future analysis [10].`, c: C.accent4, i: ico.alert },
    { t: "Good approximation for inductor design", d: `Measured losses are within ~11${NB}% of the simulated losses; the calorimeter resolves 0.1${NB}W differences between runs.`, c: C.accent1, i: ico.ruler },
  ].forEach((k, i) => {
    const y = 3.3 + i * 1.18;
    iconDisc(s, kx, y, 0.5, k.c, k.i, `Conclusion icon ${i + 1}`);
    text(s, k.t, { x: kx + 0.68, y: y - 0.02, w: 5.1, h: 0.32, fontSize: 13.5, bold: true, color: C.text2, valign: "middle", objectName: `Conclusion title ${i + 1}` });
    text(s, k.d, { x: kx + 0.68, y: y + 0.32, w: 5.1, h: 0.78, fontSize: 11.5, color: C.text1, valign: "top", objectName: `Conclusion text ${i + 1}` });
  });
  s.addNotes(
    "RESULTS (poster panel 'Results & conclusion')\n" +
    "Calorimetric runs: solid wire 7.3 / 7.4 / 7.5 W (mean 7.40 W); litz wire 6.7 / 6.7 / 6.6 W (mean 6.67 W). Simulated: 6.75 W (solid) and 6.70 W (litz).\n" +
    "- Litz: measured mean 0.5 % below the simulation (0 to -1.5 % per run).\n" +
    "- Solid: measured mean 9.6 % above the simulation (+8.1 to +11.1 % per run).\n" +
    "- The thermal measurement shows that the solid-wire winding costs about 0.73 W more than the litz winding, while the simulation predicts only 0.05 W.\n\n" +
    "Poster's conclusion: the Python-based simulation workflow seems to enable accurate loss prediction of magnetic components. The simulated losses of litz-wound inductors are very close to the measured values; the effect of using solid wire seems to be under-represented in the simulation, and why this occurs should be investigated in future analysis. The simulation data is nevertheless close to real values and can serve as a good approximation for inductor design, as the measured losses are within ~11 % of the simulated losses.\n\n" +
    "Background for discussion (not on the poster): solid round wire is much more sensitive to high-frequency eddy-current effects (skin and proximity effect, air-gap fringing fields) than litz wire [10]; these effects are the natural place to look for the missing loss."
  );

  // ============================================================ 6. References
  pres.addSection({ title: "References" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "References" });
  s.addText("References", { placeholder: "title" });
  s.addText("The poster, the reference it cites, and related work on thermal loss measurement and magnetic loss modelling", { placeholder: "message" });
  const REFS = JSON.parse(fs.readFileSync(path.join(__dirname, "references.json"), "utf8"));
  const refRuns = (groups) => {
    const out = [];
    groups.forEach((g, gi) => {
      out.push({ text: g.group, options: { bold: true, color: C.accent2, fontSize: 11, breakLine: true, paraSpaceBefore: gi ? 8 : 0, paraSpaceAfter: 3 } });
      g.items.forEach((r) => {
        out.push({ text: `[${r.n}] `, options: { bold: true, color: C.text2 } });
        out.push({ text: `${r.authors}, “${r.title},” ${r.pre || ""}` });
        out.push({ text: r.venue, options: { italic: true } });
        out.push({ text: `${r.details}.`, options: { breakLine: true, paraSpaceAfter: 4 } });
      });
    });
    delete out[out.length - 1].options.breakLine;
    return out;
  };
  const split = REFS.groups.findIndex((g) => g.column === 2);
  text(s, refRuns(REFS.groups.slice(0, split)), { x: 0.6, y: 1.6, w: 5.95, h: 5.25, fontSize: 10, color: C.text1, valign: "top", objectName: "References left" });
  text(s, refRuns(REFS.groups.slice(split)), { x: 6.78, y: 1.6, w: 5.95, h: 5.25, fontSize: 10, color: C.text1, valign: "top", objectName: "References right" });
  card(s, 6.78, 5.15, 5.95, 1.7, C.background2, "Reference map card");
  text(s, "HOW THE REFERENCES CONNECT TO THE SLIDES", { x: 7.0, y: 5.25, w: 5.5, h: 0.25, fontSize: 10, bold: true, color: C.accent2, charSpacing: 1, objectName: "Reference map title" });
  text(s, [
    { text: "Thermal measurement (slides 3\u20134): ", options: { bold: true, color: C.text2 } }, { text: "[2] same group\u2019s fluid calorimeter, [3] transient calorimetry, [4]\u2013[8] other loss-measurement methods", options: { breakLine: true } },
    { text: "Magnetic simulation (slide 2): ", options: { bold: true, color: C.text2 } }, { text: "[9]\u2013[11] winding and core loss models, [13]\u2013[15] automated FEM workflows", options: { breakLine: true } },
    { text: "Litz vs. solid wire (slide 5): ", options: { bold: true, color: C.text2 } }, { text: "[10] winding loss, [12] winding thermal model" },
  ], { x: 7.0, y: 5.55, w: 5.55, h: 1.2, fontSize: 10, color: C.text1, valign: "top", paraSpaceAfter: 4, objectName: "Reference map" });
  s.addNotes(
    "[1] is the poster itself. [2] is the reference printed on the poster: J. Reynvaan, M. Pajnic and J. Krenn, 'Evaluating Fluid Based Transient Calorimetric Method for Measurement of the Ferrite Core Losses', ICPE 2023-ECCE Asia, doi: 10.23919/ICPE2023-ECCEAsia54778.2023.10213808 - the same group's work on the fluid-based transient calorimeter used here.\n" +
    "[3]-[8]: thermal / calorimetric loss measurement with a similar concept (transient calorimetry of ferrite cores, closed calorimeters, overview of loss-measurement methods, temperature-based loss evaluation of high-frequency transformers, 2026 review).\n" +
    "[9]-[15]: modelling of magnetic losses and of the thermal behaviour of magnetic components (winding and core loss models, litz vs. solid wire, winding thermal models, open-source FEM toolbox with electric and thermal simulation, integrated loss simulation, FEM-based inductor design).\n" +
    "Links and DOIs: REFERENCES.md next to this deck."
  );

  await pres.writeFile({ fileName: OUT });
  await postProcessCharts(OUT);
  await applyThemeColors(OUT, THEME);
  console.log("wrote " + OUT);
}

// ---------------------------------------------------------------- post-processing
// pptxgenjs styles all scatter series alike and writes blank points as empty <c:v/>.
// Drop the blank points and give single series their own look.
function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}
function styleSeries(xml, name, { noLine = false, noMarker = false, dash = null, symbol = null, size = null, width = null }) {
  return xml.replace(/<c:ser>[\s\S]*?<\/c:ser>/g, (ser) => {
    if (!ser.includes(`<c:v>${name}</c:v>`)) return ser;
    let out = ser;
    if (noLine) out = out.replace(/(<\/c:tx>\s*<c:spPr>[\s\S]*?)<a:ln\b[^>]*>[\s\S]*?<\/a:ln>/, "$1<a:ln><a:noFill/></a:ln>");
    if (dash) out = out.replace(/(<\/c:tx>\s*<c:spPr>[\s\S]*?<a:prstDash val=")solid(")/, `$1${dash}$2`);
    if (width) out = out.replace(/(<\/c:tx>\s*<c:spPr>[\s\S]*?<a:ln w=")\d+(")/, `$1${Math.round(width * 12700)}$2`);
    if (noMarker) out = out.replace(/<c:marker>[\s\S]*?<\/c:marker>/, '<c:marker><c:symbol val="none"/></c:marker>');
    if (symbol) out = out.replace(/<c:symbol val="[a-z]+"\/>/, `<c:symbol val="${symbol}"/>`);
    if (size) out = out.replace(/<c:size val="\d+"\/>/, `<c:size val="${size}"/>`);
    return out;
  });
}
// pptxgenjs gives all scatter series one shared x list and writes missing y values as empty
// points. Some viewers (notably on phones) pair x and y by position, not by index, and then
// draw such series wrongly. Rewrite each series with only its own (x, y) pairs, numbered 0..n-1.
function compactScatterSeries(xml) {
  const pts = (block) => [...block.matchAll(/<c:pt idx="(\d+)"><c:v>([^<]*)<\/c:v><\/c:pt>/g)].map((m) => [Number(m[1]), m[2]]);
  const cache = (list) => `<c:ptCount val="${list.length}"/>` + list.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join("");
  return xml.replace(/<c:ser>[\s\S]*?<\/c:ser>/g, (ser) => {
    const xm = ser.match(/<c:xVal>[\s\S]*?<\/c:xVal>/), ym = ser.match(/<c:yVal>[\s\S]*?<\/c:yVal>/);
    if (!xm || !ym) return ser;
    const xs = new Map(pts(xm[0]));
    const keep = pts(ym[0]).filter(([idx, v]) => v !== "" && xs.has(idx) && xs.get(idx) !== "");
    const swap = (block, values) => block.replace(/<c:ptCount val="\d+"\/>[\s\S]*?(?=<\/c:numCache>)/, cache(values));
    return ser
      .replace(xm[0], swap(xm[0], keep.map(([idx]) => xs.get(idx))))
      .replace(ym[0], swap(ym[0], keep.map(([, v]) => v)));
  });
}
async function postProcessCharts(file) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(file));
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/charts\/chart\d+\.xml$/.test(n))) {
    let xml = await zip.file(name).async("string");
    xml = compactScatterSeries(xml);
    if (xml.includes("<c:v>Heater calibration</c:v>")) {
      xml = styleSeries(xml, "Heater calibration", { noLine: true });
      xml = styleSeries(xml, "Proportional fit", { noMarker: true, dash: "dash" });
      xml = styleSeries(xml, "DUT", { noLine: true, symbol: "diamond", size: 12 });
    }
    zip.file(name, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}
// Same job as the pptx skill's apply_theme.js: write the deck's own palette into the theme.
async function applyThemeColors(file, theme) {
  const skill = process.env.PPTX_SKILL_DIR && path.join(process.env.PPTX_SKILL_DIR, "scripts", "apply_theme.js");
  if (skill && fs.existsSync(skill)) return require(skill).applyTheme(file, theme);
  const slots = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];
  const zip = await loadJSZip().loadAsync(fs.readFileSync(file));
  const part = "ppt/theme/theme1.xml";
  const scheme = `<a:clrScheme name="${theme.name}">` + slots.map((k) => `<a:${k}><a:srgbClr val="${theme.colors[k]}"/></a:${k}>`).join("") + "</a:clrScheme>";
  const xml = (await zip.file(part).async("string"))
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, head) => `${head}${theme.name}"`);
  zip.file(part, xml);
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
