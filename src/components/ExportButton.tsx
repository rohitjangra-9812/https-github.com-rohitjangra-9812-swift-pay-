import React from 'react';

interface ExportButtonProps {
  data: any[];
  filename?: string;
}

export function ExportButton({ data, filename = 'transactions' }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
        // Escape quotes and wrap in quotes if there's a comma
        const cellString = String(cell).replace(/"/g, '""');
        return `"${cellString}"`;
      }).join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
    >
      Export CSV
    </button>
  );
}
