import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Clock, Star } from 'lucide-react'
import './QuotePage.css'

export default function QuotePage() {
  const [formData, setFormData]       = useState({ name: '', email: '', phone: '', town: '', workRequired: '', budget: '', message: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

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

  return (
    <div className="qp-page">

      {/* Header */}
      <header className="qp-header">
        <img src="/images/r4r-logo.png" alt="Ready For Refurb" className="qp-logo" />
        <span className="qp-brand">Ready For Refurb</span>
      </header>

      <main className="qp-main">

        {/* Left - copy + trust */}
        <motion.div
          className="qp-left"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="qp-eyebrow">Free, no-obligation quote</p>
          <h1 className="qp-title">Tell us what you need.<br />We'll sort the rest.</h1>
          <p className="qp-body">
            Bathrooms, wet rooms, tiling, kitchens, carpentry, plastering.
            Fill in the form and we'll get back to you within 24 hours with a fixed price - no hidden extras.
          </p>

          <ul className="qp-trust">
            <li><ShieldCheck size={18} /> Fixed-price quotes - no surprise costs</li>
            <li><Clock size={18} />       We respond within 24 hours</li>
            <li><Phone size={18} />       One team, start to finish</li>
            <li><Star size={18} />        Fully insured tradespeople</li>
          </ul>

          <div className="qp-gallery">
            {[
              '/images/IMG_4581.jpeg',
              '/images/IMG_3767.jpeg',
              '/images/IMG_4072.jpeg',
            ].map((src, i) => (
              <div key={i} className="qp-gallery-thumb">
                <img src={src} alt="R4R bathroom project" loading="lazy" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right - form */}
        <motion.div
          className="qp-right"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="qp-form-card">
            {!formSubmitted ? (
              <>
                <h2 className="qp-form-title">Get your free quote</h2>
                <p className="qp-form-sub">We'll get back to you within 24 hours.</p>
                <form onSubmit={handleSubmit} className="qp-form">
                  <div className="qp-row">
                    <div className="qp-field">
                      <input type="text"  name="name"  value={formData.name}  onChange={handleChange} required placeholder="Full name" />
                    </div>
                    <div className="qp-field">
                      <input type="tel"   name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone number" />
                    </div>
                  </div>
                  <div className="qp-row">
                    <div className="qp-field">
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email address" />
                    </div>
                    <div className="qp-field">
                      <input type="text"  name="town"  value={formData.town}  onChange={handleChange} required placeholder="Town / City" />
                    </div>
                  </div>
                  <div className="qp-field">
                    <select name="workRequired" value={formData.workRequired} onChange={handleChange} required className={formData.workRequired ? '' : 'ph'}>
                      <option value="" disabled>Work required - select your project</option>
                      <option>Full bathroom installation</option>
                      <option>Wet room / walk-in shower</option>
                      <option>En suite</option>
                      <option>Bathroom refurbishment</option>
                      <option>Tiling only</option>
                      <option>Plumbing only</option>
                      <option>Kitchen fitting</option>
                      <option>Carpentry / joinery</option>
                      <option>Plastering</option>
                      <option>General home improvement</option>
                      <option>Multiple / not sure yet</option>
                    </select>
                  </div>
                  <div className="qp-field">
                    <select name="budget" value={formData.budget} onChange={handleChange} required className={formData.budget ? '' : 'ph'}>
                      <option value="" disabled>Budget - what are you looking to spend?</option>
                      <option>Under £3,000</option>
                      <option>£3,000 – £5,000</option>
                      <option>£5,000 – £8,000</option>
                      <option>£8,000 – £12,000</option>
                      <option>£12,000 – £20,000</option>
                      <option>£20,000+</option>
                      <option>Not sure yet - happy to discuss</option>
                    </select>
                  </div>
                  <div className="qp-field">
                    <textarea name="message" value={formData.message} onChange={handleChange} rows="3" placeholder="Anything else? Room size, timescales, specific ideas…" />
                  </div>
                  <button type="submit" className="qp-submit" disabled={formLoading}>
                    {formLoading ? 'Sending…' : <><span>Get My Free Quote</span><ArrowRight size={18} /></>}
                  </button>
                  {formError && (
                    <p className="qp-error">Something went wrong - please call us directly.</p>
                  )}
                </form>
              </>
            ) : (
              <motion.div
                className="qp-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <CheckCircle2 size={52} className="qp-success-icon" />
                <h3>You're all set!</h3>
                <p>We've received your enquiry and will be in touch within 24 hours to talk through your project and arrange a free survey.</p>
                <button
                  className="qp-reset"
                  onClick={() => { setFormSubmitted(false); setFormData({ name: '', email: '', phone: '', town: '', workRequired: '', budget: '', message: '' }) }}
                >
                  Submit another enquiry
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="qp-footer">
        © 2026 Ready For Refurb - Fitted properly. Every time.
      </footer>
    </div>
  )
}
