import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
      const { stats } = req.query;
      
      if (stats === 'true') {
        const { data: history, error } = await supabase
          .from('history')
          .select('type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const total = history.length;
        const thisMonth = history.filter(item => {
          const itemDate = new Date(item.created_at);
          const now = new Date();
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }).length;

        const typeCount = {};
        history.forEach(item => {
          typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });

        const mostUsed = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

        return res.status(200).json({ total, thisMonth, mostUsed });
      } else {
        const { data: history, error } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        return res.status(200).json(history);
      }

    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing history item ID' });

      const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id)
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('History API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
