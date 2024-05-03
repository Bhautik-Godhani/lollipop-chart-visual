/* eslint-disable max-lines-per-function */
import * as React from "react";
import { DYNAMIC_DEVIATION_SETTINGS } from "../constants";
import {
  EDataLabelsSettings,
  EDynamicDeviationConnectingLineTypes,
  EDynamicDeviationDisplayTypes,
  EDynamicDeviationLabelDisplayTypes,
  EDynamicDeviationSettings,
  ELineType,
  Position,
} from "../enum";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  Footer,
  SelectInput,
  ColorPicker,
  SwitchOption,
  Quote,
  AccordionAlt
} from "@truviz/shadow/dist/Components";
import { IDynamicDeviationSettings, ILabelValuePair } from "../visual-settings.interface";
import { BoldIcon, DashedLineIcon, DottedLineIcon, DynamicDeviationArrowIcon, DynamicDeviationBarIcon, DynamicDeviationDotsIcon, DynamicDeviationPlaceholderIcon, ItalicIcon, SolidLineIcon, UnderlineIcon } from "./SettingsIcons";
import { Visual } from "../visual";

const LINE_TYPES = [
  {
    label: <SolidLineIcon fill="currentColor" />,
    value: ELineType.Solid,
  },
  {
    label: <DashedLineIcon fill="currentColor" />,
    value: ELineType.Dashed,
  },
  {
    label: <DottedLineIcon fill="currentColor" />,
    value: ELineType.Dotted,
  },
];

const LABEL_POSITION: ILabelValuePair[] = [
  {
    label: "TOP",
    value: Position.Top,
  },
  {
    label: "BOTTOM",
    value: Position.Bottom,
  }
];

const DynamicDeviationSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...DYNAMIC_DEVIATION_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DYNAMIC_DEVIATION_SETTINGS };
  }

  const applyChanges = () => {
    configValues.lastDisplayType = shadow.dynamicDeviationSettings.displayType;
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...DYNAMIC_DEVIATION_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<IDynamicDeviationSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const DISPLAY_TYPES: ILabelValuePair[] = [
    {
      label: "Auto",
      value: EDynamicDeviationDisplayTypes.Auto,
    },
    {
      label: "Custom Range",
      value: EDynamicDeviationDisplayTypes.CustomRange,
    },
    {
      label: "First To Last",
      value: EDynamicDeviationDisplayTypes.FirstToLast,
    },
    {
      label: "First To Last Actual",
      value: EDynamicDeviationDisplayTypes.FirstToLastActual,
    },
    {
      label: "Last To First",
      value: EDynamicDeviationDisplayTypes.LastToFirst,
    },
    {
      label: "Last To First Actual",
      value: EDynamicDeviationDisplayTypes.LastToFirstActual,
    },
    {
      label: "Min To Max",
      value: EDynamicDeviationDisplayTypes.MinToMax,
    },
    {
      label: "Penultimate To Last",
      value: EDynamicDeviationDisplayTypes.PenultimateToLast
    },
  ];

  const LABEL_DISPLAY_TYPE: ILabelValuePair[] = [
    {
      label: "Value",
      value: EDynamicDeviationLabelDisplayTypes.Value,
    },
    {
      label: "Percentage",
      value: EDynamicDeviationLabelDisplayTypes.Percentage,
    },
    {
      label: "Both",
      value: EDynamicDeviationLabelDisplayTypes.Both,
    },
  ];

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

  if (!(shadow as Visual).isSmallMultiplesEnabled && shadow.isLollipopTypeCircle) {
    DISPLAY_TYPES.unshift(
      {
        label: "Create Your Own",
        value: EDynamicDeviationDisplayTypes.CreateYourOwn,
      }
    )
  }

  React.useEffect(() => {
    if ((configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (shadow as Visual).isSmallMultiplesEnabled) ||
      configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (shadow as Visual).isLollipopTypePie) {
      handleChange(EDynamicDeviationDisplayTypes.FirstToLast, EDynamicDeviationSettings.DisplayType);
    }
  }, []);

  return (
    <>
      <ConditionalWrapper visible={shadow.isHasMultiMeasure}>
        <Row>
          <Column>
            <Quote>
              <strong>Note: </strong>Please add single measure only to use this functionality.
            </Quote>
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!shadow.isHasMultiMeasure}>
        <Row>
          <Column>
            <ToggleButton
              label={"Enable"}
              value={configValues.isEnabled}
              handleChange={() => handleCheckbox(EDynamicDeviationSettings.IsEnabled)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!configValues.isEnabled}>
          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DynamicDeviationPlaceholderIcon />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={configValues.isEnabled}>
          <AccordionAlt title="Display" open={true}>
            <Row>
              <Column>
                <SelectInput
                  label={"Display Style"}
                  value={configValues.displayType}
                  optionsList={DISPLAY_TYPES}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.DisplayType)}
                />
              </Column>
            </Row>

            <ConditionalWrapper visible={configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn}>
              <Row>
                <Column>
                  <Quote>
                    <strong>Note:</strong> &nbsp;
                    By selecting 'Create Your Own' type you will get plus icon to select bar on mouse hover (click to select it).
                    Once selected the first bar, by hovering on any other bar you will get deviation line and click on bar to save it.
                  </Quote>
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.displayType === EDynamicDeviationDisplayTypes.CustomRange}>
              <Row>
                <Column>
                  <InputControl
                    min={0}
                    max={(shadow as Visual).categoricalDataPairs.length}
                    type="number"
                    label="From Index"
                    value={configValues.fromIndex}
                    handleChange={(value) => handleChange(value, EDynamicDeviationSettings.FromIndex)}
                  />
                </Column>

                <Column>
                  <InputControl
                    min={0}
                    max={(shadow as Visual).categoricalDataPairs.length}
                    type="number"
                    label="To Index"
                    value={configValues.toIndex}
                    handleChange={(value) => handleChange(value, EDynamicDeviationSettings.ToIndex)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <Row>
              <Column>
                <ToggleButton
                  label={"Show Start Indicator"}
                  value={configValues.isShowStartIndicator}
                  handleChange={() => handleCheckbox(EDynamicDeviationSettings.IsShowStartIndicator)}
                  appearance="checkbox"
                />
              </Column>
            </Row>
          </AccordionAlt>

          <AccordionAlt title="Deviation Line"
            open={true}
          >
            <Row>
              <Column>
                <SwitchOption
                  label="Deviation Type"
                  value={configValues.connectorType}
                  optionsList={[
                    {
                      label: <DynamicDeviationArrowIcon fill="currentColor" />,
                      value: EDynamicDeviationConnectingLineTypes.Arrow,
                    },
                    {
                      label: <DynamicDeviationDotsIcon fill="currentColor" />,
                      value: EDynamicDeviationConnectingLineTypes.Dots,
                    },
                    {
                      label: <DynamicDeviationBarIcon fill="currentColor" />,
                      value: EDynamicDeviationConnectingLineTypes.Bar,
                    },
                  ]}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.ConnectorType)}
                />
              </Column>
            </Row>

            <Row>
              <Column >
                <InputControl
                  min={0}
                  type="number"
                  label="Width"
                  value={configValues.connectorWidth}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.ConnectorWidth)}
                />
              </Column>
              <Column></Column>
            </Row>

            <Row>
              <Column>
                <ColorPicker
                  label={"Positive Color"}
                  color={configValues.connectorPositiveColor}
                  handleChange={value => handleColor(value, EDynamicDeviationSettings.ConnectorPositiveColor)}
                  colorPalette={vizOptions.host.colorPalette}
                  size="sm"
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <ColorPicker
                  label={"Negative Color"}
                  color={configValues.connectorNegativeColor}
                  handleChange={value => handleColor(value, EDynamicDeviationSettings.ConnectorNegativeColor)}
                  colorPalette={vizOptions.host.colorPalette}
                  size="sm"
                />
              </Column>
            </Row>
          </AccordionAlt>

          <AccordionAlt title="Connector Line"
            open={true}
          >
            <Row>
              <Column>
                <SwitchOption
                  label="Line Style"
                  value={configValues.connectingLineType}
                  optionsList={LINE_TYPES}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.ConnectingLineType)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <InputControl
                  min={0}
                  type="number"
                  label="Width"
                  value={configValues.connectingLineWidth}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.connectingLineWidth)}
                />
              </Column>

              <Column>
                <ColorPicker
                  label={"Color"}
                  color={configValues.connectingLineColor}
                  handleChange={value => handleColor(value, EDynamicDeviationSettings.ConnectingLineColor)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>
          </AccordionAlt>

          <AccordionAlt title="Label Styles"
            open={true}
          >
            <Row>
              <Column>
                <SelectInput
                  label={"Label Display Type"}
                  value={configValues.labelDisplayType}
                  optionsList={LABEL_DISPLAY_TYPE}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.LabelDisplayType)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <SelectInput
                  label={"Font Family"}
                  value={configValues.labelFontFamily}
                  isFontSelector={true}
                  optionsList={[]}
                  handleChange={value => handleChange(value, EDynamicDeviationSettings.LabelFontFamily)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <SwitchOption
                  label="Styling"
                  value={configValues.fontStyle}
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
                  handleChange={(value) => handleChange(value, EDataLabelsSettings.fontStyle)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <InputControl
                  min={0}
                  type="number"
                  label="Text Size"
                  value={configValues.labelFontSize}
                  handleChange={(value) => handleChange(value, EDynamicDeviationSettings.LabelFontSize)}
                />
              </Column>

              <Column>
                <ColorPicker
                  label={"Color"}
                  color={configValues.labelFontColor}
                  handleChange={value => handleColor(value, EDynamicDeviationSettings.LabelFontColor)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <ToggleButton
                  label={"Show Label Background"}
                  value={configValues.isShowLabelBackground}
                  handleChange={() => handleCheckbox(EDynamicDeviationSettings.IsShowLabelBackground)}
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
                    handleChange={value => handleColor(value, EDynamicDeviationSettings.BackgroundColor)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>
            </ConditionalWrapper>
          </AccordionAlt>

        </ConditionalWrapper>
      </ConditionalWrapper>

      {/* <Row>
          <Column>
            <ToggleButton
              label={"Auto Connector Color"}
              value={configValues.isAutoConnectorColor}
              handleChange={() => handleCheckbox(EDynamicDeviationSettings.IsAutoConnectorColor)}
              appearance="toggle"
            />
          </Column>
        </Row> */}

      {/* <Row>
          <Column>
            <ToggleButton
              label={"Show Bar Border"}
              value={configValues.isBarBorderEnabled}
              handleChange={() => handleCheckbox(EDynamicDeviationSettings.IsBarBorderEnabled)}
              appearance="checkbox"
            />
          </Column>
        </Row> */}

      {/* <Row>
          <Column>
            <SwitchOption
              label="Label Position"
              value={configValues.position}
              optionsList={LABEL_POSITION}
              handleChange={value => handleChange(value, EDynamicDeviationSettings.LabelPosition)}
            />
          </Column>
        </Row> */}

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default DynamicDeviationSettings;
