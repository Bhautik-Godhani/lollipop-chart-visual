const visualPath = "../";

const sectionKVPair = [
  { license: "PowerVIZ License" },
  { chartConfig: "Chart Configuration" },
  { dataColorsConfig: "DataColors Configuration" },
  { circleConfig: "Circle Configuration" },
  { lineConfig: "Line Configuration" },
  { dataLabelsConfig: "DataLabels Configuration" },
  { gridLinesConfig: "GridLines Configuration" },
  { rankingConfig: "Ranking Configuration" },
];

const formatTab = {
  license: [
    {
      technicalName: "purchased",
      displayName: "",
      description: "",
      type: "text",
      defaultValue: "",
    },
    {
      technicalName: "customer",
      displayName: "Licensed To",
      description: "",
      type: "text",
      defaultValue: "",
    },
    {
      technicalName: "key",
      displayName: "License",
      type: "text",
      defaultValue: "",
    },
  ],
  chartConfig: [
    {
      technicalName: "chartSettings",
      displayName: "Chart Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  dataColorsConfig: [
    {
      technicalName: "dataColorsSettings",
      displayName: "Data Colors",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  circleConfig: [
    {
      technicalName: "circleSettings",
      displayName: "Circle Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  lineConfig: [
    {
      technicalName: "lineSettings",
      displayName: "Line Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  dataLabelsConfig: [
    {
      technicalName: "dataLabelsSettings",
      displayName: "Data Labels Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  gridLinesConfig: [
    {
      technicalName: "gridLinesSettings",
      displayName: "GridLines Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
  rankingConfig: [
    {
      technicalName: "rankingSettings",
      displayName: "Ranking Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ],
};

module.exports = { visualPath, sectionKVPair, formatTab };
