import React, { useState } from 'react';

const JsonViewer = ({ data }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="mt-8 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
                <span className="text-gray-300 font-mono text-sm">jobs_data.json</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    {copied ? '✅ Copied!' : '📋 Copy JSON'}
                </button>
            </div>
            <div className="p-6 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm leading-relaxed">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default JsonViewer;
