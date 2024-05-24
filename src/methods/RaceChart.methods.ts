/* eslint-disable max-lines-per-function */
import { EFontStyle, EHighContrastColorType, EPlayPauseButton, Position } from '../enum';
import { Visual } from '../visual';
import { interval, max, min, select, sum } from "d3";

export const StartChartRace = (self: Visual) => {
    if (self.ticker) {
        self.ticker.stop();
    }

    self.ticker = interval(() => {
        const setDataWithAllPositiveCategory = () => {
            self.tickIndex++;
            self.raceChartKeyOnTick = self.raceChartKeysList[self.tickIndex];
            self.chartData = self.raceChartData.filter((d) => d.raceChartKey === self.raceChartKeyOnTick);

            if (self.chartData.length > 0) {
                self.initAndRenderLollipopChart(self.categoricalData, self.width, self.height, true, true);

                if (self.brushAndZoomAreaSettings.enabled) {
                    self.drawBrushLollipopChart(self.clonedCategoricalData);
                }
            }
        };

        setDataWithAllPositiveCategory();

        if (self.chartData.length > 0) {
            self.raceChartDataLabelOnTick = self.chartData[0].raceChartDataLabel;
            RenderRaceChartDataLabel(self);

            if (self.raceChartKeysLength === self.tickIndex) {
                self.tickIndex = -2;
                setDataWithAllPositiveCategory();
                self.ticker.stop();
                self.isRacePlaying = false;
                RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
            }
        }
    }, self.raceChartSettings.dataChangeInterval);
}

export const RenderRaceChartDataLabel = (self: Visual): void => {
    self.raceChartDataLabelG.selectAll("*").remove();
    // if (!self.isRaceChartDataLabelDrawn) {
    self.raceChartDataLabelText = self.raceChartDataLabelG.append("text").attr("class", "raceBarDataLabel");
    // }

    const minFontSize = 20;
    const maxFontSize = 30;
    let labelFontSize;

    if (self.raceChartSettings.isLabelAutoFontSize) {
        const autoSize = min([self.width / 25, self.height / 10]);
        if (autoSize > minFontSize && autoSize < maxFontSize) {
            labelFontSize = autoSize;
        } else if (autoSize < minFontSize) {
            labelFontSize = minFontSize;
        } else if (autoSize > maxFontSize) {
            labelFontSize = maxFontSize;
        }
    } else {
        labelFontSize = self.raceChartSettings.labelFontSize;
    }

    self.raceChartDataLabelText.selectAll("*").remove();
    self.raceChartDataLabelG.selectAll(".label-shadow").remove();

    self.raceChartDataLabelText
        .style("text-decoration", self.raceChartSettings.fontStyles.includes(EFontStyle.UnderLine) ? "underline" : "")
        .style("font-weight", self.raceChartSettings.fontStyles.includes(EFontStyle.Bold) ? "bold" : "normal")
        .style("font-style", self.raceChartSettings.fontStyles.includes(EFontStyle.Italic) ? "italic" : "")
        .attr("fill", self.raceChartSettings.labelColor)
        .style("font-family", self.raceChartSettings.labelFontFamily)
        .attr("text-anchor", "middle");

    self.raceChartDataLabelText
        .append("tspan")
        .attr("x", "0")
        .attr("font-size", labelFontSize)
        .text(self.raceChartDataLabelOnTick.split("--").map((d, i) => {
            if (self.categoricalRaceChartDataFields[i].source.type.dateTime) {
                d = new Date(d) as any;
            }
            return self.raceBarLabelsFormatter[i].formatter.format(d);
        }).join(" "));

    const getTotal1Value = () => {
        if (self.isLollipopTypePie) {
            return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => s.value1)), self.numberSettings, undefined, true, true);
        } else {
            return self.formatNumber(sum(self.chartData, d => d.value1), self.numberSettings, undefined, true, true);
        }
    }

    const getTotal2Value = () => {
        if (self.isLollipopTypePie) {
            return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => s.value2)), self.numberSettings, undefined, true, true);
        } else {
            return self.formatNumber(sum(self.chartData, d => d.value2), self.numberSettings, undefined, true, true);
        }
    }

    self.raceChartDataLabelText
        .append("tspan")
        .attr("x", "0")
        .attr("dy", labelFontSize / 1.25)
        .attr("font-size", labelFontSize / 2)
        .text(`${self.measure1DisplayName} : ${getTotal1Value()}`);

    if (self.isHasMultiMeasure) {
        self.raceChartDataLabelText
            .append("tspan")
            .attr("x", "0")
            .attr("dy", labelFontSize / 1.5)
            .attr("font-size", labelFontSize / 2)
            .text(`${self.measure2DisplayName} : ${getTotal2Value()}`);
    }

    const textBBox = self.raceChartDataLabelText.node().getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);

    self.raceChartContainerG
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth - self.settingsBtnWidth - self.legendViewPort.width) +
            "," +
            (self.raceChartSettings.placement === Position.Bottom ?
                (self.height - (textBBox.height + tickerButtonRadius * 2 + 20)) :
                (self.margin.top + (tickerButtonRadius * 2) + tickerButtonRadius + 10)) +
            ")"
        )

    self.raceChartDataLabelText
        .attr(
            "transform",
            "translate(" +
            (self.margin.right - max([textBBox.width / 2, tickerButtonRadius])) +
            "," +
            (self.raceChartSettings.placement === Position.Bottom ?
                (tickerButtonRadius * 2) :
                (self.margin.top + (tickerButtonRadius * 2) + tickerButtonRadius)) +
            ")"
        )

    const clonedTitle = select(self.raceChartDataLabelText as any).node().clone(true);
    clonedTitle
        .lower()
        .attr("class", "label-shadow")
        .attr("stroke", self.getColor(self.raceChartSettings.backgroundColor, EHighContrastColorType.Background))
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round")
        .attr("opacity", self.raceChartSettings.isShowLabelBackground ? "1" : "0");

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
            (-max([raceBarDateLabelTextBBox.width / 2, tickerButtonRadius])) +
            "," +
            (self.raceChartSettings.placement === Position.Bottom ?
                (0) :
                (self.margin.top + tickerButtonRadius)) +
            ")"
        )
        .on("click", () => {
            if (self.raceChartKeysList.length > 1) {
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
