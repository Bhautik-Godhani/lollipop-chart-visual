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
    const itemHeight = (config.containerHeight - SMPaginationPanelHeight) / rows - config.outerSpacing;
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const headerSettings = config.header;
    const panelTitleSize = getSVGTextSize("Test",
        headerSettings.fontFamily,
        headerSettings.fontSize,
        headerSettings.fontStyles);

    const { xAxisGNode, yAxisGNode, xAxisGNodeHeight, yAxisGNodeWidth } = GetRootXYAxisGNode(
        config,
        itemWidth - config.innerSpacing * 2,
        itemHeight - panelTitleSize.height - config.innerSpacing * 2
    );

    const { hyperListMainContainer, SMPaginationPanel, uniformAxisContainer } = CreateSmallMultiplesContainer(config);

    hyperListMainContainer.style("height", function () {
        const height = d3.select(this).node().getBoundingClientRect().height;
        return (height - (isUniformXScale ? xAxisGNodeHeight : 0)) + "px";
    });

    if (config.viewType === ESmallMultiplesViewType.Pagination) {
        CreateSmallMultiplesPaginationPanel(config, rows, columns, SMPaginationPanel, hyperListMainContainer, totalRows, itemHeight);
    } else {
        SMPaginationPanel.selectAll("*").remove();
    }

    const layout = GetReactGridLayout(config, columns, config.viewType === ESmallMultiplesViewType.Pagination ? rows : totalRows);
    const layoutProps = GetSmallMultiplesLayoutProps(config, layout, itemHeight - config.outerSpacing / 2, columns);

    ReactDOM.render(React.createElement(SmallMultiplesLayout, layoutProps), hyperListMainContainer.node());

    const { uniformBottomXAxis, uniformTopXAxis, uniformLeftYAxis, uniformRightYAxis } = CreateSmallMultiplesUniformAxis(
        config,
        xAxisGNodeHeight,
        yAxisGNodeWidth,
        uniformAxisContainer,
        hyperListMainContainer
    );

    if (isUniformXScale) {
        setTimeout(() => {
            RenderSmallMultiplesUniformXAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, columns, itemWidth, itemHeight, hyperListMainContainer, xAxisGNode, uniformBottomXAxis, uniformTopXAxis, isUniformXScale);
        }, 100);
    }

    RenderSmallMultiplesUniformYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, totalRows, itemHeight, hyperListMainContainer, yAxisGNode, uniformLeftYAxis, uniformRightYAxis, isUniformYScale);
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
    const minItemWidth = 200;
    const minItemHeight = 200;
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

    const measureBeforeMount = false;
    const orientation = Orientation.Vertical;

    let height = 0;
    if (config.layoutType === ESmallMultiplesLayoutType.Grid) {
        height = layoutRowHeight;
    } else if (config.layoutType === ESmallMultiplesLayoutType.RankedPanels) {
        height = layoutRowHeight / 6;
    } else if (config.layoutType === ESmallMultiplesLayoutType.ScaledRows) {
        height = layoutRowHeight / 6;
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

    const minScaledRowHeight = 3;
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
    uniformLeftYAxis: D3Selection<HTMLElement>,
    uniformRightYAxis: D3Selection<HTMLElement>,
    isUniformYScale: boolean
): void => {
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
                uniformRightYAxis.style("transform", `translate(${config.containerWidth + smallMultiplesLayoutScrollbarWidth}px, ${-hyperListMainContainer.node().scrollTop}px)`);
            }
        });

        // APPEND CLONED Y AXIS COPY
        for (let i = 0; i < totalRows; i++) {
            const svg = d3.create("svg");
            svg.classed("y-axis-col-svg", true);
            svg.style("width", yAxisGNodeWidth + "px");

            const height = (itemHeight - config.outerSpacing / 2)
            svg.style("height", height + "px");
            svg.style("transform", `translate(${0}px ,${i * height + ((i + 1) * config.outerSpacing)}px)`);

            const g = d3.create("svg:g");

            if (config.header.position === ESmallMultiplesHeaderPosition.Top) {
                g.style("transform", `translate(${yAxisGNodeWidth}px, ${config.header.position === ESmallMultiplesHeaderPosition.Top ? 10 : 0}px)`);
            } else {
                g.style("transform", `translate(${yAxisGNodeWidth}px, ${0}px)`);
            }

            yAxisGNode.style("display", "block");

            svg.node().appendChild(g.node());

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

export const GetRootXYAxisGNode = (config: ISmallMultiplesGridLayoutSettings, itemWidth: number, itemHeight: number): { xAxisGNode: D3Selection<SVGElement>; yAxisGNode: D3Selection<SVGElement>, xAxisGNodeHeight: number; yAxisGNodeWidth: number } => {
    const { xAxisNode, yAxisNode, xAxisNodeHeight, yAxisNodeWidth } = config.getXYAxisNodeElementAndMeasures(itemWidth, itemHeight);
    const xAxisGNode = d3.select(xAxisNode.cloneNode(true));
    const yAxisGNode = d3.select(yAxisNode.cloneNode(true));
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;

    xAxisGNode.style("transform", "translate(0px, 0px)");

    if (!isUniformXScale) {
        xAxisGNode.selectAll("text").attr("y", 0);
        xAxisGNode.selectAll("tspan").attr("y", 0);
    }

    return { xAxisGNode, yAxisGNode, xAxisGNodeHeight: xAxisNodeHeight, yAxisGNodeWidth: yAxisNodeWidth };
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

export const RenderSmallMultiplesUniformXAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    columns: number,
    itemWidth: number,
    itemHeight: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    xAxisGNode: D3Selection<SVGElement>,
    uniformBottomXAxis: D3Selection<HTMLElement>,
    uniformTopXAxis: D3Selection<HTMLElement>,
    isUniformXScale: boolean
): void => {
    if (isUniformXScale) {
        if (uniformBottomXAxis) {
            uniformBottomXAxis.selectAll(".x-axis-col-svg").remove();
        }

        if (uniformTopXAxis) {
            uniformTopXAxis.selectAll(".x-axis-col-svg").remove();
        }

        for (let i = 0; i < columns; i++) {
            xAxisGNode.attr("id", "uniformXAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${i * itemWidth + (i * config.outerSpacing) + config.outerSpacing}px, 0px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("x-axis-col-svg", true);
            axisSVG.style("width", itemWidth + "px");
            axisSVG.style("height", xAxisGNodeHeight + "px");

            const g = d3.create("svg:g");
            g.attr("transform", `translate(${yAxisGNodeWidth + config.innerSpacing}px, 0px)`);

            axisSVG.node().append(g.node());

            g.node().append(xAxisGNode.node().cloneNode(true));

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(i, itemWidth, itemHeight, xAxisGNodeHeight);

            if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
                g.style("transform", `translate(${yAxisGNodeWidth}px, ${10}px)`);
                xAxisGNode.style("transform", `translate(${yAxisGNodeWidth}px, ${10}px)`);
            } else {
                g.style("transform", `translate(${yAxisGNodeWidth}px, ${0}px)`);
                xAxisGNode.style("transform", `translate(${0}px, ${0}px)`);
            }

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformBottomXAxis) {
                uniformBottomXAxis.node().appendChild(uniformAxisContainer.node());
            }

            if (uniformTopXAxis) {
                uniformTopXAxis.node().appendChild(uniformAxisContainer.node());
            }
        }
    }
};

export const RenderSmallMultiplesUniformXAxisBrush = (colIndex: number, scaleWidth: number, scaleHeight: number, xAxisGNodeHeight: number): D3Selection<SVGElement> => {
    const brushSVG = d3.create("svg");
    brushSVG.classed("uniformXAxisBrush", true);
    brushSVG.style("width", scaleWidth + "px");
    brushSVG.style("height", 18 + "px");
    brushSVG.style("transform", `translate(${0}px, ${xAxisGNodeHeight - 18}px)`);

    const brushG = d3.create("svg:g");
    brushG.classed("brush", true);

    brushSVG.node().append(brushG.node());

    return brushSVG;
};

export const GetSmallMultiplesUniformBottomXAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number): D3Selection<HTMLElement> => {
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const uniformXAxis = d3.create("div");
    uniformXAxis.attr("id", "uniformBottomXAxis");
    uniformXAxis.classed("uniformBottomXAxis", true);
    uniformXAxis.style("width", "100%");
    uniformXAxis.style("height", xAxisGNodeHeight + "px");
    uniformXAxis.style("transform", "translate(" + 0 + "px" + "," + (config.containerHeight - xAxisGNodeHeight) + "px" + ")");

    if (isUniformYScale) {
        uniformXAxis.style("transform", "translate(" + yAxisGNodeWidth + "px" + "," + (config.containerHeight - xAxisGNodeHeight) + "px" + ")");
        uniformXAxis.style("width", `calc(100% - ${yAxisGNodeWidth}px)`);
    }

    return uniformXAxis;
}

export const GetSmallMultiplesUniformTopXAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const uniformXAxis = d3.create("div");
    uniformXAxis.attr("id", "uniformTopXAxis");
    uniformXAxis.classed("uniformTopXAxis", true);
    uniformXAxis.style("width", "100%");
    uniformXAxis.style("height", xAxisGNodeHeight + "px");

    if (isUniformYScale) {
        uniformXAxis.style("transform", "translate(" + yAxisGNodeWidth + "px" + "," + 0 + "px" + ")");
        uniformXAxis.style("width", `calc(100% - ${yAxisGNodeWidth}px)`);
    }

    smallMultiplesWrapper.style("transform", "translate(" + 0 + "px" + "," + (xAxisGNodeHeight) + "px" + ")");

    return uniformXAxis;
}