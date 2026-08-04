'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInspiration, useGetPost } from '../hooks/use-inspiration';
import { MediaSelector } from '@/modules/media/components/media-selector';
import { MediaAsset } from '@/modules/media/hooks/use-media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const postSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  isFeatured: z.boolean().default(false),
  heroMediaId: z.string().uuid('Hero image is required'),
  beforeMediaId: z.string().optional().nullable(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface InspirationPostEditorProps {
  postId?: string;
}

export function InspirationPostEditor({ postId }: InspirationPostEditorProps) {
  const router = useRouter();
  const { createPost, updatePost } = useInspiration();
  const isEditing = !!postId;
  
  const { data: postData, isLoading } = useGetPost(postId || '');
  const post = postData?.data;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      category: 'HAIRCUT',
      status: 'DRAFT',
      isFeatured: false,
      heroMediaId: '',
      beforeMediaId: '',
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        description: post.description || '',
        category: post.category,
        status: post.status as any,
        isFeatured: post.isFeatured,
        heroMediaId: post.heroMediaId,
        beforeMediaId: post.beforeMediaId || '',
      });
    }
  }, [post, form]);

  const onSubmit = async (values: PostFormValues) => {
    try {
      const cleanValues = {
        ...values,
        beforeMediaId: values.beforeMediaId || undefined,
        slug: values.slug || undefined,
      };

      if (!isEditing) {
        toast.error('Creating posts here is deprecated. Use the Inspiration Studio Upload button instead.');
        return;
      }

      await updatePost.mutateAsync({ id: postId, data: cleanValues });
      toast.success('Post updated successfully');
      router.push('/inspiration');
    } catch (error) {
      toast.error('Failed to save post');
      console.error(error);
    }
  };

  const currentHeroId = form.watch('heroMediaId');
  const [heroPreview, setHeroPreview] = React.useState<string | null>(null);

  useEffect(() => {
    if (post?.heroMedia?.secureUrl) {
      setHeroPreview(post.heroMedia.secureUrl);
    }
  }, [post]);

  if (isEditing && isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Post' : 'Create Inspiration Post'}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Summer Blonde Balayage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the look..." className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HAIRCUT">Haircut</SelectItem>
                              <SelectItem value="HAIR_COLOUR">Hair Colour</SelectItem>
                              <SelectItem value="BEARD">Beard</SelectItem>
                              <SelectItem value="HAIR_SPA">Hair Spa</SelectItem>
                              <SelectItem value="BRIDAL">Bridal</SelectItem>
                              <SelectItem value="OCCASION">Occasion</SelectItem>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="KIDS">Kids</SelectItem>
                              <SelectItem value="TRANSFORMATION">Transformation</SelectItem>
                              <SelectItem value="TRENDING">Trending</SelectItem>
                              <SelectItem value="STAFF_PICKS">Staff Picks</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="PUBLISHED">Published</SelectItem>
                              <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                  <div className="w-full aspect-[4/5] bg-muted rounded-md overflow-hidden relative flex items-center justify-center border">
                    {heroPreview ? (
                      <img src={heroPreview} alt="Hero" className="object-cover w-full h-full" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="heroMediaId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <MediaSelector 
                          module="inspiration"
                          selectedAssetId={field.value}
                          onSelect={(asset: MediaAsset) => {
                            field.onChange(asset.id);
                            setHeroPreview(asset.secureUrl);
                          }}
                          trigger={
                            <Button type="button" variant="outline" className="w-full">
                              {currentHeroId ? 'Change Image' : 'Select Image'}
                            </Button>
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Post' : 'Save Post'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
