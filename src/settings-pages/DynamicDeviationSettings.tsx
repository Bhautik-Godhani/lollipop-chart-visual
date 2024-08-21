import * as React from "react";
import { DYNAMIC_DEVIATION_SETTINGS } from "../constants";
import {
  EDataLabelsSettings,
  EDynamicDeviationConnectingLineTypes,
  EDynamicDeviationDisplayTypes,
  EDynamicDeviationLabelDisplayTypes,
  EDynamicDeviationSettings,
  ELineType,
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
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

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

const LINE_STYLES = [
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
];

const DISPLAY_TYPES_1: ILabelValuePair[] = [
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

const DISPLAY_TYPES_2: ILabelValuePair[] = [{
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
}]

const UIMain = (
  vizOptions: ShadowUpdateOptions,
  shadow: Visual,
  configValues: IDynamicDeviationSettings,
  DISPLAY_TYPES: ILabelValuePair[],
  handleChange, handleCheckbox, handleColor,
  closeCurrentSettingHandler, applyChanges, resetChanges
) => {
  return <>
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
            <div className="preview-image">
              <DynamicDeviationPlaceholderIcon />
            </div>
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.isEnabled}>
        {DDDisplay(shadow, configValues, DISPLAY_TYPES, handleChange, handleCheckbox)}
        {DDDeviationLine(vizOptions, configValues, handleChange, handleColor)}
        {DDConnectorLine(vizOptions, configValues, handleChange, handleCheckbox, handleColor)}
        {DDLabelStyles(vizOptions, configValues, handleChange, handleCheckbox, handleColor)}
      </ConditionalWrapper>
    </ConditionalWrapper>

    <Footer
      cancelButtonHandler={closeCurrentSettingHandler}
      saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
      resetButtonHandler={resetChanges}
    />
  </>
}

const DDDisplay = (
  shadow: Visual,
  configValues: IDynamicDeviationSettings,
  DISPLAY_TYPES: ILabelValuePair[],
  handleChange, handleCheckbox
) => {
  return <>
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

      <ConditionalWrapper visible={configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (!!configValues.createYourOwnDeviation && !!configValues.createYourOwnDeviation.from)}>
        <Row>
          <Column>
            <ToggleButton
              label={"Remove Current Deviation"}
              value={configValues.removeCurrentDeviation}
              handleChange={() => handleCheckbox(EDynamicDeviationSettings.RemoveCurrentDeviation)}
              appearance="checkbox"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.displayType === EDynamicDeviationDisplayTypes.CustomRange}>
        <Row>
          <Column>
            <InputControl
              min={1}
              max={(shadow as Visual).categoricalDataPairs.length}
              type="number"
              label="From Index"
              value={configValues.fromIndex}
              handleChange={(value) => handleChange(value, EDynamicDeviationSettings.FromIndex)}
            />
          </Column>

          <Column>
            <InputControl
              min={1}
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
  </>
}

const DDDeviationLine = (
  vizOptions: ShadowUpdateOptions,
  configValues: IDynamicDeviationSettings,
  handleChange, handleColor
) => {
  return <>
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
            selectorAppearance="secondary"
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
  </>
}

const DDConnectorLine = (
  vizOptions: ShadowUpdateOptions,
  configValues: IDynamicDeviationSettings,
  handleChange, handleCheckbox, handleColor
) => {
  return <>
    <AccordionAlt title="Connector Line"
      open={true}
      showToggle={true}
      toggleValue={configValues.isShowConnectorLine}
      onChangeToggle={() => handleCheckbox(EDynamicDeviationSettings.IsShowConnectorLine)}
    >
      <Row>
        <Column>
          <SwitchOption
            label="Line Style"
            value={configValues.connectingLineType}
            optionsList={LINE_TYPES}
            selectorAppearance="secondary"
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
  </>
}

const DDLabelStyles = (
  vizOptions: ShadowUpdateOptions,
  configValues: IDynamicDeviationSettings,
  handleChange, handleCheckbox, handleColor
) => {
  return <>
    <AccordionAlt title="Label Styles"
      open={true}
      showToggle={true}
      toggleValue={configValues.isShowDataLabel}
      onChangeToggle={() => handleCheckbox(EDynamicDeviationSettings.IsShowDataLabel)}
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
            optionsList={LINE_STYLES}
            isMultiple
            selectorAppearance="secondary"
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
  </>
}

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

    if (configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && configValues.removeCurrentDeviation) {
      configValues.createYourOwnDeviation = { from: undefined, to: undefined };
    }

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

  let DISPLAY_TYPES: ILabelValuePair[] = DISPLAY_TYPES_1;

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

  if (!(shadow as Visual).isSmallMultiplesEnabled && shadow.isLollipopTypeCircle && !(shadow as Visual).isChartIsRaceChart) {
    DISPLAY_TYPES = DISPLAY_TYPES_2;
  }

  React.useEffect(() => {
    if ((configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (shadow as Visual).isSmallMultiplesEnabled) ||
      configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (shadow as Visual).isLollipopTypePie ||
      configValues.displayType === EDynamicDeviationDisplayTypes.CreateYourOwn && (shadow as Visual).isChartIsRaceChart) {
      handleChange(EDynamicDeviationDisplayTypes.Auto, EDynamicDeviationSettings.DisplayType);
    }
  }, []);

  return (
    <>
      {UIMain(vizOptions, shadow, configValues, DISPLAY_TYPES, handleChange, handleCheckbox, handleColor, closeCurrentSettingHandler, applyChanges, resetChanges)}
    </>
  );
};

export default DynamicDeviationSettings;
