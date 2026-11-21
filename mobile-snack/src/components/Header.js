import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { C, st } from '../styles/styles';
import { PAGES } from '../data/mockData';

export default function Header({ page, go, drawerOpen, setDrawerOpen }) {
  return (
    <View>
      <View style={st.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)} style={st.menuBtn} accessibilityLabel="Abrir menu">
          <View style={st.bar} />
          <View style={st.bar} />
          <View style={st.bar} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => go('index')} style={st.brandRow}>
          <View style={st.xBadge}><Text style={st.xBadgeTxt}>X</Text></View>
          <Text style={st.brandTxt}>CLAEX</Text>
        </TouchableOpacity>

        <View style={st.headerRight}>
          <TouchableOpacity onPress={() => go('form_login')} style={st.btnGhostSm}>
            <Text style={st.btnGhostSmTxt}>ENTRAR</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => go('form_cadastro')} style={st.btnBlueSm}>
            <Text style={st.btnBlueSmTxt}>CONTA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.tabStripWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.tabStrip}>
          {PAGES.map((p) => {
            const active = page === p.id;
            return (
              <TouchableOpacity key={p.id} onPress={() => go(p.id)} style={[st.tabPill, active && st.tabPillOn]}>
                <Text style={[st.tabPillTxt, active && st.tabPillTxtOn]}>{p.short}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {drawerOpen && (
        <View style={st.drawer}>
          <View style={st.drawerHead}>
            <Text style={st.drawerTitle}>NAVEGAÇÃO · 9 TELAS (PASTAS)</Text>
            <TouchableOpacity onPress={() => setDrawerOpen(false)} style={st.btnGhostSm}>
              <Text style={st.btnGhostSmTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          {PAGES.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => go(p.id)} style={[st.drawerItem, page === p.id && st.drawerItemOn]}>
              <Text style={[st.drawerItemTxt, page === p.id && { color: C.white }]}>{p.label}  ·  {p.folder}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
