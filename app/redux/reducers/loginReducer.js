import { createSlice } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";

const initialState = {
  value: {},
};

export const loginReducer = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: () => {
      auth().signOut();
    },
    setLogin: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { logout, setLogin } = loginReducer.actions;

export const initialLogin = (state) => state.login.value;

export default loginReducer.reducer;
