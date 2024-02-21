import { EPlayPauseButton } from '../enum';
import { Visual } from '../visual';
import { interval, min, sum } from "d3";

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
                self.initAndRenderLollipopChart(self.width, true, true);

                if (self.brushAndZoomAreaSettings.enabled) {
                    self.drawBrushLollipopChart(self.clonedCategoricalData);
                }
            }
        };

        setDataWithAllPositiveCategory();

        self.raceChartDataLabelOnTick = self.chartData[0].raceChartDataLabel;
        self.raceChartDataLabelText.text(self.raceChartDataLabelOnTick);

        if (self.raceChartKeysLength === self.tickIndex) {
            self.tickIndex = -2;
            setDataWithAllPositiveCategory();
            self.ticker.stop();
            self.isRacePlaying = false;
            RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
        }
    }, self.raceChartSettings.dataChangeInterval);
}

export const RenderRaceChartDataLabel = (self: Visual): void => {
    if (!self.isRaceChartDataLabelDrawn) {
        self.raceChartDataLabelText = self.raceChartDataLabelG.append("text").attr("class", "raceBarDataLabel");
    }

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

    self.raceChartDataLabelText
        .attr("fill", self.raceChartSettings.labelColor)
        .attr("font-family", self.raceChartSettings.labelFontFamily)
        .attr("text-anchor", "middle");

    self.raceChartDataLabelText
        .append("tspan")
        .attr("x", "0")
        .attr("font-size", labelFontSize)
        .text(self.raceChartDataLabelOnTick);

    const getTotalValue = () => {
        if (self.isLollipopTypePie) {
            if (self.isHasMultiMeasure) {
                return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => (s.value1 + s.value2))), self.numberSettings, undefined, true, true);
            } else {
                return self.formatNumber(sum(self.chartData, d => sum(d.subCategories, s => s.value1)), self.numberSettings, undefined, true, true);
            }
        } else {
            if (self.isHasMultiMeasure) {
                return self.formatNumber(sum(self.chartData, d => (d.value1 + d.value2)), self.numberSettings, undefined, true, true);
            } else {
                return self.formatNumber(sum(self.chartData, d => d.value1), self.numberSettings, undefined, true, true);
            }
        }
    }

    self.raceChartDataLabelText
        .append("tspan")
        .attr("x", "0")
        .attr("dy", labelFontSize)
        .attr("font-size", labelFontSize / 1.5)
        .text(`Total : ${getTotalValue()}`);

    const textBBox = self.raceChartDataLabelText.node().getBBox();

    self.raceChartDataLabelText
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth - self.settingsBtnWidth - self.legendViewPort.width - self.margin.right - textBBox.width / 2) +
            "," +
            (self.height - textBBox.height) +
            ")"
        )

    self.isRaceChartDataLabelDrawn = true;
}

export const RenderRaceTickerButton = (self: Visual): void => {
    const raceBarDateLabelTextBBox = (self.raceChartDataLabelText.node() as SVGSVGElement).getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);
    const tickerButton = self.tickerButtonG
        .attr("id", "tickerButton")
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth -
                self.settingsBtnWidth -
                self.legendViewPort.width -
                raceBarDateLabelTextBBox.width / 2 -
                tickerButtonRadius / 2) +
            "," +
            (self.height - tickerButtonRadius * 2 - 10 - raceBarDateLabelTextBBox.height) +
            ")"
        )
        .on("click", () => {
            self.isRacePlaying = !self.isRacePlaying;
            RenderTickerButtonPlayPausePath(self, self.isRacePlaying ? EPlayPauseButton.Pause : EPlayPauseButton.Play);

            if (!self.isRacePlaying) {
                self.ticker.stop();
            } else {
                StartChartRace(self);
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
    const minRadius = 30;
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

export const UpdateTickerButton = (self: Visual): void => {
    const raceDateLabelTextBBox = (self.raceChartDataLabelText.node() as SVGSVGElement).getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);
    self.tickerButtonG
        .attr("id", "tickerButton")
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth -
                self.settingsBtnWidth -
                self.legendViewPort.width -
                raceDateLabelTextBBox.width / 2 -
                tickerButtonRadius / 2) +
            "," +
            (self.height - tickerButtonRadius * 2 - 10 - raceDateLabelTextBBox.height) +
            ")"
        );

    self.tickerButtonG
        .select("#tickerCircle")
        .attr("r", tickerButtonRadius)
        .attr("fill", self.raceChartSettings.tickerButtonColor);
}