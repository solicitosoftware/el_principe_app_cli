import React, { useReducer } from "react";
import firebase, { FirebaseContext } from "./firebase";
import CanastaContext from "./components/Context/canastaContext";
import { useCanasta } from "./components/Context/canastaProvider";
import auth from "@react-native-firebase/auth";
import { View, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Icon, Badge } from "react-native-elements";
import normalize from "react-native-normalize";
import Colors from "../app/theme/colors";
// Se importan los screens para crear la navegación
import Login from "./components/Login/login.screen";
import Home from "./components/Home/home.screen";
import Productos from "./components/Productos/productos.screen";
import Canasta from "./components/Canasta/canasta.screen";
import RegistroDatos from "./components/Registro/registro.screen";
import Direccion from "./components/Direcciones/direcciones.screen";
import Notificacion from "./components/Notificaciones/notificacion.screen";
// uso de useContext para canasta y notificaciones
import canastaReducer, {
  initialValueCanasta,
} from "./components/Context/canastaReducer";
import DeviceInfo from "react-native-device-info";
import store from "./redux/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { initialLogin, logout } from "./redux/reducers/loginReducer";
import {
  estadoProceso,
  initialClientes,
} from "./redux/reducers/clientesReducer";
import CargueInicial from "./components/global";
import { initialCambios } from "./redux/reducers/notificacionReducer";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//Metodo para redireccionar a whatsapp
const renderWhatsapp = () => {
  let link = "https://wa.link/zzmge3";
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

//Logo den banner superior
const Logo = () => {
  return (
    <View
      style={{
        marginLeft: normalize(20),
        paddingBottom: normalize(DeviceInfo.getSystemName() === "iOS" ? 15 : 5),
      }}
    >
      <Image
        source={require("./assets/LogoPrincipe2.png")}
        style={{ width: normalize(155), height: normalize(38, "height") }}
        resizeMode="stretch"
      />
    </View>
  );
};

const BarraSuperior = ({ nav }) => {
  const dispatch = useDispatch();

  const cambios = useSelector(initialCambios);

  const cliente = useSelector(initialClientes);

  return (
    Object.values(cliente.data || {}).length > 0 && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: normalize(160),
          paddingBottom: normalize(
            DeviceInfo.getSystemName() === "iOS" ? 15 : 5
          ),
          marginRight: normalize(10),
        }}
      >
        <Icon
          raised
          type="evilicon"
          name="comment"
          size={normalize(25)}
          color={Colors.primary}
          onPress={renderWhatsapp}
        />
        {cambios > 0 ? (
          <View>
            <Icon
              raised
              type="evilicon"
              name="bell"
              size={normalize(25)}
              color={Colors.primary}
              onPress={() => {
                nav.navigate("notificacion");
              }}
            />
            <Badge
              value={cambios}
              status="error"
              containerStyle={{ position: "absolute", top: 8, right: 8 }}
            />
          </View>
        ) : (
          <Icon
            raised
            type="evilicon"
            name="bell"
            size={normalize(25)}
            color={Colors.primary}
            onPress={() => {
              nav.navigate("notificacion");
            }}
          />
        )}
        <Icon
          raised
          type="evilicon"
          name="external-link"
          size={normalize(25)}
          color={Colors.primary}
          onPress={() => {
            dispatch(logout());
          }}
        />
      </View>
    )
  );
};

//importación de vistas para navegación
const HomeScreen = ({ route }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        initialParams={route.params}
        component={Home}
        options={({ navigation }) => ({
          title: "",
          headerTitleStyle: { fontSize: normalize(20) },
          headerLeft: () => <Logo />,
          headerRight: () => (
            <BarraSuperior nav={navigation} params={route.params} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const LoginScreen = ({ route }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
        component={Login}
        initialParams={route.params}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const RegisterScreen = ({ route }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="registroDatos"
        component={RegistroDatos}
        options={({ navigation }) => ({
          title: "Crear Cuenta",
          headerTitleStyle: { fontSize: normalize(20) },
          headerLeft: () => (
            <Icon
              iconStyle={{ marginLeft: normalize(10) }}
              name="chevron-left"
              size={normalize(40)}
              onPress={() => {
                auth().signOut();
                navigation.goBack();
              }}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const ProductosScreen = ({ route }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="productos"
        component={Productos}
        initialParams={route.params}
        options={({ navigation }) => ({
          title: "",
          headerLeft: () => <Logo />,
          headerRight: () => (
            <BarraSuperior nav={navigation} params={route.params} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const CanastaScreen = ({ route }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="canasta"
        component={Canasta}
        initialParams={route.params}
        options={({ navigation }) => ({
          title: "",
          headerLeft: () => <Logo />,
          headerRight: () => (
            <BarraSuperior nav={navigation} params={route.params} />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

const Tabs = ({ route }) => {
  const canasta = useCanasta();

  const login = useSelector(initialLogin);

  const cliente = useSelector(initialClientes);

  const estado = useSelector(estadoProceso);

  return (
    <Tab.Navigator
      initialRouteName="canastaTab"
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "black",
      }}
    >
      <Tab.Screen
        name="productosTab"
        component={ProductosScreen}
        initialParams={route.params}
        options={() => ({
          headerShown: false,
          tabBarLabel: "Productos",
          tabBarIcon: ({ color }) => (
            <Icon
              type="evilicon"
              name="navicon"
              size={normalize(30)}
              color={color}
            />
          ),
        })}
      />
      <Tab.Screen
        name="canastaTab"
        component={
          Object.values(cliente.data || {}).length > 0
            ? CanastaScreen
            : Object.values(login).length === 0 || estado.isLoading
            ? LoginScreen
            : RegisterScreen
        }
        initialParams={route.params}
        options={() => ({
          headerShown: false,
          tabBarLabel: "Canasta",
          tabBarIcon: ({ color }) =>
            canasta.length > 0 ? (
              <View>
                <Icon
                  type="evilicon"
                  name="cart"
                  size={normalize(30)}
                  color={color}
                />
                <Badge
                  value={canasta.length}
                  status="error"
                  containerStyle={{ position: "absolute", top: -8, right: -8 }}
                />
              </View>
            ) : (
              <Icon
                type="evilicon"
                name="cart"
                size={normalize(30)}
                color={color}
              />
            ),
        })}
      />
      {Object.values(cliente.data || {}).length > 0 && (
        <Tab.Screen
          name="homeTab"
          component={HomeScreen}
          initialParams={route.params}
          options={() => ({
            headerShown: false,
            tabBarLabel: "Perfil",
            tabBarIcon: ({ color }) => (
              <Icon
                type="evilicon"
                name="user"
                size={normalize(30)}
                color={color}
              />
            ),
          })}
        />
      )}
    </Tab.Navigator>
  );
};

//Inicio de la App
const App = () => {
  return (
    // uso de useContext para conexión con firebase
    <FirebaseContext.Provider value={{ firebase }}>
      <Provider store={store}>
        <CanastaContext.Provider
          value={useReducer(canastaReducer, initialValueCanasta)}
        >
          <NavigationContainer>
            <CargueInicial />
            <Stack.Navigator initialRouteName="tabs">
              <Stack.Screen
                name="tabs"
                component={Tabs}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="direccion"
                component={Direccion}
                options={({ navigation }) => ({
                  title: "Editar Direcciones",
                  headerTitleStyle: { fontSize: normalize(20) },
                  headerLeft: () => (
                    <Icon
                      iconStyle={{ marginLeft: normalize(10) }}
                      name="chevron-left"
                      size={normalize(40)}
                      onPress={() => {
                        navigation.goBack();
                      }}
                    />
                  ),
                })}
              />
              <Stack.Screen
                name="notificacion"
                component={Notificacion}
                options={({ navigation }) => ({
                  title: "Notificaciones",
                  headerTitleStyle: { fontSize: normalize(20) },
                  headerLeft: () => (
                    <Icon
                      iconStyle={{ marginLeft: normalize(10) }}
                      name="chevron-left"
                      size={normalize(40)}
                      onPress={() => {
                        navigation.goBack();
                      }}
                    />
                  ),
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CanastaContext.Provider>
      </Provider>
    </FirebaseContext.Provider>
  );
};

export default App;
