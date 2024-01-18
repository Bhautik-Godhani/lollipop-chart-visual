import { ColorPicker, ColorSchemePicker, Column, ConditionalWrapper, Footer, GradientPicker, Row, SelectInput, SwitchOption } from "@truviz/shadow/dist/Components";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import * as React from "react";
import { DATA_COLORS as DATA_COLORS_IMP } from "../constants";
import { ColorPaletteType, EDataColorsSettings, EMarkerColorTypes } from "../enum";
import { parseObject, persistProperties } from "../methods/methods";
import { IDataColorsSettings, ILabelValuePair } from "../visual-settings.interface";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { Visual } from "../visual";

const handleChange = (v, n, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: v,
	}));
};

const handleColorChange = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: rgb,
	}));
};

const handleCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: !d[n],
	}));
};

const handleCategoryChange = (rgb, i, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => {
		const byCategory = [...d.categoryColors];
		byCategory[i].marker = rgb;
		const newState = {
			...d,
			[EDataColorsSettings.CategoryColors]: byCategory,
		};
		return newState;
	});
};

const UIColorPalette = (shadow: Visual, configValues: IDataColorsSettings, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	const colorPaletteDropdownList = [
		{
			label: "Single",
			value: ColorPaletteType.Single,
		},
		{
			label: "Power BI Theme",
			value: ColorPaletteType.PowerBi,
		},
		{
			label: "Gradient",
			value: ColorPaletteType.Gradient,
		},
		{
			label: "Sequential",
			value: ColorPaletteType.Sequential,
		},
		{
			label: "Diverging",
			value: ColorPaletteType.Diverging,
		},
		{
			label: "Qualitative",
			value: ColorPaletteType.Qualitative,
		},
		{
			label: "Positive/Negative",
			value: ColorPaletteType.PositiveNegative,
		}
	];

	if (!shadow.isHasMultiMeasure && shadow.isLollipopTypeCircle) {
		colorPaletteDropdownList.push(
			{
				label: "By Category",
				value: ColorPaletteType.ByCategory,
			},
		)
	}

	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Color Palette"}
						value={configValues.fillType}
						optionsList={colorPaletteDropdownList}
						handleChange={(newValue) => {
							handleChange(newValue, EDataColorsSettings.FillType, setConfigValues);

							if (shadow.isHasNegativeValue) {
								handleChange(true, EDataColorsSettings.IsFillTypeChanged, setConfigValues)
							}
						}}
					/>
				</Column>
			</Row>
		</>
	);
};

const UIGradientColorPalette = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues;
	const MARKER_TYPES: ILabelValuePair[] = [
		{
			label: shadow.measure1DisplayName,
			value: EMarkerColorTypes.Marker1,
		},
		{
			label: shadow.measure2DisplayName,
			value: EMarkerColorTypes.Marker2,
		},
	];

	return (
		<>
			< ConditionalWrapper visible={values.fillType === ColorPaletteType.Gradient && shadow.isLollipopTypePie && shadow.isHasSubcategories && shadow.isHasMultiMeasure} >
				<Row>
					<Column>
						<SwitchOption
							label={"Select Measure"}
							value={configValues.gradientAppliedToMeasure}
							optionsList={MARKER_TYPES}
							handleChange={(value) => {
								setConfigValues((d) => ({
									...d,
									[EDataColorsSettings.GradientAppliedToMeasure]: value,
								}));
							}}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={values.fillType === ColorPaletteType.Gradient}>
				<Row>
					<Column>
						<GradientPicker
							minColor={values.fillMin}
							midColor={values.fillMid}
							maxColor={values.fillMax}
							handleMinColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMin, setConfigValues)}
							handleMidColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMid, setConfigValues)}
							handleMaxColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMax, setConfigValues)}
							enableMidColor={values.isAddMidColor}
							toggleEnableMidColor={() => handleCheckbox(EDataColorsSettings.IsAddMidColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							label=""
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UIByCategoryColorPalette = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues;
	return (
		<ConditionalWrapper visible={!shadow.isHasMultiMeasure && shadow.isLollipopTypeCircle && values.fillType === ColorPaletteType.ByCategory}>
			{values.categoryColors.map((categoryColor, ci) => {
				const categoryNameProperties = {
					text: categoryColor.name,
					fontFamily: "sans-serif",
					fontSize: 11.5 + "px",
				};
				const categoryName = textMeasurementService.getTailoredTextOrDefault(categoryNameProperties, 170);

				return (
					<Row>
						<Column>
							<ColorPicker
								label={categoryName}
								color={categoryColor.marker}
								handleChange={(value) => {
									return handleCategoryChange(value, ci, setConfigValues)
								}}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				);
			})}
		</ConditionalWrapper>
	);
};

const UIColorPaletteTypes = (
	shadow: Visual,
	configValues: IDataColorsSettings,
	vizOptions: any,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues;

	return (
		<>
			<ConditionalWrapper visible={values.fillType === ColorPaletteType.Single}>
				<ConditionalWrapper visible={!shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<ColorPicker
								label={"Color"}
								color={values.singleColor1}
								handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor1, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				<ConditionalWrapper visible={shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<ColorPicker
								label={shadow.measure1DisplayName}
								color={values.singleColor1}
								handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor1, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<ColorPicker
								label={shadow.measure2DisplayName}
								color={values.singleColor2}
								handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor2, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper>

			{UIByCategoryColorPalette(shadow, vizOptions, configValues, setConfigValues)}
			{UIGradientColorPalette(shadow, vizOptions, configValues, setConfigValues)}

			<ConditionalWrapper
				visible={[ColorPaletteType.Diverging, ColorPaletteType.Qualitative, ColorPaletteType.Sequential].includes(
					values.fillType as any
				)}
			>
				<Row>
					<Column>
						<ColorSchemePicker
							colorSchemePickerProps={values}
							keepNumberOfDataClassesOption={false}
							keepGradientOption={false}
							onChange={(d) => {
								setConfigValues(() => {
									return { ...d };
								});
							}}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={values.fillType === ColorPaletteType.PositiveNegative}>
				<Row>
					<Column>
						<ColorPicker
							label={"Positive Color"}
							color={values.positiveColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.PositiveColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>

					<Column>
						<ColorPicker
							label={"Negative Color"}
							color={values.negativeColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.NegativeColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UIFooter = (closeCurrentSettingHandler: () => void, applyChanges: () => void, resetChanges: () => void) => {
	return (
		<Footer
			cancelButtonHandler={closeCurrentSettingHandler}
			saveButtonConfig={{
				isDisabled: false,
				text: "APPLY",
				handler: applyChanges,
			}}
			resetButtonHandler={resetChanges}
		/>
	);
};

const DataColors = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const DATA_COLORS = JSON.parse(JSON.stringify(DATA_COLORS_IMP));
	const _initialStates = vizOptions.formatTab[sectionName][propertyName];
	const initialStates: typeof DATA_COLORS = parseObject(_initialStates, DATA_COLORS);

	const MARKER_TYPES: ILabelValuePair[] = [
		{
			label: shadow.measure1DisplayName,
			value: EMarkerColorTypes.Marker1,
		},
		{
			label: shadow.measure2DisplayName,
			value: EMarkerColorTypes.Marker2,
		},
	];

	const applyChanges = () => {
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const [configValues, setConfigValues] = React.useState<IDataColorsSettings>({
		...initialStates,
	});

	React.useEffect(() => {
		if ((shadow.isHasMultiMeasure || shadow.isLollipopTypePie) && configValues.fillType === ColorPaletteType.ByCategory) {
			setConfigValues((d) => ({
				...d,
				[EDataColorsSettings.FillType]: ColorPaletteType.Single,
			}));
		}

		// if (configValues.fillType === ColorPaletteType.Gradient && shadow.isLollipopTypePie && shadow.isHasSubcategories && shadow.isHasMultiMeasure) {
		// 	setConfigValues((d) => ({
		// 		...d,
		// 		[EDataColorsSettings.GradientAppliedToMeasure]: EMarkerColorTypes.Marker1,
		// 	}));
		// }

		if (!shadow.isHasMultiMeasure && configValues.gradientAppliedToMeasure === EMarkerColorTypes.Marker2) {
			setConfigValues((d) => ({
				...d,
				[EDataColorsSettings.GradientAppliedToMeasure]: EMarkerColorTypes.Marker1,
			}));
		}
	}, []);

	const resetChanges = () => {
		setConfigValues({ ...DATA_COLORS });
	};

	React.useEffect(() => {
		if (configValues.fillType === ColorPaletteType.ByCategory)
			setConfigValues((d) => {
				return {
					...d,
					[EDataColorsSettings.CategoryColors]: shadow.isLollipopTypeCircle
						? [...shadow.categoriesColorList]
						: [...shadow.subCategoriesColorList],
				};
			});
	}, [configValues.fillType]);

	return (
		<>
			{UIColorPalette(shadow, configValues, setConfigValues)}
			{UIColorPaletteTypes(shadow, configValues, vizOptions, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataColors;
