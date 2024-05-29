/* eslint-disable max-lines-per-function */
import * as React from "react";
import { EMarkerChartTypes, EMarkerDefaultShapes, EMarkerSettings, EMarkerShapeTypes, EMarkerStyleTypes, EMarkerTypes } from "../enum";
import { Row, Column, SwitchOption, Footer, ConditionalWrapper, Tabs, Tab, IconPicker, FileUploader, ImageOption, SelectInput, InputControl, ToggleButton, ColorPicker, Quote } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IMarkerSettings } from "../visual-settings.interface";
import { MARKER_SETTINGS as MARKER_SETTINGS_IMP } from "../constants";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { get } from "lodash";

import PieIcon from "../../assets/icons/PieIcon.svg";
import DonutIcon from "../../assets/icons/donut-icon.svg";
import RoseIcon from "../../assets/icons/rose-icon.svg";
import { Visual } from "../visual";
import { persistProperties } from "../methods/methods";
import { MarkerCircleIcon, MarkerDiamondIcon, MarkerHTriangleIcon, MarkerSquareIcon, MarkerVTriangleIcon } from "./SettingsIcons";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const MARKER_TYPES: ILabelValuePair[] = [
	{
		label: "Shape",
		value: EMarkerTypes.SHAPE,
	},
	{
		label: "Chart",
		value: EMarkerTypes.CHART,
	},
];

const MARKER_CHART_TYPES = [
	{
		image: PieIcon,
		value: EMarkerChartTypes.PIE,
		key: "Pie",
		label: "Pie"
	},
	{
		image: DonutIcon,
		value: EMarkerChartTypes.DONUT,
		key: "Donut",
		label: "Donut"
	},
	{
		image: RoseIcon,
		value: EMarkerChartTypes.ROSE,
		key: "Rose",
		label: "Rose Pie"
	}
];

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleMarkerStyleChange = (val, n, markerType: EMarkerStyleTypes, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>): void => {
	setConfigValues((d) => ({
		...d,
		[markerType]: { ...d[markerType], [n]: val },
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

const UIMarkerShapeTypes = (shadow: Visual, vizOptions: ShadowUpdateOptions, config: IMarkerSettings, initialStates: IMarkerSettings, markerStyleTypes: EMarkerStyleTypes, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>) => {
	const configValues = config[config.markerStyleType];
	const MARKERS_LIST: any[] = [
		{
			label: <MarkerCircleIcon fill="currentColor" />,
			value: EMarkerDefaultShapes.CIRCLE,
		},
		{
			label: <MarkerSquareIcon fill="currentColor" />,
			value: EMarkerDefaultShapes.SQUARE,
		},
		{
			label: shadow.isHorizontalChart ? <MarkerHTriangleIcon fill="currentColor" /> : <MarkerVTriangleIcon fill="currentColor" />,
			value: shadow.isHorizontalChart ? EMarkerDefaultShapes.HTRIANGLE : EMarkerDefaultShapes.VTRIANGLE,
		},
		{
			label: <MarkerDiamondIcon fill="currentColor" />,
			value: EMarkerDefaultShapes.DIAMOND,
		},
	];

	return (
		<>
			<Row disableTopPadding>
				<Column>
					<Tabs selected={configValues.markerShape} onChange={(value) => {
						handleMarkerStyleChange(value, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues)
					}}>
						<Tab title={"Default"} identifier={EMarkerShapeTypes.DEFAULT}>
							<ConditionalWrapper visible={shadow.isHasSubcategories}>
								<Row>
									<Column>
										<SwitchOption
											label={"Marker Type"}
											value={config.markerType}
											optionsList={MARKER_TYPES}
											handleChange={(value) => handleChange(value, EMarkerSettings.MarkerType, setConfigValues)}
										/>
									</Column>
								</Row>

								<ConditionalWrapper visible={config.markerType === EMarkerTypes.SHAPE}>
									<Row>
										<Column>
											<SwitchOption
												value={configValues.dropdownMarkerType}
												optionsList={MARKERS_LIST}
												handleChange={(e) => {
													handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues);
													handleMarkerStyleChange(e, EMarkerSettings.DropdownMarkerType, markerStyleTypes, setConfigValues);
												}}
											/>
										</Column>
									</Row>
								</ConditionalWrapper>

								<ConditionalWrapper visible={config.markerType === EMarkerTypes.CHART}>
									<ImageOption
										isShowImageTooltip={true}
										value={config[config.markerStyleType].markerChart}
										images={MARKER_CHART_TYPES}
										handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.MarkerChart, config.markerStyleType, setConfigValues)}
									/>
								</ConditionalWrapper>
							</ConditionalWrapper>

							<ConditionalWrapper visible={!shadow.isHasSubcategories}>
								<Row>
									<Column>
										<SwitchOption
											label="Marker Type"
											value={configValues.dropdownMarkerType}
											optionsList={MARKERS_LIST}
											handleChange={(e) => {
												handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues);
												handleMarkerStyleChange(e, EMarkerSettings.DropdownMarkerType, markerStyleTypes, setConfigValues);
											}}
										/>
									</Column>
								</Row>
							</ConditionalWrapper>

							{UIMarkerSizeSettings(shadow, vizOptions, config, setConfigValues)}
						</Tab>

						<Tab title={"Icons"} identifier={EMarkerShapeTypes.ICONS_LIST}>
							<IconsTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} initialStates={initialStates} />
							{UIMarkerSizeSettings(shadow, vizOptions, config, setConfigValues)}
						</Tab>

						<Tab title={"Images"} identifier={EMarkerShapeTypes.IMAGES}>
							<ConditionalWrapper visible={!shadow.isHasImagesData}>
								<Row>
									<Column>
										<Quote>
											<strong>Note: </strong>Please fill the "Images Data" data field to use this feature.
										</Quote>
									</Column>
								</Row>
							</ConditionalWrapper>

							<ConditionalWrapper visible={shadow.isHasImagesData && shadow.isLollipopTypePie}>
								<Row>
									<Column>
										<Quote>
											<strong>Note: </strong>This feature not supports the "Pie/Donut/Rose Chart Markers". Please select the another marker type to use this feature.
										</Quote>
									</Column>
								</Row>
							</ConditionalWrapper>

							<ConditionalWrapper visible={shadow.isHasImagesData && !shadow.isLollipopTypePie}>
								<Row>
									<Column>
										<SelectInput
											label={"Image Field"}
											value={configValues.selectedImageDataField}
											isFontSelector={false}
											optionsList={shadow.imagesDataFieldsName.map(d => ({
												label: d,
												value: d
											}))}
											handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.SelectedImageDataField, markerStyleTypes, setConfigValues)}
										/>
									</Column>
								</Row>

								{UIMarkerSizeSettings(shadow, vizOptions, config, setConfigValues)}
							</ConditionalWrapper>
						</Tab>

						<Tab title={"Upload"} identifier={EMarkerShapeTypes.UPLOAD_ICON}>
							<ConditionalWrapper visible={shadow.isLollipopTypePie}>
								<Row>
									<Column>
										<Quote>
											<strong>Note: </strong>This feature not supports the "Pie/Donut/Rose Chart Markers". Please select the another marker type to use this feature.
										</Quote>
									</Column>
								</Row>
							</ConditionalWrapper>

							<ConditionalWrapper visible={!shadow.isLollipopTypePie}>
								<UploadTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} />
								{UIMarkerSizeSettings(shadow, vizOptions, config, setConfigValues)}
							</ConditionalWrapper>
						</Tab>
					</Tabs>
				</Column>
			</Row>
		</>
	)
}

const IconsTab = ({ configValues, markerStyleTypes, setConfigValues, initialStates }) => (
	<Row>
		<Column>
			<IconPicker
				selected={(typeof (configValues || {}).markerShapeValue === "object" && get(configValues, "markerShapeValue.iconName") ? (configValues || {}).markerShapeValue : {}) as IconDefinition}
				defaultSelected={(typeof (initialStates || {}).markerShapeValue === "object" && get(initialStates, "markerShapeValue.iconName") ? (initialStates || {}).markerShapeValue : {}) as IconDefinition}
				handleChange={(icon) => {
					setConfigValues((d) => ({
						...d,
						shapeValue: icon,
						[markerStyleTypes]: {
							...d[markerStyleTypes],
							[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.ICONS_LIST,
							[EMarkerSettings.MarkerShapePath]: icon.icon[4],
							[EMarkerSettings.MarkerShapeValue]: icon,
						}
					}));
				}}
			/>
		</Column>
	</Row>
);

const UploadTab = ({ configValues, markerStyleTypes, setConfigValues }) => (
	<Row>
		<Column>
			<FileUploader
				imageData={configValues[EMarkerSettings.MarkerShapeBase64Url]}
				handleChange={(image) => {
					setConfigValues((d) => ({
						...d,
						[markerStyleTypes]: {
							...d[markerStyleTypes],
							[EMarkerSettings.MarkerShapeBase64Url]: image.image,
							[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.UPLOAD_ICON,
						}
					}));
				}}
				onUploadedFileCleared={() => {
					setConfigValues((d) => ({
						...d,
						[markerStyleTypes]: {
							...d[markerStyleTypes],
							[EMarkerSettings.MarkerShapeBase64Url]: undefined,
							// [EMarkerSettings.MarkerShape]: EMarkerShapeTypes.DEFAULT,
						}
					}))
				}}
			/>
		</Column>
	</Row>
);

const UIMarkerSizeSettings = (shadow: Visual, vizOptions: ShadowUpdateOptions, configValues: IMarkerSettings, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>) => {
	return <>
		<ConditionalWrapper visible={!(configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && shadow.imagesDataFieldsName.length > 0 && shadow.isHasSubcategories)}>
			<Row>
				<Column>
					<ToggleButton
						label={"Auto Marker Size"}
						value={configValues[configValues.markerStyleType].isAutoMarkerSize}
						handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.IsAutoMarkerSize, configValues.markerStyleType, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={!configValues[configValues.markerStyleType].isAutoMarkerSize}>
				<Row appearance="padded">
					<Column>
						<InputControl
							min={1}
							max={50}
							type="number"
							label={"Size"}
							value={configValues[configValues.markerStyleType].markerSize.toString()}
							handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.MarkerSize, configValues.markerStyleType, setConfigValues)}
						/>
					</Column>
					<Column></Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>

		<ConditionalWrapper visible={configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.DEFAULT}>
			<Row>
				<Column>
					<ToggleButton
						label={"Marker Outline"}
						value={configValues[configValues.markerStyleType].isShowMarkerOutline}
						handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.IsShowMarkerOutline, configValues.markerStyleType, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={configValues[configValues.markerStyleType].isShowMarkerOutline}>
				<Row appearance="padded">
					<Column>
						<Row>
							<Column>
								<InputControl
									min={0}
									type="number"
									label={"Width"}
									value={configValues[configValues.markerStyleType].outlineWidth}
									handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.OutlineWidth, configValues.markerStyleType, setConfigValues)}
								/>
							</Column>
							<Column></Column>
						</Row>

						<ConditionalWrapper visible={!configValues[configValues.markerStyleType].sameOutlineAsMarkerColor}>
							<Row>
								<Column>
									<ColorPicker
										label="Color"
										color={configValues[configValues.markerStyleType].outlineColor}
										handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.OutlineColor, configValues.markerStyleType, setConfigValues)}
										colorPalette={vizOptions.host.colorPalette}
										size="sm"
									/>
								</Column>
							</Row>
						</ConditionalWrapper>

						<Row>
							<Column>
								<ToggleButton
									label={"Same color as Marker"}
									value={configValues[configValues.markerStyleType].sameOutlineAsMarkerColor}
									handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.SameOutlineAsMarkerColor, configValues.markerStyleType, setConfigValues)}
									appearance="checkbox"
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<ToggleButton
									label={"Show outline only"}
									value={configValues[configValues.markerStyleType].showOutlineOnly}
									handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.ShowOutlineOnly, configValues.markerStyleType, setConfigValues)}
									appearance="checkbox"
								/>
							</Column>
						</Row>
					</Column>
				</Row>
			</ConditionalWrapper>
		</ConditionalWrapper>
	</>
}

const MarkerSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const MARKER_SETTINGS = JSON.parse(JSON.stringify(MARKER_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...MARKER_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...MARKER_SETTINGS };
	}

	const applyChanges = () => {
		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.UPLOAD_ICON && !configValues[configValues.markerStyleType].markerShapeBase64Url) {
			configValues[configValues.markerStyleType].markerShape = EMarkerShapeTypes.DEFAULT;
		}

		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		if ((shadow as Visual).isHasSubcategories) {
			setConfigValues({ ...MARKER_SETTINGS, markerType: EMarkerTypes.CHART, isAutoLollipopTypeImage: configValues.isAutoLollipopTypeImage });
		} else {
			setConfigValues({ ...MARKER_SETTINGS, isAutoLollipopTypeImage: configValues.isAutoLollipopTypeImage });
		}
	};

	const [configValues, setConfigValues] = React.useState<IMarkerSettings>({
		...initialStates,
	});

	const MARKER_STYLE_TYPES: ILabelValuePair[] = [
		{
			label: shadow.measure1DisplayName.length > 20 ? shadow.measure1DisplayName.slice(0, 20) + "..." : shadow.measure1DisplayName,
			value: EMarkerStyleTypes.Marker1Style,
		},
		{
			label: shadow.measure2DisplayName.length > 20 ? shadow.measure2DisplayName.slice(0, 20) + "..." : shadow.measure2DisplayName,
			value: EMarkerStyleTypes.Marker2Style,
		},
	];

	React.useEffect(() => {
		if (configValues.markerType === EMarkerTypes.CHART && !shadow.isHasSubcategories) {
			handleChange(EMarkerTypes.SHAPE, EMarkerSettings.MarkerType, setConfigValues)
		}

		if (configValues.markerType === EMarkerTypes.SHAPE
			&& configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.DEFAULT
		) {
			if (configValues[configValues.markerStyleType].dropdownMarkerType === EMarkerDefaultShapes.VTRIANGLE && shadow.isHorizontalChart) {
				handleMarkerStyleChange(EMarkerDefaultShapes.HTRIANGLE, EMarkerSettings.DropdownMarkerType, configValues.markerStyleType, setConfigValues)
			}

			if (configValues[configValues.markerStyleType].dropdownMarkerType === EMarkerDefaultShapes.HTRIANGLE && !shadow.isHorizontalChart) {
				handleMarkerStyleChange(EMarkerDefaultShapes.VTRIANGLE, EMarkerSettings.DropdownMarkerType, configValues.markerStyleType, setConfigValues)
			}
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES
			&& (!configValues[configValues.markerStyleType].selectedImageDataField
				|| !shadow.imagesDataFieldsName.includes(configValues[configValues.markerStyleType].selectedImageDataField))
			&& shadow.imagesDataFieldsName.length > 0) {
			handleChange(shadow.imagesDataFieldsName[0], EMarkerSettings.SelectedImageDataField, setConfigValues);
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && shadow.imagesDataFieldsName.length === 0) {
			handleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, setConfigValues);
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && shadow.imagesDataFieldsName.length > 0 && shadow.isLollipopTypePie) {
			handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, configValues.markerStyleType, setConfigValues)
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.UPLOAD_ICON && shadow.isLollipopTypePie) {
			handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, configValues.markerStyleType, setConfigValues)
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.UPLOAD_ICON && !configValues[configValues.markerStyleType].markerShapeBase64Url) {
			handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, configValues.markerStyleType, setConfigValues)
		}

		// if (configValues.marker1Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle1Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }

		// if (configValues.marker2Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle2Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }
	}, []);

	React.useEffect(() => {
		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && shadow.imagesDataFieldsName.length > 0 && shadow.isLollipopTypePie) {
			handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, configValues.markerStyleType, setConfigValues)
		}
	}, [configValues.markerStyleType]);

	return (
		<>
			<ConditionalWrapper visible={!shadow.isHasSubcategories}>
				<ConditionalWrapper visible={shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<SwitchOption
								label={'Select Measure'}
								value={configValues.markerStyleType}
								optionsList={MARKER_STYLE_TYPES}
								handleChange={(value) => handleChange(value, EMarkerSettings.MarkerStyleType, setConfigValues)}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>

				{UIMarkerShapeTypes(shadow, vizOptions, configValues, initialStates, configValues.markerStyleType, setConfigValues)}
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isHasSubcategories}>
				<ConditionalWrapper visible={shadow.isHasMultiMeasure}>
					<Row>
						<Column>
							<SwitchOption
								label={'Select Measure'}
								value={configValues.markerStyleType}
								optionsList={MARKER_STYLE_TYPES}
								handleChange={(value) => handleChange(value, EMarkerSettings.MarkerStyleType, setConfigValues)}
							/>
						</Column>
					</Row>
				</ConditionalWrapper>
				<></>

				{UIMarkerShapeTypes(shadow, vizOptions, configValues, initialStates, configValues.markerStyleType, setConfigValues)}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default MarkerSettings;
