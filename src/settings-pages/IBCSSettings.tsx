import * as React from "react";
import { IBCS_SETTINGS } from "../constants";
import { EIBCSSettings, EIBCSThemes } from "../enum";
import { Column, Footer, Row, SelectInput } from "@truviz/shadow/dist/Components";
import { IBCSSettings, ILabelValuePair } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";

const IBCS_THEMES: ILabelValuePair[] = [
	{
		label: "Default Vertical",
		value: EIBCSThemes.DefaultVertical
	},
	{
		label: "Default Horizontal",
		value: EIBCSThemes.DefaultHorizontal
	},
	{
		label: "Diverging 1 Vertical",
		value: EIBCSThemes.Diverging1Vertical
	},
	{
		label: "Diverging 1 Horizontal",
		value: EIBCSThemes.Diverging1Horizontal
	},
	{
		label: "Diverging 2 Vertical",
		value: EIBCSThemes.Diverging2Vertical
	},
	{
		label: "Diverging 2 Horizontal",
		value: EIBCSThemes.Diverging2Horizontal
	}
];

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IBCSSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
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

const UIThemeSettings = (
	shadow: Visual,
	configValues: IBCSSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IBCSSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Select Theme"}
						value={configValues.theme}
						optionsList={IBCS_THEMES}
						handleChange={value => handleChange(value, EIBCSSettings.Theme, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const IBCSSettings = (props) => {
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
			...IBCS_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...IBCS_SETTINGS };
	}

	const applyChanges = () => {
		configValues.prevTheme = shadow.IBCSSettings.theme;

		if (configValues.theme) {
			configValues.isIBCSEnabled = true;
		} else {
			ApplyBeforeIBCSAppliedSettingsBack(shadow);
		}

		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues(() => ({
			...IBCS_SETTINGS
		}));
	};

	const [configValues, setConfigValues] = React.useState<IBCSSettings>({
		...initialStates,
	});

	return (
		<>
			{UIThemeSettings(shadow, configValues, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default IBCSSettings;
