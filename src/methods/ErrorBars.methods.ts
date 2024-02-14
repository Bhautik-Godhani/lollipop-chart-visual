/* eslint-disable max-lines-per-function */
import { Visual } from "../visual";
import { select } from "d3-selection";
import { area, max, min } from "d3";
import { ILollipopChartRow } from "../model";
import { EErrorBandFillTypes, EErrorBarsDirection, EFontStyle, EHighContrastColorType, ELineType } from "../enum";

export const getErrorBarLine = (self: Visual, width: number, height: number) => {
    width = width === 1 ? 1 : width / 2 + 0.5;
    return `M${width},${height}L-${width},${height}L-${width},0L${width},0Z`;
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
                    let width = 0;
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
                    } else {
                        width = Math.abs(self.getXPosition(value1) - self.getXPosition(value2));
                    }

                    select(this).datum({ ...d, width: width, height: height, errorBarValue1: value1, errorBarValue2: value2, });
                })
                .attr("transform", (d: any) => {
                    const value1 = self.isBottomXAxis ? min([d.errorBarValue1, d.errorBarValue2]) : max([d.errorBarValue1, d.errorBarValue2]);
                    const value2 = self.isBottomXAxis ? max([d.errorBarValue1, d.errorBarValue2]) : min([d.errorBarValue1, d.errorBarValue2]);

                    if (self.isHorizontalChart) {
                        if ((value1 > 0 && value1 > value2) || (value1 < 0 && value1 < value2)) {
                            if (self.isLeftYAxis ? value1 > 0 : value1 < 0) {
                                return `translate(${self.getXPosition(value1)}, ${self.getYPosition(d.category) + self.scaleBandWidth / 2}) rotate(90)`;
                            } else {
                                return `translate(${self.getXPosition(value1) + d.width}, ${self.getYPosition(d.category) + self.scaleBandWidth / 2}) rotate(90)`;
                            }
                        } else {
                            if (self.isLeftYAxis ? value1 > 0 : value1 < 0) {
                                return `translate(${self.getXPosition(value2)}, ${self.getYPosition(d.category) + self.scaleBandWidth / 2}) rotate(90)`;
                            } else {
                                return `translate(${self.getXPosition(value2) + d.width}, ${self.getYPosition(d.category) + self.scaleBandWidth / 2}) rotate(90)`;
                            }
                        }
                    } else {
                        if ((value1 > 0 && value1 > value2) || (value1 < 0 && value1 < value2)) {
                            if (self.isBottomXAxis ? value1 > 0 : value1 < 0) {
                                return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value1)}) rotate(0)`;
                            } else {
                                return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value1) - d.height}) rotate(0)`;
                            }
                        } else {
                            if (self.isBottomXAxis ? value1 > 0 : value1 < 0) {
                                return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value2)}) rotate(0)`;
                            } else {
                                return `translate(${self.getXPosition(d.category) + self.scaleBandWidth / 2}, ${self.getYPosition(value2) - d.height}) rotate(0)`;
                            }
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
                    if (self.isHorizontalChart) {
                        return getErrorBarLine(self, errorBars.barWidth, d.width);
                    } else {
                        return getErrorBarLine(self, errorBars.barWidth, d.height);
                    }
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("fill", barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .attr("transform", () => {
                    if (self.isHorizontalChart) {
                        return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                    } else {
                        return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                    }
                });

            errorBarG.append("use")
                .attr("width", errorBars.markerSize)
                .attr("height", errorBars.markerSize)
                .attr("href", `#${errorBars.markerShape}_MARKER`)
                .attr("fill", barColor)
                .attr("stroke", errorBars.borderColor)
                .attr("stroke-width", errorBars.borderSize)
                .attr("transform", (d: any) => {
                    if (self.isHorizontalChart) {
                        return `translate(${-errorBars.markerSize / 2}, ${d.width - errorBars.markerSize / 2})`;
                    } else {
                        return `translate(${-errorBars.markerSize / 2}, ${d.height - errorBars.markerSize / 2})`;
                    }
                });

            const errorBarUpperBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarUpperBoundLabelG");

            const errorBarUpperBoundLabel = errorBarUpperBoundLabelG.append("text")
                .text(d => {
                    if (self.isBottomXAxis || self.isLeftYAxis) {
                        return d.lowerBoundValue < d.upperBoundValue ? d.labelUpperBoundValue : d.labelLowerBoundValue;
                    } else {
                        return d.lowerBoundValue > d.upperBoundValue ? d.labelUpperBoundValue : d.labelLowerBoundValue;
                    }
                })
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
                .attr("opacity", errorLabels.isEnabled ? "1" : "0")
                .attr("display", d => {
                    if (self.isBottomXAxis || self.isLeftYAxis) {
                        return d.lowerBoundValue < d.upperBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                    } else {
                        return d.lowerBoundValue > d.upperBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                    }
                });

            select(errorBarUpperBoundLabel as any).node().clone(true)
                .lower()
                .attr("stroke", self.getColor(errorLabels.backgroundColor, EHighContrastColorType.Background))
                .attr("stroke-width", 3)
                .attr("stroke-linejoin", "round")
                .attr("opacity", errorLabels.showBackground ? "1" : "0");

            const errorBarLowerBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarLowerBoundLabelG");

            errorBarLowerBoundLabelG.append("text")
                .text(d => {
                    if (self.isBottomXAxis || self.isLeftYAxis) {
                        return d.upperBoundValue < d.lowerBoundValue ? d.labelUpperBoundValue : d.labelLowerBoundValue;
                    } else {
                        return d.upperBoundValue > d.lowerBoundValue ? d.labelUpperBoundValue : d.labelLowerBoundValue;
                    }
                })
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
                    if (self.isHorizontalChart) {
                        return `translate(${0}, ${d.width + errorLabels.fontSize})`;
                    } else {
                        return `translate(${0}, ${d.height + errorLabels.fontSize})`;
                    }
                })
                .attr("display", d => {
                    if (self.isBottomXAxis || self.isLeftYAxis) {
                        return d.upperBoundValue < d.lowerBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                    } else {
                        return d.upperBoundValue > d.lowerBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                    }
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
        .attr("class", errorBand.lineStyle)
        .attr("fill", errorBand.fillType !== EErrorBandFillTypes.Line ? errorBand.fillColor : "transparent")
        .attr("stroke", errorBand.lineColor)
        .attr("stroke-width", errorBand.fillType !== EErrorBandFillTypes.Fill ? 1.5 : 0)
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
                    .x0((d: any) => self.getXPosition(d.lowerBoundValue ? d.lowerBoundValue : 0))
                    .x1((d: any) => self.getXPosition(d.upperBoundValue ? d.upperBoundValue : 0))
            );
    } else {
        self.errorBarsAreaPath
            .attr(
                "d",
                area()
                    .x((d: any) => self.getXPosition(d.category) + self.scaleBandWidth / 2)
                    .y0((d: any) => self.getYPosition(d.lowerBoundValue ? d.lowerBoundValue : 0))
                    .y1((d: any) => self.getYPosition(d.upperBoundValue ? d.upperBoundValue : 0))
            );
    }
}
