import React from "react";
import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../app/AppStore";
import { monthDayCommaYear, yearMonthDayDot } from "../utils/DateUtils";
import { addTitleSlide } from "./PowerPointGenerator/Slides/Templates/TitleSlides/TitleSlide";
import { addStateLineGraphs } from "./PowerPointGenerator/Slides/StateLineGraphs";
import {
  addCBSAStackedBarSlides,
  addMultiCBSAStackedBarSlides,
} from "./PowerPointGenerator/Slides/CBSASlides/CBSAStackedBars";
import { addCBSATop25 } from "./PowerPointGenerator/Slides/CBSASlides/Top25CBSALineGraph";
import { addCBSAPopulationOver500k } from "./PowerPointGenerator/Slides/CBSASlides/CBSAPopulationOver500k";

export interface ReportContainerProps {
  states: State[];
  weeklyTimeSeries: CovidDateData;
  historicalTimeSeries: CovidDateData;
}

export const ReportContainer: React.FC<ReportContainerProps> = (props) => {
  const exportPowerPoint = async () => {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const ppt = new pptxgen();
    ppt.layout = "LAYOUT_16x9";
    ppt.company = "United States Digital Service";
    // Generate the title slide
    addTitleSlide(
      ppt,
      "Case Data by State and Metropolitan Area",
      `Data as of ${monthDayCommaYear(new Date())}`,
      `Source of case & mortality data: Conference of State Bank Supervisors and USAFacts.org, as of ${monthDayCommaYear(
        new Date()
      )}`,
      `Data sourced from state health departments and news reports; reporting may be incomplete and delayed`
    );
    // addTopTenStates(ppt, props.states, props.weeklyTimeSeries)

    addStateLineGraphs(ppt, props.historicalTimeSeries.states);

    const counties = props.historicalTimeSeries.counties;
    addCBSATop25(ppt, counties);
    addCBSAStackedBarSlides(ppt, counties);
    addMultiCBSAStackedBarSlides(ppt, counties);
    addCBSAPopulationOver500k(ppt, counties);

    console.debug("Writing PPTX");
    const done = await ppt.writeFile(
      `${yearMonthDayDot(
        new Date()
      )} State line graphs and metropolitan areas.pptx`
    );
    console.debug("Finished exporting: ", done);
  };
  return (
    <div>
      <button className="usa-button" onClick={exportPowerPoint}>
        Export
      </button>
      <>{props.children}</>
      <canvas />
    </div>
  );
};

// // Add the map
// let map = document.getElementsByClassName("mapboxgl-map").item(0);
//
// console.debug("Map element: ", map);
//
// const url = await domtoimage.toPng(map!);
// console.debug("Map URL: ", url);
// const mapSlide = ppt.addSlide();
// mapSlide.addImage({
//     data: url,
//     // These positioning values are hard coded based on manual viewing and aligning of the graphs.
//     h: 5.6,
//     w: 5.6,
//     x: 1.9
// });
//
//
// const svgElements = document.getElementsByClassName("report-chart");
// for (let element of svgElements[Symbol.iterator]()) {
//
//     const url = await domtoimage.toPng(element, {
//         // height: 880,
//         // width: 1242
//     });
//     const s = ppt.addSlide();
//     s.addImage({
//         data: url,
//         // These positioning values are hard coded based on manual viewing and aligning of the graphs.
//         h: 5.6,
//         w: 5.6,
//         x: 1.9
//     });
// }
