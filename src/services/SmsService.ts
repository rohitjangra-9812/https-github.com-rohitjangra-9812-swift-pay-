import { toast } from 'sonner';

interface SmsOptions {
  to: string;
  message: string;
}

export class SmsService {
  /**
   * Simulates sending an SMS message to a mobile number via an external provider (e.g. Twilio/Msg91).
   */
  static async sendSms({ to, message }: SmsOptions): Promise<{ success: boolean; messageId: string }> {
    console.log(`[SmsService] Sending SMS to ${to}: ${message}`);
    
    // Simulate network delay for the API call to the external provider
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate OTP delivery as a toast notification in our simulated environment
    toast.success(`📱 SMS (Simulated): ${message}`, { 
      duration: 10000,
      position: 'top-center'
    });

    return {
      success: true,
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Generates a random 6-digit OTP
   */
  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
