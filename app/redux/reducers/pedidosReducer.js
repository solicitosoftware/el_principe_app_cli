import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";

const endpoints = {
  crear: "api/createPedido",
  cancelar: "api/cancelPedido",
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

export const crearPedidoAsync = createAsyncThunk(
  "pedidos/crear",
  async (data) => {
    const response = await api.post(`pedidos/${endpoints.crear}`, { data });
    const id = response.data._path.segments[1];
    return id;
  }
);

export const cancelarPedidoAsync = createAsyncThunk(
  "pedidos/cancelar",
  async (data) => {
    debugger;
    const response = await api.put(`pedidos/${endpoints.cancelar}/${data.id}`, {
      ...data,
    });
    debugger;
    return { ...data, movimiento: response.data._writeTime };
  }
);

export const pedidosReducer = createSlice({
  name: "pedidos",
  initialState,
  reducers: {
    setPedidos: (state, action) => {
      state.value = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(crearPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value.push({ ...action.payload });
      })
      .addCase(crearPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(cancelarPedidoAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(cancelarPedidoAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro cancelado",
          error: false,
        };
        const index = state.value.findIndex(
          (item) => item.id === action.payload.id
        );
        state.value[index] = action.payload;
      })
      .addCase(cancelarPedidoAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const { setPedidos } = pedidosReducer.actions;

export const initialPedidos = (state) => state.pedidos.value;
export const estadoProceso = (state) => state.pedidos.estado;

export default pedidosReducer.reducer;
