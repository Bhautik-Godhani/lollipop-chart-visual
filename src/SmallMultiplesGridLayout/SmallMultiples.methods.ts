import React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import { ILayoutItemProps, ISmallMultiplesGridLayoutSettings, ISmallMultiplesLayoutProps } from "./SmallMultiples.interface";
import { EFontStyle, ESmallMultiplesAxisType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, Orientation } from "./SmallMultiples.enum";
import SmallMultiplesLayout from "./smallMultiplesLayout";
import { generateSecureRandomBytes } from "../methods/methods";


export const getSVGTextSize = (text: string,
    fontFamily: string,
    fontSize: number,
    fontStyle: EFontStyle[] = []
): { width: number, height: number } => {
    const svg = d3.select('body').append('svg');
    const textElement = svg.append('text')
        .text(text)
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .style("text-decoration", fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
        .style("font-weight", fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
        .style("font-style", fontStyle.includes(EFontStyle.Italic) ? "italic" : "");
    const bBox = textElement.node().getBBox();
    svg.remove();
    return { width: bBox.width, height: bBox.height };
}

type D3Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export const DrawSmallMultiplesGridLayout = (config: ISmallMultiplesGridLayoutSettings): void => {
    const { rows, columns } = GetGridLayoutRowsColumnsCount(config);

    const SMPaginationPanelHeight: number = config.viewType === ESmallMultiplesViewType.Pagination ? 35 : 0;
    const totalRows = Math.ceil(config.categories.length / columns);
    const itemWidth = (config.containerWidth - config.outerSpacing * columns - config.outerSpacing) / columns;
    let itemHeight = (config.containerHeight - SMPaginationPanelHeight) / rows - config.outerSpacing;
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformXScaleAll = isUniformXScale && config.xAxisPosition === ESmallMultiplesXAxisPosition.All;

    const headerSettings = config.header;
    const panelTitleSize = getSVGTextSize("Test",
        headerSettings.fontFamily,
        headerSettings.fontSize,
        headerSettings.fontStyles);

    const { bottomXAxisNode, topXAxisNode, xAxisTitleGNode, yAxisGNode, yAxisTitleGNode, xAxisGNodeHeight, yAxisGNodeWidth, yAxisTitleWidth } = GetRootXYAxisGNode(
        config,
        itemWidth - config.innerSpacing * 2,
        itemHeight - panelTitleSize.height - config.innerSpacing * 2,
    );

    const { hyperListMainContainer, SMPaginationPanel, uniformAxisContainer } = CreateSmallMultiplesContainer(config);

    const { uniformBottomXAxis, uniformTopXAxis, uniformLeftYAxis, uniformRightYAxis } = CreateSmallMultiplesUniformAxis(
        config,
        xAxisGNodeHeight,
        yAxisGNodeWidth,
        uniformAxisContainer,
        hyperListMainContainer
    );

    if (isUniformXScale) {
        itemHeight = (config.containerHeight - xAxisGNodeHeight - SMPaginationPanelHeight) / rows - config.outerSpacing;
    }

    hyperListMainContainer.style("height", function () {
        const height = d3.select(this).node().getBoundingClientRect().height;
        return (height - (isUniformXScale ? (isUniformXScaleAll ? xAxisGNodeHeight * 2 : xAxisGNodeHeight) : 0)) + "px";
    });

    if (config.viewType === ESmallMultiplesViewType.Pagination) {
        CreateSmallMultiplesPaginationPanel(config, rows, columns, SMPaginationPanel, hyperListMainContainer, totalRows, itemHeight);
    } else {
        SMPaginationPanel.selectAll("*").remove();
    }

    const layout = GetReactGridLayout(config, columns, config.viewType === ESmallMultiplesViewType.Pagination ? rows : totalRows);
    const layoutProps = GetSmallMultiplesLayoutProps(config, layout, itemHeight - config.outerSpacing / 2, columns);

    ReactDOM.render(React.createElement(SmallMultiplesLayout, layoutProps), hyperListMainContainer.node());

    if (isUniformXScale) {
        setTimeout(() => {
            const { xAxisNodeHeight, yAxisNodeWidth } = config.getUniformXAxisAndBrushNode(undefined, undefined);
            switch (config.xAxisPosition) {
                case ESmallMultiplesXAxisPosition.FrozenBottomColumn:
                    RenderSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, yAxisNodeWidth + config.innerSpacing, columns, (itemWidth - config.outerSpacing), itemHeight, hyperListMainContainer, bottomXAxisNode, xAxisTitleGNode, uniformBottomXAxis, isUniformXScale);
                    break;
                case ESmallMultiplesXAxisPosition.FrozenTopColumn:
                    RenderSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, yAxisNodeWidth + config.innerSpacing, columns, (itemWidth - config.outerSpacing), itemHeight, hyperListMainContainer, topXAxisNode, xAxisTitleGNode, uniformTopXAxis, isUniformXScale);
                    break;
                case ESmallMultiplesXAxisPosition.All:
                    RenderSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, yAxisNodeWidth + config.innerSpacing, columns, (itemWidth - config.outerSpacing), itemHeight, hyperListMainContainer, bottomXAxisNode, xAxisTitleGNode, uniformBottomXAxis, isUniformXScale);
                    RenderSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, yAxisNodeWidth + config.innerSpacing, columns, (itemWidth - config.outerSpacing), itemHeight, hyperListMainContainer, topXAxisNode, xAxisTitleGNode, uniformTopXAxis, isUniformXScale);
                    break;
            }
        }, 100);
    }

    RenderSmallMultiplesUniformYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, totalRows, itemHeight, hyperListMainContainer, yAxisGNode, yAxisTitleGNode, yAxisTitleWidth, uniformLeftYAxis, uniformRightYAxis, isUniformYScale);
};

export const CreateSmallMultiplesContainer = (config: ISmallMultiplesGridLayoutSettings): { hyperListMainContainer: D3Selection<any>, SMPaginationPanel: D3Selection<HTMLDivElement>, uniformAxisContainer: D3Selection<any> } => {
    const hostContainer = d3.select(`#${config.hostContainerId}`);
    hostContainer.select("#smallMultiplesContainerSVG").remove();
    hostContainer.select("#smallMultiplesContainerFO").remove();
    hostContainer.select("#hyperListMainContainer").remove();
    hostContainer.select("#smallMultiplesPaginationPanel").remove();

    const SMPaginationPanelHeight: number = config.viewType === ESmallMultiplesViewType.Pagination ? 35 : 0;

    const width = config.containerWidth;
    const height = (config.containerHeight - SMPaginationPanelHeight);

    const smallMultiplesContainerSVG = hostContainer.append("svg")
        .attr("id", "smallMultiplesContainerSVG")
        .style("width", width + "px")
        .style("height", height + "px");

    const smallMultiplesContainerFO = smallMultiplesContainerSVG.append("foreignObject")
        .attr("id", "smallMultiplesContainerFO");

    const hyperListMainContainer = smallMultiplesContainerFO.append("xhtml:div")
        .attr("id", "hyperListMainContainer")
        .style("transform", "translate(" + 0 + "px" + "," + 0 + "px" + ")");

    const uniformAxisContainer = smallMultiplesContainerFO.append("xhtml:div")
        .attr("id", "uniformAxisContainer");

    const SMPaginationPanel = hostContainer.append("div")
        .attr("id", "smallMultiplesPaginationPanel")
        .style("width", "100%")
        .style("height", SMPaginationPanelHeight + "px");

    if (config.viewType === ESmallMultiplesViewType.Pagination) {
        SMPaginationPanel.style("display", "flex");
    } else {
        SMPaginationPanel.style("display", "none");
    }

    return { hyperListMainContainer, SMPaginationPanel, uniformAxisContainer };
}

export const GetGridLayoutRowsColumnsCount = (
    config: ISmallMultiplesGridLayoutSettings
): {
    rows: number;
    columns: number;
} => {
    const minRows = 1;
    const minColumns = 1;
    const maxRows = 6;
    const maxColumns = 6;

    //  FLUID LAYOUT
    const minItemWidth = 150;
    const minItemHeight = 150;
    const fluidColumnsCount = Math.floor(config.containerWidth / config.categories.length) > minItemWidth ? config.categories.length : Math.floor(config.containerWidth / minItemWidth);
    const fluidRowsCount = Math.floor(config.containerHeight / Math.ceil(config.categories.length / fluidColumnsCount)) > minItemHeight ? Math.ceil(config.categories.length / fluidColumnsCount) : Math.floor(config.containerHeight / minItemHeight);

    let { rows: rowsCount, columns: columnsCount } = config;

    if (config.displayType === ESmallMultiplesDisplayType.Fluid) {
        rowsCount = fluidRowsCount;
        columnsCount = fluidColumnsCount;
    }

    const rows = rowsCount >= minRows && rowsCount <= maxRows ? rowsCount : rowsCount <= minRows ? minRows : maxRows;
    const columns = columnsCount >= minColumns && columnsCount <= maxColumns ? columnsCount : columnsCount <= minColumns ? minColumns : maxColumns;

    return { rows, columns };
};

const setButtonDisabledProps = (SMPaginationPanel: D3Selection<HTMLDivElement>, SMCurrentPage: number, SMTotalPages: number) => {
    (SMPaginationPanel.select(".goToPreviousPageButton").node() as HTMLDivElement).removeAttribute("disabled");
    (SMPaginationPanel.select(".goToFirstPageButton").node() as HTMLDivElement).removeAttribute("disabled");
    (SMPaginationPanel.select(".goToNextPageButton").node() as HTMLDivElement).removeAttribute("disabled");
    (SMPaginationPanel.select(".goToLastPageButton").node() as HTMLDivElement).removeAttribute("disabled");

    if (SMCurrentPage === 1) {
        (SMPaginationPanel.select(".goToPreviousPageButton").node() as HTMLDivElement).setAttribute("disabled", "true");
        (SMPaginationPanel.select(".goToFirstPageButton").node() as HTMLDivElement).setAttribute("disabled", "true");
    }

    if (SMCurrentPage === SMTotalPages) {
        (SMPaginationPanel.select(".goToNextPageButton").node() as HTMLDivElement).setAttribute("disabled", "true");
        (SMPaginationPanel.select(".goToLastPageButton").node() as HTMLDivElement).setAttribute("disabled", "true");
    }
};

export const CreateSmallMultiplesPaginationPanel = (
    config: ISmallMultiplesGridLayoutSettings,
    rows: number,
    columns: number,
    SMPaginationPanel: D3Selection<HTMLDivElement>,
    hyperListMainContainer: D3Selection<HTMLDivElement>,
    totalRows: number,
    itemHeight: number
): void => {
    const SMTotalItems = config.categories.length;
    let SMCurrentPage = 1;
    const SMItemsPerPage = rows * columns;
    const SMTotalPages = Math.ceil(SMTotalItems / SMItemsPerPage);
    let SMFirstItemIndexOnCurrentPage = (SMCurrentPage - 1) * SMItemsPerPage + 1;

    SMPaginationPanel.selectAll("*").remove();

    const paginationPanelContent = SMPaginationPanel.append("div")
        .attr("class", "pagination-panel-content");

    paginationPanelContent.append("span")
        .attr("class", "pagination-items-count")
        .text(`${SMFirstItemIndexOnCurrentPage} to ${SMFirstItemIndexOnCurrentPage + SMItemsPerPage - 1} 
            of
            ${SMTotalItems}`);

    paginationPanelContent.append("button")
        .attr("class", "pagination-button goToFirstPageButton")
        .text("<<");

    paginationPanelContent.append("button")
        .attr("class", "pagination-button goToPreviousPageButton")
        .text("<");

    paginationPanelContent.append("span")
        .attr("class", "pagination-page-count")
        .text(`Page ${SMCurrentPage} of ${SMTotalPages}`);

    paginationPanelContent.append("button")
        .attr("class", "pagination-button goToNextPageButton")
        .text(">");

    paginationPanelContent.append("button")
        .attr("class", "pagination-button goToLastPageButton")
        .text(">>");

    setButtonDisabledProps(SMPaginationPanel, SMCurrentPage, SMTotalPages);

    const onPageChange = (): void => {
        SMFirstItemIndexOnCurrentPage = (SMCurrentPage - 1) * SMItemsPerPage + 1;

        const SMLastItemIndexOnCurrentPage = SMFirstItemIndexOnCurrentPage + SMItemsPerPage - 1 < SMTotalItems
            ? SMFirstItemIndexOnCurrentPage + SMItemsPerPage - 1
            : SMTotalItems;

        SMPaginationPanel.select(".pagination-items-count").text(`${SMFirstItemIndexOnCurrentPage} to ${SMLastItemIndexOnCurrentPage} of ${SMTotalItems}`);
        SMPaginationPanel.select(".pagination-page-count").text(`Page ${SMCurrentPage} of ${SMTotalPages}`);
        setButtonDisabledProps(SMPaginationPanel, SMCurrentPage, SMTotalPages);

        const layout = GetReactPaginationLayout(config, columns, config.viewType === ESmallMultiplesViewType.Pagination ? rows : totalRows, SMFirstItemIndexOnCurrentPage);
        const layoutProps = GetSmallMultiplesLayoutProps(config, layout, itemHeight - config.outerSpacing / 2, columns);

        ReactDOM.render(React.createElement(SmallMultiplesLayout, layoutProps), hyperListMainContainer.node());
    };

    onPageChange();

    // GO TO PREVIOUS PAGE
    SMPaginationPanel.select(".goToPreviousPageButton").on("click", () => {
        if (SMCurrentPage > 1) {
            SMCurrentPage--;
            onPageChange();
        }
    });

    // GO TO NEXT PAGE
    SMPaginationPanel.select(".goToNextPageButton").on("click", () => {
        if (SMCurrentPage < SMTotalPages) {
            SMCurrentPage++;
            onPageChange();
        }
    });

    // GO TO FIRST PAGE
    SMPaginationPanel.select(".goToFirstPageButton").on("click", () => {
        SMCurrentPage = 1;
        onPageChange();
    });

    // GO TO LAST PAGE
    SMPaginationPanel.select(".goToLastPageButton").on("click", () => {
        SMCurrentPage = SMTotalPages;
        onPageChange();
    });
};

export const GetSmallMultiplesLayoutProps = (
    config: ISmallMultiplesGridLayoutSettings,
    layout: ILayoutItemProps[],
    itemHeight: number,
    columns: number,
): ISmallMultiplesLayoutProps => {
    const layoutClassName = "small-multiples-layout";
    const layoutWidth = config.containerWidth;
    const layoutRowHeight = itemHeight;
    const dynamicRow = config.categories.length / columns;

    const measureBeforeMount = false;
    const orientation = Orientation.Vertical;

    let height = 0;
    if (config.layoutType === ESmallMultiplesLayoutType.Grid) {
        height = layoutRowHeight;
    } else if (config.layoutType === ESmallMultiplesLayoutType.RankedPanels) {
        height = layoutRowHeight / 6;
    } else if (config.layoutType === ESmallMultiplesLayoutType.ScaledRows) {
        height = layoutRowHeight / 6 < 50 ? 50 : layoutRowHeight / 6;
    }

    const layoutProps: ISmallMultiplesLayoutProps = {
        className: layoutClassName,
        rowHeight: height - 5,
        items: config.categories.length,
        cols: columns,
        layouts: layout,
        width: layoutWidth,
        measureBeforeMount: measureBeforeMount,
        compactType: orientation,
        margin: [config.outerSpacing, config.outerSpacing],
        containerPadding: [config.innerSpacing, config.innerSpacing],
        smallMultiplesSettings: config,
        onCellRendered: (category, index, elementRef) => config.onCellRendered(category, index, elementRef),
        onRenderingFinished: () => config.onRenderingFinished()
    };

    return layoutProps;
};

export const GetReactGridLayout = (config: ISmallMultiplesGridLayoutSettings, columns: number, totalRows: number): ILayoutItemProps[] => {
    let iterator = 0;
    const layout: ILayoutItemProps[] = [];

    // RANKED PANELS
    const minCellHeight = 3;
    const maxCellHeight = 6;
    const cellTotals = config.gridDataItemsTotals;
    const rankedPanelsMin = d3.min(config.gridDataItemsTotals, (d) => d);
    const rankedPanelsMax = d3.max(config.gridDataItemsTotals, (d) => d);
    const rankedCellScale = d3.scaleLinear().domain([rankedPanelsMin, rankedPanelsMax]).range([minCellHeight, maxCellHeight]);
    const cellsHeightByScale = cellTotals.map((d) => rankedCellScale(d));
    const clonedCellsHeightByScale = JSON.parse(JSON.stringify(cellsHeightByScale));
    const cellsHeightByRows: number[] = [];
    while (clonedCellsHeightByScale.length) cellsHeightByRows.push(clonedCellsHeightByScale.splice(0, columns));

    // SCALED ROWS
    const getRankedScale = (value: number, min: number, max: number, minHeight: number, maxHeight: number) => {
        let rankedScale: any;
        if (max > 0) {
            if (value > 0) {
                const positiveRankedScale = d3.scaleLinear().domain([max, min]).range([maxHeight, minHeight]);
                rankedScale = positiveRankedScale;
            } else {
                const negativeRankedScale = d3.scaleLinear().domain([min, max]).range([maxHeight, minHeight]);
                rankedScale = negativeRankedScale;
            }
        } else {
            rankedScale = d3.scaleLinear().domain([0, 0]).range([0, 0]);
        }
        return rankedScale(value);
    };

    const minScaledRowHeight = 4;
    const maxScaledRowHeight = 6;
    const totalValuesByRow: number[] = [];
    for (let i = 0; i < Math.ceil(config.categories.length / columns); i++) {
        let total = 0;
        for (let j = i * columns; j < i * columns + columns; j++) {
            total += (config.gridDataItemsTotals[j] ? config.gridDataItemsTotals[j] : 0);
        }
        totalValuesByRow.push(total);
    }

    const scaledRowsMin = d3.min(totalValuesByRow, d => +d);
    const scaledRowsMax = d3.max(totalValuesByRow, d => +d);

    if (config.layoutType === ESmallMultiplesLayoutType.Grid) {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < columns; j++) {
                const randomBytes = generateSecureRandomBytes(16).toString("hex");
                const category = config.categories[iterator];
                const obj = { i: category ? randomBytes : undefined, category, x: j, y: i, w: 1, h: 1, isDraggable: false, isResizable: true };
                layout.push(obj);
                iterator++;
            }
        }
    } else if (config.layoutType === ESmallMultiplesLayoutType.ScaledRows) {
        for (let i = 0; i < totalRows; i++) {
            const height = getRankedScale(totalValuesByRow[i], scaledRowsMin, scaledRowsMax, minScaledRowHeight, maxScaledRowHeight); // scaled rows
            for (let j = 0; j < columns; j++) {
                const randomBytes = generateSecureRandomBytes(16).toString("hex");
                const category = config.categories[iterator];
                const obj = { i: category ? randomBytes : undefined, category, x: j, y: i, w: 1, h: height, isDraggable: false, isResizable: false };
                layout.push(obj);
                iterator++;
            }
        }
    } else if (config.layoutType === ESmallMultiplesLayoutType.RankedPanels) {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < columns; j++) {
                const randomBytes = generateSecureRandomBytes(16).toString("hex");
                const category = config.categories[iterator];
                const obj = {
                    i: category ? randomBytes : undefined,
                    category,
                    x: j,
                    y: i,
                    w: 1,
                    h: cellsHeightByScale[iterator],
                    isDraggable: false,
                    isResizable: false,
                };
                layout.push(obj);
                iterator++;
            }
        }
    }

    return layout;
};

export const GetReactPaginationLayout = (config: ISmallMultiplesGridLayoutSettings, columns: number, totalRows: number, firstItem: number): ILayoutItemProps[] => {
    let iterator = firstItem - 1;
    const layout: ILayoutItemProps[] = [];

    if (config.layoutType === ESmallMultiplesLayoutType.Grid) {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < columns; j++) {
                const randomBytes = generateSecureRandomBytes(16).toString("hex");
                const category = config.categories[iterator];
                const obj = { i: category ? randomBytes : undefined, category, x: j, y: i, w: 1, h: 1, isDraggable: true, isResizable: true };
                layout.push(obj);
                iterator++;
            }
        }
    }

    return layout;
};

export const RenderSmallMultiplesUniformYAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    totalRows: number,
    itemHeight: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    yAxisGNode: D3Selection<SVGElement>,
    yAxisTitleGNode: D3Selection<SVGElement>,
    yAxisTitleWidth: number,
    uniformLeftYAxis: D3Selection<HTMLElement>,
    uniformRightYAxis: D3Selection<HTMLElement>,
    isUniformYScale: boolean
): void => {
    const isFrozenLeftYColumn = config.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenLeftColumn;

    if (isUniformYScale) {
        if (uniformLeftYAxis) {
            uniformLeftYAxis.selectAll(".y-axis-col-svg").remove();
        }
        if (uniformRightYAxis) {
            uniformRightYAxis.selectAll(".y-axis-col-svg").remove();
        }

        if (config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn) {
            if (uniformLeftYAxis) {
                uniformLeftYAxis.style("margin-top", xAxisGNodeHeight + "px");
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.style("margin-top", xAxisGNodeHeight + "px");
            }
        }

        const smallMultiplesLayoutScrollbarWidth = 10;

        hyperListMainContainer.on("scroll", () => {
            if (uniformLeftYAxis) {
                uniformLeftYAxis.style("transform", `translate(${0}, ${-hyperListMainContainer.node().scrollTop}px)`);
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.style("transform", `translate(${config.containerWidth - yAxisGNodeWidth}px, ${-hyperListMainContainer.node().scrollTop}px)`);
            }
        });

        // APPEND CLONED Y AXIS COPY
        for (let i = 0; i < totalRows; i++) {
            const svg = d3.create("svg");
            svg.classed("y-axis-col-svg", true);
            svg.style("width", yAxisGNodeWidth + "px");

            const height = (itemHeight - config.outerSpacing / 2)
            svg.style("height", height + "px");
            svg.attr("transform", `translate(${0}, ${i * height + ((i + 1) * config.outerSpacing)})`);

            const g = d3.create("svg:g");

            if (config.header.position === ESmallMultiplesHeaderPosition.Top) {
                g.attr("transform", `translate(${yAxisGNodeWidth - (isFrozenLeftYColumn ? 0 : yAxisTitleWidth)}, ${config.header.position === ESmallMultiplesHeaderPosition.Top ? 10 : 0})`);
            } else {
                g.attr("transform", `translate(${yAxisGNodeWidth - (isFrozenLeftYColumn ? 0 : yAxisTitleWidth)}, ${0})`);
            }

            yAxisGNode.style("display", "block");

            if (isUniformYScale && !isFrozenLeftYColumn) {
                yAxisTitleGNode.attr("transform", `translate(${yAxisGNodeWidth}, ${itemHeight / 2})`);
                svg.node().appendChild(yAxisTitleGNode.node());
            }

            svg.node().appendChild(g.node());

            if (isUniformYScale && isFrozenLeftYColumn) {
                yAxisTitleGNode.attr("transform", `translate(${0}, ${itemHeight / 2})`);
                yAxisTitleGNode.select(".yAxisTitle").attr("dy", "1em");

                svg.node().appendChild(yAxisTitleGNode.node());
            }

            g.node().appendChild(yAxisGNode.node().cloneNode(true));

            if (uniformLeftYAxis) {
                uniformLeftYAxis.node().appendChild(svg.node().cloneNode(true));
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.node().appendChild(svg.node().cloneNode(true));
            }
        }
    }
};

export const GetSmallMultiplesUniformLeftYAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = d3.create("div");

    uniformYAxis.attr("id", "uniformLeftYAxis");
    uniformYAxis.classed("uniformLeftYAxis", true);
    uniformYAxis.style("width", yAxisGNodeWidth + "px");
    uniformYAxis.style("height", config.containerHeight + "px");
    uniformYAxis.style("transform", "translate(" + 0 + "px" + "," + 0 + "px" + ")");

    smallMultiplesWrapper.style("width", config.containerWidth - yAxisGNodeWidth + "px");
    smallMultiplesWrapper.style("transform", "translate(" + yAxisGNodeWidth + "px" + "," + (isUniformXScale && isUniformTopXAxis ? xAxisGNodeHeight : 0) + "px" + ")");

    return uniformYAxis;
}

export const GetSmallMultiplesUniformRightYAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = d3.create("div");

    uniformYAxis.attr("id", "uniformRightYAxis");
    uniformYAxis.classed("uniformRightYAxis", true);
    uniformYAxis.style("width", yAxisGNodeWidth + "px");
    uniformYAxis.style("height", config.containerHeight + "px");
    uniformYAxis.style("transform", "translate(" + (config.containerWidth - yAxisGNodeWidth) + "px" + "," + 0 + "px" + ")");

    smallMultiplesWrapper.style("width", config.containerWidth - yAxisGNodeWidth + "px");
    smallMultiplesWrapper.style("transform", "translate(" + 0 + "px" + "," + (isUniformXScale && isUniformTopXAxis ? xAxisGNodeHeight : 0) + "px" + ")");

    return uniformYAxis;
}

export const GetRootXYAxisGNode = (config: ISmallMultiplesGridLayoutSettings, itemWidth: number, itemHeight: number): { bottomXAxisNode: D3Selection<SVGElement>, topXAxisNode: D3Selection<SVGElement>, xAxisTitleGNode: D3Selection<SVGElement>, yAxisGNode: D3Selection<SVGElement>, yAxisTitleGNode: D3Selection<SVGElement>, xAxisGNodeHeight: number, yAxisGNodeWidth: number, yAxisTitleWidth: number } => {
    const { xAxisNode: bottomXAxisNode, xAxisNodeHeight, xAxisTitleG, xAxisTitleHeight } = config.getXAxisNodeElementAndMeasures(itemWidth, itemHeight, true);
    const { xAxisNode: topXAxisNode } = config.getXAxisNodeElementAndMeasures(itemWidth, itemHeight, false);
    const { yAxisNode, yAxisNodeWidth, yAxisTitleG, yAxisTitleWidth } = config.getYAxisNodeElementAndMeasures(itemWidth, itemHeight);

    const bottomXAxisGNode = d3.select(bottomXAxisNode.cloneNode(true));
    const topXAxisGNode = d3.select(topXAxisNode.cloneNode(true));

    const yAxisGNode = d3.select(yAxisNode.cloneNode(true));
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const xAxisTitleGNode = d3.select(xAxisTitleG.cloneNode(true));
    const yAxisTitleGNode = d3.select(yAxisTitleG.cloneNode(true));

    if (!isUniformXScale) {
        bottomXAxisGNode.selectAll("text").attr("y", 0);
        bottomXAxisGNode.selectAll("tspan").attr("y", 0);

        topXAxisGNode.selectAll("text").attr("y", 0);
        topXAxisGNode.selectAll("tspan").attr("y", 0);
    } else {
        xAxisTitleGNode.attr("transform", `translate(${0}, ${0})`);
    }

    return {
        bottomXAxisNode: bottomXAxisGNode,
        topXAxisNode: topXAxisGNode,
        xAxisTitleGNode: xAxisTitleGNode,
        yAxisGNode,
        xAxisGNodeHeight: xAxisNodeHeight + 12 + (isUniformXScale ? xAxisTitleHeight : 0),
        yAxisGNodeWidth: yAxisNodeWidth + (isUniformYScale ? (yAxisTitleWidth + 5) : 0),
        yAxisTitleGNode: yAxisTitleGNode,
        yAxisTitleWidth: yAxisTitleWidth
    };
};

export const CreateSmallMultiplesUniformAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    container: D3Selection<HTMLElement>,
    smallMultiplesWrapper: D3Selection<HTMLElement>,
): { uniformBottomXAxis: D3Selection<HTMLElement>; uniformTopXAxis: D3Selection<HTMLElement>; uniformLeftYAxis: D3Selection<HTMLElement>; uniformRightYAxis: D3Selection<HTMLElement> } => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    container.select(".uniformBottomXAxis").remove();
    container.select(".uniformTopXAxis").remove();
    container.select(".uniformLeftYAxis").remove();
    container.select(".uniformRightYAxis").remove();

    let bottomXAxis!: D3Selection<HTMLElement>;
    let topXAxis!: D3Selection<HTMLElement>;

    let leftYAxis!: D3Selection<HTMLElement>;
    let rightYAxis!: D3Selection<HTMLElement>;

    if (isUniformXScale) {
        switch (config.xAxisPosition) {
            case ESmallMultiplesXAxisPosition.FrozenBottomColumn:
                bottomXAxis = GetSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, yAxisGNodeWidth);
                container.node().appendChild(bottomXAxis.node());
                break;
            case ESmallMultiplesXAxisPosition.FrozenTopColumn:
                topXAxis = GetSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(topXAxis.node());
                break;
            case ESmallMultiplesXAxisPosition.All:
                bottomXAxis = GetSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, yAxisGNodeWidth);
                container.node().appendChild(bottomXAxis.node());
                topXAxis = GetSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(topXAxis.node());
                break;
        }
    }

    if (isUniformYScale) {
        switch (config.yAxisPosition) {
            case ESmallMultiplesYAxisPosition.FrozenLeftColumn:
                leftYAxis = GetSmallMultiplesUniformLeftYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(leftYAxis.node());
                break;
            case ESmallMultiplesYAxisPosition.FrozenRightColumn:
                rightYAxis = GetSmallMultiplesUniformRightYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(rightYAxis.node());
                break;
            case ESmallMultiplesYAxisPosition.All:
                leftYAxis = GetSmallMultiplesUniformLeftYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(leftYAxis.node());

                rightYAxis = GetSmallMultiplesUniformRightYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, smallMultiplesWrapper);
                container.node().appendChild(rightYAxis.node());

                smallMultiplesWrapper.style("width", config.containerWidth - (yAxisGNodeWidth * 2) + "px");
                smallMultiplesWrapper.style("transform", "translate(" + yAxisGNodeWidth + "px" + "," + (isUniformXScale && isUniformTopXAxis ? xAxisGNodeHeight : 0) + "px" + ")");

                break;
        }
    }

    return { uniformBottomXAxis: bottomXAxis, uniformTopXAxis: topXAxis, uniformLeftYAxis: leftYAxis, uniformRightYAxis: rightYAxis };
};

export const RenderSmallMultiplesUniformBottomXAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    columns: number,
    itemWidth: number,
    itemHeight: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    bottomXAxisNode: D3Selection<SVGElement>,
    xAxisTitleGNode: D3Selection<SVGElement>,
    uniformBottomXAxis: D3Selection<HTMLElement>,
    isUniformXScale: boolean
): void => {
    ESmallMultiplesYAxisPosition
    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    itemWidth = bBox.width;
    itemHeight = bBox.height;

    if (isUniformXScale) {
        if (uniformBottomXAxis) {
            uniformBottomXAxis.selectAll(".x-axis-col-svg").remove();
        }

        for (let i = 0; i < columns; i++) {
            bottomXAxisNode.attr("id", "uniformXAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${i * itemWidth + (i * config.outerSpacing) + config.outerSpacing}px, 0px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("x-axis-col-svg", true);
            axisSVG.style("width", itemWidth + "px");
            axisSVG.style("height", xAxisGNodeHeight + "px");

            const g = d3.create("svg:g");

            axisSVG.node().append(g.node());

            if (isUniformXScale) {
                xAxisTitleGNode.attr("transform", `translate(${(itemWidth / 2) + yAxisGNodeWidth}, ${xAxisGNodeHeight - 7})`);
                axisSVG.node().appendChild(xAxisTitleGNode.node());
            }

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(i, itemWidth, itemHeight, xAxisGNodeHeight);

            if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${5})`);
                bottomXAxisNode.attr("transform", `translate(${0}, ${5})`);
            } else {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${5})`);
                bottomXAxisNode.attr("transform", `translate(${0}, ${5})`);
            }

            g.node().append(bottomXAxisNode.node().cloneNode(true));

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformBottomXAxis) {
                uniformBottomXAxis.node().appendChild(uniformAxisContainer.node().cloneNode(true));
            }
        }
    }
};

export const RenderSmallMultiplesUniformTopXAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    columns: number,
    itemWidth: number,
    itemHeight: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    topXAxisNode: D3Selection<SVGElement>,
    xAxisTitleGNode: D3Selection<SVGElement>,
    uniformTopXAxis: D3Selection<HTMLElement>,
    isUniformXScale: boolean
): void => {
    ESmallMultiplesYAxisPosition
    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    itemWidth = bBox.width;
    itemHeight = bBox.height;

    if (isUniformXScale) {
        if (uniformTopXAxis) {
            uniformTopXAxis.selectAll(".x-axis-col-svg").remove();
        }

        for (let i = 0; i < columns; i++) {
            topXAxisNode.attr("id", "uniformXAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${i * itemWidth + (i * config.outerSpacing) + config.outerSpacing}px, 0px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("x-axis-col-svg", true);
            axisSVG.style("width", itemWidth + "px");
            axisSVG.style("height", xAxisGNodeHeight + "px");

            const g = d3.create("svg:g");

            axisSVG.node().append(g.node());

            if (isUniformXScale) {
                xAxisTitleGNode
                    .attr("transform", `translate(${(itemWidth / 2) + yAxisGNodeWidth}, ${0})`);

                xAxisTitleGNode.select(".xAxisTitle")
                    .attr("dy", "0.35em")
                    .attr("y", "9");

                axisSVG.node().appendChild(xAxisTitleGNode.node());
            }

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(i, itemWidth, itemHeight, xAxisGNodeHeight);

            if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${xAxisGNodeHeight - 5 - 12})`);
                topXAxisNode.attr("transform", `translate(${0}, ${5})`);
            } else {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${xAxisGNodeHeight - 5 - 12})`);
                topXAxisNode.attr("transform", `translate(${0}, ${5})`);
            }

            g.node().append(topXAxisNode.node().cloneNode(true));

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformTopXAxis) {
                uniformTopXAxis.node().appendChild(uniformAxisContainer.node().cloneNode(true));
            }
        }
    }
};

export const RenderSmallMultiplesUniformXAxisBrush = (colIndex: number, scaleWidth: number, scaleHeight: number, xAxisGNodeHeight: number): D3Selection<SVGElement> => {
    const brushSVG = d3.create("svg");
    brushSVG.classed("uniformXAxisBrush", true);
    brushSVG.style("width", scaleWidth + "px");
    brushSVG.style("height", 18 + "px");
    brushSVG.attr("transform", `translate(${0}, ${xAxisGNodeHeight - 18})`);

    const brushG = d3.create("svg:g");
    brushG.classed("brush", true);

    brushSVG.node().append(brushG.node());

    return brushSVG;
};

export const GetSmallMultiplesUniformBottomXAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number): D3Selection<HTMLElement> => {
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isFrozenRightYAxis = config.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenRightColumn;

    const uniformXAxis = d3.create("div");
    uniformXAxis.attr("id", "uniformBottomXAxis");
    uniformXAxis.classed("uniformBottomXAxis", true);
    uniformXAxis.style("width", "100%");
    uniformXAxis.style("height", xAxisGNodeHeight + "px");
    uniformXAxis.style("transform", "translate(" + 0 + "px" + "," + (config.containerHeight - xAxisGNodeHeight) + "px" + ")");

    if (isUniformYScale) {
        uniformXAxis.style("transform", "translate(" + (isFrozenRightYAxis ? 0 : yAxisGNodeWidth) + "px" + "," + (config.containerHeight - xAxisGNodeHeight) + "px" + ")");
        uniformXAxis.style("width", `calc(100% - ${yAxisGNodeWidth}px)`);
    }

    return uniformXAxis;
}

export const GetSmallMultiplesUniformTopXAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isFrozenRightYAxis = config.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenRightColumn;

    const uniformXAxis = d3.create("div");
    uniformXAxis.attr("id", "uniformTopXAxis");
    uniformXAxis.classed("uniformTopXAxis", true);
    uniformXAxis.style("width", "100%");
    uniformXAxis.style("height", xAxisGNodeHeight + "px");

    if (isUniformYScale) {
        uniformXAxis.style("transform", "translate(" + (isFrozenRightYAxis ? 0 : yAxisGNodeWidth) + "px" + "," + 0 + "px" + ")");
        uniformXAxis.style("width", `calc(100% - ${yAxisGNodeWidth}px)`);
    }

    smallMultiplesWrapper.style("transform", "translate(" + 0 + "px" + "," + (xAxisGNodeHeight) + "px" + ")");

    return uniformXAxis;
}