import * as React from "react";
import { CHART_SETTINGS as CHART_SETTINGS_IMP } from "../constants";
import { EChartSettings, EIBCSThemes, ELineType, Orientation } from "../enum";
import { InputControl, Row, Column, ConditionalWrapper, SwitchOption, Footer, ToggleButton, ColorPicker, Accordion, Label } from "@truviz/shadow/dist/Components";
import { IChartSettings, ILabelValuePair } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { DashedLineIcon, DottedLineIcon, IBCSDefaultHIcon, IBCSDefaultVIcon, IBCSDiverging1HIcon, IBCSDiverging1VIcon, IBCSDiverging2HIcon, IBCSDiverging2VIcon, SolidLineIcon } from "./SettingsIcons";
import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";

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

const LINE_TYPES = [
	{
		label: <SolidLineIcon fill="currentColor" />,
		value: ELineType.Solid,
	},
	{
		label: <DashedLineIcon fill="currentColor" />,
		value: ELineType.Dashed,
	},
	{
		label: <DottedLineIcon fill="currentColor" />,
		value: ELineType.Dotted,
	},
];

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: rgb,
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

const UIConnectingLineSettings = (
	vizOptions: ShadowUpdateOptions,
	configValues: IChartSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return <>
		<Row>
			<Column>
				<Accordion title="Connecting Line" childTopPadding={true} childBottomPadding >
					<Row>
						<Column>
							<ToggleButton
								label={"Show Connecting Line"}
								value={configValues.showConnectingLine}
								handleChange={(value) => handleChange(value, EChartSettings.showConnectingLine, setConfigValues)}
								appearance="toggle"
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={configValues.showConnectingLine}>
						<Row>
							<Column>
								<SwitchOption
									label="Line Style"
									value={configValues.connectingLineStyle}
									optionsList={LINE_TYPES}
									handleChange={(value) => handleChange(value, EChartSettings.connectingLineStyle, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<InputControl
									min={1}
									type="number"
									label="Line Width"
									value={configValues.connectingLineWidth}
									handleChange={(value) => handleChange(value, EChartSettings.connectingLineWidth, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<ColorPicker
									label="Line Color"
									color={configValues.connectingLineColor}
									handleChange={(value) => handleColor(value, EChartSettings.connectingLineColor, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</Accordion>
			</Column>
		</Row>
	</>
}

const UIThemeSettings = (
	shadow: Visual,
	configValues: IChartSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return (
		<>
			<Accordion title="IBCS Theme" childBottomPadding>
				<Row>
					<Column>
						<ToggleButton
							label={"Enable IBCS Theme"}
							value={configValues.isIBCSEnabled}
							handleChange={(value) => handleChange(value, EChartSettings.IsIBCSEnabled, setConfigValues)}
							appearance="toggle"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={configValues.isIBCSEnabled}>
					<Row>
						<Column>
							<Label text="Default"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultVertical ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.DefaultVertical, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDefaultVIcon />
							</div>
						</Column>
						<Column>
							<Label text="Default"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultHorizontal ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.DefaultHorizontal, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDefaultHIcon />
							</div>
						</Column>
					</Row>

					<Row>
						<Column>
							<Label text="Diverging 1"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Vertical ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.Diverging1Vertical, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDiverging1VIcon />
							</div>
						</Column>
						<Column>
							<Label text="Diverging 1"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Horizontal ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.Diverging1Horizontal, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDiverging1HIcon />
							</div>
						</Column>
					</Row>

					<Row>
						<Column>
							<Label text="Diverging 2"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Vertical ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.Diverging2Vertical, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDiverging2VIcon />
							</div>
						</Column>
						<Column>
							<Label text="Diverging 2"></Label>
							<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Horizontal ? "active" : ""}`}
								onClick={
									() => handleChange(EIBCSThemes.Diverging2Horizontal, EChartSettings.Theme, setConfigValues)
								}>
								<IBCSDiverging2HIcon />
							</div>
						</Column>
					</Row>
				</ConditionalWrapper>
			</Accordion>
		</>
	);
};

const UIGeneralChartSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
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
							min={+Math.ceil(shadow.scaleBandWidth).toFixed(0)}
							type="number"
							label="Width"
							value={configValues.lollipopWidth ? configValues.lollipopWidth.toString() : undefined}
							handleChange={(value) => handleChange(+value, EChartSettings.lollipopWidth, setConfigValues)}
						/>
					</Column>
					<Column></Column>
				</Row>
			</ConditionalWrapper>

			<Row>
				<Column>
					<ToggleButton
						label={"Show Zero Base Line"}
						value={configValues.isShowZeroBaseLine}
						handleChange={(value) => handleChange(value, EChartSettings.isShowZeroBaseLine, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.isShowZeroBaseLine}>
				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Line Size"
							value={configValues.zeroBaseLineSize}
							handleChange={(value) => handleChange(value, EChartSettings.zeroBaseLineSize, setConfigValues)}
						/>
					</Column>
					<Column>
						<ColorPicker
							label="Line Color"
							color={configValues.zeroBaseLineColor}
							handleChange={(value) => handleColor(value, EChartSettings.zeroBaseLineColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
						/>
					</Column>
				</Row>
			</ConditionalWrapper >

			{UIConnectingLineSettings(vizOptions, configValues, setConfigValues)}
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
		configValues.prevTheme = shadow.chartSettings.theme;

		// if (configValues.theme) {
		// 	configValues.isIBCSEnabled = true;
		// } else {
		// 	ApplyBeforeIBCSAppliedSettingsBack(shadow);
		// }

		if (configValues.isIBCSEnabled !== shadow.chartSettings.isIBCSEnabled || configValues.theme !== shadow.chartSettings.theme) {
			shadow.persistProperties(sectionName, propertyName, configValues);
		} else {
			if (configValues.isIBCSEnabled) {
				const newConfigValues = {
					...configValues,
					[EChartSettings.IsIBCSEnabled]: false,
					[EChartSettings.Theme]: undefined,
					[EChartSettings.PrevTheme]: undefined,
				};
				ApplyBeforeIBCSAppliedSettingsBack(shadow);
				shadow.persistProperties(sectionName, propertyName, newConfigValues);
			} else {
				configValues.theme = undefined;
				configValues.prevTheme = undefined;
				shadow.persistProperties(sectionName, propertyName, configValues);
			}
		}

		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...CHART_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IChartSettings>({
		...initialStates,
	});

	const [isHasSubCategories] = React.useState(shadow.isHasSubcategories);

	React.useEffect(() => {
		if (!configValues.lollipopWidth) {
			handleChange(Math.ceil(shadow.scaleBandWidth), EChartSettings.lollipopWidth, setConfigValues)
		}
	}, []);

	React.useEffect(() => {
		if (configValues.isIBCSEnabled && configValues.theme === undefined) {
			handleChange(EIBCSThemes.DefaultVertical, EChartSettings.Theme, setConfigValues);
		}
	}, [configValues.isIBCSEnabled])


	return (
		<>
			{UIGeneralChartSettings(shadow, vizOptions, configValues, isHasSubCategories, setConfigValues)}

			{/* <ConditionalWrapper visible={shadow.isLollipopTypePie}> */}
			{/* {UIPieTypeSettings(configValues, pieConfigValues, isDumbbellChart, setPieConfigValues)} */}
			{/* </ConditionalWrapper> */}

			{UIThemeSettings(shadow, configValues, setConfigValues)}

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default ChartSettings;
