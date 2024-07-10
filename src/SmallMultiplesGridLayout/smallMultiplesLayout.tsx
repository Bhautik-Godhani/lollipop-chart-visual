/* eslint-disable max-lines-per-function */
import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { useInView } from "react-intersection-observer";
import { InView } from "react-intersection-observer";
import { ESmallMultiplesBackgroundType, ESmallMultiplesShadowPosition } from "./SmallMultiples.enum";
import { ILayoutItemProps, ISmallMultiplesLayoutProps } from "./SmallMultiples.interface";

const ReactGridLayoutProvider = WidthProvider(RGL);

const getRGBFromRGBA = (rgbaString: string) => {
  if (rgbaString.startsWith("rgba")) {
    const rgbValues = rgbaString.substring(5, rgbaString.lastIndexOf(','));
    const rgbArray = rgbValues.split(',').map(parseFloat);
    return rgbArray;
  } else {
    return null;
  }
}

function SmallMultiplesLayout(props: ISmallMultiplesLayoutProps) {
  const { ref, inView } = useInView({
    threshold: 1,
  });

  const settings = props.smallMultiplesSettings;
  const backgroundSettings = settings.background;
  const borderSettings = settings.border;
  const shadowSettings = settings.shadow;

  const getItemBackgroundColor = (layout: ILayoutItemProps) => {
    const [r1, g1, b1] = getRGBFromRGBA(backgroundSettings.panelColor);
    const [r2, g2, b2] = getRGBFromRGBA(backgroundSettings.alternateColor);

    const panelColor = `rgba(${r1}, ${g1}, ${b1}, ${backgroundSettings.transparency / 100})`;
    const alternateColor = `rgba(${r2}, ${g2}, ${b2}, ${backgroundSettings.transparency / 100})`;

    switch (settings.background.type) {
      case ESmallMultiplesBackgroundType.All:
        return panelColor;
      case ESmallMultiplesBackgroundType.AlternateItem:
        if (layout.x % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
      case ESmallMultiplesBackgroundType.AlternateRows:
        if (layout.y % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
      case ESmallMultiplesBackgroundType.AlternateColumns:
        if (layout.x % 2 === 0) {
          return panelColor;
        } else {
          return alternateColor;
        }
    }
  };

  const getBoxShadow = () => {
    const {
      isEnabled = false,
      offset = "outside",
      position = "center",
      size = 0,
      blur = 0,
      angle = 4,
      distance = 3,
      color = "rgba(0,0,0,0.15)",
    } = shadowSettings;

    if (!isEnabled) return "unset";

    let value = "";
    const outset = offset === "outside";
    if (position === ESmallMultiplesShadowPosition.BottomRight)
      value = outset ? "4px 4px 8.5px 1.5px" : "-4px -4px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.Bottom)
      value = outset ? "0px 6px 8.5px 1.5px" : "0px -6px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.BottomLeft)
      value = outset ? "-4px 4px 8.5px 1.5px" : "4px -4px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.Right)
      value = outset ? "6px 0px 8.5px 1.5px" : "-6px 0px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.Center)
      value = outset ? "0px 0px 15px 3px" : "0px 0px 20px 0px inset";
    if (position === ESmallMultiplesShadowPosition.Left)
      value = outset ? "-6px 0px 8.5px 1.5px" : "6px 0px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.TopRight)
      value = outset ? "4px -4px 8.5px 1.5px" : "-4px 4px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.Top)
      value = outset ? "0px -6px 8.5px 1.5px" : "0px 6px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.TopLeft)
      value = outset ? "-4px -4px 8.5px 1.5px" : "4px 4px 8.5px 1.5px inset";
    if (position === ESmallMultiplesShadowPosition.Custom) {
      const ang = ((180 - angle) * 3.14) / 180; //convert to radians.
      const offsetY = Math.round(Math.sin(ang) * distance);
      const offsetX = Math.round(Math.cos(ang) * distance);
      const spreadRadius = (size * (100 - blur)) / 100;
      const blurRadius = size - spreadRadius;

      value = `${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px${outset ? "" : " inset"}`;
    }

    return `${color} ${value}`;
  };

  function generateDOM() {

    return props.layouts.map((d, i) => {
      return (
        <div ref={ref} key={d.i}>
          <InView
            id={d.i}
            data-id={i}
            data-chart-loaded={false}
            data-visibility={inView}
            as="div"
            className="small-multiple-chart-wrapper"
            style={{
              backgroundColor: getItemBackgroundColor(d),
              borderStyle: borderSettings.isShowBorder ? borderSettings.style : "none",
              borderWidth: borderSettings.isShowBorder ? borderSettings.width : 0,
              borderColor: borderSettings.color,
              borderRadius: borderSettings.isShowBorder ? borderSettings.radius : 0,
              boxSizing: "border-box",
              boxShadow: shadowSettings.isEnabled ? getBoxShadow() : null,
              padding: `${props.containerPadding[1]}px ${props.containerPadding[0]}px`,
              height: '100%'
            }}
            onChange={(inView, entry) => {
              entry.target.setAttribute("data-visibility", String(inView));
              if (inView) {
                props.onCellRendered(d.category, i, d.y, d.x, entry.target as HTMLDivElement);
              }

              if (settings.categories[settings.categories.length - 1] === d.category) {
                props.onRenderingFinished();
              }
            }}
          ></InView>
        </div>
      );
    });
  }

  return (
    <ReactGridLayoutProvider
      width={props.width}
      cols={props.cols}
      className={props.className}
      rowHeight={props.rowHeight}
      layout={props.layouts}
      measureBeforeMount={props.measureBeforeMount}
      compactType={props.compactType}
      margin={props.margin}
    >
      {generateDOM()}
    </ReactGridLayoutProvider>
  );
}

export default SmallMultiplesLayout;
