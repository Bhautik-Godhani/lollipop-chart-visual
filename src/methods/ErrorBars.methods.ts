import { Visual } from "../visual";
import { select } from "d3-selection";
import { area } from "d3";
import { ILollipopChartRow } from "../model";

export const getErrorBarLine = (self: Visual, width: number, height: number) => {
    width = width === 1 ? 1 : width / 2 + 0.5;
    if (!self.isHorizontalChart) {
        return `M${width},${height}L-${width},${height}L-${width},0L${width},0Z`;
    }
}

export const RenderErrorBars = (self: Visual, errorBarsData: ILollipopChartRow[]) => {
    const { errorBars } = self.errorBarsSettings;

    self.errorBarsLinesG.selectAll("*").remove();

    const errorBarGSelection = self.errorBarsLinesG
        .selectAll(".errorBarG")
        .data(errorBarsData, (d: ILollipopChartRow, i) => d.boundsTotal + i);

    (errorBarGSelection as any).join(
        (enter) => {
            const errorBarG = enter.append("g")
                .attr("class", "errorBarG")
                .attr("fill", errorBars.barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .each(function (d) {
                    const isValue2 = self.errorBarsSettings.measurement.applySettingsToMeasure === self.measure2DisplayName;
                    let height = 0;
                    let value1 = 0;
                    let value2 = 0;

                    if (self.isHasErrorUpperBounds && self.isHasErrorLowerBounds) {
                        value1 = d.upperBoundValue;
                    } else {
                        value1 = isValue2 ? d.value2 : d.value1;
                    }

                    if (self.isHasErrorUpperBounds && !self.isHasErrorLowerBounds) {
                        value2 = d.upperBoundValue;
                    } else if (!self.isHasErrorUpperBounds && self.isHasErrorLowerBounds) {
                        value2 = d.lowerBoundValue;
                    } else {
                        value2 = d.lowerBoundValue;
                    };

                    if (!self.isHorizontalChart) {
                        height = Math.abs(self.yScale(value1) - self.yScale(value2));
                    }

                    select(this).datum({ ...d, height: height, errorBarValue1: value1, errorBarValue2: value2, });
                })
                .attr("transform", (d: any) => {
                    let value1 = d.errorBarValue1;
                    let value2 = d.errorBarValue2;

                    if ((value1 > 0 && value1 > value2) || (value1 < 0 && value1 < value2)) {
                        if (value1 > 0) {
                            return `translate(${self.xScale(d.category) + self.scaleBandWidth / 2}, ${self.yScale(value1)})`;
                        } else {
                            return `translate(${self.xScale(d.category) + self.scaleBandWidth / 2}, ${self.yScale(value1) - d.height})`;
                        }
                    } else {
                        if (value1 > 0) {
                            return `translate(${self.xScale(d.category) + self.scaleBandWidth / 2}, ${self.yScale(value2)})`;
                        } else {
                            return `translate(${self.xScale(d.category) + self.scaleBandWidth / 2}, ${self.yScale(value2) - d.height})`;
                        }
                    }
                });

            const errorBar = errorBarG
                .append("path")
                .attr("class", "errorBarLine")
                .attr("d", function (d: any) {
                    return getErrorBarLine(self, errorBars.barWidth, d.height);
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("transform", () => {
                    return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("transform", (d: any) => {
                    return `translate(${-errorBars.markerSize / 2}, ${d.height - errorBars.markerSize / 2})`;
                });
            return errorBarG;
        }
    );
}

export const RenderErrorBand = (self: Visual, errorBarsData: ILollipopChartRow[]): void => {
    self.errorBarsAreaPath
        .datum(errorBarsData)
        .attr("fill", self.errorBarsSettings.errorBand.fillColor)
        .attr("stroke", self.errorBarsSettings.errorBand.fillColor)
        .attr("stroke-width", 1.5);

    if (self.isHorizontalChart) {
        self.errorBarsAreaPath
            .attr(
                "d",
                area()
                    .y((d: any) => self.yScale(d.category) + self.scaleBandWidth / 2)
                    .x0((d: any) => self.xScale(d.lowerBoundValue ?? d.value))
                    .x1((d: any) => self.xScale(d.upperBoundValue ?? d.value))
            );
    } else {
        self.errorBarsAreaPath
            .attr(
                "d",
                area()
                    .x((d: any) => self.xScale(d.category) + self.scaleBandWidth / 2)
                    .y0((d: any) => self.yScale(d.lowerBoundValue ?? d.value))
                    .y1((d: any) => self.yScale(d.upperBoundValue ?? d.value))
            );
    }
}