import { create } from "zustand";

export const useCartItemCountStore = create((set) => ({
    refreshCart: false,
    toggleRefreshCart: () =>
        set((state) => ({
            refreshCart: !state.refreshCart,
        })),
}));

export const useCartItemSelectionStore = create((set) => ({
    selectedIds: [],

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    toggleSelectionId: (id) =>
        set((state) => {
            const exists = state.selectedIds.includes(id);

            return {
                selectedIds: exists
                    ? state.selectedIds.filter(i => i !== id)
                    : [...state.selectedIds, id]
            };
        }),

    clearSelectedIds: () => set({ selectedIds: [] }),
}));

export const useCheckoutCartItemStore = create((set) => ({
    checkoutItems: [],

    setCheckoutItems: (items) =>
        set({
            checkoutItems: items,
        }),

    clearCheckoutItems: () =>
        set({
            checkoutItems: [],
        }),
}));