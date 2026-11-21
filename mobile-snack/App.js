import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, Easing, StatusBar, Platform
} from 'react-native';

/* ==========================================================================
   CLAEX MOBILE — EXPO SNACK (React Native)
   Paleta Institucional Brutalista:
   Marinho #0F172A · Ardósia #F1F5F9 · Azul #1E3A8A · Gelo #DBEAFE · Bordô #B91C1C
   Inclui todas as 9 páginas do sistema CLAEX:
   1. Início (Abertura logo CLAE+X → Rede Neural 6 nós → Exemplo 4 passos → Perfis → Equipe)
   2. Salas (listar_sala)
   3. Grade (grade + Orquestrador NSGA-II + KPIs + Tabela seg-sex)
   4. Professor (painel_professor)
   5. Cadastros (tabela_cadastros)
   6. Nova Sala (form_nova_sala)
   7. Config Sala (config_sala)
   8. Login (form_login)
   9. Cadastro (form_cadastro)
   ========================================================================== */

const C = {
  ink: '#0F172A',
  paper: '#F1F5F9',
  white: '#FFFFFF',
  blue: '#1E3A8A',
  blueHover: '#172554',
  ice: '#DBEAFE',
  iceBright: '#93C5FD',
  red: '#B91C1C',
  teal: '#0F766E',
  muted: '#334155',
  slate: '#CBD5E1',
};

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const PAGES = [
  { id: 'index', label: '01 · Início', short: 'INÍCIO' },
  { id: 'listar_sala', label: '02 · Salas', short: 'SALAS' },
  { id: 'grade', label: '03 · Grade', short: 'GRADE' },
  { id: 'painel_professor', label: '04 · Professor', short: 'PROF.' },
  { id: 'tabela_cadastros', label: '05 · Cadastros', short: 'CADASTROS' },
  { id: 'form_nova_sala', label: '06 · Nova Sala', short: '+ SALA' },
  { id: 'config_sala', label: '07 · Config Sala', short: 'CONFIG' },
  { id: 'form_login', label: '08 · Login', short: 'LOGIN' },
  { id: 'form_cadastro', label: '09 · Cadastro', short: 'REGISTRO' },
];

const NEURAL_STEPS = [
  { num: '01', name: 'Professores', desc: 'Cada professor informa quando pode dar aula. O motor respeita as janelas de disponibilidade e a carga semanal.' },
  { num: '02', name: 'Salas', desc: 'Salas e laboratórios entram com capacidade e horários livres. Regra simples: uma sala, uma turma por horário.' },
  { num: '03', name: 'Turmas', desc: 'Cada turma traz suas matérias e a quantidade de aulas por dia, sem buracos no meio da grade.' },
  { num: '04', name: 'Regras', desc: 'As restrições viram regras: no máximo 2 aulas seguidas, janelas compactas e equilíbrio entre exatas e humanas.' },
  { num: '05', name: 'Otimizador', desc: 'NSGA-II + Simulated Annealing testam milhares de combinações e ficam só com as melhores.' },
  { num: '06', name: 'Grade Final', desc: 'Resultado: uma grade sem conflitos, que administração, professores e alunos consultam em qualquer lugar.' },
];

const INITIAL_ROOMS = [
  { id: 1, nome: '3º Ensino Médio A (Integral)', aulasDia: 6, duracao: 50, intervalo: 20, inicio: '07:30', resp: 'Administrador CLAEX' },
  { id: 2, nome: '2º Ensino Médio B (Tecnologia)', aulasDia: 5, duracao: 50, intervalo: 20, inicio: '07:30', resp: 'Administrador CLAEX' },
];

const TIMETABLE = [
  { hr: '08h', slots: [['Matemática', 'b', 1], null, ['Física', 'l', 2], null, ['Artes', '', 0]] },
  { hr: '09h', slots: [['Matemática', 'b', 0], ['História', 'l', 3], null, ['Química', 'b', 4], ['Artes', '', 0]] },
  { hr: '10h', slots: [['Inglês', 'l', 0], null, ['Biologia', 'b', 5], null, ['Ed. Física', '', 0]] },
  { hr: '11h', slots: [null, ['Geografia', '', 6], ['Biologia', 'b', 0], ['Português', 'l', 7], null] },
];

const TEAM = [
  { mono: 'DSP', num: '#01', name: 'Daniel', role: 'Arquitetura & Back-End', desc: 'Modelagem acadêmica, persistência JPA/MySQL e APIs RESTful em Java + Spring Boot.', tags: ['Java 17', 'Spring Boot', 'MySQL'] },
  { mono: 'VC', num: '#02', name: 'Vini', role: 'Front-End, Back-End & IA', desc: 'Design system, Motion UI, integração Gemini API e o motor memético CLAEX.', tags: ['Motion UI', 'Gemini API', 'Full-Stack'] },
  { mono: 'SAB', num: '#03', name: 'Samuel', role: 'Desenvolvedor Full-Stack', desc: 'Fluxos de dados escolares ponta a ponta, regras de negócio e experiência do usuário.', tags: ['Spring Data', 'JavaScript', 'UX Flow'] },
];

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

      {/* CABEÇALHO BRUTALISTA INSTITUCIONAL */}
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

      {/* BARRA DE PÁGINAS RÁPIDA (9 PÁGINAS) */}
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

      {/* MENU LATERAL */}
      {drawerOpen && (
        <View style={st.drawer}>
          <View style={st.drawerHead}>
            <Text style={st.drawerTitle}>NAVEGAÇÃO · 9 TELAS</Text>
            <TouchableOpacity onPress={() => setDrawerOpen(false)} style={st.btnGhostSm}>
              <Text style={st.btnGhostSmTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          {PAGES.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => go(p.id)} style={[st.drawerItem, page === p.id && st.drawerItemOn]}>
              <Text style={[st.drawerItemTxt, page === p.id && { color: C.white }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CONTEÚDO DA PÁGINA ATIVA */}
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

        {/* RODAPÉ INSTITUCIONAL MARINHO */}
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
      </ScrollView>

      {/* TOAST BRUTALISTA */}
      {toast && (
        <View style={[st.toast, toast.type === 'ok' && { borderLeftColor: C.teal }, toast.type === 'err' && { borderLeftColor: C.red }]}>
          <Text style={st.toastTag}>MOTOR CLAEX // AVISO</Text>
          <Text style={st.toastTitle}>{toast.title}</Text>
          <Text style={st.toastMsg}>{toast.msg}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ==========================================================================
   01 · LANDING NARRATIVA (Abertura CLAE+X → Rede Neural → Exemplo → Perfis → Equipe)
   ========================================================================== */
function LandingScreen({ go }) {
  const claeW = useRef(new Animated.Value(0)).current;
  const xScale = useRef(new Animated.Value(0.5)).current;
  const subOp = useRef(new Animated.Value(0)).current;

  const [neuralIdx, setNeuralIdx] = useState(0);
  const [exStep, setExStep] = useState(2); // 0 requisitos, 1 conflitos, 2 otimizando, 3 pronta
  const [roleTab, setRoleTab] = useState('adm');

  const replayIntro = () => {
    claeW.setValue(0);
    xScale.setValue(0.45);
    subOp.setValue(0);
    Animated.sequence([
      Animated.spring(xScale, { toValue: 1, friction: 6, useNativeDriver: false }),
      Animated.timing(claeW, { toValue: 196, duration: 950, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(subOp, { toValue: 1, duration: 350, useNativeDriver: false }),
    ]).start();
  };

  useEffect(() => { replayIntro(); }, []);

  const step = NEURAL_STEPS[neuralIdx];
  const resolvedCount = exStep === 0 ? 0 : exStep === 1 ? 0 : exStep === 2 ? 4 : 7;
  const conflictsLeft = exStep === 0 ? 0 : 7 - resolvedCount;
  const quality = exStep === 0 ? 0 : exStep === 1 ? 18 : exStep === 2 ? 62 : 94;

  return (
    <View>
      {/* 01 · ABERTURA: TELA MARINHO ESCURO → X → CLAE SAI PARA A ESQUERDA → CLAEX */}
      <View style={st.introBox}>
        <View style={st.introCorners}>
          <Text style={st.cornerTxt}>[01] ABERTURA</Text>
          <Text style={[st.cornerTxt, { color: C.white }]}>GESTÃO DE GRADE</Text>
        </View>

        <View style={st.lockupRow}>
          <Animated.View style={{ width: claeW, overflow: 'hidden', height: 68, justifyContent: 'center' }}>
            <Text style={st.claeWord} numberOfLines={1}>CLAE</Text>
          </Animated.View>
          <Animated.View style={[st.xAmpulheta, { transform: [{ scale: xScale }] }]}>
            <View style={st.xHalfL} />
            <View style={st.xHalfR} />
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: subOp, alignItems: 'center' }}>
          <View style={st.introSubBox}>
            <Text style={st.introSubTxt}>MOTOR INTELIGENTE DE GRADES ESCOLARES</Text>
          </View>
          <TouchableOpacity onPress={replayIntro} style={{ marginTop: 12 }}>
            <Text style={st.replayTxt}>↻ REPETIR ANIMAÇÃO DA LOGO</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 02 · COMO FUNCIONA: REDE NEURAL EM VOLTA DO MOTOR */}
      <View style={st.section}>
        <View style={st.eyebrow}><Text style={st.eyebrowTxt}>02 / COMO FUNCIONA</Text></View>
        <Text style={st.h2}>TUDO SE LIGA NO MOTOR.</Text>

        {/* Diagrama Neural Mobile: 6 nós conectados ao núcleo MOTOR */}
        <View style={st.neuralBoard}>
          <View style={st.neuralRow}>
            {[0, 2, 3].map((i) => (
              <NeuralNode key={i} item={NEURAL_STEPS[i]} active={neuralIdx === i} done={i < neuralIdx} onPress={() => setNeuralIdx(i)} />
            ))}
          </View>

          <View style={st.neuralLinesRow}>
            <View style={[st.neuralConnector, neuralIdx >= 0 && st.neuralConnectorOn]} />
            <View style={[st.neuralCore, neuralIdx === 5 && { borderColor: C.blue }]}>
              <Text style={st.neuralCoreX}>X</Text>
              <Text style={st.neuralCoreLbl}>MOTOR</Text>
            </View>
            <View style={[st.neuralConnector, neuralIdx >= 3 && st.neuralConnectorOn]} />
          </View>

          <View style={st.neuralRow}>
            {[1, 5, 4].map((i) => (
              <NeuralNode key={i} item={NEURAL_STEPS[i]} active={neuralIdx === i} done={i < neuralIdx} onPress={() => setNeuralIdx(i)} />
            ))}
          </View>
        </View>

        {/* Cartão de explicação do nó selecionado */}
        <View style={st.card}>
          <Text style={st.stepNumBig}>{step.num} <Text style={st.stepNumSub}>/ 06</Text></Text>
          <Text style={st.h3}>{step.name.toUpperCase()}</Text>
          <Text style={st.p}>{step.desc}</Text>
          <View style={st.progressTrack}>
            <View style={[st.progressFill, { width: `${((neuralIdx + 1) / 6) * 100}%` }]} />
          </View>
          <View style={st.stepNavRow}>
            <TouchableOpacity onPress={() => setNeuralIdx((neuralIdx + 5) % 6)} style={st.btnGhostSm}>
              <Text style={st.btnGhostSmTxt}>← ANTERIOR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNeuralIdx((neuralIdx + 1) % 6)} style={st.btnBlueSm}>
              <Text style={st.btnBlueSmTxt}>PRÓXIMA PARTE →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 03 · EXEMPLO: DO CAOS À GRADE EM 4 PASSOS */}
      <View style={[st.section, { backgroundColor: C.white }]}>
        <View style={st.eyebrow}><Text style={st.eyebrowTxt}>03 / EXEMPLO</Text></View>
        <Text style={st.h2}>DO CAOS À GRADE EM 4 PASSOS.</Text>

        <View style={st.exStepList}>
          {['01 Requisitos entram', '02 Conflitos aparecem', '03 O motor otimiza', '04 Grade pronta'].map((lbl, idx) => (
            <TouchableOpacity key={idx} onPress={() => setExStep(idx)} style={[st.exStepBtn, exStep === idx && st.exStepBtnOn]}>
              <Text style={st.exStepBtnTxt}>{lbl.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={st.meterRow}>
          <View style={[st.card, { flex: 1, marginRight: 8 }]}>
            <Text style={st.label}>CONFLITOS</Text>
            <Text style={[st.metricBig, { color: conflictsLeft === 0 ? C.blue : C.red }]}>{conflictsLeft}</Text>
          </View>
          <View style={[st.card, { flex: 1.3 }]}>
            <Text style={st.label}>QUALIDADE</Text>
            <Text style={st.metricBig}>{quality}%</Text>
            <View style={st.progressTrack}>
              <View style={[st.progressFill, { width: `${quality}%` }]} />
            </View>
          </View>
        </View>

        {/* Mini grade semanal com conflitos resolvendo */}
        <View style={[st.card, { marginTop: 12 }]}>
          <Text style={st.calHead}>3º ENSINO MÉDIO A · SEMANA 12</Text>
          <View style={st.gridHeader}>
            <Text style={[st.gridDay, { flex: 0.6 }]}>HR</Text>
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map(d => <Text key={d} style={st.gridDay}>{d}</Text>)}
          </View>
          {TIMETABLE.map((row) => (
            <View key={row.hr} style={st.gridRow}>
              <Text style={[st.gridHr, { flex: 0.6 }]}>{row.hr}</Text>
              {row.slots.map((cell, ci) => {
                if (!cell) return <View key={ci} style={st.gridEmpty} />;
                const [subj, tone, cIdx] = cell;
                const isGhost = exStep === 0;
                const isBad = cIdx > 0 && exStep >= 1 && cIdx > resolvedCount;
                return (
                  <View
                    key={ci}
                    style={[
                      st.gridCell,
                      tone === 'b' && { backgroundColor: C.blue },
                      tone === 'l' && { backgroundColor: C.ice },
                      isGhost && st.gridCellGhost,
                      isBad && { backgroundColor: C.red },
                    ]}>
                    <Text
                      numberOfLines={1}
                      style={[
                        st.gridCellTxt,
                        (tone === 'b' || isBad) && { color: C.white },
                      ]}>
                      {isBad ? `! ${subj}` : subj}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* 04 · PERFIS: ADMINISTRAÇÃO, PROFESSORES E ALUNOS */}
      <View style={st.section}>
        <View style={st.eyebrow}><Text style={st.eyebrowTxt}>04 / PERFIS</Text></View>
        <Text style={st.h2}>CADA PERFIL ENXERGA O QUE IMPORTA.</Text>

        <View style={st.roleTabs}>
          {[
            ['adm', 'ADMINISTRAÇÃO'],
            ['prof', 'PROFESSORES'],
            ['aluno', 'ALUNOS'],
          ].map(([k, lbl]) => (
            <TouchableOpacity key={k} onPress={() => setRoleTab(k)} style={[st.roleTab, roleTab === k && st.roleTabOn]}>
              <Text style={[st.roleTabTxt, roleTab === k && { color: C.white }]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {roleTab === 'adm' && (
          <View style={st.card}>
            <Text style={st.h3}>MONTE E AJUSTE A GRADE DA ESCOLA INTEIRA.</Text>
            <Text style={st.bullet}>✓ Cadastre salas, turmas e professores</Text>
            <Text style={st.bullet}>✓ Gere a grade automática sem conflitos</Text>
            <Text style={st.bullet}>✓ Acompanhe a ocupação das salas (88% · 72% · 55%)</Text>
            <TouchableOpacity onPress={() => go('grade')} style={[st.btnBlue, { marginTop: 12 }]}>
              <Text style={st.btnBlueTxt}>ABRIR ORQUESTRADOR DE GRADE →</Text>
            </TouchableOpacity>
          </View>
        )}
        {roleTab === 'prof' && (
          <View style={st.card}>
            <Text style={st.h3}>SUAS AULAS DA SEMANA, NUM RELANCE.</Text>
            <Text style={st.bullet}>✓ 08:00 · Matemática · 8º A · Sala 101</Text>
            <Text style={st.bullet}>✓ 10:00 · Matemática · 9º B · Sala 204</Text>
            <Text style={st.bullet}>✓ 13:30 · Planejamento docente</Text>
            <TouchableOpacity onPress={() => go('painel_professor')} style={[st.btnBlue, { marginTop: 12 }]}>
              <Text style={st.btnBlueTxt}>ABRIR PAINEL DO PROFESSOR →</Text>
            </TouchableOpacity>
          </View>
        )}
        {roleTab === 'aluno' && (
          <View style={st.card}>
            <Text style={st.h3}>SAIBA SEMPRE QUAL É A PRÓXIMA AULA.</Text>
            <Text style={st.bullet}>✓ Horário da sua turma sempre atualizado</Text>
            <Text style={st.bullet}>✓ Sala e professor de cada aula</Text>
            <TouchableOpacity onPress={() => go('listar_sala')} style={[st.btnBlue, { marginTop: 12 }]}>
              <Text style={st.btnBlueTxt}>VER SALAS E TURMAS →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 05 · EQUIPE: DANIEL, VINI, SAMUEL */}
      <View style={st.section}>
        <View style={st.eyebrow}><Text style={st.eyebrowTxt}>05 / INTEGRANTES</Text></View>
        <Text style={st.h2}>QUEM CONSTRUIU.</Text>
        {TEAM.map((m) => (
          <View key={m.mono} style={[st.card, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={st.monoAvatar}><Text style={st.monoAvatarTxt}>{m.mono}</Text></View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={st.tagIce}><Text style={st.tagIceTxt}>{m.num}</Text></View>
                <Text style={st.h3}>{m.name.toUpperCase()}</Text>
                <Text style={st.roleTxt}>{m.role.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={st.p}>{m.desc}</Text>
            <View style={st.tagsRow}>
              {m.tags.map(t => <View key={t} style={st.tagIce}><Text style={st.tagIceTxt}>{t}</Text></View>)}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function NeuralNode({ item, active, done, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        st.neuralNode,
        done && { opacity: 1 },
        active && { backgroundColor: C.ice, opacity: 1, transform: [{ translateY: -2 }] },
      ]}>
      <Text style={st.neuralNodeNum}>{item.num}</Text>
      <Text style={st.neuralNodeTxt} numberOfLines={1}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

/* ==========================================================================
   02 · LISTAR SALAS (listar_sala.html)
   ========================================================================== */
function ListarSalaScreen({ rooms, go }) {
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

/* ==========================================================================
   03 · GRADE DE HORÁRIOS + ORQUESTRADOR NSGA-II (grade.html)
   ========================================================================== */
function GradeScreen({ room, notify, go }) {
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

      {/* ORQUESTRADOR */}
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

      {/* 4 KPIs */}
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

      {/* GRADE SEMANAL */}
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

      {/* ENSINAR REGRA PARA IA */}
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

/* ==========================================================================
   04 · PAINEL DO PROFESSOR (painel_professor.html)
   ========================================================================== */
function ProfessorScreen({ notify }) {
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

/* ==========================================================================
   05 · TABELA DE CADASTROS (tabela_cadastros.html)
   ========================================================================== */
function CadastrosScreen({ notify }) {
  const [users, setUsers] = useState([
    { id: 1, nome: 'Prof. Marina Costa', email: 'marina@cps.sp.gov.br', perfil: 'PROFESSOR' },
    { id: 2, nome: 'Prof. Carlos Eduardo', email: 'carlos@cps.sp.gov.br', perfil: 'PROFESSOR' },
    { id: 3, nome: 'Coord. Roberto Lima', email: 'roberto@cps.sp.gov.br', perfil: 'ADMIN' },
    { id: 4, nome: 'Lucas Andrade (3º EM A)', email: 'lucas@aluno.cps.sp.gov.br', perfil: 'ALUNO' },
  ]);
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

/* ==========================================================================
   06 · NOVA SALA (form_nova_sala.html)
   ========================================================================== */
function NovaSalaScreen({ rooms, setRooms, go, notify }) {
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

/* ==========================================================================
   07 · CONFIGURAÇÃO DE SALA (config_sala.html)
   ========================================================================== */
function ConfigSalaScreen({ room, notify, go }) {
  const [inicio, setInicio] = useState(room.inicio);
  const [intervalo, setIntervalo] = useState(String(room.intervalo));
  return (
    <View style={st.section}>
      <View style={st.eyebrow}><Text style={st.eyebrowTxt}>PARÂMETROS DO MOTOR</Text></View>
      <Text style={st.h2}>CONFIGURAR SALA</Text>
      <View style={st.card}>
        <Text style={st.h3}>{room.nome}</Text>
        <Text style={[st.label, { marginTop: 12 }]}>HORÁRIO DE INÍCIO</Text>
        <TextInput value={inicio} onChangeText={setInicio} style={st.input} />
        <Text style={[st.label, { marginTop: 12 }]}>INTERVALO (MINUTOS)</Text>
        <TextInput value={intervalo} onChangeText={setIntervalo} keyboardType="numeric" style={st.input} />
        <TouchableOpacity onPress={() => { notify('Parâmetros atualizados', 'Recalcule a grade para aplicar.', 'ok'); go('grade'); }} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>SALVAR CONFIGURAÇÕES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ==========================================================================
   08 · LOGIN (form_login.html)
   ========================================================================== */
function LoginScreen({ go, notify }) {
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

/* ==========================================================================
   09 · CADASTRO (form_cadastro.html)
   ========================================================================== */
function CadastroScreen({ go, notify }) {
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

/* ==========================================================================
   ESTILOS BRUTALISTAS INSTITUCIONAIS
   ========================================================================== */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  body: { flex: 1, backgroundColor: C.paper },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.white,
    borderBottomWidth: 3, borderBottomColor: C.ink,
  },
  menuBtn: { padding: 6, justifyContent: 'center' },
  bar: { width: 20, height: 3, backgroundColor: C.ink, marginVertical: 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  xBadge: { width: 24, height: 24, backgroundColor: C.blue, borderWidth: 2, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  xBadgeTxt: { color: C.white, fontWeight: '900', fontSize: 13 },
  brandTxt: { fontSize: 18, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 6 },

  tabStripWrap: { backgroundColor: C.white, borderBottomWidth: 3, borderBottomColor: C.ink },
  tabStrip: { paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  tabPill: { borderWidth: 2, borderColor: C.ink, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.white, marginRight: 6 },
  tabPillOn: { backgroundColor: C.ink },
  tabPillTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.ink },
  tabPillTxtOn: { color: C.white },

  drawer: { backgroundColor: C.white, borderBottomWidth: 3, borderBottomColor: C.ink, padding: 14 },
  drawerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  drawerTitle: { fontFamily: MONO, fontWeight: '700', fontSize: 12, color: C.ink },
  drawerItem: { paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 2, borderBottomColor: C.ink },
  drawerItemOn: { backgroundColor: C.blue },
  drawerItemTxt: { fontFamily: MONO, fontWeight: '700', fontSize: 12, color: C.ink },

  /* 01 Abertura */
  introBox: {
    backgroundColor: C.ink, paddingVertical: 46, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: 6, borderBottomColor: C.ink,
  },
  introCorners: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  cornerTxt: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.iceBright, letterSpacing: 1 },
  lockupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 74, marginBottom: 20 },
  claeWord: { fontSize: 64, fontWeight: '900', color: C.white, letterSpacing: -2, lineHeight: 68 },
  xAmpulheta: { width: 58, height: 64, flexDirection: 'row', borderWidth: 2, borderColor: C.ink },
  xHalfL: { flex: 1, backgroundColor: C.white },
  xHalfR: { flex: 1, backgroundColor: C.iceBright },
  introSubBox: { borderWidth: 2, borderColor: C.white, paddingHorizontal: 12, paddingVertical: 6 },
  introSubTxt: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.white, letterSpacing: 1 },
  replayTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.iceBright },

  /* Seções e cartões */
  section: { padding: 16, borderBottomWidth: 4, borderBottomColor: C.ink },
  eyebrow: { alignSelf: 'flex-start', backgroundColor: C.ice, borderWidth: 3, borderColor: C.ink, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  eyebrowTxt: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.ink },
  h2: { fontSize: 24, fontWeight: '900', color: C.ink, letterSpacing: -0.6, marginBottom: 12, borderBottomWidth: 5, borderBottomColor: C.blue, paddingBottom: 4, alignSelf: 'flex-start' },
  h3: { fontSize: 16, fontWeight: '900', color: C.ink, marginBottom: 4 },
  p: { fontSize: 13, color: C.ink, lineHeight: 19 },
  bullet: { fontSize: 13, color: C.ink, marginTop: 6, fontWeight: '600' },
  label: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.ink, letterSpacing: 0.5 },
  monoMeta: { fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 4 },

  card: {
    backgroundColor: C.white, borderWidth: 3, borderColor: C.ink, padding: 14,
    shadowColor: C.ink, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },

  /* Rede neural */
  neuralBoard: { backgroundColor: C.white, borderWidth: 3, borderColor: C.ink, padding: 12, marginBottom: 12 },
  neuralRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  neuralNode: { flex: 1, borderWidth: 3, borderColor: C.ink, padding: 8, backgroundColor: C.white, opacity: 0.65 },
  neuralNodeNum: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.blue },
  neuralNodeTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.ink, marginTop: 2 },
  neuralLinesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  neuralConnector: { flex: 1, height: 4, backgroundColor: C.slate },
  neuralConnectorOn: { backgroundColor: C.blue },
  neuralCore: { width: 76, height: 76, backgroundColor: C.ink, borderWidth: 4, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  neuralCoreX: { color: C.iceBright, fontSize: 26, fontWeight: '900' },
  neuralCoreLbl: { fontFamily: MONO, color: C.white, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  stepNumBig: { fontSize: 32, fontWeight: '900', color: C.blue },
  stepNumSub: { fontFamily: MONO, fontSize: 14, color: C.ink },
  progressTrack: { height: 14, borderWidth: 2, borderColor: C.ink, backgroundColor: C.white, marginTop: 10 },
  progressFill: { height: '100%', backgroundColor: C.blue },
  stepNavRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },

  /* Exemplo */
  exStepList: { gap: 6, marginBottom: 12 },
  exStepBtn: { borderWidth: 3, borderColor: C.ink, padding: 10, backgroundColor: C.white },
  exStepBtnOn: { backgroundColor: C.ice },
  exStepBtnTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.ink },
  meterRow: { flexDirection: 'row' },
  metricBig: { fontSize: 30, fontWeight: '900', color: C.ink, marginTop: 2 },
  calHead: { fontWeight: '900', fontSize: 13, color: C.ink, marginBottom: 8 },
  gridHeader: { flexDirection: 'row', gap: 3, marginBottom: 3 },
  gridDay: { flex: 1, backgroundColor: C.ink, color: C.white, fontFamily: MONO, fontSize: 10, fontWeight: '700', textAlign: 'center', paddingVertical: 5 },
  gridRow: { flexDirection: 'row', gap: 3, marginBottom: 3, alignItems: 'center' },
  gridHr: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.ink, textAlign: 'center' },
  gridEmpty: { flex: 1, height: 32, backgroundColor: C.paper, borderWidth: 1, borderStyle: 'dashed', borderColor: C.muted },
  gridCell: { flex: 1, height: 32, borderWidth: 2, borderColor: C.ink, backgroundColor: C.white, justifyContent: 'center', paddingHorizontal: 3 },
  gridCellGhost: { backgroundColor: 'transparent', borderStyle: 'dashed', opacity: 0.45 },
  gridCellTxt: { fontFamily: MONO, fontSize: 8, fontWeight: '700', color: C.ink, textTransform: 'uppercase' },

  /* Perfis & Equipe */
  roleTabs: { flexDirection: 'row', borderWidth: 3, borderColor: C.ink, marginBottom: 12 },
  roleTab: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: C.white, borderRightWidth: 2, borderRightColor: C.ink },
  roleTabOn: { backgroundColor: C.ink },
  roleTabTxt: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.ink },
  monoAvatar: { width: 56, height: 56, backgroundColor: C.blue, borderWidth: 3, borderColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  monoAvatarTxt: { color: C.white, fontSize: 18, fontWeight: '900' },
  roleTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.blue },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagIce: { backgroundColor: C.ice, borderWidth: 2, borderColor: C.ink, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  tagIceTxt: { fontFamily: MONO, fontSize: 10, fontWeight: '700', color: C.ink },

  /* KPIs & Controles */
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  kpiCard: { width: '48%', backgroundColor: C.white, borderWidth: 3, borderColor: C.ink, padding: 10 },
  kpiLbl: { fontFamily: MONO, fontSize: 9, fontWeight: '700', color: C.muted },
  kpiVal: { fontSize: 22, fontWeight: '900', color: C.ink, marginVertical: 2 },
  kpiSub: { fontSize: 10, color: C.muted },
  dayToggle: { flex: 1, borderWidth: 2, borderColor: C.ink, paddingVertical: 10, alignItems: 'center', backgroundColor: C.white },
  dayToggleOn: { backgroundColor: C.blue },
  dayToggleTxt: { fontFamily: MONO, fontSize: 11, fontWeight: '700', color: C.ink },

  /* Formulários e botões */
  input: { borderWidth: 3, borderColor: C.ink, backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 8, fontFamily: MONO, fontSize: 12, color: C.ink, marginTop: 4 },
  btnBlue: { backgroundColor: C.blue, borderWidth: 3, borderColor: C.ink, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  btnBlueTxt: { fontFamily: MONO, color: C.white, fontWeight: '700', fontSize: 12 },
  btnGhost: { backgroundColor: C.white, borderWidth: 3, borderColor: C.ink, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  btnGhostTxt: { fontFamily: MONO, color: C.ink, fontWeight: '700', fontSize: 12 },
  btnBlueSm: { backgroundColor: C.blue, borderWidth: 2, borderColor: C.ink, paddingVertical: 6, paddingHorizontal: 10 },
  btnBlueSmTxt: { fontFamily: MONO, color: C.white, fontWeight: '700', fontSize: 10 },
  btnGhostSm: { backgroundColor: C.white, borderWidth: 2, borderColor: C.ink, paddingVertical: 6, paddingHorizontal: 10 },
  btnGhostSmTxt: { fontFamily: MONO, color: C.ink, fontWeight: '700', fontSize: 10 },
  linkBlue: { fontFamily: MONO, color: C.blue, fontWeight: '700', fontSize: 11, textDecorationLine: 'underline' },

  /* Rodapé & Toast */
  footer: { backgroundColor: C.ink, padding: 20, marginTop: 24, borderTopWidth: 6, borderTopColor: C.ink },
  footerBrand: { color: C.iceBright, fontSize: 18, fontWeight: '900' },
  footerSub: { color: C.slate, fontSize: 12, marginTop: 6 },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 },
  footerLink: { fontFamily: MONO, color: C.white, fontSize: 11, fontWeight: '700' },
  footerCopy: { fontFamily: MONO, color: C.slate, fontSize: 10, marginTop: 16 },
  toast: { position: 'absolute', bottom: 16, left: 14, right: 14, backgroundColor: C.white, borderWidth: 3, borderColor: C.ink, borderLeftWidth: 12, borderLeftColor: C.ice, padding: 12 },
  toastTag: { fontFamily: MONO, fontSize: 9, fontWeight: '700', color: C.ink, backgroundColor: C.ice, alignSelf: 'flex-start', paddingHorizontal: 5 },
  toastTitle: { fontSize: 14, fontWeight: '900', color: C.ink, marginTop: 4 },
  toastMsg: { fontSize: 12, color: C.ink, marginTop: 2 },
});
