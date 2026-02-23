import type { Response } from 'express';

export interface IChatService {
  streamMessage(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
    useAI: boolean,
    journeyMode: 'standard' | 'agentic',
  ): Promise<void>;
}

export interface IStandardChatService {
  streamStandard(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
  ): Promise<void>;
}

export interface IAgenticChatService {
  streamAgentic(
    sessionId: string,
    message: string,
    applicationId: string | undefined,
    res: Response,
  ): Promise<void>;
}

export interface IToolHandler {
  canHandle(name: string): boolean;
  execute(name: string, input: Record<string, unknown>): Promise<unknown>;
}

export interface StreamSSEEvent {
  token?: string;
  done?: boolean;
  error?: string;
  stateUpdate?: Record<string, unknown>;
  redirect?: { path: string };
  handoff?: {
    applicationId: string;
    leadId: string;
    mobile: string;
    redirectPath: string;
  };
}
