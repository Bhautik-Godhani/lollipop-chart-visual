import { select } from "d3-selection";
import { Position } from "../enum";
import { Visual } from "../visual";
import { axisBottom, axisTop } from "d3-axis";
import { timeFormat } from "d3";

export const CallXScaleOnAxisGroup = (self: Visual, width: number, height: number, xAxisG: SVGElement): void => {
    if (self.isHorizontalChart && (self.isLogarithmScale || self.isShowPositiveNegativeLogScale)) {
        if (self.isShowPositiveNegativeLogScale) {
            let positiveTicks: any[] = self.positiveLogScale.ticks(self.positiveLogScaleWidth / 90);
            positiveTicks = positiveTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d)));
            });

            let negativeTicks: any[] = self.negativeLogScale.ticks(self.negativeLogScaleWidth / 90);
            negativeTicks = negativeTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d))) && d !== 0.1;
            });

            self.positiveLogScaleTicks = positiveTicks;
            self.negativeLogScaleTicks = negativeTicks.map(d => d * -1);

            if (self.xAxisSettings.position === Position.Bottom) {
                select(xAxisG).attr("transform", "translate(0," + height + ")");

                self.negativeLogXAxisG
                    .attr("transform", `translate(${self.isLeftYAxis ? 0 : self.positiveLogScaleWidth}, 0)`)
                    .call(axisBottom(self.negativeLogScale).tickValues(negativeTicks).tickFormat(d => "-" + (d === 0.1 ? "isZero" : "") + d));

                self.positiveLogXAxisG
                    .attr("transform", `translate(${self.isLeftYAxis ? self.negativeLogScaleWidth : 0}, 0)`)
                    .call(axisBottom(self.positiveLogScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            } else if (self.xAxisSettings.position === Position.Top) {
                select(xAxisG).attr("transform", "translate(0," + 0 + ")");

                self.negativeLogXAxisG
                    .attr("transform", `translate(${self.isLeftYAxis ? 0 : self.positiveLogScaleWidth}, 0)`)
                    .call(axisTop(self.negativeLogScale).tickValues(negativeTicks).tickFormat(d => "-" + (d === 0.1 ? "isZero" : "") + d));

                self.positiveLogXAxisG
                    .attr("transform", `translate(${self.isLeftYAxis ? self.negativeLogScaleWidth : 0}, 0)`)
                    .call(axisTop(self.positiveLogScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            }
        } else {
            let positiveTicks: any[] = self.xScale.ticks(width / 90);
            positiveTicks = positiveTicks.filter(function (d) {
                return d === Math.pow(10, Math.round(Math.log10(d)));
            });

            if (self.xAxisSettings.position === Position.Bottom) {
                select(xAxisG)
                    .attr("transform", "translate(0," + height + ")")
                    .call(axisBottom(self.xScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            } else if (self.xAxisSettings.position === Position.Top) {
                select(xAxisG)
                    .attr("transform", "translate(0," + 0 + ")")
                    .call(axisTop(self.xScale).tickValues(positiveTicks).tickFormat(d => (d === 0.1 ? "isZero" : "") + d));
            }
        }

    } else {
        if (self.xAxisSettings.position === Position.Bottom) {
            select(xAxisG)
                .attr("transform", "translate(0," + height + ")")
                .call(axisBottom(self.xScale).ticks(width / 90)
                    .tickFormat(d => {
                        // const isOthersTick = d.toString().includes(self.othersLabel);
                        // if (self.isXIsDateTimeAxis && self.isXIsContinuousAxis && !isOthersTick) {
                        //     return timeFormat("%b %Y")(new Date(d.toString()));
                        // } else {
                        return d.toString();
                        // }
                    }));
        } else if (self.xAxisSettings.position === Position.Top) {
            select(xAxisG).attr("transform", "translate(0," + 0 + ")").call(axisTop(self.xScale).ticks(width / 90)
                .tickFormat(d => {
                    const isOthersTick = d.toString().includes(self.othersLabel);
                    if (self.isXIsDateTimeAxis && self.isXIsContinuousAxis && !isOthersTick) {
                        return timeFormat("%b %Y")(new Date(d.toString()));
                    } else {
                        return d.toString();
                    }
                }));
        }
    }
}

export function GetPositiveNegativeLogXScale(self: Visual, value: number | string): number {
    if (self.isHorizontalChart && self.isShowPositiveNegativeLogScale) {
        if (parseFloat((value ? value : 0).toString()) < 0) {
            value = Math.abs(+value);
            return self.negativeLogScale(Math.abs(value as number)) + (self.isBottomXAxis ? (!isNaN(self.positiveLogScale(0.1)) ? self.positiveLogScale(0.1) : 0) : 0);
        } else {
            return self.positiveLogScale(value === 0 ? 0.1 : value) + (self.isBottomXAxis ? (!isNaN(self.negativeLogScale(0.1)) ? self.negativeLogScale(0.1) : 0) : 0);
        }
    }
}
