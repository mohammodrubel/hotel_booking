import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

export interface CartItem {
  id: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  image: string;
  pricePerNight: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (!exists) state.items.push(action.payload);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateNights: (
      state,
      action: PayloadAction<{ id: string; nights: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.nights = Math.max(1, action.payload.nights);
    },
    updateGuests: (
      state,
      action: PayloadAction<{ id: string; guests: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.guests = Math.max(1, action.payload.guests);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateNights,
  updateGuests,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

export const useCartItems = (): CartItem[] =>
  useSelector((state: RootState) => state.cart.items);

export const useCartTotal = (): number =>
  useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.pricePerNight * i.nights, 0)
  );

export const useCartCount = (): number =>
  useSelector((state: RootState) => state.cart.items.length);
