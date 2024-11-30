'use client';

import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import useSession from '@/lib/supabase/useBrowserSession';
import { useRouter } from 'next/navigation';
import FileData from '@/components/FileData';
import { User } from '@supabase/supabase-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FileData {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
}


export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileName, setFileName] = useState('No file chosen');
  const [newFileName, setNewFileName] = useState("")
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const session = useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.refresh();
      }
    }
    const fetchFiles = async () => {

      if (!session?.user) return;

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('uploaded_at', { ascending: false });


      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch files",
          variant: "destructive",
        });
        return;
      }

      setFiles(data || []);
      setShouldRefetch(false);
    };

    fetchFiles();
    checkSession();
  }, [session, shouldRefetch]);


  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }


    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      console.log(formData);

      // Replace with your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log("response", response);

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully",
      });

      setShouldRefetch(true);
      setSelectedFile(null);
      setFileName('No file chosen');
      setIsUploading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const openModal = async (fileName: string) => {
    setSelectedFileName(fileName);
    setNewFileName(fileName);
    setIsDialogOpen(true);
  }

  const handleRename = async (fileName: string) => {
    setIsDialogOpen(false);

    try {
      const response = await fetch(`/api/rename`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName, newFileName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename file');
      }

      toast({
        title: "File renamed",
        description: "Your file has been renamed successfully",
      });

      setShouldRefetch(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch(`/api/delete`, {
        method: 'POST',
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "File deleted",
        description: "Your file has been deleted successfully",
      });

      setShouldRefetch(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            SafeStorage
          </Link>
          <ul className="hidden md:flex space-x-6">

            {
              session?.user ? (
                <li><Link href="#" onClick={() => supabase.auth.signOut()} className="hover:text-gray-300">Logout</Link></li>
              ) : (
                <li><Link href="/auth" className="hover:text-gray-300">Login</Link></li>
              )
            }
          </ul>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

        {/* Upload Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <label className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800">
                  <span>Choose File</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFileName(file.name);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-gray-600">{fileName}</span>
              </div>
            </div>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </section>

        {/* File Management Section */}
        {/* <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">File Management</h2>
          <ul className="space-y-4">
            <li className="border p-4 rounded-lg shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="font-medium">example-file.txt</span>
                <div className="flex items-center space-x-2">
                  <form onSubmit={handleRename} className="flex items-center space-x-2">
                    <input
                      type="hidden"
                      name="oldName"
                      value="example-file.txt"
                    />
                    <input
                      type="text"
                      name="newName"
                      placeholder="New name"
                      required
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                    >
                      Rename
                    </button>
                  </form>
                  <form onSubmit={handleDelete} className="inline">
                    <input
                      type="hidden"
                      name="filename"
                      value="example-file.txt"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </form>
                  <Link
                    href="/share/example-file.txt"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    target="_blank"
                  >
                    Share
                  </Link>
                </div>
              </div>
            </li>
          </ul>
        </section> */}

        {/* System Information */}
        <section className="mb-8">
          <div className="space-y-2">
            {session?.user ? <>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">File Management</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">{file.file_name}</TableCell>
                          <TableCell>{file.file_type}</TableCell>
                          <TableCell>{formatBytes(file.file_size)}</TableCell>
                          <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(file.file_url, '_blank')}
                                className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handleDelete(file.file_name)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                  <button
                                    onClick={() => openModal(file.file_name)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-grey-700"
                                  >
                                    Rename
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rename File</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Input
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        placeholder="Enter new file name"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => handleRename(selectedFileName)}>
                                      Save Changes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            </> : <p>Please login to see your files</p>}


          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">SafeStorage</h3>
              <p className="text-gray-300">Secure, safe, and always available.</p>
            </div>
            <div>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}