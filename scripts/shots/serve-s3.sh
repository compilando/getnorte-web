#!/usr/bin/env bash
# Runs INSIDE ada's sandbox (shoot.sh copies it next to the binaries, on her
# PATH): an S3 bucket, aurora-archive, served by rclone on 127.0.0.1:9000,
# and an `archive` connection to it. The bucket is throttled, so a big copy
# out of it is still running when the shots are taken.
#
# The credentials are the daemon's: start it with
#   AWS_ACCESS_KEY_ID=ada AWS_SECRET_ACCESS_KEY=northernlights norte daemon run
set -euo pipefail

root=/tmp/norte-landing-s3
bucket=$root/aurora-archive
rm -rf "$root"
mkdir -p "$bucket/2026-01-tromso" "$bucket/2025-abisko"
cp "$HOME/Photos/2026-01 Tromsø/"*.jpg "$bucket/2026-01-tromso/"
head -c 1500M /dev/urandom >"$bucket/2026-01-tromso/night-sky-8k.mov"
cp "$HOME/Photos/2026-01 Tromsø/fjord.jpg" "$bucket/2025-abisko/lake.jpg"
touch -d '2026-09-18 23:41' "$bucket"/*/*

cat >~/.config/norte/connections.toml <<'EOF'
[connections.archive]
url = "s3://aurora-archive"
endpoint = "http://127.0.0.1:9000"
region = "us-east-1"
EOF
exec rclone serve s3 "$root" --addr 127.0.0.1:9000 --auth-key ada,northernlights \
	--bwlimit "${S3_BWLIMIT:-120M}" --log-level ERROR
