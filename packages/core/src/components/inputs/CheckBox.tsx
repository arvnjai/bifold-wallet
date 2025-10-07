import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text, TextStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'

interface Props {
  title: string
  titleStyle?: TextStyle
  accessibilityLabel?: string
  testID?: string
  checked: boolean
  onPress: () => void
  reverse?: boolean
}

const CheckBoxRow: React.FC<Props> = ({
  title,
  titleStyle = {},
  accessibilityLabel,
  testID,
  checked,
  onPress,
  reverse,
}) => {
  const { Inputs } = useTheme()
  const style = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: reverse ? 'row-reverse' : 'row',
      alignItems: 'center',
      margin: 10,
      marginBottom: 0,
    },
    text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: "black",
      flexShrink: 1,
      marginLeft: reverse ? 0 : 10,
      marginRight: reverse ? 10 : 0,
    },
  })
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

  return (
    <View style={style.container}>
      <Text style={[style.text, titleStyle]}>{title}</Text>
      <TouchableOpacity
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onPress={onPress}
        hitSlop={hitSlop}
      >
        {checked ? (
          <Icon name={'check-box'} size={36} color={Inputs.checkBoxColor.color} />
        ) : (
          <Icon name={'check-box-outline-blank'} size={36} color={Inputs.checkBoxColor.color} />
        )}
      </TouchableOpacity>
    </View>
  )
}

export default CheckBoxRow
