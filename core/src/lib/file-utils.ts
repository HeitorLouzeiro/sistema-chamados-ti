/**
 * Utilitários para manipulação de arquivos e URLs
 */

/**
 * Constrói uma URL completa para um arquivo do backend
 */
export function buildFileUrl(fileUrl: string): string {
  if (!fileUrl) return ''
  
  // Se já é uma URL completa, retorna como está
  if (fileUrl.startsWith('http')) {
    return fileUrl
  }
  
  // Se começa com /, adiciona apenas o host
  if (fileUrl.startsWith('/')) {
    return `http://localhost:8000${fileUrl}`
  }
  
  // Caso contrário, adiciona /media/ antes
  return `http://localhost:8000/media/${fileUrl}`
}

/**
 * Verifica se um arquivo é uma imagem baseado no tipo MIME
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType && mimeType.startsWith('image/')
}

/**
 * Verifica se um arquivo é uma imagem baseado na extensão
 */
export function isImageExtension(filename: string): boolean {
  if (!filename) return false
  
  const extension = filename.toLowerCase().split('.').pop()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  
  return imageExtensions.includes(extension || '')
}

/**
 * Formata o tamanho do arquivo em bytes para uma string legível
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 bytes'
  
  const sizes = ['bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
