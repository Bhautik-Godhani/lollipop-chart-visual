import { Visual } from '../visual';
import VisualAnnotations from "@truviz/viz-annotations/VisualAnnotations";
import { selectAll } from 'd3-selection';
import { DataValuesType } from '../enum';

export const RenderLollipopAnnotations = (self: Visual, cbGetDataPoint: (self: Visual, d: any) => any): void => {
    self.visualAnnotations = new VisualAnnotations({
        rootElement: self.svg,
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
    });
    self.visualAnnotations.initializeAnnotations();
    self.behavior.setVisualAnnotations(self.visualAnnotations);
}

export const GetAnnotationDataPoint = (self: Visual, d: any): any => {
    const dataPoint = {
        name: d.category + "-" + d.parentCategory + "-" + d.valueType,
        width: self.isLollipopTypePie ? d.sliceWidth : self.circle1Size,
        height: self.isLollipopTypePie ? d.sliceHeight : self.circle2Size,
        originalValue: d.defaultValue,
        value: self.formatNumber(d.defaultValue, self.measureNumberFormatter[d.valueType === DataValuesType.Value1 ? 0 : 1])
    };

    dataPoint[self.measure1DisplayName] = self.formatNumber(d.value1, self.measureNumberFormatter[0]);

    if (self.isHasMultiMeasure) {
        dataPoint[self.measure2DisplayName] = self.formatNumber(d.value2, self.measureNumberFormatter[1]);
    }

    if (d.tooltipFields && d.tooltipFields.length) {
        d.tooltipFields.forEach((d, i) => {
            dataPoint[d.displayName] = self.formatNumber(d.value, self.tooltipNumberFormatter[i]);
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
