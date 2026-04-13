import * as React from "react";
import { FC } from "react";
import IcomoonReact from "icomoon-react";
import iconSet from "@/assets/icomoon/selection.json";

interface IconProps {
  color?: string;
  size?: string | number;
  icon: string;
  className?: string;
}

const Icon: FC<IconProps> = (props) => {
  const { color, size = "100%", icon, className = "" } = props;
  return <IcomoonReact className={className} iconSet={iconSet as any} color={color} size={size} icon={icon} />;
};

export default Icon;
