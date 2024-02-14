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
} from "./enum";
import {
	EInsideTextColorTypes,
	IBrushAndZoomAreaSettings,
	IChartSettings,
	ICirclePropsSettings,
	ICutAndClipAxisSettings,
	IDataColorsSettings,
	IDataLabelsSettings,
	IDynamicDeviationSettings,
	IErrorBarsSettings,
	IGridLinesPropsSettings,
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
	ITrendLinesSettings,
	IXAxisSettings,
	IYAxisSettings,
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
	zeroBaseLineSize: 1,
	showConnectingLine: false,
	connectingLineColor: "rgba(0, 0, 0, 1)",
	connectingLineWidth: 1,
	connectingLineStyle: ELineType.Dotted,
	isIBCSEnabled: false,
	theme: undefined,
	prevTheme: undefined
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
	color: "rgba(93, 93, 93, 1)",
	borderColor: "rgba(255, 255, 255,1)",
	borderWidth: 1,
	orientation: Orientation.Horizontal,
	fontSize: 12,
	fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	showBackground: false,
	backgroundColor: "rgba(93, 93, 93, 1)",
	fontStyle: [],
	placement: DataLabelsPlacement.Outside,
	isAutoFontSize: true,
	showLabelsBelowReferenceLine: false,
	isColorChanged: false,
	textColorTypes: EInsideTextColorTypes.CONTRAST,
	applyFor: EDataLabelsBGApplyFor.ONLY_PATTERNS,
	isShowBGChangedWhenPatternApplied: false,
	isShowBestFitLabels: true,
	isTextColorTypeChanged: false
};

export const X_GRID_LINES_SETTINGS: IGridLinesPropsSettings = {
	show: false,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const Y_GRID_LINES_SETTINGS: IGridLinesPropsSettings = {
	show: false,
	lineType: ELineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
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
	isCustomizeOthersColor: false,
	othersColor: "rgba(84, 84, 84, 1)"
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
	isLogarithmScale: false,
	isDisplayTitle: false,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	titleStyling: [],
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	isLabelAutoTilt: true,
	labelTilt: 30,
	labelCharLimit: 20,
	isShowAxisLine: false,
	axisLineColor: "rgba(84, 84, 84, 1)",
	isLabelAutoCharLimit: true,
	categoryType: AxisCategoryType.Categorical,
	isMaximumRangeEnabled: false,
	maximumRange: 0,
	isMinimumRangeEnabled: false,
	minimumRange: 0,
	isInvertRange: false,
	isAutoDateFormat: true,
	dateFormat: EAxisDateFormats.DDMMYYYYHHMMAMPM,
	customDateFormat: "DD:MM:YYYY hh:mm A"
};

export const Y_AXIS_SETTINGS: IYAxisSettings = {
	show: true,
	position: Position.Left,
	isLogarithmScale: false,
	isDisplayTitle: false,
	titleName: "",
	titleColor: "rgba(84, 84, 84, 1)",
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	titleStyling: [],
	isDisplayLabel: true,
	labelColor: "rgba(84, 84, 84, 1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	labelCharLimit: 20,
	isShowLabelsAboveLine: false,
	isShowAxisLine: false,
	axisLineColor: "rgba(84, 84, 84, 1)",
	isLabelAutoCharLimit: true,
	categoryType: AxisCategoryType.Categorical,
	isMaximumRangeEnabled: false,
	maximumRange: 0,
	isMinimumRangeEnabled: false,
	minimumRange: 0,
	isInvertRange: false,
	isAutoDateFormat: true,
	dateFormat: EAxisDateFormats.DDMMYYYYHHMMAMPM,
	customDateFormat: "DD:MM:YYYY hh:mm A"
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
	minLollipopCount: 10,
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
	measuresPatterns: [],
	subCategoryPatterns: [],
	isPatternBorderEnabled: false,
	patternBorderWidth: 1
};

export const MARKER_SETTINGS: IMarkerSettings = {
	markerType: EMarkerTypes.SHAPE,
	markerStyleType: EMarkerStyleTypes.Marker1Style,
	marker1Style: {
		isAutoMarkerSize: false,
		markerSize: 20,
		markerShape: EMarkerShapeTypes.DEFAULT,
		markerChart: EMarkerChartTypes.DONUT,
		markerShapeValue: undefined,
		markerShapePath: "",
		markerShapeBase64Url: "",
		dropdownMarkerType: EMarkerDefaultShapes.CIRCLE,
		selectedImageDataField: undefined,
	},
	marker2Style: {
		isAutoMarkerSize: false,
		markerSize: 20,
		markerShape: EMarkerShapeTypes.DEFAULT,
		markerChart: EMarkerChartTypes.DONUT,
		markerShapeValue: undefined,
		markerShapePath: "",
		markerShapeBase64Url: "",
		dropdownMarkerType: EMarkerDefaultShapes.CIRCLE,
		selectedImageDataField: undefined,
	},
	isAutoLollipopTypePie: false
};

export const RACE_CHART_SETTINGS: IRaceChartSettings = {
	isEnabled: true,
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
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "1",
	},
	lineValue2: {
		axis: EXYAxisNames.X,
		type: EReferenceLinesType.Value,
		value: undefined,
		computation: EReferenceLineComputation.Fixed,
		rankOrder: Position.Start,
		rank: "1",
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
		labelColor: "rgba(0,0,0,1)",
		isShowLabelBackground: true,
		labelBackgroundColor: "rgba(0,0,0,0.2)",
		autoFontSize: true,
		labelFontSize: "16",
		labelPosition: EBeforeAfterPosition.Before,
		labelAlignment: ELCRPosition.Centre,
		styling: [],
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
		calcType: EErrorBarsCalcTypes.ByField,
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
		isEnabled: true,
		fontSize: 10,
		fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
		color: "rgba(255,255,255,1)",
		showBackground: true,
		backgroundColor: "rgba(0,0,0,1)",
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
	fromIndex: 1,
	toIndex: 2,
	position: Position.Right,
	labelDisplayType: EDynamicDeviationLabelDisplayTypes.Value,
	labelFontSize: 12,
	labelFontColor: "rgba(255,255,255,1)",
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isShowLabelBorder: false,
	borderWidth: 2,
	borderColor: "rgba(0, 0, 0, 1)",
	isShowLabelBackground: true,
	backgroundColor: "rgba(0, 0, 0, 1)",
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
	labelPosition: Position.Right
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
	breakStart: 0,
	breakEnd: 0,
	markerStrokeColor: "rgba(102,102,102,1)",
	markerBackgroundColor: "rgba(255, 255, 255, 1)",
};