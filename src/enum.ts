export enum EVisualConfig {
	ChartConfig = "chartConfig",
	MarkerConfig = "markerConfig",
	DataColorsConfig = "dataColorsConfig",
	LineConfig = "lineConfig",
	DataLabelsConfig = "dataLabelsConfig",
	GridLinesConfig = "gridLinesConfig",
	RankingConfig = "rankingConfig",
	SortingConfig = "sortingConfig",
	XAxisConfig = "xAxisConfig",
	YAxisConfig = "yAxisConfig",
	ShowBucketConfig = "showBucketConfig",
	BrushAndZoomAreaConfig = "brushAndZoomAreaConfig",
	RaceChartConfig = "raceChartConfig",
	PatternConfig = "patternConfig",
	ReferenceLinesConfig = "referenceLinesConfig",
}

export enum EVisualSettings {
	License = "license",
	VisualGeneralSettings = "visualGeneralSettings",
	ChartSettings = "chartSettings",
	MarkerSettings = "markerSettings",
	DataColorsSettings = "dataColorsSettings",
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
	RaceChartSettings = "raceChartSettings",
	PatternSettings = "patternSettings",
	ReferenceLinesSettings = "referenceLinesSettings",
}

export enum ELineType {
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
	Start = "start",
	End = "end",
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

export enum EAutoCustomTypes {
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
	RaceChartData = "raceChartData",
	Measure1 = "measure1",
	Measure2 = "measure2",
	Tooltip = "tooltip",
	Sort = "sort",
	ImagesData = "imagesData",
	ShowBucket = "showBucket",
}

export enum FontStyle {
	Italic = "italic",
	Bold = "bold",
	None = "none",
}

export enum EChartSettings {
	isHasSubCategories = "isHasSubCategories",
	orientation = "orientation",
	isAutoLollipopWidth = "isAutoLollipopWidth",
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
	fontFamily = "fontFamily",
	showBackground = "showBackground",
	backgroundColor = "backgroundColor",
	fontStyle = "fontStyle",
	placement = "placement",
	isAutoFontSize = "isAutoFontSize",
	showLabelsBelowReferenceLine = "showLabelsBelowReferenceLine",
	isColorChanged = "isColorChanged",
	textColorTypes = "textColorTypes",
	applyFor = "applyFor",
	isShowBGChangedWhenPatternApplied = "isShowBGChangedWhenPatternApplied"
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
	MarkerType = "markerType",
	FillMin = "fillMin",
	FillMid = "fillMid",
	FillMax = "fillMax",
	IsAddMidColor = "isAddMidColor",
	FillType = "fillType",
	SingleColor = "singleColor",
	GradientColors = "gradientColors",
	CategoryColors = "categoryColors",
	NumberOfClasses = "numberOfClasses",
	SchemeColors = "schemeColors",
	ColorBlindSafe = "colorBlindSafe",
	ColorScheme = "colorScheme",
	Reverse = "reverse",
	IsGradient = "isGradient",
	Categories = "categories",
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
	MinLollipopCount = "minLollipopCount",
	IsShowAxis = "isShowAxis",
	TrackBackgroundColor = "trackBackgroundColor",
	SelectionTrackBackgroundColor = "selectionTrackBackgroundColor",
	SelectionTrackBorderColor = "selectionTrackBorderColor",
	IsAutoWidth = "isAutoWidth",
	IsAutoHeight = "isAutoHeight",
	Width = "width",
	Height = "height"
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

export enum EXAxisSettings {
	Position = "position",
	IsDisplayTitle = "isDisplayTitle",
	TitleName = "titleName",
	TitleColor = "titleColor",
	TitleFontSize = "titleFontSize",
	TitleFontFamily = "titleFontFamily",
	IsDisplayLabel = "isDisplayLabel",
	LabelColor = "labelColor",
	LabelFontFamily = "labelFontFamily",
	LabelFontSize = "labelFontSize",
	IsShowAxisLine = "isShowAxisLine",
	LabelTilt = "labelTilt",
	IsLabelAutoTilt = "isLabelAutoTilt"
}

export enum EYAxisSettings {
	Position = "position",
	IsDisplayTitle = "isDisplayTitle",
	TitleName = "titleName",
	TitleColor = "titleColor",
	TitleFontSize = "titleFontSize",
	TitleFontFamily = "titleFontFamily",
	IsDisplayLabel = "isDisplayLabel",
	LabelColor = "labelColor",
	LabelFontFamily = "labelFontFamily",
	LabelFontSize = "labelFontSize",
	IsShowLabelsAboveLine = "isShowLabelsAboveLine",
	IsShowAxisLine = "isShowAxisLine"
}

export enum EMarkerSettings {
	MarkerType = "markerType",
	MarkerShape = "markerShape",
	MarkerChart = "markerChart",
	MarkerShapeValue = "markerShapeValue",
	MarkerShapePath = "markerShapePath",
	MarkerShapeBase64Url = "markerShapeBase64Url",
	DropdownMarkerType = "dropdownMarkerType",
	Marker1Styles = "marker1Styles",
	Marker2Styles = "marker2Styles",
	MarkerStyleType = "markerStyleType",
	IsAutoMarkerSize = "isAutoMarkerSize",
	MarkerSize = "markerSize",
	SelectedImageDataField = "selectedImageDataField"
}

export enum ERaceChartSettings {
	AllowTransition = "allowTransition",
	TransitionDuration = "transitionDuration",
	DataChangeInterval = "dataChangeInterval",
	LabelColor = "labelColor",
	LabelFontSize = "labelFontSize",
	IsLabelAutoFontSize = "isLabelAutoFontSize",
	LabelFontFamily = "labelFontFamily",
	TickerButtonRadius = "tickerButtonRadius",
	IsTickerButtonAutoRadius = "isTickerButtonAutoRadius",
	TickerButtonColor = "tickerButtonColor",
}

export enum EMarkerTypes {
	SHAPE = "shape",
	CHART = "chart"
}

export enum EMarkerShapeTypes {
	DEFAULT = "default",
	IMAGES = "images",
	ICONS_LIST = "icons-list",
	UPLOAD_ICON = "upload-icon"
}

export enum EMarkerChartTypes {
	PIE = "pie",
	DONUT = "donut",
	ROSE = "rose"
}

export enum EMarkerDefaultShapes {
	CIRCLE = "circle",
	SQUARE = "square",
	TRIANGLE = "triangle",
	DIAMOND = "diamond",
	HORIZONTAL_LINE = "horizontal_line",
}

export enum EMarkerStyleTypes {
	Marker1Style = "marker1Style",
	Marker2Style = "marker2Style",
}

export enum EMarkerColorTypes {
	Marker1 = "marker1",
	Marker2 = "marker2",
}

export enum EFontStyle {
	Bold = "bold",
	Italic = "italic",
	UnderLine = "underline",
}

export enum EPlayPauseButton {
	Play = "play",
	Pause = "pause",
}

export enum EReferenceLinesType {
	Value = "value",
	Ranking = "ranking",
}

export enum EReferenceLineComputation {
	Min = "min",
	Max = "max",
	Average = "average",
	Median = "median",
	Fixed = "fixed",
}

export enum EXYAxisNames {
	X = "X",
	Y = "Y",
}

export enum EStartEndPosition {
	Start = "start",
	End = "end",
}

export enum EBeforeAfterPosition {
	Before = "before",
	After = "after",
}

export enum ELCRPosition {
	Left = "left",
	Centre = "center",
	Right = "right",
}

export enum EDataLabelsBGApplyFor {
	All = "all",
	ONLY_PATTERNS = "only patterns",
}