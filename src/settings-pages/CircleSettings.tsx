import * as React from "react";
import { CIRCLE_SETTINGS } from "../constants";
import {
  CircleFillOption,
  CircleSize,
  CircleType,
  ECircleSettings,
  EVisualConfig,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings } from "../visual-settings.interface";
import ColorPicker from "./ColorPicker";

const CircleSettings = (props) => {
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
      ...CIRCLE_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...CIRCLE_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const circleType = configValues.circleType;
  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [circleType]: { ...d[circleType], [n]: val },
    }));
  };

  const handleCircleTypeChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [circleType]: { ...d[circleType], [n]: !d[circleType][n] },
    }));
  };

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [circleType]: { ...d[circleType], [n]: adjoinRGB(rgb) },
    }));
  };

  const chartSettings: IChartSettings = shadow.chartSettings;

  const isDumbbellChart =
    !!vizOptions.options.dataViews[0].categorical.values[1];

  return (
    <>
      {/* <div className="config-container">
        {isDumbbellChart && (
          <div className="config">
            <label
              className="config-label"
              htmlFor={ECircleSettings.circleType}
            >
              Circle Type
            </label>
            <div className="config-option">
              <select
                id={ECircleSettings.circleType}
                value={configValues.circleType}
                onChange={(e) =>
                  handleCircleTypeChange(
                    e.target.value,
                    ECircleSettings.circleType
                  )
                }
              >
                <option value={CircleType.Circle1}>Circle1</option>
                <option value={CircleType.Circle2}>Circle2</option>
              </select>
            </div>
          </div>
        )}

        <div className="config config-switch">
          <label className="config-label" htmlFor={ECircleSettings.show}>
            Display Circle
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id={ECircleSettings.show}
                type="checkbox"
                checked={configValues[configValues.circleType].show}
                onChange={(e: any) => {
                  handleCheckbox(ECircleSettings.show);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="config">
          <label
            className="config-label"
            htmlFor={ECircleSettings.isCircleFilled}
          >
            Fill the circle
          </label>
          <div className="config-option">
            <select
              id={ECircleSettings.isCircleFilled}
              value={configValues[configValues.circleType].isCircleFilled}
              onChange={(e) =>
                handleChange(e.target.value, ECircleSettings.isCircleFilled)
              }
            >
              <option value={CircleFillOption.Yes}>Yes</option>
              <option value={CircleFillOption.No}>No</option>
            </select>
          </div>
        </div>

        <div className="config">
          <label className="config-label" htmlFor={ECircleSettings.circleSize}>
            Circle Size
          </label>
          <div className="config-option">
            <select
              id={ECircleSettings.circleSize}
              value={configValues[configValues.circleType].circleSize}
              onChange={(e) =>
                handleChange(e.target.value, ECircleSettings.circleSize)
              }
            >
              <option value={CircleSize.Auto}>Auto</option>
              <option value={CircleSize.Custom}>Custom</option>
            </select>
          </div>
        </div>

        {configValues[configValues.circleType].circleSize ===
          CircleSize.Custom && (
          <div className="config">
            <label
              className="config-label"
              htmlFor={ECircleSettings.circleRadius}
            >
              Size Value
            </label>
            <div className="config-option">
              <input
                id={ECircleSettings.circleRadius}
                type="number"
                value={configValues[configValues.circleType].circleRadius}
                onChange={(e: any) => {
                  handleChange(+e.target.value, ECircleSettings.circleRadius);
                }}
              />
            </div>
          </div>
        )}

        <div className="config">
          <label className="config-label" htmlFor={ECircleSettings.strokeWidth}>
            Border Width
          </label>
          <div className="config-option">
            <input
              id={ECircleSettings.strokeWidth}
              type="number"
              value={configValues[configValues.circleType].strokeWidth}
              onChange={(e: any) => {
                handleChange(+e.target.value, ECircleSettings.strokeWidth);
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
      </div> */}
    </>
  );
};

export default CircleSettings;
