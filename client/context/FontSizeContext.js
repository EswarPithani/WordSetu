// context/FontSizeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FontSizeContext = createContext();

const sizeMap = {
  Small: 14,
  Medium: 18,
  Large: 22,
};

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState("Medium");

  useEffect(() => {
    const loadFontSize = async () => {
      const stored = await AsyncStorage.getItem("fontSize");
      if (stored) setFontSize(stored);
    };
    loadFontSize();
  }, []);

  const changeFontSize = async (size) => {
    setFontSize(size);
    await AsyncStorage.setItem("fontSize", size);
  };

  return (
    <FontSizeContext.Provider
      value={{ fontSize, changeFontSize, sizeValue: sizeMap[fontSize] }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
