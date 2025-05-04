import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

export default function SplashVideo({ onLoaded, onFinish }) {
  const video = useRef(null);
  const [lastStatus, setStatus] = useState({
    isLoaded: false,
    didJustFinish: false,
  });

  useEffect(() => {
    onLoaded();
    onFinish();
  }, [onLoaded, onFinish]);

  return (
   <></>
  );
}
