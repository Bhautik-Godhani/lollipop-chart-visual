/* eslint-disable max-lines-per-function */
import * as React from "react";
import { DATA_LABELS_SETTINGS as DATA_LABELS_SETTINGS_IMP } from "../constants";
import { DataLabelsPlacement, EDataLabelsBGApplyFor, EDataLabelsDisplayTypes, EDataLabelsMeasureTypes, EDataLabelsSettings, EVisualConfig, EVisualSettings } from "../enum";
import { EInsideTextColorTypes, IChartSettings, IDataLabelsProps, IDataLabelsSettings, ILabelValuePair } from "../visual-settings.interface";
import {
	ColorPicker,
	Column,
	ConditionalWrapper,
	Footer,
	InputControl,
	Quote,
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

const handleChange = (val, n, type: EDataLabelsMeasureTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[type]: { ...d[type], [n]: val }
	}));
};

const handleColor = (rgb, n, type: EDataLabelsMeasureTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[type]: { ...d[type], [n]: rgb }
	}));
};

const handleCheckbox = (n, type: EDataLabelsMeasureTypes, setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[type]: { ...d[type], [n]: !d[type][n] }
	}));
};

const UIDataLabelsFontFamilyAndStyle = (
	selectedMeasure: EDataLabelsMeasureTypes,
	configValues: IDataLabelsProps,
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
						handleChange={(value) => handleChange(value, EDataLabelsSettings.fontFamily, selectedMeasure, setConfigValues)}
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
						handleChange={(value) => handleChange(value, EDataLabelsSettings.fontStyle, selectedMeasure, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UIDataLabelsFontSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	selectedMeasure: EDataLabelsMeasureTypes,
	config: IDataLabelsSettings,
	configValues: IDataLabelsProps,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	const DISPLAY_TYPES: ILabelValuePair[] = [
		{
			label: "All",
			value: EDataLabelsDisplayTypes.All,
		},
		{
			label: "First & Last",
			value: EDataLabelsDisplayTypes.FirstLast,
		},
		{
			label: "Min & Max",
			value: EDataLabelsDisplayTypes.MinMax,
		},
		{
			label: "Last Only",
			value: EDataLabelsDisplayTypes.LastOnly,
		},
		{
			label: "Max Only",
			value: EDataLabelsDisplayTypes.MaxOnly,
		},
		{
			label: "First, Last, Min & Max",
			value: EDataLabelsDisplayTypes.FirstLastMinMax,
		},
		{
			label: "Custom Label (Field)",
			value: EDataLabelsDisplayTypes.CustomLabel,
		}
	];

	const CUSTOM_LABELS: ILabelValuePair[] = shadow.extraDataLabelsDisplayNames.map(label => ({
		value: label,
		label: label
	}));

	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Display Style"}
						value={configValues.displayType}
						optionsList={DISPLAY_TYPES}
						handleChange={(value) => handleChange(value, EDataLabelsSettings.DisplayType, selectedMeasure, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.displayType === EDataLabelsDisplayTypes.CustomLabel && !shadow.isHasExtraDataLabels}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>Please fill data to "Data Labels" data field to use custom label display style.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues.displayType === EDataLabelsDisplayTypes.CustomLabel}>
				<Row >
					<Column>
						<SelectInput
							label={"Custom Label"}
							value={configValues.customLabel}
							optionsList={CUSTOM_LABELS}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.CustomLabel, selectedMeasure, setConfigValues)}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isLollipopTypeCircle && config.placement === DataLabelsPlacement.Outside}>
				<Row appearance="padded">
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Font Size"
							value={configValues.fontSize}
							handleChange={(value) => handleChange(value, EDataLabelsSettings.fontSize, selectedMeasure, setConfigValues)}
						/>
					</Column>

					<Column>
						<ColorPicker
							label="Text Color"
							color={configValues.color}
							handleChange={(value) => handleColor(value, EDataLabelsSettings.color, selectedMeasure, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
						/>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isLollipopTypeCircle || shadow.isLollipopTypePie}>
				<ConditionalWrapper
					visible={config.placement === DataLabelsPlacement.Inside || shadow.isLollipopTypePie}
				>
					<Row>
						<Column>
							<ToggleButton
								label={"Auto Font Size"}
								value={configValues.isAutoFontSize}
								handleChange={(value) => handleChange(value, EDataLabelsSettings.isAutoFontSize, selectedMeasure, setConfigValues)}
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
									handleChange={(value) => handleChange(value, EDataLabelsSettings.fontSize, selectedMeasure, setConfigValues)}
								/>
							</Column>
							<Column>
								<ConditionalWrapper visible={shadow.isLollipopTypePie}>
									<ColorPicker
										label="Font Color"
										color={configValues.color}
										handleChange={(value) => handleColor(value, EDataLabelsSettings.color, selectedMeasure, setConfigValues)}
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
									handleChange={(value) => handleColor(value, EDataLabelsSettings.color, selectedMeasure, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>
			</ConditionalWrapper>

			{/* <ConditionalWrapper visible={shadow.isLollipopTypePie}>
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
			</ConditionalWrapper> */}

			{UIDataLabelsFontFamilyAndStyle(selectedMeasure, configValues, setConfigValues)}

			<ConditionalWrapper visible={config.placement === DataLabelsPlacement.Inside && shadow.isLollipopTypeCircle}>
				{UIInsideLabelsTextColorSettings(shadow, vizOptions, selectedMeasure, configValues, setConfigValues)}
			</ConditionalWrapper>
		</>
	);
};

const UICircleLollipopLabelsSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	selectedMeasure: EDataLabelsMeasureTypes,
	config: IDataLabelsSettings,
	configValues: IDataLabelsProps,
	setConfigValues: React.Dispatch<React.SetStateAction<IDataLabelsSettings>>
) => {
	return (<>
		{/* <ConditionalWrapper visible={shadow.isLollipopTypeCircle}> */}
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
						handleChange={() => handleCheckbox(EDataLabelsSettings.showLabelsBelowReferenceLine, selectedMeasure, setConfigValues)}
						appearance="checkbox"
					/>
				</Column>
			</Row>
		</ConditionalWrapper>

		<ConditionalWrapper visible={shadow.isLollipopTypePie || config.placement === DataLabelsPlacement.Outside}>
			<Row>
				<Column>
					<ToggleButton
						label={"Enable Background"}
						value={configValues.showBackground}
						handleChange={() => {
							handleCheckbox(EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
							handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
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
							handleChange={(value) => handleChange(value, EDataLabelsSettings.backgroundColor, selectedMeasure, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>
		{/* </ConditionalWrapper> */}
	</>);
};

const UIInsideLabelsTextColorSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	selectedMeasure: EDataLabelsMeasureTypes,
	insideDataLabels: IDataLabelsProps,
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
						handleChange(value, EDataLabelsSettings.textColorTypes, selectedMeasure, setConfigValues);
						handleChange(true, EDataLabelsSettings.IsTextColorTypeChanged, selectedMeasure, setConfigValues);
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
							handleColor(value, EDataLabelsSettings.color, selectedMeasure, setConfigValues);
							handleChange(true, EDataLabelsSettings.isColorChanged, selectedMeasure, setConfigValues);
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
							handleCheckbox(EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
							handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);

							if (shadow.isPatternApplied) {
								handleChange(true, EDataLabelsSettings.isShowBGChangedWhenPatternApplied, selectedMeasure, setConfigValues)
							}
						}}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={insideDataLabels.showBackground && (insideDataLabels.textColorTypes === EInsideTextColorTypes.FIXED || insideDataLabels.textColorTypes === EInsideTextColorTypes.AUTO)}>
				<ConditionalWrapper visible={shadow.isPatternApplied}>
					<Row appearance="padded">
						<Column>
							<Row disableTopPadding>
								<Column>
									<SelectInput
										label={"Apply For"}
										value={insideDataLabels.applyFor}
										optionsList={APPLY_FOR_OPTIONS}
										width={"full"}
										handleChange={(value) => handleChange(value, EDataLabelsSettings.applyFor, selectedMeasure, setConfigValues)}
									/>
								</Column>
							</Row>

							<Row>
								<Column>
									<ColorPicker
										label={"Color"}
										color={insideDataLabels.backgroundColor}
										handleChange={(value) => handleColor(value, EDataLabelsSettings.applyFor, selectedMeasure, setConfigValues)}
										colorPalette={vizOptions.host.colorPalette}
										size="sm"
									/>
								</Column>
							</Row>
						</Column>
					</Row>
				</ConditionalWrapper>

				<ConditionalWrapper visible={(!shadow.isPatternApplied)}>
					<Row appearance="padded">
						<Column>
							<ColorPicker
								label={"Color"}
								color={insideDataLabels.backgroundColor}
								handleChange={(value) => handleColor(value, EDataLabelsSettings.backgroundColor, selectedMeasure, setConfigValues)}
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

	const [selectedMeasure, setSelectedMeasure] = React.useState<EDataLabelsMeasureTypes>(EDataLabelsMeasureTypes.Measure1);

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

	const measureConfigValues = configValues[selectedMeasure];

	React.useEffect(() => {
		if (!measureConfigValues.isShowBGChangedWhenPatternApplied && shadow.isPatternApplied && !measureConfigValues.showBackground) {
			// handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
			handleChange(true, EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && !measureConfigValues.isShowBackgroundChange && measureConfigValues.textColorTypes === EInsideTextColorTypes.CONTRAST) {
			// handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
			handleChange(true, EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
		}

		if (!shadow.isPatternApplied && configValues.placement === DataLabelsPlacement.Inside && measureConfigValues.textColorTypes !== EInsideTextColorTypes.CONTRAST && !measureConfigValues.isTextColorTypeChanged) {
			handleChange(EInsideTextColorTypes.CONTRAST, EDataLabelsSettings.textColorTypes, selectedMeasure, setConfigValues);
		}

		if (shadow.isPatternApplied && configValues.placement === DataLabelsPlacement.Inside && measureConfigValues.textColorTypes === EInsideTextColorTypes.CONTRAST && !measureConfigValues.isTextColorTypeChanged) {
			handleChange(EInsideTextColorTypes.FIXED, EDataLabelsSettings.textColorTypes, selectedMeasure, setConfigValues);
		}

		if (measureConfigValues.displayType === EDataLabelsDisplayTypes.CustomLabel && shadow.isHasExtraDataLabels && (!measureConfigValues.customLabel ||
			(!shadow.extraDataLabelsDisplayNames.includes(measureConfigValues.customLabel)))) {
			handleChange(shadow.extraDataLabelsDisplayNames[0], EDataLabelsSettings.CustomLabel, selectedMeasure, setConfigValues);
		}

		if (measureConfigValues.displayType === EDataLabelsDisplayTypes.CustomLabel && !shadow.isHasExtraDataLabels) {
			handleChange(EDataLabelsDisplayTypes.All, EDataLabelsSettings.DisplayType, selectedMeasure, setConfigValues);
		}
	}, []);

	React.useEffect(() => {
		if (measureConfigValues.displayType === EDataLabelsDisplayTypes.CustomLabel && shadow.isHasExtraDataLabels && (!measureConfigValues.customLabel ||
			(!shadow.extraDataLabelsDisplayNames.includes(measureConfigValues.customLabel)))) {
			handleChange(shadow.extraDataLabelsDisplayNames[0], EDataLabelsSettings.CustomLabel, selectedMeasure, setConfigValues);
		}

		// if (measureConfigValues.displayType === EDataLabelsDisplayTypes.CustomLabel && !shadow.isHasExtraDataLabels) {
		// 	handleChange(EDataLabelsDisplayTypes.All, EDataLabelsSettings.DisplayType, selectedMeasure, setConfigValues);
		// }
	}, [measureConfigValues.displayType]);

	React.useEffect(() => {
		if (configValues.placement === DataLabelsPlacement.Inside && !measureConfigValues.isShowBackgroundChange && measureConfigValues.textColorTypes === EInsideTextColorTypes.CONTRAST) {
			// handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
			handleChange(true, EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Outside && !measureConfigValues.isShowBackgroundChange && measureConfigValues.showBackground) {
			// handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
			handleChange(false, EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && measureConfigValues.textColorTypes === EInsideTextColorTypes.FIXED) {
			if (!measureConfigValues.isColorChanged) {
				handleChange("rgba(255, 255, 255, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
			}

			if (!measureConfigValues.isShowBackgroundChange) {
				// handleChange(true, EDataLabelsSettings.IsShowBackgroundChange, selectedMeasure, setConfigValues);
				handleChange(false, EDataLabelsSettings.showBackground, selectedMeasure, setConfigValues);
			}
		}

		if (configValues.placement === DataLabelsPlacement.Inside && shadow.isLollipopTypePie && !measureConfigValues.isColorChanged) {
			handleChange("rgba(255, 255, 255, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Outside && measureConfigValues.color === "rgba(255, 255, 255, 1)" && !measureConfigValues.showBackground && !measureConfigValues.isColorChanged) {
			handleChange("rgba(93, 93, 93, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
		}
	}, [configValues.placement, measureConfigValues.textColorTypes]);

	React.useEffect(() => {
		if (configValues.placement === DataLabelsPlacement.Outside && measureConfigValues.color === "rgba(93, 93, 93, 1)" && measureConfigValues.showBackground && !measureConfigValues.isColorChanged) {
			handleChange("rgba(255, 255, 255, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Outside && measureConfigValues.color === "rgba(255, 255, 255, 1)" && !measureConfigValues.showBackground && !measureConfigValues.isColorChanged) {
			handleChange("rgba(93, 93, 93, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
		}

		if (configValues.placement === DataLabelsPlacement.Inside && measureConfigValues.color === "rgba(255, 255, 255, 1)" && !measureConfigValues.showBackground && !measureConfigValues.isColorChanged) {
			handleChange("rgba(93, 93, 93, 1)", EDataLabelsSettings.color, selectedMeasure, setConfigValues);
		}
	}, [configValues.placement, measureConfigValues.showBackground]);

	const MEASURE_TYPES: ILabelValuePair[] = [
		{
			label: shadow.measure1DisplayName,
			value: EDataLabelsMeasureTypes.Measure1,
		},
		{
			label: shadow.measure2DisplayName,
			value: EDataLabelsMeasureTypes.Measure2,
		},
	];

	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Show Data Labels"}
						value={configValues.show}
						handleChange={(val) => setConfigValues(d => ({
							...d,
							[EDataLabelsSettings.show]: val
						}))}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.show}>
				<Row>
					<Column>
						<ToggleButton
							label={"Best Fit Labels"}
							value={configValues.isShowBestFitLabels}
							handleChange={(val) => setConfigValues(d => ({
								...d,
								[EDataLabelsSettings.isShowBestFitLabels]: val
							}))}
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
							handleChange={(value) => setConfigValues(d => ({
								...d,
								[EDataLabelsSettings.placement]: value
							}))}
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<SwitchOption
								label={'Select Measure'}
								value={selectedMeasure}
								optionsList={MEASURE_TYPES}
								handleChange={(value) => setSelectedMeasure(value)}
							/>
						</Column>
					</Row>

					{UIDataLabelsFontSettings(shadow, vizOptions, selectedMeasure, configValues, measureConfigValues, setConfigValues)}
					{UICircleLollipopLabelsSettings(shadow, vizOptions, selectedMeasure, configValues, measureConfigValues, setConfigValues)}
				</ConditionalWrapper>

				<ConditionalWrapper visible={!shadow.isHasMultiMeasure}>
					{UIDataLabelsFontSettings(shadow, vizOptions, selectedMeasure, configValues, configValues.measure1, setConfigValues)}
					{UICircleLollipopLabelsSettings(shadow, vizOptions, selectedMeasure, configValues, configValues.measure1, setConfigValues)}
				</ConditionalWrapper>
			</ConditionalWrapper>

			<Footer
				cancelButtonHandler={closeCurrentSettingHandler}
				saveButtonConfig={{
					isDisabled: configValues[selectedMeasure].displayType === EDataLabelsDisplayTypes.CustomLabel && !shadow.isHasExtraDataLabels,
					text: "APPLY",
					handler: applyChanges,
				}}
				resetButtonHandler={resetChanges}
			/>

			{/* {UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)} */}
		</>
	);
};

export default DataLabelsSettings;
