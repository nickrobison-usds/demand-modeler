import pptxgen from "pptxgenjs";
import * as style from "../../style";

export const titleSlide = (ppt: pptxgen, title: string): pptxgen.ISlide => {
    return ppt
      .addSlide()
      .addText(title.toUpperCase(), style.titleConf())
      .addShape(ppt.ShapeType.line, {
        x: 3.75,
        y: 0.75,
        w: 2.5,
        h: 0.0,
        line: style.AXIS_COLOR,
        lineSize: 1.5,
      });
  };