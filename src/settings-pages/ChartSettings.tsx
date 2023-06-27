import * as React from "react";
import { CHART_SETTINGS } from "../constants";
import {
  EChartSettings,
  EPieSettings,
  LollipopDistanceType,
  LollipopType,
  Orientation,
  PieSize,
  PieType,
} from "../enum";

const ChartSettings = (props) => {
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
      ...CHART_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...CHART_SETTINGS };
  }

  const applyChanges = () => {
    const configProps = {
      ...configValues,
      [EChartSettings.pieSettings]: pieConfigValues,
    };
    shadow.persistProperties(sectionName, propertyName, configProps);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const [pieConfigValues, setPieConfigValues] = React.useState({
    ...initialStates[EChartSettings.pieSettings],
  });

  const handleLollipopDistanceChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
      isLollipopDistanceChange: true,
    }));
  };

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const pieType = pieConfigValues.pieType;
  const handlePieChange = (val, n) => {
    setPieConfigValues((d) => ({
      ...d,
      [pieType]: { ...d[pieType], [n]: val },
    }));
  };

  const handlePieTypeChange = (val, n) => {
    setPieConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const [isHasSubCategories] = React.useState(
    !!vizOptions.options.dataViews[0].categorical.categories[1]
  );

  const isDumbbellChart =
    !!vizOptions.options.dataViews[0].categorical.values[1];

  let lollipopType = configValues.lollipopType;
  const [isLollipopTypeChanged, setIsLollipopTypeChanged] = React.useState(
    configValues.isLollipopTypeChanged
  );

  React.useEffect(() => {
    if (!isHasSubCategories) {
      setConfigValues((d) => ({
        ...d,
        [EChartSettings.lollipopType]: LollipopType.Circle,
      }));
      setConfigValues((d) => ({
        ...d,
        [EChartSettings.isLollipopTypeChanged]: false,
      }));
      setIsLollipopTypeChanged(false);
      const configProps = {
        ...configValues,
        [EChartSettings.isLollipopTypeChanged]: false,
        [EChartSettings.pieSettings]: pieConfigValues,
      };
      shadow.persistProperties(sectionName, propertyName, configProps);
    } else {
      if (!isLollipopTypeChanged) {
        setConfigValues((d) => ({
          ...d,
          [EChartSettings.lollipopType]: LollipopType.Donut,
        }));
      }
      const configProps = {
        ...configValues,
        [EChartSettings.pieSettings]: pieConfigValues,
      };
      shadow.persistProperties(sectionName, propertyName, configProps);
    }
  }, []);

  return (
    <>
      {/* <div className="config-container">
        <div className="config">
          <label className="config-label" htmlFor={EChartSettings.lollipopType}>
            Lollipop Type
          </label>
          <div className="config-option">
            <select
              id={EChartSettings.lollipopType}
              value={lollipopType}
              onChange={(e) => {
                handleChange(e.target.value, EChartSettings.lollipopType);
                setIsLollipopTypeChanged(true);
                setConfigValues((d) => ({
                  ...d,
                  [EChartSettings.isLollipopTypeChanged]: true,
                }));
              }}
            >
              <option value={LollipopType.Circle}>Circle</option>
              <option
                value={LollipopType.Pie}
                className={!isHasSubCategories ? "disabled" : ""}
                disabled={!isHasSubCategories}
              >
                Pie
              </option>
              <option
                value={LollipopType.Donut}
                className={!isHasSubCategories ? "disabled" : ""}
                disabled={!isHasSubCategories}
              >
                Donut
              </option>
              <option
                value={LollipopType.Rose}
                className={!isHasSubCategories ? "disabled" : ""}
                disabled={!isHasSubCategories}
              >
                Rose
              </option>
            </select>
          </div>
        </div>

        <div className="config">
          <label className="config-label" htmlFor={EChartSettings.orientation}>
            Orientation
          </label>
          <div className="config-option">
            <select
              id={EChartSettings.orientation}
              value={configValues.orientation}
              onChange={(e) =>
                handleChange(e.target.value, EChartSettings.orientation)
              }
            >
              <option value={Orientation.Horizontal}>Horizontal</option>
              <option value={Orientation.Vertical}>Vertical</option>
            </select>
          </div>
        </div>

        <div className="config">
          <label
            className="config-label"
            htmlFor={EChartSettings.lollipopDistanceType}
          >
            Distance Between Lollipop
          </label>
          <div className="config-option">
            <select
              id={EChartSettings.lollipopDistanceType}
              value={configValues.lollipopDistanceType}
              onChange={(e) =>
                handleChange(
                  e.target.value,
                  EChartSettings.lollipopDistanceType
                )
              }
            >
              <option value={LollipopDistanceType.Auto}>Auto</option>
              <option value={LollipopDistanceType.Custom}>Custom</option>
            </select>
          </div>
        </div>

        {configValues.lollipopDistanceType === LollipopDistanceType.Custom && (
          <div className="config">
            <label
              className="config-label"
              htmlFor={EChartSettings.lollipopDistance}
            >
              Distance Value
            </label>
            <div className="config-option">
              <input
                id={EChartSettings.lollipopDistance}
                type="number"
                value={configValues.lollipopDistance}
                onChange={(e: any) => {
                  handleLollipopDistanceChange(
                    +e.target.value,
                    EChartSettings.lollipopDistance
                  );
                }}
              />
            </div>
          </div>
        )}

        {configValues[EChartSettings.lollipopType] !== LollipopType.Circle && (
          <React.Fragment>
            {isDumbbellChart && (
              <div
                className="radio-button-group"
                onChange={(e: any) =>
                  handlePieTypeChange(e.target.value, EPieSettings.pieType)
                }
              >
                <span className="radio-group-title">
                  Select {configValues[EChartSettings.lollipopType]}:
                </span>
                <div className="radio-buttons">
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="pie1"
                      id="pie1"
                      value={PieType.Pie1}
                      checked={
                        pieConfigValues[EPieSettings.pieType] === PieType.Pie1
                      }
                    />
                    <label className="radio-label" htmlFor="pie1">
                      {configValues[EChartSettings.lollipopType]} 1
                    </label>
                  </div>
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="pie2"
                      id="pie2"
                      value={PieType.Pie2}
                      checked={
                        pieConfigValues[EPieSettings.pieType] === PieType.Pie2
                      }
                    />
                    <label className="radio-label" htmlFor="pie2">
                      {configValues[EChartSettings.lollipopType]} 2
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="config">
              <label className="config-label" htmlFor={EPieSettings.pieSize}>
                {configValues[EChartSettings.lollipopType]} Size
              </label>
              <div className="config-option">
                <select
                  id={EPieSettings.pieSize}
                  value={pieConfigValues[pieConfigValues.pieType].pieSize}
                  onChange={(e) =>
                    handlePieChange(e.target.value, EPieSettings.pieSize)
                  }
                >
                  <option value={PieSize.Auto}>Auto</option>
                  <option value={PieSize.Custom}>Custom</option>
                </select>
              </div>
            </div>

            {pieConfigValues[pieConfigValues.pieType].pieSize ===
              PieSize.Auto && (
                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EPieSettings.maxPieRadius}
                  >
                    Max {configValues[EChartSettings.lollipopType]} Radius
                  </label>
                  <div className="config-option">
                    <input
                      id={EPieSettings.maxPieRadius}
                      type="number"
                      value={
                        pieConfigValues[pieConfigValues.pieType].maxPieRadius
                      }
                      onChange={(e: any) => {
                        handlePieChange(
                          +e.target.value,
                          EPieSettings.maxPieRadius
                        );
                      }}
                    />
                  </div>
                </div>
              )}

            {pieConfigValues[pieConfigValues.pieType].pieSize ===
              PieSize.Custom && (
                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EPieSettings.pieRadius}
                  >
                    {configValues[EChartSettings.lollipopType]} Radius
                  </label>
                  <div className="config-option">
                    <input
                      id={EPieSettings.pieRadius}
                      type="number"
                      value={pieConfigValues[pieConfigValues.pieType].pieRadius}
                      onChange={(e: any) => {
                        handlePieChange(+e.target.value, EPieSettings.pieRadius);
                      }}
                    />
                  </div>
                </div>
              )}
          </React.Fragment>
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
      </div> */}
    </>
  );
};

export default ChartSettings;
