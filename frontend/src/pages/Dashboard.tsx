import React, { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { withSpan } from '../instrumentation/tracing'

const Dashboard: React.FC = () => {
  const { items: notes } = useSelector((state: RootState) => state.notes)
  const { items: notebooks } = useSelector((state: RootState) => state.notebooks)
  const [apiStatus, setApiStatus] = useState<string>('checking...')

  useEffect(() => {
    withSpan('dashboard.checkApiHealth', async () => {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
      const res = await fetch(`${base}/health`)
      const data = await res.json()
      setApiStatus(data.status)
      return data
    }).catch(() => setApiStatus('unavailable'))
  }, [])

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
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
              <Typography variant="body2" color="textSecondary">Backend API</Typography>
              <Chip
                label={apiStatus}
                color={apiStatus === 'UP' ? 'success' : apiStatus === 'checking...' ? 'default' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
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
