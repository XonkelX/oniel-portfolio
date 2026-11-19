"""Procedural build of the portfolio robot mascot ("Pip").

Run headless from the repo root:
  blender -b --factory-startup -P 3d/robot/build.py              # build + save + export + poster
  blender -b --factory-startup -P 3d/robot/build.py -- previews   # + turntable preview sheet
  blender -b --factory-startup -P 3d/robot/build.py -- sheet      # + animation contact sheets
  blender -b --factory-startup -P 3d/robot/build.py -- noposter   # skip the poster render

Blender units: metres, Z up, robot faces -Y (glTF +Z after export).
"""
import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
RENDERS = os.path.join(HERE, "renders")
BLEND = os.path.join(HERE, "robot.blend")
GLB = os.path.join(REPO, "public", "models", "robot.glb")
POSTER = os.path.join(REPO, "public", "models", "robot.webp")
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
FPS = 30
TAU = math.tau

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
for coll in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.actions,
             bpy.data.armatures, bpy.data.cameras, bpy.data.lights):
    for block in list(coll):
        coll.remove(block)
scene = bpy.context.scene
scene.render.fps = FPS
COLL = scene.collection
bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"


# ---------------------------------------------------------------- materials
def lin(hexstr):
    hexstr = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(hexstr[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def make_mat(name, hexc, rough=0.4, metal=0.0, coat=0.0, coat_rough=0.08,
             emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*lin(hexc), 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = coat_rough
    if emit:
        b.inputs["Emission Color"].default_value = (*lin(emit), 1.0)
        b.inputs["Emission Strength"].default_value = strength
    m.diffuse_color = (*lin(hexc), 1.0)
    return m


M = {
    "shell": make_mat("Shell", "#fbfbf8", rough=0.32, coat=0.35),
    "grey": make_mat("ShellGrey", "#c4c7ca", rough=0.38, coat=0.2),
    "dark": make_mat("Dark", "#191919", rough=0.42, metal=0.35),
    "wine": make_mat("Wine", "#6b1424", rough=0.3, coat=0.5),
    "wine2": make_mat("WineBright", "#b3263e", rough=0.3, coat=0.5),
    "glass": make_mat("Visor", "#060608", rough=0.06, coat=1.0, coat_rough=0.03),
    "glow": make_mat("GlowGreen", "#123d28", rough=0.35, emit="#3dbe7e", strength=1.8),
    "glow_soft": make_mat("GlowGreenSoft", "#0f2e20", rough=0.4, emit="#3dbe7e", strength=1.1),
    "spark": make_mat("EyeSpark", "#ffffff", rough=0.4, emit="#e9fff3", strength=3.0),
    "cheek": make_mat("Cheek", "#b3263e", rough=0.4, emit="#b3263e", strength=1.2),
}

PARTS = []  # (object, bone group)


def finish(name, bm, mat, group, mods=(), sharp=35.0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    COLL.objects.link(ob)
    if isinstance(mat, (list, tuple)):
        for m_ in mat:
            me.materials.append(m_)
    else:
        me.materials.append(mat)
    for kind, opts in mods:
        md = ob.modifiers.new(kind.lower(), kind)
        for k, v in opts.items():
            setattr(md, k, v)
    ob["sharp"] = sharp
    PARTS.append((ob, group))
    return ob


def bevel(width, segs=2, angle=30.0):
    return ("BEVEL", {"width": width, "segments": segs, "limit_method": "ANGLE",
                      "angle_limit": math.radians(angle)})


def solidify(t, rim_only=True):
    return ("SOLIDIFY", {"thickness": t, "offset": -1.0, "use_rim": True, "use_rim_only": rim_only})


# ---------------------------------------------------------------- primitives
def recalc(bm):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])


def cylinder(r1, r2, depth, matrix, segs=32):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs,
                          radius1=r1, radius2=r2, depth=depth, matrix=matrix)
    return bm


def sphere(r, matrix, u=20, v=12):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, matrix=matrix)
    return bm


def capsule(r, z0, z1, matrix, u=20, v=12):
    """Capsule along local Z between z1 (top) and z0 (bottom), then transformed."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    mid = (z0 + z1) / 2.0
    half = abs(z1 - z0) / 2.0
    for vt in bm.verts:
        vt.co.z += (half if vt.co.z > 1e-6 else -half if vt.co.z < -1e-6 else 0.0) + mid
    bmesh.ops.transform(bm, matrix=matrix, verts=bm.verts)
    return bm


def torus(R, r, matrix, seg=48, ring=14):
    bm = bmesh.new()
    grid = []
    for i in range(seg):
        a = TAU * i / seg
        row = []
        for j in range(ring):
            b = TAU * j / ring
            p = Vector(((R + r * math.cos(b)) * math.cos(a),
                        (R + r * math.cos(b)) * math.sin(a), r * math.sin(b)))
            row.append(bm.verts.new(matrix @ p))
        grid.append(row)
    for i in range(seg):
        for j in range(ring):
            bm.faces.new((grid[i][j], grid[(i + 1) % seg][j],
                          grid[(i + 1) % seg][(j + 1) % ring], grid[i][(j + 1) % ring]))
    recalc(bm)
    return bm


def tube(pts, radius, nrm, closed=True, ring=10):
    bm = bmesh.new()
    rings = []
    N = len(pts)
    for i, p in enumerate(pts):
        if closed:
            t = pts[(i + 1) % N] - pts[i - 1]
        else:
            t = pts[min(i + 1, N - 1)] - pts[max(i - 1, 0)]
        t.normalize()
        b = t.cross(nrm).normalized()
        n2 = b.cross(t).normalized()
        rings.append([bm.verts.new(p + radius * (math.cos(TAU * k / ring) * n2 +
                                                   math.sin(TAU * k / ring) * b))
                      for k in range(ring)])
    last = N if closed else N - 1
    for i in range(last):
        r0, r1 = rings[i], rings[(i + 1) % N]
        for k in range(ring):
            bm.faces.new((r0[k], r1[k], r1[(k + 1) % ring], r0[(k + 1) % ring]))
    if not closed:
        bm.faces.new(rings[0])
        bm.faces.new(list(reversed(rings[-1])))
    recalc(bm)
    return bm


class SuperEllipsoid:
    """|x/a s|^n + |y/b s|^n + |z/c|^n = 1 with s = 1 - taper*z/c (z-dependent taper)."""

    def __init__(self, center, a, b, c, n, taper=0.0):
        self.o = Vector(center)
        self.a, self.b, self.c, self.n, self.taper = a, b, c, n, taper

    def f(self, p, off=0.0):
        a, b, c = self.a + off, self.b + off, self.c + off
        s = 1.0 - self.taper * p.z / c
        return (abs(p.x / (a * s)) ** self.n + abs(p.y / (b * s)) ** self.n +
                abs(p.z / c) ** self.n - 1.0)

    def ray(self, origin, d, off=0.0):
        """Local-space surface point along origin + r*d (origin inside)."""
        lo, hi = 0.0, 2.0
        for _ in range(48):
            mid = (lo + hi) / 2
            if self.f(origin + d * mid, off) > 0:
                hi = mid
            else:
                lo = mid
        return origin + d * lo

    def surface_y(self, x, z, off=0.0, side=-1):
        """World y of the front (side=-1) or back (side=+1) surface at world x,z."""
        a, b, c, n = self.a + off, self.b + off, self.c + off, self.n
        lx, lz = x - self.o.x, z - self.o.z
        s = 1.0 - self.taper * lz / c
        t = max(1.0 - abs(lx / (a * s)) ** n - abs(lz / c) ** n, 1e-9)
        return self.o.y + side * b * s * t ** (1.0 / n)

    def mesh(self, cuts=12):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=2.0)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
        for vt in bm.verts:
            d = vt.co.normalized()
            vt.co = self.o + self.ray(Vector(), d)
        recalc(bm)
        return bm

    def section(self, z, count=96):
        """Closed horizontal cross-section loop at world z."""
        lz = z - self.o.z
        return [self.o + self.ray(Vector((0, 0, lz)),
                                  Vector((math.cos(TAU * i / count), math.sin(TAU * i / count), 0)))
                for i in range(count)]

    def arc_xz(self, y, t0, t1, count=64):
        """Arc in the plane local y=const, angle measured from +Z towards +X."""
        ly = y - self.o.y
        pts = []
        for i in range(count + 1):
            t = math.radians(t0 + (t1 - t0) * i / count)
            pts.append(self.o + self.ray(Vector((0, ly, 0)),
                                         Vector((math.sin(t), 0, math.cos(t)))))
        return pts


def decal(se, cx, cz, hw, hh, off, nexp=4.0, res=(24, 16), side=-1):
    """Rounded-rect patch projected along Y onto a superellipsoid (open, normals outward)."""
    bm = bmesh.new()
    nx, nz = res
    grid = []
    for i in range(nx + 1):
        col = []
        for j in range(nz + 1):
            s = -1 + 2 * i / nx
            t = -1 + 2 * j / nz
            r = max(abs(s), abs(t))
            if r < 1e-9:
                px, pz = 0.0, 0.0
            else:
                k = r / (abs(s) ** nexp + abs(t) ** nexp) ** (1.0 / nexp)
                px, pz = s * k, t * k
            x = cx + hw * px
            z = cz + hh * pz
            col.append(bm.verts.new((x, se.surface_y(x, z, off, side), z)))
        grid.append(col)
    for i in range(nx):
        for j in range(nz):
            q = (grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1])
            bm.faces.new(q if side < 0 else tuple(reversed(q)))
    return bm


def T(v):
    return Matrix.Translation(Vector(v))


def Rx(d):
    return Matrix.Rotation(math.radians(d), 4, "X")


def Ry(d):
    return Matrix.Rotation(math.radians(d), 4, "Y")


def Rz(d):
    return Matrix.Rotation(math.radians(d), 4, "Z")


# ================================================================ MODEL
# ---- head
HEAD = SuperEllipsoid((0, 0, 0.78), 0.30, 0.265, 0.245, 2.6, taper=0.07)
finish("Head", HEAD.mesh(cuts=13), M["shell"], "head")

VIS_Z, VIS_HW, VIS_HH = 0.765, 0.205, 0.122
finish("Bezel", decal(HEAD, 0, VIS_Z, VIS_HW + 0.018, VIS_HH + 0.018, 0.004, 3.6, (22, 14)),
       M["grey"], "head", [solidify(0.02), bevel(0.0025, 1)])
finish("Visor", decal(HEAD, 0, VIS_Z, VIS_HW, VIS_HH, 0.010, 3.6, (22, 14)),
       M["glass"], "head", [solidify(0.02), bevel(0.003)])

# seam over the top of the head, from ear to ear
finish("HeadSeam", tube(HEAD.arc_xz(0.045, -92, 92, 48), 0.0045, Vector((0, 1, 0)), closed=False, ring=6),
       M["dark"], "head")
# ear pods (axis X)
for sgn in (-1, 1):
    rot = Ry(90 * sgn)
    finish(f"EarBase{sgn}", cylinder(0.082, 0.078, 0.05, T((sgn * 0.298, 0.012, 0.775)) @ rot, 40),
           M["dark"], "head", [bevel(0.006, 3)])
    finish(f"EarCap{sgn}", cylinder(0.064, 0.058, 0.026, T((sgn * 0.33, 0.012, 0.775)) @ rot, 40),
           M["wine"], "head", [bevel(0.006, 3)])
    finish(f"EarNub{sgn}", cylinder(0.024, 0.02, 0.016, T((sgn * 0.347, 0.012, 0.775)) @ rot, 24),
           M["grey"], "head", [bevel(0.004, 2)])

# antenna
HEAD_TOP = 0.78 + 0.245
finish("AntCollar", cylinder(0.04, 0.032, 0.035, T((0, 0.02, HEAD_TOP)), 32), M["dark"], "head",
       [bevel(0.006, 3)])
ANT_BASE = Vector((0, 0.02, HEAD_TOP + 0.015))
ant_m = T(ANT_BASE) @ Rx(10)
finish("AntStem", cylinder(0.011, 0.009, 0.12, ant_m @ T((0, 0, 0.06)), 12), M["dark"], "antenna",
       [bevel(0.002, 1)])
finish("AntRing", torus(0.016, 0.006, ant_m @ T((0, 0, 0.105)), 24, 8), M["wine2"], "antenna")
finish("AntBulb", sphere(0.03, ant_m @ T((0, 0, 0.14)), 20, 12), M["glow"], "antenna")
ANT_TIP = ant_m @ Vector((0, 0, 0.17))

# ---- eyes (on the visor)
EYE_Z = VIS_Z + 0.008
for sgn in (-1, 1):
    ex = sgn * 0.088
    finish(f"Eye{sgn}", decal(HEAD, ex, EYE_Z, 0.034, 0.052, 0.013, 2.3, (10, 14)),
           M["glow"], "eyes", [solidify(0.004)])
    finish(f"Spark{sgn}", decal(HEAD, ex + 0.012, EYE_Z + 0.024, 0.009, 0.009, 0.0155, 2.0, (6, 6)),
           M["spark"], "eyes", [solidify(0.002)])
    finish(f"Cheek{sgn}", decal(HEAD, sgn * 0.15, VIS_Z - 0.068, 0.026, 0.012, 0.0125, 2.0, (10, 6)),
           M["cheek"], "head", [solidify(0.002)])

# ---- neck + body
finish("Neck", cylinder(0.068, 0.068, 0.11, T((0, 0, 0.51)), 32), M["dark"], "body", [bevel(0.004, 2)])
finish("NeckRing", torus(0.07, 0.009, T((0, 0, 0.497)), 32, 8), M["grey"], "body")

BODY = SuperEllipsoid((0, 0, 0.325), 0.185, 0.165, 0.165, 2.5, taper=-0.12)
BELT_Z = 0.268
bm = BODY.mesh(cuts=11)
for f in bm.faces:
    f.material_index = 1 if f.calc_center_median().z < BELT_Z else 0
finish("Body", bm, [M["shell"], M["dark"]], "body")
finish("Belt", tube(BODY.section(BELT_Z, 64), 0.013, Vector((0, 0, 1)), closed=True, ring=8),
       M["wine"], "body")
# chest plate + light
finish("ChestPlate", decal(BODY, 0, 0.385, 0.072, 0.05, 0.003, 3.2, (18, 12)),
       M["wine"], "body", [solidify(0.012), bevel(0.0025)])
finish("ChestLight", decal(BODY, 0, 0.385, 0.02, 0.02, 0.009, 2.0, (8, 8)),
       M["glow"], "body", [solidify(0.004)])
for sgn in (-1, 1):
    finish(f"ChestDot{sgn}", decal(BODY, sgn * 0.046, 0.385, 0.007, 0.007, 0.007, 2.0, (6, 6)),
           M["grey"], "body", [solidify(0.003)])
# back panel
finish("BackPanel", decal(BODY, 0, 0.375, 0.09, 0.07, 0.003, 3.0, (18, 14), side=1),
       M["grey"], "body", [solidify(0.012), bevel(0.0025)])
for i, vz in enumerate((0.395, 0.375, 0.355)):
    finish(f"Vent{i}", decal(BODY, 0, vz, 0.055, 0.0045, 0.008, 2.0, (12, 3), side=1),
           M["dark"], "body", [solidify(0.004)])

# ---- thruster
finish("Nozzle", cylinder(0.088, 0.097, 0.08, T((0, 0, 0.136)), 40), M["dark"], "body", [bevel(0.006, 3)])
finish("NozzleLip", torus(0.09, 0.012, T((0, 0, 0.104)), 40, 8), M["grey"], "body")
finish("ThrustRing", torus(0.074, 0.014, T((0, 0, 0.098)), 40, 10), M["glow"], "body")
finish("ThrustCore", cylinder(0.064, 0.064, 0.01, T((0, 0, 0.097)), 32), M["glow_soft"], "body")
finish("HaloRing", torus(0.072, 0.0055, T((0, 0, 0.058)), 40, 6), M["glow_soft"], "body")

# ---- arms
ARM = {}
for sgn, side in ((-1, "R"), (1, "L")):
    shoulder = Vector((sgn * 0.205, 0.0, 0.41))
    Mu = T(shoulder) @ Ry(-sgn * 22) @ Rx(-8)
    LU, LF, LH = 0.10, 0.085, 0.105
    Mf = Mu @ T((0, 0, -LU)) @ Rx(-24)
    Mh = Mf @ T((0, 0, -LF)) @ Ry(sgn * 8)
    ARM[side] = (Mu, Mf, Mh, LU, LF, LH)
    finish(f"Shoulder{side}", sphere(0.038, Mu), M["dark"], f"upper_arm.{side}")
    finish(f"UpperArm{side}", capsule(0.034, -0.088, -0.012, Mu), M["shell"], f"upper_arm.{side}")
    finish(f"Elbow{side}", sphere(0.03, Mf, 20, 12), M["dark"], f"lower_arm.{side}")
    finish(f"Forearm{side}", capsule(0.04, -0.07, -0.012, Mf), M["shell"], f"lower_arm.{side}")
    finish(f"Cuff{side}", cylinder(0.043, 0.045, 0.022, Mf @ T((0, 0, -0.072)), 32),
           M["wine"], f"lower_arm.{side}", [bevel(0.005, 2)])
    finish(f"Wrist{side}", cylinder(0.024, 0.024, 0.024, Mh @ T((0, 0, -0.006)), 20),
           M["dark"], f"hand.{side}", [bevel(0.003, 1)])
    palm = SuperEllipsoid((0, 0, 0), 0.034, 0.052, 0.058, 2.4)
    pb = palm.mesh(cuts=5)
    bmesh.ops.transform(pb, matrix=Mh @ T((0, 0, -0.064)), verts=pb.verts)
    finish(f"Palm{side}", pb, M["shell"], f"hand.{side}")
    thumb_m = Mh @ T((-sgn * 0.006, -0.042, -0.036)) @ Ry(sgn * 12) @ Rx(-42)
    finish(f"Thumb{side}", capsule(0.019, -0.032, 0.0, thumb_m, 16, 10), M["shell"], f"hand.{side}")


# ================================================================ bake parts into one skinned mesh
def bake_parts():
    dg = bpy.context.evaluated_depsgraph_get()
    baked = []
    for ob, group in PARTS:
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        try:
            me.set_sharp_from_angle(angle=math.radians(ob["sharp"]))
        except Exception:
            for p in me.polygons:
                p.use_smooth = True
        if "tris" in ARGS:
            print("TRIS", ob.name, sum(len(p.vertices) - 2 for p in me.polygons))
        nob = bpy.data.objects.new(ob.name + "_b", me)
        COLL.objects.link(nob)
        vg = nob.vertex_groups.new(name=group)
        vg.add(list(range(len(me.vertices))), 1.0, "REPLACE")
        baked.append(nob)
    for ob, _ in PARTS:
        bpy.data.objects.remove(ob)
    bpy.ops.object.select_all(action="DESELECT")
    for nob in baked:
        nob.select_set(True)
    bpy.context.view_layer.objects.active = baked[0]
    bpy.ops.object.join()
    robot = bpy.context.view_layer.objects.active
    robot.name = "Robot"
    robot.data.name = "RobotMesh"
    return robot


robot = bake_parts()
minz = min(v.co.z for v in robot.data.vertices)
DZ = -minz + 0.005  # lowest point (halo ring) sits just above the ground plane
robot.data.transform(T((0, 0, DZ)))


# ================================================================ armature
def build_rig():
    arm = bpy.data.armatures.new("RobotRigData")
    rig = bpy.data.objects.new("RobotRig", arm)
    COLL.objects.link(rig)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.edit_bones
    up = Vector((0, 0, DZ))

    def bone(name, head, tail, parent=None):
        b = eb.new(name)
        b.head = Vector(head) + up
        b.tail = Vector(tail) + up
        b.roll = 0.0
        if parent:
            b.parent = eb[parent]
        return b

    bone("root", (0, 0, -DZ), (0, 0, -DZ + 0.1))
    bone("body", (0, 0, 0.18), (0, 0, 0.47), "root")
    bone("head", (0, 0, 0.52), (0, 0, 0.98), "body")
    bone("antenna", ANT_BASE, ANT_TIP, "head")
    bone("eyes", (0, -0.27, EYE_Z), (0, -0.27, EYE_Z + 0.06), "head")
    for side, (Mu, Mf, Mh, LU, LF, LH) in ARM.items():
        bone(f"upper_arm.{side}", Mu @ Vector(), Mu @ Vector((0, 0, -LU)), "body")
        bone(f"lower_arm.{side}", Mf @ Vector(), Mf @ Vector((0, 0, -LF)), f"upper_arm.{side}")
        bone(f"hand.{side}", Mh @ Vector(), Mh @ Vector((0, 0, -LH)), f"lower_arm.{side}")
    for b in eb:
        b.use_connect = False
        b.use_deform = b.name != "root"
    bpy.ops.object.mode_set(mode="OBJECT")
    for pb in rig.pose.bones:
        pb.rotation_mode = "QUATERNION"
    return rig


rig = build_rig()
robot.parent = rig
mod = robot.modifiers.new("Armature", "ARMATURE")
mod.object = rig


# ================================================================ animation
def q(axis, deg):
    return Quaternion(Vector(axis), math.radians(deg))


X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def smoother(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * x * (x * (6 * x - 15) + 10)


def keys(t, pts):
    """Piecewise smooth interpolation through (t, value) pairs."""
    if t <= pts[0][0]:
        return pts[0][1]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * smooth((t - t0) / (t1 - t0))
    return pts[-1][1]


def bump(t, c, w):
    """Smooth 0->1->0 bump centred at c with half-width w."""
    return smooth(1 - abs(t - c) / w) if abs(t - c) < w else 0.0


def apply_pose(pose):
    for pb in rig.pose.bones:
        B = pb.bone.matrix_local.to_quaternion()
        R, L, S = pose.get(pb.name, (None, None, None))
        R = R or Quaternion()
        L = L or Vector()
        pb.rotation_quaternion = B.inverted() @ R @ B
        pb.location = B.inverted() @ Vector(L)
        pb.scale = S or (1, 1, 1)


def idle(t):
    bob = 0.018 * math.sin(TAU * 2 * t)
    p = {}
    p["body"] = (q(Y, 1.8 * math.sin(TAU * t)) @ q(X, 1.5 * math.sin(TAU * 2 * t + 0.8)),
                 (0, 0, bob), None)
    p["head"] = (q(Z, 16 * math.sin(TAU * t)) @ q(X, 3.5 * math.sin(TAU * 2 * t + 1.1)) @
                 q(Y, 3 * math.sin(TAU * t + 0.6)), None, None)
    p["antenna"] = (q(X, -7 * math.sin(TAU * 2 * t - 0.4)) @ q(Y, -8 * math.sin(TAU * t - 0.9)), None, None)
    for sgn, side in ((-1, "R"), (1, "L")):
        ph = 0.0 if side == "R" else 0.35
        p[f"upper_arm.{side}"] = (q(X, 5 * math.sin(TAU * 2 * t - 0.7 - ph)) @
                                  q(Y, -sgn * 3 * math.sin(TAU * 2 * t - 0.4)), None, None)
        p[f"lower_arm.{side}"] = (q(X, -7 * math.sin(TAU * 2 * t - 1.3 - ph)), None, None)
        p[f"hand.{side}"] = (q(X, -6 * math.sin(TAU * 2 * t - 1.8 - ph)), None, None)
    blink = bump(t, 0.64, 0.045)
    p["eyes"] = (None, None, (1, 1 - 0.92 * blink, 1))
    return p


def wave(t):
    raise_ = keys(t, [(0, 0), (0.2, 1), (0.74, 1), (0.96, 0), (1, 0)])
    w = keys(t, [(0, 0), (0.2, 0), (0.28, 1), (0.66, 1), (0.74, 0), (1, 0)])
    osc = math.sin(TAU * 3 * (t - 0.2) / 0.54) * w
    bob = 0.014 * math.sin(TAU * 2 * t)
    p = {}
    p["body"] = (q(Y, 5 * raise_) @ q(Z, -8 * raise_), (0, 0, bob), None)
    p["head"] = (q(Y, 11 * raise_) @ q(Z, -6 * raise_) @ q(X, -5 * raise_ + 3 * osc), None, None)
    p["antenna"] = (q(Y, 9 * osc + 6 * raise_) @ q(X, -4 * math.sin(TAU * 2 * t)), None, None)
    # waving arm (robot's right, -X)
    p["upper_arm.R"] = (q(Y, 102 * raise_) @ q(X, 2 * raise_), None, None)
    p["lower_arm.R"] = (q(Y, (42 + 22 * osc) * raise_) @ q(X, 24 * raise_), None, None)
    p["hand.R"] = (q(Y, 12 * osc * raise_) @ q(Z, -85 * raise_), None, None)
    # relaxed other arm
    p["upper_arm.L"] = (q(Y, -6 * raise_) @ q(X, 4 * math.sin(TAU * 2 * t - 0.8)), None, None)
    p["lower_arm.L"] = (q(X, -14 * raise_), None, None)
    p["hand.L"] = (q(X, -6 * math.sin(TAU * 2 * t - 1.6)), None, None)
    p["eyes"] = (None, None, (1, 1 - 0.38 * raise_, 1))
    return p


def spin(t):
    z = keys(t, [(0, 0), (0.14, -0.04), (0.42, 0.11), (0.72, -0.025), (0.86, 0.008), (1, 0)])
    u = (t - 0.14) / (0.8 - 0.14)
    ang = 360 * smoother(u)
    vel = 0.0 if u <= 0 or u >= 1 else 30 * u * u * (1 - u) * (1 - u)  # d(smoother)/du, peak 1.875
    env = keys(t, [(0, 0), (0.14, -0.25), (0.3, 1), (0.7, 1), (0.92, 0), (1, 0)])
    squat = keys(t, [(0, 0), (0.14, 1), (0.3, 0), (0.7, 0), (0.8, 0.5), (0.9, 0), (1, 0)])
    p = {}
    p["body"] = (q(Z, ang) @ q(X, 6 * squat), (0, 0, z), None)
    p["head"] = (q(Z, -9 * vel) @ q(X, -13 * env + 5 * squat) @ q(Y, 6 * math.sin(TAU * t) * env),
                 None, None)
    p["antenna"] = (q(X, 14 * keys(t, [(0, 0), (0.14, -0.6), (0.36, 1), (0.6, -0.5), (0.8, 0.4),
                                         (0.92, -0.15), (1, 0)])) @ q(Y, 10 * vel), None, None)
    for sgn, side in ((-1, "R"), (1, "L")):
        p[f"upper_arm.{side}"] = (q(Y, -sgn * 68 * env) @ q(X, -8 * env), None, None)
        p[f"lower_arm.{side}"] = (q(Y, -sgn * 22 * env) @ q(X, 16 * env), None, None)
        p[f"hand.{side}"] = (q(Y, sgn * 10 * env), None, None)
    p["eyes"] = (None, None, (1, 1 - 0.45 * max(env, 0) - 0.5 * squat, 1))
    return p


ANIMS = [("Idle", idle, 90), ("Wave", wave, 75), ("Spin", spin, 60)]


def build_actions():
    ad = rig.animation_data_create()
    acts = {}
    for name, fn, n in ANIMS:
        act = bpy.data.actions.new(name)
        act.use_fake_user = True
        ad.action = act
        for f in range(n + 1):
            apply_pose(fn(f / n))
            for pb in rig.pose.bones:
                for path in ("rotation_quaternion", "location", "scale"):
                    pb.keyframe_insert(path, frame=f, group=pb.name)
        act.use_frame_range = True
        act.frame_start, act.frame_end = 0, n
        acts[name] = act
        ad.action = None
    for name, act in acts.items():
        tr = ad.nla_tracks.new()
        tr.name = name
        st = tr.strips.new(name, 0, act)
        if hasattr(st, "action_slot") and len(act.slots):
            st.action_slot = act.slots[0]
        tr.mute = True
    apply_pose({})
    return acts


ACTS = build_actions()


def use_action(name, frame):
    ad = rig.animation_data
    if name is None:
        ad.action = None
        apply_pose({})
    else:
        act = ACTS[name]
        ad.action = act
        if hasattr(ad, "action_slot") and len(act.slots):
            ad.action_slot = act.slots[0]
        scene.frame_set(frame)
    bpy.context.view_layer.update()


use_action(None, 0)
scene.frame_start, scene.frame_end = 0, 90
scene.frame_set(0)

os.makedirs(os.path.dirname(GLB), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)

# ================================================================ export
bpy.ops.object.select_all(action="DESELECT")
robot.select_set(True)
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(
    filepath=GLB, export_format="GLB", use_selection=True, export_apply=True,
    export_yup=True, export_animations=True, export_animation_mode="ACTIONS",
    export_skins=True, export_morph=False, export_lights=False, export_cameras=False,
    export_draco_mesh_compression_enable=False, export_texcoords=False,
    export_force_sampling=True, export_frame_range=False,
)
print("GLB", GLB, os.path.getsize(GLB))


# ================================================================ rendering
def setup_render(res, samples=64):
    sc = scene
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            continue
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    try:
        sc.eevee.taa_render_samples = samples
    except Exception:
        pass
    for attr, val in (("use_shadows", True), ("use_raytracing", True), ("shadow_ray_count", 2)):
        try:
            setattr(sc.eevee, attr, val)
        except Exception:
            pass
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"


def setup_lights():
    world = bpy.data.worlds.new("World")
    scene.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.42, 0.43, 0.45, 1)
    bg.inputs["Strength"].default_value = 0.55

    def area(name, loc, energy, size, color=(1, 1, 1), target=(0, 0, 0.6)):
        ld = bpy.data.lights.new(name, "AREA")
        ld.energy = energy
        ld.size = size
        ld.color = color
        lo = bpy.data.objects.new(name, ld)
        COLL.objects.link(lo)
        lo.location = loc
        lo.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        return lo

    area("Key", (-1.9, -2.3, 2.4), 420, 1.8, (1.0, 0.97, 0.93))
    area("Fill", (2.4, -1.8, 0.9), 140, 2.5, (0.92, 0.96, 1.0))
    area("RimR", (1.7, 2.0, 1.9), 320, 1.0, (0.85, 0.93, 1.0))
    area("RimL", (-1.9, 1.7, 1.2), 260, 1.0, (1.0, 0.86, 0.88))
    area("Under", (0.0, -1.2, -0.8), 25, 2.0, (0.9, 1.0, 0.95), target=(0, 0, 0.4))


def camera(loc, target, lens):
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    co = bpy.data.objects.new("Cam", cd)
    COLL.objects.link(co)
    co.location = loc
    co.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.camera = co
    return co


def render_to(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def make_sheet(paths, cols, out, bg=(0.039, 0.039, 0.039)):
    import numpy as np
    tiles = []
    for pth in paths:
        img = bpy.data.images.load(pth)
        w, h = img.size
        arr = np.empty(w * h * 4, dtype=np.float32)
        img.pixels.foreach_get(arr)
        arr = arr.reshape(h, w, 4)
        a = arr[..., 3:4]
        rgb = arr[..., :3] * a + np.array(bg, dtype=np.float32) * (1 - a)
        tiles.append(np.concatenate([rgb, np.ones_like(a)], axis=2))
        bpy.data.images.remove(img)
    h, w = tiles[0].shape[:2]
    rows = (len(tiles) + cols - 1) // cols
    sheet = np.zeros((rows * h, cols * w, 4), dtype=np.float32)
    sheet[..., :3] = bg
    sheet[..., 3] = 1
    for i, tile in enumerate(tiles):
        r, c = divmod(i, cols)
        y0 = (rows - 1 - r) * h
        sheet[y0:y0 + h, c * w:(c + 1) * w] = tile
    im = bpy.data.images.new("sheet", cols * w, rows * h, alpha=True)
    im.pixels.foreach_set(sheet.ravel())
    im.filepath_raw = out
    im.file_format = "PNG"
    im.save()
    bpy.data.images.remove(im)
    for pth in paths:
        os.remove(pth)


setup_lights()
TARGET = Vector((0, 0, 0.62 + DZ - 0.05))

if "previews" in ARGS:
    setup_render(600, 32)
    shots = []
    views = [("front", (0, -3.6, 0.75)), ("q34", (2.3, -2.7, 0.95)), ("side", (3.6, 0, 0.7)),
             ("back", (-1.6, 3.2, 1.2)), ("top", (-1.5, -2.2, 2.6)), ("low", (-2.0, -2.8, 0.15))]
    for name, loc in views:
        camera(loc, TARGET, 95)
        pth = os.path.join(RENDERS, f"_v_{name}.png")
        render_to(pth)
        shots.append(pth)
    make_sheet(shots, 3, os.path.join(RENDERS, "preview_views.png"))

if "sheet" in ARGS:
    setup_render(300, 16)
    camera((-1.6, -3.0, 0.95), TARGET + Vector((0, 0, 0.05)), 70)
    for name, _, n in ANIMS:
        shots = []
        frames = [round(n * i / 7) for i in range(8)]
        for f in frames:
            use_action(name, f)
            pth = os.path.join(RENDERS, f"_a_{name}_{f:03d}.png")
            render_to(pth)
            shots.append(pth)
        make_sheet(shots, 4, os.path.join(RENDERS, f"anim_{name}.png"))
    use_action(None, 0)

if "noposter" not in ARGS:
    setup_render(1200, 128)
    camera((-1.75, -3.05, 0.78), TARGET + Vector((0, 0, 0.03)), 90)
    use_action("Wave", 24)
    sc_img = scene.render.image_settings
    sc_img.file_format = "WEBP"
    sc_img.color_mode = "RGBA"
    sc_img.quality = 90
    render_to(POSTER)
    use_action(None, 0)
    print("POSTER", POSTER, os.path.getsize(POSTER))

print("DONE tris:", sum(len(p.vertices) - 2 for p in robot.data.polygons))
