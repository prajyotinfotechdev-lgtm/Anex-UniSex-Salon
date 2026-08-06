'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInspiration, InspirationPost } from '../hooks/use-inspiration';
import { MediaSelector } from '@/modules/media/components/media-selector';
import { PremiumLoader } from '@/components/ui/premium-loader';
import { 
  Plus, Search, Edit, Eye, Filter, Trash2, 
  TrendingUp, BarChart3, Image as ImageIcon, Heart, Share2, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InspirationStudio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { getPosts, getAnalytics, deletePost, publishPost, archivePost } = useInspiration();
  const { data: postsData, isLoading } = getPosts;
  const { data: analyticsData } = getAnalytics;

  const posts = postsData?.data || [];
  
  const filteredPosts = posts.filter((post: InspirationPost) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? post.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost.mutateAsync(id);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string, action: 'PUBLISH' | 'ARCHIVE') => {
    if (action === 'PUBLISH') await publishPost.mutateAsync(id);
    if (action === 'ARCHIVE') await archivePost.mutateAsync(id);
  };

  const totalBookmarks = analyticsData?.data?.reduce((acc: number, curr: any) => acc + (curr.bookmarkCount || 0), 0) || 0;
  const totalRevenue = analyticsData?.data?.reduce((acc: number, curr: any) => acc + Number(curr.revenueGenerated || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inspiration Studio</h2>
          <p className="text-muted-foreground mt-1">Manage your customer inspiration feed, collections, and analytics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/inspiration/collections">
            <Button variant="outline">Manage Collections</Button>
          </Link>
          <MediaSelector 
            module="inspiration" 
            trigger={<Button><Plus className="mr-2 h-4 w-4" /> Create Post</Button>} 
          />
        </div>
      </div>

      {/* ─── Top Level Analytics ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookmarks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all published posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attributed Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From inspiration-driven bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Filters & Search ─── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search posts by title..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={statusFilter === null ? 'secondary' : 'outline'} 
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'PUBLISHED' ? 'secondary' : 'outline'} 
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            Published
          </Button>
          <Button 
            variant={statusFilter === 'DRAFT' ? 'secondary' : 'outline'} 
            onClick={() => setStatusFilter('DRAFT')}
          >
            Drafts
          </Button>
        </div>
      </div>

      {/* ─── Post Grid ─── */}
      {isLoading ? (
        <PremiumLoader text="Loading inspiration feed..." />
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No posts found</p>
          <p className="text-sm text-muted-foreground">Create a post to inspire your customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post: InspirationPost) => (
            <Card key={post.id} className="overflow-hidden group flex flex-col">
              <div className="relative aspect-[4/5] bg-muted w-full overflow-hidden">
                {post.heroMedia ? (
                  <img 
                    src={post.heroMedia.secureUrl || post.heroMedia.url} 
                    alt={post.title} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2 flex gap-1 flex-col items-end">
                  {post.status === 'PUBLISHED' && <Badge variant="default" className="bg-green-600">Published</Badge>}
                  {post.status === 'DRAFT' && <Badge variant="secondary">Draft</Badge>}
                  {post.status === 'ARCHIVED' && <Badge variant="outline" className="bg-background/80">Archived</Badge>}
                  {post.isFeatured && <Badge className="bg-blue-600">Featured</Badge>}
                </div>
              </div>
              
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="line-clamp-1 font-semibold text-lg" title={post.title}>{post.title}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 -mr-2 -mt-2">
                      <Edit className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
                      <Link href={`/inspiration/${post.id}`}>
                        <DropdownMenuItem>Edit Post</DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      {post.status !== 'PUBLISHED' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(post.id, post.status, 'PUBLISH')}>
                          Publish
                        </DropdownMenuItem>
                      )}
                      {post.status === 'PUBLISHED' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(post.id, post.status, 'ARCHIVE')}>
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(post.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">{post.category.replace('_', ' ')}</p>
                
                <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t text-xs text-muted-foreground text-center">
                  <div className="flex flex-col items-center gap-1" title="Views">
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1" title="Bookmarks">
                    <Heart className="h-3 w-3" />
                    <span>{post.bookmarkCount}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1" title="Bookings">
                    <Calendar className="h-3 w-3 text-primary/70" />
                    <span className="font-medium text-primary">{post.bookingsGenerated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
