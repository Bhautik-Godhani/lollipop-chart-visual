/* eslint-disable max-lines-per-function */
import * as React from "react";
import { SORTING_SETTINGS as SORTING_SETTINGS_IMP } from "../constants";
import { parseObject, persistProperties } from "../methods/methods";
import { ESortByTypes, ESortOrderTypes, ESortingSettings } from "../enum";
import { AccordionAlt, Column, ConditionalWrapper, Footer, RadioOption, Row, SelectInput, ToggleButton } from "@truviz/shadow/dist/Components";
import { ILabelValuePair, ISortingProps, ISortingSettings } from "../visual-settings.interface";

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
						<ConditionalWrapper visible={categorySettings.enabled}>
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
						</ConditionalWrapper>
					</Column>
				</Row>
			</ConditionalWrapper>
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
					<ToggleButton
						label={"Enable"}
						value={groupBySettings.enabled}
						handleChange={() => handleCheckbox(ESortingSettings.Enabled, ESortingSettings.SubCategory, setConfigValues)}
						appearance="toggle"
					/>
				</Column>
			</Row>

			<ConditionalWrapper visible={groupBySettings.enabled}>
				<Row appearance="padded">
					<Column>
						<ConditionalWrapper visible={groupBySettings.enabled}>
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
						</ConditionalWrapper>
					</Column>
				</Row>
			</ConditionalWrapper>
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
		persistProperties(shadow, sectionName, propertyName, configValues);
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

	const CATEGORY_SORT_ON: ILabelValuePair[] = [
		{
			label: shadow.categoryDisplayName,
			value: shadow.categoryDisplayName,
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
		{
			label: shadow.measure1DisplayName,
			value: shadow.measure1DisplayName,
			isSortByCategory: false,
			isSortByMeasure: true,
			isSortByExtraSortField: false,
		},
	];

	if (shadow.isHasMultiMeasure) {
		GROUP_BY_SORT_ON.push({
			label: shadow.measure2DisplayName,
			value: shadow.measure2DisplayName,
			isSortByCategory: false,
			isSortByMeasure: true,
			isSortByExtraSortField: false,
		});
	}

	if (shadow.isSortDataFieldsAdded) {
		(shadow.sortFieldsDisplayName as ILabelValuePair[]).forEach((d) => {
			CATEGORY_SORT_ON.push({
				label: d.label,
				value: d.value,
				isSortByCategory: d.isSortByCategory,
				isSortByMeasure: d.isSortByMeasure,
				isSortByExtraSortField: d.isSortByExtraSortField,
			});

			GROUP_BY_SORT_ON.push({
				label: d.label,
				value: d.value,
				isSortByCategory: d.isSortByCategory,
				isSortByMeasure: d.isSortByMeasure,
				isSortByExtraSortField: d.isSortByExtraSortField,
			});
		});
	}

	React.useEffect(() => {
		if (configValues.category.isSortByExtraSortField && !shadow.sortFieldsDisplayName.find((d) => d.label === configValues.category.sortBy)) {
			handleChange(ESortByTypes.VALUE, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
			handleChange(false, ESortingSettings.IsSortByCategory, ESortingSettings.Category, setConfigValues);
			handleChange(true, ESortingSettings.IsSortByMeasure, ESortingSettings.Category, setConfigValues);
			handleChange(false, ESortingSettings.IsSortByExtraSortField, ESortingSettings.Category, setConfigValues);
		}

		if (
			!configValues.category.sortBy ||
			(!([...shadow.measureNames, ...shadow.sortExtraMeasureNames]).includes(configValues.category.sortBy) && configValues.category.isSortByMeasure)
		) {
			handleChange(shadow.measure1DisplayName, ESortingSettings.SortBy, ESortingSettings.Category, setConfigValues);
		}

		if (!configValues.subCategory.sortBy) {
			handleChange(shadow.subCategoryDisplayName, ESortingSettings.SortBy, ESortingSettings.SubCategory, setConfigValues);
		}
	}, []);

	return (
		<>
			<ConditionalWrapper visible={shadow.isHasSubcategories}>
				<AccordionAlt title="By Category">
					{UICategorySortingSettings(categorySettings, CATEGORY_SORT_ON, setConfigValues)}
				</AccordionAlt>

				<AccordionAlt title="By Sub-category">
					{UIGroupBySortingSettings(groupBySettings, GROUP_BY_SORT_ON, setConfigValues)}
				</AccordionAlt>
			</ConditionalWrapper>

			{!shadow.isHasSubcategories && UICategorySortingWithoutAccordionAltSettings(shadow, categorySettings, CATEGORY_SORT_ON, setConfigValues)}
			{UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
		</>
	);
};

export default SortingSettings;
