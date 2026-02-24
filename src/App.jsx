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
  Workflow,
  Phone,
  Database
} from 'lucide-react'
import HeroScene from './HeroScene'
import StatsScene from './StatsScene'
import { CounterStat } from './components/CounterStat'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(false)
    try {
      const res = await fetch(`https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setFormSubmitted(true)
      } else {
        setFormError(true)
      }
    } catch {
      setFormError(true)
    } finally {
      setFormLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const services = [
    {
      number: "01",
      title: "Custom AI Models",
      description: "Fine-tuned models, RAG pipelines, predictive systems, autonomous agents. If it involves building or deploying an AI model, we've done it. We work with GPT-4o, Claude, Llama, Mistral, and custom-trained architectures."
    },
    {
      number: "02",
      title: "Full Product Builds",
      description: "End-to-end development of AI-powered products, from initial concept through to live deployment. We own the full stack: frontend, backend, model integration, infrastructure."
    },
    {
      number: "03",
      title: "Process Automation",
      description: "Replace manual, repetitive work with intelligent automation. Multi-step workflows, browser agents, data pipelines, email sequences. We build systems that run themselves."
    },
    {
      number: "04",
      title: "AI Strategy",
      description: "Not sure where AI fits in your business? We map the opportunity, identify the highest-ROI use cases, build the roadmap, and give you a clear picture of cost and timeline before you commit to anything."
    }
  ]

  const useCases = [
    { icon: MessageSquare, title: "AI Chatbots", desc: "Customer support, lead qualification, and sales automation that works 24/7" },
    { icon: FileText, title: "Document AI", desc: "Extract, analyse, and act on data from contracts, invoices, and reports instantly" },
    { icon: BarChart3, title: "Predictive Models", desc: "Demand forecasting, pricing engines, risk scoring. Models trained on your actual data." },
    { icon: Search, title: "AI Search", desc: "Semantic search across your internal knowledge base, product catalogue, or document store" },
    { icon: Workflow, title: "Workflow Automation", desc: "Multi-step business processes automated end-to-end, from data ingestion to output delivery." },
    { icon: Bot, title: "Custom LLM Solutions", desc: "Fine-tuned models and RAG pipelines trained on your proprietary data and domain knowledge" },
    { icon: Zap, title: "AI Agents", desc: "Autonomous pipelines that research, act, and deliver results without human input. Like having an employee that never sleeps." },
    { icon: Phone, title: "Voice AI", desc: "Phone agents that handle inbound calls, answer questions, and book appointments around the clock" },
    { icon: Database, title: "Data Pipelines", desc: "Ingest, clean, and structure messy data so your models have something solid to work with" },
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
            <span className="nav-logo-text">Shift AI</span>
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
            Custom models. Full products. Total automation.<br />Whatever AI you need, we build it.
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
            <h2 className="section-title">If it runs on AI, we build it</h2>
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
            { value: "Day 1", label: "Useful output from day one. No lengthy onboarding." },
            { value: "Weeks", label: "Typical time from brief to working prototype" },
            { value: "UK", label: "Based in the UK, working with businesses across Britain." },
            { value: "24/7", label: "AI systems that work while you sleep" },
            { value: "100%", label: "Founder-led. You talk directly to the people building it." },
            { value: "Frontier", label: "GPT-4o, Claude, Gemini, Llama. Always the best model for the job." },
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
            <p className="cta-band-sub">One-off projects or ongoing retainers. No account managers. No nonsense.</p>
            <a href="#contact" className="cta-band-btn">Get a free consultation <ArrowRight size={18} /></a>
          </motion.div>
        </div>
      </section>

      {/* ── Local Business ───────────────────────────── */}
      <section id="local-business" className="local-biz">
        <div className="local-biz-container">
          <motion.div className="local-biz-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label local-biz-label">For UK local businesses</p>
            <h2 className="local-biz-title">Something on your website<br />is costing you customers.</h2>
            <p className="local-biz-intro">
              Most local businesses we work with (dentists, gyms, roofers, electricians, salons) are losing 2 to 5 enquiries a week without knowing it. Slow site, not showing up on Google, no way to book out of hours. We audit your digital presence for free and tell you exactly what's happening. Then we fix it.
            </p>
          </motion.div>

          <div className="local-biz-steps">
            {[
              {
                n: "01",
                title: "Free audit, 48 hours",
                desc: "We look at your website speed, Google Business Profile, local search rankings, online booking, and reviews. You get a plain-English report back in 48 hours. No jargon, no obligation, no sales pitch."
              },
              {
                n: "02",
                title: "We fix what's broken",
                desc: "Site too slow? We'll fix it. Not showing up on Google Maps? We'll sort your listing. No way for customers to book or enquire online? We'll build that. Every fix is priced upfront with no surprises."
              },
              {
                n: "03",
                title: "AI receptionist",
                desc: "An AI that answers your phone, handles common questions, and books appointments, even at 11pm on a Sunday. You stop losing jobs to voicemail. Set up in a week, runs itself after that."
              }
            ].map((step, i) => (
              <motion.div key={i} className="local-biz-step" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="local-biz-step-num">{step.n}</div>
                <h3 className="local-biz-step-title">{step.title}</h3>
                <p className="local-biz-step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div className="local-biz-pricing" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="local-biz-pricing-label">What it costs</p>
            <div className="local-biz-pricing-grid">
              {[
                { service: "Digital audit + full report", price: "Free" },
                { service: "Google listing fix + profile setup", price: "From £200" },
                { service: "New website (fast, mobile, converts)", price: "From £1,500" },
                { service: "AI receptionist", price: "From £300/month" },
                { service: "SEO + ongoing maintenance", price: "From £200/month" },
              ].map((row, i) => (
                <div key={i} className="local-biz-pricing-row">
                  <span className="local-biz-pricing-service">{row.service}</span>
                  <span className="local-biz-pricing-price">{row.price}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="local-biz-cta" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <a href="#contact" className="local-biz-btn">Get your free audit <ArrowRight size={18} /></a>
            <span className="local-biz-note">No commitment. 48-hour turnaround. Plain English results.</span>
          </motion.div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────── */}
      <section className="why-us">
        <div className="why-us-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Why Shift AI</p>
            <h2 className="section-title">We're different</h2>
          </motion.div>
          <div className="why-grid">
            {[
              { title: "UK-based, founder-run", desc: "We're a small UK team. When you contact us, you talk to the person who'll actually do the work. No handoffs, no account managers." },
              { title: "We build the full stack", desc: "Custom models, automations, voice agents, full products, local business tools. We do all of it. You don't need five different agencies." },
              { title: "Costs you'll actually like", desc: "We build lean. No enterprise bloat, no inflated margins. Pay per project, keep the value." },
              { title: "Speed is the product", desc: "We've shipped working AI systems in days. When you need to move fast, we move fast." },
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

      {/* ── Scenarios ────────────────────────────────── */}
      <section className="scenarios">
        <div className="scenarios-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Real problems we solve</p>
            <h2 className="section-title">What this looks like in practice</h2>
          </motion.div>
          <div className="scenarios-grid">
            {[
              {
                type: "Local business",
                problem: "A dental practice in Manchester had no online booking, a site that took 5 seconds to load on mobile, and three unanswered Google reviews. They had no idea how many enquiries they were losing.",
                built: "We audited the site, fixed their Google Business Profile, integrated an online booking system, and set up an AI receptionist for out-of-hours calls.",
                outcome: "£2,100 upfront. £300/month ongoing."
              },
              {
                type: "AI product",
                problem: "A UK startup needed a recommendation engine to surface the right products to each visitor based on browsing behaviour — without a data science team to build or maintain it.",
                built: "We built a RAG-based recommendation pipeline trained on their product catalogue and user data. Integrated directly into their existing platform with no infrastructure changes needed.",
                outcome: "Delivered in under 3 weeks."
              },
              {
                type: "Process automation",
                problem: "A professional services firm had hundreds of client contracts in a shared drive. Finding key clauses, flagging renewals, and answering basic contract questions took hours of manual work every week.",
                built: "We built a document AI pipeline that ingests their contracts, extracts key terms, flags upcoming renewals, and answers plain-English questions about any document instantly.",
                outcome: "3+ hours saved per week from day one."
              }
            ].map((s, i) => (
              <motion.div key={i} className="scenario-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="scenario-type">{s.type}</div>
                <div className="scenario-block">
                  <p className="scenario-label">The problem</p>
                  <p className="scenario-text">{s.problem}</p>
                </div>
                <div className="scenario-block">
                  <p className="scenario-label">What we built</p>
                  <p className="scenario-text">{s.built}</p>
                </div>
                <div className="scenario-outcome">{s.outcome}</div>
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
                <a href="mailto:hello@shiftaitech.com">hello@shiftaitech.com</a>
              </div>
              <div className="contact-item">
                <MapPin size={20} />
                <span>United Kingdom</span>
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
                  <button type="submit" className="form-submit" disabled={formLoading}>
                    {formLoading ? 'Sending…' : <><span>Send Message</span> <ArrowRight size={18} /></>}
                  </button>
                  {formError && (
                    <p className="form-error">Something went wrong. Please email us directly at <a href="mailto:hello@shiftaitech.com">hello@shiftaitech.com</a></p>
                  )}
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
          <div className="footer-logo">Shift AI</div>
          <p className="footer-text">© 2026 Shift AI — United Kingdom</p>
        </div>
      </footer>

    </div>
  )
}

export default App
