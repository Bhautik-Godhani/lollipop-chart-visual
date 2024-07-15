/* eslint-disable max-lines-per-function */
import { select as d3Select, select, Selection } from "d3-selection";
import {
	IBehaviorOptions,
	IInteractiveBehavior,
	IInteractivityService,
	ISelectionHandler,
} from "powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService";
import { SelectableDataPoint } from "powerbi-visuals-utils-interactivityutils/lib/interactivitySelectionService";
import { Visual } from "../visual";
import VisualAnnotations from "@truviz/viz-annotations/dist/VisualAnnotations";
import { ILollipopChartRow } from "../model";

import ISelectionManager = powerbi.extensibility.ISelectionManager;
import { CircleType, DataValuesType, PieType } from "../enum";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export interface BehaviorOptions extends IBehaviorOptions<ILollipopChartRow> {
	visual: Visual,
	lollipopSelection: D3Selection<SVGElement>;
	lineSelection: D3Selection<SVGElement>;
	legendItems: D3Selection<SVGElement>;
	clearCatcher: D3Selection<SVGElement>;
	interactivityService: IInteractivityService<SelectableDataPoint>;
	selectionManager: ISelectionManager;
	isHasSubcategories: boolean;
	othersCategoriesList: ILollipopChartRow[],
	getTooltipCategoryText: (text: string, toUpperCase?: boolean, isSubcategory?: boolean) => string;
	onLollipopClick: (...any) => any;
}

export class Behavior implements IInteractiveBehavior {
	private options: BehaviorOptions;
	private visualAnnotations: VisualAnnotations;

	public setVisualAnnotations(ref: any): void {
		this.visualAnnotations = ref;
	}

	public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void {
		this.options = options;
		const visualAnnotations = this.visualAnnotations;
		const { lollipopSelection, lineSelection, clearCatcher, onLollipopClick, legendItems, isHasSubcategories, visual, getTooltipCategoryText } = options;

		const handleSelection = (ele: SVGElement, event: MouseEvent) => {
			const data: ILollipopChartRow = d3Select(ele).datum() as ILollipopChartRow;
			if (visualAnnotations.isAnnotationScreenActivated) {
				visualAnnotations.onAnnotationNodeClick(event, data);
			} else {
				if (isHasSubcategories) {
					if (data.parentCategory.includes("Others")) {
						const othersData = data.othersIdentity.map(d => ({ selected: false, identity: d }));
						selectionHandler.handleSelection(othersData, event.ctrlKey);
					} else {
						selectionHandler.handleSelection(data, event.ctrlKey);
					}
				} else {
					if (data.category.includes("Others")) {
						const othersData = data.othersIdentity.map(d => ({ selected: false, identity: d }));
						selectionHandler.handleSelection(othersData, event.ctrlKey);
					} else {
						selectionHandler.handleSelection(data, event.ctrlKey);
					}
				}

				event.stopPropagation();
			}
		};

		lollipopSelection.on("click", function (e) {
			onLollipopClick(d3Select(this));

			if (legendItems) {
				legendItems.style("opacity", 1);
			}

			const clickedElement = e.target;

			if (clickedElement.id === CircleType.Circle1) {
				select(this)
					.datum((d: any) => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1 }
					})
				handleSelection(this, e);
			} else if (clickedElement.id === CircleType.Circle2) {
				select(this)
					.datum((d: any) => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2 }
					})
				handleSelection(this, e);
			} else if (this.id === PieType.Pie1) {
				const bBox = (select(this).node() as SVGSVGElement).getBBox();
				select(this)
					.datum((d: any) => {
						return { ...d, valueType: DataValuesType.Value1, defaultValue: d.value1, sliceWidth: bBox.width, sliceHeight: bBox.height }
					})
				handleSelection(this, e);
			} else if (this.id === PieType.Pie2) {
				const bBox = (select(this).node() as SVGSVGElement).getBBox();
				select(this)
					.datum((d: any) => {
						return { ...d, valueType: DataValuesType.Value2, defaultValue: d.value2, sliceWidth: bBox.width, sliceHeight: bBox.height }
					})
				handleSelection(this, e);
			} else {
				handleSelection(this, e);
			}
		});

		lineSelection.on("click", function (e) {
			handleSelection(this, e);
		});

		if (legendItems) {
			legendItems.on("click", function (e) {
				const legendData: any = d3Select(this).datum();
				const categoryData = lollipopSelection
					.filter((data) => legendData.data.name.toString() === getTooltipCategoryText.bind(visual)(data.category.toString(), false, isHasSubcategories))
					.data();

				const groupByData = lollipopSelection
					.filter((data) => {
						return legendData.data.name.toString() === getTooltipCategoryText.bind(visual)(data.category.toString(), false, isHasSubcategories)
					})
					.data();

				if (!isHasSubcategories) {
					categoryData.forEach(d => {
						selectionHandler.handleSelection(d, e.ctrlKey);
					})
				} else {
					// groupByData.forEach(() => {
					selectionHandler.handleSelection(groupByData, e.ctrlKey);
					// })
				}

				e.stopPropagation();
			});
		}

		clearCatcher.on("click", () => {
			selectionHandler.handleClearSelection();
			this.renderSelection(false);
		});
	}

	public renderSelection(hasSelection: boolean): void {
		const { lollipopSelection, dataPoints, interactivityService, legendItems, getTooltipCategoryText, visual, isHasSubcategories } = this.options;
		const isHasHighlights = dataPoints.some((d) => d.isHighlight);

		if (legendItems) {
			if (!hasSelection) {
				legendItems.style("opacity", 1);
			} else {
				legendItems.style("opacity", 0.4);
			}

			const selectedDataPoints = dataPoints.filter(d => d.selected || d.isHighlight);
			selectedDataPoints.forEach(d => {
				legendItems
					.filter(function (legendDataPoint) { return legendDataPoint.data.name.toString() === getTooltipCategoryText.bind(visual)(d.category.toString(), false, isHasSubcategories) })
					.style("opacity", d.selected || d.isHighlight ? 1 : 0.4);
			});
		}

		const handleOpacity = (dataPoint: ILollipopChartRow) => {
			interactivityService.applySelectionStateToData([dataPoint] as any);

			const selected = dataPoint.selected;
			const isHighlight = dataPoint.isHighlight;
			let opacity = 1;

			if (isHasHighlights) {
				opacity = isHighlight ? 1 : 0.4;
			} else {
				opacity = hasSelection ? (selected ? 1 : 0.4) : 1;
			}

			return opacity;
		};

		lollipopSelection.attr("opacity", (dataPoint: ILollipopChartRow) => handleOpacity(dataPoint));
	}
}

export const SetAndBindChartBehaviorOptions = (
	self: Visual,
	lollipopSelection: D3Selection<SVGElement>,
	lineSelection: D3Selection<SVGElement>,
	onLollipopClick: (...any) => any
): void => {
	if (self.interactivityService) {
		const nodeData = [];
		const nodeSelection = lollipopSelection.filter((d) => d.identity);
		nodeSelection.each(function () {
			nodeData.push(d3Select(this).datum());
		});

		self.interactivityService.applySelectionStateToData(nodeData);

		const behaviorOptions: BehaviorOptions = {
			visual: self,
			lollipopSelection: lollipopSelection.filter((d) => d.identity),
			lineSelection: lineSelection,
			legendItems: self.legends ? self.legends.legendItems : undefined,
			dataPoints: nodeData,
			clearCatcher: self.svg,
			interactivityService: self.interactivityService,
			selectionManager: self.selectionManager,
			behavior: self.behavior,
			isHasSubcategories: self.isHasSubcategories,
			othersCategoriesList: self.othersCategoriesList,
			onLollipopClick,
			getTooltipCategoryText: self.getTooltipCategoryText
		};
		self.interactivityService.bind(behaviorOptions);
	}
};
