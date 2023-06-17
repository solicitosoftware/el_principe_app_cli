import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
  cambios: 0,
};

export const notificacionReducer = createSlice({
  name: "notificacion",
  initialState,
  reducers: {
    addNotify: (state, action) => {
      state.value.push({ ...action.payload });
    },
    updateNotify: (state, action) => {
      const index = state.value.findIndex(
        (item) => item.id === action.payload.id
      );
      state.value[index] = action.payload;
    },
    setCambios: (state, action) => {
      state.cambios = action.payload;
    },
    deleteCambios: (state) => {
      state.cambios = initialState.cambios;
    },
  },
});

export const { addNotify, updateNotify, setCambios, deleteCambios } =
  notificacionReducer.actions;

export const initialNotificaciones = (state) => state.notificacion.value;
export const initialCambios = (state) => state.notificacion.cambios;

export default notificacionReducer.reducer;
