/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-this-alias */
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import "regenerator-runtime/runtime";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISelectionId = powerbi.visuals.ISelectionId;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import IColorPalette = powerbi.extensibility.IColorPalette;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import * as d3 from "d3";

import {IChartSubCategory, ILollipopChartRow, TooltipData} from "./model";
import {
	CategoryDataColorProps,
	CircleFillOption,
	CircleSize,
	CircleType,
	ColorPaletteType,
	DataLabelsFontSizeType,
	DataLabelsPlacement,
	EDataRolesName,
	DisplayUnits,
	EVisualConfig,
	EVisualSettings,
	ILegendPosition,
	LegendType,
	LineType,
	LollipopType,
	Orientation,
	PieSize,
	PieType,
	Position,
	RankingDataValuesType,
	ESortOrderTypes,
	ERankingType,
	lollipopCategoryWidthType,
	ESortByTypes,
} from "./enum";
import {createTooltipServiceWrapper, ITooltipServiceWrapper} from "powerbi-visuals-utils-tooltiputils";
import {createLegend, positionChartArea} from "powerbi-visuals-utils-chartutils/lib/legend/legend";
import {textMeasurementService, wordBreaker} from "powerbi-visuals-utils-formattingutils";
import {ILegend, LegendData, LegendDataPoint, LegendPosition} from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";
import {Shadow} from "@truviz/shadow/dist/Shadow";
import {ShadowUpdateOptions, landingPageProp} from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import {EnumerateSectionType} from "@truviz/shadow/dist/types/EnumerateSectionType";
import {Enumeration} from "./Enumeration";
import {paidProperties} from "./PaidProperties";
import {NumberFormatting, VisualSettings} from "./settings";
import {
	CHART_SETTINGS,
	CIRCLE_SETTINGS,
	DATA_COLORS,
	DATA_LABELS_SETTINGS,
	GRID_LINES_SETTINGS,
	LINE_SETTINGS,
	RANKING_SETTINGS,
	SORTING_SETTINGS,
	X_AXIS_SETTINGS,
	Y_AXIS_SETTINGS,
} from "./constants";
import {
	IBrushConfig,
	IChartSettings,
	ICirclePropsSettings,
	ICircleSettings,
	IDataColorsSettings,
	IDataLabelsSettings,
	IGridLinesSettings,
	ILabelValuePair,
	ILegendSettings,
	ILineSettings,
	INumberSettings,
	IPiePropsSettings,
	IPieSettings,
	IRankingSettings,
	ISortingProps,
	ISortingSettings,
	IXAxisSettings,
	IXGridLinesSettings,
	IYAxisSettings,
	IYGridLinesSettings,
} from "./visual-settings.interface";
import * as echarts from "echarts/core";
import {PieChart} from "echarts/charts";
import {SVGRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {GetWordsSplitByWidth, formatNumber, getSVGTextSize} from "./methods/methods";
import {TextProperties} from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import {
	CallExpandAllXScaleOnAxisGroup,
	CallExpandAllYScaleOnAxisGroup,
	RenderExpandAllXAxis,
	RenderExpandAllYAxis,
} from "./methods/expandAllXAxis.methods";

import ChartSettings from "./settings-pages/ChartSettings";
import DataColorsSettings from "./settings-pages/DataColorsSettings";
import CircleSettings from "./settings-pages/CircleSettings";
import LineSettings from "./settings-pages/LineSettings";
import DataLabelsSettings from "./settings-pages/DataLabelsSettings";
import GridLinesSettings from "./settings-pages/GridLinesSettings";
import RankingSettings from "./settings-pages/RankingSettings";
import SortingSettings from "./settings-pages/SortingSettings";

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class Visual extends Shadow {
	public chartContainer: HTMLElement;
	public hostContainer: HTMLElement;
	public visualUpdateOptions: ShadowUpdateOptions;
	public tooltipServiceWrapper: ITooltipServiceWrapper;
	public legend1: ILegend;
	public legend2: ILegend;
	public colorPalette: IColorPalette;
	public _events: IVisualEventService;

	// props
	public width: number;
	public height: number;
	public settingsBtnHeight: number = 40;
	public settingsBtnWidth: number = 152;
	public viewPortWidth: number;
	public viewPortHeight: number;
	public margin: {top: number; right: number; bottom: number; left: number};
	public valuesTitle: string;
	public chartData: ILollipopChartRow[];
	public legends1Data: LegendData = {dataPoints: []};
	public legends2Data: LegendData = {dataPoints: []};
	public legendViewPort: {width: number; height: number} = {width: 0, height: 0};
	public isInFocusMode: boolean = false;
	public isVisualResized: boolean = false;

	// CATEGORICAL DATA
	public categoricalData: powerbi.DataViewCategorical;
	public categoricalMetadata: any;
	public categoricalCategoriesFields: powerbi.DataViewCategoryColumn[];
	public categoricalMeasureFields: powerbi.DataViewValueColumn[];
	public categoricalMeasure1Field: powerbi.DataViewValueColumn;
	public categoricalMeasure2Field: powerbi.DataViewValueColumn;
	public categoricalTooltipFields: powerbi.DataViewValueColumn[];
	public categoricalSortFields: powerbi.DataViewValueColumn[];
	public categoricalSubCategoryField: any;
	public categoricalCategoriesLastIndex: number = 0;
	public categoricalDataPairs: any[] = [];

	// data
	isChartInit: boolean = false;
	settingsPopupOptionsWidth: number;
	settingsPopupOptionsHeight: number;
	categoryDisplayName: string;
	subCategoryDisplayName: string;
	categoriesName: string[] = [];
	measureNames: string[] = [];
	subCategoriesName: string[] = [];
	measure1DisplayName: string;
	measure2DisplayName: string;
	subCategories: {name: string; color1: string; color2: string}[] = [];
	isDisplayLegend2: boolean;
	isHasMultiMeasure: boolean;
	isHasSubcategories: boolean;
	isHasCategories: boolean;
	isSortDataFieldsAdded: boolean;
	sortFieldsDisplayName: ILabelValuePair[];
	blankText: string = "(Blank)";
	othersBarText = "Others";
	totalLollipopCount: number = 0;

	// svg
	public svg: any;
	public container: any;
	public categoryTitle: string;
	public scaleBandWidth: number;
	public computedTextEle: any;
	public gradientColorScale = d3.scaleLinear();

	// brush
	public brushScaleBand: any;
	public newScaleDomainByBrush: string[];
	public brushScaleBandBandwidth: number = 0;
	public brushG: any;
	public brushHeight: number = 0;
	public brushWidth: number = 0;
	public isHorizontalBrushDisplayed: boolean;
	public isVerticalBrushDisplayed: boolean;
	public isLollipopChartDrawn: boolean = false;
	public minScaleBandWidth: number = 40;
	public isScrollBrushDisplayed: boolean;

	// xAxis
	public xAxisG: Selection<SVGElement>;
	public xScale: any;
	public xScale2: any;
	public xAxisTitleMargin: number = 0;
	public xAxisTitleG: Selection<SVGElement>;
	public xAxisTitleText: any;
	public xAxisTitleSize: {width: number; height: number};
	public xScaleGHeight: number = 0;
	public xScaleWidth: number;
	public xScalePaddingOuter: number = 0.25;
	public isBottomXAxis: boolean;

	// yAxis
	public yAxisG: Selection<SVGElement>;
	public yScale: any;
	public yScale2: any;
	public yAxisTitleText: any;
	public yAxisTitleMargin: number = 0;
	public yAxisTitleG: Selection<SVGElement>;
	public yAxisTitleSize: {width: number; height: number};
	public yScaleGWidth: number = 0;
	public yScaleHeight: number;
	public isLeftYAxis: boolean;

	// EXPAND ALL
	public expandAllXAxisG: Selection<SVGElement>;
	public expandAllYAxisG: Selection<SVGElement>;
	public expandAllXScaleGHeight: number = 0;
	public expandAllYScaleGWidth: number = 0;
	public expandAllCategoriesName: string[] = [];
	public isIdToCategoryAdded: boolean = false;
	public isExpandAllApplied: boolean = false;

	// line
	public lineSelection: any;
	public lineG: any;

	// circle1
	public circle1G: any;
	public circle1Selection: any;
	public circle1Radius: any;

	// circle2
	public circle2G: any;
	public circle2Selection: any;
	public circle2Radius: number;

	// data labels
	public dataLabelsSelection: any;
	public dataLabels1G: any;
	public dataLabels2G: any;

	// Grid Lines
	xGridLinesG: any;
	yGridLinesG: any;
	xGridLinesSelection: any;
	yGridLinesSelection: any;

	// pie
	pieG: any;
	pieEmphasizeScaleSize: number = 4;
	pieViewBoxRatio: number = 100 - this.pieEmphasizeScaleSize;
	isRankingSettingsChanged: boolean = false;

	// pie1
	ePie1ChartOptions: EChartsOption;
	pie1Radius: number;

	// pie2
	ePie2ChartOptions: EChartsOption;
	pie2Radius: number;

	//legend
	legend1MarginLeft: number = 0;
	legend2MarginLeft: number = 0;
	legendViewPortWidth: number = 0;
	legendViewPortHeight: number = 0;

	// settings
	isHorizontalChart: boolean = false;
	circleSettings: ICircleSettings;
	circle1Settings: ICirclePropsSettings;
	circle2Settings: ICirclePropsSettings;
	chartSettings: IChartSettings;
	dataLabelsSettings: IDataLabelsSettings;
	xAxisSettings: IXAxisSettings;
	yAxisSettings: IYAxisSettings;
	lineSettings: ILineSettings;
	pieSettings: IPieSettings;
	pie1Settings: IPiePropsSettings;
	pie2Settings: IPiePropsSettings;
	legendSettings: ILegendSettings;
	numberSettings: NumberFormatting;
	xGridSettings: IXGridLinesSettings;
	yGridSettings: IYGridLinesSettings;
	gridSettings: IGridLinesSettings;
	dataColorsSettings: IDataColorsSettings;
	rankingSettings: IRankingSettings;
	sortingSettings: ISortingSettings;

	public static landingPage: landingPageProp = {
		title: "Lollipop Chart",
		versionInfo: "1.0.0.0",
		description:
			"A lollipop chart shows the different stages of a process and how data moves through them. It uses connected segments to create a funnel shape. It helps to analyze the flow of data, like leads or customers, and see how they move through each stage of the process.",
		sliderImages: [],
		learnMoreLink: "https://powerviz.ai/funnel-chart",
	};

	constructor(options: VisualConstructorOptions) {
		super(options, VisualSettings, {
			landingPage: Visual.landingPage,
			theme: {
				sectionName: "visualGeneralSettings",
				propertyName: "darkMode",
			},
			servicePlanIds: [],
			isDragSelection: false,
			summaryTable: true,
			advancedSettingsToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "advancedSettingsToggle",
			},
			annotationsToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "annotationsToggle",
			},
			summaryTableToggle: {
				sectionName: "visualGeneralSettings",
				propertyName: "summaryTableToggle",
			},
			valueRole: [EDataRolesName.Measure, EDataRolesName.Tooltip],
			measureRole: [EDataRolesName.Category, EDataRolesName.SubCategory],
			categoricalGroupByRole: [EDataRolesName.SubCategory],
			components: [
				{
					name: "Chart Settings",
					sectionName: "chartConfig",
					propertyName: "chartSettings",
					Component: () => ChartSettings,
				},
				{
					name: "Data Colors",
					sectionName: "dataColorsConfig",
					propertyName: "dataColorsSettings",
					Component: () => DataColorsSettings,
				},
				{
					name: "Circle Settings",
					sectionName: "circleConfig",
					propertyName: "circleSettings",
					Component: () => CircleSettings,
				},
				{
					name: "Line Settings",
					sectionName: "lineConfig",
					propertyName: "lineSettings",
					Component: () => LineSettings,
				},
				{
					name: "Data Labels",
					sectionName: "dataLabelsConfig",
					propertyName: "dataLabelsSettings",
					Component: () => DataLabelsSettings,
				},
				{
					name: "Grid Lines",
					sectionName: "gridLinesConfig",
					propertyName: "gridLinesSettings",
					Component: () => GridLinesSettings,
				},
				{
					name: "Ranking",
					sectionName: "rankingConfig",
					propertyName: "rankingSettings",
					Component: () => RankingSettings,
				},
				{
					name: "Sorting",
					sectionName: "sortingConfig",
					propertyName: "sorting",
					Component: () => SortingSettings,
				},
			],
		});
		this.init(this.afterUpdate, this.getEnumeration, paidProperties);
		this.chartContainer = this.getVisualContainer();
		this.hostContainer = d3.select(this.chartContainer).node().parentElement;
		this.colorPalette = options.host.colorPalette;
		this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
		this._events = options.host.eventService;
		this.initChart();
	}

	public getEnumeration(): EnumerateSectionType[] {
		return Enumeration.GET();
	}

	public initChart(): void {
		this.margin = {top: 10, right: 30, bottom: this.xAxisTitleMargin, left: this.yAxisTitleMargin};

		this.svg = d3.select(this.chartContainer).append("svg").classed("lollipopChart", true);

		this.brushG = this.svg.append("g").attr("class", "brush");

		this.container = this.svg.append("g").classed("container", true);

		this.xGridLinesG = this.container.append("g").classed("xGridLinesG", true);

		this.yGridLinesG = this.container.append("g").classed("yGridLinesG", true);

		this.lineG = this.container.append("g").classed("lineG", true);

		this.circle1G = this.container.append("g").classed("circle1G", true);

		this.circle2G = this.container.append("g").classed("circle2G", true);

		this.pieG = this.container.append("g").classed("pieG", true);

		this.xAxisG = this.container.append("g").classed("xAxisG", true);

		this.expandAllXAxisG = this.container.append("g").classed("expandAllXAxisG", true);

		this.yAxisG = this.container.append("g").classed("yAxisG", true);

		this.expandAllYAxisG = this.container.append("g").classed("expandAllYAxisG", true);

		this.xAxisTitleG = this.container.append("g").classed("xAxisTitleG", true);

		this.xAxisTitleText = this.xAxisTitleG.append("text").classed("xAxisTitle", true).attr("text-anchor", "middle");

		this.yAxisTitleG = this.container.append("g").classed("yAxisTitleG", true);

		this.yAxisTitleText = this.yAxisTitleG.append("text").classed("yAxisTitle", true).attr("transform", "rotate(-90)").attr("text-anchor", "middle");

		this.dataLabels1G = this.container.append("g").classed("dataLabels1G", true);

		this.dataLabels2G = this.container.append("g").classed("dataLabels2G", true);

		this.computedTextEle = this.container.append("g").append("text");

		echarts.use([PieChart, SVGRenderer]);

		this.isChartInit = true;
	}

	setCategoricalDataBySubcategoryRanking(categoricalData: powerbi.DataViewCategorical): void {
		const subCategoryRankingSettings = this.rankingSettings.subCategory;
		const categoricalValues = categoricalData.values as any;
		const measures: any[] = categoricalValues.filter((d) => d.source.roles[EDataRolesName.Measure]);

		measures.forEach((d) => {
			d["total"] = d3.sum(d.values, (d) => +d);
		});

		measures.sort((a, b) => b["total"] - a["total"]);

		if (subCategoryRankingSettings.enabled) {
			let groupNames: string[] = measures.map((d) => d.source.groupName);

			if (subCategoryRankingSettings.rankingType === ERankingType.TopN) {
				if (this.isHorizontalChart) {
					groupNames = measures.slice(0, subCategoryRankingSettings.count).map((d) => d.source.groupName);
				} else {
					groupNames = measures
						.filter((d) => d.source.roles[EDataRolesName.Measure])
						.slice(0, subCategoryRankingSettings.count)
						.map((d) => d.source.groupName);
				}
			}

			if (subCategoryRankingSettings.rankingType === ERankingType.BottomN) {
				if (this.isHorizontalChart) {
					if (subCategoryRankingSettings.count <= measures.length) {
						groupNames = measures
							.filter((d) => d.source.roles[EDataRolesName.Measure])
							.slice(measures.length - subCategoryRankingSettings.count, measures.length)
							.map((d) => d.source.groupName);
					}
				} else {
					if (subCategoryRankingSettings.count <= measures.length) {
						groupNames = measures
							.filter((d) => d.source.roles[EDataRolesName.Measure])
							.slice(measures.length - subCategoryRankingSettings.count, measures.length)
							.map((d) => d.source.groupName);
					}
				}
			}

			categoricalData.values = categoricalValues.filter((d) => groupNames.includes(d.source.groupName));
		}
	}

	setCategoricalDataPairsByRanking(): void {
		const categoryRankingSettings = this.rankingSettings.category;
		let othersBarData: any[] = [];
		if (categoryRankingSettings.enabled) {
			if (categoryRankingSettings.rankingType === ERankingType.TopN) {
				if (this.isHorizontalChart) {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
						this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
					}
				} else {
					othersBarData = this.categoricalDataPairs.slice(categoryRankingSettings.count, this.categoricalDataPairs.length);
					this.categoricalDataPairs = this.categoricalDataPairs.slice(0, categoryRankingSettings.count);
				}
			}
			if (categoryRankingSettings.rankingType === ERankingType.BottomN) {
				if (this.isHorizontalChart) {
					othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
					this.categoricalDataPairs = this.categoricalDataPairs.slice(
						this.categoricalDataPairs.length - categoryRankingSettings.count,
						this.categoricalDataPairs.length
					);
				} else {
					if (categoryRankingSettings.count <= this.categoricalDataPairs.length) {
						othersBarData = this.categoricalDataPairs.slice(0, this.categoricalDataPairs.length - categoryRankingSettings.count);
						this.categoricalDataPairs = this.categoricalDataPairs.slice(
							this.categoricalDataPairs.length - categoryRankingSettings.count,
							this.categoricalDataPairs.length
						);
					}
				}
			}

			const keys = Object.keys(this.categoricalDataPairs[0]).slice(1);
			if (categoryRankingSettings.showRemainingAsOthers && othersBarData.length) {
				const othersDataField: any = {
					category: this.othersBarText,
				};
				keys.forEach((key) => {
					othersDataField[key] = d3.sum(othersBarData, (d) => d[key]);
				});
				if (this.isHorizontalChart) {
					this.categoricalDataPairs.push(othersDataField);
				} else {
					this.categoricalDataPairs.push(othersDataField);
				}
			}
		}
	}

	sortCategoryDataPairs(
		data: {category: string}[],
		categoryKey: string,
		measureKeys: string[],
		sortKeys: string[],
		categoricalMeasureFields: powerbi.DataViewValueColumn[],
		categoricalSortFields: powerbi.DataViewValueColumn[]
	): void {
		const sortingSettings: ISortingProps = this.sortingSettings.category;
		const isMeasure = sortingSettings.isSortByMeasure;
		const isSortByExternalFields = sortingSettings.isSortByExtraSortField;

		const sortByName = () => {
			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
				} else {
					data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => a[categoryKey].localeCompare(b[categoryKey]));
				} else {
					data.sort((a, b) => b[categoryKey].localeCompare(a[categoryKey]));
				}
			}
		};

		const sortByMeasure = (measureValues: powerbi.DataViewValueColumn[]) => {
			const index = measureValues.find((d) => d.source.displayName === sortingSettings.sortBy).source.index;
			const measureIndex = isSortByExternalFields ? `${EDataRolesName.Sort}${index}` : `${EDataRolesName.Measure}${index}`;

			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return a[measureIndex] - b[measureIndex];
					});
				} else {
					data.sort((a, b) => {
						return b[measureIndex] - a[measureIndex];
					});
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return a[measureIndex] - b[measureIndex];
					});
				} else {
					data.sort((a, b) => {
						return b[measureIndex] - a[measureIndex];
					});
				}
			}
		};

		const sortByMultiMeasure = (measureKeys: string[]) => {
			const getValue = (d: any) =>
				measureKeys.reduce((value, key) => {
					value += d[key];
					return value;
				}, 0);

			if (this.isHorizontalChart) {
				if (sortingSettings.sortOrder === ESortOrderTypes.DESC) {
					data.sort((a, b) => {
						return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
					});
				} else {
					data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
				}
			} else {
				if (sortingSettings.sortOrder === ESortOrderTypes.ASC) {
					data.sort((a, b) => {
						return this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b);
					});
				} else {
					data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
				}
			}
		};

		// Axis Settings
		if (isMeasure && !isSortByExternalFields) {
			if (this.isHasSubcategories || sortingSettings.isSortByMultiMeasure) {
				sortByMultiMeasure(measureKeys);
			} else {
				sortByMeasure(categoricalMeasureFields);
			}
		} else if (isSortByExternalFields) {
			if (isMeasure) {
				if (this.isHasSubcategories || sortingSettings.isSortByMultiMeasure) {
					sortByMultiMeasure(sortKeys);
				} else {
					const sortField = categoricalSortFields.filter((d) => d.source.displayName === sortingSettings.sortBy);
					sortByMeasure(sortField);
				}
			} else {
				sortByName();
			}
		} else if (!isMeasure && !isSortByExternalFields) {
			sortByName();
		}
	}

	defaultSortCategoryDataPairs(data: {category: string}[], measureKeys: string[], categoricalMeasureFields: powerbi.DataViewValueColumn[]): void {
		const sortByMeasure = (measureValues: powerbi.DataViewValueColumn[]) => {
			const index = measureValues[0].source.index;
			const measureIndex = `${EDataRolesName.Measure1}${index}`;

			if (this.isHorizontalChart) {
				data.sort((a, b) => b[measureIndex] - a[measureIndex]);
			} else {
				data.sort((a, b) => b[measureIndex] - a[measureIndex]);
			}
		};

		const sortByMultiMeasure = (measureKeys: string[]) => {
			const getValue = (d: any) =>
				measureKeys.reduce((value, key) => {
					value += d[key];
					return value;
				}, 0);

			if (this.isHorizontalChart) {
				data.sort((a, b) => (this.isHorizontalChart ? getValue(b) - getValue(a) : getValue(a) - getValue(b)));
			} else {
				data.sort((a, b) => (this.isHorizontalChart ? getValue(a) - getValue(b) : getValue(b) - getValue(a)));
			}
		};

		if (this.isHasMultiMeasure) {
			sortByMultiMeasure(measureKeys);
		} else {
			sortByMeasure(categoricalMeasureFields);
		}
	}

	getXScaleInnerPadding(): number {
		const innerPaddingScale = d3.scaleLinear().domain([0, 100]).range([0, 0.5]);
		return innerPaddingScale(this.chartSettings.lollipopInnerPadding);
	}

	setBrushScaleBandDomain(categoricalData: any): void {
		const innerPadding = this.getXScaleInnerPadding();
		if (this.isHorizontalChart) {
			this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
			this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
		} else {
			this.brushScaleBand = d3.scaleBand().paddingOuter(this.xScalePaddingOuter).paddingInner(innerPadding);
			this.brushScaleBand.domain(categoricalData.categories[this.categoricalCategoriesLastIndex].values.map((d) => <string>d));
		}
	}

	setBrushScaleBandRange(width: number, height: number): void {
		if (this.isHorizontalChart) {
			this.brushScaleBand.range(this.xAxisSettings.position === Position.Bottom ? [height, 0] : [0, width]);
		} else {
			this.brushScaleBand.range(this.yAxisSettings.position === Position.Left ? [0, width] : [width, 0]);
		}
	}

	setInitialChartData(
		categoricalData: powerbi.DataViewCategorical,
		clonedCategoricalData: powerbi.DataViewCategorical,
		categoricalMetadata: any,
		width: number,
		height: number
	): powerbi.DataViewCategorical {
		const categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
		const categoricalSubCategoryField = categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		const categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		const categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		const categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);
		const categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.categoricalCategoriesLastIndex = categoricalCategoriesFields.length - 1;
		this.isHasMultiMeasure = categoricalMeasureFields.length > 1;
		this.isHasSubcategories = !!categoricalSubCategoryField;
		this.measureNames = [...new Set(categoricalMeasureFields.map((d) => d.source.displayName))];

		this.categoryDisplayName = categoricalData.categories[this.categoricalCategoriesLastIndex].source.displayName;
		this.subCategoryDisplayName = categoricalSubCategoryField ? categoricalSubCategoryField.displayName : "";

		this.subCategoriesName = categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];

		this.isSortDataFieldsAdded = categoricalSortFields.length > 0;
		this.sortFieldsDisplayName =
			categoricalSortFields.length > 0
				? categoricalSortFields
						.map((d) => ({
							label: d.source.displayName,
							value: d.source.displayName,
							isSortByCategory: d.source.type.text,
							isSortByMeasure: d.source.type.numeric,
							isSortByExtraSortField: true,
						}))
						.filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i)
				: [];

		this.measure1DisplayName = categoricalMeasureFields.length > 0 ? categoricalMeasureFields[0].source.displayName : "";
		this.measure2DisplayName = categoricalMeasureFields.length > 1 ? categoricalMeasureFields[1].source.displayName : "";

		if (
			this.sortingSettings.category.isSortByExtraSortField &&
			!this.sortFieldsDisplayName.find((d) => d.label === this.sortingSettings.category.sortBy)
		) {
			this.sortingSettings.category.sortBy = ESortByTypes.VALUE;
			this.sortingSettings.category.isSortByCategory = false;
			this.sortingSettings.category.isSortByMeasure = true;
			this.sortingSettings.category.isSortByMultiMeasure = false;
			this.sortingSettings.category.isSortByExtraSortField = false;
		}

		if (
			!this.sortingSettings.category.sortBy ||
			(!(this.measureNames as string[]).includes(this.sortingSettings.category.sortBy) && this.sortingSettings.category.isSortByMeasure)
		) {
			this.sortingSettings.category.sortBy = this.measure1DisplayName;
		}

		if (!this.sortingSettings.subCategory.sortBy) {
			this.sortingSettings.subCategory.sortBy = this.subCategoryDisplayName;
		}

		this.setCategoricalDataBySubcategoryRanking(categoricalData);
		this.categoricalDataPairs = categoricalData.categories[categoricalCategoriesLastIndex].values.reduce((arr, category: string, index: number) => {
			const obj = {
				category: category !== null && category !== undefined && category !== "" ? category : this.blankText,
				hasNegative: false,
				hasZero: false,
			};
			this.expandAllCategoriesName.forEach((d, i) => {
				obj[d] = categoricalData.categories[i].values[index];
			});
			categoricalData.values.forEach((d) => {
				const roles = Object.keys(d.source.roles);
				roles.forEach((role) => {
					if (Object.keys(d.source).includes("groupName")) {
						if (d.values[index] === null || d.values[index] === undefined) {
							d.values[index] = 0;
						}

						if (role === EDataRolesName.Measure && +d.values[index] < 0) {
							d.values[index] = 0;
						}

						if (d.source.groupName !== null && d.source.groupName !== undefined && d.source.groupName !== "") {
							obj[`${role}${d.source.index}${d.source.groupName}`] = d.values[index];
						} else {
							obj[`${role}${d.source.index}${this.blankText}`] = d.values[index];
						}
					} else {
						obj[`${role}${d.source.index}`] = d.values[index];

						if (role === EDataRolesName.Measure && +d.values[index] < 0) {
							obj.hasNegative = true;
						}
					}
				});
			});
			return [...arr, obj];
		}, []);

		// this.categoricalDataPairs = this.categoricalDataPairs.filter(d => d.category !== null && d.category !== undefined);

		const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index + d.source.groupName);

		this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !d.hasNegative && !d.hasZero);
		this.categoricalDataPairs = this.categoricalDataPairs.filter((d) => !measureKeys.every((m) => d[m] === 0));

		if (!this.isHasSubcategories) {
			this.defaultSortCategoryDataPairs(this.categoricalDataPairs, measureKeys, categoricalMeasureFields);
		}

		this.setCategoricalDataPairsByRanking();

		if (this.sortingSettings.category.enabled) {
			const sortField = categoricalSortFields.filter((d) => d.source.displayName === this.sortingSettings.category.sortBy);

			if (!this.isHasSubcategories) {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index);
				const sortKeys = sortField.map((d) => EDataRolesName.Sort + d.source.index);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, categoricalMeasureFields, categoricalSortFields);
			} else {
				const measureKeys = categoricalMeasureFields.map((d) => EDataRolesName.Measure + d.source.index + d.source.groupName);
				const sortKeys = sortField.map((d) => EDataRolesName.Sort + d.source.index + d.source.groupName);
				this.sortCategoryDataPairs(this.categoricalDataPairs, "category", measureKeys, sortKeys, categoricalMeasureFields, categoricalSortFields);
			}
		}

		categoricalData.categories.forEach((d, i) => {
			if (i === this.categoricalCategoriesLastIndex) {
				d.values = this.categoricalDataPairs.map((pair) => pair.category);
			} else {
				d.values = this.categoricalDataPairs.map((pair) => pair[d.source.displayName]);
			}
		});

		categoricalData.values.forEach((d) => {
			if (Object.keys(d.source).includes("groupName")) {
				if (d.source.groupName !== null && d.source.groupName !== undefined && d.source.groupName !== "" && d.source.groupName !== this.blankText) {
					d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${d.source.groupName}`]);
				} else {
					d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}${this.blankText}`]);
				}
			} else {
				d.values = this.categoricalDataPairs.map((pair) => pair[`${Object.keys(d.source.roles)[0]}${d.source.index}`]);
			}
		});

		if (this.isExpandAllApplied) {
			clonedCategoricalData.categories
				.filter((d) => !!d.source.roles[EDataRolesName.Category])
				.forEach((d) => {
					if (!d["isIdToCategoryAdded"]) {
						d.values = d.values.map((d: string, i: number) => {
							if (d.split("-").length === 2) {
								return d;
							} else {
								return d + "-" + i.toString();
							}
						});
						d["isIdToCategoryAdded"] = true;
					}
				});

			categoricalData.categories
				.filter((d) => !!d.source.roles[EDataRolesName.Category])
				.forEach((d) => {
					// if (!d["isIdToCategoryAdded"]) {
					d.values = d.values.map((d: string, i: number) => {
						if (d.split("-").length === 2) {
							return d;
						} else {
							return d + "-" + i.toString();
						}
					});
					d["isIdToCategoryAdded"] = true;
					// }
				});
		}

		this.setBrushScaleBandDomain(clonedCategoricalData);

		this.setBrushScaleBandRange(width, height);

		if (
			this.chartSettings.lollipopCategoryWidth > this.minScaleBandWidth &&
			this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Custom
		) {
			this.scaleBandWidth = this.chartSettings.lollipopCategoryWidth;
			this.brushScaleBandBandwidth = this.chartSettings.lollipopCategoryWidth;
		} else if (this.brushScaleBand.bandwidth() > this.minScaleBandWidth) {
			this.scaleBandWidth = this.brushScaleBand.bandwidth();
			this.brushScaleBandBandwidth = this.brushScaleBand.bandwidth();
		} else {
			this.scaleBandWidth = this.minScaleBandWidth;
			this.brushScaleBandBandwidth = this.minScaleBandWidth;
		}

		this.totalLollipopCount = [...new Set(clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values)].length;

		this.xScale = this.brushScaleBand;

		const expectedWidth = (this.brushScaleBandBandwidth * width) / this.brushScaleBand.bandwidth();
		const expectedHeight = (this.brushScaleBandBandwidth * height) / this.brushScaleBand.bandwidth();

		if (this.isHorizontalChart) {
			if (Math.ceil(this.height) < expectedHeight && this.scaleBandWidth <= this.minScaleBandWidth) {
				this.isScrollBrushDisplayed = true;
				this.isVerticalBrushDisplayed = true;

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: 0,
					brushYPos: 0,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: width,
					scaleHeight: height,
					smallMultiplesGridItemId: null,
					categoricalData: categoricalData,
				};

				this.initVerticalBrush(config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isVerticalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		} else {
			if (Math.ceil(this.width) < expectedWidth && this.scaleBandWidth <= this.minScaleBandWidth) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;
				const brushXPos = this.margin.left ? this.margin.left : 0;

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: brushXPos,
					brushYPos: 100000,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: width,
					scaleHeight: height,
					smallMultiplesGridItemId: null,
					categoricalData: categoricalData,
				};

				this.initHorizontalBrush(config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		}

		// || this.height < expectedHeight
		if (this.width < expectedWidth && this.scaleBandWidth <= this.minScaleBandWidth) {
			const startIndex = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
			const endIndex = clonedCategoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
				this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
			);

			const categoricalData2 = JSON.parse(JSON.stringify(clonedCategoricalData));

			categoricalData2.categories.forEach((d, i) => {
				d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
			});

			categoricalData2.values.forEach((d, i) => {
				d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

				if (d.highlights) {
					d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
				}
			});

			this.setCategoricalDataFields(categoricalData2);
			this.setChartData(categoricalData2);
		}

		return categoricalData;
	}

	public setCategoricalDataFields(categoricalData: powerbi.DataViewCategorical): void {
		this.categoricalCategoriesFields = categoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
		this.categoricalSubCategoryField = this.categoricalMetadata.columns.find((d) => !!d.roles[EDataRolesName.SubCategory]);
		this.categoricalMeasureFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure]);
		this.categoricalTooltipFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Tooltip]);
		this.categoricalSortFields = categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Sort]);

		if (this.measureNames.length > 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
			this.categoricalMeasure2Field = this.categoricalMeasureFields[1];
		} else if (this.measureNames.length === 1) {
			this.categoricalMeasure1Field = this.categoricalMeasureFields[0];
		}

		// this.setNumberFormatters(this.categoricalMeasureFields, categoricalTooltipFields);

		this.isHasCategories = this.categoricalCategoriesFields.length > 0;
		this.isHasSubcategories = !!this.categoricalSubCategoryField;
		this.isHasMultiMeasure = this.measureNames.length > 1;

		// if (!this.isHasSubcategories) {
		// 	const isAllNegative = d3.every(this.categoricalMeasureFields, (d) => d3.every(d.values, (d) => +d < 0));
		// 	if (isAllNegative && this.categoricalCategoriesFields.length > 0) {
		// 		this.displayValidationPage("Negative data not supported");
		// 		this._events.renderingFailed(this.visualUpdateOptions.options, "Negative data not supported");
		// 		return;
		// 	}
		// }
	}

	expandAllCode(): void {
		if (this.isExpandAllApplied) {
			const {labelFontFamily, labelFontSize} = this.xAxisSettings;
			if (!this.isHorizontalChart) {
				this.expandAllYScaleGWidth = 0;
				this.expandAllXScaleGHeight = getSVGTextSize("XAxis", labelFontFamily, labelFontSize).height * this.expandAllCategoriesName.length;
				this.expandAllCategoriesName.forEach((d) => {
					this[d + "Scale"] = undefined;
					this[d + "ScaleG"] = this.expandAllXAxisG
						.append("g")
						.classed(d + "ScaleG", true)
						.classed("expandAllXAxisG", true);
				});
			} else {
				this.expandAllXScaleGHeight = 0;
				this.expandAllYScaleGWidth = this.width * 0.06 * this.expandAllCategoriesName.length;
				this.expandAllCategoriesName.forEach((d) => {
					this[d + "Scale"] = undefined;
					this[d + "ScaleG"] = this.expandAllYAxisG
						.append("g")
						.classed(d + "ScaleG", true)
						.classed("expandAllYAxisG", true);
				});
			}
		} else {
			this.expandAllXScaleGHeight = 0;
			this.expandAllYScaleGWidth = 0;
		}
	}

	public afterUpdate(vizOptions: ShadowUpdateOptions) {
		this.visualUpdateOptions = vizOptions;
		this._events.renderingStarted(vizOptions.options);

		try {
			this.categoricalData = this.visualUpdateOptions.options.dataViews[0].categorical as any;
			this.categoricalMetadata = this.visualUpdateOptions.options.dataViews[0].metadata;
			this.isInFocusMode = vizOptions.options.isInFocus;
			this.brushWidth = 0;
			this.brushHeight = 0;

			const isReturn = this.renderErrorMessages();

			if (isReturn) {
				return;
			}

			if (!this.isChartInit) {
				this.initChart();
			}

			this.expandAllXAxisG.selectAll("*").remove();
			this.expandAllYAxisG.selectAll("*").remove();

			this.setVisualSettings();

			this.isVisualResized =
				this.viewPortWidth &&
				this.viewPortHeight &&
				(this.viewPortWidth !== vizOptions.options.viewport.width || this.viewPortHeight !== vizOptions.options.viewport.height);

			this.width = vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width;
			this.height = vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height;

			const clonedCategoricalData = JSON.parse(JSON.stringify(this.visualUpdateOptions.options.dataViews[0].categorical));
			const categoricalCategoriesFields = clonedCategoricalData.categories.filter((d) => !!d.source.roles[EDataRolesName.Category]);
			this.isExpandAllApplied = categoricalCategoriesFields.length >= 2;

			if (this.isExpandAllApplied) {
				clonedCategoricalData.categories
					.filter((d) => !!d.source.roles[EDataRolesName.Category])
					.forEach((d) => {
						if (!d["isIdToCategoryAdded"]) {
							d.values = d.values.map((d: string, i: number) => {
								if (d.split("-").length === 2) {
									return d;
								} else {
									return d + "-" + i.toString();
								}
							});
							d["isIdToCategoryAdded"] = true;
						}
					});

				this.expandAllCategoriesName = categoricalCategoriesFields
					.map((d) => d.source.displayName)
					.slice(0, categoricalCategoriesFields.length - 1)
					.reverse();
			}

			this.expandAllCode();

			this.categoricalData = this.setInitialChartData(
				clonedCategoricalData,
				clonedCategoricalData,
				JSON.parse(JSON.stringify(this.visualUpdateOptions.options.dataViews[0].metadata)),
				vizOptions.options.viewport.width,
				vizOptions.options.viewport.height
			);

			if (this.isHorizontalBrushDisplayed) {
				this.brushHeight = 10;
			}

			if (this.isVerticalBrushDisplayed) {
				this.brushWidth = 10;
			}

			if (!this.isScrollBrushDisplayed) {
				this.sortSubcategoryData();
				this.setCategoricalDataFields(this.categoricalData);
				this.setChartData(this.categoricalData);
			}

			const popupOptions = document.querySelector(".popup-options");
			const popupOptionsHeader = document.querySelector(".popup-options-header");
			this.settingsPopupOptionsWidth = popupOptions ? (popupOptions.clientWidth ? popupOptions.clientWidth : 0) : 0;
			this.settingsPopupOptionsHeight = popupOptions ? (popupOptions.clientHeight ? popupOptions.clientHeight : 0) : 0;
			this.settingsBtnWidth = vizOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0;
			this.settingsBtnHeight = popupOptionsHeader ? popupOptionsHeader.clientHeight : 0;
			this.isDisplayLegend2 = this.isHasMultiMeasure && this.chartSettings.lollipopType !== LollipopType.Circle;

			const {titleFontSize: xAxisTitleFontSize, titleFontFamily: xAxisTitleFontFamily} = this.xAxisSettings;
			const {titleFontSize: yAxisTitleFontSize, titleFontFamily: yAxisTitleFontFamily} = this.xAxisSettings;

			this.xAxisTitleSize = this.xAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", xAxisTitleFontFamily, xAxisTitleFontSize)
				: {width: 0, height: 0};
			this.yAxisTitleSize = this.yAxisSettings.isDisplayTitle
				? getSVGTextSize("Title", yAxisTitleFontFamily, yAxisTitleFontSize)
				: {width: 0, height: 0};

			this.xAxisTitleMargin = this.xAxisSettings.isDisplayTitle ? 10 : 0;
			this.yAxisTitleMargin = this.yAxisSettings.isDisplayTitle ? 10 : 0;

			this.setColorsByDataColorsSettings();

			if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
				this.setRemainingAsOthersDataColor();
			}

			if (!this.legend1) {
				this.createLegendContainer(LegendType.Legend1);
			}

			if (!this.legend2) {
				this.createLegendContainer(LegendType.Legend2);
			}

			// if (this.legendSettings.show && (this.chartSettings.lollipopType !== LollipopType.Circle || this.isHasValue2)) {
			// 	this.setLegendsData();
			// 	this.renderLegends();
			// } else {
			// 	this.removeLegend(LegendType.Legend1);
			// 	this.removeLegend(LegendType.Legend2);
			// }

			this.setMargins();

			this.svg
				.attr("width", vizOptions.options.viewport.width - this.settingsBtnWidth - this.legendViewPort.width)
				.attr("height", vizOptions.options.viewport.height - this.settingsBtnHeight - this.legendViewPort.height);

			this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

			if (this.isScrollBrushDisplayed) {
				this.drawXYAxis();
				this.displayBrush();
			} else {
				this.drawXYAxis();

				if (this.categoricalCategoriesLastIndex > 0) {
					if (!this.isHorizontalChart) {
						RenderExpandAllXAxis(this, this.categoricalData);
					} else {
						RenderExpandAllYAxis(this, this.categoricalData);
					}
				}
			}

			if (this.isExpandAllApplied) {
				if (!this.isHorizontalChart) {
					if (this.isBottomXAxis) {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (this.height + this.xScaleGHeight) + "px" + ")");
					} else {
						this.expandAllXAxisG.style("transform", "translate(" + 0 + "px" + "," + (-this.xScaleGHeight - this.expandAllXScaleGHeight) + "px" + ")");
					}

					CallExpandAllXScaleOnAxisGroup(this, this.scaleBandWidth, this.height);
				} else {
					if (this.isLeftYAxis) {
						this.expandAllYAxisG.style("transform", "translate(" + -this.expandAllYScaleGWidth + "px" + "," + 0 + "px" + ")");
					} else {
						this.expandAllYAxisG.style("transform", "translate(" + (this.height + this.yScaleGWidth) + "px" + "," + 0 + "px" + ")");
					}
					CallExpandAllYScaleOnAxisGroup(this, this.width * 0.06);
				}
			}

			this.drawLollipopChart();
			// this.displayBrush();
			// this.drawTooltip();
		} catch (error) {
			console.error("Error", error);
		}
	}

	private sortSubcategoryData(): void {
		const {enabled, sortOrder, sortBy, isSortByCategory} = this.sortingSettings.subCategory;
		if (enabled && this.isHasSubcategories) {
			if (isSortByCategory) {
				if (this.isHorizontalChart) {
					if (sortOrder === ESortOrderTypes.DESC) {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					} else {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					}
				} else {
					if (sortOrder === ESortOrderTypes.ASC) {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (a.source.groupName as string).localeCompare(b.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return a.source.groupName - b.source.groupName;
							}
						});
					} else {
						this.categoricalData.values.sort((a, b) => {
							if (typeof a.source.groupName === "string" && typeof b.source.groupName === "string") {
								return (b.source.groupName as string).localeCompare(a.source.groupName as string);
							} else if (typeof a.source.groupName === "number" && typeof b.source.groupName === "number") {
								return b.source.groupName - a.source.groupName;
							}
						});
					}
				}
			} else {
				const clonedCategoricalDataValues: powerbi.DataViewValueColumn[] = JSON.parse(JSON.stringify(this.categoricalData.values));
				const displayNames = clonedCategoricalDataValues.map((d) => d.source.displayName);

				if (displayNames.includes(sortBy)) {
					const categoricalValuesBySort = clonedCategoricalDataValues.filter((d) => d.source.displayName === sortBy);
					categoricalValuesBySort.forEach((d) => {
						d["total"] = d3.sum(d.values, (v) => +v);
					});

					if (sortOrder === ESortOrderTypes.DESC) {
						categoricalValuesBySort.sort((a, b) => b["total"] - a["total"]);
					} else {
						categoricalValuesBySort.sort((a, b) => a["total"] - b["total"]);
					}

					const sortedGroupNames: string[] = categoricalValuesBySort.map((d) => d.source.groupName as string);
					sortedGroupNames.forEach((d, i) => {
						const valuesByGroupName = clonedCategoricalDataValues.filter((v) => v.source.groupName === d);
						valuesByGroupName.forEach((v, j) => {
							this.categoricalData.values[i * valuesByGroupName.length + j] = v;
						});
					});
				}
			}
		}

		const categoricalMeasureFields = this.categoricalData.values
			? this.categoricalData.values.filter((d) => !!d.source.roles[EDataRolesName.Measure])
			: [];

		this.subCategoriesName = categoricalMeasureFields
			.map((d) => d.source.groupName)
			.filter((d) => d && d !== null && d !== undefined && d !== "")
			.filter((v, i, a) => a.findIndex((t) => t === v) === i) as string[];
	}

	public renderErrorMessages(): boolean {
		const categoricalCategoriesFields = this.categoricalData.categories
			? !!this.categoricalData.categories.find((d) => d.source.roles[EDataRolesName.Category])
			: false;
		if (!categoricalCategoriesFields) {
			this.displayValidationPage("Add at least one dimension in the Category field");
			this._events.renderingFailed(this.visualUpdateOptions.options, "Add at least one dimension in the Category field");
			return true;
		}

		if (this.handleLandingPage(this.visualUpdateOptions)) {
			return true;
		}

		const categoricalMeasureFields = this.visualUpdateOptions.options.dataViews[0].categorical.values
			? this.visualUpdateOptions.options.dataViews[0].categorical.values.filter(
					(d) => !!d.source.roles[EDataRolesName.Measure]
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  )
			: [];
		if (categoricalMeasureFields.length === 0) {
			this.displayValidationPage("Please enter measure data");
			this._events.renderingFailed(this.visualUpdateOptions.options, "Please enter measure data");
			return true;
		}

		const categoricalCategoryFields = this.categoricalData.categories.filter((d) => d.source.roles[EDataRolesName.Category]);
		if (!categoricalCategoryFields.some((d) => d.values.length > 1) && categoricalMeasureFields[0].values.length === 0) {
			this.displayValidationPage("Empty measure and category");
			this._events.renderingFailed(this.visualUpdateOptions.options, "Empty measure and category");
			return true;
		}

		return false;
	}

	public handleLandingPage(vizOptions: ShadowUpdateOptions) {
		const propInfo = {
			title: "Lollipop Chart",
			versionInfo: "1.0.0.0",
			description:
				"Lollipop Chart is an Intuitive Visual for displaying a progression of data. It is used to indicate where your data point falls over a particular range. This can help to identify the relative performance of categories for a direct visual comparison in radial bars. The multiple gauge series arcing around the center point, similar to the activity chart found on the Apple Watch.",
			sliderImages: [],
		};

		if (
			vizOptions.options.dataViews[0].categorical.categories &&
			vizOptions.options.dataViews[0].categorical.categories.length === 0 &&
			vizOptions.options.dataViews[0].categorical.values &&
			vizOptions.options.dataViews[0].categorical.values.length === 0
		) {
			this.showLandingPage(propInfo);
			return true;
		} else {
			this.hideLandingPage();
		}
		return false;
	}

	setMargins(): void {
		if (this.xAxisSettings.position === Position.Bottom) {
			this.margin.bottom = this.xScaleGHeight + this.xAxisTitleSize.height + this.xAxisTitleMargin + this.brushHeight + this.expandAllXScaleGHeight;
			this.margin.top = 0;
		} else if (this.xAxisSettings.position === Position.Top) {
			this.margin.bottom = this.brushHeight;
			this.margin.top = this.xScaleGHeight + this.xAxisTitleSize.height + this.xAxisTitleMargin + this.expandAllXScaleGHeight;
		}

		if (this.yAxisSettings.position === Position.Left) {
			this.margin.left = this.yScaleGWidth + this.yAxisTitleSize.width + this.yAxisTitleMargin + this.expandAllYScaleGWidth;
			this.margin.right = this.brushWidth;
		} else if (this.yAxisSettings.position === Position.Right) {
			this.margin.left = this.yAxisTitleMargin;
			this.margin.right = this.yScaleGWidth + this.yAxisTitleSize.width + this.yAxisTitleMargin + this.brushWidth + this.expandAllYScaleGWidth;
		}

		this.setChartWidthHeight();
	}

	getTextSize(fontSize: number, isDisplay: boolean): number {
		let textSize: number;
		const textEle = this.svg
			.append("text")
			.attr("opacity", "0")
			.attr("font-size", fontSize)
			.attr("display", isDisplay ? "block" : "none")
			.text("text")
			.attr("", function () {
				textSize = this.getBBox().height;
			});
		textEle.remove();
		return textSize;
	}

	setChartData(categoricalData: powerbi.DataViewCategorical): void {
		// if (this.isExpandAllApplied) {
		// 	this.categoricalCategoriesFields.forEach((d) => {
		// 		if (!d["isIdToCategoryAdded"]) {
		// 			d.values = d.values.map((d: string, i: number) => {
		// 				if (d.split("-").length === 2) {
		// 					return d;
		// 				} else {
		// 					return d + "-" + i.toString();
		// 				}
		// 			});
		// 			d["isIdToCategoryAdded"] = true;
		// 		}
		// 	});
		// }

		this.categoriesName = this.categoricalCategoriesFields[this.categoricalCategoriesLastIndex].values.filter(
			(v, i, a) => a.findIndex((t) => t === v) === i
		) as string[];

		const measureGroup = d3.group(this.categoricalMeasureFields, (d) => d.source.displayName);
		const subCategoriesGroup = d3.group(categoricalData.values, (d) => d.source.groupName);

		const getSubCategoryData = (idx: number): IChartSubCategory[] => {
			const data = this.subCategoriesName.reduce((arr, cur, i) => {
				const subCategoryGroup = subCategoriesGroup.get(cur);
				const obj: IChartSubCategory = {
					category: cur,
					value1: <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure1DisplayName).values[idx]
					),
					value2: <number>(
						subCategoryGroup.find((d) => d.source.roles[EDataRolesName.Measure] && d.source.displayName === this.measure2DisplayName).values[idx]
					),
					tooltipFields: subCategoryGroup
						.filter((d) => d.source.roles[EDataRolesName.Tooltip])
						.map((d) => ({displayName: d.source.displayName, value: d.values[idx], color: ""} as TooltipData)),
					styles: {
						pie1: {color: ""},
						pie2: {color: ""},
					},
				};
				return [...arr, obj];
			}, []);
			return data;
		};

		const data: ILollipopChartRow[] = this.categoriesName.map((cat, idx) => ({
			city: <string>cat,
			value1: !this.isHasSubcategories ? <number>this.categoricalMeasure1Field.values[idx] : 0,
			value2: this.isHasMultiMeasure ? (!this.isHasSubcategories ? <number>this.categoricalMeasure2Field.values[idx] : 0) : 0,
			tooltipFields: this.categoricalTooltipFields.map((d) => ({displayName: d.source.displayName, value: d.values[idx], color: ""} as TooltipData)),
			subCategories: this.isHasSubcategories ? getSubCategoryData(idx) : [],
			styles: {
				circle1: {fillColor: "", strokeColor: ""},
				circle2: {fillColor: "", strokeColor: ""},
				line: {color: this.lineSettings.lineColor},
				pie1: {color: ""},
				pie2: {color: ""},
			},
		}));

		if (this.isHasSubcategories) {
			data.forEach((d) => {
				if (d.subCategories.length) {
					d.value1 = d3.sum(d.subCategories, (cat) => cat.value1);
					d.value2 = d3.sum(d.subCategories, (cat) => cat.value2);
				}
			});
		}

		// const category = this.categoricalData.categories[0];
		// data.forEach((d, i) => {
		// 	const selectionId: ISelectionId = this.visualUpdateOptions.host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();
		// 	d.selectionId = selectionId;
		// });
		// data.forEach((d, i) => {
		// 	d.subCategories.forEach((subCategory) => {
		// 		const selectionId: ISelectionId = this.visualUpdateOptions.host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();
		// 		subCategory.selectionId = selectionId;
		// 	});
		// });

		this.chartData = data;
	}

	public createLegendContainer(legendType: LegendType): void {
		this[legendType] = createLegend(
			this.hostContainer,
			false,
			null,
			true,
			LegendPosition[this.legendSettings.position] ? LegendPosition[this.legendSettings.position] : LegendPosition.Top
		);
	}

	setVisualSettings(): void {
		const formatTab = this.visualUpdateOptions.formatTab;

		const chartConfig = JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]);
		this.chartSettings = {
			...CHART_SETTINGS,
			...chartConfig,
		};

		const circleConfig = JSON.parse(formatTab[EVisualConfig.CircleConfig][EVisualSettings.CircleSettings]);
		this.circleSettings = {
			...CIRCLE_SETTINGS,
			...circleConfig,
		};

		const lineConfig = JSON.parse(formatTab[EVisualConfig.LineConfig][EVisualSettings.LineSettings]);
		this.lineSettings = {
			...LINE_SETTINGS,
			...lineConfig,
		};

		const clonedDataLabelsSettings = JSON.parse(JSON.stringify(this.dataLabelsSettings ? this.dataLabelsSettings : {}));
		const dataLabelsConfig = JSON.parse(formatTab[EVisualConfig.DataLabelsConfig][EVisualSettings.DataLabelsSettings]);
		this.dataLabelsSettings = {
			...DATA_LABELS_SETTINGS,
			...dataLabelsConfig,
		};

		this.legendSettings = formatTab[EVisualSettings.Legend];
		this.numberSettings = formatTab[EVisualSettings.NumberFormatting];

		const xAxisConfig = JSON.parse(formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings]);
		this.xAxisSettings = {
			...X_AXIS_SETTINGS,
			...xAxisConfig,
		};

		const yAxisConfig = JSON.parse(formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings]);
		this.yAxisSettings = {
			...Y_AXIS_SETTINGS,
			...yAxisConfig,
		};

		const gridLinesConfig = JSON.parse(formatTab[EVisualConfig.GridLinesConfig][EVisualSettings.GridLinesSettings]);
		this.gridSettings = {
			...GRID_LINES_SETTINGS,
			...gridLinesConfig,
		};

		// Data Colors Settings
		// if (this.chartSettings.lollipopType === LollipopType.Circle) {
		//     DATA_COLORS.dataType = CircleType.Circle1;
		// } else {
		//     DATA_COLORS.dataType = PieType.Pie1;
		// }

		if (this.isHasMultiMeasure) {
			DATA_COLORS.circle1.fillType = ColorPaletteType.Single;
			DATA_COLORS.circle2.fillType = ColorPaletteType.Single;
		}

		const dataColorsConfig = JSON.parse(formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings]);
		this.dataColorsSettings = {
			...DATA_COLORS,
			...dataColorsConfig,
		};

		const clonedRankingSettings = JSON.parse(JSON.stringify(this.rankingSettings ? this.rankingSettings : {}));
		const rankingConfig = JSON.parse(formatTab[EVisualConfig.RankingConfig][EVisualSettings.RankingSettings]);
		this.rankingSettings = {
			...RANKING_SETTINGS,
			...rankingConfig,
		};
		this.isRankingSettingsChanged = JSON.stringify(clonedRankingSettings) !== JSON.stringify(this.rankingSettings);

		const sortingConfig = JSON.parse(this.visualUpdateOptions.formatTab[EVisualConfig.SortingConfig][EVisualSettings.Sorting]);
		this.sortingSettings = {
			...SORTING_SETTINGS,
			...sortingConfig,
		};

		this.changeVisualSettings();

		// if (!this.isHasSubcategories) {
		// 	this.chartSettings.lollipopType = LollipopType.Circle;
		// 	CHART_SETTINGS.isLollipopTypeChanged = false;
		// 	this.chartSettings.isLollipopTypeChanged = false;
		// 	const chartConfig: IChartSettings = {...this.chartSettings, lollipopType: LollipopType.Circle, isLollipopTypeChanged: false};
		// 	formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings] = JSON.stringify(chartConfig);
		// 	const dataColorsConfig: IDataColorsSettings = {...this.dataColorsSettings, dataType: CircleType.Circle1};
		// 	formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings] = JSON.stringify(dataColorsConfig);
		// } else {
		// 	if (!this.chartSettings.isLollipopTypeChanged) {
		// 		this.chartSettings.lollipopType = LollipopType.Donut;
		// 		const chartConfig: IChartSettings = {...this.chartSettings, lollipopType: LollipopType.Donut};
		// 		formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings] = JSON.stringify(chartConfig);
		// 		const dataColorsConfig: IDataColorsSettings = {...this.dataColorsSettings, dataType: PieType.Pie1};
		// 		formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings] = JSON.stringify(dataColorsConfig);
		// 	}
		// }

		// if (!Object.keys(clonedDataLabelsSettings).length || this.chartSettings.lollipopType !== LollipopType.Circle) {
		// 	const color = this.dataLabelsSettings.color;
		// 	if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
		// 		this.dataLabelsSettings.color = "rgb(102,102,102)";
		// 	}
		// }
	}

	changeVisualSettings(): void {
		this.isHorizontalChart = this.chartSettings.orientation === Orientation.Horizontal;
		this.circle1Settings = this.circleSettings.circle1;
		this.circle2Settings = this.circleSettings.circle2;
		this.xGridSettings = this.gridSettings.xGridLines;
		this.yGridSettings = this.gridSettings.yGridLines;
		this.pie1Settings = this.chartSettings.pieSettings.pie1;
		this.pie2Settings = this.chartSettings.pieSettings.pie2;
		// if (this.rankingSettings.isRankingEnabled) {
		// 	this.setChartDataByRanking();
		// }
	}

	setChartDataByRanking(): void {
		// const rankingSettings = this.rankingSettings[this.isHasMultiMeasure ? this.rankingSettings.valueType : RankingDataValuesType.Value1];
		// if (!rankingSettings.showRemainingAsOthers) {
		// 	if (rankingSettings.filterType === RankingFilterType.TopN) {
		// 		this.chartData = this.chartData.slice(0, rankingSettings.count);
		// 	}
		// 	if (rankingSettings.filterType === RankingFilterType.BottomN) {
		// 		if (rankingSettings.count <= this.chartData.length) {
		// 			this.chartData = this.chartData.slice(this.chartData.length - rankingSettings.count, this.chartData.length);
		// 		}
		// 	}
		// }
		// if (this.chartSettings.lollipopType !== LollipopType.Circle && rankingSettings.isSubcategoriesRanking) {
		// 	const valueType = this.rankingSettings.valueType === RankingDataValuesType.Value1 ? RankingDataValuesType.Value1 : RankingDataValuesType.Value2;
		// 	this.chartData.forEach((data) => {
		// 		data.subCategories.sort((a, b) => b[valueType] - a[valueType]);
		// 	});
		// 	if (!rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
		// 			this.chartData.forEach((data) => {
		// 				data.subCategories = data.subCategories.slice(0, rankingSettings.subCategoriesRanking.count);
		// 			});
		// 		}
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
		// 			this.chartData.forEach((data) => {
		// 				if (rankingSettings.subCategoriesRanking.count <= data.subCategories.length) {
		// 					data.subCategories = data.subCategories.slice(
		// 						data.subCategories.length - rankingSettings.subCategoriesRanking.count,
		// 						data.subCategories.length
		// 					);
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// if (this.rankingSettings.isRankingEnabled) {
		// 	const subCategories = [];
		// 	this.subCategories = [];
		// 	this.chartData.forEach((data) => {
		// 		data.subCategories.forEach((sub) => {
		// 			const isAlreadyHasCategory = this.subCategories.some((d) => d.name === sub.category);
		// 			if (!isAlreadyHasCategory) {
		// 				subCategories.push({name: sub.category, color1: "", color2: ""});
		// 			}
		// 		});
		// 	});
		// 	this.subCategories = subCategories;
		// }
	}

	setRemainingAsOthersDataColor(): void {
		// const rankingSettings = this.rankingSettings.category;
		// const subCategoriesRanking = this.rankingSettings.subCategory;
		// if (rankingSettings.showRemainingAsOthers) {
		// 	if (rankingSettings.rankingType === ERankingType.TopN) {
		// 		this.chartData.forEach((d, i) => {
		// 			if (i + 1 > rankingSettings.count) {
		// 				d.styles.circle1.fillColor = rankingSettings.othersColor;
		// 				d.styles.circle1.strokeColor = rankingSettings.othersColor;
		// 				d.styles.circle2.fillColor = rankingSettings.othersColor;
		// 				d.styles.circle2.strokeColor = rankingSettings.othersColor;
		// 				d.styles.line.color = rankingSettings.othersColor;
		// 				d.subCategories.forEach((s) => {
		// 					s.styles.pie1.color = rankingSettings.othersColor;
		// 					s.styles.pie2.color = rankingSettings.othersColor;
		// 				});
		// 			}
		// 		});
		// 	}
		// 	if (rankingSettings.rankingType === ERankingType.BottomN) {
		// 		if (rankingSettings.count <= this.chartData.length) {
		// 			this.chartData.forEach((d, i) => {
		// 				if (i < this.chartData.length - rankingSettings.count) {
		// 					d.styles.circle1.fillColor = rankingSettings.othersColor;
		// 					d.styles.circle1.strokeColor = rankingSettings.othersColor;
		// 					d.styles.circle2.fillColor = rankingSettings.othersColor;
		// 					d.styles.circle2.strokeColor = rankingSettings.othersColor;
		// 					d.styles.line.color = rankingSettings.othersColor;
		// 					d.subCategories.forEach((s) => {
		// 						s.styles.pie1.color = rankingSettings.othersColor;
		// 						s.styles.pie2.color = rankingSettings.othersColor;
		// 					});
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// if (rankingSettings.isSubcategoriesRanking && subCategoriesRanking.showRemainingAsOthers) {
		// 	if (this.chartSettings.lollipopType !== LollipopType.Circle) {
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
		// 			this.chartData.forEach((data, i1) => {
		// 				if (i1 + 1 <= rankingSettings.count) {
		// 					data.subCategories.forEach((d, i2) => {
		// 						if (i2 + 1 > subCategoriesRanking.count) {
		// 							d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
		// 							d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
		// 						}
		// 					});
		// 				}
		// 			});
		// 		}
		// 		if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
		// 			this.chartData.forEach((data, i1) => {
		// 				if (i1 > this.chartData.length - rankingSettings.count) {
		// 					data.subCategories.forEach((d, i2) => {
		// 						if (i2 < data.subCategories.length - subCategoriesRanking.count) {
		// 							d.styles.pie1.color = subCategoriesRanking.pieSliceColor;
		// 							d.styles.pie2.color = subCategoriesRanking.pieSliceColor;
		// 						}
		// 					});
		// 				}
		// 			});
		// 		}
		// 	}
		// }
		// this.setSubCategoriesColor(LegendType.Legend1);
		// if (this.isDisplayLegend2) {
		// 	this.setSubCategoriesColor(LegendType.Legend2);
		// }
	}

	setColorsByDataColorsSettings(): void {
		if (this.chartSettings.lollipopType === LollipopType.Circle) {
			this.setCircleColors();
		} else {
			this.setPieColors(PieType.Pie1);
			if (this.isHasMultiMeasure) {
				this.setPieColors(PieType.Pie2);
			}
		}
		this.setSubCategoriesColor(LegendType.Legend1);
		if (this.isDisplayLegend2) {
			this.setSubCategoriesColor(LegendType.Legend2);
		}
	}

	setCircleColors(): void {
		const colorsSettings = this.dataColorsSettings.circle1;
		if (this.isHasMultiMeasure) {
			const circle1Colors = this.dataColorsSettings.circle1;
			const circle2Colors = this.dataColorsSettings.circle2;
			this.chartData.forEach((data) => {
				data.styles.circle1.fillColor = circle1Colors.circleFillColor;
				data.styles.circle1.strokeColor = circle1Colors.circleStrokeColor;
				data.styles.circle2.fillColor = circle2Colors.circleFillColor;
				data.styles.circle2.strokeColor = circle2Colors.circleStrokeColor;
			});
			return;
		}

		// Circle 1 Colors
		switch (this.dataColorsSettings.circle1.fillType) {
			case ColorPaletteType.Single: {
				this.chartData.forEach((data) => {
					data.styles.circle1.fillColor = colorsSettings.circleFillColor;
					data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
				});
				break;
			}
			case ColorPaletteType.PowerBi: {
				this.chartData.forEach((data) => {
					// let colorCode = this.colorPalette.getColor(data.city).value.split('#')[1];
					// const circleFillColor = '#F2' + colorCode;
					data.styles.circle1.fillColor = this.colorPalette.getColor(data.city).value;
					data.styles.circle1.strokeColor = this.colorPalette.getColor(data.city).value;
				});
				break;
			}
			case ColorPaletteType.Gradient: {
				const categoryDataLength = this.chartData.length;
				const domain =
					colorsSettings.midcolor && categoryDataLength > 2 ? [1, Math.round(categoryDataLength / 2), categoryDataLength] : [1, categoryDataLength];
				const range: any =
					colorsSettings.midcolor && categoryDataLength > 2
						? [colorsSettings.fillmax, colorsSettings.fillmid, colorsSettings.fillmin]
						: [colorsSettings.fillmax, colorsSettings.fillmin];

				this.gradientColorScale.domain(domain).range(range);
				this.chartData.forEach((data, i) => {
					const color: string = this.gradientColorScale(i + 1) + "";
					data.styles.circle1.fillColor = color;
					data.styles.circle1.strokeColor = color;
				});
				break;
			}
			case ColorPaletteType.ByCategory: {
				break;
			}
			case ColorPaletteType.Sequential: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setCircleSchemaColors(colorsSettings.schemeColors.reverse(), colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Diverging: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setCircleSchemaColors(colorsSettings.schemeColors, colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Qualitative: {
				const colorsSettings = this.dataColorsSettings.circle1;
				this.setCircleSchemaColors(colorsSettings.schemeColors, colorsSettings.reverse, false);
				break;
			}
		}
	}

	setPieColors(pieType: PieType): void {
		const pieColors = this.dataColorsSettings[pieType];
		switch (this.dataColorsSettings[pieType].fillType) {
			case ColorPaletteType.Single: {
				this.chartData.forEach((data) => {
					// data.styles.circle1.fillColor = colorsSettings.circleFillColor;
					// data.styles.circle1.strokeColor = colorsSettings.circleStrokeColor;
					data.subCategories.forEach((d) => {
						d.styles[pieType].color = pieColors.singleColor;
					});
				});
				break;
			}
			case ColorPaletteType.PowerBi: {
				this.chartData.forEach((data) => {
					data.subCategories.forEach((d) => {
						d.styles[pieType].color = this.colorPalette.getColor(d.category).value;
					});
				});
				break;
			}
			case ColorPaletteType.Gradient: {
				this.chartData.forEach((data) => {
					const subCategoryDataLength = data.subCategories.length;
					const range: any =
						pieColors.midcolor && subCategoryDataLength > 2
							? [pieColors.fillmax, pieColors.fillmid, pieColors.fillmin]
							: [pieColors.fillmax, pieColors.fillmin];
					const domain =
						pieColors.midcolor && subCategoryDataLength > 2
							? [1, Math.round(subCategoryDataLength / 2), subCategoryDataLength]
							: [1, subCategoryDataLength];
					this.gradientColorScale.domain(domain).range(range);
					data.subCategories.forEach((d, i) => {
						const color: string = this.gradientColorScale(i + 1) + "";
						d.styles[pieType].color = color;
					});
				});
				break;
			}
			case ColorPaletteType.ByCategory: {
				this.chartData.forEach((data) => {
					data.subCategories.forEach((d) => {
						const selectedCategoryName = pieColors.selectedCategoryName;
						d.styles[pieType].color = d.category === selectedCategoryName ? pieColors.selectedCategoryColor : pieColors.defaultColor;
					});
				});
				break;
			}
			case ColorPaletteType.Sequential: {
				const colorsSettings = this.dataColorsSettings[pieType];
				this.setPieSchemaColors(pieType, colorsSettings.schemeColors.reverse(), colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Diverging: {
				const colorsSettings = this.dataColorsSettings[pieType];
				this.setPieSchemaColors(pieType, colorsSettings.schemeColors, colorsSettings.reverse, colorsSettings.isGradient);
				break;
			}
			case ColorPaletteType.Qualitative: {
				const colorsSettings = this.dataColorsSettings[pieType];
				this.setPieSchemaColors(pieType, colorsSettings.schemeColors, colorsSettings.reverse, false);
				break;
			}
		}
	}

	setSubCategoriesColor(legendType: LegendType): void {
		const isLegend2 = legendType === LegendType.Legend2;
		const getSubCategoryColorByName = (subCategoryName: string): string => {
			let subCategory: IChartSubCategory;
			this.chartData.forEach((data) => {
				data.subCategories.find((d) => {
					if (d.category === subCategoryName) {
						subCategory = d;
					}
				});
			});
			return subCategory ? subCategory.styles[isLegend2 ? PieType.Pie2 : PieType.Pie1].color : "#545454";
		};

		this.subCategories.forEach((cat) => {
			cat[isLegend2 ? "color2" : "color1"] = getSubCategoryColorByName(cat.name);
		});
	}

	setCircleSchemaColors(schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
		if (isReverse) {
			schemeColors = schemeColors.reverse();
		}

		if (isGradient) {
			const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];
			const domain = [1, this.chartData.length];
			this.gradientColorScale.domain(domain).range(range);
		}

		let colorIdx = -1;
		this.chartData.forEach((data, i) => {
			colorIdx++;
			if (colorIdx >= schemeColors.length) {
				colorIdx = 0;
			}
			if (isGradient) {
				const color = this.gradientColorScale(i + 1) + "";
				data.styles.circle1.fillColor = color;
				data.styles.circle1.strokeColor = color;
			} else {
				data.styles.circle1.fillColor = schemeColors[colorIdx];
				data.styles.circle1.strokeColor = schemeColors[colorIdx];
			}
		});
	}

	setPieSchemaColors(pieType: PieType, schemeColors: string[] = [], isReverse: boolean, isGradient: boolean): void {
		if (isReverse) {
			schemeColors = schemeColors.reverse();
		}
		const range: any = [schemeColors[0], schemeColors[schemeColors.length - 1]];

		this.chartData.forEach((data) => {
			let colorIdx = -1;
			if (isGradient) {
				const domain = [1, data.subCategories.length];
				this.gradientColorScale.domain(domain).range(range);
			}

			data.subCategories.forEach((d, i) => {
				colorIdx++;
				if (colorIdx >= schemeColors.length) {
					colorIdx = 0;
				}
				if (isGradient) {
					const color = this.gradientColorScale(i + 1) + "";
					d.styles[pieType].color = color;
				} else {
					d.styles[pieType].color = schemeColors[colorIdx];
				}
			});
		});
	}

	setChartWidthHeight(): void {
		const options = this.visualUpdateOptions;
		this.viewPortWidth = options.options.viewport.width;
		this.viewPortHeight = options.options.viewport.height;
		this.width = this.viewPortWidth - this.margin.left - this.margin.right - this.settingsBtnWidth - this.legendViewPort.width;
		this.height = this.viewPortHeight - this.margin.bottom - this.margin.top - this.settingsBtnHeight - this.legendViewPort.height;
	}

	displayBrush(): void {
		if (this.isHorizontalChart) {
			const newHeight = (this.brushScaleBandBandwidth * this.height) / this.brushScaleBand.bandwidth();
			if (this.height < newHeight) {
				this.drawVerticalBrush(this.categoricalData, this.brushScaleBandBandwidth, this.totalLollipopCount);
			} else {
				this.brushG.selectAll("*").remove();
			}
		} else {
			const newWidth = (this.brushScaleBandBandwidth * this.width) / this.brushScaleBand.bandwidth();
			if (this.width < newWidth) {
				this.isScrollBrushDisplayed = true;
				this.isHorizontalBrushDisplayed = true;

				const brushXPos = this.margin.left ? this.margin.left : 0;
				const brushYPos = this.viewPortHeight - this.brushHeight - this.settingsBtnHeight - this.legendViewPort.height;

				const config: IBrushConfig = {
					brushG: this.brushG.node(),
					brushXPos: brushXPos,
					brushYPos: brushYPos,
					barDistance: this.brushScaleBandBandwidth,
					totalBarsCount: this.totalLollipopCount,
					scaleWidth: this.width,
					scaleHeight: this.height,
					smallMultiplesGridItemId: null,
					categoricalData: this.categoricalData,
				};

				this.drawHorizontalBrush(this, config);
			} else {
				this.isScrollBrushDisplayed = false;
				this.isHorizontalBrushDisplayed = false;
				this.brushG.selectAll("*").remove();
			}
		}
	}

	drawVerticalBrush(categoricalData: powerbi.DataViewCategorical, barDistance: number, totalBarsCount: number): void {
		categoricalData = JSON.parse(JSON.stringify(categoricalData));
		const yScaleDomain = this.brushScaleBand.domain();
		this.brushScaleBand.range(this.yScale.range());

		categoricalData.categories.forEach((d, i) => {
			if (i < categoricalData.categories.length - 1) {
				const yScaleCopy = this.yScale.copy();
				this[`${d.source.displayName}Scale`] = yScaleCopy;
				this[`${d.source.displayName}ScaleDomain`] = d.values;
			}
		});

		const brushed = ({selection}) => {
			if (this.isExpandAllApplied) {
				this.expandAllCategoriesName.forEach((d) => {
					if (this[`${d}ScaleDomain`]) {
						this[`${d}ScaleNewDomain`] = [];
					}
				});
			}

			const newYScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.yScale.range();

			yScaleDomain.forEach((d, i) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newYScaleDomain.push(d);

					if (this.isExpandAllApplied) {
						this.expandAllCategoriesName.forEach((d) => {
							if (this[`${d}ScaleDomain`]) {
								this[`${d}ScaleNewDomain`].push(this[`${d}ScaleDomain`][i]);
							}
						});
					}
				}
			});

			this.newScaleDomainByBrush = newYScaleDomain;

			if (this.newScaleDomainByBrush.length < yScaleDomain.length || this.isExpandAllApplied) {
				const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
				const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
					this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
				);

				const categoricalData2 = JSON.parse(JSON.stringify(categoricalData));

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				this.sortSubcategoryData();
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.setColorsByDataColorsSettings();

				if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
					this.setRemainingAsOthersDataColor();
				}

				// this.lineSelection
				// 	.attr("y1", (d) => this.yScale(d.city))
				// 	.attr("y2", (d) => this.yScale(d.city))
				// 	.attr("opacity", (d) => {
				// 		return this.yScale(d.city) ? 1 : 0;
				// 	});

				// this.circle1Selection
				// 	.attr("cy", (d) => this.yScale(this.isHorizontalChart ? d.city : d.value1))
				// 	.attr("opacity", (d) => {
				// 		return this.yScale(d.city) ? 1 : 0;
				// 	});

				// this.circle2Selection
				// 	.attr("cy", (d) => this.yScale(this.isHorizontalChart ? d.city : d.value1))
				// 	.attr("opacity", (d) => {
				// 		return this.yScale(d.city) ? 1 : 0;
				// 	});

				// this.yGridLinesSelection.attr("y1", (d) => this.yScale(d)).attr("y2", (d) => this.yScale(d));

				// if (this.yAxisSettings.position === Position.Left) {
				// 	this.yAxisG.attr("transform", `translate(0, 0)`).call(d3.axisLeft(this.yScale));
				// } else if (this.yAxisSettings.position === Position.Right) {
				// 	this.yAxisG.attr("transform", `translate(${this.width}, 0)`).call(d3.axisRight(this.yScale));
				// }

				this.drawXYAxis();

				if (this.isExpandAllApplied) {
					this.expandAllCategoriesName.forEach((d, i) => {
						this[`${d}Scale`].domain(this[`${d}ScaleNewDomain`]);
					});
				}

				CallExpandAllYScaleOnAxisGroup(this, this.width * 0.06);

				this.drawLollipopChart();

				// this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
				// if (this.isHasMultiMeasure) {
				// 	this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
				// }

				// this.updatePiePositionOnBrushMove();
			} else {
				this.isVerticalBrushDisplayed = false;
				this.isScrollBrushDisplayed = false;
				this.brushWidth = 0;
				this.drawXYAxis();
			}
		};

		const brush = d3
			.brushY()
			.extent([
				[0, 0],
				[this.brushWidth, this.height],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(this.height / barDistance);
		const totalBar = totalBarsCount;
		const heightByExpectedBar = (expectedBar * this.height) / totalBar;

		this.brushG
			.attr(
				"transform",
				`translate(${this.viewPortWidth - this.brushWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width}, ${
					this.margin.top ? this.margin.top : 0
				})`
			)
			.call(brush)
			.call(brush.move, [0, heightByExpectedBar]);

		this.brushG.selectAll("rect").attr("width", this.brushWidth).attr("rx", 4).attr("ry", 4).attr("cursor", "default");
		this.brushG.selectAll(".handle").remove();
	}

	drawHorizontalBrush(self: Visual, config: IBrushConfig): void {
		const smallMultiplesGridItemId = config.smallMultiplesGridItemId;
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const totalBarsCount: number = config.totalBarsCount;
		const scaleWidth: number = config.scaleWidth;
		const scaleHeight: number = config.scaleHeight;
		const categoricalData: any = JSON.parse(JSON.stringify(config.categoricalData));

		// const newWidth = (this.chartSettings.lollipopCategoryWidth * this.width / this.scaleBandWidth);
		const xScaleDomain = this.brushScaleBand.domain();
		this.brushScaleBand.range(this.xScale.range());

		categoricalData.categories.forEach((d, i) => {
			if (i < categoricalData.categories.length - 1) {
				const xScaleCopy = self.xScale.copy();
				self[d.source.displayName + "Scale"] = xScaleCopy;
				self[`${d.source.displayName}ScaleDomain`] = d.values;
			}
		});

		// const minPos = this.xScale(xScaleDomain[this.yAxisSettings.position === Position.Left ? 0 : xScaleDomain.length - 1]);
		const brushed = ({selection}) => {
			if (this.isExpandAllApplied) {
				this.expandAllCategoriesName.forEach((d) => {
					if (self[`${d}ScaleDomain`]) {
						self[`${d}ScaleNewDomain`] = [];
					}
				});
			}

			const newXScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.xScale.range();

			xScaleDomain.forEach((d, i) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newXScaleDomain.push(d);

					if (self.isExpandAllApplied) {
						self.expandAllCategoriesName.forEach((d) => {
							if (self[`${d}ScaleDomain`]) {
								self[`${d}ScaleNewDomain`].push(self[`${d}ScaleDomain`][i]);
							}
						});
					}
				}
			});

			this.newScaleDomainByBrush = newXScaleDomain;

			if (this.newScaleDomainByBrush.length < xScaleDomain.length || this.isExpandAllApplied) {
				const startIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.indexOf(this.newScaleDomainByBrush[0]);
				const endIndex = categoricalData.categories[this.categoricalCategoriesLastIndex].values.lastIndexOf(
					this.newScaleDomainByBrush[this.newScaleDomainByBrush.length - 1]
				);

				const categoricalData2 = JSON.parse(JSON.stringify(categoricalData));

				categoricalData2.categories.forEach((d, i) => {
					d.values = categoricalData2.categories[i].values.slice(startIndex, endIndex + 1);
				});

				categoricalData2.values.forEach((d, i) => {
					d.values = categoricalData2.values[i].values.slice(startIndex, endIndex + 1);

					if (d.highlights) {
						d.highlights = categoricalData2.values[i].highlights.slice(startIndex, endIndex + 1);
					}
				});

				this.sortSubcategoryData();
				this.setCategoricalDataFields(categoricalData2);
				this.setChartData(categoricalData2);

				this.setColorsByDataColorsSettings();

				if (this.rankingSettings.category.enabled || this.rankingSettings.subCategory.enabled) {
					this.setRemainingAsOthersDataColor();
				}

				// this.lineSelection
				// 	.attr("x1", (d) => {
				// 		return this.xScale(d.city);
				// 	})
				// 	.attr("x2", (d) => {
				// 		return this.xScale(d.city);
				// 	})
				// 	.attr("opacity", (d) => {
				// 		return this.xScale(d.city) ? 1 : 0;
				// 	});

				// this.circle1Selection
				// 	.attr("cx", (d) => {
				// 		return this.xScale(d.city) ? this.xScale(d.city) : 0;
				// 	})
				// 	.attr("opacity", (d) => {
				// 		return this.xScale(d.city) ? 1 : 0;
				// 	});

				// this.circle2Selection
				// 	.attr("cx", (d) => {
				// 		return this.xScale(d.city) ? this.xScale(d.city) : 0;
				// 	})
				// 	.attr("opacity", (d) => {
				// 		return this.xScale(d.city) ? 1 : 0;
				// 	});

				// this.xGridLinesSelection.attr("x1", (d) => this.xScale(d)).attr("x2", (d) => this.xScale(d));

				this.drawXYAxis();

				if (self.isExpandAllApplied) {
					self.expandAllCategoriesName.forEach((d, i) => {
						self[`${d}Scale`].domain(self[`${d}ScaleNewDomain`]);
					});
				}

				CallExpandAllXScaleOnAxisGroup(this, scaleWidth, scaleHeight);

				this.drawLollipopChart();

				// if (this.xAxisSettings.position === Position.Bottom) {
				// 	this.xAxisG
				// 		.attr("transform", "translate(0," + this.height + ")")
				// 		.call(d3.axisBottom(this.xScale))
				// 		.selectAll("text");
				// } else if (this.xAxisSettings.position === Position.Top) {
				// 	this.xAxisG
				// 		.attr("transform", "translate(0," + 0 + ")")
				// 		.call(d3.axisTop(this.xScale))
				// 		.selectAll("text")
				// 		.attr("transform", `translate(-10, -10)rotate(${this.xAxisSettings.labelTilt})`);
				// }

				// this.setXAxisTickStyle();
				// this.drawData1Labels(this.chartData);
				// if (this.isHasMultiMeasure) {
				// 	this.drawData2Labels(this.chartData);
				// }
				// this.updatePiePositionOnBrushMove();
			} else {
				this.isHorizontalBrushDisplayed = false;
				this.isScrollBrushDisplayed = false;
				this.brushHeight = 0;
				this.drawXYAxis();
			}
		};

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[this.width, this.brushHeight],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleWidth / barDistance);
		const totalBar = totalBarsCount;
		let widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

		widthByExpectedBar = widthByExpectedBar > this.width ? this.width : widthByExpectedBar;

		d3.select(brushG)
			.attr("transform", `translate(${this.margin.left ? this.margin.left : 0}, ${brushYPos})`)
			.call(brush as any)
			.call(brush.move as any, [0, widthByExpectedBar]);

		d3.select(brushG).selectAll("rect").attr("height", self.brushHeight).attr("rx", 4).attr("ry", 4).attr("cursor", "default");
		d3.select(brushG).selectAll(".handle").remove();
	}

	initVerticalBrush(config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const scaleWidth: number = config.scaleWidth;
		const scaleHeight: number = config.scaleHeight;
		const brushDomain = this.brushScaleBand.domain();

		const brushed = ({selection}) => {
			const newYScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.yScale.range();

			brushDomain.forEach((d) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newYScaleDomain.push(d);
				}
			});

			this.newScaleDomainByBrush = newYScaleDomain;
		};

		const brush = d3
			.brushY()
			.extent([
				[0, 0],
				[this.brushWidth, this.height],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleHeight / barDistance);
		const totalBar = this.totalLollipopCount;
		const heightByExpectedBar = (expectedBar * scaleHeight) / totalBar;

		d3.select(brushG)
			.attr(
				"transform",
				`translate(${this.viewPortWidth - this.brushWidth - this.settingsPopupOptionsWidth - this.legendViewPort.width}, ${this.margin.top})`
			)
			.call(brush)
			.call(brush.move, [0, heightByExpectedBar]);
		d3.select(brushG).selectAll(".handle").remove();
	}

	initHorizontalBrush(config: IBrushConfig): void {
		const brushG: SVGElement = config.brushG;
		const brushXPos: number = config.brushXPos;
		const brushYPos: number = config.brushYPos;
		const barDistance: number = config.barDistance;
		const scaleWidth: number = config.scaleWidth;
		const brushDomain = this.brushScaleBand.domain();

		const brushed = ({selection}) => {
			const newXScaleDomain = [];
			let brushArea = selection;
			if (brushArea === null) brushArea = this.xScale.range();

			brushDomain.forEach((d) => {
				const pos = this.brushScaleBand(d);
				if (pos >= brushArea[0] && pos <= brushArea[1]) {
					newXScaleDomain.push(d);
				}
			});

			this.newScaleDomainByBrush = newXScaleDomain;
		};

		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[this.width, this.brushHeight],
			])
			.on("brush", brushed);

		const expectedBar = Math.ceil(scaleWidth / barDistance);
		const totalBar = this.totalLollipopCount;
		const widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

		d3.select(brushG)
			.attr("transform", `translate(${brushXPos}, ${brushYPos})`)
			.call(brush as any)
			.call(brush.move as any, [0, widthByExpectedBar]);
		d3.select(brushG).selectAll(".handle").remove();
	}

	updatePiePositionOnBrushMove(): void {
		if (this.chartSettings.lollipopType !== LollipopType.Circle) {
			const pie1ViewBoxRadius = this.pie1Radius + (this.pie1Radius * (this.pieEmphasizeScaleSize * 2)) / 100;
			const pie2ViewBoxRadius = this.pie2Radius + (this.pie2Radius * (this.pieEmphasizeScaleSize * 2)) / 100;
			this.pieG
				.selectAll("#pie1ForeignObject")
				.attr("x", (d) => {
					const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d["value1"] : d.city));
					return pieX > 0 ? pieX - pie1ViewBoxRadius : pieX - pie1ViewBoxRadius / 2;
				})
				.attr("y", (d) => {
					const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d["value1"]));
					return pieY > 0 ? pieY - pie1ViewBoxRadius : pieY - pie1ViewBoxRadius / 2;
				})
				.attr("opacity", (d) => {
					if (this.isHorizontalChart) {
						return this.yScale(d.city) ? 1 : 0;
					} else {
						return this.xScale(d.city) ? 1 : 0;
					}
				});

			if (this.isHasMultiMeasure) {
				this.pieG
					.selectAll("#pie2ForeignObject")
					.attr("x", (d) => {
						const pieX = this.getPieX(this.xScale(this.isHorizontalChart ? d["value2"] : d.city));
						return pieX > 0 ? pieX - pie2ViewBoxRadius : pieX - pie2ViewBoxRadius / 2;
					})
					.attr("y", (d) => {
						const pieY = this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d["value2"]));
						return pieY > 0 ? pieY - pie2ViewBoxRadius : pieY - pie2ViewBoxRadius / 2;
					})
					.attr("opacity", (d) => {
						if (this.isHorizontalChart) {
							return this.yScale(d.city) ? 1 : 0;
						} else {
							return this.xScale(d.city) ? 1 : 0;
						}
					});
			}
		}
	}

	getCategoricalValuesIndexByKey(key: string): number {
		return this.visualUpdateOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	isHasCategoricalValuesIndexByKey(key: string): number {
		return this.visualUpdateOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
	}

	getCategoricalCategoriesIndexByKey(key: string): number {
		return this.visualUpdateOptions.options.dataViews[0].categorical.categories.findIndex((data) => data.source.roles[key] === true);
	}

	drawLollipopChart(): void {
		this.isLollipopChartDrawn = true;
		// this.drawXYAxis();
		// this.drawXYAxisTitle();
		this.drawLines();

		const onCaseLollipopTypePie = () => {
			this.drawCircle1([]);
			this.drawCircle2([]);
			this.drawPie1Chart(this.chartData);
			if (this.isHasMultiMeasure) {
				this.drawPie2Chart(this.chartData);
			} else {
				this.drawPie2Chart([]);
			}
			// this.drawData1Labels([]);
			// if (this.isHasMultiMeasure) {
			// 	this.drawData2Labels([]);
			// } else {
			// 	this.drawData2Labels([]);
			// }
		};

		switch (this.chartSettings.lollipopType) {
			case LollipopType.Circle: {
				this.drawPie1Chart([]);
				this.drawPie2Chart([]);
				this.drawCircle1(this.chartData);
				this.drawCircle2(this.isHasMultiMeasure ? this.chartData : []);
				// this.drawData1Labels(this.circle1Settings.show ? this.chartData : []);
				// if (this.isHasMultiMeasure) {
				// 	this.drawData2Labels(this.circle2Settings.show ? this.chartData : []);
				// } else {
				// 	this.drawData2Labels([]);
				// }
				break;
			}
			case LollipopType.Pie: {
				onCaseLollipopTypePie();
				break;
			}
			case LollipopType.Donut: {
				onCaseLollipopTypePie();
				break;
			}
			case LollipopType.Rose: {
				onCaseLollipopTypePie();
				break;
			}
		}
	}

	// Number Format
	getAutoUnitFormattedNumber(number: number): string {
		// const numberSettings = this.numberSettings;
		// if (number < 1.0e6) {
		// 	return this.decimalSeparator(+(number / 1.0e3).toFixed(numberSettings.decimalPlaces)) + numberSettings.thousands;
		// } else if (number >= 1.0e6 && number < 1.0e9) {
		// 	return this.decimalSeparator(+(number / 1.0e6).toFixed(numberSettings.decimalPlaces)) + numberSettings.million;
		// } else if (number >= 1.0e9 && number < 1.0e12) {
		// 	return this.decimalSeparator(+(number / 1.0e9).toFixed(numberSettings.decimalPlaces)) + numberSettings.billion;
		// } else if (number >= 1.0e12) {
		// 	return this.decimalSeparator(+(number / 1.0e12).toFixed(numberSettings.decimalPlaces)) + numberSettings.trillion;
		// }

		return number.toString();
	}

	thousandsSeparator(number: number): string {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.numberSettings.thousandsSeparator);
	}

	decimalSeparator(number: number): string {
		const decimals = (number - Math.floor(number)).toFixed(this.numberSettings.decimalPlaces);
		const fNumber = (number + "").split(".")[0] + (+decimals > 0 ? this.numberSettings.decimalSeparator + (decimals + "").split(".")[1] : "");
		// return this.thousandsSeparator(+fNumber);
		return fNumber;
	}

	getFormattedNumber(number: number): string {
		return number.toString();

		// const numberSettings = this.numberSettings;

		// if (!numberSettings.show) {
		// 	return number + "";
		// }

		// let formattedNumber: string = "0";
		// switch (numberSettings.displayUnits) {
		// 	case DisplayUnits.Auto: {
		// 		formattedNumber = this.getAutoUnitFormattedNumber(number);
		// 		break;
		// 	}
		// 	case DisplayUnits.None: {
		// 		formattedNumber = this.thousandsSeparator(parseInt(number.toFixed(numberSettings.decimalPlaces)));
		// 		break;
		// 	}
		// 	case DisplayUnits.Thousands: {
		// 		formattedNumber = this.decimalSeparator(+(number / 1.0e3).toFixed(numberSettings.decimalPlaces)) + numberSettings.thousands;
		// 		break;
		// 	}
		// 	case DisplayUnits.Millions: {
		// 		formattedNumber = this.decimalSeparator(+(number / 1.0e6).toFixed(numberSettings.decimalPlaces)) + numberSettings.million;
		// 		break;
		// 	}
		// 	case DisplayUnits.Billions: {
		// 		formattedNumber = this.decimalSeparator(+(number / 1.0e9).toFixed(numberSettings.decimalPlaces)) + numberSettings.billion;
		// 		break;
		// 	}
		// 	case DisplayUnits.Trillions: {
		// 		formattedNumber = this.decimalSeparator(+(number / 1.0e12).toFixed(numberSettings.decimalPlaces)) + numberSettings.trillion;
		// 		break;
		// 	}
		// 	default: {
		// 		formattedNumber = this.getAutoUnitFormattedNumber(number);
		// 	}
		// }

		// return numberSettings.prefix + " " + formattedNumber + " " + numberSettings.suffix;
	}

	// Data Labels
	getDataLabelDisplayStyle(labelEle: any): string {
		if (this.dataLabelsSettings.placement === DataLabelsPlacement.Inside) {
			const labelTextWidth = (d3.select(labelEle).select(".dataLabelText").node() as SVGSVGElement).getBBox().width;
			return labelTextWidth > this.circle1Radius * 2 ? "none" : "block";
		} else if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			const prop = labelEle.getBoundingClientRect();
			// let marginLeft = this.margin.left + (this.visualUpdateOptions.options.isInFocus === true ? this.settingsPopupOptionsWidth : 0);
			// let marginTop = this.margin.top + this.settingsBtnHeight - (this.visualUpdateOptions.options.isInFocus === true ? this.settingsPopupOptionsHeight : 0);
			let marginLeft = this.margin.left;
			let marginRight = this.margin.right;
			let marginTop = this.margin.top;
			let marginBottom = this.margin.bottom;
			const settingsBtnHeight = this.settingsBtnHeight;
			const legendPosition = this.legendSettings.position;

			if (this.legendSettings.show) {
				if (legendPosition === ILegendPosition.Left || legendPosition === ILegendPosition.LeftCenter) {
					marginLeft += this.legendViewPort.width;
				}
				if (legendPosition === ILegendPosition.Right || legendPosition === ILegendPosition.RightCenter) {
					marginRight -= this.legendViewPort.width;
				}
				if (legendPosition === ILegendPosition.Top || legendPosition === ILegendPosition.TopCenter) {
					marginTop += this.legendViewPort.height;
				}
				if (legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
					marginBottom += this.legendViewPort.height;
				}
			}

			if (
				prop.x - this.settingsPopupOptionsWidth < marginLeft ||
				prop.bottom > this.viewPortHeight - marginBottom ||
				prop.top - settingsBtnHeight < marginTop ||
				prop.right > this.viewPortWidth - marginRight
			) {
				return "none";
			} else {
				return "block";
			}
		}
	}

	getDataLabelsFontSize(isData2Label: boolean = false): number {
		const circleRadius = isData2Label ? this.circle2Radius : this.circle1Radius;
		if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			return this.dataLabelsSettings.fontSize;
		}
		if (this.dataLabelsSettings.fontSizeType === DataLabelsFontSizeType.Auto) {
			const fontSize = circleRadius / 1.4;
			this.dataLabelsSettings.fontSize = fontSize;
			return fontSize;
		} else {
			return this.dataLabelsSettings.fontSize;
		}
	}

	setDataLabelsFormatting(labelSelection: any, textSelection: any, rectSelection: any, isData2Label: boolean = false): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const key = isData2Label ? "value2" : "value1";

		labelSelection
			.attr("class", "dataLabelG")
			.attr("display", "block")
			.attr("opacity", dataLabelsSettings.show ? "1" : "0")
			.style("pointer-events", "none");

		textSelection
			.classed("dataLabelText", true)
			.attr("fill", dataLabelsSettings.color)
			.attr("text-anchor", "middle")
			.attr("dy", "0.02em")
			.attr("font-size", this.getDataLabelsFontSize(isData2Label))
			.style("font-family", dataLabelsSettings.fontFamily)
			// .style('font-weight', dataLabelsSettings.fontStyle === FontStyle.Bold ? 'bold' : '')
			// .style('font-style', dataLabelsSettings.fontStyle === FontStyle.Italic ? 'italic' : '')
			.text((d) => this.getFormattedNumber(d[key]));

		rectSelection
			.classed("dataLabelRect", true)
			.attr("width", 0)
			.attr("width", function () {
				const getBBox = (d3.select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
				return getBBox.width + dataLabelsSettings.fontSize;
			})
			.attr("height", 0)
			.attr("height", function () {
				const getBBox = (d3.select(this.parentNode).select("text").node() as SVGSVGElement).getBBox();
				return getBBox.height + dataLabelsSettings.fontSize * 0.4;
			})
			.attr("rx", 4)
			.attr("ry", 4)
			.attr("fill", dataLabelsSettings.backgroundColor)
			.attr("opacity", "0");

		if (dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
			rectSelection.attr("fill-opacity", `${100 - dataLabelsSettings.transparency}% `).attr("opacity", dataLabelsSettings.showBackground ? "1" : "0");
		}

		textSelection.attr("transform", function () {
			const bBox = (d3.select(this.parentNode).select("rect").node() as SVGSVGElement).getBBox();
			return `translate(${bBox.width / 2},
	            ${bBox.height - 1.5 - dataLabelsSettings.fontSize * 0.4})`;
		});
	}

	getDataLabelXY(d: ILollipopChartRow, isPie2: boolean = false): {x: number; y: number} {
		let x = 0;
		let y = 0;

		if (this.isHorizontalChart) {
			if (this.chartSettings.lollipopType === LollipopType.Circle) {
				x = this.getCircleCX(this.xScale(isPie2 ? d.value2 : d.value1));
				y = this.getCircleCY(this.yScale(d.city));
			}
		} else {
			if (this.chartSettings.lollipopType === LollipopType.Circle) {
				x = this.getCircleCX(this.xScale(d.city));
				y = this.getCircleCY(this.yScale(isPie2 ? d.value2 : d.value1));
			}
		}
		return {x, y};
	}

	transformHorizontalData1LabelOutside(labelSelection: any, labelDistance: number): void {
		const dataLabelsSettings = this.dataLabelsSettings;

		const fn = (d: any, bBox: any) => {
			const XY = this.getDataLabelXY(d);
			const x = XY.x;
			const y = XY.y;
			if (this.isHasMultiMeasure) {
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 < d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			} else {
				if (this.yAxisSettings.position === Position.Left) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformVerticalData1LabelOutside(labelSelection: any, labelDistance: number): void {
		const dataLabelsSettings = this.dataLabelsSettings;

		const fn = (d: any, bBox: any) => {
			const XY = this.getDataLabelXY(d);
			const x = XY.x;
			const y = XY.y;
			if (this.isHasMultiMeasure) {
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 < d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + labelDistance + bBox.width}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				}
			} else {
				if (this.xAxisSettings.position === Position.Bottom) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + bBox.width + labelDistance}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformData1LabelOutside(labelSelection: any): void {
		const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ? this.circle1Radius / 0.7 : this.pie1Radius / 0.7;

		if (this.isHorizontalChart) {
			this.transformHorizontalData1LabelOutside(labelSelection, labelDistance);
		} else {
			this.transformVerticalData1LabelOutside(labelSelection, labelDistance);
		}
	}

	transformData2LabelOutside(labelSelection: any): void {
		const dataLabelsSettings = this.dataLabelsSettings;
		const labelDistance = this.chartSettings.lollipopType === LollipopType.Circle ? this.circle2Radius / 0.7 : this.pie2Radius / 0.7;

		const fn = (d, bBox) => {
			if (this.isHorizontalChart) {
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.yAxisSettings.position === Position.Left && d.value1 < d.value2) ||
					(this.yAxisSettings.position === Position.Right && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x + labelDistance},
	                        ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x + labelDistance},
	                        ${y + bBox.width / 2}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width - labelDistance},
	                    ${y - bBox.height / 2}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height - labelDistance},
	                    ${y + bBox.width / 2}), rotate(${270})`;
					}
				}
			} else {
				const XY = this.getDataLabelXY(d, true);
				const x = XY.x;
				const y = XY.y;
				if (
					(this.xAxisSettings.position === Position.Bottom && d.value1 < d.value2) ||
					(this.xAxisSettings.position === Position.Top && d.value1 > d.value2)
				) {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y - labelDistance - bBox.height}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y - labelDistance}), rotate(${270})`;
					}
				} else {
					if (dataLabelsSettings.orientation === Orientation.Horizontal) {
						return `translate(${x - bBox.width / 2},
	                    ${y + labelDistance}), rotate(${0})`;
					} else {
						return `translate(${x - bBox.height / 2},
	                    ${y + labelDistance + bBox.width}), rotate(${270})`;
					}
				}
			}
		};

		labelSelection.attr("transform", function (d) {
			const bBox = this.getBBox();
			return fn(d, bBox);
		});
	}

	transformData1LabelInside(labelsSelection: any): void {
		const fn = (d, labelBBox: any) => {
			const x = this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value1 : d.city));
			const y = this.getCircleCY(this.yScale(this.isHorizontalChart ? d.city : d.value1));
			const transX = x - labelBBox.width / 2;
			const transY = y - labelBBox.height / 2;
			return `translate(${transX}, ${transY})`;
		};

		labelsSelection.attr("transform", function (d) {
			const labelBBox = this.getBBox();
			return fn(d, labelBBox);
		});
	}

	transformData2LabelInside(labelsSelection: any): void {
		const fn = (d, labelBBox) => {
			const x = this.getCircleCX(this.xScale(this.isHorizontalChart ? d.value2 : d.city));
			const y = this.getCircleCY(this.yScale(this.isHorizontalChart ? d.city : d.value2));
			const transX = x - labelBBox.width / 2;
			const transY = y - labelBBox.height / 2;
			return `translate(${transX}, ${transY})`;
		};

		labelsSelection.attr("transform", function (d) {
			const labelBBox = this.getBBox();
			return fn(d, labelBBox);
		});
	}

	drawData1Labels(data: ILollipopChartRow[]): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			return this.isHorizontalChart ? this.yScale(data.city) : this.xScale(data.city);
		});

		const dataLabelGSelection = this.dataLabels1G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");

				const textSelection = dataLabelGSelection.append("text");

				const rectSelection = dataLabelGSelection.append("rect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData1LabelOutside(dataLabelGSelection);
				} else {
					this.transformData1LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");

				const textSelection = dataLabelGSelection.select(".dataLabelText");

				const rectSelection = dataLabelGSelection.select(".dataLabelRect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData1LabelOutside(dataLabelGSelection);
				} else {
					this.transformData1LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			}
		);

		this.dataLabels1G.selectAll(".dataLabelG").select("text").raise();
	}

	drawData2Labels(data: ILollipopChartRow[]): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();

		const labelsData = data.filter((data) => {
			return this.isHorizontalChart ? this.yScale(data.city) : this.xScale(data.city);
		});

		const dataLabelGSelection = this.dataLabels2G.selectAll(".dataLabelG").data(labelsData);

		dataLabelGSelection.join(
			(enter) => {
				const dataLabelGSelection = enter.append("g");

				const textSelection = dataLabelGSelection.append("text");

				const rectSelection = dataLabelGSelection.append("rect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData2LabelOutside(dataLabelGSelection);
				} else {
					this.transformData2LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			},
			(update) => {
				const dataLabelGSelection = update.attr("class", "dataLabelG");

				const textSelection = dataLabelGSelection.select(".dataLabelText");

				const rectSelection = dataLabelGSelection.select(".dataLabelRect");

				this.setDataLabelsFormatting(dataLabelGSelection, textSelection, rectSelection, true);
				if (this.dataLabelsSettings.placement === DataLabelsPlacement.Outside) {
					this.transformData2LabelOutside(dataLabelGSelection);
				} else {
					this.transformData2LabelInside(dataLabelGSelection);
				}

				const fn = (ele: any) => {
					return this.getDataLabelDisplayStyle(ele);
				};

				dataLabelGSelection.attr("display", function () {
					return fn(this);
				});
			}
		);

		this.dataLabels2G.selectAll(".dataLabelG").select("text").raise();
	}

	drawTooltip(): void {
		this.tooltipServiceWrapper.addTooltip(
			d3.selectAll(".chart-circle1"),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, true)),
			(datapoint: any) => datapoint.selectionId
		);

		this.tooltipServiceWrapper.addTooltip(
			d3.selectAll(".chart-circle2"),
			(datapoint: any) => (this.isHasMultiMeasure ? getClevelandTooltipData(datapoint) : getTooltipData(datapoint, false)),
			(datapoint: any) => datapoint.selectionId
		);

		const getTooltipData = (value: ILollipopChartRow, isCircle1: boolean): VisualTooltipDataItem[] => {
			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: typeof value.city === "string" ? value.city.toUpperCase() : value.city,
					color: "transparent",
				},
				{
					displayName: isCircle1 ? this.measure1DisplayName : this.measure2DisplayName,
					value: isCircle1 ? this.getFormattedNumber(value.value1) : this.getFormattedNumber(value.value2),
					color: value.styles.circle1.fillColor,
				},
			];

			value.tooltipFields.forEach((data) => {
				tooltipData.push({
					displayName: data.displayName,
					value: typeof data.value === "number" ? this.getFormattedNumber(data.value) : data.value,
					color: data.color ? data.color : "transparent",
				});
			});

			return tooltipData;
		};

		const getClevelandTooltipData = (value: ILollipopChartRow): VisualTooltipDataItem[] => {
			const tooltipData: TooltipData[] = [
				{
					displayName: this.categoryDisplayName,
					value: typeof value.city === "string" ? value.city.toUpperCase() : value.city,
					color: "transparent",
				},
				{
					displayName: this.measure1DisplayName,
					value: this.getFormattedNumber(value.value1),
					color: value.styles.circle1.fillColor,
				},
				{
					displayName: this.measure2DisplayName,
					value: this.getFormattedNumber(value.value2),
					color: value.styles.circle2.fillColor,
				},
			];

			value.tooltipFields.forEach((data) => {
				tooltipData.push({
					displayName: data.displayName,
					value: typeof data.value === "number" ? this.getFormattedNumber(data.value) : data.value,
					color: data.color ? data.color : "transparent",
				});
			});
			return tooltipData;
		};
	}

	// XY Axis Title
	drawXYAxisTitle(): void {
		const xAxisSettings = this.xAxisSettings;
		const yAxisSettings = this.yAxisSettings;

		this.xAxisTitleText
			.attr("fill", xAxisSettings.titleColor)
			.attr("font-size", xAxisSettings.titleFontSize)
			.style("font-family", xAxisSettings.titleFontFamily)
			.style("display", xAxisSettings.isDisplayTitle ? "block" : "none");

		this.yAxisTitleText
			.attr("fill", yAxisSettings.titleColor)
			.attr("font-size", yAxisSettings.titleFontSize)
			.style("font-family", this.yAxisSettings.titleFontFamily)
			.style("display", yAxisSettings.isDisplayTitle ? "block" : "none");

		const xAxisTitle = this.isHorizontalChart ? this.valuesTitle : this.categoryTitle;
		if (!xAxisSettings.titleName) {
			xAxisSettings.titleName = xAxisTitle;
			xAxisSettings.titleName = xAxisTitle;
		}
		this.xAxisTitleText.text(xAxisSettings.titleName ? xAxisSettings.titleName : xAxisTitle);

		const yAxisTitle = this.isHorizontalChart ? this.categoryTitle : this.valuesTitle;
		if (!yAxisSettings.titleName) {
			yAxisSettings.titleName = yAxisTitle;
			yAxisSettings.titleName = yAxisTitle;
		}
		this.yAxisTitleText.text(yAxisSettings.titleName ? yAxisSettings.titleName : yAxisTitle);

		if (xAxisSettings.position === Position.Bottom) {
			this.xAxisTitleG.attr(
				"transform",
				`translate(${this.width / 2}, ${this.height + this.margin.bottom - this.brushHeight - this.xAxisTitleMargin})`
			);
		} else if (xAxisSettings.position === Position.Top) {
			this.xAxisTitleG.attr("transform", `translate(${this.width / 2}, ${-this.margin.top + 2 * this.xAxisTitleMargin})`);
		}

		if (yAxisSettings.position === Position.Left) {
			this.yAxisTitleG.attr("transform", `translate(${-this.margin.left + this.yAxisTitleMargin}, ${this.height / 2})`);
		} else if (yAxisSettings.position === Position.Right) {
			this.yAxisTitleG.attr(
				"transform",
				`translate(${this.width + this.margin.right - this.brushWidth / 2 - this.yAxisTitleMargin}, ${this.height / 2})`
			);
		}
	}

	setScaleBandwidth(): void {
		const clonedXScale = this.isHorizontalChart ? this.yScale.copy() : this.xScale.copy();
		this.scaleBandWidth = clonedXScale.padding(0).bandwidth();
		// if (!this.chartSettings.islollipopCategoryWidthChange || this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Auto) {
		// 	const maxRadius = d3.max([this.circle1Settings.circleRadius, this.circle2Settings.circleRadius]);
		// 	const circleDDiff = maxRadius * 2 + maxRadius * 2 - Math.floor(this.scaleBandWidth);
		// 	this.chartSettings.lollipopCategoryWidth = Math.floor(this.scaleBandWidth) + circleDDiff;
		// 	// CHART_SETTINGS.lollipopCategoryWidth = Math.floor(this.chartSettings.lollipopCategoryWidth);
		// }

		// if (this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Custom) {
		// 	// CHART_SETTINGS.lollipopCategoryWidth = Math.round(this.scaleBandWidth);
		// }
	}

	// Scale & Axis
	setXAxisTickStyle(): void {
		const THIS = this;
		const xAxisSettings = this.xAxisSettings;
		let isApplyTilt: boolean;
		let xAxisMaxHeight: number = 0;
		let xAxisTickHeight: number = 0;

		if (!this.isHorizontalChart) {
			const xAxisDomain: string[] = this.xScale.domain();
			const xAxisTicks: string[][] = xAxisDomain.map((text) => {
				const textProperties: TextProperties = {
					text: text,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};
				return GetWordsSplitByWidth(text, textProperties, this.scaleBandWidth, 3);
			});
			isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3 || this.isHorizontalBrushDisplayed;
			const xAxisTicksWidth = xAxisDomain.map((d) => {
				const textProperties: TextProperties = {
					text: d + "ab",
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};
				return textMeasurementService.measureSvgTextWidth(textProperties);
			});
			const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth);
			xAxisMaxHeight = d3.min([this.height * 0.4, xAxisTicksMaxWidth]);

			const textProperties: TextProperties = {
				text: "X Axis",
				fontFamily: xAxisSettings.labelFontFamily,
				fontSize: xAxisSettings.labelFontSize + "px",
			};
			xAxisTickHeight = textMeasurementService.measureSvgTextHeight(textProperties);
		}

		this.xAxisG
			.selectAll("text")
			.attr("dx", isApplyTilt && !this.isHorizontalBrushDisplayed && !this.isExpandAllApplied ? "-10.5px" : "0")
			.attr("dy", isApplyTilt ? "-0.5em" : "0.32em")
			// .attr("dy", isApplyTilt ? "0" : "0.32em")
			.attr("fill", xAxisSettings.labelColor)
			.style("font-family", xAxisSettings.labelFontFamily)
			.attr("font-size", xAxisSettings.labelFontSize)
			.attr("display", xAxisSettings.isDisplayLabel ? "block" : "none")
			.attr("text-anchor", isApplyTilt ? "end" : "middle")
			// .attr("transform", () => {
			// 	if (xAxisSettings.position === Position.Bottom) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, 10)rotate(-${this.getXAxisLabelTilt()})`;
			// 	} else if (xAxisSettings.position === Position.Top) {
			// 		return `translate(${xAxisSettings.labelTilt > maxLabelTilt ? -10 : 0}, -10)rotate(${this.getXAxisLabelTilt()})`;
			// 	}
			// })
			.each(function () {
				const ele = d3.select(this);
				const text = ele.text();
				ele.text("");

				const textProperties: TextProperties = {
					text: text,
					fontFamily: xAxisSettings.labelFontFamily,
					fontSize: xAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart) {
					if (!isApplyTilt) {
						ele.attr("transform", `rotate(0)`);
						const words: string[] = GetWordsSplitByWidth(text, textProperties, THIS.scaleBandWidth - xAxisSettings.labelFontSize / 2, 3);
						words.forEach((d, i) => {
							ele
								.append("tspan")
								.attr("x", 0)
								.attr("dy", i * xAxisTickHeight)
								.text(d);
						});
					} else {
						const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, xAxisMaxHeight);
						ele.attr("transform", `rotate( ${THIS.isHorizontalBrushDisplayed || THIS.isExpandAllApplied ? -90 : -35})`);
						ele.append("tspan").text(truncatedText);
					}
				} else {
					ele.append("tspan").text(THIS.getFormattedNumber(parseFloat(text)));
				}
			})
			.each((d) => {
				if (this.isHorizontalChart && typeof d === "number") {
					this.setAxisNumberFormatting(this, d);
				}
			});
	}

	getXAxisLabelTilt(): number {
		let labelTilt = 30;
		if (this.xAxisSettings.isLabelAutoTilt) {
			if (this.viewPortWidth < 186) {
				labelTilt = 90;
			} else if (this.viewPortWidth > 378 && this.viewPortWidth < 576) {
				labelTilt = 60;
			} else if (this.viewPortWidth > 576 && this.viewPortWidth < 768) {
				labelTilt = 40;
			} else if (this.viewPortWidth > 768 && this.viewPortWidth < 992) {
				labelTilt = 25;
			} else if (this.viewPortWidth > 992 && this.viewPortWidth < 1200) {
				if (this.isHorizontalBrushDisplayed) {
					labelTilt = 25;
				} else {
					labelTilt = 0;
				}
			} else if (this.viewPortWidth > 1200) {
				if (this.isHorizontalBrushDisplayed) {
					labelTilt = 25;
				} else {
					labelTilt = 0;
				}
			}
		} else {
			labelTilt = this.xAxisSettings.labelTilt;
		}
		this.xAxisSettings.labelTilt = labelTilt;
		return labelTilt;
	}

	setYAxisTickStyle(): void {
		const THIS = this;
		const yAxisSettings = this.yAxisSettings;
		this.yAxisG
			.selectAll("text")
			.attr("x", "0")
			.attr("fill", yAxisSettings.labelColor)
			.style("font-family", yAxisSettings.labelFontFamily)
			.attr("font-size", yAxisSettings.labelFontSize)
			.attr("display", yAxisSettings.isDisplayLabel ? "block" : "none")
			.style("text-anchor", yAxisSettings.position === Position.Left ? "end" : "start")
			// .text((d: any) => {
			// 	if (!this.isHorizontalChart && typeof d === "number") {
			// 		return formatNumber(d, this.numberSettings, undefined);
			// 	}
			// 	return d;
			// })
			.each(function () {
				const ele = d3.select(this);
				const text = ele.text();
				ele.text("");

				const textProperties: TextProperties = {
					text: text,
					fontFamily: yAxisSettings.labelFontFamily,
					fontSize: yAxisSettings.labelFontSize + "px",
				};

				if (!THIS.isHorizontalChart) {
					ele.append("tspan").text(THIS.getFormattedNumber(parseFloat(text)));
				} else {
					const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, THIS.width * 0.06);
					ele.append("tspan").text(truncatedText);
				}
			});
	}

	trimXAxisTick(tickEle: any): void {
		const self = d3.select(tickEle);
		const textLength = self.node().getComputedTextLength();
		const minCharLen = d3.min([Math.round(this.xScaleWidth / 100), this.xAxisSettings.labelCharLimit]);
		const charLen = textLength > this.scaleBandWidth - 10 ? minCharLen : this.xAxisSettings.labelCharLimit;
		const text = self.text();
		if (text.length > charLen) {
			const newText = text.substr(0, charLen);
			self.text(newText + "..");
		}
	}

	trimYAxisTick(tickEle: any): void {
		const self = d3.select(tickEle);
		// const textLength = self.node().getComputedTextLength();
		const text = self.text();
		if (text.length > this.yAxisSettings.labelCharLimit) {
			const newText = text.substr(0, this.yAxisSettings.labelCharLimit);
			self.text(newText + "..");
		}
	}

	setAxisNumberFormatting(tickEle: any, number: number): void {
		const self = d3.select(tickEle);
		self.text(this.getFormattedNumber(number));
	}

	setXYAxisDomain(): void {
		const values = this.chartData.reduce((arr, d) => {
			return [...arr, d.value1, d.value2];
		}, []);

		let min = d3.min(this.isHasMultiMeasure ? values.map((val) => val) : this.chartData.map((d) => d.value1));
		min += min * 0.15;

		if (min > 0) {
			min = 0;
		}

		let max = d3.max(this.isHasMultiMeasure ? values.map((val) => val) : this.chartData.map((d) => d.value1));
		max += max * 0.15;

		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";

		if (this.isHorizontalChart) {
			this.xScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand();
			this.yScale = d3.scaleBand();
			this.yScale2 = d3.scaleBand();

			if (isLinearScale) {
				this.xScale.domain([min, max]);
			} else {
				this.xScale.domain(this.chartData.map((d) => d.value1));
			}

			this.yScale.domain(this.chartData.map((d) => d.city));
			this.yScale2.domain(this.chartData.map((d) => d.city));
		} else {
			this.xScale = d3.scaleBand();
			// this.xScale2 = d3.scaleBand();
			this.yScale = isLinearScale ? d3.scaleLinear().nice() : d3.scaleBand();

			this.xScale.domain(this.chartData.map((d) => d.city));
			// this.xScale2.domain(this.chartData.map((d) => d.city));
			if (isLinearScale) {
				this.yScale.domain([min, max]);
			} else {
				this.yScale.domain(this.chartData.map((d) => d.value1));
			}
		}
	}

	setXYAxisRange(xScaleWidth: number, yScaleHeight: number): void {
		if (this.isHorizontalChart) {
			this.xScale.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
			this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
			this.yScale2.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
		} else {
			this.xScale.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
			// this.xScale2.range(this.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
			this.yScale.range(this.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);
		}
	}

	callXYScaleOnAxisGroup(): void {
		if (this.xAxisSettings.position === Position.Bottom) {
			this.xAxisG.attr("transform", "translate(0," + this.height + ")").call(
				d3
					.axisBottom(this.xScale)
					.ticks(this.width / 90)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
			// .selectAll('text')
			// .attr('dy', '0.35em')
			// .attr('transform', `translate(-10, 10)rotate(-${this.visualSettings.xAxis.labelTilt})`)
		} else if (this.xAxisSettings.position === Position.Top) {
			this.xAxisG.attr("transform", "translate(0," + 0 + ")").call(
				d3
					.axisTop(this.xScale)
					.ticks(this.width / 90)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
			// .selectAll('text')
			// .attr('dy', '0.35em')
			// .attr('transform', `translate(-10, -10)rotate(${this.visualSettings.xAxis.labelTilt})`)
		}

		if (this.yAxisSettings.position === Position.Left) {
			this.yAxisG.attr("transform", `translate(0, 0)`).call(
				d3
					.axisLeft(this.yScale)
					.ticks(this.height / 70)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
		} else if (this.yAxisSettings.position === Position.Right) {
			this.yAxisG.attr("transform", `translate(${this.width}, 0)`).call(
				d3
					.axisRight(this.yScale)
					.ticks(this.height / 70)
					.tickFormat((d) => {
						return (typeof d === "string" && this.isExpandAllApplied ? d.split("-")[0] : d) as string;
					})
			);
		}
	}

	xGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.xGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", (d) => this.xScale(d))
			.attr("x2", (d) => this.xScale(d))
			.attr("y1", this.margin.top)
			.attr("y2", this.height)
			.attr("stroke", this.xGridSettings.lineColor)
			.attr("stroke-width", this.xGridSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.xGridSettings.lineType === LineType.Dotted
					? `0, ${this.xGridSettings.lineWidth * 8} `
					: `${this.xGridSettings.lineWidth * 10}, ${this.xGridSettings.lineWidth * 10}`
			)
			.style("display", this.xGridSettings.show ? "block" : "none");
	}

	yGridLinesFormatting(lineSelection: any): void {
		lineSelection
			.attr("class", this.yGridSettings.lineType)
			.classed("grid-line", true)
			.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", (d) => this.yScale(d))
			.attr("y2", (d) => this.yScale(d))
			.attr("stroke", this.yGridSettings.lineColor)
			.attr("stroke-width", this.yGridSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.yGridSettings.lineType === LineType.Dotted
					? `0, ${this.yGridSettings.lineWidth * 8} `
					: `${this.yGridSettings.lineWidth * 10}, ${this.yGridSettings.lineWidth * 10} `
			)
			.style("display", this.yGridSettings.show ? "block" : "none");
	}

	drawXGridLines(): void {
		const isLinearScale: boolean = typeof this.chartData.map((d) => d.value1)[0] === "number";
		const xScaleTicks = this.isHorizontalChart && isLinearScale ? this.xScale.ticks(this.width / 90) : this.xScale.domain();
		const gridLinesSelection = this.xGridLinesG.selectAll("line").data(xScaleTicks);
		this.xGridLinesSelection = gridLinesSelection.join(
			(enter) => {
				const lines = enter.append("line");
				this.xGridLinesFormatting(lines);
				return lines;
			},
			(update) => {
				this.xGridLinesFormatting(update);
				return update;
			}
		);
	}

	drawYGridLines(): void {
		const yScaleTicks = this.isHorizontalChart ? this.yScale.domain() : this.yScale.ticks(this.height / 70);
		const gridLinesSelection = this.yGridLinesG.selectAll("line").data(yScaleTicks);
		this.yGridLinesSelection = gridLinesSelection.join(
			(enter) => {
				const lines = enter.append("line");
				this.yGridLinesFormatting(lines);
				return lines;
			},
			(update) => {
				this.yGridLinesFormatting(update);
				return update;
			}
		);
	}

	setXScaleGHeight(): void {
		const xAxisSettings = this.xAxisSettings;
		const xAxisDomain: string[] = this.xScale.domain();
		const textProperties: TextProperties = {
			text: "X-Axis",
			fontFamily: xAxisSettings.labelFontFamily,
			fontSize: xAxisSettings.labelFontSize + "px",
		};

		if (!this.isHorizontalChart) {
			const xAxisTicksWidth = xAxisDomain.map((d) => {
				return textMeasurementService.measureSvgTextWidth({...textProperties, text: d});
			});
			const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
			const xAxisMaxHeight = d3.min([this.height * 0.4, xAxisTicksMaxWidth], (d) => d);

			if (!this.isHorizontalBrushDisplayed) {
				const xAxisTickHeight = textMeasurementService.measureSvgTextHeight(textProperties);
				const xAxisTicks: string[][] = xAxisDomain.map((text) => {
					return GetWordsSplitByWidth(text, {...textProperties, text: text}, this.xScale.bandwidth(), 3);
				});
				const isApplyTilt = xAxisTicks.flat(1).filter((d) => d.includes("...") || d.includes("....")).length > 3;
				const xAxisMaxWordHeight = d3.max(xAxisTicks, (d) => d.length) * xAxisTickHeight;
				this.xScaleGHeight = isApplyTilt ? xAxisMaxHeight : xAxisMaxWordHeight;
			} else {
				const xAxisTicks = xAxisDomain.map((text) => {
					return textMeasurementService.getTailoredTextOrDefault({...textProperties, text}, xAxisMaxHeight);
				});
				const xAxisTicksWidth = xAxisTicks.map((d) => {
					return textMeasurementService.measureSvgTextWidth({...textProperties, text: d});
				});
				const xAxisTicksMaxWidth = d3.max(xAxisTicksWidth, (d) => d);
				this.xScaleGHeight = xAxisTicksMaxWidth;
			}
		} else {
			this.xScaleGHeight = textMeasurementService.measureSvgTextHeight({...textProperties});
		}
	}

	setYScaleGWidth(): void {
		const yAxisSettings = this.yAxisSettings;
		const yAxisDomain: string[] = this.yScale.domain();
		const textProperties: TextProperties = {
			text: "X-Axis",
			fontFamily: yAxisSettings.labelFontFamily,
			fontSize: yAxisSettings.labelFontSize + "px",
		};

		if (!this.isHorizontalChart) {
			const yAxisTicks: string[] = this.yScale.ticks(this.height / 70);
			const yAxisTicksWidth = yAxisTicks.map((d) => {
				const textProperties: TextProperties = {
					text: !this.isHorizontalChart && typeof d === "number" ? formatNumber(d, this.numberSettings, undefined) : d,
					fontFamily: this.yAxisSettings.labelFontFamily,
					fontSize: this.yAxisSettings.labelFontSize + "px",
				};
				return textMeasurementService.measureSvgTextWidth(textProperties);
			});
			this.yScaleGWidth = d3.max(yAxisTicksWidth);
		} else {
			const yAxisTicks = yAxisDomain.map((text) => {
				return textMeasurementService.getTailoredTextOrDefault({...textProperties, text}, this.width * 0.06);
			});
			const yAxisTicksWidth = yAxisTicks.map((d) => {
				return textMeasurementService.measureSvgTextWidth({...textProperties, text: d});
			});
			const yAxisTicksMaxWidth = d3.max(yAxisTicksWidth, (d) => d);
			this.yScaleGWidth = yAxisTicksMaxWidth;
		}
	}

	drawXYAxis(): void {
		this.setXYAxisDomain();
		this.setXYAxisRange(this.width, this.height);

		// // // SET X-AXIS TICKS MAX HEIGHT
		this.setXScaleGHeight();

		// // // SET Y-AXIS TICKS MAX HEIGHT
		this.setYScaleGWidth();

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);

		// // // SET X-AXIS TICKS MAX HEIGHT
		this.setXScaleGHeight();

		// // // SET Y-AXIS TICKS MAX HEIGHT
		this.setYScaleGWidth();

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup();

		if (this.xAxisSettings.isDisplayLabel) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel) {
			this.setYAxisTickStyle();
		}

		this.xScaleGHeight = this.xAxisG.node().getBoundingClientRect().height;
		this.yScaleGWidth = this.yAxisG.node().getBoundingClientRect().width;

		this.setMargins();

		this.setXYAxisRange(this.width, this.height);
		this.setScaleBandwidth();
		this.callXYScaleOnAxisGroup();

		if (this.xAxisSettings.isDisplayLabel) {
			this.setXAxisTickStyle();
		}

		if (this.yAxisSettings.isDisplayLabel) {
			this.setYAxisTickStyle();
		}

		this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.xAxisG.selectAll(".tick").style("display", this.xAxisSettings.isDisplayLabel ? "block" : "none");
		this.yAxisG.selectAll(".tick").style("display", this.yAxisSettings.isDisplayLabel ? "block" : "none");

		// if (this.chartSettings.lollipopCategoryWidthType === lollipopCategoryWidthType.Custom) {
		// 	if (this.width > this.xScaleWidth && this.height > this.yScaleHeight) {
		// 		if (this.isHorizontalChart) {
		// 			this.setXYAxisRange(this.width, this.yScaleHeight);
		// 			this.setScaleBandwidth();
		// 		} else {
		// 			this.setXYAxisRange(this.xScaleWidth, this.height);
		// 			this.setScaleBandwidth();
		// 		}
		// 	}
		// }

		// this.container.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// this.callXYScaleOnAxisGroup();
		// this.setXAxisTickStyle();
		// this.setYAxisTickStyle();
		// this.drawXGridLines();
		// this.drawYGridLines();
	}

	// Lines
	setLineStrokeColor(): void {
		const lineColor = this.lineSettings.lineColor;
		if (this.isHasMultiMeasure && (lineColor === "rgb(91,121,185)" || lineColor === "rgba(91,121,185,1)")) {
			this.lineSettings.lineColor = "rgb(150,150,150,60)";
		}
	}

	setHorizontalLinesFormatting(linesSelection: any): void {
		this.setLineStrokeColor();
		linesSelection
			.attr("class", this.lineSettings.lineType)
			.classed("chart-line", true)
			.attr("x1", (d) => this.xScale(this.isHasMultiMeasure ? d.value2 : 0))
			.attr("x2", (d) => this.xScale(d.value1))
			.attr("y1", (d) => this.yScale(d.city) + this.scaleBandWidth / 2)
			.attr("y2", (d) => this.yScale(d.city) + this.scaleBandWidth / 2)
			.attr("stroke", (d) => d.styles.line.color)
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === LineType.Dotted
					? `0, ${this.lineSettings.lineWidth * 2} `
					: `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `
			)
			.style("display", this.lineSettings.show ? "block" : "none");
	}

	getLineStrokeWidth(): number {
		const strokeWidthScale = d3.scaleLinear().range([2, this.lineSettings.lineWidth]).domain([100, 1000]);
		const widthByScale = strokeWidthScale(this.width);
		return widthByScale < this.lineSettings.lineWidth ? widthByScale : this.lineSettings.lineWidth;
	}

	setVerticalLinesFormatting(linesSelection: any): void {
		this.setLineStrokeColor();
		linesSelection
			.attr("class", this.lineSettings.lineType)
			.classed("chart-line", true)
			.attr("x1", (d) => this.xScale(d.city) + this.scaleBandWidth / 2)
			.attr("x2", (d) => this.xScale(d.city) + this.scaleBandWidth / 2)
			.attr("y1", (d) => this.yScale(d.value1))
			.attr("y2", (d) => this.yScale(this.isHasMultiMeasure ? (d.value2 ? d.value2 : 0) : 0))
			.attr("stroke", (d) => d.styles.line.color)
			.attr("stroke-width", this.lineSettings.lineWidth)
			.attr("opacity", 1)
			.attr(
				"stroke-dasharray",
				this.lineSettings.lineType === LineType.Dotted
					? `0, ${this.lineSettings.lineWidth * 2} `
					: `${this.lineSettings.lineWidth * 2}, ${this.lineSettings.lineWidth * 2} `
			)
			.style("display", this.lineSettings.show ? "block" : "none");
	}

	drawLines(): void {
		const lineSelection = this.lineG.selectAll(".chart-line").data(this.chartData);

		if (this.isHorizontalChart) {
			this.lineSelection = lineSelection.join(
				(enter) => {
					const linesSelection = enter.append("line");
					this.setHorizontalLinesFormatting(linesSelection);
					return linesSelection;
				},
				(update) => {
					this.setHorizontalLinesFormatting(update);
					return update;
				}
			);
		} else {
			this.lineSelection = lineSelection.join(
				(enter) => {
					const linesSelection = enter.append("line");
					this.setVerticalLinesFormatting(linesSelection);
					return linesSelection;
				},
				(update) => {
					this.setVerticalLinesFormatting(update);
					return update;
				}
			);
		}
	}

	// Circle
	setCircle1Radius(): void {
		const maxCircleRadius = this.circle1Settings.maxCircleRadius;
		if (this.circle1Settings.circleSize === CircleSize.Auto) {
			if (this.isHorizontalChart) {
				this.circle1Radius = this.height * 0.04 < maxCircleRadius ? this.height * 0.04 : maxCircleRadius;
			} else {
				this.circle1Radius = this.width * 0.02 < maxCircleRadius ? this.width * 0.02 : maxCircleRadius;
			}
		} else {
			this.circle1Radius = this.circle1Settings.circleRadius;
		}
	}

	setCircle2Radius(): void {
		const maxCircleRadius = this.circle2Settings.maxCircleRadius;
		if (this.circle2Settings.circleSize === CircleSize.Auto) {
			if (this.isHorizontalChart) {
				this.circle2Radius = this.height * 0.04 < maxCircleRadius ? this.height * 0.04 : maxCircleRadius;
			} else {
				this.circle2Radius = this.width * 0.04 < maxCircleRadius ? this.width * 0.04 : maxCircleRadius;
			}
		} else {
			this.circle2Radius = this.circle2Settings.circleRadius;
		}
	}

	getOverflowCircleCXDiff(x: number): number {
		let diff = 0;
		if (this.yAxisSettings.position === Position.Left) {
			diff = x <= this.circle1Radius ? this.circle1Radius - x : 0;
		} else {
			diff = this.width - x <= this.circle1Radius ? this.circle1Radius - (this.width - x) : 0;
		}
		return diff;
	}

	getOverflowCircleCYDiff(y: number): number {
		let diff = 0;
		if (this.xAxisSettings.position === Position.Bottom) {
			diff = this.height - y <= this.circle1Radius ? this.circle1Radius - (this.height - y) : 0;
		} else {
			diff = y <= this.circle1Radius ? this.circle1Radius - y : 0;
		}
		return diff;
	}

	getCircleCX(x: number): number {
		const diff = this.getOverflowCircleCXDiff(x);
		return x ? (this.yAxisSettings.position === Position.Left ? x + diff : x - diff) : this.circle1Radius;
	}

	getCircleCY(y: number): number {
		const diff = this.getOverflowCircleCYDiff(y);
		return y ? (this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff) : this.circle1Radius;
	}

	setCircle1Formatting(circleSelection: any): void {
		this.setCircle1Radius();
		circleSelection
			.attr("class", "chart-circle1")
			.attr("cx", (d) => {
				const cx = this.xScale(this.isHorizontalChart ? d.value1 : d.city);
				return this.isHorizontalChart ? this.getCircleCX(cx) : cx + this.scaleBandWidth / 2;
			})
			.attr("cy", (d) => {
				const cy = this.yScale(this.isHorizontalChart ? d.city : d.value1);
				return !this.isHorizontalChart ? this.getCircleCY(cy) : cy + this.scaleBandWidth / 2;
			})
			.attr("r", this.circle1Radius)
			.attr("stroke", (d) => d.styles[CircleType.Circle1][CategoryDataColorProps.strokeColor])
			.attr("stroke-width", this.circle1Settings.strokeWidth)
			.attr("opacity", 1)
			.style("fill", (d) =>
				this.circle1Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle1][CategoryDataColorProps.fillColor] : "#fff"
			)
			.style("display", this.circle1Settings.show ? "block" : "none");
	}

	setCircle2Formatting(circleSelection: any): void {
		this.setCircle2Radius();
		circleSelection
			.attr("class", "chart-circle2")
			.attr("cx", (d) => {
				const cx = this.xScale(this.isHorizontalChart ? d.value2 : d.city);
				return this.isHorizontalChart ? this.getCircleCX(cx) : cx + this.scaleBandWidth / 2;
			})
			.attr("cy", (d) => {
				const cy = this.yScale(this.isHorizontalChart ? d.city : d.value2);
				return !this.isHorizontalChart ? this.getCircleCY(cy) : cy + this.scaleBandWidth / 2;
			})
			.attr("r", this.circle2Radius)
			.attr("stroke", (d) => d.styles[CircleType.Circle2][CategoryDataColorProps.strokeColor])
			.attr("stroke-width", this.circle2Settings.strokeWidth)
			.attr("opacity", 1)
			.style("fill", (d) =>
				this.circle2Settings.isCircleFilled === CircleFillOption.Yes ? d.styles[CircleType.Circle2][CategoryDataColorProps.fillColor] : "#fff"
			)
			.style("display", (d) => (this.circle2Settings.show && this.isHasMultiMeasure && d.value2 ? "block" : "none"));
	}

	drawCircle1(data: ILollipopChartRow[]): void {
		const circleSelection1 = this.circle1G.selectAll(".chart-circle1").data(data);
		this.circle1Selection = circleSelection1.join(
			(enter) => {
				const circleSelection = enter.append("circle");
				this.setCircle1Formatting(circleSelection);
				return circleSelection;
			},
			(update) => {
				this.setCircle1Formatting(update);
				return update;
			}
		);
	}

	drawCircle2(data: ILollipopChartRow[]): void {
		const circleSelection2 = this.circle2G.selectAll(".chart-circle2").data(data);
		this.circle2Selection = circleSelection2.join(
			(enter) => {
				const circleSelection = enter.append("circle");
				this.setCircle2Formatting(circleSelection);
				return circleSelection;
			},
			(update) => {
				this.setCircle2Formatting(update);
				return update;
			}
		);
	}

	// Pie
	setPie1Radius(): void {
		const maxPieRadius = this.pie1Settings.maxPieRadius;
		if (this.pie1Settings.pieSize === PieSize.Auto) {
			this.pie1Radius = this.scaleBandWidth / 4 < maxPieRadius ? this.scaleBandWidth / 4 : maxPieRadius;
		} else {
			this.pie1Radius = this.pie1Settings.pieRadius;
		}
	}

	setPie2Radius(): void {
		const maxPieRadius = this.pie2Settings.maxPieRadius;
		if (this.pie2Settings.pieSize === PieSize.Auto) {
			this.pie2Radius = this.scaleBandWidth / 4 < maxPieRadius ? this.scaleBandWidth / 4 : maxPieRadius;
		} else {
			this.pie2Radius = this.pie2Settings.pieRadius;
		}
	}

	getOverflowPieXDiff(x: number, isPie2: boolean = false): number {
		let diff = 0;
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		if (this.yAxisSettings.position === Position.Left) {
			diff = x <= radius ? radius - x : 0;
		} else {
			diff = this.width - x <= radius ? radius - (this.width - x) : 0;
		}
		return diff;
	}

	getOverflowPieYDiff(y: number, isPie2: boolean = false): number {
		let diff = 0;
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		if (this.xAxisSettings.position === Position.Bottom) {
			diff = this.height - y <= radius ? radius - (this.height - y) : 0;
		} else {
			diff = y <= radius ? radius - y : 0;
		}
		return diff;
	}

	getPieX(x: number, isPie2: boolean = false): number {
		const diff = this.getOverflowPieXDiff(x);
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const pieViewBoxRadius = radius * 2;
		return x ? (this.yAxisSettings.position === Position.Left ? x + diff : x - diff) : pieViewBoxRadius / 2;
	}

	getPieY(y: number, isPie2: boolean = false): number {
		const diff = this.getOverflowPieYDiff(y);
		const radius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const pieViewBoxRadius = radius * 2;
		return y ? (this.xAxisSettings.position === Position.Bottom ? y - diff : y + diff) : pieViewBoxRadius / 2;
	}

	setPie1ChartFormatting(): void {
		this.setPie1Radius();
	}

	setPie2ChartFormatting(): void {
		this.setPie2Radius();
	}

	getPieChartSeriesDataByCategory(category: string, isPie2: boolean = false): {value: number; name: string}[] {
		const id = this.chartData.findIndex((data) => data.city === category);
		return this.chartData[id].subCategories.map((data) => ({value: isPie2 ? data.value2 : data.value1, name: data.category}));
	}

	getPieSliceClass(category: string, subCategory: string): string {
		return `${category}-${subCategory}`.replace(/ /g, "").toLocaleLowerCase().trim();
	}

	getPieChartSeriesRadius(): string | string[] | number[] {
		switch (this.chartSettings.lollipopType) {
			case LollipopType.Pie: {
				return `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`;
			}
			case LollipopType.Donut: {
				return ["55%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			case LollipopType.Rose: {
				return ["30%", `${this.pieViewBoxRatio - this.pieEmphasizeScaleSize}%`];
			}
			default: {
				return `${this.pieViewBoxRatio}%`;
			}
		}
	}

	getPieDataLabelsFontSize(isPie2: boolean = false): number {
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		let autoFontSize = this.dataLabelsSettings.pieDataLabelFontSize;
		switch (this.chartSettings.lollipopType) {
			case LollipopType.Pie:
				autoFontSize = pieRadius - pieRadius * (this.pieEmphasizeScaleSize / 100);
				DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize / 2);
				break;

			case LollipopType.Donut:
				autoFontSize = pieRadius - pieRadius * ((45 + this.pieEmphasizeScaleSize) / 100);
				DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize);
				break;

			case LollipopType.Rose:
				autoFontSize = pieRadius - pieRadius * ((70 + this.pieEmphasizeScaleSize) / 100);
				DATA_LABELS_SETTINGS.pieDataLabelFontSize = Math.round(autoFontSize);
				break;
		}

		if (this.dataLabelsSettings.pieDataLabelFontSize === 12) {
			return DATA_LABELS_SETTINGS.pieDataLabelFontSize;
		} else {
			return d3.min([autoFontSize, this.dataLabelsSettings.pieDataLabelFontSize]);
		}
	}

	getPieChartOptions(category: string, isPie2: boolean = false): EChartsOption {
		const pieOption: EChartsOption = {
			series: [
				{
					type: "pie",
					color: ["#000000"],
					radius: this.getPieChartSeriesRadius(),
					emphasis: {
						scaleSize: this.pieEmphasizeScaleSize,
					},
					data: this.getPieChartSeriesDataByCategory(category),
				},
			],
		};

		pieOption.series[0].label = {
			show: this.dataLabelsSettings.show,
			color: this.dataLabelsSettings.color,
			textBorderColor: this.dataLabelsSettings.borderColor,
			textBorderWidth: this.dataLabelsSettings.borderWidth,
			fontSize: this.getPieDataLabelsFontSize(isPie2),
			fontFamily: this.dataLabelsSettings.fontFamily,
			position: "center",
			formatter: () => {
				return this.getAutoUnitFormattedNumber(categoryValue);
			},
		};

		const categoryValue = this.chartData.find((d) => d.city === category)[isPie2 ? "value2" : "value1"];
		switch (this.chartSettings.lollipopType) {
			case LollipopType.Pie: {
				pieOption.series[0].itemStyle = {
					borderRadius: 0,
					borderColor: "#fff",
					borderWidth: 0,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case LollipopType.Donut: {
				pieOption.series[0].itemStyle = {
					borderRadius: 10,
					borderColor: "#fff",
					borderWidth: 2,
				};
				pieOption.series[0].roseType = "";
				break;
			}
			case LollipopType.Rose: {
				pieOption.series[0].roseType = "area";
				pieOption.series[0].center = ["50%", "50%"];
				pieOption.series[0].itemStyle = {
					borderRadius: 8,
				};
				break;
			}
		}
		return pieOption;
	}

	setPieDataLabelsDisplayStyle(isPie2: boolean = false): void {
		const foreignObjectId = isPie2 ? "#pie2ForeignObject" : "#pie1ForeignObject";
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		this.svg
			.selectAll(foreignObjectId)
			.selectAll("text")
			.style("pointer-events", "none")
			.style("opacity", function () {
				return this.getBBox().width >= pieRadius * 2 ? "0" : "1";
			});
	}

	enterPieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("id", isPie2 ? "pie2ForeignObject" : "pie1ForeignObject")
			.attr("width", d)
			.attr("height", d)
			.attr("x", (d) => {
				const pieX =
					this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.city)) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
			})
			.attr("y", (d) => {
				const pieY =
					this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d[valueKey])) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
			})
			.attr("opacity", () => 1)
			.append("xhtml:div")
			.attr("id", "pie")
			.style("width", "100%")
			.style("height", "100%")
			.each((d, i, nodes) => {
				const ele = d3.select(nodes[i]);
				const ePieChart = echarts.init(ele.node());
				ePieChart.setOption(this.getPieChartOptions(d.city, isPie2));

				ele.selectAll("path").data(d.subCategories);
				ele
					.selectAll("path")
					.attr("class", (pieData: IChartSubCategory) => {
						return this.getPieSliceClass(d.city, pieData ? pieData.category : "");
					})
					.attr("fill", (d: IChartSubCategory) => {
						return d.styles[pieType].color;
					});

				ele
					.select("g")
					.append("rect")
					.lower()
					.attr("class", "innerCenterRect")
					.attr("width", pieRadius + (pieRadius * 30) / 100)
					.attr("height", pieRadius + (pieRadius * 30) / 100)
					.attr("x", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("y", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("fill", "#fff");

				this.tooltipServiceWrapper.addTooltip(
					ele.selectAll("path"),
					(datapoint: IChartSubCategory) => getTooltipData(datapoint),
					(datapoint: IChartSubCategory) => datapoint.selectionId
				);

				const getTooltipData = (pieData: IChartSubCategory): VisualTooltipDataItem[] => {
					const tooltipData: TooltipData[] = [
						{
							displayName: this.categoryDisplayName,
							value: pieData.category,
							color: "transparent",
						},
						{
							displayName: isPie2 ? this.measure2DisplayName : this.measure1DisplayName,
							value: this.getFormattedNumber(pieData[valueKey]),
							color: pieData.styles[pieType].color,
						},
					];

					pieData.tooltipFields.forEach((data) => {
						tooltipData.push({
							displayName: data.displayName,
							value: typeof data.value === "number" ? this.getFormattedNumber(data.value) : data.value,
							color: data.color ? data.color : "transparent",
						});
					});

					return tooltipData;
				};
			});

		this.pieG.on("mouseover", (e) => {
			if (e.path.length && e.path[5]) {
				d3.select(e.path[5]).raise();
			}
		});

		this.pieG.on("mouseout", () => {
			this.pieG.selectAll("foreignObject").sort((a, b) => d3.ascending(a.sortId, b.sortId));
		});
	}

	updatePieChart(pieForeignObjectSelection: any, isPie2: boolean = false): void {
		isPie2 ? this.setPie2ChartFormatting() : this.setPie1ChartFormatting();
		const pieType = isPie2 ? PieType.Pie2 : PieType.Pie1;
		const pieRadius = isPie2 ? this.pie2Radius : this.pie1Radius;
		const valueKey = isPie2 ? "value2" : "value1";
		const pieViewBoxRadius = pieRadius + (pieRadius * (this.pieEmphasizeScaleSize * 2)) / 100;
		const d = pieViewBoxRadius * 2;
		pieForeignObjectSelection
			.attr("width", d)
			.attr("height", d)
			.attr("x", (d) => {
				const pieX =
					this.getPieX(this.xScale(this.isHorizontalChart ? d[valueKey] : d.city)) + (!this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieX > 0 ? pieX - pieViewBoxRadius : pieX - pieViewBoxRadius / 2;
			})
			.attr("y", (d) => {
				const pieY =
					this.getPieY(this.yScale(this.isHorizontalChart ? d.city : d[valueKey])) + (this.isHorizontalChart ? this.scaleBandWidth / 2 : 0);
				return pieY > 0 ? pieY - pieViewBoxRadius : pieY - pieViewBoxRadius / 2;
			})
			.attr("opacity", () => 1)
			.select("#pie")
			.style("width", "100%")
			.style("height", "100%")
			.each((d, i, nodes) => {
				const ele = d3.select(nodes[i]);
				const ePieChart = echarts.init(ele.node());
				ePieChart.setOption(this.getPieChartOptions(d.city, isPie2));
				ePieChart.resize();

				ele.selectAll("path").data(d.subCategories);
				ele
					.selectAll("path")
					.attr("class", (pieData: IChartSubCategory) => this.getPieSliceClass(d.city, pieData.category))
					.style("fill", (d: IChartSubCategory) => d.styles[pieType].color);

				ele
					.selectAll(".innerCenterRect")
					.attr("width", pieRadius + (pieRadius * 30) / 100)
					.attr("height", pieRadius + (pieRadius * 30) / 100)
					.attr("x", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("y", (pieRadius - (pieRadius * 30) / 100 / 2) / 2)
					.attr("fill", "#fff");
			});
	}

	drawPie1Chart(data: ILollipopChartRow[]): void {
		data.forEach((d, i) => (d.sortId = 1000 + i));
		if (this.isRankingSettingsChanged) {
			this.pieG.selectAll("#pie1ForeignObject").remove();
		}
		const pie1ForeignObjectSelection = this.pieG.selectAll("#pie1ForeignObject").data(data, (d, i) => i);
		pie1ForeignObjectSelection.exit().remove();
		pie1ForeignObjectSelection.join(
			(enter) => {
				const enteredForeignObjects = enter.append("foreignObject");
				this.enterPieChart(enteredForeignObjects);
			},
			(update) => {
				this.updatePieChart(update);
			}
		);
		this.setPieDataLabelsDisplayStyle();
	}

	drawPie2Chart(data: ILollipopChartRow[]): void {
		data.forEach((d, i) => (d.sortId = 2000 + i));
		if (this.isRankingSettingsChanged) {
			this.pieG.selectAll("#pie2ForeignObject").remove();
		}
		const pie2ForeignObjectSelection = this.pieG.selectAll("#pie2ForeignObject").data(data, (d, i) => i);
		pie2ForeignObjectSelection.join(
			(enter) => {
				const enteredForeignObjects = enter.append("foreignObject");
				this.enterPieChart(enteredForeignObjects, true);
			},
			(update) => {
				this.updatePieChart(update, true);
			}
		);
		this.setPieDataLabelsDisplayStyle(true);
	}

	// Legend
	setLegendsData(): void {
		let legend1DataPoints: LegendDataPoint[] = [];
		let legend2DataPoints: LegendDataPoint[] = [];
		this.subCategories.sort((a, b) => a.name.localeCompare(b.name));

		if (this.chartSettings.lollipopType === LollipopType.Circle) {
			legend1DataPoints = [
				{
					label: this.measure1DisplayName,
					color: this.dataColorsSettings.circle1.circleFillColor,
					selected: false,
					identity: this.visualUpdateOptions.host.createSelectionIdBuilder().withMeasure(EDataRolesName.Measure1).createSelectionId(),
				},
				{
					label: this.measure2DisplayName,
					color: this.dataColorsSettings.circle2.circleFillColor,
					selected: false,
					identity: this.visualUpdateOptions.host.createSelectionIdBuilder().withMeasure(EDataRolesName.Measure2).createSelectionId(),
				},
			];
		} else {
			legend1DataPoints = this.subCategories.map((category) => ({
				label: category.name,
				color: category.color1,
				selected: false,
				identity: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
			}));

			legend2DataPoints = this.subCategories.map((category) => ({
				label: category.name,
				color: category.color2,
				selected: false,
				identity: this.visualUpdateOptions.host.createSelectionIdBuilder().createSelectionId(),
			}));
		}

		this.legends1Data = {
			fontSize: this.legendSettings.labelFontSize / 1.2,
			dataPoints: legend1DataPoints,
		};

		this.legends2Data = {
			fontSize: this.legendSettings.labelFontSize / 1.2,
			dataPoints: legend2DataPoints,
		};

		this.setLegendTitleText();
	}

	setLegendTitleText(): void {
		let lastTitle: string;
		let lastTitle1: string;
		let lastTitle2: string;
		if (this.legendSettings.isShowTitle) {
			if (!this.isHasMultiMeasure) {
				if (this.legendSettings.legendTitleText === "" || this.legendSettings.legendTitleText === lastTitle) {
					this.legendSettings.legendTitleText = this.measure1DisplayName;
					lastTitle = this.measure1DisplayName;
				}

				this.legendSettings.legend1TitleText = undefined;
				this.legendSettings.legend2TitleText = undefined;
				this.legends1Data.title = this.legendSettings.legendTitleText;
			} else {
				this.legendSettings.legendTitleText = undefined;
				if (this.legendSettings.legend1TitleText === "" || this.legendSettings.legend1TitleText === lastTitle1) {
					this.legendSettings.legend1TitleText = this.measure1DisplayName;
					lastTitle1 = this.measure1DisplayName;
				}

				if (this.legendSettings.legend2TitleText === "" || this.legendSettings.legend2TitleText === lastTitle2) {
					this.legendSettings.legend2TitleText = this.measure2DisplayName;
					lastTitle2 = this.measure2DisplayName;
				}

				this.legends1Data.title = this.legendSettings.legend1TitleText;
				this.legends2Data.title = this.legendSettings.legend2TitleText;
			}
		}
	}

	renderLegends(): void {
		const legendPosition = this.legendSettings.position;
		this.setLegendViewPortWidthHeight();

		this.legend1.changeOrientation(LegendPosition[legendPosition]);
		this.legend1.drawLegend(this.legends1Data, {width: this.legendViewPortWidth, height: this.legendViewPortHeight});
		positionChartArea(d3.select(this.chartContainer), this.legend1);

		if (this.isDisplayLegend2) {
			this.legend2.changeOrientation(LegendPosition[legendPosition]);
			this.legend2.drawLegend(this.legends2Data, {width: this.legendViewPortWidth, height: this.legendViewPortHeight});
			positionChartArea(d3.select(this.chartContainer), this.legend2);
		}

		d3.select(this.hostContainer)
			.selectAll(".legend")
			.attr("id", (d, i) => `legend-${i + 1}`);

		const legend1ViewPort = this.legend1.getMargins();
		const legend2ViewPort = this.legend2.getMargins();

		if (this.isDisplayLegend2) {
			this.legendViewPort.width = (legend1ViewPort.width ? legend1ViewPort.width : 0) + (legend2ViewPort.width ? legend2ViewPort.width : 0);
			this.legendViewPort.height = (legend1ViewPort.height ? legend1ViewPort.height : 0) + (legend2ViewPort.height ? legend2ViewPort.height : 0);
		} else {
			this.legendViewPort.width = legend1ViewPort.width ? legend1ViewPort.width : 0;
			this.legendViewPort.height = legend1ViewPort.height ? legend1ViewPort.height : 0;
		}

		this.setLegendStyles();
	}

	setLegendViewPortWidthHeight(): void {
		const legendPosition = this.legendSettings.position;
		const visualViewPort = this.visualUpdateOptions.options.viewport;
		this.legendViewPortHeight = visualViewPort.height - this.settingsBtnHeight;

		if (!this.isDisplayLegend2) {
			this.removeLegend(LegendType.Legend2);
		}

		this.legendViewPortWidth = visualViewPort.width;
		if (
			legendPosition === ILegendPosition.Top ||
			legendPosition === ILegendPosition.TopCenter ||
			legendPosition === ILegendPosition.Bottom ||
			legendPosition === ILegendPosition.BottomCenter
		) {
			this.legendViewPortWidth = this.legendViewPortWidth - this.settingsPopupOptionsWidth;
		}
	}

	setLegendStyles(): void {
		const legendPosition = this.legendSettings.position;
		const chartContainerEle = d3.select(this.chartContainer);

		switch (legendPosition) {
			case ILegendPosition.Top:
			case ILegendPosition.TopCenter:
			case ILegendPosition.Bottom:
			case ILegendPosition.BottomCenter:
				chartContainerEle.style("height", `calc(100% - ${this.settingsBtnHeight + this.legendViewPort.height}px)`);
				break;

			case ILegendPosition.Left:
			case ILegendPosition.LeftCenter:
			case ILegendPosition.Right:
			case ILegendPosition.RightCenter:
				chartContainerEle.style("width", `calc(100vw - ${this.legendViewPort.width}px)`);
				chartContainerEle.style("height", `calc(100% - ${this.settingsBtnHeight}px)`);
				break;
		}

		if (this.legendSettings.show) {
			if (this.isHasMultiMeasure && this.chartSettings.lollipopType !== LollipopType.Circle) {
				this.setLegendMarginLeftByTitle();
			} else {
				this.legend1MarginLeft = 0;
				this.legend2MarginLeft = 0;
			}
			this.setLegend1Styles();
			this.setLegendTextStyles(LegendType.Legend1);
			this.setLegendTitleStyles(LegendType.Legend1);

			if (this.isDisplayLegend2) {
				this.setLegend2Styles();
				this.setLegendTextStyles(LegendType.Legend2);
				this.setLegendTitleStyles(LegendType.Legend2);
			}
		}
	}

	setLegendMarginLeftByTitle(): void {
		this.legend2MarginLeft = 0;
		this.legend1MarginLeft = 0;
		const legendPosition = this.legendSettings.position;
		if (
			legendPosition === ILegendPosition.Top ||
			legendPosition === ILegendPosition.TopCenter ||
			legendPosition === ILegendPosition.Bottom ||
			legendPosition === ILegendPosition.BottomCenter
		) {
			const legendTitlesWidth: {id: number; width: number}[] = [];
			d3.selectAll(".legendTitle").each(function (d, i) {
				legendTitlesWidth.push({id: i, width: (this as any).getBBox().width});
			});

			if (legendTitlesWidth.length) {
				const legendTitleWithMaxWidth = legendTitlesWidth.reduce((p, c) => (p.width > c.width ? p : c));
				if (legendTitleWithMaxWidth.id === 0) {
					this.legend2MarginLeft = legendTitlesWidth[0].width - legendTitlesWidth[1].width;
				} else if (legendTitleWithMaxWidth.id === 1) {
					this.legend1MarginLeft = legendTitlesWidth[1].width - legendTitlesWidth[0].width;
				}

				if (this.legend1MarginLeft > 0) {
					this.legend1.drawLegend(this.legends1Data, {
						width: this.legendViewPortWidth - this.legend1MarginLeft,
						height: this.legendViewPortHeight,
					});
					positionChartArea(d3.select(this.chartContainer), this.legend1);
				}

				if (this.legend2MarginLeft > 0) {
					this.legend2.drawLegend(this.legends2Data, {
						width: this.legendViewPortWidth - this.legend2MarginLeft,
						height: this.legendViewPortHeight,
					});
					positionChartArea(d3.select(this.chartContainer), this.legend2);
				}
			}
		}
	}

	createDynamicStyleClass(className: string, styleId: string, styles: string, extraClasses: string = ""): void {
		const style = document.createElement("style");
		style.id = styleId;
		style.type = "text/css";
		const styleTag = document.getElementById(styleId);
		// const stylesInnerHtml = `.${className} ${extraClasses} ${styles}`;
		// style.innerHTML = stylesInnerHtml;
		if (styleTag) {
			document.getElementsByTagName("head")[0].removeChild(styleTag);
		}
		document.getElementsByTagName("head")[0].appendChild(style);
	}

	setLegend1Styles(): void {
		const legendPosition = this.legendSettings.position;
		const chartContainerEle = d3.select(this.chartContainer);
		const legend1Ele = d3.select(this.hostContainer).select("#legend-1");
		const styleClassName = "legend-1-styles";
		let legendStyles = "";
		legend1Ele.classed(styleClassName, false);

		switch (legendPosition) {
			case ILegendPosition.Top:
			case ILegendPosition.TopCenter:
				legendStyles = `{ margin-left: ${this.legend1MarginLeft}px; }`;
				legend1Ele.classed(styleClassName, true);
				break;

			case ILegendPosition.Bottom:
			case ILegendPosition.BottomCenter: {
				const marginTop = parseFloat(legend1Ele.style("margin-top"));
				legend1Ele.style("margin-top", marginTop + "px");
				legendStyles = `{ margin-left: ${this.legend1MarginLeft}px; }`;
				legend1Ele.classed(styleClassName, true);
				break;
			}
		}

		if (this.isInFocusMode) {
			chartContainerEle.style("width", `calc(100vw - ${this.settingsPopupOptionsWidth}px)`);
			switch (legendPosition) {
				case ILegendPosition.Top:
				case ILegendPosition.TopCenter:
				case ILegendPosition.Bottom:
				case ILegendPosition.BottomCenter:
					legendStyles = `{ left: ${this.settingsPopupOptionsWidth}px; margin-left: ${this.legend1MarginLeft}px; }`;
					legend1Ele.classed(styleClassName, true);
					break;

				case ILegendPosition.Left:
				case ILegendPosition.LeftCenter:
					chartContainerEle.style("width", `calc(100vw - ${this.settingsPopupOptionsWidth + this.legendViewPort.width}px)`);
					legendStyles = `{ margin-left: ${this.settingsPopupOptionsWidth}px; left: auto }`;
					legend1Ele.classed(styleClassName, true);
					break;

				case ILegendPosition.Right:
				case ILegendPosition.RightCenter:
					legendStyles = `{ left: auto; }`;
					legend1Ele.classed(styleClassName, true);
					break;
			}
		} else {
			legend1Ele.style("left", null);
		}

		if (this.isHasMultiMeasure && this.chartSettings.lollipopType !== LollipopType.Circle) {
			if (legendPosition === ILegendPosition.Bottom || legendPosition === ILegendPosition.BottomCenter) {
				const marginTop = parseFloat(legend1Ele.style("margin-top")) - this.legend2.getMargins().height;
				legendStyles = `{ margin-top: ${marginTop}px !important; left: ${this.settingsPopupOptionsWidth}px }`;
				legend1Ele.classed(styleClassName, true);
			}

			if (legendPosition === ILegendPosition.Right || legendPosition === ILegendPosition.RightCenter) {
				let marginLeft = parseFloat(legend1Ele.style("margin-left")) - this.legend2.getMargins().width;
				if (this.isInFocusMode) {
					marginLeft -= this.settingsPopupOptionsWidth;
				}
				legendStyles = `{ margin-left: ${marginLeft}px !important; left: ${this.settingsPopupOptionsWidth}px }`;
				legend1Ele.classed(styleClassName, true);
			}
		}

		this.createDynamicStyleClass(styleClassName, "legend1Style", legendStyles);
	}

	setLegend2Styles(): void {
		const legendPosition = this.legendSettings.position;
		const legend1ViewPort = this.legend1.getMargins();
		const legend2ViewPort = this.legend2.getMargins();
		const chartContainerEle = d3.select(this.chartContainer);
		const legend1Ele = d3.select(this.hostContainer).select("#legend-1");
		const legend2Ele = d3.select(this.hostContainer).select("#legend-2");

		const styleClassName = "legend-2-styles";
		let legendStyles = "";
		legend2Ele.classed(styleClassName, false);

		chartContainerEle
			.style("margin-top", this.legendViewPort.height + "px")
			.style(
				"width",
				`calc(100vw - ${this.legendViewPort.width + (this.visualUpdateOptions.options.isInFocus ? this.settingsPopupOptionsWidth : 0)}px)`
			)
			.style("height", `calc(100% - ${this.settingsBtnHeight + this.legendViewPort.height}px)`);

		switch (legendPosition) {
			case ILegendPosition.Top:
			case ILegendPosition.TopCenter: {
				legendStyles = `{ margin-top: ${legend2ViewPort.height}px; margin-left: ${this.legend2MarginLeft}px; }`;
				legend2Ele.classed(styleClassName, true);
				break;
			}

			case ILegendPosition.Bottom:
			case ILegendPosition.BottomCenter: {
				chartContainerEle.style("margin-top", 0);
				const legend2MarginTop = parseFloat(legend2Ele.style("margin-top"));
				legendStyles = `{ margin-top: ${legend2MarginTop}px !important; margin-left: ${this.legend2MarginLeft}px; }`;
				legend2Ele.classed(styleClassName, true);
				break;
			}

			case ILegendPosition.Left:
			case ILegendPosition.LeftCenter: {
				chartContainerEle.style("margin-left", this.legendViewPort.width + "px");
				legendStyles = `{ margin-left: ${legend2ViewPort.width}px; }`;
				legend2Ele.classed(styleClassName, true);
				break;
			}

			case ILegendPosition.Right:
			case ILegendPosition.RightCenter: {
				const marginLeft = legend1Ele.style("margin-left");
				legendStyles = `{ margin-left: ${marginLeft}px !important; }`;
				legend2Ele.classed(styleClassName, true);
				break;
			}
		}

		if (this.isInFocusMode) {
			switch (legendPosition) {
				case ILegendPosition.Top:
				case ILegendPosition.TopCenter:
					legendStyles = `{ margin-top: ${legend1ViewPort.height}px; left: ${this.settingsPopupOptionsWidth}px;
	                                margin-left: ${this.legend2MarginLeft}px; }`;
					legend2Ele.classed(styleClassName, true);
					break;

				case ILegendPosition.Bottom:
				case ILegendPosition.BottomCenter:
					legendStyles = `{ left: ${this.settingsPopupOptionsWidth}px; margin-left: ${this.legend2MarginLeft}px; }`;
					legend2Ele.classed(styleClassName, true);
					break;

				case ILegendPosition.Left:
				case ILegendPosition.LeftCenter:
					chartContainerEle.style("width", `calc(100vw - ${this.settingsPopupOptionsWidth + this.legendViewPort.width}px)`);
					legendStyles = `{ margin-left: ${this.settingsPopupOptionsWidth + legend2ViewPort.width}px;
	                                left: auto; }`;
					legend2Ele.classed(styleClassName, true);
					break;

				case ILegendPosition.Right:
				case ILegendPosition.RightCenter:
					chartContainerEle.style("width", `calc(100vw - ${this.settingsPopupOptionsWidth}px)`);
					legendStyles = `{ left: auto; }`;
					legend2Ele.classed(styleClassName, true);
					break;
			}
		} else {
			legend2Ele.style("left", null);
		}

		this.createDynamicStyleClass(styleClassName, "legend2Style", legendStyles);
	}

	setLegendTextStyles(legendType: LegendType): void {
		const isLegend2 = legendType === LegendType.Legend2;
		const legendId = isLegend2 ? "legend-2" : "legend-1";
		const legendEle = d3.select(this.hostContainer).select(`#${legendId}`);
		const styleClassName = "legend-text-style";
		legendEle.classed(styleClassName, true);
		const legendTextStyle = `{ fill: ${this.legendSettings.labelColor};
	        font-family: ${this.legendSettings.labelFontFamily};
	        font-size: ${this.legendSettings.labelFontSize}px !important;
	        }`;
		this.createDynamicStyleClass(styleClassName, "legendTextStyle", legendTextStyle, "#legendGroup .legendItem .legendText");
	}

	setLegendTitleStyles(legendType: LegendType): void {
		const isLegend2 = legendType === LegendType.Legend2;
		const legendId = isLegend2 ? "legend-2" : "legend-1";
		const legendEle = d3.select(this.hostContainer).select(`#${legendId}`);
		const styleClassName = "legend-title-style";
		legendEle.classed(styleClassName, true);
		const legendTitleStyle = `{ fill: ${this.legendSettings.titleColor};
	        font-family: ${this.legendSettings.titleFontFamily};
	        }`;
		this.createDynamicStyleClass(styleClassName, "legendTitleStyle", legendTitleStyle, "#legendGroup .legendTitle");
	}

	removeLegend(legendType: LegendType) {
		const legend = legendType === LegendType.Legend1 ? this.legend1 : this.legend2;
		legend.changeOrientation(LegendPosition.None);
		this.chartContainer.style.marginLeft = null;
		this.chartContainer.style.marginTop = null;
		legend.drawLegend({dataPoints: []}, this.visualUpdateOptions.options.viewport);
		this.legendViewPort.width = legend.getMargins().width ? legend.getMargins().width : 0;
		this.legendViewPort.height = legend.getMargins().height ? legend.getMargins().height : 0;
		d3.select(this.chartContainer).style("width", `calc(100vw - ${this.settingsPopupOptionsWidth}px)`);
		d3.select(this.hostContainer).selectAll(".legend").style("left", null);
	}
}
