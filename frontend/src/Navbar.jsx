import styles from './App.module.css';
import { RiUserFacesAccountCircleLine } from 'solid-icons/ri'
import logo from './assets/logo.svg'

function Navbar() {
    return (
      <nav class={styles.navbar}>
        <div class={styles.navbarLeft}>
            <img src={logo} alt='Logo' class={styles.logo}></img>
        </div>
        <div class={styles.navbarRight}>
          <RiUserFacesAccountCircleLine class={styles.navLogo} />
        </div>

      </nav>
    );
  }

export default Navbar;