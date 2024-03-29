import { ELineType, ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderAlignment, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesShadowType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, EFontStyle } from "./SmallMultiples.enum";

export interface ISmallMultiplesGridLayoutSettings {
    showInfoPage: boolean;
    infoMessage: string;
    hostContainerId: string,
    categories: string[],
    containerWidth: number,
    containerHeight: number,
    layoutType: ESmallMultiplesLayoutType,
    displayType: ESmallMultiplesDisplayType,
    viewType: ESmallMultiplesViewType,
    rows: number;
    columns: number;
    gridDataItemsTotals: number[];
    xAxisType: ESmallMultiplesAxisType;
    yAxisType: ESmallMultiplesAxisType;
    xAxisPosition: ESmallMultiplesXAxisPosition;
    yAxisPosition: ESmallMultiplesYAxisPosition;
    innerSpacing: number;
    outerSpacing: number;
    showGridLayoutOnly: boolean;
    showXYAxisSettings: boolean;
    header: {
        displayType: ESmallMultiplesHeaderDisplayType,
        fontFamily: string,
        fontSize: number
        fontColor: string,
        fontStyles: EFontStyle[],
        alignment: ESmallMultiplesHeaderAlignment,
        position: ESmallMultiplesHeaderPosition,
        isTextWrapEnabled: boolean
    };
    background: {
        type: ESmallMultiplesBackgroundType,
        panelColor: string;
        alternateColor: string;
        transparency: number;
    };
    border: {
        isShowBorder: boolean;
        style: ELineType;
        width: number;
        radius: number;
        color: string;
    };
    shadow: {
        isEnabled: boolean;
        type: ESmallMultiplesShadowType;
        verticalOffset: number;
        horizontalOffset: number;
        blur: number;
        spread: number;
        color: string;
        inset: boolean;
    },
    onCellRendered: (category: string, gridItemIndex: number, elementRef: HTMLDivElement) => void,
    getUniformXAxisAndBrushNode: (xAxisNode: SVGElement, brushNode: SVGElement) => { xAxisNodeHeight: number, yAxisNodeWidth: number },
    getXYAxisNodeElementAndMeasures: (gridItemWidth: number, gridItemHeight: number) => { xAxisNode: any; yAxisNode: any, xAxisNodeHeight: number; yAxisNodeWidth: number },
    onRenderingFinished: () => void,
}

export interface ILayoutItemProps {
    i: string;
    category: string,
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    isDraggable: boolean;
    isResizable: boolean;
}

export interface ISmallMultiplesLayoutProps {
    className: string;
    rowHeight: number;
    items: number;
    cols: number;
    layouts: ILayoutItemProps[],
    width: number,
    measureBeforeMount: boolean,
    compactType: string,
    margin: number[],
    containerPadding: number[],
    smallMultiplesSettings: ISmallMultiplesGridLayoutSettings,
    onCellRendered: (category: string, gridItemIndex: number, elementRef: HTMLDivElement) => void,
    onRenderingFinished: () => void,
}

export interface ISmallMultiplesGridItemContent {
    svg: SVGElement,
    xAxisG: SVGElement,
    yAxisG: SVGElement,
    lollipopG: SVGElement | null,
    brush: any,
    brushG: SVGElement | null,
    brushScaleBand: any,
    xScale: any,
    yScale: any,
    categoricalData: any,
    categoricalDataPairs: any[],
    chartData: any,
    brushNumber?: number
}

export interface IAxisConfig {
    categoricalData: powerbi.DataViewCategorical,
    width: number,
    height: number,
    xAxisG: SVGElement,
    yAxisG: SVGElement,
    xAxisYPos: number,
    yAxisXPos: number,
}

export interface ILabelValuePair {
    label: string;
    value: string;
}
