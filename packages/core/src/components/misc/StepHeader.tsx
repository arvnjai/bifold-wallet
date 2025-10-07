import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../contexts/theme'

interface HeaderProps {
  step?: number       // current step (1-based)
  totalSteps?: number // total dots
  onBackPress?: () => void
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  backButton: {
    marginRight: 20,
  },
  dotsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#042645',
  },
  inactiveDot: {
    borderWidth: 2,
    borderColor: '#042645',
    backgroundColor: 'transparent',
  },
})

const StepHeader: React.FC<HeaderProps> = ({ step = 1, totalSteps = 4, onBackPress }) => {
  const { ColorPalette, Assets } = useTheme()

  const imageDisplayOptions = {
    fill: ColorPalette.notification.infoText,
    height: 30,
    width: 40,
  }

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Assets.svg.arrowBack {...imageDisplayOptions} />
      </TouchableOpacity>

      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              step === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

export default StepHeader
