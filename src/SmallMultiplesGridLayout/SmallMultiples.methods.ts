/* eslint-disable max-lines-per-function */
import React from "react";
import * as ReactDOM from "react-dom";
import * as d3 from "d3";
import { ILayoutItemProps, ISmallMultiplesGridLayoutSettings, ISmallMultiplesLayoutProps } from "./SmallMultiples.interface";
import { EFontStyle, ESmallMultiplesAxisType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, Orientation } from "./SmallMultiples.enum";
import SmallMultiplesLayout from "./smallMultiplesLayout";
import { generateSecureRandomBytes } from "../methods/methods";

const titleToAxisMargin = 10;

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

export const DrawSmallMultiplesGridLayout = (config: ISmallMultiplesGridLayoutSettings): () => any => {
    const { rows, columns } = GetGridLayoutRowsColumnsCount(config);

    const SMPaginationPanelHeight: number = config.viewType === ESmallMultiplesViewType.Pagination ? 35 : 0;
    const totalRows = Math.ceil(config.categories.length / columns);
    let itemWidth = (config.containerWidth - config.outerSpacing * columns - config.outerSpacing) / columns;
    let itemHeight = ((config.containerHeight - SMPaginationPanelHeight) / rows) - config.outerSpacing - 10;
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformXScaleAll = isUniformXScale && config.xAxisPosition === ESmallMultiplesXAxisPosition.All;

    const headerSettings = config.header;
    const panelTitleSize = getSVGTextSize("Test",
        headerSettings.fontFamily,
        headerSettings.fontSize,
        headerSettings.fontStyles);

    const { xAxisGNodeHeight: xAxisGNodeHeight1, yAxisGNodeWidth: yAxisGNodeWidth1, yAxisTitleWidth: yAxisTitleWidth1, xAxisTitleHeight: xAxisTitleHeight1 } = GetRootXYAxisGNode(
        config,
        itemWidth - config.innerSpacing * 2,
        itemHeight - panelTitleSize.height - config.innerSpacing * 2 - SMPaginationPanelHeight,
        true
    );

    if (isUniformXScale) {
        itemHeight = (config.containerHeight - xAxisGNodeHeight1 - xAxisTitleHeight1 - titleToAxisMargin - SMPaginationPanelHeight) / rows - config.outerSpacing;
    }

    if (isUniformYScale) {
        itemWidth = (config.containerWidth - yAxisGNodeWidth1 - yAxisTitleWidth1 - titleToAxisMargin - (config.outerSpacing * columns) - config.outerSpacing) / columns;
    }

    const { xAxisGNodeHeight, xAxisTitleHeight, yAxisGNodeWidth, yAxisTitleWidth } = GetRootXYAxisGNode(
        config,
        itemWidth - config.innerSpacing * 2,
        itemHeight - panelTitleSize.height - config.innerSpacing * 2 - SMPaginationPanelHeight,
        true
    );

    if (isUniformXScale) {
        itemHeight = (config.containerHeight - xAxisGNodeHeight - xAxisTitleHeight - titleToAxisMargin - SMPaginationPanelHeight) / rows - config.outerSpacing - 10;
    }

    if (isUniformYScale) {
        itemWidth = (config.containerWidth - yAxisGNodeWidth - yAxisTitleWidth - titleToAxisMargin - config.outerSpacing * columns - config.outerSpacing) / columns;
    }

    const xAxisMargin = xAxisGNodeHeight + xAxisTitleHeight + titleToAxisMargin;
    const yAxisMargin = yAxisGNodeWidth + yAxisTitleWidth + titleToAxisMargin;

    const { hyperListMainContainer, SMPaginationPanel, uniformAxisContainer } = CreateSmallMultiplesContainer(config);

    const { uniformBottomXAxis, uniformTopXAxis, uniformLeftYAxis, uniformRightYAxis } = CreateSmallMultiplesUniformAxis(
        config,
        xAxisMargin,
        yAxisMargin,
        uniformAxisContainer,
        hyperListMainContainer
    );

    hyperListMainContainer.style("height", function () {
        const height = d3.select(this).node().getBoundingClientRect().height;
        return (height - (isUniformXScale ? (isUniformXScaleAll ? xAxisMargin * 2 : xAxisMargin) : 0)) + "px";
    });

    if (config.viewType === ESmallMultiplesViewType.Pagination) {
        CreateSmallMultiplesPaginationPanel(config, rows, columns, SMPaginationPanel, hyperListMainContainer, totalRows, itemHeight);
    } else {
        SMPaginationPanel.selectAll("*").remove();
    }

    const layout = GetReactGridLayout(config, columns, config.viewType === ESmallMultiplesViewType.Pagination ? rows : totalRows);
    const layoutProps = GetSmallMultiplesLayoutProps(config, layout, itemHeight, columns);

    ReactDOM.render(React.createElement(SmallMultiplesLayout, layoutProps), hyperListMainContainer.node());

    const renderUniformXYAxisToContainer = () => {
        const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
        const itemWidth = bBox.width;
        const itemHeight = bBox.height;

        const { bottomMargin, leftMargin } = config.getBottomLeftMargin();

        const { yAxisTitleGNode, xAxisTitleGNode, xAxisTitleHeight, yAxisTitleWidth } = GetRootXYAxisGNode(
            config,
            itemWidth - (!isUniformYScale ? leftMargin : config.innerSpacing * 2),
            itemHeight - panelTitleSize.height - (!isUniformXScale ? bottomMargin : config.innerSpacing * 2),
            false
        );

        const xAxisMargin = xAxisGNodeHeight + xAxisTitleHeight + titleToAxisMargin;
        const yAxisMargin = yAxisGNodeWidth + yAxisTitleWidth + titleToAxisMargin;

        if (isUniformXScale) {
            switch (config.xAxisPosition) {
                case ESmallMultiplesXAxisPosition.FrozenBottomColumn:
                    RenderSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, xAxisMargin, yAxisMargin, columns, hyperListMainContainer, xAxisTitleGNode, xAxisGNodeHeight, uniformBottomXAxis);
                    break;
                case ESmallMultiplesXAxisPosition.FrozenTopColumn:
                    RenderSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, xAxisMargin, yAxisMargin, columns, hyperListMainContainer, xAxisTitleGNode, xAxisGNodeHeight, uniformTopXAxis);
                    break;
                case ESmallMultiplesXAxisPosition.All:
                    RenderSmallMultiplesUniformBottomXAxis(config, xAxisGNodeHeight, xAxisMargin, yAxisMargin, columns, hyperListMainContainer, xAxisTitleGNode, xAxisGNodeHeight, uniformBottomXAxis);
                    RenderSmallMultiplesUniformTopXAxis(config, xAxisGNodeHeight, xAxisMargin, yAxisMargin, columns, hyperListMainContainer, xAxisTitleGNode, xAxisGNodeHeight, uniformTopXAxis);
                    break;
            }
        }

        if (isUniformYScale) {
            switch (config.yAxisPosition) {
                case ESmallMultiplesYAxisPosition.FrozenLeftColumn:
                    RenderSmallMultiplesUniformLeftYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, yAxisMargin, totalRows, hyperListMainContainer, yAxisTitleGNode, yAxisTitleWidth, uniformLeftYAxis, isUniformYScale, panelTitleSize);
                    break;
                case ESmallMultiplesYAxisPosition.FrozenRightColumn:
                    RenderSmallMultiplesUniformRightYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, yAxisMargin, totalRows, hyperListMainContainer, yAxisTitleGNode, yAxisTitleWidth, uniformRightYAxis, isUniformYScale, panelTitleSize);
                    break;
                case ESmallMultiplesYAxisPosition.All:
                    RenderSmallMultiplesUniformLeftYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, yAxisMargin, totalRows, hyperListMainContainer, yAxisTitleGNode, yAxisTitleWidth, uniformLeftYAxis, isUniformYScale, panelTitleSize);
                    RenderSmallMultiplesUniformRightYAxis(config, xAxisGNodeHeight, yAxisGNodeWidth, yAxisMargin, totalRows, hyperListMainContainer, yAxisTitleGNode, yAxisTitleWidth, uniformRightYAxis, isUniformYScale, panelTitleSize);
                    break;
            }
        }
    }

    return renderUniformXYAxisToContainer;
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
        height = columns >= config.categories.length ? layoutRowHeight : layoutRowHeight / 6 < 50 ? 50 : layoutRowHeight / 6;
    }

    const layoutProps: ISmallMultiplesLayoutProps = {
        className: layoutClassName,
        rowHeight: height,
        items: config.categories.length,
        cols: columns,
        layouts: layout,
        width: layoutWidth,
        measureBeforeMount: measureBeforeMount,
        compactType: orientation,
        margin: [config.outerSpacing, config.outerSpacing],
        containerPadding: [config.innerSpacing, config.innerSpacing],
        smallMultiplesSettings: config,
        onCellRendered: (category, index, rowIndex, colIndex, elementRef) => config.onCellRendered(category, index, rowIndex, colIndex, elementRef),
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
                const obj = { i: category ? randomBytes : undefined, category, x: j, y: i, w: 1, h: columns >= config.categories.length ? 1 : height, isDraggable: false, isResizable: false };
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

export const RenderSmallMultiplesUniformLeftYAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    yAxisMargin: number,
    totalRows: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    yAxisTitleGNode: D3Selection<SVGElement>,
    yAxisTitleWidth: number,
    uniformLeftYAxis: D3Selection<HTMLElement>,
    isUniformYScale: boolean,
    panelTitleSize: { width: number, height: number }
): void => {
    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    const itemWidth = bBox.width;
    const itemHeight = bBox.height;

    if (isUniformYScale) {
        if (uniformLeftYAxis) {
            uniformLeftYAxis.selectAll(".y-axis-col-svg").remove();
        }

        const uniformAxisContainer = d3.create("div");
        uniformAxisContainer
            .classed("uniform-axis-container", true)
            .style("height", (config.containerHeight * config.columns) + "px");

        uniformLeftYAxis.node().appendChild(uniformAxisContainer.node());

        hyperListMainContainer.on("scroll", () => {
            if (uniformAxisContainer) {
                uniformAxisContainer.style("transform", `translate(${0}, ${-hyperListMainContainer.node().scrollTop}px)`);
            }
        });

        // APPEND CLONED Y AXIS COPY
        for (let i = 0; i < totalRows; i++) {
            // yAxisGNode.attr("id", "uniformYAxis-" + i);

            const uniformAxis = d3.create("div");
            uniformAxis.style("transform", `translate(${0}px, ${i * itemHeight + ((i + 1) * config.outerSpacing)}px)`);
            uniformAxis.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("y-axis-col-svg", true);
            axisSVG.style("width", yAxisMargin + "px");
            axisSVG.style("height", itemHeight + "px");
            axisSVG.attr("transform", `translate(${0}, ${0})`);

            const g = d3.create("svg:g");

            const g1 = d3.create("svg:g");
            g1.classed("test", true);

            g.node().append(g1.node());
            axisSVG.node().appendChild(g.node());

            // yAxisGNode.style("display", "block");

            const uniformBrushSVG = RenderSmallMultiplesUniformYAxisBrush(true, itemHeight, yAxisGNodeWidth, yAxisTitleWidth);

            const { isVerticalBrushDisplayed } = config.getUniformYAxisAndBrushNode(i, axisSVG.select(".test").node() as any, uniformBrushSVG.select(".brush").node() as any, itemWidth, itemHeight - xAxisGNodeHeight - config.innerSpacing, true);

            if (isUniformYScale) {
                yAxisTitleGNode.attr("transform", `translate(${titleToAxisMargin + (isVerticalBrushDisplayed ? 15 : 0)}, ${itemHeight / 2})`);
                yAxisTitleGNode.select(".yAxisTitle").attr("dy", "1em");
            }

            if (isUniformYScale) {
                axisSVG.node().appendChild(yAxisTitleGNode.node().cloneNode(true));
            }

            // if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
            //     yAxisGNode.attr("transform", `translate(${0}, ${0})`);
            // } else {
            //     yAxisGNode.attr("transform", `translate(${0}, ${0})`);
            // }

            if (config.header.position === ESmallMultiplesHeaderPosition.Top) {
                g.attr("transform", `translate(${(yAxisMargin - 5)}, ${(config.innerSpacing + 5 + panelTitleSize.height)})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${0}, ${(config.innerSpacing + 5 + panelTitleSize.height)})`);
            } else {
                g.attr("transform", `translate(${(yAxisMargin - 5)}, ${0})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${0}, ${0})`);
            }

            // if (!isVerticalBrushDisplayed) {
            // g.node().appendChild(yAxisGNode.node().cloneNode(true));
            // }

            // g1.attr("transform", `translate(${0}, ${0})`);

            uniformAxis.node().appendChild(axisSVG.node());
            uniformAxis.node().appendChild(uniformBrushSVG.node());

            uniformAxisContainer.node().appendChild(uniformAxis.node());
        }
    }
};

export const RenderSmallMultiplesUniformRightYAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    yAxisGNodeWidth: number,
    yAxisMargin: number,
    totalRows: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    yAxisTitleGNode: D3Selection<SVGElement>,
    yAxisTitleWidth: number,
    uniformRightYAxis: D3Selection<HTMLElement>,
    isUniformYScale: boolean,
    panelTitleSize: { width: number, height: number }
): void => {
    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    const itemWidth = bBox.width;
    const itemHeight = bBox.height;

    if (isUniformYScale) {
        if (uniformRightYAxis) {
            uniformRightYAxis.selectAll(".y-axis-col-svg").remove();
        }

        hyperListMainContainer.on("scroll", () => {
            if (uniformRightYAxis) {
                uniformRightYAxis.style("transform", `translate(${0}, ${-hyperListMainContainer.node().scrollTop}px)`);
            }
        });

        // APPEND CLONED Y AXIS COPY
        for (let i = 0; i < totalRows; i++) {
            // yAxisGNode.attr("id", "uniformYAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${0}px, ${i * itemHeight + ((i + 1) * config.outerSpacing)}px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("y-axis-col-svg", true);
            axisSVG.style("width", yAxisGNodeWidth + "px");
            axisSVG.style("height", itemHeight + "px");
            axisSVG.attr("transform", `translate(${0}, ${0})`);

            const g = d3.create("svg:g");

            const g1 = d3.create("svg:g");
            g1.classed("test", true);

            g.node().append(g1.node());
            axisSVG.node().appendChild(g.node());

            // yAxisGNode.style("display", "block");

            if (isUniformYScale) {
                yAxisTitleGNode.attr("transform", `translate(${yAxisGNodeWidth}, ${itemHeight / 2})`);
            }

            const uniformBrushSVG = RenderSmallMultiplesUniformYAxisBrush(false, itemHeight, yAxisGNodeWidth, yAxisTitleWidth);

            if (isUniformYScale) {
                axisSVG.node().appendChild(yAxisTitleGNode.node().cloneNode(true));
            }

            const { xAxisNodeHeight, isVerticalBrushDisplayed } = config.getUniformYAxisAndBrushNode(i, axisSVG.select(".test").node() as any, uniformBrushSVG.select(".brush").node() as any, itemWidth, itemHeight - xAxisGNodeHeight - config.innerSpacing, false);

            // if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
            //     yAxisGNode.attr("transform", `translate(${0}, ${0})`);
            // } else {
            //     yAxisGNode.attr("transform", `translate(${0}, ${0})`);
            // }

            if (config.header.position === ESmallMultiplesHeaderPosition.Top) {
                g.attr("transform", `translate(${0}, ${config.header.position === ESmallMultiplesHeaderPosition.Top ? (5 + panelTitleSize.height) + config.innerSpacing : 0})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${0}, ${config.header.position === ESmallMultiplesHeaderPosition.Top ? (5 + panelTitleSize.height) + config.innerSpacing : 0})`);
            } else {
                g.attr("transform", `translate(${0}, ${0})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${0}, ${0})`);
            }

            // yAxisGNode.style("display", "block");

            // if (!isVerticalBrushDisplayed) {
            //     g.node().appendChild(yAxisGNode.node().cloneNode(true));
            // }

            g1.attr("transform", `translate(${0}, ${0})`);

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformRightYAxis) {
                uniformRightYAxis.node().appendChild(uniformAxisContainer.node());
            }
        }
    }
};

export const GetSmallMultiplesUniformLeftYAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = d3.create("div");

    uniformYAxis
        .attr("id", "uniformLeftYAxis")
        .classed("uniformLeftYAxis", true)
        .style("width", yAxisGNodeWidth + "px")
        .style("height", (config.containerHeight - xAxisGNodeHeight) + "px")
        // .style("height", (config.containerHeight * config.columns) + "px")
        .style("transform", "translate(" + 0 + "px" + "," + 0 + "px" + ")")
        .style("overflow", "hidden");

    smallMultiplesWrapper.style("width", config.containerWidth - yAxisGNodeWidth + "px");
    smallMultiplesWrapper.style("transform", "translate(" + yAxisGNodeWidth + "px" + "," + (isUniformXScale && isUniformTopXAxis ? xAxisGNodeHeight : 0) + "px" + ")");

    return uniformYAxis;
}

export const GetSmallMultiplesUniformRightYAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number, smallMultiplesWrapper: D3Selection<HTMLElement>): D3Selection<HTMLElement> => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = config.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = d3.create("div");

    uniformYAxis
        .attr("id", "uniformRightYAxis")
        .classed("uniformRightYAxis", true)
        .style("width", yAxisGNodeWidth + "px")
        .style("height", (config.containerHeight - xAxisGNodeHeight) + "px")
        .style("transform", "translate(" + (config.containerWidth - yAxisGNodeWidth) + "px" + "," + 0 + "px" + ")")
        .style("overflow", "hidden");

    smallMultiplesWrapper.style("width", config.containerWidth - yAxisGNodeWidth + "px");
    smallMultiplesWrapper.style("transform", "translate(" + 0 + "px" + "," + (isUniformXScale && isUniformTopXAxis ? xAxisGNodeHeight : 0) + "px" + ")");

    return uniformYAxis;
}

export const GetRootXYAxisGNode = (config: ISmallMultiplesGridLayoutSettings, itemWidth: number, itemHeight: number, isDrawAxis: boolean): {
    bottomXAxisNode: D3Selection<SVGElement>,
    topXAxisNode: D3Selection<SVGElement>,
    leftYAxisGNode: D3Selection<SVGElement>,
    rightYAxisGNode: D3Selection<SVGElement>,
    brushNode: D3Selection<SVGElement>,
    xAxisTitleGNode: D3Selection<SVGElement>,
    yAxisTitleGNode: D3Selection<SVGElement>,
    xAxisGNodeHeight: number,
    brushNodeHeight: number,
    yAxisGNodeWidth: number,
    xAxisTitleHeight: number,
    yAxisTitleWidth: number,
} => {
    const { xAxisNode: bottomXAxisNode, xAxisNodeHeight, xAxisTitleG, xAxisTitleHeight, brushNode, brushNodeHeight } = config.getXAxisNodeElementAndMeasures(itemWidth, itemHeight, true, isDrawAxis);
    const { xAxisNode: topXAxisNode } = config.getXAxisNodeElementAndMeasures(itemWidth, itemHeight, false, isDrawAxis);
    const { yAxisNode: leftYAxisNode, yAxisNodeWidth, yAxisTitleG, yAxisTitleWidth } = config.getYAxisNodeElementAndMeasures(itemWidth, itemHeight, true, isDrawAxis);
    const { yAxisNode: rightYAxisNode } = config.getYAxisNodeElementAndMeasures(itemWidth, itemHeight, false, isDrawAxis);

    const bottomXAxisGNode = d3.select(bottomXAxisNode.cloneNode(true));
    const topXAxisGNode = d3.select(topXAxisNode.cloneNode(true));

    const leftYAxisGNode = d3.select(leftYAxisNode.cloneNode(true));
    const rightYAxisGNode = d3.select(rightYAxisNode.cloneNode(true));

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
        leftYAxisGNode: leftYAxisGNode,
        rightYAxisGNode: rightYAxisGNode,
        brushNode: d3.select(brushNode.cloneNode(true)),
        xAxisTitleGNode: xAxisTitleGNode,
        xAxisGNodeHeight: xAxisNodeHeight,
        yAxisGNodeWidth: yAxisNodeWidth,
        yAxisTitleGNode: yAxisTitleGNode,
        xAxisTitleHeight: xAxisTitleHeight,
        yAxisTitleWidth: yAxisTitleWidth,
        brushNodeHeight
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
    xAxisMargin: number,
    yAxisGNodeWidth: number,
    columns: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    xAxisTitleGNode: D3Selection<SVGElement>,
    xAxisTitleHeight: number,
    uniformBottomXAxis: D3Selection<HTMLElement>,
): void => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;

    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    const itemWidth = bBox.width;
    const itemHeight = bBox.height;

    if (isUniformXScale) {
        if (uniformBottomXAxis) {
            uniformBottomXAxis.selectAll(".x-axis-col-svg").remove();
        }

        for (let i = 0; i < columns; i++) {
            // bottomXAxisNode.attr("id", "uniformXAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${i * itemWidth + (i * config.outerSpacing) + config.outerSpacing}px, 0px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("x-axis-col-svg", true);
            axisSVG.style("width", itemWidth + "px");
            axisSVG.style("height", xAxisMargin + "px");
            axisSVG.style("transform", `translate(${0}, ${0}px)`);

            const g = d3.create("svg:g");

            const g1 = d3.create("svg:g");
            g1.classed("test", true);

            g.node().append(g1.node());
            axisSVG.node().append(g.node());

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(true, i, itemWidth, itemHeight, xAxisMargin);

            const { isHorizontalBrushDisplayed } = config.getUniformXAxisAndBrushNode(i, axisSVG.select(".test").node() as any, uniformBrushSVG.select(".brush").node() as any, itemWidth - (isUniformYScale ? 0 : yAxisGNodeWidth) - config.innerSpacing * 2, itemHeight, true);

            if (isUniformXScale) {
                xAxisTitleGNode.attr("transform", `translate(${yAxisGNodeWidth + ((itemWidth - yAxisGNodeWidth) / 2)}, ${xAxisGNodeHeight + titleToAxisMargin + 5 - (isHorizontalBrushDisplayed ? 20 : 0)})`);
            }

            if (isUniformXScale) {
                axisSVG.node().append(xAxisTitleGNode.node().cloneNode(true));
            }

            if (isUniformYScale) {
                g.attr("transform", `translate(${config.innerSpacing}, ${10})`);
                // bottomXAxisNode.attr("transform", `translate(${0}, ${5})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${config.innerSpacing}, ${0})`);
            } else {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${10})`);
                // bottomXAxisNode.attr("transform", `translate(${0}, ${5})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${yAxisGNodeWidth}, ${0})`);
            }

            // if (!isHorizontalBrushDisplayed) {
            //     g.node().append(bottomXAxisNode.node().cloneNode(true));
            // }

            g1.attr("transform", `translate(${0}, ${0})`);

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformBottomXAxis) {
                uniformBottomXAxis.node().appendChild(uniformAxisContainer.node());
            }
        }
    }
};

export const RenderSmallMultiplesUniformTopXAxis = (
    config: ISmallMultiplesGridLayoutSettings,
    xAxisGNodeHeight: number,
    xAxisMargin: number,
    yAxisGNodeWidth: number,
    columns: number,
    hyperListMainContainer: D3Selection<HTMLElement>,
    xAxisTitleGNode: D3Selection<SVGElement>,
    xAxisTitleHeight: number,
    uniformTopXAxis: D3Selection<HTMLElement>,
): void => {
    const isUniformXScale = config.xAxisType === ESmallMultiplesAxisType.Uniform;
    const bBox = (hyperListMainContainer.select(".react-grid-item").node() as HTMLDivElement).getBoundingClientRect();
    const itemWidth = bBox.width;
    const itemHeight = bBox.height;

    if (isUniformXScale) {
        if (uniformTopXAxis) {
            uniformTopXAxis.selectAll(".x-axis-col-svg").remove();
        }

        for (let i = 0; i < columns; i++) {
            // topXAxisNode.attr("id", "uniformXAxis-" + i);

            const uniformAxisContainer = d3.create("div");
            uniformAxisContainer.style("transform", `translate(${i * itemWidth + (i * config.outerSpacing) + config.outerSpacing}px, 0px)`);
            uniformAxisContainer.style("position", "absolute");

            const axisSVG = d3.create("svg");
            axisSVG.classed("x-axis-col-svg", true);
            axisSVG.style("width", itemWidth + "px");
            axisSVG.style("height", xAxisGNodeHeight + "px");
            axisSVG.style("transform", `translate(${0}, ${0}px)`);

            const g = d3.create("svg:g");

            const g1 = d3.create("svg:g");
            g1.classed("test", true);

            g.node().append(g1.node());
            axisSVG.node().append(g.node());

            if (isUniformXScale) {
                xAxisTitleGNode
                    .attr("transform", `translate(${yAxisGNodeWidth + ((itemWidth - yAxisGNodeWidth) / 2)}, ${0})`);

                xAxisTitleGNode.select(".xAxisTitle")
                    .attr("dy", "0.35em")
                    .attr("y", "9");

            }

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(false, i, itemWidth, itemHeight, xAxisMargin);

            if (isUniformXScale) {
                axisSVG.node().appendChild(xAxisTitleGNode.node().cloneNode(true));
            }

            const { xAxisNodeHeight, isHorizontalBrushDisplayed } = config.getUniformXAxisAndBrushNode(i, axisSVG.select(".test").node() as any, uniformBrushSVG.select(".brush").node() as any, itemWidth - yAxisGNodeWidth - config.innerSpacing * 2, itemHeight, false);

            if (config.yAxisType === ESmallMultiplesAxisType.Uniform) {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${xAxisGNodeHeight - 5 - 12})`);
                // topXAxisNode.attr("transform", `translate(${0}, ${5})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${yAxisGNodeWidth + config.innerSpacing}, ${0})`);
            } else {
                g.attr("transform", `translate(${yAxisGNodeWidth}, ${xAxisGNodeHeight - 5 - 12})`);
                // topXAxisNode.attr("transform", `translate(${0}, ${5})`);
                uniformBrushSVG.select(".brush").attr("transform", `translate(${yAxisGNodeWidth + config.innerSpacing}, ${0})`);
            }

            g1.attr("transform", `translate(${0}, ${0})`);

            uniformAxisContainer.node().appendChild(axisSVG.node());
            uniformAxisContainer.node().appendChild(uniformBrushSVG.node());

            if (uniformTopXAxis) {
                uniformTopXAxis.node().appendChild(uniformAxisContainer.node());
            }
        }
    }
};

export const RenderSmallMultiplesUniformXAxisBrush = (isBottomXAxis: boolean, colIndex: number, scaleWidth: number, scaleHeight: number, xAxisGNodeHeight: number): D3Selection<SVGElement> => {
    const brushSVG = d3.create("svg");
    brushSVG.classed("uniformXAxisBrush", true);
    brushSVG.style("width", scaleWidth + "px");
    brushSVG.style("height", 20 + "px");

    if (isBottomXAxis) {
        brushSVG.attr("transform", `translate(${0}, ${xAxisGNodeHeight - 20})`);
    } else {
        brushSVG.attr("transform", `translate(${0}, ${10})`);
    }

    const brushG = d3.create("svg:g");
    brushG.classed("brush", true);

    brushSVG.node().append(brushG.node());

    return brushSVG;
};

export const RenderSmallMultiplesUniformYAxisBrush = (isLeftYAxis: boolean, scaleHeight: number, yAxisGNodeWidth: number, yAxisTitleWidth: number): D3Selection<SVGElement> => {
    const brushSVG = d3.create("svg");
    brushSVG.classed("uniformYAxisBrush", true);
    brushSVG.style("width", 18 + "px");
    brushSVG.style("height", scaleHeight + "px");

    if (isLeftYAxis) {
        brushSVG.attr("transform", `translate(${10}, ${0})`);
    } else {
        brushSVG.attr("transform", `translate(${yAxisGNodeWidth - 10}, ${0})`);
    }

    const brushG = d3.create("svg:g");
    brushG.classed("brush", true);

    brushSVG.node().append(brushG.node());

    return brushSVG;
};

export const GetSmallMultiplesUniformBottomXAxis = (config: ISmallMultiplesGridLayoutSettings, xAxisGNodeHeight: number, yAxisGNodeWidth: number): D3Selection<HTMLElement> => {
    const isUniformYScale = config.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isFrozenRightYAxis = config.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenRightColumn;
    const SMPaginationPanelHeight: number = config.viewType === ESmallMultiplesViewType.Pagination ? 35 : 0;

    const uniformXAxis = d3.create("div");
    uniformXAxis.attr("id", "uniformBottomXAxis");
    uniformXAxis.classed("uniformBottomXAxis", true);
    uniformXAxis.style("width", "100%");
    uniformXAxis.style("height", xAxisGNodeHeight + "px");
    uniformXAxis.style("transform", "translate(" + 0 + "px" + "," + (config.containerHeight - xAxisGNodeHeight - SMPaginationPanelHeight) + "px" + ")");

    if (isUniformYScale) {
        uniformXAxis.style("transform", "translate(" + (isFrozenRightYAxis ? 0 : yAxisGNodeWidth) + "px" + "," + (config.containerHeight - xAxisGNodeHeight - SMPaginationPanelHeight) + "px" + ")");
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