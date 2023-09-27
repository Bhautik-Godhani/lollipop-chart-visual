import * as React from "react";
import { IPatternData, InputControl, PatternPicker } from "@truviz/shadow/dist/Components";
import { PATTERN_SETTINGS } from "../constants";
import { Column, ConditionalWrapper, Footer, Row, ToggleButton } from "@truviz/shadow/dist/Components";
import { EPatternSettings } from "../enum";
import { IPatternProps, IPatternSettings } from "../visual-settings.interface";
import PreviewPatterns from "./PreviewPatterns";
import { parseObject } from "../methods/methods";

const handleCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: !d[n],
	}));
};

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[n]: val,
	}));
};

const UIPatternBorderSettings = (
	configValues: IPatternSettings,
	setConfigValues: React.Dispatch<React.SetStateAction<IPatternSettings>>
) => {
	return <>
		<Row>
			<Column>
				<ToggleButton
					id="pattern-options-comp-enable-pattern-border"
					label={"Enable Patterns Border"}
					value={configValues.isPatternBorderEnabled}
					handleChange={(value) => handleChange(value, EPatternSettings.IsPatternBorderEnabled, setConfigValues)}
				/>
			</Column>
		</Row>

		<ConditionalWrapper visible={configValues.isPatternBorderEnabled}>
			<Row appearance="padded">
				<Column>
					<InputControl
						type="number"
						label={"Border width"}
						value={configValues.patternBorderWidth.toString()}
						handleChange={(value) => handleChange(+value, EPatternSettings.PatternBorderWidth, setConfigValues)}
					/>
				</Column>
				<Column></Column>
			</Row>
		</ConditionalWrapper>
	</>
}

const FillPatterns = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

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
				<ConditionalWrapper visible={!shadow.isHasSubcategories}>
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

				<ConditionalWrapper visible={shadow.isHasSubcategories}>
					{configValues.subCategoryPatterns?.map((category, index) => (
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

				{/* {UIPatternBorderSettings(configValues, setConfigValues)} */}
			</ConditionalWrapper>

			{configValues.enabled && (
				<div className="section">
					<p style={{ fontWeight: 500, fontSize: "10px", borderLeft: "2px solid var(--brandColor)", paddingLeft: "8px" }}>
						<b>Note:</b> For custom image fill pattern, use an image with 32*32 pixel or less.
					</p>
				</div>
			)}

			<Footer
				cancelButtonHandler={closeCurrentSettingHandler}
				saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
				resetButtonHandler={resetChanges}
			/>
		</>
	);
};

export default FillPatterns;