import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  obtener: "api/getMunicipios",
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

export const obtenerMunicipioAsync = createAsyncThunk(
  "municipios/obtener",
  async () => {
    const response = await api.get(`municipios/${endpoints.obtener}`);
    return response.data;
  }
);

export const municipiosReducer = createSlice({
  name: "municipios",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerMunicipioAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerMunicipioAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerMunicipioAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialMunicipios = (state) => state.municipios.value;
export const estadoProceso = (state) => state.municipios.estado;

export default municipiosReducer.reducer;
