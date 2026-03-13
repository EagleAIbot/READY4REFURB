import { posts } from './blogPosts'
import './BlogPage.css'

const BASE = import.meta.env.BASE_URL

export default function BlogPage() {
  return (
    <div className="blog-page">
      {/* Nav */}
      <nav className="blog-nav">
        <a href={BASE} className="blog-nav-logo">
          <img src={`${BASE}images/r4r-logo.png`} alt="R4R" />
          <span>Ready For Refurb</span>
        </a>
        <a href={`${BASE}#contact`} className="blog-nav-cta">Get a Quote</a>
      </nav>

      <div className="blog-container">
        <header className="blog-header">
          <p className="blog-label">From the team</p>
          <h1 className="blog-title">Bathroom & renovation advice</h1>
          <p className="blog-subtitle">Practical guides on costs, materials and choosing the right tradespeople — written by the people who do the work.</p>
        </header>

        <div className="blog-grid">
          {posts.map(post => (
            <a key={post.slug} href={`${BASE}blog/${post.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <span className="blog-card-category">{post.category}</span>
                <span className="blog-card-read">{post.readTime}</span>
              </div>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <span className="blog-card-link">Read article →</span>
            </a>
          ))}
        </div>

        <footer className="blog-footer">
          <a href={BASE} className="blog-back">← Back to main site</a>
        </footer>
      </div>
    </div>
  )
}
