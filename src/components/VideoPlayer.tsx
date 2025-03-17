import React from 'react';
import { Box, Container } from '@mui/material';

const VideoPlayer = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
        }}
      >
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
        >
          <source src="/asset/vodafone-wenovate-son.mp4" type="video/mp4" />
          Tarayıcınız video oynatmayı desteklemiyor.
        </video>
      </Box>
    </Container>
  );
};

export default VideoPlayer; 