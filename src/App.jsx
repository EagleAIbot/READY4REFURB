import { useState, useEffect, useRef } from 'react'
const BASE = import.meta.env.BASE_URL
const img = (name) => `${BASE}images/${name}`
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { useAppStore } from './store/useAppStore'
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  Zap,
  Layers,
  Droplets,
  Grid3x3,
  Wrench,
  Paintbrush,
  Bath,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Hammer,
  UtensilsCrossed,
  Home,
  Brush,
  Drill,
  LayoutDashboard,
} from 'lucide-react'
import HeroScene from './HeroScene'
import StatsScene from './StatsScene'
import { CounterStat } from './components/CounterStat'
import './App.css'

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', town: '', workRequired: '', budget: '', message: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(false)

  const { sceneLoaded, setAnimationsReady, setFinished } = useAppStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!sceneLoaded) return
    const t1 = setTimeout(() => setAnimationsReady(), 150)
    const t2 = setTimeout(() => setFinished(), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [sceneLoaded])

  const animationsReady = useAppStore((s) => s.animationsReady)
  useEffect(() => {
    if (!animationsReady) return
    const tl = gsap.timeline()
    tl.fromTo('.hero-title',         { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1,   ease: 'power3.out' })
      .fromTo('.hero-cta-wrap',      { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .fromTo('.hero-right-headline',{ opacity: 0, x:  40 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.9')
      .fromTo('.hero-right-sub',     { opacity: 0, x:  40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
  }, [animationsReady])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(false)
    try {
      const res = await fetch('https://formsubmit.co/ajax/ready4refurb@gmail.com', {
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
      title: "Full Bathroom Installations",
      description: "From stripping out the old to fitting the final fixture, we handle every stage of a complete bathroom transformation. One team. One job. No subcontractors left unmanaged."
    },
    {
      number: "02",
      title: "Wet Rooms & Walk-In Showers",
      description: "Tanked, tiled, and fitted to the highest waterproofing standards. Whether it's a full wet room or a frameless walk-in enclosure, we make it watertight and stunning."
    },
    {
      number: "03",
      title: "Tiling",
      description: "Large-format tiles, feature walls, intricate patterns. Our tilers are skilled in every format - rectified porcelain, natural stone, metro, herringbone. Perfect finish every time."
    },
    {
      number: "04",
      title: "Plumbing & Supply",
      description: "Full plumbing work including shower valves, underfloor heating, heated towel rails, and all pipework. We also supply bathroom furniture and sanitaryware at trade prices."
    },
    {
      number: "05",
      title: "Kitchen Fitting",
      description: "From full kitchen installations to replacing doors, worktops, and splashbacks. We work with your units or source them for you - measured, fitted, and finished properly."
    },
    {
      number: "06",
      title: "Carpentry & Joinery",
      description: "Stud walls, boxing in, fitted furniture, skirting, architrave, and bespoke timber work. Whether it's creating a hidden pipe chase or a built-in vanity unit, we build it right."
    },
    {
      number: "07",
      title: "Plastering",
      description: "Smooth finish plaster, dry lining, patching, and full room replasters. We leave walls ready for tiling or decorating - flat, clean, and properly prepared."
    },
    {
      number: "08",
      title: "General Home Improvements",
      description: "Odd jobs, home refurbishments, and property makeovers. If it needs doing in your home, chances are we can do it - or we know a trusted trade who can."
    },
  ]

  const workTypes = [
    { icon: Bath,            title: "Full Bathrooms",        desc: "Complete strip-out and full refits from floor to ceiling" },
    { icon: Droplets,        title: "Wet Rooms",             desc: "Fully tanked and waterproofed wet rooms and walk-in showers" },
    { icon: Grid3x3,         title: "Tiling",                desc: "Large format, stone, metro, feature walls - any format, any pattern" },
    { icon: Wrench,          title: "Plumbing",              desc: "Valves, underfloor heating, towel rails, and all pipework" },
    { icon: Layers,          title: "En Suites",             desc: "Compact en suites designed to maximise every centimetre of space" },
    { icon: Shield,          title: "Supply & Fit",          desc: "Trade-priced sanitaryware, furniture, and tiles sourced and fitted" },
    { icon: UtensilsCrossed, title: "Kitchen Fitting",       desc: "Full kitchen installations, worktops, splashbacks, and units" },
    { icon: Hammer,          title: "Carpentry & Joinery",   desc: "Stud walls, boxing in, fitted furniture, and bespoke timber work" },
    { icon: Brush,           title: "Plastering",            desc: "Full replasters, patching, and skim coats - ready for tiles or paint" },
    { icon: LayoutDashboard, title: "Kitchens",              desc: "Measured, fitted, and finished - units, worktops, and all the detail" },
    { icon: Home,            title: "Home Improvements",     desc: "Refurbs, odd jobs, and property makeovers done properly" },
    { icon: Paintbrush,      title: "Design & Consult",      desc: "We help you plan the space, choose materials, and get it right first time" },
  ]

  const process = [
    { n: "01", title: "Survey",  desc: "We visit, measure, and understand exactly what you want. No pressure, no hard sell." },
    { n: "02", title: "Design",  desc: "We help you plan the layout, choose materials, and agree the full scope and price." },
    { n: "03", title: "Supply",  desc: "We source everything at trade price. You save on materials without the legwork." },
    { n: "04", title: "Install", desc: "Our team fits it properly, tidies up daily, and doesn't leave until it's perfect." },
  ]

  const materials = [
    "Porcelain", "Natural Stone", "Herringbone", "Metro Tile", "Quartz",
    "Walk-In Shower", "Freestanding Bath", "Underfloor Heating", "Frameless Glass",
    "Towel Rail", "Feature Wall", "Wet Room", "Resin Floor", "Large Format",
    "Kitchen Fitting", "Carpentry", "Plastering", "Joinery", "Home Improvements",
  ]

  return (
    <div className="app">

      {/* Navigation */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <img src={img('r4r-logo.png')} alt="R4R" className="nav-logo-icon" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            <span className="nav-logo-text">Ready For Refurb</span>
          </div>
          <a href="#contact" className="nav-cta">Get a Quote</a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <HeroScene />
        {/* Bottom-left — headline + CTA */}
        <div className="hero-left">
          <h1 className="hero-title">Are<br />you<br /><span style={{ color: '#3FB8E0' }}>R4R?</span></h1>
          <div className="hero-cta-wrap">
            <a href="#contact" className="hero-cta">Get a Free Quote <ArrowRight size={18} /></a>
          </div>
        </div>
        {/* Bottom-right — secondary message */}
        <div className="hero-right">
          <p className="hero-right-headline">We don't just<br />do bathrooms.</p>
          <p className="hero-right-sub">Kitchens, carpentry,<br />plastering, tiling —<br />whatever it needs.</p>
        </div>
      </section>

      {/* ── Materials Ticker ──────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...materials, ...materials].map((m, i) => (
            <span key={i} className="ticker-item">{m}</span>
          ))}
        </div>
      </div>

      {/* ── Services ──────────────────────────────────── */}
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

      {/* ── Work Types ────────────────────────────────── */}
      <section className="use-cases">
        <div className="use-cases-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">What we do</p>
            <h2 className="section-title">Bathrooms first. Home improvements too.</h2>
          </motion.div>
          <div className="use-cases-grid">
            {workTypes.map((u, i) => (
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

      {/* ── Stats ─────────────────────────────────────── */}
      <section className="stats">
        <StatsScene />
        <div className="stats-container">
          {[
            { value: "200+", label: "Bathrooms installed and handed over on time" },
            { value: "10+",  label: "Years of trade experience in bathroom fitting" },
            { value: "5★",   label: "Average customer rating across all reviews" },
            { value: "1wk",  label: "Typical install time for a full bathroom refit" },
            { value: "100%", label: "Fully managed - one team, no loose contractors" },
            { value: "0",    label: "Hidden costs. Every quote is fixed-price upfront" },
          ].map((s, i) => (
            <motion.div key={i} className="stat-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}>
              <CounterStat value={s.value} label={s.label} />
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Process ───────────────────────────────────── */}
      <section className="process">
        <div className="process-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">How we work</p>
            <h2 className="section-title">From idea to installed</h2>
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

      {/* ── CTA Band ──────────────────────────────────── */}
      <section className="cta-band">
        <div className="cta-band-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="cta-band-title">Ready for a bathroom<br />you'll love?</h2>
            <p className="cta-band-sub">Fixed pricing. No hidden costs. Tidy, respectful team on every job.</p>
            <a href="#contact" className="cta-band-btn">Get a free quote <ArrowRight size={18} /></a>
          </motion.div>
        </div>
      </section>

      {/* ── Gallery ───────────────────────────────────── */}
      <section id="gallery" className="gallery">
        <div className="gallery-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Our work</p>
            <h2 className="section-title">Recent projects</h2>
          </motion.div>
          <div className="gallery-grid">
            {[
              { src: img('IMG_4581.jpeg'), alt: 'Luxury black marble ensuite with LED shelves', large: true },
              { src: img('IMG_4301.png'),  alt: 'Onyx stone walk-in shower' },
              { src: img('IMG_3767.jpeg'), alt: 'Freestanding bath and walk-in shower' },
              { src: img('IMG_3078.jpeg'), alt: 'Modern dark grey ensuite' },
              { src: img('IMG_4531.jpeg'), alt: 'Contemporary fitted family bathroom' },
              { src: img('IMG_4072.jpeg'), alt: 'Walk-in shower with recessed niche' },
              { src: img('IMG_3720.jpeg'), alt: 'Cream marble shower enclosure' },
              { src: img('IMG_4563.jpeg'), alt: 'Modern cloakroom' },
              { src: img('IMG_3410.jpeg'), alt: 'Family bathroom with rainfall shower' },
              { src: img('IMG_3085.jpeg'), alt: 'Dark grey shower detail' },
              { src: img('IMG_3256.jpeg'), alt: 'Powder room with patterned floor tiles' },
            ].map((img, i) => (
              <motion.div
                key={i}
                className={`gallery-item${img.large ? ' gallery-item--large' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────── */}
      <section className="why-us">
        <div className="why-us-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">Why R4R</p>
            <h2 className="section-title">We're different</h2>
          </motion.div>
          <div className="why-grid">
            {[
              { title: "Fixed-price quotes",       desc: "We give you a clear price upfront and stick to it. No surprise costs at the end of the job." },
              { title: "One team, start to finish", desc: "The same crew surveys, tiles, plumbs, and fits. No handoffs, no miscommunication between trades." },
              { title: "We respect your home",      desc: "We hoover up daily, protect your floors, and treat your home as if it were our own." },
              { title: "Trade-priced materials",    desc: "We pass on our trade discounts on tiles, sanitaryware, and fittings. You get better materials for less." },
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

      {/* ── Testimonials ──────────────────────────────── */}
      <section className="scenarios">
        <div className="scenarios-container">
          <motion.div className="section-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label">What customers say</p>
            <h2 className="section-title">Straight from the source</h2>
          </motion.div>
          <div className="scenarios-grid">
            {[
              {
                type: "Full bathroom refit",
                problem: "Our bathroom was 20 years old - tired grout, a leaking shower tray, and a layout that made no sense. We'd had two other quotes that came back with hidden extras.",
                built: "R4R surveyed on Monday, quoted the same day, and started the following week. Everything was stripped, waterproofed, tiled, and fitted in 6 days.",
                outcome: "Exactly on quote. No surprises.",
              },
              {
                type: "Wet room installation",
                problem: "We wanted to convert a small bathroom into a fully accessible wet room for my mother. The tricky part was the floor gradient and getting the drain in the right place.",
                built: "They tanked the whole room, graded the floor perfectly, and even sorted the threshold so there's no trip hazard. The finish is immaculate.",
                outcome: "Done in 5 days. Mum loves it.",
              },
              {
                type: "En suite tiling",
                problem: "We had the en suite fitted elsewhere but the tiler let us down - uneven grout lines, a crooked feature wall, and one cracked tile they just left in.",
                built: "R4R came in, stripped all the bad tiles, and re-did the whole room properly. Large format porcelain, perfectly level, perfect grout lines.",
                outcome: "Night and day difference.",
              },
            ].map((s, i) => (
              <motion.div key={i} className="scenario-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="scenario-type">{s.type}</div>
                <div className="scenario-block">
                  <p className="scenario-label">The situation</p>
                  <p className="scenario-text">{s.problem}</p>
                </div>
                <div className="scenario-block">
                  <p className="scenario-label">What we did</p>
                  <p className="scenario-text">{s.built}</p>
                </div>
                <div className="scenario-outcome">{s.outcome}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────── */}
      <section id="contact" className="contact">
        <div className="contact-container">
          <motion.div className="contact-header" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label" style={{ color: '#888' }}>Contact</p>
            <h2 className="contact-title">Get a free quote</h2>
            <p className="contact-subtitle">Tell us what you're after and we'll get back to you within 24 hours.</p>
          </motion.div>
          <div className="contact-content">
            <motion.div className="contact-info" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="contact-item">
                <Phone size={20} />
                <a href="tel:+441234567890">Call us directly</a>
              </div>
              <div className="contact-item">
                <Mail size={20} />
                <a href="mailto:info@r4rbathrooms.co.uk">info@r4rbathrooms.co.uk</a>
              </div>
              <div className="contact-item">
                <MapPin size={20} />
                <span>Covering [your area] & surroundings</span>
              </div>
              <div className="contact-turnaround">
                <Clock size={16} />
                We respond within 24 hours
              </div>
              <div className="contact-reassurance">
                <div className="reassurance-item"><ChevronRight size={14} /> Free no-obligation survey</div>
                <div className="reassurance-item"><ChevronRight size={14} /> Fixed-price quote - no extras</div>
                <div className="reassurance-item"><ChevronRight size={14} /> Fully insured tradespeople</div>
              </div>
            </motion.div>
            <motion.div className="contact-form-container" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {!formSubmitted ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone number" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email address" />
                    </div>
                    <div className="form-group">
                      <input type="text" name="town" value={formData.town} onChange={handleChange} required placeholder="Town / City" />
                    </div>
                  </div>
                  <div className="form-group">
                    <select name="workRequired" value={formData.workRequired} onChange={handleChange} required className={formData.workRequired ? '' : 'select-placeholder'}>
                      <option value="" disabled>Work required - select your project</option>
                      <option value="Full bathroom installation">Full bathroom installation</option>
                      <option value="Wet room / walk-in shower">Wet room / walk-in shower</option>
                      <option value="En suite">En suite</option>
                      <option value="Bathroom refurbishment">Bathroom refurbishment (refresh existing)</option>
                      <option value="Tiling only">Tiling only</option>
                      <option value="Plumbing only">Plumbing only</option>
                      <option value="Kitchen fitting">Kitchen fitting</option>
                      <option value="Carpentry / joinery">Carpentry / joinery</option>
                      <option value="Plastering">Plastering</option>
                      <option value="General home improvement">General home improvement</option>
                      <option value="Multiple / not sure">Multiple works / not sure yet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <select name="budget" value={formData.budget} onChange={handleChange} required className={formData.budget ? '' : 'select-placeholder'}>
                      <option value="" disabled>Budget - what are you looking to spend?</option>
                      <option value="Under £3,000">Under £3,000</option>
                      <option value="£3,000 – £5,000">£3,000 – £5,000</option>
                      <option value="£5,000 – £8,000">£5,000 – £8,000</option>
                      <option value="£8,000 – £12,000">£8,000 – £12,000</option>
                      <option value="£12,000 – £20,000">£12,000 – £20,000</option>
                      <option value="£20,000+">£20,000+</option>
                      <option value="Not sure yet">Not sure yet - happy to discuss</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <textarea name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Anything else? Size of room, timescales, specific ideas - the more detail the better" />
                  </div>
                  <button type="submit" className="form-submit" disabled={formLoading}>
                    {formLoading ? 'Sending…' : <><span>Get My Free Quote</span> <ArrowRight size={18} /></>}
                  </button>
                  {formError && (
                    <p className="form-error">Something went wrong. Please call us or email <a href="mailto:info@r4rbathrooms.co.uk">info@r4rbathrooms.co.uk</a></p>
                  )}
                </form>
              ) : (
                <motion.div className="form-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <CheckCircle2 size={48} />
                  <h3>Enquiry received</h3>
                  <p>We'll get back to you within 24 hours to arrange your free survey.</p>
                  <button onClick={() => { setFormSubmitted(false); setFormData({ name: '', email: '', phone: '', town: '', workRequired: '', budget: '', message: '' }) }} className="form-reset">
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
          <div className="footer-logo">Ready For Refurb</div>
          <p className="footer-text">© 2026 Ready For Refurb. Fitted properly. Every time.</p>
        </div>
      </footer>

    </div>
  )
}

export default App
