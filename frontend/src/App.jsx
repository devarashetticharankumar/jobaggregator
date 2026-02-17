import { useState, useEffect } from 'react';
import { fetchJobs, triggerManualScrape } from './api';
import JobList from './components/JobList';
import JsonViewer from './components/JsonViewer';

function App() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'json'

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await fetchJobs();
            setJobs(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch jobs. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleScrape = async () => {
        try {
            setScraping(true);
            setError(null);
            console.log('Triggering manual scrape...');
            const data = await triggerManualScrape();
            console.log('Scrape result received:', data);

            // Set state to ONLY the jobs returned from the current scrape
            if (data && data.jobs) {
                setJobs(data.jobs);
            }

            if (data && data.jobsAdded === 0) {
                // If it's a second trigger and nothing new was added, show a note
                console.log('No new jobs were added.');
            }
        } catch (err) {
            console.error('Scrape error:', err);
            setError('Scraping failed due to a network error or server crash. Check the backend terminal for logs.');
        } finally {
            setScraping(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">JobAggregator <span className="text-indigo-600 text-sm font-normal">v1.1</span></h1>
                        <p className="text-gray-500 mt-1">Real-time job listings (Direct JSON Return)</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-100 p-1 rounded-xl flex">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                List View
                            </button>
                            <button
                                onClick={() => setViewMode('json')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'json' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                JSON View
                            </button>
                        </div>
                        <button
                            onClick={handleScrape}
                            disabled={scraping}
                            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${scraping
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'
                                }`}
                        >
                            {scraping ? 'Scraping...' : 'Trigger Scrape'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                        <p className="text-red-700 font-bold">Error: {error}</p>
                    </div>
                )}

                {loading && !scraping ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse text-indigo-600 font-bold text-xl">Loading Jobs from Database...</div>
                    </div>
                ) : scraping ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-indigo-600 font-bold text-xl animate-pulse">Scraping Glassdoor...</div>
                        <p className="text-gray-500">This may take 1-2 minutes. Please wait.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <JobList jobs={jobs} />
                        ) : (
                            <JsonViewer data={jobs} />
                        )}
                    </>
                )}
            </main>

            <footer className="bg-white border-t border-gray-200 py-10 mt-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400">© 2026 JobAggregator AI. Direct Mode Enabled.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
