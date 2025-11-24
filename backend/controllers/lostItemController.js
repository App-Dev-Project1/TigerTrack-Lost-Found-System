const supabase = require('../config/supabase');

// POST /lost - Create a new report
const createLostItem = async (req, res) => {
  try {
    const formData = req.body;
    
    // Validation
    if (!formData.ownerName || !formData.itemName || !formData.contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Logic
    const finalLocation = (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
        ? `${formData.location}: ${formData.specificLocation}`
        : formData.location;

    const finalCategory = formData.category === 'Others' && formData.specificCategory
        ? `Others: ${formData.specificCategory}`
        : formData.category;

    const { data, error } = await supabase
      .from('lost_items')
      .insert([{
        owner_name: formData.ownerName,
        name: formData.itemName,
        occupation: formData.occupancy,
        category: finalCategory,
        floor: formData.floor,
        location: finalLocation,
        lost_date: formData.date,
        lost_time: formData.time,
        description: formData.description,
        contact_number: formData.contactNumber,
        contact_email: formData.contactEmail,
        status: 'pending'
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Success', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /lost - Get all pending items
const getAllLostItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*')
      .eq('status', 'pending')
      .order('lost_date', { ascending: false });
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /lost/:id - Delete an item
const deleteLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('lost_items').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createLostItem, getAllLostItems, deleteLostItem };