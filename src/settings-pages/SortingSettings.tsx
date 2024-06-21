/* eslint-disable max-lines-per-function */
import * as React from "react";
import { SORTING_SETTINGS as SORTING_SETTINGS_IMP } from "../constants";
import { parseObject } from "../methods/methods";
import { ESortByTypes, ESortOrderTypes, ESortingSettings } from "../enum";
import { AccordionAlt, Column, ConditionalWrapper, ESmallMultiplesAxisType, Footer, RadioOption, Row, SelectInput, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, ISortingProps, ISortingSettings } from "../visual-settings.interface";
import { Visual } from "../visual";

const SORT_ORDER: ILabelValuePair[] = [
	{
		label: "Ascending",
		value: ESortOrderTypes.ASC,
	},
	{
		label: "Descending",
		value: ESortOrderTypes.DESC,
	},
];

const handleChange = (val, n: ESortingSettings, key: ESortingSettings, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: {
			...d[key],
			[n]: val,
		},
	}));
};

const handleCheckbox = (n, key, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: {
			...d[key],
			[n]: !d[key][n],
		},
	}));
};

const UICategorySortingSettings = (
	categorySettings: ISortingProps,
	CATEGORY_SORT_ON: ILabelValuePair[],
	setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Sort By Field"}
						value={categorySettings.sortBy}
						optionsList={CATEGORY_SORT_ON}
						handleChange={(value, obj) => {
							handleChange(value, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
							handleChange(obj.isSortByCategory, ESortingSettings.IsSortByCategory, ESortingSettings.Category, setConfigValues);
							handleChange(obj.isSortByMeasure, ESortingSettings.IsSortByMeasure, ESortingSettings.Category, setConfigValues);
							handleChange(obj.isSortByExtraSortField, ESortingSettings.IsSortByExtraSortField, ESortingSettings.Category, setConfigValues);
						}}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<RadioOption
						label="Order By"
						value={categorySettings.sortOrder}
						optionsList={SORT_ORDER}
						handleChange={(value) => handleChange(value, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UIGroupBySortingSettings = (
	groupBySettings: ISortingProps,
	GROUP_BY_SORT_ON: ILabelValuePair[],
	setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Sort By Field"}
						value={groupBySettings.sortBy}
						optionsList={GROUP_BY_SORT_ON}
						handleChange={(value, obj) => {
							handleChange(value, ESortingSettings.SortBy, ESortingSettings.SubCategory, setConfigValues);
							handleChange(obj.isSortByCategory, ESortingSettings.IsSortByCategory, ESortingSettings.SubCategory, setConfigValues);
							handleChange(obj.isSortByMeasure, ESortingSettings.IsSortByMeasure, ESortingSettings.SubCategory, setConfigValues);
							handleChange(
								obj.isSortByExtraSortField,
								ESortingSettings.IsSortByExtraSortField,
								ESortingSettings.SubCategory,
								setConfigValues
							);
						}}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<RadioOption
						label="Order By"
						value={groupBySettings.sortOrder}
						optionsList={SORT_ORDER}
						handleChange={(value) => handleChange(value, ESortingSettings.SortOrder, ESortingSettings.SubCategory, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UISmallMultiplesSortingSettings = (
	smallMultiplesBySettings: ISortingProps,
	SMALL_MULTIPLES_BY_SORT_ON: ILabelValuePair[],
	setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<SelectInput
						label={"Sort By Field"}
						value={smallMultiplesBySettings.sortBy}
						optionsList={SMALL_MULTIPLES_BY_SORT_ON}
						handleChange={(value, obj) => {
							handleChange(value, ESortingSettings.SortBy, ESortingSettings.SmallMultiples, setConfigValues);
							handleChange(obj.isSortByCategory, ESortingSettings.IsSortByCategory, ESortingSettings.SmallMultiples, setConfigValues);
							handleChange(obj.isSortByMeasure, ESortingSettings.IsSortByMeasure, ESortingSettings.SmallMultiples, setConfigValues);
							handleChange(
								obj.isSortByExtraSortField,
								ESortingSettings.IsSortByExtraSortField,
								ESortingSettings.SubCategory,
								setConfigValues
							);
						}}
					/>
				</Column>
			</Row>

			<Row>
				<Column>
					<RadioOption
						label="Order By"
						value={smallMultiplesBySettings.sortOrder}
						optionsList={SORT_ORDER}
						handleChange={(value) => handleChange(value, ESortingSettings.SortOrder, ESortingSettings.SmallMultiples, setConfigValues)}
					/>
				</Column>
			</Row>
		</>
	);
};

const UICategorySortingWithoutAccordionAltSettings = (
	shadow: any,
	categorySettings: ISortingProps,
	CATEGORY_SORT_ON: ILabelValuePair[],
	setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>
) => {
	return (
		<>
			<Row>
				<Column>
					<ToggleButton
						label={"Enable"}
						value={categorySettings.enabled}
						handleChange={() => handleCheckbox(ESortingSettings.Enabled, ESortingSettings.Category, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={categorySettings.enabled}>
				<Row appearance="padded">
					<Column>
						<Row disableTopPadding>
							<Column>
								<SelectInput
									label={"Sort By Field"}
									value={categorySettings.sortBy}
									optionsList={CATEGORY_SORT_ON}
									handleChange={(value, obj) => {
										handleChange(value, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
										handleChange(obj.isSortByCategory, ESortingSettings.IsSortByCategory, ESortingSettings.Category, setConfigValues);
										handleChange(obj.isSortByMeasure, ESortingSettings.IsSortByMeasure, ESortingSettings.Category, setConfigValues);
										handleChange(obj.isSortByExtraSortField, ESortingSettings.IsSortByExtraSortField, ESortingSettings.Category, setConfigValues);
									}}
								/>
							</Column>
						</Row>

						<Row>
							<Column>
								<RadioOption
									label="Order By"
									value={categorySettings.sortOrder}
									optionsList={SORT_ORDER}
									handleChange={(value) => handleChange(value, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues)}
								/>
							</Column>
						</Row>
					</Column>
				</Row>
			</ConditionalWrapper>
		</>
	);
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

const SortingSettings = (props) => {
	const {
		shadow,
		compConfig: { sectionName, propertyName },
		vizOptions,
		closeCurrentSettingHandler,
	} = props;

	const SORTING_SETTINGS = JSON.parse(JSON.stringify(SORTING_SETTINGS_IMP));
	const _initialStates = vizOptions.formatTab[sectionName][propertyName];
	const initialStates: ISortingSettings = parseObject(_initialStates, SORTING_SETTINGS);

	const applyChanges = () => {
		shadow.persistProperties(sectionName, propertyName, configValues);
		closeCurrentSettingHandler();
	};

	const resetChanges = () => {
		setConfigValues({ ...SORTING_SETTINGS });
	};

	const [configValues, setConfigValues] = React.useState({
		...initialStates,
	});

	const categorySettings = configValues.category;
	const groupBySettings = configValues.subCategory;
	const smallMultiplesSettings = configValues.smallMultiples;

	const CATEGORY_SORT_ON: ILabelValuePair[] = [
		{
			label: (shadow as Visual).isExpandAllApplied ? (shadow.categoryDisplayName as string + " ").concat((shadow as Visual).expandAllCategoriesName.join(" ")) : shadow.categoryDisplayName,
			value: shadow.categoryDisplayName,
			isSortByCategory: true,
			isSortByMeasure: false,
			isSortByExtraSortField: false,
		},
	];

	if (!shadow.isSmallMultiplesEnabled || (shadow.isSmallMultiplesEnabled && shadow.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Individual)) {
		CATEGORY_SORT_ON.push({
			label: shadow.measure1DisplayName,
			value: shadow.measure1DisplayName,
			isSortByCategory: false,
			isSortByMeasure: true,
			isSortByExtraSortField: false,
		})
	}

	if (shadow.isHasMultiMeasure) {
		CATEGORY_SORT_ON.push({
			label: shadow.measure2DisplayName,
			value: shadow.measure2DisplayName,
			isSortByCategory: false,
			isSortByMeasure: true,
			isSortByExtraSortField: false,
		});
	}

	const GROUP_BY_SORT_ON: ILabelValuePair[] = [
		{
			label: shadow.subCategoryDisplayName,
			value: shadow.subCategoryDisplayName,
			isSortByCategory: true,
			isSortByMeasure: false,
			isSortByExtraSortField: false,
		},
		// {
		// 	label: shadow.measure1DisplayName,
		// 	value: shadow.measure1DisplayName,
		// 	isSortByCategory: false,
		// 	isSortByMeasure: true,
		// 	isSortByExtraSortField: false,
		// },
	];

	const SMALL_MULTIPLES_SORT_ON: ILabelValuePair[] = [
		{
			label: shadow.smallMultiplesCategoricalDataSourceName,
			value: shadow.smallMultiplesCategoricalDataSourceName,
			isSortByCategory: true,
			isSortByMeasure: false,
			isSortByExtraSortField: false,
		},
		{
			label: shadow.measure1DisplayName,
			value: shadow.measure1DisplayName,
			isSortByCategory: false,
			isSortByMeasure: true,
			isSortByExtraSortField: false,
		},
	];

	// if (shadow.isHasMultiMeasure) {
	// 	GROUP_BY_SORT_ON.push({
	// 		label: shadow.measure2DisplayName,
	// 		value: shadow.measure2DisplayName,
	// 		isSortByCategory: false,
	// 		isSortByMeasure: true,
	// 		isSortByExtraSortField: false,
	// 	});
	// }

	if (shadow.isSortDataFieldsAdded && !shadow.isSmallMultiplesEnabled) {
		(shadow.sortFieldsDisplayName as ILabelValuePair[]).forEach((d) => {
			CATEGORY_SORT_ON.push({
				label: d.label,
				value: d.value,
				isSortByCategory: d.isSortByCategory,
				isSortByMeasure: d.isSortByMeasure,
				isSortByExtraSortField: d.isSortByExtraSortField,
			});

			// GROUP_BY_SORT_ON.push({
			// 	label: d.label,
			// 	value: d.value,
			// 	isSortByCategory: d.isSortByCategory,
			// 	isSortByMeasure: d.isSortByMeasure,
			// 	isSortByExtraSortField: d.isSortByExtraSortField,
			// });
		});

		(shadow.tooltipFieldsDisplayName as ILabelValuePair[]).forEach((d) => {
			if (!CATEGORY_SORT_ON.find(c => c.value === d.value)) {
				CATEGORY_SORT_ON.push({
					label: d.label,
					value: d.value,
					isSortByCategory: d.isSortByCategory,
					isSortByMeasure: d.isSortByMeasure,
					isSortByExtraSortField: d.isSortByExtraSortField,
				});
			}
		});
	}

	const isSmallMultipleSortBy = !shadow.isSmallMultiplesEnabled || (shadow.isSmallMultiplesEnabled && shadow.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform);

	React.useEffect(() => {
		if (
			(!configValues.category.sortBy ||
				(!CATEGORY_SORT_ON.map(d => d.value).includes(configValues.category.sortBy))) && isSmallMultipleSortBy
		) {
			handleChange(isSmallMultipleSortBy ? shadow.categoryDisplayName : shadow.measure1DisplayName, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
		}

		if ((!configValues.subCategory.sortBy ||
			(!GROUP_BY_SORT_ON.map(d => d.value).includes(configValues.subCategory.sortBy))) && isSmallMultipleSortBy) {
			handleChange(shadow.subCategoryDisplayName, ESortingSettings.SortBy, ESortingSettings.SubCategory, setConfigValues);
		}

		if ((!configValues.smallMultiples.sortBy ||
			(!SMALL_MULTIPLES_SORT_ON.map(d => d.value).includes(configValues.smallMultiples.sortBy)))) {
			handleChange(shadow.measure1DisplayName, ESortingSettings.SortBy, ESortingSettings.SmallMultiples, setConfigValues);
		}
	}, []);

	React.useEffect(() => {
		if (shadow.isSmallMultiplesEnabled && shadow.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
			handleChange(shadow.categoryDisplayName, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
		}
	}, []);

	React.useEffect(() => {
		if ((configValues.category.isSortByExtraSortField && ![...shadow.sortFieldsDisplayName, ...shadow.tooltipFieldsDisplayName].find((d) => d.label === configValues.category.sortBy))) {
			handleChange(ESortByTypes.VALUE, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
			handleChange(false, ESortingSettings.IsSortByCategory, ESortingSettings.Category, setConfigValues);
			handleChange(true, ESortingSettings.IsSortByMeasure, ESortingSettings.Category, setConfigValues);
			handleChange(false, ESortingSettings.IsSortByExtraSortField, ESortingSettings.Category, setConfigValues);
		}

		if (
			(!configValues.category.sortBy ||
				(!CATEGORY_SORT_ON.map(d => d.value).includes(configValues.category.sortBy)))
		) {
			handleChange(isSmallMultipleSortBy ? shadow.categoryDisplayName : shadow.measure1DisplayName, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
		}

		if ((!configValues.subCategory.sortBy ||
			(!GROUP_BY_SORT_ON.map(d => d.value).includes(configValues.subCategory.sortBy)))) {
			handleChange(shadow.subCategoryDisplayName, ESortingSettings.SortBy, ESortingSettings.SubCategory, setConfigValues);
		}

		if ((!configValues.smallMultiples.sortBy ||
			(!SMALL_MULTIPLES_SORT_ON.map(d => d.value).includes(configValues.smallMultiples.sortBy)))) {
			handleChange(shadow.measure1DisplayName, ESortingSettings.SortBy, ESortingSettings.SmallMultiples, setConfigValues);
		}
	}, [configValues.category.sortBy]);

	return (
		<>
			<ConditionalWrapper visible={shadow.isHasSubcategories || shadow.isSmallMultiplesEnabled}>
				<AccordionAlt
					title="By Category"
					showToggle={true}
					toggleValue={categorySettings.enabled}
					onChangeToggle={() => handleCheckbox(ESortingSettings.Enabled, ESortingSettings.Category, setConfigValues)}
				>
					{UICategorySortingSettings(categorySettings, CATEGORY_SORT_ON, setConfigValues)}
				</AccordionAlt>

				<ConditionalWrapper visible={shadow.isHasSubcategories}>
					<AccordionAlt
						title="By Sub-category"
						showToggle={true}
						toggleValue={groupBySettings.enabled}
						onChangeToggle={() => handleCheckbox(ESortingSettings.Enabled, ESortingSettings.SubCategory, setConfigValues)}
					>
						{UIGroupBySortingSettings(groupBySettings, GROUP_BY_SORT_ON, setConfigValues)}
					</AccordionAlt>
				</ConditionalWrapper>

				<ConditionalWrapper visible={shadow.isSmallMultiplesEnabled}>
					<AccordionAlt
						title="By Small Multiples"
						showToggle={true}
						toggleValue={smallMultiplesSettings.enabled}
						onChangeToggle={() => handleCheckbox(ESortingSettings.Enabled, ESortingSettings.SmallMultiples, setConfigValues)}
					>
						{UISmallMultiplesSortingSettings(smallMultiplesSettings, SMALL_MULTIPLES_SORT_ON, setConfigValues)}
					</AccordionAlt>
				</ConditionalWrapper>
			</ConditionalWrapper>

			{(!shadow.isHasSubcategories && !shadow.isSmallMultiplesEnabled) && UICategorySortingWithoutAccordionAltSettings(shadow, categorySettings, CATEGORY_SORT_ON, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default SortingSettings;
