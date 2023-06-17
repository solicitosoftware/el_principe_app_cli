import React, { useContext, useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, Button, Avatar, Divider, TextInput } from "react-native-paper";
import Toast, { DURATION } from "react-native-easy-toast";
import { FirebaseContext } from "../../firebase";
import normalize from "react-native-normalize";
import Colors from "../../theme/colors";
import { capitalize, formatoPrecio } from "../../utils";
import moment from "moment";
import "moment/locale/es";
import { useDispatch, useSelector } from "react-redux";
import {
  cancelarPedidoAsync,
  initialPedidos,
} from "../../redux/reducers/pedidosReducer";
import { deleteCambios } from "../../redux/reducers/notificacionReducer";

function Notificacion({ route }) {
  const dispatch = useDispatch();

  const toastRef = useRef();

  const pedidos = useSelector(initialPedidos);

  const [detallePedido, setDetallePedido] = useState({});

  const [modal, setModal] = useState(false);

  const [modalDetalle, setModalDetalle] = useState(false);

  const DeviceScreen = Dimensions.get("screen");

  const toast = DeviceScreen.height < 700 ? normalize(80) : normalize(140);

  const formik = useFormik({
    initialValues: {
      comentario: "",
    },
    validationSchema: Yup.object({
      comentario: Yup.string()
        .min(4, "El motivo debe contener por lo menos 4 caracteres")
        .required("El motivo es obligatorio"),
    }),
    onSubmit: () => {
      const { comentario } = formik.values;
      const datos = {
        ...detallePedido,
        comentario,
        estado: "Cancelado",
        deuda: false,
        total: 0,
        ipoconsumo: 0,
      };
      dispatch(cancelarPedidoAsync(datos));
      limpiarDatos();
    },
  });

  useEffect(() => {
    dispatch(deleteCambios());
  }, []);

  //Cierra el modal de cancelar pedido
  const limpiarDatos = () => {
    setDetallePedido({});
    setModal(false);
    setModalDetalle(false);
    setTimeout(() => {
      formik.setErrors({});
      formik.setTouched({}, false);
      formik.setValues(formik.initialValues);
    }, 500);
  };

  const obtenerColor = (item) => {
    const { estado, entrega } = item;
    if (estado === "Cancelado") {
      return styles.cancelado;
    } else if (estado.includes("Pendiente")) {
      return styles.pendiente;
    } else if (entrega && estado === "Entregado") {
      return styles.entregado;
    } else if (estado === "Impreso" || estado === "Reimpreso") {
      return styles.impreso;
    } else {
      return styles.despachado;
    }
  };

  const obtenerLabel = (item) => {
    const { estado, entrega, espera } = item;
    if (estado === "Cancelado") {
      return { id: "C", nombre: "Cancelado" };
    } else if (entrega && estado === "Entregado") {
      return { id: "E", nombre: "Entregado" };
    } else if (espera && estado.includes("Pendiente")) {
      return { id: "P", nombre: "Aprobado" };
    } else if (estado.includes("Pendiente")) {
      return { id: "P", nombre: "Pend. Aprobación" };
    } else if (estado === "Impreso" || estado === "Reimpreso") {
      return { id: "A", nombre: "Preparación" };
    } else {
      return { id: "D", nombre: "Despachado" };
    }
  };

  //Metodo para crear la descripción que se muestra del pedido
  const descripcionNotify = (item) => {
    const { cliente, domiciliario, total, movimiento, comentario, espera } =
      item;
    let estado = obtenerLabel(item);
    let descripcion = "";
    if (estado) {
      descripcion = descripcion + `Estado: ${estado.nombre} `;
    }

    if (total) {
      descripcion = descripcion + `Total: ${formatoPrecio(total)} \n`;
      if (espera) {
        const hora = `${espera.hora > 0 ? espera.hora + " Hora" : ""}`;
        const minutos = `${espera.minutos > 0 ? espera.minutos + " Min" : ""}`;
        descripcion = descripcion + `Tiempo de entrega: ${hora}${minutos} \n`;
      }
    }

    if (movimiento) {
      descripcion =
        descripcion +
        `Ultima Actualización: ${moment(movimiento).format("h:mm a")}\n`;
    }

    if (domiciliario) {
      descripcion = descripcion + `Domiciliario: ${domiciliario.nombre}\n`;
    }

    if (comentario) {
      descripcion = descripcion + `Motivo Cancelación: ${comentario}\n`;
    }

    if (cliente) {
      descripcion =
        descripcion +
        `Dirección: ${capitalize(cliente.direccion)} (${
          cliente.barrio.nombre
        }-${cliente.barrio.municipio.nombre})\n`;
    }

    return descripcion;
  };

  //Metodo para cargar las notificaciones del cliente
  const cargarNotificaciones = ({ item }) => {
    let estado = obtenerLabel(item);

    return (
      <Card
        style={{
          margin: normalize(5),
          paddingBottom: normalize(10, "height"),
          paddingTop: normalize(5, "height"),
          paddingRight: normalize(30),
        }}
      >
        <Card.Title
          key={item.id}
          title={`${moment(item.fecha).format("DD-MM-YYYY h:mm a")}\n`}
          titleStyle={{ fontSize: normalize(16) }}
          subtitle={descripcionNotify(item)}
          subtitleStyle={{ fontSize: normalize(15) }}
          subtitleNumberOfLines={5}
          left={() => (
            <View style={styles.estado}>
              <Avatar.Text
                size={normalize(40)}
                label={estado.id}
                style={obtenerColor(item)}
              />
            </View>
          )}
        />
        <Card.Actions style={{ alignSelf: "flex-end", paddingBottom: 0 }}>
          <TouchableNativeFeedback
            onPress={() => {
              setDetallePedido(item);
              setModalDetalle(true);
            }}
          >
            <Button
              theme={{
                colors: {
                  primary: Colors.text,
                },
              }}
            >
              Detalle Pedido
            </Button>
          </TouchableNativeFeedback>
          {estado.id.includes("P") && (
            <TouchableNativeFeedback
              onPress={() => {
                setDetallePedido(item);
                setModal(true);
              }}
            >
              <Button
                theme={{
                  colors: {
                    primary: Colors.button,
                  },
                }}
              >
                Cancelar Pedido
              </Button>
            </TouchableNativeFeedback>
          )}
        </Card.Actions>
      </Card>
    );
  };

  //Metodo para cargar el detalle del pedido del cliente
  const detalleProductos = () => {
    return (detallePedido?.productos || []).map((item) => {
      let totalP = item.precio * item.cantidad;
      let descripcion = `Producto: ${item.nombre}, Cantidad: ${
        item.cantidad
      }, Total: ${formatoPrecio(totalP)}`;
      return (
        <Text
          style={{
            fontSize: normalize(16),
            marginBottom: normalize(5, "height"),
          }}
        >
          {descripcion}
        </Text>
      );
    });
  };

  return (
    <View>
      <FlatList
        ItemSeparatorComponent={() => <Divider />}
        data={pedidos}
        renderItem={cargarNotificaciones}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="slide"
        visible={modalDetalle}
        transparent={true}
        onRequestClose={() => setModalDetalle(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setModalDetalle(false)}
          accessible={false}
        >
          <View style={styles.containerModal}>
            <View style={styles.modal}>
              <Text
                style={{
                  fontSize: normalize(18),
                  marginBottom: normalize(15, "height"),
                  fontWeight: "bold",
                  color: Colors.primary,
                }}
              >
                Detalle Pedido
              </Text>
              <View style={styles.input}>{detalleProductos()}</View>
              <Text
                style={{
                  fontSize: normalize(16),
                  marginBottom: normalize(5, "height"),
                }}
              >{`Domicilio: ${formatoPrecio(
                detallePedido?.cliente?.barrio.valor
              )}`}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="slide"
        visible={modal}
        transparent={true}
        onRequestClose={limpiarDatos}
      >
        <TouchableWithoutFeedback
          onPress={() => setModal(false)}
          accessible={false}
        >
          <View style={styles.containerModal}>
            <View style={styles.modal}>
              <View style={styles.input}>
                <Text
                  style={{
                    fontSize: normalize(18),
                    marginBottom: normalize(15, "height"),
                  }}
                >
                  Ingrese el Motivo de Cancelación
                </Text>
                <TextInput
                  error={formik.errors.comentario && formik.touched.comentario}
                  theme={{
                    colors: {
                      primary: Colors.primary,
                    },
                  }}
                  id="comentario"
                  label="Motivo"
                  value={formik.values.comentario}
                  onChangeText={formik.handleChange("comentario")}
                  onBlur={formik.handleBlur("comentario")}
                />
                {formik.errors.comentario && formik.touched.comentario && (
                  <Text style={styles.error}>{formik.errors.comentario}</Text>
                )}
              </View>
              <TouchableNativeFeedback onPress={formik.handleSubmit}>
                <Button
                  theme={{
                    colors: {
                      primary: Colors.button,
                    },
                  }}
                  mode="contained"
                >
                  Cancelar Pedido
                </Button>
              </TouchableNativeFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Toast
        ref={toastRef}
        style={styles.toast}
        positionValue={normalize(toast, "height")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: normalize(30),
  },
  containerModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(218,218,218, 0.9)",
  },
  modal: {
    backgroundColor: "rgba(255,255,255, 1)",
    marginHorizontal: normalize(10),
    paddingHorizontal: normalize(30),
    paddingVertical: normalize(50, "height"),
  },
  input: {
    marginBottom: normalize(30, "height"),
  },
  estado: {
    justifyContent: "center",
    marginHorizontal: 5,
  },
  despachado: {
    backgroundColor: "#2980B9",
  },
  entregado: {
    backgroundColor: Colors.success,
  },
  pendiente: {
    backgroundColor: "#E67E22",
  },
  cancelado: {
    backgroundColor: "#E74C3C",
  },
  impreso: {
    backgroundColor: "#2C3E50",
  },
  button: {
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
});

export default Notificacion;
