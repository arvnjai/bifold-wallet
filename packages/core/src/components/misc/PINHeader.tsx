import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/theme'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '../texts/ThemedText'
import StepHeader from './StepHeader'

export interface PINHeaderProps {
  updatePin?: boolean
}
const styles = StyleSheet.create({
    headerText: {
      fontSize: 32,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#042645',
    },
    subTitle:{
      fontSize: 20,
      textAlign: 'left',
      color: '#4A4A4A',
      fontWeight: 'bold',
      marginBottom: 30,
    }
  })

const PINHeader = ({ updatePin }: PINHeaderProps) => {
  const { TextTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <View>
      <View>
        <ThemedText style={styles.headerText}>
            {updatePin ? t('PINChange.ChangePIN') : t('PINCreate.CreatePIN')}
        </ThemedText>
      </View>
      <ThemedText style={{ marginBottom: 16, alignContent: 'center' }}>
        <ThemedText style={styles.subTitle}>
          {updatePin ? t('PINChange.RememberChangePIN') : t('PINCreate.SetPIN')}
        </ThemedText>        
      </ThemedText>
    </View>
  )
}

export default PINHeader
