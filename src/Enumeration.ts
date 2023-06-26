import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import { VisualSettings } from "./settings";
import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
  public static GET(): EnumerateSectionType[] {
    return [
      getLicenseSelection(),
      getChartConfigSelection(),
      getDataColorsConfigSelection(),
      getCircleConfigSelection(),
      getLineConfigSelection(),
      getDataLabelsConfigSelection(),
      getGridLinesConfigSelection(),
      getRankingConfigSelection(),
    ];
  }
}


function getLicenseSelection(): EnumerateSectionType {
  return {
    name: 'license',
    isShow: true,
    properties: [
      {
        name: 'purchased',
        isShow: true
      },
      {
        name: 'customer',
        isShow: true
      },
      {
        name: 'key',
        isShow: true
      },
    ]
  }
}

function getChartConfigSelection(): EnumerateSectionType {
  return {
    name: 'chartConfig',
    isShow: false,
    properties: [
      {
        name: 'chartSettings',
        isShow: true
      },
    ]
  }
}

function getDataColorsConfigSelection(): EnumerateSectionType {
  return {
    name: 'dataColorsConfig',
    isShow: false,
    properties: [
      {
        name: 'dataColorsSettings',
        isShow: true
      },
    ]
  }
}

function getCircleConfigSelection(): EnumerateSectionType {
  return {
    name: 'circleConfig',
    isShow: false,
    properties: [
      {
        name: 'circleSettings',
        isShow: true
      },
    ]
  }
}

function getLineConfigSelection(): EnumerateSectionType {
  return {
    name: 'lineConfig',
    isShow: false,
    properties: [
      {
        name: 'lineSettings',
        isShow: true
      },
    ]
  }
}

function getDataLabelsConfigSelection(): EnumerateSectionType {
  return {
    name: 'dataLabelsConfig',
    isShow: false,
    properties: [
      {
        name: 'dataLabelsSettings',
        isShow: true
      },
    ]
  }
}

function getGridLinesConfigSelection(): EnumerateSectionType {
  return {
    name: 'gridLinesConfig',
    isShow: false,
    properties: [
      {
        name: 'gridLinesSettings',
        isShow: true
      },
    ]
  }
}

function getRankingConfigSelection(): EnumerateSectionType {
  return {
    name: 'rankingConfig',
    isShow: false,
    properties: [
      {
        name: 'rankingSettings',
        isShow: true
      },
    ]
  }
}

