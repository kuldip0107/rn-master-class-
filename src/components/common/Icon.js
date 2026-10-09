import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * Reusable Icon component wrapping MaterialIcons.
 * Usage: <Icon name="search" size={20} color="#007AFF" />
 * Full icon list: https://fonts.google.com/icons
 */
const Icon = ({ name, size = 24, color = '#007AFF', style }) => (
  <MaterialIcons name={name} size={size} color={color} style={style} />
);

export default Icon;
