import { Visual } from "../visual";
import { create, select as d3Select, Selection } from "d3-selection";
import { EDynamicDeviationConnectingLineTypes, EDynamicDeviationDisplayTypes, EDynamicDeviationLabelDisplayTypes, EFontStyle, EHighContrastColorType, ELineType } from "../enum";
import DynamicDeviationIcon from "../../assets/icons/DeviationIcon.svg";
import { ICategoryValuePair } from "../visual-settings.interface";
import { getSVGTextSize } from "./methods";
import { cloneDeep } from "lodash";
import { sum } from "d3-array";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderDynamicDeviation = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair): void => {
    self.fromCategoryValueDataPair = from;
    self.toCategoryValueDataPair = to;
    RemoveDynamicDeviation(self);

    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const isPositiveDeviation = from.value < to.value;
    const isBothLabelDisplayType =
        dynamicDeviationSettings.labelDisplayType === EDynamicDeviationLabelDisplayTypes.Both;

    const getDataLabelValue = (displayType: EDynamicDeviationLabelDisplayTypes) => {
        const dataValue = isPositiveDeviation ? to.value - from.value : -(from.value - to.value);

        if (displayType === EDynamicDeviationLabelDisplayTypes.Value) {
            return (dataValue >= 0 ? "+" : "") + self.formatNumber(dataValue, self.numberSettings, undefined, true, true);
        } else if (displayType === EDynamicDeviationLabelDisplayTypes.Percentage) {
            if (isPositiveDeviation) {
                return ((to.value * 100) / from.value).toFixed(2) + "%";
            } else {
                return -(100 - (to.value * 100) / from.value).toFixed(2) + "%";
            }
        }
    };

    const dataLabelG = self.dynamicDeviationG.append("g").lower().attr("class", "dynamic-deviation-label");

    const dataLabelText = dataLabelG
        .append("text")
        .attr("fill", self.getColor(self.dynamicDeviationSettings.labelFontColor, EHighContrastColorType.Foreground))
        .attr("text-anchor", "start")
        .attr("dy", "0.02em")
        .attr("font-size", self.dynamicDeviationSettings.labelFontSize)
        .attr("display", self.dynamicDeviationSettings.isShowDataLabel ? "block" : "none")
        .attr("font-family", self.dynamicDeviationSettings.labelFontFamily)
        .attr("text-decoration", self.dynamicDeviationSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
        .attr("font-weight", self.dynamicDeviationSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
        .attr("font-style", self.dynamicDeviationSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
        .text(!isBothLabelDisplayType ? getDataLabelValue(dynamicDeviationSettings.labelDisplayType) : "");

    if (isBothLabelDisplayType) {
        dataLabelText
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(getDataLabelValue(EDynamicDeviationLabelDisplayTypes.Value));
        dataLabelText
            .append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(`(${getDataLabelValue(EDynamicDeviationLabelDisplayTypes.Percentage)})`);
    }

    const clonedTitle = dataLabelText.clone(true);
    clonedTitle
        .lower()
        .attr("class", "title-shadow")
        .attr("stroke", self.getColor(self.dynamicDeviationSettings.backgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("opacity", self.dynamicDeviationSettings.isShowLabelBackground ? "1" : "0");

    if (self.isHorizontalChart) {
        RenderHorizontalDynamicDeviationLines(self, from, to, dataLabelG);
    } else {
        RenderVerticalDynamicDeviationLines(self, from, to, dataLabelG);
    }
}

export const RemoveDynamicDeviation = (self: Visual): void => {
    self.dynamicDeviationG.selectAll("*").remove();
}

export const RenderHorizontalDynamicDeviationLines = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair, dataLabelG: D3Selection<SVGElement>): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const dataLabelBBox = (dataLabelG.node() as SVGSVGElement).getBBox();
    const labelToConnectorDistance = 10;
    const isPositiveDeviation = from.value < to.value;

    const fromCategoryYPos = self.getYPosition(from.category);
    const toCategoryYPos = self.getYPosition(to.category);
    const isFromCategoryYPosTrue = fromCategoryYPos !== undefined;
    const isToCategoryYPosTrue = toCategoryYPos !== undefined;
    const isToGreaterThenFrom: boolean = to.value > from.value;
    const hide = isToGreaterThenFrom ? isFromCategoryYPosTrue : isToCategoryYPosTrue;
    const start = isFromCategoryYPosTrue ? fromCategoryYPos + self.scaleBandWidth / 2 : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirstActual ? (self.isBottomXAxis ? self.height : 0) : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLastActual || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) ? (self.isBottomXAxis ? 0 : self.height) : self.height);
    const end = isToCategoryYPosTrue ? toCategoryYPos + self.scaleBandWidth / 2 : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirstActual ? (self.isBottomXAxis ? 0 : self.height) : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLastActual || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) ? (self.isBottomXAxis ? self.height : 0) : 0);

    let dataLabelYPos = isToGreaterThenFrom ? start : end;

    // if (isToGreaterThenFrom) {
    if (dataLabelYPos < (dataLabelBBox.height + labelToConnectorDistance)) {
        dataLabelYPos = dataLabelYPos + getSVGTextSize("Title", dynamicDeviationSettings.labelFontFamily, dynamicDeviationSettings.labelFontSize).height;
    } else {
        dataLabelYPos = dataLabelYPos - labelToConnectorDistance;
    }

    // if (end < (dataLabelBBox.height + labelToConnectorDistance)) {
    //     dataLabelYPos = end + labelToConnectorDistance;
    // } else {
    //     dataLabelYPos = end - labelToConnectorDistance;
    // }
    // }

    dataLabelG.attr(
        "transform",
        `translate(${(self.getXPosition(from.value) + self.getXPosition(to.value)) / 2 - dataLabelBBox.width / 2}, ${dataLabelYPos})`
    )
        .attr("display", hide ? "block" : "none");

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-1", true)
        .attr("display", self.dynamicDeviationSettings.isShowConnectorLine ? "block" : "none")
        .attr("x1", self.getXPosition(isToGreaterThenFrom ? to.value : from.value))
        .attr("x2", self.getXPosition(isToGreaterThenFrom ? to.value : from.value))
        .attr("y1", start)
        .attr("y2", end)
        .attr("stroke", self.getColor(self.dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Foreground))
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        )
        .attr("opacity", () => {
            if (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange) {
                const index = self.categoricalDataPairs.findIndex(d => d.category === self.chartData[0].category);
                if (index >= dynamicDeviationSettings.fromIndex && index < dynamicDeviationSettings.toIndex) {
                    return 1;
                } else if (!isFromCategoryYPosTrue && !isToCategoryYPosTrue) {
                    return 0;
                }
            } else if (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) {
                const index = self.categoricalDataPairs.findIndex(d => d.category === self.chartData[0].category);
                const fromIndex = self.categoricalDataPairs.findIndex(d => d.category === from.category);
                const toIndex = self.categoricalDataPairs.findIndex(d => d.category === to.category);

                if (index >= fromIndex && index < toIndex) {
                    return 1;
                } else if (!isFromCategoryYPosTrue && !isToCategoryYPosTrue) {
                    return 0;
                }
            }

            return 1;
        });

    self.DDConnectorFill = isPositiveDeviation ? self.dynamicDeviationSettings.connectorPositiveColor : self.dynamicDeviationSettings.connectorNegativeColor;

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("y1", isToGreaterThenFrom ? start : end)
        .attr("y2", isToGreaterThenFrom ? start : end)
        .attr("stroke", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth)
        .attr("display", hide ? "block" : "none");

    if (self.dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        connectorLine
            .attr("stroke-dasharray", `${self.dynamicDeviationSettings.connectorWidth * 2}, ${self.dynamicDeviationSettings.connectorWidth * 2}`);
    }

    if (isPositiveDeviation) {
        connectorLine
            .attr("x1", self.getXPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.getXPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("x1", self.getXPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.getXPosition(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    }

    drawHorizontalDDElements(self, from, to, start, end, isFromCategoryYPosTrue, isFromCategoryYPosTrue, isToGreaterThenFrom, hide, connectorLine, isPositiveDeviation);

    dataLabelG.raise();
}

const drawHorizontalDDElements = (self: Visual, from, to, start, end, isFromCategoryYPosTrue, isToCategoryYPosTrue, isToGreaterThenFrom, hide, connectorLine, isPositiveDeviation) => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("display", self.dynamicDeviationSettings.isShowConnectorLine ? "block" : "none")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.getXPosition(from.value) ? self.getXPosition(from.value) : 0}, ${start})`)
            .attr("fill", self.getColor(dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(from.value) && isFromCategoryYPosTrue ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("display", self.dynamicDeviationSettings.isShowConnectorLine ? "block" : "none")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.getXPosition(to.value) ? self.getXPosition(to.value) : 0}, ${end})`)
            .attr("fill", self.getColor(dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(to.value) && isToCategoryYPosTrue ? 1 : 0);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawLeftArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-down")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${self.getXPosition(to.value) - w}, ${(isToGreaterThenFrom ? start : end) + (w * 3) / 2}) rotate(270)`)
                .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
                .attr("display", hide ? "block" : "none");

            connectorLine
                .attr("x1", self.getXPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("x2", self.getXPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2 + w);
        };

        const drawRightArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-up")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${self.getXPosition(to.value) + w}, ${(isToGreaterThenFrom ? start : end) - (w * 3) / 2}) rotate(90)`)
                .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
                .attr("display", hide ? "block" : "none");

            connectorLine
                .attr("x1", self.getXPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("x2", self.getXPosition(to.value) - w);
        };

        if ((isPositiveDeviation && self.isLeftYAxis) || (!isPositiveDeviation && !self.isLeftYAxis)) {
            drawRightArrow();
        } else {
            drawLeftArrow();
        }
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-1")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.9)
            .attr("transform", `translate(${self.getXPosition(from.value)}, ${start})`)
            .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.9)
            .attr("transform", `translate(${self.getXPosition(to.value)}, ${start})`)
            .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");
    }
}

export const RenderVerticalDynamicDeviationLines = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair, dataLabelG: D3Selection<SVGElement>): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const dataLabelBBox = (dataLabelG.node() as SVGSVGElement).getBBox();
    const labelToConnectorDistance = 10;
    const fromCategoryXPos = self.getXPosition(from.category);
    const toCategoryXPos = self.getXPosition(to.category);
    const isFromCategoryXPosTrue = fromCategoryXPos !== undefined;
    const isToCategoryXPosTrue = toCategoryXPos !== undefined;
    const isPositiveDeviation = from.value < to.value;
    const isToGreaterThenFrom: boolean = to.value > from.value;
    const hide = isToGreaterThenFrom ? isFromCategoryXPosTrue : isToCategoryXPosTrue;
    const start = isFromCategoryXPosTrue ? fromCategoryXPos + self.scaleBandWidth / 2 : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirstActual ? (self.isLeftYAxis ? self.width : 0) : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLastActual || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) ? (self.isLeftYAxis ? 0 : self.width) : self.width);
    const end = isToCategoryXPosTrue ? toCategoryXPos + self.scaleBandWidth / 2 : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirstActual ? (self.isLeftYAxis ? 0 : self.width) : (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLastActual || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange || dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) ? (self.isLeftYAxis ? self.width : 0) : 0);

    let dataLabelXPos = 0;
    if (isToGreaterThenFrom) {
        if ((start - dataLabelBBox.width - labelToConnectorDistance) < self.margin.left) {
            dataLabelXPos = start + labelToConnectorDistance;
        } else {
            dataLabelXPos = start - dataLabelBBox.width - labelToConnectorDistance;
        }
    } else {
        if ((end + dataLabelBBox.width + labelToConnectorDistance) > self.width) {
            dataLabelXPos = end - dataLabelBBox.width - labelToConnectorDistance;
        } else {
            dataLabelXPos = end + labelToConnectorDistance;
        }
    }

    dataLabelG
        .attr(
            "transform",
            `translate(${dataLabelXPos}, ${(self.getYPosition(from.value) + self.getYPosition(to.value)) / 2
            })`)
        .attr("display", hide ? "block" : "none");

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-1", true)
        .attr("x1", start)
        .attr("x2", end)
        .attr("y1", self.getYPosition(isToGreaterThenFrom ? to.value : from.value))
        .attr("y2", self.getYPosition(isToGreaterThenFrom ? to.value : from.value))
        .attr("stroke", self.getColor(self.dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Foreground))
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        )
        .attr("display", !self.dynamicDeviationSettings.isShowConnectorLine ? "none" : "block")
        .attr("opacity", () => {
            if (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CustomRange) {
                const index = self.categoricalDataPairs.findIndex(d => d.category === self.chartData[0].category);
                if (index >= dynamicDeviationSettings.fromIndex && index < dynamicDeviationSettings.toIndex) {
                    return 1;
                } else if (!isFromCategoryXPosTrue && !isToCategoryXPosTrue) {
                    return 0;
                }
            } else if (dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) {
                const index = self.categoricalDataPairs.findIndex(d => d.category === self.chartData[0].category);
                const fromIndex = self.categoricalDataPairs.findIndex(d => d.category === from.category);
                const toIndex = self.categoricalDataPairs.findIndex(d => d.category === to.category);

                if (index >= fromIndex && index < toIndex) {
                    return 1;
                } else if (!isFromCategoryXPosTrue && !isToCategoryXPosTrue) {
                    return 0;
                }
            }

            return 1;
        });

    self.DDConnectorFill = isPositiveDeviation ? self.dynamicDeviationSettings.connectorPositiveColor : self.dynamicDeviationSettings.connectorNegativeColor;

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("x1", isToGreaterThenFrom ? start : end)
        .attr("x2", isToGreaterThenFrom ? start : end)
        .attr("stroke", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth)
        .attr("display", hide ? "block" : "none");

    if (self.dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        connectorLine
            .attr("stroke-dasharray", `${self.dynamicDeviationSettings.connectorWidth * 2}, ${self.dynamicDeviationSettings.connectorWidth * 2}`);
    }

    if (isPositiveDeviation) {
        connectorLine
            .attr("y1", self.getYPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.getYPosition(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("y1", self.getYPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.getYPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    }

    drawVerticalDDElements(self, from, to, start, end, isFromCategoryXPosTrue, isToCategoryXPosTrue, isToGreaterThenFrom, hide, connectorLine, isPositiveDeviation);

    dataLabelG.raise();
}

const drawVerticalDDElements = (self: Visual, from, to, start, end, isFromCategoryXPosTrue, isToCategoryXPosTrue, isToGreaterThenFrom, hide, connectorLine, isPositiveDeviation) => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;

    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("display", self.dynamicDeviationSettings.isShowConnectorLine ? "block" : "none")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${start}, ${self.getYPosition(from.value) ? self.getYPosition(from.value) : 0})`)
            .attr("fill", self.getColor(dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px")
            .attr("opacity", isFromCategoryXPosTrue && self.getYPosition(from.value) ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("display", self.dynamicDeviationSettings.isShowConnectorLine ? "block" : "none")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${end}, ${self.getYPosition(to.value) ? self.getYPosition(to.value) : 0})`)
            .attr("fill", self.getColor(dynamicDeviationSettings.connectingLineColor, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px")
            .attr("opacity", isToCategoryXPosTrue && self.getYPosition(to.value) ? 1 : 0);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawUpArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-up")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${(isToGreaterThenFrom ? start : end) - (w * 3) / 2}, ${self.getYPosition(to.value) - w})`)
                .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
                .attr("display", hide ? "block" : "none");

            connectorLine
                .attr("y1", self.getYPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("y2", self.getYPosition(to.value) + w * 2);
        };

        const drawDownArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-down")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${(isToGreaterThenFrom ? start : end) + (w * 3) / 2}, ${self.getYPosition(to.value) + w}) rotate(180)`)
                .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Foreground))
                .attr("display", hide ? "block" : "none");

            connectorLine
                .attr("y1", self.getYPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
                .attr("y2", self.getYPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2 - w * 2);
        };

        if ((isPositiveDeviation && self.isBottomXAxis) || (!isPositiveDeviation && !self.isBottomXAxis)) {
            drawUpArrow();
        } else {
            drawDownArrow();
        }
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Dots) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-1")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.9)
            .attr("transform", `translate(${end}, ${self.getYPosition(from.value)})`)
            .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.9)
            .attr("transform", `translate(${end}, ${self.getYPosition(to.value)})`)
            .attr("fill", self.getColor(self.DDConnectorFill, EHighContrastColorType.Background))
            .attr("stroke", self.getColor("rgb(102,102,102)", EHighContrastColorType.Foreground))
            .attr("stroke-width", "1px");
    }
}

export const ShowStaticTooltip = (self: Visual, event: MouseEvent, displayName: string): void => {
    self.visualHost.tooltipService.show({
        coordinates: [event["clientX"] - 10, event["clientY"]],
        isTouchEvent: false,
        dataItems: [
            {
                displayName: displayName,
                value: "",
            },
        ],
        identities: null,
    });
}

export const HideStaticTooltip = (self: Visual): void => {
    self.visualHost.tooltipService.hide({
        isTouchEvent: false,
        immediately: true,
    });
}

export const RenderDynamicDeviationIcon = (self: Visual): void => {
    d3Select(".dynamic-deviation-button").remove();

    const button = create("button").attr("class", "dynamic-deviation-button tooltip");

    const img = create("img").attr("class", "dynamic-deviation-button-img").attr("src", DynamicDeviationIcon).attr("title", "Dynamic Deviation");

    button.node().appendChild(img.node());

    // button.on("mouseover", (e) => {
    //     ShowStaticTooltip(self, e, "Dynamic Deviation");
    // });

    // button.on("mouseout", () => {
    //     HideStaticTooltip(self);
    // });

    button.on("click", () => {
        const buttonNode = button.node();
        buttonNode.classList.toggle("selected");
        if (buttonNode.classList.contains("selected")) {
            self.isDynamicDeviationButtonSelected = true;
            RemoveDynamicDeviation(self);
            self.fromCategoryValueDataPair = undefined;
            self.toCategoryValueDataPair = undefined;
            self.lollipopG
                .selectAll(".lollipop-group")
                .style("cursor", "cell");
            self.isDeviationCreatedAfterButtonClicked = false;
        } else {
            self.lollipopG.selectAll(".lollipop-group").style("cursor", "auto");
        }
    });

    self.hostContainer.querySelector(".icons-bar #general-icons-wrapper").append(button.node());
}

export const SetDynamicDeviationDataAndDrawLines = (self: Visual): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const chartDataLength = self.chartData.length;

    switch (dynamicDeviationSettings.displayType) {
        case EDynamicDeviationDisplayTypes.Auto:
            {
                RenderDynamicDeviation(self, self.minCategoryValueDataPair, self.maxCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.CreateYourOwn:
            drawCreateYourOwnDD(self);
            break;
        case EDynamicDeviationDisplayTypes.CustomRange:
            drawCustomRangeDD(self);
            break;
        case EDynamicDeviationDisplayTypes.FirstToLast:
            {
                const from = self.chartData[0];
                const to = self.chartData[chartDataLength - 1];
                if (self.isHorizontalChart) {
                    RenderDynamicDeviation(
                        self,
                        { category: to.category, value: to.value1 },
                        { category: from.category, value: from.value1 }
                    );
                } else {
                    RenderDynamicDeviation(
                        self,
                        { category: from.category, value: from.value1 },
                        { category: to.category, value: to.value1 }
                    );
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirst:
            {
                const from = self.chartData[chartDataLength - 1];
                const to = self.chartData[0];
                if (self.isHorizontalChart) {
                    RenderDynamicDeviation(
                        self,
                        { category: to.category, value: to.value1 },
                        { category: from.category, value: from.value1 }
                    );
                } else {
                    RenderDynamicDeviation(
                        self,
                        { category: from.category, value: from.value1 },
                        { category: to.category, value: to.value1 }
                    );
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.FirstToLastActual:
            {
                if (self.isHorizontalChart) {
                    RenderDynamicDeviation(self, self.lastCategoryValueDataPair, self.firstCategoryValueDataPair);
                } else {
                    RenderDynamicDeviation(self, self.firstCategoryValueDataPair, self.lastCategoryValueDataPair);
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirstActual:
            {
                if (self.isHorizontalChart) {
                    RenderDynamicDeviation(self, self.firstCategoryValueDataPair, self.lastCategoryValueDataPair);
                } else {
                    RenderDynamicDeviation(self, self.lastCategoryValueDataPair, self.firstCategoryValueDataPair);
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.MinToMax:
            {
                RenderDynamicDeviation(self, self.minCategoryValueDataPair, self.maxCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.PenultimateToLast:
            {
                const chartData = self.isHorizontalChart ? cloneDeep(self.chartData).reverse() : self.chartData;
                const from = chartData[chartDataLength - 2];
                const to = chartData[chartDataLength - 1];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value1 },
                    { category: to.category, value: to.value1 }
                );
            }
            break;
    }
}

const drawCreateYourOwnDD = (self: Visual) => {
    if ((self.lastDynamicDeviationSettings &&
        self.lastDynamicDeviationSettings.displayType !== EDynamicDeviationDisplayTypes.CreateYourOwn) ||
        self.isDynamicDeviationButtonSelected
    ) {
        RemoveDynamicDeviation(self);
        self.fromCategoryValueDataPair = undefined;
        self.toCategoryValueDataPair = undefined;
        self.lollipopG.selectAll(".lollipop-group").style("cursor", "cell");
    }

    if (self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && self.dynamicDeviationSettings.removeCurrentDeviation) {
        RemoveDynamicDeviation(self);
        self.fromCategoryValueDataPair = undefined;
        self.toCategoryValueDataPair = undefined;
        self.lollipopG.selectAll(".lollipop-group").style("cursor", "cell");
    }

    const { from, to } = self.dynamicDeviationSettings.createYourOwnDeviation;
    if (from && to) {
        RenderDynamicDeviation(self, from, to);
    }
}

const drawCustomRangeDD = (self: Visual) => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const clonedCategoricalDataPairs = cloneDeep(self.categoricalDataPairs);
    const categoricalDataPairs = self.isHorizontalChart ? clonedCategoricalDataPairs.reverse() : clonedCategoricalDataPairs;
    const fromIndex = categoricalDataPairs[dynamicDeviationSettings.fromIndex - 1];
    const toIndex = categoricalDataPairs[dynamicDeviationSettings.toIndex - 1];
    const measureKey = Object.keys(categoricalDataPairs[0]).find(d => d.includes("measure"));
    const fromTotal = sum(Object.keys(fromIndex).filter(d => d.includes("measure")), d => fromIndex[d]);
    const toTotal = sum(Object.keys(toIndex).filter(d => d.includes("measure")), d => toIndex[d]);
    const from = dynamicDeviationSettings.fromIndex <= categoricalDataPairs.length ? { ...fromIndex, value1: self.isHasSubcategories ? fromTotal * (self.isPercentageMeasure ? 100 : 1) : fromIndex[measureKey] } : { ...self.firstCategoryValueDataPair, value1: self.firstCategoryValueDataPair.value };
    const to = dynamicDeviationSettings.toIndex <= categoricalDataPairs.length ? { ...toIndex, value1: self.isHasSubcategories ? toTotal * (self.isPercentageMeasure ? 100 : 1) : toIndex[measureKey] } : { ...self.lastCategoryValueDataPair, value1: self.lastCategoryValueDataPair.value };

    RenderDynamicDeviation(
        self,
        { category: from.category, value: from.value1 },
        { category: to.category, value: to.value1 }
    );
}