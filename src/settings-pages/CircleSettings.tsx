import * as React from "react";
import { CIRCLE_SETTINGS } from "../constants";
import { CircleFillOption, CircleSize, CircleType, ECircleSettings } from "../enum";
import { ICircleSettings, ILabelValuePair } from "../visual-settings.interface";
import { Column, ConditionalWrapper, Footer, InputControl, Row, SelectInput, ToggleButton } from "@truviz/shadow/dist/Components";

const CIRCLE_TYPES: ILabelValuePair[] = [
	{
		label: "Circle1",
		value: CircleType.Circle1,
	},
	{
		label: "Circle2",
		value: CircleType.Circle2,
	},
];

const CIRCLE_FILL_OPTIONS: ILabelValuePair[] = [
	{
		label: "Yes",
		value: CircleFillOption.Yes,
	},
	{
		label: "No",
		value: CircleFillOption.No,
	},
];

const CIRCLE_SIZE_OPTIONS: ILabelValuePair[] = [
	{
		label: "Auto",
		value: CircleSize.Auto,
	},
	{
		label: "Custom",
		value: CircleSize.Custom,
	},
];

const handleChange = (val, n, circleType: CircleType, setConfigValues: React.Dispatch<React.SetStateAction<ICircleSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[circleType]: { ...d[circleType], [n]: val },
	}));
};

const handleCircleTypeChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ICircleSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleCheckbox = (n, circleType: CircleType, setConfigValues: React.Dispatch<React.SetStateAction<ICircleSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[circleType]: { ...d[circleType], [n]: !d[circleType][n] },
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

const CircleSettings = (props) => {
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
			...CIRCLE_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...CIRCLE_SETTINGS };
	}

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...CIRCLE_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<ICircleSettings>({
		...initialStates,
	});

	const circleType = configValues.circleType;

	return (
		<>
			<ConditionalWrapper visible={!!vizOptions.options.dataViews[0].categorical.values[1]}>
				<Row>
					<Column>
						<SelectInput
							label={"Circle Type"}
							value={configValues.circleType}
							optionsList={CIRCLE_TYPES}
							handleChange={(value) => handleCircleTypeChange(value, ECircleSettings.circleType, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<Row>
				<Column>
					<ToggleButton
						label={"Display Circle"}
						value={configValues[configValues.circleType].show}
						handleChange={() => handleCheckbox(ECircleSettings.show, circleType, setConfigValues)}
						appearance="checkbox"
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<SelectInput
						label={"Fill the circle"}
						value={configValues[configValues.circleType].isCircleFilled}
						optionsList={CIRCLE_FILL_OPTIONS}
						handleChange={(value) => handleChange(value, ECircleSettings.isCircleFilled, circleType, setConfigValues)}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<SelectInput
						label={"Circle Size"}
						value={configValues[configValues.circleType].circleSize}
						optionsList={CIRCLE_SIZE_OPTIONS}
						handleChange={(value) => handleChange(value, ECircleSettings.circleSize, circleType, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[configValues.circleType].circleSize === CircleSize.Custom}>
				<Row>
					<Column>
						<InputControl
							min={0}
							type="number"
							label="Size Value"
							value={configValues[configValues.circleType].circleRadius}
							handleChange={(value) => handleChange(value, ECircleSettings.circleRadius, circleType, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<Row>
				<Column>
					<InputControl
						min={0}
						type="number"
						label="Border Width"
						value={configValues[configValues.circleType].strokeWidth}
						handleChange={(value) => handleChange(value, ECircleSettings.strokeWidth, circleType, setConfigValues)}
					/>
				</Column>
			</Row>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default CircleSettings;
