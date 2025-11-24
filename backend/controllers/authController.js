const supabase = require('../config/supabase');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.status(200).json({ message: 'Login successful', session: data.session });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginAdmin, logoutAdmin };