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
  
// Usa regex para formatar conforme o padrão brasileiro (XX) X XXXX-XXXX
const match = cleaned.match(/^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/)
if (!match) return ''
let result = ''
if (match[1]) result += `(${match[1]}`
if (match[1] && match[1].length === 2) result += ')'
if (match[2]) result += ` ${match[2]}`
if (match[3]) result += ` ${match[3]}`
if (match[4]) result += `-${match[4]}`
return result.trim()
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
