import { Visual } from "../visual";
import { select, Selection } from "d3-selection";
import { min as d3Min, max as d3Max, mean, median } from "d3-array";
import { EBeforeAfterPosition, EHighContrastColorType, ELCRPosition, ELineType, EReferenceLineComputation, EReferenceLineNameTypes, EReferenceLinesType, EReferenceLineType, EReferenceType, EXYAxisNames, Position } from "../enum";
import { scaleLinear } from "d3";
import crypto from "crypto";
import { IReferenceLineLabelStyleProps, IReferenceLineSettings, IReferenceLineValueProps } from "../visual-settings.interface";
import { calculateStandardDeviation } from "./methods";
import { GetFormattedNumber } from "./NumberFormat.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const generateSecureRandomBytes = (length) => {
    return crypto.randomBytes(length);
}

export const RenderReferenceLines = (self: Visual, referenceLinesData: IReferenceLineSettings[]): void => {
    const data = referenceLinesData.filter(
        (d) => d.line1Coord.x1 >= 0 && d.line1Coord.x2 >= 0 && d.line1Coord.y1 >= 0 && d.line1Coord.y2 >= 0 && d.labelCoord.textX1 >= 0 && d.labelCoord.textY1 >= 0
    );

    self.container.selectAll(".referenceLinesG").remove();

    if (data && data.length > 0) {
        data.forEach(d => {
            let referenceLinesG;

            if (d.lineStyle.linePlacement === EReferenceLineType.FRONT) {
                referenceLinesG = self.container.append("g").raise().datum(d).attr("class", "referenceLinesG");
            } else if (d.lineStyle.linePlacement === EReferenceLineType.BEHIND) {
                referenceLinesG = self.container.append("g").lower().datum(d).attr("class", "referenceLinesG");
            }

            const lines = referenceLinesG.append("line").attr("id", "referenceLine1").attr("class", "referenceLine");
            FormattingReferenceLines(self, lines, false);

            if (d && d.referenceType === EReferenceType.REFERENCE_BAND) {
                const lines = referenceLinesG.append("line").attr("id", "referenceLine2").attr("class", "referenceLine");
                FormattingReferenceLines(self, lines, true);
            }

            const texts = referenceLinesG.append("text").attr("class", "referenceLineText");

            if (d.labelStyle.show) {
                FormattingReferenceLineText(self, texts);
            } else {
                texts.attr("display", "none");
            }

            if (d && d.referenceType === EReferenceType.REFERENCE_BAND && d.bandStyle.isShowBackgroundColor) {
                const bandRect = referenceLinesG.append("rect").attr("class", "referenceBand");
                FormattingReferenceLineLayers(self, bandRect);
            }
        })
    }
}

export const FormattingReferenceLines = (self: Visual, lineSelection: D3Selection<SVGElement>, isLine2: boolean): void => {
    lineSelection
        .attr("class", (d: IReferenceLineSettings) => d.lineStyle.lineStyle)
        .style("stroke", (d: IReferenceLineSettings) => d.lineStyle.lineColor)
        .attr("stroke-width", (d: IReferenceLineSettings) => +d.lineStyle.lineWidth)
        .attr("x1", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return isLine2 ? d.line2Coord.x1 : d.line1Coord.x1;
            } else {
                return (isLine2 ? d.line2Coord.x1 : d.line1Coord.x1) + self.yAxisStartMargin;
            }
        })
        .attr("y1", (d: IReferenceLineSettings) => (isLine2 ? d.line2Coord.y1 : d.line1Coord.y1))
        .attr("x2", (d: IReferenceLineSettings) => isLine2 ? d.line2Coord.x2 : d.line1Coord.x2)
        .attr("y2", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return (isLine2 ? d.line2Coord.y2 : d.line1Coord.y2) - self.xAxisStartMargin;
            } else {
                return (isLine2 ? d.line2Coord.y2 : d.line1Coord.y2);
            }
        })
        .attr(
            "stroke-dasharray", (d: IReferenceLineSettings) => {
                return d.lineStyle.lineStyle === ELineType.Dotted
                    ? `0, ${6} `
                    : `${6}, ${6}`
            }
        )
        .attr("opacity", (d: IReferenceLineSettings) => {
            if (isLine2) {
                return d.line2Coord.x1 !== undefined && d.line2Coord.x2 !== undefined && d.line2Coord.y1 !== undefined && d.line2Coord.y2 !== undefined ? "1" : "0";
            } else {
                return d.line1Coord.x1 !== undefined && d.line1Coord.x2 !== undefined && d.line1Coord.y1 !== undefined && d.line1Coord.y2 !== undefined ? "1" : "0";
            }
        });
}

export const FormattingReferenceLineText = (self: Visual, textSelection: D3Selection<SVGElement>): void => {
    const getLabelText = (d: IReferenceLineSettings): string => {
        const isValue1TypeNumber = parseFloat(d.lineValue1.value).toString().length > 0 && parseFloat(d.lineValue1.value).toString() !== "NaN";
        const isValue2TypeNumber = parseFloat(d.lineValue2.value).toString().length > 0 && parseFloat(d.lineValue2.value).toString() !== "NaN";

        if (d.referenceType === EReferenceType.REFERENCE_BAND) {
            switch (d.labelStyle.labelNameType) {
                case EReferenceLineNameTypes.TEXT:
                    return d.labelStyle.bandLabel;
                case EReferenceLineNameTypes.TEXT_VALUE:
                    return d.labelStyle.bandLabel + " " + (isValue1TypeNumber ? GetFormattedNumber(+d.lineValue1.value, self.numberSettings, undefined, true) : d.lineValue1.value) +
                        " - " + (isValue2TypeNumber ? GetFormattedNumber(+d.lineValue2.value, self.numberSettings, undefined, true) : d.lineValue2.value);
                case EReferenceLineNameTypes.VALUE:
                    return (isValue1TypeNumber ? GetFormattedNumber(+d.lineValue1.value, self.numberSettings, undefined, true) : d.lineValue1.value) +
                        " - " + (isValue2TypeNumber ? GetFormattedNumber(+d.lineValue2.value, self.numberSettings, undefined, true) : d.lineValue2.value);
            }
        } else {
            switch (d.labelStyle.labelNameType) {
                case EReferenceLineNameTypes.TEXT:
                    return d.labelStyle.lineLabel;
                case EReferenceLineNameTypes.TEXT_VALUE:
                    return d.labelStyle.lineLabel + " " + (isValue1TypeNumber ? GetFormattedNumber(+d.lineValue1.value, self.numberSettings, undefined, true) : d.lineValue1.value);
                case EReferenceLineNameTypes.VALUE:
                    return (isValue1TypeNumber ? GetFormattedNumber(+d.lineValue1.value, self.numberSettings, undefined, true) : d.lineValue1.value);
            }
        }
    }

    textSelection
        .attr("display", "block")
        .text((d: IReferenceLineSettings) => getLabelText(d))
        .attr("x", (d: IReferenceLineSettings) => {
            if (d.lineValue1.axis === EXYAxisNames.X) {
                if (self.isHorizontalChart) {
                    return d.labelCoord.textX1;
                } else {
                    return -d.labelCoord.textY1;
                }
            } else {
                if (self.isHorizontalChart) {
                    return -d.labelCoord.textY1;
                } else {
                    return d.labelCoord.textX1;
                }
            }
        })
        .attr("y", (d: IReferenceLineSettings) => {
            if (d.lineValue1.axis === EXYAxisNames.X) {
                if (self.isHorizontalChart) {
                    return d.labelCoord.textY1;
                } else {
                    return d.labelCoord.textX1;
                }
            } else {
                if (self.isHorizontalChart) {
                    return d.labelCoord.textX1;
                } else {
                    return d.labelCoord.textY1;
                }
            }
        })
        .attr(
            "transform",
            (d: IReferenceLineSettings) =>
                `rotate(${(d.lineValue1.axis === EXYAxisNames.X && !self.isHorizontalChart) ||
                    (d.lineValue1.axis === EXYAxisNames.Y && self.isHorizontalChart)
                    ? "-90"
                    : "0"
                })`
        )
        .attr("fill", (d: IReferenceLineSettings) => d.labelStyle.labelColor)
        .attr("text-anchor", (d: IReferenceLineSettings) => d.labelStyle.textAnchor)
        .attr("alignment-baseline", (d: IReferenceLineSettings) => d.labelStyle.textAlignment)
        .style("font-size", (d: IReferenceLineSettings) => {
            const labelFontSizeFn = scaleLinear().range([8, 40]).domain([10, 2000]);
            const calcFontSize = d.labelStyle.autoFontSize ? labelFontSizeFn(self.chartContainer.clientWidth) : d.labelStyle.labelFontSize;
            return calcFontSize + "px";
        })
        .style("font-family", (d: IReferenceLineSettings) => d.labelStyle.labelFontFamily)
        .style("font-weight", (d: IReferenceLineSettings) => (d.labelStyle.styling.includes("bold") ? "bold" : "normal"))
        .style("font-style", (d: IReferenceLineSettings) => (d.labelStyle.styling.includes("italic") ? "italic" : "normal"))
        .style("text-decoration", (d: IReferenceLineSettings) => {
            const referenceLineTextDecor: string[] = [];
            if (d.labelStyle.styling.includes("underline")) referenceLineTextDecor.push("underline");
            if (d.labelStyle.styling.includes("strike")) referenceLineTextDecor.push("line-through");
            return referenceLineTextDecor.length ? referenceLineTextDecor.join(" ") : "";
        })
        .attr("opacity", (d: IReferenceLineSettings) => {
            return d.line1Coord.x1 !== undefined && d.line1Coord.x2 !== undefined && d.line1Coord.y1 !== undefined && d.line1Coord.y2 !== undefined ? "1" : "0";
        });

    const clonedTitle = select(textSelection as any).node().clone(true);
    clonedTitle
        .lower()
        .attr("class", "title-shadow")
        .attr("stroke", (d: IReferenceLineSettings) => self.getColor(d.labelStyle.labelBackgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("opacity", (d: IReferenceLineSettings) => d.labelStyle.isShowLabelBackground ? "1" : "0");
}

export const FormattingReferenceLineLayers = (self: Visual, layerSelection: D3Selection<SVGElement>): void => {
    layerSelection
        .attr("class", "referenceLineLayer")
        .attr("width", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return Math.abs(d.line1Coord.x1 - d.line2Coord.x1) - +d.lineStyle.lineWidth;
            } else {
                return self.width - self.yAxisStartMargin;
            }
        })
        .attr("height", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return self.height - self.xAxisStartMargin;
            } else {
                return Math.abs(d.line1Coord.y1 - d.line2Coord.y1) - +d.lineStyle.lineWidth;
            }
        })
        .attr("x", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return self.width - (self.width - d.line1Coord.x1) + +d.lineStyle.lineWidth / 2;
            } else {
                return self.yAxisStartMargin;
            }
        })
        .attr("y", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return 0;
            } else {
                return d.line1Coord.y1 + +d.lineStyle.lineWidth / 2;
            }
        })
        .attr("fill", (d: IReferenceLineSettings) => d.bandStyle.backgroundColor)
        .style("pointer-events", "none");
}

const getTextX1Y1ForHorizontalLine = (self: Visual, rLine: IReferenceLineLabelStyleProps, x1: number): { textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    const textY1 =
        rLine.labelAlignment === ELCRPosition.Centre
            ? self.height / 2
            : rLine.labelAlignment === ELCRPosition.Left
                ? self.height - 20
                : 20;

    let textX1: number;
    switch (rLine.labelPosition) {
        case EBeforeAfterPosition.Before:
            textX1 = x1 - 10;
            break;
        case EBeforeAfterPosition.Center:
            textX1 = x1 - 5;
            break;
        case EBeforeAfterPosition.After:
            textX1 = x1 + 10;
            break;
    }

    const textAnchor =
        rLine.labelAlignment === ELCRPosition.Centre
            ? "middle"
            : rLine.labelAlignment === ELCRPosition.Left
                ? "start"
                : "end";

    let textAlignment: string;
    switch (rLine.labelPosition) {
        case EBeforeAfterPosition.Before:
            textAlignment = "ideographic"
            break;
        case EBeforeAfterPosition.Center:
            textAlignment = "central"
            break;
        case EBeforeAfterPosition.After:
            textAlignment = "hanging"
            break;
    }

    return { textX1, textY1, textAnchor, textAlignment };
};

const getTextX1Y1ForVerticalLine = (self: Visual, rLine: IReferenceLineLabelStyleProps, y1: number): { textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    let textY1: number;
    switch (rLine.labelPosition) {
        case EBeforeAfterPosition.Before:
            textY1 = y1 - 10;
            break;
        case EBeforeAfterPosition.Center:
            textY1 = y1 - 5;
            break;
        case EBeforeAfterPosition.After:
            textY1 = y1 + 10;
            break;
    }

    const textX1 =
        rLine.labelAlignment === ELCRPosition.Centre
            ? self.width / 2
            : rLine.labelAlignment === ELCRPosition.Left
                ? 20
                : self.width - 20;
    const textAnchor =
        rLine.labelAlignment === ELCRPosition.Centre
            ? "middle"
            : rLine.labelAlignment === ELCRPosition.Left
                ? "start"
                : "end";

    let textAlignment: string;
    switch (rLine.labelPosition) {
        case EBeforeAfterPosition.Before:
            textAlignment = "ideographic"
            break;
        case EBeforeAfterPosition.Center:
            textAlignment = "central"
            break;
        case EBeforeAfterPosition.After:
            textAlignment = "hanging"
            break;
    }

    return { textX1, textY1, textAnchor, textAlignment };
};

const getTextXYForHorizontalLine = (self: Visual, value: number | string): { x1: number, y1: number, x2: number, y2: number } => {
    const x1 = 0;
    const y1 =
        self.getYPosition(value);
    const x2 = self.width;
    const y2 =
        self.getYPosition(value);

    return { x1, y1, x2, y2 };
};

const getTextXYForVerticalLine = (self: Visual, value: number | string): { x1: number, y1: number, x2: number, y2: number } => {
    const x1 =
        self.getXPosition(value) + self.scaleBandWidth / 2;
    const y1 = 0;
    const x2 =
        self.getXPosition(value) + self.scaleBandWidth / 2;
    const y2 = self.height;

    return { x1, y1, x2, y2 };
};

const setValueForXAxisRefLine = (self: Visual, rLineValue: IReferenceLineValueProps, rLineLabelStyle: IReferenceLineLabelStyleProps, value: string): { x1: number, y1: number, x2: number, y2: number, textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    let newX1, newX2, newY1, newY2, newTextX1, newTextY1, newTextAnchor, newTextAlignment;

    if (rLineValue.type === EReferenceLinesType.Ranking) {
        const domain: string = self.isHorizontalChart ? self.yScale.domain().reverse() : self.xScale.domain();
        if (rLineValue.rankOrder === Position.Start || rLineValue.rankOrder === Position.Bottom) {
            value = domain[parseInt(rLineValue.rank) - 1];
        } else {
            value = domain[domain.length - (parseInt(rLineValue.rank) - 1) - 1];
        }

        rLineValue.value = value;
    } else {
        value = rLineValue.value;
    }

    if (value === undefined || value === null) {
        return;
    }

    if (self.isHorizontalChart) {
        const { x1, x2, y1, y2 } = getTextXYForHorizontalLine(self, value);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    } else {
        const { x1, x2, y1, y2 } = getTextXYForVerticalLine(self, value);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    }

    if (self.isHorizontalChart) {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForVerticalLine(self, rLineLabelStyle, newY1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    } else {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForHorizontalLine(self, rLineLabelStyle, newX1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    }

    return { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment };
}

const setValueForYAxisRefLine = (self: Visual, rLineValue: IReferenceLineValueProps, rLineLabelStyle: IReferenceLineLabelStyleProps, value: string): { x1: number, y1: number, x2: number, y2: number, textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    let newX1, newX2, newY1, newY2, newTextX1, newTextY1, newTextAnchor, newTextAlignment;

    if (rLineValue.type === EReferenceLinesType.Ranking) {
        const domain: string = self.isHorizontalChart
            ? self.xScale.ticks(self.width / 90)
            : self.yScale.ticks(self.height / 90);
        if (rLineValue.rankOrder === Position.Start || rLineValue.rankOrder === Position.Bottom) {
            value = domain[parseInt(rLineValue.rank) - 1];
        } else {
            value = domain[domain.length - (parseInt(rLineValue.rank) - 1) - 1];
        }
    } else {
        value = rLineValue.value;
    }

    if (value === undefined || value === null) {
        return;
    }

    if (self.isHorizontalChart) {
        const { x1, x2, y1, y2 } = getTextXYForVerticalLine(self, value);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    } else {
        const { x1, x2, y1, y2 } = getTextXYForHorizontalLine(self, value);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    }

    if (self.isHorizontalChart) {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForHorizontalLine(self, rLineLabelStyle, newX1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    } else {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForVerticalLine(self, rLineLabelStyle, newY1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    }

    return { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment };
}

// eslint-disable-next-line max-lines-per-function
export const GetReferenceLinesData = (self: Visual): IReferenceLineSettings[] => {
    const setData = (rLine: IReferenceLineSettings, isLine2: boolean) => {
        let x1: number,
            y1: number,
            x2: number,
            y2: number;
        let textX1: number, textY1: number, textAnchor: string, textAlignment: string;

        const rLineValue = isLine2 ? rLine.lineValue2 : rLine.lineValue1;
        if (rLineValue.type === EReferenceLinesType.Value && rLineValue.axis === EXYAxisNames.Y) {
            let values = [];
            const isCategoricalReferenceLinesMeasure = self.categoricalReferenceLinesNames.includes(rLineValue.axis);

            if (isCategoricalReferenceLinesMeasure) {
                const referenceLineData = self.categoricalReferenceLinesDataFields.filter(
                    (d) => d.source.displayName === rLineValue.axis
                );
                values = referenceLineData.reduce((arr, cur) => [...arr, ...cur.values], []);
            }

            if (!isCategoricalReferenceLinesMeasure) {
                values = self.chartData.map((d) => d.value1);
            }

            switch (rLineValue.computation) {
                case EReferenceLineComputation.ZeroBaseline:
                    rLineValue.value = 0 + "";
                    break;
                case EReferenceLineComputation.Min:
                    rLineValue.value = d3Min(values, (d) => d) + "";
                    break;
                case EReferenceLineComputation.Max:
                    rLineValue.value = d3Max(values, (d) => d) + "";
                    break;
                case EReferenceLineComputation.Average:
                    rLineValue.value = mean(values, (d) => d) + "";
                    break;
                case EReferenceLineComputation.Median:
                    rLineValue.value = median(values, (d) => d) + "";
                    break;
                case EReferenceLineComputation.StandardDeviation:
                    rLineValue.value = calculateStandardDeviation(values) + "";
                    break;
                case EReferenceLineComputation.Fixed:
                    break;
            }
        }

        let value: string;
        if (rLineValue.axis === EXYAxisNames.X) {
            const { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment } = setValueForXAxisRefLine(self, rLineValue, rLine.labelStyle, value);
            x1 = newX1;
            x2 = newX2;
            y1 = newY1;
            y2 = newY2;
            textX1 = newTextX1;
            textY1 = newTextY1;
            textAnchor = newTextAnchor;
            textAlignment = newTextAlignment;
        } else if (rLineValue.axis === EXYAxisNames.Y) {
            const { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment } = setValueForYAxisRefLine(self, rLineValue, rLine.labelStyle, value);
            x1 = newX1;
            x2 = newX2;
            y1 = newY1;
            y2 = newY2;
            textX1 = newTextX1;
            textY1 = newTextY1;
            textAnchor = newTextAnchor;
            textAlignment = newTextAlignment;
        }

        if (isLine2) {
            rLine.line2Coord.x1 = x1;
            rLine.line2Coord.x2 = x2;
            rLine.line2Coord.y1 = y1;
            rLine.line2Coord.y2 = y2;
            rLine.line2Coord.textX1 = textX1;
            rLine.line2Coord.textY1 = textY1;
        } else {
            rLine.line1Coord.x1 = x1;
            rLine.line1Coord.x2 = x2;
            rLine.line1Coord.y1 = y1;
            rLine.line1Coord.y2 = y2;
            rLine.line1Coord.textX1 = textX1;
            rLine.line1Coord.textY1 = textY1;
            rLine.labelStyle.textAnchor = textAnchor;
            rLine.labelStyle.textAlignment = textAlignment;
        }
    }

    return self.referenceLinesSettings.reduce(
        (arr: IReferenceLineSettings[], rLine: IReferenceLineSettings) => {
            setData(rLine, false);

            if (rLine.referenceType === EReferenceType.REFERENCE_BAND) {
                setData(rLine, true);
            }

            rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
            rLine.labelCoord.textY1 = rLine.line1Coord.textY1;

            if (rLine.referenceType === EReferenceType.REFERENCE_BAND) {
                if (rLine.lineValue1.axis === EXYAxisNames.X || !self.isHorizontalChart) {
                    if (rLine.line1Coord.x1 > rLine.line2Coord.x1) {
                        const clonedRLine: IReferenceLineSettings = JSON.parse(JSON.stringify(rLine));
                        rLine.line1Coord = rLine.line2Coord;
                        rLine.line2Coord = clonedRLine.line1Coord;
                        rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                        rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                    }
                }

                if (rLine.lineValue1.axis === EXYAxisNames.Y || self.isHorizontalChart) {
                    if (rLine.line1Coord.y1 > rLine.line2Coord.y1) {
                        const clonedRLine: IReferenceLineSettings = JSON.parse(JSON.stringify(rLine));
                        rLine.line1Coord = rLine.line2Coord;
                        rLine.line2Coord = clonedRLine.line1Coord;
                        rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                        rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                    }
                }
            }

            arr = [...arr, rLine];

            return arr;
        },
        []
    );
}
