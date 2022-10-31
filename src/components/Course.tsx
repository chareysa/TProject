import React from "react";
import { ArrowSvg } from "@components";

interface Props {
  className?: string;
  course: {
    link: string;
    title: string;
    img: string;
    imgAlt?: string;
    items: { target: string; title: string }[] | null;
  };
}

const Course: React.FC<Props> = ({ className, course }) => {
  return (
    <div className={`border-b-[1px] border-black/10 ${className || ""}`}>
      <div className="relative">
        <a href={course.link}>
          <img
            src={course.img}
            alt={course.imgAlt}
            className="w-full h-full object-cover outline outline-offset-[-2px] outline-2 outline-black/15 aspect-[12/5]"
          />
        </a>
        <h2 className="absolute bottom-6 left-6 bg-black/80 leading-none text-white rounded-md px-2 py-[6px] text-[15px] font-bold uppercase">
          {course.title}
        </h2>
      </div>
      {course?.items && (
        <div className="flex flex-col gap-8 mt-8 mb-16">
          {course.items.map((item, index) => (
            <a href={item.target} key={index}>
              <h3 className="flex items-center text-2xl font-bold">
                {item.title}
                <ArrowSvg className="shrink-0 ml-4 text-tolo-green w-6 h-6" />
              </h3>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Course;
