import React, { useState, useRef, memo, useEffect } from "react";
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
import auth from "@react-native-firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  estadoProceso,
  obtenerClienteAsync,
} from "../../redux/reducers/clientesReducer";
import SplashScreen from "react-native-splash-screen";

function Login() {
  const dispatch = useDispatch();

  const toastRef = useRef();

  const toastRefError = useRef();

  const estado = useSelector(estadoProceso);

  const [contrasena, setContrasena] = useState(true);

  const [code, setCode] = useState({});

  const [resend, setResend] = useState(false);

  const codeSend = Object.values(code).length !== 0;

  const DeviceScreen = Dimensions.get("screen");

  const toast = DeviceScreen.height < 700 ? normalize(80) : normalize(140);

  const formatPhone = /^\d{1,10}$/;

  const formik = useFormik({
    initialValues: {
      telefono: "",
      password: "",
    },
    validationSchema: Yup.object({
      telefono: Yup.string()
        .required("El número celular es obligatorio")
        .min(10, "El número celular debe contener 10 caracteres")
        .matches(formatPhone, "Teléfono inválido"),
      password: Yup.string()
        .required("El código es obligatorio")
        .max(6, "El código debe contener maximo 6 caracteres"),
    }),
  });

  useEffect(() => {
    //Cierra el splash para mostrar la pantalla inicial
    SplashScreen.hide();
  }, []);

  //Metodo submit que toma los datos del formulario de formik
  const handleSubmit = () => {
    const { telefono, password } = formik.values;
    if (telefono && password) {
      code
        .confirm(password)
        .then(() => {
          dispatch(obtenerClienteAsync(telefono)).unwrap();
          limpiarDatos();
        })
        .catch(() => {
          toastRefError.current.show("Código invalido", 5000);
        });
    } else {
      !(
        (formik.errors.telefono && formik.touched.telefono) ||
        (formik.errors.password && formik.touched.password)
      ) && toastRefError.current.show("Todos los campos son obligarios", 5000);
    }
  };

  const mostrarContrasena = () => {
    setContrasena(!contrasena);
  };

  const reenviarCode = () => {
    setResend(true);
    handleCode();
  };

  const handleCode = async () => {
    if (formik.values.telefono) {
      toastRef.current.show(`Enviando código de verificación`, 2000);
      let phoneNumber = "+57" + formik.values.telefono;
      auth()
        .signInWithPhoneNumber(phoneNumber, true)
        .then((result) => {
          toastRef.current.show(`Código Enviado`, 5000);
          setCode(result);
          setResend(false);
        })
        .catch(() => {
          toastRefError.current.show(
            "Número bloqueado por multiples intentos, intentalo en un momento",
            5000
          );
        });
      setResend(false);
    } else {
      !(formik.errors.telefono && formik.touched.telefono);
      toastRefError.current.show("Ingrese el número de celular", 5000);
    }
  };

  const limpiarDatos = () => {
    setCode(false);
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
  };

  return (
    <>
      <StatusBar hidden={true} />
      <Toast
        ref={toastRef}
        style={{ backgroundColor: Colors.message }}
        textStyle={{ color: Colors.text }}
        positionValue={normalize(toast, "height")}
      />
      <Toast
        ref={toastRefError}
        style={{ backgroundColor: Colors.error }}
        positionValue={normalize(toast, "height")}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.containerLogo}>
            <Image
              PlaceholderContent={<ActivityIndicator color={Colors.primary} />}
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.titte}>Iniciar Sesión</Text>
          </View>
          <View style={styles.input}>
            <TextInput
              error={formik.errors.telefono && formik.touched.telefono}
              theme={{
                colors: {
                  primary: Colors.text,
                },
              }}
              disabled={codeSend}
              keyboardType="number-pad"
              id="telefono"
              label="Celular"
              value={formik.values.telefono}
              onChangeText={formik.handleChange("telefono")}
              onBlur={formik.handleBlur("telefono")}
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
            {formik.errors.telefono && formik.touched.telefono && (
              <Text style={styles.error}>{formik.errors.telefono}</Text>
            )}
          </View>
          {codeSend && (
            <View style={styles.input}>
              <TextInput
                error={formik.errors.password && formik.touched.password}
                theme={{
                  colors: {
                    primary: Colors.text,
                  },
                }}
                secureTextEntry={contrasena}
                keyboardType="number-pad"
                id="password"
                label="Código enviado"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                onBlur={formik.handleBlur("password")}
                right={
                  <TextInput.Icon
                    name={() => (
                      <Icon
                        raised
                        size={normalize(30)}
                        name={contrasena ? "lock" : "unlock"}
                        type="evilicon"
                        onPress={mostrarContrasena}
                      />
                    )}
                  />
                }
              />
              {formik.errors.password && formik.touched.password && (
                <Text style={styles.error}>{formik.errors.password}</Text>
              )}
            </View>
          )}
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
            <TouchableNativeFeedback
              onPress={codeSend ? handleSubmit : handleCode}
            >
              <Button
                disabled={formik.values.telefono.length !== 10}
                style={styles.button}
                theme={{
                  colors: {
                    primary: Colors.button,
                  },
                }}
                mode="contained"
              >
                {codeSend ? "Ingresar" : "Generar Código"}
              </Button>
            </TouchableNativeFeedback>
          )}
          {codeSend && (
            <>
              <Button
                uppercase={false}
                loading={resend}
                labelStyle={styles.opcional}
                onPress={reenviarCode}
                theme={{
                  colors: {
                    primary: "white",
                  },
                }}
                mode="text"
              >
                {resend ? "Enviando..." : "Reenviar Código"}
              </Button>
              <Button
                uppercase={false}
                loading={resend}
                labelStyle={styles.opcional}
                style={{ marginBottom: normalize(15, "height") }}
                onPress={limpiarDatos}
                theme={{
                  colors: {
                    primary: "white",
                  },
                }}
                mode="text"
              >
                {"Limpiar Campos"}
              </Button>
            </>
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
    paddingVertical: normalize(30, "height"),
    backgroundColor: Colors.primary,
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
    marginVertical: normalize(15, "height"),
  },
  error: {
    backgroundColor: Colors.error,
    padding: normalize(3),
    color: "white",
    textAlign: "center",
  },
  titte: {
    color: "white",
    fontSize: normalize(18),
    fontWeight: "bold",
    marginTop: normalize(20, "height"),
  },
  opcional: {
    textDecorationLine: "underline",
  },
});

export default memo(Login);
