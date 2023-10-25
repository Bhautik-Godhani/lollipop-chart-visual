import { Visual } from "../visual";
import { select as d3Select, select, Selection } from "d3-selection";
import { min as d3Min, max as d3Max, mean, median } from "d3-array";
import { EBeforeAfterPosition, EHighContrastColorType, ELCRPosition, ELineType, EReferenceLineComputation, EReferenceLinesType, EXYAxisNames, Position } from "../enum";
import { scaleLinear } from "d3";
import { IReferenceLinesSettings } from "../visual-settings.interface";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderReferenceLines = (self: Visual, referenceLinesData: IReferenceLinesSettings[]): void => {
    const data = referenceLinesData.filter(
        (d) => d.x1 >= 0 && d.x2 >= 0 && d.y1 >= 0 && d.y2 >= 0 && d.textX1 >= 0 && d.textY1 >= 0
    );
    const referenceLinesGSelection = self.referenceLinesContainerG
        .selectAll(".referenceLinesG")
        .data(data && data.length > 0 ? data : [], (d, i) => Math.random());

    referenceLinesGSelection.join(
        (enter) => {
            const referenceLinesG = enter.append("g").attr("class", "referenceLinesG");

            const lines = referenceLinesG.append("line").attr("class", "referenceLine");
            FormattingReferenceLines(lines);

            const texts = referenceLinesG.append("text").attr("class", "referenceLineText");
            FormattingReferenceLineText(self, texts);

            return referenceLinesG;
        },
        (update) => {
            const lines = update.select(".referenceLine");
            FormattingReferenceLines(lines as any);

            const texts = update.select(".referenceLineText");
            FormattingReferenceLineText(self, texts as any);

            return update;
        }
    );
}

export const FormattingReferenceLines = (lineSelection: D3Selection<SVGElement>): void => {
    lineSelection
        .attr("class", d => d.lineStyle)
        .style("stroke", (d) => d.lineColor)
        .attr("stroke-width", (d) => +d.lineWidth)
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x2)
        .attr("y2", (d) => d.y2)
        .attr(
            "stroke-dasharray", d => {
                return d.lineStyle === ELineType.Dotted
                    ? `0, ${6} `
                    : `${6}, ${6}`
            }
        )
        .attr("opacity", (d) => {
            return d.x1 !== undefined && d.x2 !== undefined && d.y1 !== undefined && d.y2 !== undefined ? "1" : "0";
        });
}

export const FormattingReferenceLineText = (self: Visual, textSelection: D3Selection<SVGElement>): void => {
    textSelection
        .text((d) => d.label)
        .attr("x", (d) => {
            if (d.axis === EXYAxisNames.X) {
                if (self.isHorizontalChart) {
                    return d.textX1;
                } else {
                    return -d.textY1;
                }
            } else {
                if (self.isHorizontalChart) {
                    return -d.textY1;
                } else {
                    return d.textX1;
                }
            }
        })
        .attr("y", (d) => {
            if (d.axis === EXYAxisNames.X) {
                if (self.isHorizontalChart) {
                    return d.textY1;
                } else {
                    return d.textX1;
                }
            } else {
                if (self.isHorizontalChart) {
                    return d.textX1;
                } else {
                    return d.textY1;
                }
            }
        })
        .attr(
            "transform",
            (d) =>
                `rotate(${(d.axis === EXYAxisNames.X && !self.isHorizontalChart) ||
                    (d.axis === EXYAxisNames.Y && self.isHorizontalChart)
                    ? "-90"
                    : "0"
                })`
        )
        .attr("fill", (d) => d.labelColor)
        .attr("text-anchor", (d) => d.textAnchor)
        .attr("alignment-baseline", (d) => d.textAlignment)
        .style("font-size", (d) => {
            const labelFontSizeFn = scaleLinear().range([8, 40]).domain([10, 2000]);
            const calcFontSize = d.autoFontSize ? labelFontSizeFn(self.chartContainer.clientWidth) : d.labelFontSize;
            return calcFontSize + "px";
        })
        .style("font-family", (d) => d.labelFontFamily)
        .style("font-weight", (d) => (d.styling.includes("bold") ? "bold" : "normal"))
        .style("font-style", (d) => (d.styling.includes("italic") ? "italic" : "normal"))
        .style("text-decoration", (d) => {
            const referenceLineTextDecor: string[] = [];
            if (d.styling.includes("underline")) referenceLineTextDecor.push("underline");
            if (d.styling.includes("strike")) referenceLineTextDecor.push("line-through");
            return referenceLineTextDecor.length ? referenceLineTextDecor.join(" ") : "";
        })
        .attr("opacity", (d) => {
            return d.x1 !== undefined && d.x2 !== undefined && d.y1 !== undefined && d.y2 !== undefined ? "1" : "0";
        });

    const clonedTitle = select(textSelection as any).node().clone(true);
    clonedTitle
        .lower()
        .attr("class", "title-shadow")
        .attr("stroke", d => self.getColor(d.labelBackgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("opacity", d => d.isShowLabelBackground ? "1" : "0");
}

export const RenderReferenceLineLayers = (self: Visual, referenceLinesData: IReferenceLinesSettings[]): void => {
    const referenceLineLayersSelection = self.referenceLineLayersG
        .selectAll(".referenceLineLayer")
        .data(referenceLinesData ? referenceLinesData : [], (d, i) => Math.random());

    referenceLineLayersSelection.join(
        (enter) => {
            const layer = enter.append("rect");
            FormatReferenceLineLayers(self, layer);
            return layer;
        },
        (update) => {
            FormatReferenceLineLayers(self, update as any);
            return update;
        }
    );
}

export const FormatReferenceLineLayers = (self: Visual, layerSelection: D3Selection<SVGElement>): void => {
    layerSelection
        .attr("class", "referenceLineLayer")
        .attr("width", (d) => {
            let width = 0;
            if (d.barAreaPositionToHighlight === "left") {
                width = self.width - (self.width - d.x1);
            } else if (d.barAreaPositionToHighlight === "right") {
                width = self.width - d.x1;
            } else if (d.barAreaPositionToHighlight === "top" || d.barAreaPositionToHighlight === "bottom") {
                width = self.width;
            }
            return width > 0 ? width : 0;
        })
        .attr("height", (d) => {
            let height = 0;
            if (d.barAreaPositionToHighlight === "left" || d.barAreaPositionToHighlight === "right") {
                height = self.height;
            } else if (d.barAreaPositionToHighlight === "top") {
                height = self.height - (self.height - d.y1);
            } else if (d.barAreaPositionToHighlight === "bottom") {
                height = self.height - d.y1;
            }
            return height > 0 ? height : 0;
        })
        .attr("x", (d) => {
            if (
                d.barAreaPositionToHighlight === "left" ||
                d.barAreaPositionToHighlight === "top" ||
                d.barAreaPositionToHighlight === "bottom"
            ) {
                return d.barAreaPositionToHighlight === "left" ? -(+d.lineWidth / 2) : 0;
            } else if (d.barAreaPositionToHighlight === "right") {
                return self.width - (self.width - d.x1) + +d.lineWidth / 2;
            }
        })
        .attr("y", (d) => {
            if (
                d.barAreaPositionToHighlight === "left" ||
                d.barAreaPositionToHighlight === "right" ||
                d.barAreaPositionToHighlight === "top"
            ) {
                return d.barAreaPositionToHighlight === "top" ? -(+d.lineWidth / 2) : 0;
            } else if (d.barAreaPositionToHighlight === "bottom") {
                return d.y1 + +d.lineWidth / 2;
            }
        })
        .attr("fill", (d) => d.shadeColor)
        .style("pointer-events", "none");
}

export const GetReferenceLinesData = (self: Visual): IReferenceLinesSettings[] => {
    return self.referenceLinesSettings.reduce(
        (arr: IReferenceLinesSettings[], rLine: IReferenceLinesSettings) => {
            let x1: number,
                y1: number,
                x2: number,
                y2: number = 0;
            let textX1: number, textY1: number, textAnchor: string, textAlignment: string;

            if (rLine.type === EReferenceLinesType.Value && rLine.axis === EXYAxisNames.Y) {
                let values = [];
                const isCategoricalReferenceLinesMeasure = self.categoricalReferenceLinesNames.includes(rLine.measureName);

                if (isCategoricalReferenceLinesMeasure) {
                    const referenceLineData = self.categoricalReferenceLinesDataFields.filter(
                        (d) => d.source.displayName === rLine.measureName
                    );
                    values = referenceLineData.reduce((arr, cur) => [...arr, ...cur.values], []);
                }

                if (!isCategoricalReferenceLinesMeasure) {
                    values = self.chartData.map((d) => d.value1);
                }

                switch (rLine.computation) {
                    case EReferenceLineComputation.Min:
                        rLine.value = d3Min(values, (d) => d) + "";
                        break;
                    case EReferenceLineComputation.Max:
                        rLine.value = d3Max(values, (d) => d) + "";
                        break;
                    case EReferenceLineComputation.Average:
                        rLine.value = mean(values, (d) => d) + "";
                        break;
                    case EReferenceLineComputation.Median:
                        rLine.value = median(values, (d) => d) + "";
                        break;
                    case EReferenceLineComputation.Fixed:
                        rLine.value = rLine.value;
                        break;
                }
            }

            SetAutoBarAreaPositionToHighlight(self, rLine);
            SetAutoLinePositionOnBar(self, rLine);

            const getTextX1Y1ForHorizontalLine = () => {
                textY1 =
                    rLine.labelAlignment === ELCRPosition.Centre
                        ? self.height / 2
                        : rLine.labelAlignment === ELCRPosition.Left
                            ? self.height - 20
                            : 20;
                textX1 = x1 + (rLine.labelPosition === EBeforeAfterPosition.Before ? -10 : 10);
                textAnchor =
                    rLine.labelAlignment === ELCRPosition.Centre
                        ? "middle"
                        : rLine.labelAlignment === ELCRPosition.Left
                            ? "start"
                            : "end";
                textAlignment = rLine.labelPosition === EBeforeAfterPosition.Before ? "ideographic" : "hanging";
            };

            const getTextX1Y1ForVerticalLine = () => {
                textY1 = y1 + (rLine.labelPosition === EBeforeAfterPosition.Before ? -10 : 10);
                textX1 =
                    rLine.labelAlignment === ELCRPosition.Centre
                        ? self.width / 2
                        : rLine.labelAlignment === ELCRPosition.Left
                            ? 20
                            : self.width - 20;
                textAnchor =
                    rLine.labelAlignment === ELCRPosition.Centre
                        ? "middle"
                        : rLine.labelAlignment === ELCRPosition.Left
                            ? "start"
                            : "end";
                textAlignment = rLine.labelPosition === EBeforeAfterPosition.Before ? "ideographic" : "hanging";
            };

            const getTextXYForHorizontalLine = (value: number | string) => {
                x1 = 0;
                y1 =
                    self.yScale(value) +
                    (rLine.linePositionOnBar === Position.Top
                        ? -(+rLine.lineWidth / 2)
                        : ((self.isHorizontalChart ? self.scaleBandWidth : 0) + +rLine.lineWidth / 2));
                x2 = self.width;
                y2 =
                    self.yScale(value) +
                    (rLine.linePositionOnBar === Position.Top
                        ? -(+rLine.lineWidth / 2)
                        : ((self.isHorizontalChart ? self.scaleBandWidth : 0) + +rLine.lineWidth / 2));
            };

            const getTextXYForVerticalLine = (value: number | string) => {
                x1 =
                    self.xScale(value) +
                    (rLine.linePositionOnBar === Position.Left
                        ? -(+rLine.lineWidth / 2)
                        : ((!self.isHorizontalChart ? self.scaleBandWidth : 0) + +rLine.lineWidth / 2));
                y1 = 0;
                x2 =
                    self.xScale(value) +
                    (rLine.linePositionOnBar === Position.Left
                        ? -(+rLine.lineWidth / 2)
                        : ((!self.isHorizontalChart ? self.scaleBandWidth : 0) + +rLine.lineWidth / 2));
                y2 = self.height;
            };

            let value: string;
            if (rLine.axis === EXYAxisNames.X) {
                if (rLine.type === EReferenceLinesType.Ranking) {
                    const domain: string = self.isHorizontalChart ? self.yScale.domain()?.reverse() : self.xScale.domain();
                    if (rLine.rankOrder === Position.Start || rLine.rankOrder === Position.Bottom) {
                        value = domain[parseInt(rLine.rank) - 1];
                    } else {
                        value = domain[domain.length - (parseInt(rLine.rank) - 1) - 1];
                    }
                } else {
                    value = rLine.value;
                }

                if (value === undefined || value === null) {
                    return;
                }

                if (self.isHorizontalChart) {
                    getTextXYForHorizontalLine(value);
                } else {
                    getTextXYForVerticalLine(value);
                }

                if (self.isHorizontalChart) {
                    getTextX1Y1ForVerticalLine();
                } else {
                    getTextX1Y1ForHorizontalLine();
                }
            } else if (rLine.axis === EXYAxisNames.Y) {
                if (rLine.type === EReferenceLinesType.Ranking) {
                    const domain: string = self.isHorizontalChart
                        ? self.xScale.ticks(self.width / 90)
                        : self.yScale.ticks(self.height / 70);
                    if (rLine.rankOrder === Position.Start || rLine.rankOrder === Position.Bottom) {
                        value = domain[parseInt(rLine.rank) - 1];
                    } else {
                        value = domain[domain.length - (parseInt(rLine.rank) - 1) - 1];
                    }
                } else {
                    value = rLine.value;
                }

                if (value === undefined || value === null) {
                    return;
                }

                if (self.isHorizontalChart) {
                    getTextXYForVerticalLine(value);
                } else {
                    getTextXYForHorizontalLine(value);
                }

                if (self.isHorizontalChart) {
                    getTextX1Y1ForHorizontalLine();
                } else {
                    getTextX1Y1ForVerticalLine();
                }
            }

            const referenceLinesData = {
                x1,
                x2,
                y1,
                y2,
                textX1,
                textY1,
                textAnchor,
                textAlignment,
                ...rLine,
            };
            arr = [...arr, referenceLinesData];
            return arr;
        },
        []
    );
}

const SetAutoBarAreaPositionToHighlight = (self: Visual, rLine: IReferenceLinesSettings): void => {
    if (
        ((rLine.axis == EXYAxisNames.X && !self.isHorizontalChart) ||
            (rLine.axis == EXYAxisNames.Y && self.isHorizontalChart)) &&
        (rLine.barAreaPositionToHighlight === Position.Bottom || rLine.barAreaPositionToHighlight === Position.Top)
    ) {
        rLine.barAreaPositionToHighlight = Position.Left;
    }

    if (
        ((rLine.axis == EXYAxisNames.X && self.isHorizontalChart) ||
            (rLine.axis == EXYAxisNames.Y && !self.isHorizontalChart)) &&
        (rLine.barAreaPositionToHighlight === Position.Left || rLine.barAreaPositionToHighlight === Position.Right)
    ) {
        rLine.barAreaPositionToHighlight = Position.Bottom;
    }
}

const SetAutoLinePositionOnBar = (self: Visual, rLine: IReferenceLinesSettings): void => {
    if (
        rLine.axis == EXYAxisNames.X &&
        !self.isHorizontalChart &&
        (rLine.linePositionOnBar === Position.Bottom || rLine.linePositionOnBar === Position.Top)
    ) {
        rLine.linePositionOnBar = Position.Left;
    }

    if (
        rLine.axis == EXYAxisNames.X &&
        self.isHorizontalChart &&
        (rLine.linePositionOnBar === Position.Left || rLine.linePositionOnBar === Position.Right)
    ) {
        rLine.linePositionOnBar = Position.Top;
    }
}

export const HideDataLabelsBelowReferenceLines = (self: Visual): void => {
    const dataLabels = self.svg.selectAll("#dataLabel");
    dataLabels.attr("display", "block");

    if (!self.dataLabelsSettings.showLabelsBelowReferenceLine) {
        const referenceLinesData = self.referenceLinesData.filter((rLine) => rLine.isHighlightBarArea);
        referenceLinesData.forEach((rLine) => {
            dataLabels.each((d, i, nodes) => {
                const dataLabel = d3Select(nodes[i]);
                const bBox = (dataLabel.node() as SVGSVGElement).getBoundingClientRect();
                const x = bBox.x - self.margin.left - self.settingsPopupOptionsWidth;
                const y = bBox.y - self.margin.top - self.settingsBtnHeight;

                if (!self.isHorizontalChart) {
                    self.chartData.forEach((d) => {
                        if (rLine.barAreaPositionToHighlight === Position.Left) {
                            if (rLine.axis === EXYAxisNames.X) {
                                if (x < rLine.x1) {
                                    dataLabel.attr("display", "none");
                                }
                            }
                        } else if (rLine.barAreaPositionToHighlight === Position.Right) {
                            if (rLine.axis === EXYAxisNames.X) {
                                if (x > rLine.x1) {
                                    dataLabel.attr("display", "none");
                                }
                            }
                        }

                        if (rLine.barAreaPositionToHighlight === Position.Bottom) {
                            if (y > rLine.y1) {
                                dataLabel.attr("display", "none");
                            }
                        } else if (rLine.barAreaPositionToHighlight === Position.Top) {
                            if (y < rLine.y1) {
                                dataLabel.attr("display", "none");
                            }
                        }
                    });
                } else {
                    self.chartData.forEach((d) => {
                        if (rLine.barAreaPositionToHighlight === Position.Left) {
                            if (rLine.axis === EXYAxisNames.Y) {
                                if (x < rLine.x1) {
                                    dataLabel.attr("display", "none");
                                }
                            }
                        } else if (rLine.barAreaPositionToHighlight === Position.Right) {
                            if (rLine.axis === EXYAxisNames.Y) {
                                if (x > rLine.x1) {
                                    dataLabel.attr("display", "none");
                                }
                            }
                        }

                        if (rLine.barAreaPositionToHighlight === Position.Bottom) {
                            if (y > rLine.y1) {
                                dataLabel.attr("display", "none");
                            }
                        } else if (rLine.barAreaPositionToHighlight === Position.Top) {
                            if (y < rLine.y1) {
                                dataLabel.attr("display", "none");
                            }
                        }
                    });
                }
            });
        });
    } else {
        dataLabels.attr("display", "block");
    }
}