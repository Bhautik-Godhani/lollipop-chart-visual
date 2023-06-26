export enum LineType {
    Dotted = 'dotted',
    Dashed = 'dashed',
    Solid = 'solid'
}

export enum CircleType {
    Circle1 = 'circle1',
    Circle2 = 'circle2'
}

export enum LegendType {
    Legend1 = 'legend1',
    Legend2 = 'legend2'
}

export enum ColorPaletteType {
    Single = 'single',
    PowerBi = 'powerBi',
    Gradient = 'gradient',
    ByCategory = 'byCategory',
    Sequential = 'sequential',
    Diverging = 'diverging',
    Qualitative = 'qualitative'
}

export enum CategoryDataColorProps {
    fillColor = 'fillColor',
    strokeColor = 'strokeColor'
};

export enum PieType {
    Pie1 = 'pie1',
    Pie2 = 'pie2'
}

export enum CircleFillOption {
    Yes = 'yes',
    No = 'no'
}

export enum Position {
    Top = 'top',
    Bottom = 'bottom',
    Left = 'left',
    Right = 'right'
}

export enum ILegendPosition {
    Top = 'Top',
    Bottom = 'Bottom',
    Left = 'Left',
    Right = 'Right',
    TopCenter = "TopCenter",
    BottomCenter = 'BottomCenter',
    LeftCenter = 'LeftCenter',
    RightCenter = 'RightCenter'
}

export enum Orientation {
    Vertical = 'vertical',
    Horizontal = 'horizontal'
}

export enum LollipopDistanceType {
    Auto = 'auto',
    Custom = 'custom'
}

export enum DataLabelsFontSizeType {
    Auto = 'auto',
    Custom = 'custom'
}

export enum RankingFilterType {
    TopN = 'topN',
    BottomN = 'bottomN',
    None = 'none'
}

export enum RankingDataValuesType {
    Value1 = 'value1',
    Value2 = 'value2',
}

export enum CircleSize {
    Auto = 'auto',
    Custom = 'custom'
}

export enum PieSize {
    Auto = 'auto',
    Custom = 'custom'
}

export enum DataLabelsPlacement {
    Inside = 'inside',
    Outside = 'outside'
}

export enum DisplayUnits {
    Auto = 'auto',
    None = 'none',
    Thousands = 'thousands',
    Millions = 'millions',
    Billions = 'billions',
    Trillions = 'trillions'
}

export enum DataRolesName {
    Category = 'category',
    SubCategory = 'subCategory',
    Value1 = 'measure1',
    Value2 = 'measure2',
    Tooltips = 'tooltip'
}

export enum LollipopType {
    Circle = 'circle',
    Pie = 'pie',
    Donut = 'donut',
    Rose = 'Rose'
}

export enum FontStyle {
    Italic = 'italic',
    Bold = 'bold',
    None = 'none'
}

export enum EVisualConfig {
    ChartConfig = 'chartConfig',
    CircleConfig = 'circleConfig',
    Circle2Config = 'circle2Config',
    LineConfig = 'lineConfig',
    DataLabelsConfig = 'dataLabelsConfig',
    XGridLinesConfig = 'xGridLinesConfig',
    YGridLinesConfig = 'yGridLinesConfig',
    GridLinesConfig = 'gridLinesConfig',
    PieConfig = 'pieConfig',
    DataColorsConfig = 'dataColorsConfig',
    RankingConfig = 'rankingConfig'
}

export enum EChartConfig {
    ChartSettings = 'chartSettings',
    CircleSettings = 'circleSettings',
    Circle2Settings = 'circle2Settings',
    LineSettings = 'lineSettings',
    DataLabelsSettings = 'dataLabelsSettings',
    XAxisSettings = 'xAxisSettings',
    YAxisSettings = 'yAxisSettings',
    LegendSettings = 'legendSettings',
    NumberSettings = 'numberSettings',
    XGridLinesSettings = 'xGridLinesSettings',
    YGridLinesSettings = 'yGridLinesSettings',
    GridLinesSettings = 'gridLinesSettings',
    DataColorsSettings = 'dataColorsSettings',
    RankingSettings = 'rankingSettings'
}

export enum EChartSettings {
    lollipopType = 'lollipopType',
    isLollipopTypeChanged = 'isLollipopTypeChanged',
    isHasSubCategories = 'isHasSubCategories',
    orientation = 'orientation',
    lollipopDistanceType = 'lollipopDistanceType',
    lollipopDistance = 'lollipopDistance',
    pieSettings = 'pieSettings'
}

export enum ECircleSettings {
    circle1 = "circle1",
    circle2 = "circle2",
    circleType = "circleType",
    show = 'show',
    isCircleFilled = 'isCircleFilled',
    circleSize = 'circleSize',
    maxCircleRadius = 'maxCircleRadius',
    circleRadius = 'circleRadius',
    strokeWidth = 'strokeWidth',
}

export enum ELineSettings {
    show = 'show',
    lineType = 'lineType',
    lineWidth = 'lineWidth',
    lineColor = 'lineColor'
}

export enum EDataLabelsSettings {
    show = 'show',
    color = 'color',
    borderColor = 'borderColor',
    borderWidth = 'borderWidth',
    displayUnits = 'displayUnits',
    valueDecimalPlaces = 'valueDecimalPlaces',
    orientation = 'orientation',
    fontSize = 'fontSize',
    pieDataLabelFontSize = 'pieDataLabelFontSize',
    fontFamily = 'fontFamily',
    showBackground = 'showBackground',
    backgroundColor = 'backgroundColor',
    transparency = 'transparency',
    fontStyle = 'fontStyle',
    placement = 'placement',
    fontSizeType = 'fontSizeType'
}

export enum EGridLinesSettings {
    xGridLines = 'xGridLines',
    yGridLines = 'yGridLines',
    show = 'show',
    lineType = 'lineType',
    lineWidth = 'lineWidth',
    lineColor = 'lineColor'
}

export enum EPieSettings {
    pie1 = 'pie1',
    pie2 = 'pie2',
    pieType = 'pieType',
    pieSize = 'pieSize',
    maxPieRadius = 'maxPieRadius',
    pieRadius = 'pieRadius',
    isShowPieLabel = 'isShowPieLabel',
    isShowLabelLine = 'isShowLabelLine'
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
    selectedCategoryColor = "selectedCategoryColor"
}

export enum ERankingSettings {
    valueType = "valueType",
    filterType = "filterType",
    count = "count",
    showRemainingAsOthers = "showRemainingAsOthers",
    isSubcategoriesRanking = "isSubcategoriesRanking",
    subCategoriesRanking = "subCategoriesRanking",
    pieSliceColor = "pieSliceColor",
    circleFillColor = "circleFillColor",
    circleStrokeColor = "circleStrokeColor",
    lineColor = "lineColor",
    isRankingEnabled = "isRankingEnabled"
}