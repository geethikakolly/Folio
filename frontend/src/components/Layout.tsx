import React from 'react'
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const drawerWidth = 240

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Folio - Notes & Knowledge Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
          },
        }}
      >
        <List>
          <ListItem button>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Notebooks" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Search" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout
