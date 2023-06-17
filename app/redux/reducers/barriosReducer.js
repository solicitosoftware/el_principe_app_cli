import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getBarrios",
};

const initialState = {
  value: [],
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const api = axios.create({
  baseURL: RUTA_FUNCTIONS,
});

export const obtenerBarrioAsync = createAsyncThunk(
  "barrios/obtener",
  async () => {
    const response = await api.get(`barrios/${endpoints.obtener}`);
    return response.data;
  }
);

export const barriosReducer = createSlice({
  name: "barrios",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerBarrioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerBarrioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerBarrioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialBarrios = (state) => state.barrios.value;
export const estadoProceso = (state) => state.barrios.estado;

export default barriosReducer.reducer;
