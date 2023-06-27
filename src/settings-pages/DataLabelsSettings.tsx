import * as React from "react";
import { DATA_LABELS_SETTINGS } from "../constants";
import {
  DataLabelsFontSizeType,
  DataLabelsPlacement,
  EDataLabelsSettings,
  EVisualConfig,
  EVisualSettings,
  FontStyle,
  LollipopType,
  Orientation,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import ColorPicker from "./ColorPicker";
import FontSelector from "./FontSelector";
import "../../style/range-slider.less";
import {
  IChartSettings,
  IDataLabelsSettings,
} from "../visual-settings.interface";

const DataLabelsSettings = (props) => {
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
      ...DATA_LABELS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DATA_LABELS_SETTINGS };
  }

  const sliderRef = React.useRef(null);

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

  const handleColor = ({ rgb }, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const chartSettings: IChartSettings = shadow.chartSettings;

  const dataLabelsSettings: IDataLabelsSettings = JSON.parse(
    vizOptions.formatTab[EVisualConfig.DataLabelsConfig][
    EVisualSettings.DataLabelsSettings
    ]
  );

  if (!vizOptions.options.dataViews[0].categorical.categories[1]) {
    chartSettings.lollipopType = LollipopType.Circle;
  }

  if (
    (!Object.keys(dataLabelsSettings).length &&
      chartSettings.lollipopType !== LollipopType.Circle) ||
    (dataLabelsSettings.placement === DataLabelsPlacement.Inside &&
      configValues[EDataLabelsSettings.placement] ===
      DataLabelsPlacement.Outside)
  ) {
    configValues[EDataLabelsSettings.fontSize] = 12;
    const color = configValues[EDataLabelsSettings.color];
    if (color === "#fff" || color === "rgba(255, 255, 255, 1)") {
      configValues[EDataLabelsSettings.color] = "rgb(102,102,102)";
    }
  }

  if (
    dataLabelsSettings.placement === DataLabelsPlacement.Outside &&
    configValues[EDataLabelsSettings.placement] === DataLabelsPlacement.Inside
  ) {
    const color = configValues[EDataLabelsSettings.color];
    if (color === "rgb(102,102,102)" || color === "rgba(102,102,102, 1)") {
      configValues[EDataLabelsSettings.color] = "#fff";
    }
  }

  return (
    <>
      {/* <div className="config-container">
        <div className="config config-switch">
          <label className="config-label" htmlFor={EDataLabelsSettings.show}>
            Show Data Labels
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id={EDataLabelsSettings.show}
                type="checkbox"
                checked={configValues.show}
                onChange={(e: any) => {
                  handleCheckbox(EDataLabelsSettings.show);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {configValues.show && (
          <React.Fragment>
            <div className="config">
              <label
                className="config-label"
                htmlFor={EDataLabelsSettings.color}
              >
                Font Color
              </label>
              <div className="config-option" id={EDataLabelsSettings.color}>
                <ColorPicker
                  color={splitRGB(configValues.color)}
                  handleChange={(c) => handleColor(c, "color")}
                />
              </div>
            </div>

            {chartSettings.lollipopType !== LollipopType.Circle && (
              <React.Fragment>
                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EDataLabelsSettings.borderColor}
                  >
                    Font Border Color
                  </label>
                  <div
                    className="config-option"
                    id={EDataLabelsSettings.borderColor}
                  >
                    <ColorPicker
                      color={splitRGB(configValues.borderColor)}
                      handleChange={(c) => handleColor(c, "borderColor")}
                    />
                  </div>
                </div>

                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EDataLabelsSettings.borderWidth}
                  >
                    Font Border Size
                  </label>
                  <div className="config-option">
                    <input
                      id={EDataLabelsSettings.borderWidth}
                      type="number"
                      value={configValues.borderWidth}
                      onChange={(e: any) => {
                        handleChange(
                          +e.target.value,
                          EDataLabelsSettings.borderWidth
                        );
                      }}
                    />
                  </div>
                </div>
              </React.Fragment>
            )}

            {chartSettings.lollipopType === LollipopType.Circle &&
              configValues[EDataLabelsSettings.placement] ===
                DataLabelsPlacement.Inside && (
                <React.Fragment>
                  <div className="config">
                    <label
                      className="config-label"
                      htmlFor={EDataLabelsSettings.fontSizeType}
                    >
                      Font Size Type
                    </label>
                    <div className="config-option">
                      <select
                        id={EDataLabelsSettings.fontSizeType}
                        value={configValues[EDataLabelsSettings.fontSizeType]}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            EDataLabelsSettings.fontSizeType
                          )
                        }
                      >
                        <option value={DataLabelsFontSizeType.Auto}>
                          Auto
                        </option>
                        <option value={DataLabelsFontSizeType.Custom}>
                          Custom
                        </option>
                      </select>
                    </div>
                  </div>
                </React.Fragment>
              )}

            {chartSettings.lollipopType === LollipopType.Circle &&
              (configValues[EDataLabelsSettings.fontSizeType] ===
                DataLabelsFontSizeType.Custom ||
                configValues[EDataLabelsSettings.placement] ===
                  DataLabelsPlacement.Outside) && (
                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EDataLabelsSettings.fontSize}
                  >
                    Font Size
                  </label>
                  <div className="config-option">
                    <input
                      id={EDataLabelsSettings.fontSize}
                      type="number"
                      value={configValues.fontSize}
                      onChange={(e: any) => {
                        handleChange(
                          +e.target.value,
                          EDataLabelsSettings.fontSize
                        );
                      }}
                    />
                  </div>
                </div>
              )}

            {chartSettings.lollipopType !== LollipopType.Circle && (
              <div className="config">
                <label
                  className="config-label"
                  htmlFor={EDataLabelsSettings.pieDataLabelFontSize}
                >
                  Max Font Size
                </label>
                <div className="config-option">
                  <input
                    id={EDataLabelsSettings.pieDataLabelFontSize}
                    type="number"
                    value={configValues.pieDataLabelFontSize}
                    onChange={(e: any) => {
                      handleChange(
                        +e.target.value,
                        EDataLabelsSettings.pieDataLabelFontSize
                      );
                    }}
                  />
                </div>
              </div>
            )}

            <div className="config">
              <label
                className="config-label"
                htmlFor={EDataLabelsSettings.fontFamily}
              >
                Font Family
              </label>
              <div
                id={EDataLabelsSettings.fontFamily}
                className="config-option"
              >
                <FontSelector
                  value={configValues.fontFamily}
                  handleChange={(d) => {
                    handleChange(d.value, "fontFamily");
                  }}
                />
              </div>
            </div>

            <div className="config">
              <label
                className="config-label"
                htmlFor={EDataLabelsSettings.fontStyle}
              >
                Font Style
              </label>
              <div className="config-option">
                <select
                  id={EDataLabelsSettings.fontStyle}
                  value={configValues[EDataLabelsSettings.fontStyle]}
                  onChange={(e) =>
                    handleChange(e.target.value, EDataLabelsSettings.fontStyle)
                  }
                >
                  <option value={FontStyle.Bold}>Bold</option>
                  <option value={FontStyle.Italic}>Italic</option>
                  <option value={FontStyle.None}>None</option>
                </select>
              </div>
            </div>

            {chartSettings.lollipopType === LollipopType.Circle && (
              <React.Fragment>
                <div className="config">
                  <label
                    className="config-label"
                    htmlFor={EDataLabelsSettings.placement}
                  >
                    Placement
                  </label>
                  <div className="config-option">
                    <select
                      id={EDataLabelsSettings.placement}
                      value={configValues[EDataLabelsSettings.placement]}
                      onChange={(e) =>
                        handleChange(
                          e.target.value,
                          EDataLabelsSettings.placement
                        )
                      }
                    >
                      <option value={DataLabelsPlacement.Inside}>Inside</option>
                      <option value={DataLabelsPlacement.Outside}>
                        Outside
                      </option>
                    </select>
                  </div>
                </div>

                {configValues[EDataLabelsSettings.placement] ===
                  DataLabelsPlacement.Outside && (
                  <div className="config">
                    <label
                      className="config-label"
                      htmlFor={EDataLabelsSettings.orientation}
                    >
                      Orientation
                    </label>
                    <div className="config-option">
                      <select
                        id={EDataLabelsSettings.orientation}
                        value={configValues.orientation}
                        onChange={(e) =>
                          handleChange(
                            e.target.value,
                            EDataLabelsSettings.orientation
                          )
                        }
                      >
                        <option value={Orientation.Horizontal}>
                          Horizontal
                        </option>
                        <option value={Orientation.Vertical}>Vertical</option>
                      </select>
                    </div>
                  </div>
                )}

                {configValues[EDataLabelsSettings.placement] ===
                  DataLabelsPlacement.Outside && (
                  <React.Fragment>
                    <div className="config config-switch">
                      <label
                        className="config-label"
                        htmlFor={EDataLabelsSettings.showBackground}
                      >
                        Show Background
                      </label>
                      <div className="config-option">
                        <label className="switch">
                          <input
                            id={EDataLabelsSettings.showBackground}
                            type="checkbox"
                            checked={configValues.showBackground}
                            onChange={(e: any) => {
                              handleCheckbox(
                                EDataLabelsSettings.showBackground
                              );
                            }}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>

                    {configValues.showBackground && (
                      <div>
                        <div className="config">
                          <label
                            className="config-label"
                            htmlFor={EDataLabelsSettings.backgroundColor}
                          >
                            Background Color
                          </label>
                          <div
                            className="config-option"
                            id={EDataLabelsSettings.backgroundColor}
                          >
                            <ColorPicker
                              color={splitRGB(configValues.backgroundColor)}
                              handleChange={(c) =>
                                handleColor(c, "backgroundColor")
                              }
                            />
                          </div>
                        </div>

                        <div className="config">
                          <label
                            className="config-label"
                            htmlFor={EDataLabelsSettings.transparency}
                          >
                            Transparency
                          </label>
                          <div className="config-option">
                            <input
                              id={EDataLabelsSettings.transparency}
                              className={"range-slider"}
                              min="0"
                              max="100"
                              type="range"
                              value={configValues.transparency}
                              ref={sliderRef}
                              onChange={(e: any) => {
                                handleChange(
                                  +e.target.value,
                                  EDataLabelsSettings.transparency
                                );
                              }}
                            />
                            <span className="config-value">
                              {configValues.transparency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
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

export default DataLabelsSettings;
