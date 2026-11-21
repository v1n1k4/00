import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C, st } from '../theme/tokens';

export default function ProfessorScreen({ notify }) {
  const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  const periods = ['Manhã (07:30–12:00)', 'Tarde (13:00–17:30)'];
  const [avail, setAvail] = useState({ 'SEG-0': true, 'SEG-1': true, 'TER-0': true, 'QUA-0': true, 'QUI-0': true, 'SEX-0': true });

  const toggle = (k) => setAvail({ ...avail, [k]: !avail[k] });

  return (
    <View style={st.section}>
      <View style={st.eyebrow}><Text style={st.eyebrowTxt}>ÁREA DOCENTE // DISPONIBILIDADE</Text></View>
      <Text style={st.h2}>PAINEL DO PROFESSOR</Text>
      <View style={st.card}>
        <Text style={st.h3}>PROF. MARINA · MATEMÁTICA & FÍSICA</Text>
        <Text style={st.p}>Toque nos turnos em que você está disponível para lecionar.</Text>
        {periods.map((per, pi) => (
          <View key={per} style={{ marginTop: 12 }}>
            <Text style={st.label}>{per}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              {days.map((d) => {
                const k = `${d}-${pi}`;
                const on = !!avail[k];
                return (
                  <TouchableOpacity key={k} onPress={() => toggle(k)} style={[st.dayToggle, on && st.dayToggleOn]}>
                    <Text style={[st.dayToggleTxt, on && { color: C.white }]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={() => notify('Disponibilidade salva', 'Sincronizada com o motor NSGA-II.', 'ok')} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>SALVAR DISPONIBILIDADE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
