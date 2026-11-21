import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { C, st } from '../styles/styles';

export default function NovaSalaScreen({ rooms, setRooms, go, notify }) {
  const [nome, setNome] = useState('');
  const [aulasDia, setAulasDia] = useState('6');
  const [duracao, setDuracao] = useState('50');

  const criar = () => {
    if (!nome.trim()) return notify('Campo obrigatório', 'Informe o nome da sala ou turma.', 'err');
    const novo = { id: Date.now(), nome: nome.trim(), aulasDia: +aulasDia || 6, duracao: +duracao || 50, intervalo: 20, inicio: '07:30', resp: 'Administrador CLAEX' };
    setRooms([...rooms, novo]);
    notify('Sala criada', novo.nome, 'ok');
    go('listar_sala');
  };

  return (
    <View style={st.section}>
      <View style={st.eyebrow}><Text style={st.eyebrowTxt}>CONFIGURAÇÃO DE TURMA</Text></View>
      <Text style={st.h2}>CADASTRAR NOVA SALA</Text>
      <View style={st.card}>
        <Text style={st.label}>NOME DA SALA / TURMA</Text>
        <TextInput value={nome} onChangeText={setNome} placeholder="Ex: 1º Ensino Médio C (Integral)" placeholderTextColor={C.muted} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>AULAS POR DIA</Text>
        <TextInput value={aulasDia} onChangeText={setAulasDia} keyboardType="numeric" style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>DURAÇÃO DA AULA (MIN)</Text>
        <TextInput value={duracao} onChangeText={setDuracao} keyboardType="numeric" style={st.input} />
        <TouchableOpacity onPress={criar} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>SALVAR E GERAR AMBIENTE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
