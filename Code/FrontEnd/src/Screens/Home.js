import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Boton from "../components/Boton";

const Home = () => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Boton
                texto="Crear Contrato"
                onPress={() => navigation.navigate('CreateContract')}
                estiloBoton={
                    {
                        borderRadius: 5,
                        marginTop: 0,
                        width: 300,
                    }
                }
            />
            <Boton
                texto="Firmar Contrato"
                onPress={() => navigation.navigate('SignContract')}
                estiloBoton={
                    {
                        borderRadius: 5,
                        marginTop: 10,
                        width: 300,
                    }
                }
            />
            <Boton
                texto="Buscar Contratos"
                onPress={() => navigation.navigate('SearchContract')}
                estiloBoton={
                    {
                        borderRadius: 5,
                        marginTop: 10,
                        width: 300,
                    }
                }
            />
            <Boton
                texto="Mis Contratos"
                onPress={() => navigation.navigate('ShowContract')}
                estiloBoton={
                    {
                        borderRadius: 5,
                        marginTop: 10,
                        width: 300,
                    }
                }
            />
        </View>
    );
}

export default Home;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
