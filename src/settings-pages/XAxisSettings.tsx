/* eslint-disable max-lines-per-function */
import * as React from "react";
import { X_AXIS_SETTINGS as X_AXIS_SETTINGS_IMP } from "../constants";
import { AxisCategoryType, EXAxisSettings, Position } from "../enum";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  SwitchOption,
  Footer,
  SelectInput,
  ColorPicker,
} from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IXAxisSettings } from "../visual-settings.interface";
import { persistProperties } from "../methods/methods";

const AXIS_MODE: ILabelValuePair[] = [
  {
    label: "Continuous",
    value: AxisCategoryType.Continuous,
  },
  {
    label: "Categorical",
    value: AxisCategoryType.Categorical,
  },
];

const XAxisSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;

  const X_AXIS_SETTINGS = JSON.parse(JSON.stringify(X_AXIS_SETTINGS_IMP));
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...X_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...X_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    if (shadow.isXIsContinuousAxis && configValues.isMinimumRangeEnabled && configValues.isMaximumRangeEnabled) {
      if (configValues.maximumRange < configValues.minimumRange) {
        return;
      }
    }

    persistProperties(shadow, sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...X_AXIS_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<IXAxisSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: rgb,
    }));
  };

  const AXIS_POSITION: ILabelValuePair[] = [
    {
      label: "TOP",
      value: Position.Top,
    },
    {
      label: "BOTTOM",
      value: Position.Bottom,
    }
  ];

  React.useEffect(() => {
    if (configValues.isDisplayTitle) {
      if (configValues.titleName.length === 0) {
        if (shadow.isHasMultiMeasure) {
          handleChange(shadow.measureNames.join(" and "), EXAxisSettings.TitleName);
        } else {
          handleChange(shadow.categoryDisplayName, EXAxisSettings.TitleName);
        }
      }
    }
  }, [configValues.isDisplayTitle]);

  React.useEffect(() => {
    if (configValues.categoryType === AxisCategoryType.Categorical) {
      setConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMinimumRangeEnabled]: false,
      }));

      setConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMaximumRangeEnabled]: false,
      }));
    }
  }, [configValues.categoryType]);

  return (
    <>
      <Row>
        <Column>
          <ToggleButton
            label={"Show X Axis"}
            value={configValues.show}
            handleChange={() => handleCheckbox(EXAxisSettings.Show)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.show}>
        <Row>
          <Column>
            <SwitchOption
              label="Position"
              value={configValues.position}
              optionsList={AXIS_POSITION}
              handleChange={value => handleChange(value, EXAxisSettings.Position)}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!shadow.isHorizontalChart && (shadow.isXIsNumericAxis || shadow.isXIsDateTimeAxis)} >
          <Row>
            <Column>
              <SelectInput
                label={"Axis Mode"}
                value={configValues.categoryType}
                optionsList={AXIS_MODE}
                handleChange={(value) => handleChange(value, EXAxisSettings.CategoryType)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={shadow.isHorizontalChart}>
          <Row>
            <Column>
              <ToggleButton
                label={"Logarithm Scale"}
                value={configValues.isLogarithmScale}
                handleChange={() => handleCheckbox(EXAxisSettings.IsLogarithmScale)}
                appearance="checkbox"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={configValues.categoryType === AxisCategoryType.Continuous}>
          <Row>
            <Column>
              <ToggleButton
                label={"Minimum Range"}
                value={configValues.isMinimumRangeEnabled}
                handleChange={() => handleCheckbox(EXAxisSettings.IsMinimumRangeEnabled)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.isMinimumRangeEnabled}>
            <Row>
              <Column>
                <InputControl
                  min={0}
                  type="number"
                  label=""
                  value={configValues.minimumRange.toString()}
                  handleChange={(value) => handleChange(+value, EXAxisSettings.MinimumRange)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>

          <Row>
            <Column>
              <ToggleButton
                label={"Maximum Range"}
                value={configValues.isMaximumRangeEnabled}
                handleChange={() => handleCheckbox(EXAxisSettings.IsMaximumRangeEnabled)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.isMaximumRangeEnabled}>
            <Row>
              <Column>
                <InputControl
                  min={0}
                  type="number"
                  label=""
                  value={configValues.maximumRange.toString()}
                  handleChange={(value) => handleChange(+value, EXAxisSettings.MaximumRange)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>

          <Row>
            <Column>
              <ToggleButton
                label={"Logarithm Scale"}
                value={configValues.isLogarithmScale}
                handleChange={() => handleCheckbox(EXAxisSettings.IsLogarithmScale)}
                appearance="checkbox"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={!shadow.isHorizontalChart && (shadow.isXIsNumericAxis || shadow.isXIsDateTimeAxis) && configValues.categoryType === AxisCategoryType.Continuous}>
          <Row>
            <Column>
              <ToggleButton
                label={"Invert Range"}
                value={configValues.isInvertRange}
                handleChange={() => handleCheckbox(EXAxisSettings.IsInvertRange)}
                appearance="checkbox"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Axis Line"}
              value={configValues.isShowAxisLine}
              handleChange={() => handleCheckbox(EXAxisSettings.IsShowAxisLine)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ToggleButton
              label={"Show Title"}
              value={configValues.isDisplayTitle}
              handleChange={() => handleCheckbox(EXAxisSettings.IsDisplayTitle)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.isDisplayTitle}>
          <Row>
            <Column>
              <InputControl
                label="Title Name"
                type="text"
                value={configValues.titleName}
                handleChange={(value: any) => handleChange(value, EXAxisSettings.TitleName)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <ColorPicker
                label={"Color"}
                color={configValues.titleColor}
                handleChange={value => handleColor(value, EXAxisSettings.TitleColor)}
                colorPalette={vizOptions.host.colorPalette}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <InputControl
                label="Text Size"
                type="number"
                value={configValues.titleFontSize.toString()}
                handleChange={(value: any) => handleChange(+value, EXAxisSettings.TitleFontSize)}
                min={1}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label={"Font Family"}
                value={configValues.titleFontFamily}
                isFontSelector={true}
                optionsList={[]}
                handleChange={value => handleChange(value, EXAxisSettings.TitleFontFamily)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Show Label"}
              value={configValues.isDisplayLabel}
              handleChange={() => handleCheckbox(EXAxisSettings.IsDisplayLabel)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.isDisplayLabel}>
          <Row>
            <Column>
              <ColorPicker
                label={"Color"}
                color={configValues.labelColor}
                handleChange={value => handleColor(value, EXAxisSettings.LabelColor)}
                colorPalette={vizOptions.host.colorPalette}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label="Font Family"
                value={configValues.labelFontFamily}
                isFontSelector={true}
                optionsList={[]}
                handleChange={value => handleChange(value, EXAxisSettings.LabelFontFamily)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <InputControl
                label="Text Size"
                type="number"
                value={configValues.labelFontSize.toString()}
                handleChange={(value: any) => handleChange(+value, EXAxisSettings.LabelFontSize)}
                min={1}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={!shadow.isHorizontalChart}>
            <Row>
              <Column>
                <ToggleButton
                  label={"Label Auto Tilt"}
                  value={configValues.isLabelAutoTilt}
                  handleChange={() => handleCheckbox(EXAxisSettings.IsLabelAutoTilt)}
                  appearance="toggle"
                />
              </Column>
            </Row>

            <ConditionalWrapper visible={!configValues.isLabelAutoTilt}>
              <Row>
                <Column>
                  <InputControl
                    min={30}
                    max={90}
                    label="Tilt Angle"
                    type="number"
                    value={configValues.labelTilt.toString()}
                    handleChange={(value: any) => handleChange(value, EXAxisSettings.LabelTilt)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>
          </ConditionalWrapper>

          <Row>
            <Column>
              <ToggleButton
                label={"Label Auto Char Limit"}
                value={configValues.isLabelAutoCharLimit}
                handleChange={() => handleCheckbox(EXAxisSettings.IsLabelAutoCharLimit)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={!configValues.isLabelAutoCharLimit}>
            <Row>
              <Column>
                <InputControl
                  min={2}
                  max={50}
                  label="Char Limit"
                  type="number"
                  value={configValues.labelCharLimit.toString()}
                  handleChange={(value: any) => handleChange(value, EXAxisSettings.LabelCharLimit)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </ConditionalWrapper>
      </ConditionalWrapper >

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default XAxisSettings;
