import * as React from "react";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

/**
 * Props for the SyllabusCard component.
 */
interface SyllabusCardProps {
  /** Unique identifier for the syllabus/course. */
  id: string;
  /** Display title for the card. */
  title: string;
  /** Whether the card is currently pinned to the top of the list. */
  isPinned: boolean;
  /** Completion percentage (0-100). */
  progress: number;
  /** Additional styling classes. */
  className?: string;
  /** Callback triggered when the pin status is toggled. */
  onTogglePin: (id: string, isPinned: boolean) => void;
}

/**
 * A horizontal card component displaying course summary information, 
 * including a progress bar, pin status, and a link to detailed views.
 * 
 * @param props - Component props following SyllabusCardProps interface.
 */
const SyllabusCard = ({
  id,
  title,
  isPinned,
  progress,
  className,
  onTogglePin,
}: SyllabusCardProps) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/course/${id}`);
  };

  const handleTogglePin = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onTogglePin(id, !isPinned);
  };

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-slate-500 bg-slate-50 p-6 px-10",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {isPinned && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-500"
            >
              <path
                d="M10.6667 8.66667V3.33333C10.6667 2.97971 10.5262 2.64057 10.2762 2.39052C10.0261 2.14048 9.68696 2 9.33333 2H6.66667C6.31304 2 5.97391 2.14048 5.72386 2.39052C5.47381 2.64057 5.33333 2.97971 5.33333 3.33333V8.66667L3.33333 10.6667V12H12.6667V10.6667L10.6667 8.66667Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-8">
          <button
            className={cn(
              "flex items-center gap-1 text-base",
              isPinned ? "text-blue-500" : "text-slate-900 hover:text-blue-500"
            )}
            onClick={handleTogglePin}
            aria-label={isPinned ? "Unpin" : "Pin to top"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.6667 8.66667V3.33333C10.6667 2.97971 10.5262 2.64057 10.2762 2.39052C10.0261 2.14048 9.68696 2 9.33333 2H6.66667C6.31304 2 5.97391 2.14048 5.72386 2.39052C5.47381 2.64057 5.33333 2.97971 5.33333 3.33333V8.66667L3.33333 10.6667V12H12.6667V10.6667L10.6667 8.66667Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isPinned ? "Unpin" : "Pin to top"}</span>
          </button>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-32 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        className="rounded-md bg-blue-500 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-blue-600"
        onClick={handleDetailsClick}
      >
        Details
      </button>
    </div>
  );
};

export default SyllabusCard;
