import * as React from "react";
import { FC } from "react";
import { Atom, Commet, ThreeDot } from "react-loading-indicators";
import { LoadingProps } from "../type";

export const LoadingAtom: FC<LoadingProps> = ({ color = "#064F80", size = "medium" }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Atom color={color} size={size} text="" textColor="" />
      </div>
    </div>
  );
};

export const LoadingThreeDot: FC<LoadingProps> = ({ color = "#064F80", size = "medium" }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ThreeDot variant="bounce" color={color} size={size} text="" textColor="" />
      </div>
    </div>
  );
};

export const LoadingCommet: FC<LoadingProps> = ({ color = "#064F80", size = "medium" }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Commet color={color} size={size} text="" textColor="" />
      </div>
    </div>
  );
};
