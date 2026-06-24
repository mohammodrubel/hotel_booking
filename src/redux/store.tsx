import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistConfig,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "./api/baseApi";

import authReducer from "./fetchers/auth/authSlice";
import cartReducer from "./fetchers/cart/cartSlice";
import wishlistReducer from "./fetchers/wishlist/wishlistSlice";
import hotelsReducer from "./fetchers/hotels/hotelsSlice";
import cmsReducer from "./fetchers/cms/cmsSlice";

// ==========================
// Persist Configs
// ==========================

const persistAuthConfig: PersistConfig<ReturnType<typeof authReducer>> = {
  key: "auth",
  storage,
};

const persistCartConfig: PersistConfig<ReturnType<typeof cartReducer>> = {
  key: "cart",
  storage,
};
const persistwishlistConfig: PersistConfig<ReturnType<typeof wishlistReducer>> =
  {
    key: "wishlist",
    storage,
  };
const persistHotelsConfig: PersistConfig<ReturnType<typeof hotelsReducer>> = {
  key: "hotels",
  storage,
};
const persistCmsConfig: PersistConfig<ReturnType<typeof cmsReducer>> = {
  key: "cms",
  storage,
};

// ==========================
// Persisted Reducers
// ==========================

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);

const persistedCartReducer = persistReducer(persistCartConfig, cartReducer);
const persistedWishlistReducer = persistReducer(
  persistwishlistConfig,
  wishlistReducer
);
const persistedHotelsReducer = persistReducer(
  persistHotelsConfig,
  hotelsReducer
);
const persistedCmsReducer = persistReducer(persistCmsConfig, cmsReducer);

// ==========================
// Store
// ==========================

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    cart: persistedCartReducer,
    wishlist: persistedWishlistReducer,
    hotels: persistedHotelsReducer,
    cms: persistedCmsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// ==========================
// Types
// ==========================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ==========================
// Persistor
// ==========================

export const persistor = persistStore(store);
