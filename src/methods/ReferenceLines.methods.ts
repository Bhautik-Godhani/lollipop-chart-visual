import { Visual } from "../visual";
import { select, Selection } from "d3-selection";
import { min as d3Min, max as d3Max, mean, median, max, min } from "d3-array";
import { EBeforeAfterPosition, EFontStyle, EHighContrastColorType, ELCRPosition, ELineType, EReferenceLineComputation, EReferenceLineNameTypes, EReferenceLinesType, EReferenceLineType, EReferenceType, EXYAxisNames, Position } from "../enum";
import { scaleLinear } from "d3";
import crypto from "crypto";
import { IReferenceLineLabelStyleProps, IReferenceLineSettings, IReferenceLineValueProps } from "../visual-settings.interface";
import { calculateStandardDeviation, GetSVGTextSize2 } from "./methods";
import { GetFormattedNumber } from "./NumberFormat.methods";
import { cloneDeep } from "lodash";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";

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

            if (d && d.referenceType === EReferenceType.REFERENCE_BAND && d.bandStyle.isShowBackgroundColor) {
                const bandRect = referenceLinesG.append("rect").attr("class", "referenceBand");
                FormattingReferenceLineLayers(self, bandRect);
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

        })
    }
}

export const FormattingReferenceLines = (self: Visual, lineSelection: D3Selection<SVGElement>, isLine2: boolean): void => {
    lineSelection
        .attr("class", (d: IReferenceLineSettings) => d.lineStyle.lineStyle)
        .style("stroke", (d: IReferenceLineSettings) => self.getColor(d.lineStyle.lineColor, EHighContrastColorType.Foreground))
        .attr("stroke-width", (d: IReferenceLineSettings) => +d.lineStyle.lineWidth)
        .attr("x1", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return isLine2 ? d.line2Coord.x1 : d.line1Coord.x1;
            } else {
                return (isLine2 ? d.line2Coord.x1 : d.line1Coord.x1);
            }
        })
        .attr("y1", (d: IReferenceLineSettings) => (isLine2 ? d.line2Coord.y1 : d.line1Coord.y1))
        .attr("x2", (d: IReferenceLineSettings) => isLine2 ? d.line2Coord.x2 : d.line1Coord.x2)
        .attr("y2", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return (isLine2 ? d.line2Coord.y2 : d.line1Coord.y2);
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

const getLabelText = (self: Visual, d: IReferenceLineSettings): string => {
    let isValue1TypeNumber = parseFloat(d.lineValue1.value).toString().length > 0 && parseFloat(d.lineValue1.value).toString() !== "NaN";

    if (self.isHorizontalChart) {
        if (d.lineValue1.axis === EXYAxisNames.X && self.isDateCategoryNames) {
            isValue1TypeNumber = false;
        }
    } else {
        if (d.lineValue1.axis === EXYAxisNames.X && self.isDateCategoryNames) {
            isValue1TypeNumber = false;
        }
    }

    const labelText = d.referenceType === EReferenceType.REFERENCE_BAND ? d.labelStyle.bandLabel : d.labelStyle.lineLabel;
    let labelValue: string;

    if (d.referenceType === EReferenceType.REFERENCE_BAND) {
        labelValue = isValue1TypeNumber ?
            GetFormattedNumber(self, +d.lineValue1.value, self.numberSettings, undefined, true, true) + " - " + GetFormattedNumber(self, +d.lineValue2.value, self.numberSettings, undefined, true, true) :
            self.getTooltipCategoryText(d.lineValue1.value) + " - " + self.getTooltipCategoryText(d.lineValue2.value);
    } else {
        labelValue = isValue1TypeNumber ? GetFormattedNumber(self, +d.lineValue1.value, self.numberSettings, undefined, true, true) : self.getTooltipCategoryText(d.lineValue1.value);
    }

    switch (d.labelStyle.labelNameType) {
        case EReferenceLineNameTypes.TEXT:
            return labelText;
        case EReferenceLineNameTypes.TEXT_VALUE:
            return labelText + " " + labelValue;
        case EReferenceLineNameTypes.VALUE:
            return labelValue;
    }
}

export const FormattingReferenceLineText = (self: Visual, textSelection: D3Selection<SVGElement>): void => {
    textSelection
        .attr("display", "block")
        .text((d: IReferenceLineSettings) => {
            const textProperties: TextProperties = {
                text: d.labelText,
                fontFamily: d.labelStyle.labelFontFamily,
                fontSize: d.labelStyle.labelFontSize + "px",
            };
            return textMeasurementService.getTailoredTextOrDefault(textProperties, self.isHorizontalChart ? self.width * 0.9 : self.height * 0.9)
        })
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
        .attr("fill", (d: IReferenceLineSettings) => self.getColor(d.labelStyle.labelColor, EHighContrastColorType.Foreground))
        .attr("text-anchor", (d: IReferenceLineSettings) => d.labelStyle.textAnchor)
        .attr("alignment-baseline", (d: IReferenceLineSettings) => d.labelStyle.textAlignment)
        .style("font-size", (d: IReferenceLineSettings) => {
            return d.labelStyle.labelFontSize + "px";
        })
        .style("font-family", (d: IReferenceLineSettings) => d.labelStyle.labelFontFamily)
        .style("font-weight", (d: IReferenceLineSettings) => (d.labelStyle.styling.includes(EFontStyle.Bold) ? "bold" : "normal"))
        .style("font-style", (d: IReferenceLineSettings) => (d.labelStyle.styling.includes(EFontStyle.Italic) ? "italic" : "normal"))
        .style("text-decoration", (d: IReferenceLineSettings) => {
            const referenceLineTextDecor: string[] = [];
            if (d.labelStyle.styling.includes(EFontStyle.UnderLine)) referenceLineTextDecor.push("underline");
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
        .attr("stroke-width", 3)
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
                return self.height - (self.isHorizontalChart ? 0 : self.xAxisStartMargin);
            } else {
                return Math.abs(d.line1Coord.y1 - d.line2Coord.y1) - +d.lineStyle.lineWidth;
            }
        })
        .attr("x", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return self.width - (self.width - (d.line1Coord.x1 > d.line2Coord.x1 ? d.line2Coord.x1 : d.line1Coord.x1)) + +d.lineStyle.lineWidth / 2;
            } else {
                return (self.isLeftYAxis ? self.yAxisStartMargin : 0);
            }
        })
        .attr("y", (d: IReferenceLineSettings) => {
            if ((!self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.X) || (self.isHorizontalChart && d.lineValue1.axis === EXYAxisNames.Y)) {
                return (!self.isBottomXAxis ? self.xAxisStartMargin : 0);
            } else {
                return ((d.line1Coord.y1 > d.line2Coord.y1) ? d.line2Coord.y1 : d.line1Coord.y1) + +d.lineStyle.lineWidth / 2;
            }
        })
        .attr("fill", (d: IReferenceLineSettings) => self.getColor(d.bandStyle.backgroundColor, EHighContrastColorType.Background))
        .style("pointer-events", "none");
}

const getTextX1Y1ForHorizontalLine = (self: Visual, d: IReferenceLineSettings, rLine: IReferenceLineLabelStyleProps, x1: number): { textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    const labelTextBBox = GetSVGTextSize2(d.labelText, rLine.labelFontFamily, +rLine.labelFontSize, rLine.styling, 5);
    const isBand = d.referenceType === EReferenceType.REFERENCE_BAND;

    if (rLine.labelPosition === EBeforeAfterPosition.After) {
        if (isBand) {
            if ((max([d.line1Coord.x1, x1]) + 20 + labelTextBBox.height) > self.width) {
                rLine.labelPosition = EBeforeAfterPosition.Before;
            }
        } else {
            if ((x1 + 20 + labelTextBBox.height) > self.width) {
                rLine.labelPosition = EBeforeAfterPosition.Before;
            }
        }
    }

    if (rLine.labelPosition === EBeforeAfterPosition.Before) {
        if (isBand) {
            if ((min([d.line1Coord.x1, x1]) - 10) <= labelTextBBox.height) {
                rLine.labelPosition = EBeforeAfterPosition.After;
            }
        } else {
            if ((x1 - 10) <= labelTextBBox.height) {
                rLine.labelPosition = EBeforeAfterPosition.After;
            }
        }
    }

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

const getTextX1Y1ForVerticalLine = (self: Visual, d: IReferenceLineSettings, rLine: IReferenceLineLabelStyleProps, y1: number): { textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    const labelTextBBox = GetSVGTextSize2(d.labelText, rLine.labelFontFamily, +rLine.labelFontSize, rLine.styling, 5);
    if (rLine.labelPosition === EBeforeAfterPosition.After) {
        if ((y1 + 10 + labelTextBBox.height) > (self.height - self.margin.bottom)) {
            rLine.labelPosition = EBeforeAfterPosition.Before;
        }
    }

    if (rLine.labelPosition === EBeforeAfterPosition.Before) {
        if (labelTextBBox.height > (y1 - 10 + self.margin.top)) {
            rLine.labelPosition = EBeforeAfterPosition.After;
        }
    }

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

const getTextXYForHorizontalLine = (self: Visual, value: number | string, rLine: IReferenceLineSettings): { x1: number, y1: number, x2: number, y2: number } => {
    const x1 = (self.isLeftYAxis ? self.yAxisStartMargin : 0);
    const y1 =
        self.getYPosition(value) + (rLine.lineValue1.axis === EXYAxisNames.X ? self.scaleBandWidth / 2 : 0);
    const x2 = self.width - (!self.isLeftYAxis ? self.yAxisStartMargin : 0);
    const y2 =
        self.getYPosition(value) + (rLine.lineValue1.axis === EXYAxisNames.X ? self.scaleBandWidth / 2 : 0);

    return { x1, y1, x2, y2 };
};

const getTextXYForVerticalLine = (self: Visual, value: number | string, rLine: IReferenceLineSettings): { x1: number, y1: number, x2: number, y2: number } => {
    const x1 =
        self.getXPosition(value) + (rLine.lineValue1.axis === EXYAxisNames.X ? self.scaleBandWidth / 2 : 0);
    const y1 = !self.isBottomXAxis ? self.xAxisStartMargin : 0;
    const x2 =
        self.getXPosition(value) + (rLine.lineValue1.axis === EXYAxisNames.X ? self.scaleBandWidth / 2 : 0);
    const y2 = self.height - (self.isBottomXAxis ? self.xAxisStartMargin : 0);

    return { x1, y1, x2, y2 };
};

const setValueForXAxisRefLine = (self: Visual, rLine: IReferenceLineSettings, rLineValue: IReferenceLineValueProps, rLineLabelStyle: IReferenceLineLabelStyleProps, value: string): { x1: number, y1: number, x2: number, y2: number, textX1: number, textY1: number, textAnchor: string, textAlignment: string, value: string } => {
    let newX1, newX2, newY1, newY2, newTextX1, newTextY1, newTextAnchor, newTextAlignment;

    if (rLineValue.type === EReferenceLinesType.Ranking) {
        const categories = cloneDeep(<string[]>self.categoricalData.categories[self.categoricalCategoriesLastIndex].values);
        const domain: string[] = self.isHorizontalChart ? categories.reverse() : categories;

        // domain = self.elementToMoveOthers(domain, false, undefined);

        // if (self.rankingSettings.category.enabled && self.rankingSettings.category.showRemainingAsOthers) {
        //     const elementToMove = domain.find(obj => obj.includes(self.othersLabel));
        //     if (elementToMove) {
        //         const index = domain.findIndex(obj => obj.includes(self.othersLabel));
        //         domain.splice(index, 1);
        //         domain.push(elementToMove);
        //     }
        // }

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
        const { x1, x2, y1, y2 } = getTextXYForHorizontalLine(self, value, rLine);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    } else {
        const { x1, x2, y1, y2 } = getTextXYForVerticalLine(self, value, rLine);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    }

    if (self.isHorizontalChart) {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForVerticalLine(self, rLine, rLineLabelStyle, newY1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    } else {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForHorizontalLine(self, rLine, rLineLabelStyle, newX1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    }

    return { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment, value };
}

const setValueForYAxisRefLine = (self: Visual, rLine: IReferenceLineSettings, rLineValue: IReferenceLineValueProps, rLineLabelStyle: IReferenceLineLabelStyleProps, value: string): { x1: number, y1: number, x2: number, y2: number, textX1: number, textY1: number, textAnchor: string, textAlignment: string } => {
    let newX1, newX2, newY1, newY2, newTextX1, newTextY1, newTextAnchor, newTextAlignment;

    if (rLineValue.type === EReferenceLinesType.Ranking) {
        const domain: string[] = self.isHorizontalChart
            ? self.xScale.ticks(self.width / 90)
            : self.yScale.ticks(self.height / 90);

        // domain = self.elementToMoveOthers(domain, false, undefined);

        // if (self.rankingSettings.category.enabled && self.rankingSettings.category.showRemainingAsOthers) {
        //     const elementToMove = domain.find(obj => obj.includes(self.othersLabel));
        //     if (elementToMove) {
        //         const index = domain.findIndex(obj => obj.includes(self.othersLabel));
        //         domain.splice(index, 1);
        //         domain.push(elementToMove);
        //     }
        // }

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
        const { x1, x2, y1, y2 } = getTextXYForVerticalLine(self, value, rLine);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    } else {
        const { x1, x2, y1, y2 } = getTextXYForHorizontalLine(self, value, rLine);
        newX1 = x1;
        newX2 = x2;
        newY1 = y1;
        newY2 = y2;
    }

    if (self.isHorizontalChart) {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForHorizontalLine(self, rLine, rLineLabelStyle, newX1);
        newTextX1 = textX1;
        newTextY1 = textY1;
        newTextAnchor = textAnchor;
        newTextAlignment = textAlignment;
    } else {
        const { textX1, textY1, textAnchor, textAlignment } = getTextX1Y1ForVerticalLine(self, rLine, rLineLabelStyle, newY1);
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
            const isCategoricalReferenceLinesMeasure = self.categoricalReferenceLinesNames.includes(rLineValue.measureName);

            if (isCategoricalReferenceLinesMeasure) {
                const referenceLineData = self.categoricalReferenceLinesDataFields.filter(
                    (d) => d.source.displayName === rLineValue.measureName
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
        let newValue: string;
        if (rLineValue.axis === EXYAxisNames.X) {
            const { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment, value: value2 } = setValueForXAxisRefLine(self, rLine, rLineValue, rLine.labelStyle, value);
            x1 = newX1;
            x2 = newX2;
            y1 = newY1;
            y2 = newY2;
            textX1 = newTextX1;
            textY1 = newTextY1;
            textAnchor = newTextAnchor;
            textAlignment = newTextAlignment;
            newValue = value2;
        } else if (rLineValue.axis === EXYAxisNames.Y) {
            const { x1: newX1, x2: newX2, y1: newY1, y2: newY2, textX1: newTextX1, textY1: newTextY1, textAnchor: newTextAnchor, textAlignment: newTextAlignment } = setValueForYAxisRefLine(self, rLine, rLineValue, rLine.labelStyle, value);
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

            if (rLineValue.axis === EXYAxisNames.X) {
                rLine.lineValue2.value = newValue;
            }
        } else {
            rLine.line1Coord.x1 = x1;
            rLine.line1Coord.x2 = x2;
            rLine.line1Coord.y1 = y1;
            rLine.line1Coord.y2 = y2;
            rLine.line1Coord.textX1 = textX1;
            rLine.line1Coord.textY1 = textY1;
            rLine.labelStyle.textAnchor = textAnchor;
            rLine.labelStyle.textAlignment = textAlignment;

            if (rLineValue.axis === EXYAxisNames.X) {
                rLine.lineValue1.value = newValue;
            }
        }
    }

    return self.referenceLinesSettings.reduce(
        (arr: IReferenceLineSettings[], rLine: IReferenceLineSettings) => {
            const labelFontSizeFn = scaleLinear().range([8, self.isSmallMultiplesEnabled ? 15 : 20]).domain([10, self.chartContainer.clientWidth]);
            const calcFontSize = rLine.labelStyle.autoFontSize ? labelFontSizeFn(self.chartContainer.clientWidth) : rLine.labelStyle.labelFontSize;

            rLine.labelStyle.labelFontSize = calcFontSize.toString();

            rLine.labelText = getLabelText(self, rLine);

            setData(rLine, false);

            if (rLine.referenceType === EReferenceType.REFERENCE_BAND) {
                setData(rLine, true);
            }

            rLine.labelText = getLabelText(self, rLine);

            rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
            rLine.labelCoord.textY1 = rLine.line1Coord.textY1;

            if (rLine.referenceType === EReferenceType.REFERENCE_BAND) {
                if (rLine.lineValue1.axis === EXYAxisNames.X) {
                    if ((rLine.line1Coord.x1 > rLine.line2Coord.x1 && !self.isHorizontalChart) || (rLine.line1Coord.y1 > rLine.line2Coord.y1 && self.isHorizontalChart)) {
                        // const clonedRLine: IReferenceLineSettings = cloneDeep(rLine));
                        // rLine.line1Coord = rLine.line2Coord;
                        // rLine.line2Coord = clonedRLine.line1Coord;
                        switch (rLine.labelStyle.labelPosition) {
                            case EBeforeAfterPosition.Before:
                                rLine.labelCoord.textX1 = rLine.line2Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line2Coord.textY1;
                                break;
                            case EBeforeAfterPosition.Center:
                                rLine.labelCoord.textX1 = (rLine.line1Coord.textX1 + rLine.line2Coord.textX1) / 2;
                                rLine.labelCoord.textY1 = (rLine.line1Coord.textY1 + rLine.line2Coord.textY1) / 2;
                                break;
                            case EBeforeAfterPosition.After:
                                rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                                break;
                        }
                    } else {
                        // const clonedRLine: IReferenceLineSettings = cloneDeep(rLine));
                        // rLine.line1Coord = rLine.line2Coord;
                        // rLine.line2Coord = clonedRLine.line1Coord;
                        switch (rLine.labelStyle.labelPosition) {
                            case EBeforeAfterPosition.Before:
                                rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                                break;
                            case EBeforeAfterPosition.Center:
                                rLine.labelCoord.textX1 = (rLine.line1Coord.textX1 + rLine.line2Coord.textX1) / 2;
                                rLine.labelCoord.textY1 = (rLine.line1Coord.textY1 + rLine.line2Coord.textY1) / 2;
                                break;
                            case EBeforeAfterPosition.After:
                                rLine.labelCoord.textX1 = rLine.line2Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line2Coord.textY1;
                                break;
                        }
                    }
                }

                if (rLine.lineValue1.axis === EXYAxisNames.Y) {
                    if ((rLine.line1Coord.y1 > rLine.line2Coord.y1 && !self.isHorizontalChart) || (rLine.line1Coord.x1 > rLine.line2Coord.x1 && self.isHorizontalChart)) {
                        // const clonedRLine: IReferenceLineSettings = cloneDeep(rLine));
                        // rLine.line1Coord = rLine.line2Coord;
                        // rLine.line2Coord = clonedRLine.line1Coord;
                        switch (rLine.labelStyle.labelPosition) {
                            case EBeforeAfterPosition.Before:
                                rLine.labelCoord.textX1 = rLine.line2Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line2Coord.textY1;
                                break;
                            case EBeforeAfterPosition.Center:
                                rLine.labelCoord.textX1 = (rLine.line1Coord.textX1 + rLine.line2Coord.textX1) / 2;
                                rLine.labelCoord.textY1 = (rLine.line1Coord.textY1 + rLine.line2Coord.textY1) / 2;
                                break;
                            case EBeforeAfterPosition.After:
                                rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                                break;
                        }
                    } else {
                        // const clonedRLine: IReferenceLineSettings = cloneDeep(rLine));
                        // rLine.line1Coord = rLine.line2Coord;
                        // rLine.line2Coord = clonedRLine.line1Coord;

                        switch (rLine.labelStyle.labelPosition) {
                            case EBeforeAfterPosition.Before:
                                rLine.labelCoord.textX1 = rLine.line1Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line1Coord.textY1;
                                break;
                            case EBeforeAfterPosition.Center:
                                rLine.labelCoord.textX1 = (rLine.line1Coord.textX1 + rLine.line2Coord.textX1) / 2;
                                rLine.labelCoord.textY1 = (rLine.line1Coord.textY1 + rLine.line2Coord.textY1) / 2;
                                break;
                            case EBeforeAfterPosition.After:
                                rLine.labelCoord.textX1 = rLine.line2Coord.textX1;
                                rLine.labelCoord.textY1 = rLine.line2Coord.textY1;
                                break;
                        }
                    }
                }
            }

            arr = [...arr, rLine];

            return arr;
        },
        []
    );
}
