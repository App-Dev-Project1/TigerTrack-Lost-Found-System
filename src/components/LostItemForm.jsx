// src/components/LostItemForm.jsx
import React, { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import tigerLogo from '../assets/tiger.png';
import './LostItemForm.css';
import { supabase } from '../supabaseClient'; 

const LostItemForm = () => {
  const navigate = useNavigate();
  
  // Get current date in Philippine timezone
  const getPhilippineDate = () => {
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const year = phTime.getFullYear();
    const month = String(phTime.getMonth() + 1).padStart(2, '0');
    const day = String(phTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);

  const handleFormattedContact = (e) => {
    let input = e.target.value;
    let digits = input.replace(/\D/g, "");

    if (digits.length === 0) {
      setFormData({ ...formData, contactNumber: "" });
      return;
    }

    digits = digits.substring(0, 11);
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

  // Generate room numbers based on selected floor
  const getRoomNumbers = (floor) => {
    if (!floor) return [];
    const floorNumber = floor.replace(/\D/g, ''); // Extract number from "17th Floor"
    const rooms = [];
    for (let i = 1; i <= 15; i++) {
      const roomNum = i < 10 ? `0${i}` : `${i}`;
      rooms.push(`${floorNumber}${roomNum}`);
    }
    return rooms;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset specificLocation when floor changes
    if (name === 'floor') {
      setFormData(prevState => ({ 
        ...prevState, 
        [name]: value,
        specificLocation: '' // Clear room selection when floor changes
      }));
    } else if (name === 'location') {
      // Clear specificLocation when location type changes
      setFormData(prevState => ({ 
        ...prevState, 
        [name]: value,
        specificLocation: ''
      }));
    } else {
      setFormData(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.ownerName || !formData.itemName || !formData.category || !formData.occupancy ||
      !formData.floor || !formData.location || !formData.date ||
      !formData.time || !formData.contactNumber || !formData.contactEmail) {
      showError('Please fill in all required fields');
      return;
    }

    if ((formData.location === 'Room' || formData.location === 'Others') && !formData.specificLocation) {
      showError('Please specify the exact location.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLocation = 
        (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
          ? `${formData.location}: ${formData.specificLocation}`
          : formData.location;

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

      setIsSubmitting(false);
      setShowSuccessModal(true);

      // Reset form
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

    } catch (error) {
      console.error('Error submitting lost item report:', error);
      setIsSubmitting(false);
      showError('Error submitting report: ' + error.message);
    }
  };

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
                  {formData.location === 'Room' ? (
                    <div className="custom-dropdown-wrapper">
                      <div 
                        className={`custom-dropdown-select ${!formData.floor ? 'disabled' : ''} ${isRoomDropdownOpen ? 'open' : ''}`}
                        onClick={() => formData.floor && setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                      >
                        <span className={formData.specificLocation ? '' : 'placeholder'}>
                          {formData.specificLocation || (formData.floor ? '' : '')}
                        </span>
                        <svg 
                          className="dropdown-arrow" 
                          width="12" 
                          height="8" 
                          viewBox="0 0 12 8" 
                          fill="none"
                        >
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {isRoomDropdownOpen && formData.floor && (
                        <>
                          <div 
                            className="custom-dropdown-overlay" 
                            onClick={() => setIsRoomDropdownOpen(false)}
                          />
                          <div className="custom-dropdown-menu">
                            {getRoomNumbers(formData.floor).map((room, idx) => (
                              <div
                                key={idx}
                                className={`custom-dropdown-option ${formData.specificLocation === room ? 'selected' : ''}`}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, specificLocation: room }));
                                  setIsRoomDropdownOpen(false);
                                }}
                              >
                                {room}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <Form.Control
                      type="text"
                      name="specificLocation"
                      placeholder="Enter detailed location"
                      value={formData.specificLocation || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, specificLocation: e.target.value }))
                      }
                      required
                    />
                  )}
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>When did you lose it?</Form.Label>
                <Form.Control 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  max={getPhilippineDate()}
                  required 
                />
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

            <Button 
              type="submit" 
              className="lost-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </Form>
        </div>

      </div>

      {/* Success Modal */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)}
        centered
        backdrop="static"
        className="custom-modal success-modal"
      >
        <Modal.Body className="modern-modal-body">
          <div className="modal-icon-wrapper success-icon-wrapper">
            <div className="success-checkmark">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
          <h3 className="modal-title">Success!</h3>
          <p className="modal-message">
            Your lost item report has been submitted successfully. We'll notify you as soon as someone finds your item!
          </p>
          <Button 
            className="modal-button success-button"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/');
            }}
          >
            Return to Home
          </Button>
        </Modal.Body>
      </Modal>

      {/* Error Modal */}
      <Modal 
        show={showErrorModal} 
        onHide={() => setShowErrorModal(false)}
        centered
        className="custom-modal error-modal"
      >
        <Modal.Body className="modern-modal-body">
          <div className="modal-icon-wrapper error-icon-wrapper">
            <div className="error-x">
              <svg className="error-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="error-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="error-line error-line1" fill="none" d="M16 16 L36 36"/>
                <path className="error-line error-line2" fill="none" d="M36 16 L16 36"/>
              </svg>
            </div>
          </div>
          <h3 className="modal-title">Oops!</h3>
          <p className="modal-message">{errorMessage}</p>
          <Button 
            className="modal-button error-button"
            onClick={() => setShowErrorModal(false)}
          >
            Try Again
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LostItemForm;