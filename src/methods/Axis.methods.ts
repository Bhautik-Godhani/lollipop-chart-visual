import { max as D3Max, min as D3Min, sum } from "d3-array";
import { Visual } from "../visual";
import { ESmallMultiplesAxisType } from "@truviz/shadow/dist/Components";
import { AxisCategoryType, EAxisDateFormats } from "../enum";
import * as moment from "moment";

export const GetAxisDomainMinMax = (self: Visual): { min: number, max: number } => {
    const values = self.chartData.reduce((arr, d) => {
        return self.errorBarsSettings.isEnabled ?
            (self.isRenderBothErrorBars ?
                [...arr, d.value1, d.value2, d.errorBar1.upperBoundValue, d.errorBar2.upperBoundValue, d.errorBar1.lowerBoundValue, d.errorBar2.lowerBoundValue] :
                [...arr, d.value1, d.value2, d.errorBar1.upperBoundValue, d.errorBar1.lowerBoundValue]) :
            [...arr, d.value1, d.value2];
    }, []);

    const errorBarValues = [...self.chartData.map((d) => d.errorBar1.upperBoundValue), ...self.chartData.map((d) => d.errorBar1.lowerBoundValue)];

    if (self.isRenderBothErrorBars) {
        errorBarValues.push(...self.chartData.map((d) => d.errorBar2.upperBoundValue), ...self.chartData.map((d) => d.errorBar2.lowerBoundValue))
    }

    let min = +D3Min(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ?
            [...self.chartData.map((d) => d.value1), ...errorBarValues] :
            self.chartData.map((d) => d.value1));

    let max = +D3Max(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ?
            [...self.chartData.map((d) => d.value1), ...errorBarValues] :
            self.chartData.map((d) => d.value1));

    if (self.isSmallMultiplesEnabled && self.smallMultiplesSettings.yAxisType === ESmallMultiplesAxisType.Uniform) {
        min = self.isHasSubcategories ? D3Min(self.originalCategoricalData.values.grouped(), d => D3Min(d.values, v => sum(v.values, t => <number>t))) : +self.originalCategoricalData.values[0].minLocal;
        max = self.isHasSubcategories ? D3Max(self.originalCategoricalData.values.grouped(), d => D3Max(d.values, v => sum(v.values, t => <number>t))) : +self.originalCategoricalData.values[0].maxLocal;
    }

    if (min > 0) {
        min = 0;
    }

    if (self.yAxisSettings.categoryType === AxisCategoryType.Categorical) {
        if (self.yAxisSettings.isMinimumRangeEnabled && self.yAxisSettings.minimumRange) {
            min = self.yAxisSettings.minimumRange;
        }

        if (self.yAxisSettings.isMaximumRangeEnabled && self.yAxisSettings.maximumRange) {
            max = self.yAxisSettings.maximumRange;
        }
    }

    // if (max >= 0) {
    //     max += max * 0.1;
    // } else {
    //     max -= max * 0.1;
    // }

    if (max < 0) {
        max = 0;
    }

    self.isHasNegativeValue = min < 0 || max < 0;

    return { min, max };
}

export const FormatAxisDate = (dateFormat: EAxisDateFormats | string, date: string): string => {
    return moment(new Date(date).toUTCString()).format(dateFormat).toString();
}