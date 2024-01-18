/* eslint-disable max-lines-per-function */
import * as React from "react";
import { ERROR_BARS_SETTINGS } from "../constants";
import {
  EErrorBandFillTypes,
  EErrorBarsCalcTypes,
  EErrorBarsDirection,
  EErrorBarsMarkerShape,
  EErrorBarsSettings,
  EErrorBarsTooltipLabelFormat,
  ELineType,
  ERelationshipToMeasure,
} from "../enum";
import { faCircle, faSquare, faMinus, faPlus, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  InputControl,
  Row,
  Column,
  ConditionalWrapper,
  ToggleButton,
  Footer,
  SelectInput,
  ColorPicker,
  SwitchOption,
  Accordion
} from "@truviz/shadow/dist/Components";
import { IErrorBarsSettings, ILabelValuePair } from "../visual-settings.interface";
import { Visual } from "../visual";
import { IMarkerData } from "./markerSelector";
import { CATEGORY_MARKERS } from "./markers";
import { BoldIcon, DashedLineIcon, DottedLineIcon, ItalicIcon, SolidLineIcon, UnderlineIcon } from "./SettingsIcons";
import { persistProperties } from "../methods/methods";

let MARKERS_LIST: IMarkerData[] = [];

const ErrorBarsSettings = (props) => {
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
      ...ERROR_BARS_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...ERROR_BARS_SETTINGS };
  }

  const applyChanges = () => {
    persistProperties(shadow, sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...ERROR_BARS_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<IErrorBarsSettings>({
    ...initialStates,
  });

  const handleChange = (val, n, type: EErrorBarsSettings) => {
    setConfigValues((d) => ({
      ...d,
      [type]: { ...d[type], [n]: val }
    }));
  };

  const handleCheckbox = (n, type: EErrorBarsSettings) => {
    setConfigValues((d) => ({
      ...d,
      [type]: { ...d[type], [n]: !d[type][n] }
    }));
  };

  const handleColor = (rgb, n, type: EErrorBarsSettings) => {
    setConfigValues((d) => ({
      ...d,
      [type]: { ...d[type], [n]: rgb }
    }));
  };

  MARKERS_LIST = [];
  CATEGORY_MARKERS.map((marker) => {
    MARKERS_LIST.push({
      label: marker.label.split("_").join(" ").toLowerCase(),
      value: marker.value,
      paths: marker.paths,
      w: marker.w,
      h: marker.h,
    });
  });

  const markerIconsList: { label: any; value: string }[] = [
    {
      label: <FontAwesomeIcon icon={faCircle} />,
      value: EErrorBarsMarkerShape.Circle,
    },
    {
      label: <FontAwesomeIcon icon={faSquare} />,
      value: EErrorBarsMarkerShape.Square,
    },
    {
      label: <FontAwesomeIcon icon={faClose} />,
      value: EErrorBarsMarkerShape.Close,
    },
    {
      label: <FontAwesomeIcon icon={faMinus} />,
      value: EErrorBarsMarkerShape.Minus,
    },
    {
      label: <FontAwesomeIcon icon={faPlus} />,
      value: EErrorBarsMarkerShape.Plus,
    },
  ];

  const RELATIONSHIP_TO_MEASURE: ILabelValuePair[] = [
    {
      label: "ABSOLUTE",
      value: ERelationshipToMeasure.Absolute,
    },
    {
      label: "RELATIVE",
      value: ERelationshipToMeasure.Relative,
    },
  ];

  const TOOLTIP_LABEL_FORMAT: ILabelValuePair[] = [
    {
      label: "Absolute",
      value: EErrorBarsTooltipLabelFormat.Absolute,
    },
    {
      label: "Relative Numeric",
      value: EErrorBarsTooltipLabelFormat.RelativeNumeric,
    },
    {
      label: "Relative Percentage",
      value: EErrorBarsTooltipLabelFormat.RelativePercentage,
    },
  ];

  const CALCULATION_TYPE: ILabelValuePair[] = [
    {
      label: "By Field",
      value: EErrorBarsCalcTypes.ByField,
    },
    {
      label: "By Percentage",
      value: EErrorBarsCalcTypes.ByPercentage,
    },
    // {
    //   label: "By Percentile",
    //   value: EErrorBarsCalcTypes.ByPercentile,
    // },
    // {
    //   label: "By Standard Deviation",
    //   value: EErrorBarsCalcTypes.ByStandardDeviation,
    // },
    {
      label: "By Value",
      value: EErrorBarsCalcTypes.ByValue,
    },
  ];

  const ERROR_BAND_FILL_TYPE: ILabelValuePair[] = [
    {
      label: "Fill",
      value: EErrorBandFillTypes.Fill,
    },
    {
      label: "Line",
      value: EErrorBandFillTypes.Line,
    },
    {
      label: "Fill & Line",
      value: EErrorBandFillTypes.FillAndLine,
    },
  ];

  const LINE_TYPES = [
    {
      label: <SolidLineIcon fill="currentColor" />,
      value: ELineType.Solid,
    },
    {
      label: <DashedLineIcon fill="currentColor" />,
      value: ELineType.Dashed,
    },
    {
      label: <DottedLineIcon fill="currentColor" />,
      value: ELineType.Dotted,
    },
  ];

  const MARKER_TYPES = [
    {
      label: "Dash",
      value: EErrorBarsMarkerShape.Dash,
    },
    {
      label: "Circle",
      value: EErrorBarsMarkerShape.Circle,
    },
    {
      label: "Square",
      value: EErrorBarsMarkerShape.Square,
    },
    {
      label: "Cross",
      value: EErrorBarsMarkerShape.Close,
    },
    {
      label: "Minus",
      value: EErrorBarsMarkerShape.Minus,
    },
    {
      label: "Plus",
      value: EErrorBarsMarkerShape.Plus,
    },
  ];

  const DIRECTION: ILabelValuePair[] = [
    {
      label: "Both",
      value: EErrorBarsDirection.Both,
    },
    {
      label: "Minus",
      value: EErrorBarsDirection.Minus,
    },
    {
      label: "Plus",
      value: EErrorBarsDirection.Plus,
    },
  ];

  const MEASURES_LIST: ILabelValuePair[] = (shadow as Visual).measureNames.map(d => ({ label: d, value: d }));
  const UPPER_BOUND_LIST: ILabelValuePair[] = (shadow as Visual).upperBoundMeasureNames.map(d => ({ label: d, value: d }));
  const LOWER_BOUND_LIST: ILabelValuePair[] = (shadow as Visual).lowerBoundMeasureNames.map(d => ({ label: d, value: d }));

  React.useEffect(() => {
    if (!configValues.measurement.applySettingsToMeasure) {
      handleChange(MEASURES_LIST[0].value, EErrorBarsSettings.ApplySettingsToMeasure, EErrorBarsSettings.Measurement);
    }

    if (!configValues.measurement.upperBoundMeasure && UPPER_BOUND_LIST.length > 0) {
      handleChange(UPPER_BOUND_LIST[0].value, EErrorBarsSettings.UpperBoundMeasure, EErrorBarsSettings.Measurement);
    }

    if (!configValues.measurement.lowerBoundMeasure && LOWER_BOUND_LIST.length > 0) {
      handleChange(LOWER_BOUND_LIST[0].value, EErrorBarsSettings.LowerBoundMeasure, EErrorBarsSettings.Measurement);
    }

    if (!shadow.upperBoundMeasureNames.includes(configValues.measurement.upperBoundMeasure)) {
      handleChange(UPPER_BOUND_LIST.length > 0 ? UPPER_BOUND_LIST[0].value : undefined, EErrorBarsSettings.UpperBoundMeasure, EErrorBarsSettings.Measurement);
    }

    if (!shadow.lowerBoundMeasureNames.includes(configValues.measurement.lowerBoundMeasure)) {
      handleChange(LOWER_BOUND_LIST.length > 0 ? LOWER_BOUND_LIST[0].value : undefined, EErrorBarsSettings.LowerBoundMeasure, EErrorBarsSettings.Measurement);
    }
  }, []);

  return (
    <>
      <Row enableBottomPadding>
        <Column>
          <ToggleButton
            label={"Enable"}
            value={configValues.isEnabled}
            handleChange={() => setConfigValues((d) => ({
              ...d,
              [EErrorBarsSettings.IsEnabled]: !d[EErrorBarsSettings.IsEnabled]
            }))}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isEnabled}>
        <Accordion title="Measurements" open={true} childTopPadding={true} childBottomPadding>
          <Row>
            <Column>
              <SwitchOption
                label="Direction"
                value={configValues.measurement.direction}
                optionsList={DIRECTION}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.Direction, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label={"Apply Settings To Measure"}
                value={configValues.measurement.applySettingsToMeasure}
                optionsList={MEASURES_LIST}
                handleChange={value => handleChange(value, EErrorBarsSettings.ApplySettingsToMeasure, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label={"Calculation Type"}
                value={configValues.measurement.calcType}
                optionsList={CALCULATION_TYPE}
                handleChange={value => handleChange(value, EErrorBarsSettings.CalcType, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByField}>
            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Both}>
              <Row>
                <Column>
                  <SelectInput
                    label={"Upper Bound"}
                    value={configValues.measurement.upperBoundMeasure}
                    optionsList={UPPER_BOUND_LIST}
                    handleChange={value => handleChange(value, EErrorBarsSettings.UpperBoundMeasure, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>

              <ConditionalWrapper visible={!configValues.measurement.makeSymmetrical}>
                <Row>
                  <Column>
                    <SelectInput
                      label={"Lower Bound"}
                      value={configValues.measurement.lowerBoundMeasure}
                      optionsList={LOWER_BOUND_LIST}
                      handleChange={value => handleChange(value, EErrorBarsSettings.LowerBoundMeasure, EErrorBarsSettings.Measurement)}
                    />
                  </Column>
                </Row>
              </ConditionalWrapper>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Plus}>
              <Row>
                <Column>
                  <SelectInput
                    label={"Bound Value"}
                    value={configValues.measurement.upperBoundMeasure}
                    optionsList={UPPER_BOUND_LIST}
                    handleChange={value => handleChange(value, EErrorBarsSettings.UpperBoundMeasure, EErrorBarsSettings.Measurement)}
                  />
                </Column>
                <Column></Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Minus}>
              <ConditionalWrapper visible={!configValues.measurement.makeSymmetrical}>
                <Row>
                  <Column>
                    <SelectInput
                      label={"Bound Value"}
                      value={configValues.measurement.lowerBoundMeasure}
                      optionsList={LOWER_BOUND_LIST}
                      handleChange={value => handleChange(value, EErrorBarsSettings.LowerBoundMeasure, EErrorBarsSettings.Measurement)}
                    />
                  </Column>
                  <Column></Column>
                </Row>
              </ConditionalWrapper>
            </ConditionalWrapper>
          </ConditionalWrapper>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByPercentage || configValues.measurement.calcType === EErrorBarsCalcTypes.ByPercentile}>
            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Both}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Upper Bound (%)"
                    value={configValues.measurement.upperBoundPercentage}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.UpperBoundPercentage, EErrorBarsSettings.Measurement)}
                  />
                </Column>

                <Column>
                  <InputControl
                    type="number"
                    label="Lower Bound (%)"
                    value={configValues.measurement.lowerBoundPercentage}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.LowerBoundPercentage, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Plus}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Bound Value (%)"
                    value={configValues.measurement.upperBoundPercentage}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.UpperBoundPercentage, EErrorBarsSettings.Measurement)}
                  />
                </Column>
                <Column></Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Minus}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Bound Value (%)"
                    value={configValues.measurement.lowerBoundPercentage}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.LowerBoundPercentage, EErrorBarsSettings.Measurement)}
                  />
                </Column>
                <Column></Column>
              </Row>
            </ConditionalWrapper>
          </ConditionalWrapper>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByStandardDeviation}>
            <Row>
              <Column>
                <InputControl
                  type="number"
                  label="Standard Deviations"
                  value={configValues.measurement.standardDeviation}
                  handleChange={(value: any) => handleChange(value, EErrorBarsSettings.StandardDeviation, EErrorBarsSettings.Measurement)}
                />
              </Column>
              <Column></Column>
            </Row>
          </ConditionalWrapper>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByValue}>
            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Both}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Upper Bound"
                    value={configValues.measurement.upperBoundValue}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.UpperBoundValue, EErrorBarsSettings.Measurement)}
                  />
                </Column>

                <Column>
                  <InputControl
                    type="number"
                    label="Lower Bound"
                    value={configValues.measurement.lowerBoundValue}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.LowerBoundValue, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Plus}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Bound Value"
                    value={configValues.measurement.upperBoundValue}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.UpperBoundValue, EErrorBarsSettings.Measurement)}
                  />
                </Column>
                <Column></Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Minus}>
              <Row>
                <Column>
                  <InputControl
                    type="number"
                    label="Bound Value"
                    value={configValues.measurement.lowerBoundValue}
                    handleChange={(value: any) => handleChange(value, EErrorBarsSettings.LowerBoundValue, EErrorBarsSettings.Measurement)}
                  />
                </Column>
                <Column></Column>
              </Row>
            </ConditionalWrapper>
          </ConditionalWrapper>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByField}>
            <ConditionalWrapper visible={!configValues.measurement.makeSymmetrical}>
              <Row>
                <Column>
                  <SwitchOption
                    label="Relationship To Measure"
                    value={configValues.measurement.relationshipToMeasure}
                    optionsList={RELATIONSHIP_TO_MEASURE}
                    handleChange={value => handleChange(value, EErrorBarsSettings.RelationshipToMeasure, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <Row>
              <Column>
                <ToggleButton
                  label="Make Symmetrical"
                  value={configValues.measurement.makeSymmetrical}
                  handleChange={() => handleCheckbox(EErrorBarsSettings.MakeSymmetrical, EErrorBarsSettings.Measurement)}
                  appearance="toggle"
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </Accordion>

        <Accordion title="Error Bars" childBottomPadding open={false}>
          <Row>
            <Column>
              <ToggleButton
                label={"Show Error Bars"}
                value={configValues.errorBars.isEnabled}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorBars)}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.errorBars.isEnabled}>
            <Row>
              <Column>
                <ToggleButton
                  label={"Match Series Color"}
                  value={configValues.errorBars.isMatchSeriesColor}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.IsMatchSeriesColor, EErrorBarsSettings.ErrorBars)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <InputControl
                  type="number"
                  label="Bar Width"
                  value={configValues.errorBars.barWidth}
                  handleChange={(value: any) => handleChange(value, EErrorBarsSettings.BarWidth, EErrorBarsSettings.ErrorBars)}
                />
              </Column>

              <Column>
                <ConditionalWrapper visible={!configValues.errorBars.isMatchSeriesColor}>
                  <ColorPicker
                    label={"Bar Color"}
                    color={configValues.errorBars.barColor}
                    handleChange={value => handleChange(value, EErrorBarsSettings.BarColor, EErrorBarsSettings.ErrorBars)}
                    colorPalette={vizOptions.host.colorPalette}
                  />
                </ConditionalWrapper>
              </Column>
            </Row>

            <Row>
              <Column>
                <SelectInput
                  label={"Select Marker"}
                  value={configValues.errorBars.markerShape}
                  isFontSelector={false}
                  optionsList={MARKER_TYPES}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.MarkerShape, EErrorBarsSettings.ErrorBars)}
                />
              </Column>
            </Row>

            {/* <MarkerPicker
              label="Select Marker"
              marker={{ label: configValues.errorBars.markerShape, value: configValues.errorBars.markerShape }}
              handleChange={(e: IMarkerData) => {
                handleChange(e.value, EErrorBarsSettings.MarkerShape, EErrorBarsSettings.ErrorBars);
              }}
              markersList={MARKERS_LIST}
            /> */}

            <Row>
              <Column>
                <InputControl
                  min={0}
                  max={30}
                  type="number"
                  label="Marker Size"
                  value={configValues.errorBars.markerSize}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.MarkerSize, EErrorBarsSettings.ErrorBars)}
                />
              </Column>
              <Column>
                <ColorPicker
                  label={"Marker Color"}
                  color={configValues.errorBars.markerColor}
                  handleChange={value => handleChange(value, EErrorBarsSettings.MarkerColor, EErrorBarsSettings.ErrorBars)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <InputControl
                  min={0}
                  max={10}
                  type="number"
                  label="Border Size"
                  value={configValues.errorBars.borderSize}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.BorderSize, EErrorBarsSettings.ErrorBars)}
                />
              </Column>

              <Column>
                <ColorPicker
                  label={"Border Color"}
                  color={configValues.errorBars.borderColor}
                  handleChange={value => handleChange(value, EErrorBarsSettings.BorderColor, EErrorBarsSettings.ErrorBars)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </Accordion >

        <Accordion title="Error Band" childBottomPadding open={false}>
          <Row>
            <Column>
              <ToggleButton
                label={"Show Error Band"}
                value={configValues.errorBand.isEnabled}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorBand)}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.errorBand.isEnabled}>
            <Row>
              <Column>
                <SelectInput
                  label={"Fill Type"}
                  value={configValues.errorBand.fillType}
                  optionsList={ERROR_BAND_FILL_TYPE}
                  handleChange={value => handleChange(value, EErrorBarsSettings.FillType, EErrorBarsSettings.ErrorBand)}
                />
              </Column>
            </Row>

            {/* <Row>
              <Column>
                <ToggleButton
                  label={"Match Series Color"}
                  value={configValues.errorBand.isMatchSeriesColor}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.IsMatchSeriesColor, EErrorBarsSettings.ErrorBand)}
                />
              </Column>
            </Row> */}

            <ConditionalWrapper visible={configValues.errorBand.fillType !== EErrorBandFillTypes.Line}>
              <Row>
                <Column>
                  <ColorPicker
                    label={"Fill Color"}
                    color={configValues.errorBand.fillColor}
                    handleChange={value => handleChange(value, EErrorBarsSettings.FillColor, EErrorBarsSettings.ErrorBand)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.errorBand.fillType !== EErrorBandFillTypes.Fill}>
              <Row>
                <Column>
                  <ColorPicker
                    label={"Line Color"}
                    color={configValues.errorBand.lineColor}
                    handleChange={value => handleChange(value, EErrorBarsSettings.LineColor, EErrorBarsSettings.ErrorBand)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.errorBand.fillType !== EErrorBandFillTypes.Fill}>
              <Row>
                <Column>
                  <SwitchOption
                    label="Line Style"
                    value={configValues.errorBand.lineStyle}
                    optionsList={LINE_TYPES}
                    handleChange={(value) => handleChange(value, EErrorBarsSettings.LineStyle, EErrorBarsSettings.ErrorBand)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>
          </ConditionalWrapper>
        </Accordion >

        <Accordion title="Error Labels" childBottomPadding open={false}>
          <Row>
            <Column>
              <ToggleButton
                label={"Show Error Labels"}
                value={configValues.errorLabels.isEnabled}
                handleChange={() => handleCheckbox(EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorLabels)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.errorLabels.isEnabled}>
            <Row>
              <Column>
                <SelectInput
                  label={"Font Family"}
                  value={configValues.errorLabels.fontFamily}
                  isFontSelector={true}
                  optionsList={[]}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.FontFamily, EErrorBarsSettings.ErrorLabels)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <InputControl
                  min={1}
                  type="number"
                  label="Font Size"
                  value={configValues.errorLabels.fontSize}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.FontSize, EErrorBarsSettings.ErrorLabels)}
                />
              </Column>

              <Column>
                <ColorPicker
                  label="Font Color"
                  color={configValues.errorLabels.color}
                  handleChange={(value) => handleColor(value, EErrorBarsSettings.Color, EErrorBarsSettings.ErrorLabels)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <SwitchOption
                  label="Font Style"
                  value={configValues.errorLabels.fontStyle}
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
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.FontStyle, EErrorBarsSettings.ErrorLabels)}
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <ToggleButton
                  label={"Show Background"}
                  value={configValues.errorLabels.showBackground}
                  handleChange={() => handleCheckbox(EErrorBarsSettings.ShowBackground, EErrorBarsSettings.ErrorLabels)}
                  appearance="toggle"
                />
              </Column>
            </Row>

            <ConditionalWrapper visible={configValues.errorLabels.showBackground}>
              <Row appearance="padded">
                <Column>
                  <ColorPicker
                    label="Background Color"
                    color={configValues.errorLabels.backgroundColor}
                    handleChange={(value) => handleChange(value, EErrorBarsSettings.BackgroundColor, EErrorBarsSettings.ErrorLabels)}
                    colorPalette={vizOptions.host.colorPalette}
                    size="sm"
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <Row>
              <Column>
                <SelectInput
                  label={"Label Format"}
                  value={configValues.errorLabels.labelFormat}
                  optionsList={TOOLTIP_LABEL_FORMAT}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.LabelFormat, EErrorBarsSettings.ErrorLabels)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </Accordion>

        < Accordion title="Tooltip" childBottomPadding open={false} >
          <Row>
            <Column>
              <ToggleButton
                label={"Show Tooltip"}
                value={configValues.tooltip.isEnabled}
                handleChange={() => handleCheckbox(EErrorBarsSettings.IsEnabled, EErrorBarsSettings.Tooltip)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.tooltip.isEnabled}>
            <Row>
              <Column>
                <SelectInput
                  label={"Tooltip Label Format"}
                  value={configValues.tooltip.labelFormat}
                  optionsList={TOOLTIP_LABEL_FORMAT}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.LabelFormat, EErrorBarsSettings.Tooltip)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </Accordion >
      </ConditionalWrapper >

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default ErrorBarsSettings;
