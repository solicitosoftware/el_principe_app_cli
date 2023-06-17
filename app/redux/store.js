import { combineReducers, configureStore } from "@reduxjs/toolkit";
import clientesReducer from "./reducers/clientesReducer";
import loginReducer from "./reducers/loginReducer";
import productosReducer from "./reducers/productosReducer";
import barriosReducer from "./reducers/barriosReducer";
import municipiosReducer from "./reducers/municipiosReducer";
import pedidosReducer from "./reducers/pedidosReducer";
import notificacionReducer from "./reducers/notificacionReducer";

const combinedReducer = combineReducers({
  clientes: clientesReducer,
  login: loginReducer,
  productos: productosReducer,
  barrios: barriosReducer,
  municipios: municipiosReducer,
  pedidos: pedidosReducer,
  notificacion: notificacionReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "login/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
