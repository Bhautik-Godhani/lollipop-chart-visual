import * as React from "react";
import { IPatternData, PatternPicker, Quote } from "@truviz/shadow/dist/Components";
import { PATTERN_SETTINGS as PATTERN_SETTINGS_IMP } from "../constants";
import { Column, ConditionalWrapper, Footer, Row, ToggleButton } from "@truviz/shadow/dist/Components";
import { EPatternSettings } from "../enum";
import { IPatternSettings } from "../visual-settings.interface";
import PreviewPatterns from "./PreviewPatterns";
import { parseObject, persistProperties } from "../methods/methods";
import { Visual } from "../visual";

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
	return <ConditionalWrapper visible={!shadow.isHasSubcategories}>
		{configValues.categoryPatterns.map((category, index) => (
			<PatternPicker
				label={category.name}
				pattern={{ value: category.patternIdentifier, d: category.patternIdentifier }}
				handleChange={(e: IPatternData) => {
					const patterns = [...configValues.categoryPatterns];
					patterns[index].patternIdentifier = e.value;

					if (e.value === "image") {
						patterns[index] = { name: category.name, patternIdentifier: e.d, isImagePattern: true, dimensions: { width: e.w, height: e.h } };
					}

					setConfigValues((d) => ({
						...d,
						[EPatternSettings.CategoryPatterns]: patterns,
					}));
				}}
			/>
		))}
	</ConditionalWrapper>
}

const UISubCategoryPatterns = (shadow: Visual, configValues: IPatternSettings, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	return <ConditionalWrapper visible={shadow.isHasSubcategories}>
		{configValues.subCategoryPatterns.map((category, index) => (
			<PatternPicker
				label={category.name}
				pattern={{ value: category.patternIdentifier, d: category.patternIdentifier }}
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
	</ConditionalWrapper>
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
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		clonedGroupingPatterns.forEach(d => {
			d.patternIdentifier = "NONE";
		});

		setConfigValues({
			...PATTERN_SETTINGS,
			categoryPatterns: shadow.categoryPatterns,
			subCategoryPatterns: shadow.subCategoryPatterns
		});
	};

	const [configValues, setConfigValues] = React.useState<IPatternSettings>({
		...initialStates,
		categoryPatterns: shadow.categoryPatterns,
		subCategoryPatterns: shadow.subCategoryPatterns,
	});

	return (
		<>
			<ConditionalWrapper visible={!shadow.isHasSubcategories}>
				<Row>
					<Column>
						<Quote>
							<strong>Note: </strong>Fill patterns are only supported in case of Sub-category.
						</Quote>
					</Column>
				</Row>
			</ConditionalWrapper>

			<ConditionalWrapper visible={shadow.isHasSubcategories}>
				<Row>
					<Column>
						<ToggleButton
							label={"Enabled"}
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
					{UICategoryPatterns(shadow, configValues, setConfigValues)}
					{UISubCategoryPatterns(shadow, configValues, setConfigValues)}
					{/* {UIPatternBorderSettings(configValues, setConfigValues)} */}
				</ConditionalWrapper>

				{configValues.enabled && (
					<div className="section">
						<p style={{ fontWeight: 500, fontSize: "10px", borderLeft: "2px solid var(--brandColor)", paddingLeft: "8px" }}>
							<b>Note:</b> For custom image fill pattern, use an image with 32*32 pixel or less.
						</p>
					</div>
				)}
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default FillPatterns;
