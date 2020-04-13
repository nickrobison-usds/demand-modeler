FIPSData.csv:
	echo "Cases,Fips,date,Deaths" > "$@"
	curl -X GET $(DAIKON_URL) -H "authorization: Bearer $(DAIKON_TOKEN)" \
	 | sort -t , -k 3,3 -k 2,2 >> "$@"
