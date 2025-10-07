import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import Button,  { ButtonType } from '../../components/buttons/Button'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { useNetwork } from '../../contexts/network'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

const offset = 25

export interface EmptyListProps {
  message?: string
}

const EmptyList: React.FC<EmptyListProps> = ({ message }) => {

  const { assertNetworkConnected } = useNetwork()
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()
  const { ListItems, Assets, ColorPalette } = useTheme()
const styles = StyleSheet.create({
    container: {
      paddingHorizontal: offset,
      paddingBottom: offset * 3,
    },

    messageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    imageContainer: {
      alignItems: 'center',
    },
  })


  return (
    <View style={{ height: '100%', paddingTop: 70,  backgroundColor: '#F1F69'}}>
      <View style={
          [styles.imageContainer, {
          height: "50%",
          width: "100%",
          flexDirection: 'row',
          justifyContent: 'center',
        }]}
      >
        <Assets.svg.emptyWalletIcon {...{ width: '40%', }} />
      </View>
      
      <ThemedText style={[ListItems.emptyList, { textAlign: 'center', color: 'grey' }]} testID={testIdWithKey('NoneYet')}>
        {message || t('Global.NoneYet!')}
      </ThemedText>
      <View
          style={{
            backgroundColor:"#07489E",
            marginTop: "11%",
            borderRadius: 10,
            padding: 1,
            marginHorizontal: 30
          }}
        >
          <Button
            title={"Add your first credential"}
            buttonType={ButtonType.Primary}
            onPress={() => {
              if (!assertNetworkConnected()) {
                return
              }
              navigation.navigate(Stacks.ConnectStack, { screen: Screens.Scan })
            }}
          />
        </View>
    </View>
  )
}

export default EmptyList
