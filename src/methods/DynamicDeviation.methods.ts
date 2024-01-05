import { Visual } from "../visual";
import { create, select as d3Select, Selection } from "d3-selection";
import { EDynamicDeviationConnectingLineTypes, EDynamicDeviationDisplayTypes, EDynamicDeviationLabelDisplayTypes, EHighContrastColorType, ELineType } from "../enum";
import DynamicDeviationIcon from "../../assets/icons/DeviationIcon.svg";
import { ICategoryValuePair } from "../visual-settings.interface";
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
                return "+" + ((to.value * 100) / from.value).toFixed(2) + "%";
            } else {
                return (100 - (to.value * 100) / from.value).toFixed(2) + "%";
            }
        }
    };

    const dataLabelG = self.dynamicDeviationG.append("g").attr("class", "dynamic-deviation-label");

    let dataLabelText;
    dataLabelText = dataLabelG
        .append("text")
        .attr("fill", self.dynamicDeviationSettings.labelFontColor)
        .attr("text-anchor", "start")
        .attr("dy", "0.02em")
        .attr("font-size", self.dynamicDeviationSettings.labelFontSize)
        .attr("display", "block")
        .attr("font-family", self.dynamicDeviationSettings.labelFontFamily)
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
        .attr("stroke-width", 5)
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
    const start = dataLabelBBox.height + labelToConnectorDistance;
    const isPositiveDeviation = from.value < to.value;

    dataLabelG.attr(
        "transform",
        `translate(${(self.getXPosition(from.value) + self.getXPosition(to.value)) / 2 - dataLabelBBox.width / 2}, ${0})`
    );

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-1", true)
        .attr("x1", self.getXPosition(from.value))
        .attr("x2", self.getXPosition(from.value))
        .attr("y1", start)
        .attr("y2", (self.getYPosition(from.category) ?? 0) + self.scaleBandWidth / 2)
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        );

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-2", true)
        .attr("x1", self.getXPosition(to.value))
        .attr("x2", self.getXPosition(to.value))
        .attr("y1", start)
        .attr("y2", (self.getYPosition(to.category) ?? 0) + self.scaleBandWidth / 2)
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        );

    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.getXPosition(from.value) ?? 0}, ${(self.getYPosition(from.category) ?? 0) + self.scaleBandWidth / 2})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(from.value) && self.getYPosition(from.category) ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${self.getXPosition(to.value) ?? 0}, ${(self.getYPosition(to.category) ?? 0) + self.scaleBandWidth / 2})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(to.value) && self.getYPosition(to.category) ? 1 : 0);
    }

    self.DDConnectorFill = isPositiveDeviation ? self.dynamicDeviationSettings.connectorPositiveColor : self.dynamicDeviationSettings.connectorNegativeColor;

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("y1", start)
        .attr("y2", start)
        .attr("stroke", self.DDConnectorFill)
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth);

    if (isPositiveDeviation) {
        connectorLine
            .attr("x1", self.getXPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.getXPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("x1", self.getXPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("x2", self.getXPosition(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawLeftArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-down")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${self.getXPosition(to.value) - w}, ${start + (w * 3) / 2}) rotate(270)`)
                .attr("fill", self.DDConnectorFill);
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
                .attr("transform", `translate(${self.getXPosition(to.value) + w}, ${start - (w * 3) / 2}) rotate(90)`)
                .attr("fill", self.DDConnectorFill);
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
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${self.getXPosition(from.value)}, ${start})`)
            .attr("fill", self.DDConnectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${self.getXPosition(to.value)}, ${start})`)
            .attr("fill", self.DDConnectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", dynamicDeviationSettings.connectingLineWidth + "px");
    }
}

export const RenderVerticalDynamicDeviationLines = (self: Visual, from: ICategoryValuePair, to: ICategoryValuePair, dataLabelG: D3Selection<SVGElement>): void => {
    const dynamicDeviationSettings = self.dynamicDeviationSettings;
    const dataLabelBBox = (dataLabelG.node() as SVGSVGElement).getBBox();
    const labelToConnectorDistance = 10;
    let dynamicDeviationSpace = 0;
    if (self.dynamicDeviationSettings.isEnabled) {
        dynamicDeviationSpace = self.width * 0.05;
    }
    const xScaleWidth = Math.abs(self.xScale.range()[0] - self.xScale.range()[1]) - dataLabelBBox.width;
    const end = xScaleWidth - dataLabelBBox.width - labelToConnectorDistance;
    const isPositiveDeviation = from.value < to.value;

    dataLabelG.attr(
        "transform",
        `translate(${xScaleWidth - dataLabelBBox.width}, ${(self.getYPosition(from.value) + self.getYPosition(to.value)) / 2 - dataLabelBBox.height / 2
        })`
    );

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-1", true)
        .attr("x1", (self.getXPosition(from.category) ?? 0) + self.scaleBandWidth / 2)
        .attr("x2", end)
        .attr("y1", self.getYPosition(from.value))
        .attr("y2", self.getYPosition(from.value))
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        );

    self.dynamicDeviationG
        .append("line")
        .attr("class", self.dynamicDeviationSettings.connectingLineType)
        .classed("connecting-line-2", true)
        .attr("x1", (self.getXPosition(to.category) ?? 0) + self.scaleBandWidth / 2)
        .attr("x2", end)
        .attr("y1", self.getYPosition(to.value))
        .attr("y2", self.getYPosition(to.value))
        .attr("stroke", self.dynamicDeviationSettings.connectingLineColor)
        .attr("stroke-width", self.dynamicDeviationSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.dynamicDeviationSettings.connectingLineType === ELineType.Dotted
                ? `0, ${8} `
                : `${8}, ${8}`
        );

    if (dynamicDeviationSettings.isShowStartIndicator) {
        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-1")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${(self.getXPosition(from.category) ?? 0) + self.scaleBandWidth / 2}, ${self.getYPosition(from.value) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(from.category) && self.getYPosition(from.value) ? 1 : 0);

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "connecting-circle-2")
            .attr("r", dynamicDeviationSettings.connectingLineWidth * 1.25)
            .attr("transform", `translate(${(self.getXPosition(to.category) ?? 0) + self.scaleBandWidth / 2}, ${self.getYPosition(to.value) ?? 0})`)
            .attr("fill", dynamicDeviationSettings.connectingLineColor)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px")
            .attr("opacity", self.getXPosition(to.category) && self.getYPosition(to.value) ? 1 : 0);
    }

    self.DDConnectorFill = isPositiveDeviation ? self.dynamicDeviationSettings.connectorPositiveColor : self.dynamicDeviationSettings.connectorNegativeColor;

    const connectorLine = self.dynamicDeviationG
        .append("line")
        .attr("class", "connector")
        .attr("x1", end)
        .attr("x2", end)
        .attr("stroke", self.DDConnectorFill)
        .attr("stroke-width", self.dynamicDeviationSettings.connectorWidth);

    if (isPositiveDeviation) {
        connectorLine
            .attr("y1", self.getYPosition(from.value) + dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.getYPosition(to.value) - dynamicDeviationSettings.connectingLineWidth / 2);
    } else {
        connectorLine
            .attr("y1", self.getYPosition(from.value) - dynamicDeviationSettings.connectingLineWidth / 2)
            .attr("y2", self.getYPosition(to.value) + dynamicDeviationSettings.connectingLineWidth / 2);
    }

    if (dynamicDeviationSettings.connectorType === EDynamicDeviationConnectingLineTypes.Arrow) {
        const drawUpArrow = () => {
            const w = self.dynamicDeviationSettings.connectorWidth;
            self.dynamicDeviationG
                .append("polygon")
                .attr("class", "arrow-up")
                .attr("points", `${(w * 3) / 2} ${w}, ${w * 3} ${w * 3}, ${0} ${w * 3} `)
                .attr("transform", `translate(${end - (w * 3) / 2}, ${self.getYPosition(to.value) - w})`)
                .attr("fill", self.DDConnectorFill);
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
                .attr("transform", `translate(${end + (w * 3) / 2}, ${self.getYPosition(to.value) + w}) rotate(180)`)
                .attr("fill", self.DDConnectorFill);
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
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${end}, ${self.getYPosition(from.value)})`)
            .attr("fill", self.DDConnectorFill)
            .attr("stroke", "rgb(102,102,102)")
            .attr("stroke-width", "1px");

        self.dynamicDeviationG
            .append("circle")
            .attr("class", "circle-2")
            .attr("r", dynamicDeviationSettings.connectorWidth * 0.7)
            .attr("transform", `translate(${end}, ${self.getYPosition(to.value)})`)
            .attr("fill", self.DDConnectorFill)
            .attr("stroke", "rgb(102,102,102)")
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

    button.on("click", (e) => {
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
            {
                if (
                    self.lastDynamicDeviationSettings?.displayType !== EDynamicDeviationDisplayTypes.CreateYourOwn ||
                    self.isDynamicDeviationButtonSelected
                ) {
                    RemoveDynamicDeviation(self);
                    self.fromCategoryValueDataPair = undefined;
                    self.toCategoryValueDataPair = undefined;
                }

                if (self.fromCategoryValueDataPair && self.toCategoryValueDataPair) {
                    RenderDynamicDeviation(self, self.fromCategoryValueDataPair, self.toCategoryValueDataPair);
                }
            }
            break;
        case EDynamicDeviationDisplayTypes.CustomRange:
            {
                const chartData = self.isHorizontalChart ? self.chartData.reverse() : self.chartData;
                const fromIndex =
                    dynamicDeviationSettings.fromIndex <= chartDataLength
                        ? dynamicDeviationSettings.fromIndex - 1
                        : chartDataLength - 1;
                const toIndex =
                    dynamicDeviationSettings.toIndex <= chartDataLength
                        ? dynamicDeviationSettings.toIndex - 1
                        : chartDataLength - 1;
                const from = chartData[fromIndex];
                const to = chartData[toIndex];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value1 },
                    { category: to.category, value: to.value1 }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.FirstToLast:
            {
                const from = self.chartData[0];
                const to = self.chartData[chartDataLength - 1];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value1 },
                    { category: to.category, value: to.value1 }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirst:
            {
                const from = self.chartData[chartDataLength - 1];
                const to = self.chartData[0];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value1 },
                    { category: to.category, value: to.value1 }
                );
            }
            break;
        case EDynamicDeviationDisplayTypes.FirstToLastActual:
            {
                RenderDynamicDeviation(self, self.firstCategoryValueDataPair, self.lastCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.LastToFirstActual:
            {
                RenderDynamicDeviation(self, self.lastCategoryValueDataPair, self.firstCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.MinToMax:
            {
                RenderDynamicDeviation(self, self.minCategoryValueDataPair, self.maxCategoryValueDataPair);
            }
            break;
        case EDynamicDeviationDisplayTypes.PenultimateToLast:
            {
                const from = self.chartData[1];
                const to = self.chartData[chartDataLength - 1];
                RenderDynamicDeviation(
                    self,
                    { category: from.category, value: from.value1 },
                    { category: to.category, value: to.value1 }
                );
            }
            break;
    }
}