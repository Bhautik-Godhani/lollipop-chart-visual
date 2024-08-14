/* eslint-disable max-lines-per-function */
import { ISmallMultiplesGridItemContent } from "../SmallMultiplesGridLayout";
import { EVisualConfig, EVisualSettings } from "../enum";
import { NumberFormatting } from "../settings";
import { Visual } from "../visual";
import { IBrushAndZoomAreaSettings, IChartSettings, ICutAndClipAxisSettings, IDataColorsSettings, IDataLabelsSettings, IDynamicDeviationSettings, IErrorBarsSettings, IGridLinesSettings, ILegendSettings, ILineSettings, IMarkerSettings, IPatternSettings, IRaceChartSettings, IRankingSettings, IReferenceLineSettings, ISortingSettings, ITemplateSettings, IXAxisSettings, IYAxisSettings } from "../visual-settings.interface";

export const SetBeforeTemplateSettings = (self: Visual, templateSettings: ITemplateSettings): void => {
    let beforeTemplateSettings;

    if (templateSettings.isTemplatesEnabled) {
        beforeTemplateSettings = {
            [EVisualSettings.ChartSettings]: { configName: EVisualConfig.ChartConfig, settingName: EVisualSettings.ChartSettings, configValues: self.chartSettings },
            [EVisualSettings.MarkerSettings]: { configName: EVisualConfig.MarkerConfig, settingName: EVisualSettings.MarkerSettings, configValues: self.markerSettings },
            [EVisualSettings.LineSettings]: { configName: EVisualConfig.LineConfig, settingName: EVisualSettings.LineSettings, configValues: self.lineSettings },
            [EVisualSettings.DataColorsSettings]: { configName: EVisualConfig.DataColorsConfig, settingName: EVisualSettings.DataColorsSettings, configValues: self.dataColorsSettings },
            [EVisualSettings.SmallMultiplesSettings]: { configName: EVisualConfig.SmallMultiplesConfig, settingName: EVisualSettings.SmallMultiplesSettings, configValues: self.smallMultiplesSettings },
            [EVisualSettings.XAxisSettings]: { configName: EVisualConfig.XAxisConfig, settingName: EVisualSettings.XAxisSettings, configValues: self.xAxisSettings },
            [EVisualSettings.YAxisSettings]: { configName: EVisualConfig.YAxisConfig, settingName: EVisualSettings.YAxisSettings, configValues: self.yAxisSettings },
            [EVisualSettings.DataLabelsSettings]: { configName: EVisualConfig.DataLabelsConfig, settingName: EVisualSettings.DataLabelsSettings, configValues: self.dataLabelsSettings },
            [EVisualSettings.BrushAndZoomAreaSettings]: { configName: EVisualConfig.BrushAndZoomAreaConfig, settingName: EVisualSettings.BrushAndZoomAreaSettings, configValues: self.brushAndZoomAreaSettings },
            [EVisualSettings.RaceChartSettings]: { configName: EVisualConfig.RaceChartConfig, settingName: EVisualSettings.RaceChartSettings, configValues: self.raceChartSettings },
            [EVisualSettings.ReferenceLinesSettings]: { configName: EVisualConfig.ReferenceLinesConfig, settingName: EVisualSettings.ReferenceLinesSettings, configValues: self.referenceLinesSettings },
            [EVisualSettings.ErrorBarsSettings]: { configName: EVisualConfig.ErrorBarsConfig, settingName: EVisualSettings.ErrorBarsSettings, configValues: self.errorBarsSettings },
            [EVisualSettings.DynamicDeviationSettings]: { configName: EVisualConfig.DynamicDeviationConfig, settingName: EVisualSettings.DynamicDeviationSettings, configValues: self.dynamicDeviationSettings },
            [EVisualSettings.CutAndClipAxisSettings]: { configName: EVisualConfig.CutAndClipAxisConfig, settingName: EVisualSettings.CutAndClipAxisSettings, configValues: self.cutAndClipAxisSettings },
            [EVisualSettings.PatternSettings]: { configName: EVisualConfig.PatternConfig, settingName: EVisualSettings.PatternSettings, configValues: self.patternSettings },
            [EVisualSettings.RankingSettings]: { configName: EVisualConfig.RankingConfig, settingName: EVisualSettings.RankingSettings, configValues: self.rankingSettings },
            [EVisualSettings.Sorting]: { configName: EVisualConfig.SortingConfig, settingName: EVisualSettings.Sorting, configValues: self.sortingSettings },
            [EVisualSettings.GridLinesSettings]: { configName: EVisualConfig.GridLinesConfig, settingName: EVisualSettings.GridLinesSettings, configValues: self.gridSettings },
            [EVisualSettings.Legend]: { configName: undefined, settingName: EVisualSettings.Legend, configValues: self.legendSettings },
            [EVisualSettings.NumberFormatting]: { configName: undefined, settingName: EVisualSettings.NumberFormatting, configValues: self.numberSettings },
        };

        self._host.persistProperties({
            merge: [
                {
                    objectName: EVisualConfig.Editor,
                    displayName: EVisualSettings.BeforeTemplateSettings,
                    properties: {
                        [EVisualSettings.BeforeTemplateSettings]: JSON.stringify(beforeTemplateSettings),
                    },
                    selector: null,
                },
            ],
        });
    }
}

export const ApplyBeforeTemplateAppliedSettingsBack = (self: Visual): void => {
    const beforeIBCSSettings = self.beforeTemplateSettings;

    if (Object.keys(beforeIBCSSettings).length > 0) {
        const chartSettings: IChartSettings = beforeIBCSSettings[EVisualSettings.ChartSettings].configValues;
        const markerSettings: IMarkerSettings = beforeIBCSSettings[EVisualSettings.MarkerSettings].configValues;
        const lineSettings: ILineSettings = beforeIBCSSettings[EVisualSettings.LineSettings].configValues;
        const dataColorsSettings: IDataColorsSettings = beforeIBCSSettings[EVisualSettings.DataColorsSettings].configValues;
        const smallMultiplesSettings: ISmallMultiplesGridItemContent = beforeIBCSSettings[EVisualSettings.SmallMultiplesSettings].configValues;
        const xAxisSettings: IXAxisSettings = beforeIBCSSettings[EVisualSettings.XAxisSettings].configValues;
        const yAxisSettings: IYAxisSettings = beforeIBCSSettings[EVisualSettings.YAxisSettings].configValues;
        const dataLabelsSettings: IDataLabelsSettings = beforeIBCSSettings[EVisualSettings.DataLabelsSettings].configValues;
        const brushAndZoomAreaSettings: IBrushAndZoomAreaSettings = beforeIBCSSettings[EVisualSettings.BrushAndZoomAreaSettings].configValues;
        const raceChartSettings: IRaceChartSettings = beforeIBCSSettings[EVisualSettings.RaceChartSettings].configValues;
        const referenceLinesSettings: IReferenceLineSettings = beforeIBCSSettings[EVisualSettings.ReferenceLinesSettings].configValues;
        const errorBarsSettings: IErrorBarsSettings = beforeIBCSSettings[EVisualSettings.ErrorBarsSettings].configValues;
        const dynamicDeviationSettings: IDynamicDeviationSettings = beforeIBCSSettings[EVisualSettings.DynamicDeviationSettings].configValues;
        const cutAndClipAxisSettings: ICutAndClipAxisSettings = beforeIBCSSettings[EVisualSettings.CutAndClipAxisSettings].configValues;
        const patternSettings: IPatternSettings = beforeIBCSSettings[EVisualSettings.PatternSettings].configValues;
        const rankingSettings: IRankingSettings = beforeIBCSSettings[EVisualSettings.RankingSettings].configValues;
        const sortingSettings: ISortingSettings = beforeIBCSSettings[EVisualSettings.Sorting].configValues;
        const gridSettings: IGridLinesSettings = beforeIBCSSettings[EVisualSettings.GridLinesSettings].configValues;
        const legend: ILegendSettings = beforeIBCSSettings[EVisualSettings.Legend].configValues;
        const numberSettings: NumberFormatting = beforeIBCSSettings[EVisualSettings.NumberFormatting].configValues;

        self._host.persistProperties({
            merge: [
                {
                    objectName: EVisualConfig.ChartConfig,
                    displayName: EVisualSettings.ChartSettings,
                    properties: {
                        [EVisualSettings.ChartSettings]: JSON.stringify(chartSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.LineConfig,
                    displayName: EVisualSettings.LineSettings,
                    properties: {
                        [EVisualSettings.LineSettings]: JSON.stringify(lineSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.MarkerConfig,
                    displayName: EVisualSettings.MarkerSettings,
                    properties: {
                        [EVisualSettings.MarkerSettings]: JSON.stringify(markerSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.DataColorsConfig,
                    displayName: EVisualSettings.DataColorsSettings,
                    properties: {
                        [EVisualSettings.DataColorsSettings]: JSON.stringify(dataColorsSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.DataLabelsConfig,
                    displayName: EVisualSettings.DataLabelsSettings,
                    properties: {
                        [EVisualSettings.DataLabelsSettings]: JSON.stringify(dataLabelsSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.XAxisConfig,
                    displayName: EVisualSettings.XAxisSettings,
                    properties: {
                        [EVisualSettings.XAxisSettings]: JSON.stringify(xAxisSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.YAxisConfig,
                    displayName: EVisualSettings.YAxisSettings,
                    properties: {
                        [EVisualSettings.YAxisSettings]: JSON.stringify(yAxisSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.SortingConfig,
                    displayName: EVisualSettings.Sorting,
                    properties: {
                        [EVisualSettings.Sorting]: JSON.stringify(sortingSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualSettings.Legend,
                    properties: { ...legend },
                    selector: null,
                },
                {
                    objectName: EVisualSettings.NumberFormatting,
                    properties: { ...numberSettings },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.GridLinesConfig,
                    displayName: EVisualSettings.GridLinesSettings,
                    properties: {
                        [EVisualSettings.GridLinesSettings]: JSON.stringify(gridSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.SmallMultiplesConfig,
                    displayName: EVisualSettings.SmallMultiplesSettings,
                    properties: {
                        [EVisualSettings.SmallMultiplesSettings]: JSON.stringify(smallMultiplesSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.BrushAndZoomAreaConfig,
                    displayName: EVisualSettings.BrushAndZoomAreaSettings,
                    properties: {
                        [EVisualSettings.BrushAndZoomAreaSettings]: JSON.stringify(brushAndZoomAreaSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.RaceChartConfig,
                    displayName: EVisualSettings.RaceChartSettings,
                    properties: {
                        [EVisualSettings.RaceChartSettings]: JSON.stringify(raceChartSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.ReferenceLinesConfig,
                    displayName: EVisualSettings.ReferenceLinesSettings,
                    properties: {
                        [EVisualSettings.ReferenceLinesSettings]: JSON.stringify(referenceLinesSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.ErrorBarsConfig,
                    displayName: EVisualSettings.ErrorBarsSettings,
                    properties: {
                        [EVisualSettings.ErrorBarsSettings]: JSON.stringify(errorBarsSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.DynamicDeviationConfig,
                    displayName: EVisualSettings.DynamicDeviationSettings,
                    properties: {
                        [EVisualSettings.DynamicDeviationSettings]: JSON.stringify(dynamicDeviationSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.CutAndClipAxisConfig,
                    displayName: EVisualSettings.CutAndClipAxisSettings,
                    properties: {
                        [EVisualSettings.CutAndClipAxisSettings]: JSON.stringify(cutAndClipAxisSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.PatternConfig,
                    displayName: EVisualSettings.PatternSettings,
                    properties: {
                        [EVisualSettings.PatternSettings]: JSON.stringify(patternSettings),
                    },
                    selector: null,
                },
                {
                    objectName: EVisualConfig.RankingConfig,
                    displayName: EVisualSettings.RankingSettings,
                    properties: {
                        [EVisualSettings.RankingSettings]: JSON.stringify(rankingSettings),
                    },
                    selector: null,
                },
            ],
        });
    }
}