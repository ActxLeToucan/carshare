CREATE OR REPLACE FUNCTION haversine(lat1 double, long1 double, lat2 double, long2 double)
    RETURNS double
BEGIN
    DECLARE R double;
    DECLARE lat1r double;
    DECLARE lat2r double;
    DECLARE long1r double;
    DECLARE long2r double;
    DECLARE dlat double;
    DECLARE dlong double;
    DECLARE a double;
    DECLARE c double;
    DECLARE d double;

    SET lat1r = RADIANS(lat1);
    SET lat2r = RADIANS(lat2);
    SET long1r = RADIANS(long1);
    SET long2r = RADIANS(long2);

    SET R = 6371;

    SET dlat = lat2r - lat1r;
    SET dlong = long2r - long1r;

    SET a = POW(SIN(dlat / 2), 2) + COS(lat1r) * COS(lat2r) * POW(SIN(dlong / 2), 2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1 - a));
    SET d = R * c;

    RETURN d;
END;