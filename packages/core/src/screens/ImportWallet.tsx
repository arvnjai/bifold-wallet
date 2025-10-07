import React from 'react'
import { View, Text, Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { OnboardingStackParams, Screens } from '../types/navigators'

const ImportWallet: React.FC = () => {
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Import your wallet here</Text>
      
    </View>
  )
}

export default ImportWallet
