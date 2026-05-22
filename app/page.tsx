'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Screen = 'login' | 'admin' | 'reception' | 'teacher';
type LoginTab = 'admin' | 'reception' | 'teacher';
type AdminTab = 'dashboard' | 'students' | 'experimentals' | 'classes' | 'enrollments' | 'attendance' | 'financial';
type ReceptionTab = 'students' | 'experimentals' | 'classes' | 'enrollments';
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
};

type Experimental = {
  id: string;
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

const initialStudentForm: StudentForm = {
  nome: '',
  telefone: '',
  email: '',
  cpf: '',
  data_nascimento: '',
  endereco: '',
  cep: '',
  data_inicio: new Date().toISOString().slice(0, 10),
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
  dia_contato: new Date().toISOString().slice(0, 10),
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
  vencimento: new Date().toISOString().slice(0, 10),
  mes: new Date().toISOString().slice(0, 7),
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

  const [matriculaAlunoId, setMatriculaAlunoId] = useState('');
  const [matriculaTurmaId, setMatriculaTurmaId] = useState('');

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
      alert('Preencha o nome do aluno.');
      return;
    }

    const planoValor =
      studentForm.plano_valor.trim() === '' ? null : Number(studentForm.plano_valor.replace(',', '.'));

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

    const { error } = await supabase.from('alunos').insert(payload);

    if (error) {
      alert(`Erro ao salvar aluno: ${error.message}`);
      return;
    }

    setStudentForm(initialStudentForm);
    await loadAllData();
    alert('Aluno salvo com sucesso.');
  }

  async function saveExperimental() {
    if (!experimentalForm.nome.trim()) {
      alert('Preencha o nome do aluno experimental.');
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

    const { error } = await supabase.from('experimentais').insert(payload);

    if (error) {
      alert(`Erro ao salvar experimental: ${error.message}`);
      return;
    }

    setExperimentalForm(initialExperimentalForm);
    await loadAllData();
    alert('Experimental salvo com sucesso.');
  }

  async function saveTurma() {
    if (!turmaForm.nome.trim()) {
      alert('Preencha o nome da turma.');
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

    const { error } = await supabase.from('turmas').insert(payload);

    if (error) {
      alert(`Erro ao salvar turma: ${error.message}`);
      return;
    }

    setTurmaForm(initialTurmaForm);
    await loadAllData();
    alert('Turma salva com sucesso.');
  }

  async function saveMatricula() {
    if (!matriculaAlunoId || !matriculaTurmaId) {
      alert('Selecione o aluno e a turma.');
      return;
    }

    const { error } = await supabase.from('matriculas').insert({
      aluno_id: matriculaAlunoId,
      turma_id: matriculaTurmaId,
      tipo: 'fixo',
      ativa: true,
    });

    if (error) {
      alert(`Erro ao vincular aluno à turma: ${error.message}`);
      return;
    }

    setMatriculaAlunoId('');
    setMatriculaTurmaId('');
    await loadAllData();
    alert('Aluno vinculado à turma com sucesso.');
  }

  async function saveFinancial() {
    if (!financialForm.aluno_id || !financialForm.valor) {
      alert('Selecione o aluno e informe o valor.');
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

    const { error } = await supabase.from('financeiro').insert(payload);

    if (error) {
      alert(`Erro ao salvar financeiro: ${error.message}`);
      return;
    }

    setFinancialForm(initialFinancialForm);
    await loadAllData();
    alert('Lançamento financeiro salvo.');
  }
