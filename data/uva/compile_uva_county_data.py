from datetime import datetime
import os
import re

UVA_DATA_FILES_REGEX = r'^uva-county_[0-9]{4}-[0-9]{2}-[0-9]{2}.csv'

def create_file(filename):
	with open(filename, 'w') as f:
		f.write('countyName, stateName, confirmed, lastUpdate')

def get_data_files():
	files = [f for f in os.listdir('.') if re.match(UVA_DATA_FILES_REGEX, f)]
	return files


def run_tests():
	files = get_data_files()
	assert len(files) == 5
	assert 'uva-county_2020-03-03.csv' in files 
	assert 'uva-county_2020-03-07.csv' in files 



if __name__ == "__main__":
	run_tests()
	
	filename = f"{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"
	create_file(filename)
	