import React from "react";
import pptxgen from "pptxgenjs";
import domtoimage from "dom-to-image";

export const ReportContainer: React.FC = props => {

    const exportPowerPoint = async () => {

        // noinspection JSPotentiallyInvalidConstructorUsage
        const ppt = new pptxgen();
        ppt.layout = "LAYOUT_16x9";
        ppt.company = "United States Digital Service";
        const slide = ppt.addSlide();
        slide.addText("Hello, from PowerPoint");

        const svgElements = document.getElementsByClassName("report-chart");
        for (let element of svgElements[Symbol.iterator]()) {

            const url = await domtoimage.toPng(element, {
                // height: 880,
                // width: 1242
            });
            const s = ppt.addSlide();
            s.addImage({
                data: url,
                // These positioning values are hard coded based on manual viewing and aligning of the graphs.
                h: 5.6,
                w: 5.6,
                x: 1.9
            });
        }
        console.debug("Writing PPTX");
        const done = await ppt.writeFile("Sample Presentation.pptx");
        console.debug("Finished exporting: ", done);
    };
    return (
        <div>
            <button className="usa-button" onClick={exportPowerPoint}>Export</button>
            <>
                {props.children}
            </>
            <canvas/>
        </div>
    )
};