import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINCreate from '../../src/screens/PINCreate'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'
import { ContainerProvider } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'

describe('PINCreate Screen', () => {
  test('PIN create renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()

    const mockNavigation = {
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
      // Add other properties that are used by StackScreenProps if necessary
  } as any

    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINCreate
              route={{} as any}
              navigation={mockNavigation}
              setAuthenticated={jest.fn()}
            />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )

    //Checking if there is a PIN inputs, confirm creation form if active
    const pinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const pinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    expect(pinInput1).not.toBe(null)
    expect(pinInput2).not.toBe(null)

    // Check that the main continue button is present
    const createPINButton = await tree.queryByTestId(testIdWithKey('CreatePIN'))
    expect(createPINButton).toBeTruthy()
  })
})
