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
1. `docker-compose up --build api`
1. `cd ui && yarn start`
1. Wait for data load to complete and go to the [report](localhost:3000/?report=true)

## Data cleaning

1. review data checks (currently in fearless dreamer)
1. review top ten state county data against state department of health websites
1. review known data issue areas in airtable
    * [Philadelphia, PA](https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx)
    * [Harris County, TX](https://harriscounty.maps.arcgis.com/apps/opsdashboard/index.html#/c0de71f8ea484b85bb5efcb7c07c6914)
    * [Wayne County, MI](https://www.michigan.gov/coronavirus/0,9753,7-406-98163_98173---,00.html) Note add Detroit + Wayne values from michigan.gov
    * [King Couny, WA](https://www.kingcounty.gov/depts/health/communicable-diseases/disease-control/novel-coronavirus/data-dashboard.aspx) kingcounty.gov seems to report the most up to date numbers
