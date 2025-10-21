import db from '../config/db.mjs';

export async function buscarAlunoPorEmail(email) {
  const [result] = await db.query('SELECT * FROM aluno WHERE email = ?', [email]);
  return result[0];
}

export async function criarAluno(dados) {
  const { aluno_id, nome, email, senha_hash, data_nascimento, celular, consentimento } = dados;
  await db.query(`
    INSERT INTO aluno (
      aluno_id, nome, email, senha_hash, data_nascimento, celular, status,
      consentimento_termos, consentimento_data, data_cadastro
    ) VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?, NOW(), NOW())
  `, [aluno_id, nome, email, senha_hash, data_nascimento, celular, consentimento]);
}
