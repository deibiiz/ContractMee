import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import Boton from "../components/Boton";
import '@walletconnect/react-native-compat'
import { useWeb3Modal } from '@web3modal/wagmi-react-native'
import { useAccount, useDisconnect, useContractWrite } from 'wagmi'
//import "react-native-get-random-values"
//import "@ethersproject/shims"
import { ethers } from "ethers";
import { EtherProvider } from "../ContractConexion/EtherProvider";


export default function LoginWallet() {
    const { open } = useWeb3Modal()
    const { disconnect } = useDisconnect()
    const { isConnected, address } = useAccount()
    const [TxHash, setTxHash] = useState('');
    const [balance, setBalance] = useState(0);
    const [events, setEvents] = useState([]);
    const { contract, provider, contractAddress, ABI } = EtherProvider();

    console.log('Estado de conexión:', isConnected ? 'Conectado' : 'Desconectado');

    const { writeAsync } = useContractWrite({
        address: '0x3eA2717cf5AE3ccc89d868fB317aE938b6aC8EBc',
        abi: ABI,
        functionName: 'mint',
    })

    async function writeToContract() {
        // Asegúrate de tener una dirección desde la cual estás enviando la transacción.
        if (!address) {
            console.error("Billetera no conectada");
            return;
        }

        // Asume que ya tienes definidos o puedes obtener los valores para _to, _salary, _start, _duration, _description, _title
        const _to = "0x922Fd344AE304f3baC6b2f5f459E056ADFC2cf24"; // Por ejemplo, usar la dirección conectada
        const _salary = ethers.utils.parseEther('0.001'); // Convertir 1 ether a wei, ajusta según necesidad
        const _salaryNumber = Number(_salary); // Convertir 1 ether a wei, ajusta según necesidad
        const _start = Number(1); // Fecha de inicio en segundos desde epoch, ajusta según necesidad
        const _duration = Number(360000); // Duración en segundos, ajusta según necesidad
        const _description = "Description of the minted item2"; // Descripción
        const _title = "Title of the minted item2"; // Título

        const tx = await writeAsync({
            args: [
                _to,
                _salaryNumber,
                _start,
                _duration,
                _description,
                _title,
            ],
            value: _salaryNumber,
        });

        console.log(tx);
        setTxHash(tx.hash);
    }





    useEffect(() => {
        const fetchBalance = async () => {
            const balanceInWei = await provider.getBalance(address);
            const balanceInEther = ethers.utils.formatEther(balanceInWei);
            setBalance(balanceInEther);
            console.log(balanceInEther);
        };

        if (address) {
            fetchBalance();
        }
    }, [address, provider]);


    useEffect(() => {
        if (address) {
            getAccountHistory(address).then(events => {
                setEvents(events);
            }).catch(error => {
                console.error("Error al obtener el historial de la cuenta", error);
                alert("Error al obtener el historial de la cuenta");
            });
        }
    }, [address]);

    const getAccountHistory = async (accoutAddress) => {

        let allEvents = [];

        const SalaryReleasedFilter = contract.filters.SalaryReleased(null, null, accoutAddress);
        const TokenMintedFilter = contract.filters.TokenMinted(null, accoutAddress);
        const ContractCancelledFilter = contract.filters.ContractCancelled(null, accoutAddress);
        const ApprovalChangesFilter = contract.filters.ApprovalChanges(null, accoutAddress);

        const SalaryReleasedEvents = await contract.queryFilter(SalaryReleasedFilter, 0, "latest");
        const TokenMintedEvents = await contract.queryFilter(TokenMintedFilter, 0, "latest");
        const ContractCancelledEvents = await contract.queryFilter(ContractCancelledFilter, 0, "latest");
        const ApprovalChangesEvents = await contract.queryFilter(ApprovalChangesFilter, 0, "latest");

        const addEvents = (events, type) => {
            events.forEach(event => {
                const eventData = {
                    type: type,
                    tokenId: event.args.tokenId.toString(),
                    salary: ethers.utils.formatEther(event.args.salary.toString()),
                    date: new Date(event.args.timestamp * 1000).toLocaleString(),
                };
                allEvents.push(eventData);
            });
        };

        addEvents(SalaryReleasedEvents, "SalaryReleased");
        addEvents(TokenMintedEvents, "TokenMinted");
        addEvents(ContractCancelledEvents, "ContractCancelled");
        addEvents(ApprovalChangesEvents, "ApprovalChanges");

        allEvents.sort((a, b) => b.date - a.date);

        return allEvents;
    };

    const eventToText = (eventType) => {
        switch (eventType) {
            case "TokenMinted":
                return "Cración contrato";
            case "ContractCancelled":
                return "Contrato cancelado";
            case "ApprovalChanges":
                return "Modificación salario";
            case "SalaryReleased":
                return "Cobro salario";
            default:
                return eventType;
        }
    };


    return (
        <View style={styles.container} >
            <View style={styles.card}>
                {TxHash &&
                    <Text>
                        Transaction: {TxHash}
                    </Text>
                }
                <Boton
                    onPress={writeToContract}
                    texto={"write"}
                    estiloBoton={
                        {
                            borderRadius: 5,
                            marginTop: 0,
                            width: "100%",
                        }
                    }
                />

                <Boton
                    onPress={!isConnected ? open : disconnect}
                    texto={isConnected ? 'Disconnect' : 'Connect'}
                    estiloBoton={
                        {
                            borderRadius: 5,
                            marginTop: 1,
                            width: "100%",
                        }
                    } />
                {isConnected && (
                    <>
                        <Text style={styles.text}>{address}</Text>
                    </>
                )}
                <Text style={styles.balanceText}> {balance} ETH</Text>
            </View>

            <View style={[styles.card, styles.eventsContainer]}>
                <FlatList
                    data={events}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        if (item.type !== "ApprovalChanges" || (item.type === "ApprovalChanges" && item.salary !== item.newSalary)) {
                            return (
                                <View style={styles.contractItem}>

                                    <View style={{ flexDirection: "row" }}>
                                        <Text>{eventToText(item.type)}</Text>
                                        <Text>  ID: {item.tokenId}</Text>
                                    </View>

                                    {item.type === "TokenMinted" && (
                                        <View>
                                            <Text style={styles.lossesText}>-{item.salary} ETH</Text>
                                            <Text style={styles.textoFecha}>{item.date} </Text>
                                        </View>)}

                                    {item.type === "ContractCancelled" && (
                                        <View>
                                            <Text style={styles.profitText}>+{item.salary} ETH</Text>
                                            <Text style={styles.textoFecha}>{item.date} </Text>
                                        </View>)}


                                    {item.type === "ApprovalChanges" && (
                                        <View>
                                            {item.newSalary < item.salary ? (
                                                <>
                                                    <Text style={styles.profitText}>+{item.salary - item.newSalary} ETH</Text>
                                                    <Text style={styles.textoFecha}>{item.date} </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Text style={styles.lossesText}>-{item.newSalary - item.salary} ETH</Text>
                                                    <Text style={styles.textoFecha}>{item.date} </Text>
                                                </>
                                            )}
                                        </View>
                                    )}

                                    {item.type === "SalaryReleased" && (
                                        <View>
                                            <Text style={styles.profitText}>+{item.salary} ETH</Text>
                                            <Text style={styles.textoFecha}>{item.date} </Text>
                                        </View>
                                    )}

                                </View>
                            );
                        } else {
                            return null;
                        }
                    }}
                    ListEmptyComponent={<Text style={styles.textoAviso}>No hay eventos registrados para esta cuenta.</Text>}
                />
            </View>
        </View >
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#f5f5f5"
    },
    card: {
        backgroundColor: "white",
        width: "100%",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.3,
        elevation: 2,
        marginVertical: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 14
    },
    accountText: {
        fontSize: 16,
        marginTop: 10
    },
    balanceText: {
        fontSize: 16,
        color: "#4caf50",
        marginTop: 5,
        fontWeight: "bold",
        textAlign: "center",
    },
    contractItem: {
        backgroundColor: "#f0f0f0",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        textAlign: "center"
    },
    eventsContainer: {
        flex: 1,
        marginTop: 0
    },
    profitText: {
        fontSize: 16,
        color: "green",
        fontWeight: "bold",
    },
    lossesText: {
        fontSize: 16,
        color: "red",
        fontWeight: "bold"
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
    textoFecha: {
        fontSize: 14,
        color: "#586069",
        textAlign: "right",
    },
    text: {
        fontSize: 16,
        color: "#586069",
        marginBottom: 5,
        marginTop: 20,
        fontWeight: "bold",
        textAlign: "center",
        paddingHorizontal: 10,
    }
});
