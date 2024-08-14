/* eslint-disable max-lines-per-function */
import * as React from "react";
import { ERROR_BARS_SETTINGS } from "../constants";
import {
  EErrorBandFillTypes,
  EErrorBarsCalcTypes,
  EErrorBarsDirection,
  EErrorBarsSettings,
  EErrorBarsTooltipLabelFormat,
  ELineType,
  ERelationshipToMeasure,
} from "../enum";
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
  AccordionAlt
} from "@truviz/shadow/dist/Components";
import { IErrorBarsSettings, ILabelValuePair } from "../visual-settings.interface";
import { Visual } from "../visual";
import { IMarkerData, MarkerPicker } from "./markerSelector";
import { BoldIcon, DashedLineIcon, DottedLineIcon, ErrorBarsPlaceholderIcon, ItalicIcon, SolidLineIcon, UnderlineIcon } from "./SettingsIcons";
import { ErrorBarsMarkers } from "../error-bars-markers";

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
    shadow.persistProperties(sectionName, propertyName, configValues);
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

  MARKERS_LIST = ErrorBarsMarkers.map(d => {
    return {
      label: d.shape,
      value: d.shape,
      w: d.w,
      h: d.h,
      paths: [{
        d: d.path,
        fill: "var(--activeSelected)",
        stroke: undefined
      }]
    }
  });

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

  if (shadow.isHasMultiMeasure) {
    MEASURES_LIST.unshift({
      label: "Both",
      value: "Both"
    });
  }

  React.useEffect(() => {
    if (!configValues.measurement.applySettingsToMeasure) {
      handleChange(MEASURES_LIST[0].value, EErrorBarsSettings.ApplySettingsToMeasure, EErrorBarsSettings.Measurement);
    }

    if (configValues.measurement.applySettingsToMeasure === "Both" && !shadow.isHasMultiMeasure) {
      handleChange(MEASURES_LIST[0].value, EErrorBarsSettings.ApplySettingsToMeasure, EErrorBarsSettings.Measurement);
    }

    if (!MEASURES_LIST.map(d => d.value).includes(configValues.measurement.applySettingsToMeasure)) {
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

      <ConditionalWrapper visible={!configValues.isEnabled}>
        <Row>
          <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="preview-image">
              <ErrorBarsPlaceholderIcon />
            </div>
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.isEnabled}>

        <AccordionAlt title="Measure" open={true}
        >
          <Row>
            <Column>
              <SwitchOption
                label="Position"
                value={configValues.measurement.direction}
                optionsList={DIRECTION}
                selectorAppearance="secondary"
                handleChange={(value) => handleChange(value, EErrorBarsSettings.Direction, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label={"Apply To Measure"}
                value={configValues.measurement.applySettingsToMeasure}
                optionsList={MEASURES_LIST}
                handleChange={value => handleChange(value, EErrorBarsSettings.ApplySettingsToMeasure, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <SelectInput
                label={"Based On"}
                value={configValues.measurement.calcType}
                optionsList={CALCULATION_TYPE}
                handleChange={value => handleChange(value, EErrorBarsSettings.CalcType, EErrorBarsSettings.Measurement)}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.measurement.calcType === EErrorBarsCalcTypes.ByField}>
            <Row>
              <Column>
                <ToggleButton
                  label="Make Symmetrical"
                  value={configValues.measurement.makeSymmetrical}
                  handleChange={() => handleCheckbox(EErrorBarsSettings.MakeSymmetrical, EErrorBarsSettings.Measurement)}
                  appearance="toggle"
                  tooltip="Use the identical measure for both the upper and lower limits of the error bar."
                />
              </Column>
            </Row>

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
                    label={"Select Field"}
                    value={configValues.measurement.upperBoundMeasure}
                    optionsList={UPPER_BOUND_LIST}
                    handleChange={value => handleChange(value, EErrorBarsSettings.UpperBoundMeasure, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>

            <ConditionalWrapper visible={configValues.measurement.direction === EErrorBarsDirection.Minus}>
              <ConditionalWrapper visible={!configValues.measurement.makeSymmetrical}>
                <Row>
                  <Column>
                    <SelectInput
                      label={"Select Field"}
                      value={configValues.measurement.lowerBoundMeasure}
                      optionsList={LOWER_BOUND_LIST}
                      handleChange={value => handleChange(value, EErrorBarsSettings.LowerBoundMeasure, EErrorBarsSettings.Measurement)}
                    />
                  </Column>
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
                    label="Value (%)"
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
                    label="Value (%)"
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
                    label="Value"
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
                    label="Value"
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
                    selectorAppearance="secondary"
                    handleChange={value => handleChange(value, EErrorBarsSettings.RelationshipToMeasure, EErrorBarsSettings.Measurement)}
                  />
                </Column>
              </Row>
            </ConditionalWrapper>
          </ConditionalWrapper>
        </AccordionAlt>

        <AccordionAlt title="Error Bar Style"
          open={configValues.errorBars.isEnabled}
          showToggle={true}
          toggleValue={configValues.errorBars.isEnabled}
          onChangeToggle={(value) => handleChange(value, EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorBars)}
        >
          <Row>
            <Column>
              <ToggleButton
                label={"Match Line Color"}
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
                  handleChange={value => handleColor(value, EErrorBarsSettings.BarColor, EErrorBarsSettings.ErrorBars)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </ConditionalWrapper>
            </Column>
          </Row>

          <Row>
            <Column>
              <MarkerPicker
                label="Marker Type"
                marker={{ label: configValues.errorBars.markerShape, value: configValues.errorBars.markerShape }}
                handleChange={(e: IMarkerData) => {
                  handleChange(e.value, EErrorBarsSettings.MarkerShape, EErrorBarsSettings.ErrorBars);
                }}
                markersList={MARKERS_LIST}
              />
            </Column>
          </Row>

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
                handleChange={value => handleColor(value, EErrorBarsSettings.MarkerColor, EErrorBarsSettings.ErrorBars)}
                colorPalette={vizOptions.host.colorPalette}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <ToggleButton
                label={"Enable Border"}
                value={configValues.errorBars.isBorderEnabled}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.IsBorderEnabled, EErrorBarsSettings.ErrorBars)}
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={configValues.errorBars.isBorderEnabled}>
            <Row appearance="padded">
              <Column>
                <InputControl
                  min={0}
                  max={10}
                  type="number"
                  label="Size"
                  value={configValues.errorBars.borderSize}
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.BorderSize, EErrorBarsSettings.ErrorBars)}
                />
              </Column>

              <Column>
                <ColorPicker
                  label={"Color"}
                  color={configValues.errorBars.borderColor}
                  handleChange={value => handleColor(value, EErrorBarsSettings.BorderColor, EErrorBarsSettings.ErrorBars)}
                  colorPalette={vizOptions.host.colorPalette}
                />
              </Column>
            </Row>
          </ConditionalWrapper>

        </AccordionAlt >

        <AccordionAlt title="Error Band"
          open={configValues.errorBand.isEnabled}
          showToggle={true}
          toggleValue={configValues.errorBand.isEnabled}
          onChangeToggle={(value) => handleChange(value, EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorBand)}
        >
          <Row>
            <Column>
              <SwitchOption
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
                  handleChange={value => handleColor(value, EErrorBarsSettings.FillColor, EErrorBarsSettings.ErrorBand)}
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
                  handleChange={value => handleColor(value, EErrorBarsSettings.LineColor, EErrorBarsSettings.ErrorBand)}
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
                  selectorAppearance="secondary"
                  handleChange={(value) => handleChange(value, EErrorBarsSettings.LineStyle, EErrorBarsSettings.ErrorBand)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </AccordionAlt >

        <AccordionAlt title="Error Labels" open={configValues.errorLabels.isEnabled}
          showToggle={true}
          toggleValue={configValues.errorLabels.isEnabled}
          onChangeToggle={() => handleCheckbox(EErrorBarsSettings.IsEnabled, EErrorBarsSettings.ErrorLabels)}
        >
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
              <SwitchOption
                label="Styling"
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
                selectorAppearance="secondary"
                handleChange={(value) => handleChange(value, EErrorBarsSettings.FontStyle, EErrorBarsSettings.ErrorLabels)}
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <InputControl
                min={1}
                type="number"
                label="Text Size"
                value={configValues.errorLabels.fontSize}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.FontSize, EErrorBarsSettings.ErrorLabels)}
              />
            </Column>

            <Column>
              <ColorPicker
                label="Color"
                color={configValues.errorLabels.color}
                handleChange={(value) => handleColor(value, EErrorBarsSettings.Color, EErrorBarsSettings.ErrorLabels)}
                colorPalette={vizOptions.host.colorPalette}
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
                  label="Color"
                  color={configValues.errorLabels.backgroundColor}
                  handleChange={(value) => handleColor(value, EErrorBarsSettings.BackgroundColor, EErrorBarsSettings.ErrorLabels)}
                  colorPalette={vizOptions.host.colorPalette}
                  size="sm"
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </AccordionAlt>

        < AccordionAlt title="Tooltip" open={configValues.tooltip.isEnabled}
          showToggle={true}
          toggleValue={configValues.tooltip.isEnabled}
          onChangeToggle={() => handleCheckbox(EErrorBarsSettings.IsEnabled, EErrorBarsSettings.Tooltip)}
        >
          <Row>
            <Column>
              <SelectInput
                label={"Label Format"}
                value={configValues.tooltip.labelFormat}
                optionsList={TOOLTIP_LABEL_FORMAT}
                handleChange={(value) => handleChange(value, EErrorBarsSettings.LabelFormat, EErrorBarsSettings.Tooltip)}
              />
            </Column>
          </Row>
        </AccordionAlt >

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
