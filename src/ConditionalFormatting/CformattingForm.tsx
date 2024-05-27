import React, { useState, useEffect } from "react";
import ConditionRecord from "./ConditionRecord";
import { cloneDeep, isEmpty } from "lodash";
import { Breadcrumb, Column, Footer, InputControl, Label, PopupModHeader, Row, ToggleButton } from "@truviz/shadow/dist/Components";
import { EditIcon } from "../settings-pages/SettingsIcons";
import { ILabelValuePair } from "../visual-settings.interface";
import { ECFApplyOnCategories, EDataRolesName } from "../enum";

const GetCFormattingFormUI = (
  shadow: any,
  isAddNew: boolean,
  isSupportApplyOn: boolean,
  isShowBasedOnValueDropDown: boolean,
  applyOnCategories: string[],
  ruleDetails: any,
  CFConfig,
  isEditableRuleName: boolean,
  dropdownHandler: any,
  measureOptions: any,
  categoryOptions: any,
  inputChangeHandler: any,
  setColorHandler: any,
  handleChangeContent: any,
  closeCurrentSettingHandler: any,
  setRuleDetails: any,
  setIsEditableRuleName: any
) => {
  return <>
    <PopupModHeader
      title={isAddNew ? "Add Rule" : "Edit Rule"}
      icon={"BACK_BUTTON"}
      onIconClickHandler={() => handleChangeContent("homePage")}
      closeSettingsPopup={closeCurrentSettingHandler}
    />

    <Row>
      <Column> <Breadcrumb crumbs={["Conditional Formatting", isAddNew ? "Add Rule" : "Edit Rule"]} /> </Column>
    </Row>

    {
      (isSupportApplyOn && (applyOnCategories && applyOnCategories.length > 0)) && (
        <Row>
          <Column>
            <Label text="Apply On *"></Label>
            <div className="checkbox-group">
              {applyOnCategories.map((d: any) => (
                <>
                  <ToggleButton
                    label={d.label}
                    value={ruleDetails.applyOnCategories.includes(d.value)}
                    handleChange={() => {
                      const newRuleDetails = cloneDeep(ruleDetails);
                      const isCategoryAlreadyAdded: boolean = ruleDetails.applyOnCategories.includes(d.value);

                      if (!isCategoryAlreadyAdded) {
                        newRuleDetails.applyOnCategories.push(d.value);
                      } else {
                        newRuleDetails.applyOnCategories = newRuleDetails.applyOnCategories.filter(r => r !== d.value);
                      }
                      setRuleDetails(newRuleDetails);
                    }}
                    appearance="checkbox"
                  />
                </>
              ))}
            </div>
          </Column>
        </Row>
      )
    }

    <Row>
      <Column style={{ position: "relative" }}>
        <InputControl
          type="text"
          label="Rule Name *"
          value={!isEditableRuleName ? "Auto generated" : (ruleDetails.name.includes("CFR") ? "" : ruleDetails.name)}
          placeholder="Rule name"
          handleChange={(newValue) => inputChangeHandler(newValue, "name")}
          disabled={!isEditableRuleName}
          classNames={["rule-name-input-control"]}
        />

        <div className="edit-input-icon" onClick={() => {
          setIsEditableRuleName(!isEditableRuleName);
          inputChangeHandler(!isEditableRuleName, "isEditableRuleName");
        }}>
          <EditIcon
            fill="var(--activeIconsColor)"
          />
        </div>
      </Column>
    </Row >

    {
      ruleDetails.conditions.map((record, index) => (
        <>
          <ConditionRecord
            record={record}
            index={index}
            dropdownHandler={dropdownHandler}
            measureOptions={measureOptions}
            categoryOptions={categoryOptions}
            inputChangeHandler={inputChangeHandler}
            setColorHandler={setColorHandler}
            shadow={shadow}
            CFConfig={CFConfig}
          />
        </>
      ))
    }
  </>
}

function CformattingForm({
  handleChangeContent,
  addRule,
  measureOptions,
  categoryOptions,
  setApplyTo,
  formDetails,
  ruleIndex,
  shadow,
  closeCurrentSettingHandler,
  CFConfig,
  isSupportApplyOn,
  isShowBasedOnValueDropDown,
  applyOnCategoriesList
}) {
  const isAddNew = isEmpty(formDetails);
  const [isEditableRuleName, setIsEditableRuleName] = useState(formDetails ? (formDetails?.name as string)?.includes("CFR") ? false : true : false);
  const [applyOnCategories, setApplyOnCategories] = useState(applyOnCategoriesList);
  const [ruleDetails, setRuleDetails] = useState(!formDetails ? {
    name: !isEditableRuleName ? `CFR-${new Date().getTime()}` : formDetails?.name,
    isEditableRuleName: false,
    applyOnCategories: [],
    conditions: [
      {
        applyTo: measureOptions.length > 0 ? "measure" : "category",
        sourceName: undefined,
        operator: "===", staticValue: 0, secondaryStaticValue: 0, color: "rgba(65, 164, 255, 1)",
        valueType: 'value', rankingType: 'topN', staticRankingValue: 0, staticPercentValue: 0, secondaryStaticPercentValue: 0,
        categoryType: EDataRolesName.Category,
      },
    ]
  } : { name: !isEditableRuleName ? `CFR-${new Date().getTime()}` : formDetails?.name, ...formDetails });

  useEffect(() => {
    const record = ruleDetails.conditions[0];
    if (record.applyTo === "measure" && (!record.applyTo || !(measureOptions as ILabelValuePair[]).map(d => d.value).includes(record.sourceName))) {
      record.sourceName = measureOptions[0].value;
    }

    if (record.applyTo === "category" && (!record.applyTo || !(categoryOptions as ILabelValuePair[]).map(d => d.value).includes(record.sourceName))) {
      record.sourceName = categoryOptions[0].value;
    }

    setRuleDetails(ruleDetails);
  }, []);

  useEffect(() => {
    setRuleDetails(d => ({
      ...d,
      name: !isEditableRuleName ? `CFR-${new Date().getTime()}` : (formDetails?.name ?? "")
    }));
  }, [isEditableRuleName]);

  useEffect(() => {
    const record = ruleDetails.conditions[0];
    if (shadow.isLollipopTypeCircle) {
      if (record.categoryType === "subCategory") {
        record.categoryType = EDataRolesName.Category;
      }

      if (record.sourceName === shadow.subCategoryDisplayName) {
        record.sourceName = "";
      }
      setRuleDetails(ruleDetails);
    }
  }, []);

  useEffect(() => {
    const record = ruleDetails.conditions[0];
    if (((record.applyTo === "category" && record.sourceName === shadow.subCategoryDisplayName)) ||
      ((record.applyTo === "measure" && record.categoryType === "subCategory"))) {
      setApplyOnCategories(applyOnCategoriesList.filter(d => d.value === ECFApplyOnCategories.Marker));

      if ((ruleDetails.applyOnCategories.includes(ECFApplyOnCategories.Line) || ruleDetails.applyOnCategories.includes(ECFApplyOnCategories.Labels))) {
        setRuleDetails({ ...ruleDetails, applyOnCategories: ruleDetails.applyOnCategories.filter(d => d.value === ECFApplyOnCategories.Marker) });
      }
    } else {
      setApplyOnCategories(applyOnCategoriesList);
    }
  }, [ruleDetails.conditions[0].valueType, ruleDetails.conditions[0].sourceName, ruleDetails.conditions[0].categoryType]);

  const inputChangeHandler = (newValue, name, index?: number) => {
    if (index !== undefined) {
      const newRuleDetails = { ...ruleDetails };
      newRuleDetails.conditions[index][name] = newValue;
      setRuleDetails(newRuleDetails);
    } else {
      setRuleDetails({ ...ruleDetails, [name]: newValue });
    }
  };

  const dropdownHandler = (newValue, name, index) => {
    const newRuleDetails = { ...ruleDetails };
    if (name === "applyTo") {
      const record = newRuleDetails.conditions[0];
      if (newValue === "measure" && (!record.sourceName || !(measureOptions as ILabelValuePair[]).map(d => d.value).includes(record.sourceName))) {
        record.sourceName = measureOptions[0].value;
      }

      if (newValue === "category" && (!record.sourceName || !(categoryOptions as ILabelValuePair[]).map(d => d.value).includes(record.sourceName))) {
        record.sourceName = categoryOptions[0].value;
      }

      setApplyTo(newValue);
    }

    newRuleDetails.conditions[index][name] = newValue;
    setRuleDetails(newRuleDetails);
  };

  const setColorHandler = (color, index) => {
    const newRuleDetails = { ...ruleDetails };
    newRuleDetails.conditions[index]["color"] = color;
    setRuleDetails(newRuleDetails);
  };

  const saveHandler = () => {
    if (formDetails) {
      addRule(ruleDetails, ruleIndex);
    } else {
      addRule(ruleDetails);
    }
    handleChangeContent("homePage");
  };

  return (
    <>
      {GetCFormattingFormUI(shadow, isAddNew, isSupportApplyOn, isShowBasedOnValueDropDown, applyOnCategories, ruleDetails, CFConfig, isEditableRuleName, dropdownHandler, measureOptions, categoryOptions, inputChangeHandler, setColorHandler, handleChangeContent, closeCurrentSettingHandler, setRuleDetails, setIsEditableRuleName)}
      <Footer isShowResetButton={false} resetButtonHandler={() => { }} cancelButtonHandler={() => handleChangeContent("homePage")} saveButtonConfig={{
        text: "Save", handler: saveHandler, isDisabled:
          (ruleDetails.name === "" || isEditableRuleName && ruleDetails.name.includes("CFR") || (isSupportApplyOn && applyOnCategories?.length > 0 && ruleDetails.applyOnCategories.length === 0)) ? true : false
      }} />
    </>
  );
}

export default CformattingForm;