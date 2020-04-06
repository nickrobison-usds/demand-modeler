import { County } from "../../../../app/AppStore";
import { cbsaCodes } from "./cbsaCodes";

const getConfirmed = (counties: { [fip: string]: County[] }, id: string) => {
  return counties[id] ? counties[id][0].Confirmed : 0;
}

export const getCSBATotal = (
  counties: { [fip: string]: County[] },
  csba: string,
  stat: "Confirmed" | "Dead",
  index: number
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
  limit: number
): string [] => {
  const today = 0;
  const CBSACodes = Object.keys(cbsaCodes);
  CBSACodes.sort(
    (a, b) =>
    getCSBATotal(counties, b, sort, today) - getCSBATotal(counties, a, sort, today)
  );
  return CBSACodes.splice(0, limit);
};
