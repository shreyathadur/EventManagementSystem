import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactElement;
  trend?: number;
  color: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  return (
    <Card sx={{
      borderRadius: 3,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${color}25` }
    }}>
      <Box sx={{
        position: 'absolute', top: -15, right: -15, width: 80, height: 80,
        borderRadius: '50%', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Box sx={{ color, mr: 1, mb: 1 }}>{icon}</Box>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color }}>
          {value}
        </Typography>
        {(subtitle || trend !== undefined) && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
            {trend !== undefined && (
              <>
                {trend >= 0 ? (
                  <TrendingUp fontSize="small" sx={{ color: '#10B981' }} />
                ) : (
                  <TrendingDown fontSize="small" sx={{ color: '#EF4444' }} />
                )}
                <Typography variant="caption" sx={{ color: trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </Typography>
              </>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
