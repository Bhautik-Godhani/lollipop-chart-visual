import { select } from "d3-selection";
import { Position } from "../enum";
import { Visual } from "../visual";
import { axisLeft, axisRight } from "d3-axis";
import { timeFormat } from "d3";

export const CallYScaleOnAxisGroup = (self: Visual, width: number, height: number, yAxisG: SVGElement): void => {
    if (!self.isHorizontalChart && (self.isLogarithmScale || self.isShowPositiveNegativeLogScale)) {
        if (self.isShowPositiveNegativeLogScale) {
            let positiveTicks: any[] = self.positiveLogScale.ticks(self.positiveLogScaleHeight / 50);
            positiveTicks = positiveTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d)));
            });

            let negativeTicks: any[] = self.negativeLogScale.ticks(self.negativeLogScaleHeight / 50);
            negativeTicks = negativeTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d))) && d !== 0.1;
            });

            self.positiveLogScaleTicks = positiveTicks;
            self.negativeLogScaleTicks = negativeTicks.map(d => d * -1);

            const positiveLogScaleRange = self.positiveLogScale.range();

            if (self.yAxisSettings.position === Position.Left) {
                select(yAxisG).attr("transform", `translate(0, 0)`);
                self.positiveLogYAxisG
                    .attr("transform", `translate(0, ${self.isBottomXAxis ? 0 : self.negativeLogScaleHeight})`)
                    .call(axisLeft(self.positiveLogScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));

                self.negativeLogYAxisG
                    .attr("transform", `translate(0, ${self.isBottomXAxis ? positiveLogScaleRange[0] : 0})`)
                    .call(axisLeft(self.negativeLogScale).tickValues(negativeTicks).tickFormat(d => "-" + (d === 0.1 ? "isZero" : "") + d));
            } else if (self.yAxisSettings.position === Position.Right) {
                select(yAxisG).attr("transform", `translate(${width}, 0)`);
                self.positiveLogYAxisG
                    .attr("transform", `translate(0, ${self.isBottomXAxis ? 0 : self.negativeLogScaleHeight})`)
                    .call(axisRight(self.positiveLogScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));

                self.negativeLogYAxisG
                    .attr("transform", `translate(0, ${self.isBottomXAxis ? self.positiveLogScaleHeight : 0})`)
                    .call(axisRight(self.negativeLogScale).tickValues(negativeTicks).tickFormat(d => "-" + (d === 0.1 ? "isZero" : "") + d));
            }
        } else if (self.isLogarithmScale) {
            let positiveTicks: any[] = self.yScale.ticks(self.height / 90);
            positiveTicks = positiveTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d)));
            });

            if (self.yAxisSettings.position === Position.Left) {
                select(yAxisG).attr("transform", `translate(0, 0)`)
                    .call(axisLeft(self.yScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            } else if (self.yAxisSettings.position === Position.Right) {
                select(yAxisG)
                    .attr("transform", `translate(${width}, 0)`)
                    .call(axisRight(self.yScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            }
        }
    } else {
        if (self.yAxisSettings.position === Position.Left) {
            select(yAxisG).attr("transform", `translate(0, 0)`).call(axisLeft(self.yScale).ticks(height / 90)
                .tickFormat(d => {
                    const isOthersTick = d.toString().includes(self.othersLabel);
                    if (self.isYIsDateTimeAxis && self.isYIsContinuousAxis && !isOthersTick) {
                        return timeFormat("%b %Y")(new Date(d.toString()));
                    } else {
                        return d.toString();
                    }
                }));
        } else if (self.yAxisSettings.position === Position.Right) {
            select(yAxisG)
                .attr("transform", `translate(${width}, 0)`).call(axisRight(self.yScale).ticks(height / 90)
                    .tickFormat(d => {
                        const isOthersTick = d.toString().includes(self.othersLabel);
                        if (self.isYIsDateTimeAxis && self.isYIsContinuousAxis && !isOthersTick) {
                            return timeFormat("%b %Y")(new Date(d.toString()));
                        } else {
                            return d.toString();
                        }
                    }));
        }
    }
}

export function GetPositiveNegativeLogYScale(self: Visual, value: number | string): number {
    if (!self.isHorizontalChart && self.isShowPositiveNegativeLogScale) {
        if (parseFloat((value ? value : 0).toString()) < 0) {
            value = Math.abs(+value);
            return self.negativeLogScale(Math.abs(value as number)) + (self.isBottomXAxis ? self.positiveLogScale(0.1) : 0);
        } else {
            return self.positiveLogScale(value === 0 ? 0.1 : value) + (!self.isBottomXAxis ? self.negativeLogScale(0.1) : 0);
        }
    }
}
