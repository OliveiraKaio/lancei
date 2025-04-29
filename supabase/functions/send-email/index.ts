import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, subject, body } = await req.json();

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOSTNAME'),
        port: Number(Deno.env.get('SMTP_PORT')),
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USERNAME'),
          password: Deno.env.get('SMTP_PASSWORD'),
        },
      },
    });

    await client.send({
      from: Deno.env.get('SMTP_FROM'),
      to: email,
      subject: subject,
      html: body,
    });

    await client.close();

    return new Response(JSON.stringify({ message: 'E-mail enviado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 