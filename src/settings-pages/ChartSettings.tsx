/* eslint-disable max-lines-per-function */
import * as React from "react";
import { CHART_SETTINGS as CHART_SETTINGS_IMP } from "../constants";
import { EChartSettings, EIBCSThemes, ELineType, Orientation } from "../enum";
import { InputControl, Row, Column, ConditionalWrapper, SwitchOption, Footer, ToggleButton, ColorPicker, AccordionAlt, Label, ImageOption, RangeSlider } from "@truviz/shadow/dist/Components";
import { IChartSettings } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { DashedLineIcon, DottedLineIcon, IBCSDefaultHIcon, IBCSDefaultVIcon, IBCSDiverging1HIcon, IBCSDiverging1VIcon, IBCSDiverging2HIcon, IBCSDiverging2VIcon, SolidLineIcon } from "./SettingsIcons";
import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";
import VerticalOrientationIcon from "../../assets/icons/Vertical-orientation.svg";
import HorizontalOrientationIcon from "../../assets/icons/horizontal-orientation.svg";
import { persistProperties } from "../methods/methods";

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
		<AccordionAlt title="Connecting Line"
			open={configValues.showConnectingLine}
			showToggle={true}
			toggleValue={configValues.showConnectingLine}
			onChangeToggle={(value) => handleChange(value, EChartSettings.showConnectingLine, setConfigValues)}
		>
			<Row>
				<Column>
					<SwitchOption
						label="Line Style"
						value={configValues.connectingLineStyle}
						optionsList={LINE_TYPES}
						handleChange={(value) => handleChange(value, EChartSettings.connectingLineStyle, setConfigValues)}
						selectorAppearance="secondary"
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
		</AccordionAlt>
	</>
}

const UIZeroBaseLineSettings = (
	vizOptions: ShadowUpdateOptions,
	configValues: IChartSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return <>
		<AccordionAlt title="Zero Base Line"
			open={configValues.isShowZeroBaseLine}
			showToggle={true}
			toggleValue={configValues.isShowZeroBaseLine}
			onChangeToggle={(value) => handleChange(value, EChartSettings.isShowZeroBaseLine, setConfigValues)}
		>
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
		</AccordionAlt>
	</>
}

const UIGeneralChartSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	configValues: IChartSettings,
	isHasSubCategories: boolean,
	setConfigValues: React.Dispatch<React.SetStateAction<IChartSettings>>
) => {
	return (
		<>

			<AccordionAlt title="Lollipop" open={true}>
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
							<RangeSlider
								min={20}
								max={180}
								label="Min Category Width (PX)"
								value={configValues.lollipopWidth ? configValues.lollipopWidth : Math.ceil(shadow.scaleBandWidth)}
								handleChange={(value) => handleChange(value, EChartSettings.lollipopWidth, setConfigValues)}
								isViewEditable
								stepValue={5}
							></RangeSlider>
						</Column>
					</Row>
				</ConditionalWrapper>
			</AccordionAlt>

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
		// if (configValues.theme) {
		// 	configValues.isIBCSEnabled = true;
		// } else {
		// 	ApplyBeforeIBCSAppliedSettingsBack(shadow);
		// }

		if (configValues.isShowZeroBaseLine !== true ||
			(configValues.orientation !== ((shadow.templateSettings.theme === EIBCSThemes.DefaultHorizontal ||
				shadow.templateSettings.theme === EIBCSThemes.Diverging1Horizontal ||
				shadow.templateSettings.theme === EIBCSThemes.Diverging2Horizontal) ? Orientation.Horizontal : Orientation.Vertical))
		) {
			persistProperties(shadow, sectionName, propertyName, configValues);
		} else {
			shadow.persistProperties(sectionName, propertyName, configValues);
		}

		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...CHART_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IChartSettings>({
		...initialStates,
		isResetInIBCSPressed: false
	});

	const [isHasSubCategories] = React.useState(shadow.isHasSubcategories);

	return (
		<>
			{UIGeneralChartSettings(shadow, vizOptions, configValues, isHasSubCategories, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default ChartSettings;
