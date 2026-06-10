import { create } from "zustand";

interface UserStore {
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
}

const useUserStore = create<UserStore>((set) => ({
  isAdmin: false,
  setAdmin: (isAdmin) => set({ isAdmin }),
}));

export default useUserStore;
