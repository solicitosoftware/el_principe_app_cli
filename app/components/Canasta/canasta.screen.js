import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { FirebaseContext } from "../../firebase";
import {
  useCanasta,
  useDispatch as useDispatchContext,
} from "../Context/canastaProvider";
import { useNavigation } from "@react-navigation/native";
import { useFormik } from "formik";
import Toast, { DURATION } from "react-native-easy-toast";
import * as Yup from "yup";
import {
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  Text,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Modal,
  Alert,
  Linking,
  Platform,
} from "react-native";
import {
  List,
  Avatar,
  Button,
  TextInput,
  ActivityIndicator,
} from "react-native-paper";
import { Icon } from "react-native-elements";
import {
  capitalize,
  formatearTimestamp,
  formatoPrecio,
  nullOrEmpty,
} from "../../utils";
import normalize from "react-native-normalize";
import Colors from "../../theme/colors";
import { types } from "../Context/canastaReducer";
import SplashScreen from "react-native-splash-screen";
import checkVersion from "react-native-store-version";
import "moment/locale/es";
import { initialClientes } from "../../redux/reducers/clientesReducer";
import { useDispatch, useSelector } from "react-redux";
import { initialBarrios } from "../../redux/reducers/barriosReducer";
import {
  crearPedidoAsync,
  estadoProceso,
  initialPedidos,
  setPedidos,
} from "../../redux/reducers/pedidosReducer";
import {
  addNotify,
  initialNotificaciones,
  setCambios,
  updateNotify,
} from "../../redux/reducers/notificacionReducer";
import { REACT_APP_IOS_LINK, REACT_APP_ANDROID_LINK } from "@env";
import DeviceInfo from "react-native-device-info";

function Canasta() {
  const { firebase } = useContext(FirebaseContext);

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const dispatchContext = useDispatchContext();

  const canasta = useCanasta();

  const toastRef = useRef();

  const cliente = useSelector(initialClientes);

  const pedidos = useSelector(initialPedidos);

  const notificaciones = useSelector(initialNotificaciones);

  const estado = useSelector(estadoProceso);

  const barrios = useSelector(initialBarrios);

  const [modal, setModal] = useState(false);

  const [modalObs, setModalObs] = useState(false);

  const [direccionPedido, setDireccion] = useState();

  const [medioPago, setMedioPago] = useState("efectivo");

  const [detallePago, setDetallePago] = useState({
    efectivo: 0,
    transferencia: 0,
  });

  const [expandedMedioPago, setExpandedMedioPago] = useState(false);

  const [ipoconsumo, setIpoc] = useState(0);

  const [total, setTotal] = useState(0);

  const formik = useFormik({
    initialValues: {
      observaciones: "",
    },
    validationSchema: Yup.object({
      observaciones: Yup.string(),
    }),
  });

  const DeviceScreen = Dimensions.get("screen");

  const toast = DeviceScreen.height < 700 ? normalize(80) : normalize(360);

  useEffect(() => {
    //Cierra el splash para mostrar la pantalla inicial
    SplashScreen.hide();
    validarVersion();
  }, []);

  useEffect(() => {
    //Calcula al total e ipo consumo del pedido
    const calcularValores = () => {
      let suma = canasta.reduce(
        (sum, value) =>
          typeof value.precio == "number"
            ? sum + value.precio * value.cantidad
            : sum,
        direccionPedido ? direccionPedido.barrio.valor : 0
      );
      let ipoconsumo = canasta.reduce(
        (sum, value) =>
          value.categoria.nombre === "Fritos" ||
          value.categoria.nombre === "Gaseosas"
            ? sum + value.precio * value.cantidad * 0.08
            : sum,
        0
      );
      setTotal(suma);
      setIpoc(ipoconsumo);
    };

    //Metodo para mostrar modal de direcciones
    const MostrarDirecciones = () => {
      if (canasta.length > 0 && !direccionPedido) {
        setModal(true);
      }

      if (canasta.length == 0) {
        setDireccion();
      }
    };

    calcularValores();
    MostrarDirecciones();
  }, [canasta, cliente, direccionPedido]);

  const validarNotificaciones = useCallback(() => {
    let cambios = 0;
    pedidos.map((data) => {
      const pedidoNotify = notificaciones.find((e) => data.id === e.id);
      if (pedidoNotify) {
        if (pedidoNotify.estado !== data.estado) {
          cambios++;
          dispatch(updateNotify({ ...data }));
        }
      } else {
        dispatch(addNotify(data));
      }
    });
    dispatch(setCambios(cambios));
  }, [dispatch, pedidos]);

  useEffect(() => {
    validarNotificaciones();
  }, [validarNotificaciones]);

  useEffect(() => {
    const obtenerPedidosCliente = () => {
      firebase.db
        .collection("pedidos")
        .where("cliente.id", "==", cliente.id)
        .orderBy("fecha", "desc")
        .limit(50)
        .onSnapshot(manejarSnapshotPedidosCliente);
    };
    //Se consulta los pedidos del cliente en BD del dia actual
    obtenerPedidosCliente();
  }, []);

  const validarVersion = async () => {
    const check = await checkVersion({
      version: DeviceInfo.getVersion(),
      iosStoreURL: REACT_APP_IOS_LINK,
      androidStoreURL: REACT_APP_ANDROID_LINK,
      country: "co",
    });

    const actualizarApp = (link) => {
      Linking.openURL(link)
        .then((supported) => {
          if (!supported) {
            Alert.alert(
              "Instala la aplicación para brindarte una mejor experiencia"
            );
          } else {
            return Linking.openURL(link);
          }
        })
        .catch((err) => console.error(err));
    };

    if (check.result === "new") {
      Alert.alert(
        "Actualización",
        `Es necesario actualizar la aplicación en su última versión ${check.remote}`,
        [
          {
            text: "Ir",
            onPress: () =>
              actualizarApp(
                Platform.OS === "ios"
                  ? REACT_APP_IOS_LINK
                  : REACT_APP_ANDROID_LINK
              ),
          },
        ]
      );
      return false;
    }
    return true;
  };

  function manejarSnapshotPedidosCliente(values) {
    const datos = values.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        fecha: formatearTimestamp(doc.data().fecha),
        movimiento: formatearTimestamp(doc.data().movimiento),
      };
    });

    dispatch(setPedidos(datos));
  }

  //Metodo para cargar los productos de la canasta
  const cargarProductos = ({ item, index }) => {
    let { nombre, imagen, precio, cantidad } = item;
    let totalP = precio * cantidad;
    return (
      <List.Item
        key={`Pedido_${index}`}
        title={`${nombre.toUpperCase()} X ${cantidad}`}
        titleStyle={{ fontSize: normalize(18) }}
        description={`Total ${formatoPrecio(totalP)}`}
        descriptionStyle={{ fontSize: normalize(16) }}
        left={() => (
          <View style={styles.imagen}>
            <Avatar.Image size={40} source={{ uri: imagen }} />
          </View>
        )}
        right={() => (
          <View style={styles.cantidad}>
            <Icon
              size={normalize(32)}
              name="plus"
              type="evilicon"
              onPress={() => {
                canasta[index].cantidad++;
                dispatchContext({ type: types.plus, data: item });
              }}
            />
            {cantidad === 1 ? (
              <Icon
                raised
                size={normalize(32)}
                color={Colors.error}
                name="trash"
                type="evilicon"
                onPress={() => {
                  dispatchContext({ type: types.delete, data: index });
                }}
              />
            ) : (
              <Icon
                raised
                size={normalize(32)}
                color={Colors.error}
                name="minus"
                type="evilicon"
                onPress={() => {
                  canasta[index].cantidad--;
                  dispatchContext({ type: types.minus, data: item });
                }}
              />
            )}
          </View>
        )}
      />
    );
  };

  //Metodo para cargara el valor del domicilio
  const domicilio = () => {
    if (canasta.length > 0) {
      return (
        <TouchableNativeFeedback onPress={() => setModal(true)}>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: normalize(15),
              paddingVertical: normalize(10),
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <Icon
                size={normalize(30)}
                name="location"
                type="evilicon"
                color={Colors.primary}
              />
              {direccionPedido && !nullOrEmpty(direccionPedido.direccion) ? (
                <Text style={styles.direccion}>{`${capitalize(
                  direccionPedido.direccion
                )} ${direccionPedido.barrio.nombre}`}</Text>
              ) : (
                <Text style={styles.direccionError}>
                  Seleccione una Dirección
                </Text>
              )}
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row-reverse",
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <Text style={styles.direccion}>{`Domicilio ${formatoPrecio(
                direccionPedido?.barrio.valor || 0
              )}`}</Text>
            </View>
          </View>
        </TouchableNativeFeedback>
      );
    }
  };

  //Metodo para cargar los medios de pago
  const MedioPago = () => {
    if (direccionPedido) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: normalize(15),
            paddingBottom: normalize(10),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Icon
              size={normalize(30)}
              name="credit-card"
              type="evilicon"
              color={Colors.primary}
            />
            <Text style={styles.direccion}>Medio de Pago:</Text>
          </View>
          <View style={{ width: normalize(140) }}>
            <List.Accordion
              title={capitalize(medioPago)}
              style={{ padding: 0 }}
              theme={{
                colors: {
                  primary: Colors.primary,
                },
              }}
              right={() => (
                <Icon
                  size={normalize(30)}
                  color={Colors.primary}
                  name={expandedMedioPago ? "chevron-up" : "chevron-down"}
                  type="evilicon"
                />
              )}
              expanded={expandedMedioPago}
              onPress={() => setExpandedMedioPago(!expandedMedioPago)}
            >
              <List.Item
                title="Efectivo"
                onPress={() => {
                  setMedioPago("efectivo");
                  setDetallePago({ efectivo: total, transferencia: 0 });
                  setExpandedMedioPago(!expandedMedioPago);
                }}
              />
              <List.Item
                title="Transferencia"
                onPress={() => {
                  setMedioPago("transferencia");
                  setDetallePago({ efectivo: 0, transferencia: total });
                  setExpandedMedioPago(!expandedMedioPago);
                }}
              />
            </List.Accordion>
          </View>
        </View>
      );
    }
  };

  //Metodo para cargar las observaciones del pedido
  const observacion = () => {
    const { observaciones } = formik.values;
    if (direccionPedido) {
      return (
        <TouchableNativeFeedback onPress={() => setModalObs(true)}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: normalize(15),
              paddingVertical: normalize(10),
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                size={normalize(30)}
                name="pencil"
                type="evilicon"
                color={Colors.primary}
              />
              <Text style={styles.direccion}>Observaciones:</Text>
            </View>
            {observaciones ? (
              <Text style={styles.observacion}>{observaciones}</Text>
            ) : (
              <Text style={styles.observacion}>Agregar Observaciones</Text>
            )}
          </View>
        </TouchableNativeFeedback>
      );
    }
  };

  //Metodo para redireccionar a whatsapp para medios de pago transferencia
  function renderWhatsapp(values) {
    const { cliente, total } = values;
    let text = `Hola. Acabo de realizar un pedido por un valor: *${formatoPrecio(
      total
    )}* a nombre de *${cliente.nombre.trim()}* y pagaré por transferencia`;
    let phoneNumber = "+573157242140";
    let link = `https://wa.me/${phoneNumber}?text=${text}`;
    Linking.openURL(link)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            "Instala la aplicación para brindarte una mejor experiencia"
          );
        } else {
          return Linking.openURL(link);
        }
      })
      .catch((err) => console.error(err));
  }

  const confirmarPedido = async () => {
    if (await validarVersion()) {
      if (Object.values(direccionPedido).length > 0) {
        const { observaciones } = formik.values;
        let values = {
          ipoconsumo,
          medioPago,
          observaciones,
          sede: 3,
          total,
          detallePago,
          usuario: "App Móvil",
          productos: [...canasta],
          estado: "Pendiente aprobar",
          cliente: { ...direccionPedido },
        };
        const pedido = await dispatch(crearPedidoAsync({ ...values })).unwrap();
        if (pedido && medioPago == "transferencia") {
          Alert.alert(
            "Pago Transferencia",
            "Se redireccionará a Whatsapp para enviar el comprobante de Pago",
            [
              {
                text: "Cerrar",
                onPress: () => null,
                style: "cancel",
              },
              { text: "Ir", onPress: () => renderWhatsapp(values) },
            ]
          );
          return true;
        }
        dispatchContext({ type: types.clear });
        navigation.navigate("notificacion");
        limpiarDatos();
      } else {
        toastRef.current.show(
          "Debe seleccionar una dirección de entrega",
          5000
        );
      }
    }
  };

  const limpiarDatos = () => {
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
    setMedioPago("efectivo");
    setDetallePago({
      efectivo: 0,
      transferencia: 0,
    });
  };

  //Metodo para calcular el total del pedido
  const valorTotal = () => {
    return (
      <View>
        <View style={styles.total}>
          <Text style={styles.textCantidad}>{`PAGO TOTAL ${formatoPrecio(
            total
          )}`}</Text>
        </View>
        <TouchableNativeFeedback onPress={confirmarPedido}>
          <Button
            style={styles.button}
            theme={{
              colors: {
                primary: Colors.button,
              },
            }}
            mode="contained"
          >
            CONFIRMAR PEDIDO
          </Button>
        </TouchableNativeFeedback>
      </View>
    );
  };

  //Metodo para cargar las direcciones del cliente
  const cargarDireccion = (index) => {
    const { id } = cliente;
    const { nombre, telefono, telefono2 } = cliente.data;
    setDireccion({
      direccion: cliente.data[`direccion${index}`],
      barrio: barrios.find((x) => x.id === cliente.data[`barrio${index}`].id),
      puntoRef: cliente.data[`puntoRef${index}`],
      id,
      nombre,
      telefono: parseInt(telefono),
      telefono2: telefono2 ? parseInt(telefono2) : null,
    });
    setModal(false);
  };

  //Metodo para pintar las direcciones del Modal
  const listaDirecciones = () => {
    const {
      direccion,
      direccion2,
      direccion3,
      direccion4,
      barrio,
      barrio2,
      barrio3,
      barrio4,
    } = cliente.data;
    return (
      <List.Accordion
        title="Direcciones"
        theme={{
          colors: {
            primary: Colors.primary,
          },
        }}
        left={() => (
          <Icon
            size={normalize(40)}
            name="location"
            type="evilicon"
            color={Colors.primary}
          />
        )}
        right={() => (
          <Icon
            size={normalize(40)}
            color={Colors.primary}
            name={"chevron-right"}
            type="evilicon"
          />
        )}
        expanded={true}
        onPress={() => {
          setModal(false);
          navigation.navigate("direccion", {
            cliente,
          });
        }}
      >
        {!nullOrEmpty(direccion) && (
          <List.Item
            title={`${capitalize(direccion)} ${barrio && barrio.nombre}`}
            titleStyle={{ fontSize: normalize(16) }}
            left={() => (
              <View
                style={{
                  justifyContent: "center",
                  marginHorizontal: normalize(10),
                }}
              >
                <Icon
                  size={normalize(30)}
                  name="chevron-right"
                  type="evilicon"
                />
              </View>
            )}
            onPress={() => cargarDireccion("")}
          />
        )}
        {!nullOrEmpty(direccion2) && (
          <List.Item
            title={`${capitalize(direccion2)} ${barrio2 && barrio2.nombre}`}
            titleStyle={{ fontSize: normalize(16) }}
            left={() => (
              <View
                style={{
                  justifyContent: "center",
                  marginHorizontal: normalize(10),
                }}
              >
                <Icon
                  size={normalize(30)}
                  name="chevron-right"
                  type="evilicon"
                />
              </View>
            )}
            onPress={() => cargarDireccion("2")}
          />
        )}
        {!nullOrEmpty(direccion3) && (
          <List.Item
            title={`${capitalize(direccion3)} ${barrio3 && barrio3.nombre}`}
            titleStyle={{ fontSize: normalize(16) }}
            left={() => (
              <View
                style={{
                  justifyContent: "center",
                  marginHorizontal: normalize(10),
                }}
              >
                <Icon
                  size={normalize(30)}
                  name="chevron-right"
                  type="evilicon"
                />
              </View>
            )}
            onPress={() => cargarDireccion("3")}
          />
        )}
        {!nullOrEmpty(direccion4) && (
          <List.Item
            title={`${capitalize(direccion4)} ${barrio4 && barrio4.nombre}`}
            titleStyle={{ fontSize: normalize(16) }}
            left={() => (
              <View
                style={{
                  justifyContent: "center",
                  marginHorizontal: normalize(10),
                }}
              >
                <Icon
                  size={normalize(30)}
                  name="chevron-right"
                  type="evilicon"
                />
              </View>
            )}
            onPress={() => cargarDireccion("4")}
          />
        )}
      </List.Accordion>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.accent }}>
      <Text style={styles.title}>TU PEDIDO</Text>
      <View style={styles.container}>
        {estado.isLoading ? (
          <View
            style={{
              justifyContent: "center",
              height: normalize(DeviceScreen.height / 2, "height"),
            }}
          >
            <ActivityIndicator
              size="medium"
              animating={true}
              color={Colors.button}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={canasta}
              renderItem={cargarProductos}
              keyExtractor={(item) => item.id}
            />
            {domicilio()}
            {observacion()}
            {MedioPago()}
            {valorTotal()}
          </>
        )}
      </View>
      <Toast
        ref={toastRef}
        style={styles.toast}
        positionValue={normalize(toast, "height")}
      />
      <Modal
        animationType="slide"
        visible={modal}
        transparent={true}
        onRequestClose={() => {
          setModal(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModal(false);
          }}
          accessible={false}
        >
          <View style={styles.containerModal}>
            <View style={styles.modal}>
              <Text
                style={{
                  fontSize: normalize(18),
                  marginBottom: normalize(20, "height"),
                  paddingHorizontal: normalize(20),
                }}
              >
                Seleccioné una dirección de entrega para continuar
              </Text>
              {listaDirecciones()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="slide"
        visible={modalObs}
        transparent={true}
        onRequestClose={() => {
          setModalObs(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalObs(false);
          }}
          accessible={false}
        >
          <View style={styles.containerModal}>
            <View style={styles.modal}>
              <View style={styles.input}>
                <TextInput
                  error={
                    formik.errors.observaciones && formik.touched.observaciones
                  }
                  theme={{
                    colors: {
                      primary: Colors.primary,
                    },
                  }}
                  id="observaciones"
                  label="Observaciones"
                  value={formik.values.observaciones}
                  onChangeText={formik.handleChange("observaciones")}
                  onBlur={formik.handleBlur("observaciones")}
                />
                {formik.errors.observaciones &&
                  formik.touched.observaciones && (
                    <Text style={styles.error}>
                      {formik.errors.observaciones}
                    </Text>
                  )}
              </View>
              <TouchableNativeFeedback onPress={() => setModalObs(false)}>
                <Button
                  theme={{
                    colors: {
                      primary: Colors.button,
                    },
                  }}
                  mode="contained"
                >
                  Guardar
                </Button>
              </TouchableNativeFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: {
    justifyContent: "center",
    marginHorizontal: normalize(8),
  },
  title: {
    textAlign: "center",
    paddingVertical: normalize(15, "height"),
    fontSize: normalize(25),
    fontWeight: "bold",
    color: Colors.primary,
    textShadowColor: Colors.primary,
    textShadowRadius: 10,
  },
  button: {
    paddingVertical: normalize(5, "height"),
    marginBottom: normalize(10, "height"),
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255, 1)",
    borderTopLeftRadius: normalize(40),
    borderTopRightRadius: normalize(40),
    width: "99%",
    marginHorizontal: 2,
  },
  textCantidad: {
    fontSize: normalize(20),
    fontWeight: "bold",
    marginVertical: normalize(10),
    textAlign: "center",
    color: Colors.primary,
  },
  cantidad: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: normalize(2, "height"),
  },
  containerModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(218,218,218, 0.9)",
  },
  modal: {
    backgroundColor: "rgba(255,255,255, 1)",
    marginHorizontal: normalize(10),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(30, "height"),
  },
  opcional: {
    textDecorationLine: "underline",
    fontSize: normalize(18),
  },
  direccion: {
    fontSize: normalize(16),
  },
  direccionError: {
    fontSize: normalize(16),
    color: Colors.primary,
  },
  observacion: {
    fontSize: normalize(16),
    color: Colors.primary,
  },
  input: {
    marginBottom: normalize(30, "height"),
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
});

export default Canasta;
