import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import { motion } from 'framer-motion';
import { fadeInUp, fadeIn, staggerContainer, staggerItem } from '../theme/animations';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.heroBackground}></div>
      <div className="container">
        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem}>
            <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
              {siteConfig.title}
            </Heading>
          </motion.div>
          <motion.p
            className={clsx('hero__subtitle', styles.heroSubtitle)}
            variants={staggerItem}
          >
            {siteConfig.tagline}
          </motion.p>
          <motion.div className={styles.buttons} variants={staggerItem}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                className={clsx('button button--secondary button--lg', styles.primaryButton)}
                to="/docs/chapter1-introduction">
                Start Learning 🚀
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                className={clsx('button button--outline button--lg', styles.secondaryButton)}
                to="/chatbot">
                AI Assistant 🤖
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
