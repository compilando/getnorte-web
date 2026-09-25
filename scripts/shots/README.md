# Landing shots

Every screen on the landing is norte itself, taken by these scripts from a
norte build. They expect a norte checkout next to this one (`NORTE_DIR`
overrides it), built first there with `just link link-gui` and `just plugins`.
`make shots` retakes them all; commit what changed under `shots/` and
`public/shots/`.

| file | does |
| --- | --- |
| `shoot.sh` | the whole run: ada's home, plugins, consent, every scene × theme × language |
| `demo-tree.sh` | builds ada's home: fixed names, sizes and dates, so a diff of the shots means the product changed |
| `sandbox.sh` | runs a command as ada under `bwrap`: `/home` holds only her home, passwd says `ada`, the hostname is `norte` |
| `plugins.sh` | installs the official plugins the shots show |
| `tui.sh` | plays a scene against `ntc` in a detached tmux, keeps each screen as `.ansi` |
| `gui.sh` | plays the same scene against `norte-gui` on Xvfb, keeps PNGs and, with `RECORD`, a video |
| `scenes/*.scene` | the scripts: `run`, `keys`, `open`, `type`, `wait`, `shot`, `frame`, and for the terminal also `session` and `sh` |
| `serve-s3.sh` | inside the sandbox: an S3 bucket served by `rclone` on `:9000`, throttled, and an `archive` connection to it |
| `serve-sftp.sh` | inside the sandbox: an unprivileged `sshd` on `:2222` playing a Raspberry Pi, a key, and a `raspberry` connection |

Needs `bwrap`, `tmux`, `magick`, `zip`, `zstd`, `rclone`, `sshd`; for the
window also `Xvfb`, `xdotool`, `ffmpeg`.

**Two clients on one daemon.** `sh <cmd>` runs a daemon or a server as ada in
the background, and `session <name>` points the steps after it at a second
tmux session, where a `run` starts a second `ntc`. Every sandbox of a scene
shares one runtime dir (`RUN_DIR`), so they all meet on the daemon's socket.
`scenes/daemon.scene` is the example. `ONLY=extra make shots` retakes just
the scenes with servers (`daemon`, `sftp`, `archive`, `compare`, `jump`).

**Why a sandbox and not `HOME=`.** Setting `HOME` does not isolate norte: the
session, the config and the runtime dir each have their own XDG variable. One
left pointing at the real home showed its folders in a shot and wrote the
shot's panes into the real `session.json`. `bwrap` hides `/home` entirely.

**Consent is given, not forged.** `scenes/approve.scene` approves the plugins
in the extension manager the way a person does. `y` on an approved row
REVOKES, which is why it runs once per fresh home, and why media-info is
left unapproved: `scenes/grant.scene` photographs the question.

**Never edit `shoot.sh` while a run is going**: bash reads a script as it
runs it. The scene files are read per step too; edit them between runs.

**A scene that steps around a bug says so, with the issue.** None does
today: the disk map (#372), the highlighted code (#373, #379), the marks
and the docked viewer in the window (#377, #378) were all put back once
fixed. Shooting found nine bugs; look at the shots as a user would.
