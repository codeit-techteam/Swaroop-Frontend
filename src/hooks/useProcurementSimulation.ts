import { useEffect, useRef } from 'react';

import {
  ENGINE_CHECK_IDS,
  getEstimatedTimeForProgress,
  ORDER_PROGRESS_STEP_IDS,
  PROCUREMENT_DEMO_CHECKING_DELAY_MS,
  PROCUREMENT_DEMO_PROGRESS_MILESTONES,
  PROCUREMENT_DEMO_STEP_DELAY_MS,
  createInitialEngineChecks,
} from '@/constants/procurementSteps';
import type { EngineCheck, EngineCheckId, ProcurementState } from '@/types/procurement';

type UseProcurementSimulationOptions = {
  procurement: ProcurementState | null;
  isDemoMode: boolean;
  isComplete: boolean;
  onUpdate: (patch: Partial<ProcurementState>) => void;
  onComplete: () => void;
};

const ENGINE_CHECK_ORDER: EngineCheckId[] = [
  ENGINE_CHECK_IDS.LIVE_INVENTORY,
  ENGINE_CHECK_IDS.MARKET_PRICE,
  ENGINE_CHECK_IDS.DELIVERY_ROUTE,
  ENGINE_CHECK_IDS.STOCK_AVAILABILITY,
  ENGINE_CHECK_IDS.DISPATCH_CAPACITY,
];

const updateEngineCheckStatus = (
  checks: EngineCheck[],
  checkId: EngineCheckId,
  status: EngineCheck['status'],
): EngineCheck[] => checks.map((check) => (check.id === checkId ? { ...check, status } : check));

const getMilestoneForIndex = (index: number): number => {
  const milestones = PROCUREMENT_DEMO_PROGRESS_MILESTONES;
  return milestones[Math.min(index, milestones.length - 1)] ?? 100;
};

export const useProcurementSimulation = ({
  procurement,
  isDemoMode,
  isComplete,
  onUpdate,
  onComplete,
}: UseProcurementSimulationOptions): void => {
  const onUpdateRef = useRef(onUpdate);
  const onCompleteRef = useRef(onComplete);
  const engineChecksRef = useRef<EngineCheck[]>(createInitialEngineChecks());
  const hasStartedRef = useRef(false);

  onUpdateRef.current = onUpdate;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isDemoMode || !procurement || isComplete || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    engineChecksRef.current = [...procurement.engineChecks];

    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (callback: () => void, delay: number): void => {
      timers.push(setTimeout(callback, delay));
    };

    const completeProcurement = (): void => {
      onUpdateRef.current({
        status: 'completed',
        progress: 100,
        estimatedTime: getEstimatedTimeForProgress(100),
        currentStep: ORDER_PROGRESS_STEP_IDS.PURCHASE_ORDER_GENERATION,
        engineChecks: engineChecksRef.current,
        completedAt: new Date().toISOString(),
      });
      onCompleteRef.current();
    };

    const runCheck = (stepIndex: number): void => {
      const checkId = ENGINE_CHECK_ORDER[stepIndex];
      if (!checkId) {
        schedule(completeProcurement, PROCUREMENT_DEMO_STEP_DELAY_MS);
        return;
      }

      engineChecksRef.current = updateEngineCheckStatus(
        engineChecksRef.current,
        checkId,
        'checking',
      );
      const checkingProgress = getMilestoneForIndex(stepIndex);

      onUpdateRef.current({
        status: 'checking',
        progress: checkingProgress,
        estimatedTime: getEstimatedTimeForProgress(checkingProgress),
        currentStep: ORDER_PROGRESS_STEP_IDS.SUPPLIER_MATCHING,
        engineChecks: [...engineChecksRef.current],
      });

      schedule(() => {
        engineChecksRef.current = updateEngineCheckStatus(engineChecksRef.current, checkId, 'done');
        const doneProgress = getMilestoneForIndex(stepIndex + 1);

        onUpdateRef.current({
          progress: doneProgress,
          estimatedTime: getEstimatedTimeForProgress(doneProgress),
          engineChecks: [...engineChecksRef.current],
        });

        if (stepIndex + 1 >= ENGINE_CHECK_ORDER.length) {
          schedule(completeProcurement, PROCUREMENT_DEMO_STEP_DELAY_MS);
          return;
        }

        schedule(() => runCheck(stepIndex + 1), PROCUREMENT_DEMO_STEP_DELAY_MS);
      }, PROCUREMENT_DEMO_CHECKING_DELAY_MS);
    };

    schedule(() => runCheck(0), PROCUREMENT_DEMO_STEP_DELAY_MS);

    return () => {
      timers.forEach(clearTimeout);
    };
    // Start once when procurement becomes available; do not re-run on progress updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, isDemoMode, Boolean(procurement)]);
};
