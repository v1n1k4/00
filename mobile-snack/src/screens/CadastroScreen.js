import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { C, st } from '../styles/styles';

export default function CadastroScreen({ go, notify }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [perfil, setPerfil] = useState('ALUNO');

  const cadastrar = () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return notify('Campos obrigatórios', 'Preencha nome, e-mail e senha de acesso.', 'err');
    }
    if (senha.length < 6) {
      return notify('Senha curta', 'Use pelo menos 6 caracteres na senha.', 'err');
    }
    if (senha !== confirmarSenha) {
      return notify('Senhas diferentes', 'A confirmação de senha não confere.', 'err');
    }
    notify('Conta criada', `${nome.trim()} (${perfil})`, 'ok');
    go('form_login');
  };

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
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Escola Estadual ou Prof. Carlos"
          placeholderTextColor={C.muted}
          style={st.input}
        />

        <Text style={[st.label, { marginTop: 12 }]}>E-MAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="seuemail@exemplo.com"
          placeholderTextColor={C.muted}
          style={st.input}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Text style={st.label}>SENHA DE ACESSO</Text>
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Text style={st.linkBlue}>{mostrarSenha ? 'OCULTAR' : 'MOSTRAR'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!mostrarSenha}
          placeholder="Crie uma senha segura (mín. 6 caracteres)"
          placeholderTextColor={C.muted}
          style={st.input}
        />

        <Text style={[st.label, { marginTop: 12 }]}>CONFIRMAR SENHA</Text>
        <TextInput
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarSenha}
          placeholder="Repita a senha digitada"
          placeholderTextColor={C.muted}
          style={st.input}
        />

        <Text style={[st.label, { marginTop: 12 }]}>TIPO DE PERFIL</Text>
        <View style={st.tagsRow}>
          {['ALUNO', 'PROFESSOR', 'ADMIN'].map((p) => (
            <TouchableOpacity key={p} onPress={() => setPerfil(p)} style={[st.tagIce, perfil === p && { backgroundColor: C.blue }]}>
              <Text style={[st.tagIceTxt, perfil === p && { color: C.white }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={cadastrar} style={[st.btnBlue, { marginTop: 16 }]}>
          <Text style={st.btnBlueTxt}>CONCLUIR CADASTRO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => go('form_login')} style={{ marginTop: 12, alignItems: 'center' }}>
          <Text style={st.p}>Já possui uma conta? <Text style={st.linkBlue}>Faça login aqui</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
