import styles from './App.module.css';
import { RiUserFacesAccountCircleLine } from 'solid-icons/ri'
import logo from './assets/logo.svg'
import { Avatar } from "@suid/material";

function Navbar() {
    return (
      <nav class={styles.navbar}>
        <div class={styles.navbarLeft}>
            <img src={logo} alt='Logo' class={styles.logo}></img>
        </div>
        <div class={styles.navbarRight}>
          <p></p>
          <Avatar 
            alt='manchyy'
            src='https://avatars.githubusercontent.com/u/37485545?v=4'
          />
          {/* <RiUserFacesAccountCircleLine class={styles.navLogo} /> */}
        </div>

      </nav>
    );
  }

export default Navbar;