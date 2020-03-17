CREATE TABLE IF NOT EXISTS Cases (
                                     ID SERIAL PRIMARY KEY ,
                                     County VARCHAR(50),
                                     State VARCHAR(25),
                                     Confirmed INT,
                                     NewConfirmed INT,
                                     Dead INT,
                                     NewDead INT,
                                     Fatality FLOAT,
                                     StateFP VARCHAR(2),
                                     CountyFP VARCHAR(3),
                                     Geoid VARCHAR(5),
                                     UPDATE timestamptz
)