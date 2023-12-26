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
	TrendLinesConfig = "trendLinesConfig",
	PatternConfig = "patternConfig",
	ReferenceLinesConfig = "referenceLinesConfig",
	ErrorBarsConfig = "errorBarsConfig",
	IBCSConfig = "IBCSConfig",
	Editor = "editor",
	DynamicDeviationConfig = "dynamicDeviationConfig",
	CutAndClipAxisConfig = "cutAndClipAxisConfig",
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
	TrendLinesSettings = "trendLinesSettings",
	PatternSettings = "patternSettings",
	ReferenceLinesSettings = "referenceLinesSettings",
	ErrorBarsSettings = "errorBarsSettings",
	IBCSSettings = "IBCSSettings",
	BeforeIBCSSettings = "beforeIBCSSettings",
	DynamicDeviationSettings = "dynamicDeviationSettings",
	CutAndClipAxisSettings = "cutAndClipAxisSettings",
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
	Legend = "legend",
}

export enum ColorPaletteType {
	Single = "single",
	PowerBi = "powerBi",
	Gradient = "gradient",
	ByCategory = "byCategory",
	Sequential = "sequential",
	Diverging = "diverging",
	Qualitative = "qualitative",
	PositiveNegative = "positiveNegative"
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
	Millions = "million",
	Billions = "billion",
	Trillions = "trillion",
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
	UpperBound = "upperBound",
	LowerBound = "lowerBound"
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
	isShowZeroBaseLine = "isShowZeroBaseLine",
	zeroBaseLineColor = "zeroBaseLineColor",
	zeroBaseLineSize = "zeroBaseLineSize",
	showConnectingLine = "showConnectingLine",
	connectingLineColor = "connectingLineColor",
	connectingLineWidth = "connectingLineWidth",
	connectingLineStyle = "connectingLineStyle",
	IsIBCSEnabled = "isIBCSEnabled",
	Theme = "theme",
	PrevTheme = "prevTheme"
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
	isShowBGChangedWhenPatternApplied = "isShowBGChangedWhenPatternApplied",
	isShowBestFitLabels = "isShowBestFitLabels"
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
	FillMin = "fillMin",
	FillMid = "fillMid",
	FillMax = "fillMax",
	IsAddMidColor = "isAddMidColor",
	FillType = "fillType",
	IsFillTypeChanged = "isFillTypeChanged",
	SingleColor1 = "singleColor1",
	SingleColor2 = "singleColor2",
	GradientColors = "gradientColors",
	CategoryColors = "categoryColors",
	NumberOfClasses = "numberOfClasses",
	SchemeColors = "schemeColors",
	ColorBlindSafe = "colorBlindSafe",
	ColorScheme = "colorScheme",
	Reverse = "reverse",
	IsGradient = "isGradient",
	Categories = "categories",
	PositiveColor = "positiveColor",
	NegativeColor = "negativeColor",
	GradientAppliedToMeasure = "gradientAppliedToMeasure"
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
	Show = "show",
	Position = "position",
	IsLogarithmScale = "isLogarithmScale",
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
	IsLabelAutoTilt = "isLabelAutoTilt",
	LabelCharLimit = "labelCharLimit",
	IsLabelAutoCharLimit = "isLabelAutoCharLimit",
	CategoryType = "categoryType",
	IsMinimumRangeEnabled = "isMinimumRangeEnabled",
	MinimumRange = "minimumRange",
	IsMaximumRangeEnabled = "isMaximumRangeEnabled",
	MaximumRange = "maximumRange",
	IsInvertRange = "isInvertRange"
}

export enum EYAxisSettings {
	Show = "show",
	Position = "position",
	IsLogarithmScale = "isLogarithmScale",
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
	IsShowAxisLine = "isShowAxisLine",
	LabelCharLimit = "labelCharLimit",
	IsLabelAutoCharLimit = "isLabelAutoCharLimit",
	IsMinimumRangeEnabled = "isMinimumRangeEnabled",
	MinimumRange = "minimumRange",
	IsMaximumRangeEnabled = "isMaximumRangeEnabled",
	MaximumRange = "maximumRange",
	IsInvertRange = "isInvertRange"
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

export enum EReferenceLinesSettings {
	ReferenceType = "referenceType",
	LineValue1 = "lineValue1",
	LineValue2 = "lineValue2",
	LineStyle = "lineStyle",
	LabelStyle = "labelStyle",
	BandStyle = "bandStyle",
	Line1Coord = "line1Coord",
	Line2Coord = "line2Coord",
	LabelCoord = "labelCoord"
}

export enum EReferenceLineValueProps {
	MeasureName = "measureName",
	Axis = "axis",
	Value = "value",
	RankOrder = "rankOrder",
	Computation = "computation",
	Rank = "rank",
	Type = "type"
}

export enum EReferenceLineStyleProps {
	LineStyle = "lineStyle",
	LineColor = "lineColor",
	AutoLineWidth = "autoLineWidth",
	LineWidth = "lineWidth",
	Styling = "styling",
	LinePlacement = "linePlacement"
}

export enum EReferenceLineNameTypes {
	TEXT = "text",
	VALUE = "value",
	TEXT_VALUE = "text_value"
}

export enum EReferenceLineLabelStyleProps {
	LabelNameType = "labelNameType",
	TextAnchor = "textAnchor",
	TextAlignment = "textAlignment",
	Label = "label",
	LabelFontFamily = "labelFontFamily",
	LabelColor = "labelColor",
	IsShowLabelBackground = "isShowLabelBackground",
	LabelBackgroundColor = "labelBackgroundColor",
	AutoFontSize = "autoFontSize",
	LabelFontSize = "labelFontSize",
	LabelPosition = "labelPosition",
	LabelAlignment = "labelAlignment",
	LabelOrientation = "labelOrientation"
}

export enum EReferenceType {
	REFERENCE_LINE = "referenceLine",
	REFERENCE_BAND = "referenceBand"
}

export enum EReferenceLineType {
	FRONT = "front",
	BEHIND = "behind"
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
	Marker1 = "marker1Color",
	Marker2 = "marker2Color",
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
	ZeroBaseline = "zeroBaseline",
	Min = "min",
	Max = "max",
	Average = "average",
	Median = "median",
	Fixed = "fixed",
	StandardDeviation = "standard_deviation"
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
	Center = "center",
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

export enum ERelationshipToMeasure {
	Absolute = "absolute",
	Relative = "relative",
}

export enum EErrorBarsTooltipLabelFormat {
	Absolute = "absolute",
	RelativeNumeric = "relativeNumeric",
	RelativePercentage = "relativePercentage",
}

export enum EErrorBarsLabelFormat {
	Absolute = "absolute",
	RelativeNumeric = "relativeNumeric",
	RelativePercentage = "relativePercentage",
	Range = "range"
}

export enum EErrorBarsMarkerShape {
	Circle = "circle",
	Square = "square",
	Close = "close",
	Dash = "dash",
	Minus = "minus",
	Plus = "plus",
}

export enum EErrorBarsSettings {
	IsEnabled = "isEnabled",
	Measurement = "measurement",
	Direction = "direction",
	ApplySettingsToMeasure = "applySettingsToMeasure",
	CalcType = "calcType",
	RelationshipToMeasure = "relationshipToMeasure",
	MakeSymmetrical = "makeSymmetrical",
	UpperBoundMeasure = "upperBoundMeasure",
	LowerBoundMeasure = "lowerBoundMeasure",
	UpperBoundPercentage = "upperBoundPercentage",
	LowerBoundPercentage = "lowerBoundPercentage",
	StandardDeviation = "standardDeviation",
	ErrorBars = "errorBars",
	IsMatchSeriesColor = "isMatchSeriesColor",
	BarColor = "barColor",
	BarWidth = "barWidth",
	MarkerShape = "markerShape",
	MarkerSize = "markerSize",
	BorderColor = "borderColor",
	BorderSize = "borderSize",
	ErrorBand = "errorBand",
	FillType = "fillType",
	FillColor = "fillColor",
	LineStyle = "lineStyle",
	ErrorLabels = "errorLabels",
	FontSize = "fontSize",
	FontFamily = "fontFamily",
	Color = "color",
	ShowBackground = "showBackground",
	BackgroundColor = "backgroundColor",
	FontStyle = "fontStyle",
	LabelFormat = "labelFormat",
	Tooltip = "tooltip",
	LineColor = "lineColor"
}

export enum EErrorBarsCalcTypes {
	ByField = "byField",
	ByPercentage = "byPercentage",
	ByPercentile = "byPercentile",
	ByStandardDeviation = "byStandardDeviation"
}

export enum EErrorBarsDirection {
	Plus = "plus",
	Minus = "minus",
	Both = "both"
}

export enum EErrorBandFillTypes {
	Fill = "fill",
	Line = "line",
	FillAndLine = "fillLine",
}

export enum EIBCSSettings {
	IsIBCSEnabled = "isIBCSEnabled",
	Theme = "theme",
	PrevTheme = "prevTheme"
}

export enum EIBCSThemes {
	DefaultVertical = "defaultVertical",
	DefaultHorizontal = "defaultHorizontal",
	Diverging1Vertical = "diverging1Vertical",
	Diverging1Horizontal = "diverging1Horizontal",
	Diverging2Vertical = "diverging2Vertical",
	Diverging2Horizontal = "diverging2Horizontal",
}

export enum SemanticNegativeNumberFormats {
	X = "X",
	MinusX = "MinusX",
	XMinus = "XMinus",
	XInBrackets = "XInBrackets",
}

export enum SemanticPositiveNumberFormats {
	X = "X",
	PlusX = "PlusX",
	XPlus = "XPlus",
}

export enum ENumberFormatting {
	show = "show",
	DecimalSeparator = "decimalSeparator",
	ThousandsSeparator = "thousandsSeparator",
	DecimalPlaces = "decimalPlaces",
	Scaling = "scaling",
	Prefix = "prefix",
	Suffix = "suffix",
	ScalingLabel = "scalingLabel",
	ThousandScalingLabel = "thousandScalingLabel",
	MillionScalingLabel = "millionScalingLabel",
	BillionScalingLabel = "billionScalingLabel",
	TrillionScalingLabel = "trillionScalingLabel",
	SemanticFormatting = "semanticFormatting",
	NegativeFormat = "negativeFormat",
	PositiveFormat = "positiveFormat"
}

export enum ECFApplyOnCategories {
	Marker = "marker",
	Line = "line",
	Labels = "labels"
}

export enum EDynamicDeviationSettings {
	IsEnabled = "isEnabled",
	DisplayType = "displayType",
	FromIndex = "fromIndex",
	ToIndex = "toIndex",
	Position = "position",
	LabelDisplayType = "labelDisplayType",
	LabelFontSize = "labelFontSize",
	LabelFontColor = "labelFontColor",
	LabelFontFamily = "labelFontFamily",
	IsShowLabelBorder = "isShowLabelBorder",
	BorderWidth = "borderWidth",
	BorderColor = "borderColor",
	IsShowLabelBackground = "isShowLabelBackground",
	BackgroundColor = "backgroundColor",
	BackgroundColorTransparency = "backgroundColorTransparency",
	ConnectorType = "connectorType",
	IsAutoConnectorColor = "isAutoConnectorColor",
	ConnectingLineColor = "connectingLineColor",
	ConnectorWidth = "connectorWidth",
	ConnectorPositiveColor = "connectorPositiveColor",
	ConnectorNegativeColor = "connectorNegativeColor",
	connectingLineWidth = "connectingLineWidth",
	IsShowStartIndicator = "isShowStartIndicator",
	IsBarBorderEnabled = "isBarBorderEnabled",
	ConnectingLineType = "connectingLineType",
	LabelPosition = "labelPosition"
}

export enum EDynamicDeviationDisplayTypes {
	Auto = "auto",
	CreateYourOwn = "create-your-own",
	CustomRange = "custom-range",
	FirstToLast = "first-to-last",
	LastToFirst = "last-to-first",
	FirstToLastActual = "first-to-last-actual",
	LastToFirstActual = "last-to-first-actual",
	MinToMax = "min-to-max",
	PenultimateToLast = "penultimate-to-last",
}

export enum EDynamicDeviationLabelDisplayTypes {
	Value = "value",
	Percentage = "percentage",
	Both = "both",
}

export enum EDynamicDeviationConnectingLineTypes {
	Arrow = "arrow",
	Bar = "bar",
	Dots = "dots",
}

export enum ETrendLinesTypes {
	Exponential = "exponential",
	Linear = "linear",
	Logarithmic = "logarithmic",
	Polynomial = "polynomial",
	Power = "power",
	MovingAverage = "movingAverage",
	Pareto = "pareto",
	RunningTotal = "runningTotal"
}

export enum ETrendLineSettings {
	IsEnabled = "isEnabled",
	MeasureName = "measureName",
	LineType = "lineType",
	LineStyle = "lineStyle",
	LineColor = "lineColor",
	LineWidth = "lineWidth",
	IsShowLabel = "isShowLabel",
	IsShowIntercept = "isShowIntercept",
	IsDisplayEquation = "isDisplayEquation",
	IsDisplayR2Value = "isDisplayR2Value",
	LabelFontFamily = "labelFontFamily",
	LabelFontStyling = "labelFontStyling",
	LabelFontColor = "labelFontColor",
	LabelFontSize = "labelFontSize",
	LabelOffsetX = "labelOffsetX",
	LabelOffsetY = "labelOffsetY"
}

export enum ECutAndClipAxisSettings {
	IsEnabled = "isEnabled",
	BreakStart = "breakStart",
	BreakEnd = "breakEnd",
	MarkerStrokeColor = "markerStrokeColor",
	MarkerBackgroundColor = "markerBackgroundColor",
}

export enum AxisCategoryType {
	Continuous = "continuous",
	Categorical = "categorical",
}