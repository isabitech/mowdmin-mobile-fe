import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CheckIcon } from './Icons';
import { Language } from '../types/shop';

interface Props {
  availableLanguages: Language[];
  selectedLanguages: Language[];
  onToggleLanguage: (language: Language) => void;
}

const languageLabels: Record<Language, string> = {
  EN: 'English',
  FR: 'French',
  DE: 'German',
};

const LanguageSelector: React.FC<Props> = ({
  availableLanguages,
  selectedLanguages,
  onToggleLanguage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Language:</Text>
      <View style={styles.optionsRow}>
        {availableLanguages.map((lang) => {
          const isSelected = selectedLanguages.includes(lang);
          return (
            <TouchableOpacity
              key={lang}
              style={styles.option}
              onPress={() => onToggleLanguage(lang)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && <CheckIcon size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.optionText}>{languageLabels[lang]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#040725',
    borderColor: '#040725',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default LanguageSelector;
