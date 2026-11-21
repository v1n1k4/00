import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { C, st } from '../styles/styles';
import { TIMETABLE } from '../data/mockData';

export default function GradeScreen({ room, notify, go }) {
  const [generated, setGenerated] = useState(true);
  const [model, setModel] = useState('Gemini 2.5 Pro');
  const [regra, setRegra] = useState('');
  const [regras, setRegras] = useState(['Máx. 2 aulas seguidas por docente', 'Compactação de janelas ociosas']);

  return (
    <View style={st.section}>
      <View style={st.card}>
        <View style={st.tagIce}><Text style={st.tagIceTxt}>TURMA / AMBIENTE SELECIONADO</Text></View>
        <Text style={st.h2}>{room.nome.toUpperCase()}</Text>
        <Text style={st.monoMeta}>AULAS: {room.aulasDia}/DIA · DURAÇÃO: {room.duracao}m · INTERVALO: {room.intervalo}m · INÍCIO: {room.inicio}</Text>
      </View>

      <View style={[st.card, { marginTop: 12 }]}>
        <Text style={st.label}>ORQUESTRADOR CLAEX V10 · MODELO IA</Text>
        <View style={st.tagsRow}>
          {['Gemini 2.5 Pro', 'Claude Sonnet 4', 'o3-mini'].map((m) => (
            <TouchableOpacity key={m} onPress={() => setModel(m)} style={[st.tagIce, model === m && { backgroundColor: C.blue }]}>
              <Text style={[st.tagIceTxt, model === m && { color: C.white }]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[st.linkBlue, { marginTop: 8 }]}>STATUS: 100% CONFORME · {model.toUpperCase()}</Text>
      </View>

      <View style={st.kpiGrid}>
        {[
          ['FITNESS MULTI-OBJETIVO', '1000 pts', 'NSGA-II + SA'],
          ['EQUILÍBRIO COGNITIVO', '100%', 'Exatas / Humanas'],
          ['JANELAS DOCENTES', '100%', '0 janelas ociosas'],
          ['AULAS GEMINADAS', '6 blocos', '100% alinhadas'],
        ].map(([t, v, s]) => (
          <View key={t} style={st.kpiCard}>
            <Text style={st.kpiLbl}>{t}</Text>
            <Text style={st.kpiVal}>{v}</Text>
            <Text style={st.kpiSub}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={[st.card, { marginTop: 12 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={st.h3}>QUADRO HORÁRIO</Text>
          <TouchableOpacity onPress={() => { setGenerated(true); notify('Grade Otimizada', 'NSGA-II + Simulated Annealing concluído com 0 conflitos.', 'ok'); }} style={st.btnBlueSm}>
            <Text style={st.btnBlueSmTxt}>⚡ GERAR GRADE</Text>
          </TouchableOpacity>
        </View>
        {generated && TIMETABLE.map((row) => (
          <View key={row.hr} style={st.gridRow}>
            <Text style={[st.gridHr, { flex: 0.6 }]}>{row.hr}</Text>
            {row.slots.map((cell, ci) => (
              <View key={ci} style={[st.gridCell, cell && cell[1] === 'b' && { backgroundColor: C.blue }, cell && cell[1] === 'l' && { backgroundColor: C.ice }]}>
                <Text numberOfLines={1} style={[st.gridCellTxt, cell && cell[1] === 'b' && { color: C.white }]}>{cell ? cell[0] : '—'}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={[st.card, { marginTop: 12 }]}>
        <Text style={st.h3}>REGRAS APRENDIDAS PELA IA</Text>
        {regras.map((r, i) => <Text key={i} style={st.bullet}>✓ {r}</Text>)}
        <TextInput value={regra} onChangeText={setRegra} placeholder="Ex: Prof. Carlos não leciona sexta à tarde" placeholderTextColor={C.muted} style={[st.input, { marginTop: 8 }]} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity onPress={() => { if (regra.trim()) { setRegras([...regras, regra.trim()]); setRegra(''); notify('Regra adicionada', 'O motor aplicará a restrição na próxima geração.', 'ok'); } }} style={[st.btnBlue, { flex: 1 }]}>
            <Text style={st.btnBlueTxt}>ENSINAR REGRA</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => go('config_sala')} style={st.btnGhost}>
            <Text style={st.btnGhostTxt}>CONFIG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
