import * as React from "react";
import { RANKING_SETTINGS as RANKING_SETTINGS_IMP } from "../constants";
import {
	AccordionAlt,
	Column,
	ConditionalWrapper,
	Footer,
	InputControl,
	RadioOption,
	Row,
	SelectInput,
	SwitchOption,
	ToggleButton,
} from "@truviz/shadow/dist/Components";
import { ICategoryRankingProps, ILabelValuePair, IRankingSettings } from "../visual-settings.interface";
import { ERankingCalcMethod, ERankingSettings, ERankingSuffix, ERankingType } from "../enum";
import { persistProperties } from "../methods/methods";

const RANKING_TYPES: ILabelValuePair[] = [
	{
		label: "Top N",
		value: ERankingType.TopN,
	},
	{
		label: "Bottom N",
		value: ERankingType.BottomN,
	},
];

const SUFFIX_LIST: ILabelValuePair[] = [
	{
		value: ERankingSuffix.None,
		label: "None",
	},
	{
		value: ERankingSuffix.OthersAndCategoryName,
		label: "Others + Category Name",
	},
	{
		value: ERankingSuffix.OthersAndCount,
		label: "Others + (Count)",
	},
	{
		value: ERankingSuffix.Both,
		label: "Both",
	},
];

const CALC_METHOD_LIST: ILabelValuePair[] = [
	{
		value: ERankingCalcMethod.Sum,
		label: "Sum",
	},
	{
		value: ERankingCalcMethod.Average,
		label: "Average",
	},
];

const handleChange = (val, n, key, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: {
			...d[key],
			[n]: val,
		},
	}));
};

const handleCheckbox = (n, key, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: {
			...d[key],
			[n]: !d[key][n],
		},
	}));
};

const handleColorChange = (rgb, n, key, setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: { ...d[key], [n]: rgb },
	}));
};

const UIByCategoryRankingSettings = (
	type: ERankingSettings.Category | ERankingSettings.SmallMultiples,
	categoryRanking: ICategoryRankingProps,
	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>
) => {
	return (
		<>
			<Row appearance="padded">
				<Column>
					<Row>
						<Column>
							<SwitchOption
								value={categoryRanking.rankingType}
								optionsList={RANKING_TYPES}
								handleChange={(value) => handleChange(value, ERankingSettings.RankingType, type, setConfigValues)}
							/>
						</Column>
					</Row>

					<Row style={{ width: "50%" }}>
						<Column>
							<InputControl
								min={1}
								type="number"
								label="Count"
								value={categoryRanking.count}
								handleChange={(value) => handleChange(value, ERankingSettings.Count, type, setConfigValues)}
							/>
						</Column>
					</Row>
				</Column>
			</Row>

			{UIByCategoryRankingOthersSettings(type, categoryRanking, setConfigValues)}
		</>
	);
};

const UIByCategoryRankingOthersSettings = (
	type: ERankingSettings.Category | ERankingSettings.SmallMultiples,
	categoryRanking: ICategoryRankingProps,
	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Show remaining as 'Others'"}
						value={categoryRanking.showRemainingAsOthers}
						handleChange={() => handleCheckbox(ERankingSettings.ShowRemainingAsOthers, type, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={categoryRanking.showRemainingAsOthers}>
				<Row appearance="padded" disableTopPadding>
					<Column>
						<Row>
							<Column>
								<SelectInput
									label={"Add Suffix"}
									value={categoryRanking.suffix}
									optionsList={SUFFIX_LIST}
									handleChange={(value) => handleChange(value, ERankingSettings.Suffix, type, setConfigValues)}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<RadioOption
									label="Method"
									value={categoryRanking.calcMethod}
									optionsList={CALC_METHOD_LIST}
									handleChange={(value) => handleChange(value, ERankingSettings.CalcMethod, type, setConfigValues)}
								/>
							</Column>
						</Row>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
};

// const UIByGroupRankingSettings = (
// 	vizOptions: ShadowUpdateOptions,
// 	groupByRanking: ISubCategoryRankingProps,
// 	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>
// ) => {
// 	return (
// 		<>
// 			<Row appearance="padded">
// 				<Column>
// 					<Row>
// 						<Column>
// 							<SwitchOption
// 								value={groupByRanking.rankingType}
// 								optionsList={RANKING_TYPES}
// 								handleChange={(value) => handleChange(value, ERankingSettings.RankingType, ERankingSettings.SubCategory, setConfigValues)}
// 							/>
// 						</Column>
// 					</Row>

// 					<Row style={{ width: "50%" }}>
// 						<Column>
// 							<InputControl
// 								min={1}
// 								type="number"
// 								label="Count"
// 								value={groupByRanking.count}
// 								handleChange={(value) => handleChange(value, ERankingSettings.Count, ERankingSettings.SubCategory, setConfigValues)}
// 							/>
// 						</Column>
// 					</Row>
// 				</Column>
// 			</Row>

// 			{/* {UIByGroupRankingOthersSettings(vizOptions, groupByRanking, setConfigValues)} */}
// 		</>
// 	);
// };

// const UIByGroupRankingOthersSettings = (
// 	vizOptions: ShadowUpdateOptions,
// 	groupByRanking: IRankingProps,
// 	setConfigValues: React.Dispatch<React.SetStateAction<IRankingSettings>>
// ) => {
// 	return (
// 		<>
// 			<Row>
// 				<Column>
// 					<ToggleButton
// 						label={"Show remaining as 'Others'"}
// 						value={groupByRanking.showRemainingAsOthers}
// 						handleChange={() => handleCheckbox(ERankingSettings.ShowRemainingAsOthers, ERankingSettings.GroupBy, setConfigValues)}
// 						appearance="toggle"
// 					/>
// 				</Column>
// 			</Row>

// 			<ConditionalWrapper visible={groupByRanking.showRemainingAsOthers}>
// 				<Row>
// 					<Column>
// 						<ColorPicker
// 							label={"'Others' Bar Color"}
// 							color={groupByRanking.othersColor}
// 							handleChange={(value) => handleColorChange(value, ERankingSettings.OthersColor, ERankingSettings.GroupBy, setConfigValues)}
// 							colorPalette={vizOptions.host.colorPalette}
// 						/>
// 					</Column>
// 				</Row>
// 			</ConditionalWrapper>
// 		</>
// 	);
// };

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

const Ranking = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const RANKING_SETTINGS = JSON.parse(JSON.stringify(RANKING_SETTINGS_IMP));
	let initialStates = vizOptions.formatTab[sectionName][propertyName];

	try {
		initialStates = JSON.parse(initialStates);
		initialStates = {
			...RANKING_SETTINGS,
			...initialStates,
		};
	} catch (e) {
		initialStates = { ...RANKING_SETTINGS };
	}

	const applyChanges = () => {
		persistProperties(shadow, sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...RANKING_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState<IRankingSettings>({
		...initialStates,
	});

	const categoryRanking = configValues.category;
	const groupByRanking = configValues.subCategory;
	const SMRanking = configValues.smallMultiples;

	return (
		<>
			<AccordionAlt title="By Category">
				<Row>
					<Column>
						<ToggleButton
							label={"Enable"}
							value={categoryRanking.enabled}
							handleChange={() => handleCheckbox(ERankingSettings.Enabled, ERankingSettings.Category, setConfigValues)}
							appearance="toggle"
						/>
					</Column>
				</Row>

				<ConditionalWrapper visible={categoryRanking.enabled}>
					{UIByCategoryRankingSettings(ERankingSettings.Category, categoryRanking, setConfigValues)}
				</ConditionalWrapper>
			</AccordionAlt>

			{/* <ConditionalWrapper visible={shadow.isHasSubcategories}>
				<AccordionAlt title="By Sub-category">
					<Row>
						<Column>
							<ToggleButton
								label={"Enable"}
								value={groupByRanking.enabled}
								handleChange={() => handleCheckbox(ERankingSettings.Enabled, ERankingSettings.SubCategory, setConfigValues)}
								appearance="toggle"
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={groupByRanking.enabled}>
						{UIByGroupRankingSettings(vizOptions, groupByRanking, setConfigValues)}
					</ConditionalWrapper>
				</AccordionAlt>
			</ConditionalWrapper> */}

			<ConditionalWrapper visible={shadow.isSmallMultiplesEnabled}>
				<AccordionAlt title="By Small Multiples">
					<Row>
						<Column>
							<ToggleButton
								label={"Enable"}
								value={SMRanking.enabled}
								handleChange={() => handleCheckbox(ERankingSettings.Enabled, ERankingSettings.SmallMultiples, setConfigValues)}
								appearance="toggle"
							/>
						</Column>
					</Row>

					<ConditionalWrapper visible={SMRanking.enabled}>
						{UIByCategoryRankingSettings(ERankingSettings.SmallMultiples, SMRanking, setConfigValues)}
					</ConditionalWrapper>
				</AccordionAlt>
			</ConditionalWrapper>

			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default Ranking;
