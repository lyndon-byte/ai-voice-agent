import KnowledgeBaseSection from '../sections/KnowledgeBaseSection';


export default function KnowledgeTab({ config,agent,localKb }) {
    return <KnowledgeBaseSection config={config} agentId={agent.agent_id} localKb={localKb} />;
}