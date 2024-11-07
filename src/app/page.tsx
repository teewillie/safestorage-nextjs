'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [storageUsed, setStorageUsed] = useState('0GB');
  const [cpuUsage, setCpuUsage] = useState('20%');
  const [memoryUsage, setMemoryUsage] = useState('45%');

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStorageUsed('1GB');
    setCpuUsage('20%');
    setMemoryUsage('45%');
    // Implement upload logic
  };

  const handleRename = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement rename logic
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implement delete logic
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
            <li><Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link></li>
            <li><Link href="/settings" className="hover:text-gray-300">Settings</Link></li>
            <li><Link href="/profile" className="hover:text-gray-300">Profile</Link></li>
            <li><Link href="/logout" className="hover:text-gray-300">Logout</Link></li>
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
                  <input type="file" name="file" required className="hidden" />
                </label>
                <span className="text-gray-600">No file chosen</span>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Upload
            </button>
          </form>
        </section>

        {/* File Management Section */}
        <section className="mb-8">
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
        </section>

        {/* System Information */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          <div className="space-y-2">
            <p>Total Storage Used: <span className="font-medium">{storageUsed}</span> of 5GB</p>
            <p>CPU Usage: <span className="font-medium">{cpuUsage}</span></p>
            <p>Memory: <span className="font-medium">{memoryUsage}</span></p>
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