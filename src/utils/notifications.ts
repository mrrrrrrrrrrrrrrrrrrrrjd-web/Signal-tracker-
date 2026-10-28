// Push Notification Manager for Quotex 1-Minute Binary Options Signals

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

class NotificationService {
  private enabled: boolean = true;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled && this.getPermission() === 'granted';
  }

  public sendSignalAlert(
    pair: string,
    direction: 'CALL' | 'PUT',
    probability: number,
    payout: number,
    secondsLeft: number
  ) {
    if (!this.enabled || !this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    const isCall = direction === 'CALL';
    const title = `🚨 QUOTEX 1M: ${pair} ${isCall ? '🟢 CALL (BUY)' : '🔴 PUT (SELL)'}`;
    const body = `Next Candle M1 Entry in ${secondsLeft}s! Confluence: ${probability}% | Payout: ${payout}% | Rec: Direct + G1. Click to execute.`;

    try {
      const notif = new Notification(title, {
        body,
        icon: isCall
          ? 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2310b981"/><path d="M50 25 L75 60 L25 60 Z" fill="white"/></svg>'
          : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ef4444"/><path d="M50 75 L75 40 L25 40 Z" fill="white"/></svg>',
        tag: `quotex-signal-${pair}`,
        requireInteraction: false,
        silent: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      // Auto close after 12 seconds so notifications don't pile up
      setTimeout(() => {
        try {
          notif.close();
        } catch {
          // ignore
        }
      }, 12000);
    } catch {
      // Catch notification constructor errors on some mobile browsers
    }
  }

  public sendTestNotification() {
    if (!this.isSupported()) {
      return { success: false, message: 'Notifications are not supported in this browser.' };
    }
    if (Notification.permission !== 'granted') {
      return { success: false, message: 'Please grant notification permissions first.' };
    }

    try {
      new Notification('🔔 Quotex Alerts Active', {
        body: 'Push notifications are correctly configured. You will receive real-time 1M CALL/PUT signals!',
        tag: 'quotex-test',
      });
      return { success: true, message: 'Test notification sent!' };
    } catch (e: unknown) {
      return { success: false, message: (e as Error).message || 'Failed to send notification' };
    }
  }
}

export const notificationService = new NotificationService();
