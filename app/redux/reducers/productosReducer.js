import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getProductos",
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

export const obtenerProductoAsync = createAsyncThunk(
  "productos/obtener",
  async () => {
    const response = await api.get(`productos/${endpoints.obtener}`);
    return response.data.filter((e) => e.estado);
  }
);

export const productosReducer = createSlice({
  name: "productos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerProductoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerProductoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerProductoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialProductos = (state) => state.productos.value;
export const estadoProceso = (state) => state.productos.estado;

export default productosReducer.reducer;
