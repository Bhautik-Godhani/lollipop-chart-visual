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
    shadow.persistProperties(sectionName, propertyName, configValues);
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
            label={"Allow Transition"}
            value={configValues.allowTransition}
            handleChange={() => handleCheckbox(ERaceChartSettings.AllowTransition)}
            appearance="checkbox"
          />
        </Column>
      </Row>

      <Row>
        <Column >
          <InputControl
            min={0}
            type="number"
            label="Animation Duration"
            value={configValues.transitionDuration.toString()}
            handleChange={(value) => handleChange(+value, ERaceChartSettings.TransitionDuration)}
          />
        </Column>

        <Column>
          <InputControl
            min={0}
            type="number"
            label="Interval"
            value={configValues.dataChangeInterval.toString()}
            handleChange={(value) => handleChange(value, ERaceChartSettings.DataChangeInterval)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Label Auto Text Size"}
            value={configValues.isLabelAutoFontSize}
            handleChange={() => handleCheckbox(ERaceChartSettings.IsLabelAutoFontSize)}
            appearance="checkbox"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isLabelAutoFontSize}>
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
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ColorPicker
            label={"Label Color"}
            color={configValues.labelColor}
            handleChange={(value) => handleColor(value, ERaceChartSettings.LabelColor)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>

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
            label={"Ticker Button Auto Radius"}
            value={configValues.isTickerButtonAutoRadius}
            handleChange={() => handleCheckbox(ERaceChartSettings.IsTickerButtonAutoRadius)}
            appearance="checkbox"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isTickerButtonAutoRadius}>
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
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ColorPicker
            label={"Ticker Button Color"}
            color={configValues.tickerButtonColor}
            handleChange={(value) => handleColor(value, ERaceChartSettings.TickerButtonColor)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default RaceChartSettings;
