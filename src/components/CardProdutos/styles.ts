import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const SPACING = 16;
const CARD_WIDTH = (width - SPACING * 4) / 2;

export const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 90,
        borderRadius: 8,
        overflow: "hidden", // importante pro borderRadius funcionar
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)", // escurece a imagem
        borderRadius: 8,


    },

    content: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 12,
    },

    nameText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    priceText: {
        fontSize: 14,
        fontWeight: "bold",
    },

});