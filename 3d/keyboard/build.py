"""Procedural 75% mechanical keyboard for the portfolio (keys pressed live in the browser).

Run from the repo root:
  blender -b --factory-startup -P 3d/keyboard/build.py              # build + export + poster
  blender -b --factory-startup -P 3d/keyboard/build.py -- preview    # also QA renders into 3d/keyboard/renders/
  blender -b --factory-startup -P 3d/keyboard/build.py -- nopost     # export only (no poster render)

Contract with the website:
  every keycap is one mesh node named exactly after KeyboardEvent.code (plus `Knob`), parented to the
  `Keys` empty that carries the typing tilt. Key nodes have identity rotation/scale, origin at the cap's
  bottom-centre, local up (glTF +Y) perpendicular to the plate. Press = translate local +Y by -3.5 mm.

Modelling units are millimetres (meshes written in metres). Blender is Z-up while building, front row
toward -Y; the glTF exporter converts to Y-up (front toward +Z).
Everything is generated from an empty scene, so the script is idempotent.
"""
import bpy
import bmesh
import math
import os
import sys

import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
RENDERS = os.path.join(HERE, "renders")
GLB_PATH = os.path.join(ROOT, "public", "models", "keyboard.glb")
POSTER_PATH = os.path.join(ROOT, "public", "models", "keyboard.webp")
MM = 0.001

U = 19.05            # key pitch
TILT = math.radians(6.0)
PRESS = 3.5          # travel used by the site
HOUSING_TOP = 6.0    # switch housing top above plate top
CAP_REST = HOUSING_TOP + 1.0   # cap bottom above plate top at rest
RIM = 8.5            # case top above plate top

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Keyboard"
scene.unit_settings.system = "METRIC"
COL = scene.collection

# --------------------------------------------------------------------------------------
# materials (Principled basics only: glTF friendly)
# --------------------------------------------------------------------------------------

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


def material(name, hexcol, rough, metal=0.0, emit=None, strength=0.0, coat=0.0, coat_rough=0.1, spec=0.5):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = srgb(hexcol)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = spec
    if emit:
        b.inputs["Emission Color"].default_value = srgb(emit)
        b.inputs["Emission Strength"].default_value = strength
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = coat_rough
    m.diffuse_color = srgb(hexcol)
    return m


MAT = {
    "case": material("Case_Aluminium", "#1c1c1c", 0.35, metal=0.8),
    "plate": material("Plate_Anodized", "#2a2a2c", 0.45, metal=0.7),
    "switch": material("Switch_Housing", "#151517", 0.5, spec=0.4),
    "brass": material("Brass_Badge", "#b08d57", 0.3, metal=1.0),
    "cream": material("Cap_Cream_PBT", "#e9e4d8", 0.62, spec=0.4),
    "dark": material("Cap_Dark_PBT", "#2c2c2c", 0.62, spec=0.4),
    "wine": material("Cap_Wine_PBT", "#b3263e", 0.6, spec=0.4),
    "wine_dark": material("Cap_WineDark_PBT", "#6b1424", 0.6, spec=0.4),
    "leg_dark": material("Legend_Dark", "#1a1a1a", 0.55, spec=0.4),
    "leg_cream": material("Legend_Cream", "#e9e4d8", 0.55, spec=0.4),
    "knob": material("Knob_Steel", "#b9bcc1", 0.28, metal=1.0),
    "glow": material("Knob_Indicator_Glow", "#3dbe7e", 0.3, emit="#3dbe7e", strength=4.0),
}

# --------------------------------------------------------------------------------------
# geometry helpers (mm, numpy)
# --------------------------------------------------------------------------------------

def rrect(hw, hd, r, cseg=4, nx=2, ny=1):
    """Rounded rectangle loop, CCW, consistent point count for equal (cseg, nx, ny).
    Order: corner TR, back side, corner TL, left side, corner BL, front side, corner BR, right side.
    With ny == 1 the back half [0, m) mirrors the front half [m, 2m) in x (front j <-> back m-1-j)."""
    r = min(r, hw - 1e-3, hd - 1e-3)
    cs = [(hw - r, hd - r, 0.0), (-(hw - r), hd - r, 90.0), (-(hw - r), -(hd - r), 180.0), (hw - r, -(hd - r), 270.0)]
    pts = []
    for k, (cx, cy, a0) in enumerate(cs):
        for j in range(cseg + 1):
            a = math.radians(a0 + 90.0 * j / cseg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        n = nx if k in (0, 2) else ny
        ncx, ncy, na0 = cs[(k + 1) % 4]
        s = np.array(pts[-1])
        e = np.array((ncx + r * math.cos(math.radians(na0)), ncy + r * math.sin(math.radians(na0))))
        for i in range(1, n):
            pts.append(tuple(s + (e - s) * i / n))
    return np.array(pts, float)


class MeshBuilder:
    def __init__(self):
        self.V = []
        self.F = []
        self.M = []   # material index per face
        self.up = []  # True: force normal to +Z (flat decals)

    def add_verts(self, pts):
        s = len(self.V)
        self.V.extend([tuple(map(float, p)) for p in pts])
        return list(range(s, s + len(pts)))

    def face(self, idx, mat=0, up=False):
        self.F.append(list(idx))
        self.M.append(mat)
        self.up.append(up)

    def strip(self, a, b, mat=0):
        n = len(a)
        for i in range(n):
            j = (i + 1) % n
            self.face((a[i], a[j], b[j], b[i]), mat)

    def ladder(self, ring, mat=0):
        n = len(ring)
        m = n // 2
        back, front = ring[:m], ring[m:]
        for i in range(m - 1):
            self.face((back[i], back[i + 1], front[m - 2 - i], front[m - 1 - i]), mat)

    def ngon(self, ring, mat=0):
        self.face(ring, mat)

    def merge(self, other, mat_offset=0):
        s = len(self.V)
        self.V.extend(other.V)
        for f, m, u in zip(other.F, other.M, other.up):
            self.F.append([i + s for i in f])
            self.M.append(m + mat_offset)
            self.up.append(u)


def ring3(pts2, z):
    z = np.broadcast_to(np.asarray(z, float), (len(pts2),))
    return np.column_stack([pts2, z])


def prism(mb, ring2, z0, z1, mat=0):
    a = mb.add_verts(ring3(ring2, z0))
    b = mb.add_verts(ring3(ring2, z1))
    mb.strip(a, b, mat)
    mb.ngon(a[::-1], mat)
    mb.ngon(b, mat)


def frustum(mb, cx, cy, hb, ht, z0, z1, mat=0, hby=None, hty=None):
    hby = hb if hby is None else hby
    hty = ht if hty is None else hty
    b = [(cx + hb, cy + hby), (cx - hb, cy + hby), (cx - hb, cy - hby), (cx + hb, cy - hby)]
    t = [(cx + ht, cy + hty), (cx - ht, cy + hty), (cx - ht, cy - hty), (cx + ht, cy - hty)]
    a = mb.add_verts(ring3(np.array(b), z0))
    c = mb.add_verts(ring3(np.array(t), z1))
    mb.strip(a, c, mat)
    mb.ngon(a[::-1], mat)
    mb.ngon(c, mat)


def make_object(name, mb, mats, xform=None, origin=(0, 0, 0), sharp_deg=50.0, weighted=False, parent=None):
    V = np.asarray(mb.V, float)
    if xform is not None:   # 4x4 matrix in mm space applied to the vertices
        Vh = np.column_stack([V, np.ones(len(V))]) @ np.asarray(xform).T
        V = Vh[:, :3]
    V = (V - np.asarray(origin, float)) * MM
    me = bpy.data.meshes.new(name)
    me.from_pydata(V.tolist(), [], mb.F)
    for p, m in zip(me.polygons, mb.M):
        p.material_index = m
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    up_flags = list(mb.up)
    solid = [f for f, u in zip(bm.faces, up_flags) if not u]
    decal = [f for f, u in zip(bm.faces, up_flags) if u]
    if solid:
        bmesh.ops.recalc_face_normals(bm, faces=solid)
    for f in decal:
        f.normal_update()
        if f.normal.z < 0:
            f.normal_flip()
    lim = math.radians(sharp_deg)
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = e.calc_face_angle(0.0) < lim
        else:
            e.smooth = True
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    if parent is not None:
        ob.parent = parent
    ob.location = Vector(np.asarray(origin, float) * MM)
    if weighted:
        mod = ob.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        mod.keep_sharp = True
        mod.mode = "FACE_AREA"
    return ob


def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]], float)


def translate(t):
    m = np.eye(4)
    m[:3, 3] = t
    return m


# --------------------------------------------------------------------------------------
# layout: (code, col, row_y, width, row_profile, color, legend)
# row_y in units from the top of the key area; columns in units from the left
# --------------------------------------------------------------------------------------
KEYS = []


def key(code, col, row_y, w=1.0, prof=None, color="cream", legend=None):
    KEYS.append(dict(code=code, col=col, row=row_y, w=w, prof=prof, color=color, legend=legend))


R = [0.0, 1.25, 2.25, 3.25, 4.25, 5.25]
ARROW_DROP = 0.25

key("Escape", 0, R[0], prof=0, color="wine", legend=("esc", "mod"))
for i in range(12):
    group = i // 4
    col = 1.25 + i + 0.25 * group
    key(f"F{i + 1}", col, R[0], prof=0, color="cream" if group == 1 else "dark", legend=(f"F{i + 1}", "fn"))
key("Delete", 14, R[0], prof=0, color="dark", legend=("del", "mod"))

row1 = ["Backquote"] + [f"Digit{i}" for i in range(1, 10)] + ["Digit0", "Minus", "Equal"]
lab1 = ["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="]
for i, (c, l) in enumerate(zip(row1, lab1)):
    key(c, i, R[1], prof=1, legend=(l, "punct" if c in ("Backquote", "Minus", "Equal") else "alpha"))
key("Backspace", 13, R[1], 2.0, prof=1, color="dark", legend=("back", "mod"))
key("Home", 15, R[1], prof=1, color="dark", legend=("home", "mod"))

key("Tab", 0, R[2], 1.5, prof=2, color="dark", legend=("tab", "mod"))
for i, ch in enumerate("QWERTYUIOP"):
    key(f"Key{ch}", 1.5 + i, R[2], prof=2, legend=(ch, "alpha"))
key("BracketLeft", 11.5, R[2], prof=2, legend=("[", "punct"))
key("BracketRight", 12.5, R[2], prof=2, legend=("]", "punct"))
key("Backslash", 13.5, R[2], 1.5, prof=2, legend=("\\", "punct"))
key("PageUp", 15, R[2], prof=2, color="dark", legend=("pgup", "mod"))

key("CapsLock", 0, R[3], 1.75, prof=3, color="dark", legend=("caps", "mod"))
for i, ch in enumerate("ASDFGHJKL"):
    key(f"Key{ch}", 1.75 + i, R[3], prof=3, legend=(ch, "alpha"))
key("Semicolon", 10.75, R[3], prof=3, legend=(";", "punct"))
key("Quote", 11.75, R[3], prof=3, legend=("'", "punct"))
key("Enter", 12.75, R[3], 2.25, prof=3, color="wine", legend=("enter", "mod"))
key("PageDown", 15, R[3], prof=3, color="dark", legend=("pgdn", "mod"))

key("ShiftLeft", 0, R[4], 2.25, prof=4, color="dark", legend=("shift", "mod"))
for i, ch in enumerate("ZXCVBNM"):
    key(f"Key{ch}", 2.25 + i, R[4], prof=4, legend=(ch, "alpha"))
key("Comma", 9.25, R[4], prof=4, legend=(",", "punct"))
key("Period", 10.25, R[4], prof=4, legend=(".", "punct"))
key("Slash", 11.25, R[4], prof=4, legend=("/", "punct"))
key("ShiftRight", 12.25, R[4], 1.75, prof=4, color="dark", legend=("shift", "mod"))
key("ArrowUp", 14, R[4], prof=4, color="wine_dark", legend=("up", "arrow"))
key("End", 15, R[4], prof=4, color="dark", legend=("end", "mod"))

key("ControlLeft", 0, R[5], 1.25, prof=5, color="dark", legend=("ctrl", "mod"))
key("MetaLeft", 1.25, R[5], 1.25, prof=5, color="dark", legend=("diamond", "shape"))
key("AltLeft", 2.5, R[5], 1.25, prof=5, color="dark", legend=("alt", "mod"))
key("Space", 3.75, R[5], 6.25, prof=5, color="cream", legend=None)
key("AltRight", 10, R[5], prof=5, color="dark", legend=("alt", "mod"))
key("Fn", 11, R[5], prof=5, color="dark", legend=("fn", "mod"))
key("ControlRight", 12, R[5], prof=5, color="dark", legend=("ctrl", "mod"))
key("ArrowLeft", 13, R[5] + ARROW_DROP, prof=5, color="wine_dark", legend=("left", "arrow"))
key("ArrowDown", 14, R[5] + ARROW_DROP, prof=5, color="wine_dark", legend=("down", "arrow"))
key("ArrowRight", 15, R[5] + ARROW_DROP, prof=5, color="wine_dark", legend=("right", "arrow"))

KNOB = dict(col=15, row=R[0])
AREA_W = 16.0 * U
AREA_H = (R[5] + ARROW_DROP + 1.0) * U


def unit_center(col, row, w=1.0):
    """Plate-frame centre (mm) of a key; plate frame origin = centre of the key area."""
    return ((col + w / 2) * U - AREA_W / 2, AREA_H / 2 - (row + 0.5) * U)


# sculpted row profile: (cap height at the top centre-line, top tilt deg: + = back edge higher)
PROFILE = {0: (9.4, 6.0), 1: (9.0, 4.0), 2: (8.0, 2.0), 3: (7.6, -1.0), 4: (7.9, -5.0), 5: (7.9, -6.0)}
DISH = 0.5
TAPER = 2.6
FIL = 0.9
WALL = 1.2
INNER_H = 4.6

# --------------------------------------------------------------------------------------
# legends
# --------------------------------------------------------------------------------------
FONT = None  # Blender's built-in font

LEGEND_SIZE = {"alpha": 5.4, "punct": 7.0, "fn": 3.9, "mod": 3.9}
LEGEND_BOLD = {"alpha": 0.16, "punct": 0.2, "fn": 0.12, "mod": 0.12}
_text_cache = {}


def text_geom(body, size, bold=0.0):
    keyc = (body, size, bold)
    if keyc in _text_cache:
        return _text_cache[keyc]
    cu = bpy.data.curves.new("tmp_text", "FONT")
    cu.body = body
    cu.size = size
    if FONT is not None:
        cu.font = FONT
    cu.resolution_u = 2
    cu.offset = bold
    ob = bpy.data.objects.new("tmp_text", cu)
    COL.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    V = np.array([v.co[:2] for v in bm.verts], float)
    F = [[v.index for v in f.verts] for f in bm.faces]
    bm.free()
    ev.to_mesh_clear()
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)
    if len(V):
        V -= (V.min(0) + V.max(0)) / 2
    _text_cache[keyc] = (V, F)
    return V, F


def shape_geom(kind):
    if kind == "diamond":
        r = 2.0
        V = np.array([(r, 0), (0, r), (-r, 0), (0, -r)], float)
        return V, [[0, 1, 2, 3]]
    # arrows: isoceles triangle pointing up, rotated
    s = 3.4
    V = np.array([(0, s * 0.55), (-s * 0.5, -s * 0.38), (s * 0.5, -s * 0.38)], float)
    ang = {"up": 0, "left": 90, "right": -90, "down": 180}[kind]
    a = math.radians(ang)
    Rm = np.array([[math.cos(a), -math.sin(a)], [math.sin(a), math.cos(a)]])
    return V @ Rm.T, [[0, 1, 2]]


# --------------------------------------------------------------------------------------
# keycap builder (cap-local mm: origin at bottom centre, z up = plate normal)
# --------------------------------------------------------------------------------------

def build_cap(w, prof, legend):
    H, tilt_deg = PROFILE[prof]
    tt = math.tan(math.radians(tilt_deg))
    bhw = (w * U - 1.05) / 2
    bhd = 9.0
    thw, thd = bhw - TAPER, bhd - TAPER
    rb, rt = 1.1, 2.0
    nx = max(2, int(round(2 * (thw - rt) / 3.0)))

    def ztop(x, y):
        xn = np.clip(np.asarray(x) / thw, -1, 1)
        return H + tt * np.asarray(y) - DISH * (1 - xn ** 2)

    mb = MeshBuilder()
    R0 = rrect(bhw, bhd, rb, nx=nx)
    E2 = rrect(thw - FIL, thd - FIL, rt - FIL, nx=nx)
    W2 = rrect(thw, thd, rt, nx=nx)
    k = 1 - math.cos(math.radians(45))
    M2 = rrect(thw - k * FIL, thd - k * FIL, rt - k * FIL, nx=nx)
    zE = ztop(E2[:, 0], E2[:, 1])
    r0 = mb.add_verts(ring3(R0, 0.0))
    rw = mb.add_verts(ring3(W2, zE - FIL))
    rm = mb.add_verts(ring3(M2, zE - k * FIL))
    re = mb.add_verts(ring3(E2, zE))
    mb.strip(r0, rw)
    mb.strip(rw, rm)
    mb.strip(rm, re)
    mb.ladder(re)
    # hollow skirt: lip, inner wall, ceiling
    tin = TAPER * INNER_H / (H - FIL)
    IB = rrect(bhw - WALL, bhd - WALL, 0.4, nx=nx)
    IT = rrect(bhw - WALL - tin, bhd - WALL - tin, 0.4, nx=nx)
    ib = mb.add_verts(ring3(IB, 0.0))
    it = mb.add_verts(ring3(IT, INNER_H))
    mb.strip(r0, ib)
    mb.strip(ib, it)
    mb.ladder(it)

    if legend:
        body, kind = legend
        if kind in ("arrow", "shape"):
            V2, F2 = shape_geom(body)
        else:
            V2, F2 = text_geom(body, LEGEND_SIZE[kind], LEGEND_BOLD[kind])
        if len(V2):
            z = ztop(V2[:, 0], V2[:, 1]) + 0.12
            idx = mb.add_verts(np.column_stack([V2, z]))
            for f in F2:
                mb.face([idx[i] for i in f], mat=1, up=True)
    return mb


def build_knob():
    mb = MeshBuilder()
    n = 48
    a = np.linspace(0, 2 * math.pi, n, endpoint=False)
    rr = np.where(np.arange(n) % 2 == 0, 7.75, 7.45)  # knurled flutes
    ring = np.column_stack([rr * np.cos(a), rr * np.sin(a)])
    top = np.column_stack([6.9 * np.cos(a), 6.9 * np.sin(a)])
    b0 = mb.add_verts(ring3(ring, 0.0))
    b1 = mb.add_verts(ring3(ring, 9.4))
    b2 = mb.add_verts(ring3(top, 10.3))
    mb.strip(b0, b1)
    mb.strip(b1, b2)
    mb.ngon(b0[::-1])
    mb.ngon(b2)
    # emissive indicator line on top, pointing toward the user
    ind = MeshBuilder()
    frustum(ind, 0.0, -3.6, 0.5, 0.5, 10.3, 10.45, hby=2.6, hty=2.6)
    mb.merge(ind, mat_offset=1)
    return mb


# --------------------------------------------------------------------------------------
# frame: plate frame -> world (tilted about X)
# --------------------------------------------------------------------------------------
BEZEL = 11.0
GAPM = 0.9                     # clearance between key area and the case opening
A_HALF = AREA_W / 2 + GAPM     # opening half size
B_HALF = AREA_H / 2 + GAPM
OA, OB = A_HALF + BEZEL, B_HALF + BEZEL
FRONT_TOP = 19.5               # world height of the front top edge

# world z of plate-frame point (y', z') = Tz + y' sin + z' cos
Tz = FRONT_TOP - (-OB * math.sin(TILT) + RIM * math.cos(TILT))
MX = translate((0, 0, Tz)) @ rot_x(TILT)

# --------------------------------------------------------------------------------------
# case
# --------------------------------------------------------------------------------------
CS = 8
case = MeshBuilder()
oring = lambda d: rrect(OA + d, OB + d, 7.0 + d, cseg=CS, nx=1)
pring = lambda d: rrect(A_HALF + d, B_HALF + d, 2.4 + d, cseg=CS, nx=1)
Rf = 2.2
SEAM = -5.0
rings = [case.add_verts(ring3(oring(0), -45.0))]
for d, z in ((0, SEAM - 0.45), (-0.5, SEAM - 0.2), (-0.5, SEAM + 0.2), (0, SEAM + 0.45)):
    rings.append(case.add_verts(ring3(oring(d), z)))
rings.append(case.add_verts(ring3(oring(0), RIM - Rf)))
for ang in (30, 60, 90):
    p = math.radians(ang)
    rings.append(case.add_verts(ring3(oring(-Rf + Rf * math.cos(p)), RIM - Rf + Rf * math.sin(p))))
rings.append(case.add_verts(ring3(pring(0.8), RIM)))
rings.append(case.add_verts(ring3(pring(0.0), RIM - 0.8)))
rings.append(case.add_verts(ring3(pring(0.0), -1.5)))
for a_, b_ in zip(rings[:-1], rings[1:]):
    case.strip(a_, b_)
case.ngon(rings[-1])
case.ngon(rings[0][::-1])
# brass weight badge on the back wall
badge = MeshBuilder()
bz0, bz1 = RIM - 17.0, RIM - 6.0
bring = rrect(28.0, (bz1 - bz0) / 2, 2.0, cseg=4, nx=1)
b_in = badge.add_verts([(x, OB - 0.3, (bz0 + bz1) / 2 + y) for x, y in bring])
b_out = badge.add_verts([(x * 0.985, OB + 0.7, (bz0 + bz1) / 2 + y * 0.93) for x, y in bring])
badge.strip(b_in, b_out)
badge.ngon(b_out)
badge.ngon(b_in[::-1])

case_ob = make_object("Case", case, [MAT["case"]], xform=MX, sharp_deg=35.0, weighted=True)
# flatten the bottom: bisect at world z = 0 and cap it
me = case_ob.data
bm = bmesh.new()
bm.from_mesh(me)
geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, 0), plane_no=(0, 0, 1), clear_inner=True)
bnd = [e for e in bm.edges if len(e.link_faces) == 1]
res = bmesh.ops.holes_fill(bm, edges=bnd, sides=0)
for f in res["faces"]:
    f.smooth = True
    f.material_index = 0
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bottom_edges = list({e for f in res["faces"] for e in f.edges})
try:
    bmesh.ops.bevel(bm, geom=bottom_edges, offset=1.2 * MM, segments=2, profile=0.5, affect="EDGES",
                    clamp_overlap=True)
except Exception as exc:
    print("BOTTOM BEVEL FAILED", exc)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
for f in bm.faces:
    f.smooth = True
for e in bm.edges:
    if len(e.link_faces) == 2:
        e.smooth = e.calc_face_angle(0.0) < math.radians(35)
bm.to_mesh(me)
bm.free()
badge_ob = make_object("Badge", badge, [MAT["brass"]], xform=MX, sharp_deg=40.0)

# --------------------------------------------------------------------------------------
# plate + switches (static)
# --------------------------------------------------------------------------------------
plate = MeshBuilder()
prism(plate, pring(-0.1), -1.5, 0.0)
plate_ob = make_object("Plate", plate, [MAT["plate"]], xform=MX, sharp_deg=40.0)

sw = MeshBuilder()
for k in KEYS:
    cx, cy = unit_center(k["col"], k["row"], k["w"])
    frustum(sw, cx, cy, 7.0, 5.4, 0.0, HOUSING_TOP)
    # stabiliser housings under long keys
    if k["w"] >= 2.0:
        off = 50.0 if k["w"] > 6 else 11.94
        for sx in (-off, off):
            frustum(sw, cx + sx, cy - 1.0, 3.2, 2.6, 0.0, 5.0, hby=5.5, hty=4.8)
kx, ky = unit_center(KNOB["col"], KNOB["row"])
frustum(sw, kx, ky, 6.6, 5.6, 0.0, 6.0)   # rotary encoder body
switch_ob = make_object("Switches", sw, [MAT["switch"]], xform=MX, sharp_deg=40.0)

# --------------------------------------------------------------------------------------
# keys
# --------------------------------------------------------------------------------------
keys_empty = bpy.data.objects.new("Keys", None)
keys_empty.empty_display_size = 0.02
COL.objects.link(keys_empty)
keys_empty.location = Vector(MX[:3, 3] * MM)
keys_empty.rotation_euler = (TILT, 0, 0)

LEG = {"cream": "leg_dark", "dark": "leg_cream", "wine": "leg_cream", "wine_dark": "leg_cream"}
KEY_OBS = {}
for k in KEYS:
    cx, cy = unit_center(k["col"], k["row"], k["w"])
    mb = build_cap(k["w"], k["prof"], k["legend"])
    mats = [MAT[k["color"]], MAT[LEG[k["color"]]]]
    ob = make_object(k["code"], mb, mats, sharp_deg=60.0, parent=keys_empty)
    ob.location = Vector((cx * MM, cy * MM, CAP_REST * MM))
    KEY_OBS[k["code"]] = ob

knob = make_object("Knob", build_knob(), [MAT["knob"], MAT["glow"]], sharp_deg=30.0, parent=keys_empty)
knob.location = Vector((kx * MM, ky * MM, CAP_REST * MM))
KEY_OBS["Knob"] = knob

# --------------------------------------------------------------------------------------
# recentre (x, y) and root
# --------------------------------------------------------------------------------------
bpy.context.view_layer.update()
lo = np.full(3, 1e9)
hi = np.full(3, -1e9)
for ob in scene.objects:
    if ob.type == "MESH":
        mw = np.array(ob.matrix_world)
        V = np.array([v.co for v in ob.data.vertices])
        W = V @ mw[:3, :3].T + mw[:3, 3]
        lo = np.minimum(lo, W.min(0))
        hi = np.maximum(hi, W.max(0))
off = Vector(((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]))
for ob in (case_ob, badge_ob, plate_ob, switch_ob):
    ob.data.transform(Matrix.Translation(-off))
keys_empty.location -= off
root = bpy.data.objects.new("Keyboard", None)
COL.objects.link(root)
for ob in (case_ob, badge_ob, plate_ob, switch_ob, keys_empty):
    ob.parent = root
bpy.context.view_layer.update()
DIMS = Vector(hi - lo)
print("DIMS mm", [round(v * 1000, 1) for v in DIMS])

# --------------------------------------------------------------------------------------
# press check: every key pushed 3.5 mm must not touch housings, case or neighbours
# --------------------------------------------------------------------------------------

def world_bvh(ob, dz=0.0):
    mw = ob.matrix_world.copy()
    if dz:
        mw = mw @ Matrix.Translation((0, 0, dz))
    V = [mw @ v.co for v in ob.data.vertices]
    return BVHTree.FromPolygons(V, [p.vertices[:] for p in ob.data.polygons], all_triangles=False)


def press_check():
    static = {n: world_bvh(o) for n, o in (("Switches", switch_ob), ("Case", case_ob), ("Plate", plate_ob))}
    rest = {n: world_bvh(o) for n, o in KEY_OBS.items()}
    bad = []
    for n, o in KEY_OBS.items():
        if n == "Knob":
            continue
        for dz, tag in ((0.0, "rest"), (-PRESS * MM, "pressed")):
            t = world_bvh(o, dz)
            for sn, s in static.items():
                if t.overlap(s):
                    bad.append((n, tag, sn))
            if tag == "rest":
                for m, r in rest.items():
                    if m != n and t.overlap(r):
                        bad.append((n, tag, m))
    print("PRESS CHECK:", "OK" if not bad else bad)


press_check()

# --------------------------------------------------------------------------------------
# render setup (studio; not exported)
# --------------------------------------------------------------------------------------
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for dt in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
        try:
            prefs.compute_device_type = dt
            prefs.get_devices()
            if any(d.type == dt for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == dt
                scene.cycles.device = "GPU"
                break
        except Exception:
            continue
except Exception:
    pass
print("RENDER DEVICE:", scene.cycles.device)
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = -0.7
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass

world = bpy.data.worlds.new("Studio")
scene.world = world
world.use_nodes = True
wn = world.node_tree.nodes
bg = wn.get("Background")
tex = wn.new("ShaderNodeTexCoord")
sep = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
world.node_tree.links.new(tex.outputs["Generated"], sep.inputs[0])
world.node_tree.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
world.node_tree.links.new(ramp.outputs["Color"], bg.inputs["Color"])
ramp.color_ramp.elements[0].position = 0.45
ramp.color_ramp.elements[0].color = (0.004, 0.004, 0.005, 1)
ramp.color_ramp.elements[1].position = 0.9
ramp.color_ramp.elements[1].color = (0.07, 0.07, 0.075, 1)
bg.inputs["Strength"].default_value = 1.0

CENTER = Vector((0, 0, DIMS[2] * 0.5))
LIGHTS = []


def area_light(name, loc, power, size, color=(1, 1, 1), size_y=None, target=CENTER):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = power
    ld.color = color
    if size_y:
        ld.shape = "RECTANGLE"
        ld.size = size
        ld.size_y = size_y
    else:
        ld.size = size
    ob = bpy.data.objects.new(name, ld)
    ob.location = Vector(loc)
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()
    COL.objects.link(ob)
    LIGHTS.append(ob)
    return ob


area_light("Key", (-0.35, -0.40, 0.55), 6.0, 0.5)
area_light("Fill", (0.50, -0.30, 0.25), 2.2, 0.6, color=(0.92, 0.95, 1.0))
area_light("Top_Strip", (0.0, 0.10, 0.65), 3.2, 0.9, size_y=0.12)
area_light("Rim_Back_R", (0.45, 0.45, 0.12), 26.0, 0.15, size_y=0.6, color=(1.0, 0.94, 0.92))
area_light("Rim_Back_L", (-0.50, 0.38, 0.10), 18.0, 0.15, size_y=0.6, color=(0.9, 0.95, 1.0))
area_light("Kick_Front", (0.0, -0.60, 0.02), 3.0, 0.8, size_y=0.06)
area_light("Rim_Low_L", (-0.60, -0.10, 0.01), 8.0, 0.08, size_y=0.4, color=(0.92, 0.95, 1.0))

cam_data = bpy.data.cameras.new("Camera")
cam = bpy.data.objects.new("Camera", cam_data)
COL.objects.link(cam)
scene.camera = cam
cam_data.clip_start = 0.01


def aim(loc, target=CENTER, lens=70):
    cam.location = Vector(loc)
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_data.lens = lens


def render(path, res, samples, fmt="PNG", res_y=None):
    scene.render.resolution_x = res
    scene.render.resolution_y = res_y or res
    scene.render.resolution_percentage = 100
    scene.cycles.samples = samples
    scene.render.image_settings.file_format = fmt
    scene.render.image_settings.color_mode = "RGBA"
    if fmt == "WEBP":
        scene.render.image_settings.quality = 92
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def composite_dark(path):
    img = bpy.data.images.load(path)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(-1, 4)
    bgc = np.full(3, 10 / 255, np.float32)
    a = px[:, 3:4]
    px[:, :3] = px[:, :3] * a + bgc * (1 - a)
    px[:, 3] = 1.0
    img.pixels[:] = px.ravel()
    img.filepath_raw = path.replace(".png", "_dark.png")
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


HERO = ((-0.25, -0.36, 0.47), Vector((0.012, 0.006, 0.010)), 56)

# --------------------------------------------------------------------------------------
# export, render
# --------------------------------------------------------------------------------------
os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_draco_mesh_compression_enable=False,
    export_materials="EXPORT",
)
print("GLB SIZE:", os.path.getsize(GLB_PATH))

if "nopost" not in ARGS:
    aim(*HERO)
    render(POSTER_PATH, 1200, 48 if "preview" in ARGS else 160, "WEBP")

if "preview" in ARGS:
    os.makedirs(RENDERS, exist_ok=True)
    c = Vector((0, 0, 0.015))
    views = {
        "hero": HERO,
        "close": ((-0.05, -0.20, 0.17), Vector((-0.03, -0.01, 0.025)), 70),
        "side": ((0.55, 0.0, 0.03), Vector((0, 0, 0.018)), 85),
        "front": ((0.0, -0.60, 0.20), c, 60),
        "top": ((0.0, -0.01, 0.75), c, 50),
    }
    only = [a for a in ARGS if a.startswith("views=")]
    names = only[0][6:].split(",") if only else list(views)
    for nme in names:
        aim(*views[nme])
        render(os.path.join(RENDERS, f"{nme}.png"), 900, 48)
        composite_dark(os.path.join(RENDERS, f"{nme}.png"))
    if "press" in ARGS:
        for n in ("KeyF", "Space", "Enter"):
            KEY_OBS[n].location.z -= PRESS * MM
        aim((-0.04, -0.17, 0.075), Vector((-0.02, -0.03, 0.02)), 60)
        render(os.path.join(RENDERS, "pressed.png"), 900, 48)
        composite_dark(os.path.join(RENDERS, "pressed.png"))
        aim((0.21, -0.07, 0.055), Vector((0.09, 0.0, 0.025)), 75)
        render(os.path.join(RENDERS, "pressed_low.png"), 900, 48)
        composite_dark(os.path.join(RENDERS, "pressed_low.png"))
        for n in ("KeyF", "Space", "Enter"):
            KEY_OBS[n].location.z += PRESS * MM
    if "ibl" in ARGS:
        for ob in LIGHTS:
            ob.hide_render = True
        ramp.color_ramp.elements[0].color = (0.18, 0.18, 0.18, 1)
        ramp.color_ramp.elements[1].color = (0.9, 0.9, 0.9, 1)
        ramp.color_ramp.elements[0].position = 0.3
        aim(*HERO)
        render(os.path.join(RENDERS, "ibl.png"), 900, 48)
        composite_dark(os.path.join(RENDERS, "ibl.png"))
print("DONE")
