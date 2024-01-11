import { Visual } from "../visual";
import powerbi from "powerbi-visuals-api";
import { axisBottom, axisLeft, axisRight, axisTop, scaleLinear, scaleSymlog } from "d3";
import { Position } from "../enum";
import { GetAxisDomainMinMax } from "./Axis.methods";

export const RenderLinearCutAxis = (self: Visual): void => {
    SetLinearCutAxisDomain(self, false, self.categoricalData);
    SetLinearCutAxisRange(self, self.width, self.height);
    CallLinearCutScaleOnAxisGroup(self);
}

export const SetLinearCutAxisDomain = (self: Visual, isOnlySetDomain: boolean, categoricalData: powerbi.DataViewCategorical): void => {
    const { min, max } = GetAxisDomainMinMax(self);
    const isLinearScale: boolean = typeof self.chartData.map((d) => d.value1)[0] === "number";
    // const isLogarithmScale: boolean | undefined = self.axisByBarOrientation.isLogarithmScale;
    const isLogarithmScale: boolean | undefined = false;

    if (self.isHorizontalChart) {
        if (!isOnlySetDomain) {
            self.beforeCutLinearScale = isLogarithmScale ? scaleSymlog() : scaleLinear();
            self.afterCutLinearScale = isLogarithmScale ? scaleSymlog() : scaleLinear();
        }

        if (isLinearScale) {
            if (self.isLeftYAxis) {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]).nice();
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]).nice();
            } else {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]).nice();
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]).nice();
            }
        }
    } else {
        if (!isOnlySetDomain) {
            self.beforeCutLinearScale = isLogarithmScale ? scaleSymlog() : scaleLinear();
            self.afterCutLinearScale = isLogarithmScale ? scaleSymlog() : scaleLinear();
        }

        if (isLinearScale) {
            if (self.isBottomXAxis) {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]).nice();
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]).nice();
            } else {
                self.beforeCutLinearScale.domain([min, self.cutAndClipAxisSettings.breakStart]).nice();
                self.afterCutLinearScale.domain([self.cutAndClipAxisSettings.breakEnd, max]).nice();
            }
        }
    }
}

export const SetLinearCutAxisRange = (self: Visual, xScaleWidth: number, yScaleHeight: number): void => {
    const beforeCutDomain = self.beforeCutLinearScale.domain();
    const afterCutDomain = self.afterCutLinearScale.domain();
    const min = beforeCutDomain[0];
    const max = afterCutDomain[1];
    const beforeCutValue = self.cutAndClipAxisSettings.breakStart - min;
    const afterCutValue = max - self.cutAndClipAxisSettings.breakEnd;
    const maxWithoutCuttingValue = beforeCutValue + afterCutValue;
    const beforeCutAreaInPercentage = (beforeCutValue * 100) / maxWithoutCuttingValue;
    const afterCutAreaInPercentage = (afterCutValue * 100) / maxWithoutCuttingValue;
    const width = xScaleWidth;
    const height = yScaleHeight;
    const beforeCutLinearScaleArea =
        ((yScaleHeight) * beforeCutAreaInPercentage) / 100;
    const afterCutLinearScaleArea =
        ((yScaleHeight) * afterCutAreaInPercentage) / 100;
    self.beforeCutLinearScaleArea = beforeCutLinearScaleArea;
    self.afterCutLinearScaleArea = afterCutLinearScaleArea;

    if (self.isHorizontalChart) {
        if (self.isLeftYAxis) {
            self.beforeCutLinearScale.range([
                0,
                beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap,
            ]);

            self.afterCutLinearScale.range([beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2, xScaleWidth]);
        } else {
            self.afterCutLinearScale.range([
                width - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap,
                0,
            ]);

            self.beforeCutLinearScale.range([
                xScaleWidth,
                width - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2,
            ]);
        }
    } else {
        if (self.isBottomXAxis) {
            self.beforeCutLinearScale.range([
                height,
                height - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2,
            ]);

            self.afterCutLinearScale.range([height - beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap, 0]);
        } else {
            self.afterCutLinearScale.range([beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap / 2, height]);

            self.beforeCutLinearScale.range([0, beforeCutLinearScaleArea - self.barCutAndClipMarkerLinesGap]);
        }
    }
}

export const CallLinearCutScaleOnAxisGroup = (self: Visual): void => {
    if (!self.isHorizontalChart) {
        if (self.isLeftYAxis) {
            self.yAxisG.attr("transform", `translate(0, 0)`);
        } else {
            self.yAxisG.attr("transform", `translate(${self.width}, 0)`);
        }
    } else {
        if (self.isBottomXAxis) {
            self.xAxisG.attr("transform", "translate(0," + self.height + ")");
        } else {
            self.xAxisG.attr("transform", "translate(0," + 0 + ")");
        }
    }

    if (self.isHorizontalChart) {
        if (self.xAxisSettings.position === Position.Bottom) {
            self.beforeCutLinearXAxisG
                .attr("transform", `translate(0, ${0})`)
                .call(axisBottom(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 45));
            self.afterCutLinearXAxisG
                .attr("transform", `translate(0, ${0})`)
                .call(axisBottom(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 45));
        } else if (self.xAxisSettings.position === Position.Top) {
            self.beforeCutLinearXAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisTop(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 45));
            self.afterCutLinearXAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisTop(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 45));
        }
    } else {
        if (self.yAxisSettings.position === Position.Left) {
            self.beforeCutLinearYAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisLeft(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 35));
            self.afterCutLinearYAxisG
                .attr("transform", `translate(0, 0)`)
                .call(axisLeft(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 35));
        } else if (self.yAxisSettings.position === Position.Right) {
            self.beforeCutLinearYAxisG
                .attr("transform", `translate(${0}, 0)`)
                .call(axisRight(self.beforeCutLinearScale).ticks(self.beforeCutLinearScaleArea / 35));
            self.afterCutLinearYAxisG
                .attr("transform", `translate(${0}, 0)`)
                .call(axisRight(self.afterCutLinearScale).ticks(self.afterCutLinearScaleArea / 35));
        }
    }
}

export function GetCutAndClipXScale(value: number | string): number {
    const self = this;
    if (self.isCutAndClipAxisEnabled && self.isHorizontalChart) {
        const beforeCutDomain = self.beforeCutLinearScale.domain();
        const afterCutDomain = self.afterCutLinearScale.domain();
        if (value >= beforeCutDomain[0] && value <= beforeCutDomain[1]) {
            return self.beforeCutLinearScale(value);
        } else if (value >= afterCutDomain[0] && value <= afterCutDomain[1]) {
            return self.afterCutLinearScale(value);
        } else if (value > beforeCutDomain[1] && value < afterCutDomain[0]) {
            let diff = 0;
            if (self.isHorizontalChart) {
                diff = self.isLeftYAxis ? -self.barCutAndClipMarkerLinesGap / 2 : self.barCutAndClipMarkerLinesGap / 2;
            } else {
                // diff = self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : -self.barCutAndClipMarkerLinesGap / 2;
            }
            return self.beforeCutLinearScale(beforeCutDomain[1]) - diff;
        }
    }
}

export function GetCutAndClipYScale(value: number | string): number {
    const self = this;
    if (self.isCutAndClipAxisEnabled && !self.isHorizontalChart) {
        const beforeCutDomain = self.beforeCutLinearScale.domain();
        const afterCutDomain = self.afterCutLinearScale.domain();
        if (value >= beforeCutDomain[0] && value <= beforeCutDomain[1]) {
            return self.beforeCutLinearScale(value);
        } else if (value >= afterCutDomain[0] && value <= afterCutDomain[1]) {
            return self.afterCutLinearScale(value);
        } else if (value > beforeCutDomain[1] && value < afterCutDomain[0]) {
            let diff = 0;
            if (!self.isHorizontalChart) {
                diff = self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : -self.barCutAndClipMarkerLinesGap / 2;
            } else {
                // diff = this.isBottomXAxis ? this.barCutAndClipMarkerLinesGap / 2 : this.barCutAndClipMarkerLinesGap / 2;
            }
            return self.beforeCutLinearScale(beforeCutDomain[1]) - diff;
        }
    }
}
