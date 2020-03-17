CREATE TABLE IF NOT EXISTS Cases (
                                     ID INT PRIMARY KEY ,
                                     County VARCHAR(50),
                                     State VARCHAR(25),
                                     Confirmed INT,
                                     NewConfirmed INT,
                                     Death INT,
                                     NewDeath INT,
                                     Fatality FLOAT,
                                     StateFP SMALLINT,
                                     CountyFP SMALLINT,
                                     UPDATE timestamptz
)