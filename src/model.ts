import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export interface ILollipopChartRow {
	city: string;
	value1: number;
	value2: number;
	identity?: ISelectionId;
	selected: boolean;
	isHighlight: boolean;
	tooltipFields?: TooltipData[];
	sortId?: number;
	subCategories: IChartSubCategory[];
	styles: {
		circle1: IChartCircleStyles;
		circle2: IChartCircleStyles;
		line: {color: string};
	};
}

export interface IChartCircleStyles {
	fillColor: string;
	strokeColor: string;
}

export interface IChartSubCategory {
	category: string;
	value1: number;
	value2: number;
	identity?: ISelectionId;
	tooltipFields?: TooltipData[];
	styles: {
		pie1: {color: string};
		pie2: {color: string};
	};
}

export interface VisualTooltipDataItem {
	displayName: string;
	value: string;
	color?: string;
	header?: string;
	opacity?: string;
}

export interface TooltipData {
	displayName: string;
	value: string;
	color?: string;
}
