import * as React from "react";
import { SORTING_SETTINGS as SORTING_SETTINGS_IMP } from "../constants";
import { parseObject } from "../methods/methods";
import { ESortByTypes, ESortOrderTypes, ESortingSettings } from "../enum";
import { AccordionAlt, Column, ConditionalWrapper, ESmallMultiplesAxisType, Footer, RadioOption, Row, SelectInput, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, ISortingProps, ISortingSettings } from "../visual-settings.interface";
import { Visual } from "../visual";
import { cloneDeep } from "lodash";

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

const handleDefaultSortByChange = (val, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[ESortingSettings.IsDefaultSortByChanged]: val,
	}));
};

const handleDefaultSortOrderChange = (val, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[ESortingSettings.IsDefaultSortOrderChanged]: val,
	}));
};

const handleChange = (val, n: ESortingSettings, key: ESortingSettings, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	setConfigValues((d) => ({
		...d,
		[key]: {
			...d[key],
			[n]: val,
		},
	}));
};

const handleByCategoryChange = (val, key: ESortingSettings, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	handleChange(val, ESortingSettings.SortBy, key, setConfigValues);
	handleChange(true, ESortingSettings.IsSortByCategory, key, setConfigValues);
	handleChange(false, ESortingSettings.IsSortByMeasure, key, setConfigValues);
	handleChange(false, ESortingSettings.IsSortByExtraSortField, key, setConfigValues);
}

const handleByMeasureChange = (val, key: ESortingSettings, setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>) => {
	handleChange(val, ESortingSettings.SortBy, key, setConfigValues);
	handleChange(false, ESortingSettings.IsSortByCategory, key, setConfigValues);
	handleChange(true, ESortingSettings.IsSortByMeasure, key, setConfigValues);
	handleChange(false, ESortingSettings.IsSortByExtraSortField, key, setConfigValues);
}

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
							handleDefaultSortByChange(true, setConfigValues);
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
						handleChange={(value) => {
							handleDefaultSortOrderChange(true, setConfigValues);
							handleChange(value, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues);
						}}
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
							handleDefaultSortByChange(true, setConfigValues);
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
						handleChange={(value) => {
							handleDefaultSortOrderChange(true, setConfigValues);
							handleChange(value, ESortingSettings.SortOrder, ESortingSettings.SubCategory, setConfigValues);
						}}
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
							handleDefaultSortByChange(true, setConfigValues);
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
						handleChange={(value) => {
							handleDefaultSortOrderChange(true, setConfigValues);
							handleChange(value, ESortingSettings.SortOrder, ESortingSettings.SmallMultiples, setConfigValues);
						}}
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
										handleDefaultSortByChange(true, setConfigValues);
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
									handleChange={(value) => {
										handleDefaultSortOrderChange(true, setConfigValues);
										handleChange(value, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues);
									}}
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

const getCATEGORY_SORT_ON = (shadow: Visual) => {
	const CATEGORY_SORT_ON = [
		{
			label: (shadow as Visual).isExpandAllApplied ? (shadow.categoryDisplayName as string + " ").concat(cloneDeep((shadow as Visual).expandAllCategoriesName).reverse().join(" ")) : shadow.categoryDisplayName,
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

	return CATEGORY_SORT_ON;
}

const getGROUP_BY_SORT_ON = (shadow: Visual) => {
	return [
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

	// if (shadow.isHasMultiMeasure) {
	// 	GROUP_BY_SORT_ON.push({
	// 		label: shadow.measure2DisplayName,
	// 		value: shadow.measure2DisplayName,
	// 		isSortByCategory: false,
	// 		isSortByMeasure: true,
	// 		isSortByExtraSortField: false,
	// 	});
	// }
}

const getSMALL_MULTIPLES_SORT_ON = (shadow: Visual) => {
	return [
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
}

const UIMain = (
	shadow: Visual,
	categorySettings: ISortingProps,
	groupBySettings: ISortingProps,
	smallMultiplesSettings: ISortingProps,
	CATEGORY_SORT_ON: ILabelValuePair[],
	GROUP_BY_SORT_ON: ILabelValuePair[],
	SMALL_MULTIPLES_SORT_ON: ILabelValuePair[],
	setConfigValues: React.Dispatch<React.SetStateAction<ISortingSettings>>,
	closeCurrentSettingHandler,
	applyChanges,
	resetChanges
) => {
	return <>
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
}

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

	const CATEGORY_SORT_ON: ILabelValuePair[] = getCATEGORY_SORT_ON(shadow);
	const GROUP_BY_SORT_ON: ILabelValuePair[] = getGROUP_BY_SORT_ON(shadow);
	const SMALL_MULTIPLES_SORT_ON: ILabelValuePair[] = getSMALL_MULTIPLES_SORT_ON(shadow);

	const isSmallMultipleSortBy = (shadow.isSmallMultiplesEnabled && shadow.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform);

	React.useEffect(() => {
		if (
			(!configValues.category.sortBy ||
				(!CATEGORY_SORT_ON.map(d => d.value).includes(configValues.category.sortBy))) && isSmallMultipleSortBy
		) {
			if (isSmallMultipleSortBy) {
				handleByCategoryChange(shadow.categoryDisplayName, ESortingSettings.Category, setConfigValues);
			} else {
				handleByMeasureChange(shadow.measure1DisplayName, ESortingSettings.Category, setConfigValues);
			}
		}

		if ((!configValues.subCategory.sortBy ||
			(!GROUP_BY_SORT_ON.map(d => d.value).includes(configValues.subCategory.sortBy))) && isSmallMultipleSortBy) {
			handleByCategoryChange(shadow.subCategoryDisplayName, ESortingSettings.SubCategory, setConfigValues);
		}

		if ((!configValues.smallMultiples.sortBy ||
			(!SMALL_MULTIPLES_SORT_ON.map(d => d.value).includes(configValues.smallMultiples.sortBy)))) {
			handleByMeasureChange(shadow.measure1DisplayName, ESortingSettings.SmallMultiples, setConfigValues);
		}

		if ((shadow.isMonthCategoryNames || shadow.isDateCategoryNames || shadow.isXIsDateTimeAxis || shadow.isYIsDateTimeAxis) && !configValues.isDefaultSortByChanged) {
			handleByCategoryChange(shadow.categoryDisplayName, ESortingSettings.Category, setConfigValues);

			if (!configValues.isDefaultSortOrderChanged) {
				handleChange(ESortOrderTypes.ASC, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues);
			}
		}
	}, []);

	React.useEffect(() => {
		if (shadow.isSmallMultiplesEnabled && shadow.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform) {
			handleByCategoryChange(shadow.categoryDisplayName, ESortingSettings.Category, setConfigValues);
		}
	}, []);

	React.useEffect(() => {
		if ((configValues.category.isSortByExtraSortField && ![...shadow.sortFieldsDisplayName, ...shadow.tooltipFieldsDisplayName].find((d) => d.label === configValues.category.sortBy))) {
			handleByMeasureChange(ESortByTypes.VALUE, ESortingSettings.Category, setConfigValues);
		}

		if (
			(!configValues.category.sortBy ||
				(!CATEGORY_SORT_ON.map(d => d.value).includes(configValues.category.sortBy)))
		) {
			if (isSmallMultipleSortBy) {
				handleByCategoryChange(shadow.categoryDisplayName, ESortingSettings.Category, setConfigValues);
			} else {
				handleByMeasureChange(shadow.measure1DisplayName, ESortingSettings.Category, setConfigValues);
			}
		}

		if ((!configValues.subCategory.sortBy ||
			(!GROUP_BY_SORT_ON.map(d => d.value).includes(configValues.subCategory.sortBy)))) {
			handleByCategoryChange(shadow.subCategoryDisplayName, ESortingSettings.SubCategory, setConfigValues);
		}

		if ((!configValues.smallMultiples.sortBy ||
			(!SMALL_MULTIPLES_SORT_ON.map(d => d.value).includes(configValues.smallMultiples.sortBy)))) {
			handleByMeasureChange(shadow.measure1DisplayName, ESortingSettings.SmallMultiples, setConfigValues);
		}

		if ((shadow.isMonthCategoryNames || shadow.isDateCategoryNames || shadow.isXIsDateTimeAxis || shadow.isYIsDateTimeAxis) && !configValues.isDefaultSortByChanged) {
			handleByCategoryChange(shadow.categoryDisplayName, ESortingSettings.Category, setConfigValues);

			if (!configValues.isDefaultSortOrderChanged) {
				handleChange(ESortOrderTypes.ASC, ESortingSettings.SortOrder, ESortingSettings.Category, setConfigValues);
			}
		}
	}, [configValues.category.sortBy]);

	return (
		<>
			{UIMain(shadow, categorySettings, groupBySettings, smallMultiplesSettings, CATEGORY_SORT_ON, GROUP_BY_SORT_ON, SMALL_MULTIPLES_SORT_ON, setConfigValues, closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default SortingSettings;
