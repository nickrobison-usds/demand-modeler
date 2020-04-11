#INTERVAL = $(shell echo 60 * 2 | bc)
INTERVAL=120

csv_basename=covid19_county_fips

.phony: csbs clean-dupes poll
csbs:
	wget https://facts.csbs.org/covid-19/covid19_county_fips.csv -O $(csv_basename).$(shell gdate --iso=min).csv

clean-dupes:
	./rm-dupes.sh $(csv_basename).*.csv

poll:
	watch -n $(INTERVAL) make csbs clean-dupes
