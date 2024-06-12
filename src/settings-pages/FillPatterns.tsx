/* eslint-disable max-lines-per-function */
import * as React from "react";
import { IPatternData, PatternPicker, Quote, SelectInput } from "@truviz/shadow/dist/Components";
import { PATTERN_SETTINGS as PATTERN_SETTINGS_IMP } from "../constants";
import { Column, ConditionalWrapper, Footer, Row, ToggleButton } from "@truviz/shadow/dist/Components";
import { ColorPaletteType, EMarkerShapeTypes, EPatternByDataTypes, EPatternSettings } from "../enum";
import { ILabelValuePair, IMarkerSettings, IPatternSettings } from "../visual-settings.interface";
import PreviewPatterns from "./PreviewPatterns";
import { parseObject, persistProperties } from "../methods/methods";
import { Visual } from "../visual";

const BASED_ON_TYPES: ILabelValuePair[] = [
	{
		value: EPatternByDataTypes.ByMeasures,
		label: "By Measures"
	},
	{
		value: EPatternByDataTypes.BySubCategory,
		label: "By Sub Category"
	}
];

const handleCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: !d[n],
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

const UICategoryPatterns = (shadow: Visual, configValues: IPatternSettings, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	return <>{
		configValues.categoryPatterns.map((category, index) => (
			<PatternPicker
				label={shadow.getTooltipCategoryText(category.name, false)}
				pattern={{ value: category.patternIdentifier, d: category.patternIdentifier }}
				imageUploadIconTooltip="Upload the pattern image"
				handleChange={(e: IPatternData) => {
					const patterns = [...configValues.categoryPatterns];
					patterns[index].patternIdentifier = e.value;

					if (e.value === "image") {
						patterns[index] = { name: category.name, patternIdentifier: e.d, isImagePattern: true, dimensions: { width: e.w, height: e.h } };
					} else {
						patterns[index].isImagePattern = false;
						patterns[index].dimensions = { width: undefined, height: undefined };
					}

					setConfigValues((d) => ({
						...d,
						[EPatternSettings.CategoryPatterns]: patterns,
					}));
				}}
			/>
		))
	}</>
}

const UISubCategoryPatterns = (shadow: Visual, configValues: IPatternSettings, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	return <>
		{configValues.subCategoryPatterns.map((category, index) => (
			<PatternPicker
				label={shadow.getTooltipCategoryText(category.name, false)}
				pattern={{ value: category.patternIdentifier, d: category.patternIdentifier }}
				imageUploadIconTooltip="Upload the pattern image"
				handleChange={(e: IPatternData) => {
					const patterns = [...configValues.subCategoryPatterns];
					patterns[index].patternIdentifier = e.value;

					if (e.value === "image") {
						patterns[index] = { name: category.name, patternIdentifier: e.d, isImagePattern: true, dimensions: { width: e.w, height: e.h } };
					}

					setConfigValues((d) => ({
						...d,
						[EPatternSettings.SubcategoryPatterns]: patterns,
					}));
				}}
			/>
		))}
	</>
}

const UIMultipleMeasuresPatterns = (shadow: Visual, configValues: IPatternSettings, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	return <>
		{configValues.measuresPatterns.map((category, index) => (
			<PatternPicker
				label={shadow.getTooltipCategoryText(category.name, false)}
				pattern={{ value: category.patternIdentifier, d: category.patternIdentifier }}
				handleChange={(e: IPatternData) => {
					const patterns = [...configValues.measuresPatterns];
					patterns[index].patternIdentifier = e.value;

					if (e.value === "image") {
						patterns[index] = { name: category.name, patternIdentifier: e.d, isImagePattern: true, dimensions: { width: e.w, height: e.h } };
					}

					setConfigValues((d) => ({
						...d,
						[EPatternSettings.MeasuresPatterns]: patterns,
					}));
				}}
			/>
		))}
	</>
}

const FillPatterns = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const PATTERN_SETTINGS = JSON.parse(JSON.stringify(PATTERN_SETTINGS_IMP));
	const _initialStates = vizOptions.formatTab[sectionName][propertyName];
	const initialStates: typeof PATTERN_SETTINGS = parseObject(_initialStates, PATTERN_SETTINGS);
	const clonedGroupingPatterns = shadow.categoryPatterns;

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		clonedGroupingPatterns.forEach(d => {
			d.patternIdentifier = "NONE";
		});

		setConfigValues({
			...PATTERN_SETTINGS,
			categoryPatterns: shadow.categoryPatterns,
			measuresPatterns: shadow.measuresPatterns,
			subCategoryPatterns: shadow.subCategoryPatterns
		});
	};

	const [configValues, setConfigValues] = React.useState<IPatternSettings>({
		...initialStates,
		categoryPatterns: shadow.categoryPatterns,
		measuresPatterns: shadow.measuresPatterns,
		subCategoryPatterns: shadow.subCategoryPatterns,
	});

	const markerSettings: IMarkerSettings = (shadow as Visual).markerSettings;
	const isShowNote: boolean = (!shadow.isHasMultiMeasure && markerSettings.marker1Style.markerShape !== EMarkerShapeTypes.DEFAULT) ||
		(shadow.isHasMultiMeasure ? (markerSettings.marker1Style.markerShape !== EMarkerShapeTypes.DEFAULT || markerSettings.marker2Style.markerShape !== EMarkerShapeTypes.DEFAULT) : false);

	return (
		<>
			{/* <ConditionalWrapper visible={(!shadow.isLollipopTypePie && !shadow.isHasMultiMeasure)}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>Fill patterns are only supported in the case of Pie/Rose/Donut markers and multiple measures.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper> */}

			{/* <ConditionalWrapper visible={shadow.isLollipopTypePie || shadow.isHasMultiMeasure}> */}
			<ConditionalWrapper visible={isShowNote}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>Please select default marker to use this feature.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={!isShowNote}>
				<Row>
					<Column>
						<ToggleButton
							label={"Enable"}
							value={configValues.enabled}
							handleChange={() => handleCheckbox(EPatternSettings.Enabled, setConfigValues)}
							appearance="toggle"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={!configValues.enabled}>
					<div className="section section-preview-image">
						<PreviewPatterns />
					</div>
				</ConditionalWrapper>

				<ConditionalWrapper visible={configValues.enabled}>
					<ConditionalWrapper visible={(!shadow.isHasMultiMeasure && markerSettings.marker1Style.markerShape === EMarkerShapeTypes.DEFAULT) ||
						(shadow.isHasMultiMeasure ? (markerSettings.marker1Style.markerShape === EMarkerShapeTypes.DEFAULT && markerSettings.marker2Style.markerShape === EMarkerShapeTypes.DEFAULT) : false)}>
						<ConditionalWrapper visible={shadow.isHasMultiMeasure && shadow.isLollipopTypePie}>
							<Row>
								<Column>
									<SelectInput
										label={"Based On"}
										value={configValues.basedOn}
										optionsList={BASED_ON_TYPES}
										handleChange={(value) => {
											setConfigValues((d) => ({
												...d,
												[EPatternSettings.BasedOn]: value,
											}));
										}}
									/>
								</Column>
							</Row>

							{configValues.basedOn === EPatternByDataTypes.ByMeasures && (
								UIMultipleMeasuresPatterns(shadow, configValues, setConfigValues)
							)}

							{configValues.basedOn === EPatternByDataTypes.BySubCategory && (
								UISubCategoryPatterns(shadow, configValues, setConfigValues)
							)}
						</ConditionalWrapper>

						<ConditionalWrapper visible={!shadow.isHasMultiMeasure || !shadow.isLollipopTypePie}>
							<Row disableTopPadding classNames={["normal-text-overflow"]}>
								<Column>
									{(shadow as Visual).isLollipopTypeCircle && (
										UICategoryPatterns(shadow, configValues, setConfigValues)
									)}

									{shadow.isLollipopTypePie && (
										UISubCategoryPatterns(shadow, configValues, setConfigValues)
									)}

									{/* {((shadow.isHasMultiMeasure && !shadow.isLollipopTypePie) || (shadow.isLollipopTypePie && (shadow as Visual).dataColorsSettings.fillType === ColorPaletteType.Single)) && (
										UIMultipleMeasuresPatterns(shadow, configValues, setConfigValues)
									)} */}
								</Column>
							</Row>
						</ConditionalWrapper>

						{configValues.enabled && (
							<div className="section">
								<p style={{ fontWeight: 500, fontSize: "10px", borderLeft: "2px solid var(--brandColor)", paddingLeft: "8px" }}>
									<b>Note:</b> For custom image fill pattern, use an image with 32*32 pixel or less.
								</p>
							</div>
						)}
					</ConditionalWrapper>

					{/* {UIPatternBorderSettings(configValues, setConfigValues)} */}
				</ConditionalWrapper>
			</ConditionalWrapper>



			{/* </ConditionalWrapper> */}

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default FillPatterns;
