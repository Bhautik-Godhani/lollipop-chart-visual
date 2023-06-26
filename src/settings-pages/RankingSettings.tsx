import * as React from "react";
import { RANKING_SETTINGS } from "../constants";
import {
  EChartConfig,
  ERankingSettings,
  EVisualConfig,
  LollipopType,
  RankingDataValuesType,
  RankingFilterType,
} from "../enum";
import { adjoinRGB, splitRGB } from "../methods";
import { IChartSettings } from "../visual-settings.interface";
import ColorPicker from "./ColorPicker";

const RankingSettings = (props) => {
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
      ...RANKING_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...RANKING_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const [configValues, setConfigValues] = React.useState({
    ...initialStates,
  });

  let valueType = configValues[ERankingSettings.valueType];

  const [subCategoriesConfigValues, setSubCategoriesConfigValues] =
    React.useState(
      configValues[valueType][ERankingSettings.subCategoriesRanking]
    );

  React.useEffect(() => {
    setConfigValues((d) => ({
      ...d,
      [valueType]: {
        ...d[valueType],
        [ERankingSettings.subCategoriesRanking]: subCategoriesConfigValues,
      },
    }));
  }, [subCategoriesConfigValues]);

  const isDumbbellChart =
    !!vizOptions.options.dataViews[0].categorical.values[1];

  if (!isDumbbellChart) {
    valueType = RankingDataValuesType.Value1;
  }

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [valueType]: { ...d[valueType], [n]: val },
    }));
  };

  const handleSubCategoriesChange = (val, n) => {
    setSubCategoriesConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleRadioButtonChange = (key: string, value: string) => {
    setConfigValues((d) => ({
      ...d,
      [key]: value,
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [valueType]: { ...d[valueType], [n]: !d[valueType][n] },
    }));
  };

  const handleSubCategoriesCheckbox = (n) => {
    setSubCategoriesConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleColorChange = ({ rgb }, n) => {
    setConfigValues((d: any) => ({
      ...d,
      [valueType]: { ...d[valueType], [n]: adjoinRGB(rgb) },
    }));
  };

  const handleSubCategoriesColorChange = ({ rgb }, n) => {
    setSubCategoriesConfigValues((d: any) => ({
      ...d,
      [n]: adjoinRGB(rgb),
    }));
  };

  const categorical = vizOptions.options.dataViews[0].categorical;
  const value1DisplayName = categorical.values[0]?.source.displayName;
  const value2DisplayName = categorical.values[1]?.source.displayName;

  const chartSettings: IChartSettings = JSON.parse(
    vizOptions.formatTab[EVisualConfig.ChartConfig][EChartConfig.ChartSettings]
  );

  return (
    <>
      <div className="config-container">
        <div className="config config-switch">
          <label className="config-label" htmlFor="isRankingEnabled">
            Enable Ranking
          </label>
          <div className="config-option">
            <label className="switch">
              <input
                id="isRankingEnabled"
                type="checkbox"
                checked={configValues[ERankingSettings.isRankingEnabled]}
                onChange={() => {
                  setConfigValues((d) => ({
                    ...d,
                    [ERankingSettings.isRankingEnabled]:
                      !d[ERankingSettings.isRankingEnabled],
                  }));
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {configValues[ERankingSettings.isRankingEnabled] && (
          <React.Fragment>
            {isDumbbellChart && (
              <div
                className="radio-button-group"
                onChange={(e: any) =>
                  handleRadioButtonChange(
                    ERankingSettings.valueType,
                    e.target.value
                  )
                }
              >
                <span className="radio-group-title">Select Category:</span>
                <div className="radio-buttons">
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="value1"
                      id="value1"
                      value={RankingDataValuesType.Value1}
                      checked={
                        configValues[ERankingSettings.valueType] ===
                        RankingDataValuesType.Value1
                      }
                    />
                    <label className="radio-label" htmlFor="pie1">
                      {value1DisplayName}
                    </label>
                  </div>
                  <div className="radio-button">
                    <input
                      className="radio-input"
                      type="radio"
                      name="value2"
                      id="value2"
                      value={RankingDataValuesType.Value2}
                      checked={
                        configValues[ERankingSettings.valueType] ===
                        RankingDataValuesType.Value2
                      }
                    />
                    <label className="radio-label" htmlFor="pie2">
                      {value2DisplayName}
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="config">
              <label className="config-label" htmlFor="filterType">
                Filter Type
              </label>
              <div className="config-option">
                <select
                  id="filterType"
                  value={configValues[valueType][ERankingSettings.filterType]}
                  onChange={(e) =>
                    handleChange(e.target.value, ERankingSettings.filterType)
                  }
                >
                  <option value={RankingFilterType.TopN}>Top N</option>
                  <option value={RankingFilterType.BottomN}>Bottom N</option>
                  <option value={RankingFilterType.None}>None</option>
                </select>
              </div>
            </div>

            {configValues[valueType][ERankingSettings.filterType] !==
              RankingFilterType.None && (
              <React.Fragment>
                <div className="config">
                  <label className="config-label" htmlFor="count">
                    Count
                  </label>
                  <div className="config-option">
                    <input
                      id="count"
                      type="number"
                      value={configValues[valueType][ERankingSettings.count]}
                      onChange={(e: any) => {
                        handleChange(+e.target.value, ERankingSettings.count);
                      }}
                    />
                  </div>
                </div>

                <div className="config config-switch">
                  <label
                    className="config-label"
                    htmlFor="showRemainingAsOthers"
                  >
                    Show remaining as Others
                  </label>
                  <div className="config-option">
                    <label className="switch">
                      <input
                        id="showRemainingAsOthers"
                        type="checkbox"
                        checked={
                          configValues[valueType][
                            ERankingSettings.showRemainingAsOthers
                          ]
                        }
                        onChange={(e: any) => {
                          handleCheckbox(
                            ERankingSettings.showRemainingAsOthers
                          );
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                {configValues[valueType][
                  ERankingSettings.showRemainingAsOthers
                ] && (
                  <React.Fragment>
                    {chartSettings.lollipopType === LollipopType.Circle && (
                      <React.Fragment>
                        <div className="config">
                          <label className="config-label" htmlFor="circleColor">
                            Circle Color
                          </label>
                          <div className="config-option" id="circleColor">
                            <ColorPicker
                              color={splitRGB(
                                configValues[valueType][
                                  ERankingSettings.circleFillColor
                                ]
                              )}
                              handleChange={(c) =>
                                handleColorChange(
                                  c,
                                  ERankingSettings.circleFillColor
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="config">
                          <label
                            className="config-label"
                            htmlFor="circleStrokeColor"
                          >
                            Circle Border Color
                          </label>
                          <div className="config-option" id="circleStrokeColor">
                            <ColorPicker
                              color={splitRGB(
                                configValues[valueType][
                                  ERankingSettings.circleStrokeColor
                                ]
                              )}
                              handleChange={(c) =>
                                handleColorChange(
                                  c,
                                  ERankingSettings.circleStrokeColor
                                )
                              }
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    )}

                    {chartSettings.lollipopType !== LollipopType.Circle && (
                      <div className="config">
                        <label className="config-label" htmlFor="circleColor">
                          {chartSettings.lollipopType} Slice Color
                        </label>
                        <div className="config-option" id="circleColor">
                          <ColorPicker
                            color={splitRGB(
                              configValues[valueType][
                                ERankingSettings.pieSliceColor
                              ]
                            )}
                            handleChange={(c) =>
                              handleColorChange(
                                c,
                                ERankingSettings.pieSliceColor
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="config">
                      <label className="config-label" htmlFor="lineColor">
                        Line Color
                      </label>
                      <div className="config-option" id="lineColor">
                        <ColorPicker
                          color={splitRGB(
                            configValues[valueType][ERankingSettings.lineColor]
                          )}
                          handleChange={(c) =>
                            handleColorChange(c, ERankingSettings.lineColor)
                          }
                        />
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}

            {chartSettings.lollipopType !== LollipopType.Circle && (
              <React.Fragment>
                <div className="config config-switch">
                  <label
                    className="config-label"
                    htmlFor="isRankingSubcategory"
                  >
                    Sub Category Ranking
                  </label>
                  <div className="config-option">
                    <label className="switch">
                      <input
                        id="isRankingSubcategory"
                        type="checkbox"
                        checked={
                          configValues[valueType][
                            ERankingSettings.isSubcategoriesRanking
                          ]
                        }
                        onChange={(e: any) => {
                          handleCheckbox(
                            ERankingSettings.isSubcategoriesRanking
                          );
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                {configValues[valueType][
                  ERankingSettings.isSubcategoriesRanking
                ] && (
                  <React.Fragment>
                    <div className="config">
                      <label className="config-label" htmlFor="filterType">
                        Filter Type
                      </label>
                      <div className="config-option">
                        <select
                          id="filterType"
                          value={
                            configValues[valueType][
                              ERankingSettings.subCategoriesRanking
                            ][ERankingSettings.filterType]
                          }
                          onChange={(e) =>
                            handleSubCategoriesChange(
                              e.target.value,
                              ERankingSettings.filterType
                            )
                          }
                        >
                          <option value={RankingFilterType.TopN}>Top N</option>
                          <option value={RankingFilterType.BottomN}>
                            Bottom N
                          </option>
                          <option value={RankingFilterType.None}>None</option>
                        </select>
                      </div>
                    </div>

                    {configValues[valueType][
                      ERankingSettings.subCategoriesRanking
                    ][ERankingSettings.filterType] !==
                      RankingFilterType.None && (
                      <React.Fragment>
                        <div className="config">
                          <label className="config-label" htmlFor="count">
                            Count
                          </label>
                          <div className="config-option">
                            <input
                              id="count"
                              type="number"
                              value={
                                configValues[valueType][
                                  ERankingSettings.subCategoriesRanking
                                ][ERankingSettings.count]
                              }
                              onChange={(e: any) => {
                                handleSubCategoriesChange(
                                  +e.target.value,
                                  ERankingSettings.count
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="config config-switch">
                          <label
                            className="config-label"
                            htmlFor="showRemainingAsOthers"
                          >
                            Show remaining as Others
                          </label>
                          <div className="config-option">
                            <label className="switch">
                              <input
                                id="showRemainingAsOthers"
                                type="checkbox"
                                checked={
                                  configValues[valueType][
                                    ERankingSettings.subCategoriesRanking
                                  ][ERankingSettings.showRemainingAsOthers]
                                }
                                onChange={(e: any) => {
                                  handleSubCategoriesCheckbox(
                                    ERankingSettings.showRemainingAsOthers
                                  );
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>

                        {configValues[valueType][
                          ERankingSettings.subCategoriesRanking
                        ][ERankingSettings.showRemainingAsOthers] && (
                          <div>
                            <div className="config">
                              <label
                                className="config-label"
                                htmlFor="circleColor"
                              >
                                {chartSettings.lollipopType} Slice Color
                              </label>
                              <div className="config-option" id="circleColor">
                                <ColorPicker
                                  color={splitRGB(
                                    configValues[valueType][
                                      ERankingSettings.subCategoriesRanking
                                    ][ERankingSettings.pieSliceColor]
                                  )}
                                  handleChange={(c) =>
                                    handleSubCategoriesColorChange(
                                      c,
                                      ERankingSettings.pieSliceColor
                                    )
                                  }
                                />
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
      </div>
    </>
  );
};

export default RankingSettings;
