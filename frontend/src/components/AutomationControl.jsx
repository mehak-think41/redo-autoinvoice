import React, { useState } from 'react';
import { automationStats } from '../../../mockData';

export default function AutomationControl() {
  const [isRunning, setIsRunning] = useState(automationStats.status === 'running');

  const toggleAutomation = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Automation Control</h2>
        <button
          onClick={toggleAutomation}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? 'Stop Automation' : 'Start Automation'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Processed Today</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{automationStats.processedToday}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Accuracy Rate</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{automationStats.accuracy}%</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Queue Size</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{automationStats.queueSize}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500">Last Run</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">{automationStats.lastRun}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">System Status</h3>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="text-sm font-medium">{isRunning ? 'System Running' : 'System Stopped'}</span>
        </div>
      </div>
    </div>
  );
}