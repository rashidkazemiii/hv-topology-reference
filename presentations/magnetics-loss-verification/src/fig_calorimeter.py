"""Schematic of the near-adiabatic (Dewar) calorimeter, written as SVG.

Original drawing for the deck (no poster imagery). Numbered markers (1-7) are explained
by the legend on the slide. Rasterise with: node render_svg.js <in.svg> <out.png>
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "calorimeter_schematic.svg"

W, H = 880, 920
INK = "#2A3640"
COPPER = "#C46A2B"
COPPER_DK = "#7E3F14"
SLATE = "#5B6B77"
MARK = "#23313A"
FONT = "Carlito, Calibri, Arial, sans-serif"


def tag(x0, x1, label, fill, stroke, color):
    cx = (x0 + x1) / 2
    return (f'<rect x="{x0}" y="40" width="{x1 - x0}" height="40" rx="8" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="2"/>'
            f'<text x="{cx}" y="67" text-anchor="middle" font-size="22" font-weight="bold" '
            f'fill="{color}">{label}</text>')


def marker(x, y, n):
    return (f'<circle cx="{x}" cy="{y}" r="19" fill="{MARK}" stroke="#FFFFFF" stroke-width="2.5"/>'
            f'<text x="{x}" y="{y + 7.5}" text-anchor="middle" font-size="22" font-weight="bold" '
            f'fill="#FFFFFF">{n}</text>')


def heat_arrow(x):
    return (f'<path d="M{x},718 q7,6 0,12 q-7,6 0,12 q7,6 0,12 l0,8" fill="none" stroke="{COPPER}" '
            f'stroke-width="4" stroke-linecap="round" marker-end="url(#arrow)"/>')


def build():
    inner = "M210,363 L210,820 Q210,870 260,870 L600,870 Q650,870 650,820 L650,363 Z"
    outer = "M180,363 L180,830 Q180,900 250,900 L610,900 Q680,900 680,830 L680,363 Z"
    turns = "".join(
        f'<circle cx="{cx}" cy="{590 + 17.5 * k}" r="7.5" fill="{COPPER}" stroke="#F2B27C" stroke-width="1"/>'
        for cx in (262, 278, 322, 338) for k in range(6)
    )
    coil = "".join(
        f'<line x1="500" y1="{612 + 15 * k}" x2="560" y2="{622 + 15 * k}" stroke="{COPPER}" '
        f'stroke-width="5" clip-path="url(#heater)"/>' for k in range(8)
    )
    wave = "M212,430 " + " ".join("q9,-6 18,0 t18,0" for _ in range(12))

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}">
<defs>
  <pattern id="vac" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#F2F5F7"/><circle cx="6" cy="6" r="1.6" fill="#9AA8B2"/>
  </pattern>
  <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="10" height="10" fill="#D7DEE3"/><line x1="0" y1="0" x2="0" y2="10" stroke="#B3BEC6" stroke-width="3"/>
  </pattern>
  <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#D6F0F2"/><stop offset="1" stop-color="#A3D5DA"/>
  </linearGradient>
  <clipPath id="inner"><path d="{inner}"/></clipPath>
  <clipPath id="heater"><rect x="500" y="600" width="60" height="130" rx="14"/></clipPath>
  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="{COPPER}"/>
  </marker>
</defs>

<!-- instrument tags (cables end at their lower edge) -->
{tag(200, 350, "converter", "#F6E6DA", COPPER, COPPER_DK)}
{tag(360, 460, "Arduino", "#DCEFF1", "#0F7C86", "#0B5D64")}
{tag(470, 590, "LV supply", "#F6E6DA", COPPER, COPPER_DK)}
{tag(600, 820, "DAQ970A", "#E7ECEF", SLATE, INK)}

<!-- Dewar flask: vacuum jacket between outer and inner wall -->
<path d="{outer}" fill="url(#vac)" stroke="{INK}" stroke-width="4"/>
<path d="{inner}" fill="#FFFFFF" stroke="{INK}" stroke-width="3"/>
<rect x="210" y="430" width="440" height="450" fill="url(#liq)" clip-path="url(#inner)"/>
<path d="{wave}" fill="none" stroke="#5FAAB2" stroke-width="2"/>
<path d="{inner}" fill="none" stroke="{INK}" stroke-width="3"/>

<!-- cables and stirrer shaft pass through the lid -->
<path d="M270,560 V80 M330,560 V80" stroke="{COPPER}" stroke-width="4" fill="none"/>
<path d="M515,600 V80 M545,600 V80" stroke="#8A4A1E" stroke-width="3" fill="none"/>
<path d="M430,170 V80" stroke="#0F7C86" stroke-width="3" fill="none"/>
<path d="M615,260 V80 M790,290 V80" stroke="{INK}" stroke-width="2.5" fill="none"/>

<line x1="430" y1="260" x2="430" y2="820" stroke="#7B8A95" stroke-width="6"/>

<!-- double lid with air gap -->
<rect x="165" y="260" width="530" height="45" rx="4" fill="url(#hatch)" stroke="{INK}" stroke-width="3"/>
<rect x="165" y="318" width="530" height="45" rx="4" fill="url(#hatch)" stroke="{INK}" stroke-width="3"/>

<!-- stirrer: stepper motor, shaft, impeller -->
<rect x="390" y="170" width="80" height="90" rx="8" fill="#4A5560" stroke="{INK}" stroke-width="2"/>
<path d="M400,192 H460 M400,208 H460 M400,224 H460 M400,240 H460" stroke="#6E7B86" stroke-width="3"/>
<path d="M430,820 L382,808 L382,832 Z M430,820 L478,808 L478,832 Z" fill="#7B8A95" stroke="{INK}" stroke-width="1.5"/>

<!-- DUT: RM-type inductor (core + winding windows) -->
<rect x="240" y="560" width="120" height="150" rx="6" fill="#3A4650" stroke="#1E262D" stroke-width="2"/>
<rect x="252" y="580" width="36" height="110" fill="#5A2E12"/>
<rect x="312" y="580" width="36" height="110" fill="#5A2E12"/>
{turns}
{heat_arrow(265)}{heat_arrow(300)}{heat_arrow(335)}
<text x="300" y="808" text-anchor="middle" font-size="26" font-style="italic" font-weight="bold" fill="{COPPER_DK}">P<tspan dy="7" font-size="17">loss</tspan></text>

<!-- calibration heater: wire-wound resistor -->
<rect x="500" y="600" width="60" height="130" rx="14" fill="#F1EBDF" stroke="#8A7F6E" stroke-width="2"/>
{coil}
<rect x="500" y="600" width="60" height="130" rx="14" fill="none" stroke="#8A7F6E" stroke-width="2"/>

<!-- PT100 probes: liquid (through the lid) and ambient -->
<rect x="610" y="260" width="10" height="300" rx="3" fill="#C3CCD2" stroke="{SLATE}" stroke-width="1.5"/>
<rect x="610" y="535" width="10" height="25" rx="3" fill="{SLATE}"/>
<rect x="785" y="290" width="10" height="90" rx="3" fill="#C3CCD2" stroke="{SLATE}" stroke-width="1.5"/>
<rect x="785" y="360" width="10" height="20" rx="3" fill="{SLATE}"/>

<!-- numbered markers (legend on slide) -->
{marker(150, 640, 1)}{marker(135, 312, 2)}{marker(590, 800, 3)}{marker(365, 215, 4)}
{marker(400, 600, 5)}{marker(530, 765, 6)}{marker(585, 500, 7)}{marker(822, 335, 7)}
</svg>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
