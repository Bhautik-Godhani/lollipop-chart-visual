/* eslint-disable max-lines-per-function */
import * as React from "react";
import { CUT_AND_CLIP_AXIS_SETTINGS } from "../constants";
import { ECutAndClipAxisSettings } from "../enum";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  Footer,
  ColorPicker,
} from "@truviz/shadow/dist/Components";
import { ICutAndClipAxisSettings } from "../visual-settings.interface";
import { CutAndClipAxisPlaceholderIcon } from "./SettingsIcons";

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
    if (configValues.breakEnd > configValues.breakStart) {
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
      <Row>
        <Column>
          <ToggleButton
            label={"Enable"}
            value={configValues.isEnabled}
            handleChange={() => handleCheckbox(ECutAndClipAxisSettings.IsEnabled)}
            appearance="toggle"
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
                  label={"Marker Background Color"}
                  color={configValues.markerBackgroundColor}
                  handleChange={value => handleColor(value, ECutAndClipAxisSettings.MarkerBackgroundColor)}
                  colorPalette={vizOptions.host.colorPalette}
                  size="sm"
                />
              </Column>
            </Row>
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

export default CutAndClipAxisSettings;
