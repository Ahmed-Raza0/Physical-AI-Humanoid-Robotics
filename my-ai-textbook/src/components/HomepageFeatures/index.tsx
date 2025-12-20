import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, cardVariants } from '../../styles/animations';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Comprehensive Learning Path',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Master Physical AI and Humanoid Robotics from fundamentals to advanced topics.
        Our structured curriculum covers perception, planning, control, and real-world applications.
      </>
    ),
  },
  {
    title: 'Hands-On Approach',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Learn by doing with practical code examples, simulations, and real robot integration.
        Build actual AI-powered robotic systems from day one with ROS 2 and modern frameworks.
      </>
    ),
  },
  {
    title: 'AI-Powered Assistant',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Get instant help from our AI chatbot trained on robotics knowledge.
        Ask questions, clarify concepts, and receive personalized guidance on your learning journey.
      </>
    ),
  },
];

function Feature({title, Svg, description, delay}: FeatureItem & {delay: number}) {
  const customCardVariants = {
    ...cardVariants,
    visible: {
      ...cardVariants.visible,
      transition: {
        ...cardVariants.visible.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      className={clsx('col col--4')}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: '-50px' }}
      variants={customCardVariants}
    >
      <div className={styles.featureCard}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <h2 className={styles.sectionTitle}>Why Choose Our Platform?</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to master Physical AI and Humanoid Robotics
          </p>
        </motion.div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} delay={idx * 0.2} />
          ))}
        </div>
      </div>
    </section>
  );
}
