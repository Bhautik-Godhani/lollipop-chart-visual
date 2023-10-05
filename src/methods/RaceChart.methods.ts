import { EPlayPauseButton } from '../enum';
import { Visual } from '../visual';
import { interval } from "d3";

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
                self.initAndRenderLollipopChart(self.width);
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

    const minFontSize = 24;
    const labelFontSize =
        self.raceChartSettings.isLabelAutoFontSize
            ? self.width * 0.06 > minFontSize
                ? self.width * 0.06
                : minFontSize
            : self.raceChartSettings.labelFontSize;

    self.raceChartDataLabelText
        .text(self.raceChartDataLabelOnTick)
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth - self.settingsBtnWidth - self.legendViewPort.width - self.margin.right) +
            "," +
            self.height +
            ")"
        )
        .attr("fill", self.raceChartSettings.labelColor)
        .style("font-family", self.raceChartSettings.labelFontFamily)
        .style("font-size", labelFontSize);
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
            (self.height - tickerButtonRadius - raceBarDateLabelTextBBox.height) +
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
            (self.height - tickerButtonRadius - raceDateLabelTextBBox.height) +
            ")"
        );

    self.tickerButtonG
        .select("#tickerCircle")
        .attr("r", tickerButtonRadius)
        .attr("fill", self.raceChartSettings.tickerButtonColor);
}