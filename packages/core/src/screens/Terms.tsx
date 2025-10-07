import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, View } from 'react-native'

import { ButtonType } from '../components/buttons/Button-api'
import InfoTextBox from '../components/texts/InfoTextBox'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'

export const TermsVersion = '1'


interface Terms {
  visible: boolean
  onAgree: () => void
  onClose: () => void
}

const Terms: React.FC<Terms> = ({visible, onAgree, onClose}) => {
  const [store, dispatch] = useStore()
  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms
  const [checked, setChecked] = useState(agreedToPreviousTerms)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const { OnboardingTheme, TextTheme } = useTheme()
  const [Button] = useServices([TOKENS.COMP_BUTTON])

  const onSubmitPressed = useCallback(() => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
      payload: [{ DidAgreeToTerms: TermsVersion }],
    })
  }, [dispatch])

  const style = StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      padding: 20,
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    modalWrapper: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer:{
      backgroundColor: '#FFFFFF',
      opacity:1,
      borderRadius: 20,
      maxHeight: '90%',
      overflow: 'hidden', 
      alignItems: 'center',
      shadowColor: '#00000',
      shadowOffset: {width: 0, height: 2,},
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 5, 
    },
  })

  const onBackPressed = () => {
    //TODO:(jl) goBack() does not unwind the navigation stack but rather goes
    //back to the splash screen. Needs fixing before the following code will
    //work as expected.

    // if (nav.canGoBack()) {
    //   nav.goBack()
    // }

    navigation.navigate(Screens.Onboarding)
  }
    return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={style.modalWrapper}>
        <View style={style.modalContainer}>
          <View style={style.container}>
            <InfoTextBox>
              Please agree to the terms and conditions below before using this application.
            </InfoTextBox>
            <ScrollView>
              <ThemedText style={{ marginTop: 20, marginBottom: 20 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
                in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
              </ThemedText>
            </ScrollView>
            <View style={style.controlsContainer}>
              <View style={{ paddingTop: 10}}>
                <Button
                title={t('Global.Agree')}
                onPress={onAgree}
                testID={testIdWithKey('Accept')}
                buttonType={ButtonType.Primary}
                />
              </View>
              <View style={{ paddingTop: 10, marginBottom: 20 }}>
                <Button
                  title={t('Global.Back')}
                  onPress={onClose}
                  testID={testIdWithKey('Back')}
                  buttonType={ButtonType.Secondary}
                />
              </View>  
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default Terms
