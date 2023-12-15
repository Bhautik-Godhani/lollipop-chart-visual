import * as React from "react";
import { DYNAMIC_DEVIATION_SETTINGS } from "../constants";
import {
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
  Quote
} from "@truviz/shadow/dist/Components";
import { IDynamicDeviationSettings, ILabelValuePair } from "../visual-settings.interface";
import { DashedLineIcon, DottedLineIcon, DynamicDeviationArrowIcon, DynamicDeviationBarIcon, DynamicDeviationDotsIcon, SolidLineIcon } from "./SettingsIcons";

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
      label: "Create Your Own",
      value: EDynamicDeviationDisplayTypes.CreateYourOwn,
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

  return (
    <>
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

      <ConditionalWrapper visible={configValues.isEnabled}>
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
                max={100}
                type="number"
                label="From Index"
                value={configValues.fromIndex.toString() ?? ""}
                handleChange={(value) => handleChange(value, EDynamicDeviationSettings.FromIndex)}
              />
            </Column>

            <Column>
              <InputControl
                min={0}
                max={100}
                type="number"
                label="To Index"
                value={configValues.toIndex.toString() ?? ""}
                handleChange={(value) => handleChange(value, EDynamicDeviationSettings.FromIndex)}
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

        <Row>
          <Column>
            <ColorPicker
              label={"Connector Positive Color"}
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
              label={"Connector Negative Color"}
              color={configValues.connectorNegativeColor}
              handleChange={value => handleColor(value, EDynamicDeviationSettings.ConnectorNegativeColor)}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SwitchOption
              label="Connector Type"
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

        <Row>
          <Column >
            <InputControl
              min={0}
              type="number"
              label="Connector Width"
              value={configValues.connectorWidth?.toString()}
              handleChange={(value) => handleChange(value, EDynamicDeviationSettings.ConnectorWidth)}
            />
          </Column>
          <Column></Column>
        </Row>

        <Row>
          <Column>
            <SwitchOption
              label="Connecting Line Style"
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
              label="Connecting Line Width"
              value={configValues.connectingLineWidth?.toString()}
              handleChange={(value) => handleChange(value, EDynamicDeviationSettings.connectingLineWidth)}
            />
          </Column>

          <Column>
            <ColorPicker
              label={"Connecting Line Color"}
              color={configValues.connectingLineColor}
              handleChange={value => handleColor(value, EDynamicDeviationSettings.ConnectingLineColor)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>

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
            <InputControl
              min={0}
              type="number"
              label="Text Size"
              value={configValues.labelFontSize?.toString()}
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
          <Row>
            <Column>
              <ColorPicker
                label={"Color"}
                color={configValues.backgroundColor}
                handleChange={value => handleColor(value, EDynamicDeviationSettings.BackgroundColor)}
                colorPalette={vizOptions.host.colorPalette}
              />
            </Column>
          </Row>
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

export default DynamicDeviationSettings;
