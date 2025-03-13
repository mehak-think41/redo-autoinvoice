import { Routes, Route, NavLink } from 'react-router-dom';
import { logout } from '../utils/auth';
import RecentInvoices from '../components/RecentInvoices';
import ProcessedInvoices from '../components/ProcessedInvoices';
import PendingInvoices from '../components/PendingInvoices';
import ReturnEmails from '../components/ReturnEmails';
import Inventory from '../components/Inventory';
import GapAnalysis from '../components/GapAnalysis';
import AutomationControl from '../components/AutomationControl';
import InvoiceDetails from './InvoiceDetails';

export default function Dashboard() {
  const navigation = [
    { name: 'Recent Invoices', path: '' },
    { name: 'Processed Invoices', path: 'processed' },
    { name: 'Pending Approvals', path: 'pending' },
    { name: 'Return Emails', path: 'emails' },
    { name: 'Inventory', path: 'inventory' },
    { name: 'GAP Analysis', path: 'gap' },
    { name: 'Automation', path: 'automation' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Invoice AI</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => logout()}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="" element={<RecentInvoices />} />
            <Route path="processed" element={<ProcessedInvoices />} />
            <Route path="pending" element={<PendingInvoices />} />
            <Route path="emails" element={<ReturnEmails />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="gap" element={<GapAnalysis />} />
            <Route path="automation" element={<AutomationControl />} />
            <Route path="invoice/:id" element={<InvoiceDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}