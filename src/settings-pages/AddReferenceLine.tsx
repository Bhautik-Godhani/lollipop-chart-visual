import * as React from "react";
import { isEmpty } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faAlignRight,
  faAlignCenter,
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { REFERENCE_LINES_SETTINGS } from "../constants";
import {
  EBeforeAfterPosition,
  EReferenceLineComputation,
  EReferenceLinesType,
  EVisualSettings,
  EXYAxisNames,
  ELineType,
  Orientation,
  Position,
  EStartEndPosition,
} from "../enum";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  SwitchOption,
  Footer,
  SelectInput,
  ColorPicker,
  Accordion,
} from "@truviz/shadow/dist/Components";
import { BoldIcon, DashedLineIcon, DottedLineIcon, HorizontalAlignment, HorizontalAlignmentRight, ItalicIcon, SolidLineIcon, UnderlineIcon, VerticalAlignment, VerticalAlignmentRight } from "./SettingsIcons";
import { IChartSettings, ILabelValuePair, IReferenceLinesSettings } from "../visual-settings.interface";
import { Visual } from "../visual";

const AddReferenceLines = ({ shadow, details, onAdd, onDelete, onUpdate, index, vizOptions, closeCurrentSettingHandler }) => {
  const shadow1: Visual = shadow;
  const isAddNew = isEmpty(details);
  const isInitialRender = React.useRef(0);
  const [configValues, setConfigValues] = React.useState<IReferenceLinesSettings>(
    isAddNew ? REFERENCE_LINES_SETTINGS : details
  );
  const [errors, setErros] = React.useState({
    value: "",
    rank: "",
  });

  React.useEffect(() => {
    if (configValues.type === "value") {
      setErros((s) => ({
        ...s,
        rank: "",
      }));
    } else {
      setErros((s) => ({
        ...s,
        value: "",
      }));
    }
  }, [configValues]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("rank");
    }
  }, [configValues.rank]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("value");
    }
  }, [configValues.value]);

  let chartSettings: IChartSettings = shadow1[EVisualSettings.ChartSettings];

  const AXIS_NAMES: { label: string; value: string; axis: string }[] = [
    {
      label: shadow1.categoryDisplayName,
      value: shadow1.categoryDisplayName,
      axis: EXYAxisNames.X,
    },
  ];

  // if (shadow1.isHasSubcategories) {
  //   shadow1.subCategoriesName.forEach((subCategory) => {
  //     AXIS_NAMES.push({
  //       label: subCategory,
  //       value: subCategory,
  //       axis: EXYAxisNames.Y,
  //     });
  //   });
  // } else {
  if (!shadow1.isHasMultiMeasure) {
    AXIS_NAMES.push({
      label: shadow1.measure1DisplayName,
      value: shadow1.measure1DisplayName,
      axis: EXYAxisNames.Y,
    });
  } else {
    AXIS_NAMES.push({
      label: shadow1.measure1DisplayName + ' & ' + shadow1.measure2DisplayName,
      value: shadow1.measure1DisplayName,
      axis: EXYAxisNames.Y,
    });
  }

  // }

  if (shadow1.categoricalReferenceLinesNames?.length) {
    shadow1.categoricalReferenceLinesNames.forEach((name) => {
      AXIS_NAMES.push({
        label: name,
        value: name,
        axis: EXYAxisNames.Y,
      });
    });
  }

  const LINE_TYPES: ILabelValuePair[] = [
    {
      label: "Ranking",
      value: EReferenceLinesType.Ranking,
    },
    {
      label: "Value",
      value: EReferenceLinesType.Value,
    },
  ];

  const ComputationTypeList: ILabelValuePair[] = [
    {
      label: "Min",
      value: EReferenceLineComputation.Min,
    },
    {
      label: "Max",
      value: EReferenceLineComputation.Max,
    },
    {
      label: "Average",
      value: EReferenceLineComputation.Average,
    },
    {
      label: "Median",
      value: EReferenceLineComputation.Median,
    },
    {
      label: "Fixed",
      value: EReferenceLineComputation.Fixed,
    },
  ];

  let LABEL_POSITION: ILabelValuePair[];
  if (chartSettings.orientation === Orientation.Vertical) {
    LABEL_POSITION = [
      {
        label: "BEFORE",
        value: EBeforeAfterPosition.Before,
      },
      {
        label: "AFTER",
        value: EBeforeAfterPosition.After,
      },
    ];
  } else {
    LABEL_POSITION = [
      {
        label: "TOP",
        value: EBeforeAfterPosition.Before,
      },
      {
        label: "BELOW",
        value: EBeforeAfterPosition.After,
      },
    ];
  }

  const RANK_ORDER: ILabelValuePair[] = [];
  if (configValues.axis === "Y" && !shadow1.isHorizontalChart) {
    RANK_ORDER.push({
      label: "BOTTOM",
      value: Position.Bottom,
    });

    RANK_ORDER.push({
      label: "TOP",
      value: Position.Top,
    });
  } else {
    RANK_ORDER.push({
      label: "START",
      value: Position.Start,
    });

    RANK_ORDER.push({
      label: "END",
      value: Position.End,
    });
  }

  const BarAreaPositionToHighlightList: ILabelValuePair[] = [];
  if (
    (configValues["axis"] === EXYAxisNames.X && !shadow1.isHorizontalChart) ||
    (configValues["axis"] === EXYAxisNames.Y && shadow1.isHorizontalChart)
  ) {
    BarAreaPositionToHighlightList.push({
      label: "LEFT",
      value: Position.Left,
    });

    BarAreaPositionToHighlightList.push({
      label: "RIGHT",
      value: Position.Right,
    });
  }

  if (
    (configValues["axis"] === EXYAxisNames.X && shadow1.isHorizontalChart) ||
    (configValues["axis"] === EXYAxisNames.Y && !shadow1.isHorizontalChart)
  ) {
    BarAreaPositionToHighlightList.push({
      label: "TOP",
      value: Position.Top,
    });

    BarAreaPositionToHighlightList.push({
      label: "BOTTOM",
      value: Position.Bottom,
    });
  }

  const LinePositionOnBarList: ILabelValuePair[] = [];
  if (chartSettings.orientation === Orientation.Vertical) {
    LinePositionOnBarList.push({
      label: "LEFT",
      value: Position.Left,
    });

    LinePositionOnBarList.push({
      label: "RIGHT",
      value: Position.Right,
    });
  }

  if (chartSettings.orientation === Orientation.Horizontal) {
    LinePositionOnBarList.push({
      label: "TOP",
      value: Position.Top,
    });

    LinePositionOnBarList.push({
      label: "BOTTOM",
      value: Position.Bottom,
    });
  }

  const ALIGNMENT_OPTIONS = [
    {
      value: "left",
      label: <FontAwesomeIcon icon={faAlignLeft} />,
    },
    {
      value: "center",
      label: <FontAwesomeIcon icon={faAlignCenter} />,
    },
    {
      value: "right",
      label: <FontAwesomeIcon icon={faAlignRight} />,
    },
  ];

  const ORIENTATION_LEFT = [
    {
      label: <HorizontalAlignment fill="currentColor" />,
      value: "horizontal",
    },
    {
      label: <VerticalAlignment fill="currentColor" />,
      value: "vertical",
    },
  ];

  const ORIENTATION_RIGHT = [
    {
      label: <HorizontalAlignmentRight fill="currentColor" />,
      value: "horizontal",
    },
    {
      label: <VerticalAlignmentRight fill="currentColor" />,
      value: "vertical",
    },
  ];

  if (
    configValues.axis == EXYAxisNames.X &&
    !shadow1.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Bottom ||
      configValues.barAreaPositionToHighlight === Position.Top)
  ) {
    configValues.barAreaPositionToHighlight = Position.Left;
  }

  if (
    configValues.axis == EXYAxisNames.X &&
    shadow1.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Left ||
      configValues.barAreaPositionToHighlight === Position.Right)
  ) {
    configValues.barAreaPositionToHighlight = Position.Bottom;
  }
  1
  if (
    configValues.axis == EXYAxisNames.Y &&
    !shadow1.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Left ||
      configValues.barAreaPositionToHighlight === Position.Right)
  ) {
    configValues.barAreaPositionToHighlight = Position.Bottom;
  }

  if (
    configValues.axis == EXYAxisNames.Y &&
    shadow1.isHorizontalChart &&
    (configValues.barAreaPositionToHighlight === Position.Bottom ||
      configValues.barAreaPositionToHighlight === Position.Top)
  ) {
    configValues.barAreaPositionToHighlight = Position.Left;
  }

  const validateField = (fieldName) => {
    if (!Object.keys(errors).includes(fieldName)) return true;

    if (!configValues[fieldName]) {
      setErros((s) => ({
        ...s,
        [fieldName]: "This field can not be empty.",
      }));
      return false;
    } else {
      setErros((s) => ({
        ...s,
        [fieldName]: "",
      }));
    }
    return true;
  };

  const handleAdd = () => {
    if (configValues.type === "value" && configValues.axis === EXYAxisNames.Y && configValues.computation === EReferenceLineComputation.Fixed && !configValues.value) return;
    if (configValues.type === "value" && configValues.axis === EXYAxisNames.X && !configValues.value) return;
    if (configValues.type === "ranking" && !validateField("rank")) return;

    if (isAddNew) {
      onAdd(configValues);
      return;
    }
    onUpdate(index, configValues);
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: rgb,
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleAxisChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  React.useEffect(() => {
    if (!configValues.measureName) {
      setConfigValues({ ...configValues, measureName: AXIS_NAMES[0].value });
    }
  }, []);

  const resetChanges = () => {
    setConfigValues({ ...REFERENCE_LINES_SETTINGS });
  };

  return (
    <>
      <Accordion title="Line Options" childBottomPadding>
        <Row>
          <Column>
            <SelectInput
              label={"Measure"}
              value={configValues.measureName}
              optionsList={AXIS_NAMES}
              handleChange={(value, e) => {
                handleChange(e.axis, "axis");
                handleChange(e.value, "measureName");

                if (shadow1.isHorizontalChart) {
                  if (
                    e.axis === EXYAxisNames.Y &&
                    (configValues.rankOrder === Position.Top || configValues.rankOrder === Position.Bottom)
                  ) {
                    handleChange(Position.Start, "rankOrder");
                  } else if (
                    e.axis === EXYAxisNames.X &&
                    (configValues.rankOrder === Position.Start || configValues.rankOrder === Position.End)
                  ) {
                    handleChange(Position.Top, "rankOrder");
                  }
                } else {
                  if (
                    e.axis === EXYAxisNames.X &&
                    (configValues.rankOrder === Position.Top || configValues.rankOrder === Position.Bottom)
                  ) {
                    handleChange(Position.Start, "rankOrder");
                  } else if (
                    e.axis === EXYAxisNames.Y &&
                    (configValues.rankOrder === Position.Start || configValues.rankOrder === Position.End)
                  ) {
                    handleChange(Position.Top, "rankOrder");
                  }
                }
              }}
            />
          </Column>

          <Column>
            <SelectInput
              label={"At"}
              value={configValues.type}
              optionsList={LINE_TYPES}
              handleChange={value => handleChange(value, "type")}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.type === "value" && configValues.axis === EXYAxisNames.X}>
          <Row>
            <Column>
              <InputControl
                type="text"
                value={configValues.value}
                handleChange={(value: any) => handleChange(value, "value")}
                min={1}
                label="Value"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <ConditionalWrapper visible={configValues.type === "value" && configValues.axis === EXYAxisNames.Y}>
          <Row>
            <Column>
              <SelectInput
                label={"Computation"}
                value={configValues.computation}
                optionsList={ComputationTypeList}
                handleChange={(value, e) => handleChange(value, "computation")}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.computation === EReferenceLineComputation.Fixed}>
            <Row>
              <Column>
                <InputControl
                  type="text"
                  value={configValues.value}
                  handleChange={(value: any) => handleChange(value, "value")}
                  min={1}
                  label="Value"
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </ConditionalWrapper>

        <ConditionalWrapper visible={configValues.type === "ranking"}>
          <Row>
            <Column>
              <SelectInput
                label={"Rank From"}
                value={configValues.rankOrder}
                optionsList={RANK_ORDER}
                handleChange={newValue => handleChange(newValue, "rankOrder")}
              />
            </Column>
            <Column>
              <InputControl
                type="number"
                label="Rank"
                value={configValues.rank}
                min={1}
                handleChange={(value: any) => handleChange(value, "rank")}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <SwitchOption
              label="Line Style"
              value={configValues.lineStyle}
              optionsList={[
                {
                  label: <SolidLineIcon fill="currentColor" />,
                  value: "solid",
                },
                {
                  label: <DashedLineIcon fill="currentColor" />,
                  value: "dashed",
                },
                {
                  label: <DottedLineIcon fill="currentColor" />,
                  value: "dotted",
                },
              ]}
              handleChange={value => handleChange(value, "lineStyle")}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              type="number"
              value={configValues.lineWidth}
              handleChange={(value: any) => {
                handleChange(value, "lineWidth");
              }}
              min={1}
              label="Width"
            />
          </Column>

          <Column>
            <ColorPicker
              label={"Color"}
              color={configValues.lineColor}
              handleChange={value => handleChange(value, "lineColor")}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>
      </Accordion>

      <Accordion title="Label Styles" childBottomPadding>
        <Row>
          <Column>
            <InputControl
              type="text"
              value={configValues.label}
              handleChange={(value: any) => {
                handleChange(value, "label");
              }}
              min={1}
              label="Label Name"
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={configValues.labelColor}
              handleChange={value => handleChange(value, "labelColor")}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Background"}
              color={configValues.labelBackgroundColor}
              handleChange={value => handleChange(value, "labelBackgroundColor")}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
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
              handleChange={newValue => handleChange(newValue, "labelFontFamily")}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SwitchOption
              label="Styling"
              value={configValues.styling}
              optionsList={[
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
              ]}
              isMultiple
              handleChange={value => handleChange(value, "styling")}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ToggleButton
              label="Auto Font Size"
              value={configValues.autoFontSize}
              handleChange={value => handleCheckbox("autoFontSize")}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!configValues.autoFontSize}>
          <Row>
            <Column>
              <InputControl
                type="number"
                value={configValues.labelFontSize}
                handleChange={(value: any) => {
                  handleChange(value, "labelFontSize");
                }}
                min={1}
              />
            </Column>
            <Column></Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <SwitchOption
              label="Position"
              value={configValues.labelPosition}
              optionsList={LABEL_POSITION}
              handleChange={value => handleChange(value, "labelPosition")}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SwitchOption
              label="Alignment"
              value={configValues.labelAlignment}
              optionsList={ALIGNMENT_OPTIONS}
              handleChange={value => handleChange(value, "labelAlignment")}
            />
          </Column>
          <Column>
            {configValues.axis === "X" && (
              <SwitchOption
                label="Orientation"
                value={""}
                optionsList={configValues.labelPosition === "before" ? ORIENTATION_LEFT : ORIENTATION_RIGHT}
                handleChange={value => handleChange(value, "labelOrientation")}
              />
            )}
          </Column>
        </Row>
      </Accordion>

      <Accordion title="Border Styles" childBottomPadding>
        <Row>
          <Column>
            <ToggleButton
              label="Enable"
              value={configValues.labelBorder}
              handleChange={value => handleCheckbox("labelBorder")}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.labelBorder}>
          <Row>
            <Column>
              <SelectInput
                label="Border Radius"
                value={configValues.labelBorderRadius}
                optionsList={[
                  {
                    label: "Sharp",
                    value: "SHARP",
                  },
                  {
                    label: "Rounded",
                    value: "ROUNDED",
                  },
                  {
                    label: "Custom",
                    value: "CUSTOM",
                  },
                ]}
                handleChange={value => handleChange(value, "labelBorderRadius")}
              />
            </Column>
            <Column>
              {configValues.labelBorderRadius === "CUSTOM" && (
                <InputControl
                  type="number"
                  value={configValues.labelBorderRadiusCustom.toString()}
                  handleChange={(value: any) => {
                    handleChange(value, "labelBorderRadiusCustom");
                  }}
                  min={1}
                  label="Radius Value"
                />
              )}
            </Column>
          </Row>

          <Row>
            <Column>
              <InputControl
                type="number"
                value={configValues.labelBorderWidth.toString()}
                handleChange={(value: any) => {
                  handleChange(value, "labelBorderWidth");
                }}
                min={1}
                label="Width"
              />
            </Column>

            <Column>
              <ColorPicker
                label={"Border Color"}
                color={configValues.labelBorderColor}
                handleChange={value => handleChange(value, "labelBorderColor")}
                colorPalette={vizOptions.host.colorPalette}
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </Accordion>

      <Accordion title="Highlight Bar" childBottomPadding>
        <Row>
          <Column>
            <ToggleButton
              label={"Enable"}
              value={configValues.isHighlightBarArea}
              handleChange={() => handleCheckbox("isHighlightBarArea")}
              appearance="checkbox"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.isHighlightBarArea}>
          <Row>
            <Column>
              <SwitchOption
                label="Bar Area To Highlight"
                value={configValues.barAreaPositionToHighlight}
                optionsList={BarAreaPositionToHighlightList}
                handleChange={value => handleChange(value, "barAreaPositionToHighlight")}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={!shadow.isHorizontalChart && configValues.axis === EXYAxisNames.X || shadow.isHorizontalChart && configValues.axis === EXYAxisNames.X}>
            <Row>
              <Column>
                <SwitchOption
                  label="Line Position On Bar"
                  value={configValues.linePositionOnBar}
                  optionsList={LinePositionOnBarList}
                  handleChange={value => handleChange(value, "linePositionOnBar")}
                />
              </Column>
            </Row>
          </ConditionalWrapper>

          <Row>
            <Column>
              <ColorPicker
                label={"Shade Color"}
                color={configValues.shadeColor}
                handleChange={value => handleColor(value, "shadeColor")}
                colorPalette={vizOptions.host.colorPalette}
                size="sm"
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </Accordion>

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: isAddNew ? "APPLY" : "APPLY", handler: handleAdd }}
        resetButtonHandler={resetChanges}
        disableTopPadding
      />
    </>
  );
};

export default AddReferenceLines;
