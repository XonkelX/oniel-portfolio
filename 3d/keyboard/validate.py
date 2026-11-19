"""Validate public/models/keyboard.glb against the key-press contract.

Run: blender -b --factory-startup -P 3d/keyboard/validate.py   (or plain `python 3d/keyboard/validate.py`)
Parses the GLB JSON directly: key node names (KeyboardEvent.code), local transforms, hierarchy,
triangle count, size, bounding box and the local up of key nodes in glTF space.
"""
import json
import math
import os
import struct

HERE = os.path.dirname(os.path.abspath(__file__))
GLB = os.path.abspath(os.path.join(HERE, "..", "..", "public", "models", "keyboard.glb"))

CODES = (["Escape"] + [f"F{i}" for i in range(1, 13)] + ["Delete", "Knob"]
         + ["Backquote"] + [f"Digit{i}" for i in range(10)] + ["Minus", "Equal", "Backspace", "Home"]
         + ["Tab"] + [f"Key{c}" for c in "QWERTYUIOP"] + ["BracketLeft", "BracketRight", "Backslash", "PageUp"]
         + ["CapsLock"] + [f"Key{c}" for c in "ASDFGHJKL"] + ["Semicolon", "Quote", "Enter", "PageDown"]
         + ["ShiftLeft"] + [f"Key{c}" for c in "ZXCVBNM"] + ["Comma", "Period", "Slash", "ShiftRight", "ArrowUp", "End"]
         + ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "Fn", "ControlRight",
            "ArrowLeft", "ArrowDown", "ArrowRight"])

with open(GLB, "rb") as fh:
    data = fh.read()
clen, _ = struct.unpack_from("<I4s", data, 12)
g = json.loads(data[20:20 + clen])
nodes = g["nodes"]
acc = g["accessors"]
print("FILE", GLB, len(data), "bytes", f"({len(data) / 1024 / 1024:.3f} MB)")
print("EXTENSIONS USED", g.get("extensionsUsed", []))
print("MATERIALS", [m["name"] for m in g.get("materials", [])])

parent = {}
for i, n in enumerate(nodes):
    for c in n.get("children", []):
        parent[c] = i


def chain(i):
    out = [nodes[i].get("name")]
    while i in parent:
        i = parent[i]
        out.append(nodes[i].get("name"))
    return " > ".join(reversed(out))


def qrot(q, v):
    x, y, z, w = q
    # v' = q v q*
    ux, uy, uz = x, y, z
    dot_uv = ux * v[0] + uy * v[1] + uz * v[2]
    dot_uu = ux * ux + uy * uy + uz * uz
    cross = (uy * v[2] - uz * v[1], uz * v[0] - ux * v[2], ux * v[1] - uy * v[0])
    return tuple(2 * dot_uv * u + (w * w - dot_uu) * vv + 2 * w * cr for u, vv, cr in zip((ux, uy, uz), v, cross))


names = [n.get("name") for n in nodes]
ok = True
for c in CODES:
    cnt = names.count(c)
    if cnt != 1:
        ok = False
        print("MISSING/DUP", c, cnt)
bad_tf = []
for c in CODES:
    if c not in names:
        continue
    n = nodes[names.index(c)]
    r = n.get("rotation", [0, 0, 0, 1])
    s = n.get("scale", [1, 1, 1])
    if any(abs(a - b) > 1e-6 for a, b in zip(r, [0, 0, 0, 1])) or any(abs(a - 1) > 1e-6 for a in s) or "matrix" in n:
        bad_tf.append(c)
print("ALL CODES PRESENT EXACTLY ONCE:", ok, f"({len(CODES)} nodes)")
print("KEY NODES WITH NON-IDENTITY ROTATION/SCALE:", bad_tf or "none")
print("KEY NODE NAMES:", ", ".join(c for c in CODES))
print("HIERARCHY (KeyF):", chain(names.index("KeyF")))
print("HIERARCHY (Knob):", chain(names.index("Knob")))

# world-space up of a key = product of parents' rotations applied to +Y
i = names.index("KeyF")
up = (0.0, 1.0, 0.0)
j = i
while j in parent:
    j = parent[j]
    up = qrot(nodes[j].get("rotation", [0, 0, 0, 1]), up)
print("KEY LOCAL +Y IN glTF WORLD:", tuple(round(v, 4) for v in up),
      f"tilt from vertical {math.degrees(math.acos(up[1])):.2f} deg (toward {'+Z/front' if up[2] > 0 else '-Z/back'})")

tris = 0
per = []
for m in g["meshes"]:
    t = sum(acc[p["indices"]]["count"] // 3 for p in m["primitives"])
    tris += t
    per.append((t, m["name"]))
print("TRIANGLES", tris)
print("TOP MESHES", sorted(per, reverse=True)[:6])
key_tris = sum(t for t, nm in per if nm in CODES)
print("KEY MESH TRIANGLES", key_tris)

# bounding box from POSITION accessors transformed by node chains (translation + rotation only)
lo = [1e9] * 3
hi = [-1e9] * 3


def world_pt(i, p):
    while True:
        n = nodes[i]
        p = qrot(n.get("rotation", [0, 0, 0, 1]), p)
        t = n.get("translation", [0, 0, 0])
        p = tuple(a + b for a, b in zip(p, t))
        if i not in parent:
            return p
        i = parent[i]


for i, n in enumerate(nodes):
    if "mesh" not in n:
        continue
    for prim in g["meshes"][n["mesh"]]["primitives"]:
        a = acc[prim["attributes"]["POSITION"]]
        mn, mx = a["min"], a["max"]
        for cx in (mn[0], mx[0]):
            for cy in (mn[1], mx[1]):
                for cz in (mn[2], mx[2]):
                    w = world_pt(i, (cx, cy, cz))
                    lo = [min(a_, b_) for a_, b_ in zip(lo, w)]
                    hi = [max(a_, b_) for a_, b_ in zip(hi, w)]
print("BBOX glTF min", [round(v, 4) for v in lo], "max", [round(v, 4) for v in hi],
      "(approx, from accessor AABBs)")
