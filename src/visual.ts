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
import IDownloadService = powerbi.extensibility.IDownloadService;

import * as d3 from "d3";
import 'd3-transition';
import { easeLinear } from "d3";
import { IBrushLollipopChartData, IChartSubCategory, IErrorBarValue, ILollipopChartRow, IValueFormatter, TooltipData } from "./model";
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
	EDynamicDeviationDisplayTypes,
	AxisCategoryType,
	EErrorBarsDirection,
	RankingDataValuesType,
	ECFApplyOnCategories,
	ECFValueTypes,
	ECFRankingTypes,
	EAxisDateFormats,
	DisplayUnits,
	EMarkerSettings,
	ECFBasedOnValueTypes,
	EPatternByDataTypes,
	ECutAndClipMarkerPlacementTypes,
	ERankingSuffix,
	ERankingCalcMethod,
	EDataLabelsBGApplyFor,
	EDataLabelsDisplayTypes,
	EGeneralTemplates,
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
	DYNAMIC_DEVIATION_SETTINGS,
	CUT_AND_CLIP_AXIS_SETTINGS,
	POSITIVE_COLOR,
	NEGATIVE_COLOR,
	MonthNames,
	SMALL_MULTIPLES_SETTINGS,
	TEMPLATES_SETTINGS
} from "./constants";
import {
	EInsideTextColorTypes,
	IBrushAndZoomAreaSettings,
	IBrushConfig,
	ICategoryValuePair,
	IChartSettings,
	IConditionalFormattingProps,
	ICutAndClipAxisSettings,
	IDataColorsSettings,
	IDataLabelsProps,
	IDataLabelsSettings,
	IDynamicDeviationSettings,
	IErrorBarsMarker,
	IErrorBarsSettings,
	IFooterSettings,
	IGridLinesPropsSettings,
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
	ITemplateSettings,
	IXAxisSettings,
	IYAxisSettings,
} from "./visual-settings.interface";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { SVGRenderer } from "echarts/renderers";
import { EChartsOption, number } from "echarts";
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
import BrushAndZoomAreaSettings from "./settings-pages/BrushAndZoomAreaSettings";
import PatternSettings from "./settings-pages/FillPatterns";
import AxisSettings from "./settings-pages/AxisSettings";
import YAxisSettings from "./settings-pages/YAxisSettings";
import RaceChartSettings from "./settings-pages/RaceChartSettings";
import ReferenceLinesSettings from "./settings-pages/ReferenceLines";
import TemplatesSettings from "./settings-pages/Templates";

import { Components } from "@truviz/shadow/dist/types/EditorTypes";
import { CATEGORY_MARKERS } from "./settings-pages/markers";
import { IMarkerData } from "./settings-pages/markerSelector";
import { BrushAndZoomAreaSettingsIcon, ChartSettingsIcon, ConditionalFormattingIcon, CutAndClipAxisIcon, DataColorIcon, DataLabelsIcon, DynamicDeviationIcon, ErrorBarsIcon, FillPatternsIcon, GridIcon, ImportExportIcon, LineSettingsIcon, MarkerSettingsIcon, RaceChartSettingsIcon, RankingIcon, ReferenceLinesIcon, ShowConditionIcon, SmallMultipleIcon, SortIcon, TemplatesSettingsIcon, XAxisSettingsIcon, YAxisSettingsIcon } from "./settings-pages/SettingsIcons";
import chroma from "chroma-js";
import { RenderRaceChartDataLabel, RenderRaceTickerButton } from "./methods/RaceChart.methods";
import { RenderReferenceLines, GetReferenceLinesData } from './methods/ReferenceLines.methods';
import ErrorBarsSettings from "./settings-pages/ErrorBarsSettings";
import { RenderErrorBand, RenderErrorBars } from "./methods/ErrorBars.methods";
import { ErrorBarsMarkers } from "./error-bars-markers";
import { ApplyIBCSTheme } from "./methods/IBCS.methods";
import { GetFormattedNumber, extractDigitsFromString, getNumberDisplayUnit } from "./methods/NumberFormat.methods";
import DynamicDeviationSettings from "./settings-pages/DynamicDeviationSettings";
import { RemoveDynamicDeviation, RenderDynamicDeviation, SetDynamicDeviationDataAndDrawLines } from "./methods/DynamicDeviation.methods";
import { RenderConnectingLine } from "./methods/ConnectingLine.methods";
import CutAndClipAxisSettings from "./settings-pages/CutAndClipAxisSettings";
import { GetIsCutAndClipAxisEnabled, RenderBarCutAndClipMarker, RenderCutAndClipMarkerOnAxis } from "./methods/CutAndClipMarker.methods";
import { FormatAxisDate, GetAxisDomainMinMax } from "./methods/Axis.methods";
import { CallXScaleOnAxisGroup, GetPositiveNegativeLogXScale } from "./methods/XAxis.methods";
import { CallYScaleOnAxisGroup, GetPositiveNegativeLogYScale } from "./methods/YAxis.methods";
import { DrawSmallMultipleBarChart, GetSmallMultiplesDataPairsByItem } from "./methods/SmallMultiples.methods";
import { GetCutAndClipXScale, GetCutAndClipYScale, RenderLinearCutAxis } from "./methods/CutAndClip.methods";
import ShowCondition from "./settings-pages/ShowBucket";
import { COLORBREWER } from "./color-schemes";
import { DrawSmallMultiplesGridLayout, ESmallMultiplesAxisType, ESmallMultiplesXAxisPosition, ISmallMultiplesGridItemContent, ISmallMultiplesGridLayoutSettings } from "./SmallMultiplesGridLayout";
import SmallMultiplesSettings from "./SmallMultiplesGridLayout/smallMultiplesSettings";
import ImportExport from "./settings-pages/ImportExport";
import ConditionalFormatting from "./ConditionalFormatting/ConditionalFormatting";
import { ECFCategoriesType } from "@truviz/shadow/dist/Components/ConditionalFormatting/ConditionalFormatting.enum";
import { cloneDeep } from "lodash";

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
	public axisNumberFormatter: (value: number | string, numberSettings: NumberFormatting) => string;

	public interactivityService: interactivityBaseService.IInteractivityService<any>;
	public behavior: Behavior;
	public visualHost: IVisualHost;
	private downloadService: IDownloadService;

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
	public isChartRacePossible: boolean;
	public isChartIsRaceChart: boolean;
	public isHasSmallMultiplesData: boolean;

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
	public categoricalSmallMultiplesDataFields: powerbi.DataViewValueColumn[] = [];
	public categoricalExtraDataLabelsFields: powerbi.DataViewValueColumn[] = [];

	// data
	isChartInit: boolean = false;
	settingsPopupOptionsWidth: number;
	settingsPopupOptionsHeight: number;
	categoryDisplayName: string;
	subCategoryDisplayName: string;
	categoriesName: string[] = [];
	measureNames: string[] = [];
	sortExtraMeasureNames: string[] = [];
	upperBoundMeasureNames: string[] = [];
	lowerBoundMeasureNames: string[] = [];
	imagesDataFieldsName: string[] = [];
	subCategoriesName: string[] = [];
	measure1DisplayName: string;
	measure2DisplayName: string;
	isHasMultiMeasure: boolean;
	isPercentageMeasure: boolean;
	isHasSubcategories: boolean;
	isHasCategories: boolean;
	isHasImagesData: boolean;
	isSortDataFieldsAdded: boolean;
	sortFieldsDisplayName: ILabelValuePair[] = [];
	tooltipFieldsDisplayName: ILabelValuePair[] = [];
	blankText: string = "(Blank)";
	othersLabel = "Others";
	othersBarText = "";
	totalLollipopCount: number = 0;
	firstCFLine: IConditionalFormattingProps;
	firstCFLabel: IConditionalFormattingProps;
	conditionalFormattingConditions: IConditionalFormattingProps[] = [];
	categoriesColorList: { name: string, marker: string }[] = [];
	subCategoriesColorList: { name: string, marker: string }[] = [];
	categoryColorPairWithIndex: { [category: string]: { marker1Color: string, marker2Color: string, lineColor: string, labelColor: string } } = {};
	subCategoryColorPairWithIndex: { [subCategory: string]: { marker1Color: string, marker2Color: string, lineColor: string, labelColor: string } } = {};
	categoryColorPair: { [category: string]: { marker1Color: string, marker2Color: string, lineColor: string, labelColor: string } } = {};
	subCategoryColorPair: { [subCategory: string]: { marker1Color: string, marker2Color: string, lineColor: string, labelColor: string } } = {};
	isHasPositiveValue: boolean;
	CFCategoryColorPair: { [category: string]: { isMarker1Color: boolean, isMarker2Color: boolean, isLineColor: boolean, isLabelColor: boolean } } = {};
	CFSubCategoryColorPair: { [subCategory: string]: { isMarker1Color: boolean, isMarker2Color: boolean, isLineColor: boolean, isLabelColor: boolean } } = {};
	isHasNegativeValue: boolean;
	markerMaxSize: number = 0;
	minMaxValuesByMeasures: { [measure: string]: { min: number, max: number } } = {};
	measureNamesByTotal: { name: string, total: number }[] = [];
	groupNamesByTotal: { name: string, total: number }[] = [];
	schemeColors: string[] = [];
	isMonthCategoryNames: boolean;
	extraDataLabelsDisplayNames: string[] = [];
	isHasExtraDataLabels: boolean = false;
	isHasGlobalMinValue: boolean;

	// selection id
	selectionIdByCategories: { [category: string]: ISelectionId } = {};
	selectionIdBySubCategories: { [subcategory: string]: ISelectionId } = {};

	// number formatter
	public measureNumberFormatter: IValueFormatter[] = [];
	public tooltipNumberFormatter: IValueFormatter[] = [];
	public sortValuesNumberFormatter: IValueFormatter[] = [];
	public raceBarLabelsFormatter: IValueFormatter[] = [];
	public allNumberFormatter: { [name: string]: IValueFormatter } = {};
	public extraDataLabelsNumberFormatter: IValueFormatter[];
	public valueFormatter: valueFormatter.IValueFormatter = valueFormatter;

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
	public brushMargin: number = 0;
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
	public circleXScaleDiffs: number[] = [];
	public pieXScaleDiffs: number[] = [];
	public maxCircleXScaleDiff: number = 0;
	public maxPieXScaleDiff: number = 0;

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
	public yAxisTicksMaxWidthRatio: number = 0.3;
	public isYIsNumericAxis: boolean;
	public isYIsDateTimeAxis: boolean;
	public isYIsContinuousAxis: boolean;
	public circleYScaleDiffs: number[] = [];
	public pieYScaleDiffs: number[] = [];
	public maxCircleYScaleDiff: number = 0;
	public maxPieYScaleDiff: number = 0;

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
	public marker1OutlineWidth: number = 0;
	public marker2OutlineWidth: number = 0;

	// line
	public lineSelection: any;
	public lineG: any;
	public lineClass: string = "lollipop-line";
	public lineClassSelector: string = ".lollipop-line";

	// circle
	public circleClass: string = "lollipop-circle";
	public circleClassSelector: string = ".lollipop-circle";
	public minCircleSize: number = 10;
	public maxCircleSize: number = 30;
	public brushAndZoomAreaCircleMinSize: number = 10;
	public brushAndZoomAreaCircleMaxSize: number = 30;
	public brushAndZoomAreaCircleSize: number = 12;

	// circle1
	public circle1G: any;
	public circle1Selection: any;
	public circle1Size: any;
	public circle1Class: string = "lollipop-circle1";
	public circle1ClassSelector: string = ".lollipop-circle1";
	public isShowMarker1OutlineColor: boolean;

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
	public minPieSize: number = 15;
	public maxPieSize: number = 30;

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
	measuresPatterns: IPatternProps[] = [];
	subCategoryPatterns: IPatternProps[] = [];
	patternByMeasures: { [measureName: string]: IPatternProps } = {};

	// image marker
	isShowImageMarker1: boolean;
	isShowImageMarker2: boolean;
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
	raceChartDataLabelG: D3Selection<SVGElement>;
	raceChartContainerG: D3Selection<SVGElement>;
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
	isRenderBothErrorBars: boolean;

	// IBCS
	selectedIBCSTheme: EIBCSThemes;
	isIBCSEnabled: boolean = false;
	beforeIBCSSettings: { [settingsName: string]: { configName: EVisualConfig, settingName: EVisualSettings, configValues: any } };

	// Template
	beforeTemplateSettings: { [settingsName: string]: { configName: EVisualConfig, settingName: EVisualSettings, configValues: any } };

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
	axisDomainMaxValueDisplayUnit: DisplayUnits;
	positiveLogScaleTicks: number[] = [];
	negativeLogScaleTicks: number[] = [];

	// small multiples
	smallMultiplesGridContainer: D3Selection<HTMLElement>;
	smallMultiplesGridItemId: string;
	smallMultiplesCategoricalDataSourceName: string;
	smallMultiplesCategories: string[] = [];
	isSmallMultiplesEnabled: boolean = true;
	smallMultiplesDataPairs: any[] = [];
	smallMultiplesGridItemContent: { [index: string]: ISmallMultiplesGridItemContent } = {};
	currentSmallMultipleIndex: number = 0;
	isCurrentSmallMultipleIsOthers: boolean = false;
	isSMUniformXAxis: boolean;

	// settings
	isHorizontalChart: boolean = false;
	chartSettings: IChartSettings;
	markerSettings: IMarkerSettings;
	dataLabelsSettings: IDataLabelsSettings;
	data1LabelsSettings: IDataLabelsProps;
	data2LabelsSettings: IDataLabelsProps;
	xAxisSettings: IXAxisSettings;
	yAxisSettings: IYAxisSettings;
	lineSettings: ILineSettings;
	pieSettings: IPieSettings;
	legendSettings: ILegendSettings;
	numberSettings: NumberFormatting;
	xGridSettings: IGridLinesPropsSettings;
	yGridSettings: IGridLinesPropsSettings;
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
	dynamicDeviationSettings: IDynamicDeviationSettings;
	lastDynamicDeviationSettings: IDynamicDeviationSettings;
	cutAndClipAxisSettings: ICutAndClipAxisSettings;
	smallMultiplesSettings: ISmallMultiplesGridLayoutSettings;
	templateSettings: ITemplateSettings;

	public static landingPage: landingPageProp = {
		title: "Lollipop Chart",
		versionInfo: "1.0.0.0",
		description:
			"The Powerviz Lollipop chart is an advanced chart that is a bar chart where the bar is transformed into a line and a dot. This chart effectively illustrates the connection between numerical and categorical variables or depicts trends over time. This advanced lollipop chart includes vertical and horizontal styles, IBCS templates, small multiples, race charts, etc.​",
		sliderImages: [
			{
				imageUrl: require("../assets/landing-pages-2/page1.png"),
				imageTitle: "Fully customizable & feature rich Lollipop Chart",
				imageDescription: "Create an advanced modern-looking and insightful Lollipop Chart.",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page2.png"),
				imageTitle: "Chart Style",
				imageDescription: "Easily switch between Vertical and Horizontal chart style.",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page3.png"),
				imageTitle: "Small Multiples",
				imageDescription: "Split your visual into multiple smaller visuals based on the field selected.",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page4.png"),
				imageTitle: "Race Chart",
				imageDescription: "Visualize changes in trend over the time ",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page5.png"),
				imageTitle: "Dynamic Deviation",
				imageDescription: "Analyze the variance between two measures using this feature.",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page6.png"),
				imageTitle: "Reference Line/Band",
				imageDescription: "Add a Reference line or Band to highlight or compare the data against a range of data.",
			},
			{
				imageUrl: require("../assets/landing-pages-2/page7.png"),
				imageTitle: "And Many More Features",
				imageDescription: "Analyze and customize Lollipop chart with extra features available.",
			},
		],
		learnMoreLink: "https://powerviz.ai/lollipop-chart",
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
			valueRole: [EDataRolesName.Measure],
			measureRole: [EDataRolesName.Category, EDataRolesName.SubCategory, EDataRolesName.RaceChartData, EDataRolesName.ImagesData, EDataRolesName.Tooltip],
			CFConfig: {
				isSupportApplyOn: true, fieldsBasedOn: [ECFBasedOnValueTypes.Value, ECFBasedOnValueTypes.Ranking, ECFBasedOnValueTypes.Percentage],
				isShowBasedOnValueDropDown: true, applyOnCategories: [
					{ label: "Marker", value: ECFApplyOnCategories.Marker },
					{ label: "Line", value: ECFApplyOnCategories.Line },
					{ label: "Labels", value: ECFApplyOnCategories.Labels },
				],
				showPercentageAllOption: true,
				messageNoteBasedOnField: { fieldName: ECFBasedOnValueTypes.Percentage, note: "It computes the percentage of total and stay between 0 to 100." },
				isShowCategoriesTypeDropdown: true,
				isLollipopVisual: true,
				categoriesList: [
					{ label: "Category", value: ECFCategoriesType.Category },
					{ label: "Sub category", value: ECFCategoriesType.SubCategory },
				]
			},
			smallMultiplesConfig: {
				...SMALL_MULTIPLES_SETTINGS,
				showGridLayoutOnly: false,
				showXYAxisSettings: true,
			},
			categoricalGroupByRole: [EDataRolesName.SubCategory],
			isShowComponentsFilterSearchBox: true,
			components: [
				{
					name: "Chart Options",
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
					name: "Colors",
					sectionName: "dataColorsConfig",
					propertyName: "dataColorsSettings",
					Component: () => DataColorsSettings,
					icon: DataColorIcon
				},
				{
					name: "Small Multiples",
					sectionName: EVisualConfig.SmallMultiplesConfig,
					propertyName: EVisualSettings.SmallMultiplesSettings,
					Component: () => SmallMultiplesSettings,
					icon: SmallMultipleIcon
				},
				{
					name: "Axis",
					sectionName: EVisualConfig.XAxisConfig,
					propertyName: EVisualSettings.XAxisSettings,
					Component: () => AxisSettings,
					icon: XAxisSettingsIcon
				},
				{
					name: "Data Labels",
					sectionName: "dataLabelsConfig",
					propertyName: "dataLabelsSettings",
					Component: () => DataLabelsSettings,
					icon: DataLabelsIcon
				},
				{
					name: "Preview Slider",
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
					displayHeader: false
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
				// {
				// 	name: "Trend Lines",
				// 	sectionName: EVisualConfig.TrendLinesConfig,
				// 	propertyName: EVisualSettings.TrendLinesSettings,
				// 	Component: () => TrendLinesSettings,
				// },
				{
					name: "Cut/Clip Axis",
					sectionName: "cutAndClipAxisConfig",
					propertyName: "cutAndClipAxisSettings",
					Component: () => CutAndClipAxisSettings,
					icon: CutAndClipAxisIcon
				},
				// {
				// 	name: "Y Axis",
				// 	sectionName: EVisualConfig.YAxisConfig,
				// 	propertyName: EVisualSettings.YAxisSettings,
				// 	Component: () => YAxisSettings,
				// 	icon: YAxisSettingsIcon
				// },
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
					icon: ConditionalFormattingIcon,
					displayHeader: false
				},
				{
					name: "Grid Lines",
					sectionName: "gridLinesConfig",
					propertyName: "gridLinesSettings",
					Component: () => GridLinesSettings,
					icon: GridIcon
				},
				{
					name: "Import/Export",
					sectionName: "config",
					propertyName: "importExportTheme",
					Component: () => ImportExport,
					icon: ImportExportIcon
				},
				{
					name: Components.ShowCondition,
					sectionName: "showBucketConfig",
					propertyName: "showBucket",
					Component: () => ShowCondition,
					icon: ShowConditionIcon
				},
				{
					name: "Templates",
					sectionName: EVisualConfig.TemplatesConfig,
					propertyName: EVisualSettings.TemplatesSettings,
					Component: () => TemplatesSettings,
					icon: TemplatesSettingsIcon
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
		this.downloadService = options.host.downloadService;
		// this.initChart();
	}

	public getEnumeration(): EnumerateSectionType[] {
		return Enumeration.GET();
	}

	public initChart(): void {
		this.margin = { top: 10, right: 30, bottom: this.xAxisTitleMargin, left: this.yAxisTitleMargin };

		this.smallMultiplesGridContainer = d3.select(this.chartContainer).append("div").attr("id", "smallMultipleHostContainer");

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

		this.raceChartContainerG = this.svg.append("g").classed("raceChartContainerG", true);

		this.tickerButtonG = this.raceChartContainerG.append("g").classed("tickerButtonG", true);

		this.raceChartDataLabelG = this.raceChartContainerG.append("g").classed("raceChartDataLabelG", true);

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
		let othersStartIndex: number = 0;

		const clonedCategoricalDataPairs = cloneDeep(this.categoricalDataPairs);

		if (categoryRankingSettings.enabled) {
			if (categoryRankingSettings.rankingType === ERankingType.TopN) {
				if (this.isHorizontalChart) {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
						othersStartIndex = categoryRankingSettings.count;
						this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
					}
				} else {
					othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
					othersStartIndex = categoryRankingSettings.count;
					this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
				}
			}
			if (categoryRankingSettings.rankingType === ERankingType.BottomN) {
				if (this.isHorizontalChart) {
					othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
					othersStartIndex = 0;
					this.categoricalDataPairs = this.categoricalDataPairs.slice(
						this.categoricalDataPairs.length - categoryRankingSettings.count,
						this.categoricalDataPairs.length
					);
				} else {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
						othersStartIndex = 0;
						this.categoricalDataPairs = this.categoricalDataPairs.slice(
							this.categoricalDataPairs.length - categoryRankingSettings.count,
							this.categoricalDataPairs.length
						);
					}
				}
			}

			const keys = Object.keys(this.categoricalDataPairs[0]).slice(1);
			if (categoryRankingSettings.showRemainingAsOthers && othersBarData.length) {
				let othersLabel: string;

				switch (categoryRankingSettings.suffix) {
					case ERankingSuffix.None:
						othersLabel = this.othersLabel;
						break;
					case ERankingSuffix.OthersAndCategoryName:
						othersLabel = this.othersLabel + " " + this.categoryDisplayName;
						break;
					case ERankingSuffix.OthersAndCount:
						othersLabel = `${this.othersLabel} (${othersBarData.length})`;
						break;
					case ERankingSuffix.Both:
						othersLabel = `${this.othersLabel} ${this.categoryDisplayName} (${othersBarData.length})`;
						break;
				}

				this.othersBarText = othersLabel;

				const othersDataField: any = {
					category: this.othersBarText,
				};
				keys.forEach((key) => {
					othersDataField[key] = categoryRankingSettings.calcMethod === ERankingCalcMethod.Sum ? d3.sum(othersBarData, (d) => d[key]) : (d3.sum(othersBarData, (d) => d[key]) / othersBarData.length);
				});

				this.categoricalImagesDataFields.forEach(d => {
					const id = `${EDataRolesName.ImagesData}${d.source.index}`;
					othersDataField[id] = clonedCategoricalDataPairs[othersStartIndex][id];
				});

				this.categoricalExtraDataLabelsFields.forEach(d => {
					const id = `${EDataRolesName.ExtraDataLabels}${d.source.index}`;
					othersDataField[id] = clonedCategoricalDataPairs[othersStartIndex][id];
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
		externalFieldSortKey: EDataRolesName,
		categoricalMeasureFields: powerbi.DataViewValueColumn[],
		categoricalSortFields: powerbi.DataViewValueColumn[]
	): void {
		const sortingSettings: ISortingProps = this.sortingSettings.category;
		const isMeasure = sortingSettings.isSortByMeasure;
		const isSortByExternalFields = sortingSettings.isSortByExtraSortField;

		const getMonthIndex = (monthName: string) => {
			return MonthNames.indexOf(monthName);
		}

		const sortByName = () => {
			if (!this.isXIsDateTimeAxis && (this.isExpandAllApplied || !this.isXIsNumericAxis)) {
				if (this.isMonthCategoryNames) {
					// if (this.isHorizontalChart) {
					// 	if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
					// 		data.sort((a, b) => getMonthIndex(a.category) - getMonthIndex(b.category));
					// 	} else {
					// 		data.sort((a, b) => getMonthIndex(b.category) - getMonthIndex(a.category));
					// 	}
					// } else {
					if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
						data.sort((a, b) => getMonthIndex(a.category) - getMonthIndex(b.category));
					} else {
						data.sort((a, b) => getMonthIndex(b.category) - getMonthIndex(a.category));
					}
					// }
				} else {
					const keys = Object.keys(data[0]);
					if (this.isExpandAllApplied && (keys.includes("Year") || keys.includes("Quarter") || keys.includes("Month") || keys.includes("Day"))) {
						if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
							data.sort((a, b) => new Date(a["date"]).getTime() - new Date(b["date"]).getTime());
						} else {
							data.sort((a, b) => new Date(b["date"]).getTime() - new Date(a["date"]).getTime());
						}
					} else {
						// if (this.isHorizontalChart) {
						// 	if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
						// 		data.sort((a, b) => [categoryKey, ...this.expandAllCategoriesName].map(d => a[d].localeCompare(b[d])).reduce((a, b) => { return a && b }, 1));
						// 	} else {
						// 		data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
						// 		data.sort((a, b) => [categoryKey, ...this.expandAllCategoriesName].map(d => b[d].localeCompare(a[d])).reduce((a, b) => { return a && b }, 1));
						// 	}
						// } else {
						if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
							data.sort((a, b) => [categoryKey, ...this.expandAllCategoriesName].map(d => a[d].localeCompare(b[d])).reduce((a, b) => { return a && b }, 1));
						} else {
							data.sort((a, b) => [categoryKey, ...this.expandAllCategoriesName].map(d => b[d].localeCompare(a[d])).reduce((a, b) => { return a && b }, 1));
						}
						// }
					}
				}
			} else if (this.isXIsNumericAxis) {
				// if (this.isHorizontalChart) {
				// 	if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
				// 		data.sort((a, b) => a[categoryKey] - b[categoryKey]);
				// 	} else {
				// 		data.sort((a, b) => b[categoryKey] - a[categoryKey]);
				// 	}
				// } else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => a[categoryKey] - b[categoryKey]);
				} else {
					data.sort((a, b) => b[categoryKey] - a[categoryKey]);
				}
				// }
			} else if (this.isXIsDateTimeAxis) {
				// if (this.isHorizontalChart) {
				// 	if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
				// 		data.sort((a, b) => new Date(a[categoryKey]).getTime() - new Date(b[categoryKey]).getTime());
				// 	} else {
				// 		data.sort((a, b) => new Date(b[categoryKey]).getTime() - new Date(a[categoryKey]).getTime());
				// 	}
				// } else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => new Date(a[categoryKey]).getTime() - new Date(b[categoryKey]).getTime());
				} else {
					data.sort((a, b) => new Date(b[categoryKey]).getTime() - new Date(a[categoryKey]).getTime());
				}
				// }
			}
		};

		const sortByMeasure = (measureValues: powerbi.DataViewValueColumn[]) => {
			const index = measureValues.find((d) => d.source.displayName === sortingSettings.sortBy).source.index;
			const measureIndex = isSortByExternalFields ? `${externalFieldSortKey}${index}` : `${EDataRolesName.Measure}${index}`;

			// if (this.isHorizontalChart) {
			// if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
			// 	data.sort((a, b) => {
			// 		return a[measureIndex] - b[measureIndex];
			// 	});
			// } else {
			// 	data.sort((a, b) => {
			// 		return b[measureIndex] - a[measureIndex];
			// 	});
			// }
			// } else {
			if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
				data.sort((a, b) => {
					return a[measureIndex] - b[measureIndex];
				});
			} else {
				data.sort((a, b) => {
					return b[measureIndex] - a[measureIndex];
				});
			}
			// }
		};

		const sortByMultiMeasure = (measureKeys: string[]) => {
			const getValue = (d: any) =>
				measureKeys.reduce((value, key) => {
					value += d[key];
					return value;
				}, 0);

			// if (this.isHorizontalChart) {
			// 	if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
			// 		data.sort((a, b) => {
			// 			return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
			// 		});
			// 	} else {
			// 		data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
			// 	}
			// } else {
			if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
				data.sort((a, b) => {
					return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
				});
			} else {
				data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
			}
			// }
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
		const xPosition = this.xScale(this.xAxisSettings.isLogarithmScale && value === 0 ? 0.1 : value);

		if (this.isXIsDateTimeAxis && this.isXIsContinuousAxis) {
			return this.xScale(new Date(value));
		} else {
			if (xPosition > this.xScaleMaxRange) {
				return this.xScaleMaxRange;
			}

			if (xPosition < this.xScaleMinRange) {
				return this.xScaleMinRange;
			}
		}

		return xPosition;
	}

	getYPosition(value: number | string): number {
		const yPosition = this.yScale(this.yAxisSettings.isLogarithmScale && value === 0 ? 0.1 : value);

		if (this.isLogarithmScale) {
			if (this.isShowPositiveNegativeLogScale) {
				value = parseFloat(value.toString());
				return value >= 0 ? this.positiveLogScale(value === 0 ? 0.1 : value) : this.negativeLogScale(value * -1) + this.positiveLogScaleHeight
			}
		}

		if (this.isYIsDateTimeAxis && this.isYIsContinuousAxis) {
			return this.yScale(new Date(value));
		} else {
			if (yPosition > this.yScaleMaxRange) {
				return this.yScaleMaxRange;
			}

			if (yPosition < this.yScaleMinRange) {
				return this.yScaleMinRange;
			}
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
		const categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category])
			.filter((v, i, a) => a.findIndex((t) => t.source.index === v.source.index) === i);
		const categoricalRaceBarValues = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.RaceChartData])
			.filter((v, i, a) => a.findIndex((t) => t.source.index === v.source.index) === i);
		const categoricalSmallMultiplesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.SmallMultiples]);
		const categoricalSubCategoryField = categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		const categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		const categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		const categoricalImageDataFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ImagesData]);
		const categoricalUpperBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.UpperBound]);
		const categoricalLowerBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.LowerBound]);
		const categoricalExtraDataLabelsFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ExtraDataLabels]);

		this.isExpandAllApplied = categoricalCategoriesFields.length >= 2;
		this.isPercentageMeasure = (categoricalMeasureFields[0].source.type.integer || categoricalMeasureFields[0].source.type.numeric)
			&& categoricalMeasureFields[0].source.format && categoricalMeasureFields[0].source.format.includes("%");

		const categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.isHasSubcategories = !!categoricalSubCategoryField;
		this.isHasImagesData = categoricalImageDataFields.length > 0;
		this.measureNames = [...new Set(categoricalMeasureFields.map((d) => d.source.displayName))] as any;
		this.sortExtraMeasureNames = [...new Set(categoricalSortFields.map((d) => d.source.displayName))] as any;
		this.upperBoundMeasureNames = [...new Set(categoricalUpperBoundFields.map((d) => d.source.displayName))] as any;
		this.lowerBoundMeasureNames = [...new Set(categoricalLowerBoundFields.map((d) => d.source.displayName))] as any;
		this.extraDataLabelsDisplayNames = [...new Set(categoricalExtraDataLabelsFields.map((d) => d.source.displayName))] as any;
		this.isHasMultiMeasure = this.measureNames.length > 1;
		this.isHasErrorLowerBounds = categoricalLowerBoundFields.length > 0;
		this.isHasErrorUpperBounds = categoricalUpperBoundFields.length > 0;
		this.isShowErrorBars = this.errorBarsSettings.isEnabled;
		this.errorBarsSettings.isEnabled = this.errorBarsSettings.isEnabled && this.isShowErrorBars;
		this.isHasExtraDataLabels = categoricalExtraDataLabelsFields.length > 0;

		if ((this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.IMAGES && this.imagesDataFieldsName.length > 0 && this.isLollipopTypePie) ||
			(this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.isLollipopTypePie)) {
			this.markerSettings.marker1Style.markerShape = EMarkerShapeTypes.DEFAULT;
		}

		if ((this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.IMAGES && this.imagesDataFieldsName.length > 0 && this.isLollipopTypePie) ||
			(this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.isLollipopTypePie)) {
			this.markerSettings.marker2Style.markerShape = EMarkerShapeTypes.DEFAULT;
		}

		const dataColorsSettings = this.dataColorsSettings;

		if (this.lineSettings.isApplyMarkerColor && this.isLollipopTypePie) {
			if (this.isHasMultiMeasure || (!this.isHasMultiMeasure && dataColorsSettings.fillType !== ColorPaletteType.Single)) {
				this.lineSettings.isApplyMarkerColor = false;
			}
		}

		const firstVal = categoricalCategoriesFields[categoricalCategoriesLastIndex].values[0] ? categoricalCategoriesFields[categoricalCategoriesLastIndex].values[0] : categoricalCategoriesFields[categoricalCategoriesLastIndex].values[1] ? categoricalCategoriesFields[categoricalCategoriesLastIndex].values[1] : "";

		this.isMonthCategoryNames = categoricalCategoriesFields[categoricalCategoriesLastIndex].source.displayName.toLowerCase() === "months" || MonthNames.map(d => d.toLowerCase()).indexOf(<string>firstVal.toString().toLowerCase()) !== -1;

		this.isRenderBothErrorBars = this.isHasMultiMeasure && this.errorBarsSettings.measurement.applySettingsToMeasure === "Both";

		if (this.isExpandAllApplied) {
			const startCategories = categoricalCategoriesFields.slice(0, this.categoricalCategoriesLastIndex);
			const categoriesName = categoricalCategoriesFields[this.categoricalCategoriesLastIndex].values
				.map((d: string, i) => d + " " + startCategories.map(d => d.values[i]).join(" ")).filter(
					(v, i, a) => a.findIndex((t) => t === v) === i
				) as string[];

			categoricalData.categories[categoricalCategoriesLastIndex].values = categoriesName;
		}

		if (!this.isHasImagesData) {
			if (this.isHasSubcategories && this.markerSettings.markerType === EMarkerTypes.SHAPE && !this.markerSettings.isAutoLollipopTypePie) {
				this.visualHost.persistProperties({
					merge: [
						{
							objectName: EVisualConfig.MarkerConfig,
							displayName: EVisualSettings.MarkerSettings,
							properties: {
								[EVisualSettings.MarkerSettings]: JSON.stringify({
									...this.markerSettings,
									isAutoLollipopTypePie: true,
									markerType: EMarkerTypes.CHART
								}),
							},
							selector: null,
						},
					],
				});
			}

			if (!this.isHasSubcategories && this.markerSettings.isAutoLollipopTypePie) {
				this.visualHost.persistProperties({
					merge: [
						{
							objectName: EVisualConfig.MarkerConfig,
							displayName: EVisualSettings.MarkerSettings,
							properties: {
								[EVisualSettings.MarkerSettings]: JSON.stringify({
									...this.markerSettings,
									isAutoLollipopTypePie: false,
									markerType: EMarkerTypes.SHAPE
								}),
							},
							selector: null,
						},
					],
				});
			}
		}

		if (this.isHasImagesData && !this.markerSettings.isAutoLollipopTypeImage) {
			this.visualHost.persistProperties({
				merge: [
					{
						objectName: EVisualConfig.MarkerConfig,
						displayName: EVisualSettings.MarkerSettings,
						properties: {
							[EVisualSettings.MarkerSettings]: JSON.stringify({
								...this.markerSettings,
								isAutoLollipopTypeImage: true,
								markerType: EMarkerTypes.SHAPE,
								[EMarkerSettings.Marker1Style]: {
									...this.markerSettings.marker1Style,
									[EMarkerSettings.MarkerType]: EMarkerTypes.SHAPE,
									[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.IMAGES,
								},
								[EMarkerSettings.Marker2Style]: {
									...this.markerSettings.marker2Style,
									[EMarkerSettings.MarkerType]: EMarkerTypes.SHAPE,
									[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.IMAGES,
								}
							}),
						},
						selector: null,
					},
				],
			});
		}

		if (!this.isHasImagesData && this.markerSettings.isAutoLollipopTypeImage) {
			this.visualHost.persistProperties({
				merge: [
					{
						objectName: EVisualConfig.MarkerConfig,
						displayName: EVisualSettings.MarkerSettings,
						properties: {
							[EVisualSettings.MarkerSettings]: JSON.stringify({
								...this.markerSettings,
								isAutoLollipopTypeImage: false,
								markerType: EMarkerTypes.SHAPE,
								[EMarkerSettings.Marker1Style]: {
									...this.markerSettings.marker1Style,
									[EMarkerSettings.MarkerType]: EMarkerTypes.SHAPE,
									[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.DEFAULT,
								},
								[EMarkerSettings.Marker2Style]: {
									...this.markerSettings.marker2Style,
									[EMarkerSettings.MarkerType]: EMarkerTypes.SHAPE,
									[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.DEFAULT,
								}
							}),
						},
						selector: null,
					},
				],
			});
		}

		this.isXIsNumericAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.numeric;
		this.isYIsNumericAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.numeric;

		this.isXIsDateTimeAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.dateTime;
		this.isYIsDateTimeAxis = categoricalData.categories[this.categoricalCategoriesLastIndex].source.type.dateTime;

		this.isXIsContinuousAxis = !this.isHorizontalChart && (this.isXIsNumericAxis || this.isXIsDateTimeAxis) && this.xAxisSettings.categoryType === AxisCategoryType.Continuous;
		this.isYIsContinuousAxis = this.isHorizontalChart && (this.isYIsNumericAxis || this.isYIsDateTimeAxis) && this.yAxisSettings.categoryType === AxisCategoryType.Continuous;

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

		if (this.isHasMultiMeasure) {
			this.markerMaxSize = (this.isLollipopTypeCircle ? d3.max([this.circle1Size, this.circle2Size]) : d3.max([this.pie1Radius * 2, this.pie2Radius * 2]));
		} else {
			this.markerMaxSize = (this.isLollipopTypeCircle ? this.circle1Size : this.pie1Radius * 2);
		}

		this.isShowImageMarker1 = this.isLollipopTypeCircle && this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.IMAGES
			&& this.isHasImagesData && !!this.markerSettings.marker1Style.selectedImageDataField;

		this.isShowImageMarker2 = this.isLollipopTypeCircle && this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.IMAGES
			&& this.isHasImagesData && !!this.markerSettings.marker2Style.selectedImageDataField;

		if ((this.isHasMultiMeasure || this.isLollipopTypePie) && this.dataColorsSettings.fillType === ColorPaletteType.ByCategory) {
			this.dataColorsSettings.fillType = ColorPaletteType.Single;
		}

		if (this.isLollipopTypeCircle) {
			this.minScaleBandWidth = 35;
		} else {
			this.minScaleBandWidth = 50;
		}

		this.setNumberFormatters(categoricalMeasureFields, categoricalTooltipFields, categoricalSortFields, categoricalRaceBarValues);

		this.categoryDisplayName = categoricalData.categories[this.categoricalCategoriesLastIndex].source.displayName;
		this.subCategoryDisplayName = categoricalSubCategoryField ? categoricalSubCategoryField.displayName : "";

		const categoricalCategoriesValues = categoricalData.categories[this.categoricalCategoriesLastIndex];
		let categories = categoricalCategoriesValues.values.filter((item, i, ar) => ar.indexOf(item) === i);
		categories = categories.length > 0 ? categories : [];

		this.isSortDataFieldsAdded = categoricalSortFields.length > 0 || categoricalTooltipFields.length > 0;
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

		this.tooltipFieldsDisplayName =
			categoricalTooltipFields.length > 0
				? categoricalTooltipFields
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

		const errorBarValues = [this.measure1DisplayName];

		if (this.isHasMultiMeasure) {
			errorBarValues.push(this.measure2DisplayName, "Both");
		}

		if (!errorBarValues.includes(this.errorBarsSettings.measurement.applySettingsToMeasure)) {
			this.errorBarsSettings.measurement.applySettingsToMeasure = errorBarValues[0];
		}

		if (
			this.sortingSettings.category.isSortByExtraSortField &&
			![...this.sortFieldsDisplayName, ...this.tooltipFieldsDisplayName].find((d) => d.label === this.sortingSettings.category.sortBy)
		) {
			this.sortingSettings.category.sortBy = ESortByTypes.VALUE;
			this.sortingSettings.category.isSortByCategory = false;
			this.sortingSettings.category.isSortByMeasure = true;
			this.sortingSettings.category.isSortByMultiMeasure = false;
			this.sortingSettings.category.isSortByExtraSortField = false;
		}

		if (
			!this.sortingSettings.category.sortBy ||
			(!(this.measureNames as string[]).includes(this.sortingSettings.category.sortBy) && this.sortingSettings.category.isSortByMeasure && !this.sortingSettings.category.isSortByExtraSortField)
		) {
			this.sortingSettings.category.sortBy = this.measure1DisplayName;
		}

		if (!this.sortingSettings.subCategory.sortBy ||
			(![this.subCategoryDisplayName, this.measure1DisplayName, this.measure2DisplayName, ...this.sortFieldsDisplayName, ...this.tooltipFieldsDisplayName].includes(this.sortingSettings.subCategory.sortBy))) {
			this.sortingSettings.subCategory.sortBy = this.measure1DisplayName;
		}

		this.measureNamesByTotal = [];
		const measureGroup = d3.group(categoricalMeasureFields, d => d.source.displayName);
		[...new Set(measureGroup.keys())].forEach(d => {
			this.measureNamesByTotal.push({ name: d, total: d3.max(measureGroup.get(d), d => d3.sum(d.values, t => +t)) });
		});

		this.measureNamesByTotal = this.measureNamesByTotal.sort((a, b) => b.total - a.total);

		if (this.isLollipopTypePie) {
			this.groupNamesByTotal = [];
			const subCategoriesGroup = d3.group(categoricalMeasureFields.filter(d => d.source.displayName === (this.dataColorsSettings.gradientAppliedToMeasure === EMarkerColorTypes.Marker1 ? this.measure1DisplayName : this.measure2DisplayName)), d => d.source.groupName ? d.source.groupName.toString() : d.source.groupName);
			[...new Set(subCategoriesGroup.keys())].forEach(d => {
				this.groupNamesByTotal.push({ name: d ? d.toString() : undefined, total: d3.max(subCategoriesGroup.get(d ? d.toString() : d), m => d3.sum(m.values, t => +t)) });
			});

			this.groupNamesByTotal.sort((a, b) => b.total - a.total);
		} else {
			this.groupNamesByTotal = [];
		}

		this.setCategoricalDataBySubcategoryRanking(categoricalData);

		const getRaceBarKey = (index) => {
			return categoricalRaceBarValues.reduce((str, cur) => {
				str = str + "-" + cur.values[index]
				return str;
			}, '');
		}

		this.isChartRacePossible = categoricalRaceBarValues.length > 0;

		if (this.isChartRacePossible && categoricalRaceBarValues.map(d => d.source.displayName).includes(categoricalCategoriesFields[categoricalCategoriesLastIndex].source.displayName)) {
			this.isChartRacePossible = false;
		}

		const createDate = (day: number, monthName: string, quarter: number, year: number) => {
			let finalMonthName = monthName;

			if (!finalMonthName) {
				if (quarter) {
					switch (quarter) {
						case 1:
							finalMonthName = "January";
							break;
						case 2:
							finalMonthName = "April";
							break;
						case 3:
							finalMonthName = "July";
							break;
						case 4:
							finalMonthName = "October";
							break;
					}
				} else {
					finalMonthName = "January";
				}
			}

			const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(finalMonthName);
			if (month === -1) {
				throw new Error(`Invalid month name: ${finalMonthName}`);
			}
			try {
				return new Date(year, month, day);
			} catch (error) {
				throw new Error(`Invalid date: ${day} ${finalMonthName} (${quarter}) ${year}`);
			}
		}

		if (this.isChartRacePossible && this.raceChartSettings.isEnabled) {
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
			const isRacePossible = raceBarKeys.some(d => raceBarValueGroup.get(d).length > 0);
			this.isChartIsRaceChart = isRacePossible && this.raceChartSettings.isEnabled;

			if (categoricalRaceBarValues.map(d => d.source.displayName).includes(categoricalCategoriesFields[categoricalCategoriesLastIndex].source.displayName)) {
				this.isChartIsRaceChart = false;
			}

			if (this.isChartIsRaceChart) {
				const categoricalDataPairsGroup = d3.group(categoricalDataPairsForGrouping, (d: any) => d.category);
				this.categoricalDataPairs = categories.map((category) =>
					Object.assign({}, ...(this.rankingSettings.raceChartData.enabled ? categoricalDataPairsGroup.get(category).slice(0, this.rankingSettings.raceChartData.count) : categoricalDataPairsGroup.get(category)))
				);
			}
		} else {
			this.categoricalDataPairs = categoricalData.categories[categoricalCategoriesLastIndex].values.reduce((arr, category: string, index: number) => {
				const obj = {
					category: category !== null && category !== undefined && category !== "" ? category : this.blankText,
					hasNegative: false,
					hasZero: false,
				};

				if (this.isHorizontalChart) {
					if (this.isYIsDateTimeAxis) {
						obj.category = obj.category.toString();
					}
				} else {
					if (this.isXIsDateTimeAxis) {
						obj.category = obj.category.toString();
					}
				}

				if (categoricalSmallMultiplesFields.length) {
					categoricalSmallMultiplesFields.forEach(d => {
						obj[`smallMultipleCategory-${d.source.index}`] = d.values[index];
					});
				}

				obj[this.categoryDisplayName] = category;

				this.expandAllCategoriesName.forEach((d, i) => {
					obj[d] = categoricalData.categories[i].values[index];
				});

				const keys = Object.keys(obj);
				if (this.isExpandAllApplied && (keys.includes("Year") || keys.includes("Quarter") || keys.includes("Month") || keys.includes("Day"))) {
					const day = obj["Day"] ? parseInt(obj["Day"].toString().split("--")[0]) : 1;
					const month = obj["Month"] ? obj["Month"].split("--")[0] : "January";
					const quarter = obj["Quarter"] ? parseInt(obj["Quarter"].split("--")[0].split("Qtr")[1]) : 1;
					const year = obj["Year"] ? obj["Year"].split("--")[0] : 2024;

					obj["date"] = createDate(day ? day : 1, month, quarter ? quarter : 1, year ? year : 2024);
				}

				categoricalData.values.forEach((d) => {
					const roles = Object.keys(d.source.roles);
					roles.forEach((role) => {
						if (Object.keys(d.source).includes("groupName")) {
							if (d.values[index] === null || d.values[index] === undefined) {
								d.values[index] = 0;
							}

							// if (role === EDataRolesName.Measure && +d.values[index] < 0) {
							// 	d.values[index] = 0;
							// }

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
		// this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !measureKeys.every((m) => d[m] === 0));

		this.defaultSortCategoryDataPairs(this.categoricalDataPairs, measureKeys, categoricalMeasureFields);

		this.setCategoricalDataPairsByRanking();

		if (this.sortingSettings.category.enabled) {
			const sortFields = categoricalSortFields.filter((d) => d.source.displayName === this.sortingSettings.category.sortBy);
			const sortByTooltipFields = categoricalTooltipFields.filter((d) => d.source.displayName === this.sortingSettings.category.sortBy);
			const isSortByTooltipField = sortFields.length === 0 && sortByTooltipFields.length > 0;
			const externalFieldSortKey = isSortByTooltipField ? EDataRolesName.Tooltip : EDataRolesName.Sort;

			if (!this.isHasSubcategories) {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index);
				const sortKeys = isSortByTooltipField ? sortByTooltipFields.map((d) => EDataRolesName.Tooltip + d.source.index) : sortFields.map((d) => EDataRolesName.Sort + d.source.index);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, externalFieldSortKey, categoricalMeasureFields, isSortByTooltipField ? categoricalTooltipFields : categoricalSortFields);
			} else {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index + d.source.groupName);
				const sortKeys = isSortByTooltipField ? sortByTooltipFields.map((d) => EDataRolesName.Tooltip + d.source.index + d.source.groupName) : sortFields.map((d) => EDataRolesName.Sort + d.source.index + d.source.groupName);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, externalFieldSortKey, categoricalMeasureFields, isSortByTooltipField ? categoricalTooltipFields : categoricalSortFields);
			}
		}

		this.categoricalDataPairs = this.elementToMoveOthers(this.categoricalDataPairs, true, "category");

		const clonedCategoricalPair = cloneDeep(this.categoricalDataPairs);
		if (this.isHorizontalChart) {
			this.categoricalDataPairs = clonedCategoricalPair.reverse();
		}

		this.categoryColorPairWithIndex = {};
		this.subCategoryColorPairWithIndex = {};

		const categoricalValues = categoricalData.values as any;
		const measures: any[] = categoricalValues.filter((d) => d.source.roles[EDataRolesName.Measure]);

		this.subCategoriesName = measures
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];

		// set colors for all pairs
		this.categoricalDataPairs.forEach((data, i) => {
			this.categoryColorPairWithIndex[`${i}-${data.category}`] = { marker1Color: undefined, marker2Color: undefined, lineColor: undefined, labelColor: undefined };
		});

		this.categoricalDataPairs.forEach(d => {
			this.subCategoriesName.forEach((name, i) => {
				this.subCategoryColorPairWithIndex[`${i}-${d.category}-${name}`] = { marker1Color: undefined, marker2Color: undefined, lineColor: undefined, labelColor: undefined };
			});
		});

		this.setColorsByDataColorsSettings();

		const clonedCategoricalRaceBarValues = clonedCategoricalData.categories.filter(
			(value) => value.source.roles[EDataRolesName.RaceChartData]
		);

		if (this.isChartIsRaceChart) {
			let iterator: number = 0;
			const categoricalCategories: { categories: string[] }[] = [];
			const categoricalValues: { values: number[], highlights: number[] }[] = [];

			this.categoricalDataPairs.forEach((dataPair) => {
				const keys = Object.keys(dataPair).splice(1);
				keys.forEach((key) => {
					const index = +key.toString().split("-")[1];
					// categoricalData.categories[this.categoricalCategoriesLastIndex].values[iterator] = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values[index];
					// categoricalCategories.push(clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values[index]);

					// if (categoricalSmallMultiplesFields.length) {
					// 	categoricalData.categories[this.categoricalCategoriesLastIndex].values[iterator] = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values[index];
					// }

					const categories = []

					categoricalData.categories.forEach((categoricalValue, i: number) => {
						categories.push(clonedCategoricalData.categories[i].values[index]);
					});

					categoricalCategories.push({ categories });

					categoricalRaceBarValues.forEach((categoricalRaceBarValue, i: number) => {
						categoricalRaceBarValue.values[iterator] = clonedCategoricalRaceBarValues[i].values[index];
					});

					const values = [];
					const highlights = [];

					categoricalData.values.forEach((categoricalValue, i: number) => {
						values.push(clonedCategoricalData.values[i].values[index]);
						// categoricalValue.values[iterator] = clonedCategoricalData.values[i].values[index];

						if (categoricalValue.highlights) {
							highlights.push(clonedCategoricalData.values[i].highlights[index]);
							// categoricalValue.highlights[iterator] = clonedCategoricalData.values[i].highlights[index];
						}
					});

					categoricalValues.push({ values, highlights });

					iterator++;
				});
			});

			categoricalData.categories.forEach((categoricalValue, i: number) => {
				categoricalValue.values = categoricalCategories.map(d => d.categories[i]);
			});

			categoricalData.values.forEach((categoricalValue, i: number) => {
				categoricalValue.values = categoricalValues.map(d => d.values[i]);

				if (categoricalValue.highlights) {
					categoricalValue.highlights = categoricalValues.map(d => d.highlights[i]);
				}
			});
		} else {
			categoricalData.categories.forEach((d, i) => {
				if (d.source.roles[EDataRolesName.Category]) {
					if (i === this.categoricalCategoriesLastIndex) {
						d.values = this.categoricalDataPairs.map((pair) => pair.category);
					} else {
						d.values = this.categoricalDataPairs.map((pair) => pair[d.source.displayName]);
					}
				}

				if (d.source.roles[EDataRolesName.SmallMultiples]) {
					d.values = this.categoricalDataPairs.map((pair) => pair[`smallMultipleCategory-${d.source.index}`]);
				}
			});

			categoricalData.values.forEach((d) => {
				if (Object.keys(d.source).includes("groupName")) {
					if (d.source.groupName !== null && d.source.groupName !== undefined && d.source.groupName !== "" && d.source.groupName !== this.blankText) {
						d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}`]);
						d.highlights = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}Highlight`]);
					} else {
						d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${this.blankText}`]);
						d.highlights = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${this.blankText}Highlight`]);
					}
				} else {
					d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}`]);
					d.highlights = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}Highlight`]);
				}
			});
		}

		// if (this.isExpandAllApplied) {
		// 	clonedCategoricalData.categories
		// 		.filter((d) => !!d.source.roles[EDataRolesName.Category])
		// 		.forEach((d) => {
		// 			if (!d["isIdToCategoryAdded"]) {
		// 				d.values = d.values.map((d: string, i: number) => {
		// 					if (d.toString().split("--").length === 2) {
		// 						return d;
		// 					} else {
		// 						return d + "-" + i.toString();
		// 					}
		// 				});
		// 				d["isIdToCategoryAdded"] = true;
		// 			}
		// 		});

		// 	categoricalData.categories
		// 		.filter((d) => !!d.source.roles[EDataRolesName.Category])
		// 		.forEach((d) => {
		// 			// if (!d["isIdToCategoryAdded"]) {
		// 			d.values = d.values.map((d: string, i: number) => {
		// 				if (d.toString().split("--").length === 2) {
		// 					return d;
		// 				} else {
		// 					return d + "--" + i.toString();
		// 				}
		// 			});
		// 			d["isIdToCategoryAdded"] = true;
		// 			// }
		// 		});
		// }

		const categoricalDataValues = this.categoricalData.values.filter(d => d.source.roles[EDataRolesName.Measure]);

		const min = d3.min(categoricalDataValues, d => d3.min(d.values, v => <number>v));
		const max = d3.max(categoricalDataValues, d => d3.max(d.values, v => <number>v));

		if (!this.dataColorsSettings.isFillTypeChanged && min < 0 && max > 0 && !this.isIBCSEnabled) {
			this.dataColorsSettings.fillType = ColorPaletteType.PositiveNegative;
		}

		const dataLength = categoricalData.categories[this.categoricalCategoriesLastIndex].values.length;

		this.setBrushScaleBandDomain(categoricalData);
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

		this.totalLollipopCount = [...new Set(categoricalData.categories[this.categoricalCategoriesLastIndex].values)].length;

		this.xScale = this.brushScaleBand;

		// const minIndex = d3.minIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));
		// const maxIndex = d3.maxIndex(this.categoricalDataPairs, (d) => d3.sum(Object.keys(d), (key) => (key.includes("measure") ? d[key] : 0)));

		this.firstCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[0],
			value: this.isHasSubcategories ? d3.sum(categoricalData.values, d => <number>d.values[0]) : <number>categoricalData.values[0].values[0],
		};

		this.lastCategoryValueDataPair = {
			category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[dataLength - 1],
			value: this.isHasSubcategories ? d3.sum(categoricalData.values, d => <number>d.values[dataLength - 1]) : <number>categoricalData.values[0].values[dataLength - 1],
		};

		if (this.brushAndZoomAreaSettings.enabled) {
			if (this.categoricalDataPairs.length < this.brushAndZoomAreaSettings.minLollipopCount) {
				this.brushAndZoomAreaSettings.enabled = false;
			}
		}

		const expectedWidth = (this.brushScaleBandBandwidth * width) / this.brushScaleBand.bandwidth();
		const expectedHeight = (this.brushScaleBandBandwidth * height) / this.brushScaleBand.bandwidth();

		if ((!this.isHorizontalChart && !this.isXIsContinuousAxis) || (this.isHorizontalChart && !this.isYIsContinuousAxis)) {
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
						smallMultiplesGridItemId: this.smallMultiplesGridItemId,
						categoricalData: categoricalData,
						isShowXAxis: true,
						isShowYAxis: true,
						isShowHorizontalBrush: true
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
						isShowXAxis: true,
						isShowYAxis: true,
						isShowHorizontalBrush: true
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
				const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
				const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
					this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
				);

				const categoricalData2 = cloneDeep(categoricalData);

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
		}

		return categoricalData;
	}

	public setCategoricalDataFields(categoricalData: powerbi.DataViewCategorical): void {
		this.categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category])
			.filter((v, i, a) => a.findIndex((t) => t.source.index === v.source.index) === i);
		this.categoricalRaceChartDataFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.RaceChartData])
			.filter((v, i, a) => a.findIndex((t) => t.source.index === v.source.index) === i);
		this.categoricalSmallMultiplesDataFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.SmallMultiples]);
		this.categoricalSubCategoryField = this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		this.categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		this.categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		this.categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		this.categoricalImagesDataFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ImagesData]);
		this.categoricalUpperBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.UpperBound]);
		this.categoricalLowerBoundFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.LowerBound]);
		this.categoricalExtraDataLabelsFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.ExtraDataLabels]);

		categoricalData.categories.forEach(d => {
			this.allNumberFormatter[d.source.displayName] = { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }), role: undefined };
		});

		categoricalData.values.forEach(d => {
			this.allNumberFormatter[d.source.displayName] = { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }), role: undefined };
		});

		this.categoricalCategoriesLastIndex = this.categoricalCategoriesFields.length - 1;
		this.isHasSubcategories = !!this.categoricalSubCategoryField;
		this.isHasImagesData = !!this.categoricalImagesDataFields;
		this.measureNames = [...new Set(this.categoricalMeasureFields.map((d) => d.source.displayName))] as any;
		this.sortExtraMeasureNames = [...new Set(this.categoricalSortFields.map((d) => d.source.displayName))] as any;
		this.extraDataLabelsDisplayNames = [...new Set(this.categoricalExtraDataLabelsFields.map((d) => d.source.displayName))] as any;
		this.isHasMultiMeasure = this.measureNames.length > 1;
		this.isHasExtraDataLabels = this.categoricalExtraDataLabelsFields.length > 0;

		this.isPatternApplied =
			this.patternSettings.enabled && this.patternSettings.categoryPatterns.some(d => d.patternIdentifier !== "NONE" && d.patternIdentifier !== "") ||
			this.isHasSubcategories && this.patternSettings.enabled && this.patternSettings.subCategoryPatterns.some(d => d.patternIdentifier !== "NONE" && d.patternIdentifier !== "") ||
			this.isHasMultiMeasure && this.patternSettings.enabled && this.patternSettings.measuresPatterns.some(d => d.patternIdentifier !== "NONE" && d.patternIdentifier !== "");

		if (this.data1LabelsSettings.displayType === EDataLabelsDisplayTypes.CustomLabel && this.isHasExtraDataLabels && (!this.data1LabelsSettings.customLabel ||
			(!this.extraDataLabelsDisplayNames.includes(this.data1LabelsSettings.customLabel)))) {
			this.data1LabelsSettings.customLabel = this.extraDataLabelsDisplayNames[0];
		}

		if (this.data1LabelsSettings.displayType === EDataLabelsDisplayTypes.CustomLabel && !this.isHasExtraDataLabels) {
			this.data1LabelsSettings.displayType = EDataLabelsDisplayTypes.All;
		}

		if (this.data2LabelsSettings.displayType === EDataLabelsDisplayTypes.CustomLabel && this.isHasExtraDataLabels && (!this.data2LabelsSettings.customLabel ||
			(!this.extraDataLabelsDisplayNames.includes(this.data2LabelsSettings.customLabel)))) {
			this.data2LabelsSettings.customLabel = this.extraDataLabelsDisplayNames[0];
		}

		if (this.data2LabelsSettings.displayType === EDataLabelsDisplayTypes.CustomLabel && !this.isHasExtraDataLabels) {
			this.data2LabelsSettings.displayType = EDataLabelsDisplayTypes.All;
		}

		if (this.isPatternApplied && this.data1LabelsSettings.placement === DataLabelsPlacement.Inside && !this.data1LabelsSettings.isTextColorTypeChanged) {
			this.data1LabelsSettings.textColorTypes = EInsideTextColorTypes.CONTRAST;
		}

		if (this.isPatternApplied && this.data2LabelsSettings.placement === DataLabelsPlacement.Inside && !this.data2LabelsSettings.isTextColorTypeChanged) {
			this.data2LabelsSettings.textColorTypes = EInsideTextColorTypes.CONTRAST;
		}

		if (this.markerSettings.markerType === EMarkerTypes.CHART && !this.isHasSubcategories) {
			this.markerSettings.markerType = EMarkerTypes.SHAPE;
		}

		if (this.isLollipopTypeCircle) {
			this.minScaleBandWidth = 40;
		} else {
			this.minScaleBandWidth = 60;
		}

		this.setNumberFormatters(this.categoricalMeasureFields, this.categoricalTooltipFields, this.categoricalSortFields, this.categoricalRaceChartDataFields);

		this.categoryDisplayName = this.categoricalData.categories[this.categoricalCategoriesLastIndex].source.displayName;
		this.subCategoryDisplayName = this.categoricalSubCategoryField ? this.categoricalSubCategoryField.displayName : "";

		this.subCategoriesName = this.categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];

		this.isSortDataFieldsAdded = this.categoricalSortFields.length > 0 || this.categoricalTooltipFields.length > 0;
		this.sortFieldsDisplayName =
			this.categoricalSortFields.length > 0
				? this.categoricalSortFields
					.map((d) => ({
						label: d.source.displayName,
						value: d.source.displayName,
						isSortByCategory: d.source.type.text,
						isSortByMeasure: d.source.type.numeric,
						isSortByExtraSortField: true,
					}))
					.filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i)
				: [];

		this.tooltipFieldsDisplayName =
			this.categoricalTooltipFields.length > 0
				? this.categoricalTooltipFields
					.map((d) => ({
						label: d.source.displayName,
						value: d.source.displayName,
						isSortByCategory: d.source.type.text,
						isSortByMeasure: d.source.type.numeric,
						isSortByExtraSortField: true,
					}))
					.filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i)
				: [];

		this.measure1DisplayName = this.categoricalMeasureFields.length > 0 ? this.categoricalMeasureFields[0].source.displayName : "";
		this.measure2DisplayName = this.categoricalMeasureFields.length > 1 ? this.categoricalMeasureFields[1].source.displayName : "";

		if (
			this.sortingSettings.category.isSortByExtraSortField &&
			![...this.sortFieldsDisplayName, ...this.tooltipFieldsDisplayName].find((d) => d.label === this.sortingSettings.category.sortBy)
		) {
			this.sortingSettings.category.sortBy = ESortByTypes.VALUE;
			this.sortingSettings.category.isSortByCategory = false;
			this.sortingSettings.category.isSortByMeasure = true;
			this.sortingSettings.category.isSortByMultiMeasure = false;
			this.sortingSettings.category.isSortByExtraSortField = false;
		}

		if (
			!this.sortingSettings.category.sortBy ||
			(!(this.measureNames as string[]).includes(this.sortingSettings.category.sortBy) && this.sortingSettings.category.isSortByMeasure && !this.sortingSettings.category.isSortByExtraSortField)
		) {
			this.sortingSettings.category.sortBy = this.measure1DisplayName;
		}

		if (!this.sortingSettings.subCategory.sortBy) {
			this.sortingSettings.subCategory.sortBy = this.subCategoryDisplayName;
		}

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
		this.isHasSmallMultiplesData = this.categoricalSmallMultiplesDataFields.length > 0;
		this.isSmallMultiplesEnabled = this.isHasSmallMultiplesData;
		this.isHasMultiMeasure = this.measureNames.length > 1;
		this.categoricalReferenceLinesNames = [...new Set(this.categoricalReferenceLinesDataFields.map((d) => d.source.displayName))];

		if (this.isHasImagesData) {
			this.imagesDataFieldsName = [...new Set(this.categoricalImagesDataFields.map(d => d.source.displayName))];
		}

		if (this.isSmallMultiplesEnabled) {
			this.brushAndZoomAreaSettings.enabled = false;
		}

		// if (this.isHasSmallMultiplesData) {
		// 	this.smallMultiplesCategories = [...new Set(this.categoricalSmallMultiplesDataField.values)] as string[];
		// }

		if (this.isChartIsRaceChart) {
			this.raceChartKeyLabelList =
				this.categoricalRaceChartDataFields[0].values.reduce((arr, cur, index) => {
					const values = this.categoricalRaceChartDataFields.map((r) => r.values[index]);
					const key = values.join("--");
					const label = values.join(" ");
					arr = [...arr, { key, label }];
					return arr;
				}, []).filter((item, i, ar) => ar.findIndex((f) => f.key === item.key) === i);

			if (this.rankingSettings.raceChartData.enabled) {
				this.raceChartKeyLabelList = this.raceChartKeyLabelList.slice(0, this.rankingSettings.raceChartData.count);
			}
		}

		if (this.isHasImagesData && (!this.markerSettings.marker1Style.selectedImageDataField || !this.imagesDataFieldsName.includes(this.markerSettings.marker1Style.selectedImageDataField))) {
			this.markerSettings.marker1Style.selectedImageDataField = this.imagesDataFieldsName[0];
		}

		if (this.isHasImagesData && (!this.markerSettings.marker2Style.selectedImageDataField || !this.imagesDataFieldsName.includes(this.markerSettings.marker2Style.selectedImageDataField))) {
			this.markerSettings.marker2Style.selectedImageDataField = this.imagesDataFieldsName[0];
		}

		if (!this.isHasImagesData && this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.IMAGES) {
			this.markerSettings.marker1Style.markerShape = EMarkerShapeTypes.DEFAULT;
		}

		if (!this.isHasImagesData && this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.IMAGES) {
			this.markerSettings.marker2Style.markerShape = EMarkerShapeTypes.DEFAULT;
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
				const expandAllYScaleGWidth = this.viewPortWidth * this.yAxisTicksMaxWidthRatio;

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

		if (vizOptions.options.type === 4) {
			return;
		}

		try {
			if (this.vizOptions.options.dataViews[0].categorical && this.vizOptions.options.dataViews[0].categorical.values) {
				this.vizOptions.options.dataViews[0].categorical.values.forEach(d => {
					if (Object.keys(d.source).includes("groupName")) {
						if (!d.source.groupName) {
							d.source.groupName = this.blankText;
						}
					}
				})
			}

			this.originalCategoricalData = this.vizOptions.options.dataViews[0].categorical as any;
			this.clonedCategoricalData = cloneDeep(this.vizOptions.options.dataViews[0].categorical);
			this.categoricalData = this.vizOptions.options.dataViews[0].categorical as any;
			this.categoricalMetadata = this.vizOptions.options.dataViews[0].metadata;
			this.isInFocusMode = vizOptions.options.isInFocus;
			this.isValidShowBucket = true;
			this.brushWidth = 0;
			this.brushMargin = 0;
			this.brushHeight = 0;
			this.isChartIsRaceChart = false;
			this.isChartRacePossible = false;
			this.categoricalCategoriesLastIndex = 0;
			this.expandAllXScaleGHeight = 0;
			this.expandAllYScaleGWidth = 0;
			this.circleXScaleDiffs = [];
			this.circleYScaleDiffs = [];
			this.pieYScaleDiffs = [];
			this.pieYScaleDiffs = [];
			this.smallMultiplesGridItemContent = {};
			this.smallMultiplesGridItemId = undefined;
			this.isRaceChartDataLabelDrawn = false;

			this.maxCircleXScaleDiff = 0;
			this.maxCircleYScaleDiff = 0;
			this.maxPieXScaleDiff = 0;
			this.maxPieYScaleDiff = 0;

			this.viewPortWidth = cloneDeep(this.vizOptions.options.viewport.width) - 10;
			this.viewPortHeight = cloneDeep(this.vizOptions.options.viewport.height);

			const isReturn = this.renderErrorMessages();

			if (isReturn) {
				this.isChartInit = false;
				return;
			} else {
				d3.select(this.chartContainer).select(".validation-page-container").remove();
			}

			this.handleShowBucket();

			const categoricalSmallMultiplesField = this.categoricalData.categories.find((d) => !!d.source.roles[EDataRolesName.SmallMultiples]);
			const categoricalSubCategoryField = this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
			this.isHasSubcategories = !!categoricalSubCategoryField;

			if (!this.isChartInit) {
				this.initChart();
			}

			if (this.isSmallMultiplesEnabled && !categoricalSmallMultiplesField) {
				d3.select(this.chartContainer).selectAll("*").remove();
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

			this.formatNumber = (value, numberSettings, numberFormatter, isUseSematicFormat, isMinThousandsLimit) => GetFormattedNumber(this, value, numberSettings, numberFormatter, isUseSematicFormat, isMinThousandsLimit);
			this.axisNumberFormatter = (value, numberSettings) => GetFormattedNumber(this, value, numberSettings, undefined, false, true);

			this.conditionalFormattingConditions = parseConditionalFormatting(vizOptions.formatTab).reverse();

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

			const selectedIBCSTheme = this.templateSettings.theme;
			const isIBCSEnabled = this.templateSettings.isIBCSEnabled;

			if (this.templateSettings.theme && (!this.templateSettings.isIBCSEnabled || (this.templateSettings.prevTheme !== this.templateSettings.theme)) && ((this.templateSettings.prevTheme !== this.templateSettings.theme) || (!this.isIBCSEnabled && isIBCSEnabled))) {
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

			const clonedCategoricalData = cloneDeep(this.vizOptions.options.dataViews[0].categorical);
			const categoricalCategoriesFields = clonedCategoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category])
				.filter((v, i, a) => a.findIndex((t) => t.source.index === v.source.index) === i);
			this.isExpandAllApplied = categoricalCategoriesFields.length >= 2;

			if (this.isExpandAllApplied) {
				clonedCategoricalData.categories
					.filter((d) => !!d.source.roles[EDataRolesName.Category])
					.forEach((d) => {
						if (!d["isIdToCategoryAdded"]) {
							d.values = d.values.map((d: string, i: number) => {
								if (d.toString().split("--").length === 2) {
									return d;
								} else {
									return d + "--" + i.toString();
								}
							});
							d["isIdToCategoryAdded"] = true;
						}
					});

				this.expandAllCategoriesName = categoricalCategoriesFields
					.map((d) => d.source.displayName)
					.slice(0, categoricalCategoriesFields.length - 1)
				// .reverse();
			}

			this.expandAllCode();

			const { height: footerHeight } = this.createFooter(this.footerSettings, this.chartContainer);
			this.footerHeight = this.footerSettings.show ? footerHeight : 0;

			this.container.style("width", "100%");
			this.container.style("height", `calc(100% - ${this.footerHeight}px)`);

			// const isHasSubcategories = !!this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);

			// if (!isHasSubcategories) {
			// 	this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i) => {
			// 		const selectionId = this.vizOptions.host
			// 			.createSelectionIdBuilder()
			// 			.withCategory(this.categoricalData.categories[this.categoricalCategoriesLastIndex] as any, i)
			// 			.createSelectionId();
			// 		this.selectionIdByCategories[category] = selectionId;
			// 	});
			// } else {
			// 	const categoricalData = this.vizOptions.options.dataViews[0];
			// 	const series: any[] = categoricalData.categorical.values.grouped();
			// 	this.categoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i: number) => {
			// 		const selectionId = this.vizOptions.host
			// 			.createSelectionIdBuilder()
			// 			.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
			// 			.createSelectionId();

			// 		this.selectionIdByCategories[category] = selectionId;

			// 		series.forEach((ser: any) => {
			// 			ser.values.forEach((s) => {
			// 				const seriesSelectionId = this.vizOptions.host
			// 					.createSelectionIdBuilder()
			// 					.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
			// 					.withSeries(categoricalData.categorical.values, ser)
			// 					.withMeasure(s.source.queryName)
			// 					.createSelectionId();

			// 				this.selectionIdBySubCategories[`${category}-${ser.name}`] = seriesSelectionId as any;
			// 			});
			// 		});
			// 	});
			// }

			this.setCircle1Radius();
			this.setCircle2Radius();
			this.setPie1Radius();
			this.setPie2Radius();

			const popupOptions = document.querySelector(".popup-options");
			const popupOptionsHeader = document.querySelector(".popup-options-header");
			this.settingsPopupOptionsWidth = popupOptions ? (popupOptions.clientWidth ? popupOptions.clientWidth : 0) : 0;
			this.settingsPopupOptionsHeight = popupOptions ? (popupOptions.clientHeight ? popupOptions.clientHeight : 0) : 0;
			this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth + 5 : 0;
			this.settingsBtnHeight = popupOptionsHeader ? popupOptionsHeader.clientHeight : 0;

			const { titleFontSize: xAxisTitleFontSize, titleFontFamily: xAxisTitleFontFamily } = this.xAxisSettings;
			const { titleFontSize: yAxisTitleFontSize, titleFontFamily: yAxisTitleFontFamily } = this.yAxisSettings;

			this.xAxisTitleMargin = this.xAxisSettings.isDisplayTitle ? 10 : 0;
			this.yAxisTitleMargin = this.yAxisSettings.isDisplayTitle ? 10 : 0;

			this.setCategoricalDataFields(this.categoricalData);

			let isDisplayXTitle: boolean;
			if (this.isSmallMultiplesEnabled) {
				isDisplayXTitle = this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Individual && this.xAxisSettings.show && this.xAxisSettings.isDisplayTitle;
			} else {
				isDisplayXTitle = this.xAxisSettings.show && this.xAxisSettings.isDisplayTitle;
			}

			this.xAxisTitleSize = isDisplayXTitle
				? getSVGTextSize("Title", xAxisTitleFontFamily, xAxisTitleFontSize)
				: { width: 0, height: 0 };

			let isDisplayYTitle: boolean;
			if (this.isSmallMultiplesEnabled) {
				isDisplayYTitle = this.smallMultiplesSettings.yAxisType === ESmallMultiplesAxisType.Individual && this.yAxisSettings.show && this.yAxisSettings.isDisplayTitle;
			} else {
				isDisplayYTitle = this.yAxisSettings.show && this.yAxisSettings.isDisplayTitle;
			}

			this.yAxisTitleSize = isDisplayYTitle
				? getSVGTextSize("Title", yAxisTitleFontFamily, yAxisTitleFontSize)
				: { width: 0, height: 0 };

			if (this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData) {
				this.config.smallMultiplesConfig.showInfoPage = false;
			} else {
				this.config.smallMultiplesConfig.showInfoPage = true;
				this.config.smallMultiplesConfig.infoMessage = `This option allows you to see the small multiples data view. To enable this functionality, 
							add categorical small multiple data into the small multiples data field`;
			}

			this.svg.selectAll(".generated-pattern-defs").remove();
			this.svg.append("defs").attr("class", "generated-pattern-defs")

			createPatternsDefs(this, this.svg);
			createMarkerDefs(this, this.svg);

			this.conditionalFormattingConditions
				.forEach((cf: IConditionalFormattingProps) => {
					if (this.isLollipopTypePie && (((cf.applyTo === "category" && cf.sourceName === this.subCategoryDisplayName)) ||
						((cf.applyTo === "measure" && cf.categoryType === "subCategory")))) {
						cf.applyOnCategories = cf.applyOnCategories.filter(c => c === ECFApplyOnCategories.Marker);
					}

					if (this.isLollipopTypeCircle) {
						cf.categoryType = EDataRolesName.Category;
					}

					if (cf.applyTo === "measure") {
						if (cf.valueType === ECFValueTypes.Value) {
							const roles = this.categoricalData.values.find(d => d.source.displayName === cf.sourceName && (d.source.roles[EDataRolesName.Measure] || d.source.roles[EDataRolesName.Tooltip])).source.roles;
							cf.measureType = {
								measure: roles[EDataRolesName.Measure],
								measure1: cf.sourceName === this.categoricalData.values[0].source.displayName,
								measure2: this.isHasMultiMeasure ? cf.sourceName === this.categoricalData.values[1].source.displayName : false,
								tooltip: roles[EDataRolesName.Tooltip]
							};
						}
					} else if (cf.applyTo === "category") {
						cf.categoryType1 = { [EDataRolesName.Category]: cf.sourceName === this.categoryDisplayName, [EDataRolesName.SubCategory]: cf.sourceName === this.subCategoryDisplayName };
					}
				});

			// SMALL MULTIPLE VISUAL
			if (this.isSmallMultiplesEnabled) {
				// if (this.isHasSmallMultiplesData) {
				// 	this.smallMultiplesCategories = [...new Set(this.categoricalSmallMultiplesDataField.values)] as string[];
				// }

				this.setMargins();

				this.svg
					.attr("opacity", "0")
					.attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
					.attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight)
					.attr("pointer-events", "none");

				this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

				this.smallMultiplesCategoricalDataSourceName = this.categoricalSmallMultiplesDataFields.map(d => d.source.displayName).join(" ");

				this.smallMultiplesDataPairs = GetSmallMultiplesDataPairsByItem(this);

				if (this.isHasSmallMultiplesData) {
					this.smallMultiplesCategories = this.smallMultiplesDataPairs.map(d => d.category);
				}

				let smallMultiplesCategories = cloneDeep(this.smallMultiplesCategories);
				const SMRanking = this.rankingSettings.smallMultiples;
				let othersSMData;

				if (SMRanking.enabled) {
					if (SMRanking.rankingType === ERankingType.TopN) {
						if (this.isHorizontalChart) {
							if (SMRanking.count <= smallMultiplesCategories.length) {
								othersSMData = smallMultiplesCategories.slice(SMRanking.count, smallMultiplesCategories.length);
								smallMultiplesCategories = smallMultiplesCategories.slice(0, SMRanking.count);
							}
						} else {
							othersSMData = smallMultiplesCategories.slice(SMRanking.count, smallMultiplesCategories.length);
							smallMultiplesCategories = smallMultiplesCategories.slice(0, SMRanking.count);
						}
					}
					if (SMRanking.rankingType === ERankingType.BottomN) {
						if (this.isHorizontalChart) {
							othersSMData = smallMultiplesCategories.slice(0, smallMultiplesCategories.length - SMRanking.count);
							smallMultiplesCategories = smallMultiplesCategories.slice(
								smallMultiplesCategories.length - SMRanking.count,
								smallMultiplesCategories.length
							);
						} else {
							if (SMRanking.count <= smallMultiplesCategories.length) {
								othersSMData = smallMultiplesCategories.slice(0, smallMultiplesCategories.length - SMRanking.count);
								smallMultiplesCategories = smallMultiplesCategories.slice(
									smallMultiplesCategories.length - SMRanking.count,
									smallMultiplesCategories.length
								);
							}
						}
					}

					if (SMRanking.showRemainingAsOthers && othersSMData.length) {
						let othersLabel: string;

						switch (SMRanking.suffix) {
							case ERankingSuffix.None:
								othersLabel = this.othersLabel;
								break;
							case ERankingSuffix.OthersAndCategoryName:
								othersLabel = this.othersLabel + " " + this.smallMultiplesCategoricalDataSourceName;
								break;
							case ERankingSuffix.OthersAndCount:
								othersLabel = `${this.othersLabel} (${othersSMData.length})`;
								break;
							case ERankingSuffix.Both:
								othersLabel = `${this.othersLabel} ${this.smallMultiplesCategoricalDataSourceName} (${othersSMData.length})`;
								break;
						}

						this.othersBarText = othersLabel;

						const othersDataField: any = this.othersBarText;
						if (this.isHorizontalChart) {
							smallMultiplesCategories.push(othersDataField);
						} else {
							smallMultiplesCategories.push(othersDataField);
						}
					}
				}

				const settings: ISmallMultiplesGridLayoutSettings = {
					...this.smallMultiplesSettings,
					hostContainerId: "smallMultipleHostContainer",
					containerWidth: vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width,
					containerHeight: vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height,
					categories: smallMultiplesCategories,
					gridDataItemsTotals: this.smallMultiplesDataPairs.map(d => d.total),
					onCellRendered: (category, index, ele) => {
						DrawSmallMultipleBarChart(this, settings, smallMultiplesCategories.findIndex(d => d === category), ele);

						if (index === this.smallMultiplesCategories.length - 1) {
							this.configLegend();

							if (this.isLollipopTypeCircle) {
								this.categoriesColorList.push(...this.categoricalDataPairs.map(d => {
									// const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker1Color;
									const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
									const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
									const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);
									const obj = {
										name: d.category,
										marker: color,
									}

									return obj;
								}));
							}
						}
					},
					getXAxisNodeElementAndMeasures: (width, height, isBottomXAxis) => {
						this.viewPortWidth = width;
						this.viewPortHeight = height;
						this.width = width;
						this.height = height;
						this.settingsBtnWidth = 0;
						this.settingsBtnHeight = 0;
						let isAxisPositionChanged: boolean;

						if (this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform && !isBottomXAxis) {
							this.xAxisSettings.position = Position.Top;
							this.isBottomXAxis = false;
							isAxisPositionChanged = true;
						}

						this.setChartData(this.categoricalData);

						if (this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
							this.drawXYAxisTitle();
						}

						const { xAxisG } = this.drawXYAxis(this.categoricalData, true, this.smallMultiplesSettings.yAxisType === ESmallMultiplesAxisType.Individual, false);

						if (isAxisPositionChanged) {
							this.xAxisSettings.position = Position.Bottom;
							this.isBottomXAxis = true;
							isAxisPositionChanged = false;
						}

						return {
							xAxisNode: xAxisG.node().cloneNode(true),
							xAxisNodeHeight: xAxisG.node().getBoundingClientRect().height,
							xAxisTitleG: this.xAxisTitleG.node().cloneNode(true),
							xAxisTitleHeight: this.xAxisTitleG.node().getBoundingClientRect().height
						};
					},
					getYAxisNodeElementAndMeasures: (width, height) => {
						this.viewPortWidth = width;
						this.viewPortHeight = height;
						this.width = width;
						this.height = height;
						this.settingsBtnWidth = 0;
						this.settingsBtnHeight = 0;

						this.setChartData(this.categoricalData);

						if (this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
							this.drawXYAxisTitle();
						}

						const { yAxisG } = this.drawXYAxis(this.categoricalData, true, true, false);

						return {
							yAxisNode: yAxisG.node(),
							yAxisNodeWidth: this.yScaleGWidth,
							yAxisTitleG: this.yAxisTitleG.node().cloneNode(true),
							yAxisTitleWidth: this.yAxisTitleG.node().getBoundingClientRect().width
						};
					},
					getUniformXAxisAndBrushNode: (xAxisNode, brushNode) => {
						// this.xAxisG = d3.select(xAxisNode);
						// this.brushG = d3.select(brushNode);

						// const config: IBrushConfig = {
						// 	brushG: brushNode,
						// 	brushXPos: 0,
						// 	brushYPos: 0,
						// 	barDistance: this.brushScaleBandBandwidth,
						// 	totalBarsCount: this.totalLollipopCount,
						// 	scaleWidth: this.width,
						// 	scaleHeight: this.height,
						// 	smallMultiplesGridItemId: this.smallMultiplesGridItemId,
						// 	categoricalData: this.categoricalData,
						// 	isShowXAxis: true,
						// 	isShowYAxis: true,
						// 	isShowHorizontalBrush: true
						// };

						// this.drawHorizontalBrush(this, config);

						return { xAxisNodeHeight: this.xScaleGHeight, yAxisNodeWidth: this.margin.left };
					},
					onRenderingFinished: () => {
						RenderLollipopAnnotations(this, GetAnnotationDataPoint.bind(this));

						const onLollipopClick = (ele: D3Selection<SVGElement>) => {
							this.handleCreateOwnDynamicDeviationOnBarClick(ele.node());
						}

						if (!this.isLollipopTypePie) {
							SetAndBindChartBehaviorOptions(this, d3.selectAll(".lollipop-group"), d3.selectAll(".lollipop-line"), onLollipopClick);
						} else {
							SetAndBindChartBehaviorOptions(this, d3.selectAll(".pie-slice"), d3.selectAll(".lollipop-line"), onLollipopClick);
						}
						this.behavior.renderSelection(this.interactivityService.hasSelection());

						this.drawTooltip();
					}
				};

				this.categoriesColorList = [];
				this.subCategoriesColorList = [];

				this.setSummaryTableConfig();

				DrawSmallMultiplesGridLayout(settings);
			} else {
				this.sortSubcategoryData(clonedCategoricalData);

				// NORMAL CHART
				this.categoricalData = this.setInitialChartData(
					clonedCategoricalData,
					clonedCategoricalData,
					cloneDeep(this.vizOptions.options.dataViews[0].metadata),
					vizOptions.options.viewport.width,
					vizOptions.options.viewport.height
				);

				if (this.isHasSubcategories) {
					this.isHasGlobalMinValue = d3.min(this.originalCategoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]), d => d3.min(d.values as number[], i => i)) < 0;
				} else {
					this.isHasGlobalMinValue = d3.min(this.originalCategoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]), d => d.minLocal as number) < 0;
				}

				this.toggleLegendBasedOnGroupByData(this.isHasMultiMeasure, this.isHasSubcategories);

				if (this.isHorizontalBrushDisplayed) {
					this.brushHeight = this.brushAndZoomAreaSettings.enabled ? (this.brushAndZoomAreaHeight + 2) : 10;
				}

				if (this.isVerticalBrushDisplayed) {
					this.brushWidth = this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaWidth : 10;
					this.brushMargin = 10;
				}

				if (!this.isScrollBrushDisplayed) {
					this.sortSubcategoryData(this.categoricalData);
					this.setCategoricalDataFields(this.categoricalData);
					this.setChartData(this.categoricalData);
				}

				this.setColorsByDataColorsSettings();

				// if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
				// 	this.setRemainingAsOthersDataColor();
				// }

				if (this.conditionalFormattingConditions.length) {
					this.setConditionalFormattingColor();
				}

				if (this.isLollipopTypeCircle) {
					this.categoriesColorList = this.chartData.map(d => {
						const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker1Color;
						const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
						const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);
						const obj = {
							name: d.category,
							marker: color,
						}

						return obj;
					});
				}

				if (this.chartData.length && this.isHasSubcategories && this.isLollipopTypePie) {
					this.subCategoriesColorList = [];

					this.subCategoriesColorList = this.chartData[0].subCategories.map(s => {
						const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
						const posNegColor = s.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
						const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.subCategoryColorPair[`${s.parentCategory}-${s.category}`] ? this.subCategoryColorPair[`${s.parentCategory}-${s.category}`].marker1Color : null), EHighContrastColorType.Foreground);
						const obj = {
							name: s.category,
							marker: color,
						}

						return obj;
					});
				}

				this.configLegend();
				this.setMargins();

				this.smallMultiplesGridContainer.selectAll("*").remove();
				this.svg = d3.select(this.chartContainer).select(".lollipopChart");
				this.container = d3.select(this.chartContainer).select(".container");
				this.xAxisG = d3.select(this.chartContainer).select(".xAxisG");
				this.yAxisG = d3.select(this.chartContainer).select(".yAxisG");
				this.container = d3.select(this.chartContainer).select(".container");
				this.lollipopG = d3.select(this.chartContainer).select(".lollipopG");

				this.svg
					.attr("opacity", "1")
					.attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
					.attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height - this.footerHeight)
					.attr("pointer-events", "default");

				this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

				// if (this.isScrollBrushDisplayed || this.brushAndZoomAreaSettings.enabled) {
				this.drawXYAxis(this.categoricalData, true, true);

				if (this.templateSettings.theme && (!this.templateSettings.isIBCSEnabled || (this.templateSettings.prevTheme !== this.templateSettings.theme)) && ((this.templateSettings.prevTheme !== this.templateSettings.theme) || (!this.isIBCSEnabled && isIBCSEnabled))) {
					return;
				}

				if (this.categoricalCategoriesLastIndex > 0) {
					if (!this.isHorizontalChart) {
						RenderExpandAllXAxis(this, this.categoricalData);
					}
					// else {
					// 	RenderExpandAllYAxis(this, this.categoricalData);
					// }
				}

				if (this.isScrollBrushDisplayed || this.brushAndZoomAreaSettings.enabled) {
					this.displayBrush(true, true, true, true);
				} else {
					d3.select(this.hostContainer).on("wheel", undefined);
					const smallMultiplesGridItemContent = this.smallMultiplesGridItemContent[this.smallMultiplesGridItemId];
					(this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData ? d3.select(smallMultiplesGridItemContent.svg) : this.svg).on("wheel", undefined);
				}
				// } else {
				// 	this.drawXYAxis(true, true);

				// 	if (this.categoricalCategoriesLastIndex > 0) {
				// 		if (!this.isHorizontalChart) {
				// 			RenderExpandAllXAxis(this, this.categoricalData);
				// 		} else {
				// 			RenderExpandAllYAxis(this, this.categoricalData);
				// 		}
				// 	}
				// }

				if (this.isExpandAllApplied) {
					if (!this.isHorizontalChart) {
						if (this.isBottomXAxis) {
							this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (this.height + this.xScaleGHeight) + "px" + ")");
						} else {
							this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-this.xScaleGHeight) + "px" + ")");
						}

						CallExpandAllXScaleOnAxisGroup(this, this.scaleBandWidth);
					}
					// else {
					// 	if (this.isLeftYAxis) {
					// 		this.expandAllYAxisG.style("transform", "translate(" + (-this.expandAllYScaleGWidth - this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
					// 	} else {
					// 		this.expandAllYAxisG.style("transform", "translate(" + (this.width) + "px" + "," + 0 + "px" + ")");
					// 	}
					// 	CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
					// }
				}

				this.isCutAndClipAxisEnabled = GetIsCutAndClipAxisEnabled(this);

				this.isShowRegularXAxis =
					(!this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
					(this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
					!this.isCutAndClipAxisEnabled;
				this.isShowRegularYAxis =
					(!this.isCutAndClipAxisEnabled && !this.isHorizontalChart) ||
					(this.isCutAndClipAxisEnabled && this.isHorizontalChart) ||
					!this.isCutAndClipAxisEnabled;

				this.isCutAndClipAxisEnabledLastValue = GetIsCutAndClipAxisEnabled(this);
				this.isLastChartTypeIsHorizontal = this.chartSettings.orientation === Orientation.Horizontal;

				this.drawCutAndClipAxis();

				this.drawXGridLines();
				this.drawYGridLines();

				this.configLegend();

				this.drawLollipopChart();

				if (this.isChartIsRaceChart) {
					RenderRaceChartDataLabel(this);
					// if (!this.isTickerButtonDrawn) {
					RenderRaceTickerButton(this);
					// } else {
					// 	UpdateTickerButton(this);
					// }
				} else {
					if (this.tickerButtonG) {
						this.tickerButtonG.selectAll("*").remove();
					}

					if (this.raceChartDataLabelText) {
						this.raceChartDataLabelText.text("");
						this.raceChartDataLabelG.selectAll(".label-shadow").remove();
					}

					this.isTickerButtonDrawn = false;
				}

				this.drawXYAxisTitle();
				this.setSummaryTableConfig();

				if (this.brushAndZoomAreaSettings.enabled) {
					this.brushLollipopG = this.brushG.append("g").lower().attr("class", "brushLollipopG");
					const min = d3.min(clonedCategoricalData.values, (d: any) => d3.min(d.values, v => +v));
					const max = d3.max(clonedCategoricalData.values, (d: any) => d3.max(d.values, v => +v));

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

				// createPatternsDefs(this, this.svg);
				// createMarkerDefs(this, this.svg);
				// this.createErrorBarsMarkerDefs();
			}

			// createPatternsDefs(this, this.svg);
			// createMarkerDefs(this, this.svg);

			this.createErrorBarsMarkerDefs();
		} catch (error) {
			console.error("Error", error);
		}
	}

	drawCutAndClipAxis(): void {
		if (this.isCutAndClipAxisEnabled) {
			if (!this.isHorizontalChart) {
				this.yAxisG.selectAll(".domain").remove();
				this.yAxisG.selectAll(".tick").remove();
			} else {
				this.xAxisG.selectAll(".domain").remove();
				this.xAxisG.selectAll(".tick").remove();
			}
		}

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
			} else {
				this.xScale = GetCutAndClipXScale.bind(this);
				this.setXAxisTickStyle();
			}
		} else {
			this.xAxisG.classed("cut-clip-axis", false);
			this.yAxisG.classed("cut-clip-axis", false);
			this.container.select(".barCutAndClipMarkersG").selectAll("*").remove();
		}

		if (this.isCutAndClipAxisEnabled) {
			RenderCutAndClipMarkerOnAxis(this);
		} else {
			this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
		}
	}

	private createErrorBarsMarkerDefs(): void {
		this.errorBarsMarkerDefsG.selectAll("*").remove();
		ErrorBarsMarkers.forEach((d: IErrorBarsMarker) => {
			const symbol = this.errorBarsMarkerDefsG.append("defs")
				.append("symbol")
				.attr("id", `${d.shape}_MARKER`)
				.attr("class", "marker-symbol")
				.attr("viewBox", d.viewBox);

			symbol.append("path")
				.attr("d", d.path)
				.attr("class", "marker1-path")
				.attr("fill", this.errorBarsSettings.errorBars.markerColor)
				.attr("stroke", this.errorBarsSettings.errorBars.borderColor)
				.attr("stroke-width", this.errorBarsSettings.errorBars.borderSize);
		})
	}

	setConditionalFormattingColor(): void {
		// BY VALUE
		this.chartData.forEach((d) => {
			if (this.isLollipopTypeCircle) {
				const conditionalFormattingResult = isConditionMatch(d.category, undefined, d.value1, d.value2, undefined, undefined, d.tooltipFields, this.conditionalFormattingConditions);
				if (conditionalFormattingResult.match) {
					// if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
					// 	this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
					// } else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
					// 	this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;
					// } else {

					if (conditionalFormattingResult.markerColor) {
						this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
						this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;

						this.CFCategoryColorPair[d.category].isMarker1Color = true;
						this.CFCategoryColorPair[d.category].isMarker2Color = true;
					}

					// }
					if (conditionalFormattingResult.lineColor) {
						this.categoryColorPair[d.category].lineColor = conditionalFormattingResult.lineColor;

						this.CFCategoryColorPair[d.category].isLineColor = true;
					}

					if (conditionalFormattingResult.labelColor) {
						this.categoryColorPair[d.category].labelColor = conditionalFormattingResult.labelColor;

						this.CFCategoryColorPair[d.category].isLabelColor = true;
					}
				} else {
					// this.categoryColorPair[d.category].lineColor = undefined;
					// this.categoryColorPair[d.category].labelColor = undefined;
				}
			} else {
				d.subCategories.forEach((s) => {
					const conditionalFormattingResult = isConditionMatch(d.category, s.category, d.value1, d.value2, s.value1, s.value2, s.tooltipFields, this.conditionalFormattingConditions);
					if (conditionalFormattingResult.match) {
						// if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
						// 	this.subCategoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
						// } else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
						// 	this.subCategoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;
						// } else {

						if (conditionalFormattingResult.markerColor) {
							this.subCategoryColorPair[`${d.category}-${s.category}`].marker1Color = conditionalFormattingResult.markerColor;
							this.subCategoryColorPair[`${d.category}-${s.category}`].marker2Color = conditionalFormattingResult.markerColor;

							this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isMarker1Color = true;
							this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isMarker2Color = true;
						}

						// }
						if (conditionalFormattingResult.lineColor) {
							this.subCategoryColorPair[`${d.category}-${s.category}`].lineColor = conditionalFormattingResult.lineColor;

							this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLineColor = true;
						}

						if (conditionalFormattingResult.labelColor) {
							this.subCategoryColorPair[`${d.category}-${s.category}`].labelColor = conditionalFormattingResult.labelColor;

							this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLabelColor = true;
						}
					} else {
						// this.subCategoryColorPair[d.category].lineColor = undefined;
						// this.subCategoryColorPair[d.category].labelColor = undefined;
					}
				});
			}
		});

		// BY RANKING
		const chartData: ILollipopChartRow[] = cloneDeep(this.chartData).sort((a: ILollipopChartRow, b: ILollipopChartRow) => (b.value1 + b.value2) - (a.value1 + a.value2));
		chartData.forEach((d: ILollipopChartRow, i) => {
			this.conditionalFormattingConditions.forEach((c) => {
				if (this.isLollipopTypeCircle) {
					if (c.valueType === ECFValueTypes.Ranking) {
						if (c.rankingType === ECFRankingTypes.TopN) {
							if (i < c.staticRankingValue) {

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
									this.categoryColorPair[d.category].marker1Color = c.color;
									this.categoryColorPair[d.category].marker2Color = c.color;

									this.CFCategoryColorPair[d.category].isMarker1Color = true;
									this.CFCategoryColorPair[d.category].isMarker2Color = true;
								}
								if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
									this.categoryColorPair[d.category].lineColor = c.color;

									this.CFCategoryColorPair[d.category].isLineColor = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
									this.categoryColorPair[d.category].labelColor = c.color;

									this.CFCategoryColorPair[d.category].isLabelColor = true;
								}
							}
						} else if (c.rankingType === ECFRankingTypes.BottomN) {
							if (i > ((chartData.length - 1) - c.staticRankingValue)) {
								if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
									this.categoryColorPair[d.category].marker1Color = c.color;
									this.categoryColorPair[d.category].marker2Color = c.color;

									this.CFCategoryColorPair[d.category].isMarker1Color = true;
									this.CFCategoryColorPair[d.category].isMarker2Color = true;
								}
								if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
									this.categoryColorPair[d.category].lineColor = c.color;

									this.CFCategoryColorPair[d.category].isLineColor = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
									this.categoryColorPair[d.category].labelColor = c.color;

									this.CFCategoryColorPair[d.category].isLabelColor = true;
								}
							}
						}
					}
				} else {
					d.subCategories.forEach((s, i) => {
						this.conditionalFormattingConditions.forEach((c) => {
							if (c.valueType === ECFValueTypes.Ranking) {
								if (c.rankingType === ECFRankingTypes.TopN) {
									if (i < c.staticRankingValue) {
										if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
											this.subCategoryColorPair[`${d.category}-${s.category}`].marker1Color = c.color;
											this.subCategoryColorPair[`${d.category}-${s.category}`].marker2Color = c.color;
										}
									}
								} else if (c.rankingType === ECFRankingTypes.BottomN) {
									if (i > ((d.subCategories.length - 1) - c.staticRankingValue)) {
										if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
											this.subCategoryColorPair[`${d.category}-${s.category}`].marker1Color = c.color;
											this.subCategoryColorPair[`${d.category}-${s.category}`].marker2Color = c.color;
										}
									}
								}
							}
						});
					});
				}
			});



			// if (this.isLollipopTypeCircle) {
			// 	const conditionalFormattingResult = isConditionMatch(d.category, undefined, d.value1, d.value2, d.tooltipFields, this.conditionalFormattingConditions);
			// 	if (conditionalFormattingResult.match) {
			// 		// if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
			// 		// 	this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
			// 		// } else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
			// 		// 	this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;
			// 		// } else {
			// 		if (conditionalFormattingResult.markerColor) {
			// 			this.categoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
			// 			this.categoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;
			// 		}

			// 		// }
			// 		if (conditionalFormattingResult.lineColor) {
			// 			this.categoryColorPair[d.category].lineColor = conditionalFormattingResult.lineColor;
			// 		}

			// 		if (conditionalFormattingResult.labelColor) {
			// 			this.categoryColorPair[d.category].labelColor = conditionalFormattingResult.labelColor;
			// 		}
			// 	} else {
			// 		// this.categoryColorPair[d.category].lineColor = undefined;
			// 		// this.categoryColorPair[d.category].labelColor = undefined;
			// 	}
			// } else {
			// 	d.subCategories.forEach((s) => {
			// 		const conditionalFormattingResult = isConditionMatch(d.category, s.category, s.value1, s.value2, s.tooltipFields, this.conditionalFormattingConditions);
			// 		if (conditionalFormattingResult.match) {
			// 			// if (conditionalFormattingResult.measureType === EDataRolesName.Measure1) {
			// 			// 	this.subCategoryColorPair[d.category].marker1Color = conditionalFormattingResult.markerColor;
			// 			// } else if (conditionalFormattingResult.measureType === EDataRolesName.Measure2) {
			// 			// 	this.subCategoryColorPair[d.category].marker2Color = conditionalFormattingResult.markerColor;
			// 			// } else {
			// 			if (conditionalFormattingResult.markerColor) {
			// 				this.subCategoryColorPair[`${d.category}-${s.category}`].marker1Color = conditionalFormattingResult.markerColor;
			// 				this.subCategoryColorPair[`${d.category}-${s.category}`].marker2Color = conditionalFormattingResult.markerColor;
			// 			}

			// 			// }
			// 			if (conditionalFormattingResult.lineColor) {
			// 				this.subCategoryColorPair[`${d.category}-${s.category}`].lineColor = conditionalFormattingResult.lineColor;
			// 			}

			// 			if (conditionalFormattingResult.labelColor) {
			// 				this.subCategoryColorPair[`${d.category}-${s.category}`].labelColor = conditionalFormattingResult.labelColor;
			// 			}
			// 		} else {
			// 			// this.subCategoryColorPair[d.category].lineColor = undefined;
			// 			// this.subCategoryColorPair[d.category].labelColor = undefined;
			// 		}
			// 	});
			// }
		});

		// BY PERCENTAGE
		const isPercentageMatch = (c: IConditionalFormattingProps, percentage: number): boolean => {
			switch (c.operator) {
				case "===":
					return +percentage.toFixed(0) === +c.percentValue.toFixed(0);
				case "!==":
					return +percentage.toFixed(0) !== +c.percentValue.toFixed(0);
				case "<":
					return percentage < c.percentValue;
				case ">":
					return percentage > c.percentValue;
				case "<=":
					return percentage <= c.percentValue;
				case ">=":
					return percentage >= c.percentValue;
				case "<>":
					return percentage > 0 ? percentage >= c.staticPercentValue && percentage <= c.secondaryStaticPercentValue : percentage <= c.staticPercentValue && percentage >= c.secondaryStaticPercentValue;
			}
		}

		const value1Total = d3.sum(chartData, d => d.value1);
		const value2Total = d3.sum(chartData, d => d.value2);

		this.chartData.forEach((d: ILollipopChartRow) => {
			const percentage1 = (d.value1 / value1Total) * 100;

			this.conditionalFormattingConditions.forEach((c) => {
				if (c.valueType === ECFValueTypes.Percentage) {
					if (this.isLollipopTypeCircle) {
						if (isPercentageMatch(c, percentage1)) {
							if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
								this.categoryColorPair[d.category].marker1Color = c.color;
								this.CFCategoryColorPair[d.category].isMarker1Color = true;
							}

							if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
								this.categoryColorPair[d.category].lineColor = c.color;
								this.CFCategoryColorPair[d.category].isLineColor = true;
							}

							if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
								this.categoryColorPair[d.category].labelColor = c.color;
								this.CFCategoryColorPair[d.category].isLabelColor = true;
							}
						}

						if (this.isHasMultiMeasure) {
							const percentage2 = (d.value2 / value2Total) * 100;
							if (isPercentageMatch(c, percentage2)) {
								if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
									this.categoryColorPair[d.category].marker2Color = c.color;
									this.CFCategoryColorPair[d.category].isMarker2Color = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
									this.categoryColorPair[d.category].lineColor = c.color;
									this.CFCategoryColorPair[d.category].isLineColor = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
									this.categoryColorPair[d.category].labelColor = c.color;
									this.CFCategoryColorPair[d.category].isLabelColor = true;
								}
							}
						}
					} else {
						const value1Total = d3.sum(d.subCategories, d => d.value1);
						const value2Total = d3.sum(d.subCategories, d => d.value2);

						d.subCategories.forEach(s => {
							const percentage1 = (s.value1 / value1Total) * 100;

							if (isPercentageMatch(c, percentage1)) {
								if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
									this.subCategoryColorPair[`${d.category}-${s.category}`].marker1Color = c.color;
									this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isMarker1Color = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
									this.subCategoryColorPair[`${d.category}-${s.category}`].lineColor = c.color;
									this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLineColor = true;
								}

								if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
									this.subCategoryColorPair[`${d.category}-${s.category}`].labelColor = c.color;
									this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLabelColor = true;
								}
							}

							if (this.isHasMultiMeasure) {
								const percentage2 = (s.value2 / value2Total) * 100;
								if (isPercentageMatch(c, percentage2)) {
									if (c.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
										this.subCategoryColorPair[`${d.category}-${s.category}`].marker2Color = c.color;
										this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isMarker2Color = true;
									}

									if (c.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
										this.subCategoryColorPair[`${d.category}-${s.category}`].lineColor = c.color;
										this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLineColor = true;
									}

									if (c.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
										this.subCategoryColorPair[`${d.category}-${s.category}`].labelColor = c.color;
										this.CFSubCategoryColorPair[`${d.category}-${s.category}`].isLabelColor = true;
									}
								}
							}
						})
					}
				}
			});
		});

		this.firstCFLine = this.conditionalFormattingConditions.filter(d => d.sourceName === this.subCategoryDisplayName).find(d => d.applyOnCategories.includes(ECFApplyOnCategories.Line));
		this.firstCFLabel = this.conditionalFormattingConditions.filter(d => d.sourceName === this.subCategoryDisplayName).find(d => d.applyOnCategories.includes(ECFApplyOnCategories.Labels));
	}

	private sortSubcategoryData(categoricalData: powerbi.DataViewCategorical): void {
		const { enabled, sortOrder, sortBy, isSortByCategory } = this.sortingSettings.subCategory;
		if (enabled && this.isHasSubcategories) {
			if (isSortByCategory) {
				if (this.isHorizontalChart) {
					if (sortOrder === ESortOrderTypes.DESC) {
						categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					} else {
						categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					}
				} else {
					if (sortOrder === ESortOrderTypes.ASC) {
						categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					} else {
						categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					}
				}
			} else {
				const categoricalDataValues: powerbi.DataViewValueColumn[] = cloneDeep(categoricalData.values);
				const displayNames = categoricalDataValues.map((d) => d.source.displayName);

				if (displayNames.includes(sortBy)) {
					const categoricalValuesBySort = categoricalDataValues.filter((d) => d.source.displayName === sortBy);
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
						const valuesByGroupName = categoricalDataValues.filter((v) => v.source.groupName === d);
						valuesByGroupName.forEach((v, j) => {
							categoricalData.values[i * valuesByGroupName.length + j] = v;
						});
					});
				}
			}
		}

		const categoricalMeasureFields = categoricalData.values
			? categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure])
			: [];

		this.subCategoriesName = categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];
	}

	public renderErrorMessages(): boolean {
		const categoricalCategoriesFields = this.clonedCategoricalData.categories
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
			this.margin.right = this.brushWidth + this.brushMargin + this.brushYAxisTicksMaxWidth;
		} else if (this.yAxisSettings.position === Position.Right) {
			this.margin.left = 0;
			this.margin.right = this.yScaleGWidth + this.yAxisTitleSize.width + this.yAxisTitleMargin + this.brushWidth + this.brushMargin + this.expandAllYScaleGWidth + this.brushYAxisTicksMaxWidth;
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
					isHighlight: measure1Highlights && measure1Highlights.length > 0 ? !!measure1Highlights[idx] : false,
					allMeasures: subCategoryGroup.reduce((obj, cur) => {
						obj[cur.source.displayName] = { roles: cur.source.roles, value: cur.values[idx] };
						return obj;
					}, {})
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
			${this.markerSettings.marker1Style.markerShape}-
			${this.markerSettings.marker1Style.markerChart}-
			${this.markerSettings.marker2Style.markerShape}-
			${this.markerSettings.marker2Style.markerChart}-
			${this.yAxisSettings.isShowLabelsAboveLine}-
			${this.isShowImageMarker1}-
			${this.isShowImageMarker2}`;
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

			const percentageMultiplier = this.isPercentageMeasure ? 100 : 1;

			switch (this.errorBarsSettings.measurement.calcType) {
				case EErrorBarsCalcTypes.ByField:
					if (this.isHasErrorUpperBounds && this.errorBarsSettings.measurement.upperBoundMeasure) {
						const categoricalUpperBoundFields = this.categoricalUpperBoundFields.filter(d => d.source.displayName === this.errorBarsSettings.measurement.upperBoundMeasure);
						ub = this.isHasSubcategories ? d3.sum(categoricalUpperBoundFields, d => <number>d.values[idx]) : <number>categoricalUpperBoundFields[0].values[idx];
						upperBoundValue = (isErrorBarsAbsoluteRelation && !this.errorBarsSettings.measurement.makeSymmetrical ? ub : ub + value) * percentageMultiplier;
					}

					if (this.isHasErrorLowerBounds && this.errorBarsSettings.measurement.lowerBoundMeasure && !this.errorBarsSettings.measurement.makeSymmetrical) {
						const categoricalLowerBoundFields = this.categoricalLowerBoundFields.filter(d => d.source.displayName === this.errorBarsSettings.measurement.lowerBoundMeasure);
						lb = this.isHasSubcategories ? d3.sum(categoricalLowerBoundFields, d => <number>d.values[idx]) : <number>categoricalLowerBoundFields[0].values[idx];
						lowerBoundValue = (isErrorBarsAbsoluteRelation ? lb : lb + value) * percentageMultiplier;
					}

					if (this.errorBarsSettings.measurement.makeSymmetrical) {
						lb = lowerBoundValue = (value - Math.abs(value - upperBoundValue)) * percentageMultiplier;
					}

					break;
				case EErrorBarsCalcTypes.ByPercentage:
					this.isHasErrorUpperBounds = true;
					this.isHasErrorLowerBounds = true;
					ub = upperBoundValue = value + (value * this.errorBarsSettings.measurement.upperBoundPercentage) / 100;
					lb = lowerBoundValue = value - (value * this.errorBarsSettings.measurement.lowerBoundPercentage) / 100;
					break;
				case EErrorBarsCalcTypes.ByPercentile: {
					this.isHasErrorUpperBounds = true;
					this.isHasErrorLowerBounds = true;
					ub = upperBoundValue = d3.quantile([value], this.errorBarsSettings.measurement.upperBoundPercentage / 100);
					lb = lowerBoundValue = d3.quantile([value], this.errorBarsSettings.measurement.lowerBoundPercentage / 100);
					break;
				}
				case EErrorBarsCalcTypes.ByStandardDeviation: {
					// const isMeasure2 = this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;
					// const sd = calculatePowerBiStandardDeviation(this.chartData.map(d => isMeasure2 ? d.value2 : d.value1));
					// ub = upperBoundValue = value + sd;
					// lb = lowerBoundValue = value - sd;
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

				return (bound !== undefined && bound !== null)
					? labelFormat !== EErrorBarsLabelFormat.RelativePercentage
						? this.formatNumber(+bound, this.numberSettings, this.measureNumberFormatter[0], true, true)
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

				const selectedImageDataFieldIndex1 = this.imagesDataFieldsName.findIndex(d => d === this.markerSettings.marker1Style.selectedImageDataField);
				const selectedImageDataFieldIndex2 = this.imagesDataFieldsName.findIndex(d => d === this.markerSettings.marker2Style.selectedImageDataField);

				let value1 = !this.isHasSubcategories ? <number>this.categoricalMeasure1Field.values[idx] : 0;
				let value2 = this.isHasMultiMeasure ? (!this.isHasSubcategories ? <number>this.categoricalMeasure2Field.values[idx] : 0) : 0;

				if (this.categoricalMeasure1Field.source.format && this.categoricalMeasure1Field.source.format.includes("%")) {
					value1 = value1 * 100;
				}

				if (this.isHasMultiMeasure && this.categoricalMeasure2Field.source.format && this.categoricalMeasure2Field.source.format.includes("%")) {
					value2 = value2 * 100;
				}

				const extraDataLabels = this.categoricalExtraDataLabelsFields.reduce((obj, current) => {
					obj[current.source.displayName] = current.values[idx];
					return obj;
				}, {});

				const obj: ILollipopChartRow = {
					uid: getUID(cat),
					category: cat.toString(),
					raceChartKey,
					raceChartDataLabel,
					value1: value1 ? value1 : 0,
					value2: value2 ? value2 : 0,
					imageDataUrl1: this.isHasImagesData && this.isShowImageMarker1 ? <string>this.categoricalImagesDataFields[selectedImageDataFieldIndex1].values[idx] : null,
					imageDataUrl2: this.isHasImagesData && this.isShowImageMarker2 ? <string>this.categoricalImagesDataFields[selectedImageDataFieldIndex2].values[idx] : null,
					identity: undefined,
					selected: false,
					isHighlight: this.categoricalMeasure1Field.highlights ? !!this.categoricalMeasure1Field.highlights[idx] : false,
					tooltipFields: this.categoricalTooltipFields.map((d) => ({ displayName: d.source.displayName, value: d.values[idx], color: "" } as TooltipData)),
					subCategories: this.isHasSubcategories ? getSubCategoryData(idx, <string>cat) : [],
					positions: { dataLabel1X: 0, dataLabel1Y: 0, dataLabel2X: 0, dataLabel2Y: 0 },
					errorBar1: {
						lowerBoundValue: 0,
						upperBoundValue: 0,
						tooltipLowerBoundValue: null,
						tooltipUpperBoundValue: null,
						boundsTotal: 0,
					},
					errorBar2: {
						lowerBoundValue: 0,
						upperBoundValue: 0,
						tooltipLowerBoundValue: null,
						tooltipUpperBoundValue: null,
						boundsTotal: 0,
					},
					extraLabel1: extraDataLabels[this.data1LabelsSettings.customLabel],
					extraLabel2: extraDataLabels[this.data2LabelsSettings.customLabel],
					data1Label: "",
					data2Label: "",
					allMeasures: categoricalData.values.reduce((obj, cur) => {
						obj[cur.source.displayName] = { roles: cur.source.roles, value: cur.values[idx] };
						return obj;
					}, {})
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
			if (this.errorBarsSettings.isEnabled) {
				const isValue2 = this.isHasMultiMeasure && this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;
				const value1 = this.isLollipopTypePie ? d3.sum(d.subCategories, s => s.value1) : d.value1;
				const value2 = this.isLollipopTypePie ? d3.sum(d.subCategories, s => s.value2) : d.value2;
				const { upperBoundValue, lowerBoundValue, tooltipUpperBoundValue, tooltipLowerBoundValue, labelLowerBoundValue, labelUpperBoundValue } = getUpperLowerBoundsValue(i, isValue2 ? value2 : value1, data);

				const obj: IErrorBarValue = {};
				obj.upperBoundValue = upperBoundValue;
				obj.tooltipUpperBoundValue = tooltipUpperBoundValue;
				obj.lowerBoundValue = lowerBoundValue;
				obj.tooltipLowerBoundValue = tooltipLowerBoundValue;
				obj.boundsTotal = lowerBoundValue + upperBoundValue;
				obj.labelUpperBoundValue = labelUpperBoundValue;
				obj.labelLowerBoundValue = labelLowerBoundValue;

				d.errorBar1 = obj;

				// 	ERROR BAR 2
				if (this.isRenderBothErrorBars) {
					const { upperBoundValue, lowerBoundValue, tooltipUpperBoundValue, tooltipLowerBoundValue, labelLowerBoundValue, labelUpperBoundValue } = getUpperLowerBoundsValue(i, isValue2 ? value1 : value2, data);

					const obj: IErrorBarValue = {};
					obj.upperBoundValue = upperBoundValue;
					obj.tooltipUpperBoundValue = tooltipUpperBoundValue;
					obj.lowerBoundValue = lowerBoundValue;
					obj.tooltipLowerBoundValue = tooltipLowerBoundValue;
					obj.boundsTotal = lowerBoundValue + upperBoundValue;
					obj.labelUpperBoundValue = labelUpperBoundValue;
					obj.labelLowerBoundValue = labelLowerBoundValue;

					d.errorBar2 = obj;
				}
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
							imageDataUrl1: null,
							imageDataUrl2: null,
							subCategories: [],
							selected: false,
							identity: null,
							isHighlight: false,
							positions: { dataLabel1X: 0, dataLabel1Y: 0, dataLabel2X: 0, dataLabel2Y: 0 },
							errorBar1: undefined,
							errorBar2: undefined,
							extraLabel1: "",
							extraLabel2: "",
							data1Label: "",
							data2Label: "",
							allMeasures: undefined
						});
					}
				});
			});
		}

		if (!this.isHasSubcategories) {
			this.clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i) => {
				const selectionId = this.vizOptions.host
					.createSelectionIdBuilder()
					.withCategory(this.categoricalData.categories[this.categoricalCategoriesLastIndex] as any, i)
					// .withCategory(this.categoricalData.categories[1] as any, this.currentSmallMultipleIndex)
					.createSelectionId();

				// if (this.smallMultiplesGridItemId) {
				this.selectionIdByCategories[category] = selectionId;
				// }
			});
		} else {
			const categoricalData = this.vizOptions.options.dataViews[0];
			const series: any[] = categoricalData.categorical.values.grouped();
			this.clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.forEach((category: string, i: number) => {
				const selectionId = this.vizOptions.host
					.createSelectionIdBuilder()
					.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
					.createSelectionId();

				this.selectionIdByCategories[category] = selectionId;

				series.forEach((ser: any) => {
					// ser.values.forEach((s) => {
					const seriesSelectionId = this.vizOptions.host
						.createSelectionIdBuilder()
						.withCategory(categoricalData.categorical.categories[this.categoricalCategoriesLastIndex], i)
						.withSeries(categoricalData.categorical.values, ser)
						// .withMeasure(s.source.queryName)
						.createSelectionId();

					this.selectionIdBySubCategories[`${category}-${ser.name}`] = seriesSelectionId as any;
					// });
				});
			});
		}

		this.setSelectionIds(data);

		if (this.isChartIsRaceChart) {
			this.raceChartData = cloneDeep(data);
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

		// if (this.patternSettings.enabled) {
		// 	this.setVisualPatternData();
		// }

		const min1Index = d3.minIndex(this.chartData, (d) => d.value1);
		const max1Index = d3.maxIndex(this.chartData, (d) => d.value1);

		const min2Index = d3.minIndex(this.chartData, (d) => d.value2);
		const max2Index = d3.maxIndex(this.chartData, (d) => d.value2);

		// this.minCategoryValueDataPair = {
		// 	category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[min1Index],
		// 	value: this.isHasMultiMeasure ? d3.sum([+this.categoricalMeasure1Field.values[min1Index], +this.categoricalMeasure2Field.values[min2Index]]) : +this.categoricalMeasure1Field.values[min1Index],
		// };

		// this.maxCategoryValueDataPair = {
		// 	category: <string>categoricalData.categories[this.categoricalCategoriesLastIndex].values[max1Index],
		// 	value: this.isHasMultiMeasure ? d3.sum([+this.categoricalMeasure1Field.values[max1Index], +this.categoricalMeasure2Field.values[max2Index]]) : +this.categoricalMeasure1Field.values[max1Index],
		// };

		this.minCategoryValueDataPair = {
			category: this.chartData[min1Index].category,
			value: this.isHasMultiMeasure ? d3.sum([+this.chartData[min1Index].value1, +this.chartData[min2Index].value2]) : +this.chartData[min1Index].value1,
		};

		this.maxCategoryValueDataPair = {
			category: this.chartData[max1Index].category,
			value: this.isHasMultiMeasure ? d3.sum([+this.chartData[max1Index].value1, +this.chartData[max2Index].value2]) : +this.chartData[max1Index].value1,
		};

		if (this.isXIsContinuousAxis && !this.isHorizontalChart) {
			if (this.xAxisSettings.isMinimumRangeEnabled && this.xAxisSettings.minimumRange) {
				this.chartData = this.chartData.filter(d => +d.category >= this.xAxisSettings.minimumRange);
			}

			if (this.xAxisSettings.isMaximumRangeEnabled && this.xAxisSettings.maximumRange) {
				this.chartData = this.chartData.filter(d => +d.category <= this.xAxisSettings.maximumRange);
			}
		}

		if (this.isYIsContinuousAxis && this.isHorizontalChart) {
			if (this.yAxisSettings.isMinimumRangeEnabled && this.yAxisSettings.minimumRange) {
				this.chartData = this.chartData.filter(d => +d.category >= this.yAxisSettings.minimumRange);
			}

			if (this.yAxisSettings.isMaximumRangeEnabled && this.yAxisSettings.maximumRange) {
				this.chartData = this.chartData.filter(d => +d.category <= this.yAxisSettings.maximumRange);
			}
		}

		// const chartData = cloneDeep(this.chartData));
		// if (this.isHorizontalChart) {
		// 	this.chartData = chartData.reverse();
		// }

		// this.chartData = this.elementToMoveOthers(this.chartData, true, "category");

		const isPatternTemplateApplied = this.templateSettings.isTemplatesEnabled && this.templateSettings.selectedTemplate === EGeneralTemplates.FillPatternTemplate;
		this.categoryPatterns = this.chartData.map(d => ({ name: d.category.replace(/--\d+/g, ''), patternIdentifier: undefined, isImagePattern: undefined, dimensions: undefined }));
		this.categoryPatterns
			.forEach((c, i) => {
				const d = this.patternSettings.categoryPatterns[i];
				c.patternIdentifier = d ? d.patternIdentifier ? d.patternIdentifier : "NONE" : "NONE";
				c.isImagePattern = d ? d.isImagePattern ? d.isImagePattern : false : false;
				c.dimensions = d ? d.dimensions ? d.dimensions : undefined : undefined;
			});

		this.measuresPatterns = this.measureNames
			.map((d) => {
				const pattern = this.patternSettings.measuresPatterns.find((p) => p.name === d);
				const obj = {
					name: d,
					patternIdentifier: pattern ? pattern.patternIdentifier ? pattern.patternIdentifier : "NONE" : "NONE",
					isImagePattern: pattern ? pattern.isImagePattern ? pattern.isImagePattern : false : false,
					dimensions: pattern ? pattern.dimensions ? pattern.dimensions : undefined : undefined,
				};
				return obj;
			});

		this.measuresPatterns.forEach(d => {
			this.patternByMeasures[d.name === this.measure1DisplayName ? RankingDataValuesType.Value1 : RankingDataValuesType.Value2] = d;
		});

		if (this.isHasSubcategories) {
			this.subCategoryPatterns = this.chartData[0].subCategories.map(d => ({ name: d.category, patternIdentifier: undefined, isImagePattern: undefined, dimensions: undefined }));
			this.subCategoryPatterns
				.forEach((c, i) => {
					const pattern = this.patternSettings.subCategoryPatterns[i];
					c.patternIdentifier = pattern ? pattern.patternIdentifier ? pattern.patternIdentifier : "NONE" : "NONE";
					c.isImagePattern = pattern ? pattern.isImagePattern ? pattern.isImagePattern : false : false;
					c.dimensions = pattern ? pattern.dimensions ? pattern.dimensions : undefined : undefined;
				});
		}

		if (isPatternTemplateApplied) {
			this.categoryPatterns.forEach(d => {
				if (!this.patternSettings.categoryPatterns.find(p => p.name === d.name)) {
					d.patternIdentifier = this.patternSettings.categoryPatterns[0].patternIdentifier;
					this.patternSettings.categoryPatterns.push(d);
				}
			})

			if (this.isHasSubcategories) {
				this.subCategoryPatterns.forEach(d => {
					if (!this.patternSettings.subCategoryPatterns.find(p => p.name === d.name)) {
						d.patternIdentifier = this.patternSettings.subCategoryPatterns[0].patternIdentifier;
						this.patternSettings.subCategoryPatterns.push(d);
					}
				});
			}
		}

		if (this.patternSettings.enabled) {
			this.setVisualPatternData();
		}
	}

	public elementToMoveOthers = (data: any[], isHasCategories: boolean, categoryName: string) => {
		if (this.rankingSettings.category.enabled && this.rankingSettings.category.showRemainingAsOthers) {
			const elementToMove = data.find(obj => (isHasCategories ? obj[categoryName] : obj).toString().includes(this.othersLabel));
			if (elementToMove) {
				const index = data.findIndex(obj => (isHasCategories ? obj[categoryName] : obj).toString().includes(this.othersLabel));
				data.splice(index, 1);
				if (this.isHorizontalChart) {
					data.push(elementToMove);
				} else {
					data.push(elementToMove);
				}
			}
		}

		return data;
	}

	public configLegend(): void {
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
		let legendDataPoints: { data: { name: string, color: string, pattern: IPatternProps, imageUrl: string } }[] = [];

		if (this.isLollipopTypeCircle) {
			if (!this.isShowImageMarker1) {
				switch (this.dataColorsSettings.fillType) {
					// case ColorPaletteType.Single:
					// if (!this.isHasMultiMeasure) {
					// 	legendDataPoints = [{
					// 		data: {
					// 			name: this.measure1DisplayName,
					// 			color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
					// 			pattern: undefined,
					// 			imageUrl: undefined
					// 		}
					// 	}]
					// } else {
					// 	legendDataPoints = [
					// 		{
					// 			data: {
					// 				name: this.measure1DisplayName,
					// 				color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
					// 				pattern: this.patternByMeasures[DataValuesType.Value1],
					// 				imageUrl: undefined
					// 			},
					// 		},
					// 		{
					// 			data: {
					// 				name: this.measure2DisplayName,
					// 				color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor2, EHighContrastColorType.Foreground),
					// 				pattern: this.patternByMeasures[DataValuesType.Value2],
					// 				imageUrl: undefined
					// 			},
					// 		}
					// 	]
					// }
					// break;
					case ColorPaletteType.Single:
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
									pattern: this.patternByMeasures[`value${i + 1}`],
									imageUrl: undefined
								}
							}))
						} else {
							const chartData = cloneDeep(this.chartData);
							legendDataPoints = (this.isHorizontalChart ? chartData.reverse() : chartData).map(d => ({
								data: {
									name: d.category.replace(/--\d+/g, ''),
									color: this.getColor(this.categoryColorPair[d.category].marker1Color, EHighContrastColorType.Foreground),
									pattern: this.patternSettings.categoryPatterns.find((p) => p.name === d.category),
									imageUrl: undefined
								}
							}));
						}
						break;
					case ColorPaletteType.PositiveNegative:
						legendDataPoints = [
							{
								data: {
									name: "Positive",
									color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : POSITIVE_COLOR, EHighContrastColorType.Foreground),
									pattern: undefined,
									imageUrl: undefined
								},
							},
						]

						if (this.isHasGlobalMinValue) {
							legendDataPoints.push({
								data: {
									name: "Negative",
									color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : NEGATIVE_COLOR, EHighContrastColorType.Foreground),
									pattern: undefined,
									imageUrl: undefined
								},
							})
						}
						break;
				}
			} else {
				const chartData: ILollipopChartRow[] = cloneDeep(this.chartData);
				legendDataPoints = (this.isHorizontalChart ? chartData.reverse() : chartData).map(d => ({
					data: {
						name: d.category.replace(/--\d+/g, ''),
						color: undefined,
						pattern: undefined,
						imageUrl: d.imageDataUrl1
					}
				}));
			}
		}

		if (this.isHasSubcategories && this.isLollipopTypePie) {
			switch (this.dataColorsSettings.fillType) {
				// case ColorPaletteType.Single:
				// 	if (!this.isHasMultiMeasure) {
				// 		legendDataPoints = [{
				// 			data: {
				// 				name: this.measure1DisplayName,
				// 				color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
				// 				pattern: this.chartData[0].subCategories[0].pattern,
				// 				imageUrl: undefined
				// 			}
				// 		}]
				// 	} else {
				// 		legendDataPoints = [
				// 			{
				// 				data: {
				// 					name: this.measure1DisplayName,
				// 					color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor1, EHighContrastColorType.Foreground),
				// 					pattern: this.patternByMeasures[DataValuesType.Value1],
				// 					imageUrl: undefined
				// 				},
				// 			},
				// 			{
				// 				data: {
				// 					name: this.measure2DisplayName,
				// 					color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : this.dataColorsSettings.singleColor2, EHighContrastColorType.Foreground),
				// 					pattern: this.patternByMeasures[DataValuesType.Value2],
				// 					imageUrl: undefined
				// 				},
				// 			}
				// 		]
				// 	}
				// 	break;
				case ColorPaletteType.Single:
				case ColorPaletteType.PowerBi:
				case ColorPaletteType.Diverging:
				case ColorPaletteType.Qualitative:
				case ColorPaletteType.Sequential:
				case ColorPaletteType.ByCategory:
				case ColorPaletteType.BySubCategory:
				case ColorPaletteType.Gradient:
					// only this needs to be change for pattern
					legendDataPoints = this.subCategoriesName.map((d, i) => ({
						data: {
							name: d,
							color: this.getColor(this.subCategoryColorPair[`${this.chartData[0].category}-${d}`][`marker${1}Color`], EHighContrastColorType.Foreground),
							pattern: this.subCategoryPatterns.find(s => s.name === d),
							imageUrl: undefined
						}
					}))
					break;
				case ColorPaletteType.PositiveNegative:
					legendDataPoints = [
						{
							data: {
								name: "Positive",
								color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : POSITIVE_COLOR, EHighContrastColorType.Foreground),
								pattern: undefined,
								imageUrl: undefined
							},
						},
					]

					if (this.isHasGlobalMinValue) {
						legendDataPoints.push(
							{
								data: {
									name: "Negative",
									color: this.getColor(this.isShowMarker1OutlineColor ? this.markerSettings.marker1Style.outlineColor : NEGATIVE_COLOR, EHighContrastColorType.Foreground),
									pattern: undefined,
									imageUrl: undefined
								},
							})
					}
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
				this.isShowImageMarker1
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

		const SMConfig = JSON.parse(formatTab[EVisualConfig.SmallMultiplesConfig][EVisualSettings.SmallMultiplesSettings]);
		this.smallMultiplesSettings = {
			...SMALL_MULTIPLES_SETTINGS,
			...SMConfig,
		};

		this.legendSettings = cloneDeep(formatTab[EVisualSettings.Legend]);
		this.numberSettings = cloneDeep(formatTab[EVisualSettings.NumberFormatting]);
		this.footerSettings = cloneDeep(formatTab[EVisualSettings.Footer]);

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

		if (!this.dataColorsSettings.schemeColors && [ColorPaletteType.Sequential, ColorPaletteType.Diverging, ColorPaletteType.Qualitative].includes(this.dataColorsSettings.fillType)) {
			this.dataColorsSettings.schemeColors = COLORBREWER[this.dataColorsSettings.fillType][this.dataColorsSettings.colorScheme];
		}

		const clonedRankingSettings = cloneDeep(this.rankingSettings ? this.rankingSettings : {});
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

		this.beforeIBCSSettings = JSON.parse(formatTab[EVisualConfig.Editor][EVisualSettings.BeforeIBCSSettings]);

		this.beforeTemplateSettings = JSON.parse(formatTab[EVisualConfig.Editor][EVisualSettings.BeforeTemplateSettings]);

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

		const templateConfig = JSON.parse(
			formatTab[EVisualConfig.TemplatesConfig][EVisualSettings.TemplatesSettings]
		);
		this.templateSettings = {
			...TEMPLATES_SETTINGS,
			...templateConfig,
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
		if (this.isSmallMultiplesEnabled && this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform && this.smallMultiplesSettings.xAxisPosition === ESmallMultiplesXAxisPosition.FrozenTopColumn) {
			this.xAxisSettings.position = Position.Top;
		}

		this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;
		this.xGridSettings = this.gridSettings.xGridLines;
		this.yGridSettings = this.gridSettings.yGridLines;

		const marker1Style = this.markerSettings.marker1Style;
		const marker2Style = this.markerSettings.marker2Style;

		this.isShowMarker1OutlineColor = marker1Style.isShowMarkerOutline && !marker1Style.sameOutlineAsMarkerColor && marker1Style.showOutlineOnly;

		if (this.markerSettings.markerType === EMarkerTypes.SHAPE
			&& marker1Style.markerShape === EMarkerShapeTypes.DEFAULT
		) {
			if (marker1Style.dropdownMarkerType === EMarkerDefaultShapes.VTRIANGLE && this.isHorizontalChart) {
				this.markerSettings.marker1Style.dropdownMarkerType = EMarkerDefaultShapes.HTRIANGLE;
			}

			if (marker1Style.dropdownMarkerType === EMarkerDefaultShapes.HTRIANGLE && !this.isHorizontalChart) {
				this.markerSettings.marker1Style.dropdownMarkerType = EMarkerDefaultShapes.VTRIANGLE;
			}
		}

		if (this.markerSettings.markerType === EMarkerTypes.SHAPE
			&& marker2Style.markerShape === EMarkerShapeTypes.DEFAULT
		) {
			if (marker2Style.dropdownMarkerType === EMarkerDefaultShapes.VTRIANGLE && this.isHorizontalChart) {
				this.markerSettings.marker2Style.dropdownMarkerType = EMarkerDefaultShapes.HTRIANGLE;
			}

			if (marker2Style.dropdownMarkerType === EMarkerDefaultShapes.HTRIANGLE && !this.isHorizontalChart) {
				this.markerSettings.marker2Style.dropdownMarkerType = EMarkerDefaultShapes.VTRIANGLE;
			}
		}

		if (marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && !marker1Style.markerShapeBase64Url) {
			this.markerSettings.marker1Style.markerShape = EMarkerShapeTypes.DEFAULT;
		}

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

		this.schemeColors = cloneDeep(this.dataColorsSettings.schemeColors);

		this.data1LabelsSettings = this.dataLabelsSettings.measure1;
		this.data2LabelsSettings = this.dataLabelsSettings.measure2;

		if (!this.dataColorsSettings.reverse) {
			this.dataColorsSettings.schemeColors = cloneDeep(this.schemeColors.reverse());
		}

		if (this.data1LabelsSettings.placement === DataLabelsPlacement.Inside && this.data1LabelsSettings.textColorTypes !== EInsideTextColorTypes.CONTRAST && !this.data1LabelsSettings.isTextColorTypeChanged) {
			this.data1LabelsSettings.textColorTypes = EInsideTextColorTypes.CONTRAST;
		}

		if (this.data2LabelsSettings.placement === DataLabelsPlacement.Inside && this.data2LabelsSettings.textColorTypes !== EInsideTextColorTypes.CONTRAST && !this.data2LabelsSettings.isTextColorTypeChanged) {
			this.data2LabelsSettings.textColorTypes = EInsideTextColorTypes.CONTRAST;
		}

		this.isBottomXAxis = this.xAxisSettings.position === Position.Bottom;
		this.isLeftYAxis = this.yAxisSettings.position === Position.Left;

		if (this.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && this.isLollipopTypePie) {
			this.dynamicDeviationSettings.displayType = EDynamicDeviationDisplayTypes.FirstToLast;
		}

		if (marker1Style.markerShape !== EMarkerShapeTypes.DEFAULT) {
			marker1Style.isShowMarkerOutline = false;
		}

		if (marker2Style.markerShape !== EMarkerShapeTypes.DEFAULT) {
			marker2Style.isShowMarkerOutline = false;
		}

		this.marker1OutlineWidth = marker1Style.isShowMarkerOutline ? marker1Style.outlineWidth : 0;
		this.marker2OutlineWidth = marker2Style.isShowMarkerOutline ? marker2Style.outlineWidth : 0;

		if (this.numberSettings.decimalPlaces < 0) {
			this.numberSettings.decimalPlaces = 0;
		}

		this.isLollipopTypeCircle = !this.isHasSubcategories || (this.markerSettings.markerType === EMarkerTypes.SHAPE || (this.isHasMultiMeasure ? false : marker1Style.markerShape !== EMarkerShapeTypes.DEFAULT));
		this.isLollipopTypePie = this.isHasSubcategories && this.markerSettings.markerType === EMarkerTypes.CHART && (this.isHasMultiMeasure ? true : marker1Style.markerShape === EMarkerShapeTypes.DEFAULT);

		if (this.isLollipopTypeCircle) {
			this.config.CFConfig.isShowCategoriesTypeDropdown = false;
		} else {
			this.config.CFConfig.isShowCategoriesTypeDropdown = true;
		}

		if (this.isShowImageMarker1 || this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON) {
			this.lineSettings.isApplyMarkerColor = false;
		}

		// if (this.rankingSettings.isRankingEnabled) {
		// 	this.setChartDataByRanking();
		// }
	}

	setVisualPatternData(): void {
		if (this.isLollipopTypeCircle && !this.isHasMultiMeasure) {
			this.chartData.forEach((d) => {
				d.pattern = this.patternSettings.categoryPatterns.find((p) => p.name === d.category);
			});
		}

		if ((this.isLollipopTypePie && this.isHasMultiMeasure && this.patternSettings.basedOn === EPatternByDataTypes.BySubCategory) ||
			(this.isLollipopTypePie && !this.isHasMultiMeasure)) {
			this.chartData.forEach((d) => {
				d.subCategories.forEach((s) => {
					s.pattern = this.patternSettings.subCategoryPatterns.find((p) => p.name === s.category);
				});
			});
		}
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
			.range(this.isHorizontalChart ? [0, 1] : [1, 0]);

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
			if (this.markerSettings.marker1Style.isShowMarkerOutline && !this.markerSettings.marker1Style.sameOutlineAsMarkerColor && this.markerSettings.marker1Style.showOutlineOnly) {
				this.categoricalDataPairs.forEach((data, i) => {
					this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = this.markerSettings.marker1Style.outlineColor;
					this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = this.markerSettings.marker1Style.outlineColor;
				});
			} else {
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
								} else {
									this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker1] = this.dataColorsSettings.singleColor1;
									this.categoryColorPairWithIndex[`${i}-${data.category}`][EMarkerColorTypes.Marker2] = this.dataColorsSettings.singleColor1;
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
									if (this.categoryColorPairWithIndex[`${i}-${data.category}`]) {
										this.categoryColorPairWithIndex[`${i}-${data.category}`][`marker${j + 1}Color`] = color;
									}
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
		}

		setMarkerColor(marker, markerSeqColorsArray);

		this.categoricalDataPairs.forEach((d, i) => {
			this.categoryColorPair[d.category] = this.categoryColorPairWithIndex[`${i}-${d.category}`];
			this.CFCategoryColorPair[d.category] = { isMarker1Color: false, isMarker2Color: false, isLineColor: false, isLabelColor: false };
		});

		if (this.isSmallMultiplesEnabled && this.isCurrentSmallMultipleIsOthers && this.dataColorsSettings.isCustomizeSMOthersColor && this.rankingSettings.smallMultiples.enabled && this.rankingSettings.smallMultiples.showRemainingAsOthers) {
			const othersColor = this.dataColorsSettings.SMOthersColor;
			this.categoricalDataPairs.forEach((d) => {
				this.categoryColorPair[d.category].marker1Color = othersColor;
				this.categoryColorPair[d.category].marker2Color = othersColor;
				this.CFCategoryColorPair[d.category] = { isMarker1Color: false, isMarker2Color: false, isLineColor: false, isLabelColor: false };
			});
		}

		if (this.rankingSettings.category.enabled) {
			if (this.rankingSettings.category.showRemainingAsOthers && this.categoryColorPair[this.othersBarText] && this.dataColorsSettings.isCustomizeOthersColor) {
				this.categoryColorPair[this.othersBarText].marker1Color = this.dataColorsSettings.othersColor;
				this.categoryColorPair[this.othersBarText].marker2Color = this.dataColorsSettings.othersColor;
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
			if (this.isShowMarker1OutlineColor) {
				this.categoricalDataPairs.forEach(d => {
					this.subCategoriesName.forEach((data, i) => {
						this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = this.markerSettings.marker1Style.outlineColor;
						this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker2] = this.markerSettings.marker1Style.outlineColor;
					});
				});
			} else {
				this.categoricalDataPairs.forEach(d => {
					switch (marker.fillType) {
						case ColorPaletteType.Single: {
							this.subCategoriesName.forEach((data, i) => {
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = marker.singleColor1;
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker2] = marker.singleColor2;
							});
							break;
						}
						case ColorPaletteType.PowerBi: {
							this.subCategoriesName.forEach((data, i) => {
								const color = this.colorPalette.getColor(data).value;
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = color;
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker2] = color;
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
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = getMarkerColor(index);
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker2] = getMarkerColor(index);
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
									this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = categoryColors[data][EMarkerColorTypes.Marker1];
								}
							});
							break;
						}
						case ColorPaletteType.BySubCategory: {
							const subCategoryColors = marker.subCategoryColors.reduce((obj, cur) => {
								obj[cur.name] = { markerColor: cur.marker };
								return obj;
							}, {});
							this.categoricalDataPairs.forEach(d => {
								this.subCategoriesName.forEach((s, i) => {
									if (subCategoryColors[s]) {
										const color = subCategoryColors[s]["markerColor"];
										this.subCategoryColorPairWithIndex[`${i}-${d.category}-${s}`][EMarkerColorTypes.Marker1] = color;
										this.subCategoryColorPairWithIndex[`${i}-${d.category}-${s}`][EMarkerColorTypes.Marker2] = color;
									} else {
										this.subCategoryColorPairWithIndex[`${i}-${d.category}-${s}`][EMarkerColorTypes.Marker1] = this.dataColorsSettings.singleColor1;
										this.subCategoryColorPairWithIndex[`${i}-${d.category}-${s}`][EMarkerColorTypes.Marker2] = this.dataColorsSettings.singleColor1;
									}
								});
							})
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
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker1] = getMarkerColor(i);
								this.subCategoryColorPairWithIndex[`${i}-${d.category}-${data}`][EMarkerColorTypes.Marker2] = getMarkerColor(i);
							});
						}
					}
				});
			}
		}

		setMarkerColor(marker, markerSeqColorsArray);

		this.categoricalDataPairs.forEach(d => {
			this.subCategoriesName.forEach((c, i) => {
				this.subCategoryColorPair[`${d.category}-${c}`] = this.subCategoryColorPairWithIndex[`${i}-${d.category}-${c}`];
				this.CFSubCategoryColorPair[`${d.category}-${c}`] = { isMarker1Color: false, isMarker2Color: false, isLineColor: false, isLabelColor: false };
			});
		});
	}

	setChartWidthHeight(): void {
		this.width = this.viewPortWidth - this.margin.left - this.margin.right - this.settingsBtnWidth - this.legendViewPort.width;
		this.height =
			this.viewPortHeight - this.margin.bottom - this.margin.top - this.settingsBtnHeight - (this.isSmallMultiplesEnabled ? 0 : this.legendViewPort.height) - this.footerHeight;
	}

	displayBrush(isShowXAxis: boolean, isShowYAxis: boolean, isShowHorizontalBrush: boolean, isShowVerticalBrush: boolean): void {
		if (this.isHorizontalChart) {
			const newHeight = (this.brushScaleBandBandwidth * this.height) / this.brushScaleBand.bandwidth();
			if (this.height < newHeight || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = true;

				this.drawVerticalBrush(this.categoricalData, this.brushScaleBandBandwidth, this.totalLollipopCount, isShowXAxis, isShowYAxis);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
				d3.select(this.hostContainer).on("wheel", undefined);
			}
		} else {
			const newWidth = (this.brushScaleBandBandwidth * this.width) / this.brushScaleBand.bandwidth();
			if (this.width < newWidth || this.brushAndZoomAreaSettings.enabled) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				this.isVerticalBrushDisplayed = false;

				const brushXPos = this.margin.left ? this.margin.left : 0;
				const brushYPos = this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - (this.isSmallMultiplesEnabled ? 0 : this.legendViewPort.height) - this.footerHeight;

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: brushXPos,
					brushYPos: brushYPos,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: this.width,
					scaleHeight: this.height,
					smallMultiplesGridItemId: this.smallMultiplesGridItemId,
					categoricalData: this.categoricalData,
					isShowXAxis,
					isShowYAxis,
					isShowHorizontalBrush
				};

				this.drawHorizontalBrush(this, config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();

				const smallMultiplesGridItemContent = this.smallMultiplesGridItemContent[this.smallMultiplesGridItemId];
				(this.isSmallMultiplesEnabled && this.isHasSmallMultiplesData ? d3.select(smallMultiplesGridItemContent.svg) : this.svg).on("wheel", undefined);
			}
		}
	}

	drawVerticalBrush(categoricalData: powerbi.DataViewCategorical, barDistance: number, totalBarsCount: number, isShowXAxis: boolean, isShowYAxis: boolean): void {
		categoricalData = cloneDeep(categoricalData);
		const yScaleDomain = this.brushScaleBand.domain();
		this.brushScaleBand.range(this.yScale.range());
		let isBrushRendered: boolean = false;

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

				const categoricalData2 = cloneDeep(categoricalData);

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				// this.sortSubcategoryData(categoricalData2);
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.configLegend();

				this.initAndRenderLollipopChart(categoricalData2, this.viewPortWidth * this.yAxisTicksMaxWidthRatio, this.height, isShowXAxis, isShowYAxis);

				isBrushRendered = true;
			} else {
				isBrushRendered = false;
				this.isScrollBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.brushWidth = 0;
				this.brushMargin = 0;
				this.drawXYAxis(this.categoricalData, isShowXAxis, isShowYAxis);
			}
		};

		const brush = d3
			.brushY()
			.extent([
				[0, 0],
				[this.brushWidth, this.height],
			])
			.on("brush", brushed);

		const expectedBar = this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.minLollipopCount : Math.ceil(this.height / barDistance);
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

		const scrolled = false;
		if (this.isScrollBrushDisplayed && isBrushRendered) {
			d3.select(this.hostContainer).on("wheel", (event, d) => {
				if (!scrolled && isBrushRendered) {
					// scrolled = true;
					const prevExtent = d3.brushSelection(this.brushG.node() as any);
					const direction = event.wheelDelta < 0 ? 'down' : 'up';
					const isBottomDirection = direction === "down";
					if (this.isHorizontalChart) {
						if (isBottomDirection) {
							if (prevExtent![1] as number < this.height) {
								if ((+prevExtent![1] + heightByExpectedBar) <= this.height) {
									this.brushG
										.call(brush.move as any, [+prevExtent![0] + (heightByExpectedBar / expectedBar), +prevExtent![1] + (heightByExpectedBar / expectedBar)]);
								} else {
									this.brushG
										.call(brush.move as any, [this.height - heightByExpectedBar, this.height]);
								}
							}
						} else {
							if (prevExtent![0] as number > 0) {
								if (((+prevExtent![0] - heightByExpectedBar) >= 0) && ((+prevExtent![1] - heightByExpectedBar) >= 0)) {
									this.brushG
										.call(brush.move as any, [+prevExtent![0] - (heightByExpectedBar / expectedBar), +prevExtent![1] - (heightByExpectedBar / expectedBar)]);
								} else {
									this.brushG
										.call(brush.move as any, [0, heightByExpectedBar]);
								}
							}
						}
					}
					// setTimeout(() => { scrolled = false; });
				}
			});
		}

		this.brushG.select(".overlay")
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.trackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.trackBackgroundColor)
			.attr("cursor", this.brushAndZoomAreaSettings.enabled ? "crosshair" : "default")
			.attr("pointer-events", this.brushAndZoomAreaSettings.enabled ? "auto" : "none");

		this.brushG.select(".selection")
			.attr("fill-opacity", "1")
			.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBackgroundColor)
			.attr("stroke", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBorderColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBorderColor);
	}

	initAndRenderLollipopChart(categoricalData: powerbi.DataViewCategorical, scaleWidth: number, scaleHeight: number, isShowXAxis: boolean, isShowYAxis: boolean): void {
		// if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
		// 	this.setRemainingAsOthersDataColor();
		// }

		if (this.conditionalFormattingConditions.length) {
			this.setConditionalFormattingColor();
		}

		if (this.isExpandAllApplied) {
			this.expandAllCategoriesName.forEach((d) => {
				this[`${d}Scale`].domain(this[`${d}ScaleNewDomain`]);
			});
		}

		if (this.isCutAndClipAxisEnabled) {
			if (!this.isHorizontalChart) {
				this.yAxisG.selectAll(".domain").remove();
				this.yAxisG.selectAll(".tick").remove();
			} else {
				this.xAxisG.selectAll(".domain").remove();
				this.xAxisG.selectAll(".tick").remove();
			}
		}

		this.drawXYAxis(categoricalData, isShowXAxis, isShowYAxis);

		if (this.isExpandAllApplied) {
			if (!this.isHorizontalChart) {
				CallExpandAllXScaleOnAxisGroup(this, scaleWidth);
			}

			// if (this.isHorizontalChart) {
			// 	CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
			// }
		}

		if (this.isLogarithmScale && this.isShowPositiveNegativeLogScale) {
			if (this.isHorizontalChart) {
				this.xScale = GetPositiveNegativeLogXScale.bind(this);
			} else {
				this.yScale = GetPositiveNegativeLogYScale.bind(this);
			}
		}

		this.drawCutAndClipAxis();

		this.drawXGridLines();
		this.drawYGridLines();

		this.drawLollipopChart();
	}

	drawHorizontalBrush(self: Visual, config: IBrushConfig): void {
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const totalBarsCount: number = config.totalBarsCount;
		const scaleWidth: number = config.scaleWidth;
		let categoricalData: any = cloneDeep(config.categoricalData);
		let isBrushRendered: boolean = false;

		let brushG: SVGElement = config.brushG;

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

			const smallMultiplesGridItemContent = self.smallMultiplesGridItemContent[config.smallMultiplesGridItemId];

			const xScale = smallMultiplesGridItemContent ? smallMultiplesGridItemContent.xScale : this.xScale;
			const xScaleDomain = smallMultiplesGridItemContent ? smallMultiplesGridItemContent.brushScaleBand.domain() : this.brushScaleBand.domain();
			categoricalData = smallMultiplesGridItemContent ? cloneDeep(smallMultiplesGridItemContent.categoricalData) : cloneDeep(config.categoricalData);
			this.brushScaleBand = smallMultiplesGridItemContent ? smallMultiplesGridItemContent.brushScaleBand : this.brushScaleBand;

			this.brushScaleBand.range(xScale.range());

			brushG = smallMultiplesGridItemContent ? smallMultiplesGridItemContent.brushG : config.brushG;

			const newXScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = xScale.range();

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

				const categoricalData2 = cloneDeep(categoricalData);

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				// this.sortSubcategoryData(categoricalData2);
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.configLegend();

				if (smallMultiplesGridItemContent) {
					if (this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Individual) {
						this.xAxisG = d3.select(smallMultiplesGridItemContent.xAxisG);
					}

					if (this.smallMultiplesSettings.yAxisType === ESmallMultiplesAxisType.Individual) {
						this.yAxisG = d3.select(smallMultiplesGridItemContent.yAxisG);
					}

					this.lollipopG = smallMultiplesGridItemContent.lollipopG;
					this.dataLabels1G = smallMultiplesGridItemContent.dataLabels1G;
					this.dataLabels2G = smallMultiplesGridItemContent.dataLabels2G;
					this.referenceLineLayersG = smallMultiplesGridItemContent.referenceLineLayersG;
					this.referenceLinesContainerG = smallMultiplesGridItemContent.referenceLinesContainerG;
					this.xGridLinesG = smallMultiplesGridItemContent.xGridLinesG;
					this.yGridLinesG = smallMultiplesGridItemContent.yGridLinesG;
					this.dynamicDeviationG = smallMultiplesGridItemContent.dynamicDeviationG;
					this.zeroSeparatorLine = smallMultiplesGridItemContent.zeroSeparatorLine;
					this.connectingLineG = smallMultiplesGridItemContent.connectingLineG;
					this.errorBarsContainer = smallMultiplesGridItemContent.errorBarsContainer;
					this.errorBarsMarkerDefsG = smallMultiplesGridItemContent.errorBarsMarkerDefsG;
					this.errorBarsAreaG = smallMultiplesGridItemContent.errorBarsAreaG;
					this.errorBarsAreaPath = smallMultiplesGridItemContent.errorBarsAreaPath;
					this.errorBarsLinesDashG = smallMultiplesGridItemContent.errorBarsLinesDashG;
					this.errorBarsLinesG = smallMultiplesGridItemContent.errorBarsLinesG;
					this.errorBarsMarkersG = smallMultiplesGridItemContent.errorBarsMarkersG;
					this.errorBarsMarkerDef = smallMultiplesGridItemContent.errorBarsMarkerDef;
					this.errorBarsMarker = smallMultiplesGridItemContent.errorBarsMarker;
					this.errorBarsMarkerPath = smallMultiplesGridItemContent.errorBarsMarkerPath;

					this.initAndRenderLollipopChart(categoricalData2, scaleWidth, this.height, config.isShowXAxis, config.isShowYAxis);
				} else {
					this.initAndRenderLollipopChart(categoricalData2, scaleWidth, this.height, config.isShowXAxis, config.isShowYAxis);
				}

				isBrushRendered = true;
			} else {
				isBrushRendered = false;
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushHeight = 0;
				this.drawXYAxis(this.categoricalData, config.isShowXAxis, config.isShowYAxis);
			}
		};

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[this.width, this.brushHeight - (this.brushAndZoomAreaSettings.enabled ? 2 : 0)],
			])
			.on("brush", brushed);

		const expectedBar = this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.minLollipopCount : Math.ceil(scaleWidth / barDistance);
		const totalBar = totalBarsCount;
		let widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

		widthByExpectedBar = widthByExpectedBar > this.width ? this.width : widthByExpectedBar;

		d3.select(brushG)
			.attr("transform", `translate(${this.margin.left ? this.margin.left : 0}, ${brushYPos - this.brushXAxisTicksMaxHeight - ((this.brushAndZoomAreaSettings.enabled ? 2 : 0))})`)
			.attr("display", config.isShowHorizontalBrush ? "block" : "none")
			.call(brush as any)
			.call(brush.move as any, [0, widthByExpectedBar]);

		const smallMultiplesGridItemContent = self.smallMultiplesGridItemContent[config.smallMultiplesGridItemId];

		let scrolled = false;
		if (this.isScrollBrushDisplayed && isBrushRendered) {
			(self.isSmallMultiplesEnabled && self.isHasSmallMultiplesData ? d3.select(smallMultiplesGridItemContent.svg) : this.svg).on("wheel", (event, d) => {
				if (!scrolled && isBrushRendered) {
					scrolled = true;
					const prevExtent = d3.brushSelection(brushG as any);
					const direction = event.wheelDelta < 0 ? 'up' : 'down';
					const isRightDirection = direction === "up";
					if (!self.isHorizontalChart) {
						const movableWidth = widthByExpectedBar / 2;
						if (isRightDirection) {
							if (prevExtent![1] as number < scaleWidth) {
								if ((+prevExtent![1] + movableWidth) <= scaleWidth) {
									d3.select(brushG)
										.call(brush.move as any, [+prevExtent![0] + movableWidth, +prevExtent![1] + movableWidth]);
								} else {
									d3.select(brushG)
										.call(brush.move as any, [scaleWidth - widthByExpectedBar, scaleWidth]);
								}
							}
						} else {
							if (prevExtent![0] as number > 0) {
								if (((+prevExtent![0] - movableWidth) >= 0) && ((+prevExtent![1] - movableWidth) >= 0)) {
									d3.select(brushG)
										.call(brush.move as any, [+prevExtent![0] - movableWidth, +prevExtent![1] - movableWidth]);
								} else {
									d3.select(brushG)
										.call(brush.move as any, [0, widthByExpectedBar]);
								}
							}
						}
					}
					setTimeout(() => { scrolled = false; });
				}
			});
		}

		if (config.isShowHorizontalBrush) {
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
				.attr("fill-opacity", "1")
				.attr("fill", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBackgroundColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBackgroundColor)
				.attr("stroke", this.brushAndZoomAreaSettings.enabled ? this.brushAndZoomAreaSettings.selectionTrackBorderColor : BRUSH_AND_ZOOM_AREA_SETTINGS.selectionTrackBorderColor);
		}
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
		const dataLabelsSettings = isData2Label ? this.data2LabelsSettings : this.data1LabelsSettings;
		const circleRadius = isData2Label ? this.circle2Size / 2 : this.circle1Size / 2;
		if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			return dataLabelsSettings.fontSize;
		}
		if (dataLabelsSettings.isAutoFontSize) {
			const fontSize = circleRadius * 0.7;
			// dataLabelsSettings.fontSize = fontSize;
			return fontSize;
		} else {
			return dataLabelsSettings.fontSize;
		}
	}

	setDataLabelsFormatting(labelSelection: D3Selection<SVGElement>, textSelection: any, isData2Label: boolean = false, labelPlacement: DataLabelsPlacement, isBestFitPlacement: boolean): void {
		const dataLabelsSettings = isData2Label ? this.data2LabelsSettings : this.data1LabelsSettings;

		if (labelPlacement === DataLabelsPlacement.Outside && dataLabelsSettings.color === "rgba(93, 93, 93, 1)" && dataLabelsSettings.showBackground && !dataLabelsSettings.isColorChanged) {
			dataLabelsSettings.color = "rgba(255, 255, 255, 1)";
		}

		if (labelPlacement === DataLabelsPlacement.Outside && dataLabelsSettings.color === "rgba(255, 255, 255, 1)" && !dataLabelsSettings.showBackground && !dataLabelsSettings.isColorChanged) {
			dataLabelsSettings.color = "rgba(93, 93, 93, 1)";
		}

		if (labelPlacement === DataLabelsPlacement.Inside && dataLabelsSettings.color === "rgba(255, 255, 255, 1)" && !dataLabelsSettings.showBackground && !dataLabelsSettings.isColorChanged) {
			dataLabelsSettings.color = "rgba(93, 93, 93, 1)";
		}

		if (labelPlacement === DataLabelsPlacement.Inside && !dataLabelsSettings.isShowBackgroundChange && dataLabelsSettings.textColorTypes === EInsideTextColorTypes.CONTRAST) {
			dataLabelsSettings.showBackground = true;
		}

		if (labelPlacement === DataLabelsPlacement.Outside && !dataLabelsSettings.isShowBackgroundChange && dataLabelsSettings.showBackground) {
			dataLabelsSettings.showBackground = false;
		}

		if (labelPlacement === DataLabelsPlacement.Inside && dataLabelsSettings.textColorTypes === EInsideTextColorTypes.FIXED) {
			if (!dataLabelsSettings.isColorChanged) {
				dataLabelsSettings.color = "rgba(255, 255, 255, 1)";
			}

			if (!dataLabelsSettings.isShowBackgroundChange) {
				dataLabelsSettings.showBackground = false;
			}
		}

		if (labelPlacement === DataLabelsPlacement.Inside && this.isLollipopTypePie && !dataLabelsSettings.isColorChanged) {
			dataLabelsSettings.color = "rgba(255, 255, 255, 1)";
		}

		if (labelPlacement === DataLabelsPlacement.Outside && dataLabelsSettings.color === "rgba(255, 255, 255, 1)" && !dataLabelsSettings.showBackground && !dataLabelsSettings.isColorChanged) {
			dataLabelsSettings.color = "rgba(93, 93, 93, 1)";
		}

		const isAutoFontColor = dataLabelsSettings.textColorTypes === EInsideTextColorTypes.AUTO || dataLabelsSettings.textColorTypes === EInsideTextColorTypes.CONTRAST;
		const isAutoBGColor = dataLabelsSettings.textColorTypes === EInsideTextColorTypes.CONTRAST;

		const fontSize = ((isBestFitPlacement ? labelPlacement : dataLabelsSettings.placement) === DataLabelsPlacement.Inside) ? this.isLollipopTypeCircle ? this.getDataLabelsFontSize(isData2Label) : this.getPieDataLabelsFontSize(isData2Label) : dataLabelsSettings.fontSize;

		labelSelection
			.attr("class", "dataLabelG")
			.attr("display", "block")
			.attr("opacity", this.dataLabelsSettings.show ? "1" : "0")
		// .style("pointer-events", "none");

		textSelection
			.classed("dataLabelText", true)
			.attr("text-anchor", "middle")
			.attr("dy", "0.35em")
			.attr("font-size", fontSize)
			.style("font-family", dataLabelsSettings.fontFamily)
			.style("text-decoration", dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
			.text((d: ILollipopChartRow) => isData2Label ? d.data2Label : d.data1Label);

		if (labelPlacement === DataLabelsPlacement.Inside && this.isLollipopTypeCircle) {
			textSelection
				.attr("fill", d => {
					if (this.CFCategoryColorPair[d.category].isLabelColor) {
						return this.getColor(this.categoryColorPair[d.category] && this.categoryColorPair[d.category].labelColor ? this.categoryColorPair[d.category].labelColor : dataLabelsSettings.color, EHighContrastColorType.Foreground);
					} else {
						return this.getColor(isAutoFontColor ? invertColorByBrightness(rgbaToHex(this.categoryColorPair[d.category][isData2Label ? "marker2Color" : "marker1Color"]), true) : (this.categoryColorPair[d.category] && this.categoryColorPair[d.category].labelColor ? this.categoryColorPair[d.category].labelColor : dataLabelsSettings.color), EHighContrastColorType.Foreground)
					}
				});
		} else {
			textSelection
				.attr("fill", d => {
					const color = this.getColor(this.categoryColorPair[d.category] && this.categoryColorPair[d.category].labelColor ? this.categoryColorPair[d.category].labelColor : dataLabelsSettings.color, EHighContrastColorType.Foreground);
					if (this.isLollipopTypePie) {
						const str = `${d.category}-${((d.subCategories && d.subCategories.length) ? d.subCategories[0] : this.chartData[0].subCategories[0]).category}`;
						if (str && this.CFSubCategoryColorPair[str].isLabelColor) {
							return this.getColor(this.subCategoryColorPair[str] && this.subCategoryColorPair[str].labelColor ? this.subCategoryColorPair[str].labelColor : dataLabelsSettings.color, EHighContrastColorType.Foreground);
						} else {
							return color;
						}
					} else {
						return color;
					}
				});
		}

		if (labelPlacement === DataLabelsPlacement.Inside) {
			let textShadow = labelSelection.select(".dataLabelTextShadow");

			if (this.isLollipopTypePie) {
				// textShadow.style("display", "none");
			}

			// if (this.isLollipopTypeCircle) {
			if (!textShadow.node()) {
				textShadow = textSelection.clone(true);
				textShadow.lower();
			}

			textShadow
				.text((d: ILollipopChartRow) => isData2Label ? d.data2Label : d.data1Label)
				.attr("class", "dataLabelTextShadow")
				.attr("text-anchor", "middle")
				.attr("dy", "0.35em")
				.attr("font-size", fontSize)
				.style("font-family", dataLabelsSettings.fontFamily)
				.style("text-decoration", dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
				.style("font-weight", dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
				.style("font-style", dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
				.attr("stroke", d => {
					if (this.isLollipopTypeCircle) {
						return this.getColor(isAutoBGColor ? invertColorByBrightness(rgbaToHex(this.categoryColorPair[d.category][isData2Label ? "marker2Color" : "marker1Color"]), true, true) : dataLabelsSettings.backgroundColor, EHighContrastColorType.Background);
					} else {
						return this.getColor(dataLabelsSettings.backgroundColor, EHighContrastColorType.Background);
					}
				})
				.attr("stroke-width", 3)
				.attr("stroke-linejoin", "round")
				.style("text-anchor", "middle")
				.style("display", d => {
					if (dataLabelsSettings.showBackground) {
						if (this.isPatternApplied && dataLabelsSettings.textColorTypes !== EInsideTextColorTypes.CONTRAST) {
							if (dataLabelsSettings.applyFor === EDataLabelsBGApplyFor.ONLY_PATTERNS) {
								let pattern = d.pattern;
								if ((this.isHasMultiMeasure || (this.isLollipopTypePie && this.dataColorsSettings.fillType === ColorPaletteType.Single)) && this.isPatternApplied) {
									pattern = isData2Label ? this.patternByMeasures[DataValuesType.Value2] : this.patternByMeasures[DataValuesType.Value1];
								}
								if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
									return "block";
								} else {
									return "none";
								}
							} else if (dataLabelsSettings.applyFor === EDataLabelsBGApplyFor.All) {
								return "block"
							}
						} else {
							return "block";
						}
					} else {
						return "none";
					}
				});
			// }
		}

		if (labelPlacement === DataLabelsPlacement.Outside) {
			let textShadow = labelSelection.select(".dataLabelTextShadow");

			if (!textShadow.node()) {
				textShadow = textSelection.clone(true);
				textShadow.lower();
			}

			textShadow
				.text((d: ILollipopChartRow) => isData2Label ? d.data2Label : d.data1Label)
				.attr("class", "dataLabelTextShadow")
				.attr("text-anchor", "middle")
				.attr("dy", "0.35em")
				.attr("font-size", fontSize)
				.style("font-family", dataLabelsSettings.fontFamily)
				.style("text-decoration", dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
				.style("font-weight", dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
				.style("font-style", dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
				.attr("stroke", this.getColor(dataLabelsSettings.backgroundColor, EHighContrastColorType.Background))
				.attr("stroke-width", 3)
				.attr("stroke-linejoin", "round")
				.style("text-anchor", "middle")
				.style("display", dataLabelsSettings.showBackground ? "block" : "none");
		}
	}

	getDataLabelXY(d: ILollipopChartRow, isPie2: boolean = false): { x: number; y: number } {
		let x = 0;
		let y = 0;

		if (this.isHorizontalChart) {
			if (d.value1 >= d.value2 || !this.isHasMultiMeasure) {
				x = this.getXPosition(isPie2 ? d.value2 : d.value1);
				y = this.getYPosition(d.category) + this.scaleBandWidth / 2;
			} else {
				x = this.getXPosition(isPie2 ? d.value2 : d.value1);
				y = this.getYPosition(d.category) + this.scaleBandWidth / 2;
			}
		} else {
			if ((this.xAxisSettings.position === Position.Bottom && d.value1 < d.value2) ||
				(this.xAxisSettings.position === Position.Top && d.value1 > d.value2)) {
				x = this.getXPosition(d.category) + this.scaleBandWidth / 2;
				y = this.getYPosition(isPie2 ? d.value2 : d.value1)
			} else {
				x = this.getXPosition(d.category) + this.scaleBandWidth / 2;
				y = this.getYPosition(isPie2 ? d.value2 : d.value1)

			}
		}
		return { x, y };
	}

	transformData1LabelOutside(labelSelection: any, isEnter: boolean, isBestFitOutside: boolean = false): void {
		const dataLabelsSettings = this.data1LabelsSettings;
		const markerSize = this.isLollipopTypeCircle ? this.circle1Size / 2 : this.pie1Radius;

		const fn = (d, bBox): { translate: string, x: number, y: number } => {
			if (this.isHorizontalChart) {
				const labelDistance = 7;
				const XY = this.getDataLabelXY(d, false);
				const x = XY.x;
				const y = XY.y;
				if (
					((this.yAxisSettings.position === Position.Left) && (this.xAxisSettings.isInvertRange && !this.isHasMultiMeasure ? d.value1 <= d.value2 : d.value1 >= d.value2)) ||
					(this.yAxisSettings.position === Position.Right && (this.xAxisSettings.isInvertRange && !this.isHasMultiMeasure ? d.value1 >= d.value2 : d.value1 <= d.value2))
				) {
					// const xPos = isBestFitOutside ? x - bBox.width / 2 - markerSize - labelDistance : x + bBox.width / 2 + markerSize + labelDistance;
					const xPos = x + bBox.width / 2 + markerSize + labelDistance;
					const yPos = y;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				} else {
					// const xPos = isBestFitOutside ? x + bBox.width / 2 + markerSize + labelDistance : x - bBox.width / 2 - markerSize - labelDistance;
					const xPos = x - bBox.width / 2 - markerSize - labelDistance;
					const yPos = y;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				}
			} else {
				const labelDistance = 12;
				const XY = this.getDataLabelXY(d, false);
				const x = XY.x;
				const y = XY.y;

				if (
					(this.xAxisSettings.position === Position.Bottom && (this.yAxisSettings.isInvertRange && !this.isHasMultiMeasure ? d.value1 <= d.value2 : d.value1 >= d.value2)) ||
					(this.xAxisSettings.position === Position.Top && (this.yAxisSettings.isInvertRange && !this.isHasMultiMeasure ? d.value1 >= d.value2 : d.value1 <= d.value2))
				) {
					const xPos = x;
					const yPos = y - markerSize - labelDistance;
					// const yPos = isBestFitOutside ? y + markerSize + labelDistance : y - markerSize - labelDistance;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				} else {
					const xPos = x;
					const yPos = y + markerSize + labelDistance;
					// const yPos = isBestFitOutside ? y - markerSize - labelDistance : y + markerSize + labelDistance;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
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

	transformData2LabelOutside(labelSelection: any, isEnter: boolean, isBestFitOutside: boolean = false): void {
		const dataLabelsSettings = this.data2LabelsSettings;
		const markerSize = this.isLollipopTypeCircle ? this.circle2Size / 2 : this.pie2Radius;

		const fn = (d, bBox): { translate: string, x: number, y: number } => {
			if (this.isHorizontalChart) {
				const labelDistance = 7;
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;

				if (
					(this.yAxisSettings.position === Position.Left && d.value1 <= d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 >= d.value2)
				) {
					const xPos = x + bBox.width / 2 + markerSize + labelDistance;
					// const xPos = isBestFitOutside ? x - bBox.width / 2 - markerSize - labelDistance : x + bBox.width / 2 + markerSize + labelDistance;
					const yPos = y;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				} else {
					const xPos = x - bBox.width / 2 - markerSize - labelDistance;
					// const xPos = isBestFitOutside ? x + bBox.width / 2 + markerSize + labelDistance : x - bBox.width / 2 - markerSize - labelDistance;
					const yPos = y;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				}
			} else {
				const labelDistance = 12;
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 <= d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 >= d.value2)
				) {
					const xPos = x;
					const yPos = y - markerSize - labelDistance;
					// const yPos = isBestFitOutside ? y + markerSize + labelDistance : y - markerSize - labelDistance;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
				} else {
					const xPos = x;
					const yPos = y + markerSize + labelDistance;
					// const yPos = isBestFitOutside ? y - markerSize - labelDistance : y + markerSize + labelDistance;
					return { translate: `translate(${xPos}, ${yPos}), rotate(${0})`, x: xPos, y: yPos };
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
			const xScaleDiff = this.isLollipopTypeCircle ? this.getCircleXScaleDiff(cx, isData2Label) : this.getPieXScaleDiff(cx, isData2Label);
			let x;

			if (!this.isLeftYAxis) {
				x = (this.isHorizontalChart ? cx - xScaleDiff : cx + this.scaleBandWidth / 2);
			} else {
				x = (this.isHorizontalChart ? cx + xScaleDiff : cx + this.scaleBandWidth / 2);
			}

			const cy = this.getYPosition(this.isHorizontalChart ? d.category : (isData2Label ? d.value2 : d.value1));
			const yScaleDiff = this.isLollipopTypeCircle ? this.getCircleYScaleDiff(cy, isData2Label) : this.getPieYScaleDiff(cy, isData2Label);
			let y;

			if (this.isBottomXAxis) {
				y = (!this.isHorizontalChart ? cy - yScaleDiff : cy + this.scaleBandWidth / 2);
			} else {
				y = (!this.isHorizontalChart ? cy + yScaleDiff : cy + this.scaleBandWidth / 2);
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
		const dataLabelsSettings = this.data1LabelsSettings;

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
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside, false);
					this.transformData1LabelOutside(dataLabelGSelection, true);
				} else {
					if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside, false);
						this.transformData1LabelOutside(dataLabelGSelection, true);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Inside, false);
						this.transformDataLabelInside(dataLabelGSelection, true, false);
					}
				}
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");
				const textSelection = dataLabelGSelection.select(".dataLabelText");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside, false);
					this.transformData1LabelOutside(dataLabelGSelection, false);
				} else {
					if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Outside, false);
						this.transformData1LabelOutside(dataLabelGSelection, false);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, false, DataLabelsPlacement.Inside, false);
						this.transformDataLabelInside(dataLabelGSelection, false, false);
					}
				}
			}
		);

		// this.dataLabels1G.selectAll(".dataLabelG").select("text").raise();

		this.dataLabels1G.selectAll(".dataLabelG")
			.each(function () {
				const ele = d3.select(this);
				const textEle = ele.select(".dataLabelText");
				const getBBox = (textEle.node() as SVGSVGElement).getBBox();
				const borderSize = dataLabelsSettings.showBackground ? 3 : 0;
				const isHideInsideLabel = (getBBox.width + borderSize) > THIS.markerMaxSize || (getBBox.height + borderSize) > THIS.markerMaxSize;

				ele
					.attr("opacity", (d: ILollipopChartRow) => {
						if (THIS.dataLabelsSettings.isShowBestFitLabels) {
							if (THIS.isHorizontalChart) {
								if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
									const isHideOutSideLabel = THIS.isLeftYAxis ? d.positions.dataLabel1X <= getBBox.width : d.positions.dataLabel1X + getBBox.width > THIS.width;
									if (isHideInsideLabel) {
										// if (!isHideOutSideLabel) {
										THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
										THIS.transformData1LabelOutside(ele, false, true);
										// } else {
										// 	return 0;
										// }
									} else {
										THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside, true);
										THIS.transformDataLabelInside(ele, false, false);
										return 1;
									}
								} else {
									if (THIS.isLeftYAxis) {
										if (d.positions.dataLabel1X <= getBBox.width) {
											// if (isHideInsideLabel) {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
											THIS.transformData1LabelOutside(ele, false, true);
											// } else {
											// 	return 0;
											// }
										}
									} else {
										if (d.positions.dataLabel1X + getBBox.width > THIS.width) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
											THIS.transformData1LabelOutside(ele, false, true);
											// }
										}
									}
								}
							} else {
								if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
									const isHideOutSideLabel = THIS.isBottomXAxis ? d.positions.dataLabel1Y + getBBox.height > THIS.height : d.positions.dataLabel1Y <= getBBox.height;
									if (isHideInsideLabel) {
										// if (!isHideOutSideLabel) {
										THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
										THIS.transformData1LabelOutside(ele, false, true);
										// } else {
										// 	return 0;
										// }
									} else {
										THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Inside, true);
										THIS.transformDataLabelInside(ele, false, false);
										return 1;
									}
								} else {
									if (THIS.isBottomXAxis) {
										if (d.positions.dataLabel1Y + getBBox.height > THIS.height) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
											THIS.transformData1LabelOutside(ele, false, true);
											// }
										}
									} else {
										if (d.positions.dataLabel1Y <= getBBox.height) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, false, DataLabelsPlacement.Outside, true);
											THIS.transformData1LabelOutside(ele, false, true);
											// }
										}
									}
								}
							}
						} else {
							if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
								return isHideInsideLabel ? 0 : 1;
							} else if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
								// if (THIS.isHorizontalChart) {
								// 	if (THIS.isLeftYAxis) {
								// 		return d.positions.dataLabel1X < 1 ? 0 : 1;
								// 	} else {
								// 		return d.positions.dataLabel1X + getBBox.width > THIS.width ? 0 : 1;
								// 	}
								// } else {
								// 	if (THIS.isBottomXAxis) {
								// 		return d.positions.dataLabel1Y + getBBox.height > THIS.height ? 0 : 1;
								// 	} else {
								// 		return d.positions.dataLabel1Y < 1 ? 0 : 1;
								// 	}
								// }
							}
						}

						return 1;
					});
			});
	}

	drawData2Labels(data: ILollipopChartRow[]): void {
		const THIS = this;
		const dataLabelsSettings = this.data2LabelsSettings;
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
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside, false);
					this.transformData2LabelOutside(dataLabelGSelection, true);
				} else {
					if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside, false);
						this.transformData2LabelOutside(dataLabelGSelection, true);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Inside, false);
						this.transformDataLabelInside(dataLabelGSelection, true, true);
					}
				}
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");
				const textSelection = dataLabelGSelection.select(".dataLabelText");

				if (this.dataLabelsSettings.isShowBestFitLabels) {
					this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside, false);
					this.transformData2LabelOutside(dataLabelGSelection, false);
				} else {
					if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Outside, false);
						this.transformData2LabelOutside(dataLabelGSelection, false);
					} else {
						this.setDataLabelsFormatting(dataLabelGSelection, textSelection, true, DataLabelsPlacement.Inside, false);
						this.transformDataLabelInside(dataLabelGSelection, false, true);
					}
				}
			}
		);

		// this.dataLabels2G.selectAll(".dataLabelG").select("text").raise();

		this.dataLabels2G
			.selectAll(".dataLabelG")
			.each(function () {
				const ele = d3.select(this);
				const textEle = ele.select(".dataLabelText");
				const getBBox = (textEle.node() as SVGSVGElement).getBBox();
				const borderSize = dataLabelsSettings.showBackground ? 3 : 0;
				const isHideInsideLabel = (getBBox.width + borderSize) > THIS.markerMaxSize || (getBBox.height + borderSize) > THIS.markerMaxSize;

				ele
					.attr("opacity", (d: ILollipopChartRow) => {
						if (THIS.dataLabelsSettings.isShowBestFitLabels) {
							if (THIS.isHorizontalChart) {
								if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
									const isHideOutSideLabel = THIS.isLeftYAxis ? d.positions.dataLabel2X <= getBBox.width : d.positions.dataLabel2X + getBBox.width > THIS.width;

									if (isHideInsideLabel) {
										// if (!isHideOutSideLabel) {
										THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
										THIS.transformData2LabelOutside(ele, false, true);
										// } else {
										// 	return 0;
										// }
									} else {
										THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside, true);
										THIS.transformDataLabelInside(ele, false, true);
										return 1;
									}
								} else {
									if (THIS.isLeftYAxis) {
										if (d.positions.dataLabel2X <= getBBox.width) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
											THIS.transformData2LabelOutside(ele, false, true);
											// }
										}
									} else {
										if (d.positions.dataLabel2X + getBBox.width > THIS.width) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
											THIS.transformData2LabelOutside(ele, false, true);
											// }
										}
									}
								}
							} else {
								const isHideOutSideLabel = THIS.isBottomXAxis ? d.positions.dataLabel2Y + getBBox.height > THIS.height : d.positions.dataLabel2Y <= getBBox.height;
								if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
									if (isHideInsideLabel) {
										// if (!isHideOutSideLabel) {
										THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
										THIS.transformData2LabelOutside(ele, false, true);
										// } else {
										// 	return 0;
										// }
									} else {
										THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Inside, true);
										THIS.transformDataLabelInside(ele, false, true);
										return 1;
									}
								} else {
									if (THIS.isBottomXAxis) {
										if (d.positions.dataLabel2Y + getBBox.height > THIS.height) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
											THIS.transformData2LabelOutside(ele, false, true);
											// }
										}
									} else {
										if (d.positions.dataLabel2Y <= getBBox.height) {
											// if (isHideInsideLabel) {
											// 	return 0;
											// } else {
											THIS.setDataLabelsFormatting(ele, textEle, true, DataLabelsPlacement.Outside, true);
											THIS.transformData2LabelOutside(ele, false, true);
											// }
										}
									}
								}
							}
						} else {
							if (dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
								return isHideInsideLabel ? 0 : 1;
							} else if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
								// if (THIS.isHorizontalChart) {
								// 	if (THIS.isLeftYAxis) {
								// 		return d.positions.dataLabel2X < 1 ? 0 : 1;
								// 	} else {
								// 		return 1;
								// 	}
								// } else {
								// 	if (THIS.isBottomXAxis) {
								// 		return d.positions.dataLabel2Y + getBBox.height > THIS.height ? 0 : 1;
								// 	} else {
								// 		return d.positions.dataLabel2Y < 1 ? 0 : 1;
								// 	}
								// }
							}
						}

						return 1;
					});
			});
	}

	drawTooltip(): void {
		this.tooltipServiceWrapper.addTooltip(
			d3.select(this.chartContainer).selectAll(this.circle1ClassSelector),
			(datapoint: any) => (this.isHasMultiMeasure ? getTooltipData(datapoint, true, true) : getTooltipData(datapoint, true, false)),
			(datapoint: any) => datapoint.identity
		);

		this.tooltipServiceWrapper.addTooltip(
			d3.select(this.chartContainer).selectAll(this.circle2ClassSelector),
			(datapoint: any) => (this.isHasMultiMeasure ? getTooltipData(datapoint, false, true) : getTooltipData(datapoint, false, false)),
			(datapoint: any) => datapoint.identity
		);

		this.tooltipServiceWrapper.addTooltip(
			d3.select(this.chartContainer).selectAll(".errorBar1G"),
			(datapoint: any) => (this.isHasMultiMeasure ? getTooltipData(datapoint, true, true) : getTooltipData(datapoint, true, false)),
			(datapoint: any) => datapoint.identity
		);

		if (this.isRenderBothErrorBars) {
			this.tooltipServiceWrapper.addTooltip(
				d3.select(this.chartContainer).selectAll(".errorBar2G"),
				(datapoint: any) => (this.isHasMultiMeasure ? getTooltipData(datapoint, false, true) : getTooltipData(datapoint, false, false)),
				(datapoint: any) => datapoint.identity
			);
		}

		const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
			return this.numberSettings.show ? this.formatNumber(value, this.numberSettings, numberFormatter, true, true) : powerBiNumberFormat(value, numberFormatter);
		};

		const getTooltipData = (value: ILollipopChartRow, isCircle1: boolean, isMultiMeasure: boolean): VisualTooltipDataItem[] => {
			const isPosNegColorScheme1 = !this.isShowMarker1OutlineColor && this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative &&
				(this.isLollipopTypeCircle ? !this.CFCategoryColorPair[value.category].isMarker1Color : true);

			const isPosNegColorScheme2 = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative &&
				(this.isLollipopTypeCircle ? !this.CFCategoryColorPair[value.category].isMarker2Color : true);

			const posNegColor1 = value.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
			const posNegColor2 = value.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;

			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: this.getTooltipCategoryText(value.category).toString(),
					color: "transparent",
				},
				{
					displayName: this.measure1DisplayName,
					value: numberFormatter(value.value1, this.measureNumberFormatter[0]),
					color: (value.category.toString().includes(this.othersLabel) ? this.dataColorsSettings.othersColor : isPosNegColorScheme1 ? posNegColor1 : this.categoryColorPair[value.category].marker1Color)
				},
			];

			if (isMultiMeasure) {
				tooltipData.push({
					displayName: this.measure2DisplayName,
					value: numberFormatter(value.value2, this.measureNumberFormatter[1]),
					color: (isPosNegColorScheme2 ? posNegColor2 : this.categoryColorPair[value.category].marker2Color),
				})
			}

			value.tooltipFields.forEach((data, i: number) => {
				let text = data.value;

				if (this.categoricalTooltipFields[i].source.type.text && value.category === this.othersBarText) {
					text = this.othersBarText;
				} else if (this.categoricalTooltipFields[i].source.type.dateTime) {
					text = powerBiNumberFormat(new Date(data.value), this.tooltipNumberFormatter[i]);
				} else {
					if (this.categoricalTooltipFields[i].source.type.integer || this.categoricalTooltipFields[i].source.type.numeric) {
						text = powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i]);
					} else {
						text = data.value;
					}
				}

				tooltipData.push({
					displayName: data.displayName,
					value: text,
					color: data.color ? data.color : "transparent",
				});
			});

			if (this.errorBarsSettings.tooltip.isEnabled) {
				const errorBar1 = value.errorBar1;
				const errorBar2 = value.errorBar2;
				const isValue2 = this.isHasMultiMeasure && this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;

				if (this.errorBarsSettings.measurement.direction !== EErrorBarsDirection.Minus) {
					if (this.isHasErrorUpperBounds) {
						if (this.isRenderBothErrorBars) {
							tooltipData.push({
								displayName: "Upper",
								value: isCircle1 ? errorBar1.tooltipUpperBoundValue : errorBar2.tooltipUpperBoundValue,
								color: "transparent",
							});
						} else {
							if ((isValue2 && !isCircle1) || (!isValue2 && isCircle1)) {
								tooltipData.push({
									displayName: "Upper",
									value: errorBar1.tooltipUpperBoundValue,
									color: "transparent",
								});
							}
						}
					}
				}

				if (this.errorBarsSettings.measurement.direction !== EErrorBarsDirection.Plus) {
					if (this.isHasErrorLowerBounds) {
						if (this.isRenderBothErrorBars) {
							tooltipData.push({
								displayName: "Lower",
								value: isCircle1 ? errorBar1.tooltipLowerBoundValue : errorBar2.tooltipLowerBoundValue,
								color: "transparent",
							});
						} else {
							if ((isValue2 && !isCircle1) || (!isValue2 && isCircle1)) {
								tooltipData.push({
									displayName: "Lower",
									value: errorBar1.tooltipLowerBoundValue,
									color: "transparent",
								});
							}
						}
					}
				}
			}

			if (value.isHighlight) {
				tooltipData.push({
					displayName: "Highlighted",
					value: isCircle1
						? numberFormatter(value.value1, this.measureNumberFormatter[0])
						: numberFormatter(value.value2, this.measureNumberFormatter[1]),
					color: "transparent",
				});
			}

			return tooltipData;
		};
	}

	// XY Axis Title
	drawXYAxisTitle(): void {
		// if (this.isHorizontalChart) {
		// 	if (this.xAxisSettings.isDisplayTitle) {
		// 		if (this.xAxisSettings.titleName.length === 0) {
		// 			this.xAxisSettings.titleName = this.measureNames.join(" and ");
		// 		}
		// 	}

		// 	if (this.yAxisSettings.isDisplayTitle) {
		// 		if (this.yAxisSettings.titleName.length === 0) {
		// 			this.yAxisSettings.titleName = this.categoryDisplayName;
		// 		}
		// 	}
		// } else {
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
		// }

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
			.attr("fill", this.getColor(xAxisSettings.titleColor, EHighContrastColorType.Foreground))
			.attr("font-size", xAxisSettings.titleFontSize)
			.style("font-family", xAxisSettings.titleFontFamily)
			.style("display", xAxisSettings.isDisplayTitle ? "block" : "none")
			.style("text-decoration", this.xAxisSettings.titleStyling.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", this.xAxisSettings.titleStyling.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", this.xAxisSettings.titleStyling.includes(EFontStyle.Italic) ? "italic" : "")
			.text(!this.isHorizontalChart ? xAxisTitle : yAxisTitle);

		this.yAxisTitleText
			.attr("fill", this.getColor(yAxisSettings.titleColor, EHighContrastColorType.Foreground))
			.attr("font-size", yAxisSettings.titleFontSize)
			.style("font-family", this.yAxisSettings.titleFontFamily)
			.style("display", yAxisSettings.isDisplayTitle ? "block" : "none")
			.style("text-decoration", this.yAxisSettings.titleStyling.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", this.yAxisSettings.titleStyling.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", this.yAxisSettings.titleStyling.includes(EFontStyle.Italic) ? "italic" : "")
			.text(!this.isHorizontalChart ? yAxisTitle : xAxisTitle);

		if (xAxisSettings.position === Position.Bottom) {
			this.xAxisTitleG.attr(
				"transform",
				`translate(${this.width / 2}, ${this.height + this.margin.bottom - this.brushHeight - this.xAxisTitleMargin - this.brushXAxisTicksMaxHeight})`
			);
		} else if (xAxisSettings.position === Position.Top) {
			this.xAxisTitleG.attr("transform", `translate(${this.width / 2}, ${-this.margin.top + 2 * this.xAxisTitleMargin})`);
		}

		if (yAxisSettings.position === Position.Left) {
			this.yAxisTitleG.attr("transform", `translate(${-(this.yScaleGWidth + this.expandAllYScaleGWidth) - this.yAxisTitleMargin / 2 - this.yAxisTitleSize.width / 2}, ${this.height / 2})`);
		} else if (yAxisSettings.position === Position.Right) {
			this.yAxisTitleG.attr(
				"transform",
				`translate(${this.width + this.margin.right - this.brushWidth - this.yAxisTitleMargin - this.brushYAxisTicksMaxWidth}, ${this.height / 2})`
			);
		}
	}

	setScaleBandwidth(): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();

		if (this.isXIsContinuousAxis || this.isYIsContinuousAxis) {
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

		if ((!this.isHorizontalChart && !THIS.isXIsContinuousAxis) || (!THIS.isHorizontalChart && THIS.isXIsDateTimeAxis)) {
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

			isApplyTilt = (xAxisSettings.isLabelAutoTilt && (xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3 ||
				(this.markerMaxSize > this.scaleBandWidth))) || (!xAxisSettings.isLabelAutoTilt && xAxisSettings.labelTilt !== 0);
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

		const ticks = [];

		const posTiltDx = d3.scaleLinear().domain([30, 90]).range([0.35, -0.5]);
		const negTiltDx = d3.scaleLinear().domain([-30, -90]).range([0.35, -0.5]);
		const getY9 = (val) => d3.scaleLinear().domain(val > 0 ? [0, 90] : [0, -90]).range([0, 9])(val);

		let rotateDegree = 0;
		if (THIS.isBottomXAxis) {
			if (xAxisSettings.isLabelAutoTilt) {
				rotateDegree = (THIS.markerMaxSize > THIS.scaleBandWidth) ? -90 : -35;
			} else {
				rotateDegree = xAxisSettings.labelTilt;
			}
		} else {
			if (xAxisSettings.isLabelAutoTilt) {
				rotateDegree = (THIS.markerMaxSize > THIS.scaleBandWidth) ? 90 : 35;
			} else {
				rotateDegree = -xAxisSettings.labelTilt;
			}
		}

		if (this.isExpandAllApplied && this.isXIsNumericAxis) {
			rotateDegree = 0;
		}

		this.xAxisG
			.selectAll("text")
			.attr("dx", "0")
			// .attr("dx", isApplyTilt && !this.isHorizontalBrushDisplayed && !this.isExpandAllApplied ? "-10.5px" : "0")
			.attr("dy", ((rotateDegree < 0 ? negTiltDx(rotateDegree) : posTiltDx(rotateDegree)).toString().concat("em")))
			.attr("y", () => {
				const y = isApplyTilt ? getY9(rotateDegree) : 9;
				if (this.isHorizontalChart) {
					return this.isBottomXAxis ? y : 0;
				} else {
					return this.isBottomXAxis ? y : y;
				}
			})
			// .attr("dy", isApplyTilt ? "0" : "0.35em")
			.attr("fill", this.getColor(xAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", xAxisSettings.labelFontFamily)
			.attr("font-size", xAxisSettings.labelFontSize)
			.attr("display", xAxisSettings.isDisplayLabel ? "block" : "none")
			.style("text-decoration", this.xAxisSettings.labelStyling.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", this.xAxisSettings.labelStyling.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", this.xAxisSettings.labelStyling.includes(EFontStyle.Italic) ? "italic" : "")
			.attr("text-anchor", () => {
				if (this.isBottomXAxis) {
					return isApplyTilt && rotateDegree !== 0 ? rotateDegree > 0 ? "start" : "end" : "middle";
				} else {
					return isApplyTilt && rotateDegree !== 0 ? rotateDegree > 0 ? "end" : "start" : "middle";
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
				let text = ele.text().toString();
				const isOthersTick = text.includes(THIS.othersLabel);

				// if (!text.includes(THIS.othersLabel)) {}
				if (THIS.isXIsNumericAxis && THIS.isXIsContinuousAxis) {
					if (ticks.includes(text)) {
						ele.attr("opacity", "0");
					}
				}

				ticks.push(text);

				if (text.includes("isZero")) {
					text = "0";
				}

				if (text.includes("--")) {
					text = text.split("--")[0];
				}

				if (THIS.isXIsDateTimeAxis && !THIS.isHorizontalChart && !isOthersTick) {
					if (!xAxisSettings.isAutoDateFormat) {
						text = FormatAxisDate(THIS.xAxisSettings.dateFormat === EAxisDateFormats.Custom ? xAxisSettings.customDateFormat : THIS.xAxisSettings.dateFormat, text);
					} else {
						text = valueFormatter.create({ format: THIS.categoricalCategoriesFields[THIS.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
					}
				}

				const newText = xAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, xAxisSettings.labelCharLimit);
				ele.text("");

				const textProperties: TextProperties = {
					text: newText,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};

				const getFinalTruncatedText = (d: string) => {
					return !xAxisSettings.isLabelAutoCharLimit && d.length === xAxisSettings.labelCharLimit && text.length > xAxisSettings.labelCharLimit ? d.concat("...") : d;
				}

				if ((!THIS.isHorizontalChart && !THIS.isXIsContinuousAxis) || (!THIS.isHorizontalChart && THIS.isXIsDateTimeAxis)) {
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
								.text(getFinalTruncatedText(d));
						});
					} else {
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, xAxisMaxHeight);
						if (THIS.isBottomXAxis) {
							ele.attr("transform", `rotate( ${rotateDegree})`);
						} else {
							ele.attr("transform", `rotate( ${rotateDegree})`);
						}
						ele.append("tspan").text(getFinalTruncatedText(truncatedText));
					}
				} else {
					let text = newText;
					const firstChar = text.charAt(0);
					const unicodeValue = firstChar.charCodeAt(0);
					const isNegativeNumber = unicodeValue === 8722 || text.includes("-");
					const isDecimalNumber = text.includes(".");

					if (isDecimalNumber) {
						// text = text.split(".")[0];
					}

					if (isNegativeNumber) {
						text = (extractDigitsFromString(text.substring(1)) * -1).toString();
					}

					let isPercentageNumber = false;
					if (THIS.measureNumberFormatter[0].format && THIS.measureNumberFormatter[0].format.includes("%")) {
						isPercentageNumber = true;
					}

					const truncatedText = THIS.axisNumberFormatter(parseFloat(extractDigitsFromString((xAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, xAxisSettings.labelCharLimit))).toString()), xAxisSettings.numberFormatting.show ? xAxisSettings.numberFormatting : THIS.numberSettings);
					const finalText = getFinalTruncatedText(!isNegativeNumber ? truncatedText : "-".concat(truncatedText));
					ele.append("tspan").text(isPercentageNumber ? finalText.concat("%") : finalText);
				}
			});
	}

	setYAxisTickStyle(): void {
		const THIS = this;
		const ticks = [];
		const yAxisSettings = this.yAxisSettings;
		this.yAxisG
			.selectAll("text")
			.attr("x", "0")
			.attr("fill", this.getColor(yAxisSettings.labelColor, EHighContrastColorType.Foreground))
			.style("font-family", yAxisSettings.labelFontFamily)
			.attr("font-size", yAxisSettings.labelFontSize)
			.style("text-anchor", yAxisSettings.position === Position.Left ? "end" : "start")
			.style("text-decoration", this.yAxisSettings.labelStyling.includes(EFontStyle.UnderLine) ? "underline" : "")
			.style("font-weight", this.yAxisSettings.labelStyling.includes(EFontStyle.Bold) ? "bold" : "")
			.style("font-style", this.yAxisSettings.labelStyling.includes(EFontStyle.Italic) ? "italic" : "")
			// .text((d: any) => {
			// 	if (!this.isHorizontalChart && typeof d === "number") {
			// 		return formatNumber(d, this.numberSettings, undefined);
			// 	}
			// 	return d;
			// })
			.each(function () {
				const ele = d3.select(this);
				let text = ele.text();
				const isOthersTick = text.includes(THIS.othersLabel);

				// if (!text.includes(THIS.othersLabel)) { }
				if (text.includes("isZero")) {
					text = "0";
				}

				if (text.includes("--")) {
					text = text.split("--")[0];
				}

				if (THIS.isYIsNumericAxis && THIS.isYIsContinuousAxis) {
					if (ticks.includes(text)) {
						ele.attr("opacity", "0");
					}
				}

				ticks.push(text);

				const getFinalTruncatedText = (d: string) => {
					return !yAxisSettings.isLabelAutoCharLimit && d.length === yAxisSettings.labelCharLimit && text.length > yAxisSettings.labelCharLimit ? d.concat("...") : d;
				}

				if (THIS.isYIsDateTimeAxis && !THIS.isYIsContinuousAxis && THIS.isHorizontalChart && !isOthersTick) {
					if (!yAxisSettings.isAutoDateFormat) {
						text = FormatAxisDate(yAxisSettings.dateFormat === EAxisDateFormats.Custom ? yAxisSettings.customDateFormat : yAxisSettings.dateFormat, text);
					} else {
						text = valueFormatter.create({ format: THIS.categoricalCategoriesFields[THIS.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
					}
				}

				if ((!THIS.isYIsDateTimeAxis && THIS.isHorizontalChart) || !THIS.isHorizontalChart) {
					const firstChar = text.charAt(0);
					const unicodeValue = firstChar.charCodeAt(0);
					const isNegativeNumber = (unicodeValue === 8722 || text.includes("-")) && extractDigitsFromString(text);
					const isDecimalNumber = text.includes(".");

					if (isDecimalNumber) {
						// text = text.split(".")[0];
					}

					if (isNegativeNumber) {
						text = (extractDigitsFromString(text.substring(1)) * -1).toString();
					}

					ele.text("");

					const textProperties: TextProperties = {
						text: yAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, yAxisSettings.labelCharLimit),
						fontFamily: yAxisSettings.labelFontFamily,
						fontSize: yAxisSettings.labelFontSize + "px",
					};

					let isPercentageNumber = false;
					if (THIS.measureNumberFormatter[0].format && THIS.measureNumberFormatter[0].format.includes("%")) {
						isPercentageNumber = true;
					}

					if (!THIS.isHorizontalChart || THIS.isYIsContinuousAxis) {
						const truncatedText = THIS.axisNumberFormatter(parseFloat(extractDigitsFromString(yAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, yAxisSettings.labelCharLimit)).toString()), yAxisSettings.numberFormatting.show ? yAxisSettings.numberFormatting : THIS.numberSettings);
						const finalText = getFinalTruncatedText(!isNegativeNumber ? truncatedText : "-".concat(truncatedText));
						ele.append("tspan").text(isPercentageNumber ? finalText.concat("%") : finalText);
					} else {
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, THIS.viewPortWidth * THIS.yAxisTicksMaxWidthRatio);
						ele.append("tspan").text(getFinalTruncatedText(truncatedText));
					}
				} else {
					const textProperties: TextProperties = {
						text: yAxisSettings.isLabelAutoCharLimit ? text : text.substring(0, yAxisSettings.labelCharLimit),
						fontFamily: yAxisSettings.labelFontFamily,
						fontSize: yAxisSettings.labelFontSize + "px",
					};

					ele.text("");

					const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, THIS.viewPortWidth * THIS.yAxisTicksMaxWidthRatio);
					ele.append("tspan").text(getFinalTruncatedText(truncatedText));
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
		const values = this.categoricalData.categories[this.categoricalCategoriesLastIndex].values;

		let min = +d3.min(values, d => +d);
		let max = +d3.max(values, d => +d);

		if (!this.isXIsContinuousAxis && !this.isHorizontalChart) {
			if (min > 0) {
				min = 0;
			}

			if (max >= 0) {
				max += max * 0.15;
			} else {
				max -= max * 0.15;
			}
		}

		if (this.isXIsContinuousAxis || this.isYIsContinuousAxis) {
			if (this.isXIsContinuousAxis) {
				if (this.xAxisSettings.isMinimumRangeEnabled) {
					min = this.xAxisSettings.minimumRange;
				}

				if (this.xAxisSettings.isMaximumRangeEnabled) {
					max = this.xAxisSettings.maximumRange;
				}
			}

			if (this.isYIsContinuousAxis) {
				if (this.yAxisSettings.isMinimumRangeEnabled) {
					min = this.yAxisSettings.minimumRange;
				}

				if (this.yAxisSettings.isMaximumRangeEnabled) {
					max = this.yAxisSettings.maximumRange;
				}
			}

			if ((this.isXIsDateTimeAxis && this.isXIsContinuousAxis) || (this.isYIsDateTimeAxis && this.isYIsContinuousAxis)) {
				const dates = this.chartData.map((d) => d.category);
				const minDate = d3.min(dates, d => new Date(d).getTime());
				const maxDate = d3.max(dates, d => new Date(d).getTime());

				this.xScale = d3.scaleTime();
				this.xScale.domain([new Date(minDate), new Date(maxDate)]);
			} else {
				this.xScale = d3.scaleLinear();
				this.xScale.domain([min, max]).nice();
			}
		} else {
			this.xScale = d3.scaleBand();
			this.xScale.domain(this.chartData.map((d) => d.category));
		}
	}

	setYAxisDomain(): void {
		const { min, max } = GetAxisDomainMinMax(this);

		this.axisDomainMinValue = min;
		this.axisDomainMaxValue = max;

		this.axisDomainMaxValueDisplayUnit = getNumberDisplayUnit(this.axisDomainMaxValue, true);

		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number" && !this.isLogarithmScale;
		const isLogarithmScale = this.axisByBarOrientation.isLogarithmScale;

		this.isHasNegativeValue = min < 0 || max < 0;
		this.isHasPositiveValue = min > 0 || max > 0;
		this.isShowPositiveNegativeLogScale = this.isLogarithmScale && this.isHasNegativeValue;

		this.yScale = isLinearScale ? d3.scaleLinear() : d3.scaleBand();

		if (isLinearScale) {
			this.yScale = d3.scaleLinear();
		} else if (isLogarithmScale) {
			if (!this.isHorizontalChart && this.isShowPositiveNegativeLogScale) {
				this.positiveLogScale = d3.scaleLog().base(10);
				this.negativeLogScale = d3.scaleLog().base(10);
			} else {
				this.yScale = d3.scaleLog().base(10);
			}
		} else {
			this.yScale = d3.scaleBand();
		}

		if (isLinearScale) {
			this.yScale.domain([min, max]).nice();
		} else if (isLogarithmScale) {
			if (this.isShowPositiveNegativeLogScale) {
				if (this.isBottomXAxis) {
					this.positiveLogScale.domain([0.1, this.axisDomainMaxValue]).nice();
					this.negativeLogScale.domain([Math.abs(this.axisDomainMinValue), 0.1]).nice();
				} else {
					this.negativeLogScale.domain([0.1, this.axisDomainMaxValue]).nice();
					this.positiveLogScale.domain([Math.abs(this.axisDomainMinValue), 0.1]).nice();
				}
			} else {
				this.yScale.domain([this.axisDomainMinValue === 0 ? 0.1 : this.axisDomainMinValue, this.axisDomainMaxValue]).nice();
			}
		} else {
			this.yScale.domain(this.chartData.map((d) => d.value1));
		}
	}

	getStartEndAxisRangeDiff(): { startDiff: number, endDiff: number } {
		let startDiff = 0;
		let endDiff = 0;

		const { fontSize: font1Size, fontFamily: font1Family, fontStyle: font1Style, placement: label1Placement } = this.data1LabelsSettings;
		const { fontSize: font2Size, fontFamily: font2Family, fontStyle: font2Style, placement: label2Placement } = this.data2LabelsSettings;

		const data1LabelHeight = getSVGTextSize('100K', font1Family, font1Size, font1Style[EFontStyle.Bold], font1Style[EFontStyle.Italic], font1Style[EFontStyle.UnderLine]).height;
		const data1Labels = d3.map(this.chartData, d => this.formatNumber(d.value1, this.numberSettings, this.measureNumberFormatter[0], true, true));
		const data1LabelWidth = getSVGTextSize((data1Labels.find(d => d.length === d3.max(data1Labels, d => d.length))),
			font1Family,
			font1Size,
			font1Style[EFontStyle.Bold],
			font1Style[EFontStyle.Italic],
			font1Style[EFontStyle.UnderLine]).width;

		let dataLabelHeight = data1LabelHeight;
		let dataLabelWidth = data1LabelWidth;

		if (this.isHasMultiMeasure) {
			const data2LabelHeight = getSVGTextSize('100K', font2Family, font2Size, font2Style[EFontStyle.Bold], font2Style[EFontStyle.Italic], font2Style[EFontStyle.UnderLine]).height;
			const data2Labels = d3.map(this.chartData, d => this.formatNumber(d.value2, this.numberSettings, this.measureNumberFormatter[0], true, true));
			const data2LabelWidth = getSVGTextSize((data2Labels.find(d => d.length === d3.max(data2Labels, d => d.length))),
				font2Family,
				font2Size,
				font2Style[EFontStyle.Bold],
				font2Style[EFontStyle.Italic],
				font2Style[EFontStyle.UnderLine]).width;

			dataLabelHeight = d3.max([data2LabelHeight, data1LabelHeight]);
			dataLabelWidth = d3.max([data1LabelWidth, data2LabelWidth]);
		}

		const isOutsideLabel =
			((label1Placement === DataLabelsPlacement.Outside || (this.isHasMultiMeasure ? label2Placement === DataLabelsPlacement.Outside : false))) ||
			(this.dataLabelsSettings.isShowBestFitLabels);
		const isBottomOutsideLabel = ((label1Placement === DataLabelsPlacement.Outside || (this.isHasMultiMeasure ? label2Placement === DataLabelsPlacement.Outside : false)) && (this.isHasMultiMeasure || this.isHasNegativeValue)) || (this.dataLabelsSettings.isShowBestFitLabels && this.isHasMultiMeasure);
		const negDataLabelHeight = (!isBottomOutsideLabel && this.isHasNegativeValue && this.dataLabelsSettings.show && isOutsideLabel) ? (this.isHorizontalChart ? dataLabelHeight * 2 : dataLabelHeight) + this.markerMaxSize : 0;
		const outsideDataLabelHeight = (this.dataLabelsSettings.show && isOutsideLabel ? dataLabelHeight : 0) + this.markerMaxSize / 4;
		const outsideDataLabelWidth = (this.dataLabelsSettings.show && isOutsideLabel ? dataLabelWidth : 0) + this.markerMaxSize / 4;
		const negDataLabelWidth = this.isHasNegativeValue && this.dataLabelsSettings.show && isOutsideLabel ? dataLabelWidth + (this.markerMaxSize / 2) : 0;

		if (this.isHorizontalChart) {
			if ((this.yAxisSettings.position === Position.Left && !this.xAxisSettings.isInvertRange)
				|| (this.yAxisSettings.position === Position.Right && this.xAxisSettings.isInvertRange)) {
				startDiff = negDataLabelWidth + this.maxCircleXScaleDiff + this.maxPieXScaleDiff + ((isBottomOutsideLabel) ? outsideDataLabelWidth : 0);
				endDiff = -outsideDataLabelWidth;
			} else {
				startDiff = -(negDataLabelWidth + this.maxCircleXScaleDiff + this.maxPieXScaleDiff + ((isBottomOutsideLabel) ? outsideDataLabelWidth : 0));
				endDiff = outsideDataLabelWidth;
			}
		} else {
			if ((this.xAxisSettings.position === Position.Bottom && !this.yAxisSettings.isInvertRange)
				|| (this.xAxisSettings.position === Position.Top && this.yAxisSettings.isInvertRange)) {
				startDiff = -(negDataLabelHeight + this.maxCircleYScaleDiff + this.maxPieYScaleDiff + ((isBottomOutsideLabel) ? outsideDataLabelHeight : 0));
				endDiff = outsideDataLabelHeight
			} else {
				startDiff = negDataLabelHeight + this.maxCircleYScaleDiff + this.maxPieYScaleDiff + ((isBottomOutsideLabel) ? outsideDataLabelHeight : 0)
				endDiff = -outsideDataLabelHeight
			}
		}

		return { startDiff, endDiff };
	}

	setXYAxisRange(xScaleWidth: number, yScaleHeight: number): void {
		const { startDiff, endDiff } = this.getStartEndAxisRangeDiff();

		if (this.isHorizontalChart) {
			const xAxisRange = ((this.yAxisSettings.position === Position.Left && !this.xAxisSettings.isInvertRange)
				|| (this.yAxisSettings.position === Position.Right && this.xAxisSettings.isInvertRange)) ?
				[this.xAxisStartMargin + startDiff, xScaleWidth - (this.markerMaxSize / 2) + endDiff] :
				[xScaleWidth - this.xAxisStartMargin + startDiff, (this.markerMaxSize) + endDiff];

			if (this.isShowPositiveNegativeLogScale) {
				const width = this.axisDomainMaxValue * Math.abs(xAxisRange[0] - xAxisRange[1]) / Math.abs(this.axisDomainMinValue - this.axisDomainMaxValue);

				this.positiveLogScaleWidth = width;
				this.negativeLogScaleWidth = this.width - width;

				this.positiveLogScale.range([0, this.positiveLogScaleWidth]);
				this.negativeLogScale.range([0, this.negativeLogScaleWidth]);
			} else {
				this.xScale.range(xAxisRange);
			}



			if (this.isYIsContinuousAxis) {
				this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight - this.xAxisStartMargin - this.markerMaxSize, this.markerMaxSize] : [this.xAxisStartMargin + this.markerMaxSize, yScaleHeight - this.markerMaxSize]);
			} else {
				this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight - this.xAxisStartMargin, 0] : [this.xAxisStartMargin, yScaleHeight]);
			}
		} else {
			// if (this.isSmallMultiplesEnabled) {
			// 	if (this.isXIsContinuousAxis) {
			// 		this.xScale.range(this.yAxisSettings.position === Position.Left ? [this.yAxisStartMargin + this.markerMaxSize, xScaleWidth - this.markerMaxSize] : [xScaleWidth - this.yAxisStartMargin - this.markerMaxSize, this.markerMaxSize]);
			// 	} else {
			// 		this.xScale.range(this.yAxisSettings.position === Position.Left ? [this.yAxisStartMargin, xScaleWidth] : [xScaleWidth - this.yAxisStartMargin, 0]);
			// 	}
			// } else {
			if (this.isXIsContinuousAxis) {
				this.xScale.range(this.yAxisSettings.position === Position.Left ? [this.yAxisStartMargin + this.markerMaxSize, xScaleWidth - this.markerMaxSize] : [xScaleWidth - this.yAxisStartMargin - this.markerMaxSize, this.markerMaxSize]);
			} else {
				this.xScale.range(this.yAxisSettings.position === Position.Left ? [this.yAxisStartMargin, xScaleWidth] : [xScaleWidth - this.yAxisStartMargin, 0]);
			}
			// }

			const yAxisRange = ((this.xAxisSettings.position === Position.Bottom && !this.yAxisSettings.isInvertRange)
				|| (this.xAxisSettings.position === Position.Top && this.yAxisSettings.isInvertRange)) ?
				[yScaleHeight - this.yAxisStartMargin + startDiff, (this.markerMaxSize / 2) + endDiff] :
				[this.yAxisStartMargin + startDiff, yScaleHeight - (this.markerMaxSize / 2) + endDiff];

			if (this.isShowPositiveNegativeLogScale) {
				const height = this.axisDomainMaxValue * Math.abs(yAxisRange[0] - yAxisRange[1]) / Math.abs(this.axisDomainMinValue - this.axisDomainMaxValue);
				this.positiveLogScaleHeight = height;
				this.negativeLogScaleHeight = this.height - height;

				if (((this.xAxisSettings.position === Position.Bottom && !this.yAxisSettings.isInvertRange)
					|| (this.xAxisSettings.position === Position.Top && this.yAxisSettings.isInvertRange))) {
					this.positiveLogScale.range([this.positiveLogScaleHeight + (this.markerMaxSize / 2) + endDiff, 0]);
					this.negativeLogScale.range([this.negativeLogScaleHeight - this.yAxisStartMargin + startDiff, 0]);
				} else {
					// this.positiveLogScale.range([this.positiveLogScaleHeight - (this.markerMaxSize / 2) + endDiff, 0]);
					// this.negativeLogScale.range([this.negativeLogScaleHeight - height + startDiff, 0]);

					this.positiveLogScale.range([this.positiveLogScaleHeight, this.negativeLogScaleHeight]);
					this.negativeLogScale.range([this.negativeLogScaleHeight, 0]);
				}
			} else {
				this.yScale.range(yAxisRange);
			}
		}

		// const xScaleRange = this.xScale.range();
		// if (this.xAxisSettings.isInvertRange) {
		// 	this.xScale.range(xScaleRange.reverse());
		// }

		// const yScaleRange = this.yScale.range();
		// if (this.yAxisSettings.isInvertRange) {
		// 	this.yScale.range(yScaleRange.reverse());
		// }
	}

	drawXAxisLine(): void {
		if ((this.isBottomXAxis && !this.yAxisSettings.isInvertRange) || (!this.isBottomXAxis && this.yAxisSettings.isInvertRange)) {
			this.xAxisLineG.attr("transform", "translate(0," + this.height + ")");
		} else {
			this.xAxisLineG.attr("transform", "translate(0," + 0 + ")");
		}

		let x1: number = 0;
		let x2: number = 0;

		if (this.isCutAndClipAxisEnabled && this.isHorizontalChart) {
			x1 = this.afterCutLinearScale.range()[1];
			x2 = this.beforeCutLinearScale.range()[0];
		} else {
			x1 = this.yAxisStartMargin;
			x2 = this.isLeftYAxis ? this.width : this.width - this.yAxisStartMargin;
		}

		this.xAxisLineG.select(".xAxisLine").remove();
		this.xAxisLineG
			.append("line")
			.attr("class", "xAxisLine")
			.attr("x1", x1)
			.attr("x2", this.isLeftYAxis && this.xAxisSettings.isInvertRange ? x2 - this.xAxisStartMargin : x2)
			.attr("y1", ((this.isBottomXAxis && !this.yAxisSettings.isInvertRange) || (!this.isBottomXAxis && this.yAxisSettings.isInvertRange)) ? -this.yAxisStartMargin : this.yAxisStartMargin)
			.attr("y2", ((this.isBottomXAxis && !this.yAxisSettings.isInvertRange) || (!this.isBottomXAxis && this.yAxisSettings.isInvertRange)) ? -this.yAxisStartMargin : this.yAxisStartMargin)
			.attr("fill", this.getColor(this.xAxisSettings.axisLineColor, EHighContrastColorType.Foreground))
			.attr("stroke", this.getColor(this.xAxisSettings.axisLineColor, EHighContrastColorType.Foreground))
			.attr("stroke-width", "1px");
	}

	drawYAxisLine(): void {
		if (((this.isLeftYAxis && !this.xAxisSettings.isInvertRange) || (!this.isLeftYAxis && this.xAxisSettings.isInvertRange))) {
			this.yAxisLineG.attr("transform", `translate(0, 0)`);
		} else {
			this.yAxisLineG.attr("transform", `translate(${this.width}, 0)`);
		}

		let y1: number = 0;
		let y2: number = 0;

		if (this.isCutAndClipAxisEnabled && !this.isHorizontalChart) {
			y1 = this.afterCutLinearScale.range()[1];
			y2 = this.beforeCutLinearScale.range()[0];
		} else {
			y1 = this.isBottomXAxis ? 0 : this.xAxisStartMargin;
			y2 = this.height - this.xAxisStartMargin;
		}

		this.yAxisLineG.select(".yAxisLine").remove();
		this.yAxisLineG
			.append("line")
			.attr("class", "yAxisLine")
			.attr("x1", ((this.isLeftYAxis && !this.xAxisSettings.isInvertRange) || (!this.isLeftYAxis && this.xAxisSettings.isInvertRange)) ? this.yAxisStartMargin : -this.yAxisStartMargin)
			.attr("x2", ((this.isLeftYAxis && !this.xAxisSettings.isInvertRange) || (!this.isLeftYAxis && this.xAxisSettings.isInvertRange)) ? this.yAxisStartMargin : -this.yAxisStartMargin)
			.attr("y1", this.yAxisSettings.isInvertRange ? this.xAxisStartMargin : y1)
			.attr("y2", y2)
			.attr("fill", this.getColor(this.yAxisSettings.axisLineColor, EHighContrastColorType.Foreground))
			.attr("stroke", this.getColor(this.yAxisSettings.axisLineColor, EHighContrastColorType.Foreground))
			.attr("stroke-width", "1px");
	}

	callXYScaleOnAxisGroup(isShowXAxis: boolean, isShowYAxis: boolean): void {
		if (isShowXAxis) {
			CallXScaleOnAxisGroup(this, this.width, this.height, this.xAxisG.node());

			this.xAxisG
				.selectAll("text")
				.attr("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");
		}

		if (isShowYAxis) {
			CallYScaleOnAxisGroup(this, this.width, this.height, this.yAxisG.node());

			this.yAxisG
				.selectAll("text")
				.attr("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");
		}
	}

	xGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.xGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", (d) => this.getXPosition(d) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0))
			.attr("x2", (d) => this.getXPosition(d) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0))
			.attr("y1", 0)
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
			.attr("x1", this.xAxisStartMargin)
			.attr("x2", this.width)
			.attr("y1", (d) => this.getYPosition(d) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0))
			.attr("y2", (d) => this.getYPosition(d) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0))
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
					...this.afterCutLinearScale.ticks(this.afterCutLinearScaleArea / 90),
					...this.beforeCutLinearScale.ticks(this.beforeCutLinearScaleArea / 90),
				];
			} else if (this.axisByBarOrientation.isLogarithmScale) {
				yScaleTicks = [
					...this.positiveLogScaleTicks,
					...this.negativeLogScaleTicks,
				];
			} else {
				yScaleTicks = this.yScale.ticks(this.height / 90);
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

	private toggleLegendBasedOnGroupByData(isHasMultiMeasure: boolean, isHasSubcategories: boolean): void {
		if ((isHasSubcategories || isHasMultiMeasure) && !this.legendSettings.show && !this.legendSettings.isLegendAutoChanged) {
			this._host.persistProperties({
				merge: [
					{
						objectName: EVisualSettings.Legend,
						properties: { show: true, isLegendAutoChanged: true },
						selector: null,
					},
				],
			});
		}
	}

	drawXYAxis(categoricalData: powerbi.DataViewCategorical, isShowXAxis: boolean, isShowYAxis: boolean, isSetXYScaleDiffs: boolean = true): { xAxisG: D3Selection<SVGElement>, yAxisG: D3Selection<SVGElement> } {
		this.setXAxisDomain();
		this.setYAxisDomain();

		if (this.cutAndClipAxisSettings.breakStart === undefined) {
			this.cutAndClipAxisSettings.breakStart = this.axisDomainMaxValue * 15 / 100;
		}

		if (this.cutAndClipAxisSettings.breakEnd === undefined) {
			this.cutAndClipAxisSettings.breakEnd = this.axisDomainMaxValue * 35 / 100;
		}

		if ((this.cutAndClipAxisSettings.breakStart >= this.axisDomainMaxValue) || (this.cutAndClipAxisSettings.breakEnd >= this.axisDomainMaxValue)) {
			this.cutAndClipAxisSettings.breakStart = this.axisDomainMaxValue;
			this.cutAndClipAxisSettings.breakEnd = this.axisDomainMaxValue;
		}

		// if (!this.dataColorsSettings.isFillTypeChanged && this.minCategoryValueDataPair.value < 0 && this.maxCategoryValueDataPair.value > 0 && !this.isIBCSEnabled) {
		// 	this.dataColorsSettings.fillType = ColorPaletteType.PositiveNegative;
		// }

		if (this.isHorizontalChart) {
			const xScaleCopy = this.xScale.copy();
			const yScaleCopy = this.yScale.copy();

			this.xScale = yScaleCopy;
			this.yScale = xScaleCopy;
		}

		this.setXYAxisRange(this.width, this.height);

		if (isNaN(this.width) || isNaN(this.height)) {
			return;
		}

		if (isShowXAxis) {
			// // // SET X-AXIS TICKS MAX HEIGHT
			this.setXScaleGHeight();
		}

		if (isShowYAxis) {
			// // // SET Y-AXIS TICKS MAX HEIGHT
			this.setYScaleGWidth();
		}

		this.setMargins();

		this.circleYScaleDiffs = [];
		this.circleXScaleDiffs = [];

		if (isSetXYScaleDiffs) {
			this.chartData.forEach(d => {
				const test = (isCircle2) => {
					if (this.isLollipopTypeCircle) {
						if (!this.isHorizontalChart) {
							const cy = this.yScale(isCircle2 ? d.value2 : d.value1);
							if (this.isBottomXAxis) {
								const isLessSpace = (this.height - this.yAxisStartMargin - cy) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
								if (isLessSpace) {
									this.circleYScaleDiffs.push(Math.abs((this.height - this.yAxisStartMargin - cy) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
								}
							} else {
								const isLessSpace = (cy - this.yAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
								if (isLessSpace) {
									this.circleYScaleDiffs.push(Math.abs((cy - this.yAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
								}
							}
						} else {
							const cx = this.xScale(isCircle2 ? d.value2 : d.value1);
							if (!this.isLeftYAxis) {
								const isLessSpace = (this.width - this.xAxisStartMargin - cx) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
								if (isLessSpace) {
									this.circleXScaleDiffs.push(Math.abs((this.width - this.xAxisStartMargin - cx) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
								}
							} else {
								const isLessSpace = (cx - this.xAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
								if (isLessSpace) {
									this.circleXScaleDiffs.push(Math.abs((cx - this.xAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
								}
							}
						}
					} else {
						if (!this.isHorizontalChart) {
							const y = this.yScale(isCircle2 ? d.value2 : d.value1);
							if (this.isBottomXAxis) {
								const isLessSpace = (this.height - this.yAxisStartMargin - y) <= (isCircle2 ? this.pie2Radius : this.pie1Radius);
								if (isLessSpace) {
									this.pieYScaleDiffs.push(Math.abs((this.height - this.yAxisStartMargin - y) - (isCircle2 ? this.pie2Radius : this.pie1Radius)));
								}
							} else {
								const isLessSpace = (y - this.yAxisStartMargin) <= (isCircle2 ? this.pie2Radius : this.pie1Radius);
								if (isLessSpace) {
									this.pieYScaleDiffs.push(Math.abs((y - this.yAxisStartMargin) - (isCircle2 ? this.pie2Radius : this.pie1Radius)));
								}
							}
						} else {
							const x = this.xScale(isCircle2 ? d.value2 : d.value1);
							if (this.isLeftYAxis) {
								const isLessSpace = (x - this.xAxisStartMargin) <= (isCircle2 ? this.pie2Radius : this.pie1Radius);
								if (isLessSpace) {
									this.pieXScaleDiffs.push(Math.abs((x - this.xAxisStartMargin) - (isCircle2 ? this.pie2Radius : this.pie1Radius)));
								}
							} else {
								const isLessSpace = (this.width - this.xAxisStartMargin - x) <= (isCircle2 ? this.pie2Radius : this.pie1Radius);
								if (isLessSpace) {
									this.pieXScaleDiffs.push(Math.abs((this.width - this.xAxisStartMargin - x) - (isCircle2 ? this.pie2Radius : this.pie1Radius)));
								}
							}
						}
					}
				}

				if (this.isHasMultiMeasure) {
					test(false);
					test(true);
				} else {
					test(false);
				}
			});

			if (this.isLollipopTypeCircle) {
				if (!this.isHorizontalChart) {
					this.maxCircleYScaleDiff = d3.max(this.circleYScaleDiffs) ? d3.max(this.circleYScaleDiffs) : 0;
				} else {
					this.maxCircleXScaleDiff = d3.max(this.circleXScaleDiffs) ? d3.max(this.circleXScaleDiffs) : 0;
				}
			} else {
				if (!this.isHorizontalChart) {
					this.maxPieYScaleDiff = d3.max(this.pieYScaleDiffs) ? d3.max(this.pieYScaleDiffs) : 0;
				} else {
					this.maxPieXScaleDiff = d3.max(this.pieXScaleDiffs) ? d3.max(this.pieXScaleDiffs) : 0;
				}
			}
		}

		this.setXYAxisRange(this.width, this.height);

		if (isNaN(this.width) || isNaN(this.height)) {
			return;
		}

		if (isShowXAxis) {
			// // // SET X-AXIS TICKS MAX HEIGHT
			this.setXScaleGHeight();
		}

		if (isShowYAxis) {
			// // // SET Y-AXIS TICKS MAX HEIGHT
			this.setYScaleGWidth();
		}

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);

		if (isNaN(this.width) || isNaN(this.height)) {
			return;
		}

		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup(isShowXAxis, isShowYAxis);

		if (this.xAxisSettings.isDisplayLabel && isShowXAxis && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart))) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel && isShowYAxis && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart))) {
			this.setYAxisTickStyle();
		}

		if (this.xAxisSettings.isDisplayLabel && isShowXAxis) {
			if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart)) {
				const xScaleGHeight = (this.xAxisG.node()).getBoundingClientRect().height;
				this.xScaleGHeight = xScaleGHeight > 0 ? xScaleGHeight : this.xScaleGHeight;
			}
		} else {
			this.xScaleGHeight = 0;
		}

		if (this.yAxisSettings.isDisplayLabel && isShowYAxis) {
			if (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart)) {
				const yScaleGWidth = this.yAxisG.node().getBoundingClientRect().width;
				this.yScaleGWidth = yScaleGWidth > 0 ? yScaleGWidth : this.yScaleGWidth;
			}
		} else {
			this.yScaleGWidth = 0;
		}

		if (this.categoricalCategoriesLastIndex > 0) {
			if (!this.isHorizontalChart) {
				// RenderExpandAllXAxis(this, this.categoricalData);
			} else {
				RenderExpandAllYAxis(this, categoricalData);
			}
		}

		if (this.isExpandAllApplied) {
			if (!this.isHorizontalChart) {
				// if (this.isBottomXAxis) {
				// 	this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (this.height + this.xScaleGHeight) + "px" + ")");
				// } else {
				// 	this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-this.xScaleGHeight) + "px" + ")");
				// }

				// CallExpandAllXScaleOnAxisGroup(this, this.scaleBandWidth);
			} else {
				if (this.isLeftYAxis) {
					this.expandAllYAxisG.style("transform", "translate(" + (-this.expandAllYScaleGWidth - this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
				} else {
					this.expandAllYAxisG.style("transform", "translate(" + (this.width - this.yAxisTitleSize.width - this.yAxisStartMargin - this.brushWidth) + "px" + "," + 0 + "px" + ")");
				}
				CallExpandAllYScaleOnAxisGroup(this, this.expandAllYScaleGWidth);
			}
		}

		this.expandAllYScaleGWidth = this.expandAllYAxisG.node().getBoundingClientRect().width;


		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup(isShowXAxis, isShowYAxis);

		if (this.xAxisSettings.isDisplayLabel && isShowXAxis && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && !this.isHorizontalChart))) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel && isShowYAxis && (!this.isCutAndClipAxisEnabled || (this.isCutAndClipAxisEnabled && this.isHorizontalChart))) {
			this.setYAxisTickStyle();
		}

		this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.xAxisG.selectAll(".tick").style("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");
		this.yAxisG.selectAll(".tick").style("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");

		const SVGBBox = (this.svg.node() as SVGSVGElement).getBoundingClientRect();

		// Truncate the ticks which are overlaps with the Y axis
		const THIS = this;
		if (!this.isSmallMultiplesEnabled || (this.isSmallMultiplesEnabled && this.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Individual)) {
			this.xAxisG
				.selectAll(".tick")
				.selectAll("text")
				.each(function () {
					const ele = d3.select(this);
					const start = SVGBBox.x;
					const bBox = (ele.node() as SVGSVGElement).getBoundingClientRect();

					if ((bBox.x - start) < 0) {
						const textProperties: TextProperties = {
							text: ele.text(),
							fontFamily: THIS.xAxisSettings.labelFontFamily,
							fontSize: THIS.xAxisSettings.labelFontSize + "px",
						};

						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, bBox.width + (bBox.x - start));
						ele.text(truncatedText);
					}
				});
		}

		this.xScaleRange = this.xScale.range();
		this.yScaleRange = this.yScale.range();

		this.xScaleMinRange = d3.min(this.xScaleRange);
		this.xScaleMaxRange = d3.max(this.xScaleRange);

		this.yScaleMinRange = d3.min(this.yScaleRange);
		this.yScaleMaxRange = d3.max(this.yScaleRange);

		return { xAxisG: this.xAxisG, yAxisG: this.yAxisG };

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
				if ((!this.isLeftYAxis && !this.xAxisSettings.isInvertRange) || (this.isLeftYAxis && this.xAxisSettings.isInvertRange)) {
					if (d.value1 >= d.value2) {
						return this.getXPosition(d.value1) + THIS.markerMaxSize / 2;
					} else {
						return this.getXPosition(d.value2) + (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				} else {
					if (d.value1 >= d.value2) {
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
				if ((!this.isLeftYAxis && !this.xAxisSettings.isInvertRange) || (this.isLeftYAxis && this.xAxisSettings.isInvertRange)) {
					if (d.value1 >= d.value2) {
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
					if (d.value1 >= d.value2) {
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
		if (this.isIBCSEnabled && this.selectedIBCSTheme !== EIBCSThemes.DefaultHorizontal && this.selectedIBCSTheme !== EIBCSThemes.DefaultVertical && (!this.CFCategoryColorPair[d.category].isMarker1Color && !this.CFCategoryColorPair[d.category].isMarker2Color)) {
			if (!this.isHasMultiMeasure) {
				if (d.value1 >= 0) {
					return this.getColor(POSITIVE_COLOR, EHighContrastColorType.Foreground);
				} else {
					return this.getColor(NEGATIVE_COLOR, EHighContrastColorType.Foreground);
				}
			} else {
				if (d.value1 >= 0 && d.value2 >= 0) {
					return this.getColor(POSITIVE_COLOR, EHighContrastColorType.Foreground);
				} else if (d.value1 <= 0 && d.value2 <= 0) {
					return this.getColor(NEGATIVE_COLOR, EHighContrastColorType.Foreground);
				} else {
					return this.getColor(POSITIVE_COLOR, EHighContrastColorType.Foreground);
				}
			}
		} else {
			if (this.isLollipopTypeCircle) {
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker1Color;
				const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
				const lineColor = this.lineSettings.isApplyMarkerColor ? this.categoryColorPair[d.category].marker1Color : this.lineSettings.lineColor;

				if (isPosNegColorScheme && this.lineSettings.isApplyMarkerColor) {
					return this.getColor(posNegColor, EHighContrastColorType.Foreground);
				} else {
					return this.getColor(this.categoryColorPair[d.category] && this.categoryColorPair[d.category].lineColor ? this.categoryColorPair[d.category].lineColor : lineColor, EHighContrastColorType.Foreground);
				}
			} else {
				const str = `${d.category}-${(d.subCategories ? d.subCategories[0] : this.chartData[0].subCategories[0]).category}`;
				const lineColor = this.lineSettings.isApplyMarkerColor ? this.subCategoryColorPair[str].marker1Color : this.lineSettings.lineColor;

				if (this.CFSubCategoryColorPair[str].isLineColor) {
					return this.getColor(this.subCategoryColorPair[str] && this.subCategoryColorPair[str].lineColor ? this.subCategoryColorPair[str].lineColor : lineColor, EHighContrastColorType.Foreground);
				}

				if (this.firstCFLine) {
					const str = `${d.category}-${this.firstCFLine.staticValue}`;
					return this.getColor(this.subCategoryColorPair[str] && this.subCategoryColorPair[str].lineColor ? this.subCategoryColorPair[str].lineColor : lineColor, EHighContrastColorType.Foreground);
				} else {
					return this.getColor(this.categoryColorPair[d.category] && this.categoryColorPair[d.category].lineColor ? this.categoryColorPair[d.category].lineColor : lineColor, EHighContrastColorType.Foreground);
				}
			}
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
				if ((this.isBottomXAxis && !this.yAxisSettings.isInvertRange) || (!this.isBottomXAxis && this.yAxisSettings.isInvertRange)) {
					if (d.value1 >= d.value2) {
						return this.getYPosition(d.value1) + THIS.markerMaxSize / 2;
					} else {
						return this.getYPosition(d.value2) + (this.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
					}
				} else {
					if (d.value1 >= d.value2) {
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
				if ((this.isBottomXAxis && !this.yAxisSettings.isInvertRange) || (!this.isBottomXAxis && this.yAxisSettings.isInvertRange)) {
					if (d.value1 >= d.value2) {
						const Y1 = THIS.getYPosition(d.value1) + THIS.markerMaxSize / 2;
						const Y2 = THIS.getYPosition(d.value2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y2, true) : 0)

						if (newY2 > Y1) {
							return newY2;
						} else {
							return Y1;
						}
					} else {
						const Y1 = THIS.getYPosition(d.value2) + (THIS.isHasMultiMeasure ? THIS.markerMaxSize / 2 : 0);
						const Y2 = THIS.getYPosition(d.value1) - (this.isHasMultiMeasure ? 0 : THIS.markerMaxSize / 2);
						const newY2 = Y2 - (THIS.isHasMultiMeasure ? THIS.isLollipopTypePie ? THIS.pie2Radius + THIS.getPieYScaleDiff(Y2, true) : THIS.circle2Size / 2 + THIS.getCircleYScaleDiff(Y2, true) : 0)

						if (newY2 >= Y1) {
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
		const markerSettings = isImage2 ? this.markerSettings.marker2Style : this.markerSettings.marker1Style;

		markerSelection
			.attr("width", width)
			.attr("height", height)
			.attr("xlink:href", (d: ILollipopChartRow) => {
				if (this.isHasImagesData && (isImage2 ? this.isShowImageMarker2 : this.isShowImageMarker1) && (isImage2 ? d.imageDataUrl2 : d.imageDataUrl1)) {
					return isImage2 ? d.imageDataUrl2 : d.imageDataUrl1;
				}

				if (markerSettings.markerShape === EMarkerShapeTypes.UPLOAD_ICON && markerSettings.markerShapeBase64Url) {
					return markerSettings.markerShapeBase64Url;
				}
			})
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", d => {
				if (isImage2) {
					const cx = this.getXPosition(this.isHorizontalChart ? d.value2 : d.category);
					if (!this.isLeftYAxis) {
						return this.isHorizontalChart ? cx - this.circle2Size / 2 - this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
					} else {
						return this.isHorizontalChart ? cx - this.circle2Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
					}
				} else {
					const cx = this.getXPosition(this.isHorizontalChart ? d.value1 : d.category);
					if (!this.isLeftYAxis) {
						return this.isHorizontalChart ? cx - this.circle1Size / 2 - this.getCircleXScaleDiff(cx, false) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
					} else {
						return this.isHorizontalChart ? cx - this.circle1Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
					}
				}
			})
			.attr("y", d => {
				if (isImage2) {
					const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value2);
					if (this.isBottomXAxis) {
						return !this.isHorizontalChart ? cy - this.circle2Size / 2 - this.getCircleYScaleDiff(cy, true) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
					} else {
						return !this.isHorizontalChart ? cy - this.circle2Size / 2 + this.getCircleYScaleDiff(cy, true) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
					}
				} else {
					const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value1);
					if (this.isBottomXAxis) {
						return !this.isHorizontalChart ? cy - this.circle1Size / 2 - this.getCircleYScaleDiff(cy, false) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
					} else {
						return !this.isHorizontalChart ? cy - this.circle1Size / 2 + this.getCircleYScaleDiff(cy, false) : cy + this.scaleBandWidth / 2 - this.circle1Size / 2;
					}
				}
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
				THIS.lollipopG.selectAll(".lollipop-group").style("cursor", "unset");

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

	getDataLabel = (d: ILollipopChartRow, isData2Label: boolean) => {
		const dataLabelsSettings = isData2Label ? this.data2LabelsSettings : this.data1LabelsSettings;
		const key = isData2Label ? "value2" : "value1";
		const firstCategory = this.chartData[0].category;
		const lastCategory = this.chartData[this.chartData.length - 1].category;
		let label = "";
		const measureNumberFormatter = this.measureNumberFormatter[isData2Label ? 1 : 0];

		switch (dataLabelsSettings.displayType) {
			case EDataLabelsDisplayTypes.All:
				label = this.formatNumber(d[key], this.numberSettings, measureNumberFormatter, true, true);
				break;

			case EDataLabelsDisplayTypes.FirstLast:
				if (d.category === firstCategory) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				if (d.category === lastCategory) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}
				break;

			case EDataLabelsDisplayTypes.MinMax:
				if (d.category === this.minCategoryValueDataPair.category) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				if (d.category === this.maxCategoryValueDataPair.category) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				break;

			case EDataLabelsDisplayTypes.LastOnly:
				if (d.category === lastCategory) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				break;

			case EDataLabelsDisplayTypes.MaxOnly:
				if (d.category === this.maxCategoryValueDataPair.category) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				break;

			case EDataLabelsDisplayTypes.FirstLastMinMax:
				if (d.category === firstCategory) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				if (d.category === lastCategory) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				if (d.category === this.minCategoryValueDataPair.category) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}

				if (d.category === this.maxCategoryValueDataPair.category) {
					label = this.formatNumber(d[key], this.numberSettings, this.measureNumberFormatter[isData2Label ? 1 : 0], true, true)
				}
				break;

			case EDataLabelsDisplayTypes.CustomLabel:
				if (this.isHasExtraDataLabels) {
					label = this.formatNumber(isData2Label ? d.extraLabel2 : d.extraLabel1, this.numberSettings, this.allNumberFormatter[dataLabelsSettings.customLabel], true, true);
				}
				break;
		}

		return label;
	}

	drawLollipopChart(): void {
		this.chartData.forEach(d => {
			d.data1Label = this.getDataLabel(d, false);
			d.data2Label = this.getDataLabel(d, true);

			if (!this.isHasMultiMeasure) {
				if (!this.isHorizontalChart) {
					d.value2 = 0;
				} else {
					d.value2 = 0;
				}
			}
		})

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

		let marker1: IMarkerData;
		let marker2: IMarkerData;

		// marker 1
		const marker1Style = this.markerSettings.marker1Style;
		if (marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = marker1Style.markerShapeValue;
			marker1 = {
				label: marker1Style.markerShapeValue.iconName,
				value: marker1Style.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: marker1Style.markerShapePath, stroke: undefined }]
			}
		} else {
			marker1 = CATEGORY_MARKERS.find(d => d.value === marker1Style.dropdownMarkerType);
		}

		// marker 2
		const marker2Style = this.markerSettings.marker2Style;
		if (marker2Style.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = marker2Style.markerShapeValue;
			marker2 = {
				label: marker2Style.markerShapeValue.iconName,
				value: marker2Style.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: marker2Style.markerShapePath, stroke: undefined }]
			}
		} else {
			marker2 = CATEGORY_MARKERS.find(d => d.value === marker2Style.dropdownMarkerType);
		}

		this.lollipopSelection = lollipopSelection.join(
			(enter) => {
				const lollipopG = enter.append("g").attr("class", "lollipop-group").attr("display", d => {
					if (this.isHorizontalChart) {
						if (this.xAxisSettings.isMinimumRangeEnabled) {
							if (d.value1 < this.xAxisSettings.minimumRange || (this.isHasMultiMeasure ? d.value2 < this.xAxisSettings.minimumRange : false)) {
								return "none";
							} else {
								return "block";
							}
						} else {
							return "block";
						}
					} else {
						if (this.yAxisSettings.isMinimumRangeEnabled) {
							if (d.value1 < this.yAxisSettings.minimumRange || (this.isHasMultiMeasure ? d.value2 < this.yAxisSettings.minimumRange : false)) {
								return "none";
							} else {
								return "block";
							}
						} else {
							return "block";
						}
					}
				});

				lollipopG.on("click", () => {
					this.handleCreateOwnDynamicDeviationOnBarClick(lollipopG.node());
				});

				const lineSelection = lollipopG.append("line").attr("class", this.lineSettings.lineType).classed(this.lineClass, true);


				// marker 1
				if (((this.isHasImagesData && this.isShowImageMarker1) || (this.isLollipopTypeCircle && marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && marker1Style.markerShapeBase64Url))) {
					const imageMarker1Selection: D3Selection<any> = lollipopG.append("svg:image")
						.classed(this.circleClass, true)
						.classed(this.imageMarkerClass, true)
						.classed("image-marker1", true);

					imageMarker1Selection
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
						});

					this.imageMarkerFormatting(imageMarker1Selection, false, true);
				} else {
					if (this.isLollipopTypeCircle && (marker1Style.markerShape === EMarkerShapeTypes.DEFAULT || marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
						const symbol1 = lollipopG.append("defs")
							.append("symbol")
							.attr("id", d => this.isSmallMultiplesEnabled ? `${d.category}_${this.currentSmallMultipleIndex}_${marker1.value}_MARKER1` : `${d.category}_${marker1.value}_MARKER1`)
							.attr("class", "marker1-symbol")
							.attr("viewBox", `${-this.marker1OutlineWidth} ${-this.marker1OutlineWidth} ${marker1.w + (this.marker1OutlineWidth * 2)} ${marker1.h + (this.marker1OutlineWidth * 2)}`);

						const path1Selection = symbol1.append("path")
							.attr("d", marker1.paths[0].d)
							.attr("class", "marker1-path");

						const circle1Selection = lollipopG.append("use")
							.attr("id", CircleType.Circle1)
							.classed(this.circleClass, true)
							.classed(this.circle1Class, true);

						this.setPath1Formatting(path1Selection);
						this.setCircle1Formatting(circle1Selection, marker1, true);

						circle1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});

						path1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});
					} else {
						const pie1Selection = lollipopG.append("foreignObject")
							.attr("id", "pie1ForeignObject");
						this.enterPieChart(pie1Selection, false, true);
						this.setPieDataLabelsDisplayStyle();

						pie1Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
							});
					}
				}


				// marker 2
				if (this.isHasMultiMeasure) {
					if (((this.isHasImagesData && this.isShowImageMarker2) || (this.isLollipopTypeCircle && marker2Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && marker2Style.markerShapeBase64Url))) {
						const imageMarker2Selection: D3Selection<any> = lollipopG.append("svg:image")
							.classed(this.circleClass, true)
							.classed(this.imageMarkerClass, true)
							.classed("image-marker2", true);

						imageMarker2Selection
							.datum(d => {
								return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
							});

						this.imageMarkerFormatting(imageMarker2Selection, true, true);
					} else {
						if (this.isLollipopTypeCircle && (marker2Style.markerShape === EMarkerShapeTypes.DEFAULT || marker2Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
							const symbol2 = lollipopG.append("defs")
								.append("symbol")
								.attr("id", d => this.isSmallMultiplesEnabled ? `${d.category}_${this.currentSmallMultipleIndex}_${marker2.value}_MARKER2` : `${d.category}_${marker2.value}_MARKER2`)
								.attr("class", "marker2-symbol")
								.attr("viewBox", `${-this.marker2OutlineWidth} ${-this.marker2OutlineWidth} ${marker2.w + (this.marker2OutlineWidth * 2)} ${marker2.h + (this.marker2OutlineWidth * 2)}`);

							const path2Selection = symbol2.append("path")
								.attr("d", marker2.paths[0].d)
								.attr("class", "marker2-path");

							const circle2Selection = lollipopG.append("use")
								.attr("id", CircleType.Circle2)
								.classed(this.circleClass, true).classed(this.circle2Class, true);

							this.setPath2Formatting(path2Selection);
							this.setCircle2Formatting(circle2Selection, marker2, true);

							path2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
								});

							circle2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
								});
						} else {
							const pie2Selection = lollipopG.append("foreignObject")
								.attr("id", "pie2ForeignObject");
							this.enterPieChart(pie2Selection, true, true);
							this.setPieDataLabelsDisplayStyle(true);

							pie2Selection
								.datum(d => {
									return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
								})
						}
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
				update.attr("display", d => {
					if (this.isHorizontalChart) {
						if (this.xAxisSettings.isMinimumRangeEnabled) {
							if (d.value1 < this.xAxisSettings.minimumRange || (this.isHasMultiMeasure ? d.value2 < this.xAxisSettings.minimumRange : false)) {
								return "none";
							} else {
								return "block";
							}
						} else {
							return "block";
						}
					} else {
						if (this.yAxisSettings.isMinimumRangeEnabled) {
							if (d.value1 < this.yAxisSettings.minimumRange || (this.isHasMultiMeasure ? d.value2 < this.yAxisSettings.minimumRange : false)) {
								return "none";
							} else {
								return "block";
							}
						} else {
							return "block";
						}
					}
				});

				const marker1Style = this.markerSettings.marker1Style;
				const marker2Style = this.markerSettings.marker2Style;

				const lineSelection = update.select(this.lineClassSelector).attr("class", this.lineSettings.lineType).classed(this.lineClass, true);

				const marker1SymbolSelection = update.select(".marker1-symbol");

				const marker2SymbolSelection = update.select(".marker2-symbol");

				// marker 1
				if (this.isLollipopTypeCircle && (marker1Style.markerShape === EMarkerShapeTypes.DEFAULT || marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
					marker1SymbolSelection
						.attr("id", d => this.isSmallMultiplesEnabled ? `${d.category}_${this.currentSmallMultipleIndex}_${marker1.value}_MARKER1` : `${d.category}_${marker1.value}_MARKER1`)
						.attr("viewBox", `${-this.marker1OutlineWidth} ${-this.marker1OutlineWidth} ${marker1.w + (this.marker1OutlineWidth * 2)} ${marker1.h + (this.marker1OutlineWidth * 2)}`);
				}

				// marker 2
				if (this.isLollipopTypeCircle && (marker2Style.markerShape === EMarkerShapeTypes.DEFAULT || marker2Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
					marker2SymbolSelection
						.attr("id", d => this.isSmallMultiplesEnabled ? `${d.category}_${this.currentSmallMultipleIndex}_${marker2.value}_MARKER2` : `${d.category}_${marker2.value}_MARKER2`)
						.attr("viewBox", `${-this.marker2OutlineWidth} ${-this.marker2OutlineWidth} ${marker2.w + (this.marker2OutlineWidth * 2)} ${marker2.h + (this.marker2OutlineWidth * 2)}`);
				}

				const path1Selection = update.select(".marker1-path").attr("d", this.isLollipopTypeCircle ? marker1.paths[0].d : "");

				const circle1Selection = update.select(this.circle1ClassSelector);

				const path2Selection = update.select(".marker2-path").attr("d", this.isLollipopTypeCircle ? marker2.paths[0].d : "");

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

				// marker 1
				if (((this.isHasImagesData && this.isShowImageMarker1) || (this.isLollipopTypeCircle && this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.markerSettings.marker1Style.markerShapeBase64Url))) {
					this.imageMarkerFormatting(imageMarker1Selection, false, false);

					if (this.isHasMultiMeasure) {
						this.imageMarkerFormatting(imageMarker2Selection, true, false);
					}
				} else {
					if (this.isLollipopTypeCircle && (this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.DEFAULT || this.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
						pie1Selection.remove();
						pie2Selection.remove();

						this.setPath1Formatting(path1Selection);
						this.setCircle1Formatting(circle1Selection, marker1, false);

						if (this.isHasMultiMeasure) {
							this.setPath2Formatting(path2Selection);
							this.setCircle2Formatting(circle2Selection, marker2, false);
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

				// marker 2
				if (((this.isHasImagesData && this.isShowImageMarker2) || (this.isLollipopTypeCircle && this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && this.markerSettings.marker2Style.markerShapeBase64Url))) {
					this.imageMarkerFormatting(imageMarker1Selection, false, false);

					if (this.isHasMultiMeasure) {
						this.imageMarkerFormatting(imageMarker2Selection, true, false);
					}
				} else {
					if (this.isLollipopTypeCircle && (this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.DEFAULT || this.markerSettings.marker2Style.markerShape === EMarkerShapeTypes.ICONS_LIST)) {
						pie1Selection.remove();
						pie2Selection.remove();

						this.setPath1Formatting(path1Selection);
						this.setCircle1Formatting(circle1Selection, marker1, false);

						if (this.isHasMultiMeasure) {
							this.setPath2Formatting(path2Selection);
							this.setCircle2Formatting(circle2Selection, marker2, false);
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

		if (this.isLollipopTypeCircle || (this.isLollipopTypePie)) {
			this.drawData1Labels(this.dataLabelsSettings.show ? this.chartData : []);
			this.drawData2Labels(this.dataLabelsSettings.show && this.isHasMultiMeasure ? this.chartData : []);
		} else {
			this.drawData1Labels([]);
			this.drawData2Labels([]);
		}

		RenderErrorBars(this, this.isShowErrorBars && this.errorBarsSettings.errorBars.isEnabled ? this.chartData : [], false);

		if (this.isRenderBothErrorBars) {
			RenderErrorBars(this, this.isShowErrorBars && this.errorBarsSettings.errorBars.isEnabled ? this.chartData : [], true);
		} else {
			RenderErrorBars(this, [], true);
		}

		RenderErrorBand(this, this.isShowErrorBars && this.errorBarsSettings.errorBand.isEnabled ? this.chartData : [], false);

		if (this.isRenderBothErrorBars) {
			RenderErrorBand(this, this.isShowErrorBars && this.errorBarsSettings.errorBand.isEnabled ? this.chartData : [], true);
		}

		if (this.errorBarsSettings.measurement.calcType === EErrorBarsCalcTypes.ByField && !this.isHasErrorLowerBounds && !this.isHasErrorUpperBounds) {
			RenderErrorBars(this, [], false);
			RenderErrorBand(this, [], false);
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
					THIS.lollipopG.selectAll(".lollipop-group").style("cursor", "cell");
					if (THIS.fromCategoryValueDataPair && !THIS.toCategoryValueDataPair) {
						const data: any = d3.select(this).datum();
						const toCategoryValueDataPair = { category: data.category, value: data.value1 };
						RenderDynamicDeviation(THIS, THIS.fromCategoryValueDataPair, toCategoryValueDataPair);
						THIS.toCategoryValueDataPair = undefined!;
					}
				}
			});

		if (this.dynamicDeviationSettings.isEnabled && !this.isHasMultiMeasure) {
			SetDynamicDeviationDataAndDrawLines(this);
		} else {
			this.lollipopG.selectAll(".lollipop-group").style("cursor", "unset");
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

		if (this.isCutAndClipAxisEnabled) {
			RenderCutAndClipMarkerOnAxis(this);
		} else {
			this.container.select(".axisCutAndClipMarkerG").selectAll("*").remove();
		}

		RenderBarCutAndClipMarker(this, this.isCutAndClipAxisEnabled && this.cutAndClipAxisSettings.markerPlacement !== ECutAndClipMarkerPlacementTypes.Axis ? this.chartData : []);

		RenderLollipopAnnotations(this, GetAnnotationDataPoint.bind(this));

		const onLollipopClick = (ele: D3Selection<SVGElement>) => {
			this.handleCreateOwnDynamicDeviationOnBarClick(ele.node());
		}

		if (!this.isLollipopTypePie) {
			SetAndBindChartBehaviorOptions(this, d3.selectAll(".lollipop-group"), d3.selectAll(".lollipop-line"), onLollipopClick);
		} else {
			SetAndBindChartBehaviorOptions(this, d3.selectAll(".pie-slice"), d3.selectAll(".lollipop-line"), onLollipopClick);
		}
		this.behavior.renderSelection(this.interactivityService.hasSelection());

		this.drawTooltip();
	}

	drawZeroSeparatorLine(): void {
		this.zeroSeparatorLine
			.attr("stroke", this.getColor(this.chartSettings.zeroBaseLineColor, EHighContrastColorType.Foreground))
			.attr("stroke-width", this.chartSettings.zeroBaseLineSize)
			.attr("display", this.chartSettings.isShowZeroBaseLine ? "block" : "none");

		let xAxisRange: number[];
		if (this.isCutAndClipAxisEnabled) {
			xAxisRange = this.beforeCutLinearScale.range();
		} else {
			xAxisRange = this.xScale.range();
		}

		let yAxisRange: number[];
		if (this.isCutAndClipAxisEnabled) {
			yAxisRange = this.beforeCutLinearScale.range();
		} else {
			yAxisRange = this.yScale.range();
		}

		if (this.isHorizontalChart) {
			this.zeroSeparatorLine
				.attr("x1", this.getXPosition(0))
				.attr("x2", this.getXPosition(0))
				.attr("y1", yAxisRange[1])
				.attr("y2", yAxisRange[0]);
		} else {
			this.zeroSeparatorLine
				.attr("x1", xAxisRange[0])
				.attr("x2", xAxisRange[1])
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

	setPath1Formatting(circleSelection: any): void {
		const marker1Style = this.markerSettings.marker1Style;
		circleSelection
			.attr("stroke-width", this.marker1OutlineWidth)
			.each((d: ILollipopChartRow, i: number, nodes) => {
				const ele = d3.select(nodes[i]);
				let fill: string;
				let isHasPattern: boolean;
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker1Color;
				const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
				const color = this.getColor(isPosNegColorScheme && (this.dataColorsSettings.isCustomizeOthersColor ? !d.category.includes(this.othersLabel) : true) ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);
				let pattern = d.pattern;
				if ((this.isHasMultiMeasure || (this.isLollipopTypePie && this.dataColorsSettings.fillType === ColorPaletteType.Single)) && this.isPatternApplied) {
					pattern = this.patternByMeasures[DataValuesType.Value1];
				}
				if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
					fill = `url('#${generatePattern(this.svg, pattern, color)}')`;
					isHasPattern = true;
				} else {
					fill = color;
				}

				if (marker1Style.isShowMarkerOutline && marker1Style.showOutlineOnly) {
					ele
						.attr("fill", !isHasPattern ? "rgba(255, 255, 255, 1)" : `url('#${generatePattern(this.svg, pattern, marker1Style.sameOutlineAsMarkerColor ? color : marker1Style.outlineColor)}')`)
						.attr("stroke", marker1Style.sameOutlineAsMarkerColor ? color : marker1Style.outlineColor)
				} else {
					ele
						.attr("fill", fill)
						.attr("stroke", marker1Style.sameOutlineAsMarkerColor ? color : marker1Style.outlineColor)
				}
			}
			);
	}

	getCircleXScaleDiff(cx: number, isCircle2: boolean): number {
		if (!this.isLeftYAxis) {
			const isLessSpace = (this.width - this.xAxisStartMargin - cx) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				// this.circleXScaleDiff.push(Math.abs((this.width - this.xAxisStartMargin - cx) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
				return 0;
				// return Math.abs((this.width - this.xAxisStartMargin - cx) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (cx - this.xAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				// this.circleXScaleDiff.push(Math.abs((cx - this.xAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
				return 0;
				// return Math.abs((cx - this.xAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		}
	}

	getCircleYScaleDiff(cy: number, isCircle2: boolean): number {
		if (this.isBottomXAxis) {
			const isLessSpace = (this.height - this.yAxisStartMargin - cy) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				// this.circleYScaleDiff.push(Math.abs((this.height - this.yAxisStartMargin - cy) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
				return 0;
				// return Math.abs((this.height - this.yAxisStartMargin - cy) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (cy - this.yAxisStartMargin) <= (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2);
			if (isLessSpace) {
				// this.circleYScaleDiff.push(Math.abs((cy - this.yAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2)));
				return 0;
				// return Math.abs((cy - this.yAxisStartMargin) - (isCircle2 ? this.circle2Size / 2 : this.circle1Size / 2));
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
			.attr("width", this.circle1Size + (this.marker1OutlineWidth * 2))
			.attr("height", this.circle1Size + (this.marker1OutlineWidth * 2))
			.attr("href", d => this.isSmallMultiplesEnabled ? `#${d.category}_${this.currentSmallMultipleIndex}_${marker.value}_MARKER1` : `#${d.category}_${marker.value}_MARKER1`)
			.style("display", "block")
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const cx = this.getXPosition(this.isHorizontalChart ? d.value1 : d.category) - this.marker1OutlineWidth;
				if (!this.isLeftYAxis) {
					return this.isHorizontalChart ? cx - this.circle1Size / 2 - this.getCircleXScaleDiff(cx, false) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
				} else {
					return this.isHorizontalChart ? cx - this.circle1Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle1Size / 2;
				}
			})
			.attr("y", (d) => {
				const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value1) - this.marker1OutlineWidth;
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
		const marker2Style = this.markerSettings.marker2Style;
		circleSelection
			.attr("stroke-width", this.marker2OutlineWidth)
			.each((d: ILollipopChartRow, i: number, nodes) => {
				const ele = d3.select(nodes[i]);
				let fill: string;
				let isHasPattern: boolean;
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker2Color;
				const posNegColor = d.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
				const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker2Color : null), EHighContrastColorType.Foreground);
				let pattern = d.pattern;
				if ((this.isHasMultiMeasure || (this.isLollipopTypePie && this.dataColorsSettings.fillType === ColorPaletteType.Single)) && this.isPatternApplied) {
					pattern = this.patternByMeasures[DataValuesType.Value1];
				}
				if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
					fill = `url('#${generatePattern(this.svg, pattern, color)}')`;
					isHasPattern = true;
				} else {
					fill = color;
				}

				if (marker2Style.isShowMarkerOutline && marker2Style.showOutlineOnly) {
					ele
						.attr("fill", !isHasPattern ? "rgba(255, 255, 255, 1)" : `url('#${generatePattern(this.svg, pattern, marker2Style.sameOutlineAsMarkerColor ? color : marker2Style.outlineColor)}')`)
						.attr("stroke", marker2Style.sameOutlineAsMarkerColor ? color : marker2Style.outlineColor)
				} else {
					ele
						.attr("fill", fill)
						.attr("stroke", marker2Style.sameOutlineAsMarkerColor ? color : marker2Style.outlineColor)
				}
			}
			);
	}

	setCircle2Formatting(circleSelection: any, marker: IMarkerData, isEnter: boolean): void {
		this.setCircle2Radius();
		circleSelection
			.attr("width", this.circle2Size + (this.marker2OutlineWidth * 2))
			.attr("height", this.circle2Size + (this.marker2OutlineWidth * 2))
			.attr("href", d => this.isSmallMultiplesEnabled ? `#${d.category}_${this.currentSmallMultipleIndex}_${marker.value}_MARKER2` : `#${d.category}_${marker.value}_MARKER2`)
			.style("display", (d) => (this.isHasMultiMeasure && d.value2 ? "block" : "none"))
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const cx = this.getXPosition(this.isHorizontalChart ? d.value2 : d.category) - this.marker2OutlineWidth;
				if (!this.isLeftYAxis) {
					return this.isHorizontalChart ? cx - this.circle2Size / 2 - this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
				} else {
					return this.isHorizontalChart ? cx - this.circle2Size / 2 + this.getCircleXScaleDiff(cx, true) : cx + this.scaleBandWidth / 2 - this.circle2Size / 2;
				}
			})
			.attr("y", (d) => {
				const cy = this.getYPosition(this.isHorizontalChart ? d.category : d.value2) - this.marker2OutlineWidth;
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
		const marker1Style = this.markerSettings.marker1Style;
		const marker2Style = this.markerSettings.marker2Style;

		let marker1OutlineColor = marker1Style.outlineColor;
		let marker2OutlineColor = marker2Style.outlineColor;

		const getPieFill = (d: IChartSubCategory, parent: ILollipopChartRow) => {
			let color;
			const valueType = isPie2 ? "value2" : "value1";
			let isHasPattern: boolean;

			if (((d.parentCategory === this.othersBarText) || this.isCurrentSmallMultipleIsOthers) && this.dataColorsSettings.isCustomizeOthersColor) {
				color = this.dataColorsSettings.othersColor;
			} else {
				const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative;
				const posNegColor = parent[valueType] >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;

				if (isPosNegColorScheme) {
					color = posNegColor;
				} else {
					color = isPie2 ? this.subCategoryColorPair[`${parent.category}-${d.category}`].marker2Color : this.subCategoryColorPair[`${parent.category}-${d.category}`].marker1Color;
				}
			}

			let pattern = d.pattern;

			if (this.isLollipopTypePie && this.isHasMultiMeasure && this.patternSettings.basedOn === EPatternByDataTypes.ByMeasures) {
				if ((this.isLollipopTypePie) && this.isPatternApplied) {
					pattern = this.patternByMeasures[isPie2 ? DataValuesType.Value2 : DataValuesType.Value1];
				}
			}

			if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
				isHasPattern = true;
				return { color, pieFill: `url('#${generatePattern(this.svg, pattern, color)}')`, isHasPattern, pattern };
			} else {
				return { color, pieFill: color, isHasPattern, pattern };
			}
		}

		const getItemStyle = (color: string) => {
			let itemStyle = {};

			if (marker1Style.isShowMarkerOutline) {
				if (marker1Style.sameOutlineAsMarkerColor) {
					marker1OutlineColor = color;
				}
			}

			if (marker2Style.isShowMarkerOutline) {
				if (marker2Style.sameOutlineAsMarkerColor) {
					marker2OutlineColor = color;
				}
			}

			switch (isPie2 ? this.markerSettings.marker2Style.markerChart : this.markerSettings.marker1Style.markerChart) {
				case EMarkerChartTypes.PIE: {
					itemStyle = {
						borderRadius: 0,
						borderColor: isPie2 ? marker2OutlineColor : marker1OutlineColor,
						borderWidth: isPie2 ? this.marker2OutlineWidth : this.marker1OutlineWidth,
					};
					break;
				}
				case EMarkerChartTypes.DONUT: {
					itemStyle = {
						borderRadius: 3,
						borderColor: isPie2 ? marker2OutlineColor : marker1OutlineColor,
						borderWidth: isPie2 ? this.marker2OutlineWidth : this.marker1OutlineWidth,
					};
					break;
				}
				case EMarkerChartTypes.ROSE: {
					itemStyle = {
						borderRadius: 3,
						borderColor: isPie2 ? marker2OutlineColor : marker1OutlineColor,
						borderWidth: isPie2 ? this.marker2OutlineWidth : this.marker1OutlineWidth,
					};
					break;
				}
			}

			return itemStyle;
		}

		const data = this.chartData[id].subCategories.map((data) => {
			const { color, pieFill, isHasPattern, pattern } = getPieFill(data, this.chartData[id]);
			let color1 = pieFill;
			let color2 = pieFill;
			const borderColor = color;

			if (marker1Style.isShowMarkerOutline) {
				if (marker1Style.showOutlineOnly) {
					if (isHasPattern) {
						color1 = `url('#${generatePattern(this.svg, pattern, marker1Style.sameOutlineAsMarkerColor ? color : marker1Style.outlineColor)}')`;
					} else {
						color1 = "#ffffff";
					}
				}
			}

			if (marker2Style.isShowMarkerOutline) {
				if (marker2Style.showOutlineOnly) {
					if (isHasPattern) {
						color2 = `url('#${generatePattern(this.svg, pattern, marker2Style.sameOutlineAsMarkerColor ? color : marker2Style.outlineColor)}')`;
					} else {
						color2 = "#ffffff";
					}
				}
			}

			return {
				value: isPie2 ? (data.value2 < 0 ? (data.value2 * -1) : data.value2) : (data.value1 < 0 ? (data.value1 * -1) : data.value1),
				name: data.category,
				itemStyle: { ...getItemStyle(borderColor), color: this.getColor(isPie2 ? color2 : color1, EHighContrastColorType.Foreground), className: "pie-slice" },
			}
		});

		return data.filter(d => d.value !== 0);
	}

	getPieSliceClass(category: string, subCategory: string): string {
		return `${category}-${subCategory}`.replace(/ /g, "").toLocaleLowerCase().trim();
	}

	getPieChartSeriesRadius(isPie2: boolean): string | string[] | number[] {
		switch (isPie2 ? this.markerSettings.marker2Style.markerChart : this.markerSettings.marker1Style.markerChart) {
			case EMarkerChartTypes.PIE: {
				return `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`;
			}
			case EMarkerChartTypes.DONUT: {
				return ["55%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			case EMarkerChartTypes.ROSE: {
				return ["0%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			default: {
				return `${this.pieViewBoxRatio}%`;
			}
		}
	}

	getPieDataLabelsFontSize(isPie2: boolean = false): number {
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const dataLabelsSettings = isPie2 ? this.data2LabelsSettings : this.data1LabelsSettings;

		let autoFontSize = dataLabelsSettings.fontSize;
		switch (isPie2 ? this.markerSettings.marker2Style.markerChart : this.markerSettings.marker1Style.markerChart) {
			case EMarkerChartTypes.PIE:
				autoFontSize = (pieRadius - pieRadius * (this.pieEmphasizeScaleSize / 100)) / 2;
				break;

			case EMarkerChartTypes.DONUT:
				autoFontSize = pieRadius - pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100);
				break;

			case EMarkerChartTypes.ROSE:
				autoFontSize = pieRadius - pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100);
				break;
		}

		if (!dataLabelsSettings.isAutoFontSize) {
			return dataLabelsSettings.fontSize;
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
					radius: this.getPieChartSeriesRadius(isPie2),
					emphasis: {
						scale: false,
					},
					data: this.getPieChartSeriesDataByCategory(category, isPie2),
				},
			],
		};
		const dataLabelsSettings = isPie2 ? this.data2LabelsSettings : this.data1LabelsSettings;

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
			// show: this.dataLabelsSettings.show && this.dataLabelsSettings.placement === DataLabelsPlacement.Inside,
			color: this.getColor(dataLabelsSettings.color, EHighContrastColorType.Foreground),
			textBorderColor: this.getColor(dataLabelsSettings.borderColor, EHighContrastColorType.Foreground),
			textBorderWidth: dataLabelsSettings.borderWidth,
			fontSize: this.getPieDataLabelsFontSize(isPie2),
			fontFamily: dataLabelsSettings.fontFamily,
			textDecoration: "underline",
			textStyle: {
				fontWeight: dataLabelsSettings.fontStyle.includes(EFontStyle.Bold) ? "bold" : "",
				fontStyle: dataLabelsSettings.fontStyle.includes(EFontStyle.Italic) ? "italic" : "",
				decoration: dataLabelsSettings.fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "", // Set text decoration to underline
			},
			position: "center",
			formatter: () => {
				return this.formatNumber(categoryValue, this.numberSettings, this.measureNumberFormatter[isPie2 ? 1 : 0], true, true);
			},
		};

		const categoryValue = this.chartData.find((d) => d.category === category)[isPie2 ? "value2" : "value1"];

		switch (isPie2 ? this.markerSettings.marker2Style.markerChart : this.markerSettings.marker1Style.markerChart) {
			case EMarkerChartTypes.PIE: {
				pieOption.series[0].roseType = "";
				break;
			}
			case EMarkerChartTypes.DONUT: {
				pieOption.series[0].roseType = "";
				break;
			}
			case EMarkerChartTypes.ROSE: {
				pieOption.series[0].roseType = "area";
				pieOption.series[0].center = ["50%", "50%"];
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
				// this.pieXScaleDiff.push(Math.abs((x - this.xAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius)));
				return 0;
				// return Math.abs((x - this.xAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (this.width - this.xAxisStartMargin - x) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				// this.pieXScaleDiff.push(Math.abs((this.width - this.xAxisStartMargin - x) - (isPie2 ? this.pie2Radius : this.pie1Radius)));
				return 0;
				// return Math.abs((this.width - this.xAxisStartMargin - x) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		}
	}

	getPieYScaleDiff(y: number, isPie2: boolean): number {
		if (this.isBottomXAxis) {
			const isLessSpace = (this.height - this.yAxisStartMargin - y) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				// this.pieYScaleDiff.push(Math.abs((this.height - this.yAxisStartMargin - y) - (isPie2 ? this.pie2Radius : this.pie1Radius)));
				return 0;
				// return Math.abs((this.height - this.yAxisStartMargin - y) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		} else {
			const isLessSpace = (y - this.yAxisStartMargin) <= (isPie2 ? this.pie2Radius : this.pie1Radius);
			if (isLessSpace) {
				// this.pieYScaleDiff.push(Math.abs((y - this.yAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius)));
				return 0;
				// return Math.abs((y - this.yAxisStartMargin) - (isPie2 ? this.pie2Radius : this.pie1Radius));
			} else {
				return 0;
			}
		}
	}

	getTooltipCategoryText(text: string, toUpperCase: boolean = true): string {
		if (text) {
			text = text.toString();
			const isOthersTick = text.toString().includes(this.othersLabel);
			if (this.isXIsDateTimeAxis && !this.isXIsContinuousAxis && !this.isHorizontalChart && !isOthersTick) {
				if (!this.xAxisSettings.isAutoDateFormat) {
					return FormatAxisDate(this.xAxisSettings.dateFormat === EAxisDateFormats.Custom ? this.xAxisSettings.customDateFormat : this.xAxisSettings.dateFormat, text);
				} else {
					return valueFormatter.create({ format: this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
				}
			} else if (this.isYIsDateTimeAxis && !this.isYIsContinuousAxis && this.isHorizontalChart && !isOthersTick) {
				if (!this.yAxisSettings.isAutoDateFormat) {
					return FormatAxisDate(this.yAxisSettings.dateFormat === EAxisDateFormats.Custom ? this.yAxisSettings.customDateFormat : this.yAxisSettings.dateFormat, text);
				} else {
					return valueFormatter.create({ format: this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
				}
			} else {
				return ((typeof text === "string" && toUpperCase) ? text.toUpperCase() : text).toString().replace(/--\d+/g, '');
			}
		} else {
			return "";
		}
	}

	configurePieChart(d: ILollipopChartRow, ele: D3Selection<SVGElement>, i: number, isPie2: boolean): void {
		d.subCategories.forEach(s => {
			s.defaultValue = isPie2 ? s.value2 : s.value1;
			s.valueType = d.valueType;
		})

		// ele.selectAll("path").data(d.subCategories);

		ele.selectAll("path").attr("id", () => {
			return isPie2 ? PieType.Pie2 : PieType.Pie1;
		});

		ele.selectAll("path").attr("class", () => {
			return "pie-slice";
			// return this.getPieSliceClass(d.category, pieData ? pieData.category + " " + "pie-slice" : "");
		});

		ele.selectAll(".pie-slice").each(function (_, i) {
			const bBox = (d3.select(this).node() as SVGSVGElement).getBBox();
			d3.select(this).datum((datum: any) => {
				return { ...(datum ? datum : d.subCategories[i]), valueType: isPie2 ? DataValuesType.Value2 : DataValuesType.Value1, sliceWidth: bBox.width, sliceHeight: bBox.height }
			})
		})

		// .attr("fill", (d: IChartSubCategory) => {
		// 	return d.styles[pieType].color;
		// });

		this.tooltipServiceWrapper.addTooltip(
			ele.selectAll(".pie-slice"),
			(datapoint: IChartSubCategory) => getTooltipData(datapoint, isPie2),
			(datapoint: IChartSubCategory) => datapoint.identity
		);

		const numberFormatter = (value: number, numberFormatter: IValueFormatter) => {
			return this.numberSettings.show ? this.formatNumber(value, this.numberSettings, numberFormatter, true, true) : powerBiNumberFormat(value, numberFormatter);
		};

		const getTooltipData = (pieData: IChartSubCategory, isPie2: boolean): VisualTooltipDataItem[] => {
			const isPosNegColorScheme1 = !this.isShowMarker1OutlineColor && this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFSubCategoryColorPair[`${pieData.parentCategory}-${pieData.category}`].isMarker1Color;
			const isPosNegColorScheme2 = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFSubCategoryColorPair[`${pieData.parentCategory}-${pieData.category}`].isMarker2Color;
			const posNegColor1 = pieData.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
			const posNegColor2 = pieData.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;

			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: this.getTooltipCategoryText(pieData.parentCategory).toString(),
					color: "transparent",
				},
				{
					displayName: this.subCategoryDisplayName,
					value: pieData.category.toString(),
					color: "transparent",
				},
				{
					displayName: this.measure1DisplayName,
					value: numberFormatter(pieData.value1, this.measureNumberFormatter[0]),
					color: (pieData.parentCategory.toString().includes(this.othersLabel) ? this.dataColorsSettings.othersColor : isPosNegColorScheme1 ? posNegColor1 : this.subCategoryColorPair[`${pieData.parentCategory}-${pieData.category}`].marker1Color)
				}
			];

			if (this.isHasMultiMeasure) {
				tooltipData.push({
					displayName: this.measure2DisplayName,
					value: numberFormatter(pieData.value2, this.measureNumberFormatter[1]),
					color: (isPosNegColorScheme2 ? posNegColor2 : this.subCategoryColorPair[`${pieData.parentCategory}-${pieData.category}`].marker2Color),
				})
			}

			pieData.tooltipFields.forEach((data, i: number) => {
				let text = data.value;

				if (this.categoricalTooltipFields[i].source.type.text && pieData.category === this.othersBarText) {
					text = this.othersBarText;
				} else if (this.categoricalTooltipFields[i].source.type.dateTime) {
					text = powerBiNumberFormat(new Date(data.value), this.tooltipNumberFormatter[i]);
				} else {
					if (this.categoricalTooltipFields[i].source.type.integer || this.categoricalTooltipFields[i].source.type.numeric) {
						text = powerBiNumberFormat(data.value, this.tooltipNumberFormatter[i]);
					} else {
						text = data.value;
					}
				}

				tooltipData.push({
					displayName: data.displayName,
					value: text,
					color: data.color ? data.color : "transparent",
				});
			});

			if (this.errorBarsSettings.tooltip.isEnabled) {
				const errorBar1 = d.errorBar1;
				const errorBar2 = d.errorBar2;
				const isValue2 = this.isHasMultiMeasure && this.errorBarsSettings.measurement.applySettingsToMeasure === this.measure2DisplayName;

				if (this.errorBarsSettings.measurement.direction !== EErrorBarsDirection.Minus) {
					if (this.isHasErrorUpperBounds) {
						if (this.isRenderBothErrorBars) {
							tooltipData.push({
								displayName: "Upper",
								value: !isPie2 ? errorBar1.tooltipUpperBoundValue : errorBar2.tooltipUpperBoundValue,
								color: "transparent",
							});
						} else {
							if ((isValue2 && isPie2) || (!isValue2 && !isPie2)) {
								tooltipData.push({
									displayName: "Upper",
									value: errorBar1.tooltipUpperBoundValue,
									color: "transparent",
								});
							}
						}
					}
				}

				if (this.errorBarsSettings.measurement.direction !== EErrorBarsDirection.Plus) {
					if (this.isHasErrorLowerBounds) {
						if (this.isRenderBothErrorBars) {
							tooltipData.push({
								displayName: "Lower",
								value: !isPie2 ? errorBar1.tooltipLowerBoundValue : errorBar2.tooltipLowerBoundValue,
								color: "transparent",
							});
						} else {
							if ((isValue2 && isPie2) || (!isValue2 && !isPie2)) {
								tooltipData.push({
									displayName: "Lower",
									value: errorBar1.tooltipLowerBoundValue,
									color: "transparent",
								});
							}
						}
					}
				}
			}

			if (d.isHighlight) {
				tooltipData.push({
					displayName: "Highlighted",
					value: !isPie2
						? numberFormatter(pieData.value1, this.measureNumberFormatter[0])
						: numberFormatter(pieData.value2, this.measureNumberFormatter[1]),
					color: "transparent",
				});
			}

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
	}

	transformPieForeignObject(pieForeignObjectSelection: D3Selection<SVGElement>, isEnter: boolean, valueKey: string, pieRadius: number, isPie2: boolean): void {
		pieForeignObjectSelection
			.transition()
			.duration(isEnter ? 0 : this.tickDuration)
			.ease(easeLinear)
			.attr("x", (d) => {
				const pieX = this.getXPosition(this.isHorizontalChart ? d[valueKey] : d.category);
				if (this.isLeftYAxis) {
					return (this.isHorizontalChart ? pieX - pieRadius + this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius) - 1;
				} else {
					return (this.isHorizontalChart ? pieX - pieRadius - this.getPieXScaleDiff(pieX, isPie2) : pieX + this.scaleBandWidth / 2 - pieRadius) - 1;
				}
			})
			.attr("y", (d) => {
				const pieY = this.getYPosition(this.isHorizontalChart ? d.category : d[valueKey]);
				if (this.isBottomXAxis) {
					return (!this.isHorizontalChart ? pieY - pieRadius - this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius) - 1;
				} else {
					return (!this.isHorizontalChart ? pieY - pieRadius + this.getPieYScaleDiff(pieY, isPie2) : pieY + this.scaleBandWidth / 2 - pieRadius) - 1;
				}
			})
			.on("end", (node, index) => {
				if (index === this.chartData.length - 1) {
					this.updateAnnotationNodeElements();
				}
			});
	}

	enterPieChart(pieForeignObjectSelection: any, isPie2: boolean, isEnter: boolean): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;

		pieForeignObjectSelection.selectAll("*").remove();

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
				const ePieChart = echarts.init(ele.node(), null, { renderer: "svg" });
				ePieChart.setOption(this.getPieChartOptions(d.category, isPie2));
				ePieChart.resize();

				this.configurePieChart(d, ele, i, isPie2);
			})

		this.transformPieForeignObject(pieForeignObjectSelection, isEnter, valueKey, pieRadius, isPie2);

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

				this.configurePieChart(d, ele, i, isPie2);
			})

		this.transformPieForeignObject(pieForeignObjectSelection, isEnter, valueKey, pieRadius, isPie2);
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
		let seedDataFromVisual = [];

		if (!this.isHasSubcategories) {
			this.categoricalData.categories[0].values.forEach((d, i) => {
				const obj = {};

				this.categoricalData.categories.forEach(c => {
					let text = c.values[i] ? c.values[i] : 0;
					if (text.toString().split("--").length > 1) {
						text = text.toString().split("--")[0];
					}
					obj[c.source.displayName] = this.getTooltipCategoryText(<string>text, false);
				});

				this.categoricalData.values.forEach(v => {
					obj[v.source.displayName] = v.values[i] ? v.values[i] : 0;
				});

				seedDataFromVisual.push(obj);
			});
		} else {
			const group = d3.group(this.categoricalData.values, d => d.source.groupName);

			this.categoricalData.categories[0].values.forEach((d, i) => {
				[...group.keys()].forEach(g => {
					const obj = {};

					this.categoricalData.categories.forEach(c => {
						let text = c.values[i] ? c.values[i] : 0;
						if (text.toString().split("--").length > 1) {
							text = text.toString().split("--")[0];
						}
						obj[c.source.displayName] = this.getTooltipCategoryText(<string>text, false);
					});

					obj[this.categoricalSubCategoryField.displayName] = g;

					const groupBy = group.get(g);

					groupBy.forEach(d => {
						obj[d.source.displayName] = d.values[i] ? d.values[i] : 0;
					});

					seedDataFromVisual.push(obj);
				});
			});
		}

		seedDataFromVisual = this.elementToMoveOthers(seedDataFromVisual, true, this.categoryDisplayName);

		if (this.isHorizontalChart) {
			const clonedData = cloneDeep(seedDataFromVisual);
			seedDataFromVisual = clonedData.reverse();
		}

		seedDataFromVisual.forEach(d => {
			d[this.categoryDisplayName] = this.getTooltipCategoryText(d[this.categoryDisplayName], false);
		})

		// if (this.rankingSettings.category.enabled && this.rankingSettings.category.showRemainingAsOthers) {
		// 	const elementToMove = seedDataFromVisual.filter(obj => obj[this.categoryDisplayName].includes(this.othersLabel));
		// 	if (elementToMove) {
		// 		const index = seedDataFromVisual.findIndex(obj => obj[this.categoryDisplayName].includes(this.othersLabel));
		// 		seedDataFromVisual.splice(index, elementToMove.length);
		// 		if (this.isHorizontalChart) {
		// 			seedDataFromVisual.unshift(...elementToMove);
		// 		} else {
		// 			seedDataFromVisual.push(...elementToMove);
		// 		}
		// 	}
		// }

		const tooltipFields = this.categoricalTooltipFields.map(d => d.source.displayName);

		this.summaryTableConfig = {
			shadow: this,
			categoricalGroupedDatarole: EDataRolesName.SubCategory,
			excludeDataRolesFromTable: [EDataRolesName.SubCategory],
			excludeNegativeDataBy: "cell",
			dataView: this.vizOptions.options.dataViews as any,
			gridView: "tabular",
			gridConfig: {
				sidebar: { columns: true, filters: true },
				allowedAggregations: true,
			},
			seedDataFromVisual: seedDataFromVisual,
			numberFormatter: (value, field) => {
				if (field.includes("pivot")) {
					const splitBy_ = field.split("_");
					field = splitBy_[splitBy_.length - 1];
				}

				if (!tooltipFields.includes(field)) {
					if (this.allNumberFormatter[field] && number && this.allNumberFormatter[field].format && this.allNumberFormatter[field].format.includes("%")) {
						value = value * 100;
					}

					return this.numberSettings.show ?
						this.formatNumber(value, this.numberSettings, this.allNumberFormatter[field] ? this.allNumberFormatter[field] : undefined, false, true) :
						powerBiNumberFormat(value, this.allNumberFormatter[field]);
				} else {
					return powerBiNumberFormat(value, this.allNumberFormatter[field]);
				}
			},
			themeValue: this.vizOptions.formatTab["visualGeneralSettings"]["darkMode"],
			viewport: {
				width: this.vizOptions.options.viewport.width,
				height: this.vizOptions.options.viewport.height,
			},
		};

		// if (this.rankingSettings.category.enabled) {
		// 	this.summaryTableConfig = {
		// 		...this.summaryTableConfig,
		// 		matrixRanking: {
		// 			row: {
		// 				rank: this.rankingSettings.category.rankingType,
		// 				count: this.rankingSettings.category.count,
		// 			},
		// 			column: {
		// 				rank: this.rankingSettings.subCategory.rankingType,
		// 				count: this.rankingSettings.subCategory.count,
		// 			},
		// 		},
		// 	};
		// }

		// if (this.sortingSettings.category.enabled || this.sortingSettings.subCategory.enabled) {
		// 	const matrixSorting = { row: [], column: [] };
		// 	if (this.sortingSettings.category.enabled) {
		// 		matrixSorting.row.push({
		// 			column: this.sortingSettings.category.sortBy,
		// 			order: +this.sortingSettings.category.sortOrder === 1 ? "asc" : "desc",
		// 		});
		// 	}

		// 	if (this.sortingSettings.subCategory.enabled) {
		// 		matrixSorting.column.push({
		// 			column: this.sortingSettings.subCategory.sortBy,
		// 			order: +this.sortingSettings.subCategory.sortOrder === 1 ? "asc" : "desc",
		// 		});
		// 	}

		// 	this.summaryTableConfig = {
		// 		...this.summaryTableConfig,
		// 		matrixSorting: matrixSorting,
		// 	};
		// }
	}

	private setNumberFormatters(categoricalMeasureFields, categoricalTooltipFields, categoricalSortFields, categoricalRaceBarValues): void {
		this.measureNumberFormatter = categoricalMeasureFields.map((d) => {
			return { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }) } as IValueFormatter;
		});

		this.tooltipNumberFormatter = categoricalTooltipFields.map((d) => {
			return { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }) } as IValueFormatter;
		});

		this.sortValuesNumberFormatter = categoricalSortFields.map((d) => {
			return { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }) } as IValueFormatter;
		});

		this.raceBarLabelsFormatter = categoricalRaceBarValues.map((d) => {
			return { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }) } as IValueFormatter;
		});

		this.extraDataLabelsNumberFormatter = this.categoricalExtraDataLabelsFields
			.map(d => {
				return { format: d.source.format, formatter: valueFormatter.create({ format: d.source.format }) } as IValueFormatter;
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
			text = (typeof text === "string" && this.isExpandAllApplied ? text.toString().split("--")[0] : text) as string;

			if (this.isXIsDateTimeAxis && !this.isXIsContinuousAxis && !this.isHorizontalChart) {
				if (!this.xAxisSettings.isAutoDateFormat) {
					text = FormatAxisDate(this.xAxisSettings.dateFormat === EAxisDateFormats.Custom ? this.xAxisSettings.customDateFormat : this.xAxisSettings.dateFormat, text);
				} else {
					text = valueFormatter.create({ format: this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
				}
			}

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
		this.brushYAxisTicksMaxWidth = brushYAxisTicksMaxWidth + 10;
	}

	drawBrushXAxis(): void {
		const yPos = this.viewPortHeight - this.settingsBtnHeight - this.legendViewPort.height - this.brushXAxisTicksMaxHeight - this.footerHeight;
		this.brushXAxisG.attr("transform", `translate(${this.margin.left},${yPos})`)
			.call(
				d3
					.axisBottom(this.brushScaleBand)
					.tickFormat((d) => {
						let text = (typeof d === "string" && this.isExpandAllApplied ? d.toString().split("--")[0] : d) as string;

						if (this.isXIsDateTimeAxis && !this.isXIsContinuousAxis && !this.isHorizontalChart) {
							if (!this.xAxisSettings.isAutoDateFormat) {
								text = FormatAxisDate(this.xAxisSettings.dateFormat === EAxisDateFormats.Custom ? this.xAxisSettings.customDateFormat : this.xAxisSettings.dateFormat, text);
							} else {
								text = valueFormatter.create({ format: this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].source.format }).format(new Date(text));
							}
						}

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
			.attr("display", this.brushAndZoomAreaSettings.isShowAxis ? "block" : "none")
			.attr("text-anchor", "end")
			.attr("transform", `rotate( ${-90})`);
	}

	drawBrushYAxis(): void {
		const xPos = this.viewPortWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width - this.brushYAxisTicksMaxWidth;
		this.brushYAxisG.attr("transform", `translate(${xPos},${this.margin.top})`)
			.call(
				d3
					.axisRight(this.brushScaleBand)
					.ticks(this.height / 90)
					.tickFormat((d) => {
						const text = (typeof d === "string" && this.isExpandAllApplied ? d.toString().split("--")[0] : d) as string;
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
			.attr("x", "10")
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
			${this.markerSettings.marker1Style.markerShape}-
			${this.markerSettings.marker1Style.markerChart}-
			${this.markerSettings.marker2Style.markerShape}-
			${this.markerSettings.marker2Style.markerChart}-
			${this.isShowImageMarker1}-
			${this.isShowImageMarker2}`;
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

		let marker1: IMarkerData;
		let marker2: IMarkerData;

		const marker1Style = this.markerSettings.marker1Style;
		const marker2Style = this.markerSettings.marker2Style;

		// marker 1
		if (this.markerSettings.markerType === EMarkerTypes.SHAPE && marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = marker1Style.markerShapeValue;
			marker1 = {
				label: marker1Style.markerShapeValue.iconName,
				value: marker1Style.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: marker1Style.markerShapePath, stroke: undefined }]
			}
		} else {
			marker1 = CATEGORY_MARKERS.find(d => d.value === marker1Style.dropdownMarkerType);
		}

		if (this.markerSettings.markerType === EMarkerTypes.CHART || marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON) {
			marker1 = CATEGORY_MARKERS.find(d => d.value === EMarkerDefaultShapes.CIRCLE);
		}

		// marker 2
		if (this.markerSettings.markerType === EMarkerTypes.SHAPE && marker2Style.markerShape === EMarkerShapeTypes.ICONS_LIST) {
			const markerShapeValue = marker2Style.markerShapeValue;
			marker2 = {
				label: marker2Style.markerShapeValue.iconName,
				value: marker2Style.markerShapeValue.iconName,
				w: markerShapeValue.icon[0],
				h: markerShapeValue.icon[1],
				paths: [{ d: marker2Style.markerShapePath, stroke: undefined }]
			}
		} else {
			marker2 = CATEGORY_MARKERS.find(d => d.value === marker2Style.dropdownMarkerType);
		}

		if (this.markerSettings.markerType === EMarkerTypes.CHART || marker2Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON) {
			marker2 = CATEGORY_MARKERS.find(d => d.value === EMarkerDefaultShapes.CIRCLE);
		}

		const setPath1Formatting = (circleSelection: any): void => {
			circleSelection
				.attr("stroke-width", this.marker1OutlineWidth)
				.each((d: ILollipopChartRow, i: number, nodes) => {
					const ele = d3.select(nodes[i]);
					let fill: string;
					const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker1Color;
					const posNegColor = d.value1 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
					const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker1Color : null), EHighContrastColorType.Foreground);
					let pattern = d.pattern;
					if ((this.isHasMultiMeasure || (this.isLollipopTypePie && this.dataColorsSettings.fillType === ColorPaletteType.Single)) && this.isPatternApplied) {
						pattern = this.patternByMeasures[DataValuesType.Value1];
					}
					if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
						fill = `url('#${generatePattern(this.svg, pattern, color)}')`;
					} else {
						fill = color;
					}

					ele
						.attr("fill", marker1Style.isShowMarkerOutline && marker1Style.showOutlineOnly ? "rgba(255, 255, 255, 1)" : fill)
						.attr("stroke", marker1Style.sameOutlineAsMarkerColor ? color : marker1Style.outlineColor)
				}
				);
		}

		const setPath2Formatting = (circleSelection: any): void => {
			const marker2Style = this.markerSettings.marker2Style;
			circleSelection
				.attr("stroke-width", this.marker2OutlineWidth)
				.each((d: ILollipopChartRow, i: number, nodes) => {
					const ele = d3.select(nodes[i]);
					let fill: string;
					const isPosNegColorScheme = this.dataColorsSettings.fillType === ColorPaletteType.PositiveNegative && !this.CFCategoryColorPair[d.category].isMarker2Color;
					const posNegColor = d.value2 >= 0 ? this.dataColorsSettings.positiveColor : this.dataColorsSettings.negativeColor;
					const color = this.getColor(isPosNegColorScheme ? posNegColor : (this.categoryColorPair[d.category] ? this.categoryColorPair[d.category].marker2Color : null), EHighContrastColorType.Foreground);
					let pattern = d.pattern;
					if ((this.isHasMultiMeasure || (this.isLollipopTypePie && this.dataColorsSettings.fillType === ColorPaletteType.Single)) && this.isPatternApplied) {
						pattern = this.patternByMeasures[DataValuesType.Value1];
					}
					if (pattern && pattern.patternIdentifier && pattern.patternIdentifier !== "" && String(pattern.patternIdentifier).toUpperCase() !== "NONE") {
						fill = `url('#${generatePattern(this.svg, pattern, color)}')`;
					} else {
						fill = color;
					}

					ele
						.attr("fill", marker2Style.isShowMarkerOutline && marker2Style.showOutlineOnly ? "rgba(255, 255, 255, 1)" : fill)
						.attr("stroke", marker2Style.sameOutlineAsMarkerColor ? color : marker2Style.outlineColor)
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
					.attr("id", d => `${d.category}_${marker1.value}_BRUSH_MARKER1`)
					.attr("class", "marker1-symbol")
					.attr("viewBox", `0 0 ${marker1.w} ${marker1.h}`);

				const path1Selection = symbol1.append("path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("d", marker1.paths[0].d)
					.attr("class", "marker1-path");

				const circle1Selection = lollipopG.append("use")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("id", CircleType.Circle1)
					.classed("chart-circle1", true);

				setPath1Formatting(path1Selection);
				setCircleFormatting(circle1Selection, false, marker1, true);

				if (this.isHasMultiMeasure) {
					const symbol2 = lollipopG.append("defs")
						.append("symbol")
						.attr("id", d => `${d.category}_${marker2.value}_BRUSH_MARKER2`)
						.attr("class", "marker2-symbol")
						.attr("viewBox", `0 0 ${marker2.w} ${marker2.h}`);

					const path2Selection = symbol2.append("path")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
						})
						.attr("d", marker2.paths[0].d)
						.attr("class", "marker2-path");

					const circle2Selection = lollipopG.append("use")
						.datum(d => {
							return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
						})
						.attr("id", CircleType.Circle2)
						.classed("chart-circle2", true);

					setPath2Formatting(path2Selection);
					setCircleFormatting(circle2Selection, true, marker2, true);
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
					.attr("id", d => `${d.category}_${marker1.value}_BRUSH_MARKER1`)
					.attr("viewBox", `0 0 ${marker1.w} ${marker1.h}`);

				update
					.select(".marker2-symbol")
					.attr("id", d => `${d.category}_${marker1.value}_BRUSH_MARKER2`)
					.attr("viewBox", `0 0 ${marker1.w} ${marker1.h}`);

				const path1Selection = update.select(".marker1-path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
					.attr("d", marker1.paths[0].d);

				const path2Selection = update.select(".marker2-path")
					.datum(d => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					})
					.attr("d", marker2.paths[0].d);

				setPath1Formatting(path1Selection);
				setCircleFormatting(circle1Selection, false, marker1, false);

				if (this.isHasMultiMeasure) {
					setPath2Formatting(path2Selection);
					setCircleFormatting(circle2Selection, true, marker2, false);
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