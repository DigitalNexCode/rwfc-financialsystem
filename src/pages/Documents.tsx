import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  Zap
} from 'lucide-react';
import { faker } from '@faker-js/faker';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  client: string;
  category: string;
  aiStatus: 'processed' | 'processing' | 'review-needed' | 'failed';
  confidence: number;
  extractedData?: {
    amount?: string;
    date?: string;
    vendor?: string;
    vatAmount?: string;
  };
}

const Documents: React.FC = () => {
  const [view, setView] = useState<'inbox' | 'bulk'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processed' | 'processing' | 'review-needed'>('all');
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  // Generate mock documents
  const mockDocuments: Document[] = Array.from({ length: 15 }, (_, index) => {
    const confidence = faker.number.int({ min: 65, max: 99 });
    return {
      id: index + 1,
      name: faker.system.fileName(),
      type: faker.helpers.arrayElement(['PDF', 'Excel', 'Word', 'Image']),
      size: `${faker.number.int({ min: 100, max: 5000 })} KB`,
      uploadDate: faker.date.recent().toISOString().split('T')[0],
      client: faker.company.name(),
      category: faker.helpers.arrayElement(['Invoice', 'Bank Statement', 'Tax Document', 'Receipt', 'Contract']),
      aiStatus: confidence > 85 ? 'processed' : confidence > 70 ? 'review-needed' : 'processing',
      confidence,
      extractedData: {
        amount: `R ${faker.number.int({ min: 100, max: 50000 }).toLocaleString()}`,
        date: faker.date.recent().toISOString().split('T')[0],
        vendor: faker.company.name(),
        vatAmount: `R ${faker.number.int({ min: 15, max: 7500 }).toLocaleString()}`,
      }
    };
  });

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.aiStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onDrop = (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    // Handle file upload here
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'review-needed':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">AI-powered document processing and management.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setView('inbox')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'inbox'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Document Inbox
          </button>
          <button
            onClick={() => setView('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {view === 'bulk' ? (
        /* Bulk Upload View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="text-center mb-6">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Bulk Document Upload</h3>
            <p className="text-gray-600">Upload multiple documents at once for AI processing</p>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">PDF, Excel, Word, Images up to 10MB each</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">AI Classification</h4>
              <p className="text-sm text-gray-600">Automatically categorizes documents</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Data Extraction</h4>
              <p className="text-sm text-gray-600">Extracts key fields and values</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Confidence Scoring</h4>
              <p className="text-sm text-gray-600">Quality assessment for each document</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Document Inbox View */
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="processed">Processed</option>
                  <option value="processing">Processing</option>
                  <option value="review-needed">Review Needed</option>
                </select>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Documents', value: mockDocuments.length, color: 'blue' },
              { label: 'Auto-Processed', value: mockDocuments.filter(d => d.aiStatus === 'processed').length, color: 'green' },
              { label: 'Need Review', value: mockDocuments.filter(d => d.aiStatus === 'review-needed').length, color: 'yellow' },
              { label: 'Processing', value: mockDocuments.filter(d => d.aiStatus === 'processing').length, color: 'purple' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <FileText className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
                {selectedDocs.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{selectedDocs.length} selected</span>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocs(filteredDocuments.map(d => d.id));
                          } else {
                            setSelectedDocs([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extracted Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={selectedDocs.includes(doc.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocs([...selectedDocs, doc.id]);
                            } else {
                              setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.type} • {doc.size}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.client}</div>
                        <div className="text-sm text-gray-500">{doc.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.aiStatus)}
                          <span className="text-sm text-gray-900 capitalize">
                            {doc.aiStatus.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(doc.confidence)}`}>
                          {doc.confidence}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.extractedData && (
                          <div className="text-sm">
                            <div className="text-gray-900">Amount: {doc.extractedData.amount}</div>
                            <div className="text-gray-500">VAT: {doc.extractedData.vatAmount}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Documents;
