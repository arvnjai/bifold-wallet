import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AccessibilityInfo,
  DeviceEventEmitter,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  findNodeHandle,
} from 'react-native'

// eslint-disable-next-line import/no-named-as-default
import { ButtonType } from '../components/buttons/Button-api'
import PINInput from '../components/inputs/PINInput'
import PINValidationHelper from '../components/misc/PINValidationHelper'
import AlertModal from '../components/modals/AlertModal'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import usePreventScreenCapture from '../hooks/screen-capture'
import { usePINValidation } from '../hooks/usePINValidation'
import { BifoldError } from '../types/error'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import Terms from './Terms'
import { ThemedText } from '../components/texts/ThemedText'
import StepHeader from '../components/misc/StepHeader'


interface PINCreateProps extends StackScreenProps<ParamListBase, Screens.CreatePIN> {
  setAuthenticated: (status: boolean) => void
  
}

const PINCreate: React.FC<PINCreateProps> = ({ setAuthenticated, navigation }) => {
  
  
  const { setPIN: setWalletPIN } = useAuth()
  const [PIN, setPIN] = useState('')
  const [PINTwo, setPINTwo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms
  const [checked, setChecked] = useState(agreedToPreviousTerms)
  const { ColorPalette } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const PINTwoInputRef = useRef<TextInput>(null)
  const createPINButtonRef = useRef<TouchableOpacity>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const [PINHeader, { preventScreenCapture }, Button, inlineMessages] = useServices([
 
    TOKENS.COMPONENT_PIN_HEADER,
    TOKENS.CONFIG,
    TOKENS.COMP_BUTTON,
    TOKENS.INLINE_ERRORS,
  ])

  
  const { PINValidations, validatePINEntry, inlineMessageField1, inlineMessageField2, modalState, PINSecurity } =
    usePINValidation(PIN, PINTwo)
  usePreventScreenCapture(preventScreenCapture)

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPalette.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
  })

  
  const passcodeCreate = useCallback(
    async (PIN: string) => {
      try {
        await setWalletPIN(PIN)
        setAuthenticated(true)
        // this dispatch finishes this step of onboarding and will cause a navigation
        dispatch({
          type: DispatchAction.DID_CREATE_PIN,
        })
        navigation.navigate(Screens.Biometry as never)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1040'),
          t('Error.Message1040'),
          (err as Error)?.message ?? err,
          1040
        )

        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [setWalletPIN, setAuthenticated, dispatch, t,navigation]
  )

  const handleCreatePinTap = useCallback(async () => {
    setIsLoading(true)
    if (validatePINEntry(PIN, PINTwo)) {
      await passcodeCreate(PIN)
    }
    setIsLoading(false)
  }, [PIN, PINTwo, passcodeCreate, validatePINEntry])

  const isContinueDisabled = useMemo((): boolean => {
    if (inlineMessages.enabled) {
      return false
    }
    return isLoading || PIN.length < minPINLength || PINTwo.length < minPINLength
  }, [isLoading, PIN, PINTwo, inlineMessages])

  /*const continueCreatePIN = useCallback(() => {
    setExplained(true)
  }, [])*/


  return(
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <PINHeader />
          <PINInput
            label={t('PINCreate.EnterPINTitle')}
            onPINChanged={(p: string) => {
              setPIN(p)
              if (p.length === minPINLength && PINTwoInputRef?.current) {
                PINTwoInputRef.current.focus()
                const reactTag = findNodeHandle(PINTwoInputRef.current)
                if (reactTag) {
                  AccessibilityInfo.setAccessibilityFocus(reactTag)
                }
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINCreate.EnterPIN')}
            autoFocus={false}
            inlineMessage={inlineMessageField1}
          />
          <PINInput
            label={t('PINCreate.ReenterPIN')}
            onPINChanged={(p: string) => {
              setPINTwo(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
                const reactTag = createPINButtonRef?.current && findNodeHandle(createPINButtonRef.current)
                if (reactTag) {
                  AccessibilityInfo.setAccessibilityFocus(reactTag)
                }
              }
            }}
            testID={testIdWithKey('ReenterPIN')}
            accessibilityLabel={t('PINCreate.ReenterPIN')}
            autoFocus={false}
            ref={PINTwoInputRef}
            inlineMessage={inlineMessageField2}
          />
          {PINSecurity.displayHelper && <PINValidationHelper validations={PINValidations} />}
          {modalState.visible && (
            <AlertModal title={modalState.title} message={modalState.message} submit={modalState.onModalDismiss} />
          )}
         <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginVertical: 10 }}>
          <CheckBoxRow
                    title={t('Terms.IAgree')}
                    accessibilityLabel={t('Terms.IAgree')}
                    testID={testIdWithKey('IAgree')}
                    checked={!!checked}
                    onPress={() => {
                      if (checked) {
                        // Unchecking: remove agreement
                        setChecked(false)
                        dispatch({
                          type: DispatchAction.DID_AGREE_TO_TERMS,
                          payload: [],
                        })
                      } else {
                        // Checking: show modal first before agreeing
                        setModalVisible(true)
                      }
                    }}
                  />
          <ThemedText style={{ color: '#4A4A4A' }}>
            {" "}
          </ThemedText>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <ThemedText style={{ color: '#07489E' }}>
              {t('Terms.TermsOfService')}
            </ThemedText>
          </TouchableOpacity>
        </View>
          <Terms
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onAgree={() => {
              setChecked(true)
              dispatch({
                type: DispatchAction.DID_AGREE_TO_TERMS,
                payload: [{ DidAgreeToTerms: '1' }],
              })
              setModalVisible(false)
            }}
          />
        </View>
      

        <View style={style.controlsContainer}>
          <Button
            title={('Continue')}
            testID={testIdWithKey('CreatePIN')}
            accessibilityLabel={t('PINCreate.CreatePIN')}
            buttonType={ButtonType.Primary}
            disabled={!checked || isContinueDisabled}
            onPress={handleCreatePinTap}
            ref={createPINButtonRef}
          >
            {isLoading ? <ButtonLoading /> : null}
          </Button>
        </View>
      </View>
    </KeyboardView>
  )
}

export default PINCreate
