DROP VIEW IF EXISTS county_case_data, county_death_data;
DROP TABLE IF EXISTS
    county
    , county_cases
    , county_deaths
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

CREATE TABLE IF NOT EXISTS county_cases
(
     id UUID PRIMARY KEY
    , geo_id VARCHAR(5)
    , data_date DATE
    , updated_at DATE
    , latitude VARCHAR
    , longitude VARCHAR
    , source VARCHAR
    , current_cases INT
    , CONSTRAINT unique_case_data_point UNIQUE (source, data_date, geo_id)
);
CREATE TABLE IF NOT EXISTS county_deaths
(
     id UUID PRIMARY KEY
    , geo_id VARCHAR(5)
    , data_date DATE
    , updated_at DATE
    , latitude VARCHAR
    , longitude VARCHAR
    , source VARCHAR
    , current_dead INT
    , CONSTRAINT unique_death_data_point UNIQUE (source, data_date, geo_id)
);

CREATE VIEW county_case_data
AS SELECT
    county.geo_id geo_id
    , data_date
    , source
    , current_cases
    , (current_cases - (LAG (current_cases, 1, 0) OVER (PARTITION BY county_cases.source, county_cases.geo_id ORDER BY county_cases.data_date ASC))) as new_cases
    , CASE WHEN population_size > 0 THEN (current_cases::decimal / population_size) ELSE 0.0 END as infection_rate
FROM county_cases
LEFT JOIN county ON county.geo_id = county_cases.geo_id;


CREATE VIEW county_death_data
AS SELECT
    county.geo_id
    , county_deaths.data_date
    , county_deaths.source
    , current_dead
    , current_cases
    , (current_dead - (LAG (current_dead, 1, 0) OVER (PARTITION BY county_deaths.source, county_deaths.geo_id ORDER BY county_deaths.data_date ASC))) as new_deaths
    , CASE WHEN current_cases > 0 THEN (current_dead::decimal / current_cases)*100 ELSE  0.0 END as fatality_rate
FROM county_deaths
LEFT JOIN county ON county.geo_id = county_deaths.geo_id
LEFT JOIN county_cases 
    ON county_cases.geo_id = county_deaths.geo_id
    AND county_cases.data_date = county_deaths.data_date
    AND county_cases.source = county_deaths.source;
