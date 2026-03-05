import { useState } from 'react'
import { EVENT_TYPES } from '../constants/analytics'
import { Field, inputCls } from './ui/Field'
import type { CreateAnalyticsEntry } from '../types/analytics'

interface AddEntryFormProps {
  onSubmit: (entry: CreateAnalyticsEntry) => Promise<void>
}

interface FormState {
  gameId: string
  gameName: string
  playerId: string
  event: string
  value: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  gameId: '',
  gameName: '',
  playerId: '',
  event: EVENT_TYPES[0],
  value: '',
}

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {}
  if (!form.gameId.trim()) errors.gameId = 'Game ID is required'
  if (!form.gameName.trim()) errors.gameName = 'Game Name is required'
  if (!form.playerId.trim()) errors.playerId = 'Player ID is required'
  if (!form.event) errors.event = 'Event is required'
  if (!form.value || isNaN(Number(form.value))) errors.value = 'Value must be a number'
  return errors
}

export const AddEntryForm = ({ onSubmit }: AddEntryFormProps) => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const setField =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        gameId: form.gameId,
        gameName: form.gameName,
        playerId: form.playerId,
        event: form.event,
        value: Number(form.value),
      })
      setForm(INITIAL_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Field label="Game ID" htmlFor="gameId" error={errors.gameId}>
        <input
          id="gameId"
          type="text"
          value={form.gameId}
          onChange={setField('gameId')}
          className={inputCls(!!errors.gameId)}
        />
      </Field>
      <Field label="Game Name" htmlFor="gameName" error={errors.gameName}>
        <input
          id="gameName"
          type="text"
          value={form.gameName}
          onChange={setField('gameName')}
          className={inputCls(!!errors.gameName)}
        />
      </Field>
      <Field label="Player ID" htmlFor="playerId" error={errors.playerId}>
        <input
          id="playerId"
          type="text"
          value={form.playerId}
          onChange={setField('playerId')}
          className={inputCls(!!errors.playerId)}
        />
      </Field>
      <Field label="Event" htmlFor="event" error={errors.event}>
        <select
          id="event"
          value={form.event}
          onChange={setField('event')}
          className={inputCls(!!errors.event)}
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </Field>
      <Field label="Value" htmlFor="value" error={errors.value}>
        <input
          id="value"
          type="number"
          value={form.value}
          onChange={setField('value')}
          className={inputCls(!!errors.value)}
        />
      </Field>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {submitting ? 'Adding…' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}
