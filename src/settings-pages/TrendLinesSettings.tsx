// /* eslint-disable max-lines-per-function */
// import * as React from "react";
// import { ELineType, ETrendLineSettings, ETrendLinesTypes } from "../enum";
// import { ILabelValuePair, ITrendLinesSettings } from "../visual-settings.interface";
// import {
//   AccordionAlt,
//   ColorPicker,
//   Column,
//   ConditionalWrapper,
//   Footer,
//   InputControl,
//   Row,
//   SelectInput,
//   SwitchOption,
//   ToggleButton,
// } from "@truviz/shadow/dist/Components";
// import { BoldIcon, DashedLineIcon, DottedLineIcon, ItalicIcon, SolidLineIcon, UnderlineIcon } from "./SettingsIcons";
// import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
// import { Visual } from "../visual";
// import { persistProperties } from "../methods/methods";
// import { TREND_LINES_SETTINGS as TREND_LINES_SETTINGS_IMP } from "../constants";

// const TREND_LINE_TYPES: ILabelValuePair[] = [
//   {
//     label: "Exponential",
//     value: ETrendLinesTypes.Exponential,
//   },
//   {
//     label: "Linear",
//     value: ETrendLinesTypes.Linear,
//   },
//   {
//     label: "Logarithmic",
//     value: ETrendLinesTypes.Logarithmic,
//   },
//   {
//     label: "Moving Average",
//     value: ETrendLinesTypes.MovingAverage,
//   },
//   {
//     label: "Pareto",
//     value: ETrendLinesTypes.Pareto,
//   },
//   {
//     label: "Polynomial",
//     value: ETrendLinesTypes.Polynomial,
//   },
//   {
//     label: "Power",
//     value: ETrendLinesTypes.Power,
//   },
//   {
//     label: "Running Total",
//     value: ETrendLinesTypes.RunningTotal,
//   },
// ];

// const LINE_TYPES = [
//   {
//     label: <SolidLineIcon fill="currentColor" />,
//     value: ELineType.Solid,
//   },
//   {
//     label: <DashedLineIcon fill="currentColor" />,
//     value: ELineType.Dashed,
//   },
//   {
//     label: <DottedLineIcon fill="currentColor" />,
//     value: ELineType.Dotted,
//   },
// ];

// const handleChange = (val, n, setConfigValues: React.Dispatch<React.SetStateAction<ITrendLinesSettings>>) => {
//   setConfigValues((d) => ({
//     ...d,
//     [n]: val,
//   }));
// };

// const handleColor = (rgb, n, setConfigValues: React.Dispatch<React.SetStateAction<ITrendLinesSettings>>) => {
//   setConfigValues((d) => ({
//     ...d,
//     [n]: rgb,
//   }));
// };

// const handleCheckbox = (n, setConfigValues: React.Dispatch<React.SetStateAction<ITrendLinesSettings>>) => {
//   setConfigValues((d) => ({
//     ...d,
//     [n]: !d[n],
//   }));
// };

// const UILineSettings = (
//   vizOptions: ShadowUpdateOptions,
//   configValues: ITrendLinesSettings,
//   setConfigValues: React.Dispatch<React.SetStateAction<ITrendLinesSettings>>
// ) => {
//   return (
//     <AccordionAlt title="Line Settings" childBottomPadding open={false}>
//       <Row>
//         <Column>
//           <SwitchOption
//             label="Line Style"
//             value={configValues.lineStyle}
//             optionsList={LINE_TYPES}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LineStyle, setConfigValues)}
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <InputControl
//             min={1}
//             type="number"
//             label="Line Size"
//             value={configValues.lineWidth}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LineWidth, setConfigValues)}
//           />
//         </Column>

//         <Column>
//           <ColorPicker
//             label="Line Color"
//             color={configValues.lineColor}
//             handleChange={(value) => handleColor(value, ETrendLineSettings.LineColor, setConfigValues)}
//             colorPalette={vizOptions.host.colorPalette}
//           />
//         </Column>
//       </Row>
//     </AccordionAlt>
//   );
// };

// const UILabelsSettings = (
//   vizOptions: ShadowUpdateOptions,
//   configValues: ITrendLinesSettings,
//   setConfigValues: React.Dispatch<React.SetStateAction<ITrendLinesSettings>>
// ) => {
//   return (
//     <AccordionAlt title="Label Settings" childBottomPadding open={false}>
//       <Row>
//         <Column>
//           <ToggleButton
//             label={"Show Intercept"}
//             value={configValues.isShowIntercept}
//             handleChange={() => handleCheckbox(ETrendLineSettings.IsShowIntercept, setConfigValues)}
//             appearance="checkbox"
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <ToggleButton
//             label={"Display Equation"}
//             value={configValues.isDisplayEquation}
//             handleChange={() => handleCheckbox(ETrendLineSettings.IsDisplayEquation, setConfigValues)}
//             appearance="checkbox"
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <ToggleButton
//             label={"Display R2 Value"}
//             value={configValues.isDisplayR2Value}
//             handleChange={() => handleCheckbox(ETrendLineSettings.IsDisplayR2Value, setConfigValues)}
//             appearance="checkbox"
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <SelectInput
//             label={"Font Family"}
//             value={configValues.labelFontFamily}
//             isFontSelector={true}
//             optionsList={[]}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LabelFontFamily, setConfigValues)}
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <SwitchOption
//             label="Font Style"
//             value={configValues.labelFontStyling}
//             optionsList={[
//               {
//                 label: <BoldIcon style={{ fill: "currentColor" }} />,
//                 value: "bold",
//               },
//               {
//                 label: <ItalicIcon style={{ fill: "currentColor" }} />,
//                 value: "italic",
//               },
//               {
//                 label: <UnderlineIcon style={{ fill: "currentColor" }} />,
//                 value: "underline",
//               },
//             ]}
//             isMultiple
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LabelFontStyling, setConfigValues)}
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <InputControl
//             min={1}
//             type="number"
//             label="Font Size"
//             value={configValues.labelFontSize}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LabelFontSize, setConfigValues)}
//           />
//         </Column>

//         <Column>
//           <ColorPicker
//             label="Font Color"
//             color={configValues.labelFontColor}
//             handleChange={(value) => handleColor(value, ETrendLineSettings.LabelFontColor, setConfigValues)}
//             colorPalette={vizOptions.host.colorPalette}
//           />
//         </Column>
//       </Row>

//       <Row>
//         <Column>
//           <InputControl
//             min={0}
//             type="number"
//             label="X Offset"
//             value={configValues.labelOffsetX}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LabelOffsetX, setConfigValues)}
//           />
//         </Column>

//         <Column>
//           <InputControl
//             min={0}
//             type="number"
//             label="Y Offset"
//             value={configValues.labelOffsetY}
//             handleChange={(value) => handleChange(value, ETrendLineSettings.LabelOffsetY, setConfigValues)}
//           />
//         </Column>
//       </Row>
//     </AccordionAlt>
//   );
// };

// const UIFooter = (closeCurrentSettingHandler: () => void, applyChanges: () => void, resetChanges: () => void) => {
//   return (
//     <Footer
//       cancelButtonHandler={closeCurrentSettingHandler}
//       saveButtonConfig={{
//         isDisabled: false,
//         text: "APPLY",
//         handler: applyChanges,
//       }}
//       resetButtonHandler={resetChanges}
//     />
//   );
// };

// const TrendLinesSettings = (props) => {
//   const {
//     shadow,
//     compConfig: { sectionName, propertyName },
//     vizOptions,
//     closeCurrentSettingHandler,
//   } = props;

//   const TREND_LINES_SETTINGS = JSON.parse(JSON.stringify(TREND_LINES_SETTINGS_IMP));
//   let initialStates = vizOptions.formatTab[sectionName][propertyName];

//   try {
//     initialStates = JSON.parse(initialStates);
//     initialStates = {
//       ...TREND_LINES_SETTINGS,
//       ...initialStates,
//     };
//   } catch (e) {
//     initialStates = { ...TREND_LINES_SETTINGS };
//   }

//   const applyChanges = () => {
//     persistProperties(shadow, sectionName, propertyName, configValues);
//     closeCurrentSettingHandler();
//   };

//   const resetChanges = () => {
//     setConfigValues({ ...TREND_LINES_SETTINGS });
//   };

//   const [configValues, setConfigValues] = React.useState<ITrendLinesSettings>({
//     ...initialStates,
//   });

//   const MEASURES_LIST: ILabelValuePair[] = (shadow as Visual).measureNames.map(d => ({ label: d, value: d }));

//   React.useEffect(() => {
//     if (!configValues.measureName) {
//       handleChange(MEASURES_LIST[0].value, ETrendLineSettings.MeasureName, setConfigValues);
//     }
//   }, []);

//   return (
//     <>
//       <Row>
//         <Column>
//           <ToggleButton
//             label={"Show Trend Line"}
//             value={configValues.isEnabled}
//             handleChange={() => handleCheckbox(ETrendLineSettings.IsEnabled, setConfigValues)}
//           />
//         </Column>
//       </Row>

//       <ConditionalWrapper visible={configValues.isEnabled}>
//         <Row>
//           <Column>
//             <SelectInput
//               label={"Select Measure"}
//               value={configValues.measureName}
//               optionsList={MEASURES_LIST}
//               handleChange={value => handleChange(value, ETrendLineSettings.MeasureName, setConfigValues)}
//             />
//           </Column>
//         </Row>

//         <Row enableBottomPadding>
//           <Column>
//             <SelectInput
//               label={"Select Line Type"}
//               value={configValues.lineType}
//               optionsList={TREND_LINE_TYPES}
//               handleChange={value => handleChange(value, ETrendLineSettings.LineType, setConfigValues)}
//             />
//           </Column>
//         </Row>

//         {UILineSettings(vizOptions, configValues, setConfigValues)}
//         {UILabelsSettings(vizOptions, configValues, setConfigValues)}
//       </ConditionalWrapper>

//       {UIFooter(closeCurrentSettingHandler, applyChanges, resetChanges)}
//     </>
//   );
// };

// export default TrendLinesSettings;
