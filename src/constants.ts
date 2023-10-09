import {
	CircleFillOption,
	CircleSize,
	CircleType,
	ColorPaletteType,
	DataLabelsPlacement,
	EAutoCustomTypes,
	EMarkerChartTypes,
	EMarkerColorTypes,
	EMarkerDefaultShapes,
	EMarkerShapeTypes,
	EMarkerStyleTypes,
	EMarkerTypes,
	ERankingType,
	ESortOrderTypes,
	LineType,
	Orientation,
	PieSize,
	PieType,
	Position,
	RankingDataValuesType,
} from "./enum";
import {
	IBrushAndZoomAreaSettings,
	IChartSettings,
	ICirclePropsSettings,
	IDataColorsProps,
	IDataColorsSettings,
	IDataLabelsSettings,
	IGridLinesSettings,
	ILineSettings,
	IMarkerSettings,
	IPatternSettings,
	IPiePropsSettings,
	IRaceChartSettings,
	IRankingSettings,
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
	isShowImageMarker: false
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
	lineType: LineType.Solid,
	lineWidth: 6,
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
	backgroundColor: "rgba(0,0,0,1)",
	transparency: 90,
	fontStyle: [],
	placement: DataLabelsPlacement.Inside,
	isAutoFontSize: true,
};

export const X_GRID_LINES_SETTINGS: IXGridLinesSettings = {
	show: true,
	lineType: LineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const Y_GRID_LINES_SETTINGS: IYGridLinesSettings = {
	show: true,
	lineType: LineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const GRID_LINES_SETTINGS: IGridLinesSettings = {
	xGridLines: X_GRID_LINES_SETTINGS,
	yGridLines: Y_GRID_LINES_SETTINGS,
};

export const MARKER_DATA_COLORS: IDataColorsProps = {
	fillMin: "rgba(186, 72, 239, 1)",
	fillMid: "rgba(127, 88, 246, 1)",
	fillMax: "rgba(75, 132, 244, 1)",
	isAddMidColor: true,
	fillType: ColorPaletteType.Gradient,
	singleColor: "rgba(92,113,187,1)",
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
};

export const DATA_COLORS: IDataColorsSettings = {
	markerType: EMarkerColorTypes.Marker1,
	marker1: MARKER_DATA_COLORS,
	marker2: MARKER_DATA_COLORS,
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
	labelCharLimit: 10,
};

export const Y_AXIS_SETTINGS: IYAxisSettings = {
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
	labelCharLimit: 10,
	isShowLabelsAboveLine: false
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
	enabled: true,
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
	marker1Style: { isAutoMarkerSize: true, markerSize: 0 },
	marker2Style: { isAutoMarkerSize: true, markerSize: 0 }
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