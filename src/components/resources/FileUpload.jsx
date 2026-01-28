import React, { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { Upload, File, Download, Loader } from 'lucide-react';
const FileUpload = ({ onFileUploaded, maxFileSize = 50, className = '', allowedTypes = ['*'] }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const uploadFile = async (file) => {
        if (file.size > maxFileSize * 1024 * 1024) {
            setUploadingFiles(prev => ({
                ...prev,
                [file.name]: { progress: 0, error: `File size must be less than ${maxFileSize}MB` }
            }));
            return;
        }
        if (allowedTypes.length &&
            !allowedTypes.some(type => type === '*' || file.type.match(type.replace('*', '.*')))) {
            setUploadingFiles(prev => ({
                ...prev,
                [file.name]: { progress: 0, error: 'File type not allowed' }
            }));
            return;
        }
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `uploads/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        setUploadingFiles(prev => ({
            ...prev,
            [file.name]: { progress: 0 }
        }));
        uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadingFiles(prev => ({
                ...prev,
                [file.name]: { progress }
            }));
        }, (error) => {
            console.error('Upload error:', error);
            setUploadingFiles(prev => ({
                ...prev,
                [file.name]: { progress: 0, error: error.message }
            }));
        }, async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const fileData = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    path: uploadTask.snapshot.ref.fullPath,
                    uploadedBy: 'user@example.com',
                    uploadedAt: serverTimestamp(),
                    createdAt: new Date()
                };
                const docRef = await addDoc(collection(db, 'files'), fileData);
                const uploadedFile = {
                    id: docRef.id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    uploadedBy: fileData.uploadedBy,
                    uploadedAt: new Date(),
                    path: fileData.path
                };
                setUploadedFiles(prev => [...prev, uploadedFile]);
                onFileUploaded?.(uploadedFile);
                setUploadingFiles(prev => {
                    const newState = { ...prev };
                    delete newState[file.name];
                    return newState;
                });
            }
            catch (error) {
                console.error('Error saving file metadata:', error);
                setUploadingFiles(prev => ({
                    ...prev,
                    [file.name]: { progress: 0, error: 'Failed to save file metadata' }
                }));
            }
        });
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(uploadFile);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(uploadFile);
        }
    };
    const downloadFile = (file) => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (<div className={`space-y-4 ${className}`}>
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Supports all file types up to {maxFileSize}MB
        </p>
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Choose Files
        </button>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} className="hidden" accept={allowedTypes.join(',')}/>
      </div>

      {Object.entries(uploadingFiles).map(([fileName, { progress, error }]) => (<div key={fileName} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="w-6 h-6 text-gray-500"/>
              <div>
                <p className="font-medium text-sm">{fileName}</p>
                {error ? (<p className="text-red-500 text-xs">{error}</p>) : (<p className="text-gray-500 text-xs">
                    {progress.toFixed(1)}% uploaded
                  </p>)}
              </div>
            </div>
            {!error && (<div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-500"/>
                <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
              </div>)}
          </div>
          {!error && (<div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>)}
        </div>))}

      {uploadedFiles.length > 0 && (<div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (<div key={file.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="w-6 h-6 text-gray-500"/>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => downloadFile(file)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors" title="Download">
                      <Download className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>))}
          </div>
        </div>)}
    </div>);
};
export default FileUpload;
