import { textMeasurementService, wordBreaker } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { NumberFormatting } from "../settings";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = valueFormatter.IValueFormatter;

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

export const formatNumber = (number: number | string, options: NumberFormatting, formatter: IValueFormatter): string => {
	if (typeof number !== "number") {
		return number;
	}

	if (!options.show) {
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