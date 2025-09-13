import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function Hello({ name }: { name: string }) {
  return <button>Olá, {name}</button>
}

describe('client smoke', () => {
  it('renders a simple component', () => {
    render(<Hello name="Mundo" />)
    expect(screen.getByRole('button', { name: /olá, mundo/i })).toBeInTheDocument()
  })
})

