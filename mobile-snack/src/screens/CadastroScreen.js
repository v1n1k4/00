import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { C, st } from '../styles/styles';

export default function CadastroScreen({ go, notify }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('ALUNO');
  return (
    <View style={st.section}>
      <View style={st.card}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>[REGISTRO DE ENTIDADE]</Text></View>
        <Text style={[st.h2, { marginTop: 8 }]}>JUNTE-SE AO <Text style={{ color: C.blue }}>CLAEX</Text></Text>
        <Text style={st.p}>Cadastre sua instituição de ensino, perfil de professor ou estudante para sincronizar disponibilidades semanais.</Text>
      </View>

      <View style={[st.card, { marginTop: 14 }]}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>FORMULÁRIO DE CADASTRO</Text></View>
        <Text style={[st.h3, { marginTop: 8 }]}>CRIAR NOVA CONTA</Text>
        <Text style={[st.label, { marginTop: 12 }]}>NOME COMPLETO / INSTITUIÇÃO</Text>
        <TextInput value={nome} onChangeText={setNome} placeholder="Ex: Escola Estadual ou Prof. Carlos" placeholderTextColor={C.muted} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>E-MAIL</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" placeholderTextColor={C.muted} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>TIPO DE PERFIL</Text>
        <View style={st.tagsRow}>
          {['ALUNO', 'PROFESSOR', 'ADMIN'].map((p) => (
            <TouchableOpacity key={p} onPress={() => setPerfil(p)} style={[st.tagIce, perfil === p && { backgroundColor: C.blue }]}>
              <Text style={[st.tagIceTxt, perfil === p && { color: C.white }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => { notify('Conta criada', `${nome || 'Novo usuário'} (${perfil})`, 'ok'); go('form_login'); }} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>CONCLUIR CADASTRO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
