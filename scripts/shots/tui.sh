#!/usr/bin/env bash
# Plays a scene script against `ntc` in a detached tmux and keeps the screen,
# colours included (`capture-pane -e`), as `.ansi` files the landing renders as
# text. One tmux server of our own (`-L`), so a user's tmux is never touched.
#
# usage: tui.sh <home> <bin-dir> <scene-file> <out-dir> [theme] [lang]
#
# A scene file is one step per line:
#   keys <tmux key>…   send keys (tmux names: Enter, F5, C-g, M-t, Down…)
#   open               Enter, and wait for the directory to load
#   type <text>        type literal text
#   wait <seconds>     let the screen settle
#   shot <name>        write <out-dir>/<name>.ansi
#   frame              append the screen to <out-dir>/reel.ansi (a clip)
#   run <cmd>          start ntc with these arguments (first line)
#   term <cmd>         like run, for any other program: a shell, an agent
#   session <name>     the steps after it act on this tmux session; a `run`
#                      after it starts a second ntc next to the first
#   sh <cmd>           run a shell command as ada, in the background (a daemon,
#                      a server, a long copy); stopped when the scene ends
#
# Every sandbox of one scene shares a runtime dir, so a daemon started with
# `sh` and an `ntc --daemon` started with `run` meet on the same socket.
set -euo pipefail

home=${1:?home} bin=${2:?bin dir} scene=${3:?scene} out=${4:?out dir}
theme=${5:-catppuccin-mocha} lang=${6:-en}
here=$(cd "$(dirname "$0")" && pwd)
sock=norte-landing
cols=${COLS:-132} rows=${ROWS:-38}
settle=${SETTLE:-0.5}
# The shell in the terminal panel speaks the shot's language too.
locale=C.UTF-8
[ "$lang" = es ] && locale=es_ES.UTF-8

mkdir -p "$out"
: >"$out/reel.ansi"
cat >"$home/.config/norte/norte.toml" <<EOF
[ui]
theme = "$theme"
lang = "$lang"
show_hidden = false
row_stripes = true
EOF
# Each run starts with no session, no history and an empty journal.
rm -rf "$home/.local/state" "$home/.cache" "$home"/.config/norte/{journal,index}.db*

export RUN_DIR=${TMPDIR:-/tmp}/norte-landing-run
rm -rf "$RUN_DIR"
target=shot
bg=()

t() { tmux -L "$sock" "$@"; }
snap() { t capture-pane -e -p -t "$target"; }
cleanup() {
	t kill-server 2>/dev/null || true
	for pid in "${bg[@]}"; do kill "$pid" 2>/dev/null || true; done
	wait 2>/dev/null || true
}
trap cleanup EXIT

t kill-server 2>/dev/null || true
while IFS= read -r line || [ -n "$line" ]; do
	[[ -z $line || $line == \#* ]] && continue
	verb=${line%% *}
	arg=${line#"$verb"}
	arg=${arg# }
	case $verb in
	run | term)
		# No user tmux.conf, and the width of a VS16 emoji decided before ntc
		# draws its first frame.
		t -f /dev/null start-server \; set -s variation-selector-always-wide "${VS16_WIDE:-on}"
		# `run` starts ntc; `term` any other program, a shell or the agent.
		[ "$verb" = run ] && program=(ntc) || program=()
		# shellcheck disable=SC2086 # the scene's arguments are words on purpose
		t new-session -d -s "$target" -x "$cols" -y "$rows" \
			env RUN_DIR="$RUN_DIR" "$here/sandbox.sh" "$home" "$bin" env LANG="$locale" LC_ALL="$locale" "${program[@]}" $arg
		# Keys sent before the first frame is up are lost, not queued.
		sleep 2.5
		;;
	session) target=$arg ;;
	sh)
		"$here/sandbox.sh" "$home" "$bin" env LANG="$locale" LC_ALL="$locale" bash -c "$arg" \
			>>"$out/sh.log" 2>&1 &
		bg+=($!)
		sleep "$settle"
		;;
	keys)
		# shellcheck disable=SC2086
		t send-keys -t "$target" $arg
		sleep "$settle"
		;;
	open)
		# Enter into a directory: the listing loads asynchronously, and a key
		# sent before it lands acts on the OLD one.
		t send-keys -t "$target" Enter
		sleep 1.2
		;;
	type)
		t send-keys -t "$target" -l "$arg"
		sleep "$settle"
		;;
	wait) sleep "$arg" ;;
	shot) snap >"$out/$arg.ansi" ;;
	frame)
		snap >>"$out/reel.ansi"
		printf '\f\n' >>"$out/reel.ansi"
		;;
	*)
		echo "tui.sh: unknown step: $line" >&2
		exit 2
		;;
	esac
	# TRACE=1 keeps the screen after every step: the way to see which key missed.
	if [ -n "${TRACE:-}" ]; then
		step=$((${step:-0} + 1))
		{ echo "## $target: $line"; snap 2>/dev/null || true; } >"$out/trace-$(printf %03d "$step").ansi"
	fi
done <"$scene"
cleanup
[ -s "$out/reel.ansi" ] || rm -f "$out/reel.ansi"
[ -s "$out/sh.log" ] || rm -f "$out/sh.log"
