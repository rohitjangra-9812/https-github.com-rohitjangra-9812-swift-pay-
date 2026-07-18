import React, { useState, useEffect, useCallback } from 'react';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

export const VoiceAssistant = ({ 
  onCommand 
}: { 
  onCommand: (command: string, matches: RegExpMatchArray | null) => void 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Voice command:", transcript);
        
        // Define commands and their regex patterns
        const commands = [
          { pattern: /^(scan|pay with qr|scan qr)/i, id: 'scan' },
          { pattern: /^(receive|receive money|show qr)/i, id: 'receive' },
          { pattern: /^(history|transactions|recent)/i, id: 'history' },
          { pattern: /^(balance|check balance)/i, id: 'balance' },
          { pattern: /^(support|help)/i, id: 'support' },
          { pattern: /^(settings|security)/i, id: 'settings' },
          { pattern: /^(pay|send money to|transfer to) (.+)/i, id: 'pay_person' },
          { pattern: /^(electricity|water|gas|broadband|recharge)/i, id: 'utility' },
        ];

        let matched = false;
        for (const cmd of commands) {
          const match = transcript.match(cmd.pattern);
          if (match) {
            onCommand(cmd.id, match);
            matched = true;
            break;
          }
        }

        if (!matched) {
          toast.error(`Did not understand command: "${transcript}"`);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'aborted') {
          toast.error(`Voice recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onCommand]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.info("Listening... say a command like 'scan', 'history', or 'pay [name]'", { duration: 3000 });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isListening, recognition]);

  return (
    <button 
      onClick={toggleListening}
      className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all z-[90] ${
        isListening 
          ? 'bg-red-500 animate-[pulse_1.5s_infinite] shadow-red-500/50' 
          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
      }`}
      title="Voice Commands"
    >
      <Mic className="w-6 h-6 text-white" />
    </button>
  );
};
