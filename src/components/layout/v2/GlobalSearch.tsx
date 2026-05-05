import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Users, Briefcase, FileText, CheckSquare, History, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axiosClient";
import { useDebounce } from "@/hooks/useDebounce";
import type { ApiEnvelope } from "@/types/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: "delegation" | "partner" | "file" | "task";
  url: string;
}

interface SearchResponse {
  delegations: SearchResult[];
  partners: SearchResult[];
  files: SearchResult[];
  tasks: SearchResult[];
  query: string;
  total: number;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosClient.get<ApiEnvelope<SearchResponse>>("/api/v1/search", {
          params: { q: debouncedQuery },
        });
        const data = response.data;
        setResults(data);
        
        // Add to recent searches if there are results
        if (data.total > 0) {
          updateRecentSearches(debouncedQuery);
        }
      } catch (error) {
        console.error("Global search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const updateRecentSearches = (q: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== q);
      const updated = [q, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelect = (url: string) => {
    navigate(url);
    setOpen(false);
    setQuery("");
  };

  const renderCategory = (title: string, items: SearchResult[], icon: React.ReactNode) => {
    if (items.length === 0) return null;

    return (
      <div className="p-2">
        <div className="mb-1 flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
          {icon}
          {title}
        </div>
        {items.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => handleSelect(item.url)}
            className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-brand-dark/5"
          >
            <span className="text-sm font-bold text-brand-text-dark">{item.title}</span>
            <span className="text-[10px] text-brand-text-dark/40">{item.subtitle}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative hidden w-72 items-center md:flex lg:w-96">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" size={16} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm hồ sơ, nhân sự, nhiệm vụ..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 text-xs font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 md:w-[400px]"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-primary/40" size={16} />
            )}
            {!loading && query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-dark/40 hover:text-brand-text-dark"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl border-brand-dark/10 p-0 shadow-2xl" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[70vh] overflow-y-auto bg-white/80 backdrop-blur-xl">
            {loading && !results && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="mb-3 size-8 animate-spin text-primary" />
                <p className="text-xs font-medium text-brand-text-dark/60">Đang tìm kiếm...</p>
              </div>
            )}

            {!loading && !results && query.length < 2 && (
              <>
                {recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="mb-1 flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-text-dark/40">
                      <History size={12} />
                      Tìm kiếm gần đây
                    </div>
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-text-dark transition-colors hover:bg-brand-dark/5"
                      >
                        <Search size={14} className="text-brand-text-dark/20" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="p-6 text-center">
                  <p className="text-xs font-medium text-brand-text-dark/40">Nhập từ khóa để tìm kiếm</p>
                </div>
              </>
            )}

            {results && results.total === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-dark/[0.02]">
                  <Search className="text-brand-text-dark/20" size={24} />
                </div>
                <p className="text-sm font-bold text-brand-text-dark">Không tìm thấy kết quả</p>
                <p className="mt-1 text-xs text-brand-text-dark/40">Thử lại với từ khóa khác</p>
              </div>
            )}

            {results && results.total > 0 && (
              <div className="divide-y divide-brand-dark/5">
                {renderCategory("Đoàn công tác", results.delegations, <Briefcase size={12} />)}
                {renderCategory("Đối tác", results.partners, <Users size={12} />)}
                {renderCategory("Tài liệu", results.files, <FileText size={12} />)}
                {renderCategory("Công việc", results.tasks, <CheckSquare size={12} />)}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
