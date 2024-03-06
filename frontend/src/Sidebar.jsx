import styles from './App.module.css';
import { VsHome } from 'solid-icons/vs'
import { FaSolidDiagramProject } from 'solid-icons/fa'
import { AiOutlineTeam, AiOutlineInfoCircle } from 'solid-icons/ai'
import { FiLogOut, FiDatabase, FiServer } from 'solid-icons/fi'
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@suid/material'
import DraftsIcon from "@suid/icons-material/Drafts";
import useTheme from "@suid/material/styles/useTheme";


function Sidebar() {
    const theme = useTheme();
    return (
      <div class={styles.sidebar}>
        <br/>
        <ul>
          <li><VsHome/> Home</li>
          <li><FaSolidDiagramProject /> Projects</li>
          <li><AiOutlineTeam /> Team</li>
        </ul>

        <br/>
        <hr></hr>
        <br/>

        <ul>
          <li><FiDatabase /> Database 🟢</li>
          <li><FiServer /> Backend 🟢</li>
        </ul>
        
        <br/>
        <hr></hr>
        <br/>

        <ul>
          <li><AiOutlineInfoCircle /> Information</li>
          <li><FiLogOut /> Log out</li>
        </ul>
        <List>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                        <DraftsIcon color='primary'/>
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                        
                    </ListItemIcon>
                    <ListItemText primary="Projects" />
                </ListItemButton>
            </ListItem>
        </List>
      </div>
    );
  }
  
  export default Sidebar;
  