// import 'expo-dev-client'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

export default function AnimatedSplashScreen({ children }) {
  const opacityAnimation = useSharedValue(1)
  const scaleAnimation = useSharedValue(1)
  const [isAppReady, setAppReady] = useState(false)
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false)
  const [isImageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (isAppReady && isImageLoaded) {
      opacityAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp)
      })

      scaleAnimation.value = withTiming(
        2,
        {
          duration: 300,
          easing: Easing.out(Easing.exp)
        },
        () => {
          runOnJS(setAnimationComplete)(true)
        }
      )
    }
  }, [isAppReady, isImageLoaded])

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync()
      await Promise.all([]) // Simulate loading
    } catch (e) {
      // Handle errors
    } finally {
      setAppReady(true)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnimation.value,
      transform: [{ scale: scaleAnimation.value }]
    }
  })

  return (
    <View style={{ flex: 1 }}>
      {isSplashAnimationComplete ? children : null}
    </View>
  )
}
