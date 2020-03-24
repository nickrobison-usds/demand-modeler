DATA_DIR := data
FILES := tl_2019_us_state tl_2019_us_county

$(DATA_DIR)/tl_2019_us_%.shp: $(DATA_DIR)/tl_2019_us_%.zip
	@unzip -o $(basename $@).zip -d $(DATA_DIR)

$(DATA_DIR)/tl_2019_us_county.zip:
	@wget https://www2.census.gov/geo/tiger/TIGER2019/COUNTY/tl_2019_us_county.zip -O $@

$(DATA_DIR)/tl_2019_us_state.zip:
	@wget https://www2.census.gov/geo/tiger/TIGER2019/STATE/tl_2019_us_state.zip -O $@

.PHONY: download
download: $(DATA_DIR)/tl_2019_us_county.shp $(DATA_DIR)/tl_2019_us_state.shp

.PHONY: load
load: download
	@shp2pgsql -s 4269 data/tl_2019_us_county public.tiger | psql -d $(DATABASE_URL)
	@shp2pgsql -s 4269 data/tl_2019_us_state public.states | psql -d $(DATABASE_URL)
