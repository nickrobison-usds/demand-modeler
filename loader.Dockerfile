FROM postgis/postgis:latest

COPY . /home/src
WORKDIR /home/src

ENTRYPOINT shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql --host localhost -d covid -U covid
