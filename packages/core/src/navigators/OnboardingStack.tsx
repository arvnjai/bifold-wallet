/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Agent } from '@credo-ts/core'
import { StackActions, useNavigation, useNavigationState } from '@react-navigation/native'
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useOnboardingState } from '../hooks/useOnboardingState'
import AttemptLockout from '../screens/AttemptLockout'
import NameWallet from '../screens/NameWallet'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINEnter from '../screens/PINEnter'
import PINExplainer from '../screens/PINExplainer'
import PushNotifications from '../screens/PushNotifications'
import { Config } from '../types/config'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { WalletSecret } from '../types/security'
import { State } from '../types/state'

import { useDefaultStackOptions } from './defaultStackOptions'
import { getOnboardingScreens } from './OnboardingScreens'

export type OnboardingStackProps = {
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
  agent: Agent | null
}

const OnboardingStack: React.FC<OnboardingStackProps> = ({ initializeAgent, agent }) => {
  const [store, dispatch] = useStore<State>()
  const { t } = useTranslation()
  const Stack = createStackNavigator()
  const theme = useTheme()
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)
  const [
    config,
    Splash,
    pages,
    Biometry,
    Onboarding,
    { screen: Terms, version: termsVersion },
    onTutorialCompletedCurried,
    ScreenOptionsDictionary,
    Preface,
    UpdateAvailable,
    versionMonitor,
    generateOnboardingWorkflowSteps,
  ] = useServices([
    TOKENS.CONFIG,
    TOKENS.SCREEN_SPLASH,
    TOKENS.SCREEN_ONBOARDING_PAGES,
    TOKENS.SCREEN_BIOMETRY,
    TOKENS.SCREEN_ONBOARDING,
    TOKENS.SCREEN_TERMS,
    TOKENS.FN_ONBOARDING_DONE,
    TOKENS.OBJECT_SCREEN_CONFIG,
    TOKENS.SCREEN_PREFACE,
    TOKENS.SCREEN_UPDATE_AVAILABLE,
    TOKENS.UTIL_APP_VERSION_MONITOR,
    TOKENS.ONBOARDING,
  ])
  const defaultStackOptions = useDefaultStackOptions(theme)
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const onTutorialCompleted = onTutorialCompletedCurried(dispatch, navigation)
  const currentRoute = useNavigationState((state) => state?.routes[state?.index])
  const { disableOnboardingSkip } = config as Config
  const { onboardingState, activeScreen } = useOnboardingState(
    store,
    config,
    Number(termsVersion),
    agent,
    generateOnboardingWorkflowSteps
  )

  useEffect(() => {
    versionMonitor?.checkForUpdate?.().then((versionInfo) => {
      dispatch({
        type: DispatchAction.SET_VERSION_INFO,
        payload: [versionInfo],
      })
    })
  }, [versionMonitor, dispatch])

  const onAuthenticated = useCallback(
    (status: boolean): void => {
      if (!status) {
        return
      }

      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
      })
    },
    [dispatch]
  )

  const SplashScreen = useCallback(() => {
    return <Splash initializeAgent={initializeAgent} />
  }, [Splash, initializeAgent])

  const UpdateAvailableScreen = useCallback(() => {
    return (
      <UpdateAvailable
        appleAppStoreUrl={config.appUpdateConfig?.appleAppStoreUrl}
        googlePlayStoreUrl={config.appUpdateConfig?.googlePlayStoreUrl}
      />
    )
  }, [UpdateAvailable, config.appUpdateConfig])

  const OnboardingScreen = useCallback(() => {
    return (
      <Onboarding
        nextButtonText={t('Global.Next')}
        previousButtonText={t('Global.Back')}
        disableSkip={disableOnboardingSkip}
        pages={pages(onTutorialCompleted, OnboardingTheme)}
        style={carousel}
      />
    )
  }, [Onboarding, OnboardingTheme, carousel, disableOnboardingSkip, onTutorialCompleted, pages, t])

  // These need to be in the children of the stack screen otherwise they
  // will unmount/remount which resets the component state in memory and causes
  // issues
  const PINExplainerScreen = useCallback(
    (props:any)=>{
      return <PINExplainer {...props}/>
    },[navigation]
  )
  const CreatePINScreen = useCallback(
    (props: any) => {
      return <PINCreate setAuthenticated={onAuthenticated} {...props} />
    },
    [onAuthenticated]
  )

  const EnterPINScreen = useCallback(
    (props: any) => {
      return <PINEnter setAuthenticated={onAuthenticated} {...props} />
    },
    [onAuthenticated]
  )

  useEffect(() => {
    // If the active screen is the same as the current route, then we don't
    // need to do anything.
    if (activeScreen && activeScreen === currentRoute?.name) {
      return
    }

    // 1. Define screens where the user is allowed to manually navigate (use back button).
    // The onboarding flow should NOT automatically replace the stack on these screens.
    const manualScreens: Screens[] = [
      Screens.ExplainPIN,
      Screens.CreatePIN,
      Screens.EnterPIN,
      Screens.Biometry,
      Screens.NameWallet,
      Screens.PushNotifications,
    ]

    // 2. Cast activeScreen (a string) to Screens type for comparison
    const requiredScreen = activeScreen as Screens | undefined

    // 3. If a required screen exists:
    if (requiredScreen) {
      // If the required screen is one the user should navigate manually,
      // we only enforce a StackActions.replace if the user is currently on an early screen
      // (like the Splash, Preface, or Onboarding carousel) and needs to skip ahead.
      if (manualScreens.includes(requiredScreen)) {
        
        const initialOnboardingRoutes = [Screens.Splash, Screens.Preface, Screens.Onboarding]

        if (initialOnboardingRoutes.includes(currentRoute?.name as Screens) || !currentRoute?.name) {
          // If we are currently on an early route, enforce replacement to jump forward.
          navigation.dispatch(StackActions.replace(requiredScreen))
          return
        }

        // If the user is already past the initial routes (e.g., on PINExplainer) and the required screen
        // is the next one in the flow (e.g., CreatePIN), we let the manual navigation (including
        // the back button or explicit navigation in PINCreate.tsx) handle it.
        return
      }
      
      // 4. If the required screen is NOT a manual screen (e.g., mandatory UpdateAvailable or AttemptLockout),
      // we enforce the replacement to prevent skipping.
      navigation.dispatch(StackActions.replace(requiredScreen))
      return
    }

    // 5. Nothing to do here, we are done with onboarding.
    DeviceEventEmitter.emit(EventTypes.DID_COMPLETE_ONBOARDING)
  }, [activeScreen, currentRoute, onboardingState, navigation])
  /*
  useEffect(() => {
    // If the active screen is the same as the current route, then we don't
    // need to do anything.
    if (activeScreen && activeScreen === currentRoute?.name) {
      return
    }
      

    // If the active screen is different from the current route, then we need
    // to navigate to the active screen.
      if (activeScreen) {
      navigation.dispatch(StackActions.replace(activeScreen))
      return
    }

    // Nothing to do here, we are done with onboarding.
    DeviceEventEmitter.emit(EventTypes.DID_COMPLETE_ONBOARDING)
  }, [activeScreen, currentRoute, onboardingState, navigation])
*/
  const screens = useMemo(
    () =>
      getOnboardingScreens(t, ScreenOptionsDictionary, {
        SplashScreen,
        Preface,
        UpdateAvailableScreen,
        Terms,
        NameWallet,
        Biometry,
        PushNotifications,
        AttemptLockout,
        OnboardingScreen,
        CreatePINScreen,
        EnterPINScreen,
        PINExplainerScreen,
      }),
    [
      SplashScreen,
      CreatePINScreen,
      EnterPINScreen,
      OnboardingScreen,
      PINExplainerScreen,
      Preface,
      Terms,
      Biometry,
      t,
      ScreenOptionsDictionary,
      UpdateAvailableScreen,
    ]
  )
  return (
    <Stack.Navigator
      initialRouteName={activeScreen}
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      {screens.map((item) => {
        return <Stack.Screen key={item.name} {...item} />
      })}
    </Stack.Navigator>
  )
}

export default OnboardingStack
