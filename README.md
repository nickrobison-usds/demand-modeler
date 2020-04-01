
# Demand Modeller

[![CircleCI](https://circleci.com/gh/nickrobison-usds/demand-modeler.svg?style=svg)](https://circleci.com/gh/nickrobison-usds/demand-modeler)

[https://fearless-dreamer.herokuapp.com/](https://fearless-dreamer.herokuapp.com/)

## Table of Contents

* [Setup](#Setup)
* [Bootstrapping Heroku](#bootstrapping-heroku)
* [Loading new data](#loading-new-data)
  * [csbs](#csbs)
  * [USA Facts](#usa-facts)

## Setup

1. Download the TIGER files:

  ```bash
  wget https://www2.census.gov/geo/tiger/TIGER2019/STATE/tl_2019_us_state.zip -O data/tl_2019_us_state.zip
  wget https://www2.census.gov/geo/tiger/TIGER2019/COUNTY/tl_2019_us_county.zip -O data/tl_2019_us_county.zip
  ```

1. Unzip the files (there should be a .shp, .shx, .dbf, .prj file for each)
1. install [Docker](https://docs.docker.com/install/)

  ```bash
  docker-compose up --build postgres
  ```

1. load tiger files into the database

  ```bash
  docker build -f loader.Dockerfile -t loader . && docker run -it --network=demand-modeler_default loader
  ```

  \* if the network is not correct double check it with `docker network ls`

1. start the API

  ```bash
  ddocker-compose up --build api
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

### csbs

1. Download the latest CSV file
1. Copy into the `data/` directory with this name pattern: `covid19_county_2020_{month}_{day}-{time?}.csv
1. Perform manual cleaning

* Delete `New Death` column
* Rename 'Walton, FL' to 'Walton County'

1. Run the go application and see if it barfs on the new data. Rinse, repeat until it works.

1. Download USAFacts death dataset
1. Verify top 10 counties in top 10 states in both datasets (USAFacts is source of truth)
1. Verify top-10 state value still matches what the dataset reports.

### USA Facts

```bash
docker build -f usafacts_loader.Dockerfile -t usafacts . && docker run -it --network=demand-modeler_default usafacts
```

The following steps need to be taken to manually clean the data:

1. Remove duplicate `Wayne County,WY` and `Washakie County,WY` record
1. Shorten Jackson County, MO name
1. remove `New York City Unallocated`