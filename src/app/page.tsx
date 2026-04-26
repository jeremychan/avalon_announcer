'use client';

import { useState, useRef, useEffect } from 'react';

type Character = 'Merlin' | 'Percival' | 'Morgana' | 'Mordred' | 'Oberon' | 'Assassin';

export default function Home() {
  const [players, setPlayers] = useState(5);
  const [selectedChars, setSelectedChars] = useState<Set<Character>>(new Set(['Merlin', 'Assassin']));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("Configure your game and press Play.");
  
  // TTS Settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [pauseSeconds, setPauseSeconds] = useState(5);

  const stopRequested = useRef(false);

  // Pre-load voices on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const filteredVoices = voices.filter(v => 
          v.lang.startsWith('en') && 
          (v.name.includes("Daniel") || v.name.includes("UK English") || v.name.includes("Premium") || v.name.includes("Enhanced") || v.name.includes("Alex") || v.name.includes("Moira") || v.lang === "en-GB")
        ).slice(0, 10);
        
        const finalVoices = filteredVoices.length > 0 ? filteredVoices : voices.filter(v => v.lang.startsWith('en')).slice(0, 5);
        
        setAvailableVoices(finalVoices);
        if (finalVoices.length > 0 && !selectedVoiceURI) {
           const preferredVoice = finalVoices.find(v => v.name.includes("Daniel") || v.name.includes("UK English")) || finalVoices[0];
           if (preferredVoice) setSelectedVoiceURI(preferredVoice.voiceURI);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  const toggleChar = (char: Character) => {
    const newChars = new Set(selectedChars);
    if (newChars.has(char)) {
      newChars.delete(char);
      // Auto-deselect linked characters based on rules
      if (char === 'Merlin') {
        newChars.delete('Assassin');
        newChars.delete('Percival');
        newChars.delete('Morgana');
        newChars.delete('Mordred');
      } else if (char === 'Percival') {
        newChars.delete('Morgana');
      }
    } else {
      newChars.add(char);
      // Auto-select linked characters
      if (char === 'Assassin') {
        newChars.add('Merlin');
      } else if (char === 'Morgana') {
        newChars.add('Percival');
        newChars.add('Merlin');
        newChars.add('Assassin');
      } else if (char === 'Mordred' || char === 'Percival') {
        newChars.add('Merlin');
        newChars.add('Assassin');
      }
    }
    setSelectedChars(newChars);
  };

  const has = (char: Character) => selectedChars.has(char);

  const buildScript = () => {
    const segments: {text: string, pause: number}[] = [];
    const defaultPause = pauseSeconds * 1000;

    // Segment 0
    if (has('Merlin')) {
      segments.push({text: "EVERYONE, close your eyes, and extend your hand into a fist in front of you.", pause: 2000});
    } else {
      segments.push({text: "EVERYONE, close your eyes.", pause: 2000});
    }

    // Segment 1 & 2
    if (has('Oberon')) {
      segments.push({text: "AGENTS OF EVIL, except OBERON, wake up, and look for other agents of Evil.", pause: defaultPause});
    } else {
      segments.push({text: "AGENTS OF EVIL, wake up, and look for other agents of Evil.", pause: defaultPause});
    }
    segments.push({text: "AGENTS OF EVIL, close your eyes.", pause: 2000});

    // Segment 3 & 4
    if (has('Merlin')) {
      if (has('Mordred')) {
        segments.push({text: "MERLIN, wake up. AGENTS OF EVIL, except MORDRED, stick out your thumb, so that Merlin can see who you are.", pause: defaultPause});
      } else {
        segments.push({text: "MERLIN, wake up. AGENTS OF EVIL, stick out your thumb, so that Merlin can see who you are.", pause: defaultPause});
      }
      segments.push({text: "AGENTS OF EVIL, put your thumbs away. MERLIN, close your eyes.", pause: 2000});

      // Segment 5 & 6
      if (has('Percival')) {
        if (has('Morgana')) {
          segments.push({text: "PERCIVAL, wake up. MERLIN and MORGANA, stick out your thumb, so that Percival can see who you are.", pause: defaultPause});
          segments.push({text: "MERLIN and MORGANA, put your thumbs away. PERCIVAL, close your eyes.", pause: 2000});
        } else {
          segments.push({text: "PERCIVAL, wake up. MERLIN, stick out your thumb, so that Percival can see who you are.", pause: defaultPause});
          segments.push({text: "MERLIN, put your thumb away. PERCIVAL, close your eyes.", pause: 2000});
        }
        segments.push({text: "EVERYONE, wake up.", pause: 0});
      } else {
        segments.push({text: "EVERYONE, wake up.", pause: 0});
      }
    } else {
      segments.push({text: "EVERYONE, wake up.", pause: 0});
    }

    return segments;
  };

  const handlePlay = async () => {
    if (isPlaying) {
      // User pressed STOP
      window.speechSynthesis.cancel();
      stopRequested.current = true;
      setIsPlaying(false);
      setCurrentText("Narration stopped.");
      return;
    }

    stopRequested.current = false;
    const script = buildScript();
    setIsPlaying(true);
    
    // Select voice logic
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    
    for (let i = 0; i < script.length; i++) {
      if (!window.speechSynthesis || stopRequested.current) break;
      
      const {text, pause} = script[i];
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Hardcoded mysterious speed
      utterance.pitch = 0.7; // Hardcoded mysterious pitch
      if (preferredVoice) utterance.voice = preferredVoice;
      
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        // Resolve on error/cancellation too
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });

      if (stopRequested.current) break;

      // Cancellable Wait block
      if (pause > 0 && i < script.length - 1) {
        setCurrentText("(...waiting...)");
        await new Promise<void>(resolve => {
           const timeoutCount = pause / 100;
           let currentCount = 0;
           const interval = setInterval(() => {
              if (stopRequested.current) {
                 clearInterval(interval);
                 resolve();
              }
              currentCount++;
              if (currentCount >= timeoutCount) {
                 clearInterval(interval);
                 resolve();
              }
           }, 100);
        });
      }
    }
    
    // If it naturally finished
    if (!stopRequested.current) {
      setIsPlaying(false);
      setCurrentText("Narration complete.");
    }
  };

  return (
    <main style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Avalon Narrator
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Configure the roles. Press play. Close your eyes.
        </p>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', animationDelay: '0.1s' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Players: {players}</h2>
        <input 
          type="range" 
          min="5" 
          max="10" 
          value={players} 
          onChange={(e) => setPlayers(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '8px' }}>
          <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px', animationDelay: '0.2s' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', textAlign: 'center' }}>Game Roster</h2>

        {/* Good Characters */}
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--good-primary)', marginBottom: '12px', textAlign: 'center' }}>Forces of Good</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {(['Merlin', 'Percival'] as Character[]).map(char => {
              const selected = has(char);
              return (
                <button
                  key={char}
                  onClick={() => toggleChar(char)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `2px solid ${selected ? 'var(--good-primary)' : 'rgba(255,255,255,0.1)'}`,
                    background: selected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: selected ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: selected ? 600 : 400,
                    transition: 'var(--transition)'
                  }}
                >
                  {char}
                </button>
              )
            })}
            
            {[...Array(Math.max(0, {
              5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 6
            }[players as keyof typeof players]! - (has('Merlin') ? 1 : 0) - (has('Percival') ? 1 : 0)))].map((_, i) => (
              <div
                key={`loyal-${i}`}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px dashed rgba(59, 130, 246, 0.5)`,
                  background: 'rgba(59, 130, 246, 0.05)',
                  color: 'white',
                  fontWeight: 600,
                  textAlign: 'center',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}
              >
                Loyal Servant
              </div>
            ))}
          </div>
        </div>

        {/* Evil Characters */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--evil-primary)', marginBottom: '12px', textAlign: 'center' }}>Minions of Mordred</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {(['Assassin', 'Morgana', 'Mordred', 'Oberon'] as Character[]).map(char => {
              const selected = has(char);
              return (
                <button
                  key={char}
                  onClick={() => toggleChar(char)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: `2px solid ${selected ? 'var(--evil-primary)' : 'rgba(255,255,255,0.1)'}`,
                    background: selected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: selected ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: selected ? 600 : 400,
                    transition: 'var(--transition)'
                  }}
                >
                  {char}
                </button>
              )
            })}

            {[...Array(Math.max(0, {
              5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 4
            }[players as keyof typeof players]! - (has('Assassin') ? 1 : 0) - (has('Morgana') ? 1 : 0) - (has('Mordred') ? 1 : 0) - (has('Oberon') ? 1 : 0)))].map((_, i) => (
              <div
                key={`minion-${i}`}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px dashed rgba(239, 68, 68, 0.5)`,
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: 'white',
                  fontWeight: 600,
                  textAlign: 'center',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem'
                }}
              >
                Minion
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', animationDelay: '0.25s' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Narrator Tone</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 100%' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Voice Actor</label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              style={{
                 width: '100%',
                 padding: '12px',
                 borderRadius: '12px',
                 background: 'rgba(255,255,255,0.05)',
                 border: '1px solid rgba(255,255,255,0.1)',
                 color: 'var(--text-primary)',
                 fontSize: '1rem',
                 outline: 'none',
                 cursor: 'pointer'
              }}
            >
              {availableVoices.map(voice => (
                 <option key={voice.voiceURI} value={voice.voiceURI} style={{ color: 'black' }}>
                    {voice.name} ({voice.lang})
                 </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 100%', marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Pause Duration: {pauseSeconds}s</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPauseSeconds(Math.max(1, pauseSeconds - 1))} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', flex: 1, fontSize: '1.25rem' }}>-</button>
              <button onClick={() => setPauseSeconds(Math.min(10, pauseSeconds + 1))} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', flex: 1, fontSize: '1.25rem' }}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in" style={{ textAlign: 'center', animationDelay: '0.3s', marginBottom: '32px' }}>
        <button 
          className="btn-primary" 
          onClick={handlePlay}
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '1.25rem',
            background: isPlaying ? '#ef4444' : 'var(--accent-gradient)',
            boxShadow: isPlaying ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(139, 92, 246, 0.3)'
          }}
        >
          {isPlaying ? 'STOP NARRATION' : 'PLAY NARRATION'}
        </button>
      </div>

      {/* Script container with fixed min height to prevent resizing */}
      <div className="glass-panel pulse" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--accent-primary)', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.5, opacity: isPlaying ? 1 : 0.5 }}>{currentText}</p>
      </div>
    </main>
  );
}
