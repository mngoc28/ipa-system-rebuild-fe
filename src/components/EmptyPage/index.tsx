import * as React from "react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import { EmptyPageProps } from "../type";

const EmptyPage: FC<EmptyPageProps> = ({ 
  title = "common.empty_title", 
  description = "common.empty_description", 
  icon = <XCircle className="size-10 text-slate-300" />,
  action 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center transition-all hover:bg-slate-50">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800">{t(title)}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500">{t(description)}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyPage;
