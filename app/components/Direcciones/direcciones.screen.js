import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextInput,
  List,
  Button,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { Icon } from "react-native-elements";
import normalize from "react-native-normalize";
import Colors from "../../theme/colors";
import { useDispatch, useSelector } from "react-redux";
import { initialMunicipios } from "../../redux/reducers/municipiosReducer";
import { initialBarrios } from "../../redux/reducers/barriosReducer";
import {
  actualizarClienteAsync,
  estadoProceso,
  initialClientes,
} from "../../redux/reducers/clientesReducer";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

function Direccion({ route }) {
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const inputRef = useRef(null);

  const municipios = useSelector(initialMunicipios);

  const barrios = useSelector(initialBarrios);

  const cliente = useSelector(initialClientes);

  const estado = useSelector(estadoProceso);

  const [modal, setModal] = useState(false);

  const [campo, setCampo] = useState("");

  const [datos, setDatos] = useState([]);

  const formik = useFormik({
    initialValues: {
      municipio: "",
      barrio: "",
      direccion: "",
      puntoRef: "",
      municipio2: "",
      barrio2: "",
      direccion2: "",
      puntoRef2: "",
      municipio3: "",
      barrio3: "",
      direccion3: "",
      puntoRef3: "",
      municipio4: "",
      barrio4: "",
      direccion4: "",
      puntoRef4: "",
    },
    validationSchema: Yup.object({
      direccion: Yup.string().required("La dirección es obligatoria"),
      barrio: Yup.string().required("El barrio es obligatorio"),
      municipio: Yup.string().required("El municipio es obligatorio"),
      puntoRef: Yup.string(),
      municipio2: Yup.string(),
      barrio2: Yup.string().when("municipio2", (municipio2, barrio2) =>
        municipio2 ? barrio2.required("El barrio es obligatorio") : barrio2
      ),
      direccion2: Yup.string().when("municipio2", (municipio2, direccion2) =>
        municipio2
          ? direccion2.required("La dirección es obligatoria")
          : direccion2
      ),
      puntoRef2: Yup.string(),
      municipio3: Yup.string(),
      barrio3: Yup.string().when("municipio3", (municipio3, barrio3) =>
        municipio3 ? barrio3.required("El barrio es obligatorio") : barrio3
      ),
      direccion3: Yup.string().when("municipio3", (municipio3, direccion3) =>
        municipio3
          ? direccion3.required("La dirección es obligatoria")
          : direccion3
      ),
      puntoRef3: Yup.string(),
      municipio4: Yup.string(),
      barrio4: Yup.string().when("municipio4", (municipio4, barrio4) =>
        municipio4 ? barrio4.required("El barrio es obligatorio") : barrio4
      ),
      direccion4: Yup.string().when("municipio4", (municipio4, direccion4) =>
        municipio4
          ? direccion4.required("La dirección es obligatoria")
          : direccion4
      ),
      puntoRef4: Yup.string(),
    }),
    onSubmit: async () => {
      const barrio = barrios.find((x) => x.id === formik.values.barrio);
      const barrio2 = barrios.find((x) => x.id === formik.values.barrio2);
      const barrio3 = barrios.find((x) => x.id === formik.values.barrio3);
      const barrio4 = barrios.find((x) => x.id === formik.values.barrio4);
      const { id } = cliente;
      const result = await dispatch(
        actualizarClienteAsync({
          ...cliente.data,
          id,
          barrio: barrio,
          barrio2: barrio2,
          barrio3: barrio3,
          barrio4: barrio4,
          puntoRef: formik.values.puntoRef,
          puntoRef2: formik.values.puntoRef2,
          puntoRef3: formik.values.puntoRef3,
          puntoRef4: formik.values.puntoRef4,
          direccion: formik.values.direccion,
          direccion2: formik.values.direccion2,
          direccion3: formik.values.direccion3,
          direccion4: formik.values.direccion4,
        })
      ).unwrap();
      Object.values(result.data).length > 0 && navigation.navigate("canasta");
    },
  });

  useEffect(() => {
    setModal(datos.length > 0 ? true : false);
  }, [datos]);

  useEffect(() => {
    formik.setValues({
      municipio: cliente.data.barrio && cliente.data.barrio.municipio.id,
      municipio2: cliente.data.barrio2 && cliente.data.barrio2.municipio.id,
      municipio3: cliente.data.barrio3 && cliente.data.barrio3.municipio.id,
      municipio4: cliente.data.barrio4 && cliente.data.barrio4.municipio.id,
      barrio: cliente.data.barrio?.id,
      barrio2: cliente.data.barrio2?.id,
      barrio3: cliente.data.barrio3?.id,
      barrio4: cliente.data.barrio4?.id,
      puntoRef: cliente.data.puntoRef,
      puntoRef2: cliente.data.puntoRef2,
      puntoRef3: cliente.data.puntoRef3,
      puntoRef4: cliente.data.puntoRef4,
      direccion: cliente.data.direccion,
      direccion2: cliente.data.direccion2,
      direccion3: cliente.data.direccion3,
      direccion4: cliente.data.direccion4,
    });
  }, [cliente]);

  //Metodo para cargar los controles de edición de la dirección pricipal
  const cargarDireccion = (id) => {
    const barrio = formik.values[`barrio${id}`]
      ? barrios.find((x) => x.id === formik.values[`barrio${id}`])
      : "";
    const municipio = formik.values[`municipio${id}`]
      ? municipios.find((x) => x.id === formik.values[`municipio${id}`])
      : "";
    return (
      <View
        style={{
          paddingHorizontal: normalize(20),
        }}
      >
        <View>
          <List.Subheader>Dirección</List.Subheader>
          <TextInput
            error={
              formik.errors[`direccion${id}`] &&
              formik.touched[`direccion${id}`]
            }
            theme={{
              colors: {
                primary: Colors.primary,
              },
            }}
            id={`direccion${id}`}
            value={formik.values[`direccion${id}`]}
            onChangeText={formik.handleChange(`direccion${id}`)}
            onBlur={formik.handleBlur(`direccion${id}`)}
            right={
              <TextInput.Icon
                name={() => (
                  <Icon
                    color={Colors.primary}
                    size={normalize(30)}
                    name="location"
                    type="evilicon"
                  />
                )}
              />
            }
          />
          {formik.errors[`direccion${id}`] &&
            formik.touched[`direccion${id}`] && (
              <Text style={styles.error}>
                {formik.errors[`direccion${id}`]}
              </Text>
            )}
        </View>
        <View>
          <List.AccordionGroup>
            <List.Subheader>Municipio</List.Subheader>
            <List.Item
              title={municipio?.nombre}
              id={formik.values[`municipio${id}`]}
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              style={{ backgroundColor: "white" }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name={"chevron-down"}
                  type="evilicon"
                  onPress={() => {
                    setCampo([`municipio${id}`]);
                    setDatos([{ id: "", nombre: "Seleccione" }, ...municipios]);
                  }}
                />
              )}
            />
          </List.AccordionGroup>
          {formik.errors[`municipio${id}`] &&
            formik.touched[`municipio${id}`] && (
              <Text style={styles.error}>
                {formik.errors[`municipio${id}`]}
              </Text>
            )}
        </View>
        <View>
          <List.AccordionGroup>
            <List.Subheader>Barrio</List.Subheader>
            <List.Item
              title={barrio?.nombre}
              id={formik.values[`barrio${id}`]}
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              style={{ backgroundColor: "white" }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name={"chevron-down"}
                  type="evilicon"
                  onPress={() => {
                    setCampo([`barrio${id}`]);
                    setDatos([
                      { id: "", nombre: "Seleccione" },
                      ...barrios.filter(
                        (m) =>
                          m.municipio.id === formik.values[`municipio${id}`]
                      ),
                    ]);
                  }}
                />
              )}
            />
          </List.AccordionGroup>
          {formik.errors[`barrio${id}`] && formik.touched[`barrio${id}`] && (
            <Text style={styles.error}>{formik.errors[`barrio${id}`]}</Text>
          )}
        </View>
        <View>
          <List.Subheader>Punto de Referencia</List.Subheader>
          <TextInput
            error={
              formik.errors[`puntoRef${id}`] && formik.touched[`puntoRef${id}`]
            }
            theme={{
              colors: {
                primary: Colors.primary,
              },
            }}
            id={`puntoRef${id}`}
            ref={inputRef}
            onFocus={handleInputFocus}
            value={formik.values[`puntoRef${id}`]}
            onChangeText={formik.handleChange("puntoRef")}
            onBlur={formik.handleBlur("puntoRef")}
            right={
              <TextInput.Icon
                name={() => (
                  <Icon
                    color={Colors.primary}
                    size={normalize(30)}
                    name="pointer"
                    type="evilicon"
                  />
                )}
              />
            }
          />
          {formik.errors[`puntoRef${id}`] &&
            formik.touched[`puntoRef${id}`] && (
              <Text style={styles.error}>{formik.errors[`puntoRef${id}`]}</Text>
            )}
        </View>
      </View>
    );
  };

  //Metodo para cargar los datos existentes
  const cargarDatos = ({ item }) => {
    return (
      <List.Item
        key={item.id}
        title={item.nombre}
        onPress={() => {
          if (campo.includes("municipio")) {
            formik.setFieldValue(
              campo[0].replace("municipio", "barrio"),
              "",
              false
            );
          }
          formik.setFieldValue(campo, item.id, false);
          setModal(false);
        }}
      />
    );
  };

  const handleInputFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
        <View>
          <List.AccordionGroup>
            <List.Subheader>Direcciones</List.Subheader>
            <List.Accordion
              title="Dirección Principal"
              id="1"
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name="navicon"
                  type="evilicon"
                />
              )}
            >
              {cargarDireccion("")}
            </List.Accordion>
            <List.Accordion
              title="Dirección 2"
              id="2"
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name="navicon"
                  type="evilicon"
                />
              )}
            >
              {cargarDireccion("2")}
            </List.Accordion>
            <List.Accordion
              title="Dirección 3"
              id="3"
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name="navicon"
                  type="evilicon"
                />
              )}
            >
              {cargarDireccion("3")}
            </List.Accordion>
            <List.Accordion
              title="Dirección 4"
              id="4"
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              right={() => (
                <Icon
                  size={normalize(40)}
                  color={Colors.primary}
                  name="navicon"
                  type="evilicon"
                />
              )}
            >
              {cargarDireccion("4")}
            </List.Accordion>
          </List.AccordionGroup>
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
          <TouchableNativeFeedback onPress={formik.handleSubmit}>
            <Button
              style={styles.button}
              theme={{
                colors: {
                  primary: Colors.button,
                },
              }}
              mode="contained"
            >
              Actualizar
            </Button>
          </TouchableNativeFeedback>
        )}
        <TouchableWithoutFeedback
          onPress={() => setModal(false)}
          accessible={false}
        >
          <Modal
            animationType="slide"
            visible={modal}
            transparent={true}
            onRequestClose={() => {
              setModal(false);
            }}
          >
            <View style={styles.containerModal}>
              <View style={styles.modal}>
                <FlatList
                  ItemSeparatorComponent={() => <Divider />}
                  data={datos}
                  renderItem={cargarDatos}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </View>
          </Modal>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: normalize(10),
  },
  containerModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(218,218,218, 0.9)",
    paddingVertical: normalize(50, "height"),
  },
  modal: {
    backgroundColor: "rgba(255,255,255, 1)",
    marginHorizontal: normalize(30),
    paddingVertical: normalize(10, "height"),
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
});

export default Direccion;
