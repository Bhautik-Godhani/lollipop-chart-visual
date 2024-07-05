/* eslint-disable max-lines-per-function */
import { create, select } from "d3-selection";
import { Visual } from "../visual";
import { Primitive, group, sum } from "d3-array";
import { CreateDate, getSVGTextSize } from "./methods";
import { EFontStyle, ESmallMultiplesAxisType, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition } from "@truviz/shadow/dist/Components";
import { RenderConnectingLine } from "./ConnectingLine.methods";
import { EDataRolesName, ERankingCalcMethod, ERankingType, ESortOrderTypes } from "../enum";
import { ISmallMultiplesGridItemContent, ISmallMultiplesGridLayoutSettings } from "../SmallMultiplesGridLayout";
import { cloneDeep } from "lodash";
import { CallExpandAllXScaleOnAxisGroup, RenderExpandAllXAxis } from "./expandAllXAxis.methods";
import { MonthNames } from "../constants";
import { ISortingProps } from "../visual-settings.interface";

export const DrawSmallMultipleBarChart = (self: Visual, config: ISmallMultiplesGridLayoutSettings, gridItemId: number, rowIndex: number, colIndex: number, elementRef: HTMLDivElement) => {
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
                headerSettings.fontStyles[EFontStyle.UnderLine]).height + 5;

            let newItemWidth = hostElementsBBox.width - (config.innerSpacing * 2);
            let newItemHeight = hostElementsBBox.height - (config.innerSpacing * 2) - panelTitleSize;

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

            svgDiv.style("height", `calc(${100}% - ${svgDivMargin + (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize : 0)}px)`);

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
            const isOthersSM = config.categories[smallMultipleIndex].toString().includes(self.othersLabel);
            const clonedCategoricalData: powerbi.DataViewCategorical = cloneDeep(self.originalCategoricalData);

            self.isCurrentSmallMultipleIsOthers = false;

            if (isOthersSM) {
                self.isCurrentSmallMultipleIsOthers = true;
                const SMRaking = self.rankingSettings.smallMultiples;
                let othersSMData: any[];

                if (SMRaking.enabled) {
                    if (SMRaking.rankingType === ERankingType.TopN) {
                        if (self.isHorizontalChart) {
                            if (SMRaking.count <= self.smallMultiplesDataPairs.length) {
                                othersSMData = self.smallMultiplesDataPairs.slice(SMRaking.count, self.smallMultiplesDataPairs.length);
                            }
                        } else {
                            othersSMData = self.smallMultiplesDataPairs.slice(SMRaking.count, self.smallMultiplesDataPairs.length);
                        }
                    }
                    if (SMRaking.rankingType === ERankingType.BottomN) {
                        if (self.isHorizontalChart) {
                            othersSMData = self.smallMultiplesDataPairs.slice(0, self.smallMultiplesDataPairs.length - SMRaking.count);
                        } else {
                            if (SMRaking.count <= self.smallMultiplesDataPairs.length) {
                                othersSMData = self.smallMultiplesDataPairs.slice(0, self.smallMultiplesDataPairs.length - SMRaking.count);
                            }
                        }
                    }
                }

                const smallMultiplesDataPair = self.smallMultiplesDataPairs.find((d) => d.category === self.smallMultiplesCategories[0]);
                const dataValuesIndexes = Object.keys(smallMultiplesDataPair).filter(key => key.includes("index-"));
                clonedCategoricalData.categories.forEach((d) => {
                    d.values = dataValuesIndexes.map((valueIndex) => {
                        const id = +valueIndex.split("-")[1];
                        return d.values[id];
                    });
                });

                clonedCategoricalData.values.forEach((d) => {
                    const values: Primitive[][] = [];

                    if (d.source.roles[EDataRolesName.Measure]) {
                        othersSMData.forEach(o => {
                            const smallMultiplesDataPair = self.smallMultiplesDataPairs.find((d) => d.category === o.category);
                            const dataValuesIndexes = Object.keys(smallMultiplesDataPair).filter(key => key.includes("index-"));

                            const values1 = dataValuesIndexes.map((valueIndex) => {
                                const id = +valueIndex.split("-")[1];
                                return d.values[id];
                            });

                            values.push(values1);
                        });

                        d.values = values[0].map((_, i) => (SMRaking.calcMethod === ERankingCalcMethod.Sum ? sum(values, d => <number>d[i]) : sum(values, d => <number>d[i]) / othersSMData.length));
                    } else if (d.source.roles[EDataRolesName.ImagesData]) {
                        d.values = dataValuesIndexes.map((valueIndex) => {
                            const id = +valueIndex.split("-")[1];
                            return d.values[id];
                        });
                    }
                });

                self.smallMultiplesGridItemId = smallMultiplesDataPair.category;
            } else {
                const smallMultiplesDataPair = self.smallMultiplesDataPairs.find((d) => d.category === config.categories[smallMultipleIndex]);
                const dataValuesIndexes = Object.keys(smallMultiplesDataPair).filter(key => key.includes("index-"));

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

                    d.highlights = dataValuesIndexes.map((valueIndex) => {
                        const id = +valueIndex.split("-")[1];
                        return (d.highlights && d.highlights.length > 0) ? d.highlights[id] : null;
                    });
                });

                self.smallMultiplesGridItemId = smallMultiplesDataPair.category;
            }

            // const initialChartDataByBrushScaleBand = self.setInitialChartData(
            //     clonedCategoricalData,
            //     JSON.parse(JSON.stringify(clonedCategoricalData)),
            //     self.categoricalMetadata,
            //     newItemWidth,
            //     newItemHeight
            // );
            // self.categoricalData = initialChartDataByBrushScaleBand;

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
            container.node().append(xAxisLineG.node());
            container.node().append(yAxisLineG.node());
            container.node().append(xGridLinesG.node());
            container.node().append(yGridLinesG.node());
            container.node().append(zeroSeparatorLine.node());
            container.node().append(lollipopG.node());
            container.node().append(xAxisG.node());
            container.node().append(yAxisG.node());
            container.node().append(dataLabels1G.node());
            container.node().append(dataLabels2G.node());
            container.node().append(referenceLineLayersG.node());
            container.node().append(referenceLinesContainerG.node());
            container.node().append(dynamicDeviationG.node());
            container.node().append(connectingLineG.node());
            container.node().append(xAxisTitleG.node());
            container.node().append(yAxisTitleG.node());

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

            self.viewPortWidth = newItemWidth;
            self.viewPortHeight = newItemHeight;
            self.width = newItemWidth;
            self.height = newItemHeight;

            const initialChartDataByBrushScaleBand = self.setInitialChartData(
                clonedCategoricalData,
                cloneDeep(clonedCategoricalData),
                self.categoricalMetadata,
                newItemWidth,
                newItemHeight
            );
            self.categoricalData = initialChartDataByBrushScaleBand;

            if (self.isScrollBrushDisplayed) {
                if (self.isHorizontalBrushDisplayed) {
                    self.brushHeight = self.brushAndZoomAreaSettings.enabled ? self.brushAndZoomAreaHeight : 10;
                } else {
                    self.brushWidth = self.brushAndZoomAreaSettings.enabled ? self.brushAndZoomAreaWidth : 10;
                }
            }

            newItemHeight -= self.brushHeight;
            newItemWidth -= self.brushWidth;

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

            // if (self.smallMultiplesSettings.header.isTextWrapEnabled) {
            textEle.classed("text-ellipsis", true);
            // } else {
            //     textEle.classed("text-ellipsis", false);
            // }

            const total = config.gridDataItemsTotals[smallMultipleIndex];

            const categoryName = config.categories[smallMultipleIndex];
            const categoryTotal = self.formatNumber(total, self.numberSettings, self.measureNumberFormatter[0], true, true);
            const categoryAvg = self.formatNumber(total / self.chartData.length, self.numberSettings, self.measureNumberFormatter[0], true, true);

            switch (headerSettings.displayType) {
                case ESmallMultiplesHeaderDisplayType.None:
                    textEle.text("");
                    textEle.attr("title", "");
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleAndTotalValue:
                    textEle.text(categoryName + " : " + categoryTotal);
                    textEle.attr("title", categoryName + " : " + categoryTotal);
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleAndAverageValue:
                    textEle.text(categoryName + " : " + categoryAvg);
                    textEle.attr("title", categoryName + " : " + categoryAvg);
                    break;
                case ESmallMultiplesHeaderDisplayType.TitleOnly:
                    textEle.text(categoryName);
                    textEle.attr("title", categoryName);
                    break;
            }

            const content: ISmallMultiplesGridItemContent = {
                svg: svg.node(),
                xScale: self.xScale,
                yScale: self.yScale,
                lollipopG: lollipopG as any,
                brushScaleBand: self.brushScaleBand,
                xAxisG: xAxisG.node() as any,
                yAxisG: yAxisG.node() as any,
                categoricalData: self.isSMUniformXAxis ? initialChartDataByBrushScaleBand : self.categoricalData,
                brush: null,
                brushG: brushG.node() as any,
                categoricalDataPairs: self.categoricalDataPairs,
                firstCategoryValueDataPair: self.firstCategoryValueDataPair,
                lastCategoryValueDataPair: self.lastCategoryValueDataPair,
                chartData: self.chartData,
                dataLabels1G: dataLabels1G as any,
                dataLabels2G: dataLabels2G as any,
                referenceLineLayersG: referenceLineLayersG as any,
                referenceLinesContainerG: referenceLinesContainerG as any,
                xGridLinesG: xGridLinesG as any,
                yGridLinesG: yGridLinesG as any,
                dynamicDeviationG: dynamicDeviationG as any,
                zeroSeparatorLine: zeroSeparatorLine as any,
                connectingLineG: connectingLineG as any,
                errorBarsContainer: errorBarsContainer as any,
                errorBarsMarkerDefsG: errorBarsMarkerDefsG as any,
                errorBarsAreaG: errorBarsAreaG as any,
                errorBarsAreaPath: errorBarsAreaPath as any,
                errorBarsLinesDashG: errorBarsLinesDashG as any,
                errorBarsLinesG: errorBarsLinesG as any,
                errorBarsMarkersG: errorBarsMarkersG as any,
                errorBarsMarkerDef: errorBarsMarkerDef as any,
                errorBarsMarker: errorBarsMarker as any,
                errorBarsMarkerPath: errorBarsMarkerPath as any
            };

            self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]] = content;

            self.smallMultiplesGridItemsList.push({
                rowIndex,
                colIndex,
                content
            });

            self.svg = svg;
            self.container = container;
            self.viewPortWidth = newItemWidth;
            self.viewPortHeight = newItemHeight;
            // self.width = newItemWidth;
            // self.height = newItemHeight;
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
            self.xAxisLineG = xAxisLineG as any;
            self.yAxisLineG = yAxisLineG as any;

            if (!isUniformXScale) {
                self.xAxisTitleG = xAxisTitleG as any;
                self.xAxisTitleText = xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");
            }

            if (!isUniformYScale) {
                self.yAxisTitleG = yAxisTitleG as any;
                self.yAxisTitleText = yAxisTitleG.append("text").classed("yAxisTitle", true).attr("transform", "rotate(-90)").attr("text-anchor", "middle");
            }

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

            const smallMultiplesGridItemContent = self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]];

            self.xAxisG = select(smallMultiplesGridItemContent.xAxisG);
            self.yAxisG = select(smallMultiplesGridItemContent.yAxisG);
            self.lollipopG = smallMultiplesGridItemContent.lollipopG;

            if (isUniformXScale) {
                self.xAxisTitleMargin = 0;
            }

            if (isUniformYScale) {
                self.yAxisTitleMargin = 0;
            }

            self.setMargins();

            self.drawXYAxis(self.categoricalData, config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);

            self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]].xScale = self.xScale;
            self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]].yScale = self.yScale;

            let isDisplayBrushCalled: boolean = false;

            if (self.categoricalCategoriesLastIndex > 0) {
                if (!self.isHorizontalChart) {
                    RenderExpandAllXAxis(self, self.categoricalData);
                }
                // else {
                // 	RenderExpandAllYAxis(this, this.categoricalData);
                // }
            }

            if (self.isScrollBrushDisplayed) {
                self.displayBrush(config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual, self.isHorizontalChart ? config.yAxisType === ESmallMultiplesAxisType.Individual : config.xAxisType === ESmallMultiplesAxisType.Individual);
                isDisplayBrushCalled = true;
            } else {
                // self.drawXYAxis(self.categoricalData, config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);
                // self.drawXYAxis(true, true);
                // self.margin.left = 0;
                // self.margin.bottom = 0;
                self.drawLollipopChart();
            }

            if (self.isExpandAllApplied) {
                if (!self.isHorizontalChart) {
                    if (self.isBottomXAxis) {
                        self.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (self.height + self.xScaleGHeight) + "px" + ")");
                    } else {
                        self.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-self.xScaleGHeight) + "px" + ")");
                    }

                    CallExpandAllXScaleOnAxisGroup(self, self.scaleBandWidth);
                }
                // else {
                // 	if (this.isLeftYAxis) {
                // 		this.expandAllYAxisG.style("transform", "translate(" + (-this.expandAllYScaleGWidth - this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
                // 	} else {
                // 		this.expandAllYAxisG.style("transform", "translate(" + (this.width) + "px" + "," + 0 + "px" + ")");
                // 	}
                // 	CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
                // }
            }

            if (isDisplayBrushCalled && !self.isScrollBrushDisplayed) {
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
            // self.configLegend();
            self.drawXGridLines();
            self.drawYGridLines();

            if (isUniformXScale) {
                xAxisG.attr("display", "none");
                xAxisG.classed("display-none", true);
            }

            if (isUniformYScale) {
                yAxisG.attr("display", "none");
                // yAxisG.classed("display-none", true);
            }

            if (!isUniformXScale) {
                // xAxisG.selectAll("text").attr("y", 0);
                // xAxisG.selectAll("tspan").attr("y", 0);
            }
        }
    }
};

export const GetSmallMultiplesDataPairsByItem = (self: Visual): any => {
    const categoricalSmallMultiplesDataFields = self.categoricalSmallMultiplesDataFields;
    const smallMultiplesCategoryNames = categoricalSmallMultiplesDataFields.map(d => d.source.displayName);
    const isExpandAllApplied = self.categoricalSmallMultiplesDataFields.length > 1;

    let categoricalSmallMultiplesValues = [];
    const categoricalDataPairsForGrouping = categoricalSmallMultiplesDataFields[0].values.reduce((arr: any, c: string, index: number) => {
        const category = categoricalSmallMultiplesDataFields.map(d => d.values[index]).join(", ");
        categoricalSmallMultiplesValues.push(category);
        const obj = { category: category, total: 0, [`index-${index}`]: index };

        smallMultiplesCategoryNames.forEach((d, i) => {
            obj[d] = categoricalSmallMultiplesDataFields[i].values[index].toString();
        });

        const keys = Object.keys(obj);
        if (isExpandAllApplied && (keys.includes("Year") || keys.includes("Quarter") || keys.includes("Month") || keys.includes("Day"))) {
            const day = obj["Day"] ? parseInt(obj["Day"].toString()) : 1;
            const month = obj["Month"] ? obj["Month"].toString() : "January";
            const quarter = obj["Quarter"] ? parseInt(obj["Quarter"].toString().split("Qtr")[1]) : 1;
            const year = obj["Year"] ? parseInt(obj["Year"].toString()) : 2024;

            obj["date"] = CreateDate(day ? day : 1, month, quarter ? quarter : 1, year ? year : 2024) as any;
        }

        return [...arr, obj];
    }, []);

    categoricalSmallMultiplesValues = categoricalSmallMultiplesValues.filter((item, i, ar) => ar.indexOf(item) === i);

    if (!categoricalSmallMultiplesValues) {
        categoricalSmallMultiplesValues = [];
    }

    const categoricalDataPairsGroup = group(categoricalDataPairsForGrouping, (d: any) => d.category);
    const smallMultiplesDataPairs = categoricalSmallMultiplesValues.map((category) => Object.assign({}, ...categoricalDataPairsGroup.get(category)));

    smallMultiplesDataPairs.forEach(d => {
        const keys = Object.keys(d).filter(k => k.includes("index-"));
        let total = 0;
        keys.forEach(key => {
            const index = key ? +key.split("-")[1] : 0;
            total += +self.categoricalMeasureFields[0].values[index];
        });
        d.total = total;
    });

    sortSmallMultiplesDataPairs(self, smallMultiplesDataPairs, "category");

    return smallMultiplesDataPairs;
};

const sortSmallMultiplesDataPairs = (
    self: Visual,
    data: any[],
    categoryKey: string
): void => {
    const sortingSettings: ISortingProps = self.sortingSettings.smallMultiples;
    const isMeasure = sortingSettings.isSortByMeasure;
    const isSortByExternalFields = sortingSettings.isSortByExtraSortField;
    const categoricalSmallMultiplesDataFields = self.categoricalSmallMultiplesDataFields;
    const smallMultiplesCategoryNames = categoricalSmallMultiplesDataFields.map(d => d.source.displayName);
    const categoricalSmallMultiplesDataField = categoricalSmallMultiplesDataFields[0];

    const isExpandAllApplied = self.categoricalSmallMultiplesDataFields.length > 1;
    const firstVal = categoricalSmallMultiplesDataField.values[0] ? categoricalSmallMultiplesDataField.values[0] : categoricalSmallMultiplesDataField.values[1] ? categoricalSmallMultiplesDataField.values[1] : "";
    const isXIsDateTimeAxis = categoricalSmallMultiplesDataField.source.type.dateTime;
    const isMonthCategoryNames = categoricalSmallMultiplesDataField.source.displayName.toLowerCase() === "months" || MonthNames.map(d => d.toLowerCase()).indexOf(<string>firstVal.toString().toLowerCase()) !== -1;
    const isXIsNumericAxis = categoricalSmallMultiplesDataField.source.type.numeric;

    const getMonthIndex = (monthName: string) => {
        return MonthNames.indexOf(monthName);
    }

    const sortByName = () => {
        if (!isXIsDateTimeAxis && (isExpandAllApplied || !isXIsNumericAxis)) {
            if (isMonthCategoryNames) {
                if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
                    data.sort((a, b) => getMonthIndex(a.category) - getMonthIndex(b.category));
                } else {
                    data.sort((a, b) => getMonthIndex(b.category) - getMonthIndex(a.category));
                }
            } else {
                const keys = Object.keys(data[0]);
                if (isExpandAllApplied && (keys.includes("Year") || keys.includes("Quarter") || keys.includes("Month") || keys.includes("Day"))) {
                    if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
                        data.sort((a, b) => new Date(a["date"]).getTime() - new Date(b["date"]).getTime());
                    } else {
                        data.sort((a, b) => new Date(b["date"]).getTime() - new Date(a["date"]).getTime());
                    }
                } else {
                    if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
                        data.sort((a, b) => [categoryKey, ...smallMultiplesCategoryNames].map(d => a[d].localeCompare(b[d])).reduce((a, b) => { return a && b }, 1));
                    } else {
                        data.sort((a, b) => [categoryKey, ...smallMultiplesCategoryNames].map(d => b[d].localeCompare(a[d])).reduce((a, b) => { return a && b }, 1));
                    }
                }
            }
        } else if (isXIsNumericAxis) {
            if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
                data.sort((a, b) => a[categoryKey] - b[categoryKey]);
            } else {
                data.sort((a, b) => b[categoryKey] - a[categoryKey]);
            }
        } else if (isXIsDateTimeAxis) {
            if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
                data.sort((a, b) => new Date(a[categoryKey]).getTime() - new Date(b[categoryKey]).getTime());
            } else {
                data.sort((a, b) => new Date(b[categoryKey]).getTime() - new Date(a[categoryKey]).getTime());
            }
        }
    };

    const sortByMeasure = () => {
        if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
            data.sort((a, b) => a.total - b.total);
        } else {
            data.sort((a, b) => b.total - a.total);
        }
    };

    if (isMeasure && !isSortByExternalFields) {
        sortByMeasure();
    } else if (!isMeasure && !isSortByExternalFields) {
        sortByName();
    }
}