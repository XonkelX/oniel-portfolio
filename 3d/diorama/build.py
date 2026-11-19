"""Isometric developer-setup diorama for the portfolio.

Run from the repo root:
  blender -b --factory-startup -P 3d/diorama/build.py [-- --no-render]

Builds the scene from an empty file, saves 3d/diorama/diorama.blend,
exports public/models/diorama.glb and renders public/models/diorama.webp.
Blender is Z-up here; the glTF exporter converts to Y-up.
"""

import math
import random
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Euler, Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT / "3d" / "diorama"
OUT = ROOT / "public" / "models"
RENDERS = HERE / "renders"
ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
RENDER = "--no-render" not in ARGS
PREVIEW = "--preview" in ARGS  # quick low-res render to renders/ only
AUDIT = "--audit" in ARGS  # close-up perspective views to catch floating / intersecting parts
random.seed(7)

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
COL = bpy.data.collections.new("Diorama")
scene.collection.children.link(COL)


def hexrgb(h, a=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


# ------------------------------------------------------------------ materials
MATS = {}


def mat(name, color, rough=0.6, metal=0.0, emit=None, strength=0.0, image=None, coat=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = hexrgb(color)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if coat:
        bsdf.inputs["Coat Weight"].default_value = coat
    if image is not None:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.interpolation = "Linear"
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if emit:
            nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    elif emit:
        bsdf.inputs["Emission Color"].default_value = hexrgb(emit)
    if emit:
        bsdf.inputs["Emission Strength"].default_value = strength
    MATS[name] = m
    return m


# ------------------------------------------------------------ mesh builders
def link(obj, parent=None):
    COL.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def finish(name, bm, material, loc=(0, 0, 0), rot=(0, 0, 0), smooth=True, parent=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    me.materials.append(material)
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    obj.rotation_euler = rot
    link(obj, parent)
    if smooth:
        wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        wn.keep_sharp = True
        wn.mode = "FACE_AREA"
    return obj


def bevel_all(bm, width, segments):
    if width <= 0:
        return
    bmesh.ops.bevel(
        bm,
        geom=list(bm.edges) + list(bm.verts),
        offset=width,
        offset_type="OFFSET",
        segments=segments,
        profile=0.5,
        affect="EDGES",
        clamp_overlap=True,
    )


def box(name, size, loc, material, bevel=0.008, seg=2, rot=(0, 0, 0), parent=None):
    """Box with `size` (x, y, z) centred on `loc`."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    bevel_all(bm, min(bevel, min(size) * 0.45), seg)
    return finish(name, bm, material, loc, rot, parent=parent)


def cyl(name, radius, depth, loc, material, verts=32, bevel=0.004, seg=2, rot=(0, 0, 0), r2=None, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=verts,
        radius1=radius, radius2=radius if r2 is None else r2, depth=depth,
    )
    if bevel > 0:
        rim = [e for e in bm.edges if not e.is_manifold or abs(e.calc_face_angle(0)) > 0.5]
        bmesh.ops.bevel(bm, geom=rim, offset=bevel, offset_type="OFFSET", segments=seg,
                        profile=0.5, affect="EDGES", clamp_overlap=True)
    return finish(name, bm, material, loc, rot, parent=parent)


def sphere(name, radius, loc, material, scale=(1, 1, 1), subdiv=3, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=radius)
    bmesh.ops.scale(bm, vec=Vector(scale), verts=bm.verts)
    obj = finish(name, bm, material, loc, parent=parent)
    obj.modifiers.clear()
    return obj


def torus(name, major, minor, loc, material, rot=(0, 0, 0), arc=1.0, parent=None, seg=32, ring=12):
    bm = bmesh.new()
    verts = []
    steps = seg if arc >= 1.0 else seg + 1
    for i in range(steps):
        a = 2 * math.pi * arc * i / seg
        ring_v = []
        for j in range(ring):
            b = 2 * math.pi * j / ring
            r = major + minor * math.cos(b)
            ring_v.append(bm.verts.new((r * math.cos(a), r * math.sin(a), minor * math.sin(b))))
        verts.append(ring_v)
    for i in range(seg if arc >= 1.0 else seg):
        a_ring, b_ring = verts[i], verts[(i + 1) % steps]
        for j in range(ring):
            bm.faces.new((a_ring[j], b_ring[j], b_ring[(j + 1) % ring], a_ring[(j + 1) % ring]))
    obj = finish(name, bm, material, loc, rot, parent=parent)
    obj.modifiers.clear()
    return obj


# -------------------------------------------------------------- textures
def new_image(name, w, h, rgba):
    img = bpy.data.images.new(name, w, h, alpha=False)
    img.pixels.foreach_set(np.ascontiguousarray(rgba, dtype=np.float32).ravel())
    img.file_format = "PNG"
    img.pack()
    return img


def srgb_arr(h):
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)] + [1.0], dtype=np.float32)


def code_texture(name, w, h, seed, file_tabs=2):
    """Dark editor theme with syntax-coloured 'code' blocks (rows drawn top-down)."""
    rnd = random.Random(seed)
    px = np.zeros((h, w, 4), dtype=np.float32)
    px[:] = srgb_arr("#0d1015")
    # title / tab bar
    px[: int(h * 0.075)] = srgb_arr("#05070a")
    tab_w = int(w * 0.2)
    for t in range(file_tabs):
        x0 = 4 + t * (tab_w + 3)
        px[2 : int(h * 0.075), x0 : x0 + tab_w] = srgb_arr("#0d1015" if t == 0 else "#151a21")
        px[int(h * 0.03) : int(h * 0.045), x0 + 8 : x0 + int(tab_w * 0.6)] = srgb_arr("#8b949e")
    if file_tabs:
        px[int(h * 0.07) : int(h * 0.075), 4 : 4 + tab_w] = srgb_arr("#3dbe7e")
    gutter = int(w * 0.07)
    px[int(h * 0.075) :, :gutter] = srgb_arr("#0a0c10")
    palette = ["#c9d1d9", "#3dbe7e", "#e0607a", "#e3b341", "#79c0ff", "#d2a8ff", "#c9d1d9", "#8b949e"]
    line_h = max(6, h // 34)
    y = int(h * 0.075) + line_h
    indent = 0
    while y + line_h < h - line_h:
        bar = int(line_h * 0.55)
        # line number
        px[y : y + bar, gutter // 3 : gutter - 6] = srgb_arr("#3b424c")
        r = rnd.random()
        if r < 0.12:
            indent = max(0, indent - 1)
        elif r < 0.3:
            indent = min(4, indent + 1)
        if rnd.random() < 0.12:  # blank line
            y += line_h
            continue
        x = gutter + 10 + indent * int(w * 0.035)
        for _ in range(rnd.randint(1, 5)):
            seg = rnd.randint(int(w * 0.03), int(w * 0.16))
            if x + seg > w - 10:
                break
            col = srgb_arr(rnd.choice(palette))
            if rnd.random() < 0.1:
                col = srgb_arr("#6a737d")  # comment
            px[y : y + bar, x : x + seg] = col
            x += seg + int(w * 0.012)
        y += line_h
    # cursor + status bar
    px[h - int(h * 0.05) :, :] = srgb_arr("#6b1424")
    return new_image(name, w, h, np.flipud(px))


def sky_texture(name, w, h):
    """Night sky over a low skyline with a palm silhouette, seen through the window."""
    rnd = random.Random(3)
    px = np.zeros((h, w, 4), dtype=np.float32)
    top, mid, low = srgb_arr("#0b0a1f"), srgb_arr("#3a1030"), srgb_arr("#b3263e")
    for yy in range(h):
        t = yy / (h - 1)
        c = top * (1 - t / 0.7) + mid * (t / 0.7) if t < 0.7 else mid * (1 - (t - 0.7) / 0.3) + low * ((t - 0.7) / 0.3)
        px[yy] = c
    px[..., 3] = 1
    for _ in range(90):  # stars
        sx, sy = rnd.randrange(w), rnd.randrange(int(h * 0.55))
        px[sy : sy + 2, sx : sx + 2] = srgb_arr("#f3f1ea") * rnd.uniform(0.5, 1.0)
    yy, xx = np.mgrid[0:h, 0:w]  # moon
    moon = (xx - w * 0.74) ** 2 + (yy - h * 0.2) ** 2 < (h * 0.07) ** 2
    px[moon] = srgb_arr("#f6e7c8")
    x = 0
    sil = srgb_arr("#07060c")
    while x < w:  # buildings
        bw = rnd.randint(int(w * 0.05), int(w * 0.13))
        bh = rnd.randint(int(h * 0.15), int(h * 0.42))
        if 0.36 < x / w < 0.46:
            bh = int(h * 0.55)  # one tower
        px[h - bh :, x : x + bw] = sil
        for wy in range(h - bh + 6, h - 4, 9):
            for wx in range(x + 4, x + bw - 4, 7):
                if rnd.random() < 0.32:
                    px[wy : wy + 3, wx : wx + 3] = srgb_arr(rnd.choice(["#e3b341", "#f6e7c8", "#3dbe7e"]))
        x += bw + rnd.randint(0, 6)
    # palm tree silhouette on the left
    cx, base = int(w * 0.14), h
    top_y = int(h * 0.28)
    for yy2 in range(top_y, base):
        t = (yy2 - top_y) / (base - top_y)
        tx = int(cx + 18 * (1 - t) ** 2)
        px[yy2, tx - 4 : tx + 4] = sil
    for k in range(7):
        ang = math.radians(-160 + k * 30 + rnd.uniform(-8, 8))
        for s in range(0, 80):
            fx = cx + 18 + s * math.cos(ang) * 1.1
            fy = top_y + s * math.sin(ang) * 0.6 + (s / 80) ** 2 * 35
            ix, iy = int(fx), int(fy)
            thick = max(1, int(5 * (1 - s / 80)))
            if 0 <= iy < h and 0 <= ix < w:
                px[max(0, iy - thick) : iy + thick, max(0, ix - 2) : ix + 2] = sil
    return new_image(name, w, h, np.flipud(px))


def art_texture(name, w, h):
    """Abstract poster: wine field, green arc, cream type blocks."""
    px = np.zeros((h, w, 4), dtype=np.float32)
    px[:] = srgb_arr("#f3f1ea")
    yy, xx = np.mgrid[0:h, 0:w]
    px[(xx - w * 0.5) ** 2 + (yy - h * 0.42) ** 2 < (w * 0.36) ** 2] = srgb_arr("#6b1424")
    ring = np.abs(np.sqrt((xx - w * 0.62) ** 2 + (yy - h * 0.36) ** 2) - w * 0.22) < w * 0.035
    px[ring & (yy < h * 0.5)] = srgb_arr("#3dbe7e")
    px[int(h * 0.8) : int(h * 0.86), int(w * 0.12) : int(w * 0.7)] = srgb_arr("#0a0a0a")
    px[int(h * 0.89) : int(h * 0.92), int(w * 0.12) : int(w * 0.45)] = srgb_arr("#6b1424")
    return new_image(name, w, h, np.flipud(px))


def plane(name, w, h, loc, material, rot=(0, 0, 0), parent=None):
    """Vertical plane w x h facing -Y (towards the front of the room) with 0..1 UVs."""
    me = bpy.data.meshes.new(name)
    hw, hh = w / 2, h / 2
    me.from_pydata([(-hw, 0, -hh), (hw, 0, -hh), (hw, 0, hh), (-hw, 0, hh)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(name="UVMap")
    for li, co in zip(range(4), [(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[li].uv = co
    me.materials.append(material)
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    obj.rotation_euler = rot
    return link(obj, parent)


# ================================================================== palette
M = {
    "wall": mat("Wall", "#3b121b", rough=0.85),
    "wall_side": mat("WallSide", "#2a0c13", rough=0.85),
    "trim": mat("Trim", "#1a1a1a", rough=0.5),
    "slab": mat("Slab", "#141414", rough=0.7),
    "wood1": mat("Wood1", "#7a5233", rough=0.55),
    "wood2": mat("Wood2", "#6a4529", rough=0.55),
    "wood3": mat("Wood3", "#835a39", rough=0.55),
    "desk": mat("DeskTop", "#c9a27a", rough=0.45),
    "metal": mat("MetalBlack", "#1c1c1c", rough=0.35, metal=0.9),
    "steel": mat("Steel", "#b8b8b8", rough=0.25, metal=1.0),
    "plastic": mat("PlasticBlack", "#141414", rough=0.4),
    "plastic_g": mat("PlasticGrey", "#2a2a2a", rough=0.45),
    "screen_off": mat("Bezel", "#080808", rough=0.25, coat=0.6),
    "fabric": mat("FabricWine", "#6b1424", rough=0.9),
    "fabric_dk": mat("FabricDark", "#161616", rough=0.9),
    "rug": mat("Rug", "#e6e1d5", rough=1.0),
    "rug_line": mat("RugLine", "#127a4e", rough=1.0),
    "pot": mat("Pot", "#f3f1ea", rough=0.6),
    "pot_t": mat("Terracotta", "#a4553a", rough=0.8),
    "soil": mat("Soil", "#2b1d14", rough=1.0),
    "leaf": mat("Leaf", "#2f7d4a", rough=0.6),
    "leaf2": mat("Leaf2", "#1f5f36", rough=0.6),
    "mug": mat("Mug", "#f3f1ea", rough=0.3),
    "coffee": mat("Coffee", "#2a160c", rough=0.2),
    "neon": mat("NeonGreen", "#3dbe7e", rough=0.3, emit="#3dbe7e", strength=6.0),
    "neon_wine": mat("NeonWine", "#e0607a", rough=0.3, emit="#e0607a", strength=5.0),
    "acrylic": mat("Acrylic", "#101010", rough=0.15, coat=1.0),
    "lamp_bulb": mat("LampBulb", "#fff1d6", rough=0.3, emit="#ffe2b0", strength=8.0),
    "led_pc": mat("PcLed", "#3dbe7e", emit="#3dbe7e", strength=4.0),
    "glass": mat("GlassDark", "#0e1a22", rough=0.05, metal=0.2, coat=1.0),
    "book1": mat("Book1", "#6b1424", rough=0.7),
    "book2": mat("Book2", "#e6e1d5", rough=0.7),
    "book3": mat("Book3", "#127a4e", rough=0.7),
    "book4": mat("Book4", "#e3b341", rough=0.7),
    "book5": mat("Book5", "#1d2a44", rough=0.7),
    "keycap": mat("Keycap", "#e6e1d5", rough=0.5),
    "keycap_dk": mat("KeycapDark", "#2a2a2a", rough=0.5),
    "keycap_acc": mat("KeycapAccent", "#b3263e", rough=0.5),
    "deskmat": mat("DeskMat", "#1a1a1a", rough=0.95),
    "frame": mat("FrameBlack", "#111111", rough=0.4),
}
M["code1"] = mat("ScreenMain", "#ffffff", rough=0.3, emit=True, strength=1.6,
                 image=code_texture("tex_code_main", 1024, 576, seed=11, file_tabs=3))
M["code2"] = mat("ScreenSide", "#ffffff", rough=0.3, emit=True, strength=1.6,
                 image=code_texture("tex_code_side", 360, 640, seed=29, file_tabs=1))
M["sky"] = mat("WindowView", "#ffffff", rough=0.4, emit=True, strength=1.4,
               image=sky_texture("tex_sky", 512, 512))
M["art"] = mat("Poster", "#ffffff", rough=0.6, image=art_texture("tex_art", 256, 352))
for k in ("sky",):
    M[k].use_backface_culling = True

# ================================================================== room shell
W = 2.4  # room footprint (x and y)
H = 2.2  # wall height
T = 0.12  # wall thickness
SLAB = 0.16
half = W / 2

box("FloorSlab", (W + T, W + T, SLAB), (-T / 2, T / 2, -SLAB / 2 - 0.02), M["slab"], bevel=0.02)
# floor planks running front-to-back (along y)
plank_w = W / 12
for i in range(12):
    x = -half + plank_w * (i + 0.5)
    # staggered plank joints
    cut = random.uniform(0.6, 1.8)
    m = random.choice([M["wood1"], M["wood2"], M["wood3"]])
    m2 = random.choice([M["wood1"], M["wood2"], M["wood3"]])
    y0, y1 = -half, -half + cut
    box(f"Plank_{i}a", (plank_w - 0.006, cut - 0.006, 0.02), (x, (y0 + y1) / 2, -0.01), m, bevel=0.004, seg=1)
    box(f"Plank_{i}b", (plank_w - 0.006, W - cut - 0.006, 0.02), (x, (y1 + half) / 2, -0.01), m2, bevel=0.004, seg=1)

# back wall (along x at y = +half) built around a window opening
win_x0, win_x1, win_z0, win_z1 = 0.32, 1.02, 1.05, 1.88
by = half + T / 2
bx0 = -half - T
box("BackWall_L", (win_x0 - bx0, T, H), ((bx0 + win_x0) / 2, by, H / 2), M["wall"], bevel=0.01)
box("BackWall_R", (half - win_x1, T, H), ((win_x1 + half) / 2, by, H / 2), M["wall"], bevel=0.01)
box("BackWall_Bot", (win_x1 - win_x0, T, win_z0), ((win_x0 + win_x1) / 2, by, win_z0 / 2), M["wall"], bevel=0.0)
box("BackWall_Top", (win_x1 - win_x0, T, H - win_z1), ((win_x0 + win_x1) / 2, by, (win_z1 + H) / 2), M["wall"], bevel=0.0)
# left wall (along y at x = -half)
lx = -half - T / 2
box("LeftWall", (T, W, H), (lx, 0, H / 2), M["wall_side"], bevel=0.01)
# wall top caps and baseboards
box("BackCap", (W + T, T + 0.01, 0.025), (-T / 2, by, H + 0.012), M["trim"], bevel=0.005)
box("LeftCap", (T + 0.01, W, 0.025), (lx, 0, H + 0.012), M["trim"], bevel=0.005)
box("BaseBack", (W, 0.014, 0.08), (0, half - 0.007, 0.04), M["trim"], bevel=0.003)
box("BaseLeft", (0.014, W, 0.08), (-half + 0.007, 0, 0.04), M["trim"], bevel=0.003)

# window: frame, mullions, sill, view
wcx, wcz = (win_x0 + win_x1) / 2, (win_z0 + win_z1) / 2
ww, wh = win_x1 - win_x0, win_z1 - win_z0
fr = 0.035
for nm, size, loc in [
    ("WinFrameL", (fr, T + 0.02, wh), (win_x0 + fr / 2, by, wcz)),
    ("WinFrameR", (fr, T + 0.02, wh), (win_x1 - fr / 2, by, wcz)),
    ("WinFrameT", (ww, T + 0.02, fr), (wcx, by, win_z1 - fr / 2)),
    ("WinFrameB", (ww, T + 0.02, fr), (wcx, by, win_z0 + fr / 2)),
    ("WinMullion", (0.02, 0.03, wh), (wcx, by, wcz)),
    ("WinTransom", (ww, 0.03, 0.02), (wcx, by, win_z0 + wh * 0.62)),
]:
    box(nm, size, loc, M["frame"], bevel=0.004)
box("WinSill", (ww + 0.08, 0.1, 0.03), (wcx, half - 0.04, win_z0 - 0.012), M["pot"], bevel=0.006)
plane("WinView", ww - 2 * fr, wh - 2 * fr, (wcx, by + 0.02, wcz), M["sky"])
plane("WinBack", ww - 2 * fr, wh - 2 * fr, (wcx, by + 0.03, wcz), M["glass"], rot=(0, 0, math.pi))
# small cactus on the sill
cyl("SillPot", 0.04, 0.06, (win_x1 - 0.12, half - 0.04, win_z0 + 0.033), M["pot_t"], r2=0.034)
cyl("SillCactus", 0.022, 0.09, (win_x1 - 0.12, half - 0.04, win_z0 + 0.1), M["leaf"], verts=12, bevel=0.01, seg=3)

# ================================================================== desk
DZ = 0.74  # desk top height
dx0, dx1 = -0.95, 0.88
dy0, dy1 = 0.52, half - 0.04
dcx, dcy = (dx0 + dx1) / 2, (dy0 + dy1) / 2
box("DeskTop", (dx1 - dx0, dy1 - dy0, 0.035), (dcx, dcy, DZ - 0.0175), M["desk"], bevel=0.006)
for sx in (dx0 + 0.05, dx1 - 0.05):  # frame legs (sled style)
    box(f"DeskLeg_{sx:.2f}", (0.045, dy1 - dy0 - 0.12, 0.03), (sx, dcy, 0.015), M["metal"], bevel=0.008)
    # post runs from the top of the foot (z=0.03) to the underside of the desk top
    box(f"DeskPost_{sx:.2f}", (0.045, 0.045, DZ - 0.065), (sx, dcy, 0.03 + (DZ - 0.065) / 2), M["metal"], bevel=0.008)
    box(f"DeskArm_{sx:.2f}", (0.045, dy1 - dy0 - 0.1, 0.03), (sx, dcy, DZ - 0.05), M["metal"], bevel=0.008)
box("DeskBeam", (dx1 - dx0 - 0.1, 0.04, 0.05), (dcx, dy1 - 0.12, DZ - 0.06), M["metal"], bevel=0.008)
# LED strip under the desk front edge
box("DeskLed", (dx1 - dx0 - 0.2, 0.01, 0.008), (dcx, dy0 + 0.03, DZ - 0.04), M["neon_wine"], bevel=0.0)

# desk mat, keyboard, mouse
box("DeskMat", (0.86, 0.34, 0.004), (-0.18, dy0 + 0.2, DZ + 0.002), M["deskmat"], bevel=0.002, seg=1)
kb_w, kb_d = 0.36, 0.12
kbx, kby = -0.26, dy0 + 0.17
box("KeyboardCase", (kb_w, kb_d, 0.022), (kbx, kby, DZ + 0.015), M["plastic_g"], bevel=0.006, rot=(math.radians(3), 0, 0))
keys = bmesh.new()
cols, rows = 15, 5
kw = (kb_w - 0.02) / cols
for r in range(rows):
    for c in range(cols):
        if r == 4 and 4 <= c <= 9:
            continue
        kc = bmesh.new()
        bmesh.ops.create_cube(kc, size=1.0)
        bmesh.ops.scale(kc, vec=Vector((kw * 0.82, kw * 0.82, 0.01)), verts=kc.verts)
        bevel_all(kc, 0.0018, 1)
        bmesh.ops.translate(kc, vec=Vector((-kb_w / 2 + 0.01 + kw * (c + 0.5), -kb_d / 2 + 0.012 + kw * (r + 0.5), 0.016)), verts=kc.verts)
        me_tmp = bpy.data.meshes.new("tmp")
        kc.to_mesh(me_tmp)
        kc.free()
        keys.from_mesh(me_tmp)
        bpy.data.meshes.remove(me_tmp)
space = bmesh.new()
bmesh.ops.create_cube(space, size=1.0)
bmesh.ops.scale(space, vec=Vector((kw * 5.8, kw * 0.82, 0.01)), verts=space.verts)
bevel_all(space, 0.0018, 1)
bmesh.ops.translate(space, vec=Vector((-kb_w / 2 + 0.01 + kw * 7, -kb_d / 2 + 0.012 + kw * 4.5, 0.016)), verts=space.verts)
me_tmp = bpy.data.meshes.new("tmp")
space.to_mesh(me_tmp)
space.free()
keys.from_mesh(me_tmp)
bpy.data.meshes.remove(me_tmp)
keys_obj = finish("Keycaps", keys, M["keycap"], (kbx, kby, DZ + 0.006), (math.radians(3), 0, 0))
keys_obj.modifiers.clear()
# accent keys (escape + enter) in wine
box("KeyEsc", (kw * 0.82, kw * 0.82, 0.011), (kbx - kb_w / 2 + 0.01 + kw * 0.5, kby + kb_d / 2 - 0.012 - kw * 0.5 + 0.002, DZ + 0.023), M["keycap_acc"], bevel=0.0018, seg=1, rot=(math.radians(3), 0, 0))
sphere("Mouse", 0.032, (0.06, dy0 + 0.17, DZ + 0.012), M["plastic"], scale=(0.85, 1.25, 0.45))

# main monitor (landscape) on a stand
mon_x, mon_y = -0.25, dy1 - 0.17
mw, mh = 0.66, 0.38
mz = DZ + 0.14 + mh / 2
box("MonitorBase", (0.24, 0.16, 0.012), (mon_x, mon_y + 0.02, DZ + 0.006), M["metal"], bevel=0.005)
box("MonitorNeck", (0.05, 0.03, 0.26), (mon_x, mon_y + 0.07, DZ + 0.13 + 0.012), M["metal"], bevel=0.008)
mon = box("MonitorBody", (mw, 0.03, mh), (mon_x, mon_y + 0.04, mz), M["screen_off"], bevel=0.008)
box("MonitorBack", (mw * 0.55, 0.03, mh * 0.55), (mon_x, mon_y + 0.065, mz - 0.02), M["plastic"], bevel=0.015)
plane("MonitorScreen", mw - 0.024, mh - 0.03, (mon_x, mon_y + 0.024, mz + 0.004), M["code1"])

# side monitor (portrait), angled toward the chair
sm_x, sm_y = 0.33, dy1 - 0.2
smw, smh = 0.23, 0.4
smz = DZ + 0.12 + smh / 2
ang = math.radians(-24)
side = bpy.data.objects.new("SideMonitor", None)
side.location = (sm_x, sm_y, 0)
side.rotation_euler = (0, 0, ang)
link(side)
box("SideBase", (0.16, 0.14, 0.012), (0, 0.03, DZ + 0.006), M["metal"], bevel=0.005, parent=side)
box("SideNeck", (0.04, 0.025, smz - DZ), (0, 0.06, DZ + (smz - DZ) / 2), M["metal"], bevel=0.006, parent=side)
box("SideBody", (smw, 0.026, smh), (0, 0.035, smz), M["screen_off"], bevel=0.007, parent=side)
plane("SideScreen", smw - 0.02, smh - 0.026, (0, 0.021, smz + 0.004), M["code2"], parent=side)

# mug with handle
mug_x, mug_y = 0.18, dy0 + 0.12
cyl("Mug", 0.035, 0.085, (mug_x, mug_y, DZ + 0.0425), M["mug"], verts=28, bevel=0.004)
cyl("MugCoffee", 0.031, 0.004, (mug_x, mug_y, DZ + 0.078), M["coffee"], verts=28, bevel=0.0)
torus("MugHandle", 0.022, 0.006, (mug_x + 0.04, mug_y, DZ + 0.045), M["mug"], rot=(math.pi / 2, 0, 0))

# desk lamp (left)
lamp = bpy.data.objects.new("DeskLamp", None)
lamp.location = (-0.84, dy1 - 0.08, DZ)
lamp.rotation_euler = (0, 0, math.radians(-50))
link(lamp)
def rod(name, p0, p1, thick, material, parent=None):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    ob = box(name, (thick, thick, d.length), (0, 0, 0), material, bevel=thick * 0.3, parent=parent)
    ob.location = (p0 + p1) / 2
    ob.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    return ob


cyl("LampBase", 0.07, 0.022, (0, 0, 0.011), M["plastic"], parent=lamp)
E0, E1, E2 = (0, 0, 0.03), (0.07, 0, 0.33), (0.26, 0, 0.4)
rod("LampArm1", E0, E1, 0.016, M["steel"], parent=lamp)
rod("LampArm2", E1, E2, 0.016, M["steel"], parent=lamp)
for nm, p in (("LampJoint0", E0), ("LampJoint1", E1), ("LampJoint2", E2)):
    cyl(nm, 0.018, 0.034, p, M["plastic"], rot=(math.pi / 2, 0, 0), parent=lamp)
# shade: cone opening downward/forward, bulb inside
cyl("LampHead", 0.03, 0.1, (0.29, 0, 0.36), M["fabric"], r2=0.075, rot=(0, math.radians(155), 0), parent=lamp)
sphere("LampBulb", 0.026, (0.3, 0, 0.345), M["lamp_bulb"], parent=lamp)

# books and a small plant on the desk
bx = -0.9  # books stand side by side, each touching the next
for i, (m, w, h) in enumerate([("book1", 0.035, 0.24), ("book5", 0.03, 0.22), ("book2", 0.04, 0.25), ("book3", 0.028, 0.2)]):
    box(f"DeskBook{i}", (w, 0.16, h), (bx + w / 2, dy1 - 0.3, DZ + h / 2), M[m], bevel=0.004)
    bx += w + 0.002

# headphone stand
hp = bpy.data.objects.new("Headphones", None)
hp.location = (0.62, dy0 + 0.22, DZ)
link(hp)
cyl("HpBase", 0.055, 0.015, (0, 0, 0.0075), M["metal"], parent=hp)
cyl("HpPost", 0.008, 0.25, (0, 0, 0.13), M["steel"], verts=16, bevel=0.0, parent=hp)
torus("HpBand", 0.075, 0.012, (0, 0, 0.19), M["plastic"], rot=(math.pi / 2, 0, math.radians(90)), arc=0.5, parent=hp)
for s in (-1, 1):
    cyl(f"HpCup{s}", 0.042, 0.035, (0, s * 0.075, 0.18), M["plastic_g"], rot=(math.pi / 2, 0, 0), bevel=0.01, seg=3, parent=hp)
    cyl(f"HpPad{s}", 0.036, 0.012, (0, s * 0.052, 0.18), M["fabric"], rot=(math.pi / 2, 0, 0), bevel=0.005, seg=2, parent=hp)

# PC tower on the floor beside the desk
pc_x, pc_y = 0.7, dy1 - 0.28
box("PcCase", (0.2, 0.42, 0.44), (pc_x, pc_y, 0.24), M["plastic"], bevel=0.01)
box("PcGlass", (0.004, 0.36, 0.38), (pc_x - 0.101, pc_y, 0.24), M["glass"], bevel=0.0)
for i in range(3):
    torus(f"PcFan{i}", 0.04, 0.006, (pc_x - 0.06, pc_y - 0.205, 0.12 + i * 0.12), M["led_pc"], rot=(math.pi / 2, 0, 0), ring=8, seg=24)
for fx in (-0.07, 0.07):
    for fy in (-0.17, 0.17):
        cyl(f"PcFoot{fx}{fy}", 0.015, 0.02, (pc_x + fx, pc_y + fy, 0.01), M["plastic_g"], verts=12, bevel=0.0)

# ================================================================== chair
ch = bpy.data.objects.new("Chair", None)
ch.location = (-0.18, 0.12, 0)
ch.rotation_euler = (0, 0, math.radians(-38))
link(ch)
for i in range(5):
    a = 2 * math.pi * i / 5
    leg = box(f"ChairLeg{i}", (0.29, 0.04, 0.03), (0, 0, 0), M["metal"], bevel=0.01, parent=ch)
    leg.location = (math.cos(a) * 0.14, math.sin(a) * 0.14, 0.07)
    # positive tilt drops the outer end of each leg onto its caster
    leg.rotation_euler = (0, math.radians(6), a)
    sphere(f"ChairCaster{i}", 0.026, (math.cos(a) * 0.29, math.sin(a) * 0.29, 0.028), M["plastic"], subdiv=2, parent=ch)
cyl("ChairHub", 0.045, 0.06, (0, 0, 0.08), M["metal"], parent=ch)
cyl("ChairGas", 0.022, 0.26, (0, 0, 0.235), M["steel"], verts=20, parent=ch)
cyl("ChairGasCover", 0.03, 0.12, (0, 0, 0.17), M["plastic"], parent=ch)
box("ChairSeatBase", (0.4, 0.4, 0.03), (0, 0, 0.38), M["plastic"], bevel=0.012, parent=ch)
box("ChairSeat", (0.46, 0.46, 0.08), (0, 0, 0.43), M["fabric"], bevel=0.035, seg=4, parent=ch)
# The seat faces +y (the desk); the back sits at -y and reclines away from the desk.
back = box("ChairBack", (0.44, 0.07, 0.56), (0, -0.24, 0.8), M["fabric"], bevel=0.032, seg=4,
           rot=(math.radians(12), 0, 0), parent=ch)
box("ChairBackStrip", (0.3, 0.02, 0.38), (0, -0.04, 0.0), M["fabric_dk"], bevel=0.008, parent=back)
# headrest sits directly on the top edge of the back (back half-height is 0.28)
box("ChairHead", (0.28, 0.06, 0.12), (0, -0.005, 0.335), M["fabric_dk"], bevel=0.028, seg=3, parent=back)
rod("ChairSpine", (0, -0.17, 0.37), (0, -0.285, 0.72), 0.045, M["metal"], parent=ch)
for s in (-1, 1):
    box(f"ChairArmPost{s}", (0.03, 0.05, 0.21), (s * 0.215, -0.04, 0.495), M["metal"], bevel=0.008, parent=ch)
    box(f"ChairArmPad{s}", (0.07, 0.24, 0.03), (s * 0.215, -0.02, 0.615), M["plastic"], bevel=0.012, parent=ch)

# ================================================================== rug
rug = bmesh.new()
bmesh.ops.create_circle(rug, cap_ends=True, segments=48, radius=0.62)
bmesh.ops.scale(rug, vec=Vector((1.25, 1.0, 1.0)), verts=rug.verts)
ret = bmesh.ops.extrude_face_region(rug, geom=rug.faces[:])
bmesh.ops.translate(rug, vec=Vector((0, 0, 0.012)), verts=[v for v in ret["geom"] if isinstance(v, bmesh.types.BMVert)])
bmesh.ops.recalc_face_normals(rug, faces=rug.faces[:])
rug_obj = finish("Rug", rug, M["rug"], (-0.15, -0.05, 0.0))
torus("RugStripe", 0.5, 0.004, (-0.15, -0.05, 0.012), M["rug_line"], seg=48, ring=6).scale = (1.25, 1.0, 1.0)

# ================================================================== left wall: shelf, neon, poster
wall_in = -half
box("Shelf", (0.2, 0.7, 0.03), (wall_in + 0.1, 0.2, 1.42), M["desk"], bevel=0.005)
for by_ in (-0.02, 0.42):  # brackets well inside the board ends
    box(f"ShelfBracket{by_}", (0.16, 0.02, 0.06), (wall_in + 0.08, by_, 1.38), M["metal"], bevel=0.004)
SHELF_TOP = 1.42 + 0.015
y = -0.1
for i in range(6):
    w = random.uniform(0.025, 0.045)
    h = random.uniform(0.17, 0.25)
    m = M[random.choice(["book1", "book2", "book3", "book4", "book5"])]
    box(f"ShelfBook{i}", (0.14, w, h), (wall_in + 0.09, y + w / 2, SHELF_TOP + h / 2), m, bevel=0.004)
    y += w + 0.002
# two books lying flat next to the upright ones
for i, (m, th) in enumerate([("book4", 0.03), ("book1", 0.025)]):
    z0 = SHELF_TOP + 0.03 * i
    box(f"ShelfFlatBook{i}", (0.15, 0.2, th), (wall_in + 0.095, y + 0.13, z0 + th / 2), M[m], bevel=0.004, rot=(0, 0, 0.04 * (i * 2 - 1)))
def succulent(name, loc, pot_r=0.045, pot_h=0.07, pot_mat=None, rings=(9, 6)):
    """Pot standing on `loc` with a rosette of plump leaves leaning outward."""
    x, y, z = loc
    cyl(f"{name}Pot", pot_r, pot_h, (x, y, z + pot_h / 2), pot_mat or M["pot"], r2=pot_r * 0.84)
    cyl(f"{name}Soil", pot_r * 0.9, 0.006, (x, y, z + pot_h - 0.004), M["soil"], bevel=0.0)
    for ring, count in enumerate(rings):
        lean = 0.75 - ring * 0.4
        dist = pot_r * (0.5 - ring * 0.3)
        size = pot_r * (0.72 - ring * 0.18)
        for i in range(count):
            a = 2 * math.pi * (i + ring * 0.5) / count
            lf = sphere(f"{name}Leaf{ring}_{i}", size,
                        (x + math.cos(a) * dist, y + math.sin(a) * dist, z + pot_h + size * 0.55),
                        M["leaf"] if (i + ring) % 2 else M["leaf2"], scale=(0.45, 0.45, 1.0), subdiv=2)
            # tilt the top of each leaf away from the centre
            lf.rotation_euler = (-math.sin(a) * lean, math.cos(a) * lean, 0)


succulent("ShelfSucculent", (wall_in + 0.1, 0.45, SHELF_TOP))

# neon "</>" sign
bpy.ops.object.text_add(location=(0, 0, 0))
txt = bpy.context.active_object
txt.data.body = "</>"
txt.data.align_x = "CENTER"
txt.data.align_y = "CENTER"
txt.data.size = 0.36
txt.data.extrude = 0.006
txt.data.bevel_depth = 0.004
txt.data.bevel_resolution = 2
bpy.ops.object.convert(target="MESH")
neon = bpy.context.active_object
neon.name = "NeonSign"
neon.data.materials.clear()
neon.data.materials.append(M["neon"])
for c in neon.users_collection:
    c.objects.unlink(neon)
COL.objects.link(neon)
neon.location = (wall_in + 0.03, -0.55, 1.5)
neon.rotation_euler = (math.pi / 2, 0, math.pi / 2)
box("NeonBacker", (0.012, 0.52, 0.32), (wall_in + 0.012, -0.55, 1.5), M["acrylic"], bevel=0.006)

# acoustic wood slats behind the monitors
sx = -0.36
while sx < 0.25:
    box(f"Slat{sx:.2f}", (0.032, 0.022, 1.25), (sx, half - 0.011, 1.42), M["wood2"], bevel=0.004, seg=1)
    sx += 0.052
box("SlatFelt", (0.66, 0.006, 1.27), (-0.055, half - 0.003, 1.42), M["fabric_dk"], bevel=0.0)

# framed poster on the back wall
px0 = -0.62
box("PosterFrame", (0.36, 0.025, 0.48), (px0, half - 0.0125, 1.5), M["frame"], bevel=0.005)
plane("PosterArt", 0.32, 0.44, (px0, half - 0.026, 1.5), M["art"])

# ================================================================== plants
def leafy_plant(name, loc, height, n=14, pot_r=0.11, pot_h=0.22, pot_mat=None):
    root = bpy.data.objects.new(name, None)
    root.location = loc
    link(root)
    cyl(f"{name}Pot", pot_r, pot_h, (0, 0, pot_h / 2), pot_mat or M["pot"], r2=pot_r * 0.8, parent=root)
    cyl(f"{name}Soil", pot_r * 0.92, 0.01, (0, 0, pot_h - 0.01), M["soil"], bevel=0.0, parent=root)
    cyl(f"{name}Stem", 0.008, height * 0.6, (0, 0, pot_h + height * 0.3), M["leaf2"], verts=8, bevel=0.0, parent=root)
    rnd = random.Random(name)
    for i in range(n):
        a = rnd.uniform(0, 2 * math.pi)
        t = i / n
        z = pot_h + height * (0.25 + 0.75 * t)
        r = 0.05 + 0.12 * (1 - t) + rnd.uniform(0, 0.04)
        leaf = bmesh.new()
        # flat diamond leaf with a fold
        L, Wd = rnd.uniform(0.16, 0.22) * (1.1 - 0.4 * t), 0.06
        v = [leaf.verts.new(p) for p in [(0, 0, 0), (L * 0.45, -Wd, 0.015), (L, 0, 0.03), (L * 0.45, Wd, 0.015), (L * 0.5, 0, -0.01)]]
        leaf.faces.new((v[0], v[1], v[4]))
        leaf.faces.new((v[1], v[2], v[4]))
        leaf.faces.new((v[2], v[3], v[4]))
        leaf.faces.new((v[3], v[0], v[4]))
        ob = finish(f"{name}Leaf{i}", leaf, M["leaf"] if i % 3 else M["leaf2"], parent=root)
        ob.modifiers.clear()
        sol = ob.modifiers.new("Solidify", "SOLIDIFY")
        sol.thickness = 0.004
        ob.location = (math.cos(a) * r * 0.3, math.sin(a) * r * 0.3, z)
        ob.rotation_euler = Euler((0, -rnd.uniform(0.1, 0.7), a), "XYZ")
    return root


def snake_plant(name, loc, n=11, pot_r=0.13, pot_h=0.3):
    """Tall sword-like blades: reads clearly at thumbnail size."""
    root = bpy.data.objects.new(name, None)
    root.location = loc
    link(root)
    cyl(f"{name}Pot", pot_r, pot_h, (0, 0, pot_h / 2), M["pot"], r2=pot_r * 0.82, bevel=0.01, seg=3, parent=root)
    cyl(f"{name}Rim", pot_r + 0.006, 0.025, (0, 0, pot_h - 0.012), M["pot"], bevel=0.008, seg=2, parent=root)
    cyl(f"{name}Soil", pot_r * 0.95, 0.01, (0, 0, pot_h - 0.015), M["soil"], bevel=0.0, parent=root)
    rnd = random.Random(name)
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.3, 0.3)
        hgt = rnd.uniform(0.42, 0.78)
        wid = rnd.uniform(0.045, 0.065)
        lean = rnd.uniform(0.08, 0.3)
        bm = bmesh.new()
        steps = 8
        rows = []
        for s in range(steps + 1):
            t = s / steps
            w = wid * (math.sin(math.pi * min(1.0, t * 0.85 + 0.15)) * 0.9 + 0.1) * (1 - t * 0.6)
            x = lean * t * t * hgt
            z = hgt * t
            fold = w * 0.35  # V-shaped cross-section
            rows.append([bm.verts.new((x, -w, z + 0)), bm.verts.new((x - fold, 0, z)), bm.verts.new((x, w, z))])
        for s in range(steps):
            a0, a1 = rows[s], rows[s + 1]
            bm.faces.new((a0[0], a0[1], a1[1], a1[0]))
            bm.faces.new((a0[1], a0[2], a1[2], a1[1]))
        ob = finish(f"{name}Blade{i}", bm, M["leaf"] if i % 2 else M["leaf2"], parent=root)
        ob.modifiers.clear()
        sol = ob.modifiers.new("Solidify", "SOLIDIFY")
        sol.thickness = 0.005
        r = rnd.uniform(0.0, pot_r * 0.55)
        ob.location = (math.cos(a) * r, math.sin(a) * r, pot_h - 0.02)
        ob.rotation_euler = (0, 0, a)
    return root


snake_plant("FloorPlant", (0.92, -0.25, 0), n=15)
succulent("DeskSucculent", (-0.84, 0.66, DZ), pot_r=0.055, pot_h=0.08, pot_mat=M["pot_t"], rings=(10, 7))

# floor cushion / pouf at the front-left
cyl("Pouf", 0.2, 0.2, (-0.82, -0.72, 0.1), M["fabric_dk"], verts=32, bevel=0.06, seg=4)
box("FloorBooks", (0.22, 0.16, 0.05), (-0.75, -0.25, 0.025), M["book5"], bevel=0.005, rot=(0, 0, 0.3))
box("FloorBooks2", (0.2, 0.15, 0.04), (-0.75, -0.25, 0.07), M["book4"], bevel=0.005, rot=(0, 0, 0.05))

# ================================================================== helpers for render/export
def tri_count():
    deps = bpy.context.evaluated_depsgraph_get()
    total = 0
    for ob in COL.all_objects:
        if ob.type != "MESH":
            continue
        ev = ob.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        total += len(me.loop_triangles)
        ev.to_mesh_clear()
    return total


def setup_render(res=1200):
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    scene.render.resolution_x = res
    scene.render.resolution_y = res
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    try:
        scene.eevee.use_raytracing = True
        scene.eevee.taa_render_samples = 64
        scene.eevee.use_shadows = True
    except AttributeError:
        pass
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = hexrgb("#2a2630")
    bg.inputs["Strength"].default_value = 0.35

    def area(name, loc, target, energy, size, color="#ffffff"):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy
        ld.size = size
        ld.color = hexrgb(color)[:3]
        lo = bpy.data.objects.new(name, ld)
        lo.location = loc
        direction = Vector(target) - Vector(loc)
        lo.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(lo)

    area("Key", (3.0, -3.2, 4.2), (0, 0, 0.6), 900, 3.0, "#fff3e6")
    area("Fill", (-2.5, -3.5, 2.0), (0, 0, 0.8), 220, 3.0, "#cfd8ff")
    area("Rim", (0.5, 3.5, 3.5), (0, 0, 1.0), 300, 2.0, "#ffd0d8")
    area("Inside", (0.1, 0.1, 2.1), (0, 0.2, 0.6), 120, 1.2, "#fff1d6")
    # warm lamp spill on the desk
    pl = bpy.data.lights.new("LampSpill", "POINT")
    pl.energy = 15
    pl.color = hexrgb("#ffd59a")[:3]
    pl.shadow_soft_size = 0.05
    plo = bpy.data.objects.new("LampSpill", pl)
    plo.location = (-0.55, dy1 - 0.05, DZ + 0.3)
    scene.collection.objects.link(plo)

    cam_d = bpy.data.cameras.new("Cam")
    cam_d.type = "ORTHO"
    cam_d.ortho_scale = 4.15
    cam = bpy.data.objects.new("Cam", cam_d)
    target = Vector((-0.06, 0.06, 0.98))
    cam.rotation_euler = Euler((math.radians(62), 0, math.radians(42)), "XYZ")
    fwd = cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))
    cam.location = target - fwd * 12
    scene.collection.objects.link(cam)
    scene.camera = cam


def export_glb():
    OUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(OUT / "diorama.glb"),
        export_format="GLB",
        export_apply=True,
        export_lights=False,
        export_cameras=False,
        export_yup=True,
        export_image_format="AUTO",
        use_selection=False,
    )


HERE.mkdir(parents=True, exist_ok=True)
RENDERS.mkdir(parents=True, exist_ok=True)
print(f"[diorama] triangles: {tri_count()}")
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "diorama.blend"))
export_glb()
print(f"[diorama] glb: {(OUT / 'diorama.glb').stat().st_size / 1024:.0f} KB")

AUDIT_VIEWS = [
    # name, camera location, look-at target, focal length (mm)
    ("chair_side", (1.4, 0.0, 0.75), (-0.18, 0.12, 0.6), 40),
    ("chair_back", (-0.9, -1.1, 0.9), (-0.18, 0.12, 0.6), 40),
    ("desk_front", (-0.1, -0.7, 1.0), (-0.1, 0.85, 0.85), 30),
    ("desk_left", (-0.95, 0.15, 1.15), (-0.55, 0.9, 0.85), 28),
    ("desk_right", (1.05, 0.2, 1.05), (0.45, 0.9, 0.85), 30),
    ("under_desk", (0.9, -0.4, 0.35), (0.3, 0.85, 0.3), 26),
    ("shelf_wall", (0.4, 0.0, 1.45), (-1.15, 0.0, 1.4), 30),
    ("floor_front", (0.6, -1.5, 0.35), (-0.1, 0.1, 0.25), 30),
]


def render_audit():
    setup_render(700)
    scene.render.resolution_y = 500
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    cam = scene.camera
    cam.data.type = "PERSP"
    for name, loc, target, lens in AUDIT_VIEWS:
        cam.data.lens = lens
        cam.location = loc
        cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = str(RENDERS / f"audit_{name}.png")
        bpy.ops.render.render(write_still=True)
    print("[diorama] audit renders written")


if AUDIT:
    render_audit()
elif RENDER or PREVIEW:
    setup_render(600 if PREVIEW else 1200)
    if PREVIEW:
        scene.render.image_settings.file_format = "PNG"
        scene.render.filepath = str(RENDERS / "preview.png")
    else:
        scene.render.image_settings.file_format = "WEBP"
        scene.render.image_settings.color_mode = "RGBA"
        scene.render.image_settings.quality = 88
        scene.render.filepath = str(OUT / "diorama.webp")
    bpy.ops.render.render(write_still=True)
    print(f"[diorama] rendered {scene.render.filepath}")
    if PREVIEW:  # close-up of the desk to check small details
        scene.camera.data.ortho_scale = 1.6
        fwd = scene.camera.rotation_euler.to_matrix() @ Vector((0, 0, -1))
        scene.camera.location = Vector((-0.1, 0.75, 0.95)) - fwd * 12
        scene.render.filepath = str(RENDERS / "preview_desk.png")
        bpy.ops.render.render(write_still=True)
