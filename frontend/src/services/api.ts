import { BIMetricsResponse, ChatMessage, ChatResponse, HealthResponse, LeadershipUpdateResponse } from '../types/bi';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchMetrics(dealsBoardId?: string, workorderBoardId?: string): Promise<BIMetricsResponse> {
  const params = new URLSearchParams();
  if (dealsBoardId) params.append('deals_board_id', dealsBoardId);
  if (workorderBoardId) params.append('workorder_board_id', workorderBoardId);

  const url = `${API_BASE}/metrics${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch BI metrics');
  return res.json();
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  dealsBoardId?: string,
  workorderBoardId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      board_id_deals: dealsBoardId,
      board_id_workorders: workorderBoardId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to process chat message' }));
    throw new Error(err.detail || 'Failed to process chat message');
  }

  return res.json();
}

export async function fetchLeadershipUpdate(dealsBoardId?: string, workorderBoardId?: string): Promise<LeadershipUpdateResponse> {
  const params = new URLSearchParams();
  if (dealsBoardId) params.append('deals_board_id', dealsBoardId);
  if (workorderBoardId) params.append('workorder_board_id', workorderBoardId);

  const url = `${API_BASE}/leadership-update${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch leadership update');
  return res.json();
}

export async function syncMondayData(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/sync`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger sync');
  return res.json();
}
