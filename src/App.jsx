import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Code,
  Server,
  Database,
  Cpu,
  Cloud,
  Award,
  BookOpen,
  Users,
  MessageSquare,
  Bot,
  Copy,
  Check,
  Maximize2,
  Minus,
  Send,
  RotateCcw
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const initialMessage = {
    id: 'init',
    sender: 'support',
    text: "Hello! I am HoverBot, Kishan's digital AI assistant. Ask me anything about his technical background, cloud serverless systems, or paste a job description here to check his suitability match!",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState([initialMessage]);

  const messagesEndRef = useRef(null);
  const sparkleParticles = useMemo(() => (
    Array.from({ length: 20 }, (_, i) => ({
      delay: `${(i * 0.12).toFixed(2)}s`,
      xOffset: `${(Math.sin(i) * 45).toFixed(0)}px`,
      yOffset: `${(-50 - ((i * 37) % 70)).toFixed(0)}px`,
      size: `${(((i * 17) % 30) / 10 + 1).toFixed(1)}px`
    }))
  ), []);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Track active section on scroll for nav link highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'experience', 'projects', 'skills', 'patents', 'achievements'];
      const scrollPosition = window.scrollY + 120; // Offset for header

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 80; // Offset for header
      const top = el.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Click handler for chatbot trigger button
  const handleChatTriggerClick = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      // Start the full screen high-tech scanning intro animation!
      setIsIntroActive(true);
      
      // Transition to actual chatbot display (swift 1.2 seconds sweep)
      setTimeout(() => {
        setIsIntroActive(false);
        setIsChatOpen(true);
      }, 1200);
    }
  };

  // Clipboard copy utility
  const handleCopyText = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Refresh/Reset Chat utility
  const handleResetChat = () => {
    setMessages([initialMessage]);
    setIsTyping(false);
  };

  // Bot response logic
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsgText = inputValue;
    const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user-' + Date.now();

    // Append user message
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: userMsgText,
      time: userMsgTime
    }]);

    setInputValue('');
    setIsTyping(true);

    try {
      const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || '/api/chat';
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMsgText })
      });

      if (!response.ok) {
        throw new Error(`Chat API failed with ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: 'bot-' + Date.now(),
        sender: 'support',
        text: data.answer || "I could not generate a grounded answer from the portfolio knowledge base.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Chat request failed:', error);
      setMessages(prev => [...prev, {
        id: 'bot-' + Date.now(),
        sender: 'support',
        text: "HoverBot could not reach the secure AWS/Gemini backend right now. Please check the API URL and try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* HIGH-TECH FULL-SCREEN OVERLAY INTRO ANIMATION */}
      <div className={`hologram-intro-overlay ${isIntroActive ? 'active' : ''}`}>
        <div className="intro-grid-background" />
        <div className="intro-scanner-line" />
        
        <div className="intro-content-container">
          {/* Centered orbital hologram structure */}
          <div className="intro-hologram-orbit-system">
            <div className="intro-ambient-glow" />
            
            <div className="intro-hologram-ring ring-outer">
              <div className="intro-hologram-node node-cyan-1" />
              <div className="intro-hologram-node node-cyan-2" />
            </div>
            
            <div className="intro-hologram-ring ring-mid">
              <div className="intro-hologram-node node-purple-1" />
              <div className="intro-hologram-node node-purple-2" />
            </div>
            
            <div className="intro-hologram-ring ring-inner">
              <div className="intro-hologram-node node-white" />
            </div>
            
            {/* Hologram core pulsing center element with transparent rotatable plexus robot/hand image */}
            <div className="intro-hologram-core">
              <img 
                src="/assistant_hologram.png" 
                alt="AI Hologram Assistant Plexus" 
                className="intro-hologram-img" 
              />
              <div className="intro-hologram-core-inner" />
              
              {/* Sparkler particle system rising upwards (inside core so it spins with the hand) */}
              <div className="sparkler-container">
                {sparkleParticles.map((particle, i) => (
                  <div 
                    key={i} 
                    className="sparkle-particle" 
                    style={{
                      '--delay': particle.delay,
                      '--x-offset': particle.xOffset,
                      '--y-offset': particle.yOffset,
                      '--size': particle.size
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot Action Trigger Button */}
      <button 
        id="chatbot-Btn" 
        onClick={handleChatTriggerClick}
        title="Interact with HoverBot AI Assistant"
      >
        <MessageSquare size={26} />
      </button>

      {/* Chatbot Window Container */}
      <div className={`chatbot-container ${isChatOpen ? 'open' : ''} ${isMaximized ? 'maximized' : ''}`}>
        
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="chatbot-title-container">
            <div className="chatbot-header-icon">
              <Bot size={22} />
            </div>
            <div className="chatbot-title-text">
              <h3>Support</h3>
              <div className="chatbot-status">
                <div className="chatbot-status-dot" />
                <span className="chatbot-status-text">Chat with us</span>
              </div>
            </div>
          </div>

          <div className="chatbot-controls">
            {/* Reset Chat */}
            <button 
              className="chatbot-control-btn" 
              onClick={handleResetChat} 
              title="Reset Chat History"
            >
              <RotateCcw size={14} />
            </button>
            {/* Toggle Full Screen */}
            <button 
              className="chatbot-control-btn" 
              onClick={() => setIsMaximized(!isMaximized)} 
              title={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              <Maximize2 size={14} />
            </button>
            {/* Collapse Chat */}
            <button 
              className="chatbot-control-btn" 
              onClick={() => setIsChatOpen(false)} 
              title="Minimize Chat"
            >
              <Minus size={14} />
            </button>
          </div>
        </div>

        {/* Chat Transcript Area */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg ${msg.sender}`}>
              <div className="chatbot-msg-meta">
                <span className={`sender ${msg.sender === 'user' ? 'user' : ''}`}>
                  {msg.sender === 'user' ? 'Kishan' : 'Support'}
                </span>
                <span className="time">{msg.time}</span>
              </div>
              <div className="chatbot-msg-bubble">
                {/* Process bold markdowns and line breaks in bot responses */}
                {msg.text.split('\n').map((line, idx) => {
                  let formattedLine = line;
                  // Handle bullet points
                  const isBullet = line.startsWith('•') || line.startsWith('•') || line.startsWith('*') || line.startsWith('✔') || line.startsWith('•');
                  
                  return (
                    <p key={idx} style={{ margin: 0, paddingLeft: isBullet ? '0.5rem' : '0', marginBottom: idx !== msg.text.split('\n').length - 1 ? '0.35rem' : '0' }}>
                      {/* Bold checks */}
                      {formattedLine.split('**').map((part, pIdx) => {
                        if (pIdx % 2 === 1) {
                          return <strong key={pIdx} style={{ color: msg.sender === 'user' ? 'white' : 'var(--accent-cyan)' }}>{part}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
              
              {/* Utility buttons for support responses */}
              {msg.sender === 'support' && (
                <div className="chatbot-msg-utils">
                  <button 
                    className="chatbot-util-btn" 
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    title="Copy response to clipboard"
                  >
                    {copiedId === msg.id ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Bot Typing indicator */}
          {isTyping && (
            <div className="chatbot-msg support">
              <div className="chatbot-msg-meta">
                <span className="sender">Support</span>
              </div>
              <div className="chatbot-msg-bubble" style={{ width: 'fit-content' }}>
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Text Form */}
        <div className="chatbot-input-container">
          <form onSubmit={handleSendMessage} className="chatbot-input-wrapper">
            <input 
              type="text" 
              className="chatbot-input" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button 
              type="submit" 
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isTyping}
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Brand footer bar */}
        <div className="chatbot-footer-brand">
          Powered by <span>HoverBot</span>
        </div>

      </div>

      {/* Navigation Header */}
      <header className="app-header">
        <div className="nav-container">
          <a href="#home" className="logo-script" onClick={(e) => handleNavClick(e, 'home')}>
            Kishan
          </a>

          <nav className="nav-links">
            <a 
              href="#home" 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'home')}
            >
              Home
            </a>
            <a 
              href="#about" 
              className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a 
              href="#experience" 
              className={`nav-link ${activeSection === 'experience' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'experience')}
            >
              Experience
            </a>
            <a 
              href="#projects" 
              className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'projects')}
            >
              Projects
            </a>
            <a 
              href="#skills" 
              className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'skills')}
            >
              Skills
            </a>
            <a 
              href="#patents" 
              className={`nav-link ${activeSection === 'patents' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'patents')}
            >
              Patents
            </a>
            <a 
              href="#achievements" 
              className={`nav-link ${activeSection === 'achievements' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'achievements')}
            >
              Achievements
            </a>
          </nav>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="content-wrapper">
        
        {/* HOME SECTION */}
        <section id="home" className="hero-section animate-fade-in">
          {/* Hero Content Left Card */}
          <div className="hero-card">
            <p className="hero-hi">Hi,</p>
            <h1 className="hero-name">
              I am <br />
              <span>Kishan S</span>
            </h1>
            <p className="hero-title">Backend & AI Systems Engineer</p>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '460px', lineHeight: '1.6' }}>
              I design robust cloud-native serverless backend environments, low-latency API orchestrations, and performant edge AI visual & biomedical devices.
            </p>

            <div className="hero-socials">
              <a href="https://github.com/KishanSadeesh" target="_blank" rel="noopener noreferrer" className="social-icon" title="GitHub">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/kishansadeesh/" target="_blank" rel="noopener noreferrer" className="social-icon" title="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="mailto:kishansadeesh13@gmail.com" className="social-icon" title="Email">
                <Mail size={20} />
              </a>
              <a href="tel:+919047478386" className="social-icon" title="Phone">
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Hero Visual Right Container - CSS Cosmic Orbit with Animated Hologram Core */}
          <div className="hero-animation-container">
            <div className="ambient-glow" />
            <div className="orbit-system">
              <img 
                src="/coder_hologram_core.png" 
                alt="Coder Tech Hologram Core" 
                className="hologram-image" 
              />
              
              <div className="orbit-ring ring-outer">
                <div className="orbit-node node-1" />
              </div>
              
              <div className="orbit-ring ring-mid">
                <div className="orbit-node node-2" />
              </div>
              
              <div className="orbit-ring ring-inner">
                <div className="orbit-node node-3" />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT MYSELF SECTION */}
        <section id="about" className="animate-fade-in">
          <h2 className="section-title">About Myself</h2>
          
          <div className="about-intro-block">
            <p style={{ marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: '1.75', color: '#fff' }}>
              I’m passionate about building smart, connected solutions through the <strong>Internet of Things (IoT)</strong>. I leverage <strong>React.js</strong> and <strong>Android Studio</strong> to develop full-stack prototypes that seamlessly turn ideas into real-world applications.
            </p>
            <p style={{ marginBottom: '1.25rem', fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              Recently, I completed a B.Tech in Computer Science Engineering (specializing in IoT) from VIT Vellore and finished a backend & AI systems internship at <strong>Nipurna IT Solutions</strong>. During my internship, I engineered a high-performance, serverless AI chatbot system using <strong>AWS Lambda, DeepSeek LLM, and DynamoDB</strong>, with a dynamic React frontend deployed via <strong>AWS Amplify</strong>.
            </p>
            <p style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              As <strong>Projects Head at IoThinC – VIT</strong>, I directed innovative IoT project development, conducted hands-on engineering workshops such as <em>“Arduino From Scratch”</em>, and fostered a vibrant collaborative culture for peer learning and innovation. I am eager to keep exploring IoT, GenAI, and cloud technologies to build systems that make life smarter and more efficient.
            </p>

            <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-header)', 
                fontSize: '1.1rem', 
                color: '#fff', 
                marginBottom: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontWeight: '600'
              }}>
                <BookOpen size={18} color="var(--accent-purple)" /> Education Details
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Degree</span>
                  <p style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600', marginTop: '0.3rem', lineHeight: '1.4' }}>
                    B.Tech in Computer Science Engineering
                  </p>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', display: 'block', marginTop: '0.1rem' }}>
                    IoT Specialization
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Institution</span>
                  <p style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '600', marginTop: '0.3rem' }}>
                    VIT Vellore
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <MapPin size={12} color="var(--accent-purple)" /> Tamil Nadu, India
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>Academic Standing</span>
                  <p style={{ fontSize: '1.25rem', color: 'var(--accent-purple)', fontWeight: '800', marginTop: '0.1rem', fontFamily: 'var(--font-header)' }}>
                    8.36 <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '400' }}>/ 10 CGPA</span>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                    ● Graduated
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="animate-fade-in">
          <h2 className="section-title">Experience</h2>
          
          {/* Card Blocks for Internship and Leadership */}
          <div className="about-blocks">
            {/* Card 1: Nipurna Internship */}
            <div className="about-card">
              <span className="about-card-role">May – Jun 2024</span>
              <h3 className="about-card-title">Backend & AI Systems Intern</h3>
              <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                Nipurna IT Solutions Pvt. Ltd. | Salem
              </p>
              <p className="about-card-desc" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                Deployed AWS serverless backends using Lambda & API Gateway. Integrated AWS Bedrock LLM models for query processing, implemented REST order workflows on DynamoDB, and configured high-reliability webhook endpoints.
              </p>
              <a 
                href="https://main.d2zalfnt7cze3g.amplifyapp.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="project-link-btn"
                style={{ 
                  background: 'var(--accent-gradient)', 
                  color: '#fff', 
                  border: 'none',
                  width: 'fit-content',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-header)',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
                }}
              >
                <span>Live Demo</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Card 2: IoThinC Projects Head */}
            <div className="about-card">
              <span className="about-card-role">Jan 2024 – Jan 2025</span>
              <h3 className="about-card-title">Projects Head & Technical Lead</h3>
              <p style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.8rem' }}>
                IoThinC Club | VIT Vellore
              </p>
              <p className="about-card-desc" style={{ flexGrow: 1 }}>
                Directed student groups building event-driven automation projects. Conducted technical hands-on workshops on microcontroller networks and guided cross-functional teams through API webhooks, edge-ML protocols, and integrations.
              </p>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="animate-fade-in">
          <h2 className="section-title">Featured Projects</h2>
          
          <div className="projects-grid">
            
            {/* Project 1: Voice AI Agent */}
            <div className="project-card">
              <div className="project-img-wrapper">
                <img 
                  src="/project_voice_agent.png" 
                  alt="Voice AI Agent Dashboard Mockup" 
                  className="project-img" 
                />
              </div>
              <div className="project-details">
                <span className="project-subtitle">AI & LangChain Orchestration</span>
                <h3 className="project-title">Voice-Controlled Local AI Agent</h3>
                <p className="project-desc">
                  Designed a voice-activated local AI assistant that achieves ultra-fast model replies (within 2 days of rapid prototyping). Integrated React with Groq Cloud (Llama 3/Gemma via Groq's high-speed API) and LangChain for dynamic tool selection, contextual system memory, and fully synthesized speech using Web Speech APIs.
                </p>
                <div className="project-tags">
                  {['React.js', 'Groq API', 'LangChain', 'Web Speech API', 'Speech Recognition'].map(t => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
                <div className="project-links">
                  <a 
                    href="https://github.com/KishanSadeesh/Local-AI-Agent" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="project-link-btn"
                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <span>GitHub Code</span>
                    <Github size={14} />
                  </a>
                  <a 
                    href="https://dev.to/kishan_sadeesh/how-i-built-a-voice-controlled-ai-agent-in-2-days-using-groq-langchain-and-react-l9l" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="project-link-btn"
                    style={{ background: 'var(--accent-gradient)', color: '#fff' }}
                  >
                    <span>Read Blog</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Project 2: Deep Learning STCrackNet */}
            <div className="project-card">
              <div className="project-img-wrapper">
                <img 
                  src="/project_damage_detection.png" 
                  alt="STCrackNet GIS Dashboard Mockup" 
                  className="project-img" 
                />
              </div>
              <div className="project-details">
                <span className="project-subtitle">Deep Learning & Computer Vision</span>
                <h3 className="project-title">STCrackNet Damage Detection</h3>
                <div className="project-desc" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p style={{ margin: 0 }}>
                    • Created <strong>STCrackNet</strong>: an automated deep learning damage-detection system using a novel dual-branch architecture that simultaneously processes RGB color-texture features and Sobel edge-gradient features through a Channel Attention fusion mechanism.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Introduced the Spatio-Temporal Degradation Fusion (STDF) algorithm computing a quantitative Road Degradation Index (RDI) to classify severity and project future trends; deployed as a live FastAPI app with a Leaflet.js GIS dashboard interfacing with satellite imagery APIs.
                  </p>
                </div>
                <div className="project-tags">
                  {['Deep Learning', 'FastAPI', 'Leaflet.js', 'Sobel Gradients', 'Attention Mechanism'].map(t => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project 3: Wearable Fall Detection */}
            <div className="project-card">
              <div className="project-img-wrapper">
                <img 
                  src="/project_fall_detection.png" 
                  alt="AI Wearable Fall Detection App Mockup" 
                  className="project-img" 
                />
              </div>
              <div className="project-details">
                <span className="project-subtitle">Edge AI & Companion Apps</span>
                <h3 className="project-title">AI Wearable Fall Detection System</h3>
                <p className="project-desc">
                  Built a specialized wearable system that runs custom edge machine learning on-device for live fall hazard classification. Transmits continuous sensor data to a custom Flutter mobile app using Firebase Realtime Database for quick emergency dispatcher notification.
                </p>
                <div className="project-tags">
                  {['Flutter', 'Firebase Realtime DB', 'TensorFlow Lite', 'Edge ML', 'MPU6050'].map(t => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project 4: Smart Irrigation */}
            <div className="project-card">
              <div className="project-img-wrapper">
                <img 
                  src="/project_irrigation.png" 
                  alt="IoT Irrigation Dashboard Mockup" 
                  className="project-img" 
                />
              </div>
              <div className="project-details">
                <span className="project-subtitle">IoT & Event Automation</span>
                <h3 className="project-title">Smart Irrigation Automation System</h3>
                <p className="project-desc">
                  Developed an event-triggered agricultural irrigation command pipeline. Connects live weather and moisture sensor webhooks to a physical NodeMCU Wi-Fi microcontroller using IFTTT automation chains to drive high-voltage remote field relays.
                </p>
                <div className="project-tags">
                  {['NodeMCU', 'IFTTT Webhooks', 'API Triggers', 'Wi-Fi Relays', 'ESP8266'].map(t => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* TECHNICAL EXPERTISE SECTION */}
        <section id="skills" className="animate-fade-in">
          <h2 className="section-title">Technical Expertise</h2>
          
          <div className="skills-grid triple">
            
            {/* 1. Languages */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <Code size={18} color="var(--accent-cyan)" /> Languages
              </h3>
              <div className="skill-badges">
                {['Python', 'Java', 'JavaScript', 'HTML5 / CSS3', 'SQL'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 2. Backend */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <Server size={18} color="var(--accent-cyan)" /> Backend Development
              </h3>
              <div className="skill-badges">
                {['REST APIs', 'AWS Lambda', 'API Gateway', 'Node.js', 'Serverless Architecture', 'FastAPI'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 3. Databases */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <Database size={18} color="var(--accent-cyan)" /> Databases
              </h3>
              <div className="skill-badges">
                {['DynamoDB', 'Firebase Realtime DB', 'SQL', 'PostgreSQL', 'MySQL'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 4. Frameworks/Tools */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <Cpu size={18} color="var(--accent-cyan)" /> Frameworks & Tools
              </h3>
              <div className="skill-badges">
                {['React.js', 'Flutter', 'NodeMCU', 'Git', 'GitHub', 'Postman', 'Leaflet.js', 'TensorFlow Lite'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 5. Cloud */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <Cloud size={18} color="var(--accent-cyan)" /> Cloud Infrastructures
              </h3>
              <div className="skill-badges">
                {['AWS Lambda', 'AWS Bedrock', 'API Gateway', 'Firebase Firestore', 'Firebase Auth', 'Serverless Framework'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 6. Concepts */}
            <div className="skill-category">
              <h3 className="skill-category-title">
                <BookOpen size={18} color="var(--accent-cyan)" /> Core Concepts
              </h3>
              <div className="skill-badges">
                {['System Design', 'Logging & Monitoring', 'Error Handling', 'Production Deployment', 'Edge AI Inference'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            {/* 7. Soft Skills */}
            <div className="skill-category" style={{ gridColumn: 'span 1' }}>
              <h3 className="skill-category-title">
                <Users size={18} color="var(--accent-cyan)" /> Soft Skills
              </h3>
              <div className="skill-badges">
                {['Problem Solving', 'Team Collaboration', 'Adaptability', 'Technical Communication'].map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* PATENTS SECTION */}
        <section id="patents" className="animate-fade-in">
          <h2 className="section-title">Patents</h2>
          
          <div className="patents-grid">
            
            {/* Patent 1: Wearable Safety */}
            <div className="patent-card">
              <span className="patent-status">Published</span>
              <h3 className="patent-title">AI-INTEGRATED WEARABLE DEVICE FOR HEALTH MONITORING WITH DUAL-MODE EMERGENCY ALERTS</h3>
              <div className="patent-meta">App No. 202641010447 • Published 2026</div>
              <p className="patent-desc">
                Architected a cost-effective smart wristband combining vital health analytics (MAX30102 pulse oximeter/DS18B20 thermometer) and multi-pollutant environmental sensors (PMS5003 for PM2.5, MH-Z19 for CO2, CCS811 for VOCs) controlled by an ESP32. Dynamically processes motion/vitals on-device for fall detection (MPU6050), activating local alert sirens and sending immediate cellular/Wi-Fi GPS coordinates to emergency services and medical response teams.
              </p>
            </div>

            {/* Patent 2: Wearable Safety System and Method */}
            <div className="patent-card">
              <span className="patent-status">Published</span>
              <h3 className="patent-title">An AI-based Wearable Safety System and Method for Integrated Health, Air Quality, and Emergency Response</h3>
              <div className="patent-meta">App No. 202641029742 • Published 2026</div>
              <p className="patent-desc">
                Presents a novel serverless, cloud-linked IoT safety architecture and classification method. Fuses multi-sensor inputs—including biomedical vitals (blood oxygen, heart rate, body temperature) and hazardous gas concentration arrays (PM2.5, carbon dioxide, volatile organic compounds)—with real-time on-device edge ML classification for emergency fall-downs or health anomalies. Integrates an automated dual-channel webhook and cellular response method that establishes high-reliability geo-location transmission and notification pipelines.
              </p>
            </div>

            {/* Patent 2: STCrackNet */}
            <div className="patent-card">
              <span className="patent-status filed">Just Filed</span>
              <h3 className="patent-title">Heterogeneous Dual-Encoder Spatio-Structural Fusion</h3>
              <div className="patent-meta">Patent Filed • 2026</div>
              <p className="patent-desc">
                Invented STCrackNet: an AI-driven urban infrastructure damage detection system. Incorporates a novel dual-branch convolutional neural network combining RGB color-texture features and Sobel edge-gradients through a custom Channel Attention fusion mechanism. Leverages the Spatio-Temporal Degradation Fusion (STDF) algorithm to calculate a quantitative Road Degradation Index (RDI) for real-time risk assessment, deployed as a high-speed FastAPI web portal.
              </p>
            </div>

          </div>
        </section>

        {/* ACHIEVEMENTS SECTION */}
        <section id="achievements" className="animate-fade-in">
          <h2 className="section-title">Certifications & Achievements</h2>
          
          <div className="achievements-timeline">
            
            {/* Achievement 1: Java Foundation */}
            <div className="achievement-wonder-card">
              <div className="achievement-badge-orb">
                <Award size={24} />
              </div>
              <div className="achievement-wonder-text">
                <span>June 2025</span>
                <h4>Java Foundation Certification</h4>
                <p>"Issued by Infosys SpringBoard — validation of high-competency enterprise credentials in Java programming patterns, object-oriented systems design, and backend algorithm structures."</p>
              </div>
            </div>

            {/* Achievement 2: Hackathon */}
            <div className="achievement-wonder-card">
              <div className="achievement-badge-orb">
                <Users size={24} />
              </div>
              <div className="achievement-wonder-text">
                <span>Feb 2025</span>
                <h4>48-Hour Hackathon Participant</h4>
                <p>"Issued by Yantra Central, VIT Vellore — collaborated dynamically under rigorous time limits to brainstorm, develop, and present fully working software-hardware integration designs."</p>
              </div>
            </div>

            {/* Achievement 3: HackerRank Gold */}
            <div className="achievement-wonder-card">
              <div className="achievement-badge-orb">
                <Code size={24} />
              </div>
              <div className="achievement-wonder-text">
                <span>Online Badge</span>
                <h4>HackerRank Java Badge</h4>
                <p>"Issued Online — achieved 5-Star Gold ranking in standard Java algorithms, demonstrating advanced proficiency in coding constructs and data structures."</p>
              </div>
            </div>

            {/* Achievement 4: Android App Dev */}
            <div className="achievement-wonder-card">
              <div className="achievement-badge-orb">
                <Cpu size={24} />
              </div>
              <div className="achievement-wonder-text">
                <span>June – July 2024</span>
                <h4>Android App Development Internship</h4>
                <p>"Issued by Imarticus Learning — acquired certifications in native Android UI structures, core mobile architecture, database handlers, and REST API connectors."</p>
              </div>
            </div>

            {/* Achievement 5: Adafruit IoT */}
            <div className="achievement-wonder-card">
              <div className="achievement-badge-orb">
                <Cloud size={24} />
              </div>
              <div className="achievement-wonder-text">
                <span>May 2023</span>
                <h4>IoT Using Adafruit Certification</h4>
                <p>"Issued by VIT — acquired a certificate of participation for building cloud-linked ESP8266 nodes and custom dashboards with Adafruit IO triggers."</p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="app-footer">
        <p className="footer-text">
          DESIGNED BY KISHAN S © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
