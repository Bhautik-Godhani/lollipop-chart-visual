import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import { DataValuesType } from "./enum";
import { IPatternProps } from "./visual-settings.interface";

export interface ILollipopChartRow {
	uid: string;
	category: string;
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
		line: { color: string };
	};
	valueType?: DataValuesType;
	defaultValue?: number;
	pattern?: IPatternProps;
	imageDataUrl?: string;
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
	selected: boolean;
	isHighlight: boolean;
	tooltipFields?: TooltipData[];
	styles: {
		pie1: { color: string };
		pie2: { color: string };
	};
	valueType?: DataValuesType;
	defaultValue?: number,
	sliceWidth?: number,
	sliceHeight?: number,
	pattern?: IPatternProps
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

export interface IBrushLollipopChartData {
	category: string;
	value1: number; value2: number;
	styles: {
		circle1: {
			fillColor: string
		},
		circle2: {
			fillColor: string
		}
	}
}
