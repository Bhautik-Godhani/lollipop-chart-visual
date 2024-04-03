/* eslint-disable max-lines-per-function */
import * as React from "react";
import { LINE_SETTINGS as LINE_SETTINGS_IMP } from "../constants";
import { ELineSettings, ELineType } from "../enum";
import { ColorPicker, Column, ConditionalWrapper, Footer, InputControl, Row, SwitchOption, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILineSettings } from "../visual-settings.interface";
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from "./SettingsIcons";
import { persistProperties } from "../methods/methods";

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

const LineSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const LINE_SETTINGS = JSON.parse(JSON.stringify(LINE_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...LINE_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...LINE_SETTINGS };
	}

	const applyChanges = () => {
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...LINE_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<ILineSettings>({
		...initialStates,
	});

	const handleChange = (val, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: val,
		}));
	};

	const handleCheckbox = (n) => {
		setConfigValues((d) => ({
			...d,
			[n]: !d[n],
		}));
	};

	const handleColor = (rgb, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: rgb,
		}));
	};

	const isDumbbellChart = !!vizOptions.options.dataViews[0].categorical.values[1];

	if (
		isDumbbellChart &&
		(configValues[ELineSettings.lineColor] === "rgb(91,121,185)" || configValues[ELineSettings.lineColor] === "rgba(91,121,185,1)")
	) {
		configValues[ELineSettings.lineColor] = "rgb(150,150,150,60)";
	}

	React.useEffect(() => {
		if (configValues.isApplyMarkerColor && shadow.isLollipopTypePie) {
			handleChange(false, ELineSettings.isApplyMarkerColor)
		}
	}, []);

	return (
		<>
			<Row>
				<Column>
					<ToggleButton label={"Display Line"} value={configValues.show} handleChange={() => handleCheckbox(ELineSettings.show)} />
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.show}>
				<Row>
					<Column>
						<SwitchOption
							label="Line Style"
							value={configValues.lineType}
							optionsList={LINE_TYPES}
							handleChange={(value) => handleChange(value, ELineSettings.lineType)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<InputControl
							min={1}
							max={20}
							type="number"
							label="Line Width"
							value={configValues.lineWidth}
							handleChange={(value) => handleChange(value, ELineSettings.lineWidth)}
						/>
					</Column>
					<Column></Column>
				</Row>

				<ConditionalWrapper visible={!shadow.isLollipopTypePie}>
					<Row>
						<Column>
							<ToggleButton
								label={"Same color as Marker"}
								value={configValues.isApplyMarkerColor}
								handleChange={() => handleCheckbox(ELineSettings.isApplyMarkerColor)}
								appearance="checkbox"
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={!configValues.isApplyMarkerColor}>
						<Row>
							<Column>
								<ColorPicker
									label="Color"
									color={configValues.lineColor}
									handleChange={(value) => handleColor(value, ELineSettings.lineColor)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>

				<ConditionalWrapper visible={shadow.isLollipopTypePie}>
					<Row>
						<Column>
							<ColorPicker
								label="Color"
								color={configValues.lineColor}
								handleChange={(value) => handleColor(value, ELineSettings.lineColor)}
								colorPalette={vizOptions.host.colorPalette}
								size="sm"
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default LineSettings;
