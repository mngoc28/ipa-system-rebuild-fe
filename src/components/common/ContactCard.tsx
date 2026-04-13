import * as React from "react";
import { Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactCardProps } from "../type";

const ContactCard: React.FC<ContactCardProps> = ({
  name,
  role,
  email,
  phone,
  avatar,
  className,
}) => {
  return (
    <div className={cn("flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6" />
        )}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div>
          <h4 className="truncate text-sm font-semibold text-slate-800">{name}</h4>
          {role && <p className="truncate text-xs text-slate-500">{role}</p>}
        </div>
        <div className="space-y-1">
          {email && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="h-3 w-3" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone className="h-3 w-3" />
              <span className="truncate">{phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
