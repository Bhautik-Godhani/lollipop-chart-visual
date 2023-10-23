import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { VisualSettings } from "./settings";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
	public static GET(): EnumerateSectionType[] {
		return [
			getLicenseSelection(),
			getVisualGeneralSettingsSelection(),
			getChartConfigSelection(),
			getMarkerConfigSelection(),
			getDataColorsConfigSelection(),
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
			getFooterSelection(),
			getEditorSelection(),
			getPatternSelection(),
			getRaceChartSelection(),
			getReferenceLinesSelection(),
			getBrushAndZoomAreaConfigSelection()
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
		isShow: false,
		properties: [
			{
				name: "chartSettings",
				isShow: true,
			},
		],
	};
}

function getMarkerConfigSelection(): EnumerateSectionType {
	return {
		name: "markerConfig",
		isShow: false,
		properties: [
			{
				name: "markerSettings",
				isShow: true,
			},
		],
	};
}


function getDataColorsConfigSelection(): EnumerateSectionType {
	return {
		name: "dataColorsConfig",
		isShow: false,
		properties: [
			{
				name: "dataColorsSettings",
				isShow: true,
			},
		],
	};
}

function getLineConfigSelection(): EnumerateSectionType {
	return {
		name: "lineConfig",
		isShow: false,
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
		isShow: false,
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
		isShow: false,
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
		isShow: false,
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
		isShow: false,
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
		isShow: false,
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
		isShow: false,
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
		name: "Legend",
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
		name: "Number Formatting",
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

function getFooterSelection(): EnumerateSectionType {
	return {
		name: 'footer',
		isShow: true,
		properties: [
			{
				name: 'show',
				isShow: true
			},
			{
				name: 'text',
				isShow: true
			},
			{
				name: 'webURL',
				isShow: true
			},
			{
				name: 'color',
				isShow: true
			},
			{
				name: 'fontSize',
				isShow: true
			},
			{
				name: 'fontFamily',
				isShow: true
			},
			{
				name: 'isShowDivider',
				isShow: true
			},
			{
				name: 'dividerColor',
				isShow: (settings: VisualSettings) => settings.footer.isShowDivider,
			},
			{
				name: 'dividerThickness',
				isShow: (settings: VisualSettings) => settings.footer.isShowDivider,
			},
			{
				name: 'backgroundColor',
				isShow: true
			},
			{
				name: 'backgroundTransparency',
				isShow: true
			},
			{
				name: 'alignment',
				isShow: true
			},
		]
	}
}

function getEditorSelection(): EnumerateSectionType {
	return {
		name: 'editor',
		isShow: false,
		properties: [
			{
				name: 'conditionalFormatting',
				isShow: true
			},
			{
				name: 'annotations',
				isShow: true
			},
		]
	}
}

function getPatternSelection(): EnumerateSectionType {
	return {
		name: "patternConfig",
		isShow: false,
		properties: [
			{
				name: "patternSettings",
				isShow: true,
			},
		],
	};
}

function getRaceChartSelection(): EnumerateSectionType {
	return {
		name: "raceChartConfig",
		isShow: false,
		properties: [
			{
				name: "raceChartSettings",
				isShow: true,
			},
		],
	};
}

function getReferenceLinesSelection(): EnumerateSectionType {
	return {
		name: "referenceLinesConfig",
		isShow: false,
		properties: [
			{
				name: "referenceLinesSettings",
				isShow: true,
			},
		],
	};
}

function getBrushAndZoomAreaConfigSelection(): EnumerateSectionType {
	return {
		name: "brushAndZoomAreaConfig",
		isShow: false,
		properties: [
			{
				name: "brushAndZoomAreaSettings",
				isShow: true,
			},
		],
	};
}