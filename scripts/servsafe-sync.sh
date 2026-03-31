#!/bin/bash
# Auto-save ServSafe certificates from Gmail
DEST=~/Documents/ServSafe\ Certificates
mkdir -p "$DEST"

# Search for unread ServSafe emails
THREADS=$(gog gmail messages search "servsafe has:attachment is:unread" --max 20 --account lolasuperbot@gmail.com --json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for m in data.get('messages', []):
    print(m['threadId'])
" 2>/dev/null)

if [ -z "$THREADS" ]; then
  echo "No new ServSafe emails."
  exit 0
fi

COUNT=0
while IFS= read -r threadId; do
  echo "Processing thread: $threadId"
  gog gmail thread attachments "$threadId" --account lolasuperbot@gmail.com --download --out-dir "$DEST" 2>&1
  # Mark as read
  gog gmail thread modify "$threadId" --account lolasuperbot@gmail.com --remove UNREAD 2>/dev/null
  COUNT=$((COUNT + 1))
done <<< "$THREADS"

echo "Done! Processed $COUNT thread(s)."
