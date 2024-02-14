import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from "react-native";
import { MyContract1 } from "../ether/web3.js";
import Boton from "../components/Boton.js";
import { useAccount } from "../components/ContextoCuenta";
import { useNavigation } from "@react-navigation/native";

export default function SignContract() {
    const [tokenId, setTokenId] = useState('');
    const [signStatus, setSignStatus] = useState('');
    const { selectedAccount } = useAccount();
    const [unsignedContracts, setUnsignedContracts] = useState([]);
    navigation = useNavigation();

    if (!selectedAccount) {
        alert('Por favor, inicia sesión en MetaMask y selecciona una cuenta.');
    }


    const fetchUnsignedContracts = async () => {
        if (selectedAccount) {
            try {
                const contractIds = await MyContract1.methods.getUnsignedContractsOfWorker(selectedAccount).call();
                const formattedIds = contractIds.map(id => id.toString());
                setUnsignedContracts(formattedIds);
            } catch (error) {
                console.error("Error al obtener contratos sin firmar:", error);
            }
        }
    };

    useEffect(() => {
        fetchUnsignedContracts();
    }, [selectedAccount]);



    return (
        <View style={styles.fullContainer}>
            <Text style={styles.title}>Contratos pendintes de firma</Text>
            {
                unsignedContracts.length === 0 && <Text style={styles.textoAviso} >No hay contratos pendientes de firma.</Text>
            }
            <FlatList
                data={unsignedContracts}
                keyExtractor={item => item.toString()}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            style={styles.contractItem}
                            onPress={() => navigation.navigate('infoContract', { tokenId: item, fromWorkerSection: true })}
                        >
                            <Text>Contrato ID: {item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({

    fullContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'stretch',
    },
    contractItem: {
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#ccc',
        width: '85%',
        alignSelf: 'center'
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 17,
        marginTop: 10,
        alignSelf: 'center',

    },
    textoAviso: {
        fontSize: 17,
        color: "#586069",
        marginBottom: 20,
        marginTop: 20,
        fontStyle: "italic",
        textAlign: "center",
        paddingHorizontal: 10,
    },

});