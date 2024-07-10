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
  Quote,
  AccordionAlt,
  SwitchOption,
  Tabs,
  Tab,
} from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IRaceChartSettings, IRaceChartTextProps } from "../visual-settings.interface";
import { ERaceChartSettings, Position } from "../enum";
import { Visual } from "../visual";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "./SettingsIcons";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const TEXT_PLACEMENTS: ILabelValuePair[] = [
  {
    label: "Top",
    value: Position.Top,
  },
  {
    label: "Bottom",
    value: Position.Bottom,
  }
];

enum ETextType {
  HeaderTextStyles = "headerTextStyles",
  SubTextStyles = "subTextStyles"
}

const handleChange = (val, n, type: ETextType, setConfigValues: React.Dispatch<React.SetStateAction<IRaceChartSettings>>) => {
  setConfigValues((d: any) => ({
    ...d,
    [type]: { ...d[type], [n]: val }
  }));
};

const handleColor = (rgb, n, type: ETextType, setConfigValues: React.Dispatch<React.SetStateAction<IRaceChartSettings>>) => {
  setConfigValues((d: any) => ({
    ...d,
    [type]: { ...d[type], [n]: rgb }
  }));
};

const handleCheckbox = (n, type: ETextType, setConfigValues: React.Dispatch<React.SetStateAction<IRaceChartSettings>>) => {
  setConfigValues((d: any) => ({
    ...d,
    [type]: { ...d[type], [n]: !d[type][n] }
  }));
};

const UITextStylesSettings = (
  shadow: Visual,
  vizOptions: ShadowUpdateOptions,
  textType: ETextType,
  configValues: IRaceChartTextProps,
  setConfigValues: React.Dispatch<React.SetStateAction<IRaceChartSettings>>
) => {
  return <>
    <Row>
      <Column>
        <ToggleButton
          label={"Auto Text Size"}
          value={configValues.isLabelAutoFontSize}
          handleChange={() => handleCheckbox(ERaceChartSettings.IsLabelAutoFontSize, textType, setConfigValues)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={!configValues.isLabelAutoFontSize}>
      <Row appearance="padded">
        <Column>
          <InputControl
            min={0}
            type="number"
            label="Text Size"
            value={configValues.labelFontSize.toString()}
            handleChange={(value) => handleChange(value, ERaceChartSettings.LabelFontSize, textType, setConfigValues)}
          />
        </Column>
      </Row>
    </ConditionalWrapper>

    <Row>
      <Column>
        <SelectInput
          label={"Font Family"}
          value={configValues.labelFontFamily}
          isFontSelector={true}
          optionsList={[]}
          handleChange={value => handleChange(value, ERaceChartSettings.LabelFontFamily, textType, setConfigValues)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <SwitchOption
          label="Styling"
          value={configValues.fontStyles}
          optionsList={[
            {
              label: <BoldIcon style={{ fill: "currentColor" }} />,
              value: "bold",
            },
            {
              label: <ItalicIcon style={{ fill: "currentColor" }} />,
              value: "italic",
            },
            {
              label: <UnderlineIcon style={{ fill: "currentColor" }} />,
              value: "underline",
            },
          ]}
          isMultiple
          selectorAppearance="secondary"
          handleChange={value => handleChange(value, ERaceChartSettings.FontStyles, textType, setConfigValues)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <ColorPicker
          label={"Label Color"}
          color={configValues.labelColor}
          handleChange={(value) => handleColor(value, ERaceChartSettings.LabelColor, textType, setConfigValues)}
          colorPalette={vizOptions.host.colorPalette}
          size="sm"
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <ToggleButton
          label="Show Background"
          value={configValues.isShowLabelBackground}
          handleChange={() => handleCheckbox(ERaceChartSettings.IsShowLabelBackground, textType, setConfigValues)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={configValues.isShowLabelBackground}>
      <Row appearance="padded">
        <Column>
          <ColorPicker
            label={"Color"}
            color={configValues.backgroundColor}
            handleChange={value => handleChange(value, ERaceChartSettings.BackgroundColor, textType, setConfigValues)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>
    </ConditionalWrapper>
  </>
}

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

  const handleColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: rgb,
    }));
  };

  return (
    <>
      <ConditionalWrapper visible={shadow.isSmallMultiplesEnabled}>
        <Row>
          <Column>
            <Quote>
              <strong>Note: </strong>Please remove the small multiples data to use this feature.
            </Quote>
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!shadow.isSmallMultiplesEnabled}>
        <ConditionalWrapper visible={!(shadow as Visual).isChartRacePossible}>
          <Row>
            <Column>
              <Quote>
                <strong>Note: </strong>This option allows you render chart based on race keys by given time interval. To enable this option, add a
                categorical data by which you want to play race.
              </Quote>
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={(shadow as Visual).isChartRacePossible}>
          <Row>
            <Column>
              <ToggleButton
                label={"Enable"}
                value={configValues.isEnabled}
                handleChange={() => handleCheckbox(ERaceChartSettings.IsEnabled)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.isEnabled}>

            <AccordionAlt title="Animation Transition"
              open={configValues.allowTransition}
              showToggle={true}
              toggleValue={configValues.allowTransition}
              onChangeToggle={(value) => handleChange(value, ERaceChartSettings.AllowTransition)}
            >
              <Row>
                <Column>
                  <SwitchOption
                    label={"Placement"}
                    value={configValues.placement}
                    optionsList={TEXT_PLACEMENTS}
                    selectorAppearance="secondary"
                    handleChange={(value) => handleChange(value, ERaceChartSettings.Placement)}
                  />
                </Column>
              </Row>

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
                    label="Duration"
                    value={configValues.transitionDuration.toString()}
                    handleChange={(value) => handleChange(+value, ERaceChartSettings.TransitionDuration)}
                  />
                </Column>
              </Row>
            </AccordionAlt>

            <AccordionAlt title="Text Styles"
              open={true}
            >
              <Tabs selected={ETextType.HeaderTextStyles} >
                <Tab title={"Header"} identifier={ETextType.HeaderTextStyles}>
                  {UITextStylesSettings(shadow, vizOptions, ETextType.HeaderTextStyles, configValues.headerTextStyles, setConfigValues)}
                </Tab>
                <Tab title={"Sub-Text"} identifier={ETextType.SubTextStyles}>
                  {UITextStylesSettings(shadow, vizOptions, ETextType.SubTextStyles, configValues.subTextStyles, setConfigValues)}
                </Tab>
              </Tabs >
            </AccordionAlt>

            <AccordionAlt title="Play Button"
              open={true}
            >
              <Row>
                <Column>
                  <ToggleButton
                    label={"Auto Play Button Radius"}
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
                      label={"Play Button Color"}
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
                      label={"Play Button Color"}
                      color={configValues.tickerButtonColor}
                      handleChange={(value) => handleColor(value, ERaceChartSettings.TickerButtonColor)}
                      colorPalette={vizOptions.host.colorPalette}
                      size="sm"
                    />
                  </Column>
                </Row>
              </ConditionalWrapper>
            </AccordionAlt>
          </ConditionalWrapper>
        </ConditionalWrapper>
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
