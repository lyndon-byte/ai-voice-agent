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
            const params = { searchQuery };
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

    useEffect(() => {
        if (isOpen) fetchVoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, selectedGender, selectedAge]);

    useEffect(() => {
        if (isOpen) {
            const timeoutId = setTimeout(() => fetchVoices(), 500);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handlePlay = (e, voice) => {
        e.stopPropagation(); // Prevent card click (select) when play is clicked

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

    // Gender color accent map
    const genderAccent = {
        Male: { dot: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
        Female: '#f472b6',
        Neutral: '#a78bfa',
    };

    const tagColor = (label) => {
        if (['Male'].includes(label)) return 'bg-blue-50 text-blue-600';
        if (['Female'].includes(label)) return 'bg-pink-50 text-pink-600';
        if (['Neutral'].includes(label)) return 'bg-violet-50 text-violet-600';
        if (['Young'].includes(label)) return 'bg-emerald-50 text-emerald-600';
        if (['Middle Aged'].includes(label)) return 'bg-amber-50 text-amber-700';
        if (['Old'].includes(label)) return 'bg-orange-50 text-orange-600';
        return 'bg-gray-100 text-gray-500';
    };

    return (
        <Portal>
            <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
                isOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                        isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onClose}
                />
                
                {/* Drawer */}
                <div className={`relative flex h-full w-full max-w-xl flex-col bg-gray-50 shadow-2xl transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                    {/* Header */}
                    <div className="flex items-center justify-between bg-white px-6 py-5 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight text-gray-900">Voice Library</h2>
                            <p className="mt-0.5 text-xs text-gray-400">Click a voice to select it</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="bg-white px-6 pb-4 pt-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search voices..."
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white border-b border-gray-100 px-6 pb-4">
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-6 text-xs text-gray-600 outline-none focus:border-gray-400 transition appearance-none min-w-0"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>

                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-6 text-xs text-gray-600 outline-none focus:border-gray-400 transition appearance-none min-w-0"
                            >
                                <option value="">All Genders</option>
                                {genders.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>

                            <select
                                value={selectedAge}
                                onChange={(e) => setSelectedAge(e.target.value)}
                                className="rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-6 text-xs text-gray-600 outline-none focus:border-gray-400 transition appearance-none min-w-0"
                            >
                                <option value="">All Ages</option>
                                {ages.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            {(selectedCategory || selectedGender || selectedAge) && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedGender('');
                                        setSelectedAge('');
                                    }}
                                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition"
                                >
                                    Clear ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Voice List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-500" />
                                <p className="text-xs text-gray-400">Loading voices…</p>
                            </div>
                        ) : voices.length > 0 ? (
                            voices.map((voice) => {
                                const isSelected = currentVoice?.voice_id === voice.voice_id;
                                const isPlaying = playingVoiceId === voice.voice_id;

                                return (
                                    <div
                                        key={voice.voice_id}
                                        onClick={() => onSelect(voice)}
                                        className={`group relative flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-150 select-none
                                            ${isSelected
                                                ? 'bg-gray-900 text-white shadow-md'
                                                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-100'
                                            }`}
                                    >
                                        {/* Avatar / Initials — Sound wave when playing */}
                                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold
                                            ${isSelected ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {isPlaying ? (
                                                <span className="flex items-end gap-[3px] h-5">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <span
                                                            key={i}
                                                            className={`w-[3px] rounded-full animate-bounce ${isSelected ? 'bg-white' : 'bg-gray-500'}`}
                                                            style={{
                                                                animationDuration: `${0.4 + i * 0.1}s`,
                                                                animationDelay: `${i * 0.08}s`,
                                                                height: `${40 + (i % 3) * 25}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </span>
                                            ) : (
                                                voice.name?.slice(0, 2).toUpperCase() || '??'
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium leading-tight truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                    {voice.name}
                                                </span>
                                                {isSelected && (
                                                    <span className="flex-shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/90 tracking-wide uppercase">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            {voice.description && (
                                                <p className={`mt-0.5 text-xs leading-snug line-clamp-1 ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {voice.description}
                                                </p>
                                            )}

                                            {/* Tags */}
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {[voice.category, voice.gender, voice.age].filter(Boolean).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none
                                                            ${isSelected ? 'bg-white/10 text-white/70' : tagColor(tag)}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Play Button */}
                                        {voice.preview_url && (
                                            <button
                                                onClick={(e) => handlePlay(e, voice)}
                                                title={isPlaying ? 'Pause preview' : 'Play preview'}
                                                className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition
                                                    ${isSelected
                                                        ? 'bg-white/15 text-white hover:bg-white/25'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100'
                                                    }`}
                                            >
                                                {isPlaying ? (
                                                    /* Pause icon */
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                    </svg>
                                                ) : (
                                                    /* Play icon */
                                                    <svg className="h-5 w-5 translate-x-px" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}

                                        {/* Selected checkmark */}
                                        {isSelected && (
                                            <div className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                                <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gray-100">
                                    <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">No voices found</p>
                                    <p className="mt-0.5 text-xs text-gray-400">Try adjusting your filters or search</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}