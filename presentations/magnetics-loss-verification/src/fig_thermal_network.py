"""Lumped thermal network of the calorimeter, written as SVG (original drawing for the deck).

P_loss (heat source, the DUT) -> C_DUT -> R_th(DUT->liquid) -> C_liquid+enclosure -> R_leak -> T_amb.
With R_leak -> infinity (near-adiabatic Dewar) the stored heat gives P_loss = C_Th * dT/dt.
Rasterise with: node render_svg.js <in.svg> <out.png>
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "thermal_network.svg"

W, H = 960, 466
INK = "#2A3640"
COPPER = "#C46A2B"
COPPER_DK = "#7E3F14"
TEAL = "#0F7C86"
SLATE = "#5B6B77"
FONT = "Carlito, Calibri, Arial, sans-serif"
RAIL, GND = 110, 360


def label(x, y, main, sub="", size=27, color=INK, anchor="start", weight="normal", italic=False):
    style = ' font-style="italic"' if italic else ""
    s = f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}"{style}>{main}'
    if sub:
        s += f'<tspan dy="6" font-size="{int(size * 0.7)}">{sub}</tspan>'
    return s + "</text>"


def zigzag(x0, x1, y, color):
    n, amp = 6, 14
    step = (x1 - x0) / (2 * n)
    pts = [f"{x0},{y}"]
    for k in range(2 * n):
        pts.append(f"{x0 + (k + 0.5) * step:.1f},{y + (amp if k % 2 == 0 else -amp)}")
    pts.append(f"{x1},{y}")
    return f'<polyline points="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="3.5" stroke-linejoin="round"/>'


def capacitor(x, color):
    return (f'<line x1="{x}" y1="{RAIL}" x2="{x}" y2="222" stroke="{INK}" stroke-width="3"/>'
            f'<line x1="{x - 30}" y1="222" x2="{x + 30}" y2="222" stroke="{color}" stroke-width="7"/>'
            f'<line x1="{x - 30}" y1="240" x2="{x + 30}" y2="240" stroke="{color}" stroke-width="7"/>'
            f'<line x1="{x}" y1="240" x2="{x}" y2="{GND}" stroke="{INK}" stroke-width="3"/>')


def node(x):
    return f'<circle cx="{x}" cy="{RAIL}" r="7" fill="{INK}"/>'


def build():
    src_x, cd_x, cl_x, amb_x = 110, 270, 590, 880
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{FONT}">
<!-- reference (ground) and rails -->
<line x1="{src_x}" y1="{GND}" x2="{amb_x}" y2="{GND}" stroke="{INK}" stroke-width="3"/>
<line x1="{src_x}" y1="{RAIL}" x2="350" y2="{RAIL}" stroke="{INK}" stroke-width="3"/>
<line x1="500" y1="{RAIL}" x2="660" y2="{RAIL}" stroke="{INK}" stroke-width="3"/>
<line x1="800" y1="{RAIL}" x2="{amb_x}" y2="{RAIL}" stroke="{INK}" stroke-width="3"/>
{zigzag(350, 500, RAIL, SLATE)}
{zigzag(660, 800, RAIL, INK)}

<!-- heat source: the DUT's loss -->
<line x1="{src_x}" y1="{RAIL}" x2="{src_x}" y2="198" stroke="{INK}" stroke-width="3"/>
<line x1="{src_x}" y1="282" x2="{src_x}" y2="{GND}" stroke="{INK}" stroke-width="3"/>
<circle cx="{src_x}" cy="240" r="42" fill="#FBEFE6" stroke="{COPPER}" stroke-width="4"/>
<path d="M{src_x},266 V218 M{src_x - 11},230 L{src_x},214 L{src_x + 11},230" fill="none" stroke="{COPPER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
{label(src_x + 52, 300, "P", "loss", 28, COPPER_DK, weight="bold", italic=True)}

<!-- heat capacities -->
{capacitor(cd_x, COPPER)}
{capacitor(cl_x, TEAL)}
{label(cd_x + 42, 238, "C", "DUT", 27)}
{label(cl_x - 42, 226, "C", "liquid", 27, anchor="end")}
{label(cl_x - 42, 260, "+ C", "enclosure", 27, anchor="end")}

<!-- ambient temperature source -->
<line x1="{amb_x}" y1="{RAIL}" x2="{amb_x}" y2="210" stroke="{INK}" stroke-width="3"/>
<line x1="{amb_x}" y1="270" x2="{amb_x}" y2="{GND}" stroke="{INK}" stroke-width="3"/>
<circle cx="{amb_x}" cy="240" r="30" fill="#EEF2F4" stroke="{INK}" stroke-width="3"/>
<text x="{amb_x}" y="232" font-size="20" text-anchor="middle" fill="{INK}">+</text>
<text x="{amb_x}" y="262" font-size="24" text-anchor="middle" fill="{INK}">−</text>
{label(amb_x - 42, 300, "T", "amb", 27, anchor="end")}

<!-- nodes and labels -->
{node(cd_x)}{node(cl_x)}
{label(cd_x, 76, "T", "DUT", 27, anchor="middle", weight="bold")}
{label(cl_x, 76, "T", "liquid", 27, TEAL, anchor="middle", weight="bold")}
<text x="{cl_x}" y="44" font-size="22" text-anchor="middle" fill="{TEAL}">measured by PT100</text>
{label(425, 160, "R", "th", 27, SLATE, anchor="middle")}
<text x="425" y="194" font-size="22" text-anchor="middle" fill="{SLATE}">DUT → liquid</text>
{label(730, 160, "R", "leak", 27, INK, anchor="middle")}
<text x="730" y="194" font-size="22" text-anchor="middle" fill="{INK}">Dewar + double lid</text>
<text x="730" y="220" font-size="22" text-anchor="middle" fill="{INK}" font-style="italic">→ very large</text>

<!-- C_Th brace under both capacities -->
<path d="M{cd_x - 30},382 Q{cd_x - 30},400 {cd_x},400 L{(cd_x + cl_x) / 2 - 12},400 L{(cd_x + cl_x) / 2},414 L{(cd_x + cl_x) / 2 + 12},400 L{cl_x},400 Q{cl_x + 30},400 {cl_x + 30},382" fill="none" stroke="{TEAL}" stroke-width="3"/>
{label((cd_x + cl_x) / 2, 444, "C", "Th", 26, TEAL, anchor="middle", weight="bold")}
</svg>'''
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg, encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    build()
