import * as React from "react";
import {DATA_COLORS} from "../constants";
import {CircleType, ColorPaletteType, EDataRolesName, EChartSettings, EDataColorsSettings, LollipopType, PieType} from "../enum";
import {IChartSettings, IDataColorsSettings, ILabelValuePair} from "../visual-settings.interface";
import {ColorPicker, Column, ConditionalWrapper, Footer, GradientPicker, RadioOption, Row, SelectInput} from "@truviz/shadow/dist/Components";
import {ShadowUpdateOptions} from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const CIRCLE_TYPES: ILabelValuePair[] = [
	{
		label: "Circle 1",
		value: CircleType.Circle1,
	},
	{
		label: "Circle 2",
		value: CircleType.Circle2,
	},
];

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
];

const getCategoricalValuesIndexByKey = (vizOptions: ShadowUpdateOptions, key: string): number => {
	return vizOptions.options.dataViews[0].categorical.values.findIndex((data) => data.source.roles[key] === true);
};

const handleChange = (
	rgb: string,
	n: string,
	dataType: CircleType | PieType,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
): void => {
	setConfigValues((d: any) => ({
		...d,
		[dataType]: {...d[dataType], [n]: rgb},
	}));
};

const handleByCategoryChange = (
	rgb: string,
	index: number,
	dataType: CircleType | PieType,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
): void => {
	const updatedColors = [...configValues[dataType].byCategoryColors];
	updatedColors[index].color = rgb;
	setConfigValues((d: any) => ({
		...d,
		[dataType]: {...d[dataType], byCategoryColors: updatedColors},
	}));
};

const handleCheckbox = (
	key: string,
	dataType: CircleType | PieType,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
): void => {
	setConfigValues((d: any) => ({
		...d,
		[dataType]: {...d[dataType], [key]: !d[dataType][key]},
	}));
};

const handleRadioButtonChange = (key: string, value: string, setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[key]: value,
	}));
};

const UIByCategoryColorSettings = (
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const dataType = configValues.dataType;
	const subCategories = vizOptions.options.dataViews[0].categorical.categories[1].values.map((value) => value.toString());
	subCategories.sort((a, b) => a.localeCompare(b));

	const SUBCATEGORIES_LIST: ILabelValuePair[] = subCategories.map((category) => {
		return {label: category, value: category};
	});

	return (
		<>
			<ConditionalWrapper
				visible={configValues[dataType].fillType === ColorPaletteType.ByCategory && chartSettings.lollipopType !== LollipopType.Circle}
			>
				<Row>
					<Column>
						<ColorPicker
							label="Categories Default Color"
							color={configValues[dataType].defaultColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.defaultColor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<SelectInput
							label="Select Category"
							value={configValues[dataType].selectedCategoryName ? configValues[dataType].selectedCategoryName : subCategories[0]}
							optionsList={SUBCATEGORIES_LIST}
							handleChange={(value) => handleChange(value, EDataColorsSettings.selectedCategoryName, dataType, setConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Category Color"
							color={configValues[dataType].selectedCategoryColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.selectedCategoryColor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UIDataColorsSettings1 = (
	isDumbbellChart: boolean,
	dataType: CircleType | PieType,
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	const PIE_TYPES: ILabelValuePair[] = [
		{
			label: `${chartSettings[EChartSettings.lollipopType]} 1`,
			value: CircleType.Circle1,
		},
		{
			label: `${chartSettings[EChartSettings.lollipopType]} 2`,
			value: CircleType.Circle2,
		},
	];

	return (
		<>
			<ConditionalWrapper visible={isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle}>
				<Row>
					<Column>
						<RadioOption
							label={`Select ${chartSettings.lollipopType}`}
							value={configValues.dataType}
							optionsList={CIRCLE_TYPES}
							handleChange={(value) => handleRadioButtonChange(EDataColorsSettings.dataType, value, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={isDumbbellChart && chartSettings.lollipopType !== LollipopType.Circle}>
				<Row>
					<Column>
						<RadioOption
							label={`Select ${chartSettings.lollipopType}`}
							value={configValues.dataType}
							optionsList={PIE_TYPES}
							handleChange={(value) => handleRadioButtonChange(EDataColorsSettings.dataType, value, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={!(isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle)}>
				<Row>
					<Column>
						<SelectInput
							label="Color Palette"
							value={
								isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle ? ColorPaletteType.Single : configValues[dataType].fillType
							}
							optionsList={COLOR_PALETTE_TYPES}
							handleChange={(value) => handleChange(value, EDataColorsSettings.fillType, dataType, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues[dataType].fillType === ColorPaletteType.Single && chartSettings.lollipopType === LollipopType.Circle}>
				<Row>
					<Column>
						<ColorPicker
							label="Circle Color"
							color={configValues[dataType].circleFillColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.circleFillColor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Circle Border Color"
							color={configValues[dataType].circleStrokeColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.circleStrokeColor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues[dataType].fillType === ColorPaletteType.Single && chartSettings.lollipopType !== LollipopType.Circle}>
				<Row>
					<Column>
						<ColorPicker
							label="Pie Slice Color"
							color={configValues[dataType].singleColor}
							handleChange={(value) => handleChange(value, EDataColorsSettings.singleColor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UIDataColorsSettings2 = (
	dataType: CircleType | PieType,
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	configValues: IDataColorsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataColorsSettings>>
) => {
	return (
		<>
			<ConditionalWrapper visible={configValues[dataType].fillType === "byCategory"}>
				{configValues[dataType].byCategoryColors.map((category, index) => {
					<Row>
						<Column>
							<ColorPicker
								label={category.name}
								color={category.color}
								handleChange={(value) => handleByCategoryChange(value, index, dataType, configValues, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>;
				})}
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues[dataType].fillType === "gradient"}>
				<Row>
					<Column>
						<GradientPicker
							minColor={configValues[dataType].fillmin}
							midColor={configValues[dataType].fillmid}
							maxColor={configValues[dataType].fillmax}
							handleMinColorChange={(value) => handleChange(value, EDataColorsSettings.fillmin, dataType, setConfigValues)}
							handleMidColorChange={(value) => handleChange(value, EDataColorsSettings.fillmid, dataType, setConfigValues)}
							handleMaxColorChange={(value) => handleChange(value, EDataColorsSettings.fillmax, dataType, setConfigValues)}
							enableMidColor={configValues[dataType].midcolor}
							toggleEnableMidColor={() => handleCheckbox(EDataColorsSettings.midcolor, dataType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							label=""
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			{UIByCategoryColorSettings(vizOptions, chartSettings, configValues, setConfigValues)}

			{/* <ConditionalWrapper visible={configValues[dataType].fillType != "qualitative"}>
				<Row>
					<Column>
						<ColorSchemePicker state={configValues} setState={setConfigValues} />
					</Column>
				</Row>
			</ConditionalWrapper> */}
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

const DataColorsSettings = (props) => {
	const {
		shadow,
		compConfig: {sectionName, propertyName},
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...DATA_COLORS,
			...initialStates,
		};
	} catch (e) {
		initialStates = {...DATA_COLORS};
	}

	const [configValues, setConfigValues] = React.useState<IDataColorsSettings>({
		...initialStates,
	});

	const applyChanges = () => {
		// if (!configValues[dataType][EDataColorsSettings.selectedCategoryName]) {
		// 	configValues[dataType][EDataColorsSettings.selectedCategoryName] = subCategories[0];
		// }
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({...DATA_COLORS});
	};

	const chartSettings: IChartSettings = shadow.chartSettings;
	if (chartSettings.lollipopType !== LollipopType.Circle) {
		COLOR_PALETTE_TYPES.push({
			label: "By Category",
			value: ColorPaletteType.ByCategory,
		});
	}

	const isDumbbellChart = getCategoricalValuesIndexByKey(vizOptions, EDataRolesName.Measure2) !== -1;
	const dataType = configValues[EDataColorsSettings.dataType];

	React.useEffect(() => {
		if (isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle) {
			setConfigValues((d: IDataColorsSettings) => ({
				...d,
				[dataType]: {...d[dataType], fillType: ColorPaletteType.Single},
			}));
			configValues[configValues[EDataColorsSettings.dataType]].fillType = ColorPaletteType.Single;
		}

		if (!isDumbbellChart) {
			if (configValues[EDataColorsSettings.dataType] === CircleType.Circle2) {
				setConfigValues((d: IDataColorsSettings) => ({
					...d,
					[EDataColorsSettings.dataType]: CircleType.Circle1,
				}));
				configValues[EDataColorsSettings.dataType] = CircleType.Circle1;
			}

			if (configValues[EDataColorsSettings.dataType] === PieType.Pie2) {
				setConfigValues((d: IDataColorsSettings) => ({
					...d,
					[EDataColorsSettings.dataType]: PieType.Pie1,
				}));
			}
		}

		if (
			chartSettings.lollipopType === LollipopType.Pie &&
			(configValues[EDataColorsSettings.dataType] === CircleType.Circle1 || configValues[EDataColorsSettings.dataType] === CircleType.Circle2)
		) {
			setConfigValues((d: IDataColorsSettings) => ({
				...d,
				[EDataColorsSettings.dataType]: PieType.Pie1,
			}));
		}

		if (
			chartSettings.lollipopType === LollipopType.Circle &&
			(configValues[EDataColorsSettings.dataType] === PieType.Pie1 || configValues[EDataColorsSettings.dataType] === PieType.Pie2)
		) {
			setConfigValues((d: IDataColorsSettings) => ({
				...d,
				[EDataColorsSettings.dataType]: CircleType.Circle1,
			}));
		}
	}, []);

	return (
		<>
			{UIDataColorsSettings1(isDumbbellChart, dataType, vizOptions, chartSettings, configValues, setConfigValues)}
			{UIDataColorsSettings2(dataType, vizOptions, chartSettings, configValues, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataColorsSettings;
