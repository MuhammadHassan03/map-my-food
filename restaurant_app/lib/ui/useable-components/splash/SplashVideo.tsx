/* eslint-disable @typescript-eslint/no-require-imports */
import { ResizeMode, Video } from "expo-av";
import { StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import { use } from "i18next";

export default function SplashVideo({ onLoaded, onFinish }) {
  const video = useRef(null);
  const [lastStatus, setStatus] = useState({});
 
  useEffect(() => {
    onLoaded();
    onFinish();
  }, [onLoaded, onFinish]);
  return (
    <></>
  );
}
