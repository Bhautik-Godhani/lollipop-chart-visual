import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
	CircleSize,
	CircleType,
	DataLabelsFontSizeType,
	DataLabelsPlacement,
	DisplayUnits,
	EAutoCustomTypes,
	EDataRolesName,
	ELegendPosition,
	EMarkerChartTypes,
	EMarkerShapeTypes,
	EMarkerStyleTypes,
	EMarkerTypes,
	ERankingType,
	ESortOrderTypes,
	LollipopWidthType,
	Orientation,
	PieSize,
	PieType,
	Position,
	RankingDataValuesType,
} from "./enum";

export interface IXAxisSettings {
	position: Position;
	isDisplayTitle: boolean;
	titleName: string;
	titleColor: string;
	titleFontSize: number;
	titleFontFamily: string;
	isDisplayLabel: boolean;
	labelColor: string;
	labelFontFamily: string;
	labelFontSize: number;
	labelTilt: number;
	labelCharLimit: number;
	isLabelAutoTilt: boolean;
}

export interface IYAxisSettings {
	position: Position;
	isDisplayTitle: boolean;
	titleName: string;
	titleColor: string;
	titleFontSize: number;
	titleFontFamily: string;
	isDisplayLabel: boolean;
	labelColor: string;
	labelFontFamily: string;
	labelFontSize: number;
	labelCharLimit: number;
	isShowLabelsAboveLine: boolean
}

export interface ICirclePropsSettings {
	show: boolean;
	isCircleFilled: string;
	circleSize: CircleSize;
	maxCircleRadius: number;
	circleRadius: number;
	strokeWidth: number;
}

export interface IPieSettings {
	pieType: PieType;
	pie1: IPiePropsSettings;
	pie2: IPiePropsSettings;
}

export interface IPiePropsSettings {
	pieSize: PieSize;
	maxPieRadius: number;
	pieRadius: number;
}

export interface ILineSettings {
	show: boolean;
	lineType: string;
	lineWidth: number;
	lineColor: string;
}

export interface IGridLinesPropsSettings {
	show: boolean;
	lineType: string;
	lineWidth: number;
	lineColor: string;
}

export interface IGridLinesSettings {
	xGridLines: IGridLinesPropsSettings;
	yGridLines: IGridLinesPropsSettings;
}

export interface IXGridLinesSettings {
	show: boolean;
	lineType: string;
	lineWidth: number;
	lineColor: string;
}

export interface IYGridLinesSettings {
	show: boolean;
	lineType: string;
	lineWidth: number;
	lineColor: string;
}

export interface INumberSettings {
	show: boolean;
	decimalSeparator: string;
	thousandsSeparator: string;
	decimalPlaces: number;
	displayUnits: DisplayUnits;
	prefix: string;
	suffix: string;
	thousands: string;
	million: string;
	billion: string;
	trillion: string;
}

export interface ILegendSettings {
	show: boolean;
	legendPosition: ELegendPosition;
	showTitle: boolean;
	legendTitle: string;
	legendColor: string;
	fontSize: string;
	fontFamily: string;
}

export interface IChartSettings {
	isHasSubCategories: boolean;
	orientation: Orientation;
	isLollipopDistanceChange: boolean;
	lollipopWidthType: LollipopWidthType;
	lollipopWidth: number;
	lollipopInnerPadding: number;
	isShowImageMarker: boolean;
}

export interface IMarkerSettings {
	markerType: EMarkerTypes;
	markerShape: EMarkerShapeTypes;
	markerChart: EMarkerChartTypes;
	markerShapeValue: IconDefinition;
	markerShapePath: string;
	markerShapeBase64Url: string;
	dropdownMarkerType: string;
	markerStyleType: EMarkerStyleTypes.Marker1Style,
	marker1Style: MarkerStyleProps;
	marker2Style: MarkerStyleProps;
}

export interface MarkerStyleProps {
	sizeType: EAutoCustomTypes,
	size: number
}

export interface IDataLabelsSettings {
	show: boolean;
	color: string;
	borderColor: string;
	borderWidth: number;
	orientation: Orientation;
	fontSize: number;
	pieDataLabelFontSize: number;
	fontFamily: string;
	showBackground: boolean;
	backgroundColor: string;
	transparency: number;
	fontStyle: string[];
	placement: DataLabelsPlacement;
	fontSizeType: DataLabelsFontSizeType;
}

export interface IDataColorsSettings {
	dataType: CircleType | PieType;
	circle1: IDataColorsPropsSettings;
	circle2: IDataColorsPropsSettings;
	pie1: IDataColorsPropsSettings;
	pie2: IDataColorsPropsSettings;
}

export interface ICategoryRankingProps {
	enabled: boolean;
	valueType: RankingDataValuesType;
	rankingType: ERankingType;
	count: number;
	showRemainingAsOthers: boolean;
	othersColor: string;
}

export interface ISubCategoryRankingProps {
	enabled: boolean;
	rankingType: ERankingType;
	count: number;
	showRemainingAsOthers: boolean;
	othersColor: string;
}

export interface IRankingSettings {
	category: ICategoryRankingProps;
	subCategory: ISubCategoryRankingProps;
}

export interface IDataColorsPropsSettings {
	fillmin: string;
	midcolor: boolean;
	fillmid: string;
	fillmax: string;
	fillnull: string;
	fillType: string;
	numberOfClasses: number;
	byCategoryColors: { name: string; color: string }[];
	schemeColors: string[];
	reverse: boolean;
	isGradient: boolean;
	singleColor: string;
	circleFillColor?: string;
	circleStrokeColor?: string;
	defaultColor?: string;
	selectedCategoryName?: string;
	selectedCategoryColor?: string;
}

export interface ILabelValuePair {
	label: string;
	value: string;
	icon?: React.ReactNode;
	isSortByCategory?: boolean;
	isSortByMeasure?: boolean;
	isSortByMultiMeasure?: boolean;
	isSortByExtraSortField?: boolean;
}

export interface ISortingSettings {
	category: ISortingProps;
	subCategory: ISortingProps;
}

export interface ISortingProps {
	enabled: boolean;
	sortBy: string;
	sortOrder: ESortOrderTypes;
	isSortByCategory: boolean;
	isSortByMeasure: boolean;
	isSortByMultiMeasure: boolean;
	isSortByExtraSortField: boolean;
}

export interface IBrushConfig {
	brushG: SVGElement;
	brushXPos: number;
	brushYPos: number;
	barDistance: number;
	totalBarsCount: number;
	scaleWidth: number;
	scaleHeight: number;
	smallMultiplesGridItemContent?: { [category: string]: any };
	smallMultiplesGridItemId: string;
	categoricalData: any;
	XAxisG?: SVGElement | null;
	brushNumber?: number;
}

export interface IShowBucketSettings {
	enable: boolean;
	showBucketField: string;
	message: string;
	showIcon: boolean;
	fontFamily: string;
	fontSize: number;
	styling: string[];
	color: string;
}

export interface IFooterSettings {
	show: boolean;
	text: string;
	webURL: string;
	isShowDivider: boolean;
	dividerColor: string;
	dividerThickness: number;
	color: string;
	fontSize: number;
	fontFamily: string;
	backgroundColor: string;
	backgroundTransparency: number;
	alignment: string;
}

export interface IHighContrastDetails {
	isHighContrast: boolean;
	foregroundColor?: string;
	backgroundColor?: string;
	foregroundSelectedColor?: string;
	hyperlinkColor?: string;
}

export interface IBrushAndZoomAreaSettings {
	enabled: boolean;
	isShowAxis: boolean;
}

export interface IPatternProps {
	name: string;
	patternIdentifier: string;
	isImagePattern: boolean;
	dimensions?: { width: number; height: number };
}

export interface IPatternSettings {
	enabled: boolean,
	categoryPatterns: IPatternProps[],
	subCategoryPatterns: IPatternProps[],
	isPatternBorderEnabled: boolean,
	patternBorderWidth: number
}

export interface ISinglePatternProps {
	name: string;
	patternIdentifier: string;
	isImagePattern: boolean;
	imageSlicesDataUrls?: string[];
	dimensions?: { width: number; height: number };
}

export interface IConditionalFormattingProps {
	applyTo: "measure" | "category",
	categoryType?: { [EDataRolesName.Category]: boolean, [EDataRolesName.SubCategory]: boolean },
	measureType?: { [EDataRolesName.Measure]: boolean, [EDataRolesName.Measure1]: boolean, [EDataRolesName.Measure2]: boolean, [EDataRolesName.Tooltip]: boolean },
	color: string,
	operator: string,
	secondaryStaticValue: number | string,
	sourceName: string,
	staticValue: string
}