import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Eye, 
  Edit, 
  Download, 
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const PDFEditorPreview = () => {
  const features = [
    {
      icon: Eye,
      title: "High-Quality PDF Viewing",
      description: "Crystal clear PDF rendering with zoom, rotation, and navigation controls",
      badge: "Essential"
    },
    {
      icon: Edit,
      title: "Advanced Annotation Tools",
      description: "Add text, shapes, drawings, highlights, and sticky notes to your documents",
      badge: "Pro"
    },
    {
      icon: FileText,
      title: "Text Editing & OCR",
      description: "Edit existing text, add new content, and extract text from scanned PDFs",
      badge: "Premium"
    },
    {
      icon: Download,
      title: "Save & Export",
      description: "Download your edited PDFs with all annotations and changes preserved",
      badge: "Included"
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant PDF loading and real-time editing without lag"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "All editing happens locally - your documents never leave your device"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Edit PDFs directly without switching between multiple applications"
    }
  ]

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        
        <CardTitle className="text-2xl font-bold text-foreground mb-2">
          PDF Editor & Viewer
        </CardTitle>
        
        <p className="text-muted-foreground">
          Professional PDF editing with annotations, text editing, and advanced viewing tools
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Key Features</h3>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{feature.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Why Choose Our Editor?</h3>
          <div className="grid gap-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <benefit.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <span className="font-medium">{benefit.title}</span>
                  <span className="text-muted-foreground"> - {benefit.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t">
          <Button asChild className="w-full group-hover:bg-gradient-primary">
            <Link to="/pdf-editor">
              Open PDF Editor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}