import React from 'react';
import { Box, Container } from '@mui/material';

const Presentation = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, height: 'calc(100vh - 64px)' }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        <iframe
          src="/asset/redventure.pptx.pdf"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="RedVenture Sunumu"
        />
      </Box>
    </Container>
  );
};

export default Presentation; 