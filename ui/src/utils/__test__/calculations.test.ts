import { createMockState } from "../../app/mockState";
import {
  getTopCounties,
  getTopStates,
  getCountyGrandTotal
} from "../calculations";
import {
  top10ConfirmedByState,
  top10DeadByState,
  top10Overall,
  top10DeadOverall,
  top10StatesConfirmed,
  countyGrandTotalForState,
  countyGrandTotalForCounty
} from "./matchers";

describe("calculations", () => {
  describe("top 10 counties in state", () => {
    it("should return top 10 counties in state (confirmed)", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const top10 = getTopCounties(state, "confirmed");
      expect(top10.length).toEqual(10);
      expect(top10).toEqual(top10ConfirmedByState);
    });
    it("should return top 5 counties in state (confirmed)", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const top10 = getTopCounties(state, "confirmed", 5);
      expect(top10).toEqual(top10ConfirmedByState.slice(0, 5));
    });
    it("should return top 10 counties in state (dead)", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const top10 = getTopCounties(state, "dead");
      expect(top10).toEqual(top10DeadByState);
    });
    it("should return top 5 counties in state (dead)", () => {
      const state = createMockState({ date: "2020-03-19", state: "03" });
      const top10 = getTopCounties(state, "dead", 5);
      expect(top10).toEqual(top10DeadByState.slice(0, 5));
    });
  });
  describe("top 10 counties overall", () => {
    it("should return top 10 counties overall (confirmed)", () => {
      const state = createMockState({ date: "2020-03-19" });
      const top10 = getTopCounties(state, "confirmed");
      expect(top10).toEqual(top10Overall);
    });
    it("should return top 10 counties overall (dead)", () => {
      const state = createMockState({ date: "2020-03-19" });
      const top10 = getTopCounties(state, "dead");
      expect(top10).toEqual(top10DeadOverall);
    });
  });
  describe("top 10 counties in state", () => {
    it("should get the top 10 states (confirmed)", () => {
      const state = createMockState({ date: "2020-03-19" });
      const top10 = getTopStates(state, "confirmed");
      expect(top10).toEqual(top10StatesConfirmed);
    });
    it("should get the top 10 states (dead)", () => {
      const state = createMockState({ date: "2020-03-19" });
      const top10 = getTopStates(state, "dead");
      expect(top10).toEqual(top10StatesConfirmed);
    });
  });

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
