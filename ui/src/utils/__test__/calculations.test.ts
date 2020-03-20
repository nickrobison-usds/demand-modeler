import { createMockState } from "../../app/mockState";
import { getTopCounties } from "../calculations";
import { top10ConfirmedByState } from "./matchers";

describe("calculations", () => {
  describe("top 10 calculations in state", () => {
    it("should return chart data for the top 10 counties (confirmed)", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const top10 = getTopCounties(state, "confirmed");
      expect(top10.length).toEqual(10);
      expect(top10).toEqual(top10ConfirmedByState);
    });
    // it("should return chart data for the top 5 counties (confirmed)", () => {
    //   const state = createMockState({ date: "2020-03-19", state: "03" });
    //   const top10 = getTopCounties(state, "confirmed", 5);
    //   expect(top10).toEqual(null);
    // });
    // it("should return chart data for the top 10 counties (dead)", () => {
    //   const state = createMockState({ date: "2020-03-19", state: "03" });
    //   const top10 = getTopCounties(state, "dead");
    //   expect(top10).toEqual(null);
    // });
    // it("should return chart data for the top 5 counties (dead)", () => {
    //   const state = createMockState({ date: "2020-03-19", state: "03" });
    //   const top10 = getTopCounties(state, "dead", 5);
    //   expect(top10).toEqual(null.slice(0, 5));
    // });
  });
});
