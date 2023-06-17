import React, { useRef } from "react";
import Colors from "../../theme/colors";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import Toast, { DURATION } from "react-native-easy-toast";
import { TextInput, Button, ActivityIndicator } from "react-native-paper";
import { Image, Icon } from "react-native-elements";
import normalize from "react-native-normalize";
import { useDispatch, useSelector } from "react-redux";
import { initialLogin } from "../../redux/reducers/loginReducer";
import {
  crearClienteAsync,
  estadoProceso,
} from "../../redux/reducers/clientesReducer";

function RegistroDatos({ route }) {
  const dispatch = useDispatch();

  const toastRef = useRef();

  const login = useSelector(initialLogin);

  const estado = useSelector(estadoProceso);

  const DeviceScreen = Dimensions.get("screen");

  const toast = DeviceScreen.height < 700 ? normalize(80) : normalize(140);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      telefono: "",
      password: "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .min(4, "El nombre debe contener por lo menos 4 caracteres")
        .required("El nombre es obligatorio"),
    }),
  });

  const handleSubmit = async () => {
    const { nombre } = formik.values;
    const { phoneNumber } = login;
    const telefono = phoneNumber.slice(-10);

    dispatch(
      crearClienteAsync({
        id: telefono,
        nombre,
        telefono,
      })
    );
  };

  return (
    <>
      <StatusBar hidden={true} />
      <Toast
        ref={toastRef}
        style={styles.toast}
        positionValue={normalize(toast, "height")}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.containerLogo}>
            <Image
              PlaceholderContent={
                <ActivityIndicator color={Colors.primaryButton} />
              }
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.input}>
            <TextInput
              error={formik.errors.nombre && formik.touched.nombre}
              theme={{
                colors: {
                  primary: Colors.text,
                },
              }}
              id="nombre"
              label="Nombre Completo"
              value={formik.values.nombre}
              onChangeText={formik.handleChange("nombre")}
              onBlur={formik.handleBlur("nombre")}
              right={
                <TextInput.Icon
                  name={() => (
                    <Icon
                      raised
                      size={normalize(30)}
                      name="user"
                      type="evilicon"
                    />
                  )}
                />
              }
            />
            {formik.errors.nombre && formik.touched.nombre && (
              <Text style={styles.error}>{formik.errors.nombre}</Text>
            )}
          </View>
          {estado.isLoading ? (
            <View
              style={{
                justifyContent: "center",
                marginVertical: normalize(20, "height"),
              }}
            >
              <ActivityIndicator
                size="small"
                animating={true}
                color={Colors.button}
              />
            </View>
          ) : (
            <TouchableNativeFeedback onPress={handleSubmit}>
              <Button
                style={styles.button}
                theme={{
                  colors: {
                    primary: Colors.button,
                  },
                }}
                mode="contained"
              >
                Finalizar Registro
              </Button>
            </TouchableNativeFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(30),
  },
  containerLogo: {
    alignItems: "center",
    marginVertical: normalize(50, "height"),
  },
  logo: {
    width: normalize(150),
    height: normalize(150, "height"),
  },
  input: {
    marginBottom: normalize(15, "height"),
  },
  button: {
    paddingVertical: normalize(5, "height"),
    marginVertical: normalize(20, "height"),
  },
  error: {
    backgroundColor: Colors.error,
    padding: normalize(3),
    color: "white",
    textAlign: "center",
  },
  toast: {
    backgroundColor: Colors.error,
  },
  domiciliario: {
    color: "white",
    fontWeight: "bold",
    marginTop: normalize(10, "height"),
  },
  opcional: {
    textDecorationLine: "underline",
  },
});

export default RegistroDatos;
