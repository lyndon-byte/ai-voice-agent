import { useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';

export default function EvaluationTab({ platformSettings }) {
    const { addArrayItem, removeArrayItem, updateArrayItem } = useAgentChanges();
    
    // Local state for UI
    const [criteria, setCriteria] = useState(platformSettings?.evaluation?.criteria || []);
    const [dataPoints, setDataPoints] = useState(platformSettings?.data_collection || []);
    
    const filterChips = ['Date After','Date Before','Call status','Criteria','Data','Duration','Rating','Comments','Tools','Language','User','Channel'];

    // Criteria handlers
    const handleAddCriterion = () => {
        const newCriterion = {
            id: `crit_${Date.now()}`,
            name: 'New Criterion',
            type: 'boolean',
            conversation_goal_prompt: '',
        };

        // Update local state
        setCriteria([...criteria, newCriterion]);
        
        // Track change for API
        addArrayItem('evaluation.criteria', newCriterion);
    };

    const handleRemoveCriterion = (criterionId) => {
        // Update local state
        setCriteria(criteria.filter(c => c.id !== criterionId));
        
        // Track change
        removeArrayItem('evaluation.criteria', criterionId);
    };

    const handleUpdateCriterion = (criterionId, field, value) => {
        // Update local state
        const updated = criteria.map(c => 
            c.id === criterionId ? { ...c, [field]: value } : c
        );
        setCriteria(updated);
        
        // Track change
        const updatedCriterion = updated.find(c => c.id === criterionId);
        updateArrayItem('evaluation.criteria', criterionId, updatedCriterion);
    };

    // Data collection handlers
    const handleAddDataPoint = () => {
        const newDataPoint = {
            id: `data_${Date.now()}`,
            dynamic_variable: '',
            type: 'string',
            description: '',
        };

        setDataPoints([...dataPoints, newDataPoint]);
        addArrayItem('data_collection', newDataPoint);
    };

    const handleRemoveDataPoint = (dataPointId) => {
        setDataPoints(dataPoints.filter(dp => dp.id !== dataPointId));
        removeArrayItem('data_collection', dataPointId);
    };

    const handleUpdateDataPoint = (dataPointId, field, value) => {
        const updated = dataPoints.map(dp => 
            dp.id === dataPointId ? { ...dp, [field]: value } : dp
        );
        setDataPoints(updated);
        
        const updatedDataPoint = updated.find(dp => dp.id === dataPointId);
        updateArrayItem('data_collection', dataPointId, updatedDataPoint);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left - Conversations */}
            <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Analysis</h2>
                
                {/* Search */}
                <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
                
                {/* Filter chips */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {filterChips.map(f => (
                        <button key={f} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                            <span>+</span> {f}
                        </button>
                    ))}
                </div>
                
                {/* Conversation list empty state */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No conversations found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no conversations yet.</p>
                </div>
            </div>

            {/* Right - Criteria & Data Collection */}
            <div className="space-y-4">
                {/* Evaluation Criteria */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900">Evaluation criteria</h3>
                    <p className="mb-3 text-xs text-gray-500">Define criteria to evaluate whether conversations were successful or not.</p>
                    
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-xs font-medium text-gray-700">
                            {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}
                        </span>
                        <button 
                            onClick={handleAddCriterion}
                            className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add criteria
                        </button>
                    </div>
                    
                    {criteria.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {criteria.map((criterion) => (
                                <div key={criterion.id} className="rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={criterion.name}
                                                onChange={(e) => handleUpdateCriterion(criterion.id, 'name', e.target.value)}
                                                className="w-full border-b border-transparent px-0 py-1 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                                                placeholder="Criterion name"
                                            />
                                            
                                            <select
                                                value={criterion.type}
                                                onChange={(e) => handleUpdateCriterion(criterion.id, 'type', e.target.value)}
                                                className="mt-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700"
                                            >
                                                <option value="boolean">Boolean</option>
                                                <option value="rating">Rating</option>
                                                <option value="text">Text</option>
                                            </select>
                                            
                                            <textarea
                                                value={criterion.conversation_goal_prompt}
                                                onChange={(e) => handleUpdateCriterion(criterion.id, 'conversation_goal_prompt', e.target.value)}
                                                placeholder="What should this evaluate?"
                                                className="mt-2 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-blue-500 focus:outline-none"
                                                rows={2}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveCriterion(criterion.id)}
                                            className="flex-shrink-0 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Data Collection */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900">Data collection</h3>
                    <p className="mb-3 text-xs text-gray-500">Define custom data specifications to extract from conversation transcripts.</p>
                    
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-xs font-medium text-gray-700">
                            {dataPoints.length} data {dataPoints.length === 1 ? 'point' : 'points'}
                        </span>
                        <button 
                            onClick={handleAddDataPoint}
                            className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add data point
                        </button>
                    </div>
                    
                    {dataPoints.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {dataPoints.map((dataPoint) => (
                                <div key={dataPoint.id} className="rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={dataPoint.dynamic_variable}
                                                onChange={(e) => handleUpdateDataPoint(dataPoint.id, 'dynamic_variable', e.target.value)}
                                                placeholder="Variable name (e.g., customer_email)"
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
                                            />
                                            
                                            <select
                                                value={dataPoint.type}
                                                onChange={(e) => handleUpdateDataPoint(dataPoint.id, 'type', e.target.value)}
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="string">String</option>
                                                <option value="number">Number</option>
                                                <option value="boolean">Boolean</option>
                                                <option value="array">Array</option>
                                            </select>
                                            
                                            <input
                                                type="text"
                                                value={dataPoint.description}
                                                onChange={(e) => handleUpdateDataPoint(dataPoint.id, 'description', e.target.value)}
                                                placeholder="Description"
                                                className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveDataPoint(dataPoint.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}