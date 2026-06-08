export type Recurring = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Contact {
  id: string
  name: string
  phone: string
  createdAt?: number
}

export interface Reminder {
  id: string
  contactId: string
  contactName: string
  message: string
  scheduledFor: number       // ms epoch
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  recurring: Recurring
  createdAt: number
  sentAt?: number
}

export interface ParsedInput {
  contactName: string
  message: string
  scheduledFor: Date
}
