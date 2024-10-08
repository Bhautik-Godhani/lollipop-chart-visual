/* eslint-disable max-lines-per-function */
import { EFontStyle, EHighContrastColorType, EPlayPauseButton, Position } from '../enum';
import { Visual } from '../visual';
import { group, interval, max, min, select, sum } from "d3";
import { CreateDate } from './methods';
import { cloneDeep } from 'lodash';
import { RenderExpandAllXAxis } from './expandAllXAxis.methods';

export const StartChartRace = (self: Visual) => {
    if (self.ticker) {
        self.ticker.stop();
    }

    self.ticker = interval(() => {
        const setDataWithAllPositiveCategory = () => {
            self.tickIndex++;
            self.raceChartKeyOnTick = self.raceChartCategories[self.tickIndex];

            const raceChartDataPair = self.raceChartDataPairs.find((d) => d.category === self.raceChartCategories[self.tickIndex]);
            const dataValuesIndexes = Object.keys(raceChartDataPair).filter(key => key.includes("index-"));
            const originalCategoricalData: powerbi.DataViewCategorical = cloneDeep(self.clonedCategoricalDataForRaceChart);

            originalCategoricalData.categories.forEach((d) => {
                d.values = dataValuesIndexes.map((valueIndex) => {
                    const id = +valueIndex.split("-")[1];
                    return d.values[id];
                });
            });

            originalCategoricalData.values.forEach((d) => {
                d.values = dataValuesIndexes.map((valueIndex) => {
                    const id = +valueIndex.split("-")[1];
                    return d.values[id];
                });

                d.highlights = dataValuesIndexes.map((valueIndex) => {
                    const id = +valueIndex.split("-")[1];
                    return (d.highlights && d.highlights.length > 0) ? d.highlights[id] : null;
                });
            });

            self.categoricalData = self.setInitialChartData(
                originalCategoricalData,
                cloneDeep(originalCategoricalData),
                self.categoricalMetadata,
                self.vizOptions.options.viewport.width,
                self.vizOptions.options.viewport.height
            );

            if (!self.isScrollBrushDisplayed) {
                self.setCategoricalDataFields(self.categoricalData);
                self.setChartData(self.categoricalData);
            }

            self.drawXYAxis(self.categoricalData, self.chartData, true, true);

            if (self.categoricalCategoriesLastIndex > 0) {
                if (!self.isHorizontalChart) {
                    RenderExpandAllXAxis(self, self.categoricalData);
                }
            }

            // if (self.isExpandAllApplied && (!self.isSmallMultiplesEnabled || (self.isSmallMultiplesEnabled && self.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Individual))) {
            //     RenderExpandAllXAxis(self, self.categoricalData);
            // }

            if (self.isScrollBrushDisplayed) {
                self.displayBrush(true, true, true);
            } else {
                // self.drawXYAxis(self.categoricalData, config.xAxisType === ESmallMultiplesAxisType.Individual, config.yAxisType === ESmallMultiplesAxisType.Individual);
                // self.drawXYAxis(true, true);
                // self.margin.left = 0;
                // self.margin.bottom = 0;         

                if (self.chartData.length > 0) {
                    self.initAndRenderLollipopChart(self.categoricalData, self.chartData, self.width, self.height, true, true);

                    if (self.brushAndZoomAreaSettings.enabled) {
                        self.drawBrushLollipopChart(self.clonedCategoricalData);
                    }
                }
            }
        };

        // if (self.chartData.length > 0) {
        if ((self.raceChartCategories.length - 1) === self.tickIndex) {
            self.tickIndex = -1;
            self.ticker.stop();
            self.isRacePlaying = false;
            RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
        } else {
            setDataWithAllPositiveCategory();

            self.raceChartDataLabelOnTick = self.raceChartCategories[self.tickIndex];
            RenderRaceChartDataLabel(self);
        }
        // }
    }, self.raceChartSettings.dataChangeInterval);
}

export const getTotal1ValueForRaceChartLabel = (self: Visual) => {
    if (self.isLollipopTypePie) {
        return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => s.value1)), self.numberSettings, undefined, true, true);
    } else {
        return self.formatNumber(sum(self.chartData, d => d.value1), self.numberSettings, undefined, true, true);
    }
}

export const RenderRaceChartDataLabel = (self: Visual): void => {
    self.raceChartDataLabelG.selectAll("*").remove();
    // if (!self.isRaceChartDataLabelDrawn) {
    self.raceChartDataLabelText = self.raceChartDataLabelG.append("text").attr("class", "raceBarDataLabel");
    // }

    const { headerTextStyles, subTextStyles } = self.raceChartSettings;

    const minFontSize = 20;
    const maxFontSize = 30;
    let headerFontSize: number;
    let subTextFontSize: number;

    if (headerTextStyles.isLabelAutoFontSize) {
        const autoSize = min([self.width / 25, self.height / 10]);
        if (autoSize > minFontSize && autoSize < maxFontSize) {
            headerFontSize = autoSize;
        } else if (autoSize < minFontSize) {
            headerFontSize = minFontSize;
        } else if (autoSize > maxFontSize) {
            headerFontSize = maxFontSize;
        }
    } else {
        headerFontSize = headerTextStyles.labelFontSize;
    }

    if (subTextStyles.isLabelAutoFontSize) {
        subTextFontSize = headerFontSize / 1.25;
    } else {
        subTextFontSize = subTextStyles.labelFontSize;
    }

    self.raceChartDataLabelText.selectAll("*").remove();
    self.raceChartDataLabelG.selectAll(".label-shadow").remove();

    self.raceChartDataLabelText
        .attr("text-anchor", "middle");

    self.raceChartDataLabelText
        .append("tspan")
        .attr("class", "header-label")
        .attr("x", "0")
        .attr("y", "1.25em")
        .style("text-decoration", headerTextStyles.fontStyles.includes(EFontStyle.UnderLine) ? "underline" : "")
        .style("font-weight", headerTextStyles.fontStyles.includes(EFontStyle.Bold) ? "bold" : "normal")
        .style("font-style", headerTextStyles.fontStyles.includes(EFontStyle.Italic) ? "italic" : "")
        .attr("fill", headerTextStyles.labelColor)
        .style("font-family", headerTextStyles.labelFontFamily)
        .attr("font-size", headerFontSize)
        .text(self.raceChartDataLabelOnTick.split("--").map((d, i) => {
            if (self.categoricalRaceChartDataFields[i].source.type.dateTime) {
                d = new Date(d) as any;
            }
            return self.raceBarLabelsFormatter[i].formatter.format(d);
        }).join(" "));


    const getTotal2Value = () => {
        if (self.isLollipopTypePie) {
            return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => s.value2)), self.numberSettings, undefined, true, true);
        } else {
            return self.formatNumber(sum(self.chartData, d => d.value2), self.numberSettings, undefined, true, true);
        }
    }

    self.raceChartDataLabelText
        .append("tspan")
        .attr("class", "sub-text-label")
        .attr("x", "0")
        .attr("dy", subTextFontSize)
        .style("text-decoration", subTextStyles.fontStyles.includes(EFontStyle.UnderLine) ? "underline" : "")
        .style("font-weight", subTextStyles.fontStyles.includes(EFontStyle.Bold) ? "bold" : "normal")
        .style("font-style", subTextStyles.fontStyles.includes(EFontStyle.Italic) ? "italic" : "")
        .attr("fill", subTextStyles.labelColor)
        .style("font-family", subTextStyles.labelFontFamily)
        .attr("font-size", subTextStyles.isLabelAutoFontSize ? headerFontSize / 2 : subTextStyles.labelFontSize)
        .text(`${self.measure1DisplayName} : ${getTotal1ValueForRaceChartLabel(self)}`);

    // if (self.isHasMultiMeasure) {
    //     self.raceChartDataLabelText
    //         .append("tspan")
    //         .attr("x", "0")
    //         .attr("dy", labelFontSize / 1.5)
    //         .attr("font-size", labelFontSize / 2)
    //         .text(`${self.measure2DisplayName} : ${getTotal2Value()}`);
    // }

    const textBBox = self.raceChartDataLabelText.node().getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);

    self.raceChartContainerG
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth - self.settingsBtnWidth - self.legendViewPort.width - self.margin.right) +
            "," +
            (self.raceChartSettings.placement === Position.Bottom ?
                (self.height - (textBBox.height + tickerButtonRadius * 2 + 20)) :
                (self.margin.top + tickerButtonRadius * 2)) +
            ")"
        )

    self.raceChartDataLabelText
        .attr(
            "transform",
            "translate(" +
            (-max([self.raceChartDataLabelLength / 2, tickerButtonRadius])) +
            "," +
            // (self.raceChartSettings.placement === Position.Bottom ?
            (tickerButtonRadius) +
            // (self.margin.top + (tickerButtonRadius * 2) + tickerButtonRadius)) +
            ")"
        )

    const clonedTitle = select(self.raceChartDataLabelText as any).node().clone(true).lower();
    clonedTitle
        .select(".header-label")
        .attr("class", "label-shadow")
        .attr("stroke", self.getColor(headerTextStyles.backgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("opacity", headerTextStyles.isShowLabelBackground ? "1" : "0");

    clonedTitle
        .select(".sub-text-label")
        .attr("class", "label-shadow")
        .attr("stroke", self.getColor(subTextStyles.backgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("opacity", subTextStyles.isShowLabelBackground ? "1" : "0");

    self.isRaceChartDataLabelDrawn = true;
}

export const RenderRaceTickerButton = (self: Visual): void => {
    self.tickerButtonG.selectAll("*").remove();
    const raceBarDateLabelTextBBox = (self.raceChartDataLabelText.node() as SVGSVGElement).getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);
    const tickerButton = self.tickerButtonG
        .attr("id", "tickerButton")
        .attr(
            "transform",
            "translate(" +
            (-max([self.raceChartDataLabelLength / 2, tickerButtonRadius])) +
            "," +
            // (self.raceChartSettings.placement === Position.Bottom ?
            (0) +
            // (self.margin.top + tickerButtonRadius)) +
            ")"
        )
        .on("click", () => {
            if (self.raceChartCategories.length > 1) {
                self.isRacePlaying = !self.isRacePlaying;
                RenderTickerButtonPlayPausePath(self, self.isRacePlaying ? EPlayPauseButton.Pause : EPlayPauseButton.Play);

                if (!self.isRacePlaying) {
                    self.ticker.stop();
                } else {
                    StartChartRace(self);
                }
            }
        });

    tickerButton
        .append("circle")
        .attr("id", "tickerCircle")
        .attr("r", tickerButtonRadius)
        .attr("fill", self.raceChartSettings.tickerButtonColor);

    tickerButton.append("path").attr("class", "tickerButtonPath").attr("fill", "white");

    RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
    self.isTickerButtonDrawn = true;
}

export const GetTickerButtonRadius = (self: Visual): number => {
    const minRadius = 25;
    return self.raceChartSettings.isTickerButtonAutoRadius
        ? self.width * 0.03 > minRadius
            ? self.width * 0.03
            : minRadius
        : self.raceChartSettings.tickerButtonRadius;
}

export const RenderTickerButtonPlayPausePath = (self: Visual, buttonType: EPlayPauseButton) => {
    self.tickerButtonG
        .select(".tickerButtonPath")
        .attr(
            "d",
            buttonType === EPlayPauseButton.Play
                ? "M1576 927l-1328 738q-23 13-39.5 3t-16.5-36v-1472q0-26 16.5-36t39.5 3l1328 738q23 13 23 31t-23 31z"
                : "M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
        )
        .attr(
            "transform",
            buttonType === EPlayPauseButton.Play
                ? "translate(-8.203125, -10.9375) scale(0.01220703125)"
                : "translate(-9.5703125, -10.9375) scale(0.042724609375)"
        );
}

export const GetRaceChartDataPairsByItem = (self: Visual): any => {
    const categoricalRaceChartDataFields = self.categoricalRaceChartDataFields;
    const raceChartCategoryNames = categoricalRaceChartDataFields.map(d => d.source.displayName);
    const isExpandAllApplied = self.categoricalCategoriesFields.length > 1;

    let categoricalRaceChartValues = [];
    const categoricalDataPairsForGrouping = categoricalRaceChartDataFields[0].values.reduce((arr: any, c: string, index: number) => {
        const category = categoricalRaceChartDataFields.map(d => d.values[index]).join(", ");
        categoricalRaceChartValues.push(category);
        const obj = { category: category, total: 0, [`index-${index}`]: index };

        raceChartCategoryNames.forEach((d, i) => {
            obj[d] = categoricalRaceChartDataFields[i].values[index].toString();
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

    categoricalRaceChartValues = categoricalRaceChartValues.filter((item, i, ar) => ar.indexOf(item) === i);

    if (!categoricalRaceChartValues) {
        categoricalRaceChartValues = [];
    }

    const categoricalDataPairsGroup = group(categoricalDataPairsForGrouping, (d: any) => d.category);
    const raceChartDataPairs = categoricalRaceChartValues.map((category) => Object.assign({}, ...categoricalDataPairsGroup.get(category)));

    raceChartDataPairs.forEach(d => {
        const keys = Object.keys(d).filter(k => k.includes("index-"));
        let total = 0;
        keys.forEach(key => {
            const index = key ? +key.split("-")[1] : 0;
            total += +self.categoricalMeasureFields[0].values[index];
        });
        d.total = total;
    });

    return raceChartDataPairs;
};