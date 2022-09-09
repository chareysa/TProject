import React from "react";
import Underline1Svg from "../assets/tolocar_underline_1.svg";
import Underline2Svg from "../assets/tolocar_underline_2.svg";
import Underline3Svg from "../assets/tolocar_underline_3.svg";

interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: number;
  large?: boolean;
  light?: boolean;
  id?: string;
}

const underlineSvgAndClassesMapping = [
  { src: Underline1Svg, classes: "-bottom-3" },
  { src: Underline2Svg, classes: "-bottom-3" },
  { src: Underline3Svg, classes: "bottom-0" },
];

const HeadlineUnderlined: React.FC<Props> = ({
  children,
  className,
  variant = 1,
  large,
  light,
  id,
}: Props) => {
  return (
    <div className={`${className || ""}`}>
      <h2
        id={id}
        className={`${
          light ? "text-white" : "text-tolo-black"
        } relative z-10 font-bold leading-7 ${large ? "text-5xl" : "text-2xl"}`}
      >
        <img
          className={`-z-10 absolute ${
            underlineSvgAndClassesMapping[variant - 1].classes
          }`}
          src={underlineSvgAndClassesMapping[variant - 1].src}
        />
        {children}
      </h2>
    </div>
  );
};

export default HeadlineUnderlined;
