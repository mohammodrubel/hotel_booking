import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  getHotel as getMockHotel,
  getRoom as getMockRoom,
  hotels as mockHotels,
} from "@/lib/mockData";
import type { Hotel, Room } from "@/lib/mockData";

interface HotelsState {
  custom: Hotel[];
}

const initialState: HotelsState = {
  custom: [],
};

const hotelsSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    addHotel: (state, action: PayloadAction<Hotel>) => {
      const exists = state.custom.find((h) => h.id === action.payload.id);
      if (exists) return;
      state.custom.unshift(action.payload);
    },
    updateHotel: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Hotel> }>
    ) => {
      const h = state.custom.find((h) => h.id === action.payload.id);
      if (h) Object.assign(h, action.payload.patch);
    },
    removeHotel: (state, action: PayloadAction<string>) => {
      state.custom = state.custom.filter((h) => h.id !== action.payload);
    },
    clearCustomHotels: (state) => {
      state.custom = [];
    },
  },
});

export const { addHotel, updateHotel, removeHotel, clearCustomHotels } =
  hotelsSlice.actions;

export default hotelsSlice.reducer;

export const useCustomHotels = (): Hotel[] =>
  useSelector((state: RootState) => state.hotels.custom);

export const useAllHotels = (): Hotel[] => {
  const custom = useCustomHotels();
  return [...custom, ...mockHotels];
};

export const useHotelById = (id: string): Hotel | undefined => {
  const custom = useCustomHotels();
  return custom.find((h) => h.id === id) ?? getMockHotel(id);
};

export const useGetRoom = (
  roomId: string
): { hotel: Hotel; room: Room } | null => {
  const custom = useCustomHotels();
  for (const h of custom) {
    const r = h.rooms.find((rr) => rr.id === roomId);
    if (r) return { hotel: h, room: r };
  }
  return getMockRoom(roomId);
};
