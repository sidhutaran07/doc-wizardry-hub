import ToolCard from "./ToolCard";
import { 
  Image, 
  Minimize2, 
  Scissors, 
  Merge, 
  FileText, 
  Lock, 
  RotateCw, 
  SplitSquareHorizontal,
  FileSignature,
  Layers
} from "lucide-react";

const tools = [
  {
    icon: Image,
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF format instantly",
    features: [
      "Support for multiple image formats",
      "Batch conversion available", 
      "Preserve image quality",
      "Custom page layouts"
    ],
    highlighted: true,
    endpoint: "image-to-pdf",
    acceptedFiles: ".jpg,.jpeg,.png,.gif,.bmp,.webp",
    multipleFiles: true,
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining document quality",
    features: [
      "Up to 90% size reduction",
      "Multiple compression levels",
      "Batch processing",
      "Original quality preserved"
    ],
    endpoint: "compress-pdf",
    acceptedFiles: ".pdf",
    multipleFiles: false,
  },
  {
    icon: Scissors,
    title: "PDF Cutter",
    description: "Split large PDFs into smaller documents or extract specific pages",
    features: [
      "Extract specific page ranges",
      "Split by page count",
      "Preview before splitting",
      "Bulk page extraction"
    ],
    endpoint: "split-pdf",
    acceptedFiles: ".pdf",
    multipleFiles: false,
  },
  {
    icon: Merge,
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document",
    features: [
      "Drag & drop reordering",
      "Unlimited file merging",
      "Custom page insertion",
      "Bookmark preservation"
    ],
    endpoint: "merge-pdf",
    acceptedFiles: ".pdf",
    multipleFiles: true,
  },
  {
    icon: FileText,
    title: "PDF to Text",
    description: "Extract text content from PDF documents for editing",
    features: [
      "OCR text recognition",
      "Multiple output formats",
      "Preserve formatting",
      "Batch text extraction"
    ]
  },
  {
    icon: Lock,
    title: "Protect PDF",
    description: "Add password protection and security to your documents",
    features: [
      "Password encryption",
      "Permission controls",
      "Digital signatures",
      "Watermark addition"
    ]
  },
  {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate PDF pages to correct orientation and improve readability",
    features: [
      "90°, 180°, 270° rotation",
      "Individual page rotation",
      "Bulk page rotation",
      "Preview before saving"
    ]
  },
  {
    icon: SplitSquareHorizontal,
    title: "PDF Organizer",
    description: "Reorder, delete, and organize pages within your PDF",
    features: [
      "Drag & drop page reordering",
      "Delete unwanted pages",
      "Duplicate pages",
      "Page thumbnails preview"
    ]
  },
  {
    icon: FileSignature,
    title: "Sign PDF",
    description: "Add digital signatures and annotations to your documents",
    features: [
      "Digital signature creation",
      "Handwritten signatures",
      "Text annotations",
      "Legal compliance"
    ]
  },
  {
    icon: Layers,
    title: "PDF Converter",
    description: "Convert PDFs to various formats including Word, Excel, PowerPoint",
    features: [
      "Convert to Word/Excel/PPT",
      "HTML and image exports",
      "Preserve document layout",
      "Batch conversion support"
    ]
  }
];

const ToolsGrid = () => {
  return (
    <section className="py-20 px-6 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Professional PDF Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to work with PDFs. From basic conversions to advanced document management, 
            our tools handle it all with precision and speed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              features={tool.features}
              highlighted={tool.highlighted}
              endpoint={tool.endpoint}
              acceptedFiles={tool.acceptedFiles}
              multipleFiles={tool.multipleFiles}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;