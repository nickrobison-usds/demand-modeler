import pptxgen from "pptxgenjs";
import * as style from "../../../Styles";

export const addTitleSlide = (
  ppt: pptxgen,
  title: string,
  subtitle: string,
  footer1: string,
  footer2: string
) => {
  const titleSlide = ppt.addSlide();
  titleSlide.addText(title, {
    fontFace: style.TITLE_FONT_FACE,
    bold: true,
    color: ppt.SchemeColor.text2,
    x: 1.8,
    y: 2.26,
    fontSize: 40,
    h: 0.38,
    w: 8.2
  });
  titleSlide.addText(subtitle, {
    fontSize: 20,
    x: 1.8,
    y: 3.2
  });
  titleSlide.addShape(ppt.ShapeType.line, {
    color: "#FF0000",
    height: 3.17,
    width: 0.03,
    rotate: 45,
    x: 0.31,
    y: 1.25,
    h: 2.84,
    w: 2.85
  });
  titleSlide.addText(footer1, {
    fontFace: style.BODY_FONT_FACE,
    italics: true,
    color: ppt.SchemeColor.text2,
    x: 1.8,
    y: 4.22,
    fontSize: 11,
    h: 0.38,
    w: 8.2
  });
  titleSlide.addText(footer2, {
    fontFace: style.BODY_FONT_FACE,
    italics: true,
    color: ppt.SchemeColor.text2,
    x: 1.8,
    y: 4.4,
    fontSize: 11,
    h: 0.38,
    w: 8.2
  });
};
