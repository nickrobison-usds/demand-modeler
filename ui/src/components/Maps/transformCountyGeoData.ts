export function transformCountyGeoData(
  geoData: GeoJSON.FeatureCollection
): GeoJSON.FeatureCollection {
  const nyId = "0500000US36061"; // New York, NY
  const nyOtherCountyIds = [
    "0500000US36085", // Richmond, NY
    "0500000US36081", // Queens, NY
    "0500000US36005", // Bronx, NY
    "0500000US36047" // Kings, NY
  ];
  const ny = geoData.features.find(el => el.properties?.GEO_ID === nyId);
  const nyGeom = ny?.geometry as GeoJSON.MultiPolygon;
  if (ny) {
    // Add other countires to New York, NY geom
    geoData.features
      .filter(el => nyOtherCountyIds.includes(el.properties?.GEO_ID))
      .map(el => el.geometry)
      .forEach(el => {
        if (el.type === "MultiPolygon") {
          nyGeom.coordinates = [...nyGeom.coordinates, ...el.coordinates];
        }
        if (el.type === "Polygon") {
          nyGeom.coordinates = [...nyGeom.coordinates, el.coordinates];
        }
      });
    // Remove other counties as their own features
    geoData.features = geoData.features.filter(
      el => !nyOtherCountyIds.includes(el.properties?.GEO_ID)
    );
  }
  return geoData;
}
