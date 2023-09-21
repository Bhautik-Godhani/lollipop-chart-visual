/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-this-alias */
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import "regenerator-runtime/runtime";
import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISelectionId = powerbi.visuals.ISelectionId;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IValueFormatter = valueFormatter.IValueFormatter;

import * as d3 from "d3";
import { IBrushLollipopChartData, IChartSubCategory, ILollipopChartRow, TooltipData } from "./model";
import {
	CategoryDataColorProps,
	CircleFillOption,
	CircleSize,
	CircleType,
	ColorPaletteType,
	DataLabelsFontSizeType,
	DataLabelsPlacement,
	EDataRolesName,
	EVisualConfig,
	EVisualSettings,
	LegendType,
	LineType,
	LollipopType,
	Orientation,
	PieSize,
	PieType,
	Position,
	ESortOrderTypes,
	ERankingType,
	ESortByTypes,
	DataValuesType,
	LollipopWidthType,
	ELegendPosition,
	EHighContrastColorType,
} from "./enum";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { createLegend, positionChartArea } from "powerbi-visuals-utils-chartutils/lib/legend/legend";
import { textMeasurementService, wordBreaker } from "powerbi-visuals-utils-formattingutils";
import { ILegend, LegendData, LegendDataPoint, LegendPosition } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import { ShadowUpdateOptions, landingPageProp } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";
import { Enumeration } from "./Enumeration";
import { paidProperties } from "./PaidProperties";
import { NumberFormatting, VisualSettings } from "./settings";
import {
	CHART_SETTINGS,
	CIRCLE_SETTINGS,
	DATA_COLORS,
	DATA_LABELS_SETTINGS,
	GRID_LINES_SETTINGS,
	LINE_SETTINGS,
	RANKING_SETTINGS,
	SHOW_BUCKET_SETTINGS,
	SORTING_SETTINGS,
	X_AXIS_SETTINGS,
	Y_AXIS_SETTINGS,
	BRUSH_AND_ZOOM_AREA_SETTINGS,
	PATTERN_SETTINGS
} from "./constants";
import {
	IBrushAndZoomAreaSettings,
	IBrushConfig,
	IChartSettings,
	ICirclePropsSettings,
	ICircleSettings,
	IConditionalFormattingProps,
	IDataColorsSettings,
	IDataLabelsSettings,
	IFooterSettings,
	IGridLinesSettings,
	IHighContrastDetails,
	ILabelValuePair,
	ILegendSettings,
	ILineSettings,
	INumberSettings,
	IPatternProps,
	IPatternSettings,
	IPiePropsSettings,
	IPieSettings,
	IRankingSettings,
	IShowBucketSettings,
	ISortingProps,
	ISortingSettings,
	IXAxisSettings,
	IXGridLinesSettings,
	IYAxisSettings,
	IYGridLinesSettings,
} from "./visual-settings.interface";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { SVGRenderer } from "echarts/renderers";
import { EChartsOption } from "echarts";
import { GetWordsSplitByWidth, createPatternsDefs, formatNumber, generatePattern, getSVGTextSize, hexToRGB, isConditionMatch, parseConditionalFormatting, powerBiNumberFormat } from "./methods/methods";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import {
	CallExpandAllXScaleOnAxisGroup,
	CallExpandAllYScaleOnAxisGroup,
	RenderExpandAllXAxis,
	RenderExpandAllYAxis,
} from "./methods/expandAllXAxis.methods";
import VisualAnnotations from "@truviz/viz-annotations/VisualAnnotations";
import { GetAnnotationDataPoint, RenderLollipopAnnotations } from "./methods/Annotations.methods";
import { clearLegends, renderLegends } from "./legendHelper";
import { Behavior, SetAndBindChartBehaviorOptions } from "./methods/Behaviour.methods";

import ChartSettings from "./settings-pages/ChartSettings";
import DataColorsSettings from "./settings-pages/DataColorsSettings";
import CircleSettings from "./settings-pages/CircleSettings";
import LineSettings from "./settings-pages/LineSettings";
import DataLabelsSettings from "./settings-pages/DataLabelsSettings";
import GridLinesSettings from "./settings-pages/GridLinesSettings";
import RankingSettings from "./settings-pages/RankingSettings";
import SortingSettings from "./settings-pages/SortingSettings";
import ShowBucket from "./settings-pages/ShowBucket";
import BrushAndZoomAreaSettings from "./settings-pages/BrushAndZoomAreaSettings";
import PatternSettings from "./settings-pages/FillPatterns";
import XAxisSettings from "./settings-pages/XAxisSettings";
import YAxisSettings from "./settings-pages/YAxisSettings";

import { Components } from "@truviz/shadow/dist/types/EditorTypes";

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class Visual extends Shadow {
	public chartContainer: HTMLElement;
	public hostContainer: HTMLElement;
	public vizOptions: ShadowUpdateOptions;
	public selectionManager: ISelectionManager;
	public tooltipServiceWrapper: ITooltipServiceWrapper;
	public legend1: ILegend;
	public legend2: ILegend;
	public colorPalette: IColorPalette;
	public _events: IVisualEventService;
	private _host: IVisualHost;
	public formatNumber: (value: number | string, numberFormatter: IValueFormatter) => string;
	public interactivityService: interactivityBaseService.IInteractivityService<any>;
	public behavior: Behavior;

	// props
	public width: number;
	public height: number;
	public settingsBtnHeight: number = 40;
	public settingsBtnWidth: number = 152;
	public viewPortWidth: number;
	public viewPortHeight: number;
	public margin: { top: number; right: number; bottom: number; left: number };
	public valuesTitle: string;
	public chartData: ILollipopChartRow[];
	public legends1Data: { data: { name: string, color: string, pattern: string } }[] = [];
	public legends2Data: { data: { name: string, color: string, pattern: string } }[] = [];
	public legendViewPort: { width: number; height: number } = { width: 0, height: 0 };
	public isInFocusMode: boolean = false;
	public isVisualResized: boolean = false;
	public footerHeight: number = 0;
	private highContrastDetails: IHighContrastDetails = { isHighContrast: false };
	private isPatternApplied: boolean;

	// CATEGORICAL DATA
	public clonedCategoricalData: powerbi.DataViewCategorical;
	public categoricalData: powerbi.DataViewCategorical;
	public categoricalMetadata: any;
	public categoricalCategoriesFields: powerbi.DataViewCategoryColumn[];
	public categoricalMeasureFields: powerbi.DataViewValueColumn[];
	public categoricalMeasure1Field: powerbi.DataViewValueColumn;
	public categoricalMeasure2Field: powerbi.DataViewValueColumn;
	public categoricalTooltipFields: powerbi.DataViewValueColumn[];
	public categoricalSortFields: powerbi.DataViewValueColumn[];
	public categoricalSubCategoryField: any;
	public categoricalCategoriesLastIndex: number = 0;
	public categoricalDataPairs: any[] = [];

	// data
	isChartInit: boolean = false;
	settingsPopupOptionsWidth: number;
	settingsPopupOptionsHeight: number;
	categoryDisplayName: string;
	subCategoryDisplayName: string;
	categoriesName: string[] = [];
	measureNames: string[] = [];
	subCategoriesName: string[] = [];
	measure1DisplayName: string;
	measure2DisplayName: string;
	subCategories: { name: string; color1: string; color2: string }[] = [];
	isDisplayLegend2: boolean;
	isHasMultiMeasure: boolean;
	isHasSubcategories: boolean;
	isHasCategories: boolean;
	isSortDataFieldsAdded: boolean;
	sortFieldsDisplayName: ILabelValuePair[];
	blankText: string = "(Blank)";
	othersBarText = "Others";
	totalLollipopCount: number = 0;
	legends: {
		legendItems: Selection<SVGElement>, legendWrapper: Selection<SVGElement>
	};
	conditionalFormattingConditions: IConditionalFormattingProps[] = [];

	// selection id
	selectionIdByCategories: { [category: string]: ISelectionId } = {};
	selectionIdBySubCategories: { [subcategory: string]: ISelectionId } = {};

	// number formatter
	public measureNumberFormatter: IValueFormatter[];
	public tooltipNumberFormatter: IValueFormatter[];
	public sortValuesNumberFormatter: IValueFormatter[];
	public allNumberFormatter: { [name: string]: { formatter: IValueFormatter; role: EDataRolesName } } = {};

	// svg
	public svg: Selection<SVGElement>;
	public container: any;
	public categoryTitle: string;
	public scaleBandWidth: number;
	public computedTextEle: any;
	public gradientColorScale = d3.scaleLinear();

	// brush
	public brushScaleBand: any;
	public brushXScale: any;
	public brushYScale: any;
	public newScaleDomainByBrush: string[];
	public brushScaleBandBandwidth: number = 0;
	public brushG: Selection<SVGElement>;
	public brushLollipopG: Selection<SVGElement>;
	public brushHeight: number = 0;
	public brushWidth: number = 0;
	public isHorizontalBrushDisplayed: boolean;
	public isVerticalBrushDisplayed: boolean;
	public isLollipopChartDrawn: boolean = false;
	public minScaleBandWidth: number = 40;
	public isScrollBrushDisplayed: boolean;
	public brushXAxisG: Selection<SVGElement>;
	public brushXAxisTicksMaxHeight: number = 0;
	public brushAndZoomAreaHeight: number = 60;
	public brushYAxisG: Selection<SVGElement>;
	public brushYAxisTicksMaxWidth: number = 0;
	public brushAndZoomAreaWidth: number = 150;

	// xAxis
	public xAxisG: Selection<SVGElement>;
	public xScale: any;
	public xScale2: any;
	public xAxisTitleMargin: number = 0;
	public xAxisTitleG: Selection<SVGElement>;
	public xAxisTitleText: any;
	public xAxisTitleSize: { width: number; height: number };
	public xScaleGHeight: number = 0;
	public xScaleWidth: number;
	public xScalePaddingOuter: number = 0.25;
	public isBottomXAxis: boolean;

	// yAxis
	public yAxisG: Selection<SVGElement>;
	public yScale: any;
	public yScale2: any;
	public yAxisTitleText: any;
	public yAxisTitleMargin: number = 0;
	public yAxisTitleG: Selection<SVGElement>;
	public yAxisTitleSize: { width: number; height: number };
	public yScaleGWidth: number = 0;
	public yScaleHeight: number;
	public isLeftYAxis: boolean;

	// EXPAND ALL
	public expandAllXAxisG: Selection<SVGElement>;
	public expandAllYAxisG: Selection<SVGElement>;
	public expandAllXScaleGHeight: number = 0;
	public expandAllYScaleGWidth: number = 0;
	public expandAllCategoriesName: string[] = [];
	public isIdToCategoryAdded: boolean = false;
	public isExpandAllApplied: boolean = false;

	// lollipop
	public lollipopSelection: Selection<SVGElement>;
	public lollipopG: Selection<SVGElement>;

	// line
	public lineSelection: any;
	public lineG: any;
	public lineClass: string = "lollipop-line";
	public lineClassSelector: string = ".lollipop-line";

	// circle
	public circleClass: string = "lollipop-circle";
	public circleClassSelector: string = ".lollipop-circle";

	// circle1
	public circle1G: any;
	public circle1Selection: any;
	public circle1Radius: any;
	public circle1Class: string = "lollipop-circle1";
	public circle1ClassSelector: string = ".lollipop-circle1";

	// circle2
	public circle2G: any;
	public circle2Selection: any;
	public circle2Radius: number;
	public circle2Class: string = "lollipop-circle2";
	public circle2ClassSelector: string = ".lollipop-circle2";

	// data labels
	public dataLabelsSelection: any;
	public dataLabels1G: any;
	public dataLabels2G: any;

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

	// show bucket
	isValidShowBucket = true;
	isShowBucketChartFieldCheck: boolean;
	isShowBucketChartFieldName: string;

	// annotations
	annotationBarClass: string = "annotation-slice";
	visualAnnotations: VisualAnnotations;

	// patterns
	categoryPatterns: IPatternProps[];
	subCategoryPatterns: IPatternProps[];

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
	numberSettings: NumberFormatting;
	xGridSettings: IXGridLinesSettings;
	yGridSettings: IYGridLinesSettings;
	gridSettings: IGridLinesSettings;
	dataColorsSettings: IDataColorsSettings;
	rankingSettings: IRankingSettings;
	sortingSettings: ISortingSettings;
	showBucketSettings: IShowBucketSettings;
	footerSettings: IFooterSettings;
	brushAndZoomAreaSettings: IBrushAndZoomAreaSettings;
	patternSettings: IPatternSettings;

	public static landingPage: landingPageProp = {
		title: "Lollipop Chart",
		versionInfo: "1.0.0.0",
		description:
			"A lollipop chart shows the different stages of a process and how data moves through them. It uses connected segments to create a funnel shape. It helps to analyze the flow of data, like leads or customers, and see how they move through each stage of the process.",
		sliderImages: [],
		learnMoreLink: "https://powerviz.ai/funnel-chart",
	};

	constructor(options: VisualConstructorOptions) {
		super(options, VisualSettings, {
			landingPage: Visual.landingPage,
			theme: {
				sectionName: "visualGeneralSettings",
				propertyName: "darkMode",
			},
			servicePlanIds: [],
			isDragSelection: false,
			summaryTable: true,
			advancedSettingsToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "advancedSettingsToggle",
			},
			annotationsToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "annotationsToggle",
			},
			summaryTableToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "summaryTableToggle",
			},
			valueRole: [EDataRolesName.Measure, EDataRolesName.Tooltip],
			measureRole: [EDataRolesName.Category, EDataRolesName.SubCategory],
			categoricalGroupByRole: [EDataRolesName.SubCategory],
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
					name: "Brush And Zoom Area",
					sectionName: "brushAndZoomAreaConfig",
					propertyName: "brushAndZoomAreaSettings",
					Component: () => BrushAndZoomAreaSettings,
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
				{
					name: "Sorting",
					sectionName: "sortingConfig",
					propertyName: "sorting",
					Component: () => SortingSettings,
				},
				{
					name: "Patterns",
					sectionName: "patternConfig",
					propertyName: "patternSettings",
					Component: () => PatternSettings,
				},
				{
					name: "X Axis",
					sectionName: EVisualConfig.XAxisConfig,
					propertyName: EVisualSettings.XAxisSettings,
					Component: () => XAxisSettings,
				},
				{
					name: "Y Axis",
					sectionName: EVisualConfig.YAxisConfig,
					propertyName: EVisualSettings.YAxisSettings,
					Component: () => YAxisSettings,
				},
				{
					name: "Conditional Formatting",
					sectionName: "editor",
					propertyName: "conditionalFormatting",
					Component: Components.ConditionalFormatting,
				},
				{
					name: "Show Condition",
					sectionName: "showBucketConfig",
					propertyName: "showBucket",
					Component: () => ShowBucket,
				},
			],
		});
		this.init(this.afterUpdate, this.getEnumeration, paidProperties);
		this.chartContainer = this.getVisualContainer();
		this.hostContainer = d3.select(this.chartContainer).node().parentElement;
		this.colorPalette = options.host.colorPalette;
		this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
		this._events = options.host.eventService;
		this._host = options.host;
		this.selectionManager = options.host.createSelectionManager();
		this.interactivityService = interactivitySelectionService.createInteractivitySelectionService(this._host) as any;
		this.behavior = new Behavior();
		this.initChart();
	}

	public getEnumeration(): EnumerateSectionType[] {
		return Enumeration.GET();
	}

	public initChart(): void {
		this.margin = { top: 10, right: 30, bottom: this.xAxisTitleMargin, left: this.yAxisTitleMargin };

		this.svg = d3.select(this.chartContainer).append("svg").classed("lollipopChart", true);

		this.brushG = this.svg.append("g").attr("class", "brush");

		this.brushLollipopG = this.brushG.append("g").attr("class", "brushLollipopG");

		this.container = this.svg.append("g").classed("container", true);

		this.xGridLinesG = this.container.append("g").classed("xGridLinesG", true);

		this.yGridLinesG = this.container.append("g").classed("yGridLinesG", true);

		this.lollipopG = this.container.append("g").classed("lollipopG", true);

		this.lineG = this.container.append("g").classed("lineG", true);

		this.circle1G = this.container.append("g").classed("circle1G", true);

		this.circle2G = this.container.append("g").classed("circle2G", true);

		this.pieG = this.container.append("g").classed("pieG", true);

		this.xAxisG = this.container.append("g").classed("xAxisG", true);

		this.brushXAxisG = this.container.append("g").classed("brushXAxisG", true);

		this.brushYAxisG = this.container.append("g").classed("brushYAxisG", true);

		this.expandAllXAxisG = this.container.append("g").classed("expandAllXAxisG", true);

		this.yAxisG = this.container.append("g").classed("yAxisG", true);

		this.expandAllYAxisG = this.container.append("g").classed("expandAllYAxisG", true);

		this.xAxisTitleG = this.container.append("g").classed("xAxisTitleG", true);

		this.xAxisTitleText = this.xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");

		this.yAxisTitleG = this.container.append("g").classed("yAxisTitleG", true);

		this.yAxisTitleText = this.yAxisTitleG.append("text").classed("yAxisTitle", true).attr("transform", "rotate(-90)").attr("text-anchor", "middle");

		this.dataLabels1G = this.container.append("g").classed("dataLabels1G", true);

		this.dataLabels2G = this.container.append("g").classed("dataLabels2G", true);

		this.computedTextEle = this.container.append("g").append("text");

		echarts.use([PieChart, SVGRenderer]);

		this.isChartInit = true;
	}

	setCategoricalDataBySubcategoryRanking(categoricalData: powerbi.DataViewCategorical): void {
		const subCategoryRankingSettings = this.rankingSettings.subCategory;
		const categoricalValues = categoricalData.values as any;
		const measures: any[] = categoricalValues.filter((d) => d.source.roles[EDataRolesName.Measure]);

		measures.forEach((d) => {
			d["total"] = d3.sum(d.values, (d) => +d);
		});

		measures.sort((a, b) => b["total"] - a["total"]);

		if (subCategoryRankingSettings.enabled) {
			let groupNames: string[] = measures.map((d) => d.source.groupName);

			if (subCategoryRankingSettings.rankingType === ERankingType.TopN) {
				if (this.isHorizontalChart) {
					groupNames = measures.slice(0, subCategoryRankingSettings.count).map((d) => d.source.groupName);
				} else {
					groupNames = measures
						.filter((d) => d.source.roles[EDataRolesName.Measure])
						.slice(0, subCategoryRankingSettings.count)
						.map((d) => d.source.groupName);
				}
			}

			if (subCategoryRankingSettings.rankingType === ERankingType.BottomN) {
				if (this.isHorizontalChart) {
					if (subCategoryRankingSettings.count <= measures.length) {
						groupNames = measures
							.filter((d) => d.source.roles[EDataRolesName.Measure])
							.slice(measures.length - subCategoryRankingSettings.count, measures.length)
							.map((d) => d.source.groupName);
					}
				} else {
					if (subCategoryRankingSettings.count <= measures.length) {
						groupNames = measures
							.filter((d) => d.source.roles[EDataRolesName.Measure])
							.slice(measures.length - subCategoryRankingSettings.count, measures.length)
							.map((d) => d.source.groupName);
					}
				}
			}

			categoricalData.values = categoricalValues.filter((d) => groupNames.includes(d.source.groupName));
		}
	}

	setCategoricalDataPairsByRanking(): void {
		const categoryRankingSettings = this.rankingSettings.category;
		let othersBarData: any[] = [];
		if (categoryRankingSettings.enabled) {
			if (categoryRankingSettings.rankingType === ERankingType.TopN) {
				if (this.isHorizontalChart) {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
						this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
					}
				} else {
					othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
					this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
				}
			}
			if (categoryRankingSettings.rankingType === ERankingType.BottomN) {
				if (this.isHorizontalChart) {
					othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
					this.categoricalDataPairs = this.categoricalDataPairs.slice(
						this.categoricalDataPairs.length - categoryRankingSettings.count,
						this.categoricalDataPairs.length
					);
				} else {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
						this.categoricalDataPairs = this.categoricalDataPairs.slice(
							this.categoricalDataPairs.length - categoryRankingSettings.count,
							this.categoricalDataPairs.length
						);
					}
				}
			}

			const keys = Object.keys(this.categoricalDataPairs[0]).slice(1);
			if (categoryRankingSettings.showRemainingAsOthers && othersBarData.length) {
				const othersDataField: any = {
					category: this.othersBarText,
				};
				keys.forEach((key) => {
					othersDataField[key] = d3.sum(othersBarData, (d) => d[key]);
				});
				if (this.isHorizontalChart) {
					this.categoricalDataPairs.push(othersDataField);
				} else {
					this.categoricalDataPairs.push(othersDataField);
				}
			}
		}
	}

	sortCategoryDataPairs(
		data: { category: string }[],
		categoryKey: string,
		measureKeys: string[],
		sortKeys: string[],
		categoricalMeasureFields: powerbi.DataViewValueColumn[],
		categoricalSortFields: powerbi.DataViewValueColumn[]
	): void {
		const sortingSettings: ISortingProps = this.sortingSettings.category;
		const isMeasure = sortingSettings.isSortByMeasure;
		const isSortByExternalFields = sortingSettings.isSortByExtraSortField;

		const sortByName = () => {
			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
				} else {
					data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
				} else {
					data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
				}
			}
		};

		const sortByMeasure = (measureValues: powerbi.DataViewValueColumn[]) => {
			const index = measureValues.find((d) => d.source.displayName === sortingSettings.sortBy).source.index;
			const measureIndex = isSortByExternalFields ? `${EDataRolesName.Sort}${index}` : `${EDataRolesName.Measure}${index}`;

			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return a[measureIndex] - b[measureIndex];
					});
				} else {
					data.sort((a, b) => {
						return b[measureIndex] - a[measureIndex];
					});
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return a[measureIndex] - b[measureIndex];
					});
				} else {
					data.sort((a, b) => {
						return b[measureIndex] - a[measureIndex];
					});
				}
			}
		};

		const sortByMultiMeasure = (measureKeys: string[]) => {
			const getValue = (d: any) =>
				measureKeys.reduce((value, key) => {
					value += d[key];
					return value;
				}, 0);

			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
					data.sort((a, b) => {
						return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
					});
				} else {
					data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
					});
				} else {
					data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
				}
			}
		};

		// Axis Settings
		if (isMeasure && !isSortByExternalFields) {
			if (this.isHasSubcategories || sortingSettings.isSortByMultiMeasure) {
				sortByMultiMeasure(measureKeys);
			} else {
				sortByMeasure(categoricalMeasureFields);
			}
		} else if (isSortByExternalFields) {
			if (isMeasure) {
				if (this.isHasSubcategories || sortingSettings.isSortByMultiMeasure) {
					sortByMultiMeasure(sortKeys);
				} else {
					const sortField = categoricalSortFields.filter((d) => d.source.displayName === sortingSettings.sortBy);
					sortByMeasure(sortField);
				}
			} else {
				sortByName();
			}
		} else if (!isMeasure && !isSortByExternalFields) {
			sortByName();
		}
	}

	defaultSortCategoryDataPairs(data: { category: string }[], measureKeys: string[], categoricalMeasureFields: powerbi.DataViewValueColumn[]): void {
		const sortByMeasure = (measureValues: powerbi.DataViewValueColumn[]) => {
			const index = measureValues[0].source.index;
			const measureIndex = `${EDataRolesName.Measure1}${index}`;

			if (this.isHorizontalChart) {
				data.sort((a, b) => b[measureIndex] - a[measureIndex]);
			} else {
				data.sort((a, b) => b[measureIndex] - a[measureIndex]);
			}
		};

		const sortByMultiMeasure = (measureKeys: string[]) => {
			const getValue = (d: any) =>
				measureKeys.reduce((value, key) => {
					value += d[key];
					return value;
				}, 0);

			if (this.isHorizontalChart) {
				data.sort((a, b) => (this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b)));
			} else {
				data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
			}
		};

		if (this.isHasMultiMeasure) {
			sortByMultiMeasure(measureKeys);
		} else {
			sortByMeasure(categoricalMeasureFields);
		}
	}

	getXScaleInnerPadding(): number {
		const innerPaddingScale = d3.scaleLinear().domain([0, 100]).range([0, 0.5]);
		return innerPaddingScale(this.chartSettings.lollipopInnerPadding);
	}

	setBrushScaleBandDomain(categoricalData: any): void {
		const innerPadding = this.getXScaleInnerPadding();
		if (this.isHorizontalChart) {
			this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
			this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
		} else {
			this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
			this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
		}
	}

	setBrushScaleBandRange(width: number, height: number): void {
		if (this.isHorizontalChart) {
			this.brushScaleBand.range(this.xAxisSettings.position === Position.Bottom ? [height, 0] : [0, width]);
		} else {
			this.brushScaleBand.range(this.yAxisSettings.position === Position.Left ? [0, width] : [width, 0]);
		}
	}

	setInitialChartData(
		categoricalData: powerbi.DataViewCategorical,
		clonedCategoricalData: powerbi.DataViewCategorical,
		categoricalMetadata: any,
		width: number,
		height: number
	): powerbi.DataViewCategorical {
		const categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
		const categoricalSubCategoryField = categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		const categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		const categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		const categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.isHasMultiMeasure = categoricalMeasureFields.length > 1;
		this.isHasSubcategories = !!categoricalSubCategoryField;
		this.measureNames = [...new Set(categoricalMeasureFields.map((d) => d.source.displayName))];

		this.setNumberFormatters(categoricalMeasureFields, categoricalTooltipFields, categoricalSortFields);

		this.categoryDisplayName = categoricalData.categories[this.categoricalCategoriesLastIndex].source.displayName;
		this.subCategoryDisplayName = categoricalSubCategoryField ? categoricalSubCategoryField.displayName : "";

		this.subCategoriesName = categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];

		this.isSortDataFieldsAdded = categoricalSortFields.length > 0;
		this.sortFieldsDisplayName =
			categoricalSortFields.length > 0
				? categoricalSortFields
					.map((d) => ({
						label: d.source.displayName,
						value: d.source.displayName,
						isSortByCategory: d.source.type.text,
						isSortByMeasure: d.source.type.numeric,
						isSortByExtraSortField: true,
					}))
					.filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i)
				: [];

		this.measure1DisplayName = categoricalMeasureFields.length > 0 ? categoricalMeasureFields[0].source.displayName : "";
		this.measure2DisplayName = categoricalMeasureFields.length > 1 ? categoricalMeasureFields[1].source.displayName : "";

		if (
			this.sortingSettings.category.isSortByExtraSortField &&
			!this.sortFieldsDisplayName.find((d) => d.label === this.sortingSettings.category.sortBy)
		) {
			this.sortingSettings.category.sortBy = ESortByTypes.VALUE;
			this.sortingSettings.category.isSortByCategory = false;
			this.sortingSettings.category.isSortByMeasure = true;
			this.sortingSettings.category.isSortByMultiMeasure = false;
			this.sortingSettings.category.isSortByExtraSortField = false;
		}

		if (
			!this.sortingSettings.category.sortBy ||
			(!(this.measureNames as string[]).includes(this.sortingSettings.category.sortBy) && this.sortingSettings.category.isSortByMeasure)
		) {
			this.sortingSettings.category.sortBy = this.measure1DisplayName;
		}

		if (!this.sortingSettings.subCategory.sortBy) {
			this.sortingSettings.subCategory.sortBy = this.subCategoryDisplayName;
		}

		this.setCategoricalDataBySubcategoryRanking(categoricalData);
		this.categoricalDataPairs = categoricalData.categories[categoricalCategoriesLastIndex].values.reduce((arr, category: string, index: number) => {
			const obj = {
				category: category !== null && category !== undefined && category !== "" ? category : this.blankText,
				hasNegative: false,
				hasZero: false,
			};
			this.expandAllCategoriesName.forEach((d, i) => {
				obj[d] = categoricalData.categories[i].values[index];
			});
			categoricalData.values.forEach((d) => {
				const roles = Object.keys(d.source.roles);
				roles.forEach((role) => {
					if (Object.keys(d.source).includes("groupName")) {
						if (d.values[index] === null || d.values[index] === undefined) {
							d.values[index] = 0;
						}

						if (role === EDataRolesName.Measure && +d.values[index] < 0) {
							d.values[index] = 0;
						}

						if (d.source.groupName !== null && d.source.groupName !== undefined && d.source.groupName !== "") {
							obj[`${role}${d.source.index}${d.source.groupName}`] = d.values[index];
						} else {
							obj[`${role}${d.source.index}${this.blankText}`] = d.values[index];
						}

						if (d.highlights) {
							obj[`${role}${d.source.index}${d.source.groupName}Highlight`] = d.highlights[index];
						}
					} else {
						obj[`${role}${d.source.index}`] = d.values[index];

						if (d.highlights) {
							obj[`${role}${d.source.index}Highlight`] = d.highlights[index];
						}

						if (role === EDataRolesName.Measure && +d.values[index] < 0) {
							obj.hasNegative = true;
						}
					}
				});
			});
			return [...arr, obj];
		}, []);

		// this.categoricalDataPairs = this.categoricalDataPairs.filter(d => d.category !== null && d.category !== undefined);

		const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index + d.source.groupName);

		this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !d.hasNegative && !d.hasZero);
		this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !measureKeys.every((m) => d[m] === 0));

		if (!this.isHasSubcategories) {
			this.defaultSortCategoryDataPairs(this.categoricalDataPairs, measureKeys, categoricalMeasureFields);
		}

		this.setCategoricalDataPairsByRanking();

		if (this.sortingSettings.category.enabled) {
			const sortField = categoricalSortFields.filter((d) => d.source.displayName === this.sortingSettings.category.sortBy);

			if (!this.isHasSubcategories) {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index);
				const sortKeys = sortField.map((d) => EDataRolesName.Sort + d.source.index);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, categoricalMeasureFields, categoricalSortFields);
			} else {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index + d.source.groupName);
				const sortKeys = sortField.map((d) => EDataRolesName.Sort + d.source.index + d.source.groupName);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, categoricalMeasureFields, categoricalSortFields);
			}
		}

		categoricalData.categories.forEach((d, i) => {
			if (i === this.categoricalCategoriesLastIndex) {
				d.values = this.categoricalDataPairs.map((pair) => pair.category);
			} else {
				d.values = this.categoricalDataPairs.map((pair) => pair[d.source.displayName]);
			}
		});

		categoricalData.values.forEach((d) => {
			if (Object.keys(d.source).includes("groupName")) {
				if (d.source.groupName !== null && d.source.groupName !== undefined && d.source.groupName !== "" && d.source.groupName !== this.blankText) {
					d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}`]);
					d.highlights = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}Highlight`]);
				} else {
					d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${this.blankText}`]);
				}
			} else {
				d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}`]);
				d.highlights = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}Highlight`]);
			}
		});

		if (this.isExpandAllApplied) {
			clonedCategoricalData.categories
				.filter((d) => !!d.source.roles[EDataRolesName.Category])
				.forEach((d) => {
					if (!d["isIdToCategoryAdded"]) {
						d.values = d.values.map((d: string, i: number) => {
							if (d.split("-").length === 2) {
								return d;
							} else {
								return d + "-" + i.toString();
							}
						});
						d["isIdToCategoryAdded"] = true;
					}
				});

			categoricalData.categories
				.filter((d) => !!d.source.roles[EDataRolesName.Category])
				.forEach((d) => {
					// if (!d["isIdToCategoryAdded"]) {
					d.values = d.values.map((d: string, i: number) => {
						if (d.split("-").length === 2) {
							return d;
						} else {
							return d + "-" + i.toString();
						}
					});
					d["isIdToCategoryAdded"] = true;
					// }
				});
		}

		this.setBrushScaleBandDomain(clonedCategoricalData);
		this.setBrushScaleBandRange(width, height);

		if (
			this.chartSettings.lollipopWidth > this.minScaleBandWidth &&
			this.chartSettings.lollipopWidthType === LollipopWidthType.Custom
		) {
			this.scaleBandWidth = this.chartSettings.lollipopWidth;
			this.brushScaleBandBandwidth = this.chartSettings.lollipopWidth;
		} else if (this.brushScaleBand.bandwidth() > this.minScaleBandWidth) {
			this.scaleBandWidth = this.brushScaleBand.bandwidth();
			this.brushScaleBandBandwidth = this.brushScaleBand.bandwidth();
		} else {
			this.scaleBandWidth = this.minScaleBandWidth;
			this.brushScaleBandBandwidth = this.minScaleBandWidth;
		}

		this.totalLollipopCount = [...new Set(clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values)].length;

		this.xScale = this.brushScaleBand;

		const expectedWidth = (this.brushScaleBandBandwidth * width) / this.brushScaleBand.bandwidth();
		const expectedHeight = (this.brushScaleBandBandwidth * height) / this.brushScaleBand.bandwidth();

		if (this.isHorizontalChart) {
			if (Math.ceil(this.height) < expectedHeight && (this.chartSettings.lollipopWidthType === LollipopWidthType.Auto ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true)) {
				this.isScrollBrushDisplayed = true;
				this.isVerticalBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = false;

				if (this.brushAndZoomAreaSettings.enabled && this.brushAndZoomAreaSettings.isShowAxis) {
					this.brushXAxisTicksMaxHeight = 0;
					this.setBrushYAxisTicksMaxWidth();
				} else {
					this.brushXAxisTicksMaxHeight = 0;
					this.brushYAxisTicksMaxWidth = 0;
				}

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: 0,
					brushYPos: 0,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: width,
					scaleHeight: height,
					smallMultiplesGridItemId: null,
					categoricalData: categoricalData,
				};

				this.initVerticalBrush(config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		} else {
			if (Math.ceil(this.width) < expectedWidth && (this.chartSettings.lollipopWidthType === LollipopWidthType.Auto ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true)) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				this.isVerticalBrushDisplayed = false;
				const brushXPos = this.margin.left ? this.margin.left : 0;

				if (this.brushAndZoomAreaSettings.enabled && this.brushAndZoomAreaSettings.isShowAxis) {
					this.brushYAxisTicksMaxWidth = 0;
					this.setBrushXAxisTicksMaxHeight();
				} else {
					this.brushXAxisTicksMaxHeight = 0;
					this.brushYAxisTicksMaxWidth = 0;
				}

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: brushXPos,
					brushYPos: 100000,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: width,
					scaleHeight: height,
					smallMultiplesGridItemId: null,
					categoricalData: categoricalData,
				};

				this.initHorizontalBrush(config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		}

		// || this.height < expectedHeight
		if (this.width < expectedWidth && (this.chartSettings.lollipopWidthType === LollipopWidthType.Auto ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true)) {
			const startIndex = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
			const endIndex = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
				this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
			);

			const categoricalData2 = JSON.parse(JSON.stringify(clonedCategoricalData));

			categoricalData2.categories.forEach((d, i) => {
				d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
			});

			categoricalData2.values.forEach((d, i) => {
				d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

				if (d.highlights) {
					d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
				}
			});

			this.setCategoricalDataFields(categoricalData2);
			this.setChartData(categoricalData2);
		}

		return categoricalData;
	}

	public setCategoricalDataFields(categoricalData: powerbi.DataViewCategorical): void {
		this.categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
		this.categoricalSubCategoryField = this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		this.categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		this.categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		this.categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);

		if (this.measureNames.length > 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
			this.categoricalMeasure2Field = this.categoricalMeasureFields[1];
		} else if (this.measureNames.length === 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
		}

		// this.setNumberFormatters(this.categoricalMeasureFields, categoricalTooltipFields);

		this.isHasCategories = this.categoricalCategoriesFields.length > 0;
		this.isHasSubcategories = !!this.categoricalSubCategoryField;
		this.isHasMultiMeasure = this.measureNames.length > 1;

		// if (!this.isHasSubcategories) {
		// 	const isAllNegative = d3.every(this.categoricalMeasureFields, (d) => d3.every(d.values, (d) => +d < 0));
		// 	if (isAllNegative && this.categoricalCategoriesFields.length > 0) {
		// 		this.displayValidationPage("Negative data not supported");
		// 		this._events.renderingFailed(this.vizOptions.options, "Negative data not supported");
		// 		return;
		// 	}
		// }
	}

	expandAllCode(): void {
		if (this.isExpandAllApplied) {
			const { labelFontFamily, labelFontSize } = this.xAxisSettings;
			if (!this.isHorizontalChart) {
				this.expandAllYScaleGWidth = 0;
				this.expandAllXScaleGHeight = getSVGTextSize("XAxis", labelFontFamily, labelFontSize).height * this.expandAllCategoriesName.length;
				this.expandAllCategoriesName.forEach((d) => {
					this[d + "Scale"] = undefined;
					this[d + "ScaleG"] = this.expandAllXAxisG
						.append("g")
						.classed(d + "ScaleG", true)
						.classed("expandAllXAxisG", true);
				});
			} else {
				this.expandAllXScaleGHeight = 0;
				this.expandAllYScaleGWidth = this.width * 0.06 * this.expandAllCategoriesName.length;
				this.expandAllCategoriesName.forEach((d) => {
					this[d + "Scale"] = undefined;
					this[d + "ScaleG"] = this.expandAllYAxisG
						.append("g")
						.classed(d + "ScaleG", true)
						.classed("expandAllYAxisG", true);
				});
			}
		} else {
			this.expandAllXScaleGHeight = 0;
			this.expandAllYScaleGWidth = 0;
		}
	}

	public afterUpdate(vizOptions: ShadowUpdateOptions) {
		this.vizOptions = vizOptions;
		this._events.renderingStarted(vizOptions.options);

		try {
			this.clonedCategoricalData = JSON.parse(JSON.stringify(this.vizOptions.options.dataViews[0].categorical));
			this.categoricalData = this.vizOptions.options.dataViews[0].categorical as any;
			this.categoricalMetadata = this.vizOptions.options.dataViews[0].metadata;
			this.isInFocusMode = vizOptions.options.isInFocus;
			this.isValidShowBucket = true;
			this.brushWidth = 0;
			this.brushHeight = 0;

			const isReturn = this.renderErrorMessages();

			if (isReturn) {
				return;
			}

			if (!this.isChartInit) {
				this.initChart();
			}

			this.renderContextMenu();
			this.setHighContrastDetails();
			this.handleShowBucket();
			this.formatNumber = (value, numberFormatter) => formatNumber(value, this.numberSettings, numberFormatter);
			this.conditionalFormattingConditions = parseConditionalFormatting(vizOptions.formatTab);

			if (!this.isValidShowBucket) {
				return;
			}

			this.expandAllXAxisG.selectAll("*").remove();
			this.expandAllYAxisG.selectAll("*").remove();

			this.setVisualSettings();

			this.isVisualResized =
				this.viewPortWidth &&
				this.viewPortHeight &&
				(this.viewPortWidth !== vizOptions.options.viewport.width || this.viewPortHeight !== vizOptions.options.viewport.height);

			this.width = vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width;
			this.height = vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height;

			const clonedCategoricalData = JSON.parse(JSON.stringify(this.vizOptions.options.dataViews[0].categorical));
			const categoricalCategoriesFields = clonedCategoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
			this.isExpandAllApplied = categoricalCategoriesFields.length >= 2;

			if (this.isExpandAllApplied) {
				clonedCategoricalData.categories
					.filter((d) => !!d.source.roles[EDataRolesName.Category])
					.forEach((d) => {
						if (!d["isIdToCategoryAdded"]) {
							d.values = d.values.map((d: string, i: number) => {
								if (d.split("-").length === 2) {
									return d;
								} else {
									return d + "-" + i.toString();
								}
							});
							d["isIdToCategoryAdded"] = true;
						}
					});

				this.expandAllCategoriesName = categoricalCategoriesFields
					.map((d) => d.source.displayName)
					.slice(0, categoricalCategoriesFields.length - 1)
					.reverse();
			}

			this.expandAllCode();

			const { height: footerHeight } = this.createFooter(this.footerSettings, this.chartContainer);
			this.footerHeight = this.footerSettings.show ? footerHeight : 0;

			const isHasSubcategories = !!this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);

			if (!isHasSubcategories) {
				this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i) => {
					const selectionId = this.vizOptions.host
						.createSelectionIdBuilder()
						.withCategory(this.categoricalData.categories[this.categoricalCategoriesLastIndex] as any, i)
						.createSelectionId();
					this.selectionIdByCategories[category] = selectionId;
				});
			} else {
				const categoricalData = this.vizOptions.options.dataViews[0];
				const series: any[] = categoricalData.categorical.values.grouped();
				this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i: number) => {
					const selectionId = this.vizOptions.host
						.createSelectionIdBuilder()
						.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
						.createSelectionId();

					this.selectionIdByCategories[category] = selectionId;

					series.forEach((ser: any, j: number) => {
						ser.values.forEach((s) => {
							const seriesSelectionId = this.vizOptions.host
								.createSelectionIdBuilder()
								.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
								.withSeries(categoricalData.categorical.values, ser)
								.withMeasure(s.source.queryName)
								.createSelectionId();

							this.selectionIdBySubCategories[`${category}-${ser.name}`] = seriesSelectionId as any;
						});
					});
				});
			}

			this.categoricalData = this.setInitialChartData(
				clonedCategoricalData,
				clonedCategoricalData,
				JSON.parse(JSON.stringify(this.vizOptions.options.dataViews[0].metadata)),
				vizOptions.options.viewport.width,
				vizOptions.options.viewport.height
			);

			this.conditionalFormattingConditions
				.forEach((cf: IConditionalFormattingProps) => {
					if (cf.applyTo === "measure") {
						const roles = this.categoricalData.values.find(d => d.source.displayName === cf.sourceName && (d.source.roles[EDataRolesName.Measure] || d.source.roles[EDataRolesName.Tooltip])).source.roles;
						cf.measureType = {
							measure: roles[EDataRolesName.Measure],
							measure1: cf.sourceName === this.categoricalData.values[0].source.displayName,
							measure2: this.isHasMultiMeasure ? cf.sourceName === this.categoricalData.values[1].source.displayName : false,
							tooltip: roles[EDataRolesName.Tooltip]
						};
					} else if (cf.applyTo === "category") {
						cf.categoryType = { [EDataRolesName.Category]: cf.sourceName === this.categoryDisplayName, [EDataRolesName.SubCategory]: cf.sourceName === this.subCategoryDisplayName };
					}
				});

			if (this.isHorizontalBrushDisplayed) {
				this.brushHeight = this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaHeight : 10;
			}

			if (this.isVerticalBrushDisplayed) {
				this.brushWidth = this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaWidth : 10;
			}

			if (!this.isScrollBrushDisplayed) {
				this.sortSubcategoryData();
				this.setCategoricalDataFields(this.categoricalData);
				this.setChartData(this.categoricalData);
			}

			const popupOptions = document.querySelector(".popup-options");
			const popupOptionsHeader = document.querySelector(".popup-options-header");
			this.settingsPopupOptionsWidth = popupOptions ? (popupOptions.clientWidth ? popupOptions.clientWidth : 0) : 0;
			this.settingsPopupOptionsHeight = popupOptions ? (popupOptions.clientHeight ? popupOptions.clientHeight : 0) : 0;
			this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0;
			this.settingsBtnHeight = popupOptionsHeader ? popupOptionsHeader.clientHeight : 0;
			this.isDisplayLegend2 = this.isHasMultiMeasure && this.chartSettings.lollipopType !== LollipopType.Circle;

			const { titleFontSize: xAxisTitleFontSize, titleFontFamily: xAxisTitleFontFamily } = this.xAxisSettings;
			const { titleFontSize: yAxisTitleFontSize, titleFontFamily: yAxisTitleFontFamily } = this.xAxisSettings;

			this.xAxisTitleSize = this.xAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", xAxisTitleFontFamily, xAxisTitleFontSize)
				: { width: 0, height: 0 };
			this.yAxisTitleSize = this.yAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", yAxisTitleFontFamily, yAxisTitleFontSize)
				: { width: 0, height: 0 };

			this.xAxisTitleMargin = this.xAxisSettings.isDisplayTitle ? 10 : 0;
			this.yAxisTitleMargin = this.yAxisSettings.isDisplayTitle ? 10 : 0;

			this.setColorsByDataColorsSettings();

			if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
				this.setRemainingAsOthersDataColor();
			}

			if (this.conditionalFormattingConditions.length) {
				this.setConditionalFormattingColor();
			}

			if (this.chartData.length) {
				this.subCategories = this.chartData[0].subCategories
					.map((d) => ({
						name: d.category,
						color1: d.styles.pie1.color,
						color2: d.styles.pie2.color
					}));
			}

			if (!this.legend1) {
				this.createLegendContainer(LegendType.Legend1);
			}

			if (!this.legend2) {
				this.createLegendContainer(LegendType.Legend2);
			}

			if (this.legendSettings.show && (this.chartSettings.lollipopType !== LollipopType.Circle || this.isHasMultiMeasure)) {
				d3.select("div.legend-wrapper").style("display", "block");
				this.setLegendsData();
				this.legendSettings.legendColor = this.getColor(this.legendSettings.legendColor, EHighContrastColorType.Foreground);

				// this.renderLegends()

				this.legends = renderLegends(
					this,
					this.chartContainer,
					this.isHasSubcategories ? this.subCategoryDisplayName : this.categoryDisplayName,
					this.legends1Data,
					this.legendSettings,
					this.patternSettings.enabled,
				);

				this.updateChartDimensions(this.legends.legendWrapper);
			} else {
				d3.select("div.legend-wrapper").style("display", "none");
				clearLegends();
				this.legendViewPort.width = 0;
				this.legendViewPort.height = 0;
				this.legendViewPortWidth = 0;
				this.legendViewPortHeight = 0;
			}

			this.setMargins();

			this.svg
				.attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
				.attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight);

			this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			if (this.isScrollBrushDisplayed) {
				this.drawXYAxis();
				this.displayBrush();
			} else {
				this.drawXYAxis();

				if (this.categoricalCategoriesLastIndex > 0) {
					if (!this.isHorizontalChart) {
						RenderExpandAllXAxis(this, this.categoricalData);
					} else {
						RenderExpandAllYAxis(this, this.categoricalData);
					}
				}
			}

			if (this.isExpandAllApplied) {
				if (!this.isHorizontalChart) {
					if (this.isBottomXAxis) {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (this.height + this.xScaleGHeight) + "px" + ")");
					} else {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-this.xScaleGHeight - this.expandAllXScaleGHeight) + "px" + ")");
					}

					CallExpandAllXScaleOnAxisGroup(this, this.scaleBandWidth, this.height);
				} else {
					if (this.isLeftYAxis) {
						this.expandAllYAxisG.style("transform", "translate(" + -this.expandAllYScaleGWidth + "px" + "," + 0 + "px" + ")");
					} else {
						this.expandAllYAxisG.style("transform", "translate(" + (this.height + this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
					}
					CallExpandAllYScaleOnAxisGroup(this, this.width * 0.06);
				}
			}

			this.drawLollipopChart();
			this.setSummaryTableConfig();
			RenderLollipopAnnotations(this, GetAnnotationDataPoint.bind(this));

			if (this.brushAndZoomAreaSettings.enabled) {
				const min = d3.min(clonedCategoricalData.values, (d: any) => d3.min(d.values, v => +v));
				const max = d3.max(clonedCategoricalData.values, (d: any) => d3.max(d.values, v => +v));
				const brushScaleBandwidth = this.brushScaleBand.bandwidth();

				if (this.isHorizontalChart) {
					this.brushXScale = d3.scaleLinear().range([brushScaleBandwidth / 3, this.brushAndZoomAreaWidth - brushScaleBandwidth / 3]).domain([min, max]);
					this.brushYScale = this.brushScaleBand.copy(true);
					this.drawBrushLollipopChart(clonedCategoricalData);
				} else {
					this.brushXScale = this.brushScaleBand.copy(true);
					this.brushYScale = d3.scaleLinear().range([this.brushAndZoomAreaHeight - brushScaleBandwidth / 3, brushScaleBandwidth / 3]).domain([min, max]);
					this.drawBrushLollipopChart(clonedCategoricalData);
				}
			} else {
				this.brushLollipopG.selectAll("*").remove();
			}

			if (this.brushAndZoomAreaSettings.enabled && this.brushAndZoomAreaSettings.isShowAxis) {
				if (this.isScrollBrushDisplayed) {
					if (this.isHorizontalBrushDisplayed) {
						this.drawBrushXAxis();
						this.brushYAxisG.selectAll("*").remove();
					} else if (this.isVerticalBrushDisplayed) {
						this.drawBrushYAxis();
						this.brushXAxisG.selectAll("*").remove();
					}
				}
			} else {
				this.brushXAxisG.selectAll("*").remove();
				this.brushYAxisG.selectAll("*").remove();
			}

			// this.displayBrush();
			// this.drawTooltip();

			createPatternsDefs(this, this.svg);

			if (!this.isHasSubcategories) {
				SetAndBindChartBehaviorOptions(this, this.lollipopSelection, d3.selectAll(".lollipop-line"), this.chartData);
			} else {
				SetAndBindChartBehaviorOptions(this, d3.selectAll(".pie-slice"), d3.selectAll(".lollipop-line"), this.chartData);
			}
			this.behavior.renderSelection(this.interactivityService.hasSelection());
		} catch (error) {
			console.error("Error", error);
		}
	}

	setConditionalFormattingColor(): void {
		this.chartData.forEach((d) => {
			if (!this.isHasSubcategories) {
				const conditionalFormattingResult = isConditionMatch(d.category, undefined, d.value1, d.value2, d.tooltipFields, this.conditionalFormattingConditions);
				if (conditionalFormattingResult.match) {
					if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
						d.styles.circle1.fillColor = conditionalFormattingResult.color;
					} else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
						d.styles.circle2.fillColor = conditionalFormattingResult.color;
					} else {
						d.styles.circle1.fillColor = conditionalFormattingResult.color;
						d.styles.circle2.fillColor = conditionalFormattingResult.color;
					}
				}
			} else {
				d.subCategories.forEach((s) => {
					const conditionalFormattingResult = isConditionMatch(d.category, s.category, s.value1, s.value2, s.tooltipFields, this.conditionalFormattingConditions);
					if (conditionalFormattingResult.match) {
						if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
							s.styles.pie1.color = conditionalFormattingResult.color;
						} else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
							s.styles.pie2.color = conditionalFormattingResult.color;
						} else {
							s.styles.pie1.color = conditionalFormattingResult.color;
							s.styles.pie2.color = conditionalFormattingResult.color;
						}
					}
				});
			}
		});
	}

	public updateChartDimensions(legendContainer: any): void {
		switch (this.legendSettings.legendPosition) {
			case ELegendPosition.TopLeft:
			case ELegendPosition.TopCenter:
			case ELegendPosition.TopRight:
				this.legendViewPort.width = 0;
				this.legendViewPort.height = legendContainer.node().getBoundingClientRect().height;
				this.svg.style("top", this.legendViewPort.height + "px");
				this.svg.style("left", 0 + "px");
				break;
			case ELegendPosition.BottomLeft:
			case ELegendPosition.BottomCenter:
			case ELegendPosition.BottomRight:
				this.legendViewPort.width = 0;
				this.legendViewPort.height = legendContainer.node().getBoundingClientRect().height;
				this.svg.style("top", 0 + "px");
				this.svg.style("left", 0 + "px");
				break;
			case ELegendPosition.LeftTop:
			case ELegendPosition.LeftCenter:
			case ELegendPosition.LeftBottom:
				this.legendViewPort.width = legendContainer.node().getBoundingClientRect().width;
				this.legendViewPort.height = 0;
				this.svg.style("top", 0 + "px");
				this.svg.style("left", this.legendViewPort.width + "px");
				break;
			case ELegendPosition.RightTop:
			case ELegendPosition.RightCenter:
			case ELegendPosition.RightBottom:
				this.legendViewPort.width = legendContainer.node().getBoundingClientRect().width;
				this.legendViewPort.height = 0;
				this.svg.style("top", 0 + "px");
				this.svg.style("left", 0 + "px");
				break;
		}
	}

	private sortSubcategoryData(): void {
		const { enabled, sortOrder, sortBy, isSortByCategory } = this.sortingSettings.subCategory;
		if (enabled && this.isHasSubcategories) {
			if (isSortByCategory) {
				if (this.isHorizontalChart) {
					if (sortOrder === ESortOrderTypes.DESC) {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					} else {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					}
				} else {
					if (sortOrder === ESortOrderTypes.ASC) {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					} else {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					}
				}
			} else {
				const clonedCategoricalDataValues: powerbi.DataViewValueColumn[] = JSON.parse(JSON.stringify(this.categoricalData.values));
				const displayNames = clonedCategoricalDataValues.map((d) => d.source.displayName);

				if (displayNames.includes(sortBy)) {
					const categoricalValuesBySort = clonedCategoricalDataValues.filter((d) => d.source.displayName === sortBy);
					categoricalValuesBySort.forEach((d) => {
						d["total"] = d3.sum(d.values, (v) => +v);
					});

					if (sortOrder === ESortOrderTypes.DESC) {
						categoricalValuesBySort.sort((a, b) => b["total"] - a["total"]);
					} else {
						categoricalValuesBySort.sort((a, b) => a["total"] - b["total"]);
					}

					const sortedGroupNames: string[] = categoricalValuesBySort.map((d) => d.source.groupName as string);
					sortedGroupNames.forEach((d, i) => {
						const valuesByGroupName = clonedCategoricalDataValues.filter((v) => v.source.groupName === d);
						valuesByGroupName.forEach((v, j) => {
							this.categoricalData.values[i * valuesByGroupName.length + j] = v;
						});
					});
				}
			}
		}

		const categoricalMeasureFields = this.categoricalData.values
			? this.categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure])
			: [];

		this.subCategoriesName = categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];
	}

	public renderErrorMessages(): boolean {
		const categoricalCategoriesFields = this.categoricalData.categories
			? !!this.categoricalData.categories.find((d) => d.source.roles[EDataRolesName.Category])
			: false;
		if (!categoricalCategoriesFields) {
			this.displayValidationPage("Add at least one dimension in the Category field");
			this._events.renderingFailed(this.vizOptions.options, "Add at least one dimension in the Category field");
			return true;
		}

		if (this.handleLandingPage(this.vizOptions)) {
			return true;
		}

		const categoricalMeasureFields = this.vizOptions.options.dataViews[0].categorical.values
			? this.vizOptions.options.dataViews[0].categorical.values.filter(
				(d) => !!d.source.roles[EDataRolesName.Measure]
				// eslint-disable-next-line no-mixed-spaces-and-tabs
			)
			: [];
		if (categoricalMeasureFields.length === 0) {
			this.displayValidationPage("Please enter measure data");
			this._events.renderingFailed(this.vizOptions.options, "Please enter measure data");
			return true;
		}

		const categoricalCategoryFields = this.categoricalData.categories.filter((d) => d.source.roles[EDataRolesName.Category]);
		if (!categoricalCategoryFields.some((d) => d.values.length > 1) && categoricalMeasureFields[0].values.length === 0) {
			this.displayValidationPage("Empty measure and category");
			this._events.renderingFailed(this.vizOptions.options, "Empty measure and category");
			return true;
		}

		return false;
	}

	public handleLandingPage(vizOptions: ShadowUpdateOptions) {
		const propInfo = {
			title: "Lollipop Chart",
			versionInfo: "1.0.0.0",
			description:
				"Lollipop Chart is an Intuitive Visual for displaying a progression of data. It is used to indicate where your data point falls over a particular range. This can help to identify the relative performance of categories for a direct visual comparison in radial bars. The multiple gauge series arcing around the center point, similar to the activity chart found on the Apple Watch.",
			sliderImages: [],
		};

		if (
			vizOptions.options.dataViews[0].categorical.categories &&
			vizOptions.options.dataViews[0].categorical.categories.length === 0 &&
			vizOptions.options.dataViews[0].categorical.values &&
			vizOptions.options.dataViews[0].categorical.values.length === 0
		) {
			this.showLandingPage(propInfo);
			return true;
		} else {
			this.hideLandingPage();
		}
		return false;
	}

	setMargins(): void {
		if (this.xAxisSettings.position === Position.Bottom) {
			this.margin.bottom = this.xScaleGHeight + this.xAxisTitleSize.height + this.xAxisTitleMargin + this.brushHeight + this.expandAllXScaleGHeight + this.brushXAxisTicksMaxHeight;
			this.margin.top = 0;
		} else if (this.xAxisSettings.position === Position.Top) {
			this.margin.bottom = this.brushHeight + this.brushXAxisTicksMaxHeight;
			this.margin.top = this.xScaleGHeight + this.xAxisTitleSize.height + this.xAxisTitleMargin + this.expandAllXScaleGHeight;
		}

		if (this.yAxisSettings.position === Position.Left) {
			this.margin.left = this.yScaleGWidth + this.yAxisTitleSize.width + this.yAxisTitleMargin + this.expandAllYScaleGWidth;
			this.margin.right = this.brushWidth + this.brushYAxisTicksMaxWidth;
		} else if (this.yAxisSettings.position === Position.Right) {
			this.margin.left = this.yAxisTitleMargin;
			this.margin.right = this.yScaleGWidth + this.yAxisTitleSize.width + this.yAxisTitleMargin + this.brushWidth + this.expandAllYScaleGWidth + this.brushYAxisTicksMaxWidth;
		}

		this.setChartWidthHeight();
	}

	setChartData(categoricalData: powerbi.DataViewCategorical): void {
		// if (this.isExpandAllApplied) {
		// 	this.categoricalCategoriesFields.forEach((d) => {
		// 		if (!d["isIdToCategoryAdded"]) {
		// 			d.values = d.values.map((d: string, i: number) => {
		// 				if (d.split("-").length === 2) {
		// 					return d;
		// 				} else {
		// 					return d + "-" + i.toString();
		// 				}
		// 			});
		// 			d["isIdToCategoryAdded"] = true;
		// 		}
		// 	});
		// }

		this.categoriesName = this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].values.filter(
			(v, i, a) => a.findIndex((t) => t === v) === i
		) as string[];

		const measureGroup = d3.group(this.categoricalMeasureFields, (d) => d.source.displayName);
		const subCategoriesGroup = d3.group(categoricalData.values, (d) => d.source.groupName);

		const getSubCategoryData = (idx: number): IChartSubCategory[] => {
			const data = this.subCategoriesName.reduce((arr, cur, i) => {
				const subCategoryGroup = subCategoriesGroup.get(cur);
				const obj: IChartSubCategory = {
					category: cur,
					value1: <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure1DisplayName).values[idx]
					),
					value2: <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure2DisplayName).values[idx]
					),
					tooltipFields: subCategoryGroup
						.filter((d) => d.source.roles[EDataRolesName.Tooltip])
						.map((d) => ({ displayName: d.source.displayName, value: d.values[idx], color: "" } as TooltipData)),
					styles: {
						pie1: { color: "" },
						pie2: { color: "" },
					},
					selected: false,
					isHighlight: !!subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure1DisplayName).highlights[idx]
				};
				return [...arr, obj];
			}, []);
			return data;
		};

		const data: ILollipopChartRow[] = this.categoriesName.map((cat, idx) => ({
			category: <string>cat,
			value1: !this.isHasSubcategories ? <number>this.categoricalMeasure1Field.values[idx] : 0,
			value2: this.isHasMultiMeasure ? (!this.isHasSubcategories ? <number>this.categoricalMeasure2Field.values[idx] : 0) : 0,
			identity: undefined,
			selected: false,
			isHighlight: this.categoricalMeasure1Field.highlights ? !!this.categoricalMeasure1Field.highlights[idx] : false,
			tooltipFields: this.categoricalTooltipFields.map((d) => ({ displayName: d.source.displayName, value: d.values[idx], color: "" } as TooltipData)),
			subCategories: this.isHasSubcategories ? getSubCategoryData(idx) : [],
			styles: {
				circle1: { fillColor: "", strokeColor: "" },
				circle2: { fillColor: "", strokeColor: "" },
				line: { color: this.lineSettings.lineColor },
				pie1: { color: "" },
				pie2: { color: "" },
			},
		}));

		if (this.isHasSubcategories) {
			data.forEach((d) => {
				if (d.subCategories.length) {
					d.value1 = d3.sum(d.subCategories, (cat) => cat.value1);
					d.value2 = d3.sum(d.subCategories, (cat) => cat.value2);
				}
			});
		}

		// const category = this.categoricalData.categories[0];
		// data.forEach((d, i) => {
		// 	const selectionId: ISelectionId = this.vizOptions.host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();
		// 	d.selectionId = selectionId;
		// });
		// data.forEach((d, i) => {
		// 	d.subCategories.forEach((subCategory) => {
		// 		const selectionId: ISelectionId = this.vizOptions.host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();
		// 		subCategory.selectionId = selectionId;
		// 	});
		// });

		this.setSelectionIds(data, []);
		this.chartData = data;
		if (this.patternSettings.enabled) {
			this.setVisualPatternData();
		}

		this.categoryPatterns = this.chartData
			.map((d) => ({
				name: d.category,
				patternIdentifier: d.pattern ? d.pattern.patternIdentifier ? d.pattern.patternIdentifier : "" : "",
				isImagePattern: d.pattern ? d.pattern.isImagePattern ? d.pattern.isImagePattern : false : false,
				dimensions: d.pattern ? d.pattern.dimensions ? d.pattern.dimensions : undefined : undefined,
			}));

		if (this.isHasSubcategories) {
			this.subCategoryPatterns = this.chartData[0].subCategories
				.map((d) => ({
					name: d.category,
					patternIdentifier: d.pattern ? d.pattern.patternIdentifier ? d.pattern.patternIdentifier : "" : "",
					isImagePattern: d.pattern ? d.pattern.isImagePattern ? d.pattern.isImagePattern : false : false,
					dimensions: d.pattern ? d.pattern.dimensions ? d.pattern.dimensions : undefined : undefined,
				}));
		}
	}

	setSelectionIds(data: ILollipopChartRow[], subCategories: { name: string }[]): void {
		if (!this.isHasSubcategories) {
			data.forEach((el, i) => {
				el.identity = this.selectionIdByCategories[el.category];
			});
		} else {
			data.forEach((el: ILollipopChartRow, i: number) => {
				el.identity = this.selectionIdByCategories[el.category];
				el.subCategories.forEach((d) => {
					d.identity = this.selectionIdBySubCategories[`${el.category}-${d.category}`];
				});
			});
		}
	}

	public createLegendContainer(legendType: LegendType): void {
		this[legendType] = createLegend(
			this.hostContainer,
			false,
			null,
			true,
			LegendPosition[this.legendSettings.legendPosition] ? LegendPosition[this.legendSettings.legendPosition] : LegendPosition.Top
		);
	}

	setVisualSettings(): void {
		const formatTab = this.vizOptions.formatTab;

		const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
		this.chartSettings = {
			...CHART_SETTINGS,
			...chartConfig,
		};

		const circleConfig = JSON.parse(formatTab[EVisualConfig.CircleConfig][EVisualSettings.CircleSettings]);
		this.circleSettings = {
			...CIRCLE_SETTINGS,
			...circleConfig,
		};

		const lineConfig = JSON.parse(formatTab[EVisualConfig.LineConfig][EVisualSettings.LineSettings]);
		this.lineSettings = {
			...LINE_SETTINGS,
			...lineConfig,
		};

		const clonedDataLabelsSettings = JSON.parse(JSON.stringify(this.dataLabelsSettings ? this.dataLabelsSettings : {}));
		const dataLabelsConfig = JSON.parse(formatTab[EVisualConfig.DataLabelsConfig][EVisualSettings.DataLabelsSettings]);
		this.dataLabelsSettings = {
			...DATA_LABELS_SETTINGS,
			...dataLabelsConfig,
		};

		this.legendSettings = formatTab[EVisualSettings.Legend];
		this.numberSettings = formatTab[EVisualSettings.NumberFormatting];
		this.footerSettings = formatTab[EVisualSettings.Footer];

		const xAxisConfig = JSON.parse(formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings]);
		this.xAxisSettings = {
			...X_AXIS_SETTINGS,
			...xAxisConfig,
		};

		const yAxisConfig = JSON.parse(formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings]);
		this.yAxisSettings = {
			...Y_AXIS_SETTINGS,
			...yAxisConfig,
		};

		const gridLinesConfig = JSON.parse(formatTab[EVisualConfig.GridLinesConfig][EVisualSettings.GridLinesSettings]);
		this.gridSettings = {
			...GRID_LINES_SETTINGS,
			...gridLinesConfig,
		};

		// Data Colors Settings
		// if (this.chartSettings.lollipopType === LollipopType.Circle) {
		//     DATA_COLORS.dataType = CircleType.Circle1;
		// } else {
		//     DATA_COLORS.dataType = PieType.Pie1;
		// }

		if (this.isHasMultiMeasure) {
			DATA_COLORS.circle1.fillType = ColorPaletteType.Single;
			DATA_COLORS.circle2.fillType = ColorPaletteType.Single;
		}

		const dataColorsConfig = JSON.parse(formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings]);
		this.dataColorsSettings = {
			...DATA_COLORS,
			...dataColorsConfig,
		};

		const clonedRankingSettings = JSON.parse(JSON.stringify(this.rankingSettings ? this.rankingSettings : {}));
		const rankingConfig = JSON.parse(formatTab[EVisualConfig.RankingConfig][EVisualSettings.RankingSettings]);
		this.rankingSettings = {
			...RANKING_SETTINGS,
			...rankingConfig,
		};
		this.isRankingSettingsChanged = JSON.stringify(clonedRankingSettings) !== JSON.stringify(this.rankingSettings);

		const sortingConfig = JSON.parse(this.vizOptions.formatTab[EVisualConfig.SortingConfig][EVisualSettings.Sorting]);
		this.sortingSettings = {
			...SORTING_SETTINGS,
			...sortingConfig,
		};

		const brushAndZoomAreaConfig = JSON.parse(this.vizOptions.formatTab[EVisualConfig.BrushAndZoomAreaConfig][EVisualSettings.BrushAndZoomAreaSettings]);
		this.brushAndZoomAreaSettings = {
			...BRUSH_AND_ZOOM_AREA_SETTINGS,
			...brushAndZoomAreaConfig,
		};

		const patternConfig = JSON.parse(formatTab[EVisualConfig.PatternConfig][EVisualSettings.PatternSettings]);
		this.patternSettings = {
			...PATTERN_SETTINGS,
			...patternConfig,
		};

		this.changeVisualSettings();

		// if (!this.isHasSubcategories) {
		// 	this.chartSettings.lollipopType = LollipopType.Circle;
		// 	CHART_SETTINGS.isLollipopTypeChanged = false;
		// 	this.chartSettings.isLollipopTypeChanged = false;
		// 	const chartConfig: IChartSettings = {...this.chartSettings, lollipopType: LollipopType.Circle, isLollipopTypeChanged: false};
		// 	formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings] = JSON.stringify(chartConfig);
		// 	const dataColorsConfig: IDataColorsSettings = {...this.dataColorsSettings, dataType: CircleType.Circle1};
		// 	formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings] = JSON.stringify(dataColorsConfig);
		// } else {
		// 	if (!this.chartSettings.isLollipopTypeChanged) {
		// 		this.chartSettings.lollipopType = LollipopType.Donut;
		// 		const chartConfig: IChartSettings = {...this.chartSettings, lollipopType: LollipopType.Donut};
		// 		formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings] = JSON.stringify(chartConfig);
		// 		const dataColorsConfig: IDataColorsSettings = {...this.dataColorsSettings, dataType: PieType.Pie1};
		// 		formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings] = JSON.stringify(dataColorsConfig);
		// 	}
		// }

		// if (!Object.keys(clonedDataLabelsSettings).length || this.chartSettings.lollipopType !== LollipopType.Circle) {
		// 	const color = this.dataLabelsSettings.color;
		// 	if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
		// 		this.dataLabelsSettings.color = "rgb(102,102,102)";
		// 	}
		// }
	}

	changeVisualSettings(): void {
		this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;
		this.circle1Settings = this.circleSettings.circle1;
		this.circle2Settings = this.circleSettings.circle2;
		this.xGridSettings = this.gridSettings.xGridLines;
		this.yGridSettings = this.gridSettings.yGridLines;
		this.pie1Settings = this.chartSettings.pieSettings.pie1;
		this.pie2Settings = this.chartSettings.pieSettings.pie2;
		this.isPatternApplied = this.isHasSubcategories && this.patternSettings.enabled && this.patternSettings.subCategoryPatterns.some(d => d.patternIdentifier !== "NONE" && d.patternIdentifier !== "");

		// if (this.rankingSettings.isRankingEnabled) {
		// 	this.setChartDataByRanking();
		// }
	}

	setVisualPatternData(): void {
		this.chartData.forEach((d) => {
			d.pattern = this.patternSettings.categoryPatterns.find((p) => p.name === d.category);
		});

		this.chartData.forEach((d) => {
			d.subCategories.forEach((s) => {
				s.pattern = this.patternSettings.subCategoryPatterns.find((p) => p.name === s.category);
			});
		});
	}

	setChartDataByRanking(): void {
		// const rankingSettings = this.rankingSettings[this.isHasMultiMeasure ? this.rankingSettings.valueType : RankingDataValuesType.Value1];
		// if (!rankingSettings.showRemainingAsOthers) {
		// 	if (rankingSettings.filterType === RankingFilterType.TopN) {
		// 		this.chartData = this.chartData.slice(0, rankingSettings.count);
		// 	}
		// 	if (rankingSettings.filterType === RankingFilterType.BottomN) {
		// 		if (rankingSettings.count <= this.chartData.length) {
		// 			this.chartData = this.chartData.slice(this.chartData.length - rankingSettings.count, this.chartData.length);
		// 		}
		// 	}
		// }
		// if (this.chartSettings.lollipopType !== LollipopType.Circle && rankingSettings.isSubcategoriesRanking) {
		// 	const valueType = this.rankingSettings.valueType === RankingDataValuesType.Value1 ? RankingDataValuesType.Value1 : RankingDataValuesType.Value2;
		// 	this.chartData.forEach((data) => {
		// 		data.subCategories.sort((a, b) => b[valueType] - a[valueType]);
		// 	});
		// 	if (!rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
		// 			this.chartData.forEach((data) => {
		// 				data.subCategories = data.subCategories.slice(0, rankingSettings.subCategoriesRanking.count);
		// 			});
		// 		}
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
		// 			this.chartData.forEach((data) => {
		// 				if (rankingSettings.subCategoriesRanking.count <= data.subCategories.length) {
		// 					data.subCategories = data.subCategories.slice(
		// 						data.subCategories.length - rankingSettings.subCategoriesRanking.count,
		// 						data.subCategories.length
		// 					);
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// if (this.rankingSettings.isRankingEnabled) {
		// 	const subCategories = [];
		// 	this.subCategories = [];
		// 	this.chartData.forEach((data) => {
		// 		data.subCategories.forEach((sub) => {
		// 			const isAlreadyHasCategory = this.subCategories.some((d) => d.name === sub.category);
		// 			if (!isAlreadyHasCategory) {
		// 				subCategories.push({name: sub.category, color1: "", color2: ""});
		// 			}
		// 		});
		// 	});
		// 	this.subCategories = subCategories;
		// }
	}

	setRemainingAsOthersDataColor(): void {
		// const rankingSettings = this.rankingSettings.category;
		// const subCategoriesRanking = this.rankingSettings.subCategory;
		// if (rankingSettings.showRemainingAsOthers) {
		// 	if (rankingSettings.rankingType === ERankingType.TopN) {
		// 		this.chartData.forEach((d, i) => {
		// 			if (i + 1 > rankingSettings.count) {
		// 				d.styles.circle1.fillColor = rankingSettings.othersColor;
		// 				d.styles.circle1.strokeColor = rankingSettings.othersColor;
		// 				d.styles.circle2.fillColor = rankingSettings.othersColor;
		// 				d.styles.circle2.strokeColor = rankingSettings.othersColor;
		// 				d.styles.line.color = rankingSettings.othersColor;
		// 				d.subCategories.forEach((s) => {
		// 					s.styles.pie1.color = rankingSettings.othersColor;
		// 					s.styles.pie2.color = rankingSettings.othersColor;
		// 				});
		// 			}
		// 		});
		// 	}
		// 	if (rankingSettings.rankingType === ERankingType.BottomN) {
		// 		if (rankingSettings.count <= this.chartData.length) {
		// 			this.chartData.forEach((d, i) => {
		// 				if (i < this.chartData.length - rankingSettings.count) {
		// 					d.styles.circle1.fillColor = rankingSettings.othersColor;
		// 					d.styles.circle1.strokeColor = rankingSettings.othersColor;
		// 					d.styles.circle2.fillColor = rankingSettings.othersColor;
		// 					d.styles.circle2.strokeColor = rankingSettings.othersColor;
		// 					d.styles.line.color = rankingSettings.othersColor;
		// 					d.subCategories.forEach((s) => {
		// 						s.styles.pie1.color = rankingSettings.othersColor;
		// 						s.styles.pie2.color = rankingSettings.othersColor;
		// 					});
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// if (rankingSettings.isSubcategoriesRanking && subCategoriesRanking.showRemainingAsOthers) {
		// 	if (this.chartSettings.lollipopType !== LollipopType.Circle) {
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
		// 			this.chartData.forEach((data, i1) => {
		// 				if (i1 + 1 <= rankingSettings.count) {
		// 					data.subCategories.forEach((d, i2) => {
		// 						if (i2 + 1 > subCategoriesRanking.count) {
		// 							d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
		// 							d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
		// 						}
		// 					});
		// 				}
		// 			});
		// 		}
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
		// 			this.chartData.forEach((data, i1) => {
		// 				if (i1 > this.chartData.length - rankingSettings.count) {
		// 					data.subCategories.forEach((d, i2) => {
		// 						if (i2 < data.subCategories.length - subCategoriesRanking.count) {
		// 							d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
		// 							d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
		// 						}
		// 					});
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// this.setSubCategoriesColor(LegendType.Legend1);
		// if (this.isDisplayLegend2) {
		// 	this.setSubCategoriesColor(LegendType.Legend2);
		// }
	}

	setColorsByDataColorsSettings(): void {
		if (this.chartSettings.lollipopType === LollipopType.Circle) {
			this.setCircleColors();
		} else {
			this.setPieColors(PieType.Pie1);
			if (this.isHasMultiMeasure) {
				this.setPieColors(PieType.Pie2);
			}
		}
		this.setSubCategoriesColor(LegendType.Legend1);
		if (this.isDisplayLegend2) {
			this.setSubCategoriesColor(LegendType.Legend2);
		}
	}

	setCircleColors(): void {
		const colorsSettings = this.dataColorsSettings.circle1;
		if (this.isHasMultiMeasure) {
			const circle1Colors = this.dataColorsSettings.circle1;
			const circle2Colors = this.dataColorsSettings.circle2;
			this.chartData.forEach((data) => {
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
				this.chartData.forEach((data) => {
					data.styles.circle1.fillColor = colorsSettings.circleFillColor;
					data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
				});
				break;
			}
			case ColorPaletteType.PowerBi: {
				this.chartData.forEach((data) => {
					// let colorCode = this.colorPalette.getColor(data.category).value.split('#')[1];
					// const circleFillColor = '#F2' + colorCode;
					data.styles.circle1.fillColor = this.colorPalette.getColor(data.category).value;
					data.styles.circle1.strokeColor = this.colorPalette.getColor(data.category).value;
				});
				break;
			}
			case ColorPaletteType.Gradient: {
				const categoryDataLength = this.chartData.length;
				const domain =
					colorsSettings.midcolor && categoryDataLength > 2 ? [1, Math.round(categoryDataLength / 2), categoryDataLength] : [1, categoryDataLength];
				const range: any =
					colorsSettings.midcolor && categoryDataLength > 2
						? [colorsSettings.fillmax, colorsSettings.fillmid, colorsSettings.fillmin]
						: [colorsSettings.fillmax, colorsSettings.fillmin];

				this.gradientColorScale.domain(domain).range(range);
				this.chartData.forEach((data, i) => {
					const color: string = this.gradientColorScale(i + 1) + "";
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
				this.chartData.forEach((data) => {
					// data.styles.circle1.fillColor = colorsSettings.circleFillColor;
					// data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
					data.subCategories.forEach((d) => {
						d.styles[pieType].color = pieColors.singleColor;
					});
				});
				break;
			}
			case ColorPaletteType.PowerBi: {
				this.chartData.forEach((data) => {
					data.subCategories.forEach((d) => {
						d.styles[pieType].color = this.colorPalette.getColor(d.category).value;
					});
				});
				break;
			}
			case ColorPaletteType.Gradient: {
				this.chartData.forEach((data) => {
					const subCategoryDataLength = data.subCategories.length;
					const range: any =
						pieColors.midcolor && subCategoryDataLength > 2
							? [pieColors.fillmax, pieColors.fillmid, pieColors.fillmin]
							: [pieColors.fillmax, pieColors.fillmin];
					const domain =
						pieColors.midcolor && subCategoryDataLength > 2
							? [1, Math.round(subCategoryDataLength / 2), subCategoryDataLength]
							: [1, subCategoryDataLength];
					this.gradientColorScale.domain(domain).range(range);
					data.subCategories.forEach((d, i) => {
						const color: string = this.gradientColorScale(i + 1) + "";
						d.styles[pieType].color = color;
					});
				});
				break;
			}
			case ColorPaletteType.ByCategory: {
				this.chartData.forEach((data) => {
					data.subCategories.forEach((d) => {
						const selectedCategoryName = pieColors.selectedCategoryName;
						d.styles[pieType].color = d.category === selectedCategoryName ? pieColors.selectedCategoryColor : pieColors.defaultColor;
					});
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
			this.chartData.forEach((data) => {
				data.subCategories.find((d) => {
					if (d.category === subCategoryName) {
						subCategory = d;
					}
				});
			});
			return subCategory ? subCategory.styles[isLegend2 ? PieType.Pie2 : PieType.Pie1].color : "#545454";
		};

		this.subCategories.forEach((cat) => {
			cat[isLegend2 ? "color2" : "color1"] = getSubCategoryColorByName(cat.name);
		});
	}

	setCircleSchemaColors(schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
		if (isReverse) {
			schemeColors = schemeColors.reverse();
		}

		if (isGradient) {
			const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];
			const domain = [1, this.chartData.length];
			this.gradientColorScale.domain(domain).range(range);
		}

		let colorIdx = -1;
		this.chartData.forEach((data, i) => {
			colorIdx++;
			if (colorIdx >= schemeColors.length) {
				colorIdx = 0;
			}
			if (isGradient) {
				const color = this.gradientColorScale(i + 1) + "";
				data.styles.circle1.fillColor = color;
				data.styles.circle1.strokeColor = color;
			} else {
				data.styles.circle1.fillColor = schemeColors[colorIdx];
				data.styles.circle1.strokeColor = schemeColors[colorIdx];
			}
		});
	}

	setPieSchemaColors(pieType: PieType, schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
		if (isReverse) {
			schemeColors = schemeColors.reverse();
		}
		const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];

		this.chartData.forEach((data) => {
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
					const color = this.gradientColorScale(i + 1) + "";
					d.styles[pieType].color = color;
				} else {
					d.styles[pieType].color = schemeColors[colorIdx];
				}
			});
		});
	}

	setChartWidthHeight(): void {
		const options = this.vizOptions;
		this.viewPortWidth = options.options.viewport.width;
		this.viewPortHeight = options.options.viewport.height;
		this.width = this.viewPortWidth - this.margin.left - this.margin.right - this.settingsBtnWidth - this.legendViewPort.width;
		this.height =
			this.viewPortHeight - this.margin.bottom - this.margin.top - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight;
	}

	displayBrush(): void {
		if (this.isHorizontalChart) {
			const newHeight = (this.brushScaleBandBandwidth * this.height) / this.brushScaleBand.bandwidth();
			if (this.height < newHeight) {
				this.drawVerticalBrush(this.categoricalData, this.brushScaleBandBandwidth, this.totalLollipopCount);
			} else {
				this.brushG.selectAll("*").remove();
			}
		} else {
			const newWidth = (this.brushScaleBandBandwidth * this.width) / this.brushScaleBand.bandwidth();
			if (this.width < newWidth) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				this.isVerticalBrushDisplayed = false;

				const brushXPos = this.margin.left ? this.margin.left : 0;
				const brushYPos = this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - this.legendViewPort.height;

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: brushXPos,
					brushYPos: brushYPos,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: this.width,
					scaleHeight: this.height,
					smallMultiplesGridItemId: null,
					categoricalData: this.categoricalData,
				};

				this.drawHorizontalBrush(this, config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		}
	}

	drawVerticalBrush(categoricalData: powerbi.DataViewCategorical, barDistance: number, totalBarsCount: number): void {
		categoricalData = JSON.parse(JSON.stringify(categoricalData));
		const yScaleDomain = this.brushScaleBand.domain();
		this.brushScaleBand.range(this.yScale.range());

		categoricalData.categories.forEach((d, i) => {
			if (i < categoricalData.categories.length - 1) {
				const yScaleCopy = this.yScale.copy();
				this[`${d.source.displayName}Scale`] = yScaleCopy;
				this[`${d.source.displayName}ScaleDomain`] = d.values;
			}
		});

		const brushed = ({ selection }) => {
			if (this.isExpandAllApplied) {
				this.expandAllCategoriesName.forEach((d) => {
					if (this[`${d}ScaleDomain`]) {
						this[`${d}ScaleNewDomain`] = [];
					}
				});
			}

			const newYScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.yScale.range();

			yScaleDomain.forEach((d, i) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newYScaleDomain.push(d);

					if (this.isExpandAllApplied) {
						this.expandAllCategoriesName.forEach((d) => {
							if (this[`${d}ScaleDomain`]) {
								this[`${d}ScaleNewDomain`].push(this[`${d}ScaleDomain`][i]);
							}
						});
					}
				}
			});

			this.newScaleDomainByBrush = newYScaleDomain;

			if (this.newScaleDomainByBrush.length < yScaleDomain.length || this.isExpandAllApplied) {
				const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
				const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
					this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
				);

				const categoricalData2 = JSON.parse(JSON.stringify(categoricalData));

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				this.sortSubcategoryData();
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.setColorsByDataColorsSettings();

				if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
					this.setRemainingAsOthersDataColor();
				}

				if (this.conditionalFormattingConditions.length) {
					this.setConditionalFormattingColor();
				}

				// this.lineSelection
				// 	.attr("y1", (d) => this.yScale(d.category))
				// 	.attr("y2", (d) => this.yScale(d.category))
				// 	.attr("opacategory", (d) => {
				// 		return this.yScale(d.category) ? 1 : 0;
				// 	});

				// this.circle1Selection
				// 	.attr("cy", (d) => this.yScale(this.isHorizontalChart ? d.category : d.value1))
				// 	.attr("opacategory", (d) => {
				// 		return this.yScale(d.category) ? 1 : 0;
				// 	});

				// this.circle2Selection
				// 	.attr("cy", (d) => this.yScale(this.isHorizontalChart ? d.category : d.value1))
				// 	.attr("opacategory", (d) => {
				// 		return this.yScale(d.category) ? 1 : 0;
				// 	});

				// this.yGridLinesSelection.attr("y1", (d) => this.yScale(d)).attr("y2", (d) => this.yScale(d));

				// if (this.yAxisSettings.position === Position.Left) {
				// 	this.yAxisG.attr("transform", `translate(0, 0)`).call(d3.axisLeft(this.yScale));
				// } else if (this.yAxisSettings.position === Position.Right) {
				// 	this.yAxisG.attr("transform", `translate(${this.width}, 0)`).call(d3.axisRight(this.yScale));
				// }

				this.drawXYAxis();

				if (this.isExpandAllApplied) {
					this.expandAllCategoriesName.forEach((d, i) => {
						this[`${d}Scale`].domain(this[`${d}ScaleNewDomain`]);
					});
				}

				CallExpandAllYScaleOnAxisGroup(this, this.width * 0.06);

				this.drawLollipopChart();

				// this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
				// if (this.isHasMultiMeasure) {
				// 	this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
				// }

				// this.updatePiePositionOnBrushMove();
			} else {
				this.isScrollBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.brushWidth = 0;
				this.drawXYAxis();
			}
		};

		const brush = d3
			.brushY()
			.extent([
				[0, 0],
				[this.brushWidth, this.height],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(this.height / barDistance);
		const totalBar = totalBarsCount;
		const heightByExpectedBar = (expectedBar * this.height) / totalBar;
		const xPos = this.viewPortWidth - this.brushWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width - this.brushYAxisTicksMaxWidth;

		this.brushG
			.attr(
				"transform",
				`translate(${xPos}, ${this.margin.top ? this.margin.top : 0
				})`
			)
			.call(brush)
			.call(brush.move, [0, heightByExpectedBar]);

		if (this.brushAndZoomAreaSettings.enabled) {
			this.brushG.selectAll("rect").attr("width", this.brushWidth).attr("rx", 0).attr("ry", 0);
		} else {
			this.brushG.selectAll("rect").attr("width", this.brushWidth).attr("rx", 4).attr("ry", 4).attr("cursor", "default");
			this.brushG.selectAll(".handle").remove();
		}

		this.brushG.select(".overlay")
			.attr("cursor", this.brushAndZoomAreaSettings.enabled ? "crosshair" : "default")
			.attr("pointer-events", this.brushAndZoomAreaSettings.enabled ? "auto" : "none");
	}

	drawHorizontalBrush(self: Visual, config: IBrushConfig): void {
		const smallMultiplesGridItemId = config.smallMultiplesGridItemId;
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const totalBarsCount: number = config.totalBarsCount;
		const scaleWidth: number = config.scaleWidth;
		const scaleHeight: number = config.scaleHeight;
		const categoricalData: any = JSON.parse(JSON.stringify(config.categoricalData));

		// const newWidth = (this.chartSettings.lollipopCategoryWidth * this.width / this.scaleBandWidth);
		const xScaleDomain = this.brushScaleBand.domain();
		this.brushScaleBand.range(this.xScale.range());

		categoricalData.categories.forEach((d, i) => {
			if (i < categoricalData.categories.length - 1) {
				const xScaleCopy = self.xScale.copy();
				self[d.source.displayName + "Scale"] = xScaleCopy;
				self[`${d.source.displayName}ScaleDomain`] = d.values;
			}
		});

		// const minPos = this.xScale(xScaleDomain[this.yAxisSettings.position === Position.Left ? 0 : xScaleDomain.length - 1]);
		const brushed = ({ selection }) => {
			if (this.isExpandAllApplied) {
				this.expandAllCategoriesName.forEach((d) => {
					if (self[`${d}ScaleDomain`]) {
						self[`${d}ScaleNewDomain`] = [];
					}
				});
			}

			const newXScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.xScale.range();

			xScaleDomain.forEach((d, i) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newXScaleDomain.push(d);

					if (self.isExpandAllApplied) {
						self.expandAllCategoriesName.forEach((d) => {
							if (self[`${d}ScaleDomain`]) {
								self[`${d}ScaleNewDomain`].push(self[`${d}ScaleDomain`][i]);
							}
						});
					}
				}
			});

			this.newScaleDomainByBrush = newXScaleDomain;

			if (this.newScaleDomainByBrush.length < xScaleDomain.length || this.isExpandAllApplied) {
				const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
				const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
					this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
				);

				const categoricalData2 = JSON.parse(JSON.stringify(categoricalData));

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				this.sortSubcategoryData();
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.setColorsByDataColorsSettings();

				if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
					this.setRemainingAsOthersDataColor();
				}

				if (this.conditionalFormattingConditions.length) {
					this.setConditionalFormattingColor();
				}

				this.drawXYAxis();

				if (self.isExpandAllApplied) {
					self.expandAllCategoriesName.forEach((d, i) => {
						self[`${d}Scale`].domain(self[`${d}ScaleNewDomain`]);
					});
				}

				CallExpandAllXScaleOnAxisGroup(this, scaleWidth, scaleHeight);

				this.drawLollipopChart();

				// if (this.xAxisSettings.position === Position.Bottom) {
				// 	this.xAxisG
				// 		.attr("transform", "translate(0," + this.height + ")")
				// 		.call(d3.axisBottom(this.xScale))
				// 		.selectAll("text");
				// } else if (this.xAxisSettings.position === Position.Top) {
				// 	this.xAxisG
				// 		.attr("transform", "translate(0," + 0 + ")")
				// 		.call(d3.axisTop(this.xScale))
				// 		.selectAll("text")
				// 		.attr("transform", `translate(-10, -10)rotate(${this.xAxisSettings.labelTilt})`);
				// }

				// this.setXAxisTickStyle();
				// this.drawData1Labels(this.chartData);
				// if (this.isHasMultiMeasure) {
				// 	this.drawData2Labels(this.chartData);
				// }
				// this.updatePiePositionOnBrushMove();
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushHeight = 0;
				this.drawXYAxis();
			}
		};

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[this.width, this.brushHeight],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleWidth / barDistance);
		const totalBar = totalBarsCount;
		let widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

		widthByExpectedBar = widthByExpectedBar > this.width ? this.width : widthByExpectedBar;

		d3.select(brushG)
			.attr("transform", `translate(${this.margin.left ? this.margin.left : 0}, ${brushYPos - this.brushXAxisTicksMaxHeight})`)
			.call(brush as any)
			.call(brush.move as any, [0, widthByExpectedBar]);

		if (this.brushAndZoomAreaSettings.enabled) {
			d3.select(brushG).selectAll("rect").attr("height", self.brushHeight).attr("rx", 0).attr("ry", 0);
		} else {
			d3.select(brushG).selectAll("rect").attr("height", self.brushHeight).attr("rx", 4).attr("ry", 4).attr("cursor", "default");
			d3.select(brushG).selectAll(".handle").remove();
		}

		d3.select(brushG).select(".overlay")
			.attr("cursor", this.brushAndZoomAreaSettings.enabled ? "crosshair" : "default")
			.attr("pointer-events", this.brushAndZoomAreaSettings.enabled ? "auto" : "none");

	}

	initVerticalBrush(config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const scaleWidth: number = config.scaleWidth;
		const scaleHeight: number = config.scaleHeight;
		const brushDomain = this.brushScaleBand.domain();

		const brushed = ({ selection }) => {
			const newYScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.yScale.range();

			brushDomain.forEach((d) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newYScaleDomain.push(d);
				}
			});

			this.newScaleDomainByBrush = newYScaleDomain;
		};

		const brush = d3
			.brushY()
			.extent([
				[0, 0],
				[this.brushWidth, this.height],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleHeight / barDistance);
		const totalBar = this.totalLollipopCount;
		const heightByExpectedBar = (expectedBar * scaleHeight) / totalBar;

		d3.select(brushG)
			.attr(
				"transform",
				`translate(${this.viewPortWidth - this.brushWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width}, ${this.margin.top})`
			)
			.call(brush)
			.call(brush.move, [0, heightByExpectedBar]);
		d3.select(brushG).selectAll(".handle").remove();
	}

	initHorizontalBrush(config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const scaleWidth: number = config.scaleWidth;
		const brushDomain = this.brushScaleBand.domain();

		const brushed = ({ selection }) => {
			const newXScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.xScale.range();

			brushDomain.forEach((d) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newXScaleDomain.push(d);
				}
			});

			this.newScaleDomainByBrush = newXScaleDomain;
		};

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[this.width, this.brushHeight],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleWidth / barDistance);
		const totalBar = this.totalLollipopCount;
		const widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

		d3.select(brushG)
			.attr("transform", `translate(${brushXPos}, ${brushYPos})`)
			.call(brush as any)
			.call(brush.move as any, [0, widthByExpectedBar]);
		d3.select(brushG).selectAll(".handle").remove();
	}

	updatePiePositionOnBrushMove(): void {
		if (this.chartSettings.lollipopType !== LollipopType.Circle) {
			const pie1ViewBoxRadius = this.pie1Radius + (this.pie1Radius * (this.pieEmphasizeScaleSize * 2)) / 100;
			const pie2ViewBoxRadius = this.pie2Radius + (this.pie2Radius * (this.pieEmphasizeScaleSize * 2)) / 100;
			this.pieG
				.selectAll("#pie1ForeignObject")
				.attr("x", (d) => {
					const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d["value1"] : d.category));
					return pieX > 0 ? pieX - pie1ViewBoxRadius : pieX - pie1ViewBoxRadius / 2;
				})
				.attr("y", (d) => {
					const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.category : d["value1"]));
					return pieY > 0 ? pieY - pie1ViewBoxRadius : pieY - pie1ViewBoxRadius / 2;
				})
				.attr("opacategory", (d) => {
					if (this.isHorizontalChart) {
						return this.yScale(d.category) ? 1 : 0;
					} else {
						return this.xScale(d.category) ? 1 : 0;
					}
				});

			if (this.isHasMultiMeasure) {
				this.pieG
					.selectAll("#pie2ForeignObject")
					.attr("x", (d) => {
						const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d["value2"] : d.category));
						return pieX > 0 ? pieX - pie2ViewBoxRadius : pieX - pie2ViewBoxRadius / 2;
					})
					.attr("y", (d) => {
						const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.category : d["value2"]));
						return pieY > 0 ? pieY - pie2ViewBoxRadius : pieY - pie2ViewBoxRadius / 2;
					})
					.attr("opacategory", (d) => {
						if (this.isHorizontalChart) {
							return this.yScale(d.category) ? 1 : 0;
						} else {
							return this.xScale(d.category) ? 1 : 0;
						}
					});
			}
		}
	}

	getCategoricalValuesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	isHasCategoricalValuesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	getCategoricalCategoriesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.categories.findIndex((data) => data.source.roles[key] === true);
	}

	drawLollipopChart(): void {
		this.isLollipopChartDrawn = true;
		// this.drawXYAxis();
		// this.drawXYAxisTitle();
		// this.drawLines();

		this.drawLollipop();

		const onCaseLollipopTypePie = () => {
			// this.drawCircle1([]);
			// this.drawCircle2([]);
			this.drawPie1Chart(this.chartData);
			if (this.isHasMultiMeasure) {
				this.drawPie2Chart(this.chartData);
			} else {
				this.drawPie2Chart([]);
			}
			// this.drawData1Labels([]);
			// if (this.isHasMultiMeasure) {
			// 	this.drawData2Labels([]);
			// } else {
			// 	this.drawData2Labels([]);
			// }
		};

		// switch (this.chartSettings.lollipopType) {
		// 	case LollipopType.Circle: {
		// 		this.drawPie1Chart([]);
		// 		this.drawPie2Chart([]);
		// 		// this.drawCircle1(this.chartData);
		// 		// this.drawCircle2(this.isHasMultiMeasure ? this.chartData : []);
		// 		// this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
		// 		// if (this.isHasMultiMeasure) {
		// 		// 	this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
		// 		// } else {
		// 		// 	this.drawData2Labels([]);
		// 		// }
		// 		break;
		// 	}
		// 	case LollipopType.Pie: {
		// 		onCaseLollipopTypePie();
		// 		break;
		// 	}
		// 	case LollipopType.Donut: {
		// 		onCaseLollipopTypePie();
		// 		break;
		// 	}
		// 	case LollipopType.Rose: {
		// 		onCaseLollipopTypePie();
		// 		break;
		// 	}
		// }
	}

	// Number Format
	getAutoUnitFormattedNumber(number: number): string {
		// const numberSettings = this.numberSettings;
		// if (number < 1.0e6) {
		// 	return this.decimalSeparator(+(number / 1.0e3).toFixed(numberSettings.decimalPlaces)) + numberSettings.thousands;
		// } else if (number >= 1.0e6 && number < 1.0e9) {
		// 	return this.decimalSeparator(+(number / 1.0e6).toFixed(numberSettings.decimalPlaces)) + numberSettings.million;
		// } else if (number >= 1.0e9 && number < 1.0e12) {
		// 	return this.decimalSeparator(+(number / 1.0e9).toFixed(numberSettings.decimalPlaces)) + numberSettings.billion;
		// } else if (number >= 1.0e12) {
		// 	return this.decimalSeparator(+(number / 1.0e12).toFixed(numberSettings.decimalPlaces)) + numberSettings.trillion;
		// }

		return number.toString();
	}

	thousandsSeparator(number: number): string {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.numberSettings.thousandsSeparator);
	}

	decimalSeparator(number: number): string {
		const decimals = (number - Math.floor(number)).toFixed(this.numberSettings.decimalPlaces);
		const fNumber = (number + "").split(".")[0] + (+decimals > 0 ? this.numberSettings.decimalSeparator + (decimals + "").split(".")[1] : "");
		// return this.thousandsSeparator(+fNumber);
		return fNumber;
	}

	// Data Labels
	getDataLabelDisplayStyle(labelEle: any): void {
		// if (this.dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
		// 	const labelTextWidth = (d3.select(labelEle).select(".dataLabelText").node() as SVGSVGElement).getBBox().width;
		// 	return labelTextWidth > this.circle1Radius * 2 ? "none" : "block";
		// } else if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
		// 	const prop = labelEle.getBoundingClientRect();
		// 	// let marginLeft = this.margin.left + (this.vizOptions.options.isInFocus === true ? this.settingsPopupOptionsWidth : 0);
		// 	// let marginTop = this.margin.top + this.settingsBtnHeight - (this.vizOptions.options.isInFocus === true ? this.settingsPopupOptionsHeight : 0);
		// 	let marginLeft = this.margin.left;
		// 	let marginRight = this.margin.right;
		// 	let marginTop = this.margin.top;
		// 	let marginBottom = this.margin.bottom;
		// 	const settingsBtnHeight = this.settingsBtnHeight;
		// 	const legendPosition = this.legendSettings.position;

		// 	if (this.legendSettings.show) {
		// 		if (legendPosition === ILegendPosition.Left || legendPosition === ILegendPosition.LeftCenter) {
		// 			marginLeft += this.legendViewPort.width;
		// 		}
		// 		if (legendPosition === ILegendPosition.Right || legendPosition === ILegendPosition.RightCenter) {
		// 			marginRight -= this.legendViewPort.width;
		// 		}
		// 		if (legendPosition === ILegendPosition.Top || legendPosition === ILegendPosition.TopCenter) {
		// 			marginTop += this.legendViewPort.height;
		// 		}
		// 		if (legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
		// 			marginBottom += this.legendViewPort.height;
		// 		}
		// 	}

		// 	if (
		// 		prop.x - this.settingsPopupOptionsWidth < marginLeft ||
		// 		prop.bottom > this.viewPortHeight - marginBottom ||
		// 		prop.top - settingsBtnHeight < marginTop ||
		// 		prop.right > this.viewPortWidth - marginRight
		// 	) {
		// 		return "none";
		// 	} else {
		// 		return "block";
		// 	}
		// }
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
		const key = isData2Label ? "value2" : "value1";

		labelSelection
			.attr("class", "dataLabelG")
			.attr("display", "block")
			.attr("opacategory", dataLabelsSettings.show ? "1" : "0")
			.style("pointer-events", "none");

		textSelection
			.classed("dataLabelText", true)
			.attr("fill", dataLabelsSettings.color)
			.attr("text-anchor", "middle")
			.attr("dy", "0.02em")
			.attr("font-size", this.getDataLabelsFontSize(isData2Label))
			.style("font-family", dataLabelsSettings.fontFamily)
			// .style('font-weight', dataLabelsSettings.fontStyle === FontStyle.Bold ? 'bold' : '')
			// .style('font-style', dataLabelsSettings.fontStyle === FontStyle.Italic ? 'italic' : '')
			.text((d) => this.formatNumber(d[key], this.measureNumberFormatter[isData2Label ? 1 : 0]));

		rectSelection
			.classed("dataLabelRect", true)
			.attr("width", 0)
			.attr("width", function () {
				const getBBox = (d3.select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
				return getBBox.width + dataLabelsSettings.fontSize;
			})
			.attr("height", 0)
			.attr("height", function () {
				const getBBox = (d3.select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
				return getBBox.height + dataLabelsSettings.fontSize * 0.4;
			})
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("fill", dataLabelsSettings.backgroundColor)
			.attr("opacategory", "0");

		if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			rectSelection.attr("fill-opacategory", `${100 - dataLabelsSettings.transparency}% `).attr("opacategory", dataLabelsSettings.showBackground ? "1" : "0");
		}

		textSelection.attr("transform", function () {
			const bBox = (d3.select(this.parentNode).select("rect").node() as SVGSVGElement).getBBox();
			return `translate(${bBox.width / 2},
	            ${bBox.height - 1.5 - dataLabelsSettings.fontSize * 0.4})`;
		});
	}

	getDataLabelXY(d: ILollipopChartRow, isPie2: boolean = false): { x: number; y: number } {
		let x = 0;
		let y = 0;

		if (this.isHorizontalChart) {
			if (this.chartSettings.lollipopType === LollipopType.Circle) {
				x = this.getCircleCX(this.xScale(isPie2 ? d.value2 : d.value1));
				y = this.getCircleCY(this.yScale(d.category));
			}
		} else {
			if (this.chartSettings.lollipopType === LollipopType.Circle) {
				x = this.getCircleCX(this.xScale(d.category));
				y = this.getCircleCY(this.yScale(isPie2 ? d.value2 : d.value1));
			}
		}
		return { x, y };
	}

	transformHorizontalData1LabelOutside(labelSelection: any, labelDistance: number): void {
		const dataLabelsSettings = this.dataLabelsSettings;

		const fn = (d: any, bBox: any) => {
			const XY = this.getDataLabelXY(d);
			const x = XY.x;
			const y = XY.y;
			if (this.isHasMultiMeasure) {
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 < d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			} else {
				if (this.yAxisSettings.position === Position.Left) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformVerticalData1LabelOutside(labelSelection: any, labelDistance: number): void {
		const dataLabelsSettings = this.dataLabelsSettings;

		const fn = (d: any, bBox: any) => {
			const XY = this.getDataLabelXY(d);
			const x = XY.x;
			const y = XY.y;
			if (this.isHasMultiMeasure) {
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 < d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + labelDistance + bBox.width}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				}
			} else {
				if (this.xAxisSettings.position === Position.Bottom) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + bBox.width + labelDistance}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformData1LabelOutside(labelSelection: any): void {
		const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ? this.circle1Radius / 0.7 : this.pie1Radius / 0.7;

		if (this.isHorizontalChart) {
			this.transformHorizontalData1LabelOutside(labelSelection, labelDistance);
		} else {
			this.transformVerticalData1LabelOutside(labelSelection, labelDistance);
		}
	}

	transformData2LabelOutside(labelSelection: any): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ? this.circle2Radius / 0.7 : this.pie2Radius / 0.7;

		const fn = (d, bBox) => {
			if (this.isHorizontalChart) {
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 < d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                        ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                        ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                    ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                    ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			} else {
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 < d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + labelDistance + bBox.width}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformData1LabelInside(labelsSelection: any): void {
		const fn = (d, labelBBox: any) => {
			const x = this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value1 : d.category));
			const y = this.getCircleCY(this.yScale(this.isHorizontalChart ? d.category : d.value1));
			const transX = x - labelBBox.width / 2;
			const transY = y - labelBBox.height / 2;
			return `translate(${transX}, ${transY})`;
		};

		labelsSelection.attr("transform", function (d) {
			const labelBBox = this.getBBox();
			return fn(d, labelBBox);
		});
	}

	transformData2LabelInside(labelsSelection: any): void {
		const fn = (d, labelBBox) => {
			const x = this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value2 : d.category));
			const y = this.getCircleCY(this.yScale(this.isHorizontalChart ? d.category : d.value2));
			const transX = x - labelBBox.width / 2;
			const transY = y - labelBBox.height / 2;
			return `translate(${transX}, ${transY})`;
		};

		labelsSelection.attr("transform", function (d) {
			const labelBBox = this.getBBox();
			return fn(d, labelBBox);
		});
	}

	drawData1Labels(data: ILollipopChartRow[]): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			return this.isHorizontalChart ? this.yScale(data.category) : this.xScale(data.category);
		});

		const dataLabelGSelection = this.dataLabels1G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");

				const textSelection = dataLabelGSelection.append("text");

				const rectSelection = dataLabelGSelection.append("rect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData1LabelOutside(dataLabelGSelection);
				} else {
					this.transformData1LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");

				const textSelection = dataLabelGSelection.select(".dataLabelText");

				const rectSelection = dataLabelGSelection.select(".dataLabelRect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData1LabelOutside(dataLabelGSelection);
				} else {
					this.transformData1LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			}
		);

		this.dataLabels1G.selectAll(".dataLabelG").select("text").raise();
	}

	drawData2Labels(data: ILollipopChartRow[]): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			return this.isHorizontalChart ? this.yScale(data.category) : this.xScale(data.category);
		});

		const dataLabelGSelection = this.dataLabels2G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");

				const textSelection = dataLabelGSelection.append("text");

				const rectSelection = dataLabelGSelection.append("rect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData2LabelOutside(dataLabelGSelection);
				} else {
					this.transformData2LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");

				const textSelection = dataLabelGSelection.select(".dataLabelText");

				const rectSelection = dataLabelGSelection.select(".dataLabelRect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData2LabelOutside(dataLabelGSelection);
				} else {
					this.transformData2LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			}
		);

		this.dataLabels2G.selectAll(".dataLabelG").select("text").raise();
	}

	drawTooltip(): void {
		this.tooltipServiceWrapper.addTooltip(
			d3.selectAll(".chart-circle1"),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, true)),
			(datapoint: any) => datapoint.selectionId
		);

		this.tooltipServiceWrapper.addTooltip(
			d3.selectAll(".chart-circle2"),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, false)),
			(datapoint: any) => datapoint.selectionId
		);

		const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
			return this.numberSettings.show ? formatNumber(value, this.numberSettings, numberFormatter) : powerBiNumberFormat(value, numberFormatter);
		};

		const getTooltipData = (value: ILollipopChartRow, isCircle1: boolean): VisualTooltipDataItem[] => {
			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: typeof value.category === "string" ? value.category.toUpperCase() : value.category,
					color: "transparent",
				},
				{
					displayName: isCircle1 ? this.measure1DisplayName : this.measure2DisplayName,
					value: isCircle1
						? numberFormatter(value.value1, this.measureNumberFormatter[0])
						: numberFormatter(value.value2, this.measureNumberFormatter[1]),
					color: value.styles.circle1.fillColor,
				},
			];

			value.tooltipFields.forEach((data, i: number) => {
				tooltipData.push({
					displayName: data.displayName,
					value: typeof data.value === "number" ? powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i]) : data.value,
					color: data.color ? data.color : "transparent",
				});
			});

			return tooltipData;
		};

		const getClevelandTooltipData = (value: ILollipopChartRow): VisualTooltipDataItem[] => {
			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: typeof value.category === "string" ? value.category.toUpperCase() : value.category,
					color: "transparent",
				},
				{
					displayName: this.measure1DisplayName,
					value: numberFormatter(value.value1, this.measureNumberFormatter[0]),
					color: value.styles.circle1.fillColor,
				},
				{
					displayName: this.measure2DisplayName,
					value: numberFormatter(value.value2, this.measureNumberFormatter[1]),
					color: value.styles.circle2.fillColor,
				},
			];

			value.tooltipFields.forEach((data, i: number) => {
				tooltipData.push({
					displayName: data.displayName,
					value: typeof data.value === "number" ? powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i]) : data.value,
					color: data.color ? data.color : "transparent",
				});
			});
			return tooltipData;
		};
	}

	// XY Axis Title
	drawXYAxisTitle(): void {
		const xAxisSettings = this.xAxisSettings;
		const yAxisSettings = this.yAxisSettings;

		this.xAxisTitleText
			.attr("fill", xAxisSettings.titleColor)
			.attr("font-size", xAxisSettings.titleFontSize)
			.style("font-family", xAxisSettings.titleFontFamily)
			.style("display", xAxisSettings.isDisplayTitle ? "block" : "none");

		this.yAxisTitleText
			.attr("fill", yAxisSettings.titleColor)
			.attr("font-size", yAxisSettings.titleFontSize)
			.style("font-family", this.yAxisSettings.titleFontFamily)
			.style("display", yAxisSettings.isDisplayTitle ? "block" : "none");

		const xAxisTitle = this.isHorizontalChart ? this.valuesTitle : this.categoryTitle;
		if (!xAxisSettings.titleName) {
			xAxisSettings.titleName = xAxisTitle;
			xAxisSettings.titleName = xAxisTitle;
		}
		this.xAxisTitleText.text(xAxisSettings.titleName ? xAxisSettings.titleName : xAxisTitle);

		const yAxisTitle = this.isHorizontalChart ? this.categoryTitle : this.valuesTitle;
		if (!yAxisSettings.titleName) {
			yAxisSettings.titleName = yAxisTitle;
			yAxisSettings.titleName = yAxisTitle;
		}
		this.yAxisTitleText.text(yAxisSettings.titleName ? yAxisSettings.titleName : yAxisTitle);

		if (xAxisSettings.position === Position.Bottom) {
			this.xAxisTitleG.attr(
				"transform",
				`translate(${this.width / 2}, ${this.height + this.margin.bottom - this.brushHeight - this.xAxisTitleMargin})`
			);
		} else if (xAxisSettings.position === Position.Top) {
			this.xAxisTitleG.attr("transform", `translate(${this.width / 2}, ${-this.margin.top + 2 * this.xAxisTitleMargin})`);
		}

		if (yAxisSettings.position === Position.Left) {
			this.yAxisTitleG.attr("transform", `translate(${-this.margin.left + this.yAxisTitleMargin}, ${this.height / 2})`);
		} else if (yAxisSettings.position === Position.Right) {
			this.yAxisTitleG.attr(
				"transform",
				`translate(${this.width + this.margin.right - this.brushWidth / 2 - this.yAxisTitleMargin}, ${this.height / 2})`
			);
		}
	}

	setScaleBandwidth(): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		if (this.chartSettings.lollipopWidthType === LollipopWidthType.Custom) {
			if (!this.chartSettings.lollipopWidth) {
				this.chartSettings.lollipopWidth = this.scaleBandWidth;
			}

			if (this.chartSettings.lollipopWidth < this.minScaleBandWidth) {
				this.chartSettings.lollipopWidth = this.minScaleBandWidth;
			}

			if (this.chartSettings.lollipopWidth < clonedXScale.padding(0).bandwidth()) {
				this.chartSettings.lollipopWidth = clonedXScale.padding(0).bandwidth();
			}

			this.chartSettings.lollipopWidth = +Math.round(this.chartSettings.lollipopWidth).toFixed(0);
		}

		// if (!this.chartSettings.islollipopCategoryWidthChange || this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Auto) {
		// 	const maxRadius = d3.max([this.circle1Settings.circleRadius, this.circle2Settings.circleRadius]);
		// 	const circleDDiff = maxRadius * 2 + maxRadius * 2 - Math.floor(this.scaleBandWidth);
		// 	this.chartSettings.lollipopCategoryWidth = Math.floor(this.scaleBandWidth) + circleDDiff;
		// 	// CHART_SETTINGS.lollipopCategoryWidth = Math.floor(this.chartSettings.lollipopCategoryWidth);
		// }

		// if (this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Custom) {
		// 	// CHART_SETTINGS.lollipopCategoryWidth = Math.round(this.scaleBandWidth);
		// }
	}

	// Scale & Axis
	setXAxisTickStyle(): void {
		const THIS = this;
		const xAxisSettings = this.xAxisSettings;
		let isApplyTilt: boolean;
		let xAxisMaxHeight: number = 0;
		let xAxisTickHeight: number = 0;

		if (!this.isHorizontalChart) {
			const xAxisDomain: string[] = this.xScale.domain();
			const xAxisTicks: string[][] = xAxisDomain.map((text) => {
				const textProperties: TextProperties = {
					text: text,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};
				return GetWordsSplitByWidth(text, textProperties, this.scaleBandWidth, 3);
			});
			isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3 || this.isHorizontalBrushDisplayed;
			const xAxisTicksWidth = xAxisDomain.map((d) => {
				const textProperties: TextProperties = {
					text: d + "ab",
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};
				return textMeasurementService.measureSvgTextWidth(textProperties);
			});
			const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth);
			xAxisMaxHeight = d3.min([this.height * 0.4, xAxisTicksMaxWidth]);

			const textProperties: TextProperties = {
				text: "X Axis",
				fontFamily: xAxisSettings.labelFontFamily,
				fontSize: xAxisSettings.labelFontSize + "px",
			};
			xAxisTickHeight = textMeasurementService.measureSvgTextHeight(textProperties);
		}

		this.xAxisG
			.selectAll("text")
			.attr("dx", isApplyTilt && !this.isHorizontalBrushDisplayed && !this.isExpandAllApplied ? "-10.5px" : "0")
			.attr("dy", isApplyTilt ? "-0.5em" : "0.32em")
			// .attr("dy", isApplyTilt ? "0" : "0.32em")
			.attr("fill", this.getColor(xAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", xAxisSettings.labelFontFamily)
			.attr("font-size", xAxisSettings.labelFontSize)
			.attr("display", xAxisSettings.isDisplayLabel ? "block" : "none")
			.attr("text-anchor", isApplyTilt ? "end" : "middle")
			// .attr("transform", () => {
			// 	if (xAxisSettings.position === Position.Bottom) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, 10)rotate(-${this.getXAxisLabelTilt()})`;
			// 	} else if (xAxisSettings.position === Position.Top) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, -10)rotate(${this.getXAxisLabelTilt()})`;
			// 	}
			// })
			.each(function () {
				const ele = d3.select(this);
				const text = ele.text();
				ele.text("");

				const textProperties: TextProperties = {
					text: text,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart) {
					if (!isApplyTilt) {
						ele.attr("transform", `rotate(0)`);
						const words: string[] = GetWordsSplitByWidth(text, textProperties, THIS.scaleBandWidth - xAxisSettings.labelFontSize / 2, 3);
						words.forEach((d, i) => {
							ele
								.append("tspan")
								.attr("x", 0)
								.attr("dy", i * xAxisTickHeight)
								.text(d);
						});
					} else {
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, xAxisMaxHeight);
						ele.attr("transform", `rotate( ${THIS.isHorizontalBrushDisplayed || THIS.isExpandAllApplied ? -90 : -35})`);
						ele.append("tspan").text(truncatedText);
					}
				} else {
					ele.append("tspan").text(formatNumber(parseFloat(text), THIS.numberSettings));
				}
			});
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
		this.yAxisG
			.selectAll("text")
			.attr("x", "0")
			.attr("fill", this.getColor(yAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", yAxisSettings.labelFontFamily)
			.attr("font-size", yAxisSettings.labelFontSize)
			.attr("display", yAxisSettings.isDisplayLabel ? "block" : "none")
			.style("text-anchor", yAxisSettings.position === Position.Left ? "end" : "start")
			// .text((d: any) => {
			// 	if (!this.isHorizontalChart && typeof d === "number") {
			// 		return formatNumber(d, this.numberSettings, undefined);
			// 	}
			// 	return d;
			// })
			.each(function () {
				const ele = d3.select(this);
				const text = ele.text();
				ele.text("");

				const textProperties: TextProperties = {
					text: text,
					fontFamily: yAxisSettings.labelFontFamily,
					fontSize: yAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart) {
					ele.append("tspan").text(formatNumber(parseFloat(text), THIS.numberSettings));
				} else {
					const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, THIS.width * 0.06);
					ele.append("tspan").text(truncatedText);
				}
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
			self.text(newText + "..");
		}
	}

	trimYAxisTick(tickEle: any): void {
		const self = d3.select(tickEle);
		// const textLength = self.node().getComputedTextLength();
		const text = self.text();
		if (text.length > this.yAxisSettings.labelCharLimit) {
			const newText = text.substr(0, this.yAxisSettings.labelCharLimit);
			self.text(newText + "..");
		}
	}

	setXYAxisDomain(): void {
		const values = this.chartData.reduce((arr, d) => {
			return [...arr, d.value1, d.value2];
		}, []);

		let min = d3.min(this.isHasMultiMeasure ? values.map((val) => val) : this.chartData.map((d) => d.value1));
		min += min * 0.15;

		if (min > 0) {
			min = 0;
		}

		let max = d3.max(this.isHasMultiMeasure ? values.map((val) => val) : this.chartData.map((d) => d.value1));
		max += max * 0.15;

		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";

		if (this.isHorizontalChart) {
			this.xScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand();
			this.yScale = d3.scaleBand();
			this.yScale2 = d3.scaleBand();

			if (isLinearScale) {
				this.xScale.domain([min, max]);
			} else {
				this.xScale.domain(this.chartData.map((d) => d.value1));
			}

			this.yScale.domain(this.chartData.map((d) => d.category));
			this.yScale2.domain(this.chartData.map((d) => d.category));
		} else {
			this.xScale = d3.scaleBand();
			// this.xScale2 = d3.scaleBand();
			this.yScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand();

			this.xScale.domain(this.chartData.map((d) => d.category));
			// this.xScale2.domain(this.chartData.map((d) => d.category));
			if (isLinearScale) {
				this.yScale.domain([min, max]);
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
			// this.xScale2.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
			this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
		}
	}

	callXYScaleOnAxisGroup(): void {
		if (this.xAxisSettings.position === Position.Bottom) {
			this.xAxisG.attr("transform", "translate(0," + this.height + ")").call(
				d3
					.axisBottom(this.xScale)
					.ticks(this.width / 90)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
			// .selectAll('text')
			// .attr('dy', '0.35em')
			// .attr('transform', `translate(-10, 10)rotate(-${this.visualSettings.xAxis.labelTilt})`)
		} else if (this.xAxisSettings.position === Position.Top) {
			this.xAxisG.attr("transform", "translate(0," + 0 + ")").call(
				d3
					.axisTop(this.xScale)
					.ticks(this.width / 90)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
			// .selectAll('text')
			// .attr('dy', '0.35em')
			// .attr('transform', `translate(-10, -10)rotate(${this.visualSettings.xAxis.labelTilt})`)
		}

		if (this.yAxisSettings.position === Position.Left) {
			this.yAxisG.attr("transform", `translate(0, 0)`).call(
				d3
					.axisLeft(this.yScale)
					.ticks(this.height / 70)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
		} else if (this.yAxisSettings.position === Position.Right) {
			this.yAxisG.attr("transform", `translate(${this.width}, 0)`).call(
				d3
					.axisRight(this.yScale)
					.ticks(this.height / 70)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
		}
	}

	xGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.xGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", (d) => this.xScale(d))
			.attr("x2", (d) => this.xScale(d))
			.attr("y1", this.margin.top)
			.attr("y2", this.height)
			.attr("stroke", this.xGridSettings.lineColor)
			.attr("stroke-width", this.xGridSettings.lineWidth)
			.attr("opacategory", 1)
			.attr(
				"stroke-dasharray",
				this.xGridSettings.lineType === LineType.Dotted
					? `0, ${this.xGridSettings.lineWidth * 8} `
					: `${this.xGridSettings.lineWidth * 10}, ${this.xGridSettings.lineWidth * 10}`
			)
			.style("display", this.xGridSettings.show ? "block" : "none");
	}

	yGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.yGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", (d) => this.yScale(d))
			.attr("y2", (d) => this.yScale(d))
			.attr("stroke", this.yGridSettings.lineColor)
			.attr("stroke-width", this.yGridSettings.lineWidth)
			.attr("opacategory", 1)
			.attr(
				"stroke-dasharray",
				this.yGridSettings.lineType === LineType.Dotted
					? `0, ${this.yGridSettings.lineWidth * 8} `
					: `${this.yGridSettings.lineWidth * 10}, ${this.yGridSettings.lineWidth * 10} `
			)
			.style("display", this.yGridSettings.show ? "block" : "none");
	}

	drawXGridLines(): void {
		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";
		const xScaleTicks = this.isHorizontalChart && isLinearScale ? this.xScale.ticks(this.width / 90) : this.xScale.domain();
		const gridLinesSelection = this.xGridLinesG.selectAll("line").data(xScaleTicks);
		this.xGridLinesSelection = gridLinesSelection.join(
			(enter) => {
				const lines = enter.append("line");
				this.xGridLinesFormatting(lines);
				return lines;
			},
			(update) => {
				this.xGridLinesFormatting(update);
				return update;
			}
		);
	}

	drawYGridLines(): void {
		const yScaleTicks = this.isHorizontalChart ? this.yScale.domain() : this.yScale.ticks(this.height / 70);
		const gridLinesSelection = this.yGridLinesG.selectAll("line").data(yScaleTicks);
		this.yGridLinesSelection = gridLinesSelection.join(
			(enter) => {
				const lines = enter.append("line");
				this.yGridLinesFormatting(lines);
				return lines;
			},
			(update) => {
				this.yGridLinesFormatting(update);
				return update;
			}
		);
	}

	setXScaleGHeight(): void {
		const xAxisSettings = this.xAxisSettings;
		const xAxisDomain: string[] = this.xScale.domain();
		const textProperties: TextProperties = {
			text: "X-Axis",
			fontFamily: xAxisSettings.labelFontFamily,
			fontSize: xAxisSettings.labelFontSize + "px",
		};

		if (!this.isHorizontalChart) {
			const xAxisTicksWidth = xAxisDomain.map((d) => {
				return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
			});
			const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
			const xAxisMaxHeight = d3.min([this.height * 0.4, xAxisTicksMaxWidth], (d) => d);

			if (!this.isHorizontalBrushDisplayed) {
				const xAxisTickHeight = textMeasurementService.measureSvgTextHeight(textProperties);
				const xAxisTicks: string[][] = xAxisDomain.map((text) => {
					return GetWordsSplitByWidth(text, { ...textProperties, text: text }, this.xScale.bandwidth(), 3);
				});
				const isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3;
				const xAxisMaxWordHeight = d3.max(xAxisTicks, (d) => d.length) * xAxisTickHeight;
				this.xScaleGHeight = isApplyTilt ? xAxisMaxHeight : xAxisMaxWordHeight;
			} else {
				const xAxisTicks = xAxisDomain.map((text) => {
					return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, xAxisMaxHeight);
				});
				const xAxisTicksWidth = xAxisTicks.map((d) => {
					return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
				});
				const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
				this.xScaleGHeight = xAxisTicksMaxWidth;
			}
		} else {
			this.xScaleGHeight = textMeasurementService.measureSvgTextHeight({ ...textProperties });
		}
	}

	setYScaleGWidth(): void {
		const yAxisSettings = this.yAxisSettings;
		const yAxisDomain: string[] = this.yScale.domain();
		const textProperties: TextProperties = {
			text: "X-Axis",
			fontFamily: yAxisSettings.labelFontFamily,
			fontSize: yAxisSettings.labelFontSize + "px",
		};

		if (!this.isHorizontalChart) {
			const yAxisTicks: string[] = this.yScale.ticks(this.height / 70);
			const yAxisTicksWidth = yAxisTicks.map((d) => {
				const textProperties: TextProperties = {
					text: !this.isHorizontalChart && typeof d === "number" ? formatNumber(d, this.numberSettings, undefined) : d,
					fontFamily: this.yAxisSettings.labelFontFamily,
					fontSize: this.yAxisSettings.labelFontSize + "px",
				};
				return textMeasurementService.measureSvgTextWidth(textProperties);
			});
			this.yScaleGWidth = d3.max(yAxisTicksWidth);
		} else {
			const yAxisTicks = yAxisDomain.map((text) => {
				return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, this.width * 0.06);
			});
			const yAxisTicksWidth = yAxisTicks.map((d) => {
				return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
			});
			const yAxisTicksMaxWidth = d3.max(yAxisTicksWidth, (d) => d);
			this.yScaleGWidth = yAxisTicksMaxWidth;
		}
	}

	drawXYAxis(): void {
		this.setXYAxisDomain();
		this.setXYAxisRange(this.width, this.height);

		// // // SET X-AXIS TICKS MAX HEIGHT
		this.setXScaleGHeight();

		// // // SET Y-AXIS TICKS MAX HEIGHT
		this.setYScaleGWidth();

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);

		// // // SET X-AXIS TICKS MAX HEIGHT
		this.setXScaleGHeight();

		// // // SET Y-AXIS TICKS MAX HEIGHT
		this.setYScaleGWidth();

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup();

		if (this.xAxisSettings.isDisplayLabel) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel) {
			this.setYAxisTickStyle();
		}

		this.xScaleGHeight = this.xAxisG.node().getBoundingClientRect().height;
		this.yScaleGWidth = this.yAxisG.node().getBoundingClientRect().width;

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup();

		if (this.xAxisSettings.isDisplayLabel) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel) {
			this.setYAxisTickStyle();
		}

		this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.xAxisG.selectAll(".tick").style("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");
		this.yAxisG.selectAll(".tick").style("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");

		// if (this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Custom) {
		// 	if (this.width > this.xScaleWidth && this.height > this.yScaleHeight) {
		// 		if (this.isHorizontalChart) {
		// 			this.setXYAxisRange(this.width, this.yScaleHeight);
		// 			this.setScaleBandwidth();
		// 		} else {
		// 			this.setXYAxisRange(this.xScaleWidth, this.height);
		// 			this.setScaleBandwidth();
		// 		}
		// 	}
		// }

		// this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// this.callXYScaleOnAxisGroup();
		// this.setXAxisTickStyle();
		// this.setYAxisTickStyle();
		// this.drawXGridLines();
		// this.drawYGridLines();
	}

	// Lines
	setLineStrokeColor(): void {
		const lineColor = this.lineSettings.lineColor;
		if (this.isHasMultiMeasure && (lineColor === "rgb(91,121,185)" || lineColor === "rgba(91,121,185,1)")) {
			this.lineSettings.lineColor = "rgb(150,150,150,60)";
		}
	}

	setHorizontalLinesFormatting(linesSelection: any): void {
		this.setLineStrokeColor();
		linesSelection
			.attr("x1", (d) => this.xScale(this.isHasMultiMeasure ? d.value2 : 0))
			.attr("x2", (d) => this.xScale(d.value1))
			.attr("y1", (d) => this.yScale(d.category) + this.scaleBandWidth / 2)
			.attr("y2", (d) => this.yScale(d.category) + this.scaleBandWidth / 2)
			.attr("stroke", (d) => this.getColor(d.styles.line.color, EHighContrastColorType.Foreground))
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr("opacategory", 1)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === LineType.Dotted
					? `0, ${this.lineSettings.lineWidth * 2} `
					: `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `
			)
			.style("display", this.lineSettings.show ? "block" : "none");
	}

	getLineStrokeWidth(): number {
		const strokeWidthScale = d3.scaleLinear().range([2, this.lineSettings.lineWidth]).domain([100, 1000]);
		const widthByScale = strokeWidthScale(this.width);
		return widthByScale < this.lineSettings.lineWidth ? widthByScale : this.lineSettings.lineWidth;
	}

	setVerticalLinesFormatting(linesSelection: any): void {
		this.setLineStrokeColor();
		linesSelection
			.attr("x1", (d) => this.xScale(d.category) + this.scaleBandWidth / 2)
			.attr("x2", (d) => this.xScale(d.category) + this.scaleBandWidth / 2)
			.attr("y1", (d) => this.yScale(d.value1))
			.attr("y2", (d) => this.yScale(this.isHasMultiMeasure ? (d.value2 ? d.value2 : 0) : 0))
			.attr("stroke", (d) => this.getColor(d.styles.line.color, EHighContrastColorType.Foreground))
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr("opacategory", 1)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === LineType.Dotted
					? `0, ${this.lineSettings.lineWidth * 2} `
					: `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `
			)
			.style("display", this.lineSettings.show ? "block" : "none");
	}

	drawLollipop(): void {
		const lollipopSelection = this.lollipopG.selectAll(".lollipop-group").data(this.chartData);
		this.lollipopSelection = lollipopSelection.join(
			(enter) => {
				const lollipopG = enter.append("g").attr("class", "lollipop-group");

				if (this.chartSettings.lollipopType === LollipopType.Circle) {
					const circle1Selection = lollipopG.append("circle")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
						})
						.attr("id", CircleType.Circle1)
						.classed(this.circleClass, true)
						.classed(this.circle1Class, true);
					this.setCircle1Formatting(circle1Selection);
				} else {
					const pie1Selection = lollipopG.append("foreignObject")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
						})
						.attr("id", "pie1ForeignObject");
					this.enterPieChart(pie1Selection);
					this.setPieDataLabelsDisplayStyle();
				}

				const lineSelection = lollipopG.append("line").attr("class", this.lineSettings.lineType).classed(this.lineClass, true);

				if (this.isHasMultiMeasure) {
					if (this.chartSettings.lollipopType === LollipopType.Circle) {
						const circle2Selection = lollipopG.append("circle")
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
							})
							.attr("id", CircleType.Circle2)
							.classed(this.circleClass, true).classed(this.circle2Class, true);
						this.setCircle2Formatting(circle2Selection);
					} else {
						const pie2Selection = lollipopG.append("foreignObject")
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
							})
							.attr("id", "pie2ForeignObject");
						this.enterPieChart(pie2Selection, true);
						this.setPieDataLabelsDisplayStyle(true);
					}
				}

				if (this.isHorizontalChart) {
					this.setHorizontalLinesFormatting(lineSelection);
				} else {
					this.setVerticalLinesFormatting(lineSelection);
				}

				return lollipopG;
			},
			(update) => {
				const lineSelection = update.select(this.lineClassSelector);
				const circle1Selection = update.datum(d => {
					return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
				}).select(this.circle1ClassSelector);
				const circle2Selection = update.datum(d => {
					return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
				}).select(this.circle2ClassSelector);
				const pie1Selection = update
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.select("#pie1ForeignObject");
				const pie2Selection = update
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					})
					.select("#pie2ForeignObject");

				if (this.isHorizontalChart) {
					this.setHorizontalLinesFormatting(lineSelection);
				} else {
					this.setVerticalLinesFormatting(lineSelection);
				}

				if (this.chartSettings.lollipopType === LollipopType.Circle) {
					pie1Selection.remove();
					pie2Selection.remove();

					this.setCircle1Formatting(circle1Selection);

					if (this.isHasMultiMeasure) {
						this.setCircle2Formatting(circle2Selection);
					} else {
						circle2Selection.remove();
					}
				} else {
					circle1Selection.remove();
					circle2Selection.remove();

					this.updatePieChart(pie1Selection);
					this.setPieDataLabelsDisplayStyle();

					if (this.isHasMultiMeasure) {
						this.updatePieChart(pie2Selection, true);
						this.setPieDataLabelsDisplayStyle(true);
					}
				}

				return update;
			}
		) as any;
	}

	drawLines(): void {
		const lineSelection = this.lineG.selectAll(".chart-line").data(this.chartData);

		if (this.isHorizontalChart) {
			this.lineSelection = lineSelection.join(
				(enter) => {
					const linesSelection = enter.append("line");
					this.setHorizontalLinesFormatting(linesSelection);
					return linesSelection;
				},
				(update) => {
					this.setHorizontalLinesFormatting(update);
					return update;
				}
			);
		} else {
			this.lineSelection = lineSelection.join(
				(enter) => {
					const linesSelection = enter.append("line");
					this.setVerticalLinesFormatting(linesSelection);
					return linesSelection;
				},
				(update) => {
					this.setVerticalLinesFormatting(update);
					return update;
				}
			);
		}
	}

	// Circle
	setCircle1Radius(): void {
		const maxCircleRadius = this.circle1Settings.maxCircleRadius;
		if (this.circle1Settings.circleSize === CircleSize.Auto) {
			if (this.isHorizontalChart) {
				this.circle1Radius = this.height * 0.04 < maxCircleRadius ? this.height * 0.04 : maxCircleRadius;
			} else {
				this.circle1Radius = this.width * 0.02 < maxCircleRadius ? this.width * 0.02 : maxCircleRadius;
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
			diff = this.width - x <= this.circle1Radius ? this.circle1Radius - (this.width - x) : 0;
		}
		return diff;
	}

	getOverflowCircleCYDiff(y: number): number {
		let diff = 0;
		if (this.xAxisSettings.position === Position.Bottom) {
			diff = this.height - y <= this.circle1Radius ? this.circle1Radius - (this.height - y) : 0;
		} else {
			diff = y <= this.circle1Radius ? this.circle1Radius - y : 0;
		}
		return diff;
	}

	getCircleCX(x: number): number {
		const diff = this.getOverflowCircleCXDiff(x);
		return x ? (this.yAxisSettings.position === Position.Left ? x + diff : x - diff) : this.circle1Radius;
	}

	getCircleCY(y: number): number {
		const diff = this.getOverflowCircleCYDiff(y);
		return y ? (this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff) : this.circle1Radius;
	}

	setCircle1Formatting(circleSelection: any): void {
		this.setCircle1Radius();
		circleSelection
			.attr("cx", (d) => {
				const cx = this.xScale(this.isHorizontalChart ? d.value1 : d.category);
				return this.isHorizontalChart ? this.getCircleCX(cx) : cx + this.scaleBandWidth / 2;
			})
			.attr("cy", (d) => {
				const cy = this.yScale(this.isHorizontalChart ? d.category : d.value1);
				return !this.isHorizontalChart ? this.getCircleCY(cy) : cy + this.scaleBandWidth / 2;
			})
			.attr("r", this.circle1Radius)
			.attr("stroke", (d) => this.getColor(d.styles[CircleType.Circle1][CategoryDataColorProps.strokeColor], EHighContrastColorType.Foreground))
			.attr("stroke-width", this.circle1Settings.strokeWidth)
			.attr("opacategory", 1)
			.style("fill", (d: ILollipopChartRow) => {
				const color = this.getColor(this.circle1Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle1][CategoryDataColorProps.fillColor] : "#fff", EHighContrastColorType.Foreground);
				if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
					return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
				} else {
					return color;
				}
			}
			)
			.style("display", this.circle1Settings.show ? "block" : "none");
	}

	setCircle2Formatting(circleSelection: any): void {
		this.setCircle2Radius();
		circleSelection
			.attr("cx", (d) => {
				const cx = this.xScale(this.isHorizontalChart ? d.value2 : d.category);
				return this.isHorizontalChart ? this.getCircleCX(cx) : cx + this.scaleBandWidth / 2;
			})
			.attr("cy", (d) => {
				const cy = this.yScale(this.isHorizontalChart ? d.category : d.value2);
				return !this.isHorizontalChart ? this.getCircleCY(cy) : cy + this.scaleBandWidth / 2;
			})
			.attr("r", this.circle2Radius)
			.attr("stroke", (d) => this.getColor(d.styles[CircleType.Circle2][CategoryDataColorProps.strokeColor], EHighContrastColorType.Foreground))
			.attr("stroke-width", this.circle2Settings.strokeWidth)
			.attr("opacategory", 1)
			.style("fill", (d) => {
				const color = this.getColor(this.circle2Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle2][CategoryDataColorProps.fillColor] : "#fff", EHighContrastColorType.Foreground);
				if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
					return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
				} else {
					return color;
				}
			}
			)
			.style("display", (d) => (this.circle2Settings.show && this.isHasMultiMeasure && d.value2 ? "block" : "none"));
	}

	drawCircle1(data: ILollipopChartRow[]): void {
		const circleSelection1 = this.circle1G.selectAll(".chart-circle1").data(data);
		this.circle1Selection = circleSelection1.join(
			(enter) => {
				const circleSelection = enter.append("circle");
				this.setCircle1Formatting(circleSelection);
				return circleSelection;
			},
			(update) => {
				this.setCircle1Formatting(update);
				return update;
			}
		);
	}

	drawCircle2(data: ILollipopChartRow[]): void {
		const circleSelection2 = this.circle2G.selectAll(".chart-circle2").data(data);
		this.circle2Selection = circleSelection2.join(
			(enter) => {
				const circleSelection = enter.append("circle");
				this.setCircle2Formatting(circleSelection);
				return circleSelection;
			},
			(update) => {
				this.setCircle2Formatting(update);
				return update;
			}
		);
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
			diff = this.width - x <= radius ? radius - (this.width - x) : 0;
		}
		return diff;
	}

	getOverflowPieYDiff(y: number, isPie2: boolean = false): number {
		let diff = 0;
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		if (this.xAxisSettings.position === Position.Bottom) {
			diff = this.height - y <= radius ? radius - (this.height - y) : 0;
		} else {
			diff = y <= radius ? radius - y : 0;
		}
		return diff;
	}

	getPieX(x: number, isPie2: boolean = false): number {
		const diff = this.getOverflowPieXDiff(x);
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const pieViewBoxRadius = radius * 2;
		return x ? (this.yAxisSettings.position === Position.Left ? x + diff : x - diff) : pieViewBoxRadius / 2;
	}

	getPieY(y: number, isPie2: boolean = false): number {
		const diff = this.getOverflowPieYDiff(y);
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const pieViewBoxRadius = radius * 2;
		return y ? (this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff) : pieViewBoxRadius / 2;
	}

	setPie1ChartFormatting(): void {
		this.setPie1Radius();
	}

	setPie2ChartFormatting(): void {
		this.setPie2Radius();
	}

	getPieChartSeriesDataByCategory(category: string, isPie2: boolean = false) {
		const id = this.chartData.findIndex((data) => data.category === category);
		const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
		const getPieFill = (d: IChartSubCategory) => {
			const color = d.styles[pieType].color;
			if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
				return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
			} else {
				return color;
			}
		}

		return this.chartData[id].subCategories.map((data) => ({
			value: isPie2 ? data.value2 : data.value1,
			name: data.category,
			itemStyle: { color: this.getColor(getPieFill(data), EHighContrastColorType.Foreground), className: "pie-slice" },
		}));
	}

	getPieSliceClass(category: string, subCategory: string): string {
		return `${category}-${subCategory}`.replace(/ /g, "").toLocaleLowerCase().trim();
	}

	getPieChartSeriesRadius(): string | string[] | number[] {
		switch (this.chartSettings.lollipopType) {
			case LollipopType.Pie: {
				return `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`;
			}
			case LollipopType.Donut: {
				return ["55%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			case LollipopType.Rose: {
				return ["30%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
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
				autoFontSize = pieRadius - pieRadius * (this.pieEmphasizeScaleSize / 100);
				DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize / 2);
				break;

			case LollipopType.Donut:
				autoFontSize = pieRadius - pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100);
				DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize);
				break;

			case LollipopType.Rose:
				autoFontSize = pieRadius - pieRadius * ((70 + this.pieEmphasizeScaleSize) / 100);
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
			animation: false,
			animationDuration: 0,
			animationDurationUpdate: 0,
			animationEasing: "cubicInOut",
			animationEasingUpdate: "cubicInOut",
			animationThreshold: 0,
			progressiveThreshold: 0,
			progressive: 0,
			hoverLayerThreshold: 0,
			useUTC: true,
			title: {},
			tooltip: {
				trigger: "none",
				show: false,
			},
			legend: {
				show: false,
			},
			stateAnimation: {
				duration: 0,
				easing: "cubicIn",
			},
			axisPointer: [
				{
					triggerTooltip: false,
					triggerEmphasis: false,
					value: null,
					status: null,
					animation: null,
					animationDurationUpdate: 0,
				},
			],
			series: [
				{
					type: "pie",
					radius: this.getPieChartSeriesRadius(),
					emphasis: {
						scale: false,
					},
					data: this.getPieChartSeriesDataByCategory(category),
				},
			],
		};

		// pieOption.series[0].label = {
		// 	show: this.dataLabelsSettings.show,
		// 	color: this.dataLabelsSettings.color,
		// 	textBorderColor: this.dataLabelsSettings.borderColor,
		// 	textBorderWidth: this.dataLabelsSettings.borderWidth,
		// 	fontSize: this.getPieDataLabelsFontSize(isPie2),
		// 	fontFamily: this.dataLabelsSettings.fontFamily,
		// 	position: "center",
		// 	formatter: () => {
		// 		return this.getAutoUnitFormattedNumber(categoryValue);
		// 	},
		// };

		pieOption.series[0].label = {
			show: false,
			color: this.dataLabelsSettings.color,
			textBorderColor: this.dataLabelsSettings.borderColor,
			textBorderWidth: this.dataLabelsSettings.borderWidth,
			fontSize: this.getPieDataLabelsFontSize(isPie2),
			fontFamily: this.dataLabelsSettings.fontFamily,
			position: "center",
			formatter: () => {
				return this.getAutoUnitFormattedNumber(categoryValue);
			},
		};

		const categoryValue = this.chartData.find((d) => d.category === category)[isPie2 ? "value2" : "value1"];
		switch (this.chartSettings.lollipopType) {
			case LollipopType.Pie: {
				pieOption.series[0].itemStyle = {
					borderRadius: 0,
					borderColor: "#fff",
					borderWidth: 0,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case LollipopType.Donut: {
				pieOption.series[0].itemStyle = {
					borderRadius: 10,
					borderColor: "#fff",
					borderWidth: 2,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case LollipopType.Rose: {
				pieOption.series[0].roseType = "area";
				pieOption.series[0].center = ["50%", "50%"];
				pieOption.series[0].itemStyle = {
					borderRadius: 8,
				};
				break;
			}
		}
		return pieOption;
	}

	setPieDataLabelsDisplayStyle(isPie2: boolean = false): void {
		const foreignObjectId = isPie2 ? "#pie2ForeignObject" : "#pie1ForeignObject";
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		this.svg
			.selectAll(foreignObjectId)
			.selectAll("text")
			.style("pointer-events", "none")
			.style("opacategory", function () {
				return (this as SVGSVGElement).getBBox().width >= pieRadius * 2 ? "0" : "1";
			});
	}

	enterPieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("id", isPie2 ? "pie2ForeignObject" : "pie1ForeignObject")
			.attr("width", d)
			.attr("height", d)
			.attr("x", (d) => {
				const pieX =
					this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.category)) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
			})
			.attr("y", (d) => {
				const pieY =
					this.getPieY(this.yScale(this.isHorizontalChart ? d.category : d[valueKey])) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
			})
			.attr("opacategory", () => 1)
			.append("xhtml:div")
			.attr("id", "pie")
			.style("width", "100%")
			.style("height", "100%")
			.each((d: ILollipopChartRow, i, nodes) => {
				const ele = d3.select(nodes[i]);
				const ePieChart = echarts.init(ele.node());
				ePieChart.setOption(this.getPieChartOptions(d.category, isPie2));

				d.subCategories.forEach(s => {
					s.defaultValue = d.valueType === DataValuesType.Value1 ? s.value1 : s.value2;
					s.valueType = d.valueType;
				})

				ele.selectAll("path").data(d.subCategories);

				ele.selectAll("path").each(function () {
					const bBox = (d3.select(this).node() as SVGSVGElement).getBBox();
					d3.select(this).datum((d: any) => {
						return { ...d, sliceWidth: bBox.width, sliceHeight: bBox.height }
					})
				})

				ele.selectAll("path").attr("id", (pieData: IChartSubCategory) => {
					return pieData.valueType === DataValuesType.Value1 ? PieType.Pie1 : PieType.Pie2;
				});

				ele.selectAll("path").attr("class", (pieData: IChartSubCategory) => {
					return "pie-slice";
					// return this.getPieSliceClass(d.category, pieData ? pieData.category + " " + "pie-slice" : "");
				});
				// .attr("fill", (d: IChartSubCategory) => {
				// 	return d.styles[pieType].color;
				// });

				// ele
				// 	.select("g")
				// 	.append("rect")
				// 	.lower()
				// 	.attr("class", "innerCenterRect")
				// 	.attr("width", pieRadius + (pieRadius * 30) / 100)
				// 	.attr("height", pieRadius + (pieRadius * 30) / 100)
				// 	.attr("x", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
				// 	.attr("y", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
				// 	.attr("fill", "#fff");

				// this.tooltipServiceWrapper.addTooltip(
				// 	ele.selectAll("path"),
				// 	(datapoint: IChartSubCategory) => getTooltipData(datapoint),
				// 	(datapoint: IChartSubCategory) => datapoint.identity
				// );

				const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
					return this.numberSettings.show ? formatNumber(value, this.numberSettings, numberFormatter) : powerBiNumberFormat(value, numberFormatter);
				};

				const getTooltipData = (pieData: IChartSubCategory): VisualTooltipDataItem[] => {
					const tooltipData: TooltipData[] = [
						{
							displayName: this.categoryDisplayName,
							value: pieData.category,
							color: "transparent",
						},
						{
							displayName: isPie2 ? this.measure2DisplayName : this.measure1DisplayName,
							value: numberFormatter(pieData[valueKey], isPie2 ? this.measureNumberFormatter[1] : this.measureNumberFormatter[0]),
							color: pieData.styles[pieType].color,
						},
					];

					pieData.tooltipFields.forEach((data) => {
						tooltipData.push({
							displayName: data.displayName,

							value: typeof data.value === "number"
								? powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i])
								: data.value,
							color: data.color ? data.color : "transparent",
						});
					});

					return tooltipData;
				};
			});

		// this.pieG.on("mouseover", (e) => {
		// 	if (e.path.length && e.path[5]) {
		// 		d3.select(e.path[5]).raise();
		// 	}
		// });

		this.pieG.on("mouseout", () => {
			this.pieG.selectAll("foreignObject").sort((a, b) => d3.ascending(a.sortId, b.sortId));
		});
	}

	updatePieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("width", d)
			.attr("height", d)
			.attr("x", (d) => {
				const pieX =
					this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.category)) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
			})
			.attr("y", (d) => {
				const pieY =
					this.getPieY(this.yScale(this.isHorizontalChart ? d.category : d[valueKey])) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
			})
			.attr("opacategory", () => 1)
			.select("#pie")
			.style("width", "100%")
			.style("height", "100%")
			.each((d, i, nodes) => {
				const ele = d3.select(nodes[i]);
				const ePieChart = echarts.init(ele.node());
				ePieChart.setOption(this.getPieChartOptions(d.category, isPie2));
				ePieChart.resize();

				// ele.selectAll("path").data(d.subCategories);
				// ele
				// 	.selectAll("path")
				// 	.attr("class", (pieData: IChartSubCategory) => this.getPieSliceClass(d.category, pieData.category))
				// .style("fill", (d: IChartSubCategory) => d.styles[pieType].color);

				ele
					.selectAll(".innerCenterRect")
					.attr("width", pieRadius + (pieRadius * 30) / 100)
					.attr("height", pieRadius + (pieRadius * 30) / 100)
					.attr("x", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("y", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("fill", "#fff");
			});
	}

	drawPie1Chart(data: ILollipopChartRow[]): void {
		data.forEach((d, i) => (d.sortId = 1000 + i));
		if (this.isRankingSettingsChanged) {
			this.pieG.selectAll("#pie1ForeignObject").remove();
		}
		const pie1ForeignObjectSelection = this.pieG.selectAll("#pie1ForeignObject").data(data, (d, i) => i);
		pie1ForeignObjectSelection.exit().remove();
		pie1ForeignObjectSelection.join(
			(enter) => {
				const enteredForeignObjects = enter.append("foreignObject");
				this.enterPieChart(enteredForeignObjects);
			},
			(update) => {
				this.updatePieChart(update);
			}
		);
		this.setPieDataLabelsDisplayStyle();
	}

	drawPie2Chart(data: ILollipopChartRow[]): void {
		data.forEach((d, i) => (d.sortId = 2000 + i));
		if (this.isRankingSettingsChanged) {
			this.pieG.selectAll("#pie2ForeignObject").remove();
		}
		const pie2ForeignObjectSelection = this.pieG.selectAll("#pie2ForeignObject").data(data, (d, i) => i);
		pie2ForeignObjectSelection.join(
			(enter) => {
				const enteredForeignObjects = enter.append("foreignObject");
				this.enterPieChart(enteredForeignObjects, true);
			},
			(update) => {
				this.updatePieChart(update, true);
			}
		);
		this.setPieDataLabelsDisplayStyle(true);
	}

	// Legend
	setLegendsData(): void {
		let legend1DataPoints: { data: { name: string, color: string, pattern: string } }[] = [];
		let legend2DataPoints: { data: { name: string, color: string, pattern: string } }[] = [];
		this.subCategories.sort((a, b) => a.name.localeCompare(b.name));

		if (this.chartSettings.lollipopType === LollipopType.Circle) {
			legend1DataPoints = [{
				data: {
					name: this.measure1DisplayName,
					color: this.getColor(this.dataColorsSettings.circle1.circleFillColor, EHighContrastColorType.Foreground),
					pattern: undefined
				}
			},
			{
				data: {
					name: this.measure2DisplayName,
					color: this.getColor(this.dataColorsSettings.circle2.circleFillColor, EHighContrastColorType.Foreground),
					pattern: undefined
				}
			}
			];
		} else {
			legend1DataPoints = this.subCategories.map((category) => ({
				data: {
					name: category.name,
					color: this.getColor(category.color1, EHighContrastColorType.Foreground),
					pattern: undefined
				}
			}));

			legend2DataPoints = this.subCategories.map((category) => ({
				data: {
					name: category.name,
					color: this.getColor(category.color2, EHighContrastColorType.Foreground),
					pattern: undefined
				}
			}));
		}

		this.legends1Data = legend1DataPoints;
		this.legends2Data = legend2DataPoints;
	}

	handleShowBucket(): void {
		const showBucketConfig = JSON.parse(this.vizOptions.formatTab[EVisualConfig.ShowBucketConfig][EVisualSettings.ShowBucketFormatting]);
		this.showBucketSettings = {
			...SHOW_BUCKET_SETTINGS,
			...showBucketConfig,
		};

		const categoricalShowBucketField = this.categoricalData.values.find((d) => d.source.roles[EDataRolesName.ShowBucket]);
		this.isShowBucketChartFieldCheck = !!categoricalShowBucketField;
		this.isShowBucketChartFieldName = this.isShowBucketChartFieldCheck ? categoricalShowBucketField.source.displayName : "";

		const { enable, fontSize, fontFamily, styling, color, message, showIcon } = this.showBucketSettings;

		if (this.isShowBucketChartFieldCheck) {
			if (this.showBucketSettings.enable) {
				this.isValidShowBucket = !categoricalShowBucketField.values.some((d) => d === 0);
			}

			if (!this.isValidShowBucket) {
				this.renderShowConditionPage({
					enable: enable,
					fontSize: fontSize,
					fontFamily: fontFamily,
					fontStyling: styling,
					color: color,
					message: message,
					showIcon: showIcon,
				});
				return;
			} else {
				this.removeShowConditionPage();
			}
		} else {
			this.removeShowConditionPage();
		}
	}

	public createFooter(footerSettings: IFooterSettings, container: HTMLElement) {
		if (document.querySelector(".footer-container")) {
			document.querySelector(".footer-container").remove();
		}

		if (footerSettings.show && footerSettings.text) {
			const footerContainer = document.createElement("div");
			footerContainer.classList.add("footer-container");
			const alignmentMapping = {
				left: "flex-start",
				center: "center",
				right: "flex-end",
			};

			const marginTop = 4;
			const marginBottom = 0;
			let footerContainerStyles = "";
			if (footerSettings.isShowDivider) {
				footerContainerStyles += `border-top: ${footerSettings.dividerThickness}px solid ${this.highContrastDetails.isHighContrast ? this.highContrastDetails.foregroundColor : footerSettings.dividerColor
					};`;
			}

			footerContainer.setAttribute(
				"style",
				`justify-content: ${alignmentMapping[footerSettings.alignment]
				};  margin-top: ${marginTop}px; margin-bottom: ${marginBottom}px; ${footerContainerStyles}`
			);
			const footer = document.createElement("div");
			footer.textContent = footerSettings.text;
			const transparencyScale = d3.scaleLinear().domain([0, 100]).range([1, 0]);
			const footerBackgroundColor = hexToRGB(footerSettings.backgroundColor, transparencyScale(footerSettings.backgroundTransparency));

			const styles = `
				color: ${this.highContrastDetails.isHighContrast ? this.highContrastDetails.foregroundColor : footerSettings.color}; 
				font-size: ${footerSettings.fontSize}px; 
				font-family: ${footerSettings.fontFamily}; 
				background-color: ${this.highContrastDetails.isHighContrast ? this.highContrastDetails.backgroundColor : footerBackgroundColor};
				border-radius: 4px;
				margin-top: ${footerSettings.isShowDivider ? 3 : 0}px`;

			footer.setAttribute("style", styles);
			footer.addEventListener("click", () => {
				let url = footerSettings.webURL;
				url = url.indexOf("http") !== 0 ? `https://${url}` : url;
				if (footerSettings.webURL) this._host.launchUrl(url);
			});
			footerContainer.appendChild(footer);
			container.appendChild(footerContainer);
			return {
				height: footerContainer.clientHeight + marginTop + marginBottom + (footerSettings.isShowDivider ? footerSettings.dividerThickness : 0),
			};
		}
		return {
			height: 0,
		};
	}

	private setHighContrastDetails(): void {
		this.highContrastDetails = {
			isHighContrast: this._host.colorPalette.isHighContrast,
			foregroundColor: this._host.colorPalette.foreground.value,
			backgroundColor: this._host.colorPalette.background.value,
			foregroundSelectedColor: this._host.colorPalette.foregroundSelected.value,
			hyperlinkColor: this._host.colorPalette.hyperlink.value,
		};
	}

	private renderContextMenu(): void {
		d3.select(this.chartContainer).on("contextmenu", (event) => {
			const dataPoint: any = d3.select(event.target).datum();
			this.selectionManager.showContextMenu(dataPoint && (dataPoint.identity ? dataPoint.identity : {}), {
				x: event.clientX,
				y: event.clientY,
			});
			event.preventDefault();
		});
	}

	setSummaryTableConfig(): void {
		this.summaryTableConfig = {
			excludeNegativeDataBy: this.isHasSubcategories ? "cell" : "row",
			categoricalGroupedDatarole: "subCategory",
			excludeDataRolesFromTable: ["showBucket"],
			dataView: this.vizOptions.options.dataViews as any,
			gridView: "tabular",
			gridConfig: {
				sidebar: { columns: true, filters: true },
				allowedAggregations: true,
			},
			numberFormatter: (value, field) => {
				if (this.isHasSubcategories) {
					field = field.split("_").splice(3).join("_");
				}

				if (this.allNumberFormatter[field].role === EDataRolesName.Measure) {
					return this.numberSettings.show
						? formatNumber(value, this.numberSettings, this.allNumberFormatter[field].formatter)
						: powerBiNumberFormat(value, this.allNumberFormatter[field].formatter);
				} else {
					return powerBiNumberFormat(value, this.allNumberFormatter[field].formatter);
				}
			},
			themeValue: this.vizOptions.formatTab["visualGeneralSettings"]["darkMode"],
			viewport: {
				width: this.vizOptions.options.viewport.width,
				height: this.vizOptions.options.viewport.height,
			},
		};

		if (this.rankingSettings.category.enabled) {
			this.summaryTableConfig = {
				...this.summaryTableConfig,
				matrixRanking: {
					row: {
						rank: this.rankingSettings.category.rankingType,
						count: this.rankingSettings.category.count,
					},
					column: {
						rank: this.rankingSettings.subCategory.rankingType,
						count: this.rankingSettings.subCategory.count,
					},
				},
			};
		}

		if (this.sortingSettings.category.enabled || this.sortingSettings.subCategory.enabled) {
			const matrixSorting = { row: [], column: [] };
			if (this.sortingSettings.category.enabled) {
				matrixSorting.row.push({
					column: this.sortingSettings.category.sortBy,
					order: +this.sortingSettings.category.sortOrder === 1 ? "asc" : "desc",
				});
			}

			if (this.sortingSettings.subCategory.enabled) {
				matrixSorting.column.push({
					column: this.sortingSettings.subCategory.sortBy,
					order: +this.sortingSettings.subCategory.sortOrder === 1 ? "asc" : "desc",
				});
			}

			this.summaryTableConfig = {
				...this.summaryTableConfig,
				matrixSorting: matrixSorting,
			};
		}
	}

	private setNumberFormatters(categoricalMeasureFields, categoricalTooltipFields, categoricalSortFields): void {
		this.measureNumberFormatter = categoricalMeasureFields.map((d) => {
			return valueFormatter.create({ format: d.source.format });
		});

		this.tooltipNumberFormatter = categoricalTooltipFields.map((d) => {
			return valueFormatter.create({ format: d.source.format });
		});

		this.sortValuesNumberFormatter = categoricalSortFields.map((d) => {
			return valueFormatter.create({ format: d.source.format });
		});

		categoricalMeasureFields.forEach((d, i) => {
			this.allNumberFormatter[d.source.displayName] = { formatter: this.measureNumberFormatter[i], role: EDataRolesName.Measure };
		});

		categoricalTooltipFields.forEach((d, i) => {
			this.allNumberFormatter[d.source.displayName] = { formatter: this.tooltipNumberFormatter[i], role: EDataRolesName.Tooltip };
		});

		categoricalSortFields.forEach((d, i) => {
			this.allNumberFormatter[d.source.displayName] = { formatter: this.sortValuesNumberFormatter[i], role: EDataRolesName.Sort };
		});
	}

	setBrushXAxisTicksMaxHeight(): void {
		const brushScaleDomain = this.brushScaleBand.domain();
		const textProperties: TextProperties = {
			text: "X-Axis",
			fontFamily: this.xAxisSettings.labelFontFamily,
			fontSize: this.xAxisSettings.labelFontSize + "px",
		};
		const brushXAxisTicks = brushScaleDomain.map((text) => {
			return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, 100);
		});
		const brushXAxisTicksWidth = brushXAxisTicks.map((d) => {
			return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
		});
		const brushXAxisTicksMaxHeight = d3.max(brushXAxisTicksWidth, (d) => +d);
		this.brushXAxisTicksMaxHeight = brushXAxisTicksMaxHeight;
	}

	setBrushYAxisTicksMaxWidth(): void {
		const brushScaleDomain = this.brushScaleBand.domain();
		const textProperties: TextProperties = {
			text: "Y-Axis",
			fontFamily: this.yAxisSettings.labelFontFamily,
			fontSize: this.yAxisSettings.labelFontSize + "px",
		};
		const brushYAxisTicks = brushScaleDomain.map((text) => {
			return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, 100);
		});
		const brushYAxisTicksWidth = brushYAxisTicks.map((d) => {
			return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
		});
		const brushYAxisTicksMaxWidth = d3.max(brushYAxisTicksWidth, (d) => +d);
		this.brushYAxisTicksMaxWidth = brushYAxisTicksMaxWidth;
	}

	drawBrushXAxis(): void {
		const yPos = this.viewPortHeight - this.settingsBtnHeight - this.legendViewPort.height - this.brushXAxisTicksMaxHeight;
		this.brushXAxisG.attr("transform", "translate(0," + (yPos) + ")")
			.call(
				d3
					.axisBottom(this.brushScaleBand)
					.ticks(this.width / 90)
					.tickFormat((d) => {
						const text = (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
						const textProperties: TextProperties = {
							text,
							fontFamily: this.xAxisSettings.labelFontFamily,
							fontSize: this.xAxisSettings.labelFontSize + "px",
						};
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, 100);
						return truncatedText;
					})
			);

		this.brushXAxisG
			.selectAll("text")
			.attr("dx", "-10.5px")
			.attr("dy", "-0.5em")
			.attr("fill", this.xAxisSettings.labelColor)
			.style("font-family", this.xAxisSettings.labelFontFamily)
			.attr("font-size", this.xAxisSettings.labelFontSize)
			.attr("display", this.xAxisSettings.isDisplayLabel ? "block" : "none")
			.attr("text-anchor", "end")
			.attr("transform", `rotate( ${-90})`);
	}

	drawBrushYAxis(): void {
		const xPos = this.width + this.brushAndZoomAreaWidth;
		this.brushYAxisG.attr("transform", `translate(${xPos},0)`)
			.call(
				d3
					.axisRight(this.brushScaleBand)
					.ticks(this.height / 70)
					.tickFormat((d) => {
						const text = (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
						const textProperties: TextProperties = {
							text,
							fontFamily: this.yAxisSettings.labelFontFamily,
							fontSize: this.yAxisSettings.labelFontSize + "px",
						};
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, 100);
						return truncatedText;
					})
			);

		this.brushYAxisG
			.selectAll("text")
			.attr("x", "0")
			.attr("fill", this.yAxisSettings.labelColor)
			.style("font-family", this.yAxisSettings.labelFontFamily)
			.attr("font-size", this.yAxisSettings.labelFontSize);
	}

	setBrushLollipopCircleSchemaColors(chartData: IBrushLollipopChartData[], schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
		if (isReverse) {
			schemeColors = schemeColors.reverse();
		}

		if (isGradient) {
			const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];
			const domain = [1, chartData.length];
			this.gradientColorScale.domain(domain).range(range);
		}

		let colorIdx = -1;
		chartData.forEach((data, i) => {
			colorIdx++;
			if (colorIdx >= schemeColors.length) {
				colorIdx = 0;
			}
			if (isGradient) {
				const color = this.gradientColorScale(i + 1) + "";
				data.styles.circle1.fillColor = color;
			} else {
				data.styles.circle1.fillColor = schemeColors[colorIdx];
			}
		});
	}

	setBrushLollipopCircleColors(chartData: IBrushLollipopChartData[]): void {
		const colorsSettings = this.dataColorsSettings.circle1;
		if (this.isHasMultiMeasure) {
			const circle1Colors = this.dataColorsSettings.circle1;
			const circle2Colors = this.dataColorsSettings.circle2;
			chartData.forEach((data) => {
				data.styles.circle1.fillColor = circle1Colors.circleFillColor;
				data.styles.circle2.fillColor = circle2Colors.circleFillColor;
			});
			return;
		}

		// Circle 1 Colors
		switch (this.dataColorsSettings.circle1.fillType) {
			case ColorPaletteType.Single: {
				chartData.forEach((data) => {
					data.styles.circle1.fillColor = colorsSettings.circleFillColor;
				});
				break;
			}
			case ColorPaletteType.PowerBi: {
				chartData.forEach((data) => {
					// let colorCode = this.colorPalette.getColor(data.category).value.split('#')[1];
					// const circleFillColor = '#F2' + colorCode;
					data.styles.circle1.fillColor = this.colorPalette.getColor(data.category).value;
				});
				break;
			}
			case ColorPaletteType.Gradient: {
				const categoryDataLength = chartData.length;
				const domain =
					colorsSettings.midcolor && categoryDataLength > 2 ? [1, Math.round(categoryDataLength / 2), categoryDataLength] : [1, categoryDataLength];
				const range: any =
					colorsSettings.midcolor && categoryDataLength > 2
						? [colorsSettings.fillmax, colorsSettings.fillmid, colorsSettings.fillmin]
						: [colorsSettings.fillmax, colorsSettings.fillmin];

				this.gradientColorScale.domain(domain).range(range);
				chartData.forEach((data, i) => {
					const color: string = this.gradientColorScale(i + 1) + "";
					data.styles.circle1.fillColor = color;
				});
				break;
			}
			case ColorPaletteType.ByCategory: {
				break;
			}
			case ColorPaletteType.Sequential: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setBrushLollipopCircleSchemaColors(chartData, colorsSettings.schemeColors.reverse(), colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Diverging: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setBrushLollipopCircleSchemaColors(chartData, colorsSettings.schemeColors, colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Qualitative: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setBrushLollipopCircleSchemaColors(chartData, colorsSettings.schemeColors, colorsSettings.reverse, false);
				break;
			}
		}
	}

	drawBrushLollipopChart(clonedCategoricalData: powerbi.DataViewCategorical): void {
		const brushScaleBandwidth = this.brushScaleBand.bandwidth();
		const measures = clonedCategoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const data = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce((arr, cur, i) => {
			const obj = { category: cur, styles: { circle1: { fillColor: "" }, circle2: { fillColor: "" } } };
			measures.forEach((d, j) => {
				obj[`value${j + 1}`] = +d.values[i];
			})
			arr = [...arr, obj];
			return arr;
		}, []);
		this.setBrushLollipopCircleColors(data);

		const setVerticalLinesFormatting = (linesSelection) => {
			linesSelection
				.attr("x1", (d) => this.brushScaleBand(d.category) + brushScaleBandwidth / 2)
				.attr("x2", (d) => this.brushScaleBand(d.category) + brushScaleBandwidth / 2)
				.attr("y1", (d) => this.brushYScale(d.value1))
				.attr("y2", (d) => this.brushYScale(this.isHasMultiMeasure ? (d.value2 ? d.value2 : 0) : 0) + brushScaleBandwidth / 3)
				.attr("stroke", this.lineSettings.lineColor)
				.attr("stroke-width", brushScaleBandwidth / 4);
		}

		const setVerticalCircleFormatting = (circleSelection: any, isCircle2: boolean = false) => {
			circleSelection
				.attr("cx", (d) => {
					const cx = this.brushXScale(this.isHorizontalChart ? (isCircle2 ? d.value2 : d.value1) : d.category);
					return cx + brushScaleBandwidth / 2;
				})
				.attr("cy", (d) => {
					const cy = this.brushYScale(this.isHorizontalChart ? d.category : (isCircle2 ? d.value2 : d.value1));
					return cy;
				})
				.attr("r", brushScaleBandwidth / 3)
				.style("fill", (d: IBrushLollipopChartData) => isCircle2 ? d.styles.circle2.fillColor : d.styles.circle1.fillColor);
		}

		const setHorizontalLinesFormatting = (linesSelection) => {
			linesSelection
				.attr("x1", (d) => this.brushXScale(this.isHasMultiMeasure ? d.value2 : 0) - brushScaleBandwidth / 3)
				.attr("x2", (d) => this.brushXScale(d.value1))
				.attr("y1", (d) => this.brushYScale(d.category) + brushScaleBandwidth / 2)
				.attr("y2", (d) => this.brushYScale(d.category) + brushScaleBandwidth / 2)
				.attr("stroke", this.lineSettings.lineColor)
				.attr("stroke-width", brushScaleBandwidth / 4);
		}

		const setHorizontalCircleFormatting = (circleSelection: any, isCircle2: boolean = false) => {
			circleSelection
				.attr("cx", (d) => {
					const cx = this.brushXScale(this.isHorizontalChart ? (isCircle2 ? d.value2 : d.value1) : d.category);
					return cx;
				})
				.attr("cy", (d) => {
					const cy = this.brushYScale(this.isHorizontalChart ? d.category : (isCircle2 ? d.value2 : d.value1));
					return cy + brushScaleBandwidth / 2;
				})
				.attr("r", brushScaleBandwidth / 3)
				.style("fill", (d: IBrushLollipopChartData) => isCircle2 ? d.styles.circle2.fillColor : d.styles.circle1.fillColor);
		}

		const lollipopGSelection = this.brushLollipopG.selectAll(".brush-lollipop-group").data(data);
		lollipopGSelection.join(
			(enter) => {
				const lollipopG = enter.append("g").attr("class", "brush-lollipop-group");
				const lineSelection = lollipopG.append("line").attr("class", this.lineSettings.lineType).classed("brush-lollipop-line", true);
				const circle1Selection = lollipopG.append("circle").attr("class", "chart-circle1").classed(this.circleClass, true);

				if (this.isHorizontalChart) {
					setHorizontalCircleFormatting(circle1Selection);

					if (this.isHasMultiMeasure) {
						const circle2Selection = lollipopG.append("circle").attr("class", "chart-circle2").classed(this.circleClass, true);
						setHorizontalCircleFormatting(circle2Selection, true);
					}

					setHorizontalLinesFormatting(lineSelection);
				} else {
					setVerticalCircleFormatting(circle1Selection);

					if (this.isHasMultiMeasure) {
						const circle2Selection = lollipopG.append("circle").attr("class", "chart-circle2").classed(this.circleClass, true);
						setVerticalCircleFormatting(circle2Selection, true);
					}

					setVerticalLinesFormatting(lineSelection);
				}

				return lollipopG;
			},
			(update) => {
				const lineSelection = update.select(".brush-lollipop-line");
				const circle1Selection = update.select(".chart-circle1");
				const circle2Selection = update.select(".chart-circle2");

				if (this.isHorizontalChart) {
					setHorizontalLinesFormatting(lineSelection);

					setHorizontalCircleFormatting(circle1Selection);
					if (this.isHasMultiMeasure) {
						setHorizontalCircleFormatting(circle2Selection, true);
					} else {
						circle2Selection.remove();
					}
				} else {
					setVerticalLinesFormatting(lineSelection);

					setVerticalCircleFormatting(circle1Selection);
					if (this.isHasMultiMeasure) {
						setVerticalCircleFormatting(circle2Selection, true);
					} else {
						circle2Selection.remove();
					}

				}

				return update;
			}
		) as any;
	}

	private getColor(color: string, highContrastColorType: EHighContrastColorType): string {
		if (this._host.colorPalette.isHighContrast) {
			if (highContrastColorType == EHighContrastColorType.Foreground) {
				return this._host.colorPalette.foreground.value;
			} else if (highContrastColorType == EHighContrastColorType.Background) {
				return this._host.colorPalette.background.value;
			}
		}
		return color;
	}
}