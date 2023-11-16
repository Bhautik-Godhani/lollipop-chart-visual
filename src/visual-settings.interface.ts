import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
	CircleSize,
	ColorPaletteType,
	DataLabelsPlacement,
	DisplayUnits,
	EBeforeAfterPosition,
	EDataLabelsBGApplyFor,
	EDataRolesName,
	EFontStyle,
	ELCRPosition,
	ELegendPosition,
	ELineType,
	EMarkerChartTypes,
	EMarkerColorTypes,
	EMarkerShapeTypes,
	EMarkerStyleTypes,
	EMarkerTypes,
	ERankingType,
	EReferenceLineComputation,
	EReferenceLinesType,
	EReferenceType,
	ESortOrderTypes,
	EXYAxisNames,
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
	isLabelAutoTilt: boolean;
	labelCharLimit: number;
	isLabelAutoCharLimit: boolean;
	isShowAxisLine: boolean;
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
	isShowLabelsAboveLine: boolean;
	isShowAxisLine: boolean;
	isLabelAutoCharLimit: boolean;
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
	isAutoLollipopWidth: boolean;
	lollipopWidth: number;
	lollipopInnerPadding: number;
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
	selectedImageDataField: string;
}

export interface MarkerStyleProps {
	isAutoMarkerSize: boolean,
	markerSize: number
}

export enum EInsideTextColorTypes {
	AUTO = "auto",
	CONTRAST = "contrast",
	FIXED = "fixed"
}

export interface IDataLabelsSettings {
	show: boolean;
	color: string;
	borderColor: string;
	borderWidth: number;
	orientation: Orientation;
	fontSize: number;
	fontFamily: string;
	showBackground: boolean;
	backgroundColor: string;
	fontStyle: EFontStyle[];
	placement: DataLabelsPlacement;
	isAutoFontSize: boolean;
	showLabelsBelowReferenceLine: boolean;
	isColorChanged: boolean;
	textColorTypes: EInsideTextColorTypes;
	applyFor: EDataLabelsBGApplyFor,
	isShowBGChangedWhenPatternApplied: boolean;
	isShowBestFitLabels: boolean;
}

export interface IDataColorsSettings {
	markerType: EMarkerColorTypes;
	marker1: IDataColorsProps;
	marker2: IDataColorsProps;
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

export interface IDataColorsProps {
	fillMin: string;
	fillMid: string;
	fillMax: string;
	isAddMidColor: boolean;
	fillType: ColorPaletteType,
	singleColor?: string,
	gradientColors?: string[],
	categoryColors?: { name: string, marker1: string, marker2: string }[],
	numberOfClasses: number,
	schemeColors: string[],
	colorBlindSafe: boolean,
	colorScheme: string,
	reverse: boolean,
	isGradient?: boolean,
	categories?: any[],
	positiveColor: string,
	negativeColor: string
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
	minLollipopCount: number;
	isShowAxis: boolean;
	trackBackgroundColor: string;
	selectionTrackBackgroundColor: string;
	selectionTrackBorderColor: string;
	isAutoWidth: boolean;
	isAutoHeight: boolean;
	width: number;
	height: number;
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
''
export interface IRaceChartSettings {
	allowTransition: boolean;
	transitionDuration: number;
	dataChangeInterval: number;
	labelColor: string;
	labelFontSize: number;
	isLabelAutoFontSize: boolean;
	labelFontFamily: string;
	tickerButtonRadius: number;
	isTickerButtonAutoRadius: boolean;
	tickerButtonColor: string;
}

export interface IReferenceLineValueProps {
	measureName: string;
	axis: EXYAxisNames;
	value: string;
	rankOrder: Position;
	computation: EReferenceLineComputation;
	rank: string;
	type: EReferenceLinesType;
}

export interface IReferenceLineStyleProps {
	lineStyle: ELineType;
	lineColor: string;
	autoLineWidth: boolean;
	lineWidth: string;
}

export interface IReferenceLineLabelStyleProps {
	textAnchor?: string;
	textAlignment?: string;
	label: string;
	labelFontFamily: string;
	labelColor: string;
	isShowLabelBackground: boolean;
	labelBackgroundColor: string;
	autoFontSize: boolean;
	labelFontSize: string;
	labelPosition: EBeforeAfterPosition;
	labelAlignment: ELCRPosition;
	styling: string[];
}

export interface IReferenceBandStyleProps {
	color: string;
}

export interface IReferenceLineCoord {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
	textX1?: number;
	textY1?: number;
}

export interface IReferenceLabelCoord {
	textX1: number;
	textY1: number;
}

export interface IReferenceLineSettings {
	referenceType: EReferenceType;
	lineValue1: IReferenceLineValueProps;
	lineValue2: IReferenceLineValueProps;
	lineStyle: IReferenceLineStyleProps;
	labelStyle: IReferenceLineLabelStyleProps;
	bandStyle: IReferenceBandStyleProps;
	line1Coord: IReferenceLineCoord;
	line2Coord: IReferenceLineCoord;
	labelCoord: IReferenceLabelCoord;
}
