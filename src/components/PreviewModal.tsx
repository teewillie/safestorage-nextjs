import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function PreviewModal({ isOpen, onClose, fileUrl, fileName }: PreviewModalProps) {
  const fileType = fileName.split('.').pop()?.toLowerCase();
  console.log(fileType);
  console.log(fileName);
  console.log(fileUrl);
  
  // File type checks
  const isOfficeDoc = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(fileType || '');
  const isPdf = fileType === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileType || '');
  const isVideo = ['mp4', 'webm', 'ogg'].includes(fileType || '');
  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileType || '');
  
  // Get appropriate viewer URL based on file type
  const getViewerUrl = (url: string) => {
    if (isOfficeDoc || isPdf) {
      // Google Docs viewer
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    } else if (isImage) {
      // Option 1: ImgBB Viewer
    //   return `https://image.ibb.co/view/${encodeURIComponent(url)}`;
      
      // Option 2: Cloudinary Media Viewer
    //   return `https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto/${encodeURIComponent(url)}`;
      
      // Option 3: Photobucket Viewer
      return `https://hosting.photobucket.com/images/i/viewer?url=${encodeURIComponent(url)}`;
    } else if (isVideo) {
      // Streamable for videos
      return `https://streamable.com/e/embed/${encodeURIComponent(url)}`;
    } else {
      return url;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-[60vh]">
          {(isOfficeDoc || isPdf || isImage) ? (
            <iframe
              src={getViewerUrl(fileUrl)}
              className="w-full h-full border-0"
              title={fileName}
              allowFullScreen
              referrerPolicy="no-referrer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : isVideo ? (
            <video 
              controls 
              className="w-full h-full"
              playsInline
              controlsList="nodownload"
            >
              <source src={fileUrl} type={`video/${fileType}`} />
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <div className="flex items-center justify-center h-full">
              <audio 
                controls 
                className="w-full max-w-md"
                controlsList="nodownload"
              >
                <source src={fileUrl} type={`audio/${fileType}`} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : (
            <iframe
              src={getViewerUrl(fileUrl)}
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