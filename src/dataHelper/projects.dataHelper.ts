/**
 * Helper utilities for processing and formatting project-related data.
 */
export const projectDataHelper = {
  /**
   * Formats a numeric value as Vietnamese Dong (VND).
   * @param value - The number to format.
   * @returns Formatted currency string.
   */
  formatVND: (value: number | undefined | null) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },

  /**
   * Normalizes various API stage ID formats into a standard set of keys.
   * Handles both specific master data codes and descriptive strings.
   * @param stageId - The raw stage ID from the API.
   * @returns A normalized stage key (e.g., 'lead', 'contacted').
   */
  normalizeStageId: (stageId: string) => {
    const normalized = stageId.toLowerCase();

    if (normalized === "ipa_md_pipeline_stage_code" || normalized.endsWith("_1")) {
      return "lead";
    }

    if (normalized === "ipa_md_pipeline_stage_code_2" || normalized.endsWith("_2")) {
      return "contacted";
    }

    if (normalized === "ipa_md_pipeline_stage_code_3" || normalized.endsWith("_3")) {
      return "proposal";
    }

    if (normalized === "ipa_md_pipeline_stage_code_4" || normalized.endsWith("_4")) {
      return "negotiation";
    }

    if (normalized === "ipa_md_pipeline_stage_code_5" || normalized.endsWith("_5")) {
      return "closed-won";
    }

    if (normalized === "ipa_md_pipeline_stage_code_6" || normalized.endsWith("_6")) {
      return "closed-lost";
    }

    if (normalized.includes("closed_won") || normalized.includes("closed-won") || normalized.includes("won")) {
      return "closed-won";
    }

    if (normalized.includes("closed_lost") || normalized.includes("closed-lost") || normalized.includes("lost")) {
      return "closed-lost";
    }

    if (normalized.includes("lead") || normalized.endsWith("_1")) {
      return "lead";
    }

    if (normalized.includes("contacted") || normalized.endsWith("_2")) {
      return "contacted";
    }

    if (normalized.includes("proposal") || normalized.endsWith("_3")) {
      return "proposal";
    }

    if (normalized.includes("negotiation") || normalized.endsWith("_4")) {
      return "negotiation";
    }

    return normalized;
  },

  /**
   * Gets a human-readable label for a given project stage.
   * @param stageId - The raw or normalized stage ID.
   * @returns A localized (Vietnamese) label for the stage.
   */
  getStageLabel: (stageId: string) => {
    const normalizedStageId = projectDataHelper.normalizeStageId(stageId);
    const stages: Record<string, string> = {
      lead: "Tiềm năng",
      contacted: "Đã liên hệ",
      proposal: "Đang đề xuất",
      negotiation: "Đang đàm phán",
      "closed-won": "Thành công",
      "closed-lost": "Thất bại",
    };
    return stages[normalizedStageId] || stageId;
  },

  /**
   * Returns a Tailwind CSS background color class based on the project stage.
   * @param stageId - The raw or normalized stage ID.
   * @returns A Tailwind background color class.
   */
  getStageColor: (stageId: string) => {
    const normalizedStageId = projectDataHelper.normalizeStageId(stageId);
    const colors: Record<string, string> = {
      lead: "bg-primary/60",
      contacted: "bg-primary/80",
      proposal: "bg-primary",
      negotiation: "bg-primary-500",
      "closed-won": "bg-emerald-600",
      "closed-lost": "bg-slate-500",
    };
    return colors[normalizedStageId] || "bg-slate-400";
  },

  /**
   * Calculates statistics for each stage in the sales/investment funnel.
   * @param projects - List of project objects containing stage and value info.
   * @returns Array of statistics objects for each funnel stage.
   */
  calculateFunnelStats: (projects: Array<{ stage_id: string; estimated_value?: number | string | null }>) => {
    const stages = ["lead", "contacted", "proposal", "negotiation"];
    return stages.map((s) => {
      const matches = projects.filter((p) => projectDataHelper.normalizeStageId(p.stage_id) === s);
      const totalValue = matches.reduce((sum, p) => sum + Number(p.estimated_value || 0), 0);
      return {
        id: s,
        title: projectDataHelper.getStageLabel(s),
        count: matches.length,
        value: projectDataHelper.formatVND(totalValue),
        color: projectDataHelper.getStageColor(s),
      };
    });
  },
};
