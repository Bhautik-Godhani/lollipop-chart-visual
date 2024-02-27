/* eslint-disable max-lines-per-function */
import * as React from "react";
import { DATA_LABELS_SETTINGS as DATA_LABELS_SETTINGS_IMP } from "../constants";
import { DataLabelsPlacement, EDataLabelsBGApplyFor, EDataLabelsSettings, EVisualConfig, EVisualSettings } from "../enum";
import { EInsideTextColorTypes, IChartSettings, IDataLabelsSettings, ILabelValuePair } from "../visual-settings.interface";
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
import { persistProperties } from "../methods/methods";

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

// const LABEL_ORIENTATIONS: ILabelValuePair[] = [
// 	{
// 		label: "Horizontal",
// 		value: Orientation.Horizontal,
// 	},
// 	{
// 		label: "Vertical",
// 		value: Orientation.Vertical,
// 	},
// ];

const INSIDE_TEXT_COLOR_TYPES: ILabelValuePair[] = [
	{
		value: EInsideTextColorTypes.AUTO,
		label: "Auto",
	},
	{
		value: EInsideTextColorTypes.CONTRAST,
		label: "Contrast",
	},
	{
		value: EInsideTextColorTypes.FIXED,
		label: "Fixed",
	},
];

const APPLY_FOR_OPTIONS: ILabelValuePair[] = [
	{
		value: EDataLabelsBGApplyFor.All,
		label: "All Categories",
	},
	{
		value: EDataLabelsBGApplyFor.ONLY_PATTERNS,
		label: "Categories with Pattern Only",
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
						label="Styling"
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
			<ConditionalWrapper visible={shadow.isLollipopTypeCircle && configValues.placement === DataLabelsPlacement.Outside}>
				<Row appearance="padded">
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Font Size"
							value={configValues.fontSize}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.fontSize, setConfigValues)}
						/>
					</Column>

					<Column>
						<ColorPicker
							label="Text Color"
							color={configValues.color}
							handleChange={(value) => handleColor(value, EDataLabelsSettings.color, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isLollipopTypeCircle || shadow.isLollipopTypePie}>
				<ConditionalWrapper
					visible={configValues.placement === DataLabelsPlacement.Inside || shadow.isLollipopTypePie}
				>
					<Row>
						<Column>
							<ToggleButton
								label={"Auto Font Size"}
								value={configValues.isAutoFontSize}
								handleChange={(value) => handleChange(value, EDataLabelsSettings.isAutoFontSize, setConfigValues)}
								appearance="toggle"
							/>
						</Column>
					</Row>

					<ConditionalWrapper
						visible={
							(!configValues.isAutoFontSize)
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
							<Column>
								<ConditionalWrapper visible={shadow.isLollipopTypePie}>
									<ColorPicker
										label="Font Color"
										color={configValues.color}
										handleChange={(value) => handleColor(value, EDataLabelsSettings.color, setConfigValues)}
										colorPalette={vizOptions.host.colorPalette}
									/>
								</ConditionalWrapper>
							</Column>
						</Row>
					</ConditionalWrapper>

					<ConditionalWrapper visible={shadow.isLollipopTypePie && configValues.isAutoFontSize}>
						<Row>
							<Column>
								<ColorPicker
									label="Font Color"
									color={configValues.color}
									handleChange={(value) => handleColor(value, EDataLabelsSettings.color, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isLollipopTypePie}>
				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Border Size"
							value={configValues.borderWidth}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.borderWidth, setConfigValues)}
						/>
					</Column>

					<Column>
						<ColorPicker
							label="Border Color"
							color={configValues.borderColor}
							handleChange={(value) => handleColor(value, EDataLabelsSettings.borderColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			{UIDataLabelsFontFamilyAndStyle(configValues, setConfigValues)}

			<ConditionalWrapper visible={configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Inside && shadow.isLollipopTypeCircle}>
				{UIInsideLabelsTextColorSettings(shadow, vizOptions, configValues, setConfigValues)}
			</ConditionalWrapper>
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
			{/* <ConditionalWrapper visible={configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside}>
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
			</ConditionalWrapper> */}

			<ConditionalWrapper visible={shadow.referenceLinesData.length > 0}>
				<Row>
					<Column>
						<ToggleButton
							label={"Show Labels Below Reference Line"}
							value={configValues.showLabelsBelowReferenceLine}
							handleChange={() => handleCheckbox(EDataLabelsSettings.showLabelsBelowReferenceLine, setConfigValues)}
							appearance="checkbox"
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
							handleChange={() => {
								handleCheckbox(EDataLabelsSettings.showBackground, setConfigValues);
								handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, setConfigValues);
							}}
							appearance="toggle"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={configValues.showBackground}>
					<Row appearance="padded">
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

const UIInsideLabelsTextColorSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	insideDataLabels: IDataLabelsSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	return <>
		<Row>
			<Column>
				<SwitchOption
					label="Font Color"
					value={insideDataLabels.textColorTypes}
					optionsList={INSIDE_TEXT_COLOR_TYPES}
					handleChange={(value) => {
						handleChange(value, EDataLabelsSettings.textColorTypes, setConfigValues);
						handleChange(true, EDataLabelsSettings.IsTextColorTypeChanged, setConfigValues);
					}}
				/>
			</Column>
		</Row>

		<ConditionalWrapper visible={insideDataLabels.textColorTypes === EInsideTextColorTypes.FIXED}>
			<Row>
				<Column>
					<ColorPicker
						label={"Color"}
						color={insideDataLabels.color}
						handleChange={(value) => {
							handleColor(value, EDataLabelsSettings.color, setConfigValues);
							handleChange(true, EDataLabelsSettings.isColorChanged, setConfigValues);
						}}
						colorPalette={vizOptions.host.colorPalette}
						size="sm"
					/>
				</Column>
			</Row>
		</ConditionalWrapper>

		<ConditionalWrapper visible={insideDataLabels.textColorTypes !== EInsideTextColorTypes.CONTRAST}>
			<Row>
				<Column>
					<ToggleButton
						label={"Enable Background"}
						value={insideDataLabels.showBackground}
						handleChange={() => {
							handleCheckbox(EDataLabelsSettings.showBackground, setConfigValues)

							if (shadow.isPatternApplied) {
								handleChange(true, EDataLabelsSettings.isShowBGChangedWhenPatternApplied, setConfigValues)
							}
						}}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={insideDataLabels.showBackground && (insideDataLabels.textColorTypes === EInsideTextColorTypes.FIXED || insideDataLabels.textColorTypes === EInsideTextColorTypes.AUTO)}>
				<ConditionalWrapper visible={shadow.isPatternApplied && shadow.isHasSubcategories}>
					<Row appearance="padded">
						<Column>
							<Row disableTopPadding>
								<Column>
									<SelectInput
										label={"Apply For"}
										value={insideDataLabels.applyFor}
										optionsList={APPLY_FOR_OPTIONS}
										width={"full"}
										handleChange={(value) => handleChange(value, EDataLabelsSettings.applyFor, setConfigValues)}
									/>
								</Column>
							</Row>

							<Row>
								<Column>
									<ColorPicker
										label={"Color"}
										color={insideDataLabels.backgroundColor}
										handleChange={(value) => handleColor(value, EDataLabelsSettings.applyFor, setConfigValues)}
										colorPalette={vizOptions.host.colorPalette}
										size="sm"
									/>
								</Column>
							</Row>
						</Column>
					</Row>
				</ConditionalWrapper>

				<ConditionalWrapper visible={(!shadow.isPatternApplied || !shadow.isHasSubcategories)}>
					<Row appearance="padded">
						<Column>
							<ColorPicker
								label={"Color"}
								color={insideDataLabels.backgroundColor}
								handleChange={(value) => handleColor(value, EDataLabelsSettings.backgroundColor, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper>
		</ConditionalWrapper>
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

const DataLabelsSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const DATA_LABELS_SETTINGS = JSON.parse(JSON.stringify(DATA_LABELS_SETTINGS_IMP));
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
		persistProperties(shadow, sectionName, propertyName, configValues);
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

	// if (
	// 	(!Object.keys(dataLabelsSettings).length && shadow.isLollipopTypePie) ||
	// 	(dataLabelsSettings.placement === DataLabelsPlacement.Inside && configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Outside)
	// ) {
	// 	configValues[EDataLabelsSettings.fontSize] = 12;
	// 	const color = configValues[EDataLabelsSettings.color];
	// 	if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
	// 		configValues[EDataLabelsSettings.color] = "rgb(102,102,102)";
	// 	}
	// }

	// if (dataLabelsSettings.placement === DataLabelsPlacement.Outside && configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Inside) {
	// 	const color = configValues[EDataLabelsSettings.color];
	// 	if (color === "rgb(102,102,102)" || color === "rgba(102,102,102, 1)") {
	// 		configValues[EDataLabelsSettings.color] = "#fff";
	// 	}
	// }

	React.useEffect(() => {
		if (!dataLabelsSettings.isShowBGChangedWhenPatternApplied && shadow.isPatternApplied && !configValues.showBackground) {
			handleChange(true, EDataLabelsSettings.showBackground, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && !configValues.isShowBackgroundChange && configValues.textColorTypes === EInsideTextColorTypes.CONTRAST) {
			handleChange(true, EDataLabelsSettings.showBackground, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && configValues.textColorTypes !== EInsideTextColorTypes.CONTRAST && !configValues.isTextColorTypeChanged) {
			handleChange(EInsideTextColorTypes.CONTRAST, EDataLabelsSettings.textColorTypes, setConfigValues);
		}
	}, []);

	React.useEffect(() => {
		if (configValues.placement === DataLabelsPlacement.Inside && !configValues.isShowBackgroundChange && configValues.textColorTypes === EInsideTextColorTypes.CONTRAST) {
			handleChange(true, EDataLabelsSettings.showBackground, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Outside && !configValues.isShowBackgroundChange && configValues.showBackground) {
			handleChange(false, EDataLabelsSettings.showBackground, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && configValues.textColorTypes === EInsideTextColorTypes.FIXED) {
			if (!configValues.isColorChanged) {
				handleChange("rgba(255, 255, 255, 1)", EDataLabelsSettings.color, setConfigValues);
			}

			if (!configValues.isShowBackgroundChange) {
				handleChange(false, EDataLabelsSettings.showBackground, setConfigValues);
			}
		}
	}, [configValues.placement, configValues.textColorTypes]);

	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Show Data Labels"}
						value={configValues.show}
						handleChange={() => handleCheckbox(EDataLabelsSettings.show, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.show}>
				<Row>
					<Column>
						<ToggleButton
							label={"Best Fit Labels"}
							value={configValues.isShowBestFitLabels}
							handleChange={() => handleCheckbox(EDataLabelsSettings.isShowBestFitLabels, setConfigValues)}
							appearance="checkbox"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<SwitchOption
							label={"Placement"}
							value={configValues.placement}
							optionsList={LABEL_PLACEMENTS}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.placement, setConfigValues)}
						/>
					</Column>
				</Row>

				{UIDataLabelsFontSettings(shadow, vizOptions, chartSettings, configValues, setConfigValues)}
				{UICircleLollipopLabelsSettings(shadow, vizOptions, chartSettings, configValues, setConfigValues)}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default DataLabelsSettings;
