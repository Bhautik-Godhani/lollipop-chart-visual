import * as React from "react";
import { LINE_SETTINGS as LINE_SETTINGS_IMP, POSITIVE_COLOR } from "../constants";
import { ColorPaletteType, EIBCSThemes, ELineSettings, ELineType, EMarkerShapeTypes } from "../enum";
import { ColorPicker, Column, ConditionalWrapper, Footer, InputControl, Row, SwitchOption, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILineSettings } from "../visual-settings.interface";
import { DashedLineIcon, DottedLineIcon, SolidLineIcon } from "./SettingsIcons";
import { persistProperties } from "../methods/methods";
import { Visual } from "../visual";
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

const UIExtended1 = (
	vizOptions: ShadowUpdateOptions,
	shadow: Visual,
	configValues: ILineSettings,
	handleChange, handleColor, handleCheckbox
) => {
	return <>
		<Row appearance="padded">
			<Column>
				<Row disableTopPadding>
					<Column>
						<SwitchOption
							label="Line Style"
							value={configValues.lineType}
							optionsList={LINE_TYPES}
							selectorAppearance="secondary"
							handleChange={(value) => handleChange(value, ELineSettings.lineType)}
						/>
					</Column>
				</Row>

				<Row>
					<Column>
						<InputControl
							min={1}
							max={20}
							type="number"
							label="Line Width"
							value={configValues.lineWidth}
							handleChange={(value) => handleChange(value, ELineSettings.lineWidth)}
						/>
					</Column>

					<Column>
						<ConditionalWrapper visible={shadow.isShowImageMarker1 || shadow.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON || shadow.isLollipopTypePie ? (shadow.isHasMultiMeasure || (!shadow.isHasMultiMeasure)) : false}>
							<ColorPicker
								label="Color"
								color={configValues.lineColor}
								handleChange={(value) => handleColor(value, ELineSettings.lineColor)}
								colorPalette={vizOptions.host.colorPalette}
							/>
						</ConditionalWrapper>
					</Column>
				</Row>

				<ConditionalWrapper visible={!shadow.isShowImageMarker1 && shadow.markerSettings.marker1Style.markerShape !== EMarkerShapeTypes.UPLOAD_ICON && (shadow.isLollipopTypePie ? (!shadow.isHasMultiMeasure && (shadow as Visual).dataColorsSettings.fillType === ColorPaletteType.Single) : true)}>
					<Row>
						<Column>
							<ToggleButton
								label={"Same color as Marker"}
								value={configValues.isApplyMarkerColor}
								handleChange={() => handleCheckbox(ELineSettings.isApplyMarkerColor)}
								appearance="checkbox"
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={!configValues.isApplyMarkerColor}>
						<Row>
							<Column>
								<ColorPicker
									label="Color"
									color={configValues.lineColor}
									handleChange={(value) => handleColor(value, ELineSettings.lineColor)}
									colorPalette={vizOptions.host.colorPalette}
									size="sm"
								/>
							</Column>
						</Row>
					</ConditionalWrapper>
				</ConditionalWrapper>
			</Column>
		</Row>
	</>
}

const LineSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const LINE_SETTINGS = JSON.parse(JSON.stringify(LINE_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...LINE_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...LINE_SETTINGS };
	}

	const applyChanges = () => {
		if (configValues.show !== true ||
			configValues.lineColor !== ((shadow.templateSettings.theme === EIBCSThemes.DefaultVertical || shadow.templateSettings.theme === EIBCSThemes.DefaultHorizontal) ? "rgba(142, 142, 142, 1)" : POSITIVE_COLOR) ||
			configValues.lineWidth !== 4 ||
			configValues.lineType !== ELineType.Solid ||
			configValues.isApplyMarkerColor !== ((shadow.templateSettings.theme === EIBCSThemes.Diverging2Vertical || shadow.templateSettings.theme === EIBCSThemes.Diverging2Horizontal) ? true : false)
		) {
			persistProperties(shadow, sectionName, propertyName, configValues);
		} else {
			shadow.persistProperties(sectionName, propertyName, configValues);
		}

		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...LINE_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<ILineSettings>({
		...initialStates,
	});

	const handleChange = (val, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: val,
		}));
	};

	const handleCheckbox = (n) => {
		setConfigValues((d) => ({
			...d,
			[n]: !d[n],
		}));
	};

	const handleColor = (rgb, n) => {
		setConfigValues((d) => ({
			...d,
			[n]: rgb,
		}));
	};

	const isDumbbellChart = !!vizOptions.options.dataViews[0].categorical.values[1];

	if (
		isDumbbellChart &&
		(configValues[ELineSettings.lineColor] === "rgb(91,121,185)" || configValues[ELineSettings.lineColor] === "rgba(91,121,185,1)")
	) {
		configValues[ELineSettings.lineColor] = "rgb(150,150,150,60)";
	}

	React.useEffect(() => {
		if (configValues.isApplyMarkerColor && shadow.isLollipopTypePie) {
			if (shadow.isLollipopTypePie) {
				if (shadow.isHasMultiMeasure || (!shadow.isHasMultiMeasure && shadow.dataColorsSettings.fillType !== ColorPaletteType.Single)) {
					handleChange(false, ELineSettings.isApplyMarkerColor);
				}
			}
		}

		if (shadow.isShowImageMarker1 || shadow.markerSettings.marker1Style.markerShape === EMarkerShapeTypes.UPLOAD_ICON) {
			handleChange(false, ELineSettings.isApplyMarkerColor);
		}
	}, []);

	return (
		<>
			<Row>
				<Column>
					<ToggleButton label={"Display Line"} value={configValues.show} handleChange={() => handleCheckbox(ELineSettings.show)} />
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues.show}>
				{UIExtended1(vizOptions, shadow, configValues, handleChange, handleColor, handleCheckbox)}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default LineSettings;
