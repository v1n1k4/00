import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar } from 'react-native';

import { C, st } from './src/styles/styles';
import { INITIAL_ROOMS } from './src/data/mockData';

import Header from './src/components/Header';
import Footer from './src/components/Footer';
import Toast from './src/components/Toast';

import LandingScreen from './src/screens/LandingScreen';
import ListarSalaScreen from './src/screens/ListarSalaScreen';
import GradeScreen from './src/screens/GradeScreen';
import ProfessorScreen from './src/screens/ProfessorScreen';
import CadastrosScreen from './src/screens/CadastrosScreen';
import NovaSalaScreen from './src/screens/NovaSalaScreen';
import ConfigSalaScreen from './src/screens/ConfigSalaScreen';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';

/* ==========================================================================
   CLAEX MOBILE — EXPO SNACK (Arquitetura Modular em Pastas)
   ├── App.js
   ├── package.json
   └── src/
       ├── styles/styles.js              (Estilos gerais do aplicativo)
       ├── data/mockData.js             (9 páginas, nós neurais, salas, grade, equipe)
       ├── components/
       │   ├── Header.js                (Cabeçalho, abas rápidas e drawer lateral)
       │   ├── Footer.js                (Rodapé institucional marinho)
       │   ├── Toast.js                 (Notificações brutalistas)
       │   └── NeuralNode.js            (Nó interativo da rede neural)
       └── screens/
           ├── LandingScreen.js         (01 · index.html)
           ├── ListarSalaScreen.js      (02 · listar_sala.html)
           ├── GradeScreen.js           (03 · grade.html)
           ├── ProfessorScreen.js       (04 · painel_professor.html)
           ├── CadastrosScreen.js       (05 · tabela_cadastros.html)
           ├── NovaSalaScreen.js        (06 · form_nova_sala.html)
           ├── ConfigSalaScreen.js      (07 · config_sala.html)
           ├── LoginScreen.js           (08 · form_login.html)
           └── CadastroScreen.js        (09 · form_cadastro.html)
   ========================================================================== */

export default function App() {
  const [page, setPage] = useState('index');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [toast, setToast] = useState(null);

  const notify = (title, msg, type = 'info') => {
    setToast({ title, msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const go = (id, roomId) => {
    if (roomId) setSelectedRoomId(roomId);
    setPage(id);
    setDrawerOpen(false);
  };

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <Header page={page} go={go} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

      <ScrollView style={st.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {page === 'index' && <LandingScreen go={go} />}
        {page === 'listar_sala' && <ListarSalaScreen rooms={rooms} go={go} />}
        {page === 'grade' && <GradeScreen room={rooms.find(r => r.id === selectedRoomId) || rooms[0]} notify={notify} go={go} />}
        {page === 'painel_professor' && <ProfessorScreen notify={notify} />}
        {page === 'tabela_cadastros' && <CadastrosScreen notify={notify} />}
        {page === 'form_nova_sala' && <NovaSalaScreen rooms={rooms} setRooms={setRooms} go={go} notify={notify} />}
        {page === 'config_sala' && <ConfigSalaScreen room={rooms[0]} notify={notify} go={go} />}
        {page === 'form_login' && <LoginScreen go={go} notify={notify} />}
        {page === 'form_cadastro' && <CadastroScreen go={go} notify={notify} />}

        <Footer go={go} />
      </ScrollView>

      <Toast toast={toast} />
    </SafeAreaView>
  );
}
