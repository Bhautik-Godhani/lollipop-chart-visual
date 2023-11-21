import * as React from "react";
import { Column, Row, SelectInput } from "@truviz/shadow/dist/Components";

export interface IMarkerData {
    label: string;
    value: string;
    paths?: { d: string; fill?: string; stroke: string; }[];
    w?: number;
    h?: number;
}

export interface IMarkerPickerProps {
    marker: IMarkerData;
    handleChange: (pattern: IMarkerData) => void;
    label?: string;
    markersList: IMarkerData[]
}

const getPatternPreviewSVG = (svgHeight, selectValue, data: IMarkerData) => (
    <svg
        className="svg-pattern-preview"
        style={{
            width: "35px",
            height: `${svgHeight}px`,
            borderColor:
                selectValue && selectValue.length > 0 && selectValue[0].value === data.value
                    ? "#EDD12E"
                    : "#DBDBDB",
        }}
    >
        <defs>
            <symbol
                id={data.value}
                viewBox={`0 0 ${data.w} ${data.h}`}
            >
                {data.paths.map(path => {
                    return <path d={path.d} fill={path.fill} stroke={path.stroke} ></path>
                })}
            </symbol>
        </defs>
        <use width={"35"} height={data.h} href={`#${data.value}`}
            transform={`translate(0, ${(svgHeight - data.h) / 2})`}
        ></use>
    </svg>
)

export const MarkerPicker: React.FC<IMarkerPickerProps> = ({ marker, handleChange, label, markersList }) => {
    if (!marker) {
        return;
    }

    return (
        <Row classNames={["pattern-selector-wrapper"]}>
            <Column
                classNames={["color-palettes-scrollable-wrapper"]}
                style={{ width: "244px", maxHeight: "280px" }}
            >
                <div className="pattern-wrapper marker-selector">
                    <SelectInput
                        width={"auto"}
                        label={label}
                        value={marker.value}
                        optionsList={markersList}
                        handleChange={(markerName: string, data) => {
                            handleChange({ ...data, stroke: data.stroke !== "none", fill: data.fill !== "none" });
                        }}
                        isPatternSelector={true}
                        patternData={marker}
                        formatOptionLabel={(data, { selectValue }) => {
                            const svgHeight = 26;
                            return (
                                <div className="pattern-selector-control" >
                                    <div className="pattern-preview">
                                        {getPatternPreviewSVG(svgHeight, selectValue, data)}
                                    </div>
                                    <p style={{ fontSize: "13px", padding: "3px 0px 3px 6px", maxWidth: "115px" }}>
                                        {data.label !== "" ? data.label : "None"}{" "}
                                    </p>
                                </div>
                            );
                        }}
                    />
                </div>
            </Column>
        </Row>
    );
};

