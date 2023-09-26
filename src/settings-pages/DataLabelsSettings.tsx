import * as React from "react";
import { DATA_LABELS_SETTINGS } from "../constants";
import { DataLabelsFontSizeType, DataLabelsPlacement, EDataLabelsSettings, EVisualConfig, EVisualSettings, Orientation } from "../enum";
import "../../style/range-slider.less";
import { IChartSettings, IDataLabelsSettings, ILabelValuePair } from "../visual-settings.interface";
import {
	ColorPicker,
	Column,
	ConditionalWrapper,
	Footer,
	InputControl,
	Row,
	SelectInput,
	SwitchOption,
	ToggleButton,
} from "@truviz/shadow/dist/Components";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "./SettingsIcons";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { Visual } from "../visual";

const DATA_LABELS_FONT_SIZE_TYPES: ILabelValuePair[] = [
	{
		label: "Auto",
		value: DataLabelsFontSizeType.Auto,
	},
	{
		label: "Custom",
		value: DataLabelsFontSizeType.Custom,
	},
];

const LABEL_PLACEMENTS: ILabelValuePair[] = [
	{
		label: "Inside",
		value: DataLabelsPlacement.Inside,
	},
	{
		label: "Outside",
		value: DataLabelsPlacement.Outside,
	},
];

const LABEL_ORIENTATIONS: ILabelValuePair[] = [
	{
		label: "Horizontal",
		value: Orientation.Horizontal,
	},
	{
		label: "Vertical",
		value: Orientation.Vertical,
	},
];

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: rgb,
	}));
};

const handleCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: !d[n],
	}));
};

const UIDataLabelsFontFamilyAndStyle = (
	configValues: IDataLabelsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Font Family"}
						value={configValues.fontFamily}
						isFontSelector={true}
						optionsList={[]}
						handleChange={(value) => handleChange(value, EDataLabelsSettings.fontFamily, setConfigValues)}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<SwitchOption
						label="Font Style"
						value={configValues.fontStyle}
						optionsList={[
							{
								label: <BoldIcon style={{ fill: "currentColor" }} />,
								value: "bold",
							},
							{
								label: <ItalicIcon style={{ fill: "currentColor" }} />,
								value: "italic",
							},
							{
								label: <UnderlineIcon style={{ fill: "currentColor" }} />,
								value: "underline",
							},
						]}
						isMultiple
						handleChange={(value) => handleChange(value, EDataLabelsSettings.fontStyle, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UIDataLabelsFontSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	configValues: IDataLabelsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<ColorPicker
						label="Font Color"
						color={configValues.color}
						handleChange={(value) => handleColor(value, EDataLabelsSettings.color, setConfigValues)}
						colorPalette={vizOptions.host.colorPalette}
						size="sm"
					/>
				</Column>
			</Row>
			<ConditionalWrapper visible={shadow.isLollipopTypePie}>
				<Row>
					<Column>
						<ColorPicker
							label="Font Border Color"
							color={configValues.borderColor}
							handleChange={(value) => handleColor(value, EDataLabelsSettings.borderColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Font Border Size"
							value={configValues.borderWidth}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.borderWidth, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
			<ConditionalWrapper
				visible={shadow.isLollipopTypeCircle && configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Inside}
			>
				<Row>
					<Column>
						<SelectInput
							label="Font Size Type"
							value={configValues[EDataLabelsSettings.fontSizeType]}
							optionsList={DATA_LABELS_FONT_SIZE_TYPES}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.fontSizeType, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
			<ConditionalWrapper
				visible={
					shadow.isLollipopTypeCircle &&
					(configValues[EDataLabelsSettings.fontSizeType] === DataLabelsFontSizeType.Custom ||
						configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside)
				}
			>
				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Font Size"
							value={configValues.fontSize}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.fontSize, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
			<ConditionalWrapper visible={shadow.isLollipopTypePie}>
				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Max Font Size"
							value={configValues.pieDataLabelFontSize}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.pieDataLabelFontSize, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
			{UIDataLabelsFontFamilyAndStyle(configValues, setConfigValues)};
		</>
	);
};

const UICircleLollipopLabelsSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	chartSettings: IChartSettings,
	configValues: IDataLabelsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	return (
		<ConditionalWrapper visible={shadow.isLollipopTypeCircle}>
			<Row>
				<Column>
					<SelectInput
						label={"Placement"}
						value={configValues.placement}
						optionsList={LABEL_PLACEMENTS}
						handleChange={(value) => handleChange(value, EDataLabelsSettings.placement, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside}>
				<Row>
					<Column>
						<SelectInput
							label={"Orientation"}
							value={configValues.orientation}
							optionsList={LABEL_ORIENTATIONS}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.orientation, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside}>
				<Row>
					<Column>
						<ToggleButton
							label={"Show Background"}
							value={configValues.showBackground}
							handleChange={() => handleCheckbox(EDataLabelsSettings.showBackground, setConfigValues)}
							appearance="checkbox"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={configValues.showBackground}>
					<Row>
						<Column>
							<ColorPicker
								label="Background Color"
								color={configValues.backgroundColor}
								handleChange={(value) => handleChange(value, EDataLabelsSettings.backgroundColor, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper>
		</ConditionalWrapper>
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

const DataLabelsSettings = (props) => {
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
			...DATA_LABELS_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...DATA_LABELS_SETTINGS };
	}

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...DATA_LABELS_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IDataLabelsSettings>({
		...initialStates,
	});

	const chartSettings: IChartSettings = shadow.chartSettings;

	const dataLabelsSettings: IDataLabelsSettings = JSON.parse(
		vizOptions.formatTab[EVisualConfig.DataLabelsConfig][EVisualSettings.DataLabelsSettings]
	);

	// if (!vizOptions.options.dataViews[0].categorical.categories[1]) {
	// 	chartSettings.lollipopType = LollipopType.CIRCLE;
	// }

	if (
		(!Object.keys(dataLabelsSettings).length && shadow.isLollipopTypePie) ||
		(dataLabelsSettings.placement === DataLabelsPlacement.Inside && configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside)
	) {
		configValues[EDataLabelsSettings.fontSize] = 12;
		const color = configValues[EDataLabelsSettings.color];
		if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
			configValues[EDataLabelsSettings.color] = "rgb(102,102,102)";
		}
	}

	if (dataLabelsSettings.placement === DataLabelsPlacement.Outside && configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Inside) {
		const color = configValues[EDataLabelsSettings.color];
		if (color === "rgb(102,102,102)" || color === "rgba(102,102,102, 1)") {
			configValues[EDataLabelsSettings.color] = "#fff";
		}
	}

	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Show Data Labels"}
						value={configValues.show}
						handleChange={() => handleCheckbox(EDataLabelsSettings.show, setConfigValues)}
						appearance="checkbox"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.show}>
				{UIDataLabelsFontSettings(shadow, vizOptions, chartSettings, configValues, setConfigValues)}
				{UICircleLollipopLabelsSettings(shadow, vizOptions, chartSettings, configValues, setConfigValues)}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataLabelsSettings;
