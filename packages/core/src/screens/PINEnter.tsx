import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, InteractionManager, Keyboard, Pressable, StyleSheet, Vibration, View, TouchableOpacity, Text } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { InlineErrorType, InlineMessageProps } from '../components/inputs/InlineErrorText'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import DeveloperModal from '../components/modals/DeveloperModal'
import PopupModal from '../components/modals/PopupModal'
import { ThemedText } from '../components/texts/ThemedText'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, attemptLockoutConfig, defaultAutoLockTime, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useDeveloperMode } from '../hooks/developer-mode'
import { useLockout } from '../hooks/lockout'
import usePreventScreenCapture from '../hooks/screen-capture'
import { BifoldError } from '../types/error'
import { testIdWithKey } from '../utils/testable'
import { getBuildNumber, getVersion } from 'react-native-device-info'
interface PINEnterProps {
  setAuthenticated: (status: boolean) => void
  usage?: PINEntryUsage
}
export enum PINEntryUsage {
  PINCheck,
  WalletUnlock
}

const PINEnter: React.FC<PINEnterProps> = ({ setAuthenticated, usage = PINEntryUsage.WalletUnlock }) => {
  const { t } = useTranslation()
  const { checkWalletPIN, getWalletSecret, isBiometricsActive, disableBiometrics } = useAuth()
  const [store, dispatch] = useStore()
  const [PIN, setPIN] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [displayLockoutWarning, setDisplayLockoutWarning] = useState(false)
  const [biometricsErr, setBiometricsErr] = useState(false)
  const [alertModalVisible, setAlertModalVisible] = useState(false)
  const [forgotPINModalVisible, setForgotPINModalVisible] = useState(false)
  const [devModalVisible, setDevModalVisible] = useState(false)
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState(false)

  const { ColorPalette, TextTheme, Assets } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const [
    logger,
    {
      preventScreenCapture,
      enableHiddenDevModeTrigger,
      attemptLockoutConfig: { thresholdRules } = attemptLockoutConfig,
    },
  ] = useServices([TOKENS.UTIL_LOGGER, TOKENS.CONFIG])
  const [inlineMessageField, setInlineMessageField] = useState<InlineMessageProps>()
  const [inlineMessages] = useServices([TOKENS.INLINE_ERRORS])
  const [alertModalMessage, setAlertModalMessage] = useState<string>()
  const { getLockoutPenalty, attemptLockout, unMarkServedPenalty } = useLockout()
  const onBackPressed = () => setDevModalVisible(false)
  const onDevModeTriggered = () => {
    Vibration.vibrate()
    setDevModalVisible(true)
  }
  const { incrementDeveloperMenuCounter } = useDeveloperMode(onDevModeTriggered)
  const isContinueDisabled = inlineMessages.enabled ? !continueEnabled : !continueEnabled || PIN.length < minPINLength
  usePreventScreenCapture(preventScreenCapture)

  // listen for biometrics error event
  useEffect(() => {
    const handle = DeviceEventEmitter.addListener(EventTypes.BIOMETRY_ERROR, (value?: boolean) => {
      // Only update state if it's explicitly a biometric error
      if (value === true) {
        setBiometricsErr(true)
      }
    })
    return () => {
      handle.remove()
    }
  }, [])

  const loadWalletCredentials = useCallback(async () => {
    const walletSecret = await getWalletSecret()
    if (walletSecret && !biometricsErr) {
      // remove lockout notification
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: false }],
      })
      // reset login attempts if login is successful
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })
      setAuthenticated(true)
    }
  }, [getWalletSecret, dispatch, setAuthenticated])

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(async () => {
      if (!store.preferences.useBiometry) {
        return
      }
        const active = await isBiometricsActive()
        if (!active) {
          // biometry state has changed, display message and disable biometry
          setBiometricsEnrollmentChange(true)
          await disableBiometrics()
          dispatch({
            type: DispatchAction.USE_BIOMETRY,
            payload: [false],
          })
        }
        await loadWalletCredentials()
      
    })

    return handle.cancel
  }, [store.preferences.useBiometry, isBiometricsActive, disableBiometrics, dispatch, loadWalletCredentials, logger])

  useEffect(() => {
    // check number of login attempts and determine if app should apply lockout
    const attempts = store.loginAttempt.loginAttempts
    // display warning if we are one away from a lockout
    const displayWarning = !!getLockoutPenalty(attempts + 1)
    setDisplayLockoutWarning(displayWarning)
  }, [store.loginAttempt.loginAttempts, getLockoutPenalty])

  useEffect(() => {
    setInlineMessageField(undefined)
  }, [PIN])

  const unlockWalletWithPIN = useCallback(
    async (PIN: string) => {
      try {
        setContinueEnabled(false)
        const result = await checkWalletPIN(PIN)
        if (store.loginAttempt.servedPenalty) {
          // once the user starts entering their PIN, unMark them as having served their
          // lockout penalty
          unMarkServedPenalty()
        }
        if (!result) {
          const newAttempt = store.loginAttempt.loginAttempts + 1
          let message = ''
          const attemptsLeft =
            (thresholdRules.increment - (newAttempt % thresholdRules.increment)) % thresholdRules.increment
          if (!inlineMessages.enabled && !getLockoutPenalty(newAttempt)) {
            // skip displaying modals if we are going to lockout
            setAlertModalVisible(true)
          }
          if (attemptsLeft >1) {
            message = t('PINEnter.RepeatPIN', { tries: attemptsLeft })
            setPIN('')
            setAlertModalMessage(message)
            setAlertModalVisible(true)
          } else if (attemptsLeft === 1) {
            message = t('PINEnter.RepeatPIN')
            setPIN('')
            setAlertModalMessage(message)
            setAlertModalVisible(true)
          } else {
            const penalty = getLockoutPenalty(newAttempt)
            if (penalty !== undefined) {
              attemptLockout(penalty) // Only call attemptLockout if penalty is defined
            }
            setAlertModalMessage(message)
            setContinueEnabled(true)
            return
          }
          if (inlineMessages.enabled) {
            setInlineMessageField({
              message,
              inlineType: InlineErrorType.error,
              config: inlineMessages,
            })
          } else {
            setAlertModalMessage(message)
            setContinueEnabled(true)
          }
          setContinueEnabled(true)
          // log incorrect login attempts
          dispatch({
            type: DispatchAction.ATTEMPT_UPDATED,
            payload: [{ loginAttempts: newAttempt }],
          })
          return
        }
        // reset login attempts if login is successful
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [{ loginAttempts: 0 }],
        })
        // remove lockout notification if login is successful
        dispatch({
          type: DispatchAction.LOCKOUT_UPDATED,
          payload: [{ displayNotification: false }],
        })
        setAuthenticated(true)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1041'),
          t('Error.Message1041'),
          (err as Error)?.message ?? err,
          1041
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [
      checkWalletPIN,
      store.loginAttempt,
      unMarkServedPenalty,
      getLockoutPenalty,
      dispatch,
      setAuthenticated,
      t,
      attemptLockout,
      inlineMessages,
      thresholdRules.increment,
    ]
  )

  const clearAlertModal = useCallback(() => {
    setAlertModalVisible(false)
  }, [setAlertModalVisible])

  // both of the async functions called in this function are completely wrapped in try catch
  const onPINInputCompleted = useCallback(
    async (PIN: string) => {
      if (inlineMessages.enabled && PIN.length < minPINLength) {
        setInlineMessageField({
          message: t('PINCreate.PINTooShort'),
          inlineType: InlineErrorType.error,
          config: inlineMessages,
        })
        return
      }
      setContinueEnabled(false)
      await unlockWalletWithPIN(PIN)
    },
    [unlockWalletWithPIN, t, inlineMessages]
  )

  
  const handleButtonPress = (digit: string): void => {
    if (PIN.length < 6) {
      //setPIN((prevPincode: string) => prevPincode + digit);
      const nextPIN = PIN + digit
      setPIN(nextPIN)
    
    if (nextPIN.length == minPINLength)
      onPINInputCompleted(nextPIN)
    }
  };

  const handleDeletePress = async (): Promise<void> =>{
    setPIN(PIN.slice(0,-1));
  };

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      padding: 10,
      justifyContent: 'center',
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    imageContainer:{
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 50,
      marginTop: 40,
    },
    upperContainer:{
      height: '60%',
      marginBottom: 20,
      marginTop: 50,
      justifyContent:'center',
      alignItems:'center'
    },
    buttonContainer: {
      width: '100%',
      height: '40%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:'center',
      padding: 15,
      paddingBottom: 30,
      bottom: 30
    },
    biometricsButtonContainer: {
      width: '100%',
      marginTop: 10,
    },
    biometricsText: {
      alignSelf: 'center',
      marginTop: 10,
    },
    biometricsErrorText:{
      alignSelf:'center',
      marginBottom: 20,
      color: '#FF0000',
    },
    helpText: {
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: 16,
    },
    inputLabel: {
      marginBottom: 16,
      alignContent: 'center'
    },
    modalText: {
      marginVertical: 5,
      color: '#000000'
    },
    subTitle: {
      alignSelf: 'center',
      color: '#205295'
    },
    enterPIN: {
      color: '#000000',
      fontSize: 20,
      fontWeight: 'bold',
      alignSelf:'center'
    },
    buildNumberText: {
      fontSize: 14,
      color: TextTheme.labelSubtitle.color,
      textAlign: 'center',
      marginTop: 20,
    },
    button:{
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      width: 70,
      height: 50,
      margin: 15,
    },
    buttonZero: {
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      width: 70,
      height: 50,
      margin: 15,
      marginLeft: 115,
    },
    buttonText: {
      color: '#000000',
      fontSize: 28,
      fontWeight: "800"
    },
    pincodeContainer: {
      flexDirection: "row",
      marginBottom: 20,
      textAlign: "center",
      marginTop: 20,
      justifyContent: "center",
    },
    pincodeDigitUnfilled: {
      backgroundColor: '#EBEBEB',
    },
    pincodeDigitText: {
      color: "#fff",
      fontSize: 20,
    },
    pincodeDigit: {
      borderRadius: 30,
      width: 18,
      height: 18,
      marginHorizontal: 8,
    },
    pincodeDigitFilled: {
      backgroundColor:'#042645',
    },
    lineSperator:{
      height: 1,
      width: '100%',
      backgroundColor: '#E6E6E6',
      marginVertical: 10,
    }
  })

   const imageDisplayOptions = {
    fill: ColorPalette.notification.infoText,
    height: 90,
    width: 250,
  }
  const HelpText = useMemo(() => {
    const showHelpText = store.lockout.displayNotification || biometricsEnrollmentChange || biometricsErr
    let header = ''
    let subheader = ''
    if (store.lockout.displayNotification) {
      header = t('PINEnter.LockedOut', { time: String(store.preferences.autoLockTime ?? defaultAutoLockTime) })
      subheader = t('PINEnter.ReEnterPIN')
    }
    if (biometricsEnrollmentChange) {
      header = t('PINEnter.BiometricsChanged')
      subheader = t('PINEnter.BiometricsChangedEnterPIN')
    }
    if (biometricsErr) {
      header = t('PINEnter.BiometricsError')
      subheader = t('PINEnter.BiometricsErrorEnterPIN')
    }
    return (
      <>
        <ThemedText variant={showHelpText ? 'normal' : 'headingThree'}  style={style.helpText}>
          {header}
        </ThemedText>
        <ThemedText variant={showHelpText ? 'normal' : 'labelSubtitle'} style={style.helpText}>
          {subheader}
        </ThemedText>
      </>
    )
  }, [
    style.helpText,
    store.lockout.displayNotification,
    t,
    biometricsEnrollmentChange,
    biometricsErr,
    store.preferences.autoLockTime,
  ])

  return (

      <View style={style.screenContainer}>
        <View style={style.upperContainer}>
          <Pressable
            onPress={enableHiddenDevModeTrigger ? incrementDeveloperMenuCounter : () => {}}
            testID={testIdWithKey('DeveloperCounter')}
          ></Pressable>         
          <View style={style.imageContainer}>
            <Assets.svg.sierra {...imageDisplayOptions}/>
            <ThemedText style={style.subTitle}>{t('PINEnter.SubText1')}</ThemedText>
            <ThemedText style={style.subTitle}>{t('PINEnter.SubText2')}</ThemedText>
          </View>
        
          <View>
            <ThemedText style={style.enterPIN}>
              {t('PINEnter.EnterPIN')}
            </ThemedText>
            <View style={style.pincodeContainer}>
              {[...Array(6).keys()].map((index) => (
                <View
                  key={index}
                  style={[
                    style.pincodeDigit,
                    PIN.length > index
                      ? style.pincodeDigitFilled
                      : style.pincodeDigitUnfilled,
                  ]}
                ></View>
                ))}
            </View>
          </View>
          {biometricsErr ? (
              <>
                <Text style={[TextTheme.normal, { alignSelf: 'center', color: "red" }]}>{t('PINEnter.BiometricsError')}</Text>
                <Text style={[TextTheme.normal, { alignSelf: 'center', color: "red" }]}>{t('PINEnter.BiometricsErrorEnterPIN')}
                </Text>
              </>
            ) : (
              <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 20 }]}> </Text>
            )}
        </View>
        <View style={style.lineSperator}/>
        <View>
          <View style={style.buttonContainer}>
           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <TouchableOpacity
                key={digit}
                style={[style.button]}
                disabled={!continueEnabled}
                onPress={() => handleButtonPress(digit.toString())}
              >
                <Text style={style.buttonText}>{digit}</Text>
              </TouchableOpacity>
            ))}
            {store.preferences.useBiometry && (
            <>
              <TouchableOpacity
                style={[style.button]}
                disabled={!continueEnabled}
                onPress={loadWalletCredentials}
                >
                <Assets.svg.fingerprint />
              </TouchableOpacity>
            </>
            )}
            <TouchableOpacity
              style={store.preferences.useBiometry && !biometricsEnrollmentChange? style.button : style.buttonZero}
              onPress={() => handleButtonPress("0")}
              disabled={!continueEnabled}
              >
                <Text style={style.buttonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[style.button]}
                disabled={!continueEnabled}
                onPress={handleDeletePress}
              >
              <Assets.svg.carbondelete />
            </TouchableOpacity>
          </View>
        </View>
        {alertModalVisible ? (
        <PopupModal
          notificationType={InfoBoxType.InfoRed}
          title={t('PINEnter.IncorrectPIN')}
          bodyContent={
            <>
              <ThemedText style={style.modalText}>
                {t('PINEnter.RepeatPIN')}
              </ThemedText>
              {displayLockoutWarning ? (
                <ThemedText variant="popupModalText" style={style.modalText}>
                  {t('PINEnter.AttemptLockoutWarning')}
                </ThemedText>
              ) : null}
            </>
          }
          onCallToActionLabel={'Try Again'}
          onCallToActionPressed={clearAlertModal}
        />
      ) : null}
      {forgotPINModalVisible ? (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.ForgotPINModalTitle')}
          bodyContent={
            <ThemedText
              variant="popupModalText"
              style={style.modalText}
              testID={testIdWithKey('ForgotPINModalDescription')}
            >
              {t('PINEnter.ForgotPINModalDescription')}
            </ThemedText>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => setForgotPINModalVisible(false)}
        />
      ) : null}
      {devModalVisible ? <DeveloperModal onBackPressed={onBackPressed} /> : null}
      </View>
  )
}

export default PINEnter
