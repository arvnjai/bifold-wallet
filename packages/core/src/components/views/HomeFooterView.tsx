import { CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Button,  { ButtonType } from '../../components/buttons/Button'
import { useTheme } from '../../contexts/theme'
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'
import { ThemedText } from '../texts/ThemedText'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { useNetwork } from '../../contexts/network'

const offset = 25

interface HomeFooterViewProps {
  children?: any
}

const HomeFooterView: React.FC<HomeFooterViewProps> = ({ children }) => {

  const { assertNetworkConnected } = useNetwork()
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { openIdState } = useOpenIDCredentials()
  const { w3cCredentialRecords, sdJwtVcRecords } = openIdState
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
    ...w3cCredentialRecords,
    ...sdJwtVcRecords,
  ]
  const { HomeTheme, TextTheme, Assets } = useTheme()
  const { t } = useTranslation()

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

  const displayMessage = (credentialCount: number) => {
    if (typeof credentialCount === 'undefined' && credentialCount >= 0) {
      throw new Error('Credential count cannot be undefined')
    }
  
    let credentialMsg
    let scanReminder

    if (credentialCount === 1) {
      credentialMsg = (
        <ThemedText>
          {t('Home.YouHave')}{' '}
          <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</ThemedText>{' '}
          {t('Home.Credential')} {t('Home.InYourWallet')}
        </ThemedText>
      )
    } else if (credentialCount > 1) {
      credentialMsg = (
        <ThemedText>
          {t('Home.YouHave')}{' '}
          <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</ThemedText>{' '}
          {t('Home.Credentials')} {t('Home.InYourWallet')}
        </ThemedText>
      )
    } else {
      credentialMsg = <ThemedText style={{color:"gray"}}>{t('Home.NoCredentials')}</ThemedText>
      scanReminder = <ThemedText>{t('Home.ScanOfferAddCard')}</ThemedText>
    }

    return (
      <>
        {/* <View style={
          [styles.imageContainer, {
            height: "50%",
            width: "100%",
            marginTop: "10%",
            flexDirection: 'row',
            justifyContent: 'center',
          }]}
        >
          <Assets.svg.emptyWalletIcon {...{ width: '40%', }} />
        </View>

        <View style={styles.messageContainer}>
          <ThemedText
            adjustsFontSizeToFit
            style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}
          >
            {credentialMsg}
          </ThemedText>
        </View>

        <View
          style={{
            backgroundColor:"#07489E",
            marginTop: "11%",
            borderRadius: 10,
            padding: 1,
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
        </View> */}

        {/* <View style={styles.messageContainer}>
          <ThemedText
            adjustsFontSizeToFit
            style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}
          >
            {scanReminder}
          </ThemedText>
        </View> */}
      </>
    )
  }

  return (
    <View>
      <View style={styles.container}>{displayMessage(credentials.length)}</View>
      {children}
    </View>
  )
}

export default HomeFooterView
