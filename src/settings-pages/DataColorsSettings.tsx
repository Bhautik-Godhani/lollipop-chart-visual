import { ColorPicker, ColorSchemePicker, Column, ConditionalWrapper, Footer, GradientPicker, Quote, Row, SelectInput, ToggleButton } from "@truviz/shadow/dist/Components";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import * as React from "react";
import { DATA_COLORS as DATA_COLORS_IMP } from "../constants";
import { ColorPaletteType, EDataColorsSettings, EDataRolesName, EIBCSThemes, EMarkerColorTypes, EMarkerShapeTypes } from "../enum";
import { parseObject, persistProperties } from "../methods/methods";
import { IDataColorsSettings, ILabelValuePair } from "../visual-settings.interface";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { Visual } from "../visual";
import { max, min } from "d3";

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

const handleSubCategoryChange = (rgb, i, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	setConfigValues((d) => {
		const bySubCategory = [...d.subCategoryColors];
		bySubCategory[i].marker = rgb;
		const newState = {
			...d,
			[EDataColorsSettings.SubCategoryColors]: bySubCategory,
		};
		return newState;
	});
};

const COLOR_PALETTE_TYPES = [
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

const UIColorPalette = (shadow: Visual, configValues: IDataColorsSettings, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>) => {
	let colorPaletteDropdownList = COLOR_PALETTE_TYPES;

	if (!shadow.isHasMultiMeasure && shadow.isLollipopTypeCircle) {
		colorPaletteDropdownList = [
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
				label: "By Category",
				value: ColorPaletteType.ByCategory,
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
	}

	if (!shadow.isHasMultiMeasure && shadow.isLollipopTypePie) {
		colorPaletteDropdownList = [
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
				label: "By Sub-category",
				value: ColorPaletteType.BySubCategory,
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
	}

	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Color Palette"}
						tooltip="The selected color will apply to markers only."
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
						<SelectInput
							label={"By"}
							value={configValues.gradientAppliedToMeasure}
							isFontSelector={false}
							optionsList={MARKER_TYPES}
							handleChange={(value) => setConfigValues((d) => ({
								...d,
								[EDataColorsSettings.GradientAppliedToMeasure]: value,
							}))}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={values.fillType === ColorPaletteType.Gradient}>
				<Row disableTopPadding>
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
					text: shadow.getTooltipCategoryText(categoryColor.name, false),
					fontFamily: "sans-serif",
					fontSize: 11.5 + "px",
				};
				const categoryName = textMeasurementService.getTailoredTextOrDefault(categoryNameProperties, 170);

				return (
					<Row classNames={["normal-text-overflow"]}>
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

const UIBySubCategoryColorPalette = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const values = configValues;
	return (
		<ConditionalWrapper visible={!shadow.isHasMultiMeasure && shadow.isLollipopTypePie && values.fillType === ColorPaletteType.BySubCategory}>
			{values.subCategoryColors.map((categoryColor, ci) => {
				const categoryNameProperties = {
					text: shadow.getTooltipCategoryText(categoryColor.name, false),
					fontFamily: "sans-serif",
					fontSize: 11.5 + "px",
				};
				const categoryName = textMeasurementService.getTailoredTextOrDefault(categoryNameProperties, 170);

				return (
					<Row classNames={["normal-text-overflow"]}>
						<Column>
							<ColorPicker
								label={categoryName}
								color={categoryColor.marker}
								handleChange={(value) => {
									return handleSubCategoryChange(value, ci, setConfigValues)
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
	vizOptions: any, shadow: Visual,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	return (
		<>
			<ConditionalWrapper visible={configValues.fillType === ColorPaletteType.Single}>
				<ConditionalWrapper visible={!shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<ColorPicker
								label={"Color"}
								color={configValues.singleColor1}
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
								color={configValues.singleColor1}
								handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor1, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
								tooltip={shadow.measure1DisplayName}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<ColorPicker
								label={shadow.measure2DisplayName}
								color={configValues.singleColor2}
								handleChange={(value) => handleColorChange(value, EDataColorsSettings.SingleColor2, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
								tooltip={shadow.measure2DisplayName}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper>

			{UIByCategoryColorPalette(shadow, vizOptions, configValues, setConfigValues)}
			{UIBySubCategoryColorPalette(shadow, vizOptions, configValues, setConfigValues)}
			{UIGradientColorPalette(shadow, vizOptions, configValues, setConfigValues)}

			<ConditionalWrapper
				visible={[ColorPaletteType.Diverging, ColorPaletteType.Qualitative, ColorPaletteType.Sequential].includes(
					configValues.fillType as any
				)}
			>
				<Row disableTopPadding>
					<Column>
						<ColorSchemePicker
							colorSchemePickerProps={configValues}
							keepNumberOfDataClassesOption={false}
							defaultNumberOfClasses={configValues.numberOfClasses}
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

			<ConditionalWrapper visible={configValues.fillType === ColorPaletteType.PositiveNegative}>
				<Row>
					<Column>
						<ColorPicker
							label={"Positive Color"}
							color={configValues.positiveColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.PositiveColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label={"Negative Color"}
							color={configValues.negativeColor}
							handleChange={(value) => handleColorChange(value, EDataColorsSettings.NegativeColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper >
		</>
	);
};

const UIShowRemainingAsOthers = (
	vizOptions: ShadowUpdateOptions,
	shadow: Visual,
	configValues: IDataColorsSettings,
	setConfigValues
) => {
	const rankingSettings = (shadow as Visual).rankingSettings;

	return <>
		<ConditionalWrapper visible={(rankingSettings.category.enabled && rankingSettings.category.showRemainingAsOthers)}>
			<Row>
				<Column>
					<ToggleButton
						label={"Category 'Others' color"}
						value={configValues.isCustomizeCategoryOthersColor}
						handleChange={(value) => handleChange(value, EDataColorsSettings.isCustomizeCategoryOthersColor, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.isCustomizeCategoryOthersColor}>
				<Row appearance="padded">
					<Column>
						<ColorPicker
							label={"Color"}
							color={configValues.categoryOthersColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.categoryOthersColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>

		<ConditionalWrapper visible={(rankingSettings.subCategory.enabled && rankingSettings.subCategory.showRemainingAsOthers)}>
			<Row>
				<Column>
					<ToggleButton
						label={"Sub-category 'Others' color"}
						value={configValues.isCustomizeSubcategoryOthersColor}
						handleChange={(value) => handleChange(value, EDataColorsSettings.isCustomizeSubcategoryOthersColor, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.isCustomizeSubcategoryOthersColor}>
				<Row appearance="padded">
					<Column>
						<ColorPicker
							label={"Color"}
							color={configValues.subcategoryOthersColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.subcategoryOthersColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>

		<ConditionalWrapper visible={shadow.isSmallMultiplesEnabled && rankingSettings.smallMultiples.enabled && rankingSettings.smallMultiples.showRemainingAsOthers}>
			<Row>
				<Column>
					<ToggleButton
						label={"Small multiple 'Others'"}
						value={configValues.isCustomizeSMOthersColor}
						handleChange={(value) => handleChange(value, EDataColorsSettings.IsCustomizeSMOthersColor, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.isCustomizeSMOthersColor}>
				<Row appearance="padded">
					<Column>
						<ColorPicker
							label={"Color"}
							color={configValues.SMOthersColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.SMOthersColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>
	</>
}

const UIMain = (
	vizOptions: ShadowUpdateOptions,
	shadow: Visual,
	configValues: IDataColorsSettings,
	setConfigValues,
	closeCurrentSettingHandler, applyChanges, resetChanges
) => {
	return <>
		<ConditionalWrapper visible={(shadow as Visual).markerSettings.marker1Style.markerShape === EMarkerShapeTypes.IMAGES || (shadow as Visual).markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON}>
			<Row>
				<Column>
					<Quote>
						<strong>Note: </strong>Data colors settings is not supporting "Image" marker. Please select other marker type to enable this settings.
					</Quote>
				</Column>
			</Row>
		</ConditionalWrapper>

		<ConditionalWrapper visible={(shadow as Visual).markerSettings.marker1Style.markerShape === EMarkerShapeTypes.DEFAULT || (shadow as Visual).markerSettings.marker1Style.markerShape === EMarkerShapeTypes.ICONS_LIST}>
			<Row classNames={["data-colors-settings"]} disableTopPadding>
				<Column>
					{UIColorPalette(shadow, configValues, setConfigValues)}
					{UIColorPaletteTypes(vizOptions, shadow, configValues, setConfigValues)}
					{UIShowRemainingAsOthers(vizOptions, shadow, configValues, setConfigValues)}
				</Column>
			</Row>
		</ConditionalWrapper>

		{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
	</>
}

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

const FillTypeUseEffect = (
	shadow: Visual,
	configValues: IDataColorsSettings,
	setConfigValues
) => {
	if (shadow.isSmallMultiplesEnabled) {
		const categoricalDataValues = [];
		shadow.smallMultiplesGridItemsList.forEach(d => {
			const categoricalData = d.content.categoricalData;
			categoricalDataValues.push(...categoricalData.values.filter(d => d.source.roles[EDataRolesName.Measure]));
		});

		const minVal = min(categoricalDataValues, (d: any) => min(d.values, v => v as number));
		const maxVal = max(categoricalDataValues, (d: any) => max(d.values, v => v as number));

		if (!configValues.isFillTypeChanged && minVal < 0 && maxVal > 0 && !shadow.isIBCSEnabled)
			setConfigValues((d) => ({
				...d,
				[EDataColorsSettings.FillType]: ColorPaletteType.PositiveNegative,
			}));
	} else {
		const categoricalDataValues = shadow.categoricalData.values.filter(d => d.source.roles[EDataRolesName.Measure]);
		const minVal = min(categoricalDataValues, (d: any) => min(d.values, v => v as number));
		const maxVal = max(categoricalDataValues, (d: any) => max(d.values, v => v as number));

		if (!configValues.isFillTypeChanged && minVal < 0 && maxVal > 0 && !shadow.isIBCSEnabled)
			setConfigValues((d) => ({
				...d,
				[EDataColorsSettings.FillType]: ColorPaletteType.PositiveNegative,
			}));
	}
}

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

	const applyChanges = () => {

		if (configValues.fillType !== ((shadow.chartSettings.theme === EIBCSThemes.Diverging2Horizontal || shadow.chartSettings.theme === EIBCSThemes.Diverging2Vertical) ? ColorPaletteType.PositiveNegative : ColorPaletteType.Single) ||
			configValues.singleColor1 !== "rgba(64, 64, 64, 1)" ||
			configValues.singleColor1 !== "rgba(64, 64, 64, 1)") {
			persistProperties(shadow, sectionName, propertyName, configValues);
		} else {
			shadow.persistProperties(sectionName, propertyName, configValues);
		}

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

		if ((shadow.isHasMultiMeasure || shadow.isLollipopTypeCircle) && configValues.fillType === ColorPaletteType.BySubCategory) {
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

	React.useEffect(() => {
		FillTypeUseEffect(shadow, configValues, setConfigValues);
	}, []);

	React.useEffect(() => {
		setConfigValues((d) => ({
			...d,
			[EDataColorsSettings.IsFillTypeChanged]: true,
		}));
	}, [configValues.fillType]);

	const resetChanges = () => {
		setConfigValues({ ...DATA_COLORS });
	};

	React.useEffect(() => {
		// if (configValues.fillType === ColorPaletteType.ByCategory)
		setConfigValues((d) => {
			return {
				...d,
				[EDataColorsSettings.CategoryColors]: [...shadow.categoriesColorList].filter(d => !d.name.toString().includes(shadow.othersLabel)).filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i)
			};
		});

		setConfigValues((d) => {
			return {
				...d,
				[EDataColorsSettings.SubCategoryColors]: [...shadow.subCategoriesColorList].filter(d => !d.name.toString().includes(shadow.othersLabel)).filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i),
			};
		});
	}, [configValues.fillType]);

	if (shadow.isHorizontalChart) {
		React.useEffect(() => {
			setConfigValues((d) => {
				return {
					...d,
					[EDataColorsSettings.CategoryColors]: d.categoryColors.reverse(),
				};
			});
		}, []);

		React.useEffect(() => {
			setConfigValues((d) => {
				return {
					...d,
					[EDataColorsSettings.CategoryColors]: d.categoryColors.reverse(),
				};
			});
		}, [configValues.categoryColors]);
	}

	return (
		<>
			{UIMain(vizOptions, shadow, configValues, setConfigValues, closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataColors;
