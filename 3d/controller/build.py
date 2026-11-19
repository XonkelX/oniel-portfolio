"""Procedural hard-surface gamepad for the portfolio.

Run from the repo root:
  blender -b --factory-startup -P 3d/controller/build.py            # build + save + export + poster
  blender -b --factory-startup -P 3d/controller/build.py -- preview  # also render QA views to 3d/controller/renders/

Everything is generated from scratch (the scene is emptied first), so the script is idempotent.
Modelling units are millimetres; meshes are written in metres (MM scale).
Blender is Z-up while building; the glTF exporter converts to Y-up.
"""
import bpy
import bmesh
import math
import os
import sys

import numpy as np
from mathutils import Matrix, Vector
from mathutils.geometry import delaunay_2d_cdt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
RENDERS = os.path.join(HERE, "renders")
BLEND_PATH = os.path.join(HERE, "controller.blend")
GLB_PATH = os.path.join(ROOT, "public", "models", "controller.glb")
POSTER_PATH = os.path.join(ROOT, "public", "models", "controller.webp")
MM = 0.001

# --------------------------------------------------------------------------------------
# scene reset
# --------------------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Controller"
scene.unit_settings.system = "METRIC"
COL = scene.collection

# --------------------------------------------------------------------------------------
# 2D helpers (numpy)
# --------------------------------------------------------------------------------------

def smoothstep(e0, e1, x):
    t = np.clip((np.asarray(x, float) - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def catmull_rom_closed(ctrl, n_per=24):
    P = np.asarray(ctrl, float)
    N = len(P)
    out = []
    for i in range(N):
        p0, p1, p2, p3 = P[(i - 1) % N], P[i], P[(i + 1) % N], P[(i + 2) % N]

        def tj(ti, pi, pj):
            return ti + max(np.linalg.norm(pj - pi), 1e-6) ** 0.5

        t0 = 0.0
        t1 = tj(t0, p0, p1)
        t2 = tj(t1, p1, p2)
        t3 = tj(t2, p2, p3)
        for k in range(n_per):
            t = t1 + (t2 - t1) * k / n_per
            A1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
            A2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
            A3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
            B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2
            B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3
            out.append((t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2)
    return np.array(out)


def mirror_half(right):
    """right: control points from top centre (x=0) clockwise to bottom centre (x=0)."""
    right = [tuple(p) for p in right]
    left = [(-x, y) for (x, y) in reversed(right[1:-1])]
    return right + left


def signed_area(p):
    x, y = p[:, 0], p[:, 1]
    return 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)


def ccw(p):
    p = np.asarray(p, float)
    return p if signed_area(p) > 0 else p[::-1].copy()


def resample_closed(poly, spacing):
    P = np.vstack([poly, poly[:1]])
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    L = cum[-1]
    n = max(12, int(round(L / spacing)))
    s = np.linspace(0.0, L, n, endpoint=False)
    return np.stack([np.interp(s, cum, P[:, 0]), np.interp(s, cum, P[:, 1])], 1)


def outward_normals(p):
    """Vertex normals pointing out of a CCW loop."""
    t = np.roll(p, -1, 0) - np.roll(p, 1, 0)
    t /= np.linalg.norm(t, axis=1, keepdims=True)
    return np.stack([t[:, 1], -t[:, 0]], 1)


def offset_loop(p, d):
    """Positive d grows a CCW loop outward."""
    return p + outward_normals(p) * d


def smooth_loop(p, iters=2):
    for _ in range(iters):
        p = 0.5 * p + 0.25 * (np.roll(p, 1, 0) + np.roll(p, -1, 0))
    return p


def inside(pts, poly):
    x = pts[:, 0][:, None]
    y = pts[:, 1][:, None]
    x1 = poly[:, 0][None, :]
    y1 = poly[:, 1][None, :]
    x2 = np.roll(poly[:, 0], -1)[None, :]
    y2 = np.roll(poly[:, 1], -1)[None, :]
    cond = (y1 > y) != (y2 > y)
    xint = x1 + (y - y1) * (x2 - x1) / np.where(np.abs(y2 - y1) < 1e-12, 1e-12, y2 - y1)
    return (np.sum(cond & (x < xint), axis=1) % 2) == 1


def dist_to_loop(pts, poly):
    a = poly
    ab = np.roll(poly, -1, 0) - a
    L2 = np.maximum(np.sum(ab * ab, 1), 1e-12)
    out = np.full(len(pts), np.inf)
    for s in range(0, len(pts), 512):
        q = pts[s:s + 512]
        ap = q[:, None, :] - a[None, :, :]
        t = np.clip(np.sum(ap * ab[None], 2) / L2[None], 0, 1)
        d = np.linalg.norm(ap - t[..., None] * ab[None], axis=2)
        out[s:s + 512] = d.min(1)
    return out


def circle(cx, cy, r, spacing):
    n = max(16, int(round(2 * math.pi * r / spacing)))
    a = np.linspace(0, 2 * math.pi, n, endpoint=False)
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def rounded_poly(corners, radii, seg=8):
    """Fillet every corner of a polygon (convex or concave)."""
    P = ccw(np.asarray(corners, float))
    N = len(P)
    if np.isscalar(radii):
        radii = [radii] * N
    out = []
    for i in range(N):
        p, pp, pn = P[i], P[i - 1], P[(i + 1) % N]
        a = (pp - p) / np.linalg.norm(pp - p)
        b = (pn - p) / np.linalg.norm(pn - p)
        ang = math.acos(np.clip(np.dot(a, b), -1, 1))
        r = radii[i]
        t = r / math.tan(ang / 2)
        bis = (a + b) / np.linalg.norm(a + b)
        c = p + bis * (r / math.sin(ang / 2))
        s0 = p + a * t - c
        s1 = p + b * t - c
        a0 = math.atan2(s0[1], s0[0])
        a1 = math.atan2(s1[1], s1[0])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for k in range(seg + 1):
            ak = a0 + da * k / seg
            out.append(c + r * np.array([math.cos(ak), math.sin(ak)]))
    return ccw(np.array(out))


# --------------------------------------------------------------------------------------
# surface generators
# --------------------------------------------------------------------------------------

def triangulate_region(rings, spacing):
    """rings: [(Nx2 loop, is_outer)] -> (out 2D verts, tri faces, per-ring output indices)."""
    coords, edges, ranges = [], [], []
    for pts, _ in rings:
        s = len(coords)
        n = len(pts)
        coords.extend(pts.tolist())
        edges.extend([(s + i, s + (i + 1) % n) for i in range(n)])
        ranges.append((s, n))
    outer = [p for p, o in rings if o][0]
    holes = [p for p, o in rings if not o]
    xmin, ymin = outer.min(0)
    xmax, ymax = outer.max(0)
    dy = spacing * math.sqrt(3) / 2
    rows = []
    for j, y in enumerate(np.arange(ymin + dy * 0.5, ymax, dy)):
        xs = np.arange(xmin + (spacing * 0.5 if j % 2 else 0.0), xmax, spacing)
        rows.append(np.stack([xs, np.full_like(xs, y)], 1))
    G = np.vstack(rows) if rows else np.zeros((0, 2))
    if len(G):
        m = inside(G, outer)
        for h in holes:
            m &= ~inside(G, h)
        G = G[m]
    if len(G):
        dmin = np.min(np.stack([dist_to_loop(G, r) for r, _ in rings], 0), 0)
        G = G[dmin > 0.65 * spacing]
        coords.extend(G.tolist())
    res = delaunay_2d_cdt([Vector(c) for c in coords], edges, [], 0, 1e-5)
    ov, of, origv = res[0], res[2], res[3]
    in2out = {}
    for i, lst in enumerate(origv):
        for k in lst:
            in2out[k] = i
    OV = np.array([[v.x, v.y] for v in ov])
    F = [list(f) for f in of]
    cent = np.array([OV[f].mean(0) for f in F])
    keep = inside(cent, outer)
    for h in holes:
        keep &= ~inside(cent, h)
    F = [f for f, k in zip(F, keep) if k]
    ring_out = [[in2out[s + i] for i in range(n)] for s, n in ranges]
    return OV, F, ring_out


SLAB_N = None  # analytic per-vertex normals of the last build_slab cap (NaN = let Blender compute)


def build_slab(bounds, cap_fn, spacing, bottom_cap_fn=None, cap_sign=1.0):
    """Rounded 2.5D part.

    bounds: list of dicts {loop: CCW Nx2, outer: bool, prof: [(d, zfn), ...]}.
      d = offset from the loop into the material; zfn(x, y, c) gives z with c = cap_fn(x, y).
      The last prof entry is the top cap boundary (zfn ignored). With bottom_cap_fn the
      first entry of the outer bound is the bottom cap boundary.
    """
    V, F = [], []
    ring_lists = []
    cap_rings, bcap_rings = [], []
    for bi, b in enumerate(bounds):
        P = b["loop"]
        n_out = outward_normals(P)
        m = -n_out if b["outer"] else n_out
        lists = []
        for k, (d, zfn) in enumerate(b["prof"]):
            R = P + m * d
            if k == len(b["prof"]) - 1:
                cap_rings.append((bi, R, b["outer"]))
                lists.append(None)
            elif k == 0 and bottom_cap_fn is not None:
                bcap_rings.append((bi, R, b["outer"]))
                lists.append(None)
            else:
                c = cap_fn(R[:, 0], R[:, 1])
                z = np.broadcast_to(zfn(R[:, 0], R[:, 1], c), (len(R),))
                s = len(V)
                V.extend(np.column_stack([R, z]).tolist())
                lists.append(list(range(s, s + len(R))))
        ring_lists.append(lists)

    def add_cap(rings, fn, slot):
        OV, TF, ro = triangulate_region([(R, o) for _, R, o in rings], spacing)
        z = np.broadcast_to(fn(OV[:, 0], OV[:, 1]), (len(OV),))
        s = len(V)
        V.extend(np.column_stack([OV, z]).tolist())
        if slot == -1:
            e = 0.02
            gx = (fn(OV[:, 0] + e, OV[:, 1]) - fn(OV[:, 0] - e, OV[:, 1])) / (2 * e)
            gy = (fn(OV[:, 0], OV[:, 1] + e) - fn(OV[:, 0], OV[:, 1] - e)) / (2 * e)
            nn = np.column_stack([-np.broadcast_to(gx, (len(OV),)), -np.broadcast_to(gy, (len(OV),)),
                                  np.ones(len(OV))]) * cap_sign
            cap_normals.append((s, nn / np.linalg.norm(nn, axis=1, keepdims=True)))
        F.extend([[s + i for i in f] for f in TF])
        for (bi, _, _), idx in zip(rings, ro):
            ring_lists[bi][slot] = [s + i for i in idx]

    cap_normals = []
    add_cap(cap_rings, cap_fn, -1)
    if bottom_cap_fn is not None:
        add_cap(bcap_rings, bottom_cap_fn, 0)
    for lists in ring_lists:
        for a, b in zip(lists[:-1], lists[1:]):
            n = len(a)
            F.extend([[a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]] for i in range(n)])
    global SLAB_N
    SLAB_N = np.full((len(V), 3), np.nan)
    for s, nn in cap_normals:
        SLAB_N[s:s + len(nn)] = nn
    return np.array(V, float), F


def lathe(profile, segs, mod=None):
    """Revolve (r, z) profile (ordered top -> bottom / inside -> outside) around Z."""
    V, F, rings = [], [], []
    for j, (r, z) in enumerate(profile):
        if r < 1e-9:
            V.append((0.0, 0.0, z))
            rings.append([len(V) - 1])
            continue
        ring = []
        for i in range(segs):
            th = 2 * math.pi * i / segs
            rr, zz = mod(th, j, r, z) if mod else (r, z)
            V.append((rr * math.cos(th), rr * math.sin(th), zz))
            ring.append(len(V) - 1)
        rings.append(ring)
    for a, b in zip(rings[:-1], rings[1:]):
        if len(a) == 1:
            F.extend([[a[0], b[i], b[(i + 1) % segs]] for i in range(segs)])
        elif len(b) == 1:
            F.extend([[a[i], b[0], a[(i + 1) % segs]] for i in range(segs)])
        else:
            F.extend([[a[i], b[i], b[(i + 1) % segs], a[(i + 1) % segs]] for i in range(segs)])
    return np.array(V, float), F


def box(sx, sy, sz):
    x, y, z = sx / 2, sy / 2, sz / 2
    V = np.array([[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
                  [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]], float)
    F = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
    return V, F


def transform(V, F, M3, t):
    M3 = np.asarray(M3, float)
    W = V @ M3.T + np.asarray(t, float)
    if np.linalg.det(M3) < 0:
        F = [list(reversed(f)) for f in F]
    return W, F


def roll_prof(r, lip, n=3, raise_=0.0):
    """Edge that rolls over with radius r into a vertical lip of depth `lip` (relative to cap)."""
    prof = [(0.0, lambda x, y, c, r=r, lip=lip: c - r - lip)]
    for th in np.linspace(0, math.pi / 2, n + 1)[:-1]:
        d = r * (1 - math.cos(th))
        s = math.sin(th)
        prof.append((d, lambda x, y, c, r=r, s=s: c - r + r * s))
    prof.append((r, None))
    return prof


def wall_prof(zb, rb, rt, n=3):
    """Double-capped slab: rounded bottom edge (rb), vertical wall, rounded top edge (rt).

    Top roll is relative to the cap function, the bottom is flat at zb."""
    prof = [(rb, None)]
    for th in np.linspace(math.pi / 2, 0, n + 1)[1:]:
        prof.append((rb * (1 - math.cos(th)), lambda x, y, c, s=math.sin(th): zb + rb - rb * s))
    for th in np.linspace(0, math.pi / 2, n + 1)[:-1]:
        prof.append((rt * (1 - math.cos(th)), lambda x, y, c, s=math.sin(th): c - rt + rt * s))
    prof.append((rt, None))
    return prof


# --------------------------------------------------------------------------------------
# materials
# --------------------------------------------------------------------------------------

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


def material(name, hexcol, rough, metal=0.0, emit=None, strength=0.0, coat=0.0, coat_rough=0.08,
             spec=0.5):
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
    m.use_backface_culling = False
    return m


MAT = {
    "shell": material("Shell_SoftTouch", "#191919", 0.6, spec=0.35),
    "shell_bottom": material("Shell_Bottom_SoftTouch", "#121212", 0.66, spec=0.35),
    "faceplate": material("Faceplate_Gloss", "#0a0a0a", 0.22, coat=0.6, coat_rough=0.12),
    "rubber": material("Rubber_Stick", "#141414", 0.82),
    "rubber_grip": material("Rubber_Grip", "#101010", 0.9),
    "metal": material("Metal_Gunmetal", "#8c9096", 0.26, metal=1.0),
    "metal_dark": material("Metal_Dark", "#3a3c40", 0.34, metal=1.0),
    "wine": material("Wine_Anodized", "#6b1424", 0.36, metal=0.6),
    "wine_bright": material("Wine_Satin", "#b3263e", 0.38, metal=0.2, coat=0.3),
    "trigger": material("Trigger_Wine", "#6b1424", 0.42, metal=0.25, coat=0.2),
    "legend": material("Legend_Print", "#9da1a8", 0.45),
    "dpad": material("DPad_Satin", "#202020", 0.38, coat=0.25, coat_rough=0.2),
    "button": material("Button_Gloss", "#0d0d0d", 0.16, coat=0.8, coat_rough=0.05),
    "glow": material("Glow_Green", "#3dbe7e", 0.3, emit="#3dbe7e", strength=6.0),
    "port_inner": material("Port_Inner", "#050505", 0.6),
    "pcb": material("PCB", "#0d3a27", 0.45),
    "chip": material("Chip", "#151515", 0.35),
}

# --------------------------------------------------------------------------------------
# object helper
# --------------------------------------------------------------------------------------
PARTS = {}


def make_obj(name, V, F, mat, origin=None, facing=None, recalc=True, sharp_deg=38.0, normals=None):
    V = np.asarray(V, float)
    if origin is None:
        origin = (V.min(0) + V.max(0)) / 2
    origin = np.asarray(origin, float)
    me = bpy.data.meshes.new(name)
    me.from_pydata(((V - origin) * MM).tolist(), [], [list(map(int, f)) for f in F])
    me.validate(clean_customdata=False)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=2e-7)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=1e-8)
    if recalc:
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if facing is not None:
        fv = Vector(facing)
        score = sum(f.normal.dot(fv) * f.calc_area() for f in bm.faces)
        if score < 0:
            bmesh.ops.reverse_faces(bm, faces=bm.faces)
    for f in bm.faces:
        f.smooth = True
    lim = math.radians(sharp_deg)
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = e.calc_face_angle(0.0) < lim
        else:
            e.smooth = True
    bm.to_mesh(me)
    bm.free()
    if normals is not None:
        # analytic height-field normals on the caps: removes shading wobble from the irregular triangulation
        from mathutils.kdtree import KDTree
        mask = ~np.isnan(normals[:, 0])
        pts = (V[mask] - origin) * MM
        nsel = normals[mask]
        kd = KDTree(len(pts))
        for i, p in enumerate(pts):
            kd.insert(p, i)
        kd.balance()
        cn = me.corner_normals
        out = []
        for lp in me.loops:
            _, idx, dist = kd.find(me.vertices[lp.vertex_index].co)
            out.append(tuple(nsel[idx]) if dist is not None and dist < 1e-7 else tuple(cn[lp.index].vector))
        me.normals_split_custom_set(out)
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = Vector(origin * MM)
    COL.objects.link(ob)
    PARTS[name] = ob
    return ob


# --------------------------------------------------------------------------------------
# design: outline + height fields (mm, Z-up, +Y = shoulders, -Y = grips/player)
# --------------------------------------------------------------------------------------
BODY_RIGHT = [
    (0, 43.0), (12, 44.4), (34, 46.6), (54, 46.4), (67, 42.6), (75.5, 34), (79.4, 21),
    (79.8, 5), (78, -12), (75, -30), (71.5, -47), (67, -61), (60, -70.5), (50.5, -72.4),
    (42.4, -67.6), (37.4, -57.5), (31.4, -47.2), (23, -39.6), (12, -35.6), (0, -34.6),
]
FACE_RIGHT = [
    (0, 33.4), (22, 34.6), (45, 34.8), (59, 31.2), (65.6, 22), (66.4, 8), (62.6, -2.4),
    (52.4, -6.6), (43.2, -13.4), (38.6, -23.4), (28.6, -29.2), (16.4, -27.4), (8.4, -21.6),
    (0, -20.4),
]

BODY = ccw(resample_closed(catmull_rom_closed(mirror_half(BODY_RIGHT), 32), 2.3))
FACE = ccw(resample_closed(catmull_rom_closed(mirror_half(FACE_RIGHT), 32), 1.9))

STICK_POS = [(-24.0, -10.0), (24.0, -10.0)]
DPAD_POS = (-46.0, 10.0)
BTN_C = (46.0, 10.0)
BTN_POS = [(BTN_C[0], BTN_C[1] + 10.4), (BTN_C[0] + 10.4, BTN_C[1]),
           (BTN_C[0], BTN_C[1] - 10.4), (BTN_C[0] - 10.4, BTN_C[1])]
HOME_POS = (0.0, 2.0)
MENU_POS = [(-13.5, 21.5), (13.5, 21.5)]

R_TOP = 6.4     # horizontal radius of the top rim roll
R_BOT = 8.5     # bottom rim roll
GAP = 0.45      # half height of the parting-line seam
P_SUPER = 2.9   # superellipse exponent of the rim


def grip_t(x, y):
    return smoothstep(-4.0, -64.0, y)


def mid_fn(x, y):
    return -17.0 * grip_t(x, y) ** 1.3


def at_fn(x, y):
    t = grip_t(x, y)
    return 8.6 + 1.3 * (1 - (np.asarray(x) / 80.0) ** 2) + 1.2 * smoothstep(26, 46, y) - 0.6 * t


def ab_fn(x, y):
    t = grip_t(x, y)
    # trigger housings: the belly grows under the shoulders so the triggers tuck into the body
    housing = smoothstep(22, 44, y) * smoothstep(22, 52, np.abs(np.asarray(x, float)))
    return 11.0 + 9.0 * t + 1.2 * (1 - (np.asarray(x) / 80.0) ** 2) + 4.5 * housing


def top_cap(x, y):
    return mid_fn(x, y) + at_fn(x, y)


def fp_cap(x, y):
    return top_cap(x, y) + 0.35


def bot_cap(x, y):
    return mid_fn(x, y) - ab_fn(x, y)


def rim_prof(R, sign, n=5, lip=1.8):
    """Big rounded rim of a shell half. sign=+1 top half, -1 bottom half."""
    prof = [(lip, lambda x, y, c: mid_fn(x, y) + sign * GAP),
            (0.0, lambda x, y, c: mid_fn(x, y) + sign * GAP)]
    for th in np.linspace(0, math.pi / 2, n + 1)[1:-1]:
        d = R * (1 - math.cos(th) ** (2 / P_SUPER))
        s = math.sin(th) ** (2 / P_SUPER)
        prof.append((d, lambda x, y, c, s=s: mid_fn(x, y) + sign * GAP + (c - mid_fn(x, y) - sign * GAP) * s))
    prof.append((R, None))
    return prof


def surface_frame(x, y, fn=fp_cap):
    e = 0.05
    z = float(fn(x, y))
    dzdx = (float(fn(x + e, y)) - float(fn(x - e, y))) / (2 * e)
    dzdy = (float(fn(x, y + e)) - float(fn(x, y - e))) / (2 * e)
    n = Vector((-dzdx, -dzdy, 1.0)).normalized()
    R = Vector((0, 0, 1)).rotation_difference(n).to_matrix()
    return np.array(R), np.array([x, y, z])


# --------------------------------------------------------------------------------------
# build parts
# --------------------------------------------------------------------------------------
# --- shells -------------------------------------------------------------------------
fp_hole = offset_loop(FACE, 0.55)
V, F = build_slab([
    {"loop": BODY, "outer": True, "prof": rim_prof(R_TOP, +1)},
    {"loop": fp_hole, "outer": False, "prof": roll_prof(0.9, 2.2, n=2)},
], top_cap, 4.0)
make_obj("Shell_Top", V, F, MAT["shell"], facing=(0, 0, 1), normals=SLAB_N)

V, F = build_slab([{"loop": BODY, "outer": True, "prof": rim_prof(R_BOT, -1)}], bot_cap, 4.6, cap_sign=-1.0)
make_obj("Shell_Bottom", V, F, MAT["shell_bottom"], facing=(0, 0, -1), normals=SLAB_N)

# --- parting-line midframe (thin wine band visible inside the seam) -----------------
band_loop = offset_loop(BODY, -0.7)
n = len(band_loop)
mz = mid_fn(band_loop[:, 0], band_loop[:, 1])
V = np.vstack([np.column_stack([band_loop, mz - 1.6]), np.column_stack([band_loop, mz + 1.6])])
F = [[i, (i + 1) % n, n + (i + 1) % n, n + i] for i in range(n)]
make_obj("Midframe", V, F, MAT["wine_bright"], facing=None, recalc=False)

# --- faceplate ------------------------------------------------------------------------
cross = rounded_poly([(12.3, -4.3), (12.3, 4.3), (4.3, 4.3), (4.3, 12.3), (-4.3, 12.3), (-4.3, 4.3),
                      (-12.3, 4.3), (-12.3, -4.3), (-4.3, -4.3), (-4.3, -12.3), (4.3, -12.3), (4.3, -4.3)],
                     [1.9, 1.9, 1.3, 1.9, 1.9, 1.3, 1.9, 1.9, 1.3, 1.9, 1.9, 1.3], seg=6)
cross = resample_closed(cross, 0.9)
menu_shape = resample_closed(rounded_poly([(-3.4, -1.45), (3.4, -1.45), (3.4, 1.45), (-3.4, 1.45)], 1.4, 8), 0.7)

holes = []
for (x, y) in STICK_POS:
    holes.append(circle(x, y, 14.75, 1.7))
for (x, y) in BTN_POS:
    holes.append(circle(x, y, 5.3, 1.1))
holes.append(ccw(offset_loop(cross, 0.6) + np.array(DPAD_POS)))
holes.append(circle(HOME_POS[0], HOME_POS[1], 6.4, 0.9))
for (x, y) in MENU_POS:
    holes.append(ccw(offset_loop(menu_shape, 0.5) + np.array([x, y])))
bounds = [{"loop": FACE, "outer": True, "prof": roll_prof(0.9, 2.0)}]
bounds += [{"loop": h, "outer": False, "prof": roll_prof(0.6, 2.4, n=2)} for h in holes]
V, F = build_slab(bounds, fp_cap, 3.6)
make_obj("Faceplate", V, F, MAT["faceplate"], facing=(0, 0, 1), normals=SLAB_N)

# --- thumbsticks -----------------------------------------------------------------------
RIBS = 24


def knurl(th, j, r, z):
    if j in KNURL_ROWS:
        w = 0.5 - 0.5 * math.cos(RIBS * th)
        return r - 0.42 * w ** 1.6, z
    return r, z


CAP_PROFILE = [  # (r, z, knurled)
    (0.0, 12.85, 0), (2.4, 12.92, 0),
    (3.3, 12.99, 0), (3.55, 12.84, 0), (3.8, 13.03, 0),       # concentric grip groove
    (5.4, 13.25, 0), (5.65, 13.1, 0), (5.9, 13.33, 0),         # concentric grip groove
    (7.0, 13.6, 0), (7.9, 13.85, 0), (8.8, 14.05, 0),
    (9.5, 13.95, 0), (9.95, 13.55, 0), (10.15, 12.95, 0),      # rolled rim
    (10.2, 12.4, 1), (10.2, 11.75, 1), (10.15, 11.1, 1), (10.0, 10.5, 1),  # knurled band
    (9.4, 9.95, 0), (8.0, 9.55, 0), (5.6, 9.35, 0), (3.4, 9.3, 0),
]
KNURL_ROWS = {i for i, p in enumerate(CAP_PROFILE) if p[2]}
CAP_PROFILE = [(r, z - 1.5) for r, z, _ in CAP_PROFILE]  # sit the cap lower on the shaft
SKIRT_PROFILE = [(3.35, 3.2), (3.6, 2.55)]
for r in np.linspace(4.2, 11.4, 8):
    SKIRT_PROFILE.append((float(r), float(-12.0 + math.sqrt(14.8 ** 2 - r * r))))
SKIRT_PROFILE += [(11.55, -3.4), (11.5, -4.6)]
BEZEL_PROFILE = [(12.15, -3.2), (12.15, -0.9), (12.3, -0.35), (12.7, 0.1), (13.3, 0.32), (13.9, 0.22),
                 (14.3, -0.15), (14.42, -0.8), (14.42, -3.0)]
SHAFT_PROFILE = [(3.15, 7.9), (3.15, 4.0), (3.15, 2.2)]

for side, (x, y) in zip("LR", STICK_POS):
    M3, t = surface_frame(x, y)
    V, F = lathe(BEZEL_PROFILE, 64)
    make_obj(f"Stick_{side}_Bezel", *transform(V, F, M3, t), MAT["metal"], origin=t, recalc=False)
    V, F = lathe(SKIRT_PROFILE, 56)
    make_obj(f"Stick_{side}_Base", *transform(V, F, M3, t), MAT["rubber"], origin=t, recalc=False)
    V, F = lathe(SHAFT_PROFILE, 32)
    make_obj(f"Stick_{side}_Shaft", *transform(V, F, M3, t), MAT["metal_dark"], origin=t, recalc=False)
    V, F = lathe(CAP_PROFILE, RIBS * 3, knurl)
    make_obj(f"Stick_{side}_Cap", *transform(V, F, M3, t), MAT["rubber"], origin=t, recalc=False,
             sharp_deg=60)

# --- face buttons ------------------------------------------------------------------------
BTN_PROFILE = [(0.0, 2.55), (1.6, 2.52), (2.9, 2.42), (3.8, 2.24), (4.35, 1.98), (4.72, 1.55),
               (4.85, 1.0), (4.85, -2.6)]
for i, (x, y) in enumerate(BTN_POS):
    M3, t = surface_frame(x, y)
    V, F = lathe(BTN_PROFILE, 48)
    make_obj(f"Button_{'NESW'[i]}", *transform(V, F, M3, t), MAT["button"], origin=t, recalc=False)
    # printed legend (abstract marks, no console-brand symbols): bar / dot / ring / two dots
    zt, zb = 2.585, 2.47
    parts = []
    if i == 0:
        parts.append(box(2.6, 0.55, zt - zb) + ((0, 0, (zt + zb) / 2),))
    elif i == 1:
        parts.append(lathe([(0.0, zt), (0.62, zt), (0.62, zb)], 20) + ((0, 0, 0),))
    elif i == 2:
        parts.append(lathe([(0.78, zb), (0.78, zt), (1.22, zt), (1.22, zb)], 28) + ((0, 0, 0),))
    else:
        for dx in (-0.75, 0.75):
            parts.append(lathe([(0.0, zt), (0.42, zt), (0.42, zb)], 16) + ((dx, 0, 0),))
    LV, LF = [], []
    for pv, pf, off in parts:
        LF += [[k + sum(len(q) for q in LV) for k in f] for f in pf]
        LV.append(np.asarray(pv) + np.asarray(off))
    make_obj(f"Legend_{'NESW'[i]}", *transform(np.vstack(LV), LF, M3, t), MAT["legend"], origin=t,
             recalc=False, sharp_deg=30)

# --- D-pad -------------------------------------------------------------------------------


def dpad_cap(x, y):
    r = np.sqrt(x * x + y * y)
    return 2.05 + 0.55 * (r / 12.3) ** 2 - 0.35 * np.exp(-(r / 2.6) ** 2)


V, F = build_slab([{"loop": cross, "outer": True,
                    "prof": [(0.0, lambda x, y, c: -2.6)] + roll_prof(1.0, 0.0, n=4)[1:]}],
                  dpad_cap, 1.6)
M3, t = surface_frame(*DPAD_POS)
make_obj("DPad", *transform(V, F, M3, t), MAT["dpad"], origin=t, facing=tuple(M3[:, 2]),
         normals=SLAB_N @ M3.T)

# --- home button + green glyph light ------------------------------------------------------
M3, t = surface_frame(*HOME_POS)
V, F = lathe([(0.0, 1.55), (2.0, 1.52), (3.4, 1.4), (4.2, 1.18), (4.6, 0.8), (4.7, 0.3), (4.7, -2.4)], 48)
make_obj("Home_Button", *transform(V, F, M3, t), MAT["button"], origin=t, recalc=False)
V, F = lathe([(4.95, -1.6), (4.95, 0.05), (5.15, 0.22), (5.55, 0.26), (5.95, 0.22), (6.1, 0.05), (6.1, -1.6)], 48)
make_obj("Glyph_Light", *transform(V, F, M3, t), MAT["glow"], origin=t, recalc=False)

# --- menu buttons --------------------------------------------------------------------------
for side, (x, y) in zip("LR", MENU_POS):
    V, F = build_slab([{"loop": menu_shape, "outer": True,
                        "prof": [(0.0, lambda x, y, c: -2.2)] + roll_prof(0.7, 0.0, n=3)[1:]}],
                      lambda x, y: np.full_like(np.asarray(x, float), 1.1), 1.0)
    M3, t = surface_frame(x, y)
    make_obj(f"Menu_{side}", *transform(V, F, M3, t), MAT["button"], origin=t, facing=tuple(M3[:, 2]),
             normals=SLAB_N @ M3.T)

# --- shoulder bumpers ------------------------------------------------------------------------
n_body = outward_normals(BODY)
for side, sgn in (("L", -1), ("R", 1)):
    sel = np.where((BODY[:, 0] * sgn > 27) & (BODY[:, 1] > 27))[0]
    # contiguous run (loop indices may wrap)
    order = np.argsort((sel - sel[0]) % len(BODY))
    sel = sel[order]
    gaps = np.where(np.diff(sel) % len(BODY) != 1)[0]
    if len(gaps):
        sel = np.roll(sel, -(gaps[0] + 1))
    P, N = BODY[sel], n_body[sel]
    inner = P - N * 2.2
    outer = P + N * 4.6
    poly = np.vstack([outer, inner[::-1]])
    for _ in range(3):  # chaikin corner rounding
        q = np.roll(poly, -1, 0)
        poly = np.vstack([0.75 * poly + 0.25 * q, 0.25 * poly + 0.75 * q]).reshape(2, -1, 2).transpose(1, 0, 2).reshape(-1, 2)
    poly = ccw(resample_closed(smooth_loop(poly, 2), 1.5))

    def bumper_cap(x, y):
        return 8.0 + 0.0 * np.asarray(x)

    V, F = build_slab([{"loop": poly, "outer": True, "prof": wall_prof(1.3, 0.8, 2.0, n=3)}],
                      bumper_cap, 2.6, bottom_cap_fn=lambda x, y: np.full_like(np.asarray(x, float), 1.3))
    make_obj(f"Bumper_{side}", V, F, MAT["wine"], normals=SLAB_N)

# --- triggers (side profile in (y, z), extruded along x) --------------------------------------
TRIG = [(40.0, -0.8), (46.5, -0.6), (50.4, -1.8), (52.6, -4.4), (53.3, -7.6), (52.5, -10.7),
        (50.6, -12.8), (48.7, -12.1), (48.4, -9.2), (47.3, -6.6), (44.8, -4.9), (40.0, -4.3)]
trig_loop = ccw(resample_closed(smooth_loop(catmull_rom_closed(TRIG, 12), 1), 1.0))
for side, sgn in (("L", -1), ("R", 1)):
    V, F = build_slab([{"loop": trig_loop, "outer": True, "prof": wall_prof(-10.0, 2.0, 2.0, n=3)}],
                      lambda x, y: np.full_like(np.asarray(x, float), 10.0), 2.2,
                      bottom_cap_fn=lambda x, y: np.full_like(np.asarray(x, float), -10.0))
    M3 = np.array([[0, 0, 1], [1, 0, 0], [0, 1, 0]], float)
    taper = 1.0 - 0.22 * np.clip(-V[:, 1] / 14.0, 0, 1)  # narrower toward the finger tip
    V[:, 2] *= taper
    V, F = transform(V, F, M3, (sgn * 50.0, 0, 0))
    make_obj(f"Trigger_{side}", V, F, MAT["trigger"])

# --- USB-C port (front face on the top edge) ----------------------------------------------------
y_rim = float(BODY[np.argmin(np.abs(BODY[:, 0]) + (BODY[:, 1] < 0) * 1e3), 1])
port_out = resample_closed(rounded_poly([(-4.9, -1.95), (4.9, -1.95), (4.9, 1.95), (-4.9, 1.95)], 1.9, 8), 0.5)
port_in = resample_closed(rounded_poly([(-4.15, -1.3), (4.15, -1.3), (4.15, 1.3), (-4.15, 1.3)], 1.25, 8), 0.5)
V, F = build_slab([
    {"loop": port_out, "outer": True, "prof": [(0.0, lambda x, y, c: -4.0)] + roll_prof(0.35, 0.0, n=3)[1:]},
    {"loop": port_in, "outer": False, "prof": roll_prof(0.25, 3.0, n=2)},
], lambda x, y: np.full_like(np.asarray(x, float), 0.55), 0.6)
PORT_M = np.array([[1, 0, 0], [0, 0, 1], [0, 1, 0]], float)
V, F = transform(V, F, PORT_M, (0, y_rim, 0))
make_obj("USB_C_Port", V, F, MAT["metal"], facing=(0, 1, 0))
V, F = box(8.6, 0.6, 2.8)
pin_v = []
V, F = transform(V, F, np.eye(3), (0, y_rim - 3.0, 0))
V2, F2 = box(6.2, 3.0, 0.7)
V2, F2 = transform(V2, F2, np.eye(3), (0, y_rim - 1.6, 0))
make_obj("USB_C_Inner", np.vstack([V, V2]), F + [[i + 8 for i in f] for f in F2], MAT["port_inner"],
         sharp_deg=30)

# --- internals revealed by the explode: PCB, chips, battery, rumble motors -------------------------
PCB_RIGHT = [(0, 35.5), (40, 36.5), (61, 30), (67.5, 14), (65.5, -6), (55, -17.5), (40, -21.5),
             (29, -23.5), (14, -25), (0, -25.5)]
pcb = ccw(resample_closed(catmull_rom_closed(mirror_half(PCB_RIGHT), 10), 3.5))
V, F = build_slab([{"loop": pcb, "outer": True, "prof": wall_prof(-3.3, 0.3, 0.3, n=1)}],
                  lambda x, y: np.full_like(np.asarray(x, float), -1.7), 9.0,
                  bottom_cap_fn=lambda x, y: np.full_like(np.asarray(x, float), -3.3))
make_obj("PCB", V, F, MAT["pcb"], sharp_deg=30)
chipsV, chipsF = [], []
for (cx, cy, sx, sy, sz) in [(0, 14, 13, 13, 1.4), (-20, 22, 8, 6, 1.0), (20, 22, 8, 6, 1.0),
                             (36, -8, 6, 9, 1.0), (-36, -8, 6, 9, 1.0), (0, -12, 10, 5, 1.2)]:
    bv, bf = box(sx, sy, sz)
    bv, bf = transform(bv, bf, np.eye(3), (cx, cy, -1.7 + sz / 2))
    chipsF += [[i + len(chipsV) * 0 + sum(len(v) for v in chipsV) for i in f] for f in bf]
    chipsV.append(bv)
make_obj("Chips", np.vstack(chipsV), chipsF, MAT["chip"], sharp_deg=30)
V, F = build_slab([{"loop": resample_closed(rounded_poly([(-21, -8), (21, -8), (21, 8), (-21, 8)], 3, 6), 2.5),
                    "outer": True, "prof": wall_prof(-10.2, 1.0, 1.0, n=2)}],
                  lambda x, y: np.full_like(np.asarray(x, float), -3.6), 8.0,
                  bottom_cap_fn=lambda x, y: np.full_like(np.asarray(x, float), -10.2))
V[:, 1] += 2.0
make_obj("Battery", V, F, MAT["metal_dark"])
for side, sgn in (("L", -1), ("R", 1)):
    mv, mf = lathe([(0.0, 6.0), (4.4, 6.0), (5.0, 5.4), (5.0, -5.4), (4.4, -6.0), (0.0, -6.0)], 32)
    mv, mf = transform(mv, mf, np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]], float), (sgn * 49.0, -38.0, -13.0))
    make_obj(f"Motor_{side}", mv, mf, MAT["metal"], recalc=False, sharp_deg=40)

# --------------------------------------------------------------------------------------
# centre the assembly: x/y centred on the bbox, bottom at z = 0
# --------------------------------------------------------------------------------------
bpy.context.view_layer.update()
allv = []
for ob in PARTS.values():
    allv.append(np.array([ob.matrix_world @ v.co for v in ob.data.vertices]))
allv = np.vstack(allv)
lo, hi = allv.min(0), allv.max(0)
shift = Vector((-(lo[0] + hi[0]) / 2, -(lo[1] + hi[1]) / 2, -lo[2]))
for ob in PARTS.values():
    ob.location += shift
DIMS = hi - lo
print("ASSEMBLY DIMS (m):", DIMS)

# --------------------------------------------------------------------------------------
# Explode animation (one action, one slot per object)
# --------------------------------------------------------------------------------------
scene.render.fps = 30
scene.frame_start = 0
scene.frame_end = 84

EXPLODE = {  # name: (offset mm (x, y, z), stagger frames) -- outer parts leave first, return last
    "Shell_Bottom": ((0, 0, -28), 6), "Battery": ((0, 0, -17), 5), "Motor_L": ((-7, -4, -14), 5),
    "Motor_R": ((7, -4, -14), 5), "PCB": ((0, 0, 4), 6), "Chips": ((0, 0, 8), 6), "Midframe": ((0, 0, 0), 0),
    "Shell_Top": ((0, 0, 18), 5), "Faceplate": ((0, 0, 30), 4),
    "Stick_L_Bezel": ((0, 0, 38), 3), "Stick_R_Bezel": ((0, 0, 38), 3),
    "Stick_L_Base": ((0, 0, 44), 2), "Stick_R_Base": ((0, 0, 44), 2),
    "Stick_L_Shaft": ((0, 0, 51), 1), "Stick_R_Shaft": ((0, 0, 51), 1),
    "Stick_L_Cap": ((0, 0, 62), 0), "Stick_R_Cap": ((0, 0, 62), 0),
    "Button_N": ((0, 0, 44), 1), "Button_E": ((0, 0, 44), 1), "Button_S": ((0, 0, 44), 2),
    "Button_W": ((0, 0, 44), 2), "Legend_N": ((0, 0, 44), 1), "Legend_E": ((0, 0, 44), 1),
    "Legend_S": ((0, 0, 44), 2), "Legend_W": ((0, 0, 44), 2), "DPad": ((0, 0, 44), 1),
    "Home_Button": ((0, 0, 42), 2), "Glyph_Light": ((0, 0, 49), 1), "Menu_L": ((0, 0, 40), 3),
    "Menu_R": ((0, 0, 40), 3),
    "Bumper_L": ((-5, 16, 6), 2), "Bumper_R": ((5, 16, 6), 2),
    "Trigger_L": ((-5, 26, -4), 3), "Trigger_R": ((5, 26, -4), 3),
    "USB_C_Port": ((0, 20, 0), 4), "USB_C_Inner": ((0, 14, 0), 4),
}
SCALE_EXPLODE = 0.8
action = bpy.data.actions.new("Explode")
for name, ob in PARTS.items():
    off, s = EXPLODE.get(name, ((0, 0, 0), 0))
    ad = ob.animation_data_create()
    ad.action = action
    if getattr(ad, "action_slot", None) is None and hasattr(action, "slots"):
        slot = action.slots.new(id_type="OBJECT", name=name)
        ad.action_slot = slot
    base = ob.location.copy()
    out = base + Vector(off) * MM * SCALE_EXPLODE
    # frame 0 = t 0.0 s; 84 frames @30 fps = 2.8 s; first and last keys are identical for a clean loop
    keys = [(0, base), (s, base), (22 + s, out), (43 + (8 - s), out), (65 + (8 - s), base), (84, base)]
    for f, loc in keys:
        ob.location = loc
        ob.keyframe_insert("location", frame=f)
    ob.location = base
scene.frame_set(0)

# --------------------------------------------------------------------------------------
# render setup (studio lighting for the poster; not exported)
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
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass

world = bpy.data.worlds.new("Studio")
scene.world = world
world.use_nodes = True
wn = world.node_tree.nodes
bg = wn.get("Background")
# soft vertical gradient environment for subtle reflections
tex = wn.new("ShaderNodeTexCoord")
sep = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
world.node_tree.links.new(tex.outputs["Generated"], sep.inputs[0])
world.node_tree.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
world.node_tree.links.new(ramp.outputs["Color"], bg.inputs["Color"])
ramp.color_ramp.elements[0].position = 0.45
ramp.color_ramp.elements[0].color = (0.004, 0.004, 0.005, 1)
ramp.color_ramp.elements[1].position = 0.9
ramp.color_ramp.elements[1].color = (0.06, 0.06, 0.065, 1)
bg.inputs["Strength"].default_value = 1.0

CENTER = Vector((0, 0, DIMS[2] * 0.45))


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
    return ob


area_light("Key", (-0.22, -0.26, 0.34), 3.5, 0.32)
area_light("Fill", (0.30, -0.18, 0.12), 1.0, 0.4, color=(0.92, 0.95, 1.0))
area_light("Top_Strip", (0.02, 0.05, 0.42), 3.0, 0.5, size_y=0.08)
area_light("Rim_R", (0.26, 0.28, 0.10), 6.0, 0.12, size_y=0.4, color=(1.0, 0.93, 0.92))
area_light("Rim_L", (-0.30, 0.22, 0.06), 4.0, 0.12, size_y=0.4, color=(0.9, 0.95, 1.0))
area_light("Kick_Front", (0.0, -0.36, -0.01), 1.6, 0.5, size_y=0.06)
area_light("Rim_Low_L", (-0.34, -0.06, -0.01), 2.5, 0.06, size_y=0.3, color=(0.92, 0.95, 1.0))

cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 85
cam = bpy.data.objects.new("Camera", cam_data)
COL.objects.link(cam)
scene.camera = cam


def aim(loc, target=CENTER, lens=85):
    cam.location = Vector(loc)
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_data.lens = lens


def render(path, res, samples, fmt="PNG"):
    scene.render.resolution_x = res
    scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.cycles.samples = samples
    scene.render.image_settings.file_format = fmt
    scene.render.image_settings.color_mode = "RGBA"
    if fmt == "WEBP":
        scene.render.image_settings.quality = 92
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def composite_dark(path):
    """QA helper: alpha-over the render onto the site's #0a0a0a background."""
    img = bpy.data.images.load(path)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(-1, 4)
    bgc = np.full(3, 10 / 255, np.float32)  # byte PNG pixels are sRGB, straight alpha
    a = px[:, 3:4]
    px[:, :3] = px[:, :3] * a + bgc * (1 - a)
    px[:, 3] = 1.0
    img.pixels[:] = px.ravel()
    img.filepath_raw = path.replace(".png", "_dark.png")
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


HERO = ((-0.165, -0.355, 0.28), Vector((0.0, 0.002, DIMS[2] * 0.30)), 72)

# --------------------------------------------------------------------------------------
# save, export, render
# --------------------------------------------------------------------------------------
os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0  # no .blend1 backups
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    export_animations=True,
    export_animation_mode="ACTIONS",
    export_merge_animation="ACTION",
    export_force_sampling=True,
    export_frame_range=False,
    export_draco_mesh_compression_enable=False,
    export_materials="EXPORT",
)
print("GLB SIZE:", os.path.getsize(GLB_PATH))

if "nopost" not in ARGS:
    aim(*HERO)
    scene.frame_set(0)
    render(POSTER_PATH, 1200, 160 if "preview" not in ARGS else 64, "WEBP")

if "preview" in ARGS:
    os.makedirs(RENDERS, exist_ok=True)
    c = Vector((0, 0.004, DIMS[2] * 0.4))
    views = {
        "front": ((0.0, -0.42, 0.13), c, 70),
        "top34": ((0.20, -0.25, 0.33), c, 70),
        "back": ((0.12, 0.40, 0.14), c, 70),
        "side": ((0.42, 0.0, 0.06), c, 70),
        "top": ((0.0, 0.0, 0.5), c, 60),
    }
    only = [a for a in ARGS if a.startswith("views=")]
    names = only[0][6:].split(",") if only else list(views)
    for nme in names:
        aim(*views[nme])
        render(os.path.join(RENDERS, f"{nme}.png"), 720, 48)
        composite_dark(os.path.join(RENDERS, f"{nme}.png"))
    if "ibl" in ARGS:  # rough stand-in for model-viewer's neutral environment: no lights, bright soft world
        for ob in scene.objects:
            if ob.type == "LIGHT":
                ob.hide_render = True
        ramp.color_ramp.elements[0].color = (0.18, 0.18, 0.18, 1)
        ramp.color_ramp.elements[1].color = (0.9, 0.9, 0.9, 1)
        ramp.color_ramp.elements[0].position = 0.3
        aim(*views["top34"])
        render(os.path.join(RENDERS, "ibl.png"), 720, 48)
        composite_dark(os.path.join(RENDERS, "ibl.png"))
        for ob in scene.objects:
            if ob.type == "LIGHT":
                ob.hide_render = False
    if "explode" in ARGS:
        aim((0.32, -0.40, 0.15), Vector((0, 0.01, 0.04)), 50)
        scene.frame_set(32)
        render(os.path.join(RENDERS, "exploded.png"), 720, 48)
        composite_dark(os.path.join(RENDERS, "exploded.png"))
        scene.frame_set(0)
print("DONE")
