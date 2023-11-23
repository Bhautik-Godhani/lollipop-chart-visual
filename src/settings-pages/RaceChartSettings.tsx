/* eslint-disable max-lines-per-function */
import * as React from "react";
import { RACE_CHART_SETTINGS as RACE_CHART_SETTINGS_IMP } from "../constants";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  Footer,
  SelectInput,
  ColorPicker,
} from "@truviz/shadow/dist/Components";
import { IRaceChartSettings } from "../visual-settings.interface";
import { ERaceChartSettings } from "../enum";
import { persistProperties } from "../methods/methods";

const RaceChartSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;

  const RACE_CHART_SETTINGS = JSON.parse(JSON.stringify(RACE_CHART_SETTINGS_IMP));
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...RACE_CHART_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...RACE_CHART_SETTINGS };
  }

  const applyChanges = () => {
    persistProperties(shadow, sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...RACE_CHART_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<IRaceChartSettings>({
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

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: rgb,
    }));
  };

  return (
    <>
      <Row>
        <Column>
          <ToggleButton
            label={"Enable Transition"}
            value={configValues.allowTransition}
            handleChange={() => handleCheckbox(ERaceChartSettings.AllowTransition)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.allowTransition}>
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Interval"
              value={configValues.dataChangeInterval.toString()}
              handleChange={(value) => handleChange(value, ERaceChartSettings.DataChangeInterval)}
            />
          </Column>

          <Column>
            <InputControl
              min={0}
              type="number"
              label="Animation Duration"
              value={configValues.transitionDuration.toString()}
              handleChange={(value) => handleChange(+value, ERaceChartSettings.TransitionDuration)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!configValues.allowTransition}>
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Interval"
              value={configValues.dataChangeInterval.toString()}
              handleChange={(value) => handleChange(value, ERaceChartSettings.DataChangeInterval)}
            />
          </Column>
          <Column></Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Auto Font Size"}
            value={configValues.isLabelAutoFontSize}
            handleChange={() => handleCheckbox(ERaceChartSettings.IsLabelAutoFontSize)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={!configValues.isLabelAutoFontSize}>
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Text Size"
              value={configValues.labelFontSize.toString()}
              handleChange={(value) => handleChange(value, ERaceChartSettings.LabelFontSize)}
            />
          </Column>

          <Column>
            <ColorPicker
              label={"Label Color"}
              color={configValues.labelColor}
              handleChange={(value) => handleColor(value, ERaceChartSettings.LabelColor)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.isLabelAutoFontSize}>
        <Row>
          <Column>
            <ColorPicker
              label={"Label Color"}
              color={configValues.labelColor}
              handleChange={(value) => handleColor(value, ERaceChartSettings.LabelColor)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <SelectInput
            label={"Label Font Family"}
            value={configValues.labelFontFamily}
            isFontSelector={true}
            optionsList={[]}
            handleChange={value => handleChange(value, ERaceChartSettings.LabelFontFamily)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Auto Button Radius"}
            value={configValues.isTickerButtonAutoRadius}
            handleChange={() => handleCheckbox(ERaceChartSettings.IsTickerButtonAutoRadius)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={!configValues.isTickerButtonAutoRadius}>
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Radius"
              value={configValues.tickerButtonRadius.toString()}
              handleChange={(value) => handleChange(value, ERaceChartSettings.TickerButtonRadius)}
            />
          </Column>

          <Column>
            <ColorPicker
              label={"Ticker Button Color"}
              color={configValues.tickerButtonColor}
              handleChange={(value) => handleColor(value, ERaceChartSettings.TickerButtonColor)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.isTickerButtonAutoRadius}>
        <Row>
          <Column>
            <ColorPicker
              label={"Ticker Button Color"}
              color={configValues.tickerButtonColor}
              handleChange={(value) => handleColor(value, ERaceChartSettings.TickerButtonColor)}
              colorPalette={vizOptions.host.colorPalette}
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

export default RaceChartSettings;
