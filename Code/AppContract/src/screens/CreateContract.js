import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import { web3, MyContract1 } from "../ether/web3.js"; // Asegúrate de que la ruta es correcta

export default function CreateContract() {
    const [recipient, setRecipient] = useState('');
    const [salary, setSalary] = useState('');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [mintStatus, setMintStatus] = useState('');

    const mintContract = async () => {
        if (!recipient || !salary || !duration || !description) {
            alert('Por favor, introduce todos los datos.');
            return;
        }

        try {
            const accounts = await web3.eth.getAccounts();
            const parsedSalary = web3.utils.toWei(salary, 'ether');
            const parsedDuration = Number(duration);
            const result = await MyContract1.methods.mint(recipient, parsedSalary, parsedDuration, description)
                .send({ from: accounts[0], value: parsedSalary, gas: 1000000 });
            setMintStatus(`Contrato creado con el ID: ${result.events.Transfer.returnValues.tokenId}`);
        } catch (error) {
            console.error("Error al interactuar con el contrato:", error);
            setMintStatus("Error al crear el contrato");
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                onChangeText={setRecipient}
                value={recipient}
                placeholder="Introduce la dirección del destinatario"
            />
            <TextInput
                style={styles.input}
                onChangeText={setSalary}
                value={salary}
                placeholder="Introduce el salario"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                onChangeText={setDuration}
                value={duration}
                placeholder="Introduce la duración del contrato"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                onChangeText={setDescription}
                value={description}
                placeholder="Introduce la descripción"
            />
            <Button
                title="Crear Contrato"
                onPress={mintContract}
            />
            <Text>{mintStatus}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: '80%'
    },
});
