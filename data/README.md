# Data Fetching

## Download latest data

1. wait until `10:30 - 11 pm`
1. Open Chrome (csv download doesn't work in firefox)
1. go to the [dataset](https://protect.hhs.gov/workspace/compass/view/ri.compass.main.folder.3b32d6b7-0f8b-4cfc-811b-8689c9c8de34) and click "Build"
1. Wait for dataset to build and click "Actions" > "Download as CSV" fill out prompt
1. Replace `FIPSData.csv` with the new download

## Restart Application

1. `docker-compose down`
1. `docker-compose up postgres`
1. `docker-compose up api`
1. `cd ui && yarn start`
1. Wait for data load to complete and go to the [report](localhost:3000/?report=true)

## Data cleaning

1. review data checks
1. review known data issue areas in airtable
1. review top ten state county data against state department of health websites
1. update `FIPSData.csv` with more accurate numbers and restart application

