import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { st } from '../styles/styles';

export default function Footer({ go }) {
  return (
    <View style={st.footer}>
      <Text style={st.footerBrand}>CLAEX</Text>
      <Text style={st.footerSub}>Automação inteligente de grades horárias para escolas, coordenadores e professores.</Text>
      <View style={st.footerLinks}>
        <TouchableOpacity onPress={() => go('index')}><Text style={st.footerLink}>INÍCIO</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => go('listar_sala')}><Text style={st.footerLink}>SALAS</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => go('grade')}><Text style={st.footerLink}>GRADE</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => go('painel_professor')}><Text style={st.footerLink}>PROFESSOR</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => go('form_login')}><Text style={st.footerLink}>LOGIN</Text></TouchableOpacity>
      </View>
      <Text style={st.footerCopy}>© 2026 CLAEX EDUCAÇÃO · PALETA INSTITUCIONAL</Text>
    </View>
  );
}
