import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ChartsView } from './components/ChartsView';
import { ChatInterface } from './components/ChatInterface';
import { LeadershipModal } from './components/LeadershipModal';
import { MondayConfigModal } from './components/MondayConfigModal';
import { fetchHealth, fetchMetrics, sendChatMessage, fetchLeadershipUpdate, syncMondayData } from './services/api';
import { BIMetricsResponse, ChatMessage, HealthResponse, LeadershipUpdateResponse } from './types/bi';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'leadership'>('dashboard');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<BIMetricsResponse | null>(null);
  const [leadershipData, setLeadershipData] = useState<LeadershipUpdateResponse | null>(null);
  
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [leadershipLoading, setLeadershipLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [dealsBoardId, setDealsBoardId] = useState<string>('');
  const [workorderBoardId, setWorkorderBoardId] = useState<string>('');

  // Initial load
  useEffect(() => {
    loadHealthAndMetrics();
  }, []);

  const loadHealthAndMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const hData = await fetchHealth();
      setHealth(hData);
      
      const mData = await fetchMetrics(dealsBoardId, workorderBoardId);
      setMetrics(mData);

      // Pre-seed chat greeting
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: `### 🦅 Welcome to Skylark Monday BI Agent\n\nConnected directly to **Monday.com GraphQL API**. I analyze your imported **Deals** and **Work Orders** boards in real time.\n\nAsk any founder-level question or choose a prompt from the sidebar!`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading BI metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMondayData();
      await loadHealthAndMetrics();
      if (activeTab === 'leadership') {
        loadLeadershipUpdate();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (userMsgText: string) => {
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setChatLoading(true);

    try {
      const response = await sendChatMessage(userMsgText, updatedHistory, dealsBoardId, workorderBoardId);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString(),
        requires_clarification: response.requires_clarification,
        clarifying_options: response.clarifying_options
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.metrics) {
        setMetrics(response.metrics);
      }
      if (response.leadership_update) {
        setLeadershipData(response.leadership_update);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Unable to process query. Please check backend API connection and Monday credentials.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadLeadershipUpdate = async () => {
    setLeadershipLoading(true);
    try {
      const data = await fetchLeadershipUpdate(dealsBoardId, workorderBoardId);
      setLeadershipData(data);
    } catch (err) {
      console.error('Leadership update failed:', err);
    } finally {
      setLeadershipLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leadership' && !leadershipData) {
      loadLeadershipUpdate();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#080C14] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectQuickPrompt={handleSendMessage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          health={health}
          isSyncing={isSyncing}
          onSync={handleSync}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Executive KPI Cards */}
              <MetricCards metrics={metrics} loading={loadingMetrics} />

              {/* Graphical Visualizations & Sector Comparison */}
              <ChartsView metrics={metrics} />
            </>
          )}

          {activeTab === 'chat' && (
            <ChatInterface
              messages={messages}
              isLoading={chatLoading}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'leadership' && (
            <LeadershipModal
              data={leadershipData}
              loading={leadershipLoading}
              onRefresh={loadLeadershipUpdate}
            />
          )}
        </main>
      </div>

      {/* Board Configuration Modal */}
      <MondayConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        dealsBoardId={dealsBoardId}
        workorderBoardId={workorderBoardId}
        onSave={(dId, wId) => {
          setDealsBoardId(dId);
          setWorkorderBoardId(wId);
          loadHealthAndMetrics();
        }}
      />
    </div>
  );
};

export default App;
