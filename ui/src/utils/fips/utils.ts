export const splitFips = (fips: string): { state: string; county: string } => {
  return {
    state: fips.substring(0, 2),
    county: fips.substring(2, 5)
  };
};
