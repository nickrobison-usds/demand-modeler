CREATE TABLE IF NOT EXISTS Cases
(
    ID           SERIAL PRIMARY KEY,
    Geoid        VARCHAR(5),
    Confirmed    INT,
    NewConfirmed INT,
    Dead         INT,
    NewDead      INT,
    Fatality     FLOAT,
    UPDATE       timestamptz,
    FOREIGN KEY (Geoid) REFERENCES Counties(ID)
);