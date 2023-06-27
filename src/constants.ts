import { CircleFillOption, CircleSize, CircleType, ColorPaletteType, DataLabelsFontSizeType, DataLabelsPlacement, FontStyle, LineType, LollipopDistanceType, LollipopType, Orientation, PieSize, PieType, Position, RankingDataValuesType, RankingFilterType } from "./enum"
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
    IYGridLinesSettings
} from "./visual-settings.interface"

export const PIE1_SETTINGS: IPiePropsSettings = {
    pieSize: PieSize.Auto,
    maxPieRadius: 40,
    pieRadius: 40,
}

export const PIE2_SETTINGS: IPiePropsSettings = {
    pieSize: PieSize.Auto,
    maxPieRadius: 40,
    pieRadius: 40,
}

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
        pie2: PIE2_SETTINGS
    }
}

export const CIRCLE1_SETTINGS: ICirclePropsSettings = {
    show: true,
    isCircleFilled: CircleFillOption.Yes,
    circleSize: CircleSize.Auto,
    maxCircleRadius: 23,
    circleRadius: 23,
    strokeWidth: 6,
}

export const CIRCLE2_SETTINGS: ICirclePropsSettings = {
    show: true,
    isCircleFilled: CircleFillOption.Yes,
    circleSize: CircleSize.Auto,
    maxCircleRadius: 23,
    circleRadius: 23,
    strokeWidth: 6,
}

export const CIRCLE_SETTINGS: ICircleSettings = {
    circleType: CircleType.Circle1,
    circle1: CIRCLE1_SETTINGS,
    circle2: CIRCLE2_SETTINGS
}

export const LINE_SETTINGS: ILineSettings = {
    show: true,
    lineType: LineType.Solid,
    lineWidth: 8,
    lineColor: 'rgb(91,121,185)'
}

export const DATA_LABELS_SETTINGS: IDataLabelsSettings = {
    show: true,
    color: '#fff',
    borderColor: 'rgb(255, 255, 255)',
    borderWidth: 2,
    orientation: Orientation.Horizontal,
    fontSize: 12,
    pieDataLabelFontSize: 12,
    fontFamily: 'Segoe UI',
    showBackground: true,
    backgroundColor: 'rgb(0,0,0)',
    transparency: 90,
    fontStyle: FontStyle.None,
    placement: DataLabelsPlacement.Inside,
    fontSizeType: DataLabelsFontSizeType.Auto
}

export const X_GRID_LINES_SETTINGS: IXGridLinesSettings = {
    show: false,
    lineType: LineType.Dotted,
    lineWidth: 1,
    lineColor: 'rgb(151,151,151)'
}

export const Y_GRID_LINES_SETTINGS: IYGridLinesSettings = {
    show: false,
    lineType: LineType.Dotted,
    lineWidth: 1,
    lineColor: 'rgb(151,151,151)'
}

export const GRID_LINES_SETTINGS: IGridLinesSettings = {
    xGridLines: X_GRID_LINES_SETTINGS,
    yGridLines: Y_GRID_LINES_SETTINGS
}

export const CIRCLE1_DATA_COLORS: IDataColorsPropsSettings = {
    fillmin: "rgb(92,113,187)",
    midcolor: false,
    fillmid: "rgb(3,194,129)",
    fillmax: "rgb(253,98,94)",
    fillnull: "rgb(242,242,242)",
    fillType: ColorPaletteType.Single,
    numberOfClasses: 5,
    byCategoryColors: [],
    schemeColors: ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"],
    reverse: false,
    isGradient: false,
    singleColor: "rgb(91,121,185)",
    circleFillColor: "rgb(91,121,185)",
    circleStrokeColor: "rgb(91,121,185)"
};

export const CIRCLE2_DATA_COLORS: IDataColorsPropsSettings = {
    fillmin: "rgb(92,113,187)",
    midcolor: false,
    fillmid: "rgb(3,194,129)",
    fillmax: "rgb(253,98,94)",
    fillnull: "rgb(242,242,242)",
    fillType: ColorPaletteType.Single,
    numberOfClasses: 5,
    byCategoryColors: [],
    schemeColors: ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"],
    reverse: false,
    isGradient: false,
    singleColor: "rgb(5,183,155)",
    circleFillColor: "rgb(5,183,155)",
    circleStrokeColor: "rgb(5,183,155)"
};

export const PIE1_DATA_COLORS: IDataColorsPropsSettings = {
    fillmin: "rgb(92,113,187)",
    midcolor: false,
    fillmid: "rgb(3,194,129)",
    fillmax: "rgb(253,98,94)",
    fillnull: "rgb(242,242,242)",
    fillType: ColorPaletteType.Gradient,
    numberOfClasses: 5,
    byCategoryColors: [],
    schemeColors: ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"],
    reverse: false,
    isGradient: false,
    singleColor: "rgb(92,113,187)",
    defaultColor: "rgb(92,113,187)",
    selectedCategoryName: null,
    selectedCategoryColor: "rgb(5, 183, 155)"
};

export const PIE2_DATA_COLORS: IDataColorsPropsSettings = {
    fillmin: "rgb(92,113,187)",
    midcolor: false,
    fillmid: "rgb(3,194,129)",
    fillmax: "rgb(253,98,94)",
    fillnull: "rgb(242,242,242)",
    fillType: ColorPaletteType.Gradient,
    numberOfClasses: 5,
    byCategoryColors: [],
    schemeColors: ["rgb(241,238,246)", "rgb(189,201,225)", "rgb(116,169,207)", "rgb(43,140,190)", "rgb(4,90,141)"],
    reverse: false,
    isGradient: false,
    singleColor: "rgb(92,113,187)",
    defaultColor: "rgb(92,113,187)",
    selectedCategoryName: null,
    selectedCategoryColor: "rgb(5, 183, 155)"
};

export const DATA_COLORS: IDataColorsSettings = {
    dataType: CircleType.Circle1,
    circle1: CIRCLE1_DATA_COLORS,
    circle2: CIRCLE2_DATA_COLORS,
    pie1: PIE1_DATA_COLORS,
    pie2: PIE2_DATA_COLORS
};

export const VALUE1_RANKING_SETTINGS: IRankingPropsSettings = {
    filterType: RankingFilterType.TopN,
    count: 5,
    showRemainingAsOthers: false,
    isSubcategoriesRanking: false,
    circleFillColor: 'rgb(84, 84, 84)',
    circleStrokeColor: 'rgb(84, 84, 84)',
    pieSliceColor: 'rgb(84, 84, 84)',
    lineColor: 'rgb(84, 84, 84)',
    subCategoriesRanking: {
        filterType: RankingFilterType.TopN,
        count: 10,
        showRemainingAsOthers: false,
        pieSliceColor: 'rgb(84, 84, 84)'
    }
};

export const VALUE2_RANKING_SETTINGS: IRankingPropsSettings = {
    filterType: RankingFilterType.TopN,
    count: 5,
    showRemainingAsOthers: false,
    isSubcategoriesRanking: false,
    circleFillColor: 'rgb(84, 84, 84)',
    circleStrokeColor: 'rgb(84, 84, 84)',
    pieSliceColor: 'rgb(84, 84, 84)',
    lineColor: 'rgb(84, 84, 84)',
    subCategoriesRanking: {
        filterType: RankingFilterType.TopN,
        count: 10,
        showRemainingAsOthers: false,
        pieSliceColor: 'rgb(84, 84, 84)'
    }
};

export const RANKING_SETTINGS: IRankingSettings = {
    isRankingEnabled: false,
    valueType: RankingDataValuesType.Value1,
    value1: VALUE1_RANKING_SETTINGS,
    value2: VALUE2_RANKING_SETTINGS,
}

export const X_AXIS_SETTINGS: IXAxisSettings = {
    position: Position.Bottom,
    isDisplayTitle: false,
    titleName: '',
    titleColor: null,
    titleFontSize: 12,
    titleFontFamily: 'Segoe UI',
    isDisplayLabel: true,
    labelColor: null,
    labelFontFamily: 'Segoe UI',
    labelFontSize: 12,
    isLabelAutoTilt: true,
    labelTilt: 30,
    labelCharLimit: 10
}

export const Y_AXIS_SETTINGS: IYAxisSettings = {
    position: Position.Left,
    isDisplayTitle: false,
    titleName: '',
    titleColor: null,
    titleFontSize: 12,
    titleFontFamily: 'Segoe UI',
    isDisplayLabel: true,
    labelColor: null,
    labelFontFamily: 'Segoe UI',
    labelFontSize: 12,
    labelCharLimit: 10
}