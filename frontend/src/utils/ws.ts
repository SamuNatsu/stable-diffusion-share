/// WebSocket module
import EventEmitter from 'eventemitter3';

// Export wrapper class
export class WebSocketWrapper extends EventEmitter {
  // Properties
  private timeout: number | null;
  private socket: WebSocket | null = null;
  private connected: boolean = false;

  // Constructor
  public constructor(timeout?: number) {
    super();

    this.timeout = timeout ?? null;
  }

  // Connect
  public connect(): void {
    console.log('[WebSocket] Try connection');
    this.socket = new WebSocket(
      location.origin.replace(
        /^https?/,
        location.protocol === 'https:' ? 'wss' : 'ws'
      ) + '/ws'
    );

    this.socket.addEventListener('open', (): void => {
      console.log('[WebSocket] Connected');
      this.connected = true;
      this.emit('open');
    });
    this.socket.addEventListener('error', (): void => {
      console.warn('[WebSocket] Error occurred');
      if (!this.connected) {
        this.emit('connection_error');
      } else {
        this.connected = false;
        this.emit('error');
      }
    });
    this.socket.addEventListener('close', (): void => {
      console.log('[WebSocket] Closed');
      this.connected = false;
      this.emit('close');

      if (this.timeout !== null) {
        setTimeout((): void => {
          console.log('[WebSocket] Retry');
          this.connect();
          this.emit('retry');
        }, this.timeout);
      }
    });
    this.socket.addEventListener('message', (ev: MessageEvent): void => {
      try {
        const pack: Record<string, any> = JSON.parse(ev.data);
        if (typeof pack.type !== 'string') {
          throw Error('Invalid type');
        }
        this.emit(pack.type, pack.data);
      } catch (err: unknown) {
        console.error(err);
        console.warn('[WebSocket] Message error');
      }
    });
  }

  // Is opened
  public isOpened(): boolean {
    return this.socket === null
      ? false
      : this.socket.readyState === WebSocket.OPEN;
  }
}
