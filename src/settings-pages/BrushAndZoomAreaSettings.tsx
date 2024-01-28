import * as React from "react";
import ToggleSwitch from "@truviz/shadow/dist/Components/ToggleButton/ToggleSwitch";
import { Row, Column, Footer, ConditionalWrapper, ColorPicker, InputControl, Accordion } from "@truviz/shadow/dist/Components";
import { BRUSH_AND_ZOOM_AREA_SETTINGS as BRUSH_AND_ZOOM_AREA_SETTINGS_IMP } from "../constants";
import { IBrushAndZoomAreaSettings } from "../visual-settings.interface";
import { EBrushAndZoomAreaSettings } from "../enum";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { Visual } from "../visual";
import { persistProperties } from "../methods/methods";

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

const UIWidthSettings = (shadow: Visual, configValues: IBrushAndZoomAreaSettings, setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>) => {
	return <ConditionalWrapper visible={shadow.isHorizontalChart}>
		<Row>
			<Column>
				<Accordion title="Track Manual Width"
					open={configValues.isAutoWidth}
					isShowToggle={true}
					showToggleValue={configValues.isAutoWidth}
					onShowToggleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsAutoWidth, setConfigValues)}
					negativeMargins={false}
					childTopPadding={false}
					childBottomPadding={true}>
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
				</Accordion>
			</Column>
		</Row>
	</ConditionalWrapper>
}

const UIHeightSettings = (shadow: Visual, configValues: IBrushAndZoomAreaSettings, setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>) => {
	return <ConditionalWrapper visible={!shadow.isHorizontalChart}>
		<Row>
			<Column>
				<Accordion title="Track Manual Height"
					open={configValues.isAutoHeight}
					isShowToggle={true}
					showToggleValue={configValues.isAutoHeight}
					onShowToggleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsAutoHeight, setConfigValues)}
					negativeMargins={false}
					childTopPadding={false}
					childBottomPadding={true}>
					<Row>
						<Column>
							<InputControl
								min={shadow.brushAndZoomAreaMinHeight}
								max={shadow.height / 2}
								type="number"
								label="Height"
								value={configValues.height}
								handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Height, setConfigValues)}
							/>
						</Column>
					</Row>
				</Accordion>
			</Column>
		</Row>
	</ConditionalWrapper>
}

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
					<Accordion title="Enable Brush Area"
						open={configValues.enabled}
						isShowToggle={true}
						showToggleValue={configValues.enabled}
						onShowToggleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Enabled, setConfigValues)}
						negativeMargins={false}
						childTopPadding={false}
						childBottomPadding={true}>
						<Row>
							<Column>
								<InputControl
									min={5}
									type="number"
									label="Preview Lollipop Count"
									value={configValues.minLollipopCount}
									handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.MinLollipopCount, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<ColorPicker
									label="Default Track"
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
									label="Selected Track"
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
									label="Selected Track Border"
									color={configValues.selectionTrackBorderColor}
									handleChange={(value) => handleColor(value, EBrushAndZoomAreaSettings.SelectionTrackBorderColor, setConfigValues)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<ToggleSwitch
									label="Show Axis Labels"
									value={configValues.isShowAxis}
									handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsShowAxis, setConfigValues)}
									appearance="checkbox"
								/>
							</Column>
						</Row>
					</Accordion>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.enabled}>
				{UIWidthSettings(shadow, configValues, setConfigValues)}
				{UIHeightSettings(shadow, configValues, setConfigValues)}
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

	const BRUSH_AND_ZOOM_AREA_SETTINGS = JSON.parse(JSON.stringify(BRUSH_AND_ZOOM_AREA_SETTINGS_IMP));
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
		persistProperties(shadow, sectionName, propertyName, configValues);
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
