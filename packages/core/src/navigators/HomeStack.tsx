import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import HistoryMenu from '../modules/history/ui/components/HistoryMenu'
import Home from '../screens/Home'
import { HomeStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ScreenOptionsDictionary, historyEnabled] = useServices([TOKENS.OBJECT_SCREEN_CONFIG, TOKENS.HISTORY_ENABLED])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: '',
          headerRight: () => (historyEnabled ? <HistoryMenu /> : null),
            headerLeft: () => {
              return (
                <View style={{flexDirection: 'row', flex: 1, width: 180,}}>
                  <SettingsMenu />
                  <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 22, marginLeft: 10, color: 'black'}}>Notifications</Text>
                </View>
              )
            },
          ...ScreenOptionsDictionary[Screens.Home],
        })}
      />
    </Stack.Navigator>
  )
}

export default HomeStack
