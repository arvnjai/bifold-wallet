import React, { useState, useEffect } from 'react'
import { Pressable, Animated } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { useTranslation } from 'react-i18next'

interface ToggleButtonProps {
  isEnabled: boolean
  isAvailable: boolean
  toggleAction: () => void
  testID?: string
  enabledIcon?: string
  disabledIcon?: string
  disabled?: boolean
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isEnabled,
  isAvailable,
  toggleAction,
  testID,
  enabledIcon,
  disabledIcon,
  disabled = false,
}) => {
  const { ColorPalette } = useTheme()
  const [toggleAnim] = useState(new Animated.Value(isEnabled ? 1 : 0))
  const { t } = useTranslation()

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isEnabled, toggleAnim])

  // Animate thumb position
  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  })

  return (
    <Pressable
      accessible
      testID={testID}
      accessibilityLabel={isEnabled ? t('Biometry.On') : t('Biometry.Off')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isEnabled }}
      onPress={isAvailable && !disabled ? toggleAction : undefined}
      disabled={!isAvailable || disabled}
    >
      <Animated.View
        style={{
          width: 28,
          height: 18,
          borderRadius: 11,
          borderWidth: 3,
          borderColor:  ColorPalette.brand.primary,            
          backgroundColor: isEnabled
          ? ColorPalette.brand.primary
          : ColorPalette.grayscale.white, // stays white like your screenshot
          padding: 2,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
            width: 10,
            height: 10,
            borderRadius: 9,
            backgroundColor: isEnabled
              ? ColorPalette.grayscale.white
              : ColorPalette.brand.primary,
            elevation: 2,
          }}
        />
      </Animated.View>
    </Pressable>
  )
}

export default ToggleButton
