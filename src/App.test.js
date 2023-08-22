import React from 'react';
import { render, fireEvent, waitFor, getByDisplayValue, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyFormComponent from './MyFormComponent';

const consoleSpy = jest.spyOn(console, 'log');
describe('MyFormComponent', () => {
  let getByTestId, getByPlaceholderText, getByText ,getByRole;

  beforeEach(() => {
    const queries = render(<MyFormComponent />);
    getByTestId = queries.getByTestId;
    getByPlaceholderText = queries.getByPlaceholderText;
    getByText = queries.getByText;
    getByRole = queries.getAllByRole;
  });

  it('submits with all fields correctly filled', () => {
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      agreeTerms: true,
      gender: 'male',
    });
  });

  it('handles very long valid names', () => {
    const longName = 'J'.repeat(1000); // A name with 1000 characters
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: longName } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: longName,
      email: 'john@example.com',
      agreeTerms: true,
      gender: 'male',
    });
  });

  it('handles complex email addresses', () => {
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'test.name+alias@example.co.uk' } });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'test.name+alias@example.co.uk',
      agreeTerms: true,
      gender: 'male',
    });
  });

  it('submits with gender changed to female', () => {
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[1]);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      agreeTerms: true,
      gender: 'female',
    });
  });

  it('re-submits after an initial successful submission', () => {
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      agreeTerms: true,
      gender: 'male',
    });

    // Change fields and resubmit
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[1]);
    fireEvent.click(getByText('Submit'));

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      agreeTerms: true,
      gender: 'female',
    });
  });

});

describe('MyFormComponent negative tests', () => {

  it("shows validation error when 'Name' is left blank", () => {
      const { getByPlaceholderText, getByText } = render(<MyFormComponent />);
      
      // Filling the other fields but leaving 'Name' blank
      fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getAllByRole('radio')[0]);
      fireEvent.click(screen.getAllByRole('checkbox')[0]);
      
      // Simulating form submission
      fireEvent.click(getByText('Submit'));
      
      // Expecting the validation error for 'Name'
      expect(getByText('Name must be at least 3 characters.')).toBeInTheDocument();
  });

  it("shows validation error for an invalid email", () => {
    const { getByPlaceholderText, getByText } = render(<MyFormComponent />);
    
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'invalidemail.com' } });
    fireEvent.click(getByText('Submit'));
    
    expect(getByText('Email must be valid.')).toBeInTheDocument();
  });

  it("shows validation error when 'Agree to Terms' is not checked", () => {
    const { getByPlaceholderText, getByText } = render(<MyFormComponent />);
    
    // Assuming other fields are filled correctly but leaving 'Agree to Terms' unchecked
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(getByText('Submit'));
    
    expect(getByText('You must agree to the terms.')).toBeInTheDocument();
  });

  it("shows validation error when no gender is selected", () => {
    const { getByPlaceholderText, getByText } = render(<MyFormComponent />);
    
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(getByText('Submit'));
    
    expect(getByText('You must select a gender.')).toBeInTheDocument();
  });

  it("shows validation error when name is less than 3 characters", () => {
    const { getByPlaceholderText, getByText } = render(<MyFormComponent />);
    
    fireEvent.change(getByPlaceholderText('Name'), { target: { value: 'Jo' } });
    fireEvent.click(getByText('Submit'));
    
    expect(getByText('Name must be at least 3 characters.')).toBeInTheDocument();
  });
});
