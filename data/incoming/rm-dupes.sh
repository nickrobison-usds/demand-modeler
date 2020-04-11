#!/bin/bash

set -eu

run() {
  echo >&2 "+ $*"
  "$@"
}

if [ $# -lt 1 ]; then
  echo "usage: $0 <filename(s)>" >&2
  exit 1
fi

lastsum=0

for i in "$@"; do
  sum=$(shasum -a 1 "$i" | cut -c 1-40)
  if [ "$sum" = "$lastsum" ]; then
    run rm "$i"
  fi
  lastsum=$sum
done
