import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { invoiceDetails } from "../../../mockData"; // Import mock data

function InvoiceDetails() {
  const { id } = useParams(); // Get invoice ID from URL
  const navigate = useNavigate();
  const invoice = invoiceDetails[id]; // Get the invoice by ID

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Invoice not found</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Invoices</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Invoice Header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Invoice #{invoice.invoice_number}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Issued on {new Date(invoice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    invoice.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invoice.status}
                </span>
                <p className="mt-2 text-sm text-gray-500">
                  Due by {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - PDF Preview Placeholder */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Invoice Preview
                </h2>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Preview not available</p>
                </div>
              </div>

              {/* Right Column - Details and Tabs */}
              <div>
                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex -mb-px space-x-8">
                    {["Details", "Line Items", "Approval History"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() =>
                            setActiveTab(tab.toLowerCase().replace(" ", ""))
                          }
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.toLowerCase().replace(" ", "")
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">
                          Amount
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">
                          Confidence Score
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {invoice.confidence_score}%
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
                        Supplier Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{invoice.supplier}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.supplier_address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.supplier_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.supplier_phone}
                      </p>
                    </div>

                    {invoice.notes && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          Notes
                        </h3>
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "lineitems" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoice.line_items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${item.unit_price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "approvalhistory" && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Approval history feature coming soon!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetails;
