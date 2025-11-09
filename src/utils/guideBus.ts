type GuideEvent =
  | { type: 'guide:start'; scenario: 'expense' | 'calendar' }
  | { type: 'guide:stop' }
  | { type: 'ui:press:addExpense' }
  | { type: 'ui:modal:expense:amountFilled' }
  | { type: 'guide:startTask' }
  | { type: 'ui:press:addTask' }
  | { type: 'task:titleEntered' }
  | { type: 'task:notesTouched' }
  | { type: 'task:categorySelected' }
  | { type: 'task:prioritySelected' }
  | { type: 'task:repeatSelected' }
  | { type: 'task:timeSet' }
  | { type: 'task:saved' };

// Anchor measurement exchange
type AnchorEvent =
  | { type: 'guide:requestAddTaskAnchor' }
  | { type: 'guide:addTaskAnchor'; rect: { x: number; y: number; width: number; height: number } }
  | { type: 'guide:requestAnchor'; id: 'task:title' | 'task:notes' | 'task:category' | 'task:priority' | 'task:repeat' | 'task:time' | 'task:save' }
  | { type: 'guide:anchor'; id: string; rect: { x: number; y: number; width: number; height: number } }
  | { type: 'task:modalReady' }
  | { type: 'task:modalClosed' };

type Listener = (e: GuideEvent | AnchorEvent) => void;

class GuideBus {
  private listeners = new Set<Listener>();
  emit(e: GuideEvent) { this.listeners.forEach(l => l(e)); }
  on(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l); }
}

export const guideBus = new GuideBus();
export type { GuideEvent };
export type { AnchorEvent };


