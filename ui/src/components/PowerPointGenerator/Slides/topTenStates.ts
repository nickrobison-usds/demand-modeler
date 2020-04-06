import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../../../app/AppStore";
import * as PowerPointUtils from "../utils";
import * as _ from "lodash";
import * as FipUtils from "../../../utils/fips";

export const addTopTenStates = (
    ppt: pptxgen,
    states: State[],
    timeSeries: CovidDateData
  ) => {
    // Do the state things
    const s = ppt.addSlide();
  
    const names = states.map(s => s.ID);
    console.debug(
      "States",
      states.map(s => s.ID)
    );
    console.debug("Names", names);
  
    // Can we create a chart?
  
    // Split by state ID
    // const topStates =
    // .
    // filter(s => names.has(s.ID));
  
    // console.debug("Tops: ", topStates);
    const ts = states.map(s => s.ID).flatMap(i => timeSeries.states[i]);
    console.debug("top states");
  
    const grouped = _.chain(ts)
      .sortBy(["Reported"])
      .groupBy("Reported")
      .value();
  
    // const grouped = _.chain(fil)
    //     .sortBy(["Reported"])
    //     .groupBy(["Reported"])
    //     .value();
    console.debug("Grouped", grouped);
  
    const groupedEntries = Object.entries(grouped);
    const dataCombined = PowerPointUtils.buildClusteredStack(
      // The date labels
      groupedEntries.map(entry => entry[0]),
      ["Confirmed", "Deaths"],
      groupedEntries.length > 0
        ? groupedEntries[0][1].map(e => FipUtils.getStateName(e.ID))
        : [],
      [
        groupedEntries.map(entry => entry[1].map(e => e.Confirmed)),
        groupedEntries.map(entry => entry[1].map(e => e.Dead))
      ]
    );
  
    console.debug("Data Combined:", dataCombined);
  
    PowerPointUtils.addClusteredStackedChart(ppt, s, dataCombined, {
      x: 1,
      y: 1,
      w: 8,
      h: 4
    });
  };