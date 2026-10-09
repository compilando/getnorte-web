#!/usr/bin/env bash
# Plays a scene against `ntc` inside a real kitty on Xvfb and keeps each `shot`
# as a PNG. tmux (tui.sh) keeps text, but kitty's graphics never reach a tmux
# pane: the big icons of the panel column (ADR 0169) and the photos in the
# viewer (ADR 0118) only exist in a terminal that draws them. This is that
# terminal, with no user config, so any machine takes the same picture.
#
# usage: kitty.sh <home> <bin-dir> <scene-file> <out-dir> [theme] [lang]
#
# The steps are tui.sh's: run, term, session, sh, keys (tmux key names),
# open, type, wait, shot; frame is ignored. Each session is a kitty window of
# its own; the one a step acts on is raised and focused first.
set -euo pipefail

home=${1:?home} bin=${2:?bin dir} scene=${3:?scene} out=${4:?out dir}
theme=${5:-catppuccin-mocha} lang=${6:-en}
here=$(cd "$(dirname "$0")" && pwd)
display=${KITTY_DISPLAY:-:98}
cols=${COLS:-132} rows=${ROWS:-38}
# Big type, so the picture is sharp on a HiDPI screen once the page halves it.
font_size=${FONT_SIZE:-22}
settle=${SETTLE:-0.5}
locale=C.UTF-8
[ "$lang" = es ] && locale=es_ES.UTF-8

mkdir -p "$out"
cat >"$home/.config/norte/norte.toml" <<EOF
[ui]
theme = "$theme"
lang = "$lang"
show_hidden = false
row_stripes = true
EOF
rm -rf "$home/.local/state" "$home/.cache" "$home"/.config/norte/{journal,index}.db*
# Every sandbox of one scene shares a runtime dir: a daemon started with `sh`
# and an `ntc --daemon` started with `run` meet on the same socket.
export RUN_DIR=${TMPDIR:-/tmp}/norte-landing-kitty-run
rm -rf "$RUN_DIR"

# The CJK font shoot.sh fetched, so 東京 is not three boxes: the machine's
# fonts, plus that one.
fonts=$out/fonts.conf
cat >"$fonts" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>
  <dir>${LANDING_SHOTS_FONTS:-/nonexistent}</dir>
</fontconfig>
EOF

if DISPLAY=$display xdotool getdisplaygeometry >/dev/null 2>&1; then
	echo "kitty.sh: $display is taken; a previous run left its Xvfb behind?" >&2
	exit 1
fi
Xvfb "$display" -screen 0 4000x2400x24 -nolisten tcp >/dev/null 2>&1 &
xvfb=$!
target=shot
declare -A win=()
groups=()
bg=()
cleanup() {
	set +e
	for g in "${groups[@]}"; do kill -- "-$g" 2>/dev/null; done
	for pid in "${bg[@]}"; do kill "$pid" 2>/dev/null; done
	kill "$xvfb" 2>/dev/null
	wait 2>/dev/null
	return 0
}
trap cleanup EXIT
export DISPLAY=$display
for _ in $(seq 50); do xdotool getdisplaygeometry >/dev/null 2>&1 && break; sleep 0.1; done

# No window manager: the session a step acts on is put on top and given the
# keyboard by hand.
front() {
	local w=${win[$target]:?kitty.sh: no window in session $target}
	xdotool windowraise "$w" windowfocus --sync "$w" 2>/dev/null || xdotool windowraise "$w" windowfocus "$w"
}

# tmux key names → xdotool's.
key() {
	local k=$1
	case $k in
	Enter) k=Return ;;
	C-M-*) k=ctrl+alt+${k#C-M-} ;;
	C-*) k=ctrl+${k#C-} ;;
	M-*) k=alt+${k#M-} ;;
	S-*) k=shift+${k#S-} ;;
	PageDown | NPage) k=Next ;;
	PageUp | PPage) k=Prior ;;
	BSpace) k=BackSpace ;;
	esac
	xdotool key --clearmodifiers "$k"
}

while IFS= read -r line || [ -n "$line" ]; do
	[[ -z $line || $line == \#* ]] && continue
	verb=${line%% *}
	arg=${line#"$verb"}
	arg=${arg# }
	case $verb in
	run | term)
		# `run` starts ntc; `term` any other program, a shell or the agent.
		[ "$verb" = run ] && program=(ntc) || program=()
		class=norte-shot-$target
		# --config NONE: the user's kitty.conf never reaches the picture. No
		# Wayland: from a desktop session kitty would open there, not on Xvfb.
		# shellcheck disable=SC2086 # the scene's arguments are words on purpose
		setsid env -u WAYLAND_DISPLAY KITTY_DISABLE_WAYLAND=1 LIBGL_ALWAYS_SOFTWARE=1 FONTCONFIG_FILE="$fonts" kitty --config NONE --class "$class" \
			-o font_family="JetBrains Mono" -o font_size="$font_size" \
			-o initial_window_width="${cols}c" -o initial_window_height="${rows}c" \
			-o remember_window_size=no -o window_padding_width=0 \
			-o hide_window_decorations=yes -o cursor_blink_interval=0 \
			-o enable_audio_bell=no -o allow_remote_control=no \
			env RUN_DIR="$RUN_DIR" "$here/sandbox.sh" "$home" "$bin" env LANG="$locale" LC_ALL="$locale" "${program[@]}" $arg \
			</dev/null >>"$out/kitty.log" 2>&1 &
		groups+=($!)
		win[$target]=$(xdotool search --sync --onlyvisible --class "$class" | head -1)
		xdotool windowmove "${win[$target]}" 0 0
		front
		# The graphics probe, the daemon, the first listing.
		sleep 3
		;;
	session) target=$arg ;;
	sh)
		"$here/sandbox.sh" "$home" "$bin" env LANG="$locale" LC_ALL="$locale" bash -c "$arg" \
			>>"$out/sh.log" 2>&1 &
		bg+=($!)
		sleep "$settle"
		;;
	keys)
		front
		for k in $arg; do key "$k"; done
		sleep "$settle"
		;;
	open)
		front
		key Enter
		sleep 1.2
		;;
	type)
		front
		xdotool type --delay 40 "$arg"
		sleep "$settle"
		;;
	# WAIT_SCALE stretches every wait: kitty decodes and places the pictures
	# too, and a viewer shot once caught "opening…" instead of the photo. Not
	# for scenes timed against a throttled copy, which would finish first.
	wait) sleep "$(awk -v s="$arg" -v k="${WAIT_SCALE:-1}" 'BEGIN { print s * k }')" ;;
	shot)
		# The window, cut out of the screen: no window manager draws a frame.
		front
		sleep 0.3
		eval "$(xdotool getwindowgeometry --shell "${win[$target]}")"
		import -window root -crop "${WIDTH}x${HEIGHT}+${X}+${Y}" +repage "$out/$arg.png"
		;;
	frame) ;;
	*)
		echo "kitty.sh: unknown step: $line" >&2
		exit 2
		;;
	esac
done <"$scene"
cleanup
[ -s "$out/sh.log" ] || rm -f "$out/sh.log"
