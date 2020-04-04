import { createMockState } from "../../app/mockState";
import {
  getCountyGrandTotal
} from "../calculations";
import {
  countyGrandTotalForState,
  countyGrandTotalForCounty,
} from "./matchers";

describe("calculations", () => {
  describe("county grand totals", () => {
    it("calculates the county-based grand totals for a state", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const grandTotal = getCountyGrandTotal(state);
      expect(grandTotal).toEqual(countyGrandTotalForState);
    });
    it("calculates the county-based grand totals for a county", () => {
      const state = createMockState({
        date: "2020-03-19",
        state: "03",
        county: "03002"
      });
      const grandTotal = getCountyGrandTotal(state);
      expect(grandTotal).toEqual(countyGrandTotalForCounty);
    });
  });
});
