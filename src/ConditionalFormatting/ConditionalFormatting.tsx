import React, { useState, useEffect, useMemo } from "react";
import CformattingForm from "./CformattingForm";
import HomePage from "./HomePage";
import { Button } from "@truviz/shadow/dist/Components";
import { ILabelValuePair } from "../visual-settings.interface";

const EmptyDataMessage = (closeCurrentSettingHandler) => (
  <>
    <div className="config-options-wrapper">
      <div className="section">
        <p className="config-label">Conditional Formatting can only be used when either measure or category data is added.</p>
      </div>
    </div>
    <div className={`config-btn-wrapper flex-end`}>
      <div className="btn-group">
        <Button
          text={"Cancel"}
          variant={"secondary"}
          clickHandler={() => closeCurrentSettingHandler()}
        />
        <Button
          text={"Save"}
          variant={"primary"}
          disabled={true}
          clickHandler={() => { }}
        />
      </div>
    </div>
  </>
)

const getMeasureOptions = (vizOptions, config) => {
  const dataViewValues = [];
  const dataView = vizOptions.options.dataViews[0];
  config.valueRole.forEach((role) => {
    let dvValue;
    if (dataView.categorical) {
      if (config.categoricalGroupByRole && config.categoricalGroupByRole.length > 0) {
        dvValue = dataView.categorical?.values?.grouped()[0]?.values?.filter(
          (value) => value.source.roles[role]
        );
      }
      else {
        dvValue = dataView.categorical?.values?.filter(
          (value) => value.source.roles[role]
        );
      }
    }
    else if (dataView.matrix) {
      dvValue = dataView.matrix.valueSources?.filter(
        (value) => value.roles[role]
      );
    }
    if (dvValue && dvValue.length > 0) {
      dataViewValues.push(...dvValue);
    }
  });
  const retValue = dataViewValues.map((option) => {
    if (dataView.categorical) {
      return { label: option.source.displayName, value: option.source.displayName };
    }
    else if (dataView.matrix) {
      return { label: option.displayName, value: option.displayName }
    }
  });
  return retValue;
}

const getCategoryOptions = (vizOptions, config) => {
  const dataViewValues = [];
  const dataView = vizOptions.options.dataViews[0];
  config.measureRole.forEach((role) => {
    let dvValue;
    if (dataView.categorical) {
      dvValue = vizOptions.options.dataViews[0].categorical?.categories?.filter(
        (value) => value.source.roles[role]
      );
    }
    else if (dataView.matrix) {
      dvValue = dataView.matrix.rows.levels?.filter(
        (value) => value.sources[0].roles[role]
      );
    }
    if (dvValue && dvValue.length > 0) {
      dataViewValues.push(...dvValue);
    }
  });

  config.categoricalGroupByRole && config.categoricalGroupByRole.forEach((role) => {
    const groupByDataviewValues = vizOptions.options.dataViews[0].categorical?.values;
    if (groupByDataviewValues.source && groupByDataviewValues.source.roles[role]) {
      dataViewValues.push(groupByDataviewValues);
    }
  });

  const retValue = dataViewValues.map((option) => {
    if (dataView.categorical) {
      return { label: option.source.displayName, value: option.source.displayName };
    }
    else if (dataView.matrix) {
      return { label: option.sources[0].displayName, value: option.sources[0].displayName };
    }
  });

  return retValue;
}

const ConditionalFormatting = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
    icon
  } = props;

  const config = shadow.config;

  const isSupportApplyOn: boolean = config.CFConfig?.isSupportApplyOn;
  const isShowBasedOnValueDropDown: boolean = config.CFConfig?.isShowBasedOnValueDropDown;
  const applyOnCategories: { label: string, value: string }[] = config.CFConfig?.applyOnCategories ?? [];
  // const isShowCategoriesDropdown: boolean = config.CFConfig?.isShowCategoriesDropdown;
  // const categoriesList: { label: string, value: string }[] = config.CFConfig?.categoriesList ?? [];

  const [applyTo, setApplyTo] = useState("category");

  const measureOptions: ILabelValuePair[] = useMemo(() => {
    const measureOptions = getMeasureOptions(vizOptions, config);
    return measureOptions;
  }, [config.valueRole, applyTo, vizOptions.options.dataViews[0].categorical ? vizOptions.options.dataViews[0].categorical : vizOptions.options.dataViews[0].matrix]);

  const categoryOptions = useMemo(() => {
    const categoryOptions = getCategoryOptions(vizOptions, config);
    return categoryOptions;
  }, [config.valueRole, applyTo, vizOptions.options.dataViews[0].categorical ? vizOptions.options.dataViews[0].categorical : vizOptions.options.dataViews[0].matrix]);

  const [contentShown, setContentShown] = useState("homePage");
  const [rules, setRules] = useState([]);
  const [formDetails, setFormDetails] = useState("");
  const [ruleIndex, setRuleIndex] = useState("");
  const [selectedApplyOnCategory, setSelectedApplyOnCategory] = React.useState("all");

  useEffect(() => {
    let retrievedRules = vizOptions.formatTab?.[sectionName]?.[propertyName];
    if (Object.keys(retrievedRules).length !== 0) {
      retrievedRules = JSON.parse(retrievedRules);
      retrievedRules = retrievedRules?.values;
      if (retrievedRules) {
        setRules(retrievedRules);
      }
    }
  }, []);

  const addRule = (rule, index) => {
    setFormDetails("");
    setRuleIndex("");
    const newRules = [...rules];
    if (index !== undefined) {
      newRules.splice(index, 1, rule);
    } else {
      newRules.push(rule);
    }
    setRules(newRules);
    shadow.persistProperties(sectionName, propertyName, { values: newRules });
  };

  const deleteRule = (index) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
    shadow.persistProperties(sectionName, propertyName, { values: newRules });
  };

  const editRule = (index) => {
    setRuleIndex(index);
    setFormDetails(rules[index]);
    handleChangeContent("form");
  };

  const handleChangeContent = (content) => {
    setContentShown(content);
  };

  const createRule = () => {
    handleChangeContent("form");
    setFormDetails("");
  }

  const updateRules = (updatedRules) => {
    shadow.persistProperties(sectionName, propertyName, { values: [...updatedRules] });
  }

  if ((!Array.isArray(measureOptions) || measureOptions.length === 0) && (!Array.isArray(categoryOptions) || categoryOptions.length === 0)) {
    return <EmptyDataMessage closeCurrentSettingHandler={closeCurrentSettingHandler} />;
  }

  return (
    <>
      {contentShown === "homePage" ?
        <HomePage
          createRule={createRule}
          rules={rules}
          setRules={setRules}
          addRule={addRule}
          updateRules={updateRules}
          deleteRule={deleteRule}
          editRule={editRule}
          conditionalFormattingIcon={icon}
          closeCurrentSettingHandler={closeCurrentSettingHandler}
          isSupportApplyOn={isSupportApplyOn}
          applyOnCategories={applyOnCategories}
          setSelectedApplyOnCategoryState={setSelectedApplyOnCategory}
        />
        :
        <CformattingForm
          addRule={addRule}
          handleChangeContent={handleChangeContent}
          measureOptions={measureOptions}
          categoryOptions={categoryOptions}
          setApplyTo={setApplyTo}
          formDetails={formDetails}
          ruleIndex={ruleIndex}
          shadow={shadow}
          closeCurrentSettingHandler={closeCurrentSettingHandler}
          CFConfig={config.CFConfig}
          isSupportApplyOn={isSupportApplyOn}
          isShowBasedOnValueDropDown={isShowBasedOnValueDropDown}
          applyOnCategoriesList={applyOnCategories}
          selectedApplyOnCategory={selectedApplyOnCategory}
          setSelectedApplyOnCategoryState={setSelectedApplyOnCategory}
        />
      }
    </>
  );
}

export default ConditionalFormatting;