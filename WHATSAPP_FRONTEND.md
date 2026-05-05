# WhatsApp Integration - Frontend Guide

## Overview
Add WhatsApp booking buttons and links to your Next.js frontend to enable customers to browse and book packages via WhatsApp.

## Frontend Components

### 1. WhatsApp "Browse Packages" Button

```typescript
// components/WhatsAppBrowseButton.tsx
import { MessageCircle } from 'lucide-react';

interface WhatsAppBrowseButtonProps {
  phoneNumber: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export function WhatsAppBrowseButton({ 
  phoneNumber = '+9471234567', 
  className = '',
  variant = 'default'
}: WhatsAppBrowseButtonProps) {
  
  const sendPackageList = async () => {
    try {
      const response = await fetch(
        `/api/whatsapp/packages?phone=${encodeURIComponent(phoneNumber)}`
      );
      
      if (response.ok) {
        // Open WhatsApp in new tab
        const waUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}`;
        window.open(waUrl, '_blank');
        
        // Show success message
        console.log('Package list sent to WhatsApp!');
      }
    } catch (error) {
      console.error('Failed to send packages:', error);
    }
  };

  const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all';
  const variantClasses = variant === 'default'
    ? 'bg-green-500 text-white hover:bg-green-600'
    : 'border-2 border-green-500 text-green-600 hover:bg-green-50';

  return (
    <button
      onClick={sendPackageList}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <MessageCircle size={20} />
      <span>Browse on WhatsApp</span>
    </button>
  );
}
```

### 2. WhatsApp Direct Message Link

```typescript
// components/WhatsAppLink.tsx
import Link from 'next/link';

interface WhatsAppLinkProps {
  message?: string;
  phoneNumber?: string;
  children: React.ReactNode;
  className?: string;
  newTab?: boolean;
}

export function WhatsAppLink({ 
  message = 'Hi, I want to book a package',
  phoneNumber = '9471234567',
  children,
  className = '',
  newTab = true
}: WhatsAppLinkProps) {
  
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  return (
    <a
      href={waUrl}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
```

### 3. WhatsApp Booking Card

```typescript
// components/PackageWithWhatsApp.tsx
import Image from 'next/image';
import { Star, Users, Calendar, MessageCircle } from 'lucide-react';
import { WhatsAppLink } from './WhatsAppLink';

interface PackageCardProps {
  id: number;
  title: string;
  price: number;
  duration: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  businessPhone?: string;
}

export function PackageWithWhatsApp({ 
  id,
  title,
  price,
  duration,
  rating,
  reviewCount,
  imageUrl,
  businessPhone = '9471234567'
}: PackageCardProps) {
  
  const bookingMessage = `Hi! I'm interested in booking the "${title}" package. Can you send me more details? Reference: TOUR-${id}`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        
        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Calendar size={16} />
          <span>{duration}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-green-600">
            LKR {price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">per person</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Website Booking */}
          <button className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            Book Now
          </button>

          {/* WhatsApp Booking */}
          <WhatsAppLink
            message={bookingMessage}
            phoneNumber={businessPhone}
            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </div>
  );
}
```

### 4. WhatsApp Booking Widget

```typescript
// components/WhatsAppBookingWidget.tsx
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppBookingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-all z-40"
        aria-label="Open WhatsApp booking"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl p-4 z-40">
          <h3 className="font-bold text-lg mb-3">📱 Book via WhatsApp</h3>
          
          <p className="text-gray-600 mb-4 text-sm">
            Chat with us on WhatsApp to browse packages and make instant bookings.
          </p>

          <a
            href="https://wa.me/9471234567?text=Hi!%20I%20want%20to%20see%20your%20tour%20packages"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-500 text-white py-3 rounded-lg text-center font-medium hover:bg-green-600 mb-2"
          >
            Start WhatsApp Chat
          </a>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-gray-600 py-2 text-sm hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
```

### 5. WhatsApp Booking Steps Page

```typescript
// pages/whatsapp-booking.tsx
export default function WhatsAppBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Book via WhatsApp</h1>
        <p className="text-center text-gray-600 mb-12">
          Easy, fast, and instant booking right in your messaging app
        </p>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {[
            {
              number: 1,
              title: 'Open WhatsApp',
              description: 'Start a conversation with Kumaru Lanka'
            },
            {
              number: 2,
              title: 'Browse Packages',
              description: 'Send "packages" to see available tour options'
            },
            {
              number: 3,
              title: 'Make Your Booking',
              description: 'Reply with package details and travel dates'
            },
            {
              number: 4,
              title: 'Get Confirmation',
              description: 'Receive instant booking confirmation with reference'
            }
          ].map((step) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500 text-white font-bold">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="https://wa.me/9471234567?text=Hi!%20I%20want%20to%20see%20your%20tour%20packages"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-green-500 text-white py-4 rounded-lg text-center font-bold text-lg hover:bg-green-600 transition-all"
        >
          📱 Start Booking on WhatsApp
        </a>
      </div>
    </div>
  );
}
```

## Integration Examples

### In Packages Listing Page

```typescript
// pages/packages.tsx
import { PackageWithWhatsApp } from '@/components/PackageWithWhatsApp';
import { WhatsAppBrowseButton } from '@/components/WhatsAppBrowseButton';

export default function PackagesPage() {
  const packages = [/* ... */];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with WhatsApp CTA */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Our Packages</h1>
          <WhatsAppBrowseButton 
            phoneNumber="+9471234567"
            variant="default"
          />
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageWithWhatsApp key={pkg.id} {...pkg} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### In Booking Confirmation Page

```typescript
// pages/booking-confirmation.tsx
import { WhatsAppLink } from '@/components/WhatsAppLink';

export default function BookingConfirmation({ booking }) {
  const confirmationMessage = `I have a booking confirmation: ${booking.bookingRef}. Can you provide more details?`;

  return (
    <div className="bg-green-50 rounded-lg p-6 mt-6">
      <h3 className="font-bold text-lg mb-3">✅ Booking Confirmed!</h3>
      <p className="text-gray-700 mb-4">
        Your booking reference is: <span className="font-mono font-bold">{booking.bookingRef}</span>
      </p>
      <p className="text-gray-600 mb-4">
        We've sent a confirmation email and WhatsApp message to {booking.email} and {booking.phone}.
      </p>

      {/* WhatsApp Follow-up */}
      <WhatsAppLink
        message={confirmationMessage}
        phoneNumber="9471234567"
        className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Chat on WhatsApp
      </WhatsAppLink>
    </div>
  );
}
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_WHATSAPP_PHONE=9471234567
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```typescript
// config/whatsapp.ts
export const WHATSAPP_CONFIG = {
  phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '9471234567',
  businessName: 'Kumaru Lanka',
  welcomeMessage: 'Hi! I want to browse your tour packages'
};
```

## Analytics Integration

```typescript
// lib/analytics.ts
export function trackWhatsAppClick(source: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      'event_category': 'booking',
      'event_label': source, // 'hero', 'package_card', 'widget', etc
      'value': 1
    });
  }
}

// In components
onClick={() => {
  trackWhatsAppClick('package_card');
  // ... open WhatsApp
}}
```

## Styling (Tailwind)

```css
/* Global WhatsApp theme */
@layer components {
  .btn-whatsapp {
    @apply bg-green-500 text-white px-4 py-2 rounded-lg font-medium 
           hover:bg-green-600 transition-all flex items-center gap-2;
  }

  .btn-whatsapp-outline {
    @apply border-2 border-green-500 text-green-600 px-4 py-2 rounded-lg 
           font-medium hover:bg-green-50 transition-all;
  }

  .whatsapp-icon {
    @apply text-green-500;
  }
}
```

## SEO & Open Graph

```typescript
// Add to head
<meta property="og:title" content="Book Tours via WhatsApp - Kumaru Lanka" />
<meta property="og:description" content="Browse and book your Sri Lanka tour packages directly on WhatsApp" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

## Mobile Optimization

```typescript
// hooks/useWhatsAppLink.ts
export function useWhatsAppLink() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return {
    isMobile,
    getUrl: (phone: string, message: string) => {
      // Mobile uses 'wa://' for direct launch
      const protocol = isMobile ? 'wa:' : 'https:';
      return `${protocol}//wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
  };
}
```

## Testing

```typescript
// __tests__/WhatsAppButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatsAppBrowseButton } from '@/components/WhatsAppBrowseButton';

describe('WhatsAppBrowseButton', () => {
  it('opens WhatsApp on click', () => {
    window.open = jest.fn();
    render(<WhatsAppBrowseButton phoneNumber="+9471234567" />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(window.open).toHaveBeenCalled();
  });

  it('sends package list API call', async () => {
    render(<WhatsAppBrowseButton phoneNumber="+9471234567" />);
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for API call
    await screen.findByText('Package list sent');
  });
});
```

## Resources

- [WhatsApp Link Format Guide](https://faq.whatsapp.com/5913398998672934/)
- [Next.js Integration Guide](./WHATSAPP_INTEGRATION.md)
- [API Reference](./BACKEND_FRONTEND_INTEGRATION.md)

---

**Key Configuration Values to Update:**
- Replace `9471234567` with your actual WhatsApp business number
- Update `baseUrl` for API calls to match your deployment
- Adjust colors to match your brand
