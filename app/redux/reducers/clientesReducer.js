import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { RUTA_FUNCTIONS } from "../config";
import { CodeError } from "../errors";
import { logout } from "../reducers/loginReducer";

const endpoints = {
  obtener: "api/getCliente",
  crear: "api/createCliente",
  actualizar: "api/updateCliente",
  eliminar: "api/deleteCliente",
};

const initialState = {
  value: {},
  estado: {
    isLoading: false,
    success: false,
    error: false,
  },
};

const api = axios.create({
  baseURL: RUTA_FUNCTIONS,
});

export const obtenerClienteAsync = createAsyncThunk(
  "clientes/obtenerId",
  async (data) => {
    const response = await api.put(`clientes/${endpoints.obtener}/${data}`);
    return response.data;
  }
);

export const crearClienteAsync = createAsyncThunk(
  "clientes/crear",
  async (data) => {
    await api.post(`clientes/${endpoints.crear}/${data.id}`, { data });
    const cliente = { id: data.id, data };
    return cliente;
  }
);

export const actualizarClienteAsync = createAsyncThunk(
  "clientes/actualizar",
  async (data) => {
    await api.put(`clientes/${endpoints.actualizar}/${data.id}`, { ...data });
    const cliente = { id: data.id, data };
    return cliente;
  }
);

export const eliminarClienteAsync = createAsyncThunk(
  "clientes/eliminar",
  async (id, GetThunkAPI) => {
    await api.delete(`clientes/${endpoints.eliminar}/${id}`);
    return GetThunkAPI.dispatch(logout());
  }
);

export const clientesReducer = createSlice({
  name: "clientes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(obtenerClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(obtenerClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(obtenerClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(crearClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(crearClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Registro Exitoso",
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(crearClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(actualizarClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(actualizarClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro actualizado",
          error: false,
        };
        state.value = action.payload;
      })
      .addCase(actualizarClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      })

      .addCase(eliminarClienteAsync.pending, (state) => {
        state.estado = {
          isLoading: true,
          success: false,
          error: false,
        };
      })
      .addCase(eliminarClienteAsync.fulfilled, (state, action) => {
        state.estado = {
          isLoading: false,
          success: "Exito, registro eliminado",
          error: false,
        };
      })
      .addCase(eliminarClienteAsync.rejected, (state, action) => {
        state.estado = {
          isLoading: false,
          success: false,
          error: CodeError(action.error.code),
        };
      });
  },
});

export const initialClientes = (state) => state.clientes.value;
export const estadoProceso = (state) => state.clientes.estado;

export default clientesReducer.reducer;
