
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

1. install [Docker](https://docs.docker.com/install/)

  ```bash
  docker-compose up postgres
  ```

1. start the API

  ```bash
  docker-compose up --build api
  ```

## Bootstrapping Cloud.gov

1. Create a cloud.gov database service
    1. Use the relational database template
    1. Select a `psql`-based instance
    1. Skip binding the service to an instance
1. Create a cloud.gov application
    1. Update `manifest.yml` with the service name identified in step 1
    1. Change the name of the applications if needed, verifying the URLs are correct
    1. Run `cf push`
    1. Done!

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