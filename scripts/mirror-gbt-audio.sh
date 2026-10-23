#!/usr/bin/env bash
#
# Copies the Global Bible Tools Hebrew and Greek audio into our S3 bucket,
# which CloudFront serves to sync.bible. Files keep the same layout as
# assets.globalbibletools.com (audio/v1/<testament>/<recording>/<book>/<chapter>.mp3)
# so only the base URL differs.
#
# Usage: scripts/mirror-gbt-audio.sh <bucket> [aws-profile]
#
# Books already in the bucket are skipped, so it can be re-run to pick up new
# recordings. Afterwards run scripts/fetch-gbt-audio-timings.js to update the
# verse timings in the app.

set -euo pipefail

BUCKET="${1:?Usage: $0 <bucket> [aws-profile]}"
PROFILE="${2:-${AWS_PROFILE:-default}}"
SOURCE="https://assets.globalbibletools.com/audio/v1"
PREFIX="audio/v1"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

curl -fsS "$SOURCE/manifest.jsonl" -o "$WORK_DIR/manifest.jsonl"

# Book entries have a download url, e.g. {"id":"OT/HEB/Gen",...,"url":"audio/v1/OT/HEB/Gen.zip"}
grep '"url"' "$WORK_DIR/manifest.jsonl" |
	sed -E 's/.*"id":"([^"]+)".*/\1/' |
	while read -r id; do
		if aws s3api head-object --bucket "$BUCKET" --key "$PREFIX/$id/timings.bin" \
			--profile "$PROFILE" >/dev/null 2>&1; then
			echo "Skipping $id (already uploaded)"
			continue
		fi

		echo "Copying $id"
		book_dir="$WORK_DIR/book"
		rm -rf "$book_dir" && mkdir -p "$book_dir"
		curl -fsS "$SOURCE/$id.zip" -o "$book_dir/book.zip"
		unzip -q "$book_dir/book.zip" -d "$book_dir/files"

		# Each zip holds a single folder named after the book.
		aws s3 sync "$book_dir/files/$(basename "$id")" "s3://$BUCKET/$PREFIX/$id" \
			--profile "$PROFILE" \
			--cache-control "public, max-age=31536000" \
			--only-show-errors
	done

aws s3 cp "$WORK_DIR/manifest.jsonl" "s3://$BUCKET/$PREFIX/manifest.jsonl" \
	--profile "$PROFILE" --content-type "application/x-ndjson" --only-show-errors
echo "Done"
