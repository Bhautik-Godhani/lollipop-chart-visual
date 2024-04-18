import React, { useState, useEffect } from "react";
import { ECFBasedOnValueTypes } from "./ConditionalFormatting.enum";
import { ColorPicker, Column, ConditionalWrapper, InputControl, Label, Quote, Row, SelectInput, SwitchOption } from "@truviz/shadow/dist/Components";
import { measureComparisionOptions, categoryComparisionOptions } from "@truviz/shadow/dist/Components/Editor/constants";

export const rankingTypes = [
  { label: "Top N", kind: "Top", value: "topN" },
  { label: "Bottom N", kind: "Bottom", value: "bottomN" },
]

function ConditionRecord({
  record, index, categoryOptions, measureOptions, dropdownHandler, inputChangeHandler, setColorHandler, shadow, CFConfig
}) {
  const DEFAULT_COLOR = "rgba(65, 164, 255, 1)";

  const isFieldBasedOn = typeof shadow.config?.CFConfig?.fieldsBasedOn != "undefined" ? true : false;
  const fieldsBasedOn = isFieldBasedOn && shadow.config?.CFConfig?.fieldsBasedOn;
  const messageNoteBasedOnField: { fieldName: string, note: string } = shadow.config?.CFConfig?.messageNoteBasedOnField;

  const [pickedColor, setpickedColor] = useState(record.color ? record.color : DEFAULT_COLOR);

  useEffect(() => { if (record.color) { setpickedColor(record.color); } }, [record]);

  const valueTypes = [{ label: "Value", value: "value" }]
  if (isFieldBasedOn) {
    fieldsBasedOn.forEach(d => {
      if (d === ECFBasedOnValueTypes.Ranking) {
        valueTypes.push({ label: "Ranking", value: ECFBasedOnValueTypes.Ranking })
      }
      if (d === ECFBasedOnValueTypes.Percentage) {
        valueTypes.push({ label: "Percentage", value: ECFBasedOnValueTypes.Percentage })
      }
    })
  }
  const rankingTypes = [
    { label: "Top N", value: "topN" },
    { label: "Bottom N", value: "bottomN" },
  ]

  const handleColor = (color) => {
    setpickedColor(color);
    setColorHandler(color, index);
  };

  const applyToDropdownList = [];

  if (measureOptions.length > 0) applyToDropdownList.push({ label: "Measure", value: "measure" });

  if (categoryOptions.length > 0) applyToDropdownList.push({ label: "Category", value: "category" });

  return (
    <>
      <ConditionalWrapper visible={!isFieldBasedOn}>
        {valueCF(applyToDropdownList, record, dropdownHandler, index, measureOptions, categoryOptions, inputChangeHandler, pickedColor, handleColor, shadow, CFConfig)}
      </ConditionalWrapper>
      <ConditionalWrapper visible={isFieldBasedOn}>
        <Row>
          <Column>
            <SelectInput label="Based on" value={record.valueType} optionsList={valueTypes} handleChange={(newValue) => dropdownHandler(newValue, 'valueType', index)} defaultWrapper={false} width="full" />
          </Column>
        </Row>
        {record.valueType === "value" && valueCF(applyToDropdownList, record, dropdownHandler, index, measureOptions, categoryOptions, inputChangeHandler, pickedColor, handleColor, shadow, CFConfig)}
        {record.valueType === "ranking" && rankingCF(rankingTypes, record, dropdownHandler, index, inputChangeHandler, pickedColor, handleColor, shadow)}
        {record.valueType === "percent" && percentCF(record, index, inputChangeHandler, pickedColor, handleColor, shadow, dropdownHandler)}

        <ConditionalWrapper visible={(messageNoteBasedOnField && messageNoteBasedOnField?.fieldName === record.valueType)}>
          <Row>
            <Column>
              <Quote>
                <strong>Note: </strong>{messageNoteBasedOnField?.note}
              </Quote>
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>
    </>
  );
}

const valueCF = (applyToDropdownList, record, dropdownHandler, index, measureOptions, categoryOptions, inputChangeHandler, pickedColor, handleColor, shadow, CFConfig) => {
  const isShowCategoriesTypeDropdown: boolean = CFConfig?.isShowCategoriesTypeDropdown;
  const categoriesList: { label: string, value: string }[] = CFConfig?.categoriesList ?? [];

  return (<>
    <Row>
      <Column>
        {applyToDropdownList.length > 1 && (
          <SwitchOption
            label={"Apply to"}
            value={record.applyTo}
            optionsList={applyToDropdownList}
            handleChange={(selectedOption) => dropdownHandler(selectedOption, "applyTo", index)}
          />
        )}
        {applyToDropdownList.length <= 1 && (
          <Label style={{ marginBottom: "0px" }} text={`Apply To ${applyToDropdownList?.[0]?.label || ""}`} />
        )}
      </Column>
    </Row>

    <ConditionalWrapper visible={record.applyTo == "measure" && isShowCategoriesTypeDropdown && categoriesList.length > 1}>
      <Row>
        <Column>
          <SelectInput
            value={record.categoryType ?? categoriesList[0].value}
            optionsList={categoriesList}
            handleChange={(newValue) => dropdownHandler(newValue, "categoryType", index)}
            defaultWrapper={false}
            width="full"
            label="Select Type"
          />
        </Column>
      </Row>
    </ConditionalWrapper>

    <Row>
      <Column>
        <SelectInput
          value={record.sourceName}
          optionsList={record.applyTo === "measure" ? measureOptions : categoryOptions}
          handleChange={(newValue) => dropdownHandler(newValue, "sourceName", index)}
          defaultWrapper={false}
          width="full"
        />
      </Column>
      <Column>
        <SelectInput
          value={record.operator}
          optionsList={record.applyTo === "measure" ? measureComparisionOptions : categoryComparisionOptions}
          handleChange={(newValue) => dropdownHandler(newValue, "operator", index)}
          defaultWrapper={false}
          width="full"
          maxMenuHeight={110}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <InputControl
          label={record.applyTo == "category" ? "Text" : record.operator === "<>" ? "From" : "Value"}
          type={record.applyTo == "category" ? "text" : "number"}
          min={Number.MIN_SAFE_INTEGER}
          value={record.applyTo === "category" && typeof record.staticValue === "number" ? "" : record.staticValue}
          handleChange={(e) => inputChangeHandler(e, "staticValue", index)}
        />
      </Column>
      <Column>
        {record.applyTo == "measure" && record.operator === "<>" ? (
          <InputControl
            label={"To"}
            type={"number"}
            min={Number.MIN_SAFE_INTEGER}
            value={record.secondaryStaticValue}
            handleChange={(e) => inputChangeHandler(e, "secondaryStaticValue", index)}
          />
        ) : (
          <ColorPicker
            label={"Color"}
            color={pickedColor}
            handleChange={handleColor}
            colorPalette={shadow.colorPalette}
          />
        )}
      </Column>
    </Row>
    {record.applyTo == "measure" && record.operator === "<>" && (
      <Row>
        <Column>
          <ColorPicker
            label={"Color"}
            color={pickedColor}
            handleChange={(color) => handleColor(color)}
            colorPalette={shadow.colorPalette}
          />
        </Column>
      </Row>
    )}
  </>)
}
const rankingCF = (rankingTypes, record, dropdownHandler, index, inputChangeHandler, pickedColor, handleColor, shadow) => {
  return (<>
    <Row>
      <Column>
        <SwitchOption
          label={"Apply to"}
          value={record.rankingType}
          optionsList={rankingTypes}
          handleChange={(selectedOption) => dropdownHandler(selectedOption, "rankingType", index)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <InputControl label="Value" type="number" min={1} value={record.staticRankingValue} handleChange={(e) => inputChangeHandler(e, "staticRankingValue", index)} />
      </Column>
      <Column>
        <ColorPicker label="Color" color={pickedColor} handleChange={handleColor} colorPalette={shadow.colorPalette} />
      </Column>
    </Row>
  </>)
}
const percentCF = (record, index, inputChangeHandler, pickedColor, handleColor, shadow, dropdownHandler) => {
  return (
    <>
      <Row>
        <Column>
          <SelectInput
            value={record.operator}
            optionsList={measureComparisionOptions}
            handleChange={(newValue) => dropdownHandler(newValue, "operator", index)}
            defaultWrapper={false}
            width="full"
            maxMenuHeight={110}
          />
        </Column>
      </Row>
      <ConditionalWrapper visible={record.operator !== '<>'}>
        <Row>
          <Column>
            <InputControl label="Value (in %)" type="number" min={Number.MIN_SAFE_INTEGER} value={record.percentValue} handleChange={(e) => inputChangeHandler(e, "percentValue", index)} />
          </Column>
          <Column>
            <ColorPicker label="Color" color={pickedColor} handleChange={handleColor} colorPalette={shadow.colorPalette} />
          </Column>
        </Row>
      </ConditionalWrapper>
      <ConditionalWrapper visible={record.operator === '<>' || !shadow.config.CFConfig.showPercentageAllOption}>
        <Row>
          <Column>
            <InputControl label="From" type="number" min={Number.MIN_SAFE_INTEGER} value={record.staticPercentValue} handleChange={(e) => inputChangeHandler(e, "staticPercentValue", index)} />
          </Column>
          <Column>
            <InputControl label="To" type="number" min={Number.MIN_SAFE_INTEGER} value={record.secondaryStaticPercentValue} handleChange={(e) => inputChangeHandler(e, "secondaryStaticPercentValue", index)} />
          </Column>
        </Row>
      </ConditionalWrapper>
      <ConditionalWrapper visible={record.operator === '<>'}>
        <Row>
          <Column>
            <ColorPicker label="Color" color={pickedColor} handleChange={handleColor} colorPalette={shadow.colorPalette} />
          </Column>
        </Row>
      </ConditionalWrapper>
    </>
  )
}


export default ConditionRecord;