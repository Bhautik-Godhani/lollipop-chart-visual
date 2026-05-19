# Template System Flow Explanation

This document explains how the template system works in the lollipop-chart-visual, so you can implement the same pattern for your filter-panel visual.

## Overview

The template system allows users to:
1. Select a template image from a gallery
2. Apply all settings from that template at once
3. Save the current state before applying
4. Restore the previous state when unchecking/removing the template

## Key Components

### 1. Template Selection UI (`src/settings-pages/Templates.tsx`)

**Template Image Selection:**
```tsx
<div 
  className={`theme-preview ${configValues.selectedTemplate === EGeneralTemplates.DefaultTemplate ? "selected" : ""}`}
  onClick={() => {
    handleChange(EGeneralTemplates.DefaultTemplate, ETemplatesSettings.SelectedTemplate, setConfigValues);
    handleChange(JSON.stringify(DefaultTemplateJS), ETemplatesSettings.TemplateSchema, setConfigValues);
  }}>
  <img src={require("../../assets/templates/defaultTemplate.png")}></img>
</div>
```

**Key Points:**
- Clicking a template image sets:
  - `selectedTemplate`: The template identifier
  - `templateSchema`: The JSON string containing all settings for that template
- Template JSON files are imported (e.g., `DefaultTemplateJS`)

### 2. Apply Changes Flow (`Templates.tsx` - `applyChanges` function)

```tsx
const applyChanges = () => {
  const visual: Visual = shadow;
  
  if (selectedTemplate === ETemplateTypes.Template && configValues.isTemplatesEnabled) {
    // Disable IBCS if enabled
    configValues.isIBCSEnabled = false;
    configValues.theme = undefined;
    configValues.prevTheme = undefined;
    
    if (shadow.isIBCSEnabled) {
      ApplyBeforeIBCSAppliedSettingsBack(shadow);
    }
    
    // Save current state BEFORE applying template (only first time)
    if (!shadow.templateSettings.isTemplatesEnabled) {
      SetBeforeTemplateSettings(shadow, configValues);
    }
    
    // Apply the template settings
    ApplyThemeJson(shadow, configValues.templateSchema, vizOptions.formatTab);
    
    // Persist template settings state
    shadow.persistProperties(sectionName, propertyName, configValues);
  } else {
    // When unchecking template, restore previous state
    ApplyBeforeTemplateAppliedSettingsBack(shadow);
    shadow.persistProperties(sectionName, propertyName, configValues);
  }
  
  closeCurrentSettingHandler();
};
```

**Flow:**
1. **First time applying template**: Save current state → Apply template
2. **Unchecking template**: Restore saved state

### 3. Saving Before State (`src/methods/Template.methods.ts` - `SetBeforeTemplateSettings`)

```typescript
export const SetBeforeTemplateSettings = (self: Visual, templateSettings: ITemplateSettings): void => {
    let beforeTemplateSettings;

    if (templateSettings.isTemplatesEnabled) {
        beforeTemplateSettings = {
            [EVisualSettings.ChartSettings]: { 
                configName: EVisualConfig.ChartConfig, 
                settingName: EVisualSettings.ChartSettings, 
                configValues: self.chartSettings 
            },
            [EVisualSettings.MarkerSettings]: { 
                configName: EVisualConfig.MarkerConfig, 
                settingName: EVisualSettings.MarkerSettings, 
                configValues: self.markerSettings 
            },
            // ... all other settings
        };

        self._host.persistProperties({
            merge: [
                {
                    objectName: EVisualConfig.Editor,
                    displayName: EVisualSettings.BeforeTemplateSettings,
                    properties: {
                        [EVisualSettings.BeforeTemplateSettings]: JSON.stringify(beforeTemplateSettings),
                    },
                    selector: null,
                },
            ],
        });
    }
}
```

**Key Points:**
- Captures ALL current settings from the visual instance
- Stores them in `beforeTemplateSettings` as a JSON string
- Uses `persistProperties` to save to PowerBI's property bag
- Only saves if template is being enabled for the first time

### 4. Applying Template Settings (`src/methods/methods.ts` - `ApplyThemeJson`)

```typescript
export const ApplyThemeJson = (self: Visual, json, formatTab) => {
    try {
        const obj = typeof json === "object" ? json : JSON.parse(json);
        const keys = Object.keys(getConfig(formatTab)); // Get all current settings
        const mergeObject = [];
        
        keys.forEach(el => {
            if (el === "conditionalFormatting" || el === "annotations") {
                // Special handling for editor settings
                mergeObject.push({
                    objectName: "editor",
                    properties: {
                        [el]: JSON.stringify(obj[el]),
                    },
                    selector: null,
                });
            } else {
                // Map setting name to config name using configs object
                if (obj.hasOwnProperty(el)) {
                    mergeObject.push({
                        objectName: configs[el], // Maps to EVisualConfig.*
                        properties: {
                            [el]: JSON.stringify(obj[el]), // Setting name
                        },
                        selector: null,
                    });
                }
            }
        });

        if (mergeObject.length > 0) {
            self._host.persistProperties({
                merge: mergeObject,
            });
        }
    } catch (e) {
        console.log("Error while applying theme", e);
    }
};
```

**Key Points:**
- Parses the template JSON
- Uses `getConfig(formatTab)` to get all current setting keys from PowerBI's formatTab
  - `getConfig` reads all settings from `formatTab[EVisualConfig.*][EVisualSettings.*]`
  - Returns an object with all setting names as keys
- Maps each setting to its config using the `configs` object:
  ```typescript
  export const configs = {
      [EVisualSettings.ChartSettings]: EVisualConfig.ChartConfig,
      [EVisualSettings.MarkerSettings]: EVisualConfig.MarkerConfig,
      // ... etc
  };
  ```
- Uses `persistProperties` to apply all settings at once

### 5. Restoring Before State (`src/methods/Template.methods.ts` - `ApplyBeforeTemplateAppliedSettingsBack`)

```typescript
export const ApplyBeforeTemplateAppliedSettingsBack = (self: Visual): void => {
    const beforeIBCSSettings = self.beforeTemplateSettings;

    if (Object.keys(beforeIBCSSettings).length > 0) {
        // Extract all saved settings
        const chartSettings: IChartSettings = beforeIBCSSettings[EVisualSettings.ChartSettings].configValues;
        const markerSettings: IMarkerSettings = beforeIBCSSettings[EVisualSettings.MarkerSettings].configValues;
        // ... extract all other settings

        // Restore each setting using persistProperties
        self._host.persistProperties({
            merge: [
                {
                    objectName: EVisualConfig.ChartConfig,
                    displayName: EVisualSettings.ChartSettings,
                    properties: {
                        [EVisualSettings.ChartSettings]: JSON.stringify(chartSettings),
                    },
                    selector: null,
                },
                // ... restore all other settings
            ],
        });
    }
}
```

**Key Points:**
- Reads from `self.beforeTemplateSettings` (loaded from PowerBI property bag)
- Extracts each saved setting's `configValues`
- Restores all settings using `persistProperties`

## Template JSON Structure

Template JSON files (e.g., `defaultTemplate.json`) contain all settings:

```json
{
    "chartSettings": { ... },
    "markerSettings": { ... },
    "dataColorsSettings": { ... },
    "lineSettings": { ... },
    "dataLabelsSettings": { ... },
    "xAxisSettings": { ... },
    "yAxisSettings": { ... },
    "sorting": { ... },
    "conditionalFormatting": { ... },
    "annotations": []
}
```

## PowerBI persistProperties Structure

The `persistProperties` method expects:

```typescript
{
    merge: [
        {
            objectName: EVisualConfig.ChartConfig,  // Config section name
            displayName: EVisualSettings.ChartSettings,  // Setting name
            properties: {
                [EVisualSettings.ChartSettings]: JSON.stringify(chartSettings),  // JSON string
            },
            selector: null,
        },
        // ... more settings
    ],
}
```

## Implementation Steps for Filter-Panel Visual

1. **Create Template Settings Interface:**
   ```typescript
   interface ITemplateSettings {
       isTemplatesEnabled: boolean;
       selectedTemplate: string;
       templateSchema: string; // JSON string
   }
   ```

2. **Create Template Selection UI:**
   - Display template images
   - On click, set `selectedTemplate` and `templateSchema`
   - Add toggle to enable/disable templates

3. **Create Template JSON Files:**
   - Create JSON files with all your visual's settings
   - Import them in your settings component

4. **Implement Save Before State:**
   - Create `SetBeforeTemplateSettings` function
   - Capture all current settings
   - Save to `beforeTemplateSettings` property

5. **Implement Apply Template:**
   - Create `ApplyThemeJson` function
   - Map settings to configs
   - Use `persistProperties` to apply all settings

6. **Implement Restore State:**
   - Create `ApplyBeforeTemplateAppliedSettingsBack` function
   - Read from `beforeTemplateSettings`
   - Restore all settings using `persistProperties`

7. **Add to Visual Class:**
   - Add `beforeTemplateSettings` property:
     ```typescript
     public beforeTemplateSettings: { [settingsName: string]: { configName: EVisualConfig, settingName: EVisualSettings, configValues: any } };
     ```
   - Load it in `afterUpdate` or similar method:
     ```typescript
     this.beforeTemplateSettings = JSON.parse(
         formatTab[EVisualConfig.Editor][EVisualSettings.BeforeTemplateSettings]
     );
     ```
   - Store template settings state

## Key Files Reference

- **UI Component**: `src/settings-pages/Templates.tsx`
- **Save Before State**: `src/methods/Template.methods.ts` - `SetBeforeTemplateSettings`
- **Apply Template**: `src/methods/methods.ts` - `ApplyThemeJson`
- **Restore State**: `src/methods/Template.methods.ts` - `ApplyBeforeTemplateAppliedSettingsBack`
- **Config Mapping**: `src/methods/methods.ts` - `configs` object
- **Template JSON**: `src/templates-json/*.json`

## Important Notes

1. **First Time Check**: Only save `beforeTemplateSettings` when enabling template for the first time
2. **JSON String**: Template schema is stored as a JSON string, not an object
3. **Config Mapping**: Each setting name must map to a config name via the `configs` object
4. **Special Cases**: `conditionalFormatting` and `annotations` use `objectName: "editor"` instead of a config
5. **State Management**: Template enabled state is persisted separately from the template schema

