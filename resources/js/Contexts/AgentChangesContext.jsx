import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AgentChangesContext = createContext();

export function AgentChangesProvider({ children, initialAgent }) {
    const [changes, setChanges] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

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

    // Clear all changes
    const clearChanges = useCallback(() => {
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

        if (changes.data_collection) {
            platformSettings.data_collection = changes.data_collection;
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
            
            const response = await axios.patch(`/app/agents/update`,payload);

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
        clearChanges,
        saveChanges,
        mapToAPIFormat
    };

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