import React from 'react';
import { IconButton, Tooltip, Stack } from '@mui/material';
import { Facebook, Twitter, WhatsApp, LinkedIn, ContentCopy } from '@mui/icons-material';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { icon: <Facebook />, label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: '#1877F2' },
    { icon: <Twitter />, label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, color: '#1DA1F2' },
    { icon: <WhatsApp />, label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: '#25D366' },
    { icon: <LinkedIn />, label: 'LinkedIn', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`, color: '#0A66C2' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <Stack direction="row" spacing={0.5}>
      {shareLinks.map(link => (
        <Tooltip key={link.label} title={`Share on ${link.label}`} arrow>
          <IconButton
            size="small"
            href={link.href}
            target="_blank"
            sx={{ color: link.color, '&:hover': { bgcolor: `${link.color}15` } }}
          >
            {link.icon}
          </IconButton>
        </Tooltip>
      ))}
      <Tooltip title="Copy Link" arrow>
        <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary' }}>
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default ShareButtons;
