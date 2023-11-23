import { ColorPicker, ColorSchemePicker, Column, ConditionalWrapper, Footer, GradientPicker, Row, SelectInput, SwitchOption } from "@truviz/shadow/dist/Components";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import * as React from "react";
import { DATA_COLORS as DATA_COLORS_IMP } from "../constants";
import { ColorPaletteType, EDataColorsSettings, EMarkerColorTypes } from "../enum";
import { parseObject, persistProperties } from "../methods/methods";
import { IDataColorsSettings, ILabelValuePair } from "../visual-settings.interface";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";

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
		label: "By Category",
		value: ColorPaletteType.ByCategory,
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

const handleChange = (v, n, markerType: EMarkerColorTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[markerType]: { ...d[markerType], [n]: v },
	}));
};

const handleColorChange = (rgb, n, markerType: EMarkerColorTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[markerType]: { ...d[markerType], [n]: rgb },
	}));
};

const handleCheckbox = (n, markerType: EMarkerColorTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[markerType]: { ...d[markerType], [n]: !d[markerType][n], },
	}));
};

const handleCategoryChange = (rgb, i, markerType: EMarkerColorTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => {
		const byCategory = [...d[d.markerType].categoryColors];
		byCategory[i][markerType] = rgb;
		const newState = {
			...d,
			[markerType]: { ...d[markerType], [EDataColorsSettings.CategoryColors]: byCategory },
		};
		return newState;
	});
};

const UIColorPalette = (configValues: IDataColorsSettings, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Color Palette"}
						value={configValues[configValues.markerType].fillType}
						optionsList={colorPaletteDropdownList}
						handleChange={(newValue) => handleChange(newValue, EDataColorsSettings.FillType, configValues.markerType, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UIGradientColorPalette = (
	vizOptions: ShadowUpdateOptions,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues[configValues.markerType];
	return (
		<ConditionalWrapper visible={values.fillType === ColorPaletteType.Gradient}>
			<Row>
				<Column>
					<GradientPicker
						minColor={values.fillMin}
						midColor={values.fillMid}
						maxColor={values.fillMax}
						handleMinColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMin, configValues.markerType, setConfigValues)}
						handleMidColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMid, configValues.markerType, setConfigValues)}
						handleMaxColorChange={(value) => handleColorChange(value, EDataColorsSettings.FillMax, configValues.markerType, setConfigValues)}
						enableMidColor={values.isAddMidColor}
						toggleEnableMidColor={() => handleCheckbox(EDataColorsSettings.IsAddMidColor, configValues.markerType, setConfigValues)}
						colorPalette={vizOptions.host.colorPalette}
						label=""
					/>
				</Column>
			</Row>
		</ConditionalWrapper>
	);
};

const UIByCategoryColorPalette = (
	vizOptions: ShadowUpdateOptions,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues[configValues.markerType];
	return (
		<ConditionalWrapper visible={values.fillType === ColorPaletteType.ByCategory}>
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
								color={categoryColor[configValues.markerType]}
								handleChange={(value) => handleCategoryChange(value, ci, configValues.markerType, setConfigValues)}
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
	configValues: IDataColorsSettings,
	vizOptions: any,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues[configValues.markerType];

	return (
		<>
			<ConditionalWrapper visible={values.fillType === ColorPaletteType.Single}>
				<Row>
					<Column>
						<ColorPicker
							label={"Color"}
							color={values.singleColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor, configValues.markerType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			{UIByCategoryColorPalette(vizOptions, configValues, setConfigValues)}
			{UIGradientColorPalette(vizOptions, configValues, setConfigValues)}

			<ConditionalWrapper
				visible={[ColorPaletteType.Diverging, ColorPaletteType.Qualitative, ColorPaletteType.Sequential].includes(
					values.fillType as any
				)}
			>
				<Row>
					<Column>
						<ColorSchemePicker
							colorSchemePickerProps={values}
							onChange={(d) => {
								setConfigValues((t) => {
									return { ...t, [t.markerType]: d };
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
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.PositiveColor, configValues.markerType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>

					<Column>
						<ColorPicker
							label={"Negative Color"}
							color={values.negativeColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.NegativeColor, configValues.markerType, setConfigValues)}
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
		if (!shadow.isHasMultiMeasure && configValues.markerType === EMarkerColorTypes.Marker2) {
			setConfigValues((d) => ({
				...d,
				[EDataColorsSettings.MarkerType]: EMarkerColorTypes.Marker1,
			}));
		}
	}, []);

	const resetChanges = () => {
		setConfigValues({ ...DATA_COLORS });
	};

	const fillTypes = JSON.parse(JSON.stringify(colorPaletteDropdownList));

	if (shadow.isGroupingPresent) {
		fillTypes.push({
			label: "Category",
			value: ColorPaletteType.ByCategory,
		});
	}

	React.useEffect(() => {
		if (configValues[configValues.markerType].fillType === ColorPaletteType.ByCategory)
			setConfigValues((d) => {
				return {
					...d,
					[configValues.markerType]: {
						...d[configValues.markerType],
						[EDataColorsSettings.CategoryColors]: !shadow.isHasSubcategories
							? [...shadow.categoriesColorList]
							: [...shadow.subCategoriesColorList],
					}
				};
			});
	}, [configValues[configValues.markerType].fillType]);

	return (
		<>
			<ConditionalWrapper visible={!shadow.isHasMultiMeasure}>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isHasMultiMeasure}>
				<Row>
					<Column>
						<SwitchOption
							label={"Select Measure"}
							value={configValues.markerType}
							optionsList={MARKER_TYPES}
							handleChange={(value) => {
								setConfigValues((d) => ({
									...d,
									[EDataColorsSettings.MarkerType]: value,
								}));
							}}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			{UIColorPalette(configValues, setConfigValues)}
			{UIColorPaletteTypes(configValues, vizOptions, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataColors;
