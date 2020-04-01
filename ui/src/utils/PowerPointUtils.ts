import pptxgen from "pptxgenjs";

export const buildPaddedArray = (data: Array<any>, index: number, size: number) => {
    let paddedArray: Array<any> = [];

    // For each section of data (the clustered groups)
    for ( let i = 0; i < data.length; i++ ) {
        // For each set of data within a cluster
        for ( let k = 0; k < size; k++ ) {
            // Add the real data if we're at the correct spot in the chart data, otherwise put a null to pad it
            paddedArray.push(k === index ? data[i] : null);

            // Add an extra space at the end of a cluster to simulate a divide in clustered groups
            // Also, don't do this for the last cluster
            if ( k === size - 1 && i !== data.length - 1 ) {
                paddedArray.push(null);
            }
        }
    }

    return paddedArray;
};

export const buildStackSection = (name: string, labels: Array<string>, data: Array<any>, index: number, size: number) => {
    return {
        name,
        labels: buildPaddedArray(labels, index, size),
        values: buildPaddedArray(data, index, size)
    };
};

export const buildClusteredStack = (barLabels: Array<string>, stackLabels: Array<string>, clusterLabels: Array<string>, stackData: Array<Array<Array<number>>>) => {
    return barLabels.flatMap((barLabel: string, barIndex: number) => {
        return stackLabels.map((stackLabel: string, stackIndex: number) => {
            return buildStackSection(
                stackLabel + ' - ' + barLabel,
                clusterLabels,
                stackData[stackIndex][barIndex],
                barIndex,
                barLabels.length
            );
        });
    });
};

export const addClusteredStackedChart = (slide: pptxgen.ISlide, data: Array<object>, options: object) => {
    slide.addChart(
        pptxgen.CHART_TYPE.BAR,
        data,
        {
            barGrouping: 'stacked',
            barGapWidthPct: 20,
            ...options
        }
    );
};