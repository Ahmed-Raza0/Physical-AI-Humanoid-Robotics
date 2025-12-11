import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './blog.module.css';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Rise of Humanoid Robots in 2025',
    excerpt: 'Explore how humanoid robots are transforming industries from manufacturing to healthcare, and what this means for the future of work and society.',
    date: 'December 10, 2025',
    author: 'Dr. Sarah Chen',
    category: 'Industry Trends',
    readTime: '5 min read',
    image: '🤖',
  },
  {
    id: 2,
    title: 'ROS 2 vs ROS 1: A Complete Migration Guide',
    excerpt: 'Learn the key differences between ROS 1 and ROS 2, and discover why upgrading to ROS 2 is essential for modern robotics development.',
    date: 'December 8, 2025',
    author: 'Michael Rodriguez',
    category: 'Technical',
    readTime: '8 min read',
    image: '⚙️',
  },
  {
    id: 3,
    title: 'Building Your First AI Robot: A Beginner\'s Journey',
    excerpt: 'Follow along as we build a simple AI-powered robot from scratch, covering hardware selection, software setup, and basic programming.',
    date: 'December 5, 2025',
    author: 'Emma Thompson',
    category: 'Tutorial',
    readTime: '12 min read',
    image: '🔧',
  },
  {
    id: 4,
    title: 'Digital Twins in Robotics: Testing Without Risk',
    excerpt: 'Discover how digital twin technology allows you to simulate and test robot behaviors before deploying them in the real world.',
    date: 'December 1, 2025',
    author: 'Dr. James Park',
    category: 'Simulation',
    readTime: '6 min read',
    image: '🔮',
  },
  {
    id: 5,
    title: 'Vision-Language Models Meet Robotics',
    excerpt: 'Explore the cutting-edge intersection of large language models and computer vision in creating more intelligent and adaptable robots.',
    date: 'November 28, 2025',
    author: 'Dr. Sarah Chen',
    category: 'AI Research',
    readTime: '10 min read',
    image: '🧠',
  },
  {
    id: 6,
    title: 'Safety First: Ethical Considerations in Physical AI',
    excerpt: 'Examine the ethical challenges and safety considerations that come with deploying autonomous robots in public spaces.',
    date: 'November 25, 2025',
    author: 'Prof. David Williams',
    category: 'Ethics',
    readTime: '7 min read',
    image: '🛡️',
  },
];

const categories = ['All', 'Industry Trends', 'Technical', 'Tutorial', 'Simulation', 'AI Research', 'Ethics'];

export default function Blog(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout
      title="Blog"
      description="Latest articles, tutorials, and insights on Physical AI and Humanoid Robotics">
      <div className={styles.blogContainer}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Physical AI Blog</h1>
            <p className={styles.heroSubtitle}>
              Insights, tutorials, and the latest developments in robotics and AI
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>

          <div className={styles.categoryFilter}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  selectedCategory === category ? styles.categoryButtonActive : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className={styles.postsContainer}>
          {filteredPosts.length === 0 ? (
            <div className={styles.noResults}>
              <p>No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className={styles.postsGrid}>
              {filteredPosts.map(post => (
                <article key={post.id} className={styles.blogCard}>
                  <div className={styles.cardImage}>
                    <span className={styles.imageEmoji}>{post.image}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.category}>{post.category}</span>
                      <span className={styles.readTime}>{post.readTime}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <div className={styles.cardFooter}>
                      <div className={styles.authorInfo}>
                        <span className={styles.author}>{post.author}</span>
                        <span className={styles.date}>{post.date}</span>
                      </div>
                      <Link to="#" className={styles.readMore}>
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterContent}>
            <h2>Stay Updated</h2>
            <p>Get the latest articles and insights delivered to your inbox</p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
