const supabase = require('../config/supabase');

// POST /found - Submit found item
const createFoundItem = async (req, res) => {
  try {
    const { formData, photoUrl } = req.body; 

    if (!formData.finderName || !formData.itemName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check Date Logic
    const itemDate = new Date(formData.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const isOldItem = itemDate <= oneYearAgo;

    const finalLocation = (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
        ? `${formData.location}: ${formData.specificLocation}`
        : formData.location;
    
    const finalCategory = formData.category === 'Others' && formData.specificCategory
        ? `Others: ${formData.specificCategory}`
        : formData.category;

    let error;

    if (isOldItem) {
      // Auto-Archive
      const result = await supabase.from('archives').insert([{
        name: formData.itemName,
        category: finalCategory,
        floor: formData.floor,
        location: finalLocation,
        item_date: formData.date,
        item_time: formData.time,
        description: formData.description,
        contact_number: formData.contactNumber,
        contact_email: formData.contactEmail,
        person_name: formData.finderName,
        occupation: formData.occupancy,
        photo_url: photoUrl,
        archive_reason: 'expired',
        original_table: 'found_items',
        status: 'archived'
      }]);
      error = result.error;
    } else {
      // Normal Insert
      const result = await supabase.from('found_items').insert([{
        finder_name: formData.finderName, 
        name: formData.itemName,
        occupation: formData.occupancy,
        category: finalCategory, 
        floor: formData.floor,
        location: finalLocation,
        found_date: formData.date,
        found_time: formData.time,
        description: formData.description,
        contact_number: formData.contactNumber,
        contact_email: formData.contactEmail,
        photo_url: photoUrl,
        status: 'pending'
      }]);
      error = result.error;
    }

    if (error) throw error;
    res.status(201).json({ message: isOldItem ? 'Item archived' : 'Reported successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /found
const getAllFoundItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('found_items')
      .select('*')
      .eq('status', 'pending')
      .order('found_date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /found/:id
const deleteFoundItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('found_items').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createFoundItem, getAllFoundItems, deleteFoundItem };