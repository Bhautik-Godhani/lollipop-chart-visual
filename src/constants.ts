import {
	CircleFillOption,
	CircleSize,
	CircleType,
	ColorPaletteType,
	DataLabelsFontSizeType,
	DataLabelsPlacement,
	ERankingType,
	ESortOrderTypes,
	LineType,
	LollipopType,
	Orientation,
	PieSize,
	PieType,
	Position,
	RankingDataValuesType,
	lollipopCategoryWidthType,
} from "./enum";
import {
	IChartSettings,
	ICirclePropsSettings,
	ICircleSettings,
	IDataColorsPropsSettings,
	IDataColorsSettings,
	IDataLabelsSettings,
	IGridLinesSettings,
	ILineSettings,
	IPiePropsSettings,
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
	lollipopType: LollipopType.Circle,
	lollipopInnerPadding: 30,
	isLollipopTypeChanged: false,
	isHasSubCategories: false,
	orientation: Orientation.Vertical,
	lollipopCategoryWidthType: lollipopCategoryWidthType.Auto,
	lollipopCategoryWidth: 60,
	isLollipopDistanceChange: false,
	pieSettings: {
		pieType: PieType.Pie1,
		pie1: PIE1_SETTINGS,
		pie2: PIE2_SETTINGS,
	},
};

export const CIRCLE1_SETTINGS: ICirclePropsSettings = {
	show: true,
	isCircleFilled: CircleFillOption.Yes,
	circleSize: CircleSize.Auto,
	maxCircleRadius: 10,
	circleRadius: 10,
	strokeWidth: 6,
};

export const CIRCLE2_SETTINGS: ICirclePropsSettings = {
	show: true,
	isCircleFilled: CircleFillOption.Yes,
	circleSize: CircleSize.Auto,
	maxCircleRadius: 10,
	circleRadius: 10,
	strokeWidth: 6,
};

export const CIRCLE_SETTINGS: ICircleSettings = {
	circleType: CircleType.Circle1,
	circle1: CIRCLE1_SETTINGS,
	circle2: CIRCLE2_SETTINGS,
};

export const LINE_SETTINGS: ILineSettings = {
	show: true,
	lineType: LineType.Solid,
	lineWidth: 8,
	lineColor: "rgba(91,121,185,1)",
};

export const DATA_LABELS_SETTINGS: IDataLabelsSettings = {
	show: true,
	color: "#fff",
	borderColor: "rgba(255, 255, 255,1)",
	borderWidth: 2,
	orientation: Orientation.Horizontal,
	fontSize: 12,
	pieDataLabelFontSize: 12,
	fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	showBackground: true,
	backgroundColor: "rgba(0,0,0,1)",
	transparency: 90,
	fontStyle: [],
	placement: DataLabelsPlacement.Inside,
	fontSizeType: DataLabelsFontSizeType.Auto,
};

export const X_GRID_LINES_SETTINGS: IXGridLinesSettings = {
	show: false,
	lineType: LineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const Y_GRID_LINES_SETTINGS: IYGridLinesSettings = {
	show: false,
	lineType: LineType.Dotted,
	lineWidth: 1,
	lineColor: "rgba(151,151,151,1)",
};

export const GRID_LINES_SETTINGS: IGridLinesSettings = {
	xGridLines: X_GRID_LINES_SETTINGS,
	yGridLines: Y_GRID_LINES_SETTINGS,
};

export const CIRCLE1_DATA_COLORS: IDataColorsPropsSettings = {
	fillmin: "rgba(92,113,187,1)",
	midcolor: false,
	fillmid: "rgba(3,194,129,1)",
	fillmax: "rgba(253,98,94,1)",
	fillnull: "rgba(242,242,242,1)",
	fillType: ColorPaletteType.Single,
	numberOfClasses: 5,
	byCategoryColors: [],
	schemeColors: ["rgba(241,238,246,1)", "rgba(189,201,225,1)", "rgba(116,169,207,1)", "rgba(43,140,190,1)", "rgba(4,90,141,1)"],
	reverse: false,
	isGradient: false,
	singleColor: "rgba(91,121,185,1)",
	circleFillColor: "rgba(91,121,185,1)",
	circleStrokeColor: "rgba(91,121,185,1)",
};

export const CIRCLE2_DATA_COLORS: IDataColorsPropsSettings = {
	fillmin: "rgba(92,113,187,1)",
	midcolor: false,
	fillmid: "rgba(3,194,129,1)",
	fillmax: "rgba(253,98,94,1)",
	fillnull: "rgba(242,242,242,1)",
	fillType: ColorPaletteType.Single,
	numberOfClasses: 5,
	byCategoryColors: [],
	schemeColors: ["rgba(241,238,246,1)", "rgba(189,201,225,1)", "rgba(116,169,207,1)", "rgba(43,140,190,1)", "rgba(4,90,141,1)"],
	reverse: false,
	isGradient: false,
	singleColor: "rgba(5,183,155,1)",
	circleFillColor: "rgba(5,183,155,1)",
	circleStrokeColor: "rgba(5,183,155,1)",
};

export const PIE1_DATA_COLORS: IDataColorsPropsSettings = {
	fillmin: "rgba(92,113,187,1)",
	midcolor: false,
	fillmid: "rgba(3,194,129,1)",
	fillmax: "rgba(253,98,94,1)",
	fillnull: "rgba(242,242,242,1)",
	fillType: ColorPaletteType.Gradient,
	numberOfClasses: 5,
	byCategoryColors: [],
	schemeColors: ["rgba(241,238,246,1)", "rgba(189,201,225,1)", "rgba(116,169,207,1)", "rgba(43,140,190,1)", "rgba(4,90,141,1)"],
	reverse: false,
	isGradient: false,
	singleColor: "rgba(92,113,187,1)",
	defaultColor: "rgba(92,113,187,1)",
	selectedCategoryName: null,
	selectedCategoryColor: "rgba(5, 183, 155,1)",
};

export const PIE2_DATA_COLORS: IDataColorsPropsSettings = {
	fillmin: "rgba(92,113,187,1)",
	midcolor: false,
	fillmid: "rgba(3,194,129,1)",
	fillmax: "rgba(253,98,94,1)",
	fillnull: "rgba(242,242,242,1)",
	fillType: ColorPaletteType.Gradient,
	numberOfClasses: 5,
	byCategoryColors: [],
	schemeColors: ["rgba(241,238,246,1)", "rgba(189,201,225,1)", "rgba(116,169,207,1)", "rgba(43,140,190,1)", "rgba(4,90,141,1)"],
	reverse: false,
	isGradient: false,
	singleColor: "rgba(92,113,187,1)",
	defaultColor: "rgba(92,113,187,1)",
	selectedCategoryName: null,
	selectedCategoryColor: "rgba(5, 183, 155,1)",
};

export const DATA_COLORS: IDataColorsSettings = {
	dataType: CircleType.Circle1,
	circle1: CIRCLE1_DATA_COLORS,
	circle2: CIRCLE2_DATA_COLORS,
	pie1: PIE1_DATA_COLORS,
	pie2: PIE2_DATA_COLORS,
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
