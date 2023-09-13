import {select as d3Select, Selection} from "d3-selection";
import {
	IBehaviorOptions,
	IInteractiveBehavior,
	IInteractivityService,
	ISelectionHandler,
} from "powerbi-visuals-utils-interactivityutils/lib/interactivityBaseService";
import {SelectableDataPoint} from "powerbi-visuals-utils-interactivityutils/lib/interactivitySelectionService";
import {Visual} from "../visual";
import VisualAnnotations from "@truviz/viz-annotations/VisualAnnotations";
import {ILollipopChartRow} from "../model";

import ISelectionManager = powerbi.extensibility.ISelectionManager;
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export interface BehaviorOptions extends IBehaviorOptions<ILollipopChartRow> {
	lollipopSelection: D3Selection<SVGElement>;
	lineSelection: D3Selection<SVGElement>;
	legendItems: D3Selection<SVGElement>;
	clearCatcher: D3Selection<SVGElement>;
	interactivityService: IInteractivityService<SelectableDataPoint>;
	selectionManager: ISelectionManager;
	isHasSubcategories: boolean;
}

export class Behavior implements IInteractiveBehavior {
	private options: BehaviorOptions;
	private visualAnnotations: VisualAnnotations;

	public setVisualAnnotations(ref: VisualAnnotations): void {
		this.visualAnnotations = ref;
	}

	public bindEvents(options: BehaviorOptions, selectionHandler: ISelectionHandler): void {
		this.options = options;
		const visualAnnotations = this.visualAnnotations;
		const {lollipopSelection, lineSelection, legendItems, dataPoints, clearCatcher, isHasSubcategories, interactivityService} = options;

		const handleSelection = (ele: SVGElement, event: MouseEvent) => {
			const data: ILollipopChartRow = d3Select(ele).datum() as ILollipopChartRow;

			// if (visualAnnotations.isAnnotationScreenActivated) {
			//     visualAnnotations.onAnnotationNodeClick(event, data);
			// } else {
			//     if (onSliceClick) {
			//         onSliceClick(ele);
			//     }

			selectionHandler.handleSelection(data, event.ctrlKey);
			event.stopPropagation();
			// }
		};

		lollipopSelection.on("click", function (e) {
			handleSelection(this, e);
		});

		lineSelection.on("click", function (e) {
			handleSelection(this, e);
		});

		// if (legendItems) {
		//     legendItems.on("click", function (e) {
		//         const legendData: any = d3Select(this).datum();

		//         const categoryData = selection
		//             .filter((data) => legendData.data.name === data.category)
		//             .data();

		//         const groupByData = selection
		//             .filter((data) => legendData.data.name === data.groupBy)
		//             .data();

		//         if (!isHasSubcategories) {
		//             categoryData.forEach(d => {
		//                 selectionHandler.handleSelection(d, e.ctrlKey);
		//             })
		//         } else {
		//             groupByData.forEach(() => {
		//                 selectionHandler.handleSelection(groupByData, e.ctrlKey);
		//             })
		//         }

		//         e.stopPropagation();
		//     });
		// }

		// clearCatcher.on("click", () => {
		//     selectionHandler.handleClearSelection();
		//     this.renderSelection(false);
		// });
	}

	public renderSelection(hasSelection: boolean): void {
		const {lollipopSelection, lineSelection, dataPoints, legendItems, isHasSubcategories, selectionManager} = this.options;
		const isHasHighlights = dataPoints.some((d) => d.isHighlight);

		const handleOpacity = (dataPoint: ILollipopChartRow) => {
			const {selected, isHighlight} = dataPoint;
			let opacity = 1;
			if (isHasHighlights) {
				opacity = isHighlight ? 1 : 0.4;
			} else {
				opacity = hasSelection ? (selected ? 1 : 0.4) : 1;
				// return !isClearPreviousSelection && hasSelection ? (selected ? 1 : 0.4) : 1;
			}

			// if (legendItems) {
			//     legendItems
			//         .filter(function (legendDataPoint) { return isHasSubcategories ? legendDataPoint.data.name === dataPoint.groupBy : legendDataPoint.data.name === dataPoint.category })
			//         .style("opacity", opacity);
			// }

			return opacity;
		};

		lollipopSelection.attr("opacity", (dataPoint: ILollipopChartRow) => handleOpacity(dataPoint));
		// lineSelection.attr("opacity", (dataPoint: ILollipopChartRow) => handleOpacity(dataPoint));
	}
}

export const SetAndBindChartBehaviorOptions = (
	self: Visual,
	lollipopSelection: D3Selection<SVGElement>,
	lineSelection: D3Selection<SVGElement>,
	dataPoints: ILollipopChartRow[]
): void => {
	if (self.interactivityService) {
		// const nodeData = [];
		// const nodeSelection = lollipopSelection;
		// nodeSelection.each(function () {
		//     nodeData.push(d3Select(this).datum());
		// });

		// self.interactivityService.applySelectionStateToData(nodeData);

		const behaviorOptions: BehaviorOptions = {
			lollipopSelection: lollipopSelection,
			lineSelection: lineSelection,
			// legendItems: self.legends ? self.legends.legendItems : undefined,
			legendItems: undefined,
			dataPoints: dataPoints,
			clearCatcher: d3Select(self.svg),
			interactivityService: self.interactivityService,
			selectionManager: self.selectionManager,
			behavior: self.behavior,
			isHasSubcategories: self.isHasSubcategories,
		};
		self.interactivityService.bind(behaviorOptions);
	}
};
