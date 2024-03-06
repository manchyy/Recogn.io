import styles from './App.module.css';
import { 
  Divider,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@suid/material'
import useTheme from "@suid/material/styles/useTheme";

import HomeOutlinedIcon from '@suid/icons-material/HomeOutlined';
import AccountTreeOutlinedIcon from '@suid/icons-material/AccountTreeOutlined';
import GroupsOutlinedIcon from '@suid/icons-material/GroupsOutlined';
import StorageOutlinedIcon from '@suid/icons-material/StorageOutlined';
import DnsOutlinedIcon from '@suid/icons-material/DnsOutlined';
import HelpOutlineOutlinedIcon from '@suid/icons-material/HelpOutlineOutlined';
import LogoutOutlinedIcon from '@suid/icons-material/LogoutOutlined';

function Sidebar() {
    const theme = useTheme();
    return (
      <div class={styles.sidebar}>
        

        <List>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                        <HomeOutlinedIcon 
                          sx={{
                            color:"white"
                          }}
                        />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </ListItem>
            <Divider light/>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                      <AccountTreeOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Projects" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                      <GroupsOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Team" />
                </ListItemButton>
            </ListItem>

            {/*  */}
            <hr></hr>

            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                      <StorageOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Database" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                      <DnsOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Backend" />
                </ListItemButton>
            </ListItem>

            {/*  */}
            <hr></hr>
            <Divider />
            
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                        <HelpOutlineOutlinedIcon 
                          sx={{
                            color:"white"
                          }}
                        />
                    </ListItemIcon>
                    <ListItemText primary="Information" />
                </ListItemButton>
            </ListItem>
            <ListItem>
                <ListItemButton>
                    <ListItemIcon>
                      <LogoutOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Log Out" />
                </ListItemButton>
              </ListItem>

        </List>
      </div>
    );
  }
  
  export default Sidebar;
  