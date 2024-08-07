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
  PopupModHeader,
  Breadcrumb,
  AccordionAlt,
  Label,
  Quote,
} from "@truviz/shadow/dist/Components";
import { BoldIcon, BottomAlignmentIcon, CenterHorizontalAlignmentIcon, CenterVerticalAlignmentIcon, DashedLineIcon, DottedLineIcon, ItalicIcon, LeftAlignmentIcon, RightAlignmentIcon, SolidLineIcon, TopAlignmentIcon, UnderlineIcon } from "./SettingsIcons";
import { ICategoryValuePair, ILabelValuePair, IReferenceBandStyleProps, IReferenceLineLabelStyleProps, IReferenceLineSettings, IReferenceLineStyleProps, IReferenceLineValueProps } from "../visual-settings.interface";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { min as d3Min, max as d3Max, mean, median } from "d3-array";
import { calculateStandardDeviation } from "../methods/methods";

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

const Get_AXIS_NAMES = (shadow: Visual, axis: EXYAxisNames) => {
  if (axis === EXYAxisNames.X) {
    const AXIS_NAMES: { label: string; value: string; axis: string }[] = [
      {
        label: shadow.categoryDisplayName,
        value: shadow.categoryDisplayName,
        axis: EXYAxisNames.X,
      },
    ];

    return AXIS_NAMES;
  }

  if (axis === EXYAxisNames.Y) {
    const AXIS_NAMES: { label: string; value: string; axis: string }[] = [];
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
        label: shadow.measure1DisplayName,
        value: shadow.measure1DisplayName,
        axis: EXYAxisNames.Y,
      });

      AXIS_NAMES.push({
        label: shadow.measure2DisplayName,
        value: shadow.measure2DisplayName,
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
}

const Get_LABEL_POSITION = (shadow: Visual, configValues: IReferenceLineSettings) => {
  let LABEL_POSITION: ILabelValuePair[] = [];

  if (configValues.referenceType === EReferenceType.REFERENCE_LINE) {
    if ((!shadow.isHorizontalChart && configValues.lineValue1.axis === EXYAxisNames.X) || (shadow.isHorizontalChart && configValues.lineValue1.axis === EXYAxisNames.Y)) {
      LABEL_POSITION = [
        {
          label: "Left",
          value: EBeforeAfterPosition.Before,
        },
        {
          label: "Right",
          value: EBeforeAfterPosition.After,
        },
      ];
    } else {
      LABEL_POSITION = [
        {
          label: "Top",
          value: EBeforeAfterPosition.Before,
        },
        {
          label: "Bottom",
          value: EBeforeAfterPosition.After,
        },
      ];
    }
  } else {
    if ((configValues.lineValue1.axis === EXYAxisNames.X && !shadow.isHorizontalChart) || (configValues.lineValue1.axis === EXYAxisNames.Y && shadow.isHorizontalChart)) {
      LABEL_POSITION = [
        {
          label: "Left",
          value: EBeforeAfterPosition.Before,
        },
        {
          label: "Middle",
          value: EBeforeAfterPosition.Center,
        },
        {
          label: "Right",
          value: EBeforeAfterPosition.After,
        },
      ];
    } else {
      LABEL_POSITION = [
        {
          label: "Top",
          value: EBeforeAfterPosition.Before,
        },
        {
          label: "Center",
          value: EBeforeAfterPosition.Center,
        },
        {
          label: "Bottom",
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
  const AXIS_NAMES = Get_AXIS_NAMES(shadow, isValue2 ? configValues.lineValue2.axis : configValues.lineValue1.axis);
  const type = isValue2 ? EReferenceLinesSettings.LineValue2 : EReferenceLinesSettings.LineValue1;
  const line1Measure = [{
    label: AXIS_NAMES.find(d => d.value === configValues.lineValue1.measureName) ? AXIS_NAMES.find(d => d.value === configValues.lineValue1.measureName).label : "",
    value: configValues.lineValue1.measureName,
    axis: configValues.lineValue1.axis,
  }];

  let categoriesNameList: ILabelValuePair[];
  if (shadow.isHorizontalChart) {
    categoriesNameList = shadow.categoricalData.categories[shadow.categoricalCategoriesLastIndex].values.map(d => ({
      label: shadow.getTooltipCategoryText(d.toString()) as string,
      value: d as string
    })).reverse().filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  } else {
    categoriesNameList = shadow.categoricalData.categories[shadow.categoricalCategoriesLastIndex].values.map(d => ({
      label: shadow.getTooltipCategoryText(d.toString()) as string,
      value: d as string
    })).filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  }

  return <>
    <Row>
      <Column>
        <SelectInput
          label={"Based On"}
          value={lineValues.measureName}
          optionsList={AXIS_NAMES}
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
      <ConditionalWrapper visible={!isValue2}>
        <Row>
          <Column>
            <SwitchOption
              label={"Select Type"}
              value={lineValues.type}
              optionsList={isValue2 ?
                [{
                  label: LINE_TYPES.find(d => d.value === configValues.lineValue1.type) ? LINE_TYPES.find(d => d.value === configValues.lineValue1.type).label : "",
                  value: configValues.lineValue1.type,
                }] : LINE_TYPES}
              handleChange={value => handleChange(value, "type", type)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.referenceType === EReferenceType.REFERENCE_LINE}>
        <ConditionalWrapper visible={lineValues.type === "value"}>
          <Row>
            <Column>
              <SelectInput
                label={"Value"}
                value={lineValues.value}
                optionsList={categoriesNameList}
                handleChange={value => handleChange(value, "value", type)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        {UILineValueOptions1(vizOptions, shadow, lineValues, handleChange, isValue2)}
      </ConditionalWrapper>
    </ConditionalWrapper>

    <ConditionalWrapper visible={configValues.referenceType === EReferenceType.REFERENCE_LINE}>
      <ConditionalWrapper visible={lineValues.axis === EXYAxisNames.Y}>
        <Row>
          <Column>
            <SelectInput
              label={"Value"}
              value={lineValues.computation}
              optionsList={ComputationTypeList}
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
                handleChange={(value: any) => {
                  handleChange(value, "value", type);
                  handleChange(true, EReferenceLineValueProps.IsValueChanged, type);
                }}
                label="Value"
              />
            </Column>
          </Row>
        </ConditionalWrapper>
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
            label={"Ranking From"}
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

const UILineStyleOptions = (
  vizOptions: ShadowUpdateOptions,
  configValues: IReferenceLineStyleProps,
  isLineUI: boolean, isAddNew: boolean, details: IReferenceLineSettings,
  configBandValues: IReferenceBandStyleProps,
  handleCheckbox: (...args: any) => any,
  handleChange: (...args: any) => any,
) => {
  const isBand = !isLineUI || (!isAddNew && details.referenceType === EReferenceType.REFERENCE_BAND);

  return <>
    <ConditionalWrapper visible={isBand}>
      <Row>
        <Column>
          <ToggleButton
            label="Show Background"
            value={configBandValues.isShowBackgroundColor}
            handleChange={() => handleCheckbox("isShowBackgroundColor", EReferenceLinesSettings.BandStyle)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configBandValues.isShowBackgroundColor}>
        <Row appearance="padded">
          <Column>
            <ColorPicker
              label={"Color"}
              color={configBandValues.backgroundColor}
              colorOpacity={0.2}
              handleChange={value => handleChange(value, "backgroundColor", EReferenceLinesSettings.BandStyle)}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
            />
          </Column>
        </Row>
      </ConditionalWrapper>
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
          selectorAppearance="secondary"
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
          label="Line Width"
        />
      </Column>

      <Column>
        <ColorPicker
          label={"Line Color"}
          color={configValues.lineColor}
          handleChange={value => handleChange(value, "lineColor", EReferenceLinesSettings.LineStyle)}
          colorPalette={vizOptions.host.colorPalette}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <SwitchOption
          label="Placement"
          value={configValues.linePlacement}
          optionsList={LINE_PLACEMENTS}
          selectorAppearance="secondary"
          handleChange={(value) => handleChange(value, EReferenceLineStyleProps.LinePlacement, EReferenceLinesSettings.LineStyle)}
        />
      </Column>
    </Row>
  </>
}

const UILabelStyles = (vizOptions: ShadowUpdateOptions, shadow: Visual, config: IReferenceLineSettings, configValues: IReferenceLineLabelStyleProps, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
  return <Row disableTopPadding>
    <Column>
      <AccordionAlt title="Label Styles"
        open={configValues.show}
        showToggle={true}
        toggleValue={configValues.show}
        onChangeToggle={() => handleCheckbox(EReferenceLineLabelStyleProps.Show, EReferenceLinesSettings.LabelStyle)}
      >
        <Row>
          <Column>
            <SelectInput
              label={"Label Type"}
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
                label="Label Name"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ColorPicker
              label={"Label Color"}
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
          <Row appearance="padded">
            <Column>
              <ColorPicker
                label={"Color"}
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
              selectorAppearance="secondary"
              handleChange={value => handleChange(value, "styling", EReferenceLinesSettings.LabelStyle)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ToggleButton
              label="Auto Text Size"
              value={configValues.autoFontSize}
              handleChange={() => handleCheckbox("autoFontSize", EReferenceLinesSettings.LabelStyle)}
              appearance="toggle"
            />
          </Column>
        </Row>

        {UILabelStyles1(shadow, config, configValues, handleChange)}
      </AccordionAlt>
    </Column>
  </Row>
}

// const UIBandStyles = (vizOptions: ShadowUpdateOptions, shadow: Visual, configValues: IReferenceBandStyleProps, handleChange: (...args: any) => any, handleCheckbox: (...args: any) => any) => {
//   return <Row disableTopPadding>
//     <Column>
//       <AccordionAlt title="Band Styles"
//         open={true}
//       >
//       </AccordionAlt>
//     </Column>
//   </Row>
// }

const UILabelStyles1 = (shadow: Visual, config: IReferenceLineSettings, configValues: IReferenceLineLabelStyleProps, handleChange: (...args: any) => any) => {
  const LABEL_POSITION: ILabelValuePair[] = Get_LABEL_POSITION(shadow, config);

  return <>
    <ConditionalWrapper visible={!configValues.autoFontSize}>
      <Row appearance="padded">
        <Column>
          <InputControl
            label="Text size"
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
          selectorAppearance="secondary"
          handleChange={value => handleChange(value, "labelPosition", EReferenceLinesSettings.LabelStyle)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <Quote>
          <strong>Note: </strong>Position might switch depending on available space for the first and last labels.
        </Quote>
      </Column>
    </Row>

    <Row>
      <Column>
        <SwitchOption
          label="Alignment"
          value={configValues.labelAlignment}
          optionsList={ALIGNMENT_OPTIONS}
          selectorAppearance="secondary"
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

const UIFooter = (isAddNew: boolean, closeCurrentSettingHandler: () => void, handleChangeContent: (path: string) => void, handleAdd: () => void, resetChanges: () => void) => {
  return (
    <Footer
      cancelButtonHandler={() => {
        closeCurrentSettingHandler();
        handleChangeContent("homePage");
      }}
      saveButtonConfig={{ isDisabled: false, text: isAddNew ? "APPLY" : "APPLY", handler: handleAdd }}
      resetButtonHandler={resetChanges}
    />
  );
};

const UIReferenceLine = (
  vizOptions: ShadowUpdateOptions,
  shadow: Visual,
  configValues: IReferenceLineSettings,
  configBandValues: IReferenceBandStyleProps,
  isLineUI: boolean, isAddNew: boolean, details: IReferenceLineSettings,
  handleChange: (...args: any) => any,
  handleCheckbox: (...args: any) => any) => {
  const AXIS_NAMES: ILabelValuePair[] = [
    {
      label: !shadow.isHorizontalChart ? "X - Axis" : "Y - Axis",
      value: EXYAxisNames.X,
    },
    {
      label: !shadow.isHorizontalChart ? "Y - Axis" : "X - Axis",
      value: EXYAxisNames.Y,
    },
  ];

  return <>
    <Row classNames={["sticky-row"]}>
      <Column>
        <SwitchOption
          label="Select Axis"
          value={configValues.lineValue1.axis}
          optionsList={AXIS_NAMES}
          selectorAppearance="secondary"
          handleChange={(value) => {
            handleChange(value, "axis", EReferenceLinesSettings.LineValue1);

            if (value === EXYAxisNames.X) {
              if (!(configValues.lineValue1.measureName && configValues.lineValue1.measureName.includes(shadow.categoryDisplayName))) {
                handleChange(shadow.categoryDisplayName, "measureName", EReferenceLinesSettings.LineValue1);
              }
            }

            if (value === EXYAxisNames.Y) {
              if (!(configValues.lineValue1.measureName && [shadow.measure1DisplayName, shadow.measure2DisplayName].includes(configValues.lineValue1.measureName))) {
                handleChange(shadow.measure1DisplayName, "measureName", EReferenceLinesSettings.LineValue1);
              }
            }
          }}
        />
      </Column>
    </Row>

    <AccordionAlt title="General"
      open={true}
    >
      {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue1, handleChange, false)}
    </AccordionAlt>

    <AccordionAlt title="Line Options"
      open={true}
    >
      {UILineStyleOptions(vizOptions, configValues.lineStyle, isLineUI, isAddNew, details, configBandValues, handleCheckbox, handleChange)}
    </AccordionAlt>

    {UILabelStyles(vizOptions, shadow, configValues, configValues.labelStyle, handleChange, handleCheckbox)}
  </>
}

const UIReferenceBand = (
  vizOptions: ShadowUpdateOptions,
  shadow: Visual,
  configValues: IReferenceLineSettings,
  isLineUI: boolean, isAddNew: boolean, details: IReferenceLineSettings,
  handleCheckbox: (...args: any) => any,
  handleChange: (...args: any) => any,
) => {
  const AXIS_NAMES: ILabelValuePair[] = [
    {
      label: !shadow.isHorizontalChart ? "X - Axis" : "Y - Axis",
      value: EXYAxisNames.X,
    },
    {
      label: !shadow.isHorizontalChart ? "Y - Axis" : "X - Axis",
      value: EXYAxisNames.Y,
    },
  ];

  let categoriesNameList: ILabelValuePair[];
  if (shadow.isHorizontalChart) {
    categoriesNameList = shadow.categoricalData.categories[shadow.categoricalCategoriesLastIndex].values.map(d => ({
      label: shadow.getTooltipCategoryText(d.toString()) as string,
      value: d as string
    })).reverse().filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  } else {
    categoriesNameList = shadow.categoricalData.categories[shadow.categoricalCategoriesLastIndex].values.map(d => ({
      label: shadow.getTooltipCategoryText(d.toString()) as string,
      value: d as string
    })).filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  }

  return <>
    <Row classNames={["sticky-row"]}>
      <Column>
        <SwitchOption
          label="Select Axis"
          value={configValues.lineValue1.axis}
          optionsList={AXIS_NAMES}
          selectorAppearance="secondary"
          handleChange={(value) => {
            handleChange(value, "axis", EReferenceLinesSettings.LineValue1);
            handleChange(value, "axis", EReferenceLinesSettings.LineValue2);

            if (value === EXYAxisNames.X) {
              if (!(configValues.lineValue1.measureName && configValues.lineValue1.measureName.includes(shadow.categoryDisplayName))) {
                handleChange(shadow.categoryDisplayName, "measureName", EReferenceLinesSettings.LineValue1);
              }
            }

            if (value === EXYAxisNames.Y) {
              if (!(configValues.lineValue1.measureName && [shadow.measure1DisplayName, shadow.measure2DisplayName].includes(configValues.lineValue1.measureName))) {
                handleChange(shadow.measure1DisplayName, "measureName", EReferenceLinesSettings.LineValue1);
              }
            }

            if (value === EXYAxisNames.X) {
              if (!(configValues.lineValue2.measureName && configValues.lineValue2.measureName.includes(shadow.categoryDisplayName))) {
                handleChange(shadow.categoryDisplayName, "measureName", EReferenceLinesSettings.LineValue2);
              }
            }

            if (value === EXYAxisNames.Y) {
              if (!(configValues.lineValue2.measureName && [shadow.measure1DisplayName, shadow.measure2DisplayName].includes(configValues.lineValue2.measureName))) {
                handleChange(shadow.measure1DisplayName, "measureName", EReferenceLinesSettings.LineValue2);
              }
            }
          }}
        />
      </Column>
    </Row>

    <AccordionAlt title="General"
      open={true}
    >
      {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue1, handleChange, false)}

      <Row>
        <Column>
          <Label text="Start Value"></Label>
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.lineValue1.axis === EXYAxisNames.X}>
        <ConditionalWrapper visible={configValues.lineValue1.type === "value"}>
          <Row disableTopPadding>
            <Column>
              <SelectInput
                label={"Select Value"}
                value={configValues.lineValue1.value}
                optionsList={categoriesNameList}
                handleChange={value => handleChange(value, "value", EReferenceLinesSettings.LineValue1)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>

      {UILineValueOptions1(vizOptions, shadow, configValues.lineValue1, handleChange, false)}

      <ConditionalWrapper visible={configValues.lineValue1.axis === EXYAxisNames.Y}>
        <Row disableTopPadding>
          <Column>
            <SelectInput
              label={"Value Type"}
              value={configValues.lineValue1.computation}
              optionsList={ComputationTypeList}
              handleChange={(value) => handleChange(value, "computation", EReferenceLinesSettings.LineValue1)}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.lineValue1.computation === EReferenceLineComputation.Fixed}>
          <Row>
            <Column>
              <InputControl
                type="text"
                value={configValues.lineValue1.value}
                handleChange={(value: any) => {
                  handleChange(value, "value", EReferenceLinesSettings.LineValue1);
                  handleChange(true, EReferenceLineValueProps.IsValueChanged, EReferenceLinesSettings.LineValue1);
                }}
                label="Value"
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>

      <Row>
        <Column>
          <Label text="End Value"></Label>
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.lineValue2.axis === EXYAxisNames.X}>
        <ConditionalWrapper visible={configValues.lineValue2.type === "value"}>
          <Row disableTopPadding>
            <Column>
              <SelectInput
                label={"Select Value"}
                value={configValues.lineValue2.value}
                optionsList={categoriesNameList}
                handleChange={value => handleChange(value, "value", EReferenceLinesSettings.LineValue2)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>

      {UILineValueOptions1(vizOptions, shadow, configValues.lineValue2, handleChange, true)}

      <ConditionalWrapper visible={configValues.lineValue2.axis === EXYAxisNames.Y}>
        <Row disableTopPadding>
          <Column>
            <SelectInput
              label={"Value Type"}
              value={configValues.lineValue2.computation}
              optionsList={ComputationTypeList}
              handleChange={(value) => handleChange(value, "computation", EReferenceLinesSettings.LineValue2)}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={configValues.lineValue2.computation === EReferenceLineComputation.Fixed}>
          <Row>
            <Column>
              <InputControl
                type="text"
                value={configValues.lineValue2.value}
                handleChange={(value: any) => {
                  handleChange(value, "value", EReferenceLinesSettings.LineValue2);
                  handleChange(true, EReferenceLineValueProps.IsValueChanged, EReferenceLinesSettings.LineValue2);
                }}
                label="Value"
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>

      {/* <Tabs selected={"Band_Start"}>
        <Tab title={"Band Start"} identifier={"Band_Start"}>
          {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue1, handleChange, false)}
        </Tab>
        <Tab title={"Band End"} identifier={"Band_End"}>
          {UILineValueOptions(vizOptions, shadow, configValues, configValues.lineValue2, handleChange, true)}
        </Tab>
      </Tabs > */}
    </AccordionAlt>

    <AccordionAlt title="Line Options"
      open={true}
    >
      {UILineStyleOptions(vizOptions, configValues.lineStyle, isLineUI, isAddNew, details, configValues.bandStyle, handleCheckbox, handleChange)}
    </AccordionAlt>

    {UILabelStyles(vizOptions, shadow, configValues, configValues.labelStyle, handleChange, handleCheckbox)}
    {/* {UIBandStyles(vizOptions, shadow, configValues.bandStyle, handleChange, handleCheckbox)} */}
  </>
}

const AddReferenceLines = ({ shadow, details, isLineUI, onAdd, onUpdate, index, vizOptions, closeAddEdit, closeCurrentSettingHandler, handleChangeContent }) => {
  const isAddNew = isEmpty(details);
  const isInitialRender = React.useRef(0);
  const [configValues, setConfigValues] = React.useState<IReferenceLineSettings>(
    isAddNew ? REFERENCE_LINES_SETTINGS : details
  );
  const [errors, setErros] = React.useState({
    value: "",
    rank: "",
  });
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

    if (values.value === null) {
      values.value = "0";
    }

    if (values.type === "value" && values.axis === EXYAxisNames.Y && values.computation === EReferenceLineComputation.Fixed && !values.value) return;
    if (values.type === "value" && values.axis === EXYAxisNames.X && !values.value) return;
    if (values.type === "ranking" && !validateField("rank", false)) return;

    if (configValues.referenceType === EReferenceType.REFERENCE_BAND) {
      const values = configValues.lineValue2;

      if (values.value === null) {
        values.value = "0";
      }

      if (values.type === "value" && values.axis === EXYAxisNames.Y && values.computation === EReferenceLineComputation.Fixed && !values.value) return;
      if (values.type === "value" && values.axis === EXYAxisNames.X && !values.value) return;
      if (values.type === "ranking" && !validateField("rank", true)) return;
    }

    handleChangeContent("homePage");

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

  if ((shadow.isHorizontalChart && configValues.lineValue1.axis === EXYAxisNames.X) || (!shadow.isHorizontalChart && configValues.lineValue1.axis === EXYAxisNames.Y)) {
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
      if (configValues.lineValue1.axis === EXYAxisNames.X) {
        handleChange(shadow.categoryDisplayName, "measureName", EReferenceLinesSettings.LineValue1);
      }

      if (configValues.lineValue1.axis === EXYAxisNames.Y) {
        handleChange(shadow.measure1DisplayName, "measureName", EReferenceLinesSettings.LineValue1);
      }
    }

    const chartData = shadow.isHorizontalChart ? shadow.chartData.reverse() : shadow.chartData;

    if (configValues.lineValue1.axis === EXYAxisNames.X && (!configValues.lineValue1.value || configValues.lineValue1.value === "0")) {
      handleChange(chartData[0].category, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }

    if (configValues.lineValue1.axis === EXYAxisNames.X && (!configValues.lineValue2.value || configValues.lineValue2.value === "0")) {
      handleChange(chartData.length > 1 ? chartData[1].category : chartData[0].category, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }

    if (configValues.lineValue1.axis === EXYAxisNames.Y && configValues.lineValue1.computation === EReferenceLineComputation.Fixed && isNaN(parseFloat(configValues.lineValue1.value))) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }

    if (configValues.lineValue2.axis === EXYAxisNames.Y && configValues.lineValue2.computation === EReferenceLineComputation.Fixed && isNaN(parseFloat(configValues.lineValue2.value))) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }

    if (isLineUI) {
      setConfigValues((d) => ({
        ...d,
        [EReferenceLinesSettings.ReferenceType]: EReferenceType.REFERENCE_LINE
      }));
    } else {
      setConfigValues((d) => ({
        ...d,
        [EReferenceLinesSettings.ReferenceType]: EReferenceType.REFERENCE_BAND
      }));
    }
  }, []);

  // line value 1
  React.useEffect(() => {
    if (configValues.lineValue1.axis === EXYAxisNames.X && (!configValues.lineValue1.value || configValues.lineValue1.value === "0")) {
      handleChange(shadow.chartData[0].category, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }

    if (configValues.lineValue1.axis === EXYAxisNames.Y && configValues.lineValue1.computation === EReferenceLineComputation.Fixed && isNaN(parseFloat(configValues.lineValue1.value))) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }

    if (configValues.lineValue1.axis === EXYAxisNames.Y && configValues.lineValue1.computation === EReferenceLineComputation.Fixed && (configValues.lineValue1.value === undefined || configValues.lineValue1.value === null)) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }
  }, [configValues.lineValue1.axis, configValues.lineValue1.computation, configValues.lineValue1.measureName, configValues.lineValue1.type]);

  // line value 2
  React.useEffect(() => {
    if (configValues.lineValue1.axis === EXYAxisNames.X && (!configValues.lineValue2.value || configValues.lineValue2.value === "0")) {
      handleChange(shadow.chartData.length > 1 ? shadow.chartData[1].category : shadow.chartData[0].category, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }

    if (configValues.lineValue2.axis === EXYAxisNames.Y && configValues.lineValue2.computation === EReferenceLineComputation.Fixed && isNaN(parseFloat(configValues.lineValue2.value))) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }

    if (configValues.lineValue2.axis === EXYAxisNames.Y && configValues.lineValue2.computation === EReferenceLineComputation.Fixed && (configValues.lineValue2.value === undefined || configValues.lineValue2.value === null)) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }
  }, [configValues.lineValue2.axis, configValues.lineValue2.computation, configValues.lineValue2.measureName, configValues.lineValue2.type]);

  React.useEffect(() => {
    if (configValues.referenceType === EReferenceType.REFERENCE_LINE && configValues.labelStyle.labelPosition === EBeforeAfterPosition.Center) {
      handleChange(EBeforeAfterPosition.Before, "labelPosition", EReferenceLinesSettings.LabelStyle)
    }
  }, [configValues.referenceType, configValues.labelStyle.labelPosition]);

  React.useEffect(() => {
    if (configValues.referenceType === EReferenceType.REFERENCE_BAND) {
      handleChange(configValues.lineValue1.axis, EReferenceLineValueProps.Axis, EReferenceLinesSettings.LineValue2);
      handleChange(configValues.lineValue1.type, EReferenceLineValueProps.Type, EReferenceLinesSettings.LineValue2);

      if (!configValues.lineValue2.computation) {
        handleChange(configValues.lineValue1.computation, EReferenceLineValueProps.Computation, EReferenceLinesSettings.LineValue2);
      }
    }
  }, [configValues.lineValue1.axis, configValues.lineValue1.type, configValues.lineValue1.computation]);

  React.useEffect(() => {
    handleChange(false, EReferenceLineValueProps.IsValueChanged, EReferenceLinesSettings.LineValue1);
    if (configValues.lineValue1.axis === EXYAxisNames.Y && configValues.lineValue1.computation === EReferenceLineComputation.Fixed && !configValues.lineValue1.isValueChanged) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue1);
    }
  }, [configValues.lineValue1.computation]);

  React.useEffect(() => {
    handleChange(false, EReferenceLineValueProps.IsValueChanged, EReferenceLinesSettings.LineValue2);
    if (configValues.lineValue2.axis === EXYAxisNames.Y && configValues.lineValue2.computation === EReferenceLineComputation.Fixed && !configValues.lineValue2.isValueChanged) {
      handleChange(0, EReferenceLineValueProps.Value, EReferenceLinesSettings.LineValue2);
    }
  }, [configValues.lineValue2.computation]);

  const setLineValue = (isLine2: boolean) => {
    const rLine = configValues;
    const rLineValue = isLine2 ? rLine.lineValue2 : rLine.lineValue1;
    const type = isLine2 ? EReferenceLinesSettings.LineValue2 : EReferenceLinesSettings.LineValue1;
    if (rLineValue.type === EReferenceLinesType.Value && rLineValue.axis === EXYAxisNames.Y) {
      let values = [];
      const isCategoricalReferenceLinesMeasure = shadow.categoricalReferenceLinesNames.includes(rLineValue.axis);

      if (isCategoricalReferenceLinesMeasure) {
        const referenceLineData = shadow.categoricalReferenceLinesDataFields.filter(
          (d) => d.source.displayName === rLineValue.axis
        );
        values = referenceLineData.reduce((arr, cur) => [...arr, ...cur.values], []);
      }

      if (!isCategoricalReferenceLinesMeasure) {
        values = shadow.chartData.map((d) => (d.value1));
      }

      switch (rLineValue.computation) {
        case EReferenceLineComputation.ZeroBaseline:
          handleChange(0 + "", EReferenceLineValueProps.Value, type);
          break;
        case EReferenceLineComputation.Min:
          handleChange(d3Min(values, (d) => d) + "", EReferenceLineValueProps.Value, type);
          break;
        case EReferenceLineComputation.Max:
          handleChange(d3Max(values, (d) => d) + "", EReferenceLineValueProps.Value, type);
          break;
        case EReferenceLineComputation.Average:
          handleChange(mean(values, (d) => d) + "", EReferenceLineValueProps.Value, type);
          break;
        case EReferenceLineComputation.Median:
          handleChange(median(values, (d) => d) + "", EReferenceLineValueProps.Value, type);
          break;
        case EReferenceLineComputation.StandardDeviation:
          handleChange(calculateStandardDeviation(values) + "", EReferenceLineValueProps.Value, type);
          break;
      }
    }
  }

  React.useEffect(() => {
    setLineValue(false);
  }, [configValues.lineValue1]);

  React.useEffect(() => {
    setLineValue(true);
  }, [configValues.lineValue2]);

  const resetChanges = () => {
    const defaultSettings = JSON.parse(JSON.stringify(REFERENCE_LINES_SETTINGS));

    if (!isAddNew) {
      defaultSettings.uid = details.uid;
    }

    if (isAddNew ? !isLineUI : details.referenceType === EReferenceType.REFERENCE_BAND) {
      defaultSettings.referenceType = EReferenceType.REFERENCE_BAND;
    } else {
      defaultSettings.referenceType = EReferenceType.REFERENCE_LINE;
    }

    if (!defaultSettings.lineValue1.measureName) {
      if (configValues.lineValue1.axis === EXYAxisNames.X) {
        defaultSettings.lineValue1.measureName = shadow.categoryDisplayName;
      }
      if (configValues.lineValue1.axis === EXYAxisNames.Y) {
        defaultSettings.lineValue1.measureName = shadow.measure1DisplayName;
      }
    }

    if (!defaultSettings.lineValue2.measureName) {
      if (configValues.lineValue2.axis === EXYAxisNames.X) {
        defaultSettings.lineValue2.measureName = shadow.categoryDisplayName;
      }
      if (configValues.lineValue2.axis === EXYAxisNames.Y) {
        defaultSettings.lineValue2.measureName = shadow.measure1DisplayName;
      }
    }

    if (configValues.lineValue1.axis === EXYAxisNames.X && (!defaultSettings.lineValue1.value || defaultSettings.lineValue1.value === "0")) {
      defaultSettings.lineValue1.value = shadow.chartData[0].category;
    }

    if (configValues.lineValue1.axis === EXYAxisNames.X && (!defaultSettings.lineValue2.value || defaultSettings.lineValue2.value === "0")) {
      defaultSettings.lineValue2.value = shadow.chartData.length > 1 ? shadow.chartData[1].category : shadow.chartData[0].category;
    }

    defaultSettings.labelStyle.styling = [];

    setConfigValues(() => defaultSettings);
  };

  return (
    <>
      <PopupModHeader
        title={isAddNew ? (isLineUI ? "New Reference Line" : "New Reference Band") : (isLineUI ? "Edit Reference Line" : "Edit Reference Band")}
        icon={"BACK_BUTTON"}
        closeSettingsPopup={() => {
          closeCurrentSettingHandler();
        }}
        onIconClickHandler={() => {
          closeAddEdit();
          handleChangeContent("homePage");
        }}
      />

      <Row>
        <Column> <Breadcrumb crumbs={[(isLineUI ? "Reference Lines" : "Reference Bands"),
        isAddNew ? (isLineUI ? "New Line" : "New Band") : (isLineUI ? "Edit Line" : "Edit Band")]} /> </Column>
      </Row>

      <ConditionalWrapper visible={isLineUI || (!isAddNew && details.referenceType === EReferenceType.REFERENCE_LINE)}>
        {UIReferenceLine(vizOptions, shadow, configValues, configValues.bandStyle, isLineUI, isAddNew, details, handleChange, handleCheckbox)}
      </ConditionalWrapper>

      <ConditionalWrapper visible={!isLineUI || (!isAddNew && details.referenceType === EReferenceType.REFERENCE_BAND)}>
        {UIReferenceBand(vizOptions, shadow, configValues, isLineUI, isAddNew, details, handleCheckbox, handleChange)}
      </ConditionalWrapper>

      {UIFooter(isAddNew, closeCurrentSettingHandler, handleChangeContent, handleAdd, resetChanges)}
    </>
  );
};

export default AddReferenceLines;
