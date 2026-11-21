import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { st } from '../theme/tokens';

export default function ConfigSalaScreen({ room, notify, go }) {
  const [inicio, setInicio] = useState(room.inicio);
  const [intervalo, setIntervalo] = useState(String(room.intervalo));
  return (
    <View style={st.section}>
      <View style={st.eyebrow}><Text style={st.eyebrowTxt}>PARÂMETROS DO MOTOR</Text></View>
      <Text style={st.h2}>CONFIGURAR SALA</Text>
      <View style={st.card}>
        <Text style={st.h3}>{room.nome}</Text>
        <Text style={[st.label, { marginTop: 12 }]}>HORÁRIO DE INÍCIO</Text>
        <TextInput value={inicio} onChangeText={setInicio} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>INTERVALO (MINUTOS)</Text>
        <TextInput value={intervalo} onChangeText={setIntervalo} keyboardType="numeric" style={st.input} />
        <TouchableOpacity onPress={() => { notify('Parâmetros atualizados', 'Recalcule a grade para aplicar.', 'ok'); go('grade'); }} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>SALVAR CONFIGURAÇÕES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
