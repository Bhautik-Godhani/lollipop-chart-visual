import { max as D3Max, min as D3Min } from "d3-array";
import { Visual } from "../visual";
import { ESmallMultiplesAxisType } from "@truviz/shadow/dist/Components";
import { AxisCategoryType, EAxisDateFormats } from "../enum";
import { timeFormat } from "d3";

export const GetAxisDomainMinMax = (self: Visual): { min: number, max: number } => {
    const values = self.chartData.reduce((arr, d) => {
        return self.errorBarsSettings.isEnabled ? [...arr, d.value1, d.value2, d.upperBoundValue, d.lowerBoundValue] : [...arr, d.value1, d.value2];
    }, []);

    let min = +D3Min(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ? [...self.chartData.map((d) => d.value1), ...self.chartData.map((d) => d.upperBoundValue), ...self.chartData.map((d) => d.lowerBoundValue)] : self.chartData.map((d) => d.value1));

    let max = +D3Max(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ? [...self.chartData.map((d) => d.value1), ...self.chartData.map((d) => d.upperBoundValue), ...self.chartData.map((d) => d.lowerBoundValue)] : self.chartData.map((d) => d.value1));

    if (self.smallMultiplesSettings.yAxisType === ESmallMultiplesAxisType.Uniform) {
        min = +self.originalCategoricalData.values[0].minLocal;
        max = +self.originalCategoricalData.values[0].maxLocal;
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

    if (max >= 0) {
        max += max * 0.1;
    } else {
        max -= max * 0.1;
    }

    self.isHasNegativeValue = min < 0 || max < 0;

    return { min, max };
}

export const FormatAxisDate = (dateFormat: EAxisDateFormats, date: Date): string => {
    switch (dateFormat) {
        case EAxisDateFormats.DDMMYYYY:
            return timeFormat("%d:%m:%Y")(date);

        case EAxisDateFormats.DDMMYYYYHHMM:
            return timeFormat("%d:%m:%Y %H:%M")(date);

        case EAxisDateFormats.DDMMYYYYHHMMAMPM:
            return timeFormat("%d:%m:%Y %I:%M %p")(date);

        default:
            return timeFormat("%d:%m:%Y")(date);
    }
}