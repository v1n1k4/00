import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { C, st } from '../theme/tokens';
import { NEURAL_STEPS, TIMETABLE, TEAM } from '../data/mockData';
import NeuralNode from '../components/NeuralNode';

export default function LandingScreen({ go }) {
  const claeW = useRef(new Animated.Value(0)).current;
  const xScale = useRef(new Animated.Value(0.5)).current;
  const subOp = useRef(new Animated.Value(0)).current;

  const [neuralIdx, setNeuralIdx] = useState(0);
  const [exStep, setExStep] = useState(2);
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

      <View style={st.section}>
        <View style={st.eyebrow}><Text style={st.eyebrowTxt}>02 / COMO FUNCIONA</Text></View>
        <Text style={st.h2}>TUDO SE LIGA NO MOTOR.</Text>

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
                    <Text numberOfLines={1} style={[st.gridCellTxt, (tone === 'b' || isBad) && { color: C.white }]}>
                      {isBad ? `! ${subj}` : subj}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

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
