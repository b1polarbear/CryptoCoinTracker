"use client"; // Add this line at the top

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';

// Custom MUI theme with Iter Google Font
const theme = createTheme({
  typography: {
    fontFamily: '"Iter", sans-serif',
  },
  palette: {
    background: {
      default: '#E0F7FA',
    },
  },
});

// Styled container for the gradient background
const GradientBackground = styled(Container)({
  background: 'linear-gradient(180deg, #B2EBF2 0%, #E0F7FA 100%)',
  minHeight: '100vh',
  paddingTop: '20px',
});

interface CryptoData {
  id: string;
  rank: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
}

const CryptoTracker: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetching data from CoinCap API
  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://api.coincap.io/v2/assets');
      const sortedData = response.data.data
        .filter((crypto: CryptoData) => ['bitcoin', 'ethereum', 'tether'].includes(crypto.id))
        .sort((a: CryptoData, b: CryptoData) => parseInt(a.rank) - parseInt(b.rank));
      setCryptoData(sortedData);
    } catch (error) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 30000); // 30 seconds refresh interval
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GradientBackground maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom>
          CoinTracker
        </Typography>
        {loading ? (
          <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '60vh' }}>
            <CircularProgress />
          </Grid>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {cryptoData.map((crypto) => (
              <Grid item xs={12} sm={6} md={4} key={crypto.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {crypto.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rank: {crypto.rank}
                    </Typography>
                    <Typography variant="h6">
                      ${parseFloat(crypto.priceUsd).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={parseFloat(crypto.changePercent24Hr) < 0 ? 'error' : 'primary'}
                    >
                      {parseFloat(crypto.changePercent24Hr).toFixed(2)}% (24h)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </GradientBackground>
    </ThemeProvider>
  );
};

export default CryptoTracker;
