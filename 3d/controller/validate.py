"""Validate public/models/controller.glb.

Run: blender -b --factory-startup -P 3d/controller/validate.py
Parses the GLB JSON directly (animations, durations, materials, extensions) and re-imports it into an
empty scene to count triangles and check the bounding box.
"""
import json
import os
import struct

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
GLB = os.path.abspath(os.path.join(HERE, "..", "..", "public", "models", "controller.glb"))

with open(GLB, "rb") as fh:
    data = fh.read()
magic, version, length = struct.unpack_from("<4sII", data, 0)
clen, ctype = struct.unpack_from("<I4s", data, 12)
gltf = json.loads(data[20:20 + clen])
print("FILE", GLB, len(data), "bytes", f"({len(data) / 1024 / 1024:.2f} MB)", magic, version)
print("EXTENSIONS USED", gltf.get("extensionsUsed", []))
print("MATERIALS", len(gltf.get("materials", [])), [m["name"] for m in gltf.get("materials", [])])
print("NODES", len(gltf.get("nodes", [])), "MESHES", len(gltf.get("meshes", [])))
acc = gltf["accessors"]
for a in gltf.get("animations", []):
    times = [acc[a["samplers"][c["sampler"]]["input"]] for c in a["channels"]]
    tmax = max(t["max"][0] for t in times)
    tmin = min(t["min"][0] for t in times)
    print("ANIMATION", repr(a["name"]), "channels", len(a["channels"]), f"time {tmin:.3f}-{tmax:.3f}s")
tris = 0
per = []
for m in gltf["meshes"]:
    mt = sum(acc[p["indices"]]["count"] // 3 for p in m["primitives"] if "indices" in p)
    per.append((mt, m["name"]))
    tris += mt
print("PER MESH", sorted(per, reverse=True))
print("TRIANGLES (from accessors)", tris)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
dg = bpy.context.evaluated_depsgraph_get()
t2 = 0
lo = [1e9] * 3
hi = [-1e9] * 3
for ob in bpy.context.scene.objects:
    if ob.type != "MESH":
        continue
    me = ob.evaluated_get(dg).to_mesh()
    me.calc_loop_triangles()
    t2 += len(me.loop_triangles)
    for v in me.vertices:
        w = ob.matrix_world @ v.co
        for i in range(3):
            lo[i] = min(lo[i], w[i])
            hi[i] = max(hi[i], w[i])
    ob.evaluated_get(dg).to_mesh_clear()
print("TRIANGLES (re-imported)", t2)
print("BBOX blender-space min", [round(v, 4) for v in lo], "max", [round(v, 4) for v in hi])
print("ACTIONS", [(a.name, tuple(a.frame_range)) for a in bpy.data.actions])
