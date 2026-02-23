import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Mail, 
  MapPin,
  CheckCircle2
} from 'lucide-react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const services = [
    {
      number: "01",
      title: "AI Strategy",
      description: "Strategic consulting to integrate AI solutions that align with your business objectives and drive measurable outcomes."
    },
    {
      number: "02",
      title: "Product Development",
      description: "End-to-end development of AI products and solutions, from initial concept through deployment and beyond."
    },
    {
      number: "03",
      title: "Process Optimization",
      description: "Intelligent automation and optimization strategies that reduce operational costs while increasing efficiency."
    }
  ]

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo">Art AI</div>
          <a href="#contact" className="nav-cta">Let's Talk</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <motion.div 
            className="shape shape-1"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="shape shape-2"
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="shape shape-3"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="hero-title">
              We build AI products<br />
              that work
            </h1>
          </motion.div>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Keeping costs low. Margins high. Results exceptional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a href="#contact" className="hero-cta">
              Start a Project <ArrowRight size={18} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="services-bg-pattern"></div>
        <div className="services-container">
          <motion.div
            className="services-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="services-title">What we do</h2>
          </motion.div>

          <div className="services-list">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="service-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="service-number">{service.number}</div>
                <div className="service-content">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
                <div className="service-icon-bg">
                  <motion.div
                    className="service-icon-shape"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <motion.div
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="stat-value">Dubai</div>
            <div className="stat-label">Based in the UAE</div>
          </motion.div>

          <motion.div
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="stat-value">Global</div>
            <div className="stat-label">Working worldwide</div>
          </motion.div>

          <motion.div
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="stat-value">2026</div>
            <div className="stat-label">Building the future</div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="contact-container">
          <motion.div
            className="contact-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="contact-title">Let's build something</h2>
            <p className="contact-subtitle">
              Ready to transform your business with AI?
            </p>
          </motion.div>

          <div className="contact-content">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="contact-item">
                <Mail size={20} />
                <a href="mailto:hello@artai.com">hello@artai.com</a>
              </div>

              <div className="contact-item">
                <MapPin size={20} />
                <span>Dubai, UAE</span>
              </div>
            </motion.div>

            <motion.div
              className="contact-form-container"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {!formSubmitted ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Name"
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company"
                    />
                  </div>

                  <div className="form-group">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us about your project"
                    ></textarea>
                  </div>

                  <button type="submit" className="form-submit">
                    Send Message <ArrowRight size={18} />
                  </button>
                </form>
              ) : (
                <motion.div
                  className="form-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <CheckCircle2 size={48} />
                  <h3>Message received</h3>
                  <p>We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false)
                      setFormData({ name: '', email: '', company: '', message: '' })
                    }}
                    className="form-reset"
                  >
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
          <p className="footer-text">© 2026 — Building the future with AI</p>
        </div>
      </footer>
    </div>
  )
}

export default App
