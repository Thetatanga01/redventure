import React from 'react';
import { Container, Box, ImageList, ImageListItem } from '@mui/material';

const Wireframe = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <ImageList sx={{ width: '100%', height: 'auto' }} cols={2} rowHeight="auto" gap={4}>
        <ImageListItem>
          <img
            src="/asset/1.png"
            alt="Wireframe 1"
            loading="lazy"
            style={{ width: '100%', height: 'auto' }}
          />
        </ImageListItem>
        <ImageListItem>
          <img
            src="/asset/2.png"
            alt="Wireframe 2"
            loading="lazy"
            style={{ width: '100%', height: 'auto' }}
          />
        </ImageListItem>
      </ImageList>
    </Container>
  );
};

export default Wireframe; 