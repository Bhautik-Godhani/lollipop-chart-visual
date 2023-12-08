import { ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderAlignment, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesShadowType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, ISmallMultiplesGridLayoutSettings } from "./SmallMultiplesGridLayout";
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
} from "./enum";
import {
	EInsideTextColorTypes,
	IBCSSettings,
	IBrushAndZoomAreaSettings,
	IChartSettings,
	ICirclePropsSettings,
	IDataColorsSettings,
	IDataLabelsSettings,
	IErrorBarsSettings,
	IGridLinesSettings,
	ILineSettings,
	IMarkerSettings,
	IPatternSettings,
	IPiePropsSettings,
	IRaceChartSettings,
	IRankingSettings,
	IReferenceLineSettings,
	IShowBucketSettings,
	ISortingSettings,
	IXAxisSettings,
	IXGridLinesSettings,
	IYAxisSettings,
	IYGridLinesSettings,
} from "./visual-settings.interface";

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
	zeroBaseLineSize: 1
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
	lineWidth: 4,
	lineColor: "rgba(128, 128, 128, 1)",
};

export const DATA_LABELS_SETTINGS: IDataLabelsSettings = {
	show: true,
	color: "#fff",
	borderColor: "rgba(255, 255, 255,1)",
	borderWidth: 1,
	orientation: Orientation.Horizontal,
	fontSize: 12,
	fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	showBackground: true,
	backgroundColor: "rgba(93, 93, 93, 1)",
	fontStyle: [],
	placement: DataLabelsPlacement.Outside,
	isAutoFontSize: true,
	showLabelsBelowReferenceLine: false,
	isColorChanged: false,
	textColorTypes: EInsideTextColorTypes.FIXED,
	applyFor: EDataLabelsBGApplyFor.ONLY_PATTERNS,
	isShowBGChangedWhenPatternApplied: false,
	isShowBestFitLabels: true
};

export const X_GRID_LINES_SETTINGS: IXGridLinesSettings = {
	show: false,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const Y_GRID_LINES_SETTINGS: IYGridLinesSettings = {
	show: false,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const GRID_LINES_SETTINGS: IGridLinesSettings = {
	xGridLines: X_GRID_LINES_SETTINGS,
	yGridLines: Y_GRID_LINES_SETTINGS,
};

export const DATA_COLORS: IDataColorsSettings = {
	fillMin: "rgba(186, 72, 239, 1)",
	fillMid: "rgba(127, 88, 246, 1)",
	fillMax: "rgba(75, 132, 244, 1)",
	isAddMidColor: true,
	fillType: ColorPaletteType.Single,
	singleColor1: "rgba(0, 99, 178, 1)",
	singleColor2: "rgba(156, 195, 213, 1)",
	gradientColors: ["rgba(186, 72, 239, 1)", "rgba(127, 88, 246, 1)", "rgba(75, 132, 244, 1)"],
	categoryColors: [],
	numberOfClasses: 5,
	schemeColors: [
		'rgb(204,233,255)', 'rgb(160,214,255)', 'rgb(117,195,255)', 'rgb(68,176,255)', 'rgb(25,145,233)'
	],
	colorBlindSafe: false,
	colorScheme: "Blue",
	reverse: false,
	isGradient: true,
	negativeColor: "rgba(208, 2, 27, 1)",
	positiveColor: "rgba(23, 177, 105, 1)",
	gradientAppliedToMeasure: EMarkerColorTypes.Marker1
};

export const RANKING_SETTINGS: IRankingSettings = {
	category: {
		enabled: true,
		valueType: RankingDataValuesType.Value1,
		rankingType: ERankingType.TopN,
		count: 50,
		showRemainingAsOthers: false,
		othersColor: "rgba(84, 84, 84, 1)",
	},
	subCategory: {
		enabled: true,
		rankingType: ERankingType.TopN,
		count: 50,
		showRemainingAsOthers: false,
		othersColor: "rgba(84, 84, 84, 1)",
	},
};

export const X_AXIS_SETTINGS: IXAxisSettings = {
	show: true,
	position: Position.Bottom,
	isDisplayTitle: false,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	isLabelAutoTilt: true,
	labelTilt: 30,
	labelCharLimit: 12,
	isShowAxisLine: false,
	isLabelAutoCharLimit: true
};

export const Y_AXIS_SETTINGS: IYAxisSettings = {
	show: true,
	position: Position.Left,
	isDisplayTitle: false,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	labelCharLimit: 12,
	isShowLabelsAboveLine: false,
	isShowAxisLine: false,
	isLabelAutoCharLimit: true
};

export const SORTING_SETTINGS: ISortingSettings = {
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
		sortOrder: ESortOrderTypes.ASC,
		isSortByCategory: true,
		isSortByMeasure: false,
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
	minLollipopCount: 20,
	isShowAxis: false,
	trackBackgroundColor: "rgba(225, 225, 225, 0.5)",
	selectionTrackBackgroundColor: "rgba(0, 0, 0, 0.4)",
	selectionTrackBorderColor: "rgba(225, 225, 225, 1)",
	isAutoWidth: true,
	isAutoHeight: true,
	width: undefined,
	height: undefined
};

export const PATTERN_SETTINGS: IPatternSettings = {
	enabled: false,
	categoryPatterns: [],
	subCategoryPatterns: [],
	isPatternBorderEnabled: false,
	patternBorderWidth: 1
};

export const MARKER_SETTINGS: IMarkerSettings = {
	markerType: EMarkerTypes.SHAPE,
	markerShape: EMarkerShapeTypes.DEFAULT,
	markerChart: EMarkerChartTypes.DONUT,
	markerShapeValue: undefined,
	markerShapePath: "",
	markerShapeBase64Url: "",
	dropdownMarkerType: EMarkerDefaultShapes.CIRCLE,
	markerStyleType: EMarkerStyleTypes.Marker1Style,
	marker1Style: { isAutoMarkerSize: false, markerSize: 20 },
	marker2Style: { isAutoMarkerSize: false, markerSize: 20 },
	selectedImageDataField: undefined
};

export const RACE_CHART_SETTINGS: IRaceChartSettings = {
	allowTransition: true,
	transitionDuration: 500,
	dataChangeInterval: 500,
	labelColor: "rgba(102,102,102,1)",
	labelFontSize: 40,
	isLabelAutoFontSize: true,
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	tickerButtonRadius: 30,
	isTickerButtonAutoRadius: true,
	tickerButtonColor: "rgba(102,102,102,1)",
};

export const REFERENCE_LINES_SETTINGS: IReferenceLineSettings = {
	referenceType: EReferenceType.REFERENCE_LINE,
	lineValue1: {
		axis: EXYAxisNames.X,
		type: EReferenceLinesType.Value,
		value: undefined,
		measureName: undefined,
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "1",
	},
	lineValue2: {
		axis: EXYAxisNames.X,
		type: EReferenceLinesType.Value,
		value: undefined,
		measureName: undefined,
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "1",
	},
	lineStyle: {
		lineStyle: ELineType.Dashed,
		lineColor: "rgba(74, 74, 74, 1)",
		autoLineWidth: true,
		lineWidth: "3",
	},
	labelStyle: {
		label: "Reference Line",
		labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		labelColor: "rgba(0,0,0,1)",
		isShowLabelBackground: true,
		labelBackgroundColor: "rgba(0,0,0,0.2)",
		autoFontSize: true,
		labelFontSize: "16",
		labelPosition: EBeforeAfterPosition.Before,
		labelAlignment: ELCRPosition.Centre,
		styling: []
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
	isEnabled: true,
	measurement: {
		applySettingsToMeasure: undefined,
		calcType: EErrorBarsCalcTypes.ByField,
		relationshipToMeasure: ERelationshipToMeasure.Absolute,
		makeSymmetrical: false,
		upperBoundMeasure: undefined,
		lowerBoundMeasure: undefined,
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
		borderColor: "rgba(255, 255, 255, 1)",
		borderSize: 1
	},
	errorBand: {
		isEnabled: true,
		isMatchSeriesColor: false,
		fillType: EErrorBandFillTypes.Fill,
		fillColor: "rgba(155, 155, 155, 0.4)",
		lineStyle: ELineType.Solid,
		lineColor: "rgba(155, 155, 155, 1)",
	},
	errorLabels: {
		isEnabled: true,
		fontSize: 12,
		fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		color: "rgba(102,102,102,1)",
		showBackground: false,
		backgroundColor: "rgba(0,0,0,0.2)",
		fontStyle: [],
		labelFormat: EErrorBarsLabelFormat.Absolute
	},
	tooltip: {
		isEnabled: true,
		labelFormat: EErrorBarsLabelFormat.Absolute
	}
};

export const IBCS_SETTINGS: IBCSSettings = {
	isIBCSEnabled: false,
	theme: undefined,
	prevTheme: undefined
}

export const SMALL_MULTIPLES_SETTINGS: ISmallMultiplesGridLayoutSettings = {
	hostContainerId: "",
	categories: [],
	containerWidth: 0,
	containerHeight: 0,
	smallMultiplesLayoutScrollbarWidth: 10,
	layoutType: ESmallMultiplesLayoutType.Grid,
	displayType: ESmallMultiplesDisplayType.Fixed,
	viewType: ESmallMultiplesViewType.Scroll,
	rows: 2,
	columns: 2,
	gridDataItemsTotals: [],
	outerSpacing: 10,
	innerSpacing: 10,
	xAxisType: ESmallMultiplesAxisType.Individual,
	yAxisType: ESmallMultiplesAxisType.Individual,
	xAxisPosition: ESmallMultiplesXAxisPosition.FrozenBottomColumn,
	yAxisPosition: ESmallMultiplesYAxisPosition.FrozenLeftColumn,
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
		alternateColor: "rgba(255,255,255,1)",
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
		type: ESmallMultiplesShadowType.Simple,
		verticalOffset: 3,
		horizontalOffset: 3,
		blur: 7,
		spread: 0,
		color: "rgba(0, 0, 0, 10)",
		inset: false
	},
	onCellRendered: undefined,
	getUniformXAxisAndBrushNode: undefined,
	getXYAxisNodeElementAndMeasures: undefined,
	onRenderingFinished: undefined
};