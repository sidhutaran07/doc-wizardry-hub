import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Canvas as FabricCanvas, Circle, Rect, IText, Path } from 'fabric'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Type, 
  Square, 
  Circle as CircleIcon,
  Pencil,
  Eraser,
  MousePointer,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  file: File | string | null
  onClose?: () => void
}

export const PDFViewer = ({ file, onClose }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'draw' | 'eraser'>('select')
  const [activeColor, setActiveColor] = useState('#ff0000')
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null)
  const [annotations, setAnnotations] = useState<{ [key: number]: any[] }>({})
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Initialize Fabric.js canvas for annotations
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 800,
      isDrawingMode: false,
    })

    canvas.freeDrawingBrush.color = activeColor
    canvas.freeDrawingBrush.width = 2

    setFabricCanvas(canvas)

    return () => {
      canvas.dispose()
    }
  }, [])

  // Update tool behavior
  useEffect(() => {
    if (!fabricCanvas) return

    fabricCanvas.isDrawingMode = activeTool === 'draw'
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor
      fabricCanvas.freeDrawingBrush.width = 2
    }
  }, [activeTool, activeColor, fabricCanvas])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    toast({
      title: "PDF Loaded",
      description: `Document loaded with ${numPages} pages`
    })
  }

  const handleToolClick = (tool: typeof activeTool) => {
    if (!fabricCanvas) return
    
    setActiveTool(tool)

    if (tool === 'text') {
      const text = new IText('Click to edit text', {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 16,
        fontFamily: 'Arial'
      })
      fabricCanvas.add(text)
      fabricCanvas.setActiveObject(text)
    } else if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 60
      })
      fabricCanvas.add(rect)
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        radius: 30
      })
      fabricCanvas.add(circle)
    }
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = direction === 'in' ? 
      Math.min(scale + 0.25, 3) : 
      Math.max(scale - 0.25, 0.5)
    setScale(newScale)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      saveCurrentPageAnnotations()
      setCurrentPage(currentPage - 1)
    } else if (direction === 'next' && currentPage < numPages) {
      saveCurrentPageAnnotations()
      setCurrentPage(currentPage + 1)
    }
  }

  const saveCurrentPageAnnotations = () => {
    if (!fabricCanvas) return
    
    const objects = fabricCanvas.getObjects()
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: objects.map(obj => obj.toObject())
    }))
  }

  const loadPageAnnotations = () => {
    if (!fabricCanvas || !annotations[currentPage]) return
    
    fabricCanvas.clear()
    annotations[currentPage].forEach(objData => {
      fabricCanvas.add(objData)
    })
    fabricCanvas.renderAll()
  }

  const handleClearAnnotations = () => {
    if (!fabricCanvas) return
    fabricCanvas.clear()
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: []
    }))
    toast({
      title: "Annotations Cleared",
      description: "All annotations removed from current page"
    })
  }

  const handleDownloadPDF = async () => {
    if (!pageRef.current) return

    try {
      saveCurrentPageAnnotations()
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      for (let i = 1; i <= numPages; i++) {
        if (i > 1) pdf.addPage()
        
        // This is a simplified version - in production you'd need more sophisticated PDF generation
        const canvas = await html2canvas(pageRef.current)
        const imgData = canvas.toDataURL('image/png')
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
      }
      
      pdf.save('edited-document.pdf')
      
      toast({
        title: "PDF Downloaded",
        description: "Your edited PDF has been downloaded"
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the PDF",
        variant: "destructive"
      })
    }
  }

  // Load annotations when page changes
  useEffect(() => {
    loadPageAnnotations()
  }, [currentPage, fabricCanvas])

  if (!file) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground">No PDF file selected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-16 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" onClick={handleRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Editing Tools */}
        <div className="flex items-center gap-1">
          <Button 
            variant={activeTool === 'select' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTool === 'text' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleToolClick('text')}
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTool === 'rectangle' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleToolClick('rectangle')}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTool === 'circle' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleToolClick('circle')}
          >
            <CircleIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTool === 'draw' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTool('draw')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAnnotations}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <Label htmlFor="color-picker" className="text-sm">Color:</Label>
          <Input
            id="color-picker"
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="w-12 h-8 p-1 border rounded"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col items-center">
            {/* Page Navigation */}
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {numPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange('next')}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* PDF Page with Annotations */}
            <div 
              ref={pageRef}
              className="relative border shadow-lg"
              style={{ 
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="relative"
              >
                <Page 
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              {/* Annotation Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-auto"
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}