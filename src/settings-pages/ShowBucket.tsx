import * as React from "react";
import ColorPicker from "@truviz/shadow/dist/Components/ColorPicker/ColorPicker";
import ToggleSwitch from "@truviz/shadow/dist/Components/ToggleButton/ToggleSwitch";
import SelectInput from "@truviz/shadow/dist/Components/SelectInput/SelectInput";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "./SettingsIcons";
import { InputControl, Row, Column, ConditionalWrapper, Quote, SwitchOption, Footer } from "@truviz/shadow/dist/Components";
import { SHOW_BUCKET_SETTINGS as SHOW_BUCKET_SETTINGS_IMP } from "../constants";
import { IShowBucketSettings } from "../visual-settings.interface";
import { EShowBucketSettings } from "../enum";
import { Visual } from "../visual";

const UIShowBucketSettings = (
	shadow: any,
	vizOptions: any,
	configValues: IShowBucketSettings,
	handleChange: (v: any, key: EShowBucketSettings) => void
) => {
	return (
		<>
			<Row appearance="padded">
				<Column>
					<Row disableTopPadding>
						<Column>
							<SelectInput
								label={"Select Field"}
								tooltip={"Field should always have either 1 or 0"}
								value={shadow.isShowBucketChartFieldName.toLowerCase()}
								optionsList={[
									{
										label: shadow.isShowBucketChartFieldName,
										value: shadow.isShowBucketChartFieldName.toLowerCase(),
									},
								]}
								handleChange={(value) => handleChange(value, EShowBucketSettings.ShowBucketField)}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<InputControl
								label={"Message"}
								type="textarea"
								value={configValues.message}
								handleChange={(value: any) => {
									handleChange(+value, EShowBucketSettings.Message);
								}}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<ToggleSwitch
								label="Show Icon"
								appearance="checkbox"
								value={configValues.showIcon}
								handleChange={(value) => handleChange(value, EShowBucketSettings.ShowIcon)}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<SelectInput
								label={"Font Family"}
								value={configValues.fontFamily}
								isFontSelector={true}
								optionsList={[]}
								handleChange={(value) => handleChange(value, EShowBucketSettings.FontFamily)}
							/>
						</Column>
					</Row>

					<Row>
						<Column>
							<SwitchOption
								label="Styling"
								value={configValues.styling}
								optionsList={[
									{
										label: <BoldIcon style={{ fill: "currentColor" }} />,
										value: "bold",
									},
									{
										label: <ItalicIcon style={{ fill: "currentColor" }} />,
										value: "italic",
									},
									{
										label: <UnderlineIcon style={{ fill: "currentColor" }} />,
										value: "underline",
									},
								]}
								isMultiple
								handleChange={(value) => handleChange(value, EShowBucketSettings.Styling)}
							/>
						</Column>
					</Row>

					{UIShowBucketSettings1(vizOptions, configValues, handleChange)}
				</Column>
			</Row>
		</>
	);
};

const UIShowBucketSettings1 = (
	vizOptions: any,
	configValues: IShowBucketSettings,
	handleChange: (v: any, key: EShowBucketSettings) => void
) => {
	return <Row>
		<Column>
			<InputControl
				min={1}
				type="number"
				label="Text Size"
				value={configValues.fontSize.toString()}
				handleChange={(value) => handleChange(+value, EShowBucketSettings.FontSize)}
			/>
		</Column>

		<Column>
			<ColorPicker
				label="Color"
				color={configValues.color}
				handleChange={(color) => handleChange(color, EShowBucketSettings.Color)}
				colorPalette={vizOptions.host.colorPalette}
			/>
		</Column>
	</Row>
}

const UIFooter = (self: Visual, closeCurrentSettingHandler: () => void, applyChanges: () => void, resetChanges: () => void) => {
	return (
		<Footer
			cancelButtonHandler={closeCurrentSettingHandler}
			saveButtonConfig={{
				isDisabled: !self.isShowBucketChartFieldCheck,
				text: "APPLY",
				handler: applyChanges,
			}}
			resetButtonHandler={resetChanges}
		/>
	);
};

const ShowCondition = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	let initialStates = vizOptions.formatTab[sectionName][propertyName];
	const SHOW_BUCKET_SETTINGS = JSON.parse(JSON.stringify(SHOW_BUCKET_SETTINGS_IMP))

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...SHOW_BUCKET_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...SHOW_BUCKET_SETTINGS };
	}

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	if (!shadow.isShowBucketChartFieldCheck) {
		initialStates.enable = false;
	}

	const [configValues, setConfigValues] = React.useState<IShowBucketSettings>(initialStates);

	const resetChanges = () => {
		// handleChange([], EShowBucketSettings.Styling);
		setConfigValues((d) => ({
			...d,
			...SHOW_BUCKET_SETTINGS
		}));
		// setConfigValues({ ...SHOW_BUCKET_SETTINGS });
	};

	const handleChange = (val, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: val,
		}));
	};

	return (
		<>
			<ConditionalWrapper visible={!shadow.isShowBucketChartFieldCheck}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>This option allows you to control the visual rendering based on specific rule. To enable this option, add a
							boolean type field in the show bucket where the visual will render when the value is 1.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isShowBucketChartFieldCheck}>
				<Row>
					<Column>
						<ToggleSwitch label="Enable" value={configValues.enable} handleChange={(value) => handleChange(value, EShowBucketSettings.Enable)} />
					</Column>
				</Row>
			</ConditionalWrapper>

			{shadow.isShowBucketChartFieldCheck && configValues.enable && UIShowBucketSettings(shadow, vizOptions, configValues, handleChange)}

			{UIFooter(shadow, closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default ShowCondition;
