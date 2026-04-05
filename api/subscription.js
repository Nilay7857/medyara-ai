import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    if (req.method === 'GET') {
      const { domain } = req.query;
      
      if (domain === 'true') {
        const { data: sub, error } = await supabase
          .from('subscriptions')
          .select('tier, domain, domain_status')
          .eq('user_id', user.id)
          .single();

        if (error) return res.status(200).json({ domain: null, status: 'none' });
        
        return res.status(200).json({
          domain: sub.domain,
          status: sub.domain_status || 'none'
        });
      } else {
        const { data: sub, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          const { data: newSub, error: createError } = await supabase
            .from('subscriptions')
            .insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              tier: 'free',
              text_count: 0,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          return res.status(200).json(newSub);
        }

        return res.status(200).json(sub);
      }

    } else if (req.method === 'POST') {
      const { tier } = req.body;
      if (!tier || !['free', 'pro', 'premium'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier' });
      }

      const { data: sub, error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          tier, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({ 
        success: true, 
        subscription: sub,
        message: `Successfully upgraded to ${tier} plan` 
      });

    } else if (req.method === 'PATCH') {
      const { domain } = req.body;
      
      if (domain) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('tier')
          .eq('user_id', user.id)
          .single();

        if (!sub || sub.tier !== 'premium') {
          return res.status(403).json({ error: 'Premium subscription required for custom domain' });
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            domain: domain.toLowerCase(),
            domain_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        return res.status(200).json({ 
          success: true, 
          message: 'Domain setup initiated. DNS propagation may take up to 48 hours.' 
        });
      }

      return res.status(400).json({ error: 'Invalid update request' });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Subscription API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
