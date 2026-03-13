import { getPost } from './blogPosts'
import './BlogPage.css'

const BASE = import.meta.env.BASE_URL

function renderContent(markdown) {
  // Convert markdown to HTML — simple parser for our known content patterns
  return markdown
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Inline link
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // HR
    .replace(/^---$/gm, '<hr />')
    // Bullet list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    // Paragraphs — blank line separated blocks
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (/^<(h[123]|ul|hr|li)/.test(block)) return block
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')
}

export default function BlogPost({ slug }) {
  const post = getPost(slug)

  if (!post) {
    return (
      <div className="blog-page">
        <nav className="blog-nav">
          <a href={BASE} className="blog-nav-logo">
            <img src={`${BASE}images/r4r-logo.png`} alt="R4R" />
            <span>Ready For Refurb</span>
          </a>
        </nav>
        <div className="blog-container" style={{ textAlign: 'center', paddingTop: '8rem' }}>
          <h1>Post not found</h1>
          <a href={`${BASE}blog`} style={{ color: '#3FB8E0' }}>← Back to blog</a>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-page">
      {/* SEO meta — update head dynamically */}
      {(() => {
        document.title = post.metaTitle
        const desc = document.querySelector('meta[name="description"]')
        if (desc) desc.setAttribute('content', post.metaDescription)
        return null
      })()}

      <nav className="blog-nav">
        <a href={BASE} className="blog-nav-logo">
          <img src={`${BASE}images/r4r-logo.png`} alt="R4R" />
          <span>Ready For Refurb</span>
        </a>
        <a href={`${BASE}#contact`} className="blog-nav-cta">Get a Quote</a>
      </nav>

      <article className="blog-article">
        <div className="blog-article-header">
          <a href={`${BASE}blog`} className="blog-back-link">← All articles</a>
          <div className="blog-article-meta">
            <span className="blog-card-category">{post.category}</span>
            <span className="blog-card-read">{post.readTime}</span>
          </div>
          <h1 className="blog-article-title">{post.title}</h1>
          <p className="blog-article-excerpt">{post.excerpt}</p>
        </div>

        <div
          className="blog-article-body"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* CTA */}
        <div className="blog-article-cta">
          <h3>Ready to get started?</h3>
          <p>We cover Towcester, Northampton, Milton Keynes and surrounding areas. Free surveys, fixed-price quotes.</p>
          <a href={`${BASE}quote`} className="blog-cta-btn">Get a free quote →</a>
        </div>
      </article>
    </div>
  )
}
