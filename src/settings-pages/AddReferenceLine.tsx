/* eslint-disable max-lines-per-function */
import * as React from "react";
import { isEmpty } from "lodash";
import { REFERENCE_LINES_SETTINGS } from "../constants";
import {
  EBeforeAfterPosition,
  EReferenceLineComputation,
  EReferenceLineLabelStyleProps,
  EReferenceLineNameTypes,
  EReferenceLineStyleProps,
  EReferenceLineType,
  EReferenceLineValueProps,
  EReferenceLinesSettings,
  EReferenceLinesType,
  EReferenceType,
  EXYAxisNames,
  Orientation,
  Position,
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
  Tabs,
  Tab,
} from "@truviz/shadow/dist/Components";
import { BoldIcon, BottomAlignmentIcon, CenterHorizontalAlignmentIcon, CenterVerticalAlignmentIcon, DashedLineIcon, DottedLineIcon, ItalicIcon, LeftAlignmentIcon, RightAlignmentIcon, SolidLineIcon, TopAlignmentIcon, UnderlineIcon } from "./SettingsIcons";
import { ILabelValuePair, IReferenceBandStyleProps, IReferenceLineLabelStyleProps, IReferenceLineSettings, IReferenceLineStyleProps, IReferenceLineValueProps } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

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

const LINE_PLACEMENTS: ILabelValuePair[] = [
  {
    label: "Front",
    value: EReferenceLineType.FRONT,
  },
  {
    label: "Behind",
    value: EReferenceLineType.BEHIND,
  },
];

const LABEL_NAME_TYPES: ILabelValuePair[] = [
  {
    label: "Text",
    value: EReferenceLineNameTypes.TEXT,
  },
  {
    label: "Value",
    value: EReferenceLineNameTypes.VALUE,
  },
  {
    label: "Text & Value",
    value: EReferenceLineNameTypes.TEXT_VALUE,
  },
];

const LABEL_ORIENTATION: ILabelValuePair[] = [
  {
    label: "Vertical",
    value: Orientation.Vertical,
  },
  {
    label: "Horizontal",
    value: Orientation.Horizontal,
  },
];

const ComputationTypeList: ILabelValuePair[] = [
  {
    label: "Zero Base Line",
    value: EReferenceLineComputation.ZeroBaseline,
  },
  {
    label: "Minimum",
    value: EReferenceLineComputation.Min,
  },
  {
    label: "Maximum",
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
    label: "Standard Deviation",
    value: EReferenceLineComputation.StandardDeviation,
  },
  {
    label: "Fixed",
    value: EReferenceLineComputation.Fixed,
  },
];

let ALIGNMENT_OPTIONS = []

const Get_AXIS_NAMES = (shadow: Visual) => {
  const AXIS_NAMES: { label: string; value: string; axis: string }[] = [
    {
      label: shadow.categoryDisplayName,
      value: shadow.categoryDisplayName,
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
  if (!shadow.isHasMultiMeasure) {
    AXIS_NAMES.push({
      label: shadow.measure1DisplayName,
      value: shadow.measure1DisplayName,
      axis: EXYAxisNames.Y,
    });
  } else {
    AXIS_NAMES.push({
      label: shadow.measure1DisplayName + ' & ' + shadow.measure2DisplayName,
      value: shadow.measure1DisplayName,
      axis: EXYAxisNames.Y,
    });
  }
  // }

  if (shadow.categoricalReferenceLinesNames.length) {
    shadow.categoricalReferenceLinesNames.forEach((name) => {
      AXIS_NAMES.push({
        label: name,
        value: name,
        axis: EXYAxisNames.Y,
      });
    });
  }

  return AXIS_NAMES;
}

const Get_LABEL_POSITION = (shadow: Visual, configValues: IReferenceLineSettings) => {
  let LABEL_POSITION: ILabelValuePair[] = [];

  if (configValues.referenceType === EReferenceType.REFERENCE_LINE) {
    if (configValues.lineValue1.axis === EXYAxisNames.X) {
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
  } else {
    if (configValues.lineValue1.axis === EXYAxisNames.X) {
      LABEL_POSITION = [
        {
          label: "BEFORE",
          value: EBeforeAfterPosition.Before,
        },
        {
          label: "CENTER",
          value: EBeforeAfterPosition.Center,
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
          label: "CENTER",
          value: EBeforeAfterPosition.Center,
        },
        {
          label: "BELOW",
          value: EBeforeAfterPosition.After,
        },
      ];
    }
  }

  return LABEL_POSITION;
}

const Get_RANK_ORDER = (shadow: Visual, configValues: IReferenceLineValueProps) => {
  const RANK_ORDER: ILabelValuePair[] = [];
  if (configValues.axis === "Y" && !shadow.isHorizontalChart) {
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
  return RANK_ORDER;
}

const UILineValueOptions = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceLineSettings, lineValues: IReferenceLineValueProps, handleChange: (...args: any) => any, isValue2: boolean) => {
  const AXIS_NAMES = Get_AXIS_NAMES(shadow);
  const type = isValue2 ? EReferenceLinesSettings.LineValue2 : EReferenceLinesSettings.LineValue1;
  const line1Measure = [{
    label: AXIS_NAMES.find(d => d.value === configValues.lineValue1.measureName)?.label,
    value: configValues.lineValue1.measureName,
    axis: configValues.lineValue1.axis,
  }];

  return <>
    <Row>
      <Column>
        <SelectInput
          label={"Apply On"}
          value={lineValues.measureName}
          optionsList={isValue2 ? line1Measure : AXIS_NAMES}
          handleChange={(value, e) => {
            handleChange(e.axis, "axis", type);
            handleChange(e.value, "measureName", type);

            if (shadow.isHorizontalChart) {
              if (
                e.axis === EXYAxisNames.Y &&
                (lineValues.rankOrder === Position.Top || lineValues.rankOrder === Position.Bottom)
              ) {
                handleChange(Position.Start, "rankOrder", type);
              } else if (
                e.axis === EXYAxisNames.X &&
                (lineValues.rankOrder === Position.Start || lineValues.rankOrder === Position.End)
              ) {
                handleChange(Position.Top, "rankOrder", type);
              }
            } else {
              if (
                e.axis === EXYAxisNames.X &&
                (lineValues.rankOrder === Position.Top || lineValues.rankOrder === Position.Bottom)
              ) {
                handleChange(Position.Start, "rankOrder", type);
              } else if (
                e.axis === EXYAxisNames.Y &&
                (lineValues.rankOrder === Position.Start || lineValues.rankOrder === Position.End)
              ) {
                handleChange(Position.Top, "rankOrder", type);
              }
            }
          }}
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={lineValues.axis === EXYAxisNames.X}>
      <Row>
        <Column>
          <SelectInput
            label={"Based On"}
            value={lineValues.type}
            optionsList={isValue2 ?
              [{
                label: LINE_TYPES.find(d => d.value === configValues.lineValue1.type)?.label,
                value: configValues.lineValue1.type,
              }] : LINE_TYPES}
            handleChange={value => handleChange(value, "type", type)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={lineValues.type === "value"}>
        <Row>
          <Column>
            <SelectInput
              label={"Select Value"}
              value={lineValues.value}
              optionsList={shadow.chartData.map(d => ({
                label: d.category,
                value: d.category
              }))}
              handleChange={value => handleChange(value, "value", type)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      {UILineValueOptions1(vizOptions, shadow, lineValues, handleChange, isValue2)}
    </ConditionalWrapper>


    <ConditionalWrapper visible={lineValues.axis === EXYAxisNames.Y}>
      <Row>
        <Column>
          <SelectInput
            label={"Based On"}
            value={lineValues.computation}
            optionsList={isValue2 ? [{
              label: ComputationTypeList.find(d => d.value === configValues.lineValue1.computation)?.label,
              value: configValues.lineValue1.computation,
            }] : ComputationTypeList}
            handleChange={(value) => handleChange(value, "computation", type)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={lineValues.computation === EReferenceLineComputation.Fixed}>
        <Row>
          <Column>
            <InputControl
              type="text"
              value={lineValues.value}
              handleChange={(value: any) => handleChange(value, "value", type)}
              min={1}
              label="Value"
            />
          </Column>
        </Row>
      </ConditionalWrapper>
    </ConditionalWrapper>
  </>
}

const UILineValueOptions1 = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceLineValueProps, handleChange: (...args: any) => any, isValue2: boolean) => {
  const RANK_ORDER: ILabelValuePair[] = Get_RANK_ORDER(shadow, configValues);
  const type = isValue2 ? EReferenceLinesSettings.LineValue2 : EReferenceLinesSettings.LineValue1;

  return <>
    <ConditionalWrapper visible={configValues.type === "ranking"}>
      <Row>
        <Column>
          <SelectInput
            label={"Rank From"}
            value={configValues.rankOrder}
            optionsList={RANK_ORDER}
            handleChange={newValue => handleChange(newValue, "rankOrder", type)}
          />
        </Column>
        <Column>
          <InputControl
            type="number"
            label="Rank"
            value={configValues.rank}
            min={1}
            handleChange={(value: any) => handleChange(value, "rank", type)}
          />
        </Column>
      </Row>
    </ConditionalWrapper>
  </>
}

const UILineStyleOptions = (vizOptions: ShadowUpdateOptions, configValues: IReferenceLineStyleProps, handleChange: (...args: any) => any) => {
  return <>
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
          handleChange={value => handleChange(value, "lineStyle", EReferenceLinesSettings.LineStyle)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <InputControl
          type="number"
          value={configValues.lineWidth}
          handleChange={(value: any) => {
            handleChange(value, "lineWidth", EReferenceLinesSettings.LineStyle);
          }}
          min={1}
          label="Width"
        />
      </Column>

      <Column>
        <ColorPicker
          label={"Color"}
          color={configValues.lineColor}
          handleChange={value => handleChange(value, "lineColor", EReferenceLinesSettings.LineStyle)}
          colorPalette={vizOptions.host.colorPalette}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <SwitchOption
          label="Line Placement"
          value={configValues.linePlacement}
          optionsList={LINE_PLACEMENTS}
          handleChange={(value) => handleChange(value, EReferenceLineStyleProps.LinePlacement, EReferenceLinesSettings.LineStyle)}
        />
      </Column>
    </Row>
  </>
}

const UILabelStyles = (vizOptions: ShadowUpdateOptions, shadow: Visual, config: IReferenceLineSettings, configValues: IReferenceLineLabelStyleProps, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
  return <Accordion title="Label Styles" childBottomPadding>
    <Row>
      <Column>
        <ToggleButton
          label="Show Labels"
          value={configValues.show}
          handleChange={() => handleCheckbox(EReferenceLineLabelStyleProps.Show, EReferenceLinesSettings.LabelStyle)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={configValues.show}>
      <Row>
        <Column>
          <SelectInput
            label={"Label Types"}
            value={configValues.labelNameType}
            optionsList={LABEL_NAME_TYPES}
            handleChange={value => handleChange(value, EReferenceLineLabelStyleProps.LabelNameType, EReferenceLinesSettings.LabelStyle)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.labelNameType !== EReferenceLineNameTypes.VALUE}>
        <Row>
          <Column>
            <InputControl
              type="text"
              value={config.referenceType === EReferenceType.REFERENCE_BAND ? configValues.bandLabel : configValues.lineLabel}
              handleChange={(value: any) => {
                handleChange(value, config.referenceType === EReferenceType.REFERENCE_BAND ? EReferenceLineLabelStyleProps.BandLabel : EReferenceLineLabelStyleProps.LineLabel, EReferenceLinesSettings.LabelStyle, EReferenceLinesSettings.LabelStyle);
              }}
              min={1}
              label="Label Text"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ColorPicker
            label={"Color"}
            color={configValues.labelColor}
            handleChange={value => handleChange(value, "labelColor", EReferenceLinesSettings.LabelStyle)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label="Show Background"
            value={configValues.isShowLabelBackground}
            handleChange={() => handleCheckbox("isShowLabelBackground", EReferenceLinesSettings.LabelStyle)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isShowLabelBackground}>
        <Row>
          <Column>
            <ColorPicker
              label={"Background"}
              color={configValues.labelBackgroundColor}
              handleChange={value => handleChange(value, "labelBackgroundColor", EReferenceLinesSettings.LabelStyle)}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <SelectInput
            label={"Font Family"}
            value={configValues.labelFontFamily}
            isFontSelector={true}
            optionsList={[]}
            handleChange={newValue => handleChange(newValue, "labelFontFamily", EReferenceLinesSettings.LabelStyle)}
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
            handleChange={value => handleChange(value, "styling", EReferenceLinesSettings.LabelStyle)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label="Auto Font Size"
            value={configValues.autoFontSize}
            handleChange={() => handleCheckbox("autoFontSize", EReferenceLinesSettings.LabelStyle)}
            appearance="toggle"
          />
        </Column>
      </Row>

      {UILabelStyles1(shadow, config, configValues, handleChange)}
    </ConditionalWrapper>
  </Accordion>
}

const UIBandStyles = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceBandStyleProps, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
  return <Accordion title="Band Styles" childBottomPadding>
    <Row>
      <Column>
        <ToggleButton
          label="Show Background"
          value={configValues.isShowBackgroundColor}
          handleChange={() => handleCheckbox("isShowBackgroundColor", EReferenceLinesSettings.BandStyle)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={configValues.isShowBackgroundColor}>
      <Row>
        <Column>
          <ColorPicker
            label={"Background Color"}
            color={configValues.backgroundColor}
            handleChange={value => handleChange(value, "backgroundColor", EReferenceLinesSettings.BandStyle)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>
    </ConditionalWrapper>
  </Accordion>
}

const UILabelStyles1 = (shadow: Visual, config: IReferenceLineSettings, configValues: IReferenceLineLabelStyleProps, handleChange: (...args: any) => any) => {
  const LABEL_POSITION: ILabelValuePair[] = Get_LABEL_POSITION(shadow, config);

  return <>
    <ConditionalWrapper visible={!configValues.autoFontSize}>
      <Row>
        <Column>
          <InputControl
            type="number"
            value={configValues.labelFontSize}
            handleChange={(value: any) => {
              handleChange(value, "labelFontSize", EReferenceLinesSettings.LabelStyle, EReferenceLinesSettings.LabelStyle);
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
          handleChange={value => handleChange(value, "labelPosition", EReferenceLinesSettings.LabelStyle)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <SwitchOption
          label="Alignment"
          value={configValues.labelAlignment}
          optionsList={ALIGNMENT_OPTIONS}
          handleChange={value => handleChange(value, "labelAlignment", EReferenceLinesSettings.LabelStyle)}
        />
      </Column>
      {/* <Column>
        {configValues.axis === "X" && (
          <SwitchOption
            label="Orientation"
            value={""}
            optionsList={configValues.labelPosition === "before" ? ORIENTATION_LEFT : ORIENTATION_RIGHT}
            handleChange={value => handleChange(value, "labelOrientation")}
          />
        )}
      </Column> */}
    </Row>
  </>
}

const UIFooter = (isAddNew: boolean, closeCurrentSettingHandler: () => void, handleAdd: () => void, resetChanges: () => void) => {
  return (
    <Footer
      cancelButtonHandler={closeCurrentSettingHandler}
      saveButtonConfig={{ isDisabled: false, text: isAddNew ? "APPLY" : "APPLY", handler: handleAdd }}
      resetButtonHandler={resetChanges}
      disableTopPadding
    />
  );
};

const UIReferenceLine = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceLineSettings, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
  return <>
    <Accordion title="Line Options" childBottomPadding>
      {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue1, handleChange, false)}
    </Accordion>
    <Accordion title="Line Styles" childBottomPadding>
      {UILineStyleOptions(vizOptions, configValues.lineStyle, handleChange)}
    </Accordion>

    {UILabelStyles(vizOptions, shadow, configValues, configValues.labelStyle, handleChange, handleCheckbox)}
  </>
}

const UIReferenceBand = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceLineSettings, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
  return <>
    <Accordion title="Line Options" childBottomPadding>
      <Tabs selected={"Band_Start"}>
        <Tab title={"Band Start"} identifier={"Band_Start"}>
          {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue1, handleChange, false)}
        </Tab>
        <Tab title={"Band End"} identifier={"Band_End"}>
          {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue2, handleChange, true)}
        </Tab>
      </Tabs >
    </Accordion>

    <Accordion title="Line Styles" childBottomPadding>
      {UILineStyleOptions(vizOptions, configValues.lineStyle, handleChange)}
    </Accordion>

    {UILabelStyles(vizOptions, shadow, configValues, configValues.labelStyle, handleChange, handleCheckbox)}
    {UIBandStyles(vizOptions, shadow, configValues.bandStyle, handleChange, handleCheckbox)}
  </>
}

const AddReferenceLines = ({ shadow, details, onAdd, onUpdate, index, vizOptions, closeCurrentSettingHandler }) => {
  const isAddNew = isEmpty(details);
  const isInitialRender = React.useRef(0);
  const [configValues, setConfigValues] = React.useState<IReferenceLineSettings>(
    isAddNew ? REFERENCE_LINES_SETTINGS : details
  );
  const [errors, setErros] = React.useState({
    value: "",
    rank: "",
  });
  const defaultSettings = isAddNew ? REFERENCE_LINES_SETTINGS : details;

  React.useEffect(() => {
    if (configValues.lineValue1.type === "value") {
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

    if (configValues.lineValue2.type === "value") {
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
      validateField("rank", false);
    }
  }, [configValues.lineValue1.rank]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("value", false);
    }
  }, [configValues.lineValue1.value]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("rank", true);
    }
  }, [configValues.lineValue2.rank]);

  React.useEffect(() => {
    if (isInitialRender.current < 2) {
      isInitialRender.current++;
    } else {
      validateField("value", true);
    }
  }, [configValues.lineValue2.value]);

  const validateField = (fieldName, isValue2: boolean) => {
    if (!Object.keys(errors).includes(fieldName)) return true;

    const lineValue = isValue2 ? configValues.lineValue2 : configValues.lineValue1;
    if (!lineValue[fieldName]) {
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
    const values = configValues.lineValue1;
    if (values.type === "value" && values.axis === EXYAxisNames.Y && values.computation === EReferenceLineComputation.Fixed && !values.value) return;
    if (values.type === "value" && values.axis === EXYAxisNames.X && !values.value) return;
    if (values.type === "ranking" && !validateField("rank", false)) return;

    if (configValues.referenceType === EReferenceType.REFERENCE_BAND) {
      const values = configValues.lineValue2;
      if (values.type === "value" && values.axis === EXYAxisNames.Y && values.computation === EReferenceLineComputation.Fixed && !values.value) return;
      if (values.type === "value" && values.axis === EXYAxisNames.X && !values.value) return;
      if (values.type === "ranking" && !validateField("rank", true)) return;
    }

    if (isAddNew) {
      onAdd(configValues);
      return;
    }
    onUpdate(index, configValues);
  };

  const handleChange = (val, n, type: string) => {
    setConfigValues((d) => ({
      ...d,
      [type]: { ...d[type], [n]: val }
    }));
  };

  const handleCheckbox = (n, type: string) => {
    setConfigValues((d) => ({
      ...d,
      [type]: { ...d[type], [n]: !d[type][n] },
    }));
  };

  const AXIS_NAMES = Get_AXIS_NAMES(shadow);

  if (configValues.lineValue1.axis === EXYAxisNames.Y) {
    ALIGNMENT_OPTIONS = [
      {
        value: "left",
        label: <LeftAlignmentIcon fill="currentColor" />,
      },
      {
        value: "center",
        label: <CenterHorizontalAlignmentIcon fill="currentColor" />,
      },
      {
        value: "right",
        label: <RightAlignmentIcon fill="currentColor" />,
      },
    ];
  } else {
    ALIGNMENT_OPTIONS = [
      {
        value: "right",
        label: <TopAlignmentIcon fill="currentColor" />,
      },
      {
        value: "center",
        label: <CenterVerticalAlignmentIcon fill="currentColor" />,
      },
      {
        value: "left",
        label: <BottomAlignmentIcon fill="currentColor" />,
      },
    ];
  }


  React.useEffect(() => {
    if (!configValues.lineValue1.measureName) {
      setConfigValues((d) => ({ ...d, [EReferenceLinesSettings.LineValue1]: { ...d[EReferenceLinesSettings.LineValue1], "measureName": AXIS_NAMES[0].value } }));
    }

    if (!configValues.lineValue2.measureName) {
      setConfigValues((d) => ({ ...d, [EReferenceLinesSettings.LineValue2]: { ...d[EReferenceLinesSettings.LineValue2], "measureName": AXIS_NAMES[0].value } }));
    }

    if (configValues.lineValue1.computation === EReferenceLineComputation.Fixed && !configValues.lineValue1.value) {
      handleChange("0", EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }

    if (configValues.lineValue2.computation === EReferenceLineComputation.Fixed && !configValues.lineValue2.value) {
      handleChange("0", EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }
  }, []);

  React.useEffect(() => {
    if (configValues.referenceType === EReferenceType.REFERENCE_BAND) {
      setConfigValues((d) => ({ ...d, [EReferenceLinesSettings.LineValue2]: { ...d[EReferenceLinesSettings.LineValue2], "measureName": d.lineValue1.measureName } }));
    }
  }, [configValues.lineValue1.measureName]);

  React.useEffect(() => {
    if (configValues.lineValue1.axis === EXYAxisNames.Y) {
      setConfigValues((d) => ({ ...d, [EReferenceLinesSettings.LineValue1]: { ...d[EReferenceLinesSettings.LineValue1], "type": EReferenceLinesType.Value } }));
    }
  }, [configValues.lineValue1.measureName]);

  React.useEffect(() => {
    if (configValues.lineValue2.axis === EXYAxisNames.Y) {
      setConfigValues((d) => ({ ...d, [EReferenceLinesSettings.LineValue2]: { ...d[EReferenceLinesSettings.LineValue2], "type": EReferenceLinesType.Value } }));
    }
  }, [configValues.lineValue2.measureName]);

  React.useEffect(() => {
    if (configValues.referenceType === EReferenceType.REFERENCE_LINE && configValues.labelStyle.labelPosition === EBeforeAfterPosition.Center) {
      handleChange(EBeforeAfterPosition.Before, "labelPosition", EReferenceLinesSettings.LabelStyle)
    }
  }, [configValues.referenceType, configValues.labelStyle.labelPosition]);

  React.useEffect(() => {
    console.log("test");

    if (configValues.lineValue1.computation === EReferenceLineComputation.Fixed && !configValues.lineValue1.value) {
      handleChange("0", EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }
  }, [configValues.lineValue1.computation, configValues.lineValue1.axis]);

  React.useEffect(() => {
    if (configValues.lineValue2.computation === EReferenceLineComputation.Fixed && !configValues.lineValue2.value) {
      handleChange("0", EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }
  }, [configValues.lineValue2.computation, configValues.lineValue2.axis]);

  React.useEffect(() => {
    if (configValues.referenceType === EReferenceType.REFERENCE_BAND) {
      handleChange(configValues.lineValue1.axis, EReferenceLineValueProps.Axis, EReferenceLinesSettings.LineValue2);
      handleChange(configValues.lineValue1.measureName, EReferenceLineValueProps.MeasureName, EReferenceLinesSettings.LineValue2);
      handleChange(configValues.lineValue1.type, EReferenceLineValueProps.Type, EReferenceLinesSettings.LineValue2);
      handleChange(configValues.lineValue1.computation, EReferenceLineValueProps.Computation, EReferenceLinesSettings.LineValue2);
    }
  }, [configValues.lineValue1.measureName, configValues.lineValue1.type, configValues.lineValue1.computation]);


  const resetChanges = () => {
    setConfigValues(() => defaultSettings);
  };

  return (
    <>
      <Tabs selected={configValues.referenceType} onChange={(value) => {
        setConfigValues((d) => ({
          ...d,
          [EReferenceLinesSettings.ReferenceType]: value
        }));
      }}>
        <Tab title={"Reference Line"} identifier={EReferenceType.REFERENCE_LINE}>
          {UIReferenceLine(vizOptions, shadow, configValues, handleChange, handleCheckbox)}
        </Tab>
        <Tab title={"Reference Band"} identifier={EReferenceType.REFERENCE_BAND}>
          {UIReferenceBand(vizOptions, shadow, configValues, handleChange, handleCheckbox)}
        </Tab>
      </Tabs >

      {UIFooter(isAddNew, closeCurrentSettingHandler, handleAdd, resetChanges)}
    </>
  );
};

export default AddReferenceLines;
