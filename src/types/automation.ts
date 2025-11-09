export interface RecordingAction {
  type: 'tap' | 'input' | 'scroll';
  x: number;
  y: number;
  timestamp: number;
  value?: string; // For input actions
}

export interface AutomationScript {
  id: string;
  retailer: 'woolworths' | 'coles';
  name: string;
  actions: RecordingAction[];
  createdAt: number;
}

export interface PlaybackConfig {
  productName: string;
  actionIndex?: number; // Which action to start from
}
