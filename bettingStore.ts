import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OutcomeType, Outcome } from "@/lib/chain/config";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TxRecord {
  hash: `0x${string}`;
  type: "approve" | "bet" | "claim" | "create";
  marketId?: number;
  outcome?: OutcomeType;
  amount?: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

export interface BetDraft {
  marketId: number | null;
  outcome: OutcomeType;
  amountStr: string;
}

interface BettingStore {
  // Active bet panel
  draft: BetDraft;
  setDraft: (patch: Partial<BetDraft>) => void;
  resetDraft: () => void;

  // Tx history (persisted)
  txHistory: TxRecord[];
  addTx: (tx: TxRecord) => void;
  updateTxStatus: (hash: `0x${string}`, status: TxRecord["status"]) => void;

  // UI flags
  isBetModalOpen: boolean;
  openBetModal: (marketId: number) => void;
  closeBetModal: () => void;

  isClaimModalOpen: boolean;
  claimMarketId: number | null;
  openClaimModal: (marketId: number) => void;
  closeClaimModal: () => void;

  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const DEFAULT_DRAFT: BetDraft = {
  marketId: null,
  outcome: Outcome.YES,
  amountStr: "",
};

export const useBettingStore = create<BettingStore>()(
  persist(
    (set) => ({
      draft: DEFAULT_DRAFT,
      setDraft: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch } })),
      resetDraft: () => set({ draft: DEFAULT_DRAFT }),

      txHistory: [],
      addTx: (tx) =>
        set((s) => ({ txHistory: [tx, ...s.txHistory].slice(0, 50) })),
      updateTxStatus: (hash, status) =>
        set((s) => ({
          txHistory: s.txHistory.map((t) =>
            t.hash === hash ? { ...t, status } : t
          ),
        })),

      isBetModalOpen: false,
      openBetModal: (marketId) =>
        set({
          isBetModalOpen: true,
          draft: { ...DEFAULT_DRAFT, marketId },
        }),
      closeBetModal: () =>
        set({ isBetModalOpen: false, draft: DEFAULT_DRAFT }),

      isClaimModalOpen: false,
      claimMarketId: null,
      openClaimModal: (marketId) =>
        set({ isClaimModalOpen: true, claimMarketId: marketId }),
      closeClaimModal: () =>
        set({ isClaimModalOpen: false, claimMarketId: null }),

      isCreateModalOpen: false,
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),
    }),
    {
      name: "arcpredict-betting",
      partialize: (s) => ({ txHistory: s.txHistory }),
    }
  )
);
