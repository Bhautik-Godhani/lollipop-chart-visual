import { ICategoryValuePair } from "../visual-settings.interface";
import { ELineType, ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderAlignment, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, EFontStyle, ESmallMultiplesShadowOffset, ESmallMultiplesShadowPosition } from "./SmallMultiples.enum";
type D3Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;
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
    itemsPerPage: number;
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
        color: string;
        offset: ESmallMultiplesShadowOffset;
        position: ESmallMultiplesShadowPosition;
        size: number;
        blur: number;
        distance: number;
        angle: number;
    },
    onCellRendered: (category: string, gridItemIndex: number, rowIndex: number, colIndex: number, elementRef: HTMLDivElement) => void,
    getUniformXAxisAndBrushNode: (colIndex: number, xAxisNode: SVGElement, brushNode: SVGElement, width: number, height: number, isBottomAxis: boolean) =>
        { xAxisNodeHeight: number, yAxisNodeWidth: number, isHorizontalBrushDisplayed: boolean },
    getUniformYAxisAndBrushNode: (colIndex: number, yAxisNode: SVGElement, brushNode: SVGElement, width: number, height: number, isLeftAxis: boolean) =>
        { xAxisNodeHeight: number, yAxisNodeWidth: number, isVerticalBrushDisplayed: boolean },
    getXAxisNodeElementAndMeasures: (gridItemWidth: number, gridItemHeight: number, isBottomXAxis: boolean, isDrawAxis: boolean) =>
        { xAxisNode: any; xAxisNodeHeight: number; brushNode: any; brushNodeHeight: number; xAxisTitleG: any; xAxisTitleHeight: number; },
    getYAxisNodeElementAndMeasures: (gridItemWidth: number, gridItemHeight: number, isLeftYAxis: boolean, isDrawAxis: boolean) =>
        { yAxisNode: any, yAxisNodeWidth: number; brushNode: any; brushNodeWidth: number; yAxisTitleG: any; yAxisTitleWidth: number; },
    getBottomLeftMargin: () =>
        { bottomMargin: number, leftMargin: number },
    onRenderingFinished: () => void,
    onScrollPage?: () => void,
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
    onCellRendered: (category: string, gridItemIndex: number, rowIndex: number, colIndex: number, elementRef: HTMLDivElement) => void,
    onRenderingFinished: () => void,
}

export interface ISmallMultiplesGridItemContent {
    category: string,
    width: number,
    height: number,
    svg: SVGElement,
    xAxisG: SVGElement,
    yAxisG: SVGElement,
    lollipopG: D3Selection<SVGElement>,
    brush: any,
    brushG: SVGElement | null,
    brushScaleBand: any,
    xScale: any,
    yScale: any,
    categoricalData: any,
    categoricalDataPairs: any[],
    firstCategoryValueDataPair: ICategoryValuePair;
    lastCategoryValueDataPair: ICategoryValuePair;
    chartData: any,
    brushNumber?: number,
    dataLabels1G: D3Selection<SVGElement>;
    dataLabels2G: D3Selection<SVGElement>;
    referenceLineLayersG: D3Selection<SVGElement>;
    referenceLinesContainerG: D3Selection<SVGElement>;
    xGridLinesG: D3Selection<SVGElement>;
    yGridLinesG: D3Selection<SVGElement>;
    dynamicDeviationG: D3Selection<SVGElement>;
    zeroSeparatorLine: D3Selection<SVGElement>;
    connectingLineG: D3Selection<SVGElement>;
    errorBarsContainer: D3Selection<SVGElement>;
    errorBarsMarkerDefsG: D3Selection<SVGElement>;
    errorBarsAreaG: D3Selection<SVGElement>;
    errorBarsAreaPath: D3Selection<SVGElement>;
    errorBarsLinesDashG: D3Selection<SVGElement>;
    errorBarsLinesG: D3Selection<SVGElement>;
    errorBarsMarkersG: D3Selection<SVGElement>;
    errorBarsMarkerDef: D3Selection<SVGElement>;
    errorBarsMarker: D3Selection<SVGElement>;
    errorBarsMarkerPath: D3Selection<SVGElement>;
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
    tooltip?: string;
}
