import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, CheckCircle, Ticket, Calendar, MapPin, QrCode, Clipboard } from 'lucide-react';
import { Registration, Event } from '../types';

interface RegistrationQRCodeProps {
  registration: any;
  key?: any;
}

export default function RegistrationQRCode({ registration }: RegistrationQRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const event = registration.event;
  const ticketId = registration.id;
  
  // Create a structured data payload for onsite QR code scanned check-ins
  const qrData = JSON.stringify({
    ticketId: ticketId,
    eventId: registration.eventId,
    attendeeName: registration.attendeeName,
    attendeeEmail: registration.attendeeEmail,
    ticketType: registration.ticketType,
    status: registration.status,
    timestamp: registration.registeredAt,
    systemSignature: 'GATHER_WISE_VERIFIED_PASS'
  });

  useEffect(() => {
    // Generate high quality QR code data URL
    QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400,
      color: {
        dark: '#0f172a', // slate-900 / zinc-900 style
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate secure QR Code:', err);
      });
  }, [qrData]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    // Slug friendly name for filename
    const attendeeSlug = registration.attendeeName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const eventSlug = (event?.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    link.download = `pass_${eventSlug}_${attendeeSlug}_${ticketId.slice(0, 6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col w-full max-w-sm mx-auto"
      id={`qr-ticket-card-${ticketId}`}
    >
      {/* Ticket Ribbon & Banner Header */}
      <div className="relative p-5 pb-4 bg-zinc-950 text-white overflow-hidden flex flex-col justify-between h-36">
        {/* Background event banner with blur & dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.25] transition-transform duration-500 scale-105" 
          style={{ backgroundImage: `url(${event?.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'})` }} 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="relative z-10 flex justify-between items-start">
          <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-full leading-none shadow-md">
            <Ticket className="w-3 h-3" />
            {registration.ticketType} Pass
          </span>
          <span className="text-[9.5px] font-mono text-zinc-300 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md leading-none border border-zinc-750">
            #{ticketId.slice(-8).toUpperCase()}
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <h4 className="font-extrabold text-white text-xs md:text-sm leading-tight truncate">{event?.title || 'GatherWise Event Schedule'}</h4>
          <div className="flex flex-col gap-0.5 text-[10px] text-zinc-300">
            <span className="flex items-center gap-1 truncate">
              <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
              {event?.date || 'Upcoming Date'} at {event?.time || 'Time TBD'}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              {event?.location || 'Digital Lounge'}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket perforation divider cutouts */}
      <div className="relative h-4 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between select-none">
        <div className="absolute left-0 -ml-2.5 w-5 h-5 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800" />
        <div className="absolute right-0 -mr-2.5 w-5 h-5 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800" />
        <div className="w-full border-t border-dashed border-zinc-200 dark:border-zinc-800 mx-5" />
      </div>

      {/* Unique Onsite QR Code Container */}
      <div className="px-6 py-5 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-white dark:bg-white rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-100 max-w-[170px] max-h-[170px] flex items-center justify-center relative overflow-hidden">
          {qrUrl ? (
            <img 
              src={qrUrl} 
              alt="Unique Event QR Verification Code" 
              className="w-40 h-40 object-contain select-none shadow-inner" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-zinc-300">
              <QrCode className="w-10 h-10 animate-pulse" />
            </div>
          )}
        </div>

        <div className="text-center space-y-1 max-w-[280px]">
          <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest block leading-none">Registered Attendee</span>
          <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate leading-tight">{registration.attendeeName}</h5>
          <p className="text-[10.5px] text-zinc-500 font-medium truncate">{registration.attendeeEmail}</p>
        </div>
      </div>

      {/* Footer Utility Actions */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 mt-auto">
        <button
          onClick={handleCopyId}
          className="flex-1 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-805 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          title="Copy unique ticket hash ID"
          id={`copy-ticket-id-btn-${ticketId}`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Copied ID</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Copy ID</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          disabled={!qrUrl}
          className="flex-1 py-12 px-3 py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download PNG QR pass image"
          id={`download-qr-btn-${ticketId}`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Download Pass</span>
        </button>
      </div>
    </div>
  );
}
