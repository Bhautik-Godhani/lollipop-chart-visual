const visualPath = "../";

const sectionKVPair = [
	{ license: "PowerVIZ License" },
	{ visualGeneralSettings: "Visual General Settings" },
	{ chartConfig: "Chart Configuration" },
	{ markerConfig: "Marker Configuration" },
	{ dataColorsConfig: "DataColors Configuration" },
	{ lineConfig: "Line Configuration" },
	{ dataLabelsConfig: "DataLabels Configuration" },
	{ gridLinesConfig: "GridLines Configuration" },
	{ rankingConfig: "Ranking Configuration" },
	{ sortingConfig: "Sorting" },
	{ xAxisConfig: "X Axis Configuration" },
	{ yAxisConfig: "Y Axis Configuration" },
	{ legend: "Legend" },
	{ numberFormatting: "Number Formatting" },
	{ showBucketConfig: "Show Bucket" },
	{ patternConfig: "Pattern Configuration" },
	{ footer: "Footer" },
	{ editor: "Editor" },
	{ brushAndZoomAreaConfig: "Brush And Zoom Area" },
	{ raceChartConfig: "Race Chart Configuration" },
	{ referenceLinesConfig: "Reference Lines Configuration" },
	{ errorBarsConfig: "Error Bars Configuration" },
	{ IBCSConfig: "IBCS Configuration" },
	{ dynamicDeviationConfig: "Dynamic Deviation Configuration" },
];

const formatTab = {
	license: [
		{
			technicalName: "purchased",
			displayName: "",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "customer",
			displayName: "Licensed To",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "key",
			displayName: "License",
			type: "text",
			defaultValue: "",
		},
	],
	visualGeneralSettings: [
		{
			technicalName: "darkMode",
			displayName: "Dark Mode",
			type: "bool",
			description: "",
			defaultValue: false,
		},
		{
			technicalName: "summaryTableToggle",
			displayName: "Grid View",
			type: "bool",
			description: "",
			defaultValue: "true",
		},
		{
			technicalName: "annotationsToggle",
			displayName: "Annotations",
			type: "bool",
			description: "",
			defaultValue: "true",
		},
		{
			technicalName: "advancedSettingsToggle",
			displayName: "Advanced Settings",
			type: "bool",
			description: "",
			defaultValue: "true",
		},
	],
	markerConfig: [
		{
			technicalName: "markerSettings",
			displayName: "Marker Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	dataColorsConfig: [
		{
			technicalName: "dataColorsSettings",
			displayName: "Data Colors",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	lineConfig: [
		{
			technicalName: "lineSettings",
			displayName: "Line Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	dataLabelsConfig: [
		{
			technicalName: "dataLabelsSettings",
			displayName: "Data Labels Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	gridLinesConfig: [
		{
			technicalName: "gridLinesSettings",
			displayName: "GridLines Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	rankingConfig: [
		{
			technicalName: "rankingSettings",
			displayName: "Ranking Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	sortingConfig: [
		{
			technicalName: "sorting",
			displayName: "Sorting",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	xAxisConfig: [
		{
			technicalName: "xAxisSettings",
			displayName: "X Axis Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	yAxisConfig: [
		{
			technicalName: "yAxisSettings",
			displayName: "Y Axis Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	legend: [
		{
			technicalName: "show",
			displayName: "Show",
			type: "bool",
			description: "",
			defaultValue: true,
		},
		{
			technicalName: "legendPosition",
			displayName: "Position",
			description: "",
			type: "dropdown",
			options: [
				{ key: "Top Left", value: "TopLeft" },
				{ key: "Top Center", value: "TopCenter" },
				{ key: "Top Right", value: "TopRight" },
				{ key: "Bottom Left", value: "BottomLeft" },
				{ key: "Bottom Center", value: "BottomCenter" },
				{ key: "Bottom Right", value: "BottomRight" },
				{ key: "Right Top", value: "RightTop" },
				{ key: "Right Center", value: "RightCenter" },
				{ key: "Right Bottom", value: "RightBottom" },
				{ key: "Left Top", value: "LeftTop" },
				{ key: "Left Center", value: "LeftCenter" },
				{ key: "Left Bottom", value: "LeftBottom" },
			],
			defaultValue: "TopLeft",
		},
		{
			technicalName: "showTitle",
			displayName: "Title",
			type: "bool",
			description: "",
			defaultValue: true,
		},
		{
			technicalName: "legendTitle",
			displayName: "Legend Title",
			type: "text",
			description: "",
			defaultValue: "",
		},
		{
			technicalName: "legendColor",
			displayName: "Legend Color",
			description: "",
			type: "color",
			defaultValue: "#000000",
		},
		{
			technicalName: "fontSize",
			displayName: "Font Size",
			description: "",
			type: "fontSize",
			defaultValue: 8,
		},
		{
			technicalName: "fontFamily",
			displayName: "Font family",
			description: "",
			type: "font",
			defaultValue: "Segoe UI",
		},
	],
	numberFormatting: [
		{
			technicalName: "show",
			displayName: "Show",
			type: "bool",
			description: "",
			defaultValue: true,
		},
		{
			technicalName: "decimalSeparator",
			displayName: "Decimal Separator",
			description: "",
			type: "text",
			defaultValue: ".",
		},
		{
			technicalName: "thousandsSeparator",
			displayName: "Thousands Separator",
			description: "",
			type: "text",
			defaultValue: ",",
		},
		{
			technicalName: "decimalPlaces",
			displayName: "Decimal Places",
			description: "",
			type: "numeric",
			defaultValue: "2",
		},
		{
			technicalName: "scaling",
			displayName: "Scaling Display",
			type: "dropdown",
			description: "",
			defaultValue: "auto",
			options: [
				{
					value: "auto",
					key: "Auto",
				},
				{
					value: "none",
					key: "None",
				},
				{
					value: "thousands",
					key: "Thousands",
				},
				{
					value: "million",
					key: "Million",
				},
				{
					value: "billion",
					key: "Billion",
				},
				{
					value: "trillion",
					key: "Trillion",
				},
			],
		},
		{
			technicalName: "prefix",
			displayName: "Prefix",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "suffix",
			displayName: "Suffix",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "scalingLabel",
			displayName: "Customize Scaling Label",
			type: "bool",
			description: "",
			defaultValue: false,
		},
		{
			technicalName: "thousandScalingLabel",
			displayName: "Thousands",
			description: "",
			type: "text",
			defaultValue: "K",
		},
		{
			technicalName: "millionScalingLabel",
			displayName: "Million",
			description: "",
			type: "text",
			defaultValue: "M",
		},
		{
			technicalName: "billionScalingLabel",
			displayName: "Billion",
			description: "",
			type: "text",
			defaultValue: "B",
		},
		{
			technicalName: "trillionScalingLabel",
			displayName: "Trillion",
			description: "",
			type: "text",
			defaultValue: "T",
		},
		{
			technicalName: "semanticFormatting",
			displayName: "Semantic Formatting",
			description: "",
			type: "bool",
			defaultValue: false,
		},
		{
			technicalName: "negativeFormat",
			displayName: "Negative Value Format",
			type: "dropdown",
			description: "",
			defaultValue: "-x",
			options: [
				{
					key: "X",
					value: "X"
				},
				{
					key: "-X",
					value: "MinusX"
				},
				{
					key: "X-",
					value: "XMinus"
				},
				{
					key: "(X)",
					value: "XInBrackets"
				},
			],
		},
		{
			technicalName: "positiveFormat",
			displayName: "Positive Value Format",
			type: "dropdown",
			description: "",
			defaultValue: "x",
			options: [
				{
					key: "X",
					value: "X"
				},
				{
					key: "+X",
					value: "PlusX"
				},
				{
					key: "X+",
					value: "XPlus"
				}
			],
		},
	],
	showBucketConfig: [
		{
			technicalName: "showBucket",
			displayName: "Show Bucket",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	footer: [
		{
			technicalName: "show",
			displayName: "Show",
			type: "bool",
			description: "",
			defaultValue: false,
		},
		{
			technicalName: "text",
			displayName: "Text",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "webURL",
			displayName: "Web URL",
			description: "",
			type: "text",
			defaultValue: "",
		},
		{
			technicalName: "color",
			displayName: "Text Color",
			type: "color",
			description: "",
			defaultValue: "#000000",
		},
		{
			technicalName: "fontSize",
			displayName: "Text Size",
			description: "",
			type: "fontSize",
			defaultValue: "16",
		},
		{
			technicalName: "fontFamily",
			displayName: "Font family",
			description: "",
			type: "font",
			defaultValue: "Segoe UI",
		},
		{
			technicalName: "isShowDivider",
			displayName: "Divider",
			type: "bool",
			description: "",
			defaultValue: false,
		},
		{
			technicalName: "dividerColor",
			displayName: "Divider Color",
			type: "color",
			description: "",
			defaultValue: "#000000",
		},
		{
			technicalName: "dividerThickness",
			displayName: "Divider Width",
			type: "numeric",
			description: "",
			defaultValue: "1",
		},
		{
			technicalName: "backgroundColor",
			displayName: "Background Color",
			type: "color",
			description: "",
			defaultValue: "#ffffff",
		},
		{
			technicalName: "backgroundTransparency",
			displayName: "Background Transparency",
			type: "numeric",
			description: "",
			defaultValue: "0",
		},
		{
			technicalName: "alignment",
			displayName: "Alignment",
			type: "dropdown",
			description: "",
			defaultValue: "center",
			options: [
				{
					value: "left",
					key: "Left",
				},
				{
					value: "center",
					key: "Center",
				},
				{
					value: "right",
					key: "Right",
				},
			],
		},
	],
	editor: [
		{
			technicalName: "conditionalFormatting",
			displayName: "Conditional Formatting",
			type: "text",
			description: "",
			defaultValue: "",
		},
		{
			technicalName: "annotations",
			displayName: "Annotations",
			type: "text",
			description: "",
			defaultValue: "[]",
		},
		{
			technicalName: "Before IBCS Settings",
			displayName: "beforeIBCSSettings",
			type: "text",
			description: "",
			defaultValue: "{}",
		},
	],
	brushAndZoomAreaConfig: [
		{
			technicalName: "brushAndZoomAreaSettings",
			displayName: "Brush And Zoom Area",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	patternConfig: [
		{
			technicalName: "patternSettings",
			displayName: "Pattern Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	raceChartConfig: [
		{
			technicalName: "raceChartSettings",
			displayName: "Race Chart Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	referenceLinesConfig: [
		{
			technicalName: "referenceLinesSettings",
			displayName: "Reference Lines Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	errorBarsConfig: [
		{
			technicalName: "errorBarsSettings",
			displayName: "Error Bars Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	IBCSConfig: [
		{
			technicalName: "IBCSSettings",
			displayName: "IBCS Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
	dynamicDeviationConfig: [
		{
			technicalName: "dynamicDeviationSettings",
			displayName: "Dynamic Deviation Settings",
			description: "",
			type: "text",
			defaultValue: "{}",
		},
	],
};

module.exports = { visualPath, sectionKVPair, formatTab };
