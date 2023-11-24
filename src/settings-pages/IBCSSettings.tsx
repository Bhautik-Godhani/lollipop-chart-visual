import * as React from "react";
import { IBCS_SETTINGS } from "../constants";
import { EIBCSSettings, EIBCSThemes } from "../enum";
import { Column, Footer, Label, Row } from "@truviz/shadow/dist/Components";
import { IBCSSettings } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";
import { IBCSDefaultHIcon, IBCSDefaultVIcon, IBCSDiverging1HIcon, IBCSDiverging1VIcon, IBCSDiverging2HIcon, IBCSDiverging2VIcon } from "./SettingsIcons";

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
					<Label text="Default"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultVertical ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.DefaultVertical, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDefaultVIcon />
					</div>
				</Column>
				<Column>
					<Label text="Default"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.DefaultHorizontal ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.DefaultHorizontal, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDefaultHIcon />
					</div>
				</Column>
			</Row>

			<Row>
				<Column>
					<Label text="Diverging 1"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Vertical ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.Diverging1Vertical, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDiverging1VIcon />
					</div>
				</Column>
				<Column>
					<Label text="Diverging 1"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging1Horizontal ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.Diverging1Horizontal, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDiverging1HIcon />
					</div>
				</Column>
			</Row>

			<Row>
				<Column>
					<Label text="Diverging 2"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Vertical ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.Diverging2Vertical, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDiverging2VIcon />
					</div>
				</Column>
				<Column>
					<Label text="Diverging 2"></Label>
					<div className={`ibcs-grid-item ${configValues.theme === EIBCSThemes.Diverging2Horizontal ? "active" : ""}`}
						onClick={
							() => handleChange(EIBCSThemes.Diverging2Horizontal, EIBCSSettings.Theme, setConfigValues)
						}>
						<IBCSDiverging2HIcon />
					</div>
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
