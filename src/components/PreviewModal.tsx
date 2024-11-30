import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocViewerRenderers } from 'react-doc-viewer';
import Image from 'next/image';
const DocViewer = dynamic(() => import('react-doc-viewer'), {
  ssr: false,
  loading: () => <div>Loading document viewer...</div>
});

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function PreviewModal({ isOpen, onClose, fileUrl, fileName }: PreviewModalProps) {
  const fileType = fileName.split('.').pop()?.toLowerCase();
  const isDocx = fileType === 'docx';
  const isPdf = fileType === 'pdf';
  const isImage = fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'gif';
  
  // Create Google Docs viewer URL for PDFs
  const getViewerUrl = (url: string) => {
    // Option 1: Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    
    // Option 2: Microsoft Office Online viewer (alternative)
    // return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  const docs = [
    {
      uri: fileUrl + '?download',
      fileName: fileName,
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-[60vh]">
          {isDocx ? (
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              style={{ height: '100%' }}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                },
              }}
            />
          ) : isPdf ? (
            <iframe
              src={getViewerUrl(fileUrl)}
              className="w-full h-full border-0"
              title={fileName}
              allowFullScreen
            />
          ) : isImage ? (
            <Image 
              src={fileUrl} 
              alt={fileName}
              width={1000}
              height={1000}
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={fileName}
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 