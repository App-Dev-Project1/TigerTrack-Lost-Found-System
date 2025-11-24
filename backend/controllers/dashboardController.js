const supabase = require('../config/supabase');

const getSummaryStats = async (req, res) => {
  try {
    // Run counts in parallel for speed
    const [lost, found, solved] = await Promise.all([
      supabase.from('lost_items').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('found_items').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('solved_items').select('id', { count: 'exact', head: true })
    ]);

    const stats = {
      pending: (lost.count || 0) + (found.count || 0),
      resolved: solved.count || 0,
      totalItems: (lost.count || 0) + (found.count || 0) + (solved.count || 0)
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSummaryStats };