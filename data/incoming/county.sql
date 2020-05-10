DROP VIEW IF EXISTS county_case_data, county_death_data, county_priority_case_count, county_priority_death_count;
DROP TABLE IF EXISTS
    county
    , county_cases
    , county_deaths
    , county_data
    CASCADE;


CREATE TABLE IF NOT EXISTS county (
    id UUID PRIMARY KEY
    , geo_id VARCHAR(5) UNIQUE
    , county_name VARCHAR(50)
    , state_name VARCHAR(25)
    , state_fp VARCHAR(2)
    , county_fp VARCHAR(3)
    , latitude VARCHAR
    , longitude VARCHAR
    , population_size DECIMAL
);

CREATE TABLE IF NOT EXISTS county_data
(
     id UUID PRIMARY KEY
    , geo_id VARCHAR(5)
    , data_date DATE
    , updated_at DATE
    , latitude VARCHAR
    , longitude VARCHAR
    , source VARCHAR
    , source_priority INT
    , data_type VARCHAR
    , data_count INT
    , CONSTRAINT unique_county_data_point UNIQUE (source, data_type, data_date, geo_id)
);

CREATE VIEW county_priority_case_count 
AS SELECT 
 geo_id
 , data_date
 , data_count current_cases
 , ROW_NUMBER() OVER (PARTITION BY geo_id, data_date ORDER BY source_priority ASC ) rk
 FROM county_data
 WHERE data_type = 'case_data';

CREATE VIEW county_case_data
AS SELECT
    county.geo_id geo_id
    , data_date
    , current_cases
    , (current_cases - (LAG (current_cases, 1, 0) OVER (PARTITION BY county_priority_case_count.geo_id ORDER BY county_priority_case_count.data_date ASC))) as new_cases
    , CASE WHEN population_size > 0 THEN (current_cases::decimal / population_size) ELSE 0.0 END as infection_rate
FROM county_priority_case_count
LEFT JOIN county ON county.geo_id = county_priority_case_count.geo_id
WHERE county_priority_case_count.rk = 1;


CREATE VIEW county_priority_death_count
AS SELECT 
 geo_id
 , data_date
 , data_count current_dead
 , ROW_NUMBER() OVER (PARTITION BY geo_id, data_date ORDER BY source_priority ASC ) rk
 FROM county_data
 WHERE data_type = 'death_data';

CREATE VIEW county_death_data
AS SELECT
    county.geo_id
    , county_priority_death_count.data_date
    , current_dead
    , current_cases
    , (current_dead - (LAG (current_dead, 1, 0) OVER (PARTITION BY county_priority_death_count.geo_id ORDER BY county_priority_death_count.data_date ASC))) as new_deaths
    , CASE WHEN current_cases > 0 THEN (current_dead::decimal / current_cases)*100 ELSE  0.0 END as fatality_rate
FROM county_priority_death_count
LEFT JOIN county ON county.geo_id = county_priority_death_count.geo_id
LEFT JOIN county_priority_case_count 
    ON county_priority_case_count.geo_id = county_priority_death_count.geo_id
    AND county_priority_case_count.data_date = county_priority_death_count.data_date
    AND county_priority_case_count.rk = 1
