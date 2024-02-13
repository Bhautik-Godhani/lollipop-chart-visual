import { ILollipopChartRow } from "../model";
import { Visual } from "../visual";
import { Selection } from "d3-selection";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderCutAndClipMarkerOnAxis = (self: Visual): void => {
    const width = self.isHorizontalChart ? self.cutAndClipMarkerWidth : 20;
    const height = self.isHorizontalChart ? 12 : 6;
    self.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
    const cutAndClipMarkerG = self.axisCutAndClipMarkerG
        .append("g")
        .attr("class", "cutAndClipMarkerG")
        .attr("clip-path", "url(#cutMarkerClipOnAxis)");
    const beforeCutDomain = self.beforeCutLinearScale?.domain() ?? [0, 0];
    const afterCutDomain = self.afterCutLinearScale?.domain() ?? [0, 0];
    const secG = cutAndClipMarkerG.append("g");
    const transX = self.getXPosition(self.isLeftYAxis ? beforeCutDomain[1] : afterCutDomain[0]);

    const cutMarkerClipG = self.axisCutAndClipMarkerG.append("g").attr("class", "cutMarkerClipG");

    if (self.isHorizontalChart) {
        secG.attr("transform", `translate(${transX}, ${self.isBottomXAxis ? self.height : 0})`);
    } else {
        secG.attr(
            "transform",
            `translate(${self.isLeftYAxis ? -(width / 2) : self.width - width / 2}, ${self.getYPosition(self.cutAndClipAxisSettings.breakEnd) -
            (self.isBottomXAxis ? 0 : self.barCutAndClipMarkerLinesGap / 2)
            })`
        );
    }

    if (self.isHorizontalChart) {
        secG
            .append("rect")
            .attr("width", height + width)
            .attr("height", width)
            .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
            .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
            .attr("stroke-width", "3px")
            .attr("stroke-dasharray", `${height + width} ${width} `)
            .attr("transform", `translate(${height + width}, ${- (height + width) / 2}) rotate(${90 + self.cutAndClipMarkerTilt})`);
    } else {
        secG
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
            .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
            .attr("stroke-width", "3px")
            .attr("stroke-dasharray", `${width} ${height} `)
            .attr(
                "transform",
                `translate(${0}, ${((width - 3) * self.cutAndClipMarkerTilt) / 100}) rotate(${- self.cutAndClipMarkerTilt})`
            );
    }
}

export const GetIsCutAndClipAxisEnabled = (self: Visual): boolean => {
    const breakStart = self.cutAndClipAxisSettings.breakStart;
    const breakEnd = self.cutAndClipAxisSettings.breakEnd;
    const minValue = self.minCategoryValueDataPair.value;
    const maxValue = self.maxCategoryValueDataPair.value;

    return (
        self.cutAndClipAxisSettings.isEnabled &&
        breakEnd > breakStart &&
        (minValue >= 0 ? breakStart > 0 : breakStart > minValue) &&
        breakEnd < maxValue
    );
}

const SetOverlappedAxisTicksPosition = (self: Visual): void => {
    if (!self.isHorizontalChart) {
        if (self.isBottomXAxis) {
            self.beforeCutLinearYAxisG.selectAll(".tick:last-of-type text").attr("dy", "1.32em");
            self.afterCutLinearYAxisG.select(".tick").select("text").attr("dy", "0em");
        } else {
            self.afterCutLinearYAxisG.select(".tick").select("text").attr("dy", "1.32em");
            self.beforeCutLinearYAxisG.selectAll(".tick:last-of-type text").attr("dy", "0em");
        }
    } else {
        if (self.isLeftYAxis) {
            self.beforeCutLinearXAxisG.selectAll(".tick:last-of-type text").attr("dx", "-0.32em").attr("text-anchor", "end");
            self.afterCutLinearXAxisG.select(".tick").select("text").attr("dx", "0.32em").attr("text-anchor", "start");
        } else {
            self.afterCutLinearXAxisG.select(".tick").select("text").attr("dx", "-0.32em").attr("text-anchor", "end");
            self.beforeCutLinearXAxisG.selectAll(".tick:last-of-type text").attr("dx", "-0.32em").attr("text-anchor", "start");
        }
    }
}

export const RenderBarCutAndClipMarker = (self: Visual, barData: ILollipopChartRow[]): void => {
    SetOverlappedAxisTicksPosition(self);
    const filteredData = barData.filter((d) => d.value1 > self.cutAndClipAxisSettings.breakStart);
    const imageGSelection = self.barCutAndClipMarkersG
        .selectAll(".barCutAndClipMarkersG")
        .data(filteredData, (d) => Math.random());
    imageGSelection.join(
        (enter) => {
            const clipG = enter.append("g");
            const imageG = clipG.append("g").attr("class", "barCutAndClipMarkersG");
            const rect = imageG.append("rect").attr("class", "barCutAndClipRect");
            self.isHorizontalChart
                ? FormattingVerticalBarCutAndClipMarker(self, imageG, rect)
                : FormattingHorizontalBarCutAndClipMarker(self, imageG, rect);
        },
        (update) => {
            const rect = update.select(".barCutAndClipRect");
            self.isHorizontalChart
                ? FormattingVerticalBarCutAndClipMarker(self, update, rect)
                : FormattingHorizontalBarCutAndClipMarker(self, update, rect);
        }
    );
}

export const FormattingVerticalBarCutAndClipMarker = (self: Visual, imageGSelection: D3Selection<SVGElement>, rectSelection: D3Selection<SVGElement>): void => {
    const beforeCutScaleDomain = self.beforeCutLinearScale?.domain() ?? [0, 0];
    const transX = self.getXPosition(self.isLeftYAxis ? beforeCutScaleDomain[1] : beforeCutScaleDomain[1]);
    const rectHeight = 20;

    imageGSelection.attr("transform", (d) => {
        return `translate(${transX - (!self.isLeftYAxis ? -self.cutAndClipMarkerWidth : 0)}, ${self.getYPosition(d?.category) + self.scaleBandWidth / 2 - rectHeight / 2 + self.lineSettings.lineWidth})`;
    });

    rectSelection
        .attr("width", rectHeight)
        .attr("height", self.cutAndClipMarkerWidth)
        .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
        .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
        .attr("stroke-width", "3px")
        .attr("stroke-dasharray", `${rectHeight} ${self.cutAndClipMarkerHeight} `)
        .attr("transform", `translate(${rectHeight}, ${- self.cutAndClipMarkerWidth / 2}) rotate(${90 + self.cutAndClipMarkerTilt})`);
}

export const FormattingHorizontalBarCutAndClipMarker = (self: Visual, imageGSelection: D3Selection<SVGElement>, rectSelection: D3Selection<SVGElement>): void => {
    const afterCutScaleDomain = self.afterCutLinearScale?.domain() ?? [0, 0];
    const transY = self.getYPosition(afterCutScaleDomain?.length ? afterCutScaleDomain[0] : 0);
    const rectWidth = 20;

    imageGSelection.attr("transform", (d) => {
        return `translate(${self.getXPosition(d.category) + (self.scaleBandWidth / 2) - rectWidth / 2 + self.lineSettings.lineWidth}, ${transY - (!self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : 0)
            })`;
    });

    rectSelection
        .attr("width", rectWidth)
        .attr("height", self.cutAndClipMarkerHeight)
        .attr("fill", self.cutAndClipAxisSettings.markerBackgroundColor)
        .attr("stroke", self.cutAndClipAxisSettings.markerStrokeColor)
        .attr("stroke-dasharray", `${rectWidth} ${self.cutAndClipMarkerHeight} `)
        .attr("stroke-width", "3px")
        .attr(
            "transform",
            `translate(${- self.cutAndClipMarkerHeight / 2}, ${((rectWidth - self.cutAndClipMarkerHeight / 2) * self.cutAndClipMarkerTilt) / 100
            }) rotate(${- self.cutAndClipMarkerTilt})`
        );
}