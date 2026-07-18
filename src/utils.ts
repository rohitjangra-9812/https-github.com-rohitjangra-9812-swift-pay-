import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transaction } from "./types.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'INR' | 'USD' | 'EUR' | 'GBP' = 'INR') {
  const locales = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB'
  };
  return new Intl.NumberFormat(locales[currency] || 'en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(timestamp: number | string) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return "";
  }
}

export async function sharePaymentDetails(details: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Payment Details',
        text: details,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  } else {
    // Fallback
    navigator.clipboard.writeText(details);
    alert('Link copied to clipboard!');
  }
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function getAvatarUrl(name: string): string {
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80"
  ];
  let hash = 0;
  const str = name || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatars.length;
  return avatars[index];
}

export function playSuccessSound(type: 'CHIME' | 'CASH_REGISTER' | 'WARM_SWELL' | 'ELEVATOR', volume: number = 0.5) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'CHIME') {
      // Elegant high-pitched success ding-ding!
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      
      playNote(1046.50, 0, 0.3); // C6 Note
      playNote(1567.98, 0.08, 0.45); // G6 Note (Perfect fifth interval rising vibe)
    } 
    else if (type === 'CASH_REGISTER') {
      // High-frequency cha-ching sound
      const playMetal = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      
      // Triple strike representing coins
      playMetal(2000, 0, 0.1);
      playMetal(2400, 0.03, 0.12);
      playMetal(2800, 0.06, 0.15);
      
      setTimeout(() => {
        if (ctx.state === 'closed') return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.12);
        
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.2);
      }, 90);
    } 
    else if (type === 'WARM_SWELL') {
      // Warm Major Triad synthesis
      const playSwell = (freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + dur);
      };
      
      playSwell(261.63, 0.9); // C4
      playSwell(329.63, 0.9); // E4
      playSwell(392.00, 0.9); // G4
      playSwell(523.25, 0.9); // C5
    } 
    else if (type === 'ELEVATOR') {
      // Rich single clear resonant bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(739.99, ctx.currentTime); // F#5 (D major sound)
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 1.0);
    }
  } catch (error) {
    console.error("Web Audio API failed to play success chime:", error);
  }
}

export function getTransactionMood(tx: Transaction): 'calm' | 'energetic' | 'focused' | 'stressed' | 'melancholic' | 'excited' | 'happy' | 'love' | 'sad' {
  const note = (tx.note || '').toLowerCase();
  const detail = (tx.details || '').toLowerCase();
  const text = `${note} ${detail}`;
  
  if (text.includes('coffee') || text.includes('study') || text.includes('work') || text.includes('server') || text.includes('bill') || text.includes('rent') || text.includes('license') || text.includes('tax') || text.includes('api') || text.includes('code') || text.includes('setup') || text.includes('sub') || text.includes('host') || text.includes('domain') || text.includes('aws') || text.includes('cloud') || text.includes('dev') || text.includes('drizzle')) {
    return 'focused';
  }
  if (text.includes('spa') || text.includes('tea') || text.includes('meditation') || text.includes('organic') || text.includes('donation') || text.includes('charity') || text.includes('eco') || text.includes('yoga') || text.includes('sleep') || text.includes('relax') || text.includes('nature') || text.includes('green') || text.includes('water')) {
    return 'calm';
  }
  if (text.includes('gym') || text.includes('run') || text.includes('fast') || text.includes('party') || text.includes('concert') || text.includes('game') || text.includes('rush') || text.includes('ticket') || text.includes('sport') || text.includes('club') || text.includes('dance') || text.includes('uber') || text.includes('cab')) {
    return 'energetic';
  }
  if (text.includes('urgent') || text.includes('medical') || text.includes('repair') || text.includes('overdue') || text.includes('debt') || text.includes('fine') || text.includes('hospital') || text.includes('pharmacy') || text.includes('dentist') || text.includes('emergency') || text.includes('accident') || text.includes('fix')) {
    return 'stressed';
  }
  if (text.includes('book') || text.includes('poetry') || text.includes('rain') || text.includes('gift') || text.includes('miss you') || text.includes('sad') || text.includes('memories') || text.includes('nostalgia') || text.includes('flower') || text.includes('candle') || text.includes('retro') || text.includes('classic')) {
    return 'melancholic';
  }
  if (text.includes('crypto') || text.includes('shopping') || text.includes('iphone') || text.includes('tesla') || text.includes('win') || text.includes('jackpot') || text.includes('gadget') || text.includes('luxe') || text.includes('luxury') || text.includes('gold') || text.includes('flight') || text.includes('resort') || text.includes('hotel') || text.includes('celebrate')) {
    return 'excited';
  }
  if (text.includes('happy') || text.includes('smile') || text.includes('cheerful') || text.includes('bonus') || text.includes('salary') || text.includes('enjoy') || text.includes('party') || text.includes('sunshine') || text.includes('vacation')) {
    return 'happy';
  }
  if (text.includes('love') || text.includes('date') || text.includes('dinner') || text.includes('chocolate') || text.includes('rose') || text.includes('heart') || text.includes('girlfriend') || text.includes('boyfriend') || text.includes('anniversary') || text.includes('wedding')) {
    return 'love';
  }
  if (text.includes('sad') || text.includes('loss') || text.includes('refund') || text.includes('failed') || text.includes('broken') || text.includes('alone') || text.includes('funeral') || text.includes('sick')) {
    return 'sad';
  }

  // Fallback based on amount or id hashing
  const hash = Array.from(tx.id || '').reduce((acc, char) => acc + char.charCodeAt(0), 0) + Math.floor(tx.amount || 0);
  const moods: ('calm' | 'energetic' | 'focused' | 'stressed' | 'melancholic' | 'excited' | 'happy' | 'love' | 'sad')[] = [
    'calm', 'energetic', 'focused', 'stressed', 'melancholic', 'excited', 'happy', 'love', 'sad'
  ];
  return moods[hash % moods.length];
}

