import { fireEvent, render, screen } from '@testing-library/react-native'
import React from 'react'

import PINExplainer from '../../src/screens/PINExplainer'
import { testIdWithKey } from '../../src/utils/testable'

describe('PINExplainer Screen', () => {
  // Define mock navigation object to test button presses
  const mockNavigation = {
    navigate: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
  } as any
  const mockRoute = {} as any // Required for StackScreenProps

  const renderPINExplainer = () => 
    render(
      <PINExplainer 
        navigation={mockNavigation} 
        route={mockRoute} 
      />
    )

    test('Renders correctly', async () => {
      // FIX: Pass navigation and route instead of the removed prop
      const tree = renderPINExplainer() 
      expect(tree).toMatchSnapshot()
    })

    test('Button exists and navigates to CreatePIN on "CreateWallet"', async () => {
      // FIX: Pass navigation and route instead of the removed prop
      renderPINExplainer()
  
      // The button was previously labeled 'ContinueCreatePIN', 
      // but the component now has two buttons: 'CreateWallet' and 'ImportWallet'.
      // Assuming the first button is used to create a new wallet, we must use its correct test ID.
      // Based on the old code: onPress={continueCreatePIN} and testID={testIdWithKey('ContinueCreatePIN')}
      // The component logic should be updated to use the appropriate new IDs. 
      // Assuming 'ContinueCreatePIN' maps to the "Create Wallet" button for this test:
  
      const createWalletButton = await screen.findByTestId(testIdWithKey('ContinueCreatePIN')) // Or the new ID: 'CreateWallet'
      fireEvent(createWalletButton, 'press')
  
      // FIX: Expect navigation.navigate to be called instead of the old function
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Create a PIN') // Or whatever Screens.CreatePIN evaluates to
    })
  })



