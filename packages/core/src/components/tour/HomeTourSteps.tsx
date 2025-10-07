import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'
import ScanImg from '../../assets/img/tour-scan.svg'
import NotifImg from '../../assets/img/tour-notification.svg'
import CredentialImg from '../../assets/img/tour-credential.svg'
import { TourBox } from './TourBox'

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPalette, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={stop}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={stop}
          next={next}
          stepOn={1}
          stepsOutOf={3}
        >
          <ScanImg style={{ alignSelf: 'center', padding: 10, marginVertical: 20}} />
          <Text
            style={{
              ...TextTheme.normal,
              color: '#292929',
            }}
            allowFontScaling={false}
          >
            {t('Tour.AddAndShareDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPalette, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.Notifications')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Next')}
          onLeft={previous}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={stop}
          previous={previous}
          stepOn={2}
          stepsOutOf={3}
        >
          <NotifImg style={{ alignSelf: 'center', padding: 10, marginVertical: 20}} />
          <Text
            style={{
              ...TextTheme.normal,
              color: '#292929',
            }}
            allowFontScaling={false}
          >
            {t('Tour.NotificationsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPalette, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={stop}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={stop}
          previous={previous}
          stepOn={3}
          stepsOutOf={3}
        >
          <CredentialImg style={{ alignSelf: 'center', padding: 10, marginVertical: 20}} />
          <Text
            style={{
              ...TextTheme.normal,
              color: '#292929',
            }}
            allowFontScaling={false}
          >
            {t('Tour.YourCredentialsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
