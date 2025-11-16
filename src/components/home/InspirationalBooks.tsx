import { BookOpen, Star } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Book {
  id: string;
  title: string;
  author: string;
  rating: number;
  cover?: string;
  description: string;
}

interface InspirationalBooksProps {
  books?: Book[];
}

export const InspirationalBooks: React.FC<InspirationalBooksProps> = ({
  books = [
    {
      id: '1',
      title: 'The Purpose Driven Life',
      author: 'Rick Warren',
      rating: 4.8,
      description: 'A spiritual guide to discovering your purpose'
    },
    {
      id: '2',
      title: 'Jesus Calling',
      author: 'Sarah Young',
      rating: 4.7,
      description: 'Daily devotions for peace and comfort'
    },
    {
      id: '3',
      title: 'The Power of Prayer',
      author: 'E.M. Bounds',
      rating: 4.9,
      description: 'Understanding the spiritual discipline'
    },
    {
      id: '4',
      title: 'Mere Christianity',
      author: 'C.S. Lewis',
      rating: 4.6,
      description: 'Exploring the foundations of faith'
    }
  ]
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < Math.floor(rating) ? '#FEA116' : '#D1D5DB'}
        fill={i < Math.floor(rating) ? '#FEA116' : 'none'}
      />
    ));
  };

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text className="text-xl font-bold text-gray-900">📚 Inspirational Books</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-semibold">View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="pl-6"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {books.map((book) => (
          <TouchableOpacity key={book.id} className="mr-4 w-40">
            <View className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-2xl h-56 p-4 mb-3 justify-between">
              <View>
                <View className="bg-orange-500 rounded-full p-2 self-start mb-3">
                  <BookOpen size={20} color="white" />
                </View>
                <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={2}>
                  {book.title}
                </Text>
                <Text className="text-gray-600 text-xs mb-2">
                  by {book.author}
                </Text>
              </View>
              
              <View>
                <View className="flex-row items-center mb-2">
                  {renderStars(book.rating)}
                  <Text className="text-gray-600 text-xs ml-1">
                    {book.rating}
                  </Text>
                </View>
                <Text className="text-gray-700 text-xs" numberOfLines={2}>
                  {book.description}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity className="bg-blue-600 rounded-lg py-2 items-center">
              <Text className="text-white font-semibold text-sm">Read Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};