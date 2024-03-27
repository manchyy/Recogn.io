import styles from './App.module.css';
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Content from './Content'
import {Button} from '@suid/material'

function App() {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <Navbar/>
        <Content/>
      </header>
      <Sidebar/>
    </div>
  );
}

export default App;
