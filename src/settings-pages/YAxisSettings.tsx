import * as React from "react";
import { Y_AXIS_SETTINGS } from "../constants";
import {
  EVisualConfig,
  EVisualSettings,
  EYAxisSettings,
  Position,
} from "../enum";
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
import { IChartSettings, ILabelValuePair, IYAxisSettings } from "../visual-settings.interface";

const YAxisSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    config,
    vizOptions,
    closeCurrentSettingHandler,
    closeAdvancedSettingsHandler,
  } = props;
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...Y_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...Y_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...Y_AXIS_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<IYAxisSettings>({
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
      label: "LEFT",
      value: Position.Left,
    },
    {
      label: "RIGHT",
      value: Position.Right,
    },
  ];

  return (
    <>
      <Row>
        <Column>
          <SwitchOption
            label="Position"
            value={configValues.position}
            optionsList={AXIS_POSITION}
            handleChange={value => handleChange(value, EYAxisSettings.Position)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Title"}
            value={configValues.isDisplayTitle}
            handleChange={() => handleCheckbox(EYAxisSettings.IsDisplayTitle)}
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
              handleChange={(value: any) => handleChange(value, EYAxisSettings.TitleName)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={configValues.titleColor}
              handleChange={value => handleColor(value, EYAxisSettings.TitleColor)}
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
              handleChange={(value: any) => handleChange(+value, EYAxisSettings.TitleFontSize)}
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
              handleChange={value => handleChange(value, EYAxisSettings.TitleFontFamily)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Label"}
            value={configValues.isDisplayLabel}
            handleChange={() => handleCheckbox(EYAxisSettings.IsDisplayLabel)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isDisplayLabel}>
        <Row>
          <Column>
            <ToggleButton
              label={"Show Labels Above Line"}
              value={configValues.isShowLabelsAboveLine}
              handleChange={() => handleCheckbox(EYAxisSettings.IsShowLabelsAboveLine)}
              appearance="checkbox"
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={configValues.labelColor}
              handleChange={value => handleColor(value, EYAxisSettings.LabelColor)}
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
              handleChange={value => handleChange(value, EYAxisSettings.LabelFontFamily)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              label="Text Size"
              type="number"
              value={configValues.labelFontSize.toString()}
              handleChange={(value: any) => handleChange(+value, EYAxisSettings.LabelFontSize)}
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

export default YAxisSettings;
