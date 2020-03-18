#!/bin/bash
set -e

if [[ $LOAD -eq 1 ]]; then
  eval " psql -d ${DATABSE_URL} -c 'CREATE EXTENSION postgis;'"
  echo "Loading database"
  eval "make load -j2"
fi

exec "$@"