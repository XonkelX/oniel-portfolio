"""Validate public/models/robot.glb (run: blender -b --factory-startup -P 3d/robot/validate.py)."""
import bpy
import json
import os
import struct

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
GLB = os.path.join(REPO, "public", "models", "robot.glb")
POSTER = os.path.join(REPO, "public", "models", "robot.webp")

# ---- raw glTF inspection
with open(GLB, "rb") as fh:
    data = fh.read()
magic, version, length = struct.unpack_from("<4sII", data, 0)
clen, ctype = struct.unpack_from("<I4s", data, 12)
gl = json.loads(data[20:20 + clen])
acc = gl["accessors"]
tris = 0
for mesh in gl["meshes"]:
    for prim in mesh["primitives"]:
        tris += (acc[prim["indices"]]["count"] if "indices" in prim
                 else acc[prim["attributes"]["POSITION"]]["count"]) // 3
pos_min = [1e9] * 3
pos_max = [-1e9] * 3
for mesh in gl["meshes"]:
    for prim in mesh["primitives"]:
        a = acc[prim["attributes"]["POSITION"]]
        pos_min = [min(x, y) for x, y in zip(pos_min, a["min"])]
        pos_max = [max(x, y) for x, y in zip(pos_max, a["max"])]
print("VALIDATE file_bytes", os.path.getsize(GLB), "glTF version", version)
print("VALIDATE triangles", tris)
print("VALIDATE bind-pose bounds min", [round(v, 3) for v in pos_min], "max", [round(v, 3) for v in pos_max])
print("VALIDATE skins", len(gl.get("skins", [])), "joints", len(gl["skins"][0]["joints"]) if gl.get("skins") else 0)
print("VALIDATE materials", [m["name"] for m in gl.get("materials", [])])
print("VALIDATE extensions", gl.get("extensionsUsed", []))
print("VALIDATE draco", "KHR_draco_mesh_compression" in gl.get("extensionsUsed", []))
for an in gl.get("animations", []):
    dur = max(acc[s["input"]]["max"][0] for s in an["samplers"])
    print(f"VALIDATE animation {an['name']!r} duration {dur:.3f}s channels {len(an['channels'])}")

# ---- re-import and check deformation
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mesh = bpy.data.objects["Robot"]
print("VALIDATE imported actions", [a.name for a in bpy.data.actions])
hand_vg = mesh.vertex_groups.get("hand.R")
idx = next(v.index for v in mesh.data.vertices if any(g.group == hand_vg.index and g.weight > 0.99 for g in v.groups))


def hand_pos(action_name, frame):
    act = next(a for a in bpy.data.actions if a.name.startswith(action_name))
    arm.animation_data.action = act
    if len(act.slots):
        arm.animation_data.action_slot = act.slots[0]
    bpy.context.scene.frame_set(frame)
    dg = bpy.context.evaluated_depsgraph_get()
    me = mesh.evaluated_get(dg).to_mesh()
    p = (mesh.matrix_world @ me.vertices[idx].co).copy()
    mesh.evaluated_get(dg).to_mesh_clear()
    return p


if arm.animation_data is None:
    arm.animation_data_create()
fps = bpy.context.scene.render.fps
p0 = hand_pos("Wave", 0)
p1 = hand_pos("Wave", int(1.0 * fps))
pend = hand_pos("Wave", int(2.5 * fps))
print("VALIDATE hand.R vertex z (Blender Z-up): wave start %.3f, mid %.3f, end %.3f" % (p0.z, p1.z, pend.z))
s0 = hand_pos("Spin", 0)
s1 = hand_pos("Spin", int(0.95 * fps))
print("VALIDATE hand.R vertex xy: spin start (%.3f, %.3f) mid (%.3f, %.3f)" % (s0.x, s0.y, s1.x, s1.y))

# ---- poster preview over the site background
if os.path.exists(POSTER):
    import numpy as np
    img = bpy.data.images.load(POSTER)
    w, h = img.size
    arr = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    arr = arr.reshape(h, w, 4)
    a = arr[..., 3:4]
    rgb = arr[..., :3] * a + 0.039 * (1 - a)
    out = np.concatenate([rgb, np.ones_like(a)], axis=2)
    print("VALIDATE poster", (w, h), "alpha range", float(a.min()), float(a.max()))
    im = bpy.data.images.new("dark", w, h, alpha=True)
    im.pixels.foreach_set(out.ravel())
    im.filepath_raw = os.path.join(HERE, "renders", "poster_on_dark.png")
    im.file_format = "PNG"
    im.save()
