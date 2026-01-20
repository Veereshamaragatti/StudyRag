'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';

interface MicInputProps {
  onTranscript: (transcript: string) => void;
}

const MicInput: React.FC<MicInputProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    isListeningRef.current = false;
    setIsListening(false);
    
    if (finalTranscriptRef.current.trim()) {
      console.log('Sending final transcript:', finalTranscriptRef.current);
      onTranscriptRef.current(finalTranscriptRef.current.trim());
    }
    finalTranscriptRef.current = '';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice recognition STARTED - speak now!');
      isListeningRef.current = true;
      setIsListening(true);
      finalTranscriptRef.current = '';
    };

    recognition.onaudiostart = () => {
      console.log('🔊 Audio capture started - microphone is working');
    };

    recognition.onsoundstart = () => {
      console.log('🔈 Sound detected!');
    };

    recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected - processing...');
    };

    recognition.onresult = (event: any) => {
      console.log('📥 Got result event:', event.results.length, 'results');
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        console.log('Final text:', finalTranscriptRef.current);
      }

      const currentText = finalTranscriptRef.current + interim;
      if (currentText) {
        onTranscriptRef.current(currentText);
      }
    };

    let networkRetryCount = 0;
    const MAX_NETWORK_RETRIES = 3;

    recognition.onerror = (event: any) => {
      console.error('❌ Speech error:', event.error, event.message);
      
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected - make sure you are speaking clearly');
        // Don't stop, keep listening
      } else if (event.error === 'audio-capture') {
        alert('❌ No microphone found. Please check your microphone connection.');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'aborted') {
        console.log('⏹️ Recognition aborted');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'not-allowed') {
        alert('🎤 Microphone access denied!\n\nPlease:\n1. Click the lock/info icon in the address bar\n2. Allow microphone access\n3. Refresh the page');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'network') {
        networkRetryCount++;
        console.log(`⚠️ Network error (attempt ${networkRetryCount}/${MAX_NETWORK_RETRIES})`);
        
        if (networkRetryCount < MAX_NETWORK_RETRIES) {
          // Retry after a short delay
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('🔄 Retrying speech recognition...');
              } catch (e) {
                console.log('Could not restart');
              }
            }
          }, 500);
        } else {
          console.log('❌ Max retries reached. Try:\n1. Open in Incognito mode\n2. Try Edge browser\n3. Check firewall settings');
          setIsListening(false);
          isListeningRef.current = false;
          networkRetryCount = 0;
        }
      }
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      
      if (isListeningRef.current) {
        console.log('Auto-restarting...');
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e: any) {
              console.log('Could not restart');
              setIsListening(false);
              isListeningRef.current = false;
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      console.log('Stopping...');
      stopListening();
    } else {
      console.log('Starting...');
      finalTranscriptRef.current = '';
      isListeningRef.current = true;
      setIsListening(true);
      
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error('Failed to start:', e.message);
        if (e.message?.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e2) {
              setIsListening(false);
              isListeningRef.current = false;
            }
          }, 100);
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`p-3 rounded-xl transition-all ${
          isListening
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
        }`}
        title={isListening ? 'Click to stop' : 'Start voice input'}
      >
        {isListening ? (
          <div className="relative">
            <FiMicOff size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
          </div>
        ) : (
          <FiMic size={20} />
        )}
      </button>
      
      {isListening && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          🎤 Listening...
        </div>
      )}
    </div>
  );
};

export default MicInput;
