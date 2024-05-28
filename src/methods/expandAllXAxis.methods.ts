import { select } from "d3-selection";
import { Position } from "../enum";
import { Visual } from "../visual";
import { axisBottom, axisLeft, axisTop } from "d3";
import { getSVGTextSize } from "./methods";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";

export const RenderExpandAllXAxis = (self: Visual, categoricalData: powerbi.DataViewCategorical): void => {
	categoricalData.categories.forEach((d, i) => {
		if (i < self.categoricalData.categories.length - 1) {
			const xScaleCopy = self.xScale.copy();
			xScaleCopy.domain(d.values);
			self[`${d.source.displayName}ScaleDomain`] = d.values;
			self[`${d.source.displayName}ScaleNewDomain`] = [];
			self[d.source.displayName + "Scale"] = xScaleCopy;
		}
	});
};

export const CallExpandAllXScaleOnAxisGroup = (self: Visual, width: number): void => {
	const { labelFontFamily, labelFontSize } = self.xAxisSettings;
	const expandAxisGHeight = getSVGTextSize("X-Axis", labelFontFamily, labelFontSize).height;
	self.expandAllCategoriesName.forEach((category: string, i: number) => {
		if (self.isBottomXAxis) {
			select(`.${category}ScaleG`)
				.attr("transform", "translate(0," + i * expandAxisGHeight + ")")
				.call(
					axisBottom(self[`${category}Scale`])
						.ticks(width / 90)
				);

			SetExpandAllXAxisTickStyle(self);
			// SetExpandAllXAxisLineStyle(self);
			// HideExpandAllXAxisRedundantTicks(self);
		} else {
			select(`.${category}ScaleG`)
				.attr("transform", "translate(0," + (-(((self.expandAllCategoriesName.length - 1) - i) * expandAxisGHeight)) + ")")
				.call(
					axisTop(self[`${category}Scale`])
						.ticks(width / 90)
				);

			SetExpandAllXAxisTickStyle(self);
			// SetExpandAllXAxisLineStyle(self);
			// HideExpandAllXAxisRedundantTicks(self);
		}
	});
};

export const SetExpandAllXAxisTickStyle = (self: Visual) => {
	const { isDisplayLabel, labelColor, labelFontFamily, labelFontSize } = self.xAxisSettings;
	self.expandAllCategoriesName.forEach((category: string) => {
		select(`.${category}ScaleG`)
			.selectAll(".tick")
			.selectAll("text")
			.attr("dy", "0.35em")
			.attr("fill", labelColor)
			.style("font-family", labelFontFamily)
			.attr("font-size", labelFontSize)
			.attr("display", isDisplayLabel ? "block" : "none")
			.each((d: string, i, nodes) => {
				d = d.toString().split("--")[0];

				const textProperties: TextProperties = {
					text: d,
					fontFamily: labelFontFamily,
					fontSize: labelFontSize + "px",
				};

				const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, self.scaleBandWidth);
				select(nodes[i]).text(truncatedText);
			});
	});
};

export const RenderExpandAllYAxis = (self: Visual, categoricalData: powerbi.DataViewCategorical): void => {
	categoricalData.categories.forEach((d, i) => {
		if (i < self.categoricalData.categories.length - 1) {
			const yScaleCopy = self.yScale.copy();
			yScaleCopy.domain(d.values);
			self[`${d.source.displayName}ScaleDomain`] = d.values;
			self[`${d.source.displayName}ScaleNewDomain`] = [];
			self[d.source.displayName + "Scale"] = yScaleCopy;
		}
	});
};

export const CallExpandAllYScaleOnAxisGroup = (self: Visual, expandAllScaleWidth: number): void => {
	self.expandAllCategoriesName.forEach((category: string, i: number) => {
		if (self.yAxisSettings.position === Position.Left) {
			select(`.${category}ScaleG`)
				.attr("transform", `translate(${(i + 1) * self.expandAllYScaleGWidth / self.expandAllCategoriesName.length}, ${0})`)
				.call(
					axisLeft(self[`${category}Scale`])
						.ticks(expandAllScaleWidth / 90)
						.tickFormat((d: string) => d.toString().split("--")[0]) as any
				);

			SetExpandAllYAxisTickStyle(self);
			// SetExpandAllYAxisLineStyle(selFf, expandAllScaleWidth);	
			// HideExpandAllYAxisRedundantTicks(self);
		} else if (self.yAxisSettings.position === Position.Right) {
			select(`.${category}ScaleG`)
				.attr("transform", `translate(${(i + 1) * self.expandAllYScaleGWidth / self.expandAllCategoriesName.length}, ${0})`)
				.call(
					axisLeft(self[`${category}Scale`])
						.ticks(expandAllScaleWidth / 90)
						.tickFormat((d: string) => d.toString().split("--")[0]) as any
				);

			SetExpandAllYAxisTickStyle(self);

			// SetExpandAllYAxisLineStyle(self, expandAllScaleWidth);
			// HideExpandAllYAxisRedundantTicks(self);
		}
	});
};

export const SetExpandAllYAxisTickStyle = (self: Visual): void => {
	const { isDisplayLabel, labelColor, labelFontFamily, labelFontSize } = self.yAxisSettings;
	self.expandAllCategoriesName.forEach((category: string) => {
		select(`.${category}ScaleG`)
			.selectAll(".tick")
			.selectAll("text")
			.attr("x", self.isLeftYAxis ? "-9" : "0")
			.attr("y", "0")
			.attr("fill", labelColor)
			.style("font-family", labelFontFamily)
			.attr("font-size", labelFontSize)
			.attr("display", isDisplayLabel ? "block" : "none")
			.attr("text-anchor", self.isLeftYAxis ? "end" : "start")
			.each((d: string, i, nodes) => {
				d = d.toString().split("--")[0];

				const textProperties: TextProperties = {
					text: d,
					fontFamily: labelFontFamily,
					fontSize: labelFontSize + "px",
				};

				const truncatedText = textMeasurementService.getTailoredTextOrDefault(textProperties, self.expandAllYScaleGWidth / self.expandAllCategoriesName.length);
				select(nodes[i]).text(truncatedText);
			});
	});
};
