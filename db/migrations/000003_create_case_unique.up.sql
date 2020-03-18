ALTER TABLE Cases
    ADD CONSTRAINT unique_report UNIQUE (Geoid, UPDATE);