/**
 * CLAEX — Conversor da Grade Horária para PDF (.pdf) e Excel (.xlsx / .xls)
 *
 * - PDF: gera arquivo A4 paisagem real via jsPDF + jspdf-autotable (download direto),
 *   com fallback automático para janela de impressão PDF caso esteja 100% offline.
 * - Excel: gera planilha .xlsx nativa via SheetJS (XLSX) com largura automática de
 *   colunas e cabeçalho institucional, com fallback nativo .xls (Excel HTML/XML UTF-8)
 *   caso esteja 100% offline.
 */
(function () {
    'use strict';

    function nomeArquivoSeguro(base, ext) {
        const limpo = String(base || 'Grade_CLAEX')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 48) || 'Grade_CLAEX';
        return `CLAEX_${limpo}.${ext}`;
    }

    function extrairDadosDaTabela() {
        const salaNome = (document.getElementById('nome_sala')?.textContent || 'Turma CLAEX').trim();
        const escolaNome = (document.getElementById('painel_escola_nome')?.textContent || 'Instituição CLAEX').trim();
        const detalhes = (document.getElementById('sala_detalhes')?.textContent || '').trim();
        const tbody = document.getElementById('grade_tbody');
        const trs = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];

        const cabecalho = ['HORÁRIO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA'];
        const linhas = [];

        trs.forEach((tr) => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (!tds.length) return;
            // Linha de feedback vazia
            if (tds.length === 1 && Number(tds[0].getAttribute('colspan')) >= 6) return;
            // Linha de intervalo (colspan=5)
            if (tds.length === 2 && Number(tds[1].getAttribute('colspan')) >= 5) {
                const hora = tds[0].textContent.trim();
                const texto = tds[1].textContent.trim();
                linhas.push([hora, texto, '', '', '', '']);
                return;
            }
            const row = tds.slice(0, 6).map((td, idx) => {
                if (idx === 0) return td.textContent.trim();
                const mat = td.querySelector('.aula-slot-materia')?.textContent?.trim();
                const prof = td.querySelector('.aula-slot-prof')?.textContent?.trim();
                if (mat) return prof ? `${mat}\n(${prof})` : mat;
                return td.textContent.trim() || '—';
            });
            if (row.length) linhas.push(row);
        });

        return { salaNome, escolaNome, detalhes, cabecalho, linhas };
    }

    function baixarBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 500);
    }

    function exportarExcel() {
        const dados = extrairDadosDaTabela();
        if (!dados.linhas.length) {
            alert('Nenhuma grade carregada para exportar. Gere ou selecione uma sala primeiro.');
            return;
        }

        const dataAgora = new Date().toLocaleString('pt-BR');
        const aoa = [
            ['CLAEX — GRADE HORÁRIA INSTITUCIONAL'],
            [`Instituição: ${dados.escolaNome}`, '', `Turma: ${dados.salaNome}`, '', `Exportado em: ${dataAgora}`, ''],
            [dados.detalhes || 'Otimizador Memético NSGA-II + Simulated Annealing', '', '', '', '', ''],
            [],
            dados.cabecalho,
            ...dados.linhas.map(r => r.map(c => c.replace(/\n/g, ' — ')))
        ];

        // 1) Excel nativo .xlsx via SheetJS (quando disponível)
        if (window.XLSX && window.XLSX.utils) {
            const ws = window.XLSX.utils.aoa_to_sheet(aoa);
            ws['!cols'] = [
                { wch: 12 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 28 }
            ];
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }
            ];
            const wb = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(wb, ws, 'Grade Horaria');
            window.XLSX.writeFile(wb, nomeArquivoSeguro(dados.salaNome, 'xlsx'));
            return;
        }

        // 2) Fallback offline: Excel HTML/XML (.xls) com estilos institucionais e UTF-8
        const esc = window.API ? window.API.escapeHtml : (s) => String(s);
        const rowsHtml = dados.linhas.map((r) => {
            const isIntervalo = r[1] && r[1].toUpperCase().includes('INTERVALO');
            if (isIntervalo) {
                return `<tr style="background:#DBEAFE;font-weight:bold;"><td>${esc(r[0])}</td><td colspan="5" align="center">${esc(r[1])}</td></tr>`;
            }
            return `<tr>${r.map((c, i) => `<td${i === 0 ? ' style="font-weight:bold;background:#F1F5F9;"' : ''}>${esc(c).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`;
        }).join('');

        const htmlExcel = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
  th { background: #0F172A; color: #FFFFFF; border: 1px solid #0F172A; padding: 8px; text-transform: uppercase; }
  td { border: 1px solid #334155; padding: 6px 8px; vertical-align: middle; }
</style></head><body>
  <table>
    <tr><th colspan="6" style="font-size:14pt;background:#1E3A8A;">CLAEX — GRADE HORÁRIA (${esc(dados.salaNome)})</th></tr>
    <tr><td colspan="6" style="background:#F1F5F9;"><b>Instituição:</b> ${esc(dados.escolaNome)} | ${esc(dados.detalhes)} | <b>Gerado em:</b> ${esc(dataAgora)}</td></tr>
    <tr>${dados.cabecalho.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
    ${rowsHtml}
  </table>
</body></html>`;

        baixarBlob(new Blob([htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' }), nomeArquivoSeguro(dados.salaNome, 'xls'));
    }

    function exportarPdf() {
        const dados = extrairDadosDaTabela();
        if (!dados.linhas.length) {
            alert('Nenhuma grade carregada para exportar. Gere ou selecione uma sala primeiro.');
            return;
        }

        // 1) PDF nativo A4 Paisagem via jsPDF + AutoTable
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const dataAgora = new Date().toLocaleString('pt-BR');

            // Faixa institucional superior (#0F172A)
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 297, 26, 'F');
            doc.setFillColor(30, 58, 138);
            doc.rect(0, 24, 297, 2, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text(`CLAEX — GRADE HORÁRIA: ${dados.salaNome.toUpperCase()}`, 14, 12);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(219, 234, 254);
            doc.text(`${dados.escolaNome}  |  ${dados.detalhes || 'Otimizador Memético NSGA-II'}  |  Emitido em ${dataAgora}`, 14, 20);

            if (typeof doc.autoTable === 'function') {
                const bodyRows = dados.linhas.map((r) => {
                    if (r[1] && r[1].toUpperCase().includes('INTERVALO')) {
                        return [
                            { content: r[0], styles: { fillColor: [219, 234, 254], fontStyle: 'bold', textColor: [15, 23, 42] } },
                            { content: r[1], colSpan: 5, styles: { fillColor: [219, 234, 254], fontStyle: 'bold', halign: 'center', textColor: [30, 58, 138] } }
                        ];
                    }
                    return r;
                });

                doc.autoTable({
                    startY: 32,
                    head: [dados.cabecalho],
                    body: bodyRows,
                    theme: 'grid',
                    styles: {
                        font: 'helvetica',
                        fontSize: 9,
                        cellPadding: 4,
                        textColor: [15, 23, 42],
                        lineColor: [15, 23, 42],
                        lineWidth: 0.35,
                        valign: 'middle'
                    },
                    headStyles: {
                        fillColor: [15, 23, 42],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 24, halign: 'center', fontStyle: 'bold', fillColor: [241, 245, 249] }
                    },
                    alternateRowStyles: {
                        fillColor: [248, 250, 252]
                    },
                    didDrawPage: () => {
                        doc.setFontSize(8);
                        doc.setTextColor(100, 116, 139);
                        doc.text('CLAEX v10 — Sistema Institucional de Gestão Acadêmica e Otimização de Grades Horárias', 14, 202);
                    }
                });
            }

            doc.save(nomeArquivoSeguro(dados.salaNome, 'pdf'));
            return;
        }

        // 2) Fallback offline: diálogo de impressão / Salvar como PDF nativo do navegador
        window.print();
    }

    window.exportarGradeExcel = exportarExcel;
    window.exportarGradePdf = exportarPdf;
})();
