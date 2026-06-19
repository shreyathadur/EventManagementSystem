import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'detail';
  count?: number;
}

const CardSkeleton = () => (
  <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={180} animation="wave" />
    <CardContent>
      <Skeleton width="60%" height={28} animation="wave" />
      <Skeleton width="40%" height={20} animation="wave" sx={{ mt: 1 }} />
      <Skeleton width="80%" height={20} animation="wave" sx={{ mt: 1 }} />
      <Stack direction="row" spacing={1} mt={2}>
        <Skeleton variant="rounded" width={60} height={24} animation="wave" />
        <Skeleton variant="rounded" width={80} height={24} animation="wave" />
      </Stack>
    </CardContent>
  </Card>
);

const ListSkeleton = () => (
  <Box sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Skeleton variant="circular" width={48} height={48} animation="wave" />
      <Box flex={1}>
        <Skeleton width="50%" height={24} animation="wave" />
        <Skeleton width="30%" height={18} animation="wave" sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton variant="rounded" width={80} height={32} animation="wave" />
    </Stack>
  </Box>
);

const DetailSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={300} animation="wave" sx={{ borderRadius: 3 }} />
    <Skeleton width="70%" height={40} animation="wave" sx={{ mt: 3 }} />
    <Skeleton width="40%" height={24} animation="wave" sx={{ mt: 1 }} />
    <Skeleton width="100%" height={100} animation="wave" sx={{ mt: 2 }} />
  </Box>
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card', count = 3 }) => {
  const SkeletonComponent = variant === 'card' ? CardSkeleton : variant === 'list' ? ListSkeleton : DetailSkeleton;
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => <SkeletonComponent key={i} />)}
    </Stack>
  );
};

export default LoadingSkeleton;
