import { createContext, useContext, useState, useCallback } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

const AgentChangesContext = createContext();

export function AgentChangesProvider({ children, initialAgent }) {

    const [changes, setChanges] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isClearingChanges,setIsClearingChanges] = useState(false)
    // Track a change
    const trackChange = useCallback((path, value) => {
        setChanges(prev => {

            const newChanges = { ...prev };
            // Set nested value using path (e.g., "agent.prompt.prompt")
            const keys = path.split('.');
            let current = newChanges;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newChanges;
        });
        setHasChanges(true);
    }, []);

    // Add item to array
    const addArrayItem = useCallback((path, item) => {
        setChanges(prev => {
            const newChanges = { ...prev };
            const keys = path.split('.');
            let current = newChanges;
            
            // Navigate to the array location
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            const arrayKey = keys[keys.length - 1];
            
            // Initialize array if it doesn't exist
            if (!current[arrayKey] || !Array.isArray(current[arrayKey])) {
                current[arrayKey] = [];
            }
            
            // Add item to array
            current[arrayKey] = [...current[arrayKey], item];
            
            return newChanges;
        });
        setHasChanges(true);
    }, []);

    // Remove item from array by index or by id
    const removeArrayItem = useCallback((path, identifier) => {
        setChanges(prev => {
            const newChanges = { ...prev };
            const keys = path.split('.');
            let current = newChanges;
            
            // Navigate to the array location
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    return prev; // Array doesn't exist, nothing to remove
                }
                current = current[keys[i]];
            }
            
            const arrayKey = keys[keys.length - 1];
            
            if (!current[arrayKey] || !Array.isArray(current[arrayKey])) {
                return prev; // Not an array, nothing to remove
            }
            
            // Remove by index if number, by id if object
            if (typeof identifier === 'number') {
                current[arrayKey] = current[arrayKey].filter((_, index) => index !== identifier);
            } else {
                current[arrayKey] = current[arrayKey].filter(item => item.id !== identifier);
            }
            
            return newChanges;
        });
        setHasChanges(true);
    }, []);

    // Update item in array by index or id
    const updateArrayItem = useCallback((path, identifier, updatedItem) => {
        setChanges(prev => {
            const newChanges = { ...prev };
            const keys = path.split('.');
            let current = newChanges;
            
            // Navigate to the array location
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    return prev;
                }
                current = current[keys[i]];
            }
            
            const arrayKey = keys[keys.length - 1];
            
            if (!current[arrayKey] || !Array.isArray(current[arrayKey])) {
                return prev;
            }
            
            // Update by index if number, by id if string
            if (typeof identifier === 'number') {
                current[arrayKey] = current[arrayKey].map((item, index) => 
                    index === identifier ? updatedItem : item
                );
            } else {
                current[arrayKey] = current[arrayKey].map(item => 
                    item.id === identifier ? updatedItem : item
                );
            }
            
            return newChanges;
        });
        setHasChanges(true);
    }, []);

    // Replace entire array
    const replaceArray = useCallback((path, newArray) => {
        trackChange(path, newArray);
    }, [trackChange]);

    // Clear all changes
    const clearChanges = useCallback(async () => {
        setIsClearingChanges(true)
        await axios.post('/app/agent-changes/delete-session');
        setIsClearingChanges(false)
        setChanges({});
        setHasChanges(false);
    }, []);

    // Map changes to ElevenLabs API format
    const mapToAPIFormat = useCallback(() => {
        // Only include what actually changed
        const payload = {};

        // Helper to check if object has any keys
        const hasKeys = (obj) => obj && Object.keys(obj).length > 0;

        // Build conversation_config only if there are changes
        const conversationConfig = {};
        
        if (changes.agent) {
            conversationConfig.agent = {};
            
            if (changes.agent.prompt) {
                conversationConfig.agent.prompt = {};
                
                // Add each changed prompt field
                if ('prompt' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.prompt = changes.agent.prompt.prompt;
                }
                if ('timezone' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.timezone = changes.agent.prompt.timezone;
                }
                // Handle inverted boolean
                if ('ignore_default_personality' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.ignore_default_personality = 
                        !changes.agent.prompt.ignore_default_personality;
                }

                if ('knowledge_base' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.knowledge_base = changes.agent.prompt.knowledge_base;
                }

                if ('built_in_tools' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.built_in_tools = changes.agent.prompt.built_in_tools;
                }

                if ('tool_ids' in changes.agent.prompt) {
                    conversationConfig.agent.prompt.tool_ids = changes.agent.prompt.tool_ids;
                }
            }
            
            // Add other agent fields if they changed
            if ('first_message' in changes.agent) {
                conversationConfig.agent.first_message = changes.agent.first_message;
            }
            if ('language' in changes.agent) {
                conversationConfig.agent.language = changes.agent.language;
            }
            // Handle inverted boolean
            if ('disable_first_message_interruptions' in changes.agent) {
                conversationConfig.agent.disable_first_message_interruptions = 
                    !changes.agent.disable_first_message_interruptions;
            }

           
        }

        if (changes.turn && hasKeys(changes.turn)) {
            conversationConfig.turn = { ...changes.turn };
        }

        if (changes.tts && hasKeys(changes.tts)) {
            conversationConfig.tts = { ...changes.tts };
        }

        // Only add conversation_config if it has changes
        if (hasKeys(conversationConfig)) {
            payload.conversation_config = conversationConfig;
        }

        // Build platform_settings only if there are changes
        const platformSettings = {};

        if (changes.widget && hasKeys(changes.widget)) {
            platformSettings.widget = { ...changes.widget };
        }

        if (changes.evaluation && hasKeys(changes.evaluation)) {
            platformSettings.evaluation = { ...changes.evaluation };
        }

        if (Array.isArray(changes.data_collection) && changes.data_collection.length > 0) {
            platformSettings.data_collection = changes.data_collection.reduce((map, { id, dynamic_variable, ...rest }) => {
                if (dynamic_variable) map[dynamic_variable] = rest;
                return map;
            }, {});
        }
        if (changes.workspace_overrides && hasKeys(changes.workspace_overrides)) {
            platformSettings.workspace_overrides = { ...changes.workspace_overrides };
        }

        // Only add platform_settings if it has changes
        if (hasKeys(platformSettings)) {

            payload.platform_settings = platformSettings;
            
        }

        return payload;
        
    }, [changes]);

    // Save changes
    const saveChanges = useCallback(async (agentId) => {
        setSaving(true);
        try {
            
            const payload = mapToAPIFormat();
            payload.agent_id = agentId;
            
            const response = await axios.patch('/app/agents/update', payload);
            clearChanges();
            return { success: true, data: response.data };

        } catch (error) {
            console.error('Error saving agent:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Failed to save changes' 
            };
        } finally {
            setSaving(false);
        }
    }, [mapToAPIFormat, clearChanges]);

    const value = {
        changes,
        hasChanges,
        saving,
        trackChange,
        addArrayItem,
        removeArrayItem,
        updateArrayItem,
        replaceArray,
        clearChanges,
        saveChanges,
        mapToAPIFormat,
        isClearingChanges
    };

    useEffect(() => {

        const saveSessionChanges = async () => {
            try {
                await axios.post('/app/agent-changes/session', {
                    changes
                });
            } catch (err) {
                console.error("Failed to store session changes", err);
            }
    
        };
    
        if (hasChanges) {
            saveSessionChanges();
        }
    
    }, [changes]);

    useEffect(() => {
        const loadSessionChanges = async () => {
            try {
                const res = await axios.get('/app/agent-changes/session');
    
                if (res.data.changes) {
                    setChanges(res.data.changes);
                    setHasChanges(Object.keys(res.data.changes).length > 0);
                }
            } catch (err) {
                console.error("Failed to load session changes", err);
            }
        };
    
        loadSessionChanges();

    }, []);

    return (
        <AgentChangesContext.Provider value={value}>
            {children}
        </AgentChangesContext.Provider>
    );
}

export function useAgentChanges() {
    const context = useContext(AgentChangesContext);
    if (!context) {
        throw new Error('useAgentChanges must be used within AgentChangesProvider');
    }
    return context;
}