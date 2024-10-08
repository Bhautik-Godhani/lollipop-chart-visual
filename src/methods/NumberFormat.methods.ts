/* eslint-disable max-lines-per-function */
/* eslint-disable no-self-assign */
import { DisplayUnits, EAxisNumberValueType, SemanticNegativeNumberFormats, SemanticPositiveNumberFormats } from "../enum";
import { IValueFormatter } from "../model";
import { NumberFormatting } from "../settings";
import { Visual } from "../visual";

export const getNumberDisplayUnit = (number: number, isMinThousandsLimit: boolean): DisplayUnits => {
    if (number < 0) {
        if (isMinThousandsLimit ? (number < -1.0e3 && number >= -1.0e6) : (number >= -1.0e6)) {
            return DisplayUnits.Thousands;
        } else if (number < -1.0e6 && number >= -1.0e9) {
            return DisplayUnits.Millions;
        } else if (number < -1.0e9 && number >= -1.0e12) {
            return DisplayUnits.Billions;
        } else if (number < -1.0e12) {
            return DisplayUnits.Trillions
        } else {
            return DisplayUnits.None
        }
    } else {
        if (isMinThousandsLimit ? (number > 1.0e3 && number <= 1.0e6) : (number <= 1.0e6)) {
            return DisplayUnits.Thousands;
        } else if (number > 1.0e6 && number <= 1.0e9) {
            return DisplayUnits.Millions;
        } else if (number > 1.0e9 && number <= 1.0e12) {
            return DisplayUnits.Billions;
        } else if (number > 1.0e12) {
            return DisplayUnits.Trillions;
        } else {
            return DisplayUnits.None;
        }
    }
}

export const GetInvertAutoUnitFormattedNumber = (numberFormatting: NumberFormatting, displayUnit: DisplayUnits, number: number, isUseSematicFormat: boolean, isMinThousandsLimit: boolean): string => {
    let formattedNumber: string;
    const numberSettings = numberFormatting;
    const isScaling = numberSettings.scalingLabel;
    const isSemanticFormat = isUseSematicFormat ? numberSettings.semanticFormatting : false;

    switch (displayUnit) {
        case DisplayUnits.None:
            formattedNumber = DecimalSeparator(numberFormatting, +number.toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber).toString()
            );
        case DisplayUnits.Thousands:
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.thousandScalingLabel : "K")
            );
        case DisplayUnits.Millions:
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.millionScalingLabel : "M")
            );
        case DisplayUnits.Billions:
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.billionScalingLabel : "B")
            );
        case DisplayUnits.Trillions:
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.trillionScalingLabel : "T")
            );
    }
}

export const GetAutoUnitFormattedNumber = (numberFormatting: NumberFormatting, number: number, isUseSematicFormat: boolean, isMinThousandsLimit: boolean): string => {
    let formattedNumber: string;
    const numberSettings = numberFormatting;
    const isScaling = numberSettings.scalingLabel;
    const isSemanticFormat = isUseSematicFormat ? numberSettings.semanticFormatting : false;

    if (number < 0) {
        if (isMinThousandsLimit ? (number < -1.0e3 && number >= -1.0e6) : (number >= -1.0e6)) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.thousandScalingLabel : "K")
            );
        } else if (number < -1.0e6 && number >= -1.0e9) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.millionScalingLabel : "M")
            );
        } else if (number < -1.0e9 && number >= -1.0e12) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.billionScalingLabel : "B")
            );
        } else if (number < -1.0e12) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.trillionScalingLabel : "T")
            );
        } else {
            formattedNumber = DecimalSeparator(numberFormatting, +number.toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber).toString()
            );
        }
    } else {
        if (isMinThousandsLimit ? (number > 1.0e3 && number <= 1.0e6) : (number <= 1.0e6)) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.thousandScalingLabel : "K")
            );
        } else if (number > 1.0e6 && number <= 1.0e9) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.millionScalingLabel : "M")
            );
        } else if (number > 1.0e9 && number <= 1.0e12) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.billionScalingLabel : "B")
            );
        } else if (number > 1.0e12) {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber) +
                (isScaling ? numberSettings.trillionScalingLabel : "T")
            );
        } else {
            formattedNumber = DecimalSeparator(numberFormatting, +number.toFixed(numberSettings.decimalPlaces));
            return (
                (isSemanticFormat ? GetSemanticFormattedNumber(numberFormatting, formattedNumber, number) : formattedNumber).toString()
            );
        }
    }
}

export const ThousandsSeparator = (numberSettings: NumberFormatting, number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, numberSettings.thousandsSeparator);
}

export const DecimalSeparator = (numberSettings: NumberFormatting, number: number): string => {
    const decimals = (number - Math.floor(number)).toFixed(numberSettings.decimalPlaces);
    const fNumber =
        (number + "").split(".")[0] +
        (decimals.toString().split(".").length > 1 ? numberSettings.decimalSeparator + decimals.toString().split(".")[1] : "");
    return fNumber;
}

export const GetSemanticFormattedNumber = (numberFormatting: NumberFormatting, number: string, originalNumber: number): string | number => {
    const numberSettings = numberFormatting;
    let formattedNumber: string;
    if (numberSettings.semanticFormatting) {
        if (parseFloat(number) >= 0) {
            switch (numberSettings.positiveFormat) {
                case SemanticPositiveNumberFormats.X:
                    formattedNumber = number;
                    break;
                case SemanticPositiveNumberFormats.PlusX:
                    formattedNumber = "+" + number;
                    break;
                case SemanticPositiveNumberFormats.XPlus:
                    formattedNumber = number + "+";
                    break;
            }
        } else {
            const negativeNumber = numberSettings.scaling === DisplayUnits.None ? originalNumber : parseFloat(number);
            const absNumber =
                numberSettings.scaling === DisplayUnits.None
                    ? ThousandsSeparator(numberFormatting, parseFloat(Math.abs(negativeNumber).toFixed(numberSettings.decimalPlaces)))
                    : Math.abs(negativeNumber);
            switch (numberSettings.negativeFormat) {
                case SemanticNegativeNumberFormats.X:
                    formattedNumber = absNumber + "";
                    break;
                case SemanticNegativeNumberFormats.MinusX:
                    formattedNumber = "-" + absNumber;
                    break;
                case SemanticNegativeNumberFormats.XMinus:
                    formattedNumber = absNumber + "-";
                    break;
                case SemanticNegativeNumberFormats.XInBrackets:
                    formattedNumber = "(" + absNumber + ")";
                    break;
            }
        }
    } else {
        formattedNumber = number;
    }

    return formattedNumber;
}

export const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

export const GetFormattedNumber = (self: Visual, number: number | string, numberFormatting: NumberFormatting, valueFormatter: IValueFormatter, isUseSematicFormat: boolean, isMinThousandsLimit: boolean = false): string => {
    const numberSettings = numberFormatting;
    const formatter = valueFormatter ? valueFormatter.formatter : undefined;
    let isPercentageNumber: boolean;

    if (number === undefined || number === null) {
        return;
    }

    if (valueFormatter && number && valueFormatter.format && valueFormatter.format.includes("%")) {
        isPercentageNumber = true;

        if (!numberSettings.show) {
            // number = parseFloat(number.toString());
        } else {
            number = parseFloat(number.toString());
        }
    }

    if (typeof number !== "number") {
        return formatter ? formatter.format(number) : number.toString();
    }

    if (numberSettings.show && numberSettings.valueType && numberSettings.valueType === EAxisNumberValueType.Percentage) {
        return (number / 100) + "%";
    }

    if (!numberSettings.show) {
        return formatter ? formatter.format(number) : number.toString();
    }

    let formattedNumber: string | number = number;
    switch (numberSettings.scaling) {
        case DisplayUnits.Auto: {
            formattedNumber = GetAutoUnitFormattedNumber(numberFormatting, number, isUseSematicFormat, isMinThousandsLimit);
            break;
        }
        case DisplayUnits.Relative: {
            formattedNumber = GetInvertAutoUnitFormattedNumber(numberFormatting, self.axisDomainMaxValueDisplayUnit, number, isUseSematicFormat, isMinThousandsLimit);
            break;
        }
        case DisplayUnits.None: {
            formattedNumber = ThousandsSeparator(numberFormatting, parseFloat(number.toFixed(numberSettings.decimalPlaces)));
            break;
        }
        case DisplayUnits.Thousands: {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Millions: {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Billions: {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Trillions: {
            formattedNumber = DecimalSeparator(numberFormatting, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
            break;
        }
        default: {
            formattedNumber = GetAutoUnitFormattedNumber(numberFormatting, number, isUseSematicFormat, isMinThousandsLimit);
        }
    }

    if (isUseSematicFormat && !(numberSettings.scaling === DisplayUnits.Auto || numberSettings.scaling === DisplayUnits.Relative)) {
        formattedNumber = GetSemanticFormattedNumber(numberFormatting, formattedNumber, number);
    }

    switch (numberSettings.scaling) {
        case DisplayUnits.Auto: {
            formattedNumber = formattedNumber;
            break;
        }
        case DisplayUnits.Relative: {
            formattedNumber = formattedNumber;
            break;
        }
        case DisplayUnits.None: {
            formattedNumber = formattedNumber;
            break;
        }
        case DisplayUnits.Thousands: {
            formattedNumber = formattedNumber + numberSettings.thousandScalingLabel;
            break;
        }
        case DisplayUnits.Millions: {
            formattedNumber = formattedNumber + numberSettings.millionScalingLabel;
            break;
        }
        case DisplayUnits.Billions: {
            formattedNumber = formattedNumber + numberSettings.billionScalingLabel;
            break;
        }
        case DisplayUnits.Trillions: {
            formattedNumber = formattedNumber + numberSettings.trillionScalingLabel;
            break;
        }
        default: {
            formattedNumber = formattedNumber;
        }
    }

    return numberSettings.prefix + "" + (isPercentageNumber ? formattedNumber.toString().concat("%") : formattedNumber) + "" + numberSettings.suffix;
}

export const extractDigitsFromString = (str) => {
    // Use a regular expression to match all digits
    const digitMatches = str.match(/[-+]?\d+(\.\d+)?/g);

    // Check if there are any matches
    if (digitMatches) {
        // Join the matched digits into a single string or convert to an array if needed
        const digits = digitMatches.join('');
        return parseFloat(digits);
    } else {
        return undefined;
    }
}