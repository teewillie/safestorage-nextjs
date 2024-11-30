import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocViewerRenderers } from 'react-doc-viewer';

// Dynamically import DocViewer with no SSR
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
        </div>
      </DialogContent>
    </Dialog>
  );
} 