type EventCallback<T = any> = (data: T) => void;

export interface AcceptEvent {
  requestId: string;
  acceptedText: string;
}

export interface DeclineEvent {
  requestId: string;
  suggestionText: string;
  reason: string;
  hitCount: number;
  allSuggestions: string[];
}

export interface IgnoreEvent {
  requestId: string;
  suggestionText: string;
  allSuggestions: string[];
}

export interface CompletionEvents {
  'completion:accept': AcceptEvent;
  'completion:decline': DeclineEvent;
  'completion:ignore': IgnoreEvent;
  'completion:error': Error;
}

export class GhostEventEmitter {
  private events = new Map<string, Set<EventCallback>>();

  on<K extends keyof CompletionEvents>(
    event: K,
    callback: EventCallback<CompletionEvents[K]>
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(callback);
  }

  off<K extends keyof CompletionEvents>(
    event: K,
    callback: EventCallback<CompletionEvents[K]>
  ): void {
    this.events.get(event)?.delete(callback);
  }

  emit<K extends keyof CompletionEvents>(event: K, data: CompletionEvents[K]): void {
    this.events.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}
