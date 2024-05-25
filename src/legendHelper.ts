/* eslint-disable max-lines-per-function */
import * as d3 from "d3";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { generatePattern } from "./methods/methods";
import { Visual } from "./visual";
import { EMarkerShapeTypes } from "./enum";

// export interface LegendDataPoint {
//   label: string;
//   color: string;
//   pattern: string;
// }
let legendWrapper, legend, iconsBar, leftArrow, rightArrow, topArrow, bottomArrow, legendWrapperXOffset;

export const initializeLegends = (parentElement, legendFormattingOptions) => {
    iconsBar = leftArrow = rightArrow = topArrow = bottomArrow = legendWrapperXOffset = null;
    legendWrapper = d3.select("div.legend-wrapper");

    if (!legendWrapper.empty()) {
        legendWrapper.remove();
    }

    legendWrapper = d3
        .select(parentElement)
        .append("div")
        .attr("class", "legend-wrapper")
        .style("display", "flex")
        .lower()
        // .style("position", "absolute")
        // .style("top", "0")
        .style("flex-direction", () => {
            if (
                legendFormattingOptions.legendPosition === "LeftTop" ||
                legendFormattingOptions.legendPosition === "LeftCenter" ||
                legendFormattingOptions.legendPosition === "LeftBottom" ||
                legendFormattingOptions.legendPosition === "RightTop" ||
                legendFormattingOptions.legendPosition === "RightCenter" ||
                legendFormattingOptions.legendPosition === "RightBottom"
            ) {
                return "row";
            } else {
                return "column";
            }
        })
        .style("overflow", "scroll");

    legend = legendWrapper
        .append("svg")
        .attr("class", "legend")
        .style("z-index", 1)
        .attr("height", "26px")
        .style("max-width", () => {
            if (
                legendFormattingOptions.legendPosition === "LeftTop" ||
                legendFormattingOptions.legendPosition === "LeftCenter" ||
                legendFormattingOptions.legendPosition === "LeftBottom" ||
                legendFormattingOptions.legendPosition === "RightTop" ||
                legendFormattingOptions.legendPosition === "RightCenter" ||
                legendFormattingOptions.legendPosition === "RightBottom"
            ) {
                return "30vw";
            }
        });
    // .style("position", "absolute")
    // .style("top", "0");
    // .style("display", "none");
};

export const renderLegendTitle = (shadow, legendTitle, legendFormattingOptions, circleRadius) => {
    legendTitle = !legendFormattingOptions.showTitle ? legendTitle : legendFormattingOptions.legendTitle !== "" ? legendFormattingOptions.legendTitle : legendTitle;
    const legendTitleElement = legend
        .append("g")
        .attr("class", "legendTitle")
        .attr("transform", () => `translate(0, 0)`)
        .append("text")
        .attr("fill", legendFormattingOptions.legendColor)
        .text(() => {
            if (legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight" || legendFormattingOptions.legendPosition === "BottomLeft" || legendFormattingOptions.legendPosition === "BottomCenter" || legendFormattingOptions.legendPosition === "BottomRight") {
                return legendTitle.length > 15 ? legendTitle.slice(0, 15).concat("...") : legendTitle;
            } else {
                return legendTitle;
            }
        })
        .attr("x", 0)
        .attr("y", circleRadius + circleRadius * 0.2)
        .attr("dy", legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom" ? "0.5em" : "0.35em")
        .attr("title", legendTitle)
        .style("font-weight", "bold")
        .style("font-size", `${legendFormattingOptions.fontSize}pt`)
        .style("font-family", legendFormattingOptions.fontFamily)
        .call(textNodes => {
            if (legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") {
                addEllipsisToLegends(textNodes, legendFormattingOptions, circleRadius, true);
            }
        });
    return legendTitleElement;
}

export const renderLegends = (
    self: Visual,
    mainContainer: HTMLElement,
    bottomSpace: number,
    legendTitle: string,
    legendsData, //: LegendDataPoint[],
    legendFormattingOptions,
    isPatternEnabled,
    isShowImageMarker
) => {
    initializeLegends(mainContainer, legendFormattingOptions);

    let circleRadius = 5;
    circleRadius = Math.max(circleRadius, legendFormattingOptions.fontSize / 4);
    legend.selectAll("*").remove();

    let labelOffsetX = 0, labelOffsetY = 10, legendTitleElement;
    if (legendFormattingOptions.showTitle) {
        legendTitleElement = renderLegendTitle(self, legendTitle, legendFormattingOptions, circleRadius);

        labelOffsetX = legendTitleElement.node().getBBox().width + 5;
        labelOffsetY = legendTitleElement.node().getBBox().height + 5;
    }

    const legendItemsGroup = legend.append("g").attr("class", "legend-group").attr("clip-path", "url(#scrollbox-clip-path)");

    const legendItems = legendItemsGroup.selectAll(".legendItem").data(legendsData).enter().append("g").attr("class", "legendItem").attr("transform", (d, i) => getTranslateValues(i, legendFormattingOptions));

    if (!isShowImageMarker) {
        legendItems
            .append("circle")
            .attr("cx", () => circleRadius)
            .attr("cy", () => circleRadius)
            .attr("r", () => circleRadius)
            .attr("fill", d => {
                if (isPatternEnabled && d.data.pattern && d.data.pattern.patternIdentifier !== "" && d.data.pattern.patternIdentifier !== "NONE") {
                    return `url('#${generatePattern(legend, d.data.pattern, d.data.color, true)}')`;
                }
                return d.data.color;
            });
    } else {
        legendItems.append("svg:image")
            .attr("width", circleRadius * 2)
            .attr("height", circleRadius * 2)
            .attr("xlink:href", (d) => {
                if (self.isHasImagesData && self.isShowImageMarker1 && d.data.imageUrl) {
                    return d.data.imageUrl;
                }

                if (self.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON && self.markerSettings.marker1Style.markerShapeBase64Url) {
                    return self.markerSettings.marker1Style.markerShapeBase64Url;
                }
            })
    }

    console.log(isShowImageMarker);

    legendItems
        .append("text")
        .attr("x", () => circleRadius * 2 + 2)
        .attr("y", () => circleRadius)
        .attr("fill", legendFormattingOptions.legendColor)
        .attr("dy", "0.35em")
        .text(d => d.data.name)
        .attr("title", d => d.data.name)
        .style("font-size", `${legendFormattingOptions.fontSize}pt`)
        .style("font-family", legendFormattingOptions.fontFamily)
        .call(textNodes => {
            if (legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") {
                addEllipsisToLegends(textNodes, legendFormattingOptions, circleRadius);
            }
        });

    let previousNodeWidth = 0, previousNodeHeight = 0, horizontalLegendsHeight, verticalLegendElementWidth = 0;

    legendItems.each((d, i, nodes) => {
        if (legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight" || legendFormattingOptions.legendPosition === "BottomLeft" || legendFormattingOptions.legendPosition === "BottomCenter" || legendFormattingOptions.legendPosition === "BottomRight") {
            if (i == 0) {
                horizontalLegendsHeight = nodes[i].getBBox().height;
                horizontalLegendsHeight += horizontalLegendsHeight * 0.25;
            }
            d3.select(nodes[i]).attr(
                "transform",
                `translate(${previousNodeWidth + labelOffsetX}, ${horizontalLegendsHeight / 4})`,
            );
            previousNodeWidth += nodes[i].getBBox().width + 5;
        } else if (legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") {
            verticalLegendElementWidth = Math.max(nodes[i].getBBox().width, verticalLegendElementWidth);
            d3.select(nodes[i]).attr("transform", `translate(0, ${previousNodeHeight + labelOffsetY})`);
            previousNodeHeight += nodes[i].getBBox().height + 5;
        }
    });

    if (legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight" || legendFormattingOptions.legendPosition === "BottomLeft" || legendFormattingOptions.legendPosition === "BottomCenter" || legendFormattingOptions.legendPosition === "BottomRight") {
        const horizontalLegendsWidth = previousNodeWidth + labelOffsetX;

        legend.attr("height", horizontalLegendsHeight);
        legend.attr("width", horizontalLegendsWidth);

        legendWrapper.style("height", `${horizontalLegendsHeight}px`);
        legendWrapper.style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6}px`);

        if (legendWrapperXOffset) {
            legendWrapper
                .style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 - legendWrapperXOffset}px`)
                .style("margin-left", legendWrapperXOffset);
        } else { legendWrapper.style("margin-left", "0px"); }

        if (legendFormattingOptions.showTitle) {
            legendTitleElement.attr("transform", () => `translate(0, ${horizontalLegendsHeight / 4})`);
        }
    } else if (legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") {
        const verticalLegendsHeight = previousNodeHeight + labelOffsetY;
        verticalLegendElementWidth = Math.max(verticalLegendElementWidth, legendTitleElement ? legendTitleElement.node().getBBox().width : 0);

        legend.attr("height", verticalLegendsHeight);
        legend.attr("width", verticalLegendElementWidth);

        legendWrapper.style("height", `calc(100% - ${5}px`); // decreaseing on both top and bottom
        legendWrapper.style("margin-top", `${legendFormattingOptions.fontSize * 1.6}px`);
        legendWrapper.style("width", `${verticalLegendElementWidth}px`);

        if (legendFormattingOptions.showTitle) { legendTitleElement.attr("transform", () => `translate(0, 0)`); }
    }

    iconsBar = document.getElementsByClassName("icons-bar")[0];

    const legendWidth = +legend.attr("width");
    const legendHeight = +legend.attr("height");

    const leftRightArrows = legendWidth > legendWrapper.node().clientWidth;
    const topBottomArrows = legendHeight > legendWrapper.node().clientHeight;

    positionLabels(legendFormattingOptions, mainContainer, iconsBar, leftRightArrows, topBottomArrows, bottomSpace);

    plotNavigationArrows(legendWrapper, legend, legendFormattingOptions, leftRightArrows, topBottomArrows);

    return {
        legendWrapper: legendWrapper,
        legendItems: legendItems,
    };
};

export const plotNavigationArrows = (legendWrapper, legend, legendFormattingOptions, leftRightArrows, topBottomArrows) => {
    if ((legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight" || legendFormattingOptions.legendPosition === "BottomLeft" || legendFormattingOptions.legendPosition === "BottomCenter" || legendFormattingOptions.legendPosition === "BottomRight") && leftRightArrows) {
        rightArrow = legendWrapper
            .append("p").attr("id", "rightArrow").style("position", "absolute").style("right", `0px`).style("color", "#808080").text("▶")
            .style("z-index", 1111111111)
            .style("font-size", Math.max(legendFormattingOptions.fontSize * 1.2, 11) + "px")
            .on("click", () => {
                const legendWrapperNode = legendWrapper.node();
                legendWrapperNode.scrollLeft += 50;

                const legendNode = legend.node();
                if (legendNode.clientWidth - legendWrapperNode.scrollLeft <= legendWrapperNode.clientWidth) {
                    rightArrow.style("display", "none");
                } else {
                    rightArrow.style("display", "block");
                }

                if (legendWrapperNode.scrollLeft == 0) {
                    leftArrow.style("display", "none");
                } else {
                    leftArrow.style("display", "block");
                    legendWrapperXOffset = leftArrow.node().clientWidth;
                    legendWrapper
                        .style("width", `calc(100% - ${(legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight" ? iconsBar.clientWidth : 0) + legendFormattingOptions.fontSize * 1.6 * 2 - legendWrapperXOffset}px`)
                        .style("margin-left", `${legendWrapperXOffset}px`);
                }
            });

        leftArrow = legendWrapper
            .append("p").attr("id", "leftArrow").style("position", "absolute").style("left", `0px`).style("color", "#808080").text("◀")
            .style("z-index", 1111111111)
            .style("font-size", Math.max(legendFormattingOptions.fontSize * 1.2, 11) + "px")
            .style("display", legendWrapper.node().scrollLeft == 0 ? "none" : "block")
            .on("click", () => {
                const legendWrapperNode = legendWrapper.node();
                const legendNode = legend.node();
                legendWrapperNode.scrollLeft -= 50;

                if (legendWrapperNode.scrollLeft == 0) {
                    leftArrow.style("display", "none");
                } else {
                    leftArrow.style("display", "block");

                    legendWrapperXOffset = leftArrow.node().clientWidth;
                    if (legendWrapperXOffset) {
                        legendWrapper
                            .style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6 - legendWrapperXOffset}px`)
                            .style("margin-left", legendWrapperXOffset);
                    } else {
                        legendWrapper.style("margin-left", "0px");
                    }
                }

                if (legendNode.clientWidth - legendWrapperNode.scrollLeft <= legendWrapperNode.clientWidth) {
                    rightArrow.style("display", "none");
                } else {
                    rightArrow.style("display", "block");
                }
            });

        if (legendFormattingOptions.legendPosition === "TopLeft" || legendFormattingOptions.legendPosition === "TopCenter" || legendFormattingOptions.legendPosition === "TopRight") {
            rightArrow.style("top", "0px");
            leftArrow.style("top", "0px");
        } else if (legendFormattingOptions.legendPosition === "BottomLeft" || legendFormattingOptions.legendPosition === "BottomCenter" || legendFormattingOptions.legendPosition === "BottomRight") {
            rightArrow.style("bottom", "0px");
            leftArrow.style("bottom", "0px");
        }
    } else if ((legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom" || legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") && topBottomArrows) {
        bottomArrow = legendWrapper
            .append("p").attr("id", "bottomArrow").style("position", "absolute").style("bottom", `0px`).style("color", "#808080").text("▼")
            .style("font-size", Math.max(legendFormattingOptions.fontSize * 1.2, 11) + "px")
            .on("click", () => {
                const legendWrapperNode = legendWrapper.node();
                legendWrapperNode.scrollTop += 50;

                const legendNode = legend.node();
                if (legendNode.clientHeight - legendWrapperNode.scrollTop <= legendWrapperNode.clientHeight) {
                    bottomArrow.style("display", "none");
                } else {
                    bottomArrow.style("display", "block");
                }

                if (legendWrapperNode.scrollTop == 0) { topArrow.style("display", "none"); } else { topArrow.style("display", "block"); }
            });

        topArrow = legendWrapper
            .append("p").attr("id", "topArrow").style("position", "absolute").style("top", `0px`).style("color", "#808080").text("▲")
            .style("font-size", Math.max(legendFormattingOptions.fontSize * 1.2, 11) + "px")
            .style("display", legendWrapper.node().scrollTop == 0 ? "none" : "block")
            .on("click", () => {
                const legendWrapperNode = legendWrapper.node();
                const legendNode = legend.node();
                legendWrapperNode.scrollTop -= 50;

                if (legendNode.clientHeight - legendWrapperNode.scrollTop <= legendWrapperNode.clientHeight) {
                    bottomArrow.style("display", "none");
                } else {
                    bottomArrow.style("display", "block");
                }

                if (legendWrapperNode.scrollTop == 0) { topArrow.style("display", "none"); } else { topArrow.style("display", "block") }
            });

        if (legendFormattingOptions.legendPosition === "LeftTop" || legendFormattingOptions.legendPosition === "LeftCenter" || legendFormattingOptions.legendPosition === "LeftBottom") {
            bottomArrow.style("left", `${legend.attr("width") / 2}px`);
            topArrow.style("left", `${legend.attr("width") / 2}px`);
        } else if (legendFormattingOptions.legendPosition === "RightTop" || legendFormattingOptions.legendPosition === "RightCenter" || legendFormattingOptions.legendPosition === "RightBottom") {
            bottomArrow.style("right", `${legend.attr("width") / 2}px`);
            topArrow.style("right", `${legend.attr("width") / 2}px`);
        }
    }
};

export const addEllipsisToLegends = (textNodes, legendFormattingOptions, circleRadius, isLegendTitle = false) => {
    let legendContainerWidth = legend.node().getBoundingClientRect().width;
    legendContainerWidth -= legendContainerWidth * 0.2;

    textNodes.each((d, i, nodes) => {
        const boundingRect = nodes[i].getBoundingClientRect();
        if (boundingRect.width + boundingRect.x > legendContainerWidth) {
            const textProperties = {
                text: nodes[i].textContent,
                fontFamily: legendFormattingOptions.fontFamily,
                fontSize: legendFormattingOptions.fontSize + "px",
            };
            const availableWidth = legendContainerWidth - (isLegendTitle ? 0 : circleRadius * 2);
            const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, availableWidth);
            d3.select(nodes[i]).text(truncatedText);
        }
    });
};

export const positionLabels = (legendFormattingOptions, mainContainer, iconsBar, leftRightArrows, topBottomArrows, bottomSpace: number) => {
    d3.select(".visual")
        .on("mouseover", () => {
            if (
                iconsBar &&
                /* leftRightArrows && */
                (legendFormattingOptions.legendPosition == "TopLeft" ||
                    legendFormattingOptions.legendPosition == "TopCenter" ||
                    legendFormattingOptions.legendPosition == "TopRight")
            ) {
                if (legendWrapperXOffset || legendFormattingOptions.legendPosition == "TopRight") {
                    legendWrapper.style(
                        "width",
                        `calc(100% - ${iconsBar.clientWidth + legendFormattingOptions.fontSize * 1.6 * 2 - legendWrapperXOffset}px`,
                    )
                        .style("margin-left", `${legendWrapperXOffset}px`);
                } else if (leftRightArrows) {
                    legendWrapper.style(
                        "width",
                        `calc(100% - ${iconsBar.clientWidth + legendFormattingOptions.fontSize * 1.6}px)`,
                    );
                    legendWrapper.style("margin-left", "0px");
                }

                if (rightArrow) {
                    rightArrow.style("right", `${iconsBar.clientWidth}px`);
                }
            } else if (
                (iconsBar /*  && topBottomArrows */ && legendFormattingOptions.legendPosition === "RightTop") ||
                legendFormattingOptions.legendPosition === "RightCenter" ||
                legendFormattingOptions.legendPosition === "RightBottom"
            ) {
                if (
                    legend.node().getBoundingClientRect().y <=
                    iconsBar.getBoundingClientRect().y + iconsBar.getBoundingClientRect().height
                ) {
                    legendWrapper
                        .style("height", `calc(100% - ${iconsBar.clientHeight + legendFormattingOptions.fontSize * 1.6 * 2}px)`)
                        .style("margin-top", `${iconsBar.clientHeight + legendFormattingOptions.fontSize * 1.6}px`);
                    if (topArrow) {
                        topArrow.style("top", `${iconsBar.clientHeight}px`);
                    }
                }
            }
        })
        .on("mouseout", () => {
            if (
                iconsBar &&
                /* leftRightArrows && */
                (legendFormattingOptions.legendPosition == "TopLeft" ||
                    legendFormattingOptions.legendPosition == "TopCenter" ||
                    legendFormattingOptions.legendPosition == "TopRight")
            ) {
                legendWrapper.style("width", `calc(100% - ${legendFormattingOptions.fontSize * 1.6}px)`);
                if (rightArrow) {
                    rightArrow.style("right", `${legendFormattingOptions.fontSize / 2}px`);
                }
            } else if (
                (iconsBar /* && topBottomArrows */ && legendFormattingOptions.legendPosition === "RightTop") ||
                legendFormattingOptions.legendPosition === "RightCenter" ||
                legendFormattingOptions.legendPosition === "RightBottom" ||
                legendFormattingOptions.legendPosition === "LeftTop" ||
                legendFormattingOptions.legendPosition === "LeftCenter" ||
                legendFormattingOptions.legendPosition === "LeftBottom"
            ) {
                legendWrapper
                    .style("height", `calc(100% - ${topBottomArrows ? legendFormattingOptions.fontSize * 1.6 * 2 : 5}px)`)
                    .style("margin-top", `${legendFormattingOptions.fontSize * 1.6}px`);
                if (topArrow) {
                    topArrow.style("top", `0px`);
                }
            }
        });

    applyStylesToWrapper(legendFormattingOptions, mainContainer, bottomSpace)
};

export const applyStylesToWrapper = (legendFormattingOptions, mainContainer, bottomSpace: number) => {
    switch (legendFormattingOptions.legendPosition) {
        case "TopLeft":
            legendWrapper.style("align-items", "flex-start");
            break;
        case "BottomLeft":
            legendWrapper
                .style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight - bottomSpace}px`)
                .style("align-items", "flex-start");
            break;
        case "TopCenter":
            if (mainContainer.clientWidth < legend.node().clientWidth) {
                legendWrapper.style("align-items", "flex-start");
            } else {
                legendWrapper.style("align-items", "center");
            }
            break;
        case "BottomCenter":
            legendWrapper.style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight - bottomSpace}px`);
            if (mainContainer.clientWidth < legend.node().clientWidth) {
                legendWrapper.style("align-items", "flex-start");
            } else {
                legendWrapper.style("align-items", "center");
            }
            break;
        case "TopRight":
            if (mainContainer.clientWidth < legend.node().clientWidth) {
                legendWrapper.style("align-items", "flex-start");
            } else {
                legendWrapper.style("align-items", "flex-end");
            }
            break;
        case "BottomRight":
            legendWrapper.style("margin-top", `${mainContainer.clientHeight - legendWrapper.node().clientHeight - bottomSpace}px`);
            if (mainContainer.clientWidth < legend.node().clientWidth) {
                legendWrapper.style("align-items", "flex-start");
            } else {
                legendWrapper.style("align-items", "flex-end");
            }
            break;
        case "LeftTop":
            legendWrapper.style("align-items", "flex-start");
            break;
        case "LeftCenter":
            legendWrapper.style("align-items", () => {
                if (mainContainer.clientHeight < legend.node().clientHeight) {
                    return "flex-start";
                } else {
                    return "center";
                }
            });
            break;
        case "LeftBottom":
            legendWrapper.style("align-items", () => {
                if (mainContainer.clientHeight <= legend.node().clientHeight) {
                    return "flex-start";
                } else {
                    return "flex-end";
                }
            });
            break;
        case "RightTop":
            legendWrapper
                .style("align-items", "flex-start")
                .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
            break;
        case "RightCenter":
            legendWrapper
                .style("align-items", () => {
                    if (mainContainer.clientHeight < legend.node().clientHeight) {
                        return "flex-start";
                    } else {
                        return "center";
                    }
                })
                .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
            break;
        case "RightBottom":
            legendWrapper
                .style("align-items", () => {
                    if (mainContainer.clientHeight <= legend.node().clientHeight) {
                        return "flex-start";
                    } else {
                        return "flex-end";
                    }
                })
                .style("margin-left", `${mainContainer.clientWidth - legendWrapper.node().clientWidth}px`);
            break;
    }
}

export const getTranslateValues = (i, legendFormattingOptions) => {
    if (
        legendFormattingOptions.legendPosition === "TopLeft" ||
        legendFormattingOptions.legendPosition === "TopCenter" ||
        legendFormattingOptions.legendPosition === "TopRight" ||
        legendFormattingOptions.legendPosition === "BottomLeft" ||
        legendFormattingOptions.legendPosition === "BottomCenter" ||
        legendFormattingOptions.legendPosition === "BottomRight"
    ) {
        return `translate(${i * 20}, 0)`;
    } else if (
        legendFormattingOptions.legendPosition === "LeftTop" ||
        legendFormattingOptions.legendPosition === "LeftCenter" ||
        legendFormattingOptions.legendPosition === "LeftBottom" ||
        legendFormattingOptions.legendPosition === "RightTop" ||
        legendFormattingOptions.legendPosition === "RightCenter" ||
        legendFormattingOptions.legendPosition === "RightBottom"
    ) {
        return `translate(0, ${i * 20})`;
    }
};

export const clearLegends = () => {
    if (legendWrapper) {
        legendWrapper.selectAll("*").remove();
    } else {
        d3.select("div.legend-wrapper").selectAll("*").remove();
    }
};