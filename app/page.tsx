'use client';

/* V2 GESTOR COMPLETO - Dashboard Executivo, Retenção e Relatórios */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Screen = 'login' | 'admin' | 'reception' | 'teacher';
type LoginTab = 'admin' | 'reception' | 'teacher';
type AdminTab = 'dashboard' | 'students' | 'experimentals' | 'classes' | 'enrollments' | 'attendance' | 'financial';
type ReceptionTab = 'students' | 'experimentals' | 'classes' | 'enrollments' | 'attendance';
type TeacherTab = 'today' | 'students' | 'financial';

type Professor = {
  id: string;
  nome: string;
  esporte: string;
  pin: string;
  percentual: number | null;
  ativo: boolean | null;
};

type Aluno = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  cep: string | null;
  data_inicio: string | null;
  tipo: string | null;
  status: string | null;
  tipo_plano: string | null;
  plano_descricao: string | null;
  plano_valor: number | null;
  professor_id: string | null;
  menor_idade: boolean | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
  responsavel_email: string | null;
  responsavel_cpf: string | null;
  responsavel_endereco: string | null;
  responsavel_cep: string | null;
  created_at?: string | null;
  data_saida?: string | null;
  origem_matricula?: string | null;
  contrato_status?: string | null;
  contrato_url?: string | null;
  data_contrato?: string | null;
};

type Experimental = {
  id: string;
  created_at?: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  modalidade: string | null;
  categoria: string | null;
  professor_id: string | null;
  professor_preferencia: string | null;
  dia_contato: string | null;
  dia_preferido: string | null;
  periodo_preferido: string | null;
  horario_pode_fazer: string | null;
  dia_horario_aula_experimental: string | null;
  fez_aula_experimental: boolean | null;
  entrou_em_contato_apos_aula: boolean | null;
  fechou_plano: boolean | null;
  motivo_nao_fechou: string | null;
  status_lead: string | null;
  follow_up: string | null;
  observacoes: string | null;
};

type Turma = {
  id: string;
  nome: string | null;
  modalidade: string | null;
  categoria: string | null;
  professor_id: string | null;
  dia_semana: string | null;
  horario: string | null;
  quadra: string | null;
  capacidade: number | null;
  ativa: boolean | null;
};

type Matricula = {
  id: string;
  aluno_id: string | null;
  turma_id: string | null;
  tipo: string | null;
  ativa: boolean | null;
};

type Presenca = {
  id: string;
  aluno_id: string | null;
  turma_id: string | null;
  professor_id: string | null;
  data_aula: string | null;
  presente: boolean | null;
  tipo_presenca: string | null;
  observacao: string | null;
};

type Financeiro = {
  id: string;
  aluno_id: string | null;
  professor_id: string | null;
  valor: number | null;
  vencimento: string | null;
  mes: string | null;
  recebido: boolean | null;
  forma_pagamento: string | null;
  status: string | null;
  observacao: string | null;
};

type StudentForm = {
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  data_nascimento: string;
  endereco: string;
  cep: string;
  data_inicio: string;
  status: string;
  tipo_plano: string;
  plano_descricao: string;
  plano_valor: string;
  professor_id: string;
  menor_idade: boolean;
  responsavel_nome: string;
  responsavel_telefone: string;
  responsavel_email: string;
  responsavel_cpf: string;
  responsavel_endereco: string;
  responsavel_cep: string;
};

type ExperimentalForm = {
  nome: string;
  telefone: string;
  email: string;
  modalidade: string;
  categoria: string;
  professor_id: string;
  professor_preferencia: string;
  dia_contato: string;
  dia_preferido: string;
  periodo_preferido: string;
  horario_pode_fazer: string;
  dia_horario_aula_experimental: string;
  fez_aula_experimental: boolean;
  entrou_em_contato_apos_aula: boolean;
  fechou_plano: boolean;
  motivo_nao_fechou: string;
  status_lead: string;
  follow_up: string;
  observacoes: string;
};

type TurmaForm = {
  nome: string;
  modalidade: string;
  categoria: string;
  professor_id: string;
  dia_semana: string;
  horario: string;
  quadra: string;
  capacidade: string;
};

type FinancialForm = {
  aluno_id: string;
  professor_id: string;
  valor: string;
  vencimento: string;
  mes: string;
  recebido: boolean;
  forma_pagamento: string;
  status: string;
  observacao: string;
};

const COLORS = {
  blue: '#3f4097',
  blueDark: '#25266f',
  blueSoft: '#eef0ff',
  green: '#7ed957',
  bg: '#f6f7fb',
  text: '#172033',
  muted: '#637083',
  border: '#dfe3ef',
  danger: '#c0392b',
  warning: '#f39c12',
};

const adminPin = '0000';
const receptionPin = '9999';

const TIMEZONE = 'America/Sao_Paulo';

const BEACH_CATEGORIES = [
  'Iniciante 1',
  'Iniciante 2',
  'Intermediário 1',
  'Intermediário 2',
  'Avançado 1',
  'Avançado 2',
  'Infanto/Juvenil',
];

const FUTE_CATEGORIES = [
  'Aprendiz',
  'Iniciante',
  'Intermediário',
  'Avançado',
  'Infanto/Juvenil',
];

const CLASS_TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

const COURTS = ['Quadra 1', 'Quadra 2', 'Quadra 3'];

function dateBR() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value || '';
  const month = parts.find((part) => part.type === 'month')?.value || '';
  const day = parts.find((part) => part.type === 'day')?.value || '';

  return `${year}-${month}-${day}`;
}

function monthBR() {
  return dateBR().slice(0, 7);
}

function categoryOptions(modalidade?: string | null) {
  return modalidade === 'Futevôlei' ? FUTE_CATEGORIES : BEACH_CATEGORIES;
}

function normalizeText(value?: string | null) {
  return (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function modalityFromPlan(descricao?: string | null) {
  return normalizeText(descricao).includes('fute') ? 'Futevôlei' : 'Beach Tennis';
}

const initialStudentForm: StudentForm = {
  nome: '',
  telefone: '',
  email: '',
  cpf: '',
  data_nascimento: '',
  endereco: '',
  cep: '',
  data_inicio: dateBR(),
  status: 'ativo',
  tipo_plano: 'padrao',
  plano_descricao: '1x por semana',
  plano_valor: '220',
  professor_id: '',
  menor_idade: false,
  responsavel_nome: '',
  responsavel_telefone: '',
  responsavel_email: '',
  responsavel_cpf: '',
  responsavel_endereco: '',
  responsavel_cep: '',
};

const initialExperimentalForm: ExperimentalForm = {
  nome: '',
  telefone: '',
  email: '',
  modalidade: 'Beach Tennis',
  categoria: '',
  professor_id: '',
  professor_preferencia: '',
  dia_contato: dateBR(),
  dia_preferido: '',
  periodo_preferido: '',
  horario_pode_fazer: '',
  dia_horario_aula_experimental: '',
  fez_aula_experimental: false,
  entrou_em_contato_apos_aula: false,
  fechou_plano: false,
  motivo_nao_fechou: '',
  status_lead: 'novo',
  follow_up: '',
  observacoes: '',
};

const initialTurmaForm: TurmaForm = {
  nome: '',
  modalidade: 'Beach Tennis',
  categoria: '',
  professor_id: '',
  dia_semana: '',
  horario: '',
  quadra: '',
  capacidade: '4',
};

const initialFinancialForm: FinancialForm = {
  aluno_id: '',
  professor_id: '',
  valor: '',
  vencimento: dateBR(),
  mes: monthBR(),
  recebido: false,
  forma_pagamento: '',
  status: 'pendente',
  observacao: '',
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCPF(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function maskCEP(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

function formatMoney(value?: number | null) {
  const safeValue = Number(value || 0);
  return safeValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function professorRate(percentual?: number | null) {
  const value = Number(percentual || 0);
  if (!Number.isFinite(value)) return 0;
  return value <= 1 ? value : value / 100;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function sameMonth(dateValue?: string | null, monthValue = monthBR()) {
  if (!dateValue) return false;
  return dateValue.slice(0, 7) === monthValue;
}

function monthLabel(monthValue = monthBR()) {
  const [year, month] = monthValue.split('-');
  if (!year || !month) return monthValue;
  return `${month}/${year}`;
}

function getProfessorName(professores: Professor[], id?: string | null) {
  return professores.find((prof) => prof.id === id)?.nome || '-';
}

function getAlunoName(alunos: Aluno[], id?: string | null) {
  return alunos.find((aluno) => aluno.id === id)?.nome || '-';
}

function getTurmaName(turmas: Turma[], id?: string | null) {
  const turma = turmas.find((item) => item.id === id);
  if (!turma) return '-';
  return `${turma.nome || 'Turma'} • ${turma.dia_semana || '-'} ${turma.horario || ''}`;
}

function getLeadStatus(item: Experimental) {
  if (item.fechou_plano) return 'Fechado';
  if (item.fez_aula_experimental && item.entrou_em_contato_apos_aula) return 'Morno';
  if (item.fez_aula_experimental && !item.entrou_em_contato_apos_aula) return 'Quente';
  return item.status_lead || 'Novo';
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('login');
  const [loginTab, setLoginTab] = useState<LoginTab>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [receptionTab, setReceptionTab] = useState<ReceptionTab>('experimentals');
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('today');

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [experimentais, setExperimentais] = useState<Experimental[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>([]);

  const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null);

  const [studentForm, setStudentForm] = useState<StudentForm>(initialStudentForm);
  const [experimentalForm, setExperimentalForm] = useState<ExperimentalForm>(initialExperimentalForm);
  const [turmaForm, setTurmaForm] = useState<TurmaForm>(initialTurmaForm);
  const [financialForm, setFinancialForm] = useState<FinancialForm>(initialFinancialForm);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingExperimentalId, setEditingExperimentalId] = useState<string | null>(null);
  const [editingTurmaId, setEditingTurmaId] = useState<string | null>(null);
  const [editingFinancialId, setEditingFinancialId] = useState<string | null>(null);

  const [matriculaAlunoId, setMatriculaAlunoId] = useState('');
  const [matriculaTurmaId, setMatriculaTurmaId] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmBox, setConfirmBox] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);

  function notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }

  function askConfirmation(title: string, message: string, onConfirm: () => void) {
    setConfirmBox({ title, message, onConfirm });
  }

  async function loadAllData() {
    setLoading(true);

    const [
      professoresRes,
      alunosRes,
      experimentaisRes,
      turmasRes,
      matriculasRes,
      presencasRes,
      financeiroRes,
    ] = await Promise.all([
      supabase.from('professores').select('*').order('nome'),
      supabase.from('alunos').select('*').order('nome'),
      supabase.from('experimentais').select('*').order('created_at', { ascending: false }),
      supabase.from('turmas').select('*').order('dia_semana'),
      supabase.from('matriculas').select('*').order('created_at', { ascending: false }),
      supabase.from('presencas').select('*').order('created_at', { ascending: false }),
      supabase.from('financeiro').select('*').order('created_at', { ascending: false }),
    ]);

    setProfessores((professoresRes.data || []) as Professor[]);
    setAlunos((alunosRes.data || []) as Aluno[]);
    setExperimentais((experimentaisRes.data || []) as Experimental[]);
    setTurmas((turmasRes.data || []) as Turma[]);
    setMatriculas((matriculasRes.data || []) as Matricula[]);
    setPresencas((presencasRes.data || []) as Presenca[]);
    setFinanceiro((financeiroRes.data || []) as Financeiro[]);

    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const activeAlunos = useMemo(() => {
    return alunos.filter((aluno) => aluno.status !== 'inativo');
  }, [alunos]);

  const activeTurmas = useMemo(() => {
    return turmas.filter((turma) => turma.ativa !== false);
  }, [turmas]);

  const teacherTurmas = useMemo(() => {
    if (!currentProfessor) return [];
    return activeTurmas.filter((turma) => turma.professor_id === currentProfessor.id);
  }, [activeTurmas, currentProfessor]);

  const teacherAlunos = useMemo(() => {
    if (!currentProfessor) return [];
    return activeAlunos.filter((aluno) => aluno.professor_id === currentProfessor.id);
  }, [activeAlunos, currentProfessor]);

  const totalReceber = useMemo(() => {
    return financeiro.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }, [financeiro]);

  const totalRecebido = useMemo(() => {
    return financeiro
      .filter((item) => item.recebido)
      .reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }, [financeiro]);

  const professoresAtivos = useMemo(() => {
    return professores.filter((professor) => {
      if (professor.ativo === false) return false;
      const nome = normalizeText(professor.nome);
      return !nome.includes('joao jose') && !nome.includes('joão josé');
    });
  }, [professores]);

  function professoresPorModalidade(modalidade?: string | null) {
    const alvo = normalizeText(modalidade || '');
    if (!alvo) return professoresAtivos;

    return professoresAtivos.filter((professor) => {
      const esporte = normalizeText(professor.esporte);
      if (alvo.includes('fute')) return esporte.includes('fute');
      if (alvo.includes('beach')) return esporte.includes('beach');
      return true;
    });
  }

  const alunosPorProfessor = useMemo(() => {
    const grupos: { professorId: string; professorNome: string; alunos: Aluno[] }[] = [];

    professoresAtivos.forEach((professor) => {
      grupos.push({
        professorId: professor.id,
        professorNome: professor.nome,
        alunos: alunos
          .filter((aluno) => aluno.professor_id === professor.id)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      });
    });

    const semProfessor = alunos
      .filter((aluno) => !aluno.professor_id || !professoresAtivos.some((prof) => prof.id === aluno.professor_id))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (semProfessor.length > 0) {
      grupos.push({ professorId: 'sem-professor', professorNome: 'Sem professor definido', alunos: semProfessor });
    }

    return grupos.filter((grupo) => grupo.alunos.length > 0);
  }, [alunos, professoresAtivos]);


  const dashboardMetrics = useMemo(() => {
    const currentMonth = monthBR();
    const alunosAtivos = alunos.filter((aluno) => aluno.status !== 'inativo');
    const alunosInativos = alunos.filter((aluno) => aluno.status === 'inativo');
    const entradasMes = alunos.filter((aluno) => sameMonth(aluno.created_at || aluno.data_inicio, currentMonth));
    const saidasMes = alunos.filter((aluno) => sameMonth(aluno.data_saida, currentMonth) || (aluno.status === 'inativo' && sameMonth(aluno.created_at, currentMonth)));
    const baseInicioMes = Math.max(alunosAtivos.length + saidasMes.length - entradasMes.length, 0);
    const retencao = baseInicioMes > 0 ? ((baseInicioMes - saidasMes.length) / baseInicioMes) * 100 : 100;
    const evasao = baseInicioMes > 0 ? (saidasMes.length / baseInicioMes) * 100 : 0;

    const recebidosMes = financeiro.filter((item) => item.recebido && sameMonth(item.mes || item.vencimento, currentMonth));
    const pendentesMes = financeiro.filter((item) => !item.recebido && sameMonth(item.mes || item.vencimento, currentMonth));
    const previstosMes = financeiro.filter((item) => sameMonth(item.mes || item.vencimento, currentMonth));

    const receitaRecebida = recebidosMes.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const receitaPendente = pendentesMes.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const receitaPrevista = previstosMes.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const inadimplentes = alunosAtivos.filter((aluno) => aluno.status === 'inadimplente').length;

    const experimentaisMes = experimentais.filter((item) => sameMonth(item.created_at || item.dia_contato, currentMonth));
    const fizeramExperimental = experimentaisMes.filter((item) => item.fez_aula_experimental).length;
    const fecharamExperimental = experimentaisMes.filter((item) => item.fechou_plano).length;
    const conversaoExperimental = fizeramExperimental > 0 ? (fecharamExperimental / fizeramExperimental) * 100 : 0;

    const porModalidade = {
      beach: alunosAtivos.filter((aluno) => modalityFromPlan(aluno.plano_descricao) === 'Beach Tennis').length,
      fute: alunosAtivos.filter((aluno) => modalityFromPlan(aluno.plano_descricao) === 'Futevôlei').length,
    };

    const porProfessor = professoresAtivos.map((professor) => {
      const alunosProfessor = alunosAtivos.filter((aluno) => aluno.professor_id === professor.id);
      const financeirosProfessor = previstosMes.filter((item) => item.professor_id === professor.id);
      const recebido = financeirosProfessor.filter((item) => item.recebido).reduce((sum, item) => sum + Number(item.valor || 0), 0);
      const pendente = financeirosProfessor.filter((item) => !item.recebido).reduce((sum, item) => sum + Number(item.valor || 0), 0);
      const rate = professorRate(professor.percentual);
      return {
        professor,
        alunos: alunosProfessor.length,
        recebido,
        pendente,
        comissao: recebido * rate,
        arena: recebido * (1 - rate),
        conversoes: experimentaisMes.filter((item) => item.professor_id === professor.id && item.fechou_plano).length,
      };
    });

    return {
      currentMonth,
      alunosAtivos: alunosAtivos.length,
      alunosInativos: alunosInativos.length,
      entradasMes: entradasMes.length,
      saidasMes: saidasMes.length,
      saldoMes: entradasMes.length - saidasMes.length,
      retencao,
      evasao,
      receitaPrevista,
      receitaRecebida,
      receitaPendente,
      inadimplentes,
      experimentaisMes: experimentaisMes.length,
      fizeramExperimental,
      fecharamExperimental,
      conversaoExperimental,
      porModalidade,
      porProfessor,
    };
  }, [alunos, financeiro, experimentais, professoresAtivos]);

  function logout() {
    setScreen('login');
    setPin('');
    setPinError('');
    setCurrentProfessor(null);
  }

  function handleLogin() {
    setPinError('');

    if (loginTab === 'admin') {
      if (pin === adminPin) {
        setScreen('admin');
        setAdminTab('dashboard');
        setPin('');
        return;
      }
      setPinError('PIN de admin incorreto.');
      return;
    }

    if (loginTab === 'reception') {
      if (pin === receptionPin) {
        setScreen('reception');
        setReceptionTab('experimentals');
        setPin('');
        return;
      }
      setPinError('PIN da recepção incorreto.');
      return;
    }

    const professor = professores.find((item) => item.pin === pin && item.ativo !== false);

    if (professor) {
      setCurrentProfessor(professor);
      setScreen('teacher');
      setTeacherTab('today');
      setPin('');
      return;
    }

    setPinError('PIN de professor não encontrado.');
  }

  async function saveStudent() {
    if (!studentForm.nome.trim()) {
      notify('Preencha o nome do aluno.', 'error');
      return;
    }

    const planoValor =
      studentForm.plano_valor.trim() === '' ? 0 : Number(studentForm.plano_valor.replace(',', '.'));

    const payload = {
      nome: studentForm.nome.trim(),
      telefone: studentForm.telefone || null,
      email: studentForm.email || null,
      cpf: studentForm.cpf || null,
      data_nascimento: studentForm.data_nascimento || null,
      endereco: studentForm.endereco || null,
      cep: studentForm.cep || null,
      data_inicio: studentForm.data_inicio || null,
      tipo: 'fixo',
      status: studentForm.status || 'ativo',
      tipo_plano: studentForm.tipo_plano,
      plano_descricao: studentForm.plano_descricao || null,
      plano_valor: planoValor,
      professor_id: studentForm.professor_id || null,
      menor_idade: studentForm.menor_idade,
      responsavel_nome: studentForm.menor_idade ? studentForm.responsavel_nome || null : null,
      responsavel_telefone: studentForm.menor_idade ? studentForm.responsavel_telefone || null : null,
      responsavel_email: studentForm.menor_idade ? studentForm.responsavel_email || null : null,
      responsavel_cpf: studentForm.menor_idade ? studentForm.responsavel_cpf || null : null,
      responsavel_endereco: studentForm.menor_idade ? studentForm.responsavel_endereco || null : null,
      responsavel_cep: studentForm.menor_idade ? studentForm.responsavel_cep || null : null,
    };

    if (editingStudentId) {
      const { error } = await supabase.from('alunos').update(payload).eq('id', editingStudentId);

      if (error) {
        notify(`Erro ao atualizar aluno: ${error.message}`, 'error');
        return;
      }

      setEditingStudentId(null);
      setStudentForm(initialStudentForm);
      await loadAllData();
      notify('Aluno atualizado com sucesso.', 'success');
      return;
    }

    const { data: alunoCriado, error } = await supabase
      .from('alunos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      notify(`Erro ao salvar aluno: ${error.message}`, 'error');
      return;
    }

    if (alunoCriado && planoValor > 0) {
      const hoje = new Date();
      const mes = hoje.toISOString().slice(0, 7);
      const vencimento = `${mes}-10`;

      const { error: financeiroError } = await supabase.from('financeiro').insert({
        aluno_id: alunoCriado.id,
        professor_id: studentForm.professor_id || null,
        valor: planoValor,
        vencimento,
        mes,
        recebido: false,
        forma_pagamento: null,
        status: 'pendente',
        observacao: `Mensalidade gerada automaticamente - ${studentForm.plano_descricao || 'Plano'}`,
      });

      if (financeiroError) {
        notify(`Aluno salvo, mas houve erro ao gerar financeiro: ${financeiroError.message}`, 'error');
      }
    }

    setStudentForm(initialStudentForm);
    await loadAllData();
    notify('Aluno salvo com sucesso.', 'success');
  }

  async function saveExperimental() {
    if (!experimentalForm.nome.trim()) {
      notify('Preencha o nome do aluno experimental.', 'error');
      return;
    }

    const payload = {
      nome: experimentalForm.nome.trim(),
      telefone: experimentalForm.telefone || null,
      email: experimentalForm.email || null,
      modalidade: experimentalForm.modalidade || null,
      categoria: experimentalForm.categoria || null,
      professor_id: experimentalForm.professor_id || null,
      professor_preferencia: experimentalForm.professor_preferencia || null,
      dia_contato: experimentalForm.dia_contato || null,
      dia_preferido: experimentalForm.dia_preferido || null,
      periodo_preferido: experimentalForm.periodo_preferido || null,
      horario_pode_fazer: experimentalForm.horario_pode_fazer || null,
      dia_horario_aula_experimental: experimentalForm.dia_horario_aula_experimental || null,
      fez_aula_experimental: experimentalForm.fez_aula_experimental,
      entrou_em_contato_apos_aula: experimentalForm.entrou_em_contato_apos_aula,
      fechou_plano: experimentalForm.fechou_plano,
      motivo_nao_fechou: experimentalForm.motivo_nao_fechou || null,
      status_lead: experimentalForm.status_lead || 'novo',
      follow_up: experimentalForm.follow_up || null,
      observacoes: experimentalForm.observacoes || null,
    };

    const query = editingExperimentalId
      ? supabase.from('experimentais').update(payload).eq('id', editingExperimentalId)
      : supabase.from('experimentais').insert(payload);

    const { error } = await query;

    if (error) {
      notify(`Erro ao salvar experimental: ${error.message}`, 'error');
      return;
    }

    setEditingExperimentalId(null);
    setExperimentalForm(initialExperimentalForm);
    await loadAllData();
    notify(editingExperimentalId ? 'Experimental atualizado com sucesso.' : 'Experimental salvo com sucesso.', 'success');
  }

  async function saveTurma() {
    if (!turmaForm.nome.trim()) {
      notify('Preencha o nome da turma.', 'error');
      return;
    }

    const payload = {
      nome: turmaForm.nome.trim(),
      modalidade: turmaForm.modalidade || null,
      categoria: turmaForm.categoria || null,
      professor_id: turmaForm.professor_id || null,
      dia_semana: turmaForm.dia_semana || null,
      horario: turmaForm.horario || null,
      quadra: turmaForm.quadra || null,
      capacidade: Number(turmaForm.capacidade || 4),
      ativa: true,
    };

    const query = editingTurmaId
      ? supabase.from('turmas').update(payload).eq('id', editingTurmaId)
      : supabase.from('turmas').insert(payload);

    const { error } = await query;

    if (error) {
      notify(`Erro ao salvar turma: ${error.message}`, 'error');
      return;
    }

    setEditingTurmaId(null);
    setTurmaForm(initialTurmaForm);
    await loadAllData();
    notify(editingTurmaId ? 'Turma atualizada com sucesso.' : 'Turma salva com sucesso.', 'success');
  }

  async function saveMatricula() {
    if (!matriculaAlunoId || !matriculaTurmaId) {
      notify('Selecione o aluno e a turma.', 'error');
      return;
    }

    const { error } = await supabase.from('matriculas').insert({
      aluno_id: matriculaAlunoId,
      turma_id: matriculaTurmaId,
      tipo: 'fixo',
      ativa: true,
    });

    if (error) {
      notify(`Erro ao vincular aluno à turma: ${error.message}`, 'error');
      return;
    }

    setMatriculaAlunoId('');
    setMatriculaTurmaId('');
    await loadAllData();
    notify('Aluno vinculado à turma com sucesso.', 'success');
  }

  async function saveFinancial() {
    if (!financialForm.aluno_id || !financialForm.valor) {
      notify('Selecione o aluno e informe o valor.', 'error');
      return;
    }

    const payload = {
      aluno_id: financialForm.aluno_id,
      professor_id: financialForm.professor_id || null,
      valor: Number(financialForm.valor.replace(',', '.')),
      vencimento: financialForm.vencimento || null,
      mes: financialForm.mes || null,
      recebido: financialForm.recebido,
      forma_pagamento: financialForm.forma_pagamento || null,
      status: financialForm.recebido ? 'recebido' : financialForm.status || 'pendente',
      observacao: financialForm.observacao || null,
    };

    const query = editingFinancialId
      ? supabase.from('financeiro').update(payload).eq('id', editingFinancialId)
      : supabase.from('financeiro').insert(payload);

    const { error } = await query;

    if (error) {
      notify(`Erro ao salvar financeiro: ${error.message}`, 'error');
      return;
    }

    setEditingFinancialId(null);
    setFinancialForm(initialFinancialForm);
    await loadAllData();
    notify(editingFinancialId ? 'Lançamento financeiro atualizado.' : 'Lançamento financeiro salvo.', 'success');
  }

  async function convertExperimentalToStudent(item: Experimental) {
    const payload = {
      nome: item.nome,
      telefone: item.telefone,
      email: item.email,
      cpf: null,
      data_nascimento: null,
      endereco: null,
      cep: null,
      data_inicio: dateBR(),
      tipo: 'fixo',
      status: 'ativo',
      tipo_plano: 'padrao',
      plano_descricao: 'Plano padrão',
      plano_valor: null,
      professor_id: item.professor_id,
      menor_idade: false,
      responsavel_nome: null,
      responsavel_telefone: null,
      responsavel_email: null,
      responsavel_cpf: null,
      responsavel_endereco: null,
      responsavel_cep: null,
    };

    const { error } = await supabase.from('alunos').insert(payload);

    if (error) {
      notify(`Erro ao matricular experimental: ${error.message}`, 'error');
      return;
    }

    await supabase
      .from('experimentais')
      .update({
        fechou_plano: true,
        status_lead: 'fechado',
      })
      .eq('id', item.id);

    await loadAllData();
    notify('Experimental convertido em aluno.', 'success');
  }

  async function registerPresence(alunoId: string, turmaId: string, presente: boolean, tipoPresenca = 'normal') {
    const turma = turmas.find((item) => item.id === turmaId);

    const { error } = await supabase.from('presencas').insert({
      aluno_id: alunoId,
      turma_id: turmaId,
      professor_id: turma?.professor_id || currentProfessor?.id || null,
      data_aula: dateBR(),
      presente,
      tipo_presenca: tipoPresenca,
      observacao: null,
    });

    if (error) {
      notify(`Erro ao salvar presença: ${error.message}`, 'error');
      return;
    }

    await loadAllData();
  }

  async function togglePayment(item: Financeiro) {
    const recebido = !item.recebido;

    const { error } = await supabase
      .from('financeiro')
      .update({
        recebido,
        status: recebido ? 'recebido' : 'pendente',
      })
      .eq('id', item.id);

    if (error) {
      notify(`Erro ao atualizar pagamento: ${error.message}`, 'error');
      return;
    }

    await loadAllData();
  }

  async function deleteRecord(table: string, id: string) {
    askConfirmation(
      'Confirmar exclusão',
      'Essa ação não poderá ser desfeita. Deseja realmente excluir este registro?',
      async () => {
        setConfirmBox(null);
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) {
          notify(`Erro ao excluir: ${error.message}`, 'error');
          return;
        }

        await loadAllData();
        notify('Registro excluído com sucesso.', 'success');
      }
    );
  }

  function inputStyle() {
    return {
      height: 42,
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      padding: '0 12px',
      fontSize: 14,
      background: '#fff',
    };
  }

  function textareaStyle() {
    return {
      minHeight: 80,
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      padding: 12,
      fontSize: 14,
      background: '#fff',
      resize: 'vertical' as const,
    };
  }

  function primaryButtonStyle() {
    return {
      height: 44,
      padding: '0 18px',
      borderRadius: 14,
      border: 'none',
      background: COLORS.blue,
      color: '#fff',
      fontWeight: 800,
      cursor: 'pointer',
    };
  }

  function secondaryButtonStyle() {
    return {
      height: 40,
      padding: '0 14px',
      borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      background: '#fff',
      color: COLORS.text,
      fontWeight: 700,
      cursor: 'pointer',
    };
  }

  function activeButtonStyle(active: boolean) {
    return {
      height: 40,
      padding: '0 14px',
      borderRadius: 999,
      border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
      background: active ? COLORS.blue : '#fff',
      color: active ? '#fff' : COLORS.text,
      fontWeight: 800,
      cursor: 'pointer',
    };
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 24,
    border: `1px solid ${COLORS.border}`,
    padding: 20,
    boxShadow: '0 10px 30px rgba(20, 24, 60, 0.06)',
  };

  const thStyle = {
    textAlign: 'left' as const,
    padding: 10,
    fontSize: 12,
    color: COLORS.blueDark,
    background: COLORS.blueSoft,
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: 'nowrap' as const,
  };

  const tdStyle = {
    padding: 10,
    fontSize: 13,
    borderBottom: `1px solid ${COLORS.border}`,
    verticalAlign: 'top' as const,
  };

  function renderLogin() {
    return (
      <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
          <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: COLORS.blue, color: '#fff', padding: '22px 28px', fontSize: 26, fontWeight: 900 }}>
              GESTOR CONEXÃO
            </div>

            <div style={{ padding: 28 }}>
              <h1 style={{ margin: 0, color: COLORS.blue, fontSize: 42, lineHeight: 1.08 }}>
                Operação diária do CT em um só lugar
              </h1>

              <p style={{ color: COLORS.muted, fontSize: 18, lineHeight: 1.5 }}>
                Professores, recepção e administração com acessos separados por PIN.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24 }}>
                <div style={{ background: COLORS.blueSoft, borderRadius: 18, padding: 16 }}>
                  <strong style={{ color: COLORS.blue }}>Admin</strong>
                  <p style={{ color: COLORS.muted, marginBottom: 0 }}>Gestão completa.</p>
                </div>

                <div style={{ background: COLORS.blueSoft, borderRadius: 18, padding: 16 }}>
                  <strong style={{ color: COLORS.blue }}>Recepção</strong>
                  <p style={{ color: COLORS.muted, marginBottom: 0 }}>Alunos e leads.</p>
                </div>

                <div style={{ background: COLORS.blueSoft, borderRadius: 18, padding: 16 }}>
                  <strong style={{ color: COLORS.blue }}>Professor</strong>
                  <p style={{ color: COLORS.muted, marginBottom: 0 }}>Turmas e presença.</p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: COLORS.blue, color: '#fff', padding: '22px 28px', fontSize: 26, fontWeight: 900 }}>
              ENTRAR
            </div>

            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <button style={activeButtonStyle(loginTab === 'admin')} onClick={() => setLoginTab('admin')}>
                  ADMIN
                </button>
                <button style={activeButtonStyle(loginTab === 'reception')} onClick={() => setLoginTab('reception')}>
                  RECEPÇÃO
                </button>
                <button style={activeButtonStyle(loginTab === 'teacher')} onClick={() => setLoginTab('teacher')}>
                  PROFESSORES
                </button>
              </div>

              <label style={{ fontWeight: 800, color: COLORS.text }}>PIN de acesso</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value).slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                placeholder="Digite o PIN"
                style={{ ...inputStyle(), width: '100%', marginTop: 8 }}
              />

              {pinError ? <p style={{ color: COLORS.danger, fontWeight: 800 }}>{pinError}</p> : null}

              <button onClick={handleLogin} style={{ ...primaryButtonStyle(), width: '100%', marginTop: 16 }}>
                Entrar com PIN
              </button>

              <p style={{ color: COLORS.muted, marginTop: 18, fontSize: 13 }}>
                Acesso restrito por PIN individual.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  function renderPanelHeader() {
    return (
      <header style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: 999,
                background: COLORS.blueSoft,
                color: COLORS.blue,
                fontWeight: 900,
                fontSize: 12,
              }}
            >
              GESTOR CONEXÃO
            </div>

            <h1 style={{ margin: '10px 0 0', color: COLORS.blue }}>
              {screen === 'admin'
                ? 'Painel Administrativo'
                : screen === 'reception'
                  ? 'Painel da Recepção'
                  : `Professor: ${currentProfessor?.nome || ''}`}
            </h1>

            {loading ? <p style={{ color: COLORS.muted }}>Atualizando dados...</p> : null}
          </div>

          <button onClick={logout} style={secondaryButtonStyle()}>
            Sair
          </button>
        </div>
      </header>
    );
  }

  function renderTabs() {
    if (screen === 'admin') {
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={activeButtonStyle(adminTab === 'dashboard')} onClick={() => setAdminTab('dashboard')}>Dashboard</button>
          <button style={activeButtonStyle(adminTab === 'students')} onClick={() => setAdminTab('students')}>Alunos</button>
          <button style={activeButtonStyle(adminTab === 'experimentals')} onClick={() => setAdminTab('experimentals')}>Experimentais</button>
          <button style={activeButtonStyle(adminTab === 'classes')} onClick={() => setAdminTab('classes')}>Turmas</button>
          <button style={activeButtonStyle(adminTab === 'enrollments')} onClick={() => setAdminTab('enrollments')}>Matrículas</button>
          <button style={activeButtonStyle(adminTab === 'attendance')} onClick={() => setAdminTab('attendance')}>Presenças</button>
          <button style={activeButtonStyle(adminTab === 'financial')} onClick={() => setAdminTab('financial')}>Financeiro</button>
        </div>
      );
    }

    if (screen === 'reception') {
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={activeButtonStyle(receptionTab === 'experimentals')} onClick={() => setReceptionTab('experimentals')}>Experimentais</button>
          <button style={activeButtonStyle(receptionTab === 'students')} onClick={() => setReceptionTab('students')}>Alunos</button>
          <button style={activeButtonStyle(receptionTab === 'classes')} onClick={() => setReceptionTab('classes')}>Turmas</button>
          <button style={activeButtonStyle(receptionTab === 'enrollments')} onClick={() => setReceptionTab('enrollments')}>Matrículas</button>
          <button style={activeButtonStyle(receptionTab === 'attendance')} onClick={() => setReceptionTab('attendance')}>Presenças</button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={activeButtonStyle(teacherTab === 'today')} onClick={() => setTeacherTab('today')}>Turmas do dia</button>
        <button style={activeButtonStyle(teacherTab === 'students')} onClick={() => setTeacherTab('students')}>Meus alunos</button>
        <button style={activeButtonStyle(teacherTab === 'financial')} onClick={() => setTeacherTab('financial')}>Financeiro</button>
      </div>
    );
  }


  const financialSummary = useMemo(() => {
    const totalRecebido = financeiro
      .filter((item) => item.recebido)
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const totalPendente = financeiro
      .filter((item) => !item.recebido)
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const totalArena = financeiro.reduce((acc, item) => {
      const professor = professores.find((prof) => prof.id === item.professor_id);
      const percentualProfessor = professorRate(professor?.percentual);
      const valor = Number(item.valor || 0);
      return acc + valor * (1 - percentualProfessor);
    }, 0);

    const totalProfessores = financeiro.reduce((acc, item) => {
      const professor = professores.find((prof) => prof.id === item.professor_id);
      const percentualProfessor = professorRate(professor?.percentual);
      const valor = Number(item.valor || 0);
      return acc + valor * percentualProfessor;
    }, 0);

    return {
      totalRecebido,
      totalPendente,
      totalArena,
      totalProfessores,
    };
  }, [financeiro, professores]);


  function renderMetricCard(label: string, value: string | number, detail?: string) {
    return (
      <div style={cardStyle}>
        <strong style={{ color: COLORS.muted }}>{label}</strong>
        <h2 style={{ color: COLORS.blue, fontSize: 30, margin: '8px 0' }}>{value}</h2>
        {detail ? <p style={{ color: COLORS.muted, margin: 0, fontSize: 13 }}>{detail}</p> : null}
      </div>
    );
  }

  function renderDashboard() {
    return (
      <section style={{ display: 'grid', gap: 18 }}>
        <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.blueDark})`, color: '#fff' }}>
          <p style={{ margin: 0, opacity: 0.85, fontWeight: 800 }}>Dashboard executivo · {monthLabel(dashboardMetrics.currentMonth)}</p>
          <h2 style={{ margin: '8px 0 0', fontSize: 34 }}>Visão geral da operação Conexão CT</h2>
          <p style={{ marginBottom: 0, opacity: 0.9 }}>Alunos, financeiro, retenção, conversão de experimentais e desempenho por professor.</p>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {renderMetricCard('Alunos ativos', dashboardMetrics.alunosAtivos, `Beach: ${dashboardMetrics.porModalidade.beach} • Futevôlei: ${dashboardMetrics.porModalidade.fute}`)}
          {renderMetricCard('Receita prevista', formatMoney(dashboardMetrics.receitaPrevista), `Recebido: ${formatMoney(dashboardMetrics.receitaRecebida)}`)}
          {renderMetricCard('Receita pendente', formatMoney(dashboardMetrics.receitaPendente), `${dashboardMetrics.inadimplentes} aluno(s) inadimplente(s)`)}
          {renderMetricCard('Turmas ativas', activeTurmas.length, `${matriculas.filter((item) => item.ativa !== false).length} matrícula(s) vinculada(s)`)}
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {renderMetricCard('Entraram no mês', dashboardMetrics.entradasMes, `Saldo: ${dashboardMetrics.saldoMes >= 0 ? '+' : ''}${dashboardMetrics.saldoMes}`)}
          {renderMetricCard('Saíram no mês', dashboardMetrics.saidasMes, `Evasão: ${formatPercent(dashboardMetrics.evasao)}`)}
          {renderMetricCard('Retenção', formatPercent(dashboardMetrics.retencao), 'Base estimada do mês atual')}
          {renderMetricCard('Conversão experimental', formatPercent(dashboardMetrics.conversaoExperimental), `${dashboardMetrics.fecharamExperimental}/${dashboardMetrics.fizeramExperimental} fecharam após fazer aula`)}
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div style={cardStyle}>
            <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Professores</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {dashboardMetrics.porProfessor.map((item) => (
                <div key={item.professor.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
                  <strong style={{ color: COLORS.blue }}>{item.professor.nome}</strong>
                  <div style={{ color: COLORS.muted, marginTop: 6 }}>
                    {item.alunos} aluno(s) • recebido {formatMoney(item.recebido)} • pendente {formatMoney(item.pendente)}
                  </div>
                  <div style={{ color: COLORS.muted, marginTop: 4 }}>
                    Comissão: {formatMoney(item.comissao)} • Arena: {formatMoney(item.arena)} • Conversões: {item.conversoes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Experimentais do mês</h2>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {renderMetricCard('Cadastrados', dashboardMetrics.experimentaisMes)}
              {renderMetricCard('Fizeram aula', dashboardMetrics.fizeramExperimental)}
              {renderMetricCard('Fecharam plano', dashboardMetrics.fecharamExperimental)}
              {renderMetricCard('Conversão', formatPercent(dashboardMetrics.conversaoExperimental))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderStudents() {
    const alunosAtivosLocal = alunos.filter((aluno) => aluno.status !== 'inativo');

    const getPlanKind = (aluno: Aluno) => {
      const plano = normalizeText(`${aluno.tipo_plano || ''} ${aluno.plano_descricao || ''}`);
      if (plano.includes('personalizado')) return 'personalizado';
      if (plano.includes('2x')) return '2x';
      if (plano.includes('1x')) return '1x';
      if (Number(aluno.plano_valor || 0) === 320 || Number(aluno.plano_valor || 0) === 215) return '2x';
      if (Number(aluno.plano_valor || 0) === 220 || Number(aluno.plano_valor || 0) === 125) return '1x';
      return 'sem-plano';
    };

    const countPlan = (lista: Aluno[], tipo: '1x' | '2x' | 'personalizado' | 'sem-plano') =>
      lista.filter((aluno) => getPlanKind(aluno) === tipo).length;

    const metricCard = (label: string, value: string | number, helper?: string) => (
      <div
        style={{
          ...cardStyle,
          padding: 18,
          minHeight: 118,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <strong style={{ color: COLORS.muted, fontSize: 13 }}>{label}</strong>
        <div style={{ color: COLORS.blue, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{value}</div>
        {helper ? <span style={{ color: COLORS.muted, fontSize: 12 }}>{helper}</span> : <span />}
      </div>
    );

    const renderAlunoActions = (aluno: Aluno) => (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={secondaryButtonStyle()} onClick={() => setSelectedAlunoId(aluno.id)}>
          Ficha
        </button>
        <button
          style={secondaryButtonStyle()}
          onClick={() => {
            setEditingStudentId(aluno.id);
            setStudentForm({
              nome: aluno.nome || '',
              telefone: aluno.telefone || '',
              email: aluno.email || '',
              cpf: aluno.cpf || '',
              data_nascimento: aluno.data_nascimento || '',
              endereco: aluno.endereco || '',
              cep: aluno.cep || '',
              data_inicio: aluno.data_inicio || '',
              status: aluno.status || 'ativo',
              tipo_plano: aluno.tipo_plano || 'padrao',
              plano_descricao: aluno.plano_descricao || '',
              plano_valor: aluno.plano_valor ? String(aluno.plano_valor) : '',
              professor_id: aluno.professor_id || '',
              menor_idade: Boolean(aluno.menor_idade),
              responsavel_nome: aluno.responsavel_nome || '',
              responsavel_telefone: aluno.responsavel_telefone || '',
              responsavel_email: aluno.responsavel_email || '',
              responsavel_cpf: aluno.responsavel_cpf || '',
              responsavel_endereco: aluno.responsavel_endereco || '',
              responsavel_cep: aluno.responsavel_cep || '',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Editar
        </button>
        <button style={secondaryButtonStyle()} onClick={() => deleteRecord('alunos', aluno.id)}>
          Excluir
        </button>
      </div>
    );

    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <h2 style={{ color: COLORS.blue, margin: 0 }}>Cadastro de alunos</h2>
              <p style={{ color: COLORS.muted, margin: '6px 0 0' }}>
                Cadastre alunos matriculados, defina professor, plano e dados do responsável quando for menor.
              </p>
            </div>
            {editingStudentId ? (
              <div style={{ padding: '8px 12px', borderRadius: 999, background: COLORS.blueSoft, color: COLORS.blue, fontWeight: 900 }}>
                Editando aluno
              </div>
            ) : null}
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'end' }}>
            <input style={inputStyle()} placeholder="Nome completo" value={studentForm.nome} onChange={(e) => setStudentForm({ ...studentForm, nome: e.target.value })} />
            <input style={inputStyle()} placeholder="Celular" value={studentForm.telefone} onChange={(e) => setStudentForm({ ...studentForm, telefone: maskPhone(e.target.value) })} />
            <input style={inputStyle()} placeholder="E-mail" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
            <input style={inputStyle()} placeholder="CPF" value={studentForm.cpf} onChange={(e) => setStudentForm({ ...studentForm, cpf: maskCPF(e.target.value) })} />

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: COLORS.muted, marginBottom: 6 }}>Data de nascimento</label>
              <input style={{ ...inputStyle(), width: '100%' }} type="date" value={studentForm.data_nascimento} onChange={(e) => setStudentForm({ ...studentForm, data_nascimento: e.target.value })} />
            </div>

            <input style={inputStyle()} placeholder="Endereço" value={studentForm.endereco} onChange={(e) => setStudentForm({ ...studentForm, endereco: e.target.value })} />
            <input style={inputStyle()} placeholder="CEP" value={studentForm.cep} onChange={(e) => setStudentForm({ ...studentForm, cep: maskCEP(e.target.value) })} />

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: COLORS.muted, marginBottom: 6 }}>Data de início no CT</label>
              <input style={{ ...inputStyle(), width: '100%' }} type="date" value={studentForm.data_inicio} onChange={(e) => setStudentForm({ ...studentForm, data_inicio: e.target.value })} />
            </div>

            <select style={inputStyle()} value={studentForm.professor_id} onChange={(e) => setStudentForm({ ...studentForm, professor_id: e.target.value })}>
              <option value="">Professor principal</option>
              {professoresPorModalidade(modalityFromPlan(studentForm.plano_descricao)).map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>

            <select
              style={inputStyle()}
              value={studentForm.tipo_plano}
              onChange={(e) => {
                const value = e.target.value;
                setStudentForm({
                  ...studentForm,
                  tipo_plano: value,
                  plano_descricao: value === 'padrao' ? '1x por semana' : '',
                  plano_valor: value === 'padrao' ? '220' : '',
                });
              }}
            >
              <option value="padrao">Plano padrão</option>
              <option value="personalizado">Plano personalizado</option>
            </select>

            {studentForm.tipo_plano === 'padrao' ? (
              <select
                style={inputStyle()}
                value={`${studentForm.plano_descricao}|${studentForm.plano_valor}`}
                onChange={(e) => {
                  const [descricao, valor] = e.target.value.split('|');
                  setStudentForm({ ...studentForm, plano_descricao: descricao, plano_valor: valor });
                }}
              >
                <option value="1x por semana|220">Beach Tennis 1x/semana — R$220</option>
                <option value="2x por semana|320">Beach Tennis 2x/semana — R$320</option>
                <option value="Futevôlei 1x por semana|125">Futevôlei 1x/semana — R$125</option>
                <option value="Futevôlei 2x por semana|215">Futevôlei 2x/semana — R$215</option>
              </select>
            ) : (
              <>
                <input style={inputStyle()} placeholder="Descrição do plano personalizado" value={studentForm.plano_descricao} onChange={(e) => setStudentForm({ ...studentForm, plano_descricao: e.target.value })} />
                <input style={inputStyle()} placeholder="Valor do plano" type="number" value={studentForm.plano_valor} onChange={(e) => setStudentForm({ ...studentForm, plano_valor: e.target.value })} />
              </>
            )}

            <select style={inputStyle()} value={studentForm.status} onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inadimplente">Inadimplente</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, fontWeight: 700 }}>
            <input type="checkbox" checked={studentForm.menor_idade} onChange={(e) => setStudentForm({ ...studentForm, menor_idade: e.target.checked })} />
            Menor de idade
          </label>

          {studentForm.menor_idade && (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 12, padding: 16, borderRadius: 18, background: COLORS.blueSoft }}>
              <input style={inputStyle()} placeholder="Nome do responsável" value={studentForm.responsavel_nome} onChange={(e) => setStudentForm({ ...studentForm, responsavel_nome: e.target.value })} />
              <input style={inputStyle()} placeholder="Celular do responsável" value={studentForm.responsavel_telefone} onChange={(e) => setStudentForm({ ...studentForm, responsavel_telefone: maskPhone(e.target.value) })} />
              <input style={inputStyle()} placeholder="E-mail do responsável" value={studentForm.responsavel_email} onChange={(e) => setStudentForm({ ...studentForm, responsavel_email: e.target.value })} />
              <input style={inputStyle()} placeholder="CPF do responsável" value={studentForm.responsavel_cpf} onChange={(e) => setStudentForm({ ...studentForm, responsavel_cpf: maskCPF(e.target.value) })} />
              <input style={inputStyle()} placeholder="Endereço do responsável" value={studentForm.responsavel_endereco} onChange={(e) => setStudentForm({ ...studentForm, responsavel_endereco: e.target.value })} />
              <input style={inputStyle()} placeholder="CEP do responsável" value={studentForm.responsavel_cep} onChange={(e) => setStudentForm({ ...studentForm, responsavel_cep: maskCEP(e.target.value) })} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={saveStudent} style={primaryButtonStyle()}>
              {editingStudentId ? 'Salvar alterações do aluno' : 'Salvar aluno'}
            </button>

            {editingStudentId ? (
              <button
                style={secondaryButtonStyle()}
                onClick={() => {
                  setEditingStudentId(null);
                  setStudentForm(initialStudentForm);
                }}
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {metricCard('Total de alunos', alunos.length)}
          {metricCard('Alunos ativos', alunosAtivosLocal.length)}
          {metricCard('1x por semana', countPlan(alunosAtivosLocal, '1x'), 'planos ativos')}
          {metricCard('2x por semana', countPlan(alunosAtivosLocal, '2x'), 'planos ativos')}
          {metricCard('Personalizados', countPlan(alunosAtivosLocal, 'personalizado'), 'planos ativos')}
          {metricCard('Sem plano/valor', countPlan(alunosAtivosLocal, 'sem-plano'), 'revisar cadastro')}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <h2 style={{ color: COLORS.blue, margin: 0 }}>Alunos por professor</h2>
              <p style={{ color: COLORS.muted, margin: '6px 0 0' }}>
                Cada bloco funciona como uma pasta. Abra o professor e veja os alunos vinculados.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {alunosPorProfessor.map((grupo) => {
              const ativosGrupo = grupo.alunos.filter((aluno) => aluno.status !== 'inativo');
              const receitaGrupo = ativosGrupo.reduce((sum, aluno) => sum + Number(aluno.plano_valor || 0), 0);

              return (
                <details key={grupo.professorId} open style={{ border: `1px solid ${COLORS.border}`, borderRadius: 22, background: '#fff', overflow: 'hidden' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      listStyle: 'none',
                      padding: 18,
                      background: COLORS.blueSoft,
                      display: 'grid',
                      gap: 12,
                      gridTemplateColumns: 'minmax(220px, 1.6fr) repeat(5, minmax(100px, 1fr))',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: COLORS.blue, fontSize: 18 }}>📁 {grupo.professorNome}</strong>
                      <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>Clique para abrir/fechar a pasta</div>
                    </div>
                    <div><strong>{grupo.alunos.length}</strong><br /><span style={{ color: COLORS.muted, fontSize: 12 }}>total</span></div>
                    <div><strong>{ativosGrupo.length}</strong><br /><span style={{ color: COLORS.muted, fontSize: 12 }}>ativos</span></div>
                    <div><strong>{countPlan(ativosGrupo, '1x')}</strong><br /><span style={{ color: COLORS.muted, fontSize: 12 }}>1x semana</span></div>
                    <div><strong>{countPlan(ativosGrupo, '2x')}</strong><br /><span style={{ color: COLORS.muted, fontSize: 12 }}>2x semana</span></div>
                    <div><strong>{formatMoney(receitaGrupo)}</strong><br /><span style={{ color: COLORS.muted, fontSize: 12 }}>previsto</span></div>
                  </summary>

                  <div style={{ padding: 14, display: 'grid', gap: 10 }}>
                    {grupo.alunos.map((aluno) => (
                      <div
                        key={aluno.id}
                        style={{
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 18,
                          padding: 14,
                          display: 'grid',
                          gap: 12,
                          gridTemplateColumns: 'minmax(220px, 1.5fr) minmax(130px, 0.8fr) minmax(160px, 1fr) minmax(110px, 0.7fr) minmax(240px, 1fr)',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <button
                            style={{ border: 'none', background: 'transparent', color: COLORS.blue, fontWeight: 900, cursor: 'pointer', padding: 0, fontSize: 16, textAlign: 'left' }}
                            onClick={() => setSelectedAlunoId(aluno.id)}
                          >
                            {aluno.nome}
                          </button>
                          <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>{aluno.telefone || 'Sem telefone'}</div>
                        </div>

                        <div>
                          <span style={{ color: COLORS.muted, fontSize: 12 }}>Status</span>
                          <div style={{ fontWeight: 800, color: aluno.status === 'inadimplente' ? COLORS.danger : COLORS.text }}>{aluno.status || 'ativo'}</div>
                        </div>

                        <div>
                          <span style={{ color: COLORS.muted, fontSize: 12 }}>Plano</span>
                          <div style={{ fontWeight: 800 }}>{aluno.tipo_plano === 'personalizado' ? 'Personalizado' : aluno.plano_descricao || '-'}</div>
                        </div>

                        <div>
                          <span style={{ color: COLORS.muted, fontSize: 12 }}>Valor</span>
                          <div style={{ fontWeight: 800 }}>{formatMoney(aluno.plano_valor)}</div>
                        </div>

                        {renderAlunoActions(aluno)}
                      </div>
                    ))}

                    {grupo.alunos.length === 0 ? (
                      <div style={{ padding: 16, color: COLORS.muted }}>Nenhum aluno vinculado a este professor.</div>
                    ) : null}
                  </div>
                </details>
              );
            })}

            {alunosPorProfessor.length === 0 ? (
              <div style={{ padding: 18, border: `1px solid ${COLORS.border}`, borderRadius: 18, color: COLORS.muted }}>
                Nenhum aluno cadastrado.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  function renderExperimentals() {
    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Cadastro de experimentais</h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <input style={inputStyle()} placeholder="Nome do aluno" value={experimentalForm.nome} onChange={(e) => setExperimentalForm({ ...experimentalForm, nome: e.target.value })} />
            <input style={inputStyle()} placeholder="Celular" value={experimentalForm.telefone} onChange={(e) => setExperimentalForm({ ...experimentalForm, telefone: maskPhone(e.target.value) })} />
            <input style={inputStyle()} placeholder="E-mail" value={experimentalForm.email} onChange={(e) => setExperimentalForm({ ...experimentalForm, email: e.target.value })} />
            <input style={inputStyle()} type="date" value={experimentalForm.dia_contato} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_contato: e.target.value })} />

            <select style={inputStyle()} value={experimentalForm.modalidade} onChange={(e) => setExperimentalForm({ ...experimentalForm, modalidade: e.target.value, categoria: '', professor_id: '', professor_preferencia: '' })}>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Futevôlei">Futevôlei</option>
            </select>

            <select style={inputStyle()} value={experimentalForm.categoria} onChange={(e) => setExperimentalForm({ ...experimentalForm, categoria: e.target.value })}>
              <option value="">Categoria</option>
              {categoryOptions(experimentalForm.modalidade).map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select
              style={inputStyle()}
              value={experimentalForm.professor_id}
              onChange={(e) => {
                const prof = professores.find((item) => item.id === e.target.value);
                setExperimentalForm({
                  ...experimentalForm,
                  professor_id: e.target.value,
                  professor_preferencia: prof?.nome || '',
                });
              }}
            >
              <option value="">Professor de preferência</option>
              {professoresPorModalidade(experimentalForm.modalidade).map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>

            <input style={inputStyle()} placeholder="Dia preferido" value={experimentalForm.dia_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_preferido: e.target.value })} />
            <input style={inputStyle()} placeholder="Período preferido" value={experimentalForm.periodo_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, periodo_preferido: e.target.value })} />
            <input style={inputStyle()} placeholder="Horário que pode fazer" value={experimentalForm.horario_pode_fazer} onChange={(e) => setExperimentalForm({ ...experimentalForm, horario_pode_fazer: e.target.value })} />
            <input style={inputStyle()} placeholder="Dia e horário da aula experimental" value={experimentalForm.dia_horario_aula_experimental} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_horario_aula_experimental: e.target.value })} />

            <select style={inputStyle()} value={experimentalForm.status_lead} onChange={(e) => setExperimentalForm({ ...experimentalForm, status_lead: e.target.value })}>
              <option value="novo">Novo</option>
              <option value="quente">Quente</option>
              <option value="morno">Morno</option>
              <option value="frio">Frio</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>

            <input style={inputStyle()} type="date" value={experimentalForm.follow_up} onChange={(e) => setExperimentalForm({ ...experimentalForm, follow_up: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
              <input type="checkbox" checked={experimentalForm.fez_aula_experimental} onChange={(e) => setExperimentalForm({ ...experimentalForm, fez_aula_experimental: e.target.checked })} />
              Fez aula experimental?
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
              <input type="checkbox" checked={experimentalForm.entrou_em_contato_apos_aula} onChange={(e) => setExperimentalForm({ ...experimentalForm, entrou_em_contato_apos_aula: e.target.checked })} />
              Entrou em contato após aula?
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
              <input type="checkbox" checked={experimentalForm.fechou_plano} onChange={(e) => setExperimentalForm({ ...experimentalForm, fechou_plano: e.target.checked })} />
              Fechou plano?
            </label>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
            <textarea style={textareaStyle()} placeholder="Motivo se não fechou" value={experimentalForm.motivo_nao_fechou} onChange={(e) => setExperimentalForm({ ...experimentalForm, motivo_nao_fechou: e.target.value })} />
            <textarea style={textareaStyle()} placeholder="Observações / follow-up" value={experimentalForm.observacoes} onChange={(e) => setExperimentalForm({ ...experimentalForm, observacoes: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={saveExperimental} style={primaryButtonStyle()}>
              {editingExperimentalId ? 'Salvar alterações do experimental' : 'Salvar experimental'}
            </button>

            {editingExperimentalId ? (
              <button
                style={secondaryButtonStyle()}
                onClick={() => {
                  setEditingExperimentalId(null);
                  setExperimentalForm(initialExperimentalForm);
                }}
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>CRM de experimentais</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Telefone</th>
                  <th style={thStyle}>Modalidade</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Professor</th>
                  <th style={thStyle}>Aula</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Follow-up</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>

              <tbody>
                {experimentais.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.nome}</td>
                    <td style={tdStyle}>{item.telefone || '-'}</td>
                    <td style={tdStyle}>{item.modalidade || '-'}</td>
                    <td style={tdStyle}>{item.categoria || '-'}</td>
                    <td style={tdStyle}>{getProfessorName(professores, item.professor_id) || item.professor_preferencia || '-'}</td>
                    <td style={tdStyle}>{item.dia_horario_aula_experimental || '-'}</td>
                    <td style={tdStyle}>{getLeadStatus(item)}</td>
                    <td style={tdStyle}>{item.follow_up || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          style={secondaryButtonStyle()}
                          onClick={() => {
                            setEditingExperimentalId(item.id);
                            setExperimentalForm({
                              nome: item.nome || '',
                              telefone: item.telefone || '',
                              email: item.email || '',
                              modalidade: item.modalidade || 'Beach Tennis',
                              categoria: item.categoria || '',
                              professor_id: item.professor_id || '',
                              professor_preferencia: item.professor_preferencia || '',
                              dia_contato: item.dia_contato || dateBR(),
                              dia_preferido: item.dia_preferido || '',
                              periodo_preferido: item.periodo_preferido || '',
                              horario_pode_fazer: item.horario_pode_fazer || '',
                              dia_horario_aula_experimental: item.dia_horario_aula_experimental || '',
                              fez_aula_experimental: Boolean(item.fez_aula_experimental),
                              entrou_em_contato_apos_aula: Boolean(item.entrou_em_contato_apos_aula),
                              fechou_plano: Boolean(item.fechou_plano),
                              motivo_nao_fechou: item.motivo_nao_fechou || '',
                              status_lead: item.status_lead || 'novo',
                              follow_up: item.follow_up || '',
                              observacoes: item.observacoes || '',
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button style={secondaryButtonStyle()} onClick={() => convertExperimentalToStudent(item)}>Matricular</button>
                        <button style={secondaryButtonStyle()} onClick={() => deleteRecord('experimentais', item.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {experimentais.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={9}>Nenhum experimental cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderClasses() {
    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Cadastro de turmas</h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <input style={inputStyle()} placeholder="Nome da turma" value={turmaForm.nome} onChange={(e) => setTurmaForm({ ...turmaForm, nome: e.target.value })} />

            <select style={inputStyle()} value={turmaForm.modalidade} onChange={(e) => setTurmaForm({ ...turmaForm, modalidade: e.target.value, categoria: '', professor_id: '' })}>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Futevôlei">Futevôlei</option>
            </select>

            <select style={inputStyle()} value={turmaForm.categoria} onChange={(e) => setTurmaForm({ ...turmaForm, categoria: e.target.value })}>
              <option value="">Categoria</option>
              {categoryOptions(turmaForm.modalidade).map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select style={inputStyle()} value={turmaForm.professor_id} onChange={(e) => setTurmaForm({ ...turmaForm, professor_id: e.target.value })}>
              <option value="">Professor</option>
              {professoresPorModalidade(turmaForm.modalidade).map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>

            <select style={inputStyle()} value={turmaForm.dia_semana} onChange={(e) => setTurmaForm({ ...turmaForm, dia_semana: e.target.value })}>
              <option value="">Dia da semana</option>
              <option value="segunda">Segunda</option>
              <option value="terça">Terça</option>
              <option value="quarta">Quarta</option>
              <option value="quinta">Quinta</option>
              <option value="sexta">Sexta</option>
              <option value="sábado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>

            <select style={inputStyle()} value={turmaForm.horario} onChange={(e) => setTurmaForm({ ...turmaForm, horario: e.target.value })}>
              <option value="">Horário</option>
              {CLASS_TIMES.map((horario) => (
                <option key={horario} value={horario}>{horario}</option>
              ))}
            </select>
            <select style={inputStyle()} value={turmaForm.quadra} onChange={(e) => setTurmaForm({ ...turmaForm, quadra: e.target.value })}>
              <option value="">Quadra</option>
              {COURTS.map((quadra) => (
                <option key={quadra} value={quadra}>{quadra}</option>
              ))}
            </select>
            <input style={inputStyle()} placeholder="Capacidade" type="number" value={turmaForm.capacidade} onChange={(e) => setTurmaForm({ ...turmaForm, capacidade: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={saveTurma} style={primaryButtonStyle()}>
              {editingTurmaId ? 'Salvar alterações da turma' : 'Salvar turma'}
            </button>

            {editingTurmaId ? (
              <button
                style={secondaryButtonStyle()}
                onClick={() => {
                  setEditingTurmaId(null);
                  setTurmaForm(initialTurmaForm);
                }}
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Turmas cadastradas</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Turma</th>
                  <th style={thStyle}>Modalidade</th>
                  <th style={thStyle}>Categoria</th>
                  <th style={thStyle}>Professor</th>
                  <th style={thStyle}>Dia</th>
                  <th style={thStyle}>Horário</th>
                  <th style={thStyle}>Capacidade</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>

              <tbody>
                {turmas.map((turma) => (
                  <tr key={turma.id}>
                    <td style={tdStyle}>{turma.nome || '-'}</td>
                    <td style={tdStyle}>{turma.modalidade || '-'}</td>
                    <td style={tdStyle}>{turma.categoria || '-'}</td>
                    <td style={tdStyle}>{getProfessorName(professores, turma.professor_id)}</td>
                    <td style={tdStyle}>{turma.dia_semana || '-'}</td>
                    <td style={tdStyle}>{turma.horario || '-'}</td>
                    <td style={tdStyle}>{turma.capacidade || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          style={secondaryButtonStyle()}
                          onClick={() => {
                            setEditingTurmaId(turma.id);
                            setTurmaForm({
                              nome: turma.nome || '',
                              modalidade: turma.modalidade || 'Beach Tennis',
                              categoria: turma.categoria || '',
                              professor_id: turma.professor_id || '',
                              dia_semana: turma.dia_semana || '',
                              horario: turma.horario || '',
                              quadra: turma.quadra || '',
                              capacidade: turma.capacidade ? String(turma.capacidade) : '4',
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button style={secondaryButtonStyle()} onClick={() => deleteRecord('turmas', turma.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}

                {turmas.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={8}>Nenhuma turma cadastrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderEnrollments() {
    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Vincular aluno à turma</h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr auto' }}>
            <select style={inputStyle()} value={matriculaAlunoId} onChange={(e) => setMatriculaAlunoId(e.target.value)}>
              <option value="">Selecione o aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>

            <select style={inputStyle()} value={matriculaTurmaId} onChange={(e) => setMatriculaTurmaId(e.target.value)}>
              <option value="">Selecione a turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} • {turma.dia_semana} {turma.horario}
                </option>
              ))}
            </select>

            <button onClick={saveMatricula} style={primaryButtonStyle()}>
              Vincular
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Matrículas</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Aluno</th>
                  <th style={thStyle}>Turma</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{getAlunoName(alunos, item.aluno_id)}</td>
                    <td style={tdStyle}>{getTurmaName(turmas, item.turma_id)}</td>
                    <td style={tdStyle}>{item.tipo || 'fixo'}</td>
                    <td style={tdStyle}>{item.ativa === false ? 'Inativa' : 'Ativa'}</td>
                    <td style={tdStyle}>
                      <button style={secondaryButtonStyle()} onClick={() => deleteRecord('matriculas', item.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderAttendance() {
    return (
      <section style={cardStyle}>
        <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Presenças registradas</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Aluno</th>
                <th style={thStyle}>Turma</th>
                <th style={thStyle}>Professor</th>
                <th style={thStyle}>Presença</th>
                <th style={thStyle}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {presencas.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.data_aula || '-'}</td>
                  <td style={tdStyle}>{getAlunoName(alunos, item.aluno_id)}</td>
                  <td style={tdStyle}>{getTurmaName(turmas, item.turma_id)}</td>
                  <td style={tdStyle}>{getProfessorName(professores, item.professor_id)}</td>
                  <td style={tdStyle}>{item.presente ? 'Presente' : 'Falta'}</td>
                  <td style={tdStyle}>{item.tipo_presenca || 'normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderFinancial() {
    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Lançamento financeiro</h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <select
              style={inputStyle()}
              value={financialForm.aluno_id}
              onChange={(e) => {
                const aluno = alunos.find((item) => item.id === e.target.value);
                setFinancialForm({
                  ...financialForm,
                  aluno_id: e.target.value,
                  professor_id: aluno?.professor_id || '',
                  valor: aluno?.plano_valor ? String(aluno.plano_valor) : '',
                  observacao: aluno ? `Plano: ${aluno.plano_descricao || 'não informado'} • Status: ${aluno.status || 'ativo'}` : financialForm.observacao,
                });
              }}
            >
              <option value="">Aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>

            <select style={inputStyle()} value={financialForm.professor_id} onChange={(e) => setFinancialForm({ ...financialForm, professor_id: e.target.value })}>
              <option value="">Professor</option>
              {professoresAtivos.map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>

            <input style={inputStyle()} placeholder="Valor" type="number" value={financialForm.valor} onChange={(e) => setFinancialForm({ ...financialForm, valor: e.target.value })} />
            <input style={inputStyle()} type="date" value={financialForm.vencimento} onChange={(e) => setFinancialForm({ ...financialForm, vencimento: e.target.value })} />
            <input style={inputStyle()} type="month" value={financialForm.mes} onChange={(e) => setFinancialForm({ ...financialForm, mes: e.target.value })} />

            <select style={inputStyle()} value={financialForm.forma_pagamento} onChange={(e) => setFinancialForm({ ...financialForm, forma_pagamento: e.target.value })}>
              <option value="">Forma de pagamento</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
            </select>

            <select style={inputStyle()} value={financialForm.status} onChange={(e) => setFinancialForm({ ...financialForm, status: e.target.value })}>
              <option value="pendente">Pendente</option>
              <option value="recebido">Recebido</option>
              <option value="atrasado">Atrasado</option>
            </select>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
              <input type="checkbox" checked={financialForm.recebido} onChange={(e) => setFinancialForm({ ...financialForm, recebido: e.target.checked })} />
              Recebido
            </label>
          </div>

          <textarea style={{ ...textareaStyle(), width: '100%', marginTop: 12 }} placeholder="Observação" value={financialForm.observacao} onChange={(e) => setFinancialForm({ ...financialForm, observacao: e.target.value })} />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={saveFinancial} style={primaryButtonStyle()}>
              {editingFinancialId ? 'Salvar alterações do financeiro' : 'Salvar financeiro'}
            </button>

            {editingFinancialId ? (
              <button
                style={secondaryButtonStyle()}
                onClick={() => {
                  setEditingFinancialId(null);
                  setFinancialForm(initialFinancialForm);
                }}
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: COLORS.blue }}>Total recebido</h3>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(financialSummary.totalRecebido)}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: COLORS.blue }}>Total pendente</h3>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(financialSummary.totalPendente)}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: COLORS.blue }}>Comissão professores</h3>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(financialSummary.totalProfessores)}</p>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: COLORS.blue }}>Parte da arena</h3>
            <p style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(financialSummary.totalArena)}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Financeiro</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Mês</th>
                  <th style={thStyle}>Aluno</th>
                  <th style={thStyle}>Professor</th>
                  <th style={thStyle}>Valor</th>
                  <th style={thStyle}>Vencimento</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Forma</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>

              <tbody>
                {financeiro.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      background: item.recebido ? '#f0fff4' : item.status === 'atrasado' ? '#fff5f5' : '#fffdf0',
                    }}
                  >
                    <td style={tdStyle}>{item.mes || '-'}</td>
                    <td style={tdStyle}>{getAlunoName(alunos, item.aluno_id)}</td>
                    <td style={tdStyle}>{getProfessorName(professores, item.professor_id)}</td>
                    <td style={tdStyle}>{formatMoney(item.valor)}</td>
                    <td style={tdStyle}>{item.vencimento || '-'}</td>
                    <td style={{ ...tdStyle, color: item.recebido ? '#1f7a3a' : item.status === 'atrasado' ? COLORS.danger : COLORS.warning, fontWeight: 900 }}>{item.recebido ? 'Recebido' : item.status || 'Pendente'}</td>
                    <td style={tdStyle}>{item.forma_pagamento || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          style={secondaryButtonStyle()}
                          onClick={() => {
                            setEditingFinancialId(item.id);
                            setFinancialForm({
                              aluno_id: item.aluno_id || '',
                              professor_id: item.professor_id || '',
                              valor: item.valor ? String(item.valor) : '',
                              vencimento: item.vencimento || dateBR(),
                              mes: item.mes || monthBR(),
                              recebido: Boolean(item.recebido),
                              forma_pagamento: item.forma_pagamento || '',
                              status: item.status || 'pendente',
                              observacao: item.observacao || '',
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button style={secondaryButtonStyle()} onClick={() => togglePayment(item)}>
                          {item.recebido ? 'Marcar pendente' : 'Marcar recebido'}
                        </button>
                        <button style={secondaryButtonStyle()} onClick={() => deleteRecord('financeiro', item.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function getTodayPresence(alunoId: string, turmaId: string) {
    return presencas.find((item) => item.aluno_id === alunoId && item.turma_id === turmaId && item.data_aula === dateBR());
  }

  function presenceButtonStyle(active: boolean, variant: 'presente' | 'falta' | 'especial') {
    if (!active) return secondaryButtonStyle();

    return {
      ...primaryButtonStyle(),
      background: variant === 'falta' ? COLORS.danger : variant === 'especial' ? COLORS.green : COLORS.blue,
      color: variant === 'especial' ? COLORS.blueDark : '#fff',
      boxShadow: '0 8px 20px rgba(63, 64, 151, 0.16)',
    };
  }

  function renderTeacherToday() {
    const todayTurmas = teacherTurmas;

    return (
      <section style={{ display: 'grid', gap: 20 }}>
        {todayTurmas.map((turma) => {
          const turmaMatriculas = matriculas.filter((item) => item.turma_id === turma.id && item.ativa !== false);
          const alunosDaTurma = turmaMatriculas
            .map((matricula) => alunos.find((aluno) => aluno.id === matricula.aluno_id))
            .filter(Boolean) as Aluno[];

          return (
            <div key={turma.id} style={cardStyle}>
              <h2 style={{ color: COLORS.blue, marginTop: 0 }}>
                {turma.nome || 'Turma'} · {turma.dia_semana || '-'} {turma.horario || ''}
              </h2>

              <p style={{ color: COLORS.muted }}>
                {turma.modalidade || '-'} • {turma.categoria || '-'} • {turma.quadra || 'Quadra não informada'}
              </p>

              <div style={{ display: 'grid', gap: 12 }}>
                {alunosDaTurma.map((aluno) => {
                  const presencaHoje = getTodayPresence(aluno.id, turma.id);
                  const tipoAtual = presencaHoje?.tipo_presenca || '';
                  const presenteAtual = Boolean(presencaHoje?.presente);

                  return (
                  <div
                    key={aluno.id}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 16,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong>{aluno.nome}</strong>
                      <div style={{ color: COLORS.muted, marginTop: 4 }}>
                        {aluno.status === 'inadimplente' ? '⚠️ Inadimplente' : 'Ativo'} • {aluno.plano_descricao || 'Sem plano'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button style={presenceButtonStyle(presenteAtual && tipoAtual === 'normal', 'presente')} onClick={() => registerPresence(aluno.id, turma.id, true, 'normal')}>
                        Presente
                      </button>

                      <button style={presenceButtonStyle(Boolean(presencaHoje) && !presenteAtual, 'falta')} onClick={() => registerPresence(aluno.id, turma.id, false, 'falta')}>
                        Falta
                      </button>

                      <button style={presenceButtonStyle(tipoAtual === 'experimental', 'especial')} onClick={() => registerPresence(aluno.id, turma.id, true, 'experimental')}>
                        Experimental
                      </button>

                      <button style={presenceButtonStyle(tipoAtual === 'avulsa', 'especial')} onClick={() => registerPresence(aluno.id, turma.id, true, 'avulsa')}>
                        Avulsa
                      </button>

                      <button style={presenceButtonStyle(tipoAtual === 'reposicao', 'especial')} onClick={() => registerPresence(aluno.id, turma.id, true, 'reposicao')}>
                        Reposição
                      </button>
                    </div>
                  </div>
                  );
                })}

                {alunosDaTurma.length === 0 && (
                  <p style={{ color: COLORS.muted }}>Nenhum aluno vinculado a esta turma.</p>
                )}
              </div>
            </div>
          );
        })}

        {todayTurmas.length === 0 && (
          <div style={cardStyle}>
            <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Nenhuma turma vinculada</h2>
            <p style={{ color: COLORS.muted }}>
              Quando as turmas forem cadastradas e vinculadas ao professor, elas aparecerão aqui.
            </p>
          </div>
        )}
      </section>
    );
  }

  function renderTeacherStudents() {
    return (
      <section style={cardStyle}>
        <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Meus alunos</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Telefone</th>
                <th style={thStyle}>Plano</th>
                <th style={thStyle}>Valor</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {teacherAlunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td style={tdStyle}>{aluno.nome}</td>
                  <td style={tdStyle}>{aluno.telefone || '-'}</td>
                  <td style={tdStyle}>{aluno.plano_descricao || '-'}</td>
                  <td style={tdStyle}>{formatMoney(aluno.plano_valor)}</td>
                  <td style={tdStyle}>{aluno.status || 'ativo'}</td>
                </tr>
              ))}

              {teacherAlunos.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={5}>Nenhum aluno vinculado diretamente a este professor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderTeacherFinancial() {
    const rows = financeiro.filter((item) => item.professor_id === currentProfessor?.id);
    const percentual = professorRate(currentProfessor?.percentual);
    const totalProfessor = rows
      .filter((item) => item.recebido)
      .reduce((sum, item) => sum + Number(item.valor || 0) * percentual, 0);

    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <strong style={{ color: COLORS.muted }}>Total do professor no mês/lançamentos recebidos</strong>
          <h2 style={{ color: COLORS.blue, fontSize: 34 }}>{formatMoney(totalProfessor)}</h2>
          <p style={{ color: COLORS.muted, margin: 0 }}>
            Percentual cadastrado: {formatPercent(percentual * 100)}
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Espelho financeiro</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Mês</th>
                  <th style={thStyle}>Aluno</th>
                  <th style={thStyle}>Recebido</th>
                  <th style={thStyle}>Forma</th>
                  <th style={thStyle}>Valor professor</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.mes || '-'}</td>
                    <td style={tdStyle}>{getAlunoName(alunos, item.aluno_id)}</td>
                    <td style={tdStyle}>{item.recebido ? 'Sim' : 'Não'}</td>
                    <td style={tdStyle}>{item.forma_pagamento || '-'}</td>
                    <td style={tdStyle}>
                      {item.recebido ? formatMoney(Number(item.valor || 0) * percentual) : formatMoney(0)}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td style={tdStyle} colSpan={5}>Nenhum lançamento financeiro vinculado a este professor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderStudentDetailsModal() {
    const aluno = alunos.find((item) => item.id === selectedAlunoId);
    if (!aluno) return null;

    const alunoFinanceiro = financeiro.filter((item) => item.aluno_id === aluno.id);
    const alunoMatriculas = matriculas.filter((item) => item.aluno_id === aluno.id);
    const alunoPresencas = presencas.filter((item) => item.aluno_id === aluno.id);

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 38, 0.45)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20 }}>
        <div style={{ ...cardStyle, width: 'min(900px, 96vw)', maxHeight: '88vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ color: COLORS.blue, marginTop: 0 }}>{aluno.nome}</h2>
              <p style={{ color: COLORS.muted, marginTop: -8 }}>Ficha completa do aluno</p>
            </div>
            <button style={secondaryButtonStyle()} onClick={() => setSelectedAlunoId(null)}>Fechar</button>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <p><strong>Telefone:</strong><br />{aluno.telefone || '-'}</p>
            <p><strong>E-mail:</strong><br />{aluno.email || '-'}</p>
            <p><strong>CPF:</strong><br />{aluno.cpf || '-'}</p>
            <p><strong>Data de nascimento:</strong><br />{aluno.data_nascimento || '-'}</p>
            <p><strong>Data de início no CT:</strong><br />{aluno.data_inicio || '-'}</p>
            <p><strong>Professor:</strong><br />{getProfessorName(professores, aluno.professor_id)}</p>
            <p><strong>Plano:</strong><br />{aluno.plano_descricao || '-'}</p>
            <p><strong>Valor:</strong><br />{formatMoney(aluno.plano_valor)}</p>
            <p><strong>Status:</strong><br />{aluno.status || 'ativo'}</p>
            <p><strong>Origem matrícula:</strong><br />{aluno.origem_matricula || 'manual'}</p>
            <p><strong>Contrato:</strong><br />{aluno.contrato_status || 'pendente'}</p>
            <p><strong>Endereço:</strong><br />{aluno.endereco || '-'}</p>
            <p><strong>CEP:</strong><br />{aluno.cep || '-'}</p>
          </div>

          {aluno.menor_idade ? (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: COLORS.blueSoft }}>
              <h3 style={{ color: COLORS.blue, marginTop: 0 }}>Responsável</h3>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <p><strong>Nome:</strong><br />{aluno.responsavel_nome || '-'}</p>
                <p><strong>Telefone:</strong><br />{aluno.responsavel_telefone || '-'}</p>
                <p><strong>E-mail:</strong><br />{aluno.responsavel_email || '-'}</p>
                <p><strong>CPF:</strong><br />{aluno.responsavel_cpf || '-'}</p>
                <p><strong>Endereço:</strong><br />{aluno.responsavel_endereco || '-'}</p>
                <p><strong>CEP:</strong><br />{aluno.responsavel_cep || '-'}</p>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
              <strong>Turmas/Matrículas</strong>
              <p style={{ color: COLORS.muted }}>{alunoMatriculas.map((item) => getTurmaName(turmas, item.turma_id)).join(' • ') || 'Nenhuma matrícula vinculada.'}</p>
            </div>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
              <strong>Financeiro</strong>
              <p style={{ color: COLORS.muted }}>{alunoFinanceiro.length} lançamento(s) • Recebido: {formatMoney(alunoFinanceiro.filter((item) => item.recebido).reduce((sum, item) => sum + Number(item.valor || 0), 0))}</p>
            </div>
            <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
              <strong>Presenças</strong>
              <p style={{ color: COLORS.muted }}>{alunoPresencas.length} registro(s)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCurrentContent() {
    if (screen === 'admin') {
      if (adminTab === 'dashboard') return renderDashboard();
      if (adminTab === 'students') return renderStudents();
      if (adminTab === 'experimentals') return renderExperimentals();
      if (adminTab === 'classes') return renderClasses();
      if (adminTab === 'enrollments') return renderEnrollments();
      if (adminTab === 'attendance') return renderAttendance();
      if (adminTab === 'financial') return renderFinancial();
    }

    if (screen === 'reception') {
      if (receptionTab === 'students') return renderStudents();
      if (receptionTab === 'experimentals') return renderExperimentals();
      if (receptionTab === 'classes') return renderClasses();
      if (receptionTab === 'enrollments') return renderEnrollments();
      if (receptionTab === 'attendance') return renderAttendance();
    }

    if (screen === 'teacher') {
      if (teacherTab === 'today') return renderTeacherToday();
      if (teacherTab === 'students') return renderTeacherStudents();
      if (teacherTab === 'financial') return renderTeacherFinancial();
    }

    return null;
  }

  if (screen === 'login') {
    return renderLogin();
  }

  return (
    <main style={{ minHeight: '100vh', background: COLORS.bg, padding: 24 }}>
      <div style={{ maxWidth: 1380, margin: '0 auto', display: 'grid', gap: 20 }}>
        {renderPanelHeader()}
        {renderTabs()}
        {renderCurrentContent()}
      </div>

      {toast ? (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 9999,
            maxWidth: 420,
            borderRadius: 18,
            padding: '16px 18px',
            color: '#fff',
            fontWeight: 800,
            boxShadow: '0 18px 45px rgba(0,0,0,0.20)',
            background:
              toast.type === 'success'
                ? 'linear-gradient(135deg, #4f8f34, #7ed957)'
                : toast.type === 'error'
                  ? 'linear-gradient(135deg, #9f2d20, #c0392b)'
                  : 'linear-gradient(135deg, #25266f, #3f4097)',
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {confirmBox ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#fff',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <h2 style={{ marginTop: 0, color: COLORS.blue }}>{confirmBox.title}</h2>
            <p style={{ color: COLORS.muted, lineHeight: 1.5 }}>{confirmBox.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button style={secondaryButtonStyle()} onClick={() => setConfirmBox(null)}>
                Cancelar
              </button>
              <button style={{ ...primaryButtonStyle(), background: COLORS.danger }} onClick={confirmBox.onConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
