export interface Registration {
  email: string
  name: string
  surname: string
  birth: string
  password: string
  confirmation: string
}

export function validateRegistration(value: Registration, today = new Date().toLocaleDateString('en-CA')): string {
  if (!value.name.trim() || !value.surname.trim() || value.name.trim().length > 100 || value.surname.trim().length > 100) return 'Introduce tu nombre y apellidos (máximo 100 caracteres).'
  const date = new Date(`${value.birth}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.birth) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.birth || value.birth < '1900-01-01' || value.birth > today) return 'Introduce una fecha de nacimiento válida, entre 1900 y hoy.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) || value.email.trim().length > 254) return 'Introduce un email válido.'
  if (value.password.length < 12 || value.password.length > 128) return 'Usa una contraseña de entre 12 y 128 caracteres.'
  if (value.password !== value.confirmation) return 'Las contraseñas no coinciden.'
  return ''
}
