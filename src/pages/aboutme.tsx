import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import styles from './aboutme.module.css';

export default function AboutMe(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <div>
        <div className={styles.container}>
          <div>
            <img className={styles.profileImage} src="https://github.com/ryukato.png" />
          </div>
          <div>
            <h1>
              <span>Yoonyoul Yoo</span>
            </h1>
          </div>
          <div className={styles.profileCard}>
            <ul>
              <li>
                <FontAwesomeIcon icon={faEnvelope} />
                <a href="mailto:ryukato79@gmail.com">ryukato79@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

