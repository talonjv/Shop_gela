
import { createSlice } from "@reduxjs/toolkit";
const storedUser = JSON.parse(localStorage.getItem("userData"));

const initialState = {
  user: storedUser || {  // Nếu có dữ liệu userData trong localStorage thì dùng, nếu không thì dùng mặc định
    customerId: null, 
    name: "",
    avatar: "",
    email: "",
    phone: "",
    gender: "male",
    address: "",
    district: "",
    role: null,
  },
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      // payload: { customerId, name, avatar, role }
      state.user.customerId = action.payload.customerId;
      state.user.name = action.payload.name || "";
      state.user.avatar = action.payload.avatar || "";
      state.user.role = action.payload.role ?? null;
       localStorage.setItem("userData", JSON.stringify(state.user));
    },
    clearUser(state) {
      state.user = { ...initialState.user };
    },
    logout(state) {
  state.user = {
    customerId: null,
    name: "",
    avatar: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    district: "",
    role: null,
  };
  localStorage.removeItem("userData");
},

  },
});

export const { setUser, clearUser, logout } = userSlice.actions;
export default userSlice.reducer;



