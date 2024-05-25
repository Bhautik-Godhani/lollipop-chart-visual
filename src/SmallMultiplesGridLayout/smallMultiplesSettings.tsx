/* eslint-disable max-lines-per-function */
import * as React from "react";
import { EFontStyle, ELineType, ESmallMultiplesAxisType, ESmallMultiplesBackgroundType, ESmallMultiplesDisplayType, ESmallMultiplesHeaderAlignment, ESmallMultiplesHeaderDisplayType, ESmallMultiplesHeaderPosition, ESmallMultiplesLayoutType, ESmallMultiplesSettings, ESmallMultiplesShadowType, ESmallMultiplesViewType, ESmallMultiplesXAxisPosition, ESmallMultiplesYAxisPosition, ILabelValuePair, ISmallMultiplesGridLayoutSettings } from ".";
import { BoldIcon, BottomAlignmentIcon, CenterHorizontalAlignmentIcon, DashedLineIcon, DottedLineIcon, ItalicIcon, LeftAlignmentIcon, RightAlignmentIcon, SolidLineIcon, TopAlignmentIcon, UnderlineIcon } from "../settings-pages/SettingsIcons";
import { AccordionAlt, ColorPicker, Column, ConditionalWrapper, Footer, InputControl, Quote, Row, SelectInput, SwitchOption, Tab, Tabs, ToggleButton } from "@truviz/shadow/dist/Components";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const LAYOUT_TYPES: ILabelValuePair[] = [
  {
    value: ESmallMultiplesLayoutType.Grid,
    label: "Grid",
    tooltip: "Panel of equal size split into rows and columns."
  },
  {
    value: ESmallMultiplesLayoutType.ScaledRows,
    label: "Scaled Rows",
    tooltip: "Rows are scaled into varying heights based on the top performer among the rows."
  },
  {
    value: ESmallMultiplesLayoutType.RankedPanels,
    label: "Ranked Panels",
    tooltip: "Panels are sized differently based on Ranked values."
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
    label: <LeftAlignmentIcon fill="currentColor" />,
    value: "left",
  },
  {
    label: <CenterHorizontalAlignmentIcon fill="currentColor" />,
    value: "center",
  },
  {
    label: <RightAlignmentIcon fill="currentColor" />,
    value: "right",
  },
];

const HEADER_POSITION = [
  {
    label: <TopAlignmentIcon fill="currentColor" />,
    value: "top",
  },
  {
    label: <BottomAlignmentIcon fill="currentColor" />,
    value: "bottom",
  },
];

const BACKGROUND_TYPES: ILabelValuePair[] = [
  {
    value: ESmallMultiplesBackgroundType.All,
    label: "All",
  },
  {
    value: ESmallMultiplesBackgroundType.AlternateColumns,
    label: "Alternate Columns",
  },
  {
    value: ESmallMultiplesBackgroundType.AlternateRows,
    label: "Alternate Rows",
  }
];

const SHADOW_TYPES: ILabelValuePair[] = [
  // {
  //   value: ESmallMultiplesShadowType.None,
  //   label: "None",
  // },
  {
    value: ESmallMultiplesShadowType.Simple,
    label: "Simple",
  },
  {
    value: ESmallMultiplesShadowType.StandOut,
    label: "Stand Out",
  },
  {
    value: ESmallMultiplesShadowType.Custom,
    label: "Custom",
  },
];

const FONT_STYLES = [
  {
    label: <BoldIcon style={{ fill: "currentColor" }} />,
    value: EFontStyle.Bold,
  },
  {
    label: <ItalicIcon style={{ fill: "currentColor" }} />,
    value: EFontStyle.Italic,
  },
  {
    label: <UnderlineIcon style={{ fill: "currentColor" }} />,
    value: EFontStyle.UnderLine,
  },
];

const LINE_STYLES = [
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

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [n]: val,
  }));
};

const handleHeaderChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Header]: {
      ...d[ESmallMultiplesSettings.Header],
      [n]: val,
    },
  }));
};

const handleBackgroundChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Background]: {
      ...d[ESmallMultiplesSettings.Background],
      [n]: val,
    },
  }));
};

const handleBorderChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Border]: {
      ...d[ESmallMultiplesSettings.Border],
      [n]: val,
    },
  }));
};

const handleShadowChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Shadow]: {
      ...d[ESmallMultiplesSettings.Shadow],
      [n]: val,
    },
  }));
};

const handleHeaderCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Header]: {
      ...d[ESmallMultiplesSettings.Header],
      [n]: !d[ESmallMultiplesSettings.Header][n],
    },
  }));
};

const handleBorderCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Border]: {
      ...d[ESmallMultiplesSettings.Border],
      [n]: !d[ESmallMultiplesSettings.Border][n],
    },
  }));
};

const handleShadowCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Shadow]: {
      ...d[ESmallMultiplesSettings.Shadow],
      [n]: !d[ESmallMultiplesSettings.Shadow][n],
    },
  }));
};

const handleHeaderColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Header]: {
      ...d[ESmallMultiplesSettings.Header],
      [n]: rgb,
    },
  }));
};

const handleBackgroundColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Background]: {
      ...d[ESmallMultiplesSettings.Background],
      [n]: rgb,
    },
  }));
};

const handleBorderColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Border]: {
      ...d[ESmallMultiplesSettings.Border],
      [n]: rgb,
    },
  }));
};

const handleShadowColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>) => {
  setConfigValues((d) => ({
    ...d,
    [ESmallMultiplesSettings.Shadow]: {
      ...d[ESmallMultiplesSettings.Shadow],
      [n]: rgb,
    },
  }));
};

export const SMALL_MULTIPLES_SETTINGS: ISmallMultiplesGridLayoutSettings = {
  showInfoPage: false,
  infoMessage: "",
  hostContainerId: "",
  categories: [],
  containerWidth: 0,
  containerHeight: 0,
  layoutType: ESmallMultiplesLayoutType.Grid,
  displayType: ESmallMultiplesDisplayType.Fixed,
  viewType: ESmallMultiplesViewType.Scroll,
  rows: 2,
  columns: 2,
  gridDataItemsTotals: [],
  outerSpacing: 10,
  innerSpacing: 10,
  xAxisType: ESmallMultiplesAxisType.Individual,
  yAxisType: ESmallMultiplesAxisType.Individual,
  xAxisPosition: ESmallMultiplesXAxisPosition.FrozenBottomColumn,
  yAxisPosition: ESmallMultiplesYAxisPosition.FrozenLeftColumn,
  showGridLayoutOnly: false,
  showXYAxisSettings: true,
  header: {
    displayType: ESmallMultiplesHeaderDisplayType.TitleAndTotalValue,
    fontFamily: '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif',
    fontSize: 12,
    fontColor: "rgba(102,102,102,1)",
    fontStyles: [],
    alignment: ESmallMultiplesHeaderAlignment.Left,
    position: ESmallMultiplesHeaderPosition.Top,
    isTextWrapEnabled: true
  },
  background: {
    type: ESmallMultiplesBackgroundType.All,
    panelColor: "rgba(255,255,255,1)",
    alternateColor: "rgba(255,255,255,1)",
    transparency: 100
  },
  border: {
    isShowBorder: false,
    style: ELineType.Solid,
    width: 1,
    radius: 0,
    color: "rgba(0, 0, 0, 1)"
  },
  shadow: {
    type: ESmallMultiplesShadowType.Simple,
    verticalOffset: 3,
    horizontalOffset: 3,
    blur: 7,
    spread: 0,
    color: "rgba(0, 0, 0, 10)",
    inset: false,
    isEnabled: true
  },
  onCellRendered: undefined,
  getUniformXAxisAndBrushNode: undefined,
  getXAxisNodeElementAndMeasures: undefined,
  getYAxisNodeElementAndMeasures: undefined,
  onRenderingFinished: undefined
};

const UILayout = (
  isShowGridLayoutOnly: boolean,
  isShowXYAxisSettings: boolean,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleChange: (...any) => void) => {
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

  return <>
    <ConditionalWrapper visible={!isShowGridLayoutOnly}>
      <Row>
        <Column>
          <SwitchOption
            style={{}}
            label="Layout Type"
            value={configValues.layoutType}
            optionsList={LAYOUT_TYPES}
            handleChange={value => handleChange(value, ESmallMultiplesSettings.LayoutType, setConfigValues)}
          />
        </Column>
      </Row>
    </ConditionalWrapper>

    <Row>
      <Column>
        <SelectInput
          label={"Display Type"}
          value={configValues.displayType}
          optionsList={DISPLAY_TYPES}
          handleChange={(value) => handleChange(value, ESmallMultiplesSettings.DisplayType, setConfigValues)}
        />
      </Column>

      <Column>
        <ConditionalWrapper visible={configValues.layoutType === ESmallMultiplesLayoutType.Grid}>
          <SelectInput
            label={"View Type"}
            value={configValues.viewType}
            optionsList={VIEW_TYPES}
            handleChange={(value) => handleChange(value, ESmallMultiplesSettings.ViewType, setConfigValues)}
          />
        </ConditionalWrapper>
      </Column>
    </Row>

    <ConditionalWrapper visible={configValues.displayType === ESmallMultiplesDisplayType.Fixed}>
      <ConditionalWrapper visible={configValues.layoutType === ESmallMultiplesLayoutType.Grid} >
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Rows"
              value={configValues.rows?.toString()}
              handleChange={(value) => handleChange(value, ESmallMultiplesSettings.Rows, setConfigValues)}
            />
          </Column>

          <Column>
            <InputControl
              min={0}
              type="number"
              label="Columns"
              value={configValues.columns?.toString()}
              handleChange={(value) => handleChange(value, ESmallMultiplesSettings.Columns, setConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={configValues.layoutType !== ESmallMultiplesLayoutType.Grid} >
        <Row>
          <Column>
            <InputControl
              min={0}
              type="number"
              label="Columns"
              value={configValues.columns?.toString()}
              handleChange={(value) => handleChange(value, ESmallMultiplesSettings.Columns, setConfigValues)}
            />
          </Column>
          <Column></Column>
        </Row>
      </ConditionalWrapper>
    </ConditionalWrapper>

    <Row>
      <Column>
        <InputControl
          min={0}
          type="number"
          label="Inner Spacing"
          value={configValues.innerSpacing?.toString()}
          handleChange={(value) => handleChange(value, ESmallMultiplesSettings.InnerSpacing, setConfigValues)}
        />
      </Column>

      <Column>
        <InputControl
          min={0}
          type="number"
          label="Outer Spacing"
          value={configValues.outerSpacing?.toString()}
          handleChange={(value) => handleChange(value, ESmallMultiplesSettings.OuterSpacing, setConfigValues)}
        />
      </Column>
    </Row>

    {UILayout1(isShowXYAxisSettings, configValues, setConfigValues, handleChange)}
  </>
}

const UILayout1 = (
  isShowXYAxisSettings: boolean,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleChange: (...any) => void) => {
  return <ConditionalWrapper visible={isShowXYAxisSettings}>
    <AccordionAlt title="X Axis" open={true}>
      <Row>
        <Column>
          <SelectInput
            label={"Type"}
            value={configValues.xAxisType}
            optionsList={XY_AXIS_TYPES}
            handleChange={(value) => handleChange(value, ESmallMultiplesSettings.xAxisType, setConfigValues)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.xAxisType === ESmallMultiplesAxisType.Uniform}>
        <Row>
          <Column>
            <SelectInput
              label={"Position"}
              value={configValues.xAxisPosition}
              optionsList={X_AXIS_POSITIONS}
              handleChange={(value) => handleChange(value, ESmallMultiplesSettings.xAxisPosition, setConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>
    </AccordionAlt>

    <AccordionAlt title="Y Axis" open={true}>
      <Row>
        <Column>
          <SelectInput
            label={"Type"}
            value={configValues.yAxisType}
            optionsList={XY_AXIS_TYPES}
            handleChange={(value) => handleChange(value, ESmallMultiplesSettings.yAxisType, setConfigValues)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.yAxisType === ESmallMultiplesAxisType.Uniform}>
        <Row>
          <Column>
            <SelectInput
              label={"Position"}
              value={configValues.yAxisPosition}
              optionsList={Y_AXIS_POSITIONS}
              handleChange={(value) => handleChange(value, ESmallMultiplesSettings.yAxisPosition, setConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>
    </AccordionAlt>
  </ConditionalWrapper >
}

const UIHeader = (vizOptions: ShadowUpdateOptions,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleHeaderChange: (...any) => void,
  handleHeaderColor: (...any) => void,
  handleHeaderCheckbox: (...any) => void) => {
  return <>
    {/* <AccordionAlt title="Header" open={true} > */}
    <Row>
      <Column>
        <SelectInput
          label={"Type"}
          value={configValues.header.displayType}
          optionsList={HEADER_DISPLAY_TYPES}
          handleChange={(value) => handleHeaderChange(value, ESmallMultiplesSettings.DisplayType, setConfigValues)}
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
            handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.FontFamily, setConfigValues)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <InputControl
            label="Text Size"
            type="number"
            value={configValues.header.fontSize.toString()}
            handleChange={(value: any) => handleHeaderChange(value, ESmallMultiplesSettings.FontSize, setConfigValues)}
            min={1}
          />
        </Column>

        <Column>
          <ColorPicker
            label={"Color"}
            color={configValues.header.fontColor}
            handleChange={value => handleHeaderColor(value, ESmallMultiplesSettings.FontColor, setConfigValues)}
            colorPalette={vizOptions.host.colorPalette}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <SwitchOption
            label="Styling"
            value={configValues.header.fontStyles}
            optionsList={FONT_STYLES}
            isMultiple
            handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.FontStyles, setConfigValues)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <SwitchOption
            label="Alignment"
            value={configValues.header.alignment}
            optionsList={HEADER_ALIGNMENT}
            handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.Alignment, setConfigValues)}
          />
        </Column>

        <Column>
          <SwitchOption
            label="Position"
            value={configValues.header.position}
            optionsList={HEADER_POSITION}
            handleChange={value => handleHeaderChange(value, ESmallMultiplesSettings.Position, setConfigValues)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Text Wrap"}
            value={configValues.header.isTextWrapEnabled}
            handleChange={() => handleHeaderCheckbox(ESmallMultiplesSettings.IsTextWrapEnabled, setConfigValues)}
            appearance="checkbox"
          />
        </Column>
      </Row>
    </ConditionalWrapper>
    {/* </AccordionAlt> */}
  </>
}

const UIBackground = (vizOptions: ShadowUpdateOptions,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleBackgroundChange: (...any) => void,
  handleBackgroundColor: (...any) => void) => {
  return <>
    <AccordionAlt title="Background" open={true}>
      <Row>
        <Column>
          <SelectInput
            label="Position"
            value={configValues.background.type}
            optionsList={BACKGROUND_TYPES}
            handleChange={(value) => handleBackgroundChange(value, ESmallMultiplesSettings.BackgroundType, setConfigValues)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ColorPicker
            label={"Panel Color"}
            color={configValues.background.panelColor}
            handleChange={value => handleBackgroundColor(value, ESmallMultiplesSettings.PanelColor, setConfigValues)}
            colorPalette={vizOptions.host.colorPalette}
            size="sm"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.background.type !== ESmallMultiplesBackgroundType.All}>
        <Row>
          <Column>
            <ColorPicker
              label={"Alternate Color"}
              color={configValues.background.alternateColor}
              handleChange={value => handleBackgroundColor(value, ESmallMultiplesSettings.AlternateColor, setConfigValues)}
              colorPalette={vizOptions.host.colorPalette}
              size="sm"
            />
          </Column>
        </Row>
      </ConditionalWrapper>
    </AccordionAlt>
  </>
}

const UIBorder = (vizOptions: ShadowUpdateOptions,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleBorderCheckbox: (...any) => void,
  handleBorderChange: (...any) => void,
  handleBorderColor: (...any) => void) => {
  return <>
    <AccordionAlt title="Border"
      open={configValues.border.isShowBorder}
      showToggle={true}
      toggleValue={configValues.border.isShowBorder}
      onChangeToggle={(value) => handleBorderChange(value, ESmallMultiplesSettings.IsShowBorder, setConfigValues)}
    >
      <Row>
        <Column>
          <SwitchOption
            label="Stroke Style"
            value={configValues.border.style}
            optionsList={LINE_STYLES}
            handleChange={value => handleBorderChange(value, ESmallMultiplesSettings.Style, setConfigValues)}
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
            handleChange={(value) => handleBorderChange(+value, ESmallMultiplesSettings.Width, setConfigValues)}
          />
        </Column>

        <Column>
          <InputControl
            min={0}
            type="number"
            label="Radius"
            value={configValues.border.radius?.toString()}
            handleChange={(value) => handleBorderChange(+value, ESmallMultiplesSettings.Radius, setConfigValues)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ColorPicker
            label={"Color"}
            color={configValues.border.color}
            handleChange={value => handleBorderColor(value, ESmallMultiplesSettings.Color, setConfigValues)}
            colorPalette={vizOptions.host.colorPalette}
          />
        </Column>
      </Row>
    </AccordionAlt>
  </>
}

const UIShadow = (vizOptions: ShadowUpdateOptions,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleShadowChange: (...any) => void) => {
  return <>
    <AccordionAlt title="Shadow"
      open={configValues.shadow.isEnabled}
      showToggle={true}
      toggleValue={configValues.shadow.isEnabled}
      onChangeToggle={(value) => handleShadowChange(value, ESmallMultiplesSettings.IsEnabled, setConfigValues)}
    >
      <Row>
        <Column>
          <ColorPicker
            label={"Color"}
            color={configValues.shadow.color}
            handleChange={value => handleShadowColor(value, ESmallMultiplesSettings.Color, setConfigValues)}
            colorPalette={vizOptions.host.colorPalette}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <SelectInput
            label="Shadow"
            value={configValues.shadow.type}
            optionsList={SHADOW_TYPES}
            handleChange={value => handleShadowChange(value, ESmallMultiplesSettings.BackgroundType, setConfigValues)}
          />
        </Column>
      </Row>

      {UIBorderAndShadow1(vizOptions, configValues, setConfigValues, handleShadowChange, handleShadowColor, handleShadowCheckbox)}
    </AccordionAlt>
  </>
}

const UIBorderAndShadow1 = (vizOptions: ShadowUpdateOptions,
  configValues: ISmallMultiplesGridLayoutSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ISmallMultiplesGridLayoutSettings>>,
  handleShadowChange: (...any) => void,
  handleShadowColor: (...any) => void,
  handleShadowCheckbox: (...any) => void) => {
  return < ConditionalWrapper visible={configValues.shadow.type === ESmallMultiplesShadowType.Custom} >
    <Row>
      <Column>
        <InputControl
          min={-Infinity}
          type="number"
          label="X - Direction"
          value={configValues.shadow.horizontalOffset?.toString()}
          handleChange={(value) => handleShadowChange(value, ESmallMultiplesSettings.HorizontalOffset, setConfigValues)}
        />
      </Column>

      <Column>
        <InputControl
          min={-Infinity}
          type="number"
          label="Y - Direction"
          value={configValues.shadow.verticalOffset?.toString()}
          handleChange={(value) => handleShadowChange(value, ESmallMultiplesSettings.VerticalOffset, setConfigValues)}
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
          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.Blur, setConfigValues)}
        />
      </Column>

      <Column>
        <InputControl
          min={0}
          type="number"
          label="Spread"
          value={configValues.shadow.spread?.toString()}
          handleChange={(value) => handleShadowChange(+value, ESmallMultiplesSettings.Spread, setConfigValues)}
        />
      </Column>
    </Row>

    <Row>
      <Column>
        <ToggleButton
          label={"Inset"}
          value={configValues.shadow.inset}
          handleChange={() => handleShadowCheckbox(ESmallMultiplesSettings.Inset, setConfigValues)}
          appearance="checkbox"
        />
      </Column>
    </Row>
  </ConditionalWrapper >
}

const SmallMultiplesSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    config,
    vizOptions,
    closeCurrentSettingHandler,
  } = props;
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  const isShowGridLayoutOnly = shadow.config.smallMultiplesConfig.showGridLayoutOnly;
  const isShowInfoPage = shadow.config.smallMultiplesConfig.showInfoPage;
  const infoMessage = shadow.config.smallMultiplesConfig.infoMessage;
  const isShowXYAxisSettings = shadow.config.smallMultiplesConfig.showXYAxisSettings;

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...shadow.config.smallMultiplesConfig,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...shadow.config.smallMultiplesConfig };
  }

  const applyChanges = () => {
    shadow.persistProperties(sectionName, propertyName, configValues);
    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setConfigValues({ ...shadow.config.smallMultiplesConfig });
  };

  const [configValues, setConfigValues] = React.useState<ISmallMultiplesGridLayoutSettings>({
    ...initialStates,
  });

  const [selectedTab, setSelectedTab] = React.useState<string>("layout");

  React.useEffect(() => {
    if (configValues.layoutType !== ESmallMultiplesLayoutType.Grid) {
      setConfigValues((d) => ({
        ...d,
        [ESmallMultiplesSettings.xAxisType]: ESmallMultiplesAxisType.Individual,
        [ESmallMultiplesSettings.yAxisType]: ESmallMultiplesAxisType.Individual,
      }));
    }
  }, [configValues.layoutType, configValues.xAxisType, configValues.yAxisType]);

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



  return (
    <>
      <ConditionalWrapper visible={isShowInfoPage}>
        <Row>
          <Column>
            <Quote>
              <strong>Note: </strong> {infoMessage}
            </Quote>
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!isShowInfoPage} style={{ width: "300px" }}>
        <Row disableTopPadding>
          <Column>
            <Tabs selected={selectedTab} isEqualWidthTabs={true} onChange={(val) => setSelectedTab(val)}>
              <Tab title="Layout" identifier="layout">
                {UILayout(isShowGridLayoutOnly, isShowXYAxisSettings, configValues, setConfigValues, handleChange)}
              </Tab>

              <Tab title="Header" identifier="header">
                {UIHeader(vizOptions, configValues, setConfigValues, handleHeaderChange, handleHeaderColor, handleHeaderCheckbox)}
              </Tab>

              <Tab title="General" identifier="general">
                {UIBackground(vizOptions, configValues, setConfigValues, handleBackgroundChange, handleBackgroundColor)}
                {UIShadow(vizOptions, configValues, setConfigValues, handleShadowChange)}
                {UIBorder(vizOptions, configValues, setConfigValues, handleBorderCheckbox, handleBorderChange, handleBorderColor)}
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
