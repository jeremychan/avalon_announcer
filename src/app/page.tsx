'use client';

import { useState, useRef } from 'react';

type Character = 'Merlin' | 'Percival' | 'Morgana' | 'Mordred' | 'Oberon' | 'Assassin';

export default function Home() {
  const [players, setPlayers] = useState(5);
  const [selectedChars, setSelectedChars] = useState<Set<Character>>(new Set(['Merlin', 'Assassin']));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("Configure your game and press Play.");

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
    const defaultPause = 5000;

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
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentText("Narration stopped.");
      return;
    }

    const script = buildScript();
    setIsPlaying(true);
    
    for (let i = 0; i < script.length; i++) {
      if (!window.speechSynthesis) break;
      
      const {text, pause} = script[i];
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.95;
      
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });

      if (pause > 0 && i < script.length - 1) {
        setCurrentText("(...waiting...)");
        await new Promise(r => setTimeout(r, pause));
      }
    }
    
    setIsPlaying(false);
    setCurrentText("Narration complete.");
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
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Special Characters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {(['Merlin', 'Percival', 'Assassin', 'Morgana', 'Mordred', 'Oberon'] as Character[]).map(char => {
            const selected = has(char);
            const isGood = char === 'Merlin' || char === 'Percival';
            return (
              <button
                key={char}
                onClick={() => toggleChar(char)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${selected ? (isGood ? 'var(--good-primary)' : 'var(--evil-primary)') : 'rgba(255,255,255,0.1)'}`,
                  background: selected ? (isGood ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'rgba(255,255,255,0.05)',
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

      {isPlaying && (
        <div className="glass-panel animate-fade-in pulse" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--accent-primary)' }}>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.5 }}>{currentText}</p>
        </div>
      )}
    </main>
  );
}
