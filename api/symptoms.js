import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
      const { data: symptoms, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return res.status(200).json(symptoms);

    } else if (req.method === 'POST') {
      const { date, symptoms: symptomList, severity, notes, triggers } = req.body;
      
      const { data, error } = await supabase
        .from('symptoms')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          date,
          symptoms: symptomList,
          severity,
          notes,
          triggers: triggers || [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);

    } else if (req.method === 'PUT') {
      const { id, date, symptoms: symptomList, severity, notes, triggers } = req.body;
      
      const { data, error } = await supabase
        .from('symptoms')
        .update({
          date,
          symptoms: symptomList,
          severity,
          notes,
          triggers: triggers || [],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);

    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Symptoms API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
