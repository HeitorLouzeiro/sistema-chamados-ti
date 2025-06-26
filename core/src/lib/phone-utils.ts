/**
 * Utilitários para formatação de telefone
 */

// Remove todos os caracteres não numéricos
export const removePhoneFormatting = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

// Formata o telefone no padrão brasileiro (XX) X XXXX-XXXX
export const formatPhone = (phone: string): string => {
  // Remove formatação existente
  const cleaned = removePhoneFormatting(phone)
  
  // Aplica a formatação baseada no tamanho
  if (cleaned.length === 0) {
    return ''
  } else if (cleaned.length <= 2) {
    return `(${cleaned}`
  } else if (cleaned.length <= 3) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`
  } else if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  } else {
    // Limita a 11 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
  }
}

// Valida se o telefone tem exatamente 11 dígitos
export const isValidPhone = (phone: string): boolean => {
  const cleaned = removePhoneFormatting(phone)
  return cleaned.length === 11
}

// Formata telefone para exibição (com formatação visual)
export const displayPhone = (phone: string): string => {
  if (!phone) return ''
  const cleaned = removePhoneFormatting(phone)
  return formatPhone(cleaned)
}

// Prepara telefone para envio ao backend (apenas números)
export const preparePhoneForBackend = (phone: string): string => {
  return removePhoneFormatting(phone)
}
