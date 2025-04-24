import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { Upload, X, AlertTriangle, Check, Trash2, FileUp } from 'lucide-react';
import {
  checkCookiesAvailable,
  uploadCookiesZip,
  uploadCookieFile,
  clearAllCookies
} from '../../services/adminService';

const CookieManager: React.FC = () => {
  const [cookieCount, setCookieCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const zipFileInputRef = useRef<HTMLInputElement>(null);
  const txtFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop states
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const [isDraggingTxt, setIsDraggingTxt] = useState(false);

  // Fetch cookie count on load and periodically
  useEffect(() => {
    fetchCookieCount();
    const interval = setInterval(fetchCookieCount, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch cookie count function
  const fetchCookieCount = async () => {
    try {
      const response = await checkCookiesAvailable();
      setCookieCount(response.count);
    } catch (error) {
      console.error('Error fetching cookie count:', error);
    }
  };

  // Handle clear all cookies
  const handleClearCookies = async () => {
    try {
      setIsClearing(true);

      const response = await clearAllCookies();

      if (response.success) {
        setUploadSuccess(response.message);
        setCookieCount(0);
      } else {
        setUploadError(response.message || 'Failed to clear cookies');
      }

      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing cookies:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to clear cookies');
    } finally {
      setIsClearing(false);
    }
  };

  // Handle ZIP file drop
  const handleZipDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZip(true);
  };

  const handleZipDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZip(false);
  };

  const handleZipDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingZip(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.zip')) {
      setUploadError('Please drop a valid ZIP file');
      return;
    }

    // Process the ZIP file
    handleZipFileUpload(file);
  };

  // Handle TXT file drop
  const handleTxtDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingTxt(true);
  };

  const handleTxtDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingTxt(false);
  };

  const handleTxtDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingTxt(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.txt')) {
      setUploadError('Please drop a valid TXT file');
      return;
    }

    // Process the TXT file
    handleTxtFileUpload(file);
  };

  // Refactored file upload handlers
  const handleZipFileUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setUploadError('Please select a valid ZIP file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const response = await uploadCookiesZip(file);

      if (response.success) {
        setUploadSuccess(`Successfully uploaded ${response.count} cookies from ZIP file`);
        // Refresh cookie count
        const countResponse = await checkCookiesAvailable();
        setCookieCount(countResponse.count);

        // Reset file input
        if (zipFileInputRef.current) {
          zipFileInputRef.current.value = '';
        }
      } else {
        setUploadError(response.message || 'Failed to upload ZIP file');
      }
    } catch (error) {
      console.error('Error uploading ZIP file:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload ZIP file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTxtFileUpload = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setUploadError('Please select a valid TXT file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const response = await uploadCookieFile(file);

      if (response.success) {
        setUploadSuccess('Successfully uploaded cookie file');
        // Refresh cookie count
        const countResponse = await checkCookiesAvailable();
        setCookieCount(countResponse.count);

        // Reset file input
        if (txtFileInputRef.current) {
          txtFileInputRef.current.value = '';
        }
      } else {
        setUploadError(response.message || 'Failed to upload cookie file');
      }
    } catch (error) {
      console.error('Error uploading cookie file:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload cookie file');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change events
  const handleZipInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleZipFileUpload(files[0]);
  };

  const handleTxtInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleTxtFileUpload(files[0]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Cookie Manager</h1>

      {/* Cookie Count */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg mb-6">
        <h2 className="text-lg font-medium text-gray-200 mb-4">Cookie Status</h2>
        <div className="flex items-center">
          <div className="text-3xl font-bold text-white mr-3">{cookieCount}</div>
          <div className={`text-sm ${cookieCount < 10 ? 'text-red-400' : 'text-green-400'}`}>
            {cookieCount < 10 ? (
              <span className="flex items-center">
                <AlertTriangle size={16} className="mr-1" />
                Low on cookies!
              </span>
            ) : (
              <span className="flex items-center">
                <Check size={16} className="mr-1" />
                Cookies available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h2 className="text-lg font-medium text-gray-200 mb-4">Upload Cookies</h2>

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg text-green-400 flex items-start">
            <Check size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>{uploadSuccess}</div>
            <button
              onClick={() => setUploadSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-400"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 flex items-start">
            <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>{uploadError}</div>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-500 hover:text-red-400"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ZIP Upload */}
          <div
            className={`bg-gray-700/50 rounded-lg p-4 border ${isDraggingZip ? 'border-purple-500 border-dashed' : 'border-gray-600'}`}
            onDragOver={handleZipDragOver}
            onDragLeave={handleZipDragLeave}
            onDrop={handleZipDrop}
          >
            <h3 className="text-md font-medium text-gray-300 mb-3">Upload ZIP File</h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload a ZIP file containing multiple cookie files (.txt)
            </p>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
              <FileUp size={32} className="text-gray-400 mb-3" />
              <p className="text-sm text-gray-400 mb-2 text-center">
                Drag & drop a ZIP file here, or click to select
              </p>

              <input
                type="file"
                ref={zipFileInputRef}
                accept=".zip"
                onChange={handleZipInputChange}
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => zipFileInputRef.current?.click()}
                className={`mt-3 py-2 px-4 rounded-lg flex items-center justify-center ${
                  isUploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Select ZIP File
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TXT Upload */}
          <div
            className={`bg-gray-700/50 rounded-lg p-4 border ${isDraggingTxt ? 'border-purple-500 border-dashed' : 'border-gray-600'}`}
            onDragOver={handleTxtDragOver}
            onDragLeave={handleTxtDragLeave}
            onDrop={handleTxtDrop}
          >
            <h3 className="text-md font-medium text-gray-300 mb-3">Upload Single File</h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload a single cookie file (.txt)
            </p>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
              <FileUp size={32} className="text-gray-400 mb-3" />
              <p className="text-sm text-gray-400 mb-2 text-center">
                Drag & drop a TXT file here, or click to select
              </p>

              <input
                type="file"
                ref={txtFileInputRef}
                accept=".txt"
                onChange={handleTxtInputChange}
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => txtFileInputRef.current?.click()}
                className={`mt-3 py-2 px-4 rounded-lg flex items-center justify-center ${
                  isUploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Select TXT File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cookies Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h2 className="text-lg font-medium text-gray-200 mb-4">Clear Cookies</h2>
        <p className="text-sm text-gray-400 mb-4">
          This will delete all cookie files from the server. This action cannot be undone.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Clear All Cookies
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 mb-3">Are you sure you want to delete all cookies?</p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearCookies}
                className={`py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center ${
                  isClearing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} className="mr-2" />
                    Yes, Clear All
                  </>
                )}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                disabled={isClearing}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieManager;
