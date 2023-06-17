import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import auth from "@react-native-firebase/auth";
import { logout, setLogin } from "../../redux/reducers/loginReducer";
import { obtenerClienteAsync } from "../../redux/reducers/clientesReducer";
import { obtenerProductoAsync } from "../../redux/reducers/productosReducer";
import { useCanasta } from "../Context/canastaProvider";
import { useBackHandler } from "@react-native-community/hooks";
import { BackHandler } from "react-native";
import { obtenerMunicipioAsync } from "../../redux/reducers/municipiosReducer";
import { obtenerBarrioAsync } from "../../redux/reducers/barriosReducer";

function CargueInicial() {
  const dispatch = useDispatch();

  const generalState = useSelector((state) => state);

  const canasta = useCanasta();

  useBackHandler(() => {
    BackHandler.exitApp();
  });

  const backAction = () => {
    if (canasta.length > 0) {
      Alert.alert(
        "Canasta",
        "Al salir se borraran los productos, desea salir?",
        [
          {
            text: "No",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Si", onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    }
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, [canasta]);

  const onAuthStateChanged = async (user) => {
    if (user) {
      dispatch(setLogin(user._user));
    } else {
      dispatch(logout());
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const useCargarDatos = useCallback(() => {
    const { login, clientes, productos, municipios, barrios } = generalState;

    if (Object.values(login.value).length > 0) {
      const { phoneNumber } = login.value;
      const telefono = phoneNumber.slice(-10);

      if (
        Object.values(clientes.value).length === 0 &&
        clientes.estado.isLoading === false
      ) {
        dispatch(obtenerClienteAsync(telefono));
      }
      if (
        municipios.value.length === 0 &&
        municipios.estado.isLoading === false
      ) {
        dispatch(obtenerMunicipioAsync());
      }
      if (barrios.value.length === 0 && barrios.estado.isLoading === false) {
        dispatch(obtenerBarrioAsync());
      }
    }

    if (productos.value.length === 0 && productos.estado.isLoading === false) {
      dispatch(obtenerProductoAsync());
    }
    return null;
  }, [generalState, dispatch]);

  useEffect(() => {
    useCargarDatos();
  }, [useCargarDatos]);

  return null;
}

export default CargueInicial;
