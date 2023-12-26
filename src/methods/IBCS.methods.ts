/* eslint-disable max-lines-per-function */
import { SORTING_SETTINGS } from "../constants";
import { ColorPaletteType, DataLabelsPlacement, DisplayUnits, EChartSettings, EDataColorsSettings, EDataLabelsSettings, EGridLinesSettings, EIBCSSettings, EIBCSThemes, ELineSettings, ELineType, EMarkerDefaultShapes, EMarkerSettings, EMarkerShapeTypes, ENumberFormatting, EVisualConfig, EVisualSettings, EXAxisSettings, EYAxisSettings, Orientation, SemanticNegativeNumberFormats, SemanticPositiveNumberFormats } from "../enum";
import { NumberFormatting } from "../settings";
import { Visual } from "../visual";
import { IChartSettings, IDataColorsSettings, IDataLabelsSettings, IGridLinesSettings, ILegendSettings, ILineSettings, IMarkerSettings, ISortingSettings, IXAxisSettings, IYAxisSettings } from "../visual-settings.interface";

export const ApplyBeforeIBCSAppliedSettingsBack = (self: Visual): void => {
    const beforeIBCSSettings = self.beforeIBCSSettings;

    const markerSettings: IMarkerSettings = beforeIBCSSettings[EVisualSettings.MarkerSettings].configValues;
    const chartSettings: IChartSettings = beforeIBCSSettings[EVisualSettings.ChartSettings].configValues;
    const dataLabelsSettings: IDataLabelsSettings = beforeIBCSSettings[EVisualSettings.DataLabelsSettings].configValues;
    const xAxisSettings: IXAxisSettings = beforeIBCSSettings[EVisualSettings.XAxisSettings].configValues;
    const yAxisSettings: IYAxisSettings = beforeIBCSSettings[EVisualSettings.YAxisSettings].configValues;
    const lineSettings: ILineSettings = beforeIBCSSettings[EVisualSettings.LineSettings].configValues;
    const gridSettings: IGridLinesSettings = beforeIBCSSettings[EVisualSettings.GridLinesSettings].configValues;
    const dataColorsSettings: IDataColorsSettings = beforeIBCSSettings[EVisualSettings.DataColorsSettings].configValues;
    const sortingSettings: ISortingSettings = beforeIBCSSettings[EVisualSettings.Sorting].configValues;
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
        ],
    });
}

export const ApplyIBCSTheme = (self: Visual): void => {
    let beforeIBCSSettings;

    if (!self.chartSettings.prevTheme && self.chartSettings.theme) {
        beforeIBCSSettings = {
            [EVisualSettings.ChartSettings]: { configName: EVisualConfig.ChartConfig, settingName: EVisualSettings.ChartSettings, configValues: self.chartSettings },
            [EVisualSettings.LineSettings]: { configName: EVisualConfig.LineConfig, settingName: EVisualSettings.LineSettings, configValues: self.lineSettings },
            [EVisualSettings.MarkerSettings]: { configName: EVisualConfig.MarkerConfig, settingName: EVisualSettings.MarkerSettings, configValues: self.markerSettings },
            [EVisualSettings.DataColorsSettings]: { configName: EVisualConfig.DataColorsConfig, settingName: EVisualSettings.DataColorsSettings, configValues: self.dataColorsSettings },
            [EVisualSettings.DataLabelsSettings]: { configName: EVisualConfig.DataLabelsConfig, settingName: EVisualSettings.DataLabelsSettings, configValues: self.dataLabelsSettings },
            [EVisualSettings.XAxisSettings]: { configName: EVisualConfig.XAxisConfig, settingName: EVisualSettings.XAxisSettings, configValues: self.xAxisSettings },
            [EVisualSettings.YAxisSettings]: { configName: EVisualConfig.YAxisConfig, settingName: EVisualSettings.YAxisSettings, configValues: self.yAxisSettings },
            [EVisualSettings.Sorting]: { configName: EVisualConfig.SortingConfig, settingName: EVisualSettings.Sorting, configValues: self.sortingSettings },
            [EVisualSettings.GridLinesSettings]: { configName: EVisualConfig.GridLinesConfig, settingName: EVisualSettings.GridLinesSettings, configValues: self.gridSettings },
            [EVisualSettings.Legend]: { configName: undefined, settingName: EVisualSettings.Legend, configValues: self.legendSettings },
            [EVisualSettings.NumberFormatting]: { configName: undefined, settingName: EVisualSettings.NumberFormatting, configValues: self.numberSettings },
        };
    }

    self._host.persistProperties({
        merge: [
            {
                objectName: EVisualConfig.Editor,
                displayName: EVisualSettings.BeforeIBCSSettings,
                properties: {
                    [EVisualSettings.BeforeIBCSSettings]: JSON.stringify(beforeIBCSSettings),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.ChartConfig,
                displayName: EVisualSettings.ChartSettings,
                properties: {
                    [EVisualSettings.ChartSettings]: JSON.stringify({
                        ...self.chartSettings,
                        [EChartSettings.isShowZeroBaseLine]: true,
                        [EChartSettings.orientation]:
                            (self.chartSettings.theme === EIBCSThemes.DefaultHorizontal ||
                                self.chartSettings.theme === EIBCSThemes.Diverging1Horizontal ||
                                self.chartSettings.theme === EIBCSThemes.Diverging2Horizontal) ? Orientation.Horizontal : Orientation.Vertical,
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.LineConfig,
                displayName: EVisualSettings.LineSettings,
                properties: {
                    [EVisualSettings.LineSettings]: JSON.stringify({
                        ...self.lineSettings,
                        [ELineSettings.lineColor]: "rgba(64, 64, 64, 1)",
                        [ELineSettings.lineWidth]: 4,
                        [ELineSettings.lineType]: ELineType.Solid,
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.MarkerConfig,
                displayName: EVisualSettings.MarkerSettings,
                properties: {
                    [EVisualSettings.MarkerSettings]: JSON.stringify({
                        ...self.markerSettings,
                        [EMarkerSettings.MarkerShape]: EMarkerShapeTypes.DEFAULT,
                        [EMarkerSettings.DropdownMarkerType]: EMarkerDefaultShapes.SQUARE,
                        [EMarkerSettings.MarkerSize]: 20,
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.DataColorsConfig,
                displayName: EVisualSettings.DataColorsSettings,
                properties: {
                    [EVisualSettings.DataColorsSettings]: JSON.stringify({
                        ...self.dataColorsSettings,
                        [EDataColorsSettings.FillType]: ((self.chartSettings.theme === EIBCSThemes.Diverging2Horizontal || self.chartSettings.theme === EIBCSThemes.Diverging2Vertical) ? ColorPaletteType.PositiveNegative : ColorPaletteType.Single),
                        [EDataColorsSettings.SingleColor1]: "rgba(64, 64, 64, 1)",
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.DataLabelsConfig,
                displayName: EVisualSettings.DataLabelsSettings,
                properties: {
                    [EVisualSettings.DataLabelsSettings]: JSON.stringify({
                        ...self.dataLabelsSettings,
                        [EDataLabelsSettings.show]: true,
                        [EDataLabelsSettings.showBackground]: true,
                        [EDataLabelsSettings.fontSize]: 12,
                        [EDataLabelsSettings.placement]: DataLabelsPlacement.Outside,
                        [EDataLabelsSettings.color]: "rgba(64, 64, 64, 1)",
                        [EDataLabelsSettings.backgroundColor]: "rgba(255, 255, 255, 1)",
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.XAxisConfig,
                displayName: EVisualSettings.XAxisSettings,
                properties: {
                    [EVisualSettings.XAxisSettings]: JSON.stringify({
                        ...self.xAxisSettings,
                        [EXAxisSettings.LabelColor]: "rgba(64, 64, 64, 1)",
                        [EXAxisSettings.LabelFontSize]: 10,

                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.YAxisConfig,
                displayName: EVisualSettings.YAxisSettings,
                properties: {
                    [EVisualSettings.YAxisSettings]: JSON.stringify({
                        ...self.yAxisSettings,
                        [EYAxisSettings.Show]: false,
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.SortingConfig,
                displayName: EVisualSettings.Sorting,
                properties: {
                    [EVisualSettings.Sorting]: JSON.stringify(SORTING_SETTINGS),
                },
                selector: null,
            },
            {
                objectName: EVisualSettings.Legend,
                properties: {
                    show: false
                },
                selector: null,
            },
            {
                objectName: EVisualSettings.NumberFormatting,
                properties: {
                    [ENumberFormatting.Scaling]: DisplayUnits.Auto,
                    [ENumberFormatting.SemanticFormatting]: true,
                    [ENumberFormatting.NegativeFormat]: SemanticNegativeNumberFormats.MinusX,
                    [ENumberFormatting.PositiveFormat]: SemanticPositiveNumberFormats.PlusX,
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.GridLinesConfig,
                displayName: EVisualSettings.GridLinesSettings,
                properties: {
                    [EVisualSettings.GridLinesSettings]: JSON.stringify({
                        ...self.gridSettings,
                        [EGridLinesSettings.xGridLines]: {
                            ...self.gridSettings.xGridLines,
                            [EGridLinesSettings.show]: false,
                        },
                        [EGridLinesSettings.yGridLines]: {
                            ...self.gridSettings.yGridLines,
                            [EGridLinesSettings.show]: false,
                        },
                    }),
                },
                selector: null,
            },
            {
                objectName: EVisualConfig.IBCSConfig,
                displayName: EVisualSettings.IBCSSettings,
                properties: {
                    [EVisualSettings.IBCSSettings]: JSON.stringify({
                        ...self.chartSettings,
                        [EIBCSSettings.IsIBCSEnabled]: true,
                        [EIBCSSettings.PrevTheme]: self.chartSettings.theme
                    }),
                },
                selector: null,
            }
        ],
    });
}