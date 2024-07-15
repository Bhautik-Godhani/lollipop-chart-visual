/* eslint-disable max-lines-per-function */
import * as React from "react";
import { TEMPLATES_SETTINGS as TEMPLATES_SETTINGS_IMP } from "../constants";
import { EGeneralTemplates, EIBCSThemes, ETemplateTypes, ETemplatesSettings } from "../enum";
import { Column, ConditionalWrapper, Footer, Label, Row, Tab, Tabs, ToggleButton } from "@truviz/shadow/dist/Components";
import { IBCSDefaultHIcon, IBCSDefaultVIcon, IBCSDiverging1HIcon, IBCSDiverging1VIcon, IBCSDiverging2HIcon, IBCSDiverging2VIcon } from "./SettingsIcons";
import { ITemplateSettings } from "../visual-settings.interface";
import { ApplyThemeJson } from "../methods/methods";
import { Visual } from "../visual";

import DefaultTemplateJS from '../templates-json/defaultTemplate.json';
import RaceChartTemplateJS from '../templates-json/raceChartTemplate.json';
import FillPatternTemplateJS from '../templates-json/fillPatternTemplate.json';
import CutClipAxisTemplateJS from '../templates-json/cutClipAxisTemplate.json';
import GradientTemplateJS from '../templates-json/gradientTemplate.json';
import ReferenceLineBandTemplateJS from '../templates-json/referenceLineBandTemplate.json';
import SubcategoryWithPatternTemplateJS from '../templates-json/subcategoryWithPatternTemplate.json';
import DynamicDeviationTemplateJS from '../templates-json/dynamicDeviationTemplate.json';
import ErrorBarTemplateJS from '../templates-json/errorBarTemplate.json';
import DonutLollipopTemplateJS from '../templates-json/donutLollipopTemplate.json';

import { ApplyBeforeIBCSAppliedSettingsBack } from "../methods/IBCS.methods";
import { ApplyBeforeTemplateAppliedSettingsBack, SetBeforeTemplateSettings } from "../methods/Template.methods";

const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ITemplateSettings>>): void => {
  setConfigValues((d) => ({
    ...d,
    [n]: val,
    isResetInIBCSPressed: false
  }));
};

const UIIBCSSettings = (
  shadow: Visual,
  configValues: ITemplateSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ITemplateSettings>>
) => {
  return (
    <>
      <Row>
        <Column>
          <ToggleButton
            label={"Enable"}
            value={configValues.isIBCSEnabled}
            handleChange={(value) => handleChange(value, ETemplatesSettings.IsIBCSEnabled, setConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isIBCSEnabled}>
        <Row>
          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.DefaultVertical ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.DefaultVertical, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDefaultVIcon />
            </div>
            <Label text="IBCS 1" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.DefaultHorizontal ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.DefaultHorizontal, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDefaultHIcon />
            </div>
            <Label text="IBCS 2" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.Diverging1Vertical ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.Diverging1Vertical, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDiverging1VIcon />
            </div>
            <Label text="IBCS 3" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.Diverging1Horizontal ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.Diverging1Horizontal, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDiverging1HIcon />
            </div>
            <Label text="IBCS 4" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.Diverging2Vertical ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.Diverging2Vertical, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDiverging2VIcon />
            </div>
            <Label text="IBCS 5" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.theme === EIBCSThemes.Diverging2Horizontal ? "selected" : ""}`}
              onClick={
                () => handleChange(EIBCSThemes.Diverging2Horizontal, ETemplatesSettings.Theme, setConfigValues)
              }>
              <IBCSDiverging2HIcon />
            </div>
            <Label text="IBCS 6" classNames={["text-label"]}></Label>
          </Column>
        </Row>
      </ConditionalWrapper>
    </>
  );
};

const UIGeneralTemplates = (
  shadow: Visual,
  configValues: ITemplateSettings,
  setConfigValues: React.Dispatch<React.SetStateAction<ITemplateSettings>>
) => {
  return (
    <>
      <Row>
        <Column>
          <ToggleButton
            label={"Enabled"}
            value={configValues.isTemplatesEnabled}
            handleChange={(value) => handleChange(value, ETemplatesSettings.IsTemplatesEnabled, setConfigValues)}
            appearance="toggle"
          />
        </Column>
      </Row>

      <ConditionalWrapper visible={configValues.isTemplatesEnabled}>
        <Row>
          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.DefaultTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.DefaultTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(DefaultTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/defaultTemplate.png")}></img>
            </div>
            <Label text="Default" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.CutClipAxisTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.CutClipAxisTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(CutClipAxisTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/cutClipAxisTemplate.png")}></img>
            </div>
            <Label text="Cut/Clip Axis" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.RaceChartTemplate ? "selected" : ""}
            ${!shadow.isChartIsRaceChart ? "disabled" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.RaceChartTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(RaceChartTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/RaceChartTemplate.png")}></img>
              {!shadow.isChartIsRaceChart && (
                <div className="disabled-theme"></div>
              )
              }
            </div>
            <Label text="Race Chart" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.FillPatternTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.FillPatternTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(FillPatternTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/FillPatternTemplate.png")}></img>
            </div>
            <Label text="Fill Pattern" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.GradientTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.GradientTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(GradientTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/gradientTemplate.png")}></img>
            </div>
            <Label text="Gradient" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.ReferenceLineBandTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.ReferenceLineBandTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(ReferenceLineBandTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/referenceLineBandTemplate.png")}></img>
            </div>
            <Label text="Reference Line/Band" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.SubcategoryWithPatternTemplate ? "selected" : ""}
            ${!shadow.isHasSubcategories ? "disabled" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.SubcategoryWithPatternTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(SubcategoryWithPatternTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/subcategoryWithPatternTemplate.png")}></img>
              {!shadow.isHasSubcategories && (
                <div className="disabled-theme"></div>
              )
              }
            </div>
            <Label text="Sub Category With Patterns" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.DynamicDeviationTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.DynamicDeviationTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(DynamicDeviationTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/dynamicDeviationTemplate.png")}></img>
            </div>
            <Label text="Dynamic Deviation" classNames={["text-label"]}></Label>
          </Column>
        </Row>

        <Row>
          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.ErrorBarTemplate ? "selected" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.ErrorBarTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(ErrorBarTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/errorBarTemplate.png")}></img>
            </div>
            <Label text="Error Bar" classNames={["text-label"]}></Label>
          </Column>

          <Column>
            <div className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.DonutLollipopTemplate ? "selected" : ""}
            ${!shadow.isHasSubcategories ? "disabled" : ""}`}
              onClick={
                () => {
                  handleChange(EGeneralTemplates.DonutLollipopTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
                  handleChange(JSON.stringify(DonutLollipopTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
                }
              }>
              <img src={require("../../assets/templates/donutLollipopTemplate.png")}></img>
              {!shadow.isHasSubcategories && (
                <div className="disabled-theme"></div>
              )
              }
            </div>
            <Label text="Donut Lollipop Chart" classNames={["text-label"]}></Label>
          </Column>
        </Row>
      </ConditionalWrapper >
    </>
  );
};

const UIFooter = (closeCurrentSettingHandler: () => void, applyChanges: () => void, resetChanges: () => void) => {
  return (
    <Footer
      cancelButtonHandler={closeCurrentSettingHandler}
      saveButtonConfig={{
        isDisabled: false,
        text: "APPLY",
        handler: applyChanges,
      }}
      resetButtonHandler={resetChanges}
    />
  );
};

const TemplatesSettings = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    vizOptions,
    closeCurrentSettingHandler,
  } = props;

  const TEMPLATES_SETTINGS = JSON.parse(JSON.stringify(TEMPLATES_SETTINGS_IMP));
  let initialStates = vizOptions.formatTab[sectionName][propertyName];

  try {
    initialStates = JSON.parse(initialStates);
    initialStates = {
      ...TEMPLATES_SETTINGS,
      ...initialStates,
    };
  } catch (e) {
    initialStates = { ...TEMPLATES_SETTINGS };
  }

  const [configValues, setConfigValues] = React.useState<ITemplateSettings>({
    ...initialStates,
    isResetInIBCSPressed: false
  });

  const [selectedTemplate, setSelectedTemplate] = React.useState<ETemplateTypes>(ETemplateTypes.Template);

  React.useEffect(() => {
    setConfigValues({ ...configValues, isResetInIBCSPressed: false });
  }, []);

  React.useEffect(() => {
    if (configValues.isIBCSEnabled && configValues.theme === undefined) {
      setConfigValues({ ...configValues, theme: EIBCSThemes.DefaultVertical });
    } else {
      setConfigValues({ ...configValues, isResetInIBCSPressed: true });
    }
  }, [configValues.isIBCSEnabled])

  const resetChanges = () => {
    if (configValues.isIBCSEnabled) {
      setConfigValues({ ...TEMPLATES_SETTINGS, isResetInIBCSPressed: true });
    } else {
      setConfigValues({ ...TEMPLATES_SETTINGS });
    }
  };

  const applyChanges = () => {
    const visual: Visual = shadow;
    configValues.prevTheme = visual.templateSettings.theme;

    if (selectedTemplate === ETemplateTypes.IBCS) {
      if (!configValues.isResetInIBCSPressed && (configValues.isIBCSEnabled !== shadow.templateSettings.isIBCSEnabled || configValues.theme !== shadow.templateSettings.theme)) {
        shadow.persistProperties(sectionName, propertyName, configValues);
      } else {
        if (configValues.isIBCSEnabled) {
          const newConfigValues = {
            ...configValues,
            [ETemplatesSettings.IsIBCSEnabled]: false,
            [ETemplatesSettings.Theme]: undefined,
            [ETemplatesSettings.PrevTheme]: undefined,
          };
          shadow.persistProperties(sectionName, propertyName, newConfigValues);
        } else {
          configValues.isIBCSEnabled = false;
          configValues.theme = undefined;
          configValues.prevTheme = undefined;
          if (visual.templateSettings.isIBCSEnabled) {
            ApplyBeforeIBCSAppliedSettingsBack(shadow);
          }
          shadow.persistProperties(sectionName, propertyName, configValues);
        }
      }
    }

    if (selectedTemplate === ETemplateTypes.Template && configValues.isTemplatesEnabled) {
      configValues.isIBCSEnabled = false;
      configValues.theme = undefined;
      configValues.prevTheme = undefined;
      if (shadow.isIBCSEnabled) {
        ApplyBeforeIBCSAppliedSettingsBack(shadow);
      }
      if (!shadow.templateSettings.isTemplatesEnabled) {
        SetBeforeTemplateSettings(shadow, configValues);
      }
      ApplyThemeJson(shadow, configValues.templateSchema, vizOptions.formatTab);
      shadow.persistProperties(sectionName, propertyName, configValues);
    } else {
      ApplyBeforeTemplateAppliedSettingsBack(shadow);
      shadow.persistProperties(sectionName, propertyName, configValues);
    }

    closeCurrentSettingHandler();
  };

  return (
    <>
      <Tabs selected={ETemplateTypes.Template} onChange={(value) => {
        setSelectedTemplate(value);
      }}>
        <Tab title={"General"} identifier={ETemplateTypes.Template}>
          {UIGeneralTemplates(shadow, configValues, setConfigValues)}
        </Tab>

        <Tab title={"IBCS"} identifier={ETemplateTypes.IBCS}>
          {UIIBCSSettings(shadow, configValues, setConfigValues)}
        </Tab>
      </Tabs>

      {UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
    </>
  );
};

export default TemplatesSettings;
