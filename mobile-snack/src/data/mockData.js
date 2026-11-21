export const PAGES = [
  { id: 'index', label: '01 · Início', short: 'INÍCIO', folder: 'src/screens/LandingScreen.js' },
  { id: 'listar_sala', label: '02 · Salas', short: 'SALAS', folder: 'src/screens/ListarSalaScreen.js' },
  { id: 'grade', label: '03 · Grade', short: 'GRADE', folder: 'src/screens/GradeScreen.js' },
  { id: 'painel_professor', label: '04 · Professor', short: 'PROF.', folder: 'src/screens/ProfessorScreen.js' },
  { id: 'tabela_cadastros', label: '05 · Cadastros', short: 'CADASTROS', folder: 'src/screens/CadastrosScreen.js' },
  { id: 'form_nova_sala', label: '06 · Nova Sala', short: '+ SALA', folder: 'src/screens/NovaSalaScreen.js' },
  { id: 'config_sala', label: '07 · Config Sala', short: 'CONFIG', folder: 'src/screens/ConfigSalaScreen.js' },
  { id: 'form_login', label: '08 · Login', short: 'LOGIN', folder: 'src/screens/LoginScreen.js' },
  { id: 'form_cadastro', label: '09 · Cadastro', short: 'REGISTRO', folder: 'src/screens/CadastroScreen.js' },
];

export const NEURAL_STEPS = [
  { num: '01', name: 'Professores', desc: 'Cada professor informa quando pode dar aula. O motor respeita as janelas de disponibilidade e a carga semanal.' },
  { num: '02', name: 'Salas', desc: 'Salas e laboratórios entram com capacidade e horários livres. Regra simples: uma sala, uma turma por horário.' },
  { num: '03', name: 'Turmas', desc: 'Cada turma traz suas matérias e a quantidade de aulas por dia, sem buracos no meio da grade.' },
  { num: '04', name: 'Regras', desc: 'As restrições viram regras: no máximo 2 aulas seguidas, janelas compactas e equilíbrio entre exatas e humanas.' },
  { num: '05', name: 'Otimizador', desc: 'NSGA-II + Simulated Annealing testam milhares de combinações e ficam só com as melhores.' },
  { num: '06', name: 'Grade Final', desc: 'Resultado: uma grade sem conflitos, que administração, professores e alunos consultam em qualquer lugar.' },
];

export const INITIAL_ROOMS = [
  { id: 1, nome: '3º Ensino Médio A (Integral)', aulasDia: 6, duracao: 50, intervalo: 20, inicio: '07:30', resp: 'Administrador CLAEX' },
  { id: 2, nome: '2º Ensino Médio B (Tecnologia)', aulasDia: 5, duracao: 50, intervalo: 20, inicio: '07:30', resp: 'Administrador CLAEX' },
];

export const TIMETABLE = [
  { hr: '08h', slots: [['Matemática', 'b', 1], null, ['Física', 'l', 2], null, ['Artes', '', 0]] },
  { hr: '09h', slots: [['Matemática', 'b', 0], ['História', 'l', 3], null, ['Química', 'b', 4], ['Artes', '', 0]] },
  { hr: '10h', slots: [['Inglês', 'l', 0], null, ['Biologia', 'b', 5], null, ['Ed. Física', '', 0]] },
  { hr: '11h', slots: [null, ['Geografia', '', 6], ['Biologia', 'b', 0], ['Português', 'l', 7], null] },
];

export const TEAM = [
  { mono: 'VC', num: '#01', name: 'Vini', role: 'Back-End Java, Arquitetura & IA', desc: 'Criação do back-end em Java + Spring Boot, persistência JPA/MySQL, APIs RESTful, integração com IA e o motor CLAEX.', tags: ['Java 17', 'Spring Boot', 'MySQL', 'IA'] },
  { mono: 'DSP', num: '#02', name: 'Daniel', role: 'Desenvolvedor Full-Stack', desc: 'Desenvolvimento de interfaces, integração com APIs e apoio na modelagem dos fluxos escolares.', tags: ['Front-End', 'APIs REST', 'Full-Stack'] },
  { mono: 'SAB', num: '#03', name: 'Samuel', role: 'Desenvolvedor Full-Stack', desc: 'Fluxos de dados escolares ponta a ponta, regras de negócio e experiência do usuário.', tags: ['Spring Data', 'JavaScript', 'UX Flow'] },
];

export const INITIAL_USERS = [
  { id: 1, nome: 'Prof. Marina Costa', email: 'marina@cps.sp.gov.br', perfil: 'PROFESSOR' },
  { id: 2, nome: 'Prof. Carlos Eduardo', email: 'carlos@cps.sp.gov.br', perfil: 'PROFESSOR' },
  { id: 3, nome: 'Coord. Roberto Lima', email: 'roberto@cps.sp.gov.br', perfil: 'ADMIN' },
  { id: 4, nome: 'Lucas Andrade (3º EM A)', email: 'lucas@aluno.cps.sp.gov.br', perfil: 'ALUNO' },
];
