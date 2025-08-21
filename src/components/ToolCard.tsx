import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/FileUpload";
import { LucideIcon, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callEdgeFunction } from "@/lib/supabase";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  endpoint?: string;
  acceptedFiles?: string;
  multipleFiles?: boolean;
}

const ToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features, 
  highlighted = false,
  endpoint,
  acceptedFiles = ".pdf",
  multipleFiles = false
}: ToolCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    if (!endpoint) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      
      if (multipleFiles) {
        files.forEach(file => formData.append('files', file));
      } else {
        formData.append('file', files[0]);
      }

      const response = await callEdgeFunction(endpoint, formData);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult(data);
        toast({
          title: "Success!",
          description: `${title} completed successfully`,
        });
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Processing failed. Please check your connection and try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'processed-file.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL to prevent memory leaks
    if (url.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };
  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2
      ${highlighted ? 'ring-2 ring-primary shadow-glow' : 'shadow-card'}
      bg-gradient-card border-border/50
    `}>
      {highlighted && (
        <div className="absolute top-0 right-0 bg-gradient-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
          Popular
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`
          w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300
          ${highlighted 
            ? 'bg-gradient-primary text-primary-foreground shadow-glow' 
            : 'bg-gradient-subtle text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground'
          }
        `}>
          <Icon className="w-8 h-8" />
        </div>
        
        <CardTitle className="text-xl font-bold text-foreground mb-2">
          {title}
        </CardTitle>
        
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          variant="tool" 
          className="w-full group-hover:bg-gradient-primary group-hover:text-primary-foreground group-hover:border-primary"
          asChild
        >
          {endpoint ? (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button>Use Tool</button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {title}
                  </DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {!result ? (
                    <FileUpload
                      accept={acceptedFiles}
                      multiple={multipleFiles}
                      onFilesSelected={handleFilesSelected}
                    >
                      Drop your {acceptedFiles.replace(/\./g, "").replace(/,/g, "/").toUpperCase()} files here or click to browse
                    </FileUpload>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Processing Complete!
                        </h3>
                        {result.downloadUrl && (
                          <Button
                            onClick={() => handleDownload(result.downloadUrl)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download Result
                          </Button>
                        )}
                        {result.splitFiles && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">Split Files:</p>
                            {result.splitFiles.map((file: any, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(file.downloadUrl, file.fileName)}
                                className="mr-2 mb-2"
                              >
                                Pages {file.pages}
                              </Button>
                            ))}
                          </div>
                        )}
                        {result.compressionRatio && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                            Compressed by {result.compressionRatio}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setResult(null);
                          setIsOpen(false);
                        }}
                      >
                        Process Another File
                      </Button>
                    </div>
                  )}
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Processing your file...</span>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <button disabled>Coming Soon</button>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToolCard;