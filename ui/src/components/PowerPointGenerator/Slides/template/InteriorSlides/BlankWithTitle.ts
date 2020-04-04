import pptxgen from "pptxgenjs";
import * as style from "../../../Styles";

export const addBlankSlideWithTitle = (ppt: pptxgen, title: string): pptxgen.ISlide => {
  return ppt
    .addSlide()
    .addText(title.toUpperCase(), {
      fontFace: style.TITLE_FONT_FACE,
      color: style.TEXT_COLOR,
      charSpacing: 2,
      fontSize: 16,
      x: 0,
      y: 0.3,
      w: "100%",
      align: "center"
    })
    .addShape(ppt.ShapeType.line, {
      x: 3.75,
      y: 0.75,
      w: 2.5,
      h: 0.0,
      line: style.AXIS_COLOR,
      lineSize: 1.5
    });
};