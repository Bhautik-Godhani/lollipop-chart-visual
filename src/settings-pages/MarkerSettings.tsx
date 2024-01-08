/* eslint-disable max-lines-per-function */
import * as React from "react";
import { EMarkerChartTypes, EMarkerSettings, EMarkerShapeTypes, EMarkerStyleTypes, EMarkerTypes } from "../enum";
import { Row, Column, SwitchOption, Footer, ConditionalWrapper, Tabs, Tab, IconPicker, FileUploader, ImageOption, SelectInput, InputControl, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IMarkerSettings } from "../visual-settings.interface";
import { IMarkerData, MarkerPicker } from "./markerSelector";
import { CATEGORY_MARKERS } from "./markers";
import { MARKER_SETTINGS as MARKER_SETTINGS_IMP } from "../constants";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { get } from "lodash";

import PieIcon from "../../assets/icons/PieIcon.svg";
import DonutIcon from "../../assets/icons/donut-icon.svg";
import RoseIcon from "../../assets/icons/rose-icon.svg";
import { Visual } from "../visual";
import { persistProperties } from "../methods/methods";

let MARKERS_LIST: IMarkerData[] = [];

const MARKER_TYPES: ILabelValuePair[] = [
	{
		label: "SHAPE",
		value: EMarkerTypes.SHAPE,
	},
	{
		label: "CHART",
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
		label: "Rose"
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

const UIMarkerShapeTypes = (shadow: Visual, config: IMarkerSettings, initialStates: IMarkerSettings, markerStyleTypes: EMarkerStyleTypes, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>) => {
	const configValues = config[config.markerStyleType];

	return (
		<>
			<ConditionalWrapper visible={shadow.isHasImagesData}>
				<Row disableTopPadding>
					<Column>
						<Tabs selected={configValues.markerShape} onChange={(value) => {
							handleMarkerStyleChange(value, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues)
						}}>
							<Tab title={"Default"} identifier={EMarkerShapeTypes.DEFAULT}>
								<MarkerPicker
									label="Select Marker"
									marker={{ label: configValues.dropdownMarkerType, value: configValues.dropdownMarkerType }}
									handleChange={(e: IMarkerData) => {
										handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues);
										handleMarkerStyleChange(e.value, EMarkerSettings.DropdownMarkerType, markerStyleTypes, setConfigValues);
									}}
									markersList={MARKERS_LIST}
								/>
							</Tab>

							<Tab title={"Images"} identifier={EMarkerShapeTypes.IMAGES}>
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
							</Tab>

							<Tab title={"Icons"} identifier={EMarkerShapeTypes.ICONS_LIST}>
								<IconsTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} initialStates={initialStates} />
							</Tab>
							<Tab title={"Upload"} identifier={EMarkerShapeTypes.UPLOAD_ICON}>
								<UploadTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} />
							</Tab>
						</Tabs>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={!shadow.isHasImagesData}>
				<Row disableTopPadding>
					<Column>
						<Tabs selected={configValues.markerShape} onChange={(value) => {
							handleMarkerStyleChange(value, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues)
						}}>
							<Tab title={"Default"} identifier={EMarkerShapeTypes.DEFAULT}>
								<MarkerPicker
									label="Select Marker"
									marker={{ label: configValues.dropdownMarkerType, value: configValues.dropdownMarkerType }}
									handleChange={(e: IMarkerData) => {
										handleMarkerStyleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, markerStyleTypes, setConfigValues);
										handleMarkerStyleChange(e.value, EMarkerSettings.DropdownMarkerType, markerStyleTypes, setConfigValues);
									}}
									markersList={MARKERS_LIST}
								/>
							</Tab>

							<Tab title={"Icons"} identifier={EMarkerShapeTypes.ICONS_LIST}>
								<IconsTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} initialStates={initialStates} />
							</Tab>
							<Tab title={"Upload"} identifier={EMarkerShapeTypes.UPLOAD_ICON}>
								<UploadTab configValues={configValues} markerStyleTypes={markerStyleTypes} setConfigValues={setConfigValues} />
							</Tab>
						</Tabs>
					</Column>
				</Row>
			</ConditionalWrapper >
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
			/>
		</Column>
	</Row>
);

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
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...MARKER_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IMarkerSettings>({
		...initialStates,
	});

	MARKERS_LIST = [];
	CATEGORY_MARKERS.map((marker) => {
		MARKERS_LIST.push({
			label: marker.label.split("_").join(" ").toLowerCase(),
			value: marker.value,
			paths: marker.paths,
			w: marker.w,
			h: marker.h,
		});
	});

	const MARKER_STYLE_TYPES: ILabelValuePair[] = [
		{
			label: shadow.measure1DisplayName,
			value: EMarkerStyleTypes.Marker1Style,
		},
		{
			label: shadow.measure2DisplayName,
			value: EMarkerStyleTypes.Marker2Style,
		},
	];

	React.useEffect(() => {
		if (configValues.markerType === EMarkerTypes.CHART && !shadow.isHasSubcategories) {
			handleChange(EMarkerTypes.SHAPE, EMarkerSettings.MarkerType, setConfigValues)
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && (!configValues[configValues.markerStyleType].selectedImageDataField || !shadow.imagesDataFieldsName.includes(configValues[configValues.markerStyleType].selectedImageDataField)) && shadow.imagesDataFieldsName.length > 0) {
			handleChange(shadow.imagesDataFieldsName[0], EMarkerSettings.SelectedImageDataField, setConfigValues);
		}

		if (configValues[configValues.markerStyleType].markerShape === EMarkerShapeTypes.IMAGES && shadow.imagesDataFieldsName.length === 0) {
			handleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, setConfigValues);
		}

		// if (configValues.marker1Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle1Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }

		// if (configValues.marker2Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle2Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }
	}, []);

	return (
		<>
			<Row>
				<Column>
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

						{UIMarkerShapeTypes(shadow, configValues, initialStates, configValues.markerStyleType, setConfigValues)}
					</ConditionalWrapper>

					<ConditionalWrapper visible={shadow.isHasSubcategories}>
						<Row disableTopPadding>
							<Column>
								<SwitchOption
									label={"Marker Type"}
									value={configValues.markerType}
									optionsList={MARKER_TYPES}
									handleChange={(value) => handleChange(value, EMarkerSettings.MarkerType, setConfigValues)}
								/>
							</Column>
						</Row>

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

						<ConditionalWrapper visible={configValues.markerType === EMarkerTypes.SHAPE}>
							{UIMarkerShapeTypes(shadow, configValues, initialStates, configValues.markerStyleType, setConfigValues)}
						</ConditionalWrapper>

						<ConditionalWrapper visible={configValues.markerType === EMarkerTypes.CHART}>
							<Row>
								<Column>
									<ImageOption
										isShowImageTooltip={true}
										value={configValues[configValues.markerStyleType].markerChart}
										images={MARKER_CHART_TYPES}
										handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.MarkerChart, configValues.markerStyleType, setConfigValues)}
									/>
								</Column>
							</Row>
						</ConditionalWrapper>
					</ConditionalWrapper>

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
									min={0}
									type="number"
									label={"Size"}
									value={configValues[configValues.markerStyleType].markerSize.toString()}
									handleChange={(value) => handleMarkerStyleChange(value, EMarkerSettings.MarkerSize, configValues.markerStyleType, setConfigValues)}
								/>
							</Column>
							<Column></Column>
						</Row>
					</ConditionalWrapper>

					{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
				</Column >
			</Row >
		</>
	);
};

export default MarkerSettings;
