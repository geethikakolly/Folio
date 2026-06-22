import React from 'react'
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

const Dashboard: React.FC = () => {
  const { items: notes } = useSelector((state: RootState) => state.notes)
  const { items: notebooks } = useSelector((state: RootState) => state.notebooks)

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome to Folio - Your Notes & Knowledge Management Platform
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Notes
              </Typography>
              <Typography variant="h5">
                {notes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Notebooks
              </Typography>
              <Typography variant="h5">
                {notebooks.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pinned Notes
              </Typography>
              <Typography variant="h5">
                {notes.filter(n => n.isPinned).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Archived Notes
              </Typography>
              <Typography variant="h5">
                {notes.filter(n => n.isArchived).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
