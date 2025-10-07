import { BrandingOverlayType, Field } from '@bifold/oca/build/legacy'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

import RecordField from './RecordField'
import RecordFooter from './RecordFooter'
import RecordHeader from './RecordHeader'
import { TOKENS, useServices } from '../../container-api'
import { ThemedText } from '../texts/ThemedText'

export interface RecordProps {
  header?: () => React.ReactElement | null
  footer?: () => React.ReactElement | null
  fields: Field[]
  hideFieldValues?: boolean
  issuer?: string
  idName?: string
  issuedDate?: Date
  field?: (field: Field, index: number, fields: Field[]) => React.ReactElement | null
}

const Record: React.FC<RecordProps> = ({ 
  header,
  footer,
  fields,
  hideFieldValues = false,
  field = null,
  issuer = '',
  idName = '',
  issuedDate
}) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])
  const { ListItems, TextTheme } = useTheme()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  const styles = StyleSheet.create({
    linkContainer: {
      ...ListItems.recordContainer,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding10 ? 25 : 16,
      paddingVertical: 16,
    },
    link: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
    },
  })

  const hideAll = useCallback((): void => {
    setShown(fields.map(() => false))
  }, [fields])

  useEffect(() => {
    hideAll()
  }, [hideAll])

  const formatIssued = (d?: Date) => {
    if (!d) return '';
    const s = d.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      // timeZone: 'Asia/Manila', // ← uncomment if you want a fixed TZ
    });
    // Turn "AM/PM" into "Am/Pm"
    return s.replace(/\b([AP])M\b/, '$1m');
  };
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <View>
        {header ? <View style={{backgroundColor: 'yellow'}}><RecordHeader>{header()}</RecordHeader></View> : null }
        <View
          style={{
            marginHorizontal: '7%',
            borderWidth: 2,
            borderColor: 'black'
          }}
        >
          <ThemedText style={{ marginHorizontal: '7%', fontWeight: 'bold',  marginTop: 8}}>{idName}</ThemedText>
          <ThemedText style={{marginHorizontal: '7%', marginBottom: 12, fontSize: 14}}>{formatIssued(issuedDate)}</ThemedText>
          {fields.map((attr, index,) => (
              <RecordField
                field={attr}
                hideFieldValue={hideFieldValues}
                onToggleViewPressed={() => {
                  const newShowState = [...shown]
                  newShowState[index] = !shown[index]
                  setShown(newShowState)
                }}
                shown={hideFieldValues ? !!shown[index] : true}
                hideBottomBorder={index === fields.length - 1}
              />
          ))}
          
          <ThemedText style={{
            fontWeight: 'bold',
            marginHorizontal: '8%',
            marginBottom: 10,
            fontSize: 16,
          }}>
            Issued By: <Text style={{fontWeight: 'normal', fontSize: 16}}>{issuer}</Text>
          </ThemedText>      
        </View>
        
        {/* <FlatList
          data={fields}
          keyExtractor={({ name }, index) => name || index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: attr, index }) =>
            field ? (
              field(attr, index, fields)
            ) : (
              <>
              <RecordField
                field={attr}
                hideFieldValue={hideFieldValues}
                onToggleViewPressed={() => {
                  const newShowState = [...shown]
                  newShowState[index] = !shown[index]
                  setShown(newShowState)
                }}
                shown={hideFieldValues ? !!shown[index] : true}
                hideBottomBorder={index === fields.length - 1}
              />
              </>
            )
          }
          ListHeaderComponent={
            header ? (
              <RecordHeader>
                {header()}
                {hideFieldValues ? (
                  <View style={styles.linkContainer}>
                    <TouchableOpacity
                      style={styles.link}
                      activeOpacity={1}
                      onPress={hideAll}
                      testID={testIdWithKey('HideAll')}
                      accessible={true}
                      accessibilityLabel={t('Record.HideAll')}
                      accessibilityRole="button"
                    >
                      <ThemedText style={ListItems.recordLink}>{t('Record.HideAll')}</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </RecordHeader>
            ) : null
          }
          ListFooterComponent={footer ? <RecordFooter>{footer()}</RecordFooter> : null}
        /> */}
      </View>
      {footer ? <RecordFooter>{footer()}</RecordFooter> : null}
    </View>
  )
}

export default Record
