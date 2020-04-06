import { County } from "../../../../app/AppStore";
import { cbsaCodes } from "./cbsaCodes";

const getConfirmed = (counties: { [fip: string]: County[] }, id: string) => {
  return counties[id] ? counties[id][0].Confirmed : 0;
};

export const getCSBATotal = (
  counties: { [fip: string]: County[] },
  csba: string,
  stat: "Confirmed" | "Dead"
) => {
  const { fips } = cbsaCodes[csba];
  let total = 0;
  fips.forEach(fip => {
    total += counties[fip] ? counties[fip][0][stat] : 0;
  });
  return total;
};

export const CSBAOrderedByStat = (
  counties: { [fip: string]: County[] },
  sort: "Confirmed" | "Dead",
  limit: number,
  exclude: string[]
): string[] => {
  return Object.keys(cbsaCodes)
    .filter(code => !exclude.includes(code))
    .sort(
      (a, b) =>
        getCSBATotal(counties, b, sort) - getCSBATotal(counties, a, sort)
    )
    .splice(0, limit);
};
