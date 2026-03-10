import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { GlobeIcon, ChevronDownIcon } from './Icons';
import { ProductCategory, Language } from '../types/shop';

interface Props {
  selectedCategory: ProductCategory | 'All';
  selectedLanguage: Language | 'All Languages';
  onCategoryChange: (category: ProductCategory | 'All') => void;
  onLanguageChange: (language: Language | 'All Languages') => void;
}

const categories: (ProductCategory | 'All')[] = [
  'All',
  'Devotional',
  'Worship',
  'Spiritual Growth',
  'Prophetic',
];

const languages: { value: Language | 'All Languages'; label: string }[] = [
  { value: 'All Languages', label: 'All Languages' },
  { value: 'EN', label: 'English' },
  { value: 'FR', label: 'French' },
  { value: 'DE', label: 'German' },
];

const FilterBar: React.FC<Props> = ({
  selectedCategory,
  selectedLanguage,
  onCategoryChange,
  onLanguageChange,
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getLanguageLabel = (value: Language | 'All Languages') => {
    const lang = languages.find((l) => l.value === value);
    return lang?.label || value;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {/* Category Dropdown */}
        <TouchableOpacity style={styles.categoryFilter}>
          <Text style={styles.categoryText}>{selectedCategory}</Text>
          <ChevronDownIcon size={14} color="#64748B" />
        </TouchableOpacity>

        {/* Language Filter */}
        <TouchableOpacity
          style={styles.languageFilter}
          onPress={() => setShowLanguageModal(true)}
        >
          <GlobeIcon size={14} color="#64748B" />
          <Text style={styles.languageText}>{getLanguageLabel(selectedLanguage)}</Text>
          <ChevronDownIcon size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill,
              selectedCategory === category && styles.categoryPillActive,
            ]}
            onPress={() => onCategoryChange(category)}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === category && styles.categoryPillTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.languageOption,
                  selectedLanguage === lang.value && styles.languageOptionActive,
                ]}
                onPress={() => {
                  onLanguageChange(lang.value);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    selectedLanguage === lang.value && styles.languageOptionTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryText: {
    fontSize: 13,
    color: '#475569',
    marginRight: 6,
  },
  languageFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  languageText: {
    fontSize: 13,
    color: '#475569',
  },
  pillsContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#040725',
  },
  categoryPillText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  languageOptionActive: {
    backgroundColor: '#040725',
  },
  languageOptionText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default FilterBar;
