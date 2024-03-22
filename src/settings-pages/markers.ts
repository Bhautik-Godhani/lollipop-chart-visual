import { EMarkerDefaultShapes } from "../enum";
import { IMarkerData } from "./markerSelector";

export const CATEGORY_MARKERS: IMarkerData[] = [
    {
        label: "CIRCLE",
        value: EMarkerDefaultShapes.CIRCLE,
        paths: [{ d: "M6.75004 0.333008C5.87456 0.333008 5.00766 0.505446 4.19882 0.840478C3.38998 1.17551 2.65505 1.66657 2.036 2.28563C0.785753 3.53587 0.083374 5.23156 0.083374 6.99967C0.083374 8.76779 0.785753 10.4635 2.036 11.7137C2.65505 12.3328 3.38998 12.8238 4.19882 13.1589C5.00766 13.4939 5.87456 13.6663 6.75004 13.6663C8.51815 13.6663 10.2138 12.964 11.4641 11.7137C12.7143 10.4635 13.4167 8.76779 13.4167 6.99967C13.4167 6.1242 13.2443 5.25729 12.9092 4.44845C12.5742 3.63961 12.0831 2.90469 11.4641 2.28563C10.845 1.66657 10.1101 1.17551 9.30126 0.840478C8.49243 0.505446 7.62552 0.333008 6.75004 0.333008Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 14,
        h: 14,
    },
    {
        label: "SQUARE",
        value: EMarkerDefaultShapes.SQUARE,
        paths: [{ d: "M2.58331 0C1.47874 0 0.583313 0.895431 0.583313 2V10C0.583313 11.1046 1.47874 12 2.58331 12H10.5833C11.6879 12 12.5833 11.1046 12.5833 10V2C12.5833 0.895431 11.6879 0 10.5833 0H2.58331Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 13,
        h: 12,
    },
    {
        label: "TRIANGLE",
        value: EMarkerDefaultShapes.VTRIANGLE,
        paths: [{ d: "M14.106 10.4856C14.5058 11.1524 14.0256 12 13.2488 12H1.25135C0.473679 12 -0.00569275 11.1515 0.394076 10.4856L6.39323 0.486308C6.47982 0.338521 6.60468 0.215735 6.7552 0.130349C6.90572 0.0449631 7.07657 0 7.2505 0C7.42443 0 7.59528 0.0449631 7.7458 0.130349C7.89632 0.215735 8.02118 0.338521 8.10777 0.486308L14.106 10.4856Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 15,
        h: 11,
    },
    {
        label: "TRIANGLE",
        value: EMarkerDefaultShapes.HTRIANGLE,
        paths: [{ d: "M1.76442 13.856C1.09763 14.2558 0.249999 13.7756 0.249999 12.9988L0.25 1.00135C0.25 0.223679 1.09849 -0.255693 1.76442 0.144075L11.7637 6.14323C11.9115 6.22982 12.0343 6.35468 12.1197 6.5052C12.205 6.65572 12.25 6.82657 12.25 7.0005C12.25 7.17443 12.205 7.34528 12.1197 7.4958C12.0343 7.64632 11.9115 7.77118 11.7637 7.85777L1.76442 13.856Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 13,
        h: 14,
    },
    {
        label: "DIAMOND",
        value: EMarkerDefaultShapes.DIAMOND,
        paths: [{ d: "M1.33564 8.39698C0.554493 7.61603 0.554491 6.34985 1.33564 5.5689L6.3202 0.585591C7.10134 -0.195359 8.36783 -0.195361 9.14898 0.585591L14.1335 5.5689C14.9147 6.34985 14.9147 7.61602 14.1335 8.39698L9.14898 13.3803C8.36783 14.1612 7.10134 14.1612 6.3202 13.3803L1.33564 8.39698Z", fill: "var(--activeSelected)", stroke: undefined }],
        w: 15,
        h: 14,
    }
];
