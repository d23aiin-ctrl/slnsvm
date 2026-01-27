'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

interface BulkImportExportProps {
  entityType: 'students' | 'teachers' | 'fees' | 'attendance';
  onImportSuccess?: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkImportExport({ entityType, onImportSuccess }: BulkImportExportProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entityLabels = {
    students: 'Students',
    teachers: 'Teachers',
    fees: 'Fees',
    attendance: 'Attendance',
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/bulk/export/${entityType}?format=${format}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await api.get(`/bulk/template/${entityType}?format=${format}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType}_import_template.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please select a CSV or Excel file.');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/bulk/import/${entityType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);

      if (response.data.success > 0 && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setImportResult({
        success: 0,
        failed: 1,
        errors: [error.response?.data?.detail || 'Failed to import data. Please check your file format.'],
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Import {entityLabels[entityType]}</h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  Download the template file, fill in your data, and upload it back.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate('csv')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    CSV Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel Template
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bulk-import-file"
                />
                <label
                  htmlFor="bulk-import-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV or Excel files only
                  </p>
                </label>
              </div>

              {/* Upload Progress / Results */}
              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Importing data...</span>
                </div>
              )}

              {importResult && (
                <div className={`rounded-lg p-4 ${importResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start gap-3">
                    {importResult.failed === 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Import Complete
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Successfully imported: <span className="font-medium text-green-600">{importResult.success}</span>
                        {importResult.failed > 0 && (
                          <>, Failed: <span className="font-medium text-red-600">{importResult.failed}</span></>
                        )}
                      </p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <p className="text-xs font-medium text-gray-700 mb-1">Errors:</p>
                          {importResult.errors.map((error, idx) => (
                            <p key={idx} className="text-xs text-red-600">{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Export {entityLabels[entityType]}</h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Choose the format to export all {entityLabels[entityType].toLowerCase()} data:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <FileText className="w-10 h-10 text-green-600" />
                  <span className="font-medium">CSV File</span>
                  <span className="text-xs text-gray-500">Comma-separated values</span>
                </button>

                <button
                  onClick={() => handleExport('xlsx')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <FileSpreadsheet className="w-10 h-10 text-green-700" />
                  <span className="font-medium">Excel File</span>
                  <span className="text-xs text-gray-500">Microsoft Excel format</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
