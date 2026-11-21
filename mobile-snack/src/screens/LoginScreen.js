import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { C, st } from '../styles/styles';

export default function LoginScreen({ go, notify }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  return (
    <View style={st.section}>
      <View style={st.card}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>[AUTENTICAÇÃO CENTRAL]</Text></View>
        <Text style={[st.h2, { marginTop: 8 }]}>BEM-VINDO AO <Text style={{ color: C.blue }}>CLAEX</Text></Text>
        <Text style={st.p}>Acesse sua conta para gerenciar horários, disponibilidade de docentes e otimizar salas em tempo real.</Text>
      </View>

      <View style={[st.card, { marginTop: 14 }]}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>PORTAL DO USUÁRIO</Text></View>
        <Text style={[st.h3, { marginTop: 8 }]}>ENTRAR NO SISTEMA</Text>
        <Text style={[st.label, { marginTop: 12 }]}>NOME DE USUÁRIO</Text>
        <TextInput value={user} onChangeText={setUser} placeholder="Ex: Nome cadastrado no banco" placeholderTextColor={C.muted} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>SENHA</Text>
        <TextInput value={pass} onChangeText={setPass} secureTextEntry placeholder="Sua senha de acesso" placeholderTextColor={C.muted} style={st.input} />
        <TouchableOpacity onPress={() => { notify('Sessão iniciada', `Bem-vindo, ${user || 'Administrador'}!`, 'ok'); go('listar_sala'); }} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>ENTRAR NO SISTEMA</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => go('form_cadastro')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={st.p}>Não possui uma conta? <Text style={st.linkBlue}>Cadastre-se aqui</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
