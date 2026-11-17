import asyncio, os, tempfile
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(tempfile.mkdtemp(), "t.db").replace("\\", "/")
import httpx
import main


async def run():
    main.startup()  # cria tabelas e seed (ASGITransport não executa lifespan)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=main.app), base_url="http://t", timeout=30) as c:
        def show(n, r):
            print(n, r.status_code, r.text[:160].replace("\n", " "), flush=True)
            assert r.status_code < 500, f"Erro inesperado em {n}: {r.status_code}"

        show("login", await c.post("/login/entrar", params={"login": "admin@claex.com", "senha": "1234"}))
        show("login errado", await c.post("/login/entrar", params={"login": "admin@claex.com", "senha": "x"}))
        show("cad prof", await c.post("/form_cadastro-html/salvar", params={"nome": "Ana", "email": "a@a.com", "senha": "x", "tipo": "professor"}))
        show("cad dup", await c.post("/form_cadastro-html/salvar", params={"nome": "Ana", "email": "a@a.com", "senha": "x"}))
        mats = (await c.get("/materias/listar")).json()
        profs = (await c.get("/professores/listar")).json()
        print("materias", len(mats), "professores", len(profs), flush=True)

        # Testar novos endpoints v10 de Orquestração Multi-Modelo IA
        r_modelos = await c.get("/grade/ia/modelos")
        show("ia modelos", r_modelos)
        assert len(r_modelos.json()) >= 4

        # Testar geração de grade com estratégia Memética NSGA-II + Simulated Annealing
        payload = [
            {"id_materia": {"id_materia": mats[i % len(mats)]["id_materia"]}, "id_professor": {"id_professor": profs[i % len(profs)]["id_professor"]}}
            for i in range(min(5, len(mats)))
        ]
        r_gerar = await c.post("/grade/gerargrade/1?estrategia=MEMETIC_NSGA2_SA", json=payload)
        show("gerar NSGA-II+SA", r_gerar)
        g = (await c.get("/grade/buscar/1")).json()
        print("grade dias", len(g), "periodos", len(g[0]), flush=True)

        # Testar aprendizado de regra IA e análise com telemetria real
        r_aprender = await c.post("/grade/ia/aprender/1", json={
            "tipo": "FAZER",
            "regra": "Priorizar aulas geminadas de Matemática no início da manhã",
            "materiaAlvo": "Matemática",
            "escopoGlobal": True
        })
        show("ia aprender", r_aprender)

        r_analisar = await c.get("/grade/ia/analisar/1?modelo=gemini-2.5-pro&estrategia=MEMETIC_NSGA2_SA")
        show("ia analisar", r_analisar)
        analise_json = r_analisar.json()
        assert "telemetria" in analise_json, "Telemetria ausente na resposta da IA"
        print("Telemetria Fitness:", analise_json["telemetria"]["fitnessScore"], "Equilibrio Cognitivo:", analise_json["telemetria"]["equilibrioCognitivo"], flush=True)

        # Testar arquivos estáticos modernizados (Design Tokens OKLCH)
        show("oklch tokens css", await c.get("/css/design-tokens-oklch.css"))
        show("static index", await c.get("/"))
        print("ALL V10 SMOKE TESTS PASSED SUCCESSFULLY!", flush=True)

asyncio.run(run())
