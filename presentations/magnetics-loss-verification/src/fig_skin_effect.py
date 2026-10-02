"""Current-density map of a solid round wire vs. a litz bundle at 400 kHz.

Original illustration for the deck (no poster imagery). Exact Bessel solution for an
isolated round conductor (skin effect only):
    J(r) / J_dc = (k a / 2) * J0(k r) / J1(k a),   k = (1 - j) / delta
Proximity effect between conductors is deliberately not included.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Circle
from scipy.special import jv

OUT = Path(__file__).resolve().parent.parent / "assets" / "skin_effect_400kHz.png"

RHO_CU = 1.72e-8  # ohm*m at 20 degC
MU0 = 4e-7 * np.pi
F = 400e3
DELTA = np.sqrt(RHO_CU / (np.pi * F * MU0))  # ~0.104 mm

SOLID_D = 1.0e-3
STRAND_D = 0.1e-3
STRAND_PITCH = 0.118e-3  # strand + enamel
RINGS = 5  # hexagonal bundle: 1 + 6 + 12 + 18 + 24 + 30 = 91 strands

TEXT = "#D9E1E6"
MUTED = "#9AA8B2"
CMAP = LinearSegmentedColormap.from_list(
    "copper_heat", ["#151B20", "#3A2419", "#7A3B17", "#C46A2B", "#EBA25A", "#FFE6BF"]
)
VMAX = 3.6


def j_ratio(r, a):
    k = (1 - 1j) / DELTA
    return np.abs((k * a / 2) * jv(0, k * r) / jv(1, k * a))


def rac_rdc(a):
    k = (1 - 1j) / DELTA
    return ((k * a / 2) * jv(0, k * a) / jv(1, k * a)).real


def hex_centres(rings, pitch):
    pts = [(0.0, 0.0)]
    dirs = [(np.cos(np.pi / 3 * i), np.sin(np.pi / 3 * i)) for i in range(6)]
    for ring in range(1, rings + 1):
        x, y = ring * pitch * dirs[4][0], ring * pitch * dirs[4][1]
        for side in range(6):
            dx, dy = dirs[side]
            for _ in range(ring):
                pts.append((x, y))
                x, y = x + pitch * dx, y + pitch * dy
    return np.array(pts)


def main():
    plt.rcParams["font.family"] = ["Carlito", "DejaVu Sans"]
    plt.rcParams.update({"mathtext.fontset": "custom", "mathtext.rm": "Carlito",
                         "mathtext.it": "Carlito:italic", "mathtext.bf": "Carlito:bold"})
    fig = plt.figure(figsize=(4.8, 2.95), dpi=400)
    fig.patch.set_alpha(0.0)

    # --- solid wire -------------------------------------------------------------
    ax1 = fig.add_axes([0.03, 0.25, 0.44, 0.60])
    a = SOLID_D / 2
    n = 700
    x = np.linspace(-a, a, n)
    xx, yy = np.meshgrid(x, x)
    rr = np.hypot(xx, yy)
    jmap = np.where(rr <= a, j_ratio(np.minimum(rr, a), a), np.nan)
    im = ax1.imshow(jmap * 1, extent=[-a, a, -a, a], origin="lower", cmap=CMAP,
                    vmin=0, vmax=VMAX, interpolation="bilinear")
    clip = Circle((0, 0), a, transform=ax1.transData)
    im.set_clip_path(clip)
    ax1.add_patch(Circle((0, 0), a, fill=False, ec="#E8C9A6", lw=0.8))
    ax1.set_xlim(-0.70e-3, 0.70e-3)
    ax1.set_ylim(-0.70e-3, 0.70e-3)
    ax1.set_aspect("equal")
    ax1.axis("off")

    # --- litz bundle -------------------------------------------------------------
    ax2 = fig.add_axes([0.53, 0.25, 0.44, 0.60])
    s = STRAND_D / 2
    strand_val = j_ratio(np.array([0.0, s]), s).mean()
    for cx, cy in hex_centres(RINGS, STRAND_PITCH):
        ax2.add_patch(Circle((cx, cy), s, color=CMAP(strand_val / VMAX), lw=0))
        ax2.add_patch(Circle((cx, cy), s, fill=False, ec="#E8C9A6", lw=0.25))
    bundle_r = RINGS * STRAND_PITCH + STRAND_PITCH * 0.75
    ax2.add_patch(Circle((0, 0), bundle_r, fill=False, ec=MUTED, lw=0.6, ls=(0, (2, 2))))
    ax2.set_xlim(-0.70e-3, 0.70e-3)
    ax2.set_ylim(-0.70e-3, 0.70e-3)
    ax2.set_aspect("equal")
    ax2.axis("off")

    n_strands = len(hex_centres(RINGS, STRAND_PITCH))
    fig.text(0.25, 0.905, "Solid wire, Ø 1.0 mm", color=TEXT, ha="center", fontsize=11.5,
             fontweight="bold")
    fig.text(0.75, 0.905, f"Litz, {n_strands} × Ø 0.1 mm strands", color=TEXT,
             ha="center", fontsize=11.5, fontweight="bold")
    fig.text(0.25, 0.175, f"R$_{{ac}}$/R$_{{dc}}$ ≈ {rac_rdc(a):.1f}: current crowds to the rim",
             color=MUTED, ha="center", fontsize=9.5)
    fig.text(0.75, 0.175, f"R$_{{ac}}$/R$_{{dc}}$ ≈ {rac_rdc(s):.2f} per strand: uniform",
             color=MUTED, ha="center", fontsize=9.5)

    cax = fig.add_axes([0.32, 0.06, 0.38, 0.04])
    cb = fig.colorbar(plt.cm.ScalarMappable(cmap=CMAP, norm=plt.Normalize(0, VMAX)), cax=cax,
                      orientation="horizontal", ticks=[0, 1, 2, 3])
    cb.outline.set_visible(False)
    cb.ax.tick_params(colors=MUTED, labelsize=9, length=2, pad=1.5)
    fig.text(0.305, 0.068, "|J| / J$_{dc}$", color=MUTED, ha="right", fontsize=9.5)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT, transparent=True)
    print(f"delta = {DELTA*1e3:.3f} mm, solid Rac/Rdc = {rac_rdc(a):.2f}, "
          f"strands = {n_strands}, strand Rac/Rdc = {rac_rdc(s):.3f} -> {OUT}")


if __name__ == "__main__":
    main()
