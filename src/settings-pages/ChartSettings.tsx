import * as React from "react";
import { CHART_SETTINGS as CHART_SETTINGS_IMP } from "../constants";
import { EChartSettings, EPieSettings, LollipopWidthType, Orientation, PieSize, PieType } from "../enum";
import { InputControl, Row, Column, ConditionalWrapper, SwitchOption, Footer, SelectInput, RadioOption, ToggleButton } from "@truviz/shadow/dist/Components";
import { IChartSettings, ILabelValuePair, IPieSettings } from "../visual-settings.interface";
import { Visual } from "../visual";
import { IMarkerData, MarkerPicker } from "./markerSelector";
import { CATEGORY_MARKERS } from "./markers";

const ORIENTATIONS: ILabelValuePair[] = [
	{
		label: "VERTICAL",
		value: Orientation.Vertical,
	},
	{
		label: "HORIZONTAL",
		value: Orientation.Horizontal,
	},
];

const LOLLIPOP_DISTANCE_TYPES: ILabelValuePair[] = [
	{
		label: "Auto",
		value: LollipopWidthType.Auto,
	},
	{
		label: "Custom",
		value: LollipopWidthType.Custom,
	},
];

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handlePieChange = (val, n, pieType: PieType, setPieConfigValues: React.Dispatch<React.SetStateAction<IPieSettings>>): void => {
	setPieConfigValues((d) => ({
		...d,
		[pieType]: { ...d[pieType], [n]: val },
	}));
};

const handlePieTypeChange = (val, n, setPieConfigValues: React.Dispatch<React.SetStateAction<IPieSettings>>): void => {
	setPieConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleCheckbox = (
	key: string,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
): void => {
	setConfigValues((d: any) => ({
		...d,
		[key]: !d[key]
	}));
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

const UIGeneralChartSettings = (
	shadow: Visual,
	configValues: IChartSettings,
	isHasSubCategories: boolean,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return (
		<>
			<ConditionalWrapper visible={shadow.isHasImagesData}>
				<Row>
					<Column>
						<ToggleButton
							label={"Show Images Marker"}
							value={configValues.isShowImageMarker}
							handleChange={() => handleCheckbox(EChartSettings.IsShowImageMarker, setConfigValues)}
							appearance="checkbox"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<Row>
				<Column>
					<SwitchOption
						label={"Orientation"}
						value={configValues.orientation}
						optionsList={ORIENTATIONS}
						handleChange={(value) => handleChange(value, EChartSettings.orientation, setConfigValues)}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<SelectInput
						label={"Lollipop Width Type"}
						value={configValues.lollipopWidthType}
						optionsList={LOLLIPOP_DISTANCE_TYPES}
						handleChange={(value) => handleChange(value, EChartSettings.lollipopWidthType, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.lollipopWidthType === LollipopWidthType.Custom}>
				<Row>
					<Column>
						<InputControl
							min={shadow.minScaleBandWidth}
							type="number"
							label="Lollipop Width"
							value={configValues.lollipopWidth ? configValues.lollipopWidth.toString() : undefined}
							handleChange={(value) => handleChange(+value, EChartSettings.lollipopWidth, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

const UIPieTypeSettings = (
	configValues: IChartSettings,
	pieConfigValues: IPieSettings,
	isDumbbellChart: boolean,
	setPieConfigValues: React.Dispatch<React.SetStateAction<IPieSettings>>
) => {
	// const pieType = pieConfigValues.pieType;
	// const PIE_TYPES: ILabelValuePair[] = [
	// 	{
	// 		label: `${configValues[EChartSettings.lollipopType]} 1`,
	// 		value: PieType.Pie1,
	// 	},
	// 	{
	// 		label: `${configValues[EChartSettings.lollipopType]} 2`,
	// 		value: PieType.Pie2,
	// 	},
	// ];

	return (
		<>
			{/* <ConditionalWrapper visible={isDumbbellChart}>
				<Row>
					<Column>
						<RadioOption
							label={`Select ${configValues[EChartSettings.lollipopType]}`}
							value={pieConfigValues[EPieSettings.pieType]}
							optionsList={PIE_TYPES}
							handleChange={(value) => handlePieTypeChange(value, EPieSettings.pieType, setPieConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<SelectInput
							label={`${configValues[EChartSettings.lollipopType]} Size`}
							value={pieConfigValues[pieConfigValues.pieType].pieSize}
							optionsList={LOLLIPOP_DISTANCE_TYPES}
							handleChange={(value) => handlePieChange(value, EPieSettings.pieSize, pieType, setPieConfigValues)}
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={pieConfigValues[pieConfigValues.pieType].pieSize === PieSize.Auto}>
					<Row>
						<Column>
							<InputControl
								min={0}
								type="number"
								label={`Max ${configValues[EChartSettings.lollipopType]} Radius`}
								value={pieConfigValues[pieConfigValues.pieType].maxPieRadius.toString()}
								handleChange={(value) => handlePieChange(value, EPieSettings.maxPieRadius, pieType, setPieConfigValues)}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				<ConditionalWrapper visible={pieConfigValues[pieConfigValues.pieType].pieSize === PieSize.Custom}>
					<Row>
						<Column>
							<InputControl
								min={0}
								type="number"
								label={`${configValues[EChartSettings.lollipopType]} Radius`}
								value={pieConfigValues[pieConfigValues.pieType].pieRadius.toString()}
								handleChange={(value) => handlePieChange(value, EPieSettings.pieRadius, pieType, setPieConfigValues)}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper> */}
		</>
	);
};

const ChartSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const CHART_SETTINGS = JSON.parse(JSON.stringify(CHART_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...CHART_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...CHART_SETTINGS };
	}

	const applyChanges = () => {
		const configProps = {
			...configValues,
			[EChartSettings.pieSettings]: pieConfigValues,
		};
		shadow.persistProperties(sectionName, propertyName, configProps);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...CHART_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IChartSettings>({
		...initialStates,
	});

	const [pieConfigValues, setPieConfigValues] = React.useState<IPieSettings>({
		...initialStates[EChartSettings.pieSettings],
	});

	const [isHasSubCategories] = React.useState(shadow.isHasSubcategories);

	const isDumbbellChart = !!vizOptions.options.dataViews[0].categorical.values[1];

	return (
		<>
			{UIGeneralChartSettings(shadow, configValues, isHasSubCategories, setConfigValues)}

			<ConditionalWrapper visible={shadow.isLollipopTypePie}>
				{/* {UIPieTypeSettings(configValues, pieConfigValues, isDumbbellChart, setPieConfigValues)} */}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default ChartSettings;
