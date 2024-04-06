import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { LogBox } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { EtherProvider } from "../ContractConexion/EtherProvider";
import { useAccount, useContractWrite } from "wagmi";


export default function CamaraQR() {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(true);
    const navigation = useNavigation();
    const { address } = useAccount();
    const { contractAddress, ABI } = EtherProvider();

    const { writeAsync } = useContractWrite({
        address: contractAddress,
        abi: ABI,
    })

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        try {
            const dataParsed = JSON.parse(data);
            const { tokenId, worker } = dataParsed;
            if (worker !== address && worker !== "0x0000000000000000000000000000000000000000") {
                alert("El contrato no es para esta cuenta.");
                console.log(worker);
                navigation.goBack();
                return;

            }
            setScanned(true);

            const tx = await writeAsync({
                functionName: "signContract",
                args: [
                    tokenId,
                ],
            });
            console.log(tx);

            alert(`Contrato ${tokenId} Firmado con éxito.`);
            navigation.navigate("Home1");
        } catch (error) {
            console.error("Error al firmar el contrato:", error);
            alert("El contrato no se ha podido firmar. Inténtalo de nuevo.");
        }
    };

    if (hasPermission === null) {
        return <Text>Accediendo a permisos del dispositivo...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Sin acceso a cámara</Text>;
    }

    LogBox.ignoreLogs(["BarCodeScanner has been deprecated and will be removed in a future SDK version. Please use `expo-camera` instead."]);

    return (
        <View style={styles.container}>
            {isScannerVisible && (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});



