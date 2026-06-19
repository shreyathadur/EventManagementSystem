import React, { useState } from 'react';
import { Box, Button, TextField, Rating, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import { Star, RateReview } from '@mui/icons-material';
import axios from 'axios';

interface ReviewFormProps {
  eventId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ eventId, onReviewSubmitted }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating || rating < 1) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reviews', { eventId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpen(false);
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button startIcon={<RateReview />} variant="outlined" onClick={() => setOpen(true)} sx={{ borderRadius: 2 }}>
        Write a Review
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Write Your Review</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <Box>
              <Typography gutterBottom fontWeight={500}>Your Rating</Typography>
              <Rating
                value={rating}
                onChange={(_, v) => setRating(v)}
                size="large"
                icon={<Star fontSize="inherit" sx={{ color: '#F59E0B' }} />}
                emptyIcon={<Star fontSize="inherit" />}
              />
            </Box>
            <TextField
              label="Your Review"
              multiline
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience at this event..."
              fullWidth
            />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewForm;
