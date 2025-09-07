'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/FileUpload';
import { PDFViewer } from '@/components/PDFViewer'; // expects url | ArrayBuffer – we’ll pass url
import { FileText, Upload, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Feature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const PDFEditor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { toast } = useToast();

  // Create & cleanup object URL for the selected PDF
  useEffect(() => {
    if (!selectedFile) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  const handleFilesSelected = (files: File[]) => {
    if (!files?.length) return;

    const file = files[0];

    // Allow MIME or extension check as a fallback (mobile sometimes sends octet-stream)
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (isPdfMime || isPdfExt) {
      setSelectedFile(file);
      toast({
        title: 'PDF Loaded',
        description: `File "${file.name}" is ready for viewing & annotations.`,
      });
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid PDF file.',
        variant: 'destructive',
      });
    }
  };

  const openViewer = () => {
    if (!selectedFile || !blobUrl) {
      toast({
        title: 'No PDF',
        description: 'Upload a PDF first.',
      });
      return;
    }
    setIsViewerOpen(true);
  };

  const clearFile = () => {
    setIsViewerOpen(false);
    setSelectedFile(null); // effect will revoke blob URL
  };

  const features: Feature[] = useMemo(
    () => [
      {
        icon: Eye,
        title: 'PDF Viewing',
        description: 'High-quality PDF rendering with zoom and navigation controls',
      },
      {
        icon: Edit,
        title: 'Annotation Tools',
        description: 'Add text, shapes, drawings, and comments to your PDFs',
      },
      {
        icon: FileText,
        title: 'Text Editing',
        description: 'Insert new text layers or edit overlay text annotations',
      },
      {
        icon: Upload,
        title: 'Save & Export',
        description: 'Download your edited PDF with annotations preserved',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">PDF Editor & Viewer</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            View, annotate, and export your PDF documents. Add text, shapes, drawings, comments, and more.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, i) => (
            <Card key={i} className="text-center">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Editor Area */}
        <Card className="max-w-4
