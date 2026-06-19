import React from 'react';
import { Chip, Stack, Tooltip } from '@mui/material';
import { EmojiEvents, Star, School, RateReview, Explore } from '@mui/icons-material';

interface BadgesDisplayProps {
  badges: string[];
}

const badgeConfig: Record<string, { icon: React.ReactElement; color: 'primary' | 'secondary' | 'warning' | 'info' | 'success' }> = {
  'Early Bird': { icon: <EmojiEvents fontSize="small" />, color: 'warning' },
  'Active Attendee': { icon: <Star fontSize="small" />, color: 'primary' },
  'Top Organizer': { icon: <School fontSize="small" />, color: 'secondary' },
  'Review Expert': { icon: <RateReview fontSize="small" />, color: 'info' },
  'Event Explorer': { icon: <Explore fontSize="small" />, color: 'success' },
};

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {badges.map((badge) => {
        const config = badgeConfig[badge] || { icon: <Star fontSize="small" />, color: 'primary' as const };
        return (
          <Tooltip key={badge} title={badge} arrow>
            <Chip
              icon={config.icon}
              label={badge}
              color={config.color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: '8px', px: 0.5 }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
};

export default BadgesDisplay;
