import { useEffect, useRef, useState, useCallback } from 'react';
import { SystemData, DeviceInfo } from '../types/system';

interface WebSocketMessage {
  type: string;
  data?: unknown;
  id?: string;
}

export function useWebSocket(serverUrl: string, token: string | null) {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef<number>(0);
  const messageHandlersRef = useRef<Map<string, (data: unknown) => void>>(new Map());

  const connect = useCallback(() => {
    if (!token) {
      return;
    }

    // Cerrar conexión existente si la hay
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        return; // Ya está conectado o conectándose
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      // Convertir http:// a ws:// y https:// a wss://
      const wsUrl = serverUrl.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/ws?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset contador al conectar exitosamente

        ws.send(JSON.stringify({ type: 'system:subscribe' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'system:data') {
            setSystemData(message.data as SystemData);
          } else if (message.type === 'terminal:ready') {
            setTerminalReady(true);
          } else if (message.type === 'terminal:data') {
            const handler = messageHandlersRef.current.get('terminal:data');
            if (handler) {
              handler(message.data);
            }
          } else if (message.type === 'terminal:exit') {
            setTerminalReady(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        setTerminalReady(false);
        wsRef.current = null;

        // Solo reconectar si no fue un cierre normal o de autenticación
        if (event.code !== 1000 && event.code !== 1008 && token) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [serverUrl, token]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, connect]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createTerminal = useCallback((cols: number, rows: number) => {
    sendMessage({ type: 'terminal:create', cols, rows });
  }, [sendMessage]);

  const sendTerminalInput = useCallback((data: string) => {
    sendMessage({ type: 'terminal:input', data });
  }, [sendMessage]);

  const onTerminalData = useCallback((handler: (data: string) => void) => {
    messageHandlersRef.current.set('terminal:data', handler as (data: unknown) => void);
  }, []);

  const getDeviceInfo = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await fetch(`${serverUrl}/api/system/device`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDeviceInfo(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
    return null;
  }, [serverUrl, token]);

  return {
    systemData,
    deviceInfo,
    isConnected,
    terminalReady,
    createTerminal,
    sendTerminalInput,
    onTerminalData,
    getDeviceInfo
  };
}
