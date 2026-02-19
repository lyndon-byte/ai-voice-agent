import { useState, useEffect } from 'react';
import axios from 'axios';
import Portal from '../Shared/Portal';

export default function VoiceDrawer({ isOpen, onClose, onSelect, currentVoice }) {
    
    const [voices, setVoices] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedAge, setSelectedAge] = useState('');

    const categories = ['Narration', 'Conversational', 'Characters', 'Social Media', 'Entertainment', 'Advertisement', 'Educational'];
    const genders = ['Male', 'Female', 'Neutral'];
    const ages = ['Young', 'Middle Aged', 'Old'];

    const fetchVoices = async () => {
        setLoading(true);

        try {
            
            const params = {
                searchQuery: searchQuery
            };
            
            // Add filters to params if they're selected
            if (selectedCategory) params.searchQuery = selectedCategory;
            if (selectedGender) params.searchQuery = selectedGender;
            if (selectedAge) params.searchQuery = selectedAge;
            
            const response = await axios.get(`/app/voices`, { params });
            setVoices(response.data.voices || response.data || []);
        } catch (error) {
            console.error('Error fetching voices:', error);
            setVoices([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount or when drawer opens
    useEffect(() => {
        if (isOpen) {
            fetchVoices();
            setSearchQuery('');
            setSelectedCategory('');
            setSelectedGender('');
            setSelectedAge('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Fetch when filters change
    useEffect(() => {
        if (isOpen) {
            fetchVoices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, selectedGender, selectedAge]);

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Trigger search on Enter or after debounce
    useEffect(() => {
        if (isOpen) {
            const timeoutId = setTimeout(() => {
                fetchVoices();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Handle voice preview play
    const handlePlay = (voice) => {
        // Stop currently playing audio
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }

        if (playingVoiceId === voice.voice_id) {
            setPlayingVoiceId(null);
            setAudioElement(null);
        } else {
            const audio = new Audio(voice.preview_url);
            audio.play();
            setPlayingVoiceId(voice.voice_id);
            setAudioElement(audio);
            
            audio.onended = () => {
                setPlayingVoiceId(null);
                setAudioElement(null);
            };
        }
    };

    return (
        <Portal>
            <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
                isOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
                        isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onClose}
                ></div>
                
                {/* Drawer */}
                <div className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Select Voice</h2>
                            <p className="mt-0.5 text-sm text-gray-500">Choose a voice from library</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>


                    {/* Filters */}
                    <div className="border-gray-200 px-6 py-3">

                        <div className="flex flex-wrap gap-2">
                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Gender Filter */}
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">All Genders</option>
                                {genders.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>

                            {/* Age Filter */}
                            <select
                                value={selectedAge}
                                onChange={(e) => setSelectedAge(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">All Ages</option>
                                {ages.map(age => (
                                    <option key={age} value={age}>{age}</option>
                                ))}
                            </select>

                            {/* Clear Filters */}
                            {(selectedCategory || selectedGender || selectedAge) && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedGender('');
                                        setSelectedAge('');
                                    }}
                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Voice List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                    <p className="mt-4 text-sm text-gray-500">Loading voices...</p>
                                </div>
                            </div>
                        ) : voices.length > 0 ? (
                            <div className="grid gap-4">
                                {voices.map((voice) => (
                                    <div
                                        key={voice.voice_id}
                                        className={`rounded-lg border-2 p-4 transition-all ${
                                            currentVoice?.voice_id === voice.voice_id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                                                    {currentVoice?.voice_id === voice.voice_id && (
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                    {voice.description || 'No description available'}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                    {voice.category && (
                                                        <span className="rounded bg-gray-100 px-2 py-0.5">{voice.category}</span>
                                                    )}
                                                    {voice.gender && (
                                                        <span className="rounded bg-gray-100 px-2 py-0.5">{voice.gender}</span>
                                                    )}
                                                    {voice.age && (
                                                        <span className="rounded bg-gray-100 px-2 py-0.5">{voice.age}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-shrink-0 items-center gap-2">
                                                {/* Play button */}
                                                {voice.preview_url && (
                                                    <button
                                                        onClick={() => handlePlay(voice)}
                                                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                                                        title="Play preview"
                                                    >
                                                        {playingVoiceId === voice.voice_id ? (
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}

                                                {/* Select button */}
                                                <button
                                                    onClick={() => onSelect(voice)}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                                >
                                                    Select
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                    <p className="mt-4 text-sm font-medium text-gray-900">No voices found</p>
                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );

}
