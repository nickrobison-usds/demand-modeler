```shell
TODAY=$(date +'%Y-%m-%d')
FILE=scratch_data/cases_by_county_with_overrides.csv
grep $TODAY $FILE > scratch_data/cases_by_county_today.csv
node pAdapter.js # Update to pull from today 
node pUpdateLongLat.js # Update to pull from today 
node writeCountydata.js # Update to pull from today 
```