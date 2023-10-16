import * as React from "react";
import { GRID_LINES_SETTINGS as GRID_LINES_SETTINGS_IMP } from "../constants";
import { EGridLinesSettings, ELineType } from "../enum";
import { Accordion, ColorPicker, Column, ConditionalWrapper, Footer, InputControl, Row, SwitchOption, ToggleButton } from "@truviz/shadow/dist/Components";
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from "./SettingsIcons";
import { IGridLinesSettings } from "../visual-settings.interface";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

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
					<ToggleButton
						label={"Show Lines"}
						value={configValues[EGridLinesSettings.xGridLines].show}
						handleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.xGridLines, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[EGridLinesSettings.xGridLines].show}>
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
							type="number"
							label="Font Border Size"
							value={configValues[EGridLinesSettings.xGridLines].lineWidth}
							handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.xGridLines, setConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Line Color"
							color={configValues[EGridLinesSettings.xGridLines].lineColor}
							handleChange={(value) => handleColor(value, "lineColor", EGridLinesSettings.xGridLines, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
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
					<ToggleButton
						label={"Show Lines"}
						value={configValues.yGridLines.show}
						handleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.yGridLines, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.yGridLines.show}>
				<Row>
					<Column>
						<SwitchOption
							label="Line Style"
							value={configValues.yGridLines.lineType}
							optionsList={LINE_TYPES}
							handleChange={(value) => handleChange(value, EGridLinesSettings.lineType, EGridLinesSettings.yGridLines, setConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<InputControl
							min={1}
							type="number"
							label="Font Border Size"
							value={configValues.yGridLines.lineWidth}
							handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.yGridLines, setConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Line Color"
							color={configValues.yGridLines.lineColor}
							handleChange={(value) => handleColor(value, "lineColor", EGridLinesSettings.yGridLines, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>
			</ConditionalWrapper>
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
		shadow.persistProperties(sectionName, propertyName, configValues);
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
			<Accordion title="X Axis" childBottomPadding>
				{UIXAxisGridLines(vizOptions, configValues, setConfigValues)}
			</Accordion>

			<Accordion title="Y Axis" childBottomPadding>
				{UIYAxisGridLines(vizOptions, configValues, setConfigValues)}
			</Accordion>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default GridLinesSettings;
