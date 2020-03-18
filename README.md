
# Demand Modeller

## Loading Data

### County shapefiles

1. Download the [TIGER files](https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2019&layergroup=Counties+%28and+equivalent%29) add to `data/`
1. Load them into the database with the following command:

```bash
shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql --host localhost -d covid -U covid
```

or via docker

```bash
docker build -f loader.Dockerfile -t loader . && docker run -i -t loader
```
