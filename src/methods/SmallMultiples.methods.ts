import { Selection, create, select } from "d3-selection";
import { ESmallMultiplesAxisType, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, IAxisConfig, ISmallMultiplesGridLayoutSettings } from "../SmallMultiplesGridLayout";
import { Visual } from "../visual";
import { EDataRolesName, EFontStyle, FontStyle } from "../enum";
import { group } from "d3-array";
import { getSVGTextSize } from "./methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

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
            const newItemHeight = hostElementsBBox.height - (self.isScrollBrushDisplayed ? self.brushHeight : 0) - (config.innerSpacing * 2) - panelTitleSize.height;

            if (newItemWidth <= 0 || newItemHeight <= 0) {
                return;
            }

            svgDiv.style("height", `calc(${100}% - ${headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize.height : 0}px)`);

            if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
                if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                    svgDiv.style("margin-bottom", "0px");
                    svgDiv.style("margin-top", "10px");
                } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
                    svgDiv.style("margin-top", "0px");
                    svgDiv.style("margin-bottom", "10px");
                }
            } else {
                svgDiv.style("margin-top", "0px");
                svgDiv.style("margin-bottom", "0px");
            }

            svgDiv.style("height", `calc(${100}% - ${headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize.height : 0}px)`);

            if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
                if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                    svgDiv.style("margin-bottom", "0px");
                    svgDiv.style("margin-top", "10px");
                } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
                    svgDiv.style("margin-top", "0px");
                    svgDiv.style("margin-bottom", "10px");
                }
            } else {
                svgDiv.style("margin-top", "0px");
                svgDiv.style("margin-bottom", "0px");
            }

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

            // clonedCategoricalData.categories.forEach(d => {
            //   d.values = d.values.slice(startIndex, endIndex);0
            // });
            // clonedCategoricalData.values.forEach(d => {
            //   d.values = d.values.slice(startIndex, endIndex);
            // });

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

            if (!self.isScrollBrushDisplayed) {
                self.setCategoricalDataFields(self.categoricalData);
                self.setChartData(self.categoricalData);
            }

            if (self.isHorizontalBrushDisplayed) {
                self.brushHeight = self.brushAndZoomAreaSettings.enabled ? self.brushAndZoomAreaHeight : 10;
            }

            self.setColorsByDataColorsSettings();

            const textEle = create("div");
            div.node().append(textEle.node());

            textEle.style("font-family", headerSettings.fontFamily);
            textEle.style("font-size", headerSettings.fontSize + "px");
            textEle.style("color", headerSettings.fontColor);
            textEle.style("font-weight", headerSettings.fontStyles.includes(FontStyle.Bold) ? "bold" : "");
            textEle.style("font-style", headerSettings.fontStyles.includes(FontStyle.Italic) ? "italic" : "");
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
                xAxisG: xAxisG.node() as any,
                yAxisG: yAxisG.node() as any,
                categoricalData: self.isSMUniformXAxis ? initialChartDataByBrushScaleBand : self.categoricalData,
                brush: null,
                brushG: brushG.node() as any,
                categoricalDataPairs: self.categoricalDataPairs,
                chartData: self.chartData,
            };

            // const axisConfig: IAxisConfig = {
            //     categoricalData: self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.Grid ? self.categoricalData : clonedCategoricalData,
            //     width: newItemWidth - (!isUniformYScale ? self.margin.left : 0),
            //     height: newItemHeight - (!isUniformXScale ? self.margin.bottom : 0),
            //     xAxisG: xAxisG.node(),
            //     yAxisG: yAxisG.node(),
            //     xAxisYPos: newItemHeight - (!isUniformXScale ? self.margin.bottom : 0),
            //     yAxisXPos: newItemWidth,
            // };

            self.drawXYAxis(config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);

            self.svg = svg;
            self.container = container;
            self.viewPortWidth = newItemWidth;
            self.viewPortHeight = newItemHeight;
            self.width = newItemWidth - self.margin.left;
            self.height = newItemHeight;
            self.settingsBtnWidth = 0;
            self.settingsBtnHeight = 0;
            self.xAxisG = xAxisG as any;
            self.dataLabels1G = dataLabels1G;
            self.dataLabels2G = dataLabels2G;
            self.referenceLineLayersG = referenceLineLayersG as any;
            self.referenceLinesContainerG = referenceLinesContainerG as any;
            self.xGridLinesG = xGridLinesG as any;
            self.yGridLinesG = yGridLinesG as any;

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

            if (config.yAxisType === ESmallMultiplesAxisType.Individual) {
                self.yAxisG = yAxisG as any;
            }

            self.lollipopG = lollipopG as any;
            // self.brushG = select(brushG);

            const smallMultiplesGridItemContent = self.smallMultiplesGridItemContent[smallMultiplesDataPair.category];

            self.xAxisG = select(smallMultiplesGridItemContent.xAxisG);
            self.yAxisG = select(smallMultiplesGridItemContent.yAxisG);
            self.lollipopG = select(smallMultiplesGridItemContent.lollipopG);
            // self.brushG = select(smallMultiplesGridItemContent.brushG);

            if (self.isScrollBrushDisplayed) {
                // self.drawXYAxis(config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);
                self.displayBrush(config.xAxisType === ESmallMultiplesAxisType.Individual, true, config.xAxisType === ESmallMultiplesAxisType.Individual, true);
            } else {
                self.drawXYAxis(config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);
                // self.drawXYAxis(true, true);
                self.margin.left = 0;
                self.margin.bottom = 0;
                self.drawLollipopChart();
            }

            if (isUniformXScale) {
                xAxisG.style("display", "none");
            }

            if (isUniformYScale) {
                yAxisG.style("display", "none");
            }

            if (!isUniformXScale) {
                xAxisG.selectAll("text").attr("y", 0);
                xAxisG.selectAll("tspan").attr("y", 0);
            }
        }
    }


    //     // self.smallMultiplesGridItemContent[config.categories[smallMultipleIndex]].lollipopG = lollipopG;

    //     // ele?.attr("data-chart-loaded", true);

    //     // //     RenderTooltipByChartType(self, d3Select(barG as any), self.stackedBarG, self.groupedBarG);

    //     // //     let barNodeData = [];
    //     // //     let barSelection = d3Select(self.smallMultiplesContainer).selectAll(".bar");
    //     // //     barSelection.each(function () {
    //     // //         barNodeData.push(d3Select(this).datum() as never);
    //     // //     });

    //     // //     const behaviorOptions: BehaviorOptions = {
    //     // //         selection: barSelection,
    //     // //         clearCatcher: self.svg,
    //     // //         interactivityService: self.interactivityService,
    //     // //         dataPoints: barNodeData,
    //     // //         behavior: self.behavior,
    //     // //         isLassoEnabled: false,
    //     // //         isClearPreviousSelection: false,
    //     // //         onBarClick: () => { },
    //     // //     };
    //     // //     self.interactivityService.bind(behaviorOptions);

    //     // //     if (!self.isSMUniformXAxis) {
    //     // //         if (self.isScrollBrushDisplayed) {
    //     // //             const brushXPos = !isUniformYScale ? self.margin.left : 0;
    //     // //             const brushYPos = newItemHeight - self.brushHeight;
    //     // //             const config: IBrushConfig = {
    //     // //                 brushG: brushG,
    //     // //                 brushXPos: brushXPos,
    //     // //                 brushYPos: brushYPos,
    //     // //                 barDistance: self.brushScaleBandBandwidth,
    //     // //                 totalBarsCount: self.totalBarsCount,
    //     // //                 isOnlySetScaleDomainByBrush: true,
    //     // //                 scaleWidth: newItemWidth - (!isUniformYScale ? self.margin.left : 0),
    //     // //                 scaleHeight: newItemHeight - self.margin.bottom,
    //     // //                 smallMultiplesGridItemContent: self.smallMultiplesGridItemContent,
    //     // //                 smallMultiplesGridItemId: self.smallMultiplesCategoriesName[smallMultipleIndex],
    //     // //                 categoricalData: clonedCategoricalData,
    //     // //             };

    //     // //             if (self.isHorizontalBrushDisplayed) {
    //     // //                 DrawHorizontalBrush(self, config);
    //     // //             } else {
    //     // //                 brushG.childNodes.forEach((node) => {
    //     // //                     node.remove();
    //     // //                 });
    //     // //             }
    //     // //         }
    //     // //     }
    // }
};

export const GetSmallMultiplesDataPairsByItem = (self: Visual): any => {
    const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.categoricalData));
    const categoricalSmallMultiplesDataField = self.categoricalSmallMultiplesDataField;
    const categoricalDataPairsForGrouping = categoricalSmallMultiplesDataField.values.reduce((arr: any, category: string, index: number) => {
        const obj = { category: category, total: 0, [`index-${index}`]: index };
        return [...arr, obj];
    }, []);
    const categoricalSmallMultiplesValues = categoricalSmallMultiplesDataField.values.filter((item, i, ar) => ar.indexOf(item) === i) ?? [];

    const categoricalDataPairsGroup = group(categoricalDataPairsForGrouping, (d: any) => d.category);
    const smallMultiplesDataPairs = categoricalSmallMultiplesValues.map((category) => Object.assign({}, ...categoricalDataPairsGroup.get(category)!));

    smallMultiplesDataPairs.forEach(d => {
        const keys = Object.keys(d).splice(2);
        let total = 0;
        keys.forEach(key => {
            const index = +key?.split("-")[1];
            total += +self.categoricalMeasureFields[0].values[index];
        });
        d.total = total;
    });

    smallMultiplesDataPairs.sort((a, b) => b.total - a.total);

    // SortSmallMultiplesDataPairs();

    return smallMultiplesDataPairs;
};

// const SortSmallMultiplesDataPairs = (self: Visual): void => {
//     const sortByValuesList: string[] = [self.smallMultiplesCategoricalDataSourceName, ...self.measure1DisplayName];
//     const sort = self.sortingSettings.smallMultiples;
//     const smallMultipleSortSettings = !sort.sortBy || !sortByValuesList.includes(sort.sortBy)
//         ? { sortBy: sortByValuesList[1], sortOrder: ESortOrder.Descending, isMeasure: true, isMultiMeasure: false }
//         : sort;

//     if (smallMultipleSortSettings.isMeasure) {
//         if (smallMultipleSortSettings.sortOrder === ESortOrder.Descending) {
//             this.smallMultiplesDataPairs.sort((a, b) => b.total - a.total);
//         } else if (smallMultipleSortSettings.sortOrder === ESortOrder.Ascending) {
//             this.smallMultiplesDataPairs.sort((a, b) => a.total - b.total);
//         }
//     } else {
//         if (smallMultipleSortSettings.sortOrder === ESortOrder.Descending) {
//             this.smallMultiplesDataPairs.sort((a, b) => a.category.localeCompare(b.category));
//         } else if (smallMultipleSortSettings.sortOrder === ESortOrder.Ascending) {
//             this.smallMultiplesDataPairs.sort((a, b) => b.category.localeCompare(a.category));
//         }
//     }
// }

// export const RenderSmallMultiplesUniformYAxis = (
//     self: Visual,
//     totalRows: number,
//     itemHeight: number,
//     yAxisGNode: HTMLElement,
//     uniformLeftYAxis: HTMLElement,
//     uniformRightYAxis: HTMLElement,
//     isUniformYScale: boolean
// ): void => {
//     const THIS = this;
//     const settings = self.smallMultiplesSettings;
//     const headerSettings = settings.header;

//     if (isUniformYScale) {
//         uniformLeftYAxis?.querySelectorAll(".y-axis-col-svg")?.forEach((node) => {
//             node?.remove();
//         });

//         uniformRightYAxis?.querySelectorAll(".y-axis-col-svg")?.forEach((node) => {
//             node?.remove();
//         });

//         if (settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn) {
//             if (uniformLeftYAxis) {
//                 uniformLeftYAxis.style.marginTop = self.margin.bottom + "px";
//             }

//             if (uniformRightYAxis) {
//                 uniformRightYAxis.style.marginTop = self.margin.bottom + "px";
//             }
//         }

//         if (settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn) {
//         }

//         self.hyperListMainContainer.onscroll = () => {
//             if (uniformLeftYAxis) {
//                 uniformLeftYAxis.style.transform = `translate(${0}, ${-self.hyperListMainContainer.scrollTop}px)`;
//             }

//             if (uniformRightYAxis) {
//                 uniformRightYAxis.style.transform = `translate(${self.width + self.smallMultiplesLayoutScrollbarWidth}px, ${-self.hyperListMainContainer
//                     .scrollTop}px)`;
//             }
//         };

//         const panelTitleSize = self.getTextHeight(headerSettings.fontSize, headerSettings.fontFamily, headerSettings.fontStyles, true);

//         // APPEND CLONED Y AXIS COPY
//         for (let i = 0; i < totalRows; i++) {
//             const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//             svg.classList.add("y-axis-col-svg");
//             svg.style.width = self.margin.left + "px";
//             svg.style.height = itemHeight - panelTitleSize + "px";
//             // svg.style.marginLeft = this.margin + "px";
//             svg.style.transform = `translate(${0}px ,${i * (itemHeight + settings.outerSpacing) + settings.outerSpacing + panelTitleSize + settings.innerSpacing
//                 }px)`;

//             const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

//             if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
//                 g.style.transform = `translate(${self.margin.left}px, ${headerSettings.position === ESmallMultiplesHeaderPosition.Top ? 10 : 0}px)`;
//             } else {
//                 g.style.transform = `translate(${self.margin.left}px, ${0}px)`;
//             }

//             svg.appendChild(g);

//             g.appendChild(yAxisGNode.cloneNode(true));
//             // this.uniformSmallMultiplesYAxisContainer.appendChild(svg);

//             if (uniformLeftYAxis) {
//                 uniformLeftYAxis.appendChild(svg.cloneNode(true));
//             }

//             if (uniformRightYAxis) {
//                 uniformRightYAxis.appendChild(svg.cloneNode(true));
//             }
//         }
//     }
// };

// export const GetSmallMultiplesUniformLeftYAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
//     const settings = self.smallMultiplesSettings;
//     const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
//     const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;
//     const isUniformTopXAxis = settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

//     const uniformYAxis = document.createElement("div");

//     uniformYAxis.id = "uniformLeftYAxis";
//     uniformYAxis.classList.add("uniformLeftYAxis");
//     uniformYAxis.style.width = self.margin.left + "px";
//     uniformYAxis.style.height = self.height + "px";
//     uniformYAxis.style.transform = "translate(" + 0 + "px" + "," + 0 + "px" + ")";

//     smallMultiplesWrapper.style.width = self.width + self.margin.right + "px";
//     smallMultiplesWrapper.style.transform = "translate(" + self.margin.left + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";

//     return uniformYAxis;
// }

// export const GetSmallMultiplesUniformRightYAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
//     const settings = self.smallMultiplesSettings;
//     const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
//     const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;
//     const isUniformRightYAxis = settings.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenRightColumn;
//     const isUniformTopXAxis = settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

//     const uniformYAxis = document.createElement("div");

//     uniformYAxis.id = "uniformRightYAxis";
//     uniformYAxis.classList.add("uniformRightYAxis");
//     uniformYAxis.style.width = self.margin.left + "px";
//     uniformYAxis.style.height = self.height + "px";
//     uniformYAxis.style.transform = "translate(" + (self.width + self.smallMultiplesLayoutScrollbarWidth) + "px" + "," + 0 + "px" + ")";

//     if (isUniformRightYAxis) {
//         smallMultiplesWrapper.style.width = self.width + self.margin.right + "px";
//         smallMultiplesWrapper.style.transform = "translate(" + 0 + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";
//     } else {
//         smallMultiplesWrapper.style.width = self.width + self.margin.right - self.margin.left + "px";
//         smallMultiplesWrapper.style.transform = "translate(" + self.margin.left + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";
//     }

//     return uniformYAxis;
// }

// export const GetRootXYAxisGNode = (self: Visual, itemWidth: number, itemHeight: number): { xAxisGNode: HTMLElement; yAxisGNode: HTMLElement } => {
//     self.vizOptions.options.viewport.width = itemWidth;
//     self.vizOptions.options.viewport.height = itemHeight;
//     self.width = itemWidth;
//     self.height = itemHeight;

//     self.drawXYAxis();

//     const xAxisGNode: any = self.hostContainer.querySelector(".xAxisG")!.cloneNode(true);
//     const yAxisGNode: any = self.hostContainer.querySelector(".yAxisG")!.cloneNode(true);

//     xAxisGNode.style.transform = "translate(0, 0)";
//     xAxisGNode.querySelectorAll("text").forEach((node) => {
//         node.setAttribute("y", 0);
//     });
//     xAxisGNode.querySelectorAll("tspan").forEach((node) => {
//         node.setAttribute("y", 0);
//     });

//     return { xAxisGNode, yAxisGNode };
// };