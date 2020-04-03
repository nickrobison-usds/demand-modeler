# Daikon Exporter

## Table of Contents

* [Setup](#Setup)

## Setup

1. Run `cp .env .env.local` and fill in `.env.local` with the corresponding env vars values
2. `docker build -f ppt.Dockerfile -t ppt . && docker run -e "TOKEN=YOUR_TOKEN_HERE" ppt`