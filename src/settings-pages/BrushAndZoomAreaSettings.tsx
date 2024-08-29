import * as React from "react";
import ToggleSwitch from "@truviz/shadow/dist/Components/ToggleButton/ToggleSwitch";
import { Row, Column, Footer, ConditionalWrapper, ColorPicker, InputControl, Quote, ToggleButton } from "@truviz/shadow/dist/Components";
import { BRUSH_AND_ZOOM_AREA_SETTINGS as BRUSH_AND_ZOOM_AREA_SETTINGS_IMP } from "../constants";
import { IBrushAndZoomAreaSettings } from "../visual-settings.interface";
import { EBrushAndZoomAreaSettings } from "../enum";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { Visual } from "../visual";
import { PreviewSliderPlaceholderIcon } from "./SettingsIcons";

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
				<ToggleButton
					label={"Track Auto Width"}
					value={configValues.isAutoWidth}
					handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsAutoWidth, setConfigValues)}
					appearance="toggle"
				/>
			</Column>
		</Row>

		<ConditionalWrapper visible={!configValues.isAutoWidth}>
			<Row appearance="padded">
				<Column>
					<InputControl
						min={1}
						type="number"
						label="Width"
						value={configValues.width}
						handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Width, setConfigValues)}
					/>
				</Column>
				<Column></Column>
			</Row>
		</ConditionalWrapper>
	</ConditionalWrapper >
}

const UIHeightSettings = (shadow: Visual, configValues: IBrushAndZoomAreaSettings, setConfigValues: React.Dispatch<React.SetStateAction<IBrushAndZoomAreaSettings>>) => {
	return <ConditionalWrapper visible={!shadow.isHorizontalChart}>
		<Row>
			<Column>
				<ToggleButton
					label={"Track Auto Height"}
					value={configValues.isAutoHeight}
					handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsAutoHeight, setConfigValues)}
					appearance="toggle"
				/>
			</Column>
		</Row>

		<ConditionalWrapper visible={!configValues.isAutoHeight}>
			<Row appearance="padded">
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
				<Column></Column>
			</Row>
		</ConditionalWrapper >
	</ConditionalWrapper >
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
					<ToggleButton
						label={"Enable"}
						value={configValues.enabled}
						handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Enabled, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={!configValues.enabled}>
				<div className="preview-image">
					<PreviewSliderPlaceholderIcon />
				</div>
			</ConditionalWrapper>

			<ConditionalWrapper visible={configValues.enabled}>
				<Row>
					<Column>
						<InputControl
							min={5}
							max={shadow.categoricalCategoriesFields[0].values.length < 5 ? 5 : shadow.categoricalCategoriesFields[0].values.length}
							type="number"
							label="Preview Lollipop Count"
							value={configValues.minLollipopCount}
							handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.MinLollipopCount, setConfigValues)}
						/>
					</Column>
					<Column></Column>
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

				<ConditionalWrapper visible={configValues.enabled}>
					{UIWidthSettings(shadow, configValues, setConfigValues)}
					{UIHeightSettings(shadow, configValues, setConfigValues)}
				</ConditionalWrapper>
			</ConditionalWrapper>
		</>
	);
};

const UIFooter = (shadow: Visual, closeCurrentSettingHandler: () => void, applyChanges: () => void, resetChanges: () => void) => {
	return (
		<Footer
			cancelButtonHandler={closeCurrentSettingHandler}
			saveButtonConfig={{
				isDisabled: shadow.isSmallMultiplesEnabled || shadow.isChartIsRaceChart,
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

		if (shadow.isSmallMultiplesEnabled && configValues.enabled) {
			handleChange(false, EBrushAndZoomAreaSettings.Enabled, setConfigValues)
		}
	}, []);

	return (
		<>
			<ConditionalWrapper visible={shadow.isSmallMultiplesEnabled || shadow.isChartIsRaceChart}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>Please remove the small multiples/race chart data to use this feature.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={!shadow.isSmallMultiplesEnabled && !shadow.isChartIsRaceChart}>
				{UIGeneralChartSettings(shadow, vizOptions, configValues, setConfigValues)}
			</ConditionalWrapper>

			{UIFooter(shadow, closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default BrushAndZoomAreaSettings;
