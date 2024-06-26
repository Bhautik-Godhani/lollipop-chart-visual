/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import { DisplayUnits, EAxisNumberValueType, SemanticNegativeNumberFormats, SemanticPositiveNumberFormats } from "./enum";

export class VisualSettings extends DataViewObjectsParser {
	public license = new License();
	public visualGeneralSettings = new VisualGeneralSettings();
	public config = new Config();
	public chartConfig = new ChartConfig();
	public markerConfig = new MarkerConfig();
	public dataColorsConfig = new DataColorsConfig();
	public lineConfig = new LineConfig();
	public dataLabelsConfig = new DataLabelsConfig();
	public gridLinesConfig = new GridLinesConfig();
	public rankingConfig = new RankingConfig();
	public sortingConfig = new SortingConfig();
	public xAxisConfig = new XAxisConfig();
	public yAxisConfig = new YAxisConfig();
	public legend = new Legend();
	public numberFormatting = new NumberFormatting();
	public showBucketConfig = new ShowBucketConfig();
	public footer = new Footer();
	public editor = new Editor();
	public brushAndZoomAreaConfig = new BrushAndZoomAreaConfig();
	public patternConfig = new PatternConfig();
	public raceChartConfig = new RaceChartConfig();
	public trendLinesConfig = new TrendLinesConfig();
	public referenceLinesConfig = new ReferenceLinesConfig();
	public errorBarsConfig = new ErrorBarsConfig();
	public IBCSConfig = new IBCSConfig();
	public dynamicDeviationConfig = new DynamicDeviationConfig();
	public cutAndClipAxisConfig = new CutAndClipAxisConfig();
	public smallMultiplesConfig = new SmallMultiplesConfig();
	public templatesConfig = new TemplatesConfig();
}

export class License {
	public purchased: string = "";
	public customer: string = "";
	public key: string = "";
}
export class VisualGeneralSettings {
	public darkMode: boolean = false;
	public summaryTableToggle: boolean = true;
	public annotationsToggle: boolean = true;
	public advancedSettingsToggle: boolean = true;
}
export class Config {
	public importExportTheme: string = '';
}
export class ChartConfig {
	public chartSettings: string = "{}";
}
export class MarkerConfig {
	public markerSettings: string = "{}";
}
export class DataColorsConfig {
	public dataColorsSettings: string = "{}";
}
export class LineConfig {
	public lineSettings: string = "{}";
}
export class DataLabelsConfig {
	public dataLabelsSettings: string = "{}";
}
export class GridLinesConfig {
	public gridLinesSettings: string = "{}";
}
export class RankingConfig {
	public rankingSettings: string = "{}";
}
export class SortingConfig {
	public sorting: string = "{}";
}
export class XAxisConfig {
	public xAxisSettings: string = "{}";
}
export class YAxisConfig {
	public yAxisSettings: string = "{}";
}
export class Legend {
	public show: boolean = false;
	public legendPosition: string = "TopLeft";
	public showTitle: boolean = true;
	public legendTitle: string = "";
	public legendColor: string = "#404040";
	public fontSize: string = "8";
	public fontFamily: string = "Segoe UI";
	public isLegendAutoChanged: boolean = false;
}

export class NumberFormatting {
	public show: boolean = true;
	public decimalSeparator: string = ".";
	public thousandsSeparator: string = ",";
	public decimalPlaces: number = 1;
	public scaling: DisplayUnits = DisplayUnits.Auto;
	public prefix: string = "";
	public suffix: string = "";
	public scalingLabel: boolean = false;
	public thousandScalingLabel: string = "K";
	public millionScalingLabel: string = "M";
	public billionScalingLabel: string = "B";
	public trillionScalingLabel: string = "T";
	public semanticFormatting?: boolean = false;
	public negativeFormat?: string = SemanticNegativeNumberFormats.MinusX;
	public positiveFormat?: string = SemanticPositiveNumberFormats.X;
	public valueType?: EAxisNumberValueType;
}

export class ShowBucketConfig {
	public showBucket: string = "{}";
}

export class Footer {
	public show: boolean = false; public text: string = "For more info visit Powerviz website"; public webURL: string = "https://www.powerviz.ai"; public color: string = "#404040"; public fontSize: string = "16"; public fontFamily: string = "Segoe UI"; public isShowDivider: boolean = false; public dividerColor: string = "#404040"; public dividerThickness: number = 1; public backgroundColor: string = "#ffffff"; public backgroundTransparency: number = 0; public alignment: string = "center";
}

export class Editor {
	public conditionalFormatting: string = "";
	public annotations: string = "[]";
	public beforeIBCSSettings: string = "{}";
	public beforeTemplateSettings: string = "{}";
}

export class BrushAndZoomAreaConfig {
	public brushAndZoomAreaSettings: string = "{}";
}

export class PatternConfig {
	public patternSettings: string = "{}";
}

export class RaceChartConfig {
	public raceChartSettings: string = "{}";
}

export class TrendLinesConfig {
	public trendLinesSettings: string = "{}";
}

export class ReferenceLinesConfig {
	public referenceLinesSettings: string = "{}";
}

export class TemplatesConfig {
	public templatesSettings: string = "{}";
}

export class ErrorBarsConfig {
	public errorBarsSettings: string = "{}";
}

export class IBCSConfig {
	public IBCSSettings: string = "{}";
}

export class DynamicDeviationConfig {
	public dynamicDeviationSettings: string = "{}";
}

export class CutAndClipAxisConfig {
	public cutAndClipAxisSettings: string = "{}";
}
export class SmallMultiplesConfig {
	public smallMultiplesSettings: string = "{}";
}
