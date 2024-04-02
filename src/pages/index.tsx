import { useEffect } from 'react';


export default function Home(): JSX.Element {
  useEffect(() => {
    window.location.href = '/blog';
  }, []);
  return (
    null
  );
}

/*
 import Link from '@docusaurus/Link';
 import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
 import Layout from '@theme/Layout';
 import HomepageFeatures from '@site/src/components/HomepageFeatures';
 import Heading from '@theme/Heading';
 function HomepageHeader() {
   const {siteConfig} = useDocusaurusContext();
   return (
     <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
         <Heading as="h1" className="hero__title">
           {siteConfig.title}
         </Heading>
         <p className="hero__subtitle">{siteConfig.tagline}</p>
         <div className={styles.buttons}>
           <Link
             className="button button--secondary button--lg"
             to="/docs/intro">
             Docusaurus Tutorial - 5min ⏱️
           </Link>
         </div>
       </div>
     </header>
   );
 }
~                                       │   30
~                                       │   31 export default function Home(): JSX.Element {
~                                       │   32   const {siteConfig} = useDocusaurusContext();
~                                       │   33   return (
~                                       │   34     <Layout
~                                       │   35       title={`Hello from ${siteConfig.title}`}
~                                       │   36       description="Description will go into a meta tag in <head />">
~                                       │   37       <HomepageHeader />
~                                       │   38       <main>
~                                       │   39         <HomepageFeatures />
~                                       │   40       </main>
~                                       │   41     </Layout>
~                                       │   42   );
~                                       │   43 }
 */
