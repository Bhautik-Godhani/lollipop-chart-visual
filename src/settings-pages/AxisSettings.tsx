/* eslint-disable max-lines-per-function */
import * as React from "react";
import { X_AXIS_SETTINGS as X_AXIS_SETTINGS_IMP, Y_AXIS_SETTINGS as Y_AXIS_SETTINGS_IMP } from "../constants";
import { AxisCategoryType, EAxisDateFormats, EVisualConfig, EVisualSettings, EXAxisSettings, EXYAxisNames, EYAxisSettings, Position } from "../enum";
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
  Tabs,
  Tab,
} from "@truviz/shadow/dist/Components";
import { ILabelValuePair, IXAxisSettings, IYAxisSettings } from "../visual-settings.interface";
import { persistProperties } from "../methods/methods";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const X_AXIS_POSITION: ILabelValuePair[] = [
  {
    label: "TOP",
    value: Position.Top,
  },
  {
    label: "BOTTOM",
    value: Position.Bottom,
  }
];

const Y_AXIS_POSITION: ILabelValuePair[] = [
  {
    label: "LEFT",
    value: Position.Left,
  },
  {
    label: "RIGHT",
    value: Position.Right,
  },
];

const AXIS_MODE: ILabelValuePair[] = [
  {
    label: "Continuous",
    value: AxisCategoryType.Continuous,
  },
  {
    label: "Categorical",
    value: AxisCategoryType.Categorical,
  },
];

const AXIS_DATE_FORMATS: ILabelValuePair[] = [
  {
    label: "DD:MM:YYYY",
    value: EAxisDateFormats.DDMMYYYY,
  },
  {
    label: "DD:MM:YYYY hh:mm",
    value: EAxisDateFormats.DDMMYYYYHHMM,
  },
  {
    label: "DD:MM:YYYY hh:mm AM/PM",
    value: EAxisDateFormats.DDMMYYYYHHMMAMPM,
  },
];

const handleXChange = (val, n, setXConfigValues: React.Dispatch<React.SetStateAction<IXAxisSettings>>) => {
  setXConfigValues((d) => ({
    ...d,
    [n]: val,
  }));
};

const handleXCheckbox = (n, setXConfigValues: React.Dispatch<React.SetStateAction<IXAxisSettings>>) => {
  setXConfigValues((d) => ({
    ...d,
    [n]: !d[n],
  }));
};

const handleXColor = (rgb, n, setXConfigValues: React.Dispatch<React.SetStateAction<IXAxisSettings>>) => {
  setXConfigValues((d) => ({
    ...d,
    [n]: rgb,
  }));
};

const handleYChange = (val, n, setYConfigValues: React.Dispatch<React.SetStateAction<IYAxisSettings>>) => {
  setYConfigValues((d) => ({
    ...d,
    [n]: val,
  }));
};

const handleYCheckbox = (n, setYConfigValues: React.Dispatch<React.SetStateAction<IYAxisSettings>>) => {
  setYConfigValues((d) => ({
    ...d,
    [n]: !d[n],
  }));
};

const handleYColor = (rgb, n, setYConfigValues: React.Dispatch<React.SetStateAction<IYAxisSettings>>) => {
  setYConfigValues((d) => ({
    ...d,
    [n]: rgb,
  }));
};

const UIXAxis = (
  vizOptions: ShadowUpdateOptions,
  shadow: Visual,
  xConfigValues: IXAxisSettings,
  setXConfigValues: React.Dispatch<React.SetStateAction<IXAxisSettings>>
) => {
  return <>
    <Row>
      <Column>
        <ToggleButton
          label={"Show X Axis"}
          value={xConfigValues.show}
          handleChange={() => handleXCheckbox(EXAxisSettings.Show, setXConfigValues)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={xConfigValues.show}>
      <Row>
        <Column>
          <SwitchOption
            label="Position"
            value={xConfigValues.position}
            optionsList={X_AXIS_POSITION}
            handleChange={value => handleXChange(value, EXAxisSettings.Position, setXConfigValues)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={!shadow.isHorizontalChart && (shadow.isXIsNumericAxis || shadow.isXIsDateTimeAxis)} >
        <Row>
          <Column>
            <SelectInput
              label={"Axis Mode"}
              value={xConfigValues.categoryType}
              optionsList={AXIS_MODE}
              handleChange={(value) => handleXChange(value, EXAxisSettings.CategoryType, setXConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={shadow.isHorizontalChart}>
        <Row>
          <Column>
            <ToggleButton
              label={"Logarithm Scale"}
              value={xConfigValues.isLogarithmScale}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsLogarithmScale, setXConfigValues)}
              appearance="checkbox"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={xConfigValues.categoryType === AxisCategoryType.Continuous}>
        <Row>
          <Column>
            <ToggleButton
              label={"Minimum Range"}
              value={xConfigValues.isMinimumRangeEnabled}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsMinimumRangeEnabled, setXConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={xConfigValues.isMinimumRangeEnabled}>
          <Row>
            <Column>
              <InputControl
                min={0}
                type="number"
                label=""
                value={xConfigValues.minimumRange.toString()}
                handleChange={(value) => handleXChange(+value, EXAxisSettings.MinimumRange, setXConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Maximum Range"}
              value={xConfigValues.isMaximumRangeEnabled}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsMaximumRangeEnabled, setXConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={xConfigValues.isMaximumRangeEnabled}>
          <Row>
            <Column>
              <InputControl
                min={0}
                type="number"
                label=""
                value={xConfigValues.maximumRange.toString()}
                handleChange={(value) => handleXChange(+value, EXAxisSettings.MaximumRange, setXConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Logarithm Scale"}
              value={xConfigValues.isLogarithmScale}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsLogarithmScale, setXConfigValues)}
              appearance="checkbox"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!shadow.isHorizontalChart && (shadow.isXIsNumericAxis || shadow.isXIsDateTimeAxis) && xConfigValues.categoryType === AxisCategoryType.Continuous}>
        <Row>
          <Column>
            <ToggleButton
              label={"Invert Range"}
              value={xConfigValues.isInvertRange}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsInvertRange, setXConfigValues)}
              appearance="checkbox"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Axis Line"}
            value={xConfigValues.isShowAxisLine}
            handleChange={() => handleXCheckbox(EXAxisSettings.IsShowAxisLine, setXConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Title"}
            value={xConfigValues.isDisplayTitle}
            handleChange={() => handleXCheckbox(EXAxisSettings.IsDisplayTitle, setXConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={xConfigValues.isDisplayTitle}>
        <Row>
          <Column>
            <InputControl
              label="Title Name"
              type="text"
              value={xConfigValues.titleName}
              handleChange={(value: any) => handleXChange(value, EXAxisSettings.TitleName, setXConfigValues)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={xConfigValues.titleColor}
              handleChange={value => handleXColor(value, EXAxisSettings.TitleColor, setXConfigValues)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              label="Text Size"
              type="number"
              value={xConfigValues.titleFontSize.toString()}
              handleChange={(value: any) => handleXChange(+value, EXAxisSettings.TitleFontSize, setXConfigValues)}
              min={1}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SelectInput
              label={"Font Family"}
              value={xConfigValues.titleFontFamily}
              isFontSelector={true}
              optionsList={[]}
              handleChange={value => handleXChange(value, EXAxisSettings.TitleFontFamily, setXConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Label"}
            value={xConfigValues.isDisplayLabel}
            handleChange={() => handleXCheckbox(EXAxisSettings.IsDisplayLabel, setXConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={shadow.isXIsDateTimeAxis && !shadow.isHorizontalChart}>
        <Row>
          <Column>
            <SelectInput
              label={"Date Format"}
              value={xConfigValues.dateFormat}
              optionsList={AXIS_DATE_FORMATS}
              handleChange={value => handleXChange(value, EXAxisSettings.DateFormat, setXConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={xConfigValues.isDisplayLabel}>
        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={xConfigValues.labelColor}
              handleChange={value => handleXChange(value, EXAxisSettings.LabelColor, setXConfigValues)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SelectInput
              label="Font Family"
              value={xConfigValues.labelFontFamily}
              isFontSelector={true}
              optionsList={[]}
              handleChange={value => handleXChange(value, EXAxisSettings.LabelFontFamily, setXConfigValues)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              label="Text Size"
              type="number"
              value={xConfigValues.labelFontSize.toString()}
              handleChange={(value: any) => handleXChange(+value, EXAxisSettings.LabelFontSize, setXConfigValues)}
              min={1}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!shadow.isHorizontalChart}>
          <Row>
            <Column>
              <ToggleButton
                label={"Label Auto Tilt"}
                value={xConfigValues.isLabelAutoTilt}
                handleChange={() => handleXCheckbox(EXAxisSettings.IsLabelAutoTilt, setXConfigValues)}
                appearance="toggle"
              />
            </Column>
          </Row>

          <ConditionalWrapper visible={!xConfigValues.isLabelAutoTilt}>
            <Row>
              <Column>
                <InputControl
                  min={30}
                  max={90}
                  label="Tilt Angle"
                  type="number"
                  value={xConfigValues.labelTilt.toString()}
                  handleChange={(value: any) => handleXChange(value, EXAxisSettings.LabelTilt, setXConfigValues)}
                />
              </Column>
            </Row>
          </ConditionalWrapper>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Label Auto Char Limit"}
              value={xConfigValues.isLabelAutoCharLimit}
              handleChange={() => handleXCheckbox(EXAxisSettings.IsLabelAutoCharLimit, setXConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!xConfigValues.isLabelAutoCharLimit}>
          <Row>
            <Column>
              <InputControl
                min={2}
                max={50}
                label="Char Limit"
                type="number"
                value={xConfigValues.labelCharLimit.toString()}
                handleChange={(value: any) => handleXChange(value, EXAxisSettings.LabelCharLimit, setXConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>
    </ConditionalWrapper >
  </>
}

const UIYAxis = (
  vizOptions: ShadowUpdateOptions,
  shadow: Visual,
  yConfigValues: IYAxisSettings,
  setYConfigValues: React.Dispatch<React.SetStateAction<IYAxisSettings>>
) => {
  return <>
    <Row>
      <Column>
        <ToggleButton
          label={"Show Y Axis"}
          value={yConfigValues.show}
          handleChange={() => handleYCheckbox(EYAxisSettings.Show, setYConfigValues)}
          appearance="toggle"
        />
      </Column>
    </Row>

    <ConditionalWrapper visible={yConfigValues.show}>
      <Row>
        <Column>
          <SwitchOption
            label="Position"
            value={yConfigValues.position}
            optionsList={Y_AXIS_POSITION}
            handleChange={value => handleYChange(value, EYAxisSettings.Position, setYConfigValues)}
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={shadow.isHorizontalChart && (shadow.isYIsNumericAxis || shadow.isYIsDateTimeAxis)} >
        <Row>
          <Column>
            <SelectInput
              label={"Axis Mode"}
              value={yConfigValues.categoryType}
              optionsList={AXIS_MODE}
              handleChange={(value) => handleYChange(value, EXAxisSettings.CategoryType, setYConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={!shadow.isHorizontalChart || yConfigValues.categoryType === AxisCategoryType.Continuous}>
        <Row>
          <Column>
            <ToggleButton
              label={"Minimum Range"}
              value={yConfigValues.isMinimumRangeEnabled}
              handleChange={() => handleYCheckbox(EXAxisSettings.IsMinimumRangeEnabled, setYConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={yConfigValues.isMinimumRangeEnabled}>
          <Row>
            <Column>
              <InputControl
                min={0}
                type="number"
                label=""
                value={yConfigValues.minimumRange.toString()}
                handleChange={(value) => handleYChange(+value, EXAxisSettings.MinimumRange, setYConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Maximum Range"}
              value={yConfigValues.isMaximumRangeEnabled}
              handleChange={() => handleYCheckbox(EXAxisSettings.IsMaximumRangeEnabled, setYConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={yConfigValues.isMaximumRangeEnabled}>
          <Row>
            <Column>
              <InputControl
                min={0}
                type="number"
                label=""
                value={yConfigValues.maximumRange.toString()}
                handleChange={(value) => handleYChange(+value, EXAxisSettings.MaximumRange, setYConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ToggleButton
              label={"Logarithm Scale"}
              value={yConfigValues.isLogarithmScale}
              handleChange={() => handleYCheckbox(EXAxisSettings.IsLogarithmScale, setYConfigValues)}
              appearance="checkbox"
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Invert Range"}
            value={yConfigValues.isInvertRange}
            handleChange={() => handleYCheckbox(EXAxisSettings.IsInvertRange, setYConfigValues)}
            appearance="checkbox"
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Axis Line"}
            value={yConfigValues.isShowAxisLine}
            handleChange={() => handleYCheckbox(EYAxisSettings.IsShowAxisLine, setYConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Title"}
            value={yConfigValues.isDisplayTitle}
            handleChange={() => handleYCheckbox(EYAxisSettings.IsDisplayTitle, setYConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={yConfigValues.isDisplayTitle}>
        <Row>
          <Column>
            <InputControl
              label="Title Name"
              type="text"
              value={yConfigValues.titleName}
              handleChange={(value: any) => handleYChange(value, EYAxisSettings.TitleName, setYConfigValues)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={yConfigValues.titleColor}
              handleChange={value => handleYColor(value, EYAxisSettings.TitleColor, setYConfigValues)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              label="Text Size"
              type="number"
              value={yConfigValues.titleFontSize.toString()}
              handleChange={(value: any) => handleYChange(+value, EYAxisSettings.TitleFontSize, setYConfigValues)}
              min={1}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SelectInput
              label={"Font Family"}
              value={yConfigValues.titleFontFamily}
              isFontSelector={true}
              optionsList={[]}
              handleChange={value => handleYChange(value, EYAxisSettings.TitleFontFamily, setYConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <Row>
        <Column>
          <ToggleButton
            label={"Show Label"}
            value={yConfigValues.isDisplayLabel}
            handleChange={() => handleYCheckbox(EYAxisSettings.IsDisplayLabel, setYConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={shadow.isYIsDateTimeAxis && shadow.isHorizontalChart}>
        <Row>
          <Column>
            <SelectInput
              label={"Date Format"}
              value={yConfigValues.dateFormat}
              optionsList={AXIS_DATE_FORMATS}
              handleChange={value => handleYChange(value, EYAxisSettings.DateFormat, setYConfigValues)}
            />
          </Column>
        </Row>
      </ConditionalWrapper>

      <ConditionalWrapper visible={yConfigValues.isDisplayLabel}>
        <ConditionalWrapper visible={shadow.isHorizontalChart}>
          <Row>
            <Column>
              <ToggleButton
                label={"Show Labels Above Line"}
                value={yConfigValues.isShowLabelsAboveLine}
                handleChange={() => handleYCheckbox(EYAxisSettings.IsShowLabelsAboveLine, setYConfigValues)}
                appearance="checkbox"
              />
            </Column>
          </Row>
        </ConditionalWrapper>

        <Row>
          <Column>
            <ColorPicker
              label={"Color"}
              color={yConfigValues.labelColor}
              handleChange={value => handleYColor(value, EYAxisSettings.LabelColor, setYConfigValues)}
              colorPalette={vizOptions.host.colorPalette}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <SelectInput
              label="Font Family"
              value={yConfigValues.labelFontFamily}
              isFontSelector={true}
              optionsList={[]}
              handleChange={value => handleYChange(value, EYAxisSettings.LabelFontFamily, setYConfigValues)}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <InputControl
              label="Text Size"
              type="number"
              value={yConfigValues.labelFontSize.toString()}
              handleChange={(value: any) => handleYChange(+value, EYAxisSettings.LabelFontSize, setYConfigValues)}
              min={1}
            />
          </Column>
        </Row>

        <Row>
          <Column>
            <ToggleButton
              label={"Label Auto Char Limit"}
              value={yConfigValues.isLabelAutoCharLimit}
              handleChange={() => handleYCheckbox(EYAxisSettings.IsLabelAutoCharLimit, setYConfigValues)}
              appearance="toggle"
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={!yConfigValues.isLabelAutoCharLimit}>
          <Row>
            <Column>
              <InputControl
                min={2}
                max={50}
                label="Char Limit"
                type="number"
                value={yConfigValues.labelCharLimit.toString()}
                handleChange={(value: any) => handleYChange(value, EYAxisSettings.LabelCharLimit, setYConfigValues)}
              />
            </Column>
          </Row>
        </ConditionalWrapper>
      </ConditionalWrapper>
    </ConditionalWrapper>
  </>
}

const XAxisSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;

  const X_AXIS_SETTINGS = JSON.parse(JSON.stringify(X_AXIS_SETTINGS_IMP));
  const Y_AXIS_SETTINGS = JSON.parse(JSON.stringify(Y_AXIS_SETTINGS_IMP));

  let xInitialStates = vizOptions.formatTab[EVisualConfig.XAxisConfig][EVisualSettings.XAxisSettings];
  let yInitialStates = vizOptions.formatTab[EVisualConfig.YAxisConfig][EVisualSettings.YAxisSettings];

  try {
    xInitialStates = JSON.parse(xInitialStates);
    xInitialStates = {
      ...X_AXIS_SETTINGS,
      ...xInitialStates,
    };
  } catch (e) {
    xInitialStates = { ...X_AXIS_SETTINGS };
  }

  try {
    yInitialStates = JSON.parse(yInitialStates);
    yInitialStates = {
      ...Y_AXIS_SETTINGS,
      ...yInitialStates,
    };
  } catch (e) {
    yInitialStates = { ...Y_AXIS_SETTINGS };
  }

  const applyChanges = () => {
    if (xConfigValues.categoryType === AxisCategoryType.Continuous && xConfigValues.isMinimumRangeEnabled && xConfigValues.isMaximumRangeEnabled) {
      if (xConfigValues.maximumRange < xConfigValues.minimumRange) {
        return;
      }
    }

    if (yConfigValues.categoryType === AxisCategoryType.Continuous && yConfigValues.isMinimumRangeEnabled && yConfigValues.isMaximumRangeEnabled) {
      if (yConfigValues.maximumRange < yConfigValues.minimumRange) {
        return;
      }
    }

    if ((JSON.stringify(shadow.xAxisSettings)) !== (JSON.stringify(xConfigValues))) {
      const yAxisSettings: IYAxisSettings = {
        ...shadow.yAxisSettings,
        isMinimumRangeEnabled: xConfigValues.isMinimumRangeEnabled,
        isMaximumRangeEnabled: xConfigValues.isMaximumRangeEnabled,
        minimumRange: xConfigValues.minimumRange,
        maximumRange: xConfigValues.maximumRange,
        isLogarithmScale: xConfigValues.isLogarithmScale,
        categoryType: xConfigValues.categoryType,
        dateFormat: xConfigValues.dateFormat
      };
      shadow.persistProperties(EVisualConfig.YAxisConfig, EVisualSettings.YAxisSettings, yAxisSettings);

      persistProperties(shadow, EVisualConfig.XAxisConfig, EVisualSettings.XAxisSettings, xConfigValues);
      closeCurrentSettingHandler();
    }

    if ((JSON.stringify(shadow.yAxisSettings)) !== (JSON.stringify(yConfigValues))) {
      const xAxisSettings: IXAxisSettings = {
        ...shadow.xAxisSettings,
        isMinimumRangeEnabled: yConfigValues.isMinimumRangeEnabled,
        isMaximumRangeEnabled: yConfigValues.isMaximumRangeEnabled,
        minimumRange: yConfigValues.minimumRange,
        maximumRange: yConfigValues.maximumRange,
        isLogarithmScale: yConfigValues.isLogarithmScale,
        categoryType: yConfigValues.categoryType,
        dateFormat: yConfigValues.dateFormat
      };
      shadow.persistProperties(EVisualConfig.XAxisConfig, EVisualSettings.XAxisSettings, xAxisSettings);

      persistProperties(shadow, EVisualConfig.YAxisConfig, EVisualSettings.YAxisSettings, yConfigValues);
    }

    closeCurrentSettingHandler();
  };

  const resetChanges = () => {
    setXConfigValues({ ...X_AXIS_SETTINGS });
    setYConfigValues({ ...Y_AXIS_SETTINGS });
  };

  const [xConfigValues, setXConfigValues] = React.useState<IXAxisSettings>({
    ...xInitialStates,
  });

  const [yConfigValues, setYConfigValues] = React.useState<IYAxisSettings>({
    ...yInitialStates,
  });

  React.useEffect(() => {
    if (xConfigValues.isDisplayTitle) {
      if (xConfigValues.titleName.length === 0) {
        if (shadow.isHasMultiMeasure) {
          handleXChange(shadow.measureNames.join(" and "), EXAxisSettings.TitleName, setXConfigValues);
        } else {
          handleXChange(shadow.categoryDisplayName, EXAxisSettings.TitleName, setXConfigValues);
        }
      }
    }
  }, [xConfigValues.isDisplayTitle]);

  React.useEffect(() => {
    if (xConfigValues.categoryType === AxisCategoryType.Categorical) {
      setXConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMinimumRangeEnabled]: false,
      }));

      setXConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMaximumRangeEnabled]: false,
      }));
    }
  }, [xConfigValues.categoryType]);

  React.useEffect(() => {
    if (yConfigValues.isDisplayTitle) {
      if (yConfigValues.titleName.length === 0) {
        if (shadow.isHasMultiMeasure) {
          handleYChange(shadow.categoryDisplayName, EYAxisSettings.TitleName, setYConfigValues);
        } else {
          handleYChange(shadow.measureNames.join(" and "), EYAxisSettings.TitleName, setYConfigValues);
        }
      }
    }
  }, [yConfigValues.isDisplayTitle]);

  React.useEffect(() => {
    if (yConfigValues.categoryType === AxisCategoryType.Categorical) {
      setYConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMinimumRangeEnabled]: false,
      }));

      setYConfigValues((d) => ({
        ...d,
        [EXAxisSettings.IsMaximumRangeEnabled]: false,
      }));
    }
  }, [yConfigValues.categoryType]);

  return (
    <>
      <Tabs selected={EXYAxisNames.X}>
        <Tab title={"X - Axis"} identifier={EXYAxisNames.X}>
          {UIXAxis(vizOptions, shadow, xConfigValues, setXConfigValues)}
        </Tab>
        <Tab title={"Y - Axis"} identifier={EXYAxisNames.Y}>
          {UIYAxis(vizOptions, shadow, yConfigValues, setYConfigValues)}
        </Tab>
      </Tabs >

      <Footer
        cancelButtonHandler={closeCurrentSettingHandler}
        saveButtonConfig={{ isDisabled: false, text: "APPLY", handler: applyChanges }}
        resetButtonHandler={resetChanges}
      />
    </>
  );
};

export default XAxisSettings;
