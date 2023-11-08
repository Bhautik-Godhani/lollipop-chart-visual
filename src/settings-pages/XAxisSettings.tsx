/* eslint-disable max-lines-per-function */
import * as React from "react";
import { X_AXIS_SETTINGS as X_AXIS_SETTINGS_IMP } from "../constants";
import { EXAxisSettings, Position } from "../enum";
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
    shadow.persistProperties(sectionName, propertyName, configValues);
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

  return (
    <>
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
      </ConditionalWrapper>

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default XAxisSettings;
