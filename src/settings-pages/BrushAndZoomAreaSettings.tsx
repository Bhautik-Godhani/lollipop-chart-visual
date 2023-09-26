import * as React from "react";
import ToggleSwitch from "@truviz/shadow/dist/Components/ToggleButton/ToggleSwitch";
import { Row, Column, Footer, ConditionalWrapper } from "@truviz/shadow/dist/Components";
import { BRUSH_AND_ZOOM_AREA_SETTINGS } from "../constants";
import { IBrushAndZoomAreaSettings } from "../visual-settings.interface";
import { EBrushAndZoomAreaSettings } from "../enum";

const UIGeneralChartSettings = (
	configValues: IBrushAndZoomAreaSettings,
	handleChange: (v: any, key: EBrushAndZoomAreaSettings) => void
) => {
	return (
		<>
			<Row>
				<Column>
					<ToggleSwitch
						label="Enabled"
						value={configValues.enabled}
						handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.Enabled)}
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.enabled}>
				<Row>
					<Column>
						<ToggleSwitch
							label="Show Axis"
							value={configValues.isShowAxis}
							handleChange={(value) => handleChange(value, EBrushAndZoomAreaSettings.IsShowAxis)}
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

	const handleChange = (val, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: val,
		}));
	};

	return (
		<>
			{UIGeneralChartSettings(configValues, handleChange)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default BrushAndZoomAreaSettings;
