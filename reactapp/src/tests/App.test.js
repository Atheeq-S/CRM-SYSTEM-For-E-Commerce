// AllComponents.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, BrowserRouter } from 'react-router-dom';

// Components
import AddInteractionForm from '../components/AddInteractionForm';
import CustomerDetails from '../components/CustomerDetails';
import CustomerList from '../components/CustomerList';
import CustomerRegistrationForm from '../components/CustomerRegistrationForm';

// API mock
import { apiGet, apiPost } from '../utils/api';
jest.mock('../utils/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn()
}));

// Router mock for CustomerList
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  const mockNavigate = jest.fn();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    __esModule: true,
    mockNavigate,
  };
});

describe('All Components Combined Test Suite', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    if (require('react-router-dom').mockNavigate) {
      require('react-router-dom').mockNavigate.mockReset();
    }
  });

  // ---------------- AddInteractionForm ----------------
  describe('AddInteractionForm', () => {
    const sampleProps = { customerId: 2, onSuccess: jest.fn() };

    it('addInteractionFormValidation', async () => {
      render(<AddInteractionForm {...sampleProps} />);
      fireEvent.click(screen.getByTestId('add-btn'));
      expect(screen.getByTestId('interactionType-error')).toBeInTheDocument();
      expect(screen.getByTestId('description-error')).toBeInTheDocument();
      expect(screen.getByTestId('status-error')).toBeInTheDocument();
    });

    it('addInteractionFormSubmission', async () => {
      apiPost.mockResolvedValueOnce({ id: 1 });
      render(<AddInteractionForm {...sampleProps} />);
      fireEvent.change(screen.getByTestId('interactionType-select'), { target: { value: 'PURCHASE' } });
      fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'Buying stuff' } });
      fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'OPEN' } });
      fireEvent.click(screen.getByTestId('add-btn'));
      await screen.findByTestId('success-msg');
      expect(sampleProps.onSuccess).toHaveBeenCalled();
    });

    it('interactionTypeAndStatusDropdowns', () => {
      render(<AddInteractionForm {...sampleProps} />);
      expect(Array.from(screen.getByTestId('interactionType-select').options).map(o => o.value)).toContain('PURCHASE');
      expect(Array.from(screen.getByTestId('status-select').options).map(o => o.value)).toContain('OPEN');
    });
  });

  // ---------------- CustomerDetails ----------------
  describe('CustomerDetails', () => {
    it('renderCustomerDetailsComponent', async () => {
      apiGet.mockImplementation((url) => {
        if (url === '/api/customers/42') return Promise.resolve({ id: 42, firstName: 'Test', lastName: 'User', email: 'mail@mail.com', phoneNumber: '', customerType: 'VIP', registrationDate: '2024-05-28' });
        if (url === '/api/customers/42/interactions') return Promise.resolve([
          { id: 100, interactionType: 'INQUIRY', interactionDate: '2024-06-01T10:10:10', description: 'Inquiry details', status: 'OPEN' }
        ]);
        return Promise.reject(new Error('404'));
      });

      render(
        <MemoryRouter initialEntries={["/customers/42"]}>
          <Routes>
            <Route path="/customers/:id" element={<CustomerDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText('Customer Details');
      await screen.findByText('Test User');
      await screen.findByTestId('interaction-row-100');
      expect(screen.getByText((content) => content.includes('Inquiry details'))).toBeInTheDocument();

    });

    it('customerDetailsNotFound', async () => {
      apiGet.mockRejectedValue(new Error('Customer not found'));

      render(
        <MemoryRouter initialEntries={["/customers/55"]}>
          <Routes>
            <Route path="/customers/:id" element={<CustomerDetails />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByTestId('customer-detail-error');
      expect(screen.getByTestId('customer-detail-error').textContent).toContain('not found');
    });
  });

  // ---------------- CustomerList ----------------
  describe('CustomerList', () => {
    it('renderCustomerListComponent', async () => {
      apiGet.mockResolvedValueOnce([
        { id: 1, firstName: 'A', lastName: 'B', email: 'a@b.com', phoneNumber: '1234', customerType: 'VIP' }
      ]);

      render(<BrowserRouter><CustomerList /></BrowserRouter>);
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('customer-table')).toBeInTheDocument();
        expect(screen.getByText('A B')).toBeInTheDocument();
        expect(screen.getByText('VIP')).toBeInTheDocument();
      });
    });

    it('customerListEmptyState', async () => {
      apiGet.mockResolvedValueOnce([]);
      render(<BrowserRouter><CustomerList /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByTestId('empty-msg')).toBeInTheDocument();
      });
    });

    it('customerListLoadingState', () => {
      apiGet.mockReturnValue(new Promise(() => {}));
      render(<BrowserRouter><CustomerList /></BrowserRouter>);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('viewDetailsNavigation', async () => {
      apiGet.mockResolvedValueOnce([
        { id: 2, firstName: 'Foo', lastName: 'Bar', email: 'foo@bar.com', phoneNumber: '', customerType: 'REGULAR' }
      ]);

      render(<BrowserRouter><CustomerList /></BrowserRouter>);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('view-details-2'));
      expect(require('react-router-dom').mockNavigate).toHaveBeenCalledWith('/customers/2');
    });
  });

  // ---------------- CustomerRegistrationForm ----------------
  describe('CustomerRegistrationForm', () => {
    it('customerRegistrationFormValidation', async () => {
      render(<CustomerRegistrationForm />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
      expect(screen.getByTestId('lastName-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('customerType-error')).toBeInTheDocument();
    });

    it('customerRegistrationFormSubmission', async () => {
      apiPost.mockResolvedValueOnce({ id: 5, registrationDate: '2023-12-01' });

      render(<CustomerRegistrationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'Jake' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Wharton' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'jake@now.com' } });
      fireEvent.change(screen.getByTestId('customerType-select'), { target: { value: 'REGULAR' } });
      fireEvent.click(screen.getByTestId('submit-btn'));

      await screen.findByTestId('success-msg');
    });

    it('customerRegistrationFormError', async () => {
      apiPost.mockRejectedValueOnce(new Error('Customer with the same email already exists'));

      render(<CustomerRegistrationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'Amy' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Lee' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'amy@lee.com' } });
      fireEvent.change(screen.getByTestId('customerType-select'), { target: { value: 'PREMIUM' } });
      fireEvent.click(screen.getByTestId('submit-btn'));

      await screen.findByTestId('api-error');
      expect(screen.getByTestId('api-error').textContent).toBe('Customer with the same email already exists');
    });

    it('customerRegistrationFormReset', () => {
      render(<CustomerRegistrationForm />);
      fireEvent.change(screen.getByTestId('firstName-input'), { target: { value: 'Foo' } });
      fireEvent.change(screen.getByTestId('lastName-input'), { target: { value: 'Bar' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'foo@bar.com' } });
      fireEvent.change(screen.getByTestId('customerType-select'), { target: { value: 'VIP' } });
      fireEvent.click(screen.getByTestId('reset-btn'));

      expect(screen.getByTestId('firstName-input').value).toBe('');
      expect(screen.getByTestId('lastName-input').value).toBe('');
      expect(screen.getByTestId('email-input').value).toBe('');
      expect(screen.getByTestId('customerType-select').value).toBe('');
    });

    it('customerTypeDropdown', () => {
      render(<CustomerRegistrationForm />);
      const dropdown = screen.getByTestId('customerType-select');
      const values = Array.from(dropdown.options).map(o => o.value);
      expect(values).toContain('REGULAR');
      expect(values).toContain('PREMIUM');
      expect(values).toContain('VIP');
    });
  });

});
