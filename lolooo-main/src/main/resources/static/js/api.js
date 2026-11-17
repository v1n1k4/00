/**
 * CLAEX API CLIENT BRIDGE & ROLE-BASED ACCESS CONTROL (RBAC)
 *
 * Regras de Perfil:
 * - administrador / escola (ADM): Acesso total (criar/editar/deletar salas, gerar grades, gerenciar cadastros, ver tudo).
 * - professor: Pode cadastrar/gerenciar apenas suas próprias informações (disponibilidade e matérias) no Painel do Professor e APENAS visualizar as salas e a grade.
 * - aluno: Pode APENAS visualizar as salas e a grade (sem criar, editar, deletar ou acessar painéis restritos).
 */
(function () {
    'use strict';
    let usuarioAtual = null;

    function isAdminRole(tipo) {
        const t = (tipo || '').toLowerCase();
        return t === 'administrador' || t === 'admin' || t === 'escola';
    }

    function isProfessorRole(tipo) {
        return (tipo || '').toLowerCase() === 'professor';
    }

    function isAlunoRole(tipo) {
        return (tipo || '').toLowerCase() === 'aluno';
    }

    window.API = {
        getUsuarioAtual() {
            if (!usuarioAtual) {
                const salvo = sessionStorage.getItem('claex_user');
                if (salvo) {
                    try { usuarioAtual = JSON.parse(salvo); } catch (e) { usuarioAtual = null; }
                }
            }
            return usuarioAtual;
        },

        setUsuarioAtual(user) {
            usuarioAtual = user;
            sessionStorage.setItem('claex_user', JSON.stringify(user));
        },

        logout() {
            usuarioAtual = null;
            sessionStorage.removeItem('claex_user');
            window.location.href = 'form_login.html';
        },

        isAdmin() {
            const u = window.API.getUsuarioAtual();
            return u ? isAdminRole(u.tipo) : false;
        },

        isProfessor() {
            const u = window.API.getUsuarioAtual();
            return u ? isProfessorRole(u.tipo) : false;
        },

        isAluno() {
            const u = window.API.getUsuarioAtual();
            return u ? isAlunoRole(u.tipo) : false;
        },

        // Proteção de rotas no Frontend por perfil
        protegerPagina(tiposPermitidos = []) {
            const user = window.API.getUsuarioAtual();

            if (!user) {
                alert("Acesso restrito. Faça login para continuar.");
                window.location.href = "form_login.html";
                return false;
            }

            const tipoUser = (user.tipo || '').toLowerCase();
            // Normaliza sinônimos de ADM
            const permitidos = tiposPermitidos.map(t => t.toLowerCase());
            const aceitaAdmin = permitidos.includes('administrador') || permitidos.includes('escola') || permitidos.includes('admin');

            if (permitidos.length > 0) {
                const autorizado = permitidos.includes(tipoUser) || (aceitaAdmin && isAdminRole(tipoUser));
                if (!autorizado) {
                    alert("Acesso restrito: seu perfil (" + user.tipo.toUpperCase() + ") não possui permissão para acessar esta página.");
                    if (isProfessorRole(tipoUser)) {
                        window.location.href = "painel_professor.html";
                    } else {
                        window.location.href = "listar_sala.html";
                    }
                    return false;
                }
            }
            return true;
        },

        // Aplica as restrições visuais e de navegação em qualquer página de acordo com o perfil logado
        aplicarPermissoesUI() {
            const user = window.API.getUsuarioAtual();
            const tipo = user ? (user.tipo || '').toLowerCase() : null;
            const admin = isAdminRole(tipo);
            const prof = isProfessorRole(tipo);
            const aluno = isAlunoRole(tipo);

            // 1. Atualiza o header-actions com status do usuário
            const headerActions = document.querySelector(".header-actions");
            if (headerActions) {
                if (user) {
                    const badgeLabel = admin ? 'ADM' : (prof ? 'PROFESSOR' : 'ALUNO');
                    headerActions.innerHTML = `
                        <span style="font-size: 0.82rem; color: var(--neon-lime); font-family: var(--font-mono); margin-right: 6px;">
                            ${user.nome} [${badgeLabel}]
                        </span>
                        ${(prof || admin) ? '<a href="painel_professor.html" class="btn-ghost" style="padding: 8px 14px; font-size: 0.82rem;">Minhas Infos</a>' : ''}
                        <button id="btn-sair-header" type="button" class="btn-ghost" style="color: #ff6666; border-color: rgba(255,59,48,0.3); cursor: pointer; padding: 8px 14px; font-size: 0.82rem;">Sair</button>
                    `;
                } else {
                    headerActions.innerHTML = `
                        <a href="form_login.html" class="btn-ghost">Entrar</a>
                        <a href="form_cadastro.html" class="btn-neon">Criar conta</a>
                    `;
                }
            }

            // 2. Remove links quebrados/estranhos ("mat") ou restritos na barra e menu lateral
            document.querySelectorAll("a[href='painel_professor.html']").forEach(el => {
                if (el.textContent.trim().toLowerCase() === 'mat') {
                    el.textContent = 'Área do Professor';
                }
                if (!prof && !admin) {
                    el.style.display = 'none';
                }
            });

            // 3. Se NÃO for ADM (ou seja, Professor, Aluno ou Visitante), oculta tudo que é exclusivo de ADM
            if (!admin) {
                const seletoresAdmin = [
                    "a[href='form_nova_sala.html']",
                    "a[href^='config_sala.html']",
                    "a[href='tabela_cadastros.html']",
                    "#btn_gerar_grade",
                    "#link_alterar_sala",
                    "#btn_excluir_sala",
                    ".btn-add-materia",
                    ".admin-only"
                ];
                document.querySelectorAll(seletoresAdmin.join(", ")).forEach(el => {
                    el.style.display = "none";
                });
            }
        },

        // Endpoints de Cadastros e Autenticação
        cadastros: {
            async salvar(nome, email, senha, tipo) {
                const params = new URLSearchParams({ nome, email, senha, tipo });
                const response = await fetch(`/form_cadastro-html/salvar?${params.toString()}`, { method: 'POST' });
                const text = await response.text();
                return { ok: response.ok, msg: text, status: response.status };
            },
            async listar() {
                const response = await fetch('/form_cadastro-html/listar');
                if (!response.ok) throw new Error('Erro ao listar cadastros');
                return await response.json();
            },
            async atualizar(id, nome, senha, tipo) {
                const params = new URLSearchParams({ nome, senha, tipo });
                const response = await fetch(`/form_cadastro-html/atualizar/${id}?${params.toString()}`, { method: 'PUT' });
                return { ok: response.ok, status: response.status };
            },
            async deletar(id) {
                const response = await fetch(`/form_cadastro-html/deletar/${id}`, { method: 'DELETE' });
                return { ok: response.ok, status: response.status };
            }
        },

        async login(login, senha) {
            const params = new URLSearchParams({ login, senha });
            const response = await fetch(`/login/entrar?${params.toString()}`, { method: 'POST' });
            let data = {};
            try { data = await response.json(); } catch (e) {}
            if (response.ok) {
                window.API.setUsuarioAtual(data);
            }
            return { ok: response.ok, status: response.status, data: data };
        },

        // Endpoints da Área do Professor (Disponibilidade e Matérias próprias)
        professorArea: {
            async listarDisponibilidade() {
                const user = window.API.getUsuarioAtual();
                const idProf = user && user.id ? `?idProfessor=${user.id}` : '';
                const res = await fetch(`/professor/disponibilidade${idProf}`);
                if (!res.ok) throw new Error(await res.text());
                return await res.json();
            },
            async salvarDisponibilidade(payload) {
                const user = window.API.getUsuarioAtual();
                const body = Object.assign({}, payload, { idProfessor: user ? user.id : null });
                const res = await fetch('/professor/disponibilidade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const text = await res.text();
                return { ok: res.ok, msg: text };
            },
            async deletarDisponibilidade(id) {
                const user = window.API.getUsuarioAtual();
                const idProf = user && user.id ? `?idProfessor=${user.id}` : '';
                const res = await fetch(`/professor/disponibilidade/${id}${idProf}`, { method: 'DELETE' });
                return { ok: res.ok };
            },
            async listarMaterias() {
                const user = window.API.getUsuarioAtual();
                const idProf = user && user.id ? `?idProfessor=${user.id}` : '';
                const res = await fetch(`/professor/materias${idProf}`);
                if (!res.ok) throw new Error(await res.text());
                return await res.json();
            },
            async vincularMateria(payload) {
                const user = window.API.getUsuarioAtual();
                const body = Object.assign({}, payload, { idProfessor: user ? user.id : null });
                const res = await fetch('/professor/materias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const text = await res.text();
                return { ok: res.ok, msg: text };
            },
            async desvincularMateria(id) {
                const user = window.API.getUsuarioAtual();
                const idProf = user && user.id ? `?idProfessor=${user.id}` : '';
                const res = await fetch(`/professor/materias/${id}${idProf}`, { method: 'DELETE' });
                return { ok: res.ok };
            }
        },

        // Endpoints de Salas
        salas: {
            async listar() {
                const response = await fetch('/salas/listar');
                if (!response.ok) throw new Error('Erro ao listar salas');
                return await response.json();
            },
            async buscarPorId(id) {
                const response = await fetch(`/salas/${id}`);
                if (!response.ok) throw new Error('Sala não encontrada');
                return await response.json();
            },
            async salvar(sala) {
                const response = await fetch('/salas/salvar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sala)
                });
                if (!response.ok) throw new Error('Erro ao salvar sala');
                return await response.json();
            },
            async atualizar(id, sala) {
                const response = await fetch(`/salas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sala)
                });
                if (!response.ok) throw new Error('Erro ao atualizar sala');
                return await response.json();
            },
            async deletar(id) {
                const response = await fetch(`/salas/${id}`, { method: 'DELETE' });
                return { ok: response.ok };
            }
        },

        // Endpoints de Matérias
        materias: {
            async listar() {
                const response = await fetch('/materias/listar');
                if (!response.ok) return [];
                return await response.json();
            }
        },

        // Endpoints de Professores
        professores: {
            async listar() {
                const response = await fetch('/professores/listar');
                if (!response.ok) return [];
                return await response.json();
            }
        },

        // Endpoints de Grade Horária, Otimizador Memético NSGA-II + SA e Orquestrador Multi-Modelo IA
        grade: {
            async buscar(idSala) {
                const response = await fetch(`/grade/buscar/${idSala}`);
                if (!response.ok) throw new Error('Grade não encontrada');
                return await response.json();
            },
            async gerar(idSala, materiasPayload, estrategia = 'memetico-sa') {
                const params = new URLSearchParams({ estrategia });
                const response = await fetch(`/grade/gerargrade/${idSala}?${params.toString()}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(materiasPayload)
                });
                return { ok: response.ok };
            },
            async listarModelosIa() {
                const response = await fetch('/grade/ia/modelos');
                if (!response.ok) return [];
                return await response.json();
            },
            async analisarComIa(idSala, modelo = 'gemini-2.5-pro') {
                const params = new URLSearchParams({ modelo });
                const response = await fetch(`/grade/ia/analisar/${idSala}?${params.toString()}`);
                if (!response.ok) throw new Error('Erro ao analisar grade com IA');
                return await response.json();
            },
            async listarRegrasIa(idSala) {
                const response = await fetch(`/grade/ia/regras/${idSala}`);
                if (!response.ok) return [];
                return await response.json();
            },
            async ensinarRegraIa(idSala, payload) {
                const response = await fetch(`/grade/ia/aprender/${idSala}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('Erro ao registrar aprendizado de IA');
                return await response.json();
            },
            async removerRegraIa(idRegra) {
                const response = await fetch(`/grade/ia/regras/${idRegra}`, { method: 'DELETE' });
                return { ok: response.ok };
            }
        }
    };

    // Listener global para botão Sair e aplicação automática de permissões na UI
    document.addEventListener('click', (e) => {
        const btnSair = e.target.closest('#btn-sair-header');
        if (btnSair) {
            e.preventDefault();
            window.API.logout();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.API.aplicarPermissoesUI());
    } else {
        window.API.aplicarPermissoesUI();
    }
})();
