import { max as D3Max, min as D3Min } from "d3-array";
import { Visual } from "../visual";

export const GetAxisDomainMinMax = (self: Visual): { min: number, max: number } => {
    const values = self.chartData.reduce((arr, d) => {
        return self.errorBarsSettings.isEnabled ? [...arr, d.value1, d.value2, d.upperBoundValue, d.lowerBoundValue] : [...arr, d.value1, d.value2];
    }, []);

    let min = +D3Min(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ? [...self.chartData.map((d) => d.value1), ...self.chartData.map((d) => d.upperBoundValue), ...self.chartData.map((d) => d.lowerBoundValue)] : self.chartData.map((d) => d.value1));

    if (min > 0) {
        min = 0;
    }

    let max = +D3Max(self.isHasMultiMeasure ? values.map((val) => val) :
        self.errorBarsSettings.isEnabled ? [...self.chartData.map((d) => d.value1), ...self.chartData.map((d) => d.upperBoundValue), ...self.chartData.map((d) => d.lowerBoundValue)] : self.chartData.map((d) => d.value1));

    if (max >= 0) {
        max += max * 0.15;
    } else {
        max -= max * 0.15;
    }

    self.isHasNegativeValue = min < 0 || max < 0;

    return { min, max };
}