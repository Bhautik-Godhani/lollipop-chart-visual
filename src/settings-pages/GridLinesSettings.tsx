import * as React from "react";
import { GRID_LINES_SETTINGS as GRID_LINES_SETTINGS_IMP } from "../constants";
import { EGridLinesSettings, ELineType } from "../enum";
import { Accordion, ColorPicker, Column, Footer, InputControl, Row, SwitchOption } from "@truviz/shadow/dist/Components";
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from "./SettingsIcons";
import { IGridLinesSettings } from "../visual-settings.interface";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
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

const handleChange = (val, n, gridType: string, setConfigValues: React.Dispatch<React.SetStateAction<IGridLinesSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[gridType]: { ...d[gridType], [n]: val },
	}));
};

const handleCheckbox = (n, gridType: string, setConfigValues: React.Dispatch<React.SetStateAction<IGridLinesSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[gridType]: { ...d[gridType], [n]: !d[gridType][n] },
	}));
};

const handleColor = (rgb, n, gridType: string, setConfigValues: React.Dispatch<React.SetStateAction<IGridLinesSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[gridType]: { ...d[gridType], [n]: rgb },
	}));
};

const UIXAxisGridLines = (
	vizOptions: ShadowUpdateOptions,
	configValues: IGridLinesSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IGridLinesSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<Accordion title="X Axis Lines"
						open={configValues[EGridLinesSettings.xGridLines].show}
						isShowToggle={true}
						showToggleValue={configValues[EGridLinesSettings.xGridLines].show}
						onShowToggleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.xGridLines, setConfigValues)}
						negativeMargins={false}
						childTopPadding={false}
						childBottomPadding={true}>
						<Row>
							<Column>
								<SwitchOption
									label="Line Style"
									value={configValues[EGridLinesSettings.xGridLines].lineType}
									optionsList={LINE_TYPES}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineType, EGridLinesSettings.xGridLines, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<InputControl
									min={1}
									max={10}
									type="number"
									label="Border Width"
									value={configValues[EGridLinesSettings.xGridLines].lineWidth}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.xGridLines, setConfigValues)}
								/>
							</Column>

							<Column>
								<ColorPicker
									label="Color"
									color={configValues[EGridLinesSettings.xGridLines].lineColor}
									handleChange={(value) => handleColor(value, "lineColor", EGridLinesSettings.xGridLines, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</Accordion>
				</Column>
			</Row>
		</>
	);
};

const UIYAxisGridLines = (
	vizOptions: ShadowUpdateOptions,
	configValues: IGridLinesSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IGridLinesSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<Accordion title="Y Axis Lines"
						open={configValues[EGridLinesSettings.yGridLines].show}
						isShowToggle={true}
						showToggleValue={configValues[EGridLinesSettings.yGridLines].show}
						onShowToggleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.yGridLines, setConfigValues)}
						negativeMargins={false}
						childTopPadding={false}
						childBottomPadding={true}>
						<Row>
							<Column>
								<SwitchOption
									label="Line Style"
									value={configValues[EGridLinesSettings.yGridLines].lineType}
									optionsList={LINE_TYPES}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineType, EGridLinesSettings.yGridLines, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<InputControl
									min={1}
									max={10}
									type="number"
									label="Border Width"
									value={configValues[EGridLinesSettings.yGridLines].lineWidth}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.yGridLines, setConfigValues)}
								/>
							</Column>

							<Column>
								<ColorPicker
									label="Color"
									color={configValues[EGridLinesSettings.yGridLines].lineColor}
									handleChange={(value) => handleColor(value, "lineColor", EGridLinesSettings.yGridLines, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</Accordion >
				</Column >
			</Row >
		</>
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

const GridLinesSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const GRID_LINES_SETTINGS = JSON.parse(JSON.stringify(GRID_LINES_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...GRID_LINES_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...GRID_LINES_SETTINGS };
	}

	const applyChanges = () => {
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...GRID_LINES_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IGridLinesSettings>({
		...initialStates,
	});

	return (
		<>
			{UIXAxisGridLines(vizOptions, configValues, setConfigValues)}
			{UIYAxisGridLines(vizOptions, configValues, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default GridLinesSettings;
