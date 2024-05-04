import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, Text, FlatList, ScrollView } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { TouchableOpacity, GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAccount } from "../components/ContextoCuenta";
import { MyContract } from "../ContractConexion/EtherProvider";


const initialLayout = { width: Dimensions.get("window").width };

const EmployerScreen = ({ contracts, showFinalizedContracts, setShowFinalizedContracts, finalizedOwnerContracts }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <FlatList
                data={contracts}
                keyExtractor={item => item}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            style={styles.contractItem}
                            onPress={() => navigation.navigate("infoContract", { tokenId: item, fromWorkerSection: false })}
                        >
                            <Text>Contrato ID: {item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                onPress={() => setShowFinalizedContracts(!showFinalizedContracts)}
                style={styles.desplegable}
            >
                <Text style={styles.textoBoton} >Mostrar Contratos Finalizados</Text>
            </TouchableOpacity>

            {showFinalizedContracts && (
                <FlatList
                    data={finalizedOwnerContracts}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.contractItem}
                            onPress={() => navigation.navigate("infoContract", { tokenId: item, fromWorkerSection: false })}
                        >
                            <Text>Contrato ID: {item}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const WorkerScreen = ({ contracts, showFinalizedContracts, setShowFinalizedContracts, finalizedWorkerContracts }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <FlatList
                data={contracts}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.contractItem}
                        onPress={() => navigation.navigate("infoContract", { tokenId: item, fromWorkerSection: true })}
                    >
                        <Text>Contrato ID: {item}</Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                onPress={() => setShowFinalizedContracts(!showFinalizedContracts)}
                style={styles.desplegable}
            >
                <Text style={styles.textoBoton}>Mostrar Contratos Finalizados</Text>
            </TouchableOpacity>

            {showFinalizedContracts && (
                <FlatList
                    data={finalizedWorkerContracts}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.contractItem}
                            onPress={() => navigation.navigate("infoContract", { tokenId: item, fromWorkerSection: true })}
                        >
                            <Text>Contrato ID: {item}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};




export default function OwnerContracts() {

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "employer", title: "Contratos como Empleador" },
        { key: "worker", title: "Contratos como Trabajador" },
    ]);
    const [employerContracts, setEmployerContracts] = useState([]);
    const [workerContracts, setWorkerContracts] = useState([]);
    const [fetchStatus, setFetchStatus] = useState('');

    const [showFinalizedContracts, setShowFinalizedContracts] = useState(false);
    const [finalizedOwnerContracts, setFinalizedOwnerContracts] = useState([]);
    const [finalizedWorkerContracts, setFinalizedWorkerContracts] = useState([]);

    const { selectedAccount } = useAccount();

    const loadAccountAndContracts = async () => {
        try {
            if (selectedAccount) {
                await fetchOwnerContracts(selectedAccount);
                await fetchSignedContracts(selectedAccount);
            } else {
                setFetchStatus("No se encontraron cuentas.");
            }
        } catch (error) {
            console.error("Error al cargar los contratos:", error);
            setFetchStatus("Error al cargar los contratos");
        }

        if (!selectedAccount) {
            alert("Por favor, inicia sesión con tu billetera y selecciona una cuenta.");
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAccountAndContracts();
        }, [selectedAccount])
    );


    const fetchOwnerContracts = async (account) => {
        if (!account) {
            alert("No se encontró la dirección de la cuenta.");
            return;
        }

        try {
            const contractsList = await MyContract.methods.getContractsFromOwner(account).call();
            let signedOwnerContracts = [];
            let pendingOwnerContracts = [];
            let finalizedOwnerContracts = [];

            for (let contractId of contractsList) {
                const isFinished = await MyContract.methods.isContractFinished(contractId).call();
                const isSigned = await MyContract.methods.isContractSigned(contractId).call();

                if (!isFinished) {
                    if (isSigned) {
                        signedOwnerContracts.push(contractId.toString());
                    } else {
                        pendingOwnerContracts.push(contractId.toString());
                    }
                } else {
                    finalizedOwnerContracts.push(contractId.toString());
                }
            }

            setEmployerContracts(signedOwnerContracts.concat(pendingOwnerContracts));
            setFinalizedOwnerContracts(finalizedOwnerContracts);


        } catch (error) {
            console.error("Error al obtener los contratos:", error);
            setFetchStatus("Error al buscar los contratos");
        }
    };

    const fetchSignedContracts = async (account) => {
        if (!account) {
            alert("No se encontró la dirección de la cuenta.");
            return;
        }

        try {
            const contractsList = await MyContract.methods.getContractsOfWorker(account).call();
            let signedWorkerContracts = [];
            let pendingWorkerContracts = [];
            let finalizedWorkerContracts = [];

            for (let contractId of contractsList) {
                const isFinished = await MyContract.methods.isContractFinished(contractId).call();
                const isSigned = await MyContract.methods.isContractSigned(contractId).call();

                if (!isFinished) {
                    if (isSigned) {
                        signedWorkerContracts.push(contractId.toString());
                    } else {
                        pendingWorkerContracts.push(contractId.toString());
                    }
                } else {
                    finalizedWorkerContracts.push(contractId.toString());
                }
            }

            setWorkerContracts(signedWorkerContracts.concat(pendingWorkerContracts));
            setFinalizedWorkerContracts(finalizedWorkerContracts);

        } catch (error) {
            console.error("Error al obtener los contratos firmados:", error);
        }
    };


    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'employer':
                return <EmployerScreen

                    contracts={employerContracts}
                    showFinalizedContracts={showFinalizedContracts}
                    setShowFinalizedContracts={setShowFinalizedContracts}
                    finalizedOwnerContracts={finalizedOwnerContracts}
                />;
            case 'worker':
                return <WorkerScreen
                    contracts={workerContracts}
                    showFinalizedContracts={showFinalizedContracts}
                    setShowFinalizedContracts={setShowFinalizedContracts}
                    finalizedWorkerContracts={finalizedWorkerContracts}

                />;
            default:
                return null;
        }
    };

    const renderTabBar = props => (
        <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.Bar}
            labelStyle={styles.barText}
            activeColor={'#164863'}
            inactiveColor={'#9AA5A7'}
        />
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'stretch',
    },
    Bar: {
        backgroundColor: '#fff',
    },
    indicator: {
        backgroundColor: 'black',
    },
    barText: {
        fontWeight: 'bold',
        fontSize: 13,
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
    desplegable: {
        backgroundColor: '#164863',
        padding: 10,
        borderRadius: 5,
        marginTop: 30,
        marginBottom: 15,
        width: '85%',
        alignSelf: 'center',
        alignItems: 'center'
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold'
    },
});



