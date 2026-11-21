import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { C, st } from '../styles/styles';

export default function NeuralNode({ item, active, done, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        st.neuralNode,
        done && { opacity: 1 },
        active && { backgroundColor: C.ice, opacity: 1, transform: [{ translateY: -2 }] },
      ]}>
      <Text style={st.neuralNodeNum}>{item.num}</Text>
      <Text style={st.neuralNodeTxt} numberOfLines={1}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}
