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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Editor
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedFile ? (
              <div className="space-y-6">
                <FileUpload accept=".pdf,application/pdf" multiple={false} onFilesSelected={handleFilesSelected}>
                  Drop your PDF file here or click to browse
                </FileUpload>

                <div className="text-center">
                  <p className="text-muted-foreground">Upload a PDF file to start viewing and editing</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold break-all">{selectedFile.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Fully controlled dialog (no DialogTrigger) */}
                    <Button onClick={openViewer}>
                      <Edit className="h-4 w-4 mr-2" />
                      Open Editor
                    </Button>

                    <Button variant="outline" onClick={clearFile}>
                      Remove File
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Editor Features:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Add text annotations and comments</li>
                    <li>• Draw shapes (rectangles, circles)</li>
                    <li>• Free-hand drawing with pen tool</li>
                    <li>• Zoom and rotate pages</li>
                    <li>• Navigate between pages</li>
                    <li>• Download edited PDF</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controlled Dialog lives at root so it mounts once */}
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>PDF Editor {selectedFile ? `- ${selectedFile.name}` : ''}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {/* Pass the blob URL, not the File */}
              {blobUrl ? (
                <PDFViewer
                  url={blobUrl}
                  onClose={() => setIsViewerOpen(false)}
                  // pass any other props your viewer expects
                />
              ) : (
                <div className="h-full grid place-items-center text-muted-foreground">
                  No PDF loaded
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PDFEditor;
