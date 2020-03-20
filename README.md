
# Demand Modeller

[![CircleCI](https://circleci.com/gh/nickrobison-usds/demand-modeler.svg?style=svg)](https://circleci.com/gh/nickrobison-usds/demand-modeler)

[https://fearless-dreamer.herokuapp.com/](https://fearless-dreamer.herokuapp.com/)

## Loading Data

### County shapefiles

1. Download the [TIGER files](https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2019&layergroup=Counties+%28and+equivalent%29) add to `data/`
    ```bash
   wget https://www2.census.gov/geo/tiger/TIGER2019/STATE/tl_2019_us_state.zip -O data/tl_2019_us_state.zip
   wget https://www2.census.gov/geo/tiger/TIGER2019/COUNTY/tl_2019_us_county.zip -O data/tl_2019_us_county.zip
    ```
1. Unzip the files (there should be a .shp, .shx, .dbf, .prj file for each)
1. Load them into the database with the following command:

```bash
shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql --host localhost -d covid -U covid
shp2pgsql -s 4269 data/tl_2019_us_state public.states | psql --host localhost -d covid -U covid
```

or via docker

```bash
docker-compose up --build postgres
# `docker network ls` to find the correct network name
docker build -f loader.Dockerfile -t loader . && docker run -it --network=demand-modeler_default loader
# the api build takes forever to build. for fast dev itteration uncomment `dockerfile: api-dev.Dockerfile` and comment out `dockerfile: Dockerfile`
docker-compose up --build api
```

## Bootstrapping Heroku

1. Create a Postgres service and link it to the application
    ```bash
    heroku addons:create heroku-postgresql:hobby-dev
   ```
1. Load the initial state and county shapefiles into the database using the `DATABASE_URL` parameter from Heroku
    ```bash
   heroku config
   export DATABASE_URL="{DBURL from heroku}
   make load
    ```
1. Install the Go and Nodejs buildpacks
    ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/go
    ```
1. Deploy

## Loading new data

1. Download the latest CSV file
1. Copy into the `data/` directory with this name pattern: `covid19_county_2020_{month}_{day}-{time?}.csv
1. Perform manual cleaning 
    - Rename 'Walton, FL' to 'Walton County, FL'
    - Remove 'Gloucester, NJ' duplicate
    - Remove duplicate 'Anderson, SC'
1. Run the go application and see if it barfs on the new data. Rinse, repeat until it works.