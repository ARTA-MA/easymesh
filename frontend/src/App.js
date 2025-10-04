import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Textarea } from "./components/ui/textarea";
import axios from "axios";


// UUID helper compatible with older browsers that lack crypto.randomUUID
function safeRandomUUID() {
  try {
    if (typeof crypto !== 'undefined') {
      if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      if (crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`;
      }
    }
  } catch (e) {}
  // Non-crypto fallback (last resort)
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

// Simple session ID generator (6 alphanumeric characters, easy to type)
function generateSimpleSessionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding ambiguous characters (I, O, 0, 1)
  let result = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(6);
      crypto.getRandomValues(bytes);
      for (let i = 0; i < 6; i++) {
        result += chars[bytes[i] % chars.length];
      }
      return result;
    }
  } catch (e) {}
  // Fallback to Math.random
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

function useQuery() { const { search } = useLocation(); return useMemo(() => new URLSearchParams(search), [search]); }

function getBackendBase() {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const origin = window.location.origin;
  const host = window.location.hostname;
  // Prefer local origin when served from localhost or a private LAN IPv4
  const isLocal = host === 'localhost' || host === '127.0.0.1' || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
  if (isLocal) return origin;
  return envUrl || origin;
}

function wsUrlFor(path) {
  const base = new URL(getBackendBase());
  const scheme = base.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${base.host}${path}`;
}

const PC_CONFIG = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }] };

function useDarkMode() {
  // Always use dark mode
  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  return { dark: true };
}

function Home() {
  const navigate = useNavigate();
  const q = useQuery();
  useDarkMode();
  const joinSid = q.get("s");
  useEffect(() => { if (joinSid) navigate(`/session?s=${encodeURIComponent(joinSid)}`, { replace: true }); }, [joinSid, navigate]);
  const start = () => { const sid = safeRandomUUID(); try { sessionStorage.setItem(`hostFor:${sid}`, "1"); } catch {} navigate(`/session?s=${encodeURIComponent(sid)}`); };
  
  return (
    <div className="app-wrap">
      <div className="sidebar glass-surface">
        <div className="header">
          <div>
            <div className="title">EasyMesh</div>
            <div className="subtitle">Cross-platform file transfer</div>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '32px' }}>
          Connect devices instantly with WebRTC. Start a session on your PC and scan the QR code from your mobile device.
        </p>
        <button onClick={start} className="glass-button accent" style={{ width: "100%", fontSize: '16px', padding: '16px 24px' }}>
          🚀 Start New Session
        </button>
        <div className="section-gap" />
        <div className="glass-inset" style={{ padding: '24px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
            ✨ How it works
          </div>
          <ol style={{ color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>Click "Start Session" on your PC</li>
            <li>Scan the QR code with your phone camera</li>
            <li>Send files and messages over direct WebRTC connection</li>
            <li>Enjoy blazing-fast peer-to-peer transfers</li>
          </ol>
        </div>
      </div>
      
      <div className="main glass-surface">
        <div className="header">
          <div>
            <div className="title">Session Preview</div>
            <div className="subtitle">Your session workspace</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>📱💻</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Ready to Connect</div>
          <div style={{ lineHeight: 1.6 }}>
            Your pairing QR code, file transfer interface, and chat will appear here once you start a session.
          </div>
        </div>
      </div>
      
      <div className="rightbar glass-surface">
        <div className="header">
          <div>
            <div className="title">Live Chat</div>
            <div className="subtitle">Real-time messaging</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}>💬</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Instant Messaging</div>
          <div style={{ lineHeight: 1.6 }}>
            Copy and paste text between devices, or just chat with connected peers in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}

function Session() {
  const q = useQuery();
  const sessionId = q.get("s");
  const [clientId] = useState(() => safeRandomUUID());
  const [peers, setPeers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [role, setRole] = useState("peer");

  const [lanBase, setLanBase] = useState(null);

  const wsRef = useRef(null);
  const wsReadyRef = useRef(false);
  const wsQueueRef = useRef([]);
  const wsReconnectAttemptsRef = useRef(0);
  const wsReconnectTimerRef = useRef(null);
  const wsKeepAliveTimerRef = useRef(null);

  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const remoteIdRef = useRef(null);
  const isNegotiatingRef = useRef(false);
  const iceRestartAttemptsRef = useRef(0);
  const lastIceRestartAtRef = useRef(0);
  const makingOfferRef = useRef(false);
  const isSettingRemoteAnswerRef = useRef(false);
  const politeRef = useRef(false);

  // Sequential file transfer state
  const currentlySendingRef = useRef(false);
  const sendQueueRef = useRef([]);
  const currentFileRef = useRef(null);
  const waitingForAckRef = useRef(null);
  const cancelTransferRef = useRef(null); // Function to cancel current transfer
  const readerRef = useRef(null); // Keep track of file reader for cancellation

  // chat state
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState([]);
  const chatQueueRef = useRef([]);
  const [copiedId, setCopiedId] = useState(null);
  const copyText = useCallback((e, id, text) => {
    try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch {}
    const value = typeof text === 'string' ? text : String(text ?? '');

    // Strategy 1: synchronous execCommand on a textarea (most reliable for mobile/iOS)
    const tryTextarea = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        if (success) {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
          return true;
        }
      } catch (e) {
        console.warn('execCommand copy failed', e);
      }
      return false;
    };

    // Strategy 2: Clipboard API (modern browsers)
    const tryClipboardAPI = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        return true;
      } catch (e) {
        console.warn('Clipboard API copy failed', e);
        return false;
      }
    };

    // Try strategies in order
    if (!tryTextarea()) {
      tryClipboardAPI().catch(() => {
        // Both methods failed, show error or do nothing
        console.error('All copy methods failed');
      });
    }
  }, []);

  // File transfer progress state
  const [progressMap, setProgressMap] = useState({});
  const [received, setReceived] = useState([]);
  const [dataChannelReady, setDataChannelReady] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timers
      if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);
      if (wsKeepAliveTimerRef.current) clearInterval(wsKeepAliveTimerRef.current);
      
      // Close WebSocket if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Close PeerConnection if exists
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      // Clear data channel reference
      dcRef.current = null;
    };
  }, []);

  const sendSignal = useCallback((msg) => {
    if (!wsRef.current) return;
    const data = JSON.stringify(msg);
    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      wsQueueRef.current.push(data);
    }
  }, []);

  // Process queued WebSocket messages when connection opens
  useEffect(() => {
    if (wsReadyRef.current && wsQueueRef.current.length > 0) {
      console.log(`Flushing ${wsQueueRef.current.length} queued WS messages`);
      while (wsQueueRef.current.length) {
        const data = wsQueueRef.current.shift();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(data);
        }
      }
    }
  }, [wsReadyRef.current]);

  // WebSocket connection effect
  useEffect(() => {
    if (!sessionId) return;
    
    const url = wsUrlFor(`/api/ws/session/${encodeURIComponent(sessionId)}`);
    console.log("Connecting to signaling server:", url);
    
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log("✅ Signaling WebSocket connected");
      wsReadyRef.current = true;
      
      // Send join message
      const joinMsg = { type: "join", clientId, role: "peer" };
      ws.send(JSON.stringify(joinMsg));
      
      // Flush any queued messages
      if (wsQueueRef.current.length > 0) {
        console.log(`Flushing ${wsQueueRef.current.length} queued WS messages`);
        while (wsQueueRef.current.length) {
          const data = wsQueueRef.current.shift();
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        }
      }
      
      // Start keepalive pings every 25 seconds
      wsKeepAliveTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };
    
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const mtype = msg.type;
        
        if (mtype === "peers") {
          console.log("Peers updated:", msg.peers);
          setPeers(msg.peers.filter(id => id !== clientId));
          // If we have peers, try to connect
          if (msg.peers.length > 1) {
            // Find the other peer (not us)
            const otherPeer = msg.peers.find(id => id !== clientId);
            if (otherPeer && !remoteIdRef.current) {
              console.log("Found peer, initiating connection to:", otherPeer);
              remoteIdRef.current = otherPeer;
              
              // Create or get peer connection
              if (!pcRef.current) {
                pcRef.current = createPeerConnection(true);
              }
              
              // Start negotiation
              if (!makingOfferRef.current && !isNegotiatingRef.current) {
                console.log("Starting negotiation");
                makingOfferRef.current = true;
                pcRef.current.createOffer()
                  .then(offer => {
                    console.log("Created offer");
                    return pcRef.current.setLocalDescription(offer);
                  })
                  .then(() => {
                    console.log("Set local description, sending offer");
                    sendSignal({ type: "sdp-offer", to: otherPeer, sdp: pcRef.current.localDescription });
                  })
                  .catch(err => {
                    console.error("Offer creation failed:", err);
                    makingOfferRef.current = false;
                  });
              }
            }
          }
        } else if (mtype === "sdp-offer") {
          console.log("Received SDP offer from:", msg.from);
          if (!pcRef.current) {
            pcRef.current = createPeerConnection(false);
          }
          
          isNegotiatingRef.current = true;
          makingOfferRef.current = false;
          remoteIdRef.current = msg.from;
          
          pcRef.current.setRemoteDescription(msg.sdp)
            .then(() => {
              console.log("Set remote offer, creating answer");
              return pcRef.current.createAnswer();
            })
            .then(answer => {
              console.log("Created answer");
              return pcRef.current.setLocalDescription(answer);
            })
            .then(() => {
              console.log("Set local answer, sending");
              sendSignal({ type: "sdp-answer", to: msg.from, sdp: pcRef.current.localDescription });
              isNegotiatingRef.current = false;
            })
            .catch(err => {
              console.error("Answer creation failed:", err);
              isNegotiatingRef.current = false;
            });
        } else if (mtype === "sdp-answer") {
          console.log("Received SDP answer from:", msg.from);
          if (pcRef.current && msg.from === remoteIdRef.current) {
            isSettingRemoteAnswerRef.current = true;
            pcRef.current.setRemoteDescription(msg.sdp)
              .then(() => {
                console.log("Set remote answer");
                isSettingRemoteAnswerRef.current = false;
                makingOfferRef.current = false;
              })
              .catch(err => {
                console.error("Setting remote answer failed:", err);
                isSettingRemoteAnswerRef.current = false;
                makingOfferRef.current = false;
              });
          }
        } else if (mtype === "ice-candidate") {
          console.log("Received ICE candidate from:", msg.from);
          if (pcRef.current && msg.from === remoteIdRef.current) {
            pcRef.current.addIceCandidate(msg.candidate)
              .catch(err => console.error("Adding ICE candidate failed:", err));
          }
        } else if (mtype === "text") {
          console.log("Received text message from:", msg.from);
          setChat(c => [{ id: safeRandomUUID(), who: "them", text: msg.data }, ...c]);
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    };
    
    ws.onclose = (ev) => {
      console.log("Signaling WebSocket closed:", ev.code, ev.reason);
      wsReadyRef.current = false;
      
      // Clear keepalive timer
      if (wsKeepAliveTimerRef.current) {
        clearInterval(wsKeepAliveTimerRef.current);
        wsKeepAliveTimerRef.current = null;
      }
      
      // Attempt reconnect with exponential backoff
      if (wsReconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * (2 ** wsReconnectAttemptsRef.current), 30000);
        console.log(`Attempting reconnect in ${delay}ms (attempt ${wsReconnectAttemptsRef.current + 1})`);
        wsReconnectAttemptsRef.current++;
        wsReconnectTimerRef.current = setTimeout(() => {
          if (wsRef.current) {
            wsRef.current = null;
          }
          // Trigger reconnect by updating component
        }, delay);
      } else {
        console.log("Max reconnect attempts reached");
      }
    };
    
    ws.onerror = (err) => {
      console.error("Signaling WebSocket error:", err);
    };
    
    // Cleanup function
    return () => {
      if (wsReconnectTimerRef.current) {
        clearTimeout(wsReconnectTimerRef.current);
        wsReconnectTimerRef.current = null;
      }
      if (wsKeepAliveTimerRef.current) {
        clearInterval(wsKeepAliveTimerRef.current);
        wsKeepAliveTimerRef.current = null;
      }
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [sessionId, clientId, sendSignal]);

  const createPeerConnection = useCallback((createDCIfHost) => {
    console.log("Creating RTCPeerConnection with config:", PC_CONFIG);
    const pc = new RTCPeerConnection(PC_CONFIG);
    
    pc.onicecandidate = (ev) => {
      if (ev.candidate && remoteIdRef.current) {
        console.log("Sending ICE candidate");
        sendSignal({ type: "ice-candidate", to: remoteIdRef.current, candidate: ev.candidate });
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setConnected(true);
      } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        setConnected(false);
        
        // Attempt ICE restart if not already attempted too many times
        const now = Date.now();
        if (now - lastIceRestartAtRef.current > 5000 && iceRestartAttemptsRef.current < 3) {
          console.log("ICE connection failed, attempting restart");
          lastIceRestartAtRef.current = now;
          
          // Update peer connection state
          if (pcRef.current && remoteIdRef.current) {
            pcRef.current.createOffer({ iceRestart: true })
              .then(offer => pcRef.current.setLocalDescription(offer))
              .then(() => {
                sendSignal({ type: "sdp-offer", to: remoteIdRef.current, sdp: pcRef.current.localDescription });
                iceRestartAttemptsRef.current++;
              })
              .catch(e => console.error("ICE restart failed:", e));
          }
        }
      }
    };
    
    pc.onsignalingstatechange = () => {
      console.log("Signaling state:", pc.signalingState);
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setConnected(true);
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setConnected(false);
      }
    };
    
    pc.onnegotiationneeded = async () => {
      console.log("Negotiation needed");
      try {
        if (makingOfferRef.current) return;
        if (isSettingRemoteAnswerRef.current) {
          console.log("Deferring negotiation until remote answer is set");
          return;
        }
        
        makingOfferRef.current = true;
        console.log("Creating offer");
        const offer = await pc.createOffer();
        console.log("Setting local description");
        await pc.setLocalDescription(offer);
        console.log("Sending offer");
        if (remoteIdRef.current) {
          sendSignal({ type: "sdp-offer", to: remoteIdRef.current, sdp: pc.localDescription });
        }
      } catch (err) {
        console.error("Negotiation failed:", err);
      } finally {
        makingOfferRef.current = false;
      }
    };
    
    const isHost = sessionStorage.getItem(`hostFor:${sessionId}`) === "1";
    
    // Always set up ondatachannel handler to receive incoming channels
    pc.ondatachannel = (ev) => {
      console.log("📨 Received data channel from peer");
      attachDataChannel(ev.channel);
    };
    
    // Host creates the data channel BEFORE setting remote description
    // This prevents negotiation issues with m-line ordering
    if (isHost && createDCIfHost) {
      console.log("🚀 Host creating data channel");
      // Configure data channel for reliable ordered file transfer
      // Removed maxPacketLifeTime and maxRetransmits - cannot specify both even as null
      // Ordered mode ensures reliable delivery by default
      const dc = pc.createDataChannel("file", {
        ordered: true
        // Removed maxPacketLifeTime and maxRetransmits - cannot specify both even as null
        // Ordered mode ensures reliable delivery by default
      }); 
      attachDataChannel(dc);
    }
    
    return pc;
  }, [sendSignal, sessionId]);

  const attachDataChannel = (dc) => {
    dcRef.current = dc; 
    dc.binaryType = "arraybuffer";
    // Set buffer threshold to 16MB for stable transfers (browsers have ~16MB max buffer)
    try { dc.bufferedAmountLowThreshold = 16777216; } catch {}
    
    let recvState = { expecting: null, receivedBytes: 0, chunks: [] };
    let dcKeepAlive = null;
    
    dc.onopen = () => { 
      console.log("✅ Data channel opened successfully!");
      setDataChannelReady(true);
      setConnected(true); // Ensure connected state is set when data channel opens
      
      // Process queued chat messages
      while (chatQueueRef.current.length) { 
        const msg = chatQueueRef.current.shift(); 
        try { 
          dc.send(msg); 
          console.log("Sent queued message");
        } catch (error) {
          console.error("Failed to send queued message:", error);
        }
      }

      // Start processing file queue sequentially
      if (sendQueueRef.current.length > 0 && !currentlySendingRef.current) {
        console.log(`Data channel ready, starting sequential file transfer (${sendQueueRef.current.length} files in queue)`);
        processNextFile();
      }

      // Lightweight keepalive to preserve NAT bindings
      dcKeepAlive = setInterval(() => {
        if (dc.readyState === "open") {
          try { dc.send("HB"); } catch {}
        }
      }, 20000);
    };
    
    dc.onerror = (error) => {
      console.error("Data channel error:", error);
      setDataChannelReady(false);
      
      // Update all pending file transfers to error status
      setProgressMap((m) => {
        const updated = { ...m };
        Object.keys(updated).forEach(id => {
          if (updated[id].status === 'sending' || updated[id].status === 'receiving') {
            updated[id].status = 'error';
          }
        });
        return updated;
      });
    };
    
    dc.onclose = () => {
      console.log("Data channel closed");
      setDataChannelReady(false);
      if (dcKeepAlive) { clearInterval(dcKeepAlive); dcKeepAlive = null; }
      
      // Preserve queue state - if a file was being sent, put it back in the queue
      if (currentFileRef.current) {
        console.log(`Re-queueing interrupted file: ${currentFileRef.current.file.name}`);
        sendQueueRef.current = [currentFileRef.current, ...sendQueueRef.current];
        currentFileRef.current = null;
      }
      currentlySendingRef.current = false;
      
      // Clear acknowledgment callback
      if (waitingForAckRef.current) {
        waitingForAckRef.current = null;
      }
      
      // Update all pending file transfers to error status
      setProgressMap((m) => {
        const updated = { ...m };
        Object.keys(updated).forEach(id => {
          if (updated[id].status === 'sending' || updated[id].status === 'receiving') {
            updated[id].status = 'error';
          }
        });
        return updated;
      });
    };
    
    // Monitor data channel state periodically during file transfers
    const monitorConnection = () => {
      if (dc.readyState !== "open" && dataChannelReady) {
        console.warn("Data channel state changed unexpectedly:", dc.readyState);
        setDataChannelReady(false);
      }
    };
    
    const connectionMonitor = setInterval(monitorConnection, 1000);
    
    // Clean up monitor when data channel closes
    dc.addEventListener('close', () => {
      clearInterval(connectionMonitor);
      if (dcKeepAlive) { clearInterval(dcKeepAlive); dcKeepAlive = null; }
    });
    
    // Check if data channel is already open when attached
    if (dc.readyState === "open") {
      console.log("✅ Data channel was already open when attached");
      setDataChannelReady(true);
      setConnected(true);
      
      // Process queued files if any
      if (sendQueueRef.current.length > 0 && !currentlySendingRef.current) {
        console.log(`Data channel ready (pre-opened), starting file transfer`);
        processNextFile();
      }
    } else {
      console.log(`Data channel state: ${dc.readyState}, waiting for 'open' event`);
    }
    
    dc.onmessage = (ev) => {
      if (typeof ev.data === "string") {
        if (ev.data.startsWith("META:")) { 
          const meta = JSON.parse(ev.data.slice(5)); 
          recvState = { expecting: meta, receivedBytes: 0, chunks: [] }; 
          setProgressMap((m) => ({ 
            ...m, 
            [meta.id]: { 
              name: meta.name, 
              total: meta.size, 
              sent: m[meta.id]?.sent || 0, 
              recv: 0,
              status: 'receiving'
            } 
          })); 
        }
        else if (ev.data.startsWith("DONE:")) { 
          const meta = JSON.parse(ev.data.slice(5)); 
          if (!recvState.expecting) {
            console.warn("DONE received with no active receive state");
            return;
          }
          const { name, size, mime, id } = recvState.expecting;
          const blob = new Blob(recvState.chunks, { type: mime || "application/octet-stream" }); 
          const url = URL.createObjectURL(blob); 
          setReceived((r) => [{ id: meta.id || id, name, size, url }, ...r]); 
          setProgressMap((m) => ({ 
            ...m, 
            [meta.id || id]: { 
              ...(m[meta.id || id] || {}), 
              recv: size, 
              total: size, 
              name,
              status: 'completed'
            } 
          })); 
          recvState = { expecting: null, receivedBytes: 0, chunks: [] }; 
        }
        else if (ev.data === "HB") {
          // Heartbeat - do nothing
        }
        else if (ev.data.startsWith("ACK:")) {
          // File transfer acknowledgment
          const fileId = ev.data.slice(4);
          console.log(`Received ACK for file ${fileId}`);
          
          // If we're waiting for this ACK, resolve the promise
          if (waitingForAckRef.current && waitingForAckRef.current.id === fileId) {
            waitingForAckRef.current.resolve();
            waitingForAckRef.current = null;
          }
        }
        else {
          // Text message
          setChat(c => [{ id: safeRandomUUID(), who: "them", text: ev.data }, ...c]);
        }
      } else if (ev.data instanceof ArrayBuffer) {
        if (!recvState.expecting) {
          console.warn("Binary data received with no active receive state");
          return;
        }
        
        const bytes = new Uint8Array(ev.data);
        recvState.chunks.push(bytes);
        recvState.receivedBytes += bytes.length;
        
        setProgressMap((m) => ({
          ...m,
          [recvState.expecting.id]: {
            ...(m[recvState.expecting.id] || {}),
            recv: recvState.receivedBytes,
            status: 'receiving'
          }
        }));
      }
    };
  };

  // Function to process the next file in the queue
  const processNextFile = async () => {
    if (currentlySendingRef.current || sendQueueRef.current.length === 0) {
      return;
    }
    
    const nextFile = sendQueueRef.current.shift();
    if (!nextFile) return;
    
    currentlySendingRef.current = true;
    currentFileRef.current = nextFile;
    
    try {
      await sendFile(nextFile.file, nextFile.id);
      console.log(`File ${nextFile.file.name} sent successfully`);
      
      // Update UI to show completion
      setProgressMap((m) => ({
        ...m,
        [nextFile.id]: {
          ...(m[nextFile.id] || {}),
          status: 'completed'
        }
      }));
    } catch (error) {
      console.error(`Failed to send file ${nextFile.file.name}:`, error);
      
      // Update UI to show error
      setProgressMap((m) => ({
        ...m,
        [nextFile.id]: {
          ...(m[nextFile.id] || {}),
          status: 'error'
        }
      }));
    } finally {
      currentFileRef.current = null;
      currentlySendingRef.current = false;
      
      // Process next file if available
      if (sendQueueRef.current.length > 0) {
        setTimeout(processNextFile, 100);
      }
    }
  };

  // Function to send a file
  const sendFile = (file, id) => {
    return new Promise((resolve, reject) => {
      if (!dcRef.current || dcRef.current.readyState !== "open") {
        reject(new Error("Data channel not open"));
        return;
      }
      
      const dc = dcRef.current;
      const fileId = id || safeRandomUUID();
      
      // Set up progress tracking
      setProgressMap((m) => ({
        ...m,
        [fileId]: {
          name: file.name,
          total: file.size,
          sent: 0,
          recv: 0,
          status: 'sending'
        }
      }));
      
      // Wait for acknowledgment
      let ackTimeout;
      const waitForAck = new Promise((ackResolve, ackReject) => {
        waitingForAckRef.current = { id: fileId, resolve: ackResolve, reject: ackReject };
        ackTimeout = setTimeout(() => {
          ackReject(new Error("ACK timeout"));
        }, 30000); // 30 second timeout
      });
      
      // Send file metadata
      const meta = {
        id: fileId,
        name: file.name,
        size: file.size,
        mime: file.type,
        lastModified: file.lastModified
      };
      dc.send(`META:${JSON.stringify(meta)}`);
      
      // Configure transfer parameters
      const CHUNK_SIZE = 16777216; // 16MB chunks for maximum speed
      const BUFFER_LOW_THRESHOLD = dc.bufferedAmountLowThreshold || 16777216; // 16MB
      const PROGRESS_UPDATE_INTERVAL = 500; // Update UI every 500ms to reduce overhead
      
      let sentBytes = 0;
      let lastProgressUpdate = 0;
      
      // Read and send file in chunks
      const reader = new FileReader();
      readerRef.current = reader;
      
      let offset = 0;
      
      const sendNextChunk = () => {
        if (offset >= file.size) {
          // File completely sent, send DONE message
          dc.send(`DONE:${JSON.stringify(meta)}`);
          
          // Wait for acknowledgment
          waitForAck.then(() => {
            clearTimeout(ackTimeout);
            resolve();
          }).catch((error) => {
            clearTimeout(ackTimeout);
            reject(error);
          });
          return;
        }
        
        // Check if we need to wait for buffer to drain
        if (dc.bufferedAmount > BUFFER_LOW_THRESHOLD) {
          // Use native browser optimization for one-time event listeners
          dc.addEventListener('bufferedamountlow', sendNextChunk, { once: true });
          return;
        }
        
        // Read next chunk
        const chunkEnd = Math.min(offset + CHUNK_SIZE, file.size);
        const blob = file.slice(offset, chunkEnd);
        
        reader.onload = (e) => {
          try {
            // Send chunk data
            dc.send(e.target.result);
            sentBytes += e.target.result.byteLength;
            offset = chunkEnd;
            
            // Update progress (throttled)
            const now = Date.now();
            if (now - lastProgressUpdate > PROGRESS_UPDATE_INTERVAL) {
              setProgressMap((m) => ({
                ...m,
                [fileId]: {
                  ...(m[fileId] || {}),
                  sent: sentBytes,
                  status: 'sending'
                }
              }));
              lastProgressUpdate = now;
            }
            
            // Continue sending
            setTimeout(sendNextChunk, 0);
          } catch (error) {
            console.error("Error sending chunk:", error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error("File read error"));
        };
        
        reader.readAsArrayBuffer(blob);
      };
      
      // Start sending
      sendNextChunk();
      
      // Handle cancellation
      cancelTransferRef.current = () => {
        clearTimeout(ackTimeout);
        if (waitingForAckRef.current && waitingForAckRef.current.id === fileId) {
          waitingForAckRef.current.reject(new Error("Transfer cancelled"));
          waitingForAckRef.current = null;
        }
        if (readerRef.current) {
          readerRef.current.abort();
        }
        reject(new Error("Transfer cancelled"));
      };
    });
  };

  const sendText = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    
    // Add to local chat immediately
    setChat(c => [{ id: safeRandomUUID(), who: "me", text }, ...c]);
    
    // Send via data channel if available
    if (dcRef.current && dcRef.current.readyState === "open") {
      try {
        dcRef.current.send(text);
      } catch (error) {
        console.error("Failed to send text message:", error);
        // Queue for when channel reopens
        chatQueueRef.current.push(text);
      }
    } else {
      // Queue for when channel opens
      chatQueueRef.current.push(text);
    }
  };

  const onFileInputChange = (ev) => {
    const files = Array.from(ev.target.files || []);
    if (files.length === 0) return;
    
    // Add files to send queue
    const newFiles = files.map(file => ({
      id: safeRandomUUID(),
      file
    }));
    
    sendQueueRef.current = [...sendQueueRef.current, ...newFiles];
    
    // Start processing if not already sending
    if (!currentlySendingRef.current) {
      processNextFile();
    }
    
    // Clear file input
    ev.target.value = "";
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get LAN URL for QR code
  useEffect(() => {
    const fetchLanInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/host-info`);
        const urls = res.data.urls;
        if (urls && urls.length > 0) {
          setLanBase(urls[0]);
        }
      } catch (err) {
        console.error("Failed to fetch LAN info:", err);
      }
    };
    
    if (sessionId) {
      fetchLanInfo();
    }
  }, [sessionId, API_BASE]);

  const qrValue = lanBase ? `${lanBase}/session?s=${encodeURIComponent(sessionId)}` : "";

  return (
    <div className="app-wrap">
      <div className="sidebar glass-surface">
        <div className="header">
          <div>
            <div className="title">EasyMesh</div>
            <div className="subtitle">Session active</div>
          </div>
        </div>
        
        <div className="session-info">
          <div className="session-id">
            <div className="session-id-label">Session ID</div>
            <div className="session-id-value">{sessionId ? sessionId.substring(0, 8) : '...'}</div>
          </div>
          
          {qrValue && (
            <div className="qr-container">
              <div className="qr-label">Scan to join</div>
              <div className="qr-wrapper">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`} 
                  alt="Join session QR code" 
                  className="qr-code"
                />
              </div>
              <div className="qr-note">Point your phone camera at this code</div>
            </div>
          )}
          
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="peers-count">
              {peers.length} peer{peers.length !== 1 ? 's' : ''} connected
            </div>
          </div>
        </div>
        
        <div className="section-gap" />
        
        <div className="file-upload-area">
          <input 
            type="file" 
            id="file-input" 
            multiple 
            onChange={onFileInputChange} 
            disabled={!dataChannelReady}
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="file-input" 
            className={`glass-button ${dataChannelReady ? 'accent' : 'disabled'}`}
            style={{ 
              width: "100%", 
              fontSize: '16px', 
              padding: '16px 24px',
              cursor: dataChannelReady ? 'pointer' : 'not-allowed',
              opacity: dataChannelReady ? 1 : 0.5
            }}
          >
            📁 {dataChannelReady ? 'Select Files to Send' : 'Connecting...'}
          </label>
          {!dataChannelReady && (
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Waiting for peer connection...
            </div>
          )}
        </div>
      </div>
      
      <div className="main glass-surface">
        <div className="header">
          <div>
            <div className="title">File Transfers</div>
            <div className="subtitle">Send and receive files</div>
          </div>
        </div>
        
        <div className="transfers-container">
          {Object.keys(progressMap).length === 0 && received.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📁</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>No Transfers Yet</div>
              <div style={{ lineHeight: 1.6 }}>
                Select files to send or wait for files from peers.
              </div>
            </div>
          )}
          
          {Object.entries(progressMap).map(([id, progress]) => (
            <div key={id} className="transfer-item">
              <div className="transfer-header">
                <div className="transfer-name">📄 {progress.name}</div>
                <div className="transfer-status">
                  {progress.status === 'sending' && '📤 Sending'}
                  {progress.status === 'receiving' && '📥 Receiving'}
                  {progress.status === 'completed' && '✅ Completed'}
                  {progress.status === 'error' && '❌ Error'}
                </div>
              </div>
              
              <div className="transfer-progress">
                <Progress 
                  value={progress.total > 0 ? (progress.sent + progress.recv) / progress.total * 100 : 0} 
                  className="progress-bar"
                />
                <div className="transfer-stats">
                  <span>
                    {formatBytes(progress.sent + progress.recv)} / {formatBytes(progress.total)}
                  </span>
                  <span>
                    {progress.status === 'sending' && `${Math.round((progress.sent / progress.total) * 100)}%`}
                    {progress.status === 'receiving' && `${Math.round((progress.recv / progress.total) * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {received.length > 0 && (
            <div className="received-files">
              <div className="section-title">📥 Received Files</div>
              {received.map((f) => (
                <div key={f.id} className="received-file">
                  <div className="received-file-info">
                    <div className="received-file-name">📄 {f.name}</div>
                    <div className="received-file-size">{formatBytes(f.size)}</div>
                  </div>
                  <a className="download-button" href={f.url} download={f.name}>
                    ⬇️ Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rightbar glass-surface">
        <div className="header">
          <div>
            <div className="title">Live Chat</div>
            <div className="subtitle">Instant messaging</div>
          </div>
        </div>
        
        <div className="chat-container">
          <div className="chat-input-area">
            <Textarea 
              rows={4} 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="Type your message here..." 
              style={{ border: 'none', background: 'transparent' }}
            />
            <div className="chat-controls">
              <div className={`chat-status ${!dataChannelReady ? 'connecting' : ''}`}>
                <div className="chat-status-dot"></div>
                {dataChannelReady ? "✅ Ready to send" : "🔄 Connecting..."}
              </div>
              <div className="chat-buttons">
                <button onClick={() => { setChatInput(""); }} className="glass-button">
                  🗑️ Clear
                </button>
                <button 
                  onClick={sendText} 
                  className="glass-button accent"
                  disabled={!chatInput.trim()}
                  style={{ 
                    opacity: !chatInput.trim() ? 0.5 : 1,
                    cursor: !chatInput.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  🚀 Send
                </button>
              </div>
            </div>
          </div>
          
          <div className="chat-messages">
            {chat.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <div>No messages yet.</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>Start the conversation!</div>
              </div>
            )}
            {chat.length > 0 && chat.map((m) => (
              <div key={m.id} className="message">
                <div className={`message-author ${m.who === 'me' ? 'me' : ''}`}>
                  {m.who === 'me' ? '👤 You' : '👥 Peer'}
                </div>
                <div className="message-content">{m.text}</div>
                <button 
                  className={`message-copy-btn ${copiedId === m.id ? 'copied' : ''}`}
                  onMouseDown={(e) => copyText(e, m.id, m.text)}
                  onTouchStart={(e) => copyText(e, m.id, m.text)}
                  title="Copy message"
                  type="button"
                >
                  {copiedId === m.id ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() { return (<BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/session" element={<Session />} /></Routes></BrowserRouter>); }