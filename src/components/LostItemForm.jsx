// src/components/LostItemForm.jsx
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png';
import './LostItemForm.css';
import { supabase } from '../supabaseClient'; 

const LostItemForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    ownerName: '',
    occupancy: '',
    itemName: '',
    category: '',
    floor: '',
    location: '',
    specificLocation: '',
    date: '',
    time: '',
    contactNumber: '',
    contactEmail: '',
    description: '',
  });

  const handleFormattedContact = (e) => {
  let input = e.target.value;

  // Remove all non-digits first
  let digits = input.replace(/\D/g, "");

  // Allow deleting everything
  if (digits.length === 0) {
    setFormData({ ...formData, contactNumber: "" });
    return;
  }

  // Limit to 11 digits max
  digits = digits.substring(0, 11);

  // Build format 09XX-XXX-XXXX
  let formatted = "";

  if (digits.length <= 4) {
    formatted = digits; 
  } else if (digits.length <= 7) {
    formatted = digits.substring(0, 4) + "-" + digits.substring(4);
  } else {
    formatted =
      digits.substring(0, 4) +
      "-" +
      digits.substring(4, 7) +
      "-" +
      digits.substring(7, 11);
  }

  setFormData({
    ...formData,
    contactNumber: formatted,
  });
};


  const categories = [
    'Electronics', 'Bags & Backpacks', 'Books & Notebooks',
    'Clothing & Accessories', 'ID Cards & Documents', 'Keys',
    'Water Bottles & Containers', 'Umbrellas'
  ];

  const occupancies = ['Student', 'Faculty', 'Staff'];
  const floors = ['17th Floor', '18th Floor', '19th Floor', '20th Floor'];
  const locations = ['Room', 'Hallway', 'Bathroom', 'Fire Exit', 'Lobby', 'Others'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // --- UPDATED handleSubmit FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- All your existing validation (this is good!) ---
    if (!formData.ownerName || !formData.itemName || !formData.category || !formData.occupancy ||
      !formData.floor || !formData.location || !formData.date ||
      !formData.time || !formData.contactNumber || !formData.contactEmail) {
      alert('Please fill in all required fields');
      return;
    }

    if ((formData.location === 'Room' || formData.location === 'Others') && !formData.specificLocation) {
      alert('Please specify the exact location.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }


    // --- 3. START SUPABASE LOGIC (FIXED) ---
    try {
      // --- FIXED LOCATION ---
      const finalLocation = 
        (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
          ? `${formData.location}: ${formData.specificLocation}`
          : formData.location;

      // --- NEW: CUSTOM CATEGORY HANDLING ---
      const finalCategory =
        formData.category === 'Others' && formData.specificCategory
          ? `Others: ${formData.specificCategory}`
          : formData.category;

      const { data, error } = await supabase
        .from('lost_items')
        .insert([
          {
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
          }
        ]);
        
      if (error) throw error; 

      alert('Your lost item report has been submitted successfully!');

      setFormData({
        ownerName: '',
        occupancy: '',
        itemName: '',
        category: '',
        floor: '',
        location: '',
        specificLocation: '',
        date: '',
        time: '',
        contactNumber: '',
        contactEmail: '',
        description: '',
      });

      navigate('/'); 

    } catch (error) {
      console.error('Error submitting lost item report:', error);
      alert('Error submitting report: ' + error.message);
    }
  };
  // --- END OF UPDATED FUNCTION ---


  return (
    <div className="lost-form-page">
      <div className="lost-form-container">
        <div className="lost-form-header">
          <img src={tigerLogo} alt="TigerTrack Logo" />
          <h1>TigerTrack</h1>
          <p>UST-CICS Lost and Found System</p>
        </div>

        <div className="lost-form-body">
          <Button className="lost-back-button" onClick={() => navigate('/')}>
            ← Back
          </Button>

          <h5 className="lost-form-section-title">Report a Lost Item</h5>
          <p className="lost-form-subtext">Fill out the form below to report your lost item.</p>

          <Form onSubmit={handleSubmit}>
            <div className="form-grid">

              <Form.Group className="mb-3">
                <Form.Label>Name of the Owner</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Enter full name"
                  name="ownerName" 
                  value={formData.ownerName} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your occupation?</Form.Label>
                <Form.Select name="occupancy" value={formData.occupancy} onChange={handleChange} required>
                  <option value="">Select your occupation</option>
                  {occupancies.map((o, i) => <option key={i}>{o}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What item did you lose?</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Enter item name"
                  name="itemName" 
                  value={formData.itemName} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Category of your Item</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                    <option value="Others">Others</option>
                  </Form.Select>
                </Form.Group>

                {formData.category === 'Others' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Please specify the other category</Form.Label>
                    <Form.Control
                      type="text"
                      name="specificCategory"
                      placeholder="Enter the category"
                      value={formData.specificCategory || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, specificCategory: e.target.value }))
                      }
                      required
                    />
                  </Form.Group>
                )}

              <Form.Group className="mb-3">
                <Form.Label>What floor did you lose the item?</Form.Label>
                <Form.Select name="floor" value={formData.floor} onChange={handleChange} required>
                  <option value="">Select a floor</option>
                  {floors.map((f, i) => <option key={i}>{f}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Where did you lose your item?</Form.Label>
                <Form.Select name="location" value={formData.location} onChange={handleChange} required>
                  <option value="">Select a location</option>
                  {locations.map((l, i) => <option key={i}>{l}</option>)}
                </Form.Select>
              </Form.Group>

               {(formData.location === 'Room' || formData.location === 'Others') && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.location === 'Room' ? 'Please specify the room' : 'Please specify the others'}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="specificLocation"
                      placeholder={formData.location === 'Room' ? 'Enter room number (e.g., Room 1902)' : 'Enter detailed location'}
                      value={formData.specificLocation || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, specificLocation: e.target.value }))
                      }
                      required
                    />
                </Form.Group>
               )}

              <Form.Group className="mb-3">
                <Form.Label>When did you lose it?</Form.Label>
                <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What time did you lose it?</Form.Label>
                <Form.Control type="time" name="time" value={formData.time} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact email?</Form.Label>
                <Form.Control 
                  type="email"
                  placeholder="Enter valid email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What is your contact number?</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="09XX-XXX-XXXX"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormattedContact}
                  maxLength={13}
                  pattern="^09\d{2}-\d{3}-\d{4}$"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid Philippine mobile number.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 form-full-width">
                <Form.Label>Describe your item (Optional)</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  placeholder="Describe the item (color, shape, size, brand, unique marks, etc.)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

            </div>

            <Button type="submit" className="lost-submit-button">
              Submit Report
            </Button>
          </Form>
        </div>

      </div>
    </div>
  );
};

export default LostItemForm;