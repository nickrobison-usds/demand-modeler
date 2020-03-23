from datetime import datetime
import os
import re
import csv


UVA_DATA_FILES_REGEX = r'^uva-county_[0-9]{4}-[0-9]{2}-[0-9]{2}.csv'

def create_csv_file(filename):
	"""Create a new file with a header row for the csv column names"""
	with open(filename, 'w') as f:
		f.write('countyName, stateName, confirmed, lastUpdate\n')

def get_data_files():
	"""Return the files that contain the UVA data"""
	files = [f for f in os.listdir('.') if re.match(UVA_DATA_FILES_REGEX, f)]
	return files


def get_sanitized_county_info(county_info):
	"""
	Return a tuple of 2 elements: county name and a count of cases.
	Returns nothing if we fail to parse a count.

	eg: 
	"Santa Clara 33" --> ("Santa Clara", 33)
	"Floyd 1 (presumptively positive)" --> ("Floyd", 1)
	"Montgomery 1 (possible case)" --> ("Montgomery", 1)
	"Five Florida residents" --> None
	"all are presumptive positive" --> None
	"Maricopa 2 (1 presumptively positive)" --> ("Maricopa", 2)
	"""

	county_info = county_info.replace("(possible case)", "")
	county_info = county_info.replace("(presumptively positive)", "")
	county_info = county_info.replace("(1 presumptively positive)", "")
	county_info = county_info.strip()


	county_tokens = county_info.split()
	county_name = " ".join(county_tokens[:-1])
	county_cases = county_tokens[-1]
	try:
		int(county_cases)
		return county_name, county_cases
	except:
		pass


def parse_counties_data_by_state(state_row):
	"""
	Return a list of county records, given a single state row from the UVA dataset.
	If the state does not contain the county breakdown, then 
	use a catchall county name of 'county-not-specified-<state>'

	eg: 
	"North Carolina","United States","2","0","0","2","2020-03-06 16:00:00 * CTY: Wake 1; Chatham 1"
		-->
		[
			["Wake", "North Carolina", 1, "2020-03-06 16:00:00"],
			["Chatham", "North Carolina", 1, "2020-03-06 16:00:00"],
		]

	"Hawaii","United States","1","0","0","1","2020-03-07 03:00:00"
		-->
		[
			["county-not-specified-Hawaii", "Hawaii", 1, "2020-03-07 03:00:00"]
		]
	"""
	confirmed_cases_by_county = []

	state_name = state_row[0]

	last_update = state_row[-1]

	last_update_tokens = last_update.split(" * ")
	last_update_timestamp = last_update_tokens[0]

	if len(last_update_tokens) != 2 or ":" not in last_update_tokens[1]:
		#print(f"no county data detected: {state_name}")
		county_placeholder_name = f"county-not-specified-{state_name}"

		state_confirmed_cases = state_row[2]
		# remove "," from integers
		state_confirmed_cases = state_confirmed_cases.replace(",", "")
		state_confirmed_cases = int(state_confirmed_cases)
		
		confirmed_cases_by_county.append(
			[county_placeholder_name, state_name, 
			state_confirmed_cases, last_update_timestamp])

	else:
		county_listings = last_update_tokens[1].split(":")[1].strip()
		
		for county_info in county_listings.split(";"):
			county_tokens = get_sanitized_county_info(county_info)
			if county_tokens:
				confirmed_cases_by_county.append([
					county_tokens[0], state_name, county_tokens[1], last_update_timestamp
					])
			else:
				print(f"failed to parse: ({state_name}) {county_info}")
	return confirmed_cases_by_county


def write_counties_data_to_file(filename, counties_data):
	"""
	Append the county records to the file.
	"""
	with open(filename, 'a') as csvfile:
		writer = csv.writer(csvfile, delimiter=",")
		for county in counties_data:
			writer.writerow(county)


def parse_uva_csv_file(filename):
	"""
	Open the file and derive county-level records from each of its rows 
	(which represent states). Don't process the first 2 rows, as they don't
 	correspond to a state.
	"""
	print(f"parsing {filename} --------")

	county_rows_for_file = []

	with open(filename, newline='') as csvfile:
		reader = csv.reader(csvfile, delimiter=",")

		# skip the header row
		next(reader)

		# skip the "United States" row
		next(reader)

		for row in reader:
			county_rows = parse_counties_data_by_state(row)
			county_rows_for_file.extend(county_rows)
	return county_rows_for_file


if __name__ == "__main__":
	
	output_file = f"compilation-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"
	create_csv_file(output_file)

	for data_file in get_data_files():
		county_rows_for_file = parse_uva_csv_file(data_file)
		write_counties_data_to_file(output_file, county_rows_for_file)

	print(f"created file {output_file}")