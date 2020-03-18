FROM alpine:latest

COPY data /home/src
WORKDIR /home/src

RUN apk add postgresql-client
RUN apk add postgis

ENTRYPOINT shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql --host postgres -d covid -U covid
