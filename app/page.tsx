'use client';

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

type NoticeKind = 'success' | 'error' | 'info';

type NoticeState = {
  title: string;
  message: string;
  kind: NoticeKind;
};

type ConfirmState = {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
};

const COLORS = {
  blue: '#001E94',
  blueDark: '#07135C',
  blueSoft: '#EEF4FF',
  green: '#7ED957',
  bg: '#F4F7FB',
  text: '#111827',
  muted: '#64748B',
  border: '#D8E0EF',
  danger: '#C0392B',
  warning: '#F59E0B',
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFF',
  shadow: '0 18px 50px rgba(0, 30, 148, 0.10)',
  shadowStrong: '0 24px 70px rgba(0, 30, 148, 0.16)',
  gradient: 'linear-gradient(135deg, #001E94 0%, #0029BB 52%, #0B46D9 100%)',
  greenGradient: 'linear-gradient(135deg, #7ED957 0%, #54C83F 100%)',
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

function formatDate(value?: string | null) {
  if (!value) return '-';
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
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

  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [confirmBox, setConfirmBox] = useState<ConfirmState | null>(null);

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

  function showNotice(message: string, kind: NoticeKind = 'info', title?: string) {
    const defaultTitle = kind === 'success' ? 'Tudo certo' : kind === 'error' ? 'Atenção' : 'Aviso';
    setNotice({ title: title || defaultTitle, message, kind });
  }

  function showConfirm(title: string, message: string, onConfirm: () => void | Promise<void>) {
    setConfirmBox({ title, message, onConfirm });
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
      showNotice('Preencha o nome do aluno.');
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
        showNotice(`Erro ao atualizar aluno: ${error.message}`);
        return;
      }

      setEditingStudentId(null);
      setStudentForm(initialStudentForm);
      await loadAllData();
      showNotice('Aluno atualizado com sucesso.');
      return;
    }

    const { data: alunoCriado, error } = await supabase
      .from('alunos')
      .insert(payload)
      .select()
      .single();

    if (error) {
      showNotice(`Erro ao salvar aluno: ${error.message}`);
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
        showNotice(`Aluno salvo, mas houve erro ao gerar financeiro: ${financeiroError.message}`);
      }
    }

    setStudentForm(initialStudentForm);
    await loadAllData();
    showNotice('Aluno salvo com sucesso.');
  }

  async function saveExperimental() {
    if (!experimentalForm.nome.trim()) {
      showNotice('Preencha o nome do aluno experimental.');
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
      showNotice(`Erro ao salvar experimental: ${error.message}`);
      return;
    }

    setEditingExperimentalId(null);
    setExperimentalForm(initialExperimentalForm);
    await loadAllData();
    showNotice(editingExperimentalId ? 'Experimental atualizado com sucesso.' : 'Experimental salvo com sucesso.');
  }

  async function saveTurma() {
    if (!turmaForm.nome.trim()) {
      showNotice('Preencha o nome da turma.');
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
      showNotice(`Erro ao salvar turma: ${error.message}`);
      return;
    }

    setEditingTurmaId(null);
    setTurmaForm(initialTurmaForm);
    await loadAllData();
    showNotice(editingTurmaId ? 'Turma atualizada com sucesso.' : 'Turma salva com sucesso.');
  }

  async function saveMatricula() {
    if (!matriculaAlunoId || !matriculaTurmaId) {
      showNotice('Selecione o aluno e a turma.');
      return;
    }

    const { error } = await supabase.from('matriculas').insert({
      aluno_id: matriculaAlunoId,
      turma_id: matriculaTurmaId,
      tipo: 'fixo',
      ativa: true,
    });

    if (error) {
      showNotice(`Erro ao vincular aluno à turma: ${error.message}`);
      return;
    }

    setMatriculaAlunoId('');
    setMatriculaTurmaId('');
    await loadAllData();
    showNotice('Aluno vinculado à turma com sucesso.');
  }

  function getCurrentMonthAndDueDate() {
    const hoje = new Date();
    const mes = hoje.toISOString().slice(0, 7);
    const vencimento = `${mes}-10`;
    return { mes, vencimento };
  }

  function applyStudentToFinancialForm(alunoId: string) {
    const aluno = alunos.find((item) => item.id === alunoId);
    const { mes, vencimento } = getCurrentMonthAndDueDate();

    setFinancialForm({
      ...financialForm,
      aluno_id: alunoId,
      professor_id: aluno?.professor_id || '',
      valor: aluno?.plano_valor ? String(aluno.plano_valor) : '',
      vencimento,
      mes,
      status: 'pendente',
      recebido: false,
      observacao: aluno
        ? `Mensalidade - ${aluno.plano_descricao || 'Plano do aluno'}`
        : financialForm.observacao,
    });
  }

  async function saveFinancial() {
    if (!financialForm.aluno_id || !financialForm.valor) {
      showNotice('Selecione o aluno e informe o valor.');
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
      showNotice(`Erro ao salvar financeiro: ${error.message}`);
      return;
    }

    setEditingFinancialId(null);
    setFinancialForm(initialFinancialForm);
    await loadAllData();
    showNotice(editingFinancialId ? 'Lançamento financeiro atualizado.' : 'Lançamento financeiro salvo.');
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
      data_inicio: new Date().toISOString().slice(0, 10),
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
      showNotice(`Erro ao matricular experimental: ${error.message}`);
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
    showNotice('Experimental convertido em aluno.');
  }

  async function registerPresence(alunoId: string, turmaId: string, presente: boolean, tipoPresenca = 'normal') {
    const turma = turmas.find((item) => item.id === turmaId);

    const { error } = await supabase.from('presencas').insert({
      aluno_id: alunoId,
      turma_id: turmaId,
      professor_id: turma?.professor_id || currentProfessor?.id || null,
      data_aula: new Date().toISOString().slice(0, 10),
      presente,
      tipo_presenca: tipoPresenca,
      observacao: null,
    });

    if (error) {
      showNotice(`Erro ao salvar presença: ${error.message}`);
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
      showNotice(`Erro ao atualizar pagamento: ${error.message}`);
      return;
    }

    await loadAllData();
  }

  async function deleteRecord(table: string, id: string) {
    showConfirm('Confirmar exclusão', 'Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.', async () => {
      setConfirmBox(null);

      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) {
        showNotice(`Erro ao excluir: ${error.message}`, 'error');
        return;
      }

      await loadAllData();
      showNotice('Registro excluído com sucesso.', 'success');
    });
  }

  function inputStyle() {
    return {
      height: 46,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      padding: '0 14px',
      fontSize: 14,
      background: COLORS.surface,
      color: COLORS.text,
      outline: 'none',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
    };
  }

  function textareaStyle() {
    return {
      minHeight: 92,
      borderRadius: 16,
      border: `1px solid ${COLORS.border}`,
      padding: 14,
      fontSize: 14,
      background: COLORS.surface,
      color: COLORS.text,
      outline: 'none',
      resize: 'vertical' as const,
    };
  }

  function primaryButtonStyle() {
    return {
      minHeight: 46,
      padding: '0 20px',
      borderRadius: 16,
      border: 'none',
      background: COLORS.gradient,
      color: '#fff',
      fontWeight: 900,
      cursor: 'pointer',
      boxShadow: '0 12px 28px rgba(0, 30, 148, 0.24)',
      letterSpacing: 0.2,
    };
  }

  function secondaryButtonStyle() {
    return {
      minHeight: 42,
      padding: '0 16px',
      borderRadius: 14,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.surface,
      color: COLORS.blueDark,
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
    };
  }

  function activeButtonStyle(active: boolean) {
    return {
      minHeight: 42,
      padding: '0 16px',
      borderRadius: 999,
      border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
      background: active ? COLORS.gradient : 'rgba(255,255,255,0.86)',
      color: active ? '#fff' : COLORS.blueDark,
      fontWeight: 900,
      cursor: 'pointer',
      boxShadow: active ? '0 12px 28px rgba(0, 30, 148, 0.22)' : '0 8px 20px rgba(15, 23, 42, 0.05)',
      letterSpacing: 0.2,
    };
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    border: `1px solid ${COLORS.border}`,
    padding: 24,
    boxShadow: COLORS.shadow,
    backdropFilter: 'blur(10px)',
  };

  const premiumCardHeaderStyle = {
    background: COLORS.gradient,
    color: '#fff',
    padding: '24px 30px',
    fontSize: 24,
    fontWeight: 950,
    letterSpacing: 0.6,
  };

  const thStyle = {
    textAlign: 'left' as const,
    padding: '13px 12px',
    fontSize: 12,
    color: COLORS.blueDark,
    background: 'linear-gradient(180deg, #F1F5FF 0%, #E8EEFF 100%)',
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: 'nowrap' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };

  const tdStyle = {
    padding: '13px 12px',
    fontSize: 13,
    borderBottom: `1px solid ${COLORS.border}`,
    verticalAlign: 'top' as const,
    color: COLORS.text,
  };

  const sectionGridStyle = {
    display: 'grid',
    gap: 20,
  };

  const pageShellStyle = {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 10% 0%, rgba(126, 217, 87, 0.20), transparent 28%), radial-gradient(circle at 90% 5%, rgba(0, 41, 187, 0.14), transparent 32%), #F4F7FB',
    padding: 24,
  };

  function renderFeedbackModal() {
    if (!notice && !confirmBox) return null;

    const activeNotice = notice;
    const activeConfirm = confirmBox;
    const isError = activeNotice?.kind === 'error';
    const isSuccess = activeNotice?.kind === 'success';

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(7, 19, 92, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 460,
            background: '#fff',
            borderRadius: 26,
            boxShadow: COLORS.shadowStrong,
            border: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 20,
              background: activeConfirm ? COLORS.gradient : isSuccess ? COLORS.greenGradient : isError ? COLORS.danger : COLORS.gradient,
              color: '#fff',
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            {activeConfirm?.title || activeNotice?.title}
          </div>

          <div style={{ padding: 22 }}>
            <p style={{ margin: 0, color: COLORS.text, lineHeight: 1.5, fontSize: 15 }}>
              {activeConfirm?.message || activeNotice?.message}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
              {activeConfirm ? (
                <>
                  <button style={secondaryButtonStyle()} onClick={() => setConfirmBox(null)}>
                    Cancelar
                  </button>
                  <button style={primaryButtonStyle()} onClick={() => activeConfirm.onConfirm()}>
                    Confirmar
                  </button>
                </>
              ) : (
                <button style={primaryButtonStyle()} onClick={() => setNotice(null)}>
                  Entendi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLogin() {
    return (
      <main style={pageShellStyle}>
        {renderFeedbackModal()}
        <div style={{ maxWidth: 1220, margin: '0 auto', display: 'grid', gap: 28, gridTemplateColumns: '1.05fr 0.95fr', alignItems: 'stretch' }}>
          <section style={{ ...cardStyle, padding: 0, overflow: 'hidden', boxShadow: COLORS.shadowStrong }}>
            <div style={premiumCardHeaderStyle}>
              GESTOR CONEXÃO
            </div>

            <div style={{ padding: 34 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: COLORS.blueSoft, color: COLORS.blue, padding: '8px 12px', borderRadius: 999, fontWeight: 900, fontSize: 12, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.green, display: 'inline-block' }} />
                OPERAÇÃO PREMIUM DO CT
              </div>

              <h1 style={{ margin: 0, color: COLORS.blueDark, fontSize: 46, lineHeight: 1.04, letterSpacing: -1.2 }}>
                Operação diária do CT em um só lugar
              </h1>

              <p style={{ color: COLORS.muted, fontSize: 18, lineHeight: 1.6, marginTop: 18 }}>
                Professores, recepção e administração com acessos separados por PIN, dados integrados e fluxo operacional rápido.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 28 }}>
                {[
                  ['Admin', 'Gestão completa, financeiro e visão geral.'],
                  ['Recepção', 'Alunos, experimentais, turmas e matrículas.'],
                  ['Professor', 'Turmas, presença e espelho financeiro.'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: COLORS.surfaceSoft, border: `1px solid ${COLORS.border}`, borderRadius: 22, padding: 18, boxShadow: '0 10px 26px rgba(15, 23, 42, 0.05)' }}>
                    <strong style={{ color: COLORS.blue, fontSize: 17 }}>{title}</strong>
                    <p style={{ color: COLORS.muted, marginBottom: 0, lineHeight: 1.45 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ ...cardStyle, padding: 0, overflow: 'hidden', boxShadow: COLORS.shadowStrong }}>
            <div style={premiumCardHeaderStyle}>
              ENTRAR
            </div>

            <div style={{ padding: 34 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
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

              <label style={{ fontWeight: 900, color: COLORS.blueDark }}>PIN de acesso</label>
              <input
                value={pin}
                onChange={(e) => setPin(onlyDigits(e.target.value).slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
                placeholder="Digite o PIN"
                style={{ ...inputStyle(), width: '100%', marginTop: 10, height: 52, fontSize: 16 }}
              />

              {pinError ? <p style={{ color: COLORS.danger, fontWeight: 900 }}>{pinError}</p> : null}

              <button onClick={handleLogin} style={{ ...primaryButtonStyle(), width: '100%', marginTop: 18, height: 54 }}>
                Entrar com PIN
              </button>

              <div style={{ marginTop: 22, padding: 14, borderRadius: 16, background: COLORS.blueSoft, color: COLORS.muted, fontSize: 13, lineHeight: 1.45 }}>
                Admin: 0000 • Recepção: 9999 • Professores: PIN cadastrado no Supabase
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }


  function renderPanelHeader() {
    return (
      <header style={{ ...cardStyle, padding: 0, overflow: 'hidden', boxShadow: COLORS.shadowStrong }}>
        <div style={{ height: 8, background: COLORS.greenGradient }} />
        <div style={{ padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 13px',
                borderRadius: 999,
                background: COLORS.blueSoft,
                color: COLORS.blue,
                fontWeight: 950,
                fontSize: 12,
                letterSpacing: 0.5,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.green, display: 'inline-block' }} />
              GESTOR CONEXÃO
            </div>

            <h1 style={{ margin: '12px 0 0', color: COLORS.blueDark, fontSize: 34, letterSpacing: -0.8 }}>
              {screen === 'admin'
                ? 'Painel Administrativo'
                : screen === 'reception'
                  ? 'Painel da Recepção'
                  : `Professor: ${currentProfessor?.nome || ''}`}
            </h1>

            {loading ? <p style={{ color: COLORS.muted, marginBottom: 0 }}>Atualizando dados...</p> : null}
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

  function renderDashboard() {
    const cards = [
      ['Alunos ativos', activeAlunos.length, 'base de alunos em operação'],
      ['Experimentais', experimentais.length, 'leads e aulas teste'],
      ['Turmas ativas', activeTurmas.length, 'turmas abertas no CT'],
      ['Recebido', formatMoney(totalRecebido), `Total lançado: ${formatMoney(totalReceber)}`],
    ];

    return (
      <section style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map(([title, value, desc]) => (
          <div key={title} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, borderRadius: '0 0 0 90px', background: 'rgba(126, 217, 87, 0.18)' }} />
            <strong style={{ color: COLORS.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</strong>
            <h2 style={{ color: COLORS.blueDark, fontSize: typeof value === 'number' ? 42 : 28, margin: '18px 0 6px', letterSpacing: -1 }}>
              {value}
            </h2>
            <p style={{ color: COLORS.muted, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </section>
    );
  }


  function renderStudents() {
    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Cadastro de alunos</h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <input style={inputStyle()} placeholder="Nome completo" value={studentForm.nome} onChange={(e) => setStudentForm({ ...studentForm, nome: e.target.value })} />
            <input style={inputStyle()} placeholder="Celular" value={studentForm.telefone} onChange={(e) => setStudentForm({ ...studentForm, telefone: maskPhone(e.target.value) })} />
            <input style={inputStyle()} placeholder="E-mail" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
            <input style={inputStyle()} placeholder="CPF" value={studentForm.cpf} onChange={(e) => setStudentForm({ ...studentForm, cpf: maskCPF(e.target.value) })} />
            <input style={inputStyle()} type="date" value={studentForm.data_nascimento} onChange={(e) => setStudentForm({ ...studentForm, data_nascimento: e.target.value })} />
            <input style={inputStyle()} placeholder="Endereço" value={studentForm.endereco} onChange={(e) => setStudentForm({ ...studentForm, endereco: e.target.value })} />
            <input style={inputStyle()} placeholder="CEP" value={studentForm.cep} onChange={(e) => setStudentForm({ ...studentForm, cep: maskCEP(e.target.value) })} />
            <input style={inputStyle()} type="date" value={studentForm.data_inicio} onChange={(e) => setStudentForm({ ...studentForm, data_inicio: e.target.value })} />

            <select style={inputStyle()} value={studentForm.professor_id} onChange={(e) => setStudentForm({ ...studentForm, professor_id: e.target.value })}>
              <option value="">Professor principal</option>
              {professores.map((prof) => (
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
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12 }}>
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

        <div style={cardStyle}>
          <h2 style={{ color: COLORS.blue, marginTop: 0 }}>Alunos cadastrados</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Telefone</th>
                  <th style={thStyle}>Professor</th>
                  <th style={thStyle}>Plano</th>
                  <th style={thStyle}>Valor</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Cadastro</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td style={tdStyle}>{aluno.nome}</td>
                    <td style={tdStyle}>{aluno.telefone || '-'}</td>
                    <td style={tdStyle}>{getProfessorName(professores, aluno.professor_id)}</td>
                    <td style={tdStyle}>{aluno.tipo_plano === 'personalizado' ? 'Personalizado' : aluno.plano_descricao || '-'}</td>
                    <td style={tdStyle}>{formatMoney(aluno.plano_valor)}</td>
                    <td style={tdStyle}>{aluno.status || 'ativo'}</td>
                    <td style={tdStyle}>{formatDate(aluno.created_at)}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                          }}
                        >
                          Editar
                        </button>
                        <button style={secondaryButtonStyle()} onClick={() => deleteRecord('alunos', aluno.id)}>Excluir</button>
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

            <select style={inputStyle()} value={experimentalForm.modalidade} onChange={(e) => setExperimentalForm({ ...experimentalForm, modalidade: e.target.value })}>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Futevôlei">Futevôlei</option>
            </select>

            <input style={inputStyle()} placeholder="Categoria" value={experimentalForm.categoria} onChange={(e) => setExperimentalForm({ ...experimentalForm, categoria: e.target.value })} />

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
              {professores.map((prof) => (
                <option key={prof.id} value={prof.id}>{prof.nome}</option>
              ))}
            </select>

            <input style={inputStyle()} placeholder="Dia preferido" value={experimentalForm.dia_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_preferido: e.target.value })} />
            <input style={inputStyle()} placeholder="Período preferido" value={experimentalForm.periodo_preferido} onChange={(e) => setExperimentalForm({ ...experimentalForm, periodo_preferido: e.target.value })} />
            <input style={inputStyle()} type="time" title="Horário que pode fazer" value={experimentalForm.horario_pode_fazer} onChange={(e) => setExperimentalForm({ ...experimentalForm, horario_pode_fazer: e.target.value })} />
            <input style={inputStyle()} type="datetime-local" title="Dia e horário da aula experimental" value={experimentalForm.dia_horario_aula_experimental} onChange={(e) => setExperimentalForm({ ...experimentalForm, dia_horario_aula_experimental: e.target.value })} />

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
                              dia_contato: item.dia_contato || new Date().toISOString().slice(0, 10),
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

            <select style={inputStyle()} value={turmaForm.modalidade} onChange={(e) => setTurmaForm({ ...turmaForm, modalidade: e.target.value })}>
              <option value="Beach Tennis">Beach Tennis</option>
              <option value="Futevôlei">Futevôlei</option>
            </select>

            <input style={inputStyle()} placeholder="Categoria" value={turmaForm.categoria} onChange={(e) => setTurmaForm({ ...turmaForm, categoria: e.target.value })} />

            <select style={inputStyle()} value={turmaForm.professor_id} onChange={(e) => setTurmaForm({ ...turmaForm, professor_id: e.target.value })}>
              <option value="">Professor</option>
              {professores.map((prof) => (
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

            <input style={inputStyle()} type="time" title="Horário" value={turmaForm.horario} onChange={(e) => setTurmaForm({ ...turmaForm, horario: e.target.value })} />
            <input style={inputStyle()} placeholder="Quadra" value={turmaForm.quadra} onChange={(e) => setTurmaForm({ ...turmaForm, quadra: e.target.value })} />
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
                  <th style={thStyle}>Cadastro</th>
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
            <select style={inputStyle()} value={financialForm.aluno_id} onChange={(e) => applyStudentToFinancialForm(e.target.value)}>
              <option value="">Aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>

            <select style={inputStyle()} value={financialForm.professor_id} onChange={(e) => setFinancialForm({ ...financialForm, professor_id: e.target.value })}>
              <option value="">Professor</option>
              {professores.map((prof) => (
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
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.mes || '-'}</td>
                    <td style={tdStyle}>{getAlunoName(alunos, item.aluno_id)}</td>
                    <td style={tdStyle}>{getProfessorName(professores, item.professor_id)}</td>
                    <td style={tdStyle}>{formatMoney(item.valor)}</td>
                    <td style={tdStyle}>{item.vencimento || '-'}</td>
                    <td style={tdStyle}>{item.recebido ? 'Recebido' : item.status || 'Pendente'}</td>
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
                              vencimento: item.vencimento || new Date().toISOString().slice(0, 10),
                              mes: item.mes || new Date().toISOString().slice(0, 7),
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
                {alunosDaTurma.map((aluno) => (
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
                      <button style={primaryButtonStyle()} onClick={() => registerPresence(aluno.id, turma.id, true, 'normal')}>
                        Presente
                      </button>

                      <button style={secondaryButtonStyle()} onClick={() => registerPresence(aluno.id, turma.id, false, 'falta')}>
                        Falta
                      </button>

                      <button style={secondaryButtonStyle()} onClick={() => registerPresence(aluno.id, turma.id, true, 'experimental')}>
                        Experimental
                      </button>

                      <button style={secondaryButtonStyle()} onClick={() => registerPresence(aluno.id, turma.id, true, 'avulsa')}>
                        Avulsa
                      </button>

                      <button style={secondaryButtonStyle()} onClick={() => registerPresence(aluno.id, turma.id, true, 'reposicao')}>
                        Reposição
                      </button>
                    </div>
                  </div>
                ))}

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
    const percentual = Number(currentProfessor?.percentual || 0);
    const totalProfessor = rows
      .filter((item) => item.recebido)
      .reduce((sum, item) => sum + Number(item.valor || 0) * percentual, 0);

    return (
      <section style={{ display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <strong style={{ color: COLORS.muted }}>Total do professor no mês/lançamentos recebidos</strong>
          <h2 style={{ color: COLORS.blue, fontSize: 34 }}>{formatMoney(totalProfessor)}</h2>
          <p style={{ color: COLORS.muted, margin: 0 }}>
            Percentual cadastrado: {(percentual * 100).toFixed(0)}%
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
    <main style={pageShellStyle}>
      {renderFeedbackModal()}
      <div style={{ maxWidth: 1420, margin: '0 auto', display: 'grid', gap: 22 }}>
        {renderPanelHeader()}
        {renderTabs()}
        {renderCurrentContent()}
      </div>
    </main>
  );
}
