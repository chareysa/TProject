import React from "react";

interface Props {
  className?: string;
  title?: string;
  text?: string;
  target?: string;
}

const CommunityGridCard: React.FC<Props> = ({
  className,
  title,
  text,
  target,
}: Props) => {
  return (
    <div className={`col-span-1 bg-neutral-50 ${className}`}>
      <div className="flex w-full h-full space-x-6 p-6">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-2xl font-aktiv font-semibold text-neutral-900">{title}</h2>
            <p className="text-lg text-neutral-500 pb-3">{text}</p>
          </div>
          <div>
            {target && (
              <a
                href={"https://" + target}
                target={target && "_blank"}
                className="text-lg font-medium text-tolo-green"
              >
                {target}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGridCard;