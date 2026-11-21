import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { st } from '../theme/tokens';

export default function ListarSalaScreen({ rooms, go }) {
  return (
    <View style={st.section}>
      <View style={st.card}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>UNIDADE CONECTADA</Text></View>
        <Text style={st.h2}>CENTRO PAULA SOUZA</Text>
        <Text style={st.p}>Professores Cadastrados: 5 · Salas Ativas no BD: {rooms.length}</Text>
      </View>

      <View style={[st.eyebrow, { marginTop: 20 }]}><Text style={st.eyebrowTxt}>MATRIZ DE AMBIENTES // BANCO DE DADOS</Text></View>
      <Text style={st.h2}>SALAS DE AULA DISPONÍVEIS</Text>

      {rooms.map((r, i) => (
        <View key={r.id} style={[st.card, { marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={st.tagIce}><Text style={st.tagIceTxt}>SALA #{i + 1}</Text></View>
            <TouchableOpacity onPress={() => go('grade', r.id)}>
              <Text style={st.linkBlue}>VER GRADE →</Text>
            </TouchableOpacity>
          </View>
          <Text style={[st.h3, { marginTop: 8 }]}>{r.nome}</Text>
          <Text style={st.p}>{r.aulasDia} aulas/dia • {r.duracao}min • {r.resp}</Text>
        </View>
      ))}

      <TouchableOpacity onPress={() => go('form_nova_sala')} style={[st.btnBlue, { marginTop: 16 }]}>
        <Text style={st.btnBlueTxt}>+ CADASTRAR NOVA SALA</Text>
      </TouchableOpacity>
    </View>
  );
}
