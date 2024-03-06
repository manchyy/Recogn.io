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
import HomeOutlinedIcon from '@suid/icons-material/HomeOutlined';
import AccountTreeOutlinedIcon from '@suid/icons-material/AccountTreeOutlined';
import GroupsOutlinedIcon from '@suid/icons-material/GroupsOutlined';
import StorageOutlinedIcon from '@suid/icons-material/StorageOutlined';
import DnsOutlinedIcon from '@suid/icons-material/DnsOutlined';
import HelpOutlineOutlinedIcon from '@suid/icons-material/HelpOutlineOutlined';
import LogoutOutlinedIcon from '@suid/icons-material/LogoutOutlined';

function Sidebar() {
    return (
      <div class={styles.sidebar}>

        <List>
            <ListItem disablePadding>
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
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                      <AccountTreeOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Projects" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
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
            <Divider sx={{backgroundColor:'white',
                          marginLeft:'1.5rem',
                          marginRight:'1.5rem',
                          marginTop:'1rem',
                          marginBottom:'1rem'}} />

            <ListItem disabled disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                      <StorageOutlinedIcon 
                        sx={{color:'white'}}
                      /> 
                    </ListItemIcon>
                    <ListItemText primary="Database" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding> 
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
            <Divider sx={{backgroundColor:'white',
                          marginLeft:'1.5rem',
                          marginRight:'1.5rem',
                          marginTop:'1rem',
                          marginBottom:'1rem'}} />

            <ListItem disablePadding>
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
            <ListItem disablePadding>
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
  