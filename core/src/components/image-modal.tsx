"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, ZoomIn, ZoomOut } from "lucide-react"
import { buildFileUrl } from "@/lib/file-utils"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageName: string
  imageUrl: string
  imageSize: string
}

export function ImageModal({ isOpen, onClose, imageName, imageUrl, imageSize }: ImageModalProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{imageName}</DialogTitle>
              <p className="text-sm text-muted-foreground">{imageSize}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const url = buildFileUrl(imageUrl)
                  window.open(url, '_blank')
                }}
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-center min-h-full">
            {/* Verificar se é uma URL válida de imagem */}
            {imageUrl ? (
              <img 
                src={buildFileUrl(imageUrl)}
                alt={imageName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom / 100})`
                }}
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', imageUrl)
                  // Se a imagem não carregar, mostrar placeholder
                  e.currentTarget.style.display = 'none'
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                  if (nextElement) {
                    nextElement.style.display = 'flex'
                  }
                }}
              />
            ) : null}
            
            {/* Fallback para quando a imagem não carrega */}
            <div 
              className="border rounded-lg shadow-lg bg-white transition-transform duration-200 hidden"
              style={{ 
                transform: `scale(${zoom / 100})`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <div className="w-[600px] h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-200 rounded-lg mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Erro ao carregar imagem</h3>
                    <p className="text-sm text-blue-700">{imageName}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Não foi possível exibir a imagem
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
