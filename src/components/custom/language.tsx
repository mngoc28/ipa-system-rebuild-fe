import * as React from "react";
import { ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";
import useLanguage from "@/store/useLanguage";
import { useTranslation } from "react-i18next";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";

const LanguageOptions: string[] = ["en", "jp", "vi"];

const Language = forwardRef<HTMLDivElement, ComponentProps<"div">>(({ className, ...props }, ref) => {
  const { lang, setLanguage } = useLanguage();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <div
      className={cn(
        `flex h-9 w-fit bg-transparent text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
        className,
      )}
      ref={ref}
      {...props}
    >
      <Select value={lang} onValueChange={handleLanguageChange}>
        <div className="flex w-fit items-center justify-center">
          <SelectTrigger className="flex h-auto border-none px-2 shadow-none hover:bg-slate-100">
            <SelectValue>
              <div className="flex flex-row items-center justify-center">
                <img src={`/app/images/front/flag-${lang}.svg`} alt={lang} className="w-6 shadow-sm lg:w-8" />
                <span className="ms-2 hidden text-nowrap font-bold lg:inline">{t(`lang-${lang}`)}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-[150px]">
            <SelectGroup>
              {LanguageOptions.map((l) => (
                <SelectItem value={l} key={l} className="cursor-pointer">
                  <div className="flex w-full flex-row items-center py-1">
                    <img src={`/app/images/front/flag-${l}.svg`} alt={l} className="mr-2 w-6 shadow-sm" />
                    <span className="text-nowrap">{t(`lang-${l}`)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </div>
      </Select>
    </div>
  );
});

Language.displayName = "Language";

export { Language };
