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
import { DisplayUnits, Position, ILegendPosition } from "./enum";
import { IXAxisSettings, IYAxisSettings } from "./visual-settings.interface";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
      public license = new License();
      public chartConfig = new ChartConfig();
      public dataColorsConfig = new DataColorsConfig();
      public circleConfig = new CircleConfig();
      public lineConfig = new LineConfig();
      public dataLabelsConfig = new DataLabelsConfig();
      public xAxisConfig = new XAxisConfig();
      public yAxisConfig = new YAxisConfig();
      public numberConfig = new NumberConfig();
      public gridLinesConfig = new GridLinesConfig();
      public rankingConfig = new RankingConfig();
      public pieConfig = new PieConfig();
      public legendSettings = new LegendSettings();
      public numberSettings = new NumberSettings();
      public xAxisSettings: IXAxisSettings = new XAxisSettings();
      public yAxisSettings: IYAxisSettings = new YAxisSettings();
}

export class License {
      public purchased: string = ""; public customer: string = ""; public key: string = "";
}
export class ChartConfig {
      public chartSettings: string = "{}";
}

export class DataColorsConfig {
      public dataColorsSettings: string = "{}";
}

export class CircleConfig {
      public circleSettings: string = "{}";
}

export class LineConfig {
      public lineSettings: string = "{}";
}

export class DataLabelsConfig {
      public dataLabelsSettings: string = "{}";
}

export class XAxisConfig {
      public xAxisSettings: string = "{}";
}

export class YAxisConfig {
      public yAxisSettings: string = "{}";
}
export class NumberConfig {
      public numberSettings: string = "{}";
}

export class GridLinesConfig {
      public gridLinesSettings: string = "{}";
}

export class RankingConfig {
      public rankingSettings: string = "{}";
}

export class PieConfig {
      public pieSettings: string = "{}";
}

export class LegendSettings {
      public show: boolean = true;
      public position: ILegendPosition = ILegendPosition.Top;
      public labelColor: string = null;
      public labelFontFamily: string = 'Segoe UI';
      public labelFontSize: number = 10;
      public isShowTitle: boolean = true;
      public legendTitleText: string = '';
      public legend1TitleText: string = '';
      public legend2TitleText: string = '';
      public titleColor: string = null;
      public titleFontFamily: string = 'Segoe UI Semibold';
}

export class NumberSettings {
      public show: boolean = true;
      public decimalSeparator: string = '.';
      public thousandsSeparator: string = ',';
      public decimalPlaces: number = 0;
      public displayUnits: DisplayUnits = DisplayUnits.Auto;
      public prefix: string = '';
      public suffix: string = '';
      public thousands: string = 'K';
      public million: string = 'M';
      public billion: string = 'B';
      public trillion: string = 'T';
}

export class XAxisSettings {
      public position: Position = Position.Bottom;
      public isDisplayTitle: boolean = false;
      public titleName: string = '';
      public titleColor: string = null;
      public titleFontSize: number = 12;
      public titleFontFamily: string = 'Segoe UI';
      public isDisplayLabel: boolean = true;
      public labelColor: string = null;
      public labelFontFamily: string = 'Segoe UI';
      public labelFontSize: number = 12;
      public isLabelAutoTilt: boolean = true;
      public labelTilt: number = 30;
      public labelCharLimit: number = 10;
}

export class YAxisSettings {
      public position: Position = Position.Left;
      public isDisplayTitle: boolean = false;
      public titleName: string = '';
      public titleColor: string = null;
      public titleFontSize: number = 12;
      public titleFontFamily: string = 'Segoe UI';
      public isDisplayLabel: boolean = true;
      public labelColor: string = null;
      public labelFontFamily: string = 'Segoe UI';
      public labelFontSize: number = 12;
      public labelCharLimit: number = 10;
}

