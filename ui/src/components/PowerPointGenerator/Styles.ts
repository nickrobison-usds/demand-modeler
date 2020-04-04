export const TEXT_COLOR = "0A2644";

export const TITLE_FONT_FACE = "Merriweather";
export const BODY_FONT_FACE = "Source Sans Pro";

export const AXIS_COLOR = "EEEEEE";

export const getConfirmedColors = (length: number): string[] => {
  switch (length) {
    default:
    case 6:
      return [
        "160004",
        "52000F",
        "910A0A",
        "B8051A",
        "DE0029",
        "EF8094"
      ].reverse();
    case 5:
      return ["160004", "52000F", "910A0A", "DE0029", "EF8094"].reverse();
    case 3:
      return ["DE0029", "910A0A", "52000F"];
    case 2:
      return ["DE0029", "910A0A"];
    case 1:
      return ["910A0A"];
  }
};

export const getDeadColors = (length: number): string[] => {
  switch (length) {
    default:
    case 6:
      return [
        "032E41",
        "285266",
        "4D768A",
        "729BAF",
        "97BFD3",
        "DEF1FC"
      ].reverse();
    case 5:
      return ["032E41", "315B6F", "60899D", "8EB6CA", "BCE3F8"].reverse();
    case 3:
      return ["BCE3F8", "33689A", "032E41"];
    case 2:
      return ["BCE3F8", "33689A"];
    case 1:
      return ["33689A"];
  }
};
