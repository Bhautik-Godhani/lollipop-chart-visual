import { VisualSettings } from "./settings";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
	public static GET(): EnumerateSectionType[] {
		return [
			getLicenseSelection(),
			getVisualGeneralSettingsSelection(),
			getConfigSelection(),
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
			getBrushAndZoomAreaConfigSelection(),
			getErrorBarsSelection(),
			getIBCSSelection(),
			dynamicDeviationSelection(),
			getTrendLinesSelection(),
			cutAndClipAxisSelection(),
			getSmallMultiplesSelection(),
			getTemplatesSelection()
		];
	}
}

function getLicenseSelection(): EnumerateSectionType {
	return {
		name: "license",
		isShow: false,
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
				isShow: false,
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

function getConfigSelection(): EnumerateSectionType {
	return {
		name: "config",
		isShow: false,
		properties: [
			{
				name: "importExportTheme",
				isShow: false,
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
			{
				name: "isLegendAutoChanged",
				isShow: false,
			},
		],
	};
}

function getNumberFormattingSelection(): EnumerateSectionType {
	return {
		name: 'numberFormatting',
		isShow: true,
		properties: [
			{
				name: 'show',
				isShow: true
			},
			{
				name: 'decimalSeparator',
				isShow: true
			},
			{
				name: 'thousandsSeparator',
				isShow: true
			},
			{
				name: 'decimalPlaces',
				isShow: true
			},
			{
				name: 'scaling',
				isShow: true
			},
			{
				name: 'prefix',
				isShow: true
			},
			{
				name: 'suffix',
				isShow: true
			},
			{
				name: 'scalingLabel',
				isShow: true
			},
			{
				name: 'thousandScalingLabel',
				isShow: (settings: VisualSettings) => settings.numberFormatting.scalingLabel,
			},
			{
				name: 'millionScalingLabel',
				isShow: (settings: VisualSettings) => settings.numberFormatting.scalingLabel,
			},
			{
				name: 'billionScalingLabel',
				isShow: (settings: VisualSettings) => settings.numberFormatting.scalingLabel,
			},
			{
				name: 'trillionScalingLabel',
				isShow: (settings: VisualSettings) => settings.numberFormatting.scalingLabel,
			},
			{
				name: "semanticFormatting",
				isShow: true,
			},
			{
				name: "negativeFormat",
				isShow: (settings: VisualSettings) => settings.numberFormatting.semanticFormatting,
			},
			{
				name: "positiveFormat",
				isShow: (settings: VisualSettings) => settings.numberFormatting.semanticFormatting,
			},
		]
	}
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
			{
				name: 'beforeIBCSSettings',
				isShow: false
			},
			{
				name: 'beforeTemplateSettings',
				isShow: false
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

function getTrendLinesSelection(): EnumerateSectionType {
	return {
		name: "trendLinesConfig",
		isShow: false,
		properties: [
			{
				name: "trendLinesSettings",
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

function getErrorBarsSelection(): EnumerateSectionType {
	return {
		name: "errorBarsConfig",
		isShow: false,
		properties: [
			{
				name: "errorBarsSettings",
				isShow: true,
			},
		],
	};
}

function getIBCSSelection(): EnumerateSectionType {
	return {
		name: "IBCSConfig",
		isShow: false,
		properties: [
			{
				name: "IBCSSettings",
				isShow: true,
			},
		],
	};
}

function dynamicDeviationSelection(): EnumerateSectionType {
	return {
		name: "dynamicDeviationConfig",
		isShow: false,
		properties: [
			{
				name: "dynamicDeviationSettings",
				isShow: true,
			}
		]
	}
}

function getSmallMultiplesSelection(): EnumerateSectionType {
	return {
		name: "smallMultiplesConfig",
		isShow: false,
		properties: [
			{
				name: "smallMultiplesSettings",
				isShow: true,
			},
		],
	};
}

function cutAndClipAxisSelection(): EnumerateSectionType {
	return {
		name: "cutAndClipAxisConfig",
		isShow: false,
		properties: [
			{
				name: "cutAndClipAxisSettings",
				isShow: true,
			},
		],
	};
}

function getTemplatesSelection(): EnumerateSectionType {
	return {
		name: "templatesConfig",
		isShow: false,
		properties: [
			{
				name: "templatesSettings",
				isShow: true,
			},
		],
	};
}