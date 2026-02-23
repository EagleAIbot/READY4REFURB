import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { useAppStore } from './store/useAppStore'
import { 
  ArrowRight, 
  Mail, 
  MapPin,
  CheckCircle2,
  MessageSquare,
  Zap,
  BarChart3,
  Bot,
  Search,
  FileText,
  Workflow
} from 'lucide-react'
import HeroScene from './HeroScene'
import StatsScene from './StatsScene'
import { CounterStat } from './components/CounterStat'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const tickerRef = useRef(null)

  const { sceneLoaded, setAnimationsReady, setFinished } = useAppStore()

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // State machine: sceneLoaded → animationsReady → isFinished
  useEffect(() => {
    if (!sceneLoaded) return
    const t1 = setTimeout(() => setAnimationsReady(), 150)
    const t2 = setTimeout(() => setFinished(), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [sceneLoaded])

  // Hero text stagger — fires when animationsReady flips true
  const animationsReady = useAppStore((s) => s.animationsReady)
  useEffect(() => {
    if (!animationsReady) return
    const tl = gsap.timeline()
    tl.fromTo('.hero-title',    { opacity: 0, y: 55 }, { opacity: 1, y: 0, duration: 1,   ease: 'power3.out' })
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
      .fromTo('.hero-cta-wrap', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.45')
  }, [animationsReady])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const services = [
    {
      number: "01",
      title: "AI Strategy",
      description: "Strategic consulting to identify where AI delivers the biggest ROI in your business. We map the opportunity, build the roadmap, and keep costs minimal."
    },
    {
      number: "02",
      title: "Product Development",
      description: "End-to-end development of custom AI products — from initial concept through deployment. We build fast and iterate faster."
    },
    {
      number: "03",
      title: "Process Automation",
      description: "Replace manual, repetitive work with intelligent automation. Cut operational costs dramatically while freeing your team to focus on what matters."
    }
  ]

  const useCases = [
    { icon: MessageSquare, title: "AI Chatbots", desc: "Customer support, lead qualification, and sales automation that works 24/7" },
    { icon: FileText, title: "Document AI", desc: "Extract, analyse, and act on data from contracts, invoices, and reports instantly" },
    { icon: BarChart3, title: "Predictive Analytics", desc: "Forecast demand, detect risk, and surface insights your team can act on" },
    { icon: Search, title: "AI Search", desc: "Semantic search across your internal knowledge base or product catalogue" },
    { icon: Workflow, title: "Workflow Automation", desc: "Connect your tools and automate complex multi-step business processes" },
    { icon: Bot, title: "Custom LLM Solutions", desc: "Fine-tuned models and RAG pipelines trained on your proprietary data" },
  ]

  const process = [
    { n: "01", title: "Brief", desc: "We listen. Understand your goals, constraints, and where AI fits." },
    { n: "02", title: "Design", desc: "We design the solution architecture and agree scope and cost upfront." },
    { n: "03", title: "Build", desc: "Rapid development using the best AI tools available. No bloat, no waste." },
    { n: "04", title: "Deploy", desc: "We ship, monitor, and iterate. Ongoing support as you scale." },
  ]

  const techStack = [
    "GPT-4o", "Claude 3.5", "Gemini 2.0", "Llama 3", "Mistral",
    "LangChain", "Pinecone", "Supabase", "Vercel", "AWS",
    "OpenAI API", "Anthropic API", "Whisper", "DALL·E 3", "Midjourney",
  ]

  return (
    <div className="app">

      {/* Navigation */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            {/* Orbital logomark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-logo-icon">
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
                <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8"/>
                  <stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
              </defs>
              {/* Outer orbital ring */}
              <ellipse cx="16" cy="16" rx="14" ry="6" stroke="url(#lg1)" strokeWidth="1.2" fill="none" opacity="0.9"/>
              {/* Inner orbital ring — tilted */}
              <ellipse cx="16" cy="16" rx="6" ry="14" stroke="url(#lg2)" strokeWidth="1.2" fill="none" opacity="0.7"/>
              {/* Centre node */}
              <circle cx="16" cy="16" r="2.5" fill="url(#lg1)"/>
              {/* Orbit dots */}
              <circle cx="30" cy="16" r="1.5" fill="#a855f7" opacity="0.9"/>
              <circle cx="16" cy="2"  r="1.2" fill="#06b6d4" opacity="0.8"/>
            </svg>
            <span className="nav-logo-text">Art AI</span>
          </div>
          <a href="#contact" className="nav-cta">Let's Talk</a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <HeroScene />
        <div className="hero-container">
          <div className="hero-title-wrap">
            <h1 className="hero-title">We build AI products<br />that work</h1>
          </div>
          <p className="hero-subtitle">
            Keeping costs low. Margins high. Results exceptional.
          </p>
          <div className="hero-cta-wrap">
            <a href="#contact" className="hero-cta">Start a Project <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      {/* ── Tech Ticker ──────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...techStack, ...techStack].map((t, i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Services ─────────────────────────────────── */}
      <section id="services" className="services">
        <div className="services-container">
          <motion.div className="services-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Services</p>
            <h2 className="services-title">What we do</h2>
          </motion.div>
          <div className="services-list">
            {services.map((s, i) => (
              <motion.div key={i} className="service-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="service-number">{s.number}</div>
                <div className="service-content">
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-description">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────── */}
      <section className="use-cases">
        <div className="use-cases-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">What we build</p>
            <h2 className="section-title">AI solutions for every problem</h2>
          </motion.div>
          <div className="use-cases-grid">
            {useCases.map((u, i) => (
              <motion.div key={i} className="use-case-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}>
                <div className="use-case-icon">
                  <u.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="use-case-title">{u.title}</h3>
                <p className="use-case-desc">{u.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / 3D Section ───────────────────────── */}
      <section className="stats">
        <StatsScene />
        <div className="stats-container">
          {[
            { value: "4×", label: "Average cost reduction vs traditional agencies" },
            { value: "< 4wks", label: "From brief to live product" },
            { value: "UAE", label: "Incorporated in Dubai — tax efficient, globally billed" },
            { value: "24/7", label: "AI systems that work while you sleep" },
            { value: "100%", label: "Founder-led — you talk to the people building it" },
            { value: "GPT-4o +", label: "Using the world's most advanced AI models" },
          ].map((s, i) => (
            <motion.div key={i} className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}>
              <CounterStat value={s.value} label={s.label} />
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────── */}
      <section className="process">
        <div className="process-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">How we work</p>
            <h2 className="section-title">From idea to live in weeks</h2>
          </motion.div>
          <div className="process-grid">
            {process.map((p, i) => (
              <motion.div key={i} className="process-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="process-number">{p.n}</div>
                <h3 className="process-title">{p.title}</h3>
                <p className="process-desc">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mid-page CTA ─────────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="cta-band-title">Ready to cut costs<br />and build smarter?</h2>
            <p className="cta-band-sub">Most projects go live in under 4 weeks. No retainers. No nonsense.</p>
            <a href="#contact" className="cta-band-btn">Get a free consultation <ArrowRight size={18} /></a>
          </motion.div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────── */}
      <section className="why-us">
        <div className="why-us-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Why Art AI</p>
            <h2 className="section-title">We're different</h2>
          </motion.div>
          <div className="why-grid">
            {[
              { title: "UAE-based, globally delivered", desc: "Incorporated in Dubai FZCO — favourable tax, global contracts, fast invoicing." },
              { title: "Costs you'll actually love", desc: "We build lean. No enterprise bloat, no inflated agency margins. You keep the value." },
              { title: "Founder-led", desc: "You work directly with the people building your product. No account managers in the way." },
              { title: "Speed is the product", desc: "We've shipped AI products in days. When you need to move fast, we move fast." },
            ].map((w, i) => (
              <motion.div key={i} className="why-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="why-dot" />
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────── */}
      <section id="contact" className="contact">
        <div className="contact-container">
          <motion.div className="contact-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label" style={{ color: '#888' }}>Contact</p>
            <h2 className="contact-title">Let's build something</h2>
            <p className="contact-subtitle">Tell us about your project and let's get to work.</p>
          </motion.div>
          <div className="contact-content">
            <motion.div className="contact-info" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="contact-item">
                <Mail size={20} />
                <a href="mailto:hello@artai.com">hello@artai.com</a>
              </div>
              <div className="contact-item">
                <MapPin size={20} />
                <span>Dubai, UAE</span>
              </div>
              <div className="contact-turnaround">
                <Zap size={16} />
                We respond within 24 hours
              </div>
            </motion.div>
            <motion.div className="contact-form-container" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {!formSubmitted ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Name" />
                    </div>
                    <div className="form-group">
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email" />
                    </div>
                  </div>
                  <div className="form-group">
                    <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company" />
                  </div>
                  <div className="form-group">
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Tell us about your project" />
                  </div>
                  <button type="submit" className="form-submit">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <motion.div className="form-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <CheckCircle2 size={48} />
                  <h3>Message received</h3>
                  <p>We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setFormSubmitted(false); setFormData({ name: '', email: '', company: '', message: '' }) }} className="form-reset">
                    Send another message
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">Art AI</div>
          <p className="footer-text">© 2026 Art AI FZCO — Dubai, UAE</p>
        </div>
      </footer>

    </div>
  )
}

export default App
