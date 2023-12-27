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
import 'd3-transition';
import { easeLinear } from "d3";
import { IBrushLollipopChartData, IChartSubCategory, ILollipopChartRow, TooltipData } from "./model";
import {
	CircleType,
	ColorPaletteType,
	DataLabelsPlacement,
	EDataRolesName,
	EVisualConfig,
	EVisualSettings,
	ELineType,
	Orientation,
	PieType,
	Position,
	ESortOrderTypes,
	ERankingType,
	ESortByTypes,
	DataValuesType,
	ELegendPosition,
	EHighContrastColorType,
	EMarkerChartTypes,
	EMarkerTypes,
	EMarkerShapeTypes,
	EFontStyle,
	EMarkerDefaultShapes,
	ERelationshipToMeasure,
	EErrorBarsLabelFormat,
	EErrorBarsCalcTypes,
	EIBCSThemes,
	EMarkerColorTypes,
	ECFApplyOnCategories,
	EDynamicDeviationDisplayTypes,
	AxisCategoryType,
	EErrorBarsDirection,
	EDataColorsSettings,
} from "./enum";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { Shadow } from "@truviz/shadow/dist/Shadow";
import { ShadowUpdateOptions, landingPageProp } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";
import { Enumeration } from "./Enumeration";
import { paidProperties } from "./PaidProperties";
import { NumberFormatting, VisualSettings } from "./settings";
import {
	CHART_SETTINGS,
	MARKER_SETTINGS,
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
	PATTERN_SETTINGS,
	RACE_CHART_SETTINGS,
	ERROR_BARS_SETTINGS,
	IBCS_SETTINGS,
	DYNAMIC_DEVIATION_SETTINGS,
	CUT_AND_CLIP_AXIS_SETTINGS
} from "./constants";
import {
	EInsideTextColorTypes,
	IBCSSettings,
	IBrushAndZoomAreaSettings,
	IBrushConfig,
	ICategoryValuePair,
	IChartSettings,
	IConditionalFormattingProps,
	ICutAndClipAxisSettings,
	IDataColorsSettings,
	IDataLabelsSettings,
	IDynamicDeviationSettings,
	IErrorBarsMarker,
	IErrorBarsSettings,
	IFooterSettings,
	IGridLinesSettings,
	IHighContrastDetails,
	ILabelValuePair,
	ILegendSettings,
	ILineSettings,
	IMarkerSettings,
	IPatternProps,
	IPatternSettings,
	IPieSettings,
	IRaceChartSettings,
	IRankingSettings,
	IReferenceLineSettings,
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
import { GetWordsSplitByWidth, createMarkerDefs, createPatternsDefs, generatePattern, getSVGTextSize, hexToRGB, invertColorByBrightness, isConditionMatch, parseConditionalFormatting, powerBiNumberFormat, rgbaToHex } from "./methods/methods";
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

import MarkerSettings from "./settings-pages/MarkerSettings";
import ChartSettings from "./settings-pages/ChartSettings";
import DataColorsSettings from "./settings-pages/DataColorsSettings";
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
import RaceChartSettings from "./settings-pages/RaceChartSettings";
import ReferenceLinesSettings from "./settings-pages/ReferenceLines";

import { Components } from "@truviz/shadow/dist/types/EditorTypes";
import { CATEGORY_MARKERS } from "./settings-pages/markers";
import { IMarkerData } from "./settings-pages/markerSelector";
import { BrushAndZoomAreaSettingsIcon, ChartSettingsIcon, ConditionalFormattingIcon, CutAndClipAxisIcon, DataColorIcon, DataLabelsIcon, DynamicDeviationIcon, ErrorBarsIcon, FillPatternsIcon, GridIcon, LineSettingsIcon, MarkerSettingsIcon, RaceChartSettingsIcon, RankingIcon, ReferenceLinesIcon, ShowConditionIcon, SortIcon, XAxisSettingsIcon, YAxisSettingsIcon } from "./settings-pages/SettingsIcons";
import chroma from "chroma-js";
import { RenderRaceChartDataLabel, RenderRaceTickerButton, UpdateTickerButton } from "./methods/RaceChart.methods";
import { RenderReferenceLines, GetReferenceLinesData } from './methods/ReferenceLines.methods';
import ErrorBarsSettings from "./settings-pages/ErrorBarsSettings";
import { RenderErrorBand, RenderErrorBars } from "./methods/ErrorBars.methods";
import { ErrorBarsMarkers } from "./error-bars-markers";
import IBCSSettingsComponent from "./settings-pages/IBCSSettings";
import { ApplyIBCSTheme } from "./methods/IBCS.methods";
import { GetFormattedNumber, extractDigitsFromString } from "./methods/NumberFormat.methods";
import DynamicDeviationSettings from "./settings-pages/DynamicDeviationSettings";
import { RemoveDynamicDeviation, RenderDynamicDeviation, RenderDynamicDeviationIcon, SetDynamicDeviationDataAndDrawLines } from "./methods/DynamicDeviation.methods";
import { RenderConnectingLine } from "./methods/ConnectingLine.methods";
import TrendLinesSettings from "./settings-pages/TrendLinesSettings";
import CutAndClipAxisSettings from "./settings-pages/CutAndClipAxisSettings";
import { GetIsCutAndClipAxisEnabled, RenderBarCutAndClipMarker, RenderCutAndClipMarkerOnAxis } from "./methods/CutAndClipMarker.methods";
import { CallLinearCutScaleOnAxisGroup, GetCutAndClipXScale, GetCutAndClipYScale, RenderLinearCutAxis, SetLinearCutAxisRange } from "./methods/CutAndClip.methods";
import { GetAxisDomainMinMax } from "./methods/Axis.methods";
import { CallXScaleOnAxisGroup, GetPositiveNegativeLogXScale } from "./methods/XAxis.methods";
import { CallYScaleOnAxisGroup, GetPositiveNegativeLogYScale } from "./methods/YAxis.methods";

type D3Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class Visual extends Shadow {
	public chartContainer: HTMLElement;
	public hostContainer: HTMLElement;
	public vizOptions: ShadowUpdateOptions;
	public selectionManager: ISelectionManager;
	public tooltipServiceWrapper: ITooltipServiceWrapper;
	public colorPalette: IColorPalette;
	public _events: IVisualEventService;
	public _host: IVisualHost;
	public formatNumber: (value: number | string, numberSettings: NumberFormatting, numberFormatter: IValueFormatter, isUseSematicFormat: boolean, isMinThousandsLimit: boolean) => string;
	public interactivityService: interactivityBaseService.IInteractivityService<any>;
	public behavior: Behavior;
	public visualHost: IVisualHost;

	// props
	public width: number;
	public height: number;
	public settingsBtnHeight: number = 40;
	public settingsBtnWidth: number = 152;
	public viewPortWidth: number;
	public viewPortHeight: number;
	public margin: { top: number; right: number; bottom: number; left: number };
	public chartData: ILollipopChartRow[];
	public isInFocusMode: boolean = false;
	public isVisualResized: boolean = false;
	public footerHeight: number = 0;
	private highContrastDetails: IHighContrastDetails = { isHighContrast: false };
	public isPatternApplied: boolean;
	public isLollipopTypeCircle: boolean;
	public isLollipopTypePie: boolean;
	public isChartIsRaceChart: boolean;

	// CATEGORICAL DATA
	public originalCategoricalData: powerbi.DataViewCategorical;
	public clonedCategoricalData: powerbi.DataViewCategorical;
	public categoricalData: powerbi.DataViewCategorical;
	public categoricalMetadata: any;
	public categoricalCategoriesFields: powerbi.DataViewCategoryColumn[] = [];
	public categoricalRaceChartDataFields: powerbi.DataViewCategoryColumn[] = [];
	public categoricalMeasureFields: powerbi.DataViewValueColumn[] = [];
	public categoricalMeasure1Field: powerbi.DataViewValueColumn;
	public categoricalMeasure2Field: powerbi.DataViewValueColumn;
	public categoricalTooltipFields: powerbi.DataViewValueColumn[] = [];
	public categoricalSortFields: powerbi.DataViewValueColumn[] = [];
	public categoricalReferenceLinesDataFields: powerbi.DataViewValueColumn[] = [];
	public categoricalImagesDataFields: powerbi.DataViewValueColumn[] = [];
	public categoricalUpperBoundFields: powerbi.DataViewValueColumn[] = [];
	public categoricalLowerBoundFields: powerbi.DataViewValueColumn[] = [];
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
	upperBoundMeasureNames: string[] = [];
	lowerBoundMeasureNames: string[] = [];
	imagesDataFieldsName: string[] = [];
	subCategoriesName: string[] = [];
	measure1DisplayName: string;
	measure2DisplayName: string;
	isHasMultiMeasure: boolean;
	isHasSubcategories: boolean;
	isHasCategories: boolean;
	isHasImagesData: boolean;
	isSortDataFieldsAdded: boolean;
	sortFieldsDisplayName: ILabelValuePair[] = [];
	blankText: string = "(Blank)";
	othersBarText = "Others";
	totalLollipopCount: number = 0;
	conditionalFormattingConditions: IConditionalFormattingProps[] = [];
	categoriesColorList: { name: string, marker: string }[] = [];
	subCategoriesColorList: { name: string, marker: string }[] = [];
	categoryColorPairWithIndex: { [category: string]: { marker1Color: string, marker2Color: string } } = {};
	subCategoryColorPairWithIndex: { [subCategory: string]: { marker1Color: string, marker2Color: string } } = {};
	categoryColorPair: { [category: string]: { marker1Color: string, marker2Color: string } } = {};
	subCategoryColorPair: { [subCategory: string]: { marker1Color: string, marker2Color: string } } = {};
	isHasNegativeValue: boolean;
	markerMaxSize: number = 0;
	minMaxValuesByMeasures: { [measure: string]: { min: number, max: number } } = {};
	measureNamesByTotal: { name: string, total: number }[] = [];
	groupNamesByTotal: { name: string, total: number }[] = [];

	// selection id
	selectionIdByCategories: { [category: string]: ISelectionId } = {};
	selectionIdBySubCategories: { [subcategory: string]: ISelectionId } = {};

	// number formatter
	public measureNumberFormatter: IValueFormatter[] = [];
	public tooltipNumberFormatter: IValueFormatter[] = [];
	public sortValuesNumberFormatter: IValueFormatter[] = [];
	public allNumberFormatter: { [name: string]: { formatter: IValueFormatter; role: EDataRolesName } } = {};

	// svg
	public svg: D3Selection<SVGElement>;
	public container: any;
	public scaleBandWidth: number;
	public computedTextEle: any;
	public gradientColorScale = d3.scaleLinear();

	// brush
	public brushScaleBand: any;
	public brushXScale: any;
	public brushYScale: any;
	public newScaleDomainByBrush: string[] = [];
	public brushScaleBandBandwidth: number = 0;
	public brushG: D3Selection<SVGElement>;
	public brushLollipopG: D3Selection<SVGElement>;
	public brushHeight: number = 0;
	public brushWidth: number = 0;
	public isHorizontalBrushDisplayed: boolean;
	public isVerticalBrushDisplayed: boolean;
	public minScaleBandWidth: number = 0;
	public isScrollBrushDisplayed: boolean;
	public brushXAxisG: D3Selection<SVGElement>;
	public brushXAxisTicksMaxHeight: number = 0;
	public brushAndZoomAreaMinHeight: number = 40;
	public brushAndZoomAreaMaxHeight: number = 80;
	public brushAndZoomAreaHeight: number = 0;
	public brushYAxisG: D3Selection<SVGElement>;
	public brushYAxisTicksMaxWidth: number = 0;
	public brushAndZoomAreaMinWidth: number = 60;
	public brushAndZoomAreaMaxWidth: number = 120;
	public brushAndZoomAreaWidth: number = 0;

	// axis
	public zeroSeparatorLine: D3Selection<SVGElement>;
	public axisByBarOrientation: Partial<IXAxisSettings | IYAxisSettings>;
	public xScaleRange: number[];
	public yScaleRange: number[];
	public xScaleMinRange: number;
	public xScaleMaxRange: number;
	public yScaleMinRange: number;
	public yScaleMaxRange: number;

	// xAxis
	public xAxisG: D3Selection<SVGElement>;
	public xAxisLineG: D3Selection<SVGElement>;
	public xScale: any;
	public xAxisTitleMargin: number = 0;
	public xAxisTitleG: D3Selection<SVGElement>;
	public xAxisTitleText: any;
	public xAxisTitleSize: { width: number; height: number };
	public xScaleGHeight: number = 0;
	public xScaleWidth: number;
	public xScalePaddingOuter: number = 0.25;
	public isBottomXAxis: boolean;
	public xAxisStartMargin: number = 10;
	public isXIsNumericAxis: boolean;
	public isXIsDateTimeAxis: boolean;
	public isXIsContinuousAxis: boolean;

	// yAxis
	public yAxisG: D3Selection<SVGElement>;
	public yAxisLineG: D3Selection<SVGElement>;
	public yScale: any;
	public yScale2: any;
	public yAxisTitleText: any;
	public yAxisTitleMargin: number = 0;
	public yAxisTitleG: D3Selection<SVGElement>;
	public yAxisTitleSize: { width: number; height: number };
	public yScaleGWidth: number = 0;
	public yScaleHeight: number;
	public isLeftYAxis: boolean;
	public categoryLabelHeight: number;
	public categoryLabelMargin: number = 10;
	public yAxisStartMargin: number = 10;
	public yAxisTicksMaxWidthRatio: number = 0.1;
	public isYIsNumericAxis: boolean;
	public isYIsDateTimeAxis: boolean;
	public isYIsContinuousAxis: boolean;

	// EXPAND ALL
	public expandAllXAxisG: D3Selection<SVGElement>;
	public expandAllYAxisG: D3Selection<SVGElement>;
	public expandAllXScaleGHeight: number = 0;
	public expandAllYScaleGWidth: number = 0;
	public expandAllCategoriesName: string[] = [];
	public isIdToCategoryAdded: boolean = false;
	public isExpandAllApplied: boolean = false;
	public expandAllYAxisMaxCharsLength: number = 8;
	public expandAllYScaleWidth: { [displayName: string]: number } = {};

	// lollipop
	public lollipopSelection: D3Selection<SVGElement>;
	public lollipopG: D3Selection<SVGElement>;

	// line
	public lineSelection: any;
	public lineG: any;
	public lineClass: string = "lollipop-line";
	public lineClassSelector: string = ".lollipop-line";

	// circle
	public circleClass: string = "lollipop-circle";
	public circleClassSelector: string = ".lollipop-circle";
	public minCircleSize: number = 15;
	public maxCircleSize: number = 40;
	public brushAndZoomAreaCircleMinSize: number = 10;
	public brushAndZoomAreaCircleMaxSize: number = 40;
	public brushAndZoomAreaCircleSize: number = 12;

	// circle1
	public circle1G: any;
	public circle1Selection: any;
	public circle1Size: any;
	public circle1Class: string = "lollipop-circle1";
	public circle1ClassSelector: string = ".lollipop-circle1";

	// circle2
	public circle2G: any;
	public circle2Selection: any;
	public circle2Size: number;
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
	pieEmphasizeScaleSize: number = 4;
	pieViewBoxRatio: number = 100 - this.pieEmphasizeScaleSize;
	isRankingSettingsChanged: boolean = false;
	public minPieSize: number = 25;
	public maxPieSize: number = 40;

	// connecting line
	public connectingLineG: D3Selection<SVGElement>;

	// pie1
	ePie1ChartOptions: EChartsOption;
	pie1Radius: number;

	// pie2
	ePie2ChartOptions: EChartsOption;
	pie2Radius: number;

	// show bucket
	isValidShowBucket = true;
	isShowBucketChartFieldCheck: boolean;
	isShowBucketChartFieldName: string;

	// annotations
	annotationBarClass: string = "annotation-slice";
	visualAnnotations: VisualAnnotations;

	// patterns
	categoryPatterns: IPatternProps[] = [];
	subCategoryPatterns: IPatternProps[] = [];

	// image marker
	isShowImageMarker: boolean;
	imageMarkerClass: string = "image-marker";
	imageMarkerClassSelector: string = ".image-marker";

	// chart race
	ticker: any;
	tickerButtonG: any;
	isTickerButtonDrawn: boolean = false;
	tickIndex: number = -1;
	tickDuration: number = 0;
	maxLollipopCount: number = 2;
	raceChartKeysList: string[] = [];
	raceChartKeysLength: number;
	raceChartKeyOnTick: string;
	raceChartDataLabelOnTick: string;
	raceChartData: ILollipopChartRow[] = [];
	isRacePlaying: boolean = false;
	isLabelWithoutTransition: boolean = true;
	raceChartKeyLabelList: { key: string, label: string }[] = [];

	// chart race labels
	raceChartDataLabelG: any;
	raceChartDataLabelText: any;
	isRaceChartDataLabelDrawn: boolean = false;
	formatRaceChartDataLabel = d3.timeFormat("%d %b %y");

	// reference lines
	referenceLinesData: IReferenceLineSettings[] = [];
	categoricalReferenceLinesNames: string[] = [];
	referenceLinesContainerG: D3Selection<SVGElement>;
	referenceLineLayersG: D3Selection<SVGElement>;

	// Error Bars
	isShowErrorBars: boolean;
	isHasErrorUpperBounds: boolean;
	isHasErrorLowerBounds: boolean;
	errorBarsContainer: D3Selection<SVGElement>;
	errorBarsLinesG: D3Selection<SVGElement>;
	errorBarsLinesDashG: D3Selection<SVGElement>;
	errorBarsMarkerDefsG: D3Selection<SVGElement>;
	errorBarsAreaG: D3Selection<SVGElement>;
	errorBarsAreaPath: D3Selection<SVGElement>;
	errorBarsMarkersG: D3Selection<SVGElement>;
	errorBarsLabelsG: D3Selection<SVGElement>;
	errorBarsMarkerDef: D3Selection<SVGElement>;
	errorBarsMarker: D3Selection<SVGElement>;
	errorBarsMarkerPath: D3Selection<SVGElement>;

	// IBCS
	selectedIBCSTheme: EIBCSThemes;
	isIBCSEnabled: boolean = false;
	beforeIBCSSettings: { [settingsName: string]: { configName: EVisualConfig, settingName: EVisualSettings, configValues: any } };

	// legend
	legends: {
		legendItems: D3Selection<SVGElement>, legendWrapper: D3Selection<SVGElement>
	};
	legendData: { data: { name: string, color: string, pattern: IPatternProps } }[] = [];
	legendViewPort: { width: number; height: number } = {
		width: 0,
		height: 0,
	};
	legendPosition: { top: boolean, bottom: boolean, left: boolean, right: boolean } = { top: false, bottom: false, left: false, right: false };

	// dynamic deviation
	dynamicDeviationG: any;
	isDynamicDeviationButtonSelected: boolean;
	isDeviationCreatedAfterButtonClicked: boolean;
	firstCategoryValueDataPair: ICategoryValuePair;
	lastCategoryValueDataPair: ICategoryValuePair;
	minCategoryValueDataPair: ICategoryValuePair;
	maxCategoryValueDataPair: ICategoryValuePair;
	fromCategoryValueDataPair: ICategoryValuePair;
	toCategoryValueDataPair: ICategoryValuePair;
	DDConnectorFill: string;

	// Cut & Clip
	isLastChartTypeIsHorizontal: boolean;
	isShowRegularXAxis: boolean;
	isShowRegularYAxis: boolean;
	isCutAndClipAxisEnabled: boolean;
	isCutAndClipAxisEnabledLastValue: boolean;
	beforeCutLinearXAxisG: any;
	afterCutLinearXAxisG: any;
	beforeCutLinearYAxisG: any;
	afterCutLinearYAxisG: any;
	beforeCutLinearScale: any;
	afterCutLinearScale: any;
	beforeCutLinearScaleArea: number;
	afterCutLinearScaleArea: number;
	barCutAndClipMarkersG: any;
	axisCutAndClipMarkerG: any;
	barCutAndClipMarkerLinesGap: number = 6;
	cutAndClipMarkerTilt: number = 15;
	cutAndClipMarkerWidth: number = 6;
	cutAndClipMarkerHeight: number = 6;
	cutAndClipMarkerDiff: number = 8;

	// LOG SCALE
	positiveLogXAxisG: any;
	negativeLogXAxisG: any;
	positiveLogYAxisG: any;
	negativeLogYAxisG: any;
	positiveLogScale: any;
	negativeLogScale: any;
	positiveLogScaleWidth: any;
	negativeLogScaleWidth: any;
	positiveLogScaleHeight: any;
	negativeLogScaleHeight: any;
	isLogarithmScale: boolean;
	isShowPositiveNegativeLogScale: boolean;
	isLinearScale: boolean;
	axisDomainMinValue: number = 0;
	axisDomainMaxValue: number = 0;
	positiveLogScaleTicks: number[] = [];
	negativeLogScaleTicks: number[] = [];

	// settings
	isHorizontalChart: boolean = false;
	chartSettings: IChartSettings;
	markerSettings: IMarkerSettings;
	dataLabelsSettings: IDataLabelsSettings;
	xAxisSettings: IXAxisSettings;
	yAxisSettings: IYAxisSettings;
	lineSettings: ILineSettings;
	pieSettings: IPieSettings;
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
	raceChartSettings: IRaceChartSettings;
	referenceLinesSettings: IReferenceLineSettings[] = [];
	errorBarsSettings: IErrorBarsSettings;
	// IBCSSettings: IBCSSettings;
	dynamicDeviationSettings: IDynamicDeviationSettings;
	lastDynamicDeviationSettings: IDynamicDeviationSettings;
	cutAndClipAxisSettings: ICutAndClipAxisSettings;

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
			valueRole: [EDataRolesName.Measure, EDataRolesName.Tooltip, EDataRolesName.ImagesData],
			measureRole: [EDataRolesName.Category, EDataRolesName.SubCategory, EDataRolesName.RaceChartData],
			CFConfig: {
				isSupportApplyOn: true, applyOnCategories: [
					{ label: "Marker", value: ECFApplyOnCategories.Marker },
					{ label: "Line", value: ECFApplyOnCategories.Line },
					{ label: "Labels", value: ECFApplyOnCategories.Labels },
				]
			},
			categoricalGroupByRole: [EDataRolesName.SubCategory],
			components: [
				{
					name: "Chart",
					sectionName: "chartConfig",
					propertyName: "chartSettings",
					Component: () => ChartSettings,
					icon: ChartSettingsIcon
				},
				{
					name: "Marker",
					sectionName: "markerConfig",
					propertyName: "markerSettings",
					Component: () => MarkerSettings,
					icon: MarkerSettingsIcon
				},
				{
					name: "Line",
					sectionName: "lineConfig",
					propertyName: "lineSettings",
					Component: () => LineSettings,
					icon: LineSettingsIcon
				},
				{
					name: "Data Colors",
					sectionName: "dataColorsConfig",
					propertyName: "dataColorsSettings",
					Component: () => DataColorsSettings,
					icon: DataColorIcon
				},
				{
					name: "Data Labels",
					sectionName: "dataLabelsConfig",
					propertyName: "dataLabelsSettings",
					Component: () => DataLabelsSettings,
					icon: DataLabelsIcon
				},
				{
					name: "Brush And Zoom Area",
					sectionName: "brushAndZoomAreaConfig",
					propertyName: "brushAndZoomAreaSettings",
					Component: () => BrushAndZoomAreaSettings,
					icon: BrushAndZoomAreaSettingsIcon
				},
				{
					name: "Race Chart",
					sectionName: EVisualConfig.RaceChartConfig,
					propertyName: EVisualSettings.RaceChartSettings,
					Component: () => RaceChartSettings,
					icon: RaceChartSettingsIcon
				},
				{
					name: "Reference Line/Band",
					sectionName: "referenceLinesConfig",
					propertyName: "referenceLinesSettings",
					Component: () => ReferenceLinesSettings,
					icon: ReferenceLinesIcon,
				},
				{
					name: "Error Bars",
					sectionName: "errorBarsConfig",
					propertyName: "errorBarsSettings",
					Component: () => ErrorBarsSettings,
					icon: ErrorBarsIcon
				},
				{
					name: "Dynamic Deviation",
					sectionName: "dynamicDeviationConfig",
					propertyName: "dynamicDeviationSettings",
					Component: () => DynamicDeviationSettings,
					icon: DynamicDeviationIcon
				},
				{
					name: "Trend Lines",
					sectionName: EVisualConfig.TrendLinesConfig,
					propertyName: EVisualSettings.TrendLinesSettings,
					Component: () => TrendLinesSettings,
				},
				{
					name: "Cut/Clip Axis",
					sectionName: "cutAndClipAxisConfig",
					propertyName: "cutAndClipAxisSettings",
					Component: () => CutAndClipAxisSettings,
					icon: CutAndClipAxisIcon
				},
				// {
				// 	name: "IBCS Themes",
				// 	sectionName: EVisualConfig.IBCSConfig,
				// 	propertyName: EVisualSettings.IBCSSettings,
				// 	Component: () => IBCSSettingsComponent,
				// },
				{
					name: "X Axis",
					sectionName: EVisualConfig.XAxisConfig,
					propertyName: EVisualSettings.XAxisSettings,
					Component: () => XAxisSettings,
					icon: XAxisSettingsIcon
				},
				{
					name: "Y Axis",
					sectionName: EVisualConfig.YAxisConfig,
					propertyName: EVisualSettings.YAxisSettings,
					Component: () => YAxisSettings,
					icon: YAxisSettingsIcon
				},
				{
					name: "Fill Patterns",
					sectionName: "patternConfig",
					propertyName: "patternSettings",
					Component: () => PatternSettings,
					icon: FillPatternsIcon
				},
				{
					name: "Ranking",
					sectionName: "rankingConfig",
					propertyName: "rankingSettings",
					Component: () => RankingSettings,
					icon: RankingIcon
				},
				{
					name: "Sorting",
					sectionName: "sortingConfig",
					propertyName: "sorting",
					Component: () => SortingSettings,
					icon: SortIcon
				},
				{
					name: "Conditional Formatting",
					sectionName: "editor",
					propertyName: "conditionalFormatting",
					Component: Components.ConditionalFormatting,
					icon: ConditionalFormattingIcon
				},
				{
					name: "Grid Lines",
					sectionName: "gridLinesConfig",
					propertyName: "gridLinesSettings",
					Component: () => GridLinesSettings,
					icon: GridIcon
				},
				{
					name: "Show Condition",
					sectionName: "showBucketConfig",
					propertyName: "showBucket",
					Component: () => ShowBucket,
					icon: ShowConditionIcon
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
		this.visualHost = options.host;
		this.selectionManager = options.host.createSelectionManager();
		this.interactivityService = interactivitySelectionService.createInteractivitySelectionService(this._host) as any;
		this.behavior = new Behavior();
		// this.initChart();
	}

	public getEnumeration(): EnumerateSectionType[] {
		return Enumeration.GET();
	}

	public initChart(): void {
		this.margin = { top: 10, right: 30, bottom: this.xAxisTitleMargin, left: this.yAxisTitleMargin };

		this.svg = d3.select(this.chartContainer).append("svg").classed("lollipopChart", true);

		this.brushG = this.svg.append("g").attr("class", "brush");

		this.brushLollipopG = this.brushG.append("g").attr("class", "brushLollipopG");

		this.brushXAxisG = this.svg.append("g").classed("brushXAxisG", true);

		this.brushYAxisG = this.svg.append("g").classed("brushYAxisG", true);

		this.container = this.svg.append("g").classed("container", true);

		this.zeroSeparatorLine = this.container.append("line").classed("zeroSeparatorLine", true);

		this.xGridLinesG = this.container.append("g").classed("xGridLinesG", true);

		this.yGridLinesG = this.container.append("g").classed("yGridLinesG", true);

		this.connectingLineG = this.container.append("g").classed("connectingLineG", true);

		this.lollipopG = this.container.append("g").classed("lollipopG", true);

		this.lineG = this.container.append("g").classed("lineG", true);

		this.circle1G = this.container.append("g").classed("circle1G", true);

		this.circle2G = this.container.append("g").classed("circle2G", true);

		this.xAxisG = this.container.append("g").classed("xAxisG", true);

		this.xAxisLineG = this.container.append("g").classed("xAxisLineG", true);

		this.expandAllXAxisG = this.container.append("g").classed("expandAllXAxisG", true);

		this.yAxisG = this.container.append("g").classed("yAxisG", true);

		this.yAxisLineG = this.container.append("g").classed("yAxisLineG", true);

		this.expandAllYAxisG = this.container.append("g").classed("expandAllYAxisG", true);

		this.xAxisTitleG = this.container.append("g").classed("xAxisTitleG", true);

		this.xAxisTitleText = this.xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");

		this.yAxisTitleG = this.container.append("g").classed("yAxisTitleG", true);

		this.yAxisTitleText = this.yAxisTitleG.append("text").classed("yAxisTitle", true).attr("transform", "rotate(-90)").attr("text-anchor", "middle");

		this.dataLabels1G = this.container.append("g").classed("dataLabels1G", true);

		this.dataLabels2G = this.container.append("g").classed("dataLabels2G", true);

		this.errorBarsContainer = this.container.append("g").classed("errorBarsContainer", true);

		this.errorBarsMarkerDefsG = this.errorBarsContainer.append("g").classed("errorBarsMarkerDefsG", true);

		this.errorBarsAreaG = this.errorBarsContainer.append("g").classed("errorBarsAreaG", true);

		this.errorBarsAreaPath = this.errorBarsAreaG.append("path").attr("class", "errorBarsArea");

		this.errorBarsLinesDashG = this.errorBarsContainer.append("g").classed("errorBarsLinesDashG", true);

		this.errorBarsLinesG = this.errorBarsContainer.append("g").classed("errorBarsLinesG", true);

		this.errorBarsMarkersG = this.errorBarsContainer.append("g").classed("errorBarsMarkersG", true);

		this.errorBarsLabelsG = this.errorBarsContainer.append("g").classed("errorBarsLabelsG", true);

		this.errorBarsMarkerDef = this.errorBarsMarkersG.append("defs").attr("class", "errorBarsMarkerDefs");

		this.errorBarsMarker = this.errorBarsMarkerDef.append("marker").attr("class", "errorBarsMarker");

		this.errorBarsMarkerPath = this.errorBarsMarker.append("path").attr("class", "errorBarsMarkerPath");

		this.computedTextEle = this.container.append("g").append("text");

		this.barCutAndClipMarkersG = this.container.append("g").classed("barCutAndClipMarkersG", true);

		this.axisCutAndClipMarkerG = this.container.append("g").classed("axisCutAndClipMarkerG", true);

		this.referenceLineLayersG = this.container.append("g").classed("referenceLineLayersG", true);

		this.referenceLinesContainerG = this.container.append("g").classed("referenceLinesContainerG", true);

		this.dynamicDeviationG = this.container.append("g").classed("dynamicDeviationG", true);

		this.tickerButtonG = this.svg.append("g").classed("tickerButtonG", true);

		this.raceChartDataLabelG = this.svg.append("g").classed("raceChartDataLabelG", true);

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
			const measureIndex = `${EDataRolesName.Measure}${index}`;

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

		if (this.isHasMultiMeasure || this.isHasSubcategories) {
			sortByMultiMeasure(measureKeys);
		} else {
			sortByMeasure(categoricalMeasureFields);
		}
	}

	getXScaleInnerPadding(): number {
		const innerPaddingScale = d3.scaleLinear().domain([0, 100]).range([0, 0.5]);
		return innerPaddingScale(this.chartSettings.lollipopInnerPadding);
	}

	getXPosition(value: number | string): number {
		const xPosition = this.xScale(value);

		if (xPosition > this.xScaleMaxRange) {
			return this.xScaleMaxRange;
		}

		if (xPosition < this.xScaleMinRange) {
			return this.xScaleMinRange;
		}

		return xPosition;
	}

	getYPosition(value: number | string): number {
		const yPosition = this.yScale(value);

		if (yPosition > this.yScaleMaxRange) {
			return this.yScaleMaxRange;
		}

		if (yPosition < this.yScaleMinRange) {
			return this.yScaleMinRange;
		}

		return yPosition;
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
		const categoricalRaceBarValues = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.RaceChartData]);
		const categoricalSubCategoryField = categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		const categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		const categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		const categoricalImageDataFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ImagesData]);
		const categoricalUpperBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.UpperBound]);
		const categoricalLowerBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.LowerBound]);

		const categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.isHasSubcategories = !!categoricalSubCategoryField;
		this.isHasImagesData = !!categoricalImageDataFields;
		this.measureNames = [...new Set(categoricalMeasureFields.map((d) => d.source.displayName))] as any;
		this.upperBoundMeasureNames = [...new Set(categoricalUpperBoundFields.map((d) => d.source.displayName))] as any;
		this.lowerBoundMeasureNames = [...new Set(categoricalLowerBoundFields.map((d) => d.source.displayName))] as any;
		this.isHasMultiMeasure = this.measureNames.length > 1;
		this.isHasErrorLowerBounds = categoricalLowerBoundFields.length > 0;
		this.isHasErrorUpperBounds = categoricalUpperBoundFields.length > 0;
		this.isShowErrorBars = this.errorBarsSettings.isEnabled;
		this.errorBarsSettings.isEnabled = this.errorBarsSettings.isEnabled && this.isShowErrorBars;

		this.isXIsNumericAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.numeric;
		this.isYIsNumericAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.numeric;

		this.isXIsDateTimeAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.dateTime;
		this.isYIsDateTimeAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.dateTime;

		this.isXIsContinuousAxis = (this.isXIsNumericAxis || this.isXIsDateTimeAxis) && this.xAxisSettings.categoryType === AxisCategoryType.Continuous;
		this.isYIsContinuousAxis = (this.isYIsNumericAxis || this.isYIsDateTimeAxis) && this.yAxisSettings.categoryType === AxisCategoryType.Continuous;

		if (!this.upperBoundMeasureNames.includes(this.errorBarsSettings.measurement.upperBoundMeasure)) {
			this.errorBarsSettings.measurement.upperBoundMeasure = undefined;
		}

		if (!this.lowerBoundMeasureNames.includes(this.errorBarsSettings.measurement.lowerBoundMeasure)) {
			this.errorBarsSettings.measurement.lowerBoundMeasure = undefined;
		}

		if (this.markerSettings.markerType === EMarkerTypes.CHART && !this.isHasSubcategories) {
			this.markerSettings.markerType = EMarkerTypes.SHAPE;
		}

		if (!this.errorBarsSettings.measurement.applySettingsToMeasure) {
			this.errorBarsSettings.measurement.applySettingsToMeasure = this.measureNames[0];
		}

		if (!this.errorBarsSettings.measurement.upperBoundMeasure) {
			this.errorBarsSettings.measurement.upperBoundMeasure = this.upperBoundMeasureNames[0];
		}

		if (!this.errorBarsSettings.measurement.lowerBoundMeasure) {
			this.errorBarsSettings.measurement.lowerBoundMeasure = this.lowerBoundMeasureNames[0];
		}

		if (this.errorBarsSettings.measurement.makeSymmetrical) {
			this.isHasErrorLowerBounds = true;
		}

		this.isLollipopTypeCircle = this.markerSettings.markerType === EMarkerTypes.SHAPE;
		this.isLollipopTypePie = this.markerSettings.markerType === EMarkerTypes.CHART;

		if ((this.isHasMultiMeasure || this.isLollipopTypePie) && this.dataColorsSettings.fillType === ColorPaletteType.ByCategory) {
			this.dataColorsSettings.fillType = ColorPaletteType.Single;
		}

		if (this.isLollipopTypeCircle) {
			this.minScaleBandWidth = 25;
		} else {
			this.minScaleBandWidth = 50;
		}

		this.setNumberFormatters(categoricalMeasureFields, categoricalTooltipFields, categoricalSortFields);

		this.categoryDisplayName = categoricalData.categories[this.categoricalCategoriesLastIndex].source.displayName;
		this.subCategoryDisplayName = categoricalSubCategoryField ? categoricalSubCategoryField.displayName : "";

		const categoricalCategoriesValues = categoricalData.categories[this.categoricalCategoriesLastIndex];
		let categories = categoricalCategoriesValues.values.filter((item, i, ar) => ar.indexOf(item) === i);
		categories = categories.length > 0 ? categories : [];

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

		this.measure1DisplayName = categoricalMeasureFields.length > 0 ? categoricalMeasureFields[0].source.displayName : undefined;
		this.measure2DisplayName = this.isHasMultiMeasure && categoricalMeasureFields.length > 1 ? categoricalMeasureFields[1].source.displayName : undefined;

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

		this.measureNamesByTotal = [];
		const measureGroup = d3.group(categoricalMeasureFields, d => d.source.displayName);
		[...new Set(measureGroup.keys())].forEach(d => {
			this.measureNamesByTotal.push({ name: d, total: d3.max(measureGroup.get(d), d => d3.sum(d.values, t => +t)) });
		});

		this.measureNamesByTotal = this.measureNamesByTotal.sort((a, b) => b.total - a.total);

		if (this.isLollipopTypePie) {
			this.groupNamesByTotal = [];
			const subCategoriesGroup = d3.group(categoricalMeasureFields.filter(d => d.source.displayName === (this.dataColorsSettings.gradientAppliedToMeasure === EMarkerColorTypes.Marker1 ? this.measure1DisplayName : this.measure2DisplayName)), d => d.source.groupName);
			[...new Set(subCategoriesGroup.keys())].forEach(d => {
				this.groupNamesByTotal.push({ name: d.toString(), total: d3.max(subCategoriesGroup.get(d.toString()), m => d3.sum(m.values, t => +t)) });
			});

			this.groupNamesByTotal.sort((a, b) => b.total - a.total);
		}

		this.setCategoricalDataBySubcategoryRanking(categoricalData);

		const getRaceBarKey = (index) => {
			return categoricalRaceBarValues.reduce((str, cur) => {
				str = str + "-" + cur.values[index]
				return str;
			}, '');
		}

		if (categoricalRaceBarValues.length > 0) {
			let raceBarKeys = [];
			const categoricalDataPairsForGrouping = categoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce(
				(arr, category: string, index: number) => {
					const obj = { category: category, [`index-${index}`]: index };
					return [...arr, obj];
				},
				[]
			);

			const raceBarDataPairsForGrouping = categoricalData.categories[this.categoricalCategoriesLastIndex].values.reduce(
				(arr, category: string, index: number) => {
					const raceBarKey = getRaceBarKey(index);
					raceBarKeys.push(raceBarKey);
					const obj = { category: category, raceBarKey };
					return [...arr, obj];
				},
				[]
			);

			raceBarKeys = raceBarKeys.filter((item, i, ar) => ar.indexOf(item) === i && item);
			const raceBarValueGroup = d3.group(raceBarDataPairsForGrouping, (d: any) => d.raceBarKey);
			const isRacePossible = raceBarKeys.some(d => raceBarValueGroup.get(d).length > 1);
			this.isChartIsRaceChart = isRacePossible;

			if (this.isChartIsRaceChart) {
				const categoricalDataPairsGroup = d3.group(categoricalDataPairsForGrouping, (d: any) => d.category);
				this.categoricalDataPairs = categories.map((category) =>
					Object.assign({}, ...categoricalDataPairsGroup.get(category))
				);
			}
		} else {
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
		}

		// this.categoricalDataPairs = this.categoricalDataPairs.filter(d => d.category !== null && d.category !== undefined);

		const measureKeys = categoricalMeasureFields.map((d) => this.isHasSubcategories ? (EDataRolesName.Measure + d.source.index + d.source.groupName) : (EDataRolesName.Measure + d.source.index));

		// this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !d.hasNegative && !d.hasZero);
		this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !measureKeys.every((m) => d[m] === 0));

		this.defaultSortCategoryDataPairs(this.categoricalDataPairs, measureKeys, categoricalMeasureFields);

		this.setCategoricalDataPairsByRanking();

		// set colors for all pairs
		this.categoricalDataPairs.forEach((data, i) => {
			this.categoryColorPairWithIndex[`${i}-${data.category}`] = { marker1Color: "", marker2Color: "" };
		});

		this.subCategoriesName.forEach((name, i) => {
			this.subCategoryColorPairWithIndex[`${i}-${name}`] = { marker1Color: "", marker2Color: "" };
		});

		this.setColorsByDataColorsSettings();

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

		const clonedCategoricalRaceBarValues = clonedCategoricalData.categories.filter(
			(value) => value.source.roles[EDataRolesName.RaceChartData]
		);

		if (this.isChartIsRaceChart) {
			let iterator: number = 0;
			this.categoricalDataPairs.forEach((dataPair) => {
				const keys = Object.keys(dataPair).splice(1);
				keys.forEach((key) => {
					const index = +key.split("-")[1];
					categoricalData.categories[this.categoricalCategoriesLastIndex].values[iterator] = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values[index];

					if (this.isChartIsRaceChart) {
						categoricalRaceBarValues.forEach((categoricalRaceBarValue, i: number) => {
							categoricalRaceBarValue.values[iterator] = clonedCategoricalRaceBarValues[i].values[index];
						});
					}

					categoricalData.values.forEach((categoricalValue, i: number) => {
						categoricalValue.values[iterator] = clonedCategoricalData.values[i].values[index];

						if (categoricalValue.highlights) {
							categoricalValue.highlights[iterator] = clonedCategoricalData.values[i].highlights[index];
						}
					});

					iterator++;
				});
			});
		} else {
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
		}

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

		const dataLength = categoricalData.categories[this.categoricalCategoriesLastIndex].values.length;

		this.setBrushScaleBandDomain(clonedCategoricalData);
		this.setBrushScaleBandRange(width, height);

		if (
			this.chartSettings.lollipopWidth > this.minScaleBandWidth &&
			!this.chartSettings.isAutoLollipopWidth
		) {
			this.brushScaleBandBandwidth = this.chartSettings.lollipopWidth;
		} else if (this.brushScaleBand.bandwidth() > this.minScaleBandWidth) {
			this.brushScaleBandBandwidth = this.brushScaleBand.bandwidth();
		} else {
			this.brushScaleBandBandwidth = this.minScaleBandWidth;
		}

		this.categoryLabelHeight = getSVGTextSize("Label", this.yAxisSettings.labelFontFamily, this.yAxisSettings.labelFontSize).height;

		// if (this.brushScaleBandBandwidth < this.markerMaxSize + this.markerMaxSize * 0.2) {
		// 	this.brushScaleBandBandwidth = this.markerMaxSize + this.markerMaxSize * 0.2;
		// }

		// if (!this.markerSettings.marker1Style.isAutoMarkerSize || (this.isHasMultiMeasure && !this.markerSettings.marker2Style.isAutoMarkerSize)) {
		// 	if (this.isLollipopTypeCircle) {
		// 		const maxMarkerSize = d3.max([this.markerSettings.marker1Style.markerSize, (this.isHasMultiMeasure ? this.markerSettings.marker2Style.markerSize : 0)]);
		// 		if (this.brushScaleBandBandwidth <= maxMarkerSize) {
		// 			this.brushScaleBandBandwidth = maxMarkerSize + 5;
		// 		}
		// 	} else {
		// 		const maxMarkerSize = d3.max([this.markerSettings.marker1Style.markerSize * 2, (this.isHasMultiMeasure ? this.markerSettings.marker2Style.markerSize * 2 : 0)]);
		// 		if (this.brushScaleBandBandwidth <= maxMarkerSize) {
		// 			this.brushScaleBandBandwidth = maxMarkerSize + 10;
		// 		}
		// 	}
		// }

		this.scaleBandWidth = this.brushScaleBandBandwidth;

		this.totalLollipopCount = [...new Set(clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values)].length;

		this.xScale = this.brushScaleBand;

		// const minIndex = d3.minIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));
		// const maxIndex = d3.maxIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));

		this.firstCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[0],
			value: <number>categoricalData.values[0].values[0],
		};

		this.lastCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[dataLength - 1],
			value: <number>categoricalData.values[0].values[dataLength - 1],
		};

		if (this.brushAndZoomAreaSettings.enabled) {
			if (this.categoricalDataPairs.length < this.brushAndZoomAreaSettings.minLollipopCount) {
				this.brushAndZoomAreaSettings.enabled = false;
			}
		}

		const expectedWidth = (this.brushScaleBandBandwidth * width) / this.brushScaleBand.bandwidth();
		const expectedHeight = (this.brushScaleBandBandwidth * height) / this.brushScaleBand.bandwidth();

		if (this.isHorizontalChart) {
			if (this.brushAndZoomAreaSettings.enabled && this.brushAndZoomAreaSettings.isShowAxis) {
				this.brushXAxisTicksMaxHeight = 0;
				this.setBrushYAxisTicksMaxWidth();
			} else {
				this.brushXAxisTicksMaxHeight = 0;
				this.brushYAxisTicksMaxWidth = 0;
			}

			if (Math.ceil(this.height) < expectedHeight && (this.chartSettings.isAutoLollipopWidth ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true) || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isVerticalBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = false;

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
			if (this.brushAndZoomAreaSettings.enabled && this.brushAndZoomAreaSettings.isShowAxis) {
				this.brushYAxisTicksMaxWidth = 0;
				this.setBrushXAxisTicksMaxHeight();
			} else {
				this.brushXAxisTicksMaxHeight = 0;
				this.brushYAxisTicksMaxWidth = 0;
			}

			if (Math.ceil(this.width) < expectedWidth && (this.chartSettings.isAutoLollipopWidth ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true) || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				this.isVerticalBrushDisplayed = false;
				const brushXPos = this.margin.left ? this.margin.left : 0;

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
		if (this.width < expectedWidth && (this.chartSettings.isAutoLollipopWidth ? this.brushScaleBand.bandwidth() <= this.minScaleBandWidth : true) || this.brushAndZoomAreaSettings.enabled) {
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
		this.categoricalRaceChartDataFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.RaceChartData]);
		this.categoricalSubCategoryField = this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		this.categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		this.categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		this.categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		this.categoricalImagesDataFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ImagesData]);
		this.categoricalUpperBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.UpperBound]);
		this.categoricalLowerBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.LowerBound]);

		if (this.measureNames.length > 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
			this.categoricalMeasure2Field = this.categoricalMeasureFields[1];
		} else if (this.measureNames.length === 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
		}

		// this.setNumberFormatters(this.categoricalMeasureFields, categoricalTooltipFields);

		this.isHasCategories = this.categoricalCategoriesFields.length > 0;
		this.isHasSubcategories = !!this.categoricalSubCategoryField;
		this.isHasImagesData = this.categoricalImagesDataFields.length > 0;
		this.isHasMultiMeasure = this.measureNames.length > 1;
		this.categoricalReferenceLinesNames = [...new Set(this.categoricalReferenceLinesDataFields.map((d) => d.source.displayName))];

		if (this.isHasImagesData) {
			this.imagesDataFieldsName = [...new Set(this.categoricalImagesDataFields.map(d => d.source.displayName))];
		}

		if (this.isChartIsRaceChart) {
			this.raceChartKeyLabelList =
				this.categoricalRaceChartDataFields[0].values.reduce((arr, cur, index) => {
					const values = this.categoricalRaceChartDataFields.map((r) => r.values[index]);
					const key = values.join("-");
					const label = values.join(" ");
					arr = [...arr, { key, label }];
					return arr;
				}, [])
					.filter((item, i, ar) => ar.findIndex((f) => f.key === item.key) === i);
		}

		if (this.isHasImagesData && (!this.markerSettings.selectedImageDataField || !this.imagesDataFieldsName.includes(this.markerSettings.selectedImageDataField))) {
			this.markerSettings.selectedImageDataField = this.imagesDataFieldsName[0];
		}

		if (!this.isHasImagesData && this.markerSettings.markerShape === EMarkerShapeTypes.IMAGES) {
			this.markerSettings.markerShape = EMarkerShapeTypes.DEFAULT;
		}

		if (!this.isHasSubcategories) {
			this.categoricalMeasureFields.forEach(d => {
				this.minMaxValuesByMeasures[d.source.displayName] = { min: d3.min(d.values, d => +d), max: d3.max(d.values, d => +d) };
			});
		} else {
			const measuresGroup = d3.group(this.categoricalMeasureFields, d => d.source.displayName);
			[...measuresGroup.keys()].forEach(d => {
				const measureFields = measuresGroup.get(d);
				this.minMaxValuesByMeasures[d.toString()] = { min: d3.min(measureFields, d => d3.min(d.values, v => +v)), max: d3.max(measureFields, d => d3.max(d.values, v => +v)) };
			})
		}

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
			if (!this.isHorizontalChart) {
				const { labelFontFamily, labelFontSize } = this.xAxisSettings;
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
				const { labelFontFamily, labelFontSize } = this.xAxisSettings;
				this.expandAllXScaleGHeight = 0;

				const text = new Array(this.expandAllYAxisMaxCharsLength).fill("A").join("");
				const textWidth = getSVGTextSize(text, labelFontFamily, labelFontSize).width;
				const expandAllYScaleGWidth = this.width * this.yAxisTicksMaxWidthRatio;

				if (expandAllYScaleGWidth > 25 && expandAllYScaleGWidth < textWidth) {
					this.expandAllYScaleGWidth = expandAllYScaleGWidth * this.expandAllCategoriesName.length;
				} else if (expandAllYScaleGWidth < 25) {
					this.expandAllYScaleGWidth = 25 * this.expandAllCategoriesName.length;
				} else if (expandAllYScaleGWidth > textWidth) {
					this.expandAllYScaleGWidth = textWidth * this.expandAllCategoriesName.length;
				}

				this.expandAllCategoriesName.forEach((d) => {
					// const expandAxisMaxCharsLength = d3.max(categoricalCategoriesFields.find(c => c.source.displayName === d).values, (v: any) => v.length);
					// const text = new Array(expandAxisMaxCharsLength < this.expandAllYAxisMaxCharsLength ? expandAxisMaxCharsLength : this.expandAllYAxisMaxCharsLength).fill("a").join("");
					// const textWidth = getSVGTextSize(text, labelFontFamily, labelFontSize).width;
					// this.expandAllYScaleGWidth += textWidth;
					// this.expandAllYScaleWidth[d] = textWidth;

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
			this.originalCategoricalData = this.vizOptions.options.dataViews[0].categorical as any;
			this.clonedCategoricalData = JSON.parse(JSON.stringify(this.vizOptions.options.dataViews[0].categorical));
			this.categoricalData = this.vizOptions.options.dataViews[0].categorical as any;
			this.categoricalMetadata = this.vizOptions.options.dataViews[0].metadata;
			this.isInFocusMode = vizOptions.options.isInFocus;
			this.isValidShowBucket = true;
			this.brushWidth = 0;
			this.brushHeight = 0;
			this.isChartIsRaceChart = false;
			this.categoricalCategoriesLastIndex = 0;
			this.expandAllXScaleGHeight = 0;
			this.expandAllYScaleGWidth = 0;

			const isReturn = this.renderErrorMessages();

			if (isReturn) {
				this.isChartInit = false;
				return;
			} else {
				d3.select(this.chartContainer).select(".validation-page-container").remove();
			}

			this.handleShowBucket();

			if (!this.isChartInit) {
				this.initChart();
			}

			this.xAxisG.selectAll("*").remove();
			this.yAxisG.selectAll("*").remove();

			this.positiveLogXAxisG = this.xAxisG.append("g").classed("positiveLogAxisG", true);
			this.negativeLogXAxisG = this.xAxisG.append("g").classed("negativeLogAxisG", true);

			this.positiveLogYAxisG = this.yAxisG.append("g").classed("positiveLogAxisG", true);
			this.negativeLogYAxisG = this.yAxisG.append("g").classed("negativeLogAxisG", true);

			this.beforeCutLinearXAxisG = this.xAxisG.append("g").classed("beforeCutLinearXAxisG", true);
			this.afterCutLinearXAxisG = this.xAxisG.append("g").classed("afterCutLinearXAxisG", true);

			this.beforeCutLinearYAxisG = this.yAxisG.append("g").classed("beforeCutLinearYAxisG", true);
			this.afterCutLinearYAxisG = this.yAxisG.append("g").classed("afterCutLinearYAxisG", true);

			this.renderContextMenu();
			this.setHighContrastDetails();
			this.formatNumber = (value, numberSettings, numberFormatter, isUseSematicFormat, isMinThousandsLimit) => GetFormattedNumber(value, numberSettings, numberFormatter, isUseSematicFormat, isMinThousandsLimit);
			this.conditionalFormattingConditions = parseConditionalFormatting(vizOptions.formatTab);

			if (!this.isValidShowBucket) {
				return;
			}

			this.expandAllXAxisG.selectAll("*").remove();
			this.expandAllYAxisG.selectAll("*").remove();
			this.brushG.selectAll(".brushLollipopG").remove();

			this.setVisualSettings();
			this.setLegendPosition();

			this.axisByBarOrientation =
				this.chartSettings.orientation === Orientation.Horizontal ? this.xAxisSettings : this.yAxisSettings;
			this.isLogarithmScale = this.axisByBarOrientation.isLogarithmScale;

			const selectedIBCSTheme = this.chartSettings.theme;
			const isIBCSEnabled = this.chartSettings.isIBCSEnabled;

			if (this.chartSettings.theme && (!this.chartSettings.isIBCSEnabled || (this.chartSettings.prevTheme !== this.chartSettings.theme)) && ((this.chartSettings.prevTheme !== this.chartSettings.theme) || (!this.isIBCSEnabled && isIBCSEnabled))) {
				ApplyIBCSTheme(this);
			}

			this.selectedIBCSTheme = selectedIBCSTheme;
			this.isIBCSEnabled = isIBCSEnabled;

			this.isVisualResized =
				this.viewPortWidth &&
				this.viewPortHeight &&
				(this.viewPortWidth !== vizOptions.options.viewport.width || this.viewPortHeight !== vizOptions.options.viewport.height);

			this.width = vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width;
			this.height = vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height;

			if (this.brushAndZoomAreaSettings.enabled) {
				if (this.isHorizontalChart) {
					if (this.brushAndZoomAreaSettings.isAutoWidth) {
						const brushAndZoomAreaWidth = this.width * 0.09;
						if (brushAndZoomAreaWidth < this.brushAndZoomAreaMaxWidth && brushAndZoomAreaWidth > this.brushAndZoomAreaMinWidth) {
							this.brushAndZoomAreaWidth = brushAndZoomAreaWidth;
						} else if (brushAndZoomAreaWidth > this.brushAndZoomAreaMaxWidth) {
							this.brushAndZoomAreaWidth = this.brushAndZoomAreaMaxWidth;
						} else if (brushAndZoomAreaWidth < this.brushAndZoomAreaMinWidth) {
							this.brushAndZoomAreaWidth = this.brushAndZoomAreaMinWidth;
						}
					} else {
						this.brushAndZoomAreaWidth = this.brushAndZoomAreaSettings.width;
					}
				} else {
					if (this.brushAndZoomAreaSettings.isAutoHeight) {
						const brushAndZoomAreaHeight = this.height * 0.165;
						if (brushAndZoomAreaHeight < this.brushAndZoomAreaMaxHeight && brushAndZoomAreaHeight > this.brushAndZoomAreaMinHeight) {
							this.brushAndZoomAreaHeight = brushAndZoomAreaHeight;
						} else if (brushAndZoomAreaHeight > this.brushAndZoomAreaMaxHeight) {
							this.brushAndZoomAreaHeight = this.brushAndZoomAreaMaxHeight;
						} else if (brushAndZoomAreaHeight < this.brushAndZoomAreaMinHeight) {
							this.brushAndZoomAreaHeight = this.brushAndZoomAreaMinHeight;
						}
					} else {
						this.brushAndZoomAreaHeight = this.brushAndZoomAreaSettings.height;
					}
				}
			} else {
				this.brushAndZoomAreaWidth = 0;
				this.brushAndZoomAreaHeight = 0;
			}

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

			this.container.style("width", "100%");
			this.container.style("height", `calc(100% - ${this.footerHeight}px)`);

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

					series.forEach((ser: any) => {
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

			this.setCircle1Radius();
			this.setCircle2Radius();
			this.setPie1Radius();
			this.setPie2Radius();

			if (this.isHasMultiMeasure) {
				this.markerMaxSize = (this.isLollipopTypeCircle ? d3.max([this.circle1Size, this.circle2Size]) : d3.max([this.pie1Radius * 2, this.pie2Radius * 2]));
			} else {
				this.markerMaxSize = (this.isLollipopTypeCircle ? this.circle1Size : this.pie1Radius * 2);
			}

			this.categoricalData = this.setInitialChartData(
				clonedCategoricalData,
				clonedCategoricalData,
				JSON.parse(JSON.stringify(this.vizOptions.options.dataViews[0].metadata)),
				vizOptions.options.viewport.width,
				vizOptions.options.viewport.height
			);

			this.isShowImageMarker = this.isLollipopTypeCircle && this.markerSettings.markerShape === EMarkerShapeTypes.IMAGES
				&& this.isHasImagesData && !!this.markerSettings.selectedImageDataField;

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

			this.isCutAndClipAxisEnabled = GetIsCutAndClipAxisEnabled(this);

			const popupOptions = document.querySelector(".popup-options");
			const popupOptionsHeader = document.querySelector(".popup-options-header");
			this.settingsPopupOptionsWidth = popupOptions ? (popupOptions.clientWidth ? popupOptions.clientWidth : 0) : 0;
			this.settingsPopupOptionsHeight = popupOptions ? (popupOptions.clientHeight ? popupOptions.clientHeight : 0) : 0;
			this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0;
			this.settingsBtnHeight = popupOptionsHeader ? popupOptionsHeader.clientHeight : 0;

			const { titleFontSize: xAxisTitleFontSize, titleFontFamily: xAxisTitleFontFamily } = this.xAxisSettings;
			const { titleFontSize: yAxisTitleFontSize, titleFontFamily: yAxisTitleFontFamily } = this.yAxisSettings;

			this.xAxisTitleSize = this.xAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", xAxisTitleFontFamily, xAxisTitleFontSize)
				: { width: 0, height: 0 };
			this.yAxisTitleSize = this.yAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", yAxisTitleFontFamily, yAxisTitleFontSize)
				: { width: 0, height: 0 };

			this.xAxisTitleMargin = this.xAxisSettings.isDisplayTitle ? 10 : 0;
			this.yAxisTitleMargin = this.yAxisSettings.isDisplayTitle ? 10 : 0;

			// this.setColorsByDataColorsSettings();

			if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
				this.setRemainingAsOthersDataColor();
			}

			if (this.conditionalFormattingConditions.length) {
				this.setConditionalFormattingColor();
			}

			if (this.isLollipopTypeCircle) {
				this.categoriesColorList = this.categoricalDataPairs.map(d => ({
					name: d.category,
					marker: this.categoryColorPair[d.category].marker1Color ? this.categoryColorPair[d.category].marker1Color : this.colorPalette.getColor(d.category).value,
				}));
			}

			if (this.chartData.length && this.isHasSubcategories && this.isLollipopTypePie) {
				this.subCategoriesColorList = this.chartData[0].subCategories.map(d => ({
					name: d.category,
					marker: this.subCategoryColorPair[d.category].marker1Color ? this.subCategoryColorPair[d.category].marker1Color : this.colorPalette.getColor(d.category).value,
				}));
			}

			this.configLegend();

			this.setMargins();

			this.svg
				.attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
				.attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight);

			this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			if (this.isScrollBrushDisplayed || this.brushAndZoomAreaSettings.enabled) {
				this.drawXYAxis();

				if (this.categoricalCategoriesLastIndex > 0) {
					if (!this.isHorizontalChart) {
						RenderExpandAllXAxis(this, this.categoricalData);
					} else {
						RenderExpandAllYAxis(this, this.categoricalData);
					}
				}

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

			if (this.isHasNegativeValue && !this.dataColorsSettings.isFillTypeChanged && this.dataColorsSettings.fillType !== ColorPaletteType.PositiveNegative) {
				this.visualHost.persistProperties({
					merge: [
						{
							objectName: EVisualConfig.DataColorsConfig,
							displayName: EVisualSettings.DataColorsSettings,
							properties: {
								[EVisualSettings.DataColorsSettings]: JSON.stringify({
									...this.dataColorsSettings,
									[EDataColorsSettings.FillType]: ColorPaletteType.PositiveNegative,
								}),
							},
							selector: null,
						},
					],
				});
			}

			if (this.isExpandAllApplied) {
				if (!this.isHorizontalChart) {
					if (this.isBottomXAxis) {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (this.height + this.xScaleGHeight) + "px" + ")");
					} else {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-this.xScaleGHeight) + "px" + ")");
					}

					CallExpandAllXScaleOnAxisGroup(this, this.scaleBandWidth);
				} else {
					if (this.isLeftYAxis) {
						this.expandAllYAxisG.style("transform", "translate(" + (-this.expandAllYScaleGWidth - this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
					} else {
						this.expandAllYAxisG.style("transform", "translate(" + (this.width) + "px" + "," + 0 + "px" + ")");
					}
					CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
				}
			}

			this.isShowRegularXAxis =
				(!this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
				(this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
				!this.isCutAndClipAxisEnabled;

			this.isShowRegularYAxis =
				(!this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
				(this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
				!this.isCutAndClipAxisEnabled;

			if (this.isCutAndClipAxisEnabled) {
				RenderLinearCutAxis(this);

				if (this.isHorizontalChart) {
					this.xAxisG.classed("cut-clip-axis", true);
					this.yAxisG.classed("cut-clip-axis", false);
				} else {
					this.xAxisG.classed("cut-clip-axis", false);
					this.yAxisG.classed("cut-clip-axis", true);
				}

				if (!this.isHorizontalChart) {
					this.yScale = GetCutAndClipYScale.bind(this);

					this.setYAxisTickStyle();

					const yScaleGWidth = this.yAxisG.node().getBoundingClientRect().width;
					this.yScaleGWidth = (yScaleGWidth > 0 ? yScaleGWidth : this.yScaleGWidth);

					this.setMargins();
				} else {
					this.xScale = GetCutAndClipXScale.bind(this);

					this.setXAxisTickStyle();

					const xScaleGHeight = this.xAxisG.node().getBoundingClientRect().height;
					this.xScaleGHeight = (xScaleGHeight > 0 ? xScaleGHeight : this.xScaleGHeight);

					this.setMargins();
				}
			} else {
				this.xAxisG.classed("cut-clip-axis", false);
				this.yAxisG.classed("cut-clip-axis", false);
				this.container.select(".barCutAndClipMarkersG").selectAll("*").remove();
			}

			if (this.isLogarithmScale && this.isShowPositiveNegativeLogScale) {
				if (this.isHorizontalChart) {
					this.xScale = GetPositiveNegativeLogXScale.bind(this);
				} else {
					this.yScale = GetPositiveNegativeLogYScale.bind(this);
				}
			}

			this.drawXGridLines();
			this.drawYGridLines();

			if (this.isCutAndClipAxisEnabled) {
				RenderCutAndClipMarkerOnAxis(this);
			} else {
				this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
			}

			this.drawLollipopChart();

			if (this.isChartIsRaceChart) {
				RenderRaceChartDataLabel(this);
				if (!this.isTickerButtonDrawn) {
					RenderRaceTickerButton(this);
				} else {
					UpdateTickerButton(this);
				}
			} else {
				if (this.tickerButtonG) {
					this.tickerButtonG.selectAll("*").remove();
				}

				if (this.raceChartDataLabelText) {
					this.raceChartDataLabelText.text("");
				}

				this.isTickerButtonDrawn = false;
			}

			this.drawXYAxisTitle();
			this.setSummaryTableConfig();

			if (this.brushAndZoomAreaSettings.enabled) {
				this.brushLollipopG = this.brushG.append("g").lower().attr("class", "brushLollipopG");
				const min = d3.min(clonedCategoricalData.values, (d: any) => d3.min(d.values, v => +v));
				const max = d3.max(clonedCategoricalData.values, (d: any) => d3.max(d.values, v => +v));
				const brushScaleBandwidth = this.brushScaleBand.bandwidth();

				// const circleSize = (brushScaleBandwidth / 3.5) * 2;
				// if (circleSize < this.brushAndZoomAreaCircleMaxSize && circleSize > this.brushAndZoomAreaCircleMinSize) {
				// this.brushAndZoomAreaCircleSize = circleSize;
				// } else if (circleSize > this.brushAndZoomAreaCircleMaxSize) {
				// 	this.brushAndZoomAreaCircleSize = this.brushAndZoomAreaCircleMaxSize;
				// } else if (circleSize < this.brushAndZoomAreaCircleMinSize) {
				// 	this.brushAndZoomAreaCircleSize = this.brushAndZoomAreaCircleMinSize;
				// }

				if (this.isHorizontalChart) {
					this.brushXScale = d3.scaleLinear().range([this.brushAndZoomAreaCircleSize + 5, this.brushAndZoomAreaWidth - 5]).domain([min, max]);
					this.brushYScale = this.brushScaleBand.copy(true);
					this.drawBrushLollipopChart(clonedCategoricalData);
				} else {
					this.brushXScale = this.brushScaleBand.copy(true);
					this.brushYScale = d3.scaleLinear().range([this.brushAndZoomAreaHeight - 5, this.brushAndZoomAreaCircleSize + 5]).domain([min, max]);
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
			this.drawTooltip();

			if (this.xAxisSettings.isShowAxisLine) {
				this.drawXAxisLine();
			} else {
				this.xAxisLineG.select(".xAxisLine").remove();
			}

			if (this.yAxisSettings.isShowAxisLine) {
				this.drawYAxisLine();
			} else {
				this.yAxisLineG.select(".yAxisLine").remove();
			}

			createPatternsDefs(this, this.svg);
			createMarkerDefs(this, this.svg);
			this.createErrorBarsMarkerDefs();

			d3.select(".dynamic-deviation-button").style(
				"display",
				this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn ? "flex" : "none"
			);

			// if (this.dynamicDeviationSettings.isEnabled && this.isLollipopTypeCircle) {
			// 	SetDynamicDeviationDataAndDrawLines(this);
			// } else {
			// 	RemoveDynamicDeviation(this);
			// }

			// this.visualHost.persistProperties({
			// 	merge: [
			// 		{
			// 			objectName: EVisualConfig.DynamicDeviationConfig,
			// 			displayName: EVisualSettings.DynamicDeviationSettings,
			// 			properties: {
			// 				[EVisualSettings.DynamicDeviationSettings]: JSON.stringify({
			// 					...this.dynamicDeviationSettings,
			// 					SHOW_IN_LEFT_MENU: this.isLollipopTypeCircle ? true : false,
			// 				}),
			// 			},
			// 			selector: null,
			// 		}
			// 	],
			// });

			if (this.dynamicDeviationSettings.isEnabled && this.isLollipopTypeCircle && !this.isHasMultiMeasure && this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn) {
				RenderDynamicDeviationIcon(this);
			} else {
				d3.select(".dynamic-deviation-button").remove();
			}

			const onLollipopClick = (ele: D3Selection<SVGElement>) => {
				this.handleCreateOwnDynamicDeviationOnBarClick(ele.node());
			}

			RenderLollipopAnnotations(this, GetAnnotationDataPoint.bind(this));
			if (!this.isLollipopTypePie) {
				SetAndBindChartBehaviorOptions(this, this.lollipopSelection, d3.selectAll(".lollipop-line"), onLollipopClick);
			} else {
				SetAndBindChartBehaviorOptions(this, d3.selectAll(".pie-slice"), d3.selectAll(".lollipop-line"), onLollipopClick);
			}
			this.behavior.renderSelection(this.interactivityService.hasSelection());
		} catch (error) {
			console.error("Error", error);
		}
	}

	private createErrorBarsMarkerDefs(): void {
		ErrorBarsMarkers.forEach((d: IErrorBarsMarker) => {
			const symbol = this.errorBarsMarkerDefsG.append("defs")
				.append("symbol")
				.attr("id", `${d.shape}_MARKER`)
				.attr("class", "marker-symbol")
				.attr("viewBox", d.viewBox);

			symbol.append("path")
				.attr("d", d.path)
				.attr("class", "marker1-path")
				.attr("fill", "rgb(108, 105, 102)")
				.attr("stroke", "rgb(255, 255, 255)")
				.attr("stroke-width", 1);
		})
	}

	setConditionalFormattingColor(): void {
		this.chartData.forEach((d) => {
			if (!this.isHasSubcategories) {
				const conditionalFormattingResult = isConditionMatch(d.category, undefined, d.value1, d.value2, d.tooltipFields, this.conditionalFormattingConditions);
				if (conditionalFormattingResult.match) {
					if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
						this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.color;
					} else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
						this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.color;
					} else {
						this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.color;
						this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.color;
					}
				}
			} else {
				d.subCategories.forEach((s) => {
					const conditionalFormattingResult = isConditionMatch(d.category, s.category, s.value1, s.value2, s.tooltipFields, this.conditionalFormattingConditions);
					if (conditionalFormattingResult.match) {
						if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
							this.subCategoryColorPair[d.category].marker1Color = conditionalFormattingResult.color;
						} else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
							this.subCategoryColorPair[d.category].marker2Color = conditionalFormattingResult.color;
						} else {
							this.subCategoryColorPair[d.category].marker1Color = conditionalFormattingResult.color;
							this.subCategoryColorPair[d.category].marker2Color = conditionalFormattingResult.color;
						}
					}
				});
			}
		});
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

		this.raceChartKeysList = [];

		this.categoriesName = this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].values.filter(
			(v, i, a) => a.findIndex((t) => t === v) === i
		) as string[];

		const subCategoriesGroup = d3.group(categoricalData.values, (d: any) => d.source.groupName);

		const getSubCategoryData = (idx: number, parentCategory: string): IChartSubCategory[] => {
			const data = this.subCategoriesName.reduce((arr, cur) => {
				const subCategoryGroup = subCategoriesGroup.get(cur);
				const measure1 = subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure1DisplayName);
				const measure1Highlights: any[] = measure1 ? measure1.highlights : [];

				const obj: IChartSubCategory = {
					category: cur,
					parentCategory,
					value1: <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure1DisplayName).values[idx]
					),
					value2: this.isHasMultiMeasure ? <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure2DisplayName).values[idx]
					) : 0,
					tooltipFields: subCategoryGroup
						.filter((d) => d.source.roles[EDataRolesName.Tooltip])
						.map((d) => ({ displayName: d.source.displayName, value: d.values[idx], color: "" } as TooltipData)),
					selected: false,
					isHighlight: measure1Highlights && measure1Highlights.length > 0 ? !!measure1Highlights[idx] : false
				};
				return [...arr, obj];
			}, []);
			return data;
		};

		const getUID = (category: string) => {
			return `${category}-
			${this.isHasSubcategories}-
			${this.isHasMultiMeasure}-
			${this.isHasImagesData}-
			${categoricalData.categories[0].values.length}-
			${categoricalData.values.length}-
			${this.markerSettings.markerType}-
			${this.markerSettings.markerShape}-
			${this.markerSettings.markerChart}-
			${this.yAxisSettings.isShowLabelsAboveLine}-
			${this.isShowImageMarker}`;
		}

		const isErrorBarsAbsoluteRelation = this.errorBarsSettings.measurement.relationshipToMeasure === ERelationshipToMeasure.Absolute && !this.errorBarsSettings.measurement.makeSymmetrical;
		const { errorLabels, tooltip } = this.errorBarsSettings;

		const getUpperLowerBoundsValue = (idx: number, value: number, data: ILollipopChartRow[]): {
			upperBoundValue: number,
			lowerBoundValue: number,
			tooltipUpperBoundValue: string,
			tooltipLowerBoundValue: string,
			labelUpperBoundValue: string,
			labelLowerBoundValue: string
		} => {
			let ub: number = 0;
			let lb: number = 0;
			let upperBoundValue: number = 0;
			let lowerBoundValue: number = 0;

			switch (this.errorBarsSettings.measurement.calcType) {
				case EErrorBarsCalcTypes.ByField:
					if (this.isHasErrorUpperBounds && this.errorBarsSettings.measurement.upperBoundMeasure) {
						const categoricalUpperBoundFields = this.categoricalUpperBoundFields.filter(d => d.source.displayName === this.errorBarsSettings.measurement.upperBoundMeasure);
						ub = this.isHasSubcategories ? d3.sum(categoricalUpperBoundFields, d => <number>d.values[idx]) : <number>categoricalUpperBoundFields[0].values[idx];
						upperBoundValue = isErrorBarsAbsoluteRelation && !this.errorBarsSettings.measurement.makeSymmetrical ? ub : ub + value;
					}

					if (this.isHasErrorLowerBounds && this.errorBarsSettings.measurement.lowerBoundMeasure && !this.errorBarsSettings.measurement.makeSymmetrical) {
						const categoricalLowerBoundFields = this.categoricalLowerBoundFields.filter(d => d.source.displayName === this.errorBarsSettings.measurement.lowerBoundMeasure);
						lb = this.isHasSubcategories ? d3.sum(categoricalLowerBoundFields, d => <number>d.values[idx]) : <number>categoricalLowerBoundFields[0].values[idx];
						lowerBoundValue = isErrorBarsAbsoluteRelation ? lb : lb + value;
					}

					if (this.errorBarsSettings.measurement.makeSymmetrical) {
						lb = lowerBoundValue = -upperBoundValue;
					}

					break;
				case EErrorBarsCalcTypes.ByPercentage:
					this.isHasErrorUpperBounds = true;
					this.isHasErrorLowerBounds = true;
					ub = upperBoundValue = value + (value * this.errorBarsSettings.measurement.upperBoundPercentage) / 100;
					lb = lowerBoundValue = value - (value * this.errorBarsSettings.measurement.upperBoundPercentage) / 100;
					break;
				case EErrorBarsCalcTypes.ByPercentile: {
					this.isHasErrorUpperBounds = true;
					this.isHasErrorLowerBounds = true;
					ub = upperBoundValue = d3.quantile([value], this.errorBarsSettings.measurement.upperBoundPercentage / 100);
					lb = lowerBoundValue = d3.quantile([value], this.errorBarsSettings.measurement.upperBoundPercentage / 100);
					break;
				}
				case EErrorBarsCalcTypes.ByStandardDeviation: {
					break;
				}
				case EErrorBarsCalcTypes.ByValue: {
					this.isHasErrorUpperBounds = true;
					this.isHasErrorLowerBounds = true;
					ub = upperBoundValue = value + this.errorBarsSettings.measurement.upperBoundValue;
					lb = lowerBoundValue = value - this.errorBarsSettings.measurement.lowerBoundValue;
					break;
				}
			}

			switch (this.errorBarsSettings.measurement.direction) {
				case EErrorBarsDirection.Both:
					break;
				case EErrorBarsDirection.Minus:
					ub = upperBoundValue = value;
					break;
				case EErrorBarsDirection.Plus:
					lb = lowerBoundValue = value;
					break;
			}

			const getBoundForTooltip = (labelFormat: EErrorBarsLabelFormat, isUpperBound: boolean): string => {
				let bound: number;
				switch (labelFormat) {
					case EErrorBarsLabelFormat.Absolute:
						bound = isUpperBound ? upperBoundValue : lowerBoundValue;
						break;
					case EErrorBarsLabelFormat.RelativeNumeric:
						if (isErrorBarsAbsoluteRelation || this.errorBarsSettings.measurement.calcType !== EErrorBarsCalcTypes.ByField) {
							bound = isUpperBound ? ub - value : lb - value;
						} else {
							bound = isUpperBound ? ub : lb;
						}
						break;
					case EErrorBarsLabelFormat.RelativePercentage:
						if (isErrorBarsAbsoluteRelation || this.errorBarsSettings.measurement.calcType !== EErrorBarsCalcTypes.ByField) {
							bound = isUpperBound ? (ub - value) / value * 100 : (lb - value) / value * 100;
						} else {
							bound = isUpperBound ? ub / value * 100 : lb / value * 100;
						}
						break;
				}
				return bound
					? this.errorBarsSettings.tooltip.labelFormat !== EErrorBarsLabelFormat.RelativePercentage
						? this.formatNumber(+bound, this.numberSettings, undefined, true, false)
						: bound.toFixed(2) + "%"
					: undefined;
			};

			return {
				upperBoundValue, lowerBoundValue,
				tooltipUpperBoundValue: tooltip.isEnabled ? getBoundForTooltip(this.errorBarsSettings.tooltip.labelFormat, true) : '0',
				tooltipLowerBoundValue: tooltip.isEnabled ? getBoundForTooltip(this.errorBarsSettings.tooltip.labelFormat, false) : '0',
				labelUpperBoundValue: errorLabels.isEnabled ? getBoundForTooltip(errorLabels.labelFormat, true) : '0',
				labelLowerBoundValue: errorLabels.isEnabled ? getBoundForTooltip(errorLabels.labelFormat, false) : '0',
			};
		}

		let idx = 0;
		const data: ILollipopChartRow[] = this.categoriesName.reduce((arr, cat) => {
			(this.isChartIsRaceChart && this.raceChartKeyLabelList.length > 0 ? this.raceChartKeyLabelList : [{ key: "", label: "" }]).forEach(raceBarKeyLabel => {
				const raceChartKey = raceBarKeyLabel.key;
				const raceChartDataLabel = raceBarKeyLabel.label;

				if (this.isChartIsRaceChart) {
					this.raceChartKeysList.push(raceChartKey);
				}

				const selectedImageDataFieldIndex = this.imagesDataFieldsName.findIndex(d => d === this.markerSettings.selectedImageDataField);

				const value1 = !this.isHasSubcategories ? <number>this.categoricalMeasure1Field.values[idx] : 0;
				const value2 = this.isHasMultiMeasure ? (!this.isHasSubcategories ? <number>this.categoricalMeasure2Field.values[idx] : 0) : 0;
				const isValue2 = this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;

				const checkIfNaN = (bound) => (isNaN(bound) ? 0 : bound);

				const obj: ILollipopChartRow = {
					uid: getUID(cat),
					category: <string>cat.toString(),
					raceChartKey,
					raceChartDataLabel,
					value1: value1,
					value2: value2,
					imageDataUrl: this.isHasImagesData && this.isShowImageMarker ? <string>this.categoricalImagesDataFields[selectedImageDataFieldIndex].values[idx] : null,
					identity: undefined,
					selected: false,
					isHighlight: this.categoricalMeasure1Field.highlights ? !!this.categoricalMeasure1Field.highlights[idx] : false,
					tooltipFields: this.categoricalTooltipFields.map((d) => ({ displayName: d.source.displayName, value: d.values[idx], color: "" } as TooltipData)),
					subCategories: this.isHasSubcategories ? getSubCategoryData(idx, <string>cat) : [],
					positions: { dataLabel1X: 0, dataLabel1Y: 0, dataLabel2X: 0, dataLabel2Y: 0 },
					lowerBoundValue: 0,
					upperBoundValue: 0,
					tooltipLowerBoundValue: null,
					tooltipUpperBoundValue: null,
					boundsTotal: 0
				}

				arr = [...arr, obj];
				idx++;
			})
			return arr;
		}, []);

		if (this.isHasSubcategories) {
			data.forEach((d) => {
				if (d.subCategories.length) {
					d.value1 = d3.sum(d.subCategories, (cat) => cat.value1);

					if (this.isHasMultiMeasure) {
						d.value2 = d3.sum(d.subCategories, (cat) => cat.value2);
					}
				}
			});
		}

		data.forEach((d, i) => {
			const isValue2 = this.isHasMultiMeasure && this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;
			const { upperBoundValue, lowerBoundValue, tooltipUpperBoundValue, tooltipLowerBoundValue, labelLowerBoundValue, labelUpperBoundValue } = getUpperLowerBoundsValue(i, isValue2 ? d.value2 : d.value1, data);

			if (this.errorBarsSettings.isEnabled) {
				d.upperBoundValue = upperBoundValue;
				d.tooltipUpperBoundValue = tooltipUpperBoundValue;
				d.lowerBoundValue = lowerBoundValue;
				d.tooltipLowerBoundValue = tooltipLowerBoundValue;
				d.boundsTotal = lowerBoundValue + upperBoundValue;
				d.labelUpperBoundValue = labelUpperBoundValue;
				d.labelLowerBoundValue = labelLowerBoundValue;
			}
		});

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

		if (this.isChartIsRaceChart) {
			this.raceChartKeysList = this.raceChartKeysList.filter((item, i, ar) => ar.indexOf(item) === i);
			this.raceChartKeysLength = this.raceChartKeysList.length - 1;
			this.raceChartKeysList.forEach((raceBarKey) => {
				this.categoriesName.forEach((category) => {
					const isHasCategoryOnDate = data.find((d) => d.raceChartKey === raceBarKey && d.category === category);
					if (!isHasCategoryOnDate) {
						data.push({
							uid: "",
							category: <string>category,
							raceChartKey: raceBarKey,
							raceChartDataLabel: "",
							value1: 0,
							value2: 0,
							imageDataUrl: null,
							subCategories: [],
							selected: false,
							identity: null,
							isHighlight: false,
							positions: { dataLabel1X: 0, dataLabel1Y: 0, dataLabel2X: 0, dataLabel2Y: 0 }
						});
					}
				});
			});
		}

		this.setSelectionIds(data);

		if (this.isChartIsRaceChart) {
			this.raceChartData = JSON.parse(JSON.stringify(data));
			this.raceChartData = this.categoriesName.reduce((acc, category) => {
				this.raceChartKeysList.forEach((key) => {
					acc = [...acc, this.raceChartData.find((d) => d.category === category && d.raceChartKey === key)];
				});
				return acc;
			}, []);

			this.tickIndex = -1;
			const setDataWithAllPositiveCategory = () => {
				this.tickIndex++;
				this.chartData = this.raceChartData.filter((d) => d.raceChartKey === this.raceChartKeysList[this.tickIndex]);
			};

			setDataWithAllPositiveCategory();

			this.raceChartKeyOnTick = this.raceChartKeysList[this.tickIndex];
			this.raceChartDataLabelOnTick = this.chartData[0].raceChartDataLabel;
		} else {
			this.chartData = data;
		}

		if (this.isXIsContinuousAxis) {
			if (this.xAxisSettings.isMinimumRangeEnabled && this.xAxisSettings.minimumRange) {
				this.chartData = this.chartData.filter(d => d.value1 < this.xAxisSettings.minimumRange || d.value2 < this.xAxisSettings.minimumRange);
			}

			if (this.xAxisSettings.isMaximumRangeEnabled && this.xAxisSettings.maximumRange) {
				this.chartData = this.chartData.filter(d => d.value1 > this.xAxisSettings.maximumRange || d.value2 > this.xAxisSettings.minimumRange);
			}
		}

		if (this.patternSettings.enabled) {
			this.setVisualPatternData();
		}

		const minIndex = d3.minIndex(this.chartData, (d) => d.value1);
		const maxIndex = d3.maxIndex(this.chartData, (d) => d.value1);

		this.minCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[minIndex],
			value: <number>categoricalData.values[0].values[minIndex],
		};

		this.maxCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[maxIndex],
			value: <number>categoricalData.values[0].values[maxIndex],
		};

		this.categoryPatterns = this.chartData
			.map((d) => ({
				name: d.category,
				patternIdentifier: d.pattern ? d.pattern.patternIdentifier ? d.pattern.patternIdentifier : "NONE" : "NONE",
				isImagePattern: d.pattern ? d.pattern.isImagePattern ? d.pattern.isImagePattern : false : false,
				dimensions: d.pattern ? d.pattern.dimensions ? d.pattern.dimensions : undefined : undefined,
			}));

		if (this.isHasSubcategories) {
			this.subCategoryPatterns = this.chartData[0].subCategories
				.map((d) => ({
					name: d.category,
					patternIdentifier: d.pattern ? d.pattern.patternIdentifier ? d.pattern.patternIdentifier : "NONE" : "NONE",
					isImagePattern: d.pattern ? d.pattern.isImagePattern ? d.pattern.isImagePattern : false : false,
					dimensions: d.pattern ? d.pattern.dimensions ? d.pattern.dimensions : undefined : undefined,
				}));
		}
	}

	private configLegend(): void {
		if (this.legendSettings.show) {
			d3.select("div.legend-wrapper").attr("display", "block");
			this.drawLegend();
		} else {
			d3.select("div.legend-wrapper").attr("display", "none");
			clearLegends();
			this.legendViewPort.width = 0;
			this.legendViewPort.height = 0;
			this.svg.style("top", 0 + "px");
			this.svg.style("left", 0 + "px");
		}
	}

	public drawLegend() {
		let legendDataPoints: { data: { name: string, color: string, pattern: IPatternProps } }[] = [];

		if (this.isLollipopTypeCircle) {
			switch (this.dataColorsSettings.fillType) {
				case ColorPaletteType.Single:
					if (!this.isHasMultiMeasure) {
						legendDataPoints = [{
							data: {
								name: this.measure1DisplayName,
								color: this.getColor(this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
								pattern: undefined
							}
						}]
					} else {
						legendDataPoints = [
							{
								data: {
									name: this.measure1DisplayName,
									color: this.getColor(this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
									pattern: undefined
								},
							},
							{
								data: {
									name: this.measure2DisplayName,
									color: this.getColor(this.dataColorsSettings.singleColor2, EHighContrastColorType.Foreground),
									pattern: undefined
								},
							}
						]
					}
					break;
				case ColorPaletteType.PowerBi:
				case ColorPaletteType.Diverging:
				case ColorPaletteType.Qualitative:
				case ColorPaletteType.Sequential:
				case ColorPaletteType.ByCategory:
				case ColorPaletteType.Gradient:
					if (this.isHasMultiMeasure) {
						legendDataPoints = this.measureNames.map((d, i) => ({
							data: {
								name: d,
								color: this.getColor(this.categoryColorPair[this.chartData[0].category][`marker${i + 1}Color`], EHighContrastColorType.Foreground),
								pattern: undefined
							}
						}))
					} else {
						legendDataPoints = this.chartData.map(d => ({
							data: {
								name: d.category,
								color: this.getColor(this.categoryColorPair[d.category].marker1Color, EHighContrastColorType.Foreground),
								pattern: undefined
							}
						}))
					}
					break;
				case ColorPaletteType.PositiveNegative:
					legendDataPoints = [
						{
							data: {
								name: "Positive",
								color: this.getColor("rgba(23, 177, 105, 1)", EHighContrastColorType.Foreground),
								pattern: undefined
							},
						},
						{
							data: {
								name: "Negative",
								color: this.getColor("rgba(208, 2, 27, 1)", EHighContrastColorType.Foreground),
								pattern: undefined
							},
						}
					]
					break;
			}
		}

		if (this.isHasSubcategories && this.isLollipopTypePie) {
			switch (this.dataColorsSettings.fillType) {
				case ColorPaletteType.Single:
					if (!this.isHasMultiMeasure) {
						legendDataPoints = [{
							data: {
								name: this.measure1DisplayName,
								color: this.getColor(this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
								pattern: undefined
							}
						}]
					} else {
						legendDataPoints = [
							{
								data: {
									name: this.measure1DisplayName,
									color: this.getColor(this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
									pattern: undefined
								},
							},
							{
								data: {
									name: this.measure2DisplayName,
									color: this.getColor(this.dataColorsSettings.singleColor2, EHighContrastColorType.Foreground),
									pattern: undefined
								},
							}
						]
					}
					break;
				case ColorPaletteType.PowerBi:
				case ColorPaletteType.Diverging:
				case ColorPaletteType.Qualitative:
				case ColorPaletteType.Sequential:
				case ColorPaletteType.ByCategory:
				case ColorPaletteType.Gradient:
					legendDataPoints = this.subCategoriesName.map((d, i) => ({
						data: {
							name: d,
							color: this.getColor(this.subCategoryColorPair[d][`marker${1}Color`], EHighContrastColorType.Foreground),
							pattern: undefined
						}
					}))
					break;
				case ColorPaletteType.PositiveNegative:
					legendDataPoints = [
						{
							data: {
								name: "Positive",
								color: this.getColor("rgba(23, 177, 105, 1)", EHighContrastColorType.Foreground),
								pattern: undefined
							},
						},
						{
							data: {
								name: "Negative",
								color: this.getColor("rgba(208, 2, 27, 1)", EHighContrastColorType.Foreground),
								pattern: undefined
							},
						}
					]
					break;
			}
		}

		if (this.legendSettings.show) {
			this.legendSettings.legendColor = this.getColor(this.legendSettings.legendColor, EHighContrastColorType.Foreground);

			this.legends = renderLegends(
				this,
				this.chartContainer,
				this.footerHeight,
				this.legendSettings.legendTitle,
				legendDataPoints,
				this.legendSettings,
				this.patternSettings.enabled,
			);

			this.updateChartDimensions(this.legends.legendWrapper);
		}
	}

	public setLegendPosition(): void {
		switch (this.legendSettings.legendPosition) {
			case ELegendPosition.TopLeft:
			case ELegendPosition.TopCenter:
			case ELegendPosition.TopRight:
				this.legendPosition = { top: false, bottom: false, left: false, right: false };
				this.legendPosition.top = true;
				break;
			case ELegendPosition.BottomLeft:
			case ELegendPosition.BottomCenter:
			case ELegendPosition.BottomRight:
				this.legendPosition = { top: false, bottom: false, left: false, right: false };
				this.legendPosition.bottom = true;
				break;
			case ELegendPosition.LeftTop:
			case ELegendPosition.LeftCenter:
			case ELegendPosition.LeftBottom:
				this.legendPosition = { top: false, bottom: false, left: false, right: false };
				this.legendPosition.left = true;
				break;
			case ELegendPosition.RightTop:
			case ELegendPosition.RightCenter:
			case ELegendPosition.RightBottom:
				this.legendPosition = { top: false, bottom: false, left: false, right: false };
				this.legendPosition.right = true;
				break;
		}
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

	setSelectionIds(data: ILollipopChartRow[]): void {
		if (!this.isHasSubcategories) {
			data.forEach((el) => {
				el.identity = this.selectionIdByCategories[el.category];
			});
		} else {
			data.forEach((el: ILollipopChartRow) => {
				el.identity = this.selectionIdByCategories[el.category];
				el.subCategories.forEach((d) => {
					d.identity = this.selectionIdBySubCategories[`${el.category}-${d.category}`];
				});
			});
		}
	}

	setVisualSettings(): void {
		const formatTab = this.vizOptions.formatTab;

		const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
		this.chartSettings = {
			...CHART_SETTINGS,
			...chartConfig,
		};

		const markerConfig = JSON.parse(formatTab[EVisualConfig.MarkerConfig][EVisualSettings.MarkerSettings]);
		this.markerSettings = {
			...MARKER_SETTINGS,
			...markerConfig,
		};

		const lineConfig = JSON.parse(formatTab[EVisualConfig.LineConfig][EVisualSettings.LineSettings]);
		this.lineSettings = {
			...LINE_SETTINGS,
			...lineConfig,
		};

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
		// if (this.isLollipopTypeCircle) {
		//     DATA_COLORS.dataType = CircleType.Circle1;
		// } else {
		//     DATA_COLORS.dataType = PieType.Pie1;
		// }

		// if (this.isHasMultiMeasure) {
		// 	DATA_COLORS.circle1.fillType = ColorPaletteType.Single;
		// 	DATA_COLORS.circle2.fillType = ColorPaletteType.Single;
		// }

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

		const raceChartConfig = JSON.parse(
			formatTab[EVisualConfig.RaceChartConfig][EVisualSettings.RaceChartSettings]
		);

		this.raceChartSettings = {
			...RACE_CHART_SETTINGS,
			...raceChartConfig,
		};

		const referenceLinesConfig = JSON.parse(
			formatTab[EVisualConfig.ReferenceLinesConfig][EVisualSettings.ReferenceLinesSettings]
		);
		this.referenceLinesSettings = Object.keys(referenceLinesConfig).length > 0 ? referenceLinesConfig : [];

		const errorBarsConfig = JSON.parse(formatTab[EVisualConfig.ErrorBarsConfig][EVisualSettings.ErrorBarsSettings]);
		this.errorBarsSettings = {
			...ERROR_BARS_SETTINGS,
			...errorBarsConfig,
		};

		// const IBCSConfig: IBCSSettings = JSON.parse(formatTab[EVisualConfig.IBCSConfig][EVisualSettings.IBCSSettings]);
		// this.IBCSSettings = {
		// 	...IBCS_SETTINGS,
		// 	...IBCSConfig,
		// };

		this.beforeIBCSSettings = JSON.parse(formatTab[EVisualConfig.Editor][EVisualSettings.BeforeIBCSSettings]);

		this.lastDynamicDeviationSettings = this.dynamicDeviationSettings;

		const dynamicDeviationConfig = JSON.parse(
			formatTab[EVisualConfig.DynamicDeviationConfig][EVisualSettings.DynamicDeviationSettings]
		);
		this.dynamicDeviationSettings = {
			...DYNAMIC_DEVIATION_SETTINGS,
			...dynamicDeviationConfig,
		};

		const cutAndClipAxisConfig = JSON.parse(
			formatTab[EVisualConfig.CutAndClipAxisConfig][EVisualSettings.CutAndClipAxisSettings]
		);
		this.cutAndClipAxisSettings = {
			...CUT_AND_CLIP_AXIS_SETTINGS,
			...cutAndClipAxisConfig,
		};

		this.changeVisualSettings();

		// if (!this.isHasSubcategories) {
		// 	this.isLollipopTypeCircle;
		// 	CHART_SETTINGS.isLollipopTypeChanged = false;
		// 	this.chartSettings.isLollipopTypeChanged = false;
		// 	const chartConfig: IChartSettings = {...this.chartSettings, lollipopType: LollipopType.CIRCLE, isLollipopTypeChanged: false};
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

		// if (!Object.keys(clonedDataLabelsSettings).length || isLollipopTypePie) {
		// 	const color = this.dataLabelsSettings.color;
		// 	if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
		// 		this.dataLabelsSettings.color = "rgb(102,102,102)";
		// 	}
		// }
	}

	changeVisualSettings(): void {
		this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;
		this.xGridSettings = this.gridSettings.xGridLines;
		this.yGridSettings = this.gridSettings.yGridLines;
		this.isPatternApplied = this.isHasSubcategories && this.patternSettings.enabled && this.patternSettings.subCategoryPatterns.some(d => d.patternIdentifier !== "NONE" && d.patternIdentifier !== "");

		if (!this.xAxisSettings.show) {
			this.xAxisSettings.isDisplayLabel = false;
			this.xAxisSettings.isDisplayTitle = false;
		}

		if (!this.yAxisSettings.show) {
			this.yAxisSettings.isDisplayLabel = false;
			this.yAxisSettings.isDisplayTitle = false;
		}

		// SET TRANSITION DURATION
		this.tickDuration = this.raceChartSettings.allowTransition ? this.raceChartSettings.transitionDuration : 0;

		if (this.isHorizontalChart && this.yAxisSettings.isShowLabelsAboveLine) {
			this.yAxisSettings.isDisplayLabel = false;
		}

		if (!this.dataColorsSettings.reverse) {
			this.dataColorsSettings.schemeColors = this.dataColorsSettings.schemeColors.reverse();
		}

		this.isBottomXAxis = this.xAxisSettings.position === Position.Bottom;
		this.isLeftYAxis = this.yAxisSettings.position === Position.Left;

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
		// if (isLollipopTypePie && rankingSettings.isSubcategoriesRanking) {
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
		// 	if (isLollipopTypePie) {
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
	}

	setColorsByDataColorsSettings(): void {
		if (this.isLollipopTypeCircle) {
			this.setCircleColors();
		} else {
			this.setPieColors();
		}
	}

	setCircleColors(): void {
		const marker = this.dataColorsSettings;

		const keys = this.isHasMultiMeasure && this.isLollipopTypeCircle ? this.measureNames : this.categoricalDataPairs;
		const colorIdxRangeScale = d3.scaleLinear()
			.domain([0, keys.length - 1])
			.range([1, 0]);

		const getMarkerSeqColorsArray = (marker: IDataColorsSettings) => {
			const markerInterval = Math.ceil(keys.length / marker.schemeColors.length);
			const markerRange = { index: 0, start: 0, end: markerInterval - 1 };
			return keys.reduce((acc: string[], cur, i: number) => {
				if (i <= markerRange.end) {
					acc = [...acc, marker.schemeColors[markerRange.index]];
				} else {
					markerRange.index++;
					markerRange.start = markerRange.start + markerInterval;
					markerRange.end = markerRange.end + markerInterval;
					acc = [...acc, marker.schemeColors[markerRange.index]];
				}
				return acc;
			}, []);
		}

		const markerSeqColorsArray = getMarkerSeqColorsArray(this.dataColorsSettings);

		const setMarkerColor = (marker: IDataColorsSettings, markerSeqColorsArray: any[]) => {
			//.CIRCLE 1 Colors
			switch (marker.fillType) {
				case ColorPaletteType.Single: {
					this.categoricalDataPairs.forEach((data, i) => {
						this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = marker.singleColor1;
						this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = marker.singleColor2;
					});
					break;
				}
				case ColorPaletteType.PowerBi: {
					this.categoricalDataPairs.forEach((data, i) => {
						if (this.isHasMultiMeasure) {
							this.measureNames.forEach((d, j) => {
								const color = this.colorPalette.getColor(d).value;
								this.categoryColorPairWithIndex[`${i}-${data.category}`][`marker${j + 1}Color`] = color;
							})
						} else {
							this.measureNames.forEach((d, j) => {
								const color = this.colorPalette.getColor(data.category).value;
								this.categoryColorPairWithIndex[`${i}-${data.category}`][`marker${j + 1}Color`] = color;
							})
						}
					});
					break;
				}
				case ColorPaletteType.Gradient: {
					const getMarkerColor = (i: number): string => {
						const { fillMin, fillMid, fillMax, isAddMidColor } = marker;
						const scaleColors = chroma.scale(isAddMidColor ? [fillMin, fillMid, fillMax] : [fillMin, fillMax]);
						return "rgb(" + scaleColors(colorIdxRangeScale(i)).rgb().join() + ")";
					}

					if (this.isHasMultiMeasure) {
						this.categoricalDataPairs.forEach((data, i: number) => {
							this.measureNames.forEach((d, j) => {
								const color = getMarkerColor(j);
								this.categoryColorPairWithIndex[`${i}-${data.category}`][`marker${this.measureNamesByTotal.findIndex(t => t.name === d) + 1}Color`] = color;
							});
						});
					} else {
						this.categoricalDataPairs.forEach((data, i: number) => {
							const color = getMarkerColor(i);
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = color;
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = color;
						});
					}
					break;
				}
				case ColorPaletteType.ByCategory: {
					if (!this.isHasMultiMeasure) {
						const categoryColors = marker.categoryColors.reduce((obj, cur) => {
							obj[cur.name] = { markerColor: cur.marker };
							return obj;
						}, {});
						this.categoricalDataPairs.forEach((data, i) => {
							if (categoryColors[data.category]) {
								const color = categoryColors[data.category]["markerColor"];
								this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = color;
								this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = color;
							}
						});
					}
					break;
				}
				case ColorPaletteType.Sequential:
				case ColorPaletteType.Diverging:
				case ColorPaletteType.Qualitative: {
					const keys = this.isHasMultiMeasure && this.isLollipopTypeCircle ? this.measureNames : this.categoricalDataPairs;
					const getMarkerColor = (i: number) => {
						const scaleColors = chroma.scale(marker.schemeColors);
						if (marker.isGradient) {
							return "rgb(" + scaleColors(colorIdxRangeScale((keys.length - 1) - i)).rgb().join() + ")";
						} else {
							return markerSeqColorsArray[i];
						}
					}

					if (this.isHasMultiMeasure) {
						this.categoricalDataPairs.forEach((data, i: number) => {
							this.measureNames.forEach((d, j) => {
								const color = getMarkerColor(j);
								this.categoryColorPairWithIndex[`${i}-${data.category}`][`marker${j + 1}Color`] = color;
							});
						});
					} else {
						this.categoricalDataPairs.forEach((data, i: number) => {
							const color = getMarkerColor(i);
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = color;
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = color;
						});
					}
					break;
				}
				case ColorPaletteType.PositiveNegative:
					this.categoricalDataPairs.forEach((data, i) => {
						if (data.measure1 >= 0) {
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = this.dataColorsSettings.positiveColor;
						} else {
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = this.dataColorsSettings.negativeColor;
						}

						if (data.measure2 >= 0) {
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = this.dataColorsSettings.positiveColor;
						} else {
							this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = this.dataColorsSettings.negativeColor;
						}
					});
					break;
			}
		}

		setMarkerColor(marker, markerSeqColorsArray);

		this.categoricalDataPairs.forEach((d, i) => {
			this.categoryColorPair[d.category] = this.categoryColorPairWithIndex[`${i}-${d.category}`];
		});

		if (this.rankingSettings.category.enabled) {
			if (this.rankingSettings.category.showRemainingAsOthers) {
				this.categoryColorPair[this.othersBarText].marker1Color = this.rankingSettings.category.othersColor;
				this.categoryColorPair[this.othersBarText].marker2Color = this.rankingSettings.category.othersColor;
			}
		}
	}

	setPieColors(): void {
		const marker = this.dataColorsSettings;

		const keys = this.subCategoriesName.map(d => d);
		const colorIdxRangeScale = d3.scaleLinear()
			.domain([0, keys.length - 1])
			.range([1, 0]);

		const getMarkerSeqColorsArray = (marker: IDataColorsSettings) => {
			const markerInterval = Math.ceil(this.subCategoriesName.length / marker.schemeColors.length);
			const markerRange = { index: 0, start: 0, end: markerInterval - 1 };
			return this.subCategoriesName.reduce((acc: string[], cur, i: number) => {
				if (i <= markerRange.end) {
					acc = [...acc, marker.schemeColors[markerRange.index]];
				} else {
					markerRange.index++;
					markerRange.start = markerRange.start + markerInterval;
					markerRange.end = markerRange.end + markerInterval;
					acc = [...acc, marker.schemeColors[markerRange.index]];
				}
				return acc;
			}, []);
		}

		const markerSeqColorsArray = getMarkerSeqColorsArray(this.dataColorsSettings);

		const setMarkerColor = (marker: IDataColorsSettings, markerSeqColorsArray: any[]) => {
			//.CIRCLE 1 Colors
			switch (marker.fillType) {
				case ColorPaletteType.Single: {
					this.subCategoriesName.forEach((data, i) => {
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker1] = marker.singleColor1;
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker2] = marker.singleColor2;
					});
					break;
				}
				case ColorPaletteType.PowerBi: {
					this.subCategoriesName.forEach((data, i) => {
						const color = this.colorPalette.getColor(data).value;
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker1] = color;
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker2] = color;
					});
					break;
				}
				case ColorPaletteType.Gradient: {
					const getMarkerColor = (i: number): string => {
						const { fillMin, fillMid, fillMax, isAddMidColor } = marker;
						const scaleColors = chroma.scale(isAddMidColor ? [fillMin, fillMid, fillMax] : [fillMin, fillMax]);
						return "rgb(" + scaleColors(colorIdxRangeScale(i)).rgb().join() + ")";
					}

					this.subCategoriesName.forEach((data, i) => {
						const index = this.groupNamesByTotal.findIndex(t => t.name === data);
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker1] = getMarkerColor(index);
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker2] = getMarkerColor(index);
					});
					break;
				}
				case ColorPaletteType.PositiveNegative: {
					break;
				}
				case ColorPaletteType.ByCategory: {
					const categoryColors = marker.categoryColors.reduce((obj, cur) => {
						obj[cur.name] = { markerColor: cur.marker };
						return obj;
					}, {});
					this.subCategoriesName.forEach((data, i) => {
						if (categoryColors[data]) {
							this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker1] = categoryColors[data][EMarkerColorTypes.Marker1];
						}
					});
					break;
				}
				case ColorPaletteType.Sequential:
				case ColorPaletteType.Diverging:
				case ColorPaletteType.Qualitative: {
					const getMarkerColor = (i: number) => {
						const scaleColors = chroma.scale(marker.schemeColors);
						if (marker.isGradient) {
							return "rgb(" + scaleColors(colorIdxRangeScale((this.subCategoriesName.length - 1) - i)).rgb().join() + ")";
						} else {
							return markerSeqColorsArray[i];
						}
					}

					this.subCategoriesName.forEach((data, i: number) => {
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker1] = getMarkerColor(i);
						this.subCategoryColorPairWithIndex[`${i}-${data}`][EMarkerColorTypes.Marker2] = getMarkerColor(i);
					});
				}
			}
		}

		setMarkerColor(marker, markerSeqColorsArray);

		this.subCategoriesName.forEach((d, i) => {
			this.subCategoryColorPair[d] = this.subCategoryColorPairWithIndex[`${i}-${d}`];
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
			if (this.height < newHeight || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = true;

				this.drawVerticalBrush(this.categoricalData, this.brushScaleBandBandwidth, this.totalLollipopCount);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		} else {
			const newWidth = (this.brushScaleBandBandwidth * this.width) / this.brushScaleBand.bandwidth();
			if (this.width < newWidth || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				this.isVerticalBrushDisplayed = false;

				const brushXPos = this.margin.left ? this.margin.left : 0;
				const brushYPos = this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight;

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

			if (this.newScaleDomainByBrush.length < yScaleDomain.length || this.isExpandAllApplied || this.brushAndZoomAreaSettings.enabled) {
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

				this.initAndRenderLollipopChart(this.width * this.yAxisTicksMaxWidthRatio)
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
			.call(brush.move as any, [0, heightByExpectedBar]);

		if (this.brushAndZoomAreaSettings.enabled) {
			this.brushG.selectAll("rect").attr("width", this.brushWidth).attr("rx", 0).attr("ry", 0);
		} else {
			this.brushG.selectAll("rect").attr("width", this.brushWidth).attr("rx", 4).attr("ry", 4).attr("cursor", "default");
			this.brushG.selectAll(".handle").remove();
		}

		this.brushG.select(".overlay")
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.trackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.trackBackgroundColor)
			.attr("cursor", this.brushAndZoomAreaSettings.enabled ? "crosshair" : "default")
			.attr("pointer-events", this.brushAndZoomAreaSettings.enabled ? "auto" : "none");

		this.brushG.select(".selection")
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBackgroundColor)
			.attr("stroke", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBorderColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBorderColor);
	}

	initAndRenderLollipopChart(scaleWidth: number): void {
		if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
			this.setRemainingAsOthersDataColor();
		}

		if (this.conditionalFormattingConditions.length) {
			this.setConditionalFormattingColor();
		}

		this.drawXYAxis();

		if (this.isExpandAllApplied) {
			this.expandAllCategoriesName.forEach((d) => {
				this[`${d}Scale`].domain(this[`${d}ScaleNewDomain`]);
			});
		}

		if (this.isExpandAllApplied) {
			if (!this.isHorizontalChart) {
				CallExpandAllXScaleOnAxisGroup(this, scaleWidth);
			}

			if (this.isHorizontalChart) {
				CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
			}
		}

		if (this.isLogarithmScale && this.isShowPositiveNegativeLogScale) {
			if (this.isHorizontalChart) {
				this.xScale = GetPositiveNegativeLogXScale.bind(this);
			} else {
				this.yScale = GetPositiveNegativeLogYScale.bind(this);
			}
		}

		this.drawXGridLines();
		this.drawYGridLines();

		this.drawLollipopChart();
	}

	drawHorizontalBrush(self: Visual, config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const totalBarsCount: number = config.totalBarsCount;
		const scaleWidth: number = config.scaleWidth;
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

		// const minPos = this.getXPosition(xScaleDomain[this.yAxisSettings.position === Position.Left ? 0 : xScaleDomain.length - 1]);
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

			if (this.newScaleDomainByBrush.length < xScaleDomain.length || this.isExpandAllApplied || this.brushAndZoomAreaSettings.enabled) {
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

				this.initAndRenderLollipopChart(scaleWidth);
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
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.trackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.trackBackgroundColor)
			.attr("cursor", this.brushAndZoomAreaSettings.enabled ? "crosshair" : "default")
			.attr("pointer-events", this.brushAndZoomAreaSettings.enabled ? "auto" : "none");

		d3.select(brushG).select(".selection")
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBackgroundColor)
			.attr("stroke", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBorderColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBorderColor);
	}

	initVerticalBrush(config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const barDistance: number = config.barDistance;
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
			.call(brush.move as any, [0, heightByExpectedBar]);
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

	getCategoricalValuesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	isHasCategoricalValuesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	getCategoricalCategoriesIndexByKey(key: string): number {
		return this.vizOptions.options.dataViews[0].categorical.categories.findIndex((data) => data.source.roles[key] === true);
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
	getDataLabelsFontSize(isData2Label: boolean = false): number {
		const circleRadius = isData2Label ? this.circle2Size / 2 : this.circle1Size / 2;
		if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			return this.dataLabelsSettings.fontSize;
		}
		if (this.dataLabelsSettings.isAutoFontSize) {
			const fontSize = circleRadius * 0.7;
			this.dataLabelsSettings.fontSize = fontSize;
			return fontSize;
		} else {
			return this.dataLabelsSettings.fontSize;
		}
	}

	setDataLabelsFormatting(labelSelection: D3Selection<SVGElement>, textSelection: any, isData2Label: boolean = false, labelPlacement: DataLabelsPlacement): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const key = isData2Label ? "value2" : "value1";

		const isAutoFontColor = this.dataLabelsSettings.textColorTypes === EInsideTextColorTypes.AUTO || this.dataLabelsSettings.textColorTypes === EInsideTextColorTypes.CONTRAST;
		const isAutoBGColor = this.dataLabelsSettings.textColorTypes === EInsideTextColorTypes.CONTRAST;

		labelSelection
			.attr("class", "dataLabelG")
			.attr("display", "block")
			.attr("opacity", dataLabelsSettings.show ? "1" : "0")
		// .style("pointer-events", "none");

		textSelection
			.classed("dataLabelText", true)
			.attr("text-anchor", "middle")
			.attr("dy", "0.25em")
			.attr("font-size", this.getDataLabelsFontSize(isData2Label))
			.style("font-family", dataLabelsSettings.fontFamily)
			.style("text-decoration", this.dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
			.text((d) => this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true));

		if (labelPlacement === DataLabelsPlacement.Inside) {
			textSelection
				.attr("fill", d => {
					return this.getColor(isAutoFontColor ? invertColorByBrightness(rgbaToHex(this.categoryColorPair[d.category][isData2Label ? "marker2Color" : "marker1Color"]), true) : this.dataLabelsSettings.color, EHighContrastColorType.Foreground)
				});
		} else {
			textSelection
				.attr("fill", dataLabelsSettings.color);
		}

		if (labelPlacement === DataLabelsPlacement.Inside) {
			let textShadow = labelSelection.select(".dataLabelTextShadow");
			if (!textShadow.node()) {
				textShadow = textSelection.clone(true);
				textShadow.lower();
			}

			textShadow
				.text((d) => this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true))
				.attr("class", "dataLabelTextShadow")
				.attr("text-anchor", "middle")
				.attr("dy", "0.25em")
				.attr("font-size", this.getDataLabelsFontSize(isData2Label))
				.style("font-family", dataLabelsSettings.fontFamily)
				.style("text-decoration", this.dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
				.style("font-weight", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
				.style("font-style", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
				.attr("stroke", d =>
					this.getColor(isAutoBGColor ? invertColorByBrightness(rgbaToHex(this.categoryColorPair[d.category][isData2Label ? "marker2Color" : "marker1Color"]), true, true) : this.dataLabelsSettings.backgroundColor, EHighContrastColorType.Background))
				.attr("stroke-width", 4)
				.attr("stroke-linejoin", "round")
				.style("text-anchor", "middle")
				.style("display", dataLabelsSettings.showBackground ? "block" : "none");
		}

		if (labelPlacement === DataLabelsPlacement.Outside) {
			let textShadow = labelSelection.select(".dataLabelTextShadow");
			if (!textShadow.node()) {
				textShadow = textSelection.clone(true);
				textShadow.lower();
			}

			textShadow
				.text((d) => this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true))
				.attr("class", "dataLabelTextShadow")
				.attr("text-anchor", "middle")
				.attr("dy", "0.25em")
				.attr("font-size", this.getDataLabelsFontSize(isData2Label))
				.style("font-family", dataLabelsSettings.fontFamily)
				.style("text-decoration", this.dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
				.style("font-weight", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
				.style("font-style", this.dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
				.attr("stroke", this.getColor(this.dataLabelsSettings.backgroundColor, EHighContrastColorType.Background))
				.attr("stroke-width", 4)
				.attr("stroke-linejoin", "round")
				.style("text-anchor", "middle")
				.style("display", dataLabelsSettings.showBackground ? "block" : "none");
		}
	}

	getDataLabelXY(d: ILollipopChartRow, isPie2: boolean = false): { x: number; y: number } {
		let x = 0;
		let y = 0;

		if (this.isHorizontalChart) {
			if (this.isLollipopTypeCircle) {
				if (d.value1 >= d.value2 || !this.isHasMultiMeasure) {
					x = this.getXPosition(isPie2 ? d.value2 : d.value1);
					y = this.getYPosition(d.category) + this.scaleBandWidth / 2;

					if (this.isLeftYAxis) {
						x = x + (isPie2 ? this.circle2Size / 2 : -this.circle2Size / 2) + this.getCircleXScaleDiff(x, isPie2);
					} else {
						x = x - (isPie2 ? this.circle2Size / 2 : -this.circle2Size / 2) - this.getCircleXScaleDiff(x, isPie2);
					}
				} else {
					x = this.getXPosition(isPie2 ? d.value2 : d.value1);
					y = this.getYPosition(d.category) + this.scaleBandWidth / 2;

					if (this.isLeftYAxis) {
						x = x - (isPie2 ? this.circle2Size / 2 : -this.circle2Size / 2) + this.getCircleXScaleDiff(x, isPie2);
					} else {
						x = x + (isPie2 ? this.circle2Size / 2 : -this.circle2Size / 2) - this.getCircleXScaleDiff(x, isPie2);
					}
				}
			}
		} else {
			if (this.isLollipopTypeCircle) {
				if (d.value1 >= d.value2 || !this.isHasMultiMeasure) {
					x = this.getXPosition(d.category) + this.scaleBandWidth / 2;
					y = this.getYPosition(isPie2 ? d.value2 : d.value1)
					// y = y + (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) - this.getCircleYScaleDiff(y, isPie2);
					if (this.isBottomXAxis) {
						y = y + (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) - this.getCircleYScaleDiff(y, isPie2);
					} else {
						y = y - (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) + this.getCircleYScaleDiff(y, isPie2);
					}
				} else {
					x = this.getXPosition(d.category) + this.scaleBandWidth / 2;
					y = this.getYPosition(isPie2 ? d.value2 : d.value1)
					// y = y + (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) - this.getCircleYScaleDiff(y, isPie2);

					if (this.isBottomXAxis) {
						y = y - (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) - this.getCircleYScaleDiff(y, isPie2);
					} else {
						y = y + (isPie2 ? -this.circle2Size / 2 : this.circle2Size / 2) + this.getCircleYScaleDiff(y, isPie2);
					}
				}
			}
		}
		return { x, y };
	}

	transformData1LabelOutside(labelSelection: any, isEnter: boolean): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const labelDistance = 20;

		const fn = (d, bBox): { translate: string, x: number, y: number } => {
			if (this.isHorizontalChart) {
				const XY = this.getDataLabelXY(d, false);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 > d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 < d.value2)
				) {

					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x + bBox.width + this.circle1Size / 2 + labelDistance;
						const yPos = y;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x;
						// const yPos = y;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x - bBox.width - this.circle1Size / 2 - labelDistance;
						const yPos = y;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x - bBox.width - labelDistance;
						// const yPos = y + bBox.width / 2;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				}
			} else {
				const XY = this.getDataLabelXY(d, false);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 > d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 < d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x;
						const yPos = y - bBox.height - this.circle1Size / 2 - labelDistance;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x;
						// const yPos = y;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x;
						const yPos = y + bBox.height + this.circle1Size / 2 + labelDistance;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x - bBox.height / 2;
						// const yPos = y + labelDistance + bBox.width;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				}
			}
		};

		labelSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("transform", function (d) {
				const bBox = this.getBBox();
				const position = fn(d, bBox);
				d3.select(this).datum((d: ILollipopChartRow) => {
					return { ...d, positions: { ...d.positions, dataLabel1X: position.x, dataLabel1Y: position.y } } as ILollipopChartRow;
				});
				return position.translate;
			});
	}

	transformData2LabelOutside(labelSelection: any, isEnter: boolean): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const labelDistance = 20;

		const fn = (d, bBox): { translate: string, x: number, y: number } => {
			if (this.isHorizontalChart) {
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 < d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x + bBox.width + this.circle1Size / 2 + labelDistance;
						const yPos = y;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x + labelDistance;
						// const yPos = y + bBox.width / 2;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x - bBox.width - this.circle1Size / 2 - labelDistance;
						const yPos = y;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x - bBox.width - labelDistance;
						// const yPos = y + bBox.width / 2;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
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
						const xPos = x;
						const yPos = y - bBox.height - this.circle1Size / 2 - labelDistance;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x - bBox.height / 2;
						// const yPos = y - labelDistance;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						const xPos = x;
						const yPos = y + bBox.height + this.circle1Size / 2 + labelDistance;
						return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
					} else {
						// const xPos = x - bBox.height / 2;
						// const yPos = y + labelDistance + bBox.width;
						// return { translate: `translate(${xPos}, ${yPos}), rotate(${270})`, x: xPos, y: yPos };
					}
				}
			}
		};

		labelSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("transform", function (d) {
				const bBox = this.getBBox();
				const position = fn(d, bBox);
				d3.select(this).datum((d: ILollipopChartRow) => {
					return { ...d, positions: { ...d.positions, dataLabel2X: position.x, dataLabel2Y: position.y } } as ILollipopChartRow;
				});
				return position.translate;
			});
	}

	transformDataLabelInside(labelsSelection: any, isEnter: boolean, isData2Label: boolean): void {
		const fn = (d, labelBBox: any) => {
			const cx = this.getXPosition(this.isHorizontalChart ? (isData2Label ? d.value2 : d.value1) : d.category);
			let x;

			if (!this.isLeftYAxis) {
				x = (this.isHorizontalChart ? cx - this.getCircleXScaleDiff(cx, isData2Label) : cx + this.scaleBandWidth / 2);
			} else {
				x = (this.isHorizontalChart ? cx + this.getCircleXScaleDiff(cx, isData2Label) : cx + this.scaleBandWidth / 2);
			}

			const cy = this.getYPosition(this.isHorizontalChart ? d.category : (isData2Label ? d.value2 : d.value1));
			let y;

			if (this.isBottomXAxis) {
				y = (!this.isHorizontalChart ? cy - this.getCircleYScaleDiff(cy, isData2Label) : cy + this.scaleBandWidth / 2) - labelBBox.height + (isData2Label ? this.circle2Size / 2 : this.circle1Size / 2);
			} else {
				y = (!this.isHorizontalChart ? cy + this.getCircleYScaleDiff(cy, isData2Label) : cy + this.scaleBandWidth / 2) - labelBBox.height + (isData2Label ? this.circle2Size / 2 : this.circle1Size / 2);
			}

			return `translate(${x}, ${y})`;
		};

		labelsSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("transform", function (d) {
				const labelBBox = this.getBBox();
				return fn(d, labelBBox);
			});
	}

	drawData1Labels(data: ILollipopChartRow[]): void {
		const THIS = this;
		// const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		// this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			const xScaleValue = this.getXPosition(data.category);
			const yScaleValue = this.getYPosition(data.category);
			return this.isHorizontalChart ? (yScaleValue >= 0 && yScaleValue !== null && yScaleValue !== undefined) : (xScaleValue >= 0 && xScaleValue !== null && xScaleValue !== undefined);
		});

		const dataLabelGSelection = this.dataLabels1G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");
				const textSelection = dataLabelGSelection.append("text");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside);
					this.transformData1LabelOutside(dataLabelGSelection, true);
				} else {
					if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside);
						this.transformData1LabelOutside(dataLabelGSelection, true);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Inside);
						this.transformDataLabelInside(dataLabelGSelection, true, false);
					}
				}
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");
				const textSelection = dataLabelGSelection.select(".dataLabelText");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside);
					this.transformData1LabelOutside(dataLabelGSelection, false);
				} else {
					if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside);
						this.transformData1LabelOutside(dataLabelGSelection, false);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Inside);
						this.transformDataLabelInside(dataLabelGSelection, false, false);
					}
				}
			}
		);

		this.dataLabels1G.selectAll(".dataLabelG").select("text").raise();

		this.dataLabels1G.selectAll(".dataLabelG")
			.each(function () {
				const ele = d3.select(this);
				const textEle = ele.select(".dataLabelText");
				const getBBox = (d3.select(this).select("text").node() as SVGSVGElement).getBBox();
				const isHideInsideLabel = getBBox.width > THIS.circle1Size || getBBox.height > THIS.circle1Size;

				ele
					.attr("opacity", (d: ILollipopChartRow) => {
						if (THIS.dataLabelsSettings.isShowBestFitLabels) {
							if (THIS.isHorizontalChart) {
								if (THIS.isLeftYAxis) {
									if (d.positions.dataLabel1X < 1) {
										if (isHideInsideLabel) {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, false);
										} else {
											return 0;
										}
									}
								} else {
									if (d.positions.dataLabel1X + getBBox.width > THIS.width) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, false);
										}
									}
								}
							} else {
								if (THIS.isBottomXAxis) {
									if (d.positions.dataLabel1Y + getBBox.height > THIS.height) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, false);
										}
									}
								} else {
									if (d.positions.dataLabel1Y < 1) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, false);
										}
									}
								}
							}
						} else {
							if (THIS.dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
								return isHideInsideLabel ? 0 : 1;
							} else if (THIS.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
								if (THIS.isHorizontalChart) {
									if (THIS.isLeftYAxis) {
										return d.positions.dataLabel1X < 1 ? 0 : 1;
									} else {
										return d.positions.dataLabel1X + getBBox.width > THIS.width ? 0 : 1;
									}
								} else {
									if (THIS.isBottomXAxis) {
										return d.positions.dataLabel1Y + getBBox.height > THIS.height ? 0 : 1;
									} else {
										return d.positions.dataLabel1Y < 1 ? 0 : 1;
									}
								}
							}
						}

						return 1;
					});
			});
	}

	drawData2Labels(data: ILollipopChartRow[]): void {
		const THIS = this;
		// const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		// this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			const xScaleValue = this.getXPosition(data.category);
			const yScaleValue = this.getYPosition(data.category);
			return this.isHorizontalChart ? (yScaleValue >= 0 && yScaleValue !== null && yScaleValue !== undefined) : (xScaleValue >= 0 && xScaleValue !== null && xScaleValue !== undefined);
		});

		const dataLabelGSelection = this.dataLabels2G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");
				const textSelection = dataLabelGSelection.append("text");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside);
					this.transformData2LabelOutside(dataLabelGSelection, true);
				} else {
					if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside);
						this.transformData2LabelOutside(dataLabelGSelection, true);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Inside);
						this.transformDataLabelInside(dataLabelGSelection, true, true);
					}
				}
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");
				const textSelection = dataLabelGSelection.select(".dataLabelText");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside);
					this.transformData2LabelOutside(dataLabelGSelection, false);
				} else {
					if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside);
						this.transformData2LabelOutside(dataLabelGSelection, false);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Inside);
						this.transformDataLabelInside(dataLabelGSelection, false, true);
					}
				}
			}
		);

		this.dataLabels2G.selectAll(".dataLabelG").select("text").raise();

		this.dataLabels2G
			.selectAll(".dataLabelG")
			.each(function () {
				const ele = d3.select(this);
				const textEle = ele.select(".dataLabelText");
				const getBBox = (d3.select(this).select("text").node() as SVGSVGElement).getBBox();
				const isHideInsideLabel = getBBox.width > THIS.circle2Size || getBBox.height > THIS.circle2Size;

				ele
					.attr("opacity", (d: ILollipopChartRow) => {
						if (THIS.dataLabelsSettings.isShowBestFitLabels) {
							if (THIS.isHorizontalChart) {
								if (THIS.isLeftYAxis) {
									if (d.positions.dataLabel2X < 1) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, true);
										}
									}
								} else {
									if (d.positions.dataLabel2X + getBBox.width > THIS.width) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, true);
										}
									}
								}
							} else {
								if (THIS.isBottomXAxis) {
									if (d.positions.dataLabel2Y + getBBox.height > THIS.height) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, true);
										}
									}
								} else {
									if (d.positions.dataLabel2Y < 1) {
										if (isHideInsideLabel) {
											return 0;
										} else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside);
											THIS.transformDataLabelInside(ele, false, true);
										}
									}
								}
							}
						} else {
							if (THIS.dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
								return isHideInsideLabel ? 0 : 1;
							} else if (THIS.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
								if (THIS.isHorizontalChart) {
									if (THIS.isLeftYAxis) {
										return d.positions.dataLabel2X < 1 ? 0 : 1;
									} else {
										return 1;
									}
								} else {
									if (THIS.isBottomXAxis) {
										return d.positions.dataLabel2Y + getBBox.height > THIS.height ? 0 : 1;
									} else {
										return d.positions.dataLabel2Y < 1 ? 0 : 1;
									}
								}
							}
						}

						return 1;
					});
			});
	}

	drawTooltip(): void {
		this.tooltipServiceWrapper.addTooltip(
			this.lollipopG.selectAll(this.circle1ClassSelector),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, true)),
			(datapoint: any) => datapoint.selectionId
		);

		this.tooltipServiceWrapper.addTooltip(
			this.lollipopG.selectAll(this.circle2ClassSelector),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, false)),
			(datapoint: any) => datapoint.selectionId
		);

		const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
			return this.numberSettings.show ? this.formatNumber(value, this.numberSettings, numberFormatter, true, true) : powerBiNumberFormat(value, numberFormatter);
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
					color: this.categoryColorPair[value.category].marker1Color,
				},
			];

			value.tooltipFields.forEach((data, i: number) => {
				tooltipData.push({
					displayName: data.displayName,
					value: typeof data.value === "number" ? powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i]) : data.value,
					color: data.color ? data.color : "transparent",
				});
			});

			if (this.errorBarsSettings.tooltip.isEnabled) {
				if (this.isHasErrorUpperBounds && value.tooltipUpperBoundValue) {
					tooltipData.push({
						displayName: "Upper",
						value: value.tooltipUpperBoundValue,
						color: "transparent",
					});
				}

				if (this.isHasErrorLowerBounds && value.tooltipLowerBoundValue) {
					tooltipData.push({
						displayName: "Lower",
						value: value.tooltipLowerBoundValue,
						color: "transparent",
					});
				}
			}

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
					color: this.categoryColorPair[value.category].marker1Color,
				},
				{
					displayName: this.measure2DisplayName,
					value: numberFormatter(value.value2, this.measureNumberFormatter[1]),
					color: this.categoryColorPair[value.category].marker2Color,
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
		if (this.isHorizontalChart) {
			if (this.xAxisSettings.isDisplayTitle) {
				if (this.xAxisSettings.titleName.length === 0) {
					this.xAxisSettings.titleName = this.measureNames.join(" and ");
				}
			}

			if (this.yAxisSettings.isDisplayTitle) {
				if (this.yAxisSettings.titleName.length === 0) {
					this.yAxisSettings.titleName = this.categoryDisplayName;
				}
			}
		} else {
			if (this.xAxisSettings.isDisplayTitle) {
				if (this.xAxisSettings.titleName.length === 0) {
					this.xAxisSettings.titleName = this.categoryDisplayName;
				}
			}

			if (this.yAxisSettings.isDisplayTitle) {
				if (this.yAxisSettings.titleName.length === 0) {
					this.yAxisSettings.titleName = this.measureNames.join(" and ");
				}
			}
		}

		const xAxisSettings = this.xAxisSettings;
		const yAxisSettings = this.yAxisSettings;

		const xAxisTitleProperties: TextProperties = {
			text: xAxisSettings.titleName,
			fontFamily: xAxisSettings.titleFontFamily,
			fontSize: xAxisSettings.titleFontSize + "px",
		};
		const xAxisTitle = textMeasurementService.getTailoredTextOrDefault(xAxisTitleProperties, this.width);

		const yAxisTitleProperties: TextProperties = {
			text: yAxisSettings.titleName,
			fontFamily: yAxisSettings.titleFontFamily,
			fontSize: yAxisSettings.titleFontSize + "px",
		};
		const yAxisTitle = textMeasurementService.getTailoredTextOrDefault(yAxisTitleProperties, this.height);

		this.xAxisTitleText
			.attr("fill", xAxisSettings.titleColor)
			.attr("font-size", xAxisSettings.titleFontSize)
			.style("font-family", xAxisSettings.titleFontFamily)
			.style("display", xAxisSettings.isDisplayTitle ? "block" : "none")
			.text(xAxisTitle);

		this.yAxisTitleText
			.attr("fill", yAxisSettings.titleColor)
			.attr("font-size", yAxisSettings.titleFontSize)
			.style("font-family", this.yAxisSettings.titleFontFamily)
			.style("display", yAxisSettings.isDisplayTitle ? "block" : "none")
			.text(yAxisTitle);

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

		if (this.isXIsContinuousAxis) {
			this.scaleBandWidth = 0;
		} else {
			this.scaleBandWidth = clonedXScale.padding(0).bandwidth();
		}

		// if (!this.chartSettings.isAutoLollipopWidth) {
		// 	if (!this.chartSettings.lollipopWidth) {
		// 		this.chartSettings.lollipopWidth = this.scaleBandWidth;
		// 	}

		// 	if (this.chartSettings.lollipopWidth < this.minScaleBandWidth) {
		// 		this.chartSettings.lollipopWidth = this.minScaleBandWidth;
		// 	}

		// 	if (this.chartSettings.lollipopWidth < clonedXScale.padding(0).bandwidth()) {
		// 		this.chartSettings.lollipopWidth = clonedXScale.padding(0).bandwidth();
		// 	}

		// 	this.chartSettings.lollipopWidth = +Math.round(this.chartSettings.lollipopWidth).toFixed(0);
		// }

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
		let xAxisMaxWordHeight: number = 1;

		if (!this.isHorizontalChart && !THIS.isXIsContinuousAxis) {
			const xAxisDomain: string[] = this.xScale.domain();
			const xAxisTicks: string[][] = xAxisDomain.map((text) => {
				const newText = xAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, xAxisSettings.labelCharLimit);
				const textProperties: TextProperties = {
					text: newText,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};
				return GetWordsSplitByWidth(newText, textProperties, this.scaleBandWidth, 3);
			});

			isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3 ||
				(this.markerMaxSize > this.scaleBandWidth) || !xAxisSettings.isLabelAutoTilt;
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
			xAxisMaxWordHeight = d3.max(xAxisTicks, (d) => d.length);
		}

		this.xAxisG
			.selectAll("text")
			.attr("dx", isApplyTilt && !this.isHorizontalBrushDisplayed && !this.isExpandAllApplied ? "-10.5px" : "0")
			.attr("dy", isApplyTilt ? "-0.5em" : "0.35em")
			.attr("y", () => {
				if (this.isHorizontalChart) {
					return this.isBottomXAxis ? 9 : -9;
				} else {
					return this.isBottomXAxis ? 9 : 9;
				}
			})
			// .attr("dy", isApplyTilt ? "0" : "0.35em")
			.attr("fill", this.getColor(xAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", xAxisSettings.labelFontFamily)
			.attr("font-size", xAxisSettings.labelFontSize)
			.attr("display", xAxisSettings.isDisplayLabel ? "block" : "none")
			.attr("text-anchor", () => {
				if (this.isBottomXAxis) {
					return isApplyTilt ? "end" : "middle";
				} else {
					return isApplyTilt ? "end" : "middle";
				}
			})
			// .attr("transform", () => {
			// 	if (xAxisSettings.position === Position.Bottom) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, 10)rotate(-${this.getXAxisLabelTilt()})`;
			// 	} else if (xAxisSettings.position === Position.Top) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, -10)rotate(${this.getXAxisLabelTilt()})`;
			// 	}
			// })
			.each(function () {
				const ele = d3.select(this);
				const text = ele.text().toString();
				const newText = xAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, xAxisSettings.labelCharLimit);
				ele.text("");

				const textProperties: TextProperties = {
					text: newText,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart && !THIS.isXIsContinuousAxis) {
					if (!isApplyTilt) {
						ele.attr("transform", `rotate(0)`);
						if (!THIS.isBottomXAxis) {
							ele.attr("y", () => {
								if (xAxisMaxWordHeight === 1) {
									return 0;
								} else if (xAxisMaxWordHeight === 2) {
									return -16
								} else if (xAxisMaxWordHeight === 3) {
									return -32;
								}
							});
						}

						const words: string[] = GetWordsSplitByWidth(newText, textProperties, THIS.scaleBandWidth - xAxisSettings.labelFontSize / 2, 3);
						words.forEach((d, i) => {
							ele
								.append("tspan")
								.attr("x", 0)
								.attr("dy", (i > 1 ? 1 : i) * xAxisTickHeight)
								.text(d);
						});
					} else {
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, xAxisMaxHeight);
						if (THIS.isBottomXAxis) {
							let rotateDegree = 0;
							if (xAxisSettings.isLabelAutoTilt) {
								rotateDegree = (THIS.markerMaxSize > THIS.scaleBandWidth) || THIS.isExpandAllApplied ? -90 : -35;
							} else {
								rotateDegree = -xAxisSettings.labelTilt;
							}

							ele.attr("transform", `rotate( ${rotateDegree})`);
						} else {
							let rotateDegree = 0;
							if (xAxisSettings.isLabelAutoTilt) {
								rotateDegree = (THIS.markerMaxSize > THIS.scaleBandWidth) || THIS.isExpandAllApplied ? 90 : 35;
							} else {
								rotateDegree = xAxisSettings.labelTilt;
							}

							ele.attr("transform", `rotate( ${rotateDegree})`);
						}
						ele.append("tspan").text(truncatedText);
					}
				} else {
					let text = newText;
					const firstChar = text.charAt(0);
					const unicodeValue = firstChar.charCodeAt(0);
					const isNegativeNumber = unicodeValue === 8722 || text.includes("-");

					if (isNegativeNumber) {
						text = (extractDigitsFromString(text.substring(1)) * -1).toString();
					}

					const truncatedText = THIS.formatNumber(parseFloat(xAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, xAxisSettings.labelCharLimit)), THIS.numberSettings, undefined, false, false);
					ele.append("tspan").text(!isNegativeNumber ? truncatedText : "-".concat(truncatedText));
				}
			});
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
			.style("text-anchor", yAxisSettings.position === Position.Left ? "end" : "start")
			// .text((d: any) => {
			// 	if (!this.isHorizontalChart && typeof d === "number") {
			// 		return formatNumber(d, this.numberSettings, undefined);
			// 	}
			// 	return d;
			// })
			.each(function () {
				const ele = d3.select(this);
				let text = ele.text();
				const firstChar = text.charAt(0);
				const unicodeValue = firstChar.charCodeAt(0);
				const isNegativeNumber = unicodeValue === 8722 || text.includes("-");

				if (isNegativeNumber) {
					text = (extractDigitsFromString(text.substring(1)) * -1).toString();
				}

				ele.text("");

				const textProperties: TextProperties = {
					text: yAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, yAxisSettings.labelCharLimit),
					fontFamily: yAxisSettings.labelFontFamily,
					fontSize: yAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart) {
					const truncatedText = THIS.formatNumber(extractDigitsFromString(yAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, yAxisSettings.labelCharLimit)), THIS.numberSettings, undefined, false, false);
					ele.append("tspan").text(!isNegativeNumber ? truncatedText : "-".concat(truncatedText));
				} else {
					const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, THIS.width * THIS.yAxisTicksMaxWidthRatio);
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

	setXAxisDomain(): void {
		this.isShowPositiveNegativeLogScale = this.isLogarithmScale;

		const values = this.categoricalData.categories[this.categoricalCategoriesLastIndex].values;

		let min = +d3.min(values, d => +d);

		if (min > 0) {
			min = 0;
		}

		let max = +d3.max(values, d => +d);

		if (max >= 0) {
			max += max * 0.15;
		} else {
			max -= max * 0.15;
		}

		this.isHasNegativeValue = min < 0 || max < 0;

		if (this.isXIsContinuousAxis) {
			if (this.xAxisSettings.isMinimumRangeEnabled) {
				min = this.xAxisSettings.minimumRange;
			}

			if (this.xAxisSettings.isMaximumRangeEnabled) {
				max = this.xAxisSettings.maximumRange;
			}

			this.xScale = d3.scaleLinear().nice();
			this.xScale.domain([min, max]);
		} else {
			this.xScale = d3.scaleBand();
			this.xScale.domain(this.chartData.map((d) => d.category));
		}
	}

	setYAxisDomain(): void {
		const { min, max } = GetAxisDomainMinMax(this);
		this.axisDomainMinValue = min;
		this.axisDomainMaxValue = max;

		this.isShowPositiveNegativeLogScale = this.isLogarithmScale;
		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number" && !this.isLogarithmScale;
		const isLogarithmScale = this.axisByBarOrientation.isLogarithmScale;

		// if (this.isHorizontalChart) {
		// 	this.yScale = d3.scaleBand();
		// 	this.yScale.domain(this.chartData.map((d) => d.category));
		// } else {
		this.yScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand();

		if (isLinearScale) {
			this.yScale = d3.scaleLinear().nice();
		} else if (isLogarithmScale) {
			if (!this.isHorizontalChart && this.isShowPositiveNegativeLogScale) {
				this.positiveLogScale = d3.scaleLog().base(10).nice();
				this.negativeLogScale = d3.scaleLog().base(10).nice();
			} else {
				this.yScale = d3.scaleLog().base(10).nice();
			}
		} else {
			this.yScale = d3.scaleBand();
		}

		if (isLinearScale) {
			this.yScale.domain([min, max]);
		} else if (isLogarithmScale) {
			if (this.isShowPositiveNegativeLogScale) {
				if (this.isBottomXAxis) {
					this.positiveLogScale.domain([0.1, this.axisDomainMaxValue]);
					this.negativeLogScale.domain([Math.abs(this.axisDomainMinValue), 0.1]);
				} else {
					this.negativeLogScale.domain([0.1, this.axisDomainMaxValue]);
					this.positiveLogScale.domain([Math.abs(this.axisDomainMinValue), 0.1]);
				}
			} else {
				this.yScale.domain([this.axisDomainMinValue === 0 ? 0.1 : this.axisDomainMinValue, this.axisDomainMaxValue]);
			}
		} else {
			this.yScale.domain(this.chartData.map((d) => d.value1));
		}
		// }
	}

	setXYAxisRange(xScaleWidth: number, yScaleHeight: number): void {
		if (this.isHorizontalChart) {
			const xAxisRange = this.yAxisSettings.position === Position.Left ? [this.xAxisStartMargin, xScaleWidth] : [xScaleWidth - this.xAxisStartMargin, 0];

			if (this.isShowPositiveNegativeLogScale) {
				const width = this.axisDomainMaxValue * Math.abs(xAxisRange[0] - xAxisRange[1]) / Math.abs(this.axisDomainMinValue - this.axisDomainMaxValue);

				this.positiveLogScaleWidth = width;
				this.negativeLogScaleWidth = this.width - width;

				this.positiveLogScale.range([0, this.positiveLogScaleWidth]);
				this.negativeLogScale.range([0, this.negativeLogScaleWidth]);
			} else {
				this.xScale.range(xAxisRange);
			}

			this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight - this.xAxisStartMargin, 0] : [this.xAxisStartMargin, yScaleHeight]);
		} else {
			this.xScale.range(this.yAxisSettings.position === Position.Left ? [this.yAxisStartMargin, xScaleWidth] : [xScaleWidth - this.yAxisStartMargin, 0]);

			const yAxisRange = this.xAxisSettings.position === Position.Bottom ? [yScaleHeight - this.yAxisStartMargin, this.yAxisSettings.labelFontSize] : [this.yAxisStartMargin, yScaleHeight - this.yAxisSettings.labelFontSize * 1.25];
			if (this.isShowPositiveNegativeLogScale) {
				const height = this.axisDomainMaxValue * Math.abs(yAxisRange[0] - yAxisRange[1]) / Math.abs(this.axisDomainMinValue - this.axisDomainMaxValue);

				this.positiveLogScaleHeight = height;
				this.negativeLogScaleHeight = this.height - height;

				this.positiveLogScale.range([this.positiveLogScaleHeight, 0]);
				this.negativeLogScale.range([this.negativeLogScaleHeight, 0]);
			} else {
				this.yScale.range(yAxisRange);
			}
		}

		const xScaleRange = this.xScale.range();
		if (this.xAxisSettings.isInvertRange) {
			this.xScale.range(xScaleRange.reverse());
		}

		const yScaleRange = this.yScale.range();
		if (this.yAxisSettings.isInvertRange) {
			this.yScale.range(yScaleRange.reverse());
		}
	}

	drawXAxisLine(): void {
		if (this.isBottomXAxis) {
			this.xAxisLineG.attr("transform", "translate(0," + this.height + ")");
		} else {
			this.xAxisLineG.attr("transform", "translate(0," + 0 + ")");
		}

		this.xAxisLineG.select(".xAxisLine").remove();
		this.xAxisLineG
			.append("line")
			.attr("class", "xAxisLine")
			.attr("x1", this.xScale.range()[0])
			.attr("x2", this.xScale.range()[1])
			.attr("y1", this.isBottomXAxis ? -this.yAxisStartMargin : this.yAxisStartMargin)
			.attr("y2", this.isBottomXAxis ? -this.yAxisStartMargin : this.yAxisStartMargin)
			.attr("fill", "rgba(84, 84, 84, 1)")
			.attr("stroke", "rgba(84, 84, 84, 1)")
			.attr("stroke-width", "1px");
	}

	drawYAxisLine(): void {
		if (this.isLeftYAxis) {
			this.yAxisLineG.attr("transform", `translate(0, 0)`);
		} else {
			this.yAxisLineG.attr("transform", `translate(${this.width}, 0)`);
		}

		this.yAxisLineG.select(".yAxisLine").remove();
		this.yAxisLineG
			.append("line")
			.attr("class", "yAxisLine")
			.attr("x1", this.isLeftYAxis ? this.yAxisStartMargin : -this.yAxisStartMargin)
			.attr("x2", this.isLeftYAxis ? this.yAxisStartMargin : -this.yAxisStartMargin)
			.attr("y1", this.yScale.range()[0])
			.attr("y2", this.yScale.range()[1])
			.attr("fill", "rgba(84, 84, 84, 1)")
			.attr("stroke", "rgba(84, 84, 84, 1)")
			.attr("stroke-width", "1px");
	}

	callXYScaleOnAxisGroup(): void {
		// if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart)) {
		// 	if (this.xAxisSettings.position === Position.Bottom) {
		// 		this.xAxisG.attr("transform", "translate(0," + this.height + ")").call(
		// 			d3
		// 				.axisBottom(this.xScale)
		// 				.ticks(this.width / 90)
		// 				.tickFormat((d) => {
		// 					return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
		// 				}) as any
		// 		);
		// 		// .selectAll('text')
		// 		// .attr('dy', '0.35em')
		// 		// .attr('transform', `translate(-10, 10)rotate(-${this.visualSettings.xAxis.labelTilt})`)
		// 	} else if (this.xAxisSettings.position === Position.Top) {
		// 		this.xAxisG.attr("transform", "translate(0," + 0 + ")").call(
		// 			d3
		// 				.axisTop(this.xScale)
		// 				.ticks(this.width / 90)
		// 				.tickFormat((d) => {
		// 					return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
		// 				}) as any
		// 		);
		// 		// .selectAll('text')
		// 		// .attr('dy', '0.35em')
		// 		// .attr('transform', `translate(-10, -10)rotate(${this.visualSettings.xAxis.labelTilt})`)
		// 	}
		// }

		// if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart)) {
		// 	if (this.yAxisSettings.position === Position.Left) {
		// 		this.yAxisG.attr("transform", `translate(0, 0)`).call(
		// 			d3
		// 				.axisLeft(this.yScale)
		// 				.ticks(this.height / 70)
		// 				.tickFormat((d) => {
		// 					return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
		// 				}) as any
		// 		);
		// 	} else if (this.yAxisSettings.position === Position.Right) {
		// 		this.yAxisG.attr("transform", `translate(${this.width}, 0)`).call(
		// 			d3
		// 				.axisRight(this.yScale)
		// 				.ticks(this.height / 70)
		// 				.tickFormat((d) => {
		// 					return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
		// 				}) as any
		// 		);
		// 	}
		// }

		CallXScaleOnAxisGroup(this, this.width, this.height, this.xAxisG.node());
		CallYScaleOnAxisGroup(this, this.width, this.height, this.yAxisG.node());

		this.xAxisG
			.selectAll("text")
			.attr("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");

		this.yAxisG
			.selectAll("text")
			.attr("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");
	}

	xGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.xGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", (d) => this.getXPosition(d) + this.scaleBandWidth / 2)
			.attr("x2", (d) => this.getXPosition(d) + this.scaleBandWidth / 2)
			.attr("y1", this.margin.top)
			.attr("y2", this.height)
			.attr("stroke", this.xGridSettings.lineColor)
			.attr("stroke-width", this.xGridSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.xGridSettings.lineType === ELineType.Dotted
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
			.attr("y1", (d) => this.getYPosition(d))
			.attr("y2", (d) => this.getYPosition(d))
			.attr("stroke", this.yGridSettings.lineColor)
			.attr("stroke-width", this.yGridSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.yGridSettings.lineType === ELineType.Dotted
					? `0, ${this.yGridSettings.lineWidth * 8} `
					: `${this.yGridSettings.lineWidth * 10}, ${this.yGridSettings.lineWidth * 10} `
			)
			.style("display", this.yGridSettings.show ? "block" : "none");
	}

	drawXGridLines(): void {
		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number" && !this.isLogarithmScale;

		let xScaleTicks;
		if (this.isHorizontalChart) {
			if (this.isCutAndClipAxisEnabled) {
				xScaleTicks = [
					...this.afterCutLinearScale.ticks(this.afterCutLinearScaleArea / 90),
					...this.beforeCutLinearScale.ticks(this.beforeCutLinearScaleArea / 90),
				];
			} else if (this.isLogarithmScale) {
				xScaleTicks = [
					...this.positiveLogScaleTicks,
					...this.negativeLogScaleTicks,
				];
			} else {
				xScaleTicks = isLinearScale ? this.xScale.ticks(this.width / 90) : this.xScale.domain();
			}
		} else {
			xScaleTicks = this.xScale.domain();
		}

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
		let yScaleTicks;
		if (!this.isHorizontalChart) {
			if (this.isCutAndClipAxisEnabled) {
				yScaleTicks = [
					...this.afterCutLinearScale.ticks(this.afterCutLinearScaleArea / 70),
					...this.beforeCutLinearScale.ticks(this.beforeCutLinearScaleArea / 70),
				];
			} else if (this.axisByBarOrientation.isLogarithmScale) {
				yScaleTicks = [
					...this.positiveLogScaleTicks,
					...this.negativeLogScaleTicks,
				];
			} else {
				yScaleTicks = this.yScale.ticks(this.height / 70);
			}
		} else {
			yScaleTicks = this.yScale.domain();
		}

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
		// const xAxisSettings = this.xAxisSettings;
		// const xAxisDomain: string[] = this.xScale.domain();
		// const textProperties: TextProperties = {
		// 	text: "X-Axis",
		// 	fontFamily: xAxisSettings.labelFontFamily,
		// 	fontSize: xAxisSettings.labelFontSize + "px",
		// };

		// if (!this.isHorizontalChart) {
		// 	const xAxisTicksWidth = xAxisDomain.map((d) => {
		// 		return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
		// 	});
		// 	const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
		// 	const xAxisMaxHeight = d3.min([this.height * 0.4, xAxisTicksMaxWidth], (d) => d);

		// 	if (!this.isHorizontalBrushDisplayed) {
		// 		const xAxisTickHeight = textMeasurementService.measureSvgTextHeight(textProperties);
		// 		const xAxisTicks: string[][] = xAxisDomain.map((text) => {
		// 			return GetWordsSplitByWidth(text, { ...textProperties, text: text }, this.xScale.bandwidth(), 3);
		// 		});
		// 		const isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3;
		// 		const xAxisMaxWordHeight = d3.max(xAxisTicks, (d) => d.length) * xAxisTickHeight;
		// 		this.xScaleGHeight = isApplyTilt ? xAxisMaxHeight : xAxisMaxWordHeight;
		// 	} else {
		// 		const xAxisTicks = xAxisDomain.map((text) => {
		// 			return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, xAxisMaxHeight);
		// 		});
		// 		const xAxisTicksWidth = xAxisTicks.map((d) => {
		// 			return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
		// 		});
		// 		const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
		// 		this.xScaleGHeight = xAxisTicksMaxWidth;
		// 	}
		// } else {
		// 	this.xScaleGHeight = textMeasurementService.measureSvgTextHeight({ ...textProperties });
		// }
	}

	setYScaleGWidth(): void {
		// const yAxisSettings = this.yAxisSettings;
		// const yAxisDomain: string[] = this.yScale.domain();
		// const textProperties: TextProperties = {
		// 	text: "X-Axis",
		// 	fontFamily: yAxisSettings.labelFontFamily,
		// 	fontSize: yAxisSettings.labelFontSize + "px",
		// };

		// if (!this.isHorizontalChart) {
		// 	const yAxisTicks: string[] = this.yScale.ticks(this.height / 70);
		// 	const yAxisTicksWidth = yAxisTicks.map((d) => {
		// 		const textProperties: TextProperties = {
		// 			text: !this.isHorizontalChart && typeof d === "number" ? this.formatNumber(d, this.numberSettings, undefined, false, false) : d,
		// 			fontFamily: this.yAxisSettings.labelFontFamily,
		// 			fontSize: this.yAxisSettings.labelFontSize + "px",
		// 		};
		// 		return textMeasurementService.measureSvgTextWidth(textProperties);
		// 	});
		// 	this.yScaleGWidth = d3.max(yAxisTicksWidth);
		// } else {
		// 	const yAxisTicks = yAxisDomain.map((text) => {
		// 		return textMeasurementService.getTailoredTextOrDefault({ ...textProperties, text }, this.width * this.yAxisTicksMaxWidthRatio);
		// 	});
		// 	const yAxisTicksWidth = yAxisTicks.map((d) => {
		// 		return textMeasurementService.measureSvgTextWidth({ ...textProperties, text: d });
		// 	});
		// 	const yAxisTicksMaxWidth = d3.max(yAxisTicksWidth, (d) => d);
		// 	this.yScaleGWidth = yAxisTicksMaxWidth;
		// }
	}

	drawXYAxis(): void {
		this.setXAxisDomain();
		this.setYAxisDomain();

		if (this.isHorizontalChart) {
			const xScaleCopy = this.xScale.copy();
			const yScaleCopy = this.yScale.copy();

			this.xScale = yScaleCopy;
			this.yScale = xScaleCopy;
		}

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

		if (this.xAxisSettings.isDisplayLabel && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart))) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart))) {
			this.setYAxisTickStyle();
		}

		if (this.xAxisSettings.isDisplayLabel) {
			if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart)) {
				const xScaleGHeight = (this.xAxisG.node()).getBoundingClientRect().height;
				this.xScaleGHeight = xScaleGHeight > 0 ? xScaleGHeight : this.xScaleGHeight;
			}
		} else {
			this.xScaleGHeight = 0;
		}

		if (this.yAxisSettings.isDisplayLabel) {
			if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart)) {
				const yScaleGWidth = this.yAxisG.node().getBoundingClientRect().width;
				this.yScaleGWidth = yScaleGWidth > 0 ? yScaleGWidth : this.yScaleGWidth;
			}
		} else {
			this.yScaleGWidth = 0;
		}

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup();

		if (this.xAxisSettings.isDisplayLabel && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart))) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart))) {
			this.setYAxisTickStyle();
		}

		this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.xAxisG.selectAll(".tick").style("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");
		this.yAxisG.selectAll(".tick").style("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");

		// Truncate the ticks which are overlaps with the Y axis
		const THIS = this;
		this.xAxisG
			.selectAll(".tick")
			.selectAll("text")
			.each(function () {
				const ele = d3.select(this);
				const bBox = (ele.node() as SVGSVGElement).getBoundingClientRect();

				if (bBox.x < 0) {
					const textProperties: TextProperties = {
						text: ele.text(),
						fontFamily: THIS.xAxisSettings.labelFontFamily,
						fontSize: THIS.xAxisSettings.labelFontSize + "px",
					};

					const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, bBox.width + bBox.x);
					ele.text(truncatedText);
				}
			});

		this.xScaleRange = this.xScale.range();
		this.yScaleRange = this.yScale.range();

		this.xScaleMinRange = d3.min(this.xScaleRange);
		this.xScaleMaxRange = d3.max(this.xScaleRange);

		this.yScaleMinRange = d3.min(this.yScaleRange);
		this.yScaleMaxRange = d3.max(this.yScaleRange);

		// if (i === 0) {
		// 	xAxisMaxHeight = d3.min([xAxisMaxHeight, THIS.scaleBandWidth / 2 + THIS.yScaleGWidth]);
		// }

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
	}

	// Lines

	setHorizontalLinesFormatting(linesSelection: any, isEnter: boolean): void {
		const THIS = this;
		linesSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x1", (d: ILollipopChartRow) => {
				if (!this.isLeftYAxis || !this.xAxisSettings.isInvertRange) {
					if (d.value1 > d.value2) {
						return this.getXPosition(d.value1) + THIS.markerMaxSize / 2;
					} else {
						return this.getXPosition(d.value2) + (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				} else {
					if (d.value1 > d.value2) {
						const Y1 = this.getXPosition(d.value2);
						const newY1 = Y1 + (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieXScaleDiff(Y1, true) : THIS.circle2Size / 2 + THIS.getCircleXScaleDiff(Y1, true) : 0)
						const Y2 = this.getXPosition(d.value1) - THIS.markerMaxSize / 2;

						if (newY1 < Y2) {
							return newY1;
						} else {
							return Y2;
						}
					} else {
						const Y1 = this.getXPosition(d.value1) + (this.isHasMultiMeasure ? 0 : THIS.markerMaxSize / 2);
						const newY1 = Y1 + (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieXScaleDiff(Y1, true) : THIS.circle2Size / 2 + THIS.getCircleXScaleDiff(Y1, true) : 0)
						const Y2 = this.getXPosition(d.value2) - THIS.markerMaxSize / 2;

						if (newY1 < Y2) {
							return newY1;
						} else {
							return Y2;
						}
					}
				}
			})
			.attr("x2", (d: ILollipopChartRow) => {
				if (!this.isLeftYAxis || !this.xAxisSettings.isInvertRange) {
					if (d.value1 > d.value2) {
						const Y1 = THIS.getXPosition(d.value1) + THIS.markerMaxSize / 2;
						const Y2 = THIS.getXPosition(d.value2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieXScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleXScaleDiff(Y2, true) : 0)

						if (newY2 > Y1) {
							return newY2;
						} else {
							return Y1;
						}
					} else {
						const Y1 = THIS.getXPosition(d.value2) + THIS.markerMaxSize / 2;
						const Y2 = THIS.getXPosition(d.value1) - (this.isHasMultiMeasure ? 0 : THIS.markerMaxSize / 2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieXScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleXScaleDiff(Y2, true) : 0)

						if (newY2 > Y1) {
							return newY2;
						} else {
							return Y1;
						}
					}
				} else {
					if (d.value1 > d.value2) {
						return this.getXPosition(d.value1) - THIS.markerMaxSize / 2;
					} else {
						return this.getXPosition(d.value2) - (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				}
			})
			.attr("y1", (d) => this.getYPosition(d.category) + this.scaleBandWidth / 2)
			.attr("y2", (d) => this.getYPosition(d.category) + this.scaleBandWidth / 2)
			.attr("stroke", (d: ILollipopChartRow) => this.getLineStroke(d))
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === ELineType.Dotted
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

	getLineStroke(d: ILollipopChartRow): string {
		if (this.isIBCSEnabled && this.selectedIBCSTheme !== EIBCSThemes.DefaultHorizontal && this.selectedIBCSTheme !== EIBCSThemes.DefaultVertical) {
			if (!this.isHasMultiMeasure) {
				if (d.value1 >= 0) {
					return this.getColor("rgba(23, 177, 105, 1)", EHighContrastColorType.Foreground);
				} else {
					return this.getColor("rgba(208, 2, 27, 1)", EHighContrastColorType.Foreground);
				}
			} else {
				if (d.value1 >= 0 && d.value2 >= 0) {
					return this.getColor("rgba(23, 177, 105, 1)", EHighContrastColorType.Foreground);
				} else if (d.value1 <= 0 && d.value2 <= 0) {
					return this.getColor("rgba(208, 2, 27, 1)", EHighContrastColorType.Foreground);
				} else {
					return this.getColor("rgba(23, 177, 105, 1)", EHighContrastColorType.Foreground);
				}
			}
		} else {
			return this.getColor(this.lineSettings.lineColor, EHighContrastColorType.Foreground);
		}
	}

	setVerticalLinesFormatting(linesSelection: D3Selection<any>, isEnter: boolean): void {
		const THIS = this;
		linesSelection
			.attr("stroke", (d: ILollipopChartRow) => this.getLineStroke(d))
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === ELineType.Dotted
					? `0, ${this.lineSettings.lineWidth * 2}`
					: `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `
			)
			.style("display", this.lineSettings.show ? "block" : "none")
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x1", d => this.getXPosition(d.category) + THIS.scaleBandWidth / 2)
			.attr("x2", d => this.getXPosition(d.category) + THIS.scaleBandWidth / 2)
			.attr("y1", (d: ILollipopChartRow) => {
				if (this.isBottomXAxis || this.yAxisSettings.isInvertRange) {
					if (d.value1 > d.value2) {
						return this.getYPosition(d.value1) + THIS.markerMaxSize / 2;
					} else {
						return this.getYPosition(d.value2) + (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				} else {
					if (d.value1 > d.value2) {
						const Y1 = this.getYPosition(d.value2);
						const newY1 = Y1 + (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y1, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y1, true) : 0)
						const Y2 = this.getYPosition(d.value1) - THIS.markerMaxSize / 2;

						if (newY1 < Y2) {
							return newY1;
						} else {
							return Y2;
						}
					} else {
						const Y1 = this.getYPosition(d.value1) + (this.isHasMultiMeasure ? 0 : THIS.markerMaxSize / 2);
						const newY1 = Y1 + (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y1, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y1, true) : 0)
						const Y2 = this.getYPosition(d.value2) - THIS.markerMaxSize / 2;

						if (newY1 < Y2) {
							return newY1;
						} else {
							return Y2;
						}
					}
				}
			})
			.attr("y2", (d: ILollipopChartRow) => {
				if (this.isBottomXAxis || this.yAxisSettings.isInvertRange) {
					if (d.value1 > d.value2) {
						const Y1 = THIS.getYPosition(d.value1) + THIS.markerMaxSize / 2;
						const Y2 = THIS.getYPosition(d.value2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y2, true) : 0)

						if (newY2 > Y1) {
							return newY2;
						} else {
							return Y1;
						}
					} else {
						const Y1 = THIS.getYPosition(d.value2) + THIS.markerMaxSize / 2;
						const Y2 = THIS.getYPosition(d.value1) - (this.isHasMultiMeasure ? 0 : THIS.markerMaxSize / 2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y2, true) : 0)

						if (newY2 > Y1) {
							return newY2;
						} else {
							return Y1;
						}
					}
				} else {
					if (d.value1 > d.value2) {
						return this.getYPosition(d.value1) - THIS.markerMaxSize / 2;
					} else {
						return this.getYPosition(d.value2) - (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				}
			});
	}

	categoryLabelsFormatting(labelSelection: D3Selection<SVGElement>): void {
		const maxCircleRadius = d3.max([this.circle1Size, this.circle2Size]) / 2;
		const maxPieRadius = d3.max([this.pie1Radius, this.pie2Radius]);

		labelSelection
			.attr("transform", d => {
				const min = d3.min([d.value1, d.value2]);
				const cx = this.getXPosition(this.isHasMultiMeasure ? min : 0);
				let cy = this.getYPosition(d.category) + this.scaleBandWidth / 2 - this.categoryLabelMargin / 2;

				if (this.isHasMultiMeasure) {
					cy -= (this.isLollipopTypePie ? maxPieRadius : maxCircleRadius);
				} else {
					cy -= this.lineSettings.lineWidth / 2;
				}

				return `translate(${cx}, ${cy})`;
			})
			.text((d: ILollipopChartRow) => {
				return d.category;
			})
			.attr("fill", this.getColor(this.xAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", this.xAxisSettings.labelFontFamily)
			.attr("font-size", this.xAxisSettings.labelFontSize)
			.attr("display", "block");
	}

	imageMarkerFormatting(markerSelection: D3Selection<SVGImageElement>, isImage2: boolean, isEnter: boolean): void {
		const width = isImage2 ? this.circle2Size : this.circle1Size;
		const height = isImage2 ? this.circle2Size : this.circle1Size;

		markerSelection
			.attr("width", width)
			.attr("height", height)
			.attr("xlink:href", (d) => {
				if (this.isHasImagesData && this.isShowImageMarker && d.imageDataUrl) {
					return d.imageDataUrl;
				}

				if (this.markerSettings.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.markerSettings.markerShapeBase64Url) {
					return this.markerSettings.markerShapeBase64Url;
				}
			})
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", d => {
				const cx = this.getXPosition(this.isHorizontalChart ? (isImage2 ? d.value2 : d.value1) : d.category);
				return this.isHorizontalChart ? cx : cx + this.scaleBandWidth / 2 - width / 2;
			})
			.attr("y", d => {
				const cy = this.getYPosition(this.isHorizontalChart ? d.category : (isImage2 ? d.value2 : d.value1));
				return !this.isHorizontalChart ? cy - width : cy + this.scaleBandWidth / 2 - width / 2;
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});
	}

	handleCreateOwnDynamicDeviationOnBarClick(barElement: SVGElement): void {
		const THIS = this;
		const isCreateOwnDynamicDeviation: boolean =
			this.dynamicDeviationSettings.isEnabled && this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn;

		if (isCreateOwnDynamicDeviation || THIS.isDynamicDeviationButtonSelected) {
			const data: any = d3.select(barElement).datum();
			if (THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
				THIS.toCategoryValueDataPair = { category: data.category, value: data.value1 };
				RenderDynamicDeviation(this, THIS.fromCategoryValueDataPair, THIS.toCategoryValueDataPair);
				d3.select(".dynamic-deviation-button").classed("selected", false);
				THIS.isDynamicDeviationButtonSelected = false;
				THIS.lollipopG.selectAll(".lollipop-group").style("cursor", "auto");

				if (!THIS.isDeviationCreatedAfterButtonClicked && THIS.dynamicDeviationSettings.displayType !== EDynamicDeviationDisplayTypes.CreateYourOwn) {
					THIS.isDeviationCreatedAfterButtonClicked = true;
					THIS.dynamicDeviationSettings.displayType = EDynamicDeviationDisplayTypes.CreateYourOwn;

					THIS.visualHost.persistProperties({
						merge: [
							{
								objectName: "dynamicDeviationConfig",
								displayName: "dynamicDeviationSettings",
								properties: {
									dynamicDeviationSettings: JSON.stringify({
										...THIS.dynamicDeviationSettings,
										displayType: EDynamicDeviationDisplayTypes.CreateYourOwn,
										lastDisplayType: EDynamicDeviationDisplayTypes.CreateYourOwn,
									}),
								},
								selector: null,
							},
						],
					});
				}
			}

			if (!THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
				THIS.fromCategoryValueDataPair = { category: data.category, value: data.value1 };
			}
		}

		if (!isCreateOwnDynamicDeviation && !THIS.isDynamicDeviationButtonSelected) {
			// HighlightActiveBar(d3.select(barElement), THIS.normalBarG.selectAll("foreignObject"));
		}
	}

	drawLollipopChart(): void {
		this.chartData.forEach(d => {
			if (!this.isHasMultiMeasure) {
				if (!this.isHorizontalChart) {
					d.value2 = 0;
				} else {
					d.value2 = 0;
				}
			}
		});

		if (this.isLollipopTypeCircle) {
			this.setCircle1Radius();
			this.setCircle2Radius();
		} else {
			this.setPie1Radius();
			this.setPie2Radius();
		}

		if (this.isHasMultiMeasure) {
			this.markerMaxSize = (this.isLollipopTypeCircle ? d3.max([this.circle1Size, this.circle2Size]) : d3.max([this.pie1Radius * 2, this.pie2Radius * 2]));
		} else {
			this.markerMaxSize = (this.isLollipopTypeCircle ? this.circle1Size : this.pie1Radius * 2);
		}

		const lollipopSelection = this.lollipopG.selectAll(".lollipop-group").data(this.chartData, (d: ILollipopChartRow) => d.uid);
		let marker: IMarkerData;

		if (this.markerSettings.markerType === EMarkerTypes.SHAPE && this.markerSettings.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = this.markerSettings.markerShapeValue;
			marker = {
				label: this.markerSettings.markerShapeValue.iconName,
				value: this.markerSettings.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: this.markerSettings.markerShapePath, stroke: undefined }]
			}
		} else {
			marker = CATEGORY_MARKERS.find(d => d.value === this.markerSettings.dropdownMarkerType);
		}

		this.lollipopSelection = lollipopSelection.join(
			(enter) => {
				const lollipopG = enter.append("g").attr("class", "lollipop-group");

				lollipopG.on("click", () => {
					this.handleCreateOwnDynamicDeviationOnBarClick(lollipopG.node());
				});

				const lineSelection = lollipopG.append("line").attr("class", this.lineSettings.lineType).classed(this.lineClass, true);

				if (((this.isHasImagesData && this.isShowImageMarker) || (this.isLollipopTypeCircle && this.markerSettings.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.markerSettings.markerShapeBase64Url))) {
					const imageMarker1Selection: D3Selection<any> = lollipopG.append("svg:image")
						.classed(this.circleClass, true)
						.classed(this.imageMarkerClass, true)
						.classed("image-marker1", true);

					imageMarker1Selection
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
						});

					this.imageMarkerFormatting(imageMarker1Selection, false, true);

					if (this.isHasMultiMeasure) {
						const imageMarker2Selection: D3Selection<any> = lollipopG.append("svg:image")
							.classed(this.circleClass, true)
							.classed(this.imageMarkerClass, true)
							.classed("image-marker2", true);

						imageMarker2Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
							});

						this.imageMarkerFormatting(imageMarker2Selection, true, true);
					}
				} else {
					if (this.isLollipopTypeCircle && (this.markerSettings.markerShape === EMarkerShapeTypes.DEFAULT || this.markerSettings.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
						const symbol1 = lollipopG.append("defs")
							.append("symbol")
							.attr("id", d => `${d.category}_${marker.value}_MARKER1`)
							.attr("class", "marker1-symbol")
							.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

						const path1Selection = symbol1.append("path")
							.attr("d", marker.paths[0].d)
							.attr("class", "marker1-path");

						const circle1Selection = lollipopG.append("use")
							.attr("id", CircleType.Circle1)
							.classed(this.circleClass, true)
							.classed(this.circle1Class, true);

						this.setPath1Formatting(path1Selection);
						this.setCircle1Formatting(circle1Selection, marker, true);

						circle1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});

						path1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});

						if (this.isHasMultiMeasure) {
							const symbol2 = lollipopG.append("defs")
								.append("symbol")
								.attr("id", d => `${d.category}_${marker.value}_MARKER2`)
								.attr("class", "marker2-symbol")
								.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

							const path2Selection = symbol2.append("path")
								.attr("d", marker.paths[0].d)
								.attr("class", "marker2-path");

							const circle2Selection = lollipopG.append("use")
								.attr("id", CircleType.Circle2)
								.classed(this.circleClass, true).classed(this.circle2Class, true);

							this.setPath2Formatting(path2Selection);
							this.setCircle2Formatting(circle2Selection, marker, true);

							path2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
								});

							circle2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
								});
						}
					} else {
						const pie1Selection = lollipopG.append("foreignObject")
							.attr("id", "pie1ForeignObject");
						this.enterPieChart(pie1Selection, false, true);
						this.setPieDataLabelsDisplayStyle();

						if (this.isHasMultiMeasure) {
							const pie2Selection = lollipopG.append("foreignObject")
								.attr("id", "pie2ForeignObject");
							this.enterPieChart(pie2Selection, true, true);
							this.setPieDataLabelsDisplayStyle(true);

							pie2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
								})
						}

						pie1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});
					}
				}

				if (this.isHorizontalChart) {
					this.setHorizontalLinesFormatting(lineSelection, true);
				} else {
					this.setVerticalLinesFormatting(lineSelection, true);
				}

				if (this.isHorizontalChart && this.yAxisSettings.isShowLabelsAboveLine) {
					const categoryLabelSelection = lollipopG.append("text").attr("class", "category-label");
					this.categoryLabelsFormatting(categoryLabelSelection);
				}
				return lollipopG;
			},
			(update) => {
				const lineSelection = update.select(this.lineClassSelector).attr("class", this.lineSettings.lineType).classed(this.lineClass, true);

				const marker1SymbolSelection = update.select(".marker1-symbol");

				const marker2SymbolSelection = update.select(".marker2-symbol");

				if (this.isLollipopTypeCircle && (this.markerSettings.markerShape === EMarkerShapeTypes.DEFAULT || this.markerSettings.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
					marker1SymbolSelection
						.attr("id", d => `${d.category}_${marker.value}_MARKER1`)
						.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

					marker2SymbolSelection
						.attr("id", d => `${d.category}_${marker.value}_MARKER2`)
						.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);
				}

				const path1Selection = update.select(".marker1-path").attr("d", this.isLollipopTypeCircle ? marker.paths[0].d : "");

				const circle1Selection = update.select(this.circle1ClassSelector);

				const path2Selection = update.select(".marker2-path").attr("d", this.isLollipopTypeCircle ? marker.paths[0].d : "");

				const circle2Selection = update.select(this.circle2ClassSelector);

				const pie1Selection = update.select("#pie1ForeignObject");

				const pie2Selection = update.select("#pie2ForeignObject");

				const categoryLabelSelection: D3Selection<SVGElement> = update.select(".category-label");
				const imageMarker1Selection: D3Selection<any> = update.select(".image-marker1");
				const imageMarker2Selection: D3Selection<any> = update.select(".image-marker2");

				if (this.isHorizontalChart) {
					this.setHorizontalLinesFormatting(lineSelection, false);
				} else {
					this.setVerticalLinesFormatting(lineSelection, false);
				}

				if (((this.isHasImagesData && this.isShowImageMarker) || (this.isLollipopTypeCircle && this.markerSettings.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.markerSettings.markerShapeBase64Url))) {
					this.imageMarkerFormatting(imageMarker1Selection, false, false);

					if (this.isHasMultiMeasure) {
						this.imageMarkerFormatting(imageMarker2Selection, true, false);
					}
				} else {
					if (this.isLollipopTypeCircle && (this.markerSettings.markerShape === EMarkerShapeTypes.DEFAULT || this.markerSettings.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
						pie1Selection.remove();
						pie2Selection.remove();

						this.setPath1Formatting(path1Selection);
						this.setCircle1Formatting(circle1Selection, marker, false);

						if (this.isHasMultiMeasure) {
							this.setPath2Formatting(path2Selection);
							this.setCircle2Formatting(circle2Selection, marker, false);
						} else {
							circle2Selection.remove();
						}
					} else {
						circle1Selection.remove();
						circle2Selection.remove();

						this.updatePieChart(pie1Selection, false, false);
						this.setPieDataLabelsDisplayStyle();

						if (this.isHasMultiMeasure) {
							this.updatePieChart(pie2Selection, true, false);
							this.setPieDataLabelsDisplayStyle(true);
						}
					}
				}

				if (this.isHorizontalChart && this.yAxisSettings.isShowLabelsAboveLine) {
					this.categoryLabelsFormatting(categoryLabelSelection);
				} else {
					categoryLabelSelection.attr("display", "none");
				}

				path1Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					});

				circle1Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					});

				path2Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					});

				circle2Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					});

				pie1Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					});

				pie2Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					});

				imageMarker1Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					});

				imageMarker2Selection
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					});

				return update;
			}
		) as any;

		this.drawData1Labels(this.dataLabelsSettings.show && this.isLollipopTypeCircle ? this.chartData : []);
		this.drawData2Labels(this.dataLabelsSettings.show && this.isHasMultiMeasure && this.isLollipopTypeCircle ? this.chartData : []);
		RenderErrorBars(this, this.isShowErrorBars && this.errorBarsSettings.errorBars.isEnabled && this.isLollipopTypeCircle ? this.chartData : []);
		RenderErrorBand(this, this.isShowErrorBars && this.errorBarsSettings.errorBand.isEnabled && this.isLollipopTypeCircle ? this.chartData : []);

		if (this.errorBarsSettings.measurement.calcType === EErrorBarsCalcTypes.ByField && !this.isHasErrorLowerBounds && !this.isHasErrorUpperBounds) {
			RenderErrorBars(this, []);
			RenderErrorBand(this, []);
		}

		if (this.chartSettings.isShowZeroBaseLine) {
			this.drawZeroSeparatorLine();
		} else {
			this.zeroSeparatorLine.attr("display", "none");
		}

		this.referenceLinesData = GetReferenceLinesData(this);
		RenderReferenceLines(this, this.referenceLinesData as IReferenceLineSettings[]);

		const THIS = this;
		const isCreateOwnDynamicDeviation: boolean =
			this.dynamicDeviationSettings.isEnabled && this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn;
		this.lollipopG.selectAll(".lollipop-group")
			.on("mouseover", function () {
				if (isCreateOwnDynamicDeviation || THIS.isDynamicDeviationButtonSelected) {
					if (THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
						const data: any = d3.select(this).datum();
						const toCategoryValueDataPair = { category: data.category, value: data.value1 };
						RenderDynamicDeviation(THIS, THIS.fromCategoryValueDataPair, toCategoryValueDataPair);
						THIS.toCategoryValueDataPair = undefined!;
					}
				}
			});

		if (this.dynamicDeviationSettings.isEnabled && this.isLollipopTypeCircle && !this.isHasMultiMeasure) {
			SetDynamicDeviationDataAndDrawLines(this);
		} else {
			RemoveDynamicDeviation(this);
		}

		if (this.chartSettings.showConnectingLine) {
			this.connectingLineG.selectAll("*").remove();

			RenderConnectingLine(this, this.chartData, false);
			if (this.isHasMultiMeasure) {
				RenderConnectingLine(this, this.chartData, true);
			}
		} else {
			this.connectingLineG.selectAll("*").remove();
		}

		RenderBarCutAndClipMarker(this, this.isCutAndClipAxisEnabled ? this.chartData : []);
	}

	drawZeroSeparatorLine(): void {
		this.zeroSeparatorLine
			.attr("stroke", this.chartSettings.zeroBaseLineColor)
			.attr("stroke-width", this.chartSettings.zeroBaseLineSize)
			.attr("display", this.chartSettings.isShowZeroBaseLine ? "block" : "none");

		if (this.isHorizontalChart) {
			this.zeroSeparatorLine
				.attr("x1", this.getXPosition(0))
				.attr("x2", this.getXPosition(0))
				.attr("y1", this.height)
				.attr("y2", 0);
		} else {
			this.zeroSeparatorLine
				.attr("x1", 0)
				.attr("x2", this.width)
				.attr("y1", this.getYPosition(0))
				.attr("y2", this.getYPosition(0));
		}
	}

	//.CIRCLE
	setCircle1Radius(): void {
		const marker1Style = this.markerSettings.marker1Style;
		if (marker1Style.isAutoMarkerSize) {
			const size = d3.min([this.width * 0.10, this.scaleBandWidth * 0.80]);
			if (size < this.maxCircleSize && size > this.minCircleSize) {
				this.circle1Size = size;
			} else if (size > this.maxCircleSize) {
				this.circle1Size = this.maxCircleSize;
			} else if (size < this.minCircleSize) {
				this.circle1Size = this.minCircleSize;
			}
		} else {
			this.circle1Size = marker1Style.markerSize;
		}
	}

	setCircle2Radius(): void {
		const marker2Style = this.markerSettings.marker2Style;
		if (marker2Style.isAutoMarkerSize) {
			const size = d3.min([this.width * 0.10, this.scaleBandWidth * 0.80]);
			if (size < this.maxCircleSize && size > this.minCircleSize) {
				this.circle2Size = size;
			} else if (size > this.maxCircleSize) {
				this.circle2Size = this.maxCircleSize;
			} else if (size < this.minCircleSize) {
				this.circle2Size = this.minCircleSize;
			}
		} else {
			this.circle2Size = marker2Style.markerSize;
		}
	}

	getOverflowCircleCXDiff(x: number): number {
		let diff = 0;
		if (this.yAxisSettings.position === Position.Left) {
			diff = x <= this.circle1Size ? this.circle1Size - x : 0;
		} else {
			diff = this.width - x <= this.circle1Size ? this.circle1Size - (this.width - x) : 0;
		}
		return diff;
	}

	getOverflowCircleCYDiff(y: number): number {
		let diff = 0;
		if (this.xAxisSettings.position === Position.Bottom) {
			diff = this.height - y <= this.circle1Size ? this.circle1Size - (this.height - y) : 0;
		} else {
			diff = y <= this.circle1Size ? this.circle1Size - y : 0;
		}
		return diff;
	}

	setPath1Formatting(circleSelection: any): void {
		circleSelection
			.style("fill", (d: ILollipopChartRow) => {
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
				const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
				const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);

				if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
					return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
				} else {
					return color;
				}
			}
			);
	}

	getCircleXScaleDiff(cx: number, isCircle2: boolean): number {
		if (!this.isLeftYAxis) {
			const isLessSpace = (this.width - this.xAxisStartMargin - cx) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				return Math.abs((this.width - this.xAxisStartMargin - cx) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (cx - this.xAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				return Math.abs((cx - this.xAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		}
	}

	getCircleYScaleDiff(cy: number, isCircle2: boolean): number {
		if (this.isBottomXAxis) {
			const isLessSpace = (this.height - this.yAxisStartMargin - cy) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				return Math.abs((this.height - this.yAxisStartMargin - cy) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (cy - this.yAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				return Math.abs((cy - this.yAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		}
	}

	updateAnnotationNodeElements(): void {
		this.visualAnnotations.updateNodeElements(this.isLollipopTypePie ? d3.selectAll(".pie-slice") : d3.selectAll(".lollipop-circle"));
		this.visualAnnotations.renderAnnotations();
	}

	setCircle1Formatting(circleSelection: D3Selection<any>, marker: IMarkerData, isEnter: boolean): void {
		this.setCircle1Radius();
		circleSelection
			.attr("width", this.circle1Size)
			.attr("height", this.circle1Size)
			.attr("href", d => `#${d.category}_${marker.value}_MARKER1`)
			.style("display", "block")
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const cx = this.getXPosition(this.isHorizontalChart ? d.value1 : d.category);
				if (!this.isLeftYAxis) {
					return this.isHorizontalChart ? cx - this.circle1Size / 2 - this.getCircleXScaleDiff(cx, false) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
				} else {
					return this.isHorizontalChart ? cx - this.circle1Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
				}
			})
			.attr("y", (d) => {
				const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value1);
				if (this.isBottomXAxis) {
					return !this.isHorizontalChart ? cy - this.circle1Size / 2 - this.getCircleYScaleDiff(cy, false) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
				} else {
					return !this.isHorizontalChart ? cy - this.circle1Size / 2 + this.getCircleYScaleDiff(cy, false) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
				}
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});
	}

	setPath2Formatting(circleSelection: any): void {
		circleSelection
			.style("fill", (d: ILollipopChartRow) => {
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
				const posNegColor = d.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
				const color = this.getColor(isPosNegColorScheme ? posNegColor : this.categoryColorPair[d.category].marker2Color, EHighContrastColorType.Foreground);

				if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
					return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
				} else {
					return color;
				}
			}
			)
			.style("display", "block");
	}

	setCircle2Formatting(circleSelection: any, marker: IMarkerData, isEnter: boolean): void {
		this.setCircle2Radius();
		circleSelection
			.attr("width", this.circle2Size)
			.attr("height", this.circle2Size)
			.attr("href", d => `#${d.category}_${marker.value}_MARKER2`)
			.style("display", (d) => (this.isHasMultiMeasure && d.value2 ? "block" : "none"))
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const cx = this.getXPosition(this.isHorizontalChart ? d.value2 : d.category);
				if (!this.isLeftYAxis) {
					return this.isHorizontalChart ? cx - this.circle2Size / 2 - this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
				} else {
					return this.isHorizontalChart ? cx - this.circle2Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
				}
			})
			.attr("y", (d) => {
				const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value2);
				if (this.isBottomXAxis) {
					return !this.isHorizontalChart ? cy - this.circle2Size / 2 - this.getCircleYScaleDiff(cy, true) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
				} else {
					return !this.isHorizontalChart ? cy - this.circle2Size / 2 + this.getCircleYScaleDiff(cy, true) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
				}
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});
	}

	// Pie
	setPie1Radius(): void {
		const marker1Style = this.markerSettings.marker1Style;
		if (marker1Style.isAutoMarkerSize) {
			const size = d3.min([this.width * 0.10, this.scaleBandWidth * 0.80]) / 2;
			if (size < this.maxPieSize && size > this.minPieSize) {
				this.pie1Radius = size;
			} else if (size > this.maxPieSize) {
				this.pie1Radius = this.maxPieSize;
			} else if (size < this.minPieSize) {
				this.pie1Radius = this.minPieSize;
			}
		} else {
			this.pie1Radius = marker1Style.markerSize;
		}
	}

	setPie2Radius(): void {
		const marker2Style = this.markerSettings.marker2Style;
		if (marker2Style.isAutoMarkerSize) {
			const size = d3.min([this.width * 0.10, this.scaleBandWidth * 0.80]) / 2;
			if (size < this.maxPieSize && size > this.minPieSize) {
				this.pie2Radius = size;
			} else if (size > this.maxPieSize) {
				this.pie2Radius = this.maxPieSize;
			} else if (size < this.minPieSize) {
				this.pie2Radius = this.minPieSize;
			}
		} else {
			this.pie2Radius = marker2Style.markerSize;
		}
	}

	setPie1ChartFormatting(): void {
		this.setPie1Radius();
	}

	setPie2ChartFormatting(): void {
		this.setPie2Radius();
	}

	getPieChartSeriesDataByCategory(category: string, isPie2: boolean = false) {
		const id = this.chartData.findIndex((data) => data.category === category);
		const getPieFill = (d: IChartSubCategory, parent: ILollipopChartRow) => {
			let color;
			const valueType = isPie2 ? "value2" : "value1";

			if (d.parentCategory === this.othersBarText) {
				color = this.rankingSettings.category.othersColor;
			} else {
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
				const posNegColor = parent[valueType] >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;

				if (isPosNegColorScheme) {
					color = posNegColor;
				} else {
					color = isPie2 ? this.subCategoryColorPair[d.category].marker2Color : this.subCategoryColorPair[d.category].marker1Color;
				}
			}

			if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
				return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
			} else {
				return color;
			}
		}

		return this.chartData[id].subCategories.map((data) => ({
			value: isPie2 ? data.value2 : data.value1,
			name: data.category,
			itemStyle: { color: this.getColor(getPieFill(data, this.chartData[id]), EHighContrastColorType.Foreground), className: "pie-slice" },
		}));
	}

	getPieSliceClass(category: string, subCategory: string): string {
		return `${category}-${subCategory}`.replace(/ /g, "").toLocaleLowerCase().trim();
	}

	getPieChartSeriesRadius(): string | string[] | number[] {
		switch (this.markerSettings.markerChart) {
			case EMarkerChartTypes.PIE: {
				return `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`;
			}
			case EMarkerChartTypes.DONUT: {
				return ["55%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			case EMarkerChartTypes.ROSE: {
				return ["30%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			default: {
				return `${this.pieViewBoxRatio}%`;
			}
		}
	}

	getPieDataLabelsFontSize(isPie2: boolean = false): number {
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		let autoFontSize = this.dataLabelsSettings.fontSize;
		switch (this.markerSettings.markerChart) {
			case EMarkerChartTypes.PIE:
				autoFontSize = (pieRadius - pieRadius * (this.pieEmphasizeScaleSize / 100)) / 2;
				break;

			case EMarkerChartTypes.DONUT:
				autoFontSize = pieRadius - pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100);
				break;

			case EMarkerChartTypes.ROSE:
				autoFontSize = pieRadius - pieRadius * ((70 + this.pieEmphasizeScaleSize) / 100);
				break;
		}

		if (!this.dataLabelsSettings.isAutoFontSize) {
			return this.dataLabelsSettings.fontSize;
		} else {
			return d3.min([autoFontSize]);
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
					data: this.getPieChartSeriesDataByCategory(category, isPie2),
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
			show: this.dataLabelsSettings.show,
			color: this.dataLabelsSettings.color,
			textBorderColor: this.dataLabelsSettings.borderColor,
			textBorderWidth: this.dataLabelsSettings.borderWidth,
			fontSize: this.getPieDataLabelsFontSize(isPie2),
			fontFamily: this.dataLabelsSettings.fontFamily,
			textDecoration: "underline",
			textStyle: {
				fontWeight: this.dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "",
				fontStyle: this.dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "",
				decoration: this.dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "", // Set text decoration to underline
			},
			position: "center",
			formatter: () => {
				return this.formatNumber(categoryValue, this.numberSettings, this.measureNumberFormatter[isPie2 ? 1 : 0], true, true);
			},
		};

		const categoryValue = this.chartData.find((d) => d.category === category)[isPie2 ? "value2" : "value1"];
		switch (this.markerSettings.markerChart) {
			case EMarkerChartTypes.PIE: {
				pieOption.series[0].itemStyle = {
					borderRadius: 0,
					borderColor: "#fff",
					borderWidth: 0,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case EMarkerChartTypes.DONUT: {
				pieOption.series[0].itemStyle = {
					borderRadius: 10,
					borderColor: "#fff",
					borderWidth: 2,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case EMarkerChartTypes.ROSE: {
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
			.style("opacity", function () {
				return (this as SVGSVGElement).getBBox().width >= pieRadius * 2 ? "0" : "1";
			});
	}

	getPieXScaleDiff(x: number, isPie2: boolean): number {
		if (this.isLeftYAxis) {
			const isLessSpace = (x - this.xAxisStartMargin) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				return Math.abs((x - this.xAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (this.width - this.xAxisStartMargin - x) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				return Math.abs((this.width - this.xAxisStartMargin - x) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		}
	}

	getPieYScaleDiff(y: number, isPie2: boolean): number {
		if (this.isBottomXAxis) {
			const isLessSpace = (this.height - this.yAxisStartMargin - y) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				return Math.abs((this.height - this.yAxisStartMargin - y) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (y - this.yAxisStartMargin) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				return Math.abs((y - this.yAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		}
	}

	enterPieChart(pieForeignObjectSelection: any, isPie2: boolean, isEnter: boolean): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("id", isPie2 ? "pie2ForeignObject" : "pie1ForeignObject")
			.attr("width", d)
			.attr("height", d)
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
						return { ...d, valueType: isPie2 ? DataValuesType.Value2 : DataValuesType.Value1, sliceWidth: bBox.width, sliceHeight: bBox.height }
					})
				})

				ele.selectAll("path").attr("id", (pieData: IChartSubCategory) => {
					return pieData.valueType === DataValuesType.Value1 ? PieType.Pie1 : PieType.Pie2;
				});

				ele.selectAll("path").attr("class", () => {
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

				this.tooltipServiceWrapper.addTooltip(
					ele.selectAll("path"),
					(datapoint: IChartSubCategory) => getTooltipData(datapoint, isPie2),
					(datapoint: IChartSubCategory) => datapoint.identity
				);

				const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
					return this.numberSettings.show ? this.formatNumber(value, this.numberSettings, numberFormatter, true, true) : powerBiNumberFormat(value, numberFormatter);
				};

				const getTooltipData = (pieData: IChartSubCategory, isPie2: boolean): VisualTooltipDataItem[] => {
					const tooltipData: TooltipData[] = [
						{
							displayName: this.categoryDisplayName,
							value: pieData.parentCategory,
							color: "transparent",
						},
						{
							displayName: this.subCategoryDisplayName,
							value: pieData.category,
							color: "transparent",
						},
						{
							displayName: pieData.valueType === DataValuesType.Value2 ? this.measure2DisplayName : this.measure1DisplayName,
							value: numberFormatter(pieData[valueKey], isPie2 ? this.measureNumberFormatter[1] : this.measureNumberFormatter[0]),
							color: pieData.valueType === DataValuesType.Value2 ? this.subCategoryColorPair[pieData.category].marker2Color : this.subCategoryColorPair[pieData.category].marker1Color,
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
			})

		pieForeignObjectSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const pieX = this.getXPosition(this.isHorizontalChart ? d[valueKey] : d.category);
				if (this.isLeftYAxis) {
					return this.isHorizontalChart ? pieX - pieRadius + this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius;
				} else {
					return this.isHorizontalChart ? pieX - pieRadius - this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius;
				}
			})
			.attr("y", (d) => {
				const pieY = this.getYPosition(this.isHorizontalChart ? d.category : d[valueKey]);
				if (this.isBottomXAxis) {
					return !this.isHorizontalChart ? pieY - pieRadius - this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius;
				} else {
					return !this.isHorizontalChart ? pieY - pieRadius + this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius;
				}
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});

		// this.pieG.on("mouseover", (e) => {
		// 	if (e.path.length && e.path[5]) {
		// 		d3.select(e.path[5]).raise();
		// 	}
		// });

		// this.pieG.on("mouseout", () => {
		// 	this.pieG.selectAll("foreignObject").sort((a, b) => d3.ascending(a.sortId, b.sortId));
		// });
	}

	updatePieChart(pieForeignObjectSelection: any, isPie2: boolean, isEnter: boolean): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("width", d)
			.attr("height", d)
			.select("#pie")
			.style("width", "100%")
			.style("height", "100%")
			.each((d, i, nodes) => {
				const ele = d3.select(nodes[i]);
				const ePieChart = echarts.init(ele.node());
				ePieChart.setOption(this.getPieChartOptions(d.category, isPie2));
				ePieChart.resize();

				ele.selectAll("path").data(d.subCategories);
				ele.selectAll("path").each(function () {
					const bBox = (d3.select(this).node() as SVGSVGElement).getBBox();
					d3.select(this).datum((d: any) => {
						return { ...d, valueType: isPie2 ? DataValuesType.Value2 : DataValuesType.Value1, sliceWidth: bBox.width, sliceHeight: bBox.height }
					})
				})

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
			})

		pieForeignObjectSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const pieX = this.getXPosition(this.isHorizontalChart ? d[valueKey] : d.category);
				if (this.isLeftYAxis) {
					return this.isHorizontalChart ? pieX - pieRadius + this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius;
				} else {
					return this.isHorizontalChart ? pieX - pieRadius - this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius;
				}
			})
			.attr("y", (d) => {
				const pieY = this.getYPosition(this.isHorizontalChart ? d.category : d[valueKey]);
				if (this.isBottomXAxis) {
					return !this.isHorizontalChart ? pieY - pieRadius - this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius;
				} else {
					return !this.isHorizontalChart ? pieY - pieRadius + this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius;
				}
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});
	}

	// Legend
	setLegendsData(): void {
		let legend1DataPoints: { data: { name: string, color: string, pattern: IPatternProps } }[] = [];

		if (this.isLollipopTypeCircle) {
			legend1DataPoints = [{
				data: {
					name: this.measure1DisplayName,
					color: "",
					pattern: undefined
				}
			},
			{
				data: {
					name: this.measure2DisplayName,
					color: "",
					pattern: undefined
				}
			}
			];
		} else {
			legend1DataPoints = this.subCategoriesName.map((name) => ({
				data: {
					name: name,
					color: this.getColor(this.subCategoryColorPair[name].marker1Color, EHighContrastColorType.Foreground),
					pattern: this.subCategoryPatterns.find(d => d.name === name)
				}
			}));

		}

		this.legendData = legend1DataPoints;
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
				this.isChartInit = false;
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
				padding: 4px 5px;
				line-height: 1;
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
			categoricalGroupedDatarole: EDataRolesName.SubCategory,
			excludeDataRolesFromTable: [EDataRolesName.SubCategory],
			excludeNegativeDataBy: "cell",
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

				if (this.imagesDataFieldsName.includes(field)) {
					return value;
				}

				if (this.allNumberFormatter[field].role === EDataRolesName.Measure) {
					return this.numberSettings.show
						? this.formatNumber(value, this.numberSettings, this.allNumberFormatter[field].formatter, true, true)
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
		const brushXAxisTicksMaxHeight = d3.max(brushXAxisTicksWidth, (d) => +d) + 10;
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
		const yPos = this.viewPortHeight - this.settingsBtnHeight - this.legendViewPort.height - this.brushXAxisTicksMaxHeight - this.footerHeight;
		this.brushXAxisG.attr("transform", `translate(${this.margin.left},${yPos})`)
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
					}) as any
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
		const xPos = this.viewPortWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width - this.brushYAxisTicksMaxWidth;
		this.brushYAxisG.attr("transform", `translate(${xPos},${this.margin.top})`)
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
					}) as any
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

	drawBrushLollipopChart(clonedCategoricalData: powerbi.DataViewCategorical): void {
		const brushScaleBandwidth = this.brushScaleBand.bandwidth();
		const measures = clonedCategoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const subCategoriesGroup = d3.group(clonedCategoricalData.values, (d: any) => d.source.groupName);

		const getUID = (category: string) => {
			return `${category}-
			${this.isHasSubcategories}-
			${this.isHasMultiMeasure}-
			${this.isHasImagesData}-
			${this.categoricalData.categories[0].values.length}-
			${this.categoricalData.values.length}-
			${this.markerSettings.markerType}-
			${this.markerSettings.markerShape}-
			${this.markerSettings.markerChart}-
			${this.isShowImageMarker}`;
		}

		const categories = [...new Set(clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values)];

		let idx = 0;
		const initialData = categories.reduce((arr, cur: string) => {
			(this.isChartIsRaceChart && this.raceChartKeyLabelList.length > 0 ? this.raceChartKeyLabelList : [{ key: "", label: "" }]).forEach(raceBarKeyLabel => {
				const raceChartKey = raceBarKeyLabel.key;
				const raceChartDataLabel = raceBarKeyLabel.label;
				const obj = { category: cur, uid: getUID(cur), raceChartKey, raceChartDataLabel, styles: { circle1: { fillColor: "" }, circle2: { fillColor: "" } }, value1: 0, value2: 0 };

				if (this.isHasSubcategories) {
					this.subCategoriesName.forEach(name => {
						const subCategoryGroup = subCategoriesGroup.get(name);
						const measures = subCategoryGroup.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
						measures.forEach((d, j) => {
							if (!obj[`value${j + 1}`]) {
								obj[`value${j + 1}`] = +d.values[idx];
							} else {
								obj[`value${j + 1}`] += +d.values[idx];
							}
						})
					})
				} else {
					measures.forEach((d, j) => {
						obj[`value${j + 1}`] = +d.values[idx];
					})
				}

				arr = [...arr, obj];
				idx++;
			});
			return arr;
		}, []);

		let chartData = [];
		if (this.isChartIsRaceChart) {
			const raceData = categories.reduce((acc, category) => {
				this.raceChartKeysList.forEach((key) => {
					acc = [...acc, initialData.find((d) => d.category === category && d.raceChartKey === key)];
				});
				return acc;
			}, []);

			const setDataWithAllPositiveCategory = () => {
				chartData = raceData.filter((d) => d.raceChartKey === this.raceChartKeysList[this.tickIndex]);
			};

			setDataWithAllPositiveCategory();
		} else {
			chartData = initialData;
		}

		const values = chartData.reduce((arr, d) => {
			return [...arr, d.value1, d.value2];
		}, []);

		let min = +d3.min(this.isHasMultiMeasure ? values.map((val) => val) : chartData.map((d) => d.value1));
		if (min > 0) {
			min = 0;
		}

		const max = +d3.max(this.isHasMultiMeasure ? values.map((val) => val) : chartData.map((d) => d.value1));

		if (this.isHorizontalChart) {
			this.brushXScale.domain([min, max]);
		} else {
			this.brushYScale.domain([min, max]);
		}

		let marker: IMarkerData;
		if (this.markerSettings.markerType === EMarkerTypes.SHAPE && this.markerSettings.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = this.markerSettings.markerShapeValue;
			marker = {
				label: this.markerSettings.markerShapeValue.iconName,
				value: this.markerSettings.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: this.markerSettings.markerShapePath, stroke: undefined }]
			}
		} else {
			marker = CATEGORY_MARKERS.find(d => d.value === this.markerSettings.dropdownMarkerType);
		}

		if (this.markerSettings.markerType === EMarkerTypes.CHART || this.markerSettings.markerShape === EMarkerShapeTypes.UPLOAD_ICON) {
			marker = CATEGORY_MARKERS.find(d => d.value === EMarkerDefaultShapes.CIRCLE);
		}

		const setPath1Formatting = (circleSelection: any): void => {
			circleSelection
				.style("fill", (d: ILollipopChartRow) => {
					const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
					const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
					let color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);
					color = color && !this.isShowImageMarker ? color : "rgba(92,113,187,1)";
					if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
						return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
					} else {
						return color;
					}
				}
				);
		}

		const setPath2Formatting = (circleSelection: any): void => {
			circleSelection
				.style("fill", (d: ILollipopChartRow) => {
					const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
					const posNegColor = d.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
					let color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker2Color : null), EHighContrastColorType.Foreground);
					color = color && !this.isShowImageMarker ? color : "rgba(92,113,187,1)";
					if (d.pattern && d.pattern.patternIdentifier && d.pattern.patternIdentifier !== "" && String(d.pattern.patternIdentifier).toUpperCase() !== "NONE") {
						return `url('#${generatePattern(this.svg, d.pattern, color)}')`;
					} else {
						return color;
					}
				}
				);
		}

		const setVerticalLinesFormatting = (linesSelection, isEnter: boolean) => {
			linesSelection
				.attr("stroke", (d: ILollipopChartRow) => this.getLineStroke(d))
				.attr("stroke-width", this.lineSettings.lineWidth)
				.transition()
				.duration(isEnter ? 0 : this.tickDuration)
				.ease(easeLinear)
				.attr("x1", (d) => this.brushScaleBand(d.category) + brushScaleBandwidth / 2)
				.attr("x2", (d) => this.brushScaleBand(d.category) + brushScaleBandwidth / 2)
				.attr("y1", (d) => {
					if (d.value1 > d.value2) {
						return this.brushYScale(d.value1);
					} else {
						return this.brushYScale(d.value2);
					}
				})
				.attr("y2", (d) => {
					if (d.value1 > d.value2) {
						const Y1 = this.brushYScale(d.value1);
						const Y2 = this.brushYScale(d.value2) - (this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);

						if (Y2 > Y1) {
							return Y2;
						} else {
							return Y1;
						}
					} else {
						const Y1 = this.brushYScale(d.value2);
						const Y2 = this.brushYScale(d.value1) - (this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);

						if (Y2 > Y1) {
							return Y2;
						} else {
							return Y1;
						}
					}
				});
		}

		const setHorizontalLinesFormatting = (linesSelection, isEnter: boolean) => {
			linesSelection
				.attr("stroke", (d: ILollipopChartRow) => this.getLineStroke(d))
				.attr("stroke-width", this.lineSettings.lineWidth)
				.transition()
				.duration(isEnter ? 0 : this.tickDuration)
				.ease(easeLinear)
				.attr("x1", (d) => {
					if (d.value1 > d.value2) {
						const X1 = this.brushXScale(d.value2) - (!this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);
						const X2 = this.brushXScale(d.value1) - (this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);

						if (X1 < X2) {
							return X1;
						} else {
							return X2;
						}
					} else {
						const X1 = this.brushXScale(d.value1) - (!this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);
						const X2 = this.brushXScale(d.value2) - (this.isHasMultiMeasure ? this.brushAndZoomAreaCircleSize : 0);

						if (X1 < X2) {
							return X1;
						} else {
							return X2;
						}
					}
				})
				.attr("x2", (d) => {
					if (d.value1 > d.value2) {
						return this.brushXScale(d.value1) - (this.brushAndZoomAreaCircleSize);
					} else {
						return this.brushXScale(d.value2) - (this.brushAndZoomAreaCircleSize);
					}
				})
				.attr("y1", (d) => this.brushYScale(d.category) + brushScaleBandwidth / 2)
				.attr("y2", (d) => this.brushYScale(d.category) + brushScaleBandwidth / 2);
		}

		const setCircleFormatting = (circleSelection: any, isCircle2: boolean = false, marker: IMarkerData, isEnter: boolean) => {
			circleSelection
				.attr("width", this.brushAndZoomAreaCircleSize)
				.attr("height", this.brushAndZoomAreaCircleSize)
				.attr("href", d => isCircle2 ? `#${d.category}_${marker.value}_BRUSH_MARKER2` : `#${d.category}_${marker.value}_BRUSH_MARKER1`)
				.transition()
				.duration(isEnter ? 0 : this.tickDuration)
				.ease(easeLinear)
				.attr("x", (d) => {
					const cx = this.brushXScale(this.isHorizontalChart ? (isCircle2 ? d.value2 : d.value1) : d.category);
					return this.isHorizontalChart ? cx - this.brushAndZoomAreaCircleSize : cx + brushScaleBandwidth / 2 - this.brushAndZoomAreaCircleSize / 2;
				})
				.attr("y", (d) => {
					const cy = this.brushYScale(this.isHorizontalChart ? d.category : (isCircle2 ? d.value2 : d.value1));
					return this.isHorizontalChart ? cy + brushScaleBandwidth / 2 - this.brushAndZoomAreaCircleSize / 2 : cy - this.brushAndZoomAreaCircleSize;
				});
		}

		const lollipopGSelection = this.brushLollipopG.selectAll(".brush-lollipop-group").data(chartData, (d: any) => d.uid);
		lollipopGSelection.join(
			(enter) => {
				const lollipopG = enter.append("g").attr("class", "brush-lollipop-group");
				const lineSelection = lollipopG.append("line").attr("class", this.lineSettings.lineType).classed("brush-lollipop-line", true);

				const symbol1 = lollipopG.append("defs")
					.append("symbol")
					.attr("id", d => `${d.category}_${marker.value}_BRUSH_MARKER1`)
					.attr("class", "marker1-symbol")
					.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

				const path1Selection = symbol1.append("path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("d", marker.paths[0].d)
					.attr("class", "marker1-path");

				const circle1Selection = lollipopG.append("use")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("id", CircleType.Circle1)
					.classed("chart-circle1", true);

				setPath1Formatting(path1Selection);
				setCircleFormatting(circle1Selection, false, marker, true);

				if (this.isHasMultiMeasure) {
					const symbol2 = lollipopG.append("defs")
						.append("symbol")
						.attr("id", d => `${d.category}_${marker.value}_BRUSH_MARKER2`)
						.attr("class", "marker2-symbol")
						.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

					const path2Selection = symbol2.append("path")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
						})
						.attr("d", marker.paths[0].d)
						.attr("class", "marker2-path");

					const circle2Selection = lollipopG.append("use")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
						})
						.attr("id", CircleType.Circle2)
						.classed("chart-circle2", true);

					setPath2Formatting(path2Selection);
					setCircleFormatting(circle2Selection, true, marker, true);
				}

				if (this.isHorizontalChart) {
					setHorizontalLinesFormatting(lineSelection, true);
				} else {
					setVerticalLinesFormatting(lineSelection, true);
				}

				return lollipopG;
			},
			(update) => {
				const lineSelection = update.select(".brush-lollipop-line");
				const circle1Selection = update.select(".chart-circle1");
				const circle2Selection = update.select(".chart-circle2");

				update
					.select(".marker1-symbol")
					.attr("id", d => `${d.category}_${marker.value}_BRUSH_MARKER1`)
					.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

				update
					.select(".marker2-symbol")
					.attr("id", d => `${d.category}_${marker.value}_BRUSH_MARKER2`)
					.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

				const path1Selection = update.select(".marker1-path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("d", marker.paths[0].d);

				const path2Selection = update.select(".marker2-path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					})
					.attr("d", marker.paths[0].d);

				setPath1Formatting(path1Selection);
				setCircleFormatting(circle1Selection, false, marker, false);

				if (this.isHasMultiMeasure) {
					setPath2Formatting(path2Selection);
					setCircleFormatting(circle2Selection, true, marker, false);
				}

				if (this.isHorizontalChart) {
					setHorizontalLinesFormatting(lineSelection, false);
				} else {
					setVerticalLinesFormatting(lineSelection, false);
				}

				return update;
			}
		) as any;
	}

	public getColor(color: string, highContrastColorType: EHighContrastColorType): string {
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