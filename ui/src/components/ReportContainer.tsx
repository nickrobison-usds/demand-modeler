import React from "react";
import pptxgen from "pptxgenjs";
import domtoimage from "dom-to-image";

export const ReportContainer: React.FC = props => {

    const exportToSVG = (element: Node): string => {
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(element);

        //add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        //convert svg source to URI data scheme.
        return "data:image/svg+xml;base64," + window.btoa(source);

    };

    // const setupCanvas = () => {
    //
    //     // Get the device pixel ratio, falling back to 1.
    //     var dpr = window.devicePixelRatio || 1;
    //     // Get the size of the canvas in CSS pixels.
    //     var rect = canvas.getBoundingClientRect();
    //     // Give the canvas pixel dimensions of their CSS
    //     // size * the device pixel ratio.
    //     canvas.width = rect.width * dpr;
    //     canvas.height = rect.height * dpr;
    //     var ctx = canvas.getContext('2d');
    //     // Scale all drawing operations by the dpr, so you
    //     // don't have to worry about the difference.
    //     ctx.scale(dpr, dpr);
    //     return ctx;
    // };

    const exportPowerPoint = async () => {

        // noinspection JSPotentiallyInvalidConstructorUsage
        const ppt = new pptxgen();
        ppt.layout = "LAYOUT_16x9";
        ppt.company = "United States Digital Service";
        const slide = ppt.addSlide();
        slide.addText("Hello, from PowerPoint");

        const svgElements = document.getElementsByClassName("recharts-wrapper");
        for (let element of svgElements[Symbol.iterator]()) {

            const url = await domtoimage.toPng(element);
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