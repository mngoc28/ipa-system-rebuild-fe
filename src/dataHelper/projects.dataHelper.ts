export const projectDataHelper = {
  formatVND: (value: number | undefined | null) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },

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

  getStageColor: (stageId: string) => {
    const normalizedStageId = projectDataHelper.normalizeStageId(stageId);
    const colors: Record<string, string> = {
      lead: "bg-blue-600",
      contacted: "bg-indigo-600",
      proposal: "bg-violet-600",
      negotiation: "bg-emerald-600",
      "closed-won": "bg-rose-600",
      "closed-lost": "bg-slate-600",
    };
    return colors[normalizedStageId] || "bg-slate-400";
  },

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
