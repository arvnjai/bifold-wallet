import React, {useState} from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SvgProps } from 'react-native-svg'


import DigitalWallet from '../assets/img/digital-wallet 1.svg'
import DigitalIdentity from '../assets/img/digital-identity 1.svg'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import Folder from '../assets/img/folder 1.svg'
import SecureImage from '../assets/img/think.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import { GenericFn } from '../types/fn'
import { testIdWithKey } from '../utils/testable'

import { useTheme } from '../contexts/theme'

import { ThemedText } from '../components/texts/ThemedText'
import { OnboardingStyleSheet } from './Onboarding'

export const createCarouselStyle = (OnboardingTheme: any) => {
  return StyleSheet.create<OnboardingStyleSheet>({
    container: {
      ...OnboardingTheme.container,
      flex: 1,
      alignItems: 'center',
      marginTop: 20,
      marginHorizontal: 20,
    },
    carouselContainer: {
      ...OnboardingTheme.carouselContainer,
      flexDirection: 'column',
    },
    pagerContainer: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
    },
    pagerDot: {
      ...OnboardingTheme.pagerDot,
      borderWidth: 2,
      borderStyle: 'solid',
      height: 15,
      width: 15,
      borderRadius:15,
    },
    pagerDotActive: {
      ...OnboardingTheme.pagerDotActive,
      height: 15,
      width: 15,
      borderRadius:15,
    },
    pagerDotInactive: {
      ...OnboardingTheme.pagerDotInactive,
      height: 15,
      width: 15,
      borderRadius:15,
    },
    pagerPosition: {
      position: 'relative',
      top: 0,
    },
    pagerNavigationButton: {
      ...OnboardingTheme.pagerNavigationButton,
      marginHorizontal: 30
    },
    headerText: {
      ...OnboardingTheme.headerText,
      fontSize: 32,
      fontWeight: 'bold',
      marginTop: 10,
      color: '#042645',
    },
    imageicon: {
      ...OnboardingTheme.imageDisplayOptions,
      width: '100%',
    },
  })
}

export const createStyles = (OnboardingTheme: any) => {
  return StyleSheet.create({
    headerText: {
      ...OnboardingTheme.headerText,
      color: '#042645',
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
      color: '#042645',
    },
    point: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
      marginTop: 10,
      marginRight: 10,
      marginBottom: 10,
    },
    icon: {
      marginRight: 10,
    },
  })
}

const createImageDisplayOptions = (OnboardingTheme: any) => {
  return {
    ...OnboardingTheme.imageDisplayOptions,
    height: 150,
    width: 150,
    marginTop:30,
    marginBottom:50,
  }
}

const CustomPages = ({ onTutorialCompleted, OnboardingTheme }: {onTutorialCompleted: GenericFn, OnboardingTheme: any}) => {
  const { Assets } = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(OnboardingTheme)
  const imageDisplayOptions = createImageDisplayOptions(OnboardingTheme)
  const [ checked, setChecked ] = useState(false)
  return (
    <>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <SecureImage {...imageDisplayOptions} />
        </View>
        <View style={{ marginBottom: 20 }}>
          <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            Is this app for you?
          </ThemedText>
          <ThemedText style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
            DOST-ASTI wallet is new. The available digital credentials are currently limited. Are you sure you want to proceed?
          </ThemedText>
        </View>
        <CheckBoxRow
        title={t('Onboarding.Attestation')}
        accessibilityLabel={t('Onboarding.IAgree')}
        testID={testIdWithKey('IAgree')}
        checked={checked}
        onPress={() => setChecked(!checked)}
        />
      </ScrollView>
              
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('Global.GetStarted')}
          accessibilityLabel={t('Global.GetStarted')}
          testID={testIdWithKey('GetStarted')}
          onPress={onTutorialCompleted}
          buttonType={ButtonType.Primary}
          disabled={!checked}
        />
      </View>
    </>
  )
}

const guides: Array<{ image: React.FC<SvgProps>; title: string; body: string; devModeListener?: boolean }> = [
  {
    image: DigitalWallet,
    title: 'ASTIg na wallet!',
    body: 'DOST - ASTI Wallet helps you prove your identity in a digital manner. It does this by storing digital credentials issued by participating entities such as government services. \n\nElevate your online presence!',
    devModeListener: true,
  },
  {
    image: DigitalIdentity,
    title: 'Digital credentials',
    body: 'Digital credentials are the electronic equivalent of physical credentials such as certifications and permits offered by participating services \n\nServices are simplified and expected as organizations and individuals can confirm who you are with trusted information from digital credentials.',
  },
  {
    image: Folder,
    title: 'Private and confidential',
    body: 'We created this app to protect your data! \n\nDOST-ASTI will not know where and when you use your digital credentials, unless you are interacting with them. \n\nYou also have control who can access your credentials and data. Only the necessary information that is needed are taken. ',
  },
]

export const createPageWith = (PageImage: React.FC<SvgProps>, title: string, body: string, OnboardingTheme: any) => {
  const styles = createStyles(OnboardingTheme)
  const imageDisplayOptions = createImageDisplayOptions(OnboardingTheme)

  return (
    <ScrollView style={{ padding: 20 }}>
      <View style={{ alignItems: 'center' }}>{<PageImage {...imageDisplayOptions} />}</View>
      <View style={{ marginBottom: 20 }}>
        <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.bodyText, { marginTop: 25 }]} testID={testIdWithKey('BodyText')}>
          {body}
        </ThemedText>
      </View>
    </ScrollView>
  )
}

const OnboardingPages = (
  onTutorialCompleted: GenericFn,
  OnboardingTheme: any
): Array<JSX.Element> => {
  return [
    ...guides.map((g, index) => (
      <React.Fragment key={`guide-${index}`}>
        {createPageWith(g.image, g.title, g.body, OnboardingTheme)}
      </React.Fragment>
    )),
    <CustomPages
      key="custom"
      onTutorialCompleted={onTutorialCompleted}
      OnboardingTheme={OnboardingTheme}
    />,
  ]
}
export default OnboardingPages
