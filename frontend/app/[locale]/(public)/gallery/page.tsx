'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = ['All', 'School Life', 'Events', 'Activities'];

// Gallery images from the school
const galleryItems = [
  { id: 1, category: 'School Life', title: 'School Activities', image: '/images/gallery/1.jpg' },
  { id: 2, category: 'School Life', title: 'Campus View', image: '/images/gallery/2.jpg' },
  { id: 3, category: 'School Life', title: 'Students', image: '/images/gallery/3.jpg' },
  { id: 4, category: 'School Life', title: 'Classroom', image: '/images/gallery/4.jpg' },
  { id: 5, category: 'School Life', title: 'School Building', image: '/images/gallery/5.jpg' },
  { id: 6, category: 'School Life', title: 'Learning', image: '/images/gallery/6.jpg' },
  { id: 7, category: 'School Life', title: 'School Moments', image: '/images/gallery/7.jpg' },
  { id: 8, category: 'School Life', title: 'Education', image: '/images/gallery/8.jpg' },
  { id: 9, category: 'Events', title: 'School Event', image: '/images/gallery/9.jpg' },
  { id: 10, category: 'Events', title: 'Celebration', image: '/images/gallery/10.jpg' },
  { id: 11, category: 'Events', title: 'Annual Day', image: '/images/gallery/11.jpg' },
  { id: 12, category: 'Events', title: 'Function', image: '/images/gallery/12.jpg' },
  { id: 13, category: 'Events', title: 'Program', image: '/images/gallery/13.jpg' },
  { id: 14, category: 'Events', title: 'Cultural Event', image: '/images/gallery/14.jpg' },
  { id: 16, category: 'Activities', title: 'Activity 1', image: '/images/gallery/16.jpg' },
  { id: 17, category: 'Activities', title: 'Activity 2', image: '/images/gallery/17.jpg' },
  { id: 18, category: 'Activities', title: 'Activity 3', image: '/images/gallery/18.jpg' },
  { id: 31, category: 'Events', title: 'Special Day', image: '/images/gallery/31.jpg' },
  { id: 32, category: 'Events', title: 'Gathering', image: '/images/gallery/32.jpg' },
  { id: 33, category: 'Events', title: 'Assembly', image: '/images/gallery/33.jpg' },
  { id: 34, category: 'Activities', title: 'Sports Day', image: '/images/gallery/34.jpg' },
  { id: 35, category: 'Activities', title: 'Competition', image: '/images/gallery/35.jpg' },
  { id: 36, category: 'Activities', title: 'Performance', image: '/images/gallery/36.jpg' },
  { id: 37, category: 'Activities', title: 'Extra Curricular', image: '/images/gallery/37.jpg' },
  { id: 38, category: 'School Life', title: 'Daily Life', image: '/images/gallery/38.jpg' },
  { id: 39, category: 'School Life', title: 'Campus', image: '/images/gallery/39.jpg' },
  { id: 40, category: 'School Life', title: 'Memories', image: '/images/gallery/40.jpg' },
  { id: 41, category: 'Activities', title: 'Youth Activity 1', image: '/images/gallery/Y1.jpg' },
  { id: 42, category: 'Activities', title: 'Youth Activity 2', image: '/images/gallery/Y2.jpg' },
  { id: 43, category: 'Activities', title: 'Youth Activity 3', image: '/images/gallery/Y3.jpg' },
  { id: 44, category: 'Activities', title: 'Youth Activity 4', image: '/images/gallery/Y4.jpg' },
  { id: 45, category: 'Activities', title: 'Youth Activity 5', image: '/images/gallery/Y5.jpg' },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  const handlePrev = () => {
    if (selectedImage !== null) {
      const currentIndex = filteredItems.findIndex(item => item.id === selectedImage);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
      setSelectedImage(filteredItems[prevIndex].id);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      const currentIndex = filteredItems.findIndex(item => item.id === selectedImage);
      const nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
      setSelectedImage(filteredItems[nextIndex].id);
    }
  };

  const selectedItem = galleryItems.find(item => item.id === selectedImage);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-primary-100 max-w-3xl">
            Explore moments captured at SLNSVM School - from academic achievements
            to cultural celebrations.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                variant="elevated"
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedImage(item.id)}
              >
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-lg"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl max-h-[80vh] p-4">
            <Image
              src={selectedItem.image}
              alt={selectedItem.title}
              width={1600}
              height={900}
              className="w-full max-h-[70vh] object-contain rounded-lg"
              unoptimized
            />
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold text-white">{selectedItem.title}</h3>
              <p className="text-gray-400">{selectedItem.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
