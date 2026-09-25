#!/usr/bin/env bash
# Runs INSIDE ada's sandbox (shoot.sh copies it next to the binaries, on her
# PATH): an unprivileged sshd on 127.0.0.1:2222 serving her own account, a key
# to reach it, and a `raspberry` connection that uses the key. sshd stays in
# the foreground, so the scene's `sh` step owns it and stops it at the end.
#
# The «remote» is a folder of its own, /tmp/norte-landing-pi, standing in for
# a Raspberry Pi's home: the connection opens there, not in ada's home.
set -euo pipefail

state=/tmp/norte-landing-sshd
pi=/tmp/norte-landing-pi
rm -rf "$state" "$pi" ~/.ssh
mkdir -p "$state" ~/.ssh "$pi/timelapse" "$pi/logs"
ssh-keygen -q -t ed25519 -N '' -C raspberry -f "$state/host_ed25519"
ssh-keygen -q -t ed25519 -N '' -C ada@norte -f ~/.ssh/id_ed25519
cp ~/.ssh/id_ed25519.pub ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# What the Pi has: a night of timelapse frames and the station's logs.
for i in $(seq -w 1 9); do head -c $((3000000 + 10#$i * 41000)) /dev/urandom >"$pi/timelapse/frame-00$i.raw"; done
printf 'kp=5.33 cloud=0.12 temp=-17.8\n' >"$pi/logs/2026-09-24.log"
printf 'kp=6.67 cloud=0.04 temp=-19.1\n' >"$pi/logs/2026-09-25.log"
printf '[station]\nname = "Tromsø north"\nlat = 69.65\nlon = 18.96\n' >"$pi/station.toml"
i=0
while IFS= read -r -d '' f; do
	touch -h -d "2026-09-25 0$((1 + i % 5)):$((i * 7 % 60)):00" "$f"
	i=$((i + 1))
done < <(find "$pi" -mindepth 1 -print0 | sort -z)

cat >"$state/sshd_config" <<EOF
Port 2222
ListenAddress 127.0.0.1
HostKey $state/host_ed25519
PidFile $state/sshd.pid
AuthorizedKeysFile /home/ada/.ssh/authorized_keys
PasswordAuthentication no
KbdInteractiveAuthentication no
UsePAM no
StrictModes no
Subsystem sftp internal-sftp -d $pi
EOF
cat >~/.config/norte/connections.toml <<EOF
[connections.raspberry]
url = "sftp://ada@127.0.0.1:2222$pi"
auth = "key"
key = "~/.ssh/id_ed25519"
EOF
exec /usr/bin/sshd -D -f "$state/sshd_config" -E "$state/sshd.log"
