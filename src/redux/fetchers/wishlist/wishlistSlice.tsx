import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

export interface WishlistItem {
  id: string;
  name: string;
  location: string;
  image: string;
  pricePerNight: number;
  rating: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.push(action.payload);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;

export const useWishlistItems = (): WishlistItem[] =>
  useSelector((state: RootState) => state.wishlist.items);

export const useIsWishlisted = (id: string): boolean =>
  useSelector((state: RootState) =>
    state.wishlist.items.some((i) => i.id === id)
  );

export const useWishlistCount = (): number =>
  useSelector((state: RootState) => state.wishlist.items.length);
