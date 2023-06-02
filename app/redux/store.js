import { combineReducers, configureStore } from "@reduxjs/toolkit";
import usuariosReducer from "./reducers/usuariosReducer";

const combinedReducer = combineReducers({
  usuarios: usuariosReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "usuarios/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export default configureStore({
  reducer: rootReducer,
});
