import { ECutAndClipMarkerPlacementTypes, EHighContrastColorType } from "../enum";
import { ILollipopChartRow } from "../model";
import { Visual } from "../visual";
import { Selection } from "d3-selection";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderCutAndClipMarkerOnAxis = (self: Visual): void => {
    const width = 12;
    const height = 6;
    self.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();

    if (self.cutAndClipAxisSettings.markerPlacement !== ECutAndClipMarkerPlacementTypes.Categories) {
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
            secG.attr("transform", `translate(${transX}, ${self.isBottomXAxis ? self.height - width / 2 : width + width / 4})`);
        } else {
            secG.attr(
                "transform",
                `translate(${self.isLeftYAxis ? (width / 4) : self.width - width - width / 4}, ${self.getYPosition(self.cutAndClipAxisSettings.breakStart) -
                (self.isBottomXAxis ? 0 : self.barCutAndClipMarkerLinesGap / 2)
                })`
            );
        }

        if (self.isHorizontalChart) {
            secG
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", self.getColor(self.cutAndClipAxisSettings.markerBackgroundColor, EHighContrastColorType.Background))
                .attr("stroke", self.getColor(self.cutAndClipAxisSettings.markerStrokeColor, EHighContrastColorType.Foreground))
                .attr("stroke-width", "3px")
                .attr("stroke-dasharray", `${width} ${height} `)
                .attr("transform", `translate(${self.isLeftYAxis ? height + width : -(height + width)}, ${- (height + width) / 2}) rotate(${90 + self.cutAndClipMarkerTilt})`);
        } else {
            secG
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", self.getColor(self.cutAndClipAxisSettings.markerBackgroundColor, EHighContrastColorType.Background))
                .attr("stroke", self.getColor(self.cutAndClipAxisSettings.markerStrokeColor, EHighContrastColorType.Foreground))
                .attr("stroke-width", "3px")
                .attr("stroke-dasharray", `${width} ${height} `)
                .attr(
                    "transform",
                    `translate(${0}, ${((width - 3) * self.cutAndClipMarkerTilt) / 100}) rotate(${- self.cutAndClipMarkerTilt})`
                );
        }
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
            const ticks: D3Selection<SVGElement> = self.beforeCutLinearYAxisG.selectAll(".tick:last-of-type text");
            // if (ticks.nodes().length > 1) {
            ticks.attr("dy", `${ticks.nodes()[0].getBoundingClientRect().height}px`);
            // }
            self.afterCutLinearYAxisG.select(".tick").select("text").attr("dy", "0.32em");
        } else {
            const tick = self.afterCutLinearYAxisG.select(".tick").select("text");
            tick.attr("dy", `${tick.node().getBBox().height}px`);
            self.beforeCutLinearYAxisG.selectAll(".tick:last-of-type text").attr("dy", "0");
        }
    } else {
        if (self.isLeftYAxis) {
            const ticks: D3Selection<SVGElement> = self.beforeCutLinearXAxisG.selectAll(".tick:last-of-type text");
            // if (ticks.nodes().length > 1) {
            self.beforeCutLinearXAxisG.selectAll(".tick:last-of-type text").attr("dx", "-0.32em").attr("text-anchor", "middle");
            // }
            const tick = self.afterCutLinearXAxisG.select(".tick").select("text");
            tick.attr("dx", `${tick.node().getBBox().width}px`).attr("text-anchor", "middle");
        } else {
            const tick = self.afterCutLinearXAxisG.select(".tick").select("text");
            tick.attr("dx", `-${tick.node().getBBox().width}px`).attr("text-anchor", "end");
            self.beforeCutLinearXAxisG.selectAll(".tick:last-of-type text").attr("dx", "0.32em").attr("text-anchor", "end");
        }
    }
}

export const RenderBarCutAndClipMarker = (self: Visual, barData: ILollipopChartRow[]): void => {
    if (self.isCutAndClipAxisEnabled) {
        SetOverlappedAxisTicksPosition(self);
    }

    const filteredData = barData.filter((d) => (self.isHasMultiMeasure ? (d.value1 + d.value2) : d.value1) > self.cutAndClipAxisSettings.breakStart);
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
    const afterCutScaleDomain = self.afterCutLinearScale?.domain() ?? [0, 0];

    const transX = self.getXPosition(self.isLeftYAxis ? beforeCutScaleDomain[1] : afterCutScaleDomain[0]);
    const rectHeight = 20;

    imageGSelection.attr("transform", (d) => {
        return `translate(${transX - (!self.isLeftYAxis ? -self.cutAndClipMarkerWidth : 0)}, ${self.getYPosition(d?.category) + self.scaleBandWidth / 2 - rectHeight / 2 + self.lineSettings.lineWidth})`;
    });

    rectSelection
        .attr("width", rectHeight)
        .attr("height", self.cutAndClipMarkerWidth)
        .attr("fill", self.getColor(self.cutAndClipAxisSettings.markerBackgroundColor, EHighContrastColorType.Background))
        .attr("stroke", self.getColor(self.cutAndClipAxisSettings.markerStrokeColor, EHighContrastColorType.Foreground))
        .attr("stroke-width", "3px")
        .attr("stroke-dasharray", `${rectHeight} ${self.cutAndClipMarkerHeight} `)
        .attr("transform", `translate(${self.isLeftYAxis ? rectHeight : -rectHeight}, ${- self.cutAndClipMarkerWidth / 2}) rotate(${90 + self.cutAndClipMarkerTilt})`);
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
        .attr("fill", self.getColor(self.cutAndClipAxisSettings.markerBackgroundColor, EHighContrastColorType.Background))
        .attr("stroke", self.getColor(self.cutAndClipAxisSettings.markerStrokeColor, EHighContrastColorType.Foreground))
        .attr("stroke-dasharray", `${rectWidth} ${self.cutAndClipMarkerHeight} `)
        .attr("stroke-width", "3px")
        .attr(
            "transform",
            `translate(${- self.cutAndClipMarkerHeight / 2}, ${((rectWidth - self.cutAndClipMarkerHeight / 2) * self.cutAndClipMarkerTilt) / 100
            }) rotate(${- self.cutAndClipMarkerTilt})`
        );
}