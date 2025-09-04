import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Eye, 
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calculator,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';
import { faker } from '@faker-js/faker';

interface TrialBalanceItem {
  account: string;
  accountCode: string;
  currentYear: number;
  priorYear: number;
  variance: number;
  variancePercent: number;
  category: 'assets' | 'liabilities' | 'equity' | 'income' | 'expenses';
}

interface Workpaper {
  id: number;
  type: 'lead-schedule' | 'variance-analysis' | 'management-letter' | 'engagement-letter';
  title: string;
  client: string;
  status: 'draft' | 'review' | 'final';
  createdDate: string;
  aiGenerated: boolean;
  content?: string;
}

const Workpapers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trial-balance' | 'workpapers' | 'analytics'>('trial-balance');
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedWorkpaper, setSelectedWorkpaper] = useState<Workpaper | null>(null);

  // Generate mock trial balance data
  const generateTrialBalance = (): TrialBalanceItem[] => {
    const accounts = [
      { name: 'Cash and Cash Equivalents', code: '1100', category: 'assets' as const },
      { name: 'Accounts Receivable', code: '1200', category: 'assets' as const },
      { name: 'Inventory', code: '1300', category: 'assets' as const },
      { name: 'Property, Plant & Equipment', code: '1500', category: 'assets' as const },
      { name: 'Accounts Payable', code: '2100', category: 'liabilities' as const },
      { name: 'Long-term Debt', code: '2500', category: 'liabilities' as const },
      { name: 'Share Capital', code: '3100', category: 'equity' as const },
      { name: 'Retained Earnings', code: '3200', category: 'equity' as const },
      { name: 'Sales Revenue', code: '4100', category: 'income' as const },
      { name: 'Cost of Goods Sold', code: '5100', category: 'expenses' as const },
      { name: 'Operating Expenses', code: '6100', category: 'expenses' as const },
      { name: 'Interest Expense', code: '7100', category: 'expenses' as const },
    ];

    return accounts.map(account => {
      const priorYear = faker.number.int({ min: 50000, max: 2000000 });
      const currentYear = priorYear + faker.number.int({ min: -200000, max: 300000 });
      const variance = currentYear - priorYear;
      const variancePercent = priorYear !== 0 ? (variance / priorYear) * 100 : 0;

      return {
        account: account.name,
        accountCode: account.code,
        currentYear,
        priorYear,
        variance,
        variancePercent,
        category: account.category,
      };
    });
  };

  // Generate mock workpapers
  const mockWorkpapers: Workpaper[] = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    type: faker.helpers.arrayElement(['lead-schedule', 'variance-analysis', 'management-letter', 'engagement-letter'] as const),
    title: faker.helpers.arrayElement([
      'Cash and Bank Reconciliation',
      'Revenue Analysis and Variance',
      'Fixed Asset Lead Schedule',
      'Management Letter - Internal Controls',
      'Engagement Letter Draft',
      'Expense Variance Analysis',
      'Debtors Age Analysis',
      'Inventory Valuation Review'
    ]),
    client: faker.company.name(),
    status: faker.helpers.arrayElement(['draft', 'review', 'final'] as const),
    createdDate: faker.date.recent().toISOString().split('T')[0],
    aiGenerated: faker.datatype.boolean(),
    content: faker.lorem.paragraphs(3),
  }));

  const onDrop = (acceptedFiles: File[]) => {
    console.log('Trial balance files uploaded:', acceptedFiles);
    // Process CSV/Excel files and generate trial balance
    const generated = generateTrialBalance();
    setTrialBalanceData(generated);
    setShowUploadModal(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateAIWorkpaper = (type: string) => {
    // Mock AI generation
    const content = `This ${type} has been automatically generated using AI analysis of your trial balance data. 

Key findings:
- Material variances identified in revenue accounts (+15.2%)
- Significant increase in operating expenses (+8.7%)
- Recommended review of expense categorization
- Consider implementation of additional internal controls

This analysis should be reviewed by a qualified accountant before finalization.`;

    const newWorkpaper: Workpaper = {
      id: mockWorkpapers.length + 1,
      type: type as any,
      title: `AI Generated ${type.replace('-', ' ').toUpperCase()}`,
      client: 'Current Analysis',
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      aiGenerated: true,
      content,
    };

    setSelectedWorkpaper(newWorkpaper);
  };

  const tabs = [
    { id: 'trial-balance', name: 'Trial Balance', icon: FileSpreadsheet },
    { id: 'workpapers', name: 'Workpapers', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workpapers</h1>
          <p className="text-gray-600 mt-1">AI-powered workpaper generation and analysis.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Trial Balance</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'trial-balance' && (
          <div className="space-y-6">
            {trialBalanceData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trial Balance Data</h3>
                <p className="text-gray-600 mb-4">Upload your trial balance to get started with AI-powered workpaper generation.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Trial Balance</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Trial Balance Analysis</h3>
                    <div className="flex space-x-3">
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                        <Download className="w-4 h-4 inline mr-1" />
                        Export
                      </button>
                      <button
                        onClick={() => generateAIWorkpaper('variance-analysis')}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                      >
                        <Brain className="w-4 h-4 inline mr-1" />
                        AI Analysis
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Year
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prior Year
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variance
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trialBalanceData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.account}</div>
                              <div className="text-sm text-gray-500">{item.accountCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.currentYear)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.priorYear)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getVarianceColor(item.variance)}`}>
                            <div className="flex items-center justify-end space-x-1">
                              {item.variance > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : item.variance < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                              ) : null}
                              <span>{formatCurrency(item.variance)}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getVarianceColor(item.variance)}`}>
                            {item.variancePercent.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workpapers' && (
          <div className="space-y-6">
            {/* AI Generation Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Workpaper Generation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: 'lead-schedule', name: 'Lead Schedules', icon: Calculator, description: 'Generate detailed lead schedules' },
                  { type: 'variance-analysis', name: 'Variance Analysis', icon: TrendingUp, description: 'Analyze account variances' },
                  { type: 'management-letter', name: 'Management Letter', icon: FileText, description: 'Draft management letters' },
                  { type: 'engagement-letter', name: 'Engagement Letter', icon: FileText, description: 'Create engagement letters' },
                ].map((option) => (
                  <motion.div
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => generateAIWorkpaper(option.type)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <option.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">{option.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Existing Workpapers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Workpapers</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockWorkpapers.map((workpaper, index) => (
                    <motion.div
                      key={workpaper.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedWorkpaper(workpaper)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                            <span>{workpaper.title}</span>
                            {workpaper.aiGenerated && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center space-x-1">
                                <Brain className="w-3 h-3" />
                                <span>AI</span>
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{workpaper.client} • {workpaper.createdDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workpaper.status)}`}>
                          {workpaper.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Assets', value: 'R 2,450,000', change: '+12.5%', positive: true },
                  { label: 'Total Revenue', value: 'R 1,200,000', change: '+8.3%', positive: true },
                  { label: 'Operating Expenses', value: 'R 850,000', change: '+15.2%', positive: false },
                  { label: 'Net Profit Margin', value: '15.8%', change: '-2.1%', positive: false },
                ].map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      metric.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.positive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Insights</span>
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'warning',
                    title: 'Expense Growth Alert',
                    description: 'Operating expenses increased by 15.2% YoY, significantly above industry average.',
                    action: 'Review expense categorization'
                  },
                  {
                    type: 'info',
                    title: 'Revenue Trend',
                    description: 'Revenue growth is consistent with industry trends at 8.3% YoY.',
                    action: 'Consider expansion opportunities'
                  },
                  {
                    type: 'success',
                    title: 'Asset Management',
                    description: 'Asset utilization ratios are within optimal ranges.',
                    action: 'Maintain current strategy'
                  },
                ].map((insight, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.type === 'warning' ? 'bg-red-500' :
                        insight.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-2">
                          {insight.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Trial Balance</h3>
              <p className="text-sm text-gray-600 mt-1">Upload your trial balance in CSV or Excel format</p>
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
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">CSV or Excel files only</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Simulate file upload and generate mock data
                  const generated = generateTrialBalance();
                  setTrialBalanceData(generated);
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Generate Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workpaper Detail Modal */}
      {selectedWorkpaper && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <span>{selectedWorkpaper.title}</span>
                  {selectedWorkpaper.aiGenerated && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Brain className="w-3 h-3" />
                      <span>AI Generated</span>
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{selectedWorkpaper.client} • {selectedWorkpaper.createdDate}</p>
              </div>
              <button
                onClick={() => setSelectedWorkpaper(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-96">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{selectedWorkpaper.content}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setSelectedWorkpaper(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Edit Workpaper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workpapers;
