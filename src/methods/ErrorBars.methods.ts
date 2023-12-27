/* eslint-disable max-lines-per-function */
import { Visual } from "../visual";
import { select } from "d3-selection";
import { area } from "d3";
import { ILollipopChartRow } from "../model";
import { EFontStyle, EHighContrastColorType, ELineType } from "../enum";

export const getErrorBarLine = (self: Visual, width: number, height: number) => {
    width = width === 1 ? 1 : width / 2 + 0.5;
    if (!self.isHorizontalChart) {
        return `M${width},${height}L-${width},${height}L-${width},0L${width},0Z`;
    }
}

export const RenderErrorBars = (self: Visual, errorBarsData: ILollipopChartRow[]) => {
    const { errorBars, errorLabels } = self.errorBarsSettings;

    self.errorBarsLinesG.selectAll("*").remove();

    const errorBarGSelection = self.errorBarsLinesG
        .selectAll(".errorBarG")
        .data(errorBarsData, (d: ILollipopChartRow, i) => d.boundsTotal + i);

    (errorBarGSelection as any).join(
        (enter) => {
            const errorBarG = enter.append("g")
                .attr("class", "errorBarG")
                // .attr("fill", errorBars.barColor)
                // .attr("stroke", errorBars.borderColor)
                // .attr("stroke-width", errorBars.borderSize)
                .each(function (d) {
                    const isValue2 = self.isHasMultiMeasure && self.errorBarsSettings.measurement.applySettingsToMeasure === self.measure2DisplayName;
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
                    }

                    if (!self.isHorizontalChart) {
                        height = Math.abs(self.getYPosition(value1) - self.getYPosition(value2));
                    }

                    select(this).datum({ ...d, height: height, errorBarValue1: value1, errorBarValue2: value2, });
                })
                .attr("transform", (d: any) => {
                    const value1 = d.errorBarValue1;
                    const value2 = d.errorBarValue2;

                    if ((value1 > 0 && value1 > value2) || (value1 < 0 && value1 < value2)) {
                        if (value1 > 0) {
                            return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value1)})`;
                        } else {
                            return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value1) - d.height})`;
                        }
                    } else {
                        if (value1 > 0) {
                            return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value2)})`;
                        } else {
                            return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value2) - d.height})`;
                        }
                    }
                });

            const barColor = errorBars.isMatchSeriesColor ? self.lineSettings.lineColor : errorBars.barColor;

            errorBarG
                .append("path")
                .attr("class", "errorBarLine")
                .attr("fill", barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .attr("d", function (d: any) {
                    return getErrorBarLine(self, errorBars.barWidth, d.height);
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("fill", barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .attr("transform", () => {
                    return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("fill", barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .attr("transform", (d: any) => {
                    return `translate(${-errorBars.markerSize / 2}, ${d.height - errorBars.markerSize / 2})`;
                });

            const errorBarUpperBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarUpperBoundLabelG");

            const errorBarUpperBoundLabel = errorBarUpperBoundLabelG.append("text")
                .text(d => d.labelUpperBoundValue)
                .attr("dy", "-0.5em")
                .attr("fill", errorLabels.color)
                .style("font-size", errorLabels.fontSize)
                .style("font-family", errorLabels.fontFamily)
                .style("font-weight", errorLabels.fontStyle.includes(EFontStyle.Bold) ? "bold" : "normal")
                .style("font-style", errorLabels.fontStyle.includes(EFontStyle.Italic) ? "italic" : "normal")
                .style("text-decoration", () => {
                    const referenceLineTextDecor: string[] = [];
                    if (errorLabels.fontStyle.includes(EFontStyle.UnderLine)) referenceLineTextDecor.push("underline");
                    return referenceLineTextDecor.length ? referenceLineTextDecor.join(" ") : "";
                })
                .attr("text-anchor", "middle")
                .attr("opacity", errorLabels.isEnabled ? "1" : "0");

            select(errorBarUpperBoundLabel as any).node().clone(true)
                .lower()
                .attr("stroke", self.getColor(errorLabels.backgroundColor, EHighContrastColorType.Background))
                .attr("stroke-width", 3)
                .attr("stroke-linejoin", "round")
                .attr("opacity", errorLabels.showBackground ? "1" : "0");

            const errorBarLowerBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarLowerBoundLabelG");

            errorBarLowerBoundLabelG.append("text")
                .text(d => d.labelLowerBoundValue)
                .attr("dy", "0.15em")
                .attr("fill", errorLabels.color)
                .style("font-size", errorLabels.fontSize)
                .style("font-family", errorLabels.fontFamily)
                .style("font-weight", errorLabels.fontStyle.includes(EFontStyle.Bold) ? "bold" : "normal")
                .style("font-style", errorLabels.fontStyle.includes(EFontStyle.Italic) ? "italic" : "normal")
                .style("text-decoration", () => {
                    const referenceLineTextDecor: string[] = [];
                    if (errorLabels.fontStyle.includes(EFontStyle.UnderLine)) referenceLineTextDecor.push("underline");
                    return referenceLineTextDecor.length ? referenceLineTextDecor.join(" ") : "";
                })
                .attr("text-anchor", "middle")
                .attr("opacity", errorLabels.isEnabled ? "1" : "0")
                .attr("transform", (d: any) => {
                    return `translate(${0}, ${d.height + errorLabels.fontSize})`;
                });

            select(errorBarLowerBoundLabelG as any).node().clone(true)
                .lower()
                .attr("stroke", self.getColor(errorLabels.backgroundColor, EHighContrastColorType.Background))
                .attr("stroke-width", 3)
                .attr("stroke-linejoin", "round")
                .attr("opacity", errorLabels.showBackground ? "1" : "0");

            return errorBarG;
        }
    );
}

export const RenderErrorBand = (self: Visual, errorBarsData: ILollipopChartRow[]): void => {
    const { errorBand } = self.errorBarsSettings;

    self.errorBarsAreaPath
        .datum(errorBarsData)
        .classed(errorBand.lineStyle, true)
        .attr("fill", errorBand.fillColor)
        .attr("stroke", errorBand.lineColor)
        .attr("stroke-width", 1.5)
        .attr(
            "stroke-dasharray",
            errorBand.lineStyle === ELineType.Dotted
                ? `0, ${6} `
                : `${4}, ${4}`
        );

    if (self.isHorizontalChart) {
        self.errorBarsAreaPath
            .attr(
                "d",
                area()
                    .y((d: any) => self.getYPosition(d.category) + self.scaleBandWidth / 2)
                    .x0((d: any) => self.getXPosition(d.lowerBoundValue ? d.lowerBoundValue : d.value))
                    .x1((d: any) => self.getXPosition(d.upperBoundValue ? d.upperBoundValue : d.value))
            );
    } else {
        self.errorBarsAreaPath
            .attr(
                "d",
                area()
                    .x((d: any) => self.getXPosition(d.category) + self.scaleBandWidth / 2)
                    .y0((d: any) => self.getYPosition(d.lowerBoundValue ? d.lowerBoundValue : d.value))
                    .y1((d: any) => self.getYPosition(d.upperBoundValue ? d.upperBoundValue : d.value))
            );
    }
}
