import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C, st } from '../theme/tokens';
import { INITIAL_USERS } from '../data/mockData';

export default function CadastrosScreen({ notify }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  return (
    <View style={st.section}>
      <View style={st.eyebrow}><Text style={st.eyebrowTxt}>DIRETÓRIO ACADÊMICO</Text></View>
      <Text style={st.h2}>PROFESSORES & CADASTROS</Text>
      {users.map((u) => (
        <View key={u.id} style={[st.card, { marginTop: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={st.tagIce}><Text style={st.tagIceTxt}>{u.perfil}</Text></View>
            <TouchableOpacity onPress={() => { setUsers(users.filter(x => x.id !== u.id)); notify('Cadastro removido', u.nome, 'info'); }}>
              <Text style={[st.linkBlue, { color: C.red }]}>REMOVER</Text>
            </TouchableOpacity>
          </View>
          <Text style={[st.h3, { marginTop: 6 }]}>{u.nome}</Text>
          <Text style={st.monoMeta}>{u.email}</Text>
        </View>
      ))}
    </View>
  );
}
