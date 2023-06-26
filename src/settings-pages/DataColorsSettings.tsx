import * as React from "react";
import ColorPicker from "./ColorPicker";
import { CHART_SETTINGS, DATA_COLORS } from "../constants";
import { adjoinRGB, splitRGB } from "../methods";
import { COLORBREWER } from "../color-schemes";
import {
  CircleType,
  ColorPaletteType,
  DataRolesName,
  EChartConfig,
  EChartSettings,
  EDataColorsSettings,
  EVisualConfig,
  LollipopType,
  PieType,
} from "../enum";
import { IChartSettings } from "../visual-settings.interface";

const DataColorsSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    config,
    vizOptions,
    closeCurrentSettingHandler,
    closeAdvancedSettingsHandler,
  } = props;

  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...DATA_COLORS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...DATA_COLORS };
  }

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  const applyChanges = () => {
    if (!configValues[dataType][EDataColorsSettings.selectedCategoryName]) {
      configValues[dataType][EDataColorsSettings.selectedCategoryName] =
        subCategories[0];
    }
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const getCategoricalValuesIndexByKey = (key: string): number => {
    return vizOptions.options.dataViews[0].categorical.values?.findIndex(
      (data) => data.source.roles[key] === true
    );
  };

  let chartSettings: IChartSettings = JSON.parse(
    vizOptions.formatTab[EVisualConfig.ChartConfig][EChartConfig.ChartSettings]
  );

  if (!Object.keys(chartSettings).length) {
    chartSettings = { ...CHART_SETTINGS };
  }

  const isDumbbellChart =
    getCategoricalValuesIndexByKey(DataRolesName.Value2) !== -1;

  if (isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle) {
    configValues[configValues[EDataColorsSettings.dataType]].fillType =
      ColorPaletteType.Single;
  }

  if (!isDumbbellChart) {
    if (configValues[EDataColorsSettings.dataType] === CircleType.Circle2) {
      configValues[EDataColorsSettings.dataType] = CircleType.Circle1;
    }
    if (configValues[EDataColorsSettings.dataType] === PieType.Pie2) {
      configValues[EDataColorsSettings.dataType] = PieType.Pie1;
    }
  }

  if (
    chartSettings.lollipopType === LollipopType.Pie &&
    (configValues[EDataColorsSettings.dataType] === CircleType.Circle1 ||
      configValues[EDataColorsSettings.dataType] === CircleType.Circle2)
  ) {
    configValues[EDataColorsSettings.dataType] = PieType.Pie1;
  }

  if (
    chartSettings.lollipopType === LollipopType.Circle &&
    (configValues[EDataColorsSettings.dataType] === PieType.Pie1 ||
      configValues[EDataColorsSettings.dataType] === PieType.Pie2)
  ) {
    configValues[EDataColorsSettings.dataType] = CircleType.Circle1;
  }

  const dataType = configValues[EDataColorsSettings.dataType];
  const handleValue = (v, n) => {
    setConfigValues((d: any) => ({
      ...d,
      [dataType]: { ...d[dataType], [n]: v },
    }));
  };

  const classesArray = {
    diverging: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    qualitative: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    sequential: [3, 4, 5, 6, 7, 8, 9],
  };

  const handleChange = ({ rgb }, n) => {
    setConfigValues((d: any) => ({
      ...d,
      [dataType]: { ...d[dataType], [n]: adjoinRGB(rgb) },
    }));
  };

  const handleByCategoryChange = ({ rgb }, index) => {
    let updatedColors = [...configValues[dataType].byCategoryColors];
    updatedColors[index].color = adjoinRGB(rgb);
    setConfigValues((d: any) => ({
      ...d,
      [dataType]: { ...d[dataType], byCategoryColors: updatedColors },
    }));
  };

  const handleCheckbox = (key) => {
    setConfigValues((d: any) => ({
      ...d,
      [dataType]: { ...d[dataType], [key]: !d[dataType][key] },
    }));
  };

  const setColorPalette = (co) => {
    setConfigValues((d: any) => ({
      ...d,
      [dataType]: { ...d[dataType], schemeColors: co },
    }));
  };

  const handleRadioButtonChange = (key: string, value: string) => {
    setConfigValues((d) => ({
      ...d,
      [key]: value,
    }));
  };

  const isDisableGradientColorPalette =
    isDumbbellChart && chartSettings.lollipopType === LollipopType.Circle;

  const subCategories =
    vizOptions.options.dataViews[0].categorical?.categories[1]?.values.map(
      (value) => value.toString()
    ) ?? [];
  subCategories.sort((a, b) => a.localeCompare(b));

  return (
    <>
      <div className="config-container config-container-vertical config-container-colors">
        <div>
          {isDumbbellChart &&
            chartSettings.lollipopType === LollipopType.Circle && (
              <div
                className="radio-button-group"
                onChange={(e: any) =>
                  handleRadioButtonChange(
                    EDataColorsSettings.dataType,
                    e.target.value
                  )
                }
              >
                <span className="radio-group-title">Select Circle:</span>
                <div className="radio-buttons">
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="circle1"
                      id="circle1"
                      value={CircleType.Circle1}
                      checked={
                        configValues[EDataColorsSettings.dataType] ===
                        CircleType.Circle1
                      }
                    />
                    <label className="radio-label" htmlFor="circle1">
                      Circle 1
                    </label>
                  </div>
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="circle2"
                      id="circle2"
                      value={CircleType.Circle2}
                      checked={
                        configValues[EDataColorsSettings.dataType] ===
                        CircleType.Circle2
                      }
                    />
                    <label className="radio-label" htmlFor="circle2">
                      Circle 2
                    </label>
                  </div>
                </div>
              </div>
            )}

          {isDumbbellChart &&
            chartSettings.lollipopType !== LollipopType.Circle && (
              <div
                className="radio-button-group"
                onChange={(e: any) =>
                  handleRadioButtonChange(
                    EDataColorsSettings.dataType,
                    e.target.value
                  )
                }
              >
                <span className="radio-group-title">
                  Select {chartSettings[EChartSettings.lollipopType]}:
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
                        configValues[EDataColorsSettings.dataType] ===
                        PieType.Pie1
                      }
                    />
                    <label className="radio-label" htmlFor="pie1">
                      {chartSettings[EChartSettings.lollipopType]} 1
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
                        configValues[EDataColorsSettings.dataType] ===
                        PieType.Pie2
                      }
                    />
                    <label className="radio-label" htmlFor="pie2">
                      {chartSettings[EChartSettings.lollipopType]} 2
                    </label>
                  </div>
                </div>
              </div>
            )}

          {/* {!isDumbbellChart && configValues.dataType === CircleType.Circle1 ? (
            <div className="config-container-label">Circle 1 Colors:</div>
          ) : (
            <div className="config-container-label">Pie 1 Colors:</div>
          )} */}

          {!(
            isDumbbellChart &&
            chartSettings.lollipopType === LollipopType.Circle
          ) && (
            <div className="config">
              <label className="config-label" htmlFor="colorPalette">
                Color Palette
              </label>
              <div className="config-option">
                <select
                  id="colorPalette"
                  value={
                    isDumbbellChart &&
                    chartSettings.lollipopType === LollipopType.Circle
                      ? ColorPaletteType.Single
                      : configValues[dataType].fillType
                  }
                  onChange={(e: any) => handleValue(e.target.value, "fillType")}
                >
                  <option value={ColorPaletteType.Single}>Single</option>
                  <option
                    value={ColorPaletteType.PowerBi}
                    disabled={isDisableGradientColorPalette}
                  >
                    Power BI Theme
                  </option>
                  <option
                    value={ColorPaletteType.Gradient}
                    disabled={isDisableGradientColorPalette}
                  >
                    Gradient
                  </option>
                  {chartSettings.lollipopType !== LollipopType.Circle && (
                    <option
                      value={ColorPaletteType.ByCategory}
                      disabled={isDisableGradientColorPalette}
                    >
                      By Category
                    </option>
                  )}
                  <option
                    value={ColorPaletteType.Sequential}
                    disabled={isDisableGradientColorPalette}
                  >
                    Sequential
                  </option>
                  <option
                    value={ColorPaletteType.Diverging}
                    disabled={isDisableGradientColorPalette}
                  >
                    Diverging
                  </option>
                  <option
                    value={ColorPaletteType.Qualitative}
                    disabled={isDisableGradientColorPalette}
                  >
                    Qualitative
                  </option>
                </select>
              </div>
            </div>
          )}

          {configValues[dataType].fillType === ColorPaletteType.Single &&
            chartSettings.lollipopType === LollipopType.Circle && (
              <div>
                <div className="config">
                  <label className="config-label" htmlFor="circleColor">
                    Circle Color
                  </label>
                  <div className="config-option" id="circleColor">
                    <ColorPicker
                      color={splitRGB(
                        configValues[dataType][
                          EDataColorsSettings.circleFillColor
                        ]
                      )}
                      handleChange={(c) =>
                        handleChange(c, EDataColorsSettings.circleFillColor)
                      }
                    />
                  </div>
                </div>

                <div className="config">
                  <label className="config-label" htmlFor="borderColor">
                    Circle Border Color
                  </label>
                  <div className="config-option" id="borderColor">
                    <ColorPicker
                      color={splitRGB(
                        configValues[dataType][
                          EDataColorsSettings.circleStrokeColor
                        ]
                      )}
                      handleChange={(c) =>
                        handleChange(c, EDataColorsSettings.circleStrokeColor)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

          {configValues[dataType].fillType === ColorPaletteType.Single &&
            chartSettings.lollipopType !== LollipopType.Circle && (
              <div className="config">
                <label className="config-label" htmlFor="singleColor">
                  Pie Slice Color
                </label>
                <div className="config-option" id="singleColor">
                  <ColorPicker
                    color={splitRGB(
                      configValues[dataType][EDataColorsSettings.singleColor]
                    )}
                    handleChange={(c) =>
                      handleChange(c, EDataColorsSettings.singleColor)
                    }
                  />
                </div>
              </div>
            )}

          {configValues[dataType].fillType === "byCategory" &&
            configValues[dataType].byCategoryColors.map((category, index) => {
              return (
                <div className="color-container">
                  <p className="config-label">{category.name}</p>
                  <ColorPicker
                    color={splitRGB(category.color)}
                    handleChange={(c) => handleByCategoryChange(c, index)}
                  />
                </div>
              );
            })}

          {configValues[dataType].fillType === "gradient" && (
            <>
              <div>
                <div className="config">
                  <label className="config-label" htmlFor="minColor">
                    Min Color
                  </label>
                  <div className="config-option" id="minColor">
                    <ColorPicker
                      color={splitRGB(configValues[dataType].fillmin)}
                      handleChange={(c) => handleChange(c, "fillmin")}
                    />
                  </div>
                </div>

                <div className="config config-switch">
                  <label className="config-label" htmlFor="midColor">
                    Use Mid Color
                  </label>
                  <div className="config-option">
                    <label className="switch">
                      <input
                        id="midColor"
                        type="checkbox"
                        checked={configValues[dataType].midcolor}
                        onChange={() => {
                          handleCheckbox("midcolor");
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                {configValues[dataType].midcolor && (
                  <div className="config">
                    <label className="config-label" htmlFor="midColor">
                      Mid Color
                    </label>
                    <div className="config-option" id="midColor">
                      <ColorPicker
                        color={splitRGB(configValues[dataType].fillmid)}
                        handleChange={(c) => handleChange(c, "fillmid")}
                      />
                    </div>
                  </div>
                )}

                <div className="config">
                  <label className="config-label" htmlFor="maxColor">
                    Max Color
                  </label>
                  <div className="config-option" id="maxColor">
                    <ColorPicker
                      color={splitRGB(configValues[dataType].fillmax)}
                      handleChange={(c) => handleChange(c, "fillmax")}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {configValues[dataType].fillType === ColorPaletteType.ByCategory &&
            chartSettings.lollipopType !== LollipopType.Circle && (
              <React.Fragment>
                <div className="config">
                  <label className="config-label" htmlFor="defaultColor">
                    Categories Default Color
                  </label>
                  <div className="config-option" id="defaultColor">
                    <ColorPicker
                      color={splitRGB(
                        configValues[dataType][EDataColorsSettings.defaultColor]
                      )}
                      handleChange={(c) =>
                        handleChange(c, EDataColorsSettings.defaultColor)
                      }
                    />
                  </div>
                </div>

                <div className="config">
                  <label className="config-label" htmlFor="categoriesList">
                    Select Category
                  </label>
                  <div className="config-option">
                    <select
                      id="categoriesList"
                      value={
                        configValues[dataType][
                          EDataColorsSettings.selectedCategoryName
                        ] ?? subCategories[0]
                      }
                      onChange={(e: any) =>
                        handleValue(
                          e.target.value,
                          EDataColorsSettings.selectedCategoryName
                        )
                      }
                    >
                      {subCategories.map((category) => {
                        return <option value={category}>{category}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="config">
                  <label
                    className="config-label"
                    htmlFor="selectedCategoryColor"
                  >
                    Category Color
                  </label>
                  <div className="config-option" id="selectedCategoryColor">
                    <ColorPicker
                      color={splitRGB(
                        configValues[dataType][
                          EDataColorsSettings.selectedCategoryColor
                        ]
                      )}
                      handleChange={(c) =>
                        handleChange(
                          c,
                          EDataColorsSettings.selectedCategoryColor
                        )
                      }
                    />
                  </div>
                </div>
              </React.Fragment>
            )}

          {["diverging", "qualitative", "sequential"].includes(
            configValues[dataType].fillType
          ) && (
            <>
              <div>
                <div className="config">
                  <label className="config-label" htmlFor="numberOfDataClasses">
                    Number of data classes
                  </label>
                  <div className="config-option">
                    <select
                      id="numberOfDataClasses"
                      value={configValues[dataType].numberOfClasses}
                      onChange={(e: any) =>
                        handleValue(e.target.value, "numberOfClasses")
                      }
                    >
                      {classesArray[configValues[dataType].fillType].map(
                        (num) => {
                          return <option value={num}>{num}</option>;
                        }
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="color-palette-container">
                {Object.values(
                  COLORBREWER[configValues[dataType].fillType]
                ).map((el) => {
                  const co = el[configValues[dataType].numberOfClasses];
                  if (!co) return null;
                  return (
                    <div
                      className={`color-palette ${
                        JSON.stringify(co) ===
                        JSON.stringify(configValues[dataType].schemeColors)
                          ? "color-palette-selected"
                          : ""
                      }`}
                      onClick={() => setColorPalette(co)}
                    >
                      {co.map((cs) => {
                        return (
                          <>
                            <div
                              className="color-palette-individual"
                              style={{ backgroundColor: cs }}
                            ></div>
                          </>
                        );
                      })}

                      {/* {
													JSON.stringify(co) === JSON.stringify(configValues.schemeColors) && (
														<FontAwesomeIcon icon={faCheck} color="#ffffff" style={{marginLeft: '10px'}} />
													)
												} */}
                    </div>
                  );
                })}
              </div>

              <div className="config config-checkbox">
                <label className="config-label" htmlFor="reverseColor">
                  Reverse Color
                </label>
                <div className="config-option">
                  <input
                    id="reverseColor"
                    type="checkbox"
                    checked={configValues[dataType].reverse}
                    onClick={() => handleCheckbox("reverse")}
                  />
                </div>
              </div>

              {configValues[dataType].fillType != "qualitative" && (
                <div className="config config-checkbox">
                  <label className="config-label" htmlFor="makeGradient">
                    Make Gradient
                  </label>
                  <div className="config-option">
                    <input
                      id="makeGradient"
                      type="checkbox"
                      checked={configValues[dataType].isGradient}
                      onClick={() => handleCheckbox("isGradient")}
                    />
                  </div>
                </div>
              )}
            </>
          )}
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

export default DataColorsSettings;
