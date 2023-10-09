/* eslint-disable max-lines-per-function */
import * as React from "react";
import { EAutoCustomTypes, EMarkerChartTypes, EMarkerSettings, EMarkerShapeTypes, EMarkerStyleProps, EMarkerStyleTypes, EMarkerTypes, PieType } from "../enum";
import { Row, Column, SwitchOption, Footer, ConditionalWrapper, Tabs, Tab, IconPicker, FileUploader, ImageOption, RadioOption, SelectInput, InputControl } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IMarkerSettings } from "../visual-settings.interface";
import { IMarkerData, MarkerPicker } from "./markerSelector";
import { CATEGORY_MARKERS } from "./markers";
import { MARKER_SETTINGS as MARKER_SETTINGS_IMP } from "../constants";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { get } from "lodash";
import { MarkerShape } from "powerbi-visuals-utils-chartutils/lib/legend/legendInterfaces";

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
		image: "",
		value: EMarkerChartTypes.PIE,
		key: "Pie",
		label: "Pie"
	},
	{
		image: "",
		value: EMarkerChartTypes.DONUT,
		key: "Donut",
		label: "Donut"
	},
	{
		image: "",
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

const handlePieTypeChange = (val, n, setPieConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>): void => {
	setPieConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const handleCheckbox = (
	key: string,
	setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>
): void => {
	setConfigValues((d: any) => ({
		...d,
		[key]: !d[key]
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

const UIMarkerShapeTypes = (configValues: IMarkerSettings, initialStates: IMarkerSettings, setConfigValues: React.Dispatch<React.SetStateAction<IMarkerSettings>>) => {
	return (
		<Row>
			<Column>
				<Tabs selected={configValues.markerShape} onChange={(value) => {
					handleChange(value, EMarkerSettings.MarkerShape, setConfigValues)
				}}>
					<Tab title={"Default"} identifier={EMarkerShapeTypes.DEFAULT}>
						<MarkerPicker
							marker={{ label: configValues.dropdownMarkerType, value: configValues.dropdownMarkerType }}
							handleChange={(e: IMarkerData) => {
								handleChange(EMarkerShapeTypes.DEFAULT, EMarkerSettings.MarkerShape, setConfigValues);
								handleChange(e.value, EMarkerSettings.DropdownMarkerType, setConfigValues);
							}}
							markersList={MARKERS_LIST}
						/>
					</Tab>
					<Tab title={"Icons"} identifier={EMarkerShapeTypes.ICONS_LIST}>
						<IconsTab configValues={configValues} setConfigValues={setConfigValues} initialStates={initialStates} />
					</Tab>
					<Tab title={"Upload"} identifier={EMarkerShapeTypes.UPLOAD_ICON}>
						<UploadTab configValues={configValues} setConfigValues={setConfigValues} />
					</Tab>
				</Tabs>
			</Column>
		</Row>
	)
}

const IconsTab = ({ configValues, setConfigValues, initialStates }) => (
	<Row>
		<Column>
			<IconPicker
				selected={(typeof (configValues || {}).markerShapeValue === "object" && get(configValues, "markerShapeValue.iconName") ? (configValues || {}).markerShapeValue : {}) as IconDefinition}
				defaultSelected={(typeof (initialStates || {}).markerShapeValue === "object" && get(initialStates, "markerShapeValue.iconName") ? (initialStates || {}).markerShapeValue : {}) as IconDefinition}
				handleChange={(icon) => {
					setConfigValues((d) => ({
						...d,
						shapeValue: icon,
						[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.ICONS_LIST,
						[EMarkerSettings.MarkerShapePath]: icon.icon[4],
						[EMarkerSettings.MarkerShapeValue]: icon,
					}));
				}}
			/>
		</Column>
	</Row>
);

const UploadTab = ({ configValues, setConfigValues }) => (
	<Row style={{ width: "312px" }}>
		<Column>
			<FileUploader
				imageData={configValues[EMarkerSettings.MarkerShapeBase64Url]}
				handleChange={(image) => {
					setConfigValues((d) => ({
						...d,
						[EMarkerSettings.MarkerShapeBase64Url]: image.image,
						[EMarkerSettings.MarkerShape]: EMarkerShapeTypes.UPLOAD_ICON,
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
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...MARKER_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IMarkerSettings>({
		...initialStates,
	});

	const [isHasSubCategories] = React.useState(shadow.isHasSubcategories);

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

		// if (configValues.marker1Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle1Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }

		// if (configValues.marker2Style.size === 0) {
		// 	handleMarkerStyleChange(shadow.circle2Size, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)
		// }
	}, []);

	return (
		<>
			<Row style={{ width: "312px" }}>
				<Column>

					<ConditionalWrapper visible={!shadow.isHasSubcategories}>
						{UIMarkerShapeTypes(configValues, initialStates, setConfigValues)}
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

						<ConditionalWrapper visible={configValues.markerType === EMarkerTypes.SHAPE}>
							{UIMarkerShapeTypes(configValues, initialStates, setConfigValues)}
						</ConditionalWrapper>

						<ConditionalWrapper visible={configValues.markerType === EMarkerTypes.CHART}>
							<Row>
								<Column>
									<ImageOption
										isShowImageTooltip={true}
										value={configValues.markerChart}
										images={MARKER_CHART_TYPES}
										handleChange={(value) => handleChange(value, EMarkerSettings.MarkerChart, setConfigValues)}
									/>
								</Column>
							</Row>
						</ConditionalWrapper>
					</ConditionalWrapper>

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

					<Row>
						<Column>
							<SelectInput
								label={"Size Type"}
								value={configValues[configValues.markerStyleType].sizeType}
								optionsList={AUTO_CUSTOM_TYPES}
								handleChange={(value) => handleMarkerStyleChange(value, EMarkerStyleProps.SizeType, configValues.markerStyleType, setConfigValues)}
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={configValues[configValues.markerStyleType].sizeType === EAutoCustomTypes.Custom}>
						<Row>
							<Column>
								<InputControl
									min={0}
									type="number"
									label={"Size"}
									value={configValues[configValues.markerStyleType].size.toString()}
									handleChange={(value) => handleMarkerStyleChange(value, EMarkerStyleProps.Size, configValues.markerStyleType, setConfigValues)}
								/>
							</Column>
						</Row>
					</ConditionalWrapper>

					{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
				</Column>
			</Row>
		</>
	);
};

export default MarkerSettings;
