import * as React from "react";
import { GRID_LINES_SETTINGS as GRID_LINES_SETTINGS_IMP } from "../constants";
import { EGridLinesSettings, ELineType } from "../enum";
import { ColorPicker, Column, ConditionalWrapper, Footer, RangeSlider, Row, SwitchOption, Tab, Tabs, ToggleButton } from "@truviz/shadow/dist/Components";
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
					<ToggleButton
						label={"Enable X Grid"}
						value={configValues[EGridLinesSettings.xGridLines].show}
						handleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.xGridLines, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[EGridLinesSettings.xGridLines].show}>
				<Row appearance="padded">
					<Column>
						<Row disableTopPadding>
							<Column>
								<SwitchOption
									label="Style"
									value={configValues[EGridLinesSettings.xGridLines].lineType}
									optionsList={LINE_TYPES}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineType, EGridLinesSettings.xGridLines, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<RangeSlider
									min={1}
									max={10}
									label="Width"
									isViewEditable={true}
									viewValueSuffix="px"
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.xGridLines, setConfigValues)}
									value={configValues[EGridLinesSettings.xGridLines].lineWidth} />
							</Column>
						</Row>

						<Row>
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
						label={"Enable Y Grid"}
						value={configValues[EGridLinesSettings.yGridLines].show}
						handleChange={() => handleCheckbox(EGridLinesSettings.show, EGridLinesSettings.yGridLines, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[EGridLinesSettings.yGridLines].show}>
				<Row appearance="padded">
					<Column>
						<Row disableTopPadding>
							<Column>
								<SwitchOption
									label="Style"
									value={configValues[EGridLinesSettings.yGridLines].lineType}
									optionsList={LINE_TYPES}
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineType, EGridLinesSettings.yGridLines, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<RangeSlider
									min={1}
									max={10}
									label="Width"
									isViewEditable={true}
									viewValueSuffix="px"
									handleChange={(value) => handleChange(value, EGridLinesSettings.lineWidth, EGridLinesSettings.yGridLines, setConfigValues)}
									value={configValues[EGridLinesSettings.yGridLines].lineWidth} />
							</Column>
						</Row>

						<Row>
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
			<Tabs selected={EGridLinesSettings.xGridLines}>
				<Tab title={"X-Axis"} identifier={EGridLinesSettings.xGridLines}>
					{UIXAxisGridLines(vizOptions, configValues, setConfigValues)}
				</Tab>
				<Tab title={"Y-Axis"} identifier={EGridLinesSettings.yGridLines}>
					{UIYAxisGridLines(vizOptions, configValues, setConfigValues)}
				</Tab>
			</Tabs >

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default GridLinesSettings;
