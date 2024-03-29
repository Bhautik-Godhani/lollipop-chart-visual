/* eslint-disable max-lines-per-function */
import { create, select } from "d3-selection";
import { Visual } from "../visual";
import { group } from "d3-array";
import { getSVGTextSize } from "./methods";
import { EFontStyle, ESmallMultiplesAxisType, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ISmallMultiplesGridLayoutSettings } from "@truviz/shadow/dist/Components";
import { RenderConnectingLine } from "./ConnectingLine.methods";

export const DrawSmallMultipleBarChart = (self: Visual, config: ISmallMultiplesGridLayoutSettings, gridItemId: number, elementRef: HTMLDivElement) => {
    const headerSettings = config.header;
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const ele = select(elementRef);
    const hostElementsBBox = ele.node().getBoundingClientRect();

    if (hostElementsBBox.width && hostElementsBBox.width > 0 && hostElementsBBox.height && hostElementsBBox.height > 0) {
        ele.selectAll("*").remove();

        const isChartNotLoaded = ele.attr("data-visibility") === "true";

        if (isChartNotLoaded) {
            const div = create("div");
            div.classed("panel-title", true);
            if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                div.style("align-self", "start");
            } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
                div.style("align-self", "end");
            }

            const svgDiv = create("div");
            svgDiv.classed("svg-div", true);

            const panelTitleSize = getSVGTextSize("Test",
                headerSettings.fontFamily,
                headerSettings.fontSize,
                headerSettings.fontStyles[EFontStyle.Bold],
                headerSettings.fontStyles[EFontStyle.Italic],
                headerSettings.fontStyles[EFontStyle.UnderLine]);

            const newItemWidth = hostElementsBBox.width - (config.innerSpacing * 2);
            let newItemHeight = hostElementsBBox.height - (config.innerSpacing * 2) - panelTitleSize.height;

            if (newItemWidth <= 0 || newItemHeight <= 0) {
                return;
            }

            let svgDivMargin = 0;

            if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
                if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                    svgDiv.style("margin-bottom", "0px");
                    svgDiv.style("margin-top", "5px");
                    svgDivMargin = 5;
                } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
                    svgDiv.style("margin-top", "0px");
                    svgDiv.style("margin-bottom", "5px");
                    svgDivMargin = 5;
                }
            } else {
                svgDiv.style("margin-top", "0px");
                svgDiv.style("margin-bottom", "0px");
            }

            svgDiv.style("height", `calc(${100}% - ${svgDivMargin + (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize.height : 0)}px)`);

            // svgDiv.style("height", `calc(${100}% - ${headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize.height : 0}px)`);

            // if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
            //     if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
            //         svgDiv.style("margin-bottom", "0px");
            //         svgDiv.style("margin-top", "10px");
            //     } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
            //         svgDiv.style("margin-top", "0px");
            //         svgDiv.style("margin-bottom", "10px");
            //     }
            // } else {
            //     svgDiv.style("margin-top", "0px");
            //     svgDiv.style("margin-bottom", "0px");
            // }

            if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                (ele.node() as HTMLDivElement).appendChild(div.node());
                (ele.node() as HTMLDivElement).appendChild(svgDiv.node());
            } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
                (ele.node() as HTMLDivElement).appendChild(svgDiv.node());
                (ele.node() as HTMLDivElement).appendChild(div.node());
            }

            const smallMultipleIndex = gridItemId;
            self.currentSmallMultipleIndex = gridItemId;

            const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.originalCategoricalData));
            const smallMultiplesDataPair = self.smallMultiplesDataPairs.find((d) => d.category === config.categories[smallMultipleIndex]);

            const dataValuesIndexes = Object.keys(smallMultiplesDataPair).splice(2);

            clonedCategoricalData.categories.forEach((d) => {
                d.values = dataValuesIndexes.map((valueIndex) => {
                    const id = +valueIndex.split("-")[1];
                    return d.values[id];
                });
            });

            clonedCategoricalData.values.forEach((d) => {
                d.values = dataValuesIndexes.map((valueIndex) => {
                    const id = +valueIndex.split("-")[1];
                    return d.values[id];
                });
            });

            // const initialChartDataByBrushScaleBand = self.setInitialChartData(
            //     clonedCategoricalData,
            //     JSON.parse(JSON.stringify(clonedCategoricalData)),
            //     self.categoricalMetadata,
            //     newItemWidth,
            //     newItemHeight
            // );
            // self.categoricalData = initialChartDataByBrushScaleBand;

            self.smallMultiplesGridItemId = smallMultiplesDataPair.category;

            const svg = create("svg");
            svg.classed("small-multiple-chart", true);
            svg.style("width", newItemWidth + "px");
            svg.style("height", newItemHeight + "px");

            const container = create("svg:g");
            container.classed("container", true);

            if (!isUniformYScale) {
                container.attr("transform", `translate(${self.margin.left}, ${0})`);
            }

            const xAxisG = create("svg:g");
            xAxisG.attr("class", "xAxisG small-multiple-axis");

            const yAxisG = create("svg:g");
            yAxisG.attr("class", "yAxisG small-multiple-axis");

            const brushG = create("svg:g");
            brushG.classed("brush", true);

            const lollipopG = create("svg:g");
            lollipopG.classed("lollipopG", true);

            const dataLabels1G = create("svg:g");
            dataLabels1G.classed("dataLabels1G", true);

            const dataLabels2G = create("svg:g");
            dataLabels2G.classed("dataLabels2G");

            const referenceLineLayersG = create("svg:g").classed("referenceLineLayersG", true);
            const referenceLinesContainerG = create("svg:g").classed("referenceLinesContainerG", true);
            const xGridLinesG = create("svg:g").classed("xGridLinesG", true);
            const yGridLinesG = create("svg:g").classed("yGridLinesG", true);
            const errorBarsContainer = create("svg:g").classed("errorBarsContainer", true);
            const errorBarsMarkerDefsG = create("svg:g").classed("errorBarsMarkerDefsG", true);
            const errorBarsAreaG = create("svg:g").classed("errorBarsAreaG", true);
            const errorBarsAreaPath = create("svg:path").attr("class", "errorBarsArea");
            const errorBarsLinesDashG = create("svg:g").classed("errorBarsLinesDashG", true);
            const errorBarsLinesG = create("svg:g").classed("errorBarsLinesG", true);
            const errorBarsMarkersG = create("svg:g").classed("errorBarsMarkersG", true);
            const errorBarsMarkerDef = create("svg:defs").attr("class", "errorBarsMarkerDefs");
            const errorBarsMarker = create("svg:marker").attr("class", "errorBarsMarker");
            const errorBarsMarkerPath = create("svg:path").attr("class", "errorBarsMarkerPath");
            const dynamicDeviationG = create("svg:g").classed("dynamicDeviationG", true);
            const zeroSeparatorLine = create("svg:line").classed("zeroSeparatorLine", true);
            const connectingLineG = create("svg:g").classed("connectingLineG", true);
            const xAxisTitleG = create("svg:g").classed("xAxisTitleG", true);
            const yAxisTitleG = create("svg:g").classed("yAxisTitleG", true);
            const xAxisLineG = create("svg:g").classed("xAxisLineG", true);
            const yAxisLineG = create("svg:g").classed("yAxisLineG", true);

            svg.node().append(container.node());
            container.node().append(lollipopG.node());
            container.node().append(xAxisG.node());
            container.node().append(yAxisG.node());
            container.node().append(dataLabels1G.node());
            container.node().append(dataLabels2G.node());
            container.node().append(referenceLineLayersG.node());
            container.node().append(referenceLinesContainerG.node());
            container.node().append(xGridLinesG.node());
            container.node().append(yGridLinesG.node());
            container.node().append(dynamicDeviationG.node());
            container.node().append(zeroSeparatorLine.node());
            container.node().append(connectingLineG.node());
            container.node().append(xAxisTitleG.node());
            container.node().append(yAxisTitleG.node());
            container.node().append(xAxisLineG.node());
            container.node().append(yAxisLineG.node());

            // error bars
            container.node().append(errorBarsContainer.node());
            errorBarsContainer.node().append(errorBarsMarkerDefsG.node());
            errorBarsContainer.node().append(errorBarsAreaG.node());
            errorBarsAreaG.node().append(errorBarsAreaPath.node());
            errorBarsContainer.node().append(errorBarsLinesDashG.node());
            errorBarsContainer.node().append(errorBarsLinesG.node());
            errorBarsContainer.node().append(errorBarsMarkersG.node());
            errorBarsMarkersG.node().append(errorBarsMarkerDef.node());
            errorBarsMarkerDef.node().append(errorBarsMarker.node());
            errorBarsMarker.node().append(errorBarsMarkerPath.node());

            svg.node().append(brushG.node());
            svgDiv.node().appendChild(svg.node());

            self.brushG = brushG as any;

            const clonedCategoricalData2 = JSON.parse(JSON.stringify(self.categoricalData));
            const initialChartDataByBrushScaleBand = self.setInitialChartData(
                clonedCategoricalData,
                JSON.parse(JSON.stringify(clonedCategoricalData)),
                self.categoricalMetadata,
                newItemWidth,
                newItemHeight
            );
            self.categoricalData = initialChartDataByBrushScaleBand;

            if (self.isScrollBrushDisplayed) {
                self.brushHeight = self.brushAndZoomAreaSettings.enabled ? self.brushAndZoomAreaHeight : 10;
            }

            newItemHeight -= self.brushHeight;

            if (!self.isScrollBrushDisplayed) {
                self.setCategoricalDataFields(self.categoricalData);
                self.setChartData(self.categoricalData);
            }

            self.setColorsByDataColorsSettings();

            if (self.conditionalFormattingConditions.length) {
                self.setConditionalFormattingColor();
            }

            const textEle = create("div");
            div.node().append(textEle.node());

            textEle.style("font-family", headerSettings.fontFamily);
            textEle.style("font-size", headerSettings.fontSize + "px");
            textEle.style("color", headerSettings.fontColor);
            textEle.style("font-weight", headerSettings.fontStyles.includes(EFontStyle.Bold) ? "bold" : "");
            textEle.style("font-style", headerSettings.fontStyles.includes(EFontStyle.Italic) ? "italic" : "");
            textEle.style("text-decoration", () => {
                const referenceLineTextDecor: string[] = [];
                if (headerSettings.fontStyles.includes(EFontStyle.UnderLine)) referenceLineTextDecor.push("underline");
                return referenceLineTextDecor.length ? referenceLineTextDecor.join(" ") : "";
            });
            textEle.style("text-align", headerSettings.alignment);

            if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
                textEle.style("display", "block");
            } else {
                textEle.style("display", "none");
            }

            if (self.smallMultiplesSettings.header.isTextWrapEnabled) {
                textEle.classed("text-ellipsis", true);
            } else {
                textEle.classed("text-ellipsis", false);
            }

            const total = self.chartData.reduce((count, cur) => count + cur.value1, 0);

            const categoryName = config.categories[smallMultipleIndex];
            const categoryTotal = self.formatNumber(total, self.numberSettings, self.measureNumberFormatter[0], true, true);
            const categoryAvg = self.formatNumber(total / self.chartData.length, self.numberSettings, self.measureNumberFormatter[0], true, true);

            switch (headerSettings.displayType) {
                case ESmallMultiplesHeaderDisplayType.None:
                    textEle.text("");
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleAndTotalValue:
                    textEle.text(categoryName + " : " + categoryTotal);
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleAndAverageValue:
                    textEle.text(categoryName + " : " + categoryAvg);
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleOnly:
                    textEle.text(categoryName);
                    break;
            }

            self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]] = {
                svg: svg.node(),
                xScale: self.xScale,
                yScale: self.yScale,
                lollipopG: lollipopG.node() as any,
                brushScaleBand: self.brushScaleBand,
                xAxisG: xAxisG.node() as any,
                yAxisG: yAxisG.node() as any,
                categoricalData: self.isSMUniformXAxis ? initialChartDataByBrushScaleBand : self.categoricalData,
                brush: null,
                brushG: brushG.node() as any,
                categoricalDataPairs: self.categoricalDataPairs,
                chartData: self.chartData,
            };

            self.svg = svg;
            self.container = container;
            self.viewPortWidth = newItemWidth;
            self.viewPortHeight = newItemHeight;
            self.width = newItemWidth - self.margin.left;
            self.height = newItemHeight - self.margin.bottom;
            self.settingsBtnWidth = 0;
            self.settingsBtnHeight = 0;
            // self.xAxisG = xAxisG as any;
            self.dataLabels1G = dataLabels1G;
            self.dataLabels2G = dataLabels2G;
            self.referenceLineLayersG = referenceLineLayersG as any;
            self.referenceLinesContainerG = referenceLinesContainerG as any;
            self.xGridLinesG = xGridLinesG as any;
            self.yGridLinesG = yGridLinesG as any;
            self.dynamicDeviationG = dynamicDeviationG as any;
            self.zeroSeparatorLine = zeroSeparatorLine as any;
            self.connectingLineG = connectingLineG as any;
            self.xAxisTitleG = xAxisTitleG as any;
            self.yAxisTitleG = yAxisTitleG as any;
            self.xAxisLineG = xAxisLineG as any;
            self.yAxisLineG = yAxisLineG as any;
            self.xAxisTitleText = xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");
            self.yAxisTitleText = yAxisTitleG.append("text").classed("yAxisTitle", true).attr("transform", "rotate(-90)").attr("text-anchor", "middle");

            self.errorBarsContainer = errorBarsContainer as any;
            self.errorBarsMarkerDefsG = errorBarsMarkerDefsG as any;
            self.errorBarsAreaG = errorBarsAreaG as any;
            self.errorBarsAreaPath = errorBarsAreaPath as any;
            self.errorBarsLinesDashG = errorBarsLinesDashG as any;
            self.errorBarsLinesG = errorBarsLinesG as any;
            self.errorBarsMarkersG = errorBarsMarkersG as any;
            self.errorBarsMarkerDef = errorBarsMarkerDef as any;
            self.errorBarsMarker = errorBarsMarker as any;
            self.errorBarsMarkerPath = errorBarsMarkerPath as any;

            if (config.xAxisType === ESmallMultiplesAxisType.Individual) {
                self.xAxisG = xAxisG as any;
            }

            if (config.yAxisType === ESmallMultiplesAxisType.Individual) {
                self.yAxisG = yAxisG as any;
            }

            self.lollipopG = lollipopG as any;

            const smallMultiplesGridItemContent = self.smallMultiplesGridItemContent[smallMultiplesDataPair.category];

            self.xAxisG = select(smallMultiplesGridItemContent.xAxisG);
            self.yAxisG = select(smallMultiplesGridItemContent.yAxisG);
            self.lollipopG = select(smallMultiplesGridItemContent.lollipopG);

            if (self.isScrollBrushDisplayed) {
                self.displayBrush(config.xAxisType === ESmallMultiplesAxisType.Individual, true, config.xAxisType === ESmallMultiplesAxisType.Individual, true);
            } else {
                self.drawXYAxis(config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);
                // self.drawXYAxis(true, true);
                self.margin.left = 0;
                self.margin.bottom = 0;
                self.drawLollipopChart();
            }

            // zero separator line
            if (self.chartSettings.isShowZeroBaseLine) {
                self.drawZeroSeparatorLine();
            } else {
                self.zeroSeparatorLine.attr("display", "none");
            }

            // connecting line
            if (self.chartSettings.showConnectingLine) {
                self.connectingLineG.selectAll("*").remove();

                RenderConnectingLine(self, self.chartData, false);
                if (self.isHasMultiMeasure) {
                    RenderConnectingLine(self, self.chartData, true);
                }
            } else {
                self.connectingLineG.selectAll("*").remove();
            }

            if (self.xAxisSettings.isShowAxisLine) {
                self.drawXAxisLine();
            } else {
                self.xAxisLineG.select(".xAxisLine").remove();
            }

            if (self.yAxisSettings.isShowAxisLine) {
                self.drawYAxisLine();
            } else {
                self.yAxisLineG.select(".yAxisLine").remove();
            }

            self.setMargins();
            self.drawXYAxisTitle();
            self.configLegend();
            self.drawXGridLines();
            self.drawYGridLines();

            if (isUniformXScale) {
                xAxisG.style("display", "none");
            }

            if (isUniformYScale) {
                yAxisG.style("display", "none");
            }

            if (!isUniformXScale) {
                // xAxisG.selectAll("text").attr("y", 0);
                // xAxisG.selectAll("tspan").attr("y", 0);
            }
        }
    }
};

export const GetSmallMultiplesDataPairsByItem = (self: Visual): any => {
    const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.categoricalData));
    const categoricalSmallMultiplesDataField = self.categoricalSmallMultiplesDataField;
    const categoricalDataPairsForGrouping = categoricalSmallMultiplesDataField.values.reduce((arr: any, category: string, index: number) => {
        const obj = { category: category, total: 0, [`index-${index}`]: index };
        return [...arr, obj];
    }, []);
    let categoricalSmallMultiplesValues = categoricalSmallMultiplesDataField.values.filter((item, i, ar) => ar.indexOf(item) === i);

    if (!categoricalSmallMultiplesValues) {
        categoricalSmallMultiplesValues = [];
    }

    const categoricalDataPairsGroup = group(categoricalDataPairsForGrouping, (d: any) => d.category);
    const smallMultiplesDataPairs = categoricalSmallMultiplesValues.map((category) => Object.assign({}, ...categoricalDataPairsGroup.get(category)));

    smallMultiplesDataPairs.forEach(d => {
        const keys = Object.keys(d).splice(2);
        let total = 0;
        keys.forEach(key => {
            const index = key ? +key.split("-")[1] : 0;
            total += +self.categoricalMeasureFields[0].values[index];
        });
        d.total = total;
    });

    smallMultiplesDataPairs.sort((a, b) => b.total - a.total);

    // SortSmallMultiplesDataPairs();

    return smallMultiplesDataPairs;
};
