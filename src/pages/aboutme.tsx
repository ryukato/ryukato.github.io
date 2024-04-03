import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin, faStackOverflow } from '@fortawesome/free-brands-svg-icons';
import styles from './aboutme.module.css';

export default function AboutMe(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`About Ryukato`}>
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
              <li>
                <FontAwesomeIcon icon={faGithub} />
                <a href="mailto:ryukato79@gmail.com">ryukato</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faLinkedin} />
                <a href="https://www.linkedin.com/in/yoonyoul-yoo-0a9b9649/">Yoonyoul Yoo</a>
              </li>
              <li>
                <FontAwesomeIcon icon={faStackOverflow} />
                <a href="https://stackoverflow.com/users/4763681/yoonyoul-yoo?tab=profile">StackOverFlow</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

