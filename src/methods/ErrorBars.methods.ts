/* eslint-disable max-lines-per-function */
import { Visual } from "../visual";
import { select } from "d3-selection";
import { area, easeLinear, max, min } from "d3";
import { ILollipopChartRow } from "../model";
import { EErrorBandFillTypes, EErrorBarsDirection, EFontStyle, EHighContrastColorType, ELineType } from "../enum";

type D3Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export const getErrorBarLine = (self: Visual, width: number, height: number) => {
    width = width === 1 ? 1 : width / 2 + 0.5;
    return `M${width},${height}L-${width},${height}L-${width},0L${width},0Z`;
}

export const RenderErrorBars = (self: Visual, errorBarsData: ILollipopChartRow[], isValue2: boolean) => {
    const { errorBars, errorLabels } = self.errorBarsSettings;
    const isBottomXAxis = (self.isBottomXAxis && !self.yAxisSettings.isInvertRange) || (!self.isBottomXAxis && self.yAxisSettings.isInvertRange);
    const isLeftYAxis = (self.isLeftYAxis && !self.xAxisSettings.isInvertRange) || (!self.isLeftYAxis && self.xAxisSettings.isInvertRange);

    const errorBarGSelection = self.errorBarsLinesG
        .selectAll(isValue2 ? ".errorBar2G" : ".errorBar1G")
        .data(errorBarsData, (d: ILollipopChartRow) => d.uid);

    const getErrorBarParam = (d): { width: number, height: number, errorBarValue1: number, errorBarValue2: number } => {
        const errorBarValue = d.errorBar;
        const isValue2 = self.isHasMultiMeasure && self.errorBarsSettings.measurement.applySettingsToMeasure === self.measure2DisplayName;
        let width = 0;
        let height = 0;
        let value1 = 0;
        let value2 = 0;

        if (self.isHasErrorUpperBounds && self.isHasErrorLowerBounds) {
            value1 = errorBarValue.upperBoundValue;
        } else {
            value1 = isValue2 ? d.value2 : d.value1;
        }

        if (self.isHasErrorUpperBounds && !self.isHasErrorLowerBounds) {
            value2 = errorBarValue.upperBoundValue;
        } else if (!self.isHasErrorUpperBounds && self.isHasErrorLowerBounds) {
            value2 = errorBarValue.lowerBoundValue;
        } else {
            value2 = errorBarValue.lowerBoundValue;
        }

        if (!self.isHorizontalChart) {
            height = Math.abs(self.getYPosition(value1) - self.getYPosition(value2));
        } else {
            width = Math.abs(self.getXPosition(value1) - self.getXPosition(value2));
        }

        return { width, height, errorBarValue1: value1, errorBarValue2: value2 }
    }

    const getTransformParam = (d): { transX, transY, rotate } => {
        const value1 = isBottomXAxis ? min([d.errorBarValue1, d.errorBarValue2]) : max([d.errorBarValue1, d.errorBarValue2]);
        const value2 = isBottomXAxis ? max([d.errorBarValue1, d.errorBarValue2]) : min([d.errorBarValue1, d.errorBarValue2]);

        let transX = 0;
        let transY = 0;
        let rotate = 0;

        if (self.isHorizontalChart) {
            if ((value1 > 0 && value1 > value2) || (value1 <= 0 && value1 < value2)) {
                if (isLeftYAxis ? value1 > 0 : value1 <= 0) {
                    transX = self.getXPosition(value1);
                    transY = self.getYPosition(d.category) + self.scaleBandWidth / 2;
                    rotate = 90;
                } else {
                    transX = self.getXPosition(value1) + d.width;
                    transY = self.getYPosition(d.category) + self.scaleBandWidth / 2;
                    rotate = 90;
                }
            } else {
                if (isLeftYAxis ? value1 > 0 : value1 <= 0) {
                    transX = self.getXPosition(value2);
                    transY = self.getYPosition(d.category) + self.scaleBandWidth / 2;
                    rotate = 90;
                } else {
                    transX = self.getXPosition(value2) + d.width;
                    transY = self.getYPosition(d.category) + self.scaleBandWidth / 2;
                    rotate = 90;
                }
            }
        } else {
            if ((value1 > 0 && value1 > value2) || (value1 <= 0 && value1 < value2)) {
                if (isBottomXAxis ? value1 > 0 : value1 <= 0) {
                    transX = self.getXPosition(d.category) + self.scaleBandWidth / 2;
                    transY = self.getYPosition(value1);
                    rotate = 0;
                } else {
                    transX = self.getXPosition(d.category) + self.scaleBandWidth / 2;
                    transY = self.getYPosition(value1) - d.height;
                    rotate = 0;
                }
            } else {
                if (isBottomXAxis ? value1 > 0 : value1 <= 0) {
                    transX = self.getXPosition(d.category) + self.scaleBandWidth / 2;
                    transY = self.getYPosition(value2);
                    rotate = 0;
                } else {
                    transX = self.getXPosition(d.category) + self.scaleBandWidth / 2;
                    transY = self.getYPosition(value2) - d.height;
                    rotate = 0;
                }
            }
        }

        return { transX, transY, rotate };
    }

    const formattingErrorBar = (
        isEnter: boolean,
        errorBarG: D3Selection<SVGElement>,
        errorBarLine: D3Selection<SVGElement>,
        markerUse1: D3Selection<SVGElement>,
        markerUse2: D3Selection<SVGElement>,
        errorBarUpperBoundLabelG: D3Selection<SVGElement>,
        errorBarUpperBoundLabel: D3Selection<SVGElement>,
        errorBarLowerBoundLabelG: D3Selection<SVGElement>,
        errorBarLowerBoundLabel: D3Selection<SVGElement>) => {
        const barColor = errorBars.isMatchSeriesColor ? self.lineSettings.lineColor : errorBars.barColor;

        errorBarLine
            .attr("fill", d => {
                const lineColor = self.lineSettings.isApplyMarkerColor ? self.categoryColorPair[d.category].marker1Color : self.lineSettings.lineColor;
                let seriesMatchColor;
                if (self.isLollipopTypeCircle) {
                    seriesMatchColor = self.getColor(self.categoryColorPair[d.category] && self.categoryColorPair[d.category].lineColor ? self.categoryColorPair[d.category].lineColor : lineColor, EHighContrastColorType.Foreground);
                } else {
                    if (self.firstCFLine) {
                        const str = `${d.category}-${self.firstCFLine.staticValue}`;
                        seriesMatchColor = self.getColor(self.subCategoryColorPair[str] && self.subCategoryColorPair[str].lineColor ? self.subCategoryColorPair[str].lineColor : lineColor, EHighContrastColorType.Foreground);
                    } else {
                        seriesMatchColor = self.getColor(self.categoryColorPair[d.category] && self.categoryColorPair[d.category].lineColor ? self.categoryColorPair[d.category].lineColor : lineColor, EHighContrastColorType.Foreground);
                    }
                }
                return errorBars.isMatchSeriesColor ? seriesMatchColor : errorBars.barColor;
            })
            .attr("stroke", errorBars.borderColor)
            .attr("stroke-width", errorBars.isBorderEnabled ? errorBars.borderSize : 0)
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("d", function (d: any) {
                if (self.isHorizontalChart) {
                    return getErrorBarLine(self, errorBars.barWidth, d.width);
                } else {
                    return getErrorBarLine(self, errorBars.barWidth, d.height);
                }
            });

        markerUse1
            .attr("width", errorBars.markerSize)
            .attr("height", errorBars.markerSize)
            .attr("href", `#${errorBars.markerShape}_MARKER`)
            .attr("fill", barColor)
            .attr("stroke", errorBars.borderColor)
            .attr("stroke-width", errorBars.isBorderEnabled ? errorBars.borderSize : 0)
            .attr("opacity", self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "0" : "1")
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", () => {
                if (self.isHorizontalChart) {
                    return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                } else {
                    return `translate(${-errorBars.markerSize / 2}, ${-errorBars.markerSize / 2})`;
                }
            });

        markerUse2
            .attr("width", errorBars.markerSize)
            .attr("height", errorBars.markerSize)
            .attr("href", `#${errorBars.markerShape}_MARKER`)
            .attr("fill", barColor)
            .attr("stroke", errorBars.borderColor)
            .attr("stroke-width", errorBars.isBorderEnabled ? errorBars.borderSize : 0)
            .attr("opacity", self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "0" : "1")
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", (d: any) => {
                if (self.isHorizontalChart) {
                    return `translate(${-errorBars.markerSize / 2}, ${d.width - errorBars.markerSize / 2})`;
                } else {
                    return `translate(${-errorBars.markerSize / 2}, ${d.height - errorBars.markerSize / 2})`;
                }
            });

        const getErrorBarUpperBoundLabel = (d: ILollipopChartRow) => {
            if (isBottomXAxis || isLeftYAxis) {
                return d.errorBar.lowerBoundValue < d.errorBar.upperBoundValue ? d.errorBar.labelUpperBoundValue : d.errorBar.labelLowerBoundValue;
            } else {
                return d.errorBar.lowerBoundValue > d.errorBar.upperBoundValue ? d.errorBar.labelUpperBoundValue : d.errorBar.labelLowerBoundValue;
            }
        }

        errorBarUpperBoundLabel
            .text((d: ILollipopChartRow) => getErrorBarUpperBoundLabel(d))
            // .attr("dy", "0.15em")
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
                if (isBottomXAxis || isLeftYAxis) {
                    return d.errorBar.lowerBoundValue < d.errorBar.upperBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                } else {
                    return d.errorBar.lowerBoundValue > d.errorBar.upperBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                }
            });

        errorBarUpperBoundLabelG
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", (d: any) => {
                if (self.isHorizontalChart) {
                    if (d.transX >= errorBars.markerSize) {
                        return `translate(${0}, ${errorBars.markerSize})`;
                    } else {
                        return `translate(${0}, ${-errorBars.markerSize})`;
                    }
                } else {
                    const y = d.transY;
                    if (y <= errorBars.markerSize) {
                        return `translate(${0}, ${errorBars.markerSize})`;
                    } else {
                        return `translate(${0}, ${-errorBars.markerSize})`;
                    }
                }
            })

        let errorBarUpperBoundLabelShadow = errorBarUpperBoundLabelG.select(".errorBarUpperBoundLabelShadow");
        if (errorLabels.isEnabled && errorLabels.isEnabled) {
            if (!errorBarUpperBoundLabelShadow.node()) {
                errorBarUpperBoundLabelShadow = errorBarUpperBoundLabel.clone(true);
                errorBarUpperBoundLabelShadow.lower();
            }

            errorBarUpperBoundLabelShadow
                .transition()
                .duration(self.tickDuration)
                .ease(easeLinear)
                .text((d: ILollipopChartRow) => getErrorBarUpperBoundLabel(d))
                .attr("class", "errorBarUpperBoundLabelShadow")
                .attr("stroke", self.getColor(errorLabels.backgroundColor, EHighContrastColorType.Background))
                .attr("stroke-width", 3)
                .attr("stroke-linejoin", "round")
                .attr("opacity", errorLabels.showBackground ? "1" : "0");
        }

        const getErrorBarLowerBoundLabel = (d: ILollipopChartRow) => {
            if (isBottomXAxis || isLeftYAxis) {
                return d.errorBar.upperBoundValue < d.errorBar.lowerBoundValue ? d.errorBar.labelUpperBoundValue : d.errorBar.labelLowerBoundValue;
            } else {
                return d.errorBar.upperBoundValue > d.errorBar.lowerBoundValue ? d.errorBar.labelUpperBoundValue : d.errorBar.labelLowerBoundValue;
            }
        }

        errorBarLowerBoundLabel
            .text(d => getErrorBarLowerBoundLabel(d))
            .attr("dy", "0.7em")
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
                if (isBottomXAxis || isLeftYAxis) {
                    return d.errorBar.upperBoundValue < d.errorBar.lowerBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                } else {
                    return d.errorBar.upperBoundValue > d.errorBar.lowerBoundValue ? self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Minus ? "none" : "block" : self.errorBarsSettings.measurement.direction === EErrorBarsDirection.Plus ? "none" : "block";
                }
            });

        errorBarLowerBoundLabelG
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", (d: any) => {
                if (self.isHorizontalChart) {
                    if ((d.transX - d.width) <= errorBars.markerSize) {
                        return `translate(${0}, ${d.width - errorBars.markerSize})`;
                    } else {
                        return `translate(${0}, ${d.width + errorBars.markerSize})`;
                    }
                } else {
                    const y = d.transY + d.height + errorBars.markerSize;
                    if (y >= self.height) {
                        return `translate(${0}, ${d.height - errorBars.markerSize})`;
                    } else {
                        return `translate(${0}, ${d.height + errorBars.markerSize})`;
                    }

                }
            })


        let errorBarLowerBoundLabelShadow = errorBarLowerBoundLabelG.select(".errorBarLowerBoundLabelShadow");
        if (errorBars.isEnabled && errorLabels.isEnabled) {
            if (!errorBarLowerBoundLabelShadow.node()) {
                errorBarLowerBoundLabelShadow = errorBarLowerBoundLabel.clone(true);
                errorBarLowerBoundLabelShadow.lower();
            }

            errorBarLowerBoundLabelShadow
                .transition()
                .duration(self.tickDuration)
                .ease(easeLinear)
                .text(d => getErrorBarLowerBoundLabel(d))
                .attr("class", "errorBarLowerBoundLabelShadow")
                .attr("stroke", self.getColor(errorLabels.backgroundColor, EHighContrastColorType.Background))
                .attr("stroke-width", 3)
                .attr("stroke-linejoin", "round")
                .attr("opacity", errorLabels.isEnabled && errorLabels.showBackground ? "1" : "0");
        }
    }

    (errorBarGSelection as any).join(
        (enter) => {
            const errorBarG = enter.append("g")
                .attr("class", isValue2 ? "errorBar2G" : "errorBar1G")
                .each(function (d: ILollipopChartRow) {
                    select(this).datum({ ...d, errorBar: isValue2 ? d.errorBar2 : d.errorBar1 });
                })
                .each(function (d: ILollipopChartRow) {
                    const { width, height, errorBarValue1, errorBarValue2 } = getErrorBarParam(d);
                    select(this).datum({ ...d, width: width, height: height, errorBarValue1, errorBarValue2, });
                })
                .attr("transform", function (d) {
                    const { transX, transY, rotate } = getTransformParam(d);

                    select(this).datum({ ...d, transX, transY, rotate });

                    return `translate(${transX}, ${transY}) rotate(${rotate})`;
                });

            const errorBarLine = errorBarG
                .append("path")
                .attr("class", "errorBarLine");

            const markerUse1 = errorBarG.append("use")
                .attr("class", "markerUse1");

            const markerUse2 = errorBarG.append("use")
                .attr("class", "markerUse2");

            const errorBarUpperBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarUpperBoundLabelG");

            const errorBarUpperBoundLabel = errorBarUpperBoundLabelG.append("text")
                .attr("class", "errorBarUpperBoundLabel");

            const errorBarLowerBoundLabelG = errorBarG.append("g")
                .attr("class", "errorBarLowerBoundLabelG");

            const errorBarLowerBoundLabel = errorBarLowerBoundLabelG.append("text")
                .attr("class", "errorBarLowerBoundLabel");

            formattingErrorBar(false, errorBarG, errorBarLine, markerUse1, markerUse2, errorBarUpperBoundLabelG, errorBarUpperBoundLabel, errorBarLowerBoundLabelG, errorBarLowerBoundLabel);

            return errorBarG;
        },
        (update) => {
            const errorBarG = update
                .each(function (d: ILollipopChartRow) {
                    select(this).datum({ ...d, errorBar: isValue2 ? d.errorBar2 : d.errorBar1 });
                })
                .each(function (d: ILollipopChartRow) {
                    const { width, height, errorBarValue1, errorBarValue2 } = getErrorBarParam(d);
                    select(this).datum({ ...d, width: width, height: height, errorBarValue1, errorBarValue2, });
                })

            const errorBarLine = errorBarG.select(".errorBarLine");

            const markerUse1 = errorBarG.select(".markerUse1");

            const markerUse2 = errorBarG.select(".markerUse2");

            const errorBarUpperBoundLabelG = errorBarG.select(".errorBarUpperBoundLabelG");

            const errorBarUpperBoundLabel = errorBarUpperBoundLabelG.select(".errorBarUpperBoundLabel");

            const errorBarLowerBoundLabelG = errorBarG.select(".errorBarLowerBoundLabelG");

            const errorBarLowerBoundLabel = errorBarLowerBoundLabelG.select(".errorBarLowerBoundLabel");

            formattingErrorBar(true, errorBarG, errorBarLine, markerUse1, markerUse2, errorBarUpperBoundLabelG, errorBarUpperBoundLabel, errorBarLowerBoundLabelG, errorBarLowerBoundLabel);

            errorBarG
                .transition()
                .duration(self.tickDuration)
                .ease(easeLinear)
                .attr("transform", function (d) {
                    const { transX, transY, rotate } = getTransformParam(d);

                    select(this).datum({ ...d, transX, transY, rotate });

                    return `translate(${transX}, ${transY}) rotate(${rotate})`;
                });

            return update;
        }
    );
}

export const RenderErrorBand = (self: Visual, errorBarsData: ILollipopChartRow[], isBand2: boolean): void => {
    const { errorBand } = self.errorBarsSettings;

    const valueKey = isBand2 ? "errorBar2" : "errorBar1";

    const selection = self.errorBarsAreaG
        .selectAll(isBand2 ? ".errorBarsArea2" : ".errorBarsArea1")
        .data([errorBarsData]);

    const pathFormatting = (isEnter: boolean, path: D3Selection<SVGElement>) => {
        path
            .attr("class", errorBand.lineStyle)
            .classed(isBand2 ? "errorBarsArea2" : "errorBarsArea1", true)
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
            path
                .transition()
                .duration(isEnter ? 0 : self.tickDuration)
                .ease(easeLinear)
                .attr(
                    "d",
                    area()
                        .y((d: any) => self.getYPosition(d.category) + self.scaleBandWidth / 2)
                        .x0((d: any) => self.getXPosition(d[valueKey].lowerBoundValue ? d[valueKey].lowerBoundValue : 0))
                        .x1((d: any) => self.getXPosition(d[valueKey].upperBoundValue ? d[valueKey].upperBoundValue : 0))
                );
        } else {
            path
                .transition()
                .duration(isEnter ? 0 : self.tickDuration)
                .ease(easeLinear)
                .attr(
                    "d",
                    area()
                        .x((d: any) => self.getXPosition(d.category) + self.scaleBandWidth / 2)
                        .y0((d: any) => self.getYPosition(d[valueKey].lowerBoundValue ? d[valueKey].lowerBoundValue : 0))
                        .y1((d: any) => self.getYPosition(d[valueKey].upperBoundValue ? d[valueKey].upperBoundValue : 0))
                );
        }
    }

    selection.join(
        enter => {
            const path: any = enter
                .append("path")
                .datum(errorBarsData);

            pathFormatting(true, path);

            return path;
        },
        update => {
            const path: any = update
                .datum(errorBarsData);

            pathFormatting(false, path);

            return update;
        }
    )
}
