import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import Terms from '../../src/screens/Terms'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'
import { BasicAppContext } from '../helpers/app'

describe('Terms Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Renders correctly', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <BasicAppContext>
          <AuthContext.Provider value={authContext}>
            <Terms visible={true}
        onAgree={jest.fn()}
        onClose={jest.fn()}/>
          </AuthContext.Provider>
        </BasicAppContext>
      </StoreProvider>
    )
    expect(tree).toMatchSnapshot()
  })
  test('Calls onAgree when Accept is pressed', () => {
      const onAgreeMock = jest.fn()

      const { getByTestId } = render(
        <BasicAppContext>
          <Terms visible={true} onAgree={onAgreeMock} onClose={jest.fn()} />
        </BasicAppContext>
      )

      const acceptButton = getByTestId(testIdWithKey('Accept'))
      fireEvent.press(acceptButton)

      expect(onAgreeMock).toHaveBeenCalled()
    })

    test('Calls onClose when Back is pressed', () => {
      const onCloseMock = jest.fn()

      const { getByTestId } = render(
        <BasicAppContext>
          <Terms visible={true} onAgree={jest.fn()} onClose={onCloseMock} />
        </BasicAppContext>
      )

      const backButton = getByTestId(testIdWithKey('Back'))
      fireEvent.press(backButton)

      expect(onCloseMock).toHaveBeenCalled()
    })
})
