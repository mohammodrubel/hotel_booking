
import { DecodedUser } from "@/lib/jwtDecoder";
import { RootState } from "@/redux/store";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

interface AuthState {
  token: string | null;
  user: null | DecodedUser;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const useAuthToken = (): string | null => {
  return useSelector((state: RootState) => state.auth.token);
};

export const useAuthUser = (): DecodedUser | null => {
  return useSelector((state: RootState) => state.auth.user);
};