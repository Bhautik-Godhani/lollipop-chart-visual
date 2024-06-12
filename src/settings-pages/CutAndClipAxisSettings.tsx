/* eslint-disable max-lines-per-function */
import * as React from "react";
import { CUT_AND_CLIP_AXIS_SETTINGS } from "../constants";
import { ECutAndClipAxisSettings, ECutAndClipMarkerPlacementTypes } from "../enum";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  Footer,
  ColorPicker,
  Quote,
  SelectInput,
} from "@truviz/shadow/dist/Components";
import { ICutAndClipAxisSettings, ILabelValuePair } from "../visual-settings.interface";
import { CutAndClipAxisPlaceholderIcon } from "./SettingsIcons";

const MARKER_PLACEMENTS: ILabelValuePair[] = [
  {
    label: "Both",
    value: ECutAndClipMarkerPlacementTypes.Both,
  },
  {
    label: "Axis",
    value: ECutAndClipMarkerPlacementTypes.Axis,
  },
  {
    label: "Category",
    value: ECutAndClipMarkerPlacementTypes.Categories,
  },
];

const CutAndClipAxisSettings = (props) => {
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
      ...CUT_AND_CLIP_AXIS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...CUT_AND_CLIP_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    if ((configValues.isEnabled && (configValues.breakEnd > configValues.breakStart)) || !configValues.isEnabled) {
      shadow.persistProperties(sectionName, propertyName, configValues);
      closeCurrentSettingHandler();
    }
  };

  const resetChanges = () => {
    setConfigValues({ ...CUT_AND_CLIP_AXIS_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<ICutAndClipAxisSettings>({
    ...initialStates,
  });

  React.useEffect(() => {
    if (configValues.breakStart === undefined) {
      handleChange(shadow.axisDomainMaxValue * 15 / 100, ECutAndClipAxisSettings.BreakStart);
    }

    if (configValues.breakEnd === undefined) {
      handleChange(shadow.axisDomainMaxValue * 35 / 100, ECutAndClipAxisSettings.BreakEnd);
    }
  }, []);

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
        <Row>
          <Column>
            <ToggleButton
              label={"Enable"}
              value={configValues.isEnabled}
              handleChange={() => handleCheckbox(ECutAndClipAxisSettings.IsEnabled)}
              appearance="toggle"
              tooltip="Shortening the chart's axis by removing less important parts to make the data easier to see, usually shown with a break mark."
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!configValues.isEnabled}>
          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <CutAndClipAxisPlaceholderIcon />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={configValues.isEnabled}>
          <Row appearance="padded">
            <Column>
              <Row disableTopPadding={true}>
                <Column >
                  <InputControl
                    min={0}
                    type="number"
                    label="Break Start"
                    value={configValues.breakStart}
                    handleChange={(value) => handleChange(value, ECutAndClipAxisSettings.BreakStart)}
                  />
                </Column>

                <Column>
                  <InputControl
                    min={0}
                    type="number"
                    label="Break End"
                    value={configValues.breakEnd}
                    handleChange={(value) => handleChange(value, ECutAndClipAxisSettings.BreakEnd)}
                  />
                </Column>
              </Row>

              <Row>
                <Column>
                  <ColorPicker
                    label={"Marker Line Color"}
                    color={configValues.markerStrokeColor}
                    handleChange={value => handleColor(value, ECutAndClipAxisSettings.MarkerStrokeColor)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>

              <Row>
                <Column>
                  <ColorPicker
                    label={"Background Color"}
                    color={configValues.markerBackgroundColor}
                    handleChange={value => handleColor(value, ECutAndClipAxisSettings.MarkerBackgroundColor)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>

              <Row>
                <Column>
                  <SelectInput
                    label={"Placement"}
                    value={configValues.markerPlacement}
                    optionsList={MARKER_PLACEMENTS}
                    handleChange={(value) => handleChange(value, ECutAndClipAxisSettings.MarkerPlacement)}
                  />
                </Column>
              </Row>
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

export default CutAndClipAxisSettings;
