"""How the PLECS current becomes the FEM excitation, written as SVG (original drawing).

Left: inductor current from PLECS (DC + triangular ripple). Middle: its FFT components, each
driving one sinusoidal current source; the sources are connected in parallel, so their currents
add up (Kirchhoff's current law). Right: the summed current feeds the winding of the 2D FEM model.
Rasterise with: node render_svg.js <in.svg> <out.png>
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "fft_sources.svg"

W, H = 1000, 740
INK = "#2A3640"
TEAL = "#0F7C86"
COPPER = "#C46A2B"
SLATE = "#5B6B77"
FONT = "Carlito, Calibri, Arial, sans-serif"
LR, RR = 590, 700          # left / right rail of the parallel sources
ROWS = [  # (label, harmonic n or 0 for DC, relative amplitude text, y)
    ("DC (load current)", 0, "largest", 150),
    ("n = 1 · 0.4 MHz", 1, "100 %", 255),
    ("n = 3 · 1.2 MHz", 3, "11 %", 360),
    ("n = 5 · 2.0 MHz", 5, "4 %", 465),
    ("n = 19 · 7.6 MHz", 19, "0.3 %", 640),
]


def sine_path(x0, w, yc, amp, n, samples=400):
    if n == 0:
        return f"M{x0},{yc} H{x0 + w}"
    pts = []
    for k in range(samples + 1):
        t = k / samples
        pts.append(f"{x0 + w * t:.1f},{yc - amp * math.sin(2 * math.pi * n * t):.1f}")
    return "M" + " L".join(pts)


def source(y):
    cx = (LR + RR) / 2
    return (f'<line x1="{LR}" y1="{y}" x2="{cx - 26}" y2="{y}" stroke="{INK}" stroke-width="3"/>'
            f'<line x1="{cx + 26}" y1="{y}" x2="{RR}" y2="{y}" stroke="{INK}" stroke-width="3"/>'
            f'<circle cx="{cx}" cy="{y}" r="26" fill="#FFFFFF" stroke="{TEAL}" stroke-width="3.5"/>'
            f'<path d="M{cx - 13},{y} H{cx + 12} M{cx + 4},{y - 8} L{cx + 13},{y} L{cx + 4},{y + 8}" fill="none" '
            f'stroke="{TEAL}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="{LR}" cy="{y}" r="5" fill="{INK}"/><circle cx="{RR}" cy="{y}" r="5" fill="{INK}"/>')


def build():
    parts = []
    # --- PLECS waveform (DC + triangular ripple, two periods) ---
    px0, py0, pw, ph = 30, 300, 250, 190
    base = py0 + ph - 20
    dc_y = py0 + 95
    tri = []
    for k in range(5):
        x = px0 + 10 + k * (pw - 20) / 4
        tri.append(f"{x:.1f},{dc_y + (38 if k % 2 == 0 else -38)}")
    parts.append(f'<rect x="{px0}" y="{py0}" width="{pw}" height="{ph}" rx="10" fill="#F6F8F9" stroke="#C9D2D8" stroke-width="2"/>')
    parts.append(f'<line x1="{px0 + 10}" y1="{base}" x2="{px0 + pw - 10}" y2="{base}" stroke="{SLATE}" stroke-width="2"/>')
    parts.append(f'<line x1="{px0 + 10}" y1="{dc_y}" x2="{px0 + pw - 10}" y2="{dc_y}" stroke="{SLATE}" stroke-width="2" stroke-dasharray="6 5"/>')
    parts.append(f'<polyline points="{" ".join(tri)}" fill="none" stroke="{COPPER}" stroke-width="4" stroke-linejoin="round"/>')
    parts.append(f'<text x="{px0 + 14}" y="{dc_y - 10}" font-size="18" fill="{SLATE}">DC</text>')
    parts.append(f'<text x="{px0 + pw / 2}" y="{py0 - 52}" font-size="26" font-weight="bold" fill="{COPPER}" text-anchor="middle">PLECS result</text>')
    parts.append(f'<text x="{px0 + pw / 2}" y="{py0 - 20}" font-size="22" fill="{INK}" text-anchor="middle">inductor current i<tspan dy="6" font-size="16">L</tspan><tspan dy="-6">(t)</tspan></text>')
    parts.append(f'<text x="{px0 + pw / 2}" y="{py0 + ph + 32}" font-size="20" fill="{SLATE}" text-anchor="middle">steady state, T = 2.5 µs (400 kHz)</text>')
    # FFT arrow
    parts.append(f'<path d="M{px0 + pw + 8},{py0 + ph / 2} H{px0 + pw + 52}" stroke="{INK}" stroke-width="4" marker-end="url(#arr)"/>')
    parts.append(f'<text x="{px0 + pw + 30}" y="{py0 + ph / 2 - 14}" font-size="22" font-weight="bold" fill="{INK}" text-anchor="middle">FFT</text>')

    # --- component thumbnails + parallel sources ---
    tx0, tw = 345, 200
    parts.append(f'<text x="{tx0 + tw / 2}" y="62" font-size="24" font-weight="bold" fill="{TEAL}" text-anchor="middle">10 dominant components</text>')
    parts.append(f'<text x="{(LR + RR) / 2}" y="62" font-size="24" font-weight="bold" fill="{TEAL}" text-anchor="middle">sources</text>')
    parts.append(f'<text x="{(LR + RR) / 2}" y="90" font-size="19" fill="{SLATE}" text-anchor="middle">(in parallel)</text>')
    for label, n, amp_txt, y in ROWS:
        parts.append(f'<text x="{tx0}" y="{y - 32}" font-size="19" fill="{INK}">{label}</text>')
        parts.append(f'<text x="{tx0 + tw}" y="{y - 32}" font-size="19" fill="{SLATE}" text-anchor="end">{amp_txt}</text>')
        parts.append(f'<path d="{sine_path(tx0, tw, y, 20, n)}" fill="none" stroke="{TEAL if n else SLATE}" stroke-width="2.5"/>')
        parts.append(source(y))
    parts.append(f'<text x="{tx0 + tw / 2}" y="565" font-size="30" fill="{SLATE}" text-anchor="middle">⋮</text>')
    parts.append(f'<text x="{(LR + RR) / 2}" y="565" font-size="30" fill="{SLATE}" text-anchor="middle">⋮</text>')
    parts.append(f'<text x="{tx0 + tw / 2}" y="700" font-size="17" fill="{SLATE}" text-anchor="middle" font-style="italic">shapes not to scale</text>')
    # rails
    parts.append(f'<line x1="{LR}" y1="{ROWS[0][3]}" x2="{LR}" y2="712" stroke="{INK}" stroke-width="3"/>')
    parts.append(f'<line x1="{RR}" y1="{ROWS[0][3]}" x2="{RR}" y2="{ROWS[-1][3]}" stroke="{INK}" stroke-width="3"/>')

    # --- FEM winding (RM-type cross-section) ---
    wx, wy, ww, wh = 760, 300, 210, 210
    parts.append(f'<path d="M{RR},{ROWS[0][3]} H{wx + ww - 40} V{wy}" fill="none" stroke="{COPPER}" stroke-width="4" marker-end="url(#arrc)"/>')
    parts.append(f'<path d="M{wx + 30},{wy + wh} V712 H{LR}" fill="none" stroke="{INK}" stroke-width="3"/>')
    parts.append(f'<rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="8" fill="#3A4650"/>')
    for wx0 in (wx + 18, wx + 120):
        parts.append(f'<rect x="{wx0}" y="{wy + 25}" width="72" height="{wh - 50}" fill="#5A2E12"/>')
        for c in range(3):
            for r in range(6):
                parts.append(f'<circle cx="{wx0 + 13 + c * 23}" cy="{wy + 40 + r * 26}" r="10" fill="{COPPER}" stroke="#F2B27C" stroke-width="1"/>')
    parts.append(f'<text x="{wx + 75}" y="{wy - 80}" font-size="22" font-weight="bold" fill="{COPPER}" text-anchor="middle">i(t) = Σ i<tspan dy="6" font-size="16">n</tspan><tspan dy="-6">(t)</tspan></text>')
    parts.append(f'<text x="{wx + 75}" y="{wy - 54}" font-size="18" fill="{SLATE}" text-anchor="middle">currents add</text><text x="{wx + 75}" y="{wy - 32}" font-size="18" fill="{SLATE}" text-anchor="middle">(Kirchhoff)</text>')
    parts.append(f'<text x="{wx + ww / 2 + 25}" y="{wy + wh + 36}" font-size="24" font-weight="bold" fill="{INK}" text-anchor="middle">winding in the</text>')
    parts.append(f'<text x="{wx + ww / 2 + 25}" y="{wy + wh + 64}" font-size="24" font-weight="bold" fill="{INK}" text-anchor="middle">2D FEM model</text>')
    parts.append(f'<text x="{wx + ww / 2 + 25}" y="{wy + wh + 92}" font-size="19" fill="{SLATE}" text-anchor="middle">(Ansys Maxwell)</text>')

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}">
<defs>
  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{INK}"/></marker>
  <marker id="arrc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{COPPER}"/></marker>
</defs>
{"".join(parts)}
</svg>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
