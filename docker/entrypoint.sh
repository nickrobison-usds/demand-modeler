#!/bin/bash
set -e

if [[ $LOAD -eq 1 ]]; then
  echo "Loading database"
  eval "make load -j2"
fi

exec "$@"