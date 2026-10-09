#!/usr/bin/env bash
# Plays a scene script against `norte-gui` on a virtual X display and keeps
# the window as PNG. Same scene format as tui.sh; the tmux key names are
# translated to xdotool's. `frame` is ignored: the window's clip is a video
# (RECORD=<file.webm> records the whole scene).
#
# usage: gui.sh <home> <bin-dir> <scene-file> <out-dir> [theme] [lang]
# needs: Xvfb, xdotool, import (ImageMagick), and ffmpeg for RECORD.
set -euo pipefail

home=${1:?home} bin=${2:?bin dir} scene=${3:?scene} out=${4:?out dir}
theme=${5:-catppuccin-mocha} lang=${6:-en}
here=$(cd "$(dirname "$0")" && pwd)
# The window's own default size (tauri.conf.json): resizing it after it maps
# leaves WebKit repainting at two sizes at once under Xvfb.
width=${WIDTH:-1200} height=${HEIGHT:-800}
# Device pixels per CSS pixel, as on a HiDPI screen: the stills stay sharp on
# one. The display is that much bigger; the window keeps its size in points.
scale=${SCALE:-2}
pw=$((width * scale)) ph=$((height * scale))
locale=C.UTF-8
[ "$lang" = es ] && locale=es_ES.UTF-8
settle=${SETTLE:-0.6}
display=${GUI_DISPLAY:-:77}

mkdir -p "$out"
cat >"$home/.config/norte/norte.toml" <<EOF
[ui]
theme = "$theme"
lang = "$lang"
show_hidden = false
row_stripes = true
splash = "off"

# A few favorites, so Places reads like a home that is lived in. Paths in
# wire form: a VPath, percent-encoded.
[[hotlist]]
name = "Photos"
path = "file:///home/ada/Photos"

[[hotlist]]
name = "Tromsø"
path = "file:///home/ada/Photos/2026-01%20Troms%C3%B8"

[[hotlist]]
name = "aurora"
path = "file:///home/ada/projects/aurora"

[[hotlist]]
name = "Downloads"
path = "file:///home/ada/Downloads"
EOF
rm -rf "$home/.local/state" "$home/.cache" "$home"/.config/norte/{journal,index}.db*

if DISPLAY=$display xdotool getdisplaygeometry >/dev/null 2>&1; then
	echo "gui.sh: $display is taken; a previous run left its Xvfb behind?" >&2
	exit 1
fi
Xvfb "$display" -screen 0 "${pw}x${ph}x24" -nolisten tcp >/dev/null 2>&1 &
xvfb=$!
app=
rec=
cleanup() {
	# A kill of something already gone must not end the cleanup halfway.
	set +e
	if [ -n "$rec" ]; then
		# ffmpeg finishes the file on SIGINT; give it a few seconds, not forever.
		kill -INT "$rec" 2>/dev/null
		for _ in $(seq 30); do kill -0 "$rec" 2>/dev/null || break; sleep 0.5; done
		kill -9 "$rec" 2>/dev/null
	fi
	# The whole group: the sandbox, the window AND the daemon it started.
	if [ -n "$app" ]; then kill -- "-$app" 2>/dev/null; fi
	kill "$xvfb" 2>/dev/null
	return 0
}
trap cleanup EXIT
export DISPLAY=$display
for _ in $(seq 50); do xdotool getdisplaygeometry >/dev/null 2>&1 && break; sleep 0.1; done

# tmux key names → xdotool's.
key() {
	local k=$1
	case $k in
	Enter) k=Return ;;
	Escape) k=Escape ;;
	C-M-*) k=ctrl+alt+${k#C-M-} ;;
	C-*) k=ctrl+${k#C-} ;;
	M-*) k=alt+${k#M-} ;;
	S-*) k=shift+${k#S-} ;;
	PageDown | NPage) k=Next ;;
	PageUp | PPage) k=Prior ;;
	esac
	xdotool key --clearmodifiers "$k"
}

while IFS= read -r line || [ -n "$line" ]; do
	[[ -z $line || $line == \#* ]] && continue
	verb=${line%% *}
	arg=${line#"$verb"}
	arg=${arg# }
	case $verb in
	run)
		# shellcheck disable=SC2086 # the scene's arguments are words on purpose
		setsid "$here/sandbox.sh" "$home" "$bin" env DISPLAY="$display" GDK_BACKEND=x11 GDK_SCALE="$scale" LANG="$locale" LC_ALL="$locale" \
			WEBKIT_DISABLE_DMABUF_RENDERER=1 LIBGL_ALWAYS_SOFTWARE=1 \
			norte-gui --no-splash $arg </dev/null >"$out/gui.log" 2>&1 &
		app=$!
		win=$(xdotool search --sync --onlyvisible --name norte | head -1)
		xdotool windowmove "$win" 0 0 windowfocus "$win"
		# The daemon starts, the webview loads, the first listing arrives.
		sleep 6
		if [ -n "${RECORD:-}" ]; then
			# -nostdin: it would eat the scene this loop is reading.
			# Recorded at the display's size, kept at 1.5× the window's: sharp
			# enough for the page, a third of the bytes of 2×.
			ffmpeg -nostdin -loglevel error -y -f x11grab -draw_mouse 0 -framerate 24 -video_size "${pw}x${ph}" -i "$display" \
				-vf "scale=$((width * 3 / 2)):-2:flags=lanczos" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline realtime -pix_fmt yuv420p "$RECORD" &
			rec=$!
		fi
		;;
	keys)
		for k in $arg; do key "$k"; done
		sleep "$settle"
		;;
	open)
		key Enter
		sleep 1.2
		;;
	type)
		xdotool type --delay 40 "$arg"
		sleep "$settle"
		;;
	wait) sleep "$arg" ;;
	shot) import -window root "$out/$arg.png" ;;
	frame) ;;
	*)
		echo "gui.sh: unknown step: $line" >&2
		exit 2
		;;
	esac
done <"$scene"
