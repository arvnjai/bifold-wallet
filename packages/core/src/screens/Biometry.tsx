import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack'

import Button, { ButtonType } from '../components/buttons/Button'
import BiometryControl from '../components/inputs/BiometryControl'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { testIdWithKey } from '../utils/testable'
import { OnboardingStackParams, Screens } from '../types/navigators'
  

const Biometry: React.FC<StackScreenProps<OnboardingStackParams, Screens.CreatePIN>> = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { commitWalletToKeychain } = useAuth()
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const { ButtonLoading } = useAnimatedComponents()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const continueTouched = useCallback(async () => {
    setContinueEnabled(false)

    await commitWalletToKeychain(biometryEnabled)

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
  }, [biometryEnabled, commitWalletToKeychain, dispatch])

  const handleBiometryToggle = useCallback((newValue: boolean) => {
    setBiometryEnabled(newValue)
  }, [])

  return (
    <BiometryControl biometryEnabled={biometryEnabled} onBiometryToggle={handleBiometryToggle}>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('Global.Continue')}
          accessibilityLabel={'Continue'}
          testID={testIdWithKey('Continue')}
          onPress={continueTouched}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
        >
          {!continueEnabled && <ButtonLoading />}
        </Button>
        <Button
          title={t('Global.Continue')}
          accessibilityLabel={'Continue'}
          testID={testIdWithKey('Continue')}
          onPress={(navigation.navigate(Screens.CreatePIN as never))}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
        ></Button>
      </View>
    </BiometryControl>
  )
}

export default Biometry
