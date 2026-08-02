'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerInspirationPost, useCustomerBookmarks, useCustomerInspirationAnalytics } from '../hooks/use-inspiration';
import Image from 'next/image';
import { 
  Heart, ArrowLeft, Share2, Calendar, User,
  Scissors, Clock
} from 'lucide-react';

interface InspirationDetailProps {
  idOrSlug: string;
}

export function InspirationDetail({ idOrSlug }: InspirationDetailProps) {
  const router = useRouter();
  const { data: postData, isLoading } = useCustomerInspirationPost(idOrSlug);
  const { toggleBookmark } = useCustomerBookmarks();
  const { trackEvent } = useCustomerInspirationAnalytics();
  
  const post = postData?.data;
  

  useEffect(() => {
    if (post) {
      // Track view when component mounts and data is loaded
      trackEvent.mutate({ postId: post.id, eventType: 'view' });
    }
  }, [post, trackEvent]);

  if (isLoading) {
    return <div className="min-h-screen bg-black animate-pulse"></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif mb-2">Look Not Found</h2>
        <p className="text-zinc-500 mb-6">This inspiration post may have been removed.</p>
        <button 
          onClick={() => router.back()}
          className="bg-white text-black px-6 py-3 rounded-full font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const allImages = [
    post.heroMedia,
    ...(post.beforeMedia ? [post.beforeMedia] : []),
    ...(post.galleryItems?.map((item: { media: { secureUrl: string } }) => item.media) || [])
  ];

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleBookmark.mutateAsync(post.id);
  };

  const handleBook = () => {
    trackEvent.mutate({ postId: post.id, eventType: 'book_click' });
    const query = new URLSearchParams();
    if (post.serviceId) query.append('serviceId', post.serviceId);
    if (post.employeeId) query.append('employeeId', post.employeeId);
    if (post.branchId) query.append('branchId', post.branchId);
    query.append('inspirationId', post.id);
    
    router.push(`/book?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Immersive Media Gallery */}
      <div className="relative h-[65vh] w-full bg-zinc-900 overflow-hidden snap-x snap-mandatory flex">
        {allImages.map((img, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative snap-center">
            <Image 
              src={img.secureUrl} 
              alt={`${post.title} - ${index + 1}`}
              fill
              className="absolute inset-0 object-cover"
            />
            {index === 1 && post.beforeMedia && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                Before
              </div>
            )}
          </div>
        ))}

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-3">
            <button className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={handleBookmark}
              className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
            >
              <Heart className={`h-5 w-5 ${post.isBookmarked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
        </div>
        
        {/* Gallery Indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {allImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all w-1.5 bg-white/40`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pt-8 pb-32">
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {post.category.replace('_', ' ')}
          </span>
          {post.isTrending && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-medium uppercase tracking-wider text-primary">Trending Now</span>
            </>
          )}
        </div>
        
        <h1 className="text-4xl font-serif leading-tight mb-4">{post.title}</h1>
        
        {post.description && (
          <p className="text-zinc-300 text-lg font-light leading-relaxed mb-8">
            {post.description}
          </p>
        )}

        {/* Service Details Card */}
        {post.service && (
          <div className="bg-zinc-900 rounded-3xl p-6 mb-8 border border-white/5">
            <h3 className="text-xl font-serif mb-4">Get This Look</h3>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-full"><Scissors className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium">{post.service.name}</p>
                </div>
              </div>
              <p className="font-serif text-lg">₹{post.service.basePrice}</p>
            </div>
            
            {post.employee && (
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-full"><User className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm text-zinc-400">Styled by</p>
                    <p className="font-medium">{post.employee.firstName} {post.employee.lastName}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-full"><Clock className="h-4 w-4" /></div>
                <div>
                  <p className="font-medium">{post.service.durationMinutes} mins</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classification Tags */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {post.hairLength && (
            <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Hair Length</span>
              <span className="font-medium">{post.hairLength.replace('_', ' ')}</span>
            </div>
          )}
          {post.maintenanceLevel && (
            <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col justify-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Maintenance</span>
              <span className="font-medium">{post.maintenanceLevel}</span>
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
        <button 
          onClick={handleBook}
          className="w-full bg-white text-black py-4 rounded-full font-medium text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <Calendar className="h-5 w-5" />
          Book This Look
        </button>
      </div>
    </div>
  );
}
