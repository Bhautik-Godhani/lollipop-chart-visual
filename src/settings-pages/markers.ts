import { EMarkerDefaultShapes } from "../enum";
import { IMarkerData } from "./markerSelector";

export const CATEGORY_MARKERS: IMarkerData[] = [
    {
        label: "CIRCLE",
        value: EMarkerDefaultShapes.CIRCLE,
        paths: [{ d: "M8,0 A8,8 0 1,1 8,16 A8,8 0 1,1 8,0 Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 16,
        h: 16,
    },
    {
        label: "SQUARE",
        value: EMarkerDefaultShapes.SQUARE,
        paths: [{ d: "M0,0 L16,0 L16,16 L0,16 Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 16,
        h: 16,
    },
    {
        label: "TRIANGLE",
        value: EMarkerDefaultShapes.TRIANGLE,
        paths: [{ d: "M8,0 L16,16 H0 Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 16,
        h: 16,
    },
    {
        label: "DIAMOND",
        value: EMarkerDefaultShapes.DIAMOND,
        paths: [{ d: "M8,0 L16,8 L8,16 L0,8 Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 16,
        h: 16,
    }
];
