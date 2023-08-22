import {
	CircleFillOption,
	CircleSize,
	CircleType,
	ColorPaletteType,
	DataLabelsFontSizeType,
	DataLabelsPlacement,
	LineType,
	LollipopDistanceType,
	LollipopType,
	Orientation,
	PieSize,
	PieType,
	Position,
	RankingDataValuesType,
	RankingFilterType,
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
	IRankingPropsSettings,
	IRankingSettings,
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
	isLollipopTypeChanged: false,
	isHasSubCategories: false,
	orientation: Orientation.Vertical,
	lollipopDistanceType: LollipopDistanceType.Auto,
	lollipopDistance: 60,
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
	maxCircleRadius: 23,
	circleRadius: 23,
	strokeWidth: 6,
};

export const CIRCLE2_SETTINGS: ICirclePropsSettings = {
	show: true,
	isCircleFilled: CircleFillOption.Yes,
	circleSize: CircleSize.Auto,
	maxCircleRadius: 23,
	circleRadius: 23,
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

export const VALUE1_RANKING_SETTINGS: IRankingPropsSettings = {
	filterType: RankingFilterType.TopN,
	count: 5,
	showRemainingAsOthers: false,
	isSubcategoriesRanking: false,
	circleFillColor: "rgba(84, 84, 84,1)",
	circleStrokeColor: "rgba(84, 84, 84,1)",
	pieSliceColor: "rgba(84, 84, 84,1)",
	lineColor: "rgba(84, 84, 84,1)",
	subCategoriesRanking: {
		filterType: RankingFilterType.TopN,
		count: 10,
		showRemainingAsOthers: false,
		pieSliceColor: "rgba(84, 84, 84,1)",
	},
};

export const VALUE2_RANKING_SETTINGS: IRankingPropsSettings = {
	filterType: RankingFilterType.TopN,
	count: 5,
	showRemainingAsOthers: false,
	isSubcategoriesRanking: false,
	circleFillColor: "rgba(84, 84, 84,1)",
	circleStrokeColor: "rgba(84, 84, 84,1)",
	pieSliceColor: "rgba(84, 84, 84,1)",
	lineColor: "rgba(84, 84, 84,1)",
	subCategoriesRanking: {
		filterType: RankingFilterType.TopN,
		count: 10,
		showRemainingAsOthers: false,
		pieSliceColor: "rgba(84, 84, 84,1)",
	},
};

export const RANKING_SETTINGS: IRankingSettings = {
	isRankingEnabled: false,
	valueType: RankingDataValuesType.Value1,
	value1: VALUE1_RANKING_SETTINGS,
	value2: VALUE2_RANKING_SETTINGS,
};

export const X_AXIS_SETTINGS: IXAxisSettings = {
	position: Position.Bottom,
	isDisplayTitle: false,
	titleName: "",
	titleColor: null,
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isDisplayLabel: true,
	labelColor: null,
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
	titleColor: null,
	titleFontSize: 12,
	titleFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	isDisplayLabel: true,
	labelColor: null,
	labelFontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
	labelFontSize: 12,
	labelCharLimit: 10,
};
