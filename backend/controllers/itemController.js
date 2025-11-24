const supabase = require('../config/supabase');

// --- LOST ITEM LOGIC ---
const submitLostItem = async (req, res) => {
  try {
    const formData = req.body;

    // 1. Validation
    if (!formData.ownerName || !formData.itemName || !formData.contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Logic: Format Location & Category
    const finalLocation = 
      (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
        ? `${formData.location}: ${formData.specificLocation}`
        : formData.location;

    const finalCategory =
      formData.category === 'Others' && formData.specificCategory
        ? `Others: ${formData.specificCategory}`
        : formData.category;

    // 3. Database Insert
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

    res.status(201).json({ message: 'Lost item reported successfully', data });

  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// --- FOUND ITEM LOGIC ---
const submitFoundItem = async (req, res) => {
  try {
    // Expecting nested object { formData, photoUrl }
    const { formData, photoUrl } = req.body; 

    // 1. Validation
    if (!formData.finderName || !formData.itemName || !formData.contactNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Logic: Archive Check (Older than 1 year)
    const itemDate = new Date(formData.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const isOldItem = itemDate <= oneYearAgo;

    // 3. Logic: Format Location & Category
    const finalLocation = 
      (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
        ? `${formData.location}: ${formData.specificLocation}`
        : formData.location;
    
    const finalCategory =
      formData.category === 'Others' && formData.specificCategory
        ? `Others: ${formData.specificCategory}`
        : formData.category;

    let error;

    // 4. Database Insert (Dynamic Table Selection)
    if (isOldItem) {
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

    res.status(201).json({ 
      message: isOldItem ? 'Item archived (older than 1 year)' : 'Found item reported successfully' 
    });

  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: error.message });
  }
  
};

module.exports = { submitLostItem, submitFoundItem };