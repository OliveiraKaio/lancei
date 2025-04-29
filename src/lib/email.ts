import { supabase } from './supabase-browser-client';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

export const getAprovacaoEmailTemplate = (nome: string, email: string, senha: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1F2937;">Olá ${nome},</h2>
    
    <p style="color: #4B5563; line-height: 1.5;">
      Sua solicitação de acesso ao Lancei foi aprovada! Estamos muito felizes em tê-lo(a) conosco.
    </p>

    <p style="color: #4B5563; line-height: 1.5;">
      Para acessar sua conta, utilize as seguintes credenciais:
    </p>

    <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0; color: #1F2937;">
        <strong>E-mail:</strong> ${email}<br>
        <strong>Senha temporária:</strong> ${senha}
      </p>
    </div>

    <p style="color: #4B5563; line-height: 1.5;">
      Por questões de segurança, recomendamos que você altere sua senha após o primeiro acesso.
    </p>

    <a href="https://lancei.com.br/auth/login" 
       style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 6px; margin: 16px 0;">
      Acessar minha conta
    </a>

    <p style="color: #4B5563; line-height: 1.5;">
      Se tiver alguma dúvida, não hesite em entrar em contato conosco.
    </p>

    <p style="color: #4B5563; line-height: 1.5;">
      Atenciosamente,<br>
      Equipe Lancei
    </p>
  </div>
`;

export const getRejeicaoEmailTemplate = (nome: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1F2937;">Olá ${nome},</h2>
    
    <p style="color: #4B5563; line-height: 1.5;">
      Agradecemos seu interesse em utilizar o Lancei. Após análise, infelizmente não pudemos aprovar sua solicitação de acesso no momento.
    </p>

    <p style="color: #4B5563; line-height: 1.5;">
      Se desejar, você pode entrar em contato conosco para entender melhor os critérios de aprovação e submeter uma nova solicitação no futuro.
    </p>

    <p style="color: #4B5563; line-height: 1.5;">
      Agradecemos sua compreensão.
    </p>

    <p style="color: #4B5563; line-height: 1.5;">
      Atenciosamente,<br>
      Equipe Lancei
    </p>
  </div>
`; 