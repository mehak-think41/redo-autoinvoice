import React from 'react';
import { returnEmails } from '../../../mockData';

export default function ReturnEmails() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Return Emails</h2>
      <div className="space-y-4">
        {returnEmails.map((email) => (
          <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${email.status === 'unread' ? 'bg-blue-500' : 'bg-gray-300'} mr-2`} />
                <span className="font-medium">{email.sender}</span>
              </div>
              <span className="text-sm text-gray-500">{email.date}</span>
            </div>
            <h3 className="text-lg font-medium mt-2">{email.subject}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}