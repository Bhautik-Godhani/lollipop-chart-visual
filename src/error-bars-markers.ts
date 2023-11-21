import { EErrorBarsMarkerShape } from "./enum";
import { IErrorBarsMarker } from "./visual-settings.interface";

export const ErrorBarsMarkers: IErrorBarsMarker[] = [
  {
    shape: EErrorBarsMarkerShape.Dash,
    path: "M 1.5,1 L 5,1 L 5,-1 L -5,-1 L -5,1 L -1.5,1",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  },
  {
    shape: EErrorBarsMarkerShape.Circle,
    path: "M 0 0 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  },
  {
    shape: EErrorBarsMarkerShape.Square,
    path: "M 0 0 m -5 -5 l 10 0 l 0 10 l -10 0 z",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  },
  {
    shape: EErrorBarsMarkerShape.Close,
    path: "M 1.0714285714285714,1 L 4,5 L 5,4 L 1,0 L 5,-4 L 4,-5 L 0,-1 L -4,-5 L-5,-4 L -1,0 L -5,4 L -4,5 L-1.0714285714285714,1",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  },
  {
    shape: EErrorBarsMarkerShape.Minus,
    path: "M 1.0714285714285714,1 L 5,1 L 5,-1 L -1.0714285714285714,-1 L -1.0714285714285714,1",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  },
  {
    shape: EErrorBarsMarkerShape.Plus,
    path: "M 1.0714285714285714,1 L 5,1 L 5,-1, L1,-1 L1,-5 L-1,-5 L-1,-1 L-5,-1 L-5,1 L-1.0714285714285714,1",
    viewBox: "-6 -6 12 12",
    w: 5,
    h: 5,
  }
];
