import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        width: "99%",
        alignSelf: 'center',
        borderRadius: 16,
        height: 95,
        padding: 16,
        justifyContent: 'space-between',
        backgroundColor: "#FFFFFF",
        elevation: 2,
        borderWidth: 1,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    statusBadge: {
        paddingHorizontal: 10, // Um pouco mais de respiro lateral
        paddingVertical: 4,
        borderRadius: 8, // Arredondamento do badge também
    },

    statusText: {
        color: '#fff',
        fontSize: 11, // Aumentei levemente para legibilidade
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    nameText: {
        fontSize: 16,
        fontWeight: "bold",
    },

    dateText: {
        fontSize: 12,
    },

    priceText: {
        fontSize: 18,
        fontWeight: "800",
    },
});