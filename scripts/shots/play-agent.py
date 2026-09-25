#!/usr/bin/env python3
"""A scripted MCP client, for the landing's agent scene.

Runs INSIDE ada's sandbox (shoot.sh copies it next to the binaries, on her
PATH). It is not an AI: it speaks the real protocol to `norte mcp serve` and
prints what it does the way an agent's transcript would, so the scene shows
norte's side of it honestly: the scope it has to ask for, every change held
for a person's approval, and all of it in the journal to be undone.

The task it plays: date-prefix the photos in ~/Photos/2026-01 Tromsø.
"""
import json
import os
import subprocess
import sys
import time
from datetime import datetime

SESSION = "photo-helper"
HOME = os.environ["HOME"]
FOLDER = f"{HOME}/Photos/2026-01 Tromsø"
URL = f"file://{FOLDER}"
SHORT = "~/Photos/2026-01 Tromsø"

DIM, BOLD, GREEN, AMBER, RED, CYAN, OFF = (f"\x1b[{c}m" for c in ("2", "1", "32", "33", "31", "36", "0"))


def say(line=""):
    print(line, flush=True)


bridge = subprocess.Popen(
    ["norte", "mcp", "serve", "--session", SESSION],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL,
    text=True,
)
_next = 0


def rpc(method, params=None):
    global _next
    _next += 1
    msg = {"jsonrpc": "2.0", "id": _next, "method": method}
    if params is not None:
        msg["params"] = params
    bridge.stdin.write(json.dumps(msg) + "\n")
    bridge.stdin.flush()
    while True:
        reply = json.loads(bridge.stdout.readline())
        if reply.get("id") == _next:
            return reply


def notify(method):
    bridge.stdin.write(json.dumps({"jsonrpc": "2.0", "method": method}) + "\n")
    bridge.stdin.flush()


def tool(name, **args):
    """(ok, payload): the tool's JSON answer, or its error text."""
    result = rpc("tools/call", {"name": name, "arguments": args})["result"]
    text = result["content"][0]["text"]
    if result.get("isError"):
        return False, text
    return True, json.loads(text)


def step(name, detail):
    say(f"{CYAN}⏺{OFF} {BOLD}{name}{OFF}  {detail}")


# What the agent says, in the scene's language (tui.sh sets LANG per shot).
# norte's own words (the denial) come as norte says them.
T = {
    "en": {
        "banner": "photo-helper · a scripted MCP client · norte mcp serve --session {s}",
        "tools": "{n} tools: {names}",
        "task": "Put the date in front of every photo in {f}.",
        "request": "request {r}: a person has to run {cmd}",
        "granted": "granted: {f}, move, for an hour",
        "count": "{n} photos",
        "held": "held by norte: waiting for a person to approve",
        "done_one": "approved and done",
        "done": "Done.",
        "done_all": "{n} photos renamed, each one approved in norte.",
        "journal": "Every change is in the journal under session {s}.",
    },
    "es": {
        "banner": "photo-helper · un cliente MCP con guion · norte mcp serve --session {s}",
        "tools": "{n} herramientas: {names}",
        "task": "Pon la fecha delante de cada foto de {f}.",
        "request": "petición {r}: una persona tiene que ejecutar {cmd}",
        "granted": "concedido: {f}, move, durante una hora",
        "count": "{n} fotos",
        "held": "retenido por norte: esperando a que una persona lo apruebe",
        "done_one": "aprobado y hecho",
        "done": "Hecho.",
        "done_all": "{n} fotos renombradas, cada una aprobada en norte.",
        "journal": "Cada cambio está en el diario, bajo la sesión {s}.",
    },
}["es" if os.environ.get("LANG", "").startswith("es") else "en"]

rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "photo-helper", "version": "1"}})
notify("notifications/initialized")
tools = rpc("tools/list")["result"]["tools"]

say(f"{DIM}{T['banner'].format(s=SESSION)}{OFF}")
say(f"{DIM}{T['tools'].format(n=len(tools), names=', '.join(t['name'] for t in tools))}{OFF}")
say()
say(f"{BOLD}>{OFF} {T['task'].format(f=SHORT)}")
say()

step("list_dir", SHORT)
ok, out = tool("list_dir", path=URL)
if not ok:
    say(f"  {RED}✗{OFF} {out.split(' If ')[0]}")
say()

step("request_scope", f"{SHORT} · ops: move · 1 h")
ok, out = tool("request_scope", roots=[URL], ops=["move"], ttl_ms=3_600_000)
rid = out["request_id"]
say(f"  {AMBER}⏳{OFF} {T['request'].format(r=rid, cmd=f'{BOLD}norte policy grant {rid}{OFF}')}")

# The agent does not poll norte for the grant: it retries, as the tool says.
while True:
    time.sleep(0.5)
    ok, listing = tool("list_dir", path=URL)
    if ok:
        break
say(f"  {GREEN}✓{OFF} {T['granted'].format(f=SHORT)}")
say()

step("list_dir", SHORT)
photos = sorted(listing["entries"], key=lambda e: e["path"])
photos = [e for e in photos if e["kind"] == "file" and e["path"].endswith(".jpg")]
say(f"  {T['count'].format(n=len(photos))}")
say()

for entry in photos:
    name = entry["path"].rsplit("/", 1)[1]
    # list_dir may leave mtime out; stat has it.
    mtime = entry.get("mtime_ms") or tool("stat", path=entry["path"])[1]["mtime_ms"]
    day = datetime.fromtimestamp(mtime / 1000).strftime("%Y-%m-%d")
    new = f"{day}_{name}"
    step("move", f"{name} → {new}")
    say(f"  {AMBER}⏳{OFF} {T['held']}")
    ok, out = tool("move", **{"from": entry["path"], "to": entry["path"].rsplit("/", 1)[0] + "/" + new})
    if ok and out.get("state") == "completed":
        say(f"  {GREEN}✓{OFF} {T['done_one']}")
    else:
        say(f"  {RED}✗{OFF} {out if isinstance(out, str) else out.get('error')}")
say()
say(f"{BOLD}{T['done']}{OFF} {T['done_all'].format(n=len(photos))}")
say(f"{DIM}{T['journal'].format(s=SESSION)}{OFF}")

# Stay connected, like an agent's session would, until the scene ends.
sys.stdin.read() if not sys.stdin.isatty() else time.sleep(3600)
