import * as React from "react";
import { GRID_LINES_SETTINGS } from "../constants";
import { EGridLinesSettings, LineType } from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import ColorPicker from "./ColorPicker";

const GridLinesSettings = (props) => {
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
      ...GRID_LINES_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...GRID_LINES_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const handleChange = (val, n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: val },
    }));
  };

  const handleCheckbox = (n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: !d[gridType][n] },
    }));
  };

  const handleColor = ({ rgb }, n, gridType: string) => {
    setConfigValues((d) => ({
      ...d,
      [gridType]: { ...d[gridType], [n]: adjoinRGB(rgb) },
    }));
  };

  return (
    <>
      <div className="config-container">
        <div className="config config-switch">
          <label className="config-label" htmlFor={EGridLinesSettings.show}>
            X-axis Grid Lines
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id={EGridLinesSettings.show}
                type="checkbox"
                checked={configValues[EGridLinesSettings.xGridLines].show}
                onChange={(e: any) => {
                  handleCheckbox(
                    EGridLinesSettings.show,
                    EGridLinesSettings.xGridLines
                  );
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {configValues[EGridLinesSettings.xGridLines].show && (
          <div>
            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineType}
              >
                Line Type
              </label>
              <div className="config-option">
                <select
                  id={EGridLinesSettings.lineType}
                  value={configValues[EGridLinesSettings.xGridLines].lineType}
                  onChange={(e) =>
                    handleChange(
                      e.target.value,
                      EGridLinesSettings.lineType,
                      EGridLinesSettings.xGridLines
                    )
                  }
                >
                  <option value={LineType.Solid}>Solid</option>
                  <option value={LineType.Dashed}>Dashed</option>
                  <option value={LineType.Dotted}>Dotted</option>
                </select>
              </div>
            </div>

            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineWidth}
              >
                Line Width
              </label>
              <div className="config-option">
                <input
                  id={EGridLinesSettings.lineWidth}
                  type="number"
                  value={configValues[EGridLinesSettings.xGridLines].lineWidth}
                  onChange={(e: any) => {
                    handleChange(
                      +e.target.value,
                      EGridLinesSettings.lineWidth,
                      EGridLinesSettings.xGridLines
                    );
                  }}
                />
              </div>
            </div>

            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineColor}
              >
                Line Color
              </label>
              <div className="config-option" id={EGridLinesSettings.lineColor}>
                <ColorPicker
                  color={splitRGB(
                    configValues[EGridLinesSettings.xGridLines].lineColor
                  )}
                  handleChange={(c) =>
                    handleColor(c, "lineColor", EGridLinesSettings.xGridLines)
                  }
                />
              </div>
            </div>
          </div>
        )}

        <div className="config config-switch">
          <label className="config-label" htmlFor={EGridLinesSettings.show}>
            Y-axis Grid Lines
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id={EGridLinesSettings.show}
                type="checkbox"
                checked={configValues[EGridLinesSettings.yGridLines].show}
                onChange={(e: any) => {
                  handleCheckbox(
                    EGridLinesSettings.show,
                    EGridLinesSettings.yGridLines
                  );
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {configValues[EGridLinesSettings.yGridLines].show && (
          <div>
            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineType}
              >
                Line Type
              </label>
              <div className="config-option">
                <select
                  id={EGridLinesSettings.lineType}
                  value={configValues[EGridLinesSettings.yGridLines].lineType}
                  onChange={(e) =>
                    handleChange(
                      e.target.value,
                      EGridLinesSettings.lineType,
                      EGridLinesSettings.yGridLines
                    )
                  }
                >
                  <option value={LineType.Solid}>Solid</option>
                  <option value={LineType.Dashed}>Dashed</option>
                  <option value={LineType.Dotted}>Dotted</option>
                </select>
              </div>
            </div>

            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineWidth}
              >
                Line Width
              </label>
              <div className="config-option">
                <input
                  id={EGridLinesSettings.lineWidth}
                  type="number"
                  value={configValues[EGridLinesSettings.yGridLines].lineWidth}
                  onChange={(e: any) => {
                    handleChange(
                      +e.target.value,
                      EGridLinesSettings.lineWidth,
                      EGridLinesSettings.yGridLines
                    );
                  }}
                />
              </div>
            </div>

            <div className="config">
              <label
                className="config-label"
                htmlFor={EGridLinesSettings.lineColor}
              >
                Line Color
              </label>
              <div className="config-option" id={EGridLinesSettings.lineColor}>
                <ColorPicker
                  color={splitRGB(
                    configValues[EGridLinesSettings.yGridLines].lineColor
                  )}
                  handleChange={(c) =>
                    handleColor(c, "lineColor", EGridLinesSettings.yGridLines)
                  }
                />
              </div>
            </div>
          </div>
        )}

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

export default GridLinesSettings;
