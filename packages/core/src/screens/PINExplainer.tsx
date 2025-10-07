import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StackScreenProps } from '@react-navigation/stack'

import Button, { ButtonType } from '../components/buttons/Button'
import BulletPoint from '../components/inputs/BulletPoint'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'

type PINExplainerProps = StackScreenProps<OnboardingStackParams, Screens.ExplainPIN>

const PINExplainer: React.FC<PINExplainerProps> = ({navigation }) => {

  const [store, dispatch] = useStore()
  const onCreateWallet = useCallback(() => { 
    navigation.navigate(Screens.CreatePIN)

    dispatch({
      type: DispatchAction.DID_SEE_EXPLAINER,
    })
  },[navigation])

  const onImportWallet = useCallback (() => {
    navigation.navigate(Screens.CreatePIN)
  },[navigation])

  const { t } = useTranslation()
  const { ColorPalette, TextTheme, Assets } = useTheme()

  const style = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
      justifyContent: 'center',
      margin: 20,
    },
    scrollViewContentContainer: {
      padding: 20,
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    button:{
      paddingVertical: 10,
    },

  })

  const imageDisplayOptions = {
    fill: ColorPalette.notification.infoText,
    height: 150,
    width: 250,
  }

  return (
    <SafeAreaView style={style.safeAreaView} edges={['bottom', 'left', 'right']}>   
        <View style={style.imageContainer}>
          <Assets.svg.sierra {...imageDisplayOptions} />
        </View>
        <View>
          <View style={style.button}>
            <Button
              title={t('PINCreate.Explainer.CreateWallet')}
              accessibilityLabel={t('PINCreate.Explainer.CreateWallet')}
              testID={testIdWithKey('ContinueCreatePIN')}
              onPress={onCreateWallet}
              buttonType={ButtonType.Primary}
            />  
          </View>
          <View style={style.button}>
            <Button
              title={t('PINCreate.Explainer.ImportWallet')}
              accessibilityLabel={t('PINCreate.Explainer.ImportWallet')}
              testID={testIdWithKey('ContinueCreatePIN')}
              onPress={onImportWallet}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>   
    </SafeAreaView>
  )
}

export default PINExplainer
