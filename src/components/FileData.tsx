"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { formatBytes, formatDate } from "@/lib/utils" // You'll need to create this
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient"

interface FileData {
    id: string
    file_name: string
    file_type: string
    file_size: number
    file_url: string
    created_at: string
}


export default function Dashboard(user: User) {
    const client = createSupabaseBrowserClient();
    const [files, setFiles] = useState<FileData[]>([]);

    const handleDelete = async (fileId: string) => {
        try {
          const fileToDelete = files.find(f => f.id === fileId);
          if (!fileToDelete) return;
      
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('files')
            .remove([fileToDelete.file_name]);
      
          if (storageError) throw storageError;
      
          // Delete from database
          const { error: dbError } = await supabase
            .from('files')
            .delete()
            .eq('id', fileId);
      
          if (dbError) throw dbError;
      
          // Update UI
          setFiles(files.filter(f => f.id !== fileId));
      
          toast({
            title: "Success",
            description: "File deleted successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete file",
            variant: "destructive",
          });
        }
      };
    

    // Add this useEffect to fetch files
    useEffect(() => {
        const fetchFiles = async () => {
            console.log("Fetching files");
            console.log("user", user);
            if (!user) return;

            const { data, error } = await client
                .from('files')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
                toast({
                    title: "Error",
                    description: "Failed to fetch files",
                    variant: "destructive",
                });
                return;
            }

            setFiles(data || []);
        };

        fetchFiles();
    }, [user, client]);

    // ... existing code ...

    // Replace the File Management section with this:
    return (
        <>
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
                                <TableCell>{formatDate(file.created_at)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => window.open(file.file_url, '_blank')}
                                            className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => toast({
                                                variant: "destructive",
                                                title: "This would delete the file from the database and the storage",
                                                description: "Are you sure you want to delete this file?",
                                            })}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
        </>
    );
}