

## Loading Data

### County shapefiles

1. Download the TIGER files
1. Load them into the database with the following command:

```bash
shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql --host localhost -d covid -U covid
```