from datetime import datetime

def create_file(filename):
	with open(filename, 'w') as f:
		f.write('countyName, stateName, confirmed, lastUpdate')

if __name__ == "__main__":
    filename = f"{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"
    create_file(filename)