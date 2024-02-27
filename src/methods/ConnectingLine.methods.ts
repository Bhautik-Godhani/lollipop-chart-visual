import { line } from "d3-shape";
import { ILollipopChartRow } from "../model";
import { Visual } from "../visual";
import { EHighContrastColorType, ELineType } from "../enum";

export const RenderConnectingLine = (self: Visual, chartData: ILollipopChartRow[], isValue2: boolean): void => {
    const connectingLine: any = self.connectingLineG
        .append("path")
        .attr("class", self.chartSettings.connectingLineStyle)
        .classed("connectingLine", true)
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", self.getColor(self.chartSettings.connectingLineColor, EHighContrastColorType.Foreground))
        .attr("stroke-width", self.chartSettings.connectingLineWidth)
        .attr(
            "stroke-dasharray",
            self.chartSettings.connectingLineStyle === ELineType.Dotted
                ? `0, ${self.chartSettings.connectingLineWidth + 4} `
                : `${self.chartSettings.connectingLineWidth + 5}, ${self.chartSettings.connectingLineWidth + 3} `
        );

    if (self.isHorizontalChart) {
        connectingLine
            .attr(
                "d",
                line()
                    .y((d: any) => self.getYPosition(d.category) + self.scaleBandWidth / 2)
                    .x((d: any) => self.getXPosition(isValue2 ? d.value2 : d.value1))
            );
    } else {
        connectingLine
            .attr(
                "d",
                line()
                    .x((d: any) => self.getXPosition(d.category) + self.scaleBandWidth / 2)
                    .y((d: any) => self.getYPosition(isValue2 ? d.value2 : d.value1))
            );
    }
}
