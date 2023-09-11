import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import {VisualSettings} from "./settings";
import {EnumerateSectionType} from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
	public static GET(): EnumerateSectionType[] {
		return [
			getLicenseSelection(),
			getVisualGeneralSettingsSelection(),
			getChartConfigSelection(),
			getDataColorsConfigSelection(),
			getCircleConfigSelection(),
			getLineConfigSelection(),
			getDataLabelsConfigSelection(),
			getGridLinesConfigSelection(),
			getRankingConfigSelection(),
			getSortingConfigSelection(),
			getXAxisConfigSelection(),
			getYAxisConfigSelection(),
			getLegendSelection(),
			getNumberFormattingSelection(),
			getShowBucketConfigSelection(),
		];
	}
}

function getLicenseSelection(): EnumerateSectionType {
	return {
		name: "license",
		isShow: true,
		properties: [
			{
				name: "purchased",
				isShow: true,
			},
			{
				name: "customer",
				isShow: true,
			},
			{
				name: "key",
				isShow: true,
			},
		],
	};
}

function getVisualGeneralSettingsSelection(): EnumerateSectionType {
	return {
		name: "visualGeneralSettings",
		isShow: true,
		properties: [
			{
				name: "darkMode",
				isShow: true,
			},
			{
				name: "summaryTableToggle",
				isShow: true,
			},
			{
				name: "annotationsToggle",
				isShow: true,
			},
			{
				name: "advancedSettingsToggle",
				isShow: true,
			},
		],
	};
}

function getChartConfigSelection(): EnumerateSectionType {
	return {
		name: "chartConfig",
		isShow: true,
		properties: [
			{
				name: "chartSettings",
				isShow: true,
			},
		],
	};
}

function getDataColorsConfigSelection(): EnumerateSectionType {
	return {
		name: "dataColorsConfig",
		isShow: true,
		properties: [
			{
				name: "dataColorsSettings",
				isShow: true,
			},
		],
	};
}

function getCircleConfigSelection(): EnumerateSectionType {
	return {
		name: "circleConfig",
		isShow: true,
		properties: [
			{
				name: "circleSettings",
				isShow: true,
			},
		],
	};
}

function getLineConfigSelection(): EnumerateSectionType {
	return {
		name: "lineConfig",
		isShow: true,
		properties: [
			{
				name: "lineSettings",
				isShow: true,
			},
		],
	};
}

function getDataLabelsConfigSelection(): EnumerateSectionType {
	return {
		name: "dataLabelsConfig",
		isShow: true,
		properties: [
			{
				name: "dataLabelsSettings",
				isShow: true,
			},
		],
	};
}

function getGridLinesConfigSelection(): EnumerateSectionType {
	return {
		name: "gridLinesConfig",
		isShow: true,
		properties: [
			{
				name: "gridLinesSettings",
				isShow: true,
			},
		],
	};
}

function getRankingConfigSelection(): EnumerateSectionType {
	return {
		name: "rankingConfig",
		isShow: true,
		properties: [
			{
				name: "rankingSettings",
				isShow: true,
			},
		],
	};
}

function getSortingConfigSelection(): EnumerateSectionType {
	return {
		name: "sortingConfig",
		isShow: true,
		properties: [
			{
				name: "sorting",
				isShow: true,
			},
		],
	};
}

function getXAxisConfigSelection(): EnumerateSectionType {
	return {
		name: "xAxisConfig",
		isShow: true,
		properties: [
			{
				name: "xAxisSettings",
				isShow: true,
			},
		],
	};
}

function getYAxisConfigSelection(): EnumerateSectionType {
	return {
		name: "yAxisConfig",
		isShow: true,
		properties: [
			{
				name: "yAxisSettings",
				isShow: true,
			},
		],
	};
}

function getLegendSelection(): EnumerateSectionType {
	return {
		name: "legend",
		isShow: true,
		properties: [
			{
				name: "show",
				isShow: true,
			},
			{
				name: "legendPosition",
				isShow: true,
			},
			{
				name: "showTitle",
				isShow: true,
			},
			{
				name: "legendTitle",
				isShow: true,
			},
			{
				name: "legendColor",
				isShow: true,
			},
			{
				name: "fontSize",
				isShow: true,
			},
			{
				name: "fontFamily",
				isShow: true,
			},
		],
	};
}

function getNumberFormattingSelection(): EnumerateSectionType {
	return {
		name: "numberFormatting",
		isShow: true,
		properties: [
			{
				name: "show",
				isShow: true,
			},
			{
				name: "decimalSeparator",
				isShow: true,
			},
			{
				name: "thousandsSeparator",
				isShow: true,
			},
			{
				name: "decimalPlaces",
				isShow: true,
			},
			{
				name: "scaling",
				isShow: true,
			},
			{
				name: "prefix",
				isShow: true,
			},
			{
				name: "suffix",
				isShow: true,
			},
			{
				name: "scalingLabel",
				isShow: true,
			},
			{
				name: "thousandScalingLabel",
				isShow: true,
			},
			{
				name: "millionScalingLabel",
				isShow: true,
			},
			{
				name: "billionScalingLabel",
				isShow: true,
			},
			{
				name: "trillionScalingLabel",
				isShow: true,
			},
			{
				name: "semanticFormatting",
				isShow: true,
			},
			{
				name: "negativeFormat",
				isShow: true,
			},
			{
				name: "negativeColor",
				isShow: true,
			},
			{
				name: "positiveFormat",
				isShow: true,
			},
			{
				name: "positiveColor",
				isShow: true,
			},
		],
	};
}

function getShowBucketConfigSelection(): EnumerateSectionType {
	return {
		name: "showBucketConfig",
		isShow: false,
		properties: [
			{
				name: "showBucket",
				isShow: true,
			},
		],
	};
}
