import React from 'react';
import { Box, Rating, Typography, Card, CardContent, Avatar, Chip, Stack } from '@mui/material';
import { Star, Verified } from '@mui/icons-material';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    isVerified: boolean;
    user: { name: string; email: string };
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card sx={{ mb: 2, borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {review.user.name.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography fontWeight={600}>{review.user.name}</Typography>
              {review.isVerified && (
                <Chip icon={<Verified fontSize="small" />} label="Verified Attendee" size="small" color="success" variant="outlined" />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Rating value={review.rating} readOnly size="small" icon={<Star fontSize="inherit" />} />
        </Stack>
        {review.comment && (
          <Typography variant="body2" color="text.secondary" mt={1} sx={{ lineHeight: 1.7 }}>
            {review.comment}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
