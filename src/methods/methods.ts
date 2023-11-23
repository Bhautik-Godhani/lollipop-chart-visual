/* eslint-disable max-lines-per-function */
import { textMeasurementService, wordBreaker } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { NumberFormatting } from "../settings";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = valueFormatter.IValueFormatter;
import { PATTERNS } from "./patterns";
import { Visual } from "../visual";
import crypto from "crypto";
import { IConditionalFormattingProps } from "../visual-settings.interface";
import { TooltipData } from "../model";
import { EDataRolesName, EIBCSSettings, EVisualConfig, EVisualSettings } from "../enum";
import { CATEGORY_MARKERS } from "../settings-pages/markers";
import { ApplyBeforeIBCSAppliedSettingsBack } from "./IBCS.methods";

export const persistProperties = (shadow: Visual, configName: EVisualConfig, settingName: EVisualSettings, configValues: any) => {
	if (shadow.IBCSSettings.isIBCSEnabled) {
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
				objectName: EVisualConfig.IBCSConfig,
				displayName: EVisualSettings.IBCSSettings,
				properties: {
					[EVisualSettings.IBCSSettings]: JSON.stringify({
						...shadow.IBCSSettings,
						[EIBCSSettings.IsIBCSEnabled]: false,
						[EIBCSSettings.Theme]: undefined,
						[EIBCSSettings.PrevTheme]: undefined,
					}),
				},
				selector: null,
			}
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

	return wordBreaker.splitByWidth(text, textProperties, calcTextWidth, maxWidth, maxLines, textTruncator);
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

export const formatNumber = (number: number | string, options: NumberFormatting, formatter: IValueFormatter = undefined): string => {
	if (typeof number !== "number") {
		return number;
	}

	if (!options.show && formatter) {
		return formatter.format(number);
	}

	let __n = number;
	let _num;
	let scaledTo = "none";

	const scalingMapping = {
		thousands: options.thousandScalingLabel,
		million: options.millionScalingLabel,
		billion: options.billionScalingLabel,
		trillion: options.trillionScalingLabel,
	};

	const defaultScalingMapping = {
		thousands: "K",
		million: "M",
		billion: "B",
		trillion: "T",
	};

	if (options.scaling) {
		const scaledNumber = scaleNumber(__n, options.scaling);
		__n = scaledNumber.n;
		scaledTo = scaledNumber.scaledTo;
	}

	if (typeof options.decimalPlaces === "number" && options.decimalPlaces >= 0) {
		options.decimalPlaces = options.decimalPlaces > 100 ? 100 : options.decimalPlaces;
		const decimals = Math.floor(options.decimalPlaces);
		if (typeof __n === "number") {
			if (!options.thousandsSeparator) {
				_num = __n.toFixed(decimals).toString();
			} else {
				_num = __n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
			}
		} else {
			_num = __n;
		}
	} else {
		_num = __n.toString();
	}

	// _num = formatter.format(parseInt(_num));
	if (options.decimalSeparator) {
		_num = _num.replace(".", options.decimalSeparator);
	}
	if (options.thousandsSeparator) {
		_num = _num.replace(/,/g, options.thousandsSeparator);
	}

	if (scaledTo !== "none") {
		_num += options.scalingLabel ? scalingMapping[scaledTo] : defaultScalingMapping[scaledTo];
	}

	_num = options.prefix !== "" ? options.prefix + "" + _num + "" + options.suffix : _num + "" + options.suffix;

	return _num.trim();
};

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
	number: number,
	formatter: IValueFormatter,
): string => {
	return formatter.format(number);
}

export const generateSecureRandomBytes = (length) => {
	return crypto.randomBytes(length);
}

export const createPatternsDefs = (self: Visual, svgRootElement) => {
	const filterDef = svgRootElement.append("defs");
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
	const filterDef = svgRootElement.append("defs");
	CATEGORY_MARKERS.map((marker) => {
		const symbol = filterDef
			.append("symbol")
			.attr("id", marker.value + "_MARKER")
			.attr("viewBox", `0 0 ${marker.w} ${marker.h}`);

		marker.paths.forEach(path => {
			symbol.append("path")
				.attr("d", path.d)
				.attr("fill", path.fill)
				.attr("stroke", path.stroke);
		})
	});
};

export const generatePattern = (svgRootElement, pattern, color, isLegend = false) => {
	let defs = svgRootElement.select("defs");

	if (defs.empty()) {
		defs = svgRootElement.append("defs");
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

export const isConditionMatch = (category: string, subCategory: string, value1: number, value2: number, tooltips: TooltipData[], flattened: IConditionalFormattingProps[]) => {
	const isMeasureMatch = (el: IConditionalFormattingProps, value: number, sourceName: string, measureType: EDataRolesName = undefined) => {
		const result = { match: false, color: "", sourceName, measureType };
		const v = +el.staticValue;
		const v2 = el.secondaryStaticValue;
		const color = el.color;

		switch (el.operator) {
			case "===":
				result.match = value === v;
				result.color = color;
				break;
			case "!==":
				result.match = value !== v;
				result.color = color;
				break;
			case "<":
				result.match = value < v;
				result.color = color;
				break;
			case ">":
				result.match = value > v;
				result.color = color;
				break;
			case "<=":
				result.match = value <= v;
				result.color = color;
				break;
			case ">=":
				result.match = value >= v;
				result.color = color;
				break;
			case "<>":
				result.match = value > 0 ? value >= v && value <= +v2 : value <= v && value >= +v2;
				result.color = color;
				break;
		}

		return result;
	}

	try {
		if (!Array.isArray(flattened) || !flattened) return { match: false, color: "" };
		let result: { match: boolean, color: string, sourceName?: string, measureType?: EDataRolesName } = { match: false, color: "", sourceName: "", measureType: undefined };
		for (let index = 0; index < flattened.length; index++) {
			const el = flattened[index];

			if (!(el.sourceName !== "" && el.sourceName)) {
				return;
			}

			if (el.applyTo === "measure") {
				if (el.measureType.measure) {
					if (el.measureType.measure1) {
						result = (isMeasureMatch(el, value1, el.sourceName, EDataRolesName.Measure1));
					} else if (el.measureType.measure2) {
						result = isMeasureMatch(el, value2, el.sourceName, EDataRolesName.Measure2);
					}
				} else if (el.measureType.tooltip) {
					const results = tooltips.map(d => isMeasureMatch(el, +d.value, d.displayName));
					result = results.find(d => d.match && d.sourceName === el.sourceName);
				}
				if (result.match) {
					return result;
				}
			} else if (el.applyTo === "category") {
				const v = el.staticValue;
				const color = el.color;
				category = el.categoryType.category ? category : subCategory;

				switch (el.operator) {
					case "===":
						result = { match: matchRuleShort(category.toLowerCase(), v.toLowerCase()), color };
						break;
					case "!==":
						result = { match: !matchRuleShort(category.toLowerCase(), v.toLowerCase()), color };
						break;
					case "contains":
						result = { match: category.toLowerCase().includes(v.toLowerCase()), color };
						break;
					case "doesnotcontain":
						result = { match: !category.toLowerCase().includes(v.toLowerCase()), color };
						break;
					case "beginswith":
						result = { match: category.toLowerCase().startsWith(v.toLowerCase()), color };
						break;
					case "doesnotbeginwith":
						result = { match: !category.toLowerCase().startsWith(v.toLowerCase()), color };
						break;
					case "endswith":
						result = { match: category.toLowerCase().endsWith(v.toLowerCase()), color };
						break;
					case "doesnotendwith":
						result = { match: !category.toLowerCase().endsWith(v.toLowerCase()), color };
						break;
				}
				if (result.match) {
					return result;
				}
			}
		}
		return { match: false, color: "" };
	} catch (e) {
		console.log("Error fetching conditional formatting colors", flattened);
	}
	return { match: false, color: "" };
};

function matchRuleShort(str, rule) {
	const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
	return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}