import React from 'react';
import { View, Text } from 'react-native';
import { C, st } from '../theme/tokens';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <View style={[st.toast, toast.type === 'ok' && { borderLeftColor: C.teal }, toast.type === 'err' && { borderLeftColor: C.red }]}>
      <Text style={st.toastTag}>MOTOR CLAEX // AVISO</Text>
      <Text style={st.toastTitle}>{toast.title}</Text>
      <Text style={st.toastMsg}>{toast.msg}</Text>
    </View>
  );
}
