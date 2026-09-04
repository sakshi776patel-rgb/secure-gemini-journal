import React, { useState } from 'react';
import { db, auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
export default function App() {
  // State Variables
  const [journalText, setJournalText] = useState('');
  const [activeMode, setActiveMode] = useState('mood'); 
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  // Helper function for UI titles
  const getModeDetails = () => {
    if (activeMode === 'mood') return { title: 'AI Mood Tracker', placeholder: 'How are you feeling today?' };
    if (activeMode === 'past') return { title: 'Chat With Your Past', placeholder: 'Ask your journal...' };
    if (activeMode === 'tagging') return { title: 'Smart Auto-Tagging', placeholder: 'Write your thoughts...' };
    if (activeMode === 'roast') return { title: 'Roast Mode 🔥', placeholder: 'Ready to be humbled?' };
    if (activeMode === 'boost') return { title: 'Boost Mode ⚡', placeholder: 'Need some motivation?' };
    return { title: 'Journal', placeholder: 'Write here...' };
  };

  // Auth Functions (Make sure these match your firebase.js logic)
  // Auth state track karne ke liye
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Google Login Popup logic
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  // Logout logic
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // AI & Database Logic
  const handleAnalyze = async () => {
  if (!journalText) return;
  setLoading(true);

  let pastContext = "";

  // Agar 'Chat With Your Past' mode hai, toh user ke Firestore se last 5 entries nikalo
  if ((activeMode === 'past' || activeMode === 'Chat With Your Past') && user) {
    try {
      const q = query(
        collection(db, `users/${user.uid}/journals`),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const pastEntries = snapshot.docs.map(doc => doc.data().text);
      pastContext = pastEntries.join("\n---\n");
    } catch (e) {
      console.error("Failed to read past entries:", e);
    }
  }

  // Backend ko user ka current question + unki purani entries dono bhej do
  try {
    const res = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: journalText, 
        mode: activeMode,
        pastEntries: pastContext 
      })
    });

    const data = await res.json();
    setAiResponse(data.result);

    // Current entry save to Firestore
    if (user) {
      await addDoc(collection(db, `users/${user.uid}/journals`), {
        text: journalText,
        mode: activeMode,
        aiOutput: data.result,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="main-wrapper">
      <div className="cyberpunk-animated-bg"></div>
      <div className="cyberpunk-overlay"></div>

      <div className="glass-container">
        <h1 className="journal-title">Gemini Secure Journal ✨</h1>
        <p className="journal-subtitle">
          Capture your thoughts and let AI analyze your journey.
        </p>

        {/* Auth Status */}
        <div className="auth-bar">
          {user ? (
            <>
              <span className="welcome-badge">Welcome, {user.displayName}!</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <button onClick={signInWithGoogle} className="login-button">
              Sign In with Google
            </button>
          )}
        </div>

        {/* Feature Cards Selection */}
        <div
          className={`glass-card ${activeMode === 'mood' ? 'active-card' : ''}`}
          onClick={() => setActiveMode('mood')}
        >
          <h3>🎭 AI Mood Tracker</h3>
          <p>Automatically analyze daily emotions and sentiment trends.</p>
        </div>

        <div
          className={`glass-card ${activeMode === 'past' ? 'active-card' : ''}`}
          onClick={() => setActiveMode('past')}
        >
          <h3>🕰️ Chat With Your Past</h3>
          <p>Query your previous journal entries for memory retrieval.</p>
        </div>

        <div
          className={`glass-card ${activeMode === 'tagging' ? 'active-card' : ''}`}
          onClick={() => setActiveMode('tagging')}
        >
          <h3>🏷️ Smart Auto-Tagging</h3>
          <p>Extract contexts and pending tasks directly from your text.</p>
        </div>

        <div
          className={`glass-card ${activeMode === 'roast' || activeMode === 'boost' ? 'active-card' : ''}`}
          onClick={() => setActiveMode(activeMode === 'roast' ? 'boost' : 'roast')}
        >
          <h3>
            🔥 Roast or Boost Mode {activeMode === 'boost' ? '(Boost ⚡)' : '(Roast 🔥)'}
          </h3>
          <p>Get humbled or motivated by Gemini. (Click to toggle)</p>
        </div>

        {/* Input Box for Logged In User */}
        {user && (
          <div className="journal-input-panel">
            <div style={{ textAlign: 'left', marginBottom: '8px' }}>
              <span className="active-mode-badge">
                Active Mode: {getModeDetails().title}
              </span>
            </div>

            <textarea
              rows="3"
              className="cyber-textarea"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={getModeDetails().placeholder}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-analyze-save"
              style={{ marginTop: '15px' }}
            >
              {loading ? 'Analyzing with Gemini...' : `Run Analysis (${activeMode.toUpperCase()}) 🚀`}
            </button>

            {aiResponse && (
              <div className="ai-output-box" style={{ marginTop: '20px' }}>
                <strong style={{ color: '#38bdf8' }}>Gemini Analysis:</strong>
                <div style={{ marginTop: '10px' }}>
      {activeMode === 'tagging' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {aiResponse.split('\n').map((line, idx) => {
            if (line.includes('#')) {
              const words = line.split(' ');
              return (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '6px 0' }}>
                  {words.map((word, wIdx) => 
                    word.startsWith('#') ? (
                      <span
                        key={wIdx}
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }}
                      >
                        {word}
                      </span>
                    ) : (
                      <span key={wIdx}>{word} </span>
                    )
                  )}
                </div>
              );
            }
            return <p key={idx} style={{ margin: '4px 0' }}>{line}</p>;
          })}
        </div>
      ) : (
        <p style={{ margin: '6px 0', whiteSpace: 'pre-wrap' }}>{aiResponse}</p>
      )}

    </div>
     <div style={{ marginTop: '16px', textAlign: 'center' }}>
       <span style={{ 
         fontSize: '0.85rem', 
         color: '#38bdf8', 
         background: 'rgba(56, 189, 248, 0.1)', 
         padding: '6px 14px', 
         borderRadius: '12px',
         border: '1px solid rgba(56, 189, 248, 0.3)'
       }}>
         ✓ Auto-saved to your personal vault
       </span>
     </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}