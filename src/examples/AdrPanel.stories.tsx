import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

function Placeholder() {
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      Open the <strong>Decision Records</strong> panel in the Storybook addons
      area to browse ADRs.
    </div>
  )
}

const meta: Meta<typeof Placeholder> = {
  title: 'Examples/ADR Panel',
  component: Placeholder,
  tags: ['ADR-0001'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const UsesDifferentAdr: Story = {
  tags: ['ADR-0002'],
}
