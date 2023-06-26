"use strict";

import "core-js/stable";
import "./../style/visual.less";
import "regenerator-runtime/runtime";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISelectionId = powerbi.visuals.ISelectionId;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import IColorPalette = powerbi.extensibility.IColorPalette;
import * as d3 from "d3";

import { IChartSubCategory, ILollipopChartRow, TooltipData } from './model';
import { CategoryDataColorProps, CircleFillOption, CircleSize, CircleType, ColorPaletteType, DataLabelsFontSizeType, DataLabelsPlacement, DataRolesName, DisplayUnits, EChartConfig, EDataLabelsSettings, EVisualConfig, FontStyle, ILegendPosition, LegendType, LineType, LollipopDistanceType, LollipopType, Orientation, PieSize, PieType, Position, RankingDataValuesType, RankingFilterType } from './enum';
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { createLegend, positionChartArea } from "powerbi-visuals-utils-chartutils/lib/legend/legend";
import { ILegend, LegendData, LegendDataPoint, LegendPosition } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";
import { Enumeration } from "./Enumeration";
import { paidProperties } from "./PaidProperties";
import { VisualSettings } from "./settings";
import ChartSettings from './settings-pages/ChartSettings';
import DataColorsSettings from './settings-pages/DataColorsSettings';
import CircleSettings from './settings-pages/CircleSettings';
import LineSettings from './settings-pages/LineSettings';
import DataLabelsSettings from './settings-pages/DataLabelsSettings';
import GridLinesSettings from './settings-pages/GridLinesSettings';
import RankingSettings from './settings-pages/RankingSettings';
import { CHART_SETTINGS, CIRCLE_SETTINGS, DATA_COLORS, DATA_LABELS_SETTINGS, GRID_LINES_SETTINGS, LINE_SETTINGS, RANKING_SETTINGS, } from "./constants";
import { IChartSettings, ICirclePropsSettings, ICircleSettings, IDataColorsSettings, IDataLabelsSettings, IGridLinesSettings, ILegendSettings, ILineSettings, INumberSettings, IPiePropsSettings, IPieSettings, IRankingSettings, IXAxisSettings, IXGridLinesSettings, IYAxisSettings, IYGridLinesSettings } from './visual-settings.interface'
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';
import { EChartsOption } from "echarts";

export class Visual extends Shadow {
    private chartContainer: HTMLElement;
    private hostContainer: HTMLElement;
    private visualUpdateOptions: ShadowUpdateOptions;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private legend1: ILegend;
    private legend2: ILegend;
    private colorPalette: IColorPalette;

    // props
    private width: number;
    private height: number;
    private settingsBtnHeight: number = 40;
    private settingsBtnWidth: number = 152;
    private viewPortWidth: number;
    private viewPortHeight: number;
    private margin: { top: number, right: number, bottom: number, left: number };
    private valuesTitle: string;
    private chartData: ILollipopChartRow[];
    private legends1Data: LegendData = { dataPoints: [] };
    private legends2Data: LegendData = { dataPoints: [] };
    private legendViewPort: { width: number, height: number } = { width: 0, height: 0 };
    private isInFocusMode: boolean = false;

    // data
    isChartInit: boolean = false;
    isDumbbellChart: boolean = false;
    settingsPopupOptionsWidth: number;
    settingsPopupOptionsHeight: number;
    categoryDisplayName: string;
    subCategoryDisplayName: string;
    value1DisplayName: string;
    value2DisplayName: string;
    subCategories: { name: string, color1: string, color2: string }[] = [];
    isDisplayLegend2: boolean;
    isHasSubcategories: boolean;
    isHasCategories: boolean;
    isHasValue2: boolean;

    // svg 
    private svg: any;
    private container: any;
    private categoryTitle: string;
    private axisTitleMargin: number;
    private scaleBandWidth: number;
    private computedTextEle: any;
    private gradientColorScale = d3.scaleLinear();

    // brush 
    private brushG: any;
    private brushHeight: number;
    private brushWidth: number;
    private isHorizontalBrushDisplayed: boolean;
    private isLollipopChartDrawn: boolean = false;

    // xAxis
    private xAxisG: any;
    private xScale: any;
    private xScale2: any;
    private xAxisTitleG: any;
    private xAxisTitleText: any;
    private xAxisTitleSize: number;
    private xScaleGHeight: number = 0;
    private xScaleWidth: number;

    // yAxis
    private yAxisG: any;
    private yScale: any;
    private yScale2: any;
    private yAxisTitleText: any;
    private yAxisTitleG: any;
    private yAxisTitleSize: number;
    private yScaleGWidth: number = 200;
    private yScaleHeight: number;

    // line 
    private lineSelection: any;
    private lineG: any;

    // circle1
    private circle1G: any;
    private circle1Selection: any;
    private circle1Radius: any;

    // circle2
    private circle2G: any;
    private circle2Selection: any;
    private circle2Radius: number;

    // data labels
    private dataLabelsSelection: any;
    private dataLabels1G: any;
    private dataLabels2G: any;

    // Grid Lines
    xGridLinesG: any;
    yGridLinesG: any;
    xGridLinesSelection: any;
    yGridLinesSelection: any;

    // pie
    pieG: any;
    pieEmphasizeScaleSize: number = 4;
    pieViewBoxRatio: number = 100 - this.pieEmphasizeScaleSize;
    isRankingSettingsChanged: boolean = false;

    // pie1
    ePie1ChartOptions: EChartsOption;
    pie1Radius: number;

    // pie2
    ePie2ChartOptions: EChartsOption;
    pie2Radius: number;

    //legend
    legend1MarginLeft: number = 0;
    legend2MarginLeft: number = 0;
    legendViewPortWidth: number = 0;
    legendViewPortHeight: number = 0;

    // settings
    isHorizontalChart: boolean = false;
    circleSettings: ICircleSettings;
    circle1Settings: ICirclePropsSettings;
    circle2Settings: ICirclePropsSettings;
    chartSettings: IChartSettings;
    dataLabelsSettings: IDataLabelsSettings;
    xAxisSettings: IXAxisSettings;
    yAxisSettings: IYAxisSettings;
    lineSettings: ILineSettings;
    pieSettings: IPieSettings;
    pie1Settings: IPiePropsSettings;
    pie2Settings: IPiePropsSettings;
    legendSettings: ILegendSettings;
    numberSettings: INumberSettings;
    xGridSettings: IXGridLinesSettings;
    yGridSettings: IYGridLinesSettings;
    gridSettings: IGridLinesSettings;
    dataColorsSettings: IDataColorsSettings;
    rankingSettings: IRankingSettings;

    constructor(options: VisualConstructorOptions) {
        super(options, VisualSettings, {
            landingPage: {
                description: "Test",
                sliderImages: [],
                title: "Test",
                versionInfo: "test",
            },
            valueRole: ["measure"],
            components: [
                {
                    name: "Chart Settings",
                    sectionName: "chartConfig",
                    propertyName: "chartSettings",
                    Component: () => ChartSettings,
                },
                {
                    name: "Data Colors",
                    sectionName: "dataColorsConfig",
                    propertyName: "dataColorsSettings",
                    Component: () => DataColorsSettings,
                },
                {
                    name: "Circle Settings",
                    sectionName: "circleConfig",
                    propertyName: "circleSettings",
                    Component: () => CircleSettings,
                },
                {
                    name: "Line Settings",
                    sectionName: "lineConfig",
                    propertyName: "lineSettings",
                    Component: () => LineSettings,
                },
                {
                    name: "Data Labels",
                    sectionName: "dataLabelsConfig",
                    propertyName: "dataLabelsSettings",
                    Component: () => DataLabelsSettings,
                },
                {
                    name: "Grid Lines",
                    sectionName: "gridLinesConfig",
                    propertyName: "gridLinesSettings",
                    Component: () => GridLinesSettings,
                },
                {
                    name: "Ranking",
                    sectionName: "rankingConfig",
                    propertyName: "rankingSettings",
                    Component: () => RankingSettings,
                },
            ]
        });
        this.init(this.afterUpdate, this.getEnumeration, paidProperties);
        this.chartContainer = this.getVisualContainer();
        this.hostContainer = d3.select(this.chartContainer).node().parentElement;
        this.colorPalette = options.host.colorPalette;
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
        this.initChart();
    }

    public getEnumeration(): EnumerateSectionType[] {
        return Enumeration.GET();
    }

    public initChart(): void {
        this.axisTitleMargin = 10;
        this.brushWidth = 10;
        this.brushHeight = 10;
        this.margin = { top: 10, right: 30, bottom: 100 + this.axisTitleMargin, left: 60 + this.axisTitleMargin };

        this.svg = d3.select(this.chartContainer)
            .append('svg')
            .classed('lollipopChart', true);

        this.brushG = this.svg
            .append('g')
            .attr('class', 'brush');

        this.container = this.svg.append("g")
            .classed('container', true);

        this.xGridLinesG = this.container.append('g')
            .classed('xGridLinesG', true);

        this.yGridLinesG = this.container.append('g')
            .classed('yGridLinesG', true);

        this.lineG = this.container.append("g")
            .classed('lineG', true);

        this.circle1G = this.container.append("g")
            .classed('circle1G', true);

        this.circle2G = this.container.append("g")
            .classed('circle2G', true);

        this.pieG = this.container.append("g")
            .classed('pieG', true);

        this.xAxisG = this.container.append("g")
            .classed('xAxisG', true);

        this.yAxisG = this.container.append("g")
            .classed('yAxisG', true);

        this.xAxisTitleG = this.container.append('g')
            .classed('xAxisTitleG', true);

        this.xAxisTitleText = this.xAxisTitleG.append('text')
            .classed('xAxisTitle', true)
            .attr('text-anchor', 'middle');

        this.yAxisTitleG = this.container.append('g')
            .classed('yAxisTitleG', true);

        this.yAxisTitleText = this.yAxisTitleG.append('text')
            .classed('yAxisTitle', true)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle');

        this.dataLabels1G = this.container.append('g')
            .classed('dataLabels1G', true);

        this.dataLabels2G = this.container.append('g')
            .classed('dataLabels2G', true);

        this.computedTextEle = this.container.append('g').append('text');

        echarts.use(
            [PieChart, SVGRenderer]
        );

        this.isChartInit = true;
    }

    public afterUpdate(vizOptions: ShadowUpdateOptions) {
        if (this.handleValidation(vizOptions)) {
            this.isChartInit = false;
            return;
        } else if (!this.isChartInit) {
            this.initChart();
        };

        this.visualUpdateOptions = vizOptions;
        this.isInFocusMode = vizOptions.options.isInFocus;
        this.setChartData();
        this.setVisualSettings();

        const popupOptions = document.querySelector('.popup-options');
        this.settingsPopupOptionsWidth = popupOptions ? popupOptions.clientWidth : 0;
        this.settingsPopupOptionsHeight = popupOptions ? popupOptions.clientHeight : 0;
        this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0;
        this.xAxisTitleSize = this.getTextSize(this.xAxisSettings.titleFontSize, this.xAxisSettings.isDisplayTitle);
        this.yAxisTitleSize = this.getTextSize(this.yAxisSettings.titleFontSize, this.yAxisSettings.isDisplayTitle);
        this.isDumbbellChart = this.isHasValue2;
        this.isDisplayLegend2 = this.isDumbbellChart && this.chartSettings.lollipopType !== LollipopType.Circle;

        this.setVisualOptionsColor();
        this.setColorsByDataColorsSettings();

        if (this.rankingSettings.isRankingEnabled) {
            this.setRemainingAsOthersDataColor();
        }

        if (!this.legend1) {
            this.createLegendContainer(LegendType.Legend1);
        }

        if (!this.legend2) {
            this.createLegendContainer(LegendType.Legend2);
        }

        if (this.legendSettings.show &&
            (this.chartSettings.lollipopType !== LollipopType.Circle || this.isHasValue2)) {
            this.setLegendsData();
            this.renderLegends();
        } else {
            this.removeLegend(LegendType.Legend1);
            this.removeLegend(LegendType.Legend2);
        }

        this.setMargins();
        this.setChartWidthHeight();

        this.svg
            .attr('width', vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
            .attr('height', vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height);

        this.container
            .attr('transform',
                'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.drawXYAxis();
        this.displayBrush();
        this.drawLollipopChart();
        this.displayBrush();
        this.drawTooltip();
    }

    setMargins(): void {
        if (this.xAxisSettings.position === Position.Bottom) {
            this.margin.bottom = this.xScaleGHeight +
                this.xAxisTitleSize + this.axisTitleMargin + this.brushHeight;
            this.margin.top = 0;
        } else if (this.xAxisSettings.position === Position.Top) {
            this.margin.bottom = this.brushHeight;
            this.margin.top = this.xScaleGHeight + this.xAxisTitleSize + this.axisTitleMargin;
        }

        if (this.yAxisSettings.position === Position.Left) {
            this.margin.left = this.yScaleGWidth + this.yAxisTitleSize + this.axisTitleMargin;
            this.margin.right = this.brushWidth;
        } else if (this.yAxisSettings.position === Position.Right) {
            this.margin.left = this.axisTitleMargin;
            this.margin.right = this.yScaleGWidth + this.yAxisTitleSize + this.axisTitleMargin + this.brushWidth;
        }
        this.setChartWidthHeight();
    }

    getTextSize(fontSize: number, isDisplay: boolean): number {
        let textSize: number;
        const textEle = this.svg
            .append('text')
            .attr('opacity', '0')
            .attr('font-size', fontSize)
            .attr('display', isDisplay ? 'block' : 'none')
            .text('text')
            .attr('', function () {
                textSize = this.getBBox().height;
            });
        textEle.remove();
        return textSize;
    }

    setChartData(): void {
        const categorical = this.visualUpdateOptions.options.dataViews[0].categorical;
        const uniqueCategories = categorical.categories[0].values.filter((item, i, ar) => ar.indexOf(item) === i);
        const tooltipFieldsStartIndex = this.getCategoricalValuesIndexByKey(DataRolesName.Tooltips);
        const tooltipFields = [];

        this.isDumbbellChart = this.getCategoricalValuesIndexByKey(DataRolesName.Value2) !== -1;
        this.categoryDisplayName = categorical.categories[0]?.source.displayName;
        this.subCategoryDisplayName = categorical.categories[1]?.source.displayName;
        this.value1DisplayName = categorical.values[0]?.source.displayName;
        this.value2DisplayName = categorical.values[1]?.source.displayName;
        this.isHasSubcategories = this.getCategoricalCategoriesIndexByKey(DataRolesName.SubCategory) !== -1;
        this.isHasCategories = this.getCategoricalCategoriesIndexByKey(DataRolesName.Category) !== -1;
        this.isHasValue2 = this.getCategoricalValuesIndexByKey(DataRolesName.Value2) !== -1;

        if (categorical.categories[1]) {
            this.subCategories = categorical.categories[1].values.map(value => ({ name: value.toString(), color1: '', color2: '' }));
        }

        if (tooltipFieldsStartIndex >= 0) {
            const tooltipFieldsData = categorical.values.slice(tooltipFieldsStartIndex, categorical.values.length);
            categorical.categories[0].values.forEach((val, i: number) => {
                const arr = [];
                tooltipFieldsData.forEach((data) => {
                    const obj = { displayName: data.source.displayName, value: data.values[i] };
                    arr.push(obj);
                })
                tooltipFields.push(arr);
            });
        }

        const getSubCategoriesByCategory = (categoryName: string): any => {
            const subCategories = categorical.categories[1]?.values.reduce((arr, cat, i): any[] => {
                if (categorical.categories[0].values[i] === categoryName) {
                    const category = {
                        category: cat,
                        value1: categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value1)]?.values[i],
                        value2: categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value2)]?.values[i],
                        styles: { pie1: { color: '' }, pie2: { color: '' } },
                        tooltipFields: tooltipFields[i] ?? []
                    }
                    arr.push(category);
                }
                return arr;
            }, []);
            return subCategories;
        }

        const data: ILollipopChartRow[] = uniqueCategories.map(
            (cat, idx) => (
                {
                    city: <string>cat,
                    value1: <number>categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value1)]?.values[idx],
                    value2: <number>categorical.values[this.getCategoricalValuesIndexByKey(DataRolesName.Value2)]?.values[idx],
                    tooltipFields: tooltipFields[idx] ?? [],
                    subCategories: categorical.categories[1] ? getSubCategoriesByCategory(<string>cat) : [],
                    styles: { circle1: { fillColor: '', strokeColor: '' }, circle2: { fillColor: '', strokeColor: '' }, line: { color: '' } }
                }
            )
        );

        data.forEach(d => {
            if (d.subCategories.length) {
                d.value1 = d3.sum(d.subCategories, cat => cat.value1);
                d.value2 = d3.sum(d.subCategories, cat => cat.value2);
            }
        });

        const category = categorical.categories[0];
        data.forEach((d, i) => {
            const selectionId: ISelectionId = this.visualUpdateOptions.host.createSelectionIdBuilder()
                .withCategory(category, i)
                .createSelectionId();
            d.selectionId = selectionId;
        });

        data.forEach((d, i) => {
            d.subCategories.forEach(subCategory => {
                const selectionId: ISelectionId = this.visualUpdateOptions.host.createSelectionIdBuilder()
                    .withCategory(category, i)
                    .createSelectionId();
                subCategory.selectionId = selectionId;
            })
        })

        this.categoryTitle = categorical.categories[0].source.displayName;
        this.valuesTitle = this.isDumbbellChart ?
            categorical.values.map(v => v.source.displayName).join(', ') :
            categorical.values[0].source.displayName;
        this.chartData = data;
    }

    private createLegendContainer(legendType: LegendType): void {
        this[legendType] = createLegend(this.hostContainer, false, null, true, LegendPosition[this.legendSettings.position] ?? LegendPosition.Top);
    }

    setVisualSettings(): void {
        const formatTab = this.visualUpdateOptions.formatTab;

        const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EChartConfig.ChartSettings]);
        this.chartSettings = {
            ...CHART_SETTINGS,
            ...chartConfig,
        };
        this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;

        const circleConfig = JSON.parse(formatTab[EVisualConfig.CircleConfig][EChartConfig.CircleSettings]);
        this.circleSettings = {
            ...CIRCLE_SETTINGS,
            ...circleConfig,
        };

        this.circle1Settings = this.circleSettings.circle1;
        this.circle2Settings = this.circleSettings.circle2;

        const lineConfig = JSON.parse(formatTab[EVisualConfig.LineConfig][EChartConfig.LineSettings]);
        this.lineSettings = {
            ...LINE_SETTINGS,
            ...lineConfig,
        };

        const clonedDataLabelsSettings = JSON.parse(JSON.stringify(this.dataLabelsSettings ?? {}));
        const dataLabelsConfig = JSON.parse(formatTab[EVisualConfig.DataLabelsConfig][EChartConfig.DataLabelsSettings]);
        this.dataLabelsSettings = {
            ...DATA_LABELS_SETTINGS,
            ...dataLabelsConfig,
        };

        this.legendSettings = formatTab[EChartConfig.LegendSettings];
        this.numberSettings = formatTab[EChartConfig.NumberSettings];
        this.xAxisSettings = formatTab[EChartConfig.XAxisSettings];
        this.yAxisSettings = formatTab[EChartConfig.YAxisSettings];

        const gridLinesConfig = JSON.parse(formatTab[EVisualConfig.GridLinesConfig][EChartConfig.GridLinesSettings]);
        this.gridSettings = {
            ...GRID_LINES_SETTINGS,
            ...gridLinesConfig,
        };

        this.xGridSettings = this.gridSettings.xGridLines;
        this.yGridSettings = this.gridSettings.yGridLines;

        this.pie1Settings = this.chartSettings.pieSettings.pie1;
        this.pie2Settings = this.chartSettings.pieSettings.pie2;

        // Data Colors Settings
        // if (this.chartSettings.lollipopType === LollipopType.Circle) {
        //     DATA_COLORS.dataType = CircleType.Circle1;
        // } else {
        //     DATA_COLORS.dataType = PieType.Pie1;
        // }

        if (this.isDumbbellChart) {
            DATA_COLORS.circle1.fillType = ColorPaletteType.Single;
            DATA_COLORS.circle2.fillType = ColorPaletteType.Single;
        }

        const dataColorsConfig = JSON.parse(formatTab[EVisualConfig.DataColorsConfig][EChartConfig.DataColorsSettings]);
        this.dataColorsSettings = {
            ...DATA_COLORS,
            ...dataColorsConfig,
        };

        const clonedRankingSettings = JSON.parse(JSON.stringify(this.rankingSettings ?? {}));
        const rankingConfig = JSON.parse(formatTab[EVisualConfig.RankingConfig][EChartConfig.RankingSettings]);
        this.rankingSettings = {
            ...RANKING_SETTINGS,
            ...rankingConfig,
        };
        this.isRankingSettingsChanged = JSON.stringify(clonedRankingSettings) !== JSON.stringify(this.rankingSettings);

        if (!this.isHasSubcategories) {
            this.chartSettings.lollipopType = LollipopType.Circle;
            CHART_SETTINGS.isLollipopTypeChanged = false;
            this.chartSettings.isLollipopTypeChanged = false;
            const chartConfig: IChartSettings = { ...this.chartSettings, lollipopType: LollipopType.Circle, isLollipopTypeChanged: false };
            formatTab[EVisualConfig.ChartConfig][EChartConfig.ChartSettings] = JSON.stringify(chartConfig);
            const dataColorsConfig: IDataColorsSettings = { ...this.dataColorsSettings, dataType: CircleType.Circle1 };
            formatTab[EVisualConfig.DataColorsConfig][EChartConfig.DataColorsSettings] = JSON.stringify(dataColorsConfig);
        } else {
            if (!this.chartSettings.isLollipopTypeChanged) {
                this.chartSettings.lollipopType = LollipopType.Donut;
                const chartConfig: IChartSettings = { ...this.chartSettings, lollipopType: LollipopType.Donut };
                formatTab[EVisualConfig.ChartConfig][EChartConfig.ChartSettings] = JSON.stringify(chartConfig);
                const dataColorsConfig: IDataColorsSettings = { ...this.dataColorsSettings, dataType: PieType.Pie1 };
                formatTab[EVisualConfig.DataColorsConfig][EChartConfig.DataColorsSettings] = JSON.stringify(dataColorsConfig);
            }
        }

        if (
            !Object.keys(clonedDataLabelsSettings).length ||
            (this.chartSettings.lollipopType !== LollipopType.Circle)
        ) {
            const color = this.dataLabelsSettings.color;
            if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
                this.dataLabelsSettings.color = "rgb(102,102,102)";
            }
        }

        if (!this.isDumbbellChart) {
            this.chartData.sort((a, b) => this.isHorizontalChart ? a.value1 - b.value1 : b.value1 - a.value1);
        }
        if (this.isDumbbellChart) {
            this.chartData.sort((a, b) => this.isHorizontalChart ? (a.value1 + a.value2) - (b.value1 + b.value2) :
                (b.value1 + b.value2) - (a.value1 + a.value2));
        }

        if (this.rankingSettings.isRankingEnabled) {
            this.setChartDataByRanking();
        }
    }

    setChartDataByRanking(): void {
        const rankingSettings = this.rankingSettings[this.isDumbbellChart ? this.rankingSettings.valueType : RankingDataValuesType.Value1];

        if (!rankingSettings.showRemainingAsOthers) {
            if (rankingSettings.filterType === RankingFilterType.TopN) {
                this.chartData = this.chartData.slice(0, rankingSettings.count);
            }
            if (rankingSettings.filterType === RankingFilterType.BottomN) {
                if (rankingSettings.count <= this.chartData.length) {
                    this.chartData = this.chartData.slice(this.chartData.length - rankingSettings.count, this.chartData.length);
                }
            }
        }

        if (this.chartSettings.lollipopType !== LollipopType.Circle && rankingSettings.isSubcategoriesRanking) {
            const valueType = this.rankingSettings.valueType === RankingDataValuesType.Value1 ? RankingDataValuesType.Value1 : RankingDataValuesType.Value2;
            this.chartData.forEach(data => {
                data.subCategories.sort((a, b) => b[valueType] - a[valueType]);
            })

            if (!rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
                if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
                    this.chartData.forEach(data => {
                        data.subCategories = data.subCategories.slice(0, rankingSettings.subCategoriesRanking.count)
                    });
                }

                if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
                    this.chartData.forEach(data => {
                        if (rankingSettings.subCategoriesRanking.count <= data.subCategories.length) {
                            data.subCategories = data.subCategories.slice(data.subCategories.length - rankingSettings.subCategoriesRanking.count, data.subCategories.length);
                        }
                    })
                }
            }
        }

        if (this.rankingSettings.isRankingEnabled) {
            const subCategories = [];
            this.subCategories = [];
            this.chartData.forEach(data => {
                data.subCategories.forEach(sub => {
                    const isAlreadyHasCategory = this.subCategories.some(d => d.name === sub.category);
                    if (!isAlreadyHasCategory) {
                        subCategories.push({ name: sub.category, color1: '', color2: '' })
                    }
                })
            })
            this.subCategories = subCategories;
        }
    }

    setRemainingAsOthersDataColor(): void {
        const rankingSettings = this.rankingSettings[this.isDumbbellChart ? this.rankingSettings.valueType : RankingDataValuesType.Value1];
        const subCategoriesRanking = rankingSettings.subCategoriesRanking;

        if (rankingSettings.showRemainingAsOthers) {
            if (rankingSettings.filterType === RankingFilterType.TopN) {
                this.chartData.forEach((d, i) => {
                    if (i + 1 > rankingSettings.count) {
                        d.styles.circle1.fillColor = rankingSettings.circleFillColor;
                        d.styles.circle1.strokeColor = rankingSettings.circleStrokeColor;
                        d.styles.circle2.fillColor = rankingSettings.circleFillColor;
                        d.styles.circle2.strokeColor = rankingSettings.circleStrokeColor;
                        d.styles.line.color = rankingSettings.lineColor;

                        d.subCategories.forEach(s => {
                            s.styles.pie1.color = rankingSettings.pieSliceColor;
                            s.styles.pie2.color = rankingSettings.pieSliceColor;
                        })
                    }
                })
            }

            if (rankingSettings.filterType === RankingFilterType.BottomN) {
                if (rankingSettings.count <= this.chartData.length) {
                    this.chartData.forEach((d, i) => {
                        if (i < this.chartData.length - rankingSettings.count) {
                            d.styles.circle1.fillColor = rankingSettings.circleFillColor;
                            d.styles.circle1.strokeColor = rankingSettings.circleStrokeColor;
                            d.styles.circle2.fillColor = rankingSettings.circleFillColor;
                            d.styles.circle2.strokeColor = rankingSettings.circleStrokeColor;
                            d.styles.line.color = rankingSettings.lineColor;

                            d.subCategories.forEach(s => {
                                s.styles.pie1.color = rankingSettings.pieSliceColor;
                                s.styles.pie2.color = rankingSettings.pieSliceColor;
                            })
                        }
                    })
                }
            }
        }

        if (rankingSettings.isSubcategoriesRanking && subCategoriesRanking.showRemainingAsOthers) {
            if (this.chartSettings.lollipopType !== LollipopType.Circle) {
                if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
                    this.chartData.forEach((data, i1) => {
                        if (i1 + 1 <= rankingSettings.count) {
                            data.subCategories.forEach((d, i2) => {
                                if (i2 + 1 > subCategoriesRanking.count) {
                                    d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
                                    d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
                                }
                            })
                        }
                    });
                }

                if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
                    this.chartData.forEach((data, i1) => {
                        if (i1 > this.chartData.length - rankingSettings.count) {
                            data.subCategories.forEach((d, i2) => {
                                if (i2 < data.subCategories.length - subCategoriesRanking.count) {
                                    d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
                                    d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
                                }
                            })
                        }
                    });
                }
            }
        }

        this.setSubCategoriesColor(LegendType.Legend1);
        if (this.isDisplayLegend2) {
            this.setSubCategoriesColor(LegendType.Legend2);
        }
    }

    setColorsByDataColorsSettings(): void {
        this.setLineColors();
        if (this.chartSettings.lollipopType === LollipopType.Circle) {
            this.setCircleColors();
        } else {
            this.setPieColors(PieType.Pie1);
            if (this.isDumbbellChart) {
                this.setPieColors(PieType.Pie2);
            }
        }
        this.setSubCategoriesColor(LegendType.Legend1);
        if (this.isDisplayLegend2) {
            this.setSubCategoriesColor(LegendType.Legend2);
        }
    }

    setLineColors(): void {
        this.chartData.forEach(data => {
            data.styles.line.color = this.lineSettings.lineColor;
        });
    }

    setCircleColors(): void {
        const colorsSettings = this.dataColorsSettings.circle1;

        if (this.isDumbbellChart) {
            const circle1Colors = this.dataColorsSettings.circle1;
            const circle2Colors = this.dataColorsSettings.circle2;
            this.chartData.forEach(data => {
                data.styles.circle1.fillColor = circle1Colors.circleFillColor;
                data.styles.circle1.strokeColor = circle1Colors.circleStrokeColor;
                data.styles.circle2.fillColor = circle2Colors.circleFillColor;
                data.styles.circle2.strokeColor = circle2Colors.circleStrokeColor;
            });
            return;
        }

        // Circle 1 Colors
        switch (this.dataColorsSettings.circle1.fillType) {
            case ColorPaletteType.Single: {
                this.chartData.forEach(data => {
                    data.styles.circle1.fillColor = colorsSettings.circleFillColor;
                    data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
                });
                break;
            }
            case ColorPaletteType.PowerBi: {
                this.chartData.forEach(data => {
                    // let colorCode = this.colorPalette.getColor(data.city).value.split('#')[1];
                    // const circleFillColor = '#F2' + colorCode;
                    data.styles.circle1.fillColor = this.colorPalette.getColor(data.city).value;
                    data.styles.circle1.strokeColor = this.colorPalette.getColor(data.city).value;
                });
                break;
            }
            case ColorPaletteType.Gradient: {
                const categoryDataLength = this.chartData.length;
                const domain = colorsSettings.midcolor && categoryDataLength > 2 ? [1, Math.round(categoryDataLength / 2), categoryDataLength] : [1, categoryDataLength];
                const range: any = colorsSettings.midcolor && categoryDataLength > 2 ? [colorsSettings.fillmax, colorsSettings.fillmid, colorsSettings.fillmin] : [colorsSettings.fillmax, colorsSettings.fillmin];

                this.gradientColorScale.domain(domain).range(range);
                this.chartData.forEach((data, i) => {
                    const color: string = this.gradientColorScale(i + 1) + '';
                    data.styles.circle1.fillColor = color;
                    data.styles.circle1.strokeColor = color;
                });
                break;
            }
            case ColorPaletteType.ByCategory: {
                break;
            }
            case ColorPaletteType.Sequential: {
                const colorsSettings = this.dataColorsSettings.circle1;
                this.setCircleSchemaColors(colorsSettings.schemeColors.reverse(), colorsSettings.reverse, colorsSettings.isGradient);
                break;
            }
            case ColorPaletteType.Diverging: {
                const colorsSettings = this.dataColorsSettings.circle1;
                this.setCircleSchemaColors(colorsSettings.schemeColors, colorsSettings.reverse, colorsSettings.isGradient);
                break;
            }
            case ColorPaletteType.Qualitative: {
                const colorsSettings = this.dataColorsSettings.circle1;
                this.setCircleSchemaColors(colorsSettings.schemeColors, colorsSettings.reverse, false);
                break;
            }
        }
    }

    setPieColors(pieType: PieType): void {
        const pieColors = this.dataColorsSettings[pieType];
        switch (this.dataColorsSettings[pieType].fillType) {
            case ColorPaletteType.Single: {
                this.chartData.forEach(data => {
                    // data.styles.circle1.fillColor = colorsSettings.circleFillColor;
                    // data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
                    data.subCategories.forEach(d => {
                        d.styles[pieType].color = pieColors.singleColor;
                    })
                });
                break;
            }
            case ColorPaletteType.PowerBi: {
                this.chartData.forEach(data => {
                    data.subCategories.forEach(d => {
                        d.styles[pieType].color = this.colorPalette.getColor(d.category).value;
                    })
                });
                break;
            }
            case ColorPaletteType.Gradient: {
                this.chartData.forEach(data => {
                    const subCategoryDataLength = data.subCategories.length;
                    const range: any = pieColors.midcolor && subCategoryDataLength > 2 ? [pieColors.fillmax, pieColors.fillmid, pieColors.fillmin] : [pieColors.fillmax, pieColors.fillmin];
                    const domain = pieColors.midcolor && subCategoryDataLength > 2 ? [1, Math.round(subCategoryDataLength / 2), subCategoryDataLength] : [1, subCategoryDataLength];
                    this.gradientColorScale.domain(domain).range(range);
                    data.subCategories.forEach((d, i) => {
                        const color: string = this.gradientColorScale(i + 1) + '';
                        d.styles[pieType].color = color;
                    })
                });
                break;
            }
            case ColorPaletteType.ByCategory: {
                this.chartData.forEach(data => {
                    data.subCategories.forEach(d => {
                        const selectedCategoryName = pieColors.selectedCategoryName;
                        d.styles[pieType].color = d.category === selectedCategoryName ? pieColors.selectedCategoryColor : pieColors.defaultColor;
                    })
                });
                break;
            }
            case ColorPaletteType.Sequential: {
                const colorsSettings = this.dataColorsSettings[pieType];
                this.setPieSchemaColors(pieType, colorsSettings.schemeColors.reverse(), colorsSettings.reverse, colorsSettings.isGradient);
                break;
            }
            case ColorPaletteType.Diverging: {
                const colorsSettings = this.dataColorsSettings[pieType];
                this.setPieSchemaColors(pieType, colorsSettings.schemeColors, colorsSettings.reverse, colorsSettings.isGradient);
                break;
            }
            case ColorPaletteType.Qualitative: {
                const colorsSettings = this.dataColorsSettings[pieType];
                this.setPieSchemaColors(pieType, colorsSettings.schemeColors, colorsSettings.reverse, false);
                break;
            }
        }
    }

    setSubCategoriesColor(legendType: LegendType): void {
        const isLegend2 = legendType === LegendType.Legend2;
        const getSubCategoryColorByName = (subCategoryName: string): string => {
            let subCategory: IChartSubCategory;
            this.chartData.forEach(data => {
                data.subCategories.find(d => {
                    if (d.category === subCategoryName) {
                        subCategory = d;
                    }
                })
            })
            return subCategory ? subCategory.styles[isLegend2 ? PieType.Pie2 : PieType.Pie1].color : '#545454';
        }

        this.subCategories.forEach(cat => {
            cat[isLegend2 ? 'color2' : 'color1'] = getSubCategoryColorByName(cat.name);
        });
    }

    setCircleSchemaColors(schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
        if (isReverse) {
            schemeColors = schemeColors.reverse();
        }

        if (isGradient) {
            const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];
            const domain = [1, this.chartData.length]
            this.gradientColorScale.domain(domain).range(range);
        }

        let colorIdx = -1;
        this.chartData.forEach((data, i) => {
            colorIdx++;
            if (colorIdx >= schemeColors.length) {
                colorIdx = 0;
            }
            if (isGradient) {
                const color = this.gradientColorScale(i + 1) + '';
                data.styles.circle1.fillColor = color;
                data.styles.circle1.strokeColor = color;
            } else {
                data.styles.circle1.fillColor = schemeColors[colorIdx];
                data.styles.circle1.strokeColor = schemeColors[colorIdx];;
            }
        });
    }

    setPieSchemaColors(pieType: PieType, schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
        if (isReverse) {
            schemeColors = schemeColors.reverse();
        }
        const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];

        this.chartData.forEach(data => {
            let colorIdx = -1;
            if (isGradient) {
                const domain = [1, data.subCategories.length];
                this.gradientColorScale.domain(domain).range(range);
            }

            data.subCategories.forEach((d, i) => {
                colorIdx++;
                if (colorIdx >= schemeColors.length) {
                    colorIdx = 0;
                }
                if (isGradient) {
                    const color = this.gradientColorScale(i + 1) + '';
                    d.styles[pieType].color = color;
                } else {
                    d.styles[pieType].color = schemeColors[colorIdx];
                }
            })
        });
    }

    setVisualOptionsColor(): void {
        this.xAxisSettings.labelColor = this.xAxisSettings.labelColor ?? '#666666';
        this.xAxisSettings.titleColor = this.xAxisSettings.titleColor ?? '#000';
        this.yAxisSettings.labelColor = this.yAxisSettings.labelColor ?? '#666666';
        this.yAxisSettings.titleColor = this.yAxisSettings.titleColor ?? '#000';
        this.legendSettings.labelColor = this.legendSettings.labelColor ?? '#000';
        this.legendSettings.titleColor = this.legendSettings.titleColor ?? '#000';
    }

    setChartWidthHeight(): void {
        const options = this.visualUpdateOptions;
        this.viewPortWidth = options.options.viewport.width;
        this.viewPortHeight = options.options.viewport.height;
        this.width = this.viewPortWidth - this.margin.left - this.margin.right - this.settingsBtnWidth - this.legendViewPort.width;
        this.height = this.viewPortHeight - this.margin.bottom - this.margin.top - this.settingsBtnHeight - this.legendViewPort.height;
    }

    displayBrush(): void {
        if (this.isHorizontalChart) {
            const newHeight = (this.chartSettings.lollipopDistance * this.height / this.scaleBandWidth);
            if (this.height < newHeight) {
                this.drawVerticalBrush();
            } else {
                this.brushG.selectAll('*').remove();
            }
        } else {
            const newWidth = (this.chartSettings.lollipopDistance * this.xScaleWidth / this.scaleBandWidth);
            if (this.width < newWidth) {
                this.isHorizontalBrushDisplayed = true;
                this.drawHorizontalBrush();
            } else {
                this.isHorizontalBrushDisplayed = false;
                this.brushG.selectAll('*').remove();
            }
        }
    }

    drawVerticalBrush(): void {
        const newRageHeight = (this.chartSettings.lollipopDistance * this.height / this.scaleBandWidth);
        const yScaleDomain = this.yScale2.domain();
        const minPos = this.yScale(yScaleDomain[this.xAxisSettings.position === Position.Bottom ? yScaleDomain.length - 1 : 0]);

        const brushed = ({ selection }) => {
            var newInput = [];
            var brushArea = selection;
            if (brushArea === null) brushArea = this.yScale.range();

            yScaleDomain.forEach((d) => {
                const pos = this.yScale2(d) + this.yScale2.bandwidth() / 2;
                if (pos >= brushArea[0] && pos <= brushArea[1]) {
                    newInput.push(d);
                }
            });

            this.yScale.domain(newInput);

            if (this.isLollipopChartDrawn) {
                this.lineSelection
                    .attr('y1', (d) => this.yScale(d.city))
                    .attr('y2', (d) => this.yScale(d.city))
                    .attr('opacity', (d) => {
                        return this.yScale(d.city) ? 1 : 0;
                    });

                this.circle1Selection
                    .attr('cy', (d) => this.yScale(this.isHorizontalChart ? d.city : d.value1))
                    .attr('opacity', (d) => {
                        return this.yScale(d.city) ? 1 : 0;
                    });

                this.circle2Selection
                    .attr('cy', (d) => this.yScale(this.isHorizontalChart ? d.city : d.value1))
                    .attr('opacity', (d) => {
                        return this.yScale(d.city) ? 1 : 0;
                    });

                this.yGridLinesSelection
                    .attr('y1', d => this.yScale(d))
                    .attr('y2', d => this.yScale(d))

                if (this.yAxisSettings.position === Position.Left) {
                    this.yAxisG
                        .attr('transform', `translate(0, 0)`)
                        .call(d3.axisLeft(this.yScale));
                } else if (this.yAxisSettings.position === Position.Right) {
                    this.yAxisG
                        .attr('transform', `translate(${this.width}, 0)`)
                        .call(d3.axisRight(this.yScale));
                }

                this.setYAxisTickStyle();
                this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
                if (this.isDumbbellChart) {
                    this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
                }

                this.updatePiePositionOnBrushMove();
            }
        }

        const brush = d3.brushY()
            .extent([[0, 0], [this.brushWidth - 2, this.height]])
            .on("brush", brushed)

        const scrollBrushHeight = this.height - (newRageHeight - this.height);
        const expectedLollipop = Math.ceil(this.height / this.chartSettings.lollipopDistance);
        const totalLollipop = this.chartData.length;
        const heightByExpectedLollipop = expectedLollipop * this.height / totalLollipop;

        this.brushG
            .attr('transform', `translate(${this.viewPortWidth - this.brushWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width}, ${this.margin.top})`)
            .call(brush)
            .call(brush.move, [0, heightByExpectedLollipop]);

        this.brushG.selectAll('rect')
            .attr('width', this.brushWidth - 2)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('cursor', 'default');
        this.brushG.selectAll('.handle').remove();
    }

    drawHorizontalBrush(): void {
        const newWidth = (this.chartSettings.lollipopDistance * this.width / this.scaleBandWidth);
        const xScaleDomain = this.xScale2.domain();
        const minPos = this.xScale(xScaleDomain[this.yAxisSettings.position === Position.Left ? 0 : xScaleDomain.length - 1]);
        const brushed = ({ selection }) => {
            const newInput = [];
            let brushArea = selection;
            if (brushArea === null) brushArea = this.xScale.range();

            xScaleDomain.forEach((d) => {
                var pos = this.xScale2(d) + this.xScale2.bandwidth() / 2;
                if (pos >= brushArea[0] && pos <= brushArea[1]) {
                    newInput.push(d);
                }
            });

            this.xScale.domain(newInput);

            if (this.isLollipopChartDrawn) {
                this.lineSelection
                    .attr('x1', (d, i) => {
                        return this.xScale(d.city);
                    })
                    .attr('x2', (d) => {
                        return this.xScale(d.city);
                    })
                    .attr('opacity', (d) => {
                        return this.xScale(d.city) ? 1 : 0;
                    });

                this.circle1Selection
                    .attr('cx', (d) => {
                        return this.xScale(d.city) ?? 0;
                    })
                    .attr('opacity', (d) => {
                        return this.xScale(d.city) ? 1 : 0;
                    });

                this.circle2Selection
                    .attr('cx', (d) => {
                        return this.xScale(d.city) ?? 0;
                    })
                    .attr('opacity', (d) => {
                        return this.xScale(d.city) ? 1 : 0;
                    });

                this.xGridLinesSelection
                    .attr('x1', d => this.xScale(d))
                    .attr('x2', d => this.xScale(d))

                if (this.xAxisSettings.position === Position.Bottom) {
                    this.xAxisG
                        .attr('transform', 'translate(0,' + this.height + ')')
                        .call(d3.axisBottom(this.xScale))
                        .selectAll('text')
                        .attr('transform', `translate(-10, 10)rotate(-${this.xAxisSettings.labelTilt})`)

                } else if (this.xAxisSettings.position === Position.Top) {
                    this.xAxisG
                        .attr('transform', 'translate(0,' + 0 + ')')
                        .call(d3.axisTop(this.xScale))
                        .selectAll('text')
                        .attr('transform', `translate(-10, -10)rotate(${this.xAxisSettings.labelTilt})`)
                }

                this.setXAxisTickStyle();
                this.drawData1Labels(this.chartData);
                if (this.isDumbbellChart) {
                    this.drawData2Labels(this.chartData);
                }
                this.updatePiePositionOnBrushMove();
            }
        }

        const brush = d3.brushX()
            .extent([[0, 0], [this.width, this.brushHeight - 2]])
            .on('brush', brushed)

        const expectedLollipop = Math.ceil(this.width / this.chartSettings.lollipopDistance);
        const totalLollipop = this.chartData.length;
        const widthByExpectedLollipop = expectedLollipop * this.width / totalLollipop;

        this.brushG
            .attr('transform', `translate(${this.margin.left}, ${this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - this.legendViewPort.height})`)
            .call(brush)
            .call(brush.move, [0, widthByExpectedLollipop]);

        this.brushG.selectAll('rect')
            .attr('height', this.brushHeight - 2)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('cursor', 'default');
        this.brushG.selectAll('.handle').remove();
    }

    updatePiePositionOnBrushMove(): void {
        if (this.chartSettings.lollipopType !== LollipopType.Circle) {
            const pie1ViewBoxRadius = this.pie1Radius + this.pie1Radius * (this.pieEmphasizeScaleSize * 2) / 100;
            const pie2ViewBoxRadius = this.pie2Radius + this.pie2Radius * (this.pieEmphasizeScaleSize * 2) / 100;
            this.pieG.selectAll('#pie1ForeignObject')
                .attr('x', (d, i) => {
                    const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d['value1'] : d.city));
                    return pieX > 0 ? pieX - pie1ViewBoxRadius : pieX - pie1ViewBoxRadius / 2;
                })
                .attr('y', (d) => {
                    const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d['value1']))
                    return pieY > 0 ? pieY - pie1ViewBoxRadius : pieY - pie1ViewBoxRadius / 2;
                })
                .attr('opacity', (d) => {
                    if (this.isHorizontalChart) {
                        return this.yScale(d.city) ? 1 : 0;
                    } else {
                        return this.xScale(d.city) ? 1 : 0;
                    }
                });

            if (this.isDumbbellChart) {
                this.pieG.selectAll('#pie2ForeignObject')
                    .attr('x', (d, i) => {
                        const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d['value2'] : d.city));
                        return pieX > 0 ? pieX - pie2ViewBoxRadius : pieX - pie2ViewBoxRadius / 2;
                    })
                    .attr('y', (d) => {
                        const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d['value2']))
                        return pieY > 0 ? pieY - pie2ViewBoxRadius : pieY - pie2ViewBoxRadius / 2;
                    })
                    .attr('opacity', (d) => {
                        if (this.isHorizontalChart) {
                            return this.yScale(d.city) ? 1 : 0;
                        } else {
                            return this.xScale(d.city) ? 1 : 0;
                        }
                    });
            }
        }
    }

    getCategoricalValuesIndexByKey(key: string): number {
        return this.visualUpdateOptions.options.dataViews[0].categorical.values?.findIndex(data => data.source.roles[key] === true);
    }

    isHasCategoricalValuesIndexByKey(key: string): number {
        return this.visualUpdateOptions.options.dataViews[0].categorical.values?.findIndex(data => data.source.roles[key] === true);
    }

    getCategoricalCategoriesIndexByKey(key: string): number {
        return this.visualUpdateOptions.options.dataViews[0].categorical.categories?.findIndex(data => data.source.roles[key] === true);
    }

    drawLollipopChart(): void {
        this.isLollipopChartDrawn = true;
        if (this.getCategoricalValuesIndexByKey(DataRolesName.Value1) !== -1) {
            this.drawXYAxis();
            this.drawXYAxisTitle();
            this.drawLines();

            const onCaseLollipopTypePie = () => {
                this.drawCircle1([]);
                this.drawCircle2([]);
                this.drawPie1Chart(this.chartData);
                if (this.isDumbbellChart && this.isHasValue2) {
                    this.drawPie2Chart(this.chartData);
                } else {
                    this.drawPie2Chart([]);
                }
                this.drawData1Labels([]);
                if (this.isDumbbellChart && this.isHasValue2) {
                    this.drawData2Labels([]);
                } else {
                    this.drawData2Labels([]);
                }
            }

            switch (this.chartSettings.lollipopType) {
                case LollipopType.Circle: {
                    this.drawPie1Chart([]);
                    this.drawPie2Chart([]);
                    this.drawCircle1(this.chartData);
                    this.drawCircle2(this.isDumbbellChart ? this.chartData : []);
                    this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
                    if (this.isDumbbellChart && this.isHasValue2) {
                        this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
                    } else {
                        this.drawData2Labels([]);
                    }
                    break;
                }
                case LollipopType.Pie: {
                    onCaseLollipopTypePie();
                    break;
                }
                case LollipopType.Donut: {
                    onCaseLollipopTypePie();
                    break;
                }
                case LollipopType.Rose: {
                    onCaseLollipopTypePie();
                    break;
                }
            }
        }
    }

    // Number Format
    getAutoUnitFormattedNumber(number: number): string {
        const numberSettings = this.numberSettings;
        if (number < 1.0e+6) {
            return this.decimalSeparator(+(number / 1.0e+3).toFixed(numberSettings.decimalPlaces)) + numberSettings.thousands;
        } else if (number >= 1.0e+6 && number < 1.0e+9) {
            return this.decimalSeparator(+(number / 1.0e+6).toFixed(numberSettings.decimalPlaces)) + numberSettings.million;
        } else if (number >= 1.0e+9 && number < 1.0e+12) {
            return this.decimalSeparator(+(number / 1.0e+9).toFixed(numberSettings.decimalPlaces)) + numberSettings.billion;
        } else if (number >= 1.0e+12) {
            return this.decimalSeparator(+(number / 1.0e+12).toFixed(numberSettings.decimalPlaces)) + numberSettings.trillion;
        }
    }

    thousandsSeparator(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.numberSettings.thousandsSeparator);
    }

    decimalSeparator(number: number): string {
        const decimals = (number - Math.floor(number)).toFixed(this.numberSettings.decimalPlaces);
        const fNumber = (number + '').split('.')[0] + (+decimals > 0 ? this.numberSettings.decimalSeparator + (decimals + '').split('.')[1] : '');
        // return this.thousandsSeparator(+fNumber);
        return fNumber;
    }

    getFormattedNumber(number: number): string {
        const numberSettings = this.numberSettings;

        if (!numberSettings.show) {
            return number + '';
        }

        let formattedNumber: string = '0';
        switch (numberSettings.displayUnits) {
            case DisplayUnits.Auto: {
                formattedNumber = this.getAutoUnitFormattedNumber(number);
                break;
            }
            case DisplayUnits.None: {
                formattedNumber = this.thousandsSeparator(parseInt((number).toFixed(numberSettings.decimalPlaces)));
                break;
            }
            case DisplayUnits.Thousands: {
                formattedNumber = this.decimalSeparator(+(number / 1.0e+3).toFixed(numberSettings.decimalPlaces)) + numberSettings.thousands;
                break;
            }
            case DisplayUnits.Millions: {
                formattedNumber = this.decimalSeparator(+(number / 1.0e+6).toFixed(numberSettings.decimalPlaces)) + numberSettings.million;
                break;
            }
            case DisplayUnits.Billions: {
                formattedNumber = this.decimalSeparator(+(number / 1.0e+9).toFixed(numberSettings.decimalPlaces)) + numberSettings.billion;
                break;
            }
            case DisplayUnits.Trillions: {
                formattedNumber = this.decimalSeparator(+(number / 1.0e+12).toFixed(numberSettings.decimalPlaces)) + numberSettings.trillion;
                break;
            }
            default: {
                formattedNumber = this.getAutoUnitFormattedNumber(number);
            }
        }

        return numberSettings.prefix + ' ' + formattedNumber + ' ' + numberSettings.suffix;
    }

    // Data Labels
    getDataLabelDisplayStyle(labelEle: any): string {
        if (this.dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
            const labelTextWidth = (d3.select(labelEle).select('.dataLabelText').node() as SVGSVGElement).getBBox().width;
            return labelTextWidth > this.circle1Radius * 2 ? 'none' : 'block';
        } else if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
            const prop = labelEle.getBoundingClientRect();
            // let marginLeft = this.margin.left + (this.visualUpdateOptions.options.isInFocus === true ? this.settingsPopupOptionsWidth : 0);
            // let marginTop = this.margin.top + this.settingsBtnHeight - (this.visualUpdateOptions.options.isInFocus === true ? this.settingsPopupOptionsHeight : 0);
            let marginLeft = this.margin.left;
            let marginRight = this.margin.right;
            let marginTop = this.margin.top;
            let marginBottom = this.margin.bottom;
            let settingsBtnHeight = this.settingsBtnHeight;
            const legendPosition = this.legendSettings.position;

            if (this.legendSettings.show) {
                if (legendPosition === ILegendPosition.Left || legendPosition === ILegendPosition.LeftCenter) {
                    marginLeft += this.legendViewPort.width;
                }
                if (legendPosition === ILegendPosition.Right || legendPosition === ILegendPosition.RightCenter) {
                    marginRight -= this.legendViewPort.width;
                }
                if (legendPosition === ILegendPosition.Top || legendPosition === ILegendPosition.TopCenter) {
                    marginTop += this.legendViewPort.height;
                }
                if (legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
                    marginBottom += this.legendViewPort.height;
                }
            }

            if (prop.x - this.settingsPopupOptionsWidth < marginLeft || prop.bottom > this.viewPortHeight - marginBottom ||
                prop.top - settingsBtnHeight < marginTop || prop.right > this.viewPortWidth - marginRight) {
                return 'none';
            }
            else {
                return 'block';
            }
        }

    }

    getDataLabelsFontSize(isData2Label: boolean = false): number {
        const circleRadius = isData2Label ? this.circle2Radius : this.circle1Radius;
        if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
            return this.dataLabelsSettings.fontSize;
        }
        if (this.dataLabelsSettings.fontSizeType === DataLabelsFontSizeType.Auto) {
            const fontSize = circleRadius / 1.4;
            this.dataLabelsSettings.fontSize = fontSize;
            return fontSize;
        } else {
            return this.dataLabelsSettings.fontSize;
        }
    }

    setDataLabelsFormatting(labelSelection: any, textSelection: any, rectSelection: any, isData2Label: boolean = false): void {
        const dataLabelsSettings = this.dataLabelsSettings;
        const key = isData2Label ? 'value2' : 'value1';

        labelSelection
            .attr('class', 'dataLabelG')
            .attr('display', 'block')
            .attr('opacity', dataLabelsSettings.show ? '1' : '0')
            .style('pointer-events', 'none');

        textSelection
            .classed('dataLabelText', true)
            .attr('fill', dataLabelsSettings.color)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.02em')
            .attr('font-size', this.getDataLabelsFontSize(isData2Label))
            .style('font-family', dataLabelsSettings.fontFamily)
            .style('font-weight', dataLabelsSettings.fontStyle === FontStyle.Bold ? 'bold' : '')
            .style('font-style', dataLabelsSettings.fontStyle === FontStyle.Italic ? 'italic' : '')
            .text(d => this.getFormattedNumber(d[key]));

        rectSelection
            .classed('dataLabelRect', true)
            .attr('width', 0)
            .attr('width', function () {
                const getBBox = (d3.select(this.parentNode).select('text').node() as SVGSVGElement).getBBox();
                return getBBox.width + dataLabelsSettings.fontSize;
            })
            .attr('height', 0)
            .attr('height', function () {
                const getBBox = (d3.select(this.parentNode).select('text').node() as SVGSVGElement).getBBox();
                return getBBox.height + dataLabelsSettings.fontSize * 0.4;
            })
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', dataLabelsSettings.backgroundColor)
            .attr('opacity', '0');

        if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
            rectSelection
                .attr('fill-opacity', `${100 - dataLabelsSettings.transparency}% `)
                .attr('opacity', dataLabelsSettings.showBackground ? '1' : '0');
        }

        textSelection
            .attr('transform', function () {
                const bBox = (d3.select(this.parentNode).select('rect').node() as SVGSVGElement).getBBox();
                return `translate(${bBox.width / 2},
                ${bBox.height - 1.5 - dataLabelsSettings.fontSize * 0.4})`;
            })
    }

    getDataLabelXY(d: ILollipopChartRow, isPie2: boolean = false): { x: number, y: number } {
        let x = 0;
        let y = 0;

        if (this.isHorizontalChart) {
            if (this.chartSettings.lollipopType === LollipopType.Circle) {
                x = this.getCircleCX(this.xScale(isPie2 ? d.value2 : d.value1));
                y = this.getCircleCY(this.yScale(d.city));
            }
        } else {
            if (this.chartSettings.lollipopType === LollipopType.Circle) {
                x = this.getCircleCX(this.xScale(d.city));
                y = this.getCircleCY(this.yScale(isPie2 ? d.value2 : d.value1));
            }
        }
        return { x, y }
    }

    transformData1LabelOutside(labelSelection: any): void {
        const dataLabelsSettings = this.dataLabelsSettings;
        const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ?
            this.circle1Radius / 0.7 : this.pie1Radius / 0.7;
        const self = this;

        labelSelection
            .attr('transform', function (d) {
                const bBox = this.getBBox();
                if (self.isHorizontalChart) {
                    const XY = self.getDataLabelXY(d);
                    const x = XY.x;
                    const y = XY.y;
                    if (self.isDumbbellChart) {
                        if (self.yAxisSettings.position === Position.Left && d.value1 < d.value2 ||
                            self.yAxisSettings.position === Position.Right && d.value1 > d.value2) {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width - labelDistance},
                            ${y - bBox.height / 2}), rotate(${0})`
                            }
                            else {
                                return `translate(${x - bBox.height - labelDistance},
                            ${y + bBox.width / 2}), rotate(${270})`
                            }
                        }
                        else {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x + labelDistance},
                            ${y - bBox.height / 2}), rotate(${0})`
                            }
                            else {
                                return `translate(${x + labelDistance},
                            ${y + bBox.width / 2}), rotate(${270})`
                            }
                        }
                    } else {
                        if (self.yAxisSettings.position === Position.Left) {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x + labelDistance},
                            ${y - bBox.height / 2}), rotate(${0})`
                            }
                            else {
                                return `translate(${x + labelDistance},
                            ${y + bBox.width / 2}), rotate(${270})`
                            }
                        } else {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width - labelDistance},
                            ${y - bBox.height / 2}), rotate(${0})`
                            }
                            else {
                                return `translate(${x - bBox.height - labelDistance},
                            ${y + bBox.width / 2}), rotate(${270})`
                            }
                        }
                    }
                } else {
                    const XY = self.getDataLabelXY(d);
                    const x = XY.x;
                    const y = XY.y;
                    if (self.isDumbbellChart) {
                        if (self.xAxisSettings.position === Position.Bottom && d.value1 < d.value2 ||
                            self.xAxisSettings.position === Position.Top && d.value1 > d.value2) {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width / 2},
                                ${y + labelDistance}), rotate(${0})`
                            }
                            else {
                                return `translate(${x - bBox.height / 2},
                                ${y + labelDistance + bBox.width}), rotate(${270})`
                            }
                        } else {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width / 2},
                                ${y - labelDistance - bBox.height}), rotate(${0})`
                            } else {
                                return `translate(${x - bBox.height / 2},
                                ${y - labelDistance}), rotate(${270})`
                            }
                        }
                    } else {
                        if (self.xAxisSettings.position === Position.Bottom) {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width / 2},
                                ${y - labelDistance - bBox.height}), rotate(${0})`
                            }
                            else {
                                return `translate(${x - bBox.height / 2},
                                ${y - labelDistance}), rotate(${270})`
                            }
                        } else {
                            if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                                return `translate(${x - bBox.width / 2},
                                ${y + labelDistance}), rotate(${0})`
                            }
                            else {
                                return `translate(${x - bBox.height / 2},
                                ${y + bBox.width + labelDistance}), rotate(${270})`
                            }
                        }
                    }
                }
            })
    }

    transformData2LabelOutside(labelSelection: any): void {
        const dataLabelsSettings = this.dataLabelsSettings;
        const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ?
            this.circle2Radius / 0.7 : this.pie2Radius / 0.7;
        const self = this;

        labelSelection
            .attr('transform', function (d) {
                const bBox = this.getBBox();
                if (self.isHorizontalChart) {
                    const XY = self.getDataLabelXY(d, true);
                    const x = XY.x;
                    const y = XY.y;
                    if (self.yAxisSettings.position === Position.Left && d.value1 < d.value2 ||
                        self.yAxisSettings.position === Position.Right && d.value1 > d.value2) {
                        if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                            return `translate(${x + labelDistance},
                                ${y - bBox.height / 2}), rotate(${0})`
                        }
                        else {
                            return `translate(${x + labelDistance},
                                ${y + bBox.width / 2}), rotate(${270})`
                        }
                    }
                    else {
                        if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                            return `translate(${x - bBox.width - labelDistance},
                            ${y - bBox.height / 2}), rotate(${0})`
                        }
                        else {
                            return `translate(${x - bBox.height - labelDistance},
                            ${y + bBox.width / 2}), rotate(${270})`
                        }
                    }
                } else {
                    const XY = self.getDataLabelXY(d, true);
                    const x = XY.x;
                    const y = XY.y;
                    if (self.xAxisSettings.position === Position.Bottom && d.value1 < d.value2 ||
                        self.xAxisSettings.position === Position.Top && d.value1 > d.value2) {
                        if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                            return `translate(${x - bBox.width / 2},
                            ${y - labelDistance - bBox.height}), rotate(${0})`
                        }
                        else {
                            return `translate(${x - bBox.height / 2},
                            ${y - labelDistance}), rotate(${270})`
                        }
                    } else {
                        if (dataLabelsSettings.orientation === Orientation.Horizontal) {
                            return `translate(${x - bBox.width / 2},
                            ${y + labelDistance}), rotate(${0})`
                        } else {
                            return `translate(${x - bBox.height / 2},
                            ${y + labelDistance + bBox.width}), rotate(${270})`
                        }
                    }
                }
            })
    }

    transformData1LabelInside(labelsSelection: any): void {
        const THIS = this;
        labelsSelection.attr('transform', function (d) {
            const labelBBox = this.getBBox();
            const x = THIS.getCircleCX(THIS.xScale(THIS.isHorizontalChart ? d.value1 : d.city));
            const y = THIS.getCircleCY(THIS.yScale(THIS.isHorizontalChart ? d.city : d.value1));
            const transX = x - labelBBox.width / 2;
            const transY = y - labelBBox.height / 2;
            return `translate(${transX}, ${transY})`;
        });
    }

    transformData2LabelInside(labelsSelection: any): void {
        const THIS = this;
        labelsSelection.attr('transform', function (d) {
            const labelBBox = this.getBBox();
            const x = THIS.getCircleCX(THIS.xScale(THIS.isHorizontalChart ? d.value2 : d.city));
            const y = THIS.getCircleCY(THIS.yScale(THIS.isHorizontalChart ? d.city : d.value2));
            const transX = x - labelBBox.width / 2;
            const transY = y - this.getBBox().height / 2;
            return `translate(${transX}, ${transY})`;
        });
    }

    drawData1Labels(data: ILollipopChartRow[]): void {
        const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
        this.scaleBandWidth = clonedXScale.padding(0).bandwidth();
        const self = this;

        const labelsData = data.filter(data => {
            return this.isHorizontalChart ? this.yScale(data.city) : this.xScale(data.city);
        })

        const dataLabelGSelection = this.dataLabels1G.selectAll('.dataLabelG').data(labelsData);

        dataLabelGSelection.join(
            enter => {
                const dataLabelGSelection = enter
                    .append('g');

                const textSelection = dataLabelGSelection
                    .append('text');

                const rectSelection = dataLabelGSelection
                    .append('rect');

                this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
                if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
                    this.transformData1LabelOutside(dataLabelGSelection);
                } else {
                    this.transformData1LabelInside(dataLabelGSelection);
                }

                dataLabelGSelection
                    .attr('display', function () {
                        return self.getDataLabelDisplayStyle(this);
                    })
            },
            update => {
                const dataLabelGSelection = update
                    .attr('class', 'dataLabelG');

                const textSelection = dataLabelGSelection
                    .select('.dataLabelText');

                const rectSelection = dataLabelGSelection
                    .select('.dataLabelRect');

                this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
                if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
                    this.transformData1LabelOutside(dataLabelGSelection);
                } else {
                    this.transformData1LabelInside(dataLabelGSelection);
                }

                dataLabelGSelection
                    .attr('display', function () {
                        return self.getDataLabelDisplayStyle(this);
                    })
            }
        )

        this.dataLabels1G.selectAll('.dataLabelG').select('text').raise();
    }

    drawData2Labels(data: ILollipopChartRow[]): void {
        const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
        this.scaleBandWidth = clonedXScale.padding(0).bandwidth();
        const self = this;

        const labelsData = data.filter(data => {
            return this.isHorizontalChart ? this.yScale(data.city) : this.xScale(data.city);
        })

        const dataLabelGSelection = this.dataLabels2G.selectAll('.dataLabelG').data(labelsData);

        dataLabelGSelection.join(
            enter => {
                const dataLabelGSelection = enter
                    .append('g');

                const textSelection = dataLabelGSelection
                    .append('text');

                const rectSelection = dataLabelGSelection
                    .append('rect');

                this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
                if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
                    this.transformData2LabelOutside(dataLabelGSelection);
                } else {
                    this.transformData2LabelInside(dataLabelGSelection);
                }

                dataLabelGSelection
                    .attr('display', function () {
                        return self.getDataLabelDisplayStyle(this);
                    })
            },
            update => {
                const dataLabelGSelection = update
                    .attr('class', 'dataLabelG')

                const textSelection = dataLabelGSelection
                    .select('.dataLabelText')

                const rectSelection = dataLabelGSelection
                    .select('.dataLabelRect');

                this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
                if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
                    this.transformData2LabelOutside(dataLabelGSelection);
                } else {
                    this.transformData2LabelInside(dataLabelGSelection);
                }

                dataLabelGSelection
                    .attr('display', function () {
                        return self.getDataLabelDisplayStyle(this);
                    })
            }
        )

        this.dataLabels2G.selectAll('.dataLabelG').select('text').raise();
    }

    drawTooltip(): void {
        this.tooltipServiceWrapper.addTooltip(d3.selectAll('.chart-circle1'),
            (datapoint: any) => this.isDumbbellChart && this.isHasValue2
                ? getClevelandTooltipData(datapoint, true) : getTooltipData(datapoint, true),
            (datapoint: any) => datapoint.selectionId
        );

        this.tooltipServiceWrapper.addTooltip(d3.selectAll('.chart-circle2'),
            (datapoint: any) => this.isDumbbellChart && this.isHasValue2
                ? getClevelandTooltipData(datapoint, false) : getTooltipData(datapoint, false),
            (datapoint: any) => datapoint.selectionId
        );

        const getTooltipData = (value: ILollipopChartRow, isCircle1: boolean): VisualTooltipDataItem[] => {
            const tooltipData: TooltipData[] = [{
                displayName: this.categoryDisplayName,
                value: typeof value.city === "string" ? value.city.toUpperCase() : value.city,
                color: 'transparent'
            }, {
                displayName: isCircle1 ? this.value1DisplayName : this.value2DisplayName,
                value: isCircle1 ? this.getFormattedNumber(value.value1) : this.getFormattedNumber(value.value2),
                color: value.styles.circle1.fillColor,
            }];

            value.tooltipFields.forEach(data => {
                tooltipData.push({
                    displayName: data.displayName,
                    value: typeof data.value === "number" ? this.getFormattedNumber(data.value) : data.value,
                    color: data.color ?? 'transparent'
                })
            });

            return tooltipData;
        }

        const getClevelandTooltipData = (value: ILollipopChartRow, isCircle1: boolean): VisualTooltipDataItem[] => {
            const tooltipData: TooltipData[] = [{
                displayName: this.categoryDisplayName,
                value: typeof value.city === "string" ? value.city.toUpperCase() : value.city,
                color: 'transparent'
            }, {
                displayName: this.value1DisplayName,
                value: this.getFormattedNumber(value.value1),
                color: value.styles.circle1.fillColor,
            }, {
                displayName: this.value2DisplayName,
                value: this.getFormattedNumber(value.value2),
                color: value.styles.circle2.fillColor,
            }];

            value.tooltipFields.forEach(data => {
                tooltipData.push({
                    displayName: data.displayName,
                    value: typeof data.value === "number" ? this.getFormattedNumber(data.value) : data.value,
                    color: data.color ?? 'transparent'
                })
            });
            return tooltipData;
        }
    }

    // XY Axis Title
    drawXYAxisTitle(): void {
        const xAxisSettings = this.xAxisSettings;
        const yAxisSettings = this.yAxisSettings;

        this.xAxisTitleText
            .attr('fill', xAxisSettings.titleColor)
            .attr('font-size', xAxisSettings.titleFontSize)
            .style('font-family', xAxisSettings.titleFontFamily)
            .style('display', xAxisSettings.isDisplayTitle ? 'block' : 'none');

        this.yAxisTitleText
            .attr('fill', yAxisSettings.titleColor)
            .attr('font-size', yAxisSettings.titleFontSize)
            .style('font-family', this.yAxisSettings.titleFontFamily)
            .style('display', yAxisSettings.isDisplayTitle ? 'block' : 'none');

        const xAxisTitle = this.isHorizontalChart ? this.valuesTitle : this.categoryTitle;
        if (!xAxisSettings.titleName) {
            xAxisSettings.titleName = xAxisTitle;
            xAxisSettings.titleName = xAxisTitle;
        }
        this.xAxisTitleText
            .text(xAxisSettings.titleName ?? xAxisTitle);

        const yAxisTitle = this.isHorizontalChart ? this.categoryTitle : this.valuesTitle;
        if (!yAxisSettings.titleName) {
            yAxisSettings.titleName = yAxisTitle;
            yAxisSettings.titleName = yAxisTitle;
        }
        this.yAxisTitleText
            .text(yAxisSettings.titleName ?? yAxisTitle);

        if (xAxisSettings.position === Position.Bottom) {
            this.xAxisTitleG
                .attr('transform', `translate(${this.width / 2}, ${this.height + this.margin.bottom - (this.brushHeight / 2) - this.axisTitleMargin})`);

        } else if (xAxisSettings.position === Position.Top) {
            this.xAxisTitleG
                .attr('transform', `translate(${this.width / 2}, ${- this.margin.top + 2 * this.axisTitleMargin})`);
        }

        if (yAxisSettings.position === Position.Left) {
            this.yAxisTitleG
                .attr('transform', `translate(${- this.margin.left + this.axisTitleMargin + this.axisTitleMargin}, ${this.height / 2})`)
        } else if (yAxisSettings.position === Position.Right) {
            this.yAxisTitleG
                .attr('transform', `translate(${this.width + this.margin.right - (this.brushWidth / 2) - this.axisTitleMargin}, ${this.height / 2})`);
        }
    }

    setScaleBandwidth(): void {
        const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
        this.scaleBandWidth = clonedXScale.padding(0).bandwidth();
        if (!this.chartSettings.isLollipopDistanceChange || this.chartSettings.lollipopDistanceType ===
            LollipopDistanceType.Auto) {
            const maxRadius = d3.max([this.circle1Settings.circleRadius, this.circle2Settings.circleRadius]);
            const circleDDiff = maxRadius * 2 + (maxRadius * 2) - Math.floor(this.scaleBandWidth);
            this.chartSettings.lollipopDistance = Math.floor(this.scaleBandWidth) + circleDDiff;
            // CHART_SETTINGS.lollipopDistance = Math.floor(this.chartSettings.lollipopDistance);
        }

        if (this.chartSettings.lollipopDistanceType === LollipopDistanceType.Custom) {
            // CHART_SETTINGS.lollipopDistance = Math.round(this.scaleBandWidth);
        }
    }

    // Scale & Axis
    setXAxisTickStyle(): void {
        const tickDYScale = d3.scaleLinear().range([0.71, 0.35]);
        tickDYScale.domain([0, 90]);

        const tickXScale = d3.scaleLinear().range([0, 19]);
        tickXScale.domain([0, 90]);

        const tickYScale = d3.scaleLinear().range([9, 0]);
        tickYScale.domain([0, 90]);

        const THIS = this;
        const xAxisSettings = this.xAxisSettings;
        const maxLabelTilt = 20;
        this.xAxisG
            .selectAll('text')
            .attr('dy', '0.35em')
            .attr('fill', xAxisSettings.labelColor)
            .style('font-family', xAxisSettings.labelFontFamily)
            .attr('font-size', xAxisSettings.labelFontSize)
            .attr('display', xAxisSettings.isDisplayLabel ? 'block' : 'none')
            .attr('text-anchor', xAxisSettings.labelTilt > maxLabelTilt ? 'end' : 'middle')
            .attr('transform', () => {
                if (xAxisSettings.position === Position.Bottom) {
                    return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, 10)rotate(-${this.getXAxisLabelTilt()})`
                } else if (xAxisSettings.position === Position.Top) {
                    return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, -10)rotate(${this.getXAxisLabelTilt()})`
                }
            })
            .each(function (d) {
                if (THIS.isHorizontalChart && typeof d === "number") {
                    THIS.setAxisNumberFormatting(this, d);
                }
            })
            // .call(wrap, this.scaleBandWidth)
            .each(function () {
                THIS.trimXAxisTick(this);
            });

        function wrap(text: any, width: number): void {
            text.each(function () {
                const text = d3.select(this);
                let words = text.text().split(/\s+/).reverse();
                let word;
                let line = [];
                let lineNumber = 0;
                const lineHeight = 1.1;
                const y = text.attr('y');
                const dy = parseFloat(text.attr('dy'));
                let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(' '));
                    if (tspan.node().getComputedTextLength() > width - width * 0.1) {
                        line.pop();
                        tspan.text(line.join(' '));
                        line = [word];
                        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                    }
                }
            });
        }
    }

    getXAxisLabelTilt(): number {
        let labelTilt = 30;
        if (this.xAxisSettings.isLabelAutoTilt) {
            if (this.viewPortWidth < 186) {
                labelTilt = 90;
            } else if (this.viewPortWidth > 378 && this.viewPortWidth < 576) {
                labelTilt = 60;
            } else if (this.viewPortWidth > 576 && this.viewPortWidth < 768) {
                labelTilt = 40;
            } else if (this.viewPortWidth > 768 && this.viewPortWidth < 992) {
                labelTilt = 25;
            } else if (this.viewPortWidth > 992 && this.viewPortWidth < 1200) {
                if (this.isHorizontalBrushDisplayed) {
                    labelTilt = 25;
                } else {
                    labelTilt = 0;
                }
            } else if (this.viewPortWidth > 1200) {
                if (this.isHorizontalBrushDisplayed) {
                    labelTilt = 25;
                } else {
                    labelTilt = 0;
                }
            }
        } else {
            labelTilt = this.xAxisSettings.labelTilt;
        }
        this.xAxisSettings.labelTilt = labelTilt;
        return labelTilt;
    }

    setYAxisTickStyle(): void {
        const THIS = this;
        const yAxisSettings = this.yAxisSettings;
        this.yAxisG.
            selectAll('text')
            .attr('fill', yAxisSettings.labelColor)
            .style('font-family', yAxisSettings.labelFontFamily)
            .attr('font-size', yAxisSettings.labelFontSize)
            .attr('display', yAxisSettings.isDisplayLabel ? 'block' : 'none')
            .style('text-anchor', yAxisSettings.position === Position.Left ? 'end' : 'start')
            .each(function (d) {
                if (!THIS.isHorizontalChart && typeof d === "number") {
                    THIS.setAxisNumberFormatting(this, d);
                }
            })
            .each(function () {
                THIS.trimYAxisTick(this);
            });
    }

    trimXAxisTick(tickEle: any): void {
        const self = d3.select(tickEle);
        const textLength = self.node().getComputedTextLength();
        const minCharLen = d3.min([Math.round(this.xScaleWidth / 100), this.xAxisSettings.labelCharLimit]);
        const charLen = textLength > this.scaleBandWidth - 10 ? minCharLen : this.xAxisSettings.labelCharLimit;
        const text = self.text();
        if (text.length > charLen) {
            const newText = text.substr(0, charLen);
            self.text(newText + '..');
        }
    }

    trimYAxisTick(tickEle: any): void {
        const self = d3.select(tickEle);
        const textLength = self.node().getComputedTextLength();
        const text = self.text();
        if (text.length > this.yAxisSettings.labelCharLimit) {
            const newText = text.substr(0, this.yAxisSettings.labelCharLimit);
            self.text(newText + '..');
        }
    }

    setAxisNumberFormatting(tickEle: any, number: number): void {
        const self = d3.select(tickEle);
        self.text(this.getFormattedNumber(number));
    }

    setXYAxisDomain(): void {
        const values = this.chartData.reduce((arr, d) => {
            return [...arr, d.value1, d.value2];
        }, []);
        let max = d3.max(this.isDumbbellChart ? values.map(val => val) : this.chartData.map(d => d.value1));
        max += max * 0.15;
        const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";

        if (this.isHorizontalChart) {
            this.xScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand().padding(1);
            this.yScale = d3.scaleBand().padding(1);
            this.yScale2 = d3.scaleBand().padding(1);

            if (isLinearScale) {
                this.xScale.domain([0, max]);
            } else {
                this.xScale.domain(this.chartData.map((d) => d.value1));
            }

            this.yScale.domain(this.chartData.map((d) => d.city));
            this.yScale2.domain(this.chartData.map((d) => d.city));
        } else {
            this.xScale = d3.scaleBand().padding(1);
            this.xScale2 = d3.scaleBand().padding(1);
            this.yScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand().padding(1);

            this.xScale.domain(this.chartData.map((d) => d.city));
            this.xScale2.domain(this.chartData.map((d) => d.city));
            if (isLinearScale) {
                this.yScale.domain([0, max]);
            } else {
                this.yScale.domain(this.chartData.map((d) => d.value1));
            }
        }
    }

    setXYAxisRange(xScaleWidth: number, yScaleHeight: number): void {
        if (this.isHorizontalChart) {
            this.xScale.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
            this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
            this.yScale2.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
        } else {
            this.xScale.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
            this.xScale2.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
            this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
        }
    }

    callXYScaleOnAxisGroup(): void {
        if (this.xAxisSettings.position === Position.Bottom) {
            this.xAxisG
                .attr('transform', 'translate(0,' + this.height + ')')
                .call(d3.axisBottom(this.xScale).ticks(this.width / 90))
            // .selectAll('text')
            // .attr('dy', '0.35em')
            // .attr('transform', `translate(-10, 10)rotate(-${this.visualSettings.xAxis.labelTilt})`)

        } else if (this.xAxisSettings.position === Position.Top) {
            this.xAxisG
                .attr('transform', 'translate(0,' + 0 + ')')
                .call(d3.axisTop(this.xScale).ticks(this.width / 90))
            // .selectAll('text')
            // .attr('dy', '0.35em')
            // .attr('transform', `translate(-10, -10)rotate(${this.visualSettings.xAxis.labelTilt})`)
        }

        if (this.yAxisSettings.position === Position.Left) {
            this.yAxisG
                .attr('transform', `translate(0, 0)`)
                .call(d3.axisLeft(this.yScale).ticks(this.height / 70));
        } else if (this.yAxisSettings.position === Position.Right) {
            this.yAxisG
                .attr('transform', `translate(${this.width}, 0)`)
                .call(d3.axisRight(this.yScale).ticks(this.height / 70));
        }
    }

    xGridLinesFormatting(lineSelection: any): void {
        lineSelection
            .attr('class', this.xGridSettings.lineType)
            .classed('grid-line', true)
            .attr('x1', d => this.xScale(d))
            .attr('x2', d => this.xScale(d))
            .attr('y1', this.margin.top)
            .attr('y2', this.height)
            .attr('stroke', this.xGridSettings.lineColor)
            .attr('stroke-width', this.xGridSettings.lineWidth)
            .attr('opacity', 1)
            .attr('stroke-dasharray', this.xGridSettings.lineType === LineType.Dotted ? `0, ${this.xGridSettings.lineWidth * 8} `
                : `${this.xGridSettings.lineWidth * 10}, ${this.xGridSettings.lineWidth * 10}`)
            .style('display', this.xGridSettings.show ? 'block' : 'none');
    }

    yGridLinesFormatting(lineSelection: any): void {
        lineSelection
            .attr('class', this.yGridSettings.lineType)
            .classed('grid-line', true)
            .attr('x1', 0)
            .attr('x2', this.width)
            .attr('y1', d => this.yScale(d))
            .attr('y2', d => this.yScale(d))
            .attr('stroke', this.yGridSettings.lineColor)
            .attr('stroke-width', this.yGridSettings.lineWidth)
            .attr('opacity', 1)
            .attr('stroke-dasharray', this.yGridSettings.lineType === LineType.Dotted ? `0, ${this.yGridSettings.lineWidth * 8} `
                : `${this.yGridSettings.lineWidth * 10}, ${this.yGridSettings.lineWidth * 10} `)
            .style('display', this.yGridSettings.show ? 'block' : 'none');
    }

    drawXGridLines(): void {
        const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";
        const xScaleTicks = this.isHorizontalChart && isLinearScale ? this.xScale.ticks(this.width / 90) : this.xScale.domain();
        const gridLinesSelection = this.xGridLinesG.selectAll('line').data(xScaleTicks);
        this.xGridLinesSelection = gridLinesSelection.join(
            enter => {
                const lines = enter.append('line');
                this.xGridLinesFormatting(lines);
                return lines;
            },
            update => {
                this.xGridLinesFormatting(update);
                return update;
            }
        )
    }

    drawYGridLines(): void {
        const yScaleTicks = this.isHorizontalChart ? this.yScale.domain() : this.yScale.ticks(this.height / 70);
        const gridLinesSelection = this.yGridLinesG.selectAll('line').data(yScaleTicks);
        this.yGridLinesSelection = gridLinesSelection.join(
            enter => {
                const lines = enter.append('line');
                this.yGridLinesFormatting(lines);
                return lines;
            },
            update => {
                this.yGridLinesFormatting(update);
                return update;
            }
        )
    }

    drawXYAxis(): void {
        const THIS = this;
        this.setXYAxisDomain();
        this.setXYAxisRange(this.width, this.height);
        this.setScaleBandwidth();
        this.callXYScaleOnAxisGroup();

        this.xAxisG.selectAll('.tick').style('display', this.xAxisSettings.isDisplayLabel ? 'block' : 'none');
        this.yAxisG.selectAll('.tick').style('display', this.yAxisSettings.isDisplayLabel ? 'block' : 'none');

        this.setXAxisTickStyle();
        this.setYAxisTickStyle();

        this.svg.select('.yAxisG').each(function () {
            THIS.yScaleGWidth = this.getBBox().width;
            THIS.setMargins();
        })

        this.svg.select('.xAxisG').each(function () {
            THIS.xScaleGHeight = this.getBBox().height;
            THIS.setMargins();
        })

        this.callXYScaleOnAxisGroup();
        this.setXAxisTickStyle();
        this.setYAxisTickStyle();

        this.setXYAxisRange(this.width, this.height);
        this.setScaleBandwidth();

        this.xScaleWidth = this.chartSettings.lollipopDistance * this.width / this.scaleBandWidth;
        this.yScaleHeight = this.chartSettings.lollipopDistance * this.height / this.scaleBandWidth;

        if (this.chartSettings.lollipopDistanceType === LollipopDistanceType.Custom) {
            if (this.width > this.xScaleWidth && this.height > this.yScaleHeight) {
                if (this.isHorizontalChart) {
                    this.setXYAxisRange(this.width, this.yScaleHeight);
                    this.setScaleBandwidth();
                } else {
                    this.setXYAxisRange(this.xScaleWidth, this.height);
                    this.setScaleBandwidth();
                }
            }
        }

        this.container
            .attr('transform',
                'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.callXYScaleOnAxisGroup();
        this.setXAxisTickStyle();
        this.setYAxisTickStyle();
        this.drawXGridLines();
        this.drawYGridLines();
    }

    // Lines
    setLineStrokeColor(): void {
        const lineColor = this.lineSettings.lineColor;
        if (this.isDumbbellChart && (lineColor === 'rgb(91,121,185)' || lineColor === 'rgba(91,121,185,1)')) {
            this.lineSettings.lineColor = 'rgb(150,150,150,60)';
        }
    }

    setHorizontalLinesFormatting(linesSelection: any): void {
        this.setLineStrokeColor();
        linesSelection
            .attr('class', this.lineSettings.lineType)
            .classed('chart-line', true)
            .attr('x1', (d) => this.xScale(this.isDumbbellChart ? d.value2 : 0))
            .attr('x2', (d) => this.xScale(d.value1))
            .attr('y1', (d) => this.yScale(d.city))
            .attr('y2', (d) => this.yScale(d.city))
            .attr('stroke', d => d.styles.line.color)
            .attr('stroke-width', this.getLineStrokeWidth())
            .attr('opacity', 1)
            .attr('stroke-dasharray', this.lineSettings.lineType === LineType.Dotted ? `0, ${this.lineSettings.lineWidth * 2} `
                : `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `)
            .style('display', this.lineSettings.show ? 'block' : 'none');
    }

    getLineStrokeWidth(): number {
        const strokeWidthScale = d3.scaleLinear().range([2, this.lineSettings.lineWidth]).domain([100, 1000]);
        const widthByScale = strokeWidthScale(this.width);
        return widthByScale < this.lineSettings.lineWidth ? widthByScale : this.lineSettings.lineWidth;
    }

    setVerticalLinesFormatting(linesSelection: any): void {
        this.setLineStrokeColor();
        linesSelection
            .attr('class', this.lineSettings.lineType)
            .classed('chart-line', true)
            .attr('x1', (d) => this.xScale(d.city))
            .attr('x2', (d) => this.xScale(d.city))
            .attr('y1', (d) => this.yScale(d.value1))
            .attr('y2', (d) => this.yScale(this.isDumbbellChart ? d.value2 ?? 0 : 0))
            .attr('stroke', d => d.styles.line.color)
            .attr('stroke-width', this.getLineStrokeWidth())
            .attr('opacity', 1)
            .attr('stroke-dasharray', this.lineSettings.lineType === LineType.Dotted ? `0, ${this.lineSettings.lineWidth * 2} `
                : `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `)
            .style('display', this.lineSettings.show ? 'block' : 'none');
    }

    drawLines(): void {
        const lineSelection = this.lineG
            .selectAll('.chart-line')
            .data(this.chartData);

        if (this.isHorizontalChart) {
            this.lineSelection = lineSelection.join(
                enter => {
                    const linesSelection = enter
                        .append('line');
                    this.setHorizontalLinesFormatting(linesSelection);
                    return linesSelection;
                },
                update => {
                    this.setHorizontalLinesFormatting(update);
                    return update;
                }
            )
        } else {
            this.lineSelection = lineSelection.join(
                enter => {
                    const linesSelection = enter
                        .append('line');
                    this.setVerticalLinesFormatting(linesSelection);
                    return linesSelection;
                },
                update => {
                    this.setVerticalLinesFormatting(update);
                    return update;
                }
            )
        }
    }

    // Circle
    setCircle1Radius(): void {
        const maxCircleRadius = this.circle1Settings.maxCircleRadius;
        if (this.circle1Settings.circleSize === CircleSize.Auto) {
            if (this.isHorizontalChart) {
                this.circle1Radius = this.height * 0.04 < maxCircleRadius ? this.height * 0.04 : maxCircleRadius;
            } else {
                this.circle1Radius = this.width * 0.04 < maxCircleRadius ? this.width * 0.04 : maxCircleRadius;
            }
        } else {
            this.circle1Radius = this.circle1Settings.circleRadius;
        }
    }

    setCircle2Radius(): void {
        const maxCircleRadius = this.circle2Settings.maxCircleRadius;
        if (this.circle2Settings.circleSize === CircleSize.Auto) {
            if (this.isHorizontalChart) {
                this.circle2Radius = this.height * 0.04 < maxCircleRadius ? this.height * 0.04 : maxCircleRadius;
            } else {
                this.circle2Radius = this.width * 0.04 < maxCircleRadius ? this.width * 0.04 : maxCircleRadius;
            }
        } else {
            this.circle2Radius = this.circle2Settings.circleRadius;
        }
    }

    getOverflowCircleCXDiff(x: number): number {
        let diff = 0;
        if (this.yAxisSettings.position === Position.Left) {
            diff = x <= this.circle1Radius ? this.circle1Radius - x : 0;
        } else {
            diff = (this.width - x) <= this.circle1Radius ? this.circle1Radius - (this.width - x) : 0;
        }
        return diff;
    }

    getOverflowCircleCYDiff(y: number): number {
        let diff = 0;
        if (this.xAxisSettings.position === Position.Bottom) {
            diff = (this.height - y) <= this.circle1Radius ? this.circle1Radius - (this.height - y) : 0;
        } else {
            diff = y <= this.circle1Radius ? this.circle1Radius - y : 0;
        }
        return diff;
    }

    getCircleCX(x: number): number {
        const diff = this.getOverflowCircleCXDiff(x);
        return x ? this.yAxisSettings.position === Position.Left ? x + diff : x - diff : this.circle1Radius;
    }

    getCircleCY(y: number): number {
        const diff = this.getOverflowCircleCYDiff(y);
        return y ? this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff : this.circle1Radius;
    }

    setCircle1Formatting(circleSelection: any): void {
        this.setCircle1Radius();
        circleSelection
            .attr('class', 'chart-circle1')
            .attr('cx', (d) => this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value1 : d.city)))
            .attr('cy', (d) => this.getCircleCY(this.yScale(this.isHorizontalChart ? d.city : d.value1)))
            .attr('r', this.circle1Radius)
            .attr('stroke', d => d.styles[CircleType.Circle1][CategoryDataColorProps.strokeColor])
            .attr('stroke-width', this.circle1Settings.strokeWidth)
            .attr('opacity', 1)
            .style('fill', d => this.circle1Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle1][CategoryDataColorProps.fillColor] : '#fff')
            .style('display', this.circle1Settings.show ? 'block' : 'none');
    }

    setCircle2Formatting(circleSelection: any): void {
        this.setCircle2Radius();
        circleSelection
            .attr('class', 'chart-circle2')
            .attr('cx', (d) => this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value2 : d.city)))
            .attr('cy', (d) => this.getCircleCY(this.yScale(this.isHorizontalChart ? d.city : d.value2)))
            .attr('r', this.circle2Radius)
            .attr('stroke', d => d.styles[CircleType.Circle2][CategoryDataColorProps.strokeColor])
            .attr('stroke-width', this.circle2Settings.strokeWidth)
            .attr('opacity', 1)
            .style('fill', d => this.circle2Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle2][CategoryDataColorProps.fillColor] : '#fff')
            .style('display', (d) => this.circle2Settings.show && this.isDumbbellChart && d.value2 ? 'block' : 'none');
    }

    drawCircle1(data: ILollipopChartRow[]): void {
        const circleSelection1 = this.circle1G.selectAll('.chart-circle1').data(data);
        this.circle1Selection = circleSelection1.join(
            enter => {
                const circleSelection = enter
                    .append('circle');
                this.setCircle1Formatting(circleSelection);
                return circleSelection;
            },
            update => {
                this.setCircle1Formatting(update);
                return update;
            }
        )
    }

    drawCircle2(data: ILollipopChartRow[]): void {
        const circleSelection2 = this.circle2G.selectAll('.chart-circle2').data(data);
        this.circle2Selection = circleSelection2.join(
            enter => {
                const circleSelection = enter
                    .append('circle');
                this.setCircle2Formatting(circleSelection);
                return circleSelection;
            },
            update => {
                this.setCircle2Formatting(update);
                return update;
            }
        )
    }

    // Pie
    setPie1Radius(): void {
        const maxPieRadius = this.pie1Settings.maxPieRadius;
        if (this.pie1Settings.pieSize === PieSize.Auto) {
            this.pie1Radius = this.scaleBandWidth / 4 < maxPieRadius ? this.scaleBandWidth / 4 : maxPieRadius;
        } else {
            this.pie1Radius = this.pie1Settings.pieRadius;
        }
    }

    setPie2Radius(): void {
        const maxPieRadius = this.pie2Settings.maxPieRadius;
        if (this.pie2Settings.pieSize === PieSize.Auto) {
            this.pie2Radius = this.scaleBandWidth / 4 < maxPieRadius ? this.scaleBandWidth / 4 : maxPieRadius;
        } else {
            this.pie2Radius = this.pie2Settings.pieRadius;
        }
    }

    getOverflowPieXDiff(x: number, isPie2: boolean = false): number {
        let diff = 0;
        const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
        if (this.yAxisSettings.position === Position.Left) {
            diff = x <= radius ? radius - x : 0;
        } else {
            diff = (this.width - x) <= radius ? radius - (this.width - x) : 0;
        }
        return diff;
    }

    getOverflowPieYDiff(y: number, isPie2: boolean = false): number {
        let diff = 0;
        const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
        if (this.xAxisSettings.position === Position.Bottom) {
            diff = (this.height - y) <= radius ? radius - (this.height - y) : 0;
        } else {
            diff = y <= radius ? radius - y : 0;
        }
        return diff;
    }

    getPieX(x: number, isPie2: boolean = false): number {
        const diff = this.getOverflowPieXDiff(x);
        const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
        const pieViewBoxRadius = radius * 2;
        return x ? this.yAxisSettings.position === Position.Left ? x + diff : x - diff : pieViewBoxRadius / 2;
    }

    getPieY(y: number, isPie2: boolean = false): number {
        const diff = this.getOverflowPieYDiff(y);
        const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
        const pieViewBoxRadius = radius * 2;
        return y ? this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff : pieViewBoxRadius / 2;
    }

    setPie1ChartFormatting(): void {
        this.setPie1Radius();
    }

    setPie2ChartFormatting(): void {
        this.setPie2Radius();
    }

    getPieChartSeriesDataByCategory(category: string, isPie2: boolean = false): { value: number, name: string }[] {
        const id = this.chartData.findIndex(data => data.city === category);
        return this.chartData[id].subCategories.map(data => ({ value: isPie2 ? data.value2 : data.value1, name: data.category }));
    }

    getPieSliceClass(category: string, subCategory: string): string {
        return `${category}-${subCategory}`.replace(/ /g, '').toLocaleLowerCase().trim();
    }

    getPieChartSeriesRadius(): string | string[] | number[] {
        switch (this.chartSettings.lollipopType) {
            case LollipopType.Pie: {
                return `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`;
            }
            case LollipopType.Donut: {
                return ['55%', `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
            }
            case LollipopType.Rose: {
                return ['30%', `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
            }
            default: {
                return `${this.pieViewBoxRatio}%`;
            }
        }
    }

    getPieDataLabelsFontSize(isPie2: boolean = false): number {
        const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
        let autoFontSize = this.dataLabelsSettings.pieDataLabelFontSize;
        switch (this.chartSettings.lollipopType) {
            case LollipopType.Pie:
                autoFontSize = pieRadius - (pieRadius * ((this.pieEmphasizeScaleSize) / 100));
                DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize / 2);
                break;

            case LollipopType.Donut:
                autoFontSize = pieRadius - (pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100));
                DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize);
                break;

            case LollipopType.Rose:
                autoFontSize = pieRadius - (pieRadius * ((70 + this.pieEmphasizeScaleSize) / 100));
                DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize);
                break;
        }

        if (this.dataLabelsSettings.pieDataLabelFontSize === 12) {
            return DATA_LABELS_SETTINGS.pieDataLabelFontSize;
        } else {
            return d3.min([autoFontSize, this.dataLabelsSettings.pieDataLabelFontSize]);
        }
    }

    getPieChartOptions(category: string, isPie2: boolean = false): EChartsOption {
        const pieOption: EChartsOption = {
            series: [
                {
                    type: 'pie',
                    color: ['#000000'],
                    radius: this.getPieChartSeriesRadius(),
                    emphasis: {
                        scaleSize: this.pieEmphasizeScaleSize
                    },
                    data: this.getPieChartSeriesDataByCategory(category),
                }
            ]
        }

        pieOption.series[0].label = {
            show: this.dataLabelsSettings.show,
            color: this.dataLabelsSettings.color,
            textBorderColor: this.dataLabelsSettings.borderColor,
            textBorderWidth: this.dataLabelsSettings.borderWidth,
            fontSize: this.getPieDataLabelsFontSize(isPie2),
            fontFamily: this.dataLabelsSettings.fontFamily,
            position: 'center',
            formatter: () => {
                return this.getAutoUnitFormattedNumber(categoryValue);
            }
        };

        const categoryValue = this.chartData.find(d => d.city === category)[isPie2 ? 'value2' : 'value1'];
        switch (this.chartSettings.lollipopType) {
            case LollipopType.Pie: {
                pieOption.series[0].itemStyle = {
                    borderRadius: 0,
                    borderColor: '#fff',
                    borderWidth: 0
                }
                pieOption.series[0].roseType = '';
                break;
            }
            case LollipopType.Donut: {
                pieOption.series[0].itemStyle = {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                }
                pieOption.series[0].roseType = '';
                break;
            }
            case LollipopType.Rose: {
                pieOption.series[0].roseType = 'area';
                pieOption.series[0].center = ['50%', '50%'];
                pieOption.series[0].itemStyle = {
                    borderRadius: 8
                }
                break;
            }
        }
        return pieOption;
    }

    setPieDataLabelsDisplayStyle(isPie2: boolean = false): void {
        const foreignObjectId = isPie2 ? '#pie2ForeignObject' : '#pie1ForeignObject';
        const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
        this.svg
            .selectAll(foreignObjectId)
            .selectAll('text')
            .style('pointer-events', 'none')
            .style('opacity', function () {
                return this.getBBox().width >= pieRadius * 2 ? '0' : '1';
            });
    }

    enterPieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
        const THIS = this;
        isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
        const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
        const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
        const valueKey = isPie2 ? 'value2' : 'value1';
        const pieViewBoxRadius = pieRadius + pieRadius * (this.pieEmphasizeScaleSize * 2) / 100;
        const d = pieViewBoxRadius * 2;
        pieForeignObjectSelection
            .attr('id', isPie2 ? 'pie2ForeignObject' : 'pie1ForeignObject')
            .attr('width', d)
            .attr('height', d)
            .attr('x', (d) => {
                const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.city));
                return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
            })
            .attr('y', (d) => {
                const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d[valueKey]))
                return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
            })
            .attr('opacity', (d) => 1)
            .append('xhtml:div')
            .attr('id', 'pie')
            .style('width', '100%')
            .style('height', '100%')
            .each(function (d) {
                const ePieChart = echarts.init(this);
                ePieChart.setOption(THIS.getPieChartOptions(d.city, isPie2));

                d3.select(this).selectAll('path').data(d.subCategories);
                d3.select(this)
                    .selectAll('path')
                    .attr('class', (pieData: IChartSubCategory) => {
                        return THIS.getPieSliceClass(d.city, pieData.category);
                    })
                    .style('fill', (d: IChartSubCategory) => {
                        return d.styles[pieType].color;
                    });

                d3.select(this)
                    .select('g')
                    .append('rect')
                    .lower()
                    .attr('class', 'innerCenterRect')
                    .attr('width', pieRadius + pieRadius * 30 / 100)
                    .attr('height', pieRadius + pieRadius * 30 / 100)
                    .attr('x', (pieRadius - (pieRadius * 30 / 100) / 2) / 2)
                    .attr('y', (pieRadius - (pieRadius * 30 / 100) / 2) / 2)
                    .attr('fill', '#fff');

                THIS.tooltipServiceWrapper.addTooltip(d3.select(this).selectAll('path'),
                    (datapoint: IChartSubCategory) => getTooltipData(datapoint),
                    (datapoint: IChartSubCategory) => datapoint.selectionId
                );

                const getTooltipData = (pieData: IChartSubCategory): VisualTooltipDataItem[] => {
                    const tooltipData: TooltipData[] = [{
                        displayName: THIS.categoryDisplayName,
                        value: pieData.category,
                        color: 'transparent'
                    }, {
                        displayName: isPie2 ? THIS.value2DisplayName : THIS.value1DisplayName,
                        value: THIS.getFormattedNumber(pieData[valueKey]),
                        color: pieData.styles[pieType].color
                    }];

                    pieData.tooltipFields.forEach(data => {
                        tooltipData.push({
                            displayName: data.displayName,
                            value: typeof data.value === "number" ? THIS.getFormattedNumber(data.value) : data.value,
                            color: data.color ?? 'transparent'
                        })
                    });

                    return tooltipData;
                }
            })

        this.pieG.on('mouseover', (e) => {
            if (e.path?.length && e.path[5]) {
                d3.select(e.path[5]).raise();
            }
        })

        this.pieG.on('mouseout', (e) => {
            this.pieG.selectAll('foreignObject')
                .sort((a, b) => d3.ascending(a.sortId, b.sortId))
        })
    }

    updatePieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
        const THIS = this;
        isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
        const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
        const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
        const valueKey = isPie2 ? 'value2' : 'value1';
        const pieViewBoxRadius = pieRadius + pieRadius * (this.pieEmphasizeScaleSize * 2) / 100;
        const d = pieViewBoxRadius * 2;
        pieForeignObjectSelection
            .attr('width', d)
            .attr('height', d)
            .attr('x', (d, i) => {
                const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.city));
                return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
            })
            .attr('y', (d) => {
                const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d[valueKey]))
                return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
            })
            .attr('opacity', (d) => 1)
            .select('#pie')
            .style('width', '100%')
            .style('height', '100%')
            .each(function (d) {
                const ePieChart = echarts.init(this);
                ePieChart.setOption(THIS.getPieChartOptions(d.city, isPie2));
                ePieChart.resize();

                d3.select(this).selectAll('path').data(d.subCategories);
                d3.select(this)
                    .selectAll('path')
                    .attr('class', (pieData: IChartSubCategory) => THIS.getPieSliceClass(d.city, pieData.category))
                    .style('fill', (d: IChartSubCategory, i) => d.styles[pieType].color);

                d3.select(this)
                    .selectAll('.innerCenterRect')
                    .attr('width', pieRadius + pieRadius * 30 / 100)
                    .attr('height', pieRadius + pieRadius * 30 / 100)
                    .attr('x', (pieRadius - (pieRadius * 30 / 100) / 2) / 2)
                    .attr('y', (pieRadius - (pieRadius * 30 / 100) / 2) / 2)
                    .attr('fill', '#fff');
            })
    }

    drawPie1Chart(data: ILollipopChartRow[]): void {
        data.forEach((d, i) => d.sortId = 1000 + i);
        if (this.isRankingSettingsChanged) {
            this.pieG.selectAll('#pie1ForeignObject').remove();
        }
        const pie1ForeignObjectSelection = this.pieG.selectAll('#pie1ForeignObject').data(data, (d, i) => i);
        pie1ForeignObjectSelection.exit().remove();
        pie1ForeignObjectSelection.join(
            enter => {
                const enteredForeignObjects = enter
                    .append('foreignObject');
                this.enterPieChart(enteredForeignObjects);
            },
            update => {
                this.updatePieChart(update);
            }
        )
        this.setPieDataLabelsDisplayStyle();
    }

    drawPie2Chart(data: ILollipopChartRow[]): void {
        data.forEach((d, i) => d.sortId = 2000 + i);
        if (this.isRankingSettingsChanged) {
            this.pieG.selectAll('#pie2ForeignObject').remove();
        }
        const pie2ForeignObjectSelection = this.pieG.selectAll('#pie2ForeignObject').data(data, (d, i) => i);
        pie2ForeignObjectSelection.join(
            enter => {
                const enteredForeignObjects = enter
                    .append('foreignObject')
                this.enterPieChart(enteredForeignObjects, true);
            },
            update => {
                this.updatePieChart(update, true);
            }
        )
        this.setPieDataLabelsDisplayStyle(true);
    }

    // Legend
    setLegendsData(): void {
        let legend1DataPoints: LegendDataPoint[] = [];
        let legend2DataPoints: LegendDataPoint[] = [];
        this.subCategories.sort((a, b) => a.name.localeCompare(b.name));

        if (this.chartSettings.lollipopType === LollipopType.Circle) {
            legend1DataPoints = [
                {
                    label: this.value1DisplayName,
                    color: this.dataColorsSettings.circle1.circleFillColor,
                    selected: false,
                    identity: this.visualUpdateOptions.host.createSelectionIdBuilder().withMeasure(DataRolesName.Value1).createSelectionId()
                },
                {
                    label: this.value2DisplayName,
                    color: this.dataColorsSettings.circle2.circleFillColor,
                    selected: false,
                    identity: this.visualUpdateOptions.host.createSelectionIdBuilder().withMeasure(DataRolesName.Value2).createSelectionId()
                }
            ];
        }
        else {
            legend1DataPoints = this.subCategories.map(category => ({
                label: category.name,
                color: category.color1,
                selected: false,
                identity: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId()
            }))

            legend2DataPoints = this.subCategories.map(category => ({
                label: category.name,
                color: category.color2,
                selected: false,
                identity: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId()
            }))
        }

        this.legends1Data = {
            fontSize: this.legendSettings.labelFontSize / 1.2,
            dataPoints: legend1DataPoints,
        };

        this.legends2Data = {
            fontSize: this.legendSettings.labelFontSize / 1.2,
            dataPoints: legend2DataPoints,
        };

        this.setLegendTitleText();
    }

    setLegendTitleText(): void {
        let lastTitle: string;
        let lastTitle1: string;
        let lastTitle2: string;
        if (this.legendSettings.isShowTitle) {
            if (!this.isDumbbellChart) {
                if (this.legendSettings.legendTitleText === '' || this.legendSettings.legendTitleText === lastTitle) {
                    this.legendSettings.legendTitleText = this.value1DisplayName;
                    lastTitle = this.value1DisplayName;
                }

                this.legendSettings.legend1TitleText = undefined;
                this.legendSettings.legend2TitleText = undefined;
                this.legends1Data.title = this.legendSettings.legendTitleText;
            } else {
                this.legendSettings.legendTitleText = undefined;
                if (this.legendSettings.legend1TitleText === '' || this.legendSettings.legend1TitleText === lastTitle1) {
                    this.legendSettings.legend1TitleText = this.value1DisplayName;
                    lastTitle1 = this.value1DisplayName;
                }

                if (this.legendSettings.legend2TitleText === '' || this.legendSettings.legend2TitleText === lastTitle2) {
                    this.legendSettings.legend2TitleText = this.value2DisplayName;
                    lastTitle2 = this.value2DisplayName;
                }

                this.legends1Data.title = this.legendSettings.legend1TitleText;
                this.legends2Data.title = this.legendSettings.legend2TitleText;
            }
        }
    }

    renderLegends(): void {
        const legendPosition = this.legendSettings.position;
        this.setLegendViewPortWidthHeight();

        this.legend1.changeOrientation(LegendPosition[legendPosition]);
        this.legend1.drawLegend(this.legends1Data, { width: this.legendViewPortWidth, height: this.legendViewPortHeight });
        positionChartArea(d3.select(this.chartContainer), this.legend1);

        if (this.isDisplayLegend2) {
            this.legend2.changeOrientation(LegendPosition[legendPosition]);
            this.legend2.drawLegend(this.legends2Data, { width: this.legendViewPortWidth, height: this.legendViewPortHeight });
            positionChartArea(d3.select(this.chartContainer), this.legend2);
        }

        d3.select(this.hostContainer)
            .selectAll('.legend')
            .attr('id', (d, i) => `legend-${i + 1}`);

        const legend1ViewPort = this.legend1.getMargins();
        const legend2ViewPort = this.legend2.getMargins();

        if (this.isDisplayLegend2) {
            this.legendViewPort.width = (legend1ViewPort.width ?? 0) + (legend2ViewPort.width ?? 0);
            this.legendViewPort.height = (legend1ViewPort.height ?? 0) + (legend2ViewPort.height ?? 0);
        } else {
            this.legendViewPort.width = legend1ViewPort.width ?? 0;
            this.legendViewPort.height = legend1ViewPort.height ?? 0;
        }

        this.setLegendStyles();
    }

    setLegendViewPortWidthHeight(): void {
        const legendPosition = this.legendSettings.position;
        const visualViewPort = this.visualUpdateOptions.options.viewport;
        this.legendViewPortHeight = visualViewPort.height - this.settingsBtnHeight;

        if (!this.isDisplayLegend2) {
            this.removeLegend(LegendType.Legend2);
        }

        this.legendViewPortWidth = visualViewPort.width;
        if (legendPosition === ILegendPosition.Top || legendPosition === ILegendPosition.TopCenter ||
            legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
            this.legendViewPortWidth = this.legendViewPortWidth - this.settingsPopupOptionsWidth;
        }
    }

    setLegendStyles(): void {
        const legendPosition = this.legendSettings.position;
        const chartContainerEle = d3.select(this.chartContainer);

        switch (legendPosition) {
            case ILegendPosition.Top:
            case ILegendPosition.TopCenter:
            case ILegendPosition.Bottom:
            case ILegendPosition.BottomCenter:
                chartContainerEle.style('height', `calc(100% - ${this.settingsBtnHeight + this.legendViewPort.height}px)`);
                break;

            case ILegendPosition.Left:
            case ILegendPosition.LeftCenter:
            case ILegendPosition.Right:
            case ILegendPosition.RightCenter:
                chartContainerEle.style('width', `calc(100vw - ${this.legendViewPort.width}px)`);
                chartContainerEle.style('height', `calc(100% - ${this.settingsBtnHeight}px)`);
                break;
        }

        if (this.legendSettings.show) {
            if (this.isDumbbellChart && this.chartSettings.lollipopType !== LollipopType.Circle) {
                this.setLegendMarginLeftByTitle();
            } else {
                this.legend1MarginLeft = 0;
                this.legend2MarginLeft = 0;
            }
            this.setLegend1Styles();
            this.setLegendTextStyles(LegendType.Legend1);
            this.setLegendTitleStyles(LegendType.Legend1);

            if (this.isDisplayLegend2) {
                this.setLegend2Styles();
                this.setLegendTextStyles(LegendType.Legend2);
                this.setLegendTitleStyles(LegendType.Legend2);
            }
        }
    }

    setLegendMarginLeftByTitle(): void {
        this.legend2MarginLeft = 0;
        this.legend1MarginLeft = 0;
        const legendPosition = this.legendSettings.position;
        if (legendPosition === ILegendPosition.Top
            || legendPosition === ILegendPosition.TopCenter
            || legendPosition === ILegendPosition.Bottom
            || legendPosition === ILegendPosition.BottomCenter) {
            const legendTitlesWidth: { id: number, width: number }[] = [];
            d3.selectAll('.legendTitle').each(function (d, i) {
                legendTitlesWidth.push({ id: i, width: (this as any).getBBox().width });
            });

            if (legendTitlesWidth.length) {
                const legendTitleWithMaxWidth = legendTitlesWidth.reduce((p, c) => p.width > c.width ? p : c);
                if (legendTitleWithMaxWidth.id === 0) {
                    this.legend2MarginLeft = legendTitlesWidth[0].width - legendTitlesWidth[1].width;
                } else if (legendTitleWithMaxWidth.id === 1) {
                    this.legend1MarginLeft = legendTitlesWidth[1].width - legendTitlesWidth[0].width;
                }

                if (this.legend1MarginLeft > 0) {
                    this.legend1.drawLegend(this.legends1Data, { width: this.legendViewPortWidth - this.legend1MarginLeft, height: this.legendViewPortHeight });
                    positionChartArea(d3.select(this.chartContainer), this.legend1);
                }

                if (this.legend2MarginLeft > 0) {
                    this.legend2.drawLegend(this.legends2Data, { width: this.legendViewPortWidth - this.legend2MarginLeft, height: this.legendViewPortHeight });
                    positionChartArea(d3.select(this.chartContainer), this.legend2);
                }
            }
        }
    }

    createDynamicStyleClass(className: string, styleId: string, styles: string, extraClasses: string = ''): void {
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        const styleTag = document.getElementById(styleId);
        const stylesInnerHtml = `.${className} ${extraClasses} ${styles}`;
        style.innerHTML = stylesInnerHtml;
        if (styleTag) {
            document.getElementsByTagName('head')[0].removeChild(styleTag);
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    setLegend1Styles(): void {
        const legendPosition = this.legendSettings.position;
        const chartContainerEle = d3.select(this.chartContainer);
        const legend1Ele = d3.select(this.hostContainer).select('#legend-1');
        const styleClassName = 'legend-1-styles';
        let legendStyles = '';
        legend1Ele.classed(styleClassName, false);

        switch (legendPosition) {
            case ILegendPosition.Top:
            case ILegendPosition.TopCenter:
                legendStyles = `{ margin-left: ${this.legend1MarginLeft}px; }`;
                legend1Ele.classed(styleClassName, true);
                break;

            case ILegendPosition.Bottom:
            case ILegendPosition.BottomCenter:
                const marginTop = parseFloat(legend1Ele.style('margin-top'));
                legend1Ele.style('margin-top', marginTop + 'px');
                legendStyles = `{ margin-left: ${this.legend1MarginLeft}px; }`;
                legend1Ele.classed(styleClassName, true);
                break;
        }

        if (this.isInFocusMode) {
            chartContainerEle.style('width', `calc(100vw - ${this.settingsPopupOptionsWidth}px)`);
            switch (legendPosition) {
                case ILegendPosition.Top:
                case ILegendPosition.TopCenter:
                case ILegendPosition.Bottom:
                case ILegendPosition.BottomCenter:
                    legendStyles = `{ left: ${this.settingsPopupOptionsWidth}px; margin-left: ${this.legend1MarginLeft}px; }`;
                    legend1Ele.classed(styleClassName, true);
                    break;

                case ILegendPosition.Left:
                case ILegendPosition.LeftCenter:
                    chartContainerEle.style('width', `calc(100vw - ${this.settingsPopupOptionsWidth + this.legendViewPort.width}px)`);
                    legendStyles = `{ margin-left: ${this.settingsPopupOptionsWidth}px; left: auto }`;
                    legend1Ele.classed(styleClassName, true)
                    break;

                case ILegendPosition.Right:
                case ILegendPosition.RightCenter:
                    legendStyles = `{ left: auto; }`;
                    legend1Ele.classed(styleClassName, true)
                    break;
            }
        } else {
            legend1Ele.style('left', null);
        }

        if (this.isDumbbellChart && this.chartSettings.lollipopType !== LollipopType.Circle) {
            if (legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
                const marginTop = parseFloat(legend1Ele.style('margin-top')) - this.legend2.getMargins().height;
                legendStyles = `{ margin-top: ${marginTop}px !important; left: ${this.settingsPopupOptionsWidth}px }`;
                legend1Ele.classed(styleClassName, true);
            }

            if (legendPosition === ILegendPosition.Right || legendPosition === ILegendPosition.RightCenter) {
                let marginLeft = parseFloat(legend1Ele.style('margin-left')) - this.legend2.getMargins().width;
                if (this.isInFocusMode) {
                    marginLeft -= this.settingsPopupOptionsWidth;
                }
                legendStyles = `{ margin-left: ${marginLeft}px !important; left: ${this.settingsPopupOptionsWidth}px }`;
                legend1Ele.classed(styleClassName, true);
            }
        }

        this.createDynamicStyleClass(styleClassName, 'legend1Style', legendStyles);
    }

    setLegend2Styles(): void {
        const legendPosition = this.legendSettings.position;
        const legend1ViewPort = this.legend1.getMargins();
        const legend2ViewPort = this.legend2.getMargins();
        const chartContainerEle = d3.select(this.chartContainer);
        const legend1Ele = d3.select(this.hostContainer).select('#legend-1');
        const legend2Ele = d3.select(this.hostContainer).select('#legend-2');

        const styleClassName = 'legend-2-styles';
        let legendStyles = '';
        legend2Ele.classed(styleClassName, false);

        chartContainerEle
            .style('margin-top', this.legendViewPort.height + 'px')
            .style('width', `calc(100vw - ${this.legendViewPort.width + (this.visualUpdateOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0)}px)`)
            .style('height', `calc(100% - ${this.settingsBtnHeight + this.legendViewPort.height}px)`);

        switch (legendPosition) {
            case ILegendPosition.Top:
            case ILegendPosition.TopCenter:
                legendStyles = `{ margin-top: ${legend2ViewPort.height}px; margin-left: ${this.legend2MarginLeft}px; }`;
                legend2Ele.classed(styleClassName, true);
                break;

            case ILegendPosition.Bottom:
            case ILegendPosition.BottomCenter:
                chartContainerEle.style('margin-top', 0);
                const legend2MarginTop = parseFloat(legend2Ele.style('margin-top'));
                legendStyles = `{ margin-top: ${legend2MarginTop}px !important; margin-left: ${this.legend2MarginLeft}px; }`;
                legend2Ele.classed(styleClassName, true);
                break;

            case ILegendPosition.Left:
            case ILegendPosition.LeftCenter:
                chartContainerEle.style('margin-left', this.legendViewPort.width + 'px');
                legendStyles = `{ margin-left: ${legend2ViewPort.width}px; }`;
                legend2Ele.classed(styleClassName, true);
                break;

            case ILegendPosition.Right:
            case ILegendPosition.RightCenter:
                const marginLeft = parseFloat(legend1Ele.style('margin-left'));
                legendStyles = `{ margin-left: ${marginLeft}px !important; }`;
                legend2Ele.classed(styleClassName, true);
                break;
        }

        if (this.isInFocusMode) {
            switch (legendPosition) {
                case ILegendPosition.Top:
                case ILegendPosition.TopCenter:
                    legendStyles = `{ margin-top: ${legend1ViewPort.height}px; left: ${this.settingsPopupOptionsWidth}px;
                                    margin-left: ${this.legend2MarginLeft}px; }`;
                    legend2Ele.classed(styleClassName, true);
                    break;

                case ILegendPosition.Bottom:
                case ILegendPosition.BottomCenter:
                    legendStyles = `{ left: ${this.settingsPopupOptionsWidth}px; margin-left: ${this.legend2MarginLeft}px; }`;
                    legend2Ele.classed(styleClassName, true);
                    break;

                case ILegendPosition.Left:
                case ILegendPosition.LeftCenter:
                    chartContainerEle.style('width', `calc(100vw - ${this.settingsPopupOptionsWidth + this.legendViewPort.width}px)`);
                    legendStyles = `{ margin-left: ${this.settingsPopupOptionsWidth + legend2ViewPort.width}px;
                                    left: auto; }`;
                    legend2Ele.classed(styleClassName, true);
                    break;

                case ILegendPosition.Right:
                case ILegendPosition.RightCenter:
                    chartContainerEle.style('width', `calc(100vw - ${this.settingsPopupOptionsWidth}px)`);
                    legendStyles = `{ left: auto; }`;
                    legend2Ele.classed(styleClassName, true);
                    break;
            }
        } else {
            legend2Ele.style('left', null);
        }

        this.createDynamicStyleClass(styleClassName, 'legend2Style', legendStyles);
    }

    setLegendTextStyles(legendType: LegendType): void {
        const isLegend2 = legendType === LegendType.Legend2;
        const legendId = isLegend2 ? 'legend-2' : 'legend-1';
        const legendEle = d3.select(this.hostContainer).select(`#${legendId}`);
        const styleClassName = 'legend-text-style';
        legendEle.classed(styleClassName, true);
        const legendTextStyle =
            `{ fill: ${this.legendSettings.labelColor};
            font-family: ${this.legendSettings.labelFontFamily};
            font-size: ${this.legendSettings.labelFontSize}px !important;
            }`;
        this.createDynamicStyleClass(styleClassName, 'legendTextStyle', legendTextStyle, '#legendGroup .legendItem .legendText');
    }

    setLegendTitleStyles(legendType: LegendType): void {
        const isLegend2 = legendType === LegendType.Legend2;
        const legendId = isLegend2 ? 'legend-2' : 'legend-1';
        const legendEle = d3.select(this.hostContainer).select(`#${legendId}`);
        const styleClassName = 'legend-title-style';
        legendEle.classed(styleClassName, true);
        const legendTitleStyle =
            `{ fill: ${this.legendSettings.titleColor};
            font-family: ${this.legendSettings.titleFontFamily};
            }`;
        this.createDynamicStyleClass(styleClassName, 'legendTitleStyle', legendTitleStyle, '#legendGroup .legendTitle');
    }

    removeLegend(legendType: LegendType) {
        const legend = legendType === LegendType.Legend1 ? this.legend1 : this.legend2;
        legend.changeOrientation(LegendPosition.None);
        this.chartContainer.style.marginLeft = null;
        this.chartContainer.style.marginTop = null;
        legend.drawLegend({ dataPoints: [] }, this.visualUpdateOptions.options.viewport);
        this.legendViewPort.width = legend.getMargins().width ?? 0;
        this.legendViewPort.height = legend.getMargins().height ?? 0;
        d3.select(this.chartContainer).style('width', `calc(100vw - ${this.settingsPopupOptionsWidth}px)`)
        d3.select(this.hostContainer).selectAll('.legend').style('left', null);
    }

    private handleValidation(vizOptions: ShadowUpdateOptions): boolean {
        const propInfo = { condition: undefined };
        const isHasValue = !!vizOptions.options.dataViews[0].categorical.values;

        if (!isHasValue) {
            propInfo.condition = "Add atleast one value";
        }

        if (propInfo.condition) {
            this.displayValidationPage(propInfo.condition);
            return true;
        } else {
            this.removeContainerFromDom(document.querySelector(".validation-page-container"));
        }
        return false;
    }
}