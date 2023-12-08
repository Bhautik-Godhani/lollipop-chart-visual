/* eslint-disable max-lines-per-function */
import * as React from "react";
import { SMALL_MULTIPLES_SETTINGS } from "../constants";
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
  Tab
} from "@truviz/shadow/dist/Components";
import { AboveAlignment, BoldIcon, BottomAlignment, CenterAlignment, DashedLineIcon, DottedLineIcon, ItalicIcon, LeftAlignment, RightAlignment, SolidLineIcon, UnderlineIcon } from "./SettingsIcons";
import { ILabelValuePair } from "../visual-settings.interface";
import { ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderDisplayType, ESmallMultiplesLayoutType, ESmallMultiplesShadowType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, ISmallMultiplesGridLayoutSettings } from "../SmallMultiplesGridLayout";
import { ELineType, ESmallMultiplesSettings } from "../enum";

const SmallMultiplesSettings = (props) => {
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
      ...SMALL_MULTIPLES_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...SMALL_MULTIPLES_SETTINGS };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...SMALL_MULTIPLES_SETTINGS });
  };

  const [configValues, setConfigValues] = React.useState<ISmallMultiplesGridLayoutSettings>({
    ...initialStates,
  });

  const handleChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: val,
    }));
  };

  const handleHeaderChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: val,
      },
    }));
  };

  const handleBackgroundChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Background]: {
        ...d[ESmallMultiplesSettings.Background],
        [n]: val,
      },
    }));
  };

  const handleBorderChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: val,
      },
    }));
  };

  const handleShadowChange = (val, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: val,
      },
    }));
  };

  const handleCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [n]: !d[n],
    }));
  };

  const handleHeaderCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: !d[ESmallMultiplesSettings.Header][n],
      },
    }));
  };

  const handleBorderCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: !d[ESmallMultiplesSettings.Border][n],
      },
    }));
  };

  const handleShadowCheckbox = (n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: !d[ESmallMultiplesSettings.Shadow][n],
      },
    }));
  };

  const handleHeaderColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Header]: {
        ...d[ESmallMultiplesSettings.Header],
        [n]: rgb,
      },
    }));
  };

  const handleBackgroundColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Background]: {
        ...d[ESmallMultiplesSettings.Background],
        [n]: rgb,
      },
    }));
  };

  const handleBorderColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Border]: {
        ...d[ESmallMultiplesSettings.Border],
        [n]: rgb,
      },
    }));
  };

  const handleShadowColor = (rgb, n) => {
    setConfigValues((d) => ({
      ...d,
      [ESmallMultiplesSettings.Shadow]: {
        ...d[ESmallMultiplesSettings.Shadow],
        [n]: rgb,
      },
    }));
  };

  React.useEffect(() => {
    if (configValues.layoutType !== ESmallMultiplesLayoutType.Grid) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.xAxisType]: ESmallMultiplesAxisType.Individual,
        [ESmallMultiplesSettings.yAxisType]: ESmallMultiplesAxisType.Individual,
      }));
    }
  }, []);

  React.useEffect(() => {
    if (configValues.layoutType !== ESmallMultiplesLayoutType.Grid && configValues.displayType === ESmallMultiplesDisplayType.Fluid) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.DisplayType]: ESmallMultiplesDisplayType.Fixed,
      }));
    }
  }, [configValues.layoutType]);

  React.useEffect(() => {
    if (
      configValues.layoutType !== ESmallMultiplesLayoutType.Grid &&
      configValues.viewType === ESmallMultiplesViewType.Pagination
    ) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.ViewType]: ESmallMultiplesViewType.Scroll,
      }));
    }
  }, [configValues]);

  const LAYOUT_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesLayoutType.Grid,
      label: "Grid",
    },
    {
      value: ESmallMultiplesLayoutType.ScaledRows,
      label: "Scaled Rows",
    },
    {
      value: ESmallMultiplesLayoutType.RankedPanels,
      label: "Ranked Panels",
    },
  ];

  const XY_AXIS_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesAxisType.Uniform,
      label: "Uniform",
    },
    {
      value: ESmallMultiplesAxisType.Individual,
      label: "Individual",
    },
  ];

  const DISPLAY_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesDisplayType.Fixed,
      label: "Fixed",
    },
    {
      value: ESmallMultiplesDisplayType.Fluid,
      label: "Fluid",
    },
  ];

  const VIEW_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesViewType.Scroll,
      label: "Scroll",
    },
  ];

  if (configValues.layoutType === ESmallMultiplesLayoutType.Grid) {
    VIEW_TYPES.push({
      value: ESmallMultiplesViewType.Pagination,
      label: "Pagination",
    });
  }

  const X_AXIS_POSITIONS: ILabelValuePair[] = [
    {
      value: ESmallMultiplesXAxisPosition.All,
      label: "All",
    },
    {
      value: ESmallMultiplesXAxisPosition.FrozenBottomColumn,
      label: "Frozen Bottom Column",
    },
    {
      value: ESmallMultiplesXAxisPosition.FrozenTopColumn,
      label: "Frozen Top Column",
    },
  ];

  const Y_AXIS_POSITIONS: ILabelValuePair[] = [
    {
      value: ESmallMultiplesYAxisPosition.All,
      label: "All",
    },
    {
      value: ESmallMultiplesYAxisPosition.FrozenLeftColumn,
      label: "Frozen Left Column",
    },
    {
      value: ESmallMultiplesYAxisPosition.FrozenRightColumn,
      label: "Frozen Right Column",
    },
  ];

  const HEADER_DISPLAY_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesHeaderDisplayType.None,
      label: "None",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleOnly,
      label: "Title Only",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleAndTotalValue,
      label: "Title And Total Value",
    },
    {
      value: ESmallMultiplesHeaderDisplayType.TitleAndAverageValue,
      label: "Title And Average Value",
    },
  ];

  const HEADER_ALIGNMENT = [
    {
      label: <LeftAlignment fill="currentColor" />,
      value: "left",
    },
    {
      label: <CenterAlignment fill="currentColor" />,
      value: "center",
    },
    {
      label: <RightAlignment fill="currentColor" />,
      value: "right",
    },
  ];

  const HEADER_POSITION = [
    {
      label: <AboveAlignment fill="currentColor" />,
      value: "top",
    },
    {
      label: <BottomAlignment fill="currentColor" />,
      value: "bottom",
    },
  ];

  const BACKGROUND_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesBackgroundType.All,
      label: "All",
    },
    {
      value: ESmallMultiplesBackgroundType.AlternateItem,
      label: "Alternate Item",
    }
  ];

  const SHADOW_TYPES: ILabelValuePair[] = [
    {
      value: ESmallMultiplesShadowType.None,
      label: "None",
    },
    {
      value: ESmallMultiplesShadowType.Simple,
      label: "Simple",
    },
    {
      value: ESmallMultiplesShadowType.StandOut,
      label: "StandOut",
    },
    {
      value: ESmallMultiplesShadowType.Custom,
      label: "Custom",
    },
  ];

  return (
    <>
      {/* <Row>
        <Column>
          <ToggleButton
            label={"Enable Small Multiples"}
            value={configValues.isSmallMultiplesEnabled}
            handleChange={() => handleCheckbox(ESmallMultiplesSettings.IsSmallMultiplesEnabled)}
            appearance="checkbox"
          />
        </Column>
      </Row> */}

      <ConditionalWrapper visible={true} style={{ width: "300px" }}>
        <Row>
          <Column>
            <Tabs selected="layout">
              <Tab title="Layout" identifier="layout">
                <Row>
                  <Column>
                    <SwitchOption
                      style={{}}
                      label="Layout Type"
                      value={configValues.layoutType}
                      optionsList={LAYOUT_TYPES}
                      handleChange={value => handleChange(value, ESmallMultiplesSettings.LayoutType)}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <SelectInput
                      label={"Display Type"}
                      value={configValues.displayType}
                      optionsList={DISPLAY_TYPES}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.DisplayType)}
                    />
                  </Column>

                  <Column>
                    <SelectInput
                      label={"View Type"}
                      value={configValues.viewType}
                      optionsList={VIEW_TYPES}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.ViewType)}
                    />
                  </Column>
                </Row>

                <ConditionalWrapper visible={configValues.displayType === ESmallMultiplesDisplayType.Fixed}>
                  <Row>
                    <Column style={{ display: configValues.layoutType === ESmallMultiplesLayoutType.Grid ? "block" : "none" }}>
                      <ConditionalWrapper visible={configValues.layoutType === ESmallMultiplesLayoutType.Grid} >
                        <InputControl
                          min={0}
                          type="number"
                          label="Rows"
                          value={configValues.rows?.toString()}
                          handleChange={(value) => handleChange(value, ESmallMultiplesSettings.Rows)}
                        />
                      </ConditionalWrapper>
                    </Column>

                    <Column>
                      <InputControl
                        min={0}
                        type="number"
                        label="Columns"
                        value={configValues.columns?.toString()}
                        handleChange={(value) => handleChange(value, ESmallMultiplesSettings.Columns)}
                      />
                    </Column>
                  </Row>
                </ConditionalWrapper>

                <Row>
                  <Column>
                    <InputControl
                      min={0}
                      type="number"
                      label="Inner Spacing"
                      value={configValues.innerSpacing?.toString()}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.InnerSpacing)}
                    />
                  </Column>

                  <Column>
                    <InputControl
                      min={0}
                      type="number"
                      label="Outer Spacing"
                      value={configValues.outerSpacing?.toString()}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.OuterSpacing)}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column>
                    <SelectInput
                      label={"X Axis Type"}
                      value={configValues.xAxisType}
                      optionsList={XY_AXIS_TYPES}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.xAxisType)}
                    />
                  </Column>
                </Row>

                <ConditionalWrapper visible={configValues.xAxisType === ESmallMultiplesAxisType.Uniform}>
                  <Row>
                    <Column>
                      <SelectInput
                        label={"X Axis Position"}
                        value={configValues.xAxisPosition}
                        optionsList={X_AXIS_POSITIONS}
                        handleChange={(value) => handleChange(value, ESmallMultiplesSettings.xAxisPosition)}
                      />
                    </Column>
                  </Row>
                </ConditionalWrapper>

                <Row>
                  <Column>
                    <SelectInput
                      label={"Y Axis Type"}
                      value={configValues.yAxisType}
                      optionsList={XY_AXIS_TYPES}
                      handleChange={(value) => handleChange(value, ESmallMultiplesSettings.yAxisType)}
                    />
                  </Column>
                </Row>

                <ConditionalWrapper visible={configValues.yAxisType === ESmallMultiplesAxisType.Uniform}>
                  <Row>
                    <Column>
                      <SelectInput
                        label={"Y Axis Position"}
                        value={configValues.yAxisPosition}
                        optionsList={Y_AXIS_POSITIONS}
                        handleChange={(value) => handleChange(value, ESmallMultiplesSettings.yAxisPosition)}
                      />
                    </Column>
                  </Row>
                </ConditionalWrapper>
              </Tab>

              <Tab title="Style" identifier="style">
                <Accordion title="Header" childBottomPadding>
                  <Row>
                    <Column>
                      <SelectInput
                        label={"Type"}
                        value={configValues.header.displayType}
                        optionsList={HEADER_DISPLAY_TYPES}
                        handleChange={(value) => handleHeaderChange(value, ESmallMultiplesSettings.DisplayType)}
                      />
                    </Column>
                  </Row>

                  <ConditionalWrapper visible={configValues.header.displayType !== ESmallMultiplesHeaderDisplayType.None}>
                    <Row>
                      <Column>
                        <SelectInput
                          label={"Font Family"}
                          value={configValues.header.fontFamily}
                          isFontSelector={true}
                          optionsList={[]}
                          handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.FontFamily)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <InputControl
                          label="Text Size"
                          type="number"
                          value={configValues.header.fontSize.toString()}
                          handleChange={(value: any) => handleHeaderChange(value, ESmallMultiplesSettings.FontSize)}
                          min={1}
                        />
                      </Column>

                      <Column>
                        <ColorPicker
                          label={"Color"}
                          color={configValues.header.fontColor}
                          handleChange={value => handleHeaderColor(value, ESmallMultiplesSettings.FontColor)}
                          colorPalette={vizOptions.host.colorPalette}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <SwitchOption
                          label="Styling"
                          value={configValues.header.fontStyles}
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
                          handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.FontStyles)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <SwitchOption
                          label="Alignment"
                          value={configValues.header.alignment}
                          optionsList={HEADER_ALIGNMENT}
                          handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.Alignment)}
                        />
                      </Column>

                      <Column>
                        <SwitchOption
                          label="Position"
                          value={configValues.header.position}
                          optionsList={HEADER_POSITION}
                          handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.Position)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <ToggleButton
                          label={"Text Wrap"}
                          value={configValues.header.isTextWrapEnabled}
                          handleChange={() => handleHeaderCheckbox(ESmallMultiplesSettings.IsTextWrapEnabled)}
                          appearance="checkbox"
                        />
                      </Column>
                    </Row>
                  </ConditionalWrapper>
                </Accordion>

                <Accordion title="Background" childBottomPadding>
                  <Row>
                    <Column>
                      <SelectInput
                        label={"Type"}
                        value={configValues.background.type}
                        optionsList={BACKGROUND_TYPES}
                        handleChange={(value) => handleBackgroundChange(value, ESmallMultiplesSettings.BackgroundType)}
                      />
                    </Column>
                  </Row>

                  <Row>
                    <Column>
                      <ColorPicker
                        label={"Panel Color"}
                        color={configValues.background.panelColor}
                        handleChange={value => handleBackgroundColor(value, ESmallMultiplesSettings.PanelColor)}
                        colorPalette={vizOptions.host.colorPalette}
                      />
                    </Column>
                  </Row>

                  <ConditionalWrapper visible={configValues.background.type !== ESmallMultiplesBackgroundType.All}>
                    <Row>
                      <Column>
                        <ColorPicker
                          label={"Alternate Color"}
                          color={configValues.background.alternateColor}
                          handleChange={value => handleBackgroundColor(value, ESmallMultiplesSettings.AlternateColor)}
                          colorPalette={vizOptions.host.colorPalette}
                        />
                      </Column>
                    </Row>
                  </ConditionalWrapper>

                </Accordion>

                <Accordion title="Border & Shadow" childBottomPadding>
                  <Row>
                    <Column>
                      <ToggleButton
                        label={"Enable Border"}
                        value={configValues.border.isShowBorder}
                        handleChange={() => handleBorderCheckbox(ESmallMultiplesSettings.IsShowBorder)}
                        appearance="toggle"
                      />
                    </Column>
                  </Row>

                  <ConditionalWrapper visible={configValues.border.isShowBorder}>
                    <Row>
                      <Column>
                        <SwitchOption
                          label="Line Style"
                          value={configValues.border.style}
                          optionsList={[
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
                          ]}
                          handleChange={value => handleBorderChange(value, ESmallMultiplesSettings.Style)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="Width"
                          value={configValues.border.width?.toString()}
                          handleChange={(value) => handleBorderChange(+value, ESmallMultiplesSettings.Width)}
                        />
                      </Column>

                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="Radius"
                          value={configValues.border.radius?.toString()}
                          handleChange={(value) => handleBorderChange(+value, ESmallMultiplesSettings.Radius)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <ColorPicker
                          label={"Color"}
                          color={configValues.border.color}
                          handleChange={value => handleBorderColor(value, ESmallMultiplesSettings.Color)}
                          colorPalette={vizOptions.host.colorPalette}
                        />
                      </Column>
                    </Row>
                  </ConditionalWrapper>

                  <Row>
                    <Column>
                      <SelectInput
                        label="Shadow"
                        value={configValues.shadow.type}
                        optionsList={SHADOW_TYPES}
                        handleChange={value => handleShadowChange(value, ESmallMultiplesSettings.Type)}
                      />
                    </Column>
                  </Row>

                  <ConditionalWrapper visible={configValues.shadow.type === ESmallMultiplesShadowType.Custom}>
                    <Row>
                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="X - Direction"
                          value={configValues.shadow.horizontalOffset?.toString()}
                          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.HorizontalOffset)}
                        />
                      </Column>

                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="Y - Direction"
                          value={configValues.shadow.verticalOffset?.toString()}
                          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.VerticalOffset)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="Blur"
                          value={configValues.shadow.blur?.toString()}
                          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.Blur)}
                        />
                      </Column>

                      <Column>
                        <InputControl
                          min={0}
                          type="number"
                          label="Spread"
                          value={configValues.shadow.spread?.toString()}
                          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.Spread)}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <ColorPicker
                          label={"Color"}
                          color={configValues.shadow.color}
                          handleChange={value => handleShadowColor(value, ESmallMultiplesSettings.Color)}
                          colorPalette={vizOptions.host.colorPalette}
                        />
                      </Column>
                    </Row>

                    <Row>
                      <Column>
                        <ToggleButton
                          label={"Inset"}
                          value={configValues.shadow.inset}
                          handleChange={() => handleShadowCheckbox(ESmallMultiplesSettings.Inset)}
                          appearance="checkbox"
                        />
                      </Column>
                    </Row>
                  </ConditionalWrapper>
                </Accordion>
              </Tab>
            </Tabs>
          </Column>
        </Row>
      </ConditionalWrapper>

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default SmallMultiplesSettings;
