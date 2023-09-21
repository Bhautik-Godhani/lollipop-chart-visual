export enum EVisualConfig {
	ChartConfig = "chartConfig",
	DataColorsConfig = "dataColorsConfig",
	CircleConfig = "circleConfig",
	LineConfig = "lineConfig",
	DataLabelsConfig = "dataLabelsConfig",
	GridLinesConfig = "gridLinesConfig",
	RankingConfig = "rankingConfig",
	SortingConfig = "sortingConfig",
	XAxisConfig = "xAxisConfig",
	YAxisConfig = "yAxisConfig",
	ShowBucketConfig = "showBucketConfig",
	BrushAndZoomAreaConfig = "brushAndZoomAreaConfig",
	PatternConfig = "patternConfig"
}

export enum EVisualSettings {
	License = "license",
	VisualGeneralSettings = "visualGeneralSettings",
	ChartSettings = "chartSettings",
	DataColorsSettings = "dataColorsSettings",
	CircleSettings = "circleSettings",
	LineSettings = "lineSettings",
	DataLabelsSettings = "dataLabelsSettings",
	GridLinesSettings = "gridLinesSettings",
	RankingSettings = "rankingSettings",
	Sorting = "sorting",
	XAxisSettings = "xAxisSettings",
	YAxisSettings = "yAxisSettings",
	Legend = "legend",
	NumberFormatting = "numberFormatting",
	ShowBucketFormatting = "showBucket",
	Footer = "footer",
	BrushAndZoomAreaSettings = "brushAndZoomAreaSettings",
	PatternSettings = "patternSettings",
}

export enum LineType {
	Dotted = "dotted",
	Dashed = "dashed",
	Solid = "solid",
}

export enum CircleType {
	Circle1 = "circle1",
	Circle2 = "circle2",
}

export enum LegendType {
	Legend1 = "legend1",
	Legend2 = "legend2",
}

export enum ColorPaletteType {
	Single = "single",
	PowerBi = "powerBi",
	Gradient = "gradient",
	ByCategory = "byCategory",
	Sequential = "sequential",
	Diverging = "diverging",
	Qualitative = "qualitative",
}

export enum CategoryDataColorProps {
	fillColor = "fillColor",
	strokeColor = "strokeColor",
}

export enum PieType {
	Pie1 = "pie1",
	Pie2 = "pie2",
}

export enum CircleFillOption {
	Yes = "yes",
	No = "no",
}

export enum Position {
	Top = "top",
	Bottom = "bottom",
	Left = "left",
	Right = "right",
}

export enum ELegendPosition {
	TopLeft = "TopLeft",
	TopCenter = "TopCenter",
	TopRight = "TopRight",
	BottomLeft = "BottomLeft",
	BottomCenter = "BottomCenter",
	BottomRight = "BottomRight",
	LeftTop = "LeftTop",
	LeftCenter = "LeftCenter",
	LeftBottom = "LeftBottom",
	RightTop = "RightTop",
	RightCenter = "RightCenter",
	RightBottom = "RightBottom",
}

export enum Orientation {
	Vertical = "vertical",
	Horizontal = "horizontal",
}

export enum LollipopWidthType {
	Auto = "auto",
	Custom = "custom",
}

export enum DataLabelsFontSizeType {
	Auto = "auto",
	Custom = "custom",
}

export enum ERankingType {
	TopN = "topN",
	BottomN = "bottomN",
}

export enum RankingDataValuesType {
	Value1 = "value1",
	Value2 = "value2",
}

export enum CircleSize {
	Auto = "auto",
	Custom = "custom",
}

export enum PieSize {
	Auto = "auto",
	Custom = "custom",
}

export enum DataLabelsPlacement {
	Inside = "inside",
	Outside = "outside",
}

export enum DisplayUnits {
	Auto = "auto",
	None = "none",
	Thousands = "thousands",
	Millions = "millions",
	Billions = "billions",
	Trillions = "trillions",
}

export enum EDataRolesName {
	Category = "category",
	SubCategory = "subCategory",
	Measure = "measure",
	Measure1 = "measure1",
	Measure2 = "measure2",
	Tooltip = "tooltip",
	Sort = "sort",
	ShowBucket = "showBucket",
}

export enum LollipopType {
	Circle = "circle",
	Pie = "pie",
	Donut = "donut",
	Rose = "Rose",
}

export enum FontStyle {
	Italic = "italic",
	Bold = "bold",
	None = "none",
}

export enum EChartSettings {
	lollipopType = "lollipopType",
	isLollipopTypeChanged = "isLollipopTypeChanged",
	isHasSubCategories = "isHasSubCategories",
	orientation = "orientation",
	lollipopWidthType = "lollipopWidthType",
	lollipopWidth = "lollipopWidth",
	pieSettings = "pieSettings",
}

export enum ECircleSettings {
	circle1 = "circle1",
	circle2 = "circle2",
	circleType = "circleType",
	show = "show",
	isCircleFilled = "isCircleFilled",
	circleSize = "circleSize",
	maxCircleRadius = "maxCircleRadius",
	circleRadius = "circleRadius",
	strokeWidth = "strokeWidth",
}

export enum ELineSettings {
	show = "show",
	lineType = "lineType",
	lineWidth = "lineWidth",
	lineColor = "lineColor",
}

export enum EDataLabelsSettings {
	show = "show",
	color = "color",
	borderColor = "borderColor",
	borderWidth = "borderWidth",
	displayUnits = "displayUnits",
	valueDecimalPlaces = "valueDecimalPlaces",
	orientation = "orientation",
	fontSize = "fontSize",
	pieDataLabelFontSize = "pieDataLabelFontSize",
	fontFamily = "fontFamily",
	showBackground = "showBackground",
	backgroundColor = "backgroundColor",
	transparency = "transparency",
	fontStyle = "fontStyle",
	placement = "placement",
	fontSizeType = "fontSizeType",
}

export enum EGridLinesSettings {
	xGridLines = "xGridLines",
	yGridLines = "yGridLines",
	show = "show",
	lineType = "lineType",
	lineWidth = "lineWidth",
	lineColor = "lineColor",
}

export enum EPieSettings {
	pie1 = "pie1",
	pie2 = "pie2",
	pieType = "pieType",
	pieSize = "pieSize",
	maxPieRadius = "maxPieRadius",
	pieRadius = "pieRadius",
	isShowPieLabel = "isShowPieLabel",
	isShowLabelLine = "isShowLabelLine",
}

export enum EDataColorsSettings {
	dataType = "dataType",
	circleFillColor = "circleFillColor",
	circleStrokeColor = "circleStrokeColor",
	circle1 = "circle1",
	circle2 = "circle2",
	pie1 = "pie1",
	pie2 = "pie2",
	fillmin = "fillmin",
	midcolor = "midcolor",
	fillmid = "fillmid",
	fillmax = "fillmax",
	fillnull = "fillnull",
	fillType = "fillType",
	numberOfClasses = "numberOfClasses",
	byCategoryColors = "byCategoryColors",
	schemeColors = "schemeColors",
	reverse = "reverse",
	isGradient = "isGradient",
	singleColor = "singleColor",
	defaultColor = "defaultColor",
	selectedCategoryName = "selectedCategoryName",
	selectedCategoryColor = "selectedCategoryColor",
}

export enum ERankingSettings {
	Category = "category",
	SubCategory = "subCategory",
	Enabled = "enabled",
	RankingType = "rankingType",
	Count = "count",
	ShowRemainingAsOthers = "showRemainingAsOthers",
	OthersColor = "othersColor",
}

export enum ESortOrderTypes {
	ASC = "1",
	DESC = "2",
}

export enum ESortByTypes {
	CATEGORY = "category",
	VALUE = "value",
}

export enum ESortingSettings {
	Category = "category",
	SubCategory = "subCategory",
	Enabled = "enabled",
	SortBy = "sortBy",
	SortOrder = "sortOrder",
	IsSortByCategory = "isSortByCategory",
	IsSortByMeasure = "isSortByMeasure",
	IsSortByExtraSortField = "isSortByExtraSortField",
}

export enum EShowBucketSettings {
	Enable = "enable",
	ShowBucketField = "showBucketField",
	Message = "message",
	ShowIcon = "showIcon",
	FontFamily = "fontFamily",
	FontSize = "fontSize",
	Styling = "styling",
	Color = "color",
}

export enum EBrushAndZoomAreaSettings {
	Enabled = "enabled",
	IsShowAxis = "isShowAxis"
}

export enum DataValuesType {
	Value1 = "value1",
	Value2 = "value2",
}

export enum EPatternSettings {
	Enabled = "enabled",
	CategoryPatterns = "categoryPatterns",
	SubcategoryPatterns = "subCategoryPatterns",
	IsPatternBorderEnabled = "isPatternBorderEnabled",
	PatternBorderWidth = "patternBorderWidth"
}

export enum EHighContrastColorType {
	Foreground = "foreground",
	Background = "background",
}