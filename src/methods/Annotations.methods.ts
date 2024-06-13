import { Visual } from '../visual';
import VisualAnnotations from "@truviz/viz-annotations/VisualAnnotations";
import { select, selectAll } from 'd3-selection';
import { DataValuesType } from '../enum';

export const RenderLollipopAnnotations = (self: Visual, cbGetDataPoint: (self: Visual, d: any) => any): void => {
    self.visualAnnotations = new VisualAnnotations({
        rootElement: self.isSmallMultiplesEnabled ? select("#smallMultiplesContainerSVG") : self.svg,
        nodeElements: self.isLollipopTypePie ? selectAll(".pie-slice") : selectAll(".lollipop-circle"),
        arcMethod: null,
        shadow: self as any,
        annotationSettings: { object: "editor", key: "annotations" },
        getAnnotationData: (d: any) => {
            const dataPoint = cbGetDataPoint(self, d);
            return dataPoint;
        },
        viewBoxWithCenterCoordinates: false,
        offsetValues: [0, 0],
        isNodeCentricAnnotation: true,
        isClickNodeFromOutside: true,
        isHighchart: false,
    });
    self.visualAnnotations.initializeAnnotations();
    self.behavior.setVisualAnnotations(self.visualAnnotations);
}

export const GetAnnotationDataPoint = (self: Visual, d: any): any => {
    const dataPoint = {
        name: d.category + "-" + d.parentCategory + "-" + d.valueType + "-" + self.currentSmallMultipleIndex,
        width: self.isLollipopTypePie ? d.sliceWidth : self.circle1Size,
        height: self.isLollipopTypePie ? d.sliceHeight : self.circle2Size,
        originalValue: d.defaultValue,
        value: self.formatNumber(d.defaultValue, self.numberSettings, self.measureNumberFormatter[d.valueType === DataValuesType.Value1 ? 0 : 1], true, true)
    };

    dataPoint[self.measure1DisplayName] = self.formatNumber(d.value1, self.numberSettings, self.measureNumberFormatter[0], true, true);

    if (d.allMeasures && Object.keys(d.allMeasures).length > 0) {
        Object.keys(d.allMeasures).forEach(key => {
            dataPoint[key] = self.formatNumber(d.allMeasures[key].value, self.numberSettings, self.allNumberFormatter[Object.keys(d.allMeasures[key].roles)[0]], true, true);
        })
    }

    if (self.isHasMultiMeasure) {
        dataPoint[self.measure2DisplayName] = self.formatNumber(d.value2, self.numberSettings, self.measureNumberFormatter[1], true, true);
    }

    if (d.tooltipFields && d.tooltipFields.length) {
        d.tooltipFields.forEach((d, i) => {
            dataPoint[d.displayName] = self.formatNumber(d.value, self.numberSettings, self.tooltipNumberFormatter[i], true, true);
        });
    }

    // if (d.sortValues && d.sortValues.length) {
    //     d.sortValues.forEach((e, i) => {
    //         e.forEach(d => {
    //             dataPoint[d.displayName] = self.formatNumber(d.value, self.sortValuesNumberFormatter[i]);
    //         })
    //     })
    // }

    return dataPoint;
}
