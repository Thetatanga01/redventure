import React, { useState } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';

const VideoPlayer = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              zIndex: 1,
            }}
          >
            <CircularProgress sx={{ color: '#E60000' }} />
            <Typography variant="h6" sx={{ color: '#E60000' }}>
              Video yükleniyor, lütfen bekleyin...
            </Typography>
          </Box>
        )}
        <video
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          controls
          autoPlay
          onLoadedData={handleVideoLoad}
        >
          <source src="/asset/vodafone-wenovate-son.mp4" type="video/mp4" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      </Box>
    </Container>
  );
};

export default VideoPlayer; 