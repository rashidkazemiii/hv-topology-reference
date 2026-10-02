// Builds the 6-slide poster digest:
//   "Experimental Verification of Automated Loss Simulation for Magnetic Components"
//
// Run from this folder:  NODE_PATH=<node_modules with pptxgenjs, react-icons, react, react-dom, sharp> node build_deck.js
// Figures are generated beforehand by fig_skin_effect.py and fig_calorimeter.py (+ render_svg.js).
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
  "Poster digest · P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad (SAL with Infineon) · Power Electronics for Energy Transition Symposium 2026";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Experimental Verification of Automated Loss Simulation for Magnetic Components – Poster Digest";
pres.subject = "Automated magnetics loss simulation validated by near-adiabatic calorimetry";
const C = pres.SchemeColor;

// ---------------------------------------------------------------- helpers
async function icon(name, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(tb[name], { color: "#" + color, size }));
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
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

const chartFont = {
  catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
  dataLabelFontFace: "+mn-lt", catAxisTitleFontFace: "+mn-lt", valAxisTitleFontFace: "+mn-lt",
  titleFontFace: "+mn-lt",
};
const chartFrame = {
  catAxisLabelColor: HEX.accent3, valAxisLabelColor: HEX.accent3,
  catAxisTitleColor: HEX.accent3, valAxisTitleColor: HEX.accent3,
  catAxisLineColor: "AEB8C0", valAxisLineShow: false,
  valGridLine: { color: GRID, size: 0.5 }, catGridLine: { style: "none" },
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisTitleFontSize: 10, valAxisTitleFontSize: 10,
};

// ---------------------------------------------------------------- physics for the charts
// (1) Share of ripple-related winding loss captured by the first N harmonics of a symmetric
//     triangular current (I_n ~ 1/n^2, odd n), for R_ac ~ f^alpha.
function harmonicShare(alpha, nMax) {
  let total = 0;
  for (let n = 1; n < 4e6; n += 2) total += Math.pow(n, alpha - 4);
  const out = [];
  let acc = 0;
  for (let k = 0; k < nMax; k++) {
    const n = 2 * k + 1;
    acc += Math.pow(n, alpha - 4);
    out.push(Math.round((1000 * acc) / total) / 10);
  }
  return out;
}
// (2) First-order thermal-lag model of a calibration record:
//     dT(t) = (P / C_eq) * [t - tau * (1 - exp(-t / tau))]
const C_EQ = 3500; // J/K, assumed for the illustration
const TAU = 8; // s
const dT = (p, t) => (p / C_EQ) * (t - TAU * (1 - Math.exp(-t / TAU)));
const slope = (p) => (1000 * p) / C_EQ; // mK/s

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.0, w: 7.0, h: 1.95, fontSize: 34, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.6, y: 3.05, w: 7.0, h: 0.8, fontSize: 16, color: C.background2, valign: "top", margin: 0, bullet: false }, text: "" } },
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
    simulate: await icon("TbCpu", "FFFFFF"),
    measure: await icon("TbTemperature", "FFFFFF"),
    compare: await icon("TbScale", "FFFFFF"),
    arrow: await icon("TbArrowRight", "9AA8B2"),
    wave: await icon("TbWaveSine", "FFFFFF"),
    flask: await icon("TbFlask", "FFFFFF"),
    droplet: await icon("TbDroplet", "FFFFFF"),
    check: await icon("TbCircleCheck", "FFFFFF"),
    alert: await icon("TbAlertTriangle", "FFFFFF"),
    scope: await icon("TbMicroscope", "FFFFFF"),
    books: await icon("TbBooks", "FFFFFF"),
  };

  // ============================================================ 1. Title + concept
  pres.addSection({ title: "Concept" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Concept" });
  text(s, "POSTER DIGEST  ·  POWER MAGNETICS", {
    x: 0.6, y: 0.55, w: 7.0, h: 0.3, fontSize: 12, bold: true, color: C.accent4, charSpacing: 3, objectName: "Kicker",
  });
  s.addText("Experimental Verification of Automated Loss Simulation for Magnetic Components", { placeholder: "title" });
  s.addText("A Python-driven PLECS · SPICE · Ansys Maxwell loss workflow, checked against near-adiabatic calorimetry", { placeholder: "subtitle" });
  text(s, [
    { text: "Based on the poster by P. Skoff, M. Stoiber, J. Reynvaan and W. Konrad", options: { bold: true, breakLine: true } },
    { text: "Silicon Austria Labs (SAL), with Infineon Technologies AG · Power Electronics for Energy Transition Symposium, Vienna, 29–30 Sep 2026" },
  ], { x: 0.6, y: 3.95, w: 7.0, h: 0.6, fontSize: 11, color: C.background2, valign: "top", objectName: "Source" });

  const heroW = 4.78;
  const heroMeta = await sharp(path.join(ASSETS, "skin_effect_400kHz.png")).metadata();
  const heroH = (heroW * heroMeta.height) / heroMeta.width;
  s.addImage({
    path: path.join(ASSETS, "skin_effect_400kHz.png"), x: 7.95, y: 0.55, w: heroW, h: heroH,
    altText: "Computed current density at 400 kHz: a 1 mm solid copper wire carries current mainly in a thin rim (skin effect), while 0.1 mm litz strands carry it uniformly.",
    objectName: "Hero skin-effect figure",
  });
  text(s, "Computed for this deck (skin effect only, δ ≈ 0.10 mm in copper at 400 kHz): why solid and litz windings behave so differently.", {
    x: 7.95, y: 0.6 + heroH, w: heroW, h: 0.5, fontSize: 10, italic: true, color: C.background2, align: "center", objectName: "Hero caption",
  });

  const concept = [
    { t: "1 · Simulate", d: "Python chains PLECS waveforms, Infineon SPICE switch models and 2D FEM in Ansys Maxwell to predict every loss.", c: C.accent1, i: ico.simulate },
    { t: "2 · Measure", d: "A stirred, near-adiabatic Dewar calorimeter turns the inductor’s heat into watts: P = C·ΔT/Δt.", c: C.accent2, i: ico.measure },
    { t: "3 · Compare", d: "Buck converter, RM14LP, 400 kHz: litz-wire loss predicted within ≈ 1 %, solid wire ≈ 8 % too low.", c: C.accent4, i: ico.compare },
  ];
  const cw = 3.62, gap = (12.13 - 3 * cw) / 2, cy = 4.85, ch = 1.95;
  concept.forEach((k, i) => {
    const x = 0.6 + i * (cw + gap);
    card(s, x, cy, cw, ch, C.background1, `Concept card ${i + 1}`, 91);
    iconDisc(s, x + 0.25, cy + 0.27, 0.62, k.c, k.i, `Concept icon ${i + 1}`);
    text(s, k.t, { x: x + 1.05, y: cy + 0.25, w: 2.4, h: 0.4, fontSize: 17, bold: true, color: C.background1, valign: "middle", objectName: `Concept title ${i + 1}` });
    text(s, k.d, { x: x + 1.05, y: cy + 0.7, w: 2.37, h: 1.1, fontSize: 12, color: C.background2, valign: "top", objectName: `Concept text ${i + 1}` });
    if (i < 2) {
      s.addImage({ data: ico.arrow, x: x + cw + (gap - 0.34) / 2, y: cy + (ch - 0.34) / 2, w: 0.34, h: 0.34, altText: "next step", objectName: `Concept arrow ${i + 1}` });
    }
  });
  s.addNotes(
    "WHAT THE POSTER IS ABOUT\n" +
    "The poster 'Experimental verification of automated loss-simulation of magnetic components' (P. Skoff, M. Stoiber, J. Reynvaan, W. Konrad; Silicon Austria Labs with Infineon Technologies AG; Power Electronics for Energy Transition Symposium 2026) asks one question: can an automated simulation chain be trusted to predict the losses of an inductor or transformer before it is built?\n\n" +
    "Why this is hard: winding losses depend on the whole frequency content of the current (skin and proximity effect), core losses depend nonlinearly on flux density, frequency and waveform, and electrical V*I loss measurements on high-Q components are very sensitive to phase errors.\n\n" +
    "The poster therefore combines two independent pillars: (1) an automated Python workflow that simulates the converter in PLECS, the switch losses with Infineon SPICE models and the magnetic component with 2D FEM in Ansys Maxwell; (2) a calorimetric measurement that captures the component's heat directly. The comparison on a 400 kHz, ~880 W buck-converter inductor (RM14LP core) shows excellent agreement for a litz winding and an ~8 % under-prediction for a solid-wire winding.\n\n" +
    "Figure on the right (computed for this deck, not taken from the poster): exact Bessel-function solution for the current density of an isolated round copper conductor at 400 kHz. In a 1 mm solid wire the current crowds into a skin of ~0.10 mm (R_ac/R_dc ~ 2.7 from skin effect alone); 0.1 mm litz strands carry it uniformly. This is the physics behind the solid-vs-litz result on slide 5."
  );

  // ============================================================ 2. Simulation workflow
  pres.addSection({ title: "Method" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("The automated simulation workflow", { placeholder: "title" });
  s.addText("One Python-scripted chain from circuit waveform to switch and component losses", { placeholder: "message" });

  const steps = [
    { t: "Circuit model", tool: "PLECS", d: [{ text: "The converter is drawn in PLECS and run at its operating point (case study: buck converter, 400 kHz, ≈ 880 W)." }] },
    { t: "Switch losses", tool: "Infineon SPICE", d: [{ text: "Conduction and switching losses from Infineon device models in a SPICE solver: ≈ 6.8 W per switch." }] },
    { t: "Waveform → spectrum", tool: "Python · FFT", d: [{ text: "The inductor current is exported and Fourier-analysed; only the 10 most dominant frequency components are kept." }] },
    { t: "Magnetic FEM", tool: "Ansys Maxwell 2D", d: [{ text: "The components drive the 2D model as parallel current sources; core, air gaps, insulation, layer stack and wire (solid / litz) are set." }] },
    {
      t: "Loss summary", tool: "Python",
      d: [
        { text: "Core and winding losses are summed over all components:", options: { breakLine: true } },
        { text: "P" },
        { text: "w", options: { subscript: true } },
        { text: " = Σ I" },
        { text: "n", options: { subscript: true } },
        { text: "² · R" },
        { text: "ac", options: { subscript: true } },
        { text: "(f" },
        { text: "n", options: { subscript: true } },
        { text: ")   with R" },
        { text: "ac", options: { subscript: true } },
        { text: " from skin + proximity effect" },
      ],
    },
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
    text(s, st.d, { x: 1.3, y: y + 0.36, w: 5.9, h: 0.6, fontSize: 12.5, color: C.text1, valign: "top", objectName: `Workflow text ${i + 1}` });
  });

  // right column: why 10 components suffice (own calculation)
  const rx = 7.55, rw = 5.18;
  card(s, rx, 1.7, rw, 3.42, C.background2, "Harmonics card");
  text(s, "Why ~10 frequency components are enough", { x: rx + 0.25, y: 1.8, w: rw - 0.5, h: 0.32, fontSize: 14, bold: true, color: C.text2, objectName: "Harmonics title" });
  text(s, "Share of the ripple-related winding loss captured by the first N harmonics", { x: rx + 0.25, y: 2.12, w: rw - 0.5, h: 0.28, fontSize: 11, color: C.accent3, objectName: "Harmonics subtitle" });
  const N = 15;
  const xs = Array.from({ length: N }, (_, k) => k + 1);
  s.addChart(pres.charts.SCATTER, [
    { name: "N", values: xs },
    { name: "skin-effect limit (∝ √f)", values: harmonicShare(0.5, N) },
    { name: "proximity limit (∝ f²)", values: harmonicShare(2, N) },
  ], {
    x: rx + 0.1, y: 2.38, w: rw - 0.2, h: 2.0, objectName: "Harmonic share chart",
    altText: "Line chart: share of ripple winding loss captured versus number of harmonics kept. Skin-effect limit reaches 99.9 % at N = 10; proximity-effect limit reaches 98 % at N = 10.",
    chartColors: [HEX.accent1, HEX.accent2], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    catAxisMinVal: 0, catAxisMaxVal: 16, catAxisMajorUnit: 2, valAxisMinVal: 80, valAxisMaxVal: 100, valAxisMajorUnit: 5,
    valAxisLabelFormatCode: "0", showCatAxisTitle: true, catAxisTitle: "harmonics kept, N",
    showValAxisTitle: true, valAxisTitle: "loss captured (%)",
    showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: HEX.dk1,
    ...chartFont, ...chartFrame,
  });
  text(s, "N = 10 captures ≥ 98 % even in the worst (proximity-dominated) case", {
    x: rx + 0.25, y: 4.4, w: rw - 0.5, h: 0.28, fontSize: 11.5, bold: true, color: C.accent1, objectName: "Harmonics key result",
  });
  text(s, [
    { text: "Own illustration, not poster data: symmetric triangular ripple (I" },
    { text: "n", options: { subscript: true } },
    { text: " ∝ 1/n², odd n); limits R" },
    { text: "ac", options: { subscript: true } },
    { text: " ∝ √f (d ≫ δ) and R" },
    { text: "ac", options: { subscript: true } },
    { text: " ∝ f² (d ≪ δ) [9, 10]." },
  ], {
    x: rx + 0.25, y: 4.69, w: rw - 0.5, h: 0.36, fontSize: 9, color: C.accent3, valign: "top", objectName: "Harmonics footnote",
  });

  card(s, rx, 5.3, rw, 1.55, C.background2, "Case study card");
  text(s, "CASE STUDY", { x: rx + 0.25, y: 5.38, w: rw - 0.5, h: 0.22, fontSize: 10, bold: true, color: C.accent2, charSpacing: 2, objectName: "Case study label" });
  text(s, "Buck converter · RM14LP core · 400 kHz · ≈ 880 W", { x: rx + 0.25, y: 5.6, w: rw - 0.5, h: 0.3, fontSize: 13, bold: true, color: C.text2, valign: "middle", objectName: "Case study title" });
  [
    ["≈ 6.8 W", "loss per switch (SPICE)"],
    ["6.75 W", "inductor, solid wire (FEM)"],
    ["6.70 W", "inductor, litz wire (FEM)"],
  ].forEach(([v, l], i) => {
    const x = rx + 0.25 + i * 1.6;
    text(s, v, { x, y: 5.95, w: 1.55, h: 0.45, fontSize: 22, bold: true, color: C.accent1, fontFace: "+mj-lt", valign: "middle", objectName: `Case stat ${i + 1}` });
    text(s, l, { x, y: 6.4, w: 1.55, h: 0.4, fontSize: 10.5, color: C.accent3, valign: "top", objectName: `Case label ${i + 1}` });
  });
  s.addNotes(
    "HOW THE AUTOMATED WORKFLOW WORKS (poster panel 'Simulation results - example: buck converter')\n" +
    "1) The converter is drawn in PLECS and simulated at its operating point.\n" +
    "2) Switch losses are simulated in a SPICE solver with Infineon device models (about 6.8 W per switch in the case study).\n" +
    "3) The waveforms needed for the magnetic component are extracted from PLECS and an FFT is computed. The 10 most dominant frequency components are kept; according to the poster this gives good results with acceptable simulation time.\n" +
    "4) In Ansys Maxwell (2D), these components are applied as parallel current sources, one per frequency. The script assigns layer stack / winding structure and wire type (litz or solid), core size and material, insulation and air gaps.\n" +
    "5) Losses are summed over the frequency components. For the winding this superposition is exact as long as the field problem is linear (constant permeability, no saturation): P_w = sum of I_n^2 * R_ac(f_n) [9, 10]. For the core it is an approximation because core loss is nonlinear in flux density; time-domain methods such as iGSE / i2GSE [15, 16] are the usual alternative.\n\n" +
    "WHY ABOUT TEN COMPONENTS ARE ENOUGH (own calculation, not from the poster)\n" +
    "For a symmetric triangular ripple current the harmonic amplitudes fall as 1/n^2 (odd n only). Higher harmonics see a larger AC resistance. In the worst case - a proximity-dominated winding with R_ac rising like f^2 - the first ten harmonics still capture about 98 % of the ripple-related winding loss; in the skin-effect regime (R_ac ~ sqrt f) it is above 99.9 %. Truncating at ten components is therefore physically well justified.\n\n" +
    "CASE STUDY: buck converter, RM14LP core, 400 kHz, about 880 W. Simulated results: ~6.8 W per switch, inductor 6.75 W with solid wire and 6.70 W with litz wire."
  );

  // ============================================================ 3. Calorimetric set-up
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("Measuring loss as heat: near-adiabatic calorimetry", { placeholder: "title" });
  s.addText("Every watt dissipated in the DUT heats a stirred liquid; the loss follows from the temperature slope", { placeholder: "message" });
  const schH = 5.25, schW = (schH * 2200) / 2300;
  s.addImage({
    path: path.join(ASSETS, "calorimeter_schematic.png"), x: 0.6, y: 1.6, w: schW, h: schH,
    altText: "Schematic of the calorimeter: Dewar flask with vacuum jacket and double lid, stirred dielectric liquid, submerged inductor under test, calibration heater, stirrer motor with Arduino, PT100 probes read by a DAQ970A.",
    objectName: "Calorimeter schematic",
  });

  const ex = 5.95, ew = 6.78;
  card(s, ex, 1.6, ew, 1.5, C.background2, "Energy balance card");
  text(s, [
    { text: "P", options: { italic: true } },
    { text: "loss", options: { subscript: true } },
    { text: " = C" },
    { text: "eq", options: { subscript: true } },
    { text: " · ΔT / Δt" },
  ], { x: ex + 0.25, y: 1.7, w: 4.0, h: 0.6, fontSize: 26, color: C.text2, fontFace: "+mj-lt", valign: "middle", objectName: "Energy balance equation" });
  text(s, "energy balance of a closed system", { x: ex + 4.2, y: 1.78, w: 2.35, h: 0.45, fontSize: 11, italic: true, color: C.accent3, align: "right", valign: "middle", objectName: "Energy balance label" });
  text(s, [
    { text: "C" },
    { text: "eq", options: { subscript: true } },
    { text: " is the total heat capacity inside the Dewar (liquid + DUT + enclosure). The relation holds while heat exchange with the ambient is negligible — hence vacuum jacket, double lid and calibration under identical conditions." },
  ], { x: ex + 0.25, y: 2.33, w: ew - 0.5, h: 0.7, fontSize: 12, color: C.text1, valign: "top", objectName: "Energy balance text" });

  text(s, "Set-up", { x: ex, y: 3.33, w: 3.2, h: 0.35, fontSize: 14, bold: true, color: C.text2, objectName: "Setup heading" });
  [
    "Dewar flask with vacuum jacket",
    "Custom double lid",
    "Dielectric liquid, stirred",
    "Stepper-motor stirrer + Arduino",
    "DUT: inductor, fully submerged",
    "Heater: wire-wound resistor",
    "PT100 (liquid, ambient) → DAQ970A",
  ].forEach((label, i) => {
    const y = 3.8 + i * 0.43;
    numberDisc(s, ex, y, 0.3, C.text2, i + 1, 11, `Setup marker ${i + 1}`);
    text(s, label, { x: ex + 0.42, y, w: 2.85, h: 0.3, fontSize: 12, color: C.text1, valign: "middle", objectName: `Setup item ${i + 1}` });
  });

  const wx = 9.45, ww = 3.28;
  text(s, "Why calorimetry?", { x: wx, y: 3.33, w: ww, h: 0.35, fontSize: 14, bold: true, color: C.text2, objectName: "Why heading" });
  [
    { t: "Waveform-independent", d: "Heat is measured, not V·I, so phase errors drop out. Electrically ΔP/P ≈ Q·Δφ: Q = 100 and 0.1° give 17 % [3, 6].", i: ico.wave },
    { t: "Closed, near-adiabatic", d: "Only ΔT/Δt is needed: no coolant flow measurement, unlike steady-state calorimeters [4, 5].", i: ico.flask },
    { t: "Uniform liquid bath", d: "Insulating liquid with high heat capacity; continuous stirring prevents hot spots.", i: ico.droplet },
  ].forEach((k, i) => {
    const y = 3.8 + i * 1.0;
    iconDisc(s, wx, y, 0.42, C.accent2, k.i, `Why icon ${i + 1}`);
    text(s, k.t, { x: wx + 0.55, y: y - 0.02, w: ww - 0.55, h: 0.3, fontSize: 12.5, bold: true, color: C.text2, valign: "middle", objectName: `Why title ${i + 1}` });
    text(s, k.d, { x: wx + 0.55, y: y + 0.28, w: ww - 0.55, h: 0.68, fontSize: 10.5, color: C.text1, valign: "top", objectName: `Why text ${i + 1}` });
  });
  s.addNotes(
    "THE MEASUREMENT IDEA (poster panel 'Setup for measuring inductor losses')\n" +
    "All losses of the component - core and winding - end up as heat. The DUT is fully submerged in a dielectric liquid inside a Dewar flask (vacuum-insulated) closed by a custom double lid, so heat exchange with the ambient is very small: the system is near-adiabatic. The dissipated power then only raises the temperature of the contents: P_loss = C_eq * dT/dt, with C_eq the total heat capacity of liquid, DUT and enclosure.\n\n" +
    "Why this design: steady-state calorimeters, such as the double-jacketed designs in [4, 5], derive the loss from coolant mass flow and inlet/outlet temperature; the near-adiabatic transient method needs no mass-flow measurement at all. Unlike electrical V*I methods, the result is independent of waveform and frequency: for a high-Q inductor the relative loss error caused by a phase error d_phi is about Q * d_phi, e.g. 17 % for Q = 100 and 0.1 degree [3, 6]. The liquid gives electrical insulation and a high heat capacity at reasonable cost, and it is stirred continuously during calibration and measurement so that it heats uniformly.\n\n" +
    "Hardware listed on the poster: Dewar with custom double lid; stepper motor + Arduino as stirrer; PT100 sensors for liquid and ambient temperature; Keysight DAQ970A data acquisition; wire-wound resistor as heating element for calibration. The schematic is drawn for this deck (numbers 1-7 match the list).\n\n" +
    "Related work: the same SAL group evaluated a fluid-based transient calorimeter for ferrite core losses (Reynvaan et al., ICPE 2023 [2]); ETH Zurich's transient calorimetric core-loss method [3] is a closely related approach."
  );

  // ============================================================ 4. Calibration and procedure
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Method" });
  s.addText("Calibration: the temperature slope measures power", { placeholder: "title" });
  s.addText("Known heater powers map slope to watts; the DUT’s slope is then read off the same calibration line", { placeholder: "message" });

  // chart A: model records
  const powers = [2, 4, 6, 8, 10, 13];
  const ramp = ["DDB089", "D69A63", "CB8445", "C46A2B", "9C521F", "6E3814"];
  const tA = Array.from({ length: 61 }, (_, k) => k);
  card(s, 0.6, 1.6, 6.0, 3.25, C.background2, "Records card");
  text(s, "① Raw records: ΔT(t) at known heater power", { x: 0.85, y: 1.68, w: 5.5, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Records title" });
  const A = { x: 0.7, y: 2.02, w: 5.8, h: 2.75, lx: 0.11, ly: 0.05, lw: 0.77, lh: 0.72, xMax: 60, yMax: 200 };
  s.addChart(pres.charts.SCATTER, [
    { name: "t", values: tA },
    ...powers.map((p) => ({ name: `${p} W`, values: tA.map((t) => Math.round(dT(p, t) * 1e5) / 100) })),
  ], {
    x: A.x, y: A.y, w: A.w, h: A.h, layout: { x: A.lx, y: A.ly, w: A.lw, h: A.lh }, objectName: "Calibration records chart",
    altText: "Model temperature rise versus time for heater powers 2 to 13 W: after a short thermal lag each curve becomes a straight line whose slope is proportional to power.",
    chartColors: ramp, lineSize: 2.25, lineDataSymbol: "none",
    catAxisMinVal: 0, catAxisMaxVal: A.xMax, catAxisMajorUnit: 10, valAxisMinVal: 0, valAxisMaxVal: A.yMax, valAxisMajorUnit: 50,
    valAxisLabelFormatCode: "0", showCatAxisTitle: true, catAxisTitle: "time t (s)", showValAxisTitle: true, valAxisTitle: "ΔT (mK)",
    showLegend: false, ...chartFont, ...chartFrame,
  });
  const ax0 = A.x + A.lx * A.w, ay0 = A.y + A.ly * A.h, aw = A.lw * A.w, ah = A.lh * A.h;
  const ax = (t) => ax0 + (t / A.xMax) * aw;
  const ay = (v) => ay0 + (1 - v / A.yMax) * ah;
  s.addShape(pres.shapes.RECTANGLE, { x: ax(3 * TAU), y: ay0, w: ax(60) - ax(3 * TAU), h: ah, fill: { color: C.accent1, transparency: 88 }, line: { type: "none" }, objectName: "Linear region band" });
  text(s, "linear region → fit slope s", { x: ax(3 * TAU) + 0.06, y: ay0 + 0.04, w: 2.2, h: 0.25, fontSize: 10, bold: true, color: C.accent1, objectName: "Linear region label" });
  text(s, "thermal lag: heat must first reach the liquid and sensor", { x: ax0 + 0.06, y: ay0 + 0.04, w: ax(3 * TAU) - ax0 - 0.12, h: 0.5, fontSize: 9.5, italic: true, color: C.accent3, objectName: "Thermal lag label" });
  powers.forEach((p, i) => {
    text(s, `${p} W`, { x: ax(60) + 0.05, y: ay(1000 * dT(p, 60)) - 0.1, w: 0.5, h: 0.2, fontSize: 9.5, bold: true, color: ramp[i] === "DDB089" ? "B98A5E" : ramp[i], valign: "middle", objectName: `Record label ${p} W` });
  });

  // chart B: calibration line with DUT read-off
  const pDut = 7.4;
  const xB = [0, 2, 4, 6, pDut, pDut, 8, 10, 13, 14];
  const pick = (idx, fn) => xB.map((x, k) => (idx.includes(k) ? Math.round(fn(x, k) * 1e4) / 1e4 : null));
  card(s, 6.85, 1.6, 5.88, 3.25, C.background2, "Calibration line card");
  text(s, "② Calibration line: slope vs. power", { x: 7.1, y: 1.68, w: 5.4, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Calibration line title" });
  const B = { x: 6.95, y: 2.02, w: 5.68, h: 2.75, lx: 0.12, ly: 0.05, lw: 0.83, lh: 0.72, xMax: 14, yMax: 4 };
  s.addChart(pres.charts.SCATTER, [
    { name: "P", values: xB },
    { name: "Heater calibration", values: pick([1, 2, 3, 6, 7, 8], (x) => slope(x)) },
    { name: "Linear fit", values: pick([0, 9], (x) => slope(x)) },
    { name: "DUT readout", values: pick([0, 4, 5], (x, k) => (k === 5 ? 0 : slope(pDut))) },
    { name: "DUT", values: pick([4], () => slope(pDut)) },
  ], {
    x: B.x, y: B.y, w: B.w, h: B.h, layout: { x: B.lx, y: B.ly, w: B.lw, h: B.lh }, objectName: "Calibration line chart",
    altText: "Calibration line: temperature slope in mK/s versus heater power in W is a straight line; a DUT slope of 2.11 mK/s reads as 7.4 W.",
    chartColors: [HEX.accent2, HEX.accent3, HEX.accent1, HEX.accent1], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 9,
    catAxisMinVal: 0, catAxisMaxVal: B.xMax, catAxisMajorUnit: 2, valAxisMinVal: 0, valAxisMaxVal: B.yMax, valAxisMajorUnit: 1,
    valAxisLabelFormatCode: "0", showCatAxisTitle: true, catAxisTitle: "power P (W)", showValAxisTitle: true, valAxisTitle: "slope s (mK/s)",
    showLegend: false, displayBlanksAs: "span", ...chartFont, ...chartFrame,
  });
  const bx0 = B.x + B.lx * B.w, by0 = B.y + B.ly * B.h, bw = B.lw * B.w, bh = B.lh * B.h;
  const bxp = (p) => bx0 + (p / B.xMax) * bw;
  const byp = (v) => by0 + (1 - v / B.yMax) * bh;
  text(s, [
    { text: "● ", options: { color: HEX.accent2 } }, { text: "heater calibration points", options: { breakLine: true } },
    { text: "‒ ‒ ", options: { color: HEX.accent3, bold: true } }, { text: "linear fit, s = P / C", options: {} }, { text: "eq", options: { subscript: true, breakLine: true } },
    { text: "◆ ", options: { color: HEX.accent1 } }, { text: "DUT reading (example)" },
  ], { x: bx0 + 0.1, y: by0 + 0.05, w: 2.4, h: 0.62, fontSize: 9.5, color: C.text1, valign: "top", objectName: "Calibration key" });
  text(s, `DUT: s = ${slope(pDut).toFixed(2)} mK/s → P = ${pDut.toFixed(1)} W`, {
    x: bxp(pDut) + 0.1, y: byp(slope(pDut)) + 0.1, w: 2.1, h: 0.25, fontSize: 10, bold: true, color: C.accent1, objectName: "DUT reading label",
  });
  text(s, [
    { text: "Model illustration, not poster data: ΔT(t) = (P/C" },
    { text: "eq", options: { subscript: true } },
    { text: ")·[t − τ(1 − e^(−t/τ))] with C" },
    { text: "eq", options: { subscript: true } },
    { text: " = 3.5 kJ/K, τ = 8 s (first-order lag between heat source and liquid)." },
  ], {
    x: 0.6, y: 4.9, w: 6.0, h: 0.34, fontSize: 9, color: C.accent3, valign: "top", objectName: "Model footnote",
  });
  text(s, "Accuracy measures from the poster: every run starts at 35 °C · DUT stays submerged during calibration (its heat capacity counts) · continuous stirring.", {
    x: 6.85, y: 4.9, w: 5.88, h: 0.34, fontSize: 9.5, bold: true, color: C.accent1, valign: "top", objectName: "Accuracy note",
  });

  const proc = [
    { t: "Calibrate", d: "Heat the liquid with the resistor at known DC power (2 … 13 W), DUT submerged." },
    { t: "Fit", d: "Use only the linear part of each ΔT(t) record → slope s = ΔT/Δt for every power." },
    { t: "Measure", d: "Operate the DUT in the converter exactly as in normal operation; record its slope." },
    { t: "Read off", d: [{ text: "P" }, { text: "DUT", options: { subscript: true } }, { text: " follows from the calibration line, interpolating between calibrated slopes." }] },
  ];
  const pw = (12.13 - 3 * 0.3) / 4;
  proc.forEach((k, i) => {
    const x = 0.6 + i * (pw + 0.3), y = 5.33;
    card(s, x, y, pw, 1.52, C.background2, `Procedure card ${i + 1}`);
    numberDisc(s, x + 0.2, y + 0.2, 0.42, C.accent2, i + 1, 14, `Procedure step ${i + 1}`);
    text(s, k.t, { x: x + 0.75, y: y + 0.2, w: pw - 0.95, h: 0.42, fontSize: 14, bold: true, color: C.text2, valign: "middle", objectName: `Procedure title ${i + 1}` });
    text(s, k.d, { x: x + 0.2, y: y + 0.72, w: pw - 0.4, h: 0.72, fontSize: 11, color: C.text1, valign: "top", objectName: `Procedure text ${i + 1}` });
  });
  s.addNotes(
    "CALIBRATION (poster panel 'Calibration of setup')\n" +
    "Heating the liquid with a wire-wound resistor at known power for known time periods yields a series of temperature records. After an initial delay - heat must first flow from the source into the liquid and reach the PT100 - the temperature rises linearly. The linear regions are fitted and give a set of slopes dT/dt; the slope steepness is directly proportional to the power. Intermediate powers are interpolated between calibrated slopes.\n\n" +
    "Accuracy measures stated on the poster: (a) the DUT must be fully submerged in the enclosure during calibration, because it adds a non-negligible heat capacity to the system; (b) the initial liquid temperature is held at 35 degC for every run, so heat leakage and material properties are identical in calibration and measurement; (c) the liquid is stirred continuously for uniform heating.\n\n" +
    "MEASUREMENT (poster panel 'Results'): the DUT is operated as in normal operation, the dT/dt slope is recorded, and the most linear portion is compared with the calibration data.\n\n" +
    "IMPORTANT: the two charts are a model illustration made for this deck (first-order lag, C_eq = 3.5 kJ/K, tau = 8 s), not the poster's calibration data. They show the principle: slope = P / C_eq, and a DUT slope maps back to watts on the calibration line. The model also explains the initial non-linear part of every record."
  );

  // ============================================================ 5. Results and conclusions
  pres.addSection({ title: "Results" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Results" });
  s.addText("Results: simulation vs. calorimetric measurement", { placeholder: "title" });
  s.addText("Litz-wire loss is predicted within ≈ 1 %; the extra loss of solid wire is under-estimated by ≈ 8 %", { placeholder: "message" });

  const runs = { solid: [7.3, 7.4, 7.4], litz: [6.7, 6.7, 6.6] };
  const sim = { solid: 6.75, litz: 6.7 };
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const dev = (k) => (100 * (sim[k] - mean(runs[k]))) / mean(runs[k]);
  card(s, 0.6, 1.6, 6.1, 5.25, C.background2, "Results chart card");
  text(s, "Inductor loss — RM14LP, 400 kHz, ≈ 880 W", { x: 0.85, y: 1.68, w: 5.6, h: 0.32, fontSize: 13, bold: true, color: C.text2, objectName: "Results chart title" });
  s.addChart(pres.charts.BAR, [
    { name: "Simulated (2D FEM)", labels: ["Solid wire", "Litz wire"], values: [sim.solid, sim.litz] },
    { name: "Measured (mean of 3 runs)", labels: ["Solid wire", "Litz wire"], values: [mean(runs.solid), mean(runs.litz)].map((v) => Math.round(v * 1000) / 1000) },
  ], {
    x: 0.7, y: 2.02, w: 5.9, h: 3.05, objectName: "Results bar chart",
    altText: "Clustered columns: solid wire simulated 6.75 W vs measured 7.37 W; litz wire simulated 6.70 W vs measured 6.67 W.",
    barDir: "col", barGrouping: "clustered", barGapWidthPct: 70, chartColors: [HEX.accent1, HEX.accent2],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelFontSize: 11, dataLabelColor: HEX.dk1, dataLabelFontBold: true,
    valAxisMinVal: 0, valAxisMaxVal: 8, valAxisMajorUnit: 2, valAxisLabelFormatCode: "0", showValAxisTitle: true, valAxisTitle: "loss (W)",
    catAxisLabelFontSize: 12, showLegend: true, legendPos: "b", legendFontSize: 10.5, legendColor: HEX.dk1,
    ...chartFont, ...chartFrame, catAxisLabelColor: HEX.dk1,
  });
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 10.5 } });
  const devCell = (k) => {
    const v = dev(k);
    return { text: `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)} %`, options: { bold: true, color: Math.abs(v) < 2 ? C.accent5 : C.accent6 } };
  };
  const row = (k, label) => [
    { text: label, options: { bold: true, align: "left" } },
    ...runs[k].map((v) => v.toFixed(1)),
    mean(runs[k]).toFixed(2), sim[k].toFixed(2), devCell(k),
  ];
  s.addTable([
    [hdr("Wire"), hdr("Run 1"), hdr("Run 2"), hdr("Run 3"), hdr("Mean"), hdr("Simulated"), hdr("Sim. vs. mean")],
    row("solid", "Solid"), row("litz", "Litz"),
  ], {
    x: 0.85, y: 5.27, w: 5.6, colW: [0.85, 0.65, 0.65, 0.65, 0.75, 0.9, 1.15], rowH: 0.31,
    fontSize: 11, color: C.text1, fill: { color: C.background1 }, align: "center", valign: "middle", margin: [0.03, 0.08, 0.03, 0.08],
    border: { type: "solid", pt: 0.75, color: GRID }, objectName: "Measurement table",
  });
  text(s, "Calorimetric runs from the poster; all values in W. Deviation = (simulated − measured mean) / measured mean.", {
    x: 0.85, y: 6.3, w: 5.6, h: 0.42, fontSize: 9, color: C.accent3, valign: "top", objectName: "Table note",
  });

  const kx = 6.95, kw = 2.74;
  [
    { k: "LITZ WIRE", v: `+${dev("litz").toFixed(1)} %`, c: C.accent5, l: "simulated vs. measured mean", r: "per run: 0 … +1.5 %" },
    { k: "SOLID WIRE", v: `−${Math.abs(dev("solid")).toFixed(1)} %`, c: C.accent6, l: "simulated vs. measured mean", r: "per run: −7.5 … −8.8 %" },
  ].forEach((k, i) => {
    const x = kx + i * (kw + 0.3);
    card(s, x, 1.6, kw, 1.45, C.background2, `Deviation card ${i + 1}`);
    text(s, k.k, { x: x + 0.2, y: 1.7, w: kw - 0.4, h: 0.22, fontSize: 10, bold: true, color: C.text2, charSpacing: 2, objectName: `Deviation wire ${i + 1}` });
    text(s, k.v, { x: x + 0.2, y: 1.92, w: kw - 0.4, h: 0.58, fontSize: 32, bold: true, color: k.c, fontFace: "+mj-lt", valign: "middle", objectName: `Deviation value ${i + 1}` });
    text(s, [{ text: k.l, options: { breakLine: true } }, { text: k.r }], { x: x + 0.2, y: 2.53, w: kw - 0.4, h: 0.45, fontSize: 10.5, color: C.text1, valign: "top", objectName: `Deviation label ${i + 1}` });
  });
  [
    { t: "Validated for litz windings", d: "The prediction lies within the measurement repeatability (± 0.05 W), so the workflow can drive automated design-space exploration.", c: C.accent5, i: ico.check },
    { t: "Solid-wire extra loss not captured", d: "Measured solid − litz = +0.70 W, simulated only +0.05 W: the HF eddy-current loss of solid conductors is under-represented.", c: C.accent4, i: ico.alert },
    { t: "What to check next (our reading)", d: "3D effects beyond the 2D model, e.g. air-gap fringing and RM end turns [13, 14]; copper resistivity at operating temperature (+0.39 %/K); core vs. winding loss split.", c: C.accent1, i: ico.scope },
  ].forEach((k, i) => {
    const y = 3.3 + i * 1.18;
    iconDisc(s, kx, y, 0.5, k.c, k.i, `Conclusion icon ${i + 1}`);
    text(s, k.t, { x: kx + 0.68, y: y - 0.02, w: 5.1, h: 0.32, fontSize: 13.5, bold: true, color: C.text2, valign: "middle", objectName: `Conclusion title ${i + 1}` });
    text(s, k.d, { x: kx + 0.68, y: y + 0.32, w: 5.1, h: 0.78, fontSize: 11.5, color: C.text1, valign: "top", objectName: `Conclusion text ${i + 1}` });
  });
  s.addNotes(
    "RESULTS (poster panel 'Results & conclusion')\n" +
    "Six calorimetric runs: solid wire 7.3 / 7.4 / 7.4 W, litz wire 6.7 / 6.7 / 6.6 W. Simulated: 6.75 W (solid) and 6.70 W (litz).\n" +
    "- Litz: simulation within +0.5 % of the measured mean (0 to +1.5 % per run), i.e. within the repeatability of the set-up (about +/-0.05 W).\n" +
    "- Solid: simulation 8.4 % below the measured mean (7.5 to 8.8 % per run). Seen from the other side, the measured loss is 8 to 10 % above the simulated value.\n" +
    "- The key observation: the measurement shows that solid wire costs about 0.70 W more than litz, while the simulation predicts only 0.05 W difference. The extra high-frequency eddy-current loss of the solid conductor is under-represented in the simulation.\n\n" +
    "The poster's conclusion: the Python-based workflow enables accurate loss prediction of magnetic components; litz-wound designs are very close to measurement, the solid-wire effect seems under-represented and should be investigated; the simulation is nevertheless a good approximation for inductor design.\n\n" +
    "POSSIBLE CAUSES (our interpretation, not stated on the poster): (1) 2D models cannot capture 3D field effects such as air-gap fringing fields and the end turns of an RM core, which induce strong eddy currents in solid conductors but much less in fine litz strands [13, 14]; (2) copper resistivity rises by about 0.39 %/K - if the model uses 20 degC copper while the winding runs hotter, losses are under-estimated; (3) the loss split between core and winding is not measured separately, so the error cannot yet be attributed. A 3D FEM cross-check and a temperature-coupled simulation would discriminate between these causes."
  );

  // ============================================================ 6. References
  pres.addSection({ title: "References" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "References" });
  s.addText("References and related work", { placeholder: "title" });
  s.addText("The poster prints no reference list — these sources document it and the methods it builds on", { placeholder: "message" });
  const REFS = require("./references.json");
  const refRuns = (groups) => {
    const runsOut = [];
    groups.forEach((g, gi) => {
      runsOut.push({ text: g.group, options: { bold: true, color: C.accent2, fontSize: 11, breakLine: true, paraSpaceBefore: gi ? 6 : 0, paraSpaceAfter: 2 } });
      g.items.forEach((r) => {
        runsOut.push({ text: `[${r.n}] `, options: { bold: true, color: C.text2 } });
        runsOut.push({ text: `${r.authors}, “${r.title},” ${r.pre || ""}` });
        runsOut.push({ text: r.venue, options: { italic: true } });
        runsOut.push({ text: `${r.details}.`, options: { breakLine: true, paraSpaceAfter: 3 } });
      });
    });
    const last = runsOut[runsOut.length - 1];
    delete last.options.breakLine;
    return runsOut;
  };
  const split = REFS.groups.findIndex((g) => g.column === 2);
  text(s, refRuns(REFS.groups.slice(0, split)), { x: 0.6, y: 1.6, w: 5.95, h: 4.1, fontSize: 9.5, color: C.text1, valign: "top", objectName: "References left" });
  card(s, 0.6, 5.85, 5.95, 1.0, C.background2, "References note card");
  iconDisc(s, 0.8, 6.1, 0.5, C.accent2, ico.books, "References note icon");
  text(s, [
    { text: "How these were found: ", options: { bold: true, color: C.text2 } },
    { text: "[1] is the poster\u2019s record on SAL\u2019s research portal, [2] the authors\u2019 own calorimetry paper, [3]\u2013[20] the literature on each building block. Full entries with DOIs and links: REFERENCES.md next to this deck." },
  ], { x: 1.5, y: 5.93, w: 4.9, h: 0.85, fontSize: 10, color: C.text1, valign: "middle", objectName: "References note" });
  text(s, refRuns(REFS.groups.slice(split)), { x: 6.78, y: 1.6, w: 5.95, h: 5.25, fontSize: 9.5, color: C.text1, valign: "top", objectName: "References right" });
  s.addNotes(
    "HOW THESE REFERENCES WERE FOUND\n" +
    "The poster itself carries no reference list. [1] is its bibliographic record (SAL research portal, poster at the Power Electronics for Energy Transition Symposium 2026, organised by AIT and SAL). [2] is the authors' own paper on the fluid-based transient calorimeter that the measurement set-up builds on. The other entries are the established literature for the three building blocks of the poster: calorimetric loss measurement [3]-[8], loss modelling of windings and cores [9]-[16], and automated or integrated simulation / design workflows with a similar aim [17]-[20]. Full entries with DOIs and links are in REFERENCES.md next to this deck.\n\n" +
    "Related activity by the same group: an SAL team including M. Stoiber, J. Reynvaan and W. Konrad received 3rd place in the Innovation Track of the MagNet Challenge 2 (data-driven magnetics modelling, see [20])."
  );

  await pres.writeFile({ fileName: OUT });
  await postProcessCharts(OUT);
  await applyThemeColors(OUT, THEME);
  console.log("wrote " + OUT);
}

// ---------------------------------------------------------------- post-processing
// pptxgenjs styles all scatter series alike and writes blank points as empty <c:v/>.
// Drop the blank points (so the series really skip them) and give each series of the
// calibration chart its own look: markers only, dashed fit, dotted read-off guide.
function loadJSZip() {
  return require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
}

function styleSeries(xml, name, { noLine = false, noMarker = false, dash = null, symbol = null, size = null }) {
  return xml.replace(/<c:ser>[\s\S]*?<\/c:ser>/g, (ser) => {
    if (!ser.includes(`<c:v>${name}</c:v>`)) return ser;
    let out = ser;
    if (noLine) out = out.replace(/(<\/c:tx>\s*<c:spPr>[\s\S]*?)<a:ln\b[^>]*>[\s\S]*?<\/a:ln>/, "$1<a:ln><a:noFill/></a:ln>");
    if (dash) out = out.replace(/(<\/c:tx>\s*<c:spPr>[\s\S]*?<a:prstDash val=")solid(")/, `$1${dash}$2`);
    if (noMarker) out = out.replace(/<c:marker>[\s\S]*?<\/c:marker>/, '<c:marker><c:symbol val="none"/></c:marker>');
    if (symbol) out = out.replace(/<c:symbol val="[a-z]+"\/>/, `<c:symbol val="${symbol}"/>`);
    if (size) out = out.replace(/<c:size val="\d+"\/>/, `<c:size val="${size}"/>`);
    return out;
  });
}

async function postProcessCharts(file) {
  const zip = await loadJSZip().loadAsync(fs.readFileSync(file));
  for (const name of Object.keys(zip.files).filter((n) => /^ppt\/charts\/chart\d+\.xml$/.test(n))) {
    let xml = await zip.file(name).async("string");
    xml = xml.replace(/<c:pt idx="\d+"><c:v><\/c:v><\/c:pt>/g, "");
    if (xml.includes("<c:v>Heater calibration</c:v>")) {
      xml = styleSeries(xml, "Heater calibration", { noLine: true });
      xml = styleSeries(xml, "Linear fit", { noMarker: true, dash: "dash" });
      xml = styleSeries(xml, "DUT readout", { noMarker: true, dash: "sysDot" });
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
