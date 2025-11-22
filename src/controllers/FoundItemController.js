import { supabase } from '../supabaseClient';

// Helper: Convert Data URL to File
const dataUrlToFile = async (dataUrl, fileName) => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type });
};

// Helper: Check if older than 1 year
const shouldArchiveItem = (itemDate) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return new Date(itemDate) <= oneYearAgo;
};

export const submitFoundItemReport = async (formData, photoPreview) => {
  // 1. Validation
  if (
    !formData.finderName || !formData.itemName || !formData.category || 
    !formData.occupancy || !formData.floor || !formData.location || 
    !formData.date || !formData.time || !formData.contactNumber || !formData.contactEmail
  ) {
    throw new Error('Please fill in all required fields');
  }
  
  if ((formData.location === 'Room' || formData.location === 'Others') && !formData.specificLocation) {
    throw new Error('Please specify the exact location.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.contactEmail)) {
    throw new Error('Please enter a valid email address');
  }

  // 2. Upload Photo (if exists)
  let itemPhotoUrl = null;
  if (photoPreview) {
    try {
      const file = await dataUrlToFile(photoPreview, `item_photo_${Date.now()}.png`);
      const filePath = `public/${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-photos') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(uploadData.path);

      itemPhotoUrl = urlData.publicUrl;
    } catch (error) {
      throw new Error('Error uploading photo: ' + error.message);
    }
  }

  // 3. Prepare Data
  const finalLocation = 
    (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
      ? `${formData.location}: ${formData.specificLocation}`
      : formData.location;
  
  const finalCategory =
    formData.category === 'Others' && formData.specificCategory
      ? `Others: ${formData.specificCategory}`
      : formData.category;

  const isOldItem = shouldArchiveItem(formData.date);
  let successMessage = '';

  // 4. Database Insert
  if (isOldItem) {
    const { error } = await supabase
      .from('archives')
      .insert([{
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
        photo_url: itemPhotoUrl,
        archive_reason: 'expired',
        original_table: 'found_items',
        status: 'archived'
      }]);
      
    if (error) throw error;
    successMessage = 'Item submitted and archived (older than 1 year). It will appear in the Archive tab.';
  } else {
    const { error } = await supabase
      .from('found_items')
      .insert([{
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
        photo_url: itemPhotoUrl,
        status: 'pending'
      }]);
      
    if (error) throw error;
    successMessage = 'Item submitted successfully! It will appear in the Items tab.';
  }

  return { success: true, message: successMessage };
};