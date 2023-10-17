import * as React from "react";
import { CHART_SETTINGS as CHART_SETTINGS_IMP } from "../constants";
import { EAutoCustomTypes, EChartSettings, EPieSettings, Orientation, PieSize, PieType } from "../enum";
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
					<ToggleButton
						label={"Auto Lollipop Width"}
						value={configValues.isAutoLollipopWidth}
						handleChange={(value) => handleChange(value, EChartSettings.isAutoLollipopWidth, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={!configValues.isAutoLollipopWidth}>
				<Row appearance="padded">
					<Column>
						<InputControl
							min={shadow.scaleBandWidth}
							type="number"
							label="Width"
							value={configValues.lollipopWidth ? configValues.lollipopWidth.toString() : undefined}
							handleChange={(value) => handleChange(+value, EChartSettings.lollipopWidth, setConfigValues)}
						/>
					</Column>
					<Column></Column>
				</Row>
			</ConditionalWrapper>
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

	React.useEffect(() => {
		if (!configValues.lollipopWidth) {
			handleChange(Math.ceil(shadow.scaleBandWidth), EChartSettings.lollipopWidth, setConfigValues)
		}
	}, []);

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
