/* eslint-disable no-prototype-builtins */
/* eslint-disable max-lines-per-function */
import { textMeasurementService, wordBreaker } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { Visual } from "../visual";
import crypto from "crypto";
import { IConditionalFormattingProps } from "../visual-settings.interface";
import { IValueFormatter, TooltipData } from "../model";
import { ECFApplyOnCategories, ECFValueTypes, EChartSettings, EDataRolesName, EFontStyle, ETemplatesSettings, EVisualConfig, EVisualSettings } from "../enum";
import { CATEGORY_MARKERS } from "../settings-pages/markers";
import { ApplyBeforeIBCSAppliedSettingsBack } from "./IBCS.methods";
import { select } from "d3-selection";
import { PATTERNS } from "@truviz/shadow/dist/Components";

export const persistProperties = (shadow: Visual, configName: EVisualConfig, settingName: EVisualSettings, configValues: any, isTemplateSettings = false) => {
	if (shadow.templateSettings && shadow.templateSettings.isIBCSEnabled) {
		ApplyBeforeIBCSAppliedSettingsBack(shadow);
	}

	const merge = {
		merge: [
			{
				objectName: configName,
				displayName: settingName,
				properties: {
					[settingName]: JSON.stringify(configValues),
				},
				selector: null,
			},
			{
				objectName: EVisualConfig.TemplatesConfig,
				displayName: EVisualSettings.TemplatesSettings,
				properties: {
					[EVisualSettings.TemplatesSettings]: JSON.stringify({
						...shadow.templateSettings,
						[ETemplatesSettings.IsIBCSEnabled]: false,
						[ETemplatesSettings.Theme]: undefined,
						[ETemplatesSettings.PrevTheme]: undefined,
					}),
				},
				selector: null,
			},
		],
	};

	shadow._host.persistProperties(merge);
}

export const invertColorByBrightness = (hex: string, isReturnBlackWhiteColor: boolean, isReverse: boolean = false): string => {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}

	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error('Invalid HEX color.');
	}

	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	if (isReturnBlackWhiteColor) {
		return (r * 0.299 + g * 0.587 + b * 0.114) > 186
			? isReverse ? '#FFFFFF' : '#5D5D5D'
			: isReverse ? '#5D5D5D' : '#FFFFFF';
	}

	// invert color components
	const r1 = (255 - r).toString(16);
	const g1 = (255 - g).toString(16);
	const b1 = (255 - b).toString(16);

	// pad each with zeros and return
	return "#" + padZero(r1) + padZero(g1) + padZero(b1);
}

export const padZero = (str: string, len = 2): string => {
	const zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

export const rgbaToHex = (color: string): string => {
	const values = color
		.replace(/rgba?\(/, '')
		.replace(/\)/, '')
		.replace(/[\s+]/g, '')
		.split(',');
	const a = parseFloat(values[3] || '1');
	const r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255);
	const g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255);
	const b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
	return "#" +
		("0" + r.toString(16)).slice(-2) +
		("0" + g.toString(16)).slice(-2) +
		("0" + b.toString(16)).slice(-2);
}

export const getSVGTextSize = (
	text: string,
	fontFamily: string,
	fontSize: number,
	fontWeight: string = null,
	fontStyle: string = null,
	textDecoration: string = null
): { width: number; height: number } => {
	const textProperties = {
		text,
		fontFamily,
		fontSize: fontSize + "px",
		fontWeight,
		fontStyle,
		fontVariant: textDecoration,
	};

	const measureSvgTextWidth = textMeasurementService.measureSvgTextWidth(textProperties, text);
	const measureSvgTextHeight = textMeasurementService.measureSvgTextHeight(textProperties, text);

	return { width: measureSvgTextWidth, height: measureSvgTextHeight };
};

export const GetWordsSplitByWidth = (text: string, textProperties: TextProperties, maxWidth: number, maxLines: number): string[] => {
	const calcTextWidth = (text: TextProperties): number => {
		return textMeasurementService.measureSvgTextWidth(text);
	};

	const textTruncator = (text: TextProperties): string => {
		return textMeasurementService.getTailoredTextOrDefault(text, maxWidth);
	};

	return wordBreaker.splitByWidth(text.toString(), textProperties, calcTextWidth, maxWidth, maxLines, textTruncator);
};

const scaleNumber = (num, scaling): { n: number; scaledTo: string } => {
	if (scaling === "auto") {
		const l = Math.floor(num).toString().length;
		if (l <= 3) {
			return {
				n: num,
				scaledTo: "none",
			};
		} else if (l <= 6) {
			return {
				n: num / 1000,
				scaledTo: "thousands",
			};
		} else if (l <= 9) {
			return {
				n: num / 1000000,
				scaledTo: "million",
			};
		} else if (l <= 12) {
			return {
				n: num / 1000000000,
				scaledTo: "billion",
			};
		} else {
			return {
				n: num / 1000000000000,
				scaledTo: "trillion",
			};
		}
	}

	if (scaling === "thousands") {
		return {
			n: num / 1000,
			scaledTo: "thousands",
		};
	}

	if (scaling === "million") {
		return {
			n: num / 1000000,
			scaledTo: "million",
		};
	}

	if (scaling === "billion") {
		return {
			n: num / 1000000000,
			scaledTo: "billion",
		};
	}

	if (scaling === "trillion") {
		return {
			n: num / 1000000000000,
			scaledTo: "trillion",
		};
	}

	return {
		n: num,
		scaledTo: "none",
	};
};

// export const formatNumber = (number: number | string, options: NumberFormatting, formatter: IValueFormatter = undefined): string => {
// 	if (typeof number !== "number") {
// 		return number;
// 	}

// 	if (!options.show && formatter) {
// 		return formatter.format(number);
// 	}

// 	let __n = number;
// 	let _num;
// 	let scaledTo = "none";

// 	const scalingMapping = {
// 		thousands: options.thousandScalingLabel,
// 		million: options.millionScalingLabel,
// 		billion: options.billionScalingLabel,
// 		trillion: options.trillionScalingLabel,
// 	};

// 	const defaultScalingMapping = {
// 		thousands: "K",
// 		million: "M",
// 		billion: "B",
// 		trillion: "T",
// 	};

// 	if (options.scaling) {
// 		const scaledNumber = scaleNumber(__n, options.scaling);
// 		__n = scaledNumber.n;
// 		scaledTo = scaledNumber.scaledTo;
// 	}

// 	if (typeof options.decimalPlaces === "number" && options.decimalPlaces >= 0) {
// 		options.decimalPlaces = options.decimalPlaces > 100 ? 100 : options.decimalPlaces;
// 		const decimals = Math.floor(options.decimalPlaces);
// 		if (typeof __n === "number") {
// 			if (!options.thousandsSeparator) {
// 				_num = __n.toFixed(decimals).toString();
// 			} else {
// 				_num = __n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// 			}
// 		} else {
// 			_num = __n;
// 		}
// 	} else {
// 		_num = __n.toString();
// 	}

// 	// _num = formatter.format(parseInt(_num));
// 	if (options.decimalSeparator) {
// 		_num = _num.replace(".", options.decimalSeparator);
// 	}
// 	if (options.thousandsSeparator) {
// 		_num = _num.replace(/,/g, options.thousandsSeparator);
// 	}

// 	if (scaledTo !== "none") {
// 		_num += options.scalingLabel ? scalingMapping[scaledTo] : defaultScalingMapping[scaledTo];
// 	}

// 	_num = options.prefix !== "" ? options.prefix + "" + _num + "" + options.suffix : _num + "" + options.suffix;

// 	return _num.trim();
// };

export const parseObject = (obj, def) => {
	let initialStates = def;
	try {
		initialStates = JSON.parse(obj);
		initialStates = {
			...def,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...def };
	}
	return initialStates;
};

export const hexToRGB = (hex: string, alpha: number): string => {
	if (hex.indexOf("rgb") !== -1) return hex;
	const r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);

	if (alpha >= 0 && alpha <= 1) {
		return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
	} else {
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}
};

export const powerBiNumberFormat = (
	number: number | string | Date,
	valueFormatter: IValueFormatter,
): string => {
	const formatter = valueFormatter ? valueFormatter.formatter : undefined;

	if (valueFormatter && number && valueFormatter.format && valueFormatter.format.includes("%")) {
		number = parseFloat(number.toString()) / 100;
	}

	return formatter ? formatter.format(number) : number.toString();
}

export const generateSecureRandomBytes = (length) => {
	return crypto.randomBytes(length);
}

export const createPatternsDefs = (self: Visual, svgRootElement) => {
	svgRootElement.selectAll(".pattern-defs").remove();
	const filterDef = svgRootElement.append("defs").attr("class", "pattern-defs");
	PATTERNS.map((pattern) => {
		if (self.isHasSubcategories) {
			self.subCategoriesName.forEach(d => {
				const filterPreview = filterDef
					.append("pattern")
					.attr("id", pattern.patternName + "_PREVIEW")
					.attr("groupBy", d)
					.attr("class", "patterns-preview")
					.attr("patternUnits", "userSpaceOnUse")
					.attr("width", pattern.w)
					.attr("height", pattern.h);

				filterPreview
					.append("path")
					.attr("d", pattern.d)
					.attr("stroke", pattern.stroke ? "var(--activeSelected)" : "none")
					.attr("stroke-width", pattern.stroke ? "2" : "0")
					.attr("x", 0)
					.attr("y", 0)
					.attr("fill", pattern.fill ? "var(--activeSelected)" : "none")
					.attr("transform", pattern.translate ? pattern.translate : "");
			})
		} else {
			const filterPreview = filterDef
				.append("pattern")
				.attr("id", pattern.patternName + "_PREVIEW")
				.attr("class", "patterns-preview")
				.attr("patternUnits", "userSpaceOnUse")
				.attr("width", pattern.w)
				.attr("height", pattern.h);

			filterPreview
				.append("path")
				.attr("d", pattern.d)
				.attr("stroke", pattern.stroke ? "var(--activeSelected)" : "none")
				.attr("stroke-width", pattern.stroke ? "2" : "0")
				.attr("x", 0)
				.attr("y", 0)
				.attr("fill", pattern.fill ? "var(--activeSelected)" : "none")
				.attr("transform", pattern.translate ? pattern.translate : "");
		}
	});
};

export const createMarkerDefs = (self: Visual, svgRootElement) => {
	const { errorBars } = self.errorBarsSettings;
	svgRootElement.selectAll(".marker-defs").remove();
	const filterDef = svgRootElement.append("defs").attr("class", "marker-defs");
	CATEGORY_MARKERS.map((marker) => {
		const symbol = filterDef
			.append("symbol")
			.attr("id", marker.value + "_MARKER")
			.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

		marker.paths.forEach(path => {
			symbol.append("path")
				.attr("d", path.d)
				.attr("fill", errorBars.isMatchSeriesColor ? self.lineSettings.lineColor : errorBars.barColor)
				.attr("stroke-width", errorBars.borderSize)
				.attr("stroke", errorBars.borderColor);
		})
	});
};

export const generatePattern = (svgRootElement, pattern, color, isLegend = false) => {
	let defs = svgRootElement.select(".generated-pattern-defs");
	if (defs.empty()) {
		defs = svgRootElement.append("defs").attr("class", "generated-pattern-defs");
	}
	let patternId;
	if (pattern.isImagePattern) {
		patternId = "image-pattern".concat("-", generateSecureRandomBytes(16).toString("hex"));
		const filter = defs.append("pattern").attr("id", patternId);

		if (isLegend) {
			filter
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("patternContentUnits", "objectBoundingBox")
				.attr("viewBox", "0 0 1 1")
				.attr("preserveAspectRatio", "xMidYMid slice");
		} else {
			filter
				.attr("patternUnits", "userSpaceOnUse")
				.attr("width", pattern.dimensions.width)
				.attr("height", pattern.dimensions.height);
		}

		const filterImage = filter.append("image").attr("xlink:href", pattern.patternIdentifier);

		if (isLegend) {
			filterImage.attr("width", 1).attr("height", 1).attr("preserveAspectRatio", "xMidYMid slice");
		} else {
			filterImage.attr("height", pattern.dimensions.height).attr("x", 0).attr("y", 0);
		}
	} else {
		const patternObject = PATTERNS.find(({ patternName }) => patternName == pattern.patternIdentifier);
		patternId = patternObject.patternName.concat("-", generateSecureRandomBytes(16).toString("hex"));

		const filter = defs
			.append("pattern")
			.attr("id", patternId)
			.attr("patternUnits", "userSpaceOnUse")
			.attr("width", patternObject.w)
			.attr("height", patternObject.h);

		filter
			.append("path")
			.attr("d", patternObject.d)
			.attr("stroke", patternObject.stroke == true ? color : "none")
			.attr("stroke-width", "2")
			.attr("x", 0)
			.attr("y", 0)
			.attr("fill", patternObject.fill == true ? color : "none")
			.attr("transform", () => {
				if (isLegend && patternObject.patternName === "STAR") {
					return `scale(0.8) translate(6.5, 6.5)`;
				}
				else if (isLegend && patternObject.patternName === "HEART") {
					return `scale(0.75)`;
				}
				return patternObject.translate ? patternObject.translate : ""
			});
	}
	return patternId;
};

export const parseConditionalFormatting = (SETTINGS) => {
	try {
		const parsed = JSON.parse(SETTINGS.editor.conditionalFormatting);
		if (!parsed.values || !Array.isArray(parsed.values)) return [];
		const flattened = [];
		parsed.values.forEach((el) => {
			el.conditions.forEach(d => {
				d.applyOnCategories = el.applyOnCategories;
			})
			flattened.push(...(el.conditions || []));
		});
		if (!Array.isArray(flattened) || !(flattened ? flattened.length : 0)) {
			return [];
		}
		return flattened;
	} catch (e) {
		// console.log("Error parse conditional formatting", SETTINGS.config.conditionalFormatting);
	}
	return [];
};

export const isConditionMatch = (category: string, subCategory: string, value1: number, value2: number, sValue1: number, sValue2: number, tooltips: TooltipData[], flattened: IConditionalFormattingProps[])
	: { match: boolean, markerColor: string, labelColor: string, lineColor: string, sourceName?: string, measureType?: EDataRolesName } => {
	const isMeasureMatch = (result, el: IConditionalFormattingProps, value: number, sourceName: string, measureType: EDataRolesName = undefined) => {
		// const result = { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined, sourceName, measureType };
		const v = +el.staticValue;
		const v2 = el.secondaryStaticValue;
		const color = el.color;
		let match: boolean;

		if (!result.match) {
			switch (el.operator) {
				case "===":
					match = value === v;
					result.match = match;
					break;
				case "!==":
					match = value !== v;
					result.match = match;
					break;
				case "<":
					match = value < v;
					result.match = match;
					break;
				case ">":
					match = value > v;
					result.match = match;
					break;
				case "<=":
					match = value <= v;
					result.match = match;
					break;
				case ">=":
					match = value >= v;
					result.match = match;
					break;
				case "<>":
					match = value > 0 ? value >= v && value <= +v2 : value <= v && value >= +v2;
					result.match = match;
					break;
			}
		}

		if (match) {
			if (el.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
				result.markerColor = color;
			}

			if (el.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
				result.lineColor = color;
			}

			if (el.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
				result.labelColor = color;
			}
		}

		return result;
	}

	try {
		if (!Array.isArray(flattened) || !flattened) return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
		let result: { match: boolean, markerColor: string, labelColor: string, lineColor: string, sourceName?: string, measureType?: EDataRolesName } = { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined, sourceName: "", measureType: undefined };
		for (let index = 0; index < flattened.length; index++) {
			const el = flattened[index];

			if (el.valueType === ECFValueTypes.Value) {
				if (!(el.sourceName !== "" && el.sourceName)) {
					return;
				}

				if (el.applyTo === "measure") {
					if (el.measureType.measure) {
						const isSubcategory = subCategory && el.categoryType === EDataRolesName.SubCategory;
						if (el.measureType.measure1) {
							(isMeasureMatch(result, el, isSubcategory ? sValue1 : value1, el.sourceName, EDataRolesName.Measure1));
						} else if (el.measureType.measure2) {
							isMeasureMatch(result, el, isSubcategory ? sValue2 : value2, el.sourceName, EDataRolesName.Measure2);
						}
					} else if (el.measureType.tooltip) {
						const results = tooltips.map(d => isMeasureMatch(result, el, +d.value, d.displayName));
						result = results.find(d => d.match && d.sourceName === el.sourceName);
					}
					// if (result.match) {
					// 	return result;
					// }
				} else if (el.applyTo === "category") {
					const v = el.staticValue;
					const color = el.color;
					category = (el.categoryType1.category ? category : subCategory).toString();
					let match: boolean;

					if (!result.match) {
						switch (el.operator) {
							case "===":
								match = matchRuleShort(category.toLowerCase(), v.toLowerCase());
								result.match = match;
								break;
							case "!==":
								match = !matchRuleShort(category.toLowerCase(), v.toLowerCase());
								result.match = match;
								break;
							case "contains":
								match = category.toLowerCase().includes(v.toLowerCase());
								result.match = match;
								break;
							case "doesnotcontain":
								match = !category.toLowerCase().includes(v.toLowerCase());
								result.match = match;
								break;
							case "beginswith":
								match = category.toLowerCase().startsWith(v.toLowerCase());
								result.match = match;
								break;
							case "doesnotbeginwith":
								match = !category.toLowerCase().startsWith(v.toLowerCase());
								result.match = match;
								break;
							case "endswith":
								match = category.toLowerCase().endsWith(v.toLowerCase());
								result.match = match;
								break;
							case "doesnotendwith":
								match = !category.toLowerCase().endsWith(v.toLowerCase());
								result.match = match;
								break;
						}
					}

					if (match) {
						if (el.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
							result.markerColor = color;
						}

						if (el.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
							result.lineColor = color;
						}

						if (el.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
							result.labelColor = color;
						}
					}
				}
			}
		}

		if (result.match) {
			return result;
		}
		return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
	} catch (e) {
		console.log("Error fetching conditional formatting colors", e);
	}
	return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
};

export const isConditionMatch1 = (category: string, subCategory: string, value1: number, value2: number, sValue1: number, sValue2: number, tooltips: TooltipData[], flattened: IConditionalFormattingProps)
	: { match: boolean, markerColor: string, labelColor: string, lineColor: string, sourceName?: string, measureType?: EDataRolesName } => {
	const isMeasureMatch = (result, el: IConditionalFormattingProps, value: number, sourceName: string, measureType: EDataRolesName = undefined) => {
		// const result = { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined, sourceName, measureType };
		const v = +el.staticValue;
		const v2 = el.secondaryStaticValue;
		const color = el.color;
		let match: boolean;

		if (!result.match) {
			switch (el.operator) {
				case "===":
					match = value === v;
					result.match = match;
					break;
				case "!==":
					match = value !== v;
					result.match = match;
					break;
				case "<":
					match = value < v;
					result.match = match;
					break;
				case ">":
					match = value > v;
					result.match = match;
					break;
				case "<=":
					match = value <= v;
					result.match = match;
					break;
				case ">=":
					match = value >= v;
					result.match = match;
					break;
				case "<>":
					match = value > 0 ? value >= v && value <= +v2 : value <= v && value >= +v2;
					result.match = match;
					break;
			}
		}

		if (match) {
			if (el.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
				result.markerColor = color;
			}

			if (el.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
				result.lineColor = color;
			}

			if (el.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
				result.labelColor = color;
			}
		}

		return result;
	}

	try {
		if (!flattened) return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
		let result: { match: boolean, markerColor: string, labelColor: string, lineColor: string, sourceName?: string, measureType?: EDataRolesName } = { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined, sourceName: "", measureType: undefined };
		// for (let index = 0; index < flattened.length; index++) {
		const el = flattened;

		if (el.valueType === ECFValueTypes.Value) {
			if (!(el.sourceName !== "" && el.sourceName)) {
				return;
			}

			if (el.applyTo === "measure") {
				if (el.measureType.measure) {
					const isSubcategory = subCategory && el.categoryType === EDataRolesName.SubCategory;
					if (el.measureType.measure1) {
						(isMeasureMatch(result, el, isSubcategory ? sValue1 : value1, el.sourceName, EDataRolesName.Measure1));
					} else if (el.measureType.measure2) {
						isMeasureMatch(result, el, isSubcategory ? sValue2 : value2, el.sourceName, EDataRolesName.Measure2);
					}
				} else if (el.measureType.tooltip) {
					const results = tooltips.map(d => isMeasureMatch(result, el, +d.value, d.displayName));
					result = results.find(d => d.match && d.sourceName === el.sourceName);
				}
				// if (result.match) {
				// 	return result;
				// }
			} else if (el.applyTo === "category") {
				const v = el.staticValue;
				const color = el.color;
				category = (el.categoryType1.category ? category : subCategory).toString();
				let match: boolean;

				if (!result.match) {
					switch (el.operator) {
						case "===":
							match = matchRuleShort(category.toLowerCase(), v.toLowerCase());
							result.match = match;
							break;
						case "!==":
							match = !matchRuleShort(category.toLowerCase(), v.toLowerCase());
							result.match = match;
							break;
						case "contains":
							match = category.toLowerCase().includes(v.toLowerCase());
							result.match = match;
							break;
						case "doesnotcontain":
							match = !category.toLowerCase().includes(v.toLowerCase());
							result.match = match;
							break;
						case "beginswith":
							match = category.toLowerCase().startsWith(v.toLowerCase());
							result.match = match;
							break;
						case "doesnotbeginwith":
							match = !category.toLowerCase().startsWith(v.toLowerCase());
							result.match = match;
							break;
						case "endswith":
							match = category.toLowerCase().endsWith(v.toLowerCase());
							result.match = match;
							break;
						case "doesnotendwith":
							match = !category.toLowerCase().endsWith(v.toLowerCase());
							result.match = match;
							break;
					}
				}

				if (match) {
					if (el.applyOnCategories.includes(ECFApplyOnCategories.Marker)) {
						result.markerColor = color;
					}

					if (el.applyOnCategories.includes(ECFApplyOnCategories.Line)) {
						result.lineColor = color;
					}

					if (el.applyOnCategories.includes(ECFApplyOnCategories.Labels)) {
						result.labelColor = color;
					}
				}
			}
		}
		// }

		if (result.match) {
			return result;
		}
		return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
	} catch (e) {
		console.log("Error fetching conditional formatting colors", e);
	}
	return { match: false, markerColor: undefined, labelColor: undefined, lineColor: undefined };
};

function matchRuleShort(str, rule) {
	const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
	return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

export function calculateStandardDeviation(numbers) {
	// Step 1: Calculate the mean
	const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;

	// Step 2: Calculate the squared differences from the mean
	const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));

	// Step 3: Calculate the mean of the squared differences
	const meanOfSquaredDifferences = squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) / squaredDifferences.length;

	// Step 4: Take the square root of the result from step 3
	const standardDeviation = Math.sqrt(meanOfSquaredDifferences);

	return standardDeviation;
}

export function calculatePowerBiStandardDeviation(data: number[]): number {
	const n = data.length;

	// Step 1: Calculate the mean
	const mean = data.reduce((sum, value) => sum + value, 0) / n;

	// Step 2: Calculate squared differences from the mean
	const squaredDifferences = data.map(value => Math.pow(value - mean, 2));

	// Step 3: Calculate the sum of squared differences
	const sumSquaredDifferences = squaredDifferences.reduce((sum, value) => sum + value, 0);

	// Step 4: Calculate the variance (divide by n-1 for sample standard deviation)
	const variance = sumSquaredDifferences / (n - 1);

	// Step 5: Take the square root to get the standard deviation
	const standardDeviation = Math.sqrt(variance);

	return standardDeviation;
}

export const GetOnlyWordsFromString = (text: string) => {
	return (text.match(/[a-zA-Z]+/g) || []).join(" ");
}

export const GetSVGTextSize2 = (
	textContent: string,
	fontFamily: string,
	fontSize: number,
	fontStyle: EFontStyle[] = [],
	strokeWidth: number = 0) => {
	// Create a temporary SVG element
	const svg = select(document.body).append("svg").attr("visibility", "hidden");

	// Create a text element within the SVG
	const text = svg.append("text")
		.attr("font-size", fontSize)
		.attr("font-family", fontFamily);

	if (fontStyle) {
		text
			.attr("text-decoration", fontStyle.includes(EFontStyle.UnderLine) ? "underline" : "")
			.attr("font-weight", fontStyle.includes(EFontStyle.Bold) ? "bold" : "")
			.attr("font-style", fontStyle.includes(EFontStyle.Italic) ? "italic" : "")
			.attr("stroke-width", strokeWidth);
	}

	text.text(textContent);

	// Get the bounding box of the text element
	const bbox = text.node().getBBox();

	// Remove the SVG element from the DOM
	svg.remove();

	// Return width and height
	return { width: bbox.width, height: bbox.height };
}

export const getConfig = (formatTab) => {
	const obj = {
		[EVisualSettings.BrushAndZoomAreaSettings]: JSON.parse(formatTab[EVisualConfig.BrushAndZoomAreaConfig][EVisualSettings.BrushAndZoomAreaSettings]),
		[EVisualSettings.ChartSettings]: JSON.parse(formatTab[EVisualConfig.ChartConfig][EVisualSettings.ChartSettings]),
		[EVisualSettings.CutAndClipAxisSettings]: JSON.parse(formatTab[EVisualConfig.CutAndClipAxisConfig][EVisualSettings.CutAndClipAxisSettings]),
		[EVisualSettings.DataColorsSettings]: JSON.parse(formatTab[EVisualConfig.DataColorsConfig][EVisualSettings.DataColorsSettings]),
		[EVisualSettings.DataLabelsSettings]: JSON.parse(formatTab[EVisualConfig.DataLabelsConfig][EVisualSettings.DataLabelsSettings]),
		[EVisualSettings.DynamicDeviationSettings]: JSON.parse(formatTab[EVisualConfig.DynamicDeviationConfig][EVisualSettings.DynamicDeviationSettings]),
		[EVisualSettings.ErrorBarsSettings]: JSON.parse(formatTab[EVisualConfig.ErrorBarsConfig][EVisualSettings.ErrorBarsSettings]),
		[EVisualSettings.GridLinesSettings]: JSON.parse(formatTab[EVisualConfig.GridLinesConfig][EVisualSettings.GridLinesSettings]),
		[EVisualSettings.LineSettings]: JSON.parse(formatTab[EVisualConfig.LineConfig][EVisualSettings.LineSettings]),
		[EVisualSettings.MarkerSettings]: JSON.parse(formatTab[EVisualConfig.MarkerConfig][EVisualSettings.MarkerSettings]),
		[EVisualSettings.PatternSettings]: JSON.parse(formatTab[EVisualConfig.PatternConfig][EVisualSettings.PatternSettings]),
		[EVisualSettings.RaceChartSettings]: JSON.parse(formatTab[EVisualConfig.RaceChartConfig][EVisualSettings.RaceChartSettings]),
		[EVisualSettings.RankingSettings]: JSON.parse(formatTab[EVisualConfig.RankingConfig][EVisualSettings.RankingSettings]),
		[EVisualSettings.ReferenceLinesSettings]: JSON.parse(formatTab[EVisualConfig.ReferenceLinesConfig][EVisualSettings.ReferenceLinesSettings]),
		[EVisualSettings.ShowBucketFormatting]: JSON.parse(formatTab[EVisualConfig.ShowBucketConfig][EVisualSettings.ShowBucketFormatting]),
		[EVisualSettings.SmallMultiplesSettings]: JSON.parse(formatTab[EVisualConfig.SmallMultiplesConfig][EVisualSettings.SmallMultiplesSettings]),
		[EVisualSettings.Sorting]: JSON.parse(formatTab[EVisualConfig.SortingConfig][EVisualSettings.Sorting]),
		[EVisualSettings.XAxisSettings]: JSON.parse(formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings]),
		[EVisualSettings.YAxisSettings]: JSON.parse(formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings]),
	}

	obj["conditionalFormatting"] = JSON.parse(formatTab["editor"]["conditionalFormatting"] !== "" ? formatTab["editor"]["conditionalFormatting"] : "{}");
	obj["annotations"] = JSON.parse(formatTab["editor"]["annotations"]);

	return obj;
}

export const configs = {
	[EVisualSettings.BrushAndZoomAreaSettings]: EVisualConfig.BrushAndZoomAreaConfig,
	[EVisualSettings.ChartSettings]: EVisualConfig.ChartConfig,
	[EVisualSettings.CutAndClipAxisSettings]: EVisualConfig.CutAndClipAxisConfig,
	[EVisualSettings.DataColorsSettings]: EVisualConfig.DataColorsConfig,
	[EVisualSettings.DataLabelsSettings]: EVisualConfig.DataLabelsConfig,
	[EVisualSettings.DynamicDeviationSettings]: EVisualConfig.DynamicDeviationConfig,
	[EVisualSettings.ErrorBarsSettings]: EVisualConfig.ErrorBarsConfig,
	[EVisualSettings.GridLinesSettings]: EVisualConfig.GridLinesConfig,
	[EVisualSettings.IBCSSettings]: EVisualConfig.IBCSConfig,
	[EVisualSettings.LineSettings]: EVisualConfig.LineConfig,
	[EVisualSettings.MarkerSettings]: EVisualConfig.MarkerConfig,
	[EVisualSettings.PatternSettings]: EVisualConfig.PatternConfig,
	[EVisualSettings.RaceChartSettings]: EVisualConfig.RaceChartConfig,
	[EVisualSettings.RankingSettings]: EVisualConfig.RankingConfig,
	[EVisualSettings.ReferenceLinesSettings]: EVisualConfig.ReferenceLinesConfig,
	[EVisualSettings.ShowBucketFormatting]: EVisualConfig.ShowBucketConfig,
	[EVisualSettings.SmallMultiplesSettings]: EVisualConfig.SmallMultiplesConfig,
	[EVisualSettings.Sorting]: EVisualConfig.SortingConfig,
	[EVisualSettings.XAxisSettings]: EVisualConfig.XAxisConfig,
	[EVisualSettings.YAxisSettings]: EVisualConfig.YAxisConfig
};

export const ApplyThemeJson = (self: Visual, json, formatTab) => {
	try {
		const obj = typeof json === "object" ? json : JSON.parse(json);
		const keys = Object.keys(getConfig(formatTab));
		const mergeObject = [];
		keys.forEach(el => {
			if (el === "conditionalFormatting" || el === "annotations") {
				if (el === "conditionalFormatting" && Object.keys(obj["conditionalFormatting"]).length > 0) {
					mergeObject.push({
						objectName: "editor",
						properties: {
							["conditionalFormatting"]: JSON.stringify(obj["conditionalFormatting"]),
						},
						selector: null,
					})
				}

				if (el === "annotations" && obj["annotations"].length > 0) {
					mergeObject.push({
						objectName: "editor",
						properties: {
							["annotations"]: JSON.stringify(obj["annotations"]),
						},
						selector: null,
					})
				}
			} else {
				if (obj.hasOwnProperty(el)) {
					mergeObject.push({
						objectName: configs[el],
						properties: {
							[el]: JSON.stringify(obj[el]),
						},
						selector: null,
					})
				}
				else {
					throw "Invalid JSON file"
				}
			}
		});

		if (mergeObject.length > 0) {
			self._host.persistProperties({
				merge: mergeObject,
			});
		}
	} catch (e) {
		console.log("Error while applying theme", e);
	}
};

export const CreateDate = (day: number, monthName: string, quarter: number, year: number) => {
	let finalMonthName = monthName;

	if (!finalMonthName) {
		if (quarter) {
			switch (quarter) {
				case 1:
					finalMonthName = "January";
					break;
				case 2:
					finalMonthName = "April";
					break;
				case 3:
					finalMonthName = "July";
					break;
				case 4:
					finalMonthName = "October";
					break;
			}
		} else {
			finalMonthName = "January";
		}
	}

	const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(finalMonthName);
	if (month === -1) {
		throw new Error(`Invalid month name: ${finalMonthName}`);
	}
	try {
		return new Date(year, month, day);
	} catch (error) {
		throw new Error(`Invalid date: ${day} ${finalMonthName} (${quarter}) ${year}`);
	}
}
