import * as React from "react";
import { RANKING_SETTINGS } from "../constants";
import { ERankingSettings, LollipopType, RankingDataValuesType, RankingFilterType } from "../enum";
import { IChartSettings, ILabelValuePair, IRankingSettings, ISubCategoriesRankingProps } from "../visual-settings.interface";
import { ColorPicker, Column, ConditionalWrapper, Footer, InputControl, RadioOption, Row, ToggleButton } from "@truviz/shadow/dist/Components";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const VALUE_TYPES: ILabelValuePair[] = [
	{
		label: "Value 1",
		value: RankingDataValuesType.Value1,
	},
	{
		label: "Value 2",
		value: RankingDataValuesType.Value2,
	},
];

const FILTER_TYPES: ILabelValuePair[] = [
	{
		label: "Top N",
		value: RankingFilterType.TopN,
	},
	{
		label: "Bottom N",
		value: RankingFilterType.BottomN,
	},
	{
		label: "None",
		value: RankingFilterType.None,
	},
];

const handleChange = (val, n, valueType: RankingDataValuesType, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[valueType]: { ...d[valueType], [n]: val },
	}));
};

const handleSubCategoriesChange = (val, n, setSubCategoriesConfigValues: React.Dispatch<React.SetStateAction<ISubCategoriesRankingProps>>) => {
	setSubCategoriesConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleRadioButtonChange = (key: string, value: string, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: value,
	}));
};

const handleCheckbox = (n, valueType: RankingDataValuesType, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[valueType]: { ...d[valueType], [n]: !d[valueType][n] },
	}));
};

const handleSubCategoriesCheckbox = (n, setSubCategoriesConfigValues: React.Dispatch<React.SetStateAction<ISubCategoriesRankingProps>>) => {
	setSubCategoriesConfigValues((d) => ({
		...d,
		[n]: !d[n],
	}));
};

const handleColorChange = (rgb, n, valueType: RankingDataValuesType, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d: any) => ({
		...d,
		[valueType]: { ...d[valueType], [n]: rgb },
	}));
};

const handleSubCategoriesColorChange = (rgb, n, setSubCategoriesConfigValues: React.Dispatch<React.SetStateAction<ISubCategoriesRankingProps>>) => {
	setSubCategoriesConfigValues((d: any) => ({
		...d,
		[n]: rgb,
	}));
};

const UICategoryRankingSettings = (
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	valueType: RankingDataValuesType,
	configValues: IRankingSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<InputControl
						min={1}
						type="number"
						label="Count"
						value={configValues[valueType].count}
						handleChange={(value) => handleChange(value, ERankingSettings.count, valueType, setConfigValues)}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<ToggleButton
						label={"Show remaining as Others"}
						value={configValues[valueType].showRemainingAsOthers}
						handleChange={() => handleCheckbox(ERankingSettings.showRemainingAsOthers, valueType, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[valueType].showRemainingAsOthers}>
				<ConditionalWrapper visible={chartSettings.lollipopType === LollipopType.Circle}>
					<Row>
						<Column>
							<ColorPicker
								label="Circle Color"
								color={configValues[valueType].circleFillColor}
								handleChange={(value) => handleColorChange(value, ERankingSettings.circleFillColor, valueType, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<ColorPicker
								label="Circle Border Color"
								color={configValues[valueType].circleStrokeColor}
								handleChange={(value) => handleColorChange(value, ERankingSettings.circleStrokeColor, valueType, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				<ConditionalWrapper visible={chartSettings.lollipopType !== LollipopType.Circle}>
					<Row>
						<Column>
							<ColorPicker
								label={`${chartSettings.lollipopType} Slice Color`}
								color={configValues[valueType].pieSliceColor}
								handleChange={(value) => handleColorChange(value, ERankingSettings.pieSliceColor, valueType, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				<Row>
					<Column>
						<ColorPicker
							label="Line Color"
							color={configValues[valueType].lineColor}
							handleChange={(value) => handleColorChange(value, ERankingSettings.lineColor, valueType, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UISubCategoryRankingSettings = (
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	valueType: RankingDataValuesType,
	configValues: IRankingSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>,
	setSubCategoriesConfigValues: React.Dispatch<React.SetStateAction<ISubCategoriesRankingProps>>
) => {
	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Sub Category Ranking"}
						value={configValues[valueType].isSubcategoriesRanking}
						handleChange={() => handleCheckbox(ERankingSettings.isSubcategoriesRanking, valueType, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[valueType].isSubcategoriesRanking}>
				<Row>
					<Column>
						<RadioOption
							label="Filter Type"
							value={configValues[valueType][ERankingSettings.subCategoriesRanking].filterType}
							optionsList={FILTER_TYPES}
							handleChange={(value) => handleSubCategoriesChange(value, ERankingSettings.filterType, setSubCategoriesConfigValues)}
						/>
					</Column>
				</Row>

				<ConditionalWrapper
					visible={configValues[valueType][ERankingSettings.subCategoriesRanking][ERankingSettings.filterType] !== RankingFilterType.None}
				>
					<Row>
						<Column>
							<InputControl
								min={1}
								type="number"
								label="Count"
								value={configValues[valueType].subCategoriesRanking.count}
								handleChange={(value) => handleSubCategoriesChange(value, ERankingSettings.count, setSubCategoriesConfigValues)}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<ToggleButton
								label={"Show remaining as Others"}
								value={configValues[valueType].subCategoriesRanking.showRemainingAsOthers}
								handleChange={() => handleSubCategoriesCheckbox(ERankingSettings.showRemainingAsOthers, setSubCategoriesConfigValues)}
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={configValues[valueType].subCategoriesRanking.showRemainingAsOthers}>
						<Row>
							<Column>
								<ColorPicker
									label={`${chartSettings.lollipopType} Slice Color`}
									color={configValues[valueType].subCategoriesRanking.pieSliceColor}
									handleChange={(value) => handleSubCategoriesColorChange(value, ERankingSettings.pieSliceColor, setSubCategoriesConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>
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

const RankingSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...RANKING_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...RANKING_SETTINGS };
	}

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...RANKING_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IRankingSettings>({
		...initialStates,
	});

	let valueType = configValues[ERankingSettings.valueType];

	const [subCategoriesConfigValues, setSubCategoriesConfigValues] = React.useState<ISubCategoriesRankingProps>(
		configValues[valueType][ERankingSettings.subCategoriesRanking]
	);

	React.useEffect(() => {
		setConfigValues((d) => ({
			...d,
			[valueType]: {
				...d[valueType],
				[ERankingSettings.subCategoriesRanking]: subCategoriesConfigValues,
			},
		}));
	}, [subCategoriesConfigValues]);

	const isDumbbellChart = !!vizOptions.options.dataViews[0].categorical.values[1];

	if (!isDumbbellChart) {
		valueType = RankingDataValuesType.Value1;
	}

	// const categorical = vizOptions.options.dataViews[0].categorical;
	// const value1DisplayName = categorical.values[0] ? categorical.values[0].source.displayName : "";
	// const value2DisplayName = categorical.values[1] ? categorical.values[1].source.displayName : "";

	const chartSettings: IChartSettings = shadow.chartSettings;

	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Enable Ranking"}
						value={configValues[ERankingSettings.isRankingEnabled]}
						handleChange={() =>
							setConfigValues((d) => ({
								...d,
								[ERankingSettings.isRankingEnabled]: !d[ERankingSettings.isRankingEnabled],
							}))
						}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.isRankingEnabled}>
				<ConditionalWrapper visible={isDumbbellChart}>
					<Row>
						<Column>
							<RadioOption
								label="Select Category"
								value={configValues.valueType}
								optionsList={VALUE_TYPES}
								handleChange={(value) => handleRadioButtonChange(ERankingSettings.valueType, value, setConfigValues)}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				<Row>
					<Column>
						<RadioOption
							label="Filter Type"
							value={configValues[valueType].filterType}
							optionsList={FILTER_TYPES}
							handleChange={(value) => handleChange(value, ERankingSettings.filterType, valueType, setConfigValues)}
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={configValues[valueType].filterType !== RankingFilterType.None}>
					{UICategoryRankingSettings(vizOptions, chartSettings, valueType, configValues, setConfigValues)}
				</ConditionalWrapper>
				<ConditionalWrapper visible={chartSettings.lollipopType !== LollipopType.Circle}>
					{UISubCategoryRankingSettings(vizOptions, chartSettings, valueType, configValues, setConfigValues, setSubCategoriesConfigValues)}
				</ConditionalWrapper>
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default RankingSettings;
