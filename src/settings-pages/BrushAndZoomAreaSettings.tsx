/* eslint-disable max-lines-per-function */
import * as React from "react";
import ToggleSwitch from "@truviz/shadow/dist/Components/ToggleButton/ToggleSwitch";
import { Row, Column, Footer, ConditionalWrapper, ColorPicker, SelectInput, InputControl } from "@truviz/shadow/dist/Components";
import { BRUSH_AND_ZOOM_AREA_SETTINGS } from "../constants";
import { IBrushAndZoomAreaSettings, ILabelValuePair } from "../visual-settings.interface";
import { EAutoCustomTypes, EBrushAndZoomAreaSettings } from "../enum";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { Visual } from "../visual";

const AUTO_CUSTOM_TYPES: ILabelValuePair[] = [
	{
		label: "Auto",
		value: EAutoCustomTypes.Auto,
	},
	{
		label: "Custom",
		value: EAutoCustomTypes.Custom,
	},
];

const handleColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: rgb,
	}));
};

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const UIGeneralChartSettings = (
	shadow: Visual,
	vizOptions: ShadowUpdateOptions,
	configValues: IBrushAndZoomAreaSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<ToggleSwitch
						label="Enabled"
						value={configValues.enabled}
						handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Enabled, setConfigValues)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.enabled}>
				<Row>
					<Column>
						<ToggleSwitch
							label="Show Axis"
							value={configValues.isShowAxis}
							handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsShowAxis, setConfigValues)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Track Color"
							color={configValues.trackBackgroundColor}
							handleChange={(value) => handleColor(value, EBrushAndZoomAreaSettings.TrackBackgroundColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Selection Track Color"
							color={configValues.selectionTrackBackgroundColor}
							handleChange={(value) => handleColor(value, EBrushAndZoomAreaSettings.SelectionTrackBackgroundColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<ColorPicker
							label="Selection Track Border Color"
							color={configValues.selectionTrackBorderColor}
							handleChange={(value) => handleColor(value, EBrushAndZoomAreaSettings.SelectionTrackBorderColor, setConfigValues)}
							colorPalette={vizOptions.host.colorPalette}
							size="sm"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={shadow.isHorizontalChart}>
					<Row>
						<Column>
							<SelectInput
								label="Select Width"
								value={configValues.widthType}
								optionsList={AUTO_CUSTOM_TYPES}
								handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.WidthType, setConfigValues)}
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={configValues.widthType === EAutoCustomTypes.Custom}>
						<Row>
							<Column>
								<InputControl
									min={1}
									type="number"
									label="Width"
									value={configValues.width}
									handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Width, setConfigValues)}
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>

				<ConditionalWrapper visible={!shadow.isHorizontalChart}>
					<Row>
						<Column>
							<SelectInput
								label="Select Height"
								value={configValues.heightType}
								optionsList={AUTO_CUSTOM_TYPES}
								handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.HeightType, setConfigValues)}
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={configValues.heightType === EAutoCustomTypes.Custom}>
						<Row>
							<Column>
								<InputControl
									min={shadow.brushAndZoomAreaMinHeight}
									max={shadow.brushAndZoomAreaMaxHeight}
									type="number"
									label="Height"
									value={configValues.height}
									handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Height, setConfigValues)}
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>
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

const BrushAndZoomAreaSettings = (props) => {
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
			...BRUSH_AND_ZOOM_AREA_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...BRUSH_AND_ZOOM_AREA_SETTINGS };
	}

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...BRUSH_AND_ZOOM_AREA_SETTINGS });
	};

	if (!shadow.isShowBucketChartFieldCheck) {
		initialStates.enable = false;
	}

	const [configValues, setConfigValues] = React.useState<IBrushAndZoomAreaSettings>(initialStates);

	React.useEffect(() => {
		if (!configValues.width) {
			handleChange(shadow.brushAndZoomAreaWidth, EBrushAndZoomAreaSettings.Width, setConfigValues)
		}

		if (!configValues.height) {
			handleChange(shadow.brushAndZoomAreaHeight, EBrushAndZoomAreaSettings.Height, setConfigValues)
		}
	}, []);

	return (
		<>
			{UIGeneralChartSettings(shadow, vizOptions, configValues, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default BrushAndZoomAreaSettings;
