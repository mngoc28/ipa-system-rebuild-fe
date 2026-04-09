import { Link } from "react-router-dom";
import { HomeIcon, MapPinHouse, Users, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { RoomCarouselItemProps } from "../type";
import { getImageUrl } from "@/utils/image";
import { cn } from "@/utils/stringUtils";
import { useFormattedText } from "@/hooks/useFormattedText";

const RoomCarouselItem = ({ room }: RoomCarouselItemProps) => {
  const { t } = useTranslation();
  const { formatText } = useFormattedText();
  const occupantCount = Number(room.beds);
  const hasNumericOccupants = Number.isFinite(occupantCount);
  const imageSrc = getImageUrl(room.image);
  const containerClasses = cn(
    "group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
  );
  const titleClasses = "text-[0.85rem] font-semibold text-slate-900 group-hover:text-sky-600 line-clamp-2";

  return (
    <Link
      to={`${ROUTERS.ROOM_DETAIL_PUBLIC.replace(':id', String(room.id))}`}
      aria-label={t("public.home.rooms.cardLabel", { name: room.name })}
      className={containerClasses}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={imageSrc} alt={room.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute left-5 right-5 bottom-5 flex items-center justify-between text-xs text-white/90">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.3em]">
            <HomeIcon className="h-4 w-4" />
            {t("public.home.rooms.badge", { id: room.id })}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className={titleClasses}>{formatText(room.name)}</h3>
          <div className="mt-1 flex items-start gap-2 text-sm text-slate-600">
            <MapPinHouse className="h-4 w-4 flex-shrink-0 text-sky-500" />
            <span className="line-clamp-2 leading-relaxed">{formatText(room.address)}</span>
          </div>
        </div>
        <div className="mt-auto space-y-3">
          <span
            className="block text-sm font-semibold text-sky-600"
            title={t("public.home.rooms.price", { price: room.price })}
          >
            {t("public.home.rooms.price", { price: room.price })}
          </span>
          <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {hasNumericOccupants ? t("public.home.rooms.people", { count: occupantCount }) : room.beds}
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {t("public.home.rooms.area", { area: room.area })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCarouselItem;
