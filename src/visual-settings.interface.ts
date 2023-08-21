import { CircleSize, CircleType, DataLabelsFontSizeType, DataLabelsPlacement, DisplayUnits, FontStyle, ILegendPosition, LollipopDistanceType, LollipopType, Orientation, PieSize, PieType, Position, RankingDataValuesType, RankingFilterType } from './enum';

export interface IXAxisSettings {
    position: Position;
    isDisplayTitle: boolean;
    titleName: string;
    titleColor: string;
    titleFontSize: number;
    titleFontFamily: string;
    isDisplayLabel: boolean;
    labelColor: string;
    labelFontFamily: string;
    labelFontSize: number;
    labelTilt: number;
    labelCharLimit: number;
    isLabelAutoTilt: boolean;
}

export interface IYAxisSettings {
    position: Position;
    isDisplayTitle: boolean;
    titleName: string;
    titleColor: string;
    titleFontSize: number;
    titleFontFamily: string;
    isDisplayLabel: boolean;
    labelColor: string;
    labelFontFamily: string;
    labelFontSize: number;
    labelCharLimit: number;
}

export interface ICircleSettings {
    circleType: CircleType;
    circle1: ICirclePropsSettings;
    circle2: ICirclePropsSettings;
}

export interface ICirclePropsSettings {
    show: boolean;
    isCircleFilled: string
    circleSize: CircleSize;
    maxCircleRadius: number;
    circleRadius: number;
    strokeWidth: number;
}

export interface IPieSettings {
    pieType: PieType;
    pie1: IPiePropsSettings;
    pie2: IPiePropsSettings;
}

export interface IPiePropsSettings {
    pieSize: PieSize;
    maxPieRadius: number;
    pieRadius: number;
}

export interface ILineSettings {
    show: boolean;
    lineType: string;
    lineWidth: number;
    lineColor: string;
}

export interface IGridLinesPropsSettings {
    show: boolean;
    lineType: string;
    lineWidth: number;
    lineColor: string;
}

export interface IGridLinesSettings {
    xGridLines: IGridLinesPropsSettings;
    yGridLines: IGridLinesPropsSettings
}

export interface IXGridLinesSettings {
    show: boolean;
    lineType: string;
    lineWidth: number;
    lineColor: string;
}

export interface IYGridLinesSettings {
    show: boolean;
    lineType: string;
    lineWidth: number;
    lineColor: string;
}

export interface INumberSettings {
    show: boolean;
    decimalSeparator: string;
    thousandsSeparator: string;
    decimalPlaces: number;
    displayUnits: DisplayUnits;
    prefix: string;
    suffix: string;
    thousands: string;
    million: string;
    billion: string;
    trillion: string;
}

export interface ILegendSettings {
    show: boolean;
    position: ILegendPosition;
    labelColor: string;
    labelFontFamily: string;
    labelFontSize: number;
    isShowTitle: boolean;
    legendTitleText: string;
    legend1TitleText: string;
    legend2TitleText: string;
    titleColor: string;
    titleFontFamily: string;
}

export interface IChartSettings {
    lollipopType: LollipopType;
    isLollipopTypeChanged: boolean;
    isHasSubCategories: boolean;
    orientation: Orientation;
    isLollipopDistanceChange: boolean;
    lollipopDistanceType: LollipopDistanceType;
    lollipopDistance: number;
    pieSettings: IPieSettings;
}

export interface IDataLabelsSettings {
    show: boolean;
    color: string;
    borderColor: string;
    borderWidth: number;
    orientation: Orientation;
    fontSize: number;
    pieDataLabelFontSize: number;
    fontFamily: string;
    showBackground: boolean;
    backgroundColor: string;
    transparency: number;
    fontStyle: string[],
    placement: DataLabelsPlacement,
    fontSizeType: DataLabelsFontSizeType
}

export interface IDataColorsSettings {
    dataType: CircleType | PieType;
    circle1: IDataColorsPropsSettings;
    circle2: IDataColorsPropsSettings;
    pie1: IDataColorsPropsSettings;
    pie2: IDataColorsPropsSettings;
}

export interface IRankingPropsSettings {
    filterType: RankingFilterType;
    count: number;
    showRemainingAsOthers: boolean;
    isSubcategoriesRanking: boolean;
    circleFillColor: string,
    circleStrokeColor: string,
    pieSliceColor: string;
    lineColor: string;
    subCategoriesRanking: {
        filterType: RankingFilterType;
        count: number;
        showRemainingAsOthers: boolean;
        pieSliceColor: string;
    }
}

export interface IRankingSettings {
    isRankingEnabled: boolean,
    valueType: RankingDataValuesType;
    value1: IRankingPropsSettings,
    value2: IRankingPropsSettings,
}

export interface IDataColorsPropsSettings {
    fillmin: string,
    midcolor: boolean,
    fillmid: string,
    fillmax: string,
    fillnull: string,
    fillType: string,
    numberOfClasses: number,
    byCategoryColors: { name: string, color: string }[],
    schemeColors: string[],
    reverse: boolean,
    isGradient: boolean,
    singleColor: string,
    circleFillColor?: string,
    circleStrokeColor?: string,
    defaultColor?: string,
    selectedCategoryName?: string,
    selectedCategoryColor?: string;
}

export interface ILabelValuePair {
    label: string;
    value: string;
    icon?: React.ReactNode;
}