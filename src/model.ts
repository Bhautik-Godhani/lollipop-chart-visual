import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;
import { DataValuesType, EDataRolesName } from "./enum";
import { IPatternProps } from "./visual-settings.interface";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

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
	valueType?: DataValuesType;
	defaultValue?: number;
	pattern?: IPatternProps;
	imageDataUrl1?: string;
	imageDataUrl2?: string;
	raceChartKey?: string;
	raceChartDataLabel?: string;
	positions: { dataLabel1X: number, dataLabel1Y: number, dataLabel2X: number, dataLabel2Y: number };
	errorBar?: IErrorBarValue;
	errorBar1: IErrorBarValue;
	errorBar2: IErrorBarValue;
	extraLabel1: string;
	extraLabel2: string;
	data1Label: string;
	data2Label: string;
}

export interface IErrorBarValue {
	upperBoundValue?: number;
	lowerBoundValue?: number;
	boundsTotal?: number;
	tooltipUpperBoundValue?: string;
	tooltipLowerBoundValue?: string;
	labelUpperBoundValue?: string;
	labelLowerBoundValue?: string;
}

export interface IChartSubCategory {
	category: string;
	parentCategory: string;
	value1: number;
	value2: number;
	identity?: ISelectionId;
	selected: boolean;
	isHighlight: boolean;
	tooltipFields?: TooltipData[];
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

export interface IValueFormatter {
	format: string;
	formatter: valueFormatter.IValueFormatter;
	role?: EDataRolesName;
}