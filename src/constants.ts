import {
	CircleFillOption,
	CircleSize,
	ColorPaletteType,
	DataLabelsPlacement,
	EBeforeAfterPosition,
	ELCRPosition,
	EMarkerChartTypes,
	EMarkerColorTypes,
	EMarkerDefaultShapes,
	EMarkerShapeTypes,
	EMarkerStyleTypes,
	EMarkerTypes,
	ERankingType,
	EReferenceLineComputation,
	EReferenceLinesType,
	ESortOrderTypes,
	EXYAxisNames,
	ELineType,
	Orientation,
	PieSize,
	Position,
	RankingDataValuesType,
	EDataLabelsBGApplyFor,
	EReferenceType,
	ERelationshipToMeasure,
	EErrorBarsMarkerShape,
	EErrorBarsCalcTypes,
	EErrorBandFillTypes,
	EErrorBarsLabelFormat,
	EDynamicDeviationDisplayTypes,
	EDynamicDeviationLabelDisplayTypes,
	EDynamicDeviationConnectingLineTypes,
	ETrendLinesTypes,
	AxisCategoryType,
	EReferenceLineType,
	EReferenceLineNameTypes,
	EErrorBarsDirection,
	EAxisDateFormats,
	EPatternByDataTypes,
	ECutAndClipMarkerPlacementTypes,
	ERankingSuffix,
	ERankingCalcMethod,
	EAxisNumberValueType,
	DisplayUnits,
	EDataLabelsDisplayTypes,
	EFontStyle,
	EGeneralTemplates,
} from "./enum";
import {
	EInsideTextColorTypes,
	IBrushAndZoomAreaSettings,
	IChartSettings,
	ICirclePropsSettings,
	ICutAndClipAxisSettings,
	IDataColorsSettings,
	IDataLabelsProps,
	IDataLabelsSettings,
	IDynamicDeviationSettings,
	IErrorBarsSettings,
	IGridLinesPropsSettings,
	IGridLinesSettings,
	ILabelValuePair,
	ILineSettings,
	IMarkerSettings,
	IPatternSettings,
	IPiePropsSettings,
	IRaceChartSettings,
	IRankingSettings,
	IReferenceLineSettings,
	IShowBucketSettings,
	ISortingSettings,
	ITemplateSettings,
	ITrendLinesSettings,
	IXAxisSettings,
	IYAxisSettings,
} from "./visual-settings.interface";
import { ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderAlignment, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesShadowOffset, ESmallMultiplesShadowPosition, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, ISmallMultiplesGridLayoutSettings } from "./SmallMultiplesGridLayout";
import DefaultTemplateJS from './templates-json/default-template.json';

export const MonthNames = [
	"january", "february", "march", "april", "may", "june",
	"july", "august", "september", "october", "november", "december",
];

export const PIE1_SETTINGS: IPiePropsSettings = {
	pieSize: PieSize.Auto,
	maxPieRadius: 40,
	pieRadius: 40,
};

export const PIE2_SETTINGS: IPiePropsSettings = {
	pieSize: PieSize.Auto,
	maxPieRadius: 40,
	pieRadius: 40,
};

export const CHART_SETTINGS: IChartSettings = {
	lollipopInnerPadding: 30,
	isHasSubCategories: false,
	orientation: Orientation.Vertical,
	isAutoLollipopWidth: true,
	lollipopWidth: undefined,
	isLollipopDistanceChange: false,
	isShowZeroBaseLine: true,
	zeroBaseLineColor: "rgba(211, 211, 211, 1)",
	zeroBaseLineSize: 1,
	showConnectingLine: false,
	connectingLineColor: "rgba(0, 0, 0, 1)",
	connectingLineWidth: 1,
	connectingLineStyle: ELineType.Dotted,
};

export const CIRCLE1_SETTINGS: ICirclePropsSettings = {
	show: true,
	isCircleFilled: CircleFillOption.Yes,
	circleSize: CircleSize.Auto,
	maxCircleRadius: 10,
	circleRadius: 10,
	strokeWidth: 0,
};

export const CIRCLE2_SETTINGS: ICirclePropsSettings = {
	show: true,
	isCircleFilled: CircleFillOption.Yes,
	circleSize: CircleSize.Auto,
	maxCircleRadius: 10,
	circleRadius: 10,
	strokeWidth: 0,
};

export const LINE_SETTINGS: ILineSettings = {
	show: true,
	lineType: ELineType.Solid,
	lineWidth: 3,
	lineColor: "rgba(128, 128, 128, 1)",
	isApplyMarkerColor: false
};

const dataLabelsProps: IDataLabelsProps = {
	color: "rgba(93, 93, 93, 1)",
	borderColor: "rgba(255, 255, 255,1)",
	borderWidth: 1,
	orientation: Orientation.Horizontal,
	placement: DataLabelsPlacement.Outside,
	fontSize: 12,
	fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	showBackground: false,
	backgroundColor: "rgba(93, 93, 93, 1)",
	fontStyle: [],
	isAutoFontSize: true,
	showLabelsBelowReferenceLine: false,
	isColorChanged: false,
	textColorTypes: EInsideTextColorTypes.CONTRAST,
	applyFor: EDataLabelsBGApplyFor.ONLY_PATTERNS,
	isShowBGChangedWhenPatternApplied: false,
	isTextColorTypeChanged: false,
	isShowBackgroundChange: false,
	customLabel: "",
	displayType: EDataLabelsDisplayTypes.FirstLastMinMax
};

export const DATA_LABELS_SETTINGS: IDataLabelsSettings = {
	show: true,
	isShowBestFitLabels: true,
	measure1: dataLabelsProps,
	measure2: dataLabelsProps
};

export const X_GRID_LINES_SETTINGS: IGridLinesPropsSettings = {
	show: false,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(198, 194, 190, 1)",
};

export const Y_GRID_LINES_SETTINGS: IGridLinesPropsSettings = {
	show: true,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(198, 194, 190, 1)",
};

export const GRID_LINES_SETTINGS: IGridLinesSettings = {
	xGridLines: X_GRID_LINES_SETTINGS,
	yGridLines: Y_GRID_LINES_SETTINGS,
};

export const POSITIVE_COLOR = "rgba(141, 200, 61, 1)";
export const NEGATIVE_COLOR = "rgba(229, 51, 39, 1)";

export const DATA_COLORS: IDataColorsSettings = {
	fillMin: "rgba(186, 72, 239, 1)",
	fillMid: "rgba(127, 88, 246, 1)",
	fillMax: "rgba(75, 132, 244, 1)",
	isAddMidColor: true,
	fillType: ColorPaletteType.Sequential,
	isFillTypeChanged: false,
	singleColor1: "rgba(0, 99, 178, 1)",
	singleColor2: "rgba(156, 195, 213, 1)",
	gradientColors: ["rgba(186, 72, 239, 1)", "rgba(127, 88, 246, 1)", "rgba(75, 132, 244, 1)"],
	categoryColors: [],
	subCategoryColors: [],
	numberOfClasses: 8,
	schemeColors: [
		'rgb(204,233,255)', 'rgb(160,214,255)', 'rgb(117,195,255)', 'rgb(68,176,255)', 'rgb(25,145,233)'
	],
	colorBlindSafe: false,
	colorScheme: "Blue",
	reverse: false,
	isGradient: true,
	negativeColor: NEGATIVE_COLOR,
	positiveColor: POSITIVE_COLOR,
	gradientAppliedToMeasure: EMarkerColorTypes.Marker1,
	categoryOthersColor: "rgba(84, 84, 84, 1)",
	isCustomizeCategoryOthersColor: true,
	subcategoryOthersColor: "rgba(84, 84, 84, 1)",
	isCustomizeSubcategoryOthersColor: true,
	isCustomizeSMOthersColor: true,
	SMOthersColor: "rgba(84, 84, 84, 1)"
};

export const RANKING_SETTINGS: IRankingSettings = {
	category: {
		enabled: true,
		rankingType: ERankingType.TopN,
		count: 50,
		showRemainingAsOthers: false,
		suffix: ERankingSuffix.None,
		calcMethod: ERankingCalcMethod.Sum
	},
	subCategory: {
		enabled: true,
		rankingType: ERankingType.TopN,
		count: 10,
		showRemainingAsOthers: false,
		suffix: ERankingSuffix.None,
		calcMethod: ERankingCalcMethod.Sum
	},
	smallMultiples: {
		enabled: true,
		rankingType: ERankingType.TopN,
		count: 10,
		showRemainingAsOthers: false,
		suffix: ERankingSuffix.None,
		calcMethod: ERankingCalcMethod.Sum
	},
	raceChartData: {
		enabled: true,
		rankingType: ERankingType.TopN,
		count: 20,
		showRemainingAsOthers: false,
		suffix: ERankingSuffix.None,
		calcMethod: ERankingCalcMethod.Sum
	}
};

export const X_AXIS_SETTINGS: IXAxisSettings = {
	show: true,
	position: Position.Bottom,
	isLogarithmScale: false,
	isDisplayTitle: true,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 13,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	titleStyling: [EFontStyle.Bold],
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	isLabelAutoTilt: true,
	labelTilt: 0,
	labelCharLimit: 20,
	labelStyling: [],
	isShowAxisLine: false,
	axisLineColor: "rgba(84, 84, 84, 1)",
	isLabelAutoCharLimit: true,
	categoryType: AxisCategoryType.Categorical,
	isMaximumRangeEnabled: false,
	maximumRange: undefined,
	isMinimumRangeEnabled: false,
	minimumRange: undefined,
	isInvertRange: false,
	isAutoDateFormat: true,
	dateFormat: EAxisDateFormats["dddd, MMMM DD, YYYY"],
	customDateFormat: EAxisDateFormats["dddd, MMMM DD, YYYY"],
	numberFormatting: {
		show: true,
		valueType: EAxisNumberValueType.Absolute,
		decimalSeparator: ".",
		thousandsSeparator: ",",
		decimalPlaces: 1,
		scaling: DisplayUnits.Auto,
		prefix: "",
		suffix: "",
		scalingLabel: false,
		thousandScalingLabel: "K",
		millionScalingLabel: "M",
		billionScalingLabel: "B",
		trillionScalingLabel: "T"
	}
};

export const Y_AXIS_SETTINGS: IYAxisSettings = {
	show: true,
	position: Position.Left,
	isLogarithmScale: false,
	isDisplayTitle: true,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 13,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	titleStyling: [EFontStyle.Bold],
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	labelCharLimit: 20,
	labelStyling: [],
	isShowLabelsAboveLine: false,
	isShowAxisLine: false,
	axisLineColor: "rgba(84, 84, 84, 1)",
	isLabelAutoCharLimit: true,
	categoryType: AxisCategoryType.Categorical,
	isMaximumRangeEnabled: false,
	maximumRange: undefined,
	isMinimumRangeEnabled: false,
	minimumRange: undefined,
	isInvertRange: false,
	isAutoDateFormat: true,
	dateFormat: EAxisDateFormats["dddd, MMMM DD, YYYY"],
	customDateFormat: EAxisDateFormats["dddd, MMMM DD, YYYY"],
	numberFormatting: {
		show: true,
		valueType: EAxisNumberValueType.Absolute,
		decimalSeparator: ".",
		thousandsSeparator: ",",
		decimalPlaces: 1,
		scaling: DisplayUnits.Auto,
		prefix: "",
		suffix: "",
		scalingLabel: false,
		thousandScalingLabel: "K",
		millionScalingLabel: "M",
		billionScalingLabel: "B",
		trillionScalingLabel: "T"
	}
};

export const SORTING_SETTINGS: ISortingSettings = {
	isDefaultSortByChanged: false,
	isDefaultSortOrderChanged: false,
	category: {
		enabled: true,
		sortBy: undefined,
		sortOrder: ESortOrderTypes.DESC,
		isSortByCategory: false,
		isSortByMeasure: true,
		isSortByMultiMeasure: false,
		isSortByExtraSortField: false,
	},
	subCategory: {
		enabled: true,
		sortBy: undefined,
		sortOrder: ESortOrderTypes.DESC,
		isSortByCategory: true,
		isSortByMeasure: false,
		isSortByMultiMeasure: false,
		isSortByExtraSortField: false,
	},
	smallMultiples: {
		enabled: true,
		sortBy: undefined,
		sortOrder: ESortOrderTypes.DESC,
		isSortByCategory: false,
		isSortByMeasure: true,
		isSortByMultiMeasure: false,
		isSortByExtraSortField: false,
	},
};

export const SHOW_BUCKET_SETTINGS: IShowBucketSettings = {
	enable: true,
	showBucketField: "",
	message: "Show chart condition is not fulfilled",
	showIcon: true,
	fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	fontSize: 20,
	styling: [],
	color: "rgba(84, 84, 84, 1)",
};

export const BRUSH_AND_ZOOM_AREA_SETTINGS: IBrushAndZoomAreaSettings = {
	enabled: false,
	minLollipopCount: 10,
	isShowAxis: false,
	trackBackgroundColor: "rgba(225, 225, 225, 0.5)",
	selectionTrackBackgroundColor: "rgba(0, 0, 0, 0.2)",
	selectionTrackBorderColor: "rgba(225, 225, 225, 1)",
	isAutoWidth: true,
	isAutoHeight: false,
	width: undefined,
	height: 40
};

export const PATTERN_SETTINGS: IPatternSettings = {
	enabled: false,
	categoryPatterns: [],
	measuresPatterns: [],
	subCategoryPatterns: [],
	basedOn: EPatternByDataTypes.BySubCategory,
	isPatternBorderEnabled: false,
	patternBorderWidth: 1,
};

export const MARKER_SETTINGS: IMarkerSettings = {
	markerType: EMarkerTypes.SHAPE,
	markerStyleType: EMarkerStyleTypes.Marker1Style,
	marker1Style: {
		isAutoMarkerSize: true,
		markerSize: 20,
		markerShape: EMarkerShapeTypes.DEFAULT,
		markerChart: EMarkerChartTypes.DONUT,
		markerShapeValue: undefined,
		markerShapePath: "",
		markerShapeBase64Url: "",
		dropdownMarkerType: EMarkerDefaultShapes.CIRCLE,
		selectedImageDataField: undefined,
		isShowMarkerOutline: true,
		outlineWidth: 1,
		outlineColor: "rgba(128, 128, 128, 1)",
		sameOutlineAsMarkerColor: true,
		showOutlineOnly: false
	},
	marker2Style: {
		isAutoMarkerSize: true,
		markerSize: 20,
		markerShape: EMarkerShapeTypes.DEFAULT,
		markerChart: EMarkerChartTypes.DONUT,
		markerShapeValue: undefined,
		markerShapePath: "",
		markerShapeBase64Url: "",
		dropdownMarkerType: EMarkerDefaultShapes.CIRCLE,
		selectedImageDataField: undefined,
		isShowMarkerOutline: true,
		outlineWidth: 1,
		outlineColor: "rgba(128, 128, 128, 1)",
		sameOutlineAsMarkerColor: true,
		showOutlineOnly: false
	},
	isAutoLollipopTypePie: false,
	isAutoLollipopTypeImage: false,
};

export const RACE_CHART_SETTINGS: IRaceChartSettings = {
	isEnabled: true,
	allowTransition: true,
	transitionDuration: 500,
	dataChangeInterval: 500,
	tickerButtonRadius: 30,
	tickerButtonColor: "rgba(102,102,102,1)",
	isTickerButtonAutoRadius: true,
	placement: Position.Bottom,
	headerTextStyles: {
		labelColor: "rgba(102,102,102,1)",
		labelFontSize: 30,
		isLabelAutoFontSize: true,
		labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		fontStyles: [EFontStyle.Bold],
		isShowLabelBackground: false,
		backgroundColor: "rgba(255,255,255,1)",
	},
	subTextStyles: {
		labelColor: "rgba(102,102,102,1)",
		labelFontSize: 20,
		isLabelAutoFontSize: true,
		labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		fontStyles: [],
		isShowLabelBackground: false,
		backgroundColor: "rgba(255,255,255,1)",
	}
};

export const REFERENCE_LINES_SETTINGS: IReferenceLineSettings = {
	uid: new Date().getTime().toString(),
	referenceType: EReferenceType.REFERENCE_LINE,
	lineValue1: {
		axis: EXYAxisNames.X,
		type: EReferenceLinesType.Value,
		value: undefined,
		isValueChanged: false,
		measureName: undefined,
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "1",
	},
	lineValue2: {
		axis: EXYAxisNames.X,
		type: EReferenceLinesType.Value,
		value: undefined,
		isValueChanged: false,
		measureName: undefined,
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "2",
	},
	lineStyle: {
		lineStyle: ELineType.Dashed,
		lineColor: "rgba(74, 74, 74, 1)",
		autoLineWidth: true,
		lineWidth: "3",
		linePlacement: EReferenceLineType.FRONT
	},
	labelStyle: {
		show: true,
		labelNameType: EReferenceLineNameTypes.VALUE,
		lineLabel: "Reference Line",
		bandLabel: "Reference Band",
		labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		labelColor: "rgba(93,93,93,1)",
		isShowLabelBackground: false,
		labelBackgroundColor: "rgba(255,255,255,1)",
		autoFontSize: true,
		labelFontSize: "16",
		labelPosition: EBeforeAfterPosition.Before,
		labelAlignment: ELCRPosition.Centre,
		styling: [EFontStyle.Bold],
		labelOrientation: Orientation.Horizontal
	},
	line1Coord: {
		x1: 0, x2: 0, y1: 0, y2: 0
	},
	line2Coord: {
		x1: 0, x2: 0, y1: 0, y2: 0
	},
	labelCoord: {
		textX1: 0,
		textY1: 0
	},
	bandStyle: {
		isShowBackgroundColor: true,
		backgroundColor: "rgba(0,0,0,0.2)"
	}
};

export const ERROR_BARS_SETTINGS: IErrorBarsSettings = {
	isEnabled: false,
	measurement: {
		direction: EErrorBarsDirection.Both,
		applySettingsToMeasure: undefined,
		calcType: EErrorBarsCalcTypes.ByPercentage,
		relationshipToMeasure: ERelationshipToMeasure.Absolute,
		makeSymmetrical: false,
		upperBoundMeasure: undefined,
		lowerBoundMeasure: undefined,
		upperBoundValue: undefined,
		lowerBoundValue: undefined,
		upperBoundPercentage: 10,
		lowerBoundPercentage: 10,
		standardDeviation: 1
	},
	errorBars: {
		isEnabled: true,
		isMatchSeriesColor: false,
		barColor: "rgba(108, 105, 102, 1)",
		barWidth: 1,
		markerShape: EErrorBarsMarkerShape.Dash,
		markerSize: 8,
		markerColor: "rgba(108, 105, 102, 1)",
		isBorderEnabled: true,
		borderColor: "rgba(255, 255, 255, 1)",
		borderSize: 1
	},
	errorBand: {
		isEnabled: false,
		isMatchSeriesColor: false,
		fillType: EErrorBandFillTypes.Fill,
		fillColor: "rgba(155, 155, 155, 0.4)",
		lineStyle: ELineType.Solid,
		lineColor: "rgba(155, 155, 155, 1)",
	},
	errorLabels: {
		isEnabled: false,
		fontSize: 10,
		fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		color: "rgba(255,255,255,1)",
		showBackground: true,
		backgroundColor: "rgba(133, 127, 127, 1)",
		fontStyle: [],
		labelFormat: EErrorBarsLabelFormat.Absolute
	},
	tooltip: {
		isEnabled: true,
		labelFormat: EErrorBarsLabelFormat.Absolute
	}
};

export const DYNAMIC_DEVIATION_SETTINGS: IDynamicDeviationSettings = {
	isEnabled: false,
	displayType: EDynamicDeviationDisplayTypes.FirstToLast,
	lastDisplayType: EDynamicDeviationDisplayTypes.FirstToLast,
	createYourOwnDeviation: { from: undefined, to: undefined },
	removeCurrentDeviation: false,
	fromIndex: 1,
	toIndex: 2,
	position: Position.Right,
	labelDisplayType: EDynamicDeviationLabelDisplayTypes.Value,
	labelFontSize: 12,
	fontStyle: [],
	labelFontColor: "rgba(93, 93, 93, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isShowLabelBorder: false,
	borderWidth: 2,
	borderColor: "rgba(0, 0, 0, 1)",
	isShowLabelBackground: false,
	backgroundColor: "rgba(255, 255, 255, 1)",
	backgroundColorTransparency: 90,
	connectorType: EDynamicDeviationConnectingLineTypes.Arrow,
	isAutoConnectorColor: true,
	connectorPositiveColor: POSITIVE_COLOR,
	connectorNegativeColor: NEGATIVE_COLOR,
	connectorWidth: 3,
	connectingLineColor: "rgba(0, 0, 0, 1)",
	connectingLineWidth: 3,
	isShowStartIndicator: true,
	isBarBorderEnabled: true,
	connectingLineType: ELineType.Solid,
	labelPosition: Position.Right,
	isShowDataLabel: true,
	isShowConnectorLine: true
};

export const TREND_LINES_SETTINGS: ITrendLinesSettings = {
	isEnabled: true,
	measureName: undefined,
	lineType: ETrendLinesTypes.Linear,
	lineStyle: ELineType.Solid,
	lineColor: "rgba(102,102,102,1)",
	lineWidth: 1,
	isShowLabel: true,
	isShowIntercept: true,
	isDisplayEquation: true,
	isDisplayR2Value: true,
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontStyling: [],
	labelFontColor: "rgba(102,102,102,1)",
	labelFontSize: 12,
	labelOffsetX: undefined,
	labelOffsetY: undefined
};

export const CUT_AND_CLIP_AXIS_SETTINGS: ICutAndClipAxisSettings = {
	isEnabled: false,
	breakStart: undefined,
	breakEnd: undefined,
	markerStrokeColor: "rgba(102,102,102,1)",
	markerBackgroundColor: "rgba(255, 255, 255, 1)",
	markerPlacement: ECutAndClipMarkerPlacementTypes.Categories
};

export const TEMPLATES_SETTINGS: ITemplateSettings = {
	isIBCSEnabled: false,
	isTemplatesEnabled: false,
	theme: undefined,
	prevTheme: undefined,
	selectedTemplate: EGeneralTemplates.DefaultTemplate,
	templateSchema: DefaultTemplateJS
};

export const AXIS_DATE_FORMATS: ILabelValuePair[] = [
	{
		label: "Custom",
		value: EAxisDateFormats.Custom,
	},
	{
		label: "DD-MM-YY",
		value: EAxisDateFormats["DD-MM-YY"],
	},
	{
		label: "DD-MM-YYYY",
		value: EAxisDateFormats["DD-MM-YYYY"],
	},
	{
		label: "DD:MM:YY",
		value: EAxisDateFormats["DD:MM:YY"],
	},
	{
		label: "DD/MM/YY",
		value: EAxisDateFormats["DD/MM/YY"],
	},
	{
		label: "D-M-YY",
		value: EAxisDateFormats["D-M-YY"],
	},
	{
		label: "D.M.Y",
		value: EAxisDateFormats["D.M.Y"],
	},
	{
		label: "YYYY-MM-DD",
		value: EAxisDateFormats["YYYY-MM-DD"],
	},
	{
		label: "MMMM, YYYY",
		value: EAxisDateFormats["MMMM, YYYY"],
	},
	{
		label: "D, MMMM",
		value: EAxisDateFormats["D, MMMM"],
	},
	{
		label: "YYYY",
		value: EAxisDateFormats.YYYY,
	},
	{
		label: "dddd, MMMM DD, YYYY",
		value: EAxisDateFormats["dddd, MMMM DD, YYYY"]
	},
	{
		label: "DD-MM-YYYY hh:mm AM/PM",
		value: EAxisDateFormats["DD-MM-YYYY hh:mm AM/PM"],
	},
	{
		label: "DD-MM-YY hh(24):mm",
		value: EAxisDateFormats["DD-MM-YY hh(24):mm"],
	},
	{
		label: "DD-MM-YYYY hh(24):mm",
		value: EAxisDateFormats["DD-MM-YYYY hh(24):mm"],
	},
	{
		label: "DD-MM-YY hh:mm AM/PM",
		value: EAxisDateFormats["DD-MM-YY hh:mm AM/PM"],
	},
	{
		label: "DD-MM-YY hh:mm:ss AM/PM",
		value: EAxisDateFormats["DD-MM-YY hh:mm:ss AM/PM"],
	},
];

export const SMALL_MULTIPLES_SETTINGS: ISmallMultiplesGridLayoutSettings = {
	showInfoPage: false,
	infoMessage: "",
	hostContainerId: "",
	categories: [],
	containerWidth: 0,
	containerHeight: 0,
	layoutType: ESmallMultiplesLayoutType.Grid,
	displayType: ESmallMultiplesDisplayType.Fixed,
	viewType: ESmallMultiplesViewType.Scroll,
	rows: 2,
	columns: 2,
	gridDataItemsTotals: [],
	outerSpacing: 10,
	innerSpacing: 10,
	xAxisType: ESmallMultiplesAxisType.Uniform,
	yAxisType: ESmallMultiplesAxisType.Uniform,
	xAxisPosition: ESmallMultiplesXAxisPosition.FrozenBottomColumn,
	yAxisPosition: ESmallMultiplesYAxisPosition.FrozenLeftColumn,
	showGridLayoutOnly: false,
	showXYAxisSettings: true,
	itemsPerPage: undefined,
	header: {
		displayType: ESmallMultiplesHeaderDisplayType.TitleAndTotalValue,
		fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		fontSize: 12,
		fontColor: "rgba(102,102,102,1)",
		fontStyles: [],
		alignment: ESmallMultiplesHeaderAlignment.Left,
		position: ESmallMultiplesHeaderPosition.Top,
		isTextWrapEnabled: true
	},
	background: {
		type: ESmallMultiplesBackgroundType.All,
		panelColor: "rgba(255,255,255,1)",
		alternateColor: "rgba(245, 245, 245, 1)",
		transparency: 100
	},
	border: {
		isShowBorder: false,
		style: ELineType.Solid,
		width: 1,
		radius: 0,
		color: "rgba(0, 0, 0, 1)"
	},
	shadow: {
		isEnabled: true,
		color: "rgba(229, 229, 229, 1)",
		offset: ESmallMultiplesShadowOffset.Outside,
		position: ESmallMultiplesShadowPosition.Custom,
		size: 8,
		blur: 81,
		angle: 135,
		distance: 6
	},
	onCellRendered: undefined,
	tempCall: undefined,
	getUniformXAxisAndBrushNode: undefined,
	getUniformYAxisAndBrushNode: undefined,
	getXAxisNodeElementAndMeasures: undefined,
	getYAxisNodeElementAndMeasures: undefined,
	getBottomLeftMargin: undefined,
	onRenderingFinished: undefined,
};
