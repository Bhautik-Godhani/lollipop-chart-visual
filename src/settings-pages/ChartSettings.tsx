/* eslint-disable max-lines-per-function */
import * as React from "react";
import { CHART_SETTINGS as CHART_SETTINGS_IMP } from "../constants";
import { EChartSettings, EIBCSThemes, ELineType, Orientation } from "../enum";
import { InputControl, Row, Column, ConditionalWrapper, SwitchOption, Footer, ToggleButton, ColorPicker, Accordion, Label, ImageOption } from "@truviz/shadow/dist/Components";
import { IChartSettings } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { DashedLineIcon, DottedLineIcon, IBCSDefaultHIcon, IBCSDefaultVIcon, IBCSDiverging1HIcon, IBCSDiverging1VIcon, IBCSDiverging2HIcon, IBCSDiverging2VIcon, SolidLineIcon } from "./SettingsIcons";
import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";
import VerticalOrientationIcon from "../../assets/icons/Vertical-orientation.svg";
import HorizontalOrientationIcon from "../../assets/icons/horizontal-orientation.svg";

const ORIENTATIONS = [
	{
		image: VerticalOrientationIcon,
		value: Orientation.Vertical,
		key: "VERTICAL",
		label: "Vertical"
	},
	{
		image: HorizontalOrientationIcon,
		value: Orientation.Horizontal,
		key: "HORIZONTAL",
		label: "Horizontal"
	}
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
		isResetInIBCSPressed: false
	}));
};

const handleColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: rgb,
		isResetInIBCSPressed: false
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
				<Accordion title="Connecting Line"
					open={configValues.showConnectingLine}
					isShowToggle={true}
					showToggleValue={configValues.showConnectingLine}
					onShowToggleChange={(value) => handleChange(value, EChartSettings.showConnectingLine, setConfigValues)}
					negativeMargins={false}
					childTopPadding={false}
					childBottomPadding={true}>
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
								label="Width"
								value={configValues.connectingLineWidth}
								handleChange={(value) => handleChange(value, EChartSettings.connectingLineWidth, setConfigValues)}
							/>
						</Column>

						<Column>
							<ColorPicker
								label="Color"
								color={configValues.connectingLineColor}
								handleChange={(value) => handleColor(value, EChartSettings.connectingLineColor, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
							/>
						</Column>
					</Row>
				</Accordion>
			</Column>
		</Row>
	</>
}

const UIZeroBaseLineSettings = (
	vizOptions: ShadowUpdateOptions,
	configValues: IChartSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return <>
		<Row>
			<Column>
				<Accordion title="Zero Base Line"
					open={configValues.isShowZeroBaseLine}
					isShowToggle={true}
					showToggleValue={configValues.isShowZeroBaseLine}
					onShowToggleChange={(value) => handleChange(value, EChartSettings.isShowZeroBaseLine, setConfigValues)}
					negativeMargins={false}
					childTopPadding={false}
					childBottomPadding={true}>
					<Row>
						<Column>
							<InputControl
								min={1}
								type="number"
								label="Width"
								value={configValues.zeroBaseLineSize}
								handleChange={(value) => handleChange(value, EChartSettings.zeroBaseLineSize, setConfigValues)}
							/>
						</Column>

						<Column>
							<ColorPicker
								label="Color"
								color={configValues.zeroBaseLineColor}
								handleChange={(value) => handleColor(value, EChartSettings.zeroBaseLineColor, setConfigValues)}
								colorPalette={vizOptions.host.colorPalette}
							/>
						</Column>
					</Row>
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
			<Row>
				<Column>
					<Accordion title="IBCS Theme"
						open={configValues.isIBCSEnabled}
						isShowToggle={true}
						showToggleValue={configValues.isIBCSEnabled}
						onShowToggleChange={(value) => handleChange(value, EChartSettings.IsIBCSEnabled, setConfigValues)}
						negativeMargins={false}
						childTopPadding={false}
						childBottomPadding={true}>
						<Row>
							<Column>
								<Label text="Chart Type" classNames={["label-10px"]}></Label>
							</Column>
						</Row>

						<Row disableTopPadding={true}>
							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultVertical ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.DefaultVertical, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDefaultVIcon />
								</div>
								<Label text="IBCS 1" classNames={["label-8px"]}></Label>
							</Column>

							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Vertical ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.Diverging1Vertical, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDiverging1VIcon />
								</div>
								<Label text="IBCS 3" classNames={["label-8px"]}></Label>
							</Column>

							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Vertical ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.Diverging2Vertical, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDiverging2VIcon />
								</div>
								<Label text="IBCS 5" classNames={["label-8px"]}></Label>
							</Column>
						</Row>

						<Row>
							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultHorizontal ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.DefaultHorizontal, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDefaultHIcon />
								</div>
								<Label text="IBCS 2" classNames={["label-8px"]}></Label>
							</Column>

							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Horizontal ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.Diverging1Horizontal, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDiverging1HIcon />
								</div>
								<Label text="IBCS 4" classNames={["label-8px"]}></Label>
							</Column>

							<Column>
								<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Horizontal ? "active" : ""}`}
									onClick={
										() => handleChange(EIBCSThemes.Diverging2Horizontal, EChartSettings.Theme, setConfigValues)
									}>
									<IBCSDiverging2HIcon />
								</div>
								<Label text="IBCS 6" classNames={["label-8px"]}></Label>
							</Column>
						</Row>
					</Accordion>
				</Column>
			</Row>
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
					<Accordion title="Lollipop" open={true} negativeMargins={false} childTopPadding={false} childBottomPadding={true}>
						<Row disableTopPadding={true}>
							<Column>
								<ImageOption
									isShowImageTooltip={true}
									value={configValues.orientation}
									images={ORIENTATIONS}
									handleChange={(value) => handleChange(value, EChartSettings.orientation, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<ToggleButton
									label={"Auto Category Width"}
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
										label="Min Width"
										value={configValues.lollipopWidth ? configValues.lollipopWidth.toString() : undefined}
										handleChange={(value) => handleChange(+value, EChartSettings.lollipopWidth, setConfigValues)}
									/>
								</Column>
								<Column></Column>
							</Row>
						</ConditionalWrapper>
					</Accordion>
				</Column>
			</Row>

			{UIConnectingLineSettings(vizOptions, configValues, setConfigValues)}
			{UIZeroBaseLineSettings(vizOptions, configValues, setConfigValues)}
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

		if (!configValues.isResetInIBCSPressed && (configValues.isIBCSEnabled !== shadow.chartSettings.isIBCSEnabled || configValues.theme !== shadow.chartSettings.theme)) {
			shadow.persistProperties(sectionName, propertyName, configValues);
		} else {
			if (configValues.isIBCSEnabled || configValues.isResetInIBCSPressed) {
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
		if (configValues.isIBCSEnabled) {
			setConfigValues({ ...CHART_SETTINGS, isResetInIBCSPressed: true });
		} else {
			setConfigValues({ ...CHART_SETTINGS });
		}
	};

	const [configValues, setConfigValues] = React.useState<IChartSettings>({
		...initialStates,
		isResetInIBCSPressed: false
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

			{UIThemeSettings(shadow, configValues, setConfigValues)}

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default ChartSettings;
