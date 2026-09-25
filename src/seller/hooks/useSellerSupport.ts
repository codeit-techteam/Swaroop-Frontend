import { useCallback, useMemo, useState } from 'react';

import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import {
  createSupportTicket,
  filterTicketsByTab,
  getSupportSnapshot,
  refreshSupportTickets,
} from '@/seller/services/supportService';
import type { RaiseTicketInput, TicketFilterTab } from '@/seller/types/support';

export function useSellerSupport() {
  const [snapshot, setSnapshot] = useState(() => getSupportSnapshot());
  const [activeTab, setActiveTab] = useState<TicketFilterTab>('open');
  const [isLoading, setIsLoading] = useState(true);

  const filteredTickets = useMemo(
    () => filterTicketsByTab(snapshot.tickets, activeTab),
    [snapshot.tickets, activeTab],
  );

  const load = useCallback(async () => {
    const next = await refreshSupportTickets();
    setSnapshot(next);
    setIsLoading(false);
  }, []);

  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await load();
  });

  const submitTicket = useCallback(async (input: RaiseTicketInput) => {
    const ticket = await createSupportTicket(input);
    setSnapshot(getSupportSnapshot());
    return ticket;
  }, []);

  const initialLoad = useCallback(async () => {
    setIsLoading(true);
    try {
      await load();
    } catch {
      setIsLoading(false);
    }
  }, [load]);

  return {
    snapshot,
    filteredTickets,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refresh: initialLoad,
    pullRefresh: refresh,
    submitTicket,
  };
}
