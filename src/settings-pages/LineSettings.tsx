import * as React from "react";
import { LINE_SETTINGS } from "../constants";
import { ELineSettings, LineType } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import ColorPicker from "./ColorPicker";

const LineSettings = (props) => {
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
      ...LINE_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...LINE_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
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
      [n]: adjoinRGB(rgb),
    }));
  };

  const isDumbbellChart =
    !!vizOptions.options.dataViews[0].categorical.values[1];

  if (
    isDumbbellChart &&
    (configValues[ELineSettings.lineColor] === "rgb(91,121,185)" ||
      configValues[ELineSettings.lineColor] === "rgba(91,121,185,1)")
  ) {
    configValues[ELineSettings.lineColor] = "rgb(150,150,150,60)";
  }

  return (
    <>
      <div className="config-container">
        <div className="config config-switch">
          <label className="config-label" htmlFor={ELineSettings.show}>
            Display Line
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id={ELineSettings.show}
                type="checkbox"
                checked={configValues.show}
                onChange={(e: any) => {
                  handleCheckbox(ELineSettings.show);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="config">
          <label className="config-label" htmlFor={ELineSettings.lineType}>
            Line Type
          </label>
          <div className="config-option">
            <select
              id={ELineSettings.lineType}
              value={configValues.lineType}
              onChange={(e) =>
                handleChange(e.target.value, ELineSettings.lineType)
              }
            >
              <option value={LineType.Solid}>Solid</option>
              <option value={LineType.Dashed}>Dashed</option>
              <option value={LineType.Dotted}>Dotted</option>
            </select>
          </div>
        </div>

        <div className="config">
          <label className="config-label" htmlFor={ELineSettings.lineColor}>
            Line Color
          </label>
          <div className="config-option" id={ELineSettings.lineColor}>
            <ColorPicker
              color={splitRGB(configValues.lineColor)}
              handleChange={(c) => handleColor(c, "lineColor")}
            />
          </div>
        </div>

        <div className="config">
          <label className="config-label" htmlFor={ELineSettings.lineWidth}>
            Line Width
          </label>
          <div className="config-option">
            <input
              id={ELineSettings.lineWidth}
              type="number"
              value={configValues.lineWidth}
              onChange={(e: any) => {
                handleChange(+e.target.value, ELineSettings.lineWidth);
              }}
            />
          </div>
        </div>

        <div className="config-btn-group">
          <button
            className="cancel-btn btn"
            onClick={closeCurrentSettingHandler}
          >
            Cancel
          </button>
          <button className="apply-btn btn" onClick={applyChanges}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default LineSettings;
